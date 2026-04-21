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

            // Player Physics & Firing
            let inputX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0), inputY = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
            if (inputX !== 0 && inputY !== 0) { inputX *= 0.707; inputY *= 0.707; }
            
            player.vx = (player.vx + inputX * P_ACCEL * (1 + player.modifiers.moveSpeed) * dt) * P_FRICTION;
            player.vy = (player.vy + inputY * P_ACCEL * (1 + player.modifiers.moveSpeed) * dt) * P_FRICTION;
            player.x = Math.max(50, Math.min(width - 50, player.x + player.vx * dt));
            player.y = Math.max(50, Math.min(getGameplayBottomLimit(50), player.y + player.vy * dt));
            applyWakeForce(player.x, player.y, 110, (Math.sqrt(player.vx * player.vx + player.vy * player.vy) / P_MAX_SPEED) * 14);
            const playerLayout = getPlayerRenderLayout(player);

            const actualFireRate = (player.fireRate / player.weaponStats.fireRateMult) / (1 + player.modifiers.fireRate);
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
                let baseDmg = (60 * s.damageMult + player.modifiers.laserDamage * 6) * dt;
                if (player.hp < player.maxHp * 0.5) baseDmg *= (1 + player.modifiers.adrenaline);

                const beamOrigin = getPlayerWeaponOrigin(playerLayout);
                const beamMetrics = getBeamMetrics(s.sizeMult, beamDeployFactor);
                const beamHitLength = beamMetrics.length * BEAM_HIT_LENGTH_MULT;
                const angles = getFirePatternAngles(s, beamBaseAngle, true);
                const activeBoss = boss && boss.phase === 'ACTIVE' ? boss : null;

                for (let angleIndex = 0; angleIndex < angles.length; angleIndex++) {
                    const a = angles[angleIndex];
                    let dx = Math.cos(a), dy = Math.sin(a);
                    let hitEnemies = [];
                    for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
                        const e = enemies[enemyIndex];
                        let ex = e.x - beamOrigin.x, ey = e.y - beamOrigin.y;
                        let t = ex * dx + ey * dy;
                        if (t > 0 && t <= beamHitLength) {
                            let px = beamOrigin.x + t * dx, py = beamOrigin.y + t * dy;
                            let distSq = (e.x - px)**2 + (e.y - py)**2;
                            let hitRadius = beamMetrics.halfWidth + getBeamTargetRadius(e);
                            if (distSq < hitRadius * hitRadius) hitEnemies.push({e, t});
                        }
                    }
                    if (activeBoss) {
                        const e = activeBoss;
                        let ex = e.x - beamOrigin.x, ey = e.y - beamOrigin.y;
                        let t = ex * dx + ey * dy;
                        if (t > 0 && t <= beamHitLength) {
                            let px = beamOrigin.x + t * dx, py = beamOrigin.y + t * dy;
                            let distSq = (e.x - px)**2 + (e.y - py)**2;
                            let hitRadius = beamMetrics.halfWidth + getBeamTargetRadius(e);
                            if (distSq < hitRadius * hitRadius) hitEnemies.push({e, t});
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
                        }
                        e.hp -= appliedDamage;
                        e.flashTimer = 0.15;
                        if (e === boss && maybeTriggerBossDeathCinematic(e)) return;
                        if (s.splashRadius > 0 && Math.random() < 0.1) {
                            radialExplosion(e.x, e.y, s.splashRadius * 22, baseDmg * s.splashDamagePercent * 5);
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
                        d.timer = 0.2 / player.weaponStats.fireRateMult / (1 + player.modifiers.fireRate) * 1.66;
                        const nearestInfo = findNearestActiveTarget(d.x, d.y);
                        const nearest = nearestInfo.target;
                        const minDist = nearestInfo.distSq;
                        if (nearest) {
                            let angle = Math.atan2(nearest.y - d.y, nearest.x - d.x);
                            let speed = 1000;
                            let droneDmg = (10 * player.weaponStats.damageMult + player.modifiers.laserDamage) * 0.3;
                            if (player.hp < player.maxHp * 0.5) droneDmg *= (1 + player.modifiers.adrenaline);
                            comboProjectiles.push({
                                x: d.x, y: d.y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
                                baseVx: Math.cos(angle)*speed, baseVy: Math.sin(angle)*speed, startX: d.x, startY: d.y,
                                sprite: '•', color: '#aa00ff',
                                stats: { ...player.weaponStats, sizeMult: 0.5, pierceCount: 0, splashRadius: 0, chainCount: 0, pathFunction: 'straight', homing: false },
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

                let shouldExplode = bomb.distance >= bomb.maxDistance || bomb.y < -80;
                if (!shouldExplode) {
                    for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
                        const e = enemies[enemyIndex];
                        if (!e.onScreen) continue;
                        const hitRadius = 18 + getBeamTargetRadius(e) * 0.42;
                        if ((bomb.x - e.x) * (bomb.x - e.x) + (bomb.y - e.y) * (bomb.y - e.y) < hitRadius * hitRadius) {
                            shouldExplode = true;
                            break;
                        }
                    }
                }

                if (!shouldExplode && boss && boss.phase === 'ACTIVE') {
                    if (boss.name === 'OVERHEATING FIREWALL') {
                        if (boss.isVulnerable) {
                            const dx = bomb.x - boss.x;
                            const dy = bomb.y - (boss.y + 20);
                            if (dx * dx + dy * dy < 65 * 65) shouldExplode = true;
                        }
                    } else {
                        const hitRadius = 18 + getBeamTargetRadius(boss) * 0.5;
                        const dx = bomb.x - boss.x;
                        const dy = bomb.y - boss.y;
                        if (dx * dx + dy * dy < hitRadius * hitRadius) shouldExplode = true;
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
                    player.xp += (orb.xpValue || 1);
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
                if (e.y > 0 && !e.isFlameGuardian && !e.isWraith && !e.isVoidSentinel && !e.disableRandomFire && Math.random() < 0.01) {
                    const dx = player.x - e.x, dy = player.y - e.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    enemyBullets.push({ x: e.x, y: e.y, vx: (dx/dist)*320, vy: (dy/dist)*320, char: 'o', color: '#ff00ff' });
                }
            }

            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i]; 
                
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
                const hitboxR = 30 * player.modifiers.hitbox;
                
                if (dx * dx + dy * dy < hitboxR * hitboxR * (b.decay ? Math.max(0.1, b.life) : 1)) {
                    if (player.invincibilityTimer <= 0) {
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
                            boss.hp = Math.min(boss.maxHp, boss.hp + boss.maxHp * 0.25);
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
                            const firewallIntroTargetY = 80 + (boss.sprite.length * charH) / 2;
                            const firewallIntroStartY = typeof boss.introStartY === 'number' ? boss.introStartY : -200;
                            const introProgress = Math.max(0, Math.min(1, boss.timer / firewallIntroDuration));
                            boss.y = firewallIntroStartY + (firewallIntroTargetY - firewallIntroStartY) * introProgress;
                        }

                        boss.timer += dt;
                        const introDuration = boss.name === 'GHOST SIGNAL' ? 7.5 : (boss.name === 'OVERHEATING FIREWALL' ? 6.9 : 4);
                        if (boss.name === 'GHOST SIGNAL' && boss.timer >= 5.0 && !boss.addsSpawned) {
                            boss.addsSpawned = true;
                            enemies.push(createGhostSignalWraith(-50, boss.y, 150, width * 0.2));
                            enemies.push(createGhostSignalWraith(width + 50, boss.y, -150, width * 0.8));
                        }
                        if (boss.timer > introDuration) {
                            if (boss.name === 'OVERHEATING FIREWALL') {
                                boss.y = 80 + (boss.sprite.length * charH) / 2;
                            } else if (boss.name === 'NULL PHANTOM') {
                                boss.y = (typeof boss.introStartY === 'number' ? boss.introStartY : -200) + 65 * introDuration + height * NULL_PHANTOM_REST_OFFSET_Y;
                            }
                            boss.phase = 'ACTIVE';
                            boss.timer = 0;
                            boss.color = boss.name === 'GHOST SIGNAL' ? '#00ffff' : (boss.name === 'OVERHEATING FIREWALL' ? '#ff6600' : '#ff00ff');
                            if (boss.name === 'OVERHEATING FIREWALL') {
                                boss.coreTimer = 3.0;
                                boss.isVulnerable = true;
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
                                    enemyBullets.push({ x: boss.x, y: boss.y, vx: (dx / dist) * 500, vy: (dy / dist) * 500, char: 'x', color: '#ff00ff', isPhantomBullet: true });
                                }
                            }
                        } else if (boss.name === 'GHOST SIGNAL') {
                            boss.driftTimer = (boss.driftTimer || 0) + dt;
                            boss.x = boss.startX + Math.sin(boss.driftTimer * 0.55) * GHOST_SIGNAL_DRIFT_X;
                            boss.y = boss.startY + Math.sin(boss.driftTimer * 1.15) * GHOST_SIGNAL_DRIFT_Y;
                            applyWakeForce(boss.x, boss.y, 180, 5);
                        } else if (boss.name === 'OVERHEATING FIREWALL') {
                            boss.driftTimer = (boss.driftTimer || 0) + dt;
                            boss.x = width / 2 + Math.sin(boss.driftTimer * 0.5) * 50;

                            if (Math.random() > 0.4) {
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
                            const numPatterns = boss.name === 'GHOST SIGNAL' ? 5 : 3;
                            boss.attackPattern = (boss.attackPattern + 1) % numPatterns;
                            boss.lastFire = 0;
                        }

                        const isPhantom = boss.name === 'NULL PHANTOM';
                        const fire = (vx, vy) => enemyBullets.push({ x: boss.x, y: boss.y, vx, vy, char: 'x', color: '#ff00ff', isPhantomBullet: isPhantom });

                        if (boss.name === 'OVERHEATING FIREWALL') {
                            const bossFire = (vx, vy, huge, isFlame) => enemyBullets.push({
                                x: boss.x,
                                y: boss.y + 20,
                                vx,
                                vy,
                                char: isFlame ? '\u274B' : '*',
                                color: isFlame ? '#e38914' : '#ff6600',
                                isHuge: huge,
                                isLargeFlame: isFlame,
                                life: huge ? 1.0 : 0,
                                decay: huge ? 0.6 : 0
                            });

                        const bossNow = currentFrameNow;
                        if (boss.attackPattern === 0 && bossNow - boss.lastFire > 800) {
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
                        if (boss.attackPattern === 0 && bossNow - boss.lastFire > 1000) {
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
                
                if (p.stats.homing) {
                    const nearestInfo = findNearestActiveTarget(p.x, p.y);
                    const nearest = nearestInfo.target;
                    const minDistSq = nearestInfo.distSq;
                    if (nearest) {
                        const dx = nearest.x - p.x, dy = nearest.y - p.y, dist = Math.sqrt(minDistSq);
                        const steerStr = 3000 * dt;
                        p.baseVx += (dx / dist) * steerStr;
                        p.baseVy += (dy / dist) * steerStr;
                        const speed = Math.sqrt(p.baseVx*p.baseVx + p.baseVy*p.baseVy);
                        const desiredSpeed = 1400 * p.stats.speedMult;
                        p.baseVx = (p.baseVx / speed) * desiredSpeed;
                        p.baseVy = (p.baseVy / speed) * desiredSpeed;
                    }
                }
                
                if (p.stats.pathFunction === 'sine') {
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
                
                applyWakeForce(p.x, p.y, 45, 6);
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
                let hitboxRadius = 20 * p.stats.sizeMult;
                if (p.stats.pathFunction === 'parabolic') hitboxRadius *= 1.5;

                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (!e.onScreen) continue;
                    if (p.pierceHits.includes(e)) continue;
                    
                    if (Math.abs(p.x - e.x) < hitboxRadius + 20 && Math.abs(p.y - e.y) < hitboxRadius + 20) {
                        e.hp -= p.damage;
                        p.pierceHits.push(e);
                        
                        if (p.stats.splashRadius > 0) {
                            radialExplosion(p.x, p.y, p.stats.splashRadius * 22, p.damage * p.stats.splashDamagePercent);
                            if (bossCinematic && bossCinematic.paused) return;
                        }
                        
                        if (p.stats.chainCount > 0) {
                            let nearest = null, minDist = Infinity;
                            for (let otherIndex = 0; otherIndex < enemies.length; otherIndex++) {
                                const other = enemies[otherIndex];
                                if (other === e) continue;
                                let distSq = (other.x - e.x)**2 + (other.y - e.y)**2;
                                if (distSq < 150*150 && distSq < minDist) { minDist = distSq; nearest = other; }
                            }
                            if (nearest) {
                                comboProjectiles.push({
                                    x: e.x, y: e.y,
                                    vx: (nearest.x - e.x) * 5, vy: (nearest.y - e.y) * 5,
                                    baseVx: (nearest.x - e.x) * 5, baseVy: (nearest.y - e.y) * 5,
                                    startX: e.x, startY: e.y,
                                    sprite: '⚡', color: '#00ffff',
                                    stats: { ...p.stats, chainCount: p.stats.chainCount - 1, splashRadius: 0 },
                                    life: 0.5, maxLife: 0.5, damage: p.damage * 0.5,
                                    pierceHits: [e], pierceCount: 0
                                });
                            }
                        }

                        for (let k = 0; k < 6 + Math.floor(Math.random() * 3); k++) {
                            const ang = Math.random() * Math.PI * 2; const spd = 60 + Math.random() * 40;
                            debris.push({ x: p.x, y: p.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, char: IMPACT_DEBRIS_CHARS[Math.floor(Math.random()*IMPACT_DEBRIS_CHARS.length)], color: IMPACT_DEBRIS_COLORS[Math.floor(Math.random()*IMPACT_DEBRIS_COLORS.length)], life: 0.2, isImpact: true });
                        }
                        if (e.hp <= 0) {
                            resolveWaveEnemy(e); explodeEnemy(e); enemies.splice(j, 1);
                        } else {
                            e.flashTimer = 0.15;
                        }
                        
                        if (p.pierceCount-- <= 0) { hit = true; break; }
                    }
                }
                if (!hit && boss && boss.phase === 'ACTIVE' && !p.pierceHits.includes(boss)) {
                    let hitBoss = false;
                    if (boss.name === 'OVERHEATING FIREWALL') {
                        if (boss.isVulnerable && Math.abs(p.x - boss.x) < 80 && Math.abs(p.y - (boss.y + 20)) < 80) {
                            boss.hp -= p.damage;
                            hitBoss = true;
                        } else if (!boss.isVulnerable && Math.abs(p.x - boss.x) < 120 && Math.abs(p.y - boss.y) < 120) {
                            hit = true;
                        }
                    } else if (Math.abs(p.x - boss.x) < 120 && Math.abs(p.y - boss.y) < 90) {
                        if (!boss.isDeadGlitching) {
                            const damageScale = getBlackVoidDamageScale(p.x, p.y);
                            boss.hp -= p.damage * damageScale;
                            if (damageScale < 1) absorbBlackVoidProjectile(p.x, p.y, 1);
                            hitBoss = true;
                        } else hit = true;
                    }
                    if (hitBoss) {
                        p.pierceHits.push(boss);
                        boss.flashTimer = 0.15;
                        if (maybeTriggerBossDeathCinematic(boss)) return;
                        if (p.stats.splashRadius > 0) {
                            radialExplosion(p.x, p.y, p.stats.splashRadius * 22, p.damage * p.stats.splashDamagePercent);
                            if (bossCinematic && bossCinematic.paused) return;
                        }
                        for (let k = 0; k < 6 + Math.floor(Math.random() * 3); k++) {
                            const ang = Math.random() * Math.PI * 2; const spd = 60 + Math.random() * 40;
                            debris.push({ x: p.x, y: p.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, char: ['·', '∙', '•', '░'][Math.floor(Math.random()*4)], color: ['#888888', '#666666', '#999999', '#aaaaaa'][Math.floor(Math.random()*4)], life: 0.2, isImpact: true });
                        }
                        if (p.pierceCount-- <= 0) hit = true;
                    }
                }
                if (hit || p.life <= 0 || p.y < -60 || p.y > height + 60 || p.x < -60 || p.x > width + 60) {
                    if (p.stats.pathFunction === 'parabolic') {
                        radialExplosion(p.x, p.y, p.stats.splashRadius * 22, p.damage * p.stats.splashDamagePercent);
                        if (bossCinematic && bossCinematic.paused) return;
                    }
                    comboProjectiles.splice(i, 1);
                }
            }

            if (!boss && WaveManager.pendingFormationUnits <= 0) {
                if (WaveManager.waveDelay > 0) {
                    WaveManager.waveDelay -= dt;
                } else {
                    WaveManager.spawn();
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
                    const fireInterval = e.voidAttackMode === 'anchor'
                        ? 2.2
                        : (e.voidAttackMode === 'cross' ? 1.55 : (e.voidAttackMode === 'cinder' ? 2.0 : 1.85));
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
                        thrusterParticles.push({
                            x: e.x + (Math.random() - 0.5) * 20, y: e.y - 18,
                            vx: (Math.random() - 0.5) * 42, vy: -56 - Math.random() * 36,
                            char: ['^', '*', '░', '▒'][Math.floor(Math.random() * 4)],
                            color: null, life: 1.0, isWraithFlame: true
                        });
                    }

                    if (e.fireTimer > 2.1) {
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

                if (e.isFlameGuardian) {
                    e.color = frameCount % 40 < 20 ? '#e38914' : '#e01926';
                    
                    if (Math.random() > 0.6) {
                        thrusterParticles.push({
                            x: e.x + (Math.random() - 0.5) * 20, y: e.y - 20,
                            vx: (Math.random() - 0.5) * 45, vy: -60 - Math.random() * 40,
                            char: ['^', '*', '░', '▒'][Math.floor(Math.random() * 4)],
                            color: null, life: 1.0, isGuardianFlame: true
                        });
                    }

                    e.fireTimer += dt;
                    if (e.fireTimer > 2.5) {
                        e.fireTimer = 0;
                        const dx = player.x - e.x, dy = player.y - e.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        enemyBullets.push({ x: e.x, y: e.y, vx: (dx/dist)*250, vy: (dy/dist)*250, char: '❋', color: '#e38914', isLargeFlame: true });
                    }
                    
                    // Allow Flame Guardian to follow path if one exists
                    if (!e.path) {
                        if (Math.abs(e.x - e.hoverX) > 5) e.x += e.vx * dt;
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
                            nx = e.startX + Math.sin(t * weaveFrequency + weavePhase) * weaveAmplitude;
                            ny = e.startY + t * weaveVerticalSpeed;
                            e.vx = (nx - oldX) / Math.max(0.001, dt);
                            e.vy = (ny - oldY) / Math.max(0.001, dt);
                        } else if (e.pathType === 'spiral') {
                            const r = Math.max(0, 450 - t * 45 * e.speedMult);
                            const theta = t * 2 + e.indexOffset;
                            nx = width/2 + r * Math.cos(theta);
                            ny = height/3 + r * Math.sin(theta);
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
                            if (t < 2.5) {
                                nx += (e.startX < width/2 ? 180 : -180) * dt * e.speedMult;
                            } else {
                                ny += 250 * dt * e.speedMult;
                            }
                        } else if (e.pathType === 'braidDive') {
                            const progress = Math.max(0, Math.min(1, (t * e.speedMult) / Math.max(0.01, e.routeDuration)));
                            const oldX = e.x;
                            const oldY = e.y;
                            const phase = e.braidPhase || 0;
                            const amplitude = (e.braidAmplitude || width * 0.16) + Math.sin(progress * Math.PI) * width * 0.10;
                            const braidSwing = Math.sin(progress * Math.PI * 3.2 + phase) * amplitude;
                            const peel = Math.max(0, (progress - 0.72) / 0.28);
                            const verticalRipple = Math.sin(progress * Math.PI * 6 + phase) * 18 * Math.sin(progress * Math.PI);
                            nx = width / 2 + (e.braidOffset || 0) + braidSwing + (e.braidLane || 1) * peel * peel * width * 0.20;
                            ny = -70 + progress * height * 0.72 + verticalRipple;
                            e.vx = (nx - oldX) / Math.max(0.001, dt);
                            e.vy = (ny - oldY) / Math.max(0.001, dt);
                        } else if (e.pathType === 'erraticScatter') {
                            if (t < 1) {
                                ny += 150 * dt;
                            } else if (t < 1.1) {
                                if (!e.scatterSet) {
                                    e.scatterVx = (Math.random() - 0.5) * 800;
                                    e.scatterVy = (Math.random() - 0.5) * 800;
                                    e.scatterSet = true;
                                }
                            } else {
                                nx += e.scatterVx * dt;
                                ny += e.scatterVy * dt;
                                if (nx < 20 || nx > width - 20) e.scatterVx *= -1;
                                if (ny < 20 || ny > height/2) e.scatterVy *= -1;
                            }
                        }
                        
                        const routeElapsed = (e.pathType === 'flyby' || e.pathType === 'braidDive') ? t * e.speedMult : t;
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
                    if (e.fireTimer >= e.orbiterFireInterval) {
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

                if (e.isFlyBy && e.onScreen && player.invincibilityTimer <= 0) {
                    const hitboxR = 30 * player.modifiers.hitbox;
                    const flyByCollisionX = e.flyByCollisionX || 34;
                    const flyByCollisionY = e.flyByCollisionY || 26;
                    if (Math.abs(e.x - player.x) < hitboxR + flyByCollisionX && Math.abs(e.y - player.y) < hitboxR + flyByCollisionY) {
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
                        d.currentIndex = (d.currentIndex + 1) % 3;
                    }

                    if (distSq < 2500) { // ~50px collection radius
                        let chosen = d.options[d.currentIndex];
                        applyWeapon(chosen);
                        if (player.weapons.length < 9) player.weapons.push(chosen);
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
