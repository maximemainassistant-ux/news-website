import { Suspense } from 'react';
import Link from 'next/link';
import { getAllArticles, getFeaturedArticle, getArticlesByCategory } from '@/lib/articles';
import { urlFor } from '@/lib/sanity.image';
import { categories } from '@/lib/categories';
import ArticleCard from '@/components/ArticleCard';
import AdSlot from '@/components/AdSlot';
import CategoryFilter from '@/components/CategoryFilter';
import styles from './page.module.css';

export default async function HomePage() {
  const featured = await getFeaturedArticle();
  const rawArticles = await getAllArticles();

  const allArticles = featured
    ? rawArticles.filter((a) => a.slug !== featured.slug)
    : rawArticles;

  const latestArticles = featured
    ? rawArticles.filter((a) => a.slug !== featured.slug)
    : rawArticles;

  const activeCategory = 'All';

  return (
    <>
      {/* ── Featured Story (WaPo-style: headline left + image right) ── */}
      {featured && (
        <section className={styles.featured}>
          <div className="container">
            <div className={styles.featuredGrid}>
              {/* Left: headline + summary */}
              <div className={styles.featuredContent}>
                <span className="category-badge" data-category={(featured.category || 'general').toLowerCase()}>{featured.category || 'General'}</span>
                <h1 className={styles.featuredTitle}>
                  <Link href={`/news/${featured.slug}`}>{featured.title}</Link>
                </h1>
                <p className={styles.featuredExcerpt}>{featured.summary}</p>
                <div className={styles.featuredMeta}>
                  <span>By <strong>{featured.author}</strong></span>
                  <span className={styles.metaDot}>·</span>
                  <span>{new Date(featured.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Center: large image */}
              <div className={styles.featuredImageWrap}>
                <Link href={`/news/${featured.slug}`}>
                  {featured.image?.asset ? (
                    <img
                      src={urlFor(featured.image).width(1200).height(675).url()}
                      alt={featured.imageAlt || featured.title}
                      className={styles.featuredImage}
                    />
                  ) : (
                    <div className={styles.featuredImage} style={{ background: 'var(--surface-2)', minHeight: 300 }} />
                  )}
                </Link>
              </div>

              {/* Right: secondary stories sidebar */}
              <aside className={styles.featuredSidebar}>
                <h3 className={styles.sidebarHeading}>Latest</h3>
                <div className={styles.sidebarList}>
                  {latestArticles
                    .slice(0, 4)
                    .map((article) => (
                      <Link
                        key={article.slug}
                        href={`/news/${article.slug}`}
                        className={styles.sidebarItem}
                      >
                        <span className="category-badge" data-category={(article.category || 'general').toLowerCase()}>{article.category || 'General'}</span>
                        <span className={styles.sidebarItemTitle}>{article.title}</span>
                      </Link>
                    ))}
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* ── Ad: Leaderboard ── */}
      <div className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
        <AdSlot size="banner" />
      </div>

      {/* ── Sub-stories row (3-col under featured) ── */}
      <section className={styles.subStories}>
        <div className="container">
          <hr className="divider divider--thick" />
          <div className={styles.subStoriesGrid}>
            {latestArticles
              .slice(0, 3)
              .map((article) => (
                <Link
                  key={article.slug}
                  href={`/news/${article.slug}`}
                  className={styles.subStoryItem}
                >
                  <h3 className={styles.subStoryTitle}>{article.title}</h3>
                </Link>
              ))}
          </div>
          <hr className="divider" />
        </div>
      </section>

      {/* ── Category Filter + News Grid ── */}
      <section className={styles.newsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Latest Stories</h2>
            <CategoryFilter activeCategory={activeCategory} />
          </div>

          {allArticles.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No articles found in this category.</p>
              <Link href="/" className="btn-secondary">View All Stories</Link>
            </div>
          ) : (
            <div className={styles.newsGrid}>
              {allArticles.map((article, index) => (
                <div key={article.slug}>
                  <ArticleCard article={article} index={index} />
                  {/* Inline ad after 4th article */}
                  {index === 3 && (
                    <div style={{ marginTop: 'var(--space-xl)' }}>
                      <AdSlot size="inline" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
