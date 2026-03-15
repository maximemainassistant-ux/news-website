import Link from 'next/link';
import {
    ArrowLeft,
    Clock,
    Calendar,
    BookOpen,
} from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { getArticleBySlug, getRelatedArticles } from '@/lib/articles';
import { urlFor } from '@/lib/sanity.image';
import { getArticleJsonLd, getArticleMetadata, getCategorySlug } from '@/lib/seo';
import AdSlot from '@/components/AdSlot';
import ArticleShareButtons from '@/components/ArticleShareButtons';
import ExecutiveSummary from '@/components/blocks/ExecutiveSummary';
import KeyTakeaway from '@/components/blocks/KeyTakeaway';
import PrimarySource from '@/components/blocks/PrimarySource';
import ComparisonTable from '@/components/blocks/ComparisonTable';
import ProductSpec from '@/components/blocks/ProductSpec';
import styles from './page.module.css';

// ── Static export: pre-render all articles at build time ──
export async function generateStaticParams() {
    const { getAllArticles } = await import('@/lib/articles');
    const articles = await getAllArticles();
    return articles.map((article) => ({ slug: article.slug }));
}

// ── Dynamic SEO metadata ──
export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    const article = await getArticleBySlug(slug);
    if (!article) {
        return { title: 'Article Not Found | The Daily Brief' };
    }

    // Attach image URL for OG
    if (article.image) {
        article.imageUrl = urlFor(article.image).width(1200).height(675).url();
    }

    return getArticleMetadata(article);
}

