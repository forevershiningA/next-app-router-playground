import type { StateCreator } from 'zustand';
import { data } from '#/app/_internal/_data';
import { normalizeThreeColorValue } from '#/lib/headstone-store/color-utils';
import { normalizeCatalogData } from '#/lib/headstone-store/catalog-normalization';
import { clampEditingObject } from '#/lib/headstone-store/editing-object';
import { deriveProductSelectionConfig } from '#/lib/headstone-store/product-selection-config';
import { loadProductMaterialOptions } from '#/lib/headstone-store/product-material-options';
import { deriveProductDimensions } from '#/lib/headstone-store/product-dimensions';
import { fetchAndParseMotifPricing } from '#/lib/motif-pricing';
import {
  parseCatalogXML,
  fetchAndParseInscriptionDetails,
} from '#/lib/xml-parser';
import { logger } from '#/lib/logger';
import {
  MAX_INSCRIPTION_SIZE_MM,
  MIN_INSCRIPTION_SIZE_MM,
  MIN_MOTIF_HEIGHT_MM,
  normalizeTextureUrl,
  type HeadstoneState,
} from '#/lib/headstone-store.types';

const LASER_ETCHED_BLACK_GRANITE_TEXTURE =
  '/textures/forever/l/Glory-Black-2.webp';

type ProductSelectionSlice = Pick<HeadstoneState, 'productId' | 'setProductId'>;

export const createProductSelectionSlice: StateCreator<
  HeadstoneState,
  [],
  [],
  ProductSelectionSlice
