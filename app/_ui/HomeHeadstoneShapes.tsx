'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { data } from '#/app/_internal/_data';
import { getDesignerProductStepHref } from '#/lib/designer-product-routes';
import {
  BLUE_PEARL_TEXTURE,
  LASER_ETCHED_BLACK_GRANITE_TEXTURE,
  SHAPES_BASE,
} from '#/lib/headstone-constants';

const featuredShapes = [
  { id: '38', label: 'Heart-Shaped Headstone' },
  { id: '10', label: 'Serpentine-Shaped Headstone' },
  { id: '55', label: 'Butterfly-Shaped Headstone' },
  { id: '56', label: 'Pentagon-Shaped Headstone' },
  { id: '36', label: 'Cross-Shaped Headstone' },
];

export default function HomeHeadstoneShapes() {
  const [productId, setProductId] = useState('4');
  const designerHref = getDesignerProductStepHref('select-shape', productId);
  const textureUrl = productId === '124'
    ? BLUE_PEARL_TEXTURE
    : LASER_ETCHED_BLACK_GRANITE_TEXTURE;

  return (
    <section
      aria-labelledby="home-headstone-shapes-heading"
      className="border-y border-white/10 bg-[#141311] py-12 day:border-[#e2dad0] day:bg-[#f8f6f0] sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id="home-headstone-shapes-heading"
            className="font-serif text-3xl font-normal text-white day:text-[#1d1a17] sm:text-4xl"
          >
            Popular Headstone Shapes
          </h2>
          <label className="flex flex-wrap items-center gap-2 text-sm text-white/75 day:text-[#625a51]">
            Engraving style
            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="min-h-10 rounded-sm border border-white/20 bg-[#141311] pr-9 pl-3 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cfac6c] day:border-[#beb4a5] day:bg-white day:text-[#1d1a17]"
            >
              <option value="4">Laser Etched</option>
              <option value="124">Traditional Engraved</option>
            </select>
          </label>
        </div>
        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {featuredShapes.map(({ id, label }) => {
            const shape = data.shapes.find((item) => item.id === id);
            if (!shape) return null;

            return (
              <li key={id}>
                <Link
                  href={`${designerHref}?shapeId=${id}`}
                  prefetch={false}
                  className="group block h-full overflow-hidden rounded-sm border border-white/15 hover:border-[#cfac6c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cfac6c] day:border-[#d5c9b7] day:bg-white day:hover:border-[#8a651f] day:focus-visible:outline-[#8a651f]"
                >
                  <div className="relative aspect-[4/3] bg-[#e8e2d5]">
                    <div
                      aria-hidden="true"
                      className="absolute inset-4 bg-cover bg-center mask-contain mask-center mask-no-repeat sm:inset-6"
                      style={{
                        backgroundImage: `url("${textureUrl}")`,
                        maskImage: `url("${SHAPES_BASE}${shape.image}")`,
                      }}
                    />
                  </div>
                  <div className="px-3 py-3 sm:px-4">
                    <h3 className="font-serif text-xl text-white day:text-[#1d1a17]">
                      {label}
                    </h3>
                    <span className="mt-1 flex items-center gap-1.5 text-sm text-[#e6cb8b] group-hover:underline day:text-[#78541c]">
                      Customize in 3D
                      <ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
