        // Fractal Halo / Gravity Run mode owner.
        // Gravity-thrust prototype logic lives here; shared weapons, pickups, HUD, audio,
        // and input remain classic globals consumed by this mode.

        const FRACTAL_GRAVITY_MODE_ID = 'fractalGravity';
        const FRACTAL_STAGE_DURATION = 78;
        const FRACTAL_BOSS_TIME = 52;
        const FRACTAL_STAGE_CLEAR_DELAY = 3.8;
        const FRACTAL_THRUST_ACCEL = 1060;
        const FRACTAL_DRAG_PER_SEC = 1.85;
        const FRACTAL_MAX_SPEED = 520;
        const FRACTAL_PLAYER_RADIUS = 18;
        const FRACTAL_PLAY_TOP = 72;
        const FRACTAL_MARGIN_X = 46;
        const FRACTAL_FIRE_DEFAULT_ANGLE = -Math.PI / 2;

        function getFractalGravityNow() {
            return typeof currentFrameNow === 'number' && currentFrameNow
                ? currentFrameNow
                : (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
        }

        function getFractalPlayBottom(pad = 54) {
            if (typeof getGameplayBottomLimit === 'function') return getGameplayBottomLimit(pad);
            const hud = typeof HUD_HEIGHT === 'number' ? HUD_HEIGHT : 82;
            return Math.max(FRACTAL_PLAY_TOP + 120, (typeof height === 'number' ? height : 720) - hud - pad);
        }

        function clampFractal(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function seededFractalNoise(seed) {
            const x = Math.sin(seed * 12.9898) * 43758.5453;
            return x - Math.floor(x);
        }

        function createFractalStar(index) {
            const w = typeof width === 'number' ? width : 1280;
            const h = typeof height === 'number' ? height : 720;
            const depth = 0.25 + seededFractalNoise(index * 4.7 + 1) * 0.95;
            return {
                x: seededFractalNoise(index * 3.1 + 4) * w,
                y: FRACTAL_PLAY_TOP + seededFractalNoise(index * 7.3 + 9) * Math.max(160, getFractalPlayBottom(12) - FRACTAL_PLAY_TOP),
                depth,
                glyph: ['.', '.', '*', '+', 'o'][Math.floor(seededFractalNoise(index * 5.9 + 2) * 5)],
                alpha: 0.12 + depth * 0.32,
                color: index % 5 === 0 ? '#d8c8ff' : (index % 3 === 0 ? '#8ff7ff' : '#ffffff'),
                wobble: seededFractalNoise(index * 2.2 + 8) * Math.PI * 2
            };
        }

        function createFractalGravityState() {
            const stars = [];
            for (let i = 0; i < 90; i++) stars.push(createFractalStar(i));
            return {
                active: false,
                elapsed: 0,
                stageTime: 0,
                distance: 0,
                pressure: 0,
                startedAt: 0,
                lastResetAt: 0,
                galaxyIndex: -1,
                gravityWells: [],
                hazards: [],
                particles: [],
                stars,
                spawnTimer: 0,
                waveIndex: 0,
                waveTimer: 0,
                waveEventIndex: 0,
                bossSpawned: false,
                bossDefeated: false,
                stageCleared: false,
                stageClearTimer: 0,
                message: '',
                messageTimer: 0,
                playerDamageCooldown: 0,
                pickupTimer: 0,
                orbitSeed: Math.random() * Math.PI * 2
            };
        }

        let fractalGravityState = createFractalGravityState();

        const FRACTAL_WAVE_EVENTS = [
            { time: 1.2, kind: 'well', type: 'pull', x: 0.28, y: 0.42, radius: 150, strength: 54, life: 15 },
            { time: 2.0, kind: 'message', text: 'GRAVITY RUN' },
            { time: 3.4, kind: 'wispLine', count: 4, side: 'top' },
            { time: 7.2, kind: 'wispLine', count: 5, side: 'bottom' },
            { time: 10.6, kind: 'well', type: 'repulsor', x: 0.72, y: 0.34, radius: 132, strength: 76, life: 15 },
            { time: 12.0, kind: 'skimmerPair' },
            { time: 16.0, kind: 'wispArc', count: 6 },
            { time: 19.5, kind: 'mineCluster', count: 3 },
            { time: 23.0, kind: 'well', type: 'orbit', x: 0.50, y: 0.55, radius: 185, strength: 128, life: 20 },
            { time: 24.8, kind: 'turretPair' },
            { time: 30.0, kind: 'skimmerFan', count: 5 },
            { time: 35.0, kind: 'well', type: 'pull', x: 0.68, y: 0.64, radius: 170, strength: 62, life: 17 },
            { time: 37.0, kind: 'hazardRing' },
            { time: 39.4, kind: 'mineCluster', count: 4 },
            { time: 43.0, kind: 'turretPair' },
            { time: 47.0, kind: 'wispArc', count: 7 },
            { time: 50.0, kind: 'message', text: 'CORE SIGNATURE RISING' },
            { time: FRACTAL_BOSS_TIME, kind: 'boss' }
        ];

        function clearFractalGravitySharedRuntimeState() {
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
            if (typeof resetSurvivorRuntimeStateForCampaign === 'function') resetSurvivorRuntimeStateForCampaign();
            if (typeof resetMatrixCrawlerRuntimeStateForCampaign === 'function') resetMatrixCrawlerRuntimeStateForCampaign();
            if (typeof resetBitshiftScrollerRuntimeStateForCampaign === 'function') resetBitshiftScrollerRuntimeStateForCampaign();
            if (typeof resetBinaryVerticalRuntimeState === 'function') resetBinaryVerticalRuntimeState();
            if (typeof resetRunCompleteTransition === 'function') resetRunCompleteTransition();
            if (typeof resetRunStats === 'function') resetRunStats();
            if (typeof resetComboBurstState === 'function') resetComboBurstState();
            if (typeof teardownBossCinematic === 'function') teardownBossCinematic();

            enemies = [];
            boss = null;
            enemyBullets = [];
            comboProjectiles = [];
            bombProjectiles = [];
            bombBlastRings = [];
            drops = [];
            xpOrbs = [];
            debris = [];
            thrusterParticles = [];
            waveSignalNotice = null;
            deathTimer = 0;
            launchTimer = 0;
            playerExploded = false;
            shake = 0;
            wobble = 0;
            score = 0;
            comboCount = 0;
            comboPeak = 0;

            if (typeof WaveManager !== 'undefined') {
                WaveManager.currentWave = 0;
                WaveManager.waveDelay = 999;
                WaveManager.hasSpawnedWave = true;
                WaveManager.interWaveDelayQueued = false;
                WaveManager.pendingFormationUnits = 0;
                WaveManager.activeFormationId = 0;
                WaveManager.formationId = 0;
            }
        }

        function placeFractalGravityPlayerForRun() {
            if (!player) return;
            if (typeof applySelectedShipToPlayer === 'function') applySelectedShipToPlayer({ heal: true });
            player.x = (typeof width === 'number' ? width : 1280) * 0.34;
            player.y = Math.min(getFractalPlayBottom(110), (typeof height === 'number' ? height : 720) * 0.56);
            player.vx = 0;
            player.vy = -30;
            player.isFiring = false;
            player.isBeaming = false;
            player.lastFire = 0;
            player.flashTimer = 0;
            player.invincibilityTimer = 0.9;
            player.beamAngle = FRACTAL_FIRE_DEFAULT_ANGLE;
            player.beamTargetAngle = player.beamAngle;
            player._renderLayoutCache = null;
        }

        function beginFractalGravityRun() {
            clearFractalGravitySharedRuntimeState();
            fractalGravityState = createFractalGravityState();
            fractalGravityState.active = true;
            fractalGravityState.startedAt = getFractalGravityNow();
            fractalGravityState.galaxyIndex = typeof currentGalaxyIndex === 'number' ? currentGalaxyIndex : -1;
            fractalGravityState.message = 'GRAVITY RUN';
            fractalGravityState.messageTimer = 3.0;

            if (typeof setActiveGameMode === 'function') setActiveGameMode(FRACTAL_GRAVITY_MODE_ID);
            placeFractalGravityPlayerForRun();
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
            if (typeof startMusic === 'function') startMusic();
            if (typeof applyCurrentVolume === 'function') applyCurrentVolume();

            gameState = 'PLAYING';
            pauseReturnState = 'PLAYING';
            titleAlpha = 0;
        }

        function isFractalGravityModeActive() {
            return !!(
                fractalGravityState &&
                fractalGravityState.active &&
                typeof getActiveGameMode === 'function' &&
                getActiveGameMode() === FRACTAL_GRAVITY_MODE_ID
            );
        }

        function resetFractalGravityRuntimeState() {
            fractalGravityState = createFractalGravityState();
            fractalGravityState.lastResetAt = getFractalGravityNow();
            if (player) {
                player.isFiring = false;
                player.isBeaming = false;
                player._renderLayoutCache = null;
            }
            return fractalGravityState;
        }

        function getFractalGravityAimAngle() {
            const input = typeof keys !== 'undefined' ? keys : null;
            let aimX = 0;
            let aimY = 0;
            if (input) {
                aimX = (input.arrowright ? 1 : 0) - (input.arrowleft ? 1 : 0);
                aimY = (input.arrowdown ? 1 : 0) - (input.arrowup ? 1 : 0);
            }
            if (aimX || aimY) return Math.atan2(aimY, aimX);
            if (player && Math.hypot(player.vx || 0, player.vy || 0) > 92) return Math.atan2(player.vy || 0, player.vx || 0);
            return FRACTAL_FIRE_DEFAULT_ANGLE;
        }

        function isFractalGravityFirePressed() {
            const input = typeof keys !== 'undefined' ? keys : null;
            return !!(input && (input.arrowup || input.arrowdown || input.arrowleft || input.arrowright));
        }

        function getFractalGravityWeaponOrigin(isRear = false) {
            if (!player) return { x: 0, y: 0 };
            const angle = getFractalGravityAimAngle();
            const side = angle + Math.PI / 2;
            const forward = isRear ? -20 : 24;
            const offset = isRear ? -5 : 0;
            return {
                x: player.x + Math.cos(angle) * forward + Math.cos(side) * offset,
                y: player.y + Math.sin(angle) * forward + Math.sin(side) * offset
            };
        }

        function getFractalGravityOrbitalDroneTarget(x, y) {
            return findNearestFractalTarget(x, y);
        }

        function updateFractalGravityRuntime(dt) {
            if (!isFractalGravityModeActive()) return;
            const safeDt = Math.max(0, Math.min(0.05, dt || 0));
            fractalGravityState.elapsed += safeDt;
            fractalGravityState.stageTime += safeDt;
            fractalGravityState.distance += safeDt * 90;
            fractalGravityState.pressure = Math.min(1, fractalGravityState.stageTime / FRACTAL_STAGE_DURATION);
            fractalGravityState.messageTimer = Math.max(0, (fractalGravityState.messageTimer || 0) - safeDt);
            fractalGravityState.playerDamageCooldown = Math.max(0, (fractalGravityState.playerDamageCooldown || 0) - safeDt);

            updateFractalStageDirector(safeDt);
            updateFractalGravityFields(safeDt);
            updateFractalPlayer(safeDt);
            updateFractalEnemies(safeDt);
            updateFractalBoss(safeDt);
            updateFractalEnemyBullets(safeDt);
            updateFractalHazards(safeDt);
            updateFractalProjectiles(safeDt);
            updateFractalBombs(safeDt);
            updateFractalPickups(safeDt);
            updateFractalParticles(safeDt);
            updateFractalStageClear(safeDt);
        }

        function updateFractalStageDirector(dt) {
            const events = FRACTAL_WAVE_EVENTS;
            while (fractalGravityState.waveEventIndex < events.length && fractalGravityState.stageTime >= events[fractalGravityState.waveEventIndex].time) {
                runFractalWaveEvent(events[fractalGravityState.waveEventIndex]);
                fractalGravityState.waveEventIndex++;
            }
            fractalGravityState.pickupTimer += dt;
            if (fractalGravityState.pickupTimer >= 18 && !fractalGravityState.stageCleared) {
                fractalGravityState.pickupTimer = 0;
                if (typeof createFocusDrop === 'function') {
                    drops.push(createFocusDrop((typeof width === 'number' ? width : 1280) * 0.55, getFractalPlayBottom(90) * 0.45, 30));
                }
            }
            if (!fractalGravityState.bossSpawned && fractalGravityState.stageTime > FRACTAL_BOSS_TIME + 7) {
                spawnFractalGravityCore();
            }
            if (!fractalGravityState.stageCleared && !boss && fractalGravityState.bossDefeated) {
                fractalGravityState.stageCleared = true;
                fractalGravityState.stageClearTimer = 0;
            }
        }

        function runFractalWaveEvent(event) {
            if (!event) return;
            if (event.kind === 'message') {
                setFractalMessage(event.text, 2.5);
            } else if (event.kind === 'well') {
                spawnFractalGravityWell(event.type, event.x, event.y, event.radius, event.strength, event.life);
            } else if (event.kind === 'wispLine') {
                spawnFractalWispLine(event.count || 4, event.side === 'bottom');
            } else if (event.kind === 'wispArc') {
                spawnFractalWispArc(event.count || 6);
            } else if (event.kind === 'skimmerPair') {
                spawnFractalSkimmer(0.16, 1);
                spawnFractalSkimmer(0.82, -1);
            } else if (event.kind === 'skimmerFan') {
                for (let i = 0; i < (event.count || 5); i++) spawnFractalSkimmer(0.18 + i * 0.14, i % 2 ? -1 : 1);
            } else if (event.kind === 'mineCluster') {
                spawnFractalMineCluster(event.count || 3);
            } else if (event.kind === 'turretPair') {
                spawnFractalAnchorTurret(0.22);
                spawnFractalAnchorTurret(0.72);
            } else if (event.kind === 'hazardRing') {
                spawnFractalHaloHazard();
            } else if (event.kind === 'boss') {
                spawnFractalGravityCore();
            }
        }

        function setFractalMessage(text, duration = 2.2) {
            fractalGravityState.message = text || '';
            fractalGravityState.messageTimer = duration;
        }

        function spawnFractalGravityWell(type, xNorm, yNorm, radius, strength, life) {
            const w = typeof width === 'number' ? width : 1280;
            const top = FRACTAL_PLAY_TOP;
            const bottom = getFractalPlayBottom(40);
            fractalGravityState.gravityWells.push({
                type: type || 'pull',
                x: clampFractal(xNorm, 0.08, 0.92) * w,
                y: top + clampFractal(yNorm, 0.08, 0.92) * (bottom - top),
                radius: radius || 150,
                strength: strength || 60,
                life: life || 12,
                maxLife: life || 12,
                spin: Math.random() * Math.PI * 2,
                pulse: Math.random() * Math.PI * 2
            });
        }

        function spawnFractalEnemy(config) {
            const enemy = {
                x: config.x,
                y: config.y,
                vx: config.vx || 0,
                vy: config.vy || 0,
                hp: config.hp || 25,
                maxHp: config.hp || 25,
                color: config.color || '#8ff7ff',
                sprite: config.sprite || ['(.)'],
                fractalType: config.type || 'haloWisp',
                isFractalEnemy: true,
                collisionRadius: config.radius || 22,
                phase: config.phase || Math.random() * Math.PI * 2,
                timer: 0,
                fireTimer: config.fireTimer || 0,
                scoreValue: config.scoreValue || 140,
                xpValue: config.xpValue || 1,
                onScreen: true,
                flashTimer: 0
            };
            enemies.push(enemy);
            return enemy;
        }

        function spawnFractalWispLine(count, bottomSide) {
            const w = typeof width === 'number' ? width : 1280;
            const top = FRACTAL_PLAY_TOP + 40;
            const bottom = getFractalPlayBottom(70);
            for (let i = 0; i < count; i++) {
                const y = bottomSide
                    ? bottom - i * 38
                    : top + i * 38;
                spawnFractalEnemy({
                    type: 'haloWisp',
                    x: w + 60 + i * 42,
                    y: clampFractal(y, top, bottom),
                    vx: -95 - i * 7,
                    vy: bottomSide ? -12 : 12,
                    hp: 18,
                    radius: 18,
                    color: i % 2 ? '#d8c8ff' : '#8ff7ff',
                    sprite: ['(.)'],
                    phase: i * 0.8
                });
            }
        }

        function spawnFractalWispArc(count) {
            const w = typeof width === 'number' ? width : 1280;
            const top = FRACTAL_PLAY_TOP + 55;
            const bottom = getFractalPlayBottom(65);
            for (let i = 0; i < count; i++) {
                const p = count <= 1 ? 0.5 : i / (count - 1);
                spawnFractalEnemy({
                    type: 'haloWisp',
                    x: w + 50 + i * 44,
                    y: top + Math.sin(p * Math.PI) * (bottom - top),
                    vx: -115,
                    vy: -42 + p * 84,
                    hp: 18,
                    radius: 17,
                    color: i % 3 === 0 ? '#ffcf6d' : '#8ff7ff',
                    sprite: ['<o>'],
                    phase: i * 0.55
                });
            }
        }

        function spawnFractalSkimmer(yNorm, direction) {
            const w = typeof width === 'number' ? width : 1280;
            const top = FRACTAL_PLAY_TOP + 38;
            const bottom = getFractalPlayBottom(58);
            spawnFractalEnemy({
                type: 'lensSkimmer',
                x: w + 88,
                y: top + clampFractal(yNorm, 0.05, 0.95) * (bottom - top),
                vx: -210,
                vy: (direction || 1) * 82,
                hp: 28,
                radius: 20,
                color: '#ffffff',
                sprite: ['/<', '=>'],
                scoreValue: 190,
                phase: Math.random() * Math.PI * 2
            });
        }

        function spawnFractalAnchorTurret(yNorm) {
            const w = typeof width === 'number' ? width : 1280;
            const top = FRACTAL_PLAY_TOP + 50;
            const bottom = getFractalPlayBottom(70);
            spawnFractalEnemy({
                type: 'anchorTurret',
                x: w + 60,
                y: top + clampFractal(yNorm, 0.08, 0.92) * (bottom - top),
                vx: -62,
                vy: 0,
                hp: 54,
                radius: 25,
                color: '#ffcf6d',
                sprite: ['[O]', '/|\\'],
                scoreValue: 260,
                fireTimer: -0.5
            });
        }

        function spawnFractalMineCluster(count) {
            const w = typeof width === 'number' ? width : 1280;
            const top = FRACTAL_PLAY_TOP + 54;
            const bottom = getFractalPlayBottom(58);
            for (let i = 0; i < count; i++) {
                spawnFractalEnemy({
                    type: 'fractalMine',
                    x: w + 80 + i * 92,
                    y: top + seededFractalNoise(fractalGravityState.stageTime + i * 8.7) * (bottom - top),
                    vx: -70 - i * 6,
                    vy: Math.sin(i) * 16,
                    hp: 36,
                    radius: 24,
                    color: '#ff8fd8',
                    sprite: ['<*>'],
                    scoreValue: 210,
                    phase: i * 1.3
                });
            }
        }

        function spawnFractalHaloHazard() {
            const w = typeof width === 'number' ? width : 1280;
            const bottom = getFractalPlayBottom(70);
            fractalGravityState.hazards.push({
                type: 'compressionLane',
                x: w + 80,
                y: FRACTAL_PLAY_TOP + 90,
                w: 72,
                h: Math.max(140, bottom - FRACTAL_PLAY_TOP - 180),
                gapY: FRACTAL_PLAY_TOP + (bottom - FRACTAL_PLAY_TOP) * 0.54,
                gapH: 150,
                vx: -95,
                age: 0,
                damage: 9,
                color: '#d8c8ff'
            });
        }

        function spawnFractalGravityCore() {
            if (fractalGravityState.bossSpawned || boss) return;
            fractalGravityState.bossSpawned = true;
            setFractalMessage('GRAVITY CORE', 3.4);
            const w = typeof width === 'number' ? width : 1280;
            boss = {
                name: 'GRAVITY CORE',
                x: w + 110,
                y: FRACTAL_PLAY_TOP + (getFractalPlayBottom(70) - FRACTAL_PLAY_TOP) * 0.48,
                targetX: w * 0.72,
                vx: -85,
                vy: 0,
                hp: 620,
                maxHp: 620,
                color: '#d8c8ff',
                coreColor: '#0a0814',
                collisionRadius: 66,
                isFractalBoss: true,
                phase: 'ACTIVE',
                timer: 0,
                attackTimer: 0,
                attackIndex: 0,
                attackName: 'lens-pulse',
                ringAngle: 0,
                pulseTimer: 0,
                flashTimer: 0
            };
        }

        function fireFractalEnemyBullet(x, y, angle, speed, options = {}) {
            enemyBullets.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                char: options.char || 'o',
                color: options.color || '#ff8fd8',
                radius: options.radius || 9,
                damage: options.damage || 8,
                life: options.life || 5.5,
                curve: options.curve || 0,
                orbitSensitive: options.orbitSensitive !== false,
                phase: options.phase || 0,
                isFractalBullet: true
            });
        }

        function getFractalAimFrom(source, speed = 240, spread = 0) {
            if (!player || !source) return { angle: FRACTAL_FIRE_DEFAULT_ANGLE, vx: 0, vy: -speed };
            const px = player.x + (player.vx || 0) * 0.18;
            const py = player.y + (player.vy || 0) * 0.18;
            const angle = Math.atan2(py - source.y, px - source.x) + spread;
            return { angle, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
        }

        function updateFractalGravityFields(dt) {
            for (let i = fractalGravityState.gravityWells.length - 1; i >= 0; i--) {
                const well = fractalGravityState.gravityWells[i];
                well.life -= dt;
                well.spin += dt * (well.type === 'orbit' ? 1.15 : 0.48) * (well.type === 'repulsor' ? -1 : 1);
                well.pulse += dt * 2.4;
                if (well.life <= 0) fractalGravityState.gravityWells.splice(i, 1);
            }
        }

        function applyFractalGravityToBody(body, dt, scale = 1, options = {}) {
            if (!body) return;
            const affectedByOrbit = options.orbit !== false;
            for (const well of fractalGravityState.gravityWells) {
                const dx = well.x - body.x;
                const dy = well.y - body.y;
                const dist = Math.max(20, Math.hypot(dx, dy));
                const radius = well.radius || 150;
                if (dist > radius) continue;
                const falloff = (1 - dist / radius);
                if (well.type === 'pull') {
                    const accel = falloff * (well.strength || 55) * scale;
                    body.vx = (body.vx || 0) + (dx / dist) * accel * dt;
                    body.vy = (body.vy || 0) + (dy / dist) * accel * dt;
                } else if (well.type === 'repulsor') {
                    const accel = falloff * (well.strength || 70) * scale;
                    body.vx = (body.vx || 0) - (dx / dist) * accel * dt;
                    body.vy = (body.vy || 0) - (dy / dist) * accel * dt;
                } else if (well.type === 'orbit' && affectedByOrbit) {
                    const tangentX = -dy / dist;
                    const tangentY = dx / dist;
                    const accel = falloff * (well.strength || 110) * scale;
                    body.vx = (body.vx || 0) + tangentX * accel * dt;
                    body.vy = (body.vy || 0) + tangentY * accel * dt;
                    body.vx += (dx / dist) * accel * 0.16 * dt;
                    body.vy += (dy / dist) * accel * 0.16 * dt;
                }
            }
        }

        function updateFractalPlayer(dt) {
            if (!player || player.hp <= 0) return;
            const input = typeof keys !== 'undefined' ? keys : {};
            let inputX = (input.d ? 1 : 0) - (input.a ? 1 : 0);
            let inputY = (input.s ? 1 : 0) - (input.w ? 1 : 0);
            if (inputX && inputY) {
                inputX *= 0.707;
                inputY *= 0.707;
            }

            const focusScale = typeof getFocusDriveScale === 'function' ? getFocusDriveScale() : 1;
            const specterScale = typeof getPlayerSpecterHitboxScale === 'function' ? getPlayerSpecterHitboxScale() : 1;
            const moveScale = typeof getPlayerMoveSpeedScale === 'function' ? getPlayerMoveSpeedScale() : 1;
            const thrust = FRACTAL_THRUST_ACCEL * moveScale * (1 + (1 - focusScale) * 0.20);
            player.vx = (player.vx || 0) + inputX * thrust * dt;
            player.vy = (player.vy || 0) + inputY * thrust * dt;
            applyFractalGravityToBody(player, dt, 3.4, { orbit: true });

            const drag = Math.exp(-FRACTAL_DRAG_PER_SEC * dt);
            player.vx *= drag;
            player.vy *= drag;
            const speed = Math.hypot(player.vx || 0, player.vy || 0);
            const maxSpeed = FRACTAL_MAX_SPEED * (1 + (player.modifiers && player.modifiers.moveSpeed || 0) * 0.25);
            if (speed > maxSpeed) {
                player.vx = player.vx / speed * maxSpeed;
                player.vy = player.vy / speed * maxSpeed;
            }

            player.x += player.vx * dt;
            player.y += player.vy * dt;
            const bottom = getFractalPlayBottom(50);
            if (player.x < FRACTAL_MARGIN_X) {
                player.x = FRACTAL_MARGIN_X;
                player.vx = Math.max(0, player.vx * -0.24);
            } else if (player.x > (typeof width === 'number' ? width : 1280) - FRACTAL_MARGIN_X) {
                player.x = (typeof width === 'number' ? width : 1280) - FRACTAL_MARGIN_X;
                player.vx = Math.min(0, player.vx * -0.24);
            }
            if (player.y < FRACTAL_PLAY_TOP) {
                player.y = FRACTAL_PLAY_TOP;
                player.vy = Math.max(0, player.vy * -0.24);
            } else if (player.y > bottom) {
                player.y = bottom;
                player.vy = Math.min(0, player.vy * -0.24);
            }

            player.isFiring = isFractalGravityFirePressed();
            // Beam upgrades still use the shared weapon stats, but this prototype degrades
            // them into forward projectiles until Fractal gets a bespoke beam path.
            player.isBeaming = false;
            const aimAngle = getFractalGravityAimAngle();
            player.beamAngle = aimAngle;
            player.beamTargetAngle = aimAngle;

            if (typeof updateFocusAbilities === 'function') updateFocusAbilities(dt, true);
            if (player.bombTimer > 0) player.bombTimer -= dt;
            if (typeof postResumeBombLockTimer === 'number' && postResumeBombLockTimer > 0) postResumeBombLockTimer = Math.max(0, postResumeBombLockTimer - dt);
            if (input[' '] && player.bombTimer <= 0 && (typeof postResumeBombLockTimer !== 'number' || postResumeBombLockTimer <= 0) && typeof fireBomb === 'function') {
                fireBomb();
            }

            const stats = player.weaponStats || (typeof createBaseWeaponStats === 'function' ? createBaseWeaponStats() : { fireRateMult: 1, mode: 'projectile' });
            const momentumFireRate = ((player.modifiers && player.modifiers.momentumFireRate) || 0) * Math.min(1, speed / maxSpeed);
            const totalFireRateBonus = ((player.modifiers && player.modifiers.fireRate) || 0) + momentumFireRate;
            const baseRate = typeof getClampedPlayerFireInterval === 'function'
                ? getClampedPlayerFireInterval((player.fireRate / stats.fireRateMult) / (1 + totalFireRateBonus))
                : 220;
            if (!player.isBeaming && player.isFiring && typeof fireCombo === 'function' && getFractalGravityNow() - player.lastFire > baseRate) {
                fireCombo(aimAngle);
            }

            updateFractalOrbitalDrones(dt, totalFireRateBonus);
            emitFractalThrusterTrail(inputX, inputY, dt, specterScale);
            if (player.invincibilityTimer > 0) player.invincibilityTimer = Math.max(0, player.invincibilityTimer - dt);
            if (player.flashTimer > 0) player.flashTimer = Math.max(0, player.flashTimer - dt);
            if (player.hp < player.maxHp && player.modifiers) {
                player.hp = Math.min(player.maxHp, player.hp + (player.modifiers.hpRegen || 0) * dt);
            }
            player._renderLayoutCache = null;
        }

        function updateFractalOrbitalDrones(dt, totalFireRateBonus) {
            if (!player || !player.weaponStats || !player.weaponStats.hasOrbitalDrones || !Array.isArray(player.drones)) return;
            for (let i = 0; i < player.drones.length; i++) {
                const drone = player.drones[i];
                drone.angle += 2.7 * dt;
                drone.x = player.x + Math.cos(drone.angle) * 45;
                drone.y = player.y + Math.sin(drone.angle) * 45;
                drone.timer -= dt;
                if (drone.timer > 0) continue;
                drone.timer = Math.max(0.20, 0.24 / Math.max(0.2, player.weaponStats.fireRateMult || 1) / (1 + totalFireRateBonus));
                const target = findNearestFractalTarget(drone.x, drone.y);
                if (!target) continue;
                const angle = Math.atan2(target.y - drone.y, target.x - drone.x);
                const speed = 900;
                comboProjectiles.push({
                    x: drone.x,
                    y: drone.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    baseVx: Math.cos(angle) * speed,
                    baseVy: Math.sin(angle) * speed,
                    startX: drone.x,
                    startY: drone.y,
                    sprite: '*',
                    color: '#d8c8ff',
                    stats: { ...player.weaponStats, sizeMult: 0.5, pierceCount: 0, splashRadius: 0, chainCount: 0, chainChance: 1, pathFunction: 'straight', homing: false, returning: false, orbitDelay: 0 },
                    life: 1.0,
                    maxLife: 1.0,
                    damage: (10 * (player.weaponStats.damageMult || 1)) * 0.32,
                    pierceHits: [],
                    pierceCount: 0
                });
            }
        }

        function emitFractalThrusterTrail(inputX, inputY, dt, specterScale) {
            if (!player || Math.random() > 0.80) return;
            const speed = Math.hypot(player.vx || 0, player.vy || 0);
            const movementAngle = speed > 40 ? Math.atan2(player.vy, player.vx) + Math.PI : getFractalGravityAimAngle() + Math.PI;
            const count = inputX || inputY ? 2 : 1;
            for (let i = 0; i < count; i++) {
                fractalGravityState.particles.push({
                    x: player.x + Math.cos(movementAngle) * 18 + (Math.random() - 0.5) * 8,
                    y: player.y + Math.sin(movementAngle) * 18 + (Math.random() - 0.5) * 8,
                    vx: Math.cos(movementAngle) * (60 + Math.random() * 90) + (Math.random() - 0.5) * 55,
                    vy: Math.sin(movementAngle) * (60 + Math.random() * 90) + (Math.random() - 0.5) * 55,
                    char: Math.random() < 0.5 ? '.' : '+',
                    color: specterScale < 0.95 ? '#d8c8ff' : '#8ff7ff',
                    life: 0.22 + Math.random() * 0.18
                });
            }
        }

        function updateFractalEnemies(dt) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                if (!enemy || !enemy.isFractalEnemy) continue;
                enemy.timer += dt;
                if (enemy.flashTimer > 0) enemy.flashTimer = Math.max(0, enemy.flashTimer - dt);

                if (enemy.fractalType === 'haloWisp') {
                    enemy.vy += Math.sin(fractalGravityState.stageTime * 2.0 + enemy.phase) * 24 * dt;
                    applyFractalGravityToBody(enemy, dt, 1.2, { orbit: true });
                } else if (enemy.fractalType === 'lensSkimmer') {
                    enemy.vy += Math.sin(enemy.timer * 3.2 + enemy.phase) * 74 * dt;
                    enemy.fireTimer += dt;
                    if (enemy.fireTimer > 1.8) {
                        enemy.fireTimer = 0;
                        const shot = getFractalAimFrom(enemy, 250);
                        fireFractalEnemyBullet(enemy.x, enemy.y, shot.angle, 250, { char: '.', color: '#ffcf6d', radius: 8, curve: 0.10 });
                    }
                } else if (enemy.fractalType === 'anchorTurret') {
                    enemy.vx *= Math.pow(0.82, dt * 60);
                    enemy.y += Math.sin(enemy.timer * 0.85 + enemy.phase) * 12 * dt;
                    enemy.fireTimer += dt;
                    if (enemy.fireTimer > 1.35) {
                        enemy.fireTimer = 0;
                        const base = getFractalAimFrom(enemy, 220);
                        for (let s = -1; s <= 1; s++) {
                            fireFractalEnemyBullet(enemy.x, enemy.y, base.angle + s * 0.16, 220, { char: 'o', color: s ? '#d8c8ff' : '#ffffff', radius: 9, curve: 0.18 });
                        }
                    }
                } else if (enemy.fractalType === 'fractalMine') {
                    enemy.vy += Math.sin(enemy.timer * 3.4 + enemy.phase) * 18 * dt;
                    applyFractalGravityToBody(enemy, dt, 0.5, { orbit: true });
                    if (enemy.timer > 0.8 && enemy.timer < 5.8 && Math.random() < dt * 0.8) {
                        fractalGravityState.particles.push({
                            x: enemy.x + (Math.random() - 0.5) * 60,
                            y: enemy.y + (Math.random() - 0.5) * 60,
                            vx: (enemy.x - player.x) * 0.05,
                            vy: (enemy.y - player.y) * 0.05,
                            char: '.',
                            color: '#ff8fd8',
                            life: 0.24
                        });
                    }
                }

                enemy.x += (enemy.vx || 0) * dt;
                enemy.y += (enemy.vy || 0) * dt;
                if (isFractalCircleTouchingPlayer(enemy.x, enemy.y, enemy.collisionRadius || 18)) damageFractalPlayer(enemy.fractalType === 'fractalMine' ? 14 : 10);
                if (enemy.x < -120 || enemy.x > (typeof width === 'number' ? width : 1280) + 180 || enemy.y < -120 || enemy.y > (typeof height === 'number' ? height : 720) + 120) {
                    enemies.splice(i, 1);
                }
            }
        }

        function updateFractalBoss(dt) {
            if (!boss || !boss.isFractalBoss) return;
            boss.timer += dt;
            boss.attackTimer += dt;
            boss.ringAngle += dt * (0.42 + (1 - boss.hp / boss.maxHp) * 0.5);
            if (boss.flashTimer > 0) boss.flashTimer = Math.max(0, boss.flashTimer - dt);
            const w = typeof width === 'number' ? width : 1280;
            const bottom = getFractalPlayBottom(80);
            boss.x += ((boss.targetX || w * 0.72) - boss.x) * Math.min(1, dt * 0.9);
            boss.y += Math.sin(boss.timer * 0.72) * 26 * dt;
            boss.y = clampFractal(boss.y, FRACTAL_PLAY_TOP + 82, bottom - 70);

            if (boss.attackTimer >= getFractalBossAttackDuration(boss)) {
                boss.attackTimer = 0;
                boss.attackIndex = (boss.attackIndex + 1) % 4;
                boss.attackName = ['lens-pulse', 'orbit-cage', 'aimed-lances', 'repulse-tide'][boss.attackIndex];
                setFractalMessage(boss.attackName.toUpperCase(), 1.5);
            }

            if (boss.attackName === 'lens-pulse') updateFractalBossLensPulse(dt);
            else if (boss.attackName === 'orbit-cage') updateFractalBossOrbitCage(dt);
            else if (boss.attackName === 'aimed-lances') updateFractalBossAimedLances(dt);
            else updateFractalBossRepulseTide(dt);

            if (isFractalCircleTouchingPlayer(boss.x, boss.y, boss.collisionRadius || 66)) damageFractalPlayer(18);
        }

        function getFractalBossAttackDuration(bossObj) {
            if (!bossObj) return 3.2;
            return bossObj.attackName === 'orbit-cage' ? 4.0 : (bossObj.attackName === 'repulse-tide' ? 3.8 : 3.2);
        }

        function updateFractalBossLensPulse(dt) {
            if (!boss) return;
            boss.pulseTimer = (boss.pulseTimer || 0) + dt;
            if (boss.pulseTimer >= 0.62) {
                boss.pulseTimer = 0;
                const base = getFractalAimFrom(boss, 230);
                fireFractalEnemyBullet(boss.x - 26, boss.y, base.angle, 230, { char: 'o', color: '#ffffff', radius: 10, curve: 0.06 });
                fireFractalEnemyBullet(boss.x - 26, boss.y, base.angle + 0.20, 210, { char: '.', color: '#8ff7ff', radius: 8, curve: 0.10 });
                fireFractalEnemyBullet(boss.x - 26, boss.y, base.angle - 0.20, 210, { char: '.', color: '#ffcf6d', radius: 8, curve: -0.10 });
            }
        }

        function updateFractalBossOrbitCage(dt) {
            if (!boss) return;
            boss.pulseTimer = (boss.pulseTimer || 0) + dt;
            if (boss.pulseTimer >= 0.34) {
                boss.pulseTimer = 0;
                const spokes = 6;
                const base = boss.ringAngle;
                for (let i = 0; i < spokes; i++) {
                    const angle = base + i * Math.PI * 2 / spokes;
                    fireFractalEnemyBullet(boss.x, boss.y, angle, 150, { char: '*', color: i % 2 ? '#d8c8ff' : '#8ff7ff', radius: 9, curve: 0.28, life: 6.2 });
                }
            }
        }

        function updateFractalBossAimedLances(dt) {
            if (!boss) return;
            boss.pulseTimer = (boss.pulseTimer || 0) + dt;
            if (boss.pulseTimer >= 0.95) {
                boss.pulseTimer = 0;
                const base = getFractalAimFrom(boss, 315).angle;
                for (let i = -2; i <= 2; i++) {
                    fireFractalEnemyBullet(boss.x - 48, boss.y + i * 12, base + i * 0.045, 315, { char: '-', color: '#ff8fd8', radius: 7, curve: 0.05, damage: 9 });
                }
            }
        }

        function updateFractalBossRepulseTide(dt) {
            if (!boss) return;
            boss.pulseTimer = (boss.pulseTimer || 0) + dt;
            if (boss.pulseTimer >= 1.15) {
                boss.pulseTimer = 0;
                spawnFractalGravityWell('repulsor', boss.x / (typeof width === 'number' ? width : 1280), (boss.y - FRACTAL_PLAY_TOP) / Math.max(1, getFractalPlayBottom(60) - FRACTAL_PLAY_TOP), 156, 95, 4.4);
                for (let i = 0; i < 10; i++) {
                    const angle = i * Math.PI * 2 / 10 + boss.ringAngle;
                    fireFractalEnemyBullet(boss.x, boss.y, angle, 178, { char: i % 2 ? ')' : '(', color: '#ffcf6d', radius: 9, curve: -0.16, life: 5.0 });
                }
                if (typeof addShake === 'function') addShake(8);
            }
        }

        function updateFractalEnemyBullets(dt) {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i];
                if (!b || !b.isFractalBullet) {
                    enemyBullets.splice(i, 1);
                    continue;
                }
                if (b.curve) {
                    const speed = Math.max(80, Math.hypot(b.vx || 0, b.vy || 0));
                    const angle = Math.atan2(b.vy || 0, b.vx || 0) + b.curve * dt;
                    b.vx = Math.cos(angle) * speed;
                    b.vy = Math.sin(angle) * speed;
                }
                applyFractalGravityToBody(b, dt, b.orbitSensitive ? 1.3 : 0.35, { orbit: true });
                b.x += (b.vx || 0) * dt;
                b.y += (b.vy || 0) * dt;
                b.life -= dt;
                if (isFractalCircleTouchingPlayer(b.x, b.y, b.radius || 9)) {
                    damageFractalPlayer(b.damage || 8);
                    enemyBullets.splice(i, 1);
                    continue;
                }
                if (b.life <= 0 || b.x < -80 || b.x > (typeof width === 'number' ? width : 1280) + 90 || b.y < -80 || b.y > (typeof height === 'number' ? height : 720) + 90) {
                    enemyBullets.splice(i, 1);
                }
            }
        }

        function updateFractalHazards(dt) {
            for (let i = fractalGravityState.hazards.length - 1; i >= 0; i--) {
                const h = fractalGravityState.hazards[i];
                h.age += dt;
                h.x += (h.vx || 0) * dt;
                if (h.type === 'compressionLane') {
                    const topRect = { x: h.x, y: h.y, w: h.w, h: Math.max(0, h.gapY - h.gapH / 2 - h.y) };
                    const bottomY = h.gapY + h.gapH / 2;
                    const bottomRect = { x: h.x, y: bottomY, w: h.w, h: Math.max(0, h.y + h.h - bottomY) };
                    if (isFractalPlayerTouchingRect(topRect) || isFractalPlayerTouchingRect(bottomRect)) damageFractalPlayer(h.damage || 9);
                }
                if (h.x + (h.w || 80) < -90) fractalGravityState.hazards.splice(i, 1);
            }
        }

        function updateFractalProjectiles(dt) {
            for (let i = comboProjectiles.length - 1; i >= 0; i--) {
                const p = comboProjectiles[i];
                if (!p) {
                    comboProjectiles.splice(i, 1);
                    continue;
                }
                if (p.releaseDelay > 0) {
                    p.releaseDelay -= dt;
                    continue;
                }
                const stats = p.stats || {};
                p.age = (p.age || 0) + dt;
                p.life = (p.life || 0) - dt;
                if ((p.orbitTime || 0) > 0 && player) {
                    p.orbitTime = Math.max(0, p.orbitTime - dt);
                    p.orbitAngle += (p.orbitSpin || 8) * dt;
                    const radius = p.orbitRadius || 34;
                    p.x = player.x + Math.cos(p.orbitAngle) * radius;
                    p.y = player.y + Math.sin(p.orbitAngle) * radius;
                    if (p.orbitTime <= 0) {
                        const angle = Number.isFinite(p.releaseAngle) ? p.releaseAngle : getFractalGravityAimAngle();
                        const speed = p.releaseSpeed || Math.max(420, Math.hypot(p.baseVx || 0, p.baseVy || 0));
                        p.baseVx = Math.cos(angle) * speed;
                        p.baseVy = Math.sin(angle) * speed;
                    }
                } else {
                    if (stats.homing) steerFractalProjectileTowardTarget(p, dt);
                    if (stats.returning && !p.hasReturned && p.age >= (stats.returnAfter || 0.55) && player) {
                        p.hasReturned = true;
                        const angle = Math.atan2(player.y - p.y, player.x - p.x);
                        const speed = Math.max(420, Math.hypot(p.baseVx || p.vx || 0, p.baseVy || p.vy || 0));
                        p.baseVx = Math.cos(angle) * speed;
                        p.baseVy = Math.sin(angle) * speed;
                    }
                    if (stats.pathFunction === 'sine') {
                        const t = p.age;
                        const linearX = p.startX + (p.baseVx || 0) * t;
                        const linearY = p.startY + (p.baseVy || 0) * t;
                        const launchAngle = Math.atan2(p.baseVy || p.vy || -1, p.baseVx || p.vx || 0);
                        const side = launchAngle + Math.PI / 2;
                        const offset = Math.sin(t * 15) * 26 * (stats.sineAmplitudeMult || 1);
                        p.x = linearX + Math.cos(side) * offset;
                        p.y = linearY + Math.sin(side) * offset;
                    } else {
                        p.x += (p.baseVx || p.vx || 0) * dt;
                        p.y += (p.baseVy || p.vy || 0) * dt;
                    }
                    if (stats.plasmaCloud) applyFractalGravityToBody(p, dt, 0.15, { orbit: true });
                }
                if (typeof applyWakeForce === 'function') applyWakeForce(p.x, p.y, stats.plasmaCloud ? 52 : 28, 2.4);
                if (resolveFractalProjectileHits(p)) {
                    comboProjectiles.splice(i, 1);
                    continue;
                }
                const torpedoRange = stats.torpedoRange || 0;
                const expiredTorpedo = stats.miniTorpedo && torpedoRange > 0
                    && (p.x - p.startX) * (p.x - p.startX) + (p.y - p.startY) * (p.y - p.startY) >= torpedoRange * torpedoRange;
                if (expiredTorpedo) {
                    applyFractalSplash(p.x, p.y, stats.torpedoExplosionRadius || 74, p.damage * (stats.torpedoExplosionDamageMult || 0.85));
                    emitFractalSparks(p.x, p.y, p.color || '#ffcf6d', 16);
                }
                if (p.life <= 0 || expiredTorpedo || p.x < -100 || p.x > (typeof width === 'number' ? width : 1280) + 120 || p.y < -100 || p.y > (typeof height === 'number' ? height : 720) + 120) {
                    comboProjectiles.splice(i, 1);
                }
            }
        }

        function steerFractalProjectileTowardTarget(projectile, dt) {
            const target = findNearestFractalTarget(projectile.x, projectile.y);
            if (!target) return;
            const speed = Math.max(120, Math.hypot(projectile.baseVx || projectile.vx || 0, projectile.baseVy || projectile.vy || 0));
            const dx = target.x - projectile.x;
            const dy = target.y - projectile.y;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const desiredVx = (dx / dist) * speed;
            const desiredVy = (dy / dist) * speed;
            const turn = Math.min(1, ((projectile.stats && projectile.stats.homingStrength) || 1) * dt * 2.1);
            projectile.baseVx = (projectile.baseVx || 0) + (desiredVx - (projectile.baseVx || 0)) * turn;
            projectile.baseVy = (projectile.baseVy || 0) + (desiredVy - (projectile.baseVy || 0)) * turn;
        }

        function findNearestFractalTarget(x, y) {
            let target = boss && boss.isFractalBoss ? boss : null;
            let best = target ? (target.x - x) * (target.x - x) + (target.y - y) * (target.y - y) : Infinity;
            for (const enemy of enemies) {
                if (!enemy || !enemy.isFractalEnemy) continue;
                const d = (enemy.x - x) * (enemy.x - x) + (enemy.y - y) * (enemy.y - y);
                if (d < best) {
                    best = d;
                    target = enemy;
                }
            }
            return target;
        }

        function resolveFractalProjectileHits(projectile) {
            const stats = projectile.stats || {};
            if (!Array.isArray(projectile.pierceHits)) projectile.pierceHits = [];
            const radius = typeof getComboProjectileHitboxRadius === 'function'
                ? getComboProjectileHitboxRadius(projectile)
                : 12 * (stats.sizeMult || 1);
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                if (!enemy || !enemy.isFractalEnemy || projectile.pierceHits.includes(enemy)) continue;
                if (doesFractalProjectileHit(projectile, enemy, radius)) {
                    damageFractalTarget(enemy, projectile, i);
                    if (!stats.plasmaCloud && (stats.miniTorpedo || projectile.pierceCount-- <= 0)) return true;
                }
            }
            if (boss && boss.isFractalBoss && !projectile.pierceHits.includes(boss) && doesFractalProjectileHit(projectile, boss, radius)) {
                damageFractalTarget(boss, projectile, -1);
                if (!stats.plasmaCloud && (stats.miniTorpedo || projectile.pierceCount-- <= 0)) return true;
            }
            return false;
        }

        function doesFractalProjectileHit(projectile, target, radius) {
            if (target && target.isFractalBoss) {
                return Math.hypot(projectile.x - target.x, projectile.y - target.y) < radius + (target.collisionRadius || 66);
            }
            if (typeof doesProjectileHitTargetMask === 'function') return doesProjectileHitTargetMask(projectile, target, radius);
            return Math.hypot(projectile.x - target.x, projectile.y - target.y) < radius + (target.collisionRadius || 22);
        }

        function damageFractalTarget(target, projectile, enemyIndex) {
            if (!target || !projectile) return;
            const stats = projectile.stats || {};
            const damage = stats.plasmaCloud
                ? projectile.damage * (stats.cloudDotMult || 6) * 0.05
                : projectile.damage;
            target.hp -= damage;
            target.flashTimer = 0.14;
            projectile.pierceHits.push(target);
            if (stats.splashRadius > 0) applyFractalSplash(projectile.x, projectile.y, stats.splashRadius * 22, projectile.damage * (stats.splashDamagePercent || 0.5));
            if (stats.miniTorpedo) applyFractalSplash(projectile.x, projectile.y, stats.torpedoExplosionRadius || 74, projectile.damage * (stats.torpedoExplosionDamageMult || 0.85));
            emitFractalSparks(projectile.x, projectile.y, target.color || projectile.color || '#ffffff', 3);
            if (target.hp <= 0) {
                if (target === boss) defeatFractalBoss();
                else explodeFractalEnemy(target, enemyIndex);
            }
        }

        function updateFractalBombs(dt) {
            for (let i = bombProjectiles.length - 1; i >= 0; i--) {
                const bombObj = bombProjectiles[i];
                if (bombObj.justFired) {
                    bombObj.justFired = false;
                    continue;
                }
                bombObj.age = (bombObj.age || 0) + dt;
                applyFractalGravityToBody(bombObj, dt, 0.65, { orbit: true });
                bombObj.x += (bombObj.vx || 0) * dt;
                bombObj.y += (bombObj.vy || 0) * dt;
                bombObj.distance = Math.hypot(bombObj.x - bombObj.startX, bombObj.y - bombObj.startY);
                fractalGravityState.particles.push({
                    x: bombObj.x + (Math.random() - 0.5) * 8,
                    y: bombObj.y + (Math.random() - 0.5) * 8,
                    vx: (Math.random() - 0.5) * 80,
                    vy: (Math.random() - 0.5) * 80,
                    char: '*',
                    color: '#ffcf6d',
                    life: 0.24
                });
                let shouldExplode = bombObj.forceDetonate || bombObj.distance >= bombObj.maxDistance;
                if (!shouldExplode) {
                    const target = findNearestFractalTarget(bombObj.x, bombObj.y);
                    if (target && Math.hypot(target.x - bombObj.x, target.y - bombObj.y) < (target.collisionRadius || 28) + 18) shouldExplode = true;
                }
                if (shouldExplode || bombObj.x < -80 || bombObj.x > (typeof width === 'number' ? width : 1280) + 80 || bombObj.y < -80 || bombObj.y > (typeof height === 'number' ? height : 720) + 80) {
                    explodeFractalBomb(bombObj.x, bombObj.y);
                    bombProjectiles.splice(i, 1);
                }
            }
            for (let i = bombBlastRings.length - 1; i >= 0; i--) {
                const ring = bombBlastRings[i];
                ring.life += dt;
                if (ring.life >= ring.maxLife) bombBlastRings.splice(i, 1);
            }
        }

        function updateFractalPickups(dt) {
            if (!player) return;
            const magnetRangeSq = 22500 * (1 + ((player.modifiers && player.modifiers.magnet) || 0));
            for (let i = xpOrbs.length - 1; i >= 0; i--) {
                const orb = xpOrbs[i];
                const dx = player.x - orb.x;
                const dy = player.y - orb.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < magnetRangeSq) {
                    const dist = Math.max(1, Math.sqrt(distSq));
                    orb.vx = (dx / dist) * 820;
                    orb.vy = (dy / dist) * 820;
                } else {
                    applyFractalGravityToBody(orb, dt, 0.18, { orbit: true });
                    orb.vx = (orb.vx || 0) * 0.96;
                    orb.vy = (orb.vy || 0) * 0.96;
                }
                orb.x += (orb.vx || 0) * dt;
                orb.y += (orb.vy || 0) * dt;
                if (distSq < 1600) {
                    const xpValue = orb.xpValue || 1;
                    const xpGainBonus = 1 + ((player.modifiers && player.modifiers.xpGain) || 0);
                    player.xp += xpValue * xpGainBonus;
                    if (player.modifiers && player.modifiers.xpHeal > 0 && player.hp < player.maxHp) {
                        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * player.modifiers.xpHeal * Math.max(1, xpValue));
                    }
                    if (player.xp >= player.xpNeeded && !boss && !fractalGravityState.stageCleared) {
                        player.xp -= player.xpNeeded;
                        player.level++;
                        player.xpNeeded = typeof getXpNeededForLevel === 'function' ? getXpNeededForLevel(player.level) : player.xpNeeded + 12;
                        if (typeof beginLevelUpOffer === 'function') beginLevelUpOffer({ returnState: 'PLAYING' });
                    }
                    xpOrbs.splice(i, 1);
                    if (typeof addScore === 'function') addScore(50);
                } else if (orb.x < -80 || orb.x > (typeof width === 'number' ? width : 1280) + 80 || orb.y < -80 || orb.y > (typeof height === 'number' ? height : 720) + 80) {
                    xpOrbs.splice(i, 1);
                }
            }
            for (let i = drops.length - 1; i >= 0; i--) {
                const d = drops[i];
                applyFractalGravityToBody(d, dt, 0.12, { orbit: true });
                d.x += (d.vx || 0) * dt;
                d.y += (d.vy || 0) * dt;
                const dx = d.x - player.x;
                const dy = d.y - player.y;
                if (dx * dx + dy * dy < 3600) {
                    if (d.isHealth) {
                        player.hp = Math.min(player.maxHp, player.hp + Math.ceil(player.maxHp * (d.healFraction || 0.10)));
                    } else if (d.isFocus) {
                        const focusMax = typeof getFocusMeterMax === 'function' ? getFocusMeterMax() : (typeof FOCUS_METER_MAX === 'number' ? FOCUS_METER_MAX : 100);
                        focusMeter = Math.min(focusMax, focusMeter + (d.focusAmount || (typeof FOCUS_ELITE_DROP_AMOUNT === 'number' ? FOCUS_ELITE_DROP_AMOUNT : 25)));
                    }
                    drops.splice(i, 1);
                    if (typeof addShake === 'function') addShake(10);
                } else if (d.x < -80 || d.x > (typeof width === 'number' ? width : 1280) + 80 || d.y < -80 || d.y > (typeof height === 'number' ? height : 720) + 80) {
                    drops.splice(i, 1);
                }
            }
        }

        function updateFractalParticles(dt) {
            for (let i = fractalGravityState.particles.length - 1; i >= 0; i--) {
                const p = fractalGravityState.particles[i];
                applyFractalGravityToBody(p, dt, 0.10, { orbit: true });
                p.x += (p.vx || 0) * dt;
                p.y += (p.vy || 0) * dt;
                p.life -= dt;
                if (p.life <= 0) fractalGravityState.particles.splice(i, 1);
            }
            for (let i = debris.length - 1; i >= 0; i--) {
                const d = debris[i];
                applyFractalGravityToBody(d, dt, 0.10, { orbit: true });
                d.x += (d.vx || 0) * dt;
                d.y += (d.vy || 0) * dt;
                d.vx *= 0.98;
                d.vy *= 0.98;
                d.life -= dt * 0.9;
                if (d.life <= 0 || d.x < -100 || d.x > (typeof width === 'number' ? width : 1280) + 100) debris.splice(i, 1);
            }
        }

        function updateFractalStageClear(dt) {
            if (!fractalGravityState.stageCleared) return;
            fractalGravityState.stageClearTimer += dt;
            fractalGravityState.message = 'GRAVITY RUN CLEAR';
            fractalGravityState.messageTimer = Math.max(fractalGravityState.messageTimer, 1);
            if (fractalGravityState.stageClearTimer > FRACTAL_STAGE_CLEAR_DELAY && enemyBullets.length > 0) {
                enemyBullets.length = 0;
            }
        }

        function explodeFractalEnemy(enemy, enemyIndex) {
            if (!enemy) return;
            if (typeof explodeEnemy === 'function') explodeEnemy(enemy);
            else emitFractalSparks(enemy.x, enemy.y, enemy.color || '#8ff7ff', 10);
            if (enemyIndex >= 0) enemies.splice(enemyIndex, 1);
            if (typeof addScore === 'function') addScore(enemy.scoreValue || 140);
        }

        function applyFractalSplash(x, y, radius, damage) {
            const r = Math.max(16, radius || 70);
            const d = Math.max(1, damage || 1);
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                if (!enemy || !enemy.isFractalEnemy) continue;
                const dist = Math.hypot(enemy.x - x, enemy.y - y);
                if (dist <= r + (enemy.collisionRadius || 18)) {
                    const falloff = 1 - Math.min(0.72, dist / Math.max(1, r) * 0.55);
                    enemy.hp -= d * falloff;
                    enemy.flashTimer = 0.12;
                    if (enemy.hp <= 0) explodeFractalEnemy(enemy, i);
                }
            }
            if (boss && boss.isFractalBoss) {
                const dist = Math.hypot(boss.x - x, boss.y - y);
                if (dist <= r + (boss.collisionRadius || 66)) {
                    const falloff = 1 - Math.min(0.72, dist / Math.max(1, r) * 0.55);
                    boss.hp -= d * falloff;
                    boss.flashTimer = 0.12;
                    if (boss.hp <= 0) defeatFractalBoss();
                }
            }
        }

        function explodeFractalBomb(x, y) {
            const radius = typeof BOMB_EXPLOSION_RADIUS === 'number'
                ? BOMB_EXPLOSION_RADIUS * (1 + ((player && player.modifiers && player.modifiers.bombRadius) || 0))
                : 150;
            const damage = typeof BOMB_EXPLOSION_DAMAGE === 'number'
                ? BOMB_EXPLOSION_DAMAGE * (1 + ((player && player.modifiers && player.modifiers.bombDamage) || 0))
                : 55;
            applyFractalSplash(x, y, radius, damage);
            emitFractalSparks(x, y, '#ffcf6d', 34);
            if (typeof addShake === 'function') addShake(16);
            bombBlastRings.push({
                x,
                y,
                life: 0,
                maxLife: 0.48,
                maxRadius: radius * 1.12,
                color: '#ffcf6d',
                lineWidth: 4
            });
        }

        function defeatFractalBoss() {
            if (!boss) return;
            const defeated = boss;
            boss = null;
            fractalGravityState.bossDefeated = true;
            fractalGravityState.stageCleared = true;
            fractalGravityState.stageClearTimer = 0;
            fractalGravityState.message = 'GRAVITY CORE COLLAPSED';
            fractalGravityState.messageTimer = 6;
            emitFractalSparks(defeated.x, defeated.y, '#d8c8ff', 72);
            if (typeof explodeEnemy === 'function') explodeEnemy(defeated);
            if (typeof addShake === 'function') addShake(30);
            if (typeof addScore === 'function') addScore(12000, false);
        }

        function emitFractalSparks(x, y, color, count) {
            const cap = 170;
            for (let i = 0; i < count && fractalGravityState.particles.length < cap; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 45 + Math.random() * 240;
                fractalGravityState.particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    char: i % 3 === 0 ? '+' : (i % 3 === 1 ? '*' : '.'),
                    color: color || '#ffffff',
                    life: 0.22 + Math.random() * 0.42
                });
            }
        }

        function isFractalCircleTouchingPlayer(x, y, radius) {
            if (!player || player.hp <= 0 || gameState !== 'PLAYING') return false;
            const scale = typeof getPlayerSpecterHitboxScale === 'function' ? getPlayerSpecterHitboxScale() : 1;
            return Math.hypot(player.x - x, player.y - y) < radius + FRACTAL_PLAYER_RADIUS * scale;
        }

        function isFractalPlayerTouchingRect(rect) {
            if (!player || !rect) return false;
            const radius = FRACTAL_PLAYER_RADIUS * (typeof getPlayerSpecterHitboxScale === 'function' ? getPlayerSpecterHitboxScale() : 1);
            const nearestX = Math.max(rect.x, Math.min(rect.x + rect.w, player.x));
            const nearestY = Math.max(rect.y, Math.min(rect.y + rect.h, player.y));
            return Math.hypot(player.x - nearestX, player.y - nearestY) < radius;
        }

        function damageFractalPlayer(amount) {
            if (!player || player.godMode || fractalGravityState.playerDamageCooldown > 0 || gameState !== 'PLAYING') return;
            if (player.invincibilityTimer > 0) return;
            player.hp -= Math.max(1, amount || 1);
            player.invincibilityTimer = 0.72;
            player.flashTimer = 0.42;
            fractalGravityState.playerDamageCooldown = 0.46;
            if (typeof addShake === 'function') addShake(11);
            emitFractalSparks(player.x, player.y, '#ffffff', 8);
            if (player.hp <= 0) {
                player.hp = 0;
                deathTimer = 0;
                playerExploded = false;
                gameState = 'DYING';
            }
        }

        function drawFractalGravityRuntime(now) {
            if (!isFractalGravityModeActive()) return;
            const t = (Number.isFinite(now) ? now : getFractalGravityNow()) * 0.001;
            ctx.save();
            drawFractalBackground(t);
            drawFractalGravityFields(t);
            drawFractalHazards(t);
            drawFractalPickups();
            drawFractalProjectiles(t);
            drawFractalEnemies(t);
            drawFractalBoss(t);
            drawFractalEnemyBullets(t);
            drawFractalParticles();
            drawFractalPlayer(now);
            drawFractalMessages();
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawFractalBackground(t) {
            const w = typeof width === 'number' ? width : 1280;
            const h = typeof height === 'number' ? height : 720;
            ctx.fillStyle = '#030611';
            ctx.fillRect(0, 0, w, h);
            const cx = w * 0.66 + Math.sin(t * 0.11) * 34;
            const cy = h * 0.34 + Math.cos(t * 0.09) * 22;
            const bg = ctx.createRadialGradient(cx, cy, 8, cx, cy, Math.max(250, w * 0.32));
            bg.addColorStop(0, 'rgba(255,255,255,0.11)');
            bg.addColorStop(0.22, 'rgba(143,247,255,0.10)');
            bg.addColorStop(0.50, 'rgba(216,200,255,0.07)');
            bg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const star of fractalGravityState.stars) {
                star.x -= (8 + star.depth * 26) * 0.016;
                if (star.x < -20) star.x = w + 20;
                ctx.globalAlpha = star.alpha * (0.65 + Math.sin(t * (0.7 + star.depth) + star.wobble) * 0.18);
                ctx.fillStyle = star.color;
                ctx.font = `bold ${Math.max(8, Math.round(8 + star.depth * 5))}px Courier New`;
                ctx.fillText(star.glyph, star.x | 0, star.y | 0);
            }
            ctx.globalAlpha = 0.15;
            ctx.strokeStyle = '#8ff7ff';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                const y = FRACTAL_PLAY_TOP + 60 + i * 86 + Math.sin(t * 0.24 + i) * 14;
                ctx.moveTo(-20, y);
                for (let x = 0; x <= w + 40; x += 90) {
                    ctx.lineTo(x, y + Math.sin(t * 0.5 + i + x * 0.01) * 18);
                }
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        function drawFractalGravityFields(t) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            for (const well of fractalGravityState.gravityWells) {
                const lifeRatio = clampFractal(well.life / Math.max(0.1, well.maxLife), 0, 1);
                const pulse = 0.5 + Math.sin(well.pulse) * 0.5;
                const color = well.type === 'pull' ? '#8ff7ff' : (well.type === 'repulsor' ? '#ffcf6d' : '#d8c8ff');
                const radius = well.radius * (0.92 + pulse * 0.04);
                ctx.globalAlpha = 0.18 * lifeRatio;
                const grad = ctx.createRadialGradient(well.x, well.y, 4, well.x, well.y, radius);
                grad.addColorStop(0, 'rgba(255,255,255,0.12)');
                grad.addColorStop(0.38, colorWithAlpha(color, 0.18));
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(well.x - radius, well.y - radius, radius * 2, radius * 2);
                ctx.globalAlpha = (0.34 + pulse * 0.20) * lifeRatio;
                ctx.strokeStyle = color;
                ctx.lineWidth = well.type === 'orbit' ? 2 : 1;
                for (let r = 0; r < 3; r++) {
                    ctx.save();
                    ctx.translate(well.x, well.y);
                    ctx.rotate(well.spin + r * 0.72);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, radius * (0.34 + r * 0.22), radius * (0.12 + r * 0.07), 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawFractalSprite(sprite, x, y, color, scale = 1, flashTimer = 0) {
            if (!sprite || !sprite.length) return;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.round(15 * scale)}px Courier New`;
            ctx.fillStyle = flashTimer > 0 ? '#ffffff' : color;
            ctx.shadowColor = color;
            ctx.shadowBlur = typeof getLiveGlowBlur === 'function'
                ? getLiveGlowBlur(6, 'normal', 1, 0.22)
                : (glowEnabled ? 6 : 0);
            const lineH = 15 * scale;
            for (let r = 0; r < sprite.length; r++) {
                ctx.fillText(sprite[r], x, y + (r - (sprite.length - 1) / 2) * lineH);
            }
            ctx.restore();
        }

        function drawFractalHazards(t) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const h of fractalGravityState.hazards) {
                if (h.type !== 'compressionLane') continue;
                const pulse = 0.36 + Math.sin(t * 4 + h.age) * 0.12;
                ctx.fillStyle = `rgba(216, 200, 255, ${0.08 + pulse * 0.06})`;
                ctx.strokeStyle = h.color || '#d8c8ff';
                const topH = Math.max(0, h.gapY - h.gapH / 2 - h.y);
                const bottomY = h.gapY + h.gapH / 2;
                ctx.fillRect(h.x, h.y, h.w, topH);
                ctx.fillRect(h.x, bottomY, h.w, Math.max(0, h.y + h.h - bottomY));
                ctx.strokeRect(h.x, h.y, h.w, topH);
                ctx.strokeRect(h.x, bottomY, h.w, Math.max(0, h.y + h.h - bottomY));
                ctx.font = 'bold 12px Courier New';
                ctx.fillStyle = '#ffffff';
                for (let y = h.y + 16; y < h.y + topH; y += 30) ctx.fillText('F(x)', h.x + h.w / 2, y);
                for (let y = bottomY + 16; y < h.y + h.h; y += 30) ctx.fillText('dx', h.x + h.w / 2, y);
            }
            ctx.restore();
        }

        function drawFractalEnemies(t) {
            for (const enemy of enemies) {
                if (!enemy || !enemy.isFractalEnemy) continue;
                const pulse = enemy.fractalType === 'fractalMine' ? 1 + Math.sin(t * 5 + enemy.phase) * 0.09 : 1;
                drawFractalSprite(enemy.sprite, enemy.x, enemy.y, enemy.color, pulse, enemy.flashTimer || 0);
                if (enemy.fractalType === 'fractalMine') {
                    ctx.save();
                    ctx.globalAlpha = 0.22 + Math.sin(t * 5 + enemy.phase) * 0.08;
                    ctx.strokeStyle = '#ff8fd8';
                    ctx.beginPath();
                    ctx.arc(enemy.x, enemy.y, 32 + Math.sin(t * 4 + enemy.phase) * 5, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        function drawFractalBoss(t) {
            if (!boss || !boss.isFractalBoss) return;
            const healthRatio = Math.max(0, boss.hp / boss.maxHp);
            const rage = 1 - healthRatio;
            const r = 58 + Math.sin(t * 1.5) * 3;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const halo = ctx.createRadialGradient(boss.x, boss.y, 6, boss.x, boss.y, r * 3.2);
            halo.addColorStop(0, `rgba(255,255,255,${0.10 + rage * 0.04})`);
            halo.addColorStop(0.30, `rgba(216,200,255,${0.20 + rage * 0.08})`);
            halo.addColorStop(0.62, 'rgba(143,247,255,0.08)');
            halo.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = halo;
            ctx.fillRect(boss.x - r * 3.4, boss.y - r * 3.4, r * 6.8, r * 6.8);
            ctx.translate(boss.x, boss.y);
            for (let i = 0; i < 5; i++) {
                ctx.save();
                ctx.rotate(boss.ringAngle * (i % 2 ? -1 : 1) + i * 0.58);
                ctx.strokeStyle = i % 2 ? `rgba(143,247,255,${0.28 - i * 0.025})` : `rgba(255,207,109,${0.24 - i * 0.018})`;
                ctx.lineWidth = i === 1 ? 3 : 1.5;
                ctx.beginPath();
                ctx.ellipse(0, 0, r * (1.15 + i * 0.16), r * (0.28 + i * 0.035), 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = boss.flashTimer > 0 ? '#ffffff' : '#05050c';
            ctx.fill();
            ctx.strokeStyle = '#d8c8ff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = 'bold 18px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#8ff7ff';
            for (let i = 0; i < 12; i++) {
                const a = i * Math.PI * 2 / 12 + boss.ringAngle;
                ctx.fillText(i % 2 ? '0' : '1', Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55);
            }
            ctx.restore();

            const barW = 270;
            const barX = boss.x - barW / 2;
            const barY = boss.y + r + 34;
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.fillRect(barX, barY, barW, 9);
            const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            hpGrad.addColorStop(0, '#8ff7ff');
            hpGrad.addColorStop(0.52, '#d8c8ff');
            hpGrad.addColorStop(1, '#ffcf6d');
            ctx.fillStyle = hpGrad;
            ctx.fillRect(barX, barY, barW * healthRatio, 9);
            ctx.strokeStyle = '#ffffff';
            ctx.strokeRect(barX, barY, barW, 9);
            ctx.textAlign = 'center';
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(boss.name, boss.x, barY + 26);
        }

        function drawFractalEnemyBullets(t) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const b of enemyBullets) {
                if (!b || !b.isFractalBullet) continue;
                ctx.fillStyle = b.color || '#ff8fd8';
                ctx.shadowColor = b.color || '#ff8fd8';
                ctx.shadowBlur = typeof getLiveGlowBlur === 'function'
                    ? getLiveGlowBlur(5, 'normal', 1, 0.18)
                    : (glowEnabled ? 5 : 0);
                ctx.font = `bold ${Math.round(14 + (b.radius || 8) * 0.35)}px Courier New`;
                ctx.fillText(b.char || 'o', b.x | 0, b.y | 0);
            }
            ctx.restore();
        }

        function drawFractalProjectiles(t) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const p of comboProjectiles) {
                if (!p || p.releaseDelay > 0) continue;
                ctx.globalAlpha = Math.max(0.24, Math.min(1, (p.life || 1) / Math.max(0.1, p.maxLife || 1)));
                ctx.fillStyle = p.color || '#ffffff';
                ctx.shadowColor = p.color || '#ffffff';
                ctx.shadowBlur = typeof getLiveGlowBlur === 'function'
                    ? getLiveGlowBlur(5, 'normal', 1, 0.18)
                    : (glowEnabled ? 5 : 0);
                ctx.font = `bold ${Math.round(15 * ((p.stats && p.stats.sizeMult) || 1))}px Courier New`;
                ctx.fillText(getFractalProjectileSprite(p), p.x | 0, p.y | 0);
            }
            for (const bombObj of bombProjectiles) {
                ctx.globalAlpha = 1;
                ctx.fillStyle = bombObj.launchColor || '#ffcf6d';
                ctx.font = 'bold 22px Courier New';
                ctx.fillText('o', bombObj.x | 0, bombObj.y | 0);
            }
            for (const ring of bombBlastRings) {
                const progress = Math.max(0, Math.min(1, ring.life / ring.maxLife));
                ctx.globalAlpha = 1 - progress;
                ctx.strokeStyle = ring.color || '#ffcf6d';
                ctx.lineWidth = ring.lineWidth || 2;
                ctx.beginPath();
                ctx.arc(ring.x, ring.y, ring.maxRadius * progress, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function getFractalProjectileSprite(projectile) {
            const sprite = projectile && projectile.sprite ? projectile.sprite : '|';
            if (sprite !== '|' && sprite !== '!') return sprite;
            const vx = projectile.baseVx || projectile.vx || 0;
            const vy = projectile.baseVy || projectile.vy || -1;
            return Math.abs(vx) > Math.abs(vy) ? (vx >= 0 ? '>' : '<') : (vy >= 0 ? 'v' : '^');
        }

        function drawFractalPickups() {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const orb of xpOrbs) {
                ctx.fillStyle = orb.color || '#ffffff';
                ctx.font = 'bold 16px Courier New';
                ctx.fillText(orb.char || '*', orb.x | 0, orb.y | 0);
            }
            for (const d of drops) {
                ctx.fillStyle = d.isHealth ? '#d11f34' : '#fff2a8';
                ctx.fillRect((d.x - 13) | 0, (d.y - 13) | 0, 26, 26);
                ctx.strokeStyle = '#ffffff';
                ctx.strokeRect((d.x - 13) | 0, (d.y - 13) | 0, 26, 26);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 20px Courier New';
                ctx.fillText(d.isHealth ? '+' : '*', d.x | 0, d.y | 0);
            }
            ctx.restore();
        }

        function drawFractalParticles() {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const p of fractalGravityState.particles) {
                ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
                ctx.fillStyle = p.color || '#ffffff';
                ctx.font = 'bold 13px Courier New';
                ctx.fillText(p.char || '.', p.x | 0, p.y | 0);
            }
            for (const d of debris) {
                ctx.globalAlpha = Math.max(0, Math.min(1, d.life || 1));
                ctx.fillStyle = d.color || '#8ff7ff';
                ctx.font = 'bold 13px Courier New';
                ctx.fillText(d.char || '*', d.x | 0, d.y | 0);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawFractalPlayer(now) {
            if (!player || typeof drawPlayerShip !== 'function') return;
            if (gameState === 'DYING' && playerExploded) return;
            const pulseVisuals = typeof getPlayerPulseVisuals === 'function'
                ? getPlayerPulseVisuals(now)
                : { color: player.color || '#ffffff', glow: 8 };
            player.color = player.flashTimer > 0 ? '#ffffff' : pulseVisuals.color;
            ctx.save();
            if (typeof drawCheapGlowDot === 'function') {
                drawCheapGlowDot(ctx, player.x, player.y, player.flashTimer > 0 ? 30 : 23, '#d8c8ff', {
                    alpha: player.flashTimer > 0 ? 0.14 : 0.07,
                    core: false
                });
            }
            ctx.fillStyle = player.color;
            ctx.shadowColor = '#8ff7ff';
            ctx.shadowBlur = typeof getLiveGlowBlur === 'function'
                ? getLiveGlowBlur(pulseVisuals.glow, 'high', 1, 0.24)
                : (glowEnabled ? pulseVisuals.glow : 0);
            ctx.translate(player.x, player.y);
            ctx.rotate(getFractalGravityAimAngle() - FRACTAL_FIRE_DEFAULT_ANGLE);
            ctx.translate(-player.x, -player.y);
            drawPlayerShip(player, 'center');
            ctx.restore();
        }

        function drawFractalMessages() {
            if (fractalGravityState.messageTimer <= 0 && !fractalGravityState.stageCleared) return;
            const text = fractalGravityState.stageCleared ? (fractalGravityState.message || 'GRAVITY RUN CLEAR') : fractalGravityState.message;
            if (!text) return;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = fractalGravityState.stageCleared ? 1 : Math.min(1, fractalGravityState.messageTimer);
            ctx.fillStyle = 'rgba(3, 6, 17, 0.74)';
            ctx.fillRect((typeof width === 'number' ? width : 1280) / 2 - 205, 78, 410, 46);
            ctx.strokeStyle = fractalGravityState.stageCleared ? '#8ff7ff' : '#d8c8ff';
            ctx.strokeRect((typeof width === 'number' ? width : 1280) / 2 - 205, 78, 410, 46);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#d8c8ff';
            ctx.shadowBlur = typeof getLiveGlowBlur === 'function'
                ? getLiveGlowBlur(8, 'high', 1, 0.20)
                : (glowEnabled ? 8 : 0);
            ctx.font = `bold 16px 'Electrolize', sans-serif`;
            ctx.fillText(text, (typeof width === 'number' ? width : 1280) / 2, 101);
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function debugFractalGravityState() {
            const snapshot = {
                active: !!(fractalGravityState && fractalGravityState.active),
                activeMode: typeof getActiveGameMode === 'function' ? getActiveGameMode() : 'unknown',
                gameState: typeof gameState !== 'undefined' ? gameState : 'unknown',
                galaxyIndex: fractalGravityState ? fractalGravityState.galaxyIndex : -1,
                currentGalaxyIndex: typeof currentGalaxyIndex === 'number' ? currentGalaxyIndex : -1,
                elapsed: fractalGravityState ? fractalGravityState.elapsed : 0,
                stageTime: fractalGravityState ? fractalGravityState.stageTime : 0,
                pressure: fractalGravityState ? fractalGravityState.pressure : 0,
                message: fractalGravityState ? fractalGravityState.message : '',
                enemyCount: typeof enemies !== 'undefined' && Array.isArray(enemies) ? enemies.filter(enemy => enemy && enemy.isFractalEnemy).length : 0,
                hazardCount: fractalGravityState && Array.isArray(fractalGravityState.hazards) ? fractalGravityState.hazards.length : 0,
                gravityWellCount: fractalGravityState && Array.isArray(fractalGravityState.gravityWells) ? fractalGravityState.gravityWells.length : 0,
                projectileCount: typeof comboProjectiles !== 'undefined' && Array.isArray(comboProjectiles) ? comboProjectiles.length : 0,
                enemyBulletCount: typeof enemyBullets !== 'undefined' && Array.isArray(enemyBullets) ? enemyBullets.filter(b => b && b.isFractalBullet).length : 0,
                bossSpawned: !!(fractalGravityState && fractalGravityState.bossSpawned),
                bossDefeated: !!(fractalGravityState && fractalGravityState.bossDefeated),
                stageCleared: !!(fractalGravityState && fractalGravityState.stageCleared),
                player: player ? {
                    x: Math.round(player.x),
                    y: Math.round(player.y),
                    vx: Math.round(player.vx || 0),
                    vy: Math.round(player.vy || 0),
                    hp: Math.round(player.hp || 0),
                    maxHp: Math.round(player.maxHp || 0)
                } : null,
                startedAt: fractalGravityState ? fractalGravityState.startedAt : 0,
                lastResetAt: fractalGravityState ? fractalGravityState.lastResetAt : 0
            };
            if (typeof console !== 'undefined' && console.table) console.table(snapshot);
            return snapshot;
        }

        if (typeof window !== 'undefined') {
            window.startFractalGravityRun = beginFractalGravityRun;
            window.debugFractalGravityState = debugFractalGravityState;
        }