// ── Portable Text renderers ──
// Reset per-render via closure
function createPortableTextComponents(category, layout) {
    let blockIndex = 0;
    const isTech = category === 'Tech';

    return {
        block: {
            normal: ({ children }) => {
                const idx = blockIndex++;
                return (
                    <div>
                        <p className={styles.paragraph}>{children}</p>
                        {/* Ad after 2nd paragraph */}
                        {idx === 1 && <AdSlot size="inline" />}
                    </div>
                );
            },
        },
        types: {
            image: ({ value }) => {
                if (!value?.asset) return null;
                return (
                    <figure style={{ margin: 'var(--space-lg) 0' }}>
                        <img
                            src={urlFor(value).width(800).url()}
                            alt={value.alt || ''}
                            width={800}
                            height={450}
                            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            loading="lazy"
                        />
                        {value.caption && (
                            <figcaption style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 'var(--space-xs)' }}>
                                {value.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            },
            table: ({ value }) => {
                if (!value?.rows) return null;
                // Tech posts get the enhanced ComparisonTable
                if (isTech) {
                    return <ComparisonTable rows={value.rows} />;
                }
                // Default table rendering
                return (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <tbody>
                                {value.rows.map((row, rowIndex) => (
                                    <tr key={row._key || rowIndex}>
                                        {row.cells?.map((cell, cellIndex) =>
                                            rowIndex === 0 ? (
                                                <th key={cellIndex}>{cell}</th>
                                            ) : (
                                                <td key={cellIndex}>{cell}</td>
                                            )
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            },
        },
    };
}

export default async function ArticlePage({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    const article = await getArticleBySlug(slug);
    const related = article ? await getRelatedArticles(slug, 3) : [];

    if (!article) {
        return (
            <div className={styles.notFound}>
                <div className="container">
                    <h1>Article Not Found</h1>
                    <p>The article you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        Back to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const categorySlug = getCategorySlug(article.category);
    const layout = article.layout || 'standard';
    const isTechOrDataHeavy = article.category === 'Tech' && layout === 'data-heavy';
    const isPoliticsOrFinance = ['Politics', 'Finance'].includes(article.category);
    const showKeyTakeaways = isPoliticsOrFinance || layout === 'analysis';
    const showSources = isPoliticsOrFinance || layout === 'analysis';

    // Build JSON-LD
    const imageUrl = article.image
        ? urlFor(article.image).width(1200).height(675).url()
        : null;
    const articleJsonLd = getArticleJsonLd({ ...article, imageUrl });

    const portableTextComponents = createPortableTextComponents(article.category, layout);

    return (
        <div className={styles.page} data-category={categorySlug}>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />

            {/* Article Header */}
            <header className={styles.header}>
                <div className="container">
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        Back to Headlines
                    </Link>

                    <div className={styles.headerMeta}>
                        <span
                            className="category-badge"
                            data-category={categorySlug}
                        >
                            {article.category}
                        </span>
                        <span className={styles.metaItem}>
                            <Calendar size={14} />
                            {formattedDate}
                        </span>
                        <span className={styles.metaItem}>
                            <Clock size={14} />
                            {article.readTime}
                        </span>
                    </div>

                    <h1 className={styles.title}>{article.title}</h1>

                    <div className={styles.authorRow}>
                        <div className={styles.authorInfo}>
                            <div className={styles.authorAvatar}>
                                {article.author
                                    ?.split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                            </div>
                            <div>
                                <Link href="/author" className={styles.authorName}>
                                    {article.author}
                                </Link>
                                <span className={styles.authorRole}>Staff Reporter</span>
                            </div>
                        </div>
                        <ArticleShareButtons title={article.title} />
                    </div>
                </div>
            </header>

            {/* Hero Image */}
            <div className={styles.heroImage}>
                <div className="container">
                    {article.image ? (
                        <img
                            src={urlFor(article.image).width(1200).height(675).url()}
                            alt={article.imageAlt || article.title}
                            width={1200}
                            height={675}
                            className={styles.image}
                        />
                    ) : (
                        <div className={styles.image} style={{ background: 'var(--surface-2)', minHeight: 400 }} />
                    )}
                </div>
            </div>

            {/* Article Body + Sidebar */}
            <div className={`container ${styles.layout}`}>
                <article className={styles.articleBody}>
                    {/* Executive Summary — all categories */}
                    <ExecutiveSummary text={article.executiveSummary} />

                    {/* Key Takeaways — Politics/Finance/Analysis layout */}
                    {showKeyTakeaways && !isTechOrDataHeavy && (
                        <KeyTakeaway items={article.keyTakeaways} />
                    )}

                    {/* Product Spec — Tech Data-Heavy layout */}
                    {isTechOrDataHeavy && (
                        <ProductSpec items={article.keyTakeaways} />
                    )}

                    {/* Body Content */}
                    {article.body && (
                        <PortableText value={article.body} components={portableTextComponents} />
                    )}

                    {/* Primary Sources — Politics/Finance/Analysis layout */}
                    {showSources && (
                        <PrimarySource sources={article.sources} />
                    )}

                    {/* Article Footer */}
                    <div className={styles.articleFooter}>
                        <div className={styles.tags}>
                            <span className={styles.tag} data-category={categorySlug}>
                                {article.category}
                            </span>
                            {layout !== 'standard' && (
                                <span className={styles.tag}>{layout === 'data-heavy' ? 'Data' : 'Analysis'}</span>
                            )}
                        </div>
                        <ArticleShareButtons title={article.title} variant="footer" />
                    </div>
                </article>

                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarSticky}>
                        {/* Ad Slot */}
                        <AdSlot size="sidebar" />

                        {/* Related Articles */}
                        {related.length > 0 && (
                            <div className={styles.relatedSection}>
                                <h3 className={styles.sidebarTitle}>
                                    <BookOpen size={16} />
                                    Related Stories
                                </h3>
                                <ul className={styles.relatedList}>
                                    {related.map((r) => (
                                        <li key={r.slug}>
                                            <Link
                                                href={`/news/${r.slug}`}
                                                className={styles.relatedItem}
                                            >
                                                {r.image ? (
                                                    <img
                                                        src={urlFor(r.image).width(200).height(120).url()}
                                                        alt={r.imageAlt || r.title}
                                                        width={200}
                                                        height={120}
                                                        className={styles.relatedImage}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className={styles.relatedImage} style={{ background: 'var(--surface-2)', minHeight: 60 }} />
                                                )}
                                                <div className={styles.relatedContent}>
                                                    <span
                                                        className={`category-badge ${(r.category || 'general').toLowerCase()}`}
                                                        data-category={getCategorySlug(r.category)}
                                                    >
                                                        {r.category}
                                                    </span>
                                                    <span className={styles.relatedTitle}>
                                                        {r.title}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
