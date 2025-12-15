import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export class HandTracker {
    constructor(videoElement, onUpdate) {
        this.videoElement = videoElement;
        this.onUpdate = onUpdate;
        this.previousDist = 0;

        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.processResults.bind(this));

        this.camera = new Camera(this.videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: this.videoElement });
            },
            width: 640,
            height: 480
        });
    }

    async start() {
        await this.camera.start();
    }

    distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    processResults(results) {
        const hands = results.multiHandLandmarks;
        let expansion = 0; // 0 to 1 (distance between hands)
        let pinch = 0;     // 0 to 1 (avg pinch tightness)
        let center = { x: 0.5, y: 0.5 };

        if (hands && hands.length > 0) {
            // Calculate Pinch (Thumb Tip 4 to Index Tip 8)
            let totalPinch = 0;
            hands.forEach(hand => {
                const d = this.distance(hand[4], hand[8]);
                // Normalize pinch: 0.02 is close, 0.2 is open.
                // We want 1 when close (pinched), 0 when open.
                let val = 1 - (Math.min(Math.max(d, 0.02), 0.2) - 0.02) / (0.18);
                totalPinch += val;
            });
            pinch = totalPinch / hands.length;

            // Calculate Expansion (Distance between wrists or centers)
            if (hands.length === 2) {
                // Use wrist (0)
                const d = this.distance(hands[0][0], hands[1][0]);
                // Normalize expansion: 0.1 close, 0.8 far
                expansion = (Math.min(Math.max(d, 0.1), 0.8) - 0.1) / 0.7;

                // Calculate center point between hands
                center.x = (hands[0][0].x + hands[1][0].x) / 2;
                center.y = (hands[0][0].y + hands[1][0].y) / 2;
            } else {
                // If 1 hand, track its center
                center.x = hands[0][0].x;
                center.y = hands[0][0].y;
                expansion = 0.5; // Default state
            }
        }

        this.onUpdate({
            handsPresent: hands && hands.length > 0,
            expansion,
            pinch,
            center
        });
    }
}
