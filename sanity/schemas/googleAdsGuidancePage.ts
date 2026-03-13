import { defineField, defineType } from "sanity";

export default defineType({
    name: "googleAdsGuidancePage",
    title: "Google Ads Guidance",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "title",
                maxLength: 96,
                slugify: (value) =>
                    value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, ""),
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "summary",
            title: "Summary",
            type: "text",
            rows: 3,
            description: "Short explanation of how this page helps monetize with Google Ads.",
        }),
        defineField({
            name: "lastUpdated",
            title: "Last Updated",
            type: "datetime",
            description: "Track the last time the guidance page was refreshed.",
        }),
        defineField({
            name: "focusAreas",
            title: "Focus Areas",
            type: "array",
            of: [
                {
                    type: "object",
                    name: "focusArea",
                    fields: [
                        defineField({
                            name: "heading",
                            title: "Heading",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "content",
                            title: "Content",
                            type: "text",
                            rows: 4,
                        }),
                        defineField({
                            name: "priority",
                            title: "Priority",
                            type: "string",
                            initialValue: "high",
                            options: {
                                list: [
                                    { title: "High", value: "high" },
                                    { title: "Medium", value: "medium" },
                                    { title: "Low", value: "low" },
                                ],
                                layout: "radio",
                            },
                        }),
                    ],
                },
            ],
        }),
        defineField({
            name: "tips",
            title: "Quick Tips",
            type: "array",
            of: [{ type: "string" }],
            description: "Short actionable tips for editors or engineers.",
        }),
        defineField({
            name: "metricsNotes",
            title: "Metrics & Measurement Notes",
            type: "text",
            rows: 4,
            description: "Ideas for tracking performance (RPM, LCP, CTR, etc.).",
        }),
    ],
});
