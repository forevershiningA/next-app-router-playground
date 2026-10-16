import {
  ArrowsPointingOutIcon,
  CloudArrowUpIcon,
  CircleStackIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlusCircleIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
  SwatchIcon,
  UserCircleIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline';

export const menuGroups = [
  {
    label: 'Setup',
    items: [
      { slug: 'select-product', name: 'Select Product', icon: CubeIcon },
      { slug: 'select-shape', name: 'Select Shape', icon: Squares2X2Icon },
      {
        slug: 'select-border',
        name: 'Select Border',
        icon: RectangleStackIcon,
        requiresBorder: true,
      },
      { slug: 'select-material', name: 'Select Material', icon: SwatchIcon },
      { slug: 'select-size', name: 'Select Size', icon: ArrowsPointingOutIcon },
      {
        slug: 'select-fastening',
        name: 'Fastening Type',
        icon: RectangleStackIcon,
        requiresBronzePlaque: true,
      },
      {
        slug: 'corners',
        name: 'Corners',
        icon: ViewfinderCircleIcon,
        requiresSSPlaque: true,
      },
      {
        slug: 'holes',
        name: 'Holes',
        icon: CircleStackIcon,
        requiresSSPlaque: true,
      },
    ],
  },
  {
    label: 'Design',
    items: [
      {
        slug: 'inscriptions',
        name: 'Add Your Inscriptions',
        icon: DocumentTextIcon,
      },
      { slug: 'select-images', name: 'Add Your Image', icon: PhotoIcon },
      {
        slug: 'select-additions',
        name: 'Select Additions',
        icon: PlusCircleIcon,
        hiddenForPlaque: true,
      },
      {
        slug: 'select-emblems',
        name: 'Select Emblems',
        icon: ShieldCheckIcon,
        requiresBronzePlaque: true,
      },
      { slug: 'select-motifs', name: 'Select Motifs', icon: SparklesIcon },
      { slug: 'check-price', name: 'Check Price', icon: CurrencyDollarIcon },
      { slug: 'save-design', name: 'Save Design', icon: CloudArrowUpIcon },
    ],
  },
  {
    label: 'Account',
    items: [{ slug: 'my-account', name: 'My Account', icon: UserCircleIcon }],
  },
];

export const menuItems = menuGroups.flatMap((group) => group.items);

export const expandableMenuSectionSlugs = new Set([
  'inscriptions',
  'select-additions',
  'select-motifs',
]);

export const guidedQuickNavLabels: Record<string, string> = {
  'select-shape': 'Shape',
  'select-border': 'Border',
  'select-material': 'Material',
  'select-size': 'Size',
  'select-fastening': 'Fastening',
  inscriptions: 'Inscription',
  'select-images': 'Photo',
  'select-additions': 'Additions',
  'select-emblems': 'Emblem',
  'select-motifs': 'Motif',
  'check-price': 'Price',
  'save-design': 'Save',
};

export const fullscreenPanelSlugs = new Set([
  'select-size',
  'select-shape',
  'select-material',
  'select-border',
  'select-fastening',
  'inscriptions',
  'select-images',
  'select-additions',
  'select-emblems',
  'select-motifs',
]);

export const stainlessSteelHeadstoneProductIds = new Set(['1', '23']);

interface MenuItemVisibilityOptions {
  productId: string | null;
  productLaser: string | undefined;
  isPlaque: boolean;
  hasBorder: boolean;
  isStainlessSteelHeadstone: boolean;
  shouldHideMaterialStep: boolean;
}

interface MenuItemVisibilityMetadata {
  slug: string;
  requiresBronzePlaque?: boolean;
  hiddenForPlaque?: boolean;
  requiresSSPlaque?: boolean;
}

export function isMenuItemVisible(
  item: MenuItemVisibilityMetadata,
  {
    productId,
    productLaser,
    isPlaque,
    hasBorder,
    isStainlessSteelHeadstone,
    shouldHideMaterialStep,
  }: MenuItemVisibilityOptions,
) {
  if (item.slug === 'select-material' && shouldHideMaterialStep) return false;
  if (item.slug === 'select-border' && (!isPlaque || !hasBorder)) return false;
  if (
    item.slug === 'select-additions' &&
    (productLaser === '1' || isStainlessSteelHeadstone)
  )
    return false;
  if (item.requiresBronzePlaque && productId !== '5') return false;
  if (item.hiddenForPlaque && isPlaque) return false;
  if (item.requiresSSPlaque && productId !== '52') return false;
  return true;
}

export function getMenuItemDisplayName(
  slug: string,
  name: string,
  productType: string | undefined,
) {
  return slug === 'select-size' && productType === 'headstone'
    ? 'Select Size & Base'
    : name;
}

export function getMaterialMenuLabel({
  canSelectStainlessGraniteBaseMaterial,
  productId,
  isUrn,
  defaultLabel,
}: {
  canSelectStainlessGraniteBaseMaterial: boolean;
  productId: string | null;
  isUrn: boolean;
  defaultLabel: string;
}) {
  if (canSelectStainlessGraniteBaseMaterial) return 'Select Material';
  if (productId === '5' || productId === '32' || isUrn)
    return 'Select Background';
  return defaultLabel;
}

interface GuidedNavigationProductOptions {
  productId: string | null;
  isPlaque: boolean;
  isStainlessSteelHeadstone: boolean;
  hasBorder: boolean;
  shouldHideMaterialStep: boolean;
  productLaser: string | undefined;
}

export function getNavigablePanelSlugs({
  productId,
  isPlaque,
  isStainlessSteelHeadstone,
  hasBorder,
  shouldHideMaterialStep,
  productLaser,
}: GuidedNavigationProductOptions) {
  return menuItems
    .filter((item) => {
      if (item.slug === 'save-design') return true;
      if (!fullscreenPanelSlugs.has(item.slug)) return false;
      if (item.slug === 'select-material' && shouldHideMaterialStep)
        return false;
      if (item.slug === 'select-border' && (!isPlaque || !hasBorder))
        return false;
      if (item.slug === 'select-fastening' && productId !== '5') return false;
      if (
        item.slug === 'select-additions' &&
        (productLaser === '1' || isPlaque || isStainlessSteelHeadstone)
      )
        return false;
      if (
        (item as { requiresBronzePlaque?: boolean }).requiresBronzePlaque &&
        productId !== '5'
      )
        return false;
      return true;
    })
    .map((item) => item.slug);
}

export function getGuidedQuickNavSlugs(navigablePanelSlugs: string[]) {
  const slugs = [...navigablePanelSlugs];
  const saveIndex = slugs.indexOf('save-design');
  slugs.splice(saveIndex >= 0 ? saveIndex : slugs.length, 0, 'check-price');
  return slugs;
}
