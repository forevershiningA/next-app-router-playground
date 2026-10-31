'use client';

import { useHeadstoneStore } from './headstone-store';
import { captureDesignSnapshot } from './project-serializer';
import { calculateEstimatedDesignPricing } from './estimated-design-pricing';
import { DEFAULT_TEX, TEX_BASE, type Line } from './headstone-store.types';
import {
  prepareDesignerPreview,
  saveDesignerProject,
} from './save-designer-project';
import { data } from '#/app/_internal/_data';
import { getDesignerProductStepHref } from './designer-product-routes';
import { isStainlessHeadstoneProduct } from './stencil-fonts';
import { resolveMaterialAssetPath } from './material-utils';
import { preloadSceneTexture } from './preload-texture';
import { selectCatalogShape } from './select-catalog-shape';
import { normalizeAdditionBaseId } from './addition-utils';
import { EMBLEM_SIZES, loadEmblems } from '#/app/_internal/_emblems-loader';
import {
  getFlexibleImageBounds,
  getImageSizeOptions,
} from './image-size-config';
import {
  getMaskAspectRatio,
  getMaskUrl,
  MASK_OPTIONS,
  type MaskShape,
} from './image-mask';
import { fetchMaskMetrics } from './mask-metrics';
import type { CatalogData } from './xml-parser';

const CONFIGURABLE_PRODUCTS = new Set([
  '1',
  '23',
  '4',
  '5',
  '8',
  '9',
  '22',
  '34',
  '32',
  '52',
  '100',
  '101',
  '103',
  '124',
  '135',
  '2350',
]);

function getImageTypeOptions(catalog: CatalogData | null) {
  return (catalog?.product.additions ?? [])
    .filter((addition) => addition.type === 'image')
    .map((addition) => {
      const id = Number(addition.id);
      const sizes = getImageSizeOptions(id);
      return {
        id,
        name: addition.name,
        fixedSizes: sizes.map(({ width, height, label }, index) => ({
          variant: index + 1,
          widthMm: width,
          heightMm: height,
          label,
        })),
        flexibleBounds: getFlexibleImageBounds(id),
      };
    })
    .filter((addition) => Number.isInteger(addition.id) && addition.id > 0);
}

function productConfiguration() {
  const state = useHeadstoneStore.getState();
  if (!state.productId || !CONFIGURABLE_PRODUCTS.has(state.productId))
    return null;
  if (
    state.productConfigurationReadyId !== state.productId ||
    !state.catalog ||
    state.catalog.product.id !== state.productId
  )
    return null;
  const plaqueShapes = new Set([
    'landscape.svg',
    'portrait.svg',
    'oval_horizontal.svg',
    'oval_vertical.svg',
    'circle.svg',
  ]);
  const seen = new Set<string>();
  const isPlaque = state.catalog.product.type === 'plaque';
  const stainlessHeadstone = isStainlessHeadstoneProduct(
    state.productId,
    state.catalog,
  );
  const traditionalOnly =
    ['8', '22'].includes(state.productId) || stainlessHeadstone;
  const catalogueShapes =
    state.productId === '135' || state.productId === '2350';
  const shapes: Array<{
    id: string;
    name: string;
    category: string;
    url: string;
    initialSize?: { widthMm: number; heightMm: number };
  }> = catalogueShapes
    ? state.catalog.product.shapes
        .filter(
          (shape) => state.productId !== '135' || shape.code !== 'Portrait',
        )
        .map((shape) => {
          const filename = shape.url?.split('/').pop() ?? '';
          const petUrl =
            shape.code === 'Bowl-Cat' || filename === 'pet_bowl_cat.jpg'
              ? '/shapes/headstones/pet_bowl_outline.svg?petRock=cat'
              : shape.code === 'Bowl' || filename === 'bowl.jpg'
                ? '/shapes/headstones/pet_bowl_outline.svg?petRock=dog'
                : filename
                  ? `/shapes/headstones/${filename}`
                  : '/shapes/headstones/pet_bone.svg';
          return {
            id: shape.code ?? shape.name,
            name: shape.name,
            category: 'catalog',
            url:
              state.productId === '2350'
                ? `/shapes/urns/${(shape.code ?? shape.name).toLowerCase()}.svg`
                : petUrl,
            initialSize: {
              widthMm: shape.table.initWidth,
              heightMm: shape.table.initHeight,
            },
          };
        })
    : data.shapes
        .slice(0, 100)
        .filter((shape) => {
          if (
            seen.has(shape.image) ||
            (isPlaque
              ? !plaqueShapes.has(shape.image)
              : plaqueShapes.has(shape.image)) ||
            (['32', '52'].includes(state.productId!) &&
              !['landscape.svg', 'portrait.svg'].includes(shape.image)) ||
            (traditionalOnly && shape.category !== 'traditional')
          )
            return false;
          seen.add(shape.image);
          return true;
        })
        .map((shape) => ({
          id: shape.id,
          name: shape.name,
          category: shape.category,
          url: `/shapes/${['oval_horizontal.svg', 'oval_vertical.svg', 'circle.svg'].includes(shape.image) ? 'masks' : 'headstones'}/${shape.image}`,
        }));
  const basePath =
    state.productId === '5' ? '/textures/phoenix/l/' : '/textures/forever/l/';
  const materials =
    state.productId === '52'
      ? [
          {
            id: 'brushed',
            name: 'Brushed Stainless Steel',
            category: 'finish',
            url: '/textures/forever/l/brushed-ss-swatch.webp',
          },
          {
            id: 'polished',
            name: 'Highly Polished Stainless Steel',
            category: 'finish',
            url: '/textures/forever/l/high-polished-ss-swatch.webp',
          },
        ]
      : state.materials
          .filter(
            (material) =>
              !['32', '2350'].includes(state.productId!) ||
              ['background', 'color'].includes(material.category),
          )
          .map((material) => ({
            id: material.id,
            name: material.name,
            category: material.category,
            url:
              resolveMaterialAssetPath(material.textureUrl, basePath) ??
              resolveMaterialAssetPath(material.image, basePath),
          }))
          .filter((material) => material.url !== null);
  const imageTypes = getImageTypeOptions(state.catalog);
  const supportsFlowerPots =
    state.catalog.product.type === 'headstone' &&
    !['8', '22'].includes(state.productId);
  const fullMonument = state.catalog.product.type === 'full-monument';
  const componentDimensions = {
    headstoneThickness: {
      available: !isPlaque && !['32', '52'].includes(state.productId),
      minMm: state.minThicknessMm,
      maxMm: state.maxThicknessMm,
      currentMm:
        state.headstoneStyle === 'slant'
          ? state.slantThickness
          : state.uprightThickness,
      style: state.headstoneStyle,
    },
    base: {
      available: !isPlaque && state.showBase,
      widthMm: {
        min: Math.max(state.minBaseWidthMm, state.widthMm),
        max: Math.max(
          Math.max(state.minBaseWidthMm, state.widthMm),
          state.maxBaseWidthMm,
        ),
      },
      heightMm: { min: state.minBaseHeightMm, max: state.maxBaseHeightMm },
      depthMm: { min: state.minThicknessMm, max: state.maxThicknessMm },
    },
    ledger: {
      available: fullMonument && state.showLedger,
      widthMm: {
        min: Math.max(state.minBaseWidthMm, state.widthMm),
        max: Math.max(state.minBaseWidthMm, state.maxBaseWidthMm),
      },
      heightMm: { min: 30, max: 150 },
      depthMm: { min: 400, max: 2900 },
    },
    kerbset: {
      available: fullMonument && state.showKerbset,
      widthMm: {
        min: Math.max(state.minBaseWidthMm, state.widthMm),
        max: Math.max(state.minBaseWidthMm, state.maxBaseWidthMm),
      },
      heightMm: { min: 100, max: 500 },
      depthMm: { min: 500, max: 3000 },
    },
  };
  return {
    productId: state.productId,
    shapes,
    materials,
    assembly: {
      stainlessBaseStyle: stainlessHeadstone
        ? !state.showBase
          ? 'none'
          : state.baseMaterialUrl?.includes('ss-swatch')
            ? 'stainless'
            : 'granite'
        : null,
      canShowBase: !isPlaque,
      canShowLedger: state.catalog.product.type === 'full-monument',
      canShowKerbset: state.catalog.product.type === 'full-monument',
      supportsFlowerPots,
      showBase: state.showBase,
      showLedger: state.showLedger,
      showKerbset: state.showKerbset,
      baseFinish: state.baseFinish,
      baseOption: state.baseOption,
      baseLidFinish: state.baseLidFinish,
    },
    componentDimensions,
    images: {
      types: imageTypes,
      masks:
        state.productId === '32'
          ? []
          : MASK_OPTIONS.map(({ id, label }) => ({ id, label })),
      available: imageTypes.length > 0,
    },
    availableTargets: [
      'headstone',
      ...(!isPlaque && state.showBase ? ['base'] : []),
      ...(state.catalog.product.type === 'full-monument' && state.showLedger
        ? ['ledger']
        : []),
      ...(state.catalog.product.type === 'full-monument' && state.showKerbset
        ? ['kerbset']
        : []),
    ],
    dimensions: {
      mode: state.productId === '32' ? 'fixed' : 'range',
      widthMm: { min: state.minWidthMm, max: state.maxWidthMm },
      heightMm: { min: state.minHeightMm, max: state.maxHeightMm },
      fixedSizes:
        state.productId === '32'
          ? state.fixedSizes.map(({ id, width, height, price }) => ({
              id,
              widthMm: width,
              heightMm: height,
              priceAud: price,
            }))
          : [],
    },
  };
}

