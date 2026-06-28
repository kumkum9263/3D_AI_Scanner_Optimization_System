/* ================================================
   3D AI SCANNER - DASHBOARD JavaScript
   Interactive Dashboard with 3D Visualization
   ================================================ */

// ================================================
// 1. PARTICLE SYSTEM
// ================================================

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        const particleCount = window.innerWidth > 768 ? 100 : 30;
        for (let i = 0; i < particleCount; i++) {
            this.createParticle();
        }
        this.animate();
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        const duration = 15 + Math.random() * 20;
        particle.style.animation = `float-particle ${duration}s linear infinite`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        this.container.appendChild(particle);
        this.particles.push(particle);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// ================================================
// 2. 3D HOLOGRAM VIEWER
// ================================================

class HologramViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = this.canvas.offsetWidth;
        this.height = this.canvas.height = this.canvas.offsetHeight;
        this.rotation = 0;
        this.scale = 1;
        this.particles = [];
        this.init();
    }

    init() {
        // Generate point cloud particles
        for (let i = 0; i < 1000; i++) {
            this.particles.push({
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                z: (Math.random() - 0.5) * 200,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                vz: (Math.random() - 0.5) * 2,
                color: this.getRandomNeonColor()
            });
        }
        this.animate();
    }

    getRandomNeonColor() {
        const colors = ['#00ffff', '#00ff88', '#ff00ff', '#bb86fc', '#0066ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    project(x, y, z) {
        const scale = 300 / (400 + z);
        return {
            x: this.width / 2 + x * scale,
            y: this.height / 2 + y * scale,
            z: z,
            scale: scale
        };
    }

    rotateX(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: point.x,
            y: point.y * cos - point.z * sin,
            z: point.y * sin + point.z * cos
        };
    }

    rotateY(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: point.x * cos + point.z * sin,
            y: point.y,
            z: -point.x * sin + point.z * cos
        };
    }

    rotateZ(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: point.x * cos - point.y * sin,
            y: point.x * sin + point.y * cos,
            z: point.z
        };
    }

    animate() {
        this.clear();
        this.rotation += 0.01;

        // Sort particles by depth
        const rotated = this.particles.map(p => {
            let point = { ...p };
            point = this.rotateY(point, this.rotation);
            point = this.rotateX(point, Math.sin(this.rotation * 0.7) * 0.3);
            point = this.rotateZ(point, Math.cos(this.rotation * 0.5) * 0.2);
            return point;
        }).sort((a, b) => a.z - b.z);

        // Draw particles
        rotated.forEach(p => {
            const projected = this.project(p.x, p.y, p.z);
            const size = projected.scale * 2;
            const opacity = (projected.z + 200) / 400;

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = opacity * 0.8;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 15;
            this.ctx.fillRect(projected.x - size / 2, projected.y - size / 2, size, size);
        });

        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;

        requestAnimationFrame(() => this.animate());
    }

    clear() {
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}

// ================================================
// 3. CHART SYSTEM
// ================================================

class SimpleChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = this.canvas.offsetWidth;
        this.height = this.canvas.height = this.canvas.offsetHeight;
        this.data = [45, 62, 38, 85, 72, 95, 58];
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const padding = 40;
        const chartWidth = this.width - padding * 2;
        const chartHeight = this.height - padding * 2;
        const barWidth = chartWidth / this.data.length * 0.7;
        const barSpacing = chartWidth / this.data.length;
        const maxValue = Math.max(...this.data);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(this.width - padding, y);
            this.ctx.stroke();
        }

        // Draw bars with gradient
        const gradient = this.ctx.createLinearGradient(0, padding, 0, this.height - padding);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, '#00ff88');
        gradient.addColorStop(1, '#bb86fc');

        this.data.forEach((value, index) => {
            const x = padding + barSpacing * index + (barSpacing - barWidth) / 2;
            const barHeight = (value / maxValue) * chartHeight;
            const y = this.height - padding - barHeight;

            // Bar with glow
            this.ctx.fillStyle = gradient;
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(x, y, barWidth, barHeight);

            // Value label
            this.ctx.fillStyle = '#00ffff';
            this.ctx.font = 'bold 11px Space Grotesk';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(value, x + barWidth / 2, y - 8);

            // X-axis label
            this.ctx.fillStyle = '#b0b9c6';
            this.ctx.fillText(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index], x + barWidth / 2, this.height - padding + 20);
        });

        this.ctx.shadowBlur = 0;
    }
}

