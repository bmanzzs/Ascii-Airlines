        // Black Void and late-game void helpers. Loaded after sprites.js and before waves.js.
        const BLACK_VOID_INTRO_DURATION = 6.0;
        const BLACK_VOID_MUSIC_DROP_TIME = 1.725;

        function pushVoidProjectile(config) {
            enemyBullets.push({
                char: '⟡',
                color: '#9d8bff',
                isVoidProjectile: true,
                voidBulletSize: 24,
                ...config
            });
        }

        function fireVoidAimedFan(sourceX, sourceY, targetX, targetY, count, spread, speed, config = {}) {
            const baseAngle = Math.atan2(targetY - sourceY, targetX - sourceX);
            const safeCount = Math.max(1, count | 0);
            for (let i = 0; i < safeCount; i++) {
                const t = safeCount === 1 ? 0.5 : i / (safeCount - 1);
                const angle = baseAngle + (t - 0.5) * spread;
                pushVoidProjectile({
                    x: sourceX,
                    y: sourceY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    speed,
                    ...config
                });
            }
        }

        function fireVoidRadialBurst(sourceX, sourceY, count, speed, config = {}) {
            const safeCount = Math.max(1, count | 0);
            const angleOffset = config.angleOffset || 0;
            for (let i = 0; i < safeCount; i++) {
                const angle = angleOffset + (i / safeCount) * Math.PI * 2;
                pushVoidProjectile({
                    x: sourceX,
                    y: sourceY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    speed,
                    ...config
                });
            }
        }

        function fireVoidCurtain(sourceY, gapCenterX, config = {}) {
            const columns = config.columns || 13;
            const speed = config.speed || 235;
            const gapWidth = config.gapWidth || 2;
            const waveAmp = config.waveAmp || 0;
            const waveFreq = config.waveFreq || 3.4;
            const char = config.char || '╎';
            const color = config.color || '#d7d1ff';
            const normalizedGap = Math.max(0, Math.min(columns - 1, Math.round((gapCenterX / Math.max(1, width)) * (columns - 1))));
            const gapStart = Math.max(0, normalizedGap - gapWidth);
            const gapEnd = Math.min(columns - 1, normalizedGap + gapWidth);

            for (let i = 0; i < columns; i++) {
                if (i >= gapStart && i <= gapEnd) continue;
                const bulletX = ((i + 0.5) / columns) * width;
                pushVoidProjectile({
                    x: bulletX,
                    y: sourceY,
                    vx: 0,
                    vy: speed,
                    speed,
                    char,
                    color,
                    voidBulletSize: config.size || 24,
                    isLatticeShot: waveAmp > 0,
                    baseX: bulletX,
                    waveAmp,
                    waveFreq,
                    wavePhase: i * 0.35 + (config.phaseOffset || 0),
                    waveTime: 0
                });
            }
        }

        function createVoidOrbiter(config = {}) {
            return {
                x: config.centerX || width * 0.5,
                y: (config.centerY || -80) - (config.orbitRadiusY || 34),
                vx: 0,
                vy: 0,
                sprite: VOID_ORBITER_SPRITE,
                color: config.color || '#b7abff',
                hp: config.hp || 28,
                maxHp: config.hp || 28,
                isArmored: !!config.isArmored,
                isElite: !!config.isElite,
                flashTimer: 0,
                onScreen: false,
                disableRandomFire: true,
                fireTimer: Math.random() * (config.fireInterval || 2.4),
                orbiterFireInterval: config.fireInterval || 2.4,
                orbiterFireSpeed: config.fireSpeed || 215,
                orbiterFireChar: config.fireChar || '◦',
                orbiterFireColor: config.fireColor || '#e2ddff',
                pathType: 'orbitalDrift',
                lifeTime: config.delay || 0,
                speedMult: config.speed || 1,
                routeDuration: config.routeDuration || 8.4,
                centerStartX: config.centerX || width * 0.5,
                centerStartY: config.centerY || -80,
                centerDriftX: config.centerDriftX || 0,
                centerFall: config.centerFall || height * 0.78,
                centerBob: config.centerBob || 24,
                centerPhase: config.centerPhase || 0,
                orbitRadiusX: config.orbitRadiusX || 54,
                orbitRadiusY: config.orbitRadiusY || 34,
                orbitAngle: config.orbitAngle || 0,
                orbitSpeed: config.orbitSpeed || 2.2
            };
        }

        function createLaneSweepEnemy(config = {}) {
            const enemy = {
                x: config.startX || -40,
                y: config.startY || -80,
                vx: 0,
                vy: 0,
                sprite: config.sprite || [" ▄▄█▄▄ ", " ▀███▀ ", "  ▀█▀  "],
                color: config.color || '#ff8de1',
                hp: config.hp || 26,
                maxHp: config.hp || 26,
                isArmored: !!config.isArmored,
                isElite: !!config.isElite,
                flashTimer: 0,
                onScreen: false,
                disableRandomFire: true,
                pathType: 'laneSweep',
                lifeTime: config.delay || 0,
                speedMult: config.speed || 1,
                routeDuration: config.routeDuration || 7.5,
                startX: config.startX || -40,
                startY: config.startY || -80,
                endX: config.endX || width + 40,
                endY: config.endY || height * 0.82,
                laneAmplitude: config.laneAmplitude || 46,
                lanePhase: config.lanePhase || 0
            };
            return configureEnemyShipVisual(enemy, config.enemyShipKind || (enemy.isElite ? 'elite' : (enemy.isArmored ? 'armored' : 'base')));
        }

        function createVoidSentinel(config = {}) {
            const sprite = config.sprite || VOID_SENTINEL_SPRITE;
            const hp = config.hp || 240;
            return {
                x: config.spawnX || width * 0.5,
                y: config.spawnY || -120,
                vx: 0,
                vy: 0,
                sprite,
                color: config.color || '#9b86ff',
                hp,
                maxHp: hp,
                isVoidSentinel: true,
                isElite: true,
                flashTimer: 0,
                onScreen: false,
                disableRandomFire: true,
                hoverX: config.hoverX || width * 0.5,
                hoverY: config.hoverY || height * 0.18,
                hoverAmpX: config.hoverAmpX || 14,
                hoverAmpY: config.hoverAmpY || 9,
                hoverTimer: config.hoverPhase || Math.random() * Math.PI * 2,
                hoverPhase: config.hoverPhase || Math.random() * Math.PI * 2,
                settled: false,
                approachSpeed: config.approachSpeed || 2.2,
                fireTimer: config.fireOffset || 0,
                voidAttackMode: config.attackMode || 'fan',
                attackAngle: config.attackAngle || 0,
                renderScale: config.renderScale || 1,
                arrivalDelay: config.arrivalDelay || 0
            };
        }

        function isBlackVoidBossActive(target = boss) {
            return !!(target && target.phase === 'ACTIVE' && target.name === 'BLACK VOID');
        }

        function getBlackVoidHorizonRadius(target = boss) {
            if (!isBlackVoidBossActive(target) || !target.eventHorizonActive) return 0;
            const pulse = 0.92 + Math.sin(currentFrameNow * 0.008 + (target.eventHorizonElapsed || 0) * 4.6) * 0.08;
            return 150 * pulse + (target.absorbedShots || 0) * 2.5;
        }

        function absorbBlackVoidProjectile(x, y, charge = 1) {
            if (!isBlackVoidBossActive()) return false;
            boss.absorbedShots = Math.min(18, (boss.absorbedShots || 0) + charge);
            boss.flashTimer = Math.max(boss.flashTimer, 0.06);
            for (let i = 0; i < 4; i++) {
                debris.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 80,
                    vy: (Math.random() - 0.5) * 80,
                    char: ['·', '∙', '✦', '░'][Math.floor(Math.random() * 4)],
                    color: ['#7d71d8', '#b3b8ff', '#f4f6ff'][Math.floor(Math.random() * 3)],
                    life: 0.24 + Math.random() * 0.1
                });
            }
            return true;
        }

        function getBlackVoidDamageScale(hitX, hitY) {
            if (!isBlackVoidBossActive() || !boss.eventHorizonActive) return 1;
            const radius = getBlackVoidHorizonRadius(boss);
            const dist = Math.hypot(boss.x - hitX, boss.y - hitY);
            if (dist > radius) return 1;
            const t = 1 - dist / Math.max(1, radius);
            return 0.18 + (1 - t) * 0.22;
        }

        function emitBlackVoidRetaliation(target = boss) {
            if (!isBlackVoidBossActive(target)) return;
            const stored = Math.max(0, target.absorbedShots || 0);
            if (stored <= 0) return;
            const count = Math.min(18, 6 + stored);
            fireVoidRadialBurst(target.x, target.y, count, 210 + stored * 7, {
                char: '☼',
                color: '#d9ddff',
                angleOffset: currentFrameNow * 0.0012,
                voidBulletSize: 28
            });
            target.absorbedShots = 0;
        }

        function fireVoidSentinelAttack(enemy) {
            if (!enemy) return;
            if (enemy.voidAttackMode === 'fan') {
                const target = typeof getNonBossEnemyAimTarget === 'function'
                    ? getNonBossEnemyAimTarget(enemy.x, enemy.y + 10, { targetJitter: 50, angleJitter: 0.08, leadTime: 0.04 })
                    : player;
                fireVoidAimedFan(enemy.x, enemy.y + 10, target.x, target.y, 5, 0.9, 235, {
                    char: '⟡',
                    color: '#c4b6ff',
                    voidBulletSize: 24
                });
            } else if (enemy.voidAttackMode === 'cross') {
                enemy.attackAngle = (enemy.attackAngle || 0) + 0.38;
                for (let i = 0; i < 8; i++) {
                    const angle = enemy.attackAngle + (i / 8) * Math.PI * 2;
                    pushVoidProjectile({
                        x: enemy.x,
                        y: enemy.y + 8,
                        vx: Math.cos(angle) * 220,
                        vy: Math.sin(angle) * 220,
                        speed: 220,
                        char: i % 2 === 0 ? '✶' : '✷',
                        color: '#8edbff',
                        voidBulletSize: 24
                    });
                }
            } else if (enemy.voidAttackMode === 'anchor') {
                enemy.anchorPatternFlip = !enemy.anchorPatternFlip;
                enemy.attackAngle = (enemy.attackAngle || 0) + 0.24;
                if (enemy.anchorPatternFlip) {
                    fireVoidCurtain(enemy.y + 18, player.x, {
                        columns: 13,
                        gapWidth: 1,
                        speed: 225,
                        waveAmp: 18,
                        waveFreq: 3.8,
                        char: '╎',
                        color: '#ddd6ff',
                        phaseOffset: enemy.attackAngle
                    });
                } else {
                    fireVoidRadialBurst(enemy.x, enemy.y + 8, 10, 230, {
                        char: '◍',
                        color: '#dac4ff',
                        angleOffset: enemy.attackAngle,
                        voidBulletSize: 26
                    });
                }
            } else if (enemy.voidAttackMode === 'cinder') {
                const target = typeof getNonBossEnemyAimTarget === 'function'
                    ? getNonBossEnemyAimTarget(enemy.x, enemy.y + 12, { targetJitter: 52, angleJitter: 0.08, leadTime: 0.04 })
                    : player;
                fireVoidAimedFan(enemy.x, enemy.y + 12, target.x, target.y, 6, 1.05, 255, {
                    char: '✦',
                    color: '#f4f6ff',
                    voidBulletSize: 30,
                    isLargeWraith: true
                });
            }
        }

        function updateBlackVoidBoss(dt) {
            if (!boss || !boss.isBlackVoid) return false;
            if (boss.phase === 'INTRO') {
                const glitchIntroDuration = BLACK_VOID_INTRO_DURATION;
                const introStartX = typeof boss.introStartX === 'number' ? boss.introStartX : width / 2;
                const introStartY = typeof boss.introStartY === 'number' ? boss.introStartY : -200;
                const introTargetX = typeof boss.introTargetX === 'number' ? boss.introTargetX : width / 2;
                const introTargetY = typeof boss.introTargetY === 'number' ? boss.introTargetY : height * 0.2;
                const nextTimer = Math.min(glitchIntroDuration, boss.timer + dt);
                const introProgress = Math.max(0, Math.min(1, nextTimer / glitchIntroDuration));
                const introPhase = nextTimer;
                const swayScale = 1 - introProgress * 0.2;
                const swayX = Math.sin(introPhase * 8.5) * 5.5 * swayScale;
                const swayY = Math.sin(introPhase * 4.2 + 0.35) * 2.5 * swayScale;

                boss.x = introStartX + (introTargetX - introStartX) * introProgress + swayX;
                boss.y = introStartY + (introTargetY - introStartY) * introProgress + swayY;
                boss.sprite = Math.random() > 0.7 ? BLACK_VOID_SPRITE_ALT : BLACK_VOID_SPRITE;

                if (Math.random() < 0.08 * (dt * 60)) {
                    for (let k = 0; k < 5; k++) {
                        debris.push({
                            x: boss.x + (Math.random() - 0.5) * 36,
                            y: boss.y + (Math.random() - 0.5) * 28,
                            vx: (Math.random() - 0.5) * 40,
                            vy: (Math.random() - 0.5) * 40,
                            char: ['·', '∙', '░', '▒'][Math.floor(Math.random() * 4)],
                            color: ['#51526f', '#8d8fc8', '#dbe0ff'][Math.floor(Math.random() * 3)],
                            life: 0.14 + Math.random() * 0.12
                        });
                    }
                }

                boss.timer = nextTimer;
                if (boss.timer >= glitchIntroDuration) {
                    boss.x = introTargetX;
                    boss.y = introTargetY;
                    boss.sprite = BLACK_VOID_SPRITE;
                    boss.phase = 'ACTIVE';
                    boss.timer = 0;
                    boss.startX = boss.x;
                    boss.startY = boss.y;
                }
                return false;
            }

            boss.timer += dt;
            boss.driftTimer = (boss.driftTimer || 0) + dt;
            boss.petalsAngle = (boss.petalsAngle || 0) + dt * 0.7;
            boss.x = boss.startX + Math.sin(boss.driftTimer * 0.42) * 120;
            boss.y = boss.startY + Math.sin(boss.driftTimer * 0.86 + 0.4) * 34;
            boss.color = boss.eventHorizonActive ? '#dfe6ff' : (Math.sin(boss.driftTimer * 1.8) > 0 ? '#8c79ff' : '#72c2ff');
            applyWakeForce(boss.x, boss.y, 220, 8);

            if (boss.beamAbsorbTimer > 0) boss.beamAbsorbTimer -= dt;

            boss.eventHorizonTimer -= dt;
            if (!boss.eventHorizonActive && boss.eventHorizonTimer <= 0) {
                boss.eventHorizonActive = true;
                boss.eventHorizonElapsed = 0;
                boss.eventHorizonDuration = boss.hp < boss.maxHp * 0.45 ? 2.9 : 2.4;
                boss.eventHorizonTimer = boss.hp < boss.maxHp * 0.45 ? 5.1 : 6.4;
            }
            if (boss.eventHorizonActive) {
                boss.eventHorizonElapsed += dt;
                if (boss.eventHorizonElapsed >= boss.eventHorizonDuration) {
                    boss.eventHorizonActive = false;
                    emitBlackVoidRetaliation(boss);
                }
            }

            if (maybeTriggerBossDeathCinematic(boss)) return true;

            if (boss.timer > (boss.patternDuration || 5.6)) {
                boss.timer = 0;
                boss.attackPattern = (boss.attackPattern + 1) % 4;
                boss.lastFire = 0;
            }

            const bossNow = typeof hostileTimeMs === 'number' ? hostileTimeMs : currentFrameNow;
            if (boss.attackPattern === 0 && bossNow - boss.lastFire > 900) {
                for (let i = 0; i < 4; i++) {
                    const baseAngle = boss.petalsAngle + i * (Math.PI / 2);
                    pushVoidProjectile({
                        x: boss.x,
                        y: boss.y,
                        vx: Math.cos(baseAngle) * 240,
                        vy: Math.sin(baseAngle) * 240,
                        speed: 240,
                        turnRate: 0.95,
                        char: '⟡',
                        color: '#c1adff',
                        voidBulletSize: 26
                    });
                    pushVoidProjectile({
                        x: boss.x,
                        y: boss.y,
                        vx: Math.cos(baseAngle) * 240,
                        vy: Math.sin(baseAngle) * 240,
                        speed: 240,
                        turnRate: -0.95,
                        char: '⟡',
                        color: '#8ee6ff',
                        voidBulletSize: 26
                    });
                }
                boss.lastFire = bossNow;
            } else if (boss.attackPattern === 1 && bossNow - boss.lastFire > 2600) {
                for (let i = 0; i < 10; i++) {
                    const orbitAngle = boss.petalsAngle + (i / 10) * Math.PI * 2;
                    pushVoidProjectile({
                        x: boss.x,
                        y: boss.y,
                        char: i % 2 === 0 ? '◌' : '◍',
                        color: i % 2 === 0 ? '#dbe0ff' : '#a4a9ff',
                        voidBulletSize: 28,
                        isOrbitShot: true,
                        anchorToBoss: true,
                        anchorX: boss.x,
                        anchorY: boss.y,
                        orbitAngle,
                        orbitRadius: 34,
                        orbitRadiusSpeed: 38,
                        orbitAngularSpeed: (i % 2 === 0 ? 2.5 : -2.5),
                        holdTime: 1.05 + (i % 2) * 0.18,
                        releaseSpeed: 325 + (i % 2) * 25,
                        releaseAngleOffset: i % 2 === 0 ? 0 : Math.PI
                    });
                }
                boss.lastFire = bossNow;
            } else if (boss.attackPattern === 2 && bossNow - boss.lastFire > 2100) {
                fireVoidCurtain(-24, player.x + Math.sin(boss.driftTimer * 1.3) * 70, {
                    columns: 15,
                    gapWidth: 1,
                    speed: 245,
                    waveAmp: 24,
                    waveFreq: 4.2,
                    char: '╏',
                    color: '#d9ddff',
                    size: 24,
                    phaseOffset: boss.petalsAngle
                });
                boss.lastFire = bossNow;
            } else if (boss.attackPattern === 3 && bossNow - boss.lastFire > 1700) {
                const aimAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                for (let port = 0; port < 2; port++) {
                    const originX = boss.x + (port === 0 ? -58 : 58);
                    const originY = boss.y + 10;
                    const portOffset = port === 0 ? -0.22 : 0.22;
                    for (let i = -1; i <= 1; i++) {
                        const angle = aimAngle + portOffset + i * 0.16;
                        pushVoidProjectile({
                            x: originX,
                            y: originY,
                            vx: Math.cos(angle) * 280,
                            vy: Math.sin(angle) * 280,
                            speed: 280,
                            char: '✦',
                            color: '#f3f6ff',
                            voidBulletSize: 30,
                            isLargeWraith: true
                        });
                    }
                }
                boss.lastFire = bossNow;
            }
            return false;
        }

        function drawBlackVoidBoss(renderNow, bossRenderEntries) {
            const renderBossX = snapSpriteCoord(boss.x);
            const renderBossY = snapSpriteCoord(boss.y);
            const bSX = renderBossX - (boss.sprite[0].length * charW) / 2;
            const bSY = renderBossY - (boss.sprite.length * charH) / 2;
            const bodyFlash = boss.flashTimer > 0;
            const pulse = bodyFlash ? 1 : 0.78 + Math.sin(renderNow * 0.004 + (boss.driftTimer || 0) * 1.8) * 0.18;

            ctx.save();
            ctx.font = `bold 20px Courier New`;
            ctx.globalAlpha = pulse;
            if (glowEnabled && boss.phase === 'ACTIVE') {
                ctx.shadowColor = boss.eventHorizonActive ? '#dfe6ff' : '#8570ff';
                ctx.shadowBlur = boss.eventHorizonActive ? 28 : 18;
            }

            for (let r = 0; r < boss.sprite.length; r++) {
                for (let c = 0; c < boss.sprite[r].length; c++) {
                    const char = boss.sprite[r][c];
                    if (char === ' ') continue;
                    const rowRatio = r / Math.max(1, boss.sprite.length - 1);
                    const colRatio = c / Math.max(1, boss.sprite[r].length - 1);
                    const fromCenter = Math.abs(colRatio - 0.5) * 2;
                    let glyphColor = '#8073ff';
                    if (bodyFlash) glyphColor = '#ffffff';
                    else if (fromCenter < 0.32) glyphColor = rowRatio < 0.5 ? '#2a315f' : '#1c2146';
                    else if (fromCenter < 0.62) glyphColor = '#7a69ff';
                    else glyphColor = '#d7ddff';
                    ctx.fillStyle = glyphColor;
                    ctx.fillText(char, (bSX + c * charW) | 0, (bSY + r * charH) | 0);
                    recordBossRenderGlyph(bossRenderEntries, char, (bSX + c * charW) | 0, (bSY + r * charH) | 0, glyphColor);
                }
            }
            ctx.restore();

            ctx.save();
            ctx.font = `bold 84px Courier New`;
            ctx.fillStyle = '#03040b';
            ctx.globalAlpha = 0.96;
            ctx.fillText('●', renderBossX, renderBossY + 2);
            ctx.restore();

            if (boss.phase === 'ACTIVE' && boss.eventHorizonActive) {
                const horizonRadius = getBlackVoidHorizonRadius(boss);
                ctx.save();
                ctx.font = `bold 28px Courier New`;
                ctx.globalAlpha = 0.58;
                for (let i = 0; i < 12; i++) {
                    const angle = renderNow * 0.003 + i * (Math.PI * 2 / 12);
                    const hx = boss.x + Math.cos(angle) * horizonRadius;
                    const hy = boss.y + Math.sin(angle) * horizonRadius * 0.58;
                    ctx.fillStyle = i % 2 === 0 ? '#e6eaff' : '#8170ff';
                    ctx.fillText(i % 2 === 0 ? '◌' : '◎', hx | 0, hy | 0);
                }
                ctx.restore();
            }

            if (boss.phase === 'ACTIVE') {
                drawBossHealthBar(boss, {
                    color: '#7d71ff',
                    labelColor: '#e2e6ff'
                });
            }
        }

        const TRINITY_INTRO_DURATION = 4.2;
        const TRINITY_ADVANCE_DURATION = 0.9;
        const TRINITY_ATTACK_DURATION = 4.25;
        const TRINITY_SWORD_ATTACK_DURATION = 6.9;
        const TRINITY_GRENADE_ATTACK_DURATION = 5.85;
        const TRINITY_RETURN_DURATION = 0.85;
        const TRINITY_PAUSE_DURATION = 0.42;
        const TRINITY_BULLET_SOFT_CAP = 230;
        const TRINITY_SWORD_SWING_DURATION = 0.3;
        const TRINITY_SWORD_BURST_SIZE = 3;
        const TRINITY_SWORD_BURST_ROUNDS = 4;
        const TRINITY_SWORD_BURST_GAP = 0.44;
        const TRINITY_SWORD_FINALE_SWINGS = 5;
        const TRINITY_SWORD_WINDUP = 0.08;
        const TRINITY_SWORD_SWEEP = 0.18;
        const TRINITY_SWORD_HOLD = 0.035;
        const TRINITY_SWORD_DAMAGE_TICK = 0.13;
        const TRINITY_SWORD_DAMAGE = 9;
        const TRINITY_SWORD_RADIUS = 12;
        const TRINITY_SWORD_BASE_ANGLES = [
            Math.PI * 0.30,
            Math.PI * 0.48,
            Math.PI * 0.66,
            Math.PI * 0.23,
            Math.PI * 0.52,
            Math.PI * 0.77,
            Math.PI * 0.34,
            Math.PI * 0.58,
            Math.PI * 0.72,
            Math.PI * 0.27,
            Math.PI * 0.46,
            Math.PI * 0.64
        ];
        const TRINITY_SWORD_FINALE_ANGLES = [
            Math.PI * 0.28,
            Math.PI * 0.40,
            Math.PI * 0.52,
            Math.PI * 0.64,
            Math.PI * 0.76
        ];
        const TRINITY_GRENADE_FUSE = 1.58;
        const TRINITY_GRENADE_GRAVITY = 320;
        const TRINITY_GRENADE_INTERVAL = 0.58;
        const TRINITY_GRENADE_RADIUS = 72;
        const TRINITY_GRENADE_DAMAGE = 14;
        const TRINITY_GRENADE_SHARDS = 8;
        const TRINITY_GRENADE_VOLLEY_COUNTS = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4];

        function getTurnboundTrinityIdleTarget(index) {
            const clamped = Math.max(0, Math.min(2, index || 0));
            return {
                x: width * [0.23, 0.5, 0.77][clamped],
                y: height * 0.16
            };
        }

        function getTurnboundTrinityAttackTarget() {
            return { x: width * 0.5, y: height * 0.36 };
        }

        function easeTurnboundTrinity(t) {
            const x = Math.max(0, Math.min(1, t));
            return x * x * (3 - 2 * x);
        }

        function syncTurnboundTrinityPart(part, targetX, targetY, dt, stiffness = 8.5) {
            const oldX = part.x;
            const oldY = part.y;
            const blend = 1 - Math.exp(-stiffness * dt);
            part.x += (targetX - part.x) * blend;
            part.y += (targetY - part.y) * blend;
            part.vx = (part.x - oldX) / Math.max(0.001, dt);
            part.vy = (part.y - oldY) / Math.max(0.001, dt);
        }

        function getTurnboundTrinityActivePart(target = boss) {
            if (!target || !Array.isArray(target.parts) || target.parts.length === 0) return null;
            const index = Math.max(0, Math.min(target.parts.length - 1, target.trinityActiveIndex || 0));
            return target.parts[index];
        }

        function getTurnboundTrinityAttackDuration(part) {
            if (!part) return TRINITY_ATTACK_DURATION;
            if (part.id === 'sword') return TRINITY_SWORD_ATTACK_DURATION;
            if (part.id === 'spell') return TRINITY_GRENADE_ATTACK_DURATION;
            return TRINITY_ATTACK_DURATION;
        }

        function pushTrinityProjectile(config = {}) {
            if (enemyBullets.length >= TRINITY_BULLET_SOFT_CAP) return false;
            enemyBullets.push({
                char: '✦',
                color: '#ffe6a3',
                isTrinityBullet: true,
                trinityBulletType: 'turret',
                hitboxScale: 0.9,
                ...config
            });
            return true;
        }

        function fireTrinityTurret(part, target, bossNow) {
            if (bossNow - (target.trinityLastFire || 0) < 86) return;
            target.trinityPatternAngle = (target.trinityPatternAngle || 0) + 0.23;
            const muzzleX = part.x;
            const muzzleY = part.y + 42;
            const wobble = Math.sin((target.trinityStateTimer || 0) * 5.2) * 0.14;
            for (let arm = 0; arm < 4; arm++) {
                const angle = target.trinityPatternAngle + arm * Math.PI / 2 + wobble;
                const speed = 246 + (arm % 2) * 36;
                pushTrinityProjectile({
                    x: muzzleX,
                    y: muzzleY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed + 82,
                    char: arm % 2 === 0 ? '✦' : '·',
                    color: arm % 2 === 0 ? '#ffe27a' : '#f8fbff',
                    trinityBulletType: 'turret',
                    hitboxScale: 0.82
                });
            }
            if (Math.floor((target.trinityStateTimer || 0) * 10) % 5 === 0) {
                const aim = Math.atan2(player.y - muzzleY, player.x - muzzleX);
                for (const offset of [-0.18, 0.18]) {
                    pushTrinityProjectile({
                        x: muzzleX,
                        y: muzzleY,
                        vx: Math.cos(aim + offset) * 265,
                        vy: Math.sin(aim + offset) * 265,
                        char: '+',
                        color: '#fff2a8',
                        trinityBulletType: 'turret',
                        hitboxScale: 0.78
                    });
                }
            }
            target.trinityLastFire = bossNow;
        }

        function getDistanceSqToSegment(px, py, ax, ay, bx, by) {
            const abx = bx - ax;
            const aby = by - ay;
            const lenSq = abx * abx + aby * aby;
            if (lenSq <= 0.0001) {
                const dx = px - ax;
                const dy = py - ay;
                return dx * dx + dy * dy;
            }
            const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lenSq));
            const cx = ax + abx * t;
            const cy = ay + aby * t;
            const dx = px - cx;
            const dy = py - cy;
            return dx * dx + dy * dy;
        }

        function getTrinitySwordTiming(timer) {
            let remaining = Math.max(0, timer || 0);
            const burstActiveTime = TRINITY_SWORD_BURST_SIZE * TRINITY_SWORD_SWING_DURATION;
            const burstStride = burstActiveTime + TRINITY_SWORD_BURST_GAP;
            for (let burstIndex = 0; burstIndex < TRINITY_SWORD_BURST_ROUNDS; burstIndex++) {
                if (remaining < burstActiveTime) {
                    const swingInBurst = Math.min(TRINITY_SWORD_BURST_SIZE - 1, Math.floor(remaining / TRINITY_SWORD_SWING_DURATION));
                    return {
                        active: true,
                        finale: false,
                        burstIndex,
                        swingInBurst,
                        globalSwingIndex: burstIndex * TRINITY_SWORD_BURST_SIZE + swingInBurst,
                        localT: remaining - swingInBurst * TRINITY_SWORD_SWING_DURATION
                    };
                }
                if (remaining < burstStride) return { active: false };
                remaining -= burstStride;
            }

            const finaleActiveTime = TRINITY_SWORD_FINALE_SWINGS * TRINITY_SWORD_SWING_DURATION;
            if (remaining < finaleActiveTime) {
                const swingInBurst = Math.min(TRINITY_SWORD_FINALE_SWINGS - 1, Math.floor(remaining / TRINITY_SWORD_SWING_DURATION));
                return {
                    active: true,
                    finale: true,
                    burstIndex: TRINITY_SWORD_BURST_ROUNDS,
                    swingInBurst,
                    globalSwingIndex: TRINITY_SWORD_BURST_ROUNDS * TRINITY_SWORD_BURST_SIZE + swingInBurst,
                    localT: remaining - swingInBurst * TRINITY_SWORD_SWING_DURATION
                };
            }
            return { active: false };
        }

        function getTrinitySwordLength(timing) {
            if (!timing || !timing.active) return 0;
            if (timing.finale) {
                return Math.min(height * 0.94, 560 + timing.swingInBurst * 62);
            }
            return Math.min(height * 0.78, 220 + timing.globalSwingIndex * 28);
        }

        function getTrinitySwordSlash(part, target) {
            const timing = getTrinitySwordTiming(target.trinityStateTimer || 0);
            if (!timing.active) return null;

            const progress = Math.max(0, Math.min(1, (target.trinityStateTimer || 0) / TRINITY_SWORD_ATTACK_DURATION));
            const swingIndex = timing.globalSwingIndex;
            const localT = timing.localT;
            const groupIndex = timing.burstIndex;
            const comboIndex = timing.swingInBurst;
            const baseAngle = timing.finale
                ? TRINITY_SWORD_FINALE_ANGLES[timing.swingInBurst % TRINITY_SWORD_FINALE_ANGLES.length]
                : TRINITY_SWORD_BASE_ANGLES[swingIndex % TRINITY_SWORD_BASE_ANGLES.length];
            const direction = groupIndex % 2 === 0 ? 1 : -1;
            const arc = timing.finale ? 0.64 : 0.38;
            const startAngle = baseAngle - direction * arc;
            const endAngle = baseAngle + direction * arc;
            const maxLength = getTrinitySwordLength(timing);
            let angle = startAngle;
            let length = maxLength * 0.45;
            let alpha = 0.22 + progress * 0.12;
            let hot = false;
            let swingProgress = 0;

            if (localT < TRINITY_SWORD_WINDUP) {
                const windup = easeTurnboundTrinity(localT / TRINITY_SWORD_WINDUP);
                angle = startAngle;
                length = maxLength * (0.42 + windup * 0.34);
                alpha = 0.18 + windup * 0.22;
            } else if (localT < TRINITY_SWORD_WINDUP + TRINITY_SWORD_SWEEP) {
                swingProgress = easeTurnboundTrinity((localT - TRINITY_SWORD_WINDUP) / TRINITY_SWORD_SWEEP);
                angle = startAngle + (endAngle - startAngle) * swingProgress;
                length = maxLength * (0.82 + swingProgress * 0.18);
                alpha = 0.86;
                hot = true;
            } else if (localT < TRINITY_SWORD_WINDUP + TRINITY_SWORD_SWEEP + TRINITY_SWORD_HOLD) {
                angle = endAngle;
                length = maxLength;
                alpha = 0.78;
                hot = true;
            } else {
                const recoverT = Math.max(0, Math.min(1, (localT - TRINITY_SWORD_WINDUP - TRINITY_SWORD_SWEEP - TRINITY_SWORD_HOLD)
                    / Math.max(0.01, TRINITY_SWORD_SWING_DURATION - TRINITY_SWORD_WINDUP - TRINITY_SWORD_SWEEP - TRINITY_SWORD_HOLD)));
                angle = endAngle;
                length = maxLength * (1 - recoverT * 0.34);
                alpha = 0.4 * (1 - recoverT);
            }

            const originX = part.x;
            const originY = part.y + 54;
            return {
                originX,
                originY,
                angle,
                length,
                radius: TRINITY_SWORD_RADIUS,
                tipX: originX + Math.cos(angle) * length,
                tipY: originY + Math.sin(angle) * length,
                hot,
                alpha,
                swingIndex,
                comboIndex,
                swingProgress,
                finale: timing.finale
            };
        }

        function applyTrinitySwordDamage(slash, target, dt) {
            if (!slash || !slash.hot || !player || player.godMode || gameState !== 'PLAYING') return;
            target.trinitySwordDamageTimer = Math.max(0, (target.trinitySwordDamageTimer || 0) - dt);
            if (target.trinitySwordDamageTimer > 0) return;

            const hitboxR = 30 * getPlayerHitboxScale();
            const hitRadius = hitboxR + slash.radius;
            const distSq = getDistanceSqToSegment(player.x, player.y, slash.originX, slash.originY, slash.tipX, slash.tipY);
            if (distSq > hitRadius * hitRadius) return;

            player.hp -= TRINITY_SWORD_DAMAGE;
            recordRunDamageTaken(TRINITY_SWORD_DAMAGE);
            resetComboOnPlayerDamage();
            addShake(10);
            wobble = Math.max(wobble || 0, 0.42);
            player.flashTimer = Math.max(player.flashTimer || 0, 0.08);
            target.trinitySwordDamageTimer = TRINITY_SWORD_DAMAGE_TICK;
            if (debris.length < 520) {
                for (let i = 0; i < 4; i++) {
                    const burst = slash.angle + Math.PI + (Math.random() - 0.5) * 0.9;
                    const speed = 80 + Math.random() * 140;
                    debris.push({
                        x: player.x + (Math.random() - 0.5) * 10,
                        y: player.y + (Math.random() - 0.5) * 10,
                        vx: Math.cos(burst) * speed,
                        vy: Math.sin(burst) * speed,
                        char: i % 2 ? '*' : '+',
                        color: i % 2 ? '#ff2b45' : '#ffffff',
                        life: 0.22,
                        isImpact: true
                    });
                }
            }
            if (player.hp <= 0) {
                gameState = 'DYING';
                deathTimer = 0;
                shake = 0;
                fadeMusicForDeath();
            }
        }

        function fireTrinitySword(part, target, bossNow, dt) {
            const slash = getTrinitySwordSlash(part, target);
            if (!slash) {
                target.trinitySwordSlash = null;
                return;
            }
            target.trinitySwordAngle = slash.angle;
            target.trinitySwordSlash = slash;
            applyTrinitySwordDamage(slash, target, dt);
        }

        function fireTrinitySpell(part, target, bossNow) {
            if (bossNow - (target.trinityLastFire || 0) < 180) return;
            target.trinityPatternAngle = (target.trinityPatternAngle || 0) - 0.18;
            const phase = target.trinityStateTimer || 0;
            const sourceY = part.y + 38;
            const burst = Math.floor(phase * 2.2) !== Math.floor((phase - 0.18) * 2.2);
            const count = burst ? 9 : 3;
            for (let i = 0; i < count; i++) {
                const angle = target.trinityPatternAngle + (i / count) * Math.PI * 2;
                const speed = burst ? 210 + (i % 3) * 22 : 245;
                const drift = burst ? Math.sin(i * 1.7 + phase) * 0.16 : 0;
                pushTrinityProjectile({
                    x: part.x + Math.cos(angle) * (burst ? 16 : 8),
                    y: sourceY + Math.sin(angle) * (burst ? 12 : 6),
                    vx: Math.cos(angle + drift) * speed,
                    vy: Math.sin(angle + drift) * speed + 96,
                    char: burst ? (i % 2 === 0 ? '✧' : '◇') : '∙',
                    color: burst ? (i % 2 === 0 ? '#d9c8ff' : '#8ff7ff') : '#f4fbff',
                    trinityBulletType: 'spell',
                    hitboxScale: burst ? 0.94 : 0.72
                });
            }
            target.trinityLastFire = bossNow;
        }

        function launchTrinityGrenade(part, target, lateralOffset = 0, fuseOffset = 0) {
            const muzzleX = part.x + lateralOffset;
            const muzzleY = part.y + 42;
            const aimSpreadX = (Math.random() - 0.5) * 170;
            const aimSpreadY = (Math.random() - 0.5) * 115;
            const aimX = Math.max(70, Math.min(width - 70, player.x + lateralOffset * 0.28 + aimSpreadX));
            const aimY = Math.max(height * 0.44, Math.min(height - 115, player.y - 18 + aimSpreadY));
            const travelTime = 0.78 + Math.min(0.22, Math.abs(lateralOffset) / 320) + Math.random() * 0.1;
            const vx = (aimX - muzzleX) / travelTime;
            const vy = (aimY - muzzleY - 0.5 * TRINITY_GRENADE_GRAVITY * travelTime * travelTime) / travelTime;

            pushTrinityProjectile({
                x: muzzleX,
                y: muzzleY,
                vx,
                vy,
                char: 'o',
                color: '#d9c8ff',
                trinityBulletType: 'grenade',
                isTrinityGrenade: true,
                nonDamaging: true,
                hitboxScale: 0.78,
                fuse: TRINITY_GRENADE_FUSE + fuseOffset + Math.random() * 0.22,
                maxFuse: TRINITY_GRENADE_FUSE + fuseOffset + 0.22,
                gravity: TRINITY_GRENADE_GRAVITY,
                spin: Math.random() * Math.PI * 2,
                grenadePhase: Math.random() * 100
            });
        }

        function fireTrinityGrenadeLauncher(part, target, bossNow) {
            const elapsed = target.trinityStateTimer || 0;
            const volleyIndex = target.trinityGrenadeVolleyIndex || 0;
            if (volleyIndex >= TRINITY_GRENADE_VOLLEY_COUNTS.length) return;
            const nextVolleyTime = 0.24 + volleyIndex * TRINITY_GRENADE_INTERVAL;
            if (elapsed < nextVolleyTime) return;

            const count = TRINITY_GRENADE_VOLLEY_COUNTS[volleyIndex];
            const spread = count === 1 ? [0]
                : (count === 2 ? [-62, 62]
                    : (count === 3 ? [-100, 0, 100] : [-138, -46, 46, 138]));
            for (let i = 0; i < spread.length; i++) {
                launchTrinityGrenade(part, target, spread[i], i * 0.035);
            }
            target.trinityGrenadeVolleyIndex = volleyIndex + 1;
            target.trinityLastFire = bossNow;
        }

        function explodeTrinityGrenade(grenade) {
            if (!grenade) return;
            const radius = grenade.explosionRadius || TRINITY_GRENADE_RADIUS;
            addShake(8);
            applyWakeForce(grenade.x, grenade.y, radius * 1.25, 8);
            bombBlastRings.push({
                x: grenade.x,
                y: grenade.y,
                color: '#b99dff',
                glyph: '◇',
                life: 0,
                maxLife: 0.34,
                maxRadius: radius,
                shadowBlur: 13
            });
            bombBlastRings.push({
                x: grenade.x,
                y: grenade.y,
                color: '#8ff7ff',
                glyph: 'O',
                life: 0,
                maxLife: 0.24,
                maxRadius: radius * 0.62,
                shadowBlur: 10
            });

            const hitboxR = 30 * getPlayerHitboxScale();
            const dx = player.x - grenade.x;
            const dy = player.y - grenade.y;
            const hitRadius = radius + hitboxR;
            if (!player.godMode && player.invincibilityTimer <= 0 && dx * dx + dy * dy <= hitRadius * hitRadius) {
                player.hp -= TRINITY_GRENADE_DAMAGE;
                recordRunDamageTaken(TRINITY_GRENADE_DAMAGE);
                resetComboOnPlayerDamage();
                player.invincibilityTimer = 0.34 + player.modifiers.invincibility;
                player.flashTimer = player.invincibilityTimer;
                wobble = Math.max(wobble || 0, 0.7);
                if (player.hp <= 0) {
                    gameState = 'DYING';
                    deathTimer = 0;
                    shake = 0;
                    fadeMusicForDeath();
                }
            }

            const shardCount = Math.min(TRINITY_GRENADE_SHARDS, Math.max(4, TRINITY_GRENADE_SHARDS - Math.floor(enemyBullets.length / 90)));
            for (let i = 0; i < shardCount; i++) {
                const angle = (i / shardCount) * Math.PI * 2 + (grenade.grenadePhase || 0) * 0.01;
                const speed = 175 + (i % 2) * 34;
                pushTrinityProjectile({
                    x: grenade.x,
                    y: grenade.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    char: i % 2 ? '.' : '+',
                    color: i % 2 ? '#8ff7ff' : '#d9c8ff',
                    trinityBulletType: 'grenadeShard',
                    hitboxScale: 0.72
                });
            }

            if (debris.length < 600) {
                for (let i = 0; i < 14; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 70 + Math.random() * 220;
                    debris.push({
                        x: grenade.x,
                        y: grenade.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        char: i % 3 === 0 ? '*' : (i % 3 === 1 ? '+' : '.'),
                        color: i % 2 ? '#b99dff' : '#8ff7ff',
                        life: 0.32 + Math.random() * 0.2,
                        isImpact: true
                    });
                }
            }
        }

        function updateTurnboundTrinityBoss(dt, bossNow) {
            if (!boss || !boss.isTurnboundTrinity) return false;
            if (!Array.isArray(boss.parts) || boss.parts.length < 3) return false;

            if (boss.phase === 'INTRO') {
                const nextTimer = Math.min(TRINITY_INTRO_DURATION, boss.timer + dt);
                const progress = easeTurnboundTrinity(nextTimer / TRINITY_INTRO_DURATION);
                for (let i = 0; i < boss.parts.length; i++) {
                    const part = boss.parts[i];
                    const idle = getTurnboundTrinityIdleTarget(i);
                    const introX = width * [0.23, 0.5, 0.77][i];
                    const introY = -220 - i * 34;
                    part.x = introX + (idle.x - introX) * progress + Math.sin(nextTimer * 3.2 + i) * (1 - progress) * 8;
                    part.y = introY + (idle.y - introY) * progress;
                    part.vx = 0;
                    part.vy = 0;
                }
                boss.x = width / 2;
                boss.y = height * 0.16;
                boss.timer = nextTimer;
                boss.isVulnerable = false;
                boss.isShielded = true;
                if (boss.timer >= TRINITY_INTRO_DURATION) {
                    boss.phase = 'ACTIVE';
                    boss.timer = 0;
                    boss.trinityStateTimer = 0;
                    boss.trinityTurnState = 'ADVANCE';
                    boss.trinityActiveIndex = 0;
                    boss.trinityLastFire = 0;
                    boss.trinitySwordSlash = null;
                    boss.trinitySwordDamageTimer = 0;
                }
                return false;
            }

            boss.timer += dt;
            boss.trinityStateTimer = (boss.trinityStateTimer || 0) + dt;
            const activeIndex = Math.max(0, Math.min(2, boss.trinityActiveIndex || 0));
            const activePart = boss.parts[activeIndex];
            const attackTarget = getTurnboundTrinityAttackTarget();
            const state = boss.trinityTurnState || 'ADVANCE';

            for (let i = 0; i < boss.parts.length; i++) {
                const part = boss.parts[i];
                const idle = getTurnboundTrinityIdleTarget(i);
                const isActive = i === activeIndex;
                const targetX = isActive && (state === 'ADVANCE' || state === 'ATTACK') ? attackTarget.x : idle.x;
                const targetY = isActive && (state === 'ADVANCE' || state === 'ATTACK') ? attackTarget.y : idle.y;
                syncTurnboundTrinityPart(part, targetX, targetY + Math.sin(boss.timer * 1.7 + i) * (isActive ? 4 : 7), dt, isActive ? 10.5 : 7.2);
            }

            boss.x = activePart.x;
            boss.y = activePart.y;
            boss.color = activePart.color || '#ffe27a';
            boss.isVulnerable = state === 'ADVANCE' || state === 'ATTACK';
            boss.isShielded = !boss.isVulnerable;
            applyWakeForce(boss.x, boss.y, 160, 4.5);

            if (maybeTriggerBossDeathCinematic(boss)) return true;

            if (state === 'ADVANCE' && boss.trinityStateTimer >= TRINITY_ADVANCE_DURATION) {
                boss.trinityTurnState = 'ATTACK';
                boss.trinityStateTimer = 0;
                boss.trinityLastFire = 0;
                boss.trinityPatternAngle = activeIndex * Math.PI * 0.45;
                boss.trinitySwordSlash = null;
                boss.trinitySwordDamageTimer = 0;
                boss.trinityGrenadeVolleyIndex = 0;
                boss.trinityGrenadeFinalVolleyFired = false;
            } else if (state === 'ATTACK') {
                if (activePart.id === 'turret') fireTrinityTurret(activePart, boss, bossNow);
                else if (activePart.id === 'sword') fireTrinitySword(activePart, boss, bossNow, dt);
                else fireTrinityGrenadeLauncher(activePart, boss, bossNow);

                if (boss.trinityStateTimer >= getTurnboundTrinityAttackDuration(activePart)) {
                    boss.trinityTurnState = 'RETURN';
                    boss.trinityStateTimer = 0;
                    boss.trinityLastFire = 0;
                    boss.isVulnerable = false;
                    boss.isShielded = true;
                    boss.trinitySwordSlash = null;
                    boss.trinityGrenadeFinalVolleyFired = false;
                    boss.trinityGrenadeVolleyIndex = 0;
                }
            } else if (state === 'RETURN' && boss.trinityStateTimer >= TRINITY_RETURN_DURATION) {
                boss.trinityTurnState = 'PAUSE';
                boss.trinityStateTimer = 0;
                boss.trinitySwordSlash = null;
            } else if (state === 'PAUSE' && boss.trinityStateTimer >= TRINITY_PAUSE_DURATION) {
                boss.trinityActiveIndex = (activeIndex + 1) % boss.parts.length;
                boss.trinityTurnState = 'ADVANCE';
                boss.trinityStateTimer = 0;
                boss.trinityLastFire = 0;
                boss.trinitySwordSlash = null;
            }
            return false;
        }

        function getTurnboundTrinityPartColor(part, isActive, isVulnerable, bodyFlash, intro) {
            if (bodyFlash && isActive) return '#ffffff';
            if (intro) return '#535b66';
            if (!isActive) return '#586070';
            if (!isVulnerable) return '#7b8494';
            return part.color || '#ffe27a';
        }

        function drawTrinitySwordSlash(slash, renderNow) {
            if (!slash || slash.length <= 4 || slash.alpha <= 0.01) return;
            const glowAlpha = slash.hot ? slash.alpha : slash.alpha * 0.48;
            const coreAlpha = slash.hot ? Math.min(1, slash.alpha + 0.08) : slash.alpha * 0.5;
            const flicker = slash.hot ? 0.78 + Math.sin(renderNow * 0.038 + slash.swingIndex) * 0.22 : 0.5;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            if (glowEnabled) {
                ctx.shadowColor = '#ff102c';
                ctx.shadowBlur = slash.hot ? 24 : 10;
            }
            ctx.globalAlpha *= glowAlpha * 0.46;
            ctx.strokeStyle = '#ff102c';
            ctx.lineWidth = slash.radius * 3.6;
            ctx.beginPath();
            ctx.moveTo(slash.originX, slash.originY);
            ctx.lineTo(slash.tipX, slash.tipY);
            ctx.stroke();

            ctx.globalAlpha *= 1.65;
            ctx.strokeStyle = '#bd001f';
            ctx.lineWidth = slash.radius * 1.55;
            ctx.beginPath();
            ctx.moveTo(slash.originX, slash.originY);
            ctx.lineTo(slash.tipX, slash.tipY);
            ctx.stroke();

            ctx.globalAlpha = coreAlpha;
            ctx.shadowBlur = glowEnabled ? 10 : 0;
            ctx.strokeStyle = '#ffe8ee';
            ctx.lineWidth = Math.max(3, slash.radius * 0.44);
            ctx.beginPath();
            ctx.moveTo(slash.originX, slash.originY);
            ctx.lineTo(slash.tipX, slash.tipY);
            ctx.stroke();
            ctx.restore();

            const glyphCount = slash.hot ? 11 : 6;
            ctx.save();
            ctx.translate(slash.originX, slash.originY);
            ctx.rotate(slash.angle - Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalCompositeOperation = 'screen';
            ctx.font = 'bold 22px Courier New';
            if (glowEnabled) {
                ctx.shadowColor = '#ff102c';
                ctx.shadowBlur = slash.hot ? 14 : 7;
            }
            for (let i = 0; i < glyphCount; i++) {
                const t = (i + 0.65) / (glyphCount + 0.25);
                const y = slash.length * t;
                const edge = 1 - Math.abs(t - 0.5) * 0.48;
                ctx.globalAlpha = Math.max(0, slash.alpha * edge * (slash.hot ? flicker : 0.55));
                ctx.fillStyle = i % 3 === 0 ? '#ffffff' : '#ff243e';
                ctx.fillText(i % 2 === 0 ? '█' : '▓', Math.sin(renderNow * 0.018 + i) * 1.4, y);
            }
            ctx.restore();
        }

        function drawTurnboundTrinityBoss(renderNow, bossRenderEntries) {
            if (!boss || !Array.isArray(boss.parts)) return;
            const activeIndex = boss.trinityActiveIndex || 0;
            const intro = boss.phase === 'INTRO';
            const state = boss.trinityTurnState || 'INTRO';
            const bodyFlash = boss.flashTimer > 0;

            for (let i = 0; i < boss.parts.length; i++) {
                const part = boss.parts[i];
                const sprite = part.sprite && part.sprite.length ? part.sprite : (boss.sprite && boss.sprite.length ? boss.sprite : TURNBOUND_TRINITY_RENDER_SPRITE);
                const cells = part.visibleCells || (sprite === TURNBOUND_TRINITY_RENDER_SPRITE && typeof TURNBOUND_TRINITY_VISIBLE_CELLS !== 'undefined'
                    ? TURNBOUND_TRINITY_VISIBLE_CELLS
                    : buildSpriteVisibleCells(sprite));
                const spriteWidth = part.spriteWidth || (sprite === TURNBOUND_TRINITY_RENDER_SPRITE && typeof TURNBOUND_TRINITY_SPRITE_WIDTH === 'number'
                    ? TURNBOUND_TRINITY_SPRITE_WIDTH
                    : sprite[0].length);
                const renderScale = part.renderScale || boss.renderScale || 0.44;
                const localX = -(spriteWidth * charW) / 2;
                const localY = -(sprite.length * charH) / 2;
                const isActive = i === activeIndex && boss.phase === 'ACTIVE';
                const isVulnerable = isActive && boss.isVulnerable;
                const alpha = intro ? 0.62 : (isActive ? 1 : 0.52);
                const color = getTurnboundTrinityPartColor(part, isActive, isVulnerable, bodyFlash, intro);
                const bob = Math.sin(renderNow * 0.003 + i * 1.7) * (isActive ? 2.5 : 1.5);

                ctx.save();
                ctx.translate(snapSpriteCoord(part.x), snapSpriteCoord(part.y + bob));
                ctx.scale(renderScale, renderScale);
                ctx.font = `bold 20px Courier New`;
                ctx.globalAlpha *= alpha;
                if (glowEnabled && isActive && boss.phase === 'ACTIVE') {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = isVulnerable ? 16 : 8;
                }
                let lastColor = null;
                for (const cell of cells) {
                    const row = sprite[cell.row] || '';
                    const char = row[cell.col];
                    if (!char || char === ' ') continue;
                    const paletteColor = part.spritePalette && part.spritePalette[char];
                    let glyphColor = bodyFlash && isActive
                        ? '#ffffff'
                        : (char === '▓' || char === '░'
                            ? colorWithAlpha(color, isActive ? 0.88 : 0.54)
                            : color);
                    if (paletteColor && !(bodyFlash && isActive)) glyphColor = paletteColor;
                    if (glyphColor !== lastColor) {
                        ctx.fillStyle = glyphColor;
                        lastColor = glyphColor;
                    }
                    const gx = localX + cell.col * charW;
                    const gy = localY + cell.row * charH;
                    ctx.fillText(char, gx | 0, gy | 0);
                    recordBossRenderGlyph(
                        bossRenderEntries,
                        char,
                        (part.x + gx * renderScale) | 0,
                        (part.y + (gy + bob) * renderScale) | 0,
                        glyphColor,
                        renderScale
                    );
                }
                ctx.restore();

                if (isActive && boss.phase === 'ACTIVE') {
                    ctx.save();
                    ctx.globalCompositeOperation = 'screen';
                    ctx.globalAlpha = isVulnerable ? 0.22 : 0.1;
                    const aura = ctx.createRadialGradient(part.x, part.y, 0, part.x, part.y, 90);
                    aura.addColorStop(0, colorWithAlpha(color, 0.58));
                    aura.addColorStop(1, colorWithAlpha(color, 0));
                    ctx.fillStyle = aura;
                    ctx.fillRect((part.x - 90) | 0, (part.y - 90) | 0, 180, 180);
                    ctx.restore();
                }
            }

            const activePart = getTurnboundTrinityActivePart(boss);
            if (boss.phase === 'ACTIVE' && activePart && state === 'ATTACK') {
                const attackTime = boss.trinityStateTimer || 0;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (activePart.id === 'turret') {
                    ctx.font = 'bold 26px Courier New';
                    ctx.fillStyle = '#fff2a8';
                    if (glowEnabled) {
                        ctx.shadowColor = '#ffe27a';
                        ctx.shadowBlur = 16;
                    }
                    ctx.fillText('╋', activePart.x | 0, (activePart.y + 56) | 0);
                    ctx.font = 'bold 15px Courier New';
                    ctx.fillText('▵', (activePart.x + Math.sin(renderNow * 0.012) * 11) | 0, (activePart.y + 42) | 0);
                } else if (activePart.id === 'sword') {
                    const slash = boss.trinitySwordSlash || getTrinitySwordSlash(activePart, boss);
                    drawTrinitySwordSlash(slash, renderNow);
                    ctx.font = 'bold 22px Courier New';
                    if (glowEnabled) {
                        ctx.shadowColor = '#ff102c';
                        ctx.shadowBlur = 16;
                    }
                    ctx.fillStyle = slash && slash.hot ? '#ffe8ee' : '#ff2b45';
                    ctx.fillText(slash && slash.hot ? '!' : '+', activePart.x | 0, (activePart.y + 50) | 0);
                } else if (false) {
                    for (let i = 0; i < 5; i++) ctx.fillText(i === 0 ? '◇' : '═', 0, 30 + i * 24);
                    ctx.restore();
                    ctx.save();
                } else {
                    const volleyIndex = boss.trinityGrenadeVolleyIndex || 0;
                    const pulse = 0.78 + Math.sin(renderNow * 0.026 + volleyIndex) * 0.22;
                    ctx.font = 'bold 27px Courier New';
                    ctx.fillStyle = '#d9c8ff';
                    if (glowEnabled) {
                        ctx.shadowColor = '#b99dff';
                        ctx.shadowBlur = 14 + pulse * 8;
                    }
                    ctx.fillText('o', activePart.x | 0, (activePart.y + 50) | 0);
                    ctx.font = 'bold 13px Courier New';
                    ctx.fillStyle = '#8ff7ff';
                    for (const offset of [-18, 0, 18]) {
                        ctx.fillText('.', (activePart.x + offset) | 0, (activePart.y + 37 + Math.sin(renderNow * 0.015 + offset) * 2) | 0);
                    }
                    ctx.globalAlpha = 0;
                    ctx.font = 'bold 24px Courier New';
                    if (glowEnabled) {
                        ctx.shadowColor = '#b99dff';
                        ctx.shadowBlur = 16;
                    }
                    for (let i = 0; i < 8; i++) {
                        const angle = attackTime * 2.0 + i * Math.PI / 4;
                        const r = 46 + Math.sin(attackTime * 3 + i) * 6;
                        ctx.fillStyle = i % 2 === 0 ? '#d9c8ff' : '#8ff7ff';
                        ctx.fillText(i % 2 === 0 ? '◇' : '✧', (activePart.x + Math.cos(angle) * r) | 0, (activePart.y + 42 + Math.sin(angle) * r * 0.72) | 0);
                    }
                }
                ctx.restore();
            }

            if (boss.phase === 'ACTIVE') {
                drawBossHealthBar(boss, {
                    color: boss.color || '#ffe27a',
                    labelColor: '#f4fbff',
                    label: 'TURNBOUND TRINITY'
                });
            }
        }

        const ECLIPSE_STAGE_COLORS = ['#c8f4ff', '#ffe27a', '#ff8df4'];
        const ECLIPSE_STAGE_ACCENTS = ['#83e8ff', '#ffb84c', '#a989ff'];
        const ECLIPSE_BULLET_SOFT_CAP = 260;

        function isEclipseWardenShielded(target = boss) {
            return !!(target && target.isEclipseWarden && target.eclipseShielded);
        }

        function isBossDamageShielded(target = boss) {
            return !!(target && ((target.isBattleStarship && target.isShielded) || (target.isTurnboundTrinity && target.isShielded) || (target.isDreadLiturgy && target.isShielded) || isEclipseWardenShielded(target)));
        }

        const DREAD_INTRO_DURATION = 5.0;
        const DREAD_BULLET_SOFT_CAP = 230;
        const DREAD_LANE_COUNT = 4;
        const DREAD_PATTERN_DURATIONS = [6.4, 6.8, 6.2, 5.3];
        const DREAD_SLASH_DAMAGE = 10;
        const DREAD_SLASH_DAMAGE_TICK = 0.16;

        function easeDreadLiturgy(t) {
            const clamped = Math.max(0, Math.min(1, t));
            return 1 - Math.pow(1 - clamped, 3);
        }

        function getDreadLaneX(lane) {
            return width * (0.17 + Math.max(0, Math.min(DREAD_LANE_COUNT - 1, lane)) * 0.22);
        }

        function getDreadPatternDuration(target = boss) {
            return DREAD_PATTERN_DURATIONS[Math.max(0, Math.min(DREAD_PATTERN_DURATIONS.length - 1, target.attackPattern || 0))];
        }

        function pickDreadSafeLane(target = boss, step = 0) {
            const playerLane = Math.max(0, Math.min(DREAD_LANE_COUNT - 1, Math.floor((player.x / Math.max(1, width)) * DREAD_LANE_COUNT)));
            return (playerLane + 1 + (((target && target.dreadCastIndex) || 0) + step) % 3) % DREAD_LANE_COUNT;
        }

        function resetDreadPattern(target = boss) {
            if (!target) return;
            target.lastFire = 0;
            target.dreadPatternStep = -1;
            target.dreadWarningFired = false;
            target.dreadPatternFired = false;
            target.dreadSwingIndex = -1;
            target.dreadSlash = null;
            target.dreadSafeLane = pickDreadSafeLane(target, target.attackPattern || 0);
            target.dreadCastIndex = (target.dreadCastIndex || 0) + 1;
            target.dreadDamageTimer = 0;
        }

        function pushDreadProjectile(config = {}) {
            if (enemyBullets.length >= DREAD_BULLET_SOFT_CAP) return false;
            pushVoidProjectile({
                char: config.char || '+',
                color: config.color || '#d8d4ff',
                voidBulletSize: config.voidBulletSize || 24,
                isDreadBullet: true,
                hitboxScale: config.hitboxScale || 0.82,
                ...config
            });
            return true;
        }

        function emitDreadWarning(x, y, char = '!') {
            pushDreadProjectile({
                x,
                y,
                vx: 0,
                vy: 0,
                char,
                color: '#ff5a78',
                dreadBulletType: 'warning',
                nonDamaging: true,
                life: 0.74,
                decay: 1.15,
                hitboxScale: 0.05,
                voidBulletSize: 22
            });
        }

        function fireDreadGuillotine(target, bossNow) {
            const cycle = 1.12;
            const step = Math.floor(target.timer / cycle);
            const cycleT = target.timer - step * cycle;
            if (step !== target.dreadPatternStep) {
                target.dreadPatternStep = step;
                target.dreadWarningFired = false;
                target.dreadPatternFired = false;
                target.dreadSafeLane = pickDreadSafeLane(target, step);
            }
            if (!target.dreadWarningFired && cycleT >= 0.08) {
                for (let lane = 0; lane < DREAD_LANE_COUNT; lane++) {
                    const laneX = getDreadLaneX(lane);
                    if (lane === target.dreadSafeLane) {
                        emitDreadWarning(laneX, height * 0.18, '.');
                    } else {
                        emitDreadWarning(laneX - 14, height * 0.18, '!');
                        emitDreadWarning(laneX + 14, height * 0.32, '!');
                    }
                }
                target.dreadWarningFired = true;
            }
            if (!target.dreadPatternFired && cycleT >= 0.46) {
                for (let lane = 0; lane < DREAD_LANE_COUNT; lane++) {
                    if (lane === target.dreadSafeLane) continue;
                    const laneX = getDreadLaneX(lane);
                    const laneSpread = step % 2 === 0 ? [-18, 18] : [-28, 0, 28];
                    for (let i = 0; i < laneSpread.length; i++) {
                        pushDreadProjectile({
                            x: laneX + laneSpread[i],
                            y: -32 - i * 22,
                            vx: Math.sin(step + lane * 1.3 + i) * 16,
                            vy: 292 + i * 24,
                            char: i % 2 === 0 ? '|' : '!',
                            color: i % 2 === 0 ? '#f4ecff' : '#ff7d92',
                            dreadBulletType: 'guillotine',
                            voidBulletSize: 25,
                            hitboxScale: 0.72
                        });
                    }
                }
                target.dreadPatternFired = true;
                target.lastFire = bossNow;
            }
        }

        function createDreadSlash(target, swingIndex) {
            const side = swingIndex % 2 === 0 ? -1 : 1;
            const originX = target.x + side * 76;
            const originY = target.y + 48;
            const aimAngle = Math.atan2(player.y - originY, player.x - originX);
            const bias = side < 0 ? 0.22 : -0.22;
            const sweep = Math.sin(swingIndex * 1.7) * 0.55;
            return {
                originX,
                originY,
                angle: aimAngle + bias + sweep,
                length: Math.min(height * 0.78, 245 + swingIndex * 34),
                radius: 15 + Math.min(6, swingIndex * 0.8),
                life: 0.36,
                maxLife: 0.36,
                hot: false,
                swingIndex,
                alpha: 1
            };
        }

        function updateDreadSlash(target, dt) {
            const slash = target.dreadSlash;
            if (!slash) return;
            slash.life -= dt;
            const age = (slash.maxLife || 0.36) - slash.life;
            slash.hot = age >= 0.095 && slash.life >= 0.055;
            slash.alpha = Math.max(0, Math.min(1, slash.life / Math.max(0.001, slash.maxLife || 0.36)));
            slash.tipX = slash.originX + Math.cos(slash.angle) * slash.length;
            slash.tipY = slash.originY + Math.sin(slash.angle) * slash.length;
            if (slash.hot) applyDreadSlashDamage(slash, target, dt);
            if (slash.life <= 0) target.dreadSlash = null;
        }

        function applyDreadSlashDamage(slash, target, dt) {
            if (!slash || !player || player.godMode || gameState !== 'PLAYING') return;
            target.dreadDamageTimer = Math.max(0, (target.dreadDamageTimer || 0) - dt);
            if (target.dreadDamageTimer > 0) return;
            const hitboxR = 30 * getPlayerHitboxScale();
            const hitRadius = hitboxR + slash.radius;
            const distSq = getDistanceSqToSegment(player.x, player.y, slash.originX, slash.originY, slash.tipX, slash.tipY);
            if (distSq > hitRadius * hitRadius) return;
            player.hp -= DREAD_SLASH_DAMAGE;
            recordRunDamageTaken(DREAD_SLASH_DAMAGE);
            resetComboOnPlayerDamage();
            addShake(9);
            wobble = Math.max(wobble || 0, 0.36);
            player.flashTimer = Math.max(player.flashTimer || 0, 0.08);
            target.dreadDamageTimer = DREAD_SLASH_DAMAGE_TICK;
            if (debris.length < 520) {
                for (let i = 0; i < 4; i++) {
                    const angle = slash.angle + Math.PI + (Math.random() - 0.5) * 0.8;
                    const speed = 80 + Math.random() * 130;
                    debris.push({
                        x: player.x + (Math.random() - 0.5) * 10,
                        y: player.y + (Math.random() - 0.5) * 10,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        char: i % 2 ? '+' : '.',
                        color: i % 2 ? '#ff5a78' : '#f4ecff',
                        life: 0.22,
                        isImpact: true
                    });
                }
            }
            if (player.hp <= 0) {
                gameState = 'DYING';
                deathTimer = 0;
                shake = 0;
                fadeMusicForDeath();
            }
        }

        function fireDreadMelee(target) {
            const warmup = 0.62;
            const cadence = 0.55;
            if (target.timer < warmup) return;
            const swingIndex = Math.floor((target.timer - warmup) / cadence);
            if (swingIndex === target.dreadSwingIndex || swingIndex > 10) return;
            target.dreadSwingIndex = swingIndex;
            target.dreadSlash = createDreadSlash(target, swingIndex);
            emitDreadWarning(target.dreadSlash.originX, target.dreadSlash.originY + 26, swingIndex % 2 ? '/' : '\\');
        }

        function fireDreadMaze(target) {
            const cycle = 0.7;
            const step = Math.floor(target.timer / cycle);
            const cycleT = target.timer - step * cycle;
            if (step !== target.dreadPatternStep) {
                target.dreadPatternStep = step;
                target.dreadPatternFired = false;
                target.dreadSafeLane = (step + (target.dreadCastIndex || 0)) % DREAD_LANE_COUNT;
            }
            if (!target.dreadPatternFired && cycleT >= 0.18) {
                for (let lane = 0; lane < DREAD_LANE_COUNT; lane++) {
                    const laneX = getDreadLaneX(lane);
                    if (lane === target.dreadSafeLane) {
                        emitDreadWarning(laneX, height * 0.12, '.');
                        continue;
                    }
                    const phase = step * 0.7 + lane;
                    pushDreadProjectile({
                        x: laneX,
                        y: -28,
                        vx: Math.sin(phase) * 18,
                        vy: 222,
                        char: step % 2 ? 'T' : '+',
                        color: lane % 2 ? '#d8d4ff' : '#ffb4c1',
                        dreadBulletType: 'maze',
                        isLatticeShot: true,
                        baseX: laneX,
                        waveAmp: 18 + (lane % 2) * 9,
                        waveFreq: 3.4,
                        wavePhase: phase,
                        waveTime: 0,
                        voidBulletSize: 24,
                        hitboxScale: 0.76
                    });
                }
                target.dreadPatternFired = true;
            }
        }

        function fireDreadOpenWound(target, bossNow) {
            if (bossNow - (target.lastFire || 0) < 500) return;
            const aimAngle = Math.atan2(player.y - (target.y + 42), player.x - target.x);
            const volleyIndex = target.dreadPatternStep = (target.dreadPatternStep || 0) + 1;
            for (let i = -1; i <= 1; i++) {
                const angle = aimAngle + i * 0.22 + Math.sin(volleyIndex * 1.4) * 0.06;
                const speed = 250 + (i === 0 ? 20 : 0);
                pushDreadProjectile({
                    x: target.x,
                    y: target.y + 48,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    char: i === 0 ? '*' : '.',
                    color: i === 0 ? '#fff4f7' : '#d8d4ff',
                    dreadBulletType: 'open',
                    voidBulletSize: i === 0 ? 25 : 19,
                    hitboxScale: i === 0 ? 0.9 : 0.68
                });
            }
            if (volleyIndex % 4 === 0) {
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + volleyIndex * 0.18;
                    pushDreadProjectile({
                        x: target.x,
                        y: target.y + 28,
                        vx: Math.cos(angle) * 170,
                        vy: Math.sin(angle) * 170 + 76,
                        char: '+',
                        color: '#ff8fa3',
                        dreadBulletType: 'open',
                        voidBulletSize: 20,
                        hitboxScale: 0.68
                    });
                }
            }
            target.lastFire = bossNow;
        }

        function updateDreadLiturgyBoss(dt, bossNow) {
            if (!boss || !boss.isDreadLiturgy) return false;
            if (boss.phase === 'INTRO') {
                const nextTimer = Math.min(DREAD_INTRO_DURATION, boss.timer + dt);
                const progress = easeDreadLiturgy(nextTimer / DREAD_INTRO_DURATION);
                const introStartX = typeof boss.introStartX === 'number' ? boss.introStartX : width / 2;
                const introStartY = typeof boss.introStartY === 'number' ? boss.introStartY : -220;
                const targetX = typeof boss.introTargetX === 'number' ? boss.introTargetX : width / 2;
                const targetY = typeof boss.introTargetY === 'number' ? boss.introTargetY : height * 0.18;
                boss.x = introStartX + (targetX - introStartX) * progress + Math.sin(nextTimer * 3.6) * (1 - progress) * 8;
                boss.y = introStartY + (targetY - introStartY) * progress;
                boss.timer = nextTimer;
                boss.isShielded = true;
                boss.isVulnerable = false;
                if (boss.timer >= DREAD_INTRO_DURATION) {
                    boss.phase = 'ACTIVE';
                    boss.timer = 0;
                    boss.startX = targetX;
                    boss.startY = targetY;
                    boss.attackPattern = 0;
                    boss.driftTimer = 0;
                    resetDreadPattern(boss);
                }
                return false;
            }

            boss.timer += dt;
            boss.driftTimer = (boss.driftTimer || 0) + dt;
            boss.x = (boss.startX || width / 2) + Math.sin(boss.driftTimer * 0.55) * 82;
            boss.y = (boss.startY || height * 0.18) + Math.sin(boss.driftTimer * 0.82 + 0.4) * 10;
            applyWakeForce(boss.x, boss.y, 190, 4.8);

            if (maybeTriggerBossDeathCinematic(boss)) return true;

            const patternDuration = getDreadPatternDuration(boss);
            if (boss.timer > patternDuration) {
                boss.timer = 0;
                boss.attackPattern = ((boss.attackPattern || 0) + 1) % DREAD_PATTERN_DURATIONS.length;
                resetDreadPattern(boss);
            }

            const pattern = boss.attackPattern || 0;
            boss.isShielded = (pattern === 1 && boss.timer < 0.85) || (pattern === 2 && boss.timer < 0.9);
            boss.isVulnerable = !boss.isShielded;

            if (pattern === 0) fireDreadGuillotine(boss, bossNow);
            else if (pattern === 1) fireDreadMelee(boss);
            else if (pattern === 2) fireDreadMaze(boss);
            else fireDreadOpenWound(boss, bossNow);

            updateDreadSlash(boss, dt);
            return false;
        }

        function getDreadGlyphColor(char, bodyFlash, shielded, phase) {
            if (bodyFlash) return '#ffffff';
            if (char === '!' || char === '+') return shielded ? '#ff8fa3' : '#ff5a78';
            if (char === '#' || char === '|') return shielded ? '#b8b3d8' : '#e4dcff';
            if (char === '.' || char === '-' || char === '`') return '#8ff7ff';
            if (char === '/' || char === '\\' || char === '_') return phase > 0.55 ? '#fff4f7' : '#c5bddf';
            return '#d8d4ff';
        }

        function drawDreadSlash(slash, renderNow) {
            if (!slash || slash.alpha <= 0.01) return;
            const tipX = slash.tipX || (slash.originX + Math.cos(slash.angle) * slash.length);
            const tipY = slash.tipY || (slash.originY + Math.sin(slash.angle) * slash.length);
            const pulse = 0.75 + Math.sin(renderNow * 0.025 + slash.swingIndex) * 0.25;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha *= slash.alpha * (slash.hot ? 0.72 : 0.34);
            if (glowEnabled) {
                ctx.shadowColor = '#ff3154';
                ctx.shadowBlur = slash.hot ? 22 : 10;
            }
            ctx.strokeStyle = '#ff3154';
            ctx.lineWidth = slash.radius * 3.5;
            ctx.beginPath();
            ctx.moveTo(slash.originX, slash.originY);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();
            ctx.globalAlpha = slash.alpha * (slash.hot ? 0.92 : 0.44);
            ctx.strokeStyle = slash.hot ? '#fff4f7' : '#b90f2d';
            ctx.lineWidth = Math.max(3, slash.radius * (slash.hot ? 0.52 : 0.36));
            ctx.beginPath();
            ctx.moveTo(slash.originX, slash.originY);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.translate(slash.originX, slash.originY);
            ctx.rotate(slash.angle - Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 19px Courier New';
            if (glowEnabled) {
                ctx.shadowColor = '#ff3154';
                ctx.shadowBlur = 10;
            }
            const glyphs = 8;
            for (let i = 0; i < glyphs; i++) {
                const t = (i + 0.7) / (glyphs + 0.4);
                ctx.globalAlpha = slash.alpha * (slash.hot ? 0.8 : 0.38) * pulse;
                ctx.fillStyle = i % 2 ? '#ff3154' : '#fff4f7';
                ctx.fillText(i % 2 ? '/' : '\\', Math.sin(renderNow * 0.018 + i) * 1.5, slash.length * t);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawDreadLaneMarkers(renderNow) {
            if (!boss || boss.phase !== 'ACTIVE') return;
            const pattern = boss.attackPattern || 0;
            if (pattern !== 0 && pattern !== 2) return;
            const safeLane = Math.max(0, Math.min(DREAD_LANE_COUNT - 1, boss.dreadSafeLane || 0));
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 22px Courier New';
            for (let lane = 0; lane < DREAD_LANE_COUNT; lane++) {
                const safe = lane === safeLane;
                const x = getDreadLaneX(lane);
                const y = height * (pattern === 0 ? 0.105 : 0.13);
                const pulse = 0.72 + Math.sin(renderNow * 0.011 + lane) * 0.22;
                ctx.globalAlpha = safe ? 0.62 + pulse * 0.18 : 0.38 + pulse * 0.12;
                ctx.fillStyle = safe ? '#8ff7ff' : '#ff5a78';
                if (glowEnabled) {
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = safe ? 12 : 8;
                }
                ctx.fillText(safe ? '[ ]' : 'X', x | 0, y | 0);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawDreadLiturgyBoss(renderNow, bossRenderEntries) {
            if (!boss || !boss.isDreadLiturgy) return;
            drawDreadLaneMarkers(renderNow);
            drawDreadSlash(boss.dreadSlash, renderNow);

            const sprite = boss.sprite && boss.sprite.length ? boss.sprite : DREAD_LITURGY_SPRITE;
            const cells = typeof DREAD_LITURGY_VISIBLE_CELLS !== 'undefined' ? DREAD_LITURGY_VISIBLE_CELLS : buildSpriteVisibleCells(sprite);
            const spriteWidth = sprite.reduce((max, row) => Math.max(max, row.length), 0);
            const renderScale = boss.renderScale || 1.12;
            const bodyFlash = boss.flashTimer > 0;
            const renderBossX = snapSpriteCoord(boss.x);
            const renderBossY = snapSpriteCoord(boss.y + Math.sin(renderNow * 0.004) * 2.4);
            const bSX = -(spriteWidth * charW) / 2;
            const bSY = -(sprite.length * charH) / 2;
            const phase = 0.5 + Math.sin(renderNow * 0.006 + (boss.attackPattern || 0)) * 0.5;

            ctx.save();
            ctx.translate(renderBossX, renderBossY);
            ctx.scale(renderScale, renderScale);
            ctx.font = 'bold 20px Courier New';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            if (glowEnabled && boss.phase !== 'INTRO') {
                ctx.shadowColor = boss.isShielded ? '#8ff7ff' : '#ff5a78';
                ctx.shadowBlur = boss.isShielded ? 9 : 15;
            }
            let lastColor = null;
            for (const cell of cells) {
                const row = sprite[cell.row] || '';
                const char = row[cell.col];
                if (!char || char === ' ') continue;
                const glyphColor = getDreadGlyphColor(char, bodyFlash, boss.isShielded, phase);
                if (glyphColor !== lastColor) {
                    ctx.fillStyle = glyphColor;
                    lastColor = glyphColor;
                }
                const gx = bSX + cell.col * charW;
                const gy = bSY + cell.row * charH;
                ctx.fillText(char, gx | 0, gy | 0);
                recordBossRenderGlyph(
                    bossRenderEntries,
                    char,
                    (renderBossX + gx * renderScale) | 0,
                    (renderBossY + gy * renderScale) | 0,
                    glyphColor,
                    renderScale
                );
            }
            ctx.restore();

            if (boss.phase === 'ACTIVE') {
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = boss.isShielded ? 0.11 : 0.18;
                const aura = ctx.createRadialGradient(boss.x, boss.y, 0, boss.x, boss.y, 145);
                aura.addColorStop(0, colorWithAlpha(boss.isShielded ? '#8ff7ff' : '#ff5a78', 0.42));
                aura.addColorStop(1, colorWithAlpha('#050610', 0));
                ctx.fillStyle = aura;
                ctx.fillRect((boss.x - 150) | 0, (boss.y - 145) | 0, 300, 290);
                ctx.restore();
                drawBossHealthBar(boss, {
                    color: boss.isShielded ? '#8ff7ff' : '#ff5a78',
                    labelColor: '#f4ecff',
                    label: boss.isShielded ? 'DREAD LITURGY  SEALED' : 'DREAD LITURGY'
                });
            }
        }

        function getEclipseStageColor(stage) {
            return ECLIPSE_STAGE_COLORS[Math.max(0, Math.min(ECLIPSE_STAGE_COLORS.length - 1, (stage || 1) - 1))];
        }

        function getEclipseStageAccent(stage) {
            return ECLIPSE_STAGE_ACCENTS[Math.max(0, Math.min(ECLIPSE_STAGE_ACCENTS.length - 1, (stage || 1) - 1))];
        }

        function pushEclipseProjectile(config = {}) {
            if (enemyBullets.length >= ECLIPSE_BULLET_SOFT_CAP) return false;
            pushVoidProjectile({
                char: config.char || '◇',
                color: config.color || getEclipseStageColor((boss && boss.stage) || 1),
                voidBulletSize: config.voidBulletSize || 24,
                isEclipseBullet: true,
                ...config
            });
            return true;
        }

        function countActiveEclipseSeals() {
            let count = 0;
            for (let i = 0; i < enemies.length; i++) {
                if (enemies[i] && enemies[i].isEclipseSeal) count++;
            }
            return count;
        }

        function clearEclipseSeals() {
            for (let i = enemies.length - 1; i >= 0; i--) {
                if (enemies[i] && enemies[i].isEclipseSeal) enemies.splice(i, 1);
            }
        }

        function spawnEclipseSeals(stage) {
            if (!boss || !boss.isEclipseWarden) return;
            clearEclipseSeals();
            const count = Math.min(5, 2 + stage);
            const radiusX = 118 + stage * 18;
            const radiusY = 52 + stage * 8;
            const color = getEclipseStageColor(stage);
            const angleOffset = (boss.eclipseSealCycle || 0) * 0.42 + ((typeof hostileTimeMs === 'number' ? hostileTimeMs : (currentFrameNow || 0)) * 0.0006);
            for (let i = 0; i < count; i++) {
                const angle = angleOffset + i * (Math.PI * 2 / count);
                enemies.push(createEclipseSeal({
                    x: boss.x + Math.cos(angle) * radiusX,
                    y: boss.y + Math.sin(angle) * radiusY,
                    angle,
                    radiusX,
                    radiusY,
                    stage,
                    hp: 40 + stage * 14,
                    color,
                    renderScale: 1.0 + stage * 0.04,
                    angularSpeed: (stage % 2 === 0 ? -1 : 1) * (0.52 + stage * 0.08 + i * 0.015),
                    fireOffset: -0.45 - i * 0.2
                }));
            }
        }

        function openEclipseDamageWindow() {
            if (!boss || !boss.isEclipseWarden) return;
            boss.eclipseShielded = false;
            boss.isVulnerable = true;
            boss.eclipseOpenTimer = Math.max(4.25, 5.9 - boss.stage * 0.42);
            boss.lastFire = 0;
            boss.timer = 0;
            boss.eclipseRingAngle = (boss.eclipseRingAngle || 0) + 0.5;
            for (let i = 0; i < 16 && debris.length < 380; i++) {
                const angle = (i / 16) * Math.PI * 2;
                debris.push({
                    x: boss.x + Math.cos(angle) * 62,
                    y: boss.y + Math.sin(angle) * 34,
                    vx: Math.cos(angle) * 115,
                    vy: Math.sin(angle) * 80,
                    char: i % 2 === 0 ? '◇' : '·',
                    color: getEclipseStageColor(boss.stage),
                    life: 0.28,
                    isImpact: true
                });
            }
        }

        function closeEclipseDamageWindow() {
            if (!boss || !boss.isEclipseWarden) return;
            boss.eclipseShielded = true;
            boss.isVulnerable = false;
            boss.eclipseOpenTimer = 0;
            boss.eclipseSealCycle = (boss.eclipseSealCycle || 0) + 1;
            spawnEclipseSeals(boss.stage || 1);
        }

        function transitionEclipseStage(nextStage) {
            if (!boss || !boss.isEclipseWarden || (boss.stage || 1) >= nextStage) return;
            boss.stage = nextStage;
            boss.attackPattern = 0;
            boss.timer = 0;
            boss.lastFire = 0;
            boss.eclipseTransitionTimer = 1.05;
            boss.eclipseShielded = true;
            boss.isVulnerable = false;
            boss.eclipseOpenTimer = 0;
            boss.eclipseSealCycle = (boss.eclipseSealCycle || 0) + 1;
            boss.color = getEclipseStageColor(nextStage);
            enemyBullets = enemyBullets.filter(b => !b.isEclipseBullet);
            spawnEclipseSeals(nextStage);
            addShake(7);
        }

        function updateEclipseSeals(dt) {
            if (!boss || !boss.isEclipseWarden) return;
            for (let i = enemies.length - 1; i >= 0; i--) {
                const seal = enemies[i];
                if (!seal || !seal.isEclipseSeal) continue;
                seal.onScreen = true;
                seal.sealTimer = (seal.sealTimer || 0) + dt;
                seal.color = getEclipseStageColor(seal.sealStage || boss.stage || 1);
                const angle = (seal.sealAngle || 0) + seal.sealTimer * (seal.sealAngularSpeed || 0.6);
                const oldX = seal.x;
                const oldY = seal.y;
                seal.x = boss.x + Math.cos(angle) * (seal.sealRadiusX || 128);
                seal.y = boss.y + 8 + Math.sin(angle) * (seal.sealRadiusY || 62);
                seal.vx = (seal.x - oldX) / Math.max(0.001, dt);
                seal.vy = (seal.y - oldY) / Math.max(0.001, dt);
                seal.fireTimer = (seal.fireTimer || 0) + dt;
                const fireInterval = Math.max(2.25, 3.35 - (seal.sealStage || 1) * 0.24);
                if (boss.eclipseShielded && seal.fireTimer >= fireInterval) {
                    seal.fireTimer = 0;
                    const dx = player.x - seal.x;
                    const dy = player.y - seal.y;
                    const dist = Math.max(1, Math.hypot(dx, dy));
                    const speed = 190 + (seal.sealStage || 1) * 16;
                    pushEclipseProjectile({
                        x: seal.x,
                        y: seal.y,
                        vx: (dx / dist) * speed,
                        vy: (dy / dist) * speed,
                        speed,
                        char: '◇',
                        color: seal.color,
                        voidBulletSize: 22
                    });
                }
            }
        }

        function fireEclipseRing(count, speed, gapAngle, gapWidth, config = {}) {
            const safeCount = Math.max(8, count | 0);
            const offset = config.angleOffset || 0;
            for (let i = 0; i < safeCount; i++) {
                const angle = offset + (i / safeCount) * Math.PI * 2;
                let delta = Math.atan2(Math.sin(angle - gapAngle), Math.cos(angle - gapAngle));
                if (Math.abs(delta) < gapWidth) continue;
                pushEclipseProjectile({
                    x: config.x ?? boss.x,
                    y: config.y ?? boss.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    speed,
                    turnRate: config.turnRate || 0,
                    char: config.char || '◌',
                    color: config.color || getEclipseStageColor(boss.stage),
                    voidBulletSize: config.voidBulletSize || 24
                });
            }
        }

        function fireEclipseCurtain(gapCenterX, config = {}) {
            const columns = config.columns || 13;
            const speed = config.speed || 230;
            const gapWidth = config.gapWidth || 1;
            const normalizedGap = Math.max(0, Math.min(columns - 1, Math.round((gapCenterX / Math.max(1, width)) * (columns - 1))));
            const gapStart = Math.max(0, normalizedGap - gapWidth);
            const gapEnd = Math.min(columns - 1, normalizedGap + gapWidth);
            for (let i = 0; i < columns; i++) {
                if (i >= gapStart && i <= gapEnd) continue;
                const bulletX = ((i + 0.5) / columns) * width;
                pushEclipseProjectile({
                    x: bulletX,
                    y: config.y ?? -24,
                    vx: config.vx || 0,
                    vy: speed,
                    speed,
                    char: config.char || '╎',
                    color: config.color || getEclipseStageColor(boss.stage),
                    voidBulletSize: config.voidBulletSize || 22,
                    isLatticeShot: !!config.waveAmp,
                    baseX: bulletX,
                    waveAmp: config.waveAmp || 0,
                    waveFreq: config.waveFreq || 3.5,
                    wavePhase: i * 0.33 + (config.phaseOffset || 0),
                    waveTime: 0
                });
            }
        }

        function fireEclipseAimedFan(originX, originY, count, spread, speed, config = {}) {
            const baseAngle = Math.atan2(player.y - originY, player.x - originX);
            const safeCount = Math.max(1, count | 0);
            for (let i = 0; i < safeCount; i++) {
                const t = safeCount === 1 ? 0.5 : i / (safeCount - 1);
                const angle = baseAngle + (t - 0.5) * spread;
                pushEclipseProjectile({
                    x: originX,
                    y: originY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    speed,
                    char: config.char || '◇',
                    color: config.color || getEclipseStageColor(boss.stage),
                    voidBulletSize: config.voidBulletSize || 23,
                    turnRate: config.turnRate || 0
                });
            }
        }

        function fireEclipseStagePattern(dt) {
            if (!boss || boss.phase !== 'ACTIVE') return;
            const now = typeof hostileTimeMs === 'number' ? hostileTimeMs : (currentFrameNow || 0);
            const stage = boss.stage || 1;
            const color = getEclipseStageColor(stage);
            const accent = getEclipseStageAccent(stage);
            const gapAngle = Math.atan2(player.y - boss.y, player.x - boss.x);

            if (stage === 1) {
                if (boss.attackPattern === 0 && now - boss.lastFire > 920) {
                    fireEclipseCurtain(player.x + Math.sin(boss.driftTimer * 1.4) * 42, {
                        columns: 13,
                        gapWidth: 1,
                        speed: 220,
                        waveAmp: 18,
                        waveFreq: 3.2,
                        char: '╎',
                        color,
                        phaseOffset: boss.eclipseRingAngle || 0
                    });
                    boss.lastFire = now;
                } else if (boss.attackPattern === 1 && now - boss.lastFire > 860) {
                    boss.eclipseRingAngle = (boss.eclipseRingAngle || 0) + 0.24;
                    fireEclipseRing(14, 220, gapAngle, 0.34, {
                        angleOffset: boss.eclipseRingAngle,
                        char: '◌',
                        color: accent,
                        voidBulletSize: 23
                    });
                    boss.lastFire = now;
                }
            } else if (stage === 2) {
                if (boss.attackPattern === 0 && now - boss.lastFire > 560) {
                    boss.eclipseRingAngle = (boss.eclipseRingAngle || 0) + 0.34;
                    for (let side = -1; side <= 1; side += 2) {
                        const angle = boss.eclipseRingAngle + (side < 0 ? Math.PI : 0);
                        const originX = boss.x + Math.cos(angle) * 82;
                        const originY = boss.y + 12 + Math.sin(angle) * 34;
                        fireEclipseAimedFan(originX, originY, 3, 0.38, 240, {
                            char: side < 0 ? '◇' : '◆',
                            color: side < 0 ? color : accent,
                            voidBulletSize: 23
                        });
                    }
                    boss.lastFire = now;
                } else if (boss.attackPattern === 1 && now - boss.lastFire > 720) {
                    boss.eclipseMazeFlip = !boss.eclipseMazeFlip;
                    fireEclipseCurtain(boss.eclipseMazeFlip ? player.x - width * 0.14 : player.x + width * 0.14, {
                        columns: 15,
                        gapWidth: 1,
                        speed: 238,
                        waveAmp: 24,
                        waveFreq: 4.0,
                        char: '╏',
                        color
                    });
                    const sideX = boss.eclipseMazeFlip ? -24 : width + 24;
                    const dir = boss.eclipseMazeFlip ? 1 : -1;
                    for (let i = 0; i < 4; i++) {
                        pushEclipseProjectile({
                            x: sideX,
                            y: height * (0.22 + i * 0.095),
                            vx: dir * 205,
                            vy: 52 + i * 12,
                            speed: 220,
                            char: '═',
                            color: accent,
                            voidBulletSize: 21
                        });
                    }
                    boss.lastFire = now;
                }
            } else {
                if (boss.attackPattern === 0 && now - boss.lastFire > 640) {
                    boss.eclipseRingAngle = (boss.eclipseRingAngle || 0) + 0.31;
                    fireEclipseRing(18, 245, gapAngle, 0.29, {
                        angleOffset: boss.eclipseRingAngle,
                        char: '◍',
                        color,
                        voidBulletSize: 25,
                        turnRate: 0.16
                    });
                    boss.lastFire = now;
                } else if (boss.attackPattern === 1 && now - boss.lastFire > 520) {
                    boss.eclipseMazeFlip = !boss.eclipseMazeFlip;
                    const originY = boss.y + 18;
                    fireEclipseAimedFan(boss.x - 72, originY, 2, 0.24, 258, {
                        char: '✦',
                        color,
                        voidBulletSize: 24,
                        turnRate: boss.eclipseMazeFlip ? 0.12 : -0.12
                    });
                    fireEclipseAimedFan(boss.x + 72, originY, 2, 0.24, 258, {
                        char: '✦',
                        color: accent,
                        voidBulletSize: 24,
                        turnRate: boss.eclipseMazeFlip ? -0.12 : 0.12
                    });
                    if ((boss.eclipseConstellationStep = ((boss.eclipseConstellationStep || 0) + 1) % 3) === 0) {
                        fireEclipseCurtain(player.x, {
                            columns: 17,
                            gapWidth: 2,
                            speed: 250,
                            waveAmp: 14,
                            waveFreq: 4.4,
                            char: '╎',
                            color: '#ffffff'
                        });
                    }
                    boss.lastFire = now;
                }
            }
        }

        function updateEclipseWardenBoss(dt) {
            if (!boss || !boss.isEclipseWarden) return false;

            if (boss.phase === 'INTRO') {
                const introDuration = 4.4;
                const nextTimer = Math.min(introDuration, boss.timer + dt);
                const progress = Math.max(0, Math.min(1, nextTimer / introDuration));
                const ease = 1 - Math.pow(1 - progress, 3);
                const sway = Math.sin(nextTimer * 2.8) * (1 - progress) * 18;
                boss.x = boss.introStartX + (boss.introTargetX - boss.introStartX) * ease + sway;
                boss.y = boss.introStartY + (boss.introTargetY - boss.introStartY) * ease;
                boss.color = getEclipseStageColor(1);
                boss.timer = nextTimer;
                if (boss.timer >= introDuration) {
                    boss.x = boss.introTargetX;
                    boss.y = boss.introTargetY;
                    boss.startX = boss.x;
                    boss.startY = boss.y;
                    boss.phase = 'ACTIVE';
                    boss.timer = 0;
                    boss.driftTimer = 0;
                    boss.eclipseSealCycle = 0;
                    closeEclipseDamageWindow();
                }
                return false;
            }

            boss.driftTimer = (boss.driftTimer || 0) + dt;
            boss.timer += dt;
            boss.color = getEclipseStageColor(boss.stage || 1);
            boss.x = boss.startX + Math.sin(boss.driftTimer * (0.34 + boss.stage * 0.05)) * (76 + boss.stage * 14);
            boss.y = boss.startY + Math.sin(boss.driftTimer * 0.9 + 0.35) * 15;
            boss.eclipseRingAngle = (boss.eclipseRingAngle || 0) + dt * (0.28 + boss.stage * 0.08);
            applyWakeForce(boss.x, boss.y, 220, 6);

            if (boss.eclipseTransitionTimer > 0) boss.eclipseTransitionTimer = Math.max(0, boss.eclipseTransitionTimer - dt);

            if (maybeTriggerBossDeathCinematic(boss)) return true;
            if (boss.eclipseTransitionTimer <= 0) {
                if ((boss.stage || 1) < 2 && boss.hp <= boss.maxHp * 0.67) {
                    transitionEclipseStage(2);
                } else if ((boss.stage || 1) < 3 && boss.hp <= boss.maxHp * 0.34) {
                    transitionEclipseStage(3);
                }
            }

            updateEclipseSeals(dt);

            if (boss.eclipseShielded && countActiveEclipseSeals() === 0) {
                openEclipseDamageWindow();
            } else if (!boss.eclipseShielded) {
                boss.eclipseOpenTimer -= dt;
                if (boss.eclipseOpenTimer <= 0) closeEclipseDamageWindow();
            }

            const patternDuration = boss.eclipseShielded ? (5.4 - boss.stage * 0.22) : (4.35 - boss.stage * 0.12);
            if (boss.timer > patternDuration) {
                boss.timer = 0;
                boss.attackPattern = (boss.attackPattern + 1) % 2;
                boss.lastFire = 0;
            }

            if (boss.eclipseTransitionTimer <= 0) fireEclipseStagePattern(dt);
            return false;
        }

        function drawEclipseWardenBoss(renderNow, bossRenderEntries) {
            const renderScale = boss.renderScale || 0.92;
            const renderBossX = snapSpriteCoord(boss.x);
            const renderBossY = snapSpriteCoord(boss.y);
            const sprite = boss.sprite || [];
            if (sprite.length === 0) return;
            const stage = boss.stage || 1;
            const stageColor = getEclipseStageColor(stage);
            const accentColor = getEclipseStageAccent(stage);
            const bodyFlash = boss.flashTimer > 0;
            const pulse = 0.82 + Math.sin(renderNow * 0.004 + (boss.driftTimer || 0)) * 0.12;
            const bSX = -(sprite[0].length * charW) / 2;
            const bSY = -(sprite.length * charH) / 2;

            ctx.save();
            ctx.translate(renderBossX, renderBossY);
            ctx.scale(renderScale, renderScale);
            ctx.font = `bold 20px Courier New`;
            ctx.globalAlpha = boss.phase === 'INTRO' ? 0.62 + pulse * 0.28 : 1;
            if (glowEnabled && boss.phase === 'ACTIVE') {
                ctx.shadowColor = boss.eclipseShielded ? stageColor : '#ffffff';
                ctx.shadowBlur = boss.eclipseShielded ? 18 : 12;
            }

            for (let r = 0; r < sprite.length; r++) {
                for (let c = 0; c < sprite[r].length; c++) {
                    const char = sprite[r][c];
                    if (char === ' ') continue;
                    let glyphColor = '#d8e8ff';
                    if (bodyFlash) glyphColor = '#ffffff';
                    else if (char === '●') glyphColor = boss.eclipseShielded ? '#050610' : '#ffffff';
                    else if (char === '◉' || char === '◌') glyphColor = boss.eclipseShielded ? stageColor : '#ffffff';
                    else if (char === '◇' || char === '◜' || char === '◝' || char === '◟' || char === '◞') glyphColor = accentColor;
                    else if (char === '▒' || char === '▓') glyphColor = stage === 2 ? '#ffeeb0' : (stage === 3 ? '#ffc2fb' : '#b7f7ff');
                    else if (char === '█') glyphColor = stage === 2 ? '#ffd36a' : (stage === 3 ? '#bfa4ff' : '#8ddfff');
                    ctx.fillStyle = glyphColor;
                    const localX = bSX + c * charW;
                    const localY = bSY + r * charH;
                    ctx.fillText(char, localX | 0, localY | 0);
                    recordBossRenderGlyph(
                        bossRenderEntries,
                        char,
                        (renderBossX + localX * renderScale) | 0,
                        (renderBossY + localY * renderScale) | 0,
                        glyphColor,
                        renderScale
                    );
                }
            }
            ctx.restore();
            ctx.shadowBlur = 0;

            if (boss.phase === 'ACTIVE') {
                ctx.save();
                const shieldPulse = 0.5 + Math.sin(renderNow * 0.007) * 0.14;
                if (boss.eclipseShielded) {
                    ctx.globalAlpha = shieldPulse;
                    ctx.strokeStyle = stageColor;
                    ctx.lineWidth = 2;
                    if (glowEnabled) {
                        ctx.shadowColor = stageColor;
                        ctx.shadowBlur = 16;
                    }
                    ctx.beginPath();
                    ctx.ellipse(boss.x | 0, (boss.y + 6) | 0, 150 + stage * 12, 84 + stage * 8, 0, 0, Math.PI * 2);
                    ctx.stroke();
                } else {
                    const ratio = Math.max(0, Math.min(1, boss.eclipseOpenTimer / Math.max(0.01, 5.9 - stage * 0.42)));
                    ctx.globalAlpha = 0.22 + ratio * 0.22;
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    if (glowEnabled) {
                        ctx.shadowColor = stageColor;
                        ctx.shadowBlur = 14;
                    }
                    ctx.beginPath();
                    ctx.arc(boss.x | 0, boss.y | 0, 44 + Math.sin(renderNow * 0.011) * 4, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
                ctx.shadowBlur = 0;

                const lockText = boss.eclipseShielded ? `LOCK ${countActiveEclipseSeals()}` : 'OPEN';
                drawBossHealthBar(boss, {
                    color: stageColor,
                    labelColor: boss.eclipseShielded ? stageColor : '#ffffff',
                    label: `${boss.name}  ${lockText}`,
                    ratio: Math.max(0, boss.hp / boss.maxHp)
                });
            }
        }
