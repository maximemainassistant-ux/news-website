'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';

// Sanity Studio is interactive and cannot be statically exported
export const dynamic = 'force-dynamic';

export default function StudioPage() {
    return <NextStudio config={config} />;
}
