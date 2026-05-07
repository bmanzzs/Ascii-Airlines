        // Prism Wake survivor mode: locked-camera horde survival built on the existing combat assets.
        const SURVIVOR_WORLD_W = 4800;
        const SURVIVOR_WORLD_H = 4800;
        const SURVIVOR_CAMERA_SCALE = 0.70;
        const SURVIVOR_PLAYER_ACCEL = 1550;
        const SURVIVOR_PLAYER_MAX_SPEED = 255;
        const SURVIVOR_PLAYER_TURN_RESPONSE = 14.7;
        const SURVIVOR_PLAYER_ROTATE_TURN_SPEED = 3.45;
        const SURVIVOR_PLAYER_RENDER_SCALE = 0.663;
        const SURVIVOR_PLAYER_HITBOX_RADIUS = 26;
        const SURVIVOR_SPAWN_RADIUS = 620;
        const SURVIVOR_SPAWN_SCREEN_MARGIN = 96;
        const SURVIVOR_DESPAWN_RADIUS = 1280;
        const SURVIVOR_ENEMY_CAP = 96;
        const SURVIVOR_BULLET_CAP = 90;
        const SURVIVOR_FAR_STAR_COUNT = 76;
        const SURVIVOR_MID_STAR_COUNT = 156;
        const SURVIVOR_NEAR_STAR_COUNT = 76;
        const SURVIVOR_NEAR_STAR_GLYPHS = '✤✥✦✧✩✫✬✭✮✯✰✱✲✳✴✵✶✷✸✹✺✻✼✽❇❈❉❊❋';
        const SURVIVOR_NEAR_STAR_SPRING = 18;
        const SURVIVOR_NEAR_STAR_DAMPING = 8.5;
        const SURVIVOR_NEAR_STAR_WAKE_RADIUS = 150;
        const SURVIVOR_BOSS_INTRO_WARP_RADIUS = 285;
        const SURVIVOR_BOSS_INTRO_WARP_FORCE = 720;
        const SURVIVOR_WAVE_STYLE_DURATION = 30;
        const SURVIVOR_BOSS_INTERVAL = SURVIVOR_WAVE_STYLE_DURATION * 4;
        const SURVIVOR_XP_REQUIREMENT_MULT = 1.7;
        const SURVIVOR_XP_REQUIREMENT_LEVEL_GROWTH = 0.035;
        const SURVIVOR_TURN_AFTERIMAGE_LIFE = 0.16;
        const SURVIVOR_TURN_AFTERIMAGE_MAX = 3;
        const SURVIVOR_GLITCH_CHARGE_SPEED = 360;
        const SURVIVOR_GLITCH_STAGE_ONE_SPEED = 96;
        const SURVIVOR_GLITCH_STAGE_TWO_SPEED = 132;
        const SURVIVOR_GLITCH_BOUND_X = 560;
        const SURVIVOR_GLITCH_BOUND_Y = 430;
        const SURVIVOR_NULL_PHANTOM_PATTERN_DURATION = 4.0;
        const SURVIVOR_NULL_PHANTOM_NEEDLE_INTERVAL = 2.5;
        const SURVIVOR_NULL_PHANTOM_NEEDLE_DELAY = 0.15;
        const SURVIVOR_NULL_PHANTOM_NEEDLE_SPEED = 225;
        const SURVIVOR_NULL_PHANTOM_RING_SPEED = 154;
        const SURVIVOR_NULL_PHANTOM_SPIRAL_SPEED = 205;
        const SURVIVOR_NULL_PHANTOM_FAN_SPEED = 160;
        const SURVIVOR_GHOST_SIGNAL_PATTERN_DURATION = 4.0;
        const SURVIVOR_GHOST_SIGNAL_STAGE_TWO_TRANSITION_DURATION = 1.3;
        const SURVIVOR_GHOST_SIGNAL_RING_INTERVAL = 1.0;
        const SURVIVOR_GHOST_SIGNAL_SPIRAL_INTERVAL = 0.12;
        const SURVIVOR_GHOST_SIGNAL_FAN_INTERVAL = 0.74;
        const SURVIVOR_GHOST_SIGNAL_ZIGZAG_INTERVAL = 2.55;
        const SURVIVOR_GHOST_SIGNAL_FORK_INTERVAL = 1.95;
        const SURVIVOR_GHOST_SIGNAL_STORM_INTERVAL = 0.92;
        const SURVIVOR_GHOST_SIGNAL_WRAITH_INTERVAL = 0.84;
        const SURVIVOR_GHOST_SIGNAL_MACHINE_RELAY_COUNT = 5;
        const SURVIVOR_BEAM_RANGE_MULT = 1.08;
        const SURVIVOR_BEAM_DAMAGE_MULT = 0.72;
        const SURVIVOR_BEAM_WIDTH_MULT = 0.92;
        const SURVIVOR_BEAM_ECHO_ALPHA = 0.42;
        const SURVIVOR_PROJECTILE_WORLD_MARGIN = 120;

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
                nullPhantomScale: 0.836,
                introDuration: 4,
                type: 'nullPhantom',
                startMusic: startVoidWalkerMusic,
                stopMusic: stopVoidWalkerMusic
            },
            {
                sourceWave: 10,
                name: 'DISTORTED GLITCH',
                sprite: GLITCH_SPRITE_1,
                color: '#00ff66',
                hp: 800,
                renderScale: 1.199,
                introDuration: 4,
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
                renderScale: 1.3,
                introDuration: 7.5,
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
                renderScale: 1,
                introDuration: 6.9,
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
                introDuration: typeof TRINITY_INTRO_DURATION === 'number' ? TRINITY_INTRO_DURATION : 4.2,
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
                introDuration: typeof DREAD_INTRO_DURATION === 'number' ? DREAD_INTRO_DURATION : 5,
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
                spawnTimer: 1.25,
                eliteTimer: 18,
                bossTimer: SURVIVOR_BOSS_INTERVAL,
                bossSerial: 0,
                waveStyleOffset: 0,
                aimAngle: PLAYER_FIRE_FORWARD_ANGLE,
                cameraScale: SURVIVOR_CAMERA_SCALE,
                hordePulse: 0,
                autoFireHintTimer: 3.5,
                playerTurnAfterimages: [],
                turnAfterimageCooldown: 0,
                stars: [],
                nearStars: [],
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
            syncSurvivorXpRequirement();

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
            for (let i = 0; i < 4; i++) {
                spawnSurvivorEnemy('base', {
                    angle: (Math.PI * 2 * i) / 4 + Math.random() * 0.22,
                    distance: SURVIVOR_SPAWN_RADIUS + Math.random() * 120
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

        function getSurvivorXpNeededForLevel(level) {
            const safeLevel = Math.max(1, level || 1);
            const n = safeLevel - 1;
            const base = typeof getXpNeededForLevel === 'function'
                ? getXpNeededForLevel(safeLevel)
                : Math.max(10, Math.round(10 + n * 9 + n * n * 5));
            const mult = SURVIVOR_XP_REQUIREMENT_MULT + Math.min(0.58, n * SURVIVOR_XP_REQUIREMENT_LEVEL_GROWTH);
            return Math.max(12, Math.round(base * mult));
        }

        function syncSurvivorXpRequirement() {
            if (!player) return 0;
            const needed = getSurvivorXpNeededForLevel(player.level || 1);
            player.xpNeeded = needed;
            return needed;
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

        function survivorScreenToWorld(x, y) {
            const center = getSurvivorScreenCenter();
            const scale = Math.max(0.001, survivorState.cameraScale || SURVIVOR_CAMERA_SCALE);
            return {
                x: player.x + (x - center.x) / scale,
                y: player.y + (y - center.y) / scale,
                scale
            };
        }

        function getSurvivorScreenCenter() {
            return {
                x: width / 2,
                y: (height - HUD_HEIGHT) * 0.52
            };
        }

        function getSurvivorBossIntroAnchor(def, serial) {
            const center = getSurvivorScreenCenter();
            const playfieldH = Math.max(1, height - HUD_HEIGHT);
            const scale = Math.max(0.001, survivorState.cameraScale || SURVIVOR_CAMERA_SCALE);
            const screenPaddingX = Math.max(92, Math.min(150, width * 0.1));
            const maxOffset = Math.max(80, Math.min(width * 0.24, 260));
            const minOffset = Math.min(maxOffset, Math.max(48, width * 0.1));
            const offsetSeed = Math.sin((serial || 1) * 2.399 + (survivorState.elapsed || 0) * 0.23);
            const side = offsetSeed < 0 ? -1 : 1;
            const xOffset = side * (minOffset + Math.abs(offsetSeed) * Math.max(0, maxOffset - minOffset));
            const targetScreenX = Math.max(screenPaddingX, Math.min(width - screenPaddingX, center.x + xOffset));
            const topPad = Math.max(84, Math.min(126, playfieldH * 0.14));
            const maxRevealY = Math.max(topPad, Math.min(playfieldH * 0.36, center.y - 112));
            let targetScreenY = topPad + Math.random() * Math.max(0, maxRevealY - topPad);
            const minWorldDistance = def && def.type === 'overheatingFirewall' ? 420 : 350;
            const minScreenDistance = Math.min(minWorldDistance * scale, Math.max(110, center.y - topPad));
            const dx = targetScreenX - center.x;
            const dy = targetScreenY - center.y;
            const screenDistance = Math.hypot(dx, dy);

            if (screenDistance > 0.001 && screenDistance < minScreenDistance) {
                targetScreenY = center.y + dy * (minScreenDistance / screenDistance);
            } else if (screenDistance <= 0.001) {
                targetScreenY = center.y - minScreenDistance;
            }

            targetScreenY = Math.max(topPad, Math.min(maxRevealY, targetScreenY));
            const world = survivorScreenToWorld(targetScreenX, targetScreenY);
            world.screenX = targetScreenX;
            world.screenY = targetScreenY;
            return world;
        }

        function getSurvivorVisibleWorldExtents() {
            const scale = Math.max(0.001, survivorState.cameraScale || SURVIVOR_CAMERA_SCALE);
            const center = getSurvivorScreenCenter();
            const playfieldH = Math.max(1, height - HUD_HEIGHT);
            return {
                left: center.x / scale,
                right: Math.max(1, width - center.x) / scale,
                top: Math.max(1, center.y) / scale,
                bottom: Math.max(1, playfieldH - center.y) / scale,
                margin: SURVIVOR_SPAWN_SCREEN_MARGIN / scale
            };
        }

        function getSurvivorVisibleWorldRadius() {
            const ext = getSurvivorVisibleWorldExtents();
            const halfW = Math.max(ext.left, ext.right);
            const halfH = Math.max(ext.top, ext.bottom);
            return Math.hypot(halfW, halfH);
        }

        function getSurvivorSpawnDistanceForAngle(angle, requestedDistance = SURVIVOR_SPAWN_RADIUS) {
            const ext = getSurvivorVisibleWorldExtents();
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            const distances = [];
            if (Math.abs(dx) > 0.001) distances.push((dx > 0 ? ext.right : ext.left) / Math.abs(dx));
            if (Math.abs(dy) > 0.001) distances.push((dy > 0 ? ext.bottom : ext.top) / Math.abs(dy));
            const edgeDistance = distances.length ? Math.min(...distances) : SURVIVOR_SPAWN_RADIUS;
            return Math.max(SURVIVOR_SPAWN_RADIUS, requestedDistance || 0, edgeDistance + ext.margin);
        }

        function getSurvivorSpawnPoint(angle, requestedDistance = SURVIVOR_SPAWN_RADIUS) {
            const distance = getSurvivorSpawnDistanceForAngle(angle, requestedDistance);
            return {
                x: player.x + Math.cos(angle) * distance,
                y: player.y + Math.sin(angle) * distance,
                distance
            };
        }

        function getSurvivorDespawnRadius() {
            const ext = getSurvivorVisibleWorldExtents();
            return Math.max(SURVIVOR_DESPAWN_RADIUS, getSurvivorVisibleWorldRadius() + ext.margin * 2);
        }

        function initSurvivorStars() {
            survivorState.stars = [];
            survivorState.nearStars = [];
            const seed = survivorState.worldSeed || 0;
            const makeNoise = (i, salt) => {
                const n = Math.sin(seed + i * 19.19 + salt * 37.73) * (43758.5453 + salt * 913.17);
                return n - Math.floor(n);
            };
            const addStar = (i, layer) => {
                const n1 = makeNoise(i, 0.2);
                const n2 = makeNoise(i, 1.7);
                const n3 = makeNoise(i, 3.1);
                const n4 = makeNoise(i, 5.9);
                const n5 = makeNoise(i, 8.4);
                const n6 = makeNoise(i, 11.2);
                const x = (n1 - Math.floor(n1) - 0.5) * SURVIVOR_WORLD_W;
                const y = (n2 - Math.floor(n2) - 0.5) * SURVIVOR_WORLD_H;
                const depth = layer === 'near' ? 0.62 + n3 * 0.20 : (layer === 'far' ? 0.05 + n3 * 0.25 : 0.28 + n3 * 0.44);
                const parallax = layer === 'near' ? 0.45 + n4 * 0.13 : (layer === 'far' ? 0.08 + n4 * 0.08 : 0.22 + n4 * 0.28);
                const nearGlyphIndex = Math.floor(n5 * SURVIVOR_NEAR_STAR_GLYPHS.length) % SURVIVOR_NEAR_STAR_GLYPHS.length;
                const nearFormatRoll = Math.floor(n6 * 4);
                const star = {
                    x,
                    y,
                    hx: x,
                    hy: y,
                    vx: 0,
                    vy: 0,
                    depth,
                    parallax,
                    layer,
                    physics: true,
                    playerWake: layer === 'near',
                    wakeStrength: layer === 'near' ? 1 : (layer === 'mid' ? 0.62 : 0.34),
                    highlight: 0,
                    alpha: layer === 'far' ? 0.045 + n3 * 0.08 : (layer === 'near' ? 0.17 + n3 * 0.15 : 0.08 + n3 * 0.18),
                    glyph: layer === 'far' ? (n4 > 0.78 ? "'" : '.') : (layer === 'near' ? SURVIVOR_NEAR_STAR_GLYPHS[nearGlyphIndex] : (n4 > 0.72 ? '·' : (n4 > 0.38 ? '.' : "'"))),
                    phase: (n1 + n2 + n4) * Math.PI * 2,
                    twinklePhase: (n2 + n5) * Math.PI * 2,
                    twinkleSpeed: 0.0009 + n6 * 0.0009,
                    twinkleAmount: layer === 'far' ? 0.035 + n5 * 0.055 : (layer === 'near' ? 0.08 : 0.12),
                    color: layer === 'near' ? (n4 > 0.80 ? '#dffcff' : (n4 > 0.58 ? '#89e8ff' : '#6fa8ff')) : (layer === 'far' ? (n4 > 0.86 ? '#9fb8ff' : '#284677') : (n4 > 0.84 ? '#cfe9ff' : (n4 > 0.58 ? '#7fffea' : '#5f91e8'))),
                    fontSize: layer === 'near' ? (depth > 0.74 ? 10 : 9) : (layer === 'far' ? 7 : (depth > 0.54 ? 9 : 8)),
                    fontWeight: layer === 'near' && (nearFormatRoll === 1 || nearFormatRoll === 3) ? 'bold' : 'normal',
                    fontStyle: layer === 'near' && nearFormatRoll >= 2 ? 'italic' : 'normal',
                    fontFamily: layer === 'near' ? '"Segoe UI Symbol", "DejaVu Sans", serif' : 'Courier New'
                };
                survivorState.stars.push(star);
                if (star.playerWake) survivorState.nearStars.push(star);
            };
            let cursor = 0;
            for (let i = 0; i < SURVIVOR_FAR_STAR_COUNT; i++, cursor++) addStar(cursor, 'far');
            for (let i = 0; i < SURVIVOR_MID_STAR_COUNT; i++, cursor++) addStar(cursor, 'mid');
            for (let i = 0; i < SURVIVOR_NEAR_STAR_COUNT; i++, cursor++) addStar(cursor, 'near');
        }

        function writeSurvivorStarScreenPosition(star, center, fieldH, scale, out) {
            const parallax = star.parallax || (0.18 + (star.depth || 0.5) * 0.52);
            let sx = center.x + ((star.x || 0) - player.x * parallax) * scale;
            let sy = center.y + ((star.y || 0) - player.y * parallax) * scale;
            sx = ((sx % width) + width) % width;
            sy = ((sy % fieldH) + fieldH) % fieldH;
            out.x = sx;
            out.y = sy;
            out.scale = scale;
            return out;
        }

        function updateSurvivorStarfield(dt) {
            const stars = survivorState.stars || [];
            if (!stars.length) return;
            const center = getSurvivorScreenCenter();
            const fieldH = Math.max(1, height - HUD_HEIGHT);
            const cameraScale = survivorState.cameraScale || SURVIVOR_CAMERA_SCALE;
            const starScreen = { x: 0, y: 0, scale: cameraScale };
            const playerSpeed = Math.hypot(player.vx || 0, player.vy || 0);
            const speedRatio = Math.min(1, playerSpeed / Math.max(1, SURVIVOR_PLAYER_MAX_SPEED));
            const wakeActive = speedRatio > 0.04;
            const highlightDecay = Math.pow(0.88, dt * 60);

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                const depth = s.depth || 0.5;
                const wakeStrength = s.wakeStrength || 0.5;
                const wobble = Math.sin(s.phase + survivorState.elapsed * (0.38 + depth * 0.74)) * (0.8 + depth * 2.2) * wakeStrength;
                const drift = Math.cos(s.phase * 0.7 + survivorState.elapsed * (0.28 + depth * 0.35)) * (0.45 + depth * 0.95) * wakeStrength;
                const targetX = s.hx + wobble;
                const targetY = s.hy + drift;
                const spring = SURVIVOR_NEAR_STAR_SPRING * (0.48 + wakeStrength * 0.62);
                s.vx += (targetX - s.x) * spring * dt;
                s.vy += (targetY - s.y) * spring * dt;

                if (wakeActive && s.playerWake) {
                    const p = writeSurvivorStarScreenPosition(s, center, fieldH, cameraScale, starScreen);
                    const dx = p.x - center.x;
                    const dy = p.y - center.y;
                    const distSq = dx * dx + dy * dy;
                    const radiusSq = SURVIVOR_NEAR_STAR_WAKE_RADIUS * SURVIVOR_NEAR_STAR_WAKE_RADIUS;
                    if (distSq < radiusSq && distSq > 0.01) {
                        const dist = Math.sqrt(distSq);
                        const influence = 1 - dist / SURVIVOR_NEAR_STAR_WAKE_RADIUS;
                        const force = influence * (38 + speedRatio * 78) * (0.75 + depth * 0.35);
                        s.vx += (dx / dist) * force * dt / Math.max(0.001, p.scale);
                        s.vy += (dy / dist) * force * dt / Math.max(0.001, p.scale);
                        s.highlight = Math.max(s.highlight || 0, influence * (0.18 + speedRatio * 0.28));
                    }
                }

                const damping = Math.exp(-SURVIVOR_NEAR_STAR_DAMPING * (0.74 + wakeStrength * 0.28) * dt);
                s.vx *= damping;
                s.vy *= damping;
                const maxSpeed = 105 + depth * 150 + wakeStrength * 50;
                const speed = Math.hypot(s.vx, s.vy);
                if (speed > maxSpeed && speed > 0) {
                    const scale = maxSpeed / speed;
                    s.vx *= scale;
                    s.vy *= scale;
                }
                s.x += s.vx * dt;
                s.y += s.vy * dt;

                const homeDx = s.x - s.hx;
                const homeDy = s.y - s.hy;
                const homeDist = Math.hypot(homeDx, homeDy);
                const maxDisplacement = 14 + depth * 34 + wakeStrength * 8;
                if (homeDist > maxDisplacement && homeDist > 0) {
                    const clampScale = maxDisplacement / homeDist;
                    s.x = s.hx + homeDx * clampScale;
                    s.y = s.hy + homeDy * clampScale;
                    s.vx *= 0.42;
                    s.vy *= 0.42;
                }
                s.highlight = (s.highlight || 0) * highlightDecay;
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
            if (boss && boss.isSurvivorBoss && boss.phase === 'DEFEAT') {
                updateSurvivorBossDeathCinematic(safeDt);
                updateSurvivorParticles(safeDt);
                shake *= 0.90;
                wobble *= 0.84;
                return;
            }
            survivorState.elapsed += safeDt;
            survivorState.hordePulse += hostileDt;

            updateSurvivorPlayer(safeDt);
            updateSurvivorStarfield(safeDt);
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

        function getSurvivorPlayerHitboxRadius() {
            const playerScale = typeof getPlayerHitboxScale === 'function' ? getPlayerHitboxScale() : 1;
            return SURVIVOR_PLAYER_HITBOX_RADIUS * SURVIVOR_PLAYER_RENDER_SCALE * playerScale;
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
                const turnGap = aimInput ? Math.abs(normalizeAngle(targetAim - currentAim)) : 0;
                const turnBlend = aimInput ? 1 - Math.exp(-SURVIVOR_PLAYER_TURN_RESPONSE * dt) : 0;
                nextAim = aimInput ? normalizeAngle(lerpAngle(currentAim, targetAim, turnBlend)) : currentAim;
                survivorState.turnAfterimageCooldown = Math.max(0, (survivorState.turnAfterimageCooldown || 0) - dt);
                if (aimInput && turnGap > 0.14 && survivorState.turnAfterimageCooldown <= 0) {
                    pushSurvivorPlayerTurnAfterimage(currentAim, targetAim);
                    survivorState.turnAfterimageCooldown = 0.065;
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
            const bombHeld = keys[' '] || keys.b || (!eightWayAim && keys.arrowdown);
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
                offsetX: Math.cos(angle + Math.PI / 2 * turnDir) * 7,
                offsetY: Math.sin(angle + Math.PI / 2 * turnDir) * 7,
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
            if (s.mode === 'beam') {
                updateSurvivorRayBeam(dt, s, totalFireRateBonus);
                return;
            }
            if (typeof updateBeamDeploy === 'function') updateBeamDeploy(dt);
            if (currentFrameNow - player.lastFire > actualFireRate) {
                fireCombo(getSurvivorPlayerAimAngle());
            }
        }

        function getSurvivorBeamAngles(stats, baseAngle) {
            const baseAngles = typeof getFirePatternAngles === 'function'
                ? getFirePatternAngles(stats, baseAngle, true)
                : [baseAngle];
            const angles = baseAngles.map(angle => ({ angle, damageScale: 1, visualScale: 1, echo: false }));
            if (stats.prismSplit) {
                const splitAngle = stats.prismSplitAngle || 0.34;
                const splitDamage = Math.max(0.18, stats.prismSplitDamageMult || 0.42);
                for (const entry of baseAngles.slice(0, 2)) {
                    angles.push({ angle: entry - splitAngle, damageScale: splitDamage, visualScale: 0.74, echo: true });
                    angles.push({ angle: entry + splitAngle, damageScale: splitDamage, visualScale: 0.74, echo: true });
                }
            }
            return angles.slice(0, 5);
        }

        function applySurvivorBeamDamageToTarget(target, damage, stats, beamOrigin, beamAngle, hitIndex) {
            if (!target || damage <= 0) return;
            const phaseStacks = stats.phaseNeedle ? Math.min(hitIndex, Math.max(1, stats.phaseMaxStacks || 3)) : 0;
            const finalDamage = damage * Math.pow(stats.phaseDamageRamp || 1.16, phaseStacks);
            target.hp -= finalDamage;
            target.flashTimer = Math.max(target.flashTimer || 0, 0.055);
            if (stats.splashRadius > 0) {
                target.survivorBeamSplashCooldown = Math.max(0, (target.survivorBeamSplashCooldown || 0) - finalDamage * 0.0025);
                if (target.survivorBeamSplashCooldown <= 0) {
                    target.survivorBeamSplashCooldown = 0.18;
                    const splashDamage = finalDamage * Math.max(0.18, stats.splashDamagePercent || 0.4);
                    if (typeof radialExplosion === 'function') {
                        radialExplosion(target.x, target.y, stats.splashRadius * 18, splashDamage, Math.min(4, stats.splashVisualDebris ?? 4), { shakeAmount: 0, wakeStrength: 5 });
                    }
                }
            }
            if ((stats.chainCount || 0) > 0 && typeof triggerProjectileChain === 'function') {
                target.survivorBeamChainCooldown = Math.max(0, (target.survivorBeamChainCooldown || 0) - finalDamage * 0.003);
                if (target.survivorBeamChainCooldown <= 0 && Math.random() < Math.min(0.65, (stats.chainChance ?? 1) * 0.16)) {
                    target.survivorBeamChainCooldown = 0.22;
                    triggerProjectileChain({
                        x: target.x,
                        y: target.y,
                        startX: beamOrigin.x,
                        startY: beamOrigin.y,
                        baseVx: Math.cos(beamAngle) * 720,
                        baseVy: Math.sin(beamAngle) * 720,
                        vx: Math.cos(beamAngle) * 720,
                        vy: Math.sin(beamAngle) * 720,
                        color: '#fff2aa',
                        damage: finalDamage * 0.44,
                        stats: { ...stats, chainCount: Math.max(0, (stats.chainCount || 0) - 1), splashRadius: 0, mode: 'projectile' },
                        pierceHits: [target],
                        pierceCount: 0
                    }, target);
                }
            }
            if (target.hp > 0) return;
            if (target.isSurvivorBoss) {
                killSurvivorBoss(target);
                return;
            }
            const idx = enemies.indexOf(target);
            if (idx >= 0) {
                if (typeof explodeEnemy === 'function') explodeEnemy(target);
                enemies.splice(idx, 1);
            }
        }

        function updateSurvivorRayBeam(dt, stats, totalFireRateBonus = 0) {
            player.isBeaming = true;
            player.isFiring = true;
            const rawAngle = getSurvivorPlayerAimAngle();
            const beamAngle = typeof updateBeamAngle === 'function' ? updateBeamAngle(dt, rawAngle) : rawAngle;
            const deployFactor = typeof updateBeamDeploy === 'function' ? updateBeamDeploy(dt) : 1;
            if (deployFactor <= 0.04) return;

            const origin = getSurvivorWeaponOrigin(false);
            const baseRange = typeof BEAM_RANGE === 'number' ? BEAM_RANGE : 620;
            const beamLength = baseRange * SURVIVOR_BEAM_RANGE_MULT * deployFactor;
            const baseFont = typeof BEAM_BASE_FONT_SIZE === 'number' ? BEAM_BASE_FONT_SIZE : 20;
            const beamRadius = Math.max(8, baseFont * (stats.sizeMult || 1) * SURVIVOR_BEAM_WIDTH_MULT * 0.38);
            let damagePerSecond = (42 * (stats.damageMult || 1) + (player.modifiers.laserDamage || 0) * 4.2) * getPlayerDamageScale() * SURVIVOR_BEAM_DAMAGE_MULT;
            if ((stats.critChance || 0) > 0 && typeof getAveragedCriticalDamageMult === 'function') {
                damagePerSecond *= getAveragedCriticalDamageMult(stats, 0.65);
            }
            if (player.hp < player.maxHp * 0.5) damagePerSecond *= (1 + (player.modifiers.adrenaline || 0));
            damagePerSecond *= 1 + Math.min(0.32, Math.max(0, totalFireRateBonus) * 0.18);

            const beams = getSurvivorBeamAngles(stats, beamAngle);
            for (const beam of beams) {
                const dx = Math.cos(beam.angle);
                const dy = Math.sin(beam.angle);
                const beamDamage = damagePerSecond * dt * (beam.damageScale || 1);
                let hitIndex = 0;
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    if (!e || !e.isSurvivorEnemy || !isEnemyDamageable(e)) continue;
                    const ex = e.x - origin.x;
                    const ey = e.y - origin.y;
                    const t = ex * dx + ey * dy;
                    if (t <= 0 || t > beamLength) continue;
                    if (typeof doesBeamHitTargetMask === 'function'
                        ? doesBeamHitTargetMask(origin.x, origin.y, dx, dy, beamLength, beamRadius * (beam.visualScale || 1), e)
                        : Math.hypot(ex - dx * t, ey - dy * t) <= beamRadius + 18) {
                        applySurvivorBeamDamageToTarget(e, beamDamage, stats, origin, beam.angle, hitIndex++);
                    }
                }
                if (boss && boss.isSurvivorBoss && boss.phase === 'ACTIVE') {
                    const bx = boss.x - origin.x;
                    const by = boss.y - origin.y;
                    const t = bx * dx + by * dy;
                    if (t > 0 && t <= beamLength && (typeof doesBeamHitTargetMask === 'function'
                        ? doesBeamHitTargetMask(origin.x, origin.y, dx, dy, beamLength, beamRadius * (beam.visualScale || 1), boss)
                        : Math.hypot(bx - dx * t, by - dy * t) <= beamRadius + 42)) {
                        applySurvivorBeamDamageToTarget(boss, beamDamage * 0.85, stats, origin, beam.angle, hitIndex);
                    }
                }
            }

            if (debris.length < 620 && Math.random() < dt * 18) {
                const sparkDistance = 70 + Math.random() * beamLength * 0.65;
                const side = beamAngle + Math.PI / 2;
                debris.push({
                    x: origin.x + Math.cos(beamAngle) * sparkDistance + Math.cos(side) * (Math.random() - 0.5) * beamRadius * 1.8,
                    y: origin.y + Math.sin(beamAngle) * sparkDistance + Math.sin(side) * (Math.random() - 0.5) * beamRadius * 1.8,
                    vx: Math.cos(side) * (Math.random() - 0.5) * 90,
                    vy: Math.sin(side) * (Math.random() - 0.5) * 90,
                    char: Math.random() > 0.5 ? '|' : '.',
                    color: Math.random() > 0.72 ? '#ffffff' : '#fff2aa',
                    life: 0.14 + Math.random() * 0.12,
                    isImpact: true
                });
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
            const intensity = Math.min(1, elapsed / 420);
            const earlyPressure = Math.min(1.08, 0.58 + Math.min(1, elapsed / 210) * 0.5);
            const style = getSurvivorWaveStyle();
            const bossPressureMult = boss && boss.isSurvivorBoss ? 0.72 : 1;
            const spawnPressure = Math.max(0.32, (style.spawnRate || 1) * bossPressureMult * earlyPressure);
            const interval = Math.max(0.52, 1.34 - intensity * 0.38) / spawnPressure;
            if (survivorState.spawnTimer <= 0) {
                survivorState.spawnTimer = interval * (0.82 + Math.random() * 0.42);
                const rawBurst = 1 + Math.floor(Math.max(0, elapsed - 90) / 125) + (Math.random() < 0.07 + intensity * 0.14 ? 1 : 0);
                const burstPressure = 0.84 + intensity * 0.22;
                const burst = Math.max(1, Math.round(rawBurst * (style.burstMult || 1) * bossPressureMult * burstPressure));
                for (let i = 0; i < burst && enemies.length < SURVIVOR_ENEMY_CAP; i++) {
                    const kind = weightedSurvivorPick(style.mix, 'base');
                    spawnSurvivorEnemy(kind, buildSurvivorSpawnOptions(style, i, burst));
                }
            }

            if (survivorState.eliteTimer <= 0 && enemies.length < SURVIVOR_ENEMY_CAP) {
                survivorState.eliteTimer = (Math.max(11, 23 - intensity * 8.5) + Math.random() * 6.5) * (style.eliteDelayMult || 1);
                const eliteKind = weightedSurvivorPick(style.eliteMix || [['armored', 4], ['elite', 2], ['crossfire', 1]], 'armored');
                spawnSurvivorEnemy(eliteKind, buildSurvivorSpawnOptions(style, 0, 1));
            }
        }

        function spawnSurvivorEnemy(kind = 'base', options = {}) {
            const elapsed = survivorState.elapsed || 0;
            const tier = Math.max(0, Math.floor(elapsed / 70));
            const angle = options.angle ?? Math.random() * Math.PI * 2;
            const requestedDistance = options.distance ?? (SURVIVOR_SPAWN_RADIUS + Math.random() * 170);
            const spawnPoint = getSurvivorSpawnPoint(angle, requestedDistance);
            const x = spawnPoint.x;
            const y = spawnPoint.y;
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
            const despawnRadius = getSurvivorDespawnRadius();
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (!e || !e.isSurvivorEnemy) continue;
                if (e.flashTimer > 0) e.flashTimer -= hostileDt;
                if (e.meleeCooldown > 0) e.meleeCooldown -= hostileDt;
                if (e.meleeAnim > 0) e.meleeAnim -= hostileDt;

                const dx = player.x - e.x;
                const dy = player.y - e.y;
                const dist = Math.max(0.001, Math.hypot(dx, dy));
                if (dist > despawnRadius) {
                    const respawnAngle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 1.4;
                    const respawnPoint = getSurvivorSpawnPoint(respawnAngle, SURVIVOR_SPAWN_RADIUS + 80);
                    e.x = respawnPoint.x;
                    e.y = respawnPoint.y;
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

                const hitboxR = getSurvivorPlayerHitboxRadius();
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
            if (boss.phase === 'INTRO') {
                updateSurvivorBossIntro(hostileDt);
                return;
            }
            if (boss.phase === 'DEFEAT') return;
            if (boss.survivorBossType === 'nullPhantom') {
                updateSurvivorNullPhantomBoss(boss, hostileDt);
                const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
                if (dist < 70) damageSurvivorPlayer(18);
                return;
            }
            if (boss.survivorBossType === 'distortedGlitch') {
                updateSurvivorDistortedGlitchBoss(boss, hostileDt);
                const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
                if (dist < 70) damageSurvivorPlayer(18);
                return;
            }
            if (boss.survivorBossType === 'ghostSignal') {
                updateSurvivorGhostSignalBoss(boss, hostileDt);
                const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
                if (dist < 70) damageSurvivorPlayer(18);
                return;
            }
            updateSurvivorBossStageState(boss, hostileDt);
            if (boss.survivorBossType === 'overheatingFirewall') updateSurvivorFirewallAmbient(boss, hostileDt);
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

        function getSurvivorConsoleWaveLimit() {
            return Math.max(40, SURVIVOR_BOSS_SEQUENCE.length * 5);
        }

        function getSurvivorConsoleGalaxyIndex() {
            if (typeof GALAXY_DEFINITIONS !== 'undefined') {
                const survivorIndex = GALAXY_DEFINITIONS.findIndex(galaxy => galaxy && galaxy.mode === 'survivor');
                if (survivorIndex >= 0) return survivorIndex;
            }
            return typeof currentGalaxyIndex === 'number' ? currentGalaxyIndex : 0;
        }

        function isSurvivorConsoleBossWave(waveNumber) {
            return waveNumber >= 5 && waveNumber % 5 === 0;
        }

        function clearSurvivorConsoleRuntime() {
            const activeSurvivorBoss = boss && boss.isSurvivorBoss ? boss : null;
            if (activeSurvivorBoss && activeSurvivorBoss.survivorBossDef && typeof activeSurvivorBoss.survivorBossDef.stopMusic === 'function') {
                activeSurvivorBoss.survivorBossDef.stopMusic();
            }
            if (typeof stopMusic === 'function') stopMusic();
            if (typeof teardownBossCinematic === 'function') teardownBossCinematic();
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
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
            shake = 0;
            wobble = 0;
            deathTimer = 0;
            playerExploded = false;
            queuedConsoleLevels = 0;
            postResumeBombLockTimer = 0;
            clearPauseVolumePreview();
        }

        function jumpToSurvivorWave(waveNumber) {
            const limit = getSurvivorConsoleWaveLimit();
            const targetWave = Math.floor(waveNumber || 0);
            if (targetWave < 1 || targetWave > limit) {
                return { ok: false, message: `Usage: sw 1-${limit}` };
            }

            const survivorGalaxyIndex = getSurvivorConsoleGalaxyIndex();
            currentGalaxyIndex = survivorGalaxyIndex;
            selectedGalaxyIndex = survivorGalaxyIndex;
            if (typeof setActiveGameMode === 'function') setActiveGameMode('survivor');

            survivorState = createSurvivorState();
            survivorState.active = true;
            survivorState.elapsed = Math.max(0, (targetWave - 1) * SURVIVOR_WAVE_STYLE_DURATION + 0.2);
            survivorState.hordePulse = survivorState.elapsed;
            survivorState.spawnTimer = 0.08;
            survivorState.eliteTimer = 5.5;
            survivorState.autoFireHintTimer = 0;
            survivorState.bossSerial = Math.floor((targetWave - 1) / 5);
            survivorState.bossTimer = SURVIVOR_BOSS_INTERVAL;
            initSurvivorStars();
            clearSurvivorConsoleRuntime();

            player.x = 0;
            player.y = 0;
            player.vx = 0;
            player.vy = 0;
            player.survivorAimAngle = PLAYER_FIRE_FORWARD_ANGLE;
            player.isFiring = true;
            player.isBeaming = false;
            player.beamDeploy = 0;
            player.lastFire = 0;
            player.invincibilityTimer = Math.max(player.invincibilityTimer || 0, 0.65);
            player.flashTimer = 0;
            syncSurvivorXpRequirement();
            if (!Number.isFinite(player.hp) || player.hp <= 0) {
                player.hp = Math.max(1, player.maxHp || (typeof getPlayerBaseMaxHp === 'function' ? getPlayerBaseMaxHp() : 100));
            }
            player._renderLayoutCache = null;

            if (typeof WaveManager !== 'undefined') {
                WaveManager.currentWave = 0;
                WaveManager.waveDelay = 999;
                WaveManager.hasSpawnedWave = true;
                WaveManager.interWaveDelayQueued = false;
                WaveManager.pendingFormationUnits = 0;
            }

            gameState = 'PLAYING';
            pauseReturnState = 'PLAYING';
            clearPauseVolumePreview();
            applyCurrentVolume();

            const bossWave = isSurvivorConsoleBossWave(targetWave);
            if (bossWave) {
                spawnSurvivorBoss();
                survivorState.bossTimer = SURVIVOR_BOSS_INTERVAL;
            } else {
                const nextBossWave = Math.ceil(Math.max(5, targetWave + 1) / 5) * 5;
                survivorState.bossTimer = Math.max(0.25, (nextBossWave - targetWave) * SURVIVOR_WAVE_STYLE_DURATION);
                if (typeof startMusic === 'function') startMusic();
            }

            const style = getSurvivorWaveStyle();
            const bossText = bossWave && boss ? `, boss ${boss.name}` : '';
            return {
                ok: true,
                waveNumber: targetWave,
                bossName: bossWave && boss ? boss.name : null,
                message: `Jumped to Prism Wake SW${targetWave} (${style.label}${bossText}).`
            };
        }

        function spawnSurvivorBoss() {
            const serial = survivorState.bossSerial + 1;
            const info = getSurvivorBossDefinition(serial);
            const def = info.def;
            survivorState.bossSerial = serial;
            const hp = Math.round(def.hp * (1 + info.cycle * 0.34));
            const introAnchor = getSurvivorBossIntroAnchor(def, serial);
            const targetX = introAnchor.x;
            const targetY = introAnchor.y;
            const finalScreenX = Number.isFinite(introAnchor.screenX) ? introAnchor.screenX : width / 2;
            const finalScreenY = Number.isFinite(introAnchor.screenY) ? introAnchor.screenY : Math.max(80, (height - HUD_HEIGHT) * 0.24);
            const approachSide = finalScreenX >= width / 2 ? -1 : 1;
            boss = {
                name: def.name,
                x: targetX,
                y: targetY,
                vx: 0,
                vy: 0,
                hp,
                maxHp: hp,
                sprite: def.sprite || [' /\\ ', '<##>', ' \\/ '],
                color: def.color || '#ff5edb',
                phase: 'INTRO',
                timer: 0,
                introDuration: def.introDuration || 4,
                introTargetX: targetX,
                introTargetY: targetY,
                introApproachOffsetX: approachSide * (86 + Math.random() * 72),
                introApproachOffsetY: -Math.max(42, Math.min(122, finalScreenY - 42)),
                introAlpha: 0,
                introDepth: 0,
                introLayerSlot: 0,
                introLayerPulse: -1,
                introDropReady: false,
                introAddsSpawned: false,
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
                nullPhantomScale: def.nullPhantomScale || 1,
                flashTimer: 0,
                explosionDebrisCap: 90
            };
            if (def && typeof def.startMusic === 'function') def.startMusic();
            initializeSurvivorBossState(boss, def);
            if (typeof getSurvivorBossIntroSpriteFrame === 'function') {
                getSurvivorBossIntroSpriteFrame(boss, '#b5bdca');
            }
            addShake(16);
        }

        function easeSurvivorBossIntro(t) {
            const x = Math.max(0, Math.min(1, t));
            return 1 - Math.pow(1 - x, 2.35);
        }

        function getSurvivorBossIntroProgress(source = boss) {
            if (!source || source.phase !== 'INTRO') return 1;
            return Math.max(0, Math.min(1, (source.timer || 0) / Math.max(0.001, source.introDuration || 4)));
        }

        function getSurvivorBossIntroAlpha(source = boss) {
            if (!source || source.phase !== 'INTRO') return 1;
            const baseAlpha = Math.max(0, Math.min(1, source.introAlpha ?? easeSurvivorBossIntro(getSurvivorBossIntroProgress(source))));
            const depthAlpha = source.survivorDepthIntroRendering && Number.isFinite(source.survivorDepthIntroAlpha)
                ? source.survivorDepthIntroAlpha
                : 1;
            return Math.max(0, Math.min(1, baseAlpha * depthAlpha));
        }

        function activateSurvivorBossFromIntro(source) {
            if (!source || source.phase !== 'INTRO') return;
            source.phase = 'ACTIVE';
            source.timer = 0;
            source.introAlpha = 1;
            source.introDropReady = true;
            source.x = source.introTargetX ?? source.x;
            source.y = source.introTargetY ?? source.y;
            source.startX = source.x;
            source.startY = source.y;
            source.attackTimer = source.survivorBossType === 'distortedGlitch' ? 0.55 : 0.72;
            source.attackIndex = 0;
            source.vx = 0;
            source.vy = 0;
            source.isShielded = false;
            source.isVulnerable = true;

            if (source.survivorBossType === 'overheatingFirewall') {
                source.coreTimer = 3.0;
                source.isVulnerable = true;
                source.fireGuardianSpawned = true;
                spawnSurvivorBossAdds(source, 2, 'armored', '#ff9a6c');
            } else if (source.survivorBossType === 'ghostSignal') {
                source.color = '#00ffff';
                if (!source.introAddsSpawned) {
                    source.introAddsSpawned = true;
                    spawnSurvivorBossAdds(source, 2, 'scout', '#dbe7ff');
                }
            } else if (source.survivorBossType === 'distortedGlitch') {
                source.color = '#ff00ff';
                source.matrixRainTimer = 1.15;
                source.glitchTearTimer = 999;
            }

            emitSurvivorBossBurst(source, source.color || '#ffffff', 18, ['░', '▒', '▓', '·']);
            addShake(18);
        }

        function updateSurvivorBossIntro(hostileDt) {
            if (!boss || boss.phase !== 'INTRO') return;
            const duration = Math.max(0.001, boss.introDuration || 4);
            const nextTimer = Math.min(duration, (boss.timer || 0) + hostileDt);
            const progress = nextTimer / duration;
            const depth = getSurvivorBossIntroDepth(progress);
            const layerSlot = getSurvivorBossIntroLayerSlot(depth);

            boss.timer = nextTimer;
            boss.introAlpha = Math.min(1, easeSurvivorBossIntro(Math.max(0, progress / 0.20)));
            boss.introDepth = depth;
            boss.introLayerSlot = layerSlot;
            boss.x = boss.introTargetX ?? boss.x;
            boss.y = boss.introTargetY ?? boss.y;
            boss.vx = 0;
            boss.vy = 0;
            boss.isVulnerable = false;
            boss.isShielded = true;
            boss.attackTimer = Math.max(boss.attackTimer || 0, 0.25);

            if (boss.survivorBossType === 'distortedGlitch') {
                boss.color = '#bfc7d5';
            } else if (boss.survivorBossType === 'overheatingFirewall') {
                boss.animFrame = ((boss.animFrame || 0) + hostileDt * 60) % 300;
            }

            disturbSurvivorStarsForBossIntro(boss, progress, depth, hostileDt);

            if (layerSlot > (boss.introLayerPulse || 0)) {
                boss.introLayerPulse = layerSlot;
                addShake(0.8 + layerSlot * 0.45);
            }

            if (nextTimer >= duration) activateSurvivorBossFromIntro(boss);
        }

        function smoothSurvivorIntroStep(t) {
            const x = Math.max(0, Math.min(1, t || 0));
            return x * x * (3 - x * 2);
        }

        function getSurvivorBossIntroDepth(progress) {
            const clamped = Math.max(0, Math.min(1, progress || 0));
            const eased = 1 - Math.pow(1 - clamped, 2.08);
            const depthSurge = Math.sin(clamped * Math.PI) * 0.012;
            return Math.max(0.035, Math.min(1, 0.035 + (eased + depthSurge) * 0.965));
        }

        function getSurvivorBossIntroLayerSlot(depth) {
            if (depth < 0.18) return 0;
            if (depth < 0.44) return 1;
            if (depth < 0.74) return 2;
            return 3;
        }

        function getSurvivorBossIntroLayerWeights(depth) {
            const centers = [0.08, 0.34, 0.62, 0.90];
            const width = 0.30;
            const weights = centers.map(center => {
                const t = Math.max(0, 1 - Math.abs((depth || 0) - center) / width);
                return t * t * (3 - t * 2);
            });
            const sum = weights.reduce((total, value) => total + value, 0);
            if (sum <= 0.001) {
                const slot = getSurvivorBossIntroLayerSlot(depth);
                weights[slot] = 1;
                return weights;
            }
            for (let i = 0; i < weights.length; i++) weights[i] /= sum;
            return weights;
        }

        function getSurvivorBossIntroScreenPose(source = boss, p = null) {
            if (!source) return null;
            const progress = getSurvivorBossIntroProgress(source);
            const depth = Number.isFinite(source.introDepth) ? source.introDepth : getSurvivorBossIntroDepth(progress);
            const finalPos = p || survivorWorldToScreen(source.introTargetX ?? source.x, source.introTargetY ?? source.y);
            const finalScale = finalPos.scale || (survivorState.cameraScale || SURVIVOR_CAMERA_SCALE);
            const travel = smoothSurvivorIntroStep(progress);
            const drift = Math.sin(progress * Math.PI) * (1 - travel);
            const approachX = Number.isFinite(source.introApproachOffsetX) ? source.introApproachOffsetX : 0;
            const approachY = Number.isFinite(source.introApproachOffsetY) ? source.introApproachOffsetY : -70;
            const x = finalPos.x + approachX * (1 - travel) + drift * 18;
            const y = finalPos.y + approachY * (1 - travel);
            const scale = finalScale * (0.045 + Math.pow(depth, 1.72) * 0.955);
            const alpha = Math.min(1, source.introAlpha ?? easeSurvivorBossIntro(progress));
            const layerSlot = getSurvivorBossIntroLayerSlot(depth);
            const closeGlow = smoothSurvivorIntroStep(Math.max(0, Math.min(1, (depth - 0.58) / 0.42)));
            return { x, y, scale, depth, progress, alpha, layerSlot, closeGlow, finalX: finalPos.x, finalY: finalPos.y, finalScale };
        }

        function disturbSurvivorStarsForBossIntro(source, progress, depth, hostileDt) {
            if (!source || !survivorState || !survivorState.stars) return;
            const pose = getSurvivorBossIntroScreenPose(source);
            if (!pose) return;
            const center = getSurvivorScreenCenter();
            const fieldH = Math.max(1, height - HUD_HEIGHT);
            const cameraScale = survivorState.cameraScale || SURVIVOR_CAMERA_SCALE;
            const starScreen = { x: 0, y: 0, scale: cameraScale };
            const prevX = Number.isFinite(source.introWarpScreenX) ? source.introWarpScreenX : pose.x;
            const prevY = Number.isFinite(source.introWarpScreenY) ? source.introWarpScreenY : pose.y;
            const sweepX = pose.x - prevX;
            const sweepY = pose.y - prevY;
            const sweepLenSq = sweepX * sweepX + sweepY * sweepY;
            const sweepLen = Math.sqrt(sweepLenSq);
            const shock = Math.max(0, Math.sin(Math.max(0, Math.min(1, (progress - 0.04) / 0.92)) * Math.PI));
            const arrivalSurge = smoothSurvivorIntroStep(Math.max(0, Math.min(1, (progress - 0.58) / 0.34)));
            const warpEnergy = 0.38 + shock * 0.74 + arrivalSurge * 0.36;
            for (let i = 0; i < survivorState.stars.length; i++) {
                const s = survivorState.stars[i];
                const p = writeSurvivorStarScreenPosition(s, center, fieldH, cameraScale, starScreen);
                let anchorX = pose.x;
                let anchorY = pose.y;
                if (sweepLenSq > 0.01) {
                    const t = Math.max(0, Math.min(1, ((p.x - prevX) * sweepX + (p.y - prevY) * sweepY) / sweepLenSq));
                    anchorX = prevX + sweepX * t;
                    anchorY = prevY + sweepY * t;
                }
                const dx = p.x - anchorX;
                const dy = p.y - anchorY;
                const dist = Math.max(0.001, Math.hypot(dx, dy));
                const starDepth = s.depth || 0.5;
                const wakeStrength = s.wakeStrength || 0.5;
                const radius = SURVIVOR_BOSS_INTRO_WARP_RADIUS * (0.54 + depth * 0.56 + starDepth * 0.30);
                if (dist > radius) continue;
                const influence = 1 - dist / radius;
                const shaped = influence * influence * (0.55 + influence * 0.45);
                const layerForce = 0.54 + wakeStrength * 0.78 + starDepth * 0.28;
                const force = SURVIVOR_BOSS_INTRO_WARP_FORCE * shaped * warpEnergy * layerForce * hostileDt / Math.max(0.001, p.scale);
                s.vx += (dx / dist) * force;
                s.vy += (dy / dist) * force;
                const swirl = force * (0.16 + depth * 0.18) * Math.sin(progress * Math.PI * 2.4 + s.phase);
                s.vx += (-dy / dist) * swirl;
                s.vy += (dx / dist) * swirl;
                if (sweepLen > 0.01) {
                    const drag = force * Math.min(0.32, sweepLen / 90);
                    s.vx += (sweepX / sweepLen) * drag;
                    s.vy += (sweepY / sweepLen) * drag;
                }
                s.highlight = Math.max(s.highlight || 0, shaped * (0.34 + depth * 0.58) * layerForce);
            }
            source.introWarpScreenX = pose.x;
            source.introWarpScreenY = pose.y;
        }

        function initializeSurvivorBossState(bossObj, def) {
            if (!bossObj || !def) return;
            if (def.type === 'nullPhantom') {
                bossObj.phantomPattern = 0;
                bossObj.phantomPatternTimer = 0;
                bossObj.phantomPatternFireTimer = 0.24;
                bossObj.phantomBurstTimer = 1.18;
                bossObj.phantomBurstCount = 0;
                bossObj.phantomBurstDelay = 0;
                bossObj.spiralAngle = Math.random() * Math.PI * 2;
                bossObj.attackTimer = 999;
            } else if (def.type === 'distortedGlitch') {
                bossObj.isGlitch = true;
                bossObj.stage = 1;
                bossObj.colorCycleTimer = 0;
                bossObj.glitchVx = 0;
                bossObj.glitchVy = 0;
                bossObj.dirChangeTimer = 0.25;
                bossObj.baseSpeed = SURVIVOR_GLITCH_STAGE_ONE_SPEED;
                bossObj.scatterTimer = 0.55;
                bossObj.codeVolleyTimer = 2.2;
                bossObj.isCodeVolley = false;
                bossObj.codeVolleyShots = 0;
                bossObj.codeVolleyDelay = 0;
                bossObj.isCharging = false;
                bossObj.chargeTimer = 0;
                bossObj.chargeDuration = 0;
                bossObj.glowIntensity = 0;
                bossObj.transitionFlash = 0;
                bossObj.transitionTextTimer = 0;
                bossObj.isDeadGlitching = false;
                bossObj.scrambledName = 'DISTORTED GLITCH';
                bossObj.scrambleTimer = 0.65;
                bossObj.matrixRainTimer = 1.2;
                bossObj.glitchTearTimer = 3.2;
            } else if (def.type === 'ghostSignal') {
                bossObj.stage = 1;
                bossObj.stageTwoStarted = false;
                bossObj.signalPattern = 0;
                bossObj.signalPatternTimer = 0;
                bossObj.signalFireTimer = 0.28;
                bossObj.signalSpiralAngle = 0;
                bossObj.signalPulseComboCount = 0;
                bossObj.signalPulseComboDelay = 0;
                bossObj.signalComboCooldown = 0;
                bossObj.signalMachineRelayCount = 0;
                bossObj.signalMachineRelayTotal = 0;
                bossObj.signalMachineDelay = 0;
                bossObj.signalMachineCooldown = 0;
                bossObj.signalMachineSideFlip = false;
                bossObj.signalStageTransitionTimer = 0;
                bossObj.signalStageTransitionDuration = SURVIVOR_GHOST_SIGNAL_STAGE_TWO_TRANSITION_DURATION;
                bossObj.isVulnerable = true;
            } else if (def.type === 'overheatingFirewall') {
                bossObj.stage = 1;
                bossObj.stageTwoStarted = false;
                bossObj.coreTimer = 0.2;
                bossObj.isVulnerable = true;
                bossObj.firestormAngle = 0;
                bossObj.firewallCurtainFlip = false;
                bossObj.smokeTimer = 0;
            }
        }

        function updateSurvivorBossStageState(source, hostileDt) {
            if (!source || !source.isSurvivorBoss) return;
            if (source.survivorBossType === 'ghostSignal' && (source.stage || 1) === 1 && source.hp <= source.maxHp * 0.5) {
                source.stage = 2;
                source.stageTwoStarted = true;
                source.color = '#f4fbff';
                source.attackIndex = 0;
                source.attackTimer = Math.min(source.attackTimer || 0, 0.7);
                spawnSurvivorBossAdds(source, 3, 'drifter', '#dbe7ff');
                addShake(12);
                emitSurvivorBossBurst(source, '#dbe7ff', 24, ['.', '+', '0', '1']);
            } else if (source.survivorBossType === 'overheatingFirewall' && (source.stage || 1) === 1 && source.hp <= source.maxHp * 0.5) {
                source.stage = 2;
                source.stageTwoStarted = true;
                source.color = '#ffdd66';
                source.attackIndex = 0;
                source.attackTimer = Math.min(source.attackTimer || 0, 0.55);
                source.coreTimer = 0.2;
                source.firestormAngle = 0;
                spawnSurvivorBossAdds(source, 2, 'armored', '#ff9a6c');
                addShake(14);
                emitSurvivorBossBurst(source, '#ff8a18', 34, ['*', '✦', '·', '░']);
            }

            if (source.survivorBossType === 'overheatingFirewall') {
                const stageTwo = (source.stage || 1) >= 2;
                const cycle = stageTwo ? 3.35 : 4.0;
                const window = stageTwo ? 2.15 : 3.0;
                source.coreTimer = (source.coreTimer || 0) + hostileDt;
                if (source.coreTimer > cycle) source.coreTimer -= cycle;
                source.isVulnerable = source.coreTimer < window;
            }
        }

        function emitSurvivorBossBurst(source, color, count, chars) {
            if (!source) return;
            const glyphs = chars && chars.length ? chars : ['*', '+', '.'];
            const cap = Math.min(count || 12, Math.max(0, 640 - debris.length));
            for (let i = 0; i < cap; i++) {
                const a = Math.random() * Math.PI * 2;
                const d = 18 + Math.random() * 78;
                debris.push({
                    x: source.x + Math.cos(a) * d,
                    y: source.y + Math.sin(a) * d,
                    vx: Math.cos(a) * (60 + Math.random() * 150),
                    vy: Math.sin(a) * (60 + Math.random() * 150),
                    char: glyphs[i % glyphs.length],
                    color: i % 4 === 0 ? '#ffffff' : color,
                    life: 0.26 + Math.random() * 0.34,
                    isImpact: true
                });
            }
        }

        function updateSurvivorFirewallAmbient(source, hostileDt) {
            const stageTwo = (source.stage || 1) >= 2;
            source.smokeTimer = (source.smokeTimer || 0) + hostileDt;
            const smokeCap = stageTwo ? 150 : 110;
            const interval = thrusterParticles.length > smokeCap ? 0.22 : (stageTwo ? 0.11 : 0.13);
            if (source.smokeTimer < interval || thrusterParticles.length >= smokeCap) return;
            source.smokeTimer %= interval;
            thrusterParticles.push({
                x: source.x + (Math.random() - 0.5) * 150,
                y: source.y - 100 - Math.random() * 50,
                vx: (Math.random() - 0.5) * 40,
                vy: -45 - Math.random() * 55,
                char: ['░', '▒', '·'][Math.floor(Math.random() * 3)],
                color: stageTwo && Math.random() > 0.72 ? '#ff8a18' : ['#555555', '#444444'][Math.floor(Math.random() * 2)],
                life: 0.95,
                isSmoke: true,
                isFirewallTrail: true
            });
        }

        function fireSurvivorNullPhantomBullet(source, angle, speed, type = 'rift', options = {}) {
            return pushSurvivorBossBullet(source.x, source.y, angle, speed, options.color || '#ff60ff', {
                char: 'x',
                life: options.life || 4.8,
                hitboxScale: options.hitboxScale || 0.72,
                isPhantomBullet: true,
                phantomBulletType: type
            });
        }

        function fireSurvivorNullPhantomNeedle(source) {
            const dx = player.x - source.x;
            const dy = player.y - source.y;
            const dist = Math.max(0.001, Math.hypot(dx, dy));
            fireSurvivorNullPhantomBullet(
                source,
                Math.atan2(dy, dx),
                SURVIVOR_NULL_PHANTOM_NEEDLE_SPEED,
                'needle',
                { life: 4.2, hitboxScale: 0.68, color: '#ff4cff' }
            );
        }

        function fireSurvivorNullPhantomRing(source) {
            const offset = (survivorState.elapsed * 0.45 + source.phantomPatternTimer * 0.18) % (Math.PI * 2);
            for (let i = 0; i < 18; i++) {
                const a = offset + (i / 18) * Math.PI * 2;
                fireSurvivorNullPhantomBullet(source, a, SURVIVOR_NULL_PHANTOM_RING_SPEED, 'rift', {
                    life: 4.15,
                    hitboxScale: 0.7,
                    color: '#ff69ff'
                });
            }
        }

        function fireSurvivorNullPhantomSpiral(source) {
            source.spiralAngle = (source.spiralAngle || 0) + 0.3;
            fireSurvivorNullPhantomBullet(source, source.spiralAngle, SURVIVOR_NULL_PHANTOM_SPIRAL_SPEED, 'rift', {
                life: 4.5,
                hitboxScale: 0.68,
                color: '#ff77ff'
            });
        }

        function fireSurvivorNullPhantomFan(source) {
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            const count = 7;
            const half = (count - 1) / 2;
            for (let i = 0; i < count; i++) {
                const offset = i - half;
                fireSurvivorNullPhantomBullet(source, aim + offset * 0.18, SURVIVOR_NULL_PHANTOM_FAN_SPEED - Math.abs(offset) * 7, 'rift', {
                    life: 4.6,
                    hitboxScale: 0.7,
                    color: Math.abs(offset) < 0.1 ? '#ffffff' : '#c9bcff'
                });
            }
        }

        function updateSurvivorNullPhantomBoss(source, hostileDt) {
            updateSurvivorBossMovement(source, hostileDt);
            if (typeof applyWakeForce === 'function') applyWakeForce(source.x, source.y, 250, 10);

            source.phantomBurstTimer = (source.phantomBurstTimer || 0) + hostileDt;
            if (source.phantomBurstTimer >= SURVIVOR_NULL_PHANTOM_NEEDLE_INTERVAL) {
                source.phantomBurstTimer %= SURVIVOR_NULL_PHANTOM_NEEDLE_INTERVAL;
                source.phantomBurstCount = 3;
                source.phantomBurstDelay = 0;
            }
            if ((source.phantomBurstCount || 0) > 0) {
                source.phantomBurstDelay = (source.phantomBurstDelay || 0) - hostileDt;
                if (source.phantomBurstDelay <= 0) {
                    source.phantomBurstDelay = SURVIVOR_NULL_PHANTOM_NEEDLE_DELAY;
                    source.phantomBurstCount--;
                    fireSurvivorNullPhantomNeedle(source);
                }
            }

            source.phantomPatternTimer = (source.phantomPatternTimer || 0) + hostileDt;
            if (source.phantomPatternTimer >= SURVIVOR_NULL_PHANTOM_PATTERN_DURATION) {
                source.phantomPatternTimer %= SURVIVOR_NULL_PHANTOM_PATTERN_DURATION;
                source.phantomPattern = ((source.phantomPattern || 0) + 1) % 3;
                source.phantomPatternFireTimer = 0.08;
                if (source.phantomPattern === 1 && !Number.isFinite(source.spiralAngle)) {
                    source.spiralAngle = Math.atan2(player.y - source.y, player.x - source.x);
                }
            }

            source.phantomPatternFireTimer = (source.phantomPatternFireTimer || 0) - hostileDt;
            const pattern = source.phantomPattern || 0;
            if (pattern === 0 && source.phantomPatternFireTimer <= 0) {
                fireSurvivorNullPhantomRing(source);
                source.phantomPatternFireTimer = 1.0;
            } else if (pattern === 1 && source.phantomPatternFireTimer <= 0) {
                fireSurvivorNullPhantomSpiral(source);
                source.phantomPatternFireTimer = 0.11;
            } else if (pattern === 2 && source.phantomPatternFireTimer <= 0) {
                fireSurvivorNullPhantomFan(source);
                source.phantomPatternFireTimer = 0.75;
            }
        }

        function updateSurvivorDistortedGlitchBoss(source, hostileDt) {
            source.colorCycleTimer = (source.colorCycleTimer || 0) + hostileDt;
            if ((source.stage || 1) === 1) {
                source.color = source.colorCycleTimer % 2.0 < 1.0 ? '#ff00ff' : '#00ffff';
            } else {
                source.color = source.colorCycleTimer % 1.0 < 0.5 ? '#ffffff' : '#00ff41';
            }

            if ((source.stage || 1) === 1 && source.hp <= source.maxHp * 0.5) {
                source.stage = 2;
                source.color = '#00ff41';
                source.transitionFlash = 0.3;
                source.transitionTextTimer = 2.0;
                source.glitchTearTimer = 2.2;
                source.matrixRainTimer = 0.05;
                source.sprite = GLITCH_SPRITE_2;
                source.baseSpeed = SURVIVOR_GLITCH_STAGE_TWO_SPEED;
                source.chargeTimer = 0;
                source.isCharging = false;
                source.attackIndex = 0;
                enemyBullets = enemyBullets.filter(b => !b.isSurvivorBullet || Math.hypot(b.x - player.x, b.y - player.y) < 900);
                emitSurvivorBossBurst(source, '#00ff41', 38, GLITCH_CHARS);
                addShake(16);
            }

            source.transitionTextTimer = Math.max(0, (source.transitionTextTimer || 0) - hostileDt);
            source.transitionFlash = Math.max(0, (source.transitionFlash || 0) - hostileDt);
            source.scrambleTimer = (source.scrambleTimer || 0) - hostileDt;
            if (source.scrambleTimer <= 0) {
                source.scrambleTimer = 0.8 + Math.random() * 0.45;
                const baseName = (source.stage || 1) >= 2 ? 'D1ST0RT3D GL1TCH' : 'DISTORTED GLITCH';
                const map = { I: '1', O: '0', E: '3', A: '4', T: '7', S: '5' };
                const chars = baseName.split('');
                let swaps = 1 + Math.floor(Math.random() * 2);
                for (let k = 0; k < 12 && swaps > 0; k++) {
                    const idx = Math.floor(Math.random() * chars.length);
                    const mapped = map[chars[idx]];
                    if (mapped) {
                        chars[idx] = mapped;
                        swaps--;
                    }
                }
                source.scrambledName = chars.join('');
            }

            if (source.transitionFlash <= 0 && !source.isCharging) {
                updateSurvivorGlitchDrift(source, hostileDt);
                source.chargeTimer = (source.chargeTimer || 0) + hostileDt;
                const chargeCycle = (source.stage || 1) >= 2 ? 2.55 : 3.85;
                if (source.chargeTimer >= chargeCycle) {
                    source.isCharging = true;
                    source.chargeDuration = 0;
                    source.glowIntensity = 0;
                    source.isDoubleCharge = (source.stage || 1) >= 2 && Math.random() < 0.35;
                    source.doubleChargePhase = 1;
                } else {
                    updateSurvivorGlitchScatter(source, hostileDt);
                    updateSurvivorGlitchCodeVolley(source, hostileDt);
                    updateSurvivorGlitchSpecialAttacks(source, hostileDt);
                }
            } else if (source.isCharging) {
                updateSurvivorGlitchCharge(source, hostileDt);
            }
        }

        function updateSurvivorGlitchDrift(source, hostileDt) {
            source.dirChangeTimer = (source.dirChangeTimer || 0) - hostileDt;
            if (source.dirChangeTimer <= 0) {
                source.dirChangeTimer = (source.stage || 1) >= 2
                    ? 0.65 + Math.random() * 0.75
                    : 1.1 + Math.random() * 1.3;
                const aim = Math.atan2(player.y - source.y, player.x - source.x);
                const angle = Math.random() < 0.42 ? aim + Math.PI + (Math.random() - 0.5) * 1.4 : Math.random() * Math.PI * 2;
                const speed = (source.baseSpeed || SURVIVOR_GLITCH_STAGE_ONE_SPEED) * (0.65 + Math.random() * 1.1);
                source.glitchVx = Math.cos(angle) * speed;
                source.glitchVy = Math.sin(angle) * speed;
            }

            if (Math.random() > 0.18) {
                source.x += (source.glitchVx || 0) * hostileDt;
                source.y += (source.glitchVy || 0) * hostileDt;
            }

            const minX = player.x - SURVIVOR_GLITCH_BOUND_X;
            const maxX = player.x + SURVIVOR_GLITCH_BOUND_X;
            const minY = player.y - SURVIVOR_GLITCH_BOUND_Y;
            const maxY = player.y - 120;
            if (source.x < minX) { source.x = minX; source.glitchVx = Math.abs(source.glitchVx || 0); }
            if (source.x > maxX) { source.x = maxX; source.glitchVx = -Math.abs(source.glitchVx || 0); }
            if (source.y < minY) { source.y = minY; source.glitchVy = Math.abs(source.glitchVy || 0); }
            if (source.y > maxY) { source.y = maxY; source.glitchVy = -Math.abs(source.glitchVy || 0); }

            source.sprite = (source.stage || 1) >= 2
                ? (Math.random() > 0.7 ? GLITCH_SPRITE_2B : GLITCH_SPRITE_2)
                : (Math.random() > 0.7 ? GLITCH_SPRITE_1B : GLITCH_SPRITE_1);

            const blinkChance = ((source.stage || 1) >= 2 ? 0.045 : 0.026) * hostileDt * 60;
            if (Math.random() < blinkChance) {
                const mega = Math.random() > 0.86;
                const d = mega ? 120 + Math.random() * 130 : 28 + Math.random() * 54;
                const a = Math.random() * Math.PI * 2;
                source.x = Math.max(minX, Math.min(maxX, source.x + Math.cos(a) * d));
                source.y = Math.max(minY, Math.min(maxY, source.y + Math.sin(a) * d));
                if (mega) {
                    emitSurvivorBossBurst(source, source.color, 14, GLITCH_CHARS);
                    addShake(5);
                }
            }
        }

        function updateSurvivorGlitchScatter(source, hostileDt) {
            source.scatterTimer = (source.scatterTimer || 0) - hostileDt;
            if (source.scatterTimer > 0) return;
            source.scatterTimer = (source.stage || 1) >= 2 ? 0.46 + Math.random() * 0.62 : 0.7 + Math.random() * 0.86;
            const count = (source.stage || 1) >= 2 ? 4 : 3;
            for (let i = 0; i < count; i++) {
                const a = Math.random() * Math.PI * 2;
                pushSurvivorBossBullet(source.x, source.y, a, 145 + Math.random() * 70, '#00ff41', {
                    char: GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
                    life: 4.5,
                    hitboxScale: 0.72,
                    isGlitchBullet: true
                });
            }
        }

        function updateSurvivorGlitchCodeVolley(source, hostileDt) {
            source.codeVolleyTimer = (source.codeVolleyTimer || 0) - hostileDt;
            if (source.isCodeVolley) {
                source.codeVolleyDelay = (source.codeVolleyDelay || 0) - hostileDt;
                if (source.codeVolleyDelay <= 0 && (source.codeVolleyShots || 0) < 4) {
                    source.codeVolleyShots = (source.codeVolleyShots || 0) + 1;
                    source.codeVolleyDelay = 0.42;
                    const aim = Math.atan2(player.y - source.y, player.x - source.x) + (Math.random() - 0.5) * 0.55;
                    pushSurvivorBossBullet(source.x, source.y, aim, 250 + Math.random() * 65, '#00ff41', {
                        char: buildSurvivorGlitchCodeLine(6 + Math.floor(Math.random() * 8)),
                        life: 4.1,
                        hitboxScale: 0.7,
                        isGlitchBullet: true,
                        isCodeLine: true
                    });
                    if (source.codeVolleyShots >= 4) {
                        source.isCodeVolley = false;
                        source.codeVolleyTimer = (source.stage || 1) >= 2 ? 3.0 + Math.random() * 1.8 : 4.8 + Math.random() * 2.6;
                    }
                }
            } else if (source.codeVolleyTimer <= 0) {
                source.isCodeVolley = true;
                source.codeVolleyShots = 0;
                source.codeVolleyDelay = 0;
            }
        }

        function updateSurvivorGlitchSpecialAttacks(source, hostileDt) {
            const stageTwo = (source.stage || 1) >= 2;
            source.matrixRainTimer = (source.matrixRainTimer ?? (stageTwo ? 0 : 3.2)) - hostileDt;
            if (source.matrixRainTimer <= 0) {
                fireSurvivorMatrixRain(source);
                source.matrixRainTimer = (stageTwo ? 7.4 : 6.2) + Math.random() * (stageTwo ? 1.5 : 1.8);
            }
            if (!stageTwo) return;
            source.glitchTearTimer = (source.glitchTearTimer || 2.8) - hostileDt;
            if (source.glitchTearTimer <= 0) {
                fireSurvivorGlitchTear(source);
                source.glitchTearTimer = 5.0 + Math.random() * 1.4;
                addShake(7);
            }
        }

        function updateSurvivorGlitchCharge(source, hostileDt) {
            source.chargeDuration = (source.chargeDuration || 0) + hostileDt;
            source.glowIntensity = Math.min(1, source.chargeDuration / 0.9);
            shake = Math.max(shake, 7 * source.glowIntensity);
            if (source.chargeDuration < 0.9) return;

            addShake((source.stage || 1) >= 2 ? 16 : 12);
            const count = (source.stage || 1) >= 2 ? 11 : 9;
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            const offset = source.isDoubleCharge && source.doubleChargePhase === 2 ? Math.PI / count : 0;
            for (let i = 0; i < count; i++) {
                const a = aim + offset + (i / count) * Math.PI * 2;
                pushSurvivorBossBullet(source.x, source.y, a, SURVIVOR_GLITCH_CHARGE_SPEED, '#00ff41', {
                    char: GLITCH_CHARS[(i * 2) % GLITCH_CHARS.length],
                    life: 1.05,
                    decay: 0.55,
                    isHuge: true,
                    hitboxScale: 0.82,
                    isGlitchBullet: true
                });
            }

            if (source.isDoubleCharge && source.doubleChargePhase === 1) {
                source.doubleChargePhase = 2;
                source.chargeDuration = 0;
            } else {
                source.isCharging = false;
                source.isDoubleCharge = false;
                source.chargeTimer = 0;
                source.glowIntensity = 0;
            }
        }

        function resetSurvivorGhostSignalAttackState(source) {
            source.signalFireTimer = 0.12;
            source.signalPulseComboCount = 0;
            source.signalPulseComboDelay = 0;
            source.signalComboCooldown = 0;
            source.signalMachineRelayCount = 0;
            source.signalMachineRelayTotal = 0;
            source.signalMachineDelay = 0;
            source.signalMachineCooldown = 0;
        }

        function dissolveSurvivorGhostSignalBullets(color = '#c8ffff') {
            for (const b of enemyBullets) {
                if (!b || !b.isSurvivorBullet || b.isDissolvingProjectile) continue;
                if (typeof beginProjectileLifetimeDissolve === 'function') {
                    beginProjectileLifetimeDissolve(b, {
                        char: b.char || 'o',
                        color,
                        scale: b.isHuge || b.isSignalStormOrb ? 0.58 : 0.88,
                        velocityScale: 0.08,
                        duration: 0.62
                    });
                }
            }
        }

        function beginSurvivorGhostSignalStageTwoTransition(source) {
            if (!source || source.stageTwoStarted) return false;
            source.stage = 2;
            source.stageTwoStarted = true;
            source.phase = 'SIGNAL_STAGE_TRANSITION';
            source.color = '#f4fbff';
            source.isVulnerable = false;
            source.isShielded = true;
            source.signalStageTransitionTimer = 0;
            source.signalStageTransitionDuration = SURVIVOR_GHOST_SIGNAL_STAGE_TWO_TRANSITION_DURATION;
            source.signalTransitionStartX = source.x;
            source.signalTransitionStartY = source.y;
            source.signalTransitionTargetX = player.x + Math.sin((source.age || 0) * 1.4) * 135;
            source.signalTransitionTargetY = player.y - 330;
            source.signalPattern = 0;
            source.signalPatternTimer = 0;
            source.signalSpiralAngle = Math.atan2(player.y - source.y, player.x - source.x);
            resetSurvivorGhostSignalAttackState(source);
            dissolveSurvivorGhostSignalBullets('#c8ffff');
            spawnSurvivorBossAdds(source, 2, 'scout', '#dbe7ff');
            emitSurvivorBossBurst(source, '#dbe7ff', 26, ['.', '+', '0', '1']);
            addShake(12);
            return true;
        }

        function updateSurvivorGhostSignalStageTransition(source, hostileDt) {
            source.signalStageTransitionTimer = (source.signalStageTransitionTimer || 0) + hostileDt;
            const duration = Math.max(0.001, source.signalStageTransitionDuration || SURVIVOR_GHOST_SIGNAL_STAGE_TWO_TRANSITION_DURATION);
            const t = Math.min(1, source.signalStageTransitionTimer / duration);
            const eased = t * t * (3 - 2 * t);
            const spectralSway = Math.sin(t * Math.PI * 2) * (1 - t) * 18;

            source.x = source.signalTransitionStartX + (source.signalTransitionTargetX - source.signalTransitionStartX) * eased + spectralSway;
            source.y = source.signalTransitionStartY + (source.signalTransitionTargetY - source.signalTransitionStartY) * eased - Math.sin(t * Math.PI) * 14;
            source.flashTimer = Math.max(source.flashTimer || 0, 0.05);
            if (typeof applyWakeForce === 'function') {
                applyWakeForce(source.x, source.y, 260, 10);
            }
            if (t < 1) return true;

            source.phase = 'ACTIVE';
            source.isVulnerable = true;
            source.isShielded = false;
            source.startX = source.x;
            source.startY = source.y;
            source.vx = 0;
            source.vy = 0;
            source.signalPattern = 0;
            source.signalPatternTimer = 0;
            resetSurvivorGhostSignalAttackState(source);
            source.attackTimer = 0.4;
            return false;
        }

        function fireSurvivorGhostSignalBullet(source, angle, speed, options = {}) {
            const x = Number.isFinite(options.x) ? options.x : source.x;
            const y = Number.isFinite(options.y) ? options.y : source.y;
            return pushSurvivorBossBullet(x, y, angle, speed, options.color || '#bfffff', {
                char: options.char || 'o',
                life: options.life ?? 4.8,
                hitboxScale: options.hitboxScale ?? 0.78,
                homingStrength: options.homingStrength || 0,
                drag: options.drag || 0,
                turnRate: options.turnRate || 0,
                isSignalPulse: true,
                isSignalYBullet: !!options.isSignalYBullet,
                signalBulletType: options.signalBulletType || 'pulse',
                isZigZag: !!options.isZigZag,
                baseVx: options.baseVx,
                baseVy: options.baseVy,
                zigTimer: options.zigTimer || 0,
                zigDir: options.zigDir || 1,
                zigInterval: options.zigInterval,
                zigAmplitude: options.zigAmplitude,
                isWraithBolt: !!options.isWraithBolt,
                isLargeWraith: !!options.isLargeWraith,
                isSignalStormOrb: !!options.isSignalStormOrb,
                isSignalMachineRelay: !!options.isSignalMachineRelay,
                isSignalMachineBit: !!options.isSignalMachineBit,
                nonDamaging: !!options.nonDamaging,
                relayFireAt: options.relayFireAt,
                relayLife: options.relayLife,
                relayBaseY: options.relayBaseY,
                relayAmp: options.relayAmp,
                relayPhase: options.relayPhase,
                relayIndex: options.relayIndex,
                relayDir: options.relayDir,
                maxSpeed: options.maxSpeed,
                accel: options.accel,
                homingTurn: options.homingTurn
            });
        }

        function fireSurvivorGhostSignalRing(source) {
            const count = 18;
            const offset = ((survivorState.elapsed || 0) * 0.88 + (source.signalPatternTimer || 0) * 0.22) % (Math.PI * 2);
            for (let i = 0; i < count; i++) {
                const a = offset + (i / count) * Math.PI * 2;
                fireSurvivorGhostSignalBullet(source, a, 158, {
                    color: i % 3 === 0 ? '#eaffff' : '#9fffff',
                    signalBulletType: 'pulse',
                    life: 4.9,
                    hitboxScale: 0.74
                });
            }
        }

        function fireSurvivorGhostSignalSpiral(source) {
            source.signalSpiralAngle = (source.signalSpiralAngle || 0) + 0.3;
            fireSurvivorGhostSignalBullet(source, source.signalSpiralAngle, 214, {
                color: '#bfffff',
                signalBulletType: 'pulse',
                life: 4.6,
                hitboxScale: 0.72
            });
        }

        function fireSurvivorGhostSignalFan(source) {
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            const count = 7;
            const half = (count - 1) / 2;
            for (let i = 0; i < count; i++) {
                const offset = i - half;
                fireSurvivorGhostSignalBullet(source, aim + offset * 0.18, 218 - Math.abs(offset) * 10, {
                    color: Math.abs(offset) < 0.1 ? '#ffffff' : '#c8ffff',
                    signalBulletType: 'pulse',
                    life: 4.7,
                    hitboxScale: 0.74
                });
            }
        }

        function fireSurvivorGhostSignalZigzag(source) {
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            for (let i = -1; i <= 1; i++) {
                const a = aim + i * 0.25;
                const speed = 190;
                fireSurvivorGhostSignalBullet(source, a, speed, {
                    char: 'z',
                    color: '#dfffff',
                    signalBulletType: 'zigzag',
                    isZigZag: true,
                    baseVx: Math.cos(a) * speed,
                    baseVy: Math.sin(a) * speed,
                    zigAmplitude: 118,
                    life: 4.9,
                    hitboxScale: 0.76
                });
            }
        }

        function fireSurvivorGhostSignalFork(source) {
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            for (const side of [-1, 1]) {
                const a = aim + side * 0.08;
                const speed = 216;
                fireSurvivorGhostSignalBullet(source, a, speed, {
                    char: 'Y',
                    color: '#ffe86b',
                    signalBulletType: 'fork',
                    isSignalYBullet: true,
                    isZigZag: true,
                    baseVx: Math.cos(a) * speed,
                    baseVy: Math.sin(a) * speed,
                    zigDir: side,
                    zigInterval: 0.26,
                    zigAmplitude: 136,
                    life: 4.7,
                    hitboxScale: 0.84
                });
            }
        }

        function fireSurvivorGhostSignalStormOrb(source) {
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            fireSurvivorGhostSignalBullet(source, aim, 128, {
                y: source.y + 8,
                color: '#76f6ff',
                signalBulletType: 'stormOrb',
                isSignalStormOrb: true,
                speed: 128,
                maxSpeed: 270,
                accel: 88,
                homingTurn: 1.15,
                life: 5.8,
                hitboxScale: 1.12
            });
        }

        function fireSurvivorGhostSignalWraithVolley(source) {
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            for (let i = -1; i <= 1; i++) {
                const a = aim + i * 0.14;
                fireSurvivorGhostSignalBullet(source, a, 226, {
                    y: source.y + 16,
                    char: '*',
                    color: '#f4f7fb',
                    signalBulletType: 'wraithLarge',
                    isWraithBolt: true,
                    isLargeWraith: true,
                    life: 4.7,
                    hitboxScale: 1.18
                });
            }
        }

        function releaseSurvivorGhostSignalMachineRelay(relay) {
            if (!relay || relay.relayFired) return;
            relay.relayFired = true;
            const aim = Math.atan2(player.y - relay.y, player.x - relay.x);
            const spread = 0.18;
            const chars = ['0', '1', '#'];
            for (let i = -1; i <= 1; i++) {
                const a = aim + i * spread;
                const speed = 218 + (i === 0 ? 28 : 0);
                pushSurvivorBossBullet(relay.x, relay.y, a, speed, i === 0 ? '#eaffff' : '#8ff7ff', {
                    char: chars[i + 1],
                    life: 3.6,
                    hitboxScale: 0.68,
                    isSignalPulse: true,
                    signalBulletType: 'machineBit',
                    isSignalMachineBit: true
                });
            }
            pushSurvivorBossBullet(relay.x + (relay.relayDir || 1) * 12, relay.y - 8, Math.PI / 2, 196, '#55f7d1', {
                char: '|',
                life: 3.1,
                hitboxScale: 0.62,
                isSignalPulse: true,
                signalBulletType: 'machineBit',
                isSignalMachineBit: true
            });
            if (debris.length < 620) {
                for (let i = 0; i < 5; i++) {
                    const a = Math.random() * Math.PI * 2;
                    debris.push({
                        x: relay.x,
                        y: relay.y,
                        vx: Math.cos(a) * (32 + Math.random() * 74),
                        vy: Math.sin(a) * (32 + Math.random() * 74),
                        char: i % 2 ? '1' : '0',
                        color: i % 3 === 0 ? '#ffffff' : '#55f7d1',
                        life: 0.16 + Math.random() * 0.16,
                        isImpact: true
                    });
                }
            }
        }

        function fireSurvivorGhostSignalMachineRelay(source, relayIndex = 0) {
            const fromLeft = (relayIndex + (source.signalMachineSideFlip ? 1 : 0)) % 2 === 0;
            const lane = relayIndex % SURVIVOR_GHOST_SIGNAL_MACHINE_RELAY_COUNT;
            const visibleHalfW = Math.max(660, width / Math.max(0.1, SURVIVOR_CAMERA_SCALE) * 0.5);
            const startOffset = visibleHalfW + 82;
            const dir = fromLeft ? 1 : -1;
            const startX = player.x + (fromLeft ? -startOffset : startOffset);
            const relayY = player.y - 270 + lane * 125 + Math.sin((source.age || 0) * 1.7 + relayIndex) * 18;
            const speed = 118 + (relayIndex % 3) * 16;
            fireSurvivorGhostSignalBullet(source, dir > 0 ? 0 : Math.PI, speed, {
                x: startX,
                y: relayY,
                char: relayIndex % 2 === 0 ? '[ ]' : '<>',
                color: relayIndex % 2 === 0 ? '#bffcff' : '#55f7d1',
                signalBulletType: 'machineRelay',
                isSignalMachineRelay: true,
                nonDamaging: true,
                hitboxScale: 0,
                life: 1.75,
                relayFireAt: 0.72 + (relayIndex % 2) * 0.08,
                relayLife: 1.45,
                relayBaseY: relayY,
                relayAmp: 10 + (relayIndex % 3) * 2,
                relayPhase: relayIndex * 1.31,
                relayIndex,
                relayDir: dir
            });
        }

        function updateSurvivorGhostSignalMachinePossessionAttack(source, hostileDt) {
            source.signalMachineCooldown = Math.max(0, (source.signalMachineCooldown || 0) - hostileDt);
            if (source.signalMachineCooldown > 0) return;
            source.signalMachineDelay = (source.signalMachineDelay || 0) - hostileDt;
            if ((source.signalMachineRelayCount || 0) <= 0) {
                source.signalMachineRelayCount = SURVIVOR_GHOST_SIGNAL_MACHINE_RELAY_COUNT;
                source.signalMachineRelayTotal = SURVIVOR_GHOST_SIGNAL_MACHINE_RELAY_COUNT;
                source.signalMachineDelay = 0;
                source.signalMachineSideFlip = !source.signalMachineSideFlip;
            }
            if (source.signalMachineRelayCount > 0 && source.signalMachineDelay <= 0) {
                const firedIndex = (source.signalMachineRelayTotal || SURVIVOR_GHOST_SIGNAL_MACHINE_RELAY_COUNT) - source.signalMachineRelayCount;
                fireSurvivorGhostSignalMachineRelay(source, firedIndex);
                source.signalMachineRelayCount--;
                source.signalMachineDelay = 0.34;
                if (source.signalMachineRelayCount <= 0) {
                    source.signalMachineCooldown = 1.35;
                }
            }
        }

        function advanceSurvivorGhostSignalPattern(source, hostileDt) {
            source.signalPatternTimer = (source.signalPatternTimer || 0) + hostileDt;
            if (source.signalPatternTimer < SURVIVOR_GHOST_SIGNAL_PATTERN_DURATION) return;
            source.signalPatternTimer %= SURVIVOR_GHOST_SIGNAL_PATTERN_DURATION;
            const stageTwo = (source.stage || 1) >= 2;
            source.signalPattern = ((source.signalPattern || 0) + 1) % (stageTwo ? 3 : 5);
            resetSurvivorGhostSignalAttackState(source);
            if (source.signalPattern === 1 && !Number.isFinite(source.signalSpiralAngle)) {
                source.signalSpiralAngle = Math.atan2(player.y - source.y, player.x - source.x);
            }
        }

        function updateSurvivorGhostSignalStageOneAttacks(source, hostileDt) {
            source.signalFireTimer = (source.signalFireTimer || 0) - hostileDt;
            const pattern = source.signalPattern || 0;
            if (pattern === 0 && source.signalFireTimer <= 0) {
                fireSurvivorGhostSignalRing(source);
                source.signalFireTimer = SURVIVOR_GHOST_SIGNAL_RING_INTERVAL;
            } else if (pattern === 1 && source.signalFireTimer <= 0) {
                fireSurvivorGhostSignalSpiral(source);
                source.signalFireTimer = SURVIVOR_GHOST_SIGNAL_SPIRAL_INTERVAL;
            } else if (pattern === 2 && source.signalFireTimer <= 0) {
                fireSurvivorGhostSignalFan(source);
                source.signalFireTimer = SURVIVOR_GHOST_SIGNAL_FAN_INTERVAL;
            } else if (pattern === 3 && source.signalFireTimer <= 0) {
                fireSurvivorGhostSignalZigzag(source);
                source.signalFireTimer = SURVIVOR_GHOST_SIGNAL_ZIGZAG_INTERVAL;
            } else if (pattern === 4 && source.signalFireTimer <= 0) {
                fireSurvivorGhostSignalFork(source);
                source.signalFireTimer = SURVIVOR_GHOST_SIGNAL_FORK_INTERVAL;
            }
        }

        function updateSurvivorGhostSignalStageTwoAttacks(source, hostileDt) {
            source.signalFireTimer = (source.signalFireTimer || 0) - hostileDt;
            const pattern = (source.signalPattern || 0) % 3;
            if (pattern === 0 && source.signalFireTimer <= 0) {
                fireSurvivorGhostSignalStormOrb(source);
                source.signalFireTimer = SURVIVOR_GHOST_SIGNAL_STORM_INTERVAL;
            } else if (pattern === 1 && source.signalFireTimer <= 0) {
                fireSurvivorGhostSignalWraithVolley(source);
                source.signalFireTimer = SURVIVOR_GHOST_SIGNAL_WRAITH_INTERVAL;
            } else if (pattern === 2) {
                updateSurvivorGhostSignalMachinePossessionAttack(source, hostileDt);
            }
        }

        function updateSurvivorGhostSignalBoss(source, hostileDt) {
            if (source.phase === 'SIGNAL_STAGE_TRANSITION') {
                updateSurvivorGhostSignalStageTransition(source, hostileDt);
                return;
            }
            if ((source.stage || 1) === 1 && source.hp <= source.maxHp * 0.5) {
                beginSurvivorGhostSignalStageTwoTransition(source);
                return;
            }

            source.driftTimer = (source.driftTimer || 0) + hostileDt;
            updateSurvivorBossMovement(source, hostileDt);
            if (typeof applyWakeForce === 'function') {
                const stageTwo = (source.stage || 1) >= 2;
                applyWakeForce(source.x, source.y, stageTwo ? 250 : 185, stageTwo ? 8 : 5);
            }

            advanceSurvivorGhostSignalPattern(source, hostileDt);
            if ((source.stage || 1) >= 2) {
                updateSurvivorGhostSignalStageTwoAttacks(source, hostileDt);
            } else {
                updateSurvivorGhostSignalStageOneAttacks(source, hostileDt);
            }
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
                else if (pattern === 1) fireSurvivorBossRing(source, 16, 145, '#00ff66', { char: '1', phaseRate: 1.1, jitter: 0.05, isGlitchBullet: true });
                else fireSurvivorBossFan(source, { count: 9, spread: 0.14, speed: 172, color: '#65ff9a', coreColor: '#d9ffe7', jitter: 0.07, isGlitchBullet: true });
                return;
            }
            if (type === 'ghostSignal') {
                source.attackTimer = 3.45 + Math.random() * 0.65;
                if (pattern === 0) fireSurvivorBossFan(source, { count: 6, spread: 0.22, speed: 145, color: '#dbe7ff', coreColor: '#ffffff', homingStrength: 0.55, isSignalPulse: true, signalBulletType: 'pulse' });
                else if (pattern === 1) fireSurvivorBossRing(source, 12, 118, '#f4f8ff', { char: '.', homingStrength: 0.35, isSignalPulse: true, signalBulletType: (source.stage || 1) >= 2 ? 'stormOrb' : 'pulse' });
                else spawnSurvivorBossAdds(source, 4, 'scout', '#dbe7ff');
                return;
            }
            if (type === 'overheatingFirewall') {
                source.attackTimer = 3.25 + Math.random() * 0.55;
                if (pattern === 0) fireSurvivorBossWall(source, '#ff8a48');
                else if (pattern === 1) fireSurvivorBossRing(source, 18, 126, '#ff7840', { char: '*', phaseRate: 0.7, isFirewallBullet: true, firewallBulletType: 'flame', originYOffset: FIREWALL_BOSS_CORE_OFFSET_Y });
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
                life: options.life ?? 5,
                maxLife: options.life ?? 5,
                hitboxScale: options.hitboxScale ?? 0.82,
                homingStrength: options.homingStrength || 0,
                drag: options.drag || 0,
                decay: options.decay || 0,
                isHuge: !!options.isHuge,
                isGlitchBullet: !!options.isGlitchBullet,
                isCodeLine: !!options.isCodeLine,
                isMatrixRainColumn: !!options.isMatrixRainColumn,
                matrixGlyphGap: options.matrixGlyphGap,
                matrixTrailAlpha: options.matrixTrailAlpha,
                morphTimer: options.morphTimer || 0,
                speed,
                turnRate: options.turnRate || 0,
                isSignalPulse: !!options.isSignalPulse,
                isSignalYBullet: !!options.isSignalYBullet,
                signalBulletType: options.signalBulletType || null,
                isSignalStormOrb: !!options.isSignalStormOrb,
                isSignalMachineRelay: !!options.isSignalMachineRelay,
                isSignalMachineBit: !!options.isSignalMachineBit,
                nonDamaging: !!options.nonDamaging,
                relayFireAt: options.relayFireAt,
                relayLife: options.relayLife,
                relayBaseY: options.relayBaseY,
                relayAmp: options.relayAmp,
                relayPhase: options.relayPhase,
                relayIndex: options.relayIndex,
                relayDir: options.relayDir,
                maxSpeed: options.maxSpeed,
                accel: options.accel,
                homingTurn: options.homingTurn,
                age: options.age || 0,
                isPhantomBullet: !!options.isPhantomBullet,
                phantomBulletType: options.phantomBulletType || null,
                isWraithBolt: !!options.isWraithBolt,
                isLargeWraith: !!options.isLargeWraith,
                isFirewallBullet: !!options.isFirewallBullet,
                isLargeFlame: !!options.isLargeFlame,
                firewallBulletType: options.firewallBulletType || null,
                baseVx: Number.isFinite(options.baseVx) ? options.baseVx : undefined,
                baseVy: Number.isFinite(options.baseVy) ? options.baseVy : undefined,
                isZigZag: !!options.isZigZag,
                zigTimer: options.zigTimer || 0,
                zigDir: options.zigDir || 1,
                zigInterval: options.zigInterval,
                zigAmplitude: options.zigAmplitude
            });
            return true;
        }

        function fireSurvivorBossRing(source, count, speed, color, options = {}) {
            const offset = (survivorState.elapsed * 0.9) % (Math.PI * 2);
            const originY = source.y + (options.originYOffset || 0);
            for (let i = 0; i < count; i++) {
                const jitter = options.jitter ? (Math.random() - 0.5) * options.jitter : 0;
                const a = offset * (options.phaseRate || 1) + (Math.PI * 2 * i) / count + jitter;
                pushSurvivorBossBullet(source.x, originY, a, speed, color, {
                    char: options.char || 'o',
                    life: options.life || 5,
                    hitboxScale: options.hitboxScale || 0.84,
                    homingStrength: options.homingStrength || 0,
                    isGlitchBullet: !!options.isGlitchBullet,
                    isSignalPulse: !!options.isSignalPulse,
                    signalBulletType: options.signalBulletType || null,
                    isFirewallBullet: !!options.isFirewallBullet,
                    isLargeFlame: !!options.isLargeFlame,
                    firewallBulletType: options.firewallBulletType || null
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
                    homingStrength: options.homingStrength || 0,
                    isGlitchBullet: !!options.isGlitchBullet,
                    isSignalPulse: !!options.isSignalPulse,
                    signalBulletType: options.signalBulletType || null,
                    isFirewallBullet: !!options.isFirewallBullet,
                    isLargeFlame: !!options.isLargeFlame,
                    firewallBulletType: options.firewallBulletType || null
                });
            }
        }

        function buildSurvivorGlitchCodeLine(length = 8) {
            const codeChars = GLITCH_CHARS.join('') + '01{}[];:=></%!&|~';
            let codeLine = '';
            for (let k = 0; k < length; k++) {
                codeLine += codeChars[Math.floor(Math.random() * codeChars.length)];
            }
            return codeLine;
        }

        function buildSurvivorMatrixRainColumn(length = 10) {
            const chars = typeof DISTORTED_GLITCH_MATRIX_CHARS === 'string'
                ? DISTORTED_GLITCH_MATRIX_CHARS
                : 'ﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let column = '';
            for (let i = 0; i < length; i++) {
                column += chars[Math.floor(Math.random() * chars.length)];
            }
            return column;
        }

        function fireSurvivorMatrixRain(source) {
            const stageTwo = (source.stage || 1) >= 2;
            const columns = stageTwo ? 9 : 8;
            const safeLane = Math.max(0, Math.min(columns - 1, Math.floor((player.x - (source.x - 420)) / 840 * columns)));
            for (let i = 0; i < columns; i++) {
                if (Math.abs(i - safeLane) < (stageTwo ? 0.35 : 0.55) && Math.random() < 0.78) continue;
                const x = player.x + (i - (columns - 1) / 2) * 92 + (Math.random() - 0.5) * 38;
                const y = player.y - 520 - Math.random() * 130;
                pushSurvivorBossBullet(x, y, Math.PI / 2 + (Math.random() - 0.5) * 0.06, (stageTwo ? 165 : 148) + Math.random() * 34, i % 4 === 0 ? '#d8ffe0' : '#00ff41', {
                    char: buildSurvivorMatrixRainColumn(stageTwo ? 12 : 10),
                    life: 6.5,
                    hitboxScale: 0.58,
                    isGlitchBullet: true,
                    isMatrixRainColumn: true,
                    matrixGlyphGap: stageTwo ? 15 : 16,
                    matrixTrailAlpha: stageTwo ? 0.56 : 0.48,
                    morphTimer: Math.random() * 0.12
                });
            }
            fireSurvivorBossFan(source, { count: stageTwo ? 6 : 5, spread: 0.15, speed: stageTwo ? 158 : 142, color: '#65ff9a', coreColor: '#d9ffe7', life: 4.2, isGlitchBullet: true });
        }

        function fireSurvivorGlitchTear(source) {
            const tearY = player.y - 110 + (Math.random() - 0.5) * 120;
            for (const side of [-1, 1]) {
                const fromLeft = side < 0;
                const x = player.x + side * 620;
                for (let i = 0; i < 5; i++) {
                    const a = fromLeft ? 0 : Math.PI;
                    pushSurvivorBossBullet(x, tearY + (i - 2) * 28, a + (Math.random() - 0.5) * 0.04, 255 + i * 16, i % 2 === 0 ? '#00ff41' : '#d8ffe0', {
                        char: GLITCH_CHARS[(i * 3 + (fromLeft ? 0 : 1)) % GLITCH_CHARS.length],
                        life: 4.2,
                        hitboxScale: 0.78,
                        turnRate: (fromLeft ? 1 : -1) * (i - 2) * 0.11,
                        isGlitchBullet: true
                    });
                }
            }
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            for (let i = 0; i < 8; i++) {
                const side = i % 2 === 0 ? -1 : 1;
                const spread = 0.18 + Math.floor(i / 2) * 0.09;
                pushSurvivorBossBullet(source.x, source.y, aim + side * spread, 235 + i * 7, i % 3 === 0 ? '#ffffff' : '#00ff41', {
                    char: i % 2 ? 'ﾋ' : 'ﾊ',
                    life: 4.6,
                    hitboxScale: 0.74,
                    turnRate: side * -0.16,
                    isGlitchBullet: true
                });
            }
        }

        function fireSurvivorBossWall(source, color) {
            const base = Math.atan2(player.y - source.y, player.x - source.x);
            const perp = base + Math.PI / 2;
            const originY = source.survivorBossType === 'overheatingFirewall' && typeof FIREWALL_BOSS_CORE_OFFSET_Y === 'number'
                ? source.y + FIREWALL_BOSS_CORE_OFFSET_Y
                : source.y;
            for (let i = -4; i <= 4; i++) {
                const x = source.x + Math.cos(perp) * i * 58;
                const y = originY + Math.sin(perp) * i * 58;
                pushSurvivorBossBullet(x, y, base + (Math.random() - 0.5) * 0.04, 132 + Math.abs(i) * 3, color, {
                    char: i % 2 === 0 ? '❋' : '.',
                    life: 5.4,
                    hitboxScale: 0.82,
                    isFirewallBullet: true,
                    isLargeFlame: i % 2 === 0,
                    firewallBulletType: i % 2 === 0 ? 'flame' : 'spark'
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

        function removeSurvivorEnemyTarget(target) {
            const idx = enemies.indexOf(target);
            if (idx < 0) return;
            if (typeof explodeEnemy === 'function') explodeEnemy(target);
            enemies.splice(idx, 1);
        }

        function updateSurvivorProjectileMotion(p, dt) {
            const stats = p.stats || {};
            if ((p.orbitTime || 0) > 0) {
                p.orbitTime -= dt;
                p.orbitAngle += (p.orbitSpin || 8.5) * dt;
                const radiusPulse = Math.sin((p.age || 0) * 18) * 3;
                const orbitRadius = (p.orbitRadius || 34) + radiusPulse;
                p.x = player.x + Math.cos(p.orbitAngle) * orbitRadius;
                p.y = player.y + Math.sin(p.orbitAngle) * orbitRadius * 0.72;
                if (p.orbitTime <= 0) {
                    const releaseAngle = p.releaseAngle ?? getSurvivorPlayerAimAngle();
                    const releaseSpeed = p.releaseSpeed || (1400 * (stats.speedMult || 1));
                    if (stats.orbitReleaseCenter) {
                        p.x = player.x;
                        p.y = player.y;
                    }
                    p.baseVx = Math.cos(releaseAngle) * releaseSpeed;
                    p.baseVy = Math.sin(releaseAngle) * releaseSpeed;
                    p.vx = p.baseVx;
                    p.vy = p.baseVy;
                    p.startX = p.x;
                    p.startY = p.y;
                    p.releaseAge = p.age || 0;
                    p.maxLife = Math.max(0.1, p.life || 0.1);
                }
                return;
            }

            const returnReadyAt = (p.orbitHoldTime || 0) + (stats.returnAfter || 0.5);
            if (stats.returning && !p.hasReturned && (p.age || 0) >= returnReadyAt) {
                p.hasReturned = true;
                p.damage *= 0.68;
                p.pierceHits = [];
                p.pierceCount = Math.max(p.pierceCount || 0, (stats.pierceCount || 0) + 1);
                p.sprite = '+';
                p.color = '#77ffe7';
            }

            if (p.hasReturned) {
                const dx = player.x - p.x;
                const dy = player.y - p.y;
                const dist = Math.max(1, Math.hypot(dx, dy));
                const returnSpeed = 1180 * (stats.speedMult || 1);
                p.baseVx = (dx / dist) * returnSpeed;
                p.baseVy = (dy / dist) * returnSpeed;
                p.vx = p.baseVx;
                p.vy = p.baseVy;
                p.x += p.baseVx * dt;
                p.y += p.baseVy * dt;
                if (dist < 24 && (p.age || 0) > returnReadyAt + 0.16) p.life = 0;
                return;
            }

            if (stats.homing) {
                const nearestInfo = findNearestSurvivorTarget(p.x, p.y);
                if (nearestInfo.target) {
                    const desired = Math.atan2(nearestInfo.target.y - p.y, nearestInfo.target.x - p.x);
                    const current = Math.atan2(p.baseVy || p.vy || 0, p.baseVx || p.vx || 1);
                    const blend = Math.min(1, dt * (stats.homingStrength || 4));
                    const angle = lerpAngle(current, desired, blend);
                    const speed = Math.max(80, Math.hypot(p.baseVx || p.vx || 0, p.baseVy || p.vy || 0));
                    p.baseVx = Math.cos(angle) * speed;
                    p.baseVy = Math.sin(angle) * speed;
                    p.vx = p.baseVx;
                    p.vy = p.baseVy;
                }
            }

            if (stats.plasmaCloud) {
                const releaseAngle = p.releaseAngle ?? Math.atan2(p.baseVy || -1, p.baseVx || 0);
                const releaseSpeed = p.releaseSpeed || Math.hypot(p.baseVx || 0, p.baseVy || 0);
                const speed = releaseSpeed * (typeof getPlasmaCloudSpeedFactor === 'function' ? getPlasmaCloudSpeedFactor(p) : 1);
                const travelAge = Math.max(0, (p.age || 0) - (p.releaseAge || 0));
                const curvePhase = travelAge * (p.cloudCurveFrequency || 2.1) + (p.cloudCurveSeed || 0);
                const curveGrowth = Math.min(1, travelAge / 0.7);
                const lateralSpeed = Math.sin(curvePhase) * (p.cloudCurveStrength || 0) * curveGrowth;
                const forwardX = Math.cos(releaseAngle);
                const forwardY = Math.sin(releaseAngle);
                const sideX = -forwardY;
                const sideY = forwardX;
                p.baseVx = forwardX * speed + sideX * lateralSpeed;
                p.baseVy = forwardY * speed + sideY * lateralSpeed;
                p.vx = p.baseVx;
                p.vy = p.baseVy;
                p.x += p.baseVx * dt;
                p.y += p.baseVy * dt;
            } else if (stats.pathFunction === 'sine') {
                const travelAge = Math.max(0, (p.age || 0) - (p.releaseAge || 0));
                const speed = Math.max(1, Math.hypot(p.baseVx || p.vx || 0, p.baseVy || p.vy || 0));
                const perpX = -(p.baseVy || p.vy || 0) / speed;
                const perpY = (p.baseVx || p.vx || 0) / speed;
                const linearX = (p.startX || p.x) + (p.baseVx || p.vx || 0) * travelAge;
                const linearY = (p.startY || p.y) + (p.baseVy || p.vy || 0) * travelAge;
                const offset = Math.sin(travelAge * 15) * 40 * (stats.sineAmplitudeMult || 1);
                p.x = linearX + perpX * offset;
                p.y = linearY + perpY * offset;
                p.vx = p.baseVx || p.vx;
                p.vy = p.baseVy || p.vy;
            } else {
                const vx = p.baseVx ?? p.vx ?? 0;
                const vy = p.baseVy ?? p.vy ?? 0;
                p.x += vx * dt;
                p.y += vy * dt;
                p.vx = vx;
                p.vy = vy;
            }
        }

        function applySurvivorProjectileDirectHit(p, target, dt) {
            const stats = p.stats || {};
            if (!target) return false;
            if (target.isSurvivorBoss && target.phase !== 'ACTIVE') return false;
            const alreadyHit = Array.isArray(p.pierceHits) && p.pierceHits.includes(target);
            if (stats.plasmaCloud) {
                const cloudGrowth = typeof getPlasmaCloudGrowthFactor === 'function' ? getPlasmaCloudGrowthFactor(p) : 1;
                const dotDamage = (p.damage || 1) * (stats.cloudDotMult || 6) * cloudGrowth * dt;
                target.hp -= dotDamage;
                target.flashTimer = Math.max(target.flashTimer || 0, 0.05);
                if (!alreadyHit) {
                    p.pierceHits.push(target);
                    if (typeof triggerProjectileChain === 'function') triggerProjectileChain(p, target);
                }
                p.cloudSparkTimer = Math.max(0, (p.cloudSparkTimer || 0) - dt);
                if (p.cloudSparkTimer <= 0) {
                    if (typeof emitProjectileImpactDebris === 'function') emitProjectileImpactDebris(p, 1, target.color || p.color);
                    p.cloudSparkTimer = 0.08;
                }
                if (target.hp <= 0) {
                    if (target.isSurvivorBoss) killSurvivorBoss(target);
                    else removeSurvivorEnemyTarget(target);
                }
                return false;
            }

            if (alreadyHit) return false;
            damageSurvivorTarget(p, target);
            if (typeof applyPhaseNeedleProjectileBoost === 'function') applyPhaseNeedleProjectileBoost(p);
            if (stats.chainCount > 0 && typeof triggerProjectileChain === 'function') triggerProjectileChain(p, target);
            if (stats.splashRadius > 0 && typeof radialExplosion === 'function') {
                radialExplosion(p.x, p.y, stats.splashRadius * 22, (p.damage || 1) * (stats.splashDamagePercent || 0.4), stats.splashVisualDebris ?? 4, { shakeAmount: 0, wakeStrength: 6 });
            }
            if (typeof emitProjectileImpactDebris === 'function') emitProjectileImpactDebris(p, stats.lightningBall ? 1 : 3, target.color || p.color);
            if (stats.miniTorpedo) return true;
            p.pierceCount = Math.max(0, p.pierceCount || 0);
            if (p.pierceCount > 0) {
                p.pierceCount--;
                return false;
            }
            return true;
        }

        function handleSurvivorProjectileRicochet(p) {
            const stats = p.stats || {};
            const ricochetCap = stats.ricochetCount || 0;
            if (ricochetCap <= 0 || (p.bouncesUsed || 0) >= ricochetCap || stats.plasmaCloud || stats.miniTorpedo || stats.pathFunction === 'sine' || stats.pathFunction === 'parabolic' || stats.returning || p.hasReturned || (p.orbitTime || 0) > 0) {
                return false;
            }
            const cameraScale = Math.max(0.001, survivorState.cameraScale || SURVIVOR_CAMERA_SCALE);
            const halfW = Math.min(SURVIVOR_WORLD_W / 2, width / (2 * cameraScale) + 22);
            const halfH = Math.min(SURVIVOR_WORLD_H / 2, Math.max(1, height - HUD_HEIGHT) / (2 * cameraScale) + 22);
            const minX = player.x - halfW;
            const maxX = player.x + halfW;
            const minY = player.y - halfH;
            const maxY = player.y + halfH;
            let bounced = false;
            if (p.x < minX && (p.baseVx || p.vx || 0) < 0) { p.x = minX; p.baseVx = Math.abs(p.baseVx || p.vx || 0); bounced = true; }
            else if (p.x > maxX && (p.baseVx || p.vx || 0) > 0) { p.x = maxX; p.baseVx = -Math.abs(p.baseVx || p.vx || 0); bounced = true; }
            if (p.y < minY && (p.baseVy || p.vy || 0) < 0) { p.y = minY; p.baseVy = Math.abs(p.baseVy || p.vy || 0); bounced = true; }
            else if (p.y > maxY && (p.baseVy || p.vy || 0) > 0) { p.y = maxY; p.baseVy = -Math.abs(p.baseVy || p.vy || 0); bounced = true; }
            if (!bounced) return false;
            p.vx = p.baseVx;
            p.vy = p.baseVy;
            p.bouncesUsed = (p.bouncesUsed || 0) + 1;
            p.damage *= stats.ricochetDamageMult || 1;
            p.startX = p.x;
            p.startY = p.y;
            p.releaseAngle = Math.atan2(p.baseVy || 0, p.baseVx || 1);
            if (Array.isArray(p.pierceHits)) p.pierceHits.length = 0;
            if (debris.length < 620) {
                for (let sp = 0; sp < 3; sp++) {
                    const a = Math.random() * Math.PI * 2;
                    const speed = 90 + Math.random() * 110;
                    debris.push({ x: p.x, y: p.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, char: sp % 2 ? '+' : '.', color: '#9bf7ff', life: 0.22, isImpact: true });
                }
            }
            return true;
        }

        function updateSurvivorProjectiles(dt) {
            for (let i = comboProjectiles.length - 1; i >= 0; i--) {
                const p = comboProjectiles[i];
                if (!p) continue;
                const stats = p.stats || {};
                if (p.isDissolvingProjectile) {
                    if (typeof updateProjectileLifetimeDissolve === 'function' && updateProjectileLifetimeDissolve(p, dt)) {
                        comboProjectiles.splice(i, 1);
                    }
                    continue;
                }
                if (p.releaseDelay && p.releaseDelay > 0) {
                    p.releaseDelay -= dt;
                    continue;
                }
                p.age = (p.age || 0) + dt;
                p.life -= dt;
                p.prevX = p.x;
                p.prevY = p.y;

                if (((stats.prismSplitDelay || 0) <= p.age) && typeof spawnPrismSplitProjectiles === 'function') {
                    spawnPrismSplitProjectiles(p);
                }
                if (p.life <= 0 && !p.isChainLightning && !stats.miniTorpedo && !stats.plasmaCloud && !stats.lightningBall && stats.pathFunction !== 'parabolic') {
                    const dissolving = typeof beginProjectileLifetimeDissolve === 'function' && beginProjectileLifetimeDissolve(p, {
                            char: p.sprite || '|',
                            color: p.color || '#ffffff',
                            scale: stats.sizeMult || 1,
                            velocityScale: 0.13
                        });
                    if (!dissolving) {
                        comboProjectiles.splice(i, 1);
                    }
                    continue;
                }

                updateSurvivorProjectileMotion(p, dt);

                let hit = false;
                const torpedoRange = stats.torpedoRange || 0;
                const torpedoExpired = stats.miniTorpedo && (p.orbitTime || 0) <= 0 && torpedoRange > 0
                    && ((p.x - p.startX) * (p.x - p.startX) + (p.y - p.startY) * (p.y - p.startY)) >= torpedoRange * torpedoRange;

                const hitboxRadius = typeof getComboProjectileHitboxRadius === 'function'
                    ? getComboProjectileHitboxRadius(p)
                    : 18;
                const targetMaskRadius = Math.max(4, hitboxRadius * (stats.plasmaCloud ? 0.95 : (stats.miniTorpedo ? 0.86 : 0.82)));
                for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
                    const e = enemies[enemyIndex];
                    if (!e || !e.isSurvivorEnemy || !isEnemyDamageable(e)) continue;
                    if (!doesProjectileHitTargetMask(p, e, targetMaskRadius)) continue;
                    hit = applySurvivorProjectileDirectHit(p, e, dt);
                    if (hit) break;
                }
                if (!hit && boss && boss.isSurvivorBoss && boss.phase === 'ACTIVE') {
                    if (doesProjectileHitTargetMask(p, boss, targetMaskRadius)) {
                        hit = applySurvivorProjectileDirectHit(p, boss, dt);
                        if (boss && boss.phase === 'DEFEAT') return;
                    }
                }

                if (!hit) handleSurvivorProjectileRicochet(p);

                const tooFarFromPlayer = Math.hypot(p.x - player.x, p.y - player.y) > 1320;
                const halfW = SURVIVOR_WORLD_W / 2 + SURVIVOR_PROJECTILE_WORLD_MARGIN;
                const halfH = SURVIVOR_WORLD_H / 2 + SURVIVOR_PROJECTILE_WORLD_MARGIN;
                const outOfWorld = p.x < -halfW || p.x > halfW || p.y < -halfH || p.y > halfH;
                const expired = hit || torpedoExpired || p.life <= 0 || tooFarFromPlayer || outOfWorld;
                if (expired) {
                    if (stats.miniTorpedo && (hit || torpedoExpired || p.life <= 0)) {
                        if (typeof spawnMiniTorpedoExplosion === 'function') spawnMiniTorpedoExplosion(p.x, p.y, p);
                    } else if (stats.pathFunction === 'parabolic' && !hit && (p.life <= 0 || tooFarFromPlayer || outOfWorld)) {
                        if (stats.splashRadius > 0 && typeof radialExplosion === 'function') {
                            radialExplosion(p.x, p.y, stats.splashRadius * 22, (p.damage || 1) * (stats.splashDamagePercent || 0.4), stats.splashVisualDebris ?? 6, { shakeAmount: 0, wakeStrength: 8 });
                        }
                    }
                    comboProjectiles.splice(i, 1);
                }
            }
        }

        function damageSurvivorTarget(projectile, target) {
            if (target && target.isSurvivorBoss && target.phase !== 'ACTIVE') return;
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
            startSurvivorBossDeathCinematic(bossObj);
        }

        function clearSurvivorBossHazardsOnDeath(defeatedBoss) {
            if (!defeatedBoss || defeatedBoss.survivorHazardsClearedOnDeath) return;
            defeatedBoss.survivorHazardsClearedOnDeath = true;

            const originalBulletCount = enemyBullets.length;
            const sparkEvery = Math.max(1, Math.ceil(originalBulletCount / 28));
            for (let i = 0; i < originalBulletCount; i++) {
                const b = enemyBullets[i];
                if (!b) continue;
                if (i < 36 || (i % sparkEvery === 0 && i / sparkEvery < 28)) {
                    debris.push({
                        x: b.x,
                        y: b.y,
                        vx: (Math.random() - 0.5) * 110,
                        vy: (Math.random() - 0.5) * 110,
                        char: ['*', '+', '.'][i % 3],
                        color: b.color || '#ffffff',
                        life: 0.18 + Math.random() * 0.2,
                        isImpact: true
                    });
                }
            }
            enemyBullets = [];
            comboProjectiles = [];
            bombProjectiles = [];

            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                const belongsToBoss = e && (
                    e.isBossMinion ||
                    e.bossMinionOwner === defeatedBoss ||
                    (defeatedBoss.name === 'GHOST SIGNAL' && e.isWraith)
                );
                if (!belongsToBoss) continue;
                e.suppressComboReward = true;
                if (typeof explodeEnemy === 'function') explodeEnemy(e);
                enemies.splice(i, 1);
            }

            if (originalBulletCount > 0) addShake(6);
        }

        function startSurvivorBossDeathCinematic(bossObj) {
            if (!bossObj || bossObj.survivorDeathStarted) return;
            bossObj.survivorDeathStarted = true;
            bossObj.hp = 0;
            bossObj.phase = 'DEFEAT';
            bossObj.attackTimer = 999;
            bossObj.isVulnerable = false;
            bossObj.isShielded = true;
            bossObj.survivorDeathTimer = 0;
            bossObj.survivorDeathBaseX = bossObj.x;
            bossObj.survivorDeathBaseY = bossObj.y;
            bossObj.flashTimer = 0.12;
            player.isFiring = false;
            player.isBeaming = false;
            player.beamDeploy = 0;

            clearSurvivorBossHazardsOnDeath(bossObj);
            const stopMusicFn = bossObj.survivorBossDef && bossObj.survivorBossDef.stopMusic;
            if (typeof stopMusicFn === 'function') stopMusicFn();
            else if (typeof stopBossMusic === 'function') {
                stopBossMusic(2.0);
                if (typeof resumeMainMusic === 'function') resumeMainMusic();
            }
            addShake(12);
        }

        function updateSurvivorBossDeathCinematic(dt) {
            if (!boss || !boss.isSurvivorBoss || boss.phase !== 'DEFEAT') return;
            const freezeTime = typeof BOSS_DEFEAT_FREEZE_TIME === 'number' ? BOSS_DEFEAT_FREEZE_TIME : 1.0;
            const blinkRate = typeof BOSS_DEFEAT_BLINK_RATE === 'number' ? BOSS_DEFEAT_BLINK_RATE : 0.085;
            const shakeXMax = typeof BOSS_DEFEAT_SHAKE_X === 'number' ? BOSS_DEFEAT_SHAKE_X : 11;
            const shakeYMax = typeof BOSS_DEFEAT_SHAKE_Y === 'number' ? BOSS_DEFEAT_SHAKE_Y : 8;
            boss.survivorDeathTimer = (boss.survivorDeathTimer || 0) + Math.max(0, dt || 0);
            const elapsed = boss.survivorDeathTimer;
            const shakeProgress = Math.min(1, elapsed / Math.max(0.001, freezeTime));
            const baseX = Number.isFinite(boss.survivorDeathBaseX) ? boss.survivorDeathBaseX : boss.x;
            const baseY = Number.isFinite(boss.survivorDeathBaseY) ? boss.survivorDeathBaseY : boss.y;
            const blinkWhite = Math.floor(elapsed / blinkRate) % 2 === 0;
            const shakeX = Math.sin(elapsed * 72) * shakeXMax * shakeProgress + (Math.random() - 0.5) * 2.5;
            const shakeY = Math.cos(elapsed * 93) * shakeYMax * shakeProgress + (Math.random() - 0.5) * 2;

            boss.x = baseX + shakeX;
            boss.y = baseY + shakeY;
            boss.flashTimer = blinkWhite ? blinkRate * 1.5 : 0;
            shake = Math.max(shake, 5 + 10 * shakeProgress);

            if (elapsed < freezeTime) return;

            boss.x = baseX;
            boss.y = baseY;
            boss.flashTimer = 0;
            if (typeof playExplosionSFX === 'function') playExplosionSFX();
            finalizeSurvivorBossDeath(boss);
        }

        function finalizeSurvivorBossDeath(defeatedBoss) {
            if (!defeatedBoss || defeatedBoss.survivorDeathFinalized) return;
            defeatedBoss.survivorDeathFinalized = true;
            if (typeof recordRunBossDefeated === 'function') recordRunBossDefeated();
            if (typeof explodeBoss === 'function') explodeBoss(defeatedBoss);
            dropSurvivorBossWeaponReward(defeatedBoss);
            survivorState.bossTimer = SURVIVOR_BOSS_INTERVAL;
            addShake(24);
            boss = null;
        }

        function dropSurvivorBossWeaponReward(defeatedBoss) {
            if (!defeatedBoss || typeof drawWeapons !== 'function') return;
            const opts = drawWeapons();
            if (!opts || !opts.length) return;
            drops.push({
                x: defeatedBoss.x,
                y: defeatedBoss.y,
                vx: 0,
                vy: 0,
                isWeapon: true,
                options: opts,
                cycleTimer: 0,
                currentIndex: 0,
                bobPhase: Math.random() * Math.PI * 2
            });
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
            if (boss && boss.isSurvivorBoss && boss.phase === 'ACTIVE') {
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
                if (!shouldExplode && boss && boss.isSurvivorBoss && boss.phase === 'ACTIVE' && doesCircleHitTargetMask(bomb.x, bomb.y, 18, boss)) shouldExplode = true;
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
                if (b.isDissolvingProjectile) {
                    if (typeof updateProjectileLifetimeDissolve === 'function' && updateProjectileLifetimeDissolve(b, hostileDt)) {
                        enemyBullets.splice(i, 1);
                    }
                    continue;
                }
                b.life = (b.life || 4) - hostileDt;
                if (b.life <= 0) {
                    const dissolving = typeof beginProjectileLifetimeDissolve === 'function' && beginProjectileLifetimeDissolve(b, {
                            char: b.char || 'o',
                            color: b.color || '#ff8fd8',
                            scale: b.isHuge ? 0.42 : 0.9,
                            velocityScale: 0.1
                        });
                    if (!dissolving) {
                        enemyBullets.splice(i, 1);
                    }
                    continue;
                }
                if (b.isGlitchBullet) {
                    b.morphTimer = (b.morphTimer || 0) + hostileDt;
                    if (b.morphTimer > 0.12) {
                        b.morphTimer = 0;
                        if (b.isMatrixRainColumn) {
                            const chars = typeof DISTORTED_GLITCH_MATRIX_CHARS === 'string'
                                ? DISTORTED_GLITCH_MATRIX_CHARS
                                : 'ﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                            const arr = String(b.char || '').split('');
                            for (let m = 0; m < 3; m++) {
                                const idx = Math.floor(Math.random() * Math.max(1, arr.length));
                                arr[idx] = chars[Math.floor(Math.random() * chars.length)];
                            }
                            b.char = arr.join('');
                        } else if (b.isCodeLine) {
                            b.char = buildSurvivorGlitchCodeLine(Math.max(4, String(b.char || '').length));
                        } else if (typeof GLITCH_CHARS !== 'undefined') {
                            b.char = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                        }
                    }
                }
                if (b.isZigZag) {
                    b.zigTimer = (b.zigTimer || 0) + hostileDt;
                    const zigInterval = b.zigInterval || 0.35;
                    if (b.zigTimer > zigInterval) {
                        b.zigTimer -= zigInterval;
                        b.zigDir = -(b.zigDir || 1);
                    }
                    const baseVx = Number.isFinite(b.baseVx) ? b.baseVx : b.vx;
                    const baseVy = Number.isFinite(b.baseVy) ? b.baseVy : b.vy;
                    const length = Math.max(1, Math.hypot(baseVx || 0, baseVy || 0));
                    const perpX = -baseVy / length;
                    const perpY = baseVx / length;
                    const amplitude = b.zigAmplitude || 200;
                    b.vx = baseVx + perpX * amplitude * (b.zigDir || 1);
                    b.vy = baseVy + perpY * amplitude * (b.zigDir || 1);
                }
                if (b.isSignalStormOrb) {
                    b.age = (b.age || 0) + hostileDt;
                    const currentSpeed = b.speed || Math.max(1, Math.hypot(b.vx || 0, b.vy || 0));
                    const nextSpeed = Math.min(b.maxSpeed || 270, currentSpeed + (b.accel || 88) * hostileDt);
                    const current = Math.atan2(b.vy || 0, b.vx || 1);
                    const desired = Math.atan2(player.y - b.y, player.x - b.x);
                    const angle = lerpAngle(current, desired, Math.min(1, (b.homingTurn || 1.0) * hostileDt));
                    b.speed = nextSpeed;
                    b.vx = Math.cos(angle) * nextSpeed;
                    b.vy = Math.sin(angle) * nextSpeed;
                }
                if (b.isSignalMachineRelay) {
                    b.age = (b.age || 0) + hostileDt;
                    b.x += (b.vx || 0) * hostileDt;
                    b.y = (b.relayBaseY ?? b.y) + Math.sin(b.age * 8.2 + (b.relayPhase || 0)) * (b.relayAmp || 10);
                    if (!b.relayFired && b.age >= (b.relayFireAt || 0.72)) {
                        releaseSurvivorGhostSignalMachineRelay(b);
                    }
                    const relayDx = b.x - player.x;
                    const relayDy = b.y - player.y;
                    if (b.age >= (b.relayLife || 1.45) || relayDx * relayDx + relayDy * relayDy > 1500000) {
                        const dissolving = typeof beginProjectileLifetimeDissolve === 'function' && beginProjectileLifetimeDissolve(b, {
                            char: b.char || '[ ]',
                            color: b.color || '#bffcff',
                            scale: 1.0,
                            velocityScale: 0.08
                        });
                        if (!dissolving) enemyBullets.splice(i, 1);
                    }
                    continue;
                }
                if (b.turnRate) {
                    const speed = b.speed || Math.max(1, Math.hypot(b.vx || 0, b.vy || 0));
                    const angle = Math.atan2(b.vy || 0, b.vx || 1) + b.turnRate * hostileDt;
                    b.vx = Math.cos(angle) * speed;
                    b.vy = Math.sin(angle) * speed;
                }
                if ((b.isLargeFlame || b.isLargeWraith || b.isFirewallBullet || b.isWraithBolt) && typeof emitElementalBulletTrail === 'function') {
                    emitElementalBulletTrail(b, hostileDt, !!(b.isLargeWraith || b.isWraithBolt));
                }
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
                const hitboxR = getSurvivorPlayerHitboxRadius() * (b.hitboxScale || 1);
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
                    syncSurvivorXpRequirement();
                    if (player.xp >= player.xpNeeded) {
                        player.xp -= player.xpNeeded;
                        player.level++;
                        syncSurvivorXpRequirement();
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
                if (d.isWeapon) {
                    updateSurvivorWeaponDrop(d, i, dt);
                    continue;
                }
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

        function updateSurvivorWeaponDrop(drop, index, dt) {
            const dx = player.x - drop.x;
            const dy = player.y - drop.y;
            const distSq = dx * dx + dy * dy;
            const magnetRangeSq = 52000 * (1 + (player.modifiers.magnet || 0));
            if (distSq < magnetRangeSq && distSq > 1) {
                const dist = Math.sqrt(distSq);
                drop.vx = (dx / dist) * 210;
                drop.vy = (dy / dist) * 210;
            } else {
                drop.vx = (drop.vx || 0) * Math.pow(0.91, dt * 60);
                drop.vy = ((drop.vy || 0) + Math.sin((survivorState.elapsed || 0) * 2.2 + (drop.bobPhase || 0)) * 6) * Math.pow(0.93, dt * 60);
            }

            drop.x += (drop.vx || 0) * dt;
            drop.y += (drop.vy || 0) * dt;
            drop.cycleTimer = (drop.cycleTimer || 0) + dt;
            if (drop.cycleTimer >= 0.75 && drop.options && drop.options.length) {
                drop.cycleTimer -= 0.75;
                drop.currentIndex = ((drop.currentIndex || 0) + 1) % drop.options.length;
            }

            if (distSq < 2600 && drop.options && drop.options.length) {
                const chosen = drop.options[drop.currentIndex || 0];
                const addedWeapon = addPlayerWeapon(chosen, 10);
                if (addedWeapon) {
                    weaponWeights[chosen.name] *= 0.5;
                    addShake(15);
                    for (let k = 0; k < 20; k++) {
                        const a = Math.random() * Math.PI * 2;
                        const spd = 50 + Math.random() * 150;
                        debris.push({
                            x: drop.x,
                            y: drop.y,
                            vx: Math.cos(a) * spd,
                            vy: Math.sin(a) * spd,
                            char: '+',
                            color: chosen.color,
                            life: 1.0
                        });
                    }
                }
                drops.splice(index, 1);
            } else if (Math.hypot(dx, dy) > 1800) {
                drops.splice(index, 1);
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
            const introBossActive = !!(boss && boss.isSurvivorBoss && boss.phase === 'INTRO');
            drawSurvivorWorldBackdrop(renderNow, introBossActive);
            drawSurvivorWorldBounds();
            drawSurvivorWorldParticles(renderNow);
            drawSurvivorDrops(renderNow);
            drawSurvivorProjectiles(renderNow);
            drawSurvivorRayBeam(renderNow);
            drawSurvivorEnemies(renderNow);
            if (!introBossActive) drawSurvivorBoss(renderNow);
            drawSurvivorPlayerAfterimages(renderNow);
            drawSurvivorPlayer(renderNow, center);
            drawSurvivorModeReadout(renderNow, dt);
        }

        function drawSurvivorWorldBackdrop(renderNow, introBossActive = false) {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = colorWithAlpha('#050712', 0.28);
            ctx.fillRect(0, 0, width, height);
            ctx.restore();

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let lastStarFont = '';
            const center = getSurvivorScreenCenter();
            const fieldH = Math.max(1, height - HUD_HEIGHT);
            const cameraScale = survivorState.cameraScale || SURVIVOR_CAMERA_SCALE;
            const starScreen = { x: 0, y: 0, scale: cameraScale };
            const introLayerWeights = introBossActive ? getSurvivorBossIntroLayerWeights(boss.introDepth || 0) : null;
            const drawIntroPass = (slot) => {
                const alpha = introLayerWeights ? introLayerWeights[slot] : 0;
                if (alpha > 0.025) drawSurvivorBossDepthIntro(renderNow, alpha);
            };
            const drawLayer = (layer) => {
                for (let i = 0; i < survivorState.stars.length; i++) {
                    const s = survivorState.stars[i];
                    if (s.layer !== layer) continue;
                    const p = writeSurvivorStarScreenPosition(s, center, fieldH, cameraScale, starScreen);
                    const farTwinkle = s.layer === 'far'
                        ? Math.sin(renderNow * (s.twinkleSpeed || 0.0011) + (s.twinklePhase || s.phase || 0)) * (s.twinkleAmount || 0.06)
                        : 0;
                    const twinkle = s.layer === 'far'
                        ? 0.82 + farTwinkle
                        : 0.76 + Math.sin(renderNow * 0.0018 + s.phase) * (s.twinkleAmount || 0.16);
                    const highlight = s.highlight || 0;
                    ctx.globalAlpha = Math.min(0.78, s.alpha * twinkle + highlight * 0.42);
                    ctx.fillStyle = highlight > 0.22 ? '#f5fbff' : s.color;
                    const fontSize = Math.max(6, Math.round((s.fontSize || 8) * (0.92 + (s.depth || 0.5) * 0.12)));
                    const styleText = s.fontStyle && s.fontStyle !== 'normal' ? `${s.fontStyle} ` : '';
                    const weightText = s.fontWeight && s.fontWeight !== 'normal' ? `${s.fontWeight} ` : '';
                    const starFont = `${styleText}${weightText}${fontSize}px ${s.fontFamily || 'Courier New'}`;
                    if (starFont !== lastStarFont) {
                        ctx.font = starFont;
                        lastStarFont = starFont;
                    }
                    if (glowEnabled && highlight > 0.20) {
                        ctx.shadowColor = ctx.fillStyle;
                        ctx.shadowBlur = 2 + highlight * 5;
                    } else {
                        ctx.shadowBlur = 0;
                    }
                    ctx.fillText(s.glyph, p.x, p.y);
                }
            };
            drawIntroPass(0);
            drawLayer('far');
            drawIntroPass(1);
            drawLayer('mid');
            drawIntroPass(2);
            drawLayer('near');
            drawIntroPass(3);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
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
                if (d.isWeapon) {
                    drawSurvivorWeaponDrop(d, p, renderNow);
                } else if (d.isHealth) {
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

        function drawSurvivorWeaponDrop(drop, p, renderNow) {
            const activeWp = drop.options && drop.options.length ? drop.options[drop.currentIndex || 0] : null;
            if (!activeWp) return;
            const boxSize = Math.max(32, Math.round(58 * p.scale));
            const iconSize = Math.max(26, Math.round(40 * p.scale));
            const bob = Math.sin(renderNow * 0.006 + (drop.bobPhase || 0)) * 3 * p.scale;
            const x = p.x;
            const y = p.y + bob;
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.shadowColor = activeWp.color;
            ctx.shadowBlur = glowEnabled ? 12 + 8 * Math.sin(renderNow * 0.01) : 0;
            ctx.strokeStyle = activeWp.color;
            ctx.lineWidth = Math.max(2, Math.round(3 * p.scale));
            ctx.strokeRect((x - boxSize / 2) | 0, (y - boxSize / 2) | 0, boxSize, boxSize);
            ctx.shadowBlur = 0;
            drawPowerupIcon(activeWp, x | 0, y | 0, iconSize, true);
            ctx.font = `bold ${Math.max(9, Math.round(12 * p.scale))}px "Electrolize", sans-serif`;
            ctx.fillStyle = activeWp.color;
            ctx.fillText(activeWp.name.toUpperCase(), x | 0, (y + boxSize * 0.74) | 0);
            ctx.restore();
        }

        function drawSurvivorRayBeam(renderNow) {
            if (!player.isBeaming || playerExploded || gameState !== 'PLAYING') return;
            const s = player.weaponStats || createBaseWeaponStats();
            if (s.mode !== 'beam') return;
            const deployFactor = typeof getBeamDeployVisual === 'function' ? getBeamDeployVisual(player.beamDeploy || 0) : 1;
            if (deployFactor <= 0.035) return;
            const origin = getSurvivorWeaponOrigin(false);
            const screenOrigin = survivorWorldToScreen(origin.x, origin.y);
            const angle = typeof player.beamAngle === 'number' ? player.beamAngle : getSurvivorPlayerAimAngle();
            const cameraScale = survivorState.cameraScale || SURVIVOR_CAMERA_SCALE;
            const baseRange = typeof BEAM_RANGE === 'number' ? BEAM_RANGE : 620;
            const beamLength = baseRange * SURVIVOR_BEAM_RANGE_MULT * deployFactor * cameraScale;
            const beamFont = Math.max(8, (typeof BEAM_BASE_FONT_SIZE === 'number' ? BEAM_BASE_FONT_SIZE : 20) * (s.sizeMult || 1) * Math.max(0.62, cameraScale));
            const beamMetrics = {
                length: beamLength,
                fontSize: beamFont,
                font: `bold ${beamFont}px Courier New`,
                halfWidth: Math.max(5, beamFont * 0.38),
                segmentSpacing: typeof BEAM_SEGMENT_STEP === 'number' ? Math.max(8, BEAM_SEGMENT_STEP * Math.max(0.65, cameraScale)) : 16
            };
            const beams = getSurvivorBeamAngles(s, angle);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = '#fff7c2';
            for (const beam of beams) {
                const visualScale = beam.visualScale || 1;
                const metrics = visualScale === 1 ? beamMetrics : {
                    ...beamMetrics,
                    fontSize: beamMetrics.fontSize * visualScale,
                    font: `bold ${Math.max(8, beamMetrics.fontSize * visualScale)}px Courier New`,
                    halfWidth: beamMetrics.halfWidth * visualScale
                };
                ctx.globalAlpha = beam.echo ? SURVIVOR_BEAM_ECHO_ALPHA : 1;
                if (typeof drawBeamStrand === 'function') {
                    drawBeamStrand(screenOrigin.x, screenOrigin.y, beam.angle, (s.sizeMult || 1) * Math.max(0.62, cameraScale) * visualScale, renderNow, deployFactor, metrics, beams.length);
                } else {
                    ctx.save();
                    ctx.translate(screenOrigin.x, screenOrigin.y);
                    ctx.rotate(beam.angle);
                    ctx.strokeStyle = beam.echo ? '#fff2aa' : '#fff7c2';
                    ctx.lineWidth = Math.max(2, metrics.halfWidth * 0.55);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(metrics.length, 0);
                    ctx.stroke();
                    ctx.restore();
                }
                const dx = Math.cos(beam.angle);
                const dy = Math.sin(beam.angle);
                const sideX = -dy;
                const sideY = dx;
                const step = Math.max(10, metrics.segmentSpacing * 0.82);
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `bold ${Math.max(9, metrics.fontSize * 0.86)}px Courier New`;
                ctx.shadowColor = beam.echo ? '#ffe88f' : '#fff2aa';
                ctx.shadowBlur = glowEnabled ? (beam.echo ? 8 : 14) : 0;
                for (let d = 12; d < metrics.length; d += step) {
                    const progress = d / Math.max(1, metrics.length);
                    const pulse = Math.sin(renderNow * 0.018 + d * 0.13 + beam.angle * 3.1);
                    const jitter = pulse * metrics.halfWidth * (0.34 + (1 - progress) * 0.28);
                    ctx.globalAlpha = (beam.echo ? 0.26 : 0.58) * (1 - progress * 0.55);
                    ctx.fillStyle = progress < 0.12 ? '#ffffff' : (beam.echo ? '#ffe88f' : '#fff2aa');
                    ctx.fillText(progress < 0.18 ? '#' : (progress < 0.78 ? '=' : '.'), screenOrigin.x + dx * d + sideX * jitter, screenOrigin.y + dy * d + sideY * jitter);
                }
                ctx.restore();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawSurvivorSpecialProjectile(pObj, screenPoint, renderNow, scale) {
            const oldX = pObj.x;
            const oldY = pObj.y;
            const oldStartX = pObj.startX;
            const oldStartY = pObj.startY;
            const oldTargetX = pObj.targetX;
            const oldTargetY = pObj.targetY;
            pObj.x = screenPoint.x;
            pObj.y = screenPoint.y;
            if (pObj.isChainLightning) {
                const start = survivorWorldToScreen(oldStartX ?? oldX, oldStartY ?? oldY);
                const target = survivorWorldToScreen(oldTargetX ?? oldX, oldTargetY ?? oldY);
                pObj.startX = start.x;
                pObj.startY = start.y;
                pObj.targetX = target.x;
                pObj.targetY = target.y;
                if (typeof drawChainLightningProjectile === 'function') drawChainLightningProjectile(pObj, renderNow);
            } else if ((pObj.isPlasmaCloud || (pObj.stats && pObj.stats.plasmaCloud)) && typeof drawPlasmaCloudProjectile === 'function') {
                drawPlasmaCloudProjectile(pObj, renderNow, scale);
            } else if ((pObj.isMiniTorpedo || (pObj.stats && pObj.stats.miniTorpedo)) && typeof drawMiniTorpedoProjectile === 'function') {
                drawMiniTorpedoProjectile(pObj, renderNow, scale);
            } else if ((pObj.isLightningBall || (pObj.stats && pObj.stats.lightningBall)) && typeof drawLightningBallProjectile === 'function') {
                drawLightningBallProjectile(pObj, renderNow, scale);
            }
            pObj.x = oldX;
            pObj.y = oldY;
            pObj.startX = oldStartX;
            pObj.startY = oldStartY;
            pObj.targetX = oldTargetX;
            pObj.targetY = oldTargetY;
        }

        function drawSurvivorProjectiles(renderNow) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const b of enemyBullets) {
                const p = survivorWorldToScreen(b.x, b.y);
                if (!isSurvivorScreenVisible(p.x, p.y, 60)) continue;
                if (b.isDissolvingProjectile && typeof drawProjectileDissolveGlyph === 'function') {
                    drawProjectileDissolveGlyph(b, renderNow, {
                        x: p.x,
                        y: p.y,
                        fontSize: Math.max(8, Math.round((b.isHuge ? 42 : 20) * p.scale)),
                        char: b.dissolveChar || b.char || 'o',
                        color: b.dissolveColor || b.color || '#ff8fd8',
                        alphaScale: 0.9,
                        glow: 8
                    });
                    continue;
                }
                if (typeof drawBossProjectileVisual === 'function' && (
                    b.isGlitchBullet || b.isSignalPulse || b.isSignalYBullet || b.isFirewallBullet ||
                    b.isLargeFlame || b.isWraithBolt || b.isLargeWraith || b.isPhantomBullet
                )) {
                    const oldX = b.x;
                    const oldY = b.y;
                    const oldGap = b.matrixGlyphGap;
                    b.x = p.x;
                    b.y = p.y;
                    if (b.isMatrixRainColumn && b.matrixGlyphGap) b.matrixGlyphGap = Math.max(10, b.matrixGlyphGap * Math.max(0.72, p.scale));
                    const drewSpecialBullet = drawBossProjectileVisual(b, renderNow);
                    b.x = oldX;
                    b.y = oldY;
                    b.matrixGlyphGap = oldGap;
                    if (drewSpecialBullet) continue;
                }
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
                let projectileScale = (stats.sizeMult || 1) * p.scale;
                if (pObj.isDissolvingProjectile && typeof drawProjectileDissolveGlyph === 'function') {
                    drawProjectileDissolveGlyph(pObj, renderNow, {
                        x: p.x,
                        y: p.y,
                        fontSize: Math.max(8, Math.round(16 * p.scale)),
                        char: pObj.dissolveChar || pObj.sprite || '|',
                        color: pObj.dissolveColor || pObj.color || '#ffffff',
                        angle: Math.atan2(pObj.baseVy || pObj.vy || 0, pObj.baseVx || pObj.vx || 1) + Math.PI / 2,
                        alphaScale: 0.95,
                        glow: 8
                    });
                    continue;
                }
                if (stats.pathFunction === 'parabolic') {
                    const arc = Math.sin(Math.max(0, Math.min(1, (pObj.life || 0) / Math.max(0.001, pObj.maxLife || 1))) * Math.PI);
                    projectileScale *= 1 + arc * 1.35;
                }
                if (pObj.isChainLightning || stats.plasmaCloud || stats.miniTorpedo || stats.lightningBall) {
                    drawSurvivorSpecialProjectile(pObj, p, renderNow, projectileScale);
                    continue;
                }
                const size = Math.max(8, Math.round(16 * projectileScale));
                ctx.fillStyle = pObj.color || '#ffffff';
                ctx.globalAlpha = Math.max(0.18, Math.min(1, (pObj.life || 1) / Math.max(0.001, pObj.maxLife || 1)));
                ctx.font = `bold ${size}px Courier New`;
                if (glowEnabled && (stats.plasmaCloud || stats.lightningBall || pObj.isCrit)) {
                    ctx.shadowColor = pObj.color || '#ffffff';
                    ctx.shadowBlur = stats.plasmaCloud ? 14 : 8;
                }
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(Math.atan2(pObj.baseVy || pObj.vy || 0, pObj.baseVx || pObj.vx || 1) + Math.PI / 2);
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
                    const flashColor = e.flashTimer > 0 ? '#ffffff' : null;
                    if (typeof drawCachedEnemyShipSprite !== 'function' || !drawCachedEnemyShipSprite(e, flashColor, { staticFrame: enemies.length > 105 })) {
                        drawEnemyShipSprite(e, flashColor);
                    }
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

        function getSurvivorBossIntroRenderScale(source, pose) {
            if (!source || !pose) return 1;
            let scale = pose.scale * (source.renderScale || 1);
            if (source.name === 'NULL PHANTOM') {
                scale = pose.scale * (source.nullPhantomScale || 1);
            } else if (source.survivorBossType === 'overheatingFirewall') {
                const firewallBaseScale = typeof FIREWALL_BOSS_RENDER_SCALE === 'number' ? FIREWALL_BOSS_RENDER_SCALE : 0.6;
                scale = pose.scale * (source.renderScale || 1) * firewallBaseScale;
            }
            return Math.max(0.035, scale);
        }

        const SURVIVOR_BOSS_INTRO_SPRITE_CACHE = new Map();
        const SURVIVOR_BOSS_INTRO_SPRITE_CACHE_MAX = 24;

        function trimSurvivorBossIntroSpriteCache() {
            while (SURVIVOR_BOSS_INTRO_SPRITE_CACHE.size > SURVIVOR_BOSS_INTRO_SPRITE_CACHE_MAX) {
                const oldestKey = SURVIVOR_BOSS_INTRO_SPRITE_CACHE.keys().next().value;
                SURVIVOR_BOSS_INTRO_SPRITE_CACHE.delete(oldestKey);
            }
        }

        function getSurvivorBossIntroSpriteFrame(source, color) {
            if (!source || !Array.isArray(source.sprite)) return null;
            const sprite = source.sprite;
            const widthChars = Math.max(...sprite.map(row => (row || '').length), 1);
            const heightChars = Math.max(sprite.length, 1);
            const key = [
                source.survivorBossType || source.name || 'boss',
                widthChars,
                heightChars,
                color,
                source.sprite === NULL_PHANTOM_SOURCE ? 'null' : '',
                source.sprite === GHOST_SIGNAL_SOURCE ? 'ghost' : '',
                source.sprite === FIREWALL_SPRITE ? 'firewall' : ''
            ].join('|');
            let entry = SURVIVOR_BOSS_INTRO_SPRITE_CACHE.get(key);
            if (entry) {
                SURVIVOR_BOSS_INTRO_SPRITE_CACHE.delete(key);
                SURVIVOR_BOSS_INTRO_SPRITE_CACHE.set(key, entry);
                return entry;
            }

            const pad = 34;
            const spriteW = Math.max(1, widthChars * charW);
            const spriteH = Math.max(1, heightChars * charH);
            const canvas = document.createElement('canvas');
            canvas.width = Math.ceil(spriteW + pad * 2);
            canvas.height = Math.ceil(spriteH + pad * 2);
            const cacheCtx = canvas.getContext('2d', { alpha: true });
            if (!cacheCtx) return null;
            cacheCtx.clearRect(0, 0, canvas.width, canvas.height);
            cacheCtx.textAlign = 'left';
            cacheCtx.textBaseline = 'top';
            cacheCtx.font = `bold 20px Courier New`;
            cacheCtx.fillStyle = color;
            if (glowEnabled) {
                cacheCtx.shadowColor = color;
                cacheCtx.shadowBlur = 6;
            }
            for (let r = 0; r < sprite.length; r++) {
                const row = sprite[r] || '';
                for (let c = 0; c < row.length; c++) {
                    const ch = row[c];
                    if (ch === ' ') continue;
                    cacheCtx.fillText(ch, pad + c * charW, pad + r * charH);
                }
            }
            entry = { canvas, spriteW, spriteH, pad };
            SURVIVOR_BOSS_INTRO_SPRITE_CACHE.set(key, entry);
            trimSurvivorBossIntroSpriteCache();
            return entry;
        }

        function drawSurvivorBossIntroWarp(p, renderNow) {
            drawSurvivorBossDepthIntro(renderNow);
        }

        function drawSurvivorBossLiveDepthIntro(source, pose, renderNow, alpha) {
            if (!source || !pose) return false;
            const canUseLiveRenderer =
                (source.name === 'NULL PHANTOM' && typeof getNullPhantomRenderLayout === 'function') ||
                source.survivorBossType === 'distortedGlitch' ||
                (source.survivorBossType === 'ghostSignal' && typeof getGhostSignalRenderLayout === 'function') ||
                (source.survivorBossType === 'overheatingFirewall' && typeof FIREWALL_VISIBLE_CELLS !== 'undefined');
            if (!canUseLiveRenderer) return false;

            const oldDepthIntroRendering = source.survivorDepthIntroRendering;
            const oldDepthIntroAlpha = source.survivorDepthIntroAlpha;
            source.survivorDepthIntroRendering = true;
            source.survivorDepthIntroAlpha = alpha;
            if (source.name === 'NULL PHANTOM') {
                drawSurvivorNullPhantomBoss(pose);
            } else if (source.survivorBossType === 'distortedGlitch') {
                drawSurvivorDistortedGlitchBoss(pose, renderNow);
            } else if (source.survivorBossType === 'ghostSignal') {
                drawSurvivorGhostSignalBoss(pose, renderNow);
            } else if (source.survivorBossType === 'overheatingFirewall') {
                drawSurvivorFirewallBoss(pose, renderNow);
            }
            source.survivorDepthIntroRendering = oldDepthIntroRendering;
            source.survivorDepthIntroAlpha = oldDepthIntroAlpha;
            return true;
        }

        function drawSurvivorBossDepthIntro(renderNow, alphaMultiplier = 1) {
            if (!boss || boss.phase !== 'INTRO') return;
            if (alphaMultiplier <= 0.001) return;
            const pose = getSurvivorBossIntroScreenPose(boss);
            if (!pose) return;

            const scale = getSurvivorBossIntroRenderScale(boss, pose);
            const spriteWidth = Math.max(1, (boss.sprite && boss.sprite[0] ? boss.sprite[0].length : 1) * charW * scale);
            const spriteHeight = Math.max(1, (boss.sprite ? boss.sprite.length : 1) * charH * scale);
            const alpha = Math.min(1, pose.alpha * (0.22 + pose.depth * 0.84) * alphaMultiplier);
            const close = pose.closeGlow || 0;
            const layerPulse = Math.sin(pose.progress * Math.PI);

            ctx.save();
            if (close > 0.02) {
                ctx.globalCompositeOperation = 'screen';
                const auraRadius = Math.max(spriteWidth, spriteHeight) * (0.46 + close * 0.24);
                const aura = ctx.createRadialGradient(pose.x, pose.y, 0, pose.x, pose.y, auraRadius);
                aura.addColorStop(0, colorWithAlpha('#dfe7f4', 0.045 * close * alpha));
                aura.addColorStop(0.44, colorWithAlpha('#8d9ab0', 0.024 * close * alpha));
                aura.addColorStop(1, colorWithAlpha('#ffffff', 0));
                ctx.fillStyle = aura;
                ctx.globalAlpha = 1;
                ctx.fillRect(pose.x - auraRadius, pose.y - auraRadius, auraRadius * 2, auraRadius * 2);
                ctx.globalCompositeOperation = 'source-over';
            }

            if (pose.depth > 0.16 && pose.depth < 0.94) {
                ctx.globalCompositeOperation = 'screen';
                ctx.lineCap = 'round';
                ctx.strokeStyle = colorWithAlpha('#dfe7f4', 0.22);
                ctx.lineWidth = Math.max(0.7, 1.5 * pose.depth);
                const streakAlpha = Math.min(0.2, layerPulse * (0.035 + pose.depth * 0.14));
                const streakCount = 8;
                for (let i = 0; i < streakCount; i++) {
                    const angle = (i / streakCount) * Math.PI * 2 + Math.sin((renderNow || 0) * 0.0007 + i) * 0.05;
                    const inner = Math.max(spriteWidth, spriteHeight) * (0.48 + pose.depth * 0.22);
                    const outer = inner + 18 + pose.depth * 58;
                    ctx.globalAlpha = streakAlpha * (0.35 + (i % 3) * 0.18);
                    ctx.beginPath();
                    ctx.moveTo(pose.x + Math.cos(angle) * inner, pose.y + Math.sin(angle) * inner);
                    ctx.lineTo(pose.x + Math.cos(angle) * outer, pose.y + Math.sin(angle) * outer);
                    ctx.stroke();
                }
                ctx.globalCompositeOperation = 'source-over';
            }

            if (drawSurvivorBossLiveDepthIntro(boss, pose, renderNow, alpha)) {
                ctx.restore();
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
                ctx.globalCompositeOperation = 'source-over';
                return;
            }

            const spriteFrame = getSurvivorBossIntroSpriteFrame(boss, pose.depth > 0.78 ? '#cfd7e4' : (pose.depth > 0.42 ? '#b7bfcb' : '#8f98a8'));
            if (!spriteFrame) {
                ctx.restore();
                return;
            }

            const drawW = spriteFrame.canvas.width * scale;
            const drawH = spriteFrame.canvas.height * scale;

            ctx.globalAlpha = alpha;
            if (glowEnabled) {
                ctx.shadowColor = '#cbd5e2';
                ctx.shadowBlur = 1 + close * 5;
            }
            ctx.drawImage(spriteFrame.canvas, pose.x - drawW / 2, pose.y - drawH / 2, drawW, drawH);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawSurvivorBoss(renderNow) {
            if (!boss || !boss.isSurvivorBoss) return;
            const p = survivorWorldToScreen(boss.x, boss.y);
            if (!isSurvivorScreenVisible(p.x, p.y, 220)) return;
            if (boss.phase === 'INTRO') {
                return;
            }
            if (boss.name === 'NULL PHANTOM' && typeof getNullPhantomRenderLayout === 'function') {
                drawSurvivorNullPhantomBoss(p);
                drawSurvivorBossBar();
                return;
            }
            if (boss.survivorBossType === 'distortedGlitch') {
                drawSurvivorDistortedGlitchBoss(p, renderNow);
                drawSurvivorBossBar();
                return;
            }
            if (boss.survivorBossType === 'ghostSignal' && typeof getGhostSignalRenderLayout === 'function') {
                drawSurvivorGhostSignalBoss(p, renderNow);
                drawSurvivorBossBar();
                return;
            }
            if (boss.survivorBossType === 'overheatingFirewall' && typeof FIREWALL_VISIBLE_CELLS !== 'undefined') {
                drawSurvivorFirewallBoss(p, renderNow);
                drawSurvivorBossBar();
                return;
            }
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

        function drawSurvivorNullPhantomBoss(p) {
            const depthIntro = !!boss.survivorDepthIntroRendering;
            const oldX = boss.x;
            const oldY = boss.y;
            boss.x = p.x;
            boss.y = p.y;
            const layout = getNullPhantomRenderLayout(boss, Math.max(0.001, p.scale * (boss.nullPhantomScale || 1)));
            boss.x = oldX;
            boss.y = oldY;

            const bodyFlash = boss.flashTimer > 0;
            const introActive = boss.phase === 'INTRO';
            const introAlpha = getSurvivorBossIntroAlpha(boss);
            const glowBlur = glowEnabled ? (depthIntro ? 2.5 : 7 + layout.laughAmount * 6) : 0;
            ctx.save();
            ctx.font = `bold ${Math.max(4, Math.round(layout.fontSize || NULL_PHANTOM_FONT_SIZE))}px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = (bodyFlash ? 1 : NULL_PHANTOM_BODY_ALPHA) * introAlpha;
            ctx.shadowColor = bodyFlash ? '#ffffff' : (introActive ? (depthIntro ? '#aeb8c8' : '#ffffff') : NULL_PHANTOM_GLOW_COLOR);
            ctx.shadowBlur = glowBlur;

            for (let r = 0; r < boss.sprite.length; r++) {
                const row = boss.sprite[r] || '';
                for (let c = 0; c < row.length; c++) {
                    const char = row[c];
                    if (char === ' ') continue;
                    const glyphPos = getNullPhantomGlyphPosition(layout, r, c);
                    ctx.fillStyle = bodyFlash ? '#ffffff' : (introActive ? '#c8d0dc' : getNullPhantomBodyColor(char, 1, false));
                    ctx.fillText(char, glyphPos.x | 0, glyphPos.y | 0);
                }
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawSurvivorDistortedGlitchBoss(p, renderNow) {
            const depthIntro = !!boss.survivorDepthIntroRendering;
            const rawScale = p.scale * (boss.renderScale || 1);
            const scale = depthIntro ? Math.max(0.035, rawScale) : Math.max(0.55, rawScale);
            const sprite = boss.sprite || GLITCH_SPRITE_1;
            const frame = typeof frameCount === 'number' ? frameCount : Math.floor((renderNow || 0) / 16);
            const chargeMult = boss.isCharging ? 2.5 : 1;
            const bodyFlash = boss.flashTimer > 0 || boss.transitionFlash > 0;
            const isDeath = !!boss.isDeadGlitching;
            const introActive = boss.phase === 'INTRO';
            const introAlpha = getSurvivorBossIntroAlpha(boss);

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(scale, scale);
            ctx.font = 'bold 20px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = introAlpha;
            ctx.fillStyle = bodyFlash ? '#ffffff' : (introActive ? '#c7cfdd' : boss.color);
            if (glowEnabled) {
                ctx.shadowColor = bodyFlash ? '#ffffff' : (introActive ? (depthIntro ? '#aeb8c8' : '#ffffff') : boss.color);
                ctx.shadowBlur = depthIntro ? 3 : 13 + Math.sin((renderNow || 0) * 0.003) * 6;
            }

            if (!introActive && boss.isCharging && boss.glowIntensity > 0) {
                ctx.save();
                ctx.globalAlpha = boss.glowIntensity * 0.75;
                ctx.fillStyle = boss.color;
                ctx.font = `bold ${Math.round(58 + boss.glowIntensity * 58)}px Courier New`;
                ctx.shadowColor = boss.color;
                ctx.shadowBlur = glowEnabled ? 18 + boss.glowIntensity * 16 : 0;
                ctx.fillText('O', 0, 0);
                ctx.restore();
            }

            const bSX = -(sprite[0].length * charW) / 2;
            const bSY = -(sprite.length * charH) / 2;
            const rowShifts = [];
            for (let r = 0; r < sprite.length; r++) {
                rowShifts[r] = (!isDeath && Math.random() > 0.86) ? (Math.random() - 0.5) * 38 : 0;
            }

            const charCoords = [];
            for (let r = 0; r < sprite.length; r++) {
                const row = sprite[r] || '';
                for (let c = 0; c < row.length; c++) {
                    if (row[c] !== ' ') charCoords.push({ r, c, char: row[c] });
                }
            }

            const doOffset = frame % 2 === 0;
            const doDrop = frame % 5 === 0;
            let dropCount = doDrop ? Math.floor((2 + Math.random() * 2) * chargeMult) : 0;
            while (!isDeath && dropCount-- > 0 && charCoords.length > 3) {
                charCoords.splice(Math.floor(Math.random() * charCoords.length), 1);
            }

            const offsetIndices = new Set();
            if (!isDeath && doOffset) {
                const offsetCount = Math.floor((3 + Math.random() * 3) * chargeMult);
                for (let i = 0; i < offsetCount && charCoords.length; i++) {
                    offsetIndices.add(Math.floor(Math.random() * charCoords.length));
                }
            }

            for (let idx = 0; idx < charCoords.length; idx++) {
                const item = charCoords[idx];
                let cx = bSX + item.c * charW + rowShifts[item.r];
                let cy = bSY + item.r * charH;
                let glyph = item.char;
                if (isDeath) {
                    cx += (Math.random() - 0.5) * 80;
                    cy += (Math.random() - 0.5) * 80;
                } else if (offsetIndices.has(idx)) {
                    cx += (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3) * chargeMult;
                    cy += (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3) * chargeMult;
                    if (Math.random() > 0.48) glyph = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                }
                ctx.fillText(glyph, cx | 0, cy | 0);
            }
            ctx.restore();

            if (boss.transitionTextTimer > 0) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 24px Courier New';
                ctx.fillStyle = '#00ff41';
                ctx.globalAlpha = Math.min(1, boss.transitionTextTimer / 0.8);
                ctx.shadowColor = '#00ff41';
                ctx.shadowBlur = glowEnabled ? 16 : 0;
                ctx.fillText('SYSTEM CORRUPTION DETECTED', width / 2, height * 0.34);
                ctx.restore();
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawSurvivorGhostSignalBoss(p, renderNow) {
            const depthIntro = !!boss.survivorDepthIntroRendering;
            const rawScale = p.scale * (boss.renderScale || 1);
            const scale = depthIntro ? Math.max(0.035, rawScale) : Math.max(0.54, rawScale);
            const screenBoss = { ...boss, x: p.x, y: p.y };
            const layout = getGhostSignalRenderLayout(screenBoss);
            const bodyFlash = boss.flashTimer > 0;
            const introActive = boss.phase === 'INTRO';
            const introAlpha = getSurvivorBossIntroAlpha(boss);
            const signalStageTwo = (boss.stage || 1) >= 2;
            const bodyPulse = bodyFlash
                ? 1
                : (signalStageTwo ? 0.84 : 0.75) + Math.sin(2 * layout.tAngle - 0.22) * (signalStageTwo ? 0.16 : 0.25);

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(scale, scale);
            ctx.translate(-p.x, -p.y);
            if (glowEnabled) {
                const haloRadius = Math.max(layout.visibleW, layout.visibleH) * (signalStageTwo ? 0.72 : 0.64);
                const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloRadius);
                const haloAlpha = depthIntro
                    ? (bodyFlash ? 0.08 : 0.026 + bodyPulse * 0.012)
                    : (bodyFlash ? 0.18 : (signalStageTwo ? 0.115 : 0.085) + bodyPulse * 0.035);
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                halo.addColorStop(0, colorWithAlpha('#f4fbff', haloAlpha * introAlpha));
                halo.addColorStop(0.42, colorWithAlpha(introActive ? '#d9e0eb' : '#9cfbff', haloAlpha * 0.42 * introAlpha));
                halo.addColorStop(1, colorWithAlpha('#ffffff', 0));
                ctx.fillStyle = halo;
                ctx.fillRect((p.x - haloRadius) | 0, (p.y - haloRadius) | 0, (haloRadius * 2) | 0, (haloRadius * 2) | 0);
                ctx.restore();
            }

            ctx.font = `bold ${GHOST_SIGNAL_FONT_SIZE}px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = (bodyFlash ? 1 : bodyPulse) * introAlpha;
            ctx.shadowColor = bodyFlash ? '#ffffff' : (introActive ? (depthIntro ? '#aeb8c8' : '#ffffff') : GHOST_SIGNAL_GLOW_COLOR);
            ctx.shadowBlur = 0;
            const signalCells = typeof GHOST_SIGNAL_VISIBLE_CELLS !== 'undefined' ? GHOST_SIGNAL_VISIBLE_CELLS : [];
            let lastSignalRow = -1;
            let rowShimmer = 1;
            let lastSignalColor = null;
            for (const cell of signalCells) {
                const r = cell.row;
                const c = cell.col;
                const char = cell.char;
                const glyphPos = getGhostSignalGlyphPosition(layout, r, c);
                if (r !== lastSignalRow) {
                    rowShimmer = bodyFlash ? 1 : 0.87 + Math.max(0, Math.sin(4 * layout.tAngle - r * 0.28)) * 0.13;
                    lastSignalRow = r;
                }
                const bodyColor = bodyFlash ? '#ffffff' : (introActive ? '#c9d2de' : getGhostSignalBodyColor(char, rowShimmer));
                if (bodyColor !== lastSignalColor) {
                    ctx.fillStyle = bodyColor;
                    lastSignalColor = bodyColor;
                }
                ctx.fillText(char, glyphPos.x | 0, glyphPos.y | 0);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawSurvivorFirewallBoss(p, renderNow) {
            const fireLines = boss.sprite || FIREWALL_SPRITE;
            const firewallBaseScale = typeof FIREWALL_BOSS_RENDER_SCALE === 'number' ? FIREWALL_BOSS_RENDER_SCALE : 0.6;
            const depthIntro = !!boss.survivorDepthIntroRendering;
            const rawScale = p.scale * (boss.renderScale || 1) * firewallBaseScale;
            const scale = depthIntro ? Math.max(0.035, rawScale) : Math.max(0.42, rawScale);
            const firewallStageTwo = (boss.stage || 1) >= 2;
            const firewallCells = typeof FIREWALL_VISIBLE_CELLS !== 'undefined' ? FIREWALL_VISIBLE_CELLS : [];
            const bSX = -(fireLines[0].length * charW) / 2;
            const bSY = -(fireLines.length * charH) / 2;
            const loopFrames = 300;
            const animFrame = typeof boss.animFrame === 'number' ? boss.animFrame : Math.floor((renderNow || 0) / 16);
            const tAngle = ((animFrame % loopFrames) / loopFrames) * Math.PI * 2;
            const introActive = boss.phase === 'INTRO';
            const introAlpha = getSurvivorBossIntroAlpha(boss);

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(scale, scale);
            ctx.globalAlpha = introAlpha;
            ctx.font = 'bold 20px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (glowEnabled) {
                const localW = fireLines[0].length * charW;
                const localH = fireLines.length * charH;
                const haloY = bSY + localH * 0.52;
                const haloRadius = Math.max(localW, localH) * (firewallStageTwo ? 0.62 : 0.56);
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                const coreHalo = ctx.createRadialGradient(0, haloY, 0, 0, haloY, haloRadius);
                coreHalo.addColorStop(0, colorWithAlpha(introActive ? '#ffffff' : (firewallStageTwo ? '#fff2a8' : '#ff8a18'), (firewallStageTwo ? 0.18 : 0.14) * introAlpha));
                coreHalo.addColorStop(0.44, colorWithAlpha(introActive ? '#bac5d4' : '#ff4400', (firewallStageTwo ? 0.095 : 0.075) * introAlpha));
                coreHalo.addColorStop(1, colorWithAlpha('#e01926', 0));
                ctx.fillStyle = coreHalo;
                ctx.fillRect((-haloRadius) | 0, (haloY - haloRadius) | 0, (haloRadius * 2) | 0, (haloRadius * 2) | 0);
                ctx.restore();
            }

            const bandCount = 12;
            const noiseCache = new Map();
            let lastRow = -1;
            let hRatio = 0;
            let lastFill = null;
            for (const cell of firewallCells) {
                const r = cell.row;
                const c = cell.col;
                const char = cell.char;
                if (r !== lastRow) {
                    hRatio = r / fireLines.length;
                    lastRow = r;
                }
                const rowLength = fireLines[r] ? fireLines[r].length : fireLines[0].length;
                const colRatio = c / Math.max(1, rowLength - 1);
                const band = Math.max(0, Math.min(bandCount, Math.round(colRatio * bandCount)));
                const cacheKey = `${r}|${band}`;
                let noise = noiseCache.get(cacheKey);
                if (noise === undefined) {
                    const sampleC = (band / bandCount) * Math.max(1, rowLength - 1);
                    noise = Math.sin(2 * tAngle - r * 0.5 + sampleC * 0.3) * 0.6 +
                        Math.cos(3 * tAngle - r * 0.3 + sampleC * 0.2) * 0.6;
                    noiseCache.set(cacheKey, noise);
                }

                const flickerHeat = hRatio + noise * (firewallStageTwo ? 0.2 : 0.15) + (firewallStageTwo ? 0.08 : 0);
                let fillColor;
                if (boss.flashTimer > 0) {
                    fillColor = '#ffffff';
                } else if (introActive) {
                    fillColor = flickerHeat > 0.68 ? '#ffffff' : (flickerHeat > 0.42 ? '#c9d0dc' : '#8e99aa');
                } else {
                    if (firewallStageTwo && flickerHeat > 0.88) fillColor = '#fff2a8';
                    else if (flickerHeat > 0.75) fillColor = '#ffaa00';
                    else if (flickerHeat > 0.45) fillColor = '#ff4400';
                    else fillColor = firewallStageTwo ? '#e01926' : '#cc0000';
                }
                if (fillColor !== lastFill) {
                    ctx.fillStyle = fillColor;
                    lastFill = fillColor;
                }
                const baseHeat = FIREWALL_CHAR_MAP[char] || 0;
                const heat = Math.max(1, Math.min(4, Math.round(baseHeat + noise)));
                const animChar = FIREWALL_FIRE_CHARS[heat];
                ctx.fillText(animChar, (bSX + c * charW) | 0, (bSY + r * charH) | 0);
            }

            const coreY = FIREWALL_BOSS_CORE_OFFSET_Y;
            const coreColor = introActive ? '#ffffff' : (boss.isVulnerable ? (firewallStageTwo ? '#fff2a8' : '#00ffff') : (firewallStageTwo ? '#ff6a18' : '#ff0000'));
            if (glowEnabled) {
                const coreHalo = ctx.createRadialGradient(0, coreY, 0, 0, coreY, boss.isVulnerable ? 64 : 58);
                coreHalo.addColorStop(0, colorWithAlpha(coreColor, boss.isVulnerable ? 0.34 : 0.28));
                coreHalo.addColorStop(0.48, colorWithAlpha(coreColor, 0.1));
                coreHalo.addColorStop(1, colorWithAlpha(coreColor, 0));
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = coreHalo;
                ctx.fillRect(-64, coreY - 64, 128, 128);
                ctx.restore();
            }
            ctx.font = `bold ${FIREWALL_BOSS_CORE_FONT_SIZE}px Courier New`;
            ctx.fillStyle = coreColor;
            ctx.shadowColor = coreColor;
            ctx.shadowBlur = glowEnabled ? 10 : 0;
            ctx.fillText('◈', 0, coreY);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawSurvivorBossBar() {
            if (!boss || !boss.isSurvivorBoss) return;
            if (boss.phase !== 'ACTIVE') return;
            const barW = Math.min(width * 0.72, 680);
            const barH = 8;
            const x = width / 2 - barW / 2;
            const y = height - HUD_HEIGHT - 26;
            const ratio = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
            const barColor = boss.survivorBossType === 'ghostSignal' && (boss.stage || 1) >= 2
                ? '#f4fbff'
                : (boss.survivorBossType === 'overheatingFirewall' && (boss.stage || 1) >= 2 ? '#ffdd66' : (boss.color || '#ff5edb'));
            const bossLabel = boss.survivorBossType === 'distortedGlitch' && boss.scrambledName ? boss.scrambledName : boss.name;
            ctx.save();
            ctx.fillStyle = 'rgba(2, 7, 18, 0.78)';
            ctx.fillRect(x, y, barW, barH);
            ctx.fillStyle = barColor;
            ctx.fillRect(x, y, barW * ratio, barH);
            ctx.strokeStyle = colorWithAlpha('#ffffff', 0.35);
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barW, barH);
            ctx.font = `bold 13px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(bossLabel, width / 2, y - 5);
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
            ctx.globalCompositeOperation = 'source-over';
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
                const tint = { color: tintColor, amount: 0.58 };
                const pulse = 0.85 + Math.sin(renderNow * 0.025 + i) * 0.15;
                const alpha = Math.pow(lifeRatio, 1.7);
                const specterIntensity = typeof getSpecterRenderIntensity === 'function' ? getSpecterRenderIntensity() : 0;
                const specterVisualScale = typeof getPlayerSpecterVisualScale === 'function' ? getPlayerSpecterVisualScale() : 1;
                const afterimageScale = SURVIVOR_PLAYER_RENDER_SCALE * specterVisualScale * (1.02 + (1 - lifeRatio) * 0.05);
                ctx.save();
                ctx.translate(ghostX, ghostY);
                ctx.rotate(ghost.angle + Math.PI / 2);
                ctx.scale(
                    afterimageScale,
                    afterimageScale * (1 - 0.08 * specterIntensity)
                );
                ctx.translate(-ghostX, -ghostY);
                ctx.shadowColor = ghost.color || currentThemeColor || tintColor;
                ctx.shadowBlur = glowEnabled ? 7 * alpha + 2 * pulse : 0;
                ctx.fillStyle = tintColor;
                ctx.globalAlpha = 0.11 * alpha;
                for (const offset of [[-0.8, 0], [0.8, 0], [0, -0.8], [0, 0.8]]) {
                    ctx.save();
                    ctx.translate(offset[0], offset[1]);
                    drawSurvivorPlayerLayoutTint(layout, tint);
                    ctx.restore();
                }
                ctx.globalAlpha = 0.035 * alpha;
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
            if (playerExploded) return;
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
            const damageFlash = player.flashTimer > 0;
            ctx.fillStyle = damageFlash ? '#ff2200' : player.color;
            ctx.shadowColor = damageFlash ? '#ff2200' : currentThemeColor;
            ctx.shadowBlur = damageFlash ? 26 : pulseVisuals.glow;
            drawPlayerShip(player, 'center');
            ctx.shadowBlur = 0;
            player.x = oldX;
            player.y = oldY;
            player._renderLayoutCache = oldCache;
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawSurvivorModeReadout(renderNow, dt) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.font = `bold 13px 'Electrolize', sans-serif`;
            if (survivorState.autoFireHintTimer > 0) {
                survivorState.autoFireHintTimer = Math.max(0, survivorState.autoFireHintTimer - (dt || 0));
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.66)';
                const aimHint = (typeof survivorEightWayAimEnabled === 'undefined' || survivorEightWayAimEnabled)
                    ? 'ARROWS AIM | SPACE/B BOMB'
                    : 'LEFT/RIGHT TURN | SPACE/DOWN/B BOMB';
                ctx.fillText(`WASD MOVE | ${aimHint} | AUTO-FIRE | SHIFT PRISM FOCUS`, width / 2, height - HUD_HEIGHT - 48);
            }
            ctx.restore();
        }

        function isSurvivorScreenVisible(x, y, margin = 0) {
            return x >= -margin && x <= width + margin && y >= -margin && y <= height - HUD_HEIGHT + margin;
        }
