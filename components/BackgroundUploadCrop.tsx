'use client';

import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { useHeadstoneStore } from '#/lib/headstone-store';

interface BackgroundUploadCropProps {
  onClose: () => void;
}

function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        0.92
      );
    };
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = imageSrc;
  });
}

export default function BackgroundUploadCrop({ onClose }: BackgroundUploadCropProps) {
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const setHeadstoneMaterialUrl = useHeadstoneStore((s) => s.setHeadstoneMaterialUrl);
  const setIsMaterialChange = useHeadstoneStore((s) => s.setIsMaterialChange);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Plaque aspect ratio — landscape if width > height
  const isLandscape = widthMm > heightMm;
  const aspectRatio = isLandscape
    ? widthMm / heightMm
    : widthMm / heightMm;

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      const filename = `bg_custom_${Date.now()}`;
      formData.append('upload', croppedBlob, `${filename}.jpg`);
      formData.append('filename', filename);
      formData.append('color', '1');

      const res = await fetch('/api/upload/image', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.result === 1 && data.path) {
        setIsMaterialChange(true);
        setHeadstoneMaterialUrl(data.path);
        setTimeout(() => setIsMaterialChange(false), 100);
        onClose();
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // File picker stage
  if (!imageSrc) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6">
          <h2 className="mb-4 text-center text-lg font-semibold text-white">Upload Background Image</h2>
          <p className="mb-6 text-center text-sm text-gray-400">
            Choose a photo to use as your plaque background. It will be cropped to
            {isLandscape ? ' landscape' : ' portrait'} ratio ({widthMm}×{heightMm}mm).
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl bg-[#DEBD68] py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#d7b356]"
          >
            Choose Photo
          </button>
          <button
            onClick={onClose}
            className="mt-3 w-full rounded-xl border border-white/10 py-3 text-sm text-gray-400 transition hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Crop stage
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <button
          onClick={() => setImageSrc(null)}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back
        </button>
        <h2 className="text-sm font-semibold text-white">
          Crop Background ({isLandscape ? 'Landscape' : 'Portrait'})
        </h2>
        <button
          onClick={handleApply}
          disabled={uploading}
          className="rounded-lg bg-[#DEBD68] px-4 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-[#d7b356] disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Apply'}
        </button>
      </div>

      {/* Crop area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={true}
          style={{
            containerStyle: { background: '#111' },
            cropAreaStyle: { border: '2px solid #DEBD68' },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3 border-t border-white/10 px-6 py-3">
        <span className="text-xs text-gray-500">−</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="h-1 flex-1 appearance-none rounded-full bg-white/20 accent-[#DEBD68]"
        />
        <span className="text-xs text-gray-500">+</span>
      </div>
    </div>
  );
}
