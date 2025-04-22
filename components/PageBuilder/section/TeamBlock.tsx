import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const TeamBlock = ({ block }) => {
    if (block?._type !== 'teamBlock') {
        return null;
    }

    return (
        <div className='m-0 flex h-full w-full justify-center bg-black py-6'>
            <div className='flex w-11/12 flex-col rounded-[1.5em] bg-linear-to-r from-blue-200/10 to-blue-200/5 p-4 shadow-lg md:w-1/2 lg:w-1/3'>
                <div className='flex w-full items-center justify-start'>
                    {block.team?.image && (
                        <div className='flex items-center'>
                            <Image
                                src={block.team.image}
                                alt={`Team member image for ${block.team.name}`}
                                width={300}
                                height={300}
                                priority={true}
                                className='cover h-[5em] max-h-[5em] w-[5em] max-w-[5em] rounded-[.8em] object-cover'
                            />
                            <div className='ml-4 flex flex-col'>
                                <p className='mb-2 bg-linear-to-r from-blue-100/100 to-blue-100/90 bg-clip-text text-xl leading-none font-bold tracking-wide text-transparent uppercase'>
                                    {block?.team.name}
                                </p>
                                <span className='text-xs leading-none tracking-widest text-neutral-400 uppercase'>{block?.team.role}</span>
                            </div>
                        </div>
                    )}
                </div>
                <p className='text-md mb-4 bg-linear-to-r from-blue-100/75 to-blue-100/60 bg-clip-text pt-4 leading-6 text-transparent'>{block?.team.shortBio}</p>
                <div className='flex justify-center rounded-lg bg-blue-100/5 hover:bg-blue-100/10'>
                    <Link href={`/team/${block.team.slug.current}`} className='flex items-center p-2 text-sm font-bold text-blue-100 uppercase'>
                        <span>View Profile</span>
                        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                        <svg xmlns='http://www.w3.org/2000/svg' className='ml-2 h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                            <path d='M14.707 9.293a1 1 0 0 0-1.414-1.414L10 11.586 6.707 8.293a1 1 0 0 0-1.414 1.414l4 4a1 1 0 0 0 1.414 0l4-4z' />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TeamBlock;
