        // Prism Wake survivor mode: locked-camera horde survival built on the existing combat assets.
        const SURVIVOR_WORLD_W = 4800;
        const SURVIVOR_WORLD_H = 4800;
        const SURVIVOR_CAMERA_SCALE = 0.70;
        const SURVIVOR_PLAYER_ACCEL = 1550;
        const SURVIVOR_PLAYER_MAX_SPEED = 255;
        const SURVIVOR_PLAYER_TURN_RESPONSE = 16.2;
        const SURVIVOR_PLAYER_ROTATE_TURN_SPEED = 3.45;
        const SURVIVOR_PLAYER_RENDER_SCALE = 0.78;
        const SURVIVOR_SPAWN_RADIUS = 620;
        const SURVIVOR_DESPAWN_RADIUS = 1120;
        const SURVIVOR_ENEMY_CAP = 132;
        const SURVIVOR_BULLET_CAP = 90;
        const SURVIVOR_STAR_COUNT = 190;
        const SURVIVOR_WAVE_STYLE_DURATION = 45;
        const SURVIVOR_BOSS_INTERVAL = SURVIVOR_WAVE_STYLE_DURATION * 4;
        const SURVIVOR_TURN_AFTERIMAGE_LIFE = 0.24;
        const SURVIVOR_TURN_AFTERIMAGE_MAX = 5;

        const SURVIVOR_WAVE_STYLES = Object.freeze({
            swarm: {
                id: 'swarm',
                label: 'SWARM',
                spawnRate: 1.08,
                burstMult: 1.12,
                eliteDelayMult: 1.18,
                mix: [['base', 7], ['scout', 2], ['drifter', 1]],
                colors: ['#ff8fd8', '#dba8ff', '#8ff7ff'],
                speedMult: 1.03,
                hpMult: 0.92,
                sidestepMult: 1.0,
                spawnMode: 'ring'
            },
            patrol: {
                id: 'patrol',
                label: 'PATROL',
                spawnRate: 0.9,
                burstMult: 0.92,
                eliteDelayMult: 1.0,
                mix: [['base', 4], ['armored', 2], ['scout', 2], ['drifter', 1]],
                colors: ['#8fdcff', '#bda8ff', '#ffe66d'],
                speedMult: 0.98,
                hpMult: 1.0,
                sidestepMult: 1.18,
                spawnMode: 'paired'
            },
            flankers: {
                id: 'flankers',
                label: 'FLANKERS',
                spawnRate: 0.96,
                burstMult: 1.0,
                eliteDelayMult: 1.08,
                mix: [['scout', 4], ['base', 3], ['drifter', 2], ['crossfire', 1]],
                colors: ['#7fffea', '#77a8ff', '#ffb6de'],
                speedMult: 1.08,
                hpMult: 0.95,
                sidestepMult: 1.28,
                spawnMode: 'flanks'
            },
            crossfire: {
                id: 'crossfire',
                label: 'CROSSFIRE',
                spawnRate: 0.78,
                burstMult: 0.78,
                eliteDelayMult: 0.78,
                mix: [['crossfire', 5], ['armored', 2], ['base', 2], ['scout', 1]],
                colors: ['#9bffcf', '#ffe66d', '#8ff7ff'],
                speedMult: 0.9,
                hpMult: 1.02,
                sidestepMult: 0.92,
                spawnMode: 'lanes',
                fireTimer: 3.4
            },
            drift: {
                id: 'drift',
                label: 'DRIFT',
                spawnRate: 0.86,
                burstMult: 0.95,
                eliteDelayMult: 0.95,
                mix: [['drifter', 5], ['scout', 2], ['base', 2], ['armored', 1]],
                colors: ['#d884ff', '#77ffe7', '#9fb8ff'],
                speedMult: 0.94,
                hpMult: 1.0,
                sidestepMult: 1.85,
                spawnMode: 'diagonal'
            },
            bruisers: {
                id: 'bruisers',
                label: 'BRUISERS',
                spawnRate: 0.7,
                burstMult: 0.72,
                eliteDelayMult: 0.68,
                mix: [['armored', 5], ['elite', 1], ['base', 2], ['crossfire', 1]],
                colors: ['#ffd37a', '#ff9a8d', '#bda8ff'],
                speedMult: 0.82,
                hpMult: 1.18,
                sidestepMult: 0.78,
                spawnMode: 'ring'
            }
        });

        const SURVIVOR_WAVE_STYLE_ORDER = Object.freeze([
            'swarm', 'patrol', 'flankers', 'crossfire',
            'drift', 'bruisers', 'flankers', 'patrol',
            'crossfire', 'swarm', 'drift', 'bruisers'
        ]);

        const SURVIVOR_BOSS_SEQUENCE = Object.freeze([
            {
                sourceWave: 5,
                name: 'NULL PHANTOM',
                sprite: NULL_PHANTOM_SOURCE,
                color: '#9f8cff',
                hp: 760,
                renderScale: 0.72,
                type: 'nullPhantom',
                startMusic: startVoidWalkerMusic,
                stopMusic: stopVoidWalkerMusic
            },
            {
                sourceWave: 10,
                name: 'DISTORTED GLITCH',
                sprite: GLITCH_SPRITE_1,
                color: '#00ff66',
                hp: 900,
                renderScale: 0.78,
                type: 'distortedGlitch',
                startMusic: startDistortedGlitchMusic,
                stopMusic: stopDistortedGlitchMusic
            },
            {
                sourceWave: 15,
                name: 'GHOST SIGNAL',
                sprite: GHOST_SIGNAL_SOURCE,
                color: '#dbe7ff',
                hp: 1040,
                renderScale: 0.62,
                type: 'ghostSignal',
                startMusic: startSignalGhostMusic,
                stopMusic: stopSignalGhostMusic
            },
            {
                sourceWave: 20,
                name: 'OVERHEATING FIREWALL',
                sprite: FIREWALL_SPRITE,
                color: '#ff8a48',
                hp: 1140,
                renderScale: 0.74,
                type: 'overheatingFirewall',
                startMusic: startOverheatingFirewallMusic,
                stopMusic: stopOverheatingFirewallMusic
            },
            {
                sourceWave: 25,
                name: 'TURNBOUND TRINITY',
                sprite: TURNBOUND_TRINITY_RENDER_SPRITE,
                color: '#ffd37a',
                hp: 1320,
                renderScale: 0.48,
                type: 'turnboundTrinity',
                startMusic: startBattleStarshipMusic,
                stopMusic: stopBattleStarshipMusic
            },
            {
                sourceWave: 30,
                name: 'DREAD LITURGY',
                sprite: DREAD_LITURGY_SPRITE,
                color: '#d8d4ff',
                hp: 1500,
                renderScale: 0.64,
                type: 'dreadLiturgy',
                startMusic: startBlackVoidMusic,
                stopMusic: stopBlackVoidMusic
            }
        ]);

        let survivorState = createSurvivorState();

        function createSurvivorState() {
            return {
                active: false,
                elapsed: 0,
                spawnTimer: 0,
                eliteTimer: 8,
                bossTimer: SURVIVOR_BOSS_INTERVAL,
                bossSerial: 0,
                waveStyleOffset: 0,
                aimAngle: PLAYER_FIRE_FORWARD_ANGLE,
                cameraScale: SURVIVOR_CAMERA_SCALE,
                hordePulse: 0,
                autoFireHintTimer: 3.5,
                playerTurnAfterimages: [],
                stars: [],
                worldSeed: Math.random() * 10000
            };
        }

        function beginSurvivorRun() {
            if (typeof prepareRunStateForLaunch === 'function') prepareRunStateForLaunch();
            if (typeof setActiveGameMode === 'function') setActiveGameMode('survivor');
            survivorState = createSurvivorState();
            survivorState.active = true;
            initSurvivorStars();

            player.x = 0;
            player.y = 0;
            player.vx = 0;
            player.vy = 0;
            player.survivorAimAngle = PLAYER_FIRE_FORWARD_ANGLE;
            player.isFiring = true;
            player.isBeaming = false;
            player.lastFire = 0;
            player._renderLayoutCache = null;

            enemies = [];
            enemyBullets = [];
            comboProjectiles = [];
            bombProjectiles = [];
            bombBlastRings = [];
            debris = [];
            drops = [];
            xpOrbs = [];
            thrusterParticles = [];
            boss = null;
            if (typeof WaveManager !== 'undefined') {
                WaveManager.currentWave = 0;
                WaveManager.waveDelay = 999;
                WaveManager.hasSpawnedWave = true;
                WaveManager.interWaveDelayQueued = false;
                WaveManager.pendingFormationUnits = 0;
            }
            for (let i = 0; i < 8; i++) {
                spawnSurvivorEnemy(i % 5 === 0 ? 'armored' : 'base', {
                    angle: (Math.PI * 2 * i) / 8 + Math.random() * 0.22,
                    distance: 500 + Math.random() * 120
                });
            }

            gameState = 'PLAYING';
            pauseReturnState = 'PLAYING';
            titleAlpha = 0;
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
            if (typeof startMusic === 'function') startMusic();
            if (typeof applyCurrentVolume === 'function') applyCurrentVolume();
        }

        function resetSurvivorRuntimeStateForCampaign() {
            survivorState = createSurvivorState();
            if (player) {
                delete player.survivorAimAngle;
                player.isFiring = false;
                player.isBeaming = false;
                player._renderLayoutCache = null;
            }
        }

        function endSurvivorRun() {
            if (!survivorState) return;
            resetSurvivorRuntimeStateForCampaign();
            if (typeof setActiveGameMode === 'function') setActiveGameMode('campaign');
        }

        function getSurvivorPlayerAimAngle() {
            if (player && Number.isFinite(player.survivorAimAngle)) return player.survivorAimAngle;
            return survivorState && Number.isFinite(survivorState.aimAngle) ? survivorState.aimAngle : PLAYER_FIRE_FORWARD_ANGLE;
        }

        function getSurvivorWeaponOrigin(isRear = false) {
            const angle = getSurvivorPlayerAimAngle();
            const forward = isRear ? -26 : 30;
            const side = isRear ? 0 : 0;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return {
                x: player.x + cos * forward + Math.cos(angle + Math.PI / 2) * side,
                y: player.y + sin * forward + Math.sin(angle + Math.PI / 2) * side
            };
        }

        function getSurvivorArrowAimInput() {
            const aimX = (keys.arrowright ? 1 : 0) - (keys.arrowleft ? 1 : 0);
            const aimY = (keys.arrowdown ? 1 : 0) - (keys.arrowup ? 1 : 0);
            if (aimX === 0 && aimY === 0) return null;
            return {
                x: aimX,
                y: aimY,
                angle: Math.atan2(aimY, aimX)
            };
        }

        function survivorWorldToScreen(x, y) {
            const center = getSurvivorScreenCenter();
            const scale = survivorState.cameraScale || SURVIVOR_CAMERA_SCALE;
            return {
                x: center.x + (x - player.x) * scale,
                y: center.y + (y - player.y) * scale,
                scale
            };
        }

        function getSurvivorScreenCenter() {
            return {
                x: width / 2,
                y: (height - HUD_HEIGHT) * 0.52
            };
        }

        function initSurvivorStars() {
            survivorState.stars = [];
            const seed = survivorState.worldSeed || 0;
            for (let i = 0; i < SURVIVOR_STAR_COUNT; i++) {
                const n1 = Math.sin(seed + i * 19.19) * 43758.5453;
                const n2 = Math.sin(seed + i * 31.73) * 12415.2529;
                const n3 = Math.sin(seed + i * 47.11) * 93421.1337;
                const x = (n1 - Math.floor(n1) - 0.5) * SURVIVOR_WORLD_W;
                const y = (n2 - Math.floor(n2) - 0.5) * SURVIVOR_WORLD_H;
                const depth = 0.22 + (n3 - Math.floor(n3)) * 0.78;
                survivorState.stars.push({
                    x,
                    y,
                    depth,
                    alpha: 0.10 + depth * 0.30,
                    glyph: depth > 0.78 ? '*' : (depth > 0.52 ? '.' : "'"),
                    phase: (n1 + n2) * Math.PI * 2,
                    color: depth > 0.82 ? '#f5fbff' : (i % 7 === 0 ? '#7fffea' : '#6aa8ff')
                });
            }
        }

        function clampSurvivorWorldPosition() {
            const halfW = SURVIVOR_WORLD_W / 2;
            const halfH = SURVIVOR_WORLD_H / 2;
            player.x = Math.max(-halfW, Math.min(halfW, player.x));
            player.y = Math.max(-halfH, Math.min(halfH, player.y));
        }

        function updateSurvivorMode(dt) {
            if (!survivorState.active) return;
            const safeDt = Math.max(0, Math.min(0.05, dt || 0));
            const hostileDt = typeof getHostileDt === 'function' ? getHostileDt(safeDt) : safeDt;
            survivorState.elapsed += safeDt;
            survivorState.hordePulse += hostileDt;

            updateSurvivorPlayer(safeDt);
            updateSurvivorAutofire(safeDt);
            updateSurvivorBombs(safeDt);
            updateSurvivorProjectiles(safeDt);
            updateSurvivorSpawning(hostileDt);
            updateSurvivorEnemies(hostileDt);
            updateSurvivorBoss(hostileDt);
            updateSurvivorEnemyBullets(hostileDt);
            updateSurvivorDropsAndXp(safeDt);
            updateSurvivorParticles(safeDt);
            updateSurvivorDrones(safeDt);

            shake *= 0.90;
            wobble *= 0.84;
        }

        function updateSurvivorPlayer(dt) {
            let inputX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
            let inputY = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
            if (inputX !== 0 && inputY !== 0) {
                inputX *= 0.707;
                inputY *= 0.707;
            }

            const currentAim = getSurvivorPlayerAimAngle();
            const eightWayAim = typeof survivorEightWayAimEnabled === 'undefined' || survivorEightWayAimEnabled;
            const aimInput = eightWayAim ? getSurvivorArrowAimInput() : null;
            const turnInput = eightWayAim ? 0 : (keys.arrowright ? 1 : 0) - (keys.arrowleft ? 1 : 0);
            const targetAim = aimInput ? aimInput.angle : currentAim;
            let nextAim;
            if (eightWayAim) {
                nextAim = aimInput ? normalizeAngle(targetAim) : currentAim;
                if (aimInput && Math.abs(normalizeAngle(nextAim - currentAim)) > 0.08) {
                    pushSurvivorPlayerTurnAfterimage(currentAim, nextAim);
                }
            } else {
                nextAim = normalizeAngle(currentAim + turnInput * SURVIVOR_PLAYER_ROTATE_TURN_SPEED * dt);
            }
            const aimDelta = Math.abs(normalizeAngle(nextAim - currentAim));
            survivorState.targetAimAngle = targetAim;
            survivorState.aimAngle = nextAim;
            player.survivorAimAngle = nextAim;
            player.survivorTurning = aimDelta > 0.002 || (!eightWayAim && turnInput !== 0);

            const speedScale = typeof getPlayerMoveSpeedScale === 'function' ? getPlayerMoveSpeedScale() : 1;
            player.vx += inputX * SURVIVOR_PLAYER_ACCEL * speedScale * dt;
            player.vy += inputY * SURVIVOR_PLAYER_ACCEL * speedScale * dt;
            const friction = Math.pow(0.82, dt * 60);
            player.vx *= friction;
            player.vy *= friction;
            const maxSpeed = SURVIVOR_PLAYER_MAX_SPEED * speedScale;
            const speed = Math.hypot(player.vx, player.vy);
            if (speed > maxSpeed) {
                player.vx = (player.vx / speed) * maxSpeed;
                player.vy = (player.vy / speed) * maxSpeed;
            }
            player.x += player.vx * dt;
            player.y += player.vy * dt;
            clampSurvivorWorldPosition();
            player.isFiring = true;
            player.isBeaming = false;

            if (player.hp < player.maxHp) {
                player.hp = Math.min(player.maxHp, player.hp + player.modifiers.hpRegen * dt);
            }
            if (player.invincibilityTimer > 0) player.invincibilityTimer -= dt;
            if (player.flashTimer > 0) player.flashTimer -= dt;
            if (player.bombTimer > 0) player.bombTimer = Math.max(0, player.bombTimer - dt);
            if (postResumeBombLockTimer > 0) postResumeBombLockTimer = Math.max(0, postResumeBombLockTimer - dt);

            emitSurvivorPlayerThrusters(dt);
            const bombHeld = keys.b || (!eightWayAim && keys.arrowdown);
            if (postResumeBombLockTimer <= 0 && bombHeld && player.bombTimer <= 0) {
                fireBomb();
            }
        }

        function pushSurvivorPlayerTurnAfterimage(angle, nextAngle = angle) {
            if (!survivorState.playerTurnAfterimages) survivorState.playerTurnAfterimages = [];
            const turnDir = Math.sign(normalizeAngle(nextAngle - angle)) || 1;
            survivorState.playerTurnAfterimages.push({
                x: player.x,
                y: player.y,
                angle,
                offsetX: Math.cos(angle + Math.PI / 2 * turnDir) * 16,
                offsetY: Math.sin(angle + Math.PI / 2 * turnDir) * 16,
                life: SURVIVOR_TURN_AFTERIMAGE_LIFE,
                maxLife: SURVIVOR_TURN_AFTERIMAGE_LIFE,
                color: currentThemeColor || '#8ff7ff'
            });
            if (survivorState.playerTurnAfterimages.length > SURVIVOR_TURN_AFTERIMAGE_MAX) {
                survivorState.playerTurnAfterimages.splice(0, survivorState.playerTurnAfterimages.length - SURVIVOR_TURN_AFTERIMAGE_MAX);
            }
        }

        function emitSurvivorPlayerThrusters(dt) {
            const speed = Math.hypot(player.vx || 0, player.vy || 0);
            const moving = speed > 24;
            const turning = !!player.survivorTurning;
            if (!moving && !turning) return;

            const aimAngle = getSurvivorPlayerAimAngle();
            const exhaustAngle = aimAngle + Math.PI;
            const renderRotation = aimAngle + Math.PI / 2;
            const cos = Math.cos(renderRotation);
            const sin = Math.sin(renderRotation);
            const cameraScale = Math.max(0.001, survivorState.cameraScale || SURVIVOR_CAMERA_SCALE);
            const layout = getPlayerRenderLayout(player, 'center');
            const anchors = layout.thrusterAnchors && layout.thrusterAnchors.length
                ? layout.thrusterAnchors
                : [{ x: player.x, y: player.y + 38 }];
            const activity = Math.min(1, (speed / Math.max(1, SURVIVOR_PLAYER_MAX_SPEED)) * 0.75 + (turning ? 0.45 : 0));

            for (let i = 0; i < anchors.length; i++) {
                if (Math.random() > 0.62 + activity * 0.38) continue;
                const anchor = anchors[i];
                const localX = (anchor.x - player.x) * SURVIVOR_PLAYER_RENDER_SCALE;
                const localY = (anchor.y - player.y) * SURVIVOR_PLAYER_RENDER_SCALE;
                const worldOffsetX = (localX * cos - localY * sin) / cameraScale;
                const worldOffsetY = (localX * sin + localY * cos) / cameraScale;
                const spread = (Math.random() - 0.5) * (turning && !moving ? 0.36 : 0.44);
                const px = player.x + worldOffsetX;
                const py = player.y + worldOffsetY;
                const exhaustSpeed = 86 + Math.random() * 116 + speed * 0.16 + (turning ? 28 : 0);
                thrusterParticles.push({
                    x: px,
                    y: py,
                    vx: Math.cos(exhaustAngle + spread) * exhaustSpeed + player.vx * 0.10,
                    vy: Math.sin(exhaustAngle + spread) * exhaustSpeed + player.vy * 0.10,
                    char: EXHAUST_PARTICLE_CHARS[Math.floor(Math.random() * EXHAUST_PARTICLE_CHARS.length)],
                    color: null,
                    life: 0.36 + Math.random() * 0.18 + activity * 0.08,
                    isSmoke: false
                });
            }
        }

        function updateSurvivorAutofire(dt) {
            const s = player.weaponStats || createBaseWeaponStats();
            const speedRatio = Math.min(1, Math.hypot(player.vx || 0, player.vy || 0) / Math.max(1, SURVIVOR_PLAYER_MAX_SPEED));
            const momentumFireRate = (player.modifiers.momentumFireRate || 0) * speedRatio;
            const totalFireRateBonus = (player.modifiers.fireRate || 0) + momentumFireRate;
            const actualFireRate = getClampedPlayerFireInterval((player.fireRate / s.fireRateMult) / (1 + totalFireRateBonus));
            if (currentFrameNow - player.lastFire > actualFireRate) {
                fireCombo(getSurvivorPlayerAimAngle());
            }
        }

        function getSurvivorWaveNumber() {
            return Math.max(1, Math.floor((survivorState.elapsed || 0) / SURVIVOR_WAVE_STYLE_DURATION) + 1);
        }

        function getSurvivorWaveStyle() {
            const waveNumber = getSurvivorWaveNumber();
            const offset = survivorState.waveStyleOffset || 0;
            const styleId = SURVIVOR_WAVE_STYLE_ORDER[(waveNumber - 1 + offset) % SURVIVOR_WAVE_STYLE_ORDER.length];
            return SURVIVOR_WAVE_STYLES[styleId] || SURVIVOR_WAVE_STYLES.swarm;
        }

        function weightedSurvivorPick(weightedEntries, fallback = 'base') {
            if (!weightedEntries || !weightedEntries.length) return fallback;
            let total = 0;
            for (const entry of weightedEntries) total += Math.max(0, entry[1] || 0);
            let roll = Math.random() * Math.max(0.001, total);
            for (const entry of weightedEntries) {
                roll -= Math.max(0, entry[1] || 0);
                if (roll <= 0) return entry[0] || fallback;
            }
            return weightedEntries[weightedEntries.length - 1][0] || fallback;
        }

        function buildSurvivorSpawnOptions(style, burstIndex, burstCount) {
            const mode = style.spawnMode || 'ring';
            const colorList = style.colors && style.colors.length ? style.colors : ['#ff8fd8'];
            const color = colorList[Math.floor(Math.random() * colorList.length)];
            let angle = Math.random() * Math.PI * 2;
            let distance = SURVIVOR_SPAWN_RADIUS + Math.random() * 170;
            if (mode === 'flanks') {
                const side = (getSurvivorWaveNumber() + burstIndex) % 2 === 0 ? 0 : Math.PI;
                angle = side + (Math.random() - 0.5) * 0.72;
                distance = SURVIVOR_SPAWN_RADIUS + 90 + Math.random() * 120;
            } else if (mode === 'paired') {
                const pairBase = Math.random() * Math.PI * 2;
                angle = pairBase + (burstIndex % 2 === 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.35;
            } else if (mode === 'lanes') {
                const lane = ((burstIndex % 3) - 1) * 0.34;
                const base = Math.random() > 0.5 ? -Math.PI / 2 : Math.PI / 2;
                angle = base + lane + (Math.random() - 0.5) * 0.18;
                distance = SURVIVOR_SPAWN_RADIUS + 140 + Math.random() * 80;
            } else if (mode === 'diagonal') {
                const diagonal = Math.PI / 4 + Math.floor(Math.random() * 4) * (Math.PI / 2);
                angle = diagonal + (Math.random() - 0.5) * 0.42;
                distance = SURVIVOR_SPAWN_RADIUS + 70 + Math.random() * 160;
            }
            return {
                angle,
                distance,
                color,
                styleId: style.id,
                speedMult: style.speedMult || 1,
                hpMult: style.hpMult || 1,
                sidestepMult: style.sidestepMult || 1,
                fireTimer: style.fireTimer
            };
        }

        function updateSurvivorSpawning(hostileDt) {
            survivorState.spawnTimer -= hostileDt;
            survivorState.eliteTimer -= hostileDt;
            if (enemies.length >= SURVIVOR_ENEMY_CAP) return;

            const elapsed = survivorState.elapsed;
            const intensity = Math.min(1, elapsed / 360);
            const style = getSurvivorWaveStyle();
            const bossPressureMult = boss && boss.isSurvivorBoss ? 0.72 : 1;
            const interval = Math.max(0.34, 1.16 - intensity * 0.42) / Math.max(0.35, (style.spawnRate || 1) * bossPressureMult);
            if (survivorState.spawnTimer <= 0) {
                survivorState.spawnTimer = interval * (0.82 + Math.random() * 0.42);
                const rawBurst = 1 + Math.floor(elapsed / 95) + (Math.random() < 0.12 + intensity * 0.16 ? 1 : 0);
                const burst = Math.max(1, Math.round(rawBurst * (style.burstMult || 1) * bossPressureMult));
                for (let i = 0; i < burst && enemies.length < SURVIVOR_ENEMY_CAP; i++) {
                    const kind = weightedSurvivorPick(style.mix, 'base');
                    spawnSurvivorEnemy(kind, buildSurvivorSpawnOptions(style, i, burst));
                }
            }

            if (survivorState.eliteTimer <= 0 && enemies.length < SURVIVOR_ENEMY_CAP) {
                survivorState.eliteTimer = (Math.max(8.5, 17 - intensity * 6.5) + Math.random() * 5.5) * (style.eliteDelayMult || 1);
                const eliteKind = weightedSurvivorPick(style.eliteMix || [['armored', 4], ['elite', 2], ['crossfire', 1]], 'armored');
                spawnSurvivorEnemy(eliteKind, buildSurvivorSpawnOptions(style, 0, 1));
            }
        }

        function spawnSurvivorEnemy(kind = 'base', options = {}) {
            const elapsed = survivorState.elapsed || 0;
            const tier = Math.max(0, Math.floor(elapsed / 55));
            const angle = options.angle ?? Math.random() * Math.PI * 2;
            const distance = options.distance ?? (SURVIVOR_SPAWN_RADIUS + Math.random() * 170);
            const x = player.x + Math.cos(angle) * distance;
            const y = player.y + Math.sin(angle) * distance;
            const kindStats = {
                base: { hp: 8, hpTier: 0, speed: 58, speedTier: 1.0, damage: 8, fireTimer: 999, visualKind: 'base', visualScale: 0.9, color: '#ff8fd8', debris: 18 },
                scout: { hp: 7, hpTier: 0.4, speed: 76, speedTier: 1.3, damage: 7, fireTimer: 999, visualKind: 'base', visualScale: 0.84, color: '#8ff7ff', debris: 18 },
                drifter: { hp: 12, hpTier: 1.0, speed: 54, speedTier: 1.0, damage: 9, fireTimer: 999, visualKind: 'base', visualScale: 0.92, color: '#d884ff', debris: 22 },
                crossfire: { hp: 14, hpTier: 1.2, speed: 48, speedTier: 0.9, damage: 8, fireTimer: 4.2, visualKind: 'armored', visualScale: 0.94, color: '#9bffcf', debris: 24 },
                armored: { hp: 36, hpTier: 5.0, speed: 50, speedTier: 1.4, damage: 12, fireTimer: 999, visualKind: 'armored', visualScale: 1.0, color: '#fff07a', debris: 26 },
                elite: { hp: 64, hpTier: 7.0, speed: 70, speedTier: 1.8, damage: 16, fireTimer: 3.2, visualKind: 'elite', visualScale: 1.06, color: '#8ff7ff', debris: 34 }
            };
            const stats = kindStats[kind] || kindStats.base;
            const hp = Math.max(1, Math.round((stats.hp + tier * stats.hpTier) * (options.hpMult || 1)));
            const moveSpeed = (stats.speed + tier * stats.speedTier) * (options.speedMult || 1);
            const enemy = {
                x,
                y,
                vx: 0,
                vy: 0,
                hp,
                maxHp: hp,
                color: options.color || stats.color,
                onScreen: true,
                isSurvivorEnemy: true,
                isElite: kind === 'elite',
                survivorKind: kind,
                survivorStyleId: options.styleId || null,
                meleeCooldown: 0,
                meleeAnim: 0,
                contactDamage: stats.damage * (options.contactDamageMult || 1),
                moveSpeed,
                sidestepMult: options.sidestepMult || 1,
                fireTimer: Number.isFinite(options.fireTimer)
                    ? options.fireTimer + Math.random() * 1.7
                    : (stats.fireTimer < 900 ? stats.fireTimer + Math.random() * 2.8 : 999),
                indexOffset: Math.random() * 1000,
                explosionDebrisCap: stats.debris,
                suppressWaveAccounting: true
            };
            if (typeof configureEnemyShipVisual === 'function') {
                configureEnemyShipVisual(enemy, stats.visualKind, {
                    color: enemy.color,
                    visualScale: stats.visualScale
                });
            }
            enemies.push(enemy);
            return enemy;
        }

        function updateSurvivorEnemies(hostileDt) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (!e || !e.isSurvivorEnemy) continue;
                if (e.flashTimer > 0) e.flashTimer -= hostileDt;
                if (e.meleeCooldown > 0) e.meleeCooldown -= hostileDt;
                if (e.meleeAnim > 0) e.meleeAnim -= hostileDt;

                const dx = player.x - e.x;
                const dy = player.y - e.y;
                const dist = Math.max(0.001, Math.hypot(dx, dy));
                if (dist > SURVIVOR_DESPAWN_RADIUS) {
                    const respawnAngle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 1.4;
                    e.x = player.x + Math.cos(respawnAngle) * SURVIVOR_SPAWN_RADIUS;
                    e.y = player.y + Math.sin(respawnAngle) * SURVIVOR_SPAWN_RADIUS;
                    e.vx = 0;
                    e.vy = 0;
                    continue;
                }

                const swarmPhase = survivorState.hordePulse * 0.7 + e.indexOffset;
                const sidestep = Math.sin(swarmPhase) * 0.28 * (e.sidestepMult || 1);
                const dirX = dx / dist;
                const dirY = dy / dist;
                const targetVx = (dirX + -dirY * sidestep) * e.moveSpeed;
                const targetVy = (dirY + dirX * sidestep) * e.moveSpeed;
                const steer = Math.min(1, hostileDt * 3.1);
                e.vx += (targetVx - e.vx) * steer;
                e.vy += (targetVy - e.vy) * steer;
                e.x += e.vx * hostileDt;
                e.y += e.vy * hostileDt;

                if (e.fireTimer < 900) {
                    e.fireTimer -= hostileDt;
                    if (e.fireTimer <= 0 && enemyBullets.length < SURVIVOR_BULLET_CAP && dist < 720) {
                        e.fireTimer = e.survivorKind === 'crossfire'
                            ? 4.4 + Math.random() * 3.4
                            : 5.5 + Math.random() * 4.5;
                        const angle = Math.atan2(player.y - e.y, player.x - e.x) + (Math.random() - 0.5) * 0.35;
                        enemyBullets.push({
                            x: e.x,
                            y: e.y,
                            vx: Math.cos(angle) * (e.survivorKind === 'crossfire' ? 155 : 185),
                            vy: Math.sin(angle) * (e.survivorKind === 'crossfire' ? 155 : 185),
                            char: e.survivorKind === 'crossfire' ? '.' : 'o',
                            color: e.enemyBulletColor || '#ffe66d',
                            isSurvivorBullet: true,
                            life: 4.2,
                            hitboxScale: 0.82
                        });
                    }
                }

                const hitboxR = 26 * (typeof getPlayerHitboxScale === 'function' ? getPlayerHitboxScale() : 1);
                if (dist < hitboxR + 18 && e.meleeCooldown <= 0) {
                    e.meleeCooldown = e.isElite ? 0.82 : 1.05;
                    e.meleeAnim = 0.24;
                    damageSurvivorPlayer(e.contactDamage || 8);
                    const shove = 72;
                    e.vx -= dirX * shove;
                    e.vy -= dirY * shove;
                }
            }
        }

        function damageSurvivorPlayer(amount) {
            const damage = Math.max(0, amount || 0);
            if (damage <= 0 || player.godMode || player.invincibilityTimer > 0) return;
            player.hp -= damage;
            if (typeof recordRunDamageTaken === 'function') recordRunDamageTaken(damage);
            if (typeof resetComboOnPlayerDamage === 'function') resetComboOnPlayerDamage();
            addShake(12);
            wobble = Math.max(wobble, 0.75);
            player.invincibilityTimer = 0.42 + (player.modifiers.invincibility || 0);
            player.flashTimer = player.invincibilityTimer;
            for (let i = 0; i < 5; i++) {
                const a = Math.random() * Math.PI * 2;
                debris.push({
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(a) * (80 + Math.random() * 80),
                    vy: Math.sin(a) * (80 + Math.random() * 80),
                    char: Math.random() > 0.5 ? '+' : '.',
                    color: '#ff8fb5',
                    life: 0.42
                });
            }
            if (player.hp <= 0) {
                gameState = 'DYING';
                deathTimer = 0;
                shake = 0;
                if (typeof fadeMusicForDeath === 'function') fadeMusicForDeath();
            }
        }

        function updateSurvivorBoss(hostileDt) {
            if (!boss && survivorState.bossTimer <= 0) {
                spawnSurvivorBoss();
                survivorState.bossTimer = SURVIVOR_BOSS_INTERVAL;
            } else if (!boss) {
                survivorState.bossTimer -= hostileDt;
            }
            if (!boss || !boss.isSurvivorBoss) return;

            if (boss.flashTimer > 0) boss.flashTimer -= hostileDt;
            boss.age += hostileDt;
            boss.attackTimer -= hostileDt;
            updateSurvivorBossMovement(boss, hostileDt);

            if (boss.attackTimer <= 0) {
                runSurvivorBossAttack(boss);
            }

            const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
            if (dist < 70) damageSurvivorPlayer(18);
        }

        function updateSurvivorBossMovement(source, hostileDt) {
            const drift = source.survivorBossType === 'overheatingFirewall' ? 0.22 : 0.28;
            const desiredAngle = Math.sin(source.age * drift + source.orbitSeed) * (source.orbitSwing || 0.9) - Math.PI / 2;
            const targetX = player.x + Math.cos(desiredAngle) * (source.orbitRadiusX || 380);
            const targetY = player.y + Math.sin(desiredAngle) * (source.orbitRadiusY || 285);
            source.vx += (targetX - source.x) * hostileDt * (source.steerStrength || 0.28);
            source.vy += (targetY - source.y) * hostileDt * (source.steerStrength || 0.28);
            source.vx *= Math.pow(0.9, hostileDt * 60);
            source.vy *= Math.pow(0.9, hostileDt * 60);
            source.x += source.vx * hostileDt;
            source.y += source.vy * hostileDt;
        }

        function getSurvivorBossDefinition(serial) {
            const index = Math.max(0, (serial - 1) % SURVIVOR_BOSS_SEQUENCE.length);
            const cycle = Math.max(0, Math.floor((serial - 1) / SURVIVOR_BOSS_SEQUENCE.length));
            return {
                def: SURVIVOR_BOSS_SEQUENCE[index],
                cycle
            };
        }

        function spawnSurvivorBoss() {
            const serial = survivorState.bossSerial + 1;
            const info = getSurvivorBossDefinition(serial);
            const def = info.def;
            survivorState.bossSerial = serial;
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
            const hp = Math.round(def.hp * (1 + info.cycle * 0.34));
            boss = {
                name: def.name,
                x: player.x + Math.cos(angle) * 650,
                y: player.y + Math.sin(angle) * 650,
                vx: 0,
                vy: 0,
                hp,
                maxHp: hp,
                sprite: def.sprite || [' /\\ ', '<##>', ' \\/ '],
                color: def.color || '#ff5edb',
                phase: 'ACTIVE',
                isSurvivorBoss: true,
                survivorBossDef: def,
                survivorBossType: def.type,
                sourceWave: def.sourceWave,
                age: 0,
                attackTimer: 1.4,
                attackIndex: 0,
                orbitSeed: Math.random() * Math.PI * 2,
                orbitRadiusX: def.type === 'turnboundTrinity' ? 430 : 380,
                orbitRadiusY: def.type === 'dreadLiturgy' ? 330 : 285,
                orbitSwing: def.type === 'overheatingFirewall' ? 0.65 : 0.9,
                steerStrength: def.type === 'ghostSignal' ? 0.22 : 0.28,
                renderScale: def.renderScale || 1.0,
                flashTimer: 0,
                explosionDebrisCap: 90
            };
            if (def && typeof def.startMusic === 'function') def.startMusic();
            addShake(16);
        }

        function runSurvivorBossAttack(source) {
            const pattern = source.attackIndex++ % 3;
            const type = source.survivorBossType || 'nullPhantom';
            if (type === 'nullPhantom') {
                source.attackTimer = 3.25 + Math.random() * 0.7;
                if (pattern === 0) fireSurvivorBossRing(source, 14, 132, '#9f8cff', { char: 'o', phaseRate: 0.5 });
                else if (pattern === 1) fireSurvivorBossFan(source, { count: 7, spread: 0.18, speed: 160, color: '#c9bcff', coreColor: '#ffffff' });
                else spawnSurvivorBossAdds(source, 3, 'drifter', '#bda8ff');
                return;
            }
            if (type === 'distortedGlitch') {
                source.attackTimer = 2.95 + Math.random() * 0.55;
                if (pattern === 0) fireSurvivorMatrixRain(source);
                else if (pattern === 1) fireSurvivorBossRing(source, 16, 145, '#00ff66', { char: '1', phaseRate: 1.1, jitter: 0.05 });
                else fireSurvivorBossFan(source, { count: 9, spread: 0.14, speed: 172, color: '#65ff9a', coreColor: '#d9ffe7', jitter: 0.07 });
                return;
            }
            if (type === 'ghostSignal') {
                source.attackTimer = 3.45 + Math.random() * 0.65;
                if (pattern === 0) fireSurvivorBossFan(source, { count: 6, spread: 0.22, speed: 145, color: '#dbe7ff', coreColor: '#ffffff', homingStrength: 0.55 });
                else if (pattern === 1) fireSurvivorBossRing(source, 12, 118, '#f4f8ff', { char: '.', homingStrength: 0.35 });
                else spawnSurvivorBossAdds(source, 4, 'scout', '#dbe7ff');
                return;
            }
            if (type === 'overheatingFirewall') {
                source.attackTimer = 3.25 + Math.random() * 0.55;
                if (pattern === 0) fireSurvivorBossWall(source, '#ff8a48');
                else if (pattern === 1) fireSurvivorBossRing(source, 18, 126, '#ff7840', { char: '*', phaseRate: 0.7 });
                else spawnSurvivorBossAdds(source, 3, 'armored', '#ff9a6c');
                return;
            }
            if (type === 'turnboundTrinity') {
                source.attackTimer = 3.15 + Math.random() * 0.6;
                if (pattern === 0) fireSurvivorBossRing(source, 10, 150, '#ffd37a', { char: '.', phaseRate: 1.4 });
                else if (pattern === 1) fireSurvivorBossSwordArc(source);
                else fireSurvivorBossFan(source, { count: 8, spread: 0.16, speed: 155, color: '#b99dff', coreColor: '#ffffff' });
                return;
            }
            source.attackTimer = 3.45 + Math.random() * 0.75;
            if (pattern === 0) fireSurvivorDreadLanes(source);
            else if (pattern === 1) fireSurvivorBossSwordArc(source, '#d8d4ff');
            else spawnSurvivorBossAdds(source, 4, 'drifter', '#d8d4ff');
        }

        function pushSurvivorBossBullet(x, y, angle, speed, color, options = {}) {
            if (enemyBullets.length >= SURVIVOR_BULLET_CAP) return false;
            enemyBullets.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                char: options.char || 'o',
                color,
                isSurvivorBullet: true,
                life: options.life || 5,
                hitboxScale: options.hitboxScale || 0.82,
                homingStrength: options.homingStrength || 0,
                drag: options.drag || 0
            });
            return true;
        }

        function fireSurvivorBossRing(source, count, speed, color, options = {}) {
            const offset = (survivorState.elapsed * 0.9) % (Math.PI * 2);
            for (let i = 0; i < count; i++) {
                const jitter = options.jitter ? (Math.random() - 0.5) * options.jitter : 0;
                const a = offset * (options.phaseRate || 1) + (Math.PI * 2 * i) / count + jitter;
                pushSurvivorBossBullet(source.x, source.y, a, speed, color, {
                    char: options.char || 'o',
                    life: options.life || 5,
                    hitboxScale: options.hitboxScale || 0.84,
                    homingStrength: options.homingStrength || 0
                });
            }
        }

        function fireSurvivorBossFan(source, options = {}) {
            const base = Math.atan2(player.y - source.y, player.x - source.x);
            const count = options.count || 7;
            const half = (count - 1) / 2;
            for (let i = 0; i < count; i++) {
                const offset = i - half;
                const a = base + offset * (options.spread || 0.18) + (options.jitter ? (Math.random() - 0.5) * options.jitter : 0);
                pushSurvivorBossBullet(source.x, source.y, a, (options.speed || 180) - Math.abs(offset) * 7, Math.abs(offset) < 0.1 ? (options.coreColor || '#ffffff') : (options.color || '#ffe66d'), {
                    char: Math.abs(offset) < 0.1 ? '*' : '.',
                    life: options.life || 4.6,
                    hitboxScale: options.hitboxScale || 0.78,
                    homingStrength: options.homingStrength || 0
                });
            }
        }

        function fireSurvivorMatrixRain(source) {
            const chars = ['0', '1', '|', '.'];
            const columns = 8;
            for (let i = 0; i < columns; i++) {
                const x = player.x + (i - (columns - 1) / 2) * 92 + (Math.random() - 0.5) * 38;
                const y = player.y - 520 - Math.random() * 130;
                pushSurvivorBossBullet(x, y, Math.PI / 2 + (Math.random() - 0.5) * 0.07, 150 + Math.random() * 34, '#00ff66', {
                    char: chars[Math.floor(Math.random() * chars.length)],
                    life: 6.5,
                    hitboxScale: 0.74
                });
            }
            fireSurvivorBossFan(source, { count: 5, spread: 0.16, speed: 145, color: '#65ff9a', coreColor: '#d9ffe7', life: 4.2 });
        }

        function fireSurvivorBossWall(source, color) {
            const base = Math.atan2(player.y - source.y, player.x - source.x);
            const perp = base + Math.PI / 2;
            for (let i = -4; i <= 4; i++) {
                const x = source.x + Math.cos(perp) * i * 58;
                const y = source.y + Math.sin(perp) * i * 58;
                pushSurvivorBossBullet(x, y, base + (Math.random() - 0.5) * 0.04, 132 + Math.abs(i) * 3, color, {
                    char: i % 2 === 0 ? '|' : '.',
                    life: 5.4,
                    hitboxScale: 0.82
                });
            }
        }

        function fireSurvivorBossSwordArc(source, color = '#ff405f') {
            const base = Math.atan2(player.y - source.y, player.x - source.x);
            for (let i = -4; i <= 4; i++) {
                const a = base + i * 0.12;
                const x = source.x + Math.cos(a) * 32;
                const y = source.y + Math.sin(a) * 32;
                pushSurvivorBossBullet(x, y, a, 190 + (4 - Math.abs(i)) * 10, color, {
                    char: i < 0 ? '/' : '\\',
                    life: 3.8,
                    hitboxScale: 0.9,
                    drag: 0.03
                });
            }
        }

        function fireSurvivorDreadLanes(source) {
            const base = Math.atan2(player.y - source.y, player.x - source.x);
            for (let lane = -2; lane <= 2; lane++) {
                const a = base + lane * 0.2;
                pushSurvivorBossBullet(source.x, source.y, a, 128 + Math.abs(lane) * 12, '#d8d4ff', {
                    char: lane === 0 ? '*' : '.',
                    life: 5.8,
                    hitboxScale: 0.82,
                    homingStrength: lane === 0 ? 0.25 : 0
                });
            }
            fireSurvivorBossRing(source, 8, 104, '#9f8cff', { char: '.', phaseRate: 0.35, life: 5.6 });
        }

        function spawnSurvivorBossAdds(source, count, kind, color) {
            const base = Math.atan2(player.y - source.y, player.x - source.x) + Math.PI;
            for (let i = 0; i < count && enemies.length < SURVIVOR_ENEMY_CAP; i++) {
                spawnSurvivorEnemy(kind, {
                    angle: base + (i - (count - 1) / 2) * 0.32 + (Math.random() - 0.5) * 0.18,
                    distance: SURVIVOR_SPAWN_RADIUS + 60 + Math.random() * 90,
                    color,
                    hpMult: 0.9,
                    speedMult: 0.92,
                    sidestepMult: 1.25
                });
            }
        }

        function updateSurvivorProjectiles(dt) {
            for (let i = comboProjectiles.length - 1; i >= 0; i--) {
                const p = comboProjectiles[i];
                const stats = p.stats || {};
                p.age = (p.age || 0) + dt;
                if (p.releaseDelay && p.releaseDelay > 0) {
                    p.releaseDelay -= dt;
                    continue;
                }

                if (stats.homing) {
                    const nearestInfo = findNearestSurvivorTarget(p.x, p.y);
                    if (nearestInfo.target) {
                        const desired = Math.atan2(nearestInfo.target.y - p.y, nearestInfo.target.x - p.x);
                        const current = Math.atan2(p.vy || 0, p.vx || 1);
                        const blend = Math.min(1, dt * (stats.homingStrength || 4));
                        const angle = lerpAngle(current, desired, blend);
                        const speed = Math.max(80, Math.hypot(p.vx || 0, p.vy || 0));
                        p.vx = Math.cos(angle) * speed;
                        p.vy = Math.sin(angle) * speed;
                    }
                }

                if (stats.pathFunction === 'sine') {
                    const age = p.age || 0;
                    const perp = Math.atan2(p.baseVy || p.vy || 0, p.baseVx || p.vx || 1) + Math.PI / 2;
                    const amp = 90 * (stats.sineAmplitudeMult || 1);
                    p.x += (p.vx || 0) * dt + Math.cos(perp) * Math.sin(age * 7) * amp * dt;
                    p.y += (p.vy || 0) * dt + Math.sin(perp) * Math.sin(age * 7) * amp * dt;
                } else if (stats.plasmaCloud) {
                    const growth = typeof getPlasmaCloudGrowthFactor === 'function' ? getPlasmaCloudGrowthFactor(p) : 1;
                    p.vx *= Math.pow(0.985, dt * 60);
                    p.vy *= Math.pow(0.985, dt * 60);
                    p.x += (p.vx || 0) * dt * Math.max(0.35, 1 / growth);
                    p.y += (p.vy || 0) * dt * Math.max(0.35, 1 / growth);
                } else {
                    p.x += (p.vx || 0) * dt;
                    p.y += (p.vy || 0) * dt;
                }

                p.life -= dt;
                if (p.life <= 0 || Math.hypot(p.x - player.x, p.y - player.y) > 1250) {
                    comboProjectiles.splice(i, 1);
                    continue;
                }

                const hitboxRadius = typeof getComboProjectileHitboxRadius === 'function'
                    ? getComboProjectileHitboxRadius(p)
                    : 18;
                if (boss && boss.isSurvivorBoss && doesCircleHitTargetMask(p.x, p.y, hitboxRadius, boss)) {
                    damageSurvivorTarget(p, boss);
                    if (handleSurvivorProjectileImpact(p, i, true)) continue;
                }
                for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
                    const e = enemies[enemyIndex];
                    if (!e || !e.isSurvivorEnemy || !isEnemyDamageable(e)) continue;
                    if (!doesProjectileHitTargetMask(p, e, hitboxRadius)) continue;
                    if (p.pierceHits && p.pierceHits.includes(e)) continue;
                    damageSurvivorTarget(p, e);
                    if (handleSurvivorProjectileImpact(p, i, false, e)) break;
                }
            }
        }

        function damageSurvivorTarget(projectile, target) {
            const damage = Math.max(0, projectile.damage || 1);
            target.hp -= damage;
            target.flashTimer = 0.12;
            if (projectile.pierceHits) projectile.pierceHits.push(target);
            if (target.hp <= 0) {
                if (target.isSurvivorBoss) {
                    killSurvivorBoss(target);
                } else {
                    const idx = enemies.indexOf(target);
                    if (idx >= 0) {
                        if (typeof explodeEnemy === 'function') explodeEnemy(target);
                        enemies.splice(idx, 1);
                    }
                }
            }
        }

        function handleSurvivorProjectileImpact(projectile, projectileIndex, hitBoss = false, hitEnemy = null) {
            const stats = projectile.stats || {};
            if (typeof emitProjectileImpactDebris === 'function') emitProjectileImpactDebris(projectile, 2, projectile.color);
            if (stats.miniTorpedo || projectile.isMiniTorpedo) {
                if (typeof spawnMiniTorpedoExplosion === 'function') spawnMiniTorpedoExplosion(projectile.x, projectile.y, projectile);
                comboProjectiles.splice(projectileIndex, 1);
                return true;
            }
            if (stats.splashRadius > 0) {
                const splashRadius = stats.splashRadius * 22;
                const splashDamage = (projectile.damage || 1) * (stats.splashDamagePercent || 0.4);
                if (typeof radialExplosion === 'function') radialExplosion(projectile.x, projectile.y, splashRadius, splashDamage, 4, { shakeAmount: 0, wakeStrength: 6 });
            }
            projectile.pierceCount = Math.max(0, projectile.pierceCount || 0);
            if (projectile.pierceCount > 0 && !hitBoss) {
                projectile.pierceCount--;
                return false;
            }
            comboProjectiles.splice(projectileIndex, 1);
            return true;
        }

        function killSurvivorBoss(bossObj) {
            if (!bossObj || boss !== bossObj) return;
            if (typeof recordRunBossDefeated === 'function') recordRunBossDefeated();
            if (typeof explodeBoss === 'function') explodeBoss(bossObj);
            const stopMusicFn = bossObj.survivorBossDef && bossObj.survivorBossDef.stopMusic;
            if (typeof stopMusicFn === 'function') stopMusicFn();
            else if (typeof stopBossMusic === 'function') {
                stopBossMusic(2.0);
                if (typeof resumeMainMusic === 'function') resumeMainMusic();
            }
            survivorState.bossTimer = SURVIVOR_BOSS_INTERVAL;
            addShake(24);
            boss = null;
        }

        function findNearestSurvivorTarget(x, y) {
            let target = null;
            let distSq = Infinity;
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                if (!e || !e.isSurvivorEnemy || !isEnemyDamageable(e)) continue;
                const dx = e.x - x;
                const dy = e.y - y;
                const d = dx * dx + dy * dy;
                if (d < distSq) {
                    distSq = d;
                    target = e;
                }
            }
            if (boss && boss.isSurvivorBoss) {
                const dx = boss.x - x;
                const dy = boss.y - y;
                const d = dx * dx + dy * dy;
                if (d < distSq) {
                    distSq = d;
                    target = boss;
                }
            }
            return { target, distSq };
        }

        function updateSurvivorDrones(dt) {
            if (!player.weaponStats.hasOrbitalDrones) return;
            for (let i = 0; i < player.drones.length; i++) {
                const d = player.drones[i];
                d.angle += 3 * dt;
                d.x = player.x + Math.cos(d.angle) * 45;
                d.y = player.y + Math.sin(d.angle) * 45;
                d.timer -= dt;
                if (d.timer <= 0) {
                    d.timer = Math.max(0.22, 0.34 / player.weaponStats.fireRateMult);
                    const nearestInfo = findNearestSurvivorTarget(d.x, d.y);
                    if (nearestInfo.target) {
                        const angle = Math.atan2(nearestInfo.target.y - d.y, nearestInfo.target.x - d.x);
                        const speed = 850;
                        comboProjectiles.push({
                            x: d.x,
                            y: d.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            baseVx: Math.cos(angle) * speed,
                            baseVy: Math.sin(angle) * speed,
                            startX: d.x,
                            startY: d.y,
                            sprite: '.',
                            color: '#aa7dff',
                            stats: { ...createBaseWeaponStats(), sizeMult: 0.48, pierceCount: 0, splashRadius: 0 },
                            life: 1.1,
                            maxLife: 1.1,
                            damage: (7 * player.weaponStats.damageMult + player.modifiers.laserDamage) * getPlayerDamageScale() * 0.45,
                            pierceHits: [],
                            pierceCount: 0
                        });
                    }
                }
            }
        }

        function updateSurvivorBombs(dt) {
            for (let i = bombProjectiles.length - 1; i >= 0; i--) {
                const bomb = bombProjectiles[i];
                if (bomb.justFired) {
                    bomb.justFired = false;
                    continue;
                }
                bomb.age = (bomb.age || 0) + dt;
                bomb.x += bomb.vx * dt;
                bomb.y += bomb.vy * dt;
                bomb.distance = Math.hypot(bomb.x - bomb.startX, bomb.y - bomb.startY);
                if (Math.random() > 0.42) {
                    const a = Math.random() * Math.PI * 2;
                    thrusterParticles.push({
                        x: bomb.x,
                        y: bomb.y,
                        vx: Math.cos(a) * (20 + Math.random() * 70),
                        vy: Math.sin(a) * (20 + Math.random() * 70),
                        char: Math.random() > 0.5 ? '*' : '.',
                        color: Math.random() > 0.45 ? '#8ff7ff' : '#d884ff',
                        life: 0.24,
                        isSmoke: true
                    });
                }
                let shouldExplode = bomb.forceDetonate || bomb.distance >= bomb.maxDistance || Math.hypot(bomb.x - player.x, bomb.y - player.y) > 1100;
                if (!shouldExplode) {
                    for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
                        const e = enemies[enemyIndex];
                        if (doesCircleHitTargetMask(bomb.x, bomb.y, 18, e)) {
                            shouldExplode = true;
                            break;
                        }
                    }
                }
                if (!shouldExplode && boss && boss.isSurvivorBoss && doesCircleHitTargetMask(bomb.x, bomb.y, 18, boss)) shouldExplode = true;
                if (shouldExplode) {
                    if (typeof spawnBombExplosion === 'function') spawnBombExplosion(bomb.x, bomb.y);
                    bombProjectiles.splice(i, 1);
                }
            }
            for (let i = bombBlastRings.length - 1; i >= 0; i--) {
                const ring = bombBlastRings[i];
                ring.life += dt;
                if (ring.life >= ring.maxLife) bombBlastRings.splice(i, 1);
            }
        }

        function updateSurvivorEnemyBullets(hostileDt) {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i];
                b.life = (b.life || 4) - hostileDt;
                if (b.homingStrength > 0) {
                    const desired = Math.atan2(player.y - b.y, player.x - b.x);
                    const current = Math.atan2(b.vy || 0, b.vx || 1);
                    const angle = lerpAngle(current, desired, Math.min(1, hostileDt * b.homingStrength));
                    const speed = Math.max(20, Math.hypot(b.vx || 0, b.vy || 0));
                    b.vx = Math.cos(angle) * speed;
                    b.vy = Math.sin(angle) * speed;
                }
                if (b.drag > 0) {
                    b.vx *= Math.pow(1 - Math.min(0.25, b.drag), hostileDt * 60);
                    b.vy *= Math.pow(1 - Math.min(0.25, b.drag), hostileDt * 60);
                }
                b.x += (b.vx || 0) * hostileDt;
                b.y += (b.vy || 0) * hostileDt;
                const dx = b.x - player.x;
                const dy = b.y - player.y;
                const hitboxR = 26 * (typeof getPlayerHitboxScale === 'function' ? getPlayerHitboxScale() : 1) * (b.hitboxScale || 1);
                if (!b.nonDamaging && dx * dx + dy * dy < hitboxR * hitboxR) {
                    damageSurvivorPlayer(10);
                    enemyBullets.splice(i, 1);
                } else if (b.life <= 0 || Math.hypot(dx, dy) > 1180) {
                    enemyBullets.splice(i, 1);
                }
            }
        }

        function updateSurvivorDropsAndXp(dt) {
            const magnetRangeSq = 42000 * (1 + (player.modifiers.magnet || 0));
            for (let i = xpOrbs.length - 1; i >= 0; i--) {
                const orb = xpOrbs[i];
                const dx = player.x - orb.x;
                const dy = player.y - orb.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < magnetRangeSq) {
                    const dist = Math.max(1, Math.sqrt(distSq));
                    orb.vx = (dx / dist) * 620;
                    orb.vy = (dy / dist) * 620;
                } else {
                    orb.vx *= Math.pow(0.96, dt * 60);
                    orb.vy *= Math.pow(0.96, dt * 60);
                }
                orb.x += (orb.vx || 0) * dt;
                orb.y += (orb.vy || 0) * dt;
                if (distSq < 1150) {
                    const xpValue = orb.xpValue || 1;
                    const grantedXp = xpValue * (1 + (player.modifiers.xpGain || 0));
                    player.xp += grantedXp;
                    if (player.modifiers.xpHeal > 0 && player.hp < player.maxHp) {
                        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * player.modifiers.xpHeal * Math.max(1, xpValue));
                    }
                    if (player.xp >= player.xpNeeded) {
                        player.xp -= player.xpNeeded;
                        player.level++;
                        player.xpNeeded = getXpNeededForLevel(player.level);
                        beginLevelUpOffer();
                    }
                    xpOrbs.splice(i, 1);
                    addScore(50);
                } else if (Math.hypot(dx, dy) > 1300) {
                    xpOrbs.splice(i, 1);
                }
            }

            for (let i = drops.length - 1; i >= 0; i--) {
                const d = drops[i];
                d.x += (d.vx || 0) * dt;
                d.y += (d.vy || 0) * dt;
                d.vx = (d.vx || 0) * Math.pow(0.94, dt * 60);
                d.vy = (d.vy || 0) * Math.pow(0.94, dt * 60);
                const dx = d.x - player.x;
                const dy = d.y - player.y;
                if (dx * dx + dy * dy < 2200) {
                    if (d.isHealth) {
                        player.hp = Math.min(player.maxHp, player.hp + Math.ceil(player.maxHp * (d.healFraction || 0.10)));
                    } else if (d.isFocus) {
                        const focusMax = typeof getFocusMeterMax === 'function' ? getFocusMeterMax() : FOCUS_METER_MAX;
                        focusMeter = Math.min(focusMax, focusMeter + (d.focusAmount || FOCUS_ELITE_DROP_AMOUNT));
                        if (focusMeter > 0) focusLockoutTimer = 0;
                    }
                    drops.splice(i, 1);
                    addShake(8);
                } else if (Math.hypot(dx, dy) > 1400) {
                    drops.splice(i, 1);
                }
            }
        }

        function updateSurvivorParticles(dt) {
            const turnAfterimages = survivorState.playerTurnAfterimages || [];
            for (let i = turnAfterimages.length - 1; i >= 0; i--) {
                turnAfterimages[i].life -= dt;
                if (turnAfterimages[i].life <= 0) turnAfterimages.splice(i, 1);
            }
            for (let i = thrusterParticles.length - 1; i >= 0; i--) {
                const t = thrusterParticles[i];
                t.x += (t.vx || 0) * dt;
                t.y += (t.vy || 0) * dt;
                t.life -= dt * (t.isSmoke ? 1.25 : 2.2);
                if (t.life <= 0 || Math.hypot(t.x - player.x, t.y - player.y) > 1250) thrusterParticles.splice(i, 1);
            }
            for (let i = debris.length - 1; i >= 0; i--) {
                const d = debris[i];
                d.x += (d.vx || 0) * dt;
                d.y += (d.vy || 0) * dt;
                d.vx *= Math.pow(0.97, dt * 60);
                d.vy *= Math.pow(0.97, dt * 60);
                d.life -= dt * 0.9;
                if (d.life <= 0 || Math.hypot(d.x - player.x, d.y - player.y) > 1300) debris.splice(i, 1);
            }
        }

        function drawSurvivorMode(renderNow, dt) {
            if (!survivorState.active) return;
            const center = getSurvivorScreenCenter();
            drawSurvivorWorldBackdrop(renderNow);
            drawSurvivorWorldBounds();
            drawSurvivorWorldParticles(renderNow);
            drawSurvivorDrops(renderNow);
            drawSurvivorProjectiles(renderNow);
            drawSurvivorEnemies(renderNow);
            drawSurvivorBoss(renderNow);
            drawSurvivorPlayer(renderNow, center);
            drawSurvivorPlayerAfterimages(renderNow);
            drawSurvivorModeReadout(renderNow, dt);
        }

        function drawSurvivorWorldBackdrop(renderNow) {
            ctx.save();
            ctx.fillStyle = colorWithAlpha('#050712', 0.28);
            ctx.fillRect(0, 0, width, height);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < survivorState.stars.length; i++) {
                const s = survivorState.stars[i];
                const parallax = 0.18 + s.depth * 0.52;
                let sx = width / 2 + (s.x - player.x * parallax) * survivorState.cameraScale;
                let sy = (height - HUD_HEIGHT) * 0.52 + (s.y - player.y * parallax) * survivorState.cameraScale;
                sx = ((sx % width) + width) % width;
                sy = ((sy % (height - HUD_HEIGHT)) + (height - HUD_HEIGHT)) % (height - HUD_HEIGHT);
                const twinkle = 0.72 + Math.sin(renderNow * 0.002 + s.phase) * 0.22;
                ctx.globalAlpha = s.alpha * twinkle;
                ctx.fillStyle = s.color;
                ctx.font = `bold ${s.depth > 0.7 ? 10 : 8}px Courier New`;
                ctx.fillText(s.glyph, sx, sy);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawSurvivorWorldBounds() {
            const topLeft = survivorWorldToScreen(-SURVIVOR_WORLD_W / 2, -SURVIVOR_WORLD_H / 2);
            const bottomRight = survivorWorldToScreen(SURVIVOR_WORLD_W / 2, SURVIVOR_WORLD_H / 2);
            ctx.save();
            ctx.globalAlpha = 0.20;
            ctx.strokeStyle = currentThemeColor;
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 12]);
            ctx.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
            ctx.restore();
        }

        function drawSurvivorWorldParticles(renderNow) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const t of thrusterParticles) {
                const p = survivorWorldToScreen(t.x, t.y);
                if (!isSurvivorScreenVisible(p.x, p.y, 40)) continue;
                ctx.fillStyle = t.isSmoke ? (t.color || '#6f7a8e') : (t.color || getExhaustColor(t.life));
                ctx.globalAlpha = Math.max(0, Math.min(1, t.life));
                ctx.font = `bold ${Math.max(7, Math.round((t.isSmoke ? 12 : FONT_SIZE) * p.scale))}px Courier New`;
                ctx.fillText(t.char, p.x, p.y);
            }
            for (const d of debris) {
                const p = survivorWorldToScreen(d.x, d.y);
                if (!isSurvivorScreenVisible(p.x, p.y, 50)) continue;
                ctx.fillStyle = d.color || '#ffffff';
                ctx.globalAlpha = Math.max(0, Math.min(1, d.life));
                ctx.font = `bold ${Math.max(7, Math.round((d.isImpact ? 12 : 14) * p.scale))}px Courier New`;
                ctx.fillText(d.char || '*', p.x, p.y);
            }
            for (const ring of bombBlastRings) {
                const p = survivorWorldToScreen(ring.x, ring.y);
                const progress = Math.max(0, Math.min(1, ring.life / Math.max(0.001, ring.maxLife)));
                ctx.globalAlpha = (1 - progress) * 0.72;
                ctx.strokeStyle = ring.color || '#8ff7ff';
                ctx.lineWidth = Math.max(1, (ring.lineWidth || 2) * p.scale);
                if (glowEnabled) {
                    ctx.shadowColor = ring.color || '#8ff7ff';
                    ctx.shadowBlur = (ring.shadowBlur || 10) * (1 - progress);
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, (ring.maxRadius || 80) * progress * p.scale, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawSurvivorDrops(renderNow) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const o of xpOrbs) {
                const p = survivorWorldToScreen(o.x, o.y);
                if (!isSurvivorScreenVisible(p.x, p.y, 40)) continue;
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.78 + Math.sin(renderNow * 0.006) * 0.18;
                ctx.font = `bold ${Math.round(16 * p.scale)}px Courier New`;
                ctx.fillText(o.char || '*', p.x, p.y);
            }
            for (const d of drops) {
                const p = survivorWorldToScreen(d.x, d.y);
                if (!isSurvivorScreenVisible(p.x, p.y, 46)) continue;
                ctx.globalAlpha = 1;
                if (d.isHealth) {
                    ctx.fillStyle = d.boxColor || '#d11f34';
                    ctx.font = `bold ${Math.round(20 * p.scale)}px Courier New`;
                    ctx.fillText('+', p.x, p.y);
                } else if (d.isFocus) {
                    ctx.fillStyle = '#ffd35a';
                    ctx.font = `bold ${Math.round(19 * p.scale)}px Courier New`;
                    if (glowEnabled) {
                        ctx.shadowColor = '#ffd35a';
                        ctx.shadowBlur = 10;
                    }
                    ctx.fillText('F', p.x, p.y);
                    ctx.shadowBlur = 0;
                }
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawSurvivorProjectiles(renderNow) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const b of enemyBullets) {
                const p = survivorWorldToScreen(b.x, b.y);
                if (!isSurvivorScreenVisible(p.x, p.y, 60)) continue;
                ctx.fillStyle = b.color || '#ff8fd8';
                ctx.globalAlpha = 0.92;
                ctx.font = `bold ${Math.round(18 * p.scale)}px Courier New`;
                if (glowEnabled) {
                    ctx.shadowColor = b.color || '#ff8fd8';
                    ctx.shadowBlur = 8;
                }
                ctx.fillText(b.char || 'o', p.x, p.y);
                ctx.shadowBlur = 0;
            }
            for (const pObj of comboProjectiles) {
                const p = survivorWorldToScreen(pObj.x, pObj.y);
                if (!isSurvivorScreenVisible(p.x, p.y, 70)) continue;
                const stats = pObj.stats || {};
                const size = Math.max(8, Math.round((stats.plasmaCloud ? 22 : (stats.miniTorpedo ? 18 : 16)) * (stats.sizeMult || 1) * p.scale));
                ctx.fillStyle = pObj.color || '#ffffff';
                ctx.globalAlpha = Math.max(0.18, Math.min(1, (pObj.life || 1) / Math.max(0.001, pObj.maxLife || 1)));
                ctx.font = `bold ${size}px Courier New`;
                if (glowEnabled && (stats.plasmaCloud || stats.lightningBall || pObj.isCrit)) {
                    ctx.shadowColor = pObj.color || '#ffffff';
                    ctx.shadowBlur = stats.plasmaCloud ? 14 : 8;
                }
                ctx.save();
                ctx.translate(p.x, p.y);
                if (!stats.plasmaCloud) ctx.rotate(Math.atan2(pObj.vy || 0, pObj.vx || 1) + Math.PI / 2);
                ctx.fillText(pObj.sprite || (stats.plasmaCloud ? '*' : '|'), 0, 0);
                ctx.restore();
                ctx.shadowBlur = 0;
            }
            for (const bomb of bombProjectiles) {
                const p = survivorWorldToScreen(bomb.x, bomb.y);
                if (!isSurvivorScreenVisible(p.x, p.y, 70)) continue;
                ctx.fillStyle = bomb.launchColor || '#8ff7ff';
                ctx.font = `bold ${Math.round(24 * p.scale)}px Courier New`;
                if (glowEnabled) {
                    ctx.shadowColor = bomb.launchColor || '#8ff7ff';
                    ctx.shadowBlur = 12;
                }
                ctx.fillText('@', p.x, p.y);
                ctx.shadowBlur = 0;
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawSurvivorEnemies(renderNow) {
            for (const e of enemies) {
                if (!e || !e.isSurvivorEnemy) continue;
                const p = survivorWorldToScreen(e.x, e.y);
                if (!isSurvivorScreenVisible(p.x, p.y, 80)) continue;
                const oldX = e.x;
                const oldY = e.y;
                const oldScale = e.enemyShipVisualScale;
                e.x = p.x;
                e.y = p.y;
                e.enemyShipVisualScale = (oldScale || 1) * Math.max(0.62, p.scale);
                drawFocusEnemyTrail(e, e.flashTimer > 0 ? '#ffffff' : null);
                if (e.enemyShipSprite && typeof drawEnemyShipSprite === 'function') {
                    drawEnemyShipSprite(e, e.flashTimer > 0 ? '#ffffff' : null);
                } else {
                    ctx.fillStyle = e.flashTimer > 0 ? '#ffffff' : (e.color || '#ff8fd8');
                    ctx.font = `bold ${Math.round(20 * p.scale)}px Courier New`;
                    ctx.fillText(e.sprite && e.sprite[0] ? e.sprite[0][0] : 'V', p.x, p.y);
                }
                if (e.meleeAnim > 0) {
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, Math.min(1, e.meleeAnim / 0.24));
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = e.enemyShipGlowColor || e.color || '#ff8fd8';
                    ctx.shadowBlur = glowEnabled ? 10 : 0;
                    ctx.font = `bold ${Math.round(24 * p.scale)}px Courier New`;
                    const a = Math.atan2(player.y - oldY, player.x - oldX);
                    ctx.translate(p.x + Math.cos(a) * 24 * p.scale, p.y + Math.sin(a) * 24 * p.scale);
                    ctx.rotate(a + Math.PI / 2);
                    ctx.fillText('/', 0, 0);
                    ctx.restore();
                }
                e.x = oldX;
                e.y = oldY;
                e.enemyShipVisualScale = oldScale;
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawSurvivorBoss(renderNow) {
            if (!boss || !boss.isSurvivorBoss) return;
            const p = survivorWorldToScreen(boss.x, boss.y);
            if (!isSurvivorScreenVisible(p.x, p.y, 220)) return;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(Math.max(0.55, p.scale * (boss.renderScale || 1)), Math.max(0.55, p.scale * (boss.renderScale || 1)));
            ctx.font = `bold 20px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled) {
                ctx.shadowColor = boss.flashTimer > 0 ? '#ffffff' : boss.color;
                ctx.shadowBlur = 14 + Math.sin(renderNow * 0.005) * 4;
            }
            const bSX = -(boss.sprite[0].length * charW) / 2;
            const bSY = -(boss.sprite.length * charH) / 2;
            drawAsciiSprite(boss.sprite, bSX, bSY, boss.flashTimer > 0 ? '#ffffff' : boss.color);
            ctx.restore();
            ctx.shadowBlur = 0;
            drawSurvivorBossBar();
        }

        function drawSurvivorBossBar() {
            if (!boss || !boss.isSurvivorBoss) return;
            const barW = Math.min(width * 0.72, 680);
            const barH = 8;
            const x = width / 2 - barW / 2;
            const y = height - HUD_HEIGHT - 26;
            const ratio = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
            ctx.save();
            ctx.fillStyle = 'rgba(2, 7, 18, 0.78)';
            ctx.fillRect(x, y, barW, barH);
            ctx.fillStyle = boss.color || '#ff5edb';
            ctx.fillRect(x, y, barW * ratio, barH);
            ctx.strokeStyle = colorWithAlpha('#ffffff', 0.35);
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barW, barH);
            ctx.font = `bold 13px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(boss.name, width / 2, y - 5);
            ctx.restore();
        }

        function drawSurvivorPlayerLayoutTint(layout, tint) {
            for (let i = 0; i < layout.thrusters.length; i++) drawPlayerPart(layout.thrusters[i], null, tint);
            for (let i = 0; i < layout.accents.length; i++) drawPlayerPart(layout.accents[i], null, tint);
            drawPlayerPart(layout.body, null, tint);
        }

        function drawSurvivorPlayerAfterimages(renderNow) {
            const afterimages = survivorState.playerTurnAfterimages || [];
            if (!afterimages.length || gameState === 'DYING') return;
            const oldX = player.x;
            const oldY = player.y;
            const oldCache = player._renderLayoutCache;
            const tintColor = '#8ff7ff';
            const center = getSurvivorScreenCenter();
            const cameraScale = survivorState.cameraScale || SURVIVOR_CAMERA_SCALE;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < afterimages.length; i++) {
                const ghost = afterimages[i];
                const lifeRatio = Math.max(0, Math.min(1, ghost.life / Math.max(0.001, ghost.maxLife || SURVIVOR_TURN_AFTERIMAGE_LIFE)));
                if (lifeRatio <= 0.01) continue;
                const p = {
                    x: center.x + (ghost.x - oldX) * cameraScale,
                    y: center.y + (ghost.y - oldY) * cameraScale
                };
                if (!isSurvivorScreenVisible(p.x, p.y, 90)) continue;
                const ghostX = p.x + (ghost.offsetX || 0) * lifeRatio;
                const ghostY = p.y + (ghost.offsetY || 0) * lifeRatio;
                player.x = ghostX;
                player.y = ghostY;
                player._renderLayoutCache = null;
                const layout = getPlayerRenderLayout(player, 'center');
                const tint = { color: tintColor, amount: 0.9 };
                const pulse = 0.85 + Math.sin(renderNow * 0.025 + i) * 0.15;
                const alpha = Math.pow(lifeRatio, 1.35);
                ctx.save();
                ctx.translate(ghostX, ghostY);
                ctx.rotate(ghost.angle + Math.PI / 2);
                ctx.scale(
                    SURVIVOR_PLAYER_RENDER_SCALE * (1.08 + (1 - lifeRatio) * 0.16),
                    SURVIVOR_PLAYER_RENDER_SCALE * (1.08 + (1 - lifeRatio) * 0.16)
                );
                ctx.translate(-ghostX, -ghostY);
                ctx.shadowColor = ghost.color || currentThemeColor || tintColor;
                ctx.shadowBlur = glowEnabled ? 22 * alpha + 8 * pulse : 0;
                ctx.fillStyle = tintColor;
                ctx.globalAlpha = 0.38 * alpha;
                for (const offset of [[-1.5, 0], [1.5, 0], [0, -1.5], [0, 1.5]]) {
                    ctx.save();
                    ctx.translate(offset[0], offset[1]);
                    drawSurvivorPlayerLayoutTint(layout, tint);
                    ctx.restore();
                }
                ctx.globalAlpha = 0.16 * alpha;
                drawSurvivorPlayerLayoutTint(layout, tint);
                ctx.restore();
            }
            player.x = oldX;
            player.y = oldY;
            player._renderLayoutCache = oldCache;
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 0;
        }

        function drawSurvivorPlayer(renderNow, center) {
            if (gameState === 'DYING') return;
            ctx.save();
            ctx.translate(center.x, center.y);
            ctx.rotate(getSurvivorPlayerAimAngle() + Math.PI / 2);
            ctx.scale(SURVIVOR_PLAYER_RENDER_SCALE, SURVIVOR_PLAYER_RENDER_SCALE);
            ctx.translate(-center.x, -center.y);
            const oldX = player.x;
            const oldY = player.y;
            const oldCache = player._renderLayoutCache;
            player.x = center.x;
            player.y = center.y;
            player._renderLayoutCache = null;
            const pulseVisuals = getPlayerPulseVisuals(renderNow);
            player.color = pulseVisuals.color;
            ctx.fillStyle = player.color;
            ctx.shadowColor = currentThemeColor;
            ctx.shadowBlur = pulseVisuals.glow;
            drawPlayerShip(player, 'center');
            ctx.shadowBlur = 0;
            player.x = oldX;
            player.y = oldY;
            player._renderLayoutCache = oldCache;
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawSurvivorModeReadout(renderNow, dt) {
            const seconds = Math.floor(survivorState.elapsed || 0);
            const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
            const ss = (seconds % 60).toString().padStart(2, '0');
            const style = getSurvivorWaveStyle();
            const waveNumber = getSurvivorWaveNumber();
            const bossText = boss && boss.isSurvivorBoss ? `  BOSS G1 W${boss.sourceWave}` : '';
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.font = `bold 13px 'Electrolize', sans-serif`;
            ctx.fillStyle = 'rgba(220, 236, 255, 0.72)';
            ctx.fillText(`PRISM WAKE  ${mm}:${ss}  WAVE ${waveNumber} ${style.label}${bossText}  HORDE ${enemies.length}`, width / 2, 18);
            if (survivorState.autoFireHintTimer > 0) {
                survivorState.autoFireHintTimer = Math.max(0, survivorState.autoFireHintTimer - (dt || 0));
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.66)';
                const aimHint = (typeof survivorEightWayAimEnabled === 'undefined' || survivorEightWayAimEnabled)
                    ? 'ARROWS AIM | B BOMB'
                    : 'LEFT/RIGHT TURN | DOWN/B BOMB';
                ctx.fillText(`WASD MOVE | ${aimHint} | AUTO-FIRE | SPACE FOCUS | SHIFT SHRINK`, width / 2, height - HUD_HEIGHT - 48);
            }
            ctx.restore();
        }

        function isSurvivorScreenVisible(x, y, margin = 0) {
            return x >= -margin && x <= width + margin && y >= -margin && y <= height - HUD_HEIGHT + margin;
        }
