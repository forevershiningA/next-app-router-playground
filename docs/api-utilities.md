# Utility Functions Reference

Function-level documentation for all exported utilities in `lib/`.

---

## XML Parsing (`lib/xml-parser.ts`)

### `parseCatalogXML(xmlText: string, productId: string): Promise<CatalogData>`
Parses full catalog XML for a product, extracting shapes, additions, price models (base, ledger, kerbset). Caches results.

### `parsePriceModel(priceModelEl: Element): PriceModel`
Parses XML price model element to extract id, code, name, quantity type, currency, and price tiers.

### `calculatePrice(priceModel: PriceModel, quantity: number): number`
Calculates price based on formula (e.g., `"410.00+0.78($q-600)"`) and applies retail multiplier.

### `fetchAndParseInscriptionDetails(inscriptionId: string): Promise<InscriptionDetails | undefined>`
Fetches inscriptions XML and parses product details including price model and size constraints. Caches results.

---

## Motif Pricing (`lib/motif-pricing.ts`)

### `fetchAndParseMotifPricing(productType: 'engraved' | 'laser' | 'bronze'): Promise<MotifProductData | null>`
Fetches and parses motif pricing XML by product type. Extracts price tiers and size limits.

### `calculateMotifPrice(heightMm: number, color: string, priceModel: MotifPriceModel, isLaser?: boolean): number`
Calculates motif price based on height, color (gold/silver → premium tier), and product pricing. Free for laser products.

---

## Image Pricing (`lib/image-pricing.ts`)

### `fetchImagePricing(locale?: string): Promise<ImagePricingMap>`
Fetches and caches image pricing XML. Builds map of product ID to pricing models by locale.

### `calculateImagePrice(product: ImageProduct | undefined, widthMm: number, heightMm: number, colorMode?: 'full' | 'bw' | 'sepia'): number`
Calculates image price based on dimensions and color mode. Resolves quantity (width+height, width×height, or units).

---

## Price Display Helpers (`lib/check-price-utils.ts`)

### `getShapeNameFromUrl(shapeUrl: string | null | undefined): string`
Extracts human-readable shape name from SVG URL path (e.g., `"oval-landscape"` → `"oval landscape"`).

### `getCheckPriceMaterialName(url: string | null | undefined): string`
Maps material/texture URL to display name. Handles bronze materials with numbered lookup.

### `formatMmAsImperial(mm: number): string`
Converts millimeters to imperial format with fractions (e.g., `101.6mm` → `4"`).

### `loadCatalogForProduct(productId: string): Promise<CatalogData | null>`
Loads catalog XML for a product from `/xml/catalog-id-{productId}.xml`.

---

## Design Loading (`lib/saved-design-loader-utils.ts`)

### `loadSavedDesignIntoEditor(designData: SavedDesignData, designId: string, options?: LoadDesignOptions): Promise<{inscriptionsLoaded, motifsLoaded}>`
Loads a legacy saved design into the DYO editor. Converts pixel coordinates to mm, maps shapes, loads inscriptions and motifs with proper positioning.

### `loadCanonicalDesignIntoEditor(designData: CanonicalDesignData, options?: LoadDesignOptions): Promise<void>`
Loads v2026+ canonical design JSON directly. Handles p3d-specific coordinates, auto-center layout, texture mapping for monument components.

### `fetchCanonicalDesign(designId: string): Promise<CanonicalDesignData | null>`
Fetches canonical design JSON. Tries p3d variant first, then falls back to main rollout directory.

### `resolveCanonicalLoadPolicy(designData: CanonicalDesignData, fallbackReason?: string): Promise<CanonicalLoadPolicyDecision>`
Determines whether to load canonical or legacy fallback based on confidence and skipped-ID status.

### `anonymizeDesignData(designData: SavedDesignData): SavedDesignData`
Replaces names and dates in inscriptions with placeholders for privacy.

### `checkForDuplicates(designData: SavedDesignData, existingDesigns: SavedDesignData[]): boolean`
Checks if design is >80% similar to existing designs based on inscription text overlap.

---

## Project Serialization (`lib/project-serializer.ts`)

### `captureDesignSnapshot(): DesignerSnapshot`
Captures complete design state from Zustand store. Serializes inscriptions and deep clones all collections.

### `applyDesignSnapshot(snapshot: DesignerSnapshot): Promise<void>`
Applies snapshot to store. Loads product catalog and hydrates inscription refs. Restores all design properties.

---

## Design Loader (`lib/design-loader.ts`)

### `getDesignsByProductType(productType: string): Promise<Design[]>`
Fetches and caches design data from `/data/designs/{productType}.json`.

### `getDesignById(id: string, productType?: string): Promise<Design | null>`
Finds design by ID. Searches specific product type or all types via index.

### `getAllProductTypes(): Promise<Array<{type: string, count: number}>>`
Fetches product types from `/data/designs/index.json`.

---

## Addition Utilities (`lib/addition-utils.ts`)

