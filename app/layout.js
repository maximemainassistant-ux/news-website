import './globals.css';

export const metadata = {
  title: 'Geo Blog',
  description:
    'Geo Blog delivers the most important news, reporting, and expert analysis on politics, business, technology, climate, and well-being.',
  keywords: [
    'news',
    'blog',
    'politics',
    'business',
    'technology',
    'climate',
    'well-being',
  ],
  openGraph: {
    title: 'Geo Blog',
    description:
      'News, in-depth reporting, and expert analysis.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to set theme before paint — prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme') || 'light';
                  if (t === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else if (t === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
