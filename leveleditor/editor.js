// ===== GLOBAL STATE =====

let mode = "platform";
let currentLevelIndex = 0;
let currentLevel = null;

const editor = document.getElementById("editorContainer");
const output = document.getElementById("output");


// ===== SNAP FUNCTION =====

function snap(n) {
    return Math.round(n / 10) * 10;
}


// ===== LEVEL SELECTOR INIT =====

const levelSelect = document.getElementById("levelSelect");

levels.forEach((_, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = "Level " + (i + 1);
    levelSelect.appendChild(opt);
});

levelSelect.addEventListener("change", () => {
    loadLevel(parseInt(levelSelect.value, 10));
});


// ===== TOOL BUTTONS / MODE SWITCHING =====

document.querySelectorAll("button[data-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
        mode = btn.dataset.mode;
    });
});

document.getElementById("exportBtn").addEventListener("click", () => {
    // Extra indentation: 8 spaces instead of 4
    output.value = JSON.stringify(currentLevel, null, 8);
});


// ===== LOAD LEVEL =====

function loadLevel(index) {
    currentLevelIndex = index;
    // deep clone so we don't mutate original levels array
    currentLevel = JSON.parse(JSON.stringify(levels[index]));

    // Clear editor
    editor.innerHTML = "";

    // Re-create objects
    currentLevel.platforms.forEach((p, i) => createPlatform(p, i));
    currentLevel.enemies.forEach((e, i) => createEnemy(e, i));
    currentLevel.spikes.forEach((s, i) => createSpike(s, i));
    if (currentLevel.goalX != null && currentLevel.goalY != null) {
        createGoal(currentLevel.goalX, currentLevel.goalY);
    }
}

loadLevel(0);


// ===== ADD OBJECTS BY CLICKING CANVAS =====

editor.addEventListener("mousedown", e => {
    // Only add when clicking on the empty editor background
    if (e.target !== editor) return;

    const x = snap(e.offsetX);
    const y = snap(e.offsetY);

    if (mode === "platform") {
        const p = { x, y, w: 100, h: 20 };
        currentLevel.platforms.push(p);
        createPlatform(p, currentLevel.platforms.length - 1);
        return;
    }

    if (mode === "enemy") {
        const en = {
            x,
            y,
            minX: x - 50,
            maxX: x + 50
        };
        currentLevel.enemies.push(en);
        createEnemy(en, currentLevel.enemies.length - 1);
        return;
    }

    if (mode === "spike") {
        const s = { x, y };
        currentLevel.spikes.push(s);
        createSpike(s, currentLevel.spikes.length - 1);
        return;
    }

    if (mode === "goal") {
        currentLevel.goalX = x;
        currentLevel.goalY = y;
        createGoal(x, y);
        return;
    }
});


// ===== ID REFRESH AFTER DELETES =====

function refreshIDs() {
    document.querySelectorAll(".platform").forEach((el, i) => el.dataset.id = i);
    document.querySelectorAll(".enemy").forEach((el, i) => el.dataset.id = i);
    document.querySelectorAll(".spike").forEach((el, i) => el.dataset.id = i);
}


// ===== DRAGGING (WITH DELETE MODE SUPPORT) =====

function makeDraggable(el, onMove) {
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    el.addEventListener("mousedown", e => {

        // --- DELETE MODE TAKES PRIORITY ---
        if (mode === "delete") {
            const id = parseInt(el.dataset.id, 10);

            // Remove from DOM
            el.remove();

            // Remove from level data
            if (el.classList.contains("platform")) {
                currentLevel.platforms.splice(id, 1);
            }
            if (el.classList.contains("enemy")) {
                currentLevel.enemies.splice(id, 1);
            }
            if (el.classList.contains("spike")) {
                currentLevel.spikes.splice(id, 1);
            }
            if (el.classList.contains("goal")) {
                currentLevel.goalX = null;
                currentLevel.goalY = null;
            }

            refreshIDs();
            return;
        }

        // --- IGNORE RESIZE HANDLE FOR DRAGGING ---
        if (e.target.classList.contains("resize-handle")) return;

        // --- NORMAL DRAG START ---
        dragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    });

    window.addEventListener("mousemove", e => {
        if (!dragging) return;

        const rect = editor.getBoundingClientRect();
        const x = snap(e.clientX - rect.left - offsetX);
        const y = snap(e.clientY - rect.top - offsetY);

        el.style.left = x + "px";
        el.style.top = y + "px";

        onMove(x, y);
    });

    window.addEventListener("mouseup", () => {
        dragging = false;
    });
}


