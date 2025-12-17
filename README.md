# Simple HTML Platformer (20 Levels)

This is a small browser platformer built entirely in **one HTML file**.  
Everything — the layout, styles, and game logic — is bundled together so you can open it in a browser and play immediately. No build steps, no external scripts, no dependencies.

It uses plain HTML, CSS, and JavaScript to create a simple but surprisingly fun 20‑level platformer with enemies, spikes, gravity, and a basic lives system.

---

## Features

- 20 handcrafted levels
- Moving enemies with patrol ranges
- Spikes and other hazards
- A goal orb to finish each level
- Three‑life system with a game‑over screen
- Smooth animation using `requestAnimationFrame`
- Basic physics (gravity, jumping, horizontal movement)
- Everything contained in a single `.html` file

---

## How to Play

- **Left:** Arrow Left or A  
- **Right:** Arrow Right or D  
- **Jump:** Arrow Up, W, or Space  
- Reach the green goal orb to advance  
- Avoid enemies and spikes  
- You start with 3 lives  

Just open the file in any modern browser and you're good to go.

---

## How It Works

### Physics

- Gravity is applied every frame  
- Vertical velocity handles falling and jumping  
- Horizontal movement is based on key input  

### Collision Detection

- Uses simple AABB (axis‑aligned bounding box) checks  
- Platforms stop downward movement  
- Enemies and spikes cause a death  
- Touching the goal completes the level  

### Level Format

Each level is defined inside the file like this:

```js
{
  platforms: [ {x, y, w, h}, ... ],
  enemies:   [ {x, y, minX, maxX}, ... ],
  spikes:    [ {x, y}, ... ],
  goalX: number,
  goalY: number
}
