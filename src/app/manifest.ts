import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Qz Platform',
    short_name: 'Qz',
    description: 'AI-powered study platform for university students.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b101a',
    theme_color: '#006eff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
