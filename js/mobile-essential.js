// mobile-essential.js
// Minimal JavaScript for mobile devices to prevent freezing

document.addEventListener('DOMContentLoaded', function() {
    // 1. Disable smooth scrolling
    document.documentElement.style.scrollBehavior = 'auto';
    
    // 2. Handle mobile menu toggle if it exists
    const menuButton = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
                navLinks.classList.remove('active');
            }
        });
    }
    
    // 3. Prevent zooming
    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) { 
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, { passive: false });
    
    // 4. Optimize images for mobile
    const lazyLoadImages = function() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    };
    
    // Run once when DOM is loaded
    lazyLoadImages();
    
    // 5. Fix for iOS viewport height
    function updateVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Initial call
    updateVH();
    
    // Update on resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateVH, 250);
    });
    
    // 6. Disable animations after page load
    setTimeout(function() {
        document.documentElement.classList.add('animations-disabled');
    }, 1000);
});
