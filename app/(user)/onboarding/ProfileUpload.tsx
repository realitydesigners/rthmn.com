'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { LuImagePlus, LuUpload } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    onPhotoUpload: (url: string) => void;
}

export default function ProfileUpload({ onPhotoUpload }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

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

            // Convert image to base64 for localStorage
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                localStorage.setItem('avatar_url', base64String);
                onPhotoUpload(base64String);
                router.refresh();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading photo:', error);
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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            const fakeEvent = {
                target: { files: [file] },
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            await handleFileUpload(fakeEvent);
        }
    };

    return (
        <div className='space-y-8'>
            <div className='space-y-2'>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent'>
                    Welcome to Rthmn
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='text-base text-gray-400'>
                    Let's start by adding a profile photo to personalize your experience.
                </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className='flex justify-center py-4'>
                <div className='relative'>
                    {/* Hidden file input */}
                    <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileUpload} disabled={isLoading} />

                    {/* Upload Area */}
                    <div onClick={handleClick} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className='relative'>
                        {/* Main upload button/area */}
                        <motion.div
                            animate={{
                                scale: isDragging ? 1.02 : 1,
                                borderColor: isDragging ? 'rgb(59, 130, 246)' : 'rgb(51, 51, 51)',
                            }}
                            className={`group relative flex h-64 w-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-gradient-to-b from-[#1A1A1A] via-[#141414] to-[#0D0D0D] shadow-2xl transition-all duration-300 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/[0.03] before:to-transparent before:transition-colors ${
                                isDragging ? 'border-blue-500 before:from-blue-500/[0.05]' : 'border-[#333] hover:border-blue-500/50 hover:before:from-white/[0.05]'
                            }`}>
                            <div className='absolute inset-0 rounded-2xl bg-gradient-to-b from-black/0 via-black/5 to-black/20' />
                            <AnimatePresence mode='wait'>
                                {preview ? (
                                    <motion.div key='preview' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='relative z-10 h-full w-full'>
                                        <Image src={preview} alt='Profile' fill className='object-cover' sizes='256px' priority />
                                        {/* Hover overlay with glass effect */}
                                        <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/0 via-black/20 to-black/60 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100'>
                                            <div className='flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md'>
                                                <LuUpload className='h-4 w-4' />
                                                Change Photo
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key='upload'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className='relative z-10 flex flex-col items-center gap-4 p-6 text-center'>
                                        <div className='rounded-full bg-gradient-to-b from-blue-500/30 via-blue-500/10 to-blue-500/5 p-4 transition-colors duration-300 group-hover:from-blue-500/40 group-hover:via-blue-500/20 group-hover:to-blue-500/10'>
                                            <LuImagePlus className='h-8 w-8 text-blue-400' />
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='text-sm font-medium text-white'>Drop your photo here</div>
                                            <div className='text-xs text-gray-500'>or click to browse</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Loading Overlay */}
                        <AnimatePresence>
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className='absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-gradient-to-b from-black/60 via-black/70 to-black/80 backdrop-blur-sm'>
                                    <div className='h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-b-white'></div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* File type info */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className='mt-4 text-center text-xs text-gray-500'>
                        PNG or JPG (max. 2MB)
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
