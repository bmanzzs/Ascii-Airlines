        // Bitshift Dwarf / Vector Scroll mode owner.
        // First playable side-scroller prototype. Keep mode-specific runtime logic here.

        const BITSHIFT_MODE_ID = 'bitshiftScroller';
        const BITSHIFT_FIRE_ANGLE = 0;
        const BITSHIFT_SHIP_RENDER_ROTATION = Math.PI / 2;
        const BITSHIFT_SCREEN_SHAKE_DECAY = 0.88;
        const BITSHIFT_WOBBLE_DECAY = 0.82;
        const BITSHIFT_STAGE_CLEAR_DELAY = 4.2;
        const BITSHIFT_WAVE_CLEAR_DELAY = 2.4;
        const BITSHIFT_PLANET_BOSS_ATTACKS = Object.freeze([
            'tidalLance',
            'moonBloom',
            'eventHorizon',
            'orbitalGuillotine'
        ]);
        const BITSHIFT_WAVE_DEFINITIONS = Object.freeze([
            {
                number: 1,
                name: 'BOOT WAKE',
                phase: 'wave-1',
                duration: 18,
                events: [
                    { at: 0.6, type: 'phaseMessage', message: 'WAVE 1 // BOOT WAKE', seconds: 2.6 },
                    { at: 1.8, type: 'droneLine', count: 4, y: 0.34, spacing: 70 },
                    { at: 5.8, type: 'droneLine', count: 5, y: 0.62, spacing: 62 },
                    { at: 9.8, type: 'diagonalSkimmers', count: 5, y: 0.25, step: 44 },
                    { at: 13.2, type: 'sineDrones', count: 7, y: 0.52, spacing: 46 }
                ]
            },
            {
                number: 2,
                name: 'OPERATOR LANES',
                phase: 'wave-2',
                duration: 23,
                events: [
                    { at: 0.5, type: 'phaseMessage', message: 'WAVE 2 // OPERATOR LANES', seconds: 2.6 },
                    { at: 1.2, type: 'dataColumn', gapY: 0.50, gapH: 230, w: 34 },
                    { at: 4.2, type: 'splitLine', count: 8 },
                    { at: 7.0, type: 'debrisBlocks', y: 0.23, count: 4, spacing: 72 },
                    { at: 11.2, type: 'laneGates', gapY: 0.62, gapH: 220 },
                    { at: 16.2, type: 'operatorSurge', count: 7, y: 0.42 }
                ]
            },
            {
                number: 3,
                name: 'REGISTER GAUNTLET',
                phase: 'wave-3',
                duration: 25,
                events: [
                    { at: 0.5, type: 'phaseMessage', message: 'WAVE 3 // REGISTER GAUNTLET', seconds: 2.6 },
                    { at: 1.2, type: 'turretPair' },
                    { at: 5.8, type: 'turretWall', gapY: 0.42 },
                    { at: 11.4, type: 'turretLane', y: 0.58 },
                    { at: 15.6, type: 'sineDrones', count: 6, y: 0.38, spacing: 52 },
                    { at: 19.8, type: 'turretPair', stagger: 56 }
                ]
            },
            {
                number: 4,
                name: 'PARITY STORM',
                phase: 'wave-4',
                duration: 26,
                events: [
                    { at: 0.5, type: 'phaseMessage', message: 'WAVE 4 // PARITY STORM', seconds: 2.6 },
                    { at: 1.4, type: 'mineCluster', y: 0.30 },
                    { at: 5.0, type: 'mineWall', gapY: 0.54 },
                    { at: 8.8, type: 'debrisBlocks', y: 0.56, count: 5, spacing: 64 },
                    { at: 12.8, type: 'skimmerCross', count: 8 },
                    { at: 17.0, type: 'mineCluster', y: 0.68 },
                    { at: 21.6, type: 'recoveryDrop', focus: true }
                ]
            },
            {
                number: 5,
                name: 'NULLBYTE PLANET',
                phase: 'boss',
                boss: true,
                duration: 999,
                events: [
                    { at: 0.4, type: 'phaseMessage', message: 'WAVE 5 // NULLBYTE PLANET', seconds: 3.0 },
                    { at: 2.1, type: 'boss' }
                ]
            }
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
            },
            logicNeedle: {
                sprite: ['<-=>'],
                color: '#ffe66d',
                hp: 22,
                speed: 218,
                radius: 20,
                damage: 12,
                score: 170,
                debrisCap: 18
            },
            overflowBulwark: {
                sprite: ['{###}', '<###>'],
                color: '#ffb07c',
                hp: 78,
                speed: 86,
                radius: 34,
                damage: 17,
                score: 340,
                debrisCap: 30
            }
        });

        const BITSHIFT_PLANET_BOSS_SPRITE = [
            '   .-=====-.   ',
            ' .\'/ 01010 \\`. ',
            '< | NULLBYTE | >',
            ' .,/ 10101 \\,. ',
            '   `-=====-`   '
        ];

        function createBitshiftScrollerState() {
            return {
                active: false,
                elapsed: 0,
                distance: 0,
                scrollSpeed: 150,
                spawnTimer: 0,
                waveIndex: 0,
                waveNumber: 0,
                waveTimer: 0,
                waveEventIndex: 0,
                waveClearTimer: 0,
                waveName: '',
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
                bossAttackName: '',
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
            const wave = BITSHIFT_WAVE_DEFINITIONS[Math.max(0, (bitshiftScrollerState.waveNumber || 1) - 1)];
            return wave ? wave.phase : (elapsed < 4 ? 'warmup' : 'wave');
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
            updateBitshiftWaveDirector(safeDt);
            updateBitshiftHazards(safeDt);
            updateBitshiftEnemies(safeDt);
            updateBitshiftBoss(safeDt);
            updateBitshiftEnemyBullets(safeDt);
            updateBitshiftProjectiles(safeDt);
            updateBitshiftBombs(safeDt);
            updateBitshiftPickups(safeDt);
            updateBitshiftParticles(safeDt);
            updateBitshiftStageClear(safeDt);
            decayBitshiftScreenFeedback(safeDt);
        }

        function decayBitshiftScreenFeedback(dt) {
            const frameScale = Math.max(0, dt || 0) * 60;
            if (typeof shake === 'number' && shake > 0) {
                shake *= Math.pow(BITSHIFT_SCREEN_SHAKE_DECAY, frameScale);
                if (shake < 0.35) shake = 0;
            }
            if (typeof wobble === 'number' && Math.abs(wobble) > 0.01) {
                wobble *= Math.pow(BITSHIFT_WOBBLE_DECAY, frameScale);
                if (Math.abs(wobble) < 0.01) wobble = 0;
            }
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

        function getBitshiftWaveDefinition(number) {
            return BITSHIFT_WAVE_DEFINITIONS[Math.max(0, Math.min(BITSHIFT_WAVE_DEFINITIONS.length - 1, number - 1))] || null;
        }

        function startBitshiftWave(number) {
            const wave = getBitshiftWaveDefinition(number);
            if (!wave || bitshiftScrollerState.stageCleared) return;
            bitshiftScrollerState.waveNumber = wave.number;
            bitshiftScrollerState.waveName = wave.name;
            bitshiftScrollerState.waveTimer = 0;
            bitshiftScrollerState.waveEventIndex = 0;
            bitshiftScrollerState.waveIndex = 0;
            bitshiftScrollerState.waveClearTimer = 0;
            bitshiftScrollerState.stagePhase = wave.phase;
            setBitshiftMessage(`WAVE ${wave.number} // ${wave.name}`, wave.boss ? 3.0 : 2.4);
            if (typeof addShake === 'function' && wave.number > 1) addShake(wave.boss ? 18 : 8);
        }

        function updateBitshiftWaveDirector(dt) {
            if (bitshiftScrollerState.stageCleared) return;
            if ((bitshiftScrollerState.waveNumber || 0) <= 0) {
                startBitshiftWave(1);
                return;
            }

            const wave = getBitshiftWaveDefinition(bitshiftScrollerState.waveNumber);
            if (!wave) return;
            bitshiftScrollerState.waveTimer += dt;
            const events = wave.events || [];
            while (bitshiftScrollerState.waveEventIndex < events.length
                && bitshiftScrollerState.waveTimer >= events[bitshiftScrollerState.waveEventIndex].at) {
                spawnBitshiftTimelineEvent(events[bitshiftScrollerState.waveEventIndex]);
                bitshiftScrollerState.waveEventIndex++;
                bitshiftScrollerState.waveIndex = bitshiftScrollerState.waveEventIndex;
            }

            if (wave.boss) return;
            const eventsComplete = bitshiftScrollerState.waveEventIndex >= events.length;
            const forcedAdvance = bitshiftScrollerState.waveTimer >= (wave.duration || 20);
            if (eventsComplete && (forcedAdvance || isBitshiftCombatQuiet())) {
                bitshiftScrollerState.waveClearTimer += dt;
                if (bitshiftScrollerState.waveClearTimer >= BITSHIFT_WAVE_CLEAR_DELAY) {
                    startBitshiftWave(bitshiftScrollerState.waveNumber + 1);
                }
            } else {
                bitshiftScrollerState.waveClearTimer = 0;
            }
        }

        function isBitshiftCombatQuiet() {
            const activeEnemy = enemies.some(enemy => enemy && enemy.isBitshiftEnemy && enemy.x > -80 && enemy.x < width + 170);
            if (activeEnemy) return false;
            return !bitshiftScrollerState.hazards.some(h => h && h.x + (h.w || 80) > -50 && h.x < width + 140);
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
            } else if (event.type === 'operatorSurge') {
                for (let i = 0; i < event.count; i++) {
                    spawnBitshiftEnemy(i % 4 === 0 ? 'overflowBulwark' : 'logicNeedle', {
                        x: width + 84 + i * 62,
                        y: height * event.y + Math.sin(i * 1.15) * 118,
                        sineAmp: i % 4 === 0 ? 18 : 42,
                        sineSpeed: 1.7,
                        phase: i * 0.65
                    });
                }
                setBitshiftMessage('OPERATOR SURGE');
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
            } else if (event.type === 'mineWall') {
                const lanes = 6;
                const playTop = 128;
                const playBottom = getBitshiftPlayfieldBottom(74);
                const skipLane = Math.max(1, Math.min(lanes - 2, Math.round((event.gapY || 0.5) * (lanes - 1))));
                for (let lane = 0; lane < lanes; lane++) {
                    if (lane === skipLane || lane === skipLane + 1) continue;
                    spawnBitshiftEnemy('parityMine', {
                        x: width + 90 + lane * 22,
                        y: playTop + (playBottom - playTop) * (lane / (lanes - 1)),
                        phase: lane * 0.55
                    });
                }
                setBitshiftMessage('PARITY WALL');
            } else if (event.type === 'skimmerCross') {
                for (let i = 0; i < event.count; i++) {
                    spawnBitshiftEnemy('shiftSkimmer', {
                        x: width + 80 + i * 42,
                        y: i % 2 === 0 ? height * 0.22 : height * 0.76,
                        vy: i % 2 === 0 ? 72 : -72
                    });
                }
                setBitshiftMessage('SHIFT CROSS');
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
                x: width + 210,
                y: height * 0.47,
                hp: 1450,
                maxHp: 1450,
                name: 'NULLBYTE PLANET',
                sprite: BITSHIFT_PLANET_BOSS_SPRITE,
                phase: 'ACTIVE',
                timer: 0,
                flashTimer: 0,
                color: '#b48cff',
                isBitshiftBoss: true,
                isBitshiftPlanetBoss: true,
                onScreen: true,
                collisionRadius: 88,
                attackIndex: 0,
                attackName: '',
                attackTimer: 0,
                attackStep: 0,
                attackCooldown: 1.2,
                gravityPulse: 0,
                ringAngle: 0,
                moonAngle: 0,
                flareTimer: 0,
                entryTargetX: width - 166,
                renderScale: 1.25,
                explosionDebrisCap: 150
            };
            bitshiftScrollerState.bossAttackName = '';
            setBitshiftMessage('NULLBYTE PLANET', 3.5);
            if (typeof addShake === 'function') addShake(22);
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
                } else if (type === 'overflowBulwark') {
                    e.x += e.vx * dt;
                    e.y = e.baseY + Math.sin(bitshiftScrollerState.elapsed * (e.sineSpeed || 1.2) + e.phase) * (e.sineAmp || 12);
                    e.fireTimer -= dt;
                    if (e.fireTimer <= 0 && e.x < width - 50) {
                        e.fireTimer = 1.35 + Math.random() * 0.45;
                        fireBitshiftEnemyBullet(e.x - 28, e.y, Math.PI, 190, { char: '=', color: '#ffe66d', radius: 10, damage: 10 });
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
            boss.ringAngle += dt * (0.55 + Math.max(0, 1 - boss.hp / boss.maxHp) * 0.65);
            boss.moonAngle += dt * 0.78;
            boss.gravityPulse = Math.max(0, (boss.gravityPulse || 0) - dt * 0.55);
            boss.flareTimer = Math.max(0, (boss.flareTimer || 0) - dt);
            boss.x += (boss.entryTargetX - boss.x) * Math.min(1, dt * 1.10);
            boss.y = height * 0.47 + Math.sin(boss.timer * 0.68) * 42 + Math.sin(boss.timer * 1.55) * 8;
            boss.flashTimer = Math.max(0, (boss.flashTimer || 0) - dt);

            updateBitshiftPlanetBossAttacks(boss, dt);
            if (isBitshiftCircleTouchingPlayer(boss.x, boss.y, boss.collisionRadius || 60)) {
                damageBitshiftPlayer(20);
            }
            if (boss.hp <= 0) defeatBitshiftBoss();
        }

        function beginBitshiftPlanetAttack(bossObj) {
            const attack = BITSHIFT_PLANET_BOSS_ATTACKS[bossObj.attackIndex % BITSHIFT_PLANET_BOSS_ATTACKS.length];
            bossObj.attackIndex++;
            bossObj.attackName = attack;
            bossObj.attackTimer = 0;
            bossObj.attackStep = 0;
            bossObj.gravityPulse = attack === 'eventHorizon' ? 1 : 0.45;
            bitshiftScrollerState.bossAttackName = attack;
            const labels = {
                tidalLance: 'TIDAL LANCE',
                moonBloom: 'MOON BLOOM',
                eventHorizon: 'EVENT HORIZON',
                orbitalGuillotine: 'ORBITAL GUILLOTINE'
            };
            setBitshiftMessage(labels[attack] || 'NULLBYTE SHIFT', 2.2);
        }

        function endBitshiftPlanetAttack(bossObj, cooldown = 1.35) {
            bossObj.attackName = '';
            bossObj.attackTimer = 0;
            bossObj.attackStep = 0;
            bossObj.attackCooldown = Math.max(0.65, cooldown - Math.max(0, 1 - bossObj.hp / bossObj.maxHp) * 0.32);
            bitshiftScrollerState.bossAttackName = '';
        }

        function updateBitshiftPlanetBossAttacks(bossObj, dt) {
            if (!bossObj.attackName) {
                bossObj.attackCooldown -= dt;
                if (bossObj.attackCooldown <= 0 && bossObj.x < width - 60) beginBitshiftPlanetAttack(bossObj);
                return;
            }

            bossObj.attackTimer += dt;
            if (bossObj.attackName === 'tidalLance') {
                if (bossObj.attackStep === 0 && bossObj.attackTimer >= 0.28) {
                    bossObj.attackStep = 1;
                    spawnBitshiftTidalLances(bossObj);
                }
                if (bossObj.attackTimer >= 2.65) endBitshiftPlanetAttack(bossObj, 1.25);
            } else if (bossObj.attackName === 'moonBloom') {
                if (bossObj.attackTimer >= bossObj.attackStep * 0.42) {
                    fireBitshiftMoonBloom(bossObj, bossObj.attackStep);
                    bossObj.attackStep++;
                    bossObj.flareTimer = 0.22;
                }
                if (bossObj.attackStep >= 6 && bossObj.attackTimer >= 2.65) endBitshiftPlanetAttack(bossObj, 1.15);
            } else if (bossObj.attackName === 'eventHorizon') {
                if (bossObj.attackStep === 0 && bossObj.attackTimer >= 0.32) {
                    bossObj.attackStep = 1;
                    spawnBitshiftEventHorizons(bossObj);
                }
                applyBitshiftBossGravity(dt, 58 + Math.max(0, 1 - bossObj.hp / bossObj.maxHp) * 26);
                if (bossObj.attackTimer >= 3.15) endBitshiftPlanetAttack(bossObj, 1.45);
            } else if (bossObj.attackName === 'orbitalGuillotine') {
                if (bossObj.attackTimer >= bossObj.attackStep * 0.50) {
                    fireBitshiftOrbitalGuillotine(bossObj, bossObj.attackStep);
                    bossObj.attackStep++;
                    bossObj.flareTimer = 0.18;
                }
                if (bossObj.attackStep >= 5 && bossObj.attackTimer >= 2.9) endBitshiftPlanetAttack(bossObj, 1.25);
            }
        }

        function spawnBitshiftTidalLances(bossObj) {
            const lanes = 5;
            const playTop = 118;
            const playBottom = getBitshiftPlayfieldBottom(82);
            const playerLane = Math.max(0, Math.min(lanes - 1, Math.round(((player.y - playTop) / Math.max(1, playBottom - playTop)) * (lanes - 1))));
            const firstLane = (playerLane + 1 + (bossObj.attackIndex % 2)) % lanes;
            const secondLane = (playerLane + 3) % lanes;
            [firstLane, secondLane].forEach((lane, index) => {
                const y = playTop + (playBottom - playTop) * (lane / (lanes - 1));
                bitshiftScrollerState.hazards.push({
                    type: 'planetBeam',
                    x: 0,
                    y: y - 15,
                    w: width,
                    h: 30,
                    age: 0,
                    windup: 0.72 + index * 0.10,
                    duration: 0.54,
                    damage: 16,
                    color: index ? '#8ff7ff' : '#ff8a3d'
                });
            });
            if (typeof addShake === 'function') addShake(10);
        }

        function fireBitshiftMoonBloom(bossObj, step) {
            const petals = 11;
            const gapAngle = Math.atan2(player.y - bossObj.y, player.x - bossObj.x);
            const base = bossObj.ringAngle + step * 0.32;
            for (let i = 0; i < petals; i++) {
                const angle = base + (i / petals) * Math.PI * 2;
                const angularGap = Math.abs(Math.atan2(Math.sin(angle - gapAngle), Math.cos(angle - gapAngle)));
                if (angularGap < 0.18 && step % 2 === 0) continue;
                const speed = 112 + step * 13 + (i % 3) * 16;
                fireBitshiftEnemyBullet(
                    bossObj.x + Math.cos(angle) * 62,
                    bossObj.y + Math.sin(angle) * 62,
                    angle,
                    speed,
                    { char: i % 3 === 0 ? '◌' : 'o', color: i % 2 ? '#b48cff' : '#ffcf6d', radius: 9, damage: 8, life: 7.0 }
                );
            }
        }

        function spawnBitshiftEventHorizons(bossObj) {
            const offsets = [-0.18, 0.20];
            offsets.forEach((offset, i) => {
                const y = Math.max(135, Math.min(getBitshiftPlayfieldBottom(90), player.y + height * offset));
                fireBitshiftEnemyBullet(
                    bossObj.x - 84,
                    y,
                    Math.PI + (i ? -0.055 : 0.055),
                    92,
                    {
                        char: '●',
                        color: '#080812',
                        radius: 24,
                        damage: 14,
                        life: 8.5,
                        isGravityWell: true,
                        pullRadius: 155,
                        pullStrength: 78,
                        haloColor: i ? '#8ff7ff' : '#b48cff'
                    }
                );
            });
            if (typeof addShake === 'function') addShake(14);
        }

        function fireBitshiftOrbitalGuillotine(bossObj, step) {
            const playTop = 122;
            const playBottom = getBitshiftPlayfieldBottom(88);
            const lanes = 6;
            const lane = (step * 2 + bossObj.attackIndex) % lanes;
            const y = playTop + (playBottom - playTop) * (lane / (lanes - 1));
            for (let i = 0; i < 4; i++) {
                const phase = i * Math.PI * 0.5 + step * 0.35;
                fireBitshiftEnemyBullet(
                    bossObj.x - 60 + i * 12,
                    y + Math.sin(phase) * 34,
                    Math.PI,
                    185 + i * 18,
                    {
                        char: i % 2 ? ')' : '(',
                        color: i % 2 ? '#8ff7ff' : '#ff8a3d',
                        radius: 11,
                        damage: 10,
                        life: 6.2,
                        sineAmp: 28 + i * 4,
                        sineSpeed: 3.2,
                        phase
                    }
                );
            }
        }

        function applyBitshiftBossGravity(dt, strength) {
            if (!boss || !player || player.hp <= 0) return;
            const dx = boss.x - player.x;
            const dy = boss.y - player.y;
            const dist = Math.max(80, Math.hypot(dx, dy));
            const pull = Math.max(0, 1 - dist / 540) * strength * dt;
            player.vx += (dx / dist) * pull;
            player.vy += (dy / dist) * pull;
        }

        function fireBitshiftEnemyBullet(x, y, angle, speed, options = {}) {
            enemyBullets.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                baseY: y,
                char: options.char || 'o',
                color: options.color || '#ff8a3d',
                radius: options.radius || 9,
                damage: options.damage || 9,
                life: options.life || 5.4,
                sineAmp: options.sineAmp || 0,
                sineSpeed: options.sineSpeed || 0,
                phase: options.phase || 0,
                isGravityWell: !!options.isGravityWell,
                pullRadius: options.pullRadius || 0,
                pullStrength: options.pullStrength || 0,
                haloColor: options.haloColor || options.color || '#8ff7ff',
                isBitshiftBullet: true
            });
        }

        function updateBitshiftEnemyBullets(dt) {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i];
                b.x += (b.vx || 0) * dt;
                b.y += (b.vy || 0) * dt;
                if (b.sineAmp) {
                    b.y = b.baseY + Math.sin(bitshiftScrollerState.elapsed * b.sineSpeed + b.phase) * b.sineAmp;
                }
                if (b.isGravityWell && player && player.hp > 0) {
                    const dx = b.x - player.x;
                    const dy = b.y - player.y;
                    const dist = Math.max(24, Math.hypot(dx, dy));
                    const pullRadius = b.pullRadius || 130;
                    if (dist < pullRadius) {
                        const pull = (1 - dist / pullRadius) * (b.pullStrength || 60) * dt;
                        player.vx += (dx / dist) * pull;
                        player.vy += (dy / dist) * pull;
                    }
                    if (Math.random() < 0.45) {
                        bitshiftScrollerState.particles.push({
                            x: b.x + (Math.random() - 0.5) * pullRadius * 0.55,
                            y: b.y + (Math.random() - 0.5) * pullRadius * 0.35,
                            vx: (b.x - player.x) * 0.05,
                            vy: (b.y - player.y) * 0.05,
                            char: Math.random() < 0.5 ? '0' : '1',
                            color: b.haloColor || '#8ff7ff',
                            life: 0.18 + Math.random() * 0.22
                        });
                    }
                }
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
                if (h.type === 'planetBeam') {
                    h.age = (h.age || 0) + dt;
                    const active = h.age >= (h.windup || 0) && h.age <= (h.windup || 0) + (h.duration || 0.5);
                    if (active && isBitshiftPlayerTouchingRect(h)) damageBitshiftPlayer(h.damage || 12);
                    if (h.age > (h.windup || 0) + (h.duration || 0.5) + 0.16) bitshiftScrollerState.hazards.splice(i, 1);
                    continue;
                }
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
            if (target && target.isBitshiftBoss) {
                return Math.hypot(projectile.x - target.x, projectile.y - target.y) < radius + (target.collisionRadius || 60);
            }
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
            bitshiftScrollerState.message = 'NULLBYTE PLANET DEFEATED';
            bitshiftScrollerState.messageTimer = 6;
            emitBitshiftHitSparks(defeated.x, defeated.y, defeated.isBitshiftPlanetBoss ? '#b48cff' : '#ff8a3d', defeated.isBitshiftPlanetBoss ? 72 : 48);
            if (typeof explodeEnemy === 'function') explodeEnemy(defeated);
            if (typeof addShake === 'function') addShake(defeated.isBitshiftPlanetBoss ? 34 : 18);
            if (typeof addScore === 'function') addScore(defeated.isBitshiftPlanetBoss ? 12000 : 5000, false);
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
            if (boss.isBitshiftPlanetBoss) {
                drawBitshiftPlanetBoss(boss);
                return;
            }
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

        function drawBitshiftPlanetBoss(bossObj) {
            const t = bitshiftScrollerState.elapsed;
            const x = bossObj.x;
            const y = bossObj.y;
            const healthRatio = Math.max(0, bossObj.hp / bossObj.maxHp);
            const rage = 1 - healthRatio;
            const radius = 70 + Math.sin(t * 1.8) * 3 + (bossObj.flareTimer || 0) * 10;
            const attackPulse = bossObj.attackName ? 1 : 0;
            const gravityPulse = bossObj.gravityPulse || 0;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const halo = ctx.createRadialGradient(x, y, radius * 0.45, x, y, radius * (3.1 + gravityPulse * 0.8));
            halo.addColorStop(0, `rgba(255, 255, 255, ${0.10 + attackPulse * 0.06})`);
            halo.addColorStop(0.18, `rgba(180, 140, 255, ${0.20 + gravityPulse * 0.10})`);
            halo.addColorStop(0.44, `rgba(255, 92, 72, ${0.10 + rage * 0.08})`);
            halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = halo;
            ctx.fillRect(x - radius * 3.6, y - radius * 3.6, radius * 7.2, radius * 7.2);

            ctx.translate(x, y);
            ctx.rotate(Math.sin(t * 0.36) * 0.08);
            for (let ring = 0; ring < 4; ring++) {
                const ringAngle = bossObj.ringAngle * (ring % 2 ? -1.1 : 1) + ring * 0.64;
                const ringAlpha = 0.30 - ring * 0.045 + attackPulse * 0.08;
                ctx.save();
                ctx.rotate(ringAngle);
                ctx.strokeStyle = ring % 2 ? `rgba(143, 247, 255, ${ringAlpha})` : `rgba(255, 138, 61, ${ringAlpha + rage * 0.08})`;
                ctx.lineWidth = ring === 1 ? 4 : 2;
                if (glowEnabled) {
                    ctx.shadowColor = ring % 2 ? '#8ff7ff' : '#ff8a3d';
                    ctx.shadowBlur = 12 + attackPulse * 10;
                }
                ctx.beginPath();
                ctx.ellipse(0, 0, radius * (1.35 + ring * 0.13), radius * (0.38 + ring * 0.035), 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.clip();
            const body = ctx.createRadialGradient(-radius * 0.34, -radius * 0.36, 6, 0, 0, radius * 1.08);
            body.addColorStop(0, bossObj.flashTimer > 0 ? '#ffffff' : '#34324d');
            body.addColorStop(0.28, '#151424');
            body.addColorStop(0.66, '#04040a');
            body.addColorStop(1, '#000000');
            ctx.fillStyle = body;
            ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
            ctx.globalAlpha = 0.30 + rage * 0.16;
            ctx.strokeStyle = '#b48cff';
            ctx.lineWidth = 1;
            for (let line = -5; line <= 5; line++) {
                const yy = line * radius * 0.18 + Math.sin(t * 0.8 + line) * 3;
                ctx.beginPath();
                ctx.ellipse(0, yy, radius * (0.82 - Math.abs(line) * 0.045), radius * 0.05, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 0.74;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 13px Courier New';
            for (let i = 0; i < 14; i++) {
                const a = i * 2.399 + bossObj.ringAngle * 0.28;
                const rr = radius * (0.18 + ((i * 37) % 64) / 100);
                ctx.fillStyle = i % 3 === 0 ? '#8ff7ff' : (i % 3 === 1 ? '#ff8a3d' : '#d8c8ff');
                ctx.fillText(i % 2 ? '0' : '1', Math.cos(a) * rr, Math.sin(a) * rr);
            }
            ctx.restore();
            ctx.restore();

            ctx.save();
            ctx.translate(x, y);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < 6; i++) {
                const a = bossObj.moonAngle + i * Math.PI / 3;
                const moonX = Math.cos(a) * radius * 1.72;
                const moonY = Math.sin(a) * radius * 0.56;
                ctx.globalAlpha = 0.58 + Math.sin(t * 2 + i) * 0.18;
                ctx.fillStyle = i % 2 ? '#8ff7ff' : '#ffcf6d';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = glowEnabled ? 9 : 0;
                ctx.font = `bold ${i % 2 ? 16 : 13}px Courier New`;
                ctx.fillText(i % 2 ? '◌' : '●', moonX, moonY);
            }
            ctx.restore();

            const barW = 270;
            const barX = x - barW / 2;
            const barY = y + radius + 34;
            ctx.fillStyle = 'rgba(0,0,0,0.74)';
            ctx.fillRect(barX, barY, barW, 9);
            const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            hpGrad.addColorStop(0, '#8ff7ff');
            hpGrad.addColorStop(0.42, '#b48cff');
            hpGrad.addColorStop(1, '#ff4f4a');
            ctx.fillStyle = hpGrad;
            ctx.fillRect(barX, barY, barW * healthRatio, 9);
            ctx.strokeStyle = '#fff1e8';
            ctx.strokeRect(barX, barY, barW, 9);
            ctx.textAlign = 'center';
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#b48cff';
            ctx.shadowBlur = glowEnabled ? 8 : 0;
            ctx.fillText(bossObj.name, x, barY + 26);
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
                if (h.type === 'planetBeam') {
                    const active = (h.age || 0) >= (h.windup || 0);
                    const pulse = active ? 0.62 + Math.sin(bitshiftScrollerState.elapsed * 24) * 0.18 : 0.18 + Math.sin(bitshiftScrollerState.elapsed * 18) * 0.08;
                    ctx.fillStyle = active
                        ? `rgba(255, 255, 255, ${0.10 + pulse * 0.05})`
                        : `rgba(255, 138, 61, ${0.05 + pulse * 0.04})`;
                    ctx.strokeStyle = h.color || '#ff8a3d';
                    ctx.shadowColor = h.color || '#ff8a3d';
                    ctx.shadowBlur = glowEnabled ? (active ? 18 : 8) : 0;
                    ctx.fillRect(h.x, h.y, h.w, h.h);
                    ctx.strokeRect(h.x, h.y, h.w, h.h);
                    ctx.font = 'bold 12px Courier New';
                    ctx.fillStyle = active ? '#ffffff' : (h.color || '#ff8a3d');
                    for (let x = 18; x < width; x += 78) ctx.fillText(active ? '====' : 'WARN', x, h.y + h.h / 2);
                } else if (h.type === 'dataColumn') {
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
                ctx.fillText(getBitshiftProjectileSprite(p), p.x | 0, p.y | 0);
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

        function getBitshiftProjectileSprite(projectile) {
            const sprite = projectile && projectile.sprite ? projectile.sprite : '>';
            if (sprite !== '|' && sprite !== '!') return sprite;
            const vx = projectile.baseVx || projectile.vx || Math.cos(projectile.releaseAngle || BITSHIFT_FIRE_ANGLE);
            return vx < -1 ? '<=' : '=>';
        }

        function drawBitshiftEnemyBullets() {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const b of enemyBullets) {
                if (b.isGravityWell) {
                    const pulse = 0.5 + Math.sin(bitshiftScrollerState.elapsed * 5 + b.x * 0.01) * 0.5;
                    ctx.save();
                    ctx.globalCompositeOperation = 'screen';
                    const r = b.pullRadius || 130;
                    const well = ctx.createRadialGradient(b.x, b.y, 4, b.x, b.y, r);
                    well.addColorStop(0, 'rgba(255,255,255,0.10)');
                    well.addColorStop(0.24, `rgba(180, 140, 255, ${0.16 + pulse * 0.05})`);
                    well.addColorStop(0.62, `rgba(143, 247, 255, ${0.05 + pulse * 0.04})`);
                    well.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = well;
                    ctx.fillRect(b.x - r, b.y - r, r * 2, r * 2);
                    ctx.strokeStyle = b.haloColor || '#8ff7ff';
                    ctx.globalAlpha = 0.32 + pulse * 0.22;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.ellipse(b.x, b.y, r * 0.36, r * 0.16, bitshiftScrollerState.elapsed * 1.6, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.fillStyle = b.color || '#ff8a3d';
                ctx.shadowColor = b.color || '#ff8a3d';
                ctx.shadowBlur = glowEnabled ? (b.isGravityWell ? 15 : 7) : 0;
                ctx.font = `bold ${b.isGravityWell ? 24 : 17}px Courier New`;
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
            ctx.translate(player.x, player.y);
            ctx.rotate(BITSHIFT_SHIP_RENDER_ROTATION);
            ctx.translate(-player.x, -player.y);
            drawPlayerShip(player, 'center');
            ctx.restore();
        }

        function drawBitshiftMessages() {
            if (bitshiftScrollerState.messageTimer <= 0 && !bitshiftScrollerState.stageCleared) return;
            const text = bitshiftScrollerState.stageCleared ? (bitshiftScrollerState.message || 'VECTOR ROUTE CLEAR') : bitshiftScrollerState.message;
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
                waveNumber: bitshiftScrollerState ? bitshiftScrollerState.waveNumber : 0,
                waveName: bitshiftScrollerState ? bitshiftScrollerState.waveName : '',
                waveTimer: bitshiftScrollerState ? bitshiftScrollerState.waveTimer : 0,
                enemyCount: Array.isArray(enemies) ? enemies.filter(enemy => enemy && enemy.isBitshiftEnemy).length : 0,
                hazardCount: bitshiftScrollerState && Array.isArray(bitshiftScrollerState.hazards) ? bitshiftScrollerState.hazards.length : 0,
                projectileCount: Array.isArray(comboProjectiles) ? comboProjectiles.length : 0,
                bossSpawned: !!(bitshiftScrollerState && bitshiftScrollerState.bossSpawned),
                bossAttackName: bitshiftScrollerState ? bitshiftScrollerState.bossAttackName : '',
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
