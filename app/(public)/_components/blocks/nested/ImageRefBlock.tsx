import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { ThemeProps } from '@/app/(public)/_components/blocks/Blocks';

const themeClasses: Record<string, ThemeProps> = {
    'image-standard': {
        textColor: 'text-black',
        isInset: false,
    },
    'image-standard-dark': {
        textColor: 'text-gray-200',
        isInset: false,
    },
    'image-inset': {
        textColor: 'text-gray-200',
        isInset: true,
    },
};

const ImageDisplay = ({ image, alt, className }) => {
    const { isInset } = themeClasses[className] || themeClasses['image-standard'];
    const insetStyles = isInset ? 'border border-t border-gray-600/50' : '';

    return (
        <div className={`relative flex h-auto w-full items-center justify-center overflow-hidden rounded-[1.2em] lg:w-3/4 ${insetStyles}`}>
            <Image src={image} width={2000} height={2000} priority={false} alt={alt} className='h-[325px] w-full object-cover md:h-[600px] lg:h-[800px]' />
        </div>
    );
};

const ArtistInfo = ({ artist, className }) => {
    const { isInset, textColor } = themeClasses[className] || themeClasses['image-standard'];
    const insetStyles = isInset ? 'rounded-b-[1.2em] pl-2 -mt-[60px] pb-3 pt-1 bg-linear-to-t from-black to-transparent' : '';

    return (
        <div className={`relative -bottom-1 flex h-auto w-full pt-4 pl-4 lg:w-3/4 ${textColor} ${insetStyles}`}>
            <Image
                src={artist.image}
                alt={`Cover Image for ${artist.name}`}
                width={100}
                height={100}
                priority={false}
                className='mr-2 max-h-[30px] max-w-[30px] rounded-full border'
            />
            <div className='flex flex-col items-start justify-center text-xs leading-none uppercase'>
                <Link href={`/team/${artist.slug.current}`} className={`text-md pl-1 font-bold`}>
                    {artist.name}
                </Link>
            </div>
            <p className='text-md ml-2 inline-block cursor-pointer font-bold'>→</p>
        </div>
    );
};

const ImageRefCard = ({ title, image, className }) => {
    return (
        <div className='flex flex-col items-center justify-center p-4'>
            <ImageDisplay image={image.image} alt={title} className={className} />
            {image?.team && <ArtistInfo artist={image.team} className={className} />}
        </div>
    );
};

const ImageRefBlock = ({ image, className }) => {
    return (
        <div className={className}>
            <ImageRefCard title={image.title} image={image} className={className} />
        </div>
    );
};

export default React.memo(ImageRefBlock);
