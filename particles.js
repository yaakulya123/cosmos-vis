import * as THREE from 'three';
import { Shapes } from './shapes.js';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.count = 30000;
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

        // Generate Soft Texture (Restored)
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

        // Standard Material (Restored)
        this.material = new THREE.PointsMaterial({
            size: 0.8,
            sizeAttenuation: true,
            map: getTexture(),
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

        this.transitionSpeed = 0.03;

        // Initialize
        const data = Shapes.sphere(this.count, 20);
        this.setBuffer(data.points, this.positions);
        this.setBuffer(data.colors, this.colors);
        this.setBuffer(data.points, this.targets.goalPoints);
        this.setBuffer(data.colors, this.targets.goalColors);
    }

    setBuffer(source, target) {
        for (let i = 0; i < source.length; i++) {
            target[i] = source[i];
        }
    }

    morphTo(shapeName) {
        let data;
        if (shapeName === 'galaxy') {
            data = Shapes.galaxy(this.count, 2.5);
        } else {
            data = Shapes.sphere(this.count, 20);
        }

        this.setBuffer(data.points, this.targets.goalPoints);
        this.setBuffer(data.colors, this.targets.goalColors);
    }

    update(dt = 0.016, expansion = 0, rotationY = 0) {
        if (isNaN(expansion)) expansion = 0;

        // Update Internal Time for Flow
        this.time = (this.time || 0) + dt;

        const positions = this.geometry.attributes.position.array;
        const colors = this.geometry.attributes.color.array;

        const goalP = this.targets.goalPoints;
        const goalC = this.targets.goalColors;

        // Eternal Flow Parameters
        const driftSpeed = 0.3;
        const driftAmp = 1.2;

        for (let i = 0; i < this.count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            // 1. Eternal Flow (Drift - Chaotic Swarm)
            const phase = i * 123.456;
            const dx = Math.sin(this.time * driftSpeed + phase) * driftAmp;
            const dy = Math.sin(this.time * driftSpeed * 1.1 + phase * 1.3) * driftAmp;
            const dz = Math.sin(this.time * driftSpeed * 0.9 + phase * 1.7) * driftAmp;

            const tx = goalP[ix] + dx;
            const ty = goalP[iy] + dy;
            const tz = goalP[iz] + dz;

            // Lerp Positions (Smoothly move to the calculated target)
            positions[ix] += (tx - positions[ix]) * this.transitionSpeed;
            positions[iy] += (ty - positions[iy]) * this.transitionSpeed;
            positions[iz] += (tz - positions[iz]) * this.transitionSpeed;

            // Lerp Colors
            colors[ix] += (goalC[ix] - colors[ix]) * this.transitionSpeed;
            colors[ix + 1] += (goalC[ix + 1] - colors[ix + 1]) * this.transitionSpeed;
            colors[ix + 2] += (goalC[ix + 2] - colors[ix + 2]) * this.transitionSpeed;
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;

        // Expansion (Restored)
        const targetScale = 1 + expansion * 2;
        this.points.scale.setScalar(targetScale);

        // Rotation
        this.points.rotation.y += 0.001 + rotationY * 0.05;
    }
}
