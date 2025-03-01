import Image from 'next/image';
import { FaInstagram, FaTwitter } from 'react-icons/fa';

interface TeamMember {
    _id: string;
    name: string;
    role: string;
    image: {
        asset: {
            url: string;
        };
    };
    shortBio: string;
    twitter?: string;
    instagram?: string;
}

export interface TeamGridBlockProps {
    _type: 'teamGrid';
    _key: string;
    layout?: 'contained' | 'wide' | 'fullWidth';
    members: TeamMember[];
}

export function TeamGridBlock({ layout = 'fullWidth', members = [] }: TeamGridBlockProps) {
    console.log('TeamGrid block with layout:', layout);

    return (
        <div className='w-full'>
            <div className='flex w-full flex-col'>
                <h2 className='font-outfit mb-12 text-center text-5xl font-bold'>Our Team</h2>
                <TeamCard members={members} />
            </div>
        </div>
    );
}

export function TeamCard({ members = [] }: { members: TeamMember[] }) {
    return (
        <div className='flex flex-wrap items-center justify-center gap-8 px-4'>
            {members.map((member) => (
                <div
                    key={member._id}
                    className='group relative aspect-square w-[400px] overflow-hidden rounded-xl bg-black/20 ring-1 ring-white/[0.05] transition-all duration-500 hover:shadow-lg hover:shadow-black/20 hover:ring-white/[0.1]'>
                    <div className='absolute -inset-1 -z-10 animate-pulse bg-linear-to-r from-purple-500/10 via-transparent to-cyan-500/10 opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100' />

                    {member.image?.asset?.url && (
                        <div className='absolute inset-0 h-full w-full'>
                            <Image
                                src={member.image.asset.url}
                                alt={member.name}
                                width={1000}
                                height={1000}
                                className='h-full w-full scale-[1.01] object-cover object-center transition-all duration-700 ease-out group-hover:scale-105'
                                priority
                                quality={95}
                            />
                        </div>
                    )}

                    <div className='absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-60 transition-all duration-300 group-hover:opacity-80' />
                    <div className='absolute inset-0 bg-linear-to-r from-black/20 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100' />

                    <div className='absolute right-0 bottom-0 left-0 translate-y-2 p-6 transition-all duration-500 ease-out group-hover:translate-y-0'>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <h3 className='group-hover:text-shadow font-outfit text-2xl font-semibold tracking-wide text-white/90 transition-all duration-300 group-hover:text-white'>
                                    {member.name}
                                </h3>
                                <div className='flex gap-4'>
                                    {member.twitter && (
                                        <a
                                            href={member.twitter}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='transform text-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:text-cyan-400 active:translate-y-0 active:scale-95'>
                                            <FaTwitter size={22} className='drop-shadow-sm' />
                                        </a>
                                    )}
                                    {member.instagram && (
                                        <a
                                            href={member.instagram}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='transform text-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:text-pink-500 active:translate-y-0 active:scale-95'>
                                            <FaInstagram size={22} className='drop-shadow-sm' />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <p className='font-kodemono font-medium tracking-wide text-white/70 transition-colors duration-300 group-hover:text-white/90'>{member.role}</p>
                            <p className='font-outfit text-sm leading-relaxed text-white/50 transition-colors duration-300 group-hover:text-white/70'>{member.shortBio}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
