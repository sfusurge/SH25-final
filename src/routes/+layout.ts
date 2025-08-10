// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;

// disable ssr, so code only runs client side.
export const ssr = false;

export const csr = true;
