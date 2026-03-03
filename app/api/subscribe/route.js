import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Simple in-memory rate limiter (5 requests per IP per minute)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { timestamp: now, count: 1 });
        return false;
    }

    entry.count++;
    return entry.count > MAX_REQUESTS;
}

export async function POST(request) {
    try {
        // Rate limiting
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
            || headersList.get('x-real-ip')
            || 'unknown';

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const { email } = await request.json();

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        const API_KEY = process.env.MAILERLITE_API_KEY;

        if (!API_KEY) {
            console.error('MAILERLITE_API_KEY is not set');
            return NextResponse.json(
                { error: 'Newsletter service is not configured.' },
                { status: 500 }
            );
        }

        // Call MailerLite API to create/upsert subscriber
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                email,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle MailerLite validation errors
            if (response.status === 422 && data.errors) {
                const errorMessage = Object.values(data.errors).flat().join(', ');
                return NextResponse.json(
                    { error: errorMessage },
                    { status: 422 }
                );
            }

            console.error('MailerLite API error:', data);
            return NextResponse.json(
                { error: 'Failed to subscribe. Please try again later.' },
                { status: response.status }
            );
        }

        // 201 = new subscriber, 200 = already existed (upserted)
        return NextResponse.json(
            {
                message: 'Successfully subscribed!',
                isNew: response.status === 201,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Subscribe API error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}

