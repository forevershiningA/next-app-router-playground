import type { Metadata } from 'next';
import HomeGallery from '#/app/_ui/HomeGallery';
import HomeFooter from '#/app/_ui/HomeFooter';
import MemorialPublicHeader from '#/components/MemorialPublicHeader';
import categories from '#/app/_internal/home-gallery.json';

export const metadata: Metadata = {
  title: 'Memorial Gallery | Forever Shining',
  description:
    'Explore headstones, plaques, full monuments, urns, and pet memorials created by Forever Shining. Browse photos by category and find inspiration for a personal tribute.',
  alternates: { canonical: 'https://forevershining.org/memorials/gallery' },
  openGraph: {
    title: 'Memorial Gallery | Forever Shining',
    description:
      'Browse memorial photos and find inspiration for a personal tribute.',
    url: 'https://forevershining.org/memorials/gallery',
    type: 'website',
    images: [
      { url: '/gallery/headstones-001.webp', alt: 'Tufaanatu Niuia headstone' },
    ],
  },
};

export default async function MemorialGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  const initialCategory =
    categories.find((group) => group.id === category)?.id ?? 'all';
  return (
    <>
      <MemorialPublicHeader activeType="gallery" />
      <main id="main-content">
        <HomeGallery
          key={initialCategory}
          standalone
          initialCategory={initialCategory}
        />
      </main>
      <HomeFooter />
    </>
  );
}
