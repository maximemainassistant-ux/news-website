import { defineField, defineType } from "sanity";

export default defineType({
    name: "privacyLegalPage",
    title: "Privacy & Legal Page",
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
            name: "intro",
            title: "Intro",
            type: "text",
            rows: 4,
            description: "Short overview used on the privacy landing section.",
        }),
        defineField({
            name: "contactEmail",
            title: "Contact Email",
            type: "string",
            validation: (Rule) => Rule.email(),
            description: "Support email visitors can use if they have questions about privacy or ads.",
        }),
        defineField({
            name: "lastReviewed",
            title: "Last Reviewed",
            type: "datetime",
            description: "Use this to track the last time the policy was updated.",
        }),
        defineField({
            name: "sections",
            title: "Policy Sections",
            type: "array",
            of: [
                {
                    type: "object",
                    name: "section",
                    title: "Section",
                    fields: [
                        defineField({
                            name: "heading",
                            title: "Heading",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "anchor",
                            title: "Anchor ID",
                            type: "string",
                            description: "Optional fragment identifier for in-page links (e.g., data-collection).",
                        }),
                        defineField({
                            name: "body",
                            title: "Body",
                            type: "text",
                            rows: 6,
                        }),
                        defineField({
                            name: "highlights",
                            title: "Highlights",
                            type: "array",
                            of: [{ type: "string" }],
                            description: "Bullet-friendly notes for ad reviewers or compliance partners.",
                        }),
                    ],
                },
            ],
        }),
        defineField({
            name: "cookiesSummary",
            title: "Cookies & Tracking",
            type: "text",
            rows: 4,
            description: "Explain how cookies, tags, and ad trackers are handled.",
        }),
        defineField({
            name: "adSenseNotes",
            title: "Ads & Monetization Notes",
            type: "text",
            rows: 4,
            description: "Notes tailored to Google Ads reviewers or implementation partners.",
        }),
    ],
});