### `normalizeAdditionBaseId(instanceId: string): string`
Strips timestamp suffix from instance ID (e.g., `"addition_1234567"` → `"addition"`).

### `clampValue(value: number, min: number, max: number): number`
Clamps value between min and max.

### `getBoundsCenter(bounds: BoundsLike): {x, y, z}`
Calculates center point of a 3D bounding box.

### `getHeadstoneCenterXY(bounds: BoundsLike): XYCenter`
Returns X,Y center of bounding box (ignores Z).

### `getInteractionClampBounds(bounds: BoundsLike, inset?, depthInsetRatio?, maxDepthInset?, yInsetRatio?): InteractionClampBounds`
Calculates inset bounds for interaction constraints with custom Y inset ratio.

### `convertPointBetweenMeshLocals(point: Vector3, fromMesh: Object3D, toMesh: Object3D): Vector3`
Converts a point from one mesh's local space to another's via world space.

### `getMeshBoundingBox(mesh: Mesh): Box3 | null`
Gets bounding box of a mesh. Computes if not already cached.

### `sampleBaseSurfaceMetrics(baseMesh: Mesh, headstoneMesh: Mesh): BaseSurfaceSamples | null`
Samples base surface Z and headstone depth range for placement constraints.

### `clampDepthWithinRange(zValue: number, range: DepthRange, halfDepth: number, headFrontZ: number, padding: number): number`
Clamps Z value within safe depth range accounting for clearance.

---

## Material Utilities (`lib/material-utils.ts`)

### `resolveMaterialAssetPath(value: string | null | undefined, basePath: string): string | null`
Resolves material asset path. Handles legacy filenames, converts `.jpg` to `.webp`, normalizes paths.

### `getMaterialNameFromUrl(url: string | null | undefined): string`
Extracts human-readable material name from URL. Removes extension and converts hyphens to spaces.

---

## Product Utilities (`lib/product-utils.ts`)

### `getProductFromId(productId: number | string): Product | null`
Looks up product by ID from product data.

### `getProductSlug(product: Product): string`
Generates URL-friendly slug from product name.

### `getProductType(product: Product): 'headstone' | 'plaque' | 'monument'`
Determines product type from name keywords.

### `getProductTypeCategory(product: Product): string`
Returns detailed category (e.g., `"bronze-plaque"`, `"laser-headstone"`).

### `getProductTypeFromId(productId: number | string): 'headstone' | 'plaque' | 'monument' | null`
Fast lookup of product type by ID using static map.

---

## SVG Generation (`lib/svg-generator.ts`)

### `generateDesignSVG(options: SVGGeneratorOptions): Promise<string>`
Generates complete SVG for a saved design. Overlays inscriptions/motifs on stone shape with texture.

### `buildUniversalMapping(authoring: AuthoringInfo, container: ContainerInfo, stone: StoneInfo): MappingResult`
Builds two-stage transform (authoring → design space → display). Returns mapping functions for inscriptions/motifs.

### `decodeHtmlEntities(str: string): string`
Decodes HTML entities (`&apos;`, `&rsquo;`, `&amp;`, etc.).

### `computeUniformScale(vp: Viewport, au: Authoring): Transform`
Computes uniform scale factor from authoring to viewport dimensions.

### `mapXY(authX: number, authY: number, t: Transform): {x, y}`
Maps authoring coordinates to display space using transform.

### `mapSize(sizeAuthPx: number, t: Transform): number`
Scales a size value using transform scale factor.

---

## SVG Cache (`lib/svg-cache.ts`)

### `getOrGenerateSVG(options: CachedSVGOptions): Promise<string>`
Gets SVG from cache if fresh (<24h), else generates new SVG and saves to cache.

### `handleSVGRequest(options: CachedSVGOptions): Promise<string>`
API handler wrapper for SVG generation.

### `clearExpiredCache(): Promise<void>`
Recursively scans cache directory and deletes expired SVG files.

### `getCacheStats(): Promise<{totalFiles, freshFiles, expiredFiles, totalSize}>`
Returns cache statistics.

---

## PDF Generator (`lib/pdf-generator.ts`)

### `generateDesignPDF(design: DesignPDFData): Promise<void>`
Generates A4 PDF with design screenshot, title, price, description, and quote table. Triggers browser download.

---

## Screenshot Crop (`lib/screenshot-crop.ts`)

### `analyzeImageForCrop(imageUrl: string, threshold?: number): Promise<CropBounds>`
Analyzes image edges for white space. Returns crop bounds if threshold exceeded.

### `applyCropToCoordinates(x: number, y: number, cropBounds: CropBounds): {x, y}`
Adjusts coordinates from original image space to cropped space.

### `calculateCroppedScalingFactors(canvasWidth: number, canvasHeight: number, cropBounds: CropBounds, upscaleFactor?: number): ScalingFactors`
Computes scaling and offset for applying crop.

---

