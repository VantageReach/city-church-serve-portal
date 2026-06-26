import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = new URL(context.request.url);
  const lower = pathname.toLowerCase();
  if (lower !== pathname) {
    return context.redirect(lower + search, 301);
  }
  return next();
});
