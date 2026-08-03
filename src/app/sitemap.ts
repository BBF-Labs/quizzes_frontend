import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://qz.bflabs.tech';

  const routes = [
    '',
    '/pricing',
    '/quizzes',
    '/library',
    '/timetable',
    '/about',
    '/contact',
    '/status',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === '/status' ? ('hourly' as const) : ('daily' as const),
    priority:
      route === '' ? 1 : route === '/status' ? 0.5 : 0.8,
  }));

  return routes;
}
