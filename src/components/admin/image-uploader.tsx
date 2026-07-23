'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadPostImage } from '@/lib/supabase/storage';
import { Button } from '@/components/ui/button';
import type { CoverImagePosition } from '@/lib/post-data';

interface ImageUploaderProps {
  value: string | null;
  onChange: (value: string | null) => void;
  position: CoverImagePosition;
  onPositionChange: (position: CoverImagePosition) => void;
}

const imagePositions: CoverImagePosition[] = ['top', 'center', 'bottom'];

export function ImageUploader({
  value,
  onChange,
  position,
  onPositionChange,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadPostImage(file);
      onChange(url);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Failed to upload image'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="space-y-3">
          <div className="relative aspect-[3/2] w-full max-w-md overflow-hidden rounded-lg border border-rule bg-parchment-dim">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Cover preview"
              className="h-full w-full object-cover"
              style={{ objectPosition: position }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(null)}
              className="absolute right-2 top-2 h-6 w-6 rounded-full bg-parchment text-slate shadow-sm hover:bg-oxblood hover:text-parchment focus-visible:ring-oxblood"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            <span className="font-ui text-sm font-medium text-ink">
              Image position
            </span>
            <div
              className="flex gap-2"
              role="group"
              aria-label="Image position"
            >
              {imagePositions.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={position === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPositionChange(option)}
                  className={
                    position === option
                      ? 'bg-oxblood text-parchment hover:bg-oxblood/90 focus-visible:ring-oxblood'
                      : 'border-rule bg-parchment text-slate hover:bg-parchment-dim hover:text-ink focus-visible:ring-oxblood'
                  }
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`cursor-pointer rounded-lg border-2 border-dashed border-rule bg-parchment-dim px-6 py-8 text-center transition-colors ${
            dragActive ? 'border-oxblood bg-oxblood/5' : 'hover:bg-parchment'
          }`}
        >
          <Upload className="mx-auto h-8 w-8 text-slate" />
          <p className="mt-2 font-ui text-sm text-slate">
            {uploading
              ? 'Uploading…'
              : 'Drag and drop a cover photo, or click to browse'}
          </p>
          <p className="mt-1 font-ui text-xs text-slate">PNG, JPG, WEBP</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
