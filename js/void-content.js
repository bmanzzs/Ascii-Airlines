        // Black Void and late-game void helpers. Loaded after sprites.js and before waves.js.

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
                fireVoidAimedFan(enemy.x, enemy.y + 10, player.x, player.y, 5, 0.9, 235, {
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
                fireVoidAimedFan(enemy.x, enemy.y + 12, player.x, player.y, 6, 1.05, 255, {
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
                const glitchIntroDuration = 4;
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
