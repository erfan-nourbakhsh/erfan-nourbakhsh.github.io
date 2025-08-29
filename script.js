// ================================
// GLOBAL VARIABLES
// ================================

let isLoading = true;
let currentSection = 'home';
let particleCanvas, particleCtx;
let particles = [];
let animationId;

// ================================
// LOADING SCREEN
// ================================

class LoadingManager {
    constructor() {
        this.progress = 0;
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressBar = document.querySelector('.loading-progress');
        this.percentageText = document.querySelector('.loading-percentage');
        this.assets = [
            'styles.css',
            'script.js'
        ];
        
        this.init();
    }
    
    init() {
        this.simulateLoading();
    }
    
    simulateLoading() {
        const duration = 2500; // 2.5 seconds
        const interval = 50; // Update every 50ms
        const increment = 100 / (duration / interval);
        
        const loadingInterval = setInterval(() => {
            this.progress += increment + Math.random() * 2;
            
            if (this.progress >= 100) {
                this.progress = 100;
                clearInterval(loadingInterval);
                setTimeout(() => this.hideLoading(), 500);
            }
            
            this.updateProgress();
        }, interval);
    }
    
    updateProgress() {
        this.progressBar.style.width = `${this.progress}%`;
        this.percentageText.textContent = `${Math.round(this.progress)}%`;
    }
    
    hideLoading() {
        this.loadingScreen.style.opacity = '0';
        this.loadingScreen.style.visibility = 'hidden';
        isLoading = false;
        
        // Initialize everything after loading
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
            new App();
        }, 500);
    }
}

// ================================
// PARTICLE SYSTEM
// ================================

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.animationId = null;
        
        this.init();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.min(window.innerWidth / 10, 100);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(139, 92, 246, 0.8)',  // light-purple
            'rgba(168, 85, 247, 0.6)',  // lighter-purple
            'rgba(221, 214, 254, 0.4)', // lightest-purple
            'rgba(245, 158, 11, 0.5)'   // gold
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Mouse interaction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.x -= dx * force * 0.01;
                particle.y -= dy * force * 0.01;
            }
            
            // Normal movement
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Boundary checking
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }
            
            // Keep particles in bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
        });
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        // Draw connections
        this.drawConnections();
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    this.ctx.save();
                    this.ctx.globalAlpha = (120 - distance) / 120 * 0.2;
                    this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
        }
    }
    
    animate() {
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// ================================
// TYPEWRITER EFFECT
// ================================

class TypewriterEffect {
    constructor(element, texts, speed = 100, deleteSpeed = 50, pauseTime = 2000) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.deleteSpeed = deleteSpeed;
        this.pauseTime = pauseTime;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        
        this.start();
    }
    
    start() {
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        let typeSpeed = this.isDeleting ? this.deleteSpeed : this.speed;
        
        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// ================================
// SCROLL ANIMATIONS
// ================================

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }
    
    init() {
        this.createObserver();
        this.observeElements();
        this.initializeCounters();
    }
    
    createObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Special handling for different types of animations
                    if (entry.target.classList.contains('stat-item')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, this.observerOptions);
    }
    
    observeElements() {
        const elementsToObserve = [
            '.text-block',
            '.skill-category',
            '.timeline-item',
            '.internship-card',
            '.project-card',
            '.education-card',
            '.cert-card',
            '.honor-item',
            '.contact-item',
            '.contact-form-container',
            '.stat-item'
        ];
        
        elementsToObserve.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => this.observer.observe(el));
        });
    }
    

    
    animateCounter(statItem) {
        const numberElement = statItem.querySelector('.stat-number');
        const target = parseInt(numberElement.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                numberElement.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                numberElement.textContent = target;
            }
        };
        
        updateCounter();
    }
    
    initializeCounters() {
        // Initialize all counters to 0
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            counter.textContent = '0';
        });
    }
}

// ================================
// NAVIGATION
// ================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateActiveLink();
    }
    
    bindEvents() {
        // Mobile menu toggle
        this.navToggle.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('active');
                this.navToggle.classList.remove('active');
            });
        });
        
        // Scroll effect for navbar
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            this.updateActiveLink();
        });
        
        // Smooth scroll for navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// ================================
// PROJECT FILTERING
// ================================

class ProjectFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active button
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter projects
                this.filterProjects(filter);
            });
        });
    }
    
    filterProjects(filter) {
        this.projectCards.forEach(card => {
            const categories = card.getAttribute('data-category').split(' ');
            
            if (filter === 'all' || categories.includes(filter)) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
}

// ================================
// CONTACT FORM
// ================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitBtn = this.form.querySelector('.submit-btn');
        
        // EmailJS configuration
        this.emailjsConfig = {
            serviceID: 'service_wmfzdqo',
            templateID: 'template_mwyb11j',
            publicKey: 'nHiGMiHoy_9Dy5CWt'
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Form validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearErrors(input));
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        // Remove existing error styling
        field.classList.remove('error');
        
        // Validation rules
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                break;
            case 'text':
            case 'textarea':
                isValid = value.length >= 2;
                break;
            default:
                isValid = value.length > 0;
        }
        
        if (!isValid) {
            field.classList.add('error');
            this.showFieldError(field);
        }
        
        return isValid;
    }
    
    showFieldError(field) {
        // Add error styling to CSS
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
    }
    
    clearErrors(field) {
        field.classList.remove('error');
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }
    
    async handleSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showNotification('Please fill in all fields correctly.', 'error');
            return;
        }
        
        // Show loading state
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
        
        try {
            // Send email using EmailJS
            await this.sendEmail(data);
            
            this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.form.reset();
        } catch (error) {
            console.error('Email sending failed:', error);
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }
    
    async sendEmail(data) {
        // Initialize EmailJS if not already done
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.emailjsConfig.publicKey);
        } else {
            throw new Error('EmailJS not loaded');
        }
        
        // Prepare template parameters
        const templateParams = {
            from_name: data.name,
            from_email: data.email,
            subject: data.subject,
            message: data.message,
            to_name: 'Erfan Nourbakhsh',
            to_email: 'erfan.nourbakhsh@my.utsa.edu'
        };
        
        // Send email via EmailJS
        const response = await emailjs.send(
            this.emailjsConfig.serviceID,
            this.emailjsConfig.templateID,
            templateParams
        );
        
        return response;
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
}

// ================================
// BACK TO TOP BUTTON
// ================================

class BackToTop {
    constructor() {
        this.button = document.getElementById('back-to-top');
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                this.button.classList.add('show');
            } else {
                this.button.classList.remove('show');
            }
        });
        
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ================================
// PERFORMANCE OPTIMIZATION
// ================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.optimizeImages();
        this.implementLazyLoading();
        this.debounceScrollEvents();
    }
    
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }
    
    implementLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });
            
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
    
    debounceScrollEvents() {
        let scrollTimer = null;
        const originalScroll = window.onscroll;
        
        window.onscroll = () => {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            
            scrollTimer = setTimeout(() => {
                if (originalScroll) {
                    originalScroll();
                }
            }, 10);
        };
    }
}

// ================================
// THEME MANAGER
// ================================

class ThemeManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.detectUserPreference();
        this.applyAccessibilityFeatures();
    }
    
    detectUserPreference() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-fast', '0.01s');
            document.documentElement.style.setProperty('--transition-normal', '0.01s');
            document.documentElement.style.setProperty('--transition-slow', '0.01s');
        }
        
        // Check for high contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }
    
    applyAccessibilityFeatures() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#home';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-purple);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
}

// ================================
// MAIN APPLICATION
// ================================

class App {
    constructor() {
        this.init();
    }
    
    init() {
        // Initialize all components
        this.particleSystem = new ParticleSystem(document.getElementById('particle-canvas'));
        this.navigation = new Navigation();
        this.scrollAnimations = new ScrollAnimations();
        this.projectFilter = new ProjectFilter();
        this.contactForm = new ContactForm();
        this.backToTop = new BackToTop();
        this.performanceOptimizer = new PerformanceOptimizer();
        this.themeManager = new ThemeManager();
        
        // Initialize typewriter effect
        this.initTypewriter();
        
        // Add event listeners
        this.bindGlobalEvents();
        
        // Initialize download CV functionality
        this.initDownloadCV();
        
        console.log('Portfolio initialized successfully!');
    }
    
    initTypewriter() {
        const typewriterElement = document.getElementById('typewriter');
        const texts = [
            'Aspiring Software Engineer',
            'Future Data Scientist', 
            'ML Engineer in Making',
            'Full-Stack Developer',
            'Problem Solver + Code Creator',
            'Turning Data Into Insights',
            'Building Tomorrow\'s Technology',
            'Innovation Through Code ⚡'
        ];
        
        if (typewriterElement) {
            new TypewriterEffect(typewriterElement, texts);
        }
    }
    
