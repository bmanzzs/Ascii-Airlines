        // Matrix Nebula room crawler mode: Isaac-like simulation route.
        const MATRIX_CRAWLER_GAME_STATE = 'MATRIX_CRAWLER';
        const MATRIX_CRAWLER_COLORS = {
            bg: '#020806',
            panel: '#06140f',
            grid: '#0b3f25',
            wall: '#1bc76a',
            wallDim: '#0d6d3a',
            glow: '#41ff93',
            white: '#e6fff1',
            danger: '#ff5e8a',
            coin: '#baff75',
            shop: '#8ff7ff'
        };
        const MATRIX_CRAWLER_ROOM_LAYOUTS = [
            { id: 'standard', wScreens: 1, hScreens: 1, mapCells: [{ x: 0, y: 0 }] },
            {
                id: 'compact',
                wScreens: 1,
                hScreens: 1,
                mapCells: [{ x: 0, y: 0, s: 0.74 }],
                nullZones: [
                    { x: 0.06, y: 0.06, w: 0.18, h: 0.18, label: 'NULL' },
                    { x: 0.76, y: 0.08, w: 0.18, h: 0.16, label: 'ERR' },
                    { x: 0.08, y: 0.76, w: 0.16, h: 0.18, label: 'VOID' },
                    { x: 0.78, y: 0.78, w: 0.16, h: 0.16, label: '404' }
                ],
                breakables: [2, 4]
            },
            {
                id: 'wide',
                wScreens: 1.92,
                hScreens: 1,
                mapCells: [{ x: -0.34, y: 0 }, { x: 0.34, y: 0 }],
                nullZones: [{ x: 0.46, y: 0.10, w: 0.08, h: 0.22, label: 'DROP' }],
                breakables: [3, 6]
            },
            {
                id: 'tall',
                wScreens: 1,
                hScreens: 1.62,
                mapCells: [{ x: 0, y: -0.32 }, { x: 0, y: 0.32 }],
                nullZones: [{ x: 0.11, y: 0.46, w: 0.22, h: 0.08, label: 'GAP' }],
                breakables: [3, 6]
            },
            {
                id: 'line-h',
                wScreens: 2.35,
                hScreens: 1,
                mapCells: [{ x: -0.52, y: 0 }, { x: 0, y: 0 }, { x: 0.52, y: 0 }],
                nullZones: [
                    { x: 0.04, y: 0.06, w: 0.36, h: 0.22, label: 'NULL' },
                    { x: 0.60, y: 0.06, w: 0.36, h: 0.22, label: 'NULL' },
                    { x: 0.04, y: 0.72, w: 0.36, h: 0.22, label: 'VOID' },
                    { x: 0.60, y: 0.72, w: 0.36, h: 0.22, label: 'VOID' }
                ],
                breakables: [4, 8]
            },
            {
                id: 'line-v',
                wScreens: 1,
                hScreens: 2.05,
                mapCells: [{ x: 0, y: -0.48 }, { x: 0, y: 0 }, { x: 0, y: 0.48 }],
                nullZones: [
                    { x: 0.06, y: 0.04, w: 0.22, h: 0.36, label: 'NULL' },
                    { x: 0.72, y: 0.04, w: 0.22, h: 0.36, label: 'NULL' },
                    { x: 0.06, y: 0.60, w: 0.22, h: 0.36, label: 'VOID' },
                    { x: 0.72, y: 0.60, w: 0.22, h: 0.36, label: 'VOID' }
                ],
                breakables: [4, 8]
            },
            {
                id: 'large',
                wScreens: 1.42,
                hScreens: 1.22,
                mapCells: [{ x: -0.26, y: -0.22 }, { x: 0.26, y: -0.22 }, { x: -0.26, y: 0.22 }, { x: 0.26, y: 0.22 }],
                nullZones: [{ x: 0.12, y: 0.16, w: 0.16, h: 0.18, label: 'GAP' }, { x: 0.72, y: 0.64, w: 0.16, h: 0.18, label: 'GAP' }],
                breakables: [4, 7]
            },
            { id: 'l-ne', wScreens: 1.72, hScreens: 1.42, blockedCorner: 'NE', mapCells: [{ x: -0.34, y: -0.28 }, { x: -0.34, y: 0.28 }, { x: 0.34, y: 0.28 }], breakables: [3, 6] },
            { id: 'l-nw', wScreens: 1.72, hScreens: 1.42, blockedCorner: 'NW', mapCells: [{ x: 0.34, y: -0.28 }, { x: -0.34, y: 0.28 }, { x: 0.34, y: 0.28 }], breakables: [3, 6] },
            { id: 'l-se', wScreens: 1.72, hScreens: 1.42, blockedCorner: 'SE', mapCells: [{ x: -0.34, y: -0.28 }, { x: 0.34, y: -0.28 }, { x: -0.34, y: 0.28 }], breakables: [3, 6] },
            { id: 'l-sw', wScreens: 1.72, hScreens: 1.42, blockedCorner: 'SW', mapCells: [{ x: -0.34, y: -0.28 }, { x: 0.34, y: -0.28 }, { x: 0.34, y: 0.28 }], breakables: [3, 6] },
            {
                id: 't-n',
                wScreens: 1.86,
                hScreens: 1.58,
                mapCells: [{ x: -0.42, y: -0.24 }, { x: 0, y: -0.24 }, { x: 0.42, y: -0.24 }, { x: 0, y: 0.34 }],
                nullZones: [{ x: 0.03, y: 0.58, w: 0.34, h: 0.36, label: 'CUT' }, { x: 0.63, y: 0.58, w: 0.34, h: 0.36, label: 'CUT' }],
                breakables: [4, 8]
            },
            {
                id: 't-s',
                wScreens: 1.86,
                hScreens: 1.58,
                mapCells: [{ x: 0, y: -0.34 }, { x: -0.42, y: 0.24 }, { x: 0, y: 0.24 }, { x: 0.42, y: 0.24 }],
                nullZones: [{ x: 0.03, y: 0.06, w: 0.34, h: 0.36, label: 'CUT' }, { x: 0.63, y: 0.06, w: 0.34, h: 0.36, label: 'CUT' }],
                breakables: [4, 8]
            },
            {
                id: 't-e',
                wScreens: 1.58,
                hScreens: 1.86,
                mapCells: [{ x: -0.34, y: 0 }, { x: 0.24, y: -0.42 }, { x: 0.24, y: 0 }, { x: 0.24, y: 0.42 }],
                nullZones: [{ x: 0.06, y: 0.03, w: 0.36, h: 0.34, label: 'CUT' }, { x: 0.06, y: 0.63, w: 0.36, h: 0.34, label: 'CUT' }],
                breakables: [4, 8]
            },
            {
                id: 't-w',
                wScreens: 1.58,
                hScreens: 1.86,
                mapCells: [{ x: -0.24, y: -0.42 }, { x: -0.24, y: 0 }, { x: -0.24, y: 0.42 }, { x: 0.34, y: 0 }],
                nullZones: [{ x: 0.58, y: 0.03, w: 0.36, h: 0.34, label: 'CUT' }, { x: 0.58, y: 0.63, w: 0.36, h: 0.34, label: 'CUT' }],
                breakables: [4, 8]
            }
        ];
        const MATRIX_CRAWLER_DIRS = [
            { id: 'N', x: 0, y: -1, opposite: 'S' },
            { id: 'E', x: 1, y: 0, opposite: 'W' },
            { id: 'S', x: 0, y: 1, opposite: 'N' },
            { id: 'W', x: -1, y: 0, opposite: 'E' }
        ];
        const MATRIX_NULL_PHANTOM_PATTERN_DURATION = 4.0;
        const MATRIX_NULL_PHANTOM_NEEDLE_INTERVAL = 2.5;
        const MATRIX_NULL_PHANTOM_NEEDLE_DELAY = 0.15;
        const MATRIX_NULL_PHANTOM_NEEDLE_SPEED = 225;
        const MATRIX_NULL_PHANTOM_RING_SPEED = 154;
        const MATRIX_NULL_PHANTOM_SPIRAL_SPEED = 205;
        const MATRIX_NULL_PHANTOM_FAN_SPEED = 160;
        const MATRIX_NULL_PHANTOM_RENDER_SCALE = 0.585;
        const MATRIX_GLITCH_CHARGE_SPEED = 360;
        const MATRIX_GLITCH_STAGE_ONE_SPEED = 96;
        const MATRIX_GLITCH_STAGE_TWO_SPEED = 132;
        const MATRIX_GLITCH_RENDER_SCALE = 0.62;
        const MATRIX_GLITCH_MATRIX_CHARS = 'ﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const MATRIX_GLITCH_BULLET_CAP = 180;
        const MATRIX_PORT_SENTRY_RANGE = 760;
        const MATRIX_PORT_SENTRY_WINDUP = 0.42;
        const MATRIX_CRASH_BUG_DASH_SPEED = 430;
        const MATRIX_CRASH_BUG_WINDUP = 0.44;
        const MATRIX_CRASH_BUG_DASH_TIME = 0.48;
        const MATRIX_FIREWALL_HOST_RANGE = 560;
        const MATRIX_FIREWALL_HOST_OPEN_TIME = 1.35;
        const MATRIX_CRAWLER_NAV_CELL = 46;
        const MATRIX_CRAWLER_NAV_REFRESH = 0.18;
        const MATRIX_CRAWLER_NAV_MAX_EXPANSIONS = 2200;
        const MATRIX_CRAWLER_PLAYER_TURN_RESPONSE = 8.82;
        const MATRIX_CRAWLER_PLAYER_RENDER_SCALE = 0.663;
        const MATRIX_CRAWLER_PLAYER_ACCEL_RESPONSE = 18;
        const MATRIX_CRAWLER_PLAYER_DECEL_RESPONSE = 30;
        const MATRIX_CRAWLER_PLAYER_REVERSE_RESPONSE = 36;
        const MATRIX_CRAWLER_TURN_AFTERIMAGE_LIFE = 0.18;
        const MATRIX_CRAWLER_TURN_AFTERIMAGE_MAX = 4;
        const MATRIX_CRAWLER_HOVER_RIPPLE_LIFE = 0.58;
        const MATRIX_CRAWLER_HOVER_RIPPLE_MAX = 44;
        const MATRIX_CRAWLER_HOVER_THRUSTER_MAX = 22;
        const MATRIX_CRAWLER_HOVER_CHARS = ['^', '*', '.', 'v'];
        const MATRIX_CRAWLER_LASER_SPEED_MULT = 0.58;
        const MATRIX_CRAWLER_FIRE_RATE_MULT = 0.70;
        const MATRIX_CRAWLER_BULLET_SPEED_MULT = 0.90;
        const MATRIX_CRAWLER_TORPEDO_SPARK_CAP = 34;
        const MATRIX_CRAWLER_BASIC_BULLET_VISUAL_SCALE = 1.28;
        const MATRIX_CRAWLER_BOMB_RANGE_MULT = 0.74;
        const MATRIX_CRAWLER_BOMB_SPEED_MULT = 0.76;
        const MATRIX_CRAWLER_BOMB_SHRAPNEL_COUNT = 10;
        const MATRIX_CRAWLER_BOMB_PICKUP_COLOR = '#ffb347';
        const MATRIX_CRAWLER_MINIMAP_ROOM_STRIDE = 1;
        const MATRIX_CRAWLER_MINIMAP_CELL_SPREAD = 1;
        const MATRIX_CRAWLER_VIEWPORT_TOP_MARGIN = 156;
        const MATRIX_CRAWLER_VIEWPORT_BOTTOM_MARGIN = 96;
        const MATRIX_CRAWLER_CONTROL_DECAL_DURATION = 22;

        function createMatrixCrawlerState() {
            return {
                active: false,
                floor: 1,
                rooms: [],
                roomMap: new Map(),
                currentKey: '0,0',
                discovered: new Set(),
                projectiles: [],
                enemyBullets: [],
                enemies: [],
                pickups: [],
                breakables: [],
                particles: [],
                coins: 0,
                roomsCleared: 0,
                totalCombatRooms: 0,
                fireCooldown: 0,
                invuln: 0,
                message: '',
                messageTimer: 0,
                roomFlash: 0,
                transitionTimer: 0,
                transitionDir: null,
                cameraX: 0,
                cameraY: 0,
                cameraReady: false,
                aimAngle: PLAYER_FIRE_FORWARD_ANGLE,
                targetAimAngle: PLAYER_FIRE_FORWARD_ANGLE,
                playerTurnAfterimages: [],
                turnAfterimageCooldown: 0,
                hoverRipples: [],
                hoverEmitter: 0,
                hoverThrusters: [],
                hoverThrusterEmitter: 0,
                controlDecalTimer: MATRIX_CRAWLER_CONTROL_DECAL_DURATION,
                controlDecal: null,
                bossMusicActive: false,
                bossStopMusic: null,
                lastBossName: 'NULL PHANTOM',
                runStartedAt: 0
            };
        }

        let matrixCrawlerState = createMatrixCrawlerState();

        function matrixKey(x, y) {
            return `${x},${y}`;
        }

        function isMatrixCrawlerGalaxy(index = currentGalaxyIndex) {
            const galaxy = typeof getGalaxyDefinition === 'function' ? getGalaxyDefinition(index) : null;
            return !!(galaxy && galaxy.mode === 'matrixCrawler');
        }

        function isMatrixCrawlerModeActive() {
            return getActiveGameMode && getActiveGameMode() === 'matrixCrawler';
        }

        function isMatrixCrawlerRuntimeActive() {
            return gameState === MATRIX_CRAWLER_GAME_STATE && matrixCrawlerState && matrixCrawlerState.active;
        }

        function isMatrixCrawlerBossIntroActive() {
            return !!(matrixCrawlerState && matrixCrawlerState.active && matrixCrawlerState.enemies
                && matrixCrawlerState.enemies.some(enemy => enemy && (enemy.type === 'nullPhantom' || enemy.type === 'distortedGlitch') && enemy.phase === 'INTRO'));
        }

        function resetMatrixCrawlerRuntimeStateForCampaign() {
            matrixCrawlerState = createMatrixCrawlerState();
            bombProjectiles = [];
            bombBlastRings = [];
            if (player) {
                delete player.matrixCrawlerAimAngle;
                delete player.matrixCrawlerTurning;
                delete player.survivorAimAngle;
                player._renderLayoutCache = null;
            }
        }

        function endMatrixCrawlerRun() {
            if (!matrixCrawlerState) return;
            stopMatrixCrawlerBossMusic();
            matrixCrawlerState.active = false;
            matrixCrawlerState.projectiles = [];
            matrixCrawlerState.enemyBullets = [];
            matrixCrawlerState.enemies = [];
            matrixCrawlerState.pickups = [];
            matrixCrawlerState.breakables = [];
            matrixCrawlerState.particles = [];
            matrixCrawlerState.hoverRipples = [];
            matrixCrawlerState.hoverEmitter = 0;
            matrixCrawlerState.hoverThrusters = [];
            matrixCrawlerState.hoverThrusterEmitter = 0;
            matrixCrawlerState.playerTurnAfterimages = [];
            bombProjectiles = [];
            bombBlastRings = [];
            if (player) {
                delete player.matrixCrawlerAimAngle;
                delete player.matrixCrawlerTurning;
                delete player.survivorAimAngle;
                player._renderLayoutCache = null;
            }
        }

        function getMatrixCrawlerConsoleLevelLimit() {
            return 20;
        }

        function getMatrixCrawlerConsoleGalaxyIndex() {
            if (typeof GALAXY_DEFINITIONS !== 'undefined') {
                const exact = GALAXY_DEFINITIONS.findIndex(galaxy => galaxy && galaxy.id === 'void-circuit');
                if (exact >= 0) return exact;
                const crawler = GALAXY_DEFINITIONS.findIndex(galaxy => galaxy && galaxy.mode === 'matrixCrawler');
                if (crawler >= 0) return crawler;
            }
            return typeof currentGalaxyIndex === 'number' ? currentGalaxyIndex : 0;
        }

        function getMatrixCrawlerConsoleRoomType(target = null) {
            const raw = String(target || '').toLowerCase();
            if (raw === 'boss' || raw === 'b') return 'boss';
            if (raw === 'item' || raw === 'treasure' || raw === 'cache' || raw === 'i' || raw === 't') return 'treasure';
            return null;
        }

        function stopMatrixCrawlerBossMusic() {
            if (!matrixCrawlerState || !matrixCrawlerState.bossMusicActive) return;
            const stopMusic = matrixCrawlerState.bossStopMusic;
            matrixCrawlerState.bossMusicActive = false;
            matrixCrawlerState.bossStopMusic = null;
            if (typeof stopMusic === 'function') {
                stopMusic();
            } else if (matrixCrawlerState.lastBossName === 'DISTORTED GLITCH' && typeof stopDistortedGlitchMusic === 'function') {
                stopDistortedGlitchMusic();
            } else if (typeof stopVoidWalkerMusic === 'function') {
                stopVoidWalkerMusic();
            }
        }

        function matrixRand(seed) {
            const v = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
            return v - Math.floor(v);
        }

        function getMatrixCrawlerRoom(key = matrixCrawlerState.currentKey) {
            return matrixCrawlerState.roomMap.get(key) || matrixCrawlerState.rooms[0] || null;
        }

        function getMatrixCrawlerViewportRect() {
            const playfieldH = Math.max(220, height - HUD_HEIGHT);
            const top = Math.min(MATRIX_CRAWLER_VIEWPORT_TOP_MARGIN, Math.max(78, playfieldH * 0.26));
            const bottomPad = Math.min(MATRIX_CRAWLER_VIEWPORT_BOTTOM_MARGIN, Math.max(96, playfieldH * 0.23));
            const w = Math.max(360, width - 44);
            const h = Math.max(300, playfieldH - top - bottomPad);
            return {
                x: Math.round((width - w) / 2),
                y: Math.round(top),
                w,
                h,
                right: Math.round((width - w) / 2) + w,
                bottom: Math.round(top) + h
            };
        }

        function getMatrixCrawlerRoomLayout(room = getMatrixCrawlerRoom()) {
            return (room && room.layout) || MATRIX_CRAWLER_ROOM_LAYOUTS[0];
        }

        function getMatrixCrawlerRoomRect(room = getMatrixCrawlerRoom()) {
            const viewport = getMatrixCrawlerViewportRect();
            const layout = getMatrixCrawlerRoomLayout(room);
            const w = Math.max(viewport.w, Math.round(viewport.w * (layout.wScreens || 1)));
            const h = Math.max(viewport.h, Math.round(viewport.h * (layout.hScreens || 1)));
            return {
                x: 0,
                y: 0,
                w,
                h,
                right: w,
                bottom: h,
                viewport
            };
        }

        function getMatrixCrawlerDoorRect(room, dir) {
            const rect = getMatrixCrawlerRoomRect(room);
            const doorW = 78;
            const doorD = 26;
            if (dir === 'N') return { x: rect.x + rect.w / 2 - doorW / 2, y: rect.y - 2, w: doorW, h: doorD };
            if (dir === 'S') return { x: rect.x + rect.w / 2 - doorW / 2, y: rect.bottom - doorD + 2, w: doorW, h: doorD };
            if (dir === 'E') return { x: rect.right - doorD + 2, y: rect.y + rect.h / 2 - doorW / 2, w: doorD, h: doorW };
            return { x: rect.x - 2, y: rect.y + rect.h / 2 - doorW / 2, w: doorD, h: doorW };
        }

        function isMatrixCrawlerPlayerTouchingDoor(room, dir) {
            const d = getMatrixCrawlerDoorRect(room, dir);
            const sidePad = 24;
            const depthPad = 28;
            if (dir === 'N' || dir === 'S') {
                return player.x >= d.x - sidePad
                    && player.x <= d.x + d.w + sidePad
                    && player.y >= d.y - depthPad
                    && player.y <= d.y + d.h + depthPad;
            }
            return player.x >= d.x - depthPad
                && player.x <= d.x + d.w + depthPad
                && player.y >= d.y - sidePad
                && player.y <= d.y + d.h + sidePad;
        }

        function makeMatrixCrawlerBlockedRect(x, y, w, h, meta = {}) {
            return {
                x,
                y,
                w,
                h,
                right: x + w,
                bottom: y + h,
                label: meta.label || 'NULL SPACE',
                seed: meta.seed || 0,
                glitch: meta.glitch !== false
            };
        }

        function getMatrixCrawlerBlockedRects(room, rect = getMatrixCrawlerRoomRect(room)) {
            const layout = getMatrixCrawlerRoomLayout(room);
            const blocked = [];
            if (layout.blockedCorner) {
                const w = Math.max(160, Math.round(rect.w * 0.42));
                const h = Math.max(140, Math.round(rect.h * 0.42));
                const left = layout.blockedCorner.includes('W') ? rect.x : rect.right - w;
                const top = layout.blockedCorner.includes('N') ? rect.y : rect.bottom - h;
                blocked.push(makeMatrixCrawlerBlockedRect(left, top, w, h, {
                    label: 'NULL SPACE',
                    seed: room ? room.index + 11 : 11
                }));
            }
            if (Array.isArray(layout.nullZones)) {
                for (let i = 0; i < layout.nullZones.length; i++) {
                    const zone = layout.nullZones[i];
                    const w = Math.max(44, Math.round(rect.w * zone.w));
                    const h = Math.max(38, Math.round(rect.h * zone.h));
                    const x = Math.round(rect.x + rect.w * zone.x);
                    const y = Math.round(rect.y + rect.h * zone.y);
                    blocked.push(makeMatrixCrawlerBlockedRect(x, y, w, h, {
                        label: zone.label || 'NULL',
                        seed: (room ? room.index * 17 : 0) + i * 31 + 5,
                        glitch: zone.glitch !== false
                    }));
                }
            }
            return blocked;
        }

        function getMatrixCrawlerBlockedRect(room, rect = getMatrixCrawlerRoomRect(room)) {
            return getMatrixCrawlerBlockedRects(room, rect)[0] || null;
        }

        function isPointInsideRect(x, y, rect, pad = 0) {
            return x >= rect.x + pad && x <= rect.right - pad && y >= rect.y + pad && y <= rect.bottom - pad;
        }

        function isPointInMatrixCrawlerRoom(room, x, y, margin = 0) {
            const rect = getMatrixCrawlerRoomRect(room);
            if (!isPointInsideRect(x, y, rect, margin)) return false;
            const blockedRects = getMatrixCrawlerBlockedRects(room, rect);
            for (const blocked of blockedRects) {
                if (x >= blocked.x - margin && x <= blocked.right + margin && y >= blocked.y - margin && y <= blocked.bottom + margin) {
                    return false;
                }
            }
            return true;
        }

        function clampMatrixCrawlerPoint(room, x, y, margin = 24) {
            const rect = getMatrixCrawlerRoomRect(room);
            let nextX = Math.max(rect.x + margin, Math.min(rect.right - margin, x));
            let nextY = Math.max(rect.y + margin, Math.min(rect.bottom - margin, y));
            if (isPointInMatrixCrawlerRoom(room, nextX, nextY, margin)) return { x: nextX, y: nextY };

            const candidates = [];
            for (const blocked of getMatrixCrawlerBlockedRects(room, rect)) {
                if (nextX < blocked.x - margin || nextX > blocked.right + margin || nextY < blocked.y - margin || nextY > blocked.bottom + margin) {
                    continue;
                }
                candidates.push(
                    { x: blocked.x - margin, y: nextY },
                    { x: blocked.right + margin, y: nextY },
                    { x: nextX, y: blocked.y - margin },
                    { x: nextX, y: blocked.bottom + margin }
                );
            }
            const safeCandidates = candidates
                .map(p => ({
                    x: Math.max(rect.x + margin, Math.min(rect.right - margin, p.x)),
                    y: Math.max(rect.y + margin, Math.min(rect.bottom - margin, p.y))
                }))
                .filter(p => isPointInMatrixCrawlerRoom(room, p.x, p.y, margin))
                .sort((a, b) => ((a.x - nextX) ** 2 + (a.y - nextY) ** 2) - ((b.x - nextX) ** 2 + (b.y - nextY) ** 2));
            if (safeCandidates.length) return safeCandidates[0];
            return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
        }

        function getMatrixCrawlerSafePoint(room, x, y, margin = 26) {
            return isPointInMatrixCrawlerRoom(room, x, y, margin)
                ? { x, y }
                : clampMatrixCrawlerPoint(room, x, y, margin);
        }

        function markMatrixCrawlerRoomNavDirty(room = null) {
            const targetRoom = room || (typeof getMatrixCrawlerRoom === 'function' ? getMatrixCrawlerRoom() : null);
            if (!targetRoom) return;
            targetRoom.navGrids = {};
            targetRoom.navObstacleVersion = (targetRoom.navObstacleVersion || 0) + 1;
        }

        function isMatrixCrawlerBreakableBlockingPoint(room, x, y, margin = 24) {
            const breakables = (room && room.breakables) || [];
            for (const object of breakables) {
                if (!object || object.destroyed) continue;
                if (Math.hypot(object.x - x, object.y - y) < (object.radius || 16) + margin) return true;
            }
            return false;
        }

        function isMatrixCrawlerEnemyPointClear(room, x, y, margin = 24) {
            return isPointInMatrixCrawlerRoom(room, x, y, margin)
                && !isMatrixCrawlerBreakableBlockingPoint(room, x, y, margin);
        }

        function getMatrixCrawlerEnemySafePoint(room, x, y, margin = 24) {
            const rect = getMatrixCrawlerRoomRect(room);
            const clamped = clampMatrixCrawlerPoint(room, x, y, margin);
            if (isMatrixCrawlerEnemyPointClear(room, clamped.x, clamped.y, margin)) return clamped;

            const angleCount = 16;
            for (let radius = 12; radius <= 132; radius += 12) {
                for (let i = 0; i < angleCount; i++) {
                    const angle = (i / angleCount) * Math.PI * 2;
                    const px = Math.max(rect.x + margin, Math.min(rect.right - margin, clamped.x + Math.cos(angle) * radius));
                    const py = Math.max(rect.y + margin, Math.min(rect.bottom - margin, clamped.y + Math.sin(angle) * radius));
                    if (isMatrixCrawlerEnemyPointClear(room, px, py, margin)) return { x: px, y: py };
                }
            }

            return clamped;
        }

        function moveMatrixCrawlerBodyInRoom(room, x, y, nextX, nextY, margin = 24) {
            const rect = getMatrixCrawlerRoomRect(room);
            let outX = x;
            let outY = y;
            const boundedX = Math.max(rect.x + margin, Math.min(rect.right - margin, nextX));
            if (isPointInMatrixCrawlerRoom(room, boundedX, outY, margin)) outX = boundedX;
            const boundedY = Math.max(rect.y + margin, Math.min(rect.bottom - margin, nextY));
            if (isPointInMatrixCrawlerRoom(room, outX, boundedY, margin)) outY = boundedY;
            if (isPointInMatrixCrawlerRoom(room, outX, outY, margin)) return { x: outX, y: outY };
            return getMatrixCrawlerSafePoint(room, x, y, margin);
        }

        function moveMatrixCrawlerEnemyBodyInRoom(room, x, y, nextX, nextY, margin = 24) {
            const rect = getMatrixCrawlerRoomRect(room);
            let outX = x;
            let outY = y;
            const boundedX = Math.max(rect.x + margin, Math.min(rect.right - margin, nextX));
            if (isMatrixCrawlerEnemyPointClear(room, boundedX, outY, margin)) outX = boundedX;
            const boundedY = Math.max(rect.y + margin, Math.min(rect.bottom - margin, nextY));
            if (isMatrixCrawlerEnemyPointClear(room, outX, boundedY, margin)) outY = boundedY;
            if (isMatrixCrawlerEnemyPointClear(room, outX, outY, margin)) return { x: outX, y: outY };
            return getMatrixCrawlerEnemySafePoint(room, x, y, margin);
        }

        function hasMatrixCrawlerPathLine(room, x1, y1, x2, y2, margin = 24, step = MATRIX_CRAWLER_NAV_CELL * 0.55, includeBreakables = false) {
            const distance = Math.hypot(x2 - x1, y2 - y1);
            const steps = Math.max(1, Math.ceil(distance / Math.max(12, step)));
            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                const clear = includeBreakables
                    ? isMatrixCrawlerEnemyPointClear(room, x, y, margin)
                    : isPointInMatrixCrawlerRoom(room, x, y, margin);
                if (!clear) {
                    return false;
                }
            }
            return true;
        }

        function getMatrixCrawlerNavGrid(room, margin = 24, includeBreakables = false) {
            const rect = getMatrixCrawlerRoomRect(room);
            const cell = MATRIX_CRAWLER_NAV_CELL;
            const marginKey = Math.round(margin / 4) * 4;
            const obstacleKey = includeBreakables ? (room && room.navObstacleVersion) || 0 : 'static';
            const cacheKey = `${Math.round(rect.w)}:${Math.round(rect.h)}:${marginKey}:${includeBreakables ? 'enemy' : 'room'}:${obstacleKey}`;
            if (room && room.navGrids && room.navGrids[cacheKey]) return room.navGrids[cacheKey];

            const cols = Math.max(1, Math.ceil(rect.w / cell));
            const rows = Math.max(1, Math.ceil(rect.h / cell));
            const valid = new Uint8Array(cols * rows);
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const px = Math.max(rect.x + margin, Math.min(rect.right - margin, rect.x + (x + 0.5) * cell));
                    const py = Math.max(rect.y + margin, Math.min(rect.bottom - margin, rect.y + (y + 0.5) * cell));
                    valid[y * cols + x] = (includeBreakables
                        ? isMatrixCrawlerEnemyPointClear(room, px, py, margin)
                        : isPointInMatrixCrawlerRoom(room, px, py, margin)) ? 1 : 0;
                }
            }

            const grid = { key: cacheKey, rect, cell, cols, rows, margin: marginKey, valid };
            if (room) {
                if (!room.navGrids) room.navGrids = {};
                room.navGrids[cacheKey] = grid;
            }
            return grid;
        }

        function getMatrixCrawlerNavCell(grid, x, y) {
            return {
                x: Math.max(0, Math.min(grid.cols - 1, Math.floor((x - grid.rect.x) / grid.cell))),
                y: Math.max(0, Math.min(grid.rows - 1, Math.floor((y - grid.rect.y) / grid.cell)))
            };
        }

        function getMatrixCrawlerNavCellPoint(grid, index) {
            const x = index % grid.cols;
            const y = Math.floor(index / grid.cols);
            return {
                x: Math.max(grid.rect.x + grid.margin, Math.min(grid.rect.right - grid.margin, grid.rect.x + (x + 0.5) * grid.cell)),
                y: Math.max(grid.rect.y + grid.margin, Math.min(grid.rect.bottom - grid.margin, grid.rect.y + (y + 0.5) * grid.cell))
            };
        }

        function findNearestMatrixCrawlerNavIndex(grid, x, y) {
            const cell = getMatrixCrawlerNavCell(grid, x, y);
            const startIndex = cell.y * grid.cols + cell.x;
            if (grid.valid[startIndex]) return startIndex;

            let best = -1;
            let bestDist = Infinity;
            const maxRadius = Math.max(grid.cols, grid.rows);
            for (let radius = 1; radius <= maxRadius && best < 0; radius++) {
                const minX = Math.max(0, cell.x - radius);
                const maxX = Math.min(grid.cols - 1, cell.x + radius);
                const minY = Math.max(0, cell.y - radius);
                const maxY = Math.min(grid.rows - 1, cell.y + radius);
                for (let yy = minY; yy <= maxY; yy++) {
                    for (let xx = minX; xx <= maxX; xx++) {
                        if (xx !== minX && xx !== maxX && yy !== minY && yy !== maxY) continue;
                        const index = yy * grid.cols + xx;
                        if (!grid.valid[index]) continue;
                        const p = getMatrixCrawlerNavCellPoint(grid, index);
                        const distSq = (p.x - x) ** 2 + (p.y - y) ** 2;
                        if (distSq < bestDist) {
                            bestDist = distSq;
                            best = index;
                        }
                    }
                }
            }
            return best;
        }

        function findMatrixCrawlerNavPath(room, fromX, fromY, toX, toY, margin = 24, includeBreakables = false) {
            if (hasMatrixCrawlerPathLine(room, fromX, fromY, toX, toY, margin, MATRIX_CRAWLER_NAV_CELL * 0.55, includeBreakables)) return [];
            const grid = getMatrixCrawlerNavGrid(room, margin, includeBreakables);
            const start = findNearestMatrixCrawlerNavIndex(grid, fromX, fromY);
            const goal = findNearestMatrixCrawlerNavIndex(grid, toX, toY);
            if (start < 0 || goal < 0 || start === goal) return [];

            const total = grid.cols * grid.rows;
            const gScore = new Float32Array(total);
            gScore.fill(Infinity);
            const cameFrom = new Int32Array(total);
            cameFrom.fill(-1);
            const closed = new Uint8Array(total);
            const open = [start];
            const inOpen = new Uint8Array(total);
            inOpen[start] = 1;
            gScore[start] = 0;

            const goalX = goal % grid.cols;
            const goalY = Math.floor(goal / grid.cols);
            const heuristic = index => {
                const x = index % grid.cols;
                const y = Math.floor(index / grid.cols);
                const dx = Math.abs(x - goalX);
                const dy = Math.abs(y - goalY);
                return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
            };

            let expansions = 0;
            let reached = -1;
            while (open.length && expansions++ < MATRIX_CRAWLER_NAV_MAX_EXPANSIONS) {
                let bestOpen = 0;
                let bestScore = Infinity;
                for (let i = 0; i < open.length; i++) {
                    const index = open[i];
                    const score = gScore[index] + heuristic(index);
                    if (score < bestScore) {
                        bestScore = score;
                        bestOpen = i;
                    }
                }

                const current = open[bestOpen];
                open[bestOpen] = open[open.length - 1];
                open.pop();
                inOpen[current] = 0;
                if (current === goal) {
                    reached = current;
                    break;
                }
                closed[current] = 1;

                const cx = current % grid.cols;
                const cy = Math.floor(current / grid.cols);
                for (let oy = -1; oy <= 1; oy++) {
                    for (let ox = -1; ox <= 1; ox++) {
                        if (ox === 0 && oy === 0) continue;
                        const nx = cx + ox;
                        const ny = cy + oy;
                        if (nx < 0 || nx >= grid.cols || ny < 0 || ny >= grid.rows) continue;
                        const next = ny * grid.cols + nx;
                        if (!grid.valid[next] || closed[next]) continue;
                        if (ox !== 0 && oy !== 0) {
                            if (!grid.valid[cy * grid.cols + nx] || !grid.valid[ny * grid.cols + cx]) continue;
                        }
                        const cost = gScore[current] + (ox !== 0 && oy !== 0 ? Math.SQRT2 : 1);
                        if (cost >= gScore[next]) continue;
                        cameFrom[next] = current;
                        gScore[next] = cost;
                        if (!inOpen[next]) {
                            open.push(next);
                            inOpen[next] = 1;
                        }
                    }
                }
            }
            if (reached < 0) return [];

            const raw = [];
            for (let current = reached; current >= 0 && current !== start; current = cameFrom[current]) {
                raw.push(getMatrixCrawlerNavCellPoint(grid, current));
            }
            raw.reverse();
            if (!raw.length) return [];

            const smoothed = [];
            let anchor = { x: fromX, y: fromY };
            for (let i = 0; i < raw.length; i++) {
                if (!hasMatrixCrawlerPathLine(room, anchor.x, anchor.y, raw[i].x, raw[i].y, margin, MATRIX_CRAWLER_NAV_CELL * 0.55, includeBreakables)) {
                    const previous = raw[Math.max(0, i - 1)];
                    smoothed.push(previous);
                    anchor = previous;
                }
            }
            const finalTarget = (includeBreakables ? isMatrixCrawlerEnemyPointClear(room, toX, toY, margin) : isPointInMatrixCrawlerRoom(room, toX, toY, margin))
                ? { x: toX, y: toY }
                : raw[raw.length - 1];
            if (!hasMatrixCrawlerPathLine(room, anchor.x, anchor.y, finalTarget.x, finalTarget.y, margin, MATRIX_CRAWLER_NAV_CELL * 0.55, includeBreakables)) {
                smoothed.push(raw[raw.length - 1]);
            } else {
                smoothed.push(finalTarget);
            }
            return smoothed;
        }

        function getMatrixCrawlerEnemySteerTarget(enemy, room, targetX, targetY, dt, margin = 24) {
            const direct = hasMatrixCrawlerPathLine(room, enemy.x, enemy.y, targetX, targetY, margin, MATRIX_CRAWLER_NAV_CELL * 0.55, true);
            if (direct) {
                enemy.navPath = null;
                enemy.navTimer = MATRIX_CRAWLER_NAV_REFRESH;
                enemy.navGoalX = targetX;
                enemy.navGoalY = targetY;
                return { x: targetX, y: targetY, usingPath: false };
            }

            enemy.navTimer = (enemy.navTimer || 0) - dt;
            const goalMoved = Math.hypot((enemy.navGoalX ?? targetX) - targetX, (enemy.navGoalY ?? targetY) - targetY) > MATRIX_CRAWLER_NAV_CELL * 0.7;
            const stalePath = !enemy.navPath || !enemy.navPath.length || !hasMatrixCrawlerPathLine(room, enemy.x, enemy.y, enemy.navPath[0].x, enemy.navPath[0].y, margin, MATRIX_CRAWLER_NAV_CELL * 0.55, true);
            if (enemy.navTimer <= 0 || goalMoved || stalePath) {
                enemy.navPath = findMatrixCrawlerNavPath(room, enemy.x, enemy.y, targetX, targetY, margin, true);
                enemy.navTimer = MATRIX_CRAWLER_NAV_REFRESH + Math.random() * 0.08;
                enemy.navGoalX = targetX;
                enemy.navGoalY = targetY;
            }

            while (enemy.navPath && enemy.navPath.length > 1 && Math.hypot(enemy.navPath[0].x - enemy.x, enemy.navPath[0].y - enemy.y) < MATRIX_CRAWLER_NAV_CELL * 0.42) {
                enemy.navPath.shift();
            }
            if (enemy.navPath && enemy.navPath.length) {
                return { x: enemy.navPath[0].x, y: enemy.navPath[0].y, usingPath: true };
            }
            return { x: targetX, y: targetY, usingPath: true };
        }

        function getMatrixCrawlerEnemySeekVector(enemy, room, targetX, targetY, dt, margin = 24) {
            const target = getMatrixCrawlerEnemySteerTarget(enemy, room, targetX, targetY, dt, margin);
            let dx = target.x - enemy.x;
            let dy = target.y - enemy.y;
            let dist = Math.hypot(dx, dy);
            if (dist < 0.001) {
                dx = targetX - enemy.x;
                dy = targetY - enemy.y;
                dist = Math.max(1, Math.hypot(dx, dy));
            }
            return { x: dx / dist, y: dy / dist, usingPath: target.usingPath };
        }

        function applyMatrixCrawlerEnemyMove(enemy, room, vx, vy, dt, margin = 24) {
            const nextX = enemy.x + vx * dt;
            const nextY = enemy.y + vy * dt;
            const moved = moveMatrixCrawlerEnemyBodyInRoom(room, enemy.x, enemy.y, nextX, nextY, margin);
            const desired = Math.hypot(nextX - enemy.x, nextY - enemy.y);
            const actual = Math.hypot(moved.x - enemy.x, moved.y - enemy.y);
            enemy.x = moved.x;
            enemy.y = moved.y;
            if (desired > 0.5 && actual < desired * 0.28) {
                enemy.navStuckTimer = (enemy.navStuckTimer || 0) + dt;
                if (enemy.navStuckTimer > 0.12) enemy.navTimer = 0;
            } else {
                enemy.navStuckTimer = Math.max(0, (enemy.navStuckTimer || 0) - dt * 2.5);
            }
            return moved;
        }

        function setMatrixCrawlerCameraToPlayer(immediate = false) {
            const state = matrixCrawlerState;
            const room = getMatrixCrawlerRoom();
            const rect = getMatrixCrawlerRoomRect(room);
            const viewport = getMatrixCrawlerViewportRect();
            const targetX = Math.max(rect.x, Math.min(rect.right - viewport.w, player.x - viewport.w / 2));
            const targetY = Math.max(rect.y, Math.min(rect.bottom - viewport.h, player.y - viewport.h / 2));
            if (immediate || !state.cameraReady) {
                state.cameraX = targetX;
                state.cameraY = targetY;
                state.cameraReady = true;
                return;
            }
            const blend = 0.18;
            state.cameraX += (targetX - state.cameraX) * blend;
            state.cameraY += (targetY - state.cameraY) * blend;
        }

        function buildMatrixCrawlerFloor() {
            const state = matrixCrawlerState;
            const floor = Math.max(1, state.floor || 1);
            const targetRooms = 14 + Math.min(12, Math.max(0, floor - 1) * 4);
            const rooms = [{ x: 0, y: 0, key: '0,0', type: 'start', depth: 0 }];
            const occupied = new Set(['0,0']);
            let cursor = rooms[0];
            let guard = 0;
            while (rooms.length < targetRooms && guard++ < 360) {
                const dir = MATRIX_CRAWLER_DIRS[Math.floor(Math.random() * MATRIX_CRAWLER_DIRS.length)];
                const branch = Math.random() < 0.28 ? rooms[Math.floor(Math.random() * rooms.length)] : cursor;
                const nx = branch.x + dir.x;
                const ny = branch.y + dir.y;
                const key = matrixKey(nx, ny);
                if (occupied.has(key)) {
                    cursor = branch;
                    continue;
                }
                const room = {
                    x: nx,
                    y: ny,
                    key,
                    type: 'combat',
                    depth: Math.abs(nx) + Math.abs(ny),
                    entered: false,
                    clear: false
                };
                occupied.add(key);
                rooms.push(room);
                cursor = room;
            }

            rooms.sort((a, b) => a.depth - b.depth || a.key.localeCompare(b.key));
            const specials = rooms.slice(1).sort((a, b) => b.depth - a.depth);
            if (specials[0]) specials[0].type = 'boss';
            if (specials[1]) specials[1].type = 'treasure';
            if (specials[2]) specials[2].type = 'shop';
            if (specials[3]) specials[3].type = 'challenge';
            if (specials[4]) specials[4].type = 'secret';

            for (let i = 0; i < rooms.length; i++) {
                const room = rooms[i];
                const roll = matrixRand(i + room.x * 19 + room.y * 31);
                if (room.type === 'start') {
                    room.layout = MATRIX_CRAWLER_ROOM_LAYOUTS[0];
                } else if (room.type === 'boss') {
                    room.layout = MATRIX_CRAWLER_ROOM_LAYOUTS.find(layout => layout.id === 'large') || MATRIX_CRAWLER_ROOM_LAYOUTS[0];
                } else if (room.type === 'challenge') {
                    const challengePool = ['t-n', 't-s', 't-e', 't-w', 'l-ne', 'l-nw', 'l-se', 'l-sw'];
                    const layoutId = challengePool[Math.floor(roll * challengePool.length)] || 't-n';
                    room.layout = MATRIX_CRAWLER_ROOM_LAYOUTS.find(layout => layout.id === layoutId) || MATRIX_CRAWLER_ROOM_LAYOUTS[0];
                } else if (room.type === 'treasure' || room.type === 'shop' || room.type === 'secret') {
                    const specialPool = room.type === 'shop'
                        ? ['compact', 'standard', 'wide']
                        : ['compact', 'wide', 'tall', 'l-ne', 'l-sw'];
                    const layoutId = specialPool[Math.floor(roll * specialPool.length)] || 'compact';
                    room.layout = MATRIX_CRAWLER_ROOM_LAYOUTS.find(layout => layout.id === layoutId) || MATRIX_CRAWLER_ROOM_LAYOUTS[0];
                } else {
                    const layoutPool = ['standard', 'compact', 'wide', 'tall', 'line-h', 'line-v', 'large', 'l-ne', 'l-nw', 'l-se', 'l-sw', 't-n', 't-s', 't-e', 't-w'];
                    const layoutId = layoutPool[Math.floor(roll * layoutPool.length)] || 'standard';
                    room.layout = MATRIX_CRAWLER_ROOM_LAYOUTS.find(layout => layout.id === layoutId) || MATRIX_CRAWLER_ROOM_LAYOUTS[0];
                }
                room.neighbors = {};
                room.index = i;
                if (room.type === 'start' || room.type === 'treasure' || room.type === 'shop' || room.type === 'secret') room.clear = true;
            }
            const map = new Map(rooms.map(room => [room.key, room]));
            for (const room of rooms) {
                for (const dir of MATRIX_CRAWLER_DIRS) {
                    const neighbor = map.get(matrixKey(room.x + dir.x, room.y + dir.y));
                    if (neighbor) room.neighbors[dir.id] = neighbor.key;
                }
            }
            state.rooms = rooms;
            state.roomMap = map;
            state.currentKey = '0,0';
            state.discovered = new Set(['0,0']);
            state.totalCombatRooms = rooms.filter(room => room.type === 'combat' || room.type === 'challenge' || room.type === 'boss').length;
            state.roomsCleared = 0;
            return rooms;
        }

        function beginMatrixCrawlerRun(options = {}) {
            stopMatrixCrawlerBossMusic();
            matrixCrawlerState = createMatrixCrawlerState();
            const state = matrixCrawlerState;
            state.floor = Math.max(1, Math.min(getMatrixCrawlerConsoleLevelLimit(), Math.floor(options.floor || 1)));
            state.active = true;
            state.runStartedAt = performance.now();
            if (typeof setActiveGameMode === 'function') setActiveGameMode('matrixCrawler');
            if (typeof resetSurvivorRuntimeStateForCampaign === 'function') resetSurvivorRuntimeStateForCampaign();
            if (typeof resetRunCompleteTransition === 'function') resetRunCompleteTransition();
            clearGameplayKeys();
            resetRunStats();
            score = 0;
            comboCount = 0;
            comboPeak = 0;
            comboEventSerial = 0;
            comboEventType = 'idle';
            comboEventText = '';
            comboEventAt = 0;
            if (typeof resetComboBurstState === 'function') resetComboBurstState();
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
            playerExploded = false;
            deathTimer = 0;
            player.shipId = getSelectedShipConfig().id;
            player.modifiers = createBasePlayerModifiers();
            player.weaponStats = createBaseWeaponStats();
            player.weapons = [];
            player.drones = [];
            player.bombTimer = 0;
            player.bombCooldown = BOMB_BASE_COOLDOWN;
            player.level = 1;
            player.xp = 0;
            player.xpNeeded = 1;
            player.stats = { L: 1, M: 0, B: 0 };
            applySelectedShipToPlayer({ heal: true });
            player.invincibilityTimer = 0;
            player.flashTimer = 0;
            player.isFiring = false;
            player.isBeaming = false;
            state.aimAngle = PLAYER_FIRE_FORWARD_ANGLE;
            state.targetAimAngle = PLAYER_FIRE_FORWARD_ANGLE;
            state.playerTurnAfterimages = [];
            state.turnAfterimageCooldown = 0;
            state.hoverRipples = [];
            state.hoverEmitter = 0;
            state.hoverThrusters = [];
            state.hoverThrusterEmitter = 0;
            player.matrixCrawlerAimAngle = PLAYER_FIRE_FORWARD_ANGLE;
            player.matrixCrawlerTurning = false;
            player.survivorAimAngle = PLAYER_FIRE_FORWARD_ANGLE;
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
            buildMatrixCrawlerFloor();
            enterMatrixCrawlerRoom('0,0');
            gameState = MATRIX_CRAWLER_GAME_STATE;
            pauseReturnState = MATRIX_CRAWLER_GAME_STATE;
            pauseState = 'MAIN';
            pauseSelection = 0;
            titleAlpha = 0;
            if (typeof startMusic === 'function') startMusic();
            applyCurrentVolume();
        }

        function jumpToMatrixCrawlerLevel(level = 1, roomTarget = null) {
            const limit = getMatrixCrawlerConsoleLevelLimit();
            const targetFloor = Math.floor(level || 0);
            if (targetFloor < 1 || targetFloor > limit) {
                return { ok: false, message: `Usage: g3w1-g3w${limit}, g3w1b, or g3w1i` };
            }

            const galaxyIndex = getMatrixCrawlerConsoleGalaxyIndex();
            currentGalaxyIndex = galaxyIndex;
            selectedGalaxyIndex = galaxyIndex;
            beginMatrixCrawlerRun({ floor: targetFloor });

            const roomType = getMatrixCrawlerConsoleRoomType(roomTarget);
            let room = null;
            if (roomType) {
                room = matrixCrawlerState.rooms.find(candidate => candidate && candidate.type === roomType) || null;
                if (!room) {
                    return { ok: false, message: `Matrix floor ${targetFloor} has no ${roomType} room.` };
                }
                enterMatrixCrawlerRoom(room.key);
            }

            const roomText = roomType === 'boss'
                ? 'boss room'
                : (roomType === 'treasure' ? 'item room' : 'start room');
            return {
                ok: true,
                floor: targetFloor,
                roomType: roomType || 'start',
                message: `Jumped to G3 W${targetFloor} (${roomText}).`
            };
        }

        function restartMatrixCrawlerRun() {
            if (typeof selectShip === 'function') selectShip(shipSelectIndex, true);
            beginMatrixCrawlerRun();
        }

        function getMatrixCrawlerSpawnPoint(room, rect, index, total) {
            for (let attempt = 0; attempt < 24; attempt++) {
                const seed = index * 101 + total * 17 + attempt * 43;
                const x = rect.x + rect.w * (0.16 + matrixRand(seed) * 0.68);
                const y = rect.y + rect.h * (0.18 + matrixRand(seed + 13) * 0.64);
                if (isPointInMatrixCrawlerRoom(room, x, y, 42) && isMatrixCrawlerPointClearOfBreakables(room, x, y, 44)) return { x, y };
            }
            return clampMatrixCrawlerPoint(room, rect.x + rect.w / 2, rect.y + rect.h / 2, 42);
        }

        function getMatrixCrawlerBossDefForFloor(floor = matrixCrawlerState.floor || 1) {
            if (Math.max(1, Math.floor(floor || 1)) >= 2) {
                return {
                    type: 'distortedGlitch',
                    name: 'DISTORTED GLITCH',
                    color: '#00ff66',
                    hp: 800,
                    sprite: typeof GLITCH_SPRITE_1 !== 'undefined' ? GLITCH_SPRITE_1 : [' #### ', '##[]##', ' #### '],
                    startMusic: typeof startDistortedGlitchMusic === 'function' ? startDistortedGlitchMusic : null,
                    stopMusic: typeof stopDistortedGlitchMusic === 'function' ? stopDistortedGlitchMusic : null
                };
            }
            return {
                type: 'nullPhantom',
                name: 'NULL PHANTOM',
                color: '#9f8cff',
                hp: 760,
                sprite: typeof NULL_PHANTOM_SOURCE !== 'undefined' ? NULL_PHANTOM_SOURCE : [' .-. ', '(0_0)', ' /|\\ '],
                startMusic: typeof startVoidWalkerMusic === 'function' ? startVoidWalkerMusic : null,
                stopMusic: typeof stopVoidWalkerMusic === 'function' ? stopVoidWalkerMusic : null
            };
        }

        function getMatrixCrawlerBossNameForFloor(floor = matrixCrawlerState.floor || 1) {
            const def = getMatrixCrawlerBossDefForFloor(floor);
            return def.name || 'NULL PHANTOM';
        }

        function isMatrixCrawlerAdvancedNormalEnemy(type) {
            return type === 'portSentry' || type === 'crashBug' || type === 'firewallHost';
        }

        function getMatrixCrawlerEnemyBaseHp(type) {
            if (type === 'bug') return 18;
            if (type === 'turret') return 34;
            if (type === 'orbit') return 42;
            if (type === 'portSentry') return 36;
            if (type === 'crashBug') return 44;
            if (type === 'firewallHost') return 62;
            if (type === 'miniboss') return 155;
            return 30;
        }

        function initializeMatrixCrawlerAdvancedEnemy(enemy) {
            if (!enemy) return enemy;
            if (enemy.type === 'portSentry') {
                enemy.fireTimer = 0.85 + Math.random() * 0.75;
                enemy.sentryWindup = 0;
                enemy.fireFlashTimer = 0;
                enemy.aimAngle = Math.random() * Math.PI * 2;
            } else if (enemy.type === 'crashBug') {
                enemy.crashState = 'wander';
                enemy.dashCooldown = 0.9 + Math.random() * 1.1;
                enemy.dashWindup = 0;
                enemy.dashTimer = 0;
                enemy.dashRecover = 0;
                enemy.dashBounces = 0;
                enemy.dashVx = 0;
                enemy.dashVy = 0;
                enemy.wanderAngle = Math.random() * Math.PI * 2;
                enemy.aimAngle = enemy.wanderAngle;
            } else if (enemy.type === 'firewallHost') {
                enemy.hostState = 'closed';
                enemy.hostTimer = 0.9 + Math.random() * 1.1;
                enemy.hostFireDelay = 0;
                enemy.hostFlashTimer = 0;
                enemy.aimAngle = 0;
                enemy.isShielded = true;
            }
            return enemy;
        }

        function spawnMatrixEnemy(type, x, y, options = {}) {
            const archetypes = {
                seeker: { hp: 28, speed: 78, radius: 18, char: '0', color: '#41ff93', contact: 8, score: 20, visualKind: 'base', visualScale: 0.92 },
                bug: { hp: 18, speed: 118, radius: 16, char: 'x', color: '#8ff7ff', contact: 6, score: 15, visualKind: 'base', visualScale: 0.84 },
                turret: { hp: 34, speed: 0, radius: 20, char: 'T', color: '#9bffcf', contact: 8, score: 25, visualKind: 'armored', visualScale: 0.96 },
                orbit: { hp: 42, speed: 64, radius: 20, char: '@', color: '#d884ff', contact: 8, score: 30, visualKind: 'armored', visualScale: 0.94 },
                portSentry: { hp: 36, speed: 0, radius: 19, char: 'P', color: '#8ff7ff', contact: 8, score: 32, visualKind: 'armored', visualScale: 0.88 },
                crashBug: { hp: 44, speed: 48, radius: 18, char: 'C', color: '#ff6f61', contact: 12, score: 38, visualKind: 'base', visualScale: 0.90 },
                firewallHost: { hp: 62, speed: 0, radius: 22, char: 'H', color: '#ffb347', contact: 10, score: 48, visualKind: 'armored', visualScale: 1.0 },
                miniboss: { hp: 155, speed: 42, radius: 31, char: 'M', color: '#fff07a', contact: 14, score: 120, visualKind: 'elite', visualScale: 1.16 },
                nullPhantom: { hp: 760, speed: 0, radius: 54, char: 'N', color: '#9f8cff', contact: 18, score: 500 },
                distortedGlitch: { hp: 800, speed: 0, radius: 50, char: '#', color: '#00ff66', contact: 18, score: 620 }
            };
            const base = archetypes[type] || archetypes.seeker;
            const lifecyclePhase = Object.prototype.hasOwnProperty.call(options, 'phase')
                ? options.phase
                : Math.random() * Math.PI * 2;
            const enemy = {
                ...base,
                ...options,
                type,
                x,
                y,
                vx: 0,
                vy: 0,
                maxHp: options.hp || base.hp,
                hp: options.hp || base.hp,
                fireTimer: 0.45 + Math.random() * 1.2,
                phase: lifecyclePhase,
                animPhase: Number.isFinite(lifecyclePhase) ? lifecyclePhase : Math.random() * Math.PI * 2,
                flashTimer: 0,
                dead: false,
                indexOffset: Math.random() * 1000,
                matrixCrawlerEnemy: true
            };
            initializeMatrixCrawlerAdvancedEnemy(enemy);
            if (type !== 'nullPhantom' && type !== 'distortedGlitch' && !isMatrixCrawlerAdvancedNormalEnemy(type) && typeof configureEnemyShipVisual === 'function') {
                configureEnemyShipVisual(enemy, options.visualKind || base.visualKind || 'base', {
                    color: options.color || enemy.color,
                    visualScale: options.visualScale || base.visualScale || 1
                });
            }
            matrixCrawlerState.enemies.push(enemy);
            return enemy;
        }

        function spawnMatrixNullPhantomBoss(room, rect) {
            const state = matrixCrawlerState;
            const def = getMatrixCrawlerBossDefForFloor(state.floor || 1);
            const viewport = getMatrixCrawlerViewportRect();
            const target = getMatrixCrawlerSafePoint(
                room,
                Math.max(rect.x + 90, Math.min(rect.right - 90, (state.cameraX || 0) + viewport.w / 2)),
                Math.max(rect.y + 90, Math.min(rect.bottom - 90, (state.cameraY || 0) + viewport.h * 0.34)),
                66
            );
            const hp = Math.round(760 + Math.max(0, (state.floor || 1) - 1) * 120);
            spawnMatrixEnemy('nullPhantom', target.x, target.y, {
                name: def.name || 'NULL PHANTOM',
                hp,
                maxHp: hp,
                sprite: def.sprite,
                color: def.color || '#9f8cff',
                phase: 'INTRO',
                timer: 0,
                introDuration: 4,
                introTargetX: target.x,
                introTargetY: target.y,
                introApproachOffsetX: -120,
                introApproachOffsetY: -95,
                introAlpha: 0,
                introDepth: 0.035,
                introDropReady: false,
                introLayerPulse: -1,
                phantomPattern: 0,
                phantomPatternTimer: 0,
                phantomPatternFireTimer: 0.24,
                phantomBurstTimer: 1.18,
                phantomBurstCount: 0,
                phantomBurstDelay: 0,
                spiralAngle: Math.random() * Math.PI * 2,
                orbitSeed: Math.random() * Math.PI * 2,
                orbitSwing: 0.9,
                orbitRadiusX: 210,
                orbitRadiusY: 155,
                steerStrength: 0.95,
                nullPhantomScale: MATRIX_NULL_PHANTOM_RENDER_SCALE,
                renderScale: 1,
                isShielded: true,
                isVulnerable: false
            });
            state.lastBossName = def.name || 'NULL PHANTOM';
            state.bossMusicActive = true;
            state.bossStopMusic = def.stopMusic || null;
            state.invuln = Math.max(state.invuln || 0, 4.35);
            player.flashTimer = Math.max(player.flashTimer || 0, 0.35);
            if (typeof def.startMusic === 'function') def.startMusic();
            addShake(16);
        }

        function spawnMatrixDistortedGlitchBoss(room, rect) {
            const state = matrixCrawlerState;
            const def = getMatrixCrawlerBossDefForFloor(state.floor || 2);
            const viewport = getMatrixCrawlerViewportRect();
            const target = getMatrixCrawlerSafePoint(
                room,
                Math.max(rect.x + 90, Math.min(rect.right - 90, (state.cameraX || 0) + viewport.w / 2)),
                Math.max(rect.y + 95, Math.min(rect.bottom - 95, (state.cameraY || 0) + viewport.h * 0.35)),
                64
            );
            const hp = Math.round((def.hp || 800) + Math.max(0, (state.floor || 2) - 2) * 135);
            spawnMatrixEnemy('distortedGlitch', target.x, target.y, {
                name: 'DISTORTED GLITCH',
                hp,
                maxHp: hp,
                sprite: def.sprite,
                color: '#00ff66',
                phase: 'INTRO',
                timer: 0,
                introDuration: 4,
                introTargetX: target.x,
                introTargetY: target.y,
                introApproachOffsetX: -110,
                introApproachOffsetY: -100,
                introAlpha: 0,
                introDepth: 0.035,
                introDropReady: false,
                introLayerPulse: -1,
                renderScale: MATRIX_GLITCH_RENDER_SCALE,
                isShielded: true,
                isVulnerable: false,
                stage: 1,
                colorCycleTimer: 0,
                glitchVx: 0,
                glitchVy: 0,
                dirChangeTimer: 0.25,
                baseSpeed: MATRIX_GLITCH_STAGE_ONE_SPEED,
                scatterTimer: 0.55,
                codeVolleyTimer: 2.2,
                isCodeVolley: false,
                codeVolleyShots: 0,
                codeVolleyDelay: 0,
                isCharging: false,
                chargeTimer: 0,
                chargeDuration: 0,
                glowIntensity: 0,
                transitionFlash: 0,
                transitionTextTimer: 0,
                scrambledName: 'DISTORTED GLITCH',
                scrambleTimer: 0.65,
                matrixRainTimer: 1.2,
                glitchTearTimer: 3.2
            });
            state.lastBossName = 'DISTORTED GLITCH';
            state.bossMusicActive = true;
            state.bossStopMusic = def.stopMusic || null;
            state.invuln = Math.max(state.invuln || 0, 4.35);
            player.flashTimer = Math.max(player.flashTimer || 0, 0.35);
            if (typeof def.startMusic === 'function') def.startMusic();
            addShake(16);
        }

        function spawnMatrixRoomEnemies(room) {
            const state = matrixCrawlerState;
            const rect = getMatrixCrawlerRoomRect(room);
            const floor = Math.max(1, state.floor || 1);
            const floorBoost = Math.max(0, (state.floor || 1) - 1) * 0.24;
            const difficulty = 1 + Math.min(3.5, room.depth * 0.18 + floorBoost);
            let pattern = ['seeker', 'bug', 'turret'];
            let count = 3 + Math.floor(room.depth * 0.42 + Math.max(0, (state.floor || 1) - 1) * 0.35);
            if (room.type === 'challenge') {
                pattern = floor >= 2
                    ? ['crashBug', 'portSentry', 'firewallHost', 'orbit', 'crashBug', 'turret']
                    : ['seeker', 'turret', 'orbit', 'miniboss'];
                count = floor >= 2 ? 6 : 5;
            } else if (room.type === 'boss') {
                const bossDef = getMatrixCrawlerBossDefForFloor(state.floor || 1);
                if (bossDef.type === 'distortedGlitch') spawnMatrixDistortedGlitchBoss(room, rect);
                else spawnMatrixNullPhantomBoss(room, rect);
                return;
            } else if (floor >= 2 && room.depth >= 5) {
                pattern = ['seeker', 'portSentry', 'bug', 'crashBug', 'firewallHost', 'orbit'];
            } else if (floor >= 2 && room.depth >= 3) {
                pattern = ['seeker', 'bug', 'portSentry', 'crashBug', 'turret'];
            } else if (floor >= 2 && room.depth >= 1) {
                pattern = ['seeker', 'bug', 'portSentry'];
            } else if (room.depth >= 4) {
                pattern = ['seeker', 'bug', 'turret', 'orbit'];
            }
            for (let i = 0; i < count; i++) {
                const spawn = getMatrixCrawlerSpawnPoint(room, rect, i, count);
                const type = pattern[i % pattern.length];
                spawnMatrixEnemy(type, spawn.x, spawn.y, {
                    hp: Math.round(getMatrixCrawlerEnemyBaseHp(type) * difficulty)
                });
            }
        }

        function makeMatrixCrawlerReward(kind = null) {
            const canWeapon = typeof WEAPON_POOL !== 'undefined' && player.weapons.length < 10;
            const chooseWeapon = kind === 'weapon' || (!kind && canWeapon && Math.random() < 0.55);
            if (chooseWeapon) {
                const pool = WEAPON_POOL.filter(w => !player.weapons.some(active => active.name === w.name));
                const item = (pool.length ? pool : WEAPON_POOL)[Math.floor(Math.random() * (pool.length ? pool.length : WEAPON_POOL.length))];
                return { kind: 'weapon', item, label: item.name, color: item.color || MATRIX_CRAWLER_COLORS.white };
            }
            const option = typeof drawOptions === 'function'
                ? drawOptions(POWERUP_POOL, 1, player.level || 1)[0]
                : POWERUP_POOL[Math.floor(Math.random() * POWERUP_POOL.length)];
            return { kind: 'powerup', item: option, label: option.displayName || option.name, color: option.color || MATRIX_CRAWLER_COLORS.glow };
        }

        function buildMatrixCrawlerPowerupOffer(seedOption = null) {
            if (typeof drawOptions !== 'function' || typeof POWERUP_POOL === 'undefined') {
                return seedOption ? [seedOption] : [];
            }
            const level = player.level || 1;
            const choices = [];
            const addChoice = option => {
                if (!option || choices.some(existing => existing.id === option.id)) return;
                choices.push(option);
            };
            addChoice(seedOption);
            for (let attempts = 0; choices.length < 3 && attempts < 8; attempts++) {
                const drawn = drawOptions(POWERUP_POOL, 3, level);
                for (const option of drawn) {
                    addChoice(option);
                    if (choices.length >= 3) break;
                }
            }
            return choices.slice(0, 3);
        }

        function spawnMatrixPickup(x, y, kind, options = {}) {
            const defaultRadius = kind === 'item' ? 20 : (kind === 'bomb' ? 16 : 13);
            const defaultChar = kind === 'coin'
                ? '$'
                : kind === 'heart'
                    ? '+'
                    : kind === 'exit'
                        ? '>>'
                        : kind === 'bomb'
                            ? 'B'
                            : '?';
            const defaultColor = kind === 'coin'
                ? MATRIX_CRAWLER_COLORS.coin
                : kind === 'bomb'
                    ? MATRIX_CRAWLER_BOMB_PICKUP_COLOR
                    : MATRIX_CRAWLER_COLORS.white;
            matrixCrawlerState.pickups.push({
                x,
                y,
                kind,
                radius: options.radius || defaultRadius,
                reward: options.reward || null,
                cost: options.cost || 0,
                amount: options.amount || 1,
                char: options.char || defaultChar,
                color: options.color || defaultColor,
                pulse: Math.random() * Math.PI * 2
            });
        }

        function isMatrixCrawlerPointNearDoor(room, x, y, radius = 44) {
            if (!room) return false;
            for (const dir of MATRIX_CRAWLER_DIRS) {
                if (!room.neighbors || !room.neighbors[dir.id]) continue;
                const door = getMatrixCrawlerDoorRect(room, dir.id);
                if (x >= door.x - radius && x <= door.x + door.w + radius && y >= door.y - radius && y <= door.y + door.h + radius) {
                    return true;
                }
            }
            return false;
        }

        function isMatrixCrawlerPointClearOfBreakables(room, x, y, radius = 34) {
            const breakables = (room && room.breakables) || [];
            for (const object of breakables) {
                if (!object || object.destroyed) continue;
                if (Math.hypot(object.x - x, object.y - y) < (object.radius || 18) + radius) return false;
            }
            return true;
        }

        function getMatrixCrawlerBreakablePoint(room, rect, index, total) {
            const centerX = rect.x + rect.w / 2;
            const centerY = rect.y + rect.h / 2;
            for (let attempt = 0; attempt < 40; attempt++) {
                const seed = (room.index || 0) * 157 + index * 73 + total * 19 + attempt * 41;
                const x = rect.x + rect.w * (0.12 + matrixRand(seed) * 0.76);
                const y = rect.y + rect.h * (0.12 + matrixRand(seed + 23) * 0.76);
                if (!isPointInMatrixCrawlerRoom(room, x, y, 38)) continue;
                if (isMatrixCrawlerPointNearDoor(room, x, y, 54)) continue;
                if (Math.hypot(x - centerX, y - centerY) < 86) continue;
                if (!isMatrixCrawlerPointClearOfBreakables(room, x, y, 34)) continue;
                return { x, y };
            }
            return getMatrixCrawlerSafePoint(room, centerX + (index - total / 2) * 42, centerY + 78, 38);
        }

        function getMatrixCrawlerBreakableCount(room) {
            if (!room || room.type === 'boss') return 0;
            const layout = getMatrixCrawlerRoomLayout(room);
            const range = layout.breakables || (room.type === 'start' ? [1, 2] : [2, 5]);
            let min = range[0] || 0;
            let max = range[1] || min;
            if (room.type === 'treasure' || room.type === 'shop') {
                min = Math.max(1, Math.min(min, 2));
                max = Math.max(min, Math.min(max, 4));
            } else if (room.type === 'secret') {
                min = Math.max(min, 4);
                max = Math.max(max, 7);
            }
            const roll = matrixRand((room.index || 0) * 47 + room.x * 13 + room.y * 29 + 9);
            return min + Math.floor(roll * (max - min + 1));
        }

        function spawnMatrixRoomBreakables(room) {
            if (!room || room.breakablesSpawned) return;
            room.breakablesSpawned = true;
            room.breakables = [];
            const rect = getMatrixCrawlerRoomRect(room);
            const count = getMatrixCrawlerBreakableCount(room);
            const chars = ['[]', '{}', '<>', '##'];
            for (let i = 0; i < count; i++) {
                const p = getMatrixCrawlerBreakablePoint(room, rect, i, count);
                const seed = (room.index || 0) * 101 + i * 17 + 3;
                const radius = 15 + matrixRand(seed) * 4;
                room.breakables.push({
                    id: `${room.key}:object:${i}`,
                    x: p.x,
                    y: p.y,
                    radius,
                    hp: 14,
                    maxHp: 14,
                    char: chars[i % chars.length],
                    color: i % 3 === 0 ? '#8ff7ff' : (i % 3 === 1 ? '#41ff93' : '#baff75'),
                    phase: matrixRand(seed + 11) * Math.PI * 2,
                    flashTimer: 0,
                    seed,
                    destroyed: false
                });
            }
            markMatrixCrawlerRoomNavDirty(room);
        }

        function syncMatrixCrawlerRoomBreakables(room = getMatrixCrawlerRoom()) {
            matrixCrawlerState.breakables = ((room && room.breakables) || []).filter(object => object && !object.destroyed);
        }

        function breakMatrixCrawlerObject(object) {
            if (!object || object.destroyed) return;
            object.destroyed = true;
            markMatrixCrawlerRoomNavDirty();
            const rect = getMatrixCrawlerRoomRect();
            for (let i = 0; i < 9; i++) {
                emitMatrixCrawlerParticle(object.x, object.y, i % 2 ? object.color : MATRIX_CRAWLER_COLORS.glow, rect);
            }
            if (Math.random() < 0.24) {
                spawnMatrixPickup(object.x + (Math.random() - 0.5) * 14, object.y - 10, 'coin', {
                    amount: Math.random() < 0.14 ? 2 : 1
                });
            }
            syncMatrixCrawlerRoomBreakables();
        }

        function damageMatrixCrawlerBreakable(object, amount = 1) {
            if (!object || object.destroyed) return;
            object.hp -= amount;
            object.flashTimer = 0.14;
            if (object.hp <= 0) breakMatrixCrawlerObject(object);
        }

        function getMatrixCrawlerProjectileBreakableHit(projectile) {
            const radius = projectile.radius || 5;
            for (const object of matrixCrawlerState.breakables || []) {
                if (!object || object.destroyed) continue;
                if (Math.hypot(object.x - projectile.x, object.y - projectile.y) <= (object.radius || 16) + radius) {
                    return object;
                }
            }
            return null;
        }

        function resolveMatrixCrawlerPlayerBreakableCollision() {
            const hitRadius = getMatrixCrawlerPlayerHitboxRadius() + 4;
            let touched = false;
            for (const object of matrixCrawlerState.breakables || []) {
                if (!object || object.destroyed) continue;
                const minDist = hitRadius + (object.radius || 16);
                let dx = player.x - object.x;
                let dy = player.y - object.y;
                let dist = Math.hypot(dx, dy);
                if (dist <= 0.001) {
                    dx = 1;
                    dy = 0;
                    dist = 1;
                }
                if (dist >= minDist) continue;
                const push = minDist - dist;
                player.x += (dx / dist) * push;
                player.y += (dy / dist) * push;
                touched = true;
            }
            if (touched) {
                const room = getMatrixCrawlerRoom();
                const safe = clampMatrixCrawlerPoint(room, player.x, player.y, 24);
                player.x = safe.x;
                player.y = safe.y;
                player.vx *= 0.18;
                player.vy *= 0.18;
            }
        }

        function spawnMatrixRoomPickups(room) {
            const rect = getMatrixCrawlerRoomRect(room);
            const center = getMatrixCrawlerSafePoint(room, rect.x + rect.w / 2, rect.y + rect.h / 2, 32);
            if (room.rewardSpawned) return;
            room.rewardSpawned = true;
            if (room.type === 'start') return;
            if (room.type === 'boss') {
                const exitPoint = getMatrixCrawlerSafePoint(room, rect.x + rect.w / 2, rect.y + rect.h * 0.58, 34);
                spawnMatrixPickup(exitPoint.x, exitPoint.y, 'exit', {
                    char: 'EXIT',
                    radius: 26,
                    color: MATRIX_CRAWLER_COLORS.glow
                });
                return;
            }
            if (room.type === 'treasure') {
                spawnMatrixPickup(center.x, center.y, 'item', { reward: makeMatrixCrawlerReward('weapon') });
                return;
            }
            if (room.type === 'shop') {
                const left = getMatrixCrawlerSafePoint(room, rect.x + rect.w * 0.38, rect.y + rect.h / 2, 30);
                const right = getMatrixCrawlerSafePoint(room, rect.x + rect.w * 0.62, rect.y + rect.h / 2, 30);
                spawnMatrixPickup(left.x, left.y, 'item', { reward: makeMatrixCrawlerReward(), cost: 5, color: MATRIX_CRAWLER_COLORS.shop });
                spawnMatrixPickup(right.x, right.y, 'item', { reward: makeMatrixCrawlerReward(), cost: 7, color: MATRIX_CRAWLER_COLORS.shop });
                return;
            }
            if (room.type === 'secret') {
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2;
                    const p = getMatrixCrawlerSafePoint(room, center.x + Math.cos(a) * 54, center.y + Math.sin(a) * 40, 22);
                    spawnMatrixPickup(p.x, p.y, 'coin', { amount: 1 });
                }
                room.rewardClaimed = true;
            }
        }

        function enterMatrixCrawlerRoom(key, fromDir = null) {
            const state = matrixCrawlerState;
            const room = state.roomMap.get(key);
            if (!room) return false;
            state.currentKey = key;
            state.discovered.add(key);
            state.cameraReady = false;
            state.projectiles = [];
            state.enemyBullets = [];
            state.enemies = [];
            state.pickups = [];
            state.breakables = [];
            if (room.clear && !room.rewardClaimed) room.rewardSpawned = false;
            state.roomFlash = 0.35;
            const rect = getMatrixCrawlerRoomRect(room);
            let spawnX = rect.x + rect.w / 2;
            let spawnY = rect.y + rect.h / 2;
            if (fromDir === 'N') {
                spawnX = rect.x + rect.w / 2;
                spawnY = rect.bottom - 54;
            } else if (fromDir === 'S') {
                spawnX = rect.x + rect.w / 2;
                spawnY = rect.y + 54;
            } else if (fromDir === 'E') {
                spawnX = rect.x + 54;
                spawnY = rect.y + rect.h / 2;
            } else if (fromDir === 'W') {
                spawnX = rect.right - 54;
                spawnY = rect.y + rect.h / 2;
            }
            const safeSpawn = getMatrixCrawlerSafePoint(room, spawnX, spawnY, 28);
            player.x = safeSpawn.x;
            player.y = safeSpawn.y;
            player.vx = 0;
            player.vy = 0;
            setMatrixCrawlerCameraToPlayer(true);

            if (!room.breakablesSpawned) spawnMatrixRoomBreakables(room);
            syncMatrixCrawlerRoomBreakables(room);

            if (!room.entered) {
                room.entered = true;
                if (room.type === 'combat' || room.type === 'challenge' || room.type === 'boss') {
                    spawnMatrixRoomEnemies(room);
                    room.clear = state.enemies.length === 0;
                }
                if (room.clear) spawnMatrixRoomPickups(room);
            } else if (room.clear) {
                spawnMatrixRoomPickups(room);
            }
            state.message = getMatrixRoomTitle(room);
            state.messageTimer = 1.45;
            return true;
        }

        function getMatrixRoomTitle(room) {
            if (!room) return 'SIM ROOM';
            if (room.type === 'start') return 'WAKE NODE';
            if (room.type === 'treasure') return 'TREASURE CACHE';
            if (room.type === 'shop') return 'CREDIT MARKET';
            if (room.type === 'challenge') return 'PRESSURE TEST';
            if (room.type === 'secret') return 'HIDDEN BUFFER';
            if (room.type === 'boss') return getMatrixCrawlerBossNameForFloor(matrixCrawlerState.floor || 1);
            return `SIM CHAMBER ${String(room.index || 0).padStart(2, '0')}`;
        }

        function getMatrixCrawlerAimVector() {
            let ax = (keys.arrowright ? 1 : 0) - (keys.arrowleft ? 1 : 0);
            let ay = (keys.arrowdown ? 1 : 0) - (keys.arrowup ? 1 : 0);
            if (ax === 0 && ay === 0) return null;
            const len = Math.max(1, Math.hypot(ax, ay));
            return { x: ax / len, y: ay / len };
        }

        function getMatrixCrawlerPlayerAimAngle() {
            if (player && Number.isFinite(player.matrixCrawlerAimAngle)) return player.matrixCrawlerAimAngle;
            return matrixCrawlerState && Number.isFinite(matrixCrawlerState.aimAngle)
                ? matrixCrawlerState.aimAngle
                : PLAYER_FIRE_FORWARD_ANGLE;
        }

        function pushMatrixCrawlerPlayerTurnAfterimage(angle, nextAngle = angle) {
            const state = matrixCrawlerState;
            if (!state.playerTurnAfterimages) state.playerTurnAfterimages = [];
            const turnDir = Math.sign(normalizeAngle(nextAngle - angle)) || 1;
            state.playerTurnAfterimages.push({
                x: player.x,
                y: player.y,
                angle,
                offsetX: Math.cos(angle + Math.PI / 2 * turnDir) * 6,
                offsetY: Math.sin(angle + Math.PI / 2 * turnDir) * 6,
                life: MATRIX_CRAWLER_TURN_AFTERIMAGE_LIFE,
                maxLife: MATRIX_CRAWLER_TURN_AFTERIMAGE_LIFE,
                color: '#8ff7ff'
            });
            if (state.playerTurnAfterimages.length > MATRIX_CRAWLER_TURN_AFTERIMAGE_MAX) {
                state.playerTurnAfterimages.splice(0, state.playerTurnAfterimages.length - MATRIX_CRAWLER_TURN_AFTERIMAGE_MAX);
            }
        }

        function updateMatrixCrawlerAim(dt, aimInput) {
            const state = matrixCrawlerState;
            const currentAim = getMatrixCrawlerPlayerAimAngle();
            state.turnAfterimageCooldown = Math.max(0, (state.turnAfterimageCooldown || 0) - dt);
            if (!aimInput) {
                state.aimAngle = currentAim;
                state.targetAimAngle = currentAim;
                player.matrixCrawlerAimAngle = currentAim;
                player.survivorAimAngle = currentAim;
                player.matrixCrawlerTurning = false;
                return null;
            }

            const targetAim = Math.atan2(aimInput.y, aimInput.x);
            const turnGap = Math.abs(normalizeAngle(targetAim - currentAim));
            const turnBlend = 1 - Math.exp(-MATRIX_CRAWLER_PLAYER_TURN_RESPONSE * dt);
            const nextAim = normalizeAngle(lerpAngle(currentAim, targetAim, turnBlend));
            if (turnGap > 0.14 && state.turnAfterimageCooldown <= 0) {
                pushMatrixCrawlerPlayerTurnAfterimage(currentAim, targetAim);
                state.turnAfterimageCooldown = 0.078;
            }
            state.targetAimAngle = targetAim;
            state.aimAngle = nextAim;
            player.matrixCrawlerAimAngle = nextAim;
            player.survivorAimAngle = nextAim;
            player.matrixCrawlerTurning = Math.abs(normalizeAngle(nextAim - currentAim)) > 0.002;
            return { x: Math.cos(nextAim), y: Math.sin(nextAim), angle: nextAim };
        }

        function getMatrixCrawlerTransformedPlayerPoint(point, angle = getMatrixCrawlerPlayerAimAngle()) {
            const localX = (point.x - player.x) * MATRIX_CRAWLER_PLAYER_RENDER_SCALE;
            const localY = (point.y - player.y) * MATRIX_CRAWLER_PLAYER_RENDER_SCALE;
            const rotation = angle + Math.PI / 2;
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);
            return {
                x: player.x + localX * cos - localY * sin,
                y: player.y + localX * sin + localY * cos
            };
        }

        function getMatrixCrawlerHoverDriveOrigin(angle = getMatrixCrawlerPlayerAimAngle()) {
            const layout = getPlayerRenderLayout(player, 'center');
            const rear = getMatrixCrawlerTransformedPlayerPoint(layout.rearOrigin, angle);
            const aftPush = 5;
            return {
                x: rear.x + Math.cos(angle + Math.PI) * aftPush,
                y: rear.y + Math.sin(angle + Math.PI) * aftPush
            };
        }

        function getMatrixCrawlerHoverThrusterAnchors(angle = getMatrixCrawlerPlayerAimAngle()) {
            const layout = getPlayerRenderLayout(player, 'center');
            const anchors = getPlayerThrusterAnchors(layout);
            return anchors.map(anchor => {
                const p = getMatrixCrawlerTransformedPlayerPoint(anchor, angle);
                return {
                    x: p.x + Math.cos(angle + Math.PI) * 4,
                    y: p.y + Math.sin(angle + Math.PI) * 4
                };
            });
        }

        function getMatrixCrawlerHoverDriveColor(hoverActivation = 0, hot = false) {
            const activation = Math.max(0, Math.min(1, hoverActivation || 0));
            if (hot) return activation > 0.55 ? '#ffffff' : '#dffcff';
            if (activation > 0.68) return '#bffcff';
            if (activation > 0.28) return '#8ff7ff';
            return '#58c9ff';
        }

        function emitMatrixCrawlerHoverRipple(activity = 0, hoverActivation = 0) {
            const state = matrixCrawlerState;
            if (!state.hoverRipples) state.hoverRipples = [];
            const aimAngle = getMatrixCrawlerPlayerAimAngle();
            const origin = getMatrixCrawlerHoverDriveOrigin(aimAngle);
            const angle = Math.random() * Math.PI * 2;
            const activation = Math.max(0, Math.min(1, hoverActivation || 0));
            const ring = 11 + Math.random() * 8 + activity * 4;
            const outwardSpeed = 22 + Math.random() * 30 + activity * 18;
            const swirl = (Math.random() - 0.5) * (18 + activity * 18);
            const drift = 0.035 + activity * 0.035;
            const vx = Math.cos(angle) * outwardSpeed + Math.cos(angle + Math.PI / 2) * swirl + (player.vx || 0) * drift;
            const vy = Math.sin(angle) * outwardSpeed + Math.sin(angle + Math.PI / 2) * swirl + (player.vy || 0) * drift;
            const life = MATRIX_CRAWLER_HOVER_RIPPLE_LIFE + Math.random() * 0.14;
            state.hoverRipples.push({
                x: origin.x + Math.cos(angle) * ring + (Math.random() - 0.5) * 2,
                y: origin.y + Math.sin(angle) * ring * 0.68 + (Math.random() - 0.5) * 2,
                vx,
                vy: vy * 0.72,
                char: MATRIX_CRAWLER_HOVER_CHARS[Math.floor(Math.random() * MATRIX_CRAWLER_HOVER_CHARS.length)],
                life,
                maxLife: life,
                phase: Math.random() * Math.PI * 2,
                size: 8 + Math.random() * 4 + activity * 2,
                rotation: angle - aimAngle + (Math.random() - 0.5) * 0.6,
                alphaScale: 0.62 + Math.random() * 0.20 + activation * 0.28,
                hoverActivation: activation
            });
            if (state.hoverRipples.length > MATRIX_CRAWLER_HOVER_RIPPLE_MAX) {
                state.hoverRipples.splice(0, state.hoverRipples.length - MATRIX_CRAWLER_HOVER_RIPPLE_MAX);
            }
        }

        function emitMatrixCrawlerHoverThruster(activity = 0, hoverActivation = 0) {
            const state = matrixCrawlerState;
            if (!state.hoverThrusters) state.hoverThrusters = [];
            const aimAngle = getMatrixCrawlerPlayerAimAngle();
            const anchors = getMatrixCrawlerHoverThrusterAnchors(aimAngle);
            const exhaustAngle = aimAngle + Math.PI;
            const activation = Math.max(0, Math.min(1, hoverActivation || 0));
            const chars = typeof EXHAUST_PARTICLE_CHARS !== 'undefined' ? EXHAUST_PARTICLE_CHARS : MATRIX_CRAWLER_HOVER_CHARS;
            for (let i = 0; i < anchors.length; i++) {
                if (i > 0 && Math.random() > 0.62 + activity * 0.20) continue;
                const anchor = anchors[i];
                const spread = (Math.random() - 0.5) * (0.46 - activity * 0.12);
                const speed = 38 + Math.random() * 44 + activity * 28;
                const life = 0.22 + Math.random() * 0.12 + activity * 0.04;
                state.hoverThrusters.push({
                    x: anchor.x + (Math.random() - 0.5) * 2.8,
                    y: anchor.y + (Math.random() - 0.5) * 2.8,
                    vx: Math.cos(exhaustAngle + spread) * speed + (player.vx || 0) * 0.045,
                    vy: Math.sin(exhaustAngle + spread) * speed + (player.vy || 0) * 0.045,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    life,
                    maxLife: life,
                    size: 6.5 + Math.random() * 3 + activity * 1.5,
                    activation,
                    phase: Math.random() * Math.PI * 2
                });
            }
            if (state.hoverThrusters.length > MATRIX_CRAWLER_HOVER_THRUSTER_MAX) {
                state.hoverThrusters.splice(0, state.hoverThrusters.length - MATRIX_CRAWLER_HOVER_THRUSTER_MAX);
            }
        }

        function updateMatrixCrawlerHoverRipples(dt) {
            const state = matrixCrawlerState;
            const speed = Math.hypot(player.vx || 0, player.vy || 0);
            const moving = Math.min(1, speed / 260);
            const hoverActivation = Math.max(0, Math.min(1, (speed - 28) / 210));
            const turning = player.matrixCrawlerTurning ? 0.45 : 0;
            const activity = Math.min(1, 0.22 + moving * 0.42 + turning);
            const interval = 0.060 - activity * 0.016;
            state.hoverEmitter = (state.hoverEmitter || 0) + dt;
            let emitted = 0;
            const burstCount = moving > 0.3 || turning > 0 ? 2 : 1;
            while (state.hoverEmitter >= interval && emitted < 3) {
                state.hoverEmitter -= interval;
                for (let i = 0; i < burstCount; i++) emitMatrixCrawlerHoverRipple(activity, hoverActivation);
                emitted++;
            }

            const ripples = state.hoverRipples || [];
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                r.x += (r.vx || 0) * dt;
                r.y += (r.vy || 0) * dt;
                r.vx *= Math.pow(0.62, dt);
                r.vy *= Math.pow(0.62, dt);
                r.life -= dt;
                if (r.life <= 0) ripples.splice(i, 1);
            }

            state.hoverThrusterEmitter = (state.hoverThrusterEmitter || 0) + dt;
            const thrusterInterval = 0.070 - activity * 0.024;
            let thrusterEmitted = 0;
            while (state.hoverThrusterEmitter >= thrusterInterval && thrusterEmitted < 2) {
                state.hoverThrusterEmitter -= thrusterInterval;
                emitMatrixCrawlerHoverThruster(activity, hoverActivation);
                thrusterEmitted++;
            }

            const thrusters = state.hoverThrusters || [];
            for (let i = thrusters.length - 1; i >= 0; i--) {
                const t = thrusters[i];
                t.x += (t.vx || 0) * dt;
                t.y += (t.vy || 0) * dt;
                t.vx *= Math.pow(0.20, dt);
                t.vy *= Math.pow(0.20, dt);
                t.life -= dt * (2.25 + (t.activation || 0) * 0.45);
                if (t.life <= 0) thrusters.splice(i, 1);
            }
        }

        function getMatrixCrawlerWeaponOrigin(angle, isRear = false) {
            const layout = getPlayerRenderLayout(player, 'center');
            const origin = isRear ? layout.rearOrigin : layout.weaponOrigin;
            return getMatrixCrawlerTransformedPlayerPoint(origin, angle);
        }

        function getMatrixCrawlerPlayerHitboxRadius() {
            const specterScale = typeof getPlayerSpecterHitboxScale === 'function' ? getPlayerSpecterHitboxScale() : 1;
            const statScale = typeof getPlayerHitboxScale === 'function' ? getPlayerHitboxScale() : 1;
            return 12 * specterScale * statScale;
        }

        function fireMatrixCrawlerShot(aim) {
            const stats = player.weaponStats || createBaseWeaponStats();
            const totalFireRateBonus = (player.modifiers.fireRate || 0) + Math.min(0.55, (player.modifiers.momentumFireRate || 0) * 0.35);
            const interval = getClampedPlayerFireInterval((player.fireRate / ((stats.fireRateMult || 1) * MATRIX_CRAWLER_FIRE_RATE_MULT)) / (1 + totalFireRateBonus)) / 1000;
            if (matrixCrawlerState.fireCooldown > 0 || !aim) return;
            matrixCrawlerState.fireCooldown = interval;
            const baseAngle = Math.atan2(aim.y, aim.x);
            const angles = typeof getFirePatternAngles === 'function'
                ? getFirePatternAngles(stats, baseAngle, false)
                : [baseAngle];
            const damage = Math.max(4, (10 * (stats.damageMult || 1) + (player.modifiers.laserDamage || 0)) * getPlayerDamageScale());
            const speed = 1400 * MATRIX_CRAWLER_LASER_SPEED_MULT * MATRIX_CRAWLER_BULLET_SPEED_MULT * (stats.speedMult || 1);
            const size = Math.max(0.65, stats.sizeMult || 1);
            const glyph = stats.lightningBall || stats.plasmaCloud ? '' : (stats.miniTorpedo ? 'o' : '|');
            for (let i = 0; i < angles.length; i++) {
                const a = angles[i] + ((stats.inaccuracy || 0) * (Math.random() - 0.5));
                const origin = getMatrixCrawlerWeaponOrigin(a, false);
                const vx = Math.cos(a) * speed;
                const vy = Math.sin(a) * speed;
                matrixCrawlerState.projectiles.push({
                    x: origin.x,
                    y: origin.y,
                    vx,
                    vy,
                    baseVx: vx,
                    baseVy: vy,
                    startX: origin.x,
                    startY: origin.y,
                    baseAngle: a,
                    damage,
                    life: stats.plasmaCloud ? 1.6 : 0.92,
                    maxLife: stats.plasmaCloud ? 1.6 : 0.92,
                    age: 0,
                    radius: 8.5 * size,
                    pierce: Math.max(0, Math.round(stats.pierceCount || 0)),
                    ricochet: Math.max(0, Math.round(stats.ricochetCount || 0)),
                    splash: stats.splashRadius || (stats.miniTorpedo ? 1.15 : 0),
                    chain: stats.chainCount || 0,
                    homing: !!stats.homing,
                    pathFunction: stats.pathFunction,
                    sinePhase: Math.random() * Math.PI * 2,
                    color: stats.lightningBall ? '#8ff7ff' : (stats.miniTorpedo ? '#ffb347' : '#ffffff'),
                    char: glyph,
                    sprite: glyph,
                    stats: { ...stats },
                    visualSeed: Math.random() * 1000,
                    isMiniTorpedo: !!stats.miniTorpedo,
                    isMatrixLaserProjectile: !stats.lightningBall && !stats.miniTorpedo && !stats.plasmaCloud
                });
            }
            if (matrixCrawlerState.projectiles.length > 150) matrixCrawlerState.projectiles.splice(0, matrixCrawlerState.projectiles.length - 150);
        }

        function triggerMatrixCrawlerTorpedoExplosion(projectile, x = projectile.x, y = projectile.y) {
            if (!projectile) return;
            const stats = projectile.stats || {};
            const radius = Math.max(34, stats.torpedoExplosionRadius || (projectile.splash || 1.15) * 24);
            const damage = Math.max(1, (projectile.damage || 10) * (stats.torpedoExplosionDamageMult || 0.85));
            const color = projectile.color || '#ffb347';
            const rect = getMatrixCrawlerRoomRect();
            matrixCrawlerState.roomFlash = Math.max(matrixCrawlerState.roomFlash || 0, 0.12);

            for (const enemy of matrixCrawlerState.enemies) {
                if (!enemy || enemy.dead) continue;
                const d = Math.hypot(enemy.x - x, enemy.y - y);
                if (d > radius + (enemy.radius || 0)) continue;
                if (enemy.isShielded || enemy.phase === 'INTRO') {
                    enemy.flashTimer = Math.max(enemy.flashTimer || 0, 0.08);
                    continue;
                }
                const falloff = 1 - Math.min(1, d / Math.max(1, radius)) * 0.45;
                enemy.hp -= damage * falloff;
                enemy.flashTimer = Math.max(enemy.flashTimer || 0, 0.12);
                if (enemy.hp <= 0) killMatrixEnemy(enemy);
            }

            const sparkCount = Math.min(MATRIX_CRAWLER_TORPEDO_SPARK_CAP, Math.max(12, Math.round(radius / 3.2)));
            const chars = ['*', '+', '.', 'o'];
            for (let i = 0; i < sparkCount; i++) {
                const a = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.24;
                const ring = radius * (0.38 + Math.random() * 0.52);
                const px = x + Math.cos(a) * ring;
                const py = y + Math.sin(a) * ring;
                const speed = 55 + Math.random() * 155;
                matrixCrawlerState.particles.push({
                    x: px,
                    y: py,
                    vx: Math.cos(a) * speed,
                    vy: Math.sin(a) * speed,
                    life: 0.26 + Math.random() * 0.28,
                    maxLife: 0.58,
                    color: i % 4 === 0 ? '#fff1a8' : (i % 3 === 0 ? '#ff5f57' : color),
                    char: chars[i % chars.length],
                    rect
                });
            }
            if (matrixCrawlerState.particles.length > 520) {
                matrixCrawlerState.particles.splice(0, matrixCrawlerState.particles.length - 520);
            }
        }

        function spawnMatrixCrawlerBombExplosion(x, y) {
            const radius = BOMB_EXPLOSION_RADIUS * (1 + (player.modifiers.bombRadius || 0));
            const damageScale = typeof getPlayerDamageScale === 'function' ? getPlayerDamageScale() : 1;
            const damage = BOMB_EXPLOSION_DAMAGE * (1 + (player.modifiers.bombDamage || 0)) * damageScale;
            const shrapnelDamage = BOMB_SHRAPNEL_DAMAGE * (1 + (player.modifiers.bombDamage || 0) * 0.5) * damageScale;
            const rect = getMatrixCrawlerRoomRect();
            matrixCrawlerState.roomFlash = Math.max(matrixCrawlerState.roomFlash || 0, 0.34);
            addShake(14 + radius * 0.035);

            for (const enemy of matrixCrawlerState.enemies) {
                if (!enemy || enemy.dead) continue;
                const d = Math.hypot(enemy.x - x, enemy.y - y);
                if (d > radius + (enemy.radius || 0)) continue;
                if (enemy.isShielded || enemy.phase === 'INTRO') {
                    enemy.flashTimer = Math.max(enemy.flashTimer || 0, 0.08);
                    continue;
                }
                const falloff = 1 - Math.min(1, d / Math.max(1, radius)) * 0.35;
                enemy.hp -= damage * falloff;
                enemy.flashTimer = Math.max(enemy.flashTimer || 0, 0.16);
                if (enemy.hp <= 0) killMatrixEnemy(enemy);
            }
            for (const object of matrixCrawlerState.breakables || []) {
                if (!object || object.destroyed) continue;
                const d = Math.hypot(object.x - x, object.y - y);
                if (d > radius + (object.radius || 0)) continue;
                const falloff = 1 - Math.min(1, d / Math.max(1, radius)) * 0.25;
                damageMatrixCrawlerBreakable(object, damage * falloff);
            }

            const ringConfigs = [
                { color: '#8ff7ff', maxRadius: radius * 0.88, maxLife: 0.32, lineWidth: 4, shadowBlur: 12, glyph: 'O' },
                { color: '#4fb6ff', maxRadius: radius * 1.12, maxLife: 0.46, lineWidth: 2.5, shadowBlur: 10, glyph: 'O' },
                { color: '#eaa4ff', maxRadius: radius * 1.34, maxLife: 0.56, lineWidth: 1.8, shadowBlur: 8, glyph: 'O' }
            ];
            for (const ring of ringConfigs) {
                bombBlastRings.push({ x, y, life: 0, isMatrixCrawlerRing: true, ...ring });
            }

            const chars = ['*', '+', '.', '0', '1'];
            const colors = ['#ffffff', '#8ff7ff', '#56a6ff', '#d986ff'];
            for (let i = 0; i < 28; i++) {
                const a = Math.random() * Math.PI * 2;
                const speed = 110 + Math.random() * 430;
                matrixCrawlerState.particles.push({
                    x,
                    y,
                    vx: Math.cos(a) * speed,
                    vy: Math.sin(a) * speed,
                    life: 0.34 + Math.random() * 0.34,
                    maxLife: 0.68,
                    color: colors[i % colors.length],
                    char: chars[i % chars.length],
                    rect
                });
            }

            const shrapnelStats = typeof BOMB_SHRAPNEL_STATS !== 'undefined'
                ? { ...BOMB_SHRAPNEL_STATS }
                : { ...createBaseWeaponStats(), sizeMult: 0.72 };
            for (let i = 0; i < MATRIX_CRAWLER_BOMB_SHRAPNEL_COUNT; i++) {
                const a = (Math.PI * 2 * i) / MATRIX_CRAWLER_BOMB_SHRAPNEL_COUNT + (Math.random() - 0.5) * 0.22;
                const speed = BOMB_SHRAPNEL_SPEED_MIN + Math.random() * (BOMB_SHRAPNEL_SPEED_MAX - BOMB_SHRAPNEL_SPEED_MIN);
                matrixCrawlerState.projectiles.push({
                    x,
                    y,
                    vx: Math.cos(a) * speed,
                    vy: Math.sin(a) * speed,
                    baseVx: Math.cos(a) * speed,
                    baseVy: Math.sin(a) * speed,
                    startX: x,
                    startY: y,
                    baseAngle: a,
                    damage: shrapnelDamage,
                    life: BOMB_SHRAPNEL_LIFE,
                    maxLife: BOMB_SHRAPNEL_LIFE,
                    age: 0,
                    radius: 5.5,
                    pierce: 0,
                    ricochet: 0,
                    splash: 0,
                    chain: 0,
                    color: i % 3 === 0 ? '#fff4bc' : (i % 2 === 0 ? '#a7f4ff' : '#c58dff'),
                    char: i % 2 === 0 ? '.' : '*',
                    sprite: i % 2 === 0 ? '.' : '*',
                    stats: shrapnelStats,
                    isBombShrapnel: true
                });
            }
        }

        function getMatrixCrawlerBombCooldownTotal() {
            return typeof getPlayerBombCooldownTotal === 'function'
                ? getPlayerBombCooldownTotal()
                : (player.bombCooldown || BOMB_BASE_COOLDOWN);
        }

        function hasActiveMatrixCrawlerBomb() {
            return bombProjectiles.some(bomb => bomb && bomb.isMatrixCrawlerBomb);
        }

        function setMatrixCrawlerBombLoaded(loaded) {
            player.bombTimer = loaded ? 0 : getMatrixCrawlerBombCooldownTotal();
        }

        function fireMatrixCrawlerBomb() {
            if (player.bombTimer > 0 || postResumeBombLockTimer > 0 || hasActiveMatrixCrawlerBomb()) return;
            const angle = getMatrixCrawlerPlayerAimAngle();
            const origin = getMatrixCrawlerWeaponOrigin(angle, false);
            const indicatorVisual = typeof getPlayerBombIndicatorVisual === 'function'
                ? getPlayerBombIndicatorVisual()
                : { color: '#8ff7ff' };
            setMatrixCrawlerBombLoaded(false);
            if (typeof recordRunBombUsed === 'function') recordRunBombUsed();
            const speed = BOMB_GRENADE_SPEED * MATRIX_CRAWLER_BOMB_SPEED_MULT;
            bombProjectiles.push({
                x: origin.x,
                y: origin.y,
                startX: origin.x,
                startY: origin.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                angle,
                distance: 0,
                maxDistance: BOMB_GRENADE_RANGE * MATRIX_CRAWLER_BOMB_RANGE_MULT,
                pulse: Math.random() * Math.PI * 2,
                age: 0,
                launchColor: indicatorVisual.color || '#8ff7ff',
                launchColorDuration: 0.5,
                isMatrixCrawlerBomb: true,
                justFired: true
            });
            addShake(8);
        }

        function damageMatrixEnemy(enemy, amount, source = null) {
            if (!enemy || enemy.dead) return;
            if (enemy.isShielded || enemy.phase === 'INTRO') {
                enemy.flashTimer = 0.08;
                return;
            }
            enemy.hp -= amount;
            enemy.flashTimer = 0.12;
            if (source && source.splash > 0) {
                const rect = getMatrixCrawlerRoomRect();
                const radius = source.splash * 24;
                for (const other of matrixCrawlerState.enemies) {
                    if (other === enemy || other.dead) continue;
                    const d = Math.hypot(other.x - enemy.x, other.y - enemy.y);
                    if (d <= radius) {
                        other.hp -= amount * 0.42;
                        other.flashTimer = 0.10;
                    }
                }
                for (let i = 0; i < 8; i++) emitMatrixCrawlerParticle(enemy.x, enemy.y, source.color || MATRIX_CRAWLER_COLORS.glow, rect);
            }
            if (source && source.chain > 0) {
                let nearest = null;
                let best = 120 * 120;
                for (const other of matrixCrawlerState.enemies) {
                    if (other === enemy || other.dead) continue;
                    const dSq = (other.x - enemy.x) ** 2 + (other.y - enemy.y) ** 2;
                    if (dSq < best) {
                        best = dSq;
                        nearest = other;
                    }
                }
                if (nearest) {
                    nearest.hp -= amount * 0.35;
                    nearest.flashTimer = 0.12;
                }
            }
            if (enemy.hp <= 0) killMatrixEnemy(enemy);
        }

        function getMatrixCrawlerBombDropChance(enemy) {
            if (!enemy || enemy.type === 'nullPhantom' || enemy.type === 'distortedGlitch') return 0;
            let chance = 0.045;
            if (enemy.type === 'miniboss' || enemy.visualKind === 'elite') {
                chance = 0.42;
            } else if (enemy.type === 'firewallHost') {
                chance = 0.18;
            } else if (enemy.type === 'crashBug' || enemy.type === 'portSentry') {
                chance = 0.13;
            } else if (enemy.type === 'orbit' || enemy.type === 'turret') {
                chance = 0.10;
            } else if (enemy.type === 'bug') {
                chance = 0.055;
            }
            const bombIsLoaded = player.bombTimer <= 0;
            return Math.max(0.015, chance * (bombIsLoaded ? 0.42 : 1.35));
        }

        function maybeDropMatrixCrawlerBombPickup(enemy, rect) {
            const chance = getMatrixCrawlerBombDropChance(enemy);
            if (chance <= 0 || Math.random() >= chance) return false;
            const jitterX = (Math.random() - 0.5) * 28;
            const jitterY = -14 + (Math.random() - 0.5) * 18;
            spawnMatrixPickup(enemy.x + jitterX, enemy.y + jitterY, 'bomb', {
                char: 'B',
                color: MATRIX_CRAWLER_BOMB_PICKUP_COLOR
            });
            for (let i = 0; i < 6; i++) {
                emitMatrixCrawlerParticle(enemy.x, enemy.y, MATRIX_CRAWLER_BOMB_PICKUP_COLOR, rect);
            }
            return true;
        }

        function killMatrixEnemy(enemy) {
            if (!enemy || enemy.dead) return;
            enemy.dead = true;
            addScore(enemy.score || 20);
            if (typeof recordRunEnemyKilled === 'function') recordRunEnemyKilled(enemy);
            if (player.modifiers.killHeal > 0) {
                player.hp = Math.min(player.maxHp, player.hp + player.maxHp * player.modifiers.killHeal);
            }
            const rect = getMatrixCrawlerRoomRect();
            for (let i = 0; i < (enemy.type === 'hydra' ? 28 : enemy.type === 'miniboss' ? 14 : 7); i++) {
                emitMatrixCrawlerParticle(enemy.x, enemy.y, enemy.color || MATRIX_CRAWLER_COLORS.glow, rect);
            }
            if (enemy.type === 'nullPhantom') {
                stopMatrixCrawlerBossMusic();
                emitMatrixBossBurst(enemy, '#ff69ff', 32, ['x', '✧', '.', '0']);
            }
            if (enemy.type === 'distortedGlitch') {
                stopMatrixCrawlerBossMusic();
                emitMatrixBossBurst(enemy, '#00ff41', 42, getMatrixGlitchChars());
            }
            if (Math.random() < (enemy.type === 'hydra' ? 1 : enemy.type === 'miniboss' ? 0.75 : 0.20)) {
                spawnMatrixPickup(enemy.x, enemy.y, 'coin', { amount: enemy.type === 'hydra' ? 5 : enemy.type === 'miniboss' ? 3 : 1 });
            }
            maybeDropMatrixCrawlerBombPickup(enemy, rect);
        }

        function emitMatrixCrawlerParticle(x, y, color, rect = getMatrixCrawlerRoomRect()) {
            const a = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 150;
            matrixCrawlerState.particles.push({
                x,
                y,
                vx: Math.cos(a) * speed,
                vy: Math.sin(a) * speed,
                life: 0.28 + Math.random() * 0.34,
                maxLife: 0.62,
                color,
                char: Math.random() < 0.5 ? '1' : '0',
                rect
            });
        }

        function fireMatrixEnemyBullet(x, y, angle, speed, options = {}) {
            if (matrixCrawlerState.enemyBullets.length >= MATRIX_GLITCH_BULLET_CAP) return false;
            const baseRadius = options.radius || 6;
            const isBossBullet = !!(options.isPhantomBullet || options.isGlitchBullet);
            matrixCrawlerState.enemyBullets.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                baseVx: Math.cos(angle) * speed,
                baseVy: Math.sin(angle) * speed,
                radius: baseRadius,
                visualRadius: options.visualRadius || baseRadius * (isBossBullet ? 1 : MATRIX_CRAWLER_BASIC_BULLET_VISUAL_SCALE),
                char: options.char || '.',
                color: options.color || MATRIX_CRAWLER_COLORS.danger,
                life: options.life || 4,
                maxLife: options.life || 4,
                turn: options.turn || 0,
                turnRate: options.turnRate || 0,
                speed,
                decay: options.decay || 0,
                damage: options.damage || 9,
                hitboxScale: options.hitboxScale || 1,
                isHuge: !!options.isHuge,
                isPhantomBullet: !!options.isPhantomBullet,
                phantomBulletType: options.phantomBulletType || null,
                isGlitchBullet: !!options.isGlitchBullet,
                isCodeLine: !!options.isCodeLine,
                isMatrixRainColumn: !!options.isMatrixRainColumn,
                matrixGlyphGap: options.matrixGlyphGap,
                matrixTrailAlpha: options.matrixTrailAlpha,
                morphTimer: options.morphTimer || 0
            });
            return true;
        }

        function beginMatrixCrawlerProjectileDissolve(projectile, options = {}) {
            if (!projectile || projectile.isDissolvingProjectile) return false;
            const stats = projectile.stats || {};
            if (stats.miniTorpedo || projectile.isMiniTorpedo) return false;
            if (typeof beginProjectileLifetimeDissolve !== 'function') return false;
            return beginProjectileLifetimeDissolve(projectile, {
                char: projectile.sprite || projectile.char || '|',
                color: projectile.color || '#ffffff',
                scale: stats.sizeMult || 1,
                velocityScale: Number.isFinite(options.velocityScale) ? options.velocityScale : 0.12,
                duration: options.duration || 0.34
            });
        }

        function beginMatrixCrawlerEnemyBulletDissolve(bullet, options = {}) {
            if (!bullet || bullet.isDissolvingProjectile) return false;
            if (typeof beginProjectileLifetimeDissolve !== 'function') return false;
            return beginProjectileLifetimeDissolve(bullet, {
                char: bullet.dissolveChar || bullet.char || (bullet.isPhantomBullet ? 'x' : (bullet.isGlitchBullet ? '1' : '.')),
                color: bullet.dissolveColor || bullet.color || (bullet.isPhantomBullet ? '#ff60ff' : (bullet.isGlitchBullet ? '#00ff41' : MATRIX_CRAWLER_COLORS.danger)),
                scale: Number.isFinite(options.scale) ? options.scale : (bullet.isHuge ? 0.58 : 1),
                velocityScale: Number.isFinite(options.velocityScale) ? options.velocityScale : 0.10,
                duration: options.duration || (bullet.isPhantomBullet ? 0.38 : (bullet.isGlitchBullet ? 0.42 : 0.34))
            });
        }

        function updateMatrixNullPhantomFireOrigin(source) {
            if (!source) return { x: 0, y: 0 };
            source.phantomFireX = source.x;
            source.phantomFireY = source.y;
            return { x: source.x, y: source.y };
        }

        function easeMatrixBossIntro(t) {
            const x = Math.max(0, Math.min(1, t || 0));
            return 1 - Math.pow(1 - x, 2.35);
        }

        function smoothMatrixIntroStep(t) {
            const x = Math.max(0, Math.min(1, t || 0));
            return x * x * (3 - x * 2);
        }

        function getMatrixBossIntroDepth(progress) {
            const clamped = Math.max(0, Math.min(1, progress || 0));
            const eased = 1 - Math.pow(1 - clamped, 2.08);
            const depthSurge = Math.sin(clamped * Math.PI) * 0.012;
            return Math.max(0.035, Math.min(1, 0.035 + (eased + depthSurge) * 0.965));
        }

        function getMatrixBossIntroLayerSlot(depth) {
            if (depth < 0.18) return 0;
            if (depth < 0.44) return 1;
            if (depth < 0.74) return 2;
            return 3;
        }

        function activateMatrixNullPhantomBoss(source) {
            if (!source || source.phase !== 'INTRO') return;
            source.phase = 'ACTIVE';
            source.timer = 0;
            source.introAlpha = 1;
            source.introDropReady = true;
            source.x = source.introTargetX ?? source.x;
            source.y = source.introTargetY ?? source.y;
            source.startX = source.x;
            source.startY = source.y;
            source.vx = 0;
            source.vy = 0;
            source.isShielded = false;
            source.isVulnerable = true;
            source.phantomPattern = 0;
            source.phantomPatternTimer = 0;
            source.phantomPatternFireTimer = 0.08;
            emitMatrixBossBurst(source, source.color || '#ff60ff', 18, ['░', '▒', '▓', '.']);
            addShake(18);
        }

        function emitMatrixBossBurst(source, color, count, chars) {
            const rect = getMatrixCrawlerRoomRect();
            const glyphs = chars && chars.length ? chars : ['*', '+', '.'];
            for (let i = 0; i < Math.min(count || 12, 52); i++) {
                const a = Math.random() * Math.PI * 2;
                const d = 18 + Math.random() * 78;
                matrixCrawlerState.particles.push({
                    x: source.x + Math.cos(a) * d,
                    y: source.y + Math.sin(a) * d,
                    vx: Math.cos(a) * (60 + Math.random() * 150),
                    vy: Math.sin(a) * (60 + Math.random() * 150),
                    char: glyphs[i % glyphs.length],
                    color: i % 4 === 0 ? '#ffffff' : color,
                    life: 0.26 + Math.random() * 0.34,
                    maxLife: 0.62,
                    rect
                });
            }
        }

        function updateMatrixNullPhantomIntro(source, hostileDt) {
            const duration = Math.max(0.001, source.introDuration || 4);
            const nextTimer = Math.min(duration, (source.timer || 0) + hostileDt);
            const progress = nextTimer / duration;
            source.timer = nextTimer;
            source.introAlpha = Math.min(1, easeMatrixBossIntro(Math.max(0, progress / 0.20)));
            source.introDepth = getMatrixBossIntroDepth(progress);
            const layerSlot = getMatrixBossIntroLayerSlot(source.introDepth);
            source.x = source.introTargetX ?? source.x;
            source.y = source.introTargetY ?? source.y;
            source.vx = 0;
            source.vy = 0;
            source.isVulnerable = false;
            source.isShielded = true;
            matrixCrawlerState.invuln = Math.max(matrixCrawlerState.invuln || 0, duration - nextTimer + 0.45);
            player.flashTimer = Math.max(player.flashTimer || 0, 0.08);
            matrixCrawlerState.enemyBullets.length = 0;
            if (layerSlot > (source.introLayerPulse || 0)) {
                source.introLayerPulse = layerSlot;
                addShake(0.8 + layerSlot * 0.45);
            }
            if (progress > 0.18 && Math.random() < hostileDt * 14) {
                emitMatrixCrawlerParticle(source.x, source.y, '#cbd5e2');
            }
            if (nextTimer >= duration) activateMatrixNullPhantomBoss(source);
        }

        function fireMatrixNullPhantomBullet(source, angle, speed, type = 'rift', options = {}) {
            const origin = updateMatrixNullPhantomFireOrigin(source);
            fireMatrixEnemyBullet(origin.x, origin.y, angle, speed, {
                char: 'x',
                color: options.color || '#ff60ff',
                life: options.life || 4.8,
                radius: options.radius || 7,
                isPhantomBullet: true,
                phantomBulletType: type,
                hitboxScale: options.hitboxScale || 0.72
            });
        }

        function fireMatrixNullPhantomNeedle(source) {
            const origin = updateMatrixNullPhantomFireOrigin(source);
            const aim = Math.atan2(player.y - origin.y, player.x - origin.x);
            fireMatrixNullPhantomBullet(source, aim, MATRIX_NULL_PHANTOM_NEEDLE_SPEED, 'needle', {
                life: 4.2,
                hitboxScale: 0.68,
                color: '#ff4cff',
                radius: 6
            });
        }

        function fireMatrixNullPhantomRing(source) {
            const offset = ((matrixCrawlerState.runStartedAt || 0) * 0.00045 + source.phantomPatternTimer * 0.18) % (Math.PI * 2);
            for (let i = 0; i < 18; i++) {
                const a = offset + (i / 18) * Math.PI * 2;
                fireMatrixNullPhantomBullet(source, a, MATRIX_NULL_PHANTOM_RING_SPEED, 'rift', {
                    life: 4.15,
                    hitboxScale: 0.7,
                    color: '#ff69ff'
                });
            }
        }

        function fireMatrixNullPhantomSpiral(source) {
            source.spiralAngle = (source.spiralAngle || 0) + 0.3;
            fireMatrixNullPhantomBullet(source, source.spiralAngle, MATRIX_NULL_PHANTOM_SPIRAL_SPEED, 'rift', {
                life: 4.5,
                hitboxScale: 0.68,
                color: '#ff77ff'
            });
        }

        function fireMatrixNullPhantomFan(source) {
            const origin = updateMatrixNullPhantomFireOrigin(source);
            const aim = Math.atan2(player.y - origin.y, player.x - origin.x);
            const count = 7;
            const half = (count - 1) / 2;
            for (let i = 0; i < count; i++) {
                const offset = i - half;
                fireMatrixNullPhantomBullet(source, aim + offset * 0.18, MATRIX_NULL_PHANTOM_FAN_SPEED - Math.abs(offset) * 7, 'rift', {
                    life: 4.6,
                    hitboxScale: 0.7,
                    color: Math.abs(offset) < 0.1 ? '#ffffff' : '#c9bcff'
                });
            }
        }

        function updateMatrixNullPhantomBoss(source, hostileDt, room) {
            source.age = (source.age || 0) + hostileDt;
            source.flashTimer = Math.max(0, (source.flashTimer || 0) - hostileDt);
            if (source.phase === 'INTRO') {
                updateMatrixNullPhantomIntro(source, hostileDt);
                return;
            }

            const rect = getMatrixCrawlerRoomRect(room);
            const driftX = Math.sin(source.age * 0.72 + source.orbitSeed) * (source.orbitRadiusX || 210);
            const driftY = Math.cos(source.age * 0.58 + source.orbitSeed * 0.7) * (source.orbitRadiusY || 155) * 0.34;
            const targetX = Math.max(rect.x + source.radius + 20, Math.min(rect.right - source.radius - 20, player.x + driftX));
            const targetY = Math.max(rect.y + source.radius + 20, Math.min(rect.bottom - source.radius - 20, player.y - 170 + driftY));
            source.vx += (targetX - source.x) * hostileDt * (source.steerStrength || 0.28);
            source.vy += (targetY - source.y) * hostileDt * (source.steerStrength || 0.28);
            source.vx *= Math.pow(0.86, hostileDt * 60);
            source.vy *= Math.pow(0.86, hostileDt * 60);
            const moved = moveMatrixCrawlerBodyInRoom(room, source.x, source.y, source.x + source.vx * hostileDt, source.y + source.vy * hostileDt, source.radius + 8);
            source.x = moved.x;
            source.y = moved.y;
            updateMatrixNullPhantomFireOrigin(source);

            source.phantomBurstTimer = (source.phantomBurstTimer || 0) + hostileDt;
            if (source.phantomBurstTimer >= MATRIX_NULL_PHANTOM_NEEDLE_INTERVAL) {
                source.phantomBurstTimer %= MATRIX_NULL_PHANTOM_NEEDLE_INTERVAL;
                source.phantomBurstCount = 3;
                source.phantomBurstDelay = 0;
            }
            if ((source.phantomBurstCount || 0) > 0) {
                source.phantomBurstDelay = (source.phantomBurstDelay || 0) - hostileDt;
                if (source.phantomBurstDelay <= 0) {
                    source.phantomBurstDelay = MATRIX_NULL_PHANTOM_NEEDLE_DELAY;
                    source.phantomBurstCount--;
                    fireMatrixNullPhantomNeedle(source);
                }
            }

            source.phantomPatternTimer = (source.phantomPatternTimer || 0) + hostileDt;
            if (source.phantomPatternTimer >= MATRIX_NULL_PHANTOM_PATTERN_DURATION) {
                source.phantomPatternTimer %= MATRIX_NULL_PHANTOM_PATTERN_DURATION;
                source.phantomPattern = ((source.phantomPattern || 0) + 1) % 3;
                source.phantomPatternFireTimer = 0.08;
                if (source.phantomPattern === 1 && !Number.isFinite(source.spiralAngle)) {
                    source.spiralAngle = Math.atan2(player.y - source.y, player.x - source.x);
                }
            }

            source.phantomPatternFireTimer = (source.phantomPatternFireTimer || 0) - hostileDt;
            const pattern = source.phantomPattern || 0;
            if (pattern === 0 && source.phantomPatternFireTimer <= 0) {
                fireMatrixNullPhantomRing(source);
                source.phantomPatternFireTimer = 1.0;
            } else if (pattern === 1 && source.phantomPatternFireTimer <= 0) {
                fireMatrixNullPhantomSpiral(source);
                source.phantomPatternFireTimer = 0.11;
            } else if (pattern === 2 && source.phantomPatternFireTimer <= 0) {
                fireMatrixNullPhantomFan(source);
                source.phantomPatternFireTimer = 0.75;
            }
        }

        function activateMatrixDistortedGlitchBoss(source) {
            if (!source || source.phase !== 'INTRO') return;
            source.phase = 'ACTIVE';
            source.timer = 0;
            source.introAlpha = 1;
            source.introDropReady = true;
            source.x = source.introTargetX ?? source.x;
            source.y = source.introTargetY ?? source.y;
            source.startX = source.x;
            source.startY = source.y;
            source.vx = 0;
            source.vy = 0;
            source.glitchVx = 0;
            source.glitchVy = 0;
            source.isShielded = false;
            source.isVulnerable = true;
            source.color = '#ff00ff';
            source.matrixRainTimer = 1.15;
            source.glitchTearTimer = 999;
            source.attackTimer = 0.55;
            emitMatrixBossBurst(source, source.color || '#ff00ff', 18, ['░', '▒', '▓', '.']);
            addShake(18);
        }

        function updateMatrixDistortedGlitchIntro(source, hostileDt) {
            const duration = Math.max(0.001, source.introDuration || 4);
            const nextTimer = Math.min(duration, (source.timer || 0) + hostileDt);
            const progress = nextTimer / duration;
            source.timer = nextTimer;
            source.introAlpha = Math.min(1, easeMatrixBossIntro(Math.max(0, progress / 0.20)));
            source.introDepth = getMatrixBossIntroDepth(progress);
            const layerSlot = getMatrixBossIntroLayerSlot(source.introDepth);
            source.x = source.introTargetX ?? source.x;
            source.y = source.introTargetY ?? source.y;
            source.vx = 0;
            source.vy = 0;
            source.isVulnerable = false;
            source.isShielded = true;
            source.color = '#bfc7d5';
            matrixCrawlerState.invuln = Math.max(matrixCrawlerState.invuln || 0, duration - nextTimer + 0.45);
            player.flashTimer = Math.max(player.flashTimer || 0, 0.08);
            matrixCrawlerState.enemyBullets.length = 0;
            if (layerSlot > (source.introLayerPulse || 0)) {
                source.introLayerPulse = layerSlot;
                addShake(0.8 + layerSlot * 0.45);
            }
            if (progress > 0.18 && Math.random() < hostileDt * 18) {
                emitMatrixCrawlerParticle(source.x, source.y, '#cbd5e2');
            }
            if (nextTimer >= duration) activateMatrixDistortedGlitchBoss(source);
        }

        function getMatrixGlitchChars() {
            return typeof GLITCH_CHARS !== 'undefined' && GLITCH_CHARS.length
                ? GLITCH_CHARS
                : ['#', '%', '&', '0', '1'];
        }

        function buildMatrixGlitchCodeLine(length = 8) {
            const glyphs = getMatrixGlitchChars();
            const codeChars = glyphs.join('') + '01{}[];:=></%!&|~';
            let codeLine = '';
            for (let k = 0; k < length; k++) {
                codeLine += codeChars[Math.floor(Math.random() * codeChars.length)];
            }
            return codeLine;
        }

        function buildMatrixGlitchRainColumn(length = 10) {
            let column = '';
            for (let i = 0; i < length; i++) {
                column += MATRIX_GLITCH_MATRIX_CHARS[Math.floor(Math.random() * MATRIX_GLITCH_MATRIX_CHARS.length)];
            }
            return column;
        }

        function fireMatrixDistortedGlitchBullet(source, angle, speed, options = {}) {
            const glyphs = getMatrixGlitchChars();
            return fireMatrixEnemyBullet(options.x ?? source.x, options.y ?? source.y, angle, speed, {
                char: options.char || glyphs[Math.floor(Math.random() * glyphs.length)],
                color: options.color || '#00ff41',
                life: options.life || 4.5,
                radius: options.radius || (options.isHuge ? 12 : 6),
                visualRadius: options.visualRadius,
                hitboxScale: options.hitboxScale || 0.72,
                turnRate: options.turnRate || 0,
                decay: options.decay || 0,
                isHuge: !!options.isHuge,
                isGlitchBullet: true,
                isCodeLine: !!options.isCodeLine,
                isMatrixRainColumn: !!options.isMatrixRainColumn,
                matrixGlyphGap: options.matrixGlyphGap,
                matrixTrailAlpha: options.matrixTrailAlpha,
                morphTimer: options.morphTimer || 0
            });
        }

        function fireMatrixDistortedGlitchFan(source, options = {}) {
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            const count = options.count || 7;
            const half = (count - 1) / 2;
            for (let i = 0; i < count; i++) {
                const offset = i - half;
                const angle = aim + offset * (options.spread || 0.18) + (options.jitter ? (Math.random() - 0.5) * options.jitter : 0);
                fireMatrixDistortedGlitchBullet(source, angle, (options.speed || 180) - Math.abs(offset) * 7, {
                    char: Math.abs(offset) < 0.1 ? '*' : '.',
                    color: Math.abs(offset) < 0.1 ? (options.coreColor || '#ffffff') : (options.color || '#65ff9a'),
                    life: options.life || 4.4,
                    hitboxScale: options.hitboxScale || 0.74
                });
            }
        }

        function fireMatrixDistortedMatrixRain(source, room) {
            const rect = getMatrixCrawlerRoomRect(room);
            const stageTwo = (source.stage || 1) >= 2;
            const columns = stageTwo ? 9 : 8;
            const laneSpan = Math.min(rect.w - 150, stageTwo ? 900 : 820);
            const left = Math.max(rect.x + 70, Math.min(rect.right - 70 - laneSpan, player.x - laneSpan / 2));
            const safeLane = Math.max(0, Math.min(columns - 1, Math.floor((player.x - left) / Math.max(1, laneSpan) * columns)));
            for (let i = 0; i < columns; i++) {
                if (Math.abs(i - safeLane) < (stageTwo ? 0.35 : 0.55) && Math.random() < 0.78) continue;
                const x = left + (i + 0.5) * laneSpan / columns + (Math.random() - 0.5) * 34;
                const y = Math.max(rect.y + 24, Math.min(rect.bottom - 160, player.y - 430 - Math.random() * 100));
                fireMatrixEnemyBullet(x, y, Math.PI / 2 + (Math.random() - 0.5) * 0.06, (stageTwo ? 165 : 148) + Math.random() * 34, {
                    char: buildMatrixGlitchRainColumn(stageTwo ? 12 : 10),
                    color: i % 4 === 0 ? '#d8ffe0' : '#00ff41',
                    life: 6.5,
                    radius: 7,
                    hitboxScale: 0.58,
                    isGlitchBullet: true,
                    isMatrixRainColumn: true,
                    matrixGlyphGap: stageTwo ? 15 : 16,
                    matrixTrailAlpha: stageTwo ? 0.56 : 0.48,
                    morphTimer: Math.random() * 0.12
                });
            }
            fireMatrixDistortedGlitchFan(source, {
                count: stageTwo ? 6 : 5,
                spread: 0.15,
                speed: stageTwo ? 158 : 142,
                color: '#65ff9a',
                coreColor: '#d9ffe7',
                life: 4.2
            });
        }

        function fireMatrixDistortedGlitchTear(source, room) {
            const rect = getMatrixCrawlerRoomRect(room);
            const tearY = Math.max(rect.y + 80, Math.min(rect.bottom - 80, player.y - 110 + (Math.random() - 0.5) * 120));
            for (const side of [-1, 1]) {
                const fromLeft = side < 0;
                const x = fromLeft ? rect.x + 34 : rect.right - 34;
                for (let i = 0; i < 5; i++) {
                    const angle = fromLeft ? 0 : Math.PI;
                    fireMatrixDistortedGlitchBullet(source, angle + (Math.random() - 0.5) * 0.04, 255 + i * 16, {
                        x,
                        y: tearY + (i - 2) * 28,
                        char: getMatrixGlitchChars()[(i * 3 + (fromLeft ? 0 : 1)) % getMatrixGlitchChars().length],
                        color: i % 2 === 0 ? '#00ff41' : '#d8ffe0',
                        life: 4.2,
                        hitboxScale: 0.78,
                        turnRate: (fromLeft ? 1 : -1) * (i - 2) * 0.11
                    });
                }
            }
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            for (let i = 0; i < 8; i++) {
                const side = i % 2 === 0 ? -1 : 1;
                const spread = 0.18 + Math.floor(i / 2) * 0.09;
                fireMatrixDistortedGlitchBullet(source, aim + side * spread, 235 + i * 7, {
                    char: i % 2 ? 'ﾋ' : 'ﾊ',
                    color: i % 3 === 0 ? '#ffffff' : '#00ff41',
                    life: 4.6,
                    hitboxScale: 0.74,
                    turnRate: side * -0.16
                });
            }
        }

        function getMatrixDistortedGlitchBoundsMargin(source) {
            const sprite = source && source.sprite ? source.sprite : [];
            const columns = sprite.reduce((best, row) => Math.max(best, String(row || '').length), 1);
            const rows = Math.max(1, sprite.length || 1);
            const scale = Math.max(0.55, source && source.renderScale ? source.renderScale : MATRIX_GLITCH_RENDER_SCALE);
            const halfW = columns * charW * scale * 0.5;
            const halfH = rows * charH * scale * 0.5;
            return Math.ceil(Math.max(source && source.radius ? source.radius : 50, halfW, halfH) + 18);
        }

        function clampMatrixDistortedGlitchToRoom(source, room) {
            if (!source || !room) return;
            const rect = getMatrixCrawlerRoomRect(room);
            const margin = getMatrixDistortedGlitchBoundsMargin(source);
            const minX = rect.x + margin;
            const maxX = rect.right - margin;
            const minY = rect.y + margin;
            const maxY = rect.bottom - margin;
            if (maxX >= minX) source.x = Math.max(minX, Math.min(maxX, source.x));
            if (maxY >= minY) source.y = Math.max(minY, Math.min(maxY, source.y));
        }

        function updateMatrixDistortedGlitchDrift(source, hostileDt, room) {
            const rect = getMatrixCrawlerRoomRect(room);
            const boundsMargin = getMatrixDistortedGlitchBoundsMargin(source);
            source.dirChangeTimer = (source.dirChangeTimer || 0) - hostileDt;
            if (source.dirChangeTimer <= 0) {
                source.dirChangeTimer = (source.stage || 1) >= 2
                    ? 0.65 + Math.random() * 0.75
                    : 1.1 + Math.random() * 1.3;
                const aim = Math.atan2(player.y - source.y, player.x - source.x);
                const angle = Math.random() < 0.42 ? aim + Math.PI + (Math.random() - 0.5) * 1.4 : Math.random() * Math.PI * 2;
                const speed = (source.baseSpeed || MATRIX_GLITCH_STAGE_ONE_SPEED) * (0.65 + Math.random() * 1.1);
                source.glitchVx = Math.cos(angle) * speed;
                source.glitchVy = Math.sin(angle) * speed;
            }

            if (Math.random() > 0.18) {
                const moved = moveMatrixCrawlerBodyInRoom(
                    room,
                    source.x,
                    source.y,
                    source.x + (source.glitchVx || 0) * hostileDt,
                    source.y + (source.glitchVy || 0) * hostileDt,
                    boundsMargin
                );
                if (Math.abs(moved.x - (source.x + (source.glitchVx || 0) * hostileDt)) > 0.1) source.glitchVx *= -0.72;
                if (Math.abs(moved.y - (source.y + (source.glitchVy || 0) * hostileDt)) > 0.1) source.glitchVy *= -0.72;
                source.x = moved.x;
                source.y = moved.y;
            }

            const roomMinX = rect.x + boundsMargin;
            const roomMaxX = rect.right - boundsMargin;
            const roomMinY = rect.y + boundsMargin;
            const roomMaxY = rect.bottom - boundsMargin;
            let minX = Math.max(roomMinX, player.x - Math.min(560, rect.w * 0.42));
            let maxX = Math.min(roomMaxX, player.x + Math.min(560, rect.w * 0.42));
            let minY = Math.max(roomMinY, player.y - Math.min(430, rect.h * 0.46));
            let maxY = Math.min(roomMaxY, player.y - 120);
            if (maxX < minX) {
                minX = roomMinX;
                maxX = roomMaxX;
            }
            if (maxY < minY) {
                const fallbackY = Math.max(roomMinY, Math.min(roomMaxY, player.y - 160));
                const fallbackSpan = Math.min(280, Math.max(0, roomMaxY - roomMinY));
                minY = Math.max(roomMinY, fallbackY - fallbackSpan * 0.5);
                maxY = Math.min(roomMaxY, fallbackY + fallbackSpan * 0.5);
                if (maxY < minY) {
                    minY = roomMinY;
                    maxY = roomMaxY;
                }
            }
            if (source.x < minX) { source.x = minX; source.glitchVx = Math.abs(source.glitchVx || 0); }
            if (source.x > maxX) { source.x = maxX; source.glitchVx = -Math.abs(source.glitchVx || 0); }
            if (source.y < minY) { source.y = minY; source.glitchVy = Math.abs(source.glitchVy || 0); }
            if (source.y > maxY) { source.y = maxY; source.glitchVy = -Math.abs(source.glitchVy || 0); }
            clampMatrixDistortedGlitchToRoom(source, room);

            source.sprite = (source.stage || 1) >= 2
                ? (Math.random() > 0.7 && typeof GLITCH_SPRITE_2B !== 'undefined' ? GLITCH_SPRITE_2B : (typeof GLITCH_SPRITE_2 !== 'undefined' ? GLITCH_SPRITE_2 : source.sprite))
                : (Math.random() > 0.7 && typeof GLITCH_SPRITE_1B !== 'undefined' ? GLITCH_SPRITE_1B : (typeof GLITCH_SPRITE_1 !== 'undefined' ? GLITCH_SPRITE_1 : source.sprite));
            clampMatrixDistortedGlitchToRoom(source, room);

            const blinkChance = ((source.stage || 1) >= 2 ? 0.045 : 0.026) * hostileDt * 60;
            if (Math.random() < blinkChance) {
                const mega = Math.random() > 0.86;
                const d = mega ? 120 + Math.random() * 130 : 28 + Math.random() * 54;
                const a = Math.random() * Math.PI * 2;
                const safe = getMatrixCrawlerSafePoint(room, source.x + Math.cos(a) * d, source.y + Math.sin(a) * d, boundsMargin);
                source.x = safe.x;
                source.y = safe.y;
                clampMatrixDistortedGlitchToRoom(source, room);
                if (mega) {
                    emitMatrixBossBurst(source, source.color, 14, getMatrixGlitchChars());
                    addShake(5);
                }
            }
        }

        function updateMatrixDistortedGlitchScatter(source, hostileDt) {
            source.scatterTimer = (source.scatterTimer || 0) - hostileDt;
            if (source.scatterTimer > 0) return;
            source.scatterTimer = (source.stage || 1) >= 2 ? 0.46 + Math.random() * 0.62 : 0.7 + Math.random() * 0.86;
            const count = (source.stage || 1) >= 2 ? 4 : 3;
            for (let i = 0; i < count; i++) {
                fireMatrixDistortedGlitchBullet(source, Math.random() * Math.PI * 2, 145 + Math.random() * 70, {
                    life: 4.5,
                    hitboxScale: 0.72
                });
            }
        }

        function updateMatrixDistortedGlitchCodeVolley(source, hostileDt) {
            source.codeVolleyTimer = (source.codeVolleyTimer || 0) - hostileDt;
            if (source.isCodeVolley) {
                source.codeVolleyDelay = (source.codeVolleyDelay || 0) - hostileDt;
                if (source.codeVolleyDelay <= 0 && (source.codeVolleyShots || 0) < 4) {
                    source.codeVolleyShots = (source.codeVolleyShots || 0) + 1;
                    source.codeVolleyDelay = 0.42;
                    const aim = Math.atan2(player.y - source.y, player.x - source.x) + (Math.random() - 0.5) * 0.55;
                    fireMatrixDistortedGlitchBullet(source, aim, 250 + Math.random() * 65, {
                        char: buildMatrixGlitchCodeLine(6 + Math.floor(Math.random() * 8)),
                        life: 4.1,
                        hitboxScale: 0.7,
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

        function updateMatrixDistortedGlitchSpecialAttacks(source, hostileDt, room) {
            const stageTwo = (source.stage || 1) >= 2;
            source.matrixRainTimer = (source.matrixRainTimer ?? (stageTwo ? 0 : 3.2)) - hostileDt;
            if (source.matrixRainTimer <= 0) {
                fireMatrixDistortedMatrixRain(source, room);
                source.matrixRainTimer = (stageTwo ? 7.4 : 6.2) + Math.random() * (stageTwo ? 1.5 : 1.8);
            }
            if (!stageTwo) return;
            source.glitchTearTimer = (source.glitchTearTimer || 2.8) - hostileDt;
            if (source.glitchTearTimer <= 0) {
                fireMatrixDistortedGlitchTear(source, room);
                source.glitchTearTimer = 5.0 + Math.random() * 1.4;
                addShake(7);
            }
        }

        function updateMatrixDistortedGlitchCharge(source, hostileDt) {
            source.chargeDuration = (source.chargeDuration || 0) + hostileDt;
            source.glowIntensity = Math.min(1, source.chargeDuration / 0.9);
            shake = Math.max(shake, 7 * source.glowIntensity);
            if (source.chargeDuration < 0.9) return;

            addShake((source.stage || 1) >= 2 ? 16 : 12);
            const count = (source.stage || 1) >= 2 ? 11 : 9;
            const aim = Math.atan2(player.y - source.y, player.x - source.x);
            const offset = source.isDoubleCharge && source.doubleChargePhase === 2 ? Math.PI / count : 0;
            for (let i = 0; i < count; i++) {
                fireMatrixDistortedGlitchBullet(source, aim + offset + (i / count) * Math.PI * 2, MATRIX_GLITCH_CHARGE_SPEED, {
                    char: getMatrixGlitchChars()[(i * 2) % getMatrixGlitchChars().length],
                    life: 1.05,
                    decay: 0.55,
                    isHuge: true,
                    hitboxScale: 0.82
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

        function updateMatrixDistortedGlitchBoss(source, hostileDt, room) {
            source.age = (source.age || 0) + hostileDt;
            source.flashTimer = Math.max(0, (source.flashTimer || 0) - hostileDt);
            source.colorCycleTimer = (source.colorCycleTimer || 0) + hostileDt;
            if (source.phase === 'INTRO') {
                updateMatrixDistortedGlitchIntro(source, hostileDt);
                return;
            }

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
                source.sprite = typeof GLITCH_SPRITE_2 !== 'undefined' ? GLITCH_SPRITE_2 : source.sprite;
                source.baseSpeed = MATRIX_GLITCH_STAGE_TWO_SPEED;
                source.chargeTimer = 0;
                source.isCharging = false;
                matrixCrawlerState.enemyBullets = matrixCrawlerState.enemyBullets.filter(b => Math.hypot(b.x - player.x, b.y - player.y) < 900);
                emitMatrixBossBurst(source, '#00ff41', 38, getMatrixGlitchChars());
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
                updateMatrixDistortedGlitchDrift(source, hostileDt, room);
                source.chargeTimer = (source.chargeTimer || 0) + hostileDt;
                const chargeCycle = (source.stage || 1) >= 2 ? 2.55 : 3.85;
                if (source.chargeTimer >= chargeCycle) {
                    source.isCharging = true;
                    source.chargeDuration = 0;
                    source.glowIntensity = 0;
                    source.isDoubleCharge = (source.stage || 1) >= 2 && Math.random() < 0.35;
                    source.doubleChargePhase = 1;
                } else {
                    updateMatrixDistortedGlitchScatter(source, hostileDt);
                    updateMatrixDistortedGlitchCodeVolley(source, hostileDt);
                    updateMatrixDistortedGlitchSpecialAttacks(source, hostileDt, room);
                }
            } else if (source.isCharging) {
                updateMatrixDistortedGlitchCharge(source, hostileDt);
            }
        }

        function fireMatrixPortSentryShot(enemy) {
            const aim = enemy.aimAngle ?? Math.atan2(player.y - enemy.y, player.x - enemy.x);
            const muzzleX = enemy.x + Math.cos(aim) * 18;
            const muzzleY = enemy.y + Math.sin(aim) * 18;
            fireMatrixEnemyBullet(muzzleX, muzzleY, aim, 205, {
                char: '1',
                color: '#8ff7ff',
                radius: 6,
                hitboxScale: 0.82,
                damage: 8,
                life: 4.2
            });
            enemy.fireFlashTimer = 0.16;
            emitMatrixCrawlerParticle(muzzleX, muzzleY, '#8ff7ff');
        }

        function updateMatrixPortSentry(enemy, dt, room, dx, dy, dist) {
            enemy.aimAngle = Math.atan2(dy, dx);
            enemy.fireFlashTimer = Math.max(0, (enemy.fireFlashTimer || 0) - dt);
            if (dist > MATRIX_PORT_SENTRY_RANGE) {
                enemy.sentryWindup = 0;
                enemy.fireTimer = Math.min(0.75, (enemy.fireTimer || 0.75) + dt * 0.25);
                return;
            }
            if ((enemy.sentryWindup || 0) > 0) {
                enemy.sentryWindup = Math.max(0, enemy.sentryWindup - dt);
                if (enemy.sentryWindup <= 0) {
                    fireMatrixPortSentryShot(enemy);
                    enemy.fireTimer = 1.55 + Math.random() * 0.55;
                }
                return;
            }
            enemy.fireTimer = (enemy.fireTimer || 0) - dt;
            if (enemy.fireTimer <= 0) {
                enemy.sentryWindup = MATRIX_PORT_SENTRY_WINDUP;
                enemy.fireTimer = 0;
            }
        }

        function updateMatrixCrashBug(enemy, dt, room, dx, dy, dist) {
            enemy.fireFlashTimer = Math.max(0, (enemy.fireFlashTimer || 0) - dt);
            if (enemy.crashState === 'windup') {
                enemy.dashWindup = Math.max(0, (enemy.dashWindup || 0) - dt);
                enemy.aimAngle = enemy.dashAngle || Math.atan2(dy, dx);
                if (enemy.dashWindup <= 0) {
                    enemy.crashState = 'dash';
                    enemy.dashTimer = MATRIX_CRASH_BUG_DASH_TIME;
                    enemy.dashBounces = 1;
                    enemy.dashVx = Math.cos(enemy.aimAngle) * MATRIX_CRASH_BUG_DASH_SPEED;
                    enemy.dashVy = Math.sin(enemy.aimAngle) * MATRIX_CRASH_BUG_DASH_SPEED;
                    enemy.fireFlashTimer = 0.18;
                }
                return;
            }

            if (enemy.crashState === 'dash') {
                enemy.dashTimer = Math.max(0, (enemy.dashTimer || 0) - dt);
                const nextX = enemy.x + (enemy.dashVx || 0) * dt;
                const nextY = enemy.y + (enemy.dashVy || 0) * dt;
                const moved = moveMatrixCrawlerEnemyBodyInRoom(room, enemy.x, enemy.y, nextX, nextY, enemy.radius + 4);
                const hitX = Math.abs(moved.x - nextX) > 0.1;
                const hitY = Math.abs(moved.y - nextY) > 0.1;
                enemy.x = moved.x;
                enemy.y = moved.y;
                if ((hitX || hitY) && (enemy.dashBounces || 0) > 0) {
                    if (hitX) enemy.dashVx *= -0.82;
                    if (hitY) enemy.dashVy *= -0.82;
                    enemy.dashBounces--;
                    enemy.fireFlashTimer = 0.10;
                } else if (hitX || hitY || enemy.dashTimer <= 0) {
                    enemy.crashState = 'recover';
                    enemy.dashRecover = 0.46;
                    enemy.dashCooldown = 1.05 + Math.random() * 0.85;
                    enemy.dashVx = 0;
                    enemy.dashVy = 0;
                }
                enemy.aimAngle = Math.atan2(enemy.dashVy || dy, enemy.dashVx || dx);
                return;
            }

            if (enemy.crashState === 'recover') {
                enemy.dashRecover = Math.max(0, (enemy.dashRecover || 0) - dt);
                if (enemy.dashRecover <= 0) enemy.crashState = 'wander';
                return;
            }

            enemy.dashCooldown = Math.max(0, (enemy.dashCooldown || 0) - dt);
            enemy.wanderAngle = (enemy.wanderAngle || 0) + Math.sin(enemy.phase * 0.7) * dt * 0.55;
            const aim = Math.atan2(dy, dx);
            const steer = getMatrixCrawlerEnemySeekVector(enemy, room, player.x, player.y, dt, enemy.radius + 4);
            const chaseWeight = dist < 520 ? (steer.usingPath ? 0.74 : 0.42) : (steer.usingPath ? 0.55 : 0.18);
            const wanderX = Math.cos(enemy.wanderAngle);
            const wanderY = Math.sin(enemy.wanderAngle);
            let crawlX = wanderX * (1 - chaseWeight) + steer.x * chaseWeight;
            let crawlY = wanderY * (1 - chaseWeight) + steer.y * chaseWeight;
            const crawlLength = Math.max(1, Math.hypot(crawlX, crawlY));
            crawlX /= crawlLength;
            crawlY /= crawlLength;
            enemy.aimAngle = aim;
            const speed = enemy.speed || 48;
            applyMatrixCrawlerEnemyMove(enemy, room, crawlX * speed, crawlY * speed, dt, enemy.radius + 4);

            if (enemy.dashCooldown <= 0 && dist < 620 && hasMatrixCrawlerPathLine(room, enemy.x, enemy.y, player.x, player.y, enemy.radius + 4, MATRIX_CRAWLER_NAV_CELL * 0.55, true)) {
                enemy.crashState = 'windup';
                enemy.dashWindup = MATRIX_CRASH_BUG_WINDUP;
                enemy.dashAngle = aim;
                enemy.aimAngle = aim;
            }
        }

        function fireMatrixFirewallHostSpread(enemy, room) {
            const aim = enemy.aimAngle ?? Math.atan2(player.y - enemy.y, player.x - enemy.x);
            const roomDepth = room ? room.depth || 0 : 0;
            const count = (matrixCrawlerState.floor >= 3 || roomDepth >= 5 || (room && room.type === 'challenge')) ? 5 : 3;
            const spread = count === 5 ? 0.15 : 0.19;
            const half = (count - 1) / 2;
            for (let i = 0; i < count; i++) {
                const offset = (i - half) * spread;
                fireMatrixEnemyBullet(enemy.x + Math.cos(aim) * 18, enemy.y + Math.sin(aim) * 18, aim + offset, 178 + i * 3, {
                    char: i === half ? '!' : '/',
                    color: i === half ? '#ffffff' : '#ffb347',
                    radius: 6,
                    hitboxScale: 0.78,
                    damage: 9,
                    life: 4.4
                });
            }
            enemy.hostFlashTimer = 0.18;
            addShake(2.5);
        }

        function updateMatrixFirewallHost(enemy, dt, room, dx, dy, dist) {
            enemy.aimAngle = Math.atan2(dy, dx);
            enemy.hostFlashTimer = Math.max(0, (enemy.hostFlashTimer || 0) - dt);
            enemy.hostTimer = Math.max(0, (enemy.hostTimer || 0) - dt);
            if (enemy.hostState === 'closed') {
                enemy.isShielded = true;
                if (enemy.hostTimer <= 0 || dist < MATRIX_FIREWALL_HOST_RANGE) {
                    enemy.hostState = 'opening';
                    enemy.hostTimer = 0.38;
                    enemy.hostFireDelay = 0;
                }
                return;
            }
            if (enemy.hostState === 'opening') {
                enemy.isShielded = true;
                if (enemy.hostTimer <= 0) {
                    enemy.hostState = 'open';
                    enemy.hostTimer = MATRIX_FIREWALL_HOST_OPEN_TIME;
                    enemy.hostFireDelay = 0.34;
                    enemy.isShielded = false;
                }
                return;
            }
            if (enemy.hostState === 'open') {
                enemy.isShielded = false;
                enemy.hostFireDelay = Math.max(0, (enemy.hostFireDelay || 0) - dt);
                if (enemy.hostFireDelay <= 0 && !enemy.hostFired) {
                    fireMatrixFirewallHostSpread(enemy, room);
                    enemy.hostFired = true;
                }
                if (enemy.hostTimer <= 0) {
                    enemy.hostState = 'closing';
                    enemy.hostTimer = 0.34;
                    enemy.hostFired = false;
                    enemy.isShielded = true;
                }
                return;
            }
            if (enemy.hostState === 'closing') {
                enemy.isShielded = true;
                if (enemy.hostTimer <= 0) {
                    enemy.hostState = 'closed';
                    enemy.hostTimer = 1.25 + Math.random() * 0.75;
                }
            }
        }

        function fireMatrixEnemyPattern(enemy) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const aim = Math.atan2(dy, dx);
            if (enemy.type === 'portSentry') {
                fireMatrixPortSentryShot(enemy);
                return;
            }
            if (enemy.type === 'firewallHost') {
                fireMatrixFirewallHostSpread(enemy, getMatrixCrawlerRoom());
                return;
            }
            if (enemy.type === 'turret') {
                for (let i = -1; i <= 1; i++) fireMatrixEnemyBullet(enemy.x, enemy.y, aim + i * 0.16, 170, { char: '1', radius: 5 });
                return;
            }
            if (enemy.type === 'orbit') {
                for (let i = 0; i < 4; i++) fireMatrixEnemyBullet(enemy.x, enemy.y, enemy.phase + i * Math.PI / 2, 145, { char: '+', color: '#baff75' });
                return;
            }
            if (enemy.type === 'miniboss') {
                for (let i = 0; i < 8; i++) fireMatrixEnemyBullet(enemy.x, enemy.y, enemy.phase + i * Math.PI / 4, 155, { char: '*', color: '#e6fff1', radius: 6 });
                fireMatrixEnemyBullet(enemy.x, enemy.y, aim, 230, { char: '0', radius: 7 });
                return;
            }
            if (enemy.type === 'hydra') {
                const stage = enemy.hp < enemy.maxHp * 0.48 ? 2 : 1;
                const fan = stage === 2 ? 7 : 5;
                for (let i = 0; i < fan; i++) {
                    const offset = (i - (fan - 1) / 2) * (stage === 2 ? 0.13 : 0.16);
                    fireMatrixEnemyBullet(enemy.x, enemy.y, aim + offset, 205 + i * 4, { char: i % 2 ? '1' : '0', color: i % 2 ? '#41ff93' : '#e6fff1', radius: 6 });
                }
                if (stage === 2) {
                    for (let i = 0; i < 10; i++) fireMatrixEnemyBullet(enemy.x, enemy.y, enemy.phase + i * Math.PI / 5, 128, { char: '|', color: '#8ff7ff', radius: 5 });
                }
                return;
            }
            fireMatrixEnemyBullet(enemy.x, enemy.y, aim, 155, { char: '.', radius: 5 });
        }

        function damageMatrixPlayer(amount) {
            if (!isMatrixCrawlerRuntimeActive()) return;
            if (player.godMode || matrixCrawlerState.invuln > 0) return;
            player.hp -= amount;
            player.flashTimer = 0.22;
            matrixCrawlerState.invuln = 0.92 + (player.modifiers.invincibility || 0);
            if (typeof recordRunDamageTaken === 'function') recordRunDamageTaken(amount);
            addShake(7);
            if (player.hp <= 0) {
                player.hp = 0;
                currentHint = RAGE_HINTS[Math.floor(Math.random() * RAGE_HINTS.length)];
                endMatrixCrawlerRun();
                clearGameplayKeys();
                shake = 0;
                wobble = 0;
                gameState = 'GAMEOVER';
                applyCurrentVolume(0.72, 0.25);
            }
        }

        function updateMatrixCrawlerPlayer(dt) {
            const room = getMatrixCrawlerRoom();
            let mx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
            let my = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
            if (mx !== 0 && my !== 0) {
                mx *= 0.707;
                my *= 0.707;
            }
            const speed = 246 * getPlayerMoveSpeedScale();
            const targetVx = mx * speed;
            const targetVy = my * speed;
            const currentSpeedSq = (player.vx || 0) * (player.vx || 0) + (player.vy || 0) * (player.vy || 0);
            const targetSpeedSq = targetVx * targetVx + targetVy * targetVy;
            const reversing = targetSpeedSq > 0 && currentSpeedSq > 0 && ((player.vx || 0) * targetVx + (player.vy || 0) * targetVy) < 0;
            const response = targetSpeedSq > 0
                ? (reversing ? MATRIX_CRAWLER_PLAYER_REVERSE_RESPONSE : MATRIX_CRAWLER_PLAYER_ACCEL_RESPONSE)
                : MATRIX_CRAWLER_PLAYER_DECEL_RESPONSE;
            const moveBlend = 1 - Math.exp(-response * dt);
            player.vx = (player.vx || 0) + (targetVx - (player.vx || 0)) * moveBlend;
            player.vy = (player.vy || 0) + (targetVy - (player.vy || 0)) * moveBlend;
            if (targetSpeedSq === 0 && Math.hypot(player.vx || 0, player.vy || 0) < 2.5) {
                player.vx = 0;
                player.vy = 0;
            }
            const nextX = player.x + player.vx * dt;
            const nextY = player.y + player.vy * dt;
            const clamped = moveMatrixCrawlerBodyInRoom(room, player.x, player.y, nextX, nextY, 24);
            player.x = clamped.x;
            player.y = clamped.y;
            if (Math.abs(clamped.x - nextX) > 0.01) player.vx = 0;
            if (Math.abs(clamped.y - nextY) > 0.01) player.vy = 0;
            resolveMatrixCrawlerPlayerBreakableCollision();
            const rawAim = getMatrixCrawlerAimVector();
            const aim = updateMatrixCrawlerAim(dt, rawAim);
            player.isFiring = !!aim;
            if (aim) fireMatrixCrawlerShot(aim);
            if (postResumeBombLockTimer > 0) postResumeBombLockTimer = Math.max(0, postResumeBombLockTimer - dt);
            if ((keys[' '] || keys.b) && player.bombTimer <= 0 && postResumeBombLockTimer <= 0) {
                fireMatrixCrawlerBomb();
            }
            updateMatrixCrawlerHoverRipples(dt);
            if (matrixCrawlerState.fireCooldown > 0) matrixCrawlerState.fireCooldown = Math.max(0, matrixCrawlerState.fireCooldown - dt);
            if (matrixCrawlerState.invuln > 0) matrixCrawlerState.invuln = Math.max(0, matrixCrawlerState.invuln - dt);
            if (player.flashTimer > 0) player.flashTimer = Math.max(0, player.flashTimer - dt);
        }

        function updateMatrixCrawlerProjectiles(dt) {
            const state = matrixCrawlerState;
            const room = getMatrixCrawlerRoom();
            const rect = getMatrixCrawlerRoomRect();
            for (let i = state.projectiles.length - 1; i >= 0; i--) {
                const p = state.projectiles[i];
                const stats = p.stats || {};
                if (p.isDissolvingProjectile) {
                    if (typeof updateProjectileLifetimeDissolve === 'function' && updateProjectileLifetimeDissolve(p, dt)) {
                        state.projectiles.splice(i, 1);
                    }
                    continue;
                }
                p.prevX = p.x;
                p.prevY = p.y;
                p.age = (p.age || 0) + dt;
                if (p.homing && state.enemies.length) {
                    let nearest = null;
                    let best = 180 * 180;
                    for (const enemy of state.enemies) {
                        if (enemy.dead) continue;
                        const dSq = (enemy.x - p.x) ** 2 + (enemy.y - p.y) ** 2;
                        if (dSq < best) {
                            best = dSq;
                            nearest = enemy;
                        }
                    }
                    if (nearest) {
                        const desired = Math.atan2(nearest.y - p.y, nearest.x - p.x);
                        const speed = Math.max(1, Math.hypot(p.vx, p.vy));
                        const current = Math.atan2(p.vy, p.vx);
                        const next = current + Math.max(-0.08, Math.min(0.08, desired - current));
                        p.vx = Math.cos(next) * speed;
                        p.vy = Math.sin(next) * speed;
                    }
                }
                let ox = 0;
                if (p.pathFunction === 'sine') {
                    ox = Math.sin((p.maxLife - p.life) * 10 + p.sinePhase) * 26 * dt;
                }
                p.x += p.vx * dt - Math.sin(p.baseAngle) * ox;
                p.y += p.vy * dt + Math.cos(p.baseAngle) * ox;
                p.life -= dt;
                const torpedoRange = stats.torpedoRange || 0;
                const torpedoExpired = stats.miniTorpedo && torpedoRange > 0
                    && ((p.x - p.startX) * (p.x - p.startX) + (p.y - p.startY) * (p.y - p.startY)) >= torpedoRange * torpedoRange;
                if (torpedoExpired || (stats.miniTorpedo && p.life <= 0)) {
                    triggerMatrixCrawlerTorpedoExplosion(p, p.x, p.y);
                    state.projectiles.splice(i, 1);
                    continue;
                }
                if (p.life <= 0 && p.isMatrixLaserProjectile) {
                    const dissolving = typeof beginProjectileLifetimeDissolve === 'function' && beginProjectileLifetimeDissolve(p, {
                        char: p.sprite || '|',
                        color: p.color || '#ffffff',
                        scale: stats.sizeMult || 1,
                        velocityScale: 0.13
                    });
                    if (dissolving) {
                        continue;
                    }
                }
                if ((p.x < rect.x || p.x > rect.right) && p.ricochet > 0) {
                    p.vx *= -1;
                    p.ricochet--;
                    p.x = Math.max(rect.x, Math.min(rect.right, p.x));
                }
                if ((p.y < rect.y || p.y > rect.bottom) && p.ricochet > 0) {
                    p.vy *= -1;
                    p.ricochet--;
                    p.y = Math.max(rect.y, Math.min(rect.bottom, p.y));
                }
                let remove = p.life <= 0 || p.x < rect.x - 60 || p.x > rect.right + 60 || p.y < rect.y - 60 || p.y > rect.bottom + 60;
                let hitProjectile = false;
                if (!remove && !isPointInMatrixCrawlerRoom(room, p.x, p.y, -8)) remove = true;
                if (!remove) {
                    const object = getMatrixCrawlerProjectileBreakableHit(p);
                    if (object) {
                        hitProjectile = true;
                        if (stats.miniTorpedo) {
                            damageMatrixCrawlerBreakable(object, p.damage || 16);
                            triggerMatrixCrawlerTorpedoExplosion(p, p.x, p.y);
                            remove = true;
                        } else {
                            damageMatrixCrawlerBreakable(object, p.damage || 10);
                            if (p.pierce > 0) p.pierce--;
                            else remove = true;
                        }
                    }
                }
                if (!remove) {
                    for (const enemy of state.enemies) {
                        if (enemy.dead) continue;
                        if (Math.hypot(enemy.x - p.x, enemy.y - p.y) <= enemy.radius + p.radius) {
                            hitProjectile = true;
                            if (stats.miniTorpedo) {
                                damageMatrixEnemy(enemy, p.damage, { ...p, splash: 0 });
                                triggerMatrixCrawlerTorpedoExplosion(p, p.x, p.y);
                                remove = true;
                            } else {
                                damageMatrixEnemy(enemy, p.damage, p);
                                if (p.pierce > 0) p.pierce--;
                                else remove = true;
                            }
                            break;
                        }
                    }
                }
                if (remove) {
                    const dissolving = beginMatrixCrawlerProjectileDissolve(p, {
                        duration: hitProjectile ? 0.28 : 0.36,
                        velocityScale: hitProjectile ? 0.07 : 0.12
                    });
                    if (dissolving) continue;
                    state.projectiles.splice(i, 1);
                }
            }
            state.enemies = state.enemies.filter(enemy => !enemy.dead);
        }

        function updateMatrixCrawlerBombs(dt) {
            const room = getMatrixCrawlerRoom();
            const rect = getMatrixCrawlerRoomRect();
            for (let i = bombProjectiles.length - 1; i >= 0; i--) {
                const bomb = bombProjectiles[i];
                if (!bomb || !bomb.isMatrixCrawlerBomb) continue;
                if (bomb.justFired) {
                    bomb.justFired = false;
                    continue;
                }
                bomb.age = (bomb.age || 0) + dt;
                bomb.x += (bomb.vx || 0) * dt;
                bomb.y += (bomb.vy || 0) * dt;
                bomb.distance = Math.hypot(bomb.x - bomb.startX, bomb.y - bomb.startY);

                let shouldExplode = bomb.forceDetonate
                    || bomb.distance >= bomb.maxDistance
                    || bomb.x < rect.x - 24 || bomb.x > rect.right + 24
                    || bomb.y < rect.y - 24 || bomb.y > rect.bottom + 24
                    || !isPointInMatrixCrawlerRoom(room, bomb.x, bomb.y, -8);
                if (!shouldExplode) {
                    for (const enemy of matrixCrawlerState.enemies) {
                        if (!enemy || enemy.dead) continue;
                        if (Math.hypot(enemy.x - bomb.x, enemy.y - bomb.y) <= (enemy.radius || 0) + 18) {
                            shouldExplode = true;
                            break;
                        }
                    }
                }
                if (!shouldExplode) {
                    for (const object of matrixCrawlerState.breakables || []) {
                        if (!object || object.destroyed) continue;
                        if (Math.hypot(object.x - bomb.x, object.y - bomb.y) <= (object.radius || 0) + 18) {
                            shouldExplode = true;
                            break;
                        }
                    }
                }
                if (shouldExplode) {
                    spawnMatrixCrawlerBombExplosion(bomb.x, bomb.y);
                    bombProjectiles.splice(i, 1);
                }
            }

            for (let i = bombBlastRings.length - 1; i >= 0; i--) {
                const ring = bombBlastRings[i];
                if (!ring) {
                    bombBlastRings.splice(i, 1);
                    continue;
                }
                ring.life += dt;
                if (ring.life >= ring.maxLife) bombBlastRings.splice(i, 1);
            }
            matrixCrawlerState.enemies = matrixCrawlerState.enemies.filter(enemy => !enemy.dead);
        }

        function updateMatrixCrawlerEnemies(dt) {
            const state = matrixCrawlerState;
            const room = getMatrixCrawlerRoom();
            for (const enemy of state.enemies) {
                if (!isMatrixCrawlerRuntimeActive()) return;
                if (enemy.type === 'nullPhantom' || enemy.type === 'distortedGlitch') {
                    if (enemy.type === 'distortedGlitch') updateMatrixDistortedGlitchBoss(enemy, dt, room);
                    else updateMatrixNullPhantomBoss(enemy, dt, room);
                    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                    if (enemy.phase === 'ACTIVE' && dist < enemy.radius + getMatrixCrawlerPlayerHitboxRadius() + 2) damageMatrixPlayer(enemy.contact || 18);
                    if (!isMatrixCrawlerRuntimeActive()) return;
                    continue;
                }
                enemy.phase += dt * (enemy.type === 'hydra' ? 1.2 : 2.1);
                enemy.flashTimer = Math.max(0, (enemy.flashTimer || 0) - dt);
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const dist = Math.max(1, Math.hypot(dx, dy));
                if (enemy.type === 'portSentry') {
                    updateMatrixPortSentry(enemy, dt, room, dx, dy, dist);
                    const postDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                    if (postDist < enemy.radius + getMatrixCrawlerPlayerHitboxRadius() + 2) damageMatrixPlayer(enemy.contact || 8);
                    if (!isMatrixCrawlerRuntimeActive()) return;
                    continue;
                }
                if (enemy.type === 'crashBug') {
                    updateMatrixCrashBug(enemy, dt, room, dx, dy, dist);
                    const postDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                    if (postDist < enemy.radius + getMatrixCrawlerPlayerHitboxRadius() + 2) damageMatrixPlayer(enemy.contact || 12);
                    if (!isMatrixCrawlerRuntimeActive()) return;
                    continue;
                }
                if (enemy.type === 'firewallHost') {
                    updateMatrixFirewallHost(enemy, dt, room, dx, dy, dist);
                    const postDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                    if (postDist < enemy.radius + getMatrixCrawlerPlayerHitboxRadius() + 2) damageMatrixPlayer(enemy.contact || 10);
                    if (!isMatrixCrawlerRuntimeActive()) return;
                    continue;
                }
                if (enemy.speed > 0) {
                    const steer = getMatrixCrawlerEnemySeekVector(enemy, room, player.x, player.y, dt, enemy.radius + 4);
                    let dirX = steer.x;
                    let dirY = steer.y;
                    let moveScale = 1;
                    if (enemy.type === 'orbit') {
                        const tangentWeight = steer.usingPath ? 0.26 : 0.85;
                        dirX = steer.x + -dy / dist * tangentWeight;
                        dirY = steer.y + dx / dist * tangentWeight;
                        const dirLength = Math.max(1, Math.hypot(dirX, dirY));
                        dirX /= dirLength;
                        dirY /= dirLength;
                        moveScale = steer.usingPath ? 0.78 : Math.sin(enemy.phase) * 0.45;
                    }
                    applyMatrixCrawlerEnemyMove(enemy, room, dirX * enemy.speed * moveScale, dirY * enemy.speed * moveScale, dt, enemy.radius + 4);
                }
                enemy.fireTimer -= dt;
                const fireInterval = enemy.type === 'hydra' ? 1.15 : enemy.type === 'miniboss' ? 1.25 : enemy.type === 'turret' ? 1.45 : enemy.type === 'orbit' ? 1.8 : 2.4;
                if (enemy.fireTimer <= 0) {
                    if (!isMatrixCrawlerRuntimeActive()) return;
                    fireMatrixEnemyPattern(enemy);
                    enemy.fireTimer = fireInterval + Math.random() * 0.55;
                }
                if (dist < enemy.radius + getMatrixCrawlerPlayerHitboxRadius() + 2) damageMatrixPlayer(enemy.contact || 6);
                if (!isMatrixCrawlerRuntimeActive()) return;
            }
        }

        function updateMatrixCrawlerBullets(dt) {
            const state = matrixCrawlerState;
            const room = getMatrixCrawlerRoom();
            const rect = getMatrixCrawlerRoomRect();
            for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
                const b = state.enemyBullets[i];
                if (!b) continue;
                if (b.isDissolvingProjectile) {
                    if (typeof updateProjectileLifetimeDissolve === 'function' && updateProjectileLifetimeDissolve(b, dt)) {
                        state.enemyBullets.splice(i, 1);
                    }
                    continue;
                }
                if (b.isGlitchBullet) {
                    b.morphTimer = (b.morphTimer || 0) + dt;
                    if (b.morphTimer > 0.12) {
                        b.morphTimer = 0;
                        if (b.isMatrixRainColumn) {
                            const arr = String(b.char || '').split('');
                            for (let m = 0; m < 3 && arr.length; m++) {
                                const idx = Math.floor(Math.random() * arr.length);
                                arr[idx] = MATRIX_GLITCH_MATRIX_CHARS[Math.floor(Math.random() * MATRIX_GLITCH_MATRIX_CHARS.length)];
                            }
                            b.char = arr.join('');
                        } else if (b.isCodeLine) {
                            b.char = buildMatrixGlitchCodeLine(Math.max(4, String(b.char || '').length));
                        } else {
                            const glyphs = getMatrixGlitchChars();
                            b.char = glyphs[Math.floor(Math.random() * glyphs.length)];
                        }
                    }
                }
                const turnAmount = b.turnRate || b.turn || 0;
                if (turnAmount) {
                    const a = Math.atan2(b.vy, b.vx) + turnAmount * dt;
                    const speed = b.speed || Math.hypot(b.vx, b.vy);
                    b.vx = Math.cos(a) * speed;
                    b.vy = Math.sin(a) * speed;
                }
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.life -= dt;
                const hitRadius = (b.radius || 6) * (b.hitboxScale || 1);
                if (Math.hypot(player.x - b.x, player.y - b.y) <= hitRadius + getMatrixCrawlerPlayerHitboxRadius()) {
                    damageMatrixPlayer(b.damage || 9);
                    if (!isMatrixCrawlerRuntimeActive()) return;
                    if (!beginMatrixCrawlerEnemyBulletDissolve(b, { duration: 0.26, velocityScale: 0.06 })) {
                        state.enemyBullets.splice(i, 1);
                    }
                    continue;
                }
                if (b.life <= 0 || b.x < rect.x - 70 || b.x > rect.right + 70 || b.y < rect.y - 70 || b.y > rect.bottom + 70 || !isPointInMatrixCrawlerRoom(room, b.x, b.y, -12)) {
                    if (!beginMatrixCrawlerEnemyBulletDissolve(b)) {
                        state.enemyBullets.splice(i, 1);
                    }
                }
            }
            if (state.enemyBullets.length > MATRIX_GLITCH_BULLET_CAP) state.enemyBullets.splice(0, state.enemyBullets.length - MATRIX_GLITCH_BULLET_CAP);
        }

        function updateMatrixCrawlerPickups(dt) {
            const state = matrixCrawlerState;
            for (let i = state.pickups.length - 1; i >= 0; i--) {
                const p = state.pickups[i];
                p.pulse += dt * 5;
                if (Math.hypot(player.x - p.x, player.y - p.y) > p.radius + 20) continue;
                if (p.kind === 'coin') {
                    state.coins += p.amount || 1;
                    state.message = `CREDIT +${p.amount || 1}`;
                    state.messageTimer = 0.8;
                    state.pickups.splice(i, 1);
                } else if (p.kind === 'heart') {
                    player.hp = Math.min(player.maxHp, player.hp + 10 * (p.amount || 1));
                    state.pickups.splice(i, 1);
                } else if (p.kind === 'bomb') {
                    if (player.bombTimer <= 0) {
                        state.message = 'BOMB ALREADY LOADED';
                        state.messageTimer = 0.55;
                        continue;
                    }
                    setMatrixCrawlerBombLoaded(true);
                    state.message = 'BOMB RELOADED';
                    state.messageTimer = 0.85;
                    for (let burst = 0; burst < 10; burst++) {
                        emitMatrixCrawlerParticle(p.x, p.y, burst % 2 ? MATRIX_CRAWLER_BOMB_PICKUP_COLOR : MATRIX_CRAWLER_COLORS.white);
                    }
                    state.pickups.splice(i, 1);
                } else if (p.kind === 'exit') {
                    if (typeof beginRunVictoryFlow === 'function') {
                        beginRunVictoryFlow({ name: state.lastBossName || 'NULL PHANTOM', color: MATRIX_CRAWLER_COLORS.glow });
                    } else {
                        gameState = 'RUN_SCORE';
                    }
                    return;
                } else if (p.kind === 'item' && p.reward) {
                    if (p.cost > 0 && state.coins < p.cost) {
                        state.message = `NEED ${p.cost} CREDITS`;
                        state.messageTimer = 0.65;
                        continue;
                    }
                    if (p.cost > 0) {
                        state.coins -= p.cost;
                    }
                    if (p.reward.kind === 'weapon') {
                        addPlayerWeapon(p.reward.item);
                    } else if (typeof beginLevelUpOffer === 'function') {
                        const offered = buildMatrixCrawlerPowerupOffer(p.reward.item);
                        if (offered.length > 0) {
                            player.level += 1;
                            const room = getMatrixCrawlerRoom();
                            if (room) room.rewardClaimed = true;
                            state.message = 'POWERUP OPTIONS';
                            state.messageTimer = 1.15;
                            state.pickups.splice(i, 1);
                            beginLevelUpOffer({
                                returnState: MATRIX_CRAWLER_GAME_STATE,
                                offeredOptions: offered
                            });
                            return;
                        }
                    } else if (typeof applyPowerup === 'function') {
                        applyPowerup(p.reward.item);
                    }
                    player.level += 1;
                    const room = getMatrixCrawlerRoom();
                    if (room) room.rewardClaimed = true;
                    state.message = p.reward.label || 'ITEM ACQUIRED';
                    state.messageTimer = 1.15;
                    state.pickups.splice(i, 1);
                }
            }
        }

        function updateMatrixCrawlerBreakables(dt) {
            for (const object of matrixCrawlerState.breakables || []) {
                if (!object || object.destroyed) continue;
                object.flashTimer = Math.max(0, (object.flashTimer || 0) - dt);
                object.phase = (object.phase || 0) + dt * 1.8;
            }
        }

        function updateMatrixCrawlerDoors() {
            const room = getMatrixCrawlerRoom();
            if (!room || !room.clear) return;
            for (const dir of MATRIX_CRAWLER_DIRS) {
                const target = room.neighbors[dir.id];
                if (!target) continue;
                if (isMatrixCrawlerPlayerTouchingDoor(room, dir.id)) {
                    enterMatrixCrawlerRoom(target, dir.id);
                    return;
                }
            }
        }

        function updateMatrixCrawlerRoomClear() {
            const state = matrixCrawlerState;
            const room = getMatrixCrawlerRoom();
            if (!room || room.clear || state.enemies.length > 0) return;
            room.clear = true;
            state.roomsCleared++;
            player.xp = Math.min(state.totalCombatRooms || 1, state.roomsCleared);
            player.xpNeeded = Math.max(1, state.totalCombatRooms || 1);
            state.message = room.type === 'boss' ? 'FLOOR ROUTE OPEN' : 'ROOM CLEAR';
            state.messageTimer = 1.1;
            state.roomFlash = 0.45;
            if (room.type === 'boss') {
                if (typeof recordRunBossDefeated === 'function') recordRunBossDefeated();
            } else {
                if (Math.random() < 0.38) spawnMatrixPickup(player.x, player.y - 22, 'coin', { amount: 1 + (Math.random() < 0.18 ? 1 : 0) });
                if (Math.random() < 0.10) spawnMatrixPickup(player.x + 26, player.y, 'heart', { amount: 1, color: '#ff8fb5' });
                if (Math.random() < (player.bombTimer > 0 ? 0.16 : 0.035)) {
                    spawnMatrixPickup(player.x - 26, player.y + 4, 'bomb', { color: MATRIX_CRAWLER_BOMB_PICKUP_COLOR });
                }
            }
            spawnMatrixRoomPickups(room);
        }

        function updateMatrixCrawlerParticles(dt) {
            const state = matrixCrawlerState;
            const turnAfterimages = state.playerTurnAfterimages || [];
            for (let i = turnAfterimages.length - 1; i >= 0; i--) {
                turnAfterimages[i].life -= dt;
                if (turnAfterimages[i].life <= 0) turnAfterimages.splice(i, 1);
            }
            for (let i = state.particles.length - 1; i >= 0; i--) {
                const p = state.particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vx *= Math.pow(0.12, dt);
                p.vy *= Math.pow(0.12, dt);
                p.life -= dt;
                if (p.life <= 0) state.particles.splice(i, 1);
            }
            if (state.particles.length > 240) state.particles.splice(0, state.particles.length - 240);
        }

        function updateMatrixCrawler(dt) {
            if (!isMatrixCrawlerRuntimeActive()) return;
            const safeDt = Math.max(0, Math.min(0.05, dt || 0));
            const hostileDt = typeof getHostileDt === 'function' ? getHostileDt(safeDt) : safeDt;
            if (typeof updateFieldParticles === 'function') updateFieldParticles(safeDt * 0.42);
            const state = matrixCrawlerState;
            if (state.messageTimer > 0) state.messageTimer = Math.max(0, state.messageTimer - safeDt);
            if (state.roomFlash > 0) state.roomFlash = Math.max(0, state.roomFlash - safeDt);
            if (state.controlDecalTimer > 0) {
                state.controlDecalTimer = Math.max(0, state.controlDecalTimer - safeDt);
                if (state.controlDecalTimer <= 0) state.controlDecal = null;
            }
            if (typeof shake === 'number' && shake > 0) {
                shake *= Math.pow(0.88, safeDt * 60);
                if (shake < 0.35) shake = 0;
            }
            updateMatrixCrawlerPlayer(safeDt);
            if (!isMatrixCrawlerRuntimeActive()) return;
            setMatrixCrawlerCameraToPlayer(false);
            updateMatrixCrawlerProjectiles(safeDt);
            if (!isMatrixCrawlerRuntimeActive()) return;
            updateMatrixCrawlerBombs(safeDt);
            if (!isMatrixCrawlerRuntimeActive()) return;
            updateMatrixCrawlerEnemies(hostileDt);
            if (!isMatrixCrawlerRuntimeActive()) return;
            updateMatrixCrawlerBullets(hostileDt);
            if (!isMatrixCrawlerRuntimeActive()) return;
            updateMatrixCrawlerPickups(safeDt);
            if (!isMatrixCrawlerRuntimeActive()) return;
            updateMatrixCrawlerBreakables(safeDt);
            if (!isMatrixCrawlerRuntimeActive()) return;
            updateMatrixCrawlerParticles(safeDt);
            if (!isMatrixCrawlerRuntimeActive()) return;
            updateMatrixCrawlerRoomClear();
            if (!isMatrixCrawlerRuntimeActive()) return;
            updateMatrixCrawlerDoors();
        }

        function getMatrixCrawlerHudSnapshot() {
            const room = getMatrixCrawlerRoom();
            return {
                active: isMatrixCrawlerModeActive(),
                coins: matrixCrawlerState.coins || 0,
                roomTitle: getMatrixRoomTitle(room),
                roomType: room ? room.type : 'start',
                roomsCleared: matrixCrawlerState.roomsCleared || 0,
                totalCombatRooms: matrixCrawlerState.totalCombatRooms || 1
            };
        }

        function matrixCrawlerControlEaseOutCubic(t) {
            const clamped = Math.max(0, Math.min(1, t || 0));
            return 1 - Math.pow(1 - clamped, 3);
        }

        function getMatrixCrawlerControlDecal(rect) {
            const state = matrixCrawlerState;
            if (!state.controlDecal) {
                state.controlDecal = {
                    x: rect.x + rect.w / 2,
                    y: rect.y + Math.max(92, Math.min(rect.h - 68, rect.h * 0.72)),
                    seed: (state.floor || 1) * 977 + 421
                };
            }
            return state.controlDecal;
        }

        function drawMatrixCrawlerControlPairDecal(pair, x, y, alpha, fontSize) {
            const keyFont = `bold ${fontSize}px 'Electrolize', sans-serif`;
            const actionFont = `bold ${Math.max(9, fontSize - 1)}px 'Electrolize', sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';

            ctx.font = keyFont;
            const keyPadX = Math.round(fontSize * 0.58);
            const keyW = Math.ceil(ctx.measureText(pair.key).width + keyPadX * 2);
            const keyH = Math.max(18, Math.round(fontSize * 1.62));
            const keyY = y - keyH / 2;

            ctx.globalAlpha = alpha * 0.12;
            ctx.fillStyle = colorWithAlpha('#00180d', 0.78);
            ctx.fillRect(x, keyY, keyW, keyH);
            ctx.globalAlpha = alpha * 0.26;
            ctx.strokeStyle = colorWithAlpha(pair.color || MATRIX_CRAWLER_COLORS.glow, 0.72);
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, keyY + 0.5, keyW, keyH);

            ctx.globalAlpha = alpha * 0.76;
            ctx.fillStyle = '#d9fff1';
            if (glowEnabled) {
                ctx.shadowColor = pair.color || MATRIX_CRAWLER_COLORS.glow;
                ctx.shadowBlur = 3 * alpha;
            }
            ctx.fillText(pair.key, x + keyPadX, y + 1);
            ctx.shadowBlur = 0;

            const actionX = x + keyW + Math.round(fontSize * 0.52);
            ctx.font = actionFont;
            ctx.globalAlpha = alpha * 0.62;
            ctx.fillStyle = pair.color || MATRIX_CRAWLER_COLORS.glow;
            ctx.fillText(pair.action, actionX, y + 1);
            ctx.globalAlpha = 1;
            return actionX + ctx.measureText(pair.action).width - x;
        }

        function drawMatrixCrawlerControlDecal(rect, now) {
            const state = matrixCrawlerState;
            const room = getMatrixCrawlerRoom();
            if (!state || !room || room.type !== 'start') return;
            const timer = state.controlDecalTimer || 0;
            if (timer <= 0.01) return;
            const decal = getMatrixCrawlerControlDecal(rect);
            const life = Math.max(0, Math.min(1, timer / MATRIX_CRAWLER_CONTROL_DECAL_DURATION));
            const age = MATRIX_CRAWLER_CONTROL_DECAL_DURATION - timer;
            const introAlpha = matrixCrawlerControlEaseOutCubic(Math.max(0, Math.min(1, age / 0.72)));
            const fadeAlpha = life > 0.52 ? 1 : matrixCrawlerControlEaseOutCubic(Math.max(0, Math.min(1, life / 0.52)));
            const fizzle = 1 - Math.max(0, Math.min(1, life / 0.58));
            const baseAlpha = 0.50 * introAlpha * fadeAlpha;
            if (baseAlpha <= 0.01) return;

            const pairs = [
                { key: 'WASD', action: 'MOVE', color: '#8ff7ff' },
                { key: 'ARROWS', action: 'AIM', color: '#9fb8ff' },
                { key: 'SPACE', action: 'BOMB', color: MATRIX_CRAWLER_BOMB_PICKUP_COLOR },
                { key: 'SHIFT', action: 'FOCUS', color: '#b7ffcf' }
            ];
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            const maxW = Math.min(rect.w * 0.72, 680);
            let fontSize = width < 900 ? 10 : 12;
            let gap = Math.round(fontSize * 1.08);
            const sep = '::';
            const measurePair = (pair) => {
                ctx.font = `bold ${fontSize}px 'Electrolize', sans-serif`;
                const keyW = ctx.measureText(pair.key).width + Math.round(fontSize * 0.58) * 2;
                ctx.font = `bold ${Math.max(9, fontSize - 1)}px 'Electrolize', sans-serif`;
                return keyW + Math.round(fontSize * 0.52) + ctx.measureText(pair.action).width;
            };
            let totalW = 0;
            for (let i = 0; i < pairs.length; i++) {
                totalW += measurePair(pairs[i]);
                if (i < pairs.length - 1) {
                    ctx.font = `bold ${fontSize}px Courier New`;
                    totalW += gap * 2 + ctx.measureText(sep).width;
                }
            }
            if (totalW > maxW) {
                fontSize = Math.max(9, Math.floor(fontSize * maxW / totalW));
                gap = Math.round(fontSize * 1.08);
                totalW = 0;
                for (let i = 0; i < pairs.length; i++) {
                    totalW += measurePair(pairs[i]);
                    if (i < pairs.length - 1) {
                        ctx.font = `bold ${fontSize}px Courier New`;
                        totalW += gap * 2 + ctx.measureText(sep).width;
                    }
                }
            }

            const y = decal.y + Math.sin(now * 0.00042 + decal.seed) * 1.5;
            const x = decal.x;
            const panelH = Math.max(26, Math.round(fontSize * 2.12));
            const panelX = x - totalW / 2 - 18;
            const panelY = y - panelH / 2;
            const panelW = totalW + 36;

            ctx.globalAlpha = baseAlpha * 0.10;
            ctx.fillStyle = MATRIX_CRAWLER_COLORS.glow;
            ctx.fillRect(panelX, panelY, panelW, panelH);
            ctx.globalAlpha = baseAlpha * 0.20;
            ctx.strokeStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.grid, 0.62);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(panelX + 10, panelY + 3);
            ctx.lineTo(panelX + panelW - 10, panelY + 3);
            ctx.moveTo(panelX + 10, panelY + panelH - 3);
            ctx.lineTo(panelX + panelW - 10, panelY + panelH - 3);
            for (let i = 1; i < 5; i++) {
                const tx = panelX + panelW * i / 5;
                ctx.moveTo(tx, panelY + 4);
                ctx.lineTo(tx + 8, panelY + panelH - 4);
            }
            ctx.stroke();

            let cursorX = x - totalW / 2;
            for (let i = 0; i < pairs.length; i++) {
                const pairW = drawMatrixCrawlerControlPairDecal(pairs[i], cursorX, y, baseAlpha, fontSize);
                cursorX += pairW;
                if (i < pairs.length - 1) {
                    cursorX += gap;
                    ctx.font = `bold ${fontSize}px Courier New`;
                    ctx.globalAlpha = baseAlpha * 0.34;
                    ctx.fillStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.glow, 0.74);
                    ctx.fillText(sep, cursorX, y + 1);
                    cursorX += ctx.measureText(sep).width + gap;
                }
            }

            if (fizzle > 0.02) {
                const glyphs = ['0', '1', '.', ':'];
                ctx.font = `bold ${Math.max(7, fontSize - 4)}px Courier New`;
                for (let i = 0; i < 18; i++) {
                    const n1 = Math.sin(decal.seed + i * 19.11) * 43758.5453;
                    const n2 = Math.sin(decal.seed + i * 29.77 + 6.2) * 33731.331;
                    const n3 = Math.sin(decal.seed + i * 37.41 + 2.1) * 27181.13;
                    const a = n1 - Math.floor(n1);
                    const b = n2 - Math.floor(n2);
                    const c = n3 - Math.floor(n3);
                    ctx.globalAlpha = baseAlpha * fizzle * (0.07 + c * 0.16);
                    ctx.fillStyle = c > 0.72 ? '#d9fff1' : MATRIX_CRAWLER_COLORS.glow;
                    ctx.fillText(
                        glyphs[i % glyphs.length],
                        panelX + a * panelW + Math.sin(now * 0.0013 + i) * fizzle * 16,
                        panelY + b * panelH + fizzle * (6 + a * 18)
                    );
                }
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawMatrixCrawlerGrid(rect, now) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(rect.x, rect.y, rect.w, rect.h);
            ctx.clip();
            const bg = ctx.createLinearGradient(0, rect.y, 0, rect.bottom);
            bg.addColorStop(0, '#020c07');
            bg.addColorStop(0.55, '#03170d');
            bg.addColorStop(1, '#010604');
            ctx.fillStyle = bg;
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            ctx.globalCompositeOperation = 'screen';
            ctx.lineWidth = 1;
            const drift = (now * 0.018) % 24;
            for (let x = rect.x + 18; x < rect.right; x += 24) {
                ctx.globalAlpha = 0.10;
                ctx.strokeStyle = MATRIX_CRAWLER_COLORS.grid;
                ctx.beginPath();
                ctx.moveTo(Math.round(x) + 0.5, rect.y);
                ctx.lineTo(Math.round(x) + 0.5, rect.bottom);
                ctx.stroke();
            }
            for (let y = rect.y + 12 - drift; y < rect.bottom; y += 24) {
                ctx.globalAlpha = 0.08;
                ctx.strokeStyle = MATRIX_CRAWLER_COLORS.grid;
                ctx.beginPath();
                ctx.moveTo(rect.x, Math.round(y) + 0.5);
                ctx.lineTo(rect.right, Math.round(y) + 0.5);
                ctx.stroke();
            }
            ctx.globalAlpha = 0.13;
            ctx.font = 'bold 10px Courier New';
            ctx.fillStyle = '#41ff93';
            const codeCount = Math.min(70, Math.max(22, Math.round((rect.w * rect.h) / 26000)));
            for (let i = 0; i < codeCount; i++) {
                const x = rect.x + ((i * 97 + now * 0.012) % rect.w);
                const y = rect.y + ((i * 53 + now * 0.026) % rect.h);
                ctx.fillText(i % 3 === 0 ? '01' : (i % 3 === 1 ? 'ptr' : 'sys'), x, y);
            }
            drawMatrixCrawlerControlDecal(rect, now);
            ctx.restore();
        }

        function getMatrixCrawlerFocusVisualIntensity() {
            const drive = typeof getFocusDriveRenderIntensity === 'function' ? getFocusDriveRenderIntensity() : 0;
            const specter = typeof getSpecterRenderIntensity === 'function' ? getSpecterRenderIntensity() : 0;
            return Math.max(0, Math.min(1, Math.max(drive, specter * 0.72)));
        }

        function getMatrixCrawlerFocusTrailOffset(obj, layer, amount = 0.026) {
            if (typeof getFocusTrailOffset === 'function') return getFocusTrailOffset(obj, layer, amount);
            const intensity = getMatrixCrawlerFocusVisualIntensity();
            return {
                x: -((obj && obj.vx) || 0) * amount * layer * intensity,
                y: -((obj && obj.vy) || 0) * amount * layer * intensity
            };
        }

        function drawMatrixCrawlerFocusFloorWarp(rect, now) {
            const intensity = getMatrixCrawlerFocusVisualIntensity();
            if (intensity <= 0.025) return;
            ctx.save();
            ctx.beginPath();
            ctx.rect(rect.x, rect.y, rect.w, rect.h);
            ctx.clip();
            ctx.globalCompositeOperation = 'screen';

            ctx.globalAlpha = 0.055 * intensity;
            ctx.fillStyle = '#68ff9a';
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

            ctx.lineWidth = 1;
            const sweep = ((now || 0) * 0.072) % 54;
            ctx.strokeStyle = colorWithAlpha('#caffda', 0.72);
            for (let y = rect.y + sweep - 54; y < rect.bottom + 54; y += 54) {
                const wobble = Math.sin((now || 0) * 0.004 + y * 0.018) * 10 * intensity;
                ctx.globalAlpha = 0.075 * intensity;
                ctx.beginPath();
                ctx.moveTo(rect.x, y);
                ctx.lineTo(rect.x + rect.w * 0.34 + wobble, y + 2);
                ctx.lineTo(rect.x + rect.w * 0.68 - wobble, y - 2);
                ctx.lineTo(rect.right, y);
                ctx.stroke();
            }

            ctx.globalAlpha = 0.05 * intensity;
            ctx.strokeStyle = '#8ff7ff';
            const diagonalDrift = ((now || 0) * 0.038) % 90;
            for (let x = rect.x - rect.h + diagonalDrift; x < rect.right + rect.h; x += 90) {
                ctx.beginPath();
                ctx.moveTo(x, rect.bottom);
                ctx.lineTo(x + rect.h, rect.y);
                ctx.stroke();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawMatrixCrawlerFocusViewportOverlay(viewport, now) {
            const intensity = getMatrixCrawlerFocusVisualIntensity();
            if (intensity <= 0.025) return;
            ctx.save();
            ctx.beginPath();
            ctx.rect(viewport.x, viewport.y, viewport.w, viewport.h);
            ctx.clip();
            if (typeof drawFocusTimeWarpOverlay === 'function') drawFocusTimeWarpOverlay(now, true);
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.10 * intensity;
            ctx.strokeStyle = colorWithAlpha('#caffda', 0.8);
            ctx.lineWidth = 1;
            const xStart = viewport.x + (((now || 0) * 0.032) % 86) - 86;
            for (let x = xStart; x < viewport.right + 86; x += 86) {
                const drift = Math.sin((now || 0) * 0.003 + x * 0.04) * 18 * intensity;
                ctx.beginPath();
                ctx.moveTo(x + drift, viewport.y);
                ctx.lineTo(x - drift * 0.6, viewport.bottom);
                ctx.stroke();
            }
            ctx.globalAlpha = 0.12 * intensity;
            ctx.strokeStyle = colorWithAlpha('#8ff7ff', 0.58);
            ctx.strokeRect(viewport.x + 4.5, viewport.y + 4.5, viewport.w - 9, viewport.h - 9);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawMatrixCrawlerBlockedArea(room, rect, now) {
            const blockedRects = getMatrixCrawlerBlockedRects(room, rect);
            if (!blockedRects.length) return;
            ctx.save();
            for (let zoneIndex = 0; zoneIndex < blockedRects.length; zoneIndex++) {
                const blocked = blockedRects[zoneIndex];
                const pulse = 0.5 + Math.sin(now * 0.003 + blocked.seed) * 0.5;
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'rgba(0, 5, 3, 0.94)';
                ctx.fillRect(blocked.x, blocked.y, blocked.w, blocked.h);
                ctx.strokeStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.wall, 0.44 + pulse * 0.18);
                ctx.lineWidth = 2;
                ctx.shadowColor = MATRIX_CRAWLER_COLORS.glow;
                ctx.shadowBlur = glowEnabled ? 6 + pulse * 4 : 0;
                ctx.strokeRect(blocked.x + 0.5, blocked.y + 0.5, blocked.w - 1, blocked.h - 1);
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.20;
                ctx.strokeStyle = MATRIX_CRAWLER_COLORS.grid;
                for (let i = -blocked.h; i < blocked.w; i += 24) {
                    ctx.beginPath();
                    ctx.moveTo(blocked.x + i, blocked.y + blocked.h);
                    ctx.lineTo(blocked.x + i + blocked.h, blocked.y);
                    ctx.stroke();
                }
                ctx.globalAlpha = 0.24 + pulse * 0.12;
                ctx.font = "bold 12px 'Electrolize', sans-serif";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.glow, 0.72);
                ctx.fillText(blocked.label || 'NULL', blocked.x + blocked.w / 2, blocked.y + blocked.h / 2);
                ctx.globalAlpha = 0.12 + pulse * 0.08;
                ctx.font = 'bold 9px Courier New';
                ctx.fillStyle = MATRIX_CRAWLER_COLORS.glow;
                const glyphs = Math.min(9, Math.max(3, Math.round((blocked.w * blocked.h) / 18000)));
                for (let i = 0; i < glyphs; i++) {
                    const gx = blocked.x + ((blocked.seed * 37 + i * 29 + now * 0.018) % blocked.w);
                    const gy = blocked.y + ((blocked.seed * 53 + i * 31 + now * 0.011) % blocked.h);
                    ctx.fillText(i % 2 ? 'err' : '0x', gx, gy);
                }
            }
            ctx.restore();
        }

        function drawMatrixCrawlerBreakable(object, now) {
            if (!object || object.destroyed) return;
            const r = object.radius || 16;
            const pulse = 0.5 + Math.sin(now * 0.004 + object.phase) * 0.5;
            const flash = object.flashTimer > 0 ? 1 : 0;
            ctx.save();
            ctx.translate(object.x, object.y + Math.sin(now * 0.0025 + object.phase) * 1.8);
            ctx.globalAlpha = 0.88;
            ctx.fillStyle = flash ? colorWithAlpha(MATRIX_CRAWLER_COLORS.white, 0.72) : colorWithAlpha('#06160f', 0.84);
            ctx.strokeStyle = flash ? MATRIX_CRAWLER_COLORS.white : colorWithAlpha(object.color || MATRIX_CRAWLER_COLORS.glow, 0.78);
            ctx.lineWidth = 1.5;
            if (glowEnabled) {
                ctx.shadowColor = object.color || MATRIX_CRAWLER_COLORS.glow;
                ctx.shadowBlur = 6 + pulse * 5 + flash * 8;
            }
            ctx.beginPath();
            ctx.rect(-r * 0.85, -r * 0.72, r * 1.7, r * 1.44);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.36 + pulse * 0.16;
            ctx.strokeStyle = object.color || MATRIX_CRAWLER_COLORS.glow;
            ctx.beginPath();
            ctx.moveTo(-r * 0.58, -r * 0.72);
            ctx.lineTo(r * 0.58, r * 0.72);
            ctx.moveTo(r * 0.58, -r * 0.72);
            ctx.lineTo(-r * 0.58, r * 0.72);
            ctx.stroke();
            ctx.globalAlpha = 0.92;
            ctx.fillStyle = flash ? MATRIX_CRAWLER_COLORS.white : (object.color || MATRIX_CRAWLER_COLORS.glow);
            ctx.font = `bold ${Math.max(12, Math.round(r * 0.82))}px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(object.char || '[]', 0, 1);
            ctx.restore();
        }

        function drawMatrixCrawlerDoors(room, rect, now = 0) {
            const open = room && room.clear;
            for (let dirIndex = 0; dirIndex < MATRIX_CRAWLER_DIRS.length; dirIndex++) {
                const dir = MATRIX_CRAWLER_DIRS[dirIndex];
                if (!room.neighbors[dir.id]) continue;
                const d = getMatrixCrawlerDoorRect(room, dir.id);
                const horizontal = dir.id === 'N' || dir.id === 'S';
                const seed = (room.index || 0) * 1.73 + dirIndex * 2.37;
                const pulse = 0.5 + Math.sin(now * 0.0042 + seed) * 0.5;
                const quietFlicker = 0.5 + Math.sin(now * 0.017 + seed * 1.9) * 0.5;
                const goodColor = colorWithAlpha(MATRIX_CRAWLER_COLORS.glow, 0.62 + pulse * 0.13);
                const lockColor = colorWithAlpha('#a8b0bb', 0.36 + quietFlicker * 0.12);
                ctx.save();
                ctx.fillStyle = open ? 'rgba(4, 26, 13, 0.90)' : 'rgba(10, 13, 17, 0.88)';
                ctx.strokeStyle = open ? goodColor : lockColor;
                ctx.shadowColor = ctx.strokeStyle;
                ctx.shadowBlur = glowEnabled ? (open ? 8 + pulse * 3 : 3 + quietFlicker * 2) : 0;
                ctx.lineWidth = 2;
                ctx.fillRect(d.x, d.y, d.w, d.h);
                ctx.strokeRect(d.x + 0.5, d.y + 0.5, d.w - 1, d.h - 1);

                ctx.globalCompositeOperation = 'screen';
                if (open) {
                    const scan = (0.18 + ((now * 0.00018 + seed) % 0.64));
                    ctx.globalAlpha = 0.14 + pulse * 0.08;
                    ctx.fillStyle = colorWithAlpha('#e6fff1', 0.30);
                    if (horizontal) {
                        ctx.fillRect(d.x + 8, d.y + d.h * 0.5 - 1, d.w - 16, 2);
                        ctx.fillStyle = colorWithAlpha('#8ff7ff', 0.26);
                        ctx.fillRect(d.x + d.w * scan, d.y + 4, 2, d.h - 8);
                    } else {
                        ctx.fillRect(d.x + d.w * 0.5 - 1, d.y + 8, 2, d.h - 16);
                        ctx.fillStyle = colorWithAlpha('#8ff7ff', 0.26);
                        ctx.fillRect(d.x + 4, d.y + d.h * scan, d.w - 8, 2);
                    }
                    ctx.globalAlpha = 0.16 + pulse * 0.05;
                    ctx.strokeStyle = colorWithAlpha('#ffffff', 0.22);
                    ctx.strokeRect(d.x + 5.5, d.y + 5.5, d.w - 11, d.h - 11);
                } else {
                    ctx.globalAlpha = 0.16 + quietFlicker * 0.07;
                    ctx.strokeStyle = colorWithAlpha('#d6dbe2', 0.20);
                    ctx.lineWidth = 1;
                    for (let i = 0; i < 3; i++) {
                        const offset = Math.sin(now * (0.012 + i * 0.002) + seed + i * 2.1) * 3;
                        const lane = (i + 1) / 4;
                        ctx.beginPath();
                        if (horizontal) {
                            const y = d.y + d.h * lane + offset * 0.25;
                            ctx.moveTo(d.x + 9 + offset, y);
                            ctx.lineTo(d.x + d.w - 9 + offset * 0.35, y);
                        } else {
                            const x = d.x + d.w * lane + offset * 0.25;
                            ctx.moveTo(x, d.y + 9 + offset);
                            ctx.lineTo(x, d.y + d.h - 9 + offset * 0.35);
                        }
                        ctx.stroke();
                    }
                    const glitchKick = Math.max(0, Math.sin(now * 0.024 + seed * 3.3) - 0.88) * 8.33;
                    if (glitchKick > 0) {
                        ctx.globalAlpha = glitchKick * 0.18;
                        ctx.fillStyle = colorWithAlpha('#d6dbe2', 0.42);
                        if (horizontal) {
                            ctx.fillRect(d.x + 12 + Math.sin(seed) * 7, d.y + 6, d.w * 0.34, 2);
                            ctx.fillRect(d.x + d.w * 0.52, d.y + d.h - 8, d.w * 0.24, 2);
                        } else {
                            ctx.fillRect(d.x + 6, d.y + 12 + Math.cos(seed) * 7, 2, d.h * 0.34);
                            ctx.fillRect(d.x + d.w - 8, d.y + d.h * 0.52, 2, d.h * 0.24);
                        }
                    }
                }
                ctx.restore();
            }
        }

        function drawMatrixCrawlerRoomFrame(room, rect, now) {
            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = MATRIX_CRAWLER_COLORS.wall;
            ctx.shadowColor = MATRIX_CRAWLER_COLORS.glow;
            ctx.shadowBlur = glowEnabled ? 13 : 0;
            ctx.strokeRect(rect.x - 1.5, rect.y - 1.5, rect.w + 3, rect.h + 3);
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
            ctx.strokeStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.white, 0.20);
            ctx.strokeRect(rect.x + 8.5, rect.y + 8.5, rect.w - 17, rect.h - 17);
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.24;
            ctx.strokeStyle = room && room.clear ? MATRIX_CRAWLER_COLORS.glow : colorWithAlpha('#a8b0bb', 0.38);
            const scanX = rect.x + ((now * 0.045) % rect.w);
            ctx.beginPath();
            ctx.moveTo(scanX, rect.y + 11);
            ctx.lineTo(scanX, rect.bottom - 11);
            ctx.stroke();
            ctx.restore();
            drawMatrixCrawlerDoors(room, rect, now);
        }

        function drawMatrixCrawlerHoverAura(now) {
            const state = matrixCrawlerState;
            const ripples = state.hoverRipples || [];
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const speed = Math.min(1, Math.hypot(player.vx || 0, player.vy || 0) / 260);
            const hoverActivation = Math.max(0, Math.min(1, (Math.hypot(player.vx || 0, player.vy || 0) - 28) / 210));
            const basePulse = 0.5 + Math.sin(now * 0.006) * 0.5;
            const baseRadius = 16 + basePulse * 4 + speed * 4 + hoverActivation * 4;
            const auraOrigin = getMatrixCrawlerHoverDriveOrigin();
            const aura = ctx.createRadialGradient(auraOrigin.x, auraOrigin.y, 0, auraOrigin.x, auraOrigin.y, baseRadius * 1.8);
            aura.addColorStop(0, colorWithAlpha('#effcff', 0.055 + hoverActivation * 0.050));
            aura.addColorStop(0.42, colorWithAlpha('#9fefff', 0.040 + hoverActivation * 0.034));
            aura.addColorStop(1, colorWithAlpha('#58c9ff', 0));
            ctx.fillStyle = aura;
            ctx.fillRect(auraOrigin.x - baseRadius * 2, auraOrigin.y - baseRadius * 2, baseRadius * 4, baseRadius * 4);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < ripples.length; i++) {
                const r = ripples[i];
                const lifeRatio = Math.max(0, Math.min(1, r.life / Math.max(0.001, r.maxLife)));
                const age = 1 - lifeRatio;
                const activation = Math.max(hoverActivation, r.hoverActivation || 0);
                const alpha = Math.sin(lifeRatio * Math.PI) * (0.18 + speed * 0.045 + activation * 0.095) * (r.alphaScale || 0.75);
                if (alpha <= 0.002) continue;
                const wave = Math.sin((now || 0) * 0.010 + (r.phase || 0));
                const color = activation > 0.58
                    ? (age < 0.24 ? '#ffffff' : (age < 0.68 ? '#bffcff' : '#73e4ff'))
                    : (age < 0.24 ? '#f4fdff' : (age < 0.66 ? '#8ff7ff' : '#58c9ff'));
                ctx.save();
                ctx.translate(r.x, r.y);
                ctx.rotate((r.rotation || 0) + wave * 0.12);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = glowEnabled ? 3 + alpha * 8 + activation * 9 : 0;
                ctx.font = `bold ${Math.max(7, Math.round((r.size || 10) * (0.88 + age * 0.38)))}px Courier New`;
                ctx.fillText(r.char || '.', 0, 0);
                ctx.restore();
            }
            ctx.restore();
        }

        function drawMatrixCrawlerHoverThrusters(now) {
            const state = matrixCrawlerState;
            const thrusters = state.hoverThrusters || [];
            if (!thrusters.length) return;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < thrusters.length; i++) {
                const t = thrusters[i];
                const lifeRatio = Math.max(0, Math.min(1, t.life / Math.max(0.001, t.maxLife || 0.25)));
                if (lifeRatio <= 0.01) continue;
                const activation = Math.max(0, Math.min(1, t.activation || 0));
                const flicker = 0.82 + Math.sin((now || 0) * 0.035 + (t.phase || 0)) * 0.18;
                const alpha = lifeRatio * (0.24 + activation * 0.22) * flicker;
                const color = getMatrixCrawlerHoverDriveColor(activation, lifeRatio > 0.72);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = glowEnabled ? 3 + activation * 7 + lifeRatio * 4 : 0;
                ctx.font = `bold ${Math.max(6, Math.round((t.size || 8) * (0.75 + lifeRatio * 0.32)))}px Courier New`;
                ctx.fillText(t.char || '.', t.x, t.y);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerPlayerLayoutTint(layout, tint) {
            for (let i = 0; i < layout.thrusters.length; i++) drawPlayerPart(layout.thrusters[i], null, tint);
            for (let i = 0; i < layout.accents.length; i++) drawPlayerPart(layout.accents[i], null, tint);
            drawPlayerPart(layout.body, null, tint);
        }

        function drawMatrixCrawlerPlayerAfterimages(now) {
            const afterimages = matrixCrawlerState.playerTurnAfterimages || [];
            if (!afterimages.length) return;
            const oldX = player.x;
            const oldY = player.y;
            const oldCache = player._renderLayoutCache;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalCompositeOperation = 'source-over';
            for (let i = 0; i < afterimages.length; i++) {
                const ghost = afterimages[i];
                const lifeRatio = Math.max(0, Math.min(1, ghost.life / Math.max(0.001, ghost.maxLife || MATRIX_CRAWLER_TURN_AFTERIMAGE_LIFE)));
                if (lifeRatio <= 0.01) continue;
                const ghostX = ghost.x + (ghost.offsetX || 0) * lifeRatio;
                const ghostY = ghost.y + (ghost.offsetY || 0) * lifeRatio;
                player.x = ghostX;
                player.y = ghostY;
                player._renderLayoutCache = null;
                const layout = getPlayerRenderLayout(player, 'center');
                const alpha = Math.pow(lifeRatio, 1.65);
                const pulse = 0.85 + Math.sin(now * 0.025 + i) * 0.15;
                ctx.save();
                ctx.translate(ghostX, ghostY);
                ctx.rotate(ghost.angle + Math.PI / 2);
                ctx.scale(MATRIX_CRAWLER_PLAYER_RENDER_SCALE * (1.02 + (1 - lifeRatio) * 0.04), MATRIX_CRAWLER_PLAYER_RENDER_SCALE);
                ctx.translate(-ghostX, -ghostY);
                ctx.shadowColor = ghost.color || '#8ff7ff';
                ctx.shadowBlur = glowEnabled ? 6 * alpha + 2 * pulse : 0;
                ctx.fillStyle = '#8ff7ff';
                ctx.globalAlpha = 0.12 * alpha;
                for (const offset of [[-0.8, 0], [0.8, 0], [0, -0.8], [0, 0.8]]) {
                    ctx.save();
                    ctx.translate(offset[0], offset[1]);
                    drawMatrixCrawlerPlayerLayoutTint(layout, { color: '#8ff7ff', amount: 0.58 });
                    ctx.restore();
                }
                ctx.globalAlpha = 0.045 * alpha;
                drawMatrixCrawlerPlayerLayoutTint(layout, { color: '#e7fbff', amount: 0.48 });
                ctx.restore();
            }
            player.x = oldX;
            player.y = oldY;
            player._renderLayoutCache = oldCache;
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerShip(now) {
            const blink = matrixCrawlerState.invuln > 0 && Math.floor(now / 70) % 2 === 0;
            if (blink) return;
            ctx.save();
            ctx.translate(player.x, player.y);
            ctx.rotate(getMatrixCrawlerPlayerAimAngle() + Math.PI / 2);
            ctx.scale(MATRIX_CRAWLER_PLAYER_RENDER_SCALE, MATRIX_CRAWLER_PLAYER_RENDER_SCALE);
            ctx.translate(-player.x, -player.y);
            const pulseVisuals = typeof getPlayerPulseVisuals === 'function'
                ? getPlayerPulseVisuals(now)
                : { color: '#f3fbff', glow: 12 };
            const damageFlash = player.flashTimer > 0;
            ctx.fillStyle = damageFlash ? '#ff2200' : pulseVisuals.color;
            ctx.shadowColor = damageFlash ? '#ff2200' : '#8ff7ff';
            ctx.shadowBlur = damageFlash ? 26 : (glowEnabled ? Math.max(12, pulseVisuals.glow * 0.9) : 0);
            drawPlayerShip(player, 'center');
            ctx.restore();
        }

        function drawMatrixCrawlerRobot(now) {
            drawMatrixCrawlerHoverAura(now);
            drawMatrixCrawlerHoverThrusters(now);
            drawMatrixCrawlerPlayerAfterimages(now);
            drawMatrixCrawlerShip(now);
        }

        function getMatrixNullPhantomIntroPose(entity) {
            if (!entity) return { x: 0, y: 0, scale: 1, alpha: 1, depth: 1, progress: 1, closeGlow: 1 };
            const introActive = entity.phase === 'INTRO';
            const progress = introActive
                ? Math.max(0, Math.min(1, (entity.timer || 0) / Math.max(0.001, entity.introDuration || 4)))
                : 1;
            const depth = introActive && Number.isFinite(entity.introDepth) ? entity.introDepth : (introActive ? getMatrixBossIntroDepth(progress) : 1);
            if (!introActive) {
                return {
                    x: entity.x,
                    y: entity.y,
                    scale: 1,
                    alpha: 1,
                    depth,
                    progress,
                    closeGlow: 1
                };
            }
            const travel = smoothMatrixIntroStep(progress);
            const drift = Math.sin(progress * Math.PI) * (1 - travel);
            const x = (entity.introTargetX ?? entity.x) + (entity.introApproachOffsetX || 0) * (1 - travel) + drift * 18;
            const y = (entity.introTargetY ?? entity.y) + (entity.introApproachOffsetY || 0) * (1 - travel);
            const scale = 0.045 + Math.pow(depth, 1.72) * 0.955;
            const alpha = Math.min(1, entity.introAlpha ?? easeMatrixBossIntro(progress));
            const closeGlow = smoothMatrixIntroStep(Math.max(0, Math.min(1, (depth - 0.58) / 0.42)));
            return { x, y, scale, alpha, depth, progress, closeGlow };
        }

        function drawMatrixNullPhantomIntroWarp(entity, pose, now) {
            if (!pose || entity.phase !== 'INTRO') return;
            const depth = Math.max(0.035, Math.min(1, pose.depth || 0));
            const progress = Math.max(0, Math.min(1, pose.progress || 0));
            const arrival = smoothMatrixIntroStep(Math.max(0, Math.min(1, (progress - 0.58) / 0.34)));
            const shock = Math.max(0, Math.sin(Math.max(0, Math.min(1, (progress - 0.04) / 0.92)) * Math.PI));
            const spriteScale = Math.max(0.045, pose.scale || 1) * (entity.nullPhantomScale || entity.renderScale || 1);
            const spriteWidth = Math.max(1, (entity.sprite && entity.sprite[0] ? entity.sprite[0].length : 1) * charW * spriteScale);
            const spriteHeight = Math.max(1, (entity.sprite ? entity.sprite.length : 1) * charH * spriteScale);
            const close = pose.closeGlow || 0;
            const radius = Math.max(spriteWidth, spriteHeight) * (0.52 + close * 0.26) + depth * 96 + arrival * 48;
            const alpha = Math.min(0.76, 0.10 + shock * 0.32 + arrival * 0.30);
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const halo = ctx.createRadialGradient(pose.x, pose.y, 0, pose.x, pose.y, radius);
            halo.addColorStop(0, colorWithAlpha('#ffffff', alpha * (0.20 + close * 0.18)));
            halo.addColorStop(0.42, colorWithAlpha('#dfe7f4', alpha * (0.10 + close * 0.12)));
            halo.addColorStop(1, colorWithAlpha('#9f8cff', 0));
            ctx.fillStyle = halo;
            ctx.fillRect(pose.x - radius, pose.y - radius, radius * 2, radius * 2);

            const layerPulse = Math.sin(progress * Math.PI);
            const streaks = 8;
            ctx.lineCap = 'round';
            ctx.strokeStyle = colorWithAlpha('#dfe7f4', 0.22);
            ctx.lineWidth = Math.max(0.7, 1.5 * depth);
            const streakAlpha = Math.min(0.22, layerPulse * (0.04 + depth * 0.14));
            for (let i = 0; i < streaks; i++) {
                const a = (i / streaks) * Math.PI * 2 + Math.sin((now || 0) * 0.0007 + i) * 0.05;
                const inner = Math.max(spriteWidth, spriteHeight) * (0.48 + depth * 0.22);
                const outer = inner + 18 + depth * 58;
                ctx.globalAlpha = streakAlpha * (0.35 + (i % 3) * 0.18);
                ctx.beginPath();
                ctx.moveTo(pose.x + Math.cos(a) * inner, pose.y + Math.sin(a) * inner);
                ctx.lineTo(pose.x + Math.cos(a) * outer, pose.y + Math.sin(a) * outer);
                ctx.stroke();
            }

            ctx.globalAlpha = 0.18 + arrival * 0.28;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            for (let i = 0; i < 2; i++) {
                const ring = radius * (0.34 + i * 0.23 + arrival * 0.06);
                ctx.beginPath();
                ctx.ellipse(pose.x, pose.y, ring, ring * (0.72 + i * 0.12), now * 0.0008 + i * 0.7, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawMatrixNullPhantomBoss(entity, now) {
            if (typeof getNullPhantomRenderLayout !== 'function' || typeof getNullPhantomGlyphPosition !== 'function') {
                drawMatrixCrawlerEntityFallback(entity, now);
                return;
            }
            const pose = getMatrixNullPhantomIntroPose(entity);
            drawMatrixNullPhantomIntroWarp(entity, pose, now);
            const oldX = entity.x;
            const oldY = entity.y;
            entity.x = pose.x;
            entity.y = pose.y;
            const layout = getNullPhantomRenderLayout(entity, Math.max(0.001, pose.scale * (entity.nullPhantomScale || 1)));
            entity.x = oldX;
            entity.y = oldY;
            const anchorOffsetX = pose.x - (layout.visibleLeft + layout.visibleW / 2);
            const anchorOffsetY = pose.y - (layout.visibleTop + layout.visibleH / 2);
            entity.renderX = pose.x;
            entity.renderY = pose.y;

            const bodyFlash = entity.flashTimer > 0;
            const introActive = entity.phase === 'INTRO';
            const glowBlur = glowEnabled ? (introActive ? 2.5 + pose.depth * 5 : 7 + layout.laughAmount * 6) : 0;
            ctx.save();
            ctx.font = `bold ${Math.max(4, Math.round(layout.fontSize || NULL_PHANTOM_FONT_SIZE))}px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = (bodyFlash ? 1 : NULL_PHANTOM_BODY_ALPHA) * pose.alpha;
            ctx.shadowColor = bodyFlash ? '#ffffff' : (introActive ? '#c8d0dc' : NULL_PHANTOM_GLOW_COLOR);
            ctx.shadowBlur = glowBlur;
            const phantomCells = typeof NULL_PHANTOM_VISIBLE_CELLS !== 'undefined' ? NULL_PHANTOM_VISIBLE_CELLS : null;
            if (phantomCells) {
                for (const cell of phantomCells) {
                    const glyphPos = getNullPhantomGlyphPosition(layout, cell.row, cell.col);
                    ctx.fillStyle = bodyFlash
                        ? '#ffffff'
                        : (introActive ? '#c8d0dc' : getNullPhantomBodyColor(cell.char, 1, false));
                    ctx.fillText(cell.char, (glyphPos.x + anchorOffsetX) | 0, (glyphPos.y + anchorOffsetY) | 0);
                }
            } else {
                for (let r = 0; r < entity.sprite.length; r++) {
                    const row = entity.sprite[r] || '';
                    for (let c = 0; c < row.length; c++) {
                        const char = row[c];
                        if (char === ' ') continue;
                        const glyphPos = getNullPhantomGlyphPosition(layout, r, c);
                        ctx.fillStyle = bodyFlash
                            ? '#ffffff'
                            : (introActive ? '#c8d0dc' : getNullPhantomBodyColor(char, 1, false));
                        ctx.fillText(char, (glyphPos.x + anchorOffsetX) | 0, (glyphPos.y + anchorOffsetY) | 0);
                    }
                }
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixNullPhantomFocusTrail(entity, now, intensity) {
            if (typeof getNullPhantomRenderLayout !== 'function' || typeof getNullPhantomGlyphPosition !== 'function') return false;
            const cells = typeof NULL_PHANTOM_VISIBLE_CELLS !== 'undefined' ? NULL_PHANTOM_VISIBLE_CELLS : null;
            if (!cells || cells.length === 0) return false;

            const pose = getMatrixNullPhantomIntroPose(entity);
            const oldX = entity.x;
            const oldY = entity.y;
            entity.x = pose.x;
            entity.y = pose.y;
            const layout = getNullPhantomRenderLayout(entity, Math.max(0.001, pose.scale * (entity.nullPhantomScale || 1)));
            entity.x = oldX;
            entity.y = oldY;
            const anchorOffsetX = pose.x - (layout.visibleLeft + layout.visibleW / 2);
            const anchorOffsetY = pose.y - (layout.visibleTop + layout.visibleH / 2);
            const trailColor = entity.flashTimer > 0 ? '#ffffff' : colorWithAlpha(entity.color || '#ff8fd8', 0.86);

            ctx.save();
            ctx.font = `bold ${Math.max(4, Math.round(layout.fontSize || NULL_PHANTOM_FONT_SIZE))}px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = trailColor;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'screen';
            for (let layer = 2; layer >= 1; layer--) {
                const offset = getMatrixCrawlerFocusTrailOffset(entity, layer, 0.024);
                ctx.save();
                ctx.globalAlpha *= intensity * (layer === 2 ? 0.08 : 0.13);
                ctx.translate(offset.x, offset.y);
                for (const cell of cells) {
                    const glyphPos = getNullPhantomGlyphPosition(layout, cell.row, cell.col);
                    ctx.fillText(cell.char, (glyphPos.x + anchorOffsetX) | 0, (glyphPos.y + anchorOffsetY) | 0);
                }
                ctx.restore();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            return true;
        }

        function drawMatrixDistortedGlitchBoss(entity, now) {
            const pose = getMatrixNullPhantomIntroPose(entity);
            drawMatrixNullPhantomIntroWarp(entity, pose, now);
            const sprite = entity.sprite || (typeof GLITCH_SPRITE_1 !== 'undefined' ? GLITCH_SPRITE_1 : [' #### ', '##[]##', ' #### ']);
            const frame = typeof frameCount === 'number' ? frameCount : Math.floor((now || 0) / 16);
            const introActive = entity.phase === 'INTRO';
            const rawScale = Math.max(0.035, pose.scale || 1) * (entity.renderScale || 1);
            const scale = introActive ? Math.max(0.035, rawScale) : Math.max(0.55, rawScale);
            const chargeMult = entity.isCharging ? 2.35 : 1;
            const bodyFlash = entity.flashTimer > 0 || entity.transitionFlash > 0;
            const alpha = introActive ? Math.max(0, Math.min(1, pose.alpha ?? entity.introAlpha ?? 1)) : 1;
            const glyphs = getMatrixGlitchChars();

            ctx.save();
            ctx.translate(pose.x, pose.y);
            ctx.scale(scale, scale);
            ctx.font = 'bold 20px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = alpha;
            ctx.fillStyle = bodyFlash ? '#ffffff' : (introActive ? '#c7cfdd' : entity.color);
            if (glowEnabled) {
                ctx.shadowColor = bodyFlash ? '#ffffff' : (introActive ? '#c7cfdd' : entity.color);
                ctx.shadowBlur = introActive ? 3 + (pose.depth || 0) * 4 : 13 + Math.sin((now || 0) * 0.003) * 6;
            }

            if (!introActive && entity.isCharging && entity.glowIntensity > 0) {
                ctx.save();
                ctx.globalAlpha = entity.glowIntensity * 0.70;
                ctx.fillStyle = entity.color;
                ctx.font = `bold ${Math.round(58 + entity.glowIntensity * 58)}px Courier New`;
                ctx.shadowColor = entity.color;
                ctx.shadowBlur = glowEnabled ? 18 + entity.glowIntensity * 16 : 0;
                ctx.fillText('O', 0, 0);
                ctx.restore();
            }

            const spriteWidth = Math.max(1, (sprite[0] || '').length);
            const bSX = -(spriteWidth * charW) / 2;
            const bSY = -(sprite.length * charH) / 2;
            const rowShifts = [];
            for (let r = 0; r < sprite.length; r++) {
                rowShifts[r] = (!introActive && Math.random() > 0.86) ? (Math.random() - 0.5) * 38 : 0;
            }

            const charCoords = [];
            for (let r = 0; r < sprite.length; r++) {
                const row = sprite[r] || '';
                for (let c = 0; c < row.length; c++) {
                    if (row[c] !== ' ') charCoords.push({ r, c, char: row[c] });
                }
            }

            const doOffset = !introActive && frame % 2 === 0;
            const doDrop = !introActive && frame % 5 === 0;
            let dropCount = doDrop ? Math.floor((2 + Math.random() * 2) * chargeMult) : 0;
            while (dropCount-- > 0 && charCoords.length > 3) {
                charCoords.splice(Math.floor(Math.random() * charCoords.length), 1);
            }

            const offsetIndices = new Set();
            if (doOffset) {
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
                if (offsetIndices.has(idx)) {
                    cx += (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3) * chargeMult;
                    cy += (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3) * chargeMult;
                    if (Math.random() > 0.48) glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
                }
                ctx.fillText(glyph, cx | 0, cy | 0);
            }
            ctx.restore();

            if (entity.transitionTextTimer > 0) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 24px Courier New';
                ctx.fillStyle = '#00ff41';
                ctx.globalAlpha = Math.min(1, entity.transitionTextTimer / 0.8);
                ctx.shadowColor = '#00ff41';
                ctx.shadowBlur = glowEnabled ? 16 : 0;
                ctx.fillText('SYSTEM CORRUPTION DETECTED', width / 2, height * 0.34);
                ctx.restore();
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerPortSentry(entity, now) {
            const angle = entity.aimAngle ?? Math.atan2(player.y - entity.y, player.x - entity.x);
            const windupRatio = Math.max(0, Math.min(1, (entity.sentryWindup || 0) / MATRIX_PORT_SENTRY_WINDUP));
            const flash = Math.max(entity.fireFlashTimer || 0, entity.flashTimer || 0);
            const pulse = 0.5 + Math.sin(now * 0.012 + entity.indexOffset) * 0.5;
            const bodyColor = flash > 0 ? '#ffffff' : '#8ff7ff';
            ctx.save();
            ctx.translate(entity.x, entity.y);
            ctx.rotate(angle);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = bodyColor;
            ctx.shadowBlur = glowEnabled ? 9 + windupRatio * 11 : 0;
            ctx.font = 'bold 21px Courier New';
            ctx.fillStyle = colorWithAlpha(bodyColor, 0.92);
            ctx.fillText(windupRatio > 0 ? '[O]' : '[o]', 0, 0);
            ctx.font = 'bold 17px Courier New';
            ctx.fillStyle = windupRatio > 0 ? '#ffffff' : colorWithAlpha('#9bffcf', 0.72);
            ctx.fillText('>', 24 + windupRatio * 3, 0);
            if (windupRatio > 0) {
                ctx.globalAlpha = 0.34 + pulse * 0.26;
                ctx.font = 'bold 12px Courier New';
                ctx.fillStyle = '#ffea8a';
                ctx.fillText('!', 0, -20);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerCrashBug(entity, now) {
            const angle = entity.aimAngle ?? Math.atan2(player.y - entity.y, player.x - entity.x);
            const windup = entity.crashState === 'windup';
            const dashing = entity.crashState === 'dash';
            const recovering = entity.crashState === 'recover';
            const flash = Math.max(entity.fireFlashTimer || 0, entity.flashTimer || 0);
            const bodyColor = flash > 0 ? '#ffffff' : (recovering ? '#ffb347' : '#ff6f61');
            ctx.save();
            ctx.translate(entity.x, entity.y);
            ctx.rotate(angle);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (dashing) {
                ctx.font = 'bold 19px Courier New';
                ctx.fillStyle = colorWithAlpha('#ff6f61', 0.20);
                for (let i = 3; i >= 1; i--) ctx.fillText('<<<', -i * 12, 0);
            }
            ctx.shadowColor = bodyColor;
            ctx.shadowBlur = glowEnabled ? (dashing ? 15 : windup ? 12 : 7) : 0;
            ctx.font = `bold ${dashing ? 24 : 21}px Courier New`;
            ctx.fillStyle = colorWithAlpha(bodyColor, recovering ? 0.70 : 0.94);
            ctx.fillText(dashing ? '<C=>' : windup ? '<C!' : recovering ? '<c>' : '<c>', 0, 0);
            if (windup) {
                ctx.globalAlpha = 0.58 + Math.sin(now * 0.035) * 0.20;
                ctx.font = 'bold 13px Courier New';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('>>>', 34, 0);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerFirewallHost(entity, now) {
            const open = entity.hostState === 'open';
            const opening = entity.hostState === 'opening';
            const closing = entity.hostState === 'closing';
            const flash = Math.max(entity.hostFlashTimer || 0, entity.flashTimer || 0);
            const baseColor = flash > 0 ? '#ffffff' : (open ? '#ffdf9a' : '#ffb347');
            const shellAlpha = open ? 0.44 : opening || closing ? 0.72 : 0.95;
            const pulse = 0.5 + Math.sin(now * 0.01 + entity.indexOffset) * 0.5;
            ctx.save();
            ctx.translate(entity.x, entity.y);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = glowEnabled ? (open ? 13 : 8) : 0;
            ctx.font = 'bold 24px Courier New';
            ctx.fillStyle = colorWithAlpha(baseColor, shellAlpha);
            ctx.fillText(open ? '[   ]' : '[###]', 0, 0);
            ctx.font = 'bold 18px Courier New';
            ctx.fillStyle = open ? '#ffffff' : colorWithAlpha('#050d08', 0.72);
            ctx.fillText(open ? 'O' : 'X', 0, 0);
            if (open) {
                ctx.globalAlpha = 0.28 + pulse * 0.22;
                ctx.font = 'bold 13px Courier New';
                ctx.fillStyle = '#ff5e8a';
                ctx.fillText('///', 0, -22);
            } else if (entity.isShielded) {
                ctx.globalAlpha = 0.34 + pulse * 0.14;
                ctx.strokeStyle = '#ffb347';
                ctx.lineWidth = 1;
                ctx.strokeRect(-22.5, -15.5, 45, 31);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerEntityFallback(entity, now) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = entity.flashTimer > 0 ? '#ffffff' : entity.color;
            ctx.shadowColor = entity.color;
            ctx.shadowBlur = glowEnabled ? ((entity.type === 'nullPhantom' || entity.type === 'distortedGlitch') ? 16 : entity.type === 'miniboss' ? 9 : 7) : 0;
            ctx.font = `bold ${(entity.type === 'nullPhantom' || entity.type === 'distortedGlitch') ? 42 : entity.type === 'miniboss' ? 32 : 22}px Courier New`;
            ctx.fillText(entity.char, entity.x, entity.y + Math.sin(now * 0.006 + (Number(entity.phase) || 0)) * 2);
            ctx.restore();
        }

        function drawMatrixCrawlerFocusEntityTrail(entity, now) {
            const intensity = getMatrixCrawlerFocusVisualIntensity();
            if (intensity <= 0.04 || !entity) return;
            const flashColor = entity.flashTimer > 0 ? '#ffffff' : null;
            if (entity.enemyShipSprite && typeof drawFocusEnemyTrail === 'function') {
                drawFocusEnemyTrail(entity, flashColor);
                return;
            }
            if (entity.type === 'nullPhantom' && drawMatrixNullPhantomFocusTrail(entity, now, intensity)) return;

            for (let layer = 2; layer >= 1; layer--) {
                const offset = getMatrixCrawlerFocusTrailOffset(entity, layer, 0.024);
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha *= intensity * (layer === 2 ? 0.08 : 0.13);
                ctx.translate(offset.x, offset.y);
                ctx.shadowBlur = 0;
                if (entity.type === 'nullPhantom') {
                    drawMatrixNullPhantomBoss(entity, now);
                } else if (entity.type === 'distortedGlitch') {
                    drawMatrixDistortedGlitchBoss(entity, now);
                } else if (entity.type === 'portSentry') {
                    drawMatrixCrawlerPortSentry(entity, now);
                } else if (entity.type === 'crashBug') {
                    drawMatrixCrawlerCrashBug(entity, now);
                } else if (entity.type === 'firewallHost') {
                    drawMatrixCrawlerFirewallHost(entity, now);
                } else {
                    drawMatrixCrawlerEntityFallback(entity, now);
                }
                ctx.restore();
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawMatrixCrawlerFocusEntityOverlay(entity, now) {
            const intensity = getMatrixCrawlerFocusVisualIntensity();
            if (intensity <= 0.05 || !entity) return;
            const radius = Math.max(16, entity.radius || (entity.type === 'miniboss' ? 34 : 20));
            const yScan = Math.sin((now || 0) * 0.013 + (entity.indexOffset || 0)) * radius * 0.34;
            const color = entity.flashTimer > 0 ? '#ffffff' : (entity.color || entity.enemyShipGlowColor || MATRIX_CRAWLER_COLORS.glow);
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineWidth = 1;
            ctx.strokeStyle = colorWithAlpha('#caffda', 0.72);
            ctx.globalAlpha = 0.16 * intensity;
            ctx.beginPath();
            ctx.moveTo(entity.x - radius * 1.35, entity.y + yScan);
            ctx.lineTo(entity.x + radius * 1.35, entity.y + yScan);
            ctx.stroke();

            ctx.globalAlpha = 0.10 * intensity;
            ctx.strokeStyle = colorWithAlpha(color, 0.78);
            ctx.beginPath();
            ctx.ellipse(entity.x, entity.y, radius * 1.18, radius * 0.82, (now || 0) * 0.0012, 0, Math.PI * 2);
            ctx.stroke();

            ctx.globalAlpha = 0.18 * intensity;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 10px Courier New';
            ctx.fillStyle = '#caffda';
            ctx.fillText('::', entity.x, entity.y - radius - 8);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawMatrixCrawlerEntity(entity, now) {
            if (entity.type === 'nullPhantom') {
                drawMatrixNullPhantomBoss(entity, now);
                return;
            }
            if (entity.type === 'distortedGlitch') {
                drawMatrixDistortedGlitchBoss(entity, now);
                return;
            }
            if (entity.type === 'portSentry') {
                drawMatrixCrawlerPortSentry(entity, now);
                return;
            }
            if (entity.type === 'crashBug') {
                drawMatrixCrawlerCrashBug(entity, now);
                return;
            }
            if (entity.type === 'firewallHost') {
                drawMatrixCrawlerFirewallHost(entity, now);
                return;
            }
            if (entity.enemyShipSprite && typeof drawEnemyShipSprite === 'function') {
                const flashColor = entity.flashTimer > 0 ? '#ffffff' : null;
                if (typeof drawCachedEnemyShipSprite !== 'function' || !drawCachedEnemyShipSprite(entity, flashColor, { staticFrame: matrixCrawlerState.enemies.length > 70 })) {
                    drawEnemyShipSprite(entity, flashColor);
                }
                if (entity.type === 'miniboss') {
                    const w = 70;
                    const hpRatio = Math.max(0, entity.hp / entity.maxHp);
                    ctx.save();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'rgba(0,0,0,0.55)';
                    ctx.fillRect(entity.x - w / 2, entity.y - entity.radius - 24, w, 5);
                    ctx.fillStyle = entity.enemyShipBodyColor || entity.color;
                    ctx.fillRect(entity.x - w / 2, entity.y - entity.radius - 24, w * hpRatio, 5);
                    ctx.restore();
                }
                return;
            }
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = entity.flashTimer > 0 ? '#ffffff' : entity.color;
            ctx.shadowColor = entity.color;
            ctx.shadowBlur = glowEnabled ? 9 : 0;
            ctx.font = `bold ${entity.type === 'miniboss' ? 32 : 22}px Courier New`;
            ctx.fillText(entity.char, entity.x, entity.y + Math.sin(now * 0.006 + entity.phase) * 2);
            if (entity.type === 'miniboss') {
                const w = 70;
                const hpRatio = Math.max(0, entity.hp / entity.maxHp);
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                ctx.fillRect(entity.x - w / 2, entity.y - entity.radius - 24, w, 5);
                ctx.fillStyle = entity.color;
                ctx.fillRect(entity.x - w / 2, entity.y - entity.radius - 24, w * hpRatio, 5);
            }
            ctx.restore();
        }

        function drawMatrixCrawlerPickup(p, now) {
            ctx.save();
            const pulse = 0.5 + Math.sin(p.pulse + now * 0.004) * 0.5;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (p.reward && p.reward.kind === 'weapon' && p.reward.item) {
                const wp = p.reward.item;
                const bob = Math.sin(p.pulse + now * 0.006) * 4;
                const x = p.x;
                const y = p.y + bob;
                const boxSize = 58;
                ctx.save();
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = 'rgba(2, 10, 7, 0.88)';
                ctx.strokeStyle = colorWithAlpha(wp.color || MATRIX_CRAWLER_COLORS.white, 0.86);
                ctx.shadowColor = wp.color || MATRIX_CRAWLER_COLORS.white;
                ctx.shadowBlur = glowEnabled ? 11 + pulse * 7 : 0;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - 34, p.y + 31);
                ctx.lineTo(x + 34, p.y + 31);
                ctx.lineTo(x + 24, p.y + 44);
                ctx.lineTo(x - 24, p.y + 44);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.58;
                ctx.fillStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.glow, 0.34);
                ctx.fillRect(x - 18, p.y + 33, 36, 2);
                ctx.restore();

                ctx.shadowColor = wp.color || MATRIX_CRAWLER_COLORS.white;
                ctx.shadowBlur = glowEnabled ? 12 + pulse * 8 : 0;
                ctx.strokeStyle = wp.color || MATRIX_CRAWLER_COLORS.white;
                ctx.lineWidth = 3;
                ctx.strokeRect((x - boxSize / 2) | 0, (y - boxSize / 2) | 0, boxSize, boxSize);
                ctx.shadowBlur = 0;
                if (typeof drawPowerupIcon === 'function') {
                    drawPowerupIcon(wp, x | 0, y | 0, 20, true);
                } else {
                    ctx.fillStyle = wp.color || MATRIX_CRAWLER_COLORS.white;
                    ctx.font = 'bold 24px Courier New';
                    ctx.fillText(wp.glyph || '?', x, y);
                }
                ctx.font = "bold 9px 'Electrolize', sans-serif";
                ctx.fillStyle = colorWithAlpha(wp.color || MATRIX_CRAWLER_COLORS.white, 0.92);
                ctx.fillText((wp.name || 'WEAPON').toUpperCase().slice(0, 18), x | 0, (p.y + 64) | 0);
                ctx.restore();
                return;
            }
            if (p.kind === 'bomb') {
                const bob = Math.sin(p.pulse + now * 0.006) * 3;
                const x = p.x;
                const y = p.y + bob;
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.68 + pulse * 0.18;
                ctx.strokeStyle = colorWithAlpha(MATRIX_CRAWLER_BOMB_PICKUP_COLOR, 0.86);
                ctx.fillStyle = colorWithAlpha('#1a0f08', 0.80);
                ctx.shadowColor = MATRIX_CRAWLER_BOMB_PICKUP_COLOR;
                ctx.shadowBlur = glowEnabled ? 10 + pulse * 8 : 0;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect((x - 15) | 0, (y - 15) | 0, 30, 30);
                ctx.fill();
                ctx.stroke();
                ctx.globalAlpha = 0.9;
                ctx.font = "bold 17px 'Electrolize', sans-serif";
                ctx.fillStyle = '#fff4bc';
                ctx.fillText('B', x | 0, y | 0);
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.64;
                ctx.font = "bold 8px 'Electrolize', sans-serif";
                ctx.fillStyle = colorWithAlpha(MATRIX_CRAWLER_BOMB_PICKUP_COLOR, 0.88);
                ctx.fillText('BOMB', x | 0, (p.y + 28) | 0);
                ctx.restore();
                ctx.restore();
                return;
            }
            ctx.fillStyle = p.color || MATRIX_CRAWLER_COLORS.white;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = glowEnabled ? 10 + pulse * 6 : 0;
            ctx.font = `bold ${p.kind === 'item' || p.kind === 'exit' ? 18 : 16}px 'Electrolize', sans-serif`;
            const text = p.reward ? (p.reward.kind === 'weapon' ? p.reward.item.glyph || '?' : '+') : p.char;
            ctx.fillText(text, p.x, p.y - pulse * 2);
            if (p.cost > 0) {
                ctx.shadowBlur = 0;
                ctx.font = "bold 10px 'Electrolize', sans-serif";
                ctx.fillStyle = MATRIX_CRAWLER_COLORS.coin;
                ctx.fillText(`${p.cost} CR`, p.x, p.y + 22);
            } else if (p.reward) {
                ctx.shadowBlur = 0;
                ctx.font = "bold 9px 'Electrolize', sans-serif";
                ctx.fillStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.white, 0.72);
                ctx.fillText((p.reward.label || 'ITEM').slice(0, 18).toUpperCase(), p.x, p.y + 23);
            }
            ctx.restore();
        }

        function getMatrixCrawlerMinimapBaseCells(layout) {
            const id = layout && layout.id;
            if (id === 'compact') return [{ x: 0, y: 0, s: 0.74 }];
            if (id === 'wide') return [{ x: 0, y: 0 }, { x: 1, y: 0 }];
            if (id === 'tall') return [{ x: 0, y: 0 }, { x: 0, y: 1 }];
            if (id === 'line-h') return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
            if (id === 'line-v') return [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }];
            if (id === 'large') return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
            if (id === 'l-ne') return [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
            if (id === 'l-nw') return [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
            if (id === 'l-se') return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
            if (id === 'l-sw') return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
            if (id === 't-n') return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }];
            if (id === 't-s') return [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }];
            if (id === 't-e') return [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }];
            if (id === 't-w') return [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 1 }];
            return [{ x: 0, y: 0 }];
        }

        function getMatrixCrawlerMinimapAnchorCell(room, cells) {
            if (!cells || !cells.length) return { x: 0, y: 0 };
            const minX = Math.min(...cells.map(cell => cell.x || 0));
            const maxX = Math.max(...cells.map(cell => cell.x || 0));
            const minY = Math.min(...cells.map(cell => cell.y || 0));
            const maxY = Math.max(...cells.map(cell => cell.y || 0));
            const dirs = MATRIX_CRAWLER_DIRS.filter(dir => room && room.neighbors && room.neighbors[dir.id]);
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            let candidates = cells.slice();

            for (const dir of dirs) {
                const edgeValue = dir.id === 'N'
                    ? minY
                    : dir.id === 'S'
                        ? maxY
                        : dir.id === 'W'
                            ? minX
                            : maxX;
                const filtered = candidates.filter(cell => {
                    const value = dir.id === 'N' || dir.id === 'S' ? (cell.y || 0) : (cell.x || 0);
                    return value === edgeValue;
                });
                if (filtered.length) candidates = filtered;
            }

            const scoreCell = cell => {
                let score = Math.hypot((cell.x || 0) - centerX, (cell.y || 0) - centerY) * 0.12;
                for (const dir of dirs) {
                    if (dir.id === 'N') score += (cell.y || 0) - minY;
                    else if (dir.id === 'S') score += maxY - (cell.y || 0);
                    else if (dir.id === 'W') score += (cell.x || 0) - minX;
                    else if (dir.id === 'E') score += maxX - (cell.x || 0);
                }
                return score;
            };
            candidates.sort((a, b) => scoreCell(a) - scoreCell(b));
            return candidates[0] || cells[0] || { x: 0, y: 0 };
        }

        function getMatrixCrawlerMinimapCells(room) {
            const layout = getMatrixCrawlerRoomLayout(room);
            const cells = getMatrixCrawlerMinimapBaseCells(layout);
            const anchor = getMatrixCrawlerMinimapAnchorCell(room, cells);
            return cells.map(cell => ({
                x: (cell.x || 0) - (anchor.x || 0),
                y: (cell.y || 0) - (anchor.y || 0),
                s: cell.s || 1
            }));
        }

        function getMatrixCrawlerMinimapRoomColor(room, isCurrent) {
            if (isCurrent) return MATRIX_CRAWLER_COLORS.white;
            if (room.type === 'boss') return MATRIX_CRAWLER_COLORS.danger;
            if (room.type === 'treasure') return MATRIX_CRAWLER_COLORS.coin;
            if (room.type === 'shop') return MATRIX_CRAWLER_COLORS.shop;
            if (room.type === 'challenge') return '#d884ff';
            if (room.type === 'secret') return '#b6ffde';
            return MATRIX_CRAWLER_COLORS.glow;
        }

        function getMatrixCrawlerMinimapRoomIcon(room) {
            if (room.type === 'boss') return '!';
            if (room.type === 'treasure') return '+';
            if (room.type === 'shop') return '$';
            if (room.type === 'challenge') return '*';
            if (room.type === 'secret') return '?';
            return '';
        }

        function drawMatrixCrawlerMinimap(now) {
            const state = matrixCrawlerState;
            const panelW = 142;
            const panelH = 104;
            const mapAlpha = 0.42;
            const cx = width - 90;
            const cy = 76;
            const rooms = state.rooms.filter(room => state.discovered.has(room.key));
            const toMapRoomX = room => room.x * MATRIX_CRAWLER_MINIMAP_ROOM_STRIDE;
            const toMapRoomY = room => room.y * MATRIX_CRAWLER_MINIMAP_ROOM_STRIDE;
            const footprints = [];
            for (const room of rooms) {
                const roomMapX = toMapRoomX(room);
                const roomMapY = toMapRoomY(room);
                for (const cell of getMatrixCrawlerMinimapCells(room)) {
                    footprints.push({
                        room,
                        x: roomMapX + (cell.x || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD,
                        y: roomMapY + (cell.y || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD,
                        scale: cell.s || 1
                    });
                }
            }
            const minX = footprints.length ? Math.min(...footprints.map(p => p.x)) : -1;
            const maxX = footprints.length ? Math.max(...footprints.map(p => p.x)) : 1;
            const minY = footprints.length ? Math.min(...footprints.map(p => p.y)) : -1;
            const maxY = footprints.length ? Math.max(...footprints.map(p => p.y)) : 1;
            const spanX = Math.max(1.2, maxX - minX + 1.2);
            const spanY = Math.max(1.2, maxY - minY + 1.2);
            const unit = Math.max(9, Math.min(16, (panelW - 24) / spanX, (panelH - 22) / spanY));
            const block = Math.max(8, Math.min(12, unit * 0.72));
            const midX = (minX + maxX) / 2;
            const midY = (minY + maxY) / 2;
            const toScreen = (mx, my) => ({
                x: cx + (mx - midX) * unit,
                y: cy + (my - midY) * unit
            });
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = colorWithAlpha('#000905', 0.54 * mapAlpha);
            ctx.strokeStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.glow, 0.34 * mapAlpha);
            ctx.fillRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH);
            ctx.strokeRect(cx - panelW / 2 + 0.5, cy - panelH / 2 + 0.5, panelW, panelH);
            ctx.lineWidth = 2;
            ctx.strokeStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.glow, 0.18 * mapAlpha);
            for (const room of rooms) {
                const from = toScreen(toMapRoomX(room), toMapRoomY(room));
                for (const dir of MATRIX_CRAWLER_DIRS) {
                    const neighbor = room.neighbors && room.neighbors[dir.id] ? state.roomMap.get(room.neighbors[dir.id]) : null;
                    if (!neighbor || !state.discovered.has(neighbor.key)) continue;
                    if (dir.id !== 'E' && dir.id !== 'S') continue;
                    const to = toScreen(toMapRoomX(neighbor), toMapRoomY(neighbor));
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(to.x, to.y);
                    ctx.stroke();
                }
            }
            for (const footprint of footprints) {
                const room = footprint.room;
                const isCurrent = room.key === state.currentKey;
                const p = toScreen(footprint.x, footprint.y);
                const size = block * footprint.scale;
                ctx.fillStyle = getMatrixCrawlerMinimapRoomColor(room, isCurrent);
                ctx.strokeStyle = isCurrent
                    ? colorWithAlpha(MATRIX_CRAWLER_COLORS.white, 0.95)
                    : colorWithAlpha('#00150a', 0.86);
                ctx.globalAlpha = mapAlpha * (isCurrent ? 1 : 0.62);
                ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
                ctx.strokeRect(p.x - size / 2 + 0.5, p.y - size / 2 + 0.5, size - 1, size - 1);
            }
            for (const room of rooms) {
                const icon = getMatrixCrawlerMinimapRoomIcon(room);
                if (!icon) continue;
                const p = toScreen(toMapRoomX(room), toMapRoomY(room));
                ctx.globalAlpha = mapAlpha * 0.92;
                ctx.font = "bold 9px 'Electrolize', sans-serif";
                ctx.fillStyle = room.key === state.currentKey ? '#00170c' : '#00120a';
                ctx.fillText(icon, p.x, p.y + 0.5);
            }
            ctx.globalAlpha = mapAlpha;
            ctx.font = "bold 9px 'Electrolize', sans-serif";
            ctx.fillStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.white, 0.78);
            ctx.fillText('DISCOVERED', cx, cy + panelH / 2 + 12);
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        function drawMatrixCrawlerBossBar(viewport) {
            const bossEnemy = matrixCrawlerState.enemies.find(enemy => enemy && (enemy.type === 'nullPhantom' || enemy.type === 'distortedGlitch') && !enemy.dead);
            if (!bossEnemy || bossEnemy.phase !== 'ACTIVE') return;
            const barW = Math.min(viewport.w * 0.72, 680);
            const barH = 8;
            const x = viewport.x + viewport.w / 2 - barW / 2;
            const y = Math.min(viewport.bottom - 22, height - HUD_HEIGHT - 26);
            const ratio = Math.max(0, Math.min(1, bossEnemy.hp / bossEnemy.maxHp));
            const bossColor = bossEnemy.type === 'distortedGlitch' ? (bossEnemy.color || '#00ff41') : '#9f8cff';
            const bossName = bossEnemy.type === 'distortedGlitch'
                ? (bossEnemy.scrambledName || bossEnemy.name || 'DISTORTED GLITCH')
                : (bossEnemy.name || 'NULL PHANTOM');
            ctx.save();
            ctx.fillStyle = 'rgba(2, 7, 18, 0.78)';
            ctx.fillRect(x, y, barW, barH);
            ctx.fillStyle = bossColor;
            ctx.fillRect(x, y, barW * ratio, barH);
            ctx.strokeStyle = colorWithAlpha('#ffffff', 0.35);
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barW, barH);
            ctx.font = `bold 13px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(bossName, viewport.x + viewport.w / 2, y - 5);
            ctx.restore();
        }

        function drawMatrixCrawlerGlitchCodeLineBullet(b, now) {
            const phase = (now || 0) * 0.012 + (b.x || 0) * 0.015;
            const angle = Math.atan2(b.vy || 0, b.vx || 1);
            const scale = b.decay ? Math.max(0.16, Math.min(1, b.life || 1)) : 1;
            ctx.save();
            ctx.translate(snapSpriteCoord(b.x), snapSpriteCoord(b.y));
            ctx.rotate(angle);
            ctx.scale(scale, scale);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 15px Courier New';
            ctx.globalAlpha = 0.78 + Math.sin(phase) * 0.12;
            ctx.fillStyle = Math.sin(phase * 1.7) > 0 ? '#ffffff' : (b.color || '#00ff41');
            if (glowEnabled) {
                ctx.shadowColor = b.color || '#00ff41';
                ctx.shadowBlur = 12;
            }
            ctx.fillText(String(b.char || '10101'), 0, 0);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            return true;
        }

        function drawMatrixCrawlerEnemyBulletVisual(b, now) {
            if (!b) return false;
            if ((b.isMatrixRainColumn || (b.isGlitchBullet && !b.isCodeLine)) && typeof drawBossProjectileVisual === 'function') {
                return drawBossProjectileVisual(b, now);
            }
            if (b.isCodeLine) return drawMatrixCrawlerGlitchCodeLineBullet(b, now);
            if (b.isPhantomBullet && typeof drawBossProjectileFast === 'function') {
                return drawBossProjectileFast(b, now);
            }
            return false;
        }

        function drawMatrixCrawlerFocusBulletTrail(b, now) {
            if (!b || typeof drawFocusBulletTrailGlyph !== 'function') return;
            if (b.isPhantomBullet && typeof drawBossProjectileFast === 'function') return;
            const intensity = getMatrixCrawlerFocusVisualIntensity();
            if (intensity <= 0.04) return;
            const visualRadius = b.visualRadius || b.radius || 6;
            const fontSize = b.isMatrixRainColumn
                ? 24
                : b.isPhantomBullet
                    ? 35
                    : Math.max(11, visualRadius * 2.1);
            const char = b.char || (b.isPhantomBullet ? '✧' : '.');
            const color = b.color || (b.isPhantomBullet ? '#ff8fd8' : MATRIX_CRAWLER_COLORS.danger);
            drawFocusBulletTrailGlyph(b, char, color, `bold ${Math.round(fontSize)}px Courier New`, b.isPhantomBullet ? 0.82 : 0.62);
        }

        function getMatrixCrawlerProjectileGlyphRotation(p) {
            let dx = 0;
            let dy = 0;
            if (Number.isFinite(p.prevX) && Number.isFinite(p.prevY)) {
                dx = p.x - p.prevX;
                dy = p.y - p.prevY;
            }
            if (Math.hypot(dx, dy) < 0.001) {
                dx = Number.isFinite(p.baseVx) ? p.baseVx : (Number.isFinite(p.vx) ? p.vx : 0);
                dy = Number.isFinite(p.baseVy) ? p.baseVy : (Number.isFinite(p.vy) ? p.vy : -1);
            }
            if (Math.hypot(dx, dy) < 0.001) return 0;
            return Math.atan2(dy, dx) + Math.PI / 2;
        }

        function drawMatrixCrawlerLaserProjectile(p, now) {
            const stats = p.stats || {};
            if (p.isDissolvingProjectile && typeof drawProjectileDissolveGlyph === 'function') {
                drawProjectileDissolveGlyph(p, now, {
                    x: p.x,
                    y: p.y,
                    fontSize: Math.max(10, Math.round(18 * (stats.sizeMult || 1))),
                    char: p.dissolveChar || p.sprite || '|',
                    color: p.dissolveColor || p.color || '#ffffff',
                    angle: getMatrixCrawlerProjectileGlyphRotation(p),
                    alphaScale: 0.95,
                    glow: 8
                });
                return;
            }

            const scale = Math.max(0.65, stats.sizeMult || 1);
            const alpha = Math.max(0.18, Math.min(1, p.life / Math.max(0.001, p.maxLife)));
            const angle = getMatrixCrawlerProjectileGlyphRotation(p);
            const speed = Math.max(1, Math.hypot(p.baseVx || p.vx || 0, p.baseVy || p.vy || 0));
            const tail = Math.min(28, 9 + speed * 0.018) * scale;
            const vx = Math.cos(angle - Math.PI / 2);
            const vy = Math.sin(angle - Math.PI / 2);

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = alpha;
            ctx.lineCap = 'round';
            if (glowEnabled) {
                ctx.shadowColor = '#8ff7ff';
                ctx.shadowBlur = 10;
            }
            const trail = ctx.createLinearGradient(p.x - vx * tail, p.y - vy * tail, p.x + vx * 5, p.y + vy * 5);
            trail.addColorStop(0, colorWithAlpha('#8ff7ff', 0));
            trail.addColorStop(0.55, colorWithAlpha('#8ff7ff', 0.26 * alpha));
            trail.addColorStop(1, colorWithAlpha('#ffffff', 0.72 * alpha));
            ctx.strokeStyle = trail;
            ctx.lineWidth = Math.max(1.4, 2.2 * scale);
            ctx.beginPath();
            ctx.moveTo(p.x - vx * tail, p.y - vy * tail);
            ctx.lineTo(p.x + vx * 5, p.y + vy * 5);
            ctx.stroke();

            ctx.translate(p.x, p.y);
            ctx.rotate(angle);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = p.color || '#ffffff';
            ctx.font = `bold ${Math.max(16, Math.round(23 * scale))}px Courier New`;
            ctx.fillText(p.sprite || '|', 0, 0);
            ctx.fillStyle = '#8ff7ff';
            ctx.globalAlpha = alpha * 0.52;
            ctx.font = `bold ${Math.max(9, Math.round(10 * scale))}px Courier New`;
            ctx.fillText('.', 0, -5 * scale);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawMatrixCrawlerBombEffects(now) {
            for (const ring of bombBlastRings) {
                if (!ring) continue;
                const t = Math.max(0, Math.min(1, ring.life / Math.max(0.001, ring.maxLife || 0.4)));
                const radius = (ring.maxRadius || 80) * (1 - Math.pow(1 - t, 2.2));
                const alpha = (1 - t) * 0.72;
                if (alpha <= 0.01) continue;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = ring.color || '#8ff7ff';
                ctx.lineWidth = Math.max(1.2, ring.lineWidth || 2);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (glowEnabled) {
                    ctx.shadowColor = ring.color || '#8ff7ff';
                    ctx.shadowBlur = ring.shadowBlur || 10;
                }
                ctx.beginPath();
                ctx.arc(ring.x | 0, ring.y | 0, radius, 0, Math.PI * 2);
                ctx.stroke();
                if (t < 0.42) {
                    ctx.globalAlpha = alpha * 0.32;
                    ctx.font = `bold ${Math.max(18, Math.round(radius * 0.95))}px Courier New`;
                    ctx.fillStyle = ring.color || '#8ff7ff';
                    ctx.fillText(ring.glyph || 'O', ring.x | 0, ring.y | 0);
                }
                ctx.restore();
            }

            for (const bomb of bombProjectiles) {
                if (!bomb || !bomb.isMatrixCrawlerBomb) continue;
                const pulse = 0.8 + Math.sin(now * 0.016 + bomb.pulse) * 0.2;
                const colorMixRaw = Math.max(0, Math.min(1, (bomb.age || 0) / (bomb.launchColorDuration || 0.5)));
                const colorMix = colorMixRaw * colorMixRaw * (3 - 2 * colorMixRaw);
                const shellColor = typeof blendProjectileHexColor === 'function'
                    ? blendProjectileHexColor(bomb.launchColor || '#ffffff', '#ffffff', colorMix)
                    : '#ffffff';
                const coreColor = typeof blendProjectileHexColor === 'function'
                    ? blendProjectileHexColor(bomb.launchColor || '#9edfff', '#9edfff', colorMix)
                    : '#9edfff';
                ctx.save();
                ctx.translate(truncateSpriteCoord(bomb.x), truncateSpriteCoord(bomb.y));
                ctx.fillStyle = shellColor;
                if (glowEnabled) {
                    ctx.shadowColor = shellColor;
                    ctx.shadowBlur = 10 + pulse * 6;
                }
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 22px Courier New';
                ctx.fillText('@', 0, 0);
                ctx.fillStyle = coreColor;
                ctx.font = 'bold 10px Courier New';
                ctx.fillText('.', 0, 0);
                ctx.restore();
            }
        }

        function drawMatrixCrawler(now = currentFrameNow || performance.now()) {
            const state = matrixCrawlerState;
            const room = getMatrixCrawlerRoom();
            const rect = getMatrixCrawlerRoomRect(room);
            const viewport = getMatrixCrawlerViewportRect();
            const cameraX = state.cameraX || 0;
            const cameraY = state.cameraY || 0;
            ctx.save();
            ctx.fillStyle = MATRIX_CRAWLER_COLORS.bg;
            ctx.fillRect(0, 0, width, height);
            ctx.save();
            ctx.beginPath();
            ctx.rect(viewport.x, viewport.y, viewport.w, viewport.h);
            ctx.clip();
            ctx.translate(viewport.x - cameraX, viewport.y - cameraY);
            drawMatrixCrawlerGrid(rect, now);
            drawMatrixCrawlerFocusFloorWarp(rect, now);
            drawMatrixCrawlerBlockedArea(room, rect, now);
            drawMatrixCrawlerRoomFrame(room, rect, now);
            for (const object of state.breakables || []) drawMatrixCrawlerBreakable(object, now);
            for (const p of state.pickups) drawMatrixCrawlerPickup(p, now);
            drawMatrixCrawlerBombEffects(now);
            for (const p of state.projectiles) {
                if (p.isMatrixLaserProjectile) {
                    drawMatrixCrawlerLaserProjectile(p, now);
                    continue;
                }
                if (p.isDissolvingProjectile && typeof drawProjectileDissolveGlyph === 'function') {
                    const stats = p.stats || {};
                    drawProjectileDissolveGlyph(p, now, {
                        fontSize: Math.max(12, Math.round((p.radius || 7) * 2.2)),
                        char: p.dissolveChar || p.sprite || p.char || '*',
                        color: p.dissolveColor || p.color || MATRIX_CRAWLER_COLORS.white,
                        scale: stats.sizeMult || 1,
                        alphaScale: 0.9,
                        glow: 8
                    });
                    continue;
                }
                ctx.save();
                const alpha = Math.max(0.16, Math.min(1, p.life / Math.max(0.001, p.maxLife)));
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color || MATRIX_CRAWLER_COLORS.white;
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = glowEnabled ? 9 : 0;
                ctx.font = `bold ${Math.max(12, p.radius * 2.2)}px Courier New`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.char || '*', p.x, p.y);
                ctx.restore();
            }
            for (const b of state.enemyBullets) {
                ctx.save();
                drawMatrixCrawlerFocusBulletTrail(b, now);
                if (b.isDissolvingProjectile && typeof drawProjectileDissolveGlyph === 'function') {
                    const visualRadius = b.visualRadius || b.radius || 6;
                    drawProjectileDissolveGlyph(b, now, {
                        fontSize: Math.max(12, Math.round(visualRadius * 2.25)),
                        char: b.dissolveChar || b.char || (b.isPhantomBullet ? 'x' : '.'),
                        color: b.dissolveColor || b.color || MATRIX_CRAWLER_COLORS.danger,
                        alphaScale: b.isPhantomBullet ? 0.88 : 0.78,
                        glow: b.isPhantomBullet ? 11 : 7
                    });
                    ctx.restore();
                    continue;
                }
                if (drawMatrixCrawlerEnemyBulletVisual(b, now)) {
                    ctx.restore();
                    continue;
                }
                const visualRadius = b.visualRadius || b.radius || 6;
                ctx.fillStyle = b.color || MATRIX_CRAWLER_COLORS.danger;
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = glowEnabled ? 7 : 0;
                ctx.font = `bold ${Math.max(11, visualRadius * 2.1)}px Courier New`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(b.char || '.', b.x, b.y);
                ctx.restore();
            }
            for (const enemy of state.enemies) {
                drawMatrixCrawlerFocusEntityTrail(enemy, now);
                drawMatrixCrawlerEntity(enemy, now);
                drawMatrixCrawlerFocusEntityOverlay(enemy, now);
            }
            for (const p of state.particles) {
                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
                ctx.fillStyle = p.color;
                ctx.font = 'bold 11px Courier New';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.char, p.x, p.y);
                ctx.restore();
            }
            drawMatrixCrawlerRobot(now);
            if (state.roomFlash > 0) {
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = state.roomFlash * 0.18;
                ctx.fillStyle = MATRIX_CRAWLER_COLORS.glow;
                ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1;
            }
            ctx.restore();
            drawMatrixCrawlerFocusViewportOverlay(viewport, now);
            ctx.strokeStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.glow, 0.46);
            ctx.lineWidth = 2;
            ctx.shadowColor = MATRIX_CRAWLER_COLORS.glow;
            ctx.shadowBlur = glowEnabled ? 10 : 0;
            ctx.strokeRect(viewport.x + 0.5, viewport.y + 0.5, viewport.w - 1, viewport.h - 1);
            ctx.shadowBlur = 0;
            drawMatrixCrawlerBossBar(viewport);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = "bold 14px 'Electrolize', sans-serif";
            ctx.fillStyle = MATRIX_CRAWLER_COLORS.white;
            ctx.shadowColor = MATRIX_CRAWLER_COLORS.glow;
            ctx.shadowBlur = glowEnabled ? 8 : 0;
            ctx.fillText(getMatrixRoomTitle(room), viewport.x, viewport.y - 24);
            ctx.font = "bold 11px 'Electrolize', sans-serif";
            ctx.fillStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.glow, 0.72);
            ctx.fillText(`CREDITS ${String(state.coins).padStart(2, '0')}`, viewport.x, viewport.y - 9);
            if (state.messageTimer > 0 && state.message) {
                ctx.textAlign = 'center';
                ctx.font = "bold 18px 'Electrolize', sans-serif";
                ctx.fillStyle = MATRIX_CRAWLER_COLORS.white;
                ctx.shadowBlur = glowEnabled ? 12 : 0;
                ctx.fillText(state.message, width / 2, Math.min(height - HUD_HEIGHT - 8, viewport.bottom + 24));
            }
            drawMatrixCrawlerMinimap(now);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }
