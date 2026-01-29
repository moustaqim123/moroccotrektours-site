// Booking Engine - Smart Pricing & Conversion Optimization
class BookingEngine {
    constructor() {
        this.selections = {
            duration: null,
            groupSize: null,
            season: null
        };
        
        this.prices = {
            base: {
                1: { summer: 89, winter: 99 },
                2: { summer: 149, winter: 169 },
                3: { summer: 199, winter: 229 },
                4: { summer: 249, winter: 289 },
                5: { summer: 299, winter: 349 },
                6: { summer: 349, winter: 399 }
            },
            groupDiscounts: {
                '1': 1.0,
                '2-3': 0.95,
                '4-7': 0.85,
                '8-12': 0.75
            }
        };
        
        this.translations = {
            en: {
                hero_title: "Book Your Toubkal Adventure",
                hero_subtitle: "Choose your perfect trek in just 3 simple steps",
                trust_local: "Local Guides",
                trust_small: "Small Groups",
                trust_fees: "No Hidden Fees",
                step1_title: "Choose Your Duration",
                step1_subtitle: "How many days would you like to explore?",
                day: "Day",
                days: "Days",
                quick_summit: "Quick Summit",
                classic: "Classic Trek",
                complete: "Complete Experience",
                extended: "Extended Adventure",
                ultimate: "Ultimate Trek",
                grand: "Grand Expedition",
                most_booked: "Most Booked",
                step2_title: "Group Size",
                step2_subtitle: "How many people will be joining?",
                solo: "Solo Traveler",
                couple_small: "Couple & Small Group",
                family: "Family & Friends",
                large_group: "Large Group",
                most_popular: "Most Popular",
                step3_title: "Season",
                step3_subtitle: "When are you planning to visit?",
                detected: "Current season detected:",
                summer: "Summer",
                winter: "Winter",
                booking_summary: "Booking Summary",
                duration: "Duration",
                group_size: "Group Size",
                season: "Season",
                price_per_person: "Price per person",
                free_cancellation: "Free cancellation available",
                select_options: "Select Your Options",
                book_now: "Book Now",
                secure_booking: "Secure Booking",
                support_24: "24/7 Support",
                flexible: "Flexible Dates",
                from: "From",
                per_person: "/person"
            },
            fr: {
                hero_title: "Réservez Votre Aventure Toubkal",
                hero_subtitle: "Choisissez votre trek parfait en 3 étapes simples",
                trust_local: "Guides Locaux",
                trust_small: "Petits Groupes",
                trust_fees: "Aucuns Frais Cachés",
                step1_title: "Choisissez Votre Durée",
                step1_subtitle: "Combien de jours aimeriez-vous explorer?",
                day: "Jour",
                days: "Jours",
                quick_summit: "Sommet Rapide",
                classic: "Trek Classique",
                complete: "Expérience Complète",
                extended: "Aventure Étendue",
                ultimate: "Trek Ultime",
                grand: "Grande Expédition",
                most_booked: "Le Plus Réservé",
                step2_title: "Taille du Groupe",
                step2_subtitle: "Combien de personnes vont vous rejoindre?",
                solo: "Voyageur Solo",
                couple_small: "Couple & Petit Groupe",
                family: "Famille & Amis",
                large_group: "Grand Groupe",
                most_popular: "Le Plus Populaire",
                step3_title: "Saison",
                step3_subtitle: "Quand prévoyez-vous visiter?",
                detected: "Saison actuelle détectée:",
                summer: "Été",
                winter: "Hiver",
                booking_summary: "Résumé de Réservation",
                duration: "Durée",
                group_size: "Taille du Groupe",
                season: "Saison",
                price_per_person: "Prix par personne",
                free_cancellation: "Annulation gratuite disponible",
                select_options: "Sélectionnez Vos Options",
                book_now: "Réserver",
                secure_booking: "Réservation Sécurisée",
                support_24: "Support 24/7",
                flexible: "Dates Flexibles",
                from: "À partir de",
                per_person: "/personne"
            }
        };
        
        this.currentLang = 'en';
        this.init();
    }
    
    init() {
        this.detectSeason();
        this.setupEventListeners();
        this.initializeAnimations();
        this.updateMobileStickyBar();
    }
    
