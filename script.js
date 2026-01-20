// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Active nav link on scroll
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Intersection Observer for fade-in animations
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

// Enhanced scroll animations for all sections
document.addEventListener('DOMContentLoaded', () => {
    // Service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // Why cards
    const whyCards = document.querySelectorAll('.why-card');
    whyCards.forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // Testimonial cards
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // About feature cards
    const featureCards = document.querySelectorAll('.about-feature-card');
    featureCards.forEach(card => {
        card.classList.add('scale-in');
        observer.observe(card);
    });

    // Stats items
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.classList.add('fade-in');
        observer.observe(item);
    });

    // About hero content
    const aboutHeroContent = document.querySelector('.about-hero-content');
    if (aboutHeroContent) {
        aboutHeroContent.classList.add('slide-in-left');
        observer.observe(aboutHeroContent);
    }

    // About visual
    const aboutVisual = document.querySelector('.about-visual');
    if (aboutVisual) {
        aboutVisual.classList.add('slide-in-right');
        observer.observe(aboutVisual);
    }

    // Section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.classList.add('fade-in');
        observer.observe(header);
    });
});

// Smooth scroll offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        message: document.getElementById('message').value
    };

    // Here you would typically send the data to a server
    // For now, we'll just show a success message

    // Create success message
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 8px;
        margin-top: 1rem;
        text-align: center;
        font-weight: 600;
        animation: fadeInUp 0.5s ease;
    `;
    successMessage.textContent = 'Thank you for your message! We\'ll get back to you soon.';

    // Add message after form
    contactForm.appendChild(successMessage);

    // Reset form
    contactForm.reset();

    // Remove message after 5 seconds
    setTimeout(() => {
        successMessage.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
            successMessage.remove();
        }, 500);
    }, 5000);
});

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Parallax effect for hero decoration
window.addEventListener('scroll', () => {
    const decoration = document.querySelector('.hero-decoration');
    if (decoration) {
        const scrolled = window.pageYOffset;
        decoration.style.transform = `translate(${scrolled * 0.1}px, ${scrolled * 0.1}px) rotate(${scrolled * 0.1}deg)`;
    }
});

// Add hover effect to stat cards with counter animation
const statNumbers = document.querySelectorAll('.stat-number');

const animateValue = (element, start, end, duration, suffix = '') => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        if (typeof end === 'number') {
            element.textContent = Math.floor(progress * (end - start) + start) + suffix;
        } else {
            element.textContent = end;
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

// Observe stat cards for counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const text = entry.target.textContent.trim();
            entry.target.classList.add('counted');

            // Keep the original text for non-numeric stats
            if (text === '∞') {
                entry.target.style.animation = 'pulse 2s ease infinite';
            }
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
    statsObserver.observe(stat);
});

// Add pulse animation
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(pulseStyle);

// Scroll Progress Bar - Removed per user request

// Parallax effect for sections
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Parallax for hero illustration
    const heroIllustration = document.querySelector('.hero-illustration');
    if (heroIllustration) {
        heroIllustration.style.transform = `translateY(${scrolled * 0.3}px)`;
    }

    // Parallax for about visual circles
    const mainCircle = document.querySelector('.main-circle');
    if (mainCircle && scrolled > 300) {
        const offset = (scrolled - 300) * 0.1;
        mainCircle.style.transform = `translateY(${-offset}px)`;
    }

    const orbitCircles = document.querySelectorAll('.orbit-1, .orbit-2, .orbit-3');
    orbitCircles.forEach((circle, index) => {
        if (scrolled > 300) {
            const offset = (scrolled - 300) * (0.05 + index * 0.02);
            circle.style.transform = `translateY(${offset}px)`;
        }
    });
});

// Smooth reveal animations on scroll
const revealOnScroll = () => {
    const reveals = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');

    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100;

        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Run on load

// Add smooth hover effects to links
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Add "Back to Top" button
document.addEventListener('DOMContentLoaded', () => {
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);

    // Style the button
    const backToTopStyle = document.createElement('style');
    backToTopStyle.textContent = `
        .back-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
            z-index: 1000;
        }

        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
        }

        .back-to-top:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
        }

        @media (max-width: 768px) {
            .back-to-top {
                bottom: 20px;
                right: 20px;
                width: 45px;
                height: 45px;
                font-size: 1rem;
            }
        }
    `;
    document.head.appendChild(backToTopStyle);

    // Show/hide based on scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    // Scroll to top on click
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Add entrance animations for stats on scroll into view
const animateStats = () => {
    const statsRow = document.querySelector('.about-stats-row');
    if (statsRow) {
        const rect = statsRow.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            const statNumbers = statsRow.querySelectorAll('.stat-number');
            statNumbers.forEach((stat, index) => {
                setTimeout(() => {
                    stat.style.animation = 'fadeInUp 0.6s ease forwards';
                }, index * 100);
            });
        }
    }
};

window.addEventListener('scroll', animateStats);
animateStats();
