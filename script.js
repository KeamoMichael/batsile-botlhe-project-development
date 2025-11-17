// ============================================
// Scroll Animations with Intersection Observer
// ============================================

// Initialize Intersection Observer for scroll animations
const initScrollAnimations = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements for animations
    const fadeElements = document.querySelectorAll('.section-header, .service-card, .fade-in-up, .client-logo, h1.fade-in-up, h2.fade-in-up, p.fade-in-up');
    
    // Function to check if element is in viewport
    const isElementInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= windowHeight &&
            rect.right <= windowWidth
        ) || (
            rect.top < windowHeight &&
            rect.bottom > 0 &&
            rect.left < windowWidth &&
            rect.right > 0
        );
    };
    
    fadeElements.forEach(el => {
        observer.observe(el);
        
        // Check if element is already in viewport on page load/refresh
        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
            if (isElementInViewport(el)) {
                // Small delay to ensure smooth animation on load
                setTimeout(() => {
                    el.classList.add('visible');
                }, 200);
            }
        });
    });
};

// ============================================
// Header Scroll Effect
// ============================================

const initHeaderScroll = () => {
    const header = document.getElementById('header');
    const heroHeader = document.getElementById('hero-header');
    const heroSection = document.getElementById('hero');
    
    if (!header || !heroHeader || !heroSection) return;

    const checkScroll = () => {
        const currentScroll = window.pageYOffset;
        const heroHeight = heroSection.offsetHeight;
        
        // Box shadow removed as per user request
        header.style.boxShadow = 'none';
        
        // Show main header when scrolling past hero section
        if (currentScroll > heroHeight - 100) {
            heroHeader.classList.add('hidden');
            header.classList.add('visible');
        } else {
            heroHeader.classList.remove('hidden');
            header.classList.remove('visible');
        }
    };

    // Check on scroll
    window.addEventListener('scroll', checkScroll);
    
    // Check on page load
    checkScroll();
};

// ============================================
// Smooth Scroll for Navigation Links
// ============================================

const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 60;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// ============================================
// Load More Button Functionality for Services
// ============================================

const initLoadMore = () => {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const servicesGrid = document.querySelector('.services-grid');
    
    if (!loadMoreBtn || !servicesGrid) return;

    // Additional services data (can be expanded)
    const additionalServices = [
        { 
            title: 'Electrical Maintenance', 
            image: 'Web Resources/Service Images/pexels-ywanphoto-3089685.jpg',
            link: './service/electrical-maintenance'
        },
        { 
            title: 'Fault Finding', 
            image: 'Web Resources/Service Images/Fault-find-768x512.jpg',
            link: './service/fault-finding'
        },
        { 
            title: 'Gardening & Cleaning', 
            image: 'Web Resources/Service Images/municipal-professional-house-landscape-lawn-gardening-mowing-maintenace-and-service-city-grass-yard.jpg',
            link: './service/gardening-cleaning'
        }
    ];

    let servicesLoaded = 3; // Initial 3 services are already loaded

    loadMoreBtn.addEventListener('click', () => {
        if (servicesLoaded >= additionalServices.length + 3) {
            loadMoreBtn.style.display = 'none';
            return;
        }

        loadMoreBtn.style.opacity = '0.7';
        loadMoreBtn.style.pointerEvents = 'none';
        
        setTimeout(() => {
            const serviceToLoad = additionalServices[servicesLoaded - 3];
            if (serviceToLoad) {
                const serviceCard = document.createElement('a');
                serviceCard.href = serviceToLoad.link;
                serviceCard.className = 'service-card';
                serviceCard.innerHTML = `
                    <div class="service-image">
                        <img src="${serviceToLoad.image}" alt="${serviceToLoad.title}">
                    </div>
                    <div class="service-content">
                        <h4 class="service-title">${serviceToLoad.title}</h4>
                    </div>
                `;
                servicesGrid.appendChild(serviceCard);
                servicesLoaded++;
            }

            if (servicesLoaded >= additionalServices.length + 3) {
                loadMoreBtn.style.display = 'none';
            }

            loadMoreBtn.style.opacity = '1';
            loadMoreBtn.style.pointerEvents = 'auto';
        }, 300);
    });
};

// ============================================
// Button Hover Effects Enhancement
// ============================================

const initButtonEffects = () => {
    const buttons = document.querySelectorAll('.btn, .btn-load-more, .nav-cta');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
};

// ============================================
// Active Navigation Link Highlighting
// ============================================

const initActiveNav = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Also update hero nav links
    const heroNavLinks = document.querySelectorAll('.hero-nav-link');
    heroNavLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

// ============================================
// Initialize All Functions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initHeaderScroll();
    initSmoothScroll();
    initLoadMore();
    initButtonEffects();
    initActiveNav();
});

// ============================================
// Performance Optimization
// ============================================

// Throttle scroll events for better performance
const throttle = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Apply throttling to scroll-heavy functions
window.addEventListener('scroll', throttle(() => {
    // Scroll-based functions are already optimized
}, 16));

// ============================================
// Add Ripple Effect Styles Dynamically
// ============================================

const addRippleStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .btn, .btn-load-more, .nav-cta {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
};

addRippleStyles();
