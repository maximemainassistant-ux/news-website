'use client';

import { useState } from 'react';
import Link from 'next/link';
import { categories } from '@/lib/categories';
import styles from './Footer.module.css';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MAILERLITE_API_KEY}`,
                },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setStatus('error');
                setErrorMsg((data.errors && Object.values(data.errors).flat().join(', ')) || 'Something went wrong.');
                return;
            }

            setStatus('success');
            setEmail('');
            // Mark as subscribed so the popup won't show
            try { localStorage.setItem('geo_blog_subscribed', 'true'); } catch { }
            setTimeout(() => setStatus('idle'), 5000);
        } catch {
            setStatus('error');
            setErrorMsg('Network error. Please try again.');
        }
    };

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerInner}`}>
                {/* Brand */}
                <div className={styles.brand}>
                    <Link href="/" className={styles.brandLogo}>Geo Blog</Link>
                    <p className={styles.brandDesc}>
                        Delivering the most important breaking news, in-depth reporting,
                        and expert analysis on the topics that matter most.
                    </p>
                </div>

                {/* Sections */}
                <div className={styles.links}>
                    <h4 className={styles.linksHeading}>Sections</h4>
                    <nav className={styles.linksNav}>
                        {categories.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/category/${cat.slug}`}
                                className={styles.link}
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Newsletter */}
                <div className={styles.newsletter}>
                    <h4 className={styles.linksHeading}>Newsletter</h4>
                    <p className={styles.newsletterDesc}>
                        Get the day&apos;s top stories delivered to your inbox every morning.
                    </p>
                    {status === 'success' ? (
                        <p className={styles.success}>✓ You&apos;re subscribed!</p>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                required
                                disabled={status === 'loading'}
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ borderRadius: '0 9999px 9999px 0' }}
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? 'Sending…' : 'Subscribe'}
                            </button>
                        </form>
                    )}
                    {status === 'error' && (
                        <p className={styles.error}>{errorMsg}</p>
                    )}
                </div>
            </div>

            <div className={styles.bottom}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p>© {new Date().getFullYear()} Geo Blog. All rights reserved.</p>
                    <Link href="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
                </div>
            </div>
        </footer>
    );
}
