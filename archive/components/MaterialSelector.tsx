'use client';

import React, { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';
import SegmentedControl from './ui/SegmentedControl';
import { bronzes } from '#/app/_internal/_data';

type Material = {
  id: string;
  name: string;
  image: string;
  category: string;
};

type MaterialSelectorProps = {
  materials: Material[];
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

  const handleMaterialSelect = (material: Material) => {
    // Use phoenix textures for Bronze Plaque, forever textures for others
    const materialUrl = isBronzePlaque 
      ? `/textures/phoenix/l/${material.image}`
      : `/textures/forever/l/${material.image}`;
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
          // Use phoenix textures for Bronze Plaque, forever textures for others
          const materialUrl = isBronzePlaque
            ? `/textures/phoenix/l/${material.image}`
            : `/textures/forever/l/${material.image}`;
          const isSelected = currentMaterialUrl === materialUrl;
          
          return (
            <button
              key={material.id}
              onClick={() => handleMaterialSelect(material)}
              className="relative overflow-hidden cursor-pointer"
              title={material.name}
            >
              {/* Material Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={materialUrl}
                  alt={material.name}
                  fill
                  className={`object-cover ${
                    isSelected ? 'border-2 border-[#D7B356]' : ''
                  }`}
                  sizes="100px"
                />
              </div>
              
              {/* Material Name */}
              <div className="p-2 h-12 flex items-center justify-center">
                <div className="text-xs text-slate-200 text-center line-clamp-2">
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