## Mask Metrics (`lib/mask-metrics.ts`)

### `fetchMaskMetrics(maskUrl: string): Promise<MaskMetrics>`
Loads mask SVG/image, calculates bounding box of non-transparent pixels. Caches result. Returns natural size, bounds, normalized bounds, aspect ratio.

---

## Texture Preloading (`lib/preload-texture.ts`)

### `preloadSceneTexture(inputUrl: string): Promise<void>`
Preloads THREE.js texture via TextureLoader. Caches promise to avoid duplicate loads. Resolves even on failure.

---

## Unit Conversion (`lib/unit-system.ts`)

### `resolveUnitSystemFromCountry(countryCode: string | null | undefined): 'metric' | 'imperial'`
Returns `'imperial'` for US/LR/MM, else `'metric'`.

### `parseUnitSystemCookie(cookieHeader: string | null | undefined): 'metric' | 'imperial' | null`
Parses `unit_system` cookie value.

### `formatImperialFromMm(mm: number): string`
Converts mm to imperial format with fractions (e.g., `4 3/16"`).

### `formatLengthFromMm(mm: number, unitSystem: 'metric' | 'imperial'): string`
Formats single dimension in requested unit system.

### `formatDimensionPair(widthMm: number, heightMm: number, unitSystem: 'metric' | 'imperial'): string`
Formats width × height pair.

### `formatDimensionTriplet(widthMm: number, heightMm: number, depthMm: number, unitSystem: 'metric' | 'imperial'): string`
Formats width × height × depth triplet.

---

## Validation (`lib/validation.ts`)

### `sanitizeFilePath(input: string): string`
Removes all non-alphanumeric characters except underscore and hyphen.

### `validateAdditionId(id: string): string`
Sanitizes addition ID. Throws if result is empty.

### `validateXMLContent(xmlText: string): void`
Throws error if XML contains `<!ENTITY` or `<!DOCTYPE...SYSTEM` (XXE/XXS prevention).

### `clamp(value: number, min: number, max: number): number`
Clamps number between min/max.

### `safeParseInt(value: string | null, defaultValue: number): number`
Safely parses string to int. Returns default if invalid.

### `safeParseFloat(value: string | null, defaultValue: number): number`
Safely parses string to float. Returns default if invalid.

---

## Logging (`lib/logger.ts`)

### `logger.log(...args: any[]): void`
Logs to console in development only.

### `logger.warn(...args: any[]): void`
Warns in development only.

### `logger.error(...args: any[]): void`
Always logs errors (production + dev).

### `logger.info(...args: any[]): void`
Info in development only.

### `logger.debug(...args: any[]): void`
Debug in development only.

---

## Error Handling (`lib/error-handler.ts`)

### `AppError` (class)
Custom error with `message`, `code`, and `context` object.

### `createErrorHandler(onError?: ErrorHandler): ErrorHandler`
Creates error handler that logs in dev and calls custom handler.

---

## Idle Detection (`lib/idle-utils.ts`)

### `requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): number`
Requests idle callback with `setTimeout` fallback for unsupported browsers.

### `cancelIdleCallback(id: number): void`
Cancels idle callback. Uses `clearTimeout` as fallback.

### `runWhenIdle<T>(fn: () => T | Promise<T>, timeout?: number): Promise<T>`
Runs function when browser is idle. Default timeout: 2000ms.

### `runWhenVisible(element: Element | null, callback: () => void, options?: IntersectionObserverInit): () => void`
Runs callback when element enters viewport. Returns cleanup function.

### `runWhenVisibleAndIdle(element: Element | null, fn: () => void | Promise<void>, idleTimeout?: number): () => void`
Combines visibility + idle checks. Runs when both conditions met.

---

## Granite Material (`lib/granite-material.ts`)

### `configureGraniteTexture(texture: THREE.Texture, options: GraniteTextureOptions): void`
Configures THREE texture wrapping, color space, repeat, anisotropy.

### `createPolishedGraniteMaterial(options: PolishedGraniteMaterialOptions): THREE.MeshPhysicalMaterial`
Creates THREE physical material with polished granite properties (clearcoat, low roughness).

---

## Localization (`lib/localization.ts`)

### `getRegionFromMlDir(mlDir: string): Region`
Maps mlDir names to regions (`forevershining` → `AU`, `bronze-plaque` → `US`, etc.).

### `mmToInches(mm: number): number`
Converts millimeters to inches, rounded to 1 decimal.

### `formatDimension(mm: number, region: Region): string`
Formats dimension with unit based on region.

### `formatDimensionRange(minMm: number, maxMm: number, region: Region): string`
Formats dimension range with region-appropriate units.

### `formatPrice(amount: number, region: Region): string`
Formats price with currency symbol and code.

### `getShippingInfo(region: Region, productType: string): string`
Returns region/product-specific shipping text.

### `getLeadTime(region: Region, isLaser: boolean, isBronze: boolean): string`
Returns production timeline text.
