        // Bitshift Dwarf / Vector Scroll mode owner.
        // First playable side-scroller prototype. Keep mode-specific runtime logic here.

        const BITSHIFT_MODE_ID = 'bitshiftScroller';
        const BITSHIFT_FIRE_ANGLE = 0;
        const BITSHIFT_STAGE_CLEAR_DELAY = 4.2;
        const BITSHIFT_BOSS_SPAWN_TIME = 125;
        const BITSHIFT_STAGE_EVENTS = Object.freeze([
            { at: 1.8, type: 'droneLine', count: 3, y: 0.34, spacing: 72 },
            { at: 6.4, type: 'droneLine', count: 4, y: 0.62, spacing: 66 },
            { at: 11.6, type: 'droneLine', count: 5, y: 0.46, spacing: 58 },
            { at: 15.2, type: 'phaseMessage', message: 'FORMATION ROUTE' },
            { at: 17.0, type: 'droneLine', count: 6, y: 0.28, spacing: 50 },
            { at: 21.8, type: 'diagonalSkimmers', count: 5, y: 0.25, step: 46 },
            { at: 26.6, type: 'sineDrones', count: 7, y: 0.54, spacing: 48 },
            { at: 32.0, type: 'splitLine', count: 8 },
            { at: 35.6, type: 'phaseMessage', message: 'OVERFLOW LANES' },
            { at: 37.0, type: 'dataColumn', gapY: 0.50, gapH: 220, w: 34 },
            { at: 42.6, type: 'debrisBlocks', y: 0.22, count: 4, spacing: 76 },
            { at: 48.8, type: 'dataColumn', gapY: 0.36, gapH: 210, w: 40 },
            { at: 55.0, type: 'laneGates', gapY: 0.62, gapH: 215 },
            { at: 60.2, type: 'phaseMessage', message: 'REGISTER TURRETS' },
            { at: 62.0, type: 'turretPair' },
            { at: 67.8, type: 'turretWall', gapY: 0.42 },
            { at: 73.6, type: 'turretLane', y: 0.58 },
            { at: 80.4, type: 'turretPair', stagger: 46 },
            { at: 85.2, type: 'phaseMessage', message: 'PARITY FIELD' },
            { at: 87.0, type: 'mineCluster', y: 0.30 },
            { at: 92.8, type: 'debrisBlocks', y: 0.54, count: 5, spacing: 64 },
            { at: 98.6, type: 'mineCluster', y: 0.68 },
            { at: 103.8, type: 'sineDrones', count: 5, y: 0.38, spacing: 54 },
            { at: 108.8, type: 'mineCluster', y: 0.48 },
            { at: 111.6, type: 'phaseMessage', message: 'RECOVERY VECTOR' },
            { at: 113.0, type: 'recoveryDrop' },
            { at: 119.0, type: 'recoveryDrop', focus: true },
            { at: 122.0, type: 'phaseMessage', message: 'CORE SIGNATURE AHEAD', seconds: 3.2 },
            { at: BITSHIFT_BOSS_SPAWN_TIME, type: 'boss' }
        ]);

        const BITSHIFT_ENEMY_STATS = Object.freeze({
            bitDrone: {
                sprite: ['<0>'],
                color: '#ff9a73',
                hp: 16,
                speed: 158,
                radius: 20,
                damage: 10,
                score: 120,
                debrisCap: 18
            },
            shiftSkimmer: {
                sprite: ['/=>'],
                color: '#8ff7ff',
                hp: 12,
                speed: 250,
                radius: 18,
                damage: 11,
                score: 140,
                debrisCap: 14
            },
            registerTurret: {
                sprite: ['[+]', '|#|'],
                color: '#fff1e8',
                hp: 54,
                speed: 72,
                radius: 25,
                damage: 14,
                score: 260,
                debrisCap: 24
            },
            parityMine: {
                sprite: [' . ', '(*)', ' . '],
                color: '#ff4f4a',
                hp: 24,
                speed: 112,
                radius: 24,
                damage: 18,
                score: 180,
                debrisCap: 22
            }
        });

        const BITSHIFT_BOSS_SPRITE = [
            ' .-WARDEN-. ',
            '< DWARF CORE >',
            ' [01][10] '
        ];

        function createBitshiftScrollerState() {
            return {
                active: false,
                elapsed: 0,
                distance: 0,
                scrollSpeed: 150,
                spawnTimer: 0,
                waveIndex: 0,
                bossSpawned: false,
                bossDefeated: false,
                stageCleared: false,
                stageClearTimer: 0,
                stagePhase: 'offline',
                lastEntryGalaxyIndex: -1,
                hazards: [],
                stars: [],
                particles: [],
                message: '',
                messageTimer: 0,
                playerDamageCooldown: 0,
                pickupTimer: 0
            };
        }

        let bitshiftScrollerState = createBitshiftScrollerState();

        function createBitshiftStarfield() {
            const stars = [];
            const glyphs = ['0', '1', '.', '+', '<', '>', '-'];
            for (let i = 0; i < 120; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * Math.max(1, height - HUD_HEIGHT),
                    depth: 0.35 + Math.random() * 0.9,
                    glyph: glyphs[i % glyphs.length],
                    color: i % 5 === 0 ? '#8ff7ff' : (i % 3 === 0 ? '#ff9a73' : '#ffffff'),
                    alpha: 0.18 + Math.random() * 0.48,
                    wobble: Math.random() * Math.PI * 2
                });
            }
            return stars;
        }

        function clearBitshiftSharedRuntimeState() {
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
            if (typeof resetSurvivorRuntimeStateForCampaign === 'function') resetSurvivorRuntimeStateForCampaign();
            if (typeof resetMatrixCrawlerRuntimeStateForCampaign === 'function') resetMatrixCrawlerRuntimeStateForCampaign();
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

        function getBitshiftBounds() {
            return {
                left: 54,
                right: Math.max(220, width * 0.72),
                top: 148,
                bottom: typeof getGameplayBottomLimit === 'function' ? getGameplayBottomLimit(54) : height - HUD_HEIGHT - 54
            };
        }

        function getBitshiftPlayfieldBottom(pad = 54) {
            return typeof getGameplayBottomLimit === 'function' ? getGameplayBottomLimit(pad) : height - HUD_HEIGHT - pad;
        }

        function getBitshiftWeaponOrigin(isRear = false) {
            const offset = isRear ? -28 : 30;
            return {
                x: (player ? player.x : width * 0.24) + offset,
                y: player ? player.y : height * 0.52
            };
        }

        function placeBitshiftPlayerForRun() {
            if (!player) return;
            if (typeof applySelectedShipToPlayer === 'function') applySelectedShipToPlayer({ heal: true });
            const bounds = getBitshiftBounds();
            player.x = Math.max(bounds.left + 18, Math.min(bounds.right - 18, width * 0.22));
            player.y = Math.max(bounds.top + 18, Math.min(bounds.bottom - 18, height * 0.52));
            player.vx = 0;
            player.vy = 0;
            player.isFiring = true;
            player.isBeaming = false;
            player.lastFire = 0;
            player.flashTimer = 0;
            player.invincibilityTimer = 0.75;
            player.beamAngle = BITSHIFT_FIRE_ANGLE;
            player.beamTargetAngle = BITSHIFT_FIRE_ANGLE;
            player._renderLayoutCache = null;
        }

        function beginBitshiftScrollerRun() {
            clearBitshiftSharedRuntimeState();
            bitshiftScrollerState = createBitshiftScrollerState();
            bitshiftScrollerState.active = true;
            bitshiftScrollerState.stagePhase = 'warmup';
            bitshiftScrollerState.lastEntryGalaxyIndex = typeof currentGalaxyIndex === 'number' ? currentGalaxyIndex : -1;
            bitshiftScrollerState.stars = createBitshiftStarfield();
            bitshiftScrollerState.message = 'VECTOR SCROLL ONLINE';
            bitshiftScrollerState.messageTimer = 3.0;

            if (typeof setActiveGameMode === 'function') setActiveGameMode(BITSHIFT_MODE_ID);
            placeBitshiftPlayerForRun();
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
            if (typeof startMusic === 'function') startMusic();
            if (typeof applyCurrentVolume === 'function') applyCurrentVolume();

            gameState = 'PLAYING';
            pauseReturnState = 'PLAYING';
            titleAlpha = 0;
        }

        function isBitshiftScrollerModeActive() {
            return !!(
                bitshiftScrollerState &&
                bitshiftScrollerState.active &&
                typeof getActiveGameMode === 'function' &&
                getActiveGameMode() === BITSHIFT_MODE_ID
            );
        }

        function resetBitshiftScrollerRuntimeStateForCampaign() {
            bitshiftScrollerState = createBitshiftScrollerState();
            if (player) {
                player.isFiring = false;
                player.isBeaming = false;
                player._renderLayoutCache = null;
            }
        }

        function getBitshiftStagePhase(elapsed) {
            if (bitshiftScrollerState.stageCleared) return 'clear';
            if (bitshiftScrollerState.bossSpawned) return 'boss';
            if (elapsed < 15) return 'warmup';
            if (elapsed < 35) return 'formations';
            if (elapsed < 60) return 'terrain';
            if (elapsed < 85) return 'turrets';
            if (elapsed < 110) return 'mines';
            if (elapsed < BITSHIFT_BOSS_SPAWN_TIME) return 'recovery';
            return 'buildup';
        }

        function setBitshiftMessage(text, seconds = 2.4) {
            bitshiftScrollerState.message = text || '';
            bitshiftScrollerState.messageTimer = Math.max(bitshiftScrollerState.messageTimer || 0, seconds);
        }

        function updateBitshiftScrollerRuntime(dt) {
            if (!isBitshiftScrollerModeActive()) return;
            const safeDt = Math.max(0, Math.min(0.05, dt || 0));
            bitshiftScrollerState.elapsed += safeDt;
            bitshiftScrollerState.distance += bitshiftScrollerState.scrollSpeed * safeDt;
            bitshiftScrollerState.stagePhase = getBitshiftStagePhase(bitshiftScrollerState.elapsed);
            bitshiftScrollerState.playerDamageCooldown = Math.max(0, bitshiftScrollerState.playerDamageCooldown - safeDt);
            bitshiftScrollerState.messageTimer = Math.max(0, bitshiftScrollerState.messageTimer - safeDt);

            updateBitshiftStarfield(safeDt);
            updateBitshiftPlayer(safeDt);
            updateBitshiftTimeline();
            updateBitshiftHazards(safeDt);
            updateBitshiftEnemies(safeDt);
            updateBitshiftBoss(safeDt);
            updateBitshiftEnemyBullets(safeDt);
            updateBitshiftProjectiles(safeDt);
            updateBitshiftBombs(safeDt);
            updateBitshiftPickups(safeDt);
            updateBitshiftParticles(safeDt);
            updateBitshiftStageClear(safeDt);
        }

        function updateBitshiftStarfield(dt) {
            const playfieldH = Math.max(1, height - HUD_HEIGHT);
            for (const star of bitshiftScrollerState.stars) {
                star.x -= (bitshiftScrollerState.scrollSpeed * star.depth + 18) * dt;
                star.wobble += dt * (0.8 + star.depth);
                if (star.x < -24) {
                    star.x = width + Math.random() * 90;
                    star.y = Math.random() * playfieldH;
                }
            }
        }

        function updateBitshiftPlayer(dt) {
            if (!player) return;
            const inputX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
            const inputY = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
            const diagonal = inputX !== 0 && inputY !== 0 ? 0.707 : 1;
            const moveScale = typeof getPlayerMoveSpeedScale === 'function' ? getPlayerMoveSpeedScale() : 1;
            player.vx = (player.vx + inputX * diagonal * P_ACCEL * moveScale * dt) * P_FRICTION;
            player.vy = (player.vy + inputY * diagonal * P_ACCEL * moveScale * dt) * P_FRICTION;

            const bounds = getBitshiftBounds();
            player.x = Math.max(bounds.left, Math.min(bounds.right, player.x + player.vx * dt));
            player.y = Math.max(bounds.top, Math.min(bounds.bottom, player.y + player.vy * dt));
            player.isFiring = true;
            player.isBeaming = false;
            player.beamTargetAngle = BITSHIFT_FIRE_ANGLE;
            player.beamAngle = BITSHIFT_FIRE_ANGLE;
            player._renderLayoutCache = null;

            const speedRatio = Math.min(1, Math.hypot(player.vx, player.vy) / Math.max(1, P_MAX_SPEED || 720));
            if (typeof applyWakeForce === 'function') applyWakeForce(player.x, player.y, 88, speedRatio * 8);

            const momentumFireRate = (player.modifiers.momentumFireRate || 0) * speedRatio;
            const totalFireRateBonus = (player.modifiers.fireRate || 0) + momentumFireRate;
            const stats = player.weaponStats || (typeof createBaseWeaponStats === 'function' ? createBaseWeaponStats() : { fireRateMult: 1 });
            const interval = typeof getClampedPlayerFireInterval === 'function'
                ? getClampedPlayerFireInterval((player.fireRate / stats.fireRateMult) / (1 + totalFireRateBonus))
                : 290;
            const aimY = (keys.arrowdown ? 1 : 0) - (keys.arrowup ? 1 : 0);
            const aimAngle = Math.atan2(aimY * 0.22, 1);
            if (typeof fireCombo === 'function' && currentFrameNow - player.lastFire > interval) {
                fireCombo(aimAngle);
            }
            if (player.bombTimer > 0) player.bombTimer = Math.max(0, player.bombTimer - dt);
            if (postResumeBombLockTimer > 0) postResumeBombLockTimer = Math.max(0, postResumeBombLockTimer - dt);
            if (keys[' '] && player.bombTimer <= 0 && postResumeBombLockTimer <= 0 && typeof fireBomb === 'function') {
                fireBomb();
            }
            if (player.invincibilityTimer > 0) player.invincibilityTimer = Math.max(0, player.invincibilityTimer - dt);
            if (player.flashTimer > 0) player.flashTimer = Math.max(0, player.flashTimer - dt);
            if (player.hp < player.maxHp) player.hp = Math.min(player.maxHp, player.hp + (player.modifiers.hpRegen || 0) * dt);

            if (Math.random() < 0.68) {
                bitshiftScrollerState.particles.push({
                    x: player.x - 24 + Math.random() * 6,
                    y: player.y + (Math.random() - 0.5) * 14,
                    vx: -130 - Math.random() * 130,
                    vy: (Math.random() - 0.5) * 45,
                    char: Math.random() < 0.5 ? '0' : '1',
                    color: Math.random() < 0.45 ? '#8ff7ff' : '#ff9a73',
                    life: 0.32 + Math.random() * 0.28
                });
            }
        }

        function updateBitshiftTimeline() {
            while (bitshiftScrollerState.waveIndex < BITSHIFT_STAGE_EVENTS.length
                && bitshiftScrollerState.elapsed >= BITSHIFT_STAGE_EVENTS[bitshiftScrollerState.waveIndex].at) {
                spawnBitshiftTimelineEvent(BITSHIFT_STAGE_EVENTS[bitshiftScrollerState.waveIndex]);
                bitshiftScrollerState.waveIndex++;
            }
        }

        function spawnBitshiftTimelineEvent(event) {
            if (!event || bitshiftScrollerState.stageCleared) return;
            if (event.type === 'phaseMessage') {
                setBitshiftMessage(event.message || '', event.seconds || 2.8);
            } else if (event.type === 'droneLine') {
                for (let i = 0; i < event.count; i++) {
                    spawnBitshiftEnemy('bitDrone', {
                        x: width + 70 + i * (event.spacing || 56),
                        y: height * event.y + Math.sin(i * 0.8) * 10,
                        sineAmp: 18,
                        phase: i * 0.7
                    });
                }
            } else if (event.type === 'diagonalSkimmers') {
                for (let i = 0; i < event.count; i++) {
                    spawnBitshiftEnemy('shiftSkimmer', {
                        x: width + 70 + i * 54,
                        y: height * event.y + i * event.step,
                        vy: i % 2 === 0 ? 28 : -28
                    });
                }
                setBitshiftMessage('SHIFT SKIMMERS');
            } else if (event.type === 'sineDrones') {
                for (let i = 0; i < event.count; i++) {
                    spawnBitshiftEnemy('bitDrone', {
                        x: width + 65 + i * (event.spacing || 48),
                        y: height * event.y,
                        sineAmp: 52,
                        sineSpeed: 2.1,
                        phase: i * 0.9
                    });
                }
            } else if (event.type === 'splitLine') {
                for (let i = 0; i < event.count; i++) {
                    spawnBitshiftEnemy(i % 3 === 0 ? 'shiftSkimmer' : 'bitDrone', {
                        x: width + 80 + i * 48,
                        y: i % 2 === 0 ? height * 0.30 : height * 0.68,
                        vy: i % 2 === 0 ? 16 : -16
                    });
                }
            } else if (event.type === 'dataColumn') {
                spawnBitshiftHazard('dataColumn', event);
                setBitshiftMessage('REGISTER WALLS');
            } else if (event.type === 'debrisBlocks') {
                spawnBitshiftHazard('debrisBlocks', event);
            } else if (event.type === 'laneGates') {
                spawnBitshiftHazard('dataColumn', {
                    xOffset: 76,
                    gapY: event.gapY || 0.50,
                    gapH: event.gapH || 210,
                    w: 34
                });
                spawnBitshiftHazard('dataColumn', {
                    xOffset: 220,
                    gapY: Math.max(0.28, Math.min(0.72, (event.gapY || 0.50) - 0.18)),
                    gapH: Math.max(200, (event.gapH || 210) - 8),
                    w: 34
                });
            } else if (event.type === 'turretPair') {
                const stagger = event.stagger || 40;
                spawnBitshiftEnemy('registerTurret', { x: width + 85, y: height * 0.26, anchor: 'top' });
                spawnBitshiftEnemy('registerTurret', { x: width + 85 + stagger, y: height * 0.68, anchor: 'bottom' });
                setBitshiftMessage('REGISTER TURRETS');
            } else if (event.type === 'turretWall') {
                spawnBitshiftHazard('dataColumn', {
                    xOffset: 96,
                    gapY: event.gapY || 0.45,
                    gapH: 230,
                    w: 38
                });
                spawnBitshiftEnemy('registerTurret', { x: width + 170, y: height * 0.22, anchor: 'top', targetX: width - 190 });
                spawnBitshiftEnemy('registerTurret', { x: width + 230, y: height * 0.72, anchor: 'bottom', targetX: width - 132 });
            } else if (event.type === 'turretLane') {
                spawnBitshiftEnemy('registerTurret', { x: width + 100, y: height * event.y });
                spawnBitshiftEnemy('bitDrone', { x: width + 230, y: height * 0.42, sineAmp: 32 });
            } else if (event.type === 'mineCluster') {
                for (let i = 0; i < 5; i++) {
                    spawnBitshiftEnemy('parityMine', {
                        x: width + 70 + i * 58,
                        y: height * event.y + (i % 2 === 0 ? -44 : 44),
                        phase: i * 0.8
                    });
                }
                setBitshiftMessage('PARITY MINES');
            } else if (event.type === 'recoveryDrop') {
                if (typeof createHealthDrop === 'function') drops.push(createHealthDrop(width * 0.72, height * 0.48, 0.10, 28));
                if (event.focus && typeof createFocusDrop === 'function') drops.push(createFocusDrop(width * 0.82, height * 0.56, 36));
                setBitshiftMessage(event.focus ? 'CACHE REFUEL' : 'RECOVERY VECTOR', 2.8);
            } else if (event.type === 'boss') {
                spawnBitshiftBoss();
            }
        }

        function spawnBitshiftEnemy(type, options = {}) {
            const stats = BITSHIFT_ENEMY_STATS[type] || BITSHIFT_ENEMY_STATS.bitDrone;
            const enemy = {
                x: Number.isFinite(options.x) ? options.x : width + 80,
                y: Number.isFinite(options.y) ? options.y : height * 0.5,
                baseY: Number.isFinite(options.y) ? options.y : height * 0.5,
                vx: Number.isFinite(options.vx) ? options.vx : -stats.speed,
                vy: Number.isFinite(options.vy) ? options.vy : 0,
                hp: stats.hp,
                maxHp: stats.hp,
                sprite: stats.sprite,
                color: stats.color,
                enemyShipBodyColor: stats.color,
                enemyBulletColor: type === 'registerTurret' ? '#ffcf6d' : '#ff8a73',
                bitshiftType: type,
                isBitshiftEnemy: true,
                onScreen: true,
                disableRandomFire: true,
                waveFormationResolved: true,
                collisionRadius: stats.radius,
                contactDamage: stats.damage,
                scoreValue: stats.score,
                flashTimer: 0,
                fireTimer: 0.35 + Math.random() * 0.6,
                holdTimer: 0,
                targetX: options.targetX || width - 150,
                sineAmp: Number.isFinite(options.sineAmp) ? options.sineAmp : 0,
                sineSpeed: Number.isFinite(options.sineSpeed) ? options.sineSpeed : 1.5,
                phase: Number.isFinite(options.phase) ? options.phase : Math.random() * Math.PI * 2,
                anchor: options.anchor || '',
                explosionDebrisCap: stats.debrisCap
            };
            if (type === 'parityMine') enemy.flyByDropType = Math.random() < 0.16 ? 'healthSmall' : null;
            enemies.push(enemy);
            return enemy;
        }

        function spawnBitshiftBoss() {
            if (bitshiftScrollerState.bossSpawned || boss) return;
            bitshiftScrollerState.bossSpawned = true;
            boss = {
                x: width + 190,
                y: height * 0.46,
                hp: 760,
                maxHp: 760,
                name: 'DWARF CORE WARDEN',
                sprite: BITSHIFT_BOSS_SPRITE,
                phase: 'ACTIVE',
                timer: 0,
                flashTimer: 0,
                color: '#ff8a3d',
                isBitshiftBoss: true,
                onScreen: true,
                collisionRadius: 66,
                fireTimer: 1.0,
                spreadTimer: 2.4,
                laneTimer: 4.8,
                entryTargetX: width - 185,
                renderScale: 1.1,
                explosionDebrisCap: 96
            };
            setBitshiftMessage('DWARF CORE WARDEN', 3.5);
        }

        function spawnBitshiftHazard(type, options = {}) {
            const playBottom = getBitshiftPlayfieldBottom(46);
            if (type === 'dataColumn') {
                const gapH = options.gapH || 190;
                const gapY = Math.max(128, Math.min(playBottom - 112, height * (options.gapY || 0.5)));
                bitshiftScrollerState.hazards.push({
                    type,
                    x: width + (options.xOffset || 82),
                    w: options.w || 36,
                    gapY,
                    gapH,
                    damage: 16,
                    passed: false
                });
            } else if (type === 'debrisBlocks') {
                const count = options.count || 4;
                const blockW = options.w || 54;
                const blockH = options.h || 42;
                const spacing = options.spacing || 72;
                for (let i = 0; i < count; i++) {
                    const rawY = height * (options.y || 0.28) + (i % 2 === 0 ? 0 : 235);
                    bitshiftScrollerState.hazards.push({
                        type: 'debrisBlock',
                        x: width + 76 + i * spacing,
                        y: Math.max(86, Math.min(playBottom - blockH - 14, rawY)),
                        w: blockW,
                        h: blockH,
                        damage: 13
                    });
                }
            }
        }

        function updateBitshiftEnemies(dt) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (!e || !e.isBitshiftEnemy) continue;
                const type = e.bitshiftType;
                if (type === 'registerTurret') {
                    if (e.x > e.targetX) e.x -= Math.max(30, Math.abs(e.vx)) * dt;
                    else {
                        e.holdTimer += dt;
                        e.x -= Math.max(0, e.holdTimer - 6.5) * 34 * dt;
                    }
                    e.y += Math.sin((bitshiftScrollerState.elapsed + e.phase) * 1.8) * 5 * dt;
                    e.fireTimer -= dt;
                    if (e.fireTimer <= 0 && e.x < width - 80) {
                        e.fireTimer = 1.75 + Math.random() * 0.45;
                        const angle = Math.atan2(player.y - e.y, player.x - e.x);
                        fireBitshiftEnemyBullet(e.x - 18, e.y, angle, 245, { char: '+', color: e.enemyBulletColor, radius: 9 });
                    }
                } else {
                    e.x += e.vx * dt;
                    e.y += e.vy * dt;
                    if (e.sineAmp) {
                        e.y = e.baseY + Math.sin(bitshiftScrollerState.elapsed * e.sineSpeed + e.phase) * e.sineAmp;
                    }
                }

                e.onScreen = e.x < width + 60 && e.x > -80 && e.y > -80 && e.y < height + 80;
                e.flashTimer = Math.max(0, (e.flashTimer || 0) - dt);
                if (isBitshiftCircleTouchingPlayer(e.x, e.y, e.collisionRadius || 20)) {
                    damageBitshiftPlayer(e.contactDamage || 10);
                    if (type !== 'registerTurret') {
                        explodeBitshiftEnemy(e, i);
                        continue;
                    }
                }
                if (e.x < -120 || e.y < -140 || e.y > height + 140) enemies.splice(i, 1);
            }
        }

        function updateBitshiftBoss(dt) {
            if (!boss || !boss.isBitshiftBoss || bitshiftScrollerState.stageCleared) return;
            boss.timer += dt;
            boss.x += (boss.entryTargetX - boss.x) * Math.min(1, dt * 1.25);
            boss.y = height * 0.46 + Math.sin(boss.timer * 1.05) * 58;
            boss.flashTimer = Math.max(0, (boss.flashTimer || 0) - dt);

            boss.fireTimer -= dt;
            if (boss.fireTimer <= 0) {
                boss.fireTimer = 1.15;
                const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
                fireBitshiftEnemyBullet(boss.x - 54, boss.y, angle, 220, { char: 'o', color: '#ffcf6d', radius: 11 });
            }
            boss.spreadTimer -= dt;
            if (boss.spreadTimer <= 0) {
                boss.spreadTimer = 3.2;
                for (let i = -1; i <= 1; i++) {
                    fireBitshiftEnemyBullet(boss.x - 58, boss.y + i * 22, Math.PI + i * 0.18, 205, { char: '*', color: '#ff8a3d', radius: 10 });
                }
            }
            boss.laneTimer -= dt;
            if (boss.laneTimer <= 0) {
                boss.laneTimer = 5.8;
                const lanes = 5;
                const playTop = 86;
                const playBottom = getGameplayBottomLimit(78);
                const skipLane = Math.max(0, Math.min(lanes - 1, Math.round(((player.y - playTop) / Math.max(1, playBottom - playTop)) * (lanes - 1))));
                for (let lane = 0; lane < lanes; lane++) {
                    if (lane === skipLane) continue;
                    const y = playTop + (playBottom - playTop) * (lane / (lanes - 1));
                    fireBitshiftEnemyBullet(boss.x - 48, y, Math.PI, 168, { char: lane % 2 ? '1' : '0', color: '#8ff7ff', radius: 9 });
                }
                setBitshiftMessage('LANE BURST');
            }
            if (isBitshiftCircleTouchingPlayer(boss.x, boss.y, boss.collisionRadius || 60)) {
                damageBitshiftPlayer(20);
            }
            if (boss.hp <= 0) defeatBitshiftBoss();
        }

        function fireBitshiftEnemyBullet(x, y, angle, speed, options = {}) {
            enemyBullets.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                char: options.char || 'o',
                color: options.color || '#ff8a3d',
                radius: options.radius || 9,
                life: options.life || 5.4,
                isBitshiftBullet: true
            });
        }

        function updateBitshiftEnemyBullets(dt) {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i];
                b.x += (b.vx || 0) * dt;
                b.y += (b.vy || 0) * dt;
                b.life = (b.life || 4) - dt;
                if (isBitshiftCircleTouchingPlayer(b.x, b.y, b.radius || 9)) {
                    damageBitshiftPlayer(b.damage || 9);
                    enemyBullets.splice(i, 1);
                    continue;
                }
                if (b.life <= 0 || b.x < -50 || b.x > width + 80 || b.y < -60 || b.y > height + 60) {
                    enemyBullets.splice(i, 1);
                }
            }
        }

        function updateBitshiftHazards(dt) {
            for (let i = bitshiftScrollerState.hazards.length - 1; i >= 0; i--) {
                const h = bitshiftScrollerState.hazards[i];
                h.x -= bitshiftScrollerState.scrollSpeed * dt;
                if (h.type === 'dataColumn') {
                    const topRect = { x: h.x, y: 0, w: h.w, h: h.gapY - h.gapH / 2 };
                    const bottomY = h.gapY + h.gapH / 2;
                    const bottomRect = { x: h.x, y: bottomY, w: h.w, h: Math.max(0, height - HUD_HEIGHT - bottomY) };
                    if (isBitshiftPlayerTouchingRect(topRect) || isBitshiftPlayerTouchingRect(bottomRect)) {
                        damageBitshiftPlayer(h.damage || 12);
                    }
                } else if (h.type === 'debrisBlock') {
                    h.y += Math.sin(bitshiftScrollerState.elapsed * 1.7 + i) * 6 * dt;
                    if (isBitshiftPlayerTouchingRect(h)) damageBitshiftPlayer(h.damage || 11);
                }
                if (h.x + (h.w || 60) < -80) bitshiftScrollerState.hazards.splice(i, 1);
            }
        }

        function updateBitshiftProjectiles(dt) {
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
                if ((p.orbitTime || 0) > 0) {
                    p.orbitTime = Math.max(0, p.orbitTime - dt);
                    p.orbitAngle += (p.orbitSpin || 8) * dt;
                    const radius = p.orbitRadius || 34;
                    p.x = player.x + Math.cos(p.orbitAngle) * radius;
                    p.y = player.y + Math.sin(p.orbitAngle) * radius;
                    if (p.orbitTime <= 0) {
                        const angle = Number.isFinite(p.releaseAngle) ? p.releaseAngle : BITSHIFT_FIRE_ANGLE;
                        const speed = p.releaseSpeed || Math.max(420, Math.hypot(p.baseVx || 0, p.baseVy || 0));
                        p.baseVx = Math.cos(angle) * speed;
                        p.baseVy = Math.sin(angle) * speed;
                    }
                } else {
                    if (stats.homing) steerBitshiftProjectileTowardTarget(p, dt);
                    if (stats.returning && !p.hasReturned && p.age >= (stats.returnAfter || 0.55)) {
                        p.hasReturned = true;
                        p.baseVx = -Math.abs(p.baseVx || 620);
                        p.baseVy *= 0.55;
                        p.startX = p.x;
                        p.startY = p.y;
                    }
                    if (stats.pathFunction === 'sine') {
                        const t = p.age;
                        const linearX = p.startX + (p.baseVx || 0) * t;
                        const linearY = p.startY + (p.baseVy || 0) * t;
                        const offset = Math.sin(t * 15) * 34 * (stats.sineAmplitudeMult || 1);
                        p.x = linearX;
                        p.y = linearY + offset;
                    } else {
                        p.x += (p.baseVx || p.vx || 0) * dt;
                        p.y += (p.baseVy || p.vy || 0) * dt;
                    }
                }
                if (typeof applyWakeForce === 'function') applyWakeForce(p.x, p.y, stats.plasmaCloud ? 56 : 34, 4);
                if (resolveBitshiftProjectileHits(p)) {
                    comboProjectiles.splice(i, 1);
                    continue;
                }
                const torpedoRange = stats.torpedoRange || 0;
                const expiredTorpedo = stats.miniTorpedo && torpedoRange > 0
                    && (p.x - p.startX) * (p.x - p.startX) + (p.y - p.startY) * (p.y - p.startY) >= torpedoRange * torpedoRange;
                if (expiredTorpedo) {
                    applyBitshiftSplash(p.x, p.y, stats.torpedoExplosionRadius || 74, p.damage * (stats.torpedoExplosionDamageMult || 0.85));
                    emitBitshiftHitSparks(p.x, p.y, p.color || '#ffb347', 14);
                }
                if (p.life <= 0 || expiredTorpedo || p.x < -80 || p.x > width + 120 || p.y < -80 || p.y > height + 80) {
                    comboProjectiles.splice(i, 1);
                }
            }
        }

        function steerBitshiftProjectileTowardTarget(projectile, dt) {
            const target = findNearestBitshiftTarget(projectile.x, projectile.y);
            if (!target) return;
            const speed = Math.max(120, Math.hypot(projectile.baseVx || projectile.vx || 0, projectile.baseVy || projectile.vy || 0));
            const dx = target.x - projectile.x;
            const dy = target.y - projectile.y;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const desiredVx = (dx / dist) * speed;
            const desiredVy = (dy / dist) * speed;
            const turn = Math.min(1, (projectile.stats.homingStrength || 1) * dt * 2.4);
            projectile.baseVx = (projectile.baseVx || 0) + (desiredVx - (projectile.baseVx || 0)) * turn;
            projectile.baseVy = (projectile.baseVy || 0) + (desiredVy - (projectile.baseVy || 0)) * turn;
        }

        function findNearestBitshiftTarget(x, y) {
            let target = boss && boss.isBitshiftBoss ? boss : null;
            let best = target ? (target.x - x) * (target.x - x) + (target.y - y) * (target.y - y) : Infinity;
            for (const enemy of enemies) {
                if (!enemy || !enemy.isBitshiftEnemy) continue;
                const d = (enemy.x - x) * (enemy.x - x) + (enemy.y - y) * (enemy.y - y);
                if (d < best) {
                    best = d;
                    target = enemy;
                }
            }
            return target;
        }

        function resolveBitshiftProjectileHits(projectile) {
            const stats = projectile.stats || {};
            if (!Array.isArray(projectile.pierceHits)) projectile.pierceHits = [];
            const radius = typeof getComboProjectileHitboxRadius === 'function'
                ? getComboProjectileHitboxRadius(projectile)
                : 12 * (stats.sizeMult || 1);

            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                if (!enemy || !enemy.isBitshiftEnemy || projectile.pierceHits.includes(enemy)) continue;
                if (doesBitshiftProjectileHit(projectile, enemy, radius)) {
                    damageBitshiftTarget(enemy, projectile, i);
                    if (!stats.plasmaCloud && (stats.miniTorpedo || projectile.pierceCount-- <= 0)) return true;
                }
            }

            if (boss && boss.isBitshiftBoss && !projectile.pierceHits.includes(boss) && doesBitshiftProjectileHit(projectile, boss, radius)) {
                damageBitshiftTarget(boss, projectile, -1);
                if (!stats.plasmaCloud && (stats.miniTorpedo || projectile.pierceCount-- <= 0)) return true;
            }
            return false;
        }

        function doesBitshiftProjectileHit(projectile, target, radius) {
            if (typeof doesProjectileHitTargetMask === 'function') {
                return doesProjectileHitTargetMask(projectile, target, radius);
            }
            return Math.hypot(projectile.x - target.x, projectile.y - target.y) < radius + (target.collisionRadius || 20);
        }

        function damageBitshiftTarget(target, projectile, enemyIndex) {
            const stats = projectile.stats || {};
            const damage = stats.plasmaCloud
                ? projectile.damage * (stats.cloudDotMult || 6) * 0.05
                : projectile.damage;
            target.hp -= damage;
            target.flashTimer = 0.14;
            projectile.pierceHits.push(target);
            if (stats.splashRadius > 0) {
                applyBitshiftSplash(projectile.x, projectile.y, stats.splashRadius * 22, projectile.damage * (stats.splashDamagePercent || 0.5));
            }
            if (stats.miniTorpedo) {
                applyBitshiftSplash(projectile.x, projectile.y, stats.torpedoExplosionRadius || 74, projectile.damage * (stats.torpedoExplosionDamageMult || 0.85));
                emitBitshiftHitSparks(projectile.x, projectile.y, projectile.color || '#ffb347', 14);
            }
            emitBitshiftHitSparks(projectile.x, projectile.y, target.color || projectile.color || '#ffffff', 3);
            if (target.hp <= 0) {
                if (target === boss) defeatBitshiftBoss();
                else explodeBitshiftEnemy(target, enemyIndex);
            }
        }

        function updateBitshiftBombs(dt) {
            for (let i = bombProjectiles.length - 1; i >= 0; i--) {
                const bombObj = bombProjectiles[i];
                if (bombObj.justFired) {
                    bombObj.justFired = false;
                    continue;
                }
                bombObj.age = (bombObj.age || 0) + dt;
                bombObj.x += bombObj.vx * dt;
                bombObj.y += bombObj.vy * dt;
                bombObj.distance = Math.hypot(bombObj.x - bombObj.startX, bombObj.y - bombObj.startY);
                bitshiftScrollerState.particles.push({
                    x: bombObj.x,
                    y: bombObj.y,
                    vx: -120 + Math.random() * 40,
                    vy: (Math.random() - 0.5) * 90,
                    char: '*',
                    color: '#8ff7ff',
                    life: 0.28
                });
                let shouldExplode = bombObj.forceDetonate || bombObj.distance >= bombObj.maxDistance || bombObj.x > width + 70;
                if (!shouldExplode) {
                    const target = findNearestBitshiftTarget(bombObj.x, bombObj.y);
                    if (target && Math.hypot(target.x - bombObj.x, target.y - bombObj.y) < (target.collisionRadius || 28) + 18) shouldExplode = true;
                }
                if (shouldExplode) {
                    explodeBitshiftBomb(bombObj.x, bombObj.y);
                    bombProjectiles.splice(i, 1);
                }
            }
            for (let i = bombBlastRings.length - 1; i >= 0; i--) {
                const ring = bombBlastRings[i];
                ring.life += dt;
                if (ring.life >= ring.maxLife) bombBlastRings.splice(i, 1);
            }
        }

        function updateBitshiftPickups(dt) {
            const magnetRangeSq = 22500 * (1 + ((player && player.modifiers && player.modifiers.magnet) || 0));
            for (let i = xpOrbs.length - 1; i >= 0; i--) {
                const orb = xpOrbs[i];
                const dx = player.x - orb.x;
                const dy = player.y - orb.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < magnetRangeSq) {
                    const dist = Math.max(1, Math.sqrt(distSq));
                    orb.vx = (dx / dist) * 760;
                    orb.vy = (dy / dist) * 760;
                } else {
                    orb.vx = (orb.vx || 0) * 0.92 - bitshiftScrollerState.scrollSpeed * 0.24;
                    orb.vy = (orb.vy || 0) * 0.92;
                }
                orb.x += orb.vx * dt;
                orb.y += orb.vy * dt;
                if (distSq < 1600) {
                    const xpValue = orb.xpValue || 1;
                    const xpGainBonus = 1 + (player.modifiers.xpGain || 0);
                    player.xp += xpValue * xpGainBonus;
                    if (player.xp >= player.xpNeeded && !boss && !bitshiftScrollerState.stageCleared) {
                        player.xp -= player.xpNeeded;
                        player.level++;
                        player.xpNeeded = typeof getXpNeededForLevel === 'function' ? getXpNeededForLevel(player.level) : player.xpNeeded + 12;
                        if (typeof beginLevelUpOffer === 'function') beginLevelUpOffer({ returnState: 'PLAYING' });
                    }
                    xpOrbs.splice(i, 1);
                    if (typeof addScore === 'function') addScore(50);
                } else if (orb.x < -50 || orb.y < -50 || orb.y > height + 50) {
                    xpOrbs.splice(i, 1);
                }
            }

            for (let i = drops.length - 1; i >= 0; i--) {
                const d = drops[i];
                d.x += ((d.vx || 0) - bitshiftScrollerState.scrollSpeed * 0.35) * dt;
                d.y += (d.vy || 0) * dt;
                const dx = d.x - player.x;
                const dy = d.y - player.y;
                if (dx * dx + dy * dy < 3600) {
                    if (d.isHealth) {
                        player.hp = Math.min(player.maxHp, player.hp + Math.ceil(player.maxHp * (d.healFraction || 0.10)));
                    } else if (d.isFocus) {
                        const focusMax = typeof getFocusMeterMax === 'function' ? getFocusMeterMax() : FOCUS_METER_MAX;
                        focusMeter = Math.min(focusMax, focusMeter + (d.focusAmount || FOCUS_ELITE_DROP_AMOUNT));
                    }
                    drops.splice(i, 1);
                    if (typeof addShake === 'function') addShake(12);
                } else if (d.x < -60 || d.y > height + 60) {
                    drops.splice(i, 1);
                }
            }
        }

        function updateBitshiftParticles(dt) {
            for (let i = bitshiftScrollerState.particles.length - 1; i >= 0; i--) {
                const p = bitshiftScrollerState.particles[i];
                p.x += (p.vx || 0) * dt;
                p.y += (p.vy || 0) * dt;
                p.life -= dt;
                if (p.life <= 0) bitshiftScrollerState.particles.splice(i, 1);
            }
            for (let i = debris.length - 1; i >= 0; i--) {
                const d = debris[i];
                d.x += ((d.vx || 0) - bitshiftScrollerState.scrollSpeed * 0.18) * dt;
                d.y += (d.vy || 0) * dt;
                d.vx *= 0.98;
                d.vy *= 0.98;
                d.life -= dt * 0.9;
                if (d.life <= 0 || d.x < -80) debris.splice(i, 1);
            }
        }

        function updateBitshiftStageClear(dt) {
            if (!bitshiftScrollerState.stageCleared) return;
            bitshiftScrollerState.stageClearTimer += dt;
            if (bitshiftScrollerState.stageClearTimer > BITSHIFT_STAGE_CLEAR_DELAY) {
                bitshiftScrollerState.message = 'VECTOR ROUTE CLEAR';
                bitshiftScrollerState.messageTimer = Math.max(bitshiftScrollerState.messageTimer, 1);
            }
        }

        function explodeBitshiftEnemy(enemy, enemyIndex) {
            if (!enemy) return;
            if (typeof explodeEnemy === 'function') explodeEnemy(enemy);
            else emitBitshiftHitSparks(enemy.x, enemy.y, enemy.color || '#ff8a3d', 10);
            if (enemyIndex >= 0) enemies.splice(enemyIndex, 1);
            if (typeof addScore === 'function') addScore(enemy.scoreValue || 120);
        }

        function applyBitshiftSplash(x, y, radius, damage) {
            const r = Math.max(16, radius || 64);
            const d = Math.max(1, damage || 1);
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                if (!enemy || !enemy.isBitshiftEnemy) continue;
                const dist = Math.hypot(enemy.x - x, enemy.y - y);
                if (dist <= r + (enemy.collisionRadius || 18)) {
                    const falloff = 1 - Math.min(0.72, dist / Math.max(1, r) * 0.55);
                    enemy.hp -= d * falloff;
                    enemy.flashTimer = 0.12;
                    if (enemy.hp <= 0) explodeBitshiftEnemy(enemy, i);
                }
            }
            if (boss && boss.isBitshiftBoss) {
                const dist = Math.hypot(boss.x - x, boss.y - y);
                if (dist <= r + (boss.collisionRadius || 58)) {
                    const falloff = 1 - Math.min(0.72, dist / Math.max(1, r) * 0.55);
                    boss.hp -= d * falloff;
                    boss.flashTimer = 0.12;
                    if (boss.hp <= 0) defeatBitshiftBoss();
                }
            }
        }

        function explodeBitshiftBomb(x, y) {
            const radius = typeof BOMB_EXPLOSION_RADIUS === 'number'
                ? BOMB_EXPLOSION_RADIUS * (1 + ((player.modifiers && player.modifiers.bombRadius) || 0))
                : 150;
            const damage = typeof BOMB_EXPLOSION_DAMAGE === 'number'
                ? BOMB_EXPLOSION_DAMAGE * (1 + ((player.modifiers && player.modifiers.bombDamage) || 0))
                : 55;
            applyBitshiftSplash(x, y, radius, damage);
            emitBitshiftHitSparks(x, y, '#8ff7ff', 34);
            if (typeof addShake === 'function') addShake(16);
            bombBlastRings.push({
                x,
                y,
                life: 0,
                maxLife: 0.46,
                maxRadius: radius * 1.15,
                color: '#8ff7ff',
                lineWidth: 4
            });
        }

        function defeatBitshiftBoss() {
            if (!boss) return;
            const defeated = boss;
            boss = null;
            bitshiftScrollerState.bossDefeated = true;
            bitshiftScrollerState.stageCleared = true;
            bitshiftScrollerState.stagePhase = 'clear';
            bitshiftScrollerState.stageClearTimer = 0;
            bitshiftScrollerState.message = 'VECTOR ROUTE CLEAR';
            bitshiftScrollerState.messageTimer = 6;
            emitBitshiftHitSparks(defeated.x, defeated.y, '#ff8a3d', 48);
            if (typeof explodeEnemy === 'function') explodeEnemy(defeated);
            if (typeof addScore === 'function') addScore(5000, false);
        }

        function emitBitshiftHitSparks(x, y, color, count) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 45 + Math.random() * 220;
                bitshiftScrollerState.particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    char: i % 2 ? '+' : '*',
                    color: color || '#ffffff',
                    life: 0.22 + Math.random() * 0.4
                });
            }
        }

        function isBitshiftCircleTouchingPlayer(x, y, radius) {
            if (!player || player.hp <= 0) return false;
            const scale = typeof getPlayerSpecterHitboxScale === 'function' ? getPlayerSpecterHitboxScale() : 1;
            return Math.hypot(player.x - x, player.y - y) < radius + 18 * scale;
        }

        function isBitshiftPlayerTouchingRect(rect) {
            if (!player || !rect) return false;
            const radius = 18 * (typeof getPlayerSpecterHitboxScale === 'function' ? getPlayerSpecterHitboxScale() : 1);
            const nearestX = Math.max(rect.x, Math.min(rect.x + rect.w, player.x));
            const nearestY = Math.max(rect.y, Math.min(rect.y + rect.h, player.y));
            return Math.hypot(player.x - nearestX, player.y - nearestY) < radius;
        }

        function damageBitshiftPlayer(amount) {
            if (!player || player.godMode || bitshiftScrollerState.playerDamageCooldown > 0 || gameState !== 'PLAYING') return;
            player.hp -= Math.max(1, amount || 1);
            player.invincibilityTimer = 0.95;
            player.flashTimer = 0.42;
            bitshiftScrollerState.playerDamageCooldown = 0.72;
            if (typeof addShake === 'function') addShake(12);
            emitBitshiftHitSparks(player.x, player.y, '#ffffff', 8);
            if (player.hp <= 0) {
                player.hp = 0;
                deathTimer = 0;
                playerExploded = false;
                gameState = 'DYING';
            }
        }

        function drawBitshiftScrollerRuntime(now) {
            if (!isBitshiftScrollerModeActive()) return;
            const t = (now || currentFrameNow || performance.now()) * 0.001;
            ctx.save();
            drawBitshiftBackground(t);
            drawBitshiftHazards();
            drawBitshiftPickups();
            drawBitshiftProjectiles();
            drawBitshiftEnemies();
            drawBitshiftBoss();
            drawBitshiftEnemyBullets();
            drawBitshiftParticles();
            drawBitshiftPlayer(now);
            drawBitshiftMessages();
            ctx.restore();
        }

        function drawBitshiftBackground(t) {
            ctx.fillStyle = '#040611';
            ctx.fillRect(0, 0, width | 0, height | 0);
            const glow = ctx.createRadialGradient(width * 0.80, height * 0.26, 8, width * 0.80, height * 0.26, 190);
            glow.addColorStop(0, 'rgba(255, 241, 232, 0.22)');
            glow.addColorStop(0.28, 'rgba(255, 79, 74, 0.16)');
            glow.addColorStop(1, 'rgba(255, 79, 74, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const star of bitshiftScrollerState.stars) {
                ctx.globalAlpha = star.alpha;
                ctx.fillStyle = star.color;
                ctx.font = `bold ${Math.max(9, Math.round(9 + star.depth * 6))}px Courier New`;
                ctx.fillText(star.glyph, star.x | 0, (star.y + Math.sin(star.wobble) * 2) | 0);
            }
            ctx.globalAlpha = 0.22;
            ctx.font = `bold 14px Courier New`;
            const laneGap = 52;
            for (let y = 96; y < height - HUD_HEIGHT - 20; y += laneGap) {
                const offset = (bitshiftScrollerState.distance * (0.35 + (y % 3) * 0.12)) % laneGap;
                ctx.fillStyle = y % 2 ? '#8ff7ff' : '#ff8a3d';
                for (let x = -offset; x < width + laneGap; x += laneGap) {
                    ctx.fillText(y % 2 ? '<>' : '01', x, y);
                }
            }
            ctx.globalAlpha = 1;
        }

        function drawBitshiftSprite(sprite, x, y, color, scale = 1, flashTimer = 0) {
            if (!sprite || !sprite.length) return;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.round(15 * scale)}px Courier New`;
            ctx.fillStyle = flashTimer > 0 ? '#ffffff' : color;
            ctx.shadowColor = color;
            ctx.shadowBlur = glowEnabled ? 8 : 0;
            const lineH = 16 * scale;
            for (let r = 0; r < sprite.length; r++) {
                ctx.fillText(sprite[r], x, y + (r - (sprite.length - 1) / 2) * lineH);
            }
            ctx.restore();
        }

        function drawBitshiftEnemies() {
            for (const enemy of enemies) {
                if (!enemy || !enemy.isBitshiftEnemy) continue;
                const pulse = enemy.bitshiftType === 'parityMine' ? 1 + Math.sin(bitshiftScrollerState.elapsed * 6 + enemy.phase) * 0.08 : 1;
                drawBitshiftSprite(enemy.sprite, enemy.x, enemy.y, enemy.color, pulse, enemy.flashTimer || 0);
            }
        }

        function drawBitshiftBoss() {
            if (!boss || !boss.isBitshiftBoss) return;
            drawBitshiftSprite(boss.sprite, boss.x, boss.y, boss.color, boss.renderScale || 1, boss.flashTimer || 0);
            const barW = 230;
            const barX = boss.x - barW / 2;
            const barY = boss.y + 58;
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.fillRect(barX, barY, barW, 8);
            ctx.fillStyle = '#ff4f4a';
            ctx.fillRect(barX, barY, barW * Math.max(0, boss.hp / boss.maxHp), 8);
            ctx.strokeStyle = '#fff1e8';
            ctx.strokeRect(barX, barY, barW, 8);
        }

        function drawBitshiftHazards() {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const h of bitshiftScrollerState.hazards) {
                ctx.fillStyle = 'rgba(255, 79, 74, 0.28)';
                ctx.strokeStyle = '#ff8a3d';
                ctx.shadowColor = '#ff4f4a';
                ctx.shadowBlur = glowEnabled ? 9 : 0;
                if (h.type === 'dataColumn') {
                    const topH = Math.max(0, h.gapY - h.gapH / 2);
                    const bottomY = h.gapY + h.gapH / 2;
                    ctx.fillRect(h.x, 0, h.w, topH);
                    ctx.fillRect(h.x, bottomY, h.w, height - HUD_HEIGHT - bottomY);
                    ctx.strokeRect(h.x, 0, h.w, topH);
                    ctx.strokeRect(h.x, bottomY, h.w, height - HUD_HEIGHT - bottomY);
                    ctx.fillStyle = '#fff1e8';
                    ctx.font = 'bold 12px Courier New';
                    for (let y = 18; y < topH; y += 28) ctx.fillText(y % 56 ? '1' : '0', h.x + h.w / 2, y);
                    for (let y = bottomY + 18; y < height - HUD_HEIGHT; y += 28) ctx.fillText(y % 56 ? '0' : '1', h.x + h.w / 2, y);
                } else if (h.type === 'debrisBlock') {
                    ctx.fillStyle = 'rgba(143, 247, 255, 0.22)';
                    ctx.fillRect(h.x, h.y, h.w, h.h);
                    ctx.strokeStyle = '#8ff7ff';
                    ctx.strokeRect(h.x, h.y, h.w, h.h);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 13px Courier New';
                    ctx.fillText('REG', h.x + h.w / 2, h.y + h.h / 2);
                }
            }
            ctx.restore();
        }

        function drawBitshiftProjectiles() {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const p of comboProjectiles) {
                if (p.releaseDelay > 0) continue;
                ctx.globalAlpha = Math.max(0.25, Math.min(1, (p.life || 1) / Math.max(0.1, p.maxLife || 1)));
                ctx.fillStyle = p.color || '#ffffff';
                ctx.shadowColor = p.color || '#ffffff';
                ctx.shadowBlur = glowEnabled ? 8 : 0;
                ctx.font = `bold ${Math.round(16 * ((p.stats && p.stats.sizeMult) || 1))}px Courier New`;
                ctx.fillText(p.sprite || '>', p.x | 0, p.y | 0);
            }
            for (const bombObj of bombProjectiles) {
                ctx.globalAlpha = 1;
                ctx.fillStyle = bombObj.launchColor || '#8ff7ff';
                ctx.font = 'bold 22px Courier New';
                ctx.fillText('o', bombObj.x | 0, bombObj.y | 0);
            }
            for (const ring of bombBlastRings) {
                const progress = Math.max(0, Math.min(1, ring.life / ring.maxLife));
                ctx.globalAlpha = 1 - progress;
                ctx.strokeStyle = ring.color || '#8ff7ff';
                ctx.lineWidth = ring.lineWidth || 2;
                ctx.beginPath();
                ctx.arc(ring.x, ring.y, ring.maxRadius * progress, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawBitshiftEnemyBullets() {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const b of enemyBullets) {
                ctx.fillStyle = b.color || '#ff8a3d';
                ctx.shadowColor = b.color || '#ff8a3d';
                ctx.shadowBlur = glowEnabled ? 7 : 0;
                ctx.font = 'bold 17px Courier New';
                ctx.fillText(b.char || 'o', b.x | 0, b.y | 0);
            }
            ctx.restore();
        }

        function drawBitshiftPickups() {
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

        function drawBitshiftParticles() {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const p of bitshiftScrollerState.particles) {
                ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
                ctx.fillStyle = p.color || '#ffffff';
                ctx.font = 'bold 13px Courier New';
                ctx.fillText(p.char || '.', p.x | 0, p.y | 0);
            }
            for (const d of debris) {
                ctx.globalAlpha = Math.max(0, Math.min(1, d.life || 1));
                ctx.fillStyle = d.color || '#ff8a3d';
                ctx.font = 'bold 13px Courier New';
                ctx.fillText(d.char || '*', d.x | 0, d.y | 0);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawBitshiftPlayer(now) {
            if (!player || typeof drawPlayerShip !== 'function') return;
            if (gameState === 'DYING' && playerExploded) return;
            const pulseVisuals = typeof getPlayerPulseVisuals === 'function'
                ? getPlayerPulseVisuals(now)
                : { color: player.color || '#ffffff', glow: 8 };
            player.color = player.flashTimer > 0 ? '#ffffff' : pulseVisuals.color;
            ctx.save();
            ctx.fillStyle = player.color;
            ctx.shadowColor = '#8ff7ff';
            ctx.shadowBlur = glowEnabled ? pulseVisuals.glow : 0;
            drawPlayerShip(player, 'center');
            ctx.restore();
        }

        function drawBitshiftMessages() {
            if (bitshiftScrollerState.messageTimer <= 0 && !bitshiftScrollerState.stageCleared) return;
            const text = bitshiftScrollerState.stageCleared ? 'VECTOR ROUTE CLEAR' : bitshiftScrollerState.message;
            if (!text) return;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = bitshiftScrollerState.stageCleared ? 1 : Math.min(1, bitshiftScrollerState.messageTimer);
            ctx.fillStyle = 'rgba(0, 8, 16, 0.72)';
            ctx.fillRect(width / 2 - 180, 78, 360, 46);
            ctx.strokeStyle = bitshiftScrollerState.stageCleared ? '#8ff7ff' : '#ff8a3d';
            ctx.strokeRect(width / 2 - 180, 78, 360, 46);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = bitshiftScrollerState.stageCleared ? '#8ff7ff' : '#ff8a3d';
            ctx.shadowBlur = glowEnabled ? 10 : 0;
            ctx.font = `bold 16px 'Electrolize', sans-serif`;
            ctx.fillText(text, width / 2, 101);
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function debugBitshiftScrollerState() {
            const snapshot = {
                active: !!(bitshiftScrollerState && bitshiftScrollerState.active),
                activeMode: typeof getActiveGameMode === 'function' ? getActiveGameMode() : 'unknown',
                elapsed: bitshiftScrollerState ? bitshiftScrollerState.elapsed : 0,
                distance: bitshiftScrollerState ? bitshiftScrollerState.distance : 0,
                stagePhase: bitshiftScrollerState ? bitshiftScrollerState.stagePhase : 'offline',
                enemyCount: Array.isArray(enemies) ? enemies.filter(enemy => enemy && enemy.isBitshiftEnemy).length : 0,
                hazardCount: bitshiftScrollerState && Array.isArray(bitshiftScrollerState.hazards) ? bitshiftScrollerState.hazards.length : 0,
                projectileCount: Array.isArray(comboProjectiles) ? comboProjectiles.length : 0,
                bossSpawned: !!(bitshiftScrollerState && bitshiftScrollerState.bossSpawned),
                bossDefeated: !!(bitshiftScrollerState && bitshiftScrollerState.bossDefeated),
                stageCleared: !!(bitshiftScrollerState && bitshiftScrollerState.stageCleared),
                player: player ? {
                    x: player.x,
                    y: player.y,
                    hp: player.hp,
                    maxHp: player.maxHp
                } : null
            };
            if (typeof console !== 'undefined' && typeof console.table === 'function') console.table(snapshot);
            return snapshot;
        }

        if (typeof window !== 'undefined') {
            window.startBitshiftDwarfRun = function() {
                if (typeof GALAXY_DEFINITIONS !== 'undefined') {
                    const index = GALAXY_DEFINITIONS.findIndex(galaxy => galaxy && galaxy.id === 'red-dwarf');
                    if (index >= 0) {
                        selectedGalaxyIndex = index;
                        currentGalaxyIndex = index;
                    }
                }
                beginBitshiftScrollerRun();
            };
            window.debugBitshiftScrollerState = debugBitshiftScrollerState;
        }
