import * as THREE from 'three';
import { ParticleSystem } from './particles.js';

export class ThreeScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // Scene / Camera / Renderer
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.002);

        // Lighting (Optional for PointsMaterial but good to have)
        const ambient = new THREE.AmbientLight(0x404040);
        this.scene.add(ambient);

        // DEBUG BOX REMOVED (As requested)

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Initial Camera Position
        this.camera.position.z = 100;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000);
        this.container.appendChild(this.renderer.domElement);

        // Particles
        this.particles = new ParticleSystem(this.scene);

        // State
        this.targetCameraZ = 100;
        this.targetCameraX = 0;
        this.targetCameraY = 0;

        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Loop
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update(data) {
        // data: { expansion, pinch, center, handsPresent }

        if (data.handsPresent) {
            // Expansion usually 0-1.
            const zoomLevel = data.expansion || 0;
            // Invert logic: Expand = Zoom In (smaller Z)
            this.targetCameraZ = 120 - (zoomLevel * 100);

            // Pan logic
            this.targetCameraX = (data.center.x - 0.5) * -60;
            this.targetCameraY = (data.center.y - 0.5) * -40;
        } else {
            // Idle state
            this.targetCameraZ = 100;
            this.targetCameraX = 0;
            this.targetCameraY = 0;
        }

        // Smooth Camera Movement (Lerp)
        this.camera.position.z += (this.targetCameraZ - this.camera.position.z) * 0.05;
        this.camera.position.x += (this.targetCameraX - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.targetCameraY - this.camera.position.y) * 0.05;

        this.camera.lookAt(0, 0, 0);

        // Update Particles (morphing etc)
        const currentExpansion = (120 - this.targetCameraZ) / 100;
        this.particles.update(0.016, Math.max(0, currentExpansion), 0);
    }

    setShape(shapeName) {
        this.particles.morphTo(shapeName);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        // Rotate particles slowly for effect
        this.particles.points.rotation.y += 0.001;

        this.renderer.render(this.scene, this.camera);
    }
}
