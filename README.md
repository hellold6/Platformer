# Simple HTML Platformer (20 Levels)

this is a small browser platformer built entirely in **one HTML and JS file**.  
everything- the layout, styles, and game logic is bundled together so you can open it in a browser and play immediately. no build steps, no external scripts, no dependencies. just itself, and a browser.

it uses plain HTML, CSS, and JavaScript to create a simple but surprisingly fun 20‑level platformer with enemies, spikes, gravity, and a basic lives system.

to do!

- [x] finish and add sprite textures

- [x] finish and add animations

- [ ] add a theme

- [ ] implement music

- [ ] custom levels

- [ ] add the death animation + spraying particle effect upon death

- [ ] add textures to platforms, background, etc 😔

- [ ] add a how to play on the main menu 

- [x] i know willow won't want this but i want lore 

- [ ] chrome extension packaging

---

## creature feature

- 20 handcrafted levels
- moving enemies with patrol ranges
- spikes and other hazards
- a goal orb to finish each level
- three‑life system with a game‑over screen
- smooth animation using `requestAnimationFrame`
- basic physics (gravity, jumping, horizontal movement)
- everything contained in a tiny `.html` and `js` file

---

## how to play !!!

- **left:** <ins>arrow left</ins> or <ins>a</ins>  
- **right:** <ins>arrow right</ins> or <ins>d</ins>  
- **jump:** <ins>arrow up</ins>, <ins>w</ins>, or <ins>space</ins>  
- reach the <ins>green goal orb</ins> to advance  
- avoid enemies (yellow) and spikes (red)
- you start with 3 lives  

just open the file in any modern browser and you're FLATPORMING.

## warning D:
Make sure you have the JS and HTML in the same folder, otherwise it gets kinda clueless and loses 90% of the game

---

## how it works (NEEEERD SECTION) (i will not edit this so that it's in NERRRRRD launguarge)

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
```
from what we remember at least..............................
the code is constantly updating so check back every now and then!! 

i, equinox, did... like. nothing. i came up with the idea lmao
and also edited this to make it seem friengldier

## thank you for visiting this page and hopefully downloading maybe please 
