/*
 * Morocco Trek Tours - centralized pricing configuration and UI engine.
 *
 * Every tour rate lives in the `tours` object below. The four page adapters
 * (luxury-pricing-quote.js, luxury-pricing-quote-fr.js,
 * luxury-pricing-toubkal.js and luxury-pricing-toubkal-fr.js) only choose a
 * language; they do not contain prices or pricing rules.
 *
 * Rules preserved from the approved data:
 *   - The 1-traveller tier is the total price of the private booking.
 *   - The 2-3, 4-7 and 8-12 tiers are prices per person.
 *   - Only the 2-day Toubkal itinerary has seasonal (winter/summer) rates;
 *     its other durations use fixed rates. Any tour or duration without a
 *     rate is quote-only.
 *   - A missing rate returns null, never 0.
 */
(function (window, document) {
    'use strict';

    var CURRENCY_SYMBOL = '\u20AC';
    var WHATSAPP_NUMBER = '212659565040';
    var GROUP_SIZES = ['1', '2-3', '4-7', '8-12'];
    var SEASONS = ['summer', 'winter'];

    var GROUP_RANGES = {
        '1': { min: 1, max: 1 },
        '2-3': { min: 2, max: 3 },
        '4-7': { min: 4, max: 7 },
        '8-12': { min: 8, max: 12 }
    };

    var tours = {
        'tour-agafay.html': {
            seasonal: false,
            durations: {
                '1': { '1': 100, '2-3': 60, '4-7': 45, '8-12': 35 },
                '2': { '1': 280, '2-3': 190, '4-7': 150, '8-12': 125 },
                '3': { '1': 390, '2-3': 290, '4-7': 230, '8-12': 190 }
            }
        },
        'tour-ait-bougmez.html': {
            seasonal: false,
            durations: {
                '3': { '1': 600, '2-3': 420, '4-7': 330, '8-12': 280 },
                '4': { '1': 750, '2-3': 520, '4-7': 400, '8-12': 340 }
            }
        },
        'tour-atlas-villages.html': {
            seasonal: false,
            durations: {
                '3': { '1': 450, '2-3': 320, '4-7': 250, '8-12': 210 }
            }
        },
        'tour-azzaden-tamsoult.html': {
            seasonal: false,
            durations: {
                '1': { '1': 110, '2-3': 70, '4-7': 55, '8-12': 45 },
                '2': { '1': 260, '2-3': 190, '4-7': 150, '8-12': 125 },
                '3': { '1': 390, '2-3': 290, '4-7': 230, '8-12': 190 },
                '4': { '1': 520, '2-3': 390, '4-7': 310, '8-12': 260 }
            }
        },
        'tour-chefchaouen.html': {
            seasonal: false,
            durations: {
                '3': { '1': 650, '2-3': 450, '4-7': 350, '8-12': 290 }
            }
        },
        'tour-essaouira.html': {
            seasonal: false,
            durations: {
                '1': { '1': 150, '2-3': 85, '4-7': 55, '8-12': 40 }
            }
        },
        'tour-mgoun.html': {
            seasonal: false,
            durations: {
                '4': { '1': 700, '2-3': 500, '4-7': 400, '8-12': 330 }
            }
        },
        'tour-ouzoud.html': {
            seasonal: false,
            durations: {
                '3': { '1': 500, '2-3': 350, '4-7': 280, '8-12': 230 }
            }
        },
        'tour-saghro.html': {
            seasonal: false,
            durations: {
                '5': { '1': 750, '2-3': 550, '4-7': 440, '8-12': 370 },
                '6': { '1': 900, '2-3': 650, '4-7': 520, '8-12': 440 }
            }
        },
        'tour-sahara-erg-chebbi.html': {
            seasonal: false,
            durations: {
                '5': { '1': 950, '2-3': 650, '4-7': 500, '8-12': 420 }
            }
        },
        'tour-sahara-merzouga.html': {
            seasonal: false,
            durations: {
                '3': { '1': 690, '2-3': 350, '4-7': 245, '8-12': 190 }
            }
        },
        'tour-siroua.html': {
            seasonal: false,
            durations: {
                '6': { '1': 900, '2-3': 650, '4-7': 520, '8-12': 440 }
            }
        },
        'tour-todra-dades.html': {
            seasonal: false,
            durations: {
                '4': { '1': 650, '2-3': 450, '4-7': 350, '8-12': 290 }
            }
        },
        'tour-10-days.html': {
            seasonal: false,
            durations: {
                '10': { '1': 1800, '2-3': 1250, '4-7': 1000, '8-12': 850 }
            }
        },
        'tour-toubkal.html': {
            seasonal: true,
            seasons: ['summer', 'winter'],
            durations: {
                // Approved Toubkal matrix. Fixed rates for durations 1 and 3-6;
                // only the 2-day Classic Summit has summer/winter rates.
                '1': { '1': 200, '2-3': 150, '4-7': 130, '8-12': 110 },
                '2': {
                    '1': { summer: 230, winter: 250 },
                    '2-3': { summer: 150, winter: 175 },
                    '4-7': { summer: 135, winter: 145 },
                    '8-12': { summer: 120, winter: 125 }
                },
                '3': { '1': 320, '2-3': 225, '4-7': 190, '8-12': 165 },
                '4': { '1': 420, '2-3': 290, '4-7': 240, '8-12': 210 },
                '5': { '1': 520, '2-3': 360, '4-7': 300, '8-12': 260 },
                '6': { '1': 620, '2-3': 430, '4-7': 360, '8-12': 310 }
            }
        }
    };

    // The French 10-day page uses a translated slug rather than a -fr suffix.
    var aliases = {
        'tour-10-jours.html': 'tour-10-days.html'
    };

    function normalizeTourKey(pathname) {
        var filename = String(pathname || '').split('/').pop() || '';
        try {
            filename = decodeURIComponent(filename);
        } catch (ignore) {
            // Keep the raw filename if decoding fails.
        }
        filename = filename.toLowerCase();
        if (aliases[filename]) return aliases[filename];
        if (/-fr\.html$/.test(filename)) {
            filename = filename.replace(/-fr\.html$/, '.html');
        }
        return aliases[filename] || filename;
    }

    function getTour(tourKey) {
        return tours[String(tourKey || '')] || null;
    }

    function isSeasonal(tourKey) {
        var tour = getTour(tourKey);
        return !!(tour && tour.seasonal);
    }

    function normalizeDuration(duration) {
        var numeric = parseInt(duration, 10);
        return isFinite(numeric) && numeric > 0 ? String(numeric) : null;
    }

    function isValidGroupSize(groupSize) {
        return GROUP_SIZES.indexOf(String(groupSize || '')) !== -1;
    }

    function getGroupRange(groupSize) {
        var range = GROUP_RANGES[String(groupSize || '')];
        return range ? { min: range.min, max: range.max } : null;
    }

    function hasSeasonalRates(tourKey, duration) {
        var tour = getTour(tourKey);
        if (!tour || !tour.seasonal) return false;
        var durationKey = normalizeDuration(duration);
        if (!durationKey) return false;
        var durationPricing = tour.durations[durationKey];
        if (!durationPricing) return false;
        return GROUP_SIZES.some(function (groupSize) {
            var rate = durationPricing[groupSize];
            if (!rate || typeof rate !== 'object') return false;
            return SEASONS.some(function (season) {
                var value = rate[season];
                return typeof value === 'number' && isFinite(value) && value > 0;
            });
        });
    }

    function getPrice(tourKey, duration, groupSize, season) {
        var tour = getTour(tourKey);
        if (!tour) return null;

        var durationKey = normalizeDuration(duration);
        if (!durationKey) return null;
        var durationPricing = tour.durations[durationKey];
        if (!durationPricing) return null;

        var sizeKey = String(groupSize || '');
        if (!isValidGroupSize(sizeKey)) return null;
        var rate = durationPricing[sizeKey];
        if (rate === undefined || rate === null) return null;

        var value;
        if (rate && typeof rate === 'object') {
            // Seasonal rate: a season is required (only the 2-day Toubkal itinerary).
            var seasonKey = String(season || '');
            if (SEASONS.indexOf(seasonKey) === -1) return null;
            value = rate[seasonKey];
        } else {
            // Fixed rate: season is irrelevant for this duration.
            value = rate;
        }

        return (typeof value === 'number' && isFinite(value) && value > 0) ? value : null;
    }

    function getGroupSizeForTravelers(count) {
        var travelers = parseInt(count, 10);
        if (!isFinite(travelers) || travelers <= 1) return '1';
        if (travelers <= 3) return '2-3';
        if (travelers <= 7) return '4-7';
        return '8-12';
    }

    function getTravelersForGroupSize(groupSize) {
        var range = getGroupRange(groupSize);
        return range ? range.min : 1;
    }

    function getGroupTotal(price, groupSize, travelers) {
        if (price === null || price === undefined) return null;
        var numericPrice = Number(price);
        if (!isFinite(numericPrice) || numericPrice <= 0) return null;
        if (!isValidGroupSize(groupSize)) return null;
        if (groupSize === '1') return numericPrice;

        var range = getGroupRange(groupSize);
        var count = parseInt(travelers, 10);
        if (!range || !isFinite(count) || count < 1) return null;

        // Keep the total inside the selected pricing band if the form and the
        // group selector are briefly out of step (the UI synchronises them).
        var effectiveCount = Math.min(Math.max(count, range.min), range.max);
        return numericPrice * effectiveCount;
    }

    function validate() {
        var issues = [];
        Object.keys(tours).forEach(function (tourKey) {
            var tour = tours[tourKey];
            var durationKeys = Object.keys(tour.durations || {});
            if (!durationKeys.length) {
                issues.push(tourKey + ': no durations configured');
                return;
            }
            durationKeys.forEach(function (durationKey) {
                if (!/^\d+$/.test(durationKey)) {
                    issues.push(tourKey + ': invalid duration key "' + durationKey + '"');
                }
                var durationPricing = tour.durations[durationKey];
                GROUP_SIZES.forEach(function (groupSize) {
                    var rate = durationPricing[groupSize];
                    if (rate === undefined || rate === null) {
                        issues.push(tourKey + ' / ' + durationKey + ' / ' + groupSize + ': missing rate');
                        return;
                    }
                    if (rate && typeof rate === 'object') {
                        SEASONS.forEach(function (season) {
                            var value = rate[season];
                            if (typeof value !== 'number' || !isFinite(value) || value <= 0) {
                                issues.push(tourKey + ' / ' + durationKey + ' / ' + groupSize + ' / ' + season + ': missing or invalid rate');
                            }
                        });
                    } else if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) {
                        issues.push(tourKey + ' / ' + durationKey + ' / ' + groupSize + ': missing or invalid rate');
                    }
                });
            });
        });
        return issues;
    }

    window.MTTPricing = {
        CURRENCY_SYMBOL: CURRENCY_SYMBOL,
        WHATSAPP_NUMBER: WHATSAPP_NUMBER,
        GROUP_SIZES: GROUP_SIZES.slice(),
        SEASONS: SEASONS.slice(),
        tours: tours,
        aliases: aliases,
        normalizeTourKey: normalizeTourKey,
        getTour: getTour,
        isSeasonal: isSeasonal,
        hasSeasonalRates: hasSeasonalRates,
        isValidGroupSize: isValidGroupSize,
        getPrice: getPrice,
        getGroupRange: getGroupRange,
        getGroupSizeForTravelers: getGroupSizeForTravelers,
        getTravelersForGroupSize: getTravelersForGroupSize,
        getGroupTotal: getGroupTotal,
        validate: validate
    };

    var LABELS = {
        en: {
            quoteText: 'Request a quote',
            quoteShort: 'Quote',
            unitPerson: ' / person',
            unitTotal: ' total',
            unitPersonSticky: '/person',
            unitTotalSticky: ' total',
            perPersonSuffix: ' per person',
            totalSuffix: ' total',
            totalWord: 'total',
            microQuote: 'Price to be confirmed for this itinerary',
            microSolo: 'Indicative total price for one traveler',
            microGroup: 'Indicative price per person \u00B7 group total shown below',
            daysSticky: 'Days',
            daysLower: 'days',
            groupText: function (travelers) {
                return travelers === 1 ? '1 person' : travelers + ' people';
            },
            bandText: function (groupSize) {
                return groupSize === '1' ? 'solo' : groupSize + ' band';
            },
            groupDetail: function (travelers, groupSize) {
                var countText = travelers === 1 ? '1 traveler' : travelers + ' travelers';
                var band = groupSize === '1' ? 'solo' : groupSize + ' band';
                return countText + ' (' + band + ')';
            },
            totalSoloLabel: 'Total:',
            totalGroupLabel: 'Group total:',
            seasonSummer: 'Summer',
            seasonWinter: 'Winter',
            notSelected: 'Not selected',
            notSpecified: 'Not specified',
            none: 'None',
            successText: '\u2713 Booking Request Sent'
        },
        fr: {
            quoteText: 'Demander un devis',
            quoteShort: 'Devis',
            unitPerson: ' / personne',
            unitTotal: ' au total',
            unitPersonSticky: '/personne',
            unitTotalSticky: ' au total',
            perPersonSuffix: ' par personne',
            totalSuffix: ' au total',
            totalWord: 'au total',
            microQuote: 'Tarif \u00E0 confirmer pour cet itin\u00E9raire',
            microSolo: 'Prix total indicatif pour un voyageur',
            microGroup: 'Prix indicatif par personne \u00B7 total du groupe ci-dessous',
            daysSticky: 'Jours',
            daysLower: 'jours',
            groupText: function (travelers) {
                return travelers === 1 ? '1 personne' : travelers + ' personnes';
            },
            bandText: function (groupSize) {
                return groupSize === '1' ? 'solo' : 'tranche ' + groupSize;
            },
            groupDetail: function (travelers, groupSize) {
                var countText = travelers === 1 ? '1 voyageur' : travelers + ' voyageurs';
                var band = groupSize === '1' ? 'solo' : 'tranche ' + groupSize;
                return countText + ' (' + band + ')';
            },
            totalSoloLabel: 'Total :',
            totalGroupLabel: 'Total du groupe :',
            seasonSummer: '\u00C9t\u00E9',
            seasonWinter: 'Hiver',
            notSelected: 'Non s\u00E9lectionn\u00E9e',
            notSpecified: 'Non pr\u00E9cis\u00E9e',
            none: 'Aucune',
            successText: '\u2705 Demande de R\u00E9servation Envoy\u00E9e'
        }
    };

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function textOf(element) {
        return element ? String(element.textContent || '').replace(/\s+/g, ' ').trim() : '';
    }

    function init(options) {
        options = options || {};
        var lang = options.lang === 'fr' ? 'fr' : 'en';
        var labels = LABELS[lang];

        function start() {
            if (!window.MTTPricing) {
                console.error('[pricing] pricing-system.js must load before the pricing adapter.');
                return;
            }
            if (window.__MTTPricingInitialized) return;
            window.__MTTPricingInitialized = true;

            var tourKey = window.MTTPricing.normalizeTourKey(window.location.pathname);
            var state = readState(tourKey);
            var priceAnimations = new WeakMap();

            initialize();

            function readState(key) {
                var activeCard = document.querySelector('.itinerary-option-card.active');
                var parsedDuration = activeCard ? parseInt(activeCard.dataset.duration, 10) : NaN;
                var duration = isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : null;

                var label = activeCard ? String(activeCard.dataset.label || '') : '';
                if (!label && activeCard) {
                    label = textOf(activeCard.querySelector('.itinerary-name, h4, h3'));
                }
                if (!label) {
                    label = String(document.title || '').split('|')[0].trim();
                }

                var travelersSelect = document.getElementById('travelers');
                var travelers = 1;
                if (travelersSelect) {
                    var parsedTravelers = parseInt(travelersSelect.value, 10);
                    if (isFinite(parsedTravelers) && parsedTravelers > 0) {
                        travelers = Math.min(parsedTravelers, 12);
                    }
                }

                var activeGroup = document.querySelector('.group-option.active');
                var groupSize = activeGroup ? String(activeGroup.dataset.size || '') : '';
                if (!window.MTTPricing.isValidGroupSize(groupSize)) {
                    groupSize = window.MTTPricing.getGroupSizeForTravelers(travelers);
                }

                var season = null;
                if (window.MTTPricing.hasSeasonalRates(key, duration)) {
                    var activeSeason = document.querySelector('.season-option.active');
                    season = activeSeason ? String(activeSeason.dataset.season || '') : '';
                    if (window.MTTPricing.SEASONS.indexOf(season) === -1) season = 'summer';
                }

                return {
                    tourKey: key,
                    duration: duration,
                    label: label,
                    groupSize: groupSize,
                    season: season,
                    travelers: travelers
                };
            }

            function initialize() {
                syncGroupUI();
                syncTravelersWithGroup();
                syncSeasonUI();
                setupSeasonVisibility();
                bindEvents();
                render();
                setupStickyVisibility();
                setupFloatingCards();
                setupMiscUI();
                defineStickyBookingAction();

                var travelDate = document.getElementById('travel-date');
                if (travelDate && travelDate.value) {
                    detectSeasonFromDate(travelDate.value);
                }
            }

            function currentPrice() {
                return window.MTTPricing.getPrice(
                    state.tourKey,
                    state.duration,
                    state.groupSize,
                    state.season
                );
            }

            function currentTotal(price) {
                return window.MTTPricing.getGroupTotal(price, state.groupSize, state.travelers);
            }

            function render() {
                var price = currentPrice();
                var total = currentTotal(price);
                setupSeasonVisibility();
                renderMainPrice(price);
                renderStickyPrice(price, total);
                renderBreakdown(total);
                syncHiddenFields(price, total);
            }

            function syncGroupUI() {
                qsa('.group-option').forEach(function (option) {
                    option.classList.toggle('active', option.dataset.size === state.groupSize);
                });
            }

            function syncSeasonUI() {
                if (!window.MTTPricing.hasSeasonalRates(state.tourKey, state.duration)) return;
                if (!state.season) state.season = 'summer';
                qsa('.season-option').forEach(function (option) {
                    option.classList.toggle('active', option.dataset.season === state.season);
                });
            }

            function syncTravelersWithGroup() {
                var select = document.getElementById('travelers');
                if (!select) return;

                var range = window.MTTPricing.getGroupRange(state.groupSize);
                if (!range) return;

                var current = parseInt(select.value, 10);
                if (!isFinite(current) || current < range.min || current > range.max) {
                    current = range.min;
                    select.value = String(current);
                }
                state.travelers = current;
            }

            function setupSeasonVisibility() {
                var showSeason = window.MTTPricing.hasSeasonalRates(state.tourKey, state.duration);
                var section = document.querySelector('.season-section');
                if (section) section.style.display = showSeason ? 'block' : 'none';

                var seasonElement = document.getElementById('selectedSeason');
                if (seasonElement) {
                    var row = seasonElement.closest('.breakdown-item');
                    if (row) row.style.display = showSeason ? '' : 'none';
                }
            }

            function bindEvents() {
                qsa('.itinerary-option-card').forEach(function (card) {
                    card.addEventListener('click', function () {
                        qsa('.itinerary-option-card').forEach(function (item) {
                            item.classList.remove('active');
                        });
                        card.classList.add('active');

                        var parsed = parseInt(card.dataset.duration, 10);
                        state.duration = isFinite(parsed) && parsed > 0 ? parsed : null;
                        state.label = String(card.dataset.label || '') || textOf(card.querySelector('.itinerary-name, h4, h3')) || state.label;

                        if (window.MTTPricing.hasSeasonalRates(state.tourKey, state.duration)) {
                            if (!state.season) state.season = 'summer';
                        }
                        syncSeasonUI();
                        animateSelection(card);
                        render();
                    });
                });

                qsa('.group-option').forEach(function (option) {
                    option.addEventListener('click', function () {
                        var size = String(option.dataset.size || '');
                        if (!window.MTTPricing.isValidGroupSize(size)) return;

                        qsa('.group-option').forEach(function (item) {
                            item.classList.remove('active');
                        });
                        option.classList.add('active');
                        state.groupSize = size;
                        syncTravelersWithGroup();
                        animateSelection(option);
                        render();
                    });
                });

                var travelersSelect = document.getElementById('travelers');
                if (travelersSelect) {
                    travelersSelect.addEventListener('change', function () {
                        var travelers = parseInt(this.value, 10);
                        if (!isFinite(travelers) || travelers < 1) travelers = 1;
                        travelers = Math.min(travelers, 12);
                        this.value = String(travelers);
                        state.travelers = travelers;
                        state.groupSize = window.MTTPricing.getGroupSizeForTravelers(travelers);
                        syncGroupUI();
                        render();
                    });
                }

                qsa('.season-option').forEach(function (option) {
                    option.addEventListener('click', function () {
                        if (!window.MTTPricing.hasSeasonalRates(state.tourKey, state.duration)) return;
                        var season = String(option.dataset.season || '');
                        if (window.MTTPricing.SEASONS.indexOf(season) === -1) return;

                        qsa('.season-option').forEach(function (item) {
                            item.classList.remove('active');
                        });
                        option.classList.add('active');
                        state.season = season;
                        animateSelection(option);
                        render();
                    });
                });

                var travelDate = document.getElementById('travel-date');
                if (travelDate) {
                    travelDate.addEventListener('change', function () {
                        detectSeasonFromDate(this.value);
                    });
                }

                var bookingForm = document.querySelector('.luxury-booking-form');
                if (bookingForm) {
                    bookingForm.addEventListener('submit', handleFormSubmission);
                }

                var bookNowButton = document.getElementById('bookNowBtn');
                if (bookNowButton) {
                    bookNowButton.addEventListener('click', function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        openWhatsApp(buildStickyMessage());
                    });
                }
            }

            function renderMainPrice(price) {
                var priceElement = document.getElementById('dynamicPrice');
                var amount = document.querySelector('.price-amount');
                var currency = amount ? amount.querySelector('.currency') : null;
                var units = amount ? qsa('.price-unit', amount) : [];
                var microcopy = document.getElementById('priceMicrocopy') || document.querySelector('.price-microcopy');
                var isQuote = price === null;
                var solo = state.groupSize === '1';

                if (currency) currency.style.display = isQuote ? 'none' : '';
                units.forEach(function (unit) {
                    unit.style.display = isQuote ? 'none' : '';
                    if (!isQuote) unit.textContent = solo ? labels.unitTotal : labels.unitPerson;
                });

                setPriceText(priceElement, isQuote ? labels.quoteText : String(price), isQuote, false);

                if (microcopy) {
                    microcopy.textContent = isQuote
                        ? labels.microQuote
                        : (solo ? labels.microSolo : labels.microGroup);
                }
            }

            function renderStickyPrice(price, total) {
                var wrap = document.querySelector('.sticky-price');
                var isQuote = price === null;
                var solo = state.groupSize === '1';

                if (wrap) {
                    ensureStickyStructure(wrap);
                    var currency = document.getElementById('stickyCurrency');
                    var priceElement = document.getElementById('stickyPrice');
                    var unit = document.getElementById('stickyPriceUnit');

                    if (currency) currency.style.display = isQuote ? 'none' : '';
                    if (unit) {
                        unit.style.display = isQuote ? 'none' : '';
                        if (!isQuote) unit.textContent = solo ? labels.unitTotalSticky : labels.unitPersonSticky;
                    }
                    setPriceText(priceElement, isQuote ? labels.quoteShort : String(price), isQuote, true);
                }

                var stickyItinerary = document.getElementById('stickyItinerary');
                if (stickyItinerary) {
                    stickyItinerary.textContent = state.duration
                        ? state.duration + ' ' + labels.daysSticky + ': ' + state.label
                        : state.label;
                }

                var stickyMeta = document.getElementById('stickyMeta');
                if (stickyMeta) stickyMeta.textContent = buildStickyMeta(total);
            }

            function ensureStickyStructure(wrap) {
                if (wrap.querySelector('#stickyCurrency') &&
                    wrap.querySelector('#stickyPrice') &&
                    wrap.querySelector('#stickyPriceUnit')) {
                    return;
                }

                wrap.innerHTML = '';
                var currency = document.createElement('span');
                currency.id = 'stickyCurrency';
                currency.textContent = CURRENCY_SYMBOL;

                var price = document.createElement('span');
                price.id = 'stickyPrice';

                var unit = document.createElement('span');
                unit.id = 'stickyPriceUnit';

                wrap.appendChild(currency);
                wrap.appendChild(price);
                wrap.appendChild(unit);
            }

            function buildStickyMeta(total) {
                var parts = [labels.groupText(state.travelers)];
                if (window.MTTPricing.hasSeasonalRates(state.tourKey, state.duration)) {
                    parts.push(seasonText());
                }
                parts.push(total === null ? labels.quoteShort : CURRENCY_SYMBOL + total + ' ' + labels.totalWord);
                return parts.join(' \u00B7 ');
            }

            function renderBreakdown(total) {
                var itineraryElement = document.getElementById('selectedItinerary');
                var groupElement = document.getElementById('selectedGroupSize');
                var seasonElement = document.getElementById('selectedSeason');
                var seasonal = window.MTTPricing.hasSeasonalRates(state.tourKey, state.duration);

                if (itineraryElement) itineraryElement.textContent = state.label;
                if (groupElement) groupElement.textContent = labels.groupDetail(state.travelers, state.groupSize);

                if (seasonElement) {
                    if (seasonal) seasonElement.textContent = seasonText();
                    var seasonRow = seasonElement.closest('.breakdown-item');
                    if (seasonRow) seasonRow.style.display = seasonal ? '' : 'none';
                }

                renderTotalRow(total);
            }

            function renderTotalRow(total) {
                var breakdown = document.querySelector('.price-breakdown');
                if (!breakdown) return;

                var row = document.getElementById('selectedGroupTotalRow');
                if (!row) {
                    row = document.createElement('div');
                    row.className = 'breakdown-item breakdown-total';
                    row.id = 'selectedGroupTotalRow';

                    var labelElement = document.createElement('span');
                    labelElement.className = 'breakdown-label';
                    labelElement.id = 'selectedGroupTotalLabel';

                    var valueElement = document.createElement('span');
                    valueElement.className = 'breakdown-value';
                    valueElement.id = 'selectedGroupTotal';

                    row.appendChild(labelElement);
                    row.appendChild(valueElement);
                    breakdown.appendChild(row);
                }

                var labelElement = document.getElementById('selectedGroupTotalLabel');
                var valueElement = document.getElementById('selectedGroupTotal');

                if (labelElement) {
                    labelElement.textContent = state.groupSize === '1'
                        ? labels.totalSoloLabel
                        : labels.totalGroupLabel;
                }
                if (valueElement) {
                    valueElement.textContent = total === null
                        ? labels.quoteText
                        : CURRENCY_SYMBOL + total;
                }
            }

            function syncHiddenFields(price, total) {
                var form = document.querySelector('.luxury-booking-form');
                if (!form) return;

                var seasonal = window.MTTPricing.hasSeasonalRates(state.tourKey, state.duration);
                var values = {
                    'pricing-duration': state.duration ? String(state.duration) : '',
                    'pricing-group': state.groupSize || '',
                    'pricing-season': seasonal ? (state.season || '') : '',
                    'pricing-travelers': String(state.travelers),
                    'pricing-price': price === null ? 'quote' : String(price),
                    'pricing-total': total === null ? 'quote' : String(total)
                };

                Object.keys(values).forEach(function (name) {
                    var input = form.querySelector('input[name="' + name + '"]');
                    if (!input) {
                        input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = name;
                        form.appendChild(input);
                    }
                    input.value = values[name];
                });
            }

            function setPriceText(element, text, isQuote, isSticky) {
                if (!element) return;

                var animation = priceAnimations.get(element);
                if (animation) {
                    cancelAnimationFrame(animation.frame);
                    priceAnimations.delete(element);
                }

                element.style.transform = '';
                element.style.opacity = '';
                element.style.fontSize = isQuote ? (isSticky ? '1rem' : '1.2rem') : '';
                element.style.fontWeight = isQuote ? '600' : '';

                if (element.textContent === text) return;

                var from = parseInt(String(element.textContent || '').replace(/[^0-9]/g, ''), 10);
                var to = parseInt(String(text || '').replace(/[^0-9]/g, ''), 10);
                var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

                if (isQuote || reducedMotion || !isFinite(from) || !isFinite(to) || from === to) {
                    element.textContent = text;
                    return;
                }

                var startTime = null;
                var duration = 300;

                function frame(timestamp) {
                    if (startTime === null) startTime = timestamp;
                    var progress = Math.min((timestamp - startTime) / duration, 1);
                    var eased = 1 - Math.pow(1 - progress, 2);
                    element.textContent = String(Math.round(from + (to - from) * eased));

                    if (progress < 1) {
                        var frameId = requestAnimationFrame(frame);
                        priceAnimations.set(element, { frame: frameId });
                    } else {
                        element.textContent = text;
                        priceAnimations.delete(element);
                    }
                }

                var animationId = requestAnimationFrame(frame);
                priceAnimations.set(element, { frame: animationId });
            }

            function seasonText() {
                return state.season === 'winter' ? labels.seasonWinter : labels.seasonSummer;
            }

            function formatPriceText(price) {
                if (price === null) return labels.quoteText;
                return CURRENCY_SYMBOL + price + (state.groupSize === '1' ? labels.totalSuffix : labels.perPersonSuffix);
            }

            function formatTotalText(total) {
                return total === null ? labels.quoteText : CURRENCY_SYMBOL + total;
            }

            function buildBookingMessage(data, price, total) {
                var seasonal = window.MTTPricing.hasSeasonalRates(state.tourKey, state.duration);
                var date = data['travel-date'] || data.travelDate || labels.notSpecified;
                var name = data.name || '';
                var email = data.email || '';
                var phone = data.phone || '';
                var requests = data.message || labels.none;
                var priceText = formatPriceText(price);
                var totalText = formatTotalText(total);
                var totalLabel = state.groupSize === '1' ? labels.totalSoloLabel : labels.totalGroupLabel;
                var lines = [];

                if (lang === 'fr') {
                    lines.push('Demande de r\u00E9servation', '');
                    lines.push('Circuit : ' + state.label);
                    lines.push('Dur\u00E9e : ' + (state.duration ? state.duration + ' ' + labels.daysLower : labels.notSelected));
                    lines.push('Voyageurs : ' + labels.groupText(state.travelers) + ' (' + labels.bandText(state.groupSize) + ')');
                    if (seasonal) lines.push('Saison : ' + seasonText());
                    lines.push('Prix : ' + priceText);
                    lines.push(totalLabel + ' ' + totalText);
                    lines.push('Date : ' + date);
                    lines.push('Nom : ' + name);
                    lines.push('Email : ' + email);
                    lines.push('T\u00E9l\u00E9phone : ' + phone);
                    lines.push('Demandes sp\u00E9ciales : ' + requests);
                    lines.push('');
                    lines.push(price === null
                        ? 'Merci de confirmer le tarif et la disponibilit\u00E9.'
                        : 'Merci de confirmer la disponibilit\u00E9 et les modalit\u00E9s de r\u00E9servation.');
                } else {
                    lines.push('Tour Booking Request', '');
                    lines.push('Tour: ' + state.label);
                    lines.push('Duration: ' + (state.duration ? state.duration + ' ' + labels.daysLower : labels.notSelected));
                    lines.push('Travelers: ' + labels.groupText(state.travelers) + ' (' + labels.bandText(state.groupSize) + ')');
                    if (seasonal) lines.push('Season: ' + seasonText());
                    lines.push('Price: ' + priceText);
                    lines.push(totalLabel + ' ' + totalText);
                    lines.push('Date: ' + date);
                    lines.push('Name: ' + name);
                    lines.push('Email: ' + email);
                    lines.push('Phone: ' + phone);
                    lines.push('Special requests: ' + requests);
                    lines.push('');
                    lines.push(price === null
                        ? 'Please confirm the price and availability.'
                        : 'Please confirm availability and booking details.');
                }

                return lines.join('\n');
            }

            function buildStickyMessage() {
                var price = currentPrice();
                var total = currentTotal(price);
                var seasonal = window.MTTPricing.hasSeasonalRates(state.tourKey, state.duration);
                var totalLabel = state.groupSize === '1' ? labels.totalSoloLabel : labels.totalGroupLabel;
                var lines = [];

                if (lang === 'fr') {
                    lines.push('Bonjour ! Je suis int\u00E9ress\u00E9(e) par la r\u00E9servation :', '');
                    lines.push('Circuit : ' + state.label);
                    lines.push('Dur\u00E9e : ' + (state.duration ? state.duration + ' ' + labels.daysLower : labels.notSelected));
                    lines.push('Voyageurs : ' + labels.groupText(state.travelers) + ' (' + labels.bandText(state.groupSize) + ')');
                    if (seasonal) lines.push('Saison : ' + seasonText());
                    lines.push('Prix : ' + formatPriceText(price));
                    lines.push(totalLabel + ' ' + formatTotalText(total));
                    lines.push('');
                    lines.push('Veuillez fournir plus d\'informations sur la disponibilit\u00E9 et le processus de r\u00E9servation.');
                } else {
                    lines.push('Hello! I\'m interested in booking:', '');
                    lines.push('Tour: ' + state.label);
                    lines.push('Duration: ' + (state.duration ? state.duration + ' ' + labels.daysLower : labels.notSelected));
                    lines.push('Travelers: ' + labels.groupText(state.travelers) + ' (' + labels.bandText(state.groupSize) + ')');
                    if (seasonal) lines.push('Season: ' + seasonText());
                    lines.push('Price: ' + formatPriceText(price));
                    lines.push(totalLabel + ' ' + formatTotalText(total));
                    lines.push('');
                    lines.push('Please provide more information about availability and booking process.');
                }

                return lines.join('\n');
            }

            function handleFormSubmission(event) {
                event.preventDefault();
                var form = event.currentTarget || event.target;
                var data = {};
                try {
                    data = Object.fromEntries(new FormData(form));
                } catch (ignore) {
                    data = {};
                }

                var submittedTravelers = parseInt(data.travelers, 10);
                if (isFinite(submittedTravelers) && submittedTravelers > 0) {
                    state.travelers = Math.min(submittedTravelers, 12);
                    state.groupSize = window.MTTPricing.getGroupSizeForTravelers(state.travelers);
                    syncGroupUI();
                    var select = document.getElementById('travelers');
                    if (select) select.value = String(state.travelers);
                }

                var price = currentPrice();
                var total = currentTotal(price);
                render();
                openWhatsApp(buildBookingMessage(data, price, total));
                showFormSuccess(form);
            }

            function openWhatsApp(message) {
                window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank');
            }

            function showFormSuccess(form) {
                var button = form.querySelector('.luxury-cta');
                if (!button || button.dataset.pricingSuccess === '1') return;

                button.dataset.pricingSuccess = '1';
                var original = button.innerHTML;
                button.innerHTML = '<span class="cta-text">' + labels.successText + '</span>';
                button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';

                setTimeout(function () {
                    button.innerHTML = original;
                    button.style.background = '';
                    delete button.dataset.pricingSuccess;
                }, 3000);
            }

            function detectSeasonFromDate(value) {
                if (!value) return;
                if (!window.MTTPricing.hasSeasonalRates(state.tourKey, state.duration)) return;

                var date = new Date(value + 'T12:00:00');
                if (isNaN(date.getTime())) return;

                var month = date.getMonth() + 1;
                var detectedSeason = (month >= 5 && month <= 10) ? 'summer' : 'winter';
                if (state.season === detectedSeason) return;

                state.season = detectedSeason;
                syncSeasonUI();
                render();
            }

            function animateSelection(element) {
                element.style.transform = 'scale(0.95)';
                setTimeout(function () {
                    element.style.transform = '';
                }, 150);
            }

            function setupStickyVisibility() {
                var sticky = document.getElementById('stickyBooking');
                var section = document.querySelector('.luxury-pricing-section');
                if (!sticky || !section) return;

                function updateVisibility() {
                    var sectionBottom = section.offsetTop + section.offsetHeight;
                    if (window.scrollY > sectionBottom - 200) {
                        sticky.classList.add('visible');
                    } else {
                        sticky.classList.remove('visible');
                    }
                }

                window.addEventListener('scroll', updateVisibility, { passive: true });
                updateVisibility();
            }

            function setupFloatingCards() {
                if (!('IntersectionObserver' in window)) return;

                var cards = qsa('.floating-card');
                if (!cards.length) return;

                var observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                });

                cards.forEach(function (card) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    observer.observe(card);
                });
            }

            function setupMiscUI() {
                qsa('.contact-link').forEach(function (link) {
                    link.addEventListener('mouseenter', function () {
                        this.style.transform = 'translateY(-2px) scale(1.05)';
                    });
                    link.addEventListener('mouseleave', function () {
                        this.style.transform = 'translateY(0) scale(1)';
                    });
                });

                qsa('.form-group input, .form-group select, .form-group textarea').forEach(function (input) {
                    input.addEventListener('focus', function () {
                        if (this.parentElement) this.parentElement.style.transform = 'scale(1.02)';
                    });
                    input.addEventListener('blur', function () {
                        if (this.parentElement) this.parentElement.style.transform = 'scale(1)';
                    });
                });
            }

            function defineStickyBookingAction() {
                window.scrollToBooking = function () {
                    openWhatsApp(buildStickyMessage());
                };
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start, { once: true });
        } else {
            start();
        }
    }

    window.MTTPricingUI = {
        init: init
    };
})(window, document);
