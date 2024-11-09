'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

interface Props {
  avatarUrl: string | null;
  userId: string;
}

export default function ProfilePhotoForm({ avatarUrl, userId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
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

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`; // Add timestamp to prevent caching issues
      const filePath = `${userId}/${fileName}`;

      // First, try to delete the old avatar if it exists
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
          // Continue with upload even if delete fails
        }
      }

      // Upload new file
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type // Explicitly set content type
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl }
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      // Force refresh the preview with the new URL
      setPreview(publicUrl + '?v=' + Date.now());
    } catch (error) {
      console.error('Error uploading photo:', error);
      setPreview(avatarUrl); // Reset preview on error
      alert(
        error instanceof Error
          ? error.message
          : 'Error uploading photo. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Add delete functionality
  const handleDelete = async () => {
    try {
      setIsLoading(true);

      if (avatarUrl) {
        const oldFilePath = new URL(avatarUrl).pathname.split('/').pop();
        if (oldFilePath) {
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${oldFilePath}`]);
        }
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPreview(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      title="Profile Photo"
      description="Upload or update your profile photo."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <p className="pb-4 sm:pb-0">
            Supported formats: JPG, PNG, GIF (max 2MB)
          </p>
          <div className="flex gap-2">
            {preview && (
              <Button
                variant="slim"
                onClick={handleDelete}
                loading={isLoading}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                Remove
              </Button>
            )}
            <label className="relative">
              <Button
                variant="slim"
                loading={isLoading}
                className="cursor-pointer"
                disabled={isLoading}
              >
                {preview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </label>
          </div>
        </div>
      }
    >
      <div className="mb-4 mt-8">
        {preview ? (
          <div className="relative h-32 w-32 overflow-hidden rounded-full">
            <Image
              src={preview}
              alt="Profile"
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-zinc-800">
            <span className="text-4xl text-zinc-400">
              {userId.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
