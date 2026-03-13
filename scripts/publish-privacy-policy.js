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
        body:
            "We collect what visitors explicitly provide (comments, newsletter sign-ups), what their browser shares (user agent, IP anonymized), and what our analytics partners capture (scroll depth, session length). We never sell personal information and only hold what we need to operate the site and serve ads that are relevant.",
        highlights: [
            "Consent is requested before any non-essential cookies fire.",
            "Aggregated usage data helps us optimize content and ads.",
        ],
    },
    {
        heading: "Cookies & Tracking",
        anchor: "cookies-tracking",
        body:
            "We use strictly necessary cookies for login/status persistence, optional preference cookies (e.g., theme), and advertising cookies managed through Google Ads. Visitors can change cookie settings via the cookie banner, and we provide a link to disable non-essential cookies in browsers that support Do Not Track.",
        highlights: [
            "Google Ads only serves personalized creative with consent.",
            "Cookie banner outlines how to opt out at any time.",
        ],
    },
    {
        heading: "How Ads Are Handled",
        anchor: "ads",
        body:
            "Our partnership with Google Ads ensures that creatives respect Google’s policies. Ads are placed in non-intrusive zones (top leaderboard, between sections, and helpful CTAs) so the reading experience stays immersive. We routinely audit for policy compliance, and any automated ads that might violate thresholds are replaced immediately.",
        highlights: [
            "Ad placement respects mobile viewports with responsive slots.",
            "Automated monitoring pages flag potentially disallowed creatives.",
        ],
    },
    {
        heading: "Legal & Compliance Notes",
        anchor: "compliance",
        body:
            "We follow Google’s privacy-centric implementation guidance and maintain records of data-sharing partners. Visitors from the EU can request data access or removal by emailing our privacy contact. If regulations evolve, we refresh this document and the cookie banner within two weeks.",
        highlights: [
            "EU Data Subject Requests handled within 30 days.",
            "Cookies and data retention policies are reviewed quarterly.",
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
