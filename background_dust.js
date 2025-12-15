import * as THREE from 'three';

export class BackgroundDust {
    constructor(scene) {
        this.scene = scene;
        this.count = 600; // Visible but not crowded
        this.positions = new Float32Array(this.count * 3);
        this.colors = new Float32Array(this.count * 3);

        // Setup initial geometry
        this.geometry = new THREE.BufferGeometry();

        const posAttr = new THREE.BufferAttribute(this.positions, 3);
        posAttr.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('position', posAttr);

        const colAttr = new THREE.BufferAttribute(this.colors, 3);
        colAttr.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('color', colAttr);

        // Soft Texture (Same as main particles)
        const getTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);
            return new THREE.CanvasTexture(canvas);
        };

        // Material - Aesthetic & Subtle
        this.material = new THREE.PointsMaterial({
            size: 20.0, // Large fog banks
            sizeAttenuation: true, // Scale with distance
            map: getTexture(),
            vertexColors: true,
            transparent: true,
            opacity: 0.25, // Goldilocks: Visible but soft
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        // Initial Scatter - FRAME the Galaxy
        const radius = 90;
        const color1 = new THREE.Color(0x331155); // Visible Deep Purple
        const color2 = new THREE.Color(0x113366); // Visible Deep Blue

        for (let i = 0; i < this.count; i++) {
            // Push them away from the center so the main galaxy pops
            const angle = Math.random() * Math.PI * 2;
            const r = 30 + Math.random() * 60; // Minimum distance from center

            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r * 0.6; // Flattened
            const z = (Math.random() - 0.5) * 50 - 20; // Behind the main action

            this.positions[i * 3] = x;
            this.positions[i * 3 + 1] = y;
            this.positions[i * 3 + 2] = z;

            const c = Math.random() < 0.5 ? color1 : color2;
            this.colors[i * 3] = c.r;
            this.colors[i * 3 + 1] = c.g;
            this.colors[i * 3 + 2] = c.b;
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;

        // Initial goal state for drift logic
        this.goalPoints = new Float32Array(this.positions);
    }

    update(dt = 0.016) {
        this.time = (this.time || 0) + dt;

        const positions = this.geometry.attributes.position.array;

        // Very slow drift
        const speed = 0.1;
        const amp = 2.0;

        for (let i = 0; i < this.count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            // Simple slow heave
            positions[ix] = this.goalPoints[ix] + Math.sin(this.time * speed + i) * amp;
            positions[iy] = this.goalPoints[iy] + Math.cos(this.time * speed * 0.9 + i) * amp;
            positions[iz] = this.goalPoints[iz] + Math.sin(this.time * speed * 0.8 + i) * amp;
        }

        this.geometry.attributes.position.needsUpdate = true;
    }
}
