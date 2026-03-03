import { KineticNavigation } from '@/components/ui/sterling-gate-kinetic-navigation';
import { AmbientShapes } from '@/components/ui/shape-landing-hero';
import Footer from '@/components/Footer';
import NewsletterPopup from '@/components/NewsletterPopup';

export default function SiteLayout({ children }) {
    return (
        <>
            <AmbientShapes />
            <KineticNavigation />
            <main style={{ paddingTop: '64px', position: 'relative', zIndex: 1 }}>{children}</main>
            <Footer />
            <NewsletterPopup />
        </>
    );
}