// ================================================
// 4. FILE UPLOAD HANDLER
// ================================================

class FileUploadHandler {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadFiles = document.getElementById('uploadFiles');
        this.init();
    }

    init() {
        if (!this.uploadArea) return;

        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.onDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.onDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.onDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
    }

    onDragOver(e) {
        e.preventDefault();
        this.uploadArea.style.borderColor = '#00ffff';
        this.uploadArea.style.background = 'rgba(0, 255, 255, 0.1)';
    }

    onDragLeave(e) {
        e.preventDefault();
        this.uploadArea.style.borderColor = '#bb86fc';
        this.uploadArea.style.background = 'rgba(187, 134, 252, 0.03)';
    }

    onDrop(e) {
        e.preventDefault();
        this.uploadArea.style.borderColor = '#bb86fc';
        this.uploadArea.style.background = 'rgba(187, 134, 252, 0.03)';
        this.handleFiles(e.dataTransfer.files);
    }

    handleFiles(files) {
        const validExtensions = ['stl', 'ply', 'obj'];
        
        for (let file of files) {
            const extension = file.name.split('.').pop().toLowerCase();
            
            if (!validExtensions.includes(extension)) {
                this.showToast(`❌ Invalid file: ${file.name}. Only STL, PLY, OBJ allowed.`);
                continue;
            }

            if (file.size > 50 * 1024 * 1024) {
                this.showToast(`❌ File too large: ${file.name}`);
                continue;
            }

            this.addFileItem(file);
            this.uploadFile(file);
        }
    }

    addFileItem(file) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div>
                <i class="fas fa-cube"></i> ${file.name}
            </div>
            <div class="file-progress">0%</div>
        `;
        this.uploadFiles.appendChild(item);
    }

    uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.showToast(`✅ ${file.name} uploaded successfully!`);
            }
        })
        .catch(error => {
            this.showToast(`❌ Upload failed: ${error.message}`);
        });
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid #00ffff;
            color: #00ffff;
            padding: 16px 24px;
            border-radius: 8px;
            z-index: 2000;
            animation: slide-in 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// ================================================
// 5. MODAL HANDLER
// ================================================

class ModalHandler {
    constructor() {
        this.modal = document.getElementById('uploadModal');
        this.openBtns = document.querySelectorAll('[id*="uploadBtn"], [id*="scanBtn"]');
        this.closeBtn = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.dropzone = document.getElementById('dropzone');
        this.init();
    }

    init() {
        if (!this.modal) return;

        this.openBtns.forEach(btn => {
            if (btn.id === 'uploadBtn') {
                btn.addEventListener('click', () => this.open());
            }
        });

        this.closeBtn.addEventListener('click', () => this.close());
        this.cancelBtn.addEventListener('click', () => this.close());
        
        this.dropzone.addEventListener('click', () => document.getElementById('modalFileInput').click());
        this.dropzone.addEventListener('dragover', (e) => this.onDragOver(e));
        this.dropzone.addEventListener('dragleave', (e) => this.onDragLeave(e));
        this.dropzone.addEventListener('drop', (e) => this.onDrop(e));

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
    }

    open() {
        this.modal.classList.add('active');
    }

    close() {
        this.modal.classList.remove('active');
    }

    onDragOver(e) {
        e.preventDefault();
        this.dropzone.style.borderColor = '#00ff88';
        this.dropzone.style.background = 'rgba(0, 255, 136, 0.1)';
    }

    onDragLeave(e) {
        e.preventDefault();
        this.dropzone.style.borderColor = '#00ffff';
        this.dropzone.style.background = 'rgba(0, 255, 255, 0.03)';
    }

    onDrop(e) {
        e.preventDefault();
        this.dropzone.style.borderColor = '#00ffff';
        this.dropzone.style.background = 'rgba(0, 255, 255, 0.03)';
        
        const files = e.dataTransfer.files;
        document.getElementById('modalFileInput').files = files;
    }
}

// ================================================
// 6. NAVIGATION & SMOOTH SCROLLING
// ================================================

class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.init();
    }

    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.setActive(link);
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => {
                this.navMenu.style.display = this.navMenu.style.display === 'flex' ? 'none' : 'flex';
            });
        }
    }

    setActive(link) {
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    }
}

// ================================================
// 7. NOTIFICATION SYSTEM
// ================================================

class NotificationCenter {
    constructor() {
        this.notifBtn = document.getElementById('notifBtn');
        this.notificationCenter = document.getElementById('notificationCenter');
        this.init();
    }

    init() {
        if (!this.notifBtn) return;

        this.notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', () => {
            if (this.notificationCenter.style.display === 'flex') {
                this.notificationCenter.style.display = 'none';
            }
        });
    }

    toggle() {
        const isVisible = this.notificationCenter.style.display === 'flex';
        this.notificationCenter.style.display = isVisible ? 'none' : 'flex';
        this.notificationCenter.style.flexDirection = 'column';
    }

    add(type, title, message) {
        const notification = document.createElement('div');
        notification.className = 'notification glass-card';
        
        const colors = {
            success: { bg: 'rgba(0, 255, 136, 0.1)', border: '#00ff88', icon: 'fa-check-circle' },
            info: { bg: 'rgba(0, 204, 255, 0.1)', border: '#00ccff', icon: 'fa-info-circle' },
            warning: { bg: 'rgba(255, 165, 0, 0.1)', border: '#ffa500', icon: 'fa-exclamation-circle' }
        };

        const color = colors[type] || colors.info;
        notification.style.background = color.bg;
        notification.style.borderLeft = `3px solid ${color.border}`;

        notification.innerHTML = `
            <i class="fas ${color.icon}" style="color: ${color.border};"></i>
            <div>
                <p class="notif-title">${title}</p>
                <p class="notif-text">${message}</p>
            </div>
            <span class="notif-time">just now</span>
        `;

        this.notificationCenter.insertBefore(notification, this.notificationCenter.firstChild);
        
        setTimeout(() => notification.remove(), 5000);
    }
}

// ================================================
// 8. INITIALIZATION
// ================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const particlesContainer = document.querySelector('.particles');
    if (particlesContainer) {
        new ParticleSystem(particlesContainer);
    }

    // Initialize hologram viewer
    if (document.getElementById('modelCanvas')) {
        new HologramViewer('modelCanvas');
    }

    // Initialize chart
    new SimpleChart('activityChart');

    // Initialize file upload
    new FileUploadHandler();

    // Initialize modal
    new ModalHandler();

    // Initialize navigation
    new Navigation();

    // Initialize notifications
    new NotificationCenter();

    // Add scroll animation
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

    document.querySelectorAll('.glass-card, .model-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });

    // Add fadeInUp keyframe
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // Responsive sidebar
    if (window.innerWidth < 768) {
        const sidebar = document.querySelector('.sidebar');
        const content = document.querySelector('.content');
        const hamburger = document.getElementById('hamburger');
        
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
            });
        }
    }
});

// ================================================
// 9. UTILITY FUNCTIONS
// ================================================

// Smooth number animation
function animateValue(element, start, end, duration) {
    let current = start;
    const increment = (end - start) / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.style.display = 'block';
    }
});
