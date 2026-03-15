'use client';

import { useState, useEffect } from 'react';
import styles from './NewsletterPopup.module.css';

const POPUP_DELAY_MS = 15000;        // Show after 15 seconds
const DISMISS_DURATION_DAYS = 7;     // Don't show again for 7 days
const STORAGE_KEY = 'geo_blog_popup_dismissed';
const SUBSCRIBED_KEY = 'geo_blog_subscribed';

export default function NewsletterPopup() {
    const [visible, setVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        try {
            // Don't show if already subscribed
            if (localStorage.getItem(SUBSCRIBED_KEY) === 'true') return;

            // Don't show if dismissed recently
            const dismissed = localStorage.getItem(STORAGE_KEY);
            if (dismissed) {
                const dismissedAt = parseInt(dismissed, 10);
                const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
                if (daysSince < DISMISS_DURATION_DAYS) return;
            }
        } catch {
            // localStorage not available, show popup anyway
        }

        const timer = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        try {
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
        } catch { }
    };

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
            try { localStorage.setItem(SUBSCRIBED_KEY, 'true'); } catch { }

            // Auto-close after success
            setTimeout(() => setVisible(false), 3000);
        } catch {
            setStatus('error');
            setErrorMsg('Network error. Please try again.');
        }
    };

    if (!visible) return null;

    return (
        <div className={styles.overlay} onClick={handleDismiss}>
            <div
                className={styles.card}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className={styles.close}
                    onClick={handleDismiss}
                    aria-label="Close newsletter popup"
                >
                    ✕
                </button>

                <div className={styles.icon}>✉</div>
                <h3 className={styles.heading}>Stay Informed</h3>
                <p className={styles.description}>
                    Get breaking news, in-depth reporting, and expert analysis
                    delivered straight to your inbox. Join our growing community.
                </p>

                {status === 'success' ? (
                    <div className={styles.successBox}>
                        <span className={styles.checkmark}>✓</span>
                        <p>You&apos;re all set! Welcome aboard.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                            disabled={status === 'loading'}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                        </button>
                    </form>
                )}

                {status === 'error' && (
                    <p className={styles.error}>{errorMsg}</p>
                )}

                <p className={styles.privacy}>
                    No spam, ever. Unsubscribe anytime.
                </p>
            </div>
        </div>
    );
}
