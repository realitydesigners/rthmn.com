'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface Props {
    avatarUrl: string | null;
    userId: string;
}

export default function ProfilePhotoForm({ avatarUrl, userId }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Update preview when avatarUrl prop changes
    useEffect(() => {
        if (avatarUrl) {
            setPreview(avatarUrl);
        }
    }, [avatarUrl]);

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
                        await supabase.storage.from('avatars').remove([`${userId}/${oldPath}`]);
                    }
                } catch (error) {
                    console.warn('Failed to delete old avatar:', error);
                }
            }

            // Upload new file
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar-${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
                upsert: true,
                contentType: file.type,
            });

            if (uploadError) throw uploadError;

            // Get public URL
            const {
                data: { publicUrl },
            } = supabase.storage.from('avatars').getPublicUrl(filePath);

            // Update user profile
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString(),
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

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        console.error('Failed to load profile image');
        setImageLoading(false);
        setPreview(null);
    };

    return (
        <div className='font-outfit relative h-full w-full'>
            {/* Hidden file input */}
            <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileUpload} disabled={isLoading} />

            {/* Profile Image */}
            <button
                onClick={handleClick}
                className='group relative h-full w-full overflow-hidden rounded-full border-2 border-[#222] bg-[#222] shadow-md transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] sm:shadow-xl'
                disabled={isLoading}>
                {preview ? (
                    <>
                        <Image
                            src={preview}
                            alt='Profile'
                            fill
                            className={`object-cover transition-opacity duration-200 group-hover:opacity-75 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                            sizes='(max-width: 640px) 96px, 112px'
                            priority
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                        {imageLoading && (
                            <div className='flex h-full w-full items-center justify-center bg-[#333]'>
                                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent'></div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className='flex h-full w-full items-center justify-center bg-[#333] transition-colors duration-200 group-hover:bg-[#444]'>
                        <span className='text-2xl font-bold text-zinc-500 sm:text-4xl'>{userId.charAt(0).toUpperCase()}</span>
                    </div>
                )}

                {/* Simple hover text */}
                <div className='font-outfit absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                    <span className='rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:px-4 sm:py-2 sm:text-sm'>Change Photo</span>
                </div>
            </button>

            {/* Loading Overlay */}
            {isLoading && (
                <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm'>
                    <div className='h-6 w-6 animate-spin rounded-full border-b-2 border-white sm:h-8 sm:w-8'></div>
                </div>
            )}

            {/* Help Text - Hidden on very small screens */}
            <div className='font-outfit mt-2 hidden text-center text-xs text-zinc-500 sm:block'>Click to change • Max 2MB</div>
        </div>
    );
}
