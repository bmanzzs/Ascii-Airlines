        // Pure wave and boss definition data. Loaded before waves.js; runtime spawning stays in waves.js.
        const MATRIX_HYDRA_SPRITE = [
            "      /\\      ",
            "   __/==\\__   ",
            "  <_  ><  _>  ",
            "    \\_||_/    ",
            "  ==-[##]-==  ",
            "    /_||_\\    ",
            "  <_  ><  _>  ",
            "   --\\==/--   ",
            "      \\/      "
        ];
        const AXIOM_CORE_SPRITE = [
            "     .-====-.     ",
            "   .'  .--.  '.   ",
            "  /  <|####|>  \\  ",
            " |  ==|####|==  | ",
            " |  < |####| >  | ",
            "  \\  <|####|>  /  ",
            "   '.  '--'  .'   ",
            "     '-====-'     "
        ];
        const BLACK_VOID_BOSS_WAVE = Object.freeze({ isBoss: true, name: 'BLACK VOID', sprite: BLACK_VOID_SPRITE, hp: 2000 });
        const BATTLE_STARSHIP_BOSS_WAVE = Object.freeze({ isBoss: true, name: 'BATTLE STARSHIP', sprite: BATTLE_STARSHIP_SPRITE, hp: 2400 });
        const DREAD_LITURGY_BOSS_WAVE = Object.freeze({ isBoss: true, name: 'DREAD LITURGY', sprite: DREAD_LITURGY_SPRITE, hp: 2850, galaxyBossType: 'dreadLiturgy' });
        const GALAXY_TWO_LEGACY_WAVES = Object.freeze({
            26: { count: 12, color: '#ff00ff', type: 'wave2', speed: 0.85, stagger: 0.62, doubleElite: true, firePattern: 'splitFan', fireEveryNth: 4, fireInterval: 2.5 },
            27: { count: 14, color: '#ff0088', type: 'wave4', speed: 0.82, stagger: 0.58, doubleElite: true, firePattern: 'downFan', fireEveryNth: 4, fireInterval: 2.4 },
            28: { count: 13, color: '#00ffff', type: 'wave7', speed: 0.86, stagger: 0.42, doubleElite: true, firePattern: 'spiralNeedle', fireEveryNth: 4, fireInterval: 2.6 },
            29: { count: 14, color: '#ff00ff', type: 'wave8', speed: 0.78, stagger: 1.6, doubleElite: true, firePattern: 'scatterMark', fireEveryNth: 5, fireInterval: 2.6 }
        });
        const SIGNAL_DRIFT_POOL = [
            {
                id: 'mirror',
                name: 'MIRROR SIGNAL',
                hudLabel: 'MIRRORED ROUTES',
                hudDesc: '',
                desc: 'Enemy routes are reflected across the starfield.',
                color: '#8ff7ff'
            },
            {
                id: 'surge',
                name: 'OVERDRIVE CURRENT',
                hudLabel: 'FAST BRITTLE SURGE',
                hudDesc: '',
                desc: 'Enemies move faster but their hulls run brittle.',
                color: '#ff6fae'
            },
            {
                id: 'crossfire',
                name: 'CROSSFIRE ECHO',
                hudLabel: 'CROSSFIRE REMIX',
                hudDesc: '',
                desc: 'A few extra ships carry remixed weapon patterns.',
                color: '#fff07a'
            },
            {
                id: 'vanguard',
                name: 'VANGUARD STATIC',
                hudLabel: 'SIDE PATROL',
                hudDesc: '',
                desc: 'Side patrols slip into the wave.',
                color: '#9bffcf'
            }
        ];

        const EARLY_PROCEDURAL_WAVE_COUNT = 4;
        const EARLY_PROCEDURAL_THEMES = {
            swarm: {
                id: 'swarm',
                name: 'SWARM',
                hudLabel: 'TEST SWARM',
                hudDesc: 'LIGHT PACK',
                color: '#8ff7ff',
                minWave: 1
            },
            patrol: {
                id: 'patrol',
                name: 'PATROL',
                hudLabel: 'TEST PATROL',
                hudDesc: 'STANDARD ROUTE',
                color: '#9bffcf',
                minWave: 1
            },
            flankers: {
                id: 'flankers',
                name: 'FLANKERS',
                hudLabel: 'TEST FLANKERS',
                hudDesc: 'SIDE ENTRY',
                color: '#77ffe7',
                minWave: 2
            },
            bruisers: {
                id: 'bruisers',
                name: 'BRUISERS',
                hudLabel: 'TEST BRUISERS',
                hudDesc: 'TOUGHER FEW',
                color: '#ffb36b',
                minWave: 2
            },
            crossfire: {
                id: 'crossfire',
                name: 'CROSSFIRE',
                hudLabel: 'TEST CROSSFIRE',
                hudDesc: 'LIGHT FIRING',
                color: '#fff07a',
                minWave: 3
            },
            drift: {
                id: 'drift',
                name: 'DRIFT',
                hudLabel: 'TEST DRIFT',
                hudDesc: 'ODD ROUTE',
                color: '#b9a6ff',
                minWave: 1
            }
        };
        const EARLY_PROCEDURAL_THEME_IDS = ['swarm', 'patrol', 'flankers', 'bruisers', 'crossfire', 'drift'];

        const CAMPAIGN_WAVE_DEFINITIONS = [
                { count: 9, color: '#ff00ff', type: 'zig1', speed: 0.72, stagger: 0.72 }, // Wave 1
                { count: 12, color: '#00ffff', type: 'wave3', speed: 0.5632, stagger: 0.7 }, // Wave 2
                { count: 11, color: '#ff0088', type: 'wave2', speed: 0.63, stagger: 0.68, reversePath: true }, // Wave 3
                { count: 13, color: '#ff00ff', type: 'wave4', speed: 0.656, stagger: 0.74, alternateSideSpawn: true, firePattern: 'downFan', fireEveryNth: 6, fireInterval: 2.9 }, // Wave 4
                { isBoss: true, name: 'NULL PHANTOM', sprite: NULL_PHANTOM_SOURCE, hp: 1000 }, // Wave 5
                { count: 18, color: '#ff0088', type: 'wave6', speed: 0.726, stagger: 0.68, elite: true, firePattern: 'downFan', fireEveryNth: 5, fireInterval: 2.8 }, // Wave 6
                { count: 12, color: '#00ffff', type: 'wave7', speed: 0.656, stagger: 0.36, elite: true, firePattern: 'aimedPulse', fireEveryNth: 4, fireInterval: 2.6 }, // Wave 7
                { count: 12, color: '#ff00ff', type: 'wave8', speed: 0.72, stagger: 2.25, elite: true, firePattern: 'aimedPulse', fireEveryNth: 4, fireInterval: 3.0 }, // Wave 8
                { count: 14, color: '#ff0088', type: 'wave9', speed: 0.95, stagger: 0.34, firePattern: 'splitFan', fireEveryNth: 5, fireInterval: 2.7 }, // Wave 9
                { isBoss: true, name: 'DISTORTED GLITCH', sprite: GLITCH_SPRITE_1, hp: 1250 }, // Wave 10
                { count: 14, color: '#ff00ff', type: 'zig2', speed: 0.64, stagger: 0.42, doubleElite: true, firePattern: 'downFan', fireEveryNth: 5, fireInterval: 2.5 }, // Wave 11
                { count: 14, color: '#ff0088', type: 'zig5', speed: 0.64, stagger: 0.48, doubleElite: true, firePattern: 'splitFan', fireEveryNth: 5, fireInterval: 2.6 }, // Wave 12
                { count: 30, color: '#ff0000', type: 'snake', speed: 0.72, stagger: 2.0, elite: true }, // Wave 13
                { count: 14, color: '#ff00ff', type: 'braidDive', speed: 0.78, stagger: 0.52, routeDuration: 8.2, doubleElite: true, singleRibbon: true, braidTrail: true, firePattern: 'splitFan', fireEveryNth: 4, fireInterval: 2.5 }, // Wave 14
                { isBoss: true, name: 'GHOST SIGNAL', sprite: GHOST_SIGNAL_SOURCE, hp: 1600 }, // Wave 15
                { count: 14, color: '#ff00ff', type: 'weave', speed: 0.46, elite: true, hpMult: 2, weaveLaneCount: 3, weaveGroupDelay: 0.92, weaveIntraDelay: 0.18, weaveLaneSpread: 0.54, weaveAmplitudeRatio: 0.1, weaveFrequency: 2.25, weaveVerticalSpeed: 112, sideEntrySlots: [1, 5, 9, 12], routeDuration: 9.4, firePattern: 'aimedPulse', fireEveryNth: 5, fireInterval: 2.8 }, // Wave 16
                { count: 13, color: '#00ffff', type: 'arcCascade', speed: 0.88, elite: true, hpMult: 3, stagger: 0.62, routeDuration: 10.2, firePattern: 'spiralNeedle', fireEveryNth: 5, fireInterval: 2.5 }, // Wave 17
                { count: 12, color: '#ff0088', type: 'risingStar', speed: 0.9, elite: true, hpMult: 2.5, stagger: 0.58, routeDuration: 11.0, riseTime: 1.65, firePattern: 'crossDrop', fireEveryNth: 3, fireInterval: 2.8 }, // Wave 18
                { count: 16, color: '#ff00ff', type: 'constellationSweep', speed: 0.76, elite: true, hpMult: 2.2, stagger: 0.5, routeDuration: 10.8, firePattern: 'splitFan', fireEveryNth: 5, fireInterval: 3.0 }, // Wave 19
                { isBoss: true, name: 'OVERHEATING FIREWALL', sprite: FIREWALL_SPRITE, hp: 1000 }, // Wave 20
                { count: 17, customType: 'neonCrown' }, // Wave 21
                { count: 14, customType: 'sidewinderLattice' }, // Wave 22
                { count: 17, customType: 'helixNeedle' }, // Wave 23
                { count: 18, customType: 'royalCrossfire' }, // Wave 24
                { isBoss: true, name: 'TURNBOUND TRINITY', sprite: TURNBOUND_TRINITY_RENDER_SPRITE, hp: 2300, galaxyBossType: 'turnboundTrinity' }, // Wave 25
                { count: 16, customType: 'sutureChoir' }, // Wave 26
                { count: 18, customType: 'razorParallax' }, // Wave 27
                { count: 19, customType: 'graveOrbit' }, // Wave 28
                { count: 20, customType: 'omenLattice' }, // Wave 29
                DREAD_LITURGY_BOSS_WAVE, // Wave 30
                { count: 17, customType: 'prismRift' }, // Wave 31 - Prism Conduit mini-boss
                { count: 18, customType: 'phaseCorridor' }, // Wave 32
                { count: 19, customType: 'latticeBloom' }, // Wave 33
                { count: 20, customType: 'braidCrucible' }, // Wave 34
                { isBoss: true, name: 'ECLIPSE WARDEN', sprite: ECLIPSE_WARDEN_SPRITE, hp: 2600 } // Wave 35
            ];
