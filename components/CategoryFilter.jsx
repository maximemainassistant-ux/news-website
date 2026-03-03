'use client';

import Link from 'next/link';
import { categories } from '@/lib/categories';
import styles from '@/app/(site)/page.module.css';

export default function CategoryFilter({ activeCategory }) {
    return (
        <div className={styles.filterBar}>
            <Link
                href="/"
                className={`${styles.filterBtn} ${activeCategory === 'All' ? styles.filterBtnActive : ''}`}
            >
                All
            </Link>
            {categories.map((cat) => (
                <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className={`${styles.filterBtn} ${activeCategory === cat.label ? styles.filterBtnActive : ''}`}
                >
                    {cat.label}
                </Link>
            ))}
        </div>
    );
}
