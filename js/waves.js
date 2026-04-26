        // Wave sequencing and enemy formation spawning. See js/README.md for load order and ownership.
        const NON_BOSS_ENEMY_FIRE_INTERVAL_MULT = 1.18;
        const NON_BOSS_ENEMY_RANDOM_FIRE_CHANCE = 0.007;

        function pickRandomIntInclusive(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        }

        function pickDistinctRandomInclusive(min, max, exclude) {
            let value = pickRandomIntInclusive(min, max);
            if (max <= min) return value;
            while (value === exclude) value = pickRandomIntInclusive(min, max);
            return value;
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
                pathType: 'flyby', lifeTime: -index * (flyByConfig.isScout ? 0.34 : 0.45), speedMult: flyByConfig.speed,
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

            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const aimAngle = Math.atan2(dy, dx);
            const color = enemy.remasterFireColor || enemy.color || '#ff00ff';

            if (enemy.remasterFirePattern === 'aimedPulse') {
                pushRemasterEnemyBullet(enemy.x, enemy.y, aimAngle, 245, 'o', color);
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

        function spawnExtendedLateWaveEnemies(w) {
            const spawned = [];

            if (w.customType === 'shatteredOrbit') {
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
                    hoverAmpX: 130,
                    hoverAmpY: 22
                }));
                for (let i = 0; i < 6; i++) {
                    const fromLeft = i % 2 === 0;
                    spawned.push(createLaneSweepEnemy({
                        startX: fromLeft ? -60 : width + 60,
                        startY: -90 - i * 28,
                        endX: fromLeft ? width + 60 : -60,
                        endY: height * (0.52 + (i % 3) * 0.06),
                        delay: -(1.4 + i * 0.6),
                        routeDuration: 7.6,
                        laneAmplitude: 32 + i * 5,
                        lanePhase: i * 0.7,
                        speed: 0.96,
                        hp: 30,
                        color: i % 2 === 0 ? '#ff9bff' : '#9bffff'
                    }));
                }
                for (let i = 0; i < 4; i++) {
                    spawned.push(createVoidOrbiter({
                        centerX: width * (0.30 + (i % 2) * 0.40),
                        centerY: -100 - Math.floor(i / 2) * 30,
                        centerDriftX: width * 0.06 * (i % 2 === 0 ? 1 : -1),
                        centerPhase: i * 0.7,
                        orbitRadiusX: 50 + (i % 2) * 8,
                        orbitRadiusY: 30 + (i % 2) * 5,
                        orbitAngle: i * (Math.PI / 2),
                        orbitSpeed: 1.95,
                        routeDuration: 9.0,
                        delay: -(1.0 + i * 0.5),
                        speed: 0.95,
                        fireInterval: 2.7,
                        color: i % 2 === 0 ? '#ffd56b' : '#9bffd5'
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
            formationId: 0,
            activeFormationId: 0,
            pendingFormationUnits: 0,
            waves: [
                { count: 9, color: '#ff00ff', type: 'zig1', speed: 0.9, stagger: 0.72 }, // Wave 1
                { count: 12, color: '#00ffff', type: 'wave3', speed: 0.704, stagger: 0.7 }, // Wave 2
                { count: 11, color: '#ff0088', type: 'wave2', speed: 0.9, stagger: 0.68 }, // Wave 3
                { count: 13, color: '#ff00ff', type: 'wave4', speed: 0.82, stagger: 0.74, firePattern: 'downFan', fireEveryNth: 6, fireInterval: 2.9 }, // Wave 4
                { isBoss: true, name: 'NULL PHANTOM', sprite: NULL_PHANTOM_SOURCE, hp: 1000 }, // Wave 5
                { count: 14, color: '#ff0088', type: 'wave6', speed: 0.66, stagger: 0.68, elite: true, firePattern: 'downFan', fireEveryNth: 5, fireInterval: 2.8 }, // Wave 6
                { count: 12, color: '#00ffff', type: 'wave7', speed: 0.82, stagger: 0.36, elite: true, firePattern: 'aimedPulse', fireEveryNth: 4, fireInterval: 2.6 }, // Wave 7
                { count: 12, color: '#ff00ff', type: 'wave8', speed: 0.72, stagger: 2.25, elite: true, firePattern: 'aimedPulse', fireEveryNth: 4, fireInterval: 3.0 }, // Wave 8
                { count: 14, color: '#ff0088', type: 'wave9', speed: 0.95, stagger: 0.34, firePattern: 'splitFan', fireEveryNth: 5, fireInterval: 2.7 }, // Wave 9
                { isBoss: true, name: 'DISTORTED GLITCH', sprite: GLITCH_SPRITE_1, hp: 1300 }, // Wave 10
                { count: 14, color: '#ff00ff', type: 'zig2', speed: 0.64, stagger: 0.42, doubleElite: true, firePattern: 'downFan', fireEveryNth: 5, fireInterval: 2.5 }, // Wave 11
                { count: 14, color: '#ff0088', type: 'zig5', speed: 0.64, stagger: 0.48, doubleElite: true, firePattern: 'splitFan', fireEveryNth: 5, fireInterval: 2.6 }, // Wave 12
                { count: 30, color: '#ff0000', type: 'snake', speed: 0.72, stagger: 2.0, elite: true }, // Wave 13
                { count: 14, color: '#ff00ff', type: 'braidDive', speed: 0.78, stagger: 0.52, routeDuration: 8.2, doubleElite: true, singleRibbon: true, braidTrail: true, firePattern: 'splitFan', fireEveryNth: 4, fireInterval: 2.5 }, // Wave 14
                { isBoss: true, name: 'GHOST SIGNAL', sprite: GHOST_SIGNAL_SOURCE, hp: 1700 }, // Wave 15
                { count: 14, color: '#ff00ff', type: 'weave', speed: 0.46, elite: true, hpMult: 2, weaveLaneCount: 3, weaveGroupDelay: 0.92, weaveIntraDelay: 0.18, weaveLaneSpread: 0.54, weaveAmplitudeRatio: 0.1, weaveFrequency: 2.25, weaveVerticalSpeed: 112, sideEntrySlots: [1, 5, 9, 12], routeDuration: 9.4, firePattern: 'aimedPulse', fireEveryNth: 5, fireInterval: 2.8 }, // Wave 16
                { count: 13, color: '#00ffff', type: 'arcCascade', speed: 0.88, elite: true, hpMult: 3, stagger: 0.62, routeDuration: 10.2, firePattern: 'spiralNeedle', fireEveryNth: 5, fireInterval: 2.5 }, // Wave 17
                { count: 12, color: '#ff0088', type: 'risingStar', speed: 0.9, elite: true, hpMult: 2.5, stagger: 0.58, routeDuration: 11.0, riseTime: 1.65, firePattern: 'crossDrop', fireEveryNth: 3, fireInterval: 2.8 }, // Wave 18
                { count: 16, color: '#ff00ff', type: 'constellationSweep', speed: 0.76, elite: true, hpMult: 2.2, stagger: 0.5, routeDuration: 10.8, firePattern: 'splitFan', fireEveryNth: 5, fireInterval: 3.0 }, // Wave 19
                { isBoss: true, name: 'OVERHEATING FIREWALL', sprite: FIREWALL_SPRITE, hp: 1000 }, // Wave 20
                { count: 16, customType: 'shatteredOrbit' }, // Wave 21
                { count: 12, customType: 'twinRondo' }, // Wave 22
                { count: 13, customType: 'anchorSiege' }, // Wave 23
                { count: 14, customType: 'falseHorizon' }, // Wave 24
                { isBoss: true, name: 'BLACK VOID', sprite: BLACK_VOID_SPRITE, hp: 2000 }, // Wave 25
                { count: 12, color: '#ff00ff', type: 'wave2', speed: 0.85, stagger: 0.62, doubleElite: true, firePattern: 'splitFan', fireEveryNth: 4, fireInterval: 2.5 }, // Wave 26
                { count: 14, color: '#ff0088', type: 'wave4', speed: 0.82, stagger: 0.58, doubleElite: true, firePattern: 'downFan', fireEveryNth: 4, fireInterval: 2.4 }, // Wave 27
                { count: 13, color: '#00ffff', type: 'wave7', speed: 0.86, stagger: 0.42, doubleElite: true, firePattern: 'spiralNeedle', fireEveryNth: 4, fireInterval: 2.6 }, // Wave 28
                { count: 14, color: '#ff00ff', type: 'wave8', speed: 0.78, stagger: 1.6, doubleElite: true, firePattern: 'scatterMark', fireEveryNth: 5, fireInterval: 2.6 }, // Wave 29
                { isBoss: true, name: 'BATTLE STARSHIP', sprite: BATTLE_STARSHIP_SPRITE, hp: 2400 }, // Wave 30
                { count: 11, customType: 'prismRift' }, // Wave 31 — Prism Conduit mini-boss
                { count: 14, color: '#ff00ff', type: 'zig2', speed: 0.6, stagger: 0.40, doubleElite: true, firePattern: 'downFan', fireEveryNth: 4, fireInterval: 2.4 }, // Wave 32
                { count: 14, color: '#ff0088', type: 'zig5', speed: 0.6, stagger: 0.42, doubleElite: true, firePattern: 'splitFan', fireEveryNth: 4, fireInterval: 2.5 }, // Wave 33
                { count: 14, color: '#ff00ff', type: 'braidDive', speed: 0.86, stagger: 0.5, routeDuration: 8.2, doubleElite: true, singleRibbon: true, braidTrail: true, firePattern: 'aimedPulse', fireEveryNth: 4, fireInterval: 2.4 }, // Wave 34
                { isBoss: true, name: 'ECLIPSE WARDEN', sprite: ECLIPSE_WARDEN_SPRITE, hp: 2200 } // Wave 35
            ],
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
                const w = this.waves[this.currentWave];
                const waveNumber = this.currentWave + 1;
                if (w.isBoss) {
                    this.pendingFormationUnits = 0;
                    boss = { 
                        x: width / 2, y: -200, hp: w.hp, maxHp: w.hp, name: w.name, sprite: w.sprite || [],
                        phase: 'INTRO', timer: 0, attackPattern: 0, lastFire: 0, spiralAngle: 0, 
                        color: '#444444', // All bosses start grey in intro
                        flashTimer: 0
                    };
                    if (w.name === 'NULL PHANTOM') {
                        startVoidWalkerMusic();
                        boss.introStartY = boss.y;
                    }
                    if (w.name === 'GHOST SIGNAL') {
                        startSignalGhostMusic();
                    }
                    if (w.name === 'OVERHEATING FIREWALL') {
                        startOverheatingFirewallMusic();
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
                        boss.introStartX = boss.x; boss.introStartY = boss.y;
                        boss.introTargetX = width / 2; boss.introTargetY = height * 0.2;
                    }
                    if (w.name === 'BLACK VOID') {
                        startDistortedGlitchMusic();
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
                    if (w.name === 'ECLIPSE WARDEN') {
                        startDistortedGlitchMusic();
                        boss.color = '#5a5680';
                    }
                    if (w.name === 'BATTLE STARSHIP') {
                        startBattleStarshipMusic();
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
                        for (const enemy of customEnemies) {
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
                            const isArmored = (!isElite && i % 2 === 1 && !isTail);
                            
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

                            let currentPath = path;
                            if (pathA && pathB) {
                                currentPath = (i % 2 === 0) ? pathA : pathB;
                            }
                            
                            let pathT = -i * stagger;
                            if (w.type === 'wave8') {
                                pathT = -i * stagger;
                            } else if (pathA && pathB) {
                                pathT = -Math.floor(i / 2) * stagger;
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
                            enemies.push(applyRemasteredWavePattern(enemy, w, i));
                        }
                    } else {
                        // Advanced parametric paths for Waves 16-19
                        for (let i = 0; i < w.count; i++) {
                            const isElite = (w.elite && i === Math.floor(w.count / 2)) || 
                                            (w.doubleElite && (i === Math.floor(w.count / 3) || i === Math.floor(w.count * 2 / 3)));
                            const isArmored = !isElite && i % 2 === 1;
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
                            enemies.push(applyRemasteredWavePattern(enemy, w, i));
                        }
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
                this.currentWave = (this.currentWave + 1) % this.waves.length;
                this.hasSpawnedWave = true;
                this.interWaveDelayQueued = false;
            }
        };

        WaveManager.randomizeFlyByAssignments();

        function resolveWaveEnemy(enemy) {
            WaveManager.resolveFormationUnit(enemy);
        }