type InscriptionPatch = Partial<
  Pick<
    Line,
    | 'text'
    | 'font'
    | 'sizeMm'
    | 'color'
    | 'xPos'
    | 'yPos'
    | 'rotationDeg'
    | 'textAlign'
  >
>;

async function listMotifFiles(categoryId: string) {
  const state = useHeadstoneStore.getState();
  if (state.motifsCatalog.length > 0) {
    const items = state.motifsCatalog.filter(
      (item) => item.category === categoryId,
    );
    if (
      items.length === 0 ||
      !isVisibleMotifCategory(items[0].categoryName ?? items[0].category)
    )
      return null;
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      categoryId,
      svgPath: item.svgUrl ?? item.previewUrl ?? null,
      previewUrl: item.previewUrl ?? item.svgUrl ?? null,
    }));
  }

  const category = data.motifs.find(
    (item) => item.src === categoryId || String(item.id) === categoryId,
  );
  if (!category || !isVisibleMotifCategory(category.name)) return null;
  const path = category.src
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const response = await fetch(`/api/motifs/${path}`);
  if (!response.ok) return null;
  const result = (await response.json()) as {
    motifs?: Array<{ path?: string; name?: string; category?: string }>;
  };
  return (result.motifs ?? []).map((item) => ({
    id: item.path ?? '',
    name: item.name ?? item.path ?? '',
    categoryId,
    svgPath: item.path ?? null,
    previewUrl: item.path
      ? `/shapes/motifs/s/${encodeURIComponent(
          item.path
            .split('/')
            .pop()
            ?.replace(/\.svg$/i, '') ?? '',
        )}.png`
      : null,
  }));
}

function isVisibleMotifCategory(name: string) {
  const normalized = name.toLowerCase().replace(/[_-]+/g, ' ').trim();
  return !['flower inserts', '1 colour motifs', '2 colour motifs'].includes(
    normalized,
  );
}

