document.addEventListener('DOMContentLoaded', function() {
    // Pricing state
    let currentSelection = {
        duration: 2,
        label: 'Classic 2-Day Summit',
        groupSize: '2-3',
        season: 'summer'
    };

    // EXACT PRICING DATA - MUST NOT BE MODIFIED
    const exactPricing = {
        1: { // 1 Day - Express Challenge
            '1': { winter: 200, summer: 180 },
            '2-3': { winter: 150, summer: 135 },
            '4-7': { winter: 130, summer: 120 },
            '8-12': { winter: 110, summer: 105 }
        },
        2: { // 2 Days - Classic Summit (REFERENCE)
            '1': { winter: 250, summer: 230 },
            '2-3': { winter: 175, summer: 150 },
            '4-7': { winter: 145, summer: 135 },
            '8-12': { winter: 125, summer: 120 }
        },
        3: { // 3 Days - Azzaden Valley Loop
            '1': { winter: 320, summer: 300 },
            '2-3': { winter: 225, summer: 200 },
            '4-7': { winter: 190, summer: 175 },
            '8-12': { winter: 165, summer: 155 }
        },
        4: { // 4 Days - Complete Circuit
            '1': { winter: 420, summer: 390 },
            '2-3': { winter: 290, summer: 260 },
            '4-7': { winter: 240, summer: 225 },
            '8-12': { winter: 210, summer: 195 }
        },
        5: { // 5 Days - Grand Atlas Experience
            '1': { winter: 520, summer: 490 },
            '2-3': { winter: 360, summer: 330 },
            '4-7': { winter: 300, summer: 280 },
            '8-12': { winter: 260, summer: 245 }
        },
        6: { // 6 Days - Ultimate Experience
            '1': { winter: 620, summer: 590 },
            '2-3': { winter: 430, summer: 400 },
            '4-7': { winter: 360, summer: 335 },
            '8-12': { winter: 310, summer: 295 }
        }
    };

    // Initialize
    initializePricing();
    setupEventListeners();
    setupStickyBooking();
    setupAutoSeasonDetection();

    function initializePricing() {
        updatePrice();
        updateBreakdown();
        updateStickyBooking();
    }

    function setupEventListeners() {
        // Itinerary selection - only target sidebar options
        document.querySelectorAll('.itinerary-option-card.sidebar-option').forEach(card => {
            card.addEventListener('click', function() {
                // Remove active class from all sidebar cards
                document.querySelectorAll('.itinerary-option-card.sidebar-option').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                this.classList.add('active');
                
                // Update selection
                currentSelection.duration = parseInt(this.dataset.duration);
                currentSelection.label = this.dataset.label;
                
                // Sync with main content options
                const mainContentOptions = document.querySelectorAll('.tour-main-content .itinerary-option-card');
                mainContentOptions.forEach(mainCard => {
                    if (parseInt(mainCard.dataset.duration) === currentSelection.duration) {
                        mainCard.classList.add('active');
                    } else {
                        mainCard.classList.remove('active');
                    }
                });
                
                // Animate selection
                animateSelection(this);
                
                // Update price
                updatePrice();
                updateBreakdown();
                updateStickyBooking();
            });
        });

        // Also handle main content options
        document.querySelectorAll('.tour-main-content .itinerary-option-card').forEach(card => {
            card.addEventListener('click', function() {
                // Remove active class from all main content cards
                document.querySelectorAll('.tour-main-content .itinerary-option-card').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                this.classList.add('active');
                
                // Update selection
                currentSelection.duration = parseInt(this.dataset.duration);
                currentSelection.label = this.dataset.label;
                
                // Sync with sidebar options
                const sidebarOptions = document.querySelectorAll('.itinerary-option-card.sidebar-option');
                sidebarOptions.forEach(sidebarCard => {
                    if (parseInt(sidebarCard.dataset.duration) === currentSelection.duration) {
                        sidebarCard.classList.add('active');
                    } else {
                        sidebarCard.classList.remove('active');
                    }
                });
                
                // Animate selection
                animateSelection(this);
                
                // Update price
                updatePrice();
                updateBreakdown();
                updateStickyBooking();
            });
        });

        // Group size selection
        document.querySelectorAll('.group-option').forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class
                document.querySelectorAll('.group-option').forEach(o => o.classList.remove('active'));
                
                // Add active class
                this.classList.add('active');
                
                // Update selection
                currentSelection.groupSize = this.dataset.size;
                
                // Animate selection
                animateSelection(this);
                
                // Update price
                updatePrice();
                updateBreakdown();
                updateStickyBooking();
            });
        });

        // Season selection
        document.querySelectorAll('.season-option').forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class
                document.querySelectorAll('.season-option').forEach(o => o.classList.remove('active'));
                
                // Add active class
                this.classList.add('active');
                
                // Update selection
                currentSelection.season = this.dataset.season;
                
                // Animate selection
                animateSelection(this);
                
                // Update price
                updatePrice();
                updateBreakdown();
                updateStickyBooking();
            });
        });

        // Travel date change for auto season detection
        const travelDate = document.getElementById('travel-date');
        if (travelDate) {
            travelDate.addEventListener('change', function() {
                detectSeasonFromDate(this.value);
            });
        }

        // Form submission
        const bookingForm = document.querySelector('.luxury-booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', handleFormSubmission);
        }
    }

    function getExactPrice() {
        // Debug: Log current selection
        console.log('Current selection:', currentSelection);
        
        // Get exact price from predefined data - NO CALCULATIONS OR MODIFICATIONS
        const durationPrices = exactPricing[currentSelection.duration];
        if (!durationPrices) {
            console.error('No pricing data for duration:', currentSelection.duration);
            return 0;
        }
        
        const groupPrices = durationPrices[currentSelection.groupSize];
        if (!groupPrices) {
            console.error('No pricing data for group size:', currentSelection.groupSize);
            return 0;
        }
        
        const price = groupPrices[currentSelection.season];
        if (price === undefined) {
            console.error('No pricing data for season:', currentSelection.season);
            return 0;
        }
        
        console.log('Calculated price:', price);
        return price; // Return exact price as provided
    }

    function updatePrice() {
        const price = getExactPrice();
        const priceElement = document.getElementById('dynamicPrice');
        const stickyPriceElement = document.getElementById('stickyPrice');
        
        console.log('Updating price to:', price);
        
        if (priceElement) {
            const currentPrice = parseInt(priceElement.textContent) || 0;
            
            console.log('Current price in element:', currentPrice);
            
            // Only animate if price actually changed
            if (currentPrice !== price) {
                console.log('Price changed, updating...');
                // Animate main price
                animatePriceValue(priceElement, currentPrice, price);
                
                // Add micro-highlight effect
                addMicroHighlight(priceElement);
                
                // Update sticky price if it exists
                if (stickyPriceElement) {
                    animatePriceValue(stickyPriceElement, currentPrice, price);
                    addMicroHighlight(stickyPriceElement);
                }
            } else {
                console.log('Price unchanged, no animation needed');
            }
        } else {
            console.error('Price element #dynamicPrice not found');
        }
    }

    function animatePriceValue(element, startPrice, endPrice) {
        const duration = 300; // Fast but elegant (200-400ms range)
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out easing function
            const easeOutProgress = 1 - Math.pow(1 - progress, 2);
            
            // Calculate current value
            const currentValue = Math.round(startPrice + (endPrice - startPrice) * easeOutProgress);
            
            // Update text
            element.textContent = currentValue;
            
            // Subtle slide animation based on direction
            if (endPrice > startPrice) {
                // Counting up - slide up slightly
                element.style.transform = `translateY(${-1 * (1 - easeOutProgress)}px)`;
            } else {
                // Counting down - slide down slightly
                element.style.transform = `translateY(${1 * (1 - easeOutProgress)}px)`;
            }
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Reset transform
                element.style.transform = 'translateY(0)';
            }
        }
        
        // Start animation
        requestAnimationFrame(update);
    }

    function addMicroHighlight(element) {
        // Add subtle glow effect
        element.style.transition = 'filter 150ms ease-out, text-shadow 150ms ease-out';
        element.style.filter = 'contrast(1.1)';
        element.style.textShadow = '0 0 8px rgba(0, 77, 51, 0.15)';
        
        // Remove highlight after 150ms
        setTimeout(() => {
            element.style.filter = 'contrast(1)';
            element.style.textShadow = 'none';
        }, 150);
    }

    function updateBreakdown() {
        const itineraryElement = document.getElementById('selectedItinerary');
        const groupSizeElement = document.getElementById('selectedGroupSize');
        const seasonElement = document.getElementById('selectedSeason');
        
        if (itineraryElement) {
            itineraryElement.textContent = currentSelection.label;
        }
        
        if (groupSizeElement) {
            groupSizeElement.textContent = `${currentSelection.groupSize} people`;
        }
        
        if (seasonElement) {
            seasonElement.textContent = currentSelection.season.charAt(0).toUpperCase() + currentSelection.season.slice(1);
        }
    }

    function updateStickyBooking() {
        const stickyItinerary = document.getElementById('stickyItinerary');
        const stickyMeta = document.getElementById('stickyMeta');
        const stickyPrice = document.getElementById('stickyPrice');
        
        if (stickyItinerary) {
            stickyItinerary.textContent = `${currentSelection.duration} Days: ${currentSelection.label}`;
        }
        
        if (stickyMeta) {
            stickyMeta.textContent = `${currentSelection.groupSize} people · ${currentSelection.season.charAt(0).toUpperCase() + currentSelection.season.slice(1)}`;
        }
        
        if (stickyPrice) {
            const price = getExactPrice();
            stickyPrice.textContent = price;
        }
    }

    function setupStickyBooking() {
        const stickyBooking = document.getElementById('stickyBooking');
        const bookBtn = document.getElementById('bookNowBtn');
        let lastScrollY = window.scrollY;
        
        // Add click handler to Book Now button
        if (bookBtn) {
            bookBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.open('https://wa.me/212659565040?text=Hello! I am interested in booking Mount Toubkal tour', '_blank');
            });
        }
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const pricingSection = document.querySelector('.luxury-pricing-section');
            
            if (pricingSection) {
                const sectionTop = pricingSection.offsetTop;
                const sectionBottom = sectionTop + pricingSection.offsetHeight;
                
                // Show sticky when pricing section is out of view
                if (currentScrollY > sectionBottom - 200) {
                    stickyBooking.classList.add('visible');
                } else {
                    stickyBooking.classList.remove('visible');
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }

    function setupAutoSeasonDetection() {
        const travelDate = document.getElementById('travel-date');
        if (travelDate && travelDate.value) {
            detectSeasonFromDate(travelDate.value);
        }
    }

    function detectSeasonFromDate(dateString) {
        if (!dateString) return;
        
        const date = new Date(dateString);
        const month = date.getMonth() + 1; // 1-12
        
        // Winter: Nov-Apr (11-4), Summer: May-Oct (5-10)
        const detectedSeason = (month >= 5 && month <= 10) ? 'summer' : 'winter';
        
        // Only auto-update if user hasn't manually selected
        if (currentSelection.season !== detectedSeason) {
            const seasonOption = document.querySelector(`.season-option[data-season="${detectedSeason}"]`);
            if (seasonOption) {
                seasonOption.click();
            }
        }
    }

    function animateSelection(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }

    function handleFormSubmission(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Get current selection
        const price = getExactPrice();
        
        // Create WhatsApp message
        const message = encodeURIComponent(
            `🏔️ Mount Toubkal Trek Booking Request\n\n` +
            `📅 Preferred Date: ${data.travelDate}\n` +
            `⏱️ Itinerary: ${currentSelection.duration} Days - ${currentSelection.label}\n` +
            `👥 Group Size: ${currentSelection.groupSize} people (${data.travelers} travelers)\n` +
            `🌤️ Season: ${currentSelection.season.charAt(0).toUpperCase() + currentSelection.season.slice(1)}\n` +
            `💰 Price: €${price} per person\n` +
            `👤 Name: ${data.name}\n` +
            `📧 Email: ${data.email}\n` +
            `📞 Phone: ${data.phone}\n` +
            `📝 Special Requests: ${data.message || 'None'}\n\n` +
            `Please confirm availability and proceed with booking.`
        );
        
        // Open WhatsApp with pre-filled message
        const whatsappUrl = `https://wa.me/212659565040?text=${message}`;
        window.open(whatsappUrl, '_blank');
        
        // Show success animation
        const submitBtn = e.target.querySelector('.luxury-cta');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="cta-text">✓ Booking Request Sent</span>';
        submitBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
        }, 3000);
    }

    // Smooth scroll to booking form
    window.scrollToBooking = function() {
        const bookingForm = document.querySelector('.booking-card');
        if (bookingForm) {
            bookingForm.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    };

    // Add smooth scroll behavior for floating cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all floating cards
    document.querySelectorAll('.floating-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Add hover effect for contact links
    const contactLinks = document.querySelectorAll('.contact-link');
    contactLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Form field animations
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});

// scrollToBooking function - Redirect to WhatsApp with booking details
window.scrollToBooking = function() {
    const itinerary = document.getElementById('stickyItinerary').textContent;
    const meta = document.getElementById('stickyMeta').textContent;
    const price = document.getElementById('stickyPrice').textContent;
    
    const message = encodeURIComponent(
        `Hello! I'm interested in booking:\n\n` +
        `Tour: ${itinerary}\n` +
        `Details: ${meta}\n` +
        `Price: €${price}/person\n\n` +
        `Please provide more information about availability and booking process.`
    );
    
    const whatsappUrl = `https://wa.me/212659565040?text=${message}`;
    window.open(whatsappUrl, '_blank');
};