> = (set, get) => ({
  productId: null,
  setProductId: async (id) => {
    const prevSnapshot = get();
    const prevHeadstoneHeight = Math.max(prevSnapshot.heightMm || 0, 1);
    const prevBaseHeight = Math.max(
      prevSnapshot.baseHeightMm || prevSnapshot.heightMm || 0,
      1,
    );

    // Immediately capture the user's selection so downstream effects know a
    // product has been chosen even while the catalog XML is loading.
    // CRITICAL: Clear the old catalog to prevent showing stale data
    set({ productId: id, catalog: null, fixingType: 'flat-back' });

    try {
      const response = await fetch(`/xml/catalog-id-${id}.xml`);
      const xmlText = await response.text();
      const catalog = normalizeCatalogData(await parseCatalogXML(xmlText, id));

      if (get().productId !== id) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[Store] Ignoring stale catalog response for product',
            id,
          );
        }
        return;
      }

      set({ catalog, productId: id });

      if (process.env.NODE_ENV !== 'production') {
        logger.log('[Store] Catalog set for product', id, ':', {
          catalogName: catalog.product.name,
          catalogId: catalog.product.id,
          catalogType: catalog.product.type,
        });
      }

      const {
        isPlaque,
        showBase,
        isFullMonument,
        showInscriptionColor,
        productDefaultColor,
        shouldForceSquarePlaque,
        supportsBorder,
        isFullColourPlaque,
        isBronzePlaqueProduct,
        isUrnProduct,
      } = deriveProductSelectionConfig(catalog, prevSnapshot);
      // The Traditional Engraved shape outline is the same finish family as
      // inscriptions, so start it from the product colour configured in XML.
      if (catalog.product.id === '124') {
        set({
          insetContourColor: normalizeThreeColorValue(productDefaultColor),
        });
      }
      set((s) => {
        const visibility = {
          showBase,
          showLedger: isFullMonument,
          showKerbset: isFullMonument,
        };
        const nextEditingObject = clampEditingObject(
          s.editingObject,
          visibility,
        );
        const patch: Partial<HeadstoneState> = {
          ...visibility,
          showInscriptionColor,
        };
        if (nextEditingObject !== s.editingObject) {
          patch.editingObject = nextEditingObject;
        }
        return patch;
      });
      const hasBase = showBase;
      const currentBorderName = get().borderName;
      // Set product-specific border options in the store
      const borderSet = isFullColourPlaque
        ? data.fullColourPlaqueBorders
        : data.borders;
      if (supportsBorder) {
        set({ borders: borderSet });
        if (
          !currentBorderName ||
          currentBorderName.toLowerCase().includes('no border')
        ) {
          const defaultBorder = borderSet.find((border) => border.id !== '0');
          if (defaultBorder) {
            set({ borderName: defaultBorder.name });
          }
        }
      } else {
        set({ borders: [] });
        if (currentBorderName) {
          set({ borderName: null });
        }
      }

      // Reset inset contour when switching to plaque
      if (isPlaque && get().showInsetContour) {
        set({ showInsetContour: false });
      }

      // Set default shape URL synchronously BEFORE any async operations,
      // so user shape selections made while backgrounds are loading are not overwritten.
      if (isPlaque) {
        set({ shapeUrl: '/shapes/headstones/square.svg' });
      }
      if (isUrnProduct && catalog.product.shapes.length > 0) {
        // Only set the default if the user hasn't already selected a urn shape.
        const currentShapeUrl = get().shapeUrl;
        if (!currentShapeUrl?.startsWith('/shapes/urns/')) {
          const firstShape = catalog.product.shapes[0];
          const code = firstShape.code ?? firstShape.name;
          set({ shapeUrl: `/shapes/urns/${code.toLowerCase()}.svg` });
        }
      }

      const { materials, fixedSizes } = await loadProductMaterialOptions({
        isFullColourPlaque,
        isUrnProduct,
        isBronzePlaqueProduct,
      });
      set({ fixedSizes });
      set({ materials });
      if (!showInscriptionColor) {
        set((s) => ({
          inscriptions: s.inscriptions.map((line) => ({
            ...line,
            color: productDefaultColor,
          })),
        }));
      }

      const inscriptionAddition = catalog.product.additions.find(
        (add) => add.type === 'inscription',
      );
      const minHeight =
        inscriptionAddition?.minHeight ?? MIN_INSCRIPTION_SIZE_MM;
      const maxHeight =
        inscriptionAddition?.maxHeight ?? MAX_INSCRIPTION_SIZE_MM;
      const initHeight = inscriptionAddition?.initHeight ?? minHeight;
      set({
        inscriptionMinHeight: minHeight,
        inscriptionMaxHeight: maxHeight,
        inscriptionInitHeight: initHeight,
      });
      if (inscriptionAddition) {
        set((s) => ({
          inscriptions: s.inscriptions.map((line) => ({
            ...line,
            sizeMm: initHeight,
          })),
        }));
      }
      if (inscriptionAddition) {
        const inscriptionDetails = await fetchAndParseInscriptionDetails(
          inscriptionAddition.id,
        );
        if (inscriptionDetails) {
          set({ inscriptionPriceModel: inscriptionDetails.priceModel });
        }
      }

      if (catalog.product.shapes.length > 0) {
        const shape = catalog.product.shapes[0];
        const currentState = get();

        const dimensions = deriveProductDimensions(shape, currentState, {
          forceSquarePlaque: shouldForceSquarePlaque,
          hasBase,
          previousHeadstoneHeight: prevHeadstoneHeight,
          previousBaseHeight: prevBaseHeight,
        });
        const {
          targetHeight,
          effectiveStandHeight,
          headstoneScaleFactor,
          baseScaleFactor,
        } = dimensions;
        set(dimensions.patch);

        if (isFullMonument) {
          set({
            ledgerWidthMm: shape.lid?.initWidth || 950,
            ledgerHeightMm: shape.lid?.initHeight || 60,
            ledgerDepthMm: shape.lid?.initDepth || 2030,
            kerbWidthMm: shape.kerb?.initWidth || 1200,
            kerbHeightMm: shape.kerb?.initHeight || 300,
            kerbDepthMm: shape.kerb?.initDepth || 2150,
          });
        }

        const usesStandardLaserEtchedBlackGranite = id === '8' || id === '9';
        if (isUrnProduct) {
          // Urns always default to white inlay (color #34 = white)
          set({ headstoneMaterialUrl: '/jpg/backgrounds/colors/l/34.jpg' });
        } else if (usesStandardLaserEtchedBlackGranite) {
          set({ headstoneMaterialUrl: LASER_ETCHED_BLACK_GRANITE_TEXTURE });
        } else if (shape.table.color) {
          const texturePath = normalizeTextureUrl(shape.table.color);
          if (texturePath) set({ headstoneMaterialUrl: texturePath });
        }
        if (shape.stand?.color || usesStandardLaserEtchedBlackGranite) {
          const baseTexturePath = usesStandardLaserEtchedBlackGranite
            ? LASER_ETCHED_BLACK_GRANITE_TEXTURE
            : normalizeTextureUrl(shape.stand?.color);
          if (baseTexturePath) {
            set({
              baseMaterialUrl: baseTexturePath,
              ledgerMaterialUrl: baseTexturePath,
              kerbsetMaterialUrl: baseTexturePath,
            });
          }
        }

        const headstoneHeightLimit = Math.max(10, targetHeight);
        const baseHeightLimit = hasBase
          ? Math.max(
              10,
              effectiveStandHeight > 0 ? effectiveStandHeight : targetHeight,
            )
          : headstoneHeightLimit;

        const existingState = get();
        if (
          existingState.inscriptions.length > 0 ||
          existingState.selectedMotifs.length > 0 ||
          Object.keys(existingState.motifOffsets).length > 0
        ) {
          set((s) => {
            const motifEntries = Object.entries(s.motifOffsets);
            const minFontSize = Math.max(
              MIN_INSCRIPTION_SIZE_MM,
              s.inscriptionMinHeight || MIN_INSCRIPTION_SIZE_MM,
            );
            const maxFontSize = Math.max(
              minFontSize,
              s.inscriptionMaxHeight || MAX_INSCRIPTION_SIZE_MM,
            );
            const updatedMotifOffsets =
              motifEntries.length > 0
                ? (Object.fromEntries(
                    motifEntries.map(([key, offset]) => {
                      const originalTarget = offset.target ?? 'headstone';
                      const normalizedTarget =
                        !hasBase && originalTarget === 'base'
                          ? 'headstone'
                          : originalTarget;
                      const limit =
                        normalizedTarget === 'base'
                          ? baseHeightLimit
                          : headstoneHeightLimit;
                      const baseScale =
                        normalizedTarget === 'base'
                          ? baseScaleFactor
                          : headstoneScaleFactor;
                      const originalHeight = offset.heightMm ?? limit;
                      const minHeightRatio =
                        originalHeight > 0
                          ? Math.min(1, MIN_MOTIF_HEIGHT_MM / originalHeight)
                          : 1;
                      const effectiveScale = Math.min(
                        1,
                        Math.max(baseScale, minHeightRatio),
                      );
                      const scaledHeight = Math.round(
                        originalHeight * effectiveScale,
                      );
                      const boundedHeight = Math.max(
                        MIN_MOTIF_HEIGHT_MM,
                        Math.min(limit, scaledHeight),
                      );
                      return [
                        key,
                        {
                          ...offset,
                          target: normalizedTarget,
                          heightMm: boundedHeight,
                          yPos: offset.yPos ?? 0,
                        },
                      ];
                    }),
                  ) as typeof s.motifOffsets)
                : s.motifOffsets;

            const scaledLines = s.inscriptions.map((line) => {
              const originalTarget =
                line.target === 'base' ? 'base' : 'headstone';
              const normalizedTarget =
                !hasBase && originalTarget === 'base'
                  ? 'headstone'
                  : originalTarget;
              const baseScale =
                normalizedTarget === 'base'
                  ? baseScaleFactor
                  : headstoneScaleFactor;
              const minScaleRatio =
                line.sizeMm > 0 ? Math.min(1, minFontSize / line.sizeMm) : 1;
              const effectiveScale = Math.min(
                1,
                Math.max(baseScale, minScaleRatio),
              );
              const scaledSize = Math.round(line.sizeMm * effectiveScale);
              const boundedSize = Math.max(
                minFontSize,
                Math.min(maxFontSize, scaledSize),
              );
              return {
                ...line,
                target: normalizedTarget,
                color: productDefaultColor,
                sizeMm: boundedSize,
                yPos: line.yPos,
              };
            });

            const entries = Object.entries(updatedMotifOffsets);
            const scaledOffsets =
              entries.length > 0
                ? (Object.fromEntries(
                    entries.map(([key, offset]) => {
                      const normalizedTarget =
                        !hasBase && offset.target === 'base'
                          ? 'headstone'
                          : (offset.target ?? 'headstone');
                      return [
                        key,
                        {
                          ...offset,
                          target: normalizedTarget,
                          yPos: offset.yPos ?? 0,
                        },
                      ];
                    }),
                  ) as typeof s.motifOffsets)
                : updatedMotifOffsets;

            return {
              inscriptions: scaledLines,
              selectedMotifs: s.selectedMotifs.map((motif) => ({
                ...motif,
                color: productDefaultColor,
              })),
              motifOffsets: scaledOffsets,
            } as Partial<HeadstoneState>;
          });
          setTimeout(() => get().calculateMotifCost(), 0);
        }
      }

      // Load motif pricing based on product type
      const isBronze = catalog.product.id === '5';
      const isLaser = catalog.product.laser === '1';
      const motifAddition = catalog.product.additions.find(
        (a) => a.type === 'motif',
      );
      const isEnamel = motifAddition?.formula?.toLowerCase() === 'enamel';
      const motifType = isBronze
        ? 'bronze'
        : isEnamel
          ? 'enamel'
          : isLaser
            ? 'laser'
            : 'engraved';
      set({ motifInitHeight: 100 });

      const motifPricing = await fetchAndParseMotifPricing(motifType);
      if (motifPricing) {
        set({
          motifPriceModel: motifPricing,
          motifInitHeight: motifPricing.initHeight,
        });
      }
    } catch (error) {
      console.error('Failed to load or parse catalog XML:', error);
    }
  },
});
