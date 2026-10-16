import { calculateImagePrice, type ImagePricingMap } from './image-pricing';
import {
  getFlexibleImageBounds,
  getImageSizeOption,
  isFlexibleImageType,
} from './image-size-config';
import type { DesignerSnapshot } from './project-schemas';

const money = (value: number) => Math.round(value * 100) / 100;

function positiveNumber(value: number, field: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
}

export function calculateAuthoritativeImagePrice(
  images: DesignerSnapshot['selectedImages'],
  pricing: ImagePricingMap,
): number {
  return money(
    (images ?? []).reduce((total, image) => {
      const product = pricing[String(image.typeId)];
      if (!product) {
        throw new Error(`Image type ${image.typeId} is unavailable`);
      }

      let width: number;
      let height: number;

      if (isFlexibleImageType(image.typeId)) {
        const bounds = getFlexibleImageBounds(image.typeId);
        width = positiveNumber(image.widthMm, 'image width');
        height = positiveNumber(image.heightMm, 'image height');
        if (
          !bounds ||
          width < bounds.minHeight ||
          width > bounds.maxHeight ||
          height < bounds.minHeight ||
          height > bounds.maxHeight
        ) {
          throw new Error(`Invalid size for image type ${image.typeId}`);
        }
      } else {
        const size = getImageSizeOption(image.typeId, image.sizeVariant);
        if (!size) {
          throw new Error(`Image size for type ${image.typeId} is unavailable`);
        }
        width = size.width;
        height = size.height;
      }

      return (
        total + calculateImagePrice(product, width, height, image.colorMode)
      );
    }, 0),
  );
}
