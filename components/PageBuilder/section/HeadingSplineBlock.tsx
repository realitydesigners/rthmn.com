'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Spline from '@splinetool/react-spline';

const HeadingSplineBlock = ({ block }) => {
    const { className, url } = block;

    switch (className) {
        case 'dark': {
            let publicationDate = block.publicationDate;

            if (!publicationDate && block.block) {
                const blockWithDate = block.block.find((blockItem) => blockItem.publicationDate);
                if (blockWithDate) {
                    publicationDate = blockWithDate.publicationDate;
                }
            }

            const formattedDate = publicationDate
                ? new Date(publicationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                  })
                : 'Date not available';

            const renderCategory = block.category ? (
                <span
                    className={`font-russo mr-1 h-auto items-center justify-center bg-neutral-200 p-1 pr-2 pl-2 text-xs font-semibold tracking-widest whitespace-nowrap text-black uppercase`}>
                    {block.category.title}
                </span>
            ) : null;

            return (
                <div className='h-auto w-full bg-black pt-20 pb-20 lg:pt-32 lg:pb-0'>
                    <div className='flex w-full flex-wrap justify-center'>
                        <div className='flex-cols flex w-11/12 flex-wrap items-center justify-between'>
                            <div className='flex w-auto'>
                                <span className={`font-russo ml-2 w-auto text-xs tracking-widest text-neutral-200 uppercase`}>POSTED ON {formattedDate}</span>
                            </div>
                            {renderCategory}
                        </div>

                        <div className='w-full flex-col lg:w-1/2'>
                            {block.heading && <h1 className={`leading-tightest font-russo p-4 text-5xl text-neutral-200 md:text-7xl`}>{block.heading}</h1>}
                            {block.subheading && <h2 className={`w-full p-4 text-2xl leading-7 tracking-wide text-neutral-300`}>{block.subheading}</h2>}
                        </div>
                        <div className='w-full pb-2 pl-2 lg:w-3/4'>
                            <div className='w-full'>
                                {block.team && (
                                    <Link href={`/team/${block.team.slug.current}`} className={` `}>
                                        <div className='flex w-auto p-2'>
                                            {block.team?.image && (
                                                <div className='flex items-center'>
                                                    <Image
                                                        src={block.team.image}
                                                        alt={`Team member image for ${block.team.name}`}
                                                        width={80}
                                                        height={80}
                                                        priority={true}
                                                        className='cover h-[30px] w-[30px] rounded-[2em] object-cover'
                                                    />
                                                    {block.team.name && <span className='ml-2 text-sm tracking-wide text-neutral-200 uppercase'>{block.team.name}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className='h-[70vh] w-full overflow-hidden p-2 lg:w-3/4'>
                            <div className='h-full w-full overflow-hidden rounded-[1em] shadow-lg'>
                                <Spline scene={url} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        default:
            return null;
    }
};

export default HeadingSplineBlock;
