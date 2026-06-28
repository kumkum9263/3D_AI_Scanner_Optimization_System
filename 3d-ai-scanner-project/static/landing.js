// ============================================
// 3D AI Scanner - Landing Page JavaScript
// Advanced Animations & Interactions
// ============================================

// ============================================
// 1. Typing Effect for Hero Title
// ============================================

const typingTitle = document.getElementById('typingTitle');
const titleText = '3D AI Scanner Optimization System';
let charIndex = 0;
let isTyping = true;

function typeTitle() {
    if (charIndex < titleText.length) {
        typingTitle.textContent = titleText.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeTitle, 50);
    } else {
        isTyping = false;
    }
}

// Start typing when page loads
window.addEventListener('load', () => {
    typeTitle();
    initParticles();
    observeElements();
    setupEventListeners();
});

// ============================================
// 2. Particle Generation & Animation
// ============================================

function initParticles() {
    const container = document.getElementById('particlesContainer');
    const particleCount = window.innerWidth > 768 ? 50 : 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDelay = Math.random() * 5;
        const randomDuration = 15 + Math.random() * 15;

        particle.style.left = randomX + '%';
        particle.style.top = randomY + '%';
        particle.style.animationDelay = randomDelay + 's';
        particle.style.animationDuration = randomDuration + 's';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;

        container.appendChild(particle);
    }
}

// ============================================
// 3. Intersection Observer for Fade-in Effects
// ============================================

function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-element').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        observer.observe(element);
    });
}

// ============================================
// 4. File Upload Handler
// ============================================

function setupEventListeners() {
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');

    // Click to browse
    uploadBox.addEventListener('click', () => fileInput.click());
    uploadButton.addEventListener('click', () => fileInput.click());

    // Drag and drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--primary-color)';
        uploadBox.style.background = 'rgba(102, 126, 234, 0.15)';
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = 'var(--accent-color)';
        uploadBox.style.background = 'rgba(0, 242, 254, 0.05)';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--accent-color)';
        uploadBox.style.background = 'rgba(0, 242, 254, 0.05)';
        handleFiles(e.dataTransfer.files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function handleFiles(files) {
    if (files.length === 0) return;

    const file = files[0];

    // Validate file type
    const validExtensions = ['stl', 'ply', 'obj'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
        showToast('❌ Invalid file type. Please upload STL, PLY, or OBJ file.', 3000);
        return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        showToast('❌ File size exceeds 50MB limit.', 3000);
        return;
    }

    uploadFile(file);
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const uploadBox = document.getElementById('uploadBox');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadSuccess = document.getElementById('uploadSuccess');
    const successMessage = document.getElementById('successMessage');
    const progressFill = document.getElementById('progressFill');
    const uploadStatus = document.getElementById('uploadStatus');

    // Hide upload box, show progress
    uploadBox.classList.add('hidden');
    uploadProgress.classList.remove('hidden');
    uploadSuccess.classList.add('hidden');

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + '%';
    }, 200);

    // Send upload request
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        clearInterval(progressInterval);
        progressFill.style.width = '100%';

        if (data.status === 'success') {
            setTimeout(() => {
                uploadProgress.classList.add('hidden');
                uploadSuccess.classList.remove('hidden');
                successMessage.textContent = `${file.name} uploaded successfully!`;
                showToast('✅ File uploaded successfully!', 3000);
            }, 500);
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        clearInterval(progressInterval);
        uploadBox.classList.remove('hidden');
        uploadProgress.classList.add('hidden');
        showToast('❌ Upload failed: ' + error.message, 3000);
    });
}

// ============================================
// 5. Toast Notification System
// ============================================

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ============================================
// 6. Mobile Menu Toggle
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav')) {
            navMenu.classList.remove('active');
        }
    });
});

// ============================================
// 7. Smooth Scroll Behavior
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ============================================
// 8. Parallax Effect on Scroll
// ============================================

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const particles = document.querySelectorAll('.particle');
            
            particles.forEach((particle, index) => {
                const speed = 0.5 + (index % 5) * 0.1;
                particle.style.transform = `translateY(${scrollY * speed}px)`;
            });

            ticking = false;
        });
        ticking = true;
    }
});

// ============================================
// 9. Cursor Glow Effect (Optional Enhancement)
// ============================================

const mousePos = { x: 0, y: 0 };

document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

// ============================================
// 10. Add animation class on element hover
// ============================================

document.querySelectorAll('.feature-card, .stat-card, .tech-item, .pipeline-stage').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 0 30px rgba(0, 242, 254, 0.3)';
    });

    element.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
    });
});

// ============================================
// 11. Responsive Design Handling
// ============================================

function handleResponsive() {
    const width = window.innerWidth;
    
    if (width < 768) {
        // Mobile optimizations
        document.body.style.fontSize = '14px';
    } else {
        // Desktop
        document.body.style.fontSize = '16px';
    }
}

window.addEventListener('resize', handleResponsive);
handleResponsive();

// ============================================
// 12. Page Visibility API for Performance
// ============================================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is hidden
        document.querySelectorAll('.particle').forEach(p => {
            p.style.animationPlayState = 'paused';
        });
    } else {
        // Resume animations when tab is visible
        document.querySelectorAll('.particle').forEach(p => {
            p.style.animationPlayState = 'running';
        });
    }
});

// ============================================
// 13. Performance Optimization: Lazy Loading
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// 14. Dynamic Background Color Update
// ============================================

function updateBackgroundGradient() {
    const time = Date.now() / 20000;
    const hue = (Math.sin(time) * 15) + 180;
    document.documentElement.style.setProperty('--hue', hue + 'deg');
}

// Update gradient every 50ms for smooth animation
setInterval(updateBackgroundGradient, 50);

// ============================================
// 15. Console Easter Egg
// ============================================

console.log('%c🔬 3D AI Scanner Optimization System', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with ❤️ using Python, Flask, and Web Technologies', 'color: #00f2fe; font-size: 12px;');
console.log('%cVersion 1.0.0 - 2026', 'color: #f093fb; font-size: 10px;');

// ============================================
// 16. Analytics Tracking (Optional)
// ============================================

function trackEvent(eventName, eventData = {}) {
    // This can be connected to Google Analytics or similar
    console.log(`📊 Event: ${eventName}`, eventData);
}

// Track important user interactions
document.getElementById('uploadButton')?.addEventListener('click', () => {
    trackEvent('upload_button_clicked');
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
        trackEvent('navigation_clicked', { target: link.getAttribute('href') });
    });
});
