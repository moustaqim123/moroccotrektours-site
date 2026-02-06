/**
 * SMOOTH PAGE TRANSITIONS
 * Handles smooth page transitions on mobile devices
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        transitionDuration: 300, // milliseconds
        enableOnDesktop: false,
        preloadNextPage: true
    };

    // Check if mobile device
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Create transition overlay
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.innerHTML = `
            <div class="page-loader">
                <div class="page-loader-logo"></div>
                <div class="page-loader-spinner"></div>
                <div class="page-loader-text">Loading...</div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    // Show transition overlay
    function showTransition(overlay) {
        document.body.classList.add('transitioning');
        overlay.classList.add('active');
    }

    // Hide transition overlay
    function hideTransition(overlay) {
        overlay.classList.remove('active');
        document.body.classList.remove('transitioning');
    }

    // Handle page load
    function handlePageLoad() {
        const overlay = document.querySelector('.page-transition-overlay');
        if (overlay) {
            setTimeout(() => {
                hideTransition(overlay);
            }, 100);
        }
    }

    // Handle link clicks
    function handleLinkClick(e) {
        // Only apply on mobile (or if enabled on desktop)
        if (!isMobile() && !CONFIG.enableOnDesktop) {
            return;
        }

        const link = e.currentTarget;
        const href = link.getAttribute('href');

        // Skip if:
        // - External link
        // - Anchor link
        // - Special link (tel:, mailto:, javascript:)
        // - Download link
        // - Target blank
        if (!href ||
            href.startsWith('http') ||
            href.startsWith('#') ||
            href.startsWith('tel:') ||
            href.startsWith('mailto:') ||
            href.startsWith('javascript:') ||
            link.hasAttribute('download') ||
            link.target === '_blank') {
            return;
        }

        // Prevent default navigation
        e.preventDefault();

        // Get or create overlay
        let overlay = document.querySelector('.page-transition-overlay');
        if (!overlay) {
            overlay = createOverlay();
        }

        // Show transition
        showTransition(overlay);

        // Navigate after transition
        setTimeout(() => {
            window.location.href = href;
        }, CONFIG.transitionDuration);
    }

    // Preload critical resources
    function preloadResources() {
        // Preload fonts
        const fonts = [
            'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap'
        ];

        fonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = font;
            document.head.appendChild(link);
        });
    }

    // Initialize
    function init() {
        // Create overlay on page load
        const overlay = createOverlay();

        // Hide overlay when page is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handlePageLoad);
        } else {
            handlePageLoad();
        }

        // Add click handlers to all internal links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                handleLinkClick.call(link, e);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                // Page was loaded from cache
                handlePageLoad();
            }
        });

        // Preload resources
        if (CONFIG.preloadNextPage) {
            preloadResources();
        }

        // Optimize for mobile
        if (isMobile()) {
            // Prevent bounce scrolling on iOS
            document.body.style.overscrollBehavior = 'none';
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
