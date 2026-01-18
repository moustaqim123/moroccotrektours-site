CTA QA Checklist — Morocco Tours Gate

1. Link & Functionality
- [ ] `Book Now` button uses the official WhatsApp link: `https://wa.me/212659565040` (or prefill param when needed).
- [ ] Floating `.whatsapp-float` opens WhatsApp app on mobile and WhatsApp Web on desktop.
- [ ] All CTAs use `target="_blank" rel="noopener"` for external links.

2. Visual & Responsiveness
- [ ] Primary CTA (`.btn-primary`) is visually dominant on desktop hero and near pricing.
- [ ] On mobile the sticky `.cta-strip` appears and is not occluded by other UI.
- [ ] Floating button is at least 48x48 touch target (we use 56x56).

3. Accessibility
- [ ] Buttons have meaningful `aria-label` attributes.
- [ ] Focus outlines visible and keyboard operable.
- [ ] Contrast of text vs background meets WCAG AA.

4. Trust & Copy
- [ ] Microcopy near CTAs communicates speed and personal service (e.g., “Fast replies from local guides”).
- [ ] Trust badges (example: “Local guides · Secure booking · Free cancellation 48h”) present near CTA.

5. Analytics & Tracking
- [ ] Click events for `Book Now` and floating WhatsApp are tracked in analytics (e.g., dataLayer push or `gtag('event',...)`).
- [ ] Prefill templates are tracked (e.g., which tour was requested).

6. Cross-platform Testing
- [ ] Test on iOS Safari, Android Chrome, and Desktop Chrome/Firefox (WhatsApp opens correctly).
- [ ] Test with WhatsApp Desktop app installed (link should open app where supported).

7. Performance & Safety
- [ ] SVG and CSS files are optimized (minified when deploying).
- [ ] External resources use `rel="noopener"` and no mixed content.

Quick integration notes:
- Include `css/cta-whatsapp.css` in the site stylesheet imports.
- Add the SVG to `assets/whatsapp-booknow.svg` and reference it where needed or inline as an `<img>`/`<svg>`.
- Replace existing `whatsapp-float` anchors with the wa.me link including a prefilled message for per-tour CTAs.

Optional A/B tests to run:
- Test CTA label: `Book Now` (control) vs `Book Now — Instant WhatsApp`.
- Test primary color contrast (brand color vs high-contrast accent).
- Test presence of floating button vs sticky strip on mobile.
