import { client } from './sanity.client';

const privacyProjection = `
  _id,
  title,
  intro,
  contactEmail,
  lastReviewed,
  "slug": slug.current,
  sections[]{
    heading,
    anchor,
    body,
    highlights
  },
  cookiesSummary,
  adSenseNotes
`;

const guidanceProjection = `
  _id,
  title,
  summary,
  lastUpdated,
  "slug": slug.current,
  focusAreas[]{
    heading,
    content,
    priority
  },
  tips,
  metricsNotes
`;

export async function getPrivacyLegalPage() {
  return client.fetch(`*[_type == "privacyLegalPage"][0]{${privacyProjection}}`);
}

export async function getGoogleAdsGuidancePage() {
  return client.fetch(`*[_type == "googleAdsGuidancePage"][0]{${guidanceProjection}}`);
}
