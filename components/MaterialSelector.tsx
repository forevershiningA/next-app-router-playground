'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useHeadstoneStore, type Material as MaterialOption } from '#/lib/headstone-store';
import SegmentedControl from './ui/SegmentedControl';
import { bronzes } from '#/app/_internal/_data';
import { resolveMaterialAssetPath } from '#/lib/material-utils';
import BackgroundUploadCrop from './BackgroundUploadCrop';

type MaterialSelectorProps = {
  materials: MaterialOption[];
  disableInternalScroll?: boolean;
};

export default function MaterialSelector({ materials, disableInternalScroll = false }: MaterialSelectorProps) {
  const setHeadstoneMaterialUrl = useHeadstoneStore((s) => s.setHeadstoneMaterialUrl);
  const setBaseMaterialUrl = useHeadstoneStore((s) => s.setBaseMaterialUrl);
  const setLedgerMaterialUrl = useHeadstoneStore((s) => s.setLedgerMaterialUrl);
  const setKerbsetMaterialUrl = useHeadstoneStore((s) => s.setKerbsetMaterialUrl);
  const setIsMaterialChange = useHeadstoneStore((s) => s.setIsMaterialChange);
  const currentHeadstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const currentBaseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const currentLedgerMaterialUrl = useHeadstoneStore((s) => s.ledgerMaterialUrl);
  const currentKerbsetMaterialUrl = useHeadstoneStore((s) => s.kerbsetMaterialUrl);
  const selected = useHeadstoneStore((s) => s.selected);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const showLedger = useHeadstoneStore((s) => s.showLedger);
  const showKerbset = useHeadstoneStore((s) => s.showKerbset);
  const isPlaque = catalog?.product.type === 'plaque';
  const isBronzePlaque = productId === '5';
  const isFullColourPlaque = productId === '32';
  const isFullMonument = catalog?.product.type === 'full-monument';
  const [bgTab, setBgTab] = React.useState<'background' | 'color'>('background');
  const [showCrop, setShowCrop] = useState(false);

  const buildTextureUrl = (material: MaterialOption) => {
    const basePath = isBronzePlaque ? '/textures/phoenix/l/' : '/textures/forever/l/';
    return (
      resolveMaterialAssetPath(material.textureUrl, basePath) ??
      resolveMaterialAssetPath(material.image, basePath)
    );
  };

  const buildThumbnailUrl = (material: MaterialOption, fallbackTexture: string | null) => {
    const basePath = isBronzePlaque ? '/textures/phoenix/l/' : '/textures/forever/l/';
    const thumb = resolveMaterialAssetPath(material.thumbnailUrl, basePath);
    if (thumb) {
      return thumb;
    }
    return fallbackTexture;
  };

  // Use bronze materials for Bronze Plaque (id 5), otherwise use regular materials
  const displayMaterials = useMemo(() => {
    if (isBronzePlaque) {
      return bronzes.map(b => ({
        id: b.id,
        name: b.name,
        image: b.image,
        category: 'bronze'
      }));
    }
    if (isFullColourPlaque) {
      return materials.filter(m => m.category === bgTab);
    }
    return materials;
  }, [isBronzePlaque, isFullColourPlaque, materials, bgTab]);

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
  const currentMaterialUrl =
    editingObject === 'base'
      ? currentBaseMaterialUrl
      : editingObject === 'ledger'
        ? currentLedgerMaterialUrl
        : editingObject === 'kerbset'
          ? currentKerbsetMaterialUrl
          : currentHeadstoneMaterialUrl;

  const targetOptions = useMemo(() => {
    if (isPlaque) {
      return [{ label: 'Headstone', value: 'headstone' }];
    }

    const options: { label: string; value: string }[] = [
      { label: 'Headstone', value: 'headstone' },
    ];

    if (showBase) {
      options.push({ label: 'Base', value: 'base' });
    }
    if (isFullMonument && showLedger) {
      options.push({ label: 'Ledger', value: 'ledger' });
    }
    if (isFullMonument && showKerbset) {
      options.push({ label: 'Kerbset', value: 'kerbset' });
    }

    return options;
  }, [isFullMonument, isPlaque, showBase, showKerbset, showLedger]);

  const handleMaterialSelect = (material: MaterialOption) => {
    const materialUrl = buildTextureUrl(material);
    if (!materialUrl) {
      return;
    }

    setIsMaterialChange(true);
    const targetObject = isPlaque ? 'headstone' : editingObject;

    if (targetObject === 'base') {
      setBaseMaterialUrl(materialUrl);
    } else if (targetObject === 'ledger') {
      setLedgerMaterialUrl(materialUrl);
    } else if (targetObject === 'kerbset') {
      setKerbsetMaterialUrl(materialUrl);
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
              const nextTarget = value as 'headstone' | 'base' | 'ledger' | 'kerbset';
              setEditingObject(nextTarget);
              setSelected(nextTarget);
            }}
            options={targetOptions}
          />
        </div>
      )}

      {isFullColourPlaque && (
        <div className="mb-4">
          <SegmentedControl
            value={bgTab}
            onChange={(value) => setBgTab(value as 'background' | 'color')}
            options={[
              { label: 'Background', value: 'background' },
              { label: 'Color', value: 'color' },
            ]}
          />
        </div>
      )}
      
      <div
        className={`grid grid-cols-3 gap-2 pr-2 ${disableInternalScroll ? '' : 'overflow-y-auto custom-scrollbar'}`}
      >
        {/* Upload Image button — first position in Background tab */}
        {isFullColourPlaque && bgTab === 'background' && (
          <button
            onClick={() => setShowCrop(true)}
            className="relative overflow-hidden cursor-pointer"
            title="Upload Image"
          >
            <div className="relative aspect-square overflow-hidden border-2 border-dashed border-white/20 flex items-center justify-center hover:border-[#D7B356]/50 transition-colors">
              <div className="flex flex-col items-center gap-1">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-[10px] text-gray-400">Upload</span>
              </div>
            </div>
            <div className="p-2 h-12 flex items-center justify-center">
              <div className="text-xs text-center text-slate-200">Upload Image</div>
            </div>
          </button>
        )}

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

      {/* Background Upload + Crop modal */}
      {showCrop && <BackgroundUploadCrop onClose={() => setShowCrop(false)} />}
    </div>
  );
}
