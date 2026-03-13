import Link from 'next/link';
import { getPrivacyLegalPage } from '@/lib/legal';
import styles from './page.module.css';

export default async function PrivacyPolicyPage() {
    const page = await getPrivacyLegalPage();

    if (!page) {
        return (
            <section className={styles.empty}>
                <div className="container">
                    <h1 className={styles.title}>Privacy Policy & Legal</h1>
                    <p>
                        The privacy document has not been published yet. Run
                        <code style={{ margin: '0 4px', padding: '2px 6px', background: 'var(--surface-2)', borderRadius: '4px' }}>npm run publish-privacy-policy</code>
                        once the Sanity environment variables are configured to seed the policy shown on this page.
                    </p>
                </div>
            </section>
        );
    }

    const formattedDate = page.lastReviewed
        ? new Date(page.lastReviewed).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : null;

    return (
        <section className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.label}>Privacy &amp; Legal</div>
                    <h1 className={styles.title}>{page.title}</h1>
                    {page.intro && <p className={styles.intro}>{page.intro}</p>}
                    <div className={styles.meta}>
                        {formattedDate && <span>Last reviewed {formattedDate}</span>}
                        {page.contactEmail && (
                            <span>
                                Contact: <Link href={`mailto:${page.contactEmail}`}>{page.contactEmail}</Link>
                            </span>
                        )}
                    </div>
                </div>

                {page.sections?.length > 0 && (
                    <div className={styles.sections}>
                        {page.sections.map((section) => (
                            <article key={section.heading} className={styles.section} id={section.anchor || undefined}>
                                <h2>{section.heading}</h2>
                                {section.body && <p>{section.body}</p>}
                                {section.highlights?.length > 0 && (
                                    <ul className={styles.highlightList}>
                                        {section.highlights.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </article>
                        ))}
                    </div>
                )}

                {page.cookiesSummary && (
                    <div className={styles.bottomBlock}>
                        <h3>Cookies &amp; Tracking</h3>
                        <p>{page.cookiesSummary}</p>
                    </div>
                )}

                {page.adSenseNotes && (
                    <div className={styles.bottomBlock}>
                        <h3>Ads &amp; Monetization Notes</h3>
                        <p>{page.adSenseNotes}</p>
                    </div>
                )}
            </div>
        </section>
    );
}
