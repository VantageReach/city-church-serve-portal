import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = new URL(context.request.url);
  const lower = pathname.toLowerCase();
  // KC Bucks asset filenames contain case-sensitive hashes.
  if (lower !== pathname && !pathname.startsWith('/kcbucks/_astro/')) {
    return context.redirect(lower + search, 301);
  }
  return next();
});
