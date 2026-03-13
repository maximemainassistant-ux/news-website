const { createClient } = require("@sanity/client");
require("dotenv").config({ path: ".env.sanity" });

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: "2024-03-01",
    useCdn: false,
});

const policySections = [
    {
        heading: "Data We Collect",
        anchor: "data-collection",
        body: "We collect data to provide a better experience. This includes information visitors explicitly provide such as comments, newsletter sign-ups, and contact forms. We also collect data shared by browsers (user agent, IP anonymized) and data captured by analytics partners (scroll depth, session length) via analytics tags, cookies, and ad identifiers. We never sell personal information and only hold what we need to operate the site and serve relevant ads. We are preparing to monetize via ads and partners, but no sensitive data is ever sold.",
        highlights: [
            "Consent is requested before any non-essential cookies fire.",
            "Aggregated usage data helps us optimize content and ads.",
            "Information is gathered from comments, newsletters, and contact forms."
        ],
    },
    {
        heading: "Third-Party Services",
        anchor: "third-party-services",
        body: "We integrate with third-party services to enhance our site functionality and prepare for monetization. These include Google Analytics for usage tracking, and we are preparing to use Google AdSense or other ad partners and affiliate networks to display relevant advertisements. These partners may use their own cookies and ad identifiers.",
        highlights: [
            "We use Google Analytics to understand site traffic.",
            "We partner with ad networks like Google AdSense to serve ads."
        ],
    },
    {
        heading: "Cookies & Tracking Options",
        anchor: "cookies-tracking",
        body: "We use strictly necessary cookies for login and status persistence, optional preference cookies (e.g., theme), and advertising cookies managed through partners like Google Ads. Visitors can change cookie settings via the cookie banner at any time. We also provide instructions to disable non-essential cookies in browsers that support Do Not Track. You can opt out of tracking or marketing communications by adjusting your preferences or unsubscribing via the links provided in our emails.",
        highlights: [
            "Ads only serve personalized creative with your consent.",
            "Cookie banner outlines how to opt out at any time.",
            "Clear opt-out for marketing communications."
        ],
    },
    {
        heading: "Your Data Rights",
        anchor: "data-rights",
        body: "You have full control over your personal data. You have the right to request access to, correction of, deletion of, and portability of your personal data. You also have the right to object to processing and to withdraw your consent at any time. In the unlikely event of a data breach, we will provide prompt notices as required by law.",
        highlights: [
            "Rights to access, correction, deletion, portability, and objection.",
            "Right to withdraw consent at any time.",
            "Prompt breach notices."
        ],
    },
    {
        heading: "Contact Us",
        anchor: "contact",
        body: "If you have any privacy-related questions, requests regarding your data rights, or need assistance opting out, please reach out to us at our dedicated privacy contact point.",
        highlights: [
            "Contact point for privacy questions: privacy@article-ops.example"
        ],
    },
];

const document = {
    _id: "privacy-policy",
    _type: "privacyLegalPage",
    title: "Privacy Policy & Legal",
    slug: { _type: "slug", current: "privacy-policy" },
    intro:
        "We value your trust. This page outlines how we handle data, comply with ads policies, and keep revenue streams safe for Google Ads review.",
    contactEmail: "privacy@article-ops.example",
    lastReviewed: new Date().toISOString(),
    sections: policySections,
    cookiesSummary:
        "Cookie consent is requested on first visit; only essential cookies and accepted marketing cookies are active after consent. Analytics data is anonymized and kept for 13 months.",
    adSenseNotes:
        "Ads are inserted between content blocks and in the sticky footer, meeting Google’s placement guidelines. We mix text-based content with in-house sponsorships that follow AdSense policies and use lazy loading for creative assets.",
};

async function publishPolicy() {
    try {
        const result = await client.createOrReplace(document);
        console.log("Privacy policy published with ID:", result._id);
    } catch (err) {
        console.error("Failed to publish privacy policy:", err.message);
        if (err.response) {
            console.error(JSON.stringify(err.response.body, null, 2));
        }
        process.exitCode = 1;
    }
}

publishPolicy();
