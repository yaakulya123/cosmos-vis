import * as d3 from 'd3';

export class Visualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        // Setup Canvas
        this.canvas = d3.select(this.container)
            .append('canvas')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('width', '100%')
            .style('height', '100%');

        this.context = this.canvas.node().getContext('2d');

        // State
        this.particles = [];
        this.numParticles = 200;
        this.baseRadius = Math.min(this.width, this.height) / 4;
        this.expansionFactor = 0.5;
        this.pinchFactor = 0;
        this.center = { x: 0.5, y: 0.5 };

        this.initParticles();

        // Resize observer
        window.addEventListener('resize', this.resize.bind(this));

        // Start loop
        this.animate();
    }

    initParticles() {
        this.particles = d3.range(this.numParticles).map(i => {
            const angle = (i / this.numParticles) * 2 * Math.PI;
            return {
                angle: angle,
                r: this.baseRadius,
                baseAngle: angle,
                offset: Math.random() * 100,
                speed: 0.01 + Math.random() * 0.02,
                color: d3.interpolatePlasma(Math.random())
            };
        });
    }

    resize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.canvas.attr('width', this.width).attr('height', this.height);
        this.baseRadius = Math.min(this.width, this.height) / 4;
    }

    update(data) {
        // Smooth transition
        this.expansionFactor += (data.expansion - this.expansionFactor) * 0.1;
        this.pinchFactor += (data.pinch - this.pinchFactor) * 0.1;

        // Update center target slightly (inverse X for mirror effect if needed)
        // MediaPipe x is 0-1 (0 is left of video, but video is usually mirrored)
        this.center.x += ((1 - data.center.x) - this.center.x) * 0.1;
        this.center.y += (data.center.y - this.center.y) * 0.1;
    }

    animate() {
        this.context.fillStyle = 'rgba(5, 5, 5, 0.2)'; // Trails effect
        this.context.fillRect(0, 0, this.width, this.height);

        const cx = this.center.x * this.width;
        const cy = this.center.y * this.height;

        // Dynamic radius based on expansion
        // expansion 0 -> small radius, expansion 1 -> large
        const currentRadius = this.baseRadius * (0.5 + this.expansionFactor * 1.5);

        // Dynamic chaos/noise based on pinch
        // PInch 1 (tight) -> High chaos/speed? Or maybe tight structure?
        // Let's say Pinch 1 -> High Frequency Jitter

        this.particles.forEach(p => {
            // Move particle angle
            p.angle += p.speed * (1 + this.pinchFactor * 5); // Faster when pinched

            const r = currentRadius + Math.sin(p.angle * 5 + p.offset) * (10 + this.pinchFactor * 50);

            const x = cx + Math.cos(p.angle) * r;
            const y = cy + Math.sin(p.angle) * r;

            this.context.beginPath();
            // Color changes with pinch
            this.context.fillStyle = p.color;
            // Size changes slightly
            const size = 2 + this.expansionFactor * 3;
            this.context.arc(x, y, size, 0, 2 * Math.PI);
            this.context.fill();
        });

        // Draw connecting lines if close? (Optional, might be heavy)
        // For now simple particle ring

        requestAnimationFrame(this.animate.bind(this));
    }
}
