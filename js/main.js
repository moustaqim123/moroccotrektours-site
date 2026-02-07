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

    // --- ميزة حفظ جهة الاتصال (VCard) مع الصورة الشخصية ---

    // دالة لطي الأسطر الطويلة (ضروري لصور Base64 داخل ملف VCF)
    function foldLine(str, maxLen = 75) {
        if (!str || str.length <= maxLen) return str;
        let out = str.slice(0, maxLen);
        for (let i = maxLen; i < str.length; i += maxLen) {
            out += '\r\n ' + str.slice(i, i + maxLen);
        }
        return out;
    }

    // Helper: fetch image and return base64 (no prefix)
    async function fetchImageAsBase64(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const blob = await res.blob();
            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (err) { return null; }
    }

    async function buildVCardBlob() {
        // Fetch the site logo so the VCard contains the same image used on the website
        const logoBase64 = await fetchImageAsBase64('images/assets/icon-brand.png');

        const lines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            // Set N and FN to help phones and WhatsApp display the company name
            'N:Morocco Trek Tours;;;;',
            'FN:Morocco Trek Tours',
            'ORG:Morocco Trek Tours',
            // Include preferred/mobile and work forms to maximise compatibility
            'TEL;TYPE=CELL,VOICE;PREF:+212659565040',
            'TEL;TYPE=WORK,VOICE:+212659565040',
            'EMAIL:info@moroccotrektours.com',
            'URL:https://moroccotrektours.com'
        ];

        if (logoBase64) {
            // Using PNG as it's the existing format
            const photoLine = 'PHOTO;ENCODING=BASE64;TYPE=PNG:' + logoBase64.replace(/\s/g, '');
            lines.push(foldLine(photoLine, 75));
        }

        lines.push('END:VCARD');
        return new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
    }

    async function handleSaveContactClick(e) {
        e.preventDefault();
        const el = e.currentTarget;
        const prev = el.innerHTML;
        el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        el.style.pointerEvents = 'none';
        try {
            const blob = await buildVCardBlob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Morocco_Trek_Tours.vcf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Error generating contact file.');
        } finally {
            el.innerHTML = prev;
            el.style.pointerEvents = 'auto';
        }
    }

    // إضافة الزر العائم وتنسيقه تلقائياً
    (function initFloatingButton() {
        // Ensure only one exists site-wide
        document.querySelectorAll('.save-contact-float').forEach(el => el.remove());

        const btn = document.createElement('a');
        btn.className = 'save-contact-float';
        btn.innerHTML = `
            <i class="fas fa-address-card" aria-hidden="true"></i>
            <span class="btn-label">Save Contact</span>
            <div class="vcard-info-trigger">
                <i class="fas fa-info-circle"></i>
                <span class="vcard-tooltip">Save our contact details directly to your phone.</span>
            </div>
        `;
        btn.setAttribute('aria-label', 'Save contact info');
        btn.addEventListener('click', (e) => {
            if (e.target.closest('.vcard-info-trigger')) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            handleSaveContactClick(e);
        });
        document.body.appendChild(btn);

        // Target the existing WhatsApp button for labeling
        const wa = document.querySelector('.whatsapp-float');
        if (wa && !wa.querySelector('.btn-label')) {
            const label = document.createElement('span');
            label.className = 'btn-label';
            label.textContent = 'WhatsApp';
            wa.appendChild(label);
        }

        // Position directly above the existing WhatsApp button
        const gap = 12;
        const defaultRight = 16;
        const defaultBottom = 18;
        let rightPx = defaultRight;
        let bottomPx = defaultBottom + 56 + gap;

        if (wa) {
            try {
                const rect = wa.getBoundingClientRect();
                const computed = window.getComputedStyle(wa);
                const computedRight = parseFloat(computed.right) || defaultRight;
                const waBottomOffset = Math.round(window.innerHeight - rect.bottom);
                rightPx = computedRight;
                bottomPx = waBottomOffset + rect.height + gap;
            } catch (err) { }
        }

        // Inject Enhanced Styles
        const style = document.createElement('style');
        style.id = 'floating-ui-styles';
        style.innerHTML = `
            /* Container Styles */
            .save-contact-float, .whatsapp-float { 
                position: fixed; 
                width: 56px; 
                height: 56px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                border-radius: 28px; 
                z-index: 100000; 
                cursor: pointer; 
                transition: transform 0.2s, background 0.2s; 
                text-decoration: none;
            }

            .save-contact-float { right: ${rightPx}px; bottom: ${bottomPx}px; background: rgba(0,0,0,0.7); color: #fff; }
            .whatsapp-float { position: fixed; right: ${rightPx}px; bottom: 18px; background: #25d366; color: #fff; }

            .save-contact-float:hover, .whatsapp-float:hover { transform: translateY(-4px); }
            .save-contact-float:hover { background: rgba(0,0,0,0.9); }

            /* Subtle Labels */
            .btn-label {
                position: absolute;
                right: 70px;
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                padding: 6px 14px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s, transform 0.2s;
                transform: translateX(10px);
            }

            .save-contact-float:hover .btn-label, .whatsapp-float:hover .btn-label {
                opacity: 1;
                transform: translateX(0);
            }

            /* VCard Info Icon & Tooltip */
            .vcard-info-trigger {
                position: absolute;
                top: -2px;
                right: -2px;
                width: 18px;
                height: 18px;
                background: var(--accent-color, #e67e22);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 9px;
                border: 1.5px solid #fff;
                z-index: 100001;
            }

            .vcard-tooltip {
                position: absolute;
                bottom: 30px;
                right: 0;
                width: 200px;
                background: #fff;
                color: #333;
                padding: 12px;
                border-radius: 8px;
                font-size: 0.85rem;
                line-height: 1.4;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s, transform 0.2s;
                transform: translateY(10px);
                border: 1px solid #eee;
            }

            .vcard-info-trigger:hover .vcard-tooltip {
                opacity: 1;
                transform: translateY(0);
            }

            /* Responsive */
            @media (max-width: 480px) {
                .btn-label { display: none; }
            }
        `;
        document.head.appendChild(style);
    })();

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