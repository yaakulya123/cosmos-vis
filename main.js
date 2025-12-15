import './style.css';
import { HandTracker } from './hand_tracking.js';
import { ThreeScene } from './scene.js';

const videoElement = document.getElementById('input_video');
const statusText = document.getElementById('status-text');

// Init Three.js
const world = new ThreeScene('vis-container');

// State
let isSaturn = false;

// Init Hand Tracker
const tracker = new HandTracker(videoElement, (data) => {
    if (data.handsPresent) {
        // If hands just appeared, morph to Saturn
        if (!isSaturn) {
            world.setShape('galaxy');
            isSaturn = true;
            statusText.innerText = "Experience: Spiral Galaxy";
        }

        // Update World (Camera Zoom/Pan)
        statusText.innerText = `Zoom: ${(data.expansion * 100).toFixed(0)}%`;
        world.update(data);

    } else {
        // If hands lost, go back to Sphere
        if (isSaturn) {
            world.setShape('sphere');
            isSaturn = false;
            statusText.innerText = "Idle: Sphere Mode";
        }
        world.update({ handsPresent: false });
    }
});

tracker.start()
    .then(() => {
        statusText.innerText = "Camera Active. Show hands to enter Galaxy.";
    })
    .catch(err => {
        console.error(err);
        statusText.innerText = "Error accessing camera.";
    });

// Debug Click
document.addEventListener('click', () => {
    isSaturn = !isSaturn;
    world.setShape(isSaturn ? 'galaxy' : 'sphere');
});
