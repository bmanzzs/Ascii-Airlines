        // Wave sequencing and enemy formation spawning. See js/README.md for load order and ownership.
        const NON_BOSS_ENEMY_FIRE_INTERVAL_MULT = 1.18;
        const NON_BOSS_ENEMY_RANDOM_FIRE_CHANCE = 0.007;
        const NON_BOSS_ENEMY_AIM_TARGET_JITTER = 56;
        const NON_BOSS_ENEMY_AIM_ANGLE_JITTER = 0.12;
        const NON_BOSS_ENEMY_SHOT_SPEED_JITTER = 0.04;
        const GALAXY_ONE_RUN_WAVE_LIMIT = 30;
        const GALAXY_TWO_RUN_WAVE_LIMIT = 20;
        const GALAXY_RUN_WAVE_LIMIT = GALAXY_ONE_RUN_WAVE_LIMIT;

        function getGalaxyRunWaveLimit(galaxyIndex = 0) {
            if (typeof GALAXY_DEFINITIONS !== 'undefined') {
                const galaxy = GALAXY_DEFINITIONS[galaxyIndex];
                if (galaxy && galaxy.mode === 'survivor') return 0;
            }
            return galaxyIndex === 1 ? GALAXY_TWO_RUN_WAVE_LIMIT : GALAXY_ONE_RUN_WAVE_LIMIT;
        }
        const GALAXY_DEFINITIONS = Object.freeze([
            {
                id: 'neon-rift',
                title: 'BINARY QUASAR',
                name: 'BINARY QUASAR',
                desc: 'A silver logic storm where every spiral arm resolves into zeroes, ones, and hostile machine light.',
                available: true,
                colors: ['#dcecff', '#8fa7c9', '#ffffff'],
                coreColor: '#ffffff',
                glyphs: ['1', '0'],
                coreGlyph: '0',
                coreVoidGlyph: '1',
                visualStyle: 'binaryQuasar',
                arms: 3,
                tilt: 0.48,
                twist: 2.8,
                seed: 11
            },
            {
                id: 'void-circuit',
                title: 'MATRIX NEBULA',
                name: 'MATRIX NEBULA',
                desc: 'A green code-cloud route through corrupted math, synthetic dark matter, and falling command rain.',
                available: true,
                colors: ['#007a3a', '#25b85b', '#f2fff6'],
                coreColor: '#f2fff6',
                glyphs: ['0', '1', '|', ':', ';', '.', '/', '\\'],
                coreGlyph: '1',
                coreVoidGlyph: '0',
                visualStyle: 'matrixNebula',
                arms: 2,
                tilt: 0.38,
                twist: 3.55,
                seed: 29
            },
            {
                id: 'rose-quasar',
                title: 'FRACTAL HALO',
                name: 'FRACTAL HALO',
                desc: 'Locked sector. Recursive arms fold into an impossible fractal orbit.',
                available: false,
                colors: ['#ff7ab8', '#8fb8ff', '#fff0fa'],
                coreColor: '#fff0fa',
                glyphs: ['{', '}', '(', ')', '∞', '∂', '∑', '.'],
                coreGlyph: '∞',
                coreVoidGlyph: '∂',
                visualStyle: 'fractalHalo',
                arms: 4,
                tilt: 0.58,
                twist: 2.35,
                seed: 47
            },
            {
                id: 'amber-halo',
                title: 'KERNEL CORONA',
                name: 'KERNEL CORONA',
                desc: 'Locked sector. A hot hardware crown of brackets, buses, and guarded memory.',
                available: false,
                colors: ['#ff8a1c', '#ff5f00', '#7cc7ff'],
                coreColor: '#7cc7ff',
                glyphs: ['#', '/', '\\', '|', '[', ']', '{', '}'],
                coreGlyph: '#',
                coreVoidGlyph: '|',
                visualStyle: 'kernelEye',
                arms: 2,
                tilt: 0.52,
                twist: 2.95,
                seed: 73
            },
            {
                id: 'glass-nebula',
                title: 'TENSOR MIRAGE',
                name: 'TENSOR MIRAGE',
                desc: 'Locked sector. Dimensional notation bends into a glassy false horizon.',
                available: false,
                colors: ['#6aa8ff', '#ff5e8a', '#dcecff'],
                coreColor: '#dcecff',
                glyphs: ['λ', 'π', 'Σ', 'Δ', '∇', '×', '⊗', '.'],
                coreGlyph: '⊗',
                coreVoidGlyph: 'λ',
                arms: 5,
                tilt: 0.44,
                twist: 1.95,
                seed: 101
            },
            {
                id: 'red-dwarf',
                title: 'BITSHIFT DWARF',
                name: 'BITSHIFT DWARF',
                desc: 'Locked sector. A compact red processor star rotating through operators and overflow dust.',
                available: false,
                colors: ['#ff4f4a', '#ff9a73', '#fff1e8'],
                coreColor: '#fff1e8',
                glyphs: ['<', '>', '^', 'v', '/', '\\', '0', '1'],
                coreGlyph: '>',
                coreVoidGlyph: '<',
                visualStyle: 'bitshiftSphere',
                arms: 3,
                tilt: 0.62,
                twist: 3.2,
                seed: 137
            },
            {
                id: 'prism-wake',
                title: 'PRISM WAKE',
                name: 'PRISM WAKE',
                desc: 'A radiant survival anomaly: endless swarms, locked camera, auto-fire, and ship-to-ship horde pressure.',
                available: true,
                mode: 'survivor',
                visualStyle: 'prismWake',
                colors: ['#61f7ff', '#ffe66d', '#ff5edb', '#7cff9b', '#ffffff'],
                coreColor: '#ffffff',
                glyphs: ['▲', '▶', '▼', '◀', '⯅', '⯆', '⯇', '⯈', '▴', '▸', '▾', '◂'],
                coreGlyph: '▲',
                coreVoidGlyph: '▼',
                arms: 6,
                tilt: 0.72,
                twist: 4.4,
                seed: 211
            }
        ]);
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
        let waveSignalNotice = null;
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

        function attachEarlyProceduralTheme(waveDef, waveNumber, theme) {
            return {
                ...waveDef,
                isEarlyProcedural: true,
                proceduralWaveNumber: waveNumber,
                proceduralThemeId: theme.id,
                proceduralThemeName: theme.name,
                proceduralHudLabel: theme.hudLabel,
                proceduralHudDesc: theme.hudDesc,
                proceduralColor: theme.color
            };
        }

        function buildEarlyProceduralWaveDef(waveNumber, themeId) {
            const theme = EARLY_PROCEDURAL_THEMES[themeId] || EARLY_PROCEDURAL_THEMES.patrol;
            const tier = Math.max(0, Math.min(3, waveNumber - 1));
            const simpleTypes = ['zig1', 'wave2', 'wave3'];

            if (theme.id === 'swarm') {
                return attachEarlyProceduralTheme({
                    count: [10, 12, 14, 15][tier],
                    color: '#8ff7ff',
                    type: simpleTypes[(waveNumber + pickRandomIntInclusive(0, 1)) % simpleTypes.length],
                    speed: [0.56, 0.59, 0.62, 0.64][tier],
                    stagger: [0.80, 0.72, 0.66, 0.62][tier],
                    weakOnly: true
                }, waveNumber, theme);
            }

            if (theme.id === 'flankers') {
                return attachEarlyProceduralTheme({
                    count: [8, 9, 11, 12][tier],
                    color: '#77ffe7',
                    type: 'wave4',
                    speed: [0.54, 0.56, 0.60, 0.63][tier],
                    stagger: [0.86, 0.82, 0.74, 0.68][tier],
                    alternateSideSpawn: true
                }, waveNumber, theme);
            }

            if (theme.id === 'bruisers') {
                return attachEarlyProceduralTheme({
                    count: [6, 6, 7, 8][tier],
                    color: '#ffb36b',
                    type: simpleTypes[(waveNumber + pickRandomIntInclusive(0, 2)) % simpleTypes.length],
                    speed: [0.50, 0.53, 0.56, 0.58][tier],
                    stagger: [0.96, 0.90, 0.84, 0.78][tier],
                    enemyHpMult: [1.12, 1.18, 1.28, 1.38][tier],
                    elite: waveNumber >= 3
                }, waveNumber, theme);
            }

            if (theme.id === 'crossfire') {
                return attachEarlyProceduralTheme({
                    count: [7, 8, 9, 10][tier],
                    color: '#fff07a',
                    type: waveNumber >= 4 ? 'wave4' : 'wave2',
                    speed: [0.52, 0.54, 0.56, 0.58][tier],
                    stagger: [0.92, 0.88, 0.84, 0.78][tier],
                    firePattern: waveNumber >= 4 ? 'downFan' : 'aimedPulse',
                    fireEveryNth: waveNumber >= 4 ? 4 : 5,
                    fireInterval: waveNumber >= 4 ? 3.05 : 3.35,
                    fireOffset: 0.28
                }, waveNumber, theme);
            }

            if (theme.id === 'drift') {
                if (waveNumber <= 1) {
                    return attachEarlyProceduralTheme({
                        count: 8,
                        color: '#b9a6ff',
                        type: 'wave3',
                        speed: 0.52,
                        stagger: 0.86,
                        weakOnly: true
                    }, waveNumber, theme);
                }
                return attachEarlyProceduralTheme({
                    count: [7, 8, 9, 10][tier],
                    color: '#b9a6ff',
                    type: 'weave',
                    speed: [0.36, 0.38, 0.42, 0.45][tier],
                    hpMult: [0.9, 0.95, 1.0, 1.05][tier],
                    weaveLaneCount: waveNumber >= 4 ? 3 : 2,
                    weaveGroupDelay: [0.92, 0.86, 0.82, 0.78][tier],
                    weaveIntraDelay: 0.16,
                    weaveLaneSpread: waveNumber >= 4 ? 0.46 : 0.38,
                    weaveAmplitudeRatio: [0.065, 0.075, 0.085, 0.095][tier],
                    weaveFrequency: [1.65, 1.85, 2.05, 2.20][tier],
                    weaveVerticalSpeed: [98, 104, 110, 116][tier],
                    sideEntrySlots: waveNumber >= 3 ? [1, 5] : [],
                    routeDuration: [8.2, 8.0, 7.8, 7.6][tier],
                    stagger: [0.74, 0.68, 0.64, 0.60][tier]
                }, waveNumber, theme);
            }

            return attachEarlyProceduralTheme({
                count: [8, 10, 11, 12][tier],
                color: '#9bffcf',
                type: simpleTypes[(waveNumber + pickRandomIntInclusive(0, 2)) % simpleTypes.length],
                speed: [0.58, 0.61, 0.64, 0.66][tier],
                stagger: [0.78, 0.72, 0.66, 0.60][tier],
                elite: waveNumber >= 4
            }, waveNumber, theme);
        }

        function cloneWaveDefinition(waveDef, overrides = {}) {
            if (!waveDef) return null;
            return { ...waveDef, ...overrides };
        }

        function tuneEarlyProceduralWaveForGalaxy(waveDef, difficultyScale = 1) {
            if (!waveDef || difficultyScale <= 1.001) return waveDef;
            const tuned = { ...waveDef };
            tuned.count = Math.max(1, Math.round((tuned.count || 1) + (tuned.proceduralWaveNumber >= 3 ? 2 : 1)));
            if (typeof tuned.speed === 'number') tuned.speed = +(tuned.speed * Math.min(1.12, difficultyScale)).toFixed(3);
            if (typeof tuned.stagger === 'number') tuned.stagger = +(tuned.stagger * 0.94).toFixed(3);
            if (typeof tuned.weaveGroupDelay === 'number') tuned.weaveGroupDelay = +(tuned.weaveGroupDelay * 0.94).toFixed(3);
            if (typeof tuned.hpMult === 'number') tuned.hpMult = +(tuned.hpMult * 1.10).toFixed(3);
            tuned.enemyHpMult = +((tuned.enemyHpMult || 1) * 1.10).toFixed(3);
            if (tuned.proceduralWaveNumber >= 3 && !tuned.firePattern && tuned.proceduralThemeId !== 'swarm') {
                tuned.firePattern = tuned.proceduralWaveNumber >= 4 ? 'splitFan' : 'aimedPulse';
                tuned.fireEveryNth = 5;
                tuned.fireInterval = 3.35;
                tuned.fireOffset = 0.24;
            }
            tuned.proceduralHudDesc = `${tuned.proceduralHudDesc || 'VARIANT'}+`;
            tuned.galaxyDifficultyScale = difficultyScale;
            return tuned;
        }

        function pickEarlyProceduralTheme(waveNumber, lastThemeId, themeUseCounts) {
            let options = EARLY_PROCEDURAL_THEME_IDS
                .map(id => EARLY_PROCEDURAL_THEMES[id])
                .filter(theme => waveNumber >= theme.minWave)
                .filter(theme => theme.id !== lastThemeId)
                .filter(theme => (themeUseCounts[theme.id] || 0) < 2);
            if (options.length === 0) {
                options = EARLY_PROCEDURAL_THEME_IDS
                    .map(id => EARLY_PROCEDURAL_THEMES[id])
                    .filter(theme => waveNumber >= theme.minWave && theme.id !== lastThemeId);
            }
            return options[Math.floor(Math.random() * options.length)] || EARLY_PROCEDURAL_THEMES.patrol;
        }

        function pickRandomIntInclusive(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        }

        function pickDistinctRandomInclusive(min, max, exclude) {
            let value = pickRandomIntInclusive(min, max);
            if (max <= min) return value;
            while (value === exclude) value = pickRandomIntInclusive(min, max);
            return value;
        }

        function getNonBossEnemyAimTarget(sourceX, sourceY, options = {}) {
            const targetJitter = options.targetJitter ?? NON_BOSS_ENEMY_AIM_TARGET_JITTER;
            const leadTime = options.leadTime ?? 0.035;
            const px = player && Number.isFinite(player.x) ? player.x : width / 2;
            const py = player && Number.isFinite(player.y) ? player.y : height * 0.78;
            const leadX = px + ((player && player.vx) || 0) * leadTime;
            const leadY = py + ((player && player.vy) || 0) * leadTime;
            const jitterAngle = Math.random() * Math.PI * 2;
            const jitterRadius = Math.sqrt(Math.random()) * targetJitter;
            return {
                x: leadX + Math.cos(jitterAngle) * jitterRadius,
                y: leadY + Math.sin(jitterAngle) * jitterRadius
            };
        }

        function getNonBossEnemyAimAngle(sourceX, sourceY, options = {}) {
            const target = getNonBossEnemyAimTarget(sourceX, sourceY, options);
            const angleJitter = options.angleJitter ?? NON_BOSS_ENEMY_AIM_ANGLE_JITTER;
            return Math.atan2(target.y - sourceY, target.x - sourceX) + (Math.random() - 0.5) * angleJitter;
        }

        function getNonBossEnemyShotVector(sourceX, sourceY, speed, options = {}) {
            const angle = getNonBossEnemyAimAngle(sourceX, sourceY, options);
            const speedJitter = options.speedJitter ?? NON_BOSS_ENEMY_SHOT_SPEED_JITTER;
            const shotSpeed = speed * (1 + (Math.random() - 0.5) * 2 * speedJitter);
            return {
                angle,
                speed: shotSpeed,
                vx: Math.cos(angle) * shotSpeed,
                vy: Math.sin(angle) * shotSpeed
            };
        }

        function cloneWavePath(path) {
            return (path || []).map(point => ({ x: point.x, y: point.y }));
        }

        function applySignalDriftToPath(path, drift) {
            if (!drift || !path) return path;
            if (drift.id === 'mirror') {
                return path.map(point => ({ x: 1 - point.x, y: point.y }));
            }
            return path;
        }

        function pickSignalDriftForWave(waveDef, waveNumber, lastDriftId) {
            if (!waveDef || waveDef.isBoss || waveDef.isEarlyProcedural) return null;
            const lateBonus = Math.min(0.25, Math.max(0, waveNumber - 8) * 0.012);
            const chance = Math.min(0.78, 0.42 + lateBonus);
            if (Math.random() > chance) return null;
            const options = SIGNAL_DRIFT_POOL.filter(drift => drift.id !== lastDriftId || SIGNAL_DRIFT_POOL.length === 1);
            return options[Math.floor(Math.random() * options.length)];
        }

        function pushWaveSignalNotice(waveNumber, drift) {
            if (!drift || typeof currentFrameNow !== 'number') return;
            waveSignalNotice = {
                waveNumber,
                title: drift.name,
                desc: drift.desc,
                color: drift.color,
                startTime: currentFrameNow,
                duration: 2850
            };
        }

        function applySignalDriftToEnemy(enemy, drift, enemyIndex, waveDef) {
            if (!enemy || !drift) return enemy;
            if (drift.id === 'surge') {
                enemy.speedMult = (enemy.speedMult || 1) * 1.09;
                enemy.hp = Math.max(1, Math.ceil((enemy.hp || 1) * 0.88));
                enemy.maxHp = Math.max(enemy.hp, Math.ceil((enemy.maxHp || enemy.hp) * 0.88));
                enemy.driftTint = drift.color;
            } else if (drift.id === 'crossfire') {
                const shouldCarryPattern = enemy.isElite || enemyIndex % 3 === 0;
                if (shouldCarryPattern) {
                    const patterns = ['aimedPulse', 'downFan', 'splitFan', 'crossDrop'];
                    const pattern = waveDef.firePattern || patterns[(waveDef.type ? waveDef.type.length : enemyIndex) % patterns.length];
                    enemy.remasterFirePattern = pattern;
                    enemy.remasterFireInterval = Math.max(2.35, (waveDef.fireInterval || 3.0) * NON_BOSS_ENEMY_FIRE_INTERVAL_MULT);
                    enemy.remasterFireTimer = -(enemyIndex % 4) * 0.28;
                    enemy.remasterFireColor = drift.color;
                    enemy.disableRandomFire = true;
                }
            }
            return enemy;
        }

        function spawnSignalDriftSupport(drift, waveNumber) {
            if (!drift || drift.id !== 'vanguard') return [];
            const count = waveNumber >= 18 ? 3 : 2;
            const spawned = [];
            for (let i = 0; i < count; i++) {
                const fromLeft = i % 2 === 0;
                const yBase = height * (0.16 + i * 0.06);
                const patrol = createLaneSweepEnemy({
                    startX: fromLeft ? -55 : width + 55,
                    startY: yBase - 80 - i * 18,
                    endX: fromLeft ? width + 55 : -55,
                    endY: Math.min(height * 0.58, yBase + height * 0.26),
                    delay: -(0.55 + i * 0.7),
                    routeDuration: 7.4,
                    laneAmplitude: 24 + i * 6,
                    lanePhase: i * 0.85,
                    speed: 0.94 + Math.min(0.18, waveNumber * 0.004),
                    hp: 16 + Math.floor(waveNumber * 0.45),
                    color: '#9bffcf'
                });
                patrol.disableRandomFire = true;
                patrol.remasterFirePattern = i % 2 === 0 ? 'aimedPulse' : 'crossDrop';
                patrol.remasterFireInterval = 3.2;
                patrol.remasterFireTimer = -i * 0.4;
                patrol.remasterFireColor = '#9bffcf';
                spawned.push(patrol);
            }
            return spawned;
        }

        function createFlyByEnemy(flyByConfig, flyByTier, index) {
            const ratio = flyByConfig.count === 1 ? 0.5 : index / (flyByConfig.count - 1);
            const side = index % 2 === 0 ? -1 : 1;
            const lateralBias = ratio - 0.5;
            const startX = width * (0.30 + ratio * 0.40);
            const startY = -32 - index * 58;
            const controlX = width * Math.max(0.24, Math.min(0.76, 0.5 + side * 0.17 + lateralBias * 0.14));
            const controlY = height * (0.18 + Math.abs(lateralBias) * 0.12);
            const endX = width * Math.max(0.22, Math.min(0.78, 0.5 - side * 0.10 + lateralBias * 0.18));
            const endY = height + (flyByConfig.isScout ? 44 : 72);

            const enemy = {
                x: startX, y: startY, vx: 0, vy: 0,
                sprite: flyByConfig.sprite, color: flyByConfig.color, hp: flyByConfig.hp, maxHp: flyByConfig.hp,
                isArmored: false, isElite: false, isFlyBy: true, isScoutFlyBy: !!flyByConfig.isScout, onScreen: false, flashTimer: 0,
                flyByTier,
                flyByDamage: flyByConfig.damage,
                flyByScale: flyByConfig.scale || 1.55,
                flyByCollisionX: flyByConfig.collisionX || 34,
                flyByCollisionY: flyByConfig.collisionY || 26,
                flyByShotThresholds: (flyByConfig.shotThresholds || []).slice(),
                flyByShotsFired: 0,
                pathType: 'flyby', lifeTime: -index * (flyByConfig.isScout ? 0.34 : 0.45), speedMult: (flyByConfig.speed || 1) * 0.9,
                startX, startY, controlX, controlY, endX, endY, routeDuration: flyByConfig.isScout ? 2.25 : 2.6,
                waveFormationId: 0, waveFormationResolved: true,
                flyByDropType: flyByConfig.isScout ? null : 'health'
            };
            const flyByKind = flyByConfig.isScout
                ? 'base'
                : (flyByTier >= 3 ? 'elite' : (flyByTier >= 2 ? 'armored' : 'base'));
            return configureEnemyShipVisual(enemy, flyByKind, {
                visualScale: flyByConfig.isScout ? 0.95 : 1 + Math.max(0, flyByTier - 1) * 0.03
            });
        }

        function appendEllipseArc(path, cx, cy, rx, ry, startDeg, endDeg, steps) {
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const angle = (startDeg + (endDeg - startDeg) * t) * Math.PI / 180;
                const point = {
                    x: cx + Math.cos(angle) * rx,
                    y: cy + Math.sin(angle) * ry
                };
                const last = path[path.length - 1];
                if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 0.0001) {
                    path.push(point);
                }
            }
        }

        function resamplePolylinePath(points, segments) {
            if (!points || points.length < 2) return points ? points.slice() : [];

            const lengths = [0];
            let totalLength = 0;
            for (let i = 1; i < points.length; i++) {
                totalLength += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
                lengths.push(totalLength);
            }
            if (totalLength <= 0.0001) return points.slice();

            const resampled = [];
            let segmentIndex = 1;
            for (let i = 0; i <= segments; i++) {
                const targetLength = totalLength * (i / segments);
                while (segmentIndex < lengths.length - 1 && lengths[segmentIndex] < targetLength) {
                    segmentIndex++;
                }
                const start = points[segmentIndex - 1];
                const end = points[segmentIndex];
                const startLength = lengths[segmentIndex - 1];
                const endLength = lengths[segmentIndex];
                const segmentLength = Math.max(0.0001, endLength - startLength);
                const t = (targetLength - startLength) / segmentLength;
                resampled.push({
                    x: start.x + (end.x - start.x) * t,
                    y: start.y + (end.y - start.y) * t
                });
            }
            return resampled;
        }

        function buildFigureEightWavePath() {
            const raw = [
                { x: 0.30, y: -0.10 },
                { x: 0.34, y: 0.02 }
            ];
            const cx = 0.50;
            const cy = 0.34;
            const rx = 0.27;
            const ry = 0.29;
            const startT = Math.PI * 1.75;
            const endT = startT - Math.PI * 2;
            const steps = 96;

            for (let i = 0; i <= steps; i++) {
                const t = startT + (endT - startT) * (i / steps);
                raw.push({
                    x: cx + Math.sin(t * 2) * rx,
                    y: cy + Math.sin(t) * ry
                });
            }
            raw.push({ x: 0.34, y: 0.02 }, { x: 0.30, y: -0.10 });

            return resamplePolylinePath(raw, 96);
        }

        function buildDenseZigPath() {
            const path = [{ x: 0.5, y: -0.16 }];
            const rows = [0.05, 0.11, 0.18, 0.25, 0.33, 0.41, 0.49, 0.57, 0.64, 0.69];
            for (let i = 0; i < rows.length; i++) {
                path.push({ x: i % 2 === 0 ? 0.08 : 0.92, y: rows[i] });
            }
            path.push({ x: 0.5, y: -0.16 });
            return path;
        }

        function buildSnakeLoopPath() {
            const path = [];
            const downPoints = 24;
            const upPoints = 20;
            for (let i = 0; i <= downPoints; i++) {
                const t = i / downPoints;
                path.push({
                    x: 0.5 + Math.sin(t * Math.PI * 2.2) * 0.28,
                    y: -0.12 + t * 0.68
                });
            }
            for (let i = 1; i <= upPoints; i++) {
                const t = i / upPoints;
                path.push({
                    x: 0.5 + Math.sin(t * Math.PI * 2.0 + 0.9) * 0.20 + Math.cos(t * Math.PI * 3.1) * 0.05,
                    y: 0.56 - t * 0.74
                });
            }
            return path;
        }

        function buildWaveNineReturnPath() {
            return [
                { x: 0.18, y: -0.12 },
                { x: 0.78, y: 0.16 },
                { x: 0.28, y: 0.32 },
                { x: 0.74, y: 0.45 },
                { x: 0.50, y: 0.58 },
                { x: 0.22, y: 0.43 },
                { x: 0.78, y: 0.26 },
                { x: 0.32, y: 0.10 },
                { x: 0.18, y: -0.12 }
            ];
        }

        function buildUpperEndgamePath(points, segments = 58) {
            const capped = (points || []).map(point => ({
                x: point.x,
                y: point.y < 0 ? point.y : Math.min(0.64, point.y)
            }));
            return resamplePolylinePath(capped, segments);
        }

        function pushRemasterEnemyBullet(x, y, angle, speed, char, color, extras = {}) {
            enemyBullets.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                char,
                color,
                ...extras
            });
        }

        function fireRemasteredWavePattern(enemy) {
            if (!enemy || !enemy.onScreen) return;

            const aimAngle = getNonBossEnemyAimAngle(enemy.x, enemy.y);
            const color = enemy.enemyBulletColor || enemy.remasterFireColor || enemy.enemyShipBodyColor || enemy.color || '#ff8fd8';

            if (enemy.remasterFirePattern === 'aimedPulse') {
                const shot = getNonBossEnemyShotVector(enemy.x, enemy.y, 245);
                pushRemasterEnemyBullet(enemy.x, enemy.y, shot.angle, shot.speed, '\u25cb', color);
            } else if (enemy.remasterFirePattern === 'downFan') {
                for (const offset of [-0.28, 0, 0.28]) {
                    pushRemasterEnemyBullet(enemy.x, enemy.y, Math.PI / 2 + offset, 225, '.', color);
                }
            } else if (enemy.remasterFirePattern === 'splitFan') {
                for (const offset of [-0.22, 0, 0.22]) {
                    pushRemasterEnemyBullet(enemy.x, enemy.y, aimAngle + offset, 235, '*', color);
                }
            } else if (enemy.remasterFirePattern === 'crossDrop') {
                pushRemasterEnemyBullet(enemy.x, enemy.y, Math.PI / 2 - 0.42, 235, '+', color);
                pushRemasterEnemyBullet(enemy.x, enemy.y, Math.PI / 2 + 0.42, 235, '+', color);
            } else if (enemy.remasterFirePattern === 'spiralNeedle') {
                enemy.remasterFireAngle = (enemy.remasterFireAngle || aimAngle) + 0.58;
                pushRemasterEnemyBullet(enemy.x, enemy.y, enemy.remasterFireAngle, 230, '+', color);
                pushRemasterEnemyBullet(enemy.x, enemy.y, enemy.remasterFireAngle + Math.PI, 230, '+', color);
            } else if (enemy.remasterFirePattern === 'scatterMark') {
                for (const turn of [-0.32, 0.32]) {
                    pushRemasterEnemyBullet(enemy.x, enemy.y, aimAngle + turn * 0.35, 250, 'x', color, {
                        turnRate: turn,
                        speed: 250
                    });
                }
            } else if (enemy.remasterFirePattern === 'crescentFan') {
                for (const offset of [-0.34, -0.14, 0.14, 0.34]) {
                    pushRemasterEnemyBullet(enemy.x, enemy.y, aimAngle + offset, 220, offset < 0 ? '(' : ')', color, {
                        turnRate: -offset * 0.42,
                        speed: 220,
                        hitboxScale: 0.78
                    });
                }
            } else if (enemy.remasterFirePattern === 'runeRain') {
                for (const offset of [-34, 0, 34]) {
                    pushRemasterEnemyBullet(enemy.x + offset, enemy.y + 6, Math.PI / 2 + offset * 0.002, 205, offset === 0 ? '!' : '|', color, {
                        hitboxScale: 0.72
                    });
                }
            } else if (enemy.remasterFirePattern === 'latticeWave') {
                for (const offset of [-20, 20]) {
                    pushRemasterEnemyBullet(enemy.x + offset, enemy.y, Math.PI / 2, 210, '+', color, {
                        isLatticeShot: true,
                        baseX: enemy.x + offset,
                        waveAmp: 22 + Math.abs(offset) * 0.35,
                        waveFreq: 3.2,
                        wavePhase: offset < 0 ? 0 : Math.PI,
                        hitboxScale: 0.74
                    });
                }
            }
        }

        function applyRemasteredWavePattern(enemy, waveDef, enemyIndex) {
            if (!enemy || !waveDef.firePattern) return enemy;

            const everyNth = Math.max(1, waveDef.fireEveryNth || 4);
            const isPatternAnchor = enemy.isElite || enemy.isFlameGuardian || enemyIndex % everyNth === 0;
            if (!isPatternAnchor) return enemy;

            enemy.remasterFirePattern = waveDef.firePattern;
            enemy.remasterFireInterval = (waveDef.fireInterval || 2.6) * NON_BOSS_ENEMY_FIRE_INTERVAL_MULT;
            enemy.remasterFireTimer = -((enemyIndex % everyNth) * (waveDef.fireOffset || 0.18));
            enemy.remasterFireColor = waveDef.fireColor || enemy.color;
            enemy.disableRandomFire = true;
            return enemy;
        }

        function armEndgameWaveEnemy(enemy, config = {}) {
            if (!enemy) return enemy;
            if (config.visualScale) enemy.enemyShipVisualScale = config.visualScale;
            if (config.pattern) {
                enemy.remasterFirePattern = config.pattern;
                enemy.remasterFireInterval = (config.fireInterval || 2.7) * NON_BOSS_ENEMY_FIRE_INTERVAL_MULT;
                enemy.remasterFireTimer = -(config.fireOffset || 0);
                enemy.remasterFireColor = config.fireColor || enemy.enemyBulletColor || enemy.color;
                enemy.disableRandomFire = true;
            }
            enemy.explosionDebrisCap = config.debrisCap || 30;
            enemy.explosionDebrisVelocity = config.debrisVelocity || 300;
            enemy.explosionDebrisLife = config.debrisLife || 0.62;
            return enemy;
        }

        function createEndgamePathEnemy(config = {}) {
            const path = cloneWavePath(config.path || [{ x: 0.5, y: -0.12 }, { x: 0.5, y: -0.12 }]);
            const hp = config.hp || 36;
            const enemy = {
                x: path[0].x * width,
                y: path[0].y * height,
                vx: 0,
                vy: 0,
                sprite: [" ▼ ▼ ", "  ■  "],
                color: config.color || '#9be3ff',
                hp,
                maxHp: hp,
                isArmored: config.kind === 'armored',
                isElite: config.kind === 'elite',
                flashTimer: 0,
                onScreen: false,
                hoverX: 0,
                fireTimer: 0,
                disableRandomFire: true,
                path,
                pathIndex: 0,
                pathT: config.delay || 0,
                speedMult: config.speed || 1,
                pathTypeWave: 'upperEndgame',
                pathLoopsCompleted: 0,
                despawnOnLoopEnd: true
            };
            configureEnemyShipVisual(enemy, config.kind || 'base', {
                visualScale: config.visualScale || (config.kind === 'elite' ? 1.12 : 1.03),
                color: config.color
            });
            return armEndgameWaveEnemy(enemy, config);
        }

        function spawnExtendedLateWaveEnemies(w) {
            const spawned = [];

            if (w.customType === 'neonCrown') {
                for (let group = 0; group < 4; group++) {
                    for (let lane = 0; lane < 3; lane++) {
                        const fromLeft = group % 2 === 0;
                        spawned.push(createVoidOrbiter({
                            centerX: width * (fromLeft ? 0.26 : 0.74),
                            centerY: -98 - group * 26,
                            centerDriftX: width * (fromLeft ? 0.16 : -0.16),
                            centerFall: height * 0.43,
                            centerBob: 18,
                            centerPhase: group * 0.72 + lane * 1.1,
                            orbitRadiusX: 46 + lane * 9,
                            orbitRadiusY: 24 + lane * 4,
                            orbitAngle: lane * (Math.PI * 2 / 3),
                            orbitSpeed: 2.15 + lane * 0.18,
                            routeDuration: 9.35,
                            delay: -(group * 0.52 + lane * 0.12),
                            speed: 1,
                            fireInterval: 2.8,
                            fireSpeed: 218,
                            color: fromLeft ? '#9be3ff' : '#ff9ee8',
                            fireColor: '#e6f5ff'
                        }));
                    }
                }
                for (let i = 0; i < 5; i++) {
                    const fromLeft = i % 2 === 0;
                    const lane = i % 5;
                    const sweep = createLaneSweepEnemy({
                        startX: fromLeft ? -70 : width + 70,
                        startY: height * (0.10 + lane * 0.035),
                        endX: fromLeft ? width + 72 : -72,
                        endY: height * (0.23 + ((lane + 2) % 5) * 0.052),
                        delay: -(1.65 + i * 0.34),
                        routeDuration: 8.59,
                        laneAmplitude: 24 + lane * 4,
                        lanePhase: i * 0.78,
                        speed: 1,
                        hp: 34 + (i % 2) * 6,
                        color: fromLeft ? '#bff0ff' : '#ffc6f5',
                        enemyShipKind: i === 2 ? 'elite' : 'armored'
                    });
                    spawned.push(armEndgameWaveEnemy(sweep, {
                        pattern: i === 2 ? 'spiralNeedle' : 'aimedPulse',
                        fireInterval: i === 2 ? 2.35 : 3.05,
                        fireOffset: i * 0.2,
                        visualScale: i === 2 ? 1.11 : 1.04,
                        fireColor: i === 2 ? '#fff07a' : '#dff7ff'
                    }));
                }
            } else if (w.customType === 'sidewinderLattice') {
                for (let i = 0; i < 12; i++) {
                    const fromLeft = i % 2 === 0;
                    const row = i % 6;
                    const isElite = i === 5 || i === 10;
                    const sweep = createLaneSweepEnemy({
                        startX: fromLeft ? -72 : width + 72,
                        startY: height * (0.08 + row * 0.045),
                        endX: fromLeft ? width + 74 : -74,
                        endY: height * (0.16 + ((row + 3) % 6) * 0.058),
                        delay: -(i * 0.28),
                        routeDuration: 9.78,
                        laneAmplitude: 18 + (row % 3) * 9,
                        lanePhase: i * 0.92,
                        speed: 1,
                        hp: isElite ? 62 : 38,
                        color: isElite ? '#ffe27a' : (fromLeft ? '#7ee7ff' : '#ff9ee8'),
                        isElite,
                        enemyShipKind: isElite ? 'elite' : 'armored'
                    });
                    spawned.push(armEndgameWaveEnemy(sweep, {
                        pattern: isElite ? 'crossDrop' : (i % 3 === 0 ? 'downFan' : 'aimedPulse'),
                        fireInterval: isElite ? 2.35 : 3.1,
                        fireOffset: i * 0.16,
                        visualScale: isElite ? 1.12 : 1.03,
                        fireColor: isElite ? '#fff2a8' : '#c8f4ff'
                    }));
                }
                for (let i = 0; i < 2; i++) {
                    const side = i === 0 ? -1 : 1;
                    spawned.push(createVoidSentinel({
                        spawnX: side < 0 ? -80 : width + 80,
                        spawnY: height * 0.13,
                        hoverX: width * (side < 0 ? 0.29 : 0.71),
                        hoverY: height * 0.16,
                        attackMode: i === 0 ? 'fan' : 'cross',
                        arrivalDelay: 0.45 + i * 0.28,
                        approachSpeed: 2.45,
                        hp: 270,
                        color: side < 0 ? '#9be3ff' : '#ffb6f2',
                        hoverAmpX: 24,
                        hoverAmpY: 7
                    }));
                }
            } else if (w.customType === 'helixNeedle') {
                const paths = [
                    [{ x: 0.18, y: -0.12 }, { x: 0.30, y: 0.10 }, { x: 0.70, y: 0.16 }, { x: 0.35, y: 0.34 }, { x: 0.78, y: 0.48 }, { x: 1.08, y: 0.24 }, { x: 0.18, y: -0.12 }],
                    [{ x: 0.82, y: -0.12 }, { x: 0.70, y: 0.10 }, { x: 0.30, y: 0.16 }, { x: 0.65, y: 0.34 }, { x: 0.22, y: 0.48 }, { x: -0.08, y: 0.24 }, { x: 0.82, y: -0.12 }],
                    [{ x: -0.08, y: 0.18 }, { x: 0.22, y: 0.11 }, { x: 0.52, y: 0.26 }, { x: 0.30, y: 0.42 }, { x: 0.68, y: 0.56 }, { x: 1.08, y: 0.15 }, { x: -0.08, y: 0.18 }],
                    [{ x: 1.08, y: 0.18 }, { x: 0.78, y: 0.11 }, { x: 0.48, y: 0.26 }, { x: 0.70, y: 0.42 }, { x: 0.32, y: 0.56 }, { x: -0.08, y: 0.15 }, { x: 1.08, y: 0.18 }]
                ].map(path => resamplePolylinePath(path, 54));
                for (let i = 0; i < 12; i++) {
                    const isElite = i % 6 === 2;
                    spawned.push(createEndgamePathEnemy({
                        path: paths[i % paths.length],
                        delay: -Math.floor(i / 4) * 0.62 - (i % 4) * 0.12,
                        speed: 0.83,
                        hp: isElite ? 70 : 40,
                        kind: isElite ? 'elite' : (i % 2 ? 'armored' : 'base'),
                        color: isElite ? '#fff07a' : (i % 2 ? '#b9a6ff' : '#7ee7ff'),
                        pattern: isElite ? 'spiralNeedle' : (i % 3 === 0 ? 'splitFan' : 'aimedPulse'),
                        fireInterval: isElite ? 2.25 : 3.0,
                        fireOffset: i * 0.17,
                        visualScale: isElite ? 1.13 : 1.04
                    }));
                }
                for (let i = 0; i < 5; i++) {
                    spawned.push(createVoidOrbiter({
                        centerX: width * (0.22 + (i % 5) * 0.14),
                        centerY: -95 - i * 20,
                        centerDriftX: width * (i % 2 === 0 ? 0.06 : -0.06),
                        centerFall: height * 0.38,
                        centerBob: 12,
                        centerPhase: i * 0.8,
                        orbitRadiusX: 36 + (i % 3) * 8,
                        orbitRadiusY: 21 + (i % 2) * 5,
                        orbitAngle: i * 1.1,
                        orbitSpeed: 2.35,
                        routeDuration: 8.51,
                        delay: -(1.0 + i * 0.26),
                        speed: 1,
                        fireInterval: 2.65,
                        hp: 34,
                        color: i % 2 ? '#ff9ee8' : '#9be3ff',
                        fireColor: '#f4fbff'
                    }));
                }
            } else if (w.customType === 'royalCrossfire') {
                for (let i = 0; i < 2; i++) {
                    const side = i === 0 ? -1 : 1;
                    spawned.push(createVoidSentinel({
                        sprite: VOID_ANCHOR_SPRITE,
                        renderScale: 1.05,
                        spawnX: width * (side < 0 ? 0.18 : 0.82),
                        spawnY: -150 - i * 36,
                        hoverX: width * (side < 0 ? 0.28 : 0.72),
                        hoverY: height * 0.15,
                        attackMode: i === 0 ? 'anchor' : 'cross',
                        arrivalDelay: 0.25 + i * 0.55,
                        hp: 420,
                        color: side < 0 ? '#c8f4ff' : '#ffd0f5',
                        hoverAmpX: 16,
                        hoverAmpY: 7
                    }));
                }
                for (let i = 0; i < 10; i++) {
                    const fromLeft = i % 2 === 0;
                    const row = i % 5;
                    const sweep = createLaneSweepEnemy({
                        startX: fromLeft ? -76 : width + 76,
                        startY: height * (0.11 + row * 0.036),
                        endX: fromLeft ? width + 78 : -78,
                        endY: height * (0.20 + ((row + 2) % 5) * 0.055),
                        delay: -(0.9 + i * 0.33),
                        routeDuration: 9.77,
                        laneAmplitude: 22 + row * 5,
                        lanePhase: i * 0.64,
                        speed: 1,
                        hp: 42,
                        color: fromLeft ? '#7ee7ff' : '#ff9ee8',
                        enemyShipKind: 'armored'
                    });
                    spawned.push(armEndgameWaveEnemy(sweep, {
                        pattern: i % 4 === 0 ? 'crossDrop' : 'aimedPulse',
                        fireInterval: 2.8,
                        fireOffset: i * 0.18,
                        visualScale: 1.05
                    }));
                }
                for (let i = 0; i < 6; i++) {
                    spawned.push(createVoidOrbiter({
                        centerX: width * (0.24 + (i % 3) * 0.26),
                        centerY: -120 - Math.floor(i / 3) * 34,
                        centerDriftX: width * 0.08 * (i % 2 === 0 ? 1 : -1),
                        centerFall: height * 0.36,
                        centerBob: 14,
                        centerPhase: i * 0.7,
                        orbitRadiusX: 42 + (i % 3) * 7,
                        orbitRadiusY: 24 + (i % 2) * 5,
                        orbitAngle: i * (Math.PI / 3),
                        orbitSpeed: 2.05,
                        routeDuration: 10.0,
                        delay: -(1.2 + i * 0.32),
                        speed: 1,
                        fireInterval: 2.7,
                        hp: 36,
                        color: i % 2 === 0 ? '#ffe27a' : '#b9a6ff',
                        fireColor: '#f4fbff'
                    }));
                }
            } else if (w.customType === 'shatteredOrbit') {
                const centers = [0.24, 0.74, 0.36, 0.64];
                for (let group = 0; group < centers.length; group++) {
                    for (let lane = 0; lane < 3; lane++) {
                        spawned.push(createVoidOrbiter({
                            centerX: width * centers[group],
                            centerY: -90 - group * 36,
                            centerDriftX: width * 0.07 * (group % 2 === 0 ? 1 : -1),
                            centerPhase: group * 0.6 + lane * 1.2,
                            orbitRadiusX: 52 + lane * 10,
                            orbitRadiusY: 28 + lane * 6,
                            orbitAngle: lane * (Math.PI * 2 / 3),
                            orbitSpeed: 2.0 + lane * 0.2,
                            routeDuration: 8.8,
                            delay: -(group * 0.72 + lane * 0.14),
                            speed: 0.92,
                            fireInterval: 2.9,
                            color: group % 2 === 0 ? '#bba6ff' : '#8fd9ff'
                        }));
                    }
                }
                spawned.push(createVoidSentinel({
                    spawnX: width * 0.5,
                    spawnY: -140,
                    hoverX: width * 0.5,
                    hoverY: height * 0.18,
                    attackMode: 'fan',
                    arrivalDelay: 1.2,
                    hp: 260,
                    color: '#b39dff'
                }));
                for (let i = 0; i < 3; i++) {
                    const fromLeft = i % 2 === 0;
                    spawned.push(createLaneSweepEnemy({
                        startX: fromLeft ? -60 : width + 60,
                        startY: -90 - i * 36,
                        endX: fromLeft ? width + 60 : -60,
                        endY: height * (0.58 + i * 0.06),
                        delay: -(2.5 + i * 0.45),
                        routeDuration: 7.4,
                        laneAmplitude: 30 + i * 10,
                        lanePhase: i * 0.8,
                        speed: 0.95,
                        hp: 30,
                        color: '#ffb1ea'
                    }));
                }
            } else if (w.customType === 'twinRondo') {
                spawned.push(createVoidSentinel({
                    spawnX: width * 0.18,
                    spawnY: -120,
                    hoverX: width * 0.26,
                    hoverY: height * 0.16,
                    attackMode: 'fan',
                    arrivalDelay: 0.35,
                    hp: 285,
                    color: '#9ed1ff'
                }));
                spawned.push(createVoidSentinel({
                    spawnX: width * 0.82,
                    spawnY: -150,
                    hoverX: width * 0.74,
                    hoverY: height * 0.16,
                    attackMode: 'cross',
                    arrivalDelay: 0.95,
                    hp: 285,
                    color: '#b99dff'
                }));
                for (let pair = 0; pair < 5; pair++) {
                    const endY = height * (0.46 + pair * 0.055);
                    const delay = -(pair * 0.48);
                    spawned.push(createLaneSweepEnemy({
                        startX: -70,
                        startY: -70 - pair * 28,
                        endX: width + 70,
                        endY,
                        delay,
                        routeDuration: 8.1,
                        laneAmplitude: 38 + pair * 5,
                        lanePhase: pair * 0.55,
                        speed: 0.94,
                        hp: 28,
                        color: '#8fe1ff'
                    }));
                    spawned.push(createLaneSweepEnemy({
                        startX: width + 70,
                        startY: -96 - pair * 28,
                        endX: -70,
                        endY: endY + 42,
                        delay: delay - 0.22,
                        routeDuration: 8.1,
                        laneAmplitude: 44 + pair * 4,
                        lanePhase: pair * 0.55 + Math.PI / 2,
                        speed: 0.94,
                        hp: 28,
                        color: '#f0a7ff'
                    }));
                }
            } else if (w.customType === 'anchorSiege') {
                spawned.push(createVoidSentinel({
                    sprite: VOID_ANCHOR_SPRITE,
                    renderScale: 1.08,
                    spawnX: width * 0.5,
                    spawnY: -150,
                    hoverX: width * 0.5,
                    hoverY: height * 0.17,
                    attackMode: 'anchor',
                    arrivalDelay: 0.4,
                    hp: 520,
                    color: '#d1b3ff',
                    hoverAmpX: 10,
                    hoverAmpY: 7
                }));
                for (let i = 0; i < 8; i++) {
                    const pair = Math.floor(i / 2);
                    const side = i % 2 === 0 ? -1 : 1;
                    spawned.push(createVoidOrbiter({
                        centerX: width * 0.5 + side * width * 0.12,
                        centerY: -110 - pair * 24,
                        centerDriftX: side * width * 0.05,
                        centerPhase: pair * 0.8 + i * 0.3,
                        orbitRadiusX: 48 + pair * 5,
                        orbitRadiusY: 30 + pair * 4,
                        orbitAngle: i * (Math.PI / 4),
                        orbitSpeed: 1.9 + pair * 0.08,
                        routeDuration: 9.2,
                        delay: -(0.7 + pair * 0.38),
                        speed: 0.9,
                        fireInterval: 2.45,
                        hp: 30 + (pair % 2 === 1 ? 4 : 0),
                        color: side < 0 ? '#ffe0ff' : '#b2c9ff'
                    }));
                }
                for (let i = 0; i < 4; i++) {
                    const fromLeft = i % 2 === 0;
                    spawned.push(createLaneSweepEnemy({
                        startX: fromLeft ? -60 : width + 60,
                        startY: height * (0.12 + i * 0.04),
                        endX: fromLeft ? width + 60 : -60,
                        endY: height * (0.64 + i * 0.045),
                        delay: -(2.2 + i * 0.55),
                        routeDuration: 7.7,
                        laneAmplitude: 26 + i * 7,
                        lanePhase: i * 0.9,
                        speed: 0.92,
                        hp: 34,
                        color: '#ffafda'
                    }));
                }
            } else if (w.customType === 'prismRift') {
                spawned.push(createPrismConduit({
                    x: width * 0.5,
                    y: -160,
                    hoverX: width * 0.5,
                    hoverY: height * 0.18,
                    hoverAmpX: 150,
                    hoverAmpY: 24,
                    hp: 460
                }));
                for (let i = 0; i < 2; i++) {
                    const side = i === 0 ? -1 : 1;
                    spawned.push(createVoidSentinel({
                        spawnX: width * (side < 0 ? 0.18 : 0.82),
                        spawnY: -130 - i * 46,
                        hoverX: width * (side < 0 ? 0.28 : 0.72),
                        hoverY: height * 0.19,
                        attackMode: i === 0 ? 'fan' : 'cross',
                        arrivalDelay: 0.75 + i * 0.35,
                        hp: 210,
                        color: side < 0 ? '#ffa9ff' : '#9bffff',
                        hoverAmpX: 28,
                        hoverAmpY: 10
                    }));
                }
                for (let i = 0; i < 8; i++) {
                    const fromLeft = i % 2 === 0;
                    spawned.push(createLaneSweepEnemy({
                        startX: fromLeft ? -60 : width + 60,
                        startY: -90 - i * 24,
                        endX: fromLeft ? width + 60 : -60,
                        endY: height * (0.46 + (i % 4) * 0.045),
                        delay: -(1.35 + i * 0.48),
                        routeDuration: 9.2,
                        laneAmplitude: 28 + (i % 4) * 8,
                        lanePhase: i * 0.72,
                        speed: 0.88,
                        hp: 34,
                        color: i % 2 === 0 ? '#ff9bff' : '#9bffff'
                    }));
                }
                for (let i = 0; i < 6; i++) {
                    spawned.push(createVoidOrbiter({
                        centerX: width * (0.24 + (i % 3) * 0.26),
                        centerY: -120 - Math.floor(i / 3) * 34,
                        centerDriftX: width * 0.06 * (i % 2 === 0 ? 1 : -1),
                        centerPhase: i * 0.7,
                        orbitRadiusX: 46 + (i % 3) * 7,
                        orbitRadiusY: 28 + (i % 2) * 5,
                        orbitAngle: i * (Math.PI / 3),
                        orbitSpeed: 1.82,
                        routeDuration: 10.0,
                        delay: -(1.0 + i * 0.42),
                        speed: 0.9,
                        fireInterval: 3.0,
                        color: i % 2 === 0 ? '#ffd56b' : '#9bffd5'
                    }));
                }
            } else if (w.customType === 'phaseCorridor') {
                for (let i = 0; i < 2; i++) {
                    const side = i === 0 ? -1 : 1;
                    spawned.push(createVoidSentinel({
                        spawnX: width * (side < 0 ? 0.20 : 0.80),
                        spawnY: -135 - i * 36,
                        hoverX: width * (side < 0 ? 0.30 : 0.70),
                        hoverY: height * 0.18,
                        attackMode: i === 0 ? 'anchor' : 'fan',
                        arrivalDelay: 0.35 + i * 0.55,
                        hp: 300,
                        color: side < 0 ? '#b7b0ff' : '#ffb7ef',
                        hoverAmpX: 18,
                        hoverAmpY: 8
                    }));
                }
                for (let i = 0; i < 12; i++) {
                    const lane = i % 6;
                    const fromLeft = i % 2 === 0;
                    spawned.push(createLaneSweepEnemy({
                        startX: fromLeft ? -70 : width + 70,
                        startY: -80 - i * 18,
                        endX: fromLeft ? width + 70 : -70,
                        endY: height * (0.38 + lane * 0.04),
                        delay: -(0.8 + i * 0.34),
                        routeDuration: 9.8,
                        laneAmplitude: 22 + (lane % 3) * 9,
                        lanePhase: i * 0.54 + (fromLeft ? 0 : Math.PI),
                        speed: 0.86,
                        hp: 34,
                        color: fromLeft ? '#c0a9ff' : '#ff9bd8',
                        enemyShipKind: lane >= 4 ? 'armored' : 'base'
                    }));
                }
                for (let i = 0; i < 4; i++) {
                    spawned.push(createVoidOrbiter({
                        centerX: width * (0.31 + (i % 2) * 0.38),
                        centerY: -105 - Math.floor(i / 2) * 42,
                        centerDriftX: width * 0.04 * (i % 2 === 0 ? 1 : -1),
                        centerPhase: i * 0.9,
                        orbitRadiusX: 54,
                        orbitRadiusY: 32,
                        orbitAngle: i * (Math.PI / 2),
                        orbitSpeed: 1.72,
                        routeDuration: 10.4,
                        delay: -(1.4 + i * 0.55),
                        speed: 0.88,
                        fireInterval: 3.2,
                        color: i % 2 === 0 ? '#d8caff' : '#ffcaf1'
                    }));
                }
            } else if (w.customType === 'latticeBloom') {
                spawned.push(createVoidSentinel({
                    spawnX: width * 0.5,
                    spawnY: -160,
                    hoverX: width * 0.5,
                    hoverY: height * 0.17,
                    attackMode: 'anchor',
                    arrivalDelay: 0.45,
                    hp: 380,
                    color: '#ffd2ff',
                    hoverAmpX: 12,
                    hoverAmpY: 9
                }));
                for (let ring = 0; ring < 2; ring++) {
                    for (let i = 0; i < 5; i++) {
                        const idx = ring * 5 + i;
                        spawned.push(createVoidOrbiter({
                            centerX: width * (0.24 + i * 0.13),
                            centerY: -118 - ring * 46,
                            centerDriftX: width * 0.045 * (i % 2 === 0 ? 1 : -1),
                            centerPhase: ring * 0.8 + i * 0.5,
                            orbitRadiusX: 44 + ring * 10,
                            orbitRadiusY: 28 + ring * 5,
                            orbitAngle: idx * (Math.PI * 2 / 5),
                            orbitSpeed: 1.62 + ring * 0.18,
                            routeDuration: 10.8,
                            delay: -(0.9 + idx * 0.24),
                            speed: 0.86,
                            fireInterval: 3.25,
                            hp: 32 + ring * 4,
                            color: i % 2 === 0 ? '#ffb8ff' : '#aefcff'
                        }));
                    }
                }
                for (let i = 0; i < 8; i++) {
                    const fromLeft = i % 2 === 0;
                    spawned.push(createLaneSweepEnemy({
                        startX: fromLeft ? -65 : width + 65,
                        startY: -96 - i * 22,
                        endX: fromLeft ? width + 65 : -65,
                        endY: height * (0.43 + (i % 4) * 0.045),
                        delay: -(2.2 + i * 0.42),
                        routeDuration: 9.6,
                        laneAmplitude: 38 - (i % 3) * 5,
                        lanePhase: i * 0.62,
                        speed: 0.88,
                        hp: 36,
                        color: fromLeft ? '#fff06a' : '#86fff0',
                        enemyShipKind: i % 3 === 0 ? 'armored' : 'base'
                    }));
                }
            } else if (w.customType === 'braidCrucible') {
                for (let i = 0; i < 2; i++) {
                    const side = i === 0 ? -1 : 1;
                    spawned.push(createVoidSentinel({
                        spawnX: width * (side < 0 ? 0.15 : 0.85),
                        spawnY: -140 - i * 42,
                        hoverX: width * (side < 0 ? 0.25 : 0.75),
                        hoverY: height * 0.18,
                        attackMode: i === 0 ? 'cross' : 'cinder',
                        arrivalDelay: 0.55 + i * 0.65,
                        hp: 320,
                        color: side < 0 ? '#ff9bd8' : '#9ee7ff',
                        hoverAmpX: 24,
                        hoverAmpY: 10
                    }));
                }
                for (let i = 0; i < 12; i++) {
                    const fromLeft = i % 2 === 0;
                    const lane = i % 6;
                    spawned.push(createLaneSweepEnemy({
                        startX: fromLeft ? -80 : width + 80,
                        startY: -96 - i * 18,
                        endX: fromLeft ? width + 80 : -80,
                        endY: height * (0.36 + lane * 0.045),
                        delay: -(0.7 + i * 0.32),
                        routeDuration: 10.4,
                        laneAmplitude: 32 + (lane % 3) * 10,
                        lanePhase: i * 0.75 + (fromLeft ? 0 : Math.PI),
                        speed: 0.84,
                        hp: 36 + (i % 4 === 0 ? 6 : 0),
                        color: fromLeft ? '#ff8fe9' : '#8ff7ff',
                        enemyShipKind: i % 4 === 0 ? 'elite' : (i % 3 === 0 ? 'armored' : 'base')
                    }));
                }
                for (let i = 0; i < 6; i++) {
                    spawned.push(createVoidOrbiter({
                        centerX: width * (0.22 + (i % 3) * 0.28),
                        centerY: -110 - Math.floor(i / 3) * 40,
                        centerDriftX: width * 0.07 * (i % 2 === 0 ? 1 : -1),
                        centerPhase: i * 0.72,
                        orbitRadiusX: 56,
                        orbitRadiusY: 32,
                        orbitAngle: i * (Math.PI / 3),
                        orbitSpeed: 1.85,
                        routeDuration: 10.2,
                        delay: -(1.6 + i * 0.38),
                        speed: 0.86,
                        fireInterval: 3.05,
                        hp: 34,
                        color: i % 2 === 0 ? '#ffc1f2' : '#b8f7ff'
                    }));
                }
            } else if (w.customType === 'falseHorizon') {
                spawned.push(createVoidSentinel({
                    spawnX: width * 0.18,
                    spawnY: -110,
                    hoverX: width * 0.28,
                    hoverY: height * 0.18,
                    attackMode: 'cinder',
                    arrivalDelay: 0.35,
                    hp: 305,
                    color: '#ffb9f2'
                }));
                spawned.push(createVoidSentinel({
                    spawnX: width * 0.82,
                    spawnY: -150,
                    hoverX: width * 0.72,
                    hoverY: height * 0.18,
                    attackMode: 'cinder',
                    arrivalDelay: 0.85,
                    hp: 305,
                    color: '#9dc7ff'
                }));
                for (let group = 0; group < 3; group++) {
                    const centerX = width * (0.28 + group * 0.22);
                    for (let lane = 0; lane < 2; lane++) {
                        spawned.push(createVoidOrbiter({
                            centerX,
                            centerY: -100 - group * 38,
                            centerDriftX: width * 0.08 * (group === 1 ? -1 : 1),
                            centerPhase: group * 0.7 + lane * Math.PI,
                            orbitRadiusX: 62,
                            orbitRadiusY: 34,
                            orbitAngle: lane * Math.PI + group * 0.4,
                            orbitSpeed: 2.05,
                            routeDuration: 8.8,
                            delay: -(1.0 + group * 0.48 + lane * 0.16),
                            speed: 0.94,
                            fireInterval: 2.5,
                            color: group === 1 ? '#ffd2f2' : '#b7b0ff'
                        }));
                    }
                }
                for (let i = 0; i < 6; i++) {
                    const fromLeft = i % 2 === 0;
                    spawned.push(createLaneSweepEnemy({
                        startX: fromLeft ? -70 : width + 70,
                        startY: -85 - i * 20,
                        endX: fromLeft ? width + 70 : -70,
                        endY: height * (0.44 + (i % 3) * 0.09),
                        delay: -(1.6 + i * 0.34),
                        routeDuration: 8.0,
                        laneAmplitude: 34 + (i % 3) * 10,
                        lanePhase: i * 0.7,
                        speed: 0.96,
                        hp: 32,
                        color: fromLeft ? '#f8a9e8' : '#9fe0ff'
                    }));
                }
            } else if (w.customType === 'sutureChoir') {
                for (let i = 0; i < 12; i++) {
                    const side = i % 2 === 0 ? -1 : 1;
                    const row = i % 4;
                    const start = { x: side < 0 ? -0.13 : 1.13, y: 0.10 + row * 0.055 };
                    const path = buildUpperEndgamePath([
                        start,
                        { x: side < 0 ? 0.18 : 0.82, y: 0.08 + row * 0.035 },
                        { x: side < 0 ? 0.62 : 0.38, y: 0.22 + row * 0.035 },
                        { x: side < 0 ? 0.36 : 0.64, y: 0.48 + row * 0.028 },
                        { x: side < 0 ? 0.12 : 0.88, y: 0.28 + row * 0.04 },
                        start
                    ], 60);
                    spawned.push(createEndgamePathEnemy({
                        path,
                        delay: -Math.floor(i / 4) * 0.52 - (i % 4) * 0.13,
                        speed: 0.9,
                        hp: i % 5 === 0 ? 70 : 42,
                        kind: i % 5 === 0 ? 'elite' : (i % 2 === 0 ? 'armored' : 'base'),
                        color: i % 5 === 0 ? '#fff0a8' : (side < 0 ? '#f6a1ff' : '#8ff7ff'),
                        pattern: i % 5 === 0 ? 'crescentFan' : (i % 3 === 0 ? 'runeRain' : 'aimedPulse'),
                        fireInterval: i % 5 === 0 ? 2.2 : 2.85,
                        fireOffset: i * 0.13,
                        visualScale: i % 5 === 0 ? 1.17 : 1.07
                    }));
                }
                for (let i = 0; i < 4; i++) {
                    const start = { x: 0.24 + i * 0.17, y: -0.14 };
                    const path = buildUpperEndgamePath([
                        start,
                        { x: start.x + (i % 2 === 0 ? 0.08 : -0.08), y: 0.12 },
                        { x: 0.50 + (i - 1.5) * 0.08, y: 0.34 },
                        { x: start.x + (i % 2 === 0 ? -0.10 : 0.10), y: 0.54 },
                        { x: start.x, y: 0.10 },
                        start
                    ], 56);
                    spawned.push(createEndgamePathEnemy({
                        path,
                        delay: -(1.15 + i * 0.24),
                        speed: 0.84,
                        hp: 46,
                        kind: 'armored',
                        color: i % 2 ? '#c4b7ff' : '#ffd0f5',
                        pattern: 'latticeWave',
                        fireInterval: 3.05,
                        fireOffset: i * 0.2,
                        visualScale: 1.08
                    }));
                }
            } else if (w.customType === 'razorParallax') {
                for (let i = 0; i < 14; i++) {
                    const fromLeft = i % 2 === 0;
                    const row = i % 7;
                    const sweep = createLaneSweepEnemy({
                        startX: fromLeft ? -86 : width + 86,
                        startY: height * (0.09 + row * 0.045),
                        endX: fromLeft ? width + 86 : -86,
                        endY: height * (0.15 + ((row + 3) % 7) * 0.061),
                        delay: -(0.42 + i * 0.25),
                        routeDuration: 9.6,
                        laneAmplitude: 16 + (row % 4) * 7,
                        lanePhase: i * 0.66 + (fromLeft ? 0 : Math.PI),
                        speed: 0.93,
                        hp: i % 6 === 2 ? 76 : 44,
                        color: i % 6 === 2 ? '#ffe27a' : (fromLeft ? '#92f7ff' : '#ff91da'),
                        isElite: i % 6 === 2,
                        enemyShipKind: i % 6 === 2 ? 'elite' : 'armored'
                    });
                    spawned.push(armEndgameWaveEnemy(sweep, {
                        pattern: i % 6 === 2 ? 'spiralNeedle' : (i % 3 === 0 ? 'crescentFan' : 'downFan'),
                        fireInterval: i % 6 === 2 ? 2.15 : 2.75,
                        fireOffset: i * 0.12,
                        visualScale: i % 6 === 2 ? 1.16 : 1.06,
                        fireColor: i % 2 === 0 ? '#c8f4ff' : '#ffd0f5'
                    }));
                }
                for (let i = 0; i < 4; i++) {
                    const side = i % 2 === 0 ? -1 : 1;
                    const start = { x: side < 0 ? -0.11 : 1.11, y: 0.22 + i * 0.035 };
                    const path = buildUpperEndgamePath([
                        start,
                        { x: 0.50 + side * 0.22, y: 0.10 + i * 0.02 },
                        { x: 0.50 - side * 0.16, y: 0.32 + i * 0.025 },
                        { x: 0.50 + side * 0.10, y: 0.56 },
                        start
                    ], 52);
                    spawned.push(createEndgamePathEnemy({
                        path,
                        delay: -(1.55 + i * 0.34),
                        speed: 0.82,
                        hp: 58,
                        kind: 'elite',
                        color: i % 2 ? '#a6ffda' : '#f6a1ff',
                        pattern: 'runeRain',
                        fireInterval: 2.65,
                        fireOffset: i * 0.24,
                        visualScale: 1.16
                    }));
                }
            } else if (w.customType === 'graveOrbit') {
                const centers = [
                    { x: 0.25, y: 0.23 },
                    { x: 0.50, y: 0.18 },
                    { x: 0.75, y: 0.25 },
                    { x: 0.38, y: 0.43 },
                    { x: 0.62, y: 0.45 }
                ];
                for (let i = 0; i < 15; i++) {
                    const center = centers[i % centers.length];
                    const topX = Math.max(0.12, Math.min(0.88, center.x + ((i % 3) - 1) * 0.05));
                    const rx = 0.10 + (i % 3) * 0.025;
                    const ry = 0.075 + (i % 2) * 0.018;
                    const start = { x: topX, y: -0.13 };
                    const path = [start];
                    const phase = (i % 4) * Math.PI / 2;
                    for (let step = 0; step <= 20; step++) {
                        const t = phase + step / 20 * Math.PI * 2;
                        path.push({ x: center.x + Math.cos(t) * rx, y: center.y + Math.sin(t) * ry });
                    }
                    path.push({ x: topX + (i % 2 === 0 ? 0.08 : -0.08), y: 0.08 }, start);
                    spawned.push(createEndgamePathEnemy({
                        path: buildUpperEndgamePath(path, 66),
                        delay: -Math.floor(i / 5) * 0.62 - (i % 5) * 0.14,
                        speed: 0.82,
                        hp: i % 5 === 0 ? 82 : 46,
                        kind: i % 5 === 0 ? 'elite' : (i % 2 ? 'armored' : 'base'),
                        color: i % 5 === 0 ? '#ffffff' : (i % 2 ? '#bda8ff' : '#8ff7ff'),
                        pattern: i % 5 === 0 ? 'latticeWave' : (i % 3 === 0 ? 'crescentFan' : 'aimedPulse'),
                        fireInterval: i % 5 === 0 ? 2.25 : 2.9,
                        fireOffset: i * 0.11,
                        visualScale: i % 5 === 0 ? 1.18 : 1.08
                    }));
                }
                for (let i = 0; i < 4; i++) {
                    const fromLeft = i % 2 === 0;
                    const sweep = createLaneSweepEnemy({
                        startX: fromLeft ? -82 : width + 82,
                        startY: height * (0.18 + i * 0.055),
                        endX: fromLeft ? width + 82 : -82,
                        endY: height * (0.48 + (i % 2) * 0.07),
                        delay: -(1.4 + i * 0.52),
                        routeDuration: 8.7,
                        laneAmplitude: 42,
                        lanePhase: i * 0.8,
                        speed: 0.86,
                        hp: 44,
                        color: fromLeft ? '#ffe0ff' : '#b5f7ff',
                        enemyShipKind: 'armored'
                    });
                    spawned.push(armEndgameWaveEnemy(sweep, {
                        pattern: 'runeRain',
                        fireInterval: 2.85,
                        fireOffset: i * 0.3,
                        visualScale: 1.08
                    }));
                }
            } else if (w.customType === 'omenLattice') {
                for (let i = 0; i < 16; i++) {
                    const fromTop = i % 4 === 0;
                    const side = i % 2 === 0 ? -1 : 1;
                    const start = fromTop
                        ? { x: 0.16 + (i % 8) * 0.095, y: -0.14 }
                        : { x: side < 0 ? -0.12 : 1.12, y: 0.12 + (i % 5) * 0.055 };
                    const path = buildUpperEndgamePath([
                        start,
                        { x: 0.50 + side * (0.28 - (i % 3) * 0.05), y: 0.11 + (i % 4) * 0.04 },
                        { x: 0.50 - side * 0.22, y: 0.32 + (i % 3) * 0.055 },
                        { x: 0.50 + side * 0.18, y: 0.58 },
                        { x: fromTop ? start.x : (side < 0 ? -0.12 : 1.12), y: fromTop ? 0.08 : 0.18 + (i % 4) * 0.06 },
                        start
                    ], 64);
                    spawned.push(createEndgamePathEnemy({
                        path,
                        delay: -Math.floor(i / 4) * 0.54 - (i % 4) * 0.11,
                        speed: i % 4 === 0 ? 0.78 : 0.86,
                        hp: i % 4 === 0 ? 88 : 48,
                        kind: i % 4 === 0 ? 'elite' : (i % 3 === 0 ? 'armored' : 'base'),
                        color: i % 4 === 0 ? '#fff2a8' : (side < 0 ? '#ff9be6' : '#8eefff'),
                        pattern: i % 4 === 0 ? 'crescentFan' : (i % 3 === 0 ? 'latticeWave' : 'runeRain'),
                        fireInterval: i % 4 === 0 ? 2.05 : 2.72,
                        fireOffset: i * 0.1,
                        visualScale: i % 4 === 0 ? 1.2 : 1.09
                    }));
                }
                for (let i = 0; i < 4; i++) {
                    const fromLeft = i % 2 === 0;
                    const sweep = createLaneSweepEnemy({
                        startX: fromLeft ? -90 : width + 90,
                        startY: height * (0.10 + i * 0.035),
                        endX: fromLeft ? width + 90 : -90,
                        endY: height * (0.22 + ((i + 2) % 4) * 0.095),
                        delay: -(1.9 + i * 0.36),
                        routeDuration: 9.25,
                        laneAmplitude: 24 + i * 6,
                        lanePhase: i * 1.1,
                        speed: 0.9,
                        hp: 58,
                        color: fromLeft ? '#c8f4ff' : '#ffd0f5',
                        enemyShipKind: 'elite'
                    });
                    spawned.push(armEndgameWaveEnemy(sweep, {
                        pattern: 'spiralNeedle',
                        fireInterval: 2.35,
                        fireOffset: i * 0.22,
                        visualScale: 1.15,
                        fireColor: '#fff2a8'
                    }));
                }
            }

            return spawned;
        }

        const WaveManager = {
            currentWave: 0,
            waveDelay: 0,
            interWaveDelay: 1.0,
            hasSpawnedWave: false,
            interWaveDelayQueued: false,
            flyByAssignments: {},
            scoutFlyByAssignments: {},
            signalDrifts: {},
            earlyProceduralWaves: {},
            activeGalaxyIndex: 0,
            formationId: 0,
            activeFormationId: 0,
            pendingFormationUnits: 0,
            waves: [
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
                { count: 17, customType: 'prismRift' }, // Wave 31 — Prism Conduit mini-boss
                { count: 18, customType: 'phaseCorridor' }, // Wave 32
                { count: 19, customType: 'latticeBloom' }, // Wave 33
                { count: 20, customType: 'braidCrucible' }, // Wave 34
                { isBoss: true, name: 'ECLIPSE WARDEN', sprite: ECLIPSE_WARDEN_SPRITE, hp: 2600 } // Wave 35
            ],
            getRunWaveLimitForGalaxy(galaxyIndex = this.getActiveGalaxyIndex()) {
                return getGalaxyRunWaveLimit(galaxyIndex);
            },
            getRunWaveLimit() {
                return this.getRunWaveLimitForGalaxy(this.getActiveGalaxyIndex());
            },
            getActiveGalaxyIndex() {
                if (typeof currentGalaxyIndex === 'number') return currentGalaxyIndex;
                return this.activeGalaxyIndex || 0;
            },
            prepareGalaxyRun(galaxyIndex = 0) {
                this.activeGalaxyIndex = galaxyIndex;
                this.currentWave = 0;
                this.waveDelay = 0;
                this.hasSpawnedWave = false;
                this.interWaveDelayQueued = false;
                this.pendingFormationUnits = 0;
                this.activeFormationId = 0;
                this.formationId = 0;
                this.randomizeEarlyProceduralWaves(galaxyIndex === 1 ? 1.10 : 1);
                this.randomizeFlyByAssignments();
                this.randomizeSignalDrifts();
            },
            randomizeEarlyProceduralWaves(difficultyScale = 1) {
                this.earlyProceduralWaves = {};
                const themeUseCounts = {};
                let lastThemeId = null;
                for (let waveNumber = 1; waveNumber <= EARLY_PROCEDURAL_WAVE_COUNT; waveNumber++) {
                    const theme = pickEarlyProceduralTheme(waveNumber, lastThemeId, themeUseCounts);
                    this.earlyProceduralWaves[waveNumber] = tuneEarlyProceduralWaveForGalaxy(
                        buildEarlyProceduralWaveDef(waveNumber, theme.id),
                        difficultyScale
                    );
                    themeUseCounts[theme.id] = (themeUseCounts[theme.id] || 0) + 1;
                    lastThemeId = theme.id;
                }
            },
            getGalaxyTwoWaveDefinition(waveNumber) {
                if (waveNumber <= EARLY_PROCEDURAL_WAVE_COUNT) {
                    return this.earlyProceduralWaves[waveNumber] || tuneEarlyProceduralWaveForGalaxy(buildEarlyProceduralWaveDef(waveNumber, 'patrol'), 1.10);
                }
                const galaxyTwoMap = {
                    5: { isBoss: true, name: 'MATRIX HYDRA', sprite: MATRIX_HYDRA_SPRITE, hp: 1080, galaxyBossType: 'matrixHydra' },
                    6: GALAXY_TWO_LEGACY_WAVES[26],
                    7: GALAXY_TWO_LEGACY_WAVES[27],
                    8: GALAXY_TWO_LEGACY_WAVES[28],
                    9: GALAXY_TWO_LEGACY_WAVES[29],
                    10: { isBoss: true, name: 'AXIOM CORE', sprite: AXIOM_CORE_SPRITE, hp: 1420, galaxyBossType: 'axiomCore' },
                    11: { count: 16, customType: 'shatteredOrbit' },
                    12: { count: 12, customType: 'twinRondo' },
                    13: { count: 13, customType: 'anchorSiege' },
                    14: { count: 14, customType: 'falseHorizon' },
                    15: BLACK_VOID_BOSS_WAVE,
                    16: 31,
                    17: 32,
                    18: 33,
                    19: 34,
                    20: BATTLE_STARSHIP_BOSS_WAVE
                };
                const mapped = galaxyTwoMap[waveNumber];
                if (typeof mapped === 'number') {
                    return cloneWaveDefinition(this.waves[mapped - 1], {
                        galaxySourceWave: mapped,
                        galaxyWaveNumber: waveNumber
                    });
                }
                return cloneWaveDefinition(mapped, { galaxyWaveNumber: waveNumber });
            },
            getWaveDefinitionForWave(waveNumber) {
                if (this.getActiveGalaxyIndex() === 1) return this.getGalaxyTwoWaveDefinition(waveNumber);
                if (waveNumber <= EARLY_PROCEDURAL_WAVE_COUNT && this.earlyProceduralWaves[waveNumber]) {
                    return this.earlyProceduralWaves[waveNumber];
                }
                return cloneWaveDefinition(this.waves[waveNumber - 1], { galaxyWaveNumber: waveNumber });
            },
            getEarlyProceduralWaveInfo(waveNumber) {
                const waveDef = this.earlyProceduralWaves[waveNumber];
                if (!waveDef || !waveDef.isEarlyProcedural) return null;
                return {
                    id: waveDef.proceduralThemeId,
                    name: waveDef.proceduralThemeName,
                    hudLabel: waveDef.proceduralHudLabel,
                    hudDesc: waveDef.proceduralHudDesc,
                    color: waveDef.proceduralColor,
                    count: waveDef.count,
                    type: waveDef.type
                };
            },
            randomizeFlyByAssignments() {
                this.flyByAssignments = {};
                this.scoutFlyByAssignments = {};
                const groups = [
                    { tier: 1, min: 1, max: 4 },
                    { tier: 2, min: 6, max: 9 },
                    { tier: 3, min: 11, max: 14 },
                    { tier: 4, min: 16, max: 19 }
                ];
                for (const group of groups) {
                    const heavyWave = pickRandomIntInclusive(group.min, group.max);
                    const scoutWave = pickDistinctRandomInclusive(group.min, group.max, heavyWave);
                    this.flyByAssignments[group.tier] = heavyWave;
                    this.scoutFlyByAssignments[group.tier] = scoutWave;
                }
            },
            randomizeSignalDrifts() {
                this.signalDrifts = {};
                let lastDriftId = null;
                for (let i = 0; i < this.getRunWaveLimit(); i++) {
                    const waveNumber = i + 1;
                    const drift = pickSignalDriftForWave(this.getWaveDefinitionForWave(waveNumber), waveNumber, lastDriftId);
                    if (drift) {
                        this.signalDrifts[waveNumber] = drift;
                        lastDriftId = drift.id;
                    } else {
                        lastDriftId = null;
                    }
                }
            },
            getSignalDriftForWave(waveNumber) {
                return this.signalDrifts[waveNumber] || null;
            },
            getFlyByTierForWave(waveNumber) {
                for (const [tierText, assignedWave] of Object.entries(this.flyByAssignments)) {
                    if (assignedWave === waveNumber) return parseInt(tierText, 10);
                }
                return 0;
            },
            getScoutFlyByTierForWave(waveNumber) {
                for (const [tierText, assignedWave] of Object.entries(this.scoutFlyByAssignments)) {
                    if (assignedWave === waveNumber) return parseInt(tierText, 10);
                }
                return 0;
            },
            isFinalRunBoss(defeatedBoss) {
                return !!(defeatedBoss && defeatedBoss.runWaveNumber >= this.getRunWaveLimit());
            },
            beginFormation(unitCount) {
                this.formationId += 1;
                this.activeFormationId = this.formationId;
                this.pendingFormationUnits = Math.max(0, unitCount);
                return this.activeFormationId;
            },
            resolveFormationUnit(enemy) {
                if (!enemy || enemy.waveFormationResolved || enemy.waveFormationId !== this.activeFormationId) return;
                enemy.waveFormationResolved = true;
                if (this.pendingFormationUnits > 0) this.pendingFormationUnits--;
            },
            syncFormationState(liveEnemies) {
                if (this.pendingFormationUnits <= 0 || this.activeFormationId <= 0) return;
                const source = Array.isArray(liveEnemies) ? liveEnemies : [];
                let unresolvedUnits = 0;
                for (let i = 0; i < source.length; i++) {
                    const enemy = source[i];
                    if (!enemy || enemy.waveFormationResolved || enemy.waveFormationId !== this.activeFormationId) continue;
                    unresolvedUnits++;
                }
                if (unresolvedUnits < this.pendingFormationUnits) {
                    this.pendingFormationUnits = unresolvedUnits;
                }
            },
            spawn() {
                const waveNumber = this.currentWave + 1;
                const w = this.getWaveDefinitionForWave(waveNumber);
                if (!w) return;
                const signalDrift = this.getSignalDriftForWave(waveNumber);
                pushWaveSignalNotice(waveNumber, signalDrift);
                if (w && w.isEarlyProcedural && typeof console !== 'undefined') {
                    console.info(`[Wave Test] Wave ${waveNumber}: ${w.proceduralThemeName} (${w.type}, ${w.count} enemies)`);
                }
                if (w.isBoss) {
                    this.pendingFormationUnits = 0;
                    boss = { 
                        x: width / 2, y: -200, hp: w.hp, maxHp: w.hp, name: w.name, sprite: w.sprite || [],
                        phase: 'INTRO', timer: 0, attackPattern: 0, lastFire: 0, spiralAngle: 0, 
                        color: '#444444', // All bosses start grey in intro
                        flashTimer: 0,
                        runWaveNumber: waveNumber,
                        isFinalRunBoss: waveNumber >= this.getRunWaveLimit(),
                        galaxyBossType: w.galaxyBossType || null
                    };
                    if (w.name === 'MATRIX HYDRA') {
                        startMatrixHydraMusic();
                        boss.isMatrixHydra = true;
                        boss.color = '#55f7d1';
                        boss.renderScale = 0.92;
                        boss.stage = 1;
                        boss.introStartX = boss.x;
                        boss.introStartY = boss.y;
                        boss.introTargetX = width / 2;
                        boss.introTargetY = height * 0.2;
                        boss.driftTimer = 0;
                        boss.ringAngle = 0;
                        boss.codeGateTimer = 0;
                        boss.matrixBurstTimer = 0;
                    }
                    if (w.name === 'AXIOM CORE') {
                        startAxiomCoreMusic();
                        boss.isAxiomCore = true;
                        boss.color = '#bda8ff';
                        boss.renderScale = 0.88;
                        boss.stage = 1;
                        boss.introStartX = boss.x;
                        boss.introStartY = boss.y;
                        boss.introTargetX = width / 2;
                        boss.introTargetY = height * 0.18;
                        boss.driftTimer = 0;
                        boss.axiomAngle = 0;
                        boss.axiomWallFlip = false;
                        boss.axiomOrbitTimer = 0;
                    }
                    if (w.name === 'NULL PHANTOM') {
                        startVoidWalkerMusic();
                        boss.introStartY = boss.y;
                    }
                    if (w.name === 'GHOST SIGNAL') {
                        startSignalGhostMusic();
                        boss.stage = 1;
                        boss.stageTwoStarted = false;
                    }
                    if (w.name === 'OVERHEATING FIREWALL') {
                        startOverheatingFirewallMusic();
                        boss.stage = 1;
                        boss.stageTwoStarted = false;
                        boss.introStartY = boss.y;
                        boss.animFrame = 0;
                        boss.coreTimer = 0;
                        boss.isVulnerable = false;
                    }
                    if (w.name === 'DISTORTED GLITCH') {
                        startDistortedGlitchMusic();
                        boss.isGlitch = true; boss.stage = 1; boss.colorCycleTimer = 0;
                        boss.glitchVx = 0; boss.glitchVy = 0; boss.dirChangeTimer = 0;
                        boss.baseSpeed = 100; boss.scatterTimer = 0; boss.chargeTimer = 0;
                        boss.isCharging = false; boss.chargeDuration = 0; boss.glowIntensity = 0;
                        boss.transitionFlash = 0; boss.transitionTextTimer = 0; boss.deathTimer = 0;
                        boss.isDeadGlitching = false; boss.scrambledName = "DISTORTED GLITCH";
                        boss.scrambleTimer = 0; boss.barLieTimer = 0; boss.barLieWidth = 0;
                        boss.isDoubleCharge = false; boss.doubleChargePhase = 0;
                        boss.codeVolleyTimer = 5.0 + Math.random() * 3.0; boss.codeVolleyShots = 0; boss.codeVolleyDelay = 0; boss.isCodeVolley = false;
                        boss.matrixRainTimer = 3.2;
                        boss.glitchTearTimer = 999;
                        boss.introStartX = boss.x; boss.introStartY = boss.y;
                        boss.introTargetX = width / 2; boss.introTargetY = height * 0.2;
                    }
                    if (w.name === 'TURNBOUND TRINITY') {
                        startBattleStarshipMusic();
                        boss.isTurnboundTrinity = true;
                        boss.color = '#555b68';
                        boss.renderScale = 0.44;
                        boss.trinityActiveIndex = 0;
                        boss.trinityTurnState = 'INTRO';
                        boss.trinityStateTimer = 0;
                        boss.trinityLastFire = 0;
                        boss.trinityPatternAngle = 0;
                        boss.trinitySwordAngle = Math.PI / 2;
                        boss.isVulnerable = false;
                        boss.isShielded = true;
                        boss.parts = [
                            { id: 'turret', x: width * 0.24, y: -210, vx: 0, vy: 0, color: '#ffd06a', label: 'TURRET' },
                            {
                                id: 'sword',
                                x: width * 0.5,
                                y: -250,
                                vx: 0,
                                vy: 0,
                                color: '#c8f4ff',
                                label: 'SWORD',
                                sprite: TURNBOUND_TRINITY_SWORD_RENDER_SPRITE,
                                visibleCells: TURNBOUND_TRINITY_SWORD_VISIBLE_CELLS,
                                spriteWidth: TURNBOUND_TRINITY_SWORD_SPRITE_WIDTH,
                                renderScale: 0.37
                            },
                            {
                                id: 'spell',
                                x: width * 0.76,
                                y: -230,
                                vx: 0,
                                vy: 0,
                                color: '#b99dff',
                                label: 'SPELL',
                                sprite: TURNBOUND_TRINITY_SPELL_RENDER_SPRITE,
                                visibleCells: TURNBOUND_TRINITY_SPELL_VISIBLE_CELLS,
                                spriteWidth: TURNBOUND_TRINITY_SPELL_SPRITE_WIDTH,
                                renderScale: 0.43,
                                spritePalette: TURNBOUND_TRINITY_SPELL_PALETTE
                            }
                        ];
                    }
                    if (w.name === 'BLACK VOID') {
                        startBlackVoidMusic();
                        boss.isBlackVoid = true;
                        boss.color = '#8b78ff';
                        boss.introStartX = boss.x; boss.introStartY = boss.y;
                        boss.introTargetX = width / 2; boss.introTargetY = height * 0.2;
                        boss.driftTimer = 0;
                        boss.eventHorizonTimer = 4.2;
                        boss.eventHorizonActive = false;
                        boss.eventHorizonDuration = 0;
                        boss.eventHorizonElapsed = 0;
                        boss.absorbedShots = 0;
                        boss.retaliationBursts = 0;
                        boss.beamAbsorbTimer = 0;
                        boss.patternDuration = 5.6;
                        boss.petalsAngle = 0;
                    }
                    if (w.name === 'DREAD LITURGY') {
                        startBlackVoidMusic();
                        boss.isDreadLiturgy = true;
                        boss.color = '#d8d4ff';
                        boss.renderScale = 1.12;
                        boss.introStartX = boss.x;
                        boss.introStartY = boss.y;
                        boss.introTargetX = width / 2;
                        boss.introTargetY = height * 0.18;
                        boss.driftTimer = 0;
                        boss.attackPattern = 0;
                        boss.lastFire = 0;
                        boss.isVulnerable = false;
                        boss.isShielded = true;
                        boss.dreadSafeLane = 1;
                        boss.dreadCastIndex = 0;
                        boss.dreadPatternStep = -1;
                        boss.dreadWarningFired = false;
                        boss.dreadPatternFired = false;
                        boss.dreadSwingIndex = -1;
                        boss.dreadSlash = null;
                        boss.dreadDamageTimer = 0;
                    }
                    if (w.name === 'ECLIPSE WARDEN') {
                        startDistortedGlitchMusic();
                        boss.isEclipseWarden = true;
                        boss.stage = 1;
                        boss.color = '#c8f4ff';
                        boss.renderScale = 0.92;
                        boss.introStartX = boss.x;
                        boss.introStartY = boss.y;
                        boss.introTargetX = width / 2;
                        boss.introTargetY = height * 0.19;
                        boss.driftTimer = 0;
                        boss.attackPattern = 0;
                        boss.lastFire = 0;
                        boss.eclipseShielded = true;
                        boss.isVulnerable = false;
                        boss.eclipseOpenTimer = 0;
                        boss.eclipseTransitionTimer = 0;
                        boss.eclipseSealsSpawned = false;
                        boss.eclipseRingAngle = 0;
                    }
                    if (w.name === 'BATTLE STARSHIP') {
                        startRoseBossMusic();
                        boss.isBattleStarship = true;
                        boss.color = '#7ed4ff';
                        boss.renderScale = 0.55;
                        boss.introStartY = boss.y;
                        boss.attackPattern = 0;
                        boss.lastFire = 0;
                        boss.chargeTimer = 0;
                        boss.isCharging = false;
                        boss.isShielded = false;
                        boss.shieldTimer = 0;
                        boss.portFireSide = 0;
                        boss.fightersSpawned = false;
                        boss.driftTimer = 0;
                        boss.engineGlow = 0;
                        boss.beamSweepX = 0;
                        boss.beamSweepDir = 1;
                        boss.isVulnerable = true;
                    }
                } else {
                    const flyByTier = this.getFlyByTierForWave(waveNumber);
                    const scoutFlyByTier = this.getScoutFlyByTierForWave(waveNumber);
                    const flyByConfig = flyByTier > 0 ? getFlyByConfigForTier(flyByTier) : null;
                    const scoutFlyByConfig = scoutFlyByTier > 0 ? getScoutFlyByConfigForTier(scoutFlyByTier) : null;
                    const formationUnits = w.count;
                    const formationId = this.beginFormation(formationUnits);
                    if (w.customType) {
                        const customEnemies = spawnExtendedLateWaveEnemies(w);
                        for (let i = 0; i < customEnemies.length; i++) {
                            const enemy = applySignalDriftToEnemy(customEnemies[i], signalDrift, i, w);
                            enemy.waveFormationId = formationId;
                            enemy.waveFormationResolved = false;
                            enemies.push(enemy);
                        }
                    } else if (w.type && (w.type.startsWith('zig') || w.type.startsWith('wave') || w.type === 'snake')) {
                        let path, pathA, pathB;
                        if (w.type === 'zig1') path = [{x: 0.1, y: -0.18}, {x: 0.84, y: 0.14}, {x: 0.16, y: 0.30}, {x: 0.86, y: 0.48}, {x: 0.24, y: 0.66}, {x: 0.10, y: 0.44}, {x: 0.1, y: -0.18}];
                        else if (w.type === 'zig2') path = [{x: 0.9, y: -0.18}, {x: 0.16, y: 0.14}, {x: 0.84, y: 0.31}, {x: 0.14, y: 0.49}, {x: 0.76, y: 0.66}, {x: 0.90, y: 0.44}, {x: 0.9, y: -0.18}];
                        else if (w.type === 'zig3') path = [{x: 0.5, y: -0.2}, {x: 0.05, y: 0.15}, {x: 0.95, y: 0.3}, {x: 0.05, y: 0.45}, {x: 0.95, y: 0.6}, {x: 0.5, y: -0.2}];
                        else if (w.type === 'zig5') path = buildDenseZigPath();
                        else if (w.type === 'zig4') path = [{x: 0.5, y: -0.2}, {x: 0.8, y: 0.09}, {x: 0.2, y: 0.26}, {x: 0.8, y: 0.43}, {x: 0.2, y: 0.6}, {x: 0.5, y: -0.2}];
                        else if (w.type === 'wave2') path = [{x:0.2, y:-0.12}, {x:0.78, y:0.16}, {x:0.16, y:0.30}, {x:0.86, y:0.45}, {x:0.22, y:0.63}, {x:0.70, y:0.50}, {x:0.8, y:-0.12}];
                        else if (w.type === 'wave3') path = [{x:0.5, y:-0.12}, {x:0.5, y:0.23}, {x:0.20, y:0.23}, {x:0.20, y:0.09}, {x:0.80, y:0.09}, {x:0.80, y:0.39}, {x:0.28, y:0.39}, {x:0.28, y:0.56}, {x:0.88, y:0.56}, {x:0.88, y:0.68}, {x:0.62, y:0.68}, {x:0.9, y:-0.12}];
                        else if (w.type === 'wave4') {
                            pathA = [{x:0.18, y:-0.12}, {x:0.78, y:0.26}, {x:0.34, y:0.50}, {x:0.86, y:0.68}, {x:0.50, y:0.36}, {x:0.1, y:-0.12}];
                            pathB = [{x:0.82, y:-0.12}, {x:0.22, y:0.26}, {x:0.66, y:0.50}, {x:0.14, y:0.68}, {x:0.50, y:0.36}, {x:0.9, y:-0.12}];
                        }
                        else if (w.type === 'wave6') {
                            pathA = [{x:0.1, y:-0.12}, {x:0.38, y:0.14}, {x:0.38, y:0.40}, {x:0.16, y:0.65}, {x:0.08, y:0.48}, {x:0.1, y:-0.12}];
                            pathB = [{x:0.9, y:-0.12}, {x:0.62, y:0.14}, {x:0.62, y:0.40}, {x:0.84, y:0.65}, {x:0.92, y:0.48}, {x:0.9, y:-0.12}];
                        }
                        else if (w.type === 'wave7') path = [{x:0.5, y:-0.12}, {x:0.24, y:0.18}, {x:0.74, y:0.42}, {x:0.50, y:0.66}, {x:0.26, y:0.42}, {x:0.76, y:0.18}, {x:0.2, y:-0.12}];
                        else if (w.type === 'wave8') path = buildFigureEightWavePath();
                        else if (w.type === 'wave9') path = buildWaveNineReturnPath();
                        else if (w.type === 'snake') path = buildSnakeLoopPath();

                        if (path && w.reversePath) path = path.map(point => ({ x: 1 - point.x, y: point.y }));
                        if (path) path = applySignalDriftToPath(cloneWavePath(path), signalDrift);
                        if (pathA) pathA = applySignalDriftToPath(cloneWavePath(pathA), signalDrift);
                        if (pathB) pathB = applySignalDriftToPath(cloneWavePath(pathB), signalDrift);

                        const stagger = typeof w.stagger === 'number'
                            ? w.stagger
                            : w.type === 'snake'
                            ? 1.8
                            : (w.type === 'wave8' ? 2.2 : (w.type === 'wave6' ? 0.55 : (w.type === 'zig5' ? 0.35 : (w.doubleElite ? 0.25 : (w.speed ? 0.4 : 0.6)))));
                        for (let i = 0; i < w.count; i++) {
                            const isTail = (w.type === 'snake' && i === w.count - 1);
                            const isElite = (w.elite && i === Math.floor(w.count / 2)) || 
                                            (w.doubleElite && (i === Math.floor(w.count / 3) || i === Math.floor(w.count * 2 / 3))) ||
                                            (w.type === 'snake' && i % 10 === 0 && !isTail);
                            const isArmored = (!w.weakOnly && !isElite && i % 2 === 1 && !isTail);
                            
                            let sprite = ["  ▄▄█▄▄  ", " ▀▀███▀▀ ", "   ▀█▀   "];
                            let hp = 10, color = w.color;
                            let enemyShipKind = 'base';
                            
                            if (isTail) {
                                sprite = ["  ▲  ", " (█) ", "(███)", " ▀█▀ "];
                                hp = 200; color = '#e38914';
                            } else if (isElite) {
                                sprite = [" ▄▄███▄▄ ", "▀▀█████▀▀", " ▀█████▀ ", "   ▀█▀   "];
                                hp = 30; color = '#0044ff'; enemyShipKind = 'elite';
                            } else if (isArmored) {
                                sprite = [" ▄▄▄█▄▄▄ ", " ▀▀███▀▀ ", "   ▀█▀   "];
                                hp = 20; color = '#00ff44'; enemyShipKind = 'armored';
                            }

                            if (w.enemyHpMult && !isTail) {
                                hp = Math.max(1, Math.ceil(hp * w.enemyHpMult));
                            }

                            let currentPath = path;
                            if (pathA && pathB) {
                                currentPath = (i % 2 === 0) ? pathA : pathB;
                            }
                            
                            let pathT = -i * stagger;
                            if (w.type === 'wave8') {
                                pathT = -i * stagger;
                            } else if (pathA && pathB) {
                                pathT = w.alternateSideSpawn ? -i * stagger : -Math.floor(i / 2) * stagger;
                            } else if (w.type === 'wave7') {
                                pathT = -i * stagger;
                            } else if (w.type === 'wave9') {
                                pathT = -i * stagger;
                            }

                            const enemy = {
                                x: currentPath[0].x * width, y: currentPath[0].y * height, vx: 0, vy: 0, 
                                sprite, color, hp, maxHp: hp, isArmored, isElite, isFlameGuardian: isTail,
                                onScreen: false, flashTimer: 0, hoverX: 0, fireTimer: 0,
                                path: currentPath, pathIndex: 0, pathT: pathT, speedMult: w.speed || 1, pathTypeWave: w.type,
                                pathLoopsCompleted: 0, despawnOnLoopEnd: true,
                                waveFormationId: formationId, waveFormationResolved: false
                            };
                            if (!isTail) configureEnemyShipVisual(enemy, enemyShipKind);
                            enemies.push(applySignalDriftToEnemy(applyRemasteredWavePattern(enemy, w, i), signalDrift, i, w));
                        }
                    } else {
                        // Advanced parametric paths for Waves 16-19
                        for (let i = 0; i < w.count; i++) {
                            const isElite = (w.elite && i === Math.floor(w.count / 2)) || 
                                            (w.doubleElite && (i === Math.floor(w.count / 3) || i === Math.floor(w.count * 2 / 3)));
                            const isArmored = !w.weakOnly && !isElite && i % 2 === 1;
                            let sprite = ["  ▄▄█▄▄  ", " ▀▀███▀▀ ", "   ▀█▀   "];
                            let hp = (w.hpMult || 1) * 10;
                            let color = w.color || '#ff00ff';
                            let enemyShipKind = 'base';
                            if (isElite) {
                                sprite = [" ▄▄███▄▄ ", "▀▀█████▀▀", " ▀█████▀ ", "   ▀█▀   "];
                                hp = (w.hpMult || 1) * 30; color = '#0044ff'; enemyShipKind = 'elite';
                            } else if (isArmored) {
                                sprite = [" ▄▄▄█▄▄▄ ", " ▀▀███▀▀ ", "   ▀█▀   "];
                                hp = (w.hpMult || 1) * 20; color = '#00ff44'; enemyShipKind = 'armored';
                            }
                            
                            let startX = width / 2;
                            let startY = -50;
                            let delay = -i * (w.stagger || 0.3);
                            let routeDuration = 0;
                            let braidLane = 0;
                            let braidPhase = 0;
                            let braidOffset = 0;
                            let braidAmplitude = 0;
                            let weaveAmplitude = 150;
                            let weaveFrequency = 3.5;
                            let weavePhase = 0;
                            let weaveVerticalSpeed = 120;
                            let scatterSpeed = w.scatterSpeed || 650;
                            let horizontalHold = w.horizontalHold || 2.5;
                            let horizontalLateralSpeed = w.horizontalLateralSpeed || 180;
                            let horizontalDropSpeed = w.horizontalDropSpeed || 250;
                            let sideEntry = false;
                            let sideEntryDuration = 0;
                            let weaveOriginX = 0;
                            let weaveOriginY = 0;
                            let arcEndX = 0;
                            let arcEndY = 0;
                            let arcControlX = 0;
                            let arcControlY = 0;
                            let arcPhase = 0;
                            let arcWaveAmpX = 0;
                            let arcWaveAmpY = 0;
                            let riseTime = 0;
                            let riseTargetX = 0;
                            let riseTargetY = 0;
                            let riseDriftX = 0;
                            let risePhase = 0;
                            let constellationEndX = 0;
                            let constellationEndY = 0;
                            let constellationControlX = 0;
                            let constellationControlY = 0;
                            let constellationPhase = 0;
                            let constellationLoopAmp = 0;
                            
                            if (w.type === 'horizontalDrop') {
                                startX = i % 2 === 0 ? -50 : width + 50;
                                startY = height * (0.14 + (i % 3) * 0.045) + Math.random() * 35;
                                routeDuration = w.routeDuration || 8.8;
                            } else if (w.type === 'weave') {
                                const laneCount = Math.max(2, w.weaveLaneCount || 3);
                                const groupIndex = Math.floor(i / laneCount);
                                const laneIndex = i % laneCount;
                                const laneRatio = laneCount === 1 ? 0.5 : laneIndex / (laneCount - 1);
                                const laneOffset = laneRatio - 0.5;
                                const centerDistance = Math.abs(laneIndex - (laneCount - 1) / 2);
                                const groupShift = groupIndex % 2 === 0 ? -0.035 : 0.035;
                                startX = width * (0.5 + laneOffset * (w.weaveLaneSpread || 0.52) + groupShift);
                                startY = -70 - groupIndex * 34 - centerDistance * 18;
                                delay = -(groupIndex * (w.weaveGroupDelay || 0.72) + centerDistance * (w.weaveIntraDelay || 0.14));
                                routeDuration = w.routeDuration || 7.2;
                                weaveAmplitude = width * (w.weaveAmplitudeRatio || 0.11);
                                weaveFrequency = w.weaveFrequency || 2.6;
                                weavePhase = (groupIndex % 2 === 0 ? 0 : Math.PI) + laneIndex * (Math.PI / Math.max(1, laneCount - 1));
                                weaveVerticalSpeed = w.weaveVerticalSpeed || 145;
                                const sideEntrySlots = w.sideEntrySlots || [];
                                const sideEntryIndex = sideEntrySlots.indexOf(i);
                                if (sideEntryIndex >= 0) {
                                    const side = sideEntryIndex % 2 === 0 ? -1 : 1;
                                    weaveOriginX = startX;
                                    weaveOriginY = height * (0.08 + sideEntryIndex * 0.045);
                                    startX = side < 0 ? -54 : width + 54;
                                    startY = height * (0.09 + sideEntryIndex * 0.035);
                                    delay = -(0.7 + sideEntryIndex * 1.25);
                                    sideEntry = true;
                                    sideEntryDuration = 1.9;
                                }
                            } else if (w.type === 'spiral') {
                                startX = width / 2;
                                startY = height / 3;
                                delay = -(i % 4) * 0.08;
                                routeDuration = w.routeDuration || 10.5;
                            } else if (w.type === 'arcCascade') {
                                const side = i % 2 === 0 ? -1 : 1;
                                const pairIndex = Math.floor(i / 2);
                                const lane = pairIndex % 4;
                                const laneRatio = lane / 3;
                                startX = side < 0 ? -58 : width + 58;
                                startY = height * (0.08 + laneRatio * 0.12);
                                arcEndX = side < 0 ? width + 68 : -68;
                                arcEndY = height * (0.18 + ((lane + 2) % 4) * 0.065);
                                arcControlX = width * (0.5 + side * (0.14 - laneRatio * 0.08));
                                arcControlY = height * (0.09 + ((lane + 1) % 4) * 0.055);
                                arcPhase = i * 0.72 + (side < 0 ? 0 : Math.PI);
                                arcWaveAmpX = width * (0.035 + laneRatio * 0.012);
                                arcWaveAmpY = height * (0.022 + (1 - laneRatio) * 0.014);
                                delay = -(pairIndex * (w.stagger || 0.62) + (side > 0 ? 0.24 : 0));
                                routeDuration = w.routeDuration || 10.2;
                            } else if (w.type === 'risingStar') {
                                const columns = 4;
                                const groupIndex = Math.floor(i / columns);
                                const laneIndex = i % columns;
                                const laneRatio = columns === 1 ? 0.5 : laneIndex / (columns - 1);
                                const rowOffset = groupIndex % 2 === 0 ? 0.045 : -0.045;
                                riseTargetX = width * (0.2 + laneRatio * 0.6 + rowOffset);
                                riseTargetY = height * (0.15 + groupIndex * 0.095 + (laneIndex % 2) * 0.026);
                                riseDriftX = width * ((laneIndex % 2 === 0 ? 0.09 : -0.09) + (groupIndex - 1) * 0.025);
                                risePhase = i * 0.83;
                                riseTime = w.riseTime || 1.65;
                                startX = riseTargetX + Math.sin(risePhase) * width * 0.025;
                                startY = riseTargetY + height * 0.075;
                                delay = -(groupIndex * 1.35 + laneIndex * (w.stagger || 0.58));
                                routeDuration = w.routeDuration || 11.0;
                            } else if (w.type === 'constellationSweep') {
                                const groupIndex = Math.floor(i / 4);
                                const laneIndex = i % 4;
                                const laneRatio = laneIndex / 3;
                                const side = groupIndex % 2 === 0 ? -1 : 1;
                                const topEntry = groupIndex === 1 || groupIndex === 2;
                                if (topEntry) {
                                    startX = width * (0.22 + laneRatio * 0.56);
                                    startY = -58 - laneIndex * 18;
                                } else {
                                    startX = side < 0 ? -62 : width + 62;
                                    startY = height * (0.09 + laneRatio * 0.13);
                                }
                                constellationEndX = side < 0 ? width * (0.78 - laneRatio * 0.16) : width * (0.22 + laneRatio * 0.16);
                                constellationEndY = height * (0.18 + ((laneIndex + groupIndex) % 4) * 0.082);
                                constellationControlX = width * (0.5 + side * (0.18 - laneRatio * 0.08));
                                constellationControlY = height * (0.12 + groupIndex * 0.038);
                                constellationPhase = i * 0.68 + (side < 0 ? 0 : Math.PI);
                                constellationLoopAmp = width * (0.045 + laneRatio * 0.018);
                                delay = -(groupIndex * 1.15 + laneIndex * (w.stagger || 0.5));
                                routeDuration = w.routeDuration || 10.8;
                            } else if (w.type === 'erraticScatter') {
                                startX = width / 2 + (Math.random()-0.5)*100;
                                startY = -50 - Math.random()*100;
                                routeDuration = w.routeDuration || 9.0;
                            } else if (w.type === 'braidDive') {
                                const ribbonRatio = w.count === 1 ? 0.5 : i / (w.count - 1);
                                braidLane = 0;
                                braidOffset = (ribbonRatio - 0.5) * width * 0.08;
                                braidPhase = ribbonRatio * Math.PI * 4.6;
                                braidAmplitude = width * 0.22;
                                startX = width / 2 + Math.sin(braidPhase) * braidAmplitude + braidOffset;
                                startY = -70;
                                delay = -i * (w.stagger || 0.52);
                                routeDuration = w.routeDuration || 8.2;
                            }

                            if (signalDrift && signalDrift.id === 'mirror') {
                                startX = width - startX;
                                if (arcEndX) arcEndX = width - arcEndX;
                                if (arcControlX) arcControlX = width - arcControlX;
                                if (constellationEndX) constellationEndX = width - constellationEndX;
                                if (constellationControlX) constellationControlX = width - constellationControlX;
                                weaveOriginX = weaveOriginX ? width - weaveOriginX : weaveOriginX;
                                riseTargetX = riseTargetX ? width - riseTargetX : riseTargetX;
                            }

                            const enemy = {
                                x: startX, y: startY, vx: 0, vy: 0,
                                sprite, color, hp, maxHp: hp, isArmored, isElite, onScreen: false, flashTimer: 0,
                                pathType: w.type, lifeTime: delay, speedMult: w.speed || 1, startX, startY, indexOffset: i * (Math.PI * 2 / Math.max(1, w.count)),
                                routeDuration, braidLane, braidPhase, braidOffset, braidAmplitude, weaveAmplitude, weaveFrequency, weavePhase, weaveVerticalSpeed,
                                scatterSpeed, horizontalHold, horizontalLateralSpeed, horizontalDropSpeed,
                                braidTrail: !!w.braidTrail,
                                sideEntry, sideEntryDuration, weaveOriginX, weaveOriginY,
                                arcEndX, arcEndY, arcControlX, arcControlY, arcPhase, arcWaveAmpX, arcWaveAmpY,
                                isRisingStar: w.type === 'risingStar',
                                invulnerable: w.type === 'risingStar',
                                risingVulnerable: w.type !== 'risingStar',
                                risingAlpha: w.type === 'risingStar' ? 0.18 : 1,
                                risingProgress: w.type === 'risingStar' ? 0 : 1,
                                riseTime, riseTargetX, riseTargetY, riseDriftX, risePhase,
                                risingBaseVisualScale: 1 + Math.max(0, (w.type === 'risingStar' ? 3 : 0) - 1) * 0.03,
                                constellationEndX, constellationEndY, constellationControlX, constellationControlY, constellationPhase, constellationLoopAmp,
                                constellationTrail: w.type === 'constellationSweep',
                                waveFormationId: formationId, waveFormationResolved: false
                            };
                            configureEnemyShipVisual(enemy, w.type === 'risingStar' ? 'elite' : enemyShipKind, {
                                visualScale: w.type === 'risingStar' ? 1.08 : undefined
                            });
                            enemies.push(applySignalDriftToEnemy(applyRemasteredWavePattern(enemy, w, i), signalDrift, i, w));
                        }
                    }
                    const signalSupport = spawnSignalDriftSupport(signalDrift, waveNumber);
                    for (const support of signalSupport) {
                        support.waveFormationId = formationId;
                        support.waveFormationResolved = false;
                        enemies.push(support);
                        WaveManager.pendingFormationUnits++;
                    }
                    if (flyByConfig) {
                        for (let i = 0; i < flyByConfig.count; i++) {
                            enemies.push(createFlyByEnemy(flyByConfig, flyByTier, i));
                        }
                    }
                    if (scoutFlyByConfig) {
                        for (let i = 0; i < scoutFlyByConfig.count; i++) {
                            enemies.push(createFlyByEnemy(scoutFlyByConfig, scoutFlyByTier, i));
                        }
                    }
                }
                this.currentWave = Math.min(this.currentWave + 1, this.getRunWaveLimit());
                this.hasSpawnedWave = true;
                this.interWaveDelayQueued = false;
            }
        };

        WaveManager.randomizeEarlyProceduralWaves();
        WaveManager.randomizeFlyByAssignments();
        WaveManager.randomizeSignalDrifts();

        function resolveWaveEnemy(enemy) {
            WaveManager.resolveFormationUnit(enemy);
        }
