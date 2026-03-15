import Link from 'next/link';
import { urlFor } from '@/lib/sanity.image';
import styles from './ArticleCard.module.css';

export default function ArticleCard({ article, index = 0 }) {
    const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const imageUrl = article.image?.asset
        ? urlFor(article.image).width(800).height(500).url()
        : null;

    return (
        <article
            className={styles.card}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <Link href={`/news/${article.slug}`} className={styles.imageLink}>
                <div className={styles.imageWrap}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={article.imageAlt || article.title}
                            className={styles.image}
                            loading="lazy"
                        />
                    ) : (
                        <div className={styles.image} style={{ background: 'var(--surface-2)', minHeight: 200 }} />
                    )}
                </div>
            </Link>

            <div className={styles.content}>
                <span className="category-badge" data-category={(article.category || 'general').toLowerCase()}>{article.category || 'General'}</span>

                <h3 className={styles.title}>
                    <Link href={`/news/${article.slug}`}>{article.title}</Link>
                </h3>

                <p className={styles.excerpt}>{article.summary}</p>

                <div className={styles.meta}>
                    <span>By <strong>{article.author}</strong></span>
                    <span className={styles.metaDot}>·</span>
                    <span>{formattedDate}</span>
                </div>
            </div>
        </article>
    );
}
