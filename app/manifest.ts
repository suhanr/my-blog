import type { MetadataRoute } from 'next'
import { PROFILE_IMAGE, SITE, SITE_NAME } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'Notes',
    description: 'প্রযুক্তি, এআই, গবেষণা, ডেটা ও ডিজিটাল সংস্কৃতি নিয়ে সোহানুর রহমানের Notes।',
    start_url: `${SITE}/`,
    scope: `${SITE}/`,
    display: 'standalone',
    lang: 'bn-BD',
    icons: [
      { src: PROFILE_IMAGE, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }
}
