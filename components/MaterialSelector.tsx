'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';
import SegmentedControl from './ui/SegmentedControl';

type Material = {
  id: string;
  name: string;
  image: string;
  category: string;
};

type MaterialSelectorProps = {
  materials: Material[];
};

export default function MaterialSelector({ materials }: MaterialSelectorProps) {
  const setHeadstoneMaterialUrl = useHeadstoneStore((s) => s.setHeadstoneMaterialUrl);
  const setBaseMaterialUrl = useHeadstoneStore((s) => s.setBaseMaterialUrl);
  const setIsMaterialChange = useHeadstoneStore((s) => s.setIsMaterialChange);
  const currentHeadstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const currentBaseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const selected = useHeadstoneStore((s) => s.selected);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const setSelected = useHeadstoneStore((s) => s.setSelected);

  // Ensure canvas selection matches editingObject when component mounts
  useEffect(() => {
    if (selected !== editingObject) {
      setSelected(editingObject);
    }
  }, [editingObject, selected, setSelected]);

  // Determine current material URL based on what's being edited
  const currentMaterialUrl = editingObject === 'base' ? currentBaseMaterialUrl : currentHeadstoneMaterialUrl;

  const handleMaterialSelect = (material: Material) => {
    const materialUrl = `/textures/forever/l/${material.image}`;
    setIsMaterialChange(true);
    
    // Apply material to headstone or base depending on what's being edited
    if (editingObject === 'base') {
      setBaseMaterialUrl(materialUrl);
    } else {
      setHeadstoneMaterialUrl(materialUrl);
    }
    
    // Ensure selection is maintained after material change
    setSelected(editingObject);
    
    setTimeout(() => setIsMaterialChange(false), 100);
  };

  return (
    <div className="space-y-3">
      {/* Headstone/Base Toggle */}
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
      
      <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-2 custom-scrollbar">
        {materials.map((material) => {
          const materialUrl = `/textures/forever/l/${material.image}`;
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
