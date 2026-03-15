'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';

// Allow static export by providing empty params for the optional catch-all route
export function generateStaticParams() {
    return [{}];
}

export default function StudioPage() {
    return <NextStudio config={config} />;
}
