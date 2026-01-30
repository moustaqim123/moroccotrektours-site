// Logo Animation Controller - Cinematic & Luxury
// Lines converge like mountain contours to form the logo

class LogoAnimation {
    constructor() {
        this.svg = document.getElementById('logo-animation');
        this.replayBtn = document.getElementById('replay-btn');
        this.autoReplayInterval = null;
        this.isAnimating = false;

        this.init();
    }

    init() {
        // Start animation on load
        setTimeout(() => this.playAnimation(), 500);

        // Replay button
        this.replayBtn.addEventListener('click', () => {
            this.resetAndPlay();
        });

        // Auto-replay every 2 minutes (120000ms)
        this.startAutoReplay();
    }

    playAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Animation sequence timeline (in milliseconds)
        const timeline = [
            // Phase 1: Footprint outline draws (0-1500ms)
            { delay: 0, action: () => this.animateFootprintOutline() },

            // Phase 2: Toes appear sequentially (1600-2400ms)
            { delay: 1600, action: () => this.animateToe('toe1') },
            { delay: 1750, action: () => this.animateToe('toe2') },
            { delay: 1900, action: () => this.animateToe('toe3') },
            { delay: 2050, action: () => this.animateToe('toe4') },
            { delay: 2200, action: () => this.animateToe('toe5') },

            // Phase 3: Mountain contour lines converge (2500-4000ms)
            { delay: 2500, action: () => this.animateMountainLine('mountain-line1', 0) },
            { delay: 2800, action: () => this.animateMountainLine('mountain-line2', 100) },
            { delay: 3100, action: () => this.animateMountainLine('mountain-line3', 200) },

            // Phase 4: Peak highlights appear (3800-4400ms)
            { delay: 3800, action: () => this.animatePeak('peak1') },
            { delay: 4000, action: () => this.animatePeak('peak2') },
            { delay: 4200, action: () => this.animatePeak('peak3') },

            // Phase 5: Bottom curve draws (4400-5200ms)
            { delay: 4400, action: () => this.animateBottomCurve() },

            // Phase 6: Final glow effect (5200ms)
            { delay: 5200, action: () => this.applyFinalState() },

            // Mark animation complete
            { delay: 5500, action: () => { this.isAnimating = false; } }
        ];

        // Execute timeline
        timeline.forEach(({ delay, action }) => {
            setTimeout(action, delay);
        });
    }

    animateFootprintOutline() {
        const outline = document.getElementById('footprint-outline');
        outline.classList.add('animate-footprint');
    }

    animateToe(toeId) {
        const toe = document.getElementById(toeId);
        toe.style.opacity = '1';
        toe.classList.add('animate-toe');
    }

    animateMountainLine(lineId, extraDelay = 0) {
        const line = document.getElementById(lineId);
        setTimeout(() => {
            line.classList.add('animate-mountain-line');
        }, extraDelay);
    }

    animatePeak(peakId) {
        const peak = document.getElementById(peakId);
        peak.classList.add('animate-peak');
    }

    animateBottomCurve() {
        const curve = document.getElementById('bottom-curve');
        curve.classList.add('animate-curve');
    }

    applyFinalState() {
        const logoGroup = document.getElementById('logo-symbol');
        logoGroup.classList.add('final-state');
    }

    resetAnimation() {
        // Remove all animation classes
        const elements = [
            'footprint-outline',
            'toe1', 'toe2', 'toe3', 'toe4', 'toe5',
            'mountain-line1', 'mountain-line2', 'mountain-line3',
            'peak1', 'peak2', 'peak3',
            'bottom-curve'
        ];

        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.className = '';
                el.style.opacity = id.startsWith('toe') || id.startsWith('peak') ? '0' : '1';
            }
        });

        // Reset footprint stroke
        const outline = document.getElementById('footprint-outline');
        if (outline) {
            outline.style.strokeDashoffset = '1000';
        }

        // Reset mountain lines
        ['mountain-line1', 'mountain-line2', 'mountain-line3'].forEach(id => {
            const line = document.getElementById(id);
            if (line) {
                line.style.strokeDashoffset = line.getAttribute('stroke-dasharray');
            }
        });

        // Reset bottom curve
        const curve = document.getElementById('bottom-curve');
        if (curve) {
            curve.style.strokeDashoffset = '100';
        }

        // Remove final state
        const logoGroup = document.getElementById('logo-symbol');
        if (logoGroup) {
            logoGroup.classList.remove('final-state');
        }

        this.isAnimating = false;
    }

    resetAndPlay() {
        this.resetAnimation();
        setTimeout(() => this.playAnimation(), 100);
    }

    startAutoReplay() {
        // Auto-replay every 2 minutes (120000ms)
        this.autoReplayInterval = setInterval(() => {
            this.resetAndPlay();
        }, 120000);
    }

    stopAutoReplay() {
        if (this.autoReplayInterval) {
            clearInterval(this.autoReplayInterval);
            this.autoReplayInterval = null;
        }
    }
}

// Initialize animation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const animation = new LogoAnimation();

    // Expose to window for debugging
    window.logoAnimation = animation;
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        window.logoAnimation?.stopAutoReplay();
    } else {
        window.logoAnimation?.startAutoReplay();
    }
});
