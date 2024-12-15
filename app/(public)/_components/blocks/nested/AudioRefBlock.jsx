'use client';
import React from 'react';

const AudioPlayer = ({ audioTitle, audioFileUrl }) => {
    if (!audioFileUrl) {
        return <p>Audio file not found.</p>;
    }
    console.log(audioTitle);

    return (
        <div className='flex w-full justify-center p-2 py-4'>
            <div className='flex w-full flex-col items-end md:w-3/4 lg:w-1/2'>
                <div className='flex w-full flex-wrap items-center justify-between'>
                    <span className={`my-4 ml-2 rounded-full bg-[#5eead4] pt-[3px] pr-2 pb-[5px] pl-2 text-[16px]`}>PODCAST</span>
                    <p className='text-md px-4 text-center leading-[1.3em] font-bold tracking-wide text-blue-100 uppercase'>{audioTitle}</p>
                </div>

                {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
                <audio controls className='w-full pt-2' src={audioFileUrl}>
                    Your browser does not support the audio element.
                </audio>
            </div>
        </div>
    );
};

const AudioRefBlock = ({ audioTitle, audioFileUrl }) => {
    return <AudioPlayer audioTitle={audioTitle} audioFileUrl={audioFileUrl} />;
};

export default React.memo(AudioRefBlock);
