# Google Ads Monetization Checklist

To get the article site ready for Google Ads (and stay in compliance), keep this living document up to date:

1. **Privacy & Consent**
   - Surface the newly published privacy policy at `/privacy-policy`, link it from the footer, and include a short summary near ads so visitors know what data is shared.
   - Show a cookie banner that pauses any marketing/advertising cookies until consent is granted. Record consent timestamps and allow visitors to change preferences.
   - Offer a clear contact method (privacy@article-ops.example) for GDPR/CCPA inquiries and ad review questions.

2. **Ad Placement & Layout**
   - Reserve non-disruptive slots: hero leaderboard, sticky footer (mobile), and between article sections with responsive spacing.
   - Avoid interstitial/pop-up ads that obscure content; if you test new formats, ensure they meet Google’s policies before going live.
   - Use `loading="lazy"` for ad creatives and any media assets (images, charts) in the same viewport to improve LCP.

3. **Page Performance & Stability**
   - Monitor Core Web Vitals (LCP < 2.5s, CLS < 0.1, FID < 100ms). Optimize by preloading fonts, deferring third-party scripts, and compressing images.
   - Limit the number of ad refresh calls in a single viewport to keep CLS under control. Prefer asynchronous tag loading.
   - Use a fast CDN for the static site, and keep CSS/JS bundles small.

4. **Content & SEO Signals**
   - Keep articles structured with semantic headings, bullet takeaways, and schema-friendly metadata (open graph + JSON-LD). Ads perform better when content stays authoritative.
   - Highlight author information, sources, and date published for credibility.
   - Populate the Google Ads guidance document in Sanity so editorial and engineering teammates know what to change when CPCs shift.

5. **Verification & Measurement**
   - Document RPM/CTR trends per article and note any experiments in the Google Ads guidance schema.
   - Implement first-party analytics that respect privacy choices (e.g., GA4 with consent gating).
   - When you revise the privacy policy or ad placements, bump `lastReviewed`/`lastUpdated` in the Sanity documents to show auditors the policy is current.

Use this checklist before any new monetization push. When in doubt, review Google’s Publisher Policies and run the policy compliance tool directly within your Google AdSense account.
