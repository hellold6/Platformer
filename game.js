const gameContainer = document.getElementById('gameContainer');
        src="levels.js";
        const player = document.getElementById('player');
        const uiLevel = document.getElementById('levelNum');
        const uiLives = document.getElementById('lives');
        const gameOverDiv = document.getElementById('gameOver');

        let currentLevel = 1;
        let lives = 3;
        let gameActive = true;
        let playerX = 50;
        let playerY = 450;
        let playerVelY = 0;
        let playerVelX = 0;
        let isJumping = false;
        let maxLevels = 20;
        let gameStarted = false;
        let customLevel= null;

        // Player hitbox
        let PLAYER_HITBOX_WIDTH = 30;
        let PLAYER_HITBOX_HEIGHT = 24;

        // Enemy default hitbox
        let ENEMY_HITBOX_WIDTH = 34;
        let ENEMY_HITBOX_HEIGHT = 30;

        // Spike default hitbox
        let SPIKE_HITBOX_WIDTH = 40;
        let SPIKE_HITBOX_HEIGHT = 37;

        // Goal default hitbox
        let GOAL_HITBOX_WIDTH = 42;
        let GOAL_HITBOX_HEIGHT = 41;


        const GRAVITY = 0.6;
        const JUMP_STRENGTH = -12;
        const MOVE_SPEED = 5;
        
        const keys = {};

        window.addEventListener('keydown', (e) => {
            keys[e.key] = true;
            if (e.key === ' ') e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });

        function isColliding(x, y, w, h, px, py, pw, ph) {
            return x < px + pw && x + w > px && y < py + ph && y + h > py;
        }

        function loadLevel(levelNum) {
                currentLevel = levelNum;
                uiLevel.textContent = currentLevel;

                // Remove old objects
                gameContainer.querySelectorAll('.platform:not(#ground), .enemy, .spike, .goal').forEach(el => el.remove());

                const level = levels[levelNum - 1];

                // PLATFORMS
                level.platforms.forEach(p => {
                        const platformEl = document.createElement('div');
                        platformEl.className = 'platform';
                        platformEl.style.left = p.x + 'px';
                        platformEl.style.top = p.y + 'px';
                        platformEl.style.width = p.w + 'px';
                        platformEl.style.height = p.h + 'px';
                        platformEl.dataset.hitboxWidth = p.w;
                        platformEl.dataset.hitboxHeight = p.h;
                        gameContainer.appendChild(platformEl);
                });

                // ENEMIES
                level.enemies.forEach(e => {
                        const enemyEl = document.createElement('div');
                        enemyEl.className = 'enemy';
                        enemyEl.style.left = e.x + 'px';
                        enemyEl.style.top = e.y + 'px';
                        enemyEl.dataset.minx = e.minX;
                        enemyEl.dataset.maxx = e.maxX;
                        enemyEl.dataset.vx = 2;
                        enemyEl.dataset.hitboxWidth = e.hitboxW || ENEMY_HITBOX_WIDTH;
                        enemyEl.dataset.hitboxHeight = e.hitboxH || ENEMY_HITBOX_HEIGHT;
                        gameContainer.appendChild(enemyEl);
                });

            /* SHELLERS
            level.shellers?.forEach(s => {
                const sheller = document.createElement('div');
                sheller.className = 'sheller';
                sheller.style.left = s.x + 'px';
                sheller.style.top = s.y + 'px';
                sheller.dataset.dir = s.dir || 1;
                sheller.dataset.cooldown = 0;
                gameContainer.appendChild(sheller);
            }); */


            // SPIKES
            level.spikes.forEach(s => {
                const spikeEl = document.createElement('div');
                spikeEl.className = 'spike';
                spikeEl.style.left = s.x + 'px';

                // find the platform below this spike
                let platformBelow = null;
                document.querySelectorAll('.platform').forEach(plat => {
                    const px = parseFloat(plat.style.left);
                    const pwPlat = parseFloat(plat.dataset.hitboxWidth);
                    const py = parseFloat(plat.style.top);
                    if (s.x + SPIKE_HITBOX_WIDTH > px && s.x < px + pwPlat) {
                        if (!platformBelow || py < platformBelow.y) {
                            platformBelow = { y: py };
                        }
                    }
                });

                if (platformBelow) {
                    // anchor spike on top of platform
                    spikeEl.style.top = (platformBelow.y - SPIKE_HITBOX_HEIGHT) + 'px';
                } else {
                    // fallback if no platform found
                    spikeEl.style.top = s.y + 'px';
                }

                spikeEl.dataset.hitboxWidth = s.hitboxW || SPIKE_HITBOX_WIDTH;
                spikeEl.dataset.hitboxHeight = s.hitboxH || SPIKE_HITBOX_HEIGHT;
                gameContainer.appendChild(spikeEl);
            });


                // GOAL
                const goalEl = document.createElement('div');
                goalEl.className = 'goal';
                goalEl.style.left = level.goalX + 'px';
                goalEl.style.top = level.goalY + 'px';
                goalEl.dataset.hitboxWidth = level.goalW || GOAL_HITBOX_WIDTH;
                goalEl.dataset.hitboxHeight = level.goalH || GOAL_HITBOX_HEIGHT;
                gameContainer.appendChild(goalEl);

                // Reset player
                playerX = 50;
                playerY = 450;
                playerVelY = 0;
                playerVelX = 0;
                player.dataset.hitboxWidth = PLAYER_HITBOX_WIDTH;
                player.dataset.hitboxHeight = PLAYER_HITBOX_HEIGHT;
                updatePlayerPosition();
        }


        function updatePlayerPosition() {
            player.style.left = playerX + 'px';
            player.style.top = playerY + 'px';
        }

        function updateEnemies() {
            document.querySelectorAll('.enemy').forEach(enemy => {
                let x = parseFloat(enemy.style.left);
                const minX = parseFloat(enemy.dataset.minx);
                const maxX = parseFloat(enemy.dataset.maxx);
                let vx = parseFloat(enemy.dataset.vx);

                x += vx;
                if (x <= minX || x >= maxX) vx *= -1;

                enemy.style.left = x + 'px';
                enemy.dataset.vx = vx;
            });
        }

                function checkCollisions() {
                let isOnGround = false;

                const pw = parseFloat(player.dataset.hitboxWidth);
                const ph = parseFloat(player.dataset.hitboxHeight);

                // PLATFORM collisions
                document.querySelectorAll('.platform').forEach(platformEl => {
                        const px = parseFloat(platformEl.style.left);
                        const py = parseFloat(platformEl.style.top);
                        const pwPlat = parseFloat(platformEl.dataset.hitboxWidth);
                        const phPlat = parseFloat(platformEl.dataset.hitboxHeight);

                        if (isColliding(playerX, playerY, pw, ph, px, py, pwPlat, phPlat)) {
                                if (playerVelY > 0 && playerY + ph - playerVelY <= py + 5) {
                                        playerY = py - ph;
                                        playerVelY = 0;
                                        isOnGround = true;
                                }
                        }
                });

                // ENEMY collisions
                document.querySelectorAll('.enemy').forEach(enemyEl => {
                        const ex = parseFloat(enemyEl.style.left);
                        const ey = parseFloat(enemyEl.style.top);
                        const ew = parseFloat(enemyEl.dataset.hitboxWidth);
                        const eh = parseFloat(enemyEl.dataset.hitboxHeight);

                        if (isColliding(playerX, playerY, pw, ph, ex, ey, ew, eh)) playerDeath();
                });

                // SPIKE collisions
                document.querySelectorAll('.spike').forEach(spikeEl => {
                        const sx = parseFloat(spikeEl.style.left);
                        const sy = parseFloat(spikeEl.style.top);
                        const sw = parseFloat(spikeEl.dataset.hitboxWidth);
                        const sh = parseFloat(spikeEl.dataset.hitboxHeight);

                        if (isColliding(playerX, playerY, pw, ph, sx, sy, sw, sh)) playerDeath();
                });

                // GOAL collision
                const goal = document.querySelector('.goal');
                const gx = parseFloat(goal.style.left);
                const gy = parseFloat(goal.style.top);
                const gw = parseFloat(goal.dataset.hitboxWidth);
                const gh = parseFloat(goal.dataset.hitboxHeight);

                if (isColliding(playerX, playerY, pw, ph, gx, gy, gw, gh)) levelComplete();

                return isOnGround;
        }

        function playerDeath() {
            if(invincible) return; // skip death if invincible
            lives--;
            uiLives.textContent = lives;
            if(lives <= 0) {
                gameActive = false;
                showGameOver('Game Over!', 'You ran out of lives!');
                if (lives < 0);
                    lives = 0;
            } else {
                loadLevel(currentLevel);
            }
        }

        function levelComplete() {
            if (currentLevel < maxLevels) {
                currentLevel++;
                loadLevel(currentLevel);
                player.classList.add('fade-in');
            } else {
                gameActive = false;
                showGameOver('You Won!', 'Congratulations! You completed all 20 levels!');
            }
        }

        /* GET DOWN MR PRESIDENT
        function updateShellers() {
            document.querySelectorAll('.sheller').forEach(sheller => {
                let cooldown = Number(sheller.dataset.cooldown);
                cooldown--;

                if (cooldown <= 0) {
                    fireShell(sheller);
                    cooldown = 120; // frames between shots (~2s at 60fps)
                }

                sheller.dataset.cooldown = cooldown;
            });
        }
        
        function fireShell(sheller) {
            const shell = document.createElement('div');
            shell.className = 'shell';

            const x = parseFloat(sheller.style.left) + 18;
            const y = parseFloat(sheller.style.top) + 18;

            shell.style.left = x + 'px';
            shell.style.top = y + 'px';
            shell.dataset.vx = 4 * Number(sheller.dataset.dir);

            gameContainer.appendChild(shell);
        }
        
        function updateShells() {
            document.querySelectorAll('.shell').forEach(shell => {
                let x = parseFloat(shell.style.left);
                const vx = Number(shell.dataset.vx);

                x += vx;
                shell.style.left = x + 'px';

                // collision with player
                const sw = 10, sh = 10;
                const pw = PLAYER_HITBOX_WIDTH, ph = PLAYER_HITBOX_HEIGHT;

                if (isColliding(x, parseFloat(shell.style.top), sw, sh,
                                playerX, playerY, pw, ph)) {
                    shell.remove();
                    playerDeath();
                }

                // cleanup offscreen
                if (x < -20 || x > 820) shell.remove();
            });
        }
        */
        
        const devMenu = document.getElementById('devMenu');
        let invincible = false;

        const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
        let konamiIndex = 0;

        window.addEventListener('keydown', (e) => {
            if(e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if(konamiIndex === konamiCode.length) {
                    devMenu.style.display = 'block';
                    console.log('Dev Menu Activated!');
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });

        function updatePlayerAnimation() {
            let movingLeft = playerVelX < 0;
            let movingRight = playerVelX > 0;
            let jumping = playerVelY < 0;
            let falling = playerVelY > 0 && !checkCollisions(); // optional: only falling if not on ground

            if (jumping) {
                player.style.backgroundImage = 'url("assets/player_jump.gif")';
            } else if (falling) {
                player.style.backgroundImage = 'url("assets/player_jump.gif")';
            } else if (movingLeft){
                player.style.backgroundImage = 'url("assets/player_left.gif")';
            } else if (movingRight){
                player.style.backgroundImage = 'url("assets/player_right.gif")';
            } else {
                player.style.backgroundImage = 'url("assets/player_idle.gif")';
            }
        }

        window.onload = () => {
            document.getElementById('skipLevelBtn').addEventListener('click', () => {
                if(currentLevel < maxLevels) loadLevel(currentLevel + 1);
            });

            document.getElementById('addLifeBtn').addEventListener('click', () => {
                lives++;
                uiLives.textContent = lives;
            });

            document.getElementById('toggleInvincibleBtn').addEventListener('click', () => {
                invincible = !invincible;
                if (invincible){
                    player.style.background = '#4CD1FF';
                } else {
                    player.style.background = '#FF6B6B'; 
                }
                console.log('Invincible mode:', invincible);
            });

            const mainMenu = document.getElementById('mainMenu');
            const startGameBtn = document.getElementById('startGameBtn');
            startGameBtn.addEventListener('click', () => {
                mainMenu.style.display = 'none';
                gameStarted = true;
                gameActive = true;
                lives = 3;
                uiLives.textContent = lives;
                loadLevel(1);

            document.getElementById('restartBtn').addEventListener('click', () => {
                location.reload();
            });


                /*
                
                !!!!!! NOTE: CUSTOM LEVEL LOADING DISABLED FOR NOW. BROKEN. GOING TO SLEEP. !!!!!!

                document.getElementById('loadCustomBtn').onclick = () => {
                const fileInput = document.getElementById('levelUpload');
                const file = fileInput.files[0];
                if (!file) return alert("NO FILE. CAVEMAN SAD.");

                const reader = new FileReader();
                reader.onload = () => {
                        try {
                                customLevel = JSON.parse(reader.result);
                                levels.push(customLevel);
                                maxLevels = levels.length;
                                loadLevel(levels.length);
                                gameStarted = true;
                                gameActive = true;
                                document.getElementById('mainMenu').style.display = 'none';
                        } catch {
                                alert("FILE BAD. JSON ANGRY.");
                        }
                };
                reader.readAsText(file);
                };
                */

            });
        };

        function showGameOver(title, text) {
            document.getElementById('gameOverTitle').textContent = title;
            document.getElementById('gameOverText').textContent = text;
            gameOverDiv.style.display = 'block';
        }

        function update() {
            if (!gameActive || !gameStarted) return;

            // Player movement
            playerVelX = 0;
            if (keys['ArrowLeft'] || keys['a']) playerVelX = -MOVE_SPEED;
            if (keys['ArrowRight'] || keys['d']) playerVelX = MOVE_SPEED;

            playerX += playerVelX;

            // Keep player in bounds horizontally
            if (playerX < 0) playerX = 0;
            if (playerX + 30 > 800) playerX = 770;

            // Apply gravity
            playerVelY += GRAVITY;
            playerY += playerVelY;

            // Keep player in bounds vertically
            if (playerY + 40 > 600) {
                playerDeath();
                return;
            }

            // Check collisions and get ground status
            let isOnGround = checkCollisions();

            // Jumping
            if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && isOnGround) {
                playerVelY = JUMP_STRENGTH;
                isOnGround = false;
            }

            // GET DOWN MR PRESIDENT
            //updateShellers();
            //updateShells();


            updateEnemies();
            updatePlayerPosition();
        }

        function gameLoop() {
            update();
            requestAnimationFrame(gameLoop);
            updatePlayerAnimation();
        }

        // Initialize
        //loadLevel(1);
        gameLoop();