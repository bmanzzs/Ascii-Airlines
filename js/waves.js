        // Wave sequencing and enemy formation spawning. See js/README.md for load order and ownership.
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

            return {
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
                flyByDropType: flyByConfig.isScout ? 'healthSmall' : 'health'
            };
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
            const raw = [{ x: 0.62, y: -0.10 }];

            appendEllipseArc(raw, 0.53, 0.33, 0.30, 0.28, -96, 150, 24);
            raw.push({ x: 0.42, y: 0.58 }, { x: 0.60, y: 0.64 });
            appendEllipseArc(raw, 0.49, 0.76, 0.31, 0.24, 332, 688, 34);
            raw.push({ x: 0.44, y: -0.10 });

            return resamplePolylinePath(raw, 72);
        }

        function buildDenseZigPath() {
            const path = [{ x: 0.5, y: -0.16 }];
            const rows = [0.06, 0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48, 0.54, 0.58];
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
                { x: 0.20, y: -0.10 },
                { x: 0.80, y: 0.20 },
                { x: 0.20, y: 0.40 },
                { x: 0.80, y: 0.60 },
                { x: 0.20, y: 0.40 },
                { x: 0.80, y: 0.20 },
                { x: 0.20, y: -0.10 }
            ];
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
            flyByAssignments: {},
            scoutFlyByAssignments: {},
            formationId: 0,
            activeFormationId: 0,
            pendingFormationUnits: 0,
            waves: [
                { count: 8, color: '#ff00ff', type: 'zig1' }, // Wave 1
                { count: 12, color: '#00ffff', type: 'wave3' }, // Wave 2
                { count: 10, color: '#ff0088', type: 'wave2' }, // Wave 3
                { count: 12, color: '#ff00ff', type: 'wave4' }, // Wave 4
                { isBoss: true, name: 'NULL PHANTOM', sprite: NULL_PHANTOM_SOURCE, hp: 1000 }, // Wave 5
                { count: 14, color: '#ff0088', type: 'wave6', speed: 0.72, elite: true }, // Wave 6
                { count: 10, color: '#00ffff', type: 'wave7', speed: 1.0, elite: true }, // Wave 7
                { count: 12, color: '#ff00ff', type: 'wave8', speed: 0.82, elite: true }, // Wave 8
                { count: 12, color: '#ff0088', type: 'wave9', speed: 1.3 }, // Wave 9
                { isBoss: true, name: 'DISTORTED GLITCH', sprite: GLITCH_SPRITE_1, hp: 1300 }, // Wave 10
                { count: 12, color: '#ff00ff', type: 'zig2', speed: 0.74, doubleElite: true }, // Wave 11
                { count: 13, color: '#ff0088', type: 'zig5', speed: 0.72, doubleElite: true }, // Wave 12
                { count: 30, color: '#ff0000', type: 'snake', speed: 0.8, elite: true }, // Wave 13
                { count: 14, color: '#ff00ff', type: 'braidDive', speed: 0.82, doubleElite: true }, // Wave 14
                { isBoss: true, name: 'GHOST SIGNAL', sprite: GHOST_SIGNAL_SOURCE, hp: 2200 }, // Wave 15
                { count: 15, color: '#ff00ff', type: 'weave', speed: 1.0, elite: true, hpMult: 2, weaveLaneCount: 3, weaveGroupDelay: 0.72, weaveIntraDelay: 0.14, weaveLaneSpread: 0.52, weaveAmplitudeRatio: 0.11, weaveFrequency: 2.6, weaveVerticalSpeed: 145, routeDuration: 7.2 }, // Wave 16
                { count: 12, color: '#00ffff', type: 'spiral', speed: 1.5, elite: true, hpMult: 3 }, // Wave 17
                { count: 16, color: '#ff0088', type: 'horizontalDrop', speed: 1.6, elite: true, hpMult: 2 }, // Wave 18
                { count: 20, color: '#ff00ff', type: 'erraticScatter', speed: 2.0, doubleElite: true, hpMult: 2 }, // Wave 19
                { isBoss: true, name: 'OVERHEATING FIREWALL', sprite: FIREWALL_SPRITE, hp: 2800 }, // Wave 20
                { count: 16, customType: 'shatteredOrbit' }, // Wave 21
                { count: 12, customType: 'twinRondo' }, // Wave 22
                { count: 13, customType: 'anchorSiege' }, // Wave 23
                { count: 14, customType: 'falseHorizon' }, // Wave 24
                { isBoss: true, name: 'BLACK VOID', sprite: BLACK_VOID_SPRITE, hp: 3600 } // Wave 25
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
                        if (w.type === 'zig1') path = [{x: 0.1, y: -0.2}, {x: 0.9, y: 0.15}, {x: 0.1, y: 0.3}, {x: 0.9, y: 0.45}, {x: 0.1, y: 0.6}, {x: 0.1, y: -0.2}];
                        else if (w.type === 'zig2') path = [{x: 0.9, y: -0.2}, {x: 0.1, y: 0.15}, {x: 0.9, y: 0.3}, {x: 0.1, y: 0.45}, {x: 0.9, y: 0.6}, {x: 0.9, y: -0.2}];
                        else if (w.type === 'zig3') path = [{x: 0.5, y: -0.2}, {x: 0.05, y: 0.15}, {x: 0.95, y: 0.3}, {x: 0.05, y: 0.45}, {x: 0.95, y: 0.6}, {x: 0.5, y: -0.2}];
                        else if (w.type === 'zig5') path = buildDenseZigPath();
                        else if (w.type === 'zig4') path = [{x: 0.5, y: -0.2}, {x: 0.8, y: 0.09}, {x: 0.2, y: 0.26}, {x: 0.8, y: 0.43}, {x: 0.2, y: 0.6}, {x: 0.5, y: -0.2}];
                        else if (w.type === 'wave2') path = [{x:0.2, y:-0.1}, {x:0.8, y:0.53}, {x:0.1, y:0.13}, {x:0.9, y:0.27}, {x:0.1, y:0.6}, {x:0.8, y:-0.1}];
                        else if (w.type === 'wave3') path = [{x:0.5, y:-0.1}, {x:0.5, y:0.26}, {x:0.2, y:0.26}, {x:0.2, y:0.09}, {x:0.8, y:0.09}, {x:0.8, y:0.43}, {x:0.3, y:0.43}, {x:0.3, y:0.6}, {x:0.9, y:0.6}, {x:0.9, y:-0.1}];
                        else if (w.type === 'wave4') {
                            pathA = [{x:0.2, y:-0.1}, {x:0.8, y:0.33}, {x:0.2, y:0.6}, {x:0.9, y:0.33}, {x:0.1, y:-0.1}];
                            pathB = [{x:0.8, y:-0.1}, {x:0.2, y:0.33}, {x:0.8, y:0.6}, {x:0.1, y:0.33}, {x:0.9, y:-0.1}];
                        }
                        else if (w.type === 'wave6') {
                            pathA = [{x:0.1, y:-0.1}, {x:0.4, y:0.15}, {x:0.4, y:0.6}, {x:0.1, y:0.6}, {x:0.1, y:-0.1}];
                            pathB = [{x:0.9, y:-0.1}, {x:0.6, y:0.15}, {x:0.6, y:0.6}, {x:0.9, y:0.6}, {x:0.9, y:-0.1}];
                        }
                        else if (w.type === 'wave7') path = [{x:0.5, y:-0.1}, {x:0.2, y:0.3}, {x:0.8, y:0.6}, {x:0.5, y:0.3}, {x:0.2, y:-0.1}];
                        else if (w.type === 'wave8') path = buildFigureEightWavePath();
                        else if (w.type === 'wave9') path = buildWaveNineReturnPath();
                        else if (w.type === 'snake') path = buildSnakeLoopPath();

                        const stagger = w.type === 'snake'
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
                            
                            if (isTail) {
                                sprite = ["  ▲  ", " (█) ", "(███)", " ▀█▀ "];
                                hp = 200; color = '#e38914';
                            } else if (isElite) {
                                sprite = [" ▄▄███▄▄ ", "▀▀█████▀▀", " ▀█████▀ ", "   ▀█▀   "];
                                hp = 30; color = '#0044ff';
                            } else if (isArmored) {
                                sprite = [" ▄▄▄█▄▄▄ ", " ▀▀███▀▀ ", "   ▀█▀   "];
                                hp = 20; color = '#00ff44';
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
                                pathT = -i * 0.15;
                            } else if (w.type === 'wave9') {
                                pathT = -i * 0.2;
                            }

                            enemies.push({ 
                                x: currentPath[0].x * width, y: currentPath[0].y * height, vx: 0, vy: 0, 
                                sprite, color, hp, maxHp: hp, isArmored, isElite, isFlameGuardian: isTail,
                                onScreen: false, flashTimer: 0, hoverX: 0, fireTimer: 0,
                                path: currentPath, pathIndex: 0, pathT: pathT, speedMult: w.speed || 1, pathTypeWave: w.type,
                                pathLoopsCompleted: 0, despawnOnLoopEnd: true,
                                waveFormationId: formationId, waveFormationResolved: false
                            });
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
                            if (isElite) {
                                sprite = [" ▄▄███▄▄ ", "▀▀█████▀▀", " ▀█████▀ ", "   ▀█▀   "];
                                hp = (w.hpMult || 1) * 30; color = '#0044ff';
                            } else if (isArmored) {
                                sprite = [" ▄▄▄█▄▄▄ ", " ▀▀███▀▀ ", "   ▀█▀   "];
                                hp = (w.hpMult || 1) * 20; color = '#00ff44';
                            }
                            
                            let startX = width / 2;
                            let startY = -50;
                            let delay = -i * 0.3;
            let routeDuration = 0;
            let braidLane = 0;
            let braidPhase = 0;
            let braidOffset = 0;
            let braidAmplitude = 0;
            let weaveAmplitude = 150;
            let weaveFrequency = 3.5;
            let weavePhase = 0;
            let weaveVerticalSpeed = 120;
                            
            if (w.type === 'horizontalDrop') {
                startX = i % 2 === 0 ? -50 : width + 50;
                startY = height * 0.15 + Math.random() * 100;
                routeDuration = 7.5;
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
            } else if (w.type === 'spiral') {
                startX = width / 2; startY = height / 3;
                delay = 0;
                routeDuration = 9.0;
                            } else if (w.type === 'erraticScatter') {
                                startX = width / 2 + (Math.random()-0.5)*100;
                                startY = -50 - Math.random()*100;
                                routeDuration = 7.0;
                            } else if (w.type === 'braidDive') {
                                const pairIndex = Math.floor(i / 2);
                                const totalPairs = Math.max(1, Math.ceil(w.count / 2));
                                const pairRatio = totalPairs === 1 ? 0.5 : pairIndex / (totalPairs - 1);
                                braidLane = i % 2 === 0 ? -1 : 1;
                                braidOffset = (pairRatio - 0.5) * width * 0.12;
                                braidPhase = pairIndex * 0.46 + (braidLane > 0 ? Math.PI : 0);
                                braidAmplitude = width * 0.16;
                                startX = width / 2 + Math.sin(braidPhase) * braidAmplitude + braidOffset;
                                startY = -70;
                                delay = -pairIndex * 0.34;
                                routeDuration = 5.6;
                            }

                            enemies.push({ 
                x: startX, y: startY, vx: 0, vy: 0, 
                sprite, color, hp, maxHp: hp, isArmored, isElite, onScreen: false, flashTimer: 0,
                pathType: w.type, lifeTime: delay, speedMult: w.speed || 1, startX, startY, indexOffset: i * (Math.PI * 2 / Math.max(1, w.count)),
                routeDuration, braidLane, braidPhase, braidOffset, braidAmplitude, weaveAmplitude, weaveFrequency, weavePhase, weaveVerticalSpeed,
                waveFormationId: formationId, waveFormationResolved: false
            });
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
            }
        };

        WaveManager.randomizeFlyByAssignments();

        function resolveWaveEnemy(enemy) {
            WaveManager.resolveFormationUnit(enemy);
        }
