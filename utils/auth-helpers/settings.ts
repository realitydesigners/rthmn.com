// Boolean toggles to determine which auth types are allowed
const allowOauth = true;
const allowEmail = false;
const allowPassword = false;

// Boolean toggle to determine whether auth interface should route through server or client
const allowServerRedirect = false;

export const getAuthTypes = () => ({
    allowOauth,
    allowEmail,
    allowPassword,
});

export const getViewTypes = () => ['signin'];

export const getDefaultSignInView = () => 'signin';

export const getRedirectMethod = () => {
    return allowServerRedirect ? 'server' : 'client';
};
