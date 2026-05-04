        // Boss defeat freeze/explosion sequence and reward handoff.
        // Boss Defeat Sequence
        const BOSS_CINEMATIC_FIREWALL_CORE_SCALE = 3.8;
        const FIREWALL_BOSS_RENDER_SCALE = 0.6;
        const FIREWALL_BOSS_CORE_FONT_SIZE = 58;
        const FIREWALL_BOSS_CORE_OFFSET_Y = 12;
        const FIREWALL_BOSS_EXPLOSION_DEBRIS_CAP = 240;
        const BOSS_EXPLOSION_DEBRIS_CAP_DEFAULT = 180;
        const BOSS_DEFEAT_BULLET_DISSOLVE_CAP = 60;
        const BOSS_DEFEAT_BULLET_SPARK_CAP = 24;
        const BOSS_DEFEAT_FREEZE_TIME = 1.0;
        const BOSS_DEFEAT_BOSS_FADE_OUT = 2.0;
        const BOSS_DEFEAT_BGM_DELAY = 1.0;
        const BOSS_DEFEAT_BGM_FADE_IN = 3.0;
        const BOSS_DEFEAT_BLINK_RATE = 0.085;
        const BOSS_DEFEAT_SHAKE_X = 11;
        const BOSS_DEFEAT_SHAKE_Y = 8;
        const BOSS_DEFEAT_EXPLOSION_GAIN = 0.5;
        const FIREWALL_CHAR_MAP = {' ':0, '░':1, '▒':2, '▓':3, '█':4};
        const FIREWALL_FIRE_CHARS = [' ', '░', '▒', '▓', '█'];

        const BOSS_EXPLOSION_PROFILES = {
            'NULL PHANTOM': {
                debrisCap: 200,
                preserveSourceColor: true,
                debrisLife: 1.65,
                debrisVelocity: 980,
                rings: [
                    { color: '#f6b5ff', maxRadius: 160, maxLife: 0.34, lineWidth: 5, shadowBlur: 16 },
                    { color: '#8f5cff', maxRadius: 235, maxLife: 0.52, lineWidth: 4, shadowBlur: 14 },
                    { color: '#ff4eda', maxRadius: 305, maxLife: 0.72, lineWidth: 3, shadowBlur: 12 }
                ],
                burstCount: 34,
                burstColors: ['#ffffff', '#f6b5ff', '#b98cff', '#ff4eda'],
                burstChars: ['*', '+', '#', '@']
            },
            'DISTORTED GLITCH': {
                debrisCap: 120,
                debrisLife: 1.35,
                debrisVelocity: 1120,
                rings: [
                    { color: '#00ff41', maxRadius: 145, maxLife: 0.3, lineWidth: 5, shadowBlur: 16 },
                    { color: '#ff00ff', maxRadius: 215, maxLife: 0.48, lineWidth: 3, shadowBlur: 12 }
                ],
                burstCount: 30,
                burstColors: ['#ffffff', '#00ff41', '#ff00ff', '#00ffff'],
                burstChars: ['#', '*', '+', 'x']
            },
            'GHOST SIGNAL': {
                debrisCap: 90,
                preserveSourceColor: true,
                debrisLife: 1.35,
                debrisVelocity: 940,
                rings: [
                    { color: '#f8fcff', maxRadius: 155, maxLife: 0.32, lineWidth: 5, shadowBlur: 16 },
                    { color: '#8fdcff', maxRadius: 230, maxLife: 0.5, lineWidth: 4, shadowBlur: 14 },
                    { color: '#b8c5ff', maxRadius: 300, maxLife: 0.7, lineWidth: 3, shadowBlur: 12 }
                ],
                burstCount: 24,
                burstColors: ['#ffffff', '#dff6ff', '#9edfff', '#b8c5ff'],
                burstChars: ['*', '+', '#', '.']
            },
            'OVERHEATING FIREWALL': {
                debrisCap: FIREWALL_BOSS_EXPLOSION_DEBRIS_CAP,
                debrisLife: 1.5,
                debrisVelocity: 1040,
                centerYOffset: FIREWALL_BOSS_CORE_OFFSET_Y,
                rings: [
                    { color: '#fff2a8', maxRadius: 170, maxLife: 0.32, lineWidth: 6, shadowBlur: 16 },
                    { color: '#ff7a18', maxRadius: 245, maxLife: 0.48, lineWidth: 4, shadowBlur: 14 },
                    { color: '#d91f11', maxRadius: 320, maxLife: 0.7, lineWidth: 3, shadowBlur: 12 }
                ],
                burstCount: 42,
                burstColors: ['#ffffff', '#fff2a8', '#ff7a18', '#ff2f12'],
                burstChars: ['*', '#', '+', 'x']
            },
            'BLACK VOID': {
                debrisCap: 150,
                debrisLife: 1.45,
                debrisVelocity: 900,
                rings: [
                    { color: '#e4e8ff', maxRadius: 150, maxLife: 0.34, lineWidth: 5, shadowBlur: 16 },
                    { color: '#806cff', maxRadius: 225, maxLife: 0.54, lineWidth: 4, shadowBlur: 14 },
                    { color: '#24294f', maxRadius: 315, maxLife: 0.78, lineWidth: 4, shadowBlur: 10 }
                ],
                burstCount: 30,
                burstColors: ['#ffffff', '#d7ddff', '#8170ff', '#2a315f'],
                burstChars: ['*', '#', '@', '+']
            },
            'BATTLE STARSHIP': {
                debrisCap: 220,
                debrisLife: 1.55,
                debrisVelocity: 1020,
                rings: [
                    { color: '#ffffff', maxRadius: 170, maxLife: 0.34, lineWidth: 5, shadowBlur: 18 },
                    { color: '#9be3ff', maxRadius: 250, maxLife: 0.54, lineWidth: 4, shadowBlur: 14 },
                    { color: '#5fa8ff', maxRadius: 340, maxLife: 0.78, lineWidth: 3, shadowBlur: 12 }
                ],
                burstCount: 38,
                burstColors: ['#ffffff', '#bff0ff', '#7ed4ff', '#5fa8ff'],
                burstChars: ['*', '#', '+', 'x']
            },
            'TURNBOUND TRINITY': {
                debrisCap: 210,
                preserveSourceColor: true,
                debrisLife: 1.5,
                debrisVelocity: 940,
                rings: [
                    { color: '#ffffff', maxRadius: 160, maxLife: 0.34, lineWidth: 5, shadowBlur: 16 },
                    { color: '#ffe27a', maxRadius: 230, maxLife: 0.52, lineWidth: 4, shadowBlur: 14 },
                    { color: '#b99dff', maxRadius: 315, maxLife: 0.74, lineWidth: 3, shadowBlur: 12 }
                ],
                burstCount: 36,
                burstColors: ['#ffffff', '#ffe27a', '#c8f4ff', '#b99dff'],
                burstChars: ['*', '+', '#', 'x']
            },
            'ECLIPSE WARDEN': {
                debrisCap: 165,
                preserveSourceColor: true,
                debrisLife: 1.45,
                debrisVelocity: 920,
                rings: [
                    { color: '#ffffff', maxRadius: 160, maxLife: 0.34, lineWidth: 5, shadowBlur: 16 },
                    { color: '#c8f4ff', maxRadius: 235, maxLife: 0.54, lineWidth: 4, shadowBlur: 14 },
                    { color: '#ff8df4', maxRadius: 315, maxLife: 0.76, lineWidth: 3, shadowBlur: 12 }
                ],
                burstCount: 32,
                burstColors: ['#ffffff', '#c8f4ff', '#ffe27a', '#ff8df4'],
                burstChars: ['◇', '◌', '*', '+']
            }
        };

        let bossCinematic = null;
        let lastBossRenderSnapshot = null;

        function getBossExplosionProfile(bossObj) {
            return BOSS_EXPLOSION_PROFILES[bossObj && bossObj.name] || {
                debrisCap: BOSS_EXPLOSION_DEBRIS_CAP_DEFAULT,
                debrisLife: 1.45,
                debrisVelocity: 980,
                rings: [
                    { color: '#ffffff', maxRadius: 150, maxLife: 0.34, lineWidth: 5, shadowBlur: 14 },
                    { color: '#ff6600', maxRadius: 230, maxLife: 0.52, lineWidth: 4, shadowBlur: 12 }
                ],
                burstCount: 28,
                burstColors: ['#ffffff', '#ffaa00', '#ff6600', '#ff2200'],
                burstChars: ['*', '#', '+', 'x']
            };
        }

        function recordBossRenderGlyph(entries, char, worldX, worldY, color, size = 1) {
            if (!entries) return;
            entries.push({ char, worldX, worldY, color, size });
        }

        function buildFallbackBossSnapshot(bossObj) {
            const entries = [];
            const sprite = bossObj && bossObj.sprite ? bossObj.sprite : [];
            const fallbackColor = bossObj && bossObj.flashTimer > 0 ? '#ffffff' : ((bossObj && bossObj.color) || '#ffffff');

            if (bossObj && bossObj.name === 'NULL PHANTOM' && sprite.length > 0) {
                const layout = getNullPhantomRenderLayout(bossObj);
                for (let r = 0; r < sprite.length; r++) {
                    for (let c = 0; c < sprite[r].length; c++) {
                        const char = sprite[r][c];
                        if (char !== ' ') {
                            const glyphPos = getNullPhantomGlyphPosition(layout, r, c);
                            recordBossRenderGlyph(
                                entries,
                                char,
                                glyphPos.x | 0,
                                glyphPos.y | 0,
                                bossObj.flashTimer > 0 ? '#ffffff' : getNullPhantomBodyColor(char),
                                layout.cubeScale
                            );
                        }
                    }
                }
            } else if (bossObj && bossObj.name === 'GHOST SIGNAL' && sprite.length > 0) {
                const layout = getGhostSignalRenderLayout(bossObj);
                for (let r = 0; r < sprite.length; r++) {
                    for (let c = 0; c < sprite[r].length; c++) {
                        const char = sprite[r][c];
                        if (char !== ' ') {
                            const glyphPos = getGhostSignalGlyphPosition(layout, r, c);
                            recordBossRenderGlyph(
                                entries,
                                char,
                                glyphPos.x | 0,
                                glyphPos.y | 0,
                                bossObj.flashTimer > 0 ? '#ffffff' : getGhostSignalBodyColor(char),
                                layout.cubeScale
                            );
                        }
                    }
                }
            } else if (bossObj && bossObj.isTurnboundTrinity && sprite.length > 0 && Array.isArray(bossObj.parts)) {
                const renderScale = bossObj.renderScale || 0.44;
                const cellW = charW * renderScale;
                const cellH = charH * renderScale;
                const spriteWidth = typeof TURNBOUND_TRINITY_SPRITE_WIDTH === 'number'
                    ? TURNBOUND_TRINITY_SPRITE_WIDTH
                    : (sprite[0] ? sprite[0].length : 0);
                const cells = typeof TURNBOUND_TRINITY_VISIBLE_CELLS !== 'undefined'
                    ? TURNBOUND_TRINITY_VISIBLE_CELLS
                    : buildSpriteVisibleCells(sprite);
                for (let p = 0; p < bossObj.parts.length; p++) {
                    const part = bossObj.parts[p];
                    const partColor = bossObj.flashTimer > 0 ? '#ffffff' : (part.color || fallbackColor);
                    const startX = part.x - (spriteWidth * cellW) / 2;
                    const startY = part.y - (sprite.length * cellH) / 2;
                    for (let i = 0; i < cells.length; i++) {
                        const cell = cells[i];
                        const row = sprite[cell.row] || '';
                        const char = row[cell.col];
                        if (!char || char === ' ') continue;
                        recordBossRenderGlyph(entries, char, (startX + cell.col * cellW) | 0, (startY + cell.row * cellH) | 0, partColor, renderScale);
                    }
                }
            } else if (sprite.length > 0) {
                const renderScale = bossObj && bossObj.name === 'OVERHEATING FIREWALL'
                    ? FIREWALL_BOSS_RENDER_SCALE
                    : (bossObj && bossObj.isBattleStarship ? (bossObj.renderScale || 0.55) : ((bossObj && bossObj.renderScale) || 1));
                const cellW = charW * renderScale;
                const cellH = charH * renderScale;
                const startX = bossObj.x - (sprite[0].length * cellW) / 2;
                const startY = bossObj.y - (sprite.length * cellH) / 2;
                for (let r = 0; r < sprite.length; r++) {
                    for (let c = 0; c < sprite[r].length; c++) {
                        if (sprite[r][c] !== ' ') {
                            recordBossRenderGlyph(entries, sprite[r][c], (startX + c * cellW) | 0, (startY + r * cellH) | 0, fallbackColor);
                        }
                    }
                }
            }

            if (bossObj && bossObj.name === 'OVERHEATING FIREWALL' && bossObj.phase === 'ACTIVE') {
                recordBossRenderGlyph(
                    entries,
                    '@',
                    bossObj.x,
                    bossObj.y + FIREWALL_BOSS_CORE_OFFSET_Y,
                    bossObj.isVulnerable ? '#00ffff' : '#ff0000',
                    BOSS_CINEMATIC_FIREWALL_CORE_SCALE
                );
            }

            if (entries.length === 0 && bossObj) {
                recordBossRenderGlyph(entries, '#', bossObj.x, bossObj.y, fallbackColor);
            }

            return {
                source: bossObj,
                centerX: bossObj ? bossObj.x : width / 2,
                centerY: bossObj ? bossObj.y : height / 2,
                entries
            };
        }

        function playExplosionSFX() {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            if (!bufBossExplosion) return;

            const source = audioCtx.createBufferSource();
            source.buffer = bufBossExplosion;

            const sfxGain = audioCtx.createGain();
            sfxGain.gain.value = BOSS_DEFEAT_EXPLOSION_GAIN;

            source.connect(sfxGain);
            sfxGain.connect(gainNode);

            source.onended = () => {
                try { source.disconnect(); } catch (e) {}
                try { sfxGain.disconnect(); } catch (e) {}
            };

            source.start(audioCtx.currentTime);
        }

        function playPlayerExplosionSFX() {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            if (!bufPlayerExplosion) return;

            const source = audioCtx.createBufferSource();
            source.buffer = bufPlayerExplosion;

            const sfxGain = audioCtx.createGain();
            sfxGain.gain.value = 0.5;

            source.connect(sfxGain);
            sfxGain.connect(gainNode);

            source.onended = () => {
                try { source.disconnect(); } catch (e) {}
                try { sfxGain.disconnect(); } catch (e) {}
            };

            source.start(audioCtx.currentTime);
        }

        function markBossBulletForDissolve(bullet, index) {
            if (!bullet) return;
            const startedAt = currentFrameNow || performance.now();
            const wasHuge = !!bullet.isHuge;
            bullet.isDyingBullet = true;
            bullet.harmless = true;
            bullet.isHuge = false;
            bullet.bossClearStart = startedAt;
            bullet.bossClearDuration = 0.42 + (index % 5) * 0.035;
            bullet.bossClearSize = wasHuge ? 34 : (bullet.isLargeFlame || bullet.isLargeWraith ? 30 : 22);
            bullet.bossClearChar = wasHuge ? '*' : (bullet.char || '✦');
            bullet.bossClearColor = bullet.color || '#ffffff';
            bullet.bossClearGlow = index < 36;
            bullet.vx = (bullet.vx || 0) * 0.14;
            bullet.vy = (bullet.vy || 0) * 0.14;
            bullet.life = 1;
            bullet.decay = 0;
        }

        function clearBossHazardsOnDeath(defeatedBoss) {
            if (!defeatedBoss || defeatedBoss.hazardsClearedOnDeath) return;
            defeatedBoss.hazardsClearedOnDeath = true;

            const originalBulletCount = enemyBullets.length;
            const retainedBullets = [];
            const sparkEvery = Math.max(1, Math.ceil(originalBulletCount / BOSS_DEFEAT_BULLET_SPARK_CAP));
            for (let i = 0; i < originalBulletCount; i++) {
                const b = enemyBullets[i];
                if (i < BOSS_DEFEAT_BULLET_DISSOLVE_CAP) {
                    markBossBulletForDissolve(b, i);
                    retainedBullets.push(b);
                }
                if (i < 32 || (i % sparkEvery === 0 && i / sparkEvery < BOSS_DEFEAT_BULLET_SPARK_CAP)) {
                    debris.push({
                        x: b.x,
                        y: b.y,
                        vx: (Math.random() - 0.5) * 95,
                        vy: (Math.random() - 0.5) * 95,
                        char: ['✦', '*', '·'][i % 3],
                        color: '#ffffff',
                        life: 0.18 + Math.random() * 0.18,
                        isImpact: true
                    });
                }
            }
            enemyBullets = retainedBullets;

            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                const belongsToBoss = enemy && (
                    enemy.isBossMinion ||
                    (defeatedBoss.name === 'GHOST SIGNAL' && enemy.isWraith)
                );
                if (!belongsToBoss) continue;

                resolveWaveEnemy(enemy);
                enemy.suppressComboReward = true;
                explodeEnemy(enemy);
                enemies.splice(i, 1);
            }

            if (originalBulletCount > 0 || enemies.length > 0) addShake(6);
        }

        function dropBossWeaponReward(defeatedBoss) {
            if (!defeatedBoss) return;
            const opts = drawWeapons();
            drops.push({
                x: defeatedBoss.x,
                y: defeatedBoss.y,
                vy: 30,
                vx: 0,
                isWeapon: true,
                options: opts,
                cycleTimer: 0,
                currentIndex: 0
            });
        }

        function finalizeBossDefeat(defeatedBoss) {
            if (!defeatedBoss) return;

            explodeBoss(defeatedBoss);
            recordRunBossDefeated();
            dropBossWeaponReward(defeatedBoss);
            if (typeof WaveManager !== 'undefined' && WaveManager.isFinalRunBoss && WaveManager.isFinalRunBoss(defeatedBoss)) {
                beginRunCompleteHandoff(defeatedBoss);
                return;
            }
            boss = null;
            WaveManager.waveDelay = 8.5;
            WaveManager.interWaveDelayQueued = true;
        }

        function teardownBossCinematic() {
            if (bossCinematic && bossCinematic.defeatedBoss && !bossCinematic.hasExploded) {
                bossCinematic.defeatedBoss.x = bossCinematic.baseX;
                bossCinematic.defeatedBoss.y = bossCinematic.baseY;
                bossCinematic.defeatedBoss.flashTimer = 0;
            }

            bossCinematic = null;
        }

        function triggerBossCinematic(defeatedBoss, onComplete) {
            if (!defeatedBoss || bossCinematic) return;

            if (bossMusicTimeout) {
                clearTimeout(bossMusicTimeout);
                bossMusicTimeout = null;
            }

            stopBossMusic(BOSS_DEFEAT_BOSS_FADE_OUT);
            const startTime = performance.now();
            bossCinematic = {
                defeatedBoss,
                onComplete,
                startTime,
                lastNow: startTime,
                baseX: defeatedBoss.x,
                baseY: defeatedBoss.y,
                paused: true,
                hasExploded: false,
                hasResumedMusic: false,
                bgmResumeAt: BOSS_DEFEAT_FREEZE_TIME + BOSS_DEFEAT_BGM_DELAY
            };

            lastTime = startTime;
            lastRafTime = startTime;
        }

        function updateBossCinematicDebris(dt) {
            if (dt <= 0) return;
            const drag = Math.pow(0.98, dt * 60);
            for (let i = debris.length - 1; i >= 0; i--) {
                const d = debris[i];
                d.x += d.vx * dt;
                d.y += d.vy * dt;
                d.vx *= drag;
                d.vy *= drag;
                d.life -= dt * 0.9;
                if (d.life <= 0) debris.splice(i, 1);
            }
        }

        function maybeTriggerBossDeathCinematic(bossObj) {
            if (!bossObj || bossCinematic || bossObj.hp > 0) return false;
            bossObj.hp = 0;
            clearBossHazardsOnDeath(bossObj);
            triggerBossCinematic(bossObj, () => finalizeBossDefeat(bossObj));
            return true;
        }

        function updateBossCinematic(now) {
            if (!bossCinematic) return;

            const elapsed = (now - bossCinematic.startTime) / 1000;
            const dt = Math.min((now - (bossCinematic.lastNow || now)) / 1000, 0.05);
            bossCinematic.lastNow = now;
            const defeatedBoss = bossCinematic.defeatedBoss;

            if (!bossCinematic.hasExploded && defeatedBoss) {
                updateBossCinematicDebris(dt);
                const blinkWhite = Math.floor(elapsed / BOSS_DEFEAT_BLINK_RATE) % 2 === 0;
                const shakeProgress = Math.min(1, elapsed / BOSS_DEFEAT_FREEZE_TIME);
                const shakeX = Math.sin(elapsed * 72) * BOSS_DEFEAT_SHAKE_X * shakeProgress + (Math.random() - 0.5) * 2.5;
                const shakeY = Math.cos(elapsed * 93) * BOSS_DEFEAT_SHAKE_Y * shakeProgress + (Math.random() - 0.5) * 2;

                defeatedBoss.x = bossCinematic.baseX + shakeX;
                defeatedBoss.y = bossCinematic.baseY + shakeY;
                defeatedBoss.flashTimer = blinkWhite ? BOSS_DEFEAT_BLINK_RATE * 1.5 : 0;

                if (elapsed >= BOSS_DEFEAT_FREEZE_TIME) {
                    defeatedBoss.x = bossCinematic.baseX;
                    defeatedBoss.y = bossCinematic.baseY;
                    defeatedBoss.flashTimer = 0;
                    lastBossRenderSnapshot = null;
                    bossCinematic.hasExploded = true;
                    playExplosionSFX();
                    if (bossCinematic.onComplete) bossCinematic.onComplete();
                    bossCinematic.paused = false;
                    lastTime = now;
                    lastRafTime = now;
                }
                return;
            }

            if (!bossCinematic.hasResumedMusic && elapsed >= bossCinematic.bgmResumeAt) {
                bossCinematic.hasResumedMusic = true;
                resumeMainMusic(BOSS_DEFEAT_BGM_FADE_IN);
                teardownBossCinematic();
            }
        }
