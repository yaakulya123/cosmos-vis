import * as THREE from 'three';
import { Shapes } from './shapes.js';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.count = 30000; // Increased density
        this.positions = new Float32Array(this.count * 3);
        this.colors = new Float32Array(this.count * 3);

        // Setup initial geometry
        this.geometry = new THREE.BufferGeometry();

        const posAttr = new THREE.BufferAttribute(this.positions, 3);
        posAttr.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('position', posAttr);

        const colAttr = new THREE.BufferAttribute(this.colors, 3);
        colAttr.setUsage(THREE.DynamicDrawUsage); // Colors also morph
        this.geometry.setAttribute('color', colAttr);

        // Generate Soft Texture
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

        // Shader Material for nice glowy dots
        this.material = new THREE.PointsMaterial({
            size: 0.8, // Much smaller for star effect
            sizeAttenuation: true,
            map: getTexture(), // Use texture
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        // Morph Targets
        this.targets = {
            goalPoints: new Float32Array(this.count * 3),
            goalColors: new Float32Array(this.count * 3)
        };

        this.transitionSpeed = 0.03; // Slower, more majestic
        this.currentShape = 'sphere';

        // Initialize with Sphere
        const data = Shapes.sphere(this.count, 20);
        this.setBuffer(data.points, this.positions);
        this.setBuffer(data.colors, this.colors);
        // Set goals same as init
        this.setBuffer(data.points, this.targets.goalPoints);
        this.setBuffer(data.colors, this.targets.goalColors);

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }

    setBuffer(source, target) {
        for (let i = 0; i < source.length; i++) {
            target[i] = source[i];
        }
    }

    morphTo(shapeName) {
        if (this.currentShape === shapeName) return;
        this.currentShape = shapeName;

        let data = { points: [], colors: [] };

        if (shapeName === 'galaxy') {
            data = Shapes.galaxy(this.count, 2.5);
        } else {
            // Default sphere
            data = Shapes.sphere(this.count, 20);
        }

        this.setBuffer(data.points, this.targets.goalPoints);
        this.setBuffer(data.colors, this.targets.goalColors);
    }

    update(dt = 0.016, expansion = 0, rotationY = 0) {
        if (isNaN(expansion)) expansion = 0;

        const positions = this.geometry.attributes.position.array;
        const colors = this.geometry.attributes.color.array;

        const goalP = this.targets.goalPoints;
        const goalC = this.targets.goalColors;

        // Morphing Logic
        for (let i = 0; i < this.count; i++) {
            const ix = i * 3;
            // Lerp Positions
            positions[ix] += (goalP[ix] - positions[ix]) * this.transitionSpeed; // x
            positions[ix + 1] += (goalP[ix + 1] - positions[ix + 1]) * this.transitionSpeed; // y
            positions[ix + 2] += (goalP[ix + 2] - positions[ix + 2]) * this.transitionSpeed; // z

            // Lerp Colors
            colors[ix] += (goalC[ix] - colors[ix]) * this.transitionSpeed;
            colors[ix + 1] += (goalC[ix + 1] - colors[ix + 1]) * this.transitionSpeed;
            colors[ix + 2] += (goalC[ix + 2] - colors[ix + 2]) * this.transitionSpeed;
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;

        // Handle Expansion (Scale)
        // Galaxy looks better if we actually zoom the camera, but scaling works for now.
        // Let's keep the scene scale logic.
        const targetScale = 1 + expansion * 2;
        this.points.scale.setScalar(targetScale);

        // Rotation
        // Add some spin
        this.points.rotation.y += 0.001 + rotationY * 0.05;
    }
}