    detectSeason() {
        const month = new Date().getMonth();
        const isSummer = month >= 5 && month <= 9; // June to September
        this.selections.season = isSummer ? 'summer' : 'winter';
        
        // Update UI
        const currentSeasonEl = document.getElementById('currentSeason');
        if (currentSeasonEl) {
            currentSeasonEl.textContent = this.translations[this.currentLang][this.selections.season];
        }
        
        // Update season buttons
        document.querySelectorAll('.season-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.season === this.selections.season);
        });
        
        this.updateSummary();
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
        
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Window scroll effects
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navbar = document.querySelector('.navbar');
            
            if (navbar) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    }
    
    initializeAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                }
            });
        }, observerOptions);
        
        // Observe step sections
        document.querySelectorAll('.step-section').forEach(section => {
            observer.observe(section);
        });
    }
    
    selectDuration(days) {
        this.selections.duration = days;
        
        // Update UI
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.toggle('selected', parseInt(btn.dataset.days) === days);
        });
        
        // Animate selection
        const selectedBtn = document.querySelector(`.duration-btn[data-days="${days}"]`);
        if (selectedBtn) {
            this.animateSelection(selectedBtn);
        }
        
        // Show next step
        this.showStep(2);
        this.updateSummary();
        this.calculatePrice();
        this.updateMobileStickyBar();
    }
    
    selectGroupSize(size) {
        this.selections.groupSize = size;
        
        // Update UI
        document.querySelectorAll('.group-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.size === size);
        });
        
        // Animate selection
        const selectedBtn = document.querySelector(`.group-btn[data-size="${size}"]`);
        if (selectedBtn) {
            this.animateSelection(selectedBtn);
        }
        
        // Show next step
        this.showStep(3);
        this.updateSummary();
        this.calculatePrice();
        this.updateMobileStickyBar();
    }
    
    selectSeason(season) {
        this.selections.season = season;
        
        // Update UI
        document.querySelectorAll('.season-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.season === season);
        });
        
        // Animate selection
        const selectedBtn = document.querySelector(`.season-btn[data-season="${season}"]`);
        if (selectedBtn) {
            this.animateSelection(selectedBtn);
        }
        
        this.updateSummary();
        this.calculatePrice();
        this.updateMobileStickyBar();
    }
    
    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.step-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target step with animation
        setTimeout(() => {
            const targetStep = document.getElementById(`step${stepNumber}`);
            if (targetStep) {
                targetStep.classList.add('active');
                targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    }
    
    animateSelection(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }
    
    calculatePrice() {
        if (!this.selections.duration || !this.selections.season) {
            return 0;
        }
        
        const basePrice = this.prices.base[this.selections.duration][this.selections.season];
        const groupMultiplier = this.selections.groupSize ? 
            this.prices.groupDiscounts[this.selections.groupSize] : 1.0;
        
        const finalPrice = Math.round(basePrice * groupMultiplier);
        
        this.updatePriceDisplay(finalPrice);
        return finalPrice;
    }
    
    updatePriceDisplay(price) {
        const priceSection = document.getElementById('priceSection');
        const priceAmount = document.querySelector('.price-amount');
        const priceValue = document.querySelector('.price-value');
        const mobilePrice = document.getElementById('mobilePrice');
        
        if (priceSection && priceAmount && priceValue) {
            priceSection.style.display = 'block';
            
            // Animate price update
            priceValue.classList.add('price-updated');
            
            // Count up animation
            this.animateCountUp(priceAmount, price);
            
            if (mobilePrice) {
                this.animateCountUp(mobilePrice, price);
            }
            
            setTimeout(() => {
                priceValue.classList.remove('price-updated');
            }, 600);
        }
        
        this.updateBookButton();
    }
    
    animateCountUp(element, targetValue) {
        const duration = 800;
        const startValue = parseInt(element.textContent) || 0;
        const increment = (targetValue - startValue) / (duration / 16);
        let currentValue = startValue;
        
        const timer = setInterval(() => {
            currentValue += increment;
            
            if ((increment > 0 && currentValue >= targetValue) || 
                (increment < 0 && currentValue <= targetValue)) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.round(currentValue);
            }
        }, 16);
    }
    
    updateSummary() {
        const durationEl = document.getElementById('summaryDuration');
        const groupEl = document.getElementById('summaryGroup');
        const seasonEl = document.getElementById('summarySeason');
        
        if (durationEl && this.selections.duration) {
            const label = this.selections.duration === 1 ? 
                this.translations[this.currentLang].day : 
                this.translations[this.currentLang].days;
            durationEl.textContent = `${this.selections.duration} ${label}`;
        }
        
        if (groupEl && this.selections.groupSize) {
            groupEl.textContent = this.selections.groupSize;
        }
        
        if (seasonEl && this.selections.season) {
            seasonEl.textContent = this.translations[this.currentLang][this.selections.season];
        }
    }
    
    updateBookButton() {
        const bookNowBtn = document.getElementById('bookNowBtn');
        const mobileBookBtn = document.getElementById('mobileBookBtn');
        const mobileDetails = document.getElementById('mobileDetails');
        
        const isReady = this.selections.duration && this.selections.groupSize && this.selections.season;
        
        if (bookNowBtn) {
            bookNowBtn.disabled = !isReady;
            
            if (isReady) {
                bookNowBtn.classList.add('ready');
                bookNowBtn.innerHTML = `<span>${this.translations[this.currentLang].book_now}</span>`;
            } else {
                bookNowBtn.classList.remove('ready');
                bookNowBtn.innerHTML = `<span>${this.translations[this.currentLang].select_options}</span>`;
            }
        }
        
        if (mobileBookBtn) {
            mobileBookBtn.disabled = !isReady;
        }
        
        if (mobileDetails && isReady) {
            const durationLabel = this.selections.duration === 1 ? 
                this.translations[this.currentLang].day : 
                this.translations[this.currentLang].days;
            mobileDetails.innerHTML = `
                ${this.selections.duration} ${durationLabel} • 
                ${this.selections.groupSize} people • 
                ${this.translations[this.currentLang][this.selections.season]}
            `;
        }
    }
    
    updateMobileStickyBar() {
        const mobileStickyBar = document.getElementById('mobileStickyBar');
        if (mobileStickyBar) {
            const hasSelections = this.selections.duration || this.selections.groupSize || this.selections.season;
            mobileStickyBar.style.display = hasSelections ? 'block' : 'none';
        }
    }
    
    proceedToBooking() {
        if (!this.selections.duration || !this.selections.groupSize || !this.selections.season) {
            return;
        }
        
        // Create booking data
        const bookingData = {
            duration: this.selections.duration,
            groupSize: this.selections.groupSize,
            season: this.selections.season,
            price: this.calculatePrice(),
            language: this.currentLang,
            timestamp: new Date().toISOString()
        };
        
        // Store in sessionStorage for contact page
        sessionStorage.setItem('toubkalBooking', JSON.stringify(bookingData));
        
        // Redirect to contact page with booking data
        window.location.href = `contact-${this.currentLang === 'fr' ? 'fr' : ''}.html?booking=toubkal`;
    }
    
    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'fr' : 'en';
        document.documentElement.setAttribute('data-lang', this.currentLang);
        document.documentElement.setAttribute('lang', this.currentLang);
        
        // Update language button
        const langCurrent = document.querySelector('.lang-current');
        if (langCurrent) {
            langCurrent.textContent = this.currentLang === 'en' ? 'English' : 'Français';
        }
        
        // Update all translatable elements
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (this.translations[this.currentLang][key]) {
                element.textContent = this.translations[this.currentLang][key];
            }
        });
        
        // Update dynamic content
        this.updateSummary();
        this.updateBookButton();
        this.detectSeason();
    }
}

// Global functions for onclick handlers
let bookingEngine;

function selectDuration(days) {
    bookingEngine.selectDuration(days);
}

function selectGroupSize(size) {
    bookingEngine.selectGroupSize(size);
}

function selectSeason(season) {
    bookingEngine.selectSeason(season);
}

function proceedToBooking() {
    bookingEngine.proceedToBooking();
}

function toggleLanguage() {
    bookingEngine.toggleLanguage();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    bookingEngine = new BookingEngine();
    
    // Add loading animation removal
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Performance optimization - Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add smooth reveal animation for price section
const observePriceSection = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
        }
    });
}, { threshold: 0.1 });

// Start observing when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const priceSection = document.getElementById('priceSection');
    if (priceSection) {
        observePriceSection.observe(priceSection);
    }
});
