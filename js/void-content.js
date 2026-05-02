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

            const bossNow = currentFrameNow;
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
                const { barW, barH, barX, barY, nameY } = getBossBarLayout();
                ctx.strokeStyle = '#ffffff';
                ctx.strokeRect(barX | 0, barY | 0, barW, barH);
                ctx.fillStyle = '#7d71ff';
                ctx.fillRect((barX + 2) | 0, (barY + 2) | 0, (barW - 4) * (boss.hp / boss.maxHp), barH - 4);
                ctx.fillStyle = '#e2e6ff';
                ctx.font = `bold 16px Courier New`;
                ctx.fillText(boss.name, (width / 2) | 0, nameY | 0);
            }
        }

        const ECLIPSE_STAGE_COLORS = ['#c8f4ff', '#ffe27a', '#ff8df4'];
        const ECLIPSE_STAGE_ACCENTS = ['#83e8ff', '#ffb84c', '#a989ff'];
        const ECLIPSE_BULLET_SOFT_CAP = 260;

        function isEclipseWardenShielded(target = boss) {
            return !!(target && target.isEclipseWarden && target.eclipseShielded);
        }

        function isBossDamageShielded(target = boss) {
            return !!(target && ((target.isBattleStarship && target.isShielded) || isEclipseWardenShielded(target)));
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
            const angleOffset = (boss.eclipseSealCycle || 0) * 0.42 + ((currentFrameNow || 0) * 0.0006);
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
            const now = currentFrameNow || 0;
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

                const { barW, barH, barX, barY, nameY } = getBossBarLayout();
                ctx.strokeStyle = '#ffffff';
                ctx.strokeRect(barX | 0, barY | 0, barW, barH);
                ctx.fillStyle = stageColor;
                ctx.fillRect((barX + 2) | 0, (barY + 2) | 0, (barW - 4) * Math.max(0, boss.hp / boss.maxHp), barH - 4);
                ctx.fillStyle = boss.eclipseShielded ? stageColor : '#ffffff';
                ctx.font = `bold 16px Courier New`;
                const lockText = boss.eclipseShielded ? `LOCK ${countActiveEclipseSeals()}` : 'OPEN';
                ctx.fillText(`${boss.name}  ${lockText}`, (width / 2) | 0, nameY | 0);
            }
        }
