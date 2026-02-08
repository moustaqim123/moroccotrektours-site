document.addEventListener('DOMContentLoaded', () => {
    // --- إعدادات المعرض والصور ---
    const imgExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp'];

    async function fetchImageList() {
        try { const res = await fetch('/api/images', { cache: 'no-store' }); if (res.ok) return await res.json(); } catch { }
        try { const res2 = await fetch('images.json', { cache: 'no-store' }); if (res2.ok) return await res2.json(); } catch { }
        return [];
    }

    function filenameToCaption(name) {
        try { return decodeURIComponent(name).replace(/\.[^.]+$/, ''); } catch { return name.replace(/\.[^.]+$/, ''); }
    }

    function buildGalleryItem(obj, index) {
        const url = (typeof obj === 'string') ? obj : (obj.url || obj.name);
        const thumb = (typeof obj === 'string') ? null : (obj.thumb || null);
        const name = (typeof obj === 'string') ? (obj.split('/').pop()) : (obj.name || (obj.url && obj.url.split('/').pop()));

        const figure = document.createElement('figure');
        figure.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = thumb || url;
        img.alt = filenameToCaption(name || '');
        img.loading = 'lazy';
        img.dataset.full = url;

        const caption = document.createElement('figcaption');
        caption.className = 'gallery-caption';
        caption.textContent = filenameToCaption(name || '');

        figure.appendChild(img);
        figure.appendChild(caption);
        figure.addEventListener('click', () => openLightboxByIndex(index));

        return figure;
    }

    // --- Lightbox (نافذة عرض الصور) ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');

    let imagesList = [];
    let currentIndex = -1;

    function openLightboxByIndex(idx) {
        if (!lightbox || !Array.isArray(imagesList) || idx < 0 || idx >= imagesList.length) return;
        const it = imagesList[idx];
        currentIndex = idx;
        lightboxImg.src = it.url;
        lightboxImg.alt = filenameToCaption(it.name || '');
        lightboxCaption.textContent = filenameToCaption(it.name || '');
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        preloadIndex(idx - 1);
        preloadIndex(idx + 1);
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.src = '';
        currentIndex = -1;
    }

    function gotoIndex(idx) {
        if (!Array.isArray(imagesList) || imagesList.length === 0) return;
        if (idx < 0) idx = imagesList.length - 1;
        if (idx >= imagesList.length) idx = 0;
        openLightboxByIndex(idx);
    }

    function prevImage() { gotoIndex(currentIndex - 1); }
    function nextImage() { gotoIndex(currentIndex + 1); }

    function preloadIndex(idx) {
        if (!Array.isArray(imagesList) || idx < 0 || idx >= imagesList.length) return;
        const url = imagesList[idx].url;
        const im = new Image();
        im.src = url;
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });

    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
    if (lightboxNext) lightboxNext.addEventListener('click', nextImage);

    // --- معالجة البيانات وتحديث المعرض ---
    // --- Premium Gallery Slider Logic ---
    let sliderState = {
        images: [],
        currentIndex: 0
    };

    async function initSlider() {
        const container = document.getElementById('gallery');
        if (!container) return;

        // Clear container and setup slider structure
        container.className = 'gallery-slider-container';
        container.innerHTML = `
            <div class="gallery-slider-wrapper" id="slider-wrapper">
                <div class="gallery-slider-track" id="slider-track"></div>
            </div>
            <button class="slider-nav prev" id="slider-prev" aria-label="Previous Slide">‹</button>
            <button class="slider-nav next" id="slider-next" aria-label="Next Slide">›</button>
        `;

        const track = document.getElementById('slider-track');
        const wrapper = document.getElementById('slider-wrapper');
        const prevBtn = document.getElementById('slider-prev');
        const nextBtn = document.getElementById('slider-next');

        // Fetch images
        let images = [];
        try {
            const res = await fetch('/api/images', { cache: 'no-store' });
            if (res.ok) images = await res.json();
            else throw new Error('API fetch failed');
        } catch {
            try {
                const res2 = await fetch('images.json', { cache: 'no-store' });
                if (res2.ok) images = await res2.json();
            } catch { }
        }

        // Constraint: Load images from images/gallery/ and its subfolders.
        const galleryRegex = /^\/?images\/gallery\//i;

        sliderState.images = (images || [])
            .filter(i => {
                const url = (typeof i === 'string') ? i : i.url;
                return galleryRegex.test(url);
            })
            .map(i => {
                const rawUrl = (typeof i === 'string') ? i : i.url;
                return {
                    url: rawUrl,
                    name: (typeof i === 'string') ? i.split('/').pop() : (i.name || rawUrl.split('/').pop())
                };
            });

        if (sliderState.images.length === 0) {
            container.innerHTML = '<p class="text-center" style="color: #fff; padding: 2rem;">Discovering our gallery...</p>';
            return;
        }

        // Build Slides
        const frag = document.createDocumentFragment();
        sliderState.images.forEach((img, idx) => {
            const slide = document.createElement('div');
            slide.className = 'gallery-slide';

            // Image element
            const imageEl = document.createElement('img');
            imageEl.dataset.src = img.url; // Lazy load source
            imageEl.alt = filenameToCaption(img.name);
            imageEl.className = 'slider-image';
            imageEl.loading = 'lazy';

            // Fullscreen trigger (integration with existing lightbox)
            imageEl.addEventListener('click', () => openLightboxByIndex(idx));

            slide.appendChild(imageEl);
            frag.appendChild(slide);
        });
        track.appendChild(frag);

        // --- SLIDER LOGIC & AUTOPLAY ---
        let autoPlayTimer = null;
        const ADVANCE_INTERVAL = 3000; // 3 seconds

        function getVisibleSlideWidth() {
            const firstSlide = track.querySelector('.gallery-slide');
            if (!firstSlide) return 320;
            const style = window.getComputedStyle(firstSlide);
            const marginRight = parseFloat(style.marginRight) || 20; // fallback gap
            return firstSlide.offsetWidth + marginRight;
        }

        function scrollNext() {
            const slideWidth = getVisibleSlideWidth();
            const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

            if (wrapper.scrollLeft >= maxScroll - 5) {
                // Loop back to start
                wrapper.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                wrapper.scrollBy({ left: slideWidth, behavior: 'smooth' });
            }
        }

        function scrollPrev() {
            const slideWidth = getVisibleSlideWidth();
            if (wrapper.scrollLeft <= 5) {
                // Loop to end
                wrapper.scrollTo({ left: wrapper.scrollWidth, behavior: 'smooth' });
            } else {
                wrapper.scrollBy({ left: -slideWidth, behavior: 'smooth' });
            }
        }

        function startAutoPlay() {
            if (autoPlayTimer) clearInterval(autoPlayTimer);
            autoPlayTimer = setInterval(scrollNext, ADVANCE_INTERVAL);
        }

        function stopAutoPlay() {
            if (autoPlayTimer) clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }

        // Manual Navigation
        prevBtn.addEventListener('click', () => {
            scrollPrev();
            startAutoPlay(); // Reset timer on click
        });

        nextBtn.addEventListener('click', () => {
            scrollNext();
            startAutoPlay(); // Reset timer on click
        });

        // Pause on Hover
        container.addEventListener('mouseenter', stopAutoPlay);
        container.addEventListener('mouseleave', startAutoPlay);

        // --- Intersection Observer for Lazy Loading ---
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    obs.unobserve(img);
                }
            });
        }, { root: null, rootMargin: '200px' });

        track.querySelectorAll('.slider-image').forEach(img => observer.observe(img));

        // Start autoplay on init
        startAutoPlay();

        // Update Lightbox list for sync
        imagesList = sliderState.images;
    }

    // Initialize Slider
    initSlider();

    // --- Live Reload for Gallery ---
    if (typeof io !== 'undefined') {
        const socket = io();
        socket.on('images-changed', () => {
            console.log('Images change detected, refreshing gallery...');
            initSlider();
        });
    }

    // --- أزرار WhatsApp "Book Now" ---
    // --- أزرار WhatsApp "Book Now" ---
    document.addEventListener('click', function (e) {
        let target = e.target.closest('.book-now');

        // Also check for the specific "Contact Us to Book" buttons on tour pages
        if (!target) {
            const btn = e.target.closest('.btn');
            // Check text content, handling potential newlines/spaces
            if (btn && btn.textContent.replace(/\s+/g, ' ').trim().includes('Contact Us to Book')) {
                target = btn;
            }
        }

        if (!target) return;
        e.preventDefault();

        // New Logic: Check if within a Toubkal card with a duration selector
        const card = target.closest('.tour-card.tour-toubkal');
        let selectedDuration = '';
        if (card) {
            const select = card.querySelector('.day-select');
            if (select) {
                selectedDuration = select.options[select.selectedIndex].text;
            }
        }

        const phoneNumber = '212659565040';
        let preFilledMessage = 'Hello! I want to book now.';
        if (selectedDuration) {
            preFilledMessage = `Hello! I am interested in booking the Toubkal tour for: ${selectedDuration}.`;
        }

        const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
        let url = isMobile
            ? `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(preFilledMessage)}`
            : `https://wa.me/${phoneNumber}?text=${encodeURIComponent(preFilledMessage)}`;
        window.open(url, '_blank');
    });

    // --- Modern VCard Feature ---
    
    // Create modern VCard with site information
    async function createModernVCard() {
        const vcardData = {
            name: 'Morocco Trek Tours',
            org: 'Morocco Trek Tours',
            phone: '+212659565040',
            email: 'info@moroccotrektours.com',
            website: 'https://moroccotrektours.com',
            address: 'Imlil, Marrakech, Morocco',
            description: 'Expert-guided mountain trekking and desert adventures in Morocco'
        };
        
        const lines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            'FN:' + vcardData.name,
            'N:Tours;Morocco;;;',
            'ORG:' + vcardData.org,
            'TEL;TYPE=CELL,VOICE;PREF:' + vcardData.phone,
            'TEL;TYPE=WORK,VOICE:' + vcardData.phone,
            'EMAIL:' + vcardData.email,
            'URL:' + vcardData.website,
            'ADR;TYPE=WORK:;;' + vcardData.address + ';;;;',
            'NOTE:' + vcardData.description,
            'END:VCARD'
        ];
        
        return new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
    }
    
    // Modern VCard button creation
    function createModernVCardButton() {
        // Remove existing buttons
        document.querySelectorAll('.modern-vcard-btn').forEach(el => el.remove());
        
        // Create modern button
        const button = document.createElement('div');
        button.className = 'modern-vcard-btn';
        button.innerHTML = `
            <div class="vcard-icon">
                <i class="fas fa-address-book"></i>
            </div>
            <div class="vcard-content">
                <span class="vcard-title">Save Contact</span>
                <span class="vcard-subtitle">Add Morocco Trek Tours to your phone</span>
            </div>
            <div class="vcard-pulse"></div>
            <div class="vcard-intro">
                <div class="intro-icon">
                    <i class="fas fa-info"></i>
                </div>
                <div class="intro-text">
                    <strong>Save Our Contact</strong>
                    <span>Quickly add our contact details to your phone for easy booking</span>
                </div>
                <div class="intro-close">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        `;
        
        button.addEventListener('click', async (e) => {
            // Check if clicking on intro close button
            if (e.target.closest('.intro-close')) {
                button.classList.remove('intro-show');
                return;
            }
            
            button.classList.add('vcard-loading');
            
            try {
                const blob = await createModernVCard();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Morocco_Trek_Tours.vcf';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                
                // Success feedback
                button.classList.add('vcard-success');
                setTimeout(() => {
                    button.classList.remove('vcard-success');
                }, 2000);
            } catch (error) {
                console.error('Error creating VCard:', error);
                button.classList.add('vcard-error');
                setTimeout(() => {
                    button.classList.remove('vcard-error');
                }, 2000);
            } finally {
                button.classList.remove('vcard-loading');
            }
        });
        
        // Show intro tooltip on first visit
        if (!localStorage.getItem('vcard-intro-shown')) {
            setTimeout(() => {
                button.classList.add('intro-show');
                localStorage.setItem('vcard-intro-shown', 'true');
            }, 2000);
        }
        
        // Hide intro when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.modern-vcard-btn')) {
                button.classList.remove('intro-show');
            }
        });
        
        document.body.appendChild(button);
        
        // Add modern styles
        const style = document.createElement('style');
        style.id = 'modern-vcard-styles';
        style.innerHTML = `
            .modern-vcard-btn {
                position: fixed;
                bottom: 30px;
                left: 30px;
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
            }
            
            .modern-vcard-btn:hover {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                transform: translateY(-5px) scale(1.05);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
            }
            
            .modern-vcard-btn.vcard-loading {
                pointer-events: none;
                background: rgba(255, 255, 255, 0.2);
            }
            
            .modern-vcard-btn.vcard-success {
                background: rgba(17, 153, 142, 0.2);
                border-color: rgba(17, 153, 142, 0.4);
                box-shadow: 0 8px 32px rgba(17, 153, 142, 0.2);
            }
            
            .modern-vcard-btn.vcard-error {
                background: rgba(238, 9, 121, 0.2);
                border-color: rgba(238, 9, 121, 0.4);
                box-shadow: 0 8px 32px rgba(238, 9, 121, 0.2);
            }
            
            .vcard-icon {
                font-size: 24px;
                color: rgba(255, 255, 255, 0.9);
                transition: all 0.3s ease;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .modern-vcard-btn:hover .vcard-icon {
                color: rgba(255, 255, 255, 1);
                transform: scale(1.1);
                text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .vcard-content {
                position: absolute;
                left: 80px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: white;
                padding: 12px 16px;
                border-radius: 12px;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
                transform: translateX(-20px);
                white-space: nowrap;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            }
            
            .modern-vcard-btn:hover .vcard-content {
                opacity: 1;
                transform: translateX(0);
            }
            
            .vcard-title {
                display: block;
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 2px;
            }
            
            .vcard-subtitle {
                display: block;
                font-size: 12px;
                opacity: 0.8;
            }
            
            /* Intro Tooltip Styles */
            .vcard-intro {
                position: absolute;
                bottom: 80px;
                left: 0;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                padding: 16px;
                min-width: 280px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px) scale(0.9);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                z-index: 1001;
            }
            
            .modern-vcard-btn.intro-show .vcard-intro {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
            }
            
            .intro-icon {
                position: absolute;
                top: -12px;
                left: 20px;
                width: 24px;
                height: 24px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #333;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .intro-text {
                margin-bottom: 12px;
            }
            
            .intro-text strong {
                display: block;
                color: white;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .intro-text span {
                display: block;
                color: rgba(255, 255, 255, 0.8);
                font-size: 12px;
                line-height: 1.4;
            }
            
            .intro-close {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 20px;
                height: 20px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .intro-close:hover {
                background: rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 1);
                transform: scale(1.1);
            }
            
            .vcard-pulse {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                height: 100%;
                border-radius: 20px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                animation: pulse 2s infinite;
            }
            
            .modern-vcard-btn.vcard-loading .vcard-pulse {
                border-color: rgba(255, 255, 255, 0.6);
                animation: spin 1s linear infinite;
            }
            
            .modern-vcard-btn.vcard-loading .vcard-icon {
                animation: spin 1s linear infinite;
            }
            
            @keyframes pulse {
                0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                    border-color: rgba(255, 255, 255, 0.3);
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.1);
                    opacity: 0.6;
                    border-color: rgba(255, 255, 255, 0.5);
                }
                100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                    border-color: rgba(255, 255, 255, 0.3);
                }
            }
            
            @keyframes spin {
                0% {
                    transform: translate(-50%, -50%) rotate(0deg);
                }
                100% {
                    transform: translate(-50%, -50%) rotate(360deg);
                }
            }
            
            /* Mobile Responsive */
            @media (max-width: 768px) {
                .modern-vcard-btn {
                    bottom: 20px;
                    left: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 15px;
                }
                
                .vcard-icon {
                    font-size: 20px;
                }
                
                .vcard-content {
                    left: 70px;
                    padding: 10px 14px;
                }
                
                .vcard-title {
                    font-size: 13px;
                }
                
                .vcard-subtitle {
                    font-size: 11px;
                }
                
                .vcard-intro {
                    bottom: 70px;
                    left: -10px;
                    min-width: 250px;
                    padding: 14px;
                }
                
                .intro-icon {
                    left: 15px;
                }
                
                .intro-text strong {
                    font-size: 13px;
                }
                
                .intro-text span {
                    font-size: 11px;
                }
            }
            
            @media (max-width: 480px) {
                .modern-vcard-btn {
                    bottom: 15px;
                    left: 15px;
                    width: 45px;
                    height: 45px;
                }
                
                .vcard-icon {
                    font-size: 18px;
                }
                
                .vcard-content {
                    display: none;
                }
                
                .vcard-intro {
                    bottom: 65px;
                    left: -20px;
                    min-width: 220px;
                    padding: 12px;
                }
                
                .intro-icon {
                    left: 10px;
                    width: 20px;
                    height: 20px;
                    font-size: 10px;
                }
                
                .intro-text strong {
                    font-size: 12px;
                }
                
                .intro-text span {
                    font-size: 10px;
                }
                
                .intro-close {
                    width: 18px;
                    height: 18px;
                    font-size: 9px;
                }
            }
        `;
        
        // Remove existing styles
        const existingStyle = document.getElementById('modern-vcard-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);
    }
    
    // Initialize modern VCard button
    createModernVCardButton();
    
    // --- Modern WhatsApp Button ---
    
    // Create modern WhatsApp button
    function createModernWhatsAppButton() {
        // Remove existing buttons
        document.querySelectorAll('.modern-whatsapp-btn').forEach(el => el.remove());
        
        // Create modern WhatsApp button
        const button = document.createElement('div');
        button.className = 'modern-whatsapp-btn';
        button.innerHTML = `
            <div class="whatsapp-icon">
                <i class="fab fa-whatsapp"></i>
            </div>
            <div class="whatsapp-content">
                <span class="whatsapp-title">Chat on WhatsApp</span>
                <span class="whatsapp-subtitle">Quick booking support</span>
            </div>
            <div class="whatsapp-pulse"></div>
            <div class="whatsapp-intro">
                <div class="intro-icon">
                    <i class="fab fa-whatsapp"></i>
                </div>
                <div class="intro-text">
                    <strong>Chat with Us</strong>
                    <span>Get instant help and book your adventure</span>
                </div>
                <div class="intro-close">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        `;
        
        button.addEventListener('click', async (e) => {
            // Check if clicking on intro close button
            if (e.target.closest('.intro-close')) {
                button.classList.remove('intro-show');
                return;
            }
            
            // Open WhatsApp
            const phoneNumber = '212659565040';
            const message = 'Hello! I am interested in booking a tour with Morocco Trek Tours.';
            const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
            let url = isMobile
                ? `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
                : `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });
        
        // Show intro tooltip on first visit
        if (!localStorage.getItem('whatsapp-intro-shown')) {
            setTimeout(() => {
                button.classList.add('intro-show');
                localStorage.setItem('whatsapp-intro-shown', 'true');
            }, 3000);
        }
        
        // Hide intro when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.modern-whatsapp-btn')) {
                button.classList.remove('intro-show');
            }
        });
        
        document.body.appendChild(button);
        
        // Add WhatsApp styles to existing style sheet
        const existingStyle = document.getElementById('modern-vcard-styles');
        if (existingStyle) {
            existingStyle.innerHTML += `
                
                /* WhatsApp Button Styles */
                .modern-whatsapp-btn {
                    position: fixed;
                    bottom: 30px;
                    left: 110px;
                    width: 60px;
                    height: 60px;
                    background: rgba(37, 211, 102, 0.15);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(37, 211, 102, 0.3);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 1000;
                    box-shadow: 0 8px 32px rgba(37, 211, 102, 0.15);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }
                
                .modern-whatsapp-btn:hover {
                    background: rgba(37, 211, 102, 0.2);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    transform: translateY(-5px) scale(1.05);
                    box-shadow: 0 12px 40px rgba(37, 211, 102, 0.25);
                    border-color: rgba(37, 211, 102, 0.4);
                }
                
                .whatsapp-icon {
                    font-size: 24px;
                    color: rgba(37, 211, 102, 0.9);
                    transition: all 0.3s ease;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .modern-whatsapp-btn:hover .whatsapp-icon {
                    color: rgba(37, 211, 102, 1);
                    transform: scale(1.1);
                    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
                
                .whatsapp-content {
                    position: absolute;
                    left: 80px;
                    background: rgba(37, 211, 102, 0.9);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 12px 16px;
                    border-radius: 12px;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s ease;
                    transform: translateX(-20px);
                    white-space: nowrap;
                    box-shadow: 0 8px 32px rgba(37, 211, 102, 0.3);
                }
                
                .modern-whatsapp-btn:hover .whatsapp-content {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .whatsapp-title {
                    display: block;
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 2px;
                }
                
                .whatsapp-subtitle {
                    display: block;
                    font-size: 12px;
                    opacity: 0.9;
                }
                
                .whatsapp-pulse {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%;
                    height: 100%;
                    border-radius: 20px;
                    border: 2px solid rgba(37, 211, 102, 0.4);
                    animation: pulse 2s infinite;
                }
                
                .whatsapp-intro {
                    position: absolute;
                    bottom: 80px;
                    left: 0;
                    background: rgba(37, 211, 102, 0.9);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 16px;
                    padding: 16px;
                    min-width: 280px;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(20px) scale(0.9);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 20px 60px rgba(37, 211, 102, 0.3);
                    z-index: 1001;
                }
                
                .modern-whatsapp-btn.intro-show .whatsapp-intro {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0) scale(1);
                }
                
                .whatsapp-intro .intro-icon {
                    background: rgba(255, 255, 255, 0.9);
                    color: #25d366;
                }
                
                .whatsapp-intro .intro-text strong {
                    color: white;
                }
                
                .whatsapp-intro .intro-text span {
                    color: rgba(255, 255, 255, 0.9);
                }
                
                /* WhatsApp Mobile Responsive */
                @media (max-width: 768px) {
                    .modern-whatsapp-btn {
                        bottom: 20px;
                        left: 80px;
                        width: 50px;
                        height: 50px;
                        border-radius: 15px;
                    }
                    
                    .whatsapp-icon {
                        font-size: 20px;
                    }
                    
                    .whatsapp-content {
                        left: 70px;
                        padding: 10px 14px;
                    }
                    
                    .whatsapp-title {
                        font-size: 13px;
                    }
                    
                    .whatsapp-subtitle {
                        font-size: 11px;
                    }
                    
                    .whatsapp-intro {
                        bottom: 70px;
                        left: -10px;
                        min-width: 250px;
                        padding: 14px;
                    }
                    
                    .whatsapp-intro .intro-icon {
                        left: 15px;
                        width: 20px;
                        height: 20px;
                        font-size: 10px;
                    }
                    
                    .whatsapp-intro .intro-text strong {
                        font-size: 13px;
                    }
                    
                    .whatsapp-intro .intro-text span {
                        font-size: 11px;
                    }
                }
                
                @media (max-width: 480px) {
                    .modern-whatsapp-btn {
                        bottom: 15px;
                        left: 70px;
                        width: 45px;
                        height: 45px;
                    }
                    
                    .whatsapp-icon {
                        font-size: 18px;
                    }
                    
                    .whatsapp-content {
                        display: none;
                    }
                    
                    .whatsapp-intro {
                        bottom: 65px;
                        left: -20px;
                        min-width: 220px;
                        padding: 12px;
                    }
                    
                    .whatsapp-intro .intro-icon {
                        left: 10px;
                        width: 18px;
                        height: 18px;
                        font-size: 9px;
                    }
                    
                    .whatsapp-intro .intro-text strong {
                        font-size: 12px;
                    }
                    
                    .whatsapp-intro .intro-text span {
                        font-size: 10px;
                    }
                }
            `;
        }
    }
    
    // Initialize modern WhatsApp button
    createModernWhatsAppButton();

    // --- Global Card Clickability (Tours & Blog) ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.tour-card, .blog-card');
        if (!card) return;

        // If the user clicked a button or a link inside the card, 
        // let the default behavior (or other handlers) take over.
        if (e.target.closest('a, button')) return;

        // Find the destination link inside the card
        // Tour cards use .btn-secondary, Blog cards use .read-more
        const detailsLink = card.querySelector('.btn-secondary[href], .read-more[href]');
        if (detailsLink) {
            window.location.href = detailsLink.getAttribute('href');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
            });
        });
    }

    // --- Unify Tour Detail Inline Styles ---
    // Many tour pages have inline styles on itinerary blocks (duration-section/itinerary-option).
    // We remove those inline styles (only inside .tour-main-content) so global CSS can unify the UI.
    (function normalizeTourDetailStyles() {
        const main = document.querySelector('.tour-main-content');
        if (!main) return;

        const selectors = [
            '.duration-section[style]',
            '.duration-section h3[style]',
            '.itinerary-option[style]',
            '.itinerary-option h3[style]',
            '.itinerary-options-container[style]',
            '#itinerary [style]'
        ];

        const nodes = main.querySelectorAll(selectors.join(','));
        nodes.forEach(el => {
            // Keep intentional inline icon colors / small UI accents outside itinerary blocks.
            // Since we scope to .tour-main-content, be conservative and only remove styles
            // from the itinerary-related nodes above.
            el.removeAttribute('style');
        });
    })();

    // --- Logo Animation (anime.js) ---
    // Lightweight SVG stroke animation over the header logo with safe fallback.
    (function initLogoAnimation() {
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const logoContainer = document.querySelector('.logo-container');
        if (!logoContainer) return;
        if (logoContainer.querySelector('.logo-anim-svg')) return;

        const img = logoContainer.querySelector('img');
        if (!img) return;

        const ensureAnime = () => new Promise((resolve) => {
            if (window.anime) return resolve(true);

            const existing = document.querySelector('script[data-animejs="true"]');
            if (existing) {
                existing.addEventListener('load', () => resolve(!!window.anime), { once: true });
                existing.addEventListener('error', () => resolve(false), { once: true });
                return;
            }

            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js';
            s.async = true;
            s.defer = true;
            s.dataset.animejs = 'true';
            s.addEventListener('load', () => resolve(!!window.anime), { once: true });
            s.addEventListener('error', () => resolve(false), { once: true });
            document.head.appendChild(s);
        });

        const svgNS = 'http://www.w3.org/2000/svg';
        const iconSvgUrl = 'images/assets/logo-icon.svg';

        const loadInlineSvg = async (url) => {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) return null;
                const txt = await res.text();
                const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
                const svgEl = doc.querySelector('svg');
                if (!svgEl) return null;
                svgEl.classList.add('logo-anim-svg');
                svgEl.setAttribute('aria-hidden', 'true');
                svgEl.setAttribute('focusable', 'false');
                return svgEl;
            } catch {
                return null;
            }
        };

        const start = async () => {
            const ok = await ensureAnime();
            if (!ok || !window.anime) {
                console.warn('[LogoAnim] anime.js not available, aborting');
                return;
            }

            const svg = await loadInlineSvg(iconSvgUrl);
            if (!svg) {
                console.warn('[LogoAnim] SVG not loaded, fallback to PNG');
                img.style.opacity = '1';
                logoContainer.classList.remove('logo-animating');
                return;
            }
            console.log('[LogoAnim] SVG loaded and parsed');

            // Ensure we only show the icon svg (no text). If the SVG contains text, we hide it.
            svg.querySelectorAll('text').forEach(t => t.setAttribute('display', 'none'));

            // Normalize fills/strokes for a luxury look (the CSS handles actual colors)
            svg.querySelectorAll('[fill]').forEach(el => {
                const v = (el.getAttribute('fill') || '').trim();
                if (v && v !== 'none') el.setAttribute('fill', 'none');
            });

            logoContainer.appendChild(svg);

            const drawables = Array.from(svg.querySelectorAll('path, line, polyline, polygon, circle, rect, ellipse'))
                .filter(el => typeof el.getTotalLength === 'function');

            if (drawables.length === 0) {
                console.warn('[LogoAnim] No drawable elements found, fallback to PNG');
                svg.remove();
                img.style.opacity = '1';
                logoContainer.classList.remove('logo-animating');
                return;
            }
            console.log('[LogoAnim] Drawable elements found:', drawables.length);

            // Hide briefly, then animate (requested behavior on every page)
            const HIDE_MS = 500;
            img.style.opacity = '0';
            logoContainer.classList.add('logo-animating');

            await new Promise((r) => setTimeout(r, HIDE_MS));
            console.log('[LogoAnim] Starting anime timeline');

            drawables.forEach((p) => {
                const len = p.getTotalLength();
                p.style.strokeDasharray = String(len);
                p.style.strokeDashoffset = String(len);
            });

            window.anime.timeline({
                easing: 'easeInOutSine'
            })
                .add({
                    targets: drawables,
                    opacity: [0, 1],
                    duration: 160,
                    delay: window.anime.stagger(90)
                })
                .add({
                    targets: drawables,
                    strokeDashoffset: [window.anime.setDashoffset, 0],
                    duration: 1050,
                    delay: window.anime.stagger(80)
                }, '-=80')
                .add({
                    targets: img,
                    opacity: [0, 1],
                    duration: 420,
                    complete: () => {
                        console.log('[LogoAnim] Animation complete, cleaning up');
                        logoContainer.classList.remove('logo-animating');
                        svg.remove();
                    }
                }, '-=240');
        };

        start();
    })();

    // --- Language Selection ---
    // --- Language Selection (Static URL Redirection) ---
    const langSwitcher = document.querySelector('.lang-switcher');
    if (langSwitcher) {
        const langBtnWrap = langSwitcher.querySelector('.lang-btn');
        const langBtnSpan = langSwitcher.querySelector('.lang-btn span');
        const langLinks = langSwitcher.querySelectorAll('.lang-dropdown a');

        // Toggle dropdown on click
        langBtnWrap.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                langSwitcher.classList.toggle('active');
            }
        });

        langLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedLang = link.textContent.trim();
                const currentPath = window.location.pathname;
                const filename = currentPath.split('/').pop() || 'index.html';

                // Determine target filename
                let targetFilename = filename;

                if (selectedLang === 'Français') {
                    // Switch to French
                    if (!filename.includes('-fr.html') && filename !== 'tour-10-jours.html') {
                        if (filename === 'index.html' || filename === '') {
                            targetFilename = 'index-fr.html';
                        } else if (filename === 'tour-10-days.html') {
                            targetFilename = 'tour-10-jours.html';
                        } else {
                            targetFilename = filename.replace('.html', '-fr.html');
                        }
                    }
                } else if (selectedLang === 'English') {
                    // Switch to English
                    if (filename.includes('-fr.html') || filename === 'tour-10-jours.html') {
                        if (filename === 'index-fr.html') {
                            targetFilename = 'index.html';
                        } else if (filename === 'tour-10-jours.html') {
                            targetFilename = 'tour-10-days.html';
                        } else {
                            targetFilename = filename.replace('-fr.html', '.html');
                        }
                    }
                }

                // Redirect if different
                if (targetFilename !== filename) {
                    window.location.href = targetFilename;
                } else {
                    // Already on the correct page, just close dropdown
                    langSwitcher.classList.remove('active');
                }
            });
        });

        // Set active state based on current URL
        const currentFilename = window.location.pathname.split('/').pop() || 'index.html';
        const isFrench = currentFilename.includes('-fr.html') || currentFilename === 'tour-10-jours.html';

        langBtnSpan.textContent = isFrench ? 'Français' : 'English';

        langLinks.forEach(link => {
            const linkText = link.textContent.trim();
            if ((isFrench && linkText === 'Français') || (!isFrench && linkText === 'English')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Add pointer cursor to cards site-wide
    const cardStyle = document.createElement('style');
    cardStyle.innerHTML = '.tour-card, .blog-card { cursor: pointer; }';
    document.head.appendChild(cardStyle);

    // --- Section-Aware Navigation: Desktop Side Buttons & Mobile Swipes ---
    (function initSectionNavigation() {
        const currentPath = window.location.pathname;
        const filename = currentPath.split('/').pop() || 'index.html';
        const isFrench = filename.includes('-fr.html') || filename === 'tour-10-jours.html';
        const cleanFilename = filename === 'tour-10-jours.html' ? 'tour-10-days.html' : filename.replace('-fr.html', '.html');

        // 1. Define Section Sequences and Titles
        const sequences = {
            main: ['index.html', 'tours.html', 'customize-trip.html', 'about.html', 'blog.html', 'contact.html'],
            tours: [
                'tour-toubkal.html', 'tour-azzaden-tamsoult.html', 'tour-10-days.html', 'tour-mgoun.html', 'tour-ait-bougmez.html',
                'tour-saghro.html', 'tour-siroua.html', 'tour-sahara-erg-chebbi.html',
                'tour-todra-dades.html', 'tour-essaouira.html', 'tour-agafay.html',
                'tour-atlas-villages.html', 'tour-chefchaouen.html', 'tour-ouzoud.html',
                'tour-sahara-merzouga.html'
            ],
            blog: [
                'blog-marrakech.html', 'blog-fes.html', 'blog-atlas.html',
                'blog-sahara.html', 'blog-coastal.html', 'blog-culture.html'
            ]
        };

        const titles = {
            'index.html': { en: 'Home', fr: 'Accueil' },
            'tours.html': { en: 'Our Tours', fr: 'Circuits' },
            'customize-trip.html': { en: 'Customize', fr: 'Personnaliser' },
            'about.html': { en: 'About Us', fr: 'À Propos' },
            'blog.html': { en: 'Guide', fr: 'Guide' },
            'contact.html': { en: 'Contact', fr: 'Contact' },
            'tour-toubkal.html': { en: 'Toubkal', fr: 'Toubkal' },
            'tour-azzaden-tamsoult.html': { en: 'Azaden', fr: 'Azaden' },
            'tour-10-days.html': { en: 'Adventure', fr: 'Aventure' },
            'tour-mgoun.html': { en: 'M\'Goun', fr: 'M\'Goun' },
            'tour-ait-bougmez.html': { en: 'Happy Valley', fr: 'Aït Bougmez' },
            'tour-saghro.html': { en: 'Saghro', fr: 'Saghro' },
            'tour-siroua.html': { en: 'Siroua', fr: 'Siroua' },
            'tour-sahara-erg-chebbi.html': { en: 'Sahara', fr: 'Sahara' },
            'tour-todra-dades.html': { en: 'Todra', fr: 'Todra' },
            'tour-essaouira.html': { en: 'Essaouira', fr: 'Essaouira' },
            'tour-agafay.html': { en: 'Agafay', fr: 'Agafay' },
            'tour-atlas-villages.html': { en: 'Villages', fr: 'Villages' },
            'tour-chefchaouen.html': { en: 'Chefchaouen', fr: 'Chefchaouen' },
            'tour-ouzoud.html': { en: 'Ouzoud', fr: 'Ouzoud' },
            'tour-sahara-merzouga.html': { en: 'Merzouga', fr: 'Merzouga' },
            'blog-marrakech.html': { en: 'Marrakech', fr: 'Marrakech' },
            'blog-fes.html': { en: 'Fes', fr: 'Fès' },
            'blog-atlas.html': { en: 'Atlas', fr: 'Atlas' },
            'blog-sahara.html': { en: 'Sahara', fr: 'Sahara' },
            'blog-coastal.html': { en: 'Coastal', fr: 'Littoral' },
            'blog-culture.html': { en: 'Culture', fr: 'Culture' }
        };

        // Determine current section and index
        let currentSection = null;
        let currentIndex = -1;

        for (const [key, seq] of Object.entries(sequences)) {
            const idx = seq.indexOf(cleanFilename);
            if (idx !== -1) {
                currentSection = key;
                currentIndex = idx;
                break;
            }
        }

        if (!currentSection) return;

        function getTargetUrl(index) {
            if (index < 0 || index >= sequences[currentSection].length) return null;
            const target = sequences[currentSection][index];
            if (isFrench) {
                if (target === 'tour-10-days.html') return 'tour-10-jours.html';
                return target.replace('.html', '-fr.html');
            }
            return target;
        }

        const prevUrl = getTargetUrl(currentIndex - 1);
        const nextUrl = getTargetUrl(currentIndex + 1);

        // 2. Desktop Navigation (Side Buttons)
        if (window.innerWidth > 768) {
            if (prevUrl) {
                const prevFilename = sequences[currentSection][currentIndex - 1];
                const prevTitle = titles[prevFilename] ? (isFrench ? titles[prevFilename].fr : titles[prevFilename].en) : (isFrench ? 'Précédent' : 'Previous');

                const btn = document.createElement('a');
                btn.href = prevUrl;
                btn.className = 'section-nav-btn prev-btn';
                btn.innerHTML = `
                    <i class="fas fa-chevron-left"></i>
                    <span class="nav-btn-title">${prevTitle}</span>
                `;
                btn.setAttribute('aria-label', `Previous: ${prevTitle}`);
                document.body.appendChild(btn);
            }
            if (nextUrl) {
                const nextFilename = sequences[currentSection][currentIndex + 1];
                const nextTitle = titles[nextFilename] ? (isFrench ? titles[nextFilename].fr : titles[nextFilename].en) : (isFrench ? 'Suivant' : 'Next');

                const btn = document.createElement('a');
                btn.href = nextUrl;
                btn.className = 'section-nav-btn next-btn';
                btn.innerHTML = `
                    <i class="fas fa-chevron-right"></i>
                    <span class="nav-btn-title">${nextTitle}</span>
                `;
                btn.setAttribute('aria-label', `Next: ${nextTitle}`);
                document.body.appendChild(btn);
            }
        }

        // 3. Mobile Swipe Navigation
        let touchStartX = 0;
        let touchStartY = 0;
        const SWIPE_THRESHOLD = 80;
        const LOCK_THRESHOLD = 30; // Min horizontal move to ignore vertical scroll

        function handleNavigate(direction) {
            const targetUrl = direction === 'left' ? nextUrl : prevUrl;
            if (targetUrl) {
                document.body.classList.add('page-transitioning');
                const animClass = direction === 'left' ? 'page-slide-out-left' : 'page-slide-out-right';
                document.body.classList.add(animClass);

                setTimeout(() => {
                    window.location.href = targetUrl + '?swipe=' + direction;
                }, 400);
            }
        }

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            // Horizontal Swipe Check: diffX must be large, diffY must be relatively small
            if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(diffX) > Math.abs(diffY)) {
                handleNavigate(diffX < 0 ? 'left' : 'right');
            }
        }, { passive: true });

        // 4. Handle Slide-In Animation on Load
        const urlParams = new URLSearchParams(window.location.search);
        const prevSwipe = urlParams.get('swipe');
        if (prevSwipe) {
            const inAnim = prevSwipe === 'left' ? 'page-slide-in-left' : 'page-slide-in-right';
            document.body.classList.add(inAnim);

            setTimeout(() => {
                const newUrl = window.location.pathname + window.location.hash;
                window.history.replaceState({}, document.title, newUrl);
                document.body.classList.remove(inAnim);
            }, 600);
        }
    })();


});