import React from 'react';
import { FaLightbulb, FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface CalloutProps {
    type: 'info' | 'warning' | 'success' | 'learning';
    title: string;
    points: string[];
}

const icons = {
    info: FaInfoCircle,
    warning: FaExclamationTriangle,
    success: FaCheckCircle,
    learning: FaLightbulb,
};

const styles = {
    info: {
        border: 'border-blue-400/20',
        bg: 'bg-blue-400/5',
        text: 'text-blue-400',
    },
    warning: {
        border: 'border-yellow-400/20',
        bg: 'bg-yellow-400/5',
        text: 'text-yellow-400',
    },
    success: {
        border: 'border-green-400/20',
        bg: 'bg-green-400/5',
        text: 'text-green-400',
    },
    learning: {
        border: 'border-emerald-400/20',
        bg: 'bg-emerald-400/5',
        text: 'text-emerald-400',
    },
};

export default function Callout({ type, title, points }: CalloutProps) {
    const Icon = icons[type];
    const style = styles[type];

    return (
        <div className={`my-8 rounded-xl border ${style.border} ${style.bg} p-6`}>
            <div className='mb-4 flex items-center gap-3'>
                <Icon className={`h-5 w-5 ${style.text}`} />
                <h2 className='text-lg font-semibold text-white'>{title}</h2>
            </div>
            <ul className='space-y-2 text-gray-400'>
                {points.map((point, index) => (
                    <li key={index} className='flex items-center gap-2'>
                        <div className={`h-1.5 w-1.5 rounded-full ${style.text} bg-current`} />
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
