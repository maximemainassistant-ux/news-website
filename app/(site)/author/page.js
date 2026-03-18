import Link from 'next/link';
import { ArrowLeft, Mail, Twitter, Linkedin } from 'lucide-react';
import { getPersonJsonLd } from '@/lib/seo';
import styles from './page.module.css';

export const metadata = {
    title: 'About the Author | The Daily Brief',
    description: 'Meet the journalist behind The Daily Brief — in-depth reporting on politics, technology, finance, and more.',
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thedailybrief.com'}/author`,
    },
};

export default function AuthorPage() {
    const personJsonLd = getPersonJsonLd();

    return (
        <div className={styles.page}>
            {/* JSON-LD Person Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
            />

            <div className="container">
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    Back to Headlines
                </Link>

                <div className={styles.profileCard}>
                    {/* Avatar */}
                    <div className={styles.avatar}>
                        <span className={styles.avatarInitials}>SR</span>
                    </div>

                    {/* Name & Role */}
                    <h1 className={styles.name}>Staff Reporter</h1>
                    <p className={styles.role}>Journalist & Editor at The Daily Brief</p>

                    {/* Bio */}
                    <div className={styles.bio}>
                        <p>
                            Covering the intersection of politics, technology, and business with
                            a focus on data-driven reporting and in-depth analysis. Committed to
                            factual, well-sourced journalism that empowers readers to make
                            informed decisions.
                        </p>
                        <p>
                            With experience across newsrooms and digital media, every article is
                            built on primary sources, expert interviews, and rigorous fact-checking
                            to meet the highest editorial standards.
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className={styles.socials}>
                        <a
                            href="https://twitter.com/placeholder"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="Twitter"
                        >
                            <Twitter size={18} />
                            <span>Twitter</span>
                        </a>
                        <a
                            href="https://linkedin.com/in/placeholder"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={18} />
                            <span>LinkedIn</span>
                        </a>
                        <a
                            href="mailto:hello@thedailybrief.com"
                            className={styles.socialLink}
                            aria-label="Email"
                        >
                            <Mail size={18} />
                            <span>Contact</span>
                        </a>
                    </div>
                </div>

                {/* Expertise Areas */}
                <div className={styles.expertise}>
                    <h2 className={styles.sectionTitle}>Coverage Areas</h2>
                    <div className={styles.expertiseGrid}>
                        {[
                            { label: 'Politics', color: 'var(--cat-politics)' },
                            { label: 'Tech', color: 'var(--cat-tech)' },
                            { label: 'Finance', color: 'var(--cat-finance)' },
                            { label: 'Business', color: 'var(--cat-business)' },
                            { label: 'Climate', color: 'var(--cat-climate)' },
                            { label: 'Well+Being', color: 'var(--cat-wellbeing)' },
                        ].map((area) => (
                            <div
                                key={area.label}
                                className={styles.expertiseItem}
                                style={{ borderLeftColor: area.color }}
                            >
                                <span
                                    className={styles.expertiseDot}
                                    style={{ background: area.color }}
                                />
                                {area.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
