'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { table } from '@sanity/table';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
    name: 'wealthwise-studio',
    title: 'WealthWise Studio',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'w8e5nee5',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    basePath: '/studio',
    plugins: [structureTool(), table()],
    schema: {
        types: schemaTypes,
    },
});
