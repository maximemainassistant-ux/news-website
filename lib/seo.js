// ── SEO Helpers ──────────────────────────────────────────
// Generates JSON-LD structured data and Next.js Metadata objects

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thedailybrief.com';
const SITE_NAME = 'The Daily Brief';

// ── Author (placeholder — replace with real data) ──
const AUTHOR = {
    name: 'Staff Reporter',
    url: `${SITE_URL}/author`,
    jobTitle: 'Journalist & Editor',
    image: `${SITE_URL}/images/author-placeholder.jpg`,
    sameAs: [
        'https://twitter.com/placeholder',
        'https://linkedin.com/in/placeholder',
    ],
};

/**
 * Returns the JSON-LD @type based on the article category.
 */
function getArticleType(category) {
    switch (category) {
        case 'Tech':
            return 'TechArticle';
        case 'Well+Being':
            return 'Article';
        default:
            // Finance, Politics, Climate, Business
            return 'NewsArticle';
    }
}

/**
 * Returns a CSS custom property name for the category accent color.
 */
export function getCategoryAccentVar(category) {
    const map = {
        Finance: '--cat-finance',
        Tech: '--cat-tech',
        Politics: '--cat-politics',
        Climate: '--cat-climate',
        'Well+Being': '--cat-wellbeing',
        Business: '--cat-business',
    };
    return map[category] || '--color-accent';
}

/**
 * Returns the category slug for data attributes.
 */
export function getCategorySlug(category) {
    return category ? category.toLowerCase() : '';
}

/**
 * Generates a complete Article JSON-LD object.
 */
export function getArticleJsonLd(article) {
    const articleType = getArticleType(article.category);
    const url = `${SITE_URL}/news/${article.slug}`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': articleType,
        headline: article.title,
        description: article.seoDescription || article.summary || '',
        url,
        datePublished: article.date,
        dateModified: article.date,
        author: {
            '@type': 'Person',
            name: article.author || AUTHOR.name,
            url: AUTHOR.url,
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
    };

    // Add image if available
    if (article.imageUrl) {
        jsonLd.image = {
            '@type': 'ImageObject',
            url: article.imageUrl,
            width: 1200,
            height: 675,
        };
    }

    // Add article section (category)
    if (article.category) {
        jsonLd.articleSection = article.category;
    }

    return jsonLd;
}

/**
 * Generates a Person JSON-LD for the author page.
 */
export function getPersonJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: AUTHOR.name,
        url: AUTHOR.url,
        jobTitle: AUTHOR.jobTitle,
        image: AUTHOR.image,
        sameAs: AUTHOR.sameAs,
        worksFor: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
        },
    };
}

/**
 * Generates a Next.js Metadata object for an article page.
 */
export function getArticleMetadata(article) {
    const title = article.seoTitle || `${article.title} | ${SITE_NAME}`;
    const description =
        article.seoDescription || article.summary || `Read ${article.title} on ${SITE_NAME}`;
    const url = `${SITE_URL}/news/${article.slug}`;

    return {
        title,
        description,
        openGraph: {
            title: article.title,
            description,
            url,
            type: 'article',
            publishedTime: article.date,
            section: article.category,
            siteName: SITE_NAME,
            ...(article.imageUrl && {
                images: [
                    {
                        url: article.imageUrl,
                        width: 1200,
                        height: 675,
                        alt: article.imageAlt || article.title,
                    },
                ],
            }),
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description,
            ...(article.imageUrl && { images: [article.imageUrl] }),
        },
        alternates: {
            canonical: url,
        },
    };
}
