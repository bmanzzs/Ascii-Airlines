        // Explosions, projectiles, resize/reset, spatial utilities, and combat helpers.
        function explodeEnemy(enemy) {
            const renderScale = enemy.renderScale || 1;
            const eW = enemy.sprite[0].length * charW * renderScale, eH = enemy.sprite.length * charH * renderScale;
            const startX = enemy.x - eW / 2, startY = enemy.y - eH / 2;
            const colors = enemy.debrisColors || (enemy.isFlameGuardian ? ['#e01926', '#e38914', '#ffdd00', '#ff5500'] : ['#ff4400', '#ff6600', '#ff2200', '#ffaa00']);
            for (let r = 0; r < enemy.sprite.length; r++) {
                for (let c = 0; c < enemy.sprite[r].length; c++) {
                    const char = enemy.sprite[r][c];
                    if (char !== ' ') {
                        debris.push({
                            x: startX + c * charW * renderScale, y: startY + r * charH * renderScale,
                            vx: (Math.random() - 0.5) * 600 + (enemy.vx || 0), vy: (Math.random() - 0.5) * 600 + (enemy.vy || 160),
                            char, color: colors[Math.floor(Math.random() * colors.length)], life: 1.0
                        });
                    }
                }
            }
            
            const numOrbs = Math.max(1, Math.floor(((enemy.maxHp || 10) + 6) / 14));
            for (let i = 0; i < numOrbs; i++) {
                xpOrbs.push({ 
                    x: enemy.x, y: enemy.y, 
                    vx: (Math.random() - 0.5) * 200, 
                    vy: (Math.random() - 0.5) * 200, 
                    char: '⢀', 
                    color: '#ffffff',
                    xpValue: 1
                });
            }
            if (enemy.flyByDropType === 'health') {
                drops.push(createHealthDrop(enemy.x, enemy.y));
            } else if (enemy.flyByDropType === 'healthSmall') {
                drops.push(createHealthDrop(enemy.x, enemy.y, 0.05, 22));
            }
            addShake(5); score += 150; applyWakeForce(enemy.x, enemy.y, 160, 18);
        }

        function explodeBoss(bossObj) {
            const colors = ['#ff4400', '#ff6600', '#ff2200', '#ffaa00'];

            const snapshot = buildFallbackBossSnapshot(bossObj);
            if (snapshot.entries.length > 0) {
                const debrisCap = bossObj.name === 'NULL PHANTOM'
                    ? 520
                    : (bossObj.name === 'GHOST SIGNAL' ? 420 : 0);
                const debrisEntries = debrisCap > 0 && snapshot.entries.length > debrisCap
                    ? snapshot.entries.filter((_, index) => index % Math.ceil(snapshot.entries.length / debrisCap) === 0)
                    : snapshot.entries;
                debrisEntries.forEach(entry => {
                    const pieceColor = (bossObj.name === 'GHOST SIGNAL' || bossObj.name === 'NULL PHANTOM')
                        ? entry.color
                        : colors[Math.floor(Math.random() * colors.length)];
                    const burstCopies = (bossObj.name === 'GHOST SIGNAL' || bossObj.name === 'NULL PHANTOM') ? 1 : 2;
                    for (let j = 0; j < burstCopies; j++) {
                        debris.push({
                            x: entry.worldX,
                            y: entry.worldY,
                            vx: (Math.random() - 0.5) * 1200,
                            vy: (Math.random() - 0.5) * 1200,
                            char: entry.char,
                            color: pieceColor,
                            life: 2.0
                        });
                    }
                });
            } else {
                for (let j = 0; j < 50; j++) {
                    debris.push({
                        x: bossObj.x + (Math.random() - 0.5) * 150, y: bossObj.y + (Math.random() - 0.5) * 150,
                        vx: (Math.random() - 0.5) * 1500, vy: (Math.random() - 0.5) * 1500,
                        char: ['*', '#', '@', '░'][Math.floor(Math.random() * 4)], 
                        color: colors[Math.floor(Math.random() * colors.length)], life: 2.0
                    });
                }
            }
            
            const totalBossXp = Math.floor(player.xpNeeded * 1.2);
            const numOrbs = Math.floor(Math.sqrt(bossObj.maxHp / 10)); // Adjust orb count based on scaled HP
            const xpPerOrb = Math.floor(totalBossXp / numOrbs);
            const remainder = totalBossXp % numOrbs;
            for(let i=0; i < numOrbs; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 40;
                const speed = 40 + Math.random() * 120;
                xpOrbs.push({ 
                    x: bossObj.x + Math.cos(angle) * dist, 
                    y: bossObj.y + Math.sin(angle) * dist, 
                    vx: Math.cos(angle) * speed, 
                    vy: Math.sin(angle) * speed, 
                    char: ['⣶', '⣾', '⣿'][Math.floor(Math.random() * 3)], 
                    color: '#ffffff',
                    xpValue: xpPerOrb + (i < remainder ? 1 : 0)
                });
            }
            
            addShake(25); score += 20000;
            applyWakeForce(bossObj.x, bossObj.y, 400, 50);
        }

        function radialExplosion(x, y, radius, damage) {
            applyWakeForce(x, y, radius, 35);
            addShake(radius / 8);
            const colors = ['#ff4400', '#ff6600', '#ff2200', '#ffaa00'];
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (Math.hypot(e.x - x, e.y - y) < radius) {
                    e.hp -= damage;
                    e.flashTimer = 0.15;
                    if (e.hp <= 0) {
                        resolveWaveEnemy(e);
                        explodeEnemy(e);
                        enemies.splice(i, 1);
                    }
                }
            }
            if (boss && boss.phase === 'ACTIVE') {
                if (boss.name === 'OVERHEATING FIREWALL') {
                    if (boss.isVulnerable && Math.hypot(boss.x - x, (boss.y + 20) - y) < radius + 40) {
                        boss.hp -= damage;
                        boss.flashTimer = 0.15;
                        if (maybeTriggerBossDeathCinematic(boss)) return;
                    }
                } else if (Math.hypot(boss.x - x, boss.y - y) < radius) {
                    const damageScale = getBlackVoidDamageScale(x, y);
                    boss.hp -= damage * damageScale;
                    if (damageScale < 1) absorbBlackVoidProjectile(x, y, 2);
                    boss.flashTimer = 0.15;
                    if (maybeTriggerBossDeathCinematic(boss)) return;
                }
            }
            for (let i = 0; i < 20; i++) {
                debris.push({
                    x, y, vx: (Math.random()-0.5)*radius*4, vy: (Math.random()-0.5)*radius*4,
                    char: '#', color: colors[Math.floor(Math.random() * colors.length)], life: 0.8
                });
            }
        }

        const BOMB_SHRAPNEL_STATS = {
            damageMult: 1,
            fireRateMult: 1,
            speedMult: 1,
            sizeMult: 0.72,
            pierceCount: 0,
            splashRadius: 0,
            splashDamagePercent: 0,
            homing: false,
            chainCount: 0,
            pathFunction: 'straight',
            mode: 'projectile',
            hasRearFire: false,
            hasOrbitalDrones: false,
            pelletCount: 1,
            spreadAngle: 0,
            inaccuracy: 0
        };

        function spawnBombExplosion(x, y) {
            radialExplosion(x, y, BOMB_EXPLOSION_RADIUS, BOMB_EXPLOSION_DAMAGE);
            addShake(26);

            const ringConfigs = [
                { color: '#8ff7ff', maxRadius: BOMB_EXPLOSION_RADIUS * 0.92, maxLife: 0.34, lineWidth: 5 },
                { color: '#4fb6ff', maxRadius: BOMB_EXPLOSION_RADIUS * 1.2, maxLife: 0.48, lineWidth: 3 },
                { color: '#eaa4ff', maxRadius: BOMB_EXPLOSION_RADIUS * 1.42, maxLife: 0.58, lineWidth: 2 }
            ];
            for (let i = 0; i < ringConfigs.length; i++) {
                bombBlastRings.push({
                    x,
                    y,
                    life: 0,
                    ...ringConfigs[i]
                });
            }

            const plasmaColors = ['#ffffff', '#8ff7ff', '#56a6ff', '#d986ff'];
            const plasmaChars = ['✦', '✧', '*', '•', '░'];
            for (let i = 0; i < 52; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 120 + Math.random() * 520;
                debris.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    char: plasmaChars[Math.floor(Math.random() * plasmaChars.length)],
                    color: plasmaColors[Math.floor(Math.random() * plasmaColors.length)],
                    life: 0.7 + Math.random() * 0.35
                });
            }

            for (let i = 0; i < 26; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 90 + Math.random() * 180;
                thrusterParticles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    char: ['░', '▒', '*', '·'][Math.floor(Math.random() * 4)],
                    color: ['#7ddfff', '#5ab7ff', '#f4fbff', '#d884ff'][Math.floor(Math.random() * 4)],
                    life: 0.55 + Math.random() * 0.2,
                    isSmoke: true
                });
            }

            for (let i = 0; i < BOMB_SHRAPNEL_COUNT; i++) {
                const angle = (Math.PI * 2 * i) / BOMB_SHRAPNEL_COUNT + (Math.random() - 0.5) * 0.22;
                const speed = BOMB_SHRAPNEL_SPEED_MIN + Math.random() * (BOMB_SHRAPNEL_SPEED_MAX - BOMB_SHRAPNEL_SPEED_MIN);
                comboProjectiles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    baseVx: Math.cos(angle) * speed,
                    baseVy: Math.sin(angle) * speed,
                    startX: x,
                    startY: y,
                    sprite: i % 2 === 0 ? '•' : '·',
                    color: i % 3 === 0 ? '#fff4bc' : (i % 2 === 0 ? '#a7f4ff' : '#c58dff'),
                    stats: { ...BOMB_SHRAPNEL_STATS },
                    life: BOMB_SHRAPNEL_LIFE,
                    maxLife: BOMB_SHRAPNEL_LIFE,
                    damage: BOMB_SHRAPNEL_DAMAGE,
                    pierceHits: [],
                    pierceCount: 0,
                    isBombShrapnel: true
                });
            }
        }

        function fireCombo(baseAngle = getPlayerFireAngle()) {
            let s = player.weaponStats;
            let baseDmg = 10 * s.damageMult + player.modifiers.laserDamage;
            if (player.hp < player.maxHp * 0.5) baseDmg *= (1 + player.modifiers.adrenaline);

            const speed = 1400 * s.speedMult;
            const layout = getPlayerRenderLayout(player, getPlayerFacing(player));
            const frontOrigin = getPlayerWeaponOrigin(layout, false);
            const rearOrigin = getPlayerWeaponOrigin(layout, true);

            function spawnBullet(x, y, vx, vy, isRear) {
                let pdmg = isRear ? baseDmg * 1.25 : baseDmg;
                comboProjectiles.push({
                    x, y, vx, vy, baseVx: vx, baseVy: vy, startX: x, startY: y,
                    sprite: s.pathFunction === 'parabolic' ? '◓' : '|',
                    color: '#ffffff',
                    stats: { ...s },
                    life: 2.0, maxLife: 2.0, damage: pdmg,
                    pierceHits: [],
                    pierceCount: s.pierceCount
                });
            }

            const angles = getFirePatternAngles(s, baseAngle);

            for (let a of angles) {
                let aSpread = a + (Math.random() - 0.5) * s.inaccuracy;
                spawnBullet(frontOrigin.x, frontOrigin.y, Math.cos(aSpread) * speed, Math.sin(aSpread) * speed, false);
            }

            if (s.hasRearFire && (player.rearFireTicker++ % 2 === 0)) {
                for (let a of angles) {
                    let ra = a + Math.PI + (Math.random() - 0.5) * s.inaccuracy;
                    spawnBullet(rearOrigin.x, rearOrigin.y, Math.cos(ra) * speed, Math.sin(ra) * speed, true);
                }
            }

            player.lastFire = currentFrameNow;
            addShake(1);
        }

        function fireBomb() {
            player.bombTimer = player.bombCooldown * player.modifiers.bombCooldown;
            const origin = getPlayerWeaponOrigin(getPlayerRenderLayout(player, getPlayerFacing(player)));
            const angle = getPlayerFireAngle();
            const vx = Math.cos(angle) * BOMB_GRENADE_SPEED;
            const vy = Math.sin(angle) * BOMB_GRENADE_SPEED;
            bombProjectiles.push({
                x: origin.x,
                y: origin.y,
                startX: origin.x,
                startY: origin.y,
                vx,
                vy,
                angle,
                distance: 0,
                maxDistance: BOMB_GRENADE_RANGE,
                pulse: Math.random() * Math.PI * 2
            });
            addShake(12);
            for (let i = 0; i < 10; i++) {
                const spread = (Math.random() - 0.5) * 0.7;
                const speed = 80 + Math.random() * 160;
                thrusterParticles.push({
                    x: origin.x,
                    y: origin.y,
                    vx: Math.cos(angle + Math.PI + spread) * speed,
                    vy: Math.sin(angle + Math.PI + spread) * speed,
                    char: ['░', '▒', '*'][Math.floor(Math.random() * 3)],
                    color: ['#8aefff', '#ffffff', '#9f6cff'][Math.floor(Math.random() * 3)],
                    life: 0.32 + Math.random() * 0.18,
                    isSmoke: true
                });
            }
        }

        function initArrays(size) {
            fpHX = new Float32Array(size); fpHY = new Float32Array(size);
            fpX = new Float32Array(size); fpY = new Float32Array(size);
            fpVX = new Float32Array(size); fpVY = new Float32Array(size);
            fpChar = new Uint8Array(size); fpColor = new Uint8Array(size);
            fpAlpha = new Float32Array(size); fpHighlight = new Float32Array(size);
        }

        function resize() {
            const MIN_HUD_SCALE = 0.52;
            const MAX_HUD_SCALE = 1.45;
            const MIN_HUD_HEIGHT = 32;
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            const targetRatio = LOGICAL_W / LOGICAL_H;
            const availableW = Math.max(0, winW - CANVAS_BORDER * 2);
            const getDisplaySize = (hudPixelHeight) => {
                const availableH = Math.max(0, winH - hudPixelHeight - CANVAS_BORDER * 2);
                if (availableW <= 0 || availableH <= 0) return { displayW: 0, displayH: 0 };
                if (availableW / availableH > targetRatio) {
                    const displayH = availableH;
                    return { displayW: displayH * targetRatio, displayH };
                }
                const displayW = availableW;
                return { displayW, displayH: displayW / targetRatio };
            };

            let hudH = HUD_HEIGHT;
            let { displayW, displayH } = getDisplaySize(hudH);
            let hudScale = Math.max(MIN_HUD_SCALE, Math.min(MAX_HUD_SCALE, displayW / LOGICAL_W));
            hudH = Math.max(MIN_HUD_HEIGHT, Math.round(HUD_HEIGHT * hudScale));
            ({ displayW, displayH } = getDisplaySize(hudH));
            hudScale = Math.max(MIN_HUD_SCALE, Math.min(MAX_HUD_SCALE, displayW / LOGICAL_W));
            hudH = Math.max(MIN_HUD_HEIGHT, Math.round(HUD_HEIGHT * hudScale));
            ({ displayW, displayH } = getDisplaySize(hudH));

            const cssCanvasW = Math.round(displayW);
            const cssCanvasH = Math.round(displayH);
            const outerCanvasW = cssCanvasW + CANVAS_BORDER * 2;
            const outerCanvasH = cssCanvasH + CANVAS_BORDER * 2;
            canvas.style.width = `${outerCanvasW}px`;
            canvas.style.height = `${outerCanvasH}px`;

            const container = document.getElementById('game-container');
            container.style.width = `${outerCanvasW}px`;
            container.style.height = `${outerCanvasH}px`;
            hud.style.width = `${outerCanvasW}px`;
            hud.style.maxWidth = `${outerCanvasW}px`;
            document.documentElement.style.setProperty('--hud-ui-scale', hudScale.toFixed(3));
            document.documentElement.style.setProperty('--hud-height', `${hudH}px`);
            hudWeaponCellSize = Math.max(6, Math.min(16, Math.round(12 * hudScale)));
            document.documentElement.style.setProperty('--hud-weapon-cell', `${hudWeaponCellSize}px`);

            width = LOGICAL_W; height = LOGICAL_H;
            canvas.width = LOGICAL_W; canvas.height = LOGICAL_H;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.font = `${FONT_SIZE}px Courier New`;
            ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
            const metrics = ctx.measureText('0');
            charW = Math.max(1, Math.round(metrics.width));
            charH = Math.max(1, Math.round(FONT_SIZE * 1.2));
            rebuildField();
        }

        function rebuildField() {
            const cols = Math.ceil(width / CELL_SIZE) + 2;
            const rows = Math.ceil(height / CELL_SIZE) + 2;
            numParticles = Math.min(cols * rows, 8000);
            initArrays(numParticles);
            let i = 0;
            for (let y = -1; y <= rows; y++) {
                for (let x = -1; x <= cols; x++) {
                    if (i >= numParticles) break;
                    fpHX[i] = x * CELL_SIZE; fpHY[i] = y * CELL_SIZE;
                    fpX[i] = fpHX[i]; fpY[i] = fpHY[i];
                    fpChar[i] = Math.floor(Math.random() * PARTICLE_CHARS.length);
                    fpColor[i] = Math.floor(Math.random() * 4);
                    fpAlpha[i] = 0.2 + Math.random() * 0.4;
                    fpHighlight[i] = 0;
                    i++;
                }
            }
        }

        function buildSpatialHash() {
            spatialHash.clear();
            for (let i = 0; i < numParticles; i++) {
                const cx = (fpX[i] / HASH_SIZE) | 0;
                const cy = (fpY[i] / HASH_SIZE) | 0;
                const key = (cx << 12) | (cy & 0xFFF);
                let cell = spatialHash.get(key);
                if (!cell) { cell = []; spatialHash.set(key, cell); }
                cell.push(i);
            }
        }

        function applyWakeForce(px, py, radius, forceAmt) {
            const rSq = radius * radius;
            const minX = Math.floor((px - radius) / HASH_SIZE), maxX = Math.floor((px + radius) / HASH_SIZE);
            const minY = Math.floor((py - radius) / HASH_SIZE), maxY = Math.floor((py + radius) / HASH_SIZE);
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const key = (x << 12) | (y & 0xFFF);
                    const indices = spatialHash.get(key);
                    if (!indices) continue;
                    for (let i = 0; i < indices.length; i++) {
                        const idx = indices[i];
                        const dx = fpX[idx] - px, dy = fpY[idx] - py;
                        const dSq = dx * dx + dy * dy;
                        if (dSq < rSq && dSq > 0.1) {
                            const dist = Math.sqrt(dSq);
                            const force = (1 - dist / radius) * forceAmt;
                            fpVX[idx] += (dx / dist) * force; fpVY[idx] += (dy / dist) * force;
                        }
                    }
                }
            }
        }

        function getExhaustColor(life) {
            let r, g, b;
            if (life > 0.6) {
                const t = (life - 0.6) / 0.4;
                r = 255;
                g = Math.floor(102 + t * (255 - 102));
                b = Math.floor(0 + t * (255 - 0));
            } else {
                const t = Math.max(0, life) / 0.6;
                r = Math.floor(0 + t * (255 - 0));
                g = Math.floor(68 + t * (102 - 68));
                b = Math.floor(255 + t * (0 - 255));
            }
            return `rgb(${r},${g},${b})`;
        }

        function getGuardianFlameColor(life) {
            if (life > 0.66) return '#ffdd00';
            if (life > 0.33) return '#e38914';
            return '#e01926';
        }

        function getWraithFlameColor(life) {
            if (life > 0.66) return '#c8ffff';
            if (life > 0.33) return '#f4fbff';
            return '#101317';
        }

        function getSpriteGlyphColor(spriteColors, row, col, fallbackColor) {
            if (!spriteColors || !spriteColors[row]) return fallbackColor;
            return spriteColors[row][col] || fallbackColor;
        }

        function drawAsciiSprite(sprite, startX, startY, fallbackColor, spriteColors = null, flashColor = null, spriteColorFn = null) {
            let lastColor = null;
            for (let r = 0; r < sprite.length; r++) {
                const row = sprite[r];
                const y = quantizeGlyphCoord(startY + r * charH);
                let x = startX;
                for (let c = 0; c < row.length; c++) {
                    const char = row[c];
                    if (char !== ' ') {
                        const color = flashColor || (spriteColorFn ? spriteColorFn(sprite, r, c, fallbackColor) : getSpriteGlyphColor(spriteColors, r, c, fallbackColor));
                        if (color !== lastColor) {
                            ctx.fillStyle = color;
                            lastColor = color;
                        }
                        ctx.fillText(char, quantizeGlyphCoord(x), y);
                    }
                    x += charW;
                }
            }
        }

        function getHudOverlayInset(padding = 0) {
            return HUD_HEIGHT + padding;
        }

        function getGameplayBottomLimit(margin = 50) {
            return height - HUD_HEIGHT - margin;
        }

        function getDropRestY() {
            return getGameplayBottomLimit(30);
        }

        function getBossBarLayout() {
            const barW = width * 0.75;
            const barH = 24;
            const barX = width / 2 - barW / 2;
            const barY = height - getHudOverlayInset(36);
            return {
                barW,
                barH,
                barX,
                barY,
                nameY: barY - 20
            };
        }

        function resetGame() {
            teardownBossCinematic();
            score = 0;
            WaveManager.currentWave = 0;
            WaveManager.waveDelay = 0;
            WaveManager.pendingFormationUnits = 0;
            WaveManager.activeFormationId = 0;
            WaveManager.formationId = 0;
            WaveManager.randomizeFlyByAssignments();
            enemies = []; boss = null; enemyBullets = []; comboProjectiles = []; bombProjectiles = []; bombBlastRings = [];
            drops = []; debris = []; xpOrbs = []; thrusterParticles = [];
            deathTimer = 0; launchTimer = 0; playerExploded = false;
            shake = 0; wobble = 0;
            levelUpState = 'INTRO'; offeredOptions = []; selectedOptionIndex = 0; levelUpTimer = 0;
            queuedConsoleLevels = 0;
            player.x = width / 2; player.y = Math.min(height * 0.8, getGameplayBottomLimit(150));
            player.vx = 0; player.vy = 0;
            player.hp = 100; player.maxHp = 100;
            player.xp = 0; player.xpNeeded = 10; player.level = 1;
            player.stats = { L: 1, M: 0, B: 0 };
            player.modifiers = { moveSpeed: 0, maxHp: 0, laserDamage: 0, hitbox: 1, fireRate: 0, hpRegen: 0, invincibility: 0, adrenaline: 0, magnet: 0, bombCooldown: 1 };
            player.weaponStats = { damageMult: 1, fireRateMult: 1, speedMult: 1, sizeMult: 1, pierceCount: 0, splashRadius: 0, splashDamagePercent: 0, homing: false, chainCount: 0, pathFunction: 'straight', mode: 'projectile', hasRearFire: false, hasOrbitalDrones: false, pelletCount: 1, spreadAngle: 0, inaccuracy: 0 };
            player.weapons = [];
            weaponWeights = {};
            WEAPON_POOL.forEach(w => weaponWeights[w.name] = 1.0);
            player.drones = [{angle: 0, timer: 0}, {angle: Math.PI, timer: 0}];
            player.isBeaming = false; player.isFiring = false; player.rearFireTicker = 0;
            player.beamAngle = PLAYER_FIRE_FORWARD_ANGLE; player.beamTargetAngle = PLAYER_FIRE_FORWARD_ANGLE;
            player.beamDeploy = 0;
            player.bombTimer = 0; player.bombCooldown = BOMB_BASE_COOLDOWN;
            player.invincibilityTimer = 0; player.flashTimer = 0;
            player.fireRate = 260; player.lastFire = 0; player.color = '#00ffff';
            stopMusic();
            clearPauseVolumePreview();
            applyCurrentVolume();
            pauseState = 'MAIN'; pauseSelection = 0;
            titleAlpha = 0; autoLaunch = true;
            restartLoadingSequence = true;
            postResumeBombLockTimer = 0;
            gameState = 'START';
        }
