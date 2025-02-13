export const BackgroundGrid = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='relative min-h-screen'>
            <div
                className='absolute inset-0'
                style={{
                    backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
                    backgroundSize: 'calc(100vw / 8) calc(100vw / 8)',
                }}
            />
            {children}
        </div>
    );
};
