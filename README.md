# Cosmic Galaxy Particles 🌌

A real-time, interactive 3D particle simulation controlled by hand gestures.

## 🚀 How to Run

1.  **Prerequisites**: Node.js installed.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
4.  **Open Browser**: Navigate to `http://localhost:5173`.
5.  **Grant Permissions**: Allow camera access when prompted.

## 🎮 Interaction Guide

- **Idle State**: A Cyan Sphere ("The Spear") rotates gently in the void.
- **Activation**: Show your hands to the camera to morph the Sphere into a **Spiral Galaxy**.
- **Zoom**: Spread your hands apart (Expansion) to fly *into* the galaxy core.
- **Pan**: Move your hands (Left/Right/Up/Down) to orbit around the galaxy.
- **Morph**: Squeeze/Pinch gestures can trigger shape shifts (currently automated by hand presence).

## 🛠 Technology Stack

- **Three.js**: High-performance WebGL 3D rendering.
- **MediaPipe Hands**: Google's ML solution for real-time hand tracking.
- **Vite**: Next-generation frontend tooling.
- **Vanilla JS**: No heavy frameworks, just pure performance.

## 📜 Development Journey

### 1. The Pivot: 2D to 3D
We started with a D3.js concept but quickly pivoted to **Three.js** to achieve the "Correction" user request for a high-fidelity 3D experience.

### 2. "Spear & Satin"
We refined the logic to support specific shapes:
- **Spear** (Sphere): The resting state.
- **Satin** (Saturn): The active state.
- *Challenge*: The initial Saturn rings were too simple. We upgraded this to a generic "Spiral Galaxy" algorithm to match reference imagery.

### 3. Visual Polish
- **Challenge**: Initial particles looked like "pink blocks" due to the default rendering behavior of `THREE.Points`.
- **Solution**: implemented a procedural 2D Canvas texture generation method to create soft, glowing "star" textures on the fly, avoiding external asset loading issues.
- **Vertex Colors**: We rewrote the particle engine to support per-vertex coloring, allowing for the gradient shift from an Orange core to Purple/Blue arms.

### 4. The "Invisible" Bug
- **Issue**: At one point, the entire scene turned black.
- **Diagnosis**: A missing argument in the `update()` loop caused the scale multiplier to become `NaN`, effectively hiding the object.
- **Fix**: Added robust default parameters and safety checks in `particles.update()`.

## 🔮 Future Roadmap
- [ ] Add more celestial shapes (Black Hole, Nebula clouds).
- [ ] Implement gesture-based colors (Pinch to change hue).
- [ ] Add audio reactivity.
