import Link from 'next/link';
import path from 'path';
import { readFile } from 'node:fs/promises';
import { getGoogleAdsGuidancePage } from '@/lib/legal';
import styles from './page.module.css';

async function loadLocalGuidelines() {
    try {
        const filePath = path.join(process.cwd(), 'ads-guidelines.md');
        return await readFile(filePath, 'utf8');
    } catch {
        return null;
    }
}

export default async function AdsGuidancePage() {
    const page = await getGoogleAdsGuidancePage();
    const fallbackText = page ? null : await loadLocalGuidelines();

    if (!page && !fallbackText) {
        return (
            <section className={styles.empty}>
                <div className="container">
                    <h1 className={styles.title}>Google Ads Guidance</h1>
                    <p>Guidance has not been published yet. Run the CMS script after connecting Sanity to cache the recommendations.</p>
                </div>
            </section>
        );
    }

    const renderPriority = (value) => {
        if (!value) return 'Medium';
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    if (!page) {
        return (
            <section className={styles.page}>
                <div className="container">
                    <div className={styles.header}>
                        <div className={styles.label}>Google Ads Guidance</div>
                        <h1 className={styles.title}>Editorial &amp; engineering checklist</h1>
                        <p className={styles.summary}>
                            This page is backed by the local `ads-guidelines.md`. Publish a Sanity document to display structured guidance directly on the site.
                        </p>
                    </div>
                    <div className={styles.fallback}>{fallbackText}</div>
                    <p style={{ marginTop: 'var(--space-lg)' }}>
                        Once you have Sanity credentials configured, run
                        <code style={{ margin: '0 4px', padding: '2px 6px', background: 'var(--surface-2)', borderRadius: '4px' }}>npm run publish-privacy-policy</code>
                        to seed the privacy policy and an equivalent Google Ads guidance document. Reload this page afterwards to see the structured card layout.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.label}>Google Ads Guidance</div>
                    <h1 className={styles.title}>{page.title}</h1>
                    {page.summary && <p className={styles.summary}>{page.summary}</p>}
                    <div className={styles.meta}>
                        <span>Last updated {page.lastUpdated ? new Date(page.lastUpdated).toLocaleDateString('en-US') : '—'}</span>
                        <Link href="/ads-guidelines.md" className="link">View the editable checklist</Link>
                    </div>
                </div>

                {page.focusAreas?.length > 0 && (
                    <div className={styles.grid}>
                        {page.focusAreas.map((area) => (
                            <article key={area.heading} className={styles.card}>
                                <div style={{ marginBottom: '0.25rem', fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                                    Priority: {renderPriority(area.priority)}
                                </div>
                                <h3>{area.heading}</h3>
                                <p>{area.content}</p>
                            </article>
                        ))}
                    </div>
                )}

                {page.tips?.length > 0 && (
                    <div className={styles.tips}>
                        <h3>Quick tips</h3>
                        <ul>
                            {page.tips.map((tip) => (
                                <li key={tip}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {page.metricsNotes && (
                    <div className={styles.bottomBlock}>
                        <h3>Metrics &amp; Measurement</h3>
                        <p>{page.metricsNotes}</p>
                    </div>
                )}
            </div>
        </section>
    );
}
