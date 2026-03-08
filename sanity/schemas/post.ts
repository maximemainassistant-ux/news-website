import { defineType, defineField } from 'sanity';

export default defineType({
    name: 'post',
    title: 'Post',
    type: 'document',
    fieldsets: [
        {
            name: 'seo',
            title: '🔍 SEO & AI Extraction',
            options: { collapsible: true, collapsed: true },
        },
        {
            name: 'analysis',
            title: '📊 Analysis & Sources',
            options: { collapsible: true, collapsed: true },
        },
    ],
    fields: [
        defineField({
            name: 'title',
            title: 'Headline',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Finance', value: 'Finance' },
                    { title: 'Tech', value: 'Tech' },
                    { title: 'Politics', value: 'Politics' },
                    { title: 'Climate', value: 'Climate' },
                    { title: 'Well+Being', value: 'Well+Being' },
                    { title: 'Business', value: 'Business' },
                ],
                layout: 'dropdown',
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'layout',
            title: 'Layout',
            type: 'string',
            description: 'Choose a page layout. Standard is the default for most posts.',
            options: {
                list: [
                    { title: 'Standard', value: 'standard' },
                    { title: 'Data-Heavy', value: 'data-heavy' },
                    { title: 'Analysis', value: 'analysis' },
                ],
                layout: 'radio',
                direction: 'horizontal',
            },
            initialValue: 'standard',
        }),
        defineField({
            name: 'mainImage',
            title: 'Main Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                defineField({
                    name: 'alt',
                    title: 'Alt Text',
                    type: 'string',
                    description: 'Describe the image for accessibility and SEO.',
                }),
            ],
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'string',
        }),
        defineField({
            name: 'summary',
            title: 'Summary',
            type: 'text',
            rows: 3,
            description: 'Short summary shown on article cards.',
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
        }),

        // ── SEO & AI Extraction Fieldset ──
        defineField({
            name: 'seoTitle',
            title: 'SEO Title Override',
            type: 'string',
            fieldset: 'seo',
            description: 'Override the default <title> tag (50-60 chars recommended).',
            validation: (Rule) => Rule.max(70).warning('Keep under 60 characters for best SEO results.'),
        }),
        defineField({
            name: 'seoDescription',
            title: 'SEO Description Override',
            type: 'text',
            rows: 2,
            fieldset: 'seo',
            description: 'Override the meta description (150-160 chars recommended).',
            validation: (Rule) => Rule.max(170).warning('Keep under 160 characters for best SEO results.'),
        }),
        defineField({
            name: 'executiveSummary',
            title: 'Executive Summary (BLUF)',
            type: 'text',
            rows: 4,
            fieldset: 'seo',
            description: 'Bottom Line Up Front — a concise summary for AI extraction and reader clarity.',
        }),

        // ── Analysis & Sources Fieldset ──
        defineField({
            name: 'keyTakeaways',
            title: 'Key Takeaways',
            type: 'array',
            of: [{ type: 'string' }],
            fieldset: 'analysis',
            description: 'Bullet-point takeaways displayed in a callout box (Politics/Finance/Analysis posts).',
        }),
        defineField({
            name: 'sources',
            title: 'Sources',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'source',
                    title: 'Source',
                    fields: [
                        defineField({
                            name: 'title',
                            title: 'Source Title',
                            type: 'string',
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: 'url',
                            title: 'URL',
                            type: 'url',
                        }),
                        defineField({
                            name: 'publisher',
                            title: 'Publisher',
                            type: 'string',
                        }),
                    ],
                    preview: {
                        select: { title: 'title', subtitle: 'publisher' },
                    },
                },
            ],
            fieldset: 'analysis',
            description: 'Cite your sources for credibility (E-E-A-T).',
        }),

        // ── Body ──
        defineField({
            name: 'body',
            title: 'Body',
            type: 'array',
            of: [
                {
                    type: 'block',
                },
                {
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        defineField({
                            name: 'alt',
                            title: 'Alt Text',
                            type: 'string',
                        }),
                        defineField({
                            name: 'caption',
                            title: 'Caption',
                            type: 'string',
                        }),
                    ],
                },
                {
                    type: 'table',
                },
            ],
        }),
        defineField({
            name: 'featured',
            title: 'Featured',
            type: 'boolean',
            initialValue: false,
            description: 'Toggle to feature this post on the homepage hero.',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            author: 'author',
            media: 'mainImage',
            layout: 'layout',
        },
        prepare(selection) {
            const { author, layout } = selection;
            const layoutLabel = layout && layout !== 'standard' ? ` [${layout}]` : '';
            return {
                ...selection,
                subtitle: `${author ? `by ${author}` : ''}${layoutLabel}`,
            };
        },
    },
});
