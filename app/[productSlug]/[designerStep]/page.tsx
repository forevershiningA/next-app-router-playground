import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ShapeSelectionPage from '#/app/select-shape/page';
import MaterialSelectionPage from '#/app/select-material/page';
import SelectBorderPage from '#/app/select-border/page';
import SelectFasteningPage from '#/app/select-fastening/page';
import InscriptionsPage from '#/app/inscriptions/page';
import SelectAdditionsPage from '#/app/select-additions/page';
import SelectMotifsPage from '#/app/select-motifs/page';
import SelectImagesPage from '#/app/select-images/page';
import SelectEmblemsPage from '#/app/select-emblems/page';
import CheckPricePage from '#/app/check-price/page';
import DesignMenuPage from '#/app/design-menu/page';
import {
  buildDesignerStepMetadata,
  getDesignerProductBySlug,
} from '#/lib/designer-product-routes';
import {
  isDesignerStepSlug,
  type DesignerStepSlug,
} from '#/lib/designer-route-state';

type ProductDesignerStepPageProps = {
  params: Promise<{
    productSlug: string;
    designerStep: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductDesignerStepPageProps): Promise<Metadata> {
  const { productSlug, designerStep } = await params;
  const product = getDesignerProductBySlug(productSlug);

  if (!product || !isDesignerStepSlug(designerStep)) {
    return {};
  }

  return buildDesignerStepMetadata(product.id, designerStep);
}

export default async function ProductDesignerStepPage({
  params,
}: ProductDesignerStepPageProps) {
  const { productSlug, designerStep } = await params;
  const product = getDesignerProductBySlug(productSlug);

  if (!product || !isDesignerStepSlug(designerStep)) {
    notFound();
  }

  switch (designerStep satisfies DesignerStepSlug) {
    case 'select-shape':
      return <ShapeSelectionPage />;
    case 'select-border':
      return <SelectBorderPage />;
    case 'select-fastening':
      return <SelectFasteningPage />;
    case 'select-material':
      return <MaterialSelectionPage />;
    case 'select-size':
      return null;
    case 'inscriptions':
      return <InscriptionsPage />;
    case 'select-images':
      return <SelectImagesPage />;
    case 'select-additions':
      return <SelectAdditionsPage />;
    case 'select-emblems':
      return <SelectEmblemsPage />;
    case 'select-motifs':
      return <SelectMotifsPage />;
    case 'check-price':
      return <CheckPricePage />;
    case 'design-menu':
      return <DesignMenuPage />;
    case 'select-product':
      notFound();
  }
}
