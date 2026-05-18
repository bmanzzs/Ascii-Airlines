        // Matrix Nebula node crawler mode: Isaac-like simulation route.
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
            data: '#8ff7ff',
            cache: '#dfffee',
            shop: '#8ff7ff',
            accent: '#41ff93'
        };
        const MATRIX_CRAWLER_FLOOR_THEMES = {
            2: {
                bg: '#030513',
                panel: '#070d23',
                grid: '#12345f',
                wall: '#59cfff',
                wallDim: '#255e8b',
                glow: '#8ff7ff',
                white: '#eff8ff',
                danger: '#ff66c8',
                coin: '#ffe37a',
                data: '#c58dff',
                cache: '#dff6ff',
                shop: '#9fd7ff',
                accent: '#ff9bdc'
            }
        };

        function getMatrixCrawlerFloorTheme(floor = matrixCrawlerState.floor || 1) {
            const safeFloor = Math.max(1, Math.floor(floor || 1));
            return MATRIX_CRAWLER_FLOOR_THEMES[safeFloor] || MATRIX_CRAWLER_COLORS;
        }

        function isMatrixCrawlerOverclockFloor(floor = matrixCrawlerState.floor || 1) {
            return Math.max(1, Math.floor(floor || 1)) === 2;
        }
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
                id: 'elbow-ne',
                wScreens: 1.36,
                hScreens: 1.28,
                blockedCorner: 'SW',
                mapCells: [{ x: -0.24, y: 0.22 }, { x: 0.24, y: -0.22 }],
                nullZones: [{ x: 0.08, y: 0.70, w: 0.18, h: 0.16, label: 'CUT' }],
                breakables: [2, 5]
            },
            {
                id: 'elbow-nw',
                wScreens: 1.36,
                hScreens: 1.28,
                blockedCorner: 'SE',
                mapCells: [{ x: 0.24, y: 0.22 }, { x: -0.24, y: -0.22 }],
                nullZones: [{ x: 0.74, y: 0.70, w: 0.18, h: 0.16, label: 'CUT' }],
                breakables: [2, 5]
            },
            {
                id: 'elbow-se',
                wScreens: 1.36,
                hScreens: 1.28,
                blockedCorner: 'NW',
                mapCells: [{ x: 0.24, y: -0.22 }, { x: -0.24, y: 0.22 }],
                nullZones: [{ x: 0.74, y: 0.12, w: 0.18, h: 0.16, label: 'CUT' }],
                breakables: [2, 5]
            },
            {
                id: 'elbow-sw',
                wScreens: 1.36,
                hScreens: 1.28,
                blockedCorner: 'NE',
                mapCells: [{ x: -0.24, y: -0.22 }, { x: 0.24, y: 0.22 }],
                nullZones: [{ x: 0.08, y: 0.12, w: 0.18, h: 0.16, label: 'CUT' }],
                breakables: [2, 5]
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

        function getMatrixCrawlerOppositeDir(dirId) {
            const dir = MATRIX_CRAWLER_DIRS.find(candidate => candidate.id === dirId);
            return dir ? dir.opposite : null;
        }

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
        const MATRIX_SHIELDED_PORT_OPENING_TIME = 0.38;
        const MATRIX_SHIELDED_PORT_OPEN_TIME = 1.28;
        const MATRIX_SHIELDED_PORT_CLOSING_TIME = 0.26;
        const MATRIX_SHIELDED_PORT_COOLDOWN = 1.35;
        const MATRIX_SHIELDED_PORT_FIRE_DELAY = 0.30;
        const MATRIX_REBOOTING_HUSK_REBOOT_TIME_MIN = 2.45;
        const MATRIX_REBOOTING_HUSK_REBOOT_TIME_MAX = 3.55;
        const MATRIX_REBOOTING_HUSK_CORE_HP_RATIO = 0.36;
        const MATRIX_REBOOTING_HUSK_REVIVE_HP_RATIO = 0.56;
        const MATRIX_FIREWALL_MASK_CHARGE_SPEED = 315;
        const MATRIX_FIREWALL_MASK_WINDUP = 0.34;
        const MATRIX_FIREWALL_MASK_DASH_TIME = 0.46;
        const MATRIX_FIREWALL_MASK_COOLDOWN = 1.05;
        const MATRIX_EXPOSED_KERNEL_FIRE_INTERVAL = 1.85;
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
        const MATRIX_CRAWLER_PHANTOM_AFTERIMAGE_LIFE = 0.24;
        const MATRIX_CRAWLER_PHANTOM_AFTERIMAGE_MAX = 7;
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
        const MATRIX_VECTOR_INTERCEPTOR_DODGE_WINDOW = 0.62;
        const MATRIX_VECTOR_INTERCEPTOR_DODGE_RADIUS = 88;
        const MATRIX_VECTOR_INTERCEPTOR_ACCEL_RESPONSE = 9.6;
        const MATRIX_VECTOR_INTERCEPTOR_DECEL_RESPONSE = 5.8;
        const MATRIX_VECTOR_INTERCEPTOR_MAX_SPEED = 182;
        const MATRIX_VECTOR_INTERCEPTOR_REWARD_CACHE_CHANCE = 0.62;
        const MATRIX_CRAWLER_HEART_HP = 10;
        const MATRIX_CRAWLER_STARTING_HEARTS = 4;
        const MATRIX_CRAWLER_STARTING_MAX_HP = MATRIX_CRAWLER_HEART_HP * MATRIX_CRAWLER_STARTING_HEARTS;
        const MATRIX_CRAWLER_DEFAULT_HIT_DAMAGE = MATRIX_CRAWLER_HEART_HP;
        const MATRIX_CRAWLER_TERRAIN_TYPES = {
            firewallBlock: {
                blocksPlayer: true,
                blocksEnemies: true,
                blocksPlayerShots: true,
                blocksEnemyShots: true,
                slowMultiplier: 1
            },
            nullGap: {
                blocksPlayer: true,
                blocksEnemies: true,
                blocksPlayerShots: false,
                blocksEnemyShots: false,
                slowMultiplier: 1
            },
            latencyPool: {
                blocksPlayer: false,
                blocksEnemies: false,
                blocksPlayerShots: false,
                blocksEnemyShots: false,
                slowMultiplier: 0.72
            }
        };
        const MATRIX_CACHE_DAEMON_CHARGE_MAX = 6;
        const MATRIX_CACHE_DAEMON_FOLLOW_RESPONSE = 8.6;
        const MATRIX_DATA_FRAGMENT_MAGNET_RADIUS = 132;
        const MATRIX_DATA_FRAGMENT_COLLECT_RADIUS = 18;
        const MATRIX_ROOM_CLEAR_DATA_FRAGMENT_CHANCE = 0.34;
        const MATRIX_CRAWLER_FLOOR_GEN_CONFIG = {
            maxAttempts: 18,
            treeAttempts: 18,
            growthGuardPerRoom: 96,
            gridMin: -8,
            gridMax: 8,
            roomCountByFloor: {
                base: 11,
                perFloor: 4,
                maxBonus: 15
            },
            requiredDeadEndsByFloor: {
                base: 4
            },
            specialRoomPriority: ['boss', 'treasure', 'shop', 'challenge'],
            secretRoomScoring: {
                minAdjacent: 2,
                adjacentScore: 100,
                multiAdjacentBonus: 50,
                startPenalty: -50,
                bossPenalty: -100,
                randomTiebreaker: 8
            }
        };
        const MATRIX_CRAWLER_ROOM_ARCHETYPES = [
            {
                id: 'open-training',
                name: 'Open Training Room',
                minFloor: 1,
                maxDepth: 4,
                terrainPatterns: [],
                enemyPattern: ['seeker', 'bug', 'seeker'],
                enemyCount: [2, 3],
                difficultyWeight: 1.35,
                tags: ['open', 'beginner'],
                spawnZones: [{ x: 0.34, y: 0.36 }, { x: 0.66, y: 0.42 }, { x: 0.50, y: 0.66 }]
            },
            {
                id: 'cover-duel',
                name: 'Cover Duel',
                minFloor: 1,
                terrainPatterns: ['coverPair'],
                enemyPattern: ['turret', 'seeker', 'bug'],
                enemyCount: [3, 4],
                difficultyWeight: 1.08,
                tags: ['cover', 'turret', 'beginner'],
                spawnZones: [{ x: 0.28, y: 0.38 }, { x: 0.72, y: 0.38 }, { x: 0.38, y: 0.66 }, { x: 0.62, y: 0.66 }]
            },
            {
                id: 'pit-crossfire',
                name: 'Pit Crossfire',
                minFloor: 1,
                minDepth: 2,
                minExitCount: 2,
                excludedLayouts: ['compact'],
                terrainPatterns: ['nullGapH'],
                enemyPattern: ['turret', 'seeker', 'turret'],
                enemyCount: [3, 4],
                difficultyWeight: 0.82,
                tags: ['pit', 'crossfire', 'turret'],
                spawnZones: [{ x: 0.28, y: 0.32 }, { x: 0.72, y: 0.32 }, { x: 0.34, y: 0.70 }, { x: 0.66, y: 0.70 }]
            },
            {
                id: 'latency-lane',
                name: 'Latency Lane',
                minFloor: 1,
                terrainPatterns: ['latencyPool'],
                enemyPattern: ['seeker', 'turret', 'seeker'],
                enemyCount: [3, 4],
                difficultyWeight: 0.98,
                tags: ['slow', 'open', 'beginner'],
                spawnZones: [{ x: 0.30, y: 0.44 }, { x: 0.70, y: 0.56 }, { x: 0.46, y: 0.70 }, { x: 0.58, y: 0.32 }]
            },
            {
                id: 'turret-behind-cover',
                name: 'Turret Behind Cover',
                minFloor: 1,
                minDepth: 2,
                minExitCount: 2,
                excludedLayouts: ['compact'],
                terrainPatterns: ['coverPair'],
                enemyPattern: ['turret', 'seeker', 'turret'],
                advancedEnemyPattern: ['shieldedPortNode', 'seeker', 'turret'],
                enemyCount: [3, 4],
                difficultyWeight: 0.88,
                tags: ['cover', 'turret', 'timing'],
                spawnZones: [{ x: 0.30, y: 0.34 }, { x: 0.70, y: 0.34 }, { x: 0.50, y: 0.66 }, { x: 0.38, y: 0.58 }]
            },
            {
                id: 'chase-around-blocks',
                name: 'Chase Around Blocks',
                minFloor: 1,
                excludedLayouts: ['compact'],
                terrainPatterns: ['firewallCluster'],
                enemyPattern: ['bug', 'seeker', 'bug'],
                enemyCount: [3, 4],
                difficultyWeight: 0.94,
                tags: ['chase', 'cover', 'beginner'],
                spawnZones: [{ x: 0.26, y: 0.34 }, { x: 0.74, y: 0.40 }, { x: 0.34, y: 0.70 }, { x: 0.68, y: 0.66 }]
            },
            {
                id: 'split-arena',
                name: 'Split Arena',
                minFloor: 1,
                minDepth: 2,
                minExitCount: 2,
                minFootprint: 1.2,
                terrainPatterns: ['coverPair', 'latencyPool'],
                enemyPattern: ['seeker', 'turret', 'bug', 'turret'],
                enemyCount: [4, 5],
                difficultyWeight: 0.74,
                tags: ['cover', 'crossfire'],
                spawnZones: [{ x: 0.24, y: 0.34 }, { x: 0.76, y: 0.34 }, { x: 0.24, y: 0.68 }, { x: 0.76, y: 0.68 }, { x: 0.50, y: 0.50 }]
            },
            {
                id: 'cache-guard',
                name: 'Cache Guard',
                minFloor: 1,
                minDepth: 3,
                terrainPatterns: ['mixed'],
                enemyPattern: ['seeker', 'turret', 'bug'],
                enemyCount: [3, 4],
                difficultyWeight: 0.72,
                clearReward: 'dataFragmentCluster',
                tags: ['cover', 'cache', 'beginner'],
                spawnZones: [{ x: 0.32, y: 0.36 }, { x: 0.68, y: 0.40 }, { x: 0.42, y: 0.70 }, { x: 0.62, y: 0.66 }]
            },
            {
                id: 'port-lock',
                name: 'Port Lock',
                minFloor: 2,
                minDepth: 3,
                minExitCount: 2,
                excludedLayouts: ['compact'],
                terrainPatterns: ['coverPair'],
                enemyPattern: ['shieldedPortNode', 'seeker', 'portSentry'],
                enemyCount: [3, 4],
                difficultyWeight: 0.66,
                tags: ['cover', 'turret', 'timing'],
                spawnZones: [{ x: 0.30, y: 0.34 }, { x: 0.70, y: 0.34 }, { x: 0.50, y: 0.68 }, { x: 0.38, y: 0.60 }]
            },
            {
                id: 'kernel-mask-maze',
                name: 'Kernel Mask Maze',
                minFloor: 2,
                minDepth: 5,
                minExitCount: 2,
                excludedLayouts: ['compact'],
                minFootprint: 1.25,
                terrainPatterns: ['firewallCluster'],
                enemyPattern: ['firewallPair', 'seeker', 'bug'],
                enemyCount: [3, 4],
                difficultyWeight: 0.44,
                tags: ['cover', 'chase', 'elite'],
                spawnZones: [{ x: 0.30, y: 0.36 }, { x: 0.70, y: 0.40 }, { x: 0.40, y: 0.70 }, { x: 0.62, y: 0.66 }]
            },
            {
                id: 'vector-interceptor-duel',
                name: 'Vector Interceptor Duel',
                minFloor: 2,
                minDepth: 3,
                roomTypes: ['challenge'],
                terrainPatterns: ['coverPair', 'latencyPool'],
                enemyPattern: ['vectorInterceptor', 'portSentry', 'crashBug', 'shieldedPortNode', 'rebootingMalwareHusk', 'orbit'],
                enemyCount: [4, 5],
                clearReward: 'dataFragmentCluster',
                difficultyWeight: 2.7,
                tags: ['duel', 'elite', 'hard', 'pilot'],
                spawnZones: [
                    { x: 0.70, y: 0.36, minPlayerDistance: 260, jitterX: 0.07, jitterY: 0.07 },
                    { x: 0.32, y: 0.34, jitterX: 0.08, jitterY: 0.08 },
                    { x: 0.68, y: 0.68, jitterX: 0.08, jitterY: 0.08 },
                    { x: 0.42, y: 0.62, jitterX: 0.08, jitterY: 0.08 }
                ]
            }
        ];
        const MATRIX_CRAWLER_CHAMPION_VARIANTS = {
            overclocked: {
                id: 'overclocked',
                label: 'OVERCLOCKED',
                color: '#8ff7ff',
                glow: '#ffffff',
                marker: '>>'
            },
            shielded: {
                id: 'shielded',
                label: 'SHIELDED',
                color: '#b8fff0',
                glow: '#e6fff1',
                marker: '[]'
            },
            volatile: {
                id: 'volatile',
                label: 'VOLATILE',
                color: '#ff5e8a',
                glow: '#ffffff',
                marker: '!!'
            },
            splitter: {
                id: 'splitter',
                label: 'SPLITTER',
                color: '#c58dff',
                glow: '#8ff7ff',
                marker: '<>'
            },
            dataRich: {
                id: 'dataRich',
                label: 'DATA-RICH',
                color: '#baff75',
                glow: '#e6fff1',
                marker: '$$'
            }
        };
        const MATRIX_CRAWLER_MINIMAP_ROOM_STRIDE = 3.12;
        const MATRIX_CRAWLER_MINIMAP_CELL_SPREAD = 1;
        const MATRIX_CRAWLER_VIEWPORT_SIDE_MARGIN = 8;
        const MATRIX_CRAWLER_VIEWPORT_TOP_MARGIN = 132;
        const MATRIX_CRAWLER_VIEWPORT_BOTTOM_MARGIN = 44;
        const MATRIX_CRAWLER_CONTROL_DECAL_DURATION = 22;
        const MATRIX_CRAWLER_WALL_MARGIN_THICKNESS = 10;
        const MATRIX_CRAWLER_WALL_MARGIN_DOOR_PAD = 10;
        const MATRIX_CRAWLER_ENEMY_ENTRY_SAFE_RADIUS = 224;
        const MATRIX_CRAWLER_ENEMY_DOOR_SAFE_RADIUS = 104;
        const MATRIX_CRAWLER_ENEMY_ENTRY_INVULN = 0.58;
        const MATRIX_CRAWLER_ENEMY_DEFAULT_AGGRO_RANGE = 470;
        const MATRIX_CRAWLER_ENEMY_NOTICE_DURATION = 0.56;
        const MATRIX_CRAWLER_ENEMY_ROOM_ENTRY_GRACE = 0.42;

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
                cacheDaemonX: 0,
                cacheDaemonY: 0,
                cacheDaemonInitialized: false,
                cacheDaemonPhase: Math.random() * Math.PI * 2,
                cacheDaemonCharge: 0,
                cacheDaemonChargeMax: MATRIX_CACHE_DAEMON_CHARGE_MAX,
                cacheDaemonReady: false,
                cacheDaemonAbsorbTimer: 0,
                cacheDaemonFullTimer: 0,
                pendingMinorCache: false,
                dataFragmentsAbsorbed: 0,
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
                facingAngle: PLAYER_FIRE_FORWARD_ANGLE,
                targetFacingAngle: PLAYER_FIRE_FORWARD_ANGLE,
                playerTurnAfterimages: [],
                turnAfterimageCooldown: 0,
                playerPhantomEmitter: 0,
                hoverRipples: [],
                hoverEmitter: 0,
                hoverThrusters: [],
                hoverThrusterEmitter: 0,
                controlDecalTimer: MATRIX_CRAWLER_CONTROL_DECAL_DURATION,
                controlDecal: null,
                enemyPairSerial: 0,
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

        function getMatrixCrawlerCurrentFloor() {
            return matrixCrawlerState && Number.isFinite(matrixCrawlerState.floor)
                ? Math.max(1, Math.floor(matrixCrawlerState.floor))
                : 1;
        }

        function normalizeMatrixCrawlerHeartHp(hp) {
            const safeHp = Math.max(0, Number.isFinite(hp) ? hp : 0);
            if (safeHp <= 0) return 0;
            return Math.ceil(safeHp / MATRIX_CRAWLER_HEART_HP) * MATRIX_CRAWLER_HEART_HP;
        }

        function getMatrixCrawlerHeartCount() {
            const storedHearts = Number.isFinite(player.matrixCrawlerMaxHearts)
                ? player.matrixCrawlerMaxHearts
                : null;
            const hpHearts = Math.round((player.maxHp || MATRIX_CRAWLER_STARTING_MAX_HP) / MATRIX_CRAWLER_HEART_HP);
            return Math.max(1, Math.floor(storedHearts || hpHearts || MATRIX_CRAWLER_STARTING_HEARTS));
        }

        function getMatrixCrawlerFilledHeartCount() {
            return Math.max(0, Math.ceil(Math.max(0, player.hp || 0) / MATRIX_CRAWLER_HEART_HP));
        }

        function applyMatrixCrawlerHeartHealth(options = {}) {
            const hearts = Math.max(1, Math.floor(options.hearts || player.matrixCrawlerMaxHearts || MATRIX_CRAWLER_STARTING_HEARTS));
            const maxHp = hearts * MATRIX_CRAWLER_HEART_HP;
            const previousHp = Math.max(0, Number.isFinite(player.hp) ? player.hp : maxHp);
            player.matrixCrawlerHeartHp = MATRIX_CRAWLER_HEART_HP;
            player.matrixCrawlerMaxHearts = hearts;
            player.maxHp = maxHp;
            if (options.heal === false) {
                player.hp = Math.max(0, Math.min(maxHp, normalizeMatrixCrawlerHeartHp(previousHp)));
            } else {
                player.hp = maxHp;
            }
        }

        function setMatrixCrawlerMaxHearts(hearts, options = {}) {
            const nextHearts = Math.max(1, Math.floor(hearts || MATRIX_CRAWLER_STARTING_HEARTS));
            const oldHp = Math.max(0, Number.isFinite(player.hp) ? player.hp : 0);
            player.matrixCrawlerHeartHp = MATRIX_CRAWLER_HEART_HP;
            player.matrixCrawlerMaxHearts = nextHearts;
            player.maxHp = nextHearts * MATRIX_CRAWLER_HEART_HP;
            if (options.fullHeal) {
                player.hp = player.maxHp;
            } else {
                player.hp = Math.min(player.maxHp, normalizeMatrixCrawlerHeartHp(oldHp));
                const healHearts = Math.max(0, Math.floor(options.healHearts || 0));
                if (healHearts > 0) healMatrixCrawlerPlayer(healHearts);
            }
        }

        function healMatrixCrawlerPlayer(hearts = 1) {
            const healHearts = Math.max(0, Math.floor(hearts || 0));
            if (healHearts <= 0 || !player) return false;
            const maxHp = Math.max(MATRIX_CRAWLER_HEART_HP, getMatrixCrawlerHeartCount() * MATRIX_CRAWLER_HEART_HP);
            const before = Math.max(0, Number.isFinite(player.hp) ? player.hp : 0);
            player.matrixCrawlerHeartHp = MATRIX_CRAWLER_HEART_HP;
            player.maxHp = maxHp;
            player.hp = Math.min(maxHp, normalizeMatrixCrawlerHeartHp(before) + healHearts * MATRIX_CRAWLER_HEART_HP);
            return player.hp > before;
        }

        function beginMatrixCrawlerPlayerDeath() {
            player.hp = 0;
            player.isFiring = false;
            player.isBeaming = false;
            clearGameplayKeys();
            deathTimer = 0;
            playerExploded = false;
            shake = 0;
            wobble = 0;
            pauseReturnState = MATRIX_CRAWLER_GAME_STATE;
            gameState = 'DYING';
            if (typeof fadeMusicForDeath === 'function') {
                fadeMusicForDeath();
            } else if (typeof applyCurrentVolume === 'function') {
                applyCurrentVolume(0.72, 0.25);
            }
        }

        function damageMatrixCrawlerPlayer(source = null, hearts = 1) {
            if (!isMatrixCrawlerRuntimeActive()) return false;
            if (player.godMode || matrixCrawlerState.invuln > 0) return false;
            const hitHearts = Math.max(1, Math.floor(hearts || 1));
            const damage = hitHearts * MATRIX_CRAWLER_DEFAULT_HIT_DAMAGE;
            player.hp = Math.max(0, (player.hp || 0) - damage);
            player.flashTimer = 0.22;
            matrixCrawlerState.invuln = 0.92 + (player.modifiers.invincibility || 0);
            if (typeof recordRunDamageTaken === 'function') recordRunDamageTaken(damage);
            addShake(7);
            if (player.hp <= 0) {
                beginMatrixCrawlerPlayerDeath();
            }
            return true;
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
                delete player.matrixCrawlerFacingAngle;
                delete player.matrixCrawlerTurning;
                delete player.survivorAimAngle;
                player._renderLayoutCache = null;
            }
        }

        function endMatrixCrawlerRun(options = {}) {
            if (!matrixCrawlerState) return;
            const shouldStopAudio = options.stopAudio !== false
                && (matrixCrawlerState.active
                    || matrixCrawlerState.bossMusicActive
                    || (typeof getActiveGameMode === 'function' && getActiveGameMode() === 'matrixCrawler')
                    || (typeof isMatrixCrawlerModeActive === 'function' && isMatrixCrawlerModeActive()));
            if (shouldStopAudio) {
                matrixCrawlerState.bossMusicActive = false;
                matrixCrawlerState.bossStopMusic = null;
                if (typeof stopMatrixCrawlerMusic === 'function') stopMatrixCrawlerMusic(0);
                else if (typeof stopMusic === 'function') stopMusic();
            } else {
                stopMatrixCrawlerBossMusic();
            }
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
            matrixCrawlerState.playerPhantomEmitter = 0;
            bombProjectiles = [];
            bombBlastRings = [];
            if (player) {
                delete player.matrixCrawlerAimAngle;
                delete player.matrixCrawlerFacingAngle;
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
            const hudH = typeof HUD_HEIGHT === 'number' ? HUD_HEIGHT : 0;
            const playfieldH = Math.max(1, height - hudH);
            return {
                x: 0,
                y: 0,
                w: width,
                h: playfieldH,
                right: width,
                bottom: playfieldH
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

        function getMatrixCrawlerTerrainDefinition(type) {
            return MATRIX_CRAWLER_TERRAIN_TYPES[type] || MATRIX_CRAWLER_TERRAIN_TYPES.firewallBlock;
        }

        function getMatrixCrawlerRoomTerrain(room) {
            return room && Array.isArray(room.terrain) ? room.terrain : [];
        }

        function getMatrixCrawlerTerrainRect(feature) {
            const w = feature && Number.isFinite(feature.w) ? feature.w : 0;
            const h = feature && Number.isFinite(feature.h) ? feature.h : 0;
            const x = feature && Number.isFinite(feature.x) ? feature.x : 0;
            const y = feature && Number.isFinite(feature.y) ? feature.y : 0;
            return {
                x,
                y,
                w,
                h,
                right: x + w,
                bottom: y + h
            };
        }

        function getMatrixCrawlerTerrainFlag(feature, flag) {
            if (!feature || !flag) return false;
            if (Object.prototype.hasOwnProperty.call(feature, flag)) return !!feature[flag];
            const def = getMatrixCrawlerTerrainDefinition(feature.type);
            return !!(def && def[flag]);
        }

        function isMatrixCrawlerPointInsideTerrain(feature, x, y, margin = 0) {
            if (!feature) return false;
            const rect = getMatrixCrawlerTerrainRect(feature);
            return x >= rect.x - margin
                && x <= rect.right + margin
                && y >= rect.y - margin
                && y <= rect.bottom + margin;
        }

        function getMatrixCrawlerTerrainHitAtPoint(room, x, y, margin = 0, flag = 'blocksPlayer') {
            for (const feature of getMatrixCrawlerRoomTerrain(room)) {
                if (!getMatrixCrawlerTerrainFlag(feature, flag)) continue;
                if (isMatrixCrawlerPointInsideTerrain(feature, x, y, margin)) return feature;
            }
            return null;
        }

        function getMatrixCrawlerTerrainBlockRects(room, rect = getMatrixCrawlerRoomRect(room), flag = 'blocksPlayer') {
            return getMatrixCrawlerRoomTerrain(room)
                .filter(feature => getMatrixCrawlerTerrainFlag(feature, flag))
                .map(feature => {
                    const fRect = getMatrixCrawlerTerrainRect(feature);
                    return makeMatrixCrawlerBlockedRect(fRect.x, fRect.y, fRect.w, fRect.h, {
                        label: feature.type || 'terrain',
                        seed: feature.seed || 0,
                        glitch: false
                    });
                });
        }

        function getMatrixCrawlerMovementBlockRects(room, rect = getMatrixCrawlerRoomRect(room), actor = 'player') {
            const flag = actor === 'enemy' ? 'blocksEnemies' : 'blocksPlayer';
            return getMatrixCrawlerBlockedRects(room, rect).concat(getMatrixCrawlerTerrainBlockRects(room, rect, flag));
        }

        function isMatrixCrawlerPlayerPointClear(room, x, y, margin = 24) {
            return isPointInMatrixCrawlerRoom(room, x, y, margin)
                && !getMatrixCrawlerTerrainHitAtPoint(room, x, y, margin, 'blocksPlayer');
        }

        function getMatrixCrawlerTerrainSlowMultiplier(room, x, y, actor = 'player') {
            let multiplier = 1;
            for (const feature of getMatrixCrawlerRoomTerrain(room)) {
                const def = getMatrixCrawlerTerrainDefinition(feature.type);
                const slow = Number.isFinite(feature.slowMultiplier) ? feature.slowMultiplier : (def && def.slowMultiplier);
                if (!Number.isFinite(slow) || slow >= 1) continue;
                if (isMatrixCrawlerPointInsideTerrain(feature, x, y, actor === 'enemy' ? 6 : 0)) {
                    multiplier = Math.min(multiplier, Math.max(0.35, slow));
                }
            }
            return multiplier;
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

        function clampMatrixCrawlerBodyPoint(room, x, y, margin = 24, actor = 'player') {
            const rect = getMatrixCrawlerRoomRect(room);
            const isClear = (px, py) => actor === 'enemy'
                ? isMatrixCrawlerEnemyPointClear(room, px, py, margin)
                : isMatrixCrawlerPlayerPointClear(room, px, py, margin);
            let nextX = Math.max(rect.x + margin, Math.min(rect.right - margin, x));
            let nextY = Math.max(rect.y + margin, Math.min(rect.bottom - margin, y));
            if (isClear(nextX, nextY)) return { x: nextX, y: nextY };

            const candidates = [];
            for (const blocked of getMatrixCrawlerMovementBlockRects(room, rect, actor)) {
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
                .filter(p => isClear(p.x, p.y))
                .sort((a, b) => ((a.x - nextX) ** 2 + (a.y - nextY) ** 2) - ((b.x - nextX) ** 2 + (b.y - nextY) ** 2));
            if (safeCandidates.length) return safeCandidates[0];

            for (let radius = 18; radius <= 132; radius += 18) {
                for (let i = 0; i < 16; i++) {
                    const angle = (i / 16) * Math.PI * 2;
                    const px = Math.max(rect.x + margin, Math.min(rect.right - margin, nextX + Math.cos(angle) * radius));
                    const py = Math.max(rect.y + margin, Math.min(rect.bottom - margin, nextY + Math.sin(angle) * radius));
                    if (isClear(px, py)) return { x: px, y: py };
                }
            }
            return clampMatrixCrawlerPoint(room, x, y, margin);
        }

        function getMatrixCrawlerSafePoint(room, x, y, margin = 26) {
            return isMatrixCrawlerPlayerPointClear(room, x, y, margin)
                ? { x, y }
                : clampMatrixCrawlerBodyPoint(room, x, y, margin, 'player');
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
                && !getMatrixCrawlerTerrainHitAtPoint(room, x, y, margin, 'blocksEnemies')
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

            return clampMatrixCrawlerBodyPoint(room, x, y, margin, 'enemy');
        }

        function moveMatrixCrawlerBodyInRoom(room, x, y, nextX, nextY, margin = 24) {
            const rect = getMatrixCrawlerRoomRect(room);
            let outX = x;
            let outY = y;
            const boundedX = Math.max(rect.x + margin, Math.min(rect.right - margin, nextX));
            if (isMatrixCrawlerPlayerPointClear(room, boundedX, outY, margin)) outX = boundedX;
            const boundedY = Math.max(rect.y + margin, Math.min(rect.bottom - margin, nextY));
            if (isMatrixCrawlerPlayerPointClear(room, outX, boundedY, margin)) outY = boundedY;
            if (isMatrixCrawlerPlayerPointClear(room, outX, outY, margin)) return { x: outX, y: outY };
            return clampMatrixCrawlerBodyPoint(room, x, y, margin, 'player');
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
            return clampMatrixCrawlerBodyPoint(room, x, y, margin, 'enemy');
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
                    : isMatrixCrawlerPlayerPointClear(room, x, y, margin);
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
                        : isMatrixCrawlerPlayerPointClear(room, px, py, margin)) ? 1 : 0;
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
            const finalTarget = (includeBreakables ? isMatrixCrawlerEnemyPointClear(room, toX, toY, margin) : isMatrixCrawlerPlayerPointClear(room, toX, toY, margin))
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
            const slow = getMatrixCrawlerTerrainSlowMultiplier(room, enemy.x, enemy.y, 'enemy');
            const nextX = enemy.x + vx * slow * dt;
            const nextY = enemy.y + vy * slow * dt;
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

        function getMatrixCrawlerTargetVisibleRoomCount(floor = 1) {
            const config = MATRIX_CRAWLER_FLOOR_GEN_CONFIG.roomCountByFloor;
            const floorBonus = Math.max(0, Math.floor(floor || 1) - 1) * config.perFloor;
            return config.base + Math.min(config.maxBonus, floorBonus);
        }

        function getMatrixCrawlerRequiredDeadEnds(floor = 1) {
            const config = MATRIX_CRAWLER_FLOOR_GEN_CONFIG.requiredDeadEndsByFloor;
            return Math.max(1, Math.floor(config.base || 1));
        }

        function getMatrixCrawlerVisibleRoomCountRange(floor = 1) {
            const target = getMatrixCrawlerTargetVisibleRoomCount(floor);
            return { min: target, max: target, target };
        }

        function getMatrixCrawlerDeadEndRange(visibleRoomCount, floor = 1) {
            const requiredDeadEnds = getMatrixCrawlerRequiredDeadEnds(floor);
            return {
                min: requiredDeadEnds,
                max: Math.max(requiredDeadEnds, Math.max(0, visibleRoomCount - 1))
            };
        }

        function isMatrixCrawlerWithinGenerationBounds(x, y) {
            const config = MATRIX_CRAWLER_FLOOR_GEN_CONFIG;
            return x >= config.gridMin && x <= config.gridMax && y >= config.gridMin && y <= config.gridMax;
        }

        function getMatrixCrawlerGraphDegree(room) {
            if (!room) return 0;
            if (room.links) return Object.keys(room.links).length;
            if (room.neighbors) return Object.keys(room.neighbors).length;
            return 0;
        }

        function isMatrixCrawlerVisibleGraphRoom(room) {
            return !!room && room.type !== 'secret';
        }

        function areMatrixCrawlerRoomsLinked(room, neighbor) {
            if (!room || !neighbor || !room.neighbors || !neighbor.neighbors) return false;
            for (const dir of MATRIX_CRAWLER_DIRS) {
                if (room.neighbors[dir.id] === neighbor.key && neighbor.neighbors[dir.opposite] === room.key) {
                    return true;
                }
            }
            return false;
        }

        function getMatrixCrawlerAdjacentVisibleRooms(x, y, roomMap) {
            const adjacent = [];
            for (const dir of MATRIX_CRAWLER_DIRS) {
                const room = roomMap.get(matrixKey(x + dir.x, y + dir.y));
                if (isMatrixCrawlerVisibleGraphRoom(room)) adjacent.push({ room, dir });
            }
            return adjacent;
        }

        function getMatrixCrawlerVisibleRooms(rooms) {
            return (rooms || []).filter(room => isMatrixCrawlerVisibleGraphRoom(room));
        }

        function getMatrixCrawlerGridBounds(rooms) {
            const scopedRooms = rooms && rooms.length ? rooms : [{ x: 0, y: 0 }];
            return {
                minX: Math.min(...scopedRooms.map(room => room.x)),
                maxX: Math.max(...scopedRooms.map(room => room.x)),
                minY: Math.min(...scopedRooms.map(room => room.y)),
                maxY: Math.max(...scopedRooms.map(room => room.y))
            };
        }

        function getMatrixCrawlerVisibleNeighborCount(room, roomMap) {
            if (!room) return 0;
            const map = roomMap || new Map();
            const exits = room.links || room.neighbors || {};
            let count = 0;
            for (const key of Object.values(exits)) {
                if (isMatrixCrawlerVisibleGraphRoom(map.get(key))) count++;
            }
            return count;
        }

        function countMatrixCrawlerDeadEnds(rooms) {
            const map = new Map((rooms || []).map(room => [room.key, room]));
            return (rooms || []).filter(room => room.key !== '0,0'
                && isMatrixCrawlerVisibleGraphRoom(room)
                && getMatrixCrawlerVisibleNeighborCount(room, map) === 1);
        }

        function getMatrixCrawlerVisibleDeadEnds(rooms) {
            return countMatrixCrawlerDeadEnds(rooms);
        }

        function pickWeightedMatrixCrawlerCandidate(candidates) {
            let total = 0;
            for (const candidate of candidates) total += candidate.weight || 0;
            if (total <= 0) return candidates[Math.floor(Math.random() * candidates.length)];
            let pick = Math.random() * total;
            for (const candidate of candidates) {
                pick -= candidate.weight || 0;
                if (pick <= 0) return candidate;
            }
            return candidates[candidates.length - 1];
        }

        function getMatrixCrawlerExpansionCandidates(rooms, roomMap, minDeadEnds) {
            const candidates = [];
            const deadEndNeed = Math.max(0, minDeadEnds - countMatrixCrawlerDeadEnds(rooms).length);
            for (const room of rooms) {
                const degree = getMatrixCrawlerGraphDegree(room);
                if (degree >= 4) continue;
                for (const dir of MATRIX_CRAWLER_DIRS) {
                    const nx = room.x + dir.x;
                    const ny = room.y + dir.y;
                    const key = matrixKey(nx, ny);
                    if (!isMatrixCrawlerWithinGenerationBounds(nx, ny)) continue;
                    if (roomMap.has(key)) continue;
                    const adjacent = getMatrixCrawlerAdjacentVisibleRooms(nx, ny, roomMap);
                    if (adjacent.length !== 1 || adjacent[0].room.key !== room.key) continue;

                    let weight = degree === 0
                        ? 5.0
                        : degree === 1
                            ? 3.4
                            : degree === 2
                                ? 3.1
                                : 0.75;
                    if (deadEndNeed > 0) {
                        if (degree >= 2) weight *= 1.75 + deadEndNeed * 0.18;
                        if (degree <= 1 && (room.depth || 0) > rooms.length * 0.42) weight *= 0.55;
                    }
                    weight *= 0.82 + Math.random() * 0.36;
                    candidates.push({ room, dir, nx, ny, key, weight });
                }
            }
            return candidates;
        }

        function buildMatrixCrawlerTreeAttempt(targetRooms) {
            const rooms = [{
                x: 0,
                y: 0,
                key: '0,0',
                type: 'start',
                depth: 0,
                links: {},
                entered: false,
                clear: false
            }];
            const roomMap = new Map([['0,0', rooms[0]]]);
            let guard = 0;
            while (rooms.length < targetRooms && guard++ < targetRooms * MATRIX_CRAWLER_FLOOR_GEN_CONFIG.growthGuardPerRoom) {
                const candidates = getMatrixCrawlerExpansionCandidates(rooms, roomMap, getMatrixCrawlerRequiredDeadEnds());
                if (!candidates.length) break;
                const candidate = pickWeightedMatrixCrawlerCandidate(candidates);
                const branch = candidate.room;
                const dir = candidate.dir;
                const room = {
                    x: candidate.nx,
                    y: candidate.ny,
                    key: candidate.key,
                    type: 'combat',
                    depth: (branch.depth || 0) + 1,
                    parentKey: branch.key,
                    parentDir: dir.opposite,
                    links: {},
                    entered: false,
                    clear: false
                };
                branch.links[dir.id] = room.key;
                room.links[dir.opposite] = branch.key;
                roomMap.set(room.key, room);
                rooms.push(room);
            }
            return rooms;
        }

        function getMatrixCrawlerGraphDistances(rooms) {
            const map = new Map(rooms.map(room => [room.key, room]));
            const distances = new Map([['0,0', 0]]);
            const queue = ['0,0'];
            for (let head = 0; head < queue.length; head++) {
                const key = queue[head];
                const room = map.get(key);
                if (!room) continue;
                const base = distances.get(key) || 0;
                const links = room.links || room.neighbors || {};
                for (const nextKey of Object.values(links)) {
                    if (!map.has(nextKey) || distances.has(nextKey)) continue;
                    distances.set(nextKey, base + 1);
                    queue.push(nextKey);
                }
            }
            return distances;
        }

        function scoreMatrixCrawlerTreeAttempt(rooms, targetRooms) {
            const distances = getMatrixCrawlerGraphDistances(rooms);
            const deadEnds = countMatrixCrawlerDeadEnds(rooms);
            const maxDistance = deadEnds.reduce((best, room) => Math.max(best, distances.get(room.key) || 0), 0);
            const fullRoomBonus = rooms.length >= targetRooms ? 1000 : rooms.length * 10;
            const deadEndPenalty = Math.max(0, getMatrixCrawlerRequiredDeadEnds() - deadEnds.length) * 90;
            return fullRoomBonus + deadEnds.length * 70 + maxDistance * 12 - deadEndPenalty;
        }

        function buildMatrixCrawlerTreeGraph(targetRooms) {
            let bestRooms = null;
            let bestScore = -Infinity;
            for (let attempt = 0; attempt < MATRIX_CRAWLER_FLOOR_GEN_CONFIG.treeAttempts; attempt++) {
                const rooms = buildMatrixCrawlerTreeAttempt(targetRooms);
                const score = scoreMatrixCrawlerTreeAttempt(rooms, targetRooms);
                const deadEnds = countMatrixCrawlerDeadEnds(rooms).length;
                if (score > bestScore) {
                    bestScore = score;
                    bestRooms = rooms;
                }
                if (rooms.length >= targetRooms && deadEnds >= getMatrixCrawlerRequiredDeadEnds()) break;
            }
            return bestRooms || buildMatrixCrawlerTreeAttempt(targetRooms);
        }

        function takeMatrixCrawlerDeadEnd(pool, index = 0) {
            if (!pool || !pool.length) return null;
            const clamped = Math.max(0, Math.min(pool.length - 1, index));
            return pool.splice(clamped, 1)[0] || null;
        }

        function assignMatrixCrawlerSpecialRooms(rooms) {
            const distances = getMatrixCrawlerGraphDistances(rooms);
            for (const room of rooms) {
                room.depth = distances.get(room.key) || 0;
                room.type = room.key === '0,0' ? 'start' : 'combat';
            }

            const deadEnds = getMatrixCrawlerVisibleDeadEnds(rooms)
                .sort((a, b) => (b.depth || 0) - (a.depth || 0) || a.key.localeCompare(b.key));

            const bossRoom = takeMatrixCrawlerDeadEnd(deadEnds, 0);
            if (bossRoom) bossRoom.type = 'boss';

            const treasureRoom = takeMatrixCrawlerDeadEnd(deadEnds, 0);
            if (treasureRoom) treasureRoom.type = 'treasure';

            const shopIndex = deadEnds.length > 2 ? Math.floor(deadEnds.length * 0.38) : 0;
            const shopRoom = takeMatrixCrawlerDeadEnd(deadEnds, shopIndex);
            if (shopRoom) shopRoom.type = 'shop';

            const challengeRoom = takeMatrixCrawlerDeadEnd(deadEnds, 0);
            if (challengeRoom) challengeRoom.type = 'challenge';
        }

        function getMatrixCrawlerSecretRoomCandidates(rooms) {
            const visibleRooms = getMatrixCrawlerVisibleRooms(rooms);
            const visibleMap = new Map(visibleRooms.map(room => [room.key, room]));
            const occupied = new Set((rooms || []).map(room => room.key));
            const bounds = getMatrixCrawlerGridBounds(visibleRooms);
            const candidates = [];

            for (let y = bounds.minY; y <= bounds.maxY; y++) {
                for (let x = bounds.minX; x <= bounds.maxX; x++) {
                    const key = matrixKey(x, y);
                    if (occupied.has(key)) continue;
                    const adjacent = getMatrixCrawlerAdjacentVisibleRooms(x, y, visibleMap);
                    if (adjacent.length < MATRIX_CRAWLER_FLOOR_GEN_CONFIG.secretRoomScoring.minAdjacent) continue;

                    const adjacentTypes = adjacent.map(item => item.room.type || 'combat');
                    let score = adjacent.length * MATRIX_CRAWLER_FLOOR_GEN_CONFIG.secretRoomScoring.adjacentScore;
                    if (adjacent.length >= 3) score += MATRIX_CRAWLER_FLOOR_GEN_CONFIG.secretRoomScoring.multiAdjacentBonus;
                    if (adjacentTypes.includes('start')) score += MATRIX_CRAWLER_FLOOR_GEN_CONFIG.secretRoomScoring.startPenalty;
                    if (adjacentTypes.includes('boss')) score += MATRIX_CRAWLER_FLOOR_GEN_CONFIG.secretRoomScoring.bossPenalty;
                    score += Math.random() * MATRIX_CRAWLER_FLOOR_GEN_CONFIG.secretRoomScoring.randomTiebreaker;
                    candidates.push({ x, y, key, adjacent, adjacentTypes, score });
                }
            }

            candidates.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
            return candidates;
        }

        function getMatrixCrawlerSecretAdjacencyInfo(secretRoom, rooms) {
            if (!secretRoom) return null;
            const visibleMap = new Map(getMatrixCrawlerVisibleRooms(rooms).map(room => [room.key, room]));
            const adjacent = getMatrixCrawlerAdjacentVisibleRooms(secretRoom.x, secretRoom.y, visibleMap)
                .map(item => ({
                    key: item.room.key,
                    type: item.room.type || 'combat',
                    dir: item.dir.id,
                    fromRoomDir: item.dir.opposite
                }));
            return {
                exists: true,
                key: secretRoom.key,
                x: secretRoom.x,
                y: secretRoom.y,
                touchCount: adjacent.length,
                adjacentTypes: adjacent.map(item => item.type),
                adjacent
            };
        }

        function placeMatrixCrawlerSecretRoom(rooms) {
            const candidate = getMatrixCrawlerSecretRoomCandidates(rooms)[0];
            if (!candidate) return null;

            const adjacent = candidate.adjacent.map(item => ({
                key: item.room.key,
                type: item.room.type || 'combat',
                dir: item.dir.id,
                fromRoomDir: item.dir.opposite
            }));
            const nearestDepth = candidate.adjacent.reduce((best, item) => Math.min(best, item.room.depth || 0), Infinity);
            const secretRoom = {
                x: candidate.x,
                y: candidate.y,
                key: candidate.key,
                type: 'secret',
                depth: Number.isFinite(nearestDepth) ? nearestDepth + 1 : 0,
                links: {},
                entered: false,
                clear: true,
                hidden: true,
                secret: true,
                secretAdjacent: adjacent,
                secretAdjacentKeys: adjacent.map(item => item.key),
                sealedNeighbors: Object.fromEntries(adjacent.map(item => [item.dir, item.key]))
            };
            rooms.push(secretRoom);
            return secretRoom;
        }

        function getMatrixCrawlerLayoutById(id) {
            return MATRIX_CRAWLER_ROOM_LAYOUTS.find(layout => layout.id === id) || MATRIX_CRAWLER_ROOM_LAYOUTS[0];
        }

        function getMatrixCrawlerRoomExitIds(room) {
            const exits = (room && (room.links || room.neighbors)) || {};
            return MATRIX_CRAWLER_DIRS
                .filter(dir => !!exits[dir.id])
                .map(dir => dir.id);
        }

        function getMatrixCrawlerRoomExitPattern(room) {
            return getMatrixCrawlerRoomExitIds(room).join('');
        }

        function getMatrixCrawlerPatternLayoutId(exitIds) {
            const exits = new Set(exitIds || []);
            const has = dirId => exits.has(dirId);
            if (exits.size <= 1) return 'compact';
            if (exits.size === 2) {
                if (has('N') && has('S')) return 'line-v';
                if (has('E') && has('W')) return 'line-h';
                if (has('N') && has('E')) return 'l-sw';
                if (has('E') && has('S')) return 'l-nw';
                if (has('S') && has('W')) return 'l-ne';
                if (has('W') && has('N')) return 'l-se';
            }
            if (exits.size === 3) {
                const missing = MATRIX_CRAWLER_DIRS.find(dir => !has(dir.id));
                return missing ? `t-${missing.id.toLowerCase()}` : 'standard';
            }
            return exits.size >= 4 ? 'large' : 'standard';
        }

        function getMatrixCrawlerSmallPatternLayoutId(exitIds) {
            const exits = new Set(exitIds || []);
            const has = dirId => exits.has(dirId);
            if (exits.size <= 1) return 'compact';
            if (exits.size === 2) {
                if (has('N') && has('S')) return 'tall';
                if (has('E') && has('W')) return 'wide';
                if (has('N') && has('E')) return 'elbow-ne';
                if (has('E') && has('S')) return 'elbow-se';
                if (has('S') && has('W')) return 'elbow-sw';
                if (has('W') && has('N')) return 'elbow-nw';
            }
            return 'standard';
        }

        function chooseMatrixCrawlerWeightedLayout(room, choices, floor = 1, salt = 0) {
            const candidates = (choices || [])
                .map(choice => ({
                    id: choice.id,
                    weight: Math.max(0, Number(choice.weight) || 0)
                }))
                .filter(choice => choice.id && choice.weight > 0);
            if (!candidates.length) return MATRIX_CRAWLER_ROOM_LAYOUTS[0];
            const total = candidates.reduce((sum, choice) => sum + choice.weight, 0);
            const seed = (room && room.x || 0) * 173
                + (room && room.y || 0) * 251
                + (room && room.depth || 0) * 47
                + Math.max(1, Math.floor(floor || 1)) * 311
                + salt;
            let roll = matrixRand(seed) * total;
            for (const choice of candidates) {
                roll -= choice.weight;
                if (roll <= 0) return getMatrixCrawlerLayoutById(choice.id);
            }
            return getMatrixCrawlerLayoutById(candidates[candidates.length - 1].id);
        }

        function chooseMatrixCrawlerRoomLayout(room, floor = matrixCrawlerState.floor || 1) {
            if (!room) return MATRIX_CRAWLER_ROOM_LAYOUTS[0];
            if (room.type === 'boss') return getMatrixCrawlerLayoutById('large');
            if (room.type === 'start') return getMatrixCrawlerLayoutById('standard');

            const safeFloor = Math.max(1, Math.floor(floor || 1));
            const exitIds = getMatrixCrawlerRoomExitIds(room);
            if ((room.type === 'treasure' || room.type === 'shop' || room.type === 'challenge') && exitIds.length <= 1) {
                return getMatrixCrawlerLayoutById('compact');
            }

            const compactId = getMatrixCrawlerSmallPatternLayoutId(exitIds);
            const largeId = getMatrixCrawlerPatternLayoutId(exitIds);
            const depth = room.depth || 0;
            const exitCount = exitIds.length;
            if (safeFloor <= 1) {
                if (exitCount <= 1) {
                    return chooseMatrixCrawlerWeightedLayout(room, [
                        { id: 'compact', weight: 1.6 },
                        { id: 'standard', weight: 1.0 }
                    ], safeFloor, 13);
                }
                if (exitCount === 2) {
                    return chooseMatrixCrawlerWeightedLayout(room, [
                        { id: compactId, weight: 3.8 },
                        { id: 'standard', weight: depth <= 2 ? 1.7 : 1.0 },
                        { id: largeId, weight: depth >= 4 ? 0.55 : 0.18 }
                    ], safeFloor, 29);
                }
                if (exitCount === 3) {
                    return chooseMatrixCrawlerWeightedLayout(room, [
                        { id: 'standard', weight: 3.2 },
                        { id: compactId, weight: 1.3 },
                        { id: largeId, weight: depth >= 4 ? 0.55 : 0.20 }
                    ], safeFloor, 43);
                }
                return chooseMatrixCrawlerWeightedLayout(room, [
                    { id: 'standard', weight: 2.8 },
                    { id: 'large', weight: 0.65 }
                ], safeFloor, 59);
            }

            if (safeFloor === 2) {
                return chooseMatrixCrawlerWeightedLayout(room, [
                    { id: compactId, weight: exitCount === 2 ? 3.15 : 1.15 },
                    { id: 'standard', weight: exitCount >= 3 ? 2.25 : 1.35 },
                    { id: largeId, weight: exitCount >= 3 || depth >= 5 ? 0.74 : 0.38 }
                ], safeFloor, 71);
            }

            return chooseMatrixCrawlerWeightedLayout(room, [
                { id: compactId, weight: exitCount === 2 ? 1.2 : 0.35 },
                { id: 'standard', weight: 0.72 },
                { id: largeId, weight: 2.15 + Math.min(1.0, depth * 0.08) }
            ], safeFloor, 89);
        }

        function isMatrixCrawlerArchetypeRoom(room) {
            return !!room && (room.type === 'combat' || room.type === 'challenge');
        }

        function getMatrixCrawlerRoomFootprint(room) {
            const layout = getMatrixCrawlerRoomLayout(room);
            return (layout.wScreens || 1) * (layout.hScreens || 1);
        }

        function getMatrixCrawlerRoomArchetypeById(id) {
            return MATRIX_CRAWLER_ROOM_ARCHETYPES.find(archetype => archetype.id === id) || null;
        }

        function getMatrixCrawlerRoomArchetypeSeed(room, floor = matrixCrawlerState.floor || 1, salt = 0) {
            return (room.index || 0) * 149
                + (room.x || 0) * 37
                + (room.y || 0) * 71
                + Math.max(1, floor || 1) * 97
                + salt;
        }

        function isMatrixCrawlerRoomArchetypeCompatible(room, archetype, floor = matrixCrawlerState.floor || 1) {
            if (!isMatrixCrawlerArchetypeRoom(room) || !archetype) return false;
            const safeFloor = Math.max(1, Math.floor(floor || 1));
            const depth = room.depth || 0;
            if (safeFloor < (archetype.minFloor || 1)) return false;
            if (Number.isFinite(archetype.maxFloor) && safeFloor > archetype.maxFloor) return false;
            if (Number.isFinite(archetype.minDepth) && depth < archetype.minDepth) return false;
            if (Number.isFinite(archetype.maxDepth) && depth > archetype.maxDepth) return false;
            if (Array.isArray(archetype.roomTypes) && !archetype.roomTypes.includes(room.type)) return false;

            const layout = getMatrixCrawlerRoomLayout(room);
            if (Array.isArray(archetype.allowedRoomLayouts) && !archetype.allowedRoomLayouts.includes(layout.id)) return false;
            if (Array.isArray(archetype.excludedLayouts) && archetype.excludedLayouts.includes(layout.id)) return false;

            const exitCount = getMatrixCrawlerRoomExitIds(room).length;
            if (Number.isFinite(archetype.minExitCount) && exitCount < archetype.minExitCount) return false;
            if (Number.isFinite(archetype.maxExitCount) && exitCount > archetype.maxExitCount) return false;
            if (Number.isFinite(archetype.minFootprint) && getMatrixCrawlerRoomFootprint(room) < archetype.minFootprint) return false;
            return true;
        }

        function getMatrixCrawlerRoomArchetypeWeight(room, archetype, floor = matrixCrawlerState.floor || 1) {
            const tags = archetype.tags || [];
            const depth = room.depth || 0;
            const safeFloor = Math.max(1, Math.floor(floor || 1));
            let weight = Math.max(0.05, archetype.difficultyWeight || 1);
            if (safeFloor === 1 && depth <= 2 && !tags.includes('beginner')) weight *= 0.35;
            if (safeFloor === 2) {
                if (tags.includes('beginner')) weight *= depth <= 1 ? 0.76 : 0.46;
                if (tags.includes('elite')) weight *= 2.15;
                if (archetype.minFloor >= 2) weight *= 1.85;
                if (tags.includes('timing') || tags.includes('crossfire') || tags.includes('chase')) weight *= 1.22;
            }
            if (depth <= 2 && tags.includes('beginner')) weight *= 1.45;
            if (room.type === 'challenge') {
                weight *= tags.includes('open') ? 0.55 : 1.35;
                weight *= tags.includes('elite') ? (safeFloor === 2 ? 1.35 : 0.45) : 1;
            }
            return weight;
        }

        function chooseMatrixCrawlerRoomArchetype(room, floor = matrixCrawlerState.floor || 1) {
            if (!isMatrixCrawlerArchetypeRoom(room)) return null;
            const safeFloor = Math.max(1, Math.floor(floor || 1));
            if (safeFloor === 2 && room.type === 'challenge') {
                const vectorDuel = getMatrixCrawlerRoomArchetypeById('vector-interceptor-duel');
                if (isMatrixCrawlerRoomArchetypeCompatible(room, vectorDuel, floor)) return vectorDuel;
            }
            const candidates = MATRIX_CRAWLER_ROOM_ARCHETYPES
                .filter(archetype => isMatrixCrawlerRoomArchetypeCompatible(room, archetype, floor))
                .map(archetype => ({
                    archetype,
                    weight: getMatrixCrawlerRoomArchetypeWeight(room, archetype, floor)
                }));
            if (!candidates.length) return getMatrixCrawlerRoomArchetypeById('open-training') || MATRIX_CRAWLER_ROOM_ARCHETYPES[0];

            const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);
            let roll = matrixRand(getMatrixCrawlerRoomArchetypeSeed(room, floor, 31)) * totalWeight;
            for (const item of candidates) {
                roll -= item.weight;
                if (roll <= 0) return item.archetype;
            }
            return candidates[candidates.length - 1].archetype;
        }

        function assignMatrixCrawlerRoomArchetypes(rooms, floor = matrixCrawlerState.floor || 1) {
            for (const room of rooms || []) {
                if (!isMatrixCrawlerArchetypeRoom(room)) {
                    room.archetypeId = null;
                    room.archetypeName = null;
                    room.archetypeTags = null;
                    continue;
                }
                const archetype = chooseMatrixCrawlerRoomArchetype(room, floor);
                room.archetypeId = archetype ? archetype.id : null;
                room.archetypeName = archetype ? archetype.name : null;
                room.archetypeTags = archetype && Array.isArray(archetype.tags) ? archetype.tags.slice() : [];
            }
        }

        function getMatrixCrawlerRoomArchetype(room) {
            return room ? getMatrixCrawlerRoomArchetypeById(room.archetypeId) : null;
        }

        function getMatrixCrawlerChampionVariantDef(variant) {
            return MATRIX_CRAWLER_CHAMPION_VARIANTS[variant] || null;
        }

        function getMatrixCrawlerChampionLimit(room, floor = matrixCrawlerState.floor || 1) {
            const safeFloor = Math.max(1, Math.floor(floor || 1));
            if (room && room.type === 'challenge') return safeFloor <= 1 ? 1 : (safeFloor === 2 ? 3 : 3);
            if (safeFloor <= 1) return 1;
            if (safeFloor === 2) return 3;
            return 2 + (safeFloor >= 4 ? 1 : 0);
        }

        function getMatrixCrawlerChampionChance(room, archetype, floor = matrixCrawlerState.floor || 1) {
            const safeFloor = Math.max(1, Math.floor(floor || 1));
            const depth = room ? room.depth || 0 : 0;
            let chance = safeFloor <= 1
                ? 0.052 + Math.min(0.028, depth * 0.004)
                : safeFloor === 2
                    ? 0.165 + Math.min(0.055, depth * 0.006)
                    : 0.135 + Math.min(0.045, (safeFloor - 3) * 0.012 + depth * 0.003);
            const tags = archetype && Array.isArray(archetype.tags) ? archetype.tags : [];
            if (tags.includes('beginner')) chance *= safeFloor === 2 ? 0.82 : 0.62;
            if (tags.includes('elite')) chance *= safeFloor === 2 ? 1.42 : 1.18;
            if (room && room.type === 'challenge') chance *= 1.35;
            if (safeFloor <= 1 && depth <= 1) chance *= 0.35;
            return Math.max(0, Math.min(safeFloor === 2 ? 0.34 : 0.20, chance));
        }

        function canMatrixCrawlerEnemyBecomeChampion(enemy, room) {
            if (!enemy || !room || enemy.dead) return false;
            if (enemy.isChampion || enemy.isChampionFragment || enemy.suppressChampion) return false;
            if (enemy.noDrops || enemy.pairId || enemy.pairRole) return false;
            if (enemy.type === 'nullPhantom' || enemy.type === 'distortedGlitch' || enemy.type === 'firewallMask' || enemy.type === 'exposedKernel') return false;
            return ['seeker', 'bug', 'turret', 'orbit', 'portSentry', 'crashBug', 'shieldedPortNode', 'rebootingMalwareHusk'].includes(enemy.type);
        }

        function canMatrixCrawlerChampionSplit(enemy) {
            return !!enemy && ['seeker', 'bug', 'orbit'].includes(enemy.type);
        }

        function getMatrixCrawlerChampionVariantWeights(enemy, room, archetype, floor = matrixCrawlerState.floor || 1) {
            const tags = archetype && Array.isArray(archetype.tags) ? archetype.tags : [];
            const layout = getMatrixCrawlerRoomLayout(room);
            const cramped = layout.id === 'compact' || getMatrixCrawlerRoomExitIds(room).length <= 1 || tags.includes('pit') || tags.includes('slow');
            const beginner = tags.includes('beginner') || (Math.max(1, floor || 1) <= 1 && (room.depth || 0) <= 3);
            const weights = [];
            if (enemy.speed > 0 && !cramped && !beginner && ['seeker', 'bug', 'orbit', 'crashBug'].includes(enemy.type)) {
                weights.push({ id: 'overclocked', weight: tags.includes('chase') ? 0.95 : 0.58 });
            }
            if (!enemy.isShielded && enemy.type !== 'shieldedPortNode') {
                weights.push({ id: 'shielded', weight: tags.includes('cover') ? 1.05 : 0.70 });
            }
            if (!cramped && !beginner && enemy.type !== 'shieldedPortNode') {
                weights.push({ id: 'volatile', weight: tags.includes('swarm') ? 0.78 : 0.48 });
            }
            if (!cramped && canMatrixCrawlerChampionSplit(enemy)) {
                weights.push({ id: 'splitter', weight: tags.includes('open') ? 0.78 : 0.42 });
            }
            weights.push({ id: 'dataRich', weight: tags.includes('cache') ? 1.45 : 0.96 });
            return weights;
        }

        function chooseMatrixCrawlerChampionVariant(enemy, room, archetype, floor, salt) {
            const weights = getMatrixCrawlerChampionVariantWeights(enemy, room, archetype, floor);
            if (!weights.length) return null;
            const total = weights.reduce((sum, item) => sum + item.weight, 0);
            let roll = matrixRand(getMatrixCrawlerRoomArchetypeSeed(room, floor, 541 + salt)) * total;
            for (const item of weights) {
                roll -= item.weight;
                if (roll <= 0) return item.id;
            }
            return weights[weights.length - 1].id;
        }

        function applyMatrixCrawlerChampionVariant(enemy, variant) {
            const def = getMatrixCrawlerChampionVariantDef(variant);
            if (!enemy || !def) return enemy;
            enemy.variant = variant;
            enemy.isChampion = true;
            enemy.variantColor = def.color;
            enemy.variantGlow = def.glow;
            enemy.variantMarker = def.marker;
            enemy.variantInitialized = true;
            enemy.championPulse = Math.random() * Math.PI * 2;
            enemy.championFlashTimer = 0;
            enemy.championTrailTimer = 0;

            if (variant === 'overclocked') {
                enemy.speed = (enemy.speed || 0) * 1.34;
                enemy.fireTimer = Math.min(enemy.fireTimer || 0.6, 0.44);
                enemy.maxHp = Math.max(6, Math.round((enemy.maxHp || enemy.hp || 20) * 0.92));
                enemy.hp = Math.min(enemy.hp || enemy.maxHp, enemy.maxHp);
                enemy.contact = Math.max(enemy.contact || 0, Math.round((enemy.contact || 6) * 1.08));
            } else if (variant === 'shielded') {
                enemy.championShieldCharges = 1;
            } else if (variant === 'dataRich') {
                enemy.maxHp = Math.max(8, Math.round((enemy.maxHp || enemy.hp || 20) * 1.22));
                enemy.hp = Math.max(enemy.hp || 0, enemy.maxHp);
            } else if (variant === 'splitter') {
                enemy.maxHp = Math.max(8, Math.round((enemy.maxHp || enemy.hp || 20) * 0.94));
                enemy.hp = Math.min(enemy.hp || enemy.maxHp, enemy.maxHp);
            }
            return enemy;
        }

        function maybeApplyMatrixCrawlerChampionVariant(enemy, room, archetype, floor, index, championCounts) {
            if (!canMatrixCrawlerEnemyBecomeChampion(enemy, room)) return false;
            const limit = getMatrixCrawlerChampionLimit(room, floor);
            if ((championCounts.total || 0) >= limit) return false;
            const chance = getMatrixCrawlerChampionChance(room, archetype, floor);
            const seed = getMatrixCrawlerRoomArchetypeSeed(room, floor, 613 + index * 47 + (championCounts.total || 0) * 19);
            if (matrixRand(seed) >= chance) return false;
            const variant = chooseMatrixCrawlerChampionVariant(enemy, room, archetype, floor, index * 31 + (championCounts.total || 0) * 7);
            if (!variant) return false;
            applyMatrixCrawlerChampionVariant(enemy, variant);
            championCounts.total = (championCounts.total || 0) + 1;
            championCounts[variant] = (championCounts[variant] || 0) + 1;
            return true;
        }

        function finalizeMatrixCrawlerFloorRooms(rooms, floor = matrixCrawlerState.floor || 1) {
            rooms.sort((a, b) => a.depth - b.depth || a.key.localeCompare(b.key));

            for (let i = 0; i < rooms.length; i++) {
                const room = rooms[i];
                room.layout = chooseMatrixCrawlerRoomLayout(room, floor);
                room.neighbors = {};
                room.index = i;
                if (room.type === 'start' || room.type === 'treasure' || room.type === 'shop' || room.type === 'secret') room.clear = true;
            }
            const map = new Map(rooms.map(room => [room.key, room]));
            for (const room of rooms) {
                const links = room.links || {};
                for (const dir of MATRIX_CRAWLER_DIRS) {
                    const neighborKey = links[dir.id];
                    const neighbor = neighborKey ? map.get(neighborKey) : null;
                    const reciprocal = neighbor && neighbor.links && neighbor.links[dir.opposite] === room.key;
                    if (neighbor && reciprocal) room.neighbors[dir.id] = neighbor.key;
                }
            }
            return map;
        }

        function findMatrixCrawlerGridAdjacencyViolation(rooms, map) {
            for (const room of rooms) {
                if (!isMatrixCrawlerVisibleGraphRoom(room)) continue;
                for (const dir of MATRIX_CRAWLER_DIRS) {
                    if (dir.id !== 'E' && dir.id !== 'S') continue;
                    const neighbor = map.get(matrixKey(room.x + dir.x, room.y + dir.y));
                    if (!isMatrixCrawlerVisibleGraphRoom(neighbor)) continue;
                    if (!areMatrixCrawlerRoomsLinked(room, neighbor)) {
                        return `${room.key} touches ${neighbor.key} without a door`;
                    }
                }
            }
            return null;
        }

        function findMatrixCrawlerNeighborLinkViolation(rooms, map) {
            for (const room of rooms || []) {
                const neighbors = room.neighbors || {};
                for (const dir of MATRIX_CRAWLER_DIRS) {
                    const neighborKey = neighbors[dir.id];
                    if (!neighborKey) continue;
                    const neighbor = map.get(neighborKey);
                    if (!neighbor) return `${room.key} links ${dir.id} to missing room ${neighborKey}`;
                    if (!neighbor.neighbors || neighbor.neighbors[dir.opposite] !== room.key) {
                        return `${room.key} links ${dir.id} to ${neighbor.key}, but reciprocal ${dir.opposite} is missing`;
                    }
                }
            }
            return null;
        }

        function makeMatrixCrawlerValidationResult(reasons, metrics) {
            return {
                ok: reasons.length === 0,
                reason: reasons[0] || '',
                errors: reasons,
                reasons,
                metrics
            };
        }

        function validateMatrixCrawlerFloorGraph(rooms, map, options = {}) {
            const safeRooms = rooms || [];
            const floor = Math.max(1, Math.floor(options.floor || (matrixCrawlerState && matrixCrawlerState.floor) || 1));
            const roomMap = map || new Map(safeRooms.map(room => [room.key, room]));
            const reasons = [];
            const distances = getMatrixCrawlerGraphDistances(safeRooms);
            const visibleRooms = getMatrixCrawlerVisibleRooms(safeRooms);
            const visibleRoomCount = visibleRooms.length;
            const secretRooms = safeRooms.filter(room => room.type === 'secret');
            const deadEnds = getMatrixCrawlerVisibleDeadEnds(safeRooms);
            const roomCountRange = getMatrixCrawlerVisibleRoomCountRange(floor);
            const deadEndRange = getMatrixCrawlerDeadEndRange(visibleRoomCount);
            const boss = safeRooms.find(room => room.type === 'boss');
            const treasure = safeRooms.find(room => room.type === 'treasure') || null;
            const shop = safeRooms.find(room => room.type === 'shop') || null;
            const challenge = safeRooms.find(room => room.type === 'challenge') || null;
            const specialRooms = { treasure, shop, challenge };
            const secretInfo = secretRooms[0] ? getMatrixCrawlerSecretAdjacencyInfo(secretRooms[0], safeRooms) : null;
            const metrics = {
                floor,
                totalRooms: safeRooms.length,
                visibleRoomCount,
                secretRoomCount: secretRooms.length,
                targetVisibleRoomCount: roomCountRange.target,
                roomCountRange,
                deadEndCount: deadEnds.length,
                deadEndRange,
                bossDistance: boss ? distances.get(boss.key) ?? null : null,
                treasureDistance: treasure ? distances.get(treasure.key) ?? null : null,
                shopDistance: shop ? distances.get(shop.key) ?? null : null,
                challengeDistance: challenge ? distances.get(challenge.key) ?? null : null,
                secretTouchCount: secretInfo ? secretInfo.touchCount : 0
            };

            if (!safeRooms.length) {
                reasons.push('empty floor');
                return makeMatrixCrawlerValidationResult(reasons, metrics);
            }

            const start = roomMap.get('0,0');
            if (!start || start.x !== 0 || start.y !== 0 || start.type !== 'start') {
                reasons.push('start room is missing or not at 0,0');
            }

            const seenKeys = new Set();
            for (const room of safeRooms) {
                if (seenKeys.has(room.key)) reasons.push(`duplicate room key ${room.key}`);
                seenKeys.add(room.key);
            }

            if (visibleRoomCount < roomCountRange.min || visibleRoomCount > roomCountRange.max) {
                reasons.push(`visible room count ${visibleRoomCount} outside ${roomCountRange.min}-${roomCountRange.max}`);
            }
            if (deadEnds.length < deadEndRange.min || deadEnds.length > deadEndRange.max) {
                reasons.push(`dead-end count ${deadEnds.length} outside ${deadEndRange.min}-${deadEndRange.max}`);
            }
            if (visibleRooms.some(room => !distances.has(room.key))) {
                reasons.push('one or more visible rooms are unreachable from start');
            }

            const deadEndKeys = new Set(deadEnds.map(room => room.key));
            const farthestDeadEnd = deadEnds.slice()
                .sort((a, b) => (distances.get(b.key) || 0) - (distances.get(a.key) || 0) || a.key.localeCompare(b.key))[0];
            if (!boss) {
                reasons.push('boss room is missing');
            } else if (!deadEndKeys.has(boss.key)) {
                reasons.push('boss is not on a dead end');
            } else if (farthestDeadEnd && boss.key !== farthestDeadEnd.key) {
                reasons.push('boss is not the farthest dead end');
            }

            const specialKeys = new Map();
            for (const type of MATRIX_CRAWLER_FLOOR_GEN_CONFIG.specialRoomPriority.filter(type => type !== 'boss')) {
                const roomsOfType = safeRooms.filter(candidate => candidate.type === type);
                if (roomsOfType.length > 1) reasons.push(`more than one ${type} room`);
                const room = specialRooms[type];
                if (!room) continue;
                if (specialKeys.has(room.key)) {
                    reasons.push(`${type} overlaps ${specialKeys.get(room.key)} at ${room.key}`);
                }
                specialKeys.set(room.key, type);
                if (room.key === '0,0' || (boss && room.key === boss.key) || !deadEndKeys.has(room.key)) {
                    reasons.push(`${type} room is not on its own dead end`);
                }
            }

            const neighborViolation = findMatrixCrawlerNeighborLinkViolation(safeRooms, roomMap);
            if (neighborViolation) reasons.push(neighborViolation);

            const gridViolation = findMatrixCrawlerGridAdjacencyViolation(safeRooms, roomMap);
            if (gridViolation) reasons.push(gridViolation);

            if (secretRooms.length > 1) reasons.push('more than one secret room');
            const possibleSecretCandidates = getMatrixCrawlerSecretRoomCandidates(safeRooms.filter(room => room.type !== 'secret'));
            if (secretRooms.length === 0 && possibleSecretCandidates.length > 0) {
                reasons.push('missing valid secret room');
            }
            if (secretRooms.length === 1) {
                if (!secretRooms[0].hidden || !secretRooms[0].secret) {
                    reasons.push('secret room is missing hidden/secret flags');
                }
                if (!secretInfo || secretInfo.touchCount < MATRIX_CRAWLER_FLOOR_GEN_CONFIG.secretRoomScoring.minAdjacent) {
                    reasons.push('secret room does not touch enough visible rooms');
                }
            }

            return makeMatrixCrawlerValidationResult(reasons, metrics);
        }

        function scoreMatrixCrawlerFinalFloor(rooms, validation) {
            const distances = getMatrixCrawlerGraphDistances(rooms);
            const boss = rooms.find(room => room.type === 'boss');
            const bossDistance = boss ? distances.get(boss.key) || 0 : 0;
            const deadEnds = getMatrixCrawlerVisibleDeadEnds(rooms).length;
            const secretInfo = getMatrixCrawlerSecretAdjacencyInfo(rooms.find(room => room.type === 'secret'), rooms);
            return (validation && validation.ok ? 100000 : 0)
                + rooms.length * 100
                + deadEnds * 45
                + bossDistance * 12
                + (secretInfo ? 500 + secretInfo.touchCount * 50 : 0);
        }

        function buildMatrixCrawlerFloor() {
            const state = matrixCrawlerState;
            const floor = Math.max(1, state.floor || 1);
            const targetRooms = getMatrixCrawlerTargetVisibleRoomCount(floor);
            let rooms = null;
            let map = null;
            let bestAttempt = null;

            for (let attempt = 0; attempt < MATRIX_CRAWLER_FLOOR_GEN_CONFIG.maxAttempts; attempt++) {
                const attemptRooms = buildMatrixCrawlerTreeGraph(targetRooms);
                assignMatrixCrawlerSpecialRooms(attemptRooms);
                placeMatrixCrawlerSecretRoom(attemptRooms);
                const attemptMap = finalizeMatrixCrawlerFloorRooms(attemptRooms, floor);
                assignMatrixCrawlerRoomArchetypes(attemptRooms, floor);
                const validation = validateMatrixCrawlerFloorGraph(attemptRooms, attemptMap, { floor });
                const score = scoreMatrixCrawlerFinalFloor(attemptRooms, validation);
                if (!bestAttempt || score > bestAttempt.score) {
                    bestAttempt = { rooms: attemptRooms, map: attemptMap, validation, score };
                }
                if (validation.ok) {
                    rooms = attemptRooms;
                    map = attemptMap;
                    break;
                }
            }

            if (!rooms) {
                rooms = bestAttempt.rooms;
                map = bestAttempt.map;
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('[MatrixCrawlerFloor] Using best invalid floor after retries.', {
                        reason: bestAttempt.validation && bestAttempt.validation.reason,
                        reasons: bestAttempt.validation && bestAttempt.validation.reasons,
                        metrics: bestAttempt.validation && bestAttempt.validation.metrics
                    });
                }
            }
            state.rooms = rooms;
            state.roomMap = map;
            state.floorValidation = validateMatrixCrawlerFloorGraph(rooms, map, { floor });
            state.currentKey = '0,0';
            state.discovered = new Set(['0,0']);
            state.totalCombatRooms = rooms.filter(room => room.type === 'combat' || room.type === 'challenge' || room.type === 'boss').length;
            state.roomsCleared = 0;
            return rooms;
        }

        function getMatrixCrawlerFloorAsciiMap(state = matrixCrawlerState) {
            const rooms = state && state.rooms ? state.rooms : [];
            if (!rooms.length) return '';
            const minX = Math.min(...rooms.map(room => room.x));
            const maxX = Math.max(...rooms.map(room => room.x));
            const minY = Math.min(...rooms.map(room => room.y));
            const maxY = Math.max(...rooms.map(room => room.y));
            const mapW = (maxX - minX) * 2 + 1;
            const mapH = (maxY - minY) * 2 + 1;
            const grid = Array.from({ length: mapH }, () => Array.from({ length: mapW }, () => ' '));
            const roomChar = room => {
                if (room.type === 'start') return 'S';
                if (room.type === 'boss') return 'B';
                if (room.type === 'treasure') return 'T';
                if (room.type === 'shop') return 'U';
                if (room.type === 'challenge') return 'C';
                if (room.type === 'secret') return '?';
                return '.';
            };
            const toGrid = room => ({
                x: (room.x - minX) * 2,
                y: (room.y - minY) * 2
            });
            const map = state.roomMap || new Map(rooms.map(room => [room.key, room]));
            for (const room of rooms) {
                const p = toGrid(room);
                grid[p.y][p.x] = roomChar(room);
                for (const dir of MATRIX_CRAWLER_DIRS) {
                    if (dir.id !== 'E' && dir.id !== 'S') continue;
                    const neighborKey = room.neighbors && room.neighbors[dir.id];
                    const neighbor = neighborKey ? map.get(neighborKey) : null;
                    if (!neighbor) continue;
                    grid[p.y + dir.y][p.x + dir.x] = dir.id === 'E' ? '-' : '|';
                }
            }
            return grid.map(row => row.join('').replace(/\s+$/g, '')).join('\n');
        }

        function getMatrixCrawlerFloorDebugSummary(state = matrixCrawlerState) {
            const rooms = state && state.rooms ? state.rooms : [];
            const currentRoom = state && state.currentKey && state.roomMap ? state.roomMap.get(state.currentKey) : null;
            const distances = getMatrixCrawlerGraphDistances(rooms);
            const typeCounts = {};
            const terrainCounts = {};
            const enemyCounts = {};
            const championCounts = {};
            for (const feature of getMatrixCrawlerRoomTerrain(currentRoom)) {
                terrainCounts[feature.type || 'unknown'] = (terrainCounts[feature.type || 'unknown'] || 0) + 1;
            }
            for (const enemy of (state && state.enemies) || []) {
                if (!enemy || enemy.dead) continue;
                enemyCounts[enemy.type || 'unknown'] = (enemyCounts[enemy.type || 'unknown'] || 0) + 1;
                if (enemy.isChampion) {
                    championCounts[enemy.variant || 'unknown'] = (championCounts[enemy.variant || 'unknown'] || 0) + 1;
                }
            }
            const terrainIssues = [];
            if (currentRoom) {
                const rect = getMatrixCrawlerRoomRect(currentRoom);
                const forbidden = getMatrixCrawlerTerrainForbiddenRects(currentRoom, rect);
                for (const feature of getMatrixCrawlerRoomTerrain(currentRoom)) {
                    const fRect = getMatrixCrawlerTerrainRect(feature);
                    if (!isMatrixCrawlerTerrainCandidateValid(currentRoom, feature, getMatrixCrawlerRoomTerrain(currentRoom).filter(other => other !== feature))) {
                        terrainIssues.push(`${feature.type || 'terrain'} placement check failed`);
                        break;
                    }
                    if (forbidden.some(blocked => doMatrixCrawlerRectsOverlap(fRect, blocked, 0))) {
                        terrainIssues.push(`${feature.type || 'terrain'} overlaps protected zone`);
                    }
                }
            }
            const validation = validateMatrixCrawlerFloorGraph(rooms, state && state.roomMap, {
                floor: state && state.floor ? state.floor : 1
            });
            const specialDistances = {
                boss: null,
                treasure: null,
                shop: null,
                challenge: null
            };
            for (const room of rooms) {
                typeCounts[room.type || 'unknown'] = (typeCounts[room.type || 'unknown'] || 0) + 1;
                if (Object.prototype.hasOwnProperty.call(specialDistances, room.type)) {
                    specialDistances[room.type] = distances.get(room.key) || room.depth || 0;
                }
            }
            const deadEndCount = getMatrixCrawlerVisibleDeadEnds(rooms).length;
            const visibleRoomCount = getMatrixCrawlerVisibleRooms(rooms).length;
            const secretRoomCount = rooms.filter(room => room.type === 'secret').length;
            const roomDetails = rooms.map(room => ({
                key: room.key,
                type: room.type || 'unknown',
                exits: getMatrixCrawlerRoomExitPattern(room) || '-',
                layout: (getMatrixCrawlerRoomLayout(room) || {}).id || 'standard',
                archetype: room.archetypeId || '-',
                hidden: !!room.hidden
            }));
            const secretRoom = rooms.find(room => room.type === 'secret') || null;
            const secretInfo = secretRoom
                ? getMatrixCrawlerSecretAdjacencyInfo(secretRoom, rooms)
                : {
                    exists: false,
                    key: null,
                    x: null,
                    y: null,
                    touchCount: 0,
                    adjacentTypes: [],
                    adjacent: []
                };
            return {
                totalRooms: rooms.length,
                visibleRoomCount,
                secretRoomCount,
                deadEndCount,
                bossDistance: specialDistances.boss,
                treasureDistance: specialDistances.treasure,
                shopDistance: specialDistances.shop,
                challengeDistance: specialDistances.challenge,
                typeCounts,
                validation,
                validationResult: validation.ok,
                validationErrors: validation.errors,
                secret: secretInfo,
                roomDetails,
                currentRoomTerrain: {
                    roomKey: currentRoom ? currentRoom.key : null,
                    counts: terrainCounts,
                    total: getMatrixCrawlerRoomTerrain(currentRoom).length,
                    issues: terrainIssues
                },
                currentRoomArchetype: {
                    roomKey: currentRoom ? currentRoom.key : null,
                    id: currentRoom && currentRoom.archetypeId ? currentRoom.archetypeId : null,
                    name: currentRoom && currentRoom.archetypeName ? currentRoom.archetypeName : null,
                    tags: currentRoom && Array.isArray(currentRoom.archetypeTags) ? currentRoom.archetypeTags.slice() : [],
                    exits: currentRoom ? (getMatrixCrawlerRoomExitPattern(currentRoom) || '-') : null,
                    layout: currentRoom ? ((getMatrixCrawlerRoomLayout(currentRoom) || {}).id || 'standard') : null,
                    enemyCounts,
                    championCounts,
                    enemyTotal: Object.values(enemyCounts).reduce((sum, count) => sum + count, 0),
                    championTotal: Object.values(championCounts).reduce((sum, count) => sum + count, 0),
                    validation: terrainIssues.length ? 'terrain issues' : 'ok'
                },
                asciiMap: getMatrixCrawlerFloorAsciiMap(state)
            };
        }

        function debugMatrixCrawlerFloor() {
            const summary = getMatrixCrawlerFloorDebugSummary(matrixCrawlerState);
            console.log(`[MatrixCrawlerFloor] rooms=${summary.totalRooms} visible=${summary.visibleRoomCount} secrets=${summary.secretRoomCount} deadEnds=${summary.deadEndCount} bossDistance=${summary.bossDistance ?? 'none'} treasureDistance=${summary.treasureDistance ?? 'none'} shopDistance=${summary.shopDistance ?? 'none'} challengeDistance=${summary.challengeDistance ?? 'none'}`);
            console.log(`[MatrixCrawlerFloor] validation=${summary.validation.ok ? 'ok' : 'failed'}${summary.validation.reason ? ` reason=${summary.validation.reason}` : ''}`);
            if (!summary.validation.ok) console.log('[MatrixCrawlerFloor] validationErrors', summary.validationErrors);
            console.log(`[MatrixCrawlerFloor] secret=${summary.secret.exists ? `${summary.secret.key} (${summary.secret.x},${summary.secret.y}) touches=${summary.secret.touchCount} adjacent=${summary.secret.adjacentTypes.join('/')}` : 'none'}`);
            console.log(`[MatrixCrawlerFloor] currentRoomTerrain=${summary.currentRoomTerrain.total} counts=${JSON.stringify(summary.currentRoomTerrain.counts)} issues=${summary.currentRoomTerrain.issues.length ? summary.currentRoomTerrain.issues.join('; ') : 'none'}`);
            console.log(`[MatrixCrawlerFloor] currentRoomArchetype=${summary.currentRoomArchetype.id || 'none'} name=${summary.currentRoomArchetype.name || 'none'} exits=${summary.currentRoomArchetype.exits || '-'} layout=${summary.currentRoomArchetype.layout || '-'} enemies=${JSON.stringify(summary.currentRoomArchetype.enemyCounts)} champions=${JSON.stringify(summary.currentRoomArchetype.championCounts)} validation=${summary.currentRoomArchetype.validation}`);
            console.log('[MatrixCrawlerFloor] typeCounts', summary.typeCounts);
            if (console.table) console.table(summary.roomDetails);
            else console.log('[MatrixCrawlerFloor] roomDetails', summary.roomDetails);
            console.log(`[MatrixCrawlerFloor]\n${summary.asciiMap}`);
            return summary;
        }
        if (typeof window !== 'undefined') window.debugMatrixCrawlerFloor = debugMatrixCrawlerFloor;

        function debugMatrixCrawlerHealth() {
            const summary = {
                active: isMatrixCrawlerRuntimeActive(),
                hp: player.hp,
                maxHp: player.maxHp,
                heartHp: MATRIX_CRAWLER_HEART_HP,
                hearts: getMatrixCrawlerFilledHeartCount(),
                maxHearts: getMatrixCrawlerHeartCount(),
                invulnerability: matrixCrawlerState ? (matrixCrawlerState.invuln || 0) : 0,
                hudSegments: Math.max(1, Math.ceil((player.maxHp || 1) / MATRIX_CRAWLER_HEART_HP))
            };
            console.log('[MatrixCrawlerHealth]', summary);
            return summary;
        }
        if (typeof window !== 'undefined') window.debugMatrixCrawlerHealth = debugMatrixCrawlerHealth;

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
            applyMatrixCrawlerHeartHealth({ hearts: MATRIX_CRAWLER_STARTING_HEARTS, heal: true });
            player.invincibilityTimer = 0;
            player.flashTimer = 0;
            player.isFiring = false;
            player.isBeaming = false;
            state.aimAngle = PLAYER_FIRE_FORWARD_ANGLE;
            state.targetAimAngle = PLAYER_FIRE_FORWARD_ANGLE;
            state.facingAngle = PLAYER_FIRE_FORWARD_ANGLE;
            state.targetFacingAngle = PLAYER_FIRE_FORWARD_ANGLE;
            state.playerTurnAfterimages = [];
            state.turnAfterimageCooldown = 0;
            state.playerPhantomEmitter = 0;
            state.hoverRipples = [];
            state.hoverEmitter = 0;
            state.hoverThrusters = [];
            state.hoverThrusterEmitter = 0;
            state.coins = 0;
            state.cacheDaemonCharge = 0;
            state.cacheDaemonReady = false;
            state.pendingMinorCache = false;
            state.cacheDaemonInitialized = false;
            player.matrixCrawlerAimAngle = PLAYER_FIRE_FORWARD_ANGLE;
            player.matrixCrawlerFacingAngle = PLAYER_FIRE_FORWARD_ANGLE;
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

        function advanceMatrixCrawlerFloor() {
            const state = matrixCrawlerState;
            if (!state || !state.active) return false;
            const currentFloor = Math.max(1, Math.floor(state.floor || 1));
            const maxFloor = getMatrixCrawlerConsoleLevelLimit();
            if (currentFloor >= maxFloor) {
                if (typeof beginRunVictoryFlow === 'function') {
                    beginRunVictoryFlow({ name: state.lastBossName || 'DISTORTED GLITCH', color: getMatrixCrawlerFloorTheme().glow });
                } else {
                    gameState = 'RUN_SCORE';
                }
                return true;
            }

            stopMatrixCrawlerBossMusic();
            clearGameplayKeys();
            state.floor = currentFloor + 1;
            state.projectiles = [];
            state.enemyBullets = [];
            state.enemies = [];
            state.pickups = [];
            state.breakables = [];
            state.particles = [];
            state.hoverRipples = [];
            state.hoverEmitter = 0;
            state.hoverThrusters = [];
            state.hoverThrusterEmitter = 0;
            state.playerTurnAfterimages = [];
            state.playerPhantomEmitter = 0;
            state.roomFlash = 0.55;
            state.cameraReady = false;
            state.transitionTimer = 0;
            state.transitionDir = null;
            state.invuln = Math.max(state.invuln || 0, 1.4);
            state.bossMusicActive = false;
            state.bossStopMusic = null;
            state.lastBossName = getMatrixCrawlerBossNameForFloor(state.floor);
            bombProjectiles = [];
            bombBlastRings = [];
            debris = [];
            player.vx = 0;
            player.vy = 0;
            player.isFiring = false;
            player.isBeaming = false;
            player.flashTimer = Math.max(player.flashTimer || 0, 0.35);
            buildMatrixCrawlerFloor();
            enterMatrixCrawlerRoom('0,0');
            state.message = `FLOOR ${state.floor}`;
            state.messageTimer = 1.4;
            gameState = MATRIX_CRAWLER_GAME_STATE;
            pauseReturnState = MATRIX_CRAWLER_GAME_STATE;
            if (typeof startMusic === 'function') startMusic();
            applyCurrentVolume();
            return true;
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
                    return { ok: false, message: `Node crawler floor ${targetFloor} has no ${roomType} room.` };
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

        function getMatrixCrawlerEnemyEntrySafeRadius(room, type = 'default') {
            const rect = getMatrixCrawlerRoomRect(room);
            const minDimension = Math.min(rect.w || width || 800, rect.h || height || 600);
            const base = Math.min(260, Math.max(168, minDimension * 0.22));
            if (type === 'turret' || type === 'portSentry' || type === 'shieldedPortNode') return Math.max(156, base - 24);
            if (type === 'crashBug' || type === 'firewallMask') return Math.min(282, base + 28);
            return base;
        }

        function getMatrixCrawlerNearestDoorDistance(room, x, y) {
            if (!room) return Infinity;
            let best = Infinity;
            for (const dir of MATRIX_CRAWLER_DIRS) {
                if (!room.neighbors || !room.neighbors[dir.id]) continue;
                const door = getMatrixCrawlerDoorRect(room, dir.id);
                const cx = door.x + door.w / 2;
                const cy = door.y + door.h / 2;
                best = Math.min(best, Math.hypot(x - cx, y - cy));
            }
            return best;
        }

        function getMatrixCrawlerEnemySpawnScore(room, x, y, type = 'default') {
            const playerDist = Math.hypot(x - player.x, y - player.y);
            const doorDist = getMatrixCrawlerNearestDoorDistance(room, x, y);
            const safeRadius = getMatrixCrawlerEnemyEntrySafeRadius(room, type);
            let score = playerDist + Math.min(190, doorDist) * 0.42;
            if (playerDist < safeRadius) score -= Math.pow(safeRadius - playerDist, 1.12) * 4.4;
            if (doorDist < MATRIX_CRAWLER_ENEMY_DOOR_SAFE_RADIUS) score -= (MATRIX_CRAWLER_ENEMY_DOOR_SAFE_RADIUS - doorDist) * 2.8;
            return score;
        }

        function isMatrixCrawlerEnemySpawnFair(room, x, y, type = 'default') {
            if (Math.hypot(x - player.x, y - player.y) < getMatrixCrawlerEnemyEntrySafeRadius(room, type)) return false;
            if (getMatrixCrawlerNearestDoorDistance(room, x, y) < MATRIX_CRAWLER_ENEMY_DOOR_SAFE_RADIUS) return false;
            return true;
        }

        function getMatrixCrawlerSpawnPoint(room, rect, index, total, type = 'default') {
            let best = null;
            for (let attempt = 0; attempt < 48; attempt++) {
                const seed = index * 101 + total * 17 + attempt * 43;
                const x = rect.x + rect.w * (0.16 + matrixRand(seed) * 0.68);
                const y = rect.y + rect.h * (0.18 + matrixRand(seed + 13) * 0.64);
                if (!isMatrixCrawlerEnemyPointClear(room, x, y, 42)
                    || isMatrixCrawlerPointNearTerrain(room, x, y, 34)
                    || !isMatrixCrawlerPointClearOfBreakables(room, x, y, 44)) continue;
                const score = getMatrixCrawlerEnemySpawnScore(room, x, y, type);
                if (!best || score > best.score) best = { x, y, score };
                if (isMatrixCrawlerEnemySpawnFair(room, x, y, type)) return { x, y };
            }
            if (best) {
                if (isMatrixCrawlerEnemySpawnFair(room, best.x, best.y, type)) return { x: best.x, y: best.y };
                const dx = best.x - player.x;
                const dy = best.y - player.y;
                const dist = Math.max(1, Math.hypot(dx, dy));
                const desired = getMatrixCrawlerEnemyEntrySafeRadius(room, type);
                const nudged = getMatrixCrawlerEnemySafePoint(
                    room,
                    player.x + dx / dist * desired,
                    player.y + dy / dist * desired,
                    42
                );
                if (Math.hypot(nudged.x - player.x, nudged.y - player.y) > Math.hypot(best.x - player.x, best.y - player.y)) return nudged;
                return { x: best.x, y: best.y };
            }
            const fallback = clampMatrixCrawlerBodyPoint(room, rect.x + rect.w / 2, rect.y + rect.h / 2, 42, 'enemy');
            return getMatrixCrawlerEnemySafePoint(room, fallback.x, fallback.y, 42);
        }

        function getMatrixCrawlerArchetypeEnemyPattern(room, archetype, floor = matrixCrawlerState.floor || 1) {
            if (!archetype) return ['seeker', 'bug', 'turret'];
            const canUseAdvanced = Array.isArray(archetype.advancedEnemyPattern)
                && (Math.max(1, floor || 1) >= 2 || (room.depth || 0) >= 6 || room.type === 'challenge');
            return (canUseAdvanced ? archetype.advancedEnemyPattern : archetype.enemyPattern || ['seeker', 'bug']).slice();
        }

        function getMatrixCrawlerArchetypeEnemyCount(room, archetype, floor = matrixCrawlerState.floor || 1) {
            const range = archetype && Array.isArray(archetype.enemyCount) ? archetype.enemyCount : [3, 4];
            const min = Math.max(1, range[0] || 1);
            const max = Math.max(min, range[1] || min);
            const seed = getMatrixCrawlerRoomArchetypeSeed(room, floor, 83);
            const safeFloor = Math.max(1, Math.floor(floor || 1));
            let count = min + Math.floor(matrixRand(seed) * (max - min + 1));
            const tags = archetype && Array.isArray(archetype.tags) ? archetype.tags : [];
            if (safeFloor === 2 && room.type !== 'challenge' && (tags.includes('elite') || tags.includes('timing') || (room.depth || 0) >= 4)) count += 1;
            if (safeFloor >= 3 && room.type !== 'challenge') count += 1;
            if (room.type === 'challenge') count += Math.max(1, Math.min(2, Math.floor((room.depth || 0) / 5) + 1));
            const cap = room.type === 'challenge' ? 7 : (safeFloor === 2 ? 6 : 5);
            return Math.max(min, Math.min(cap, count));
        }

        function getMatrixCrawlerArchetypeSpawnPoint(room, rect, archetype, index, total, type = 'default') {
            const zones = (archetype && Array.isArray(archetype.spawnZones) && archetype.spawnZones.length)
                ? archetype.spawnZones
                : [{ x: 0.32, y: 0.36 }, { x: 0.68, y: 0.40 }, { x: 0.42, y: 0.68 }, { x: 0.62, y: 0.64 }];
            const baseSeed = getMatrixCrawlerRoomArchetypeSeed(room, matrixCrawlerState.floor || 1, 211 + index * 53 + total * 17);
            let best = null;
            for (let attempt = 0; attempt < 42; attempt++) {
                const zone = zones[(index + attempt) % zones.length];
                const jitterX = Number.isFinite(zone.jitterX) ? zone.jitterX : 0.08;
                const jitterY = Number.isFinite(zone.jitterY) ? zone.jitterY : 0.08;
                const nx = Math.max(0.12, Math.min(0.88, zone.x + (matrixRand(baseSeed + attempt * 23) - 0.5) * jitterX));
                const ny = Math.max(0.14, Math.min(0.86, zone.y + (matrixRand(baseSeed + attempt * 29 + 7) - 0.5) * jitterY));
                const x = rect.x + rect.w * nx;
                const y = rect.y + rect.h * ny;
                if (isMatrixCrawlerPointNearDoor(room, x, y, 76)) continue;
                if (isMatrixCrawlerPointNearTerrain(room, x, y, 24)) continue;
                if (!isMatrixCrawlerEnemyPointClear(room, x, y, 42)) continue;
                if (!isMatrixCrawlerPointClearOfBreakables(room, x, y, 44)) continue;
                const minPlayerDistance = Math.max(
                    Number.isFinite(zone.minPlayerDistance) ? zone.minPlayerDistance : 0,
                    getMatrixCrawlerEnemyEntrySafeRadius(room, type)
                );
                const playerDist = Math.hypot(x - player.x, y - player.y);
                const score = getMatrixCrawlerEnemySpawnScore(room, x, y, type);
                if (!best || score > best.score) best = { x, y, score };
                if (playerDist < minPlayerDistance) continue;
                if (!isMatrixCrawlerEnemySpawnFair(room, x, y, type)) continue;
                return { x, y };
            }
            if (best && isMatrixCrawlerEnemySpawnFair(room, best.x, best.y, type)) return { x: best.x, y: best.y };
            return getMatrixCrawlerSpawnPoint(room, rect, index, total, type);
        }

        function resolveMatrixCrawlerArchetypeEnemyType(room, type, floor, counts) {
            if (type === 'vectorInterceptor') {
                if (canSpawnMatrixVectorInterceptorInRoom(room, floor, counts.vectorInterceptor || 0)) {
                    return 'vectorInterceptor';
                }
                return floor >= 2 ? 'crashBug' : 'seeker';
            }
            if (type === 'shieldedPortNode') {
                if (canSpawnMatrixShieldedPortNodeInRoom(room, floor, counts.shieldedPortNode || 0)) {
                    return 'shieldedPortNode';
                }
                return 'turret';
            }
            if (type === 'rebootingMalwareHusk') {
                if (canSpawnMatrixRebootingHuskInRoom(room, floor, counts.rebootingMalwareHusk || 0)) {
                    return 'rebootingMalwareHusk';
                }
                return 'seeker';
            }
            return type;
        }

        function spawnMatrixRoomArchetypeEnemies(room, rect, archetype, difficulty, floor = matrixCrawlerState.floor || 1) {
            const pattern = getMatrixCrawlerArchetypeEnemyPattern(room, archetype, floor);
            const count = getMatrixCrawlerArchetypeEnemyCount(room, archetype, floor);
            const counts = {};
            const championCounts = { total: 0 };
            let firewallPairSpawned = false;
            room.enemyArchetypeApplied = true;
            room.enemyPattern = pattern.slice();
            room.enemyCountTarget = count;

            for (let i = 0; i < count; i++) {
                let type = pattern[i % pattern.length] || 'seeker';
                if (type === 'firewallPair') {
                    if (!firewallPairSpawned && canSpawnMatrixFirewallPairInRoom(room, floor)) {
                        spawnMatrixFirewallPair(room, rect, difficulty, i, count);
                        firewallPairSpawned = true;
                        counts.firewallPair = (counts.firewallPair || 0) + 1;
                        continue;
                    }
                    type = floor >= 2 ? 'firewallHost' : 'orbit';
                }
                type = resolveMatrixCrawlerArchetypeEnemyType(room, type, floor, counts);
                const spawn = getMatrixCrawlerArchetypeSpawnPoint(room, rect, archetype, i, count, type);
                const enemy = spawnMatrixEnemy(type, spawn.x, spawn.y, {
                    hp: Math.round(getMatrixCrawlerEnemyBaseHp(type) * difficulty)
                });
                if (type === 'vectorInterceptor') room.vectorInterceptorSpawned = true;
                maybeApplyMatrixCrawlerChampionVariant(enemy, room, archetype, floor, i, championCounts);
                counts[type] = (counts[type] || 0) + 1;
            }
            room.enemyCounts = counts;
            room.championCounts = championCounts;
        }

        function getMatrixCrawlerBossDefForFloor(floor = matrixCrawlerState.floor || 1) {
            if (Math.max(1, Math.floor(floor || 1)) >= 2) {
                return {
                    type: 'distortedGlitch',
                    name: 'DISTORTED GLITCH',
                    color: '#8ff7ff',
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
            return type === 'portSentry'
                || type === 'crashBug'
                || type === 'vectorInterceptor'
                || type === 'firewallHost'
                || type === 'shieldedPortNode'
                || type === 'rebootingMalwareHusk'
                || type === 'firewallMask'
                || type === 'exposedKernel';
        }

        function getMatrixCrawlerEnemyBaseHp(type) {
            if (type === 'bug') return 18;
            if (type === 'turret') return 34;
            if (type === 'orbit') return 42;
            if (type === 'portSentry') return 36;
            if (type === 'crashBug') return 44;
            if (type === 'firewallHost') return 62;
            if (type === 'shieldedPortNode') return 66;
            if (type === 'rebootingMalwareHusk') return 48;
            if (type === 'firewallMask') return 72;
            if (type === 'exposedKernel') return 58;
            if (type === 'vectorInterceptor') return 118;
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
            } else if (enemy.type === 'shieldedPortNode') {
                enemy.shieldState = 'closed';
                enemy.stateTimer = MATRIX_SHIELDED_PORT_COOLDOWN + Math.random() * 0.75;
                enemy.openDuration = MATRIX_SHIELDED_PORT_OPEN_TIME;
                enemy.cooldownDuration = MATRIX_SHIELDED_PORT_COOLDOWN;
                enemy.fireDelay = 0;
                enemy.hasFired = false;
                enemy.blockedFlashTimer = 0;
                enemy.blockedTextTimer = 0;
                enemy.fireFlashTimer = 0;
                enemy.aimAngle = Math.random() * Math.PI * 2;
                enemy.isShielded = true;
            } else if (enemy.type === 'rebootingMalwareHusk') {
                enemy.huskState = 'active';
                enemy.activeMaxHp = enemy.maxHp || enemy.hp || 48;
                enemy.huskActiveRadius = enemy.radius || 19;
                enemy.huskCoreRadius = 15;
                enemy.huskBaseSpeed = enemy.speed || 106;
                enemy.huskActiveContact = enemy.contact || 10;
                enemy.rebootTimer = 0;
                enemy.rebootCount = 0;
                enemy.coreDumpMaxHp = Math.max(14, Math.round(enemy.activeMaxHp * MATRIX_REBOOTING_HUSK_CORE_HP_RATIO));
                enemy.coreDumpHp = enemy.coreDumpMaxHp;
                enemy.rebootFlashTimer = 0;
                enemy.aimAngle = Math.random() * Math.PI * 2;
            } else if (enemy.type === 'firewallMask') {
                enemy.maskState = 'stalk';
                enemy.maskCooldown = 0.55 + Math.random() * 0.65;
                enemy.maskWindup = 0;
                enemy.maskDashTimer = 0;
                enemy.maskChargeDirX = 0;
                enemy.maskChargeDirY = 1;
                enemy.blockedFlashTimer = 0;
                enemy.blockedTextTimer = 0;
                enemy.aimAngle = Math.random() * Math.PI * 2;
                enemy.isShielded = true;
            } else if (enemy.type === 'exposedKernel') {
                enemy.kernelFireTimer = 0.85 + Math.random() * 0.9;
                enemy.kernelDriftPhase = Math.random() * Math.PI * 2;
                enemy.aimAngle = 0;
            } else if (enemy.type === 'vectorInterceptor') {
                enemy.vectorAiPhase = Math.random() * Math.PI * 2;
                enemy.vectorOrbitSide = Math.random() < 0.5 ? -1 : 1;
                enemy.vectorFireWindup = 0;
                enemy.vectorTargetX = player.x;
                enemy.vectorTargetY = player.y;
                enemy.vectorBurstTimer = 0;
                enemy.vectorTrailTimer = 0;
                enemy.aimAngle = Math.random() * Math.PI * 2;
            }
            return enemy;
        }

        function isMatrixCrawlerBossEnemy(enemyOrType) {
            const type = typeof enemyOrType === 'string' ? enemyOrType : (enemyOrType && enemyOrType.type);
            return type === 'nullPhantom' || type === 'distortedGlitch';
        }

        function getMatrixCrawlerEnemyAggroRange(enemy) {
            if (!enemy) return MATRIX_CRAWLER_ENEMY_DEFAULT_AGGRO_RANGE;
            if (Number.isFinite(enemy.aggroRange)) return enemy.aggroRange;
            if (enemy.type === 'portSentry') return MATRIX_PORT_SENTRY_RANGE;
            if (enemy.type === 'firewallHost') return MATRIX_FIREWALL_HOST_RANGE;
            if (enemy.type === 'shieldedPortNode') return 520;
            if (enemy.type === 'crashBug' || enemy.type === 'firewallMask') return 560;
            if (enemy.type === 'vectorInterceptor') return 610;
            if (enemy.type === 'exposedKernel') return 520;
            if (enemy.type === 'rebootingMalwareHusk') return 500;
            if (enemy.type === 'turret') return 510;
            if (enemy.type === 'orbit') return 480;
            if (enemy.type === 'bug') return 430;
            return MATRIX_CRAWLER_ENEMY_DEFAULT_AGGRO_RANGE;
        }

        function getMatrixCrawlerEnemyNoticeDuration(enemy) {
            if (!enemy) return MATRIX_CRAWLER_ENEMY_NOTICE_DURATION;
            if (Number.isFinite(enemy.noticeDuration)) return enemy.noticeDuration;
            if (enemy.type === 'crashBug' || enemy.type === 'firewallMask') return 0.68;
            if (enemy.type === 'vectorInterceptor') return 0.74;
            if (enemy.type === 'portSentry' || enemy.type === 'firewallHost' || enemy.type === 'shieldedPortNode') return 0.62;
            if (enemy.type === 'bug') return 0.42;
            return MATRIX_CRAWLER_ENEMY_NOTICE_DURATION;
        }

        function initializeMatrixCrawlerEnemyAwareness(enemy, options = {}) {
            if (!enemy || isMatrixCrawlerBossEnemy(enemy)) return enemy;
            const awake = !!options.awake;
            enemy.aggroRange = Number.isFinite(options.aggroRange) ? options.aggroRange : getMatrixCrawlerEnemyAggroRange(enemy);
            enemy.noticeDuration = Number.isFinite(options.noticeDuration) ? options.noticeDuration : getMatrixCrawlerEnemyNoticeDuration(enemy);
            enemy.noticeTimer = awake ? enemy.noticeDuration : 0;
            enemy.aggroState = awake ? 'active' : 'idle';
            enemy.entryGraceTimer = awake
                ? 0
                : (Number.isFinite(options.entryGrace) ? options.entryGrace : MATRIX_CRAWLER_ENEMY_ROOM_ENTRY_GRACE);
            enemy.contactArmed = awake;
            if (!awake) {
                enemy.fireTimer = Math.max(enemy.fireTimer || 0, enemy.noticeDuration + enemy.entryGraceTimer + 0.55);
            }
            return enemy;
        }

        function wakeMatrixCrawlerEnemy(enemy, minimumFireDelay = 0.42) {
            if (!enemy || isMatrixCrawlerBossEnemy(enemy)) return;
            enemy.aggroState = 'active';
            enemy.noticeTimer = getMatrixCrawlerEnemyNoticeDuration(enemy);
            enemy.entryGraceTimer = 0;
            enemy.contactArmed = true;
            enemy.fireTimer = Math.max(minimumFireDelay, Math.min(enemy.fireTimer || minimumFireDelay, 0.86));
        }

        function wakeNearbyMatrixCrawlerEnemies(sourceEnemy, radius = 280) {
            if (!sourceEnemy || !matrixCrawlerState || !Array.isArray(matrixCrawlerState.enemies)) return;
            const radiusSq = radius * radius;
            for (const other of matrixCrawlerState.enemies) {
                if (!other || other === sourceEnemy || other.dead || isMatrixCrawlerBossEnemy(other)) continue;
                const dx = other.x - sourceEnemy.x;
                const dy = other.y - sourceEnemy.y;
                if (dx * dx + dy * dy <= radiusSq) wakeMatrixCrawlerEnemy(other, 0.54);
            }
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
                shieldedPortNode: { hp: 66, speed: 0, radius: 22, char: 'P', color: '#9fb0ad', contact: 8, score: 54, visualKind: 'armored', visualScale: 1.0 },
                rebootingMalwareHusk: { hp: 48, speed: 106, radius: 19, char: 'm', color: '#ff6f61', contact: 10, score: 42, visualKind: 'base', visualScale: 0.94 },
                vectorInterceptor: { hp: 118, speed: 144, radius: 24, char: 'A', color: '#ff6f61', contact: 11, score: 155, visualKind: 'elite', visualScale: 1.08 },
                firewallMask: { hp: 72, speed: 76, radius: 23, char: '#', color: '#aeb7c4', contact: 12, score: 0, noDrops: true, skipKillRecord: true, visualKind: 'armored', visualScale: 1.0 },
                exposedKernel: { hp: 58, speed: 58, radius: 18, char: 'K', color: '#41ff93', contact: 7, score: 70, visualKind: 'base', visualScale: 0.88 },
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
            initializeMatrixCrawlerEnemyAwareness(enemy, options);
            if (type !== 'nullPhantom' && type !== 'distortedGlitch' && !isMatrixCrawlerAdvancedNormalEnemy(type) && typeof configureEnemyShipVisual === 'function') {
                configureEnemyShipVisual(enemy, options.visualKind || base.visualKind || 'base', {
                    color: options.color || enemy.color,
                    visualScale: options.visualScale || base.visualScale || 1
                });
            }
            matrixCrawlerState.enemies.push(enemy);
            return enemy;
        }

        function getNextMatrixCrawlerEnemyPairId() {
            matrixCrawlerState.enemyPairSerial = (matrixCrawlerState.enemyPairSerial || 0) + 1;
            return `firewall-kernel-${matrixCrawlerState.enemyPairSerial}`;
        }

        function findMatrixCrawlerEnemyByPairId(pairId, role) {
            if (!pairId) return null;
            return matrixCrawlerState.enemies.find(enemy => enemy
                && !enemy.dead
                && enemy.pairId === pairId
                && (!role || enemy.pairRole === role)) || null;
        }

        function getMatrixFirewallMaskKernel(mask) {
            return mask && mask.type === 'firewallMask'
                ? findMatrixCrawlerEnemyByPairId(mask.pairId, 'kernel')
                : null;
        }

        function getMatrixFirewallKernelMask(kernel) {
            return kernel && kernel.type === 'exposedKernel'
                ? findMatrixCrawlerEnemyByPairId(kernel.pairId, 'mask')
                : null;
        }

        function isMatrixFirewallMaskProtected(enemy) {
            return !!(enemy && enemy.type === 'firewallMask' && getMatrixFirewallMaskKernel(enemy));
        }

        function canSpawnMatrixFirewallPairInRoom(room, floor = matrixCrawlerState.floor || 1) {
            if (!room || (room.type !== 'combat' && room.type !== 'challenge')) return false;
            if (room.firewallMaskPairSpawned) return false;
            if (Math.max(1, floor || 1) < 2 && (room.depth || 0) < 6) return false;
            const layout = getMatrixCrawlerRoomLayout(room);
            const exits = getMatrixCrawlerRoomExitIds(room);
            const roomFootprint = (layout.wScreens || 1) * (layout.hScreens || 1);
            if (layout.id === 'compact' || exits.length <= 1) return false;
            return roomFootprint >= 1.25 || exits.length >= 3 || room.type === 'challenge';
        }

        function canSpawnMatrixVectorInterceptorInRoom(room, floor = matrixCrawlerState.floor || 1, existingCount = 0) {
            if (!room || room.type !== 'challenge') return false;
            if (existingCount >= 1 || room.vectorInterceptorSpawned) return false;
            if (Math.max(1, floor || 1) < 2) return false;
            return (room.depth || 0) >= 3;
        }

        function canSpawnMatrixShieldedPortNodeInRoom(room, floor = matrixCrawlerState.floor || 1, existingCount = 0) {
            if (!room || (room.type !== 'combat' && room.type !== 'challenge')) return false;
            const maxNodes = room.type === 'challenge' ? 2 : 1;
            if (existingCount >= maxNodes) return false;
            if (Math.max(1, floor || 1) < 2 && (room.depth || 0) < 6) return false;
            const layout = getMatrixCrawlerRoomLayout(room);
            const exits = getMatrixCrawlerRoomExitIds(room);
            const roomFootprint = (layout.wScreens || 1) * (layout.hScreens || 1);
            if (layout.id === 'compact' || exits.length <= 1) return false;
            return roomFootprint >= 1.25 || exits.length >= 3 || room.type === 'challenge';
        }

        function canSpawnMatrixRebootingHuskInRoom(room, floor = matrixCrawlerState.floor || 1, existingCount = 0) {
            if (!room || (room.type !== 'combat' && room.type !== 'challenge')) return false;
            const maxHusks = room.type === 'challenge' ? 2 : 1;
            if (existingCount >= maxHusks) return false;
            if (Math.max(1, floor || 1) < 2 && (room.depth || 0) < 6) return false;
            if (Math.max(1, floor || 1) >= 2 && (room.depth || 0) < 3 && room.type !== 'challenge') return false;
            return true;
        }

        function spawnMatrixFirewallPair(room, rect, difficulty, index, total) {
            if (!room) return null;
            const pairId = getNextMatrixCrawlerEnemyPairId();
            const centerX = rect.x + rect.w / 2;
            const centerY = rect.y + rect.h / 2;
            const kernelSeed = index + 17;
            let kernelSpawn = getMatrixCrawlerSpawnPoint(room, rect, kernelSeed, total + 19, 'exposedKernel');
            if (Math.hypot(kernelSpawn.x - player.x, kernelSpawn.y - player.y) < 170) {
                kernelSpawn = getMatrixCrawlerEnemySafePoint(
                    room,
                    centerX + (kernelSpawn.x < centerX ? 1 : -1) * rect.w * 0.22,
                    centerY + (kernelSpawn.y < centerY ? 1 : -1) * rect.h * 0.18,
                    36
                );
            }
            const toPlayer = Math.atan2(player.y - kernelSpawn.y, player.x - kernelSpawn.x);
            const maskDistance = 92;
            let maskSpawn = getMatrixCrawlerEnemySafePoint(
                room,
                kernelSpawn.x + Math.cos(toPlayer) * maskDistance,
                kernelSpawn.y + Math.sin(toPlayer) * maskDistance,
                42
            );
            if (Math.hypot(maskSpawn.x - player.x, maskSpawn.y - player.y) < getMatrixCrawlerEnemyEntrySafeRadius(room, 'firewallMask')) {
                maskSpawn = getMatrixCrawlerEnemySafePoint(
                    room,
                    kernelSpawn.x - Math.cos(toPlayer) * maskDistance,
                    kernelSpawn.y - Math.sin(toPlayer) * maskDistance,
                    42
                );
            }

            const kernel = spawnMatrixEnemy('exposedKernel', kernelSpawn.x, kernelSpawn.y, {
                hp: Math.round(getMatrixCrawlerEnemyBaseHp('exposedKernel') * difficulty),
                pairId,
                pairRole: 'kernel'
            });
            const mask = spawnMatrixEnemy('firewallMask', maskSpawn.x, maskSpawn.y, {
                hp: Math.round(getMatrixCrawlerEnemyBaseHp('firewallMask') * Math.max(1, difficulty * 0.75)),
                pairId,
                pairRole: 'mask',
                linkedKernelId: pairId,
                aimAngle: toPlayer
            });
            kernel.linkedMaskId = pairId;
            room.firewallMaskPairSpawned = true;
            return { mask, kernel };
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
            if (room.type === 'boss') {
                const bossDef = getMatrixCrawlerBossDefForFloor(state.floor || 1);
                if (bossDef.type === 'distortedGlitch') spawnMatrixDistortedGlitchBoss(room, rect);
                else spawnMatrixNullPhantomBoss(room, rect);
                return;
            }

            if (isMatrixCrawlerArchetypeRoom(room)) {
                let archetype = getMatrixCrawlerRoomArchetype(room);
                if (!archetype) {
                    archetype = chooseMatrixCrawlerRoomArchetype(room, floor);
                    room.archetypeId = archetype ? archetype.id : null;
                    room.archetypeName = archetype ? archetype.name : null;
                    room.archetypeTags = archetype && Array.isArray(archetype.tags) ? archetype.tags.slice() : [];
                }
                if (archetype) {
                    spawnMatrixRoomArchetypeEnemies(room, rect, archetype, difficulty, floor);
                    return;
                }
            }

            if (room.type === 'challenge') {
                pattern = floor >= 2
                    ? ['crashBug', 'rebootingMalwareHusk', 'shieldedPortNode', 'portSentry', 'firewallPair', 'orbit', 'crashBug', 'turret']
                    : ['seeker', 'turret', 'orbit', 'miniboss'];
                count = floor >= 2 ? 6 : 5;
            } else if (floor >= 2 && room.depth >= 5) {
                pattern = ['seeker', 'rebootingMalwareHusk', 'shieldedPortNode', 'portSentry', 'firewallPair', 'bug', 'crashBug', 'orbit'];
            } else if (floor >= 2 && room.depth >= 3) {
                pattern = ['seeker', 'bug', 'rebootingMalwareHusk', 'shieldedPortNode', 'portSentry', 'crashBug'];
            } else if (floor >= 2 && room.depth >= 1) {
                pattern = ['seeker', 'bug', 'portSentry'];
            } else if (room.depth >= 6) {
                pattern = ['seeker', 'bug', 'rebootingMalwareHusk', 'shieldedPortNode', 'firewallPair', 'turret', 'orbit'];
            } else if (room.depth >= 4) {
                pattern = ['seeker', 'bug', 'turret', 'orbit'];
            }
            let firewallPairSpawned = false;
            let shieldedPortNodesSpawned = 0;
            let rebootingHusksSpawned = 0;
            const championCounts = { total: 0 };
            for (let i = 0; i < count; i++) {
                let type = pattern[i % pattern.length];
                if (type === 'firewallPair') {
                    if (!firewallPairSpawned && canSpawnMatrixFirewallPairInRoom(room, floor)) {
                        spawnMatrixFirewallPair(room, rect, difficulty, i, count);
                        firewallPairSpawned = true;
                        continue;
                    }
                    type = floor >= 2 ? 'firewallHost' : 'orbit';
                }
                if (type === 'shieldedPortNode') {
                    if (canSpawnMatrixShieldedPortNodeInRoom(room, floor, shieldedPortNodesSpawned)) {
                        shieldedPortNodesSpawned++;
                    } else {
                        type = room.type === 'challenge' ? 'crashBug' : 'bug';
                    }
                }
                if (type === 'rebootingMalwareHusk') {
                    if (canSpawnMatrixRebootingHuskInRoom(room, floor, rebootingHusksSpawned)) {
                        rebootingHusksSpawned++;
                    } else {
                        type = room.type === 'challenge' ? 'crashBug' : 'seeker';
                    }
                }
                const spawn = getMatrixCrawlerSpawnPoint(room, rect, i, count, type);
                const enemy = spawnMatrixEnemy(type, spawn.x, spawn.y, {
                    hp: Math.round(getMatrixCrawlerEnemyBaseHp(type) * difficulty)
                });
                maybeApplyMatrixCrawlerChampionVariant(enemy, room, getMatrixCrawlerRoomArchetype(room), floor, i, championCounts);
            }
            room.championCounts = championCounts;
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
            kind = kind === 'coin' ? 'dataFragment' : kind;
            const defaultRadius = kind === 'item'
                ? 20
                : kind === 'minorCache'
                    ? 24
                    : (kind === 'bomb' ? 16 : 13);
            const defaultChar = kind === 'dataFragment'
                ? '<>'
                : kind === 'heart'
                    ? '+'
                    : kind === 'exit'
                        ? '>>'
                        : kind === 'bomb'
                            ? 'B'
                            : kind === 'minorCache'
                                ? '[C]'
                                : '?';
            const defaultColor = kind === 'dataFragment'
                ? MATRIX_CRAWLER_COLORS.data
                : kind === 'minorCache'
                    ? MATRIX_CRAWLER_COLORS.cache
                    : kind === 'bomb'
                        ? MATRIX_CRAWLER_BOMB_PICKUP_COLOR
                        : MATRIX_CRAWLER_COLORS.white;
            matrixCrawlerState.pickups.push({
                x,
                y,
                kind,
                radius: options.radius || defaultRadius,
                reward: options.reward || null,
                cost: 0,
                amount: options.amount || 1,
                char: options.char || defaultChar,
                color: options.color || defaultColor,
                pulse: Math.random() * Math.PI * 2
            });
        }

        function spawnMatrixDataFragments(x, y, count = 1, spread = 22) {
            for (let i = 0; i < count; i++) {
                const a = Math.random() * Math.PI * 2;
                const r = Math.random() * spread;
                spawnMatrixPickup(x + Math.cos(a) * r, y + Math.sin(a) * r, 'dataFragment', {
                    amount: 1,
                    char: i % 3 === 0 ? '<>' : (i % 3 === 1 ? '01' : '{}'),
                    color: i % 2 === 0 ? MATRIX_CRAWLER_COLORS.data : MATRIX_CRAWLER_COLORS.glow
                });
            }
        }

        function getMatrixCrawlerMinorCacheReward() {
            const choices = [];
            const add = (kind, label, color, weight = 1) => choices.push({ kind, label, color, weight });
            if (player.bombTimer > 0) add('bomb', 'BOMB READY', MATRIX_CRAWLER_BOMB_PICKUP_COLOR, 4);
            const focusMax = typeof getFocusMeterMax === 'function' ? getFocusMeterMax() : (typeof FOCUS_METER_MAX === 'number' ? FOCUS_METER_MAX : 100);
            if (typeof focusMeter === 'number' && focusMeter < focusMax * 0.92) add('focus', 'FOCUS RESTORED', MATRIX_CRAWLER_COLORS.data, 4);
            if (player.hp < player.maxHp) add('repair', 'HULL PATCH', '#ff8fb5', 3);
            add('shield', 'PHASE BUFFER', MATRIX_CRAWLER_COLORS.white, 1.4);
            const total = choices.reduce((sum, choice) => sum + choice.weight, 0);
            let roll = Math.random() * Math.max(1, total);
            for (const choice of choices) {
                roll -= choice.weight;
                if (roll <= 0) return choice;
            }
            return choices[0];
        }

        function spawnMatrixMinorCache(x, y, options = {}) {
            const reward = options.reward || getMatrixCrawlerMinorCacheReward();
            spawnMatrixPickup(x, y, 'minorCache', {
                reward,
                radius: 28,
                char: '[C]',
                color: reward.color || MATRIX_CRAWLER_COLORS.cache
            });
        }

        function applyMatrixCrawlerMinorCacheReward(reward = {}) {
            const state = matrixCrawlerState;
            if (reward.kind === 'bomb') {
                setMatrixCrawlerBombLoaded(true);
            } else if (reward.kind === 'focus') {
                const focusMax = typeof getFocusMeterMax === 'function' ? getFocusMeterMax() : (typeof FOCUS_METER_MAX === 'number' ? FOCUS_METER_MAX : 100);
                if (typeof focusMeter === 'number') {
                    focusMeter = Math.min(focusMax, focusMeter + focusMax * 0.32);
                    if (typeof focusLockoutTimer === 'number' && focusMeter > 0) focusLockoutTimer = 0;
                }
            } else if (reward.kind === 'repair') {
                healMatrixCrawlerPlayer(1);
            } else if (reward.kind === 'shield') {
                state.invuln = Math.max(state.invuln || 0, 1.25);
                player.invincibilityTimer = Math.max(player.invincibilityTimer || 0, 1.25);
            }
            state.message = reward.label || 'MINOR CACHE';
            state.messageTimer = 1.0;
        }

        function getMatrixCacheDaemonTargetPoint(now = currentFrameNow || 0) {
            const state = matrixCrawlerState;
            let bx = -34;
            let by = 24;
            const speed = Math.hypot(player.vx || 0, player.vy || 0);
            if (speed > 12) {
                bx = -(player.vx / speed) * 42;
                by = -(player.vy / speed) * 42;
            } else {
                const facing = getMatrixCrawlerPlayerFacingAngle();
                bx = Math.cos(facing + Math.PI) * 34;
                by = Math.sin(facing + Math.PI) * 34;
            }
            const orbit = now * 0.0018 + (state.cacheDaemonPhase || 0);
            return {
                x: player.x + bx + Math.cos(orbit) * 9,
                y: player.y + by + Math.sin(orbit * 1.3) * 7
            };
        }

        function syncMatrixCacheDaemonToPlayer(immediate = false) {
            const state = matrixCrawlerState;
            const target = getMatrixCacheDaemonTargetPoint();
            if (immediate || !state.cacheDaemonInitialized) {
                state.cacheDaemonX = target.x;
                state.cacheDaemonY = target.y;
                state.cacheDaemonInitialized = true;
            }
        }

        function updateMatrixCacheDaemon(dt) {
            const state = matrixCrawlerState;
            syncMatrixCacheDaemonToPlayer(false);
            const target = getMatrixCacheDaemonTargetPoint();
            const blend = 1 - Math.exp(-MATRIX_CACHE_DAEMON_FOLLOW_RESPONSE * dt);
            state.cacheDaemonX += (target.x - state.cacheDaemonX) * blend;
            state.cacheDaemonY += (target.y - state.cacheDaemonY) * blend;
            const room = getMatrixCrawlerRoom();
            const safe = clampMatrixCrawlerPoint(room, state.cacheDaemonX, state.cacheDaemonY, 14);
            state.cacheDaemonX = safe.x;
            state.cacheDaemonY = safe.y;
            state.cacheDaemonAbsorbTimer = Math.max(0, (state.cacheDaemonAbsorbTimer || 0) - dt);
            state.cacheDaemonFullTimer = Math.max(0, (state.cacheDaemonFullTimer || 0) - dt);
        }

        function chargeMatrixCacheDaemon(amount = 1, sourceX = player.x, sourceY = player.y) {
            const state = matrixCrawlerState;
            state.dataFragmentsAbsorbed += amount;
            state.cacheDaemonAbsorbTimer = 0.42;
            const rect = getMatrixCrawlerRoomRect();
            for (let i = 0; i < 5; i++) {
                emitMatrixCrawlerParticle(sourceX, sourceY, i % 2 ? MATRIX_CRAWLER_COLORS.data : MATRIX_CRAWLER_COLORS.glow, rect);
            }
            if (state.cacheDaemonReady) return;
            const max = Math.max(1, state.cacheDaemonChargeMax || MATRIX_CACHE_DAEMON_CHARGE_MAX);
            state.cacheDaemonCharge = Math.min(max, (state.cacheDaemonCharge || 0) + amount);
            if (state.cacheDaemonCharge >= max) {
                state.cacheDaemonReady = true;
                state.pendingMinorCache = true;
                state.cacheDaemonFullTimer = 1.0;
                state.message = 'CACHE DAEMON CHARGED';
                state.messageTimer = 1.1;
            }
        }

        function resetMatrixCacheDaemonCharge() {
            const state = matrixCrawlerState;
            state.cacheDaemonCharge = 0;
            state.cacheDaemonReady = false;
            state.pendingMinorCache = false;
            state.cacheDaemonFullTimer = 0;
            state.cacheDaemonAbsorbTimer = Math.max(state.cacheDaemonAbsorbTimer || 0, 0.35);
        }

        function updateMatrixDataFragmentPickup(p, dt) {
            const state = matrixCrawlerState;
            syncMatrixCacheDaemonToPlayer(false);
            const daemonX = state.cacheDaemonX || player.x;
            const daemonY = state.cacheDaemonY || player.y;
            const playerDist = Math.hypot(player.x - p.x, player.y - p.y);
            const daemonDist = Math.hypot(daemonX - p.x, daemonY - p.y);
            const magnetBonus = player.modifiers && Number.isFinite(player.modifiers.magnet) ? player.modifiers.magnet * 38 : 0;
            const magnetRadius = MATRIX_DATA_FRAGMENT_MAGNET_RADIUS + magnetBonus;
            if (Math.min(playerDist, daemonDist) < magnetRadius) {
                const dx = daemonX - p.x;
                const dy = daemonY - p.y;
                const dist = Math.max(1, Math.hypot(dx, dy));
                const speed = 165 + (1 - Math.min(1, dist / magnetRadius)) * 340;
                p.x += (dx / dist) * speed * dt;
                p.y += (dy / dist) * speed * dt;
            }
            const collectDaemonDist = Math.hypot(daemonX - p.x, daemonY - p.y);
            const collectPlayerDist = Math.hypot(player.x - p.x, player.y - p.y);
            if (collectDaemonDist <= MATRIX_DATA_FRAGMENT_COLLECT_RADIUS || collectPlayerDist <= p.radius + 16) {
                chargeMatrixCacheDaemon(p.amount || 1, p.x, p.y);
                return true;
            }
            return false;
        }

        function maybeSpawnPendingMatrixMinorCache(room) {
            const state = matrixCrawlerState;
            if (!state.pendingMinorCache || !room || (room.type !== 'combat' && room.type !== 'challenge')) return false;
            const rect = getMatrixCrawlerRoomRect(room);
            const center = getMatrixCrawlerSafePoint(room, rect.x + rect.w / 2, rect.y + rect.h / 2, 32);
            spawnMatrixMinorCache(center.x, center.y);
            resetMatrixCacheDaemonCharge();
            state.message = 'MINOR CACHE COMPILED';
            state.messageTimer = 1.1;
            return true;
        }

        function maybeSpawnMatrixCrawlerArchetypeClearReward(room) {
            if (!room || room.archetypeRewardClaimed) return false;
            const archetype = getMatrixCrawlerRoomArchetype(room);
            if (!archetype || archetype.clearReward !== 'dataFragmentCluster') return false;
            const rect = getMatrixCrawlerRoomRect(room);
            const center = getMatrixCrawlerSafePoint(room, rect.x + rect.w / 2, rect.y + rect.h / 2, 32);
            const count = 2 + (Math.max(1, matrixCrawlerState.floor || 1) >= 3 ? 1 : 0);
            spawnMatrixDataFragments(center.x, center.y, count, 24);
            room.archetypeRewardClaimed = true;
            return true;
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

        function expandMatrixCrawlerRect(rect, padX = 0, padY = padX) {
            return {
                x: rect.x - padX,
                y: rect.y - padY,
                w: rect.w + padX * 2,
                h: rect.h + padY * 2,
                right: rect.right + padX,
                bottom: rect.bottom + padY
            };
        }

        function doMatrixCrawlerRectsOverlap(a, b, pad = 0) {
            return a.x - pad < b.right
                && a.right + pad > b.x
                && a.y - pad < b.bottom
                && a.bottom + pad > b.y;
        }

        function isMatrixCrawlerPointNearTerrain(room, x, y, margin = 0) {
            return getMatrixCrawlerRoomTerrain(room).some(feature => isMatrixCrawlerPointInsideTerrain(feature, x, y, margin));
        }

        function makeMatrixCrawlerTerrainFeature(type, x, y, w, h, seed = 0) {
            const def = getMatrixCrawlerTerrainDefinition(type);
            return {
                type,
                x: Math.round(x),
                y: Math.round(y),
                w: Math.round(w),
                h: Math.round(h),
                blocksPlayer: !!def.blocksPlayer,
                blocksEnemies: !!def.blocksEnemies,
                blocksPlayerShots: !!def.blocksPlayerShots,
                blocksEnemyShots: !!def.blocksEnemyShots,
                slowMultiplier: Number.isFinite(def.slowMultiplier) ? def.slowMultiplier : 1,
                seed,
                phase: matrixRand(seed + 19) * Math.PI * 2,
                flashTimer: 0
            };
        }

        function getMatrixCrawlerTerrainForbiddenRects(room, rect) {
            const forbidden = [{
                x: rect.x + rect.w / 2 - 58,
                y: rect.y + rect.h / 2 - 44,
                w: 116,
                h: 88,
                right: rect.x + rect.w / 2 + 58,
                bottom: rect.y + rect.h / 2 + 44
            }];
            for (const dir of MATRIX_CRAWLER_DIRS) {
                if (!room || !room.neighbors || !room.neighbors[dir.id]) continue;
                forbidden.push(expandMatrixCrawlerRect(getMatrixCrawlerDoorRect(room, dir.id), 78, 64));
            }
            return forbidden;
        }

        function isMatrixCrawlerTerrainCandidateValid(room, candidate, placed) {
            if (!room || !candidate) return false;
            const rect = getMatrixCrawlerRoomRect(room);
            const featureRect = getMatrixCrawlerTerrainRect(candidate);
            const borderPad = 34;
            if (featureRect.x < rect.x + borderPad || featureRect.right > rect.right - borderPad) return false;
            if (featureRect.y < rect.y + borderPad || featureRect.bottom > rect.bottom - borderPad) return false;

            const samplePad = candidate.type === 'latencyPool' ? 2 : 10;
            const samples = [
                { x: featureRect.x, y: featureRect.y },
                { x: featureRect.right, y: featureRect.y },
                { x: featureRect.x, y: featureRect.bottom },
                { x: featureRect.right, y: featureRect.bottom },
                { x: featureRect.x + featureRect.w / 2, y: featureRect.y + featureRect.h / 2 }
            ];
            for (const point of samples) {
                if (!isPointInMatrixCrawlerRoom(room, point.x, point.y, samplePad)) return false;
            }

            for (const forbidden of getMatrixCrawlerTerrainForbiddenRects(room, rect)) {
                if (doMatrixCrawlerRectsOverlap(featureRect, forbidden, 0)) return false;
            }
            for (const existing of placed) {
                if (doMatrixCrawlerRectsOverlap(featureRect, getMatrixCrawlerTerrainRect(existing), 14)) return false;
            }
            return true;
        }

        function addMatrixCrawlerTerrainFeature(room, placed, type, cx, cy, w, h, seed, offsets = [{ x: 0, y: 0 }]) {
            for (const offset of offsets) {
                const feature = makeMatrixCrawlerTerrainFeature(
                    type,
                    cx + (offset.x || 0) - w / 2,
                    cy + (offset.y || 0) - h / 2,
                    w,
                    h,
                    seed + Math.round((offset.x || 0) * 3 + (offset.y || 0) * 5)
                );
                if (!isMatrixCrawlerTerrainCandidateValid(room, feature, placed)) continue;
                placed.push(feature);
                return feature;
            }
            return null;
        }

        function markMatrixCrawlerNullObstacle(feature) {
            if (!feature) return null;
            feature.blocksPlayerShots = true;
            feature.blocksEnemyShots = true;
            feature.nullObstacle = true;
            return feature;
        }

        function addMatrixCrawlerNullObstacle(room, terrain, cx, cy, w, h, seed, offsets = [{ x: 0, y: 0 }]) {
            return markMatrixCrawlerNullObstacle(
                addMatrixCrawlerTerrainFeature(room, terrain, 'nullGap', cx, cy, w, h, seed, offsets)
            );
        }

        function getMatrixCrawlerTerrainPatternVariant(pattern, seed) {
            const roll = matrixRand(seed + 101);
            const pick = (patterns, salt = 0) => patterns[Math.floor(matrixRand(seed + salt) * patterns.length) % patterns.length];
            if (pattern === 'firewallCluster') {
                if (roll < 0.34) return pattern;
                return pick(['nullCenterIsland', 'nullSquareCluster', 'nullOffsetPair', 'nullCornerBlock'], 109);
            }
            if (pattern === 'coverPair') {
                if (roll < 0.28) return pattern;
                return pick(['nullTwoWide', 'nullTwoLong', 'nullSquareCluster', 'nullOffsetPair'], 113);
            }
            if (pattern === 'mixed') {
                if (roll < 0.36) return pattern;
                return pick(['nullCornerBlock', 'nullOffsetPair', 'nullSplitLaneH', 'nullThinDividerH'], 127);
            }
            if (pattern === 'nullGapH') {
                if (roll < 0.44) return pattern;
                return roll < 0.72 ? 'nullThinDividerH' : 'nullSplitLaneV';
            }
            if (pattern === 'nullGapV') {
                if (roll < 0.44) return pattern;
                return roll < 0.72 ? 'nullThinDividerV' : 'nullSplitLaneH';
            }
            return pattern;
        }

        function addMatrixCrawlerTerrainPattern(room, terrain, pattern, seed) {
            const resolvedPattern = getMatrixCrawlerTerrainPatternVariant(pattern, seed);
            if (resolvedPattern !== pattern) {
                addMatrixCrawlerTerrainPattern(room, terrain, resolvedPattern, seed + 997);
                return;
            }
            const rect = getMatrixCrawlerRoomRect(room);
            const cx = rect.x + rect.w / 2;
            const cy = rect.y + rect.h / 2;
            const side = matrixRand(seed + 2) < 0.5 ? -1 : 1;
            const flip = matrixRand(seed + 5) < 0.5 ? -1 : 1;
            const block = Math.round(32 + matrixRand(seed + 7) * 8);
            const nullBlock = Math.round(38 + matrixRand(seed + 131) * 8);
            const nearCenterX = Math.min(148, Math.max(104, rect.w * (0.13 + matrixRand(seed + 137) * 0.04)));
            const nearCenterY = Math.min(112, Math.max(72, rect.h * (0.11 + matrixRand(seed + 139) * 0.035)));
            const fallbackOffsets = [
                { x: 0, y: 0 },
                { x: -side * 42, y: 0 },
                { x: side * 42, y: 0 },
                { x: 0, y: -flip * 36 },
                { x: 0, y: flip * 36 }
            ];
            const diagonalOffsets = [
                { x: 0, y: 0 },
                { x: -side * 38, y: flip * 28 },
                { x: side * 38, y: -flip * 28 }
            ];
            if (pattern === 'nullTwoWide') {
                addMatrixCrawlerNullObstacle(
                    room,
                    terrain,
                    cx + side * nearCenterX,
                    cy + flip * Math.min(96, nearCenterY),
                    nullBlock * 2 + 6,
                    nullBlock,
                    seed + 151,
                    fallbackOffsets
                );
                return;
            }
            if (pattern === 'nullTwoLong') {
                addMatrixCrawlerNullObstacle(
                    room,
                    terrain,
                    cx + side * Math.min(132, nearCenterX),
                    cy + flip * nearCenterY,
                    nullBlock,
                    nullBlock * 2 + 6,
                    seed + 157,
                    fallbackOffsets
                );
                return;
            }
            if (pattern === 'nullSquareCluster') {
                addMatrixCrawlerNullObstacle(
                    room,
                    terrain,
                    cx + side * Math.min(154, nearCenterX + 16),
                    cy + flip * Math.min(124, nearCenterY + 10),
                    nullBlock * 2 + 6,
                    nullBlock * 2 + 6,
                    seed + 163,
                    diagonalOffsets
                );
                return;
            }
            if (pattern === 'nullCenterIsland') {
                addMatrixCrawlerNullObstacle(
                    room,
                    terrain,
                    cx + side * Math.min(132, nearCenterX),
                    cy + flip * Math.min(92, nearCenterY),
                    nullBlock * 1.65,
                    nullBlock * 1.35,
                    seed + 167,
                    [
                        { x: 0, y: 0 },
                        { x: -side * 34, y: flip * 26 },
                        { x: side * 34, y: -flip * 26 },
                        { x: 0, y: flip * 42 }
                    ]
                );
                return;
            }
            if (pattern === 'nullCornerBlock') {
                const cornerX = rect.x + (side < 0 ? rect.w * 0.24 : rect.w * 0.76);
                const cornerY = rect.y + (flip < 0 ? rect.h * 0.25 : rect.h * 0.75);
                addMatrixCrawlerNullObstacle(
                    room,
                    terrain,
                    cornerX,
                    cornerY,
                    matrixRand(seed + 171) < 0.5 ? nullBlock * 2 + 4 : nullBlock * 1.65,
                    matrixRand(seed + 173) < 0.5 ? nullBlock : nullBlock * 1.65,
                    seed + 179,
                    fallbackOffsets
                );
                return;
            }
            if (pattern === 'nullOffsetPair') {
                const offsetX = Math.min(170, Math.max(118, rect.w * 0.17));
                const offsetY = Math.min(126, Math.max(78, rect.h * 0.13));
                addMatrixCrawlerNullObstacle(room, terrain, cx - side * offsetX, cy - flip * offsetY, nullBlock, nullBlock, seed + 181, fallbackOffsets);
                addMatrixCrawlerNullObstacle(room, terrain, cx + side * offsetX, cy + flip * offsetY, nullBlock, nullBlock, seed + 191, fallbackOffsets);
                return;
            }
            if (pattern === 'nullSplitLaneH') {
                const laneY = cy + flip * Math.min(118, nearCenterY + 20);
                const laneX = Math.min(190, Math.max(126, rect.w * 0.20));
                const laneW = Math.min(116, Math.max(82, rect.w * 0.10));
                const laneH = Math.max(28, nullBlock * 0.72);
                addMatrixCrawlerNullObstacle(room, terrain, cx - laneX, laneY, laneW, laneH, seed + 197, fallbackOffsets);
                addMatrixCrawlerNullObstacle(room, terrain, cx + laneX, laneY, laneW, laneH, seed + 199, fallbackOffsets);
                return;
            }
            if (pattern === 'nullSplitLaneV') {
                const laneX = cx + side * Math.min(140, nearCenterX);
                const laneY = Math.min(168, Math.max(104, rect.h * 0.18));
                const laneW = Math.max(28, nullBlock * 0.72);
                const laneH = Math.min(104, Math.max(76, rect.h * 0.10));
                addMatrixCrawlerNullObstacle(room, terrain, laneX, cy - laneY, laneW, laneH, seed + 211, fallbackOffsets);
                addMatrixCrawlerNullObstacle(room, terrain, laneX, cy + laneY, laneW, laneH, seed + 223, fallbackOffsets);
                return;
            }
            if (pattern === 'nullThinDividerH') {
                addMatrixCrawlerNullObstacle(
                    room,
                    terrain,
                    cx,
                    cy + flip * Math.min(126, nearCenterY + 28),
                    Math.min(168, Math.max(124, rect.w * 0.16)),
                    Math.max(26, nullBlock * 0.66),
                    seed + 227,
                    fallbackOffsets
                );
                return;
            }
            if (pattern === 'nullThinDividerV') {
                addMatrixCrawlerNullObstacle(
                    room,
                    terrain,
                    cx + side * Math.min(144, nearCenterX + 12),
                    cy,
                    Math.max(26, nullBlock * 0.66),
                    Math.min(156, Math.max(112, rect.h * 0.15)),
                    seed + 229,
                    fallbackOffsets
                );
                return;
            }
            if (pattern === 'firewallCluster') {
                const anchorX = cx + side * Math.min(150, rect.w * (0.13 + matrixRand(seed + 11) * 0.05));
                const anchorY = cy + (matrixRand(seed + 13) - 0.5) * Math.min(150, rect.h * 0.22);
                const offsets = [
                    { x: 0, y: 0 },
                    { x: block + 8, y: 0 },
                    { x: 0, y: block + 8 },
                    { x: -(block + 8), y: 0 },
                    { x: 0, y: -(block + 8) }
                ];
                const count = 3 + Math.floor(matrixRand(seed + 17) * 3);
                for (let i = 0; i < count; i++) {
                    addMatrixCrawlerTerrainFeature(room, terrain, 'firewallBlock', anchorX + offsets[i].x, anchorY + offsets[i].y, block, block, seed + i * 23);
                }
                return;
            }
            if (pattern === 'coverPair') {
                const y = cy + flip * Math.min(110, rect.h * 0.15);
                const xOffset = Math.min(210, rect.w * 0.23);
                addMatrixCrawlerTerrainFeature(room, terrain, 'firewallBlock', cx - xOffset, y, block + 4, block + 4, seed + 31);
                addMatrixCrawlerTerrainFeature(room, terrain, 'firewallBlock', cx + xOffset, y, block + 4, block + 4, seed + 47);
                return;
            }
            if (pattern === 'nullGapH') {
                const gapW = Math.min(240, Math.max(138, rect.w * (0.20 + matrixRand(seed + 29) * 0.08)));
                const gapH = 32 + matrixRand(seed + 31) * 8;
                addMatrixCrawlerTerrainFeature(room, terrain, 'nullGap', cx, cy + flip * Math.min(124, rect.h * 0.18), gapW, gapH, seed + 59);
                return;
            }
            if (pattern === 'nullGapV') {
                const gapW = 32 + matrixRand(seed + 37) * 8;
                const gapH = Math.min(210, Math.max(128, rect.h * (0.18 + matrixRand(seed + 41) * 0.08)));
                addMatrixCrawlerTerrainFeature(room, terrain, 'nullGap', cx + side * Math.min(150, rect.w * 0.15), cy, gapW, gapH, seed + 67);
                return;
            }
            if (pattern === 'latencyPool') {
                const poolW = Math.min(178, Math.max(112, rect.w * (0.12 + matrixRand(seed + 43) * 0.06)));
                const poolH = Math.min(94, Math.max(56, rect.h * (0.08 + matrixRand(seed + 47) * 0.05)));
                addMatrixCrawlerTerrainFeature(room, terrain, 'latencyPool', cx + side * Math.min(210, rect.w * 0.24), cy + flip * Math.min(126, rect.h * 0.17), poolW, poolH, seed + 71);
                return;
            }
            if (pattern === 'mixed') {
                const gapW = Math.min(184, Math.max(126, rect.w * 0.18));
                const gapX = cx + side * Math.min(126, rect.w * 0.12);
                const gapY = cy + flip * Math.min(118, rect.h * 0.16);
                const gap = addMatrixCrawlerTerrainFeature(room, terrain, 'nullGap', gapX, gapY, gapW, 32, seed + 83);
                if (!gap) return;
                addMatrixCrawlerTerrainFeature(room, terrain, 'firewallBlock', gapX - gapW / 2 - 30, gapY, block, block, seed + 89);
                addMatrixCrawlerTerrainFeature(room, terrain, 'firewallBlock', gapX + gapW / 2 + 30, gapY, block, block, seed + 97);
            }
        }

        function spawnMatrixRoomTerrain(room) {
            if (!room || room.terrainSpawned) return;
            room.terrainSpawned = true;
            room.terrain = [];
            if (room.type !== 'combat' && room.type !== 'challenge') return;

            const floor = Math.max(1, matrixCrawlerState.floor || 1);
            let archetype = getMatrixCrawlerRoomArchetype(room);
            if (!archetype) {
                archetype = chooseMatrixCrawlerRoomArchetype(room, floor);
                room.archetypeId = archetype ? archetype.id : null;
                room.archetypeName = archetype ? archetype.name : null;
                room.archetypeTags = archetype && Array.isArray(archetype.tags) ? archetype.tags.slice() : [];
            }
            const patterns = archetype && Array.isArray(archetype.terrainPatterns) ? archetype.terrainPatterns : [];
            const seed = getMatrixCrawlerRoomArchetypeSeed(room, floor, 317);
            for (let i = 0; i < patterns.length; i++) {
                addMatrixCrawlerTerrainPattern(room, room.terrain, patterns[i], seed + i * 211);
            }
            if (floor === 2) {
                const layout = getMatrixCrawlerRoomLayout(room);
                const pressureSeed = seed + 1601;
                const pressurePattern = layout.id === 'compact'
                    ? (matrixRand(pressureSeed) < 0.5 ? 'latencyPool' : 'nullOffsetPair')
                    : (matrixRand(pressureSeed) < 0.5 ? 'nullThinDividerH' : 'nullThinDividerV');
                if (room.terrain.length < 4) addMatrixCrawlerTerrainPattern(room, room.terrain, pressurePattern, pressureSeed);
            }
            if (room.terrain.length) markMatrixCrawlerRoomNavDirty(room);
        }

        function getMatrixCrawlerBreakablePoint(room, rect, index, total) {
            const centerX = rect.x + rect.w / 2;
            const centerY = rect.y + rect.h / 2;
            for (let attempt = 0; attempt < 40; attempt++) {
                const seed = (room.index || 0) * 157 + index * 73 + total * 19 + attempt * 41;
                const x = rect.x + rect.w * (0.12 + matrixRand(seed) * 0.76);
                const y = rect.y + rect.h * (0.12 + matrixRand(seed + 23) * 0.76);
                if (!isMatrixCrawlerPlayerPointClear(room, x, y, 38)) continue;
                if (isMatrixCrawlerPointNearTerrain(room, x, y, 34)) continue;
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
            const theme = getMatrixCrawlerFloorTheme();
            const breakableColors = isMatrixCrawlerOverclockFloor()
                ? [theme.glow, theme.accent, theme.data]
                : ['#8ff7ff', '#41ff93', '#baff75'];
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
                    color: breakableColors[i % breakableColors.length],
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
            const theme = getMatrixCrawlerFloorTheme();
            for (let i = 0; i < 9; i++) {
                emitMatrixCrawlerParticle(object.x, object.y, i % 2 ? object.color : theme.glow, rect);
            }
            if (Math.random() < 0.22) {
                spawnMatrixDataFragments(object.x + (Math.random() - 0.5) * 14, object.y - 10, Math.random() < 0.14 ? 2 : 1, 12);
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

        function getMatrixCrawlerProjectileTerrainHit(projectile, shotFlag = 'blocksPlayerShots') {
            if (!projectile) return null;
            const room = getMatrixCrawlerRoom();
            const radius = Math.max(2, projectile.isMatrixCrawlerBomb ? 16 : (projectile.radius || projectile.visualRadius || 5));
            const startX = Number.isFinite(projectile.prevX) ? projectile.prevX : projectile.x;
            const startY = Number.isFinite(projectile.prevY) ? projectile.prevY : projectile.y;
            const dx = projectile.x - startX;
            const dy = projectile.y - startY;
            const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 18));
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const hit = getMatrixCrawlerTerrainHitAtPoint(room, startX + dx * t, startY + dy * t, radius, shotFlag);
                if (hit) return hit;
            }
            return null;
        }

        function flashMatrixCrawlerTerrainHit(feature) {
            if (!feature) return;
            feature.flashTimer = Math.max(feature.flashTimer || 0, 0.16);
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
                const finalFloor = Math.max(1, Math.floor(matrixCrawlerState.floor || 1)) >= getMatrixCrawlerConsoleLevelLimit();
                spawnMatrixPickup(exitPoint.x, exitPoint.y, 'exit', {
                    char: finalFloor ? 'EXIT' : 'NEXT',
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
                spawnMatrixMinorCache(center.x, center.y, {
                    reward: getMatrixCrawlerMinorCacheReward()
                });
                return;
            }
            if (room.type === 'secret') {
                spawnMatrixMinorCache(center.x, center.y, {
                    reward: getMatrixCrawlerMinorCacheReward()
                });
                for (let i = 0; i < 3; i++) {
                    const a = (i / 6) * Math.PI * 2;
                    const p = getMatrixCrawlerSafePoint(room, center.x + Math.cos(a) * 54, center.y + Math.sin(a) * 40, 22);
                    spawnMatrixPickup(p.x, p.y, 'dataFragment', { amount: 1 });
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
            spawnMatrixRoomTerrain(room);
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
            state.invuln = Math.max(state.invuln || 0, MATRIX_CRAWLER_ENEMY_ENTRY_INVULN);
            player.flashTimer = Math.max(player.flashTimer || 0, 0.12);
            syncMatrixCacheDaemonToPlayer(true);
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
            state.message = '';
            state.messageTimer = 0;
            return true;
        }

        function getMatrixRoomTitle(room) {
            if (!room) return 'SIM ROOM';
            if (room.type === 'start') return 'WAKE NODE';
            if (room.type === 'treasure') return 'TREASURE CACHE';
            if (room.type === 'shop') return 'UTILITY CACHE';
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

        function getMatrixCrawlerPlayerFacingAngle() {
            if (player && Number.isFinite(player.matrixCrawlerFacingAngle)) return player.matrixCrawlerFacingAngle;
            return matrixCrawlerState && Number.isFinite(matrixCrawlerState.facingAngle)
                ? matrixCrawlerState.facingAngle
                : getMatrixCrawlerPlayerAimAngle();
        }

        function pushMatrixCrawlerPlayerTurnAfterimage(angle, nextAngle = angle, options = {}) {
            const state = matrixCrawlerState;
            if (!state.playerTurnAfterimages) state.playerTurnAfterimages = [];
            const turnDir = Math.sign(normalizeAngle(nextAngle - angle)) || 1;
            const offsetAngle = Number.isFinite(options.offsetAngle) ? options.offsetAngle : angle + Math.PI / 2 * turnDir;
            const offsetDistance = Number.isFinite(options.offsetDistance) ? options.offsetDistance : 6;
            const life = Number.isFinite(options.life) ? options.life : MATRIX_CRAWLER_TURN_AFTERIMAGE_LIFE;
            state.playerTurnAfterimages.push({
                x: Number.isFinite(options.x) ? options.x : player.x,
                y: Number.isFinite(options.y) ? options.y : player.y,
                angle,
                offsetX: Number.isFinite(options.offsetX) ? options.offsetX : Math.cos(offsetAngle) * offsetDistance,
                offsetY: Number.isFinite(options.offsetY) ? options.offsetY : Math.sin(offsetAngle) * offsetDistance,
                life,
                maxLife: Number.isFinite(options.maxLife) ? options.maxLife : life,
                color: options.color || '#8ff7ff',
                alphaScale: Number.isFinite(options.alphaScale) ? options.alphaScale : 1,
                baseAlpha: Number.isFinite(options.baseAlpha) ? options.baseAlpha : 0.12,
                detailAlpha: Number.isFinite(options.detailAlpha) ? options.detailAlpha : 0.045,
                scaleBoost: Number.isFinite(options.scaleBoost) ? options.scaleBoost : 0.04
            });
            const maxAfterimages = Math.max(MATRIX_CRAWLER_TURN_AFTERIMAGE_MAX, MATRIX_CRAWLER_PHANTOM_AFTERIMAGE_MAX);
            if (state.playerTurnAfterimages.length > maxAfterimages) {
                state.playerTurnAfterimages.splice(0, state.playerTurnAfterimages.length - maxAfterimages);
            }
        }

        function updateMatrixCrawlerAim(dt, aimInput) {
            const state = matrixCrawlerState;
            const currentAim = getMatrixCrawlerPlayerAimAngle();
            if (!aimInput) {
                state.aimAngle = currentAim;
                state.targetAimAngle = currentAim;
                player.matrixCrawlerAimAngle = currentAim;
                player.survivorAimAngle = currentAim;
                return null;
            }

            const targetAim = Math.atan2(aimInput.y, aimInput.x);
            const turnBlend = 1 - Math.exp(-MATRIX_CRAWLER_PLAYER_TURN_RESPONSE * dt);
            const nextAim = normalizeAngle(lerpAngle(currentAim, targetAim, turnBlend));
            state.targetAimAngle = targetAim;
            state.aimAngle = nextAim;
            player.matrixCrawlerAimAngle = nextAim;
            player.survivorAimAngle = nextAim;
            return { x: Math.cos(nextAim), y: Math.sin(nextAim), angle: nextAim };
        }

        function getMatrixCrawlerMovementFacingAngle(mx, my) {
            if (Math.hypot(mx || 0, my || 0) > 0.01) return Math.atan2(my, mx);
            const speed = Math.hypot(player.vx || 0, player.vy || 0);
            return speed > 18 ? Math.atan2(player.vy || 0, player.vx || 0) : null;
        }

        function updateMatrixCrawlerFacing(dt, targetFacing) {
            const state = matrixCrawlerState;
            const currentFacing = getMatrixCrawlerPlayerFacingAngle();
            state.turnAfterimageCooldown = Math.max(0, (state.turnAfterimageCooldown || 0) - dt);
            if (!Number.isFinite(targetFacing)) {
                state.facingAngle = currentFacing;
                state.targetFacingAngle = currentFacing;
                player.matrixCrawlerFacingAngle = currentFacing;
                player.matrixCrawlerTurning = false;
                return currentFacing;
            }

            const turnGap = Math.abs(normalizeAngle(targetFacing - currentFacing));
            const turnBlend = 1 - Math.exp(-MATRIX_CRAWLER_PLAYER_TURN_RESPONSE * dt);
            const nextFacing = normalizeAngle(lerpAngle(currentFacing, targetFacing, turnBlend));
            if (turnGap > 0.14 && state.turnAfterimageCooldown <= 0) {
                pushMatrixCrawlerPlayerTurnAfterimage(currentFacing, targetFacing);
                state.turnAfterimageCooldown = 0.078;
            }
            state.targetFacingAngle = targetFacing;
            state.facingAngle = nextFacing;
            player.matrixCrawlerFacingAngle = nextFacing;
            player.matrixCrawlerTurning = Math.abs(normalizeAngle(nextFacing - currentFacing)) > 0.002;
            return nextFacing;
        }

        function pushMatrixCrawlerPlayerMovementAfterimage(activity = 0, firing = false) {
            const state = matrixCrawlerState;
            const speed = Math.hypot(player.vx || 0, player.vy || 0);
            const facing = getMatrixCrawlerPlayerFacingAngle();
            const moveAngle = speed > 10 ? Math.atan2(player.vy || 0, player.vx || 0) : facing;
            const trailAngle = moveAngle + Math.PI;
            const sideAngle = facing + Math.PI / 2;
            const phase = ((currentFrameNow || 0) * 0.014) + ((state.runStartedAt || 0) * 0.001);
            const normalized = Math.max(0, Math.min(1, activity || 0));
            const sideDrift = Math.sin(phase) * (0.45 + normalized * 0.95);
            const trailDistance = 1.4 + normalized * 4.2 + (firing ? 1.0 : 0);
            pushMatrixCrawlerPlayerTurnAfterimage(facing, facing, {
                x: player.x + Math.cos(trailAngle) * trailDistance + Math.cos(sideAngle) * sideDrift,
                y: player.y + Math.sin(trailAngle) * trailDistance + Math.sin(sideAngle) * sideDrift,
                offsetX: Math.cos(trailAngle) * (1.2 + normalized * 2.6),
                offsetY: Math.sin(trailAngle) * (1.2 + normalized * 2.6),
                life: MATRIX_CRAWLER_PHANTOM_AFTERIMAGE_LIFE,
                color: firing ? '#dffcff' : '#8ff7ff',
                alphaScale: 0.36 + normalized * 0.42 + (firing ? 0.10 : 0),
                baseAlpha: 0.058,
                detailAlpha: 0.024,
                scaleBoost: 0.018
            });
        }

        function updateMatrixCrawlerPlayerMovementAfterimages(dt, firing = false) {
            const state = matrixCrawlerState;
            const speed = Math.hypot(player.vx || 0, player.vy || 0);
            const moving = Math.max(0, Math.min(1, speed / 260));
            const turning = player.matrixCrawlerTurning ? 0.24 : 0;
            const activity = Math.max(0.12, Math.min(1, moving * 0.78 + turning + (firing ? 0.18 : 0)));
            const activeMotion = moving > 0.06 || firing || player.matrixCrawlerTurning;
            const interval = activeMotion ? 0.062 - moving * 0.020 : 0.18;
            state.playerPhantomEmitter = (state.playerPhantomEmitter || 0) + dt;
            let emitted = 0;
            const maxEmit = activeMotion ? 2 : 1;
            while (state.playerPhantomEmitter >= interval && emitted < maxEmit) {
                state.playerPhantomEmitter -= interval;
                pushMatrixCrawlerPlayerMovementAfterimage(activity, firing);
                emitted++;
            }
        }

        function getMatrixCrawlerPlayerHoverBob(now = currentFrameNow || 0) {
            const speed = Math.max(0, Math.min(1, Math.hypot(player.vx || 0, player.vy || 0) / 260));
            const facing = getMatrixCrawlerPlayerFacingAngle();
            const phase = now * 0.0042 + ((matrixCrawlerState && matrixCrawlerState.runStartedAt) || 0) * 0.0007;
            const side = Math.sin(phase * 0.83) * (0.52 + speed * 0.30);
            const lift = Math.sin(phase) * (1.05 + speed * 0.25);
            return {
                x: Math.cos(facing + Math.PI / 2) * side,
                y: lift + Math.sin(facing + Math.PI / 2) * side * 0.22
            };
        }

        function getMatrixCrawlerTransformedPlayerPoint(point, angle = getMatrixCrawlerPlayerFacingAngle()) {
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

        function getMatrixCrawlerHoverDriveOrigin(angle = getMatrixCrawlerPlayerFacingAngle()) {
            const layout = getPlayerRenderLayout(player, 'center');
            const rear = getMatrixCrawlerTransformedPlayerPoint(layout.rearOrigin, angle);
            const aftPush = 5;
            return {
                x: rear.x + Math.cos(angle + Math.PI) * aftPush,
                y: rear.y + Math.sin(angle + Math.PI) * aftPush
            };
        }

        function getMatrixCrawlerHoverThrusterAnchors(angle = getMatrixCrawlerPlayerFacingAngle()) {
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
            const facingAngle = getMatrixCrawlerPlayerFacingAngle();
            const origin = getMatrixCrawlerHoverDriveOrigin(facingAngle);
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
                rotation: angle - facingAngle + (Math.random() - 0.5) * 0.6,
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
            const facingAngle = getMatrixCrawlerPlayerFacingAngle();
            const anchors = getMatrixCrawlerHoverThrusterAnchors(facingAngle);
            const exhaustAngle = facingAngle + Math.PI;
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

        function getMatrixCrawlerProjectileVisual(stats = {}) {
            const isPlasmaCloud = !!stats.plasmaCloud;
            const isMiniTorpedo = !!stats.miniTorpedo;
            const isLightningBall = !!stats.lightningBall;
            const orbiting = (stats.orbitDelay || 0) > 0;
            const returning = !!stats.returning;
            const isBurstRound = !!stats.burstFire && !isPlasmaCloud && !isMiniTorpedo && !isLightningBall;
            const isRicochetShard = stats.ricochetCount > 0
                && !isLightningBall && !isPlasmaCloud && !isMiniTorpedo
                && stats.pathFunction !== 'parabolic' && stats.pathFunction !== 'sine'
                && !orbiting && !returning;
            const sprite = isLightningBall || isPlasmaCloud
                ? ''
                : (isMiniTorpedo
                    ? 'o'
                    : (stats.pathFunction === 'parabolic'
                        ? '\u25d3'
                        : (orbiting
                            ? '\u263c'
                            : (returning
                                ? '\u271a'
                                : (isRicochetShard ? '\u25c7' : (isBurstRound ? '!' : '|'))))));
            const color = isPlasmaCloud
                ? '#66f2ff'
                : (isMiniTorpedo
                    ? '#ffb347'
                    : (isLightningBall
                        ? '#8ff7ff'
                        : (orbiting
                            ? '#ffcf6d'
                            : (returning
                                ? '#77ffe7'
                                : (isRicochetShard ? '#9bf7ff' : (isBurstRound ? '#dcb6ff' : '#ffffff'))))));
            const isSpecialGlyph = isBurstRound || isRicochetShard || orbiting || returning
                || stats.pathFunction === 'parabolic';
            return {
                sprite,
                color,
                isBurstRound,
                isRicochetShard,
                isPlasmaCloud,
                isMiniTorpedo,
                isLightningBall,
                isSpecialGlyph
            };
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
            const visual = getMatrixCrawlerProjectileVisual(stats);
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
                    color: visual.color,
                    char: visual.sprite,
                    sprite: visual.sprite,
                    stats: { ...stats },
                    visualSeed: Math.random() * 1000,
                    isBurstRound: visual.isBurstRound,
                    isRicochetShard: visual.isRicochetShard,
                    isLightningBall: visual.isLightningBall,
                    isPlasmaCloud: visual.isPlasmaCloud,
                    isMiniTorpedo: visual.isMiniTorpedo,
                    isMatrixLaserProjectile: !visual.isLightningBall && !visual.isMiniTorpedo && !visual.isPlasmaCloud && !visual.isSpecialGlyph
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
                if (isMatrixFirewallMaskProtected(enemy)) {
                    registerMatrixFirewallMaskBlock(enemy, projectile);
                    continue;
                }
                if (isMatrixShieldedPortNodeClosed(enemy)) {
                    registerMatrixShieldedPortBlock(enemy, projectile);
                    continue;
                }
                if (enemy.isShielded || enemy.phase === 'INTRO') {
                    enemy.flashTimer = Math.max(enemy.flashTimer || 0, 0.08);
                    continue;
                }
                const falloff = 1 - Math.min(1, d / Math.max(1, radius)) * 0.45;
                applyMatrixEnemyHpDamage(enemy, damage * falloff, projectile, 0.12);
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
                if (isMatrixFirewallMaskProtected(enemy)) {
                    registerMatrixFirewallMaskBlock(enemy, { color: MATRIX_CRAWLER_BOMB_PICKUP_COLOR });
                    continue;
                }
                if (isMatrixShieldedPortNodeClosed(enemy)) {
                    registerMatrixShieldedPortBlock(enemy, { color: MATRIX_CRAWLER_BOMB_PICKUP_COLOR });
                    continue;
                }
                if (enemy.isShielded || enemy.phase === 'INTRO') {
                    enemy.flashTimer = Math.max(enemy.flashTimer || 0, 0.08);
                    continue;
                }
                const falloff = 1 - Math.min(1, d / Math.max(1, radius)) * 0.35;
                applyMatrixEnemyHpDamage(enemy, damage * falloff, { color: MATRIX_CRAWLER_BOMB_PICKUP_COLOR }, 0.16);
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

        function registerMatrixFirewallMaskBlock(enemy, source = null) {
            if (!enemy || enemy.dead) return;
            enemy.flashTimer = Math.max(enemy.flashTimer || 0, 0.08);
            enemy.blockedFlashTimer = Math.max(enemy.blockedFlashTimer || 0, 0.18);
            enemy.blockedTextTimer = Math.max(enemy.blockedTextTimer || 0, 0.48);
            const rect = getMatrixCrawlerRoomRect();
            const sparkColor = source && source.color ? source.color : '#cbd5e2';
            for (let i = 0; i < 4; i++) {
                const a = Math.random() * Math.PI * 2;
                matrixCrawlerState.particles.push({
                    x: enemy.x + Math.cos(a) * (enemy.radius || 20) * 0.7,
                    y: enemy.y + Math.sin(a) * (enemy.radius || 20) * 0.7,
                    vx: Math.cos(a) * (55 + Math.random() * 105),
                    vy: Math.sin(a) * (55 + Math.random() * 105),
                    life: 0.18 + Math.random() * 0.18,
                    maxLife: 0.42,
                    color: i % 2 ? '#ff5e8a' : sparkColor,
                    char: i % 2 ? '!' : '#',
                    rect
                });
            }
        }

        function isMatrixShieldedPortNodeClosed(enemy) {
            return !!(enemy
                && enemy.type === 'shieldedPortNode'
                && enemy.shieldState !== 'open');
        }

        function registerMatrixShieldedPortBlock(enemy, source = null) {
            if (!enemy || enemy.dead) return;
            enemy.flashTimer = Math.max(enemy.flashTimer || 0, 0.08);
            enemy.blockedFlashTimer = Math.max(enemy.blockedFlashTimer || 0, 0.18);
            enemy.blockedTextTimer = Math.max(enemy.blockedTextTimer || 0, 0.46);
            const rect = getMatrixCrawlerRoomRect();
            const color = source && source.color ? source.color : '#cbd5e2';
            for (let i = 0; i < 4; i++) {
                const a = -Math.PI / 2 + (i - 1.5) * 0.42 + (Math.random() - 0.5) * 0.16;
                matrixCrawlerState.particles.push({
                    x: enemy.x + Math.cos(a) * (enemy.radius || 20) * 0.72,
                    y: enemy.y + Math.sin(a) * (enemy.radius || 20) * 0.72,
                    vx: Math.cos(a) * (44 + Math.random() * 92),
                    vy: Math.sin(a) * (44 + Math.random() * 92),
                    life: 0.16 + Math.random() * 0.18,
                    maxLife: 0.38,
                    color: i % 2 ? '#9fb0ad' : color,
                    char: i % 2 ? '#' : '.',
                    rect
                });
            }
        }

        function registerMatrixChampionShieldBlock(enemy, source = null) {
            if (!enemy || enemy.dead) return false;
            if (enemy.variant !== 'shielded' || (enemy.championShieldCharges || 0) <= 0) return false;
            enemy.championShieldCharges = 0;
            enemy.championFlashTimer = Math.max(enemy.championFlashTimer || 0, 0.34);
            enemy.flashTimer = Math.max(enemy.flashTimer || 0, 0.10);
            const rect = getMatrixCrawlerRoomRect();
            const color = (source && source.color) || enemy.variantColor || '#b8fff0';
            for (let i = 0; i < 10; i++) {
                const a = (i / 10) * Math.PI * 2 + Math.random() * 0.18;
                matrixCrawlerState.particles.push({
                    x: enemy.x + Math.cos(a) * (enemy.radius || 18),
                    y: enemy.y + Math.sin(a) * (enemy.radius || 18),
                    vx: Math.cos(a) * (68 + Math.random() * 120),
                    vy: Math.sin(a) * (68 + Math.random() * 120),
                    life: 0.18 + Math.random() * 0.20,
                    maxLife: 0.42,
                    color: i % 2 ? '#e6fff1' : color,
                    char: i % 2 ? '[' : ']',
                    rect
                });
            }
            return true;
        }

        function applyMatrixEnemyHpDamage(enemy, amount, source = null, flashTimer = 0.12) {
            if (!enemy || enemy.dead) return;
            wakeMatrixCrawlerEnemy(enemy, 0.36);
            wakeNearbyMatrixCrawlerEnemies(enemy);
            if (registerMatrixChampionShieldBlock(enemy, source)) return;
            enemy.hp -= amount;
            enemy.flashTimer = Math.max(enemy.flashTimer || 0, flashTimer);
            if (enemy.hp <= 0) killMatrixEnemy(enemy);
        }

        function damageMatrixEnemy(enemy, amount, source = null) {
            if (!enemy || enemy.dead) return;
            wakeMatrixCrawlerEnemy(enemy, 0.36);
            wakeNearbyMatrixCrawlerEnemies(enemy);
            if (isMatrixFirewallMaskProtected(enemy)) {
                registerMatrixFirewallMaskBlock(enemy, source);
                return;
            }
            if (isMatrixShieldedPortNodeClosed(enemy)) {
                registerMatrixShieldedPortBlock(enemy, source);
                return;
            }
            if (enemy.isShielded || enemy.phase === 'INTRO') {
                enemy.flashTimer = 0.08;
                return;
            }
            if (registerMatrixChampionShieldBlock(enemy, source)) return;
            enemy.hp -= amount;
            enemy.flashTimer = 0.12;
            if (source && source.splash > 0) {
                const rect = getMatrixCrawlerRoomRect();
                const radius = source.splash * 24;
                for (const other of matrixCrawlerState.enemies) {
                    if (other === enemy || other.dead) continue;
                    const d = Math.hypot(other.x - enemy.x, other.y - enemy.y);
                    if (d <= radius) {
                        if (isMatrixFirewallMaskProtected(other)) {
                            registerMatrixFirewallMaskBlock(other, source);
                            continue;
                        }
                        if (isMatrixShieldedPortNodeClosed(other)) {
                            registerMatrixShieldedPortBlock(other, source);
                            continue;
                        }
                        if (other.isShielded || other.phase === 'INTRO') {
                            other.flashTimer = Math.max(other.flashTimer || 0, 0.08);
                            continue;
                        }
                        applyMatrixEnemyHpDamage(other, amount * 0.42, source, 0.10);
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
                    if (isMatrixFirewallMaskProtected(nearest)) {
                        registerMatrixFirewallMaskBlock(nearest, source);
                    } else if (isMatrixShieldedPortNodeClosed(nearest)) {
                        registerMatrixShieldedPortBlock(nearest, source);
                    } else if (nearest.isShielded || nearest.phase === 'INTRO') {
                        nearest.flashTimer = Math.max(nearest.flashTimer || 0, 0.08);
                    } else {
                        applyMatrixEnemyHpDamage(nearest, amount * 0.35, source, 0.12);
                    }
                }
            }
            if (enemy.hp <= 0) killMatrixEnemy(enemy);
        }

        function getMatrixCrawlerBombDropChance(enemy) {
            if (!enemy || enemy.type === 'nullPhantom' || enemy.type === 'distortedGlitch') return 0;
            let chance = 0.045;
            if (enemy.type === 'vectorInterceptor') {
                chance = 0.58;
            } else if (enemy.type === 'miniboss' || enemy.visualKind === 'elite') {
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

        function getMatrixCrawlerDataFragmentDropChance(enemy) {
            if (!enemy || enemy.type === 'nullPhantom' || enemy.type === 'distortedGlitch') return 0;
            if (enemy.type === 'vectorInterceptor') return 1;
            if (enemy.variant === 'dataRich') return enemy.type === 'miniboss' || enemy.visualKind === 'elite' ? 0.96 : 0.82;
            if (enemy.type === 'miniboss' || enemy.visualKind === 'elite') return 0.72;
            if (enemy.type === 'hydra') return 0.88;
            if (enemy.type === 'exposedKernel' || enemy.type === 'shieldedPortNode' || enemy.type === 'rebootingMalwareHusk') return 0.42;
            if (enemy.type === 'firewallHost' || enemy.type === 'portSentry' || enemy.type === 'crashBug') return 0.34;
            return 0.24;
        }

        function maybeDropMatrixCrawlerDataFragments(enemy) {
            const chance = getMatrixCrawlerDataFragmentDropChance(enemy);
            if (chance <= 0 || Math.random() >= chance) return false;
            const count = enemy.type === 'vectorInterceptor'
                ? 4
                : enemy.type === 'hydra'
                ? 3
                : (enemy.type === 'miniboss' || enemy.visualKind === 'elite' ? 2 : 1);
            const bonus = enemy.variant === 'dataRich' ? 1 + (Math.random() < 0.35 ? 1 : 0) : 0;
            spawnMatrixDataFragments(enemy.x, enemy.y, count + bonus, enemy.radius || 24);
            return true;
        }

        function maybeDropMatrixVectorInterceptorCache(enemy) {
            if (!enemy || enemy.type !== 'vectorInterceptor') return false;
            if (Math.random() >= MATRIX_VECTOR_INTERCEPTOR_REWARD_CACHE_CHANCE) return false;
            const offset = getMatrixCrawlerEnemySafePoint(getMatrixCrawlerRoom(), enemy.x + 32, enemy.y - 18, 26);
            spawnMatrixMinorCache(offset.x, offset.y, {
                reward: getMatrixCrawlerMinorCacheReward()
            });
            return true;
        }

        function getMatrixRebootingHuskRebootTime() {
            return MATRIX_REBOOTING_HUSK_REBOOT_TIME_MIN
                + Math.random() * (MATRIX_REBOOTING_HUSK_REBOOT_TIME_MAX - MATRIX_REBOOTING_HUSK_REBOOT_TIME_MIN);
        }

        function emitMatrixRebootingHuskBurst(enemy, color = '#ff6f61', count = 10, chars = ['{', '}', 'x', '.']) {
            const rect = getMatrixCrawlerRoomRect();
            for (let i = 0; i < count; i++) {
                const a = Math.random() * Math.PI * 2;
                const speed = 42 + Math.random() * 128;
                matrixCrawlerState.particles.push({
                    x: enemy.x + Math.cos(a) * (6 + Math.random() * 12),
                    y: enemy.y + Math.sin(a) * (6 + Math.random() * 12),
                    vx: Math.cos(a) * speed,
                    vy: Math.sin(a) * speed,
                    life: 0.22 + Math.random() * 0.24,
                    maxLife: 0.52,
                    color: i % 3 === 0 ? '#e6fff1' : color,
                    char: chars[i % chars.length],
                    rect
                });
            }
        }

        function collapseMatrixRebootingHusk(enemy) {
            if (!enemy || enemy.dead || enemy.type !== 'rebootingMalwareHusk' || enemy.huskState === 'coreDump') return false;
            enemy.huskState = 'coreDump';
            enemy.rebootTimer = getMatrixRebootingHuskRebootTime();
            enemy.coreDumpMaxHp = Math.max(14, Math.round((enemy.activeMaxHp || enemy.maxHp || 48) * MATRIX_REBOOTING_HUSK_CORE_HP_RATIO));
            enemy.coreDumpHp = enemy.coreDumpMaxHp;
            enemy.maxHp = enemy.coreDumpMaxHp;
            enemy.hp = enemy.coreDumpHp;
            enemy.radius = enemy.huskCoreRadius || 15;
            enemy.speed = 0;
            enemy.contact = 0;
            enemy.vx = 0;
            enemy.vy = 0;
            enemy.isShielded = false;
            enemy.flashTimer = 0.18;
            enemy.rebootFlashTimer = 0.32;
            emitMatrixRebootingHuskBurst(enemy, '#baff75', 12, ['{', '}', 'e', 'r', 'r', '.']);
            return true;
        }

        function rebootMatrixMalwareHusk(enemy) {
            if (!enemy || enemy.dead || enemy.type !== 'rebootingMalwareHusk') return;
            enemy.huskState = 'active';
            enemy.rebootCount = (enemy.rebootCount || 0) + 1;
            const activeMax = enemy.activeMaxHp || getMatrixCrawlerEnemyBaseHp('rebootingMalwareHusk');
            const hpRatio = Math.max(0.30, MATRIX_REBOOTING_HUSK_REVIVE_HP_RATIO - enemy.rebootCount * 0.08);
            const speedScale = Math.max(0.78, 1 - enemy.rebootCount * 0.06);
            enemy.maxHp = activeMax;
            enemy.hp = Math.max(10, Math.round(activeMax * hpRatio));
            enemy.radius = enemy.huskActiveRadius || 19;
            enemy.speed = (enemy.huskBaseSpeed || 106) * speedScale;
            enemy.contact = enemy.huskActiveContact || 10;
            enemy.rebootTimer = 0;
            enemy.rebootFlashTimer = 0.42;
            enemy.flashTimer = 0.18;
            enemy.isShielded = false;
            emitMatrixRebootingHuskBurst(enemy, '#ff6f61', 14, ['m', '0', '1', 'x', '!']);
        }

        function triggerMatrixCrawlerVolatileChampionBurst(enemy) {
            if (!enemy || enemy.isChampionFragment) return;
            const rect = getMatrixCrawlerRoomRect();
            const bulletCount = 8;
            for (let i = 0; i < bulletCount; i++) {
                const angle = (i / bulletCount) * Math.PI * 2 + Math.random() * 0.08;
                const spawnRadius = (enemy.radius || 18) + 8;
                fireMatrixEnemyBullet(
                    enemy.x + Math.cos(angle) * spawnRadius,
                    enemy.y + Math.sin(angle) * spawnRadius,
                    angle,
                    118,
                    {
                        char: i % 2 ? '!' : '*',
                        color: i % 2 ? '#ff5e8a' : '#e6fff1',
                        radius: 4.5,
                        hitboxScale: 0.78,
                        damage: 6,
                        life: 0.88
                    }
                );
            }
            for (let i = 0; i < 18; i++) {
                emitMatrixCrawlerParticle(enemy.x, enemy.y, i % 3 === 0 ? '#ffffff' : '#ff5e8a', rect);
            }
            matrixCrawlerState.roomFlash = Math.max(matrixCrawlerState.roomFlash || 0, 0.12);
            addShake(5);
        }

        function spawnMatrixCrawlerSplitterFragments(enemy) {
            if (!enemy || enemy.isChampionFragment || !canMatrixCrawlerChampionSplit(enemy)) return;
            const room = getMatrixCrawlerRoom();
            const rect = getMatrixCrawlerRoomRect(room);
            const color = enemy.variantColor || '#c58dff';
            for (let i = 0; i < 2; i++) {
                const angle = (i === 0 ? -0.85 : 0.85) + Math.random() * 0.3;
                const px = enemy.x + Math.cos(angle) * 34;
                const py = enemy.y + Math.sin(angle) * 34;
                const p = getMatrixCrawlerEnemySafePoint(room, px, py, 24);
                const fragment = spawnMatrixEnemy('bug', p.x, p.y, {
                    hp: 9,
                    maxHp: 9,
                    speed: 102,
                    radius: 11,
                    char: i === 0 ? '.' : ',',
                    color,
                    contact: 4,
                    score: 0,
                    noDrops: true,
                    skipKillRecord: true,
                    suppressChampion: true,
                    isChampionFragment: true,
                    awake: true,
                    entryGrace: 0,
                    visualScale: 0.64
                });
                fragment.vx = Math.cos(angle) * 64;
                fragment.vy = Math.sin(angle) * 64;
            }
            for (let i = 0; i < 10; i++) emitMatrixCrawlerParticle(enemy.x, enemy.y, color, rect);
        }

        function triggerMatrixCrawlerChampionDeathEffects(enemy) {
            if (!enemy || !enemy.isChampion || enemy.isChampionFragment) return;
            if (enemy.variant === 'volatile') {
                triggerMatrixCrawlerVolatileChampionBurst(enemy);
            } else if (enemy.variant === 'splitter') {
                spawnMatrixCrawlerSplitterFragments(enemy);
            }
        }

        function updateMatrixCrawlerChampionEnemy(enemy, dt, allowBehavior = true) {
            if (!enemy || !enemy.isChampion) return;
            enemy.championPulse = (enemy.championPulse || 0) + dt * (enemy.variant === 'overclocked' ? 11 : 5.2);
            enemy.championFlashTimer = Math.max(0, (enemy.championFlashTimer || 0) - dt);
            if (allowBehavior && enemy.variant === 'overclocked') {
                enemy.fireTimer = Math.max(0, (enemy.fireTimer || 0) - dt * 0.22);
                enemy.championTrailTimer = Math.max(0, (enemy.championTrailTimer || 0) - dt);
                if (enemy.championTrailTimer <= 0 && Math.hypot(enemy.vx || 0, enemy.vy || 0) < 480) {
                    enemy.championTrailTimer = 0.075;
                    const rect = getMatrixCrawlerRoomRect();
                    matrixCrawlerState.particles.push({
                        x: enemy.x - Math.cos(enemy.aimAngle || 0) * (enemy.radius || 16) * 0.5,
                        y: enemy.y - Math.sin(enemy.aimAngle || 0) * (enemy.radius || 16) * 0.5,
                        vx: (Math.random() - 0.5) * 28,
                        vy: (Math.random() - 0.5) * 28,
                        life: 0.14 + Math.random() * 0.08,
                        maxLife: 0.28,
                        color: enemy.variantColor || '#8ff7ff',
                        char: Math.random() < 0.5 ? '>' : '.',
                        rect
                    });
                }
            } else if (enemy.variant === 'volatile') {
                enemy.championWarningPulse = 0.5 + Math.sin(enemy.championPulse || 0) * 0.5;
            }
        }

        function killMatrixEnemy(enemy) {
            if (!enemy || enemy.dead) return;
            if (enemy.type === 'rebootingMalwareHusk' && enemy.huskState !== 'coreDump') {
                collapseMatrixRebootingHusk(enemy);
                return;
            }
            enemy.dead = true;
            const rewardScore = Number.isFinite(enemy.score) ? enemy.score : 20;
            if (rewardScore > 0) addScore(rewardScore);
            if (!enemy.skipKillRecord && typeof recordRunEnemyKilled === 'function') recordRunEnemyKilled(enemy);
            if (!enemy.skipKillRecord && player.modifiers.killHeal > 0) {
                healMatrixCrawlerPlayer(1);
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
            if (enemy.type === 'exposedKernel') {
                const mask = getMatrixFirewallKernelMask(enemy);
                if (mask && !mask.dead) {
                    mask.isShielded = false;
                    mask.noDrops = true;
                    mask.skipKillRecord = true;
                    killMatrixEnemy(mask);
                }
            }
            triggerMatrixCrawlerChampionDeathEffects(enemy);
            if (!enemy.noDrops) maybeDropMatrixCrawlerDataFragments(enemy);
            if (!enemy.noDrops) maybeDropMatrixCrawlerBombPickup(enemy, rect);
            if (!enemy.noDrops) maybeDropMatrixVectorInterceptorCache(enemy);
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

        function fireMatrixShieldedPortNodeSpread(enemy) {
            const aim = enemy.aimAngle ?? Math.atan2(player.y - enemy.y, player.x - enemy.x);
            const spread = 0.18;
            for (let i = -1; i <= 1; i++) {
                fireMatrixEnemyBullet(enemy.x + Math.cos(aim) * 18, enemy.y + Math.sin(aim) * 18, aim + i * spread, 164, {
                    char: i === 0 ? '0' : '.',
                    color: i === 0 ? '#ffffff' : '#41ff93',
                    radius: i === 0 ? 6 : 5.5,
                    hitboxScale: 0.78,
                    damage: 8,
                    life: 4.2
                });
            }
            enemy.fireFlashTimer = 0.18;
            emitMatrixCrawlerParticle(enemy.x, enemy.y, '#41ff93');
        }

        function updateMatrixShieldedPortNode(enemy, dt, room, dx, dy, dist) {
            enemy.aimAngle = Math.atan2(dy, dx);
            enemy.blockedFlashTimer = Math.max(0, (enemy.blockedFlashTimer || 0) - dt);
            enemy.blockedTextTimer = Math.max(0, (enemy.blockedTextTimer || 0) - dt);
            enemy.fireFlashTimer = Math.max(0, (enemy.fireFlashTimer || 0) - dt);
            enemy.stateTimer = Math.max(0, (enemy.stateTimer || 0) - dt);

            if (enemy.shieldState === 'closed') {
                enemy.isShielded = true;
                if (enemy.stateTimer <= 0) {
                    enemy.shieldState = 'opening';
                    enemy.stateTimer = MATRIX_SHIELDED_PORT_OPENING_TIME;
                    enemy.fireDelay = MATRIX_SHIELDED_PORT_FIRE_DELAY;
                    enemy.hasFired = false;
                    enemy.fireFlashTimer = 0.10;
                }
                return;
            }

            if (enemy.shieldState === 'opening') {
                enemy.isShielded = true;
                if (enemy.stateTimer <= 0) {
                    enemy.shieldState = 'open';
                    enemy.stateTimer = enemy.openDuration || MATRIX_SHIELDED_PORT_OPEN_TIME;
                    enemy.fireDelay = MATRIX_SHIELDED_PORT_FIRE_DELAY;
                    enemy.hasFired = false;
                    enemy.isShielded = false;
                }
                return;
            }

            if (enemy.shieldState === 'open') {
                enemy.isShielded = false;
                enemy.fireDelay = Math.max(0, (enemy.fireDelay || 0) - dt);
                if (!enemy.hasFired && enemy.fireDelay <= 0) {
                    fireMatrixShieldedPortNodeSpread(enemy);
                    enemy.hasFired = true;
                }
                if (enemy.stateTimer <= 0) {
                    enemy.shieldState = 'closing';
                    enemy.stateTimer = MATRIX_SHIELDED_PORT_CLOSING_TIME;
                    enemy.isShielded = true;
                }
                return;
            }

            if (enemy.shieldState === 'closing') {
                enemy.isShielded = true;
                if (enemy.stateTimer <= 0) {
                    enemy.shieldState = 'closed';
                    enemy.stateTimer = (enemy.cooldownDuration || MATRIX_SHIELDED_PORT_COOLDOWN) + Math.random() * 0.55;
                    enemy.hasFired = false;
                }
            }
        }

        function updateMatrixRebootingMalwareHusk(enemy, dt, room, dx, dy, dist) {
            enemy.rebootFlashTimer = Math.max(0, (enemy.rebootFlashTimer || 0) - dt);
            if (enemy.huskState === 'coreDump') {
                enemy.rebootTimer = Math.max(0, (enemy.rebootTimer || 0) - dt);
                enemy.vx = 0;
                enemy.vy = 0;
                enemy.speed = 0;
                enemy.contact = 0;
                if (enemy.rebootTimer <= 0) {
                    rebootMatrixMalwareHusk(enemy);
                } else if (enemy.rebootTimer < 0.85 && Math.random() < dt * 9) {
                    emitMatrixCrawlerParticle(enemy.x, enemy.y, enemy.rebootTimer < 0.42 ? '#ffffff' : '#baff75');
                }
                return;
            }

            enemy.huskState = 'active';
            const steer = getMatrixCrawlerEnemySeekVector(enemy, room, player.x, player.y, dt, enemy.radius + 4);
            const jitter = Math.sin((enemy.phase || 0) * 1.3 + enemy.indexOffset) * 0.22;
            let moveX = steer.x + -dy / dist * jitter;
            let moveY = steer.y + dx / dist * jitter;
            const moveLen = Math.max(1, Math.hypot(moveX, moveY));
            moveX /= moveLen;
            moveY /= moveLen;
            enemy.aimAngle = Math.atan2(moveY, moveX);
            const speed = enemy.speed || enemy.huskBaseSpeed || 106;
            applyMatrixCrawlerEnemyMove(enemy, room, moveX * speed, moveY * speed, dt, enemy.radius + 4);
        }

        function startMatrixFirewallMaskCharge(enemy, room, dx, dy) {
            const horizontal = Math.abs(dx) >= Math.abs(dy);
            let dirX = horizontal ? Math.sign(dx || 1) : 0;
            let dirY = horizontal ? 0 : Math.sign(dy || 1);
            const probeDistance = 118;
            const probeX = enemy.x + dirX * probeDistance;
            const probeY = enemy.y + dirY * probeDistance;
            if (!isMatrixCrawlerEnemyPointClear(room, probeX, probeY, enemy.radius + 4)) {
                dirX = horizontal ? 0 : Math.sign(dx || 1);
                dirY = horizontal ? Math.sign(dy || 1) : 0;
            }
            enemy.maskChargeDirX = dirX;
            enemy.maskChargeDirY = dirY;
            enemy.aimAngle = Math.atan2(dirY, dirX);
            enemy.maskState = 'windup';
            enemy.maskWindup = MATRIX_FIREWALL_MASK_WINDUP;
            enemy.fireFlashTimer = 0.14;
        }

        function updateMatrixFirewallMask(enemy, dt, room, dx, dy, dist) {
            enemy.blockedFlashTimer = Math.max(0, (enemy.blockedFlashTimer || 0) - dt);
            enemy.blockedTextTimer = Math.max(0, (enemy.blockedTextTimer || 0) - dt);
            enemy.fireFlashTimer = Math.max(0, (enemy.fireFlashTimer || 0) - dt);
            if (!getMatrixFirewallMaskKernel(enemy)) {
                enemy.isShielded = false;
                killMatrixEnemy(enemy);
                return;
            }
            enemy.isShielded = true;

            if (enemy.maskState === 'windup') {
                enemy.maskWindup = Math.max(0, (enemy.maskWindup || 0) - dt);
                if (enemy.maskWindup <= 0) {
                    enemy.maskState = 'dash';
                    enemy.maskDashTimer = MATRIX_FIREWALL_MASK_DASH_TIME;
                    enemy.fireFlashTimer = 0.12;
                }
                return;
            }

            if (enemy.maskState === 'dash') {
                enemy.maskDashTimer = Math.max(0, (enemy.maskDashTimer || 0) - dt);
                const dirX = enemy.maskChargeDirX || 0;
                const dirY = enemy.maskChargeDirY || 0;
                const nextX = enemy.x + dirX * MATRIX_FIREWALL_MASK_CHARGE_SPEED * dt;
                const nextY = enemy.y + dirY * MATRIX_FIREWALL_MASK_CHARGE_SPEED * dt;
                const moved = moveMatrixCrawlerEnemyBodyInRoom(room, enemy.x, enemy.y, nextX, nextY, enemy.radius + 4);
                const blocked = Math.hypot(moved.x - nextX, moved.y - nextY) > 0.2;
                enemy.x = moved.x;
                enemy.y = moved.y;
                enemy.aimAngle = Math.atan2(dirY || dy, dirX || dx);
                if (blocked || enemy.maskDashTimer <= 0) {
                    enemy.maskState = 'stalk';
                    enemy.maskCooldown = MATRIX_FIREWALL_MASK_COOLDOWN + Math.random() * 0.45;
                }
                return;
            }

            enemy.maskCooldown = Math.max(0, (enemy.maskCooldown || 0) - dt);
            const steer = getMatrixCrawlerEnemySeekVector(enemy, room, player.x, player.y, dt, enemy.radius + 4);
            const cardinalX = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx || 1) : 0;
            const cardinalY = Math.abs(dx) >= Math.abs(dy) ? 0 : Math.sign(dy || 1);
            const seekWeight = steer.usingPath ? 0.82 : 0.54;
            let moveX = steer.x * seekWeight + cardinalX * (1 - seekWeight);
            let moveY = steer.y * seekWeight + cardinalY * (1 - seekWeight);
            const moveLen = Math.max(1, Math.hypot(moveX, moveY));
            moveX /= moveLen;
            moveY /= moveLen;
            enemy.aimAngle = Math.atan2(moveY, moveX);
            const speedScale = dist < 118 ? 0.46 : 1;
            applyMatrixCrawlerEnemyMove(enemy, room, moveX * enemy.speed * speedScale, moveY * enemy.speed * speedScale, dt, enemy.radius + 4);
            if (enemy.maskCooldown <= 0 && dist < 640) {
                startMatrixFirewallMaskCharge(enemy, room, dx, dy);
            }
        }

        function fireMatrixExposedKernelCardinal(enemy) {
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2;
                fireMatrixEnemyBullet(enemy.x, enemy.y, angle, 158, {
                    char: i % 2 ? '|' : '-',
                    color: i % 2 ? '#e6fff1' : '#41ff93',
                    radius: 5.5,
                    hitboxScale: 0.78,
                    damage: 8,
                    life: 4.0
                });
            }
            enemy.fireFlashTimer = 0.16;
            emitMatrixCrawlerParticle(enemy.x, enemy.y, '#41ff93');
        }

        function updateMatrixExposedKernel(enemy, dt, room, dx, dy, dist) {
            enemy.fireFlashTimer = Math.max(0, (enemy.fireFlashTimer || 0) - dt);
            enemy.kernelFireTimer = Math.max(0, (enemy.kernelFireTimer || 0) - dt);
            if (enemy.kernelFireTimer <= 0) {
                fireMatrixExposedKernelCardinal(enemy);
                enemy.kernelFireTimer = MATRIX_EXPOSED_KERNEL_FIRE_INTERVAL + Math.random() * 0.42;
            }

            const rect = getMatrixCrawlerRoomRect(room);
            const centerX = rect.x + rect.w / 2;
            const centerY = rect.y + rect.h / 2;
            const awayX = -dx / dist;
            const awayY = -dy / dist;
            const centerDx = centerX - enemy.x;
            const centerDy = centerY - enemy.y;
            const centerDist = Math.max(1, Math.hypot(centerDx, centerDy));
            const fleeWeight = dist < 430 ? 0.86 : 0.38;
            const drift = (enemy.kernelDriftPhase || 0) + (enemy.phase || 0) * 0.85;
            let moveX = awayX * fleeWeight + (centerDx / centerDist) * (1 - fleeWeight) + Math.cos(drift) * 0.18;
            let moveY = awayY * fleeWeight + (centerDy / centerDist) * (1 - fleeWeight) + Math.sin(drift * 0.83) * 0.18;
            const moveLen = Math.max(1, Math.hypot(moveX, moveY));
            moveX /= moveLen;
            moveY /= moveLen;
            enemy.aimAngle = Math.atan2(dy, dx);
            const panicScale = dist < 150 ? 1.22 : 1;
            applyMatrixCrawlerEnemyMove(enemy, room, moveX * enemy.speed * panicScale, moveY * enemy.speed * panicScale, dt, enemy.radius + 4);
        }

        function getMatrixVectorInterceptorPlayerPrediction(enemy, seconds = 0.46) {
            const room = getMatrixCrawlerRoom();
            const rect = getMatrixCrawlerRoomRect(room);
            const speed = Math.max(1, Math.hypot(player.vx || 0, player.vy || 0));
            const distance = enemy ? Math.hypot(player.x - enemy.x, player.y - enemy.y) : 240;
            const lead = Math.max(0.22, Math.min(0.72, seconds + distance / 1200 + speed / 900));
            return {
                x: Math.max(rect.x + 34, Math.min(rect.right - 34, player.x + (player.vx || 0) * lead)),
                y: Math.max(rect.y + 34, Math.min(rect.bottom - 34, player.y + (player.vy || 0) * lead)),
                lead
            };
        }

        function getMatrixVectorInterceptorProjectileDodge(enemy) {
            const state = matrixCrawlerState;
            let dodgeX = 0;
            let dodgeY = 0;
            let danger = 0;
            const projectiles = state && Array.isArray(state.projectiles) ? state.projectiles : [];
            for (let i = 0; i < projectiles.length; i++) {
                const p = projectiles[i];
                if (!p || p.isDissolvingProjectile) continue;
                const pvx = p.vx || 0;
                const pvy = p.vy || 0;
                const speedSq = pvx * pvx + pvy * pvy;
                if (speedSq < 1) continue;
                const relX = enemy.x - p.x;
                const relY = enemy.y - p.y;
                const t = Math.max(0, Math.min(MATRIX_VECTOR_INTERCEPTOR_DODGE_WINDOW, (relX * pvx + relY * pvy) / speedSq));
                const closestX = p.x + pvx * t;
                const closestY = p.y + pvy * t;
                const closeDx = enemy.x - closestX;
                const closeDy = enemy.y - closestY;
                const closeDist = Math.max(1, Math.hypot(closeDx, closeDy));
                const radius = MATRIX_VECTOR_INTERCEPTOR_DODGE_RADIUS + (p.radius || 6) * 2;
                if (closeDist > radius) continue;
                const urgency = Math.pow(1 - closeDist / radius, 1.7) * (1 - Math.min(1, t / MATRIX_VECTOR_INTERCEPTOR_DODGE_WINDOW) * 0.35);
                dodgeX += (closeDx / closeDist) * urgency;
                dodgeY += (closeDy / closeDist) * urgency;
                danger += urgency;
            }
            const len = Math.hypot(dodgeX, dodgeY);
            if (len > 1) {
                dodgeX /= len;
                dodgeY /= len;
            }
            return { x: dodgeX, y: dodgeY, danger: Math.min(1, danger) };
        }

        function emitMatrixVectorInterceptorTrail(enemy, dt, activity = 0) {
            enemy.vectorTrailTimer = Math.max(0, (enemy.vectorTrailTimer || 0) - dt);
            if (enemy.vectorTrailTimer > 0) return;
            const speed = Math.hypot(enemy.vx || 0, enemy.vy || 0);
            enemy.vectorTrailTimer = Math.max(0.035, 0.095 - Math.min(0.05, speed / 4600));
            const angle = (enemy.aimAngle || 0) + Math.PI;
            const rect = getMatrixCrawlerRoomRect();
            const color = activity > 0.45 ? '#ffffff' : '#ff8a6b';
            matrixCrawlerState.particles.push({
                x: enemy.x + Math.cos(angle) * (enemy.radius || 24) * 0.72,
                y: enemy.y + Math.sin(angle) * (enemy.radius || 24) * 0.72,
                vx: Math.cos(angle) * (45 + speed * 0.08) + (enemy.vx || 0) * 0.05,
                vy: Math.sin(angle) * (45 + speed * 0.08) + (enemy.vy || 0) * 0.05,
                life: 0.16 + activity * 0.06,
                maxLife: 0.34,
                color,
                char: activity > 0.55 ? '>' : '.',
                rect
            });
        }

        function fireMatrixVectorInterceptorLeadPattern(enemy) {
            const predicted = getMatrixVectorInterceptorPlayerPrediction(enemy, 0.34);
            const aim = Math.atan2(predicted.y - enemy.y, predicted.x - enemy.x);
            const spawnRadius = (enemy.radius || 24) + 8;
            const originX = enemy.x + Math.cos(aim) * spawnRadius;
            const originY = enemy.y + Math.sin(aim) * spawnRadius;
            const side = aim + Math.PI / 2;
            fireMatrixEnemyBullet(originX, originY, aim, 235, {
                char: '>',
                color: '#ff8a6b',
                radius: 5.5,
                visualRadius: 7,
                hitboxScale: 0.78,
                damage: 8,
                life: 3.0
            });
            for (let i = -1; i <= 1; i += 2) {
                const laneX = originX + Math.cos(side) * i * 11;
                const laneY = originY + Math.sin(side) * i * 11;
                fireMatrixEnemyBullet(laneX, laneY, aim + i * 0.085, 198, {
                    char: i < 0 ? '/' : '\\',
                    color: '#8ff7ff',
                    radius: 4.5,
                    hitboxScale: 0.76,
                    damage: 7,
                    life: 2.8
                });
            }
            enemy.fireFlashTimer = 0.18;
            enemy.vectorTargetX = predicted.x;
            enemy.vectorTargetY = predicted.y;
            emitMatrixCrawlerParticle(originX, originY, '#ff8a6b');
        }

        function updateMatrixVectorInterceptor(enemy, dt, room, dx, dy, dist) {
            const rect = getMatrixCrawlerRoomRect(room);
            const predicted = getMatrixVectorInterceptorPlayerPrediction(enemy, 0.42);
            const dodge = getMatrixVectorInterceptorProjectileDodge(enemy);
            const toPredX = predicted.x - enemy.x;
            const toPredY = predicted.y - enemy.y;
            const toPredDist = Math.max(1, Math.hypot(toPredX, toPredY));
            const orbitSide = enemy.vectorOrbitSide || 1;
            const idealRange = 260 + Math.sin((enemy.vectorAiPhase || 0) + enemy.phase * 0.8) * 34;
            const rangeError = Math.max(-1, Math.min(1, (toPredDist - idealRange) / 190));
            const tangentX = -toPredY / toPredDist * orbitSide;
            const tangentY = toPredX / toPredDist * orbitSide;
            const approachX = toPredX / toPredDist;
            const approachY = toPredY / toPredDist;
            let desiredX = tangentX * 0.62 + approachX * rangeError * 0.78 + dodge.x * (1.65 + dodge.danger * 1.05);
            let desiredY = tangentY * 0.62 + approachY * rangeError * 0.78 + dodge.y * (1.65 + dodge.danger * 1.05);

            if (enemy.x < rect.x + 88) desiredX += 0.85;
            if (enemy.x > rect.right - 88) desiredX -= 0.85;
            if (enemy.y < rect.y + 88) desiredY += 0.85;
            if (enemy.y > rect.bottom - 88) desiredY -= 0.85;

            const steer = getMatrixCrawlerEnemySeekVector(
                enemy,
                room,
                enemy.x + desiredX * 120,
                enemy.y + desiredY * 120,
                dt,
                enemy.radius + 5
            );
            desiredX = desiredX * 0.72 + steer.x * 0.28;
            desiredY = desiredY * 0.72 + steer.y * 0.28;
            const desiredLen = Math.max(1, Math.hypot(desiredX, desiredY));
            desiredX /= desiredLen;
            desiredY /= desiredLen;

            const targetSpeed = Math.min(
                MATRIX_VECTOR_INTERCEPTOR_MAX_SPEED,
                (enemy.speed || 144) * (0.78 + dodge.danger * 0.54 + Math.min(0.22, Math.abs(rangeError) * 0.22))
            );
            const targetVx = desiredX * targetSpeed;
            const targetVy = desiredY * targetSpeed;
            const response = targetSpeed > 8
                ? MATRIX_VECTOR_INTERCEPTOR_ACCEL_RESPONSE
                : MATRIX_VECTOR_INTERCEPTOR_DECEL_RESPONSE;
            const blend = 1 - Math.exp(-response * dt);
            enemy.vx = (enemy.vx || 0) + (targetVx - (enemy.vx || 0)) * blend;
            enemy.vy = (enemy.vy || 0) + (targetVy - (enemy.vy || 0)) * blend;
            const moved = moveMatrixCrawlerEnemyBodyInRoom(
                room,
                enemy.x,
                enemy.y,
                enemy.x + enemy.vx * dt,
                enemy.y + enemy.vy * dt,
                enemy.radius + 5
            );
            if (Math.abs(moved.x - (enemy.x + enemy.vx * dt)) > 0.1) enemy.vx *= -0.35;
            if (Math.abs(moved.y - (enemy.y + enemy.vy * dt)) > 0.1) enemy.vy *= -0.35;
            enemy.x = moved.x;
            enemy.y = moved.y;

            const motionAngle = Math.atan2(enemy.vy || 0, enemy.vx || 0);
            const targetAim = Math.atan2((enemy.vectorTargetY || predicted.y) - enemy.y, (enemy.vectorTargetX || predicted.x) - enemy.x);
            const currentAim = Number.isFinite(enemy.aimAngle) ? enemy.aimAngle : targetAim;
            const turn = Math.atan2(Math.sin(targetAim - currentAim), Math.cos(targetAim - currentAim));
            enemy.aimAngle = currentAim + turn * Math.min(1, dt * 8.5);
            if (Math.hypot(enemy.vx || 0, enemy.vy || 0) > 48) {
                const motionTurn = Math.atan2(Math.sin(motionAngle - enemy.aimAngle), Math.cos(motionAngle - enemy.aimAngle));
                enemy.aimAngle += motionTurn * 0.28;
            }

            enemy.fireFlashTimer = Math.max(0, (enemy.fireFlashTimer || 0) - dt);
            enemy.vectorFireWindup = Math.max(0, (enemy.vectorFireWindup || 0) - dt);
            if (enemy.vectorFireWindup > 0) {
                enemy.vectorTargetX = predicted.x;
                enemy.vectorTargetY = predicted.y;
                if (enemy.vectorFireWindup <= dt) {
                    fireMatrixVectorInterceptorLeadPattern(enemy);
                    enemy.fireTimer = 1.02 + Math.random() * 0.44 + dodge.danger * 0.16;
                }
            } else {
                enemy.fireTimer = Math.max(0, (enemy.fireTimer || 0) - dt);
                if (enemy.fireTimer <= 0 && dist < 620) {
                    const lead = getMatrixVectorInterceptorPlayerPrediction(enemy, 0.52);
                    enemy.vectorTargetX = lead.x;
                    enemy.vectorTargetY = lead.y;
                    enemy.vectorFireWindup = 0.24;
                    enemy.fireFlashTimer = 0.10;
                }
            }

            emitMatrixVectorInterceptorTrail(enemy, dt, dodge.danger);
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
            return damageMatrixCrawlerPlayer({ amount }, 1);
        }

        function canMatrixCrawlerEnemyNoticePlayer(enemy, room, dist) {
            if (!enemy || !room) return false;
            const range = getMatrixCrawlerEnemyAggroRange(enemy);
            if (dist > range) return false;
            if (dist <= Math.min(190, range * 0.42)) return true;
            return hasMatrixCrawlerPathLine(room, enemy.x, enemy.y, player.x, player.y, enemy.radius + 6, MATRIX_CRAWLER_NAV_CELL * 0.55, true);
        }

        function updateMatrixCrawlerEnemyAwareness(enemy, dt, room, dist) {
            if (!enemy || isMatrixCrawlerBossEnemy(enemy) || enemy.aggroState === 'active') return true;
            enemy.entryGraceTimer = Math.max(0, (enemy.entryGraceTimer || 0) - dt);
            enemy.vx *= Math.pow(0.34, dt * 60);
            enemy.vy *= Math.pow(0.34, dt * 60);

            const canNotice = enemy.entryGraceTimer <= 0 && canMatrixCrawlerEnemyNoticePlayer(enemy, room, dist);
            if (canNotice) {
                enemy.aggroState = 'alerting';
                enemy.noticeTimer = Math.min(getMatrixCrawlerEnemyNoticeDuration(enemy), (enemy.noticeTimer || 0) + dt);
                enemy.aimAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                enemy.fireFlashTimer = Math.max(enemy.fireFlashTimer || 0, 0.08);
                if (enemy.noticeTimer >= getMatrixCrawlerEnemyNoticeDuration(enemy)) {
                    enemy.aggroState = 'active';
                    enemy.contactArmed = true;
                    enemy.fireTimer = Math.max(0.48, Math.min(enemy.fireTimer || 0.48, 0.92));
                    enemy.flashTimer = Math.max(enemy.flashTimer || 0, 0.10);
                    return true;
                }
            } else {
                enemy.noticeTimer = Math.max(0, (enemy.noticeTimer || 0) - dt * 0.85);
                if (enemy.noticeTimer <= 0) enemy.aggroState = 'idle';
            }
            return false;
        }

        function updateMatrixCrawlerPlayer(dt) {
            const room = getMatrixCrawlerRoom();
            let mx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
            let my = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
            if (mx !== 0 && my !== 0) {
                mx *= 0.707;
                my *= 0.707;
            }
            const terrainSlow = getMatrixCrawlerTerrainSlowMultiplier(room, player.x, player.y, 'player');
            const speed = 246 * getPlayerMoveSpeedScale() * terrainSlow;
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
            const moveFacing = getMatrixCrawlerMovementFacingAngle(mx, my);
            updateMatrixCrawlerFacing(dt, aim ? aim.angle : moveFacing);
            updateMatrixCrawlerPlayerMovementAfterimages(dt, !!aim);
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
                    const terrainHit = getMatrixCrawlerProjectileTerrainHit(p, 'blocksPlayerShots');
                    if (terrainHit) {
                        flashMatrixCrawlerTerrainHit(terrainHit);
                        hitProjectile = true;
                        remove = true;
                    }
                }
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
                bomb.prevX = bomb.x;
                bomb.prevY = bomb.y;
                bomb.x += (bomb.vx || 0) * dt;
                bomb.y += (bomb.vy || 0) * dt;
                bomb.distance = Math.hypot(bomb.x - bomb.startX, bomb.y - bomb.startY);

                let shouldExplode = bomb.forceDetonate
                    || bomb.distance >= bomb.maxDistance
                    || bomb.x < rect.x - 24 || bomb.x > rect.right + 24
                    || bomb.y < rect.y - 24 || bomb.y > rect.bottom + 24
                    || !isPointInMatrixCrawlerRoom(room, bomb.x, bomb.y, -8);
                if (!shouldExplode) {
                    const terrainHit = getMatrixCrawlerProjectileTerrainHit(bomb, 'blocksPlayerShots');
                    if (terrainHit) {
                        flashMatrixCrawlerTerrainHit(terrainHit);
                        shouldExplode = true;
                    }
                }
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
                const enemyAwake = updateMatrixCrawlerEnemyAwareness(enemy, dt, room, dist);
                updateMatrixCrawlerChampionEnemy(enemy, dt, enemyAwake);
                if (!enemyAwake) continue;
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
                if (enemy.type === 'shieldedPortNode') {
                    updateMatrixShieldedPortNode(enemy, dt, room, dx, dy, dist);
                    const postDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                    if (postDist < enemy.radius + getMatrixCrawlerPlayerHitboxRadius() + 2) damageMatrixPlayer(enemy.contact || 8);
                    if (!isMatrixCrawlerRuntimeActive()) return;
                    continue;
                }
                if (enemy.type === 'rebootingMalwareHusk') {
                    updateMatrixRebootingMalwareHusk(enemy, dt, room, dx, dy, dist);
                    const postDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                    if (enemy.huskState !== 'coreDump' && postDist < enemy.radius + getMatrixCrawlerPlayerHitboxRadius() + 2) {
                        damageMatrixPlayer(enemy.contact || 10);
                    }
                    if (!isMatrixCrawlerRuntimeActive()) return;
                    continue;
                }
                if (enemy.type === 'firewallMask') {
                    updateMatrixFirewallMask(enemy, dt, room, dx, dy, dist);
                    if (enemy.dead) continue;
                    const postDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                    if (postDist < enemy.radius + getMatrixCrawlerPlayerHitboxRadius() + 2) damageMatrixPlayer(enemy.contact || 12);
                    if (!isMatrixCrawlerRuntimeActive()) return;
                    continue;
                }
                if (enemy.type === 'exposedKernel') {
                    updateMatrixExposedKernel(enemy, dt, room, dx, dy, dist);
                    const postDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                    if (postDist < enemy.radius + getMatrixCrawlerPlayerHitboxRadius() + 2) damageMatrixPlayer(enemy.contact || 7);
                    if (!isMatrixCrawlerRuntimeActive()) return;
                    continue;
                }
                if (enemy.type === 'vectorInterceptor') {
                    updateMatrixVectorInterceptor(enemy, dt, room, dx, dy, dist);
                    const postDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                    if (postDist < enemy.radius + getMatrixCrawlerPlayerHitboxRadius() + 2) damageMatrixPlayer(enemy.contact || 11);
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
            state.enemies = state.enemies.filter(enemy => !enemy.dead);
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
                b.prevX = b.x;
                b.prevY = b.y;
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.life -= dt;
                const terrainHit = getMatrixCrawlerProjectileTerrainHit(b, 'blocksEnemyShots');
                if (terrainHit) {
                    flashMatrixCrawlerTerrainHit(terrainHit);
                    if (!beginMatrixCrawlerEnemyBulletDissolve(b)) {
                        state.enemyBullets.splice(i, 1);
                    }
                    continue;
                }
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
                if (p.kind === 'dataFragment' || p.kind === 'coin') {
                    if (updateMatrixDataFragmentPickup(p, dt)) {
                        state.pickups.splice(i, 1);
                    }
                    continue;
                }
                if (Math.hypot(player.x - p.x, player.y - p.y) > p.radius + 20) continue;
                if (p.kind === 'heart') {
                    healMatrixCrawlerPlayer(p.amount || 1);
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
                    advanceMatrixCrawlerFloor();
                    return;
                } else if (p.kind === 'minorCache') {
                    applyMatrixCrawlerMinorCacheReward(p.reward || getMatrixCrawlerMinorCacheReward());
                    const room = getMatrixCrawlerRoom();
                    if (room) room.rewardClaimed = true;
                    for (let burst = 0; burst < 12; burst++) {
                        emitMatrixCrawlerParticle(p.x, p.y, burst % 2 ? MATRIX_CRAWLER_COLORS.data : (p.color || MATRIX_CRAWLER_COLORS.cache));
                    }
                    state.pickups.splice(i, 1);
                } else if (p.kind === 'item' && p.reward) {
                    if (p.reward.kind === 'weapon') {
                        addPlayerWeapon(p.reward.item);
                        if (typeof pausePowerupSelection === 'number' && player && player.weapons) {
                            pausePowerupSelection = Math.max(0, player.weapons.length - 1);
                        }
                    } else if (typeof beginLevelUpOffer === 'function') {
                        const offered = buildMatrixCrawlerPowerupOffer(p.reward.item);
                        beginLevelUpOffer({
                            returnState: MATRIX_CRAWLER_GAME_STATE,
                            offeredOptions: offered.length ? offered : undefined
                        });
                    } else if (typeof applyPowerup === 'function') {
                        applyPowerup(p.reward.item);
                    }
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

        function updateMatrixCrawlerTerrain(dt) {
            const room = getMatrixCrawlerRoom();
            for (const feature of getMatrixCrawlerRoomTerrain(room)) {
                feature.flashTimer = Math.max(0, (feature.flashTimer || 0) - dt);
                feature.phase = (feature.phase || 0) + dt * (feature.type === 'latencyPool' ? 1.7 : 0.9);
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
            player.xp = 0;
            player.xpNeeded = 1;
            state.message = room.type === 'boss' ? 'FLOOR ROUTE OPEN' : 'ROOM CLEAR';
            state.messageTimer = 1.1;
            state.roomFlash = 0.45;
            if (room.type === 'boss') {
                if (typeof recordRunBossDefeated === 'function') recordRunBossDefeated();
            } else {
                const spawnedCache = maybeSpawnPendingMatrixMinorCache(room);
                const spawnedArchetypeReward = !spawnedCache && maybeSpawnMatrixCrawlerArchetypeClearReward(room);
                if (!spawnedCache && !spawnedArchetypeReward && Math.random() < MATRIX_ROOM_CLEAR_DATA_FRAGMENT_CHANCE) {
                    spawnMatrixDataFragments(player.x, player.y - 22, 1 + (Math.random() < 0.18 ? 1 : 0), 18);
                }
                if (!spawnedCache && Math.random() < 0.10) spawnMatrixPickup(player.x + 26, player.y, 'heart', { amount: 1, color: '#ff8fb5' });
                if (!spawnedCache && Math.random() < (player.bombTimer > 0 ? 0.16 : 0.035)) {
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
            updateMatrixCacheDaemon(safeDt);
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
            updateMatrixCrawlerTerrain(safeDt);
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
                floor: getMatrixCrawlerCurrentFloor(),
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
            const theme = getMatrixCrawlerFloorTheme();
            const overclock = isMatrixCrawlerOverclockFloor();
            const pairColor = pair.color || theme.glow;
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
            ctx.fillStyle = colorWithAlpha(overclock ? '#06142b' : '#00180d', 0.78);
            ctx.fillRect(x, keyY, keyW, keyH);
            ctx.globalAlpha = alpha * 0.26;
            ctx.strokeStyle = colorWithAlpha(pairColor, 0.72);
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, keyY + 0.5, keyW, keyH);

            ctx.globalAlpha = alpha * 0.76;
            ctx.fillStyle = theme.white;
            if (glowEnabled) {
                ctx.shadowColor = pairColor;
                ctx.shadowBlur = 3 * alpha;
            }
            ctx.fillText(pair.key, x + keyPadX, y + 1);
            ctx.shadowBlur = 0;

            const actionX = x + keyW + Math.round(fontSize * 0.52);
            ctx.font = actionFont;
            ctx.globalAlpha = alpha * 0.62;
            ctx.fillStyle = pairColor;
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
            const theme = getMatrixCrawlerFloorTheme();
            const overclock = isMatrixCrawlerOverclockFloor();

            const pairs = [
                { key: 'WASD', action: 'MOVE', color: overclock ? theme.glow : '#8ff7ff' },
                { key: 'ARROWS', action: 'AIM', color: overclock ? theme.data : '#9fb8ff' },
                { key: 'SPACE', action: 'BOMB', color: MATRIX_CRAWLER_BOMB_PICKUP_COLOR },
                { key: 'SHIFT', action: 'FOCUS', color: overclock ? theme.accent : '#b7ffcf' }
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
            ctx.fillStyle = theme.glow;
            ctx.fillRect(panelX, panelY, panelW, panelH);
            ctx.globalAlpha = baseAlpha * 0.20;
            ctx.strokeStyle = colorWithAlpha(theme.grid, 0.62);
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
                    ctx.fillStyle = colorWithAlpha(theme.glow, 0.74);
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
                    ctx.fillStyle = c > 0.72 ? theme.white : theme.glow;
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
            const theme = getMatrixCrawlerFloorTheme();
            const overclock = isMatrixCrawlerOverclockFloor();
            ctx.save();
            ctx.beginPath();
            ctx.rect(rect.x, rect.y, rect.w, rect.h);
            ctx.clip();
            const bg = ctx.createLinearGradient(0, rect.y, 0, rect.bottom);
            bg.addColorStop(0, overclock ? '#030616' : '#020c07');
            bg.addColorStop(0.55, overclock ? '#071132' : '#03170d');
            bg.addColorStop(1, overclock ? '#02030c' : '#010604');
            ctx.fillStyle = bg;
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            ctx.globalCompositeOperation = 'screen';
            ctx.lineWidth = 1;
            const drift = (now * 0.018) % 24;
            for (let x = rect.x + 18; x < rect.right; x += 24) {
                ctx.globalAlpha = overclock ? 0.12 : 0.10;
                ctx.strokeStyle = theme.grid;
                ctx.beginPath();
                ctx.moveTo(Math.round(x) + 0.5, rect.y);
                ctx.lineTo(Math.round(x) + 0.5, rect.bottom);
                ctx.stroke();
            }
            for (let y = rect.y + 12 - drift; y < rect.bottom; y += 24) {
                ctx.globalAlpha = overclock ? 0.10 : 0.08;
                ctx.strokeStyle = theme.grid;
                ctx.beginPath();
                ctx.moveTo(rect.x, Math.round(y) + 0.5);
                ctx.lineTo(rect.right, Math.round(y) + 0.5);
                ctx.stroke();
            }
            if (overclock) {
                ctx.lineWidth = 1.2;
                const bandDrift = (now * 0.026) % 92;
                for (let y = rect.y + bandDrift - 92; y < rect.bottom + 92; y += 92) {
                    const wave = Math.sin(now * 0.0026 + y * 0.017) * 16;
                    ctx.globalAlpha = 0.055;
                    ctx.strokeStyle = colorWithAlpha(theme.accent, 0.62);
                    ctx.beginPath();
                    ctx.moveTo(rect.x, y);
                    ctx.lineTo(rect.x + rect.w * 0.32 + wave, y + 5);
                    ctx.lineTo(rect.x + rect.w * 0.68 - wave, y - 4);
                    ctx.lineTo(rect.right, y + 3);
                    ctx.stroke();
                    ctx.globalAlpha = 0.035;
                    ctx.strokeStyle = colorWithAlpha(theme.data, 0.72);
                    ctx.beginPath();
                    ctx.moveTo(rect.x, y + 22);
                    ctx.lineTo(rect.right, y + 22 + Math.sin(now * 0.002 + y) * 7);
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 0.13;
            ctx.font = 'bold 10px Courier New';
            ctx.fillStyle = overclock ? theme.data : theme.glow;
            const codeCount = Math.min(70, Math.max(22, Math.round((rect.w * rect.h) / 26000)));
            const labels = overclock ? ['xor', 'gpu', 'fft', 'ram'] : ['01', 'ptr', 'sys'];
            for (let i = 0; i < codeCount; i++) {
                const x = rect.x + ((i * 97 + now * 0.012) % rect.w);
                const y = rect.y + ((i * 53 + now * 0.026) % rect.h);
                ctx.fillText(labels[i % labels.length], x, y);
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
            const theme = getMatrixCrawlerFloorTheme();
            const overclock = isMatrixCrawlerOverclockFloor();
            ctx.save();
            for (let zoneIndex = 0; zoneIndex < blockedRects.length; zoneIndex++) {
                const blocked = blockedRects[zoneIndex];
                const pulse = 0.5 + Math.sin(now * 0.003 + blocked.seed) * 0.5;
                ctx.globalAlpha = 1;
                ctx.fillStyle = overclock ? 'rgba(2, 5, 17, 0.94)' : 'rgba(0, 5, 3, 0.94)';
                ctx.fillRect(blocked.x, blocked.y, blocked.w, blocked.h);
                ctx.strokeStyle = colorWithAlpha(theme.wall, 0.44 + pulse * 0.18);
                ctx.lineWidth = 2;
                ctx.shadowColor = theme.glow;
                ctx.shadowBlur = glowEnabled ? 6 + pulse * 4 : 0;
                ctx.strokeRect(blocked.x + 0.5, blocked.y + 0.5, blocked.w - 1, blocked.h - 1);
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.20;
                ctx.strokeStyle = theme.grid;
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
                ctx.fillStyle = colorWithAlpha(theme.glow, 0.72);
                ctx.fillText(blocked.label || 'NULL', blocked.x + blocked.w / 2, blocked.y + blocked.h / 2);
                ctx.globalAlpha = 0.12 + pulse * 0.08;
                ctx.font = 'bold 9px Courier New';
                ctx.fillStyle = overclock ? theme.accent : theme.glow;
                const glyphs = Math.min(9, Math.max(3, Math.round((blocked.w * blocked.h) / 18000)));
                for (let i = 0; i < glyphs; i++) {
                    const gx = blocked.x + ((blocked.seed * 37 + i * 29 + now * 0.018) % blocked.w);
                    const gy = blocked.y + ((blocked.seed * 53 + i * 31 + now * 0.011) % blocked.h);
                    ctx.fillText(i % 2 ? 'err' : '0x', gx, gy);
                }
            }
            ctx.restore();
        }

        function drawMatrixCrawlerTerrainFeature(feature, now) {
            if (!feature) return;
            const rect = getMatrixCrawlerTerrainRect(feature);
            const pulse = 0.5 + Math.sin(now * 0.004 + (feature.phase || 0)) * 0.5;
            const flash = Math.max(0, feature.flashTimer || 0);
            const theme = getMatrixCrawlerFloorTheme();
            const overclock = isMatrixCrawlerOverclockFloor();
            ctx.save();
            if (feature.type === 'latencyPool') {
                const cx = rect.x + rect.w / 2;
                const cy = rect.y + rect.h / 2;
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.18 + pulse * 0.08;
                ctx.fillStyle = colorWithAlpha(overclock ? theme.accent : theme.glow, 0.34);
                ctx.beginPath();
                ctx.ellipse(cx, cy, rect.w / 2, rect.h / 2, Math.sin((feature.phase || 0) * 0.7) * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 0.22 + pulse * 0.12;
                ctx.strokeStyle = colorWithAlpha(theme.data, 0.48);
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.ellipse(cx, cy, rect.w / 2 - 3, rect.h / 2 - 3, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 0.14 + pulse * 0.08;
                ctx.font = 'bold 9px Courier New';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = theme.glow;
                for (let i = 0; i < 4; i++) {
                    const tx = rect.x + rect.w * (0.22 + ((i * 0.23 + now * 0.00008 + feature.seed * 0.001) % 0.56));
                    const ty = rect.y + rect.h * (0.30 + ((i * 0.17 + now * 0.00005) % 0.42));
                    ctx.fillText(i % 2 ? '~' : 'ms', tx, ty);
                }
                ctx.restore();
                return;
            }

            if (feature.type === 'nullGap') {
                ctx.globalAlpha = 0.94;
                ctx.fillStyle = overclock ? 'rgba(1, 3, 14, 0.92)' : 'rgba(0, 2, 2, 0.92)';
                ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
                ctx.strokeStyle = colorWithAlpha(theme.grid, 0.62 + pulse * 0.18);
                ctx.lineWidth = 1.5;
                ctx.shadowColor = theme.wallDim;
                ctx.shadowBlur = glowEnabled ? 4 + pulse * 3 : 0;
                ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
                ctx.shadowBlur = 0;
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.12 + pulse * 0.06;
                ctx.strokeStyle = colorWithAlpha(theme.data, 0.32);
                const lines = Math.max(2, Math.floor(Math.max(rect.w, rect.h) / 44));
                for (let i = 0; i < lines; i++) {
                    const t = (i + 1) / (lines + 1);
                    ctx.beginPath();
                    if (rect.w >= rect.h) {
                        const y = rect.y + rect.h * t + Math.sin(now * 0.002 + i + feature.seed) * 1.5;
                        ctx.moveTo(rect.x + 8, y);
                        ctx.lineTo(rect.right - 8, y);
                    } else {
                        const x = rect.x + rect.w * t + Math.cos(now * 0.002 + i + feature.seed) * 1.5;
                        ctx.moveTo(x, rect.y + 8);
                        ctx.lineTo(x, rect.bottom - 8);
                    }
                    ctx.stroke();
                }
                ctx.globalAlpha = 0.18;
                ctx.font = 'bold 9px Courier New';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = theme.glow;
                ctx.fillText('NULL', rect.x + rect.w / 2, rect.y + rect.h / 2);
                ctx.restore();
                return;
            }

            const hitAlpha = Math.min(1, flash / 0.16);
            const blockColor = hitAlpha > 0 ? theme.white : (overclock ? theme.accent : theme.glow);
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.90;
            ctx.fillStyle = colorWithAlpha(overclock ? '#061127' : '#03140b', 0.88);
            ctx.strokeStyle = colorWithAlpha(blockColor, 0.76 + pulse * 0.18);
            ctx.shadowColor = blockColor;
            ctx.shadowBlur = glowEnabled ? 8 + pulse * 5 + hitAlpha * 8 : 0;
            ctx.lineWidth = 1.7;
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.34 + pulse * 0.12;
            ctx.strokeStyle = theme.data;
            ctx.beginPath();
            ctx.moveTo(rect.x + 6, rect.y + 6);
            ctx.lineTo(rect.right - 6, rect.bottom - 6);
            ctx.moveTo(rect.right - 6, rect.y + 6);
            ctx.lineTo(rect.x + 6, rect.bottom - 6);
            ctx.stroke();
            ctx.globalAlpha = 0.86 + hitAlpha * 0.14;
            ctx.fillStyle = blockColor;
            ctx.font = `bold ${Math.max(10, Math.round(Math.min(rect.w, rect.h) * 0.36))}px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(feature.seed % 2 ? '[]' : '##', rect.x + rect.w / 2, rect.y + rect.h / 2);
            ctx.restore();
        }

        function drawMatrixCrawlerTerrain(room, now) {
            const terrain = getMatrixCrawlerRoomTerrain(room);
            if (!terrain.length) return;
            const order = { latencyPool: 0, nullGap: 1, firewallBlock: 2 };
            const sorted = terrain.slice().sort((a, b) => (order[a.type] || 9) - (order[b.type] || 9));
            for (const feature of sorted) drawMatrixCrawlerTerrainFeature(feature, now);
        }

        function drawMatrixCrawlerBreakable(object, now) {
            if (!object || object.destroyed) return;
            const r = object.radius || 16;
            const pulse = 0.5 + Math.sin(now * 0.004 + object.phase) * 0.5;
            const flash = object.flashTimer > 0 ? 1 : 0;
            const theme = getMatrixCrawlerFloorTheme();
            const overclock = isMatrixCrawlerOverclockFloor();
            const objectColor = object.color || (overclock ? theme.accent : theme.glow);
            ctx.save();
            ctx.translate(object.x, object.y + Math.sin(now * 0.0025 + object.phase) * 1.8);
            ctx.globalAlpha = 0.88;
            ctx.fillStyle = flash ? colorWithAlpha(theme.white, 0.72) : colorWithAlpha(overclock ? '#081329' : '#06160f', 0.84);
            ctx.strokeStyle = flash ? theme.white : colorWithAlpha(objectColor, 0.78);
            ctx.lineWidth = 1.5;
            if (glowEnabled) {
                ctx.shadowColor = objectColor;
                ctx.shadowBlur = 6 + pulse * 5 + flash * 8;
            }
            ctx.beginPath();
            ctx.rect(-r * 0.85, -r * 0.72, r * 1.7, r * 1.44);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.36 + pulse * 0.16;
            ctx.strokeStyle = objectColor;
            ctx.beginPath();
            ctx.moveTo(-r * 0.58, -r * 0.72);
            ctx.lineTo(r * 0.58, r * 0.72);
            ctx.moveTo(r * 0.58, -r * 0.72);
            ctx.lineTo(-r * 0.58, r * 0.72);
            ctx.stroke();
            ctx.globalAlpha = 0.92;
            ctx.fillStyle = flash ? theme.white : objectColor;
            ctx.font = `bold ${Math.max(12, Math.round(r * 0.82))}px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(object.char || '[]', 0, 1);
            ctx.restore();
        }

        function drawMatrixCrawlerBossDoorIndicator(d, horizontal, now, open, seed) {
            const theme = getMatrixCrawlerFloorTheme();
            const cx = d.x + d.w / 2;
            const cy = d.y + d.h / 2;
            const pulse = 0.5 + Math.sin(now * 0.005 + seed * 1.7) * 0.5;
            const blink = 0.5 + Math.sin(now * 0.013 + seed * 2.1) * 0.5;
            const radius = Math.max(7, Math.min(14, (horizontal ? d.h : d.w) * 0.42));
            ctx.save();
            ctx.translate(cx, cy);
            if (!horizontal) ctx.rotate(Math.PI / 2);
            ctx.globalCompositeOperation = 'screen';
            ctx.shadowColor = theme.danger;
            ctx.shadowBlur = glowEnabled ? 8 + pulse * 4 : 0;
            ctx.lineWidth = 1.5;

            ctx.globalAlpha = open ? 0.76 : 0.90;
            ctx.strokeStyle = colorWithAlpha(theme.danger, 0.62 + pulse * 0.24);
            ctx.beginPath();
            ctx.ellipse(0, 0, radius * 1.55, radius * 0.72, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.globalAlpha = 0.34 + blink * 0.24;
            ctx.strokeStyle = colorWithAlpha(theme.white, 0.48);
            ctx.beginPath();
            ctx.moveTo(-radius * 1.65, 0);
            ctx.lineTo(-radius * 0.92, 0);
            ctx.moveTo(radius * 0.92, 0);
            ctx.lineTo(radius * 1.65, 0);
            ctx.stroke();

            ctx.globalAlpha = 0.48 + pulse * 0.22;
            ctx.fillStyle = colorWithAlpha(theme.danger, 0.72);
            ctx.beginPath();
            ctx.moveTo(0, -radius * 0.62);
            ctx.lineTo(radius * 0.58, 0);
            ctx.lineTo(0, radius * 0.62);
            ctx.lineTo(-radius * 0.58, 0);
            ctx.closePath();
            ctx.fill();

            ctx.globalAlpha = 0.42 + blink * 0.20;
            ctx.strokeStyle = colorWithAlpha('#ffffff', 0.36);
            for (let i = -1; i <= 1; i++) {
                const x = i * radius * 0.62;
                ctx.beginPath();
                ctx.moveTo(x - radius * 0.20, -radius * 1.04);
                ctx.lineTo(x, -radius * 1.36);
                ctx.lineTo(x + radius * 0.20, -radius * 1.04);
                ctx.stroke();
            }
            ctx.restore();
        }

        function drawMatrixCrawlerDoors(room, rect, now = 0) {
            const open = room && room.clear;
            const theme = getMatrixCrawlerFloorTheme();
            const overclock = isMatrixCrawlerOverclockFloor();
            for (let dirIndex = 0; dirIndex < MATRIX_CRAWLER_DIRS.length; dirIndex++) {
                const dir = MATRIX_CRAWLER_DIRS[dirIndex];
                const neighborKey = room.neighbors[dir.id];
                if (!neighborKey) continue;
                const neighbor = matrixCrawlerState && matrixCrawlerState.roomMap
                    ? matrixCrawlerState.roomMap.get(neighborKey)
                    : null;
                const bossDoor = !!(neighbor && neighbor.type === 'boss');
                const d = getMatrixCrawlerDoorRect(room, dir.id);
                const horizontal = dir.id === 'N' || dir.id === 'S';
                const seed = (room.index || 0) * 1.73 + dirIndex * 2.37;
                const pulse = 0.5 + Math.sin(now * 0.0042 + seed) * 0.5;
                const quietFlicker = 0.5 + Math.sin(now * 0.017 + seed * 1.9) * 0.5;
                const goodColor = colorWithAlpha(bossDoor ? theme.danger : theme.glow, 0.62 + pulse * 0.13);
                const lockColor = colorWithAlpha(bossDoor ? theme.danger : '#a8b0bb', bossDoor ? 0.48 + quietFlicker * 0.16 : 0.36 + quietFlicker * 0.12);
                ctx.save();
                ctx.fillStyle = open
                    ? (bossDoor ? (overclock ? 'rgba(28, 8, 26, 0.90)' : 'rgba(31, 5, 17, 0.90)') : (overclock ? 'rgba(5, 16, 36, 0.90)' : 'rgba(4, 26, 13, 0.90)'))
                    : (bossDoor ? (overclock ? 'rgba(24, 8, 26, 0.90)' : 'rgba(28, 8, 16, 0.90)') : (overclock ? 'rgba(8, 12, 24, 0.88)' : 'rgba(10, 13, 17, 0.88)'));
                ctx.strokeStyle = open ? goodColor : lockColor;
                ctx.shadowColor = ctx.strokeStyle;
                ctx.shadowBlur = glowEnabled ? (bossDoor ? 8 + pulse * 5 : (open ? 8 + pulse * 3 : 3 + quietFlicker * 2)) : 0;
                ctx.lineWidth = 2;
                ctx.fillRect(d.x, d.y, d.w, d.h);
                ctx.strokeRect(d.x + 0.5, d.y + 0.5, d.w - 1, d.h - 1);

                ctx.globalCompositeOperation = 'screen';
                if (open) {
                    const scan = (0.18 + ((now * 0.00018 + seed) % 0.64));
                    ctx.globalAlpha = 0.14 + pulse * 0.08;
                    ctx.fillStyle = colorWithAlpha(theme.white, 0.30);
                    if (horizontal) {
                        ctx.fillRect(d.x + 8, d.y + d.h * 0.5 - 1, d.w - 16, 2);
                        ctx.fillStyle = colorWithAlpha(theme.data, 0.26);
                        ctx.fillRect(d.x + d.w * scan, d.y + 4, 2, d.h - 8);
                    } else {
                        ctx.fillRect(d.x + d.w * 0.5 - 1, d.y + 8, 2, d.h - 16);
                        ctx.fillStyle = colorWithAlpha(theme.data, 0.26);
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
                if (bossDoor) drawMatrixCrawlerBossDoorIndicator(d, horizontal, now, open, seed);
                ctx.restore();
            }
        }

        function getMatrixCrawlerWallMarginCuts(room, side, axisStart, axisEnd) {
            const cuts = [];
            if (!room || !room.neighbors) return cuts;
            const pad = MATRIX_CRAWLER_WALL_MARGIN_DOOR_PAD;
            for (const dir of MATRIX_CRAWLER_DIRS) {
                if (!room.neighbors[dir.id]) continue;
                if (dir.id !== side) continue;
                const d = getMatrixCrawlerDoorRect(room, dir.id);
                if (side === 'N' || side === 'S') {
                    cuts.push({
                        start: Math.max(axisStart, d.x - pad),
                        end: Math.min(axisEnd, d.x + d.w + pad)
                    });
                } else {
                    cuts.push({
                        start: Math.max(axisStart, d.y - pad),
                        end: Math.min(axisEnd, d.y + d.h + pad)
                    });
                }
            }
            return cuts
                .filter(cut => cut.end > cut.start)
                .sort((a, b) => a.start - b.start);
        }

        function drawMatrixCrawlerWallMarginSegment(x, y, w, h, side, now, seed, theme, overclock) {
            if (w <= 0 || h <= 0) return;
            const pulse = 0.5 + Math.sin((now || 0) * 0.004 + seed) * 0.5;
            const horizontal = side === 'N' || side === 'S';
            const innerX1 = side === 'E' ? x : x;
            const innerY1 = side === 'S' ? y : y;
            const bodyColor = overclock ? 'rgba(4, 14, 30, 0.72)' : 'rgba(2, 16, 10, 0.72)';
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x, y, w, h);

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.10 + pulse * 0.045;
            ctx.fillStyle = colorWithAlpha(theme.wallDim || theme.wall, overclock ? 0.54 : 0.44);
            if (horizontal) {
                const stripeY = side === 'N' ? y + h - 2 : y + 1;
                ctx.fillRect(x, stripeY, w, 1.5);
                ctx.globalAlpha = 0.045 + pulse * 0.035;
                ctx.fillRect(x, y + h * 0.5 - 0.5, w, 1);
            } else {
                const stripeX = side === 'W' ? x + w - 2 : x + 1;
                ctx.fillRect(stripeX, y, 1.5, h);
                ctx.globalAlpha = 0.045 + pulse * 0.035;
                ctx.fillRect(x + w * 0.5 - 0.5, y, 1, h);
            }

            ctx.globalAlpha = 0.08 + pulse * 0.03;
            ctx.strokeStyle = colorWithAlpha(theme.white, 0.18);
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (horizontal) {
                const lineY = side === 'N' ? y + h + 0.5 : y - 0.5;
                ctx.moveTo(innerX1 + 4, lineY);
                ctx.lineTo(innerX1 + w - 4, lineY);
            } else {
                const lineX = side === 'W' ? x + w + 0.5 : x - 0.5;
                ctx.moveTo(lineX, innerY1 + 4);
                ctx.lineTo(lineX, innerY1 + h - 4);
            }
            ctx.stroke();
            ctx.restore();
        }

        function drawMatrixCrawlerWallMargins(room, rect, now) {
            if (!room || !rect) return;
            const theme = getMatrixCrawlerFloorTheme();
            const overclock = isMatrixCrawlerOverclockFloor();
            const t = Math.max(6, Math.min(14, MATRIX_CRAWLER_WALL_MARGIN_THICKNESS));
            const sides = [
                { id: 'N', axisStart: rect.x, axisEnd: rect.right, x: rect.x, y: rect.y, horizontal: true },
                { id: 'S', axisStart: rect.x, axisEnd: rect.right, x: rect.x, y: rect.bottom - t, horizontal: true },
                { id: 'W', axisStart: rect.y, axisEnd: rect.bottom, x: rect.x, y: rect.y, horizontal: false },
                { id: 'E', axisStart: rect.y, axisEnd: rect.bottom, x: rect.right - t, y: rect.y, horizontal: false }
            ];
            ctx.save();
            for (let i = 0; i < sides.length; i++) {
                const side = sides[i];
                const cuts = getMatrixCrawlerWallMarginCuts(room, side.id, side.axisStart, side.axisEnd);
                let cursor = side.axisStart;
                for (const cut of cuts) {
                    if (cut.start > cursor + 2) {
                        if (side.horizontal) {
                            drawMatrixCrawlerWallMarginSegment(cursor, side.y, cut.start - cursor, t, side.id, now, i * 7.3 + cursor * 0.01, theme, overclock);
                        } else {
                            drawMatrixCrawlerWallMarginSegment(side.x, cursor, t, cut.start - cursor, side.id, now, i * 7.3 + cursor * 0.01, theme, overclock);
                        }
                    }
                    cursor = Math.max(cursor, cut.end);
                }
                if (side.axisEnd > cursor + 2) {
                    if (side.horizontal) {
                        drawMatrixCrawlerWallMarginSegment(cursor, side.y, side.axisEnd - cursor, t, side.id, now, i * 7.3 + cursor * 0.01, theme, overclock);
                    } else {
                        drawMatrixCrawlerWallMarginSegment(side.x, cursor, t, side.axisEnd - cursor, side.id, now, i * 7.3 + cursor * 0.01, theme, overclock);
                    }
                }
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerRoomFrame(room, rect, now) {
            const theme = getMatrixCrawlerFloorTheme();
            ctx.save();
            drawMatrixCrawlerWallMargins(room, rect, now);
            ctx.lineWidth = 3;
            ctx.strokeStyle = theme.wall;
            ctx.shadowColor = theme.glow;
            ctx.shadowBlur = glowEnabled ? 13 : 0;
            ctx.strokeRect(rect.x - 1.5, rect.y - 1.5, rect.w + 3, rect.h + 3);
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
            ctx.strokeStyle = colorWithAlpha(theme.white, 0.20);
            ctx.strokeRect(rect.x + 8.5, rect.y + 8.5, rect.w - 17, rect.h - 17);
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.24;
            ctx.strokeStyle = room && room.clear ? theme.glow : colorWithAlpha('#a8b0bb', 0.38);
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
                const alpha = Math.pow(lifeRatio, 1.65) * (Number.isFinite(ghost.alphaScale) ? ghost.alphaScale : 1);
                const pulse = 0.85 + Math.sin(now * 0.025 + i) * 0.15;
                ctx.save();
                ctx.translate(ghostX, ghostY);
                ctx.rotate(ghost.angle + Math.PI / 2);
                ctx.scale(
                    MATRIX_CRAWLER_PLAYER_RENDER_SCALE * (1.02 + (1 - lifeRatio) * (ghost.scaleBoost ?? 0.04)),
                    MATRIX_CRAWLER_PLAYER_RENDER_SCALE
                );
                ctx.translate(-ghostX, -ghostY);
                const ghostColor = ghost.color || '#8ff7ff';
                ctx.shadowColor = ghostColor;
                ctx.shadowBlur = glowEnabled ? 6 * alpha + 2 * pulse : 0;
                ctx.fillStyle = ghostColor;
                ctx.globalAlpha = (ghost.baseAlpha ?? 0.12) * alpha;
                for (const offset of [[-0.8, 0], [0.8, 0], [0, -0.8], [0, 0.8]]) {
                    ctx.save();
                    ctx.translate(offset[0], offset[1]);
                    drawMatrixCrawlerPlayerLayoutTint(layout, { color: ghostColor, amount: 0.58 });
                    ctx.restore();
                }
                ctx.globalAlpha = (ghost.detailAlpha ?? 0.045) * alpha;
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
            const bob = getMatrixCrawlerPlayerHoverBob(now);
            ctx.save();
            ctx.translate(player.x + bob.x, player.y + bob.y);
            ctx.rotate(getMatrixCrawlerPlayerFacingAngle() + Math.PI / 2);
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

        function drawMatrixCacheDaemon(now) {
            const state = matrixCrawlerState;
            if (!state || !state.cacheDaemonInitialized) return;
            const max = Math.max(1, state.cacheDaemonChargeMax || MATRIX_CACHE_DAEMON_CHARGE_MAX);
            const ratio = Math.max(0, Math.min(1, (state.cacheDaemonCharge || 0) / max));
            const ready = !!state.cacheDaemonReady;
            const pulse = 0.5 + Math.sin(now * (ready ? 0.010 : 0.006) + (state.cacheDaemonPhase || 0)) * 0.5;
            const absorb = Math.max(0, Math.min(1, (state.cacheDaemonAbsorbTimer || 0) / 0.42));
            const x = state.cacheDaemonX;
            const y = state.cacheDaemonY + Math.sin(now * 0.003 + (state.cacheDaemonPhase || 0)) * 2;
            const glow = ready ? 18 + pulse * 11 : 5 + ratio * 12 + absorb * 8;
            const mainColor = ready
                ? (pulse > 0.42 ? MATRIX_CRAWLER_COLORS.white : MATRIX_CRAWLER_COLORS.glow)
                : ratio > 0.66
                    ? '#b6ffde'
                    : ratio > 0.25
                        ? MATRIX_CRAWLER_COLORS.data
                        : colorWithAlpha(MATRIX_CRAWLER_COLORS.glow, 0.58);
            const glyph = ready ? '<@>' : (ratio >= 0.66 ? '<d>' : (ratio > 0 ? '[d]' : '[.]'));
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = mainColor;
            ctx.shadowBlur = glowEnabled ? glow : 0;
            ctx.fillStyle = mainColor;
            ctx.font = `bold ${ready ? 17 : 14}px 'Electrolize', sans-serif`;
            ctx.globalAlpha = 0.74 + ratio * 0.20 + absorb * 0.16;
            ctx.fillText(glyph, x | 0, y | 0);
            if (ratio > 0.08) {
                const pips = Math.max(1, Math.round(ratio * 4));
                ctx.font = 'bold 8px Courier New';
                ctx.globalAlpha = 0.34 + ratio * 0.38;
                for (let i = 0; i < pips; i++) {
                    const a = now * 0.0022 + i * (Math.PI * 2 / pips) + (state.cacheDaemonPhase || 0);
                    ctx.fillText('0', x + Math.cos(a) * 15, y + Math.sin(a) * 11);
                }
            }
            if (ready) {
                const a = now * 0.004 + (state.cacheDaemonPhase || 0);
                ctx.strokeStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.white, 0.58 + pulse * 0.25);
                ctx.lineWidth = 1.5;
                ctx.shadowBlur = glowEnabled ? 11 : 0;
                ctx.strokeRect((x + Math.cos(a) * 19 - 3) | 0, (y + Math.sin(a) * 14 - 3) | 0, 6, 6);
            }
            ctx.restore();
        }

        function drawMatrixCrawlerRobot(now) {
            if (playerExploded) return;
            drawMatrixCrawlerHoverAura(now);
            drawMatrixCrawlerHoverThrusters(now);
            drawMatrixCrawlerPlayerAfterimages(now);
            drawMatrixCrawlerShip(now);
        }

        function drawMatrixCrawlerGlobalDebris() {
            if (!Array.isArray(debris) || debris.length <= 0) return;
            let lastDebrisColor = null;
            let lastDebrisFont = null;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const d of debris) {
                if (!d) continue;
                if (d.color !== lastDebrisColor) {
                    ctx.fillStyle = d.color || MATRIX_CRAWLER_COLORS.white;
                    lastDebrisColor = d.color;
                }
                ctx.globalAlpha = d.isImpact
                    ? Math.max(0, Math.min(1, (d.life || 0) * 5))
                    : Math.max(0, Math.min(1, d.life || 0));
                const debrisFont = d.isImpact ? 'bold 7px Courier New' : 'bold 16px Courier New';
                if (debrisFont !== lastDebrisFont) {
                    ctx.font = debrisFont;
                    lastDebrisFont = debrisFont;
                }
                ctx.fillText(d.char || '.', d.x | 0, d.y | 0);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
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

        function drawMatrixCrawlerShieldedPortNode(entity, now) {
            const state = entity.shieldState || 'closed';
            const open = state === 'open';
            const opening = state === 'opening';
            const closing = state === 'closing';
            const blockFlash = entity.blockedFlashTimer || 0;
            const flash = Math.max(blockFlash, entity.fireFlashTimer || 0, entity.flashTimer || 0);
            const pulse = 0.5 + Math.sin(now * 0.012 + entity.indexOffset) * 0.5;
            const baseColor = flash > 0
                ? '#ffffff'
                : open
                    ? '#41ff93'
                    : opening
                        ? '#baff75'
                        : '#9fb0ad';
            const shellAlpha = open ? 0.52 : opening || closing ? 0.78 : 0.96;

            ctx.save();
            ctx.translate(entity.x, entity.y);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = glowEnabled ? (open ? 15 : opening ? 12 : blockFlash > 0 ? 13 : 8) : 0;
            ctx.font = 'bold 24px Courier New';
            ctx.fillStyle = colorWithAlpha(baseColor, shellAlpha);
            ctx.fillText(open ? '<0>' : opening ? '<#>' : '[###]', 0, 0);
            ctx.font = 'bold 14px Courier New';
            if (open) {
                ctx.fillStyle = '#ffffff';
                ctx.fillText(entity.hasFired ? '*' : '!', 0, 0);
                ctx.globalAlpha = 0.30 + pulse * 0.22;
                ctx.fillStyle = '#41ff93';
                ctx.fillText('PORT', 0, -23);
            } else {
                ctx.fillStyle = colorWithAlpha('#050d08', 0.74);
                ctx.fillText(opening ? '0' : 'X', 0, 0);
                ctx.globalAlpha = blockFlash > 0 ? 0.62 : 0.24 + pulse * 0.16;
                ctx.strokeStyle = colorWithAlpha(blockFlash > 0 ? '#ffffff' : '#9fb0ad', 0.82);
                ctx.lineWidth = 1;
                ctx.strokeRect(-24.5, -15.5, 49, 31);
            }
            if (opening && !open) {
                ctx.globalAlpha = 0.52 + pulse * 0.18;
                ctx.font = 'bold 12px Courier New';
                ctx.fillStyle = '#e6fff1';
                ctx.fillText('...', 0, 23);
            }
            ctx.restore();

            if ((entity.blockedTextTimer || 0) > 0) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.globalAlpha = Math.min(1, (entity.blockedTextTimer || 0) / 0.22);
                ctx.font = 'bold 11px Courier New';
                ctx.fillStyle = '#cbd5e2';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = glowEnabled ? 8 : 0;
                ctx.fillText('BLOCKED', entity.x, entity.y - entity.radius - 13);
                ctx.restore();
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerRebootingMalwareHusk(entity, now) {
            const coreDump = entity.huskState === 'coreDump';
            const flash = Math.max(entity.rebootFlashTimer || 0, entity.flashTimer || 0);
            const pulse = 0.5 + Math.sin(now * 0.014 + entity.indexOffset) * 0.5;
            if (coreDump) {
                const timerRatio = Math.max(0, Math.min(1, (entity.rebootTimer || 0) / MATRIX_REBOOTING_HUSK_REBOOT_TIME_MAX));
                const urgent = timerRatio < 0.32;
                const bodyColor = flash > 0 || (urgent && Math.sin(now * 0.045) > 0.1) ? '#ffffff' : '#baff75';
                ctx.save();
                ctx.translate(entity.x, entity.y);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = bodyColor;
                ctx.shadowBlur = glowEnabled ? 8 + (urgent ? 8 : 0) + pulse * 4 : 0;
                ctx.font = 'bold 17px Courier New';
                ctx.fillStyle = colorWithAlpha(bodyColor, 0.92);
                ctx.fillText(urgent ? '{err}' : '{dump}', 0, 0);
                ctx.font = 'bold 10px Courier New';
                ctx.globalAlpha = 0.48 + pulse * 0.24;
                ctx.fillStyle = urgent ? '#ff6f61' : '#e6fff1';
                ctx.fillText(timerRatio < 0.20 ? 'BOOT' : 'core', 0, -17);
                ctx.restore();
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
                return;
            }

            const angle = entity.aimAngle ?? Math.atan2(player.y - entity.y, player.x - entity.x);
            const bodyColor = flash > 0 ? '#ffffff' : '#ff6f61';
            ctx.save();
            ctx.translate(entity.x, entity.y);
            ctx.rotate(angle);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = bodyColor;
            ctx.shadowBlur = glowEnabled ? 8 + pulse * 5 : 0;
            ctx.font = 'bold 22px Courier New';
            ctx.fillStyle = colorWithAlpha(bodyColor, 0.92);
            ctx.fillText('<m>', 0, 0);
            ctx.font = 'bold 11px Courier New';
            ctx.fillStyle = colorWithAlpha('#41ff93', 0.72);
            ctx.fillText(entity.rebootCount > 0 ? 're' : 'x0', -3, -19);
            ctx.globalAlpha = 0.34 + pulse * 0.20;
            ctx.fillStyle = '#e6fff1';
            ctx.fillText('}', 17, 9);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerFirewallMask(entity, now) {
            const protectedMask = isMatrixFirewallMaskProtected(entity);
            const windup = entity.maskState === 'windup';
            const dashing = entity.maskState === 'dash';
            const blockFlash = entity.blockedFlashTimer || 0;
            const flash = Math.max(blockFlash, entity.fireFlashTimer || 0, entity.flashTimer || 0);
            const pulse = 0.5 + Math.sin(now * 0.014 + entity.indexOffset) * 0.5;
            const bodyColor = flash > 0 ? '#ffffff' : (protectedMask ? '#aeb7c4' : '#6d7784');
            const accentColor = blockFlash > 0 ? '#ff5e8a' : '#cbd5e2';

            ctx.save();
            ctx.translate(entity.x, entity.y);
            ctx.rotate(entity.aimAngle || 0);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (dashing) {
                ctx.font = 'bold 18px Courier New';
                ctx.fillStyle = colorWithAlpha('#aeb7c4', 0.22);
                for (let i = 3; i >= 1; i--) ctx.fillText('###', -i * 13, 0);
            }
            ctx.shadowColor = bodyColor;
            ctx.shadowBlur = glowEnabled ? (blockFlash > 0 ? 14 : windup ? 11 : 8) : 0;
            ctx.font = `bold ${dashing ? 25 : 23}px Courier New`;
            ctx.fillStyle = colorWithAlpha(bodyColor, protectedMask ? 0.95 : 0.72);
            ctx.fillText(windup ? '[!!!]' : '[###]', 0, 0);
            ctx.font = 'bold 17px Courier New';
            ctx.fillStyle = protectedMask ? colorWithAlpha('#050806', 0.78) : colorWithAlpha('#e6fff1', 0.46);
            ctx.fillText(protectedMask ? 'X' : '_', 0, 0);
            if (protectedMask) {
                ctx.globalAlpha = 0.28 + pulse * 0.18;
                ctx.strokeStyle = colorWithAlpha(accentColor, 0.74);
                ctx.lineWidth = 1;
                ctx.strokeRect(-24.5, -15.5, 49, 31);
                ctx.globalAlpha = 0.42 + pulse * 0.16;
                ctx.font = 'bold 11px Courier New';
                ctx.fillStyle = accentColor;
                ctx.fillText(blockFlash > 0 ? '!!' : '//', 0, -23);
            }
            ctx.restore();

            if ((entity.blockedTextTimer || 0) > 0) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.globalAlpha = Math.min(1, (entity.blockedTextTimer || 0) / 0.22);
                ctx.font = 'bold 11px Courier New';
                ctx.fillStyle = '#cbd5e2';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = glowEnabled ? 8 : 0;
                ctx.fillText('BLOCKED', entity.x, entity.y - entity.radius - 13);
                ctx.restore();
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerExposedKernel(entity, now) {
            const flash = Math.max(entity.fireFlashTimer || 0, entity.flashTimer || 0);
            const pulse = 0.5 + Math.sin(now * 0.012 + entity.indexOffset) * 0.5;
            const bodyColor = flash > 0 ? '#ffffff' : '#41ff93';
            ctx.save();
            ctx.translate(entity.x, entity.y);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = bodyColor;
            ctx.shadowBlur = glowEnabled ? 10 + pulse * 7 : 0;
            ctx.font = 'bold 21px Courier New';
            ctx.fillStyle = colorWithAlpha(bodyColor, 0.94);
            ctx.fillText('<K>', 0, 0);
            ctx.font = 'bold 11px Courier New';
            ctx.fillStyle = colorWithAlpha('#e6fff1', 0.74);
            ctx.fillText('010', 0, -18);
            ctx.globalAlpha = 0.34 + pulse * 0.24;
            ctx.fillStyle = '#8ff7ff';
            ctx.fillText('proc', 0, 18);
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
                } else if (entity.type === 'shieldedPortNode') {
                    drawMatrixCrawlerShieldedPortNode(entity, now);
                } else if (entity.type === 'rebootingMalwareHusk') {
                    drawMatrixCrawlerRebootingMalwareHusk(entity, now);
                } else if (entity.type === 'firewallMask') {
                    drawMatrixCrawlerFirewallMask(entity, now);
                } else if (entity.type === 'exposedKernel') {
                    drawMatrixCrawlerExposedKernel(entity, now);
                } else if (entity.type === 'vectorInterceptor') {
                    drawMatrixCrawlerVectorInterceptor(entity, now);
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

        function drawMatrixCrawlerChampionOverlay(entity, now) {
            if (!entity || !entity.isChampion) return;
            const def = getMatrixCrawlerChampionVariantDef(entity.variant);
            if (!def) return;
            const radius = Math.max(15, entity.radius || 18);
            const pulse = 0.5 + Math.sin((entity.championPulse || 0) + now * 0.004) * 0.5;
            const color = entity.variantColor || def.color || MATRIX_CRAWLER_COLORS.glow;
            const glow = entity.variantGlow || def.glow || color;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = glow;
            ctx.shadowBlur = glowEnabled ? 8 + pulse * 8 : 0;
            ctx.lineWidth = entity.variant === 'shielded' && (entity.championShieldCharges || 0) > 0 ? 2 : 1.3;
            ctx.strokeStyle = colorWithAlpha(color, entity.variant === 'volatile' ? 0.62 + pulse * 0.24 : 0.42 + pulse * 0.22);

            if (entity.variant === 'shielded') {
                const active = (entity.championShieldCharges || 0) > 0;
                const w = radius * (active ? 1.8 : 1.5);
                const h = radius * (active ? 1.35 : 1.08);
                ctx.globalAlpha = active ? 0.80 : Math.min(0.52, (entity.championFlashTimer || 0) * 1.7);
                ctx.beginPath();
                ctx.moveTo(entity.x - w, entity.y - h);
                ctx.lineTo(entity.x - w * 0.58, entity.y - h);
                ctx.moveTo(entity.x - w, entity.y + h);
                ctx.lineTo(entity.x - w * 0.58, entity.y + h);
                ctx.moveTo(entity.x + w, entity.y - h);
                ctx.lineTo(entity.x + w * 0.58, entity.y - h);
                ctx.moveTo(entity.x + w, entity.y + h);
                ctx.lineTo(entity.x + w * 0.58, entity.y + h);
                ctx.stroke();
                ctx.font = 'bold 10px Courier New';
                ctx.fillStyle = colorWithAlpha(active ? '#e6fff1' : color, active ? 0.78 : 0.46);
                ctx.fillText(active ? '[]' : 'xx', entity.x, entity.y - radius - 12);
            } else if (entity.variant === 'overclocked') {
                ctx.globalAlpha = 0.42 + pulse * 0.25;
                ctx.beginPath();
                ctx.ellipse(entity.x, entity.y, radius * 1.24, radius * 0.72, (entity.aimAngle || 0), 0, Math.PI * 2);
                ctx.stroke();
                ctx.font = 'bold 10px Courier New';
                ctx.fillStyle = colorWithAlpha(color, 0.74 + pulse * 0.18);
                ctx.fillText('>>', entity.x + radius * 0.66, entity.y - radius - 7);
            } else if (entity.variant === 'volatile') {
                ctx.globalAlpha = 0.45 + pulse * 0.34;
                ctx.beginPath();
                ctx.arc(entity.x, entity.y, radius * (1.2 + pulse * 0.18), 0, Math.PI * 2);
                ctx.stroke();
                ctx.font = 'bold 12px Courier New';
                ctx.fillStyle = colorWithAlpha(color, 0.82);
                ctx.fillText('!', entity.x, entity.y - radius - 10);
            } else if (entity.variant === 'splitter') {
                ctx.globalAlpha = 0.48 + pulse * 0.20;
                ctx.font = 'bold 11px Courier New';
                ctx.fillStyle = colorWithAlpha(color, 0.76);
                ctx.fillText('<', entity.x - radius - 5, entity.y);
                ctx.fillText('>', entity.x + radius + 5, entity.y);
                ctx.strokeStyle = colorWithAlpha(color, 0.42);
                ctx.beginPath();
                ctx.ellipse(entity.x, entity.y, radius * 1.36, radius * 0.86, -0.35, 0, Math.PI * 2);
                ctx.stroke();
            } else if (entity.variant === 'dataRich') {
                ctx.globalAlpha = 0.42 + pulse * 0.24;
                ctx.beginPath();
                ctx.arc(entity.x, entity.y, radius * 1.34, 0, Math.PI * 2);
                ctx.stroke();
                ctx.font = 'bold 10px Courier New';
                ctx.fillStyle = colorWithAlpha('#e6fff1', 0.78);
                ctx.fillText('<>', entity.x, entity.y - radius - 10);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawMatrixCrawlerAggroIndicator(entity, now) {
            if (!entity || entity.aggroState === 'active' || isMatrixCrawlerBossEnemy(entity)) return;
            const range = getMatrixCrawlerEnemyAggroRange(entity);
            const noticeRatio = Math.max(0, Math.min(1, (entity.noticeTimer || 0) / Math.max(0.001, getMatrixCrawlerEnemyNoticeDuration(entity))));
            const alerting = entity.aggroState === 'alerting' || noticeRatio > 0.02;
            const color = entity.variantColor || entity.color || MATRIX_CRAWLER_COLORS.glow;
            const pulse = 0.5 + Math.sin((now || 0) * 0.0036 + (entity.indexOffset || 0)) * 0.5;
            const breath = Math.pow(pulse, 1.55);
            const alertFade = alerting ? Math.max(0, 1 - noticeRatio * 4.8) : 1;
            const radiusAlpha = alerting
                ? (0.010 + breath * 0.018) * alertFade
                : 0.006 + breath * 0.012;
            if (radiusAlpha <= 0.002) return;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineWidth = alerting ? 0.9 : 0.75;
            ctx.setLineDash(alerting ? [5, 28] : [3, 34]);
            ctx.globalAlpha = radiusAlpha;
            ctx.strokeStyle = colorWithAlpha(color, alerting ? 0.22 : 0.18);
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.globalAlpha = alerting
                ? (0.020 + breath * 0.045) * alertFade
                : 0.014 + breath * 0.024;
            ctx.strokeStyle = colorWithAlpha(color, alerting ? 0.34 : 0.24);
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, Math.max(18, (entity.radius || 18) + 6 + alertFade * 4), 0, Math.PI * 2);
            ctx.stroke();

            if (alerting && alertFade > 0.35) {
                ctx.globalAlpha = 0.045 * alertFade;
                ctx.fillStyle = colorWithAlpha('#ffffff', 0.46);
                ctx.beginPath();
                ctx.arc(entity.x, entity.y - (entity.radius || 18) - 12, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerVectorInterceptor(entity, now) {
            const pulse = 0.5 + Math.sin((now || 0) * 0.012 + (entity.indexOffset || 0)) * 0.5;
            const flash = (entity.flashTimer || 0) > 0;
            const windup = entity.vectorFireWindup || 0;
            const bodyColor = flash ? '#ffffff' : '#d7e6f3';
            const enemyColor = entity.color || '#ff6f61';
            const accent = windup > 0 ? '#ffffff' : '#8ff7ff';
            const speed = Math.hypot(entity.vx || 0, entity.vy || 0);
            const bank = Math.max(-0.26, Math.min(0.26, ((entity.vx || 0) * Math.sin(entity.aimAngle || 0) - (entity.vy || 0) * Math.cos(entity.aimAngle || 0)) / 720));
            const angle = (entity.aimAngle || 0) + Math.PI / 2;

            if (windup > 0 && Number.isFinite(entity.vectorTargetX) && Number.isFinite(entity.vectorTargetY)) {
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.16 + Math.sin((now || 0) * 0.04) * 0.05;
                ctx.strokeStyle = colorWithAlpha(enemyColor, 0.72);
                ctx.lineWidth = 1;
                ctx.setLineDash([8, 8]);
                ctx.beginPath();
                ctx.moveTo(entity.x, entity.y);
                ctx.lineTo(entity.vectorTargetX, entity.vectorTargetY);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.globalAlpha = 0.35;
                ctx.beginPath();
                ctx.arc(entity.vectorTargetX, entity.vectorTargetY, 15 + pulse * 5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            ctx.save();
            ctx.translate(entity.x, entity.y);
            ctx.rotate(angle + bank);
            ctx.globalCompositeOperation = 'source-over';

            for (let i = 2; i >= 1; i--) {
                const alpha = (0.08 + speed / 2800) / i;
                ctx.save();
                ctx.globalAlpha = Math.min(0.16, alpha);
                ctx.translate(0, 9 * i + speed * 0.012 * i);
                ctx.fillStyle = i === 1 ? enemyColor : '#8ff7ff';
                ctx.beginPath();
                ctx.moveTo(0, -24);
                ctx.lineTo(18, 16);
                ctx.lineTo(0, 8);
                ctx.lineTo(-18, 16);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            ctx.shadowColor = enemyColor;
            ctx.shadowBlur = glowEnabled ? 10 + pulse * 5 + windup * 24 : 0;
            ctx.fillStyle = colorWithAlpha('#1b1014', 0.92);
            ctx.strokeStyle = colorWithAlpha(enemyColor, 0.82 + pulse * 0.12);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -27);
            ctx.lineTo(22, 19);
            ctx.lineTo(0, 10);
            ctx.lineTo(-22, 19);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.fillStyle = colorWithAlpha(bodyColor, 0.86);
            ctx.beginPath();
            ctx.moveTo(0, -22);
            ctx.lineTo(12, 10);
            ctx.lineTo(0, 4);
            ctx.lineTo(-12, 10);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = colorWithAlpha(enemyColor, 0.78);
            ctx.beginPath();
            ctx.moveTo(-24, 9);
            ctx.lineTo(-11, 20);
            ctx.lineTo(-5, 11);
            ctx.closePath();
            ctx.moveTo(24, 9);
            ctx.lineTo(11, 20);
            ctx.lineTo(5, 11);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = colorWithAlpha(accent, 0.86);
            ctx.beginPath();
            ctx.arc(0, -2, 3.8 + windup * 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = 'bold 11px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = colorWithAlpha(enemyColor, 0.92);
            ctx.fillText('X', 0, 15);

            ctx.globalAlpha = 0.44 + pulse * 0.24;
            ctx.fillStyle = colorWithAlpha('#ffb347', 0.86);
            ctx.beginPath();
            ctx.ellipse(-8, 27, 3.6, 10 + speed * 0.012, 0, 0, Math.PI * 2);
            ctx.ellipse(8, 27, 3.6, 10 + speed * 0.012, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            const hpRatio = Math.max(0, Math.min(1, (entity.hp || 0) / Math.max(1, entity.maxHp || 1)));
            ctx.save();
            ctx.globalAlpha = 0.72;
            ctx.fillStyle = 'rgba(0,0,0,0.52)';
            ctx.fillRect(entity.x - 34, entity.y - (entity.radius || 24) - 22, 68, 4);
            ctx.fillStyle = flash ? '#ffffff' : enemyColor;
            ctx.fillRect(entity.x - 34, entity.y - (entity.radius || 24) - 22, 68 * hpRatio, 4);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMatrixCrawlerEntity(entity, now) {
            drawMatrixCrawlerAggroIndicator(entity, now);
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
                drawMatrixCrawlerChampionOverlay(entity, now);
                return;
            }
            if (entity.type === 'crashBug') {
                drawMatrixCrawlerCrashBug(entity, now);
                drawMatrixCrawlerChampionOverlay(entity, now);
                return;
            }
            if (entity.type === 'firewallHost') {
                drawMatrixCrawlerFirewallHost(entity, now);
                drawMatrixCrawlerChampionOverlay(entity, now);
                return;
            }
            if (entity.type === 'shieldedPortNode') {
                drawMatrixCrawlerShieldedPortNode(entity, now);
                drawMatrixCrawlerChampionOverlay(entity, now);
                return;
            }
            if (entity.type === 'rebootingMalwareHusk') {
                drawMatrixCrawlerRebootingMalwareHusk(entity, now);
                drawMatrixCrawlerChampionOverlay(entity, now);
                return;
            }
            if (entity.type === 'firewallMask') {
                drawMatrixCrawlerFirewallMask(entity, now);
                return;
            }
            if (entity.type === 'exposedKernel') {
                drawMatrixCrawlerExposedKernel(entity, now);
                return;
            }
            if (entity.type === 'vectorInterceptor') {
                drawMatrixCrawlerVectorInterceptor(entity, now);
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
                drawMatrixCrawlerChampionOverlay(entity, now);
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
            drawMatrixCrawlerChampionOverlay(entity, now);
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
            if (p.kind === 'dataFragment') {
                const bob = Math.sin(p.pulse + now * 0.007) * 3;
                const x = p.x;
                const y = p.y + bob;
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.72 + pulse * 0.18;
                ctx.strokeStyle = colorWithAlpha(p.color || MATRIX_CRAWLER_COLORS.data, 0.72);
                ctx.fillStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.bg, 0.72);
                ctx.shadowColor = p.color || MATRIX_CRAWLER_COLORS.data;
                ctx.shadowBlur = glowEnabled ? 8 + pulse * 5 : 0;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x, y - 10);
                ctx.lineTo(x + 13, y);
                ctx.lineTo(x, y + 10);
                ctx.lineTo(x - 13, y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.font = "bold 10px 'Electrolize', sans-serif";
                ctx.fillStyle = p.color || MATRIX_CRAWLER_COLORS.data;
                ctx.fillText(p.char || '<>', x | 0, y | 0);
                ctx.restore();
                ctx.restore();
                return;
            }
            if (p.kind === 'minorCache') {
                const bob = Math.sin(p.pulse + now * 0.005) * 3;
                const x = p.x;
                const y = p.y + bob;
                const rewardColor = (p.reward && p.reward.color) || p.color || MATRIX_CRAWLER_COLORS.cache;
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.86 + pulse * 0.12;
                ctx.fillStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.bg, 0.82);
                ctx.strokeStyle = colorWithAlpha(rewardColor, 0.90);
                ctx.shadowColor = rewardColor;
                ctx.shadowBlur = glowEnabled ? 13 + pulse * 8 : 0;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect((x - 25) | 0, (y - 18) | 0, 50, 36);
                ctx.fill();
                ctx.stroke();
                ctx.shadowBlur = glowEnabled ? 7 : 0;
                ctx.font = "bold 15px 'Electrolize', sans-serif";
                ctx.fillStyle = MATRIX_CRAWLER_COLORS.white;
                ctx.fillText('[C]', x | 0, y | 0);
                ctx.shadowBlur = 0;
                ctx.font = "bold 8px 'Electrolize', sans-serif";
                ctx.fillStyle = colorWithAlpha(rewardColor, 0.86);
                ctx.fillText('MINOR CACHE', x | 0, (p.y + 32) | 0);
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
            if (p.reward) {
                ctx.shadowBlur = 0;
                ctx.font = "bold 9px 'Electrolize', sans-serif";
                ctx.fillStyle = colorWithAlpha(MATRIX_CRAWLER_COLORS.white, 0.72);
                ctx.fillText((p.reward.label || 'ITEM').slice(0, 18).toUpperCase(), p.x, p.y + 23);
            }
            ctx.restore();
        }

        function getMatrixCrawlerMinimapBaseCells(layout) {
            const id = layout && layout.id;
            if (id === 'compact') return [{ x: 0, y: 0 }];
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

        function getMatrixCrawlerMinimapEdgeCells(cells, dirId) {
            if (!cells || !cells.length) return [{ x: 0, y: 0 }];
            if (!dirId) return cells.slice();
            const minX = Math.min(...cells.map(cell => cell.x || 0));
            const maxX = Math.max(...cells.map(cell => cell.x || 0));
            const minY = Math.min(...cells.map(cell => cell.y || 0));
            const maxY = Math.max(...cells.map(cell => cell.y || 0));
            const edgeValue = dirId === 'N'
                ? minY
                : dirId === 'S'
                    ? maxY
                    : dirId === 'W'
                        ? minX
                        : maxX;
            const candidates = cells.filter(cell => {
                const value = dirId === 'N' || dirId === 'S' ? (cell.y || 0) : (cell.x || 0);
                return value === edgeValue;
            });
            return candidates.length ? candidates : cells.slice();
        }

        function getMatrixCrawlerMinimapEdgeCell(cells, dirId) {
            const candidates = getMatrixCrawlerMinimapEdgeCells(cells, dirId);
            const center = getMatrixCrawlerMinimapCellCenter(cells && cells.length ? cells : candidates);
            candidates.sort((a, b) => Math.hypot((a.x || 0) - center.x, (a.y || 0) - center.y)
                - Math.hypot((b.x || 0) - center.x, (b.y || 0) - center.y));
            return candidates[0] || { x: 0, y: 0 };
        }

        function getMatrixCrawlerMinimapConnectionCells(fromCells, toCells, dirId) {
            const opposite = getMatrixCrawlerOppositeDir(dirId);
            const fromCandidates = getMatrixCrawlerMinimapEdgeCells(fromCells, dirId);
            const toCandidates = getMatrixCrawlerMinimapEdgeCells(toCells, opposite);
            const horizontal = dirId === 'E' || dirId === 'W';
            const fromCenter = getMatrixCrawlerMinimapCellCenter(fromCells);
            const toCenter = getMatrixCrawlerMinimapCellCenter(toCells);
            let best = {
                fromCell: fromCandidates[0] || { x: 0, y: 0 },
                toCell: toCandidates[0] || { x: 0, y: 0 },
                score: Infinity
            };
            for (const fromCell of fromCandidates) {
                for (const toCell of toCandidates) {
                    const fromPerp = horizontal ? (fromCell.y || 0) : (fromCell.x || 0);
                    const toPerp = horizontal ? (toCell.y || 0) : (toCell.x || 0);
                    const centerPerp = horizontal
                        ? Math.abs(fromPerp - fromCenter.y) + Math.abs(toPerp - toCenter.y)
                        : Math.abs(fromPerp - fromCenter.x) + Math.abs(toPerp - toCenter.x);
                    const score = Math.abs(fromPerp - toPerp) * 10 + centerPerp;
                    if (score < best.score) best = { fromCell, toCell, score };
                }
            }
            return best;
        }

        function getMatrixCrawlerMinimapNeighborPosition(fromPosition, fromCells, toCells, dirId) {
            const dir = MATRIX_CRAWLER_DIRS.find(candidate => candidate.id === dirId);
            if (!dir) return { x: fromPosition.x, y: fromPosition.y };
            const connection = getMatrixCrawlerMinimapConnectionCells(fromCells, toCells, dirId);
            const fromCell = connection.fromCell || { x: 0, y: 0 };
            const toCell = connection.toCell || { x: 0, y: 0 };
            return {
                x: fromPosition.x + (fromCell.x || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD
                    + dir.x * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD
                    - (toCell.x || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD,
                y: fromPosition.y + (fromCell.y || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD
                    + dir.y * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD
                    - (toCell.y || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD
            };
        }

        function getMatrixCrawlerMinimapLayoutPositions(rooms, roomCells, state = matrixCrawlerState) {
            const visibleByKey = new Map((rooms || []).map(room => [room.key, room]));
            const positions = new Map();
            const firstRoom = visibleByKey.get(state && state.currentKey) || (rooms && rooms[0]) || null;
            if (!firstRoom) return positions;

            positions.set(firstRoom.key, { x: 0, y: 0 });
            const queue = [firstRoom];
            for (let i = 0; i < queue.length; i++) {
                const room = queue[i];
                const roomPosition = positions.get(room.key);
                const cells = roomCells.get(room.key) || [{ x: 0, y: 0 }];
                for (const dir of MATRIX_CRAWLER_DIRS) {
                    const neighborKey = room.neighbors && room.neighbors[dir.id];
                    const neighbor = neighborKey ? visibleByKey.get(neighborKey) : null;
                    if (!neighbor || positions.has(neighbor.key)) continue;
                    const neighborCells = roomCells.get(neighbor.key) || [{ x: 0, y: 0 }];
                    positions.set(neighbor.key, getMatrixCrawlerMinimapNeighborPosition(
                        roomPosition,
                        cells,
                        neighborCells,
                        dir.id
                    ));
                    queue.push(neighbor);
                }
            }

            for (const room of rooms || []) {
                if (positions.has(room.key)) continue;
                positions.set(room.key, {
                    x: room.x * MATRIX_CRAWLER_MINIMAP_ROOM_STRIDE,
                    y: room.y * MATRIX_CRAWLER_MINIMAP_ROOM_STRIDE
                });
            }
            return positions;
        }

        function getMatrixCrawlerMinimapCellCenter(cells) {
            if (!cells || !cells.length) return { x: 0, y: 0 };
            const minX = Math.min(...cells.map(cell => cell.x || 0));
            const maxX = Math.max(...cells.map(cell => cell.x || 0));
            const minY = Math.min(...cells.map(cell => cell.y || 0));
            const maxY = Math.max(...cells.map(cell => cell.y || 0));
            return {
                x: (minX + maxX) / 2,
                y: (minY + maxY) / 2
            };
        }

        function getMatrixCrawlerMinimapCells(room) {
            const layout = getMatrixCrawlerRoomLayout(room);
            const cells = getMatrixCrawlerMinimapBaseCells(layout);
            const center = getMatrixCrawlerMinimapCellCenter(cells);
            return cells.map(cell => ({
                x: (cell.x || 0) - center.x,
                y: (cell.y || 0) - center.y,
                s: cell.s || 1
            }));
        }

        function getMatrixCrawlerMinimapRenderCells(room, visibility = 'visited') {
            return getMatrixCrawlerMinimapCells(room);
        }

        function getMatrixCrawlerRoomMapVisibility(roomKey, state = matrixCrawlerState) {
            if (!state || !roomKey || !state.roomMap) return 'hidden';
            if (roomKey === state.currentKey) return 'current';
            const room = state.roomMap.get(roomKey);
            if (!room) return 'hidden';
            const discovered = state.discovered || new Set();
            if (discovered.has(roomKey)) return 'visited';
            if (room.hidden || room.secret || room.type === 'secret') return 'hidden';
            const visibleKeys = new Set(discovered);
            if (state.currentKey) visibleKeys.add(state.currentKey);
            for (const visibleKey of visibleKeys) {
                const visibleRoom = state.roomMap.get(visibleKey);
                if (!visibleRoom || !visibleRoom.neighbors) continue;
                if (Object.values(visibleRoom.neighbors).includes(roomKey)) return 'frontier';
            }
            return 'hidden';
        }

        function isMatrixCrawlerMinimapVisitedVisibility(visibility) {
            return visibility === 'current' || visibility === 'visited';
        }

        function getMatrixCrawlerMinimapRoomColor(room, visibility) {
            const theme = getMatrixCrawlerFloorTheme();
            if (visibility === 'current') return theme.white;
            if (visibility === 'frontier') return '#96aaa1';
            if (room.type === 'boss') return theme.danger;
            if (room.type === 'treasure') return theme.coin;
            if (room.type === 'shop') return theme.shop;
            if (room.type === 'challenge') return theme.accent || '#d884ff';
            if (room.type === 'secret') return '#b6ffde';
            return theme.glow;
        }

        function getMatrixCrawlerMinimapRoomIcon(room, visibility = 'visited') {
            if (visibility === 'frontier') return '';
            if (room.type === 'boss') return '!';
            if (room.type === 'treasure') return '+';
            if (room.type === 'shop') return 'U';
            if (room.type === 'challenge') return '*';
            if (room.type === 'secret') return '?';
            return '';
        }

        function drawMatrixCrawlerMinimap(now) {
            const state = matrixCrawlerState;
            const theme = getMatrixCrawlerFloorTheme();
            const pauseMap = gameState === 'PAUSED' && pauseReturnState === MATRIX_CRAWLER_GAME_STATE;
            const panelW = pauseMap ? 340 : 282;
            const panelH = pauseMap ? 238 : 198;
            const mapAlpha = pauseMap ? 0.78 : 0.50;
            const cx = width - (pauseMap ? 196 : 164);
            const cy = pauseMap ? 152 : 128;
            const visibilityByKey = new Map();
            const rooms = state.rooms.filter(room => {
                const visibility = getMatrixCrawlerRoomMapVisibility(room.key, state);
                if (visibility === 'hidden') return false;
                visibilityByKey.set(room.key, visibility);
                return true;
            });
            const footprints = [];
            const roomCells = new Map();
            for (const room of rooms) {
                const visibility = visibilityByKey.get(room.key) || 'hidden';
                const cells = getMatrixCrawlerMinimapRenderCells(room, visibility);
                roomCells.set(room.key, cells);
            }
            const roomPositions = getMatrixCrawlerMinimapLayoutPositions(rooms, roomCells, state);
            const getRoomMapPosition = room => roomPositions.get(room.key) || {
                x: room.x * MATRIX_CRAWLER_MINIMAP_ROOM_STRIDE,
                y: room.y * MATRIX_CRAWLER_MINIMAP_ROOM_STRIDE
            };
            for (const room of rooms) {
                const visibility = visibilityByKey.get(room.key) || 'hidden';
                const roomPosition = getRoomMapPosition(room);
                const cells = roomCells.get(room.key) || [{ x: 0, y: 0, s: 1 }];
                for (const cell of cells) {
                    footprints.push({
                        room,
                        visibility,
                        x: roomPosition.x + (cell.x || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD,
                        y: roomPosition.y + (cell.y || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD,
                        scale: cell.s || 1
                    });
                }
            }
            const visibilityRank = visibility => visibility === 'current' ? 2 : visibility === 'visited' ? 1 : 0;
            footprints.sort((a, b) => visibilityRank(a.visibility) - visibilityRank(b.visibility));
            const minX = footprints.length ? Math.min(...footprints.map(p => p.x)) : -1;
            const maxX = footprints.length ? Math.max(...footprints.map(p => p.x)) : 1;
            const minY = footprints.length ? Math.min(...footprints.map(p => p.y)) : -1;
            const maxY = footprints.length ? Math.max(...footprints.map(p => p.y)) : 1;
            const spanX = Math.max(1.2, maxX - minX + 1.2);
            const spanY = Math.max(1.2, maxY - minY + 1.2);
            const maxUnit = pauseMap ? 20 : 16;
            const unit = Math.max(4, Math.min(maxUnit, (panelW - 24) / spanX, (panelH - 22) / spanY));
            const block = unit;
            const cellGap = Math.max(1, Math.min(2, block * 0.1));
            const midX = (minX + maxX) / 2;
            const midY = (minY + maxY) / 2;
            const toScreen = (mx, my) => ({
                x: cx + (mx - midX) * unit,
                y: cy + (my - midY) * unit
            });
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = colorWithAlpha(theme.glow, 0.28 * mapAlpha);
            for (const room of rooms) {
                const roomVisibility = visibilityByKey.get(room.key) || 'hidden';
                for (const dir of MATRIX_CRAWLER_DIRS) {
                    const neighbor = room.neighbors && room.neighbors[dir.id] ? state.roomMap.get(room.neighbors[dir.id]) : null;
                    const neighborVisibility = neighbor ? visibilityByKey.get(neighbor.key) : 'hidden';
                    if (!neighbor || neighborVisibility === 'hidden') continue;
                    if (dir.id !== 'E' && dir.id !== 'S') continue;
                    if (!isMatrixCrawlerMinimapVisitedVisibility(roomVisibility)
                        && !isMatrixCrawlerMinimapVisitedVisibility(neighborVisibility)) continue;
                    const frontierLink = roomVisibility === 'frontier' || neighborVisibility === 'frontier';
                    const roomPosition = getRoomMapPosition(room);
                    const neighborPosition = getRoomMapPosition(neighbor);
                    const connection = getMatrixCrawlerMinimapConnectionCells(
                        roomCells.get(room.key),
                        roomCells.get(neighbor.key),
                        dir.id
                    );
                    const fromCenter = toScreen(
                        roomPosition.x + ((connection.fromCell && connection.fromCell.x) || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD,
                        roomPosition.y + ((connection.fromCell && connection.fromCell.y) || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD
                    );
                    const toCenter = toScreen(
                        neighborPosition.x + ((connection.toCell && connection.toCell.x) || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD,
                        neighborPosition.y + ((connection.toCell && connection.toCell.y) || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD
                    );
                    const from = {
                        x: fromCenter.x + dir.x * block * 0.5,
                        y: fromCenter.y + dir.y * block * 0.5
                    };
                    const to = {
                        x: toCenter.x - dir.x * block * 0.5,
                        y: toCenter.y - dir.y * block * 0.5
                    };
                    ctx.strokeStyle = frontierLink
                        ? colorWithAlpha('#96aaa1', 0.18 * mapAlpha)
                        : colorWithAlpha(theme.glow, 0.28 * mapAlpha);
                    ctx.lineWidth = frontierLink
                        ? Math.max(1.5, block * 0.16)
                        : Math.max(2, block * 0.22);
                    ctx.lineCap = 'butt';
                    ctx.lineJoin = 'miter';
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    if (dir.id === 'E' || dir.id === 'W') {
                        const midX = (from.x + to.x) / 2;
                        ctx.lineTo(midX, from.y);
                        if (Math.abs(to.y - from.y) > 0.5) ctx.lineTo(midX, to.y);
                        ctx.lineTo(to.x, to.y);
                    } else {
                        const midY = (from.y + to.y) / 2;
                        ctx.lineTo(from.x, midY);
                        if (Math.abs(to.x - from.x) > 0.5) ctx.lineTo(to.x, midY);
                        ctx.lineTo(to.x, to.y);
                    }
                    ctx.stroke();
                }
            }
            for (const footprint of footprints) {
                const room = footprint.room;
                const visibility = footprint.visibility || visibilityByKey.get(room.key) || 'hidden';
                const p = toScreen(footprint.x, footprint.y);
                const size = block * footprint.scale;
                const drawSize = Math.max(2, size - cellGap);
                const isCurrent = visibility === 'current';
                const isFrontier = visibility === 'frontier';
                ctx.fillStyle = getMatrixCrawlerMinimapRoomColor(room, visibility);
                ctx.strokeStyle = isCurrent
                    ? colorWithAlpha(theme.white, 0.95)
                    : isFrontier
                        ? colorWithAlpha('#d7e0db', 0.34)
                    : colorWithAlpha('#00150a', 0.86);
                ctx.globalAlpha = mapAlpha * (isCurrent ? 1 : isFrontier ? 0.36 : 0.88);
                ctx.fillRect(p.x - drawSize / 2, p.y - drawSize / 2, drawSize, drawSize);
                ctx.strokeRect(p.x - drawSize / 2 + 0.5, p.y - drawSize / 2 + 0.5, drawSize - 1, drawSize - 1);
            }
            for (const room of rooms) {
                const visibility = visibilityByKey.get(room.key) || 'hidden';
                const icon = getMatrixCrawlerMinimapRoomIcon(room, visibility);
                if (!icon) continue;
                const iconCell = getMatrixCrawlerMinimapEdgeCell(roomCells.get(room.key));
                const roomPosition = getRoomMapPosition(room);
                const p = toScreen(
                    roomPosition.x + ((iconCell && iconCell.x) || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD,
                    roomPosition.y + ((iconCell && iconCell.y) || 0) * MATRIX_CRAWLER_MINIMAP_CELL_SPREAD
                );
                ctx.globalAlpha = mapAlpha * 0.92;
                ctx.font = "bold 9px 'Electrolize', sans-serif";
                ctx.fillStyle = room.key === state.currentKey ? '#00170c' : '#00120a';
                ctx.fillText(icon, p.x, p.y + 0.5);
            }
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

        function drawMatrixCrawlerSharedProjectileVisual(p, now) {
            const stats = p.stats || {};
            let scale = Math.max(0.65, stats.sizeMult || 1);
            if (stats.pathFunction === 'parabolic') {
                const arc = Math.sin((p.life / Math.max(0.001, p.maxLife || p.life || 1)) * Math.PI);
                scale *= (1 + Math.max(0, arc) * 1.55);
            }
            if ((p.isPlasmaCloud || stats.plasmaCloud) && typeof drawPlasmaCloudProjectile === 'function') {
                const cloudScale = scale * (typeof getPlasmaCloudGrowthFactor === 'function' ? getPlasmaCloudGrowthFactor(p) : 1);
                drawPlasmaCloudProjectile(p, now, cloudScale);
                return;
            }
            if ((p.isMiniTorpedo || stats.miniTorpedo) && typeof drawMiniTorpedoProjectile === 'function') {
                drawMiniTorpedoProjectile(p, now, scale);
                return;
            }
            if ((p.isLightningBall || stats.lightningBall) && typeof drawLightningBallProjectile === 'function') {
                drawLightningBallProjectile(p, now, scale);
                return;
            }

            const alpha = Math.max(0.16, Math.min(1, p.life / Math.max(0.001, p.maxLife)));
            const char = p.sprite || p.char || '|';
            const color = p.color || MATRIX_CRAWLER_COLORS.white;
            const fontSize = p.isBombShrapnel ? 20 : (p.isBurstRound ? 22 : Math.max(14, Math.round(23 * scale)));
            const font = `bold ${fontSize}px Courier New`;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(p.x | 0, p.y | 0);
            if (!p.isBombShrapnel) ctx.rotate(getMatrixCrawlerProjectileGlyphRotation(p));
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = font;
            ctx.fillStyle = color;
            const softGlow = typeof isCheapSoftGlowQuality === 'function' && isCheapSoftGlowQuality();
            const glowOn = typeof isGlowRenderingEnabled === 'function'
                ? isGlowRenderingEnabled()
                : !!glowEnabled;
            const useCachedGlow = glowOn
                && !softGlow
                && typeof drawCachedGlowGlyph === 'function'
                && (typeof shouldUseCachedGlowSprite !== 'function' || shouldUseCachedGlowSprite('normal'));
            if (useCachedGlow) {
                drawCachedGlowGlyph(ctx, char, 0, 0, font, color, color, p.isBurstRound ? 10 : 8);
            } else {
                if (softGlow && typeof drawCheapGlowGlyph === 'function') {
                    drawCheapGlowGlyph(ctx, char, 0, 0, font, color, {
                        alpha: p.isBurstRound || p.isRicochetShard ? 0.15 : 0.105,
                        echoAlpha: p.isBurstRound || p.isRicochetShard ? 0.07 : 0.052,
                        sizeBoost: 1.18,
                        maxFontSize: Math.max(24, fontSize + 6)
                    });
                } else if (glowOn && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('normal'))) {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = p.isBurstRound || p.isRicochetShard ? 9 : 7;
                }
                ctx.fillText(char, 0, 0);
            }
            if (p.isBurstRound) {
                ctx.shadowBlur = 0;
                ctx.globalAlpha = alpha * 0.82;
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 8px Courier New';
                ctx.fillText('.', 0, -5);
            } else if (p.isRicochetShard) {
                ctx.shadowBlur = 0;
                ctx.globalAlpha = alpha * 0.55;
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px Courier New';
                ctx.fillText('.', 0, 0);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
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
            const theme = getMatrixCrawlerFloorTheme();
            ctx.save();
            ctx.fillStyle = theme.bg;
            ctx.fillRect(0, 0, width, height);
            ctx.save();
            ctx.beginPath();
            ctx.rect(viewport.x, viewport.y, viewport.w, viewport.h);
            ctx.clip();
            ctx.translate(viewport.x - cameraX, viewport.y - cameraY);
            drawMatrixCrawlerGrid(rect, now);
            drawMatrixCrawlerFocusFloorWarp(rect, now);
            drawMatrixCrawlerBlockedArea(room, rect, now);
            drawMatrixCrawlerTerrain(room, now);
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
                        angle: p.isBombShrapnel ? null : getMatrixCrawlerProjectileGlyphRotation(p),
                        scale: stats.sizeMult || 1,
                        alphaScale: 0.9,
                        glow: 8
                    });
                    continue;
                }
                drawMatrixCrawlerSharedProjectileVisual(p, now);
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
            drawMatrixCacheDaemon(now);
            drawMatrixCrawlerRobot(now);
            drawMatrixCrawlerGlobalDebris();
            if (state.roomFlash > 0) {
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = state.roomFlash * 0.18;
                ctx.fillStyle = theme.glow;
                ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1;
            }
            ctx.restore();
            drawMatrixCrawlerFocusViewportOverlay(viewport, now);
            ctx.strokeStyle = colorWithAlpha(theme.glow, 0.46);
            ctx.lineWidth = 2;
            ctx.shadowColor = theme.glow;
            ctx.shadowBlur = glowEnabled ? 10 : 0;
            ctx.strokeRect(viewport.x + 0.5, viewport.y + 0.5, viewport.w - 1, viewport.h - 1);
            ctx.shadowBlur = 0;
            drawMatrixCrawlerBossBar(viewport);
            if (state.messageTimer > 0 && state.message) {
                ctx.textAlign = 'center';
                ctx.font = "bold 18px 'Electrolize', sans-serif";
                ctx.fillStyle = theme.white;
                ctx.shadowBlur = glowEnabled ? 12 : 0;
                ctx.fillText(state.message, width / 2, Math.min(height - HUD_HEIGHT - 8, viewport.bottom + 24));
            }
            drawMatrixCrawlerMinimap(now);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }
