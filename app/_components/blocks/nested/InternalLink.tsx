'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TemplateTheme, ThemeProps } from '@/app/_components/blocks/Blocks';

const themeClasses: Record<TemplateTheme, ThemeProps> = {
    light: {
        textColor: 'text-black',
        backgroundColor: 'bg-gray-300',
        topBackgroundColor: 'bg-gray-200/50',
        buttonTextColor: 'text-gray-200',
        buttonBackgroundColor: 'bg-black hover:bg-black/80',
    },
    dark: {
        textColor: 'bg-linear-to-r from-blue-100/100 to-blue-100/90 text-transparent bg-clip-text transition-color',
        backgroundColor: 'bg-linear-to-r from-blue-200/10 to-blue-200/5 ',
        topBackgroundColor: 'bg-blue-200/5 ',
        buttonTextColor: 'text-blue-100',
        buttonBackgroundColor: 'bg-blue-200/10 hover:bg-blue-200/20',
    },
};

const formatDate = (dateString) => {
    return dateString
        ? new Date(dateString).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'Date not available';
};

const TeamLink = ({ team, theme }) => {
    if (!team) return null;
    const style = themeClasses[theme];

    return (
        <Link href={`/team/${team.slug.current}`}>
            <div className={`flex w-auto items-center p-2 ${style.textColor}`}>
                {team.image && <Image src={team.image} width={100} height={100} priority={true} alt='Team Image' className='h-[30px] max-w-[30px] rounded-[1em] object-cover' />}
                <span className='ml-2 text-sm tracking-wide uppercase'>{team.name || 'no title'}</span>
            </div>
        </Link>
    );
};

const PostPreviewDialog = ({
    isOpen,
    onClose,
    postData,
    theme,
}: {
    isOpen: boolean;
    onClose: () => void;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    postData: any;
    theme: TemplateTheme;
}) => {
    if (!isOpen || !postData) return null;
    const { block = [] } = postData;
    const [content] = block;
    const imageUrl = block[0].imageRef?.imageUrl;

    const style = themeClasses[theme];

    return (
        <div id='popup' className='my-5 w-full items-center justify-center'>
            <div className={`grid w-full grid-cols-1 justify-center rounded-[.7em] p-2 shadow-lg ${style.backgroundColor}`}>
                {content && (
                    <>
                        <div className={`flex h-auto w-full justify-between rounded-[.6em] p-2 ${style.topBackgroundColor} `}>
                            <Image src={imageUrl} alt={'this'} width={100} height={100} className='h-[50px] max-w-[50px] rounded-[.5em] object-cover' />

                            <div className='flex w-full justify-between'>
                                <Link
                                    href={`/posts/${postData.slug.current}`}
                                    className={`${style.textColor} lg:text-md flex w-1/2 items-center pl-4 text-sm leading-[1.3em] font-bold`}>
                                    {content.heading || 'no title'}
                                </Link>
                                <span className={`${style.textColor} mb-2 flex h-auto w-auto items-center pt-1 pr-2 text-[.6em] leading-[1em] tracking-widest uppercase`}>
                                    {formatDate(content.publicationDate)}
                                </span>
                            </div>
                            {/* <DialogButton onClose={onClose} /> */}
                        </div>

                        <div className='relative flex h-auto w-full flex-col'>
                            <h4 className={`${style.textColor} p-4 text-2xl leading-[1.3em]`}>{content.subheading || 'no title'}</h4>

                            <div className='relative flex items-center justify-between'>
                                <TeamLink team={content?.team} theme={theme} />
                                <Link
                                    href={`/posts/${postData.slug.current}`}
                                    className={`${style.buttonTextColor} ${style.buttonBackgroundColor} absolute right-2 bottom-1 flex items-center justify-center rounded-[.7em] px-4 py-2 text-sm font-bold uppercase hover:transition-colors`}
                                    prefetch={true}>
                                    Read More
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const InternalLink: React.FC<{
    slug: string;
    theme: TemplateTheme;
    children: React.ReactNode;
}> = ({ slug, children, theme }) => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [previewPostData, setPreviewPostData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const openDialog = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        setIsLoading(true);
        setDialogOpen(true);

        if (!slug) {
            console.error('The slug is undefined.');
            setIsLoading(false);
            return;
        }
    };

    return (
        <>
            <Link href='#popup' onClick={openDialog}>
                <span className='text-xl font-bold capitalize underline'>{children}</span>
                <span className={`font-russo ml-2 rounded-full bg-[#c4b5fd] pt-[5px] pr-2 pb-[5px] pl-2 text-[16px] text-black`}>POST</span>
            </Link>
            <PostPreviewDialog isOpen={isDialogOpen} onClose={() => setDialogOpen(false)} postData={previewPostData} theme={theme} />
            {isDialogOpen && isLoading && <LoadingIndicator />}
        </>
    );
};

export default React.memo(InternalLink);

const LoadingIndicator = () => (
    <div className='my-4 flex items-center justify-center'>
        <div className='flex h-auto w-full animate-pulse items-center justify-center rounded-lg bg-linear-to-r from-blue-200/10 to-blue-200/5 p-4 shadow-lg'>
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg width='100' height='100' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='25' cy='25' r='20' stroke='#333' strokeWidth='5' fill='none' strokeDasharray='31.415, 31.415' strokeDashoffset='0'>
                    <animateTransform attributeName='transform' type='rotate' from='0 25 25' to='360 25 25' dur='1s' repeatCount='indefinite' />
                </circle>
            </svg>
        </div>
    </div>
);