// ===== RESIZE HANDLE FOR PLATFORMS (RIGHT ONLY) =====

function makeResizeHandle(handle, platformEl, platformData) {
    let resizing = false;
    let startX = 0;
    let startW = 0;

    handle.addEventListener("mousedown", e => {
        resizing = true;
        startX = e.clientX;
        startW = platformData.w;
        e.stopPropagation(); // don't trigger drag
    });

    window.addEventListener("mousemove", e => {
        if (!resizing) return;

        const dx = e.clientX - startX;
        const newW = snap(startW + dx);

        if (newW > 20) {
            platformData.w = newW;
            platformEl.style.width = newW + "px";
        }
    });

    window.addEventListener("mouseup", () => {
        resizing = false;
    });
}


// ===== CREATE OBJECTS =====

function createPlatform(p, id) {
    const el = document.createElement("div");
    el.className = "platform";
    el.style.left = p.x + "px";
    el.style.top = p.y + "px";
    el.style.width = p.w + "px";
    el.dataset.id = id;

    // Dragging
    makeDraggable(el, (x, y) => {
        p.x = x;
        p.y = y;
    });

    // Resize handle (right side only)
    const handle = document.createElement("div");
    handle.className = "resize-handle";
    el.appendChild(handle);

    makeResizeHandle(handle, el, p);

    editor.appendChild(el);
}

function createEnemy(e, id) {
    const el = document.createElement("div");
    el.className = "enemy";
    el.style.left = e.x + "px";
    el.style.top = e.y + "px";
    el.dataset.id = id;

    makeDraggable(el, (x, y) => {
        e.x = x;
        e.y = y;
        updateEnemyPath(e, el);
    });

    editor.appendChild(el);

    createEnemyPath(e, el);
}

function createSpike(s, id) {
    const el = document.createElement("div");
    el.className = "spike";
    el.style.left = s.x + "px";
    el.style.top = s.y + "px";
    el.dataset.id = id;

    makeDraggable(el, (x, y) => {
        s.x = x;
        s.y = y;
    });

    editor.appendChild(el);
}

function createGoal(x, y) {
    // Remove old goal if any
    const oldGoal = editor.querySelector(".goal");
    if (oldGoal) oldGoal.remove();

    const el = document.createElement("div");
    el.className = "goal";
    el.style.left = x + "px";
    el.style.top = y + "px";
    // goal doesn't use dataset.id because it's unique

    makeDraggable(el, (nx, ny) => {
        currentLevel.goalX = nx;
        currentLevel.goalY = ny;
    });

    editor.appendChild(el);
}


// ===== ENEMY PATH VISUALIZER =====

function createEnemyPath(e, enemyEl) {
    const line = document.createElement("div");
    line.className = "path-line";

    const leftHandle = document.createElement("div");
    leftHandle.className = "path-handle";

    const rightHandle = document.createElement("div");
    rightHandle.className = "path-handle";

    editor.appendChild(line);
    editor.appendChild(leftHandle);
    editor.appendChild(rightHandle);

    function update() {
        const y = e.y + 12; // center-ish of enemy

        line.style.left = e.minX + "px";
        line.style.top = y + "px";
        line.style.width = (e.maxX - e.minX) + "px";

        leftHandle.style.left = (e.minX - 5) + "px";
        leftHandle.style.top = (y - 10) + "px";

        rightHandle.style.left = (e.maxX - 5) + "px";
        rightHandle.style.top = (y - 10) + "px";
    }

    update();

    // Drag left handle
    makeDraggable(leftHandle, (x) => {
        e.minX = x;
        // Clamp so minX never exceeds maxX
        if (e.minX > e.maxX - 10) e.minX = e.maxX - 10;
        update();
    });

    // Drag right handle
    makeDraggable(rightHandle, (x) => {
        e.maxX = x;
        // Clamp so maxX never goes below minX
        if (e.maxX < e.minX + 10) e.maxX = e.minX + 10;
        update();
    });

    // Let the enemy know how to update its path visuals after it moves
    enemyEl.updatePath = update;
}

function updateEnemyPath(e, enemyEl) {
    if (enemyEl.updatePath) enemyEl.updatePath();
}