// This deliberately narrow bridge exists only in development; it is not a
// production API and is only accessible to a local browser debugging client.
export const designerAgentBridge = {
  getProductConfiguration() {
    const state = useHeadstoneStore.getState();
    if (!state.productId || !CONFIGURABLE_PRODUCTS.has(state.productId))
      return { error: 'UNSUPPORTED_PRODUCT' as const };
    const configuration = productConfiguration();
    if (!configuration) return { error: 'CATALOG_NOT_READY' as const };
    return { configuration, data: this.read() };
  },
  setShape(shapeId: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const configuration = productConfiguration();
    if (!configuration)
      return {
        error: CONFIGURABLE_PRODUCTS.has(
          useHeadstoneStore.getState().productId ?? '',
        )
          ? ('CATALOG_NOT_READY' as const)
          : ('UNSUPPORTED_PRODUCT' as const),
      };
    const shape = configuration.shapes.find((item) => item.id === shapeId);
    if (!shape) return { error: 'NOT_FOUND' as const };
    if (shape.initialSize) {
      const catalogShape = useHeadstoneStore
        .getState()
        .catalog?.product.shapes.find(
          (item) => (item.code ?? item.name) === shape.id,
        );
      if (!catalogShape) return { error: 'CATALOG_CHANGED' as const };
      selectCatalogShape(catalogShape, shape.url);
    } else {
      useHeadstoneStore.getState().setShapeUrl(shape.url);
    }
    if (
      configuration.productId === '5' &&
      (shape.url.includes('oval_') || shape.url.endsWith('/circle.svg'))
    )
      useHeadstoneStore.getState().setBorderName('Border 4');
    return { data: this.read() };
  },
  async setMaterial(
    materialId: string,
    target: 'headstone' | 'base' | 'ledger' | 'kerbset',
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const configuration = productConfiguration();
    if (!configuration)
      return {
        error: CONFIGURABLE_PRODUCTS.has(
          useHeadstoneStore.getState().productId ?? '',
        )
          ? ('CATALOG_NOT_READY' as const)
          : ('UNSUPPORTED_PRODUCT' as const),
      };
    if (!configuration.availableTargets.includes(target))
      return { error: 'SURFACE_UNAVAILABLE' as const };
    const currentState = useHeadstoneStore.getState();
    if (
      isStainlessHeadstoneProduct(
        currentState.productId,
        currentState.catalog,
      ) &&
      (target !== 'base' || currentState.baseMaterialUrl?.includes('ss-swatch'))
    )
      return { error: 'OPTION_UNAVAILABLE' as const };
    const material = configuration.materials.find(
      (item) => item.id === materialId,
    );
    if (!material?.url) return { error: 'NOT_FOUND' as const };
    await preloadSceneTexture(material.url);
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const currentConfiguration = productConfiguration();
    if (
      !currentConfiguration?.availableTargets.includes(target) ||
      !currentConfiguration.materials.some(
        (item) => item.id === materialId && item.url === material.url,
      )
    )
      return { error: 'CATALOG_CHANGED' as const };
    const state = useHeadstoneStore.getState();
    state.setIsMaterialChange(true);
    if (target === 'base') state.setBaseMaterialUrl(material.url);
    else if (target === 'ledger') state.setLedgerMaterialUrl(material.url);
    else if (target === 'kerbset') state.setKerbsetMaterialUrl(material.url);
    else state.setHeadstoneMaterialUrl(material.url);
    state.setSelected(target);
    state.setEditingObject(target);
    setTimeout(
      () => useHeadstoneStore.getState().setIsMaterialChange(false),
      100,
    );
    return { data: this.read() };
  },
  setDimensions(
    widthMm: number | undefined,
    heightMm: number | undefined,
    thicknessMm: number | undefined,
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const configuration = productConfiguration();
    if (!configuration)
      return {
        error: CONFIGURABLE_PRODUCTS.has(
          useHeadstoneStore.getState().productId ?? '',
        )
          ? ('CATALOG_NOT_READY' as const)
          : ('UNSUPPORTED_PRODUCT' as const),
      };
    const state = useHeadstoneStore.getState();
    const { dimensions } = configuration;
    if (dimensions.mode === 'fixed')
      return { error: 'FIXED_SIZE_REQUIRED' as const };
    if (
      (widthMm !== undefined &&
        (widthMm < dimensions.widthMm.min ||
          widthMm > dimensions.widthMm.max)) ||
      (heightMm !== undefined &&
        (heightMm < dimensions.heightMm.min ||
          heightMm > dimensions.heightMm.max)) ||
      (thicknessMm !== undefined &&
        !configuration.componentDimensions.headstoneThickness.available)
    )
      return {
        error:
          thicknessMm !== undefined &&
          !configuration.componentDimensions.headstoneThickness.available
            ? ('DIMENSION_UNAVAILABLE' as const)
            : ('DIMENSION_OUT_OF_RANGE' as const),
      };
    if (
      thicknessMm !== undefined &&
      (thicknessMm <
        configuration.componentDimensions.headstoneThickness.minMm ||
        thicknessMm >
          configuration.componentDimensions.headstoneThickness.maxMm)
    )
      return { error: 'DIMENSION_OUT_OF_RANGE' as const };
    if (widthMm !== undefined) state.setWidthMm(widthMm);
    if (heightMm !== undefined) state.setHeightMm(heightMm);
    if (thicknessMm !== undefined) {
      if (state.headstoneStyle === 'slant')
        state.setSlantThickness(thicknessMm);
      else state.setUprightThickness(thicknessMm);
    }
    return { data: this.read() };
  },
  setComponentDimensions(
    component: 'base' | 'ledger' | 'kerbset',
    dimensions: { widthMm?: number; heightMm?: number; depthMm?: number },
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    const configuration = productConfiguration();
    if (!configuration)
      return {
        error: CONFIGURABLE_PRODUCTS.has(state.productId ?? '')
          ? ('CATALOG_NOT_READY' as const)
          : ('UNSUPPORTED_PRODUCT' as const),
      };
    const limits = configuration.componentDimensions[component];
    if (!limits.available) return { error: 'SURFACE_UNAVAILABLE' as const };
    if (
      dimensions.widthMm === undefined &&
      dimensions.heightMm === undefined &&
      dimensions.depthMm === undefined
    )
      return { error: 'INVALID_ARGUMENT' as const };
    const rangeError = (
      value: number | undefined,
      range: { min: number; max: number },
    ) => value !== undefined && (value < range.min || value > range.max);
    if (
      (dimensions.widthMm !== undefined &&
        rangeError(dimensions.widthMm, limits.widthMm)) ||
      (dimensions.heightMm !== undefined &&
        rangeError(dimensions.heightMm, limits.heightMm)) ||
      (dimensions.depthMm !== undefined &&
        rangeError(dimensions.depthMm, limits.depthMm))
    )
      return { error: 'DIMENSION_OUT_OF_RANGE' as const };
    if (component === 'base') {
      if (dimensions.widthMm !== undefined)
        state.setBaseWidthMm(dimensions.widthMm);
      if (dimensions.heightMm !== undefined)
        state.setBaseHeightMm(dimensions.heightMm);
      if (dimensions.depthMm !== undefined)
        state.setBaseThickness(dimensions.depthMm);
    } else if (component === 'ledger') {
      if (dimensions.widthMm !== undefined)
        state.setLedgerWidthMm(dimensions.widthMm);
      if (dimensions.heightMm !== undefined)
        state.setLedgerHeightMm(dimensions.heightMm);
      if (dimensions.depthMm !== undefined)
        state.setLedgerDepthMm(dimensions.depthMm);
    } else {
      if (dimensions.widthMm !== undefined)
        state.setKerbWidthMm(dimensions.widthMm);
      if (dimensions.heightMm !== undefined)
        state.setKerbHeightMm(dimensions.heightMm);
      if (dimensions.depthMm !== undefined)
        state.setKerbDepthMm(dimensions.depthMm);
    }
    return { data: this.read() };
  },
  setFixedSize(
    sizeId: number,
    orientation: 'portrait' | 'landscape',
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (state.productId !== '32')
      return { error: 'FIXED_SIZE_UNAVAILABLE' as const };
    if (state.productConfigurationReadyId !== state.productId || !state.catalog)
      return { error: 'CATALOG_NOT_READY' as const };
    const size = state.fixedSizes.find((entry) => entry.id === sizeId);
    if (!size) return { error: 'NOT_FOUND' as const };
    state.setWidthMm(orientation === 'landscape' ? size.height : size.width);
    state.setHeightMm(orientation === 'landscape' ? size.width : size.height);
    return { data: this.read() };
  },
  setAssemblyOptions(
    options: {
      showBase?: boolean;
      showLedger?: boolean;
      showKerbset?: boolean;
      baseFinish?: 'default' | 'rock-pitch';
      baseOption?: 'none' | 'flower-pots';
      baseLidFinish?: 'black' | 'silver' | 'gold';
      stainlessBaseStyle?: 'none' | 'stainless' | 'granite';
    },
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (
      !state.productId ||
      !state.catalog ||
      state.catalog.product.id !== state.productId
    )
      return { error: 'CATALOG_NOT_READY' as const };
    const type = state.catalog.product.type;
    const stainlessHeadstone = isStainlessHeadstoneProduct(
      state.productId,
      state.catalog,
    );
    if (options.stainlessBaseStyle !== undefined && !stainlessHeadstone)
      return { error: 'OPTION_UNAVAILABLE' as const };
    if (
      options.stainlessBaseStyle !== undefined &&
      (options.showBase !== undefined || options.baseFinish !== undefined)
    )
      return { error: 'INVALID_ARGUMENT' as const };
    if (stainlessHeadstone && options.baseFinish === 'rock-pitch')
      return { error: 'OPTION_UNAVAILABLE' as const };
    if (options.showBase !== undefined && options.showBase && type === 'plaque')
      return { error: 'OPTION_UNAVAILABLE' as const };
    if (
      (options.showLedger !== undefined || options.showKerbset !== undefined) &&
      type !== 'full-monument'
    )
      return { error: 'OPTION_UNAVAILABLE' as const };
    const supportsFlowerPots =
      type === 'headstone' && !['8', '22'].includes(state.productId);
    if (options.baseOption === 'flower-pots' && !supportsFlowerPots)
      return { error: 'OPTION_UNAVAILABLE' as const };
    if (
      options.baseLidFinish !== undefined &&
      (!supportsFlowerPots ||
        (options.baseOption ?? state.baseOption) !== 'flower-pots')
    )
      return { error: 'OPTION_UNAVAILABLE' as const };
    if (options.showBase !== undefined) state.setShowBase(options.showBase);
    if (options.showLedger !== undefined)
      state.setShowLedger(options.showLedger);
    if (options.showKerbset !== undefined)
      state.setShowKerbset(options.showKerbset);
    if (options.baseFinish !== undefined)
      state.setBaseFinish(options.baseFinish);
    if (options.baseOption !== undefined)
      state.setBaseOption(options.baseOption);
    if (options.baseLidFinish !== undefined)
      state.setBaseLidFinish(options.baseLidFinish);
    if (options.stainlessBaseStyle !== undefined) {
      if (options.stainlessBaseStyle === 'none') state.setShowBase(false);
      else {
        state.setBaseFinish('default');
        state.setBaseMaterialUrl(
          `${TEX_BASE}${options.stainlessBaseStyle === 'stainless' ? 'brushed-ss-swatch.webp' : DEFAULT_TEX}`,
        );
        state.setShowBase(true);
      }
    }
    return { data: this.read() };
  },
  listProducts() {
    return data.products.map(({ id, name, category }) => ({
      id,
      name,
      category,
    }));
  },
  listAdditions() {
    const state = useHeadstoneStore.getState();
    return {
      snapshot: captureDesignSnapshot(),
      catalog: data.additions.map((addition) => ({
        id: addition.id,
        name: addition.name,
        type: addition.type,
        sizes: (addition.sizes ?? []).map((size, index) => ({
          variant: index + 1,
          widthMm: size.width,
          heightMm: size.height,
          depthMm: size.depth,
          available: size.availability,
        })),
      })),
      selected: state.selectedAdditions.map((id) => ({
        id,
        catalogId: normalizeAdditionBaseId(id),
        offset: state.additionOffsets[id] ?? null,
        coordinateSpace: 'target-surface-native',
      })),
    };
  },
  listMotifCategories() {
    const state = useHeadstoneStore.getState();
    const categories =
      state.motifsCatalog.length > 0
        ? Array.from(
            state.motifsCatalog.reduce((map, motif) => {
              const id = motif.category || 'uncategorized';
              if (!map.has(id))
                map.set(id, { id, name: motif.categoryName ?? id, count: 0 });
              map.get(id)!.count += 1;
              return map;
            }, new Map<string, { id: string; name: string; count: number }>()),
          )
            .map(([, category]) => category)
            .filter((category) => isVisibleMotifCategory(category.name))
        : data.motifs
            .map((category, index) => ({
              id: category.src,
              name: category.name,
              count: null,
              sourceIndex: index,
              traditional: category.traditional,
              stainless: category.ss,
            }))
            .filter((category) => isVisibleMotifCategory(category.name));
    return {
      snapshot: captureDesignSnapshot(),
      categories,
      selected: state.selectedMotifs.map((motif) => ({
        ...motif,
        offset: state.motifOffsets[motif.id] ?? null,
      })),
    };
  },
  listImages() {
    const state = useHeadstoneStore.getState();
    const types =
      state.catalog?.product.id === state.productId
        ? getImageTypeOptions(state.catalog)
        : [];
    return {
      snapshot: captureDesignSnapshot(),
      productId: state.productId,
      available: types.length > 0,
      types,
      masks:
        state.productId === '32'
          ? []
          : MASK_OPTIONS.map(({ id, label }) => ({ id, label })),
      selected: state.selectedImages.map((image) => ({
        ...image,
        coordinateSpace: image.coordinateSpace ?? 'surface-native',
      })),
    };
  },
  async addImage(
    input: {
      imageBase64: string;
      mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
      typeId: number;
      cropArea?: { x: number; y: number; width: number; height: number };
      cropScalePercent?: number;
      cropRotationDeg?: number;
      flipX?: boolean;
      flipY?: boolean;
      maskShape?: MaskShape;
      colorMode?: 'full' | 'bw' | 'sepia';
      sizeVariant?: number;
      heightMm?: number;
      target?: 'headstone' | 'base' | 'ledger';
    },
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (
      !state.productId ||
      !state.catalog ||
      state.catalog.product.id !== state.productId
    )
      return { error: 'CATALOG_NOT_READY' as const };
    const imageType = getImageTypeOptions(state.catalog).find(
      (item) => item.id === input.typeId,
    );
    if (!imageType) return { error: 'IMAGE_TYPE_UNAVAILABLE' as const };
    const target = input.target ?? 'headstone';
    if (
      (target === 'base' && !state.showBase) ||
      (target === 'ledger' && !state.showLedger)
    )
      return { error: 'SURFACE_UNAVAILABLE' as const };
    if (
      input.imageBase64.length > 7_000_000 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(input.imageBase64)
    )
      return { error: 'INVALID_IMAGE_DATA' as const };
    let bytes: Uint8Array<ArrayBuffer>;
    try {
      const decoded = atob(input.imageBase64);
      bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
    } catch {
      return { error: 'INVALID_IMAGE_DATA' as const };
    }
    if (bytes.byteLength === 0 || bytes.byteLength > 5 * 1024 * 1024)
      return { error: 'IMAGE_TOO_LARGE' as const };
    const file = new File([bytes], 'uploaded-image', { type: input.mimeType });
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      return { error: 'INVALID_IMAGE_DATA' as const };
    }
    if (
      bitmap.width <= 0 ||
      bitmap.height <= 0 ||
      bitmap.width * bitmap.height > 40_000_000
    ) {
      bitmap.close();
      return { error: 'IMAGE_DIMENSIONS_INVALID' as const };
    }
    const sourceWidth = bitmap.width;
    const sourceHeight = bitmap.height;
    const crop = input.cropArea ?? { x: 0, y: 0, width: 100, height: 100 };
    if (
      ![crop.x, crop.y, crop.width, crop.height].every(Number.isFinite) ||
      crop.x < 0 ||
      crop.y < 0 ||
      crop.width <= 0 ||
      crop.height <= 0 ||
      crop.x + crop.width > 100 ||
      crop.y + crop.height > 100
    ) {
      bitmap.close();
      return { error: 'INVALID_CROP_AREA' as const };
    }
    const cropX = (crop.x / 100) * sourceWidth;
    const cropY = (crop.y / 100) * sourceHeight;
    const cropWidth = (crop.width / 100) * sourceWidth;
    const cropHeight = (crop.height / 100) * sourceHeight;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(cropWidth));
    canvas.height = Math.max(1, Math.round(cropHeight));
    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      return { error: 'IMAGE_PROCESSING_FAILED' as const };
    }
    const cropScalePercent = input.cropScalePercent ?? 100;
    const cropRotationDeg = input.cropRotationDeg ?? 0;
    if (
      !Number.isFinite(cropScalePercent) ||
      cropScalePercent < 10 ||
      cropScalePercent > 400 ||
      !Number.isFinite(cropRotationDeg) ||
      cropRotationDeg < -180 ||
      cropRotationDeg > 180
    ) {
      bitmap.close();
      return { error: 'INVALID_CROP_TRANSFORM' as const };
    }
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((cropRotationDeg * Math.PI) / 180);
    context.scale(input.flipX ? -1 : 1, input.flipY ? -1 : 1);
    context.scale(cropScalePercent / 100, cropScalePercent / 100);
    context.drawImage(
      bitmap,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height,
    );
    context.restore();
    bitmap.close();
    const colorMode = input.colorMode ?? 'full';
    if (colorMode !== 'full') {
      try {
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        for (let index = 0; index < pixels.data.length; index += 4) {
          const red = pixels.data[index];
          const green = pixels.data[index + 1];
          const blue = pixels.data[index + 2];
          if (colorMode === 'bw') {
            const gray = 0.299 * red + 0.587 * green + 0.114 * blue;
            pixels.data[index] =
              pixels.data[index + 1] =
              pixels.data[index + 2] =
                gray;
          } else {
            pixels.data[index] = Math.min(
              255,
              red * 0.393 + green * 0.769 + blue * 0.189,
            );
            pixels.data[index + 1] = Math.min(
              255,
              red * 0.349 + green * 0.686 + blue * 0.168,
            );
            pixels.data[index + 2] = Math.min(
              255,
              red * 0.272 + green * 0.534 + blue * 0.131,
            );
          }
        }
        context.putImageData(pixels, 0, 0);
      } catch {
        return { error: 'IMAGE_PROCESSING_FAILED' as const };
      }
    }
    const hasMask = state.productId !== '32';
    const maskShape = input.maskShape ?? 'oval';
    let maskAspect = 1;
    if (hasMask) {
      try {
        const maskMetrics = await fetchMaskMetrics(getMaskUrl(maskShape));
        maskAspect = maskMetrics.aspect;
      } catch {
        maskAspect = getMaskAspectRatio(maskShape);
      }
    }
    let finalCanvas = canvas;
    if (hasMask) {
      const imageAspect = canvas.width / canvas.height;
      let fittedWidth = canvas.width;
      let fittedHeight = canvas.height;
      if (imageAspect > maskAspect) fittedWidth = canvas.height * maskAspect;
      else fittedHeight = canvas.width / maskAspect;
      const drawX = (canvas.width - fittedWidth) / 2;
      const drawY = (canvas.height - fittedHeight) / 2;
      finalCanvas = document.createElement('canvas');
      finalCanvas.width = Math.max(1, Math.round(fittedWidth));
      finalCanvas.height = Math.max(1, Math.round(fittedHeight));
      const finalContext = finalCanvas.getContext('2d');
      if (!finalContext) return { error: 'IMAGE_PROCESSING_FAILED' as const };
      finalContext.drawImage(
        canvas,
        drawX,
        drawY,
        fittedWidth,
        fittedHeight,
        0,
        0,
        finalCanvas.width,
        finalCanvas.height,
      );
      try {
        const mask = new Image();
        mask.crossOrigin = 'anonymous';
        mask.src = getMaskUrl(maskShape);
        await new Promise<void>((resolve, reject) => {
          mask.onload = () => resolve();
          mask.onerror = () => reject(new Error('Mask image could not load'));
        });
        const metrics = await fetchMaskMetrics(getMaskUrl(maskShape));
        finalContext.globalCompositeOperation = 'destination-in';
        finalContext.drawImage(
          mask,
          metrics.normalizedBounds.left * mask.naturalWidth,
          metrics.normalizedBounds.top * mask.naturalHeight,
          metrics.normalizedBounds.width * mask.naturalWidth,
          metrics.normalizedBounds.height * mask.naturalHeight,
          0,
          0,
          finalCanvas.width,
          finalCanvas.height,
        );
        finalContext.globalCompositeOperation = 'source-over';
      } catch {
        return { error: 'IMAGE_MASK_FAILED' as const };
      }
    }
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const croppedAspectRatio = finalCanvas.width / finalCanvas.height;
    let widthMm: number;
    let heightMm: number;
    let sizeVariant: number | undefined;
    if (imageType.fixedSizes.length > 0) {
      sizeVariant = input.sizeVariant ?? 1;
      const selectedSize = imageType.fixedSizes.find(
        (size) => size.variant === sizeVariant,
      );
      if (!selectedSize) return { error: 'INVALID_SIZE_VARIANT' as const };
      heightMm = selectedSize.heightMm;
      widthMm = heightMm * croppedAspectRatio;
      if (widthMm > selectedSize.widthMm) {
        widthMm = selectedSize.widthMm;
        heightMm = widthMm / croppedAspectRatio;
      }
    } else {
      const bounds = imageType.flexibleBounds ?? {
        minHeight: 30,
        maxHeight: 1200,
        initHeight: 100,
      };
      heightMm = input.heightMm ?? bounds.initHeight;
      if (
        !Number.isFinite(heightMm) ||
        heightMm < bounds.minHeight ||
        heightMm > bounds.maxHeight
      )
        return { error: 'DIMENSION_OUT_OF_RANGE' as const };
      widthMm = Math.max(1, Math.round(heightMm * croppedAspectRatio));
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      finalCanvas.toBlob(resolve, 'image/png'),
    );
    if (!blob) return { error: 'IMAGE_PROCESSING_FAILED' as const };
    if (blob.size > 7 * 1024 * 1024)
      return { error: 'PROCESSED_IMAGE_TOO_LARGE' as const };
    const form = new FormData();
    form.append(
      'file',
      new File([blob], 'designer-image.png', { type: 'image/png' }),
    );
    let uploadResponse: Response;
    try {
      uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: form,
      });
    } catch {
      return { error: 'IMAGE_UPLOAD_OUTCOME_UNKNOWN' as const };
    }
    if (!uploadResponse.ok) return { error: 'IMAGE_UPLOAD_FAILED' as const };
    let uploaded: { url?: string };
    try {
      uploaded = await uploadResponse.json();
    } catch {
      return { error: 'IMAGE_UPLOAD_OUTCOME_UNKNOWN' as const };
    }
    if (typeof uploaded.url !== 'string' || !uploaded.url)
      return { error: 'IMAGE_UPLOAD_FAILED' as const };
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT_UPLOAD_ORPHANED' as const };
    const currentState = useHeadstoneStore.getState();
    const currentImageType =
      currentState.catalog?.product.id === currentState.productId
        ? getImageTypeOptions(currentState.catalog).find(
            (item) => item.id === input.typeId,
          )
        : undefined;
    if (!currentImageType)
      return { error: 'CATALOG_CHANGED_UPLOAD_ORPHANED' as const };
    const maskShapeFiles: Record<MaskShape, string> = {
      oval: 'oval_vertical',
      'horizontal-oval': 'oval_horizontal',
      square: 'rectangle_vertical',
      rectangle: 'rectangle_horizontal',
      heart: 'heart',
      teardrop: 'teardrop',
      triangle: 'triangle',
    };
    state.addImage({
      id: `img-${crypto.randomUUID()}`,
      typeId: input.typeId,
      typeName: currentImageType.name,
      imageUrl: uploaded.url,
      widthMm,
      heightMm,
      xPos: 0,
      yPos: 0,
      rotationZ: 0,
      ...(sizeVariant !== undefined ? { sizeVariant } : {}),
      croppedAspectRatio,
      maskShape: hasMask ? maskShapeFiles[maskShape] : '',
      colorMode,
      target,
      coordinateSpace: 'mm-center',
    });
    const id = useHeadstoneStore.getState().selectedImageId;
    if (!id) return { error: 'MUTATION_FAILED' as const };
    return { id, imageUrl: uploaded.url, data: this.read() };
  },
  async replaceImage(
    id: string,
    input: {
      imageBase64: string;
      mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
      typeId: number;
      cropArea?: { x: number; y: number; width: number; height: number };
      cropScalePercent?: number;
      cropRotationDeg?: number;
      flipX?: boolean;
      flipY?: boolean;
      maskShape?: MaskShape;
      colorMode?: 'full' | 'bw' | 'sepia';
      sizeVariant?: number;
      heightMm?: number;
    },
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    const existing = state.selectedImages.find((image) => image.id === id);
    if (!existing) return { error: 'NOT_FOUND' as const };
    if (input.typeId !== existing.typeId)
      return { error: 'IMAGE_TYPE_MISMATCH' as const };
    const uploaded = await this.addImage(
      { ...input, target: existing.target ?? 'headstone' },
      expectedSnapshot,
    );
    if ('error' in uploaded) return uploaded;
    const temporary = uploaded.data.snapshot.selectedImages.find(
      (image) => image.id === uploaded.id,
    );
    if (!temporary) return { error: 'MUTATION_FAILED' as const };
    const current = useHeadstoneStore.getState();
    current.updateImageData(
      id,
      temporary.imageUrl,
      temporary.croppedAspectRatio ?? temporary.widthMm / temporary.heightMm,
      temporary.colorMode,
    );
    current.removeImage(temporary.id);
    current.setSelectedImageId(id);
    return { id, imageUrl: temporary.imageUrl, data: this.read() };
  },
  updateImage(
    id: string,
    patch: {
      xPos?: number;
      yPos?: number;
      heightMm?: number;
      sizeVariant?: number;
      rotationDeg?: number;
    },
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    const image = state.selectedImages.find((item) => item.id === id);
    if (!image) return { error: 'NOT_FOUND' as const };
    if (
      patch.heightMm !== undefined &&
      (!Number.isFinite(patch.heightMm) ||
        patch.heightMm <= 0 ||
        patch.heightMm > 2000)
    )
      return { error: 'DIMENSION_OUT_OF_RANGE' as const };
    if (
      patch.sizeVariant !== undefined &&
      (!Number.isInteger(patch.sizeVariant) || patch.sizeVariant < 1)
    )
      return { error: 'INVALID_SIZE_VARIANT' as const };
    if (
      patch.rotationDeg !== undefined &&
      (!Number.isFinite(patch.rotationDeg) ||
        patch.rotationDeg < -180 ||
        patch.rotationDeg > 180)
    )
      return { error: 'INVALID_ROTATION' as const };
    const fixedImageSizes = getImageSizeOptions(image.typeId);
    if (
      patch.sizeVariant !== undefined &&
      (fixedImageSizes.length === 0 || !fixedImageSizes[patch.sizeVariant - 1])
    )
      return { error: 'INVALID_SIZE_VARIANT' as const };
    const flexibleImageBounds = getFlexibleImageBounds(image.typeId) ?? {
      minHeight: 30,
      maxHeight: 1200,
      initHeight: 100,
    };
    if (patch.heightMm !== undefined) {
      if (fixedImageSizes.length > 0)
        return { error: 'FIXED_SIZE_REQUIRED' as const };
      if (
        patch.heightMm < flexibleImageBounds.minHeight ||
        patch.heightMm > flexibleImageBounds.maxHeight
      )
        return { error: 'DIMENSION_OUT_OF_RANGE' as const };
    }
    if (
      [patch.xPos, patch.yPos].some(
        (value) =>
          value !== undefined &&
          (!Number.isFinite(value) || Math.abs(value) > 10000),
      )
    )
      return { error: 'INVALID_POSITION' as const };
    const updatePosition = patch.xPos !== undefined || patch.yPos !== undefined;
    if (updatePosition)
      state.updateImageTarget(
        id,
        image.target ?? 'headstone',
        patch.xPos ?? image.xPos,
        patch.yPos ?? image.yPos,
        image.coordinateSpace,
      );
    if (patch.sizeVariant !== undefined) {
      if (fixedImageSizes.length > 0) {
        const size = fixedImageSizes[patch.sizeVariant - 1]!;
        const ratio =
          image.croppedAspectRatio ?? image.widthMm / image.heightMm;
        let heightMm = size.height;
        let widthMm = heightMm * ratio;
        if (widthMm > size.width) {
          widthMm = size.width;
          heightMm = widthMm / ratio;
        }
        state.updateImageSizeVariant(id, patch.sizeVariant);
        state.updateImageSize(id, widthMm, heightMm);
      }
    }
    if (patch.heightMm !== undefined) {
      const aspect = image.croppedAspectRatio ?? image.widthMm / image.heightMm;
      const heightMm = Math.round(patch.heightMm);
      const widthMm = Math.max(1, Math.round(heightMm * aspect));
      state.updateImageSize(id, widthMm, heightMm);
    }
    if (patch.rotationDeg !== undefined)
      state.updateImageRotation(id, (patch.rotationDeg * Math.PI) / 180);
    state.setSelectedImageId(id);
    return { data: this.read() };
  },
  moveImageToSurface(
    id: string,
    target: 'headstone' | 'base' | 'ledger',
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (!state.selectedImages.some((image) => image.id === id))
      return { error: 'NOT_FOUND' as const };
    if (
      !state.productId ||
      !state.catalog ||
      state.catalog.product.id !== state.productId ||
      state.productConfigurationReadyId !== state.productId
    )
      return { error: 'CATALOG_NOT_READY' as const };
    if (
      (target === 'base' &&
        (state.catalog.product.type === 'plaque' || !state.showBase)) ||
      (target === 'ledger' &&
        (state.catalog.product.type !== 'full-monument' || !state.showLedger))
    )
      return { error: 'SURFACE_UNAVAILABLE' as const };
    const image = state.selectedImages.find((item) => item.id === id)!;
    if ((image.target ?? 'headstone') !== target)
      state.updateImageTarget(
        id,
        target,
        0,
        0,
        target === 'headstone' ? 'mm-center' : undefined,
      );
    state.setSelectedImageId(id);
    return { data: this.read() };
  },
  duplicateImage(id: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (!state.selectedImages.some((image) => image.id === id))
      return { error: 'NOT_FOUND' as const };
    state.duplicateImage(id);
    const duplicateId = useHeadstoneStore.getState().selectedImageId;
    if (!duplicateId || duplicateId === id)
      return { error: 'MUTATION_FAILED' as const };
    return { id: duplicateId, data: this.read() };
  },
  deleteImage(id: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (!state.selectedImages.some((image) => image.id === id))
      return { error: 'NOT_FOUND' as const };
    state.removeImage(id);
    return { data: this.read() };
  },
  listEmblems() {
    const state = useHeadstoneStore.getState();
    return {
      snapshot: captureDesignSnapshot(),
      available: state.productId === '5',
      catalog:
        state.productId === '5'
          ? loadEmblems().map(({ id, name, thumbnailUrl, imageUrl }) => ({
              id,
              name,
              thumbnailUrl,
              imageUrl,
            }))
          : [],
      sizes: EMBLEM_SIZES.map(({ variant, label, widthMm, heightMm }) => ({
        variant,
        label,
        widthMm,
        heightMm,
      })),
      selected: state.selectedEmblems.map((emblem) => ({
        ...emblem,
        offset: state.emblemOffsets[emblem.id] ?? null,
        coordinateSpace:
          state.emblemOffsets[emblem.id]?.coordinateSpace ?? 'offset',
      })),
    };
  },
  addEmblem(emblemId: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (state.productId !== '5')
      return { error: 'UNSUPPORTED_PRODUCT' as const };
    const emblem = loadEmblems().find((item) => item.id === emblemId);
    if (!emblem) return { error: 'NOT_FOUND' as const };
    state.addEmblem(emblem.id, emblem.imageUrl);
    const id = useHeadstoneStore.getState().selectedEmblemId;
    if (!id) return { error: 'MUTATION_FAILED' as const };
    return { id, data: this.read() };
  },
  updateEmblem(
    id: string,
    patch: {
      xPos?: number;
      yPos?: number;
      sizeVariant?: number;
      rotationDeg?: number;
      flipX?: boolean;
      flipY?: boolean;
    },
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (state.productId !== '5')
      return { error: 'UNSUPPORTED_PRODUCT' as const };
    if (!state.selectedEmblems.some((emblem) => emblem.id === id))
      return { error: 'NOT_FOUND' as const };
    if (
      patch.sizeVariant !== undefined &&
      !EMBLEM_SIZES.some((size) => size.variant === patch.sizeVariant)
    )
      return { error: 'INVALID_SIZE_VARIANT' as const };
    if (
      patch.rotationDeg !== undefined &&
      (patch.rotationDeg < -180 || patch.rotationDeg > 180)
    )
      return { error: 'INVALID_ROTATION' as const };
    const { rotationDeg, ...offsetPatch } = patch;
    state.setEmblemOffset(id, {
      ...offsetPatch,
      ...(rotationDeg !== undefined
        ? { rotationZ: (rotationDeg * Math.PI) / 180 }
        : {}),
    });
    state.setSelectedEmblemId(id);
    return { data: this.read() };
  },
  duplicateEmblem(id: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (state.productId !== '5')
      return { error: 'UNSUPPORTED_PRODUCT' as const };
    if (!state.selectedEmblems.some((emblem) => emblem.id === id))
      return { error: 'NOT_FOUND' as const };
    state.duplicateEmblem(id);
    const duplicateId = useHeadstoneStore.getState().selectedEmblemId;
    if (!duplicateId || duplicateId === id)
      return { error: 'MUTATION_FAILED' as const };
    return { id: duplicateId, data: this.read() };
  },
  deleteEmblem(id: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (state.productId !== '5')
      return { error: 'UNSUPPORTED_PRODUCT' as const };
    if (!state.selectedEmblems.some((emblem) => emblem.id === id))
      return { error: 'NOT_FOUND' as const };
    state.removeEmblem(id);
    return { data: this.read() };
  },
  async listMotifs(categoryId: string) {
    const motifs = await listMotifFiles(categoryId);
    if (!motifs) return { error: 'NOT_FOUND' as const };
    return { categoryId, motifs };
  },
  async addMotif(
    categoryId: string,
    motifPath: string,
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const motifs = await listMotifFiles(categoryId);
    if (!motifs) return { error: 'MOTIF_CATALOG_UNAVAILABLE' as const };
    if (!motifs.some((motif) => motif.svgPath === motifPath))
      return { error: 'NOT_FOUND' as const };
    const currentMotifs = await listMotifFiles(categoryId);
    if (!currentMotifs?.some((motif) => motif.svgPath === motifPath))
      return { error: 'CATALOG_CHANGED' as const };
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    state.addMotif(motifPath);
    const id = useHeadstoneStore.getState().selectedMotifId;
    if (!id) return { error: 'MUTATION_FAILED' as const };
    return { id, data: this.read() };
  },
  updateMotif(
    id: string,
    patch: {
      xPos?: number;
      yPos?: number;
      scale?: number;
      heightMm?: number;
      rotationDeg?: number;
      color?: string;
      flipX?: boolean;
      flipY?: boolean;
    },
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    const motif = state.selectedMotifs.find((item) => item.id === id);
    if (!motif) return { error: 'NOT_FOUND' as const };
    const isLaser = state.catalog?.product.laser === '1';
    const isBronze = state.catalog?.product.type === 'bronze_plaque';
    const maxHeight = isLaser ? 600 : isBronze ? 150 : 1000;
    if (
      patch.heightMm !== undefined &&
      (patch.heightMm < 40 || patch.heightMm > maxHeight)
    )
      return { error: 'DIMENSION_OUT_OF_RANGE' as const };
    if (
      patch.rotationDeg !== undefined &&
      (patch.rotationDeg < -180 || patch.rotationDeg > 180)
    )
      return { error: 'INVALID_ROTATION' as const };
    if (patch.scale !== undefined && (patch.scale < 0.1 || patch.scale > 3))
      return { error: 'INVALID_SCALE' as const };
    if (
      patch.color !== undefined &&
      (!/^#[0-9a-fA-F]{6}$/.test(patch.color) ||
        isLaser ||
        isStainlessHeadstoneProduct(state.productId, state.catalog) ||
        state.catalog?.product.color === '0')
    )
      return { error: 'COLOR_UNAVAILABLE' as const };
    const { color, rotationDeg, ...offsetPatch } = patch;
    if (Object.keys(offsetPatch).length > 0 || rotationDeg !== undefined) {
      state.setMotifOffset(id, {
        ...offsetPatch,
        ...(rotationDeg !== undefined
          ? { rotationZ: (rotationDeg * Math.PI) / 180 }
          : {}),
      });
    }
    if (color !== undefined) state.setMotifColor(id, color);
    state.setSelectedMotifId(id);
    return { data: this.read() };
  },
  duplicateMotif(id: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (!state.selectedMotifs.some((motif) => motif.id === id))
      return { error: 'NOT_FOUND' as const };
    const previousIds = new Set(state.selectedMotifs.map((motif) => motif.id));
    state.duplicateMotif(id);
    const duplicate = useHeadstoneStore
      .getState()
      .selectedMotifs.find((motif) => !previousIds.has(motif.id));
    if (!duplicate) return { error: 'MUTATION_FAILED' as const };
    return { id: duplicate.id, data: this.read() };
  },
  deleteMotif(id: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (!state.selectedMotifs.some((motif) => motif.id === id))
      return { error: 'NOT_FOUND' as const };
    state.removeMotif(id);
    return { data: this.read() };
  },
  addAddition(catalogId: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    if (!data.additions.some((addition) => addition.id === catalogId))
      return { error: 'NOT_FOUND' as const };
    const state = useHeadstoneStore.getState();
    state.addAddition(catalogId);
    const id = useHeadstoneStore.getState().selectedAdditionId;
    if (!id) return { error: 'MUTATION_FAILED' as const };
    return { id, data: this.read() };
  },
  deleteAddition(id: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (!state.selectedAdditions.includes(id))
      return { error: 'NOT_FOUND' as const };
    state.removeAddition(id);
    return { data: this.read() };
  },
  updateAddition(
    id: string,
    patch: {
      xPos?: number;
      yPos?: number;
      zPos?: number;
      scale?: number;
      rotationDeg?: number;
      sizeVariant?: number;
    },
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (!state.selectedAdditions.includes(id))
      return { error: 'NOT_FOUND' as const };
    const current = state.additionOffsets[id];
    if (!current) return { error: 'NOT_FOUND' as const };
    const catalogId = normalizeAdditionBaseId(id);
    const addition = data.additions.find((item) => item.id === catalogId);
    if (!addition) return { error: 'CATALOG_CHANGED' as const };
    if (
      patch.sizeVariant !== undefined &&
      (!Number.isInteger(patch.sizeVariant) ||
        patch.sizeVariant < 1 ||
        patch.sizeVariant > Math.max(addition.sizes?.length ?? 0, 1))
    )
      return { error: 'INVALID_SIZE_VARIANT' as const };
    if (patch.scale !== undefined && (patch.scale < 0.1 || patch.scale > 3))
      return { error: 'INVALID_SCALE' as const };
    if (
      patch.rotationDeg !== undefined &&
      (patch.rotationDeg < -180 || patch.rotationDeg > 180)
    )
      return { error: 'INVALID_ROTATION' as const };
    const { rotationDeg, ...rest } = patch;
    state.setAdditionOffset(id, {
      ...rest,
      ...(rotationDeg !== undefined
        ? { rotationZ: (rotationDeg * Math.PI) / 180 }
        : {}),
    });
    state.setSelectedAdditionId(id);
    return { data: this.read() };
  },
  getInscriptionCapabilities() {
    const state = useHeadstoneStore.getState();
    const stencil = isStainlessHeadstoneProduct(state.productId, state.catalog);
    return {
      productId: state.productId,
      catalogLoaded: Boolean(
        state.catalog && state.catalog.product.id === state.productId,
      ),
      fonts: data.fonts
        .filter((font) =>
          stencil ? font.category === 'stencil' : font.category !== 'stencil',
        )
        .map((font) => font.name),
      canChangeColor: state.showInscriptionColor,
      selectedSurface:
        state.selected === 'base' || state.selected === 'ledger'
          ? state.selected
          : 'headstone',
      sizeMm: { min: 5, max: 1200 },
      rotationDeg: { min: -45, max: 45 },
    };
  },
  read() {
    const state = useHeadstoneStore.getState();
    return {
      snapshot: captureDesignSnapshot(),
      selectedInscriptionId: state.selectedInscriptionId,
      catalogLoaded: Boolean(
        state.catalog && state.catalog.product.id === state.productId,
      ),
      productConfigurationReady: Boolean(
        state.productId &&
          state.productConfigurationReadyId === state.productId,
      ),
      quote: calculateEstimatedDesignPricing(state),
    };
  },
  updateInscription(
    id: string,
    patch: InscriptionPatch,
    expectedSnapshot: string,
  ) {
    const state = useHeadstoneStore.getState();
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot) {
      return { error: 'REVISION_CONFLICT' as const };
    }
    if (!state.inscriptions.some((line) => line.id === id)) {
      return { error: 'NOT_FOUND' as const };
    }
    if (
      patch.font &&
      !data.fonts.some(
        (font) =>
          font.name === patch.font &&
          (isStainlessHeadstoneProduct(state.productId, state.catalog)
            ? font.category === 'stencil'
            : font.category !== 'stencil'),
      )
    ) {
      return { error: 'INVALID_FONT' as const };
    }
    if (patch.color && !state.showInscriptionColor)
      return { error: 'COLOR_UNAVAILABLE' as const };
    state.updateInscription(id, patch);
    if (patch.text !== undefined && state.selectedInscriptionId === id) {
      useHeadstoneStore.getState().setActiveInscriptionText(patch.text);
    }
    return { data: this.read() };
  },
  addInscription(
    text: string,
    target: 'headstone' | 'base' | 'ledger' | undefined,
    expectedSnapshot: string,
  ) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (
      (target === 'base' && !state.showBase) ||
      (target === 'ledger' && !state.showLedger)
    )
      return { error: 'SURFACE_UNAVAILABLE' as const };
    if (target) state.setSelected(target);
    const id = useHeadstoneStore.getState().addInscriptionLine({ text });
    return { id, data: this.read() };
  },
  deleteInscription(id: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    const state = useHeadstoneStore.getState();
    if (!state.inscriptions.some((line) => line.id === id))
      return { error: 'NOT_FOUND' as const };
    state.deleteInscription(id);
    const next = useHeadstoneStore.getState();
    next.setActiveInscriptionText(
      next.inscriptions.find((line) => line.id === next.selectedInscriptionId)
        ?.text ?? '',
    );
    return { data: this.read() };
  },
  selectProduct(productId: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    if (!data.products.some((product) => product.id === productId))
      return { error: 'NOT_FOUND' as const };
    const href = getDesignerProductStepHref('select-shape', productId);
    window.history.pushState(null, '', href);
    return { href, status: 'pending' as const };
  },
  async save(title: string, expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot)
      return { error: 'REVISION_CONFLICT' as const };
    try {
      const saved = await saveDesignerProject(title, expectedSnapshot);
      return { project: saved.project };
    } catch (error) {
      if (error instanceof Error && error.message === 'REVISION_CONFLICT')
        return { error: 'REVISION_CONFLICT' as const };
      throw error;
    }
  },
  async preview(expectedSnapshot: string) {
    if (JSON.stringify(captureDesignSnapshot()) !== expectedSnapshot) {
      return { error: 'REVISION_CONFLICT' as const };
    }
    const prepared = await prepareDesignerPreview();
    if (JSON.stringify(prepared.snapshot) !== expectedSnapshot) {
      return { error: 'REVISION_CONFLICT' as const };
    }
    return { screenshot: prepared.screenshot };
  },
};

export function installDesignerAgentBridge(allowProduction = false) {
  if (process.env.NODE_ENV === 'production' && !allowProduction) return;
  const browser = window as Window & {
    __designerAgentBridge?: typeof designerAgentBridge;
  };
  browser.__designerAgentBridge = designerAgentBridge;
  return () => {
    delete browser.__designerAgentBridge;
  };
}
