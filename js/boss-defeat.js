        // Boss defeat freeze/explosion sequence and reward handoff.
        // Boss Defeat Sequence
        const BOSS_CINEMATIC_FIREWALL_CORE_SCALE = 3.8;
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

        let bossCinematic = null;
        let lastBossRenderSnapshot = null;

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
            } else if (sprite.length > 0) {
                const startX = bossObj.x - (sprite[0].length * charW) / 2;
                const startY = bossObj.y - (sprite.length * charH) / 2;
                for (let r = 0; r < sprite.length; r++) {
                    for (let c = 0; c < sprite[r].length; c++) {
                        if (sprite[r][c] !== ' ') {
                            recordBossRenderGlyph(entries, sprite[r][c], (startX + c * charW) | 0, (startY + r * charH) | 0, fallbackColor);
                        }
                    }
                }
            }

            if (bossObj && bossObj.name === 'OVERHEATING FIREWALL' && bossObj.phase === 'ACTIVE') {
                recordBossRenderGlyph(
                    entries,
                    '@',
                    bossObj.x,
                    bossObj.y + 20,
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

        function finalizeBossDefeat(defeatedBoss) {
            if (!defeatedBoss) return;

            explodeBoss(defeatedBoss);
            const opts = drawWeapons();
            drops.push({ x: defeatedBoss.x, y: defeatedBoss.y, vy: 30, vx: 0, isWeapon: true, options: opts, cycleTimer: 0, currentIndex: 0 });
            boss = null;
            WaveManager.waveDelay = 8.5;
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

        function maybeTriggerBossDeathCinematic(bossObj) {
            if (!bossObj || bossCinematic || bossObj.hp > 0) return false;
            bossObj.hp = 0;
            triggerBossCinematic(bossObj, () => finalizeBossDefeat(bossObj));
            return true;
        }

        function updateBossCinematic(now) {
            if (!bossCinematic) return;

            const elapsed = (now - bossCinematic.startTime) / 1000;
            bossCinematic.lastNow = now;
            const defeatedBoss = bossCinematic.defeatedBoss;

            if (!bossCinematic.hasExploded && defeatedBoss) {
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