    bindGlobalEvents() {
        // Handle visibility change for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause animations when tab is not visible
                if (this.particleSystem && this.particleSystem.animationId) {
                    cancelAnimationFrame(this.particleSystem.animationId);
                }
            } else {
                // Resume animations when tab becomes visible
                if (this.particleSystem) {
                    this.particleSystem.animate();
                }
            }
        });
        
        // Handle resize events
        window.addEventListener('resize', this.debounce(() => {
            if (this.particleSystem) {
                this.particleSystem.resizeCanvas();
            }
        }, 250));
    }
    
    initDownloadCV() {
        const downloadBtn = document.getElementById('download-cv');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.showNotification('CV downloaded successfully!', 'success');
            });
        }
    }
    
    generateResumeText() {
        return `
ERFAN NOURBAKHSH
Aspiring Software Engineer | Future Data Scientist | ML Engineer in Making

Contact Information:
Email: erfan.nourbakhsh@my.utsa.edu
Phone: 210-606-1804
Location: San Antonio, TX, USA
LinkedIn: linkedin.com/in/erfan-nourbakhsh/
GitHub: github.com/erfan-nourbakhsh

EDUCATION:
- PhD in Computer Science, University of Texas at San Antonio (2025-2029)
- Bachelor's Degree in Computer Engineering, University of Isfahan (2019-2023)

EXPERIENCE:
- University Instructor, UTSA (Aug 2025 - Present)
- Research Assistant, UTSA (May 2025 - Present)  
- AI Specialist, Directam (Jun 2024 - Oct 2024)
- Machine Learning Engineer, Eftekhar Modiran (Mar 2023 - Sep 2023)
- Frontend Developer, VITRACO-IR (Jul 2021 - Jan 2022)

TECHNICAL SKILLS:
- Programming: Python, JavaScript, C/C++, Java
- AI/ML: PyTorch, TensorFlow, Scikit-learn, Hugging Face
- Web: React.js, Node.js, Next.js, TypeScript
- Data Science: Pandas, NumPy, Matplotlib, Jupyter
- Databases: SQL, MongoDB, Redis
- Tools: Docker, Git, Linux

For complete resume with detailed information, please visit my portfolio website.
        `.trim();
    }
    
    showNotification(message, type) {
        // Reuse the notification system from ContactForm
        if (this.contactForm) {
            this.contactForm.showNotification(message, type);
        }
    }
    
    debounce(func, wait) {
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
}

// ================================
// UTILITY FUNCTIONS
// ================================

// Smooth scroll polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScrollPolyfill = (target, duration = 1000) => {
        const targetPosition = target.offsetTop - 70; // Account for navbar
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };
        
        const easeInOutQuad = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };
        
        requestAnimationFrame(animation);
    };
    
    // Override smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                smoothScrollPolyfill(target);
            }
        });
    });
}

// ================================
// INITIALIZATION
// ================================

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize loading screen
    new LoadingManager();
});

// Handle page reload/refresh
window.addEventListener('beforeunload', () => {
    // Cleanup any running animations
    if (window.particleSystem) {
        window.particleSystem.destroy();
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('Portfolio Error:', e.error);
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});

// Toggle All Certifications
function toggleAllCertifications() {
    const allCertifications = document.getElementById('allCertifications');
    const expandBtn = document.querySelector('.cert-expand-btn');
    const expandText = expandBtn.querySelector('.expand-text');
    const expandIcon = expandBtn.querySelector('.expand-icon');
    
    if (allCertifications.classList.contains('expanded')) {
        // Collapse
        allCertifications.classList.remove('expanded');
        expandBtn.classList.remove('expanded');
        expandText.textContent = 'View All Certifications';
        expandIcon.className = 'fas fa-chevron-down expand-icon';
    } else {
        // Expand
        allCertifications.classList.add('expanded');
        expandBtn.classList.add('expanded');
        expandText.textContent = 'Show Less';
        expandIcon.className = 'fas fa-chevron-up expand-icon';
        
        // Smooth scroll to expanded section after animation
        setTimeout(() => {
            allCertifications.scrollIntoView({ 
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 300);
    }
}

// Export for global access (if needed)
window.PortfolioApp = App;
