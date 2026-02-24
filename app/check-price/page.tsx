import CheckPriceGrid from './_ui/CheckPriceGrid';
import { fetchImagePricing, type ImagePricingMap } from '#/lib/image-pricing';

export default async function CheckPricePage() {
  let initialImagePricing: ImagePricingMap | null = null;

  try {
    initialImagePricing = await fetchImagePricing();
  } catch (error) {
    console.error('Unable to preload image pricing:', error);
  }

  return <CheckPriceGrid initialImagePricing={initialImagePricing} />;
}
