import StudioClient from './StudioClient';

// Pre-render /studio as a single static page for the static export
export function generateStaticParams() {
    return [{}];
}

export default function StudioPage() {
    return <StudioClient />;
}
