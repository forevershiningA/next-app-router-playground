'use client';

import React, { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useHeadstoneStore, type Material as MaterialOption } from '#/lib/headstone-store';
import SegmentedControl from './ui/SegmentedControl';
import { bronzes } from '#/app/_internal/_data';

type MaterialSelectorProps = {
  materials: MaterialOption[];
  disableInternalScroll?: boolean;
};

export default function MaterialSelector({ materials, disableInternalScroll = false }: MaterialSelectorProps) {
  const setHeadstoneMaterialUrl = useHeadstoneStore((s) => s.setHeadstoneMaterialUrl);
  const setBaseMaterialUrl = useHeadstoneStore((s) => s.setBaseMaterialUrl);
  const setIsMaterialChange = useHeadstoneStore((s) => s.setIsMaterialChange);
  const currentHeadstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const currentBaseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const selected = useHeadstoneStore((s) => s.selected);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  const isPlaque = catalog?.product.type === 'plaque';
  const isBronzePlaque = productId === '5';

  const resolveAssetPath = (value: string | null | undefined, basePath: string) => {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    if (value.startsWith('/')) return value;
    return `${basePath}${value}`;
  };

  const buildTextureUrl = (material: MaterialOption) => {
    const basePath = isBronzePlaque ? '/textures/phoenix/l/' : '/textures/forever/l/';
    return (
      resolveAssetPath(material.textureUrl, basePath) ??
      resolveAssetPath(material.image, basePath)
    );
  };

  const buildThumbnailUrl = (material: MaterialOption, fallbackTexture: string | null) => {
    const thumb = resolveAssetPath(material.thumbnailUrl, '/');
    if (thumb) {
      return thumb;
    }
    return fallbackTexture;
  };

  // Use bronze materials for Bronze Plaque (id 5), otherwise use regular materials
  const displayMaterials = useMemo(() => {
    if (isBronzePlaque) {
      // Convert bronzes to Material format
      return bronzes.map(b => ({
        id: b.id,
        name: b.name,
        image: b.image,
        category: 'bronze'
      }));
    }
    return materials;
  }, [isBronzePlaque, materials]);

  // Ensure canvas selection matches editingObject when component mounts
  useEffect(() => {
    if (selected !== editingObject) {
      setSelected(editingObject);
    }
  }, [editingObject, selected, setSelected]);

  useEffect(() => {
    if (isPlaque && editingObject !== 'headstone') {
      setEditingObject('headstone');
      setSelected('headstone');
    }
  }, [editingObject, isPlaque, setEditingObject, setSelected]);

  // Determine current material URL based on what's being edited
  const currentMaterialUrl = editingObject === 'base' ? currentBaseMaterialUrl : currentHeadstoneMaterialUrl;

  const handleMaterialSelect = (material: MaterialOption) => {
    const materialUrl = buildTextureUrl(material);
    if (!materialUrl) {
      return;
    }

    setIsMaterialChange(true);
    const targetObject = isPlaque ? 'headstone' : editingObject;

    if (targetObject === 'base') {
      setBaseMaterialUrl(materialUrl);
    } else {
      setHeadstoneMaterialUrl(materialUrl);
    }

    setSelected(targetObject);
    setEditingObject(targetObject);

    setTimeout(() => setIsMaterialChange(false), 100);
  };

  return (
    <div className="space-y-3">
      {!isPlaque && (
        <div className="mb-4">
          <SegmentedControl
            value={editingObject}
            onChange={(value) => {
              setEditingObject(value as 'headstone' | 'base');
              setSelected(value as 'headstone' | 'base');
            }}
            options={[
              { label: 'Headstone', value: 'headstone' },
              { label: 'Base', value: 'base' },
            ]}
          />
        </div>
      )}
      
      <div
        className={`grid grid-cols-3 gap-2 pr-2 ${disableInternalScroll ? '' : 'overflow-y-auto custom-scrollbar'}`}
      >
        {displayMaterials.map((material) => {
          const textureUrl = buildTextureUrl(material);
          const thumbnailUrl = buildThumbnailUrl(material, textureUrl);
          const isSelected = textureUrl ? currentMaterialUrl === textureUrl : false;
          const coverSrc = thumbnailUrl ?? '/textures/forever/l/Imperial-Red.webp';

          return (
            <button
              key={material.id}
              onClick={() => textureUrl && handleMaterialSelect(material)}
              className="relative overflow-hidden cursor-pointer disabled:cursor-not-allowed"
              title={material.name}
              disabled={!textureUrl}
            >
              {/* Material Image */}
              <div className={`relative aspect-square overflow-hidden ${isSelected ? 'ring-2 ring-[#D7B356]' : ''}`}>
                <Image
                  src={coverSrc}
                  alt={material.name}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              </div>
              
              {/* Material Name */}
              <div className="p-2 h-12 flex items-center justify-center">
                <div className={`text-xs text-center line-clamp-2 ${isSelected ? 'text-[#D7B356]' : 'text-slate-200'}`}>
                  {material.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
