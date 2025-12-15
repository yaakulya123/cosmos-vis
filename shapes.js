import * as THREE from 'three';

export const Shapes = {
    // Sphere ("Spear") - Cyan/Blue Cool
    sphere: (numPoints, radius) => {
        const points = [];
        const colors = [];
        const color = new THREE.Color();

        for (let i = 0; i < numPoints; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            points.push(x, y, z);

            // Color: Cyan/Blue gradients
            // 0x00ffff to 0x0055ff
            color.setHSL(0.5 + Math.random() * 0.1, 1.0, 0.5 + Math.random() * 0.2);
            colors.push(color.r, color.g, color.b);
        }
        return { points, colors };
    },

    // Galaxy (Replaces "Saturn")
    galaxy: (numPoints, scale) => {
        const points = [];
        const colors = [];

        const parameters = {
            count: numPoints,
            size: scale,
            radius: scale * 20,
            branches: 4,
            spin: 1,
            randomness: 0.5,
            randomnessPower: 3,
            insideColor: '#ff6030', // Orange/Pink Core
            outsideColor: '#1b3984', // Deep Blue Arms
        };

        const insideColor = new THREE.Color(parameters.insideColor);
        const outsideColor = new THREE.Color(parameters.outsideColor);
        const tempColor = new THREE.Color();

        for (let i = 0; i < numPoints; i++) {
            // Radius
            const r = Math.random() * parameters.radius;
            const spinAngle = r * parameters.spin;

            // Branche
            const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

            // Randomness
            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;

            const x = Math.cos(branchAngle + spinAngle) * r + randomX;
            const y = randomY * 2; // Flat galaxy, but some volume
            const z = Math.sin(branchAngle + spinAngle) * r + randomZ;

            points.push(x, y, z);

            // Color Mix
            // Mix based on radius
            const mixedColor = insideColor.clone();
            mixedColor.lerp(outsideColor, r / parameters.radius);

            // Add some purple/pink noise
            if (Math.random() > 0.5) {
                mixedColor.r += 0.2;
                mixedColor.b += 0.2;
            }

            colors.push(mixedColor.r, mixedColor.g, mixedColor.b);
        }

        return { points, colors };
    }
};
