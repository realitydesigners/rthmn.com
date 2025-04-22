import { buildLegacyTheme } from 'sanity';

const props = {
    '--my-white': '#ffffff',
    '--my-black': '#060F12',
    '--my-brand': '#00cc7a',
    '--my-red': '#ff4444',
    '--my-neutral': '#888',
};

export const Theme = buildLegacyTheme({
    '--black': props['--my-black'],
    '--white': props['--my-white'],
    '--neutral': props['--my-neutral'],
    '--neutral-base': props['--my-neutral'],
    '--component-bg': props['--my-white'],
    '--component-text-color': props['--my-black'],
    '--brand-primary': props['--my-brand'],
    '--default-button-color': props['--my-brand'],
    '--default-button-primary-color': props['--my-brand'],
    '--default-button-success-color': props['--my-brand'],
    '--default-button-warning-color': props['--my-brand'],
    '--default-button-danger-color': props['--my-red'],
    '--state-info-color': props['--my-brand'],
    '--state-success-color': props['--my-brand'],
    '--state-warning-color': props['--my-brand'],
    '--state-danger-color': props['--my-red'],
    '--focus-color': props['--my-brand'],
});
