import { client } from './sanity.client';

// ── GROQ Queries ──────────────────────────────────────────

const postFields = `
  _id,
  title,
  "slug": slug.current,
  category,
  "image": mainImage,
  "imageAlt": mainImage.alt,
  summary,
  author,
  "date": publishedAt,
  "readTime": coalesce(
    select(
      length(pt::text(body)) > 3000 => string(round(length(pt::text(body)) / 900)) + " min read",
      length(pt::text(body)) > 1500 => string(round(length(pt::text(body)) / 900)) + " min read",
      "3 min read"
    ),
    "4 min read"
  ),
  featured,
  body,
  layout,
  executiveSummary,
  keyTakeaways,
  sources,
  seoTitle,
  seoDescription
`;

export async function getAllArticles() {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) { ${postFields} }`
  );
}

export async function getFeaturedArticle() {
  const featured = await client.fetch(
    `*[_type == "post" && featured == true] | order(publishedAt desc)[0] { ${postFields} }`
  );
  if (featured) return featured;

  // Fallback: most recent article
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc)[0] { ${postFields} }`
  );
}

export async function getArticleBySlug(slug) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] { ${postFields} }`,
    { slug }
  );
}

export async function getArticlesByCategory(category) {
  if (!category || category === 'All') return getAllArticles();
  return client.fetch(
    `*[_type == "post" && category == $category] | order(publishedAt desc) { ${postFields} }`,
    { category }
  );
}

export async function getRelatedArticles(slug, limit = 3) {
  const article = await getArticleBySlug(slug);
  if (!article) return [];
  return client.fetch(
    `*[_type == "post" && slug.current != $slug && category == $category] | order(publishedAt desc)[0...$limit] { ${postFields} }`,
    { slug, category: article.category, limit }
  );
}
