import Link from 'next/link';
import { getArticlesByCategory } from '@/lib/articles';
import { urlFor } from '@/lib/sanity.image';
import { categories, getCategoryBySlug } from '@/lib/categories';
import CategoryFilter from '@/components/CategoryFilter';
import styles from './page.module.css';

export async function generateStaticParams() {
    return categories.map((cat) => ({
        slug: cat.slug,
    }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const category = getCategoryBySlug(slug);
    const label = category ? category.label : slug;
    return {
        title: `${label} — Geo Blog`,
        description: `Browse all ${label} articles on Geo Blog. ${label} news, analysis, and in-depth reporting.`,
    };
}

export default async function CategoryPage({ params }) {
    const { slug } = await params;
    const category = getCategoryBySlug(slug);
    const label = category ? category.label : slug;
    const articles = await getArticlesByCategory(label);

    return (
        <section className={styles.categorySection}>
            <div className="container">
                {/* Category Header */}
                <div className={styles.categoryHeader}>
                    <h1 className={styles.categoryTitle}>{label}</h1>
                    <p className={styles.categoryDesc}>
                        Explore our latest {label.toLowerCase()} coverage — in-depth reporting, breaking news, and expert analysis.
                    </p>
                    <CategoryFilter activeCategory={label} />
                </div>

                {/* Articles Grid */}
                {articles.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📰</div>
                        <p>No articles found in {label}.</p>
                        <Link href="/" className="btn-secondary">← Back to Home</Link>
                    </div>
                ) : (
                    <div className={styles.categoryGrid}>
                        {articles.map((article, index) => (
                            <Link
                                key={article.slug}
                                href={`/news/${article.slug}`}
                                className={styles.categoryCard}
                                style={{ animationDelay: `${index * 0.06}s` }}
                            >
                                <div className={styles.cardImageWrap}>
                                    {article.image?.asset ? (
                                        <img
                                            src={urlFor(article.image).width(600).height(600).url()}
                                            alt={article.imageAlt || article.title}
                                            className={styles.cardImage}
                                        />
                                    ) : (
                                        <div className={styles.cardImagePlaceholder}>
                                            <span>{label.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className={styles.cardOverlay}>
                                        <span className={styles.cardReadMore}>Read Article →</span>
                                    </div>
                                </div>
                                <div className={styles.cardContent}>
                                    <span className={styles.cardCategory}>{article.category}</span>
                                    <h3 className={styles.cardTitle}>{article.title}</h3>
                                    <p className={styles.cardExcerpt}>{article.summary}</p>
                                    <div className={styles.cardMeta}>
                                        <span>{article.author}</span>
                                        <span className={styles.cardDot}>·</span>
                                        <span>{article.readTime}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
