// mobile-optimization.js
(function() {
    // 1. Prevent 100vh issues on mobile
    function fixVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // 2. Disable animations on low-end devices
    const isLowEndDevice = (() => {
        const ua = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const isLowEnd = /(android|iphone|ipod|ipad).*?mobile.*safari/i.test(ua.toLowerCase());
        return isMobile && isLowEnd;
    })();

    // 3. Optimize images for mobile
    function optimizeImages() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // 4. Disable zoom on mobile
    function disableZoom() {
        document.addEventListener('touchmove', function(event) {
            if (event.scale !== 1) {
                event.preventDefault();
            }
        }, { passive: false });
    }

    // 5. Optimize animations
    function optimizeAnimations() {
        if (isLowEndDevice) {
            document.documentElement.classList.add('low-end-device');
        }
    }

    // 6. Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        fixVH();
        optimizeImages();
        disableZoom();
        optimizeAnimations();
    });

    // 7. Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        document.body.classList.add('resize-animation-stopper');
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            document.body.classList.remove('resize-animation-stopper');
        }, 400);
        fixVH();
    });

    // 8. Handle orientation change
    window.addEventListener('orientationchange', function() {
        fixVH();
    }, false);
})();
