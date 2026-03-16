#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { createClient } = require('@sanity/client');

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s/\\]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toPortableText(content) {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return [
      {
        _type: 'block',
        style: 'normal',
        children: [
          { _type: 'span', text: 'No body content provided.', marks: [] },
        ],
      },
    ];
  }

  return paragraphs.map((paragraph) => ({
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: paragraph.replace(/\n/g, ' '),
        marks: [],
      },
    ],
  }));
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[\n|;]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function pickLatestArticle(baseDir) {
  const files = fs
    .readdirSync(baseDir)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => ({
      name: file,
      mtime: fs.statSync(path.join(baseDir, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.mtime - a.mtime);

  return files.length ? files[0].name : null;
}

async function main() {
  const workspace = process.cwd();
  const articlesDir = path.join(workspace, 'content', 'articles');

  if (!fs.existsSync(articlesDir)) {
    throw new Error('Articles directory missing: ' + articlesDir);
  }

  const latestFile = pickLatestArticle(articlesDir);
  if (!latestFile) {
    throw new Error('No article files found.');
  }

  const articlePath = path.join(articlesDir, latestFile);
  const fileContents = fs.readFileSync(articlePath, 'utf8');
  const { data, content } = matter(fileContents);

  const title = (data.title && data.title.trim()) || 'Automated Article';
  const computedSlug = slugify(data.slug || title || latestFile.split('.')[0]);

  if (!computedSlug) {
    throw new Error('Unable to compute slug for article.');
  }

  const dataset = process.env.SANITY_DATASET || 'production';
  const projectId = process.env.SANITY_PROJECT_ID || 'w8e5nee5';
  const token = process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error('SANITY_TOKEN or SANITY_API_TOKEN is required.');
  }

  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2024-01-01',
    useCdn: false,
  });

  const blocks = toPortableText(content);
  const docId = `post-${computedSlug}`;

  const doc = {
    _id: docId,
    _type: 'post',
    title,
    slug: { _type: 'slug', current: computedSlug },
    summary: data.description || '' ,
    category: data.category || 'Insight',
    publishedAt: data.date
      ? new Date(data.date).toISOString()
      : new Date().toISOString(),
    body: blocks,
    featured: Boolean(data.featured),
    layout: data.layout || 'standard',
    executiveSummary: data.executiveSummary || data.description || '',
    keyTakeaways: toArray(data.keyTakeaways),
    sources: toArray(data.sources),
    seoTitle: data.seoTitle || title,
    seoDescription: data.seoDescription || data.description || '',
  };

  console.log(`Publishing article "${title}" to Sanity dataset ${dataset}`);
  await client.createOrReplace(doc);
  console.log(`Published ${docId} to Sanity.`);
}

main().catch((error) => {
  console.error('🚨 automate-article.js failed:', error);
  process.exit(1);
});
