'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

interface Props {
  avatarUrl: string | null;
  userId: string;
}

export default function ProfilePhotoForm({ avatarUrl, userId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (e.g., 2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }

      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Delete old avatar if exists
      if (avatarUrl) {
        try {
          const oldPath = new URL(avatarUrl).pathname.split('/').pop();
          if (oldPath) {
            await supabase.storage
              .from('avatars')
              .remove([`${userId}/${oldPath}`]);
          }
        } catch (error) {
          console.warn('Failed to delete old avatar:', error);
        }
      }

      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl }
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPreview(publicUrl + '?v=' + Date.now());
    } catch (error) {
      console.error('Error uploading photo:', error);
      setPreview(avatarUrl);
      alert(error instanceof Error ? error.message : 'Error uploading photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative font-outfit">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
        disabled={isLoading}
      />

      {/* Profile Image */}
      <button
        onClick={handleClick}
        className="group relative h-40 w-40 overflow-hidden rounded-full border-4 border-[#222] bg-[#222] shadow-xl transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        disabled={isLoading}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Profile"
            fill
            className="object-cover transition-opacity duration-200 group-hover:opacity-75"
            sizes="160px"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#333] transition-colors duration-200 group-hover:bg-[#444]">
            <span className="text-4xl font-bold text-zinc-500">
              {userId.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Simple hover text */}
        <div className="absolute inset-0 flex items-center justify-center font-outfit opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            Change Photo
          </span>
        </div>
      </button>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-2 text-center font-outfit text-xs text-zinc-500">
        Click to change • Max 2MB
      </div>
    </div>
  );
}
