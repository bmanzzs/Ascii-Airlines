        function getComboProjectileHitboxRadius(p) {
            const stats = p.stats || {};
            const sizeMult = stats.sizeMult || 1;
            const hitboxMult = stats.hitboxMult || 1;
            const growth = stats.plasmaCloud ? getPlasmaCloudGrowthFactor(p) : 1;
            let radius = 20 * sizeMult * hitboxMult * growth;
            if (stats.plasmaCloud) radius = Math.max(8, 26 * sizeMult * hitboxMult * growth);
            if (stats.miniTorpedo) radius = Math.max(12, radius);
            if (stats.pathFunction === 'parabolic') radius *= 1.5;
            return radius;
        }

        function emitProjectileImpactDebris(p, count = null) {
            const stats = p.stats || {};
            const impactDebrisCount = count ?? (stats.lightningBall ? 2 : 6 + Math.floor(Math.random() * 3));
            for (let k = 0; k < impactDebrisCount; k++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 60 + Math.random() * 40;
                debris.push({
                    x: p.x,
                    y: p.y,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    char: IMPACT_DEBRIS_CHARS[Math.floor(Math.random() * IMPACT_DEBRIS_CHARS.length)],
                    color: IMPACT_DEBRIS_COLORS[Math.floor(Math.random() * IMPACT_DEBRIS_COLORS.length)],
                    life: 0.2,
                    isImpact: true
                });
            }
        }

        function triggerProjectileChain(p, e) {
            const stats = p.stats || {};
            if ((stats.chainCount || 0) <= 0 || Math.random() >= (stats.chainChance ?? 1)) return;
            let nearest = null;
            let minDist = Infinity;
            for (let otherIndex = 0; otherIndex < enemies.length; otherIndex++) {
                const other = enemies[otherIndex];
                if (other === e) continue;
                if (!isEnemyDamageable(other)) continue;
                let distSq = (other.x - e.x)**2 + (other.y - e.y)**2;
                if (distSq < 150*150 && distSq < minDist) {
                    minDist = distSq;
                    nearest = other;
                }
            }
            if (!nearest) return;
            comboProjectiles.push({
                x: e.x, y: e.y,
                vx: (nearest.x - e.x) * 5, vy: (nearest.y - e.y) * 5,
                baseVx: (nearest.x - e.x) * 5, baseVy: (nearest.y - e.y) * 5,
                startX: e.x, startY: e.y,
                targetX: nearest.x, targetY: nearest.y,
                sprite: '', color: '#8ff7ff',
                stats: { ...stats, chainCount: stats.chainCount - 1, splashRadius: 0, lightningBall: false, plasmaCloud: false, miniTorpedo: false },
                life: 0.42, maxLife: 0.42, damage: p.damage * 0.5,
                pierceHits: [e], pierceCount: 0,
                isChainLightning: true,
                jitterSeed: Math.random() * 1000
            });
        }

        function triggerProjectileSplash(p) {
            const stats = p.stats || {};
            if ((stats.splashRadius || 0) <= 0) return;
            radialExplosion(p.x, p.y, stats.splashRadius * 22, p.damage * stats.splashDamagePercent, stats.splashVisualDebris ?? 20);
        }

        const ELEMENTAL_TRAIL_SOFT_CAP = 210;
        const ELEMENTAL_TRAIL_HARD_CAP = 300;
        const GHOST_SIGNAL_STAGE_TWO_TRANSITION_DURATION = 1.3;

        function emitElementalBulletTrail(b, dt, isWraith = false) {
            if (gameState !== 'PLAYING') return;
            if (thrusterParticles.length > ELEMENTAL_TRAIL_HARD_CAP) return;

            b.trailTimer = (b.trailTimer || 0) + dt;
            const interval = thrusterParticles.length > ELEMENTAL_TRAIL_SOFT_CAP ? 0.085 : 0.052;
            if (b.trailTimer < interval) return;
            b.trailTimer %= interval;

            const speed = Math.max(1, Math.hypot(b.vx || 0, b.vy || 0));
            const backX = -(b.vx || 0) / speed;
            const backY = -(b.vy || 0) / speed;
            thrusterParticles.push({
                x: b.x + backX * 7 + (Math.random() - 0.5) * 8,
                y: b.y + backY * 7 + (Math.random() - 0.5) * 8,
                vx: backX * (24 + Math.random() * 28) + (Math.random() - 0.5) * 22,
                vy: backY * (24 + Math.random() * 28) + (Math.random() - 0.5) * 22,
                char: ELEMENTAL_TRAIL_CHARS[Math.floor(Math.random() * ELEMENTAL_TRAIL_CHARS.length)],
                color: null,
                life: 0.56,
                isGuardianFlame: !isWraith,
                isWraithFlame: isWraith
            });
        }

        function smoothStageEase(t) {
            const clamped = Math.max(0, Math.min(1, t));
            return clamped * clamped * (3 - 2 * clamped);
        }

        function getAngleDelta(target, current) {
            let delta = target - current;
            while (delta > Math.PI) delta -= Math.PI * 2;
            while (delta < -Math.PI) delta += Math.PI * 2;
            return delta;
        }

        function dissolveEnemyBulletsForBossTransition(color = '#ffffff') {
            const originalBulletCount = enemyBullets.length;
            const retainedBullets = [];
            const dissolveCap = Math.min(50, originalBulletCount);
            const sparkEvery = Math.max(1, Math.ceil(originalBulletCount / 20));

            for (let i = 0; i < originalBulletCount; i++) {
                const b = enemyBullets[i];
                if (i < dissolveCap && typeof markBossBulletForDissolve === 'function') {
                    markBossBulletForDissolve(b, i);
                    b.bossClearColor = color;
                    retainedBullets.push(b);
                }
                if (i < 24 || i % sparkEvery === 0) {
                    debris.push({
                        x: b.x,
                        y: b.y,
                        vx: (Math.random() - 0.5) * 90,
                        vy: (Math.random() - 0.5) * 90,
                        char: ['✦', '*', '·'][i % 3],
                        color,
                        life: 0.16 + Math.random() * 0.18,
                        isImpact: true
                    });
                }
            }

            enemyBullets = retainedBullets;
            comboProjectiles = [];
            bombProjectiles = [];
            if (originalBulletCount > 0) addShake(4);
        }

        function updateDissolvingBossBullets(dt) {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i];
                if (!b.isDyingBullet) {
                    enemyBullets.splice(i, 1);
                    continue;
                }
                const startedAt = b.bossClearStart || currentFrameNow || performance.now();
                const elapsed = ((currentFrameNow || performance.now()) - startedAt) / 1000;
                if (elapsed >= (b.bossClearDuration || 0.5)) {
                    enemyBullets.splice(i, 1);
                    continue;
                }
                b.x += (b.vx || 0) * dt;
                b.y += (b.vy || 0) * dt;
                const damp = Math.pow(0.04, dt);
                b.vx = (b.vx || 0) * damp;
                b.vy = (b.vy || 0) * damp;
            }
        }

        function ensureGhostSignalStageTwoWraiths() {
            const wraiths = enemies.filter(e => e && e.isWraith && e.bossMinionOwner === 'GHOST SIGNAL');
            while (wraiths.length < 2) {
                const index = wraiths.length;
                const fromLeft = index === 0;
                const wraith = createGhostSignalWraith(
                    boss.x + (fromLeft ? -80 : 80),
                    boss.y + 20,
                    0,
                    width * (fromLeft ? 0.27 : 0.73)
                );
                wraith.isBossMinion = true;
                wraith.bossMinionOwner = 'GHOST SIGNAL';
                enemies.push(wraith);
                wraiths.push(wraith);
            }
            return wraiths.slice(0, 2);
        }

        function beginGhostSignalStageTwoTransition() {
            if (!boss || boss.name !== 'GHOST SIGNAL' || boss.stageTwoStarted) return false;
            boss.stageTwoStarted = true;
            boss.stage = 2;
            boss.phase = 'STAGE_TRANSITION';
            boss.stageTransitionTimer = 0;
            boss.stageTransitionDuration = GHOST_SIGNAL_STAGE_TWO_TRANSITION_DURATION;
            boss.stageTransitionStartX = boss.x;
            boss.stageTransitionStartY = boss.y;
            boss.stageTransitionTargetX = width * 0.5;
            boss.stageTransitionTargetY = height * 0.135;
            boss.isVulnerable = false;
            boss.attackPattern = 0;
            boss.lastFire = 0;
            boss.timer = 0;
            boss.signalPulseComboCount = 0;
            boss.signalPulseComboDelay = 0;
            boss.signalComboCooldownUntil = 0;
            dissolveEnemyBulletsForBossTransition('#c8ffff');

            const wraiths = ensureGhostSignalStageTwoWraiths();
            for (let i = 0; i < wraiths.length; i++) {
                const wraith = wraiths[i];
                const targetX = width * (i === 0 ? 0.27 : 0.73);
                const targetY = height * (0.52 + i * 0.035);
                wraith.stageTransitionMove = {
                    startX: wraith.x,
                    startY: wraith.y,
                    targetX,
                    targetY,
                    phase: i * Math.PI
                };
                wraith.hoverX = targetX;
                wraith.hoverY = targetY;
                wraith.fireTimer = -0.7 - i * 0.35;
            }

            addShake(8);
            return true;
        }

        function updateGhostSignalStageTransition(dt) {
            if (!boss || boss.name !== 'GHOST SIGNAL' || boss.phase !== 'STAGE_TRANSITION') return false;
            boss.stageTransitionTimer += dt;
            const duration = boss.stageTransitionDuration || GHOST_SIGNAL_STAGE_TWO_TRANSITION_DURATION;
            const t = Math.min(1, boss.stageTransitionTimer / duration);
            const eased = smoothStageEase(t);
            const ghostDrift = Math.sin(t * Math.PI * 2) * (1 - t) * 9;

            boss.x = boss.stageTransitionStartX + (boss.stageTransitionTargetX - boss.stageTransitionStartX) * eased + ghostDrift;
            boss.y = boss.stageTransitionStartY + (boss.stageTransitionTargetY - boss.stageTransitionStartY) * eased + Math.sin(t * Math.PI) * -8;
            boss.flashTimer = Math.max(boss.flashTimer || 0, 0.05);

            for (const e of enemies) {
                if (!e || !e.isWraith || !e.stageTransitionMove) continue;
                const move = e.stageTransitionMove;
                const spectralSway = Math.sin(t * Math.PI * 2 + move.phase) * (1 - t) * 14;
                e.x = move.startX + (move.targetX - move.startX) * eased + spectralSway;
                e.y = move.startY + (move.targetY - move.startY) * eased + Math.cos(t * Math.PI * 2 + move.phase) * (1 - t) * 5;
                e.hoverTimer = (e.hoverTimer || 0) + dt;
                e.onScreen = true;
            }

            updateDissolvingBossBullets(dt);

            for (let i = debris.length - 1; i >= 0; i--) {
                const d = debris[i];
                d.x += d.vx * dt;
                d.y += d.vy * dt;
                d.vx *= 0.96;
                d.vy *= 0.96;
                d.life -= dt * 1.4;
                if (d.life <= 0) debris.splice(i, 1);
            }

            shake *= 0.88;
            if (t >= 1) {
                boss.phase = 'ACTIVE';
                boss.isVulnerable = true;
                boss.startX = boss.x;
                boss.startY = boss.y;
                boss.timer = 0;
                boss.lastFire = 0;
                boss.attackPattern = 0;
                boss.driftTimer = 0;
                for (const e of enemies) {
                    if (e && e.stageTransitionMove) delete e.stageTransitionMove;
                }
            }
            return true;
        }

        function pushGhostSignalBullet(config) {
            enemyBullets.push({
                x: config.x ?? boss.x,
                y: config.y ?? boss.y,
                vx: config.vx || 0,
                vy: config.vy || 0,
                char: config.char || '◌',
                color: config.color || '#00ffff',
                isSignalPulse: true,
                signalBulletType: config.type || 'pulse',
                isSignalYBullet: !!config.isSignalYBullet,
                isZigZag: !!config.isZigZag,
                baseVx: config.baseVx,
                baseVy: config.baseVy,
                zigTimer: config.zigTimer || 0,
                zigDir: config.zigDir || 1,
                zigInterval: config.zigInterval,
                zigAmplitude: config.zigAmplitude,
                isWraithBolt: !!config.isWraithBolt,
                isLargeWraith: !!config.isLargeWraith,
                isSignalStormOrb: !!config.isSignalStormOrb,
                speed: config.speed,
                maxSpeed: config.maxSpeed,
                accel: config.accel,
                homingTurn: config.homingTurn,
                age: 0,
                hitboxScale: config.hitboxScale || 1
            });
        }

        function fireGhostSignalStageOneCompositePulse(pulseIndex = 0) {
            const originX = boss.x;
            const originY = boss.y;
            const aim = Math.atan2(player.y - originY, player.x - originX);
            const ringCount = 12;
            const ringOffset = pulseIndex * 0.18;
            for (let i = 0; i < ringCount; i++) {
                const a = ringOffset + (i / ringCount) * Math.PI * 2;
                pushGhostSignalBullet({
                    x: originX,
                    y: originY,
                    vx: Math.cos(a) * 330,
                    vy: Math.sin(a) * 330,
                    type: 'pulse',
                    color: '#9cfbff'
                });
            }
            for (let i = -2; i <= 2; i += 2) {
                const a = aim + i * 0.13;
                pushGhostSignalBullet({
                    x: originX,
                    y: originY,
                    vx: Math.cos(a) * 520,
                    vy: Math.sin(a) * 520,
                    type: 'pulse',
                    color: '#d8fbff'
                });
            }
            for (let i = -1; i <= 1; i++) {
                const a = aim + i * 0.24 + (pulseIndex - 1) * 0.05;
                const speed = 360;
                pushGhostSignalBullet({
                    x: originX,
                    y: originY,
                    vx: Math.cos(a) * speed,
                    vy: Math.sin(a) * speed,
                    baseVx: Math.cos(a) * speed,
                    baseVy: Math.sin(a) * speed,
                    char: 'z',
                    type: 'zigzag',
                    color: '#00ffff',
                    isZigZag: true,
                    zigDir: i % 2 === 0 ? 1 : -1
                });
            }
            for (let i = 0; i < 2; i++) {
                const a = aim + (i === 0 ? -0.08 : 0.08);
                const speed = 430;
                pushGhostSignalBullet({
                    x: originX,
                    y: originY,
                    vx: Math.cos(a) * speed,
                    vy: Math.sin(a) * speed,
                    baseVx: Math.cos(a) * speed,
                    baseVy: Math.sin(a) * speed,
                    char: 'Y',
                    type: 'fork',
                    color: '#ffd400',
                    isZigZag: true,
                    isSignalYBullet: true,
                    zigDir: i === 0 ? -1 : 1,
                    zigInterval: 0.26,
                    zigAmplitude: 250
                });
            }
        }

        function updateGhostSignalStageTwoAttacks(bossNow, dt) {
            const pattern = boss.attackPattern % 3;
            if (pattern === 0 && bossNow - boss.lastFire > 900) {
                const aim = Math.atan2(player.y - boss.y, player.x - boss.x);
                const speed = 170;
                pushGhostSignalBullet({
                    x: boss.x,
                    y: boss.y + 8,
                    vx: Math.cos(aim) * speed,
                    vy: Math.sin(aim) * speed,
                    char: '◎',
                    type: 'stormOrb',
                    color: '#76f6ff',
                    isSignalStormOrb: true,
                    speed,
                    maxSpeed: 455,
                    accel: 155,
                    homingTurn: 1.15,
                    hitboxScale: 1.35
                });
                boss.lastFire = bossNow;
            } else if (pattern === 1 && bossNow - boss.lastFire > 780) {
                const aim = Math.atan2(player.y - boss.y, player.x - boss.x);
                for (let i = -1; i <= 1; i++) {
                    const a = aim + i * 0.14;
                    const speed = 345;
                    pushGhostSignalBullet({
                        x: boss.x,
                        y: boss.y + 16,
                        vx: Math.cos(a) * speed,
                        vy: Math.sin(a) * speed,
                        char: '✦',
                        type: 'wraithLarge',
                        color: '#f4f7fb',
                        isWraithBolt: true,
                        isLargeWraith: true,
                        hitboxScale: 1.55
                    });
                }
                boss.lastFire = bossNow;
            } else if (pattern === 2) {
                if (boss.signalComboCooldownUntil && bossNow < boss.signalComboCooldownUntil) return;
                boss.signalPulseComboDelay = (boss.signalPulseComboDelay || 0) - dt;
                if ((boss.signalPulseComboCount || 0) <= 0) {
                    boss.signalPulseComboCount = 3;
                    boss.signalPulseComboDelay = 0;
                }
                if (boss.signalPulseComboCount > 0 && boss.signalPulseComboDelay <= 0) {
                    const firedIndex = 3 - boss.signalPulseComboCount;
                    fireGhostSignalStageOneCompositePulse(firedIndex);
                    boss.signalPulseComboCount--;
                    boss.signalPulseComboDelay = 0.34;
                    if (boss.signalPulseComboCount <= 0) {
                        boss.signalComboCooldownUntil = bossNow + 1300;
                        boss.lastFire = bossNow;
                    }
                }
            }
        }

        function beginFirewallStageTwo() {
            if (!boss || boss.name !== 'OVERHEATING FIREWALL' || boss.stageTwoStarted) return false;
            boss.stageTwoStarted = true;
            boss.stage = 2;
            boss.color = '#ffdd66';
            boss.attackPattern = 0;
            boss.timer = 0;
            boss.lastFire = 0;
            boss.coreTimer = 0.2;
            boss.firestormAngle = 0;
            boss.firewallCurtainFlip = false;
            dissolveEnemyBulletsForBossTransition('#ffb347');

            let guardians = enemies.filter(e => e && e.isFlameGuardian && e.bossMinionOwner === 'OVERHEATING FIREWALL');
            while (guardians.length < 2) {
                const guardian = createFirewallGuardianMinion();
                enemies.push(guardian);
                guardians.push(guardian);
            }
            for (let i = 0; i < guardians.length; i++) {
                const guardian = guardians[i];
                guardian.hoverX = width * (i === 0 ? 0.27 : 0.73);
                guardian.hoverY = height * 0.18;
                guardian.hoverAmpX = 42;
                guardian.hoverAmpY = 18;
                guardian.flameFireInterval = 2.35;
                guardian.flameShotSpeed = 275;
                guardian.fireTimer = -0.7 - i * 0.45;
                guardian.hp = Math.max(guardian.hp || 0, 190);
                guardian.maxHp = Math.max(guardian.maxHp || 0, 260);
            }

            for (let i = 0; i < 34 && debris.length < 360; i++) {
                const a = Math.random() * Math.PI * 2;
                const d = 30 + Math.random() * 95;
                debris.push({
                    x: boss.x + Math.cos(a) * d,
                    y: boss.y + FIREWALL_BOSS_CORE_OFFSET_Y + Math.sin(a) * d,
                    vx: Math.cos(a) * (80 + Math.random() * 130),
                    vy: Math.sin(a) * (80 + Math.random() * 130),
                    char: ['✦', '*', '·', '░'][i % 4],
                    color: ['#ffdd66', '#ff8a18', '#e01926'][i % 3],
                    life: 0.32 + Math.random() * 0.32,
                    isImpact: true
                });
            }
            addShake(14);
            return true;
        }

        // Main simulation update loop.
        function updatePhysics(dt) {
            if (window.innerHeight < 700 || window.innerWidth < 525) return;
            if (gameState === 'LEVELUP') return;

            if (gameState === 'START') {
                if (titleAlpha < 1.0) {
                    titleAlpha = Math.min(1.0, titleAlpha + dt * 0.75);
                    if (autoLaunch && titleAlpha >= 1.0) {
                        gameState = 'LAUNCHING';
                        launchTimer = 0;
                        player.x = width / 2;
                        player.y = height + 100;
                        startMusic();
                        autoLaunch = false;
                    }
                }
                return;
            }

            if (gameState === 'LAUNCHING') {
                launchTimer += dt;
                let t = Math.min(launchTimer / 1.5, 1.0);
                // Ease out cubic
                let easeT = 1 - Math.pow(1 - t, 3);

                // Background Matrix Physics keeps going
                for (let i = 0; i < numParticles; i++) {
                    fpHY[i] += SCROLL_SPEED * dt;
                    if (fpHY[i] > height + CELL_SIZE) {
                        fpHY[i] -= (height + CELL_SIZE * 2); fpY[i] = fpHY[i]; fpX[i] = fpHX[i];
                    }
                    fpVX[i] += (fpHX[i] - fpX[i]) * SPRING_CONST; fpVY[i] += (fpHY[i] - fpY[i]) * SPRING_CONST;
                    fpVX[i] *= DAMPING; fpVY[i] *= DAMPING;
                    fpX[i] += fpVX[i]; fpY[i] += fpVY[i];
                    
                    fpHighlight[i] *= 0.98;
                }

                const launchTargetY = Math.min(height * 0.8, getGameplayBottomLimit(150));
                player.y = (height + 100) + easeT * (launchTargetY - (height + 100));

                if (Math.random() > 0.3) {
                    const thrusterAnchors = getPlayerThrusterAnchors(getPlayerRenderLayout(player));
                    for (let i = 0; i < thrusterAnchors.length; i++) {
                        const anchor = thrusterAnchors[i];
                        thrusterParticles.push({ 
                            x: anchor.x + (Math.random()-0.5)*5, y: anchor.y, 
                            vx: (Math.random()-0.5)*40, vy: 280 + Math.random()*120, 
                            char: EXHAUST_PARTICLE_CHARS[Math.floor(Math.random()*EXHAUST_PARTICLE_CHARS.length)], 
                            color: null,
                            life: 1.0, isSmoke: false 
                        });
                    }
                }
                
                for (let i = thrusterParticles.length - 1; i >= 0; i--) {
                    const t = thrusterParticles[i]; 
                    t.x += t.vx * dt; t.y += t.vy * dt; 
                    t.life -= dt * (t.isSmoke ? 1.0 : ((t.isGuardianFlame || t.isWraithFlame) ? 2.0 : 2.8));
                    if (!t.isSmoke && !t.isGuardianFlame && !t.isWraithFlame) applyWakeForce(t.x, t.y, 30, 1.4); 
                    if (t.life <= 0) thrusterParticles.splice(i, 1);
                }

                if (t >= 1.0) {
                    gameState = 'PLAYING';
                    restartLoadingSequence = false;
                    player.y = Math.min(height * 0.8, getGameplayBottomLimit(150));
                }
                return;
            }

            if (gameState === 'DYING') {
                deathTimer += dt;
                if (deathTimer > 1.0 && !playerExploded) {
                    playerExploded = true;
                    playPlayerExplosionSFX();
                    const layout = getPlayerRenderLayout(player);
                    forEachPlayerDebrisPiece(layout, piece => {
                        const ox = piece.x - player.x;
                        const oy = piece.y - player.y;
                        debris.push({
                            x: piece.x,
                            y: piece.y,
                            vx: ox * (3 + Math.random() * 4) + (Math.random() - 0.5) * 200,
                            vy: oy * (3 + Math.random() * 4) + (Math.random() - 0.5) * 200,
                            char: piece.char,
                            color: player.color,
                            life: 2.0
                        });
                    });
                    addShake(30);
                }
                if (deathTimer > 3.0 && gameState !== 'GAMEOVER') {
                    gameState = 'GAMEOVER';
                    currentHint = RAGE_HINTS[Math.floor(Math.random() * RAGE_HINTS.length)];
                }
                // Update debris only
                for (let i = debris.length - 1; i >= 0; i--) { 
                    const d = debris[i]; d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= 0.98; d.vy *= 0.98; d.life -= dt * 0.9; 
                    if (d.life <= 0) debris.splice(i, 1); 
                }
                shake *= 0.88;
                if (deathTimer > 1.5) shake = 0;
                return; // Freeze everything else
            }

            if (gameState !== 'PLAYING') return;

            // Background Matrix Physics

            for (let i = 0; i < numParticles; i++) {
                fpHY[i] += SCROLL_SPEED * dt;
                if (fpHY[i] > height + CELL_SIZE) {
                    fpHY[i] -= (height + CELL_SIZE * 2); fpY[i] = fpHY[i]; fpX[i] = fpHX[i];
                }
                fpVX[i] += (fpHX[i] - fpX[i]) * SPRING_CONST; fpVY[i] += (fpHY[i] - fpY[i]) * SPRING_CONST;
                fpVX[i] *= DAMPING; fpVY[i] *= DAMPING;
                fpX[i] += fpVX[i]; fpY[i] += fpVY[i];
                
                fpHighlight[i] *= 0.98;
            }

            if (postResumeBombLockTimer > 0) {
                postResumeBombLockTimer = Math.max(0, postResumeBombLockTimer - dt);
            }

            if (boss && boss.phase === 'STAGE_TRANSITION') {
                if (updateGhostSignalStageTransition(dt)) return;
            }

            // Player Physics & Firing
            let inputX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0), inputY = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
            if (inputX !== 0 && inputY !== 0) { inputX *= 0.707; inputY *= 0.707; }
            
            const playerMoveSpeedScale = getPlayerMoveSpeedScale();
            player.vx = (player.vx + inputX * P_ACCEL * playerMoveSpeedScale * dt) * P_FRICTION;
            player.vy = (player.vy + inputY * P_ACCEL * playerMoveSpeedScale * dt) * P_FRICTION;
            player.x = Math.max(50, Math.min(width - 50, player.x + player.vx * dt));
            player.y = Math.max(50, Math.min(getGameplayBottomLimit(50), player.y + player.vy * dt));
            const playerSpeedRatio = Math.min(1, Math.sqrt(player.vx * player.vx + player.vy * player.vy) / P_MAX_SPEED);
            applyWakeForce(player.x, player.y, 110, playerSpeedRatio * 14);
            const playerLayout = getPlayerRenderLayout(player);

            const momentumFireRate = (player.modifiers.momentumFireRate || 0) * playerSpeedRatio;
            const totalFireRateBonus = player.modifiers.fireRate + momentumFireRate;
            const actualFireRate = getClampedPlayerFireInterval((player.fireRate / player.weaponStats.fireRateMult) / (1 + totalFireRateBonus));
            player.isBeaming = player.weaponStats.mode === 'beam';
            player.isFiring = isPlayerFirePressed();
            const beamDeployFactor = updateBeamDeploy(dt);
            const fireBaseAngle = getPlayerFireAngle();
            const beamBaseAngle = updateBeamAngle(dt, fireBaseAngle);

            if (!player.isBeaming && player.isFiring && currentFrameNow - player.lastFire > actualFireRate) {
                fireCombo(fireBaseAngle);
            }

            if (player.isBeaming && player.isFiring) {
                let s = player.weaponStats;
                let baseDmg = (60 * s.damageMult + player.modifiers.laserDamage * 6) * getPlayerDamageScale() * dt;
                if (player.hp < player.maxHp * 0.5) baseDmg *= (1 + player.modifiers.adrenaline);

                const beamOrigin = getPlayerWeaponOrigin(playerLayout);
                const beamMetrics = getBeamMetrics(s.sizeMult, beamDeployFactor);
                const beamHitLength = beamMetrics.length * BEAM_HIT_LENGTH_MULT;
                const angles = getFirePatternAngles(s, beamBaseAngle, true);
                const beamVisualLoad = angles.length * Math.max(1, s.sizeMult);
                const beamSplashChance = beamVisualLoad >= 16 ? 0.015 : (beamVisualLoad >= 10 ? 0.035 : 0.1);
                const beamSplashDebris = beamVisualLoad >= 10 ? 0 : Math.min(6, s.splashVisualDebris ?? 20);
                const activeBoss = boss && boss.phase === 'ACTIVE' ? boss : null;

                for (let angleIndex = 0; angleIndex < angles.length; angleIndex++) {
                    const a = angles[angleIndex];
                    let dx = Math.cos(a), dy = Math.sin(a);
                    let hitEnemies = [];
                    for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
                        const e = enemies[enemyIndex];
                        if (!isEnemyDamageable(e)) continue;
                        let ex = e.x - beamOrigin.x, ey = e.y - beamOrigin.y;
                        let t = ex * dx + ey * dy;
                        if (t > 0 && t <= beamHitLength) {
                            if (doesBeamHitTargetMask(beamOrigin.x, beamOrigin.y, dx, dy, beamHitLength, beamMetrics.halfWidth, e)) {
                                hitEnemies.push({e, t});
                            }
                        }
                    }
                    if (activeBoss) {
                        const e = activeBoss;
                        let ex = e.x - beamOrigin.x, ey = e.y - beamOrigin.y;
                        let t = ex * dx + ey * dy;
                        if (t > 0 && t <= beamHitLength) {
                            if (doesBeamHitTargetMask(beamOrigin.x, beamOrigin.y, dx, dy, beamHitLength, beamMetrics.halfWidth, e)) {
                                hitEnemies.push({e, t});
                            }
                        }
                    }
                    hitEnemies.sort((A,B) => A.t - B.t);

                    let pierce = s.pierceCount;
                    for (let hit of hitEnemies) {
                        let e = hit.e;
                        let appliedDamage = baseDmg;
                        if (e === boss && isBlackVoidBossActive()) {
                            const beamHitX = beamOrigin.x + hit.t * dx;
                            const beamHitY = beamOrigin.y + hit.t * dy;
                            const damageScale = getBlackVoidDamageScale(beamHitX, beamHitY);
                            appliedDamage *= damageScale;
                            if (damageScale < 1) {
                                boss.beamAbsorbTimer = (boss.beamAbsorbTimer || 0) - dt;
                                if (boss.beamAbsorbTimer <= 0) {
                                    boss.beamAbsorbTimer = 0.14;
                                    absorbBlackVoidProjectile(beamHitX, beamHitY, 1);
                                }
                            }
                        } else if (e === boss && isBossDamageShielded(boss)) {
                            appliedDamage = 0;
                        }
                        e.hp -= appliedDamage;
                        e.flashTimer = 0.15;
                        if (e === boss && maybeTriggerBossDeathCinematic(e)) return;
                        if (s.splashRadius > 0 && Math.random() < beamSplashChance) {
                            radialExplosion(e.x, e.y, s.splashRadius * 22, baseDmg * s.splashDamagePercent * 5, beamSplashDebris);
                            if (bossCinematic && bossCinematic.paused) return;
                        }
                        if (e.hp <= 0 && !e.name) {
                            let idx = enemies.indexOf(e);
                            if (idx > -1) { resolveWaveEnemy(e); explodeEnemy(e); enemies.splice(idx, 1); }
                        }
                        if (pierce-- <= 0) break;
                    }
                }
            }

            if (player.weaponStats.hasOrbitalDrones) {
                for (let i = 0; i < player.drones.length; i++) {
                    const d = player.drones[i];
                    d.angle += 3 * dt;
                    let dx = Math.cos(d.angle) * 45;
                    let dy = Math.sin(d.angle) * 45;
                    d.x = player.x + dx;
                    d.y = player.y + dy;

                    d.timer -= dt;
                    if (d.timer <= 0) {
                        d.timer = Math.max(PLAYER_FIRE_INTERVAL_MIN_MS / 1000 * 1.35, 0.2 / player.weaponStats.fireRateMult / (1 + totalFireRateBonus) * 1.66);
                        const nearestInfo = findNearestActiveTarget(d.x, d.y);
                        const nearest = nearestInfo.target;
                        const minDist = nearestInfo.distSq;
                        if (nearest) {
                            let angle = Math.atan2(nearest.y - d.y, nearest.x - d.x);
                            let speed = 1000;
                            let droneDmg = (10 * player.weaponStats.damageMult + player.modifiers.laserDamage) * getPlayerDamageScale() * 0.3;
                            if (player.hp < player.maxHp * 0.5) droneDmg *= (1 + player.modifiers.adrenaline);
                            comboProjectiles.push({
                                x: d.x, y: d.y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
                                baseVx: Math.cos(angle)*speed, baseVy: Math.sin(angle)*speed, startX: d.x, startY: d.y,
                                sprite: '•', color: '#aa00ff',
                                stats: { ...player.weaponStats, sizeMult: 0.5, pierceCount: 0, splashRadius: 0, chainCount: 0, chainChance: 1, pathFunction: 'straight', homing: false, homingStrength: 1, returning: false, orbitDelay: 0, orbitRadiusMult: 1, orbitReleaseCenter: false, lightningBall: false, splashVisualDebris: 20, hitboxMult: 1, plasmaCloud: false, cloudDotMult: 0, cloudStartScale: 1, cloudEndScale: 1, cloudGrowthDistance: 1, cloudSpeedStartScale: 1, cloudSpeedEndScale: 1, cloudAccelTime: 1, cloudCurveStrength: 0, miniTorpedo: false, torpedoExplosionRadius: 0, torpedoExplosionDamageMult: 0, torpedoRange: 0 },
                                life: 1.0, maxLife: 1.0, damage: droneDmg,
                                pierceHits: [], pierceCount: 0
                            });
                        }
                    }
                }
            }
            
            if (player.bombTimer > 0) player.bombTimer -= dt;
            if (postResumeBombLockTimer <= 0 && keys[' '] && player.bombTimer <= 0) fireBomb();
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

                if (Math.random() > 0.28) {
                    const trailAngle = Math.random() * Math.PI * 2;
                    const trailSpeed = 20 + Math.random() * 70;
                    thrusterParticles.push({
                        x: bomb.x + (Math.random() - 0.5) * 8,
                        y: bomb.y + (Math.random() - 0.5) * 8,
                        vx: Math.cos(trailAngle) * trailSpeed,
                        vy: Math.sin(trailAngle) * trailSpeed,
                        char: ['·', '*', '░'][Math.floor(Math.random() * 3)],
                        color: ['#8ff7ff', '#ffffff', '#aa7dff'][Math.floor(Math.random() * 3)],
                        life: 0.22 + Math.random() * 0.12,
                        isSmoke: true
                    });
                }

                let shouldExplode = bomb.distance >= bomb.maxDistance || bomb.y < -80 || bomb.forceDetonate;
                if (!shouldExplode) {
                    for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
                        const e = enemies[enemyIndex];
                        if (!e.onScreen) continue;
                        if (!isEnemyDamageable(e)) continue;
                        if (doesCircleHitTargetMask(bomb.x, bomb.y, 18, e)) {
                            shouldExplode = true;
                            break;
                        }
                    }
                }

                if (!shouldExplode && boss && boss.phase === 'ACTIVE') {
                    if (boss.name === 'OVERHEATING FIREWALL') {
                        if (boss.isVulnerable) {
                            const dx = bomb.x - boss.x;
                            const dy = bomb.y - (boss.y + FIREWALL_BOSS_CORE_OFFSET_Y);
                            if (dx * dx + dy * dy < 65 * 65) shouldExplode = true;
                        }
                    } else {
                        if (doesCircleHitTargetMask(bomb.x, bomb.y, 18, boss)) shouldExplode = true;
                    }
                }

                if (shouldExplode) {
                    spawnBombExplosion(bomb.x, bomb.y);
                    bombProjectiles.splice(i, 1);
                }
            }
            for (let i = bombBlastRings.length - 1; i >= 0; i--) {
                const ring = bombBlastRings[i];
                ring.life += dt;
                if (ring.life >= ring.maxLife) bombBlastRings.splice(i, 1);
            }
            if (bossCinematic && bossCinematic.paused) return;
            
            if (player.hp < player.maxHp) {
                player.hp = Math.min(player.maxHp, player.hp + player.modifiers.hpRegen * dt);
            }
            if (player.invincibilityTimer > 0) {
                player.invincibilityTimer -= dt;
            }

            if (Math.random() > 0.3) {
                const thrusterAnchors = getPlayerThrusterAnchors(playerLayout);
                for (let i = 0; i < thrusterAnchors.length; i++) {
                    const anchor = thrusterAnchors[i];
                    thrusterParticles.push({ 
                        x: anchor.x + (Math.random()-0.5)*5, y: anchor.y, 
                        vx: (Math.random()-0.5)*40, vy: 280 + Math.random()*120, 
                        char: EXHAUST_PARTICLE_CHARS[Math.floor(Math.random()*EXHAUST_PARTICLE_CHARS.length)], 
                        color: null,
                        life: 1.0, isSmoke: false 
                    });
                }
            }
            if (Math.random() > 0.7) {
                const thrusterAnchors = getPlayerThrusterAnchors(playerLayout);
                for (let i = 0; i < thrusterAnchors.length; i++) {
                    const anchor = thrusterAnchors[i];
                    thrusterParticles.push({
                        x: anchor.x + (Math.random()-0.5)*8, y: anchor.y - 5,
                        vx: (Math.random()-0.5)*80, vy: 150 + Math.random()*50,
                        char: SMOKE_PARTICLE_CHARS[Math.floor(Math.random()*SMOKE_PARTICLE_CHARS.length)],
                        color: SMOKE_PARTICLE_COLORS[Math.floor(Math.random()*SMOKE_PARTICLE_COLORS.length)],
                        life: 0.8, isSmoke: true
                    });
                }
            }

            for (let i = thrusterParticles.length - 1; i >= 0; i--) {
                const t = thrusterParticles[i]; 
                t.x += t.vx * dt; t.y += t.vy * dt; 
                t.life -= dt * (t.isSmoke ? 1.0 : ((t.isGuardianFlame || t.isWraithFlame) ? 2.0 : 2.8));
                if (!t.isSmoke && !t.isGuardianFlame && !t.isWraithFlame) applyWakeForce(t.x, t.y, 30, 1.4); 
                if (t.life <= 0) thrusterParticles.splice(i, 1);
            }

            // XP Magnet
            const magnetRangeSq = 22500 * (1 + player.modifiers.magnet);
            for (let i = xpOrbs.length - 1; i >= 0; i--) {
                const orb = xpOrbs[i];
                const dx = player.x - orb.x, dy = player.y - orb.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < magnetRangeSq) {
                    const dist = Math.sqrt(distSq);
                    orb.vx = (dx / dist) * 1000; orb.vy = (dy / dist) * 1000;
                } else {
                    orb.vx *= 0.95; orb.vy = 120;
                }
                orb.x += orb.vx * dt; orb.y += orb.vy * dt;
                if (distSq < 1600) {
                    const xpValue = orb.xpValue || 1;
                    player.xp += xpValue;
                    if (player.modifiers.xpHeal > 0 && player.hp < player.maxHp) {
                        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * player.modifiers.xpHeal * Math.max(1, xpValue));
                    }
                    if (player.xp >= player.xpNeeded && !boss) {
                        player.xp -= player.xpNeeded; 
                        player.level++; 
                        player.xpNeeded = getXpNeededForLevel(player.level);
                        beginLevelUpOffer();
                    }
                    xpOrbs.splice(i, 1); score += 50;
                } else if (orb.y > height + 60) xpOrbs.splice(i, 1);
            }

            // Enemies Firing
            for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
                const e = enemies[enemyIndex];
                if (e.remasterFirePattern && e.onScreen && isEnemyDamageable(e)) {
                    e.remasterFireTimer = (e.remasterFireTimer || 0) + dt;
                    if (e.remasterFireTimer >= (e.remasterFireInterval || 2.6)) {
                        e.remasterFireTimer = 0;
                        fireRemasteredWavePattern(e);
                    }
                }
                if (e.y > 0 && isEnemyDamageable(e) && !e.isFlameGuardian && !e.isWraith && !e.isVoidSentinel && !e.disableRandomFire && Math.random() < NON_BOSS_ENEMY_RANDOM_FIRE_CHANCE) {
                    const dx = player.x - e.x, dy = player.y - e.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    enemyBullets.push({ x: e.x, y: e.y, vx: (dx/dist)*320, vy: (dy/dist)*320, char: 'o', color: '#ff00ff' });
                }
            }

            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i]; 

                if (b.isDyingBullet) {
                    const startedAt = b.bossClearStart || currentFrameNow || performance.now();
                    const elapsed = ((currentFrameNow || performance.now()) - startedAt) / 1000;
                    if (elapsed >= (b.bossClearDuration || 0.5)) {
                        enemyBullets.splice(i, 1);
                        continue;
                    }
                    b.x += (b.vx || 0) * dt;
                    b.y += (b.vy || 0) * dt;
                    const damp = Math.pow(0.04, dt);
                    b.vx = (b.vx || 0) * damp;
                    b.vy = (b.vy || 0) * damp;
                    continue;
                }
                
                if (b.isGlitchBullet) {
                    b.morphTimer += dt;
                    if (b.morphTimer > 0.12) {
                        b.morphTimer = 0;
                        if (b.isCodeLine) {
                            // Randomly mutate a few characters in the code line
                            const codeChars = 'ﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙ01{}[];:=></%!&|~';
                            let arr = b.char.split('');
                            for (let m = 0; m < 2; m++) {
                                const idx = Math.floor(Math.random() * arr.length);
                                arr[idx] = codeChars[Math.floor(Math.random() * codeChars.length)];
                            }
                            b.char = arr.join('');
                        } else {
                            b.char = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                        }
                    }
                }
                
                if (b.isZigZag) {
                    b.zigTimer += dt;
                    const zigInterval = b.zigInterval || 0.35;
                    if (b.zigTimer > zigInterval) {
                        b.zigTimer -= zigInterval;
                        b.zigDir *= -1;
                    }
                    const length = Math.sqrt(b.baseVx * b.baseVx + b.baseVy * b.baseVy);
                    if (length > 0) {
                        const perpX = -b.baseVy / length;
                        const perpY = b.baseVx / length;
                        const amplitude = b.zigAmplitude || 200;
                        b.vx = b.baseVx + perpX * amplitude * b.zigDir;
                        b.vy = b.baseVy + perpY * amplitude * b.zigDir;
                    }
                }

                if (b.isSignalStormOrb) {
                    b.age = (b.age || 0) + dt;
                    const currentSpeed = b.speed || Math.max(1, Math.hypot(b.vx || 0, b.vy || 0));
                    const nextSpeed = Math.min(b.maxSpeed || 455, currentSpeed + (b.accel || 140) * dt);
                    const currentAngle = Math.atan2(b.vy || 0, b.vx || 1);
                    const targetAngle = Math.atan2(player.y - b.y, player.x - b.x);
                    const maxTurn = (b.homingTurn || 1.0) * dt;
                    const delta = Math.max(-maxTurn, Math.min(maxTurn, getAngleDelta(targetAngle, currentAngle)));
                    const nextAngle = currentAngle + delta;
                    b.speed = nextSpeed;
                    b.vx = Math.cos(nextAngle) * nextSpeed;
                    b.vy = Math.sin(nextAngle) * nextSpeed;
                }

                if (b.isLargeFlame || b.isLargeWraith) {
                    emitElementalBulletTrail(b, dt, !!b.isLargeWraith);
                }

                if (b.isOrbitShot) {
                    if (b.anchorToBoss && isBlackVoidBossActive()) {
                        b.anchorX = boss.x;
                        b.anchorY = boss.y;
                    }
                    if (b.holdTime > 0) {
                        b.holdTime -= dt;
                        b.orbitAngle += (b.orbitAngularSpeed || 2.5) * dt;
                        b.orbitRadius += (b.orbitRadiusSpeed || 28) * dt;
                        b.x = b.anchorX + Math.cos(b.orbitAngle) * b.orbitRadius;
                        b.y = b.anchorY + Math.sin(b.orbitAngle) * b.orbitRadius;
                        if (b.holdTime <= 0) {
                            const releaseAngle = b.orbitAngle + Math.PI / 2 + (b.releaseAngleOffset || 0);
                            const speed = b.releaseSpeed || 320;
                            b.vx = Math.cos(releaseAngle) * speed;
                            b.vy = Math.sin(releaseAngle) * speed;
                            b.isOrbitShot = false;
                        }
                    } else {
                        b.x += b.vx * dt;
                        b.y += b.vy * dt;
                    }
                } else {
                    if (b.turnRate) {
                        const speed = b.speed || Math.max(1, Math.hypot(b.vx, b.vy));
                        const angle = Math.atan2(b.vy, b.vx) + b.turnRate * dt;
                        b.speed = speed;
                        b.vx = Math.cos(angle) * speed;
                        b.vy = Math.sin(angle) * speed;
                    }
                    if (b.isLatticeShot) {
                        b.waveTime = (b.waveTime || 0) + dt;
                        b.y += b.vy * dt;
                        b.x = (b.baseX || b.x) + Math.sin(b.waveTime * (b.waveFreq || 3.5) + (b.wavePhase || 0)) * (b.waveAmp || 0);
                    } else {
                        b.x += b.vx * dt;
                        b.y += b.vy * dt;
                    }
                }
                
                if (b.decay) {
                    b.life -= b.decay * dt;
                    if (b.life <= 0) { enemyBullets.splice(i, 1); continue; }
                }

                const dx = b.x - player.x, dy = b.y - player.y;
                const hitboxR = 30 * getPlayerHitboxScale();
                const bulletHitboxScale = b.hitboxScale || 1;
                
                if (dx * dx + dy * dy < hitboxR * hitboxR * bulletHitboxScale * bulletHitboxScale * (b.decay ? Math.max(0.1, b.life) : 1)) {
                    if (!player.godMode && player.invincibilityTimer <= 0) {
                        player.hp -= 10; 
                        addShake(15); 
                        wobble = 1.0; 
                        player.invincibilityTimer = 0.4 + player.modifiers.invincibility;
                        player.flashTimer = player.invincibilityTimer;
                        for (let j = 0; j < 5; j++) debris.push({ x: player.x, y: player.y, vx: (Math.random()-0.5)*120, vy: -120 + (Math.random()-0.5)*60, char: ['░', '▒', '·', '∙'][Math.floor(Math.random()*4)], color: Math.random() > 0.5 ? '#555555' : '#888888', life: 0.6 });
                        
                        if (player.hp <= 0) {
                            gameState = 'DYING';
                            deathTimer = 0;
                            shake = 0;
                            fadeMusicForDeath();
                        }
                    }
                    enemyBullets.splice(i, 1);
                } else if (b.y > height + 50 || b.y < -50 || b.x < -50 || b.x > width + 50) {
                    enemyBullets.splice(i, 1);
                }
            }


            // Boss Update Loop
            if (boss) {
                if (boss.flashTimer > 0) boss.flashTimer -= dt;

                if (boss.isGlitch) {
                    if (boss.phase === 'INTRO') {
                        const glitchIntroDuration = 4;
                        const glitchIntroStartX = typeof boss.introStartX === 'number' ? boss.introStartX : width / 2;
                        const glitchIntroStartY = typeof boss.introStartY === 'number' ? boss.introStartY : -200;
                        const glitchIntroTargetX = typeof boss.introTargetX === 'number' ? boss.introTargetX : width / 2;
                        const glitchIntroTargetY = typeof boss.introTargetY === 'number' ? boss.introTargetY : height * 0.2;
                        const nextTimer = Math.min(glitchIntroDuration, boss.timer + dt);
                        const introProgress = Math.max(0, Math.min(1, nextTimer / glitchIntroDuration));
                        const glitchPhase = nextTimer;
                        const swayScale = 1 - introProgress * 0.2;
                        const swayX = Math.sin(glitchPhase * 8.5) * 5.5 * swayScale;
                        const swayY = Math.sin(glitchPhase * 4.2 + 0.35) * 2.5 * swayScale;

                        boss.x = glitchIntroStartX + (glitchIntroTargetX - glitchIntroStartX) * introProgress + swayX;
                        boss.y = glitchIntroStartY + (glitchIntroTargetY - glitchIntroStartY) * introProgress + swayY;
                        boss.sprite = Math.random() > 0.72 ? GLITCH_SPRITE_1B : GLITCH_SPRITE_1;

                        if (Math.random() < 0.08 * (dt * 60)) {
                            for (let k = 0; k < 5; k++) {
                                debris.push({
                                    x: boss.x + (Math.random() - 0.5) * 30,
                                    y: boss.y + (Math.random() - 0.5) * 24,
                                    vx: (Math.random() - 0.5) * 45,
                                    vy: (Math.random() - 0.5) * 45,
                                    char: GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
                                    color: Math.random() > 0.5 ? '#666666' : '#9a9a9a',
                                    life: 0.12 + Math.random() * 0.1
                                });
                            }
                        }

                        boss.timer = nextTimer;
                        if (boss.timer >= glitchIntroDuration) {
                            boss.x = glitchIntroTargetX;
                            boss.y = glitchIntroTargetY;
                            boss.sprite = GLITCH_SPRITE_1;
                            boss.phase = 'ACTIVE';
                            boss.timer = 0;
                        }
                    } else {
                        boss.colorCycleTimer += dt;
                        if (boss.isDeadGlitching) {
                            const c1 = boss.stage === 1 ? '#ff00ff' : '#ffffff';
                            const c2 = boss.stage === 1 ? '#00ffff' : '#ff0000';
                            boss.color = (Math.floor(currentFrameNow / 100) % 2 === 0) ? c1 : c2;
                        } else if (boss.stage === 1) {
                            boss.color = (boss.colorCycleTimer % 2.0 < 1.0) ? '#ff00ff' : '#00ffff';
                        } else {
                            boss.color = (boss.colorCycleTimer % 1.0 < 0.5) ? '#ffffff' : '#ff0000';
                        }

                        if (maybeTriggerBossDeathCinematic(boss)) return;

                        if (boss.stage === 1 && boss.hp <= boss.maxHp / 2) {
                            boss.stage = 2;
                            boss.transitionFlash = 0.3;
                            boss.transitionTextTimer = 2.0;
                            boss.x = width / 2;
                            boss.y = height / 3;
                            boss.sprite = GLITCH_SPRITE_2;
                            boss.chargeTimer = 0;
                            boss.isCharging = false;
                            boss.baseSpeed = 150;
                        }

                        if (boss.transitionTextTimer > 0) boss.transitionTextTimer -= dt;
                        if (boss.transitionFlash > 0) boss.transitionFlash -= dt;

                        if (boss.transitionFlash <= 0 && !boss.isCharging) {
                            boss.dirChangeTimer -= dt;
                            if (boss.dirChangeTimer <= 0) {
                                boss.dirChangeTimer = boss.stage === 1 ? 2.0 + Math.random() * 2.0 : 1.0 + Math.random() * 1.5;
                                const angle = Math.random() * Math.PI * 2;
                                const spdMult = 0.5 + Math.random() * 1.5;
                                boss.glitchVx = Math.cos(angle) * boss.baseSpeed * spdMult;
                                boss.glitchVy = Math.sin(angle) * boss.baseSpeed * spdMult;
                            }

                            if (Math.random() > 0.20) {
                                boss.x += boss.glitchVx * dt;
                                boss.y += boss.glitchVy * dt;
                            }

                            const pad = 60;
                            if (boss.x < pad) { boss.x = pad; boss.glitchVx *= -1; }
                            if (boss.x > width - pad) { boss.x = width - pad; boss.glitchVx *= -1; }
                            if (boss.y < pad) { boss.y = pad; boss.glitchVy *= -1; }
                            if (boss.y > height / 2) { boss.y = height / 2; boss.glitchVy *= -1; }

                            boss.sprite = boss.stage === 1
                                ? (Math.random() > 0.7 ? GLITCH_SPRITE_1B : GLITCH_SPRITE_1)
                                : (Math.random() > 0.7 ? GLITCH_SPRITE_2B : GLITCH_SPRITE_2);

                            if (Math.random() < (boss.stage === 1 ? 0.04 : 0.08) * (dt * 60)) {
                                const megaGlitch = Math.random() > 0.85;
                                const tDist = megaGlitch ? 150 + Math.random() * 150 : 30 + Math.random() * 50;
                                const tAngle = Math.random() * Math.PI * 2;

                                if (megaGlitch) {
                                    for (let k = 0; k < 15; k++) {
                                        debris.push({
                                            x: boss.x + (Math.random() - 0.5) * 50,
                                            y: boss.y + (Math.random() - 0.5) * 50,
                                            vx: 0,
                                            vy: 0,
                                            char: GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
                                            color: boss.color,
                                            life: 0.3
                                        });
                                    }
                                    addShake(5);
                                }

                                boss.x = Math.max(pad, Math.min(width - pad, boss.x + Math.cos(tAngle) * tDist));
                                boss.y = Math.max(pad, Math.min(height - 150, boss.y + Math.sin(tAngle) * tDist));
                            }

                            boss.chargeTimer += dt;
                            const chargeCycle = boss.stage === 1 ? 4.0 : 2.5;
                            if (boss.chargeTimer >= chargeCycle) {
                                boss.isCharging = true;
                                boss.chargeDuration = 0;
                                if (boss.stage === 2) {
                                    boss.isDoubleCharge = Math.random() < 0.4;
                                    boss.doubleChargePhase = 1;
                                }
                            } else {
                                boss.scatterTimer -= dt;
                                if (boss.scatterTimer <= 0) {
                                    boss.scatterTimer = boss.stage === 1 ? 0.65 + Math.random() * 1.0 : 0.4 + Math.random() * 0.8;
                                    const count = boss.stage === 1 ? 3 : 5;
                                    for (let i = 0; i < count; i++) {
                                        const a = Math.random() * Math.PI * 2;
                                        enemyBullets.push({
                                            x: boss.x,
                                            y: boss.y,
                                            vx: Math.cos(a) * 200,
                                            vy: Math.sin(a) * 200,
                                            char: '\uFF8A',
                                            color: '#00ff41',
                                            isGlitchBullet: true,
                                            morphTimer: 0
                                        });
                                    }
                                }

                                boss.codeVolleyTimer -= dt;
                                if (boss.isCodeVolley) {
                                    boss.codeVolleyDelay -= dt;
                                    if (boss.codeVolleyDelay <= 0 && boss.codeVolleyShots < 5) {
                                        boss.codeVolleyShots++;
                                        boss.codeVolleyDelay = 0.4;
                                        const codeChars = GLITCH_CHARS.join('') + '01{}[];:=></%!&|~';
                                        const lineLen = 5 + Math.floor(Math.random() * 11);
                                        let codeLine = '';
                                        for (let k = 0; k < lineLen; k++) {
                                            codeLine += codeChars[Math.floor(Math.random() * codeChars.length)];
                                        }
                                        const dx = player.x - boss.x;
                                        const dy = player.y - boss.y;
                                        const baseAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.6;
                                        const speed = 350 + Math.random() * 100;
                                        enemyBullets.push({
                                            x: boss.x,
                                            y: boss.y,
                                            vx: Math.cos(baseAngle) * speed,
                                            vy: Math.sin(baseAngle) * speed,
                                            char: codeLine,
                                            color: '#00ff41',
                                            isGlitchBullet: true,
                                            isCodeLine: true,
                                            morphTimer: 0
                                        });
                                        if (boss.codeVolleyShots >= 5) {
                                            boss.isCodeVolley = false;
                                            boss.codeVolleyTimer = boss.stage === 1 ? 5.0 + Math.random() * 3.0 : 3.0 + Math.random() * 2.0;
                                        }
                                    }
                                } else if (boss.codeVolleyTimer <= 0) {
                                    boss.isCodeVolley = true;
                                    boss.codeVolleyShots = 0;
                                    boss.codeVolleyDelay = 0;
                                }
                            }
                        } else if (boss.isCharging) {
                            boss.chargeDuration += dt;
                            boss.glowIntensity = Math.min(1.0, boss.chargeDuration / 1.0);
                            shake = Math.max(shake, 8 * boss.glowIntensity);
                            if (boss.chargeDuration >= 1.0) {
                                addShake(20);
                                if (boss.isDoubleCharge && boss.doubleChargePhase === 1) {
                                    for (let i = 0; i < 12; i++) {
                                        const a = (i / 12) * Math.PI * 2;
                                        enemyBullets.push({
                                            x: boss.x,
                                            y: boss.y,
                                            vx: Math.cos(a) * 400 * 1.5,
                                            vy: Math.sin(a) * 400 * 1.5,
                                            char: '\uFF8A',
                                            color: '#00ff41',
                                            life: 1.0,
                                            decay: 0.55,
                                            isHuge: true,
                                            isGlitchBullet: true,
                                            morphTimer: 0
                                        });
                                    }
                                    boss.doubleChargePhase = 2;
                                    boss.chargeDuration = 0;
                                } else {
                                    boss.isCharging = false;
                                    boss.chargeTimer = 0;
                                    if (boss.isDoubleCharge && boss.doubleChargePhase === 2) {
                                        const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
                                        const offset = Math.PI / 12;
                                        for (let i = 0; i < 12; i++) {
                                            const a = angleToPlayer + offset + (i / 12) * Math.PI * 2;
                                            enemyBullets.push({
                                                x: boss.x,
                                                y: boss.y,
                                                vx: Math.cos(a) * 400 * 1.5,
                                                vy: Math.sin(a) * 400 * 1.5,
                                                char: '\uFF8A',
                                                color: '#00ff41',
                                                life: 1.0,
                                                decay: 0.55,
                                                isHuge: true,
                                                isGlitchBullet: true,
                                                morphTimer: 0
                                            });
                                        }
                                        boss.isDoubleCharge = false;
                                    } else {
                                        for (let i = 0; i < 12; i++) {
                                            const a = (i / 12) * Math.PI * 2;
                                            enemyBullets.push({
                                                x: boss.x,
                                                y: boss.y,
                                                vx: Math.cos(a) * 400 * 1.5,
                                                vy: Math.sin(a) * 400 * 1.5,
                                                char: '\uFF8A',
                                                color: '#00ff41',
                                                life: 1.0,
                                                decay: 0.55,
                                                isHuge: true,
                                                isGlitchBullet: true,
                                                morphTimer: 0
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else if (boss.isBlackVoid) {
                    if (updateBlackVoidBoss(dt)) return;
                } else if (boss.isEclipseWarden) {
                    if (updateEclipseWardenBoss(dt)) return;
                } else if (boss.isBattleStarship) {
                    if (boss.phase === 'INTRO') {
                        const introDuration = 5.2;
                        const introStartY = typeof boss.introStartY === 'number' ? boss.introStartY : -200;
                        const introTargetY = 150;
                        const introProgress = Math.max(0, Math.min(1, boss.timer / introDuration));
                        const eased = 1 - Math.pow(1 - introProgress, 2.4);
                        boss.y = introStartY + (introTargetY - introStartY) * eased;
                        boss.x = width / 2 + Math.sin(boss.timer * 1.4) * (10 * (1 - introProgress));
                        boss.timer += dt;
                        if (boss.timer >= introDuration) {
                            boss.y = introTargetY;
                            boss.x = width / 2;
                            boss.phase = 'ACTIVE';
                            boss.timer = 0;
                            boss.startX = boss.x;
                            boss.startY = boss.y;
                            boss.color = '#7ed4ff';
                            boss.isVulnerable = true;
                            boss.attackPattern = 0;
                        }
                    } else {
                        boss.timer += dt;
                        boss.driftTimer = (boss.driftTimer || 0) + dt;
                        boss.x = boss.startX + Math.sin(boss.driftTimer * 0.55) * 110;
                        boss.y = boss.startY + Math.sin(boss.driftTimer * 0.85 + 0.4) * 14;
                        applyWakeForce(boss.x, boss.y, 240, 7);

                        const patternDur = boss.attackPattern === 4 ? 5.2 : (boss.attackPattern === 1 ? 5.0 : 4.4);
                        if (boss.timer > patternDur) {
                            boss.timer = 0;
                            boss.attackPattern = (boss.attackPattern + 1) % 5;
                            boss.lastFire = 0;
                            boss.chargeTimer = 0;
                            boss.isCharging = false;
                            boss.isShielded = false;
                            boss.isVulnerable = true;
                            boss.fightersSpawned = false;
                            boss.beamSweepX = boss.x - 220;
                            boss.beamSweepDir = 1;
                            boss.engineGlow = 0;
                        }

                        if (maybeTriggerBossDeathCinematic(boss)) return;

                        const bossNow = currentFrameNow;

                        if (boss.attackPattern === 0) {
                            // Broadside Battery — alternating port volleys
                            if (bossNow - boss.lastFire > 240) {
                                boss.portFireSide = (boss.portFireSide || 0) === 0 ? 1 : 0;
                                const side = boss.portFireSide === 0 ? -1 : 1;
                                const portX = boss.x + side * 90;
                                const portY = boss.y + 18;
                                for (let i = -1; i <= 1; i++) {
                                    const angle = Math.PI / 2 + side * 0.18 + i * 0.14;
                                    const speed = 380;
                                    enemyBullets.push({
                                        x: portX, y: portY,
                                        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                                        char: '=', color: '#9be3ff',
                                        isStarshipBullet: true,
                                        starshipBulletType: 'broadside'
                                    });
                                }
                                boss.lastFire = bossNow;
                            }
                        } else if (boss.attackPattern === 1) {
                            // Heavy Beam Sweep — telegraph then sweep
                            const chargeDuration = 1.5;
                            if (boss.timer < chargeDuration) {
                                // Telegraph: drop slow markers along projected beam path
                                if (bossNow - boss.lastFire > 90) {
                                    const sweepRatio = boss.timer / chargeDuration;
                                    const beamX = boss.x - 240 + sweepRatio * 480;
                                    debris.push({
                                        x: beamX + (Math.random() - 0.5) * 6,
                                        y: boss.y + 36 + Math.random() * 24,
                                        vx: 0, vy: 80,
                                        char: '·', color: '#ffe88a',
                                        life: 0.3, isImpact: true
                                    });
                                    boss.lastFire = bossNow;
                                }
                            } else {
                                // Sweep: emit thick beam segments along sweeping origin
                                if (bossNow - boss.lastFire > 70) {
                                    boss.beamSweepX = (boss.beamSweepX === undefined) ? boss.x - 220 : boss.beamSweepX;
                                    boss.beamSweepX += boss.beamSweepDir * 14;
                                    if (boss.beamSweepX > boss.x + 220) { boss.beamSweepX = boss.x + 220; boss.beamSweepDir = -1; }
                                    if (boss.beamSweepX < boss.x - 220) { boss.beamSweepX = boss.x - 220; boss.beamSweepDir = 1; }
                                    enemyBullets.push({
                                        x: boss.beamSweepX, y: boss.y + 50,
                                        vx: 0, vy: 280,
                                        char: '█', color: '#ffd84a',
                                        isHuge: true, life: 1.0, decay: 0.45,
                                        isStarshipBullet: true,
                                        starshipBulletType: 'beam'
                                    });
                                    enemyBullets.push({
                                        x: boss.beamSweepX, y: boss.y + 70,
                                        vx: 0, vy: 280,
                                        char: '▓', color: '#ffaa18',
                                        isHuge: true, life: 1.0, decay: 0.45,
                                        isStarshipBullet: true,
                                        starshipBulletType: 'beam'
                                    });
                                    boss.lastFire = bossNow;
                                }
                            }
                        } else if (boss.attackPattern === 2) {
                            // Torpedo Spread — slow heavy fan
                            if (bossNow - boss.lastFire > 820) {
                                const aimAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                                for (let i = -2; i <= 2; i++) {
                                    const angle = aimAngle + i * 0.18;
                                    const speed = 220;
                                    enemyBullets.push({
                                        x: boss.x, y: boss.y + 30,
                                        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                                        char: '◉', color: '#ff7a3d',
                                        isHuge: true, life: 1.0, decay: 0.32,
                                        isStarshipBullet: true,
                                        starshipBulletType: 'torpedo'
                                    });
                                }
                                boss.lastFire = bossNow;
                            }
                        } else if (boss.attackPattern === 3) {
                            // Fighter Pattern — spawn carrier-style drones
                            if (!boss.fightersSpawned && boss.timer > 0.3) {
                                boss.fightersSpawned = true;
                                for (let i = 0; i < 3; i++) {
                                    const fromLeft = i % 2 === 0;
                                    const fighter = createLaneSweepEnemy({
                                        startX: fromLeft ? -50 : width + 50,
                                        startY: height * (0.18 + i * 0.05),
                                        endX: fromLeft ? width + 50 : -50,
                                        endY: height * (0.42 + i * 0.06),
                                        delay: -i * 0.45,
                                        routeDuration: 6.4,
                                        laneAmplitude: 30,
                                        lanePhase: i * 0.7,
                                        speed: 1.05,
                                        hp: 38,
                                        color: '#9be3ff'
                                    });
                                    fighter.isBossMinion = true;
                                    fighter.bossMinionOwner = 'BATTLE STARSHIP';
                                    enemies.push(fighter);
                                }
                            }
                            // Light covering fire while fighters press
                            if (bossNow - boss.lastFire > 520) {
                                const aimAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                                for (let i = -1; i <= 1; i++) {
                                    const angle = aimAngle + i * 0.22;
                                    enemyBullets.push({
                                        x: boss.x, y: boss.y + 30,
                                        vx: Math.cos(angle) * 320, vy: Math.sin(angle) * 320,
                                        char: '+', color: '#9be3ff',
                                        isStarshipBullet: true,
                                        starshipBulletType: 'cover'
                                    });
                                }
                                boss.lastFire = bossNow;
                            }
                        } else if (boss.attackPattern === 4) {
                            // Reactor Vent — shield up barrage, then expose engine for damage window
                            if (boss.timer < 1.6) {
                                // Shields raised + heavy barrage from front
                                boss.isShielded = true;
                                boss.isVulnerable = false;
                                boss.engineGlow = Math.min(1, boss.engineGlow + dt * 1.4);
                                if (bossNow - boss.lastFire > 320) {
                                    const aimAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                                    for (let i = -3; i <= 3; i++) {
                                        const angle = aimAngle + i * 0.13;
                                        enemyBullets.push({
                                            x: boss.x, y: boss.y + 30,
                                            vx: Math.cos(angle) * 360, vy: Math.sin(angle) * 360,
                                            char: '*', color: '#bff0ff',
                                            isStarshipBullet: true,
                                            starshipBulletType: 'reactor'
                                        });
                                    }
                                    boss.lastFire = bossNow;
                                }
                            } else if (boss.timer < 4.4) {
                                // Vent exposed — boss vulnerable, no firing
                                boss.isShielded = false;
                                boss.isVulnerable = true;
                                boss.engineGlow = Math.max(0, boss.engineGlow - dt * 0.6);
                            } else {
                                // Recovery — shields restoring
                                boss.isShielded = true;
                                boss.isVulnerable = false;
                                boss.engineGlow = Math.min(1, boss.engineGlow + dt * 1.2);
                            }
                        }
                    }
                } else {
                    if (boss.phase === 'INTRO') {
                        if (boss.name === 'NULL PHANTOM') {
                            const phantomIntroDuration = 4;
                            const phantomIntroStartY = typeof boss.introStartY === 'number' ? boss.introStartY : -200;
                            const phantomIntroTargetY = phantomIntroStartY + 65 * phantomIntroDuration + height * NULL_PHANTOM_REST_OFFSET_Y;
                            const introProgress = Math.max(0, Math.min(1, (boss.timer + dt) / phantomIntroDuration));
                            boss.y = phantomIntroStartY + (phantomIntroTargetY - phantomIntroStartY) * introProgress;
                        } else if (boss.name !== 'OVERHEATING FIREWALL') {
                            boss.y += 65 * dt;
                        } else {
                            const firewallIntroDuration = 6.9;
                            const firewallIntroTargetY = 80 + (boss.sprite.length * charH * FIREWALL_BOSS_RENDER_SCALE) / 2;
                            const firewallIntroStartY = typeof boss.introStartY === 'number' ? boss.introStartY : -200;
                            const introProgress = Math.max(0, Math.min(1, boss.timer / firewallIntroDuration));
                            boss.y = firewallIntroStartY + (firewallIntroTargetY - firewallIntroStartY) * introProgress;
                        }

                        boss.timer += dt;
                        const introDuration = boss.name === 'GHOST SIGNAL' ? 7.5 : (boss.name === 'OVERHEATING FIREWALL' ? 6.9 : 4);
                        if (boss.name === 'GHOST SIGNAL' && boss.timer >= 5.0 && !boss.addsSpawned) {
                            boss.addsSpawned = true;
                            const leftWraith = createGhostSignalWraith(-50, boss.y, 150, width * 0.2);
                            const rightWraith = createGhostSignalWraith(width + 50, boss.y, -150, width * 0.8);
                            leftWraith.isBossMinion = true;
                            rightWraith.isBossMinion = true;
                            leftWraith.bossMinionOwner = 'GHOST SIGNAL';
                            rightWraith.bossMinionOwner = 'GHOST SIGNAL';
                            enemies.push(leftWraith);
                            enemies.push(rightWraith);
                        }
                        if (boss.timer > introDuration) {
                            if (boss.name === 'OVERHEATING FIREWALL') {
                                boss.y = 80 + (boss.sprite.length * charH * FIREWALL_BOSS_RENDER_SCALE) / 2;
                            } else if (boss.name === 'NULL PHANTOM') {
                                boss.y = (typeof boss.introStartY === 'number' ? boss.introStartY : -200) + 65 * introDuration + height * NULL_PHANTOM_REST_OFFSET_Y;
                            }
                            boss.phase = 'ACTIVE';
                            boss.timer = 0;
                            boss.color = boss.name === 'GHOST SIGNAL' ? '#00ffff' : (boss.name === 'OVERHEATING FIREWALL' ? '#ff6600' : (boss.name === 'ECLIPSE WARDEN' ? '#c8c0ff' : '#ff00ff'));
                            if (boss.name === 'OVERHEATING FIREWALL') {
                                boss.coreTimer = 3.0;
                                boss.isVulnerable = true;
                                boss.fireGuardianSpawned = true;
                                enemies.push(createFirewallGuardianMinion());
                            }
                            boss.startX = boss.x;
                            boss.startY = boss.y;
                        }
                    } else {
                        boss.timer += dt;

                        if (boss.name === 'NULL PHANTOM') {
                            boss.driftTimer = (boss.driftTimer || 0) + dt;
                            let w = 0.15;
                            if (Math.sin(boss.driftTimer * 0.5) > 0.7) w = 0.3;
                            boss.driftAngle = (boss.driftAngle || 0) + w * dt;
                            boss.x = boss.startX + Math.sin(boss.driftAngle) * (width * 0.35);
                            boss.y = boss.startY + Math.sin(boss.driftAngle * 2.1) * 15;
                            applyWakeForce(boss.x, boss.y, 250, 10);

                            boss.burstTimer = (boss.burstTimer || 0) + dt;
                            if (boss.burstTimer >= 2.5) {
                                boss.burstTimer = 0;
                                boss.burstCount = 3;
                                boss.burstDelay = 0;
                            }
                            if (boss.burstCount > 0) {
                                boss.burstDelay -= dt;
                                if (boss.burstDelay <= 0) {
                                    boss.burstDelay = 0.15;
                                    boss.burstCount--;
                                    const dx = player.x - boss.x;
                                    const dy = player.y - boss.y;
                                    const dist = Math.sqrt(dx * dx + dy * dy);
                                    enemyBullets.push({ x: boss.x, y: boss.y, vx: (dx / dist) * 500, vy: (dy / dist) * 500, char: 'x', color: '#ff00ff', isPhantomBullet: true, phantomBulletType: 'needle' });
                                }
                            }
                        } else if (boss.name === 'GHOST SIGNAL') {
                            boss.driftTimer = (boss.driftTimer || 0) + dt;
                            if ((boss.stage || 1) === 1 && boss.hp <= boss.maxHp * 0.5 && beginGhostSignalStageTwoTransition()) {
                                return;
                            }
                            const stageTwo = (boss.stage || 1) >= 2;
                            const driftX = stageTwo ? GHOST_SIGNAL_DRIFT_X * 0.62 : GHOST_SIGNAL_DRIFT_X;
                            const driftY = stageTwo ? GHOST_SIGNAL_DRIFT_Y * 0.58 : GHOST_SIGNAL_DRIFT_Y;
                            boss.x = boss.startX + Math.sin(boss.driftTimer * (stageTwo ? 0.42 : 0.55)) * driftX;
                            boss.y = boss.startY + Math.sin(boss.driftTimer * (stageTwo ? 0.95 : 1.15)) * driftY;
                            applyWakeForce(boss.x, boss.y, stageTwo ? 240 : 180, stageTwo ? 7 : 5);
                        } else if (boss.name === 'OVERHEATING FIREWALL') {
                            boss.driftTimer = (boss.driftTimer || 0) + dt;
                            if ((boss.stage || 1) === 1 && boss.hp <= boss.maxHp * 0.5) {
                                beginFirewallStageTwo();
                            }
                            const firewallStageTwo = (boss.stage || 1) >= 2;
                            boss.x = width / 2 + Math.sin(boss.driftTimer * (firewallStageTwo ? 0.72 : 0.5)) * (firewallStageTwo ? 78 : 50);

                            boss.smokeTimer = (boss.smokeTimer || 0) + dt;
                            const smokeInterval = thrusterParticles.length > ELEMENTAL_TRAIL_SOFT_CAP ? 0.11 : (firewallStageTwo ? 0.052 : 0.065);
                            if (boss.smokeTimer >= smokeInterval && thrusterParticles.length < ELEMENTAL_TRAIL_HARD_CAP) {
                                boss.smokeTimer %= smokeInterval;
                                thrusterParticles.push({
                                    x: boss.x + (Math.random() - 0.5) * 150,
                                    y: boss.y - 100 - Math.random() * 50,
                                    vx: (Math.random() - 0.5) * 40,
                                    vy: -50 - Math.random() * 50,
                                    char: ['\u2591', '\u2592', '\u00B7'][Math.floor(Math.random() * 3)],
                                    color: ['#555555', '#444444'][Math.floor(Math.random() * 2)],
                                    life: 1.2,
                                    isSmoke: true
                                });
                            }
                        }

                        if (boss.timer > 4) {
                            boss.timer = 0;
                            const numPatterns = boss.name === 'GHOST SIGNAL'
                                ? ((boss.stage || 1) >= 2 ? 3 : 5)
                                : 3;
                            boss.attackPattern = (boss.attackPattern + 1) % numPatterns;
                            boss.lastFire = 0;
                            boss.signalPulseComboCount = 0;
                            boss.signalPulseComboDelay = 0;
                            boss.signalComboCooldownUntil = 0;
                        }

                        const isPhantom = boss.name === 'NULL PHANTOM';
                        const fire = (vx, vy) => enemyBullets.push({
                            x: boss.x,
                            y: boss.y,
                            vx,
                            vy,
                            char: isPhantom ? 'x' : '◌',
                            color: isPhantom ? '#ff00ff' : '#00ffff',
                            isPhantomBullet: isPhantom,
                            phantomBulletType: isPhantom ? 'rift' : null,
                            isSignalPulse: boss.name === 'GHOST SIGNAL',
                            signalBulletType: boss.name === 'GHOST SIGNAL' ? 'pulse' : null
                        });

                        if (boss.name === 'OVERHEATING FIREWALL') {
                            const bossFire = (vx, vy, huge, isFlame) => enemyBullets.push({
                                x: boss.x,
                                y: boss.y + FIREWALL_BOSS_CORE_OFFSET_Y,
                                vx,
                                vy,
                                char: isFlame ? '\u274B' : '*',
                                color: isFlame ? '#e38914' : '#ff6600',
                                isHuge: huge,
                                isLargeFlame: isFlame,
                                isFirewallBullet: true,
                                firewallBulletType: isFlame ? 'flame' : (huge ? 'cinder' : 'spark'),
                                life: huge ? 1.0 : 0,
                                decay: huge ? 0.6 : 0
                            });

                        const bossNow = currentFrameNow;
                        if ((boss.stage || 1) >= 2) {
                            boss.firestormAngle = (boss.firestormAngle || 0) + 0.16;
                            if (boss.attackPattern === 0 && bossNow - boss.lastFire > 180) {
                                for (let i = 0; i < 2; i++) {
                                    const a = boss.firestormAngle + i * Math.PI + Math.sin(boss.firestormAngle * 0.7) * 0.25;
                                    bossFire(Math.cos(a) * 390, Math.sin(a) * 390 + 90, false, true);
                                    bossFire(Math.cos(a + 0.28) * 310, Math.sin(a + 0.28) * 310 + 135, false, true);
                                }
                                boss.lastFire = bossNow;
                            } else if (boss.attackPattern === 1 && bossNow - boss.lastFire > 620) {
                                boss.firewallCurtainFlip = !boss.firewallCurtainFlip;
                                const gapX = Math.max(95, Math.min(width - 95, player.x + (boss.firewallCurtainFlip ? -65 : 65)));
                                const columns = 10;
                                for (let i = 0; i < columns; i++) {
                                    const x = width * (0.08 + i * 0.093);
                                    if (Math.abs(x - gapX) < 78) continue;
                                    const vy = 265 + (i % 3) * 28;
                                    enemyBullets.push({
                                        x,
                                        y: -24,
                                        vx: Math.sin(i * 1.7 + boss.firestormAngle) * 34,
                                        vy,
                                        char: '❋',
                                        color: i % 2 === 0 ? '#e38914' : '#e01926',
                                        isLargeFlame: true,
                                        isFirewallBullet: true,
                                        firewallBulletType: 'flame',
                                        hitboxScale: 1.08
                                    });
                                }
                                boss.lastFire = bossNow;
                            } else if (boss.attackPattern === 2 && bossNow - boss.lastFire > 1050) {
                                const count = 22;
                                const aim = Math.atan2(player.y - (boss.y + FIREWALL_BOSS_CORE_OFFSET_Y), player.x - boss.x);
                                for (let i = 0; i < count; i++) {
                                    const gap = Math.abs(getAngleDelta((i / count) * Math.PI * 2, aim));
                                    if (gap < 0.18) continue;
                                    const a = (i / count) * Math.PI * 2 + boss.firestormAngle * 0.4;
                                    const speed = 270 + (i % 2) * 55;
                                    bossFire(Math.cos(a) * speed, Math.sin(a) * speed + 80, i % 7 === 0, i % 7 !== 0);
                                }
                                boss.lastFire = bossNow;
                            }
                        } else if (boss.attackPattern === 0 && bossNow - boss.lastFire > 800) {
                            for (let i = 0; i < 16; i++) {
                                const a = (i / 16) * Math.PI * 2;
                                bossFire(Math.cos(a) * 600, Math.sin(a) * 600, false, true);
                            }
                            boss.lastFire = bossNow;
                        } else if (boss.attackPattern === 1 && bossNow - boss.lastFire > 120) {
                            bossFire((Math.random() - 0.5) * 600, 300 + Math.random() * 400, true, false);
                            boss.lastFire = bossNow;
                        } else if (boss.attackPattern === 2 && bossNow - boss.lastFire > 1000) {
                            for (let i = 0; i < 20; i++) {
                                const a = (i / 20) * Math.PI * 2;
                                bossFire(Math.cos(a) * 300, Math.sin(a) * 300 + 150, false, true);
                            }
                            boss.lastFire = bossNow;
                        }
                    } else {
                        const bossNow = currentFrameNow;
                        if (boss.name === 'GHOST SIGNAL' && (boss.stage || 1) >= 2) {
                            updateGhostSignalStageTwoAttacks(bossNow, dt);
                        } else if (boss.attackPattern === 0 && bossNow - boss.lastFire > 1000) {
                            for (let i = 0; i < 18; i++) {
                                const a = (i / 18) * Math.PI * 2;
                                fire(Math.cos(a) * 380, Math.sin(a) * 380);
                            }
                            boss.lastFire = bossNow;
                        } else if (boss.attackPattern === 1 && bossNow - boss.lastFire > 60) {
                            boss.spiralAngle += 0.3;
                            fire(Math.cos(boss.spiralAngle) * 500, Math.sin(boss.spiralAngle) * 500);
                            boss.lastFire = bossNow;
                        } else if (boss.attackPattern === 2 && bossNow - boss.lastFire > 750) {
                            const dx = player.x - boss.x;
                            const dy = player.y - boss.y;
                            for (let i = -2; i <= 2; i++) {
                                const a = Math.atan2(dy, dx) + i * 0.22;
                                fire(Math.cos(a) * 600, Math.sin(a) * 600);
                            }
                            boss.lastFire = bossNow;
                        } else if (boss.attackPattern === 3 && boss.name === 'GHOST SIGNAL' && bossNow - boss.lastFire > 3000) {
                            const dx = player.x - boss.x;
                            const dy = player.y - boss.y;
                            for (let i = -1; i <= 1; i++) {
                                    const a = Math.atan2(dy, dx) + i * 0.25;
                                    enemyBullets.push({
                                        x: boss.x,
                                        y: boss.y,
                                        baseVx: Math.cos(a) * 350,
                                        baseVy: Math.sin(a) * 350,
                                        vx: Math.cos(a) * 350,
                                        vy: Math.sin(a) * 350,
                                        char: 'z',
                                        color: '#00ffff',
                                        isZigZag: true,
                                        isSignalPulse: true,
                                        signalBulletType: 'zigzag',
                                        zigTimer: 0,
                                        zigDir: 1
                                    });
                                }
                                boss.lastFire = bossNow;
                            } else if (boss.attackPattern === 4 && boss.name === 'GHOST SIGNAL' && bossNow - boss.lastFire > 2200) {
                                const dx = player.x - boss.x;
                                const dy = player.y - boss.y;
                                const aimAngle = Math.atan2(dy, dx);
                                for (let i = 0; i < 2; i++) {
                                    const angleOffset = (i === 0 ? -1 : 1) * 0.08;
                                    const a = aimAngle + angleOffset;
                                    const speed = 420;
                                    enemyBullets.push({
                                        x: boss.x,
                                        y: boss.y,
                                        baseVx: Math.cos(a) * speed,
                                        baseVy: Math.sin(a) * speed,
                                        vx: Math.cos(a) * speed,
                                        vy: Math.sin(a) * speed,
                                        char: 'Y',
                                        color: '#ffd400',
                                        isZigZag: true,
                                        isSignalPulse: true,
                                        signalBulletType: 'fork',
                                        zigTimer: 0,
                                        zigDir: i === 0 ? -1 : 1,
                                        zigInterval: 0.26,
                                        zigAmplitude: 280,
                                        isSignalYBullet: true
                                    });
                                }
                                boss.lastFire = bossNow;
                            }
                        }
                    }

                    if (maybeTriggerBossDeathCinematic(boss)) return;
                }
            }

            // Projectiles
            for (let i = comboProjectiles.length - 1; i >= 0; i--) {
                const p = comboProjectiles[i];
                p.life -= dt;
                p.age = (p.age || 0) + dt;
                
                if (p.orbitTime > 0) {
                    p.orbitTime -= dt;
                    p.orbitAngle += (p.orbitSpin || 8.5) * dt;
                    const radiusPulse = Math.sin(p.age * 18) * 3;
                    const orbitRadius = (p.orbitRadius || 34) + radiusPulse;
                    p.x = player.x + Math.cos(p.orbitAngle) * orbitRadius;
                    p.y = player.y + Math.sin(p.orbitAngle) * orbitRadius * 0.72;
                    if (p.orbitTime <= 0) {
                        const releaseAngle = p.releaseAngle ?? -Math.PI / 2;
                        const releaseSpeed = p.releaseSpeed || (1400 * p.stats.speedMult);
                        if (p.stats.orbitReleaseCenter) {
                            p.x = player.x;
                            p.y = player.y;
                        }
                        p.baseVx = Math.cos(releaseAngle) * releaseSpeed;
                        p.baseVy = Math.sin(releaseAngle) * releaseSpeed;
                        p.vx = p.baseVx;
                        p.vy = p.baseVy;
                        p.startX = p.x;
                        p.startY = p.y;
                        p.releaseAge = p.age;
                        p.maxLife = Math.max(0.1, p.life);
                    }
                } else if (p.stats.homing) {
                    const nearestInfo = findNearestActiveTarget(p.x, p.y);
                    const nearest = nearestInfo.target;
                    const minDistSq = nearestInfo.distSq;
                    if (nearest) {
                        const dx = nearest.x - p.x, dy = nearest.y - p.y, dist = Math.sqrt(minDistSq);
                        const steerStr = 3000 * (p.stats.homingStrength || 1) * dt;
                        p.baseVx += (dx / dist) * steerStr;
                        p.baseVy += (dy / dist) * steerStr;
                        const speed = Math.sqrt(p.baseVx*p.baseVx + p.baseVy*p.baseVy);
                        const desiredSpeed = 1400 * p.stats.speedMult;
                        p.baseVx = (p.baseVx / speed) * desiredSpeed;
                        p.baseVy = (p.baseVy / speed) * desiredSpeed;
                    }
                }

                const returnReadyAt = (p.orbitHoldTime || 0) + (p.stats.returnAfter || 0.5);
                if (p.stats.returning && !p.hasReturned && p.age >= returnReadyAt) {
                    p.hasReturned = true;
                    p.damage *= 0.68;
                    p.pierceHits = [];
                    p.pierceCount = Math.max(p.pierceCount, (p.stats.pierceCount || 0) + 1);
                    p.sprite = '✚';
                    p.color = '#77ffe7';
                }

                if (p.hasReturned) {
                    const dx = player.x - p.x;
                    const dy = player.y - p.y;
                    const dist = Math.max(1, Math.hypot(dx, dy));
                    const returnSpeed = 1200 * p.stats.speedMult;
                    p.baseVx = (dx / dist) * returnSpeed;
                    p.baseVy = (dy / dist) * returnSpeed;
                    p.x += p.baseVx * dt;
                    p.y += p.baseVy * dt;
                    if (dist < 24 && p.age > returnReadyAt + 0.16) {
                        comboProjectiles.splice(i, 1);
                        continue;
                    }
                } else if (p.orbitTime > 0) {
                    // Held orbit shots still use collision below, but do not advance linearly yet.
                } else if (p.stats.plasmaCloud) {
                    const releaseAngle = p.releaseAngle ?? Math.atan2(p.baseVy || -1, p.baseVx || 0);
                    const releaseSpeed = p.releaseSpeed || Math.hypot(p.baseVx || 0, p.baseVy || 0);
                    const speed = releaseSpeed * getPlasmaCloudSpeedFactor(p);
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
                    p.x += p.baseVx * dt;
                    p.y += p.baseVy * dt;
                } else if (p.stats.pathFunction === 'sine') {
                    let t = p.maxLife - p.life;
                    let perpX = -p.baseVy / (1400 * p.stats.speedMult);
                    let perpY = p.baseVx / (1400 * p.stats.speedMult);
                    let linearX = p.startX + p.baseVx * t;
                    let linearY = p.startY + p.baseVy * t;
                    let offset = Math.sin(t * 15) * 40;
                    p.x = linearX + perpX * offset;
                    p.y = linearY + perpY * offset;
                } else {
                    p.x += p.baseVx * dt; 
                    p.y += p.baseVy * dt;
                }
                
                applyWakeForce(p.x, p.y, p.stats.plasmaCloud ? 70 : 45, p.stats.plasmaCloud ? 4 : 6);
                if (isBlackVoidBossActive() && boss.eventHorizonActive) {
                    const dxToBoss = boss.x - p.x;
                    const dyToBoss = boss.y - p.y;
                    const distToBoss = Math.max(1, Math.hypot(dxToBoss, dyToBoss));
                    const horizonRadius = getBlackVoidHorizonRadius(boss);
                    if (distToBoss < horizonRadius) {
                        const pull = (1 - distToBoss / horizonRadius) * 1500 * dt;
                        const pullX = (dxToBoss / distToBoss) * pull;
                        const pullY = (dyToBoss / distToBoss) * pull;
                        p.vx += pullX;
                        p.vy += pullY;
                        if (typeof p.baseVx === 'number') p.baseVx += pullX * 0.8;
                        if (typeof p.baseVy === 'number') p.baseVy += pullY * 0.8;
                        if (distToBoss < 42) {
                            absorbBlackVoidProjectile(p.x, p.y, 1);
                            comboProjectiles.splice(i, 1);
                            continue;
                        }
                    }
                }
                
                let hit = false;
                const projectileStats = p.stats || createBaseWeaponStats();
                const hitboxRadius = getComboProjectileHitboxRadius(p);
                const targetMaskRadius = Math.max(4, hitboxRadius * (projectileStats.plasmaCloud ? 0.95 : (projectileStats.miniTorpedo ? 0.86 : 0.82)));
                const torpedoRange = projectileStats.torpedoRange || 0;
                const torpedoExpired = projectileStats.miniTorpedo && (p.orbitTime || 0) <= 0 && torpedoRange > 0
                    && ((p.x - p.startX) * (p.x - p.startX) + (p.y - p.startY) * (p.y - p.startY)) >= torpedoRange * torpedoRange;
                if (projectileStats.plasmaCloud) p.cloudSparkTimer = Math.max(0, (p.cloudSparkTimer || 0) - dt);

                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (!e.onScreen) continue;
                    if (!isEnemyDamageable(e)) continue;
                    const alreadyHit = p.pierceHits.includes(e);
                    if (!projectileStats.plasmaCloud && alreadyHit) continue;
                    
                    if (doesProjectileHitTargetMask(p, e, targetMaskRadius)) {
                        if (projectileStats.plasmaCloud) {
                            const cloudGrowth = getPlasmaCloudGrowthFactor(p);
                            e.hp -= p.damage * (projectileStats.cloudDotMult || 6) * cloudGrowth * dt;
                            if (!alreadyHit) {
                                p.pierceHits.push(e);
                                triggerProjectileChain(p, e);
                            }
                            if (p.cloudSparkTimer <= 0) {
                                emitProjectileImpactDebris(p, 1);
                                p.cloudSparkTimer = 0.08;
                            }
                            const enemyIndex = enemies.indexOf(e);
                            if (e.hp <= 0) {
                                if (enemyIndex > -1) {
                                    resolveWaveEnemy(e);
                                    explodeEnemy(e);
                                    enemies.splice(enemyIndex, 1);
                                }
                            } else if (enemyIndex > -1) {
                                e.flashTimer = Math.max(e.flashTimer || 0, 0.06);
                            }
                            continue;
                        }

                        e.hp -= p.damage;
                        p.pierceHits.push(e);
                        
                        if (p.stats.splashRadius > 0) {
                            radialExplosion(p.x, p.y, p.stats.splashRadius * 22, p.damage * p.stats.splashDamagePercent, p.stats.splashVisualDebris ?? 20);
                            if (bossCinematic && bossCinematic.paused) return;
                        }
                        
                        if (p.stats.chainCount > 0 && Math.random() < (p.stats.chainChance ?? 1)) {
                            let nearest = null, minDist = Infinity;
                            for (let otherIndex = 0; otherIndex < enemies.length; otherIndex++) {
                                const other = enemies[otherIndex];
                                if (other === e) continue;
                                if (!isEnemyDamageable(other)) continue;
                                let distSq = (other.x - e.x)**2 + (other.y - e.y)**2;
                                if (distSq < 150*150 && distSq < minDist) { minDist = distSq; nearest = other; }
                            }
                            if (nearest) {
                                comboProjectiles.push({
                                    x: e.x, y: e.y,
                                    vx: (nearest.x - e.x) * 5, vy: (nearest.y - e.y) * 5,
                                    baseVx: (nearest.x - e.x) * 5, baseVy: (nearest.y - e.y) * 5,
                                    startX: e.x, startY: e.y,
                                    targetX: nearest.x, targetY: nearest.y,
                                    sprite: '', color: '#8ff7ff',
                                    stats: { ...p.stats, chainCount: p.stats.chainCount - 1, splashRadius: 0, lightningBall: false, plasmaCloud: false, miniTorpedo: false },
                                    life: 0.42, maxLife: 0.42, damage: p.damage * 0.5,
                                    pierceHits: [e], pierceCount: 0,
                                    isChainLightning: true,
                                    jitterSeed: Math.random() * 1000
                                });
                            }
                        }

                        const impactDebrisCount = p.stats.lightningBall ? 2 : 6 + Math.floor(Math.random() * 3);
                        for (let k = 0; k < impactDebrisCount; k++) {
                            const ang = Math.random() * Math.PI * 2; const spd = 60 + Math.random() * 40;
                            debris.push({ x: p.x, y: p.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, char: IMPACT_DEBRIS_CHARS[Math.floor(Math.random()*IMPACT_DEBRIS_CHARS.length)], color: IMPACT_DEBRIS_COLORS[Math.floor(Math.random()*IMPACT_DEBRIS_COLORS.length)], life: 0.2, isImpact: true });
                        }
                        const enemyIndex = enemies.indexOf(e);
                        if (e.hp <= 0) {
                            if (enemyIndex > -1) {
                                resolveWaveEnemy(e);
                                explodeEnemy(e);
                                enemies.splice(enemyIndex, 1);
                            }
                        } else if (enemyIndex > -1) {
                            e.flashTimer = 0.15;
                        }
                        
                        if (projectileStats.miniTorpedo || p.pierceCount-- <= 0) { hit = true; break; }
                    }
                }
                if (!hit && boss && boss.phase === 'ACTIVE' && (projectileStats.plasmaCloud || !p.pierceHits.includes(boss))) {
                    const alreadyHitBoss = p.pierceHits.includes(boss);
                    let hitBoss = false;
                    if (boss.name === 'OVERHEATING FIREWALL') {
                        if (boss.isVulnerable && Math.abs(p.x - boss.x) < hitboxRadius + 60 && Math.abs(p.y - (boss.y + FIREWALL_BOSS_CORE_OFFSET_Y)) < hitboxRadius + 60) {
                            boss.hp -= projectileStats.plasmaCloud ? p.damage * (projectileStats.cloudDotMult || 6) * getPlasmaCloudGrowthFactor(p) * dt : p.damage;
                            hitBoss = true;
                        } else if (!projectileStats.plasmaCloud && !boss.isVulnerable && Math.abs(p.x - boss.x) < 120 && Math.abs(p.y - boss.y) < 120) {
                            hit = true;
                        }
                    } else if (doesProjectileHitTargetMask(p, boss, targetMaskRadius)) {
                        if (!boss.isDeadGlitching) {
                            const shieldBlocks = isBossDamageShielded(boss);
                            const damageScale = shieldBlocks ? 0 : getBlackVoidDamageScale(p.x, p.y);
                            const bossDamage = projectileStats.plasmaCloud ? p.damage * (projectileStats.cloudDotMult || 6) * getPlasmaCloudGrowthFactor(p) * dt : p.damage;
                            boss.hp -= bossDamage * damageScale;
                            if (damageScale < 1 && !projectileStats.plasmaCloud && !shieldBlocks) absorbBlackVoidProjectile(p.x, p.y, 1);
                            hitBoss = true;
                        } else if (!projectileStats.plasmaCloud) hit = true;
                    }
                    if (hitBoss) {
                        if (!alreadyHitBoss) p.pierceHits.push(boss);
                        boss.flashTimer = projectileStats.plasmaCloud ? Math.max(boss.flashTimer || 0, 0.05) : 0.15;
                        if (maybeTriggerBossDeathCinematic(boss)) return;
                        if (!projectileStats.plasmaCloud) {
                        if (p.stats.splashRadius > 0) {
                            radialExplosion(p.x, p.y, p.stats.splashRadius * 22, p.damage * p.stats.splashDamagePercent, p.stats.splashVisualDebris ?? 20);
                            if (bossCinematic && bossCinematic.paused) return;
                        }
                        const impactDebrisCount = p.stats.lightningBall ? 2 : 6 + Math.floor(Math.random() * 3);
                        for (let k = 0; k < impactDebrisCount; k++) {
                            const ang = Math.random() * Math.PI * 2; const spd = 60 + Math.random() * 40;
                            debris.push({ x: p.x, y: p.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, char: ['·', '∙', '•', '░'][Math.floor(Math.random()*4)], color: ['#888888', '#666666', '#999999', '#aaaaaa'][Math.floor(Math.random()*4)], life: 0.2, isImpact: true });
                        }
                        if (projectileStats.miniTorpedo || p.pierceCount-- <= 0) hit = true;
                        } else if (p.cloudSparkTimer <= 0) {
                            emitProjectileImpactDebris(p, 1);
                            p.cloudSparkTimer = 0.08;
                        }
                    }
                }
                if (hit || torpedoExpired || p.life <= 0 || p.y < -60 || p.y > height + 60 || p.x < -60 || p.x > width + 60) {
                    if (projectileStats.miniTorpedo && (hit || torpedoExpired || p.life <= 0)) {
                        spawnMiniTorpedoExplosion(p.x, p.y, p);
                        if (bossCinematic && bossCinematic.paused) return;
                    } else if (projectileStats.pathFunction === 'parabolic') {
                        triggerProjectileSplash(p);
                        if (bossCinematic && bossCinematic.paused) return;
                    }
                    comboProjectiles.splice(i, 1);
                }
            }

            if (!boss) WaveManager.syncFormationState(enemies);

            if (!boss && WaveManager.pendingFormationUnits <= 0) {
                if (enemies.length > 0 && WaveManager.hasSpawnedWave) {
                    WaveManager.waveDelay = Math.max(WaveManager.waveDelay, WaveManager.interWaveDelay);
                    WaveManager.interWaveDelayQueued = true;
                } else if (WaveManager.waveDelay > 0) {
                    WaveManager.waveDelay = Math.max(0, WaveManager.waveDelay - dt);
                } else if (!WaveManager.hasSpawnedWave || WaveManager.interWaveDelayQueued) {
                    WaveManager.spawn();
                } else {
                    WaveManager.waveDelay = WaveManager.interWaveDelay;
                    WaveManager.interWaveDelayQueued = true;
                }
            }
            
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (!e.onScreen && e.y > 0) e.onScreen = true;
                if (e.flashTimer > 0) e.flashTimer -= dt;

                if (e.isVoidSentinel) {
                    if (e.arrivalDelay > 0) {
                        e.arrivalDelay -= dt;
                        continue;
                    }

                    e.hoverTimer = (e.hoverTimer || 0) + dt;
                    const settleBlend = Math.min(1, dt * (e.approachSpeed || 2.2));
                    const targetX = e.hoverX;
                    const targetY = e.hoverY;
                    e.x += (targetX - e.x) * settleBlend;
                    e.y += (targetY - e.y) * settleBlend;
                    if (!e.settled && Math.hypot(targetX - e.x, targetY - e.y) < 10) e.settled = true;
                    if (e.settled) {
                        e.x = targetX + Math.sin(e.hoverTimer * 1.35 + (e.hoverPhase || 0)) * (e.hoverAmpX || 14);
                        e.y = targetY + Math.cos(e.hoverTimer * 1.9 + (e.hoverPhase || 0)) * (e.hoverAmpY || 9);
                    }
                    applyWakeForce(e.x, e.y, 100, 2.8);

                    if (Math.random() > 0.5) {
                        thrusterParticles.push({
                            x: e.x + (Math.random() - 0.5) * 14,
                            y: e.y + (Math.random() - 0.5) * 14,
                            vx: (Math.random() - 0.5) * 26,
                            vy: -24 - Math.random() * 18,
                            char: ['·', '∙', '░', '▒'][Math.floor(Math.random() * 4)],
                            color: ['#6c63c6', '#9fa6ff', '#d8dcff'][Math.floor(Math.random() * 3)],
                            life: 0.28 + Math.random() * 0.12
                        });
                    }

                    e.fireTimer += dt;
                    const fireInterval = (e.voidAttackMode === 'anchor'
                        ? 2.2
                        : (e.voidAttackMode === 'cross' ? 1.55 : (e.voidAttackMode === 'cinder' ? 2.0 : 1.85))) * NON_BOSS_ENEMY_FIRE_INTERVAL_MULT;
                    if (e.settled && e.fireTimer >= fireInterval) {
                        e.fireTimer = 0;
                        fireVoidSentinelAttack(e);
                    }
                    continue;
                }
                
                if (e.isWraith) {
                    e.hoverTimer = (e.hoverTimer || 0) + dt;
                    e.fireTimer += dt;

                    if (Math.random() > 0.6) {
                        const frost = getWraithFrostEmitter(e);
                        thrusterParticles.push({
                            x: frost.x + (Math.random() - 0.5) * frost.spreadX,
                            y: frost.y + (Math.random() - 0.5) * 4,
                            vx: (Math.random() - 0.5) * 42, vy: -56 - Math.random() * 36,
                            char: ['^', '*', '░', '▒'][Math.floor(Math.random() * 4)],
                            color: null, life: 1.0, isWraithFlame: true
                        });
                    }

                    if (e.fireTimer > 2.1 * NON_BOSS_ENEMY_FIRE_INTERVAL_MULT) {
                        e.fireTimer = 0;
                        const dx = player.x - e.x, dy = player.y - e.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        enemyBullets.push({
                            x: e.x, y: e.y,
                            vx: (dx / dist) * 230, vy: (dy / dist) * 230,
                            char: '✦',
                            color: '#f4f7fb',
                            isWraithBolt: true,
                            isLargeWraith: true
                        });
                    }

                    if (!e.path) {
                        if (Math.abs(e.x - e.hoverX) > 5) e.x += e.vx * dt;
                        else e.vx = 0;
                        if (Math.abs(e.x - e.hoverX) <= 14) {
                            e.x = e.hoverX + Math.sin(e.hoverTimer * 1.7) * 9;
                        }
                        e.y = (e.hoverY || e.y) + Math.sin(e.hoverTimer * 2.35) * 8;
                        continue;
                    }
                }

                if (e.isPrismConduit) {
                    e.prismTimer = (e.prismTimer || 0) + dt;
                    e.prismAttackTimer = (e.prismAttackTimer || 0) + dt;
                    e.hoverTimer = (e.hoverTimer || 0) + dt;

                    const prismColors = ['#ff66ff', '#66ffff', '#ffff66', '#66ff99'];
                    const colorPhase = e.prismTimer * 1.6;
                    const colorIdx = Math.floor(colorPhase) % prismColors.length;
                    const nextColorIdx = (colorIdx + 1) % prismColors.length;
                    const blendT = colorPhase - Math.floor(colorPhase);
                    e.color = blendT < 0.85 ? prismColors[colorIdx] : prismColors[nextColorIdx];

                    const targetX = (e.hoverX || width * 0.5) + Math.sin(e.hoverTimer * 0.85) * (e.hoverAmpX || 120);
                    const targetY = (e.hoverY || height * 0.18) + Math.cos(e.hoverTimer * 1.3) * (e.hoverAmpY || 22);
                    const blend = Math.min(1, dt * 2.0);
                    e.x += (targetX - e.x) * blend;
                    e.y += (targetY - e.y) * blend;
                    applyWakeForce(e.x, e.y, 140, 4);

                    if (e.prismAttackTimer > 4.5) {
                        e.prismAttackTimer = 0;
                        e.prismAttackPattern = ((e.prismAttackPattern || 0) + 1) % 3;
                        e.prismChargeTimer = 0;
                        e.fireTimer = -0.25;
                        e.pulseFired = false;
                    }

                    e.fireTimer = (e.fireTimer || 0) + dt;

                    if (e.onScreen) {
                        if (e.prismAttackPattern === 0) {
                            // Refracted Volley — 5-prong prismatic star
                            if (e.fireTimer > 1.05) {
                                e.fireTimer = 0;
                                const aimAngle = Math.atan2(player.y - e.y, player.x - e.x);
                                const volleyColors = ['#ff66ff', '#66ffff', '#ffffff', '#ffff66', '#66ff99'];
                                for (let k = -2; k <= 2; k++) {
                                    const angle = aimAngle + k * (Math.PI / 7);
                                    const speed = 290;
                                    enemyBullets.push({
                                        x: e.x, y: e.y,
                                        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                                        char: '◆', color: volleyColors[k + 2]
                                    });
                                }
                            }
                        } else if (e.prismAttackPattern === 1) {
                            // Spectral Cascade — color-cycling falling bullets
                            if (e.fireTimer > 0.18) {
                                e.fireTimer = 0;
                                const cascadeColors = ['#ff66ff', '#66ffff', '#ffff66', '#66ff99'];
                                const dropX = e.x + (Math.random() - 0.5) * 240;
                                enemyBullets.push({
                                    x: dropX, y: e.y + 26,
                                    vx: (Math.random() - 0.5) * 40, vy: 250,
                                    char: '✦',
                                    color: cascadeColors[Math.floor(Math.random() * cascadeColors.length)]
                                });
                            }
                        } else if (e.prismAttackPattern === 2) {
                            // Resonance Pulse — telegraph then full ring snap
                            e.prismChargeTimer = (e.prismChargeTimer || 0) + dt;
                            if (e.prismChargeTimer < 1.7) {
                                if (e.fireTimer > 0.06 && debris.length < 320) {
                                    e.fireTimer = 0;
                                    const tAngle = Math.random() * Math.PI * 2;
                                    const tDist = 28 + Math.random() * 22;
                                    const sparkColor = prismColors[Math.floor(Math.random() * prismColors.length)];
                                    debris.push({
                                        x: e.x + Math.cos(tAngle) * tDist,
                                        y: e.y + Math.sin(tAngle) * tDist,
                                        vx: -Math.cos(tAngle) * 55,
                                        vy: -Math.sin(tAngle) * 55,
                                        char: '·', color: sparkColor, life: 0.22
                                    });
                                }
                            } else if (!e.pulseFired) {
                                e.pulseFired = true;
                                for (let k = 0; k < 14; k++) {
                                    const angle = (k / 14) * Math.PI * 2;
                                    const speed = 270;
                                    enemyBullets.push({
                                        x: e.x, y: e.y,
                                        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                                        char: '◇', color: '#ffffff'
                                    });
                                }
                            }
                        }
                    }
                    continue;
                }

                if (e.isFlameGuardian) {
                    e.color = frameCount % 40 < 20 ? '#e38914' : '#e01926';
                    e.hoverTimer = (e.hoverTimer || 0) + dt;
                    
                    e.flameTrailTimer = (e.flameTrailTimer || 0) + dt;
                    const guardianTrailInterval = thrusterParticles.length > ELEMENTAL_TRAIL_SOFT_CAP ? 0.12 : 0.075;
                    if (e.flameTrailTimer >= guardianTrailInterval && thrusterParticles.length < ELEMENTAL_TRAIL_HARD_CAP) {
                        e.flameTrailTimer %= guardianTrailInterval;
                        thrusterParticles.push({
                            x: e.x + (Math.random() - 0.5) * 20, y: e.y - 20,
                            vx: (Math.random() - 0.5) * 45, vy: -60 - Math.random() * 40,
                            char: ['^', '*', '░', '▒'][Math.floor(Math.random() * 4)],
                            color: null, life: 1.0, isGuardianFlame: true
                        });
                    }

                    e.fireTimer += dt;
                    if (e.onScreen && e.fireTimer > (e.flameFireInterval || 2.5) * NON_BOSS_ENEMY_FIRE_INTERVAL_MULT) {
                        e.fireTimer = 0;
                        const dx = player.x - e.x, dy = player.y - e.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const flameShotSpeed = e.flameShotSpeed || 250;
                        enemyBullets.push({ x: e.x, y: e.y, vx: (dx/dist)*flameShotSpeed, vy: (dy/dist)*flameShotSpeed, char: '❋', color: '#e38914', isLargeFlame: true });
                    }
                    
                    // Allow Flame Guardian to follow path if one exists
                    if (!e.path) {
                        if (e.isBossMinion) {
                            const targetX = (e.hoverX || width * 0.5) + Math.sin(e.hoverTimer * 1.1) * (e.hoverAmpX || 120);
                            const targetY = (e.hoverY || height * 0.16) + Math.cos(e.hoverTimer * 1.7) * (e.hoverAmpY || 14);
                            const blend = Math.min(1, dt * 2.1);
                            e.x += (targetX - e.x) * blend;
                            e.y += (targetY - e.y) * blend;
                            e.vx = (targetX - e.x) * blend / Math.max(0.001, dt);
                            e.vy = (targetY - e.y) * blend / Math.max(0.001, dt);
                        } else if (Math.abs(e.x - e.hoverX) > 5) e.x += e.vx * dt;
                        else e.vx = 0;
                        continue;
                    }
                }
                
                if (e.path) {
                    let spd = e.speedMult;
                    const segTime = 10 / e.path.length; e.pathT += (dt / segTime) * spd;
                    if (e.pathT >= 1) {
                        e.pathIndex = (e.pathIndex + 1) % e.path.length;
                        e.pathT -= 1;
                        if (e.pathIndex === 0) {
                            e.pathLoopsCompleted = (e.pathLoopsCompleted || 0) + 1;
                            if (e.despawnOnLoopEnd && e.pathLoopsCompleted >= 1) {
                                resolveWaveEnemy(e);
                                enemies.splice(i, 1);
                                continue;
                            }
                        }
                    }
                    if (e.pathT < 0) { e.x = e.path[0].x * width; e.y = e.path[0].y * height; }
                    else {
                        const p1 = e.path[e.pathIndex], p2 = e.path[(e.pathIndex + 1) % e.path.length];
                        const oldX = e.x, oldY = e.y;
                        e.x = (p1.x + (p2.x - p1.x) * e.pathT) * width; e.y = (p1.y + (p2.y - p1.y) * e.pathT) * height;
                        e.vx = (e.x - oldX) / dt; e.vy = (e.y - oldY) / dt;
                    }
                } else if (e.pathType) {
                    e.lifeTime += dt;
                    if (e.lifeTime > 0) {
                        let nx = e.x, ny = e.y;
                        const t = e.lifeTime;
                        if (e.pathType === 'flyby') {
                            const progress = Math.max(0, Math.min(1, (t * e.speedMult) / Math.max(0.01, e.routeDuration)));
                            const invProgress = 1 - progress;
                            const oldX = e.x;
                            const oldY = e.y;
                            nx = invProgress * invProgress * e.startX + 2 * invProgress * progress * e.controlX + progress * progress * e.endX;
                            ny = invProgress * invProgress * e.startY + 2 * invProgress * progress * e.controlY + progress * progress * e.endY;
                            e.vx = (nx - oldX) / Math.max(0.001, dt);
                            e.vy = (ny - oldY) / Math.max(0.001, dt);

                            while (e.flyByShotsFired < (e.flyByShotThresholds || []).length && progress >= e.flyByShotThresholds[e.flyByShotsFired]) {
                                const dx = player.x - nx;
                                const dy = player.y - ny;
                                const dist = Math.max(1, Math.hypot(dx, dy));
                                enemyBullets.push({
                                    x: nx, y: ny,
                                    vx: (dx / dist) * 260, vy: (dy / dist) * 260,
                                    char: '✦',
                                    color: e.isScoutFlyBy ? '#e6edf5' : e.color,
                                    isFlyByBullet: true
                                });
                                e.flyByShotsFired++;
                            }
                        } else if (e.pathType === 'weave') {
                            const oldX = e.x;
                            const oldY = e.y;
                            const weaveFrequency = e.weaveFrequency || 3.5;
                            const weaveAmplitude = e.weaveAmplitude || 150;
                            const weavePhase = e.weavePhase || 0;
                            const weaveVerticalSpeed = (e.weaveVerticalSpeed || 120) * e.speedMult;
                            const baseX = e.sideEntry ? (e.weaveOriginX || width * 0.5) : e.startX;
                            const baseY = e.sideEntry ? (e.weaveOriginY || e.startY) : e.startY;
                            const pathX = baseX + Math.sin(t * weaveFrequency + weavePhase) * weaveAmplitude;
                            const pathY = baseY + t * weaveVerticalSpeed;
                            if (e.sideEntry && t < (e.sideEntryDuration || 1.8)) {
                                const entryProgress = Math.max(0, Math.min(1, t / Math.max(0.01, e.sideEntryDuration || 1.8)));
                                const ease = 1 - Math.pow(1 - entryProgress, 3);
                                const arcLift = Math.sin(entryProgress * Math.PI) * height * 0.035;
                                nx = e.startX + (pathX - e.startX) * ease;
                                ny = e.startY + (pathY - e.startY) * ease - arcLift;
                            } else {
                                nx = pathX;
                                ny = pathY;
                            }
                            e.vx = (nx - oldX) / Math.max(0.001, dt);
                            e.vy = (ny - oldY) / Math.max(0.001, dt);
                        } else if (e.pathType === 'spiral') {
                            const r = Math.max(0, 450 - t * 45 * e.speedMult);
                            const theta = t * 2 + e.indexOffset;
                            nx = width/2 + r * Math.cos(theta);
                            ny = height/3 + r * Math.sin(theta);
                        } else if (e.pathType === 'arcCascade') {
                            const progress = Math.max(0, Math.min(1, (t * e.speedMult) / Math.max(0.01, e.routeDuration)));
                            const oldX = e.x;
                            const oldY = e.y;
                            const invProgress = 1 - progress;
                            const phase = e.arcPhase || 0;
                            const waveEase = Math.sin(progress * Math.PI);
                            nx = invProgress * invProgress * e.startX
                                + 2 * invProgress * progress * (e.arcControlX || width * 0.5)
                                + progress * progress * (e.arcEndX || width * 0.5)
                                + Math.sin(progress * Math.PI * 3.4 + phase) * (e.arcWaveAmpX || width * 0.04) * waveEase;
                            ny = invProgress * invProgress * e.startY
                                + 2 * invProgress * progress * (e.arcControlY || height * 0.15)
                                + progress * progress * (e.arcEndY || height * 0.28)
                                + Math.sin(progress * Math.PI * 2.2 + phase) * (e.arcWaveAmpY || height * 0.03) * waveEase;
                            e.vx = (nx - oldX) / Math.max(0.001, dt);
                            e.vy = (ny - oldY) / Math.max(0.001, dt);
                        } else if (e.pathType === 'orbitalDrift') {
                            const progress = Math.max(0, Math.min(1, (t * e.speedMult) / Math.max(0.01, e.routeDuration)));
                            const oldX = e.x;
                            const oldY = e.y;
                            const centerX = e.centerStartX + Math.sin(progress * Math.PI * 2 + (e.centerPhase || 0)) * (e.centerDriftX || 0);
                            const centerY = e.centerStartY + progress * (e.centerFall || height * 0.75) + Math.sin(progress * Math.PI * 3 + (e.centerPhase || 0)) * (e.centerBob || 0);
                            const orbitAngle = (e.orbitAngle || 0) + t * (e.orbitSpeed || 2.2) * e.speedMult;
                            nx = centerX + Math.cos(orbitAngle) * (e.orbitRadiusX || 54);
                            ny = centerY + Math.sin(orbitAngle) * (e.orbitRadiusY || 34);
                            e.vx = (nx - oldX) / Math.max(0.001, dt);
                            e.vy = (ny - oldY) / Math.max(0.001, dt);
                        } else if (e.pathType === 'laneSweep') {
                            const progress = Math.max(0, Math.min(1, (t * e.speedMult) / Math.max(0.01, e.routeDuration)));
                            const oldX = e.x;
                            const oldY = e.y;
                            const sweep = 0.5 - Math.cos(progress * Math.PI) * 0.5;
                            nx = e.startX + (e.endX - e.startX) * sweep;
                            ny = e.startY + (e.endY - e.startY) * progress + Math.sin(progress * Math.PI * 2 + (e.lanePhase || 0)) * (e.laneAmplitude || 0);
                            e.vx = (nx - oldX) / Math.max(0.001, dt);
                            e.vy = (ny - oldY) / Math.max(0.001, dt);
                        } else if (e.pathType === 'horizontalDrop') {
                            if (t < (e.horizontalHold || 2.5)) {
                                nx += (e.startX < width/2 ? 1 : -1) * (e.horizontalLateralSpeed || 180) * dt * e.speedMult;
                            } else {
                                ny += (e.horizontalDropSpeed || 250) * dt * e.speedMult;
                            }
                        } else if (e.pathType === 'risingStar') {
                            const progress = Math.max(0, Math.min(1, (t * e.speedMult) / Math.max(0.01, e.routeDuration)));
                            const riseProgress = Math.max(0, Math.min(1, t / Math.max(0.01, e.riseTime || 1.65)));
                            const riseEase = 1 - Math.pow(1 - riseProgress, 3);
                            const oldX = e.x;
                            const oldY = e.y;
                            const activeProgress = Math.max(0, (progress - 0.12) / 0.88);
                            const drift = Math.sin(activeProgress * Math.PI * 1.35 + (e.risePhase || 0)) * (e.riseDriftX || width * 0.06);
                            const shimmer = Math.sin((currentFrameNow || 0) * 0.01 + (e.risePhase || 0)) * 3 * riseProgress;
                            nx = (e.riseTargetX || e.startX) + drift * Math.min(1, activeProgress * 1.6) + shimmer;
                            ny = (e.riseTargetY || e.startY) + (1 - riseEase) * height * 0.085 + activeProgress * height * 0.22
                                + Math.sin(activeProgress * Math.PI * 2 + (e.risePhase || 0)) * height * 0.018;
                            e.risingProgress = riseProgress;
                            e.risingAlpha = 0.16 + riseEase * 0.84;
                            e.invulnerable = riseProgress < 1;
                            e.risingVulnerable = !e.invulnerable;
                            e.enemyShipVisualScale = (e.risingBaseVisualScale || 1.08) * (0.76 + riseEase * 0.24);
                            e.vx = (nx - oldX) / Math.max(0.001, dt);
                            e.vy = (ny - oldY) / Math.max(0.001, dt);
                        } else if (e.pathType === 'constellationSweep') {
                            const progress = Math.max(0, Math.min(1, (t * e.speedMult) / Math.max(0.01, e.routeDuration)));
                            const oldX = e.x;
                            const oldY = e.y;
                            const invProgress = 1 - progress;
                            const phase = e.constellationPhase || 0;
                            const loopEase = Math.sin(progress * Math.PI);
                            nx = invProgress * invProgress * e.startX
                                + 2 * invProgress * progress * (e.constellationControlX || width * 0.5)
                                + progress * progress * (e.constellationEndX || width * 0.5)
                                + Math.sin(progress * Math.PI * 4.2 + phase) * (e.constellationLoopAmp || width * 0.05) * loopEase;
                            ny = invProgress * invProgress * e.startY
                                + 2 * invProgress * progress * (e.constellationControlY || height * 0.16)
                                + progress * progress * (e.constellationEndY || height * 0.34)
                                + Math.cos(progress * Math.PI * 3.1 + phase) * height * 0.026 * loopEase;
                            e.vx = (nx - oldX) / Math.max(0.001, dt);
                            e.vy = (ny - oldY) / Math.max(0.001, dt);
                            if (e.constellationTrail && e.onScreen && Math.random() < 0.06) {
                                debris.push({
                                    x: nx + (Math.random() - 0.5) * 12,
                                    y: ny + (Math.random() - 0.5) * 10,
                                    vx: (Math.random() - 0.5) * 28,
                                    vy: (Math.random() - 0.5) * 28,
                                    char: Math.random() > 0.5 ? '.' : '+',
                                    color: Math.random() > 0.5 ? '#ff7bff' : '#8ff7ff',
                                    life: 0.2,
                                    isImpact: true
                                });
                            }
                        } else if (e.pathType === 'braidDive') {
                            const progress = Math.max(0, Math.min(1, (t * e.speedMult) / Math.max(0.01, e.routeDuration)));
                            const oldX = e.x;
                            const oldY = e.y;
                            const phase = e.braidPhase || 0;
                            const amplitude = (e.braidAmplitude || width * 0.22) * (0.78 + Math.sin(progress * Math.PI) * 0.24);
                            const braidSwing = Math.sin(progress * Math.PI * 2.45 + phase) * amplitude;
                            const signalKink = Math.sin(progress * Math.PI * 7.1 + phase) * width * 0.035 * Math.sin(progress * Math.PI);
                            const verticalRipple = Math.sin(progress * Math.PI * 5.2 + phase) * 14 * Math.sin(progress * Math.PI);
                            nx = width / 2 + (e.braidOffset || 0) * Math.cos(progress * Math.PI * 0.7) + braidSwing + signalKink;
                            ny = -70 + progress * height * 0.60 + verticalRipple;
                            e.vx = (nx - oldX) / Math.max(0.001, dt);
                            e.vy = (ny - oldY) / Math.max(0.001, dt);
                            if (e.braidTrail && e.onScreen && Math.random() < 0.09) {
                                debris.push({
                                    x: nx + (Math.random() - 0.5) * 10,
                                    y: ny + (Math.random() - 0.5) * 8,
                                    vx: -e.vx * 0.02 + (Math.random() - 0.5) * 35,
                                    vy: -e.vy * 0.02 + (Math.random() - 0.5) * 35,
                                    char: ['.', '+', '*'][Math.floor(Math.random() * 3)],
                                    color: Math.random() > 0.35 ? '#ff7bff' : '#8ff7ff',
                                    life: 0.22,
                                    isImpact: true
                                });
                            }
                        } else if (e.pathType === 'erraticScatter') {
                            if (t < 1) {
                                ny += 150 * dt;
                            } else if (t < 1.1) {
                                if (!e.scatterSet) {
                                    const scatterSpeed = e.scatterSpeed || 650;
                                    e.scatterVx = (Math.random() - 0.5) * scatterSpeed;
                                    e.scatterVy = (Math.random() - 0.5) * scatterSpeed;
                                    e.scatterSet = true;
                                }
                            } else {
                                nx += e.scatterVx * dt;
                                ny += e.scatterVy * dt;
                                if (nx < 20 || nx > width - 20) e.scatterVx *= -1;
                                if (ny < 20 || ny > height/2) e.scatterVy *= -1;
                            }
                        }
                        
                        const routeElapsed = (e.pathType === 'flyby' || e.pathType === 'braidDive' || e.pathType === 'arcCascade' || e.pathType === 'risingStar' || e.pathType === 'constellationSweep') ? t * e.speedMult : t;
                        if (e.routeDuration > 0 && routeElapsed >= e.routeDuration) {
                            resolveWaveEnemy(e);
                            enemies.splice(i, 1);
                            continue;
                        }

                        if (e.pathType !== 'flyby' && e.pathType !== 'braidDive') {
                            e.vx = nx - e.x;
                            e.vy = ny - e.y;
                        }
                        e.x = nx; e.y = ny;
                    }
                } else {
                    e.y += e.vy * dt; 
                }

                if (e.orbiterFireInterval && e.onScreen) {
                    e.fireTimer += dt;
                    if (e.fireTimer >= e.orbiterFireInterval * NON_BOSS_ENEMY_FIRE_INTERVAL_MULT) {
                        e.fireTimer = 0;
                        const dx = player.x - e.x;
                        const dy = player.y - e.y;
                        const dist = Math.max(1, Math.hypot(dx, dy));
                        pushVoidProjectile({
                            x: e.x,
                            y: e.y,
                            vx: (dx / dist) * (e.orbiterFireSpeed || 215),
                            vy: (dy / dist) * (e.orbiterFireSpeed || 215),
                            speed: e.orbiterFireSpeed || 215,
                            char: e.orbiterFireChar || '◦',
                            color: e.orbiterFireColor || '#e2ddff',
                            voidBulletSize: 20
                        });
                    }
                }

                if (e.isFlyBy && e.onScreen && isEnemyDamageable(e) && !player.godMode && player.invincibilityTimer <= 0) {
                    const hitboxR = 30 * getPlayerHitboxScale();
                    if (doesCircleHitTargetMask(player.x, player.y, hitboxR, e)) {
                        player.hp -= e.flyByDamage || 12;
                        addShake(18);
                        wobble = 1.0;
                        player.invincibilityTimer = 0.45 + player.modifiers.invincibility;
                        player.flashTimer = player.invincibilityTimer;
                        resolveWaveEnemy(e);
                        explodeEnemy(e);
                        enemies.splice(i, 1);
                        if (player.hp <= 0) {
                            gameState = 'DYING';
                            deathTimer = 0;
                            shake = 0;
                            fadeMusicForDeath();
                        }
                        continue;
                    }
                }
                
                if (e.y > height + 100) {
                    resolveWaveEnemy(e);
                    enemies.splice(i, 1);
                }
            }
            
            for (let i = drops.length - 1; i >= 0; i--) {
                const d = drops[i]; 
                
                if (d.isWeapon) {
                    // Magnet effect
                    const dx = player.x - d.x, dy = player.y - d.y;
                    const distSq = dx * dx + dy * dy;
                    const magnetRangeSq = 22500 * (1 + player.modifiers.magnet);
                    if (distSq < magnetRangeSq) {
                        const dist = Math.sqrt(distSq);
                        d.vx = (dx / dist) * 150;
                        d.vy = (dy / dist) * 150;
                    } else {
                        d.vx *= 0.95; // Dampen horizontal drift when outside magnet range
                        d.vy = 30;    // Steady downward drift
                    }

                    d.y += d.vy * dt; 
                    d.x += (d.vx || 0) * dt;

                    d.cycleTimer += dt;
                    if (d.cycleTimer >= 0.75) {
                        d.cycleTimer -= 0.75;
                        d.currentIndex = (d.currentIndex + 1) % d.options.length;
                    }

                    if (distSq < 2500) { // ~50px collection radius
                        let chosen = d.options[d.currentIndex];
                        const addedWeapon = addPlayerWeapon(chosen, 10);
                        if (addedWeapon) {
                            weaponWeights[chosen.name] *= 0.5;
                            addShake(15);
                            for(let k=0; k<20; k++) {
                                let a = Math.random() * Math.PI * 2;
                                let spd = 50 + Math.random() * 150;
                                debris.push({
                                    x: d.x, y: d.y, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd,
                                    char: '+', color: chosen.color, life: 1.0
                                });
                            }
                        }
                        drops.splice(i, 1);
                    } else if (d.y > height + 80) {
                        drops.splice(i, 1);
                    }
                } else {
                    d.y += d.vy * dt; 
                    d.x += (d.vx || 0) * dt;

                    const dropRestY = getDropRestY();
                    if (d.y > dropRestY) {
                        d.y = dropRestY;
                        d.vy = 0;
                        d.vx = Math.sin(currentFrameNow * 0.002) * 30;
                    }
                    
                    const dx = d.x - player.x, dy = d.y - player.y;
                    if (dx * dx + dy * dy < 3600) { 
                        if (d.isHealth) {
                            player.hp = Math.min(player.maxHp, player.hp + Math.ceil(player.maxHp * (d.healFraction || 0.10)));
                            for (let k = 0; k < 14; k++) {
                                const a = Math.random() * Math.PI * 2;
                                const spd = 40 + Math.random() * 120;
                                debris.push({
                                    x: d.x, y: d.y,
                                    vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
                                    char: Math.random() > 0.5 ? '+' : '□',
                                    color: Math.random() > 0.35 ? '#ffffff' : '#d11f34',
                                    life: 0.8
                                });
                            }
                        }
                        drops.splice(i, 1); addShake(20);
                    } else if (d.y > height + 60) drops.splice(i, 1);
                }
            }
            
            for (let i = debris.length - 1; i >= 0; i--) { 
                const d = debris[i]; d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= 0.98; d.vy *= 0.98; d.life -= dt * 0.9; 
                if (d.life <= 0) debris.splice(i, 1); 
            }
            shake *= 0.88;
        }
