        // Canvas UI, menus, title screen, overlays, and frame rendering.
        function wrapPauseText(text, maxWidth, maxLines) {
            const words = String(text || '').split(/\s+/).filter(Boolean);
            const lines = [];
            let line = '';
            for (const word of words) {
                const testLine = line ? `${line} ${word}` : word;
                if (ctx.measureText(testLine).width <= maxWidth || !line) {
                    line = testLine;
                } else {
                    lines.push(line);
                    line = word;
                    if (lines.length >= maxLines) break;
                }
            }
            if (line && lines.length < maxLines) lines.push(line);
            return lines;
        }

        function blendProjectileHexColor(colorA, colorB, t) {
            const parse = (color) => {
                const hex = String(color || '').replace('#', '');
                if (hex.length !== 6) return { r: 255, g: 255, b: 255 };
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
                    return { r: 255, g: 255, b: 255 };
                }
                return { r, g, b };
            };
            const a = parse(colorA);
            const b = parse(colorB);
            const blend = Math.max(0, Math.min(1, t));
            const r = Math.round(a.r + (b.r - a.r) * blend).toString(16).padStart(2, '0');
            const g = Math.round(a.g + (b.g - a.g) * blend).toString(16).padStart(2, '0');
            const bChannel = Math.round(a.b + (b.b - a.b) * blend).toString(16).padStart(2, '0');
            return `#${r}${g}${bChannel}`;
        }

        function drawLightningBallProjectile(p, renderNow, scale) {
            const age = p.age || 0;
            const spin = age * (p.spinSpeed || 18) + renderNow * 0.01;
            const wobble = 0.92 + Math.sin(renderNow * 0.018 + age * 13) * 0.08;
            const flickerSeed = Math.sin(renderNow * 0.041 + age * 31) + Math.sin(renderNow * 0.073 + age * 19);
            const flicker = 0.78 + Math.max(0, flickerSeed) * 0.11;
            const plasmaScale = scale * wobble * flicker;

            ctx.save();
            ctx.translate(
                truncateSpriteCoord(p.x),
                truncateSpriteCoord(p.y)
            );
            ctx.scale(plasmaScale, plasmaScale);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled) {
                ctx.shadowColor = '#8ff7ff';
                ctx.shadowBlur = 18 + flicker * 7;
            }

            ctx.font = `bold 28px "Courier New", monospace`;
            ctx.fillStyle = 'rgba(93, 220, 255, 0.36)';
            ctx.fillText('O', -0.6, 0.4);
            ctx.fillStyle = '#f4ffff';
            ctx.fillText('O', 0, 0);

            const sparkChars = ['|', '/', '\\', '*'];
            ctx.font = `bold 10px "Courier New", monospace`;
            for (let i = 0; i < 4; i++) {
                const a = spin * 0.42 + i * Math.PI * 0.5 + Math.sin(renderNow * 0.017 + i) * 0.3;
                const r = 5.2 + Math.sin(renderNow * 0.023 + i * 2.1) * 1.5;
                ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 128, 255, 0.72)' : 'rgba(145, 248, 255, 0.78)';
                ctx.fillText(sparkChars[i], Math.cos(a) * r, Math.sin(a) * r);
            }

            ctx.rotate(spin);
            ctx.font = `bold ${Math.round(14 + flicker * 3)}px "Courier New", monospace`;
            ctx.fillStyle = '#ff9dff';
            if (glowEnabled) {
                ctx.shadowColor = '#ff7dff';
                ctx.shadowBlur = 14 + flicker * 10;
            }
            ctx.fillText('*', 0, 0);
            ctx.restore();
            ctx.shadowBlur = 0;
        }

        function drawPlasmaCloudProjectile(p, renderNow, scale) {
            const phase = renderNow * 0.006 + (p.visualSeed || 0);
            const pulse = 0.92 + Math.sin(phase * 1.7) * 0.08;
            const stormTick = Math.floor(renderNow / 85 + (p.visualSeed || 0));
            const fadeAlpha = getPlasmaCloudFadeAlpha(p);
            const cloudChars = ['~', 'o', '*', '.', '+'];
            const cells = [
                { x: -11, y: -5, a: 0.42 }, { x: 0, y: -9, a: 0.48 }, { x: 12, y: -5, a: 0.42 },
                { x: -17, y: 3, a: 0.34 }, { x: -5, y: 2, a: 0.58 }, { x: 7, y: 3, a: 0.54 }, { x: 18, y: 4, a: 0.32 },
                { x: -8, y: 11, a: 0.36 }, { x: 5, y: 12, a: 0.35 }
            ];

            ctx.save();
            ctx.translate(
                truncateSpriteCoord(p.x),
                truncateSpriteCoord(p.y)
            );
            ctx.scale(scale * pulse, scale * pulse);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled) {
                ctx.shadowColor = '#66f2ff';
                ctx.shadowBlur = 18 + Math.sin(phase * 2.4) * 4;
            }

            ctx.font = `bold 17px "Courier New", monospace`;
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                const driftX = Math.sin(phase + i * 1.7) * 1.6;
                const driftY = Math.cos(phase * 1.2 + i) * 1.2;
                const hot = (stormTick + i) % 5 === 0;
                ctx.globalAlpha = (hot ? 0.72 : cell.a) * fadeAlpha;
                ctx.fillStyle = hot ? '#f7fdff' : (i % 3 === 0 ? '#77e7ff' : '#9b7dff');
                ctx.fillText(cloudChars[(stormTick + i) % cloudChars.length], cell.x + driftX, cell.y + driftY);
            }

            ctx.globalAlpha = 0.56 * fadeAlpha;
            ctx.font = `bold 11px "Courier New", monospace`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(stormTick % 2 === 0 ? '/' : '\\', Math.sin(phase * 2.1) * 5, 0);
            ctx.fillText('*', Math.cos(phase * 1.4) * 7, Math.sin(phase * 1.9) * 5);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawMiniTorpedoProjectile(p, renderNow, scale) {
            const phase = renderNow * 0.014 + (p.visualSeed || 0);
            const pulse = 0.9 + Math.sin(phase) * 0.1;
            const angle = Math.atan2(p.baseVy || p.vy || -1, p.baseVx || p.vx || 0);

            ctx.save();
            ctx.translate(
                truncateSpriteCoord(p.x),
                truncateSpriteCoord(p.y)
            );
            ctx.rotate(angle + Math.PI / 2);
            ctx.scale(scale * pulse, scale * pulse);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled) {
                ctx.shadowColor = '#ffb347';
                ctx.shadowBlur = 14 + pulse * 6;
            }
            ctx.font = `bold 22px "Courier New", monospace`;
            ctx.fillStyle = '#fff1a8';
            ctx.fillText('o', 0, 0);
            ctx.font = `bold 10px "Courier New", monospace`;
            ctx.fillStyle = '#ff5f57';
            ctx.fillText('*', 0, 0);
            ctx.globalAlpha = 0.55;
            ctx.fillStyle = '#ffb347';
            ctx.fillText('.', -4 + Math.sin(phase) * 1.5, 11);
            ctx.fillText('.', 4 + Math.cos(phase) * 1.5, 15);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawEnemyBulletOrb(b, renderNow, color) {
            const seed = (b.x || 0) * 0.017 + (b.y || 0) * 0.013;
            const phase = renderNow * 0.008 + seed;
            const pulse = 1 + Math.sin(phase) * 0.08;
            const glint = Math.sin(phase * 1.7) > 0.2;
            const x = truncateSpriteCoord(b.x);
            const y = truncateSpriteCoord(b.y);
            drawFocusBulletTrailGlyph(b, '\u25cb', color, `bold 21px Courier New`, 0.82);

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(pulse, pulse);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (glowEnabled) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 8 + Math.sin(phase * 1.3) * 1.5;
            }
            ctx.font = `bold 21px Courier New`;
            ctx.globalAlpha = 0.84;
            ctx.fillStyle = color;
            ctx.fillText('\u25cb', 0, 0);

            ctx.shadowBlur = glowEnabled ? 4 : 0;
            ctx.font = `bold 12px Courier New`;
            ctx.globalAlpha = 0.68;
            ctx.fillText('\u25cf', 0, 0);

            ctx.shadowBlur = 0;
            ctx.font = `bold 9px Courier New`;
            ctx.globalAlpha = glint ? 0.64 : 0.34;
            ctx.fillStyle = '#ffffff';
            ctx.fillText('\u2022', 0, 0);

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function getProjectileRenderAngle(b) {
            return Math.atan2(b.vy || 0, b.vx || 1);
        }

        function getPlayerProjectileGlyphRotation(p) {
            let dx = 0;
            let dy = 0;
            if (Number.isFinite(p.prevX) && Number.isFinite(p.prevY)) {
                dx = p.x - p.prevX;
                dy = p.y - p.prevY;
            }
            if (Math.hypot(dx, dy) < 0.001) {
                dx = Number.isFinite(p.baseVx) ? p.baseVx : (Number.isFinite(p.vx) ? p.vx : 0);
                dy = Number.isFinite(p.baseVy) ? p.baseVy : (Number.isFinite(p.vy) ? p.vy : -1);
            }
            if (Math.hypot(dx, dy) < 0.001) return 0;
            return Math.atan2(dy, dx) + Math.PI / 2;
        }

        function drawBossGlyphLayer(char, fontSize, color, x = 0, y = 0, alpha = 1) {
            ctx.globalAlpha *= alpha;
            ctx.font = `bold ${Math.round(fontSize)}px Courier New`;
            ctx.fillStyle = color;
            ctx.fillText(char, x, y);
            ctx.globalAlpha /= alpha;
        }

        function getBossProjectileStyle(b, renderNow) {
            if (b.isPhantomBullet) return { char: '✧', core: '·', font: 25, coreFont: 10, color: '#ff69ff', coreColor: '#ffffff', glow: '#ff60ff' };
            if (b.isSignalPulse || b.isSignalYBullet) {
                if (b.signalBulletType === 'stormOrb') return { char: '◎', core: '*', font: 42, coreFont: 15, color: '#76f6ff', coreColor: '#ffffff', glow: '#7ffcff' };
                if (b.signalBulletType === 'wraithLarge') return { char: '✦', core: '·', font: 50, coreFont: 13, color: '#f4fbff', coreColor: '#c8ffff', glow: '#c8ffff' };
                if (b.signalBulletType === 'zigzag') return { char: '⌁', core: 'z', font: 28, coreFont: 12, color: '#dfffff', coreColor: '#00ffff', glow: '#7ffcff' };
                if (b.signalBulletType === 'fork' || b.isSignalYBullet) return { char: 'Y', core: '·', font: 38, coreFont: 10, color: '#ffe86b', coreColor: '#9fffff', glow: '#ffd400' };
                return { char: '◎', core: '·', font: 24, coreFont: 9, color: '#bfffff', coreColor: '#ffffff', glow: '#00ffff' };
            }
            if (b.isFirewallBullet) {
                if (b.firewallBulletType === 'cinder') return { char: '✶', core: '•', font: Math.max(18, 54 * Math.max(0.05, b.life || 1)), coreFont: 13, color: '#ff9a2f', coreColor: '#fff2a8', glow: '#ffaa18' };
                if (b.firewallBulletType === 'flame') return { char: '✦', core: '·', font: 27, coreFont: 9, color: Math.sin(renderNow * 0.004) > 0 ? '#e01926' : '#e38914', coreColor: '#fff2a8', glow: '#e38914' };
                return { char: '✦', core: null, font: 23, color: '#ff9a2f', glow: '#e38914' };
            }
            if (b.isStarshipBullet) {
                const scale = Math.max(0.05, b.life || 1);
                if (b.starshipBulletType === 'beam') return { char: b.char === '▓' ? '▓' : '█', core: null, font: Math.max(18, 58 * scale), color: b.char === '▓' ? '#ffaa18' : '#ffd84a', glow: '#ffd84a' };
                if (b.starshipBulletType === 'torpedo') return { char: '◉', core: '·', font: Math.max(20, 44 * scale), coreFont: 11, color: '#ff7a3d', coreColor: '#ffffff', glow: '#ff7a3d' };
                if (b.starshipBulletType === 'reactor') return { char: '✶', core: '*', font: 25, coreFont: 11, color: '#dff7ff', coreColor: '#9be3ff', glow: '#bff0ff' };
                if (b.starshipBulletType === 'cover') return { char: '✚', core: '·', font: 23, coreFont: 8, color: '#dff7ff', coreColor: '#5fa8ff', glow: '#9be3ff' };
                return { char: '▰', core: '═', font: 22, coreFont: 10, color: '#dff7ff', coreColor: '#5fa8ff', glow: '#9be3ff' };
            }
            if (b.isEclipseBullet) {
                const lineShot = b.char === '╎' || b.char === '╏' || b.char === '═';
                return {
                    char: lineShot ? b.char : (b.char || '◇'),
                    core: lineShot ? null : '●',
                    font: (b.voidBulletSize || 24) + (lineShot ? 4 : 2),
                    coreFont: Math.max(7, (b.voidBulletSize || 24) * 0.28),
                    color: b.color || '#c8f4ff',
                    coreColor: '#050610',
                    glow: b.color || '#c8f4ff'
                };
            }
            if (b.isGlitchBullet && !b.isCodeLine && b.color && b.color !== '#00ff41') {
                return { char: b.char || 'G', core: null, font: b.isHuge ? Math.max(22, 54 * Math.max(0.05, b.life || 1)) : 23, color: Math.sin(renderNow * 0.02 + b.x * 0.017) > 0 ? '#ffffff' : b.color, glow: b.color };
            }
            if (b.isGlitchBullet && !b.isCodeLine) {
                return { char: b.char || 'ﾊ', core: null, font: b.isHuge ? Math.max(22, 54 * Math.max(0.05, b.life || 1)) : 23, color: Math.sin(renderNow * 0.02 + b.x * 0.017) > 0 ? '#ffffff' : '#00ff41', glow: '#00ff41' };
            }
            if (b.isVoidProjectile) {
                return { char: b.char || '⟡', core: '•', font: b.voidBulletSize || 24, coreFont: Math.max(7, (b.voidBulletSize || 24) * 0.3), color: b.color || '#dbe0ff', coreColor: '#050610', glow: b.color || '#9d8bff' };
            }
            return null;
        }

        const BOSS_PROJECTILE_CORE_LIMIT = 56;
        const BOSS_PROJECTILE_GLOW_LIMIT = 32;
        const BOSS_PROJECTILE_CACHE_LIMIT = 128;
        const bossProjectileSpriteCache = new Map();

        function quantizeBossFontSize(fontSize) {
            const size = Math.max(7, Number(fontSize) || 20);
            const step = size > 44 ? 4 : 2;
            return Math.max(7, Math.round(size / step) * step);
        }

        function getBossProjectileSprite(style, useGlow, useCore) {
            const fontSize = quantizeBossFontSize(style.font);
            const coreFontSize = useCore ? quantizeBossFontSize(style.coreFont || 9) : 0;
            const key = [
                style.char,
                fontSize,
                style.color,
                useGlow ? style.glow || style.color : '',
                useCore ? style.core || '' : '',
                useCore ? coreFontSize : 0,
                useCore ? style.coreColor || '#ffffff' : ''
            ].join('|');
            const cached = bossProjectileSpriteCache.get(key);
            if (cached) return cached;

            if (bossProjectileSpriteCache.size > BOSS_PROJECTILE_CACHE_LIMIT) {
                bossProjectileSpriteCache.clear();
            }

            const canvas = document.createElement('canvas');
            const c = canvas.getContext('2d');
            c.font = `bold ${fontSize}px Courier New`;
            const primaryWidth = c.measureText(style.char).width;
            let coreWidth = 0;
            if (useCore) {
                c.font = `bold ${coreFontSize}px Courier New`;
                coreWidth = c.measureText(style.core).width;
            }

            const glowBlur = useGlow ? 10 : 0;
            const padding = Math.ceil(Math.max(6, glowBlur + 4, fontSize * 0.28));
            canvas.width = Math.ceil(Math.max(primaryWidth, coreWidth, fontSize) + padding * 2);
            canvas.height = Math.ceil(Math.max(fontSize * 1.45, coreFontSize * 1.45) + padding * 2);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.font = `bold ${fontSize}px Courier New`;
            c.fillStyle = style.color;
            if (useGlow) {
                c.shadowColor = style.glow || style.color;
                c.shadowBlur = glowBlur;
            }
            c.fillText(style.char, cx, cy);

            if (useCore) {
                c.shadowBlur = 0;
                c.font = `bold ${coreFontSize}px Courier New`;
                c.fillStyle = style.coreColor || '#ffffff';
                c.fillText(style.core, cx, cy);
            }

            const sprite = { canvas, cx, cy };
            bossProjectileSpriteCache.set(key, sprite);
            return sprite;
        }

        function drawBossProjectileFast(b, renderNow) {
            const style = getBossProjectileStyle(b, renderNow);
            if (!style) return false;
            const load = enemyBullets.length;
            const x = snapSpriteCoord(b.x);
            const y = snapSpriteCoord(b.y);
            const allowGlow = glowEnabled && load <= BOSS_PROJECTILE_GLOW_LIMIT && !b.isPhantomBullet;
            const allowCore = !!style.core && load <= (b.isPhantomBullet ? 12 : BOSS_PROJECTILE_CORE_LIMIT);
            const sprite = getBossProjectileSprite(style, allowGlow, allowCore);
            const focusTrail = getFocusTrailIntensity();
            if (focusTrail > 0.035) {
                for (let layer = 2; layer >= 1; layer--) {
                    const offset = getFocusTrailOffset(b, layer, 0.024);
                    ctx.save();
                    ctx.globalAlpha = focusTrail * (layer === 2 ? 0.09 : 0.15);
                    ctx.drawImage(sprite.canvas, x + offset.x - sprite.cx, y + offset.y - sprite.cy);
                    ctx.restore();
                }
            }
            ctx.drawImage(sprite.canvas, x - sprite.cx, y - sprite.cy);
            ctx.shadowBlur = 0;
            return true;
        }

        function drawNullPhantomBullet(b, renderNow) {
            const phase = renderNow * 0.011 + b.x * 0.019 + b.y * 0.013;
            const pulse = 0.88 + Math.sin(phase) * 0.12;
            ctx.save();
            ctx.translate(
                snapSpriteCoord(b.x),
                snapSpriteCoord(b.y)
            );
            ctx.rotate(getProjectileRenderAngle(b) + Math.sin(phase * 1.7) * 0.18);
            ctx.scale(pulse, pulse);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled) {
                ctx.shadowColor = '#ff60ff';
                ctx.shadowBlur = 18 + pulse * 8;
            }
            drawBossGlyphLayer('×', 34, 'rgba(255, 255, 255, 0.42)', -1, 1, 0.82);
            drawBossGlyphLayer('✧', 24, '#ff69ff');
            ctx.shadowBlur = glowEnabled ? 8 : 0;
            drawBossGlyphLayer('·', 13, '#ffffff');
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawSignalBossBullet(b, renderNow) {
            const type = b.signalBulletType || 'pulse';
            const phase = renderNow * 0.009 + b.x * 0.015;
            const pulse = 0.92 + Math.sin(phase) * 0.1;
            ctx.save();
            ctx.translate(
                snapSpriteCoord(b.x),
                snapSpriteCoord(b.y)
            );
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (type === 'zigzag') {
                ctx.rotate(getProjectileRenderAngle(b));
                if (glowEnabled) {
                    ctx.shadowColor = '#7ffcff';
                    ctx.shadowBlur = 18;
                }
                drawBossGlyphLayer('⌁', 30, '#eaffff');
                drawBossGlyphLayer('z', 17, '#00ffff', 0, 0, 0.62);
            } else if (type === 'fork') {
                ctx.rotate(getProjectileRenderAngle(b) - Math.PI / 2);
                if (glowEnabled) {
                    ctx.shadowColor = '#ffd400';
                    ctx.shadowBlur = 22;
                }
                drawBossGlyphLayer('Y', 43 * pulse, '#ffe86b');
                drawBossGlyphLayer('⌁', 18, '#9fffff', 0, -3, 0.72);
            } else {
                ctx.scale(pulse, pulse);
                if (glowEnabled) {
                    ctx.shadowColor = '#00ffff';
                    ctx.shadowBlur = 16 + pulse * 6;
                }
                drawBossGlyphLayer('◎', 25, '#bfffff');
                drawBossGlyphLayer('◌', 16, '#00ffff');
                drawBossGlyphLayer('·', 9, '#ffffff');
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawFirewallBossBullet(b, renderNow) {
            const type = b.firewallBulletType || (b.isLargeFlame ? 'flame' : 'spark');
            const phase = renderNow * 0.012 + b.x * 0.01 + b.y * 0.014;
            const pulse = 0.9 + Math.sin(phase) * 0.12;
            const scale = b.decay ? Math.max(0.05, b.life || 1) : 1;
            ctx.save();
            ctx.translate(
                snapSpriteCoord(b.x),
                snapSpriteCoord(b.y)
            );
            ctx.rotate(type === 'cinder' ? phase * 0.2 : getProjectileRenderAngle(b) + Math.PI / 2);
            ctx.scale(scale * pulse, scale * pulse);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled) {
                ctx.shadowColor = type === 'cinder' ? '#ffaa18' : '#e38914';
                ctx.shadowBlur = type === 'cinder' ? 28 : 18;
            }
            if (type === 'cinder') {
                drawBossGlyphLayer('✹', 78, '#fff0a8', 0, 0, 0.72);
                drawBossGlyphLayer('✶', 52, '#ff7a18');
                drawBossGlyphLayer('•', 18, '#d91f11');
            } else if (type === 'flame') {
                drawBossGlyphLayer('❋', 34, '#fff2a8', 0, 0, 0.45);
                drawBossGlyphLayer('✦', 25, Math.sin(phase) > 0 ? '#e01926' : '#e38914');
                drawBossGlyphLayer('·', 10, '#fff2a8', 0, 0, 0.75);
            } else {
                drawBossGlyphLayer('✦', 24, '#ff9a2f');
                drawBossGlyphLayer('·', 10, '#fff2a8');
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawStarshipBossBullet(b, renderNow) {
            const type = b.starshipBulletType || 'broadside';
            const phase = renderNow * 0.01 + b.x * 0.011;
            const scale = b.decay ? Math.max(0.05, b.life || 1) : 1;
            ctx.save();
            ctx.translate(
                snapSpriteCoord(b.x),
                snapSpriteCoord(b.y)
            );
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (type === 'beam') {
                ctx.scale(scale, scale);
                if (glowEnabled) {
                    ctx.shadowColor = '#ffd84a';
                    ctx.shadowBlur = 24;
                }
                drawBossGlyphLayer('█', 92, '#fff4a8', 0, 0, 0.54);
                drawBossGlyphLayer(b.char === '▓' ? '▓' : '█', 64, b.char === '▓' ? '#ffaa18' : '#ffd84a');
            } else if (type === 'torpedo') {
                ctx.rotate(getProjectileRenderAngle(b) + Math.PI / 2);
                ctx.scale(scale, scale);
                if (glowEnabled) {
                    ctx.shadowColor = '#ff7a3d';
                    ctx.shadowBlur = 26;
                }
                drawBossGlyphLayer('◎', 74, '#fff0bd', 0, 0, 0.7);
                drawBossGlyphLayer('◉', 48, '#ff7a3d');
                drawBossGlyphLayer('·', 14, '#ffffff');
            } else if (type === 'reactor') {
                ctx.rotate(phase * 0.35);
                if (glowEnabled) {
                    ctx.shadowColor = '#bff0ff';
                    ctx.shadowBlur = 18;
                }
                drawBossGlyphLayer('✶', 28, '#ffffff', 0, 0, 0.68);
                drawBossGlyphLayer('*', 17, '#9be3ff');
            } else if (type === 'cover') {
                ctx.rotate(getProjectileRenderAngle(b));
                if (glowEnabled) {
                    ctx.shadowColor = '#9be3ff';
                    ctx.shadowBlur = 15;
                }
                drawBossGlyphLayer('✚', 24, '#dff7ff');
                drawBossGlyphLayer('·', 9, '#5fa8ff');
            } else {
                ctx.rotate(getProjectileRenderAngle(b));
                if (glowEnabled) {
                    ctx.shadowColor = '#9be3ff';
                    ctx.shadowBlur = 14;
                }
                drawBossGlyphLayer('▰', 22, '#dff7ff');
                drawBossGlyphLayer('═', 13, '#5fa8ff');
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawVoidBossBullet(b, renderNow) {
            const phase = renderNow * 0.008 + b.x * 0.013 + b.y * 0.009;
            const pulse = 0.9 + Math.sin(phase) * 0.1;
            const size = b.voidBulletSize || 24;
            ctx.save();
            ctx.translate(
                snapSpriteCoord(b.x),
                snapSpriteCoord(b.y)
            );
            ctx.rotate(phase * 0.24);
            ctx.scale(pulse, pulse);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled) {
                ctx.shadowColor = b.color || '#9d8bff';
                ctx.shadowBlur = 18;
            }
            drawBossGlyphLayer('◌', size + 5, b.color || '#9d8bff', 0, 0, 0.58);
            drawBossGlyphLayer(b.char || '⟡', size, '#e6eaff');
            ctx.shadowBlur = glowEnabled ? 7 : 0;
            drawBossGlyphLayer('•', Math.max(8, size * 0.34), '#050610', 0, 0, 0.9);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawEclipseBossBullet(b, renderNow) {
            const phase = renderNow * 0.009 + b.x * 0.012;
            const pulse = 0.92 + Math.sin(phase) * 0.1;
            const lineShot = b.char === '╎' || b.char === '╏' || b.char === '═';
            const size = b.voidBulletSize || 24;
            ctx.save();
            ctx.translate(
                snapSpriteCoord(b.x),
                snapSpriteCoord(b.y)
            );
            ctx.rotate(lineShot ? getProjectileRenderAngle(b) + Math.PI / 2 : phase * 0.18);
            ctx.scale(pulse, pulse);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled) {
                ctx.shadowColor = b.color || '#c8f4ff';
                ctx.shadowBlur = 16;
            }
            if (lineShot) {
                drawBossGlyphLayer(b.char, size + 8, '#ffffff', 0, 0, 0.42);
                drawBossGlyphLayer(b.char, size, b.color || '#c8f4ff');
            } else {
                drawBossGlyphLayer('◇', size + 5, '#ffffff', 0, 0, 0.55);
                drawBossGlyphLayer(b.char || '◇', size, b.color || '#c8f4ff');
                drawBossGlyphLayer('●', Math.max(7, size * 0.28), '#050610', 0, 0, 0.72);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawGlitchBossBullet(b, renderNow) {
            if (b.isCodeLine) return false;
            const phase = renderNow * 0.02 + b.x * 0.017;
            const scale = b.isHuge ? Math.max(0.05, b.life || 1) : 1;
            ctx.save();
            ctx.translate(
                snapSpriteCoord(b.x),
                snapSpriteCoord(b.y)
            );
            ctx.rotate(getProjectileRenderAngle(b) + Math.sin(phase) * 0.22);
            ctx.scale(scale, scale);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled) {
                ctx.shadowColor = '#00ff41';
                ctx.shadowBlur = b.isHuge ? 28 : 18;
            }
            drawBossGlyphLayer('▓', b.isHuge ? 78 : 28, '#00ff41', Math.sin(phase) * 2, 0, 0.32);
            drawBossGlyphLayer(b.char || 'ﾊ', b.isHuge ? 62 : 21, Math.sin(phase * 1.7) > 0 ? '#ffffff' : '#00ff41');
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            return true;
        }

        function drawBossProjectileVisual(b, renderNow) {
            if (b.isCodeLine) return false;
            if (
                b.isPhantomBullet ||
                b.isSignalPulse ||
                b.isSignalYBullet ||
                b.isFirewallBullet ||
                b.isStarshipBullet ||
                b.isEclipseBullet ||
                b.isGlitchBullet ||
                b.isVoidProjectile
            ) {
                return drawBossProjectileFast(b, renderNow);
            }
            return false;
        }

        function drawChainLightningProjectile(p, renderNow) {
            const lifeRatio = Math.max(0, Math.min(1, p.life / (p.maxLife || 0.34)));
            const alpha = Math.min(1, lifeRatio * 1.9);
            const sx = snapSpriteCoord(p.startX ?? p.x);
            const sy = snapSpriteCoord(p.startY ?? p.y);
            const tx = snapSpriteCoord(p.targetX ?? p.x);
            const ty = snapSpriteCoord(p.targetY ?? p.y);
            const dx = tx - sx;
            const dy = ty - sy;
            const len = Math.max(1, Math.hypot(dx, dy));
            const nx = -dy / len;
            const ny = dx / len;
            const segments = Math.max(7, Math.min(18, Math.ceil(len / 18)));
            const seed = (p.jitterSeed || 0) + Math.floor(renderNow / 36) * 13;
            const points = [{ x: sx, y: sy }];
            for (let i = 1; i < segments; i++) {
                const t = i / segments;
                const jitter = (Math.sin(seed + i * 12.9898) * 0.5 + Math.cos(seed * 0.7 + i * 78.233) * 0.5) * 17 * (1 - Math.abs(t - 0.5) * 0.85);
                points.push({ x: sx + dx * t + nx * jitter, y: sy + dy * t + ny * jitter });
            }
            points.push({ x: tx, y: ty });
            const runeChars = ['<', '>', 'M'];

            function getBoltChar(a, index) {
                if (index % 4 === 2) return runeChars[(index + Math.floor(seed)) % runeChars.length];
                const s = Math.sin(a);
                const c = Math.cos(a);
                if (Math.abs(s) > Math.abs(c) * 1.35) return '|';
                return s * c >= 0 ? '\\' : '/';
            }

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let pass = 0; pass < 3; pass++) {
                const isFlash = pass === 0;
                ctx.font = `bold ${isFlash ? 24 : (pass === 1 ? 18 : 14)}px "Courier New", monospace`;
                ctx.fillStyle = isFlash ? 'rgba(255, 255, 255, 0.28)' : (pass === 1 ? '#f7feff' : '#75f4ff');
                if (glowEnabled) {
                    ctx.shadowColor = pass === 2 ? '#3fe8ff' : '#ffffff';
                    ctx.shadowBlur = isFlash ? 28 : (pass === 1 ? 20 : 10);
                }
                for (let i = 0; i < points.length - 1; i++) {
                    const a = Math.atan2(points[i + 1].y - points[i].y, points[i + 1].x - points[i].x);
                    const midX = (points[i].x + points[i + 1].x) * 0.5;
                    const midY = (points[i].y + points[i + 1].y) * 0.5;
                    const twitch = Math.sin(seed + i * 5.41 + renderNow * 0.03) * (isFlash ? 2.6 : 1.2);
                    ctx.save();
                    ctx.translate(
                        snapSpriteCoord(midX + nx * twitch),
                        snapSpriteCoord(midY + ny * twitch)
                    );
                    ctx.rotate((i % 4 === 2) ? 0 : a);
                    ctx.fillText(getBoltChar(a, i), 0, 0);
                    ctx.restore();
                }
            }

            ctx.globalAlpha = alpha * 0.72;
            ctx.font = `bold 13px "Courier New", monospace`;
            ctx.fillStyle = '#d8ffff';
            if (glowEnabled) {
                ctx.shadowColor = '#8ff7ff';
                ctx.shadowBlur = 18;
            }
            ctx.fillText(runeChars[Math.floor(seed) % runeChars.length], sx, sy);
            ctx.fillText(runeChars[(Math.floor(seed) + 1) % runeChars.length], tx, ty);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawChainLightningPowerupIcon(x, y, size, color, selected = false) {
            const scale = size / 28;
            const renderTime = selected ? currentFrameNow : 0;
            const jitterSeed = selected ? Math.floor(renderTime / 72) : 0;
            const chars = ['/', '\\', '/', '<', '>'];
            const bolts = [
                { x: -9, y: -9, r: -0.22, c: 0 },
                { x: -3, y: -3, r: 0.2, c: 1 },
                { x: 4, y: 3, r: -0.26, c: 2 },
                { x: 10, y: 9, r: 0.18, c: 1 }
            ];

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled) {
                ctx.shadowColor = color;
                ctx.shadowBlur = selected ? 14 : 11;
            }

            ctx.font = `bold 18px "Courier New", monospace`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
            for (const b of bolts) {
                ctx.save();
                ctx.translate(b.x * 1.12, b.y * 1.12);
                ctx.rotate(b.r);
                ctx.fillText(chars[b.c], 0, 0);
                ctx.restore();
            }

            ctx.font = `bold 18px "Courier New", monospace`;
            for (let i = 0; i < bolts.length; i++) {
                const b = bolts[i];
                const twitch = selected ? Math.sin(jitterSeed + i * 4.7 + renderTime * 0.025) * 0.8 : 0;
                ctx.fillStyle = i % 2 === 0 ? '#f7feff' : color;
                ctx.save();
                ctx.translate(b.x + twitch, b.y - twitch * 0.35);
                ctx.rotate(b.r);
                ctx.fillText(chars[b.c], 0, 0);
                ctx.restore();
            }

            ctx.font = `bold 9px "Courier New", monospace`;
            ctx.fillStyle = '#d8ffff';
            ctx.fillText(chars[(jitterSeed + 3) % chars.length], -13, -13);
            ctx.fillText(chars[(jitterSeed + 1) % chars.length], 13, 13);
            ctx.restore();
            ctx.shadowBlur = 0;
        }

        function drawPowerupIcon(powerup, x, y, size, selected = false) {
            const pattern = typeof getWeaponIconPattern === 'function' ? getWeaponIconPattern(powerup) : null;
            if (pattern) {
                const scale = size / 28;
                const pulse = selected ? 1 + Math.sin(currentFrameNow * 0.012) * 0.035 : 1;
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(scale * pulse, scale * pulse);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (let i = 0; i < pattern.length; i++) {
                    const part = pattern[i];
                    ctx.save();
                    ctx.translate(part.x || 0, part.y || 0);
                    if (part.rot) ctx.rotate(part.rot);
                    ctx.fillStyle = part.color || powerup.color;
                    if (glowEnabled) {
                        ctx.shadowColor = part.color || powerup.color;
                        ctx.shadowBlur = selected ? 12 : 7;
                    }
                    ctx.font = `bold ${part.size || 18}px Courier New`;
                    ctx.fillText(part.char, 0, 0);
                    ctx.restore();
                }
                ctx.restore();
                return;
            }
            ctx.fillText(powerup ? powerup.glyph : '', x, y);
        }

        function drawPauseHudPanel(x, y, w, h, accentColor = currentThemeColor, selected = false, options = {}) {
            const {
                rail = true,
                inner = true,
                fillAlpha = selected ? 0.72 : 0.58,
                borderAlpha = selected ? 0.76 : 0.42,
                edgeWashAlpha = selected ? 0.012 : 0.008,
                innerSheenAlpha = selected ? 0.006 : 0.004,
                flatFill = false
            } = options;
            let panelFill = `rgba(2, 8, 14, ${fillAlpha})`;
            if (!flatFill) {
                panelFill = ctx.createLinearGradient(x, 0, x + w, 0);
                panelFill.addColorStop(0, colorWithAlpha(accentColor, edgeWashAlpha));
                panelFill.addColorStop(0.48, `rgba(2, 8, 14, ${fillAlpha})`);
                panelFill.addColorStop(1, `rgba(2, 8, 14, ${Math.max(0.28, fillAlpha - 0.2)})`);
            }

            ctx.save();
            ctx.fillStyle = panelFill;
            ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
            ctx.fillStyle = colorWithAlpha('#ffffff', innerSheenAlpha);
            ctx.fillRect((x + 4) | 0, (y + 4) | 0, Math.max(0, w - 8) | 0, Math.max(0, h - 8) | 0);

            if (glowEnabled) {
                ctx.shadowColor = accentColor;
                ctx.shadowBlur = selected ? 13 : 6;
            }
            ctx.strokeStyle = colorWithAlpha(accentColor, borderAlpha);
            ctx.lineWidth = selected ? 2 : 1;
            ctx.strokeRect((x + 0.5) | 0, (y + 0.5) | 0, w | 0, h | 0);
            ctx.shadowBlur = 0;

            if (inner && w > 12 && h > 12) {
                ctx.strokeStyle = colorWithAlpha(accentColor, selected ? 0.22 : 0.11);
                ctx.lineWidth = 1;
                ctx.strokeRect((x + 5.5) | 0, (y + 5.5) | 0, Math.max(0, w - 11) | 0, Math.max(0, h - 11) | 0);
            }
            if (rail && h > 14) {
                ctx.fillStyle = colorWithAlpha(accentColor, selected ? 0.42 : 0.28);
                ctx.fillRect((x + 1) | 0, (y + 6) | 0, 2, Math.max(0, h - 12) | 0);
                if (glowEnabled) {
                    ctx.shadowColor = accentColor;
                    ctx.shadowBlur = selected ? 4 : 2;
                    ctx.fillRect((x + 1) | 0, (y + 6) | 0, 2, Math.max(0, h - 12) | 0);
                    ctx.shadowBlur = 0;
                }
            }
            ctx.restore();
        }

        function drawPausePowerupDetail(powerup, panelX, panelY, panelW) {
            if (!powerup) return;
            const panelH = 76;

            ctx.save();
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            drawPauseHudPanel(panelX, panelY, panelW, panelH, powerup.color, true, {
                fillAlpha: 0.78,
                borderAlpha: 0.76,
                rail: false,
                edgeWashAlpha: 0.006,
                innerSheenAlpha: 0.003
            });

            ctx.fillStyle = mixColor(powerup.color, '#ffffff', 0.18);
            ctx.font = `bold 14px 'Electrolize', sans-serif`;
            ctx.fillText(powerup.name, panelX + 12, panelY + 9);

            ctx.fillStyle = colorWithAlpha(mixColor(powerup.color, '#ffffff', 0.46), 0.82);
            ctx.font = `bold 10px Courier New`;
            ctx.fillText(powerup.cat.toUpperCase(), panelX + 12, panelY + 29);

            ctx.fillStyle = 'rgba(226, 240, 255, 0.92)';
            ctx.font = `12px 'Electrolize', sans-serif`;
            const descLines = wrapPauseText(powerup.desc, panelW - 24, 2);
            for (let i = 0; i < descLines.length; i++) {
                ctx.fillText(descLines[i], panelX + 12, panelY + 47 + i * 15);
            }
            ctx.restore();
        }

        const PAUSE_MENU_GLOW_COLOR = '#151b3f';
        const PAUSE_CURSOR_EXHAUST_ANCHORS = [
            { x: -18, y: 38, seed: 3 },
            { x: 18, y: 38, seed: 17 }
        ];
        const PAUSE_CURSOR_TRAIL_MAX = 72;

        function normalizePauseCursorAngle(angle) {
            while (angle > Math.PI) angle -= Math.PI * 2;
            while (angle < -Math.PI) angle += Math.PI * 2;
            return angle;
        }

        function lerpPauseCursorAngle(from, to, t) {
            return from + normalizePauseCursorAngle(to - from) * t;
        }

        function getPauseCursorParticleNoise(seed) {
            const x = Math.sin(seed * 12.9898) * 43758.5453;
            return x - Math.floor(x);
        }

        function drawPauseGlowText(text, x, y, font, color, selected = false) {
            ctx.save();
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.lineJoin = 'round';

            ctx.strokeStyle = 'rgba(2, 8, 14, 0.88)';
            ctx.shadowColor = 'rgba(2, 8, 14, 0.9)';
            ctx.globalAlpha = selected ? 0.82 : 0.42;
            ctx.shadowBlur = selected ? 24 : 10;
            ctx.lineWidth = selected ? 10 : 6;
            ctx.strokeText(text, x | 0, y | 0);

            ctx.globalAlpha = selected ? 0.72 : 0.28;
            ctx.shadowBlur = selected ? 10 : 4;
            ctx.lineWidth = selected ? 5 : 3;
            ctx.strokeText(text, x | 0, y | 0);

            ctx.globalAlpha = 1;
            if (glowEnabled) {
                ctx.shadowColor = selected ? color : PAUSE_MENU_GLOW_COLOR;
                ctx.shadowBlur = selected ? 18 : 7;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.fillStyle = color;
            ctx.fillText(text, x | 0, y | 0);
            ctx.restore();
        }

        function easePauseBarMaximize(t) {
            const clamped = Math.max(0, Math.min(1, t));
            return 1 - Math.pow(1 - clamped, 3);
        }

        function easePauseBarMinimize(t) {
            const clamped = Math.max(0, Math.min(1, t));
            return clamped * clamped;
        }

        function getHudWeaponGridCanvasRect() {
            if (typeof hudRefs !== 'undefined' && hudRefs.weaponGrid && typeof canvas !== 'undefined') {
                const gridRect = hudRefs.weaponGrid.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                if (gridRect.width > 0 && gridRect.height > 0 && canvasRect.width > 0 && canvasRect.height > 0) {
                    const sx = LOGICAL_W / canvasRect.width;
                    const sy = LOGICAL_H / canvasRect.height;
                    return {
                        x: (gridRect.left - canvasRect.left) * sx,
                        y: (gridRect.top - canvasRect.top) * sy,
                        w: gridRect.width * sx,
                        h: gridRect.height * sy
                    };
                }
            }
            const cell = Math.max(6, hudWeaponCellSize || 12);
            const gap = Math.max(1, Math.round(cell / 6));
            const pad = Math.max(3, Math.round(cell / 3));
            const w = cell * 5 + gap * 4 + pad * 2;
            const h = cell * 2 + gap + pad * 2;
            return {
                x: Math.round(width * 0.48 - w / 2),
                y: height - HUD_HEIGHT + Math.max(6, (HUD_HEIGHT - h) / 2),
                w,
                h
            };
        }

        function applyPausePowerupBarTransition(panelX, panelY, panelW, panelH) {
            const anim = pausePowerupBarAnim;
            const now = currentFrameNow || performance.now();
            const isClosing = anim.mode === 'closing';
            const duration = isClosing ? 135 : 340;
            const start = isClosing ? anim.closeTime : anim.startTime;
            const raw = start ? (now - start) / duration : 1;
            if (!isClosing && raw >= 1) anim.mode = 'idle';
            if (isClosing && raw >= 1) {
                anim.mode = 'idle';
                return false;
            }
            const mini = getHudWeaponGridCanvasRect();
            const t = isClosing ? 1 - easePauseBarMinimize(raw) : easePauseBarMaximize(raw);
            const x = mini.x + (panelX - mini.x) * t;
            const y = mini.y + (panelY - mini.y) * t;
            const w = mini.w + (panelW - mini.w) * t;
            const h = mini.h + (panelH - mini.h) * t;
            const sx = w / panelW;
            const sy = h / panelH;

            ctx.translate(x + w / 2, y + h / 2);
            ctx.scale(sx, sy);
            ctx.translate(-(panelX + panelW / 2), -(panelY + panelH / 2));
            ctx.globalAlpha *= Math.max(0.18, Math.min(1, 0.24 + t * 0.76));
            return true;
        }

        function getPauseCursorTargetForText(text, x, y, key) {
            ctx.save();
            ctx.font = `bold 28px 'Electrolize', sans-serif`;
            const metrics = ctx.measureText(text);
            const boxW = Math.max(1, metrics.width);
            ctx.restore();
            return {
                x: Math.max(32, x - boxW / 2 - 34),
                y: y - 1,
                faceX: x,
                faceY: y,
                scale: 0.34,
                key
            };
        }

        function updatePauseMenuShipCursor(target, now = currentFrameNow) {
            if (!target) return null;
            const cursor = pauseMenuShipCursor;
            const targetKey = target.key || '';
            const previousKey = cursor.targetKey || targetKey;
            const changedTarget = targetKey !== cursor.targetKey;
            const powerupToPowerup = String(previousKey).startsWith('powerup-') && String(targetKey).startsWith('powerup-');

            if (!cursor.initialized) {
                cursor.x = target.x;
                cursor.y = target.y;
                cursor.vx = 0;
                cursor.vy = 0;
                cursor.rot = Math.atan2(target.faceY - target.y, target.faceX - target.x) + Math.PI / 2;
                cursor.scale = target.scale || 0.34;
                cursor.settleBlend = 1;
                cursor.lastNow = now;
                cursor.targetKey = targetKey;
                cursor.routeKey = targetKey;
                cursor.approachComplete = true;
                cursor.initialized = true;
            } else if (changedTarget) {
                cursor.routeKey = previousKey;
                cursor.targetKey = targetKey;
                cursor.settleBlend = 0;
                cursor.approachComplete = powerupToPowerup || !Number.isFinite(target.approachX) || !Number.isFinite(target.approachY);
            }

            const dt = Math.min(0.05, Math.max(0.001, (now - (cursor.lastNow || now)) / 1000));
            cursor.lastNow = now;

            const activeTarget = { ...target };
            if (!cursor.approachComplete && Number.isFinite(target.approachX) && Number.isFinite(target.approachY)) {
                activeTarget.x = target.approachX;
                activeTarget.y = target.approachY;
                if (Math.hypot(activeTarget.x - cursor.x, activeTarget.y - cursor.y) < 15) {
                    cursor.approachComplete = true;
                    activeTarget.x = target.x;
                    activeTarget.y = target.y;
                }
            }

            const dx = activeTarget.x - cursor.x;
            const dy = activeTarget.y - cursor.y;
            cursor.vx += dx * 34 * dt;
            cursor.vy += dy * 34 * dt;

            const drag = Math.pow(0.0009, dt);
            cursor.vx *= drag;
            cursor.vy *= drag;
            const speed = Math.hypot(cursor.vx, cursor.vy);
            if (speed > 760) {
                const scale = 760 / speed;
                cursor.vx *= scale;
                cursor.vy *= scale;
            }

            cursor.x += cursor.vx * dt;
            cursor.y += cursor.vy * dt;
            cursor.scale += ((activeTarget.scale || 0.34) - cursor.scale) * Math.min(1, dt * 9);
            cursor.speed = Math.hypot(cursor.vx, cursor.vy);

            const distToTarget = Math.hypot(activeTarget.x - cursor.x, activeTarget.y - cursor.y);
            const isSettled = cursor.speed < 42 && distToTarget < 13;
            const isArriving = cursor.speed < 150 && distToTarget < 58;
            const settleRate = isSettled ? 2.8 : (isArriving ? 1.35 : -5);
            cursor.settleBlend = Math.max(0, Math.min(1, cursor.settleBlend + dt * settleRate));

            const travelRot = cursor.speed > 1
                ? Math.atan2(cursor.vy, cursor.vx) + Math.PI / 2
                : cursor.rot;
            const faceRot = Math.atan2(activeTarget.faceY - cursor.y, activeTarget.faceX - cursor.x) + Math.PI / 2;
            const distanceTravelWeight = Math.max(0, Math.min(1, (distToTarget - 16) / 65));
            const speedTravelWeight = Math.max(0, Math.min(1, (cursor.speed - 32) / 120));
            const travelWeight = distanceTravelWeight * speedTravelWeight * (1 - cursor.settleBlend * 0.65);
            const desiredRot = lerpPauseCursorAngle(faceRot, travelRot, travelWeight);
            const turnSpeed = isArriving ? 5.4 : 9;
            cursor.rot = normalizePauseCursorAngle(cursor.rot + normalizePauseCursorAngle(desiredRot - cursor.rot) * Math.min(1, dt * turnSpeed));

            const hover = cursor.settleBlend;
            return {
                x: cursor.x + Math.sin(now * 0.0047) * (2.2 + hover * 1.2),
                y: cursor.y + Math.cos(now * 0.0039) * (1.4 + hover * 1.4),
                rot: cursor.rot,
                scale: cursor.scale,
                speed: cursor.speed,
                dt
            };
        }

        function getPauseCursorWorldPoint(cursor, localX, localY) {
            const scaledX = localX * cursor.scale;
            const scaledY = localY * cursor.scale;
            const cos = Math.cos(cursor.rot);
            const sin = Math.sin(cursor.rot);
            return {
                x: cursor.x + scaledX * cos - scaledY * sin,
                y: cursor.y + scaledX * sin + scaledY * cos
            };
        }

        function emitPauseMenuShipExhaustTrail(cursor, now, speedRatio) {
            const state = pauseMenuShipCursor;
            const dt = Math.min(0.05, Math.max(0.001, cursor.dt || 0.016));
            state.trailEmitAcc += dt * (28 + speedRatio * 24);
            const emitCount = Math.min(3, Math.floor(state.trailEmitAcc));
            if (emitCount <= 0) return;
            state.trailEmitAcc -= emitCount;

            const behindX = -Math.sin(cursor.rot);
            const behindY = Math.cos(cursor.rot);
            const sideX = Math.cos(cursor.rot);
            const sideY = Math.sin(cursor.rot);

            for (let e = 0; e < emitCount; e++) {
                for (const anchor of PAUSE_CURSOR_EXHAUST_ANCHORS) {
                    const noise = getPauseCursorParticleNoise(now * 0.003 + e * 17.13 + anchor.seed);
                    const origin = getPauseCursorWorldPoint(cursor, anchor.x + (noise - 0.5) * 5, anchor.y + 15);
                    const sideDrift = (noise - 0.5) * (24 + speedRatio * 18);
                    const baseSpeed = 54 + speedRatio * 74;
                    state.trail.push({
                        x: origin.x,
                        y: origin.y,
                        vx: behindX * baseSpeed + sideX * sideDrift,
                        vy: behindY * baseSpeed + sideY * sideDrift,
                        life: 0.42 + noise * 0.12,
                        maxLife: 0.42 + noise * 0.12,
                        size: (16 + noise * 9) * cursor.scale * 1.08,
                        char: EXHAUST_PARTICLE_CHARS[(e + anchor.seed + Math.floor(now * 0.01)) % EXHAUST_PARTICLE_CHARS.length],
                        isSmoke: false
                    });

                    if ((e + anchor.seed + Math.floor(now * 0.02)) % 2 === 0) {
                        state.trail.push({
                            x: origin.x + sideX * sideDrift * 0.05,
                            y: origin.y + sideY * sideDrift * 0.05,
                            vx: behindX * (34 + speedRatio * 32) - sideX * sideDrift * 0.25,
                            vy: behindY * (34 + speedRatio * 32) - sideY * sideDrift * 0.25,
                            life: 0.72 + noise * 0.16,
                            maxLife: 0.72 + noise * 0.16,
                            size: (12 + noise * 7) * cursor.scale * 1.12,
                            char: SMOKE_PARTICLE_CHARS[(e + anchor.seed) % SMOKE_PARTICLE_CHARS.length],
                            color: SMOKE_PARTICLE_COLORS[(e + anchor.seed) % SMOKE_PARTICLE_COLORS.length],
                            isSmoke: true
                        });
                    }
                }
            }

            if (state.trail.length > PAUSE_CURSOR_TRAIL_MAX) {
                state.trail.splice(0, state.trail.length - PAUSE_CURSOR_TRAIL_MAX);
            }
        }

        function drawPauseMenuShipTrail(dt) {
            const trail = pauseMenuShipCursor.trail;
            if (!trail.length) return;
            const step = Math.min(0.05, Math.max(0.001, dt || 0.016));
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = trail.length - 1; i >= 0; i--) {
                const p = trail[i];
                p.life -= step;
                if (p.life <= 0) {
                    trail.splice(i, 1);
                    continue;
                }
                p.x += p.vx * step;
                p.y += p.vy * step;
                const drag = Math.pow(p.isSmoke ? 0.32 : 0.18, step);
                p.vx *= drag;
                p.vy *= drag;
                const lifeRatio = Math.max(0, p.life / p.maxLife);
                ctx.globalAlpha = lifeRatio * (p.isSmoke ? 0.22 : 0.72);
                ctx.fillStyle = p.isSmoke ? p.color : getExhaustColor(lifeRatio);
                if (!p.isSmoke && glowEnabled) {
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = 8 + lifeRatio * 8;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.font = `bold ${Math.max(8, p.size * (0.72 + lifeRatio * 0.38))}px Courier New`;
                ctx.fillText(p.char, p.x | 0, p.y | 0);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function getFocusTrailIntensity() {
            return typeof getFocusDriveRenderIntensity === 'function' ? getFocusDriveRenderIntensity() : 0;
        }

        function getFocusTrailOffset(obj, layer, amount = 0.034) {
            const intensity = getFocusTrailIntensity();
            const vx = obj && Number.isFinite(obj.vx) ? obj.vx : 0;
            const vy = obj && Number.isFinite(obj.vy) ? obj.vy : 0;
            const rawX = -vx * amount * layer * intensity;
            const rawY = -vy * amount * layer * intensity;
            const cap = 30 + layer * 18;
            const mag = Math.hypot(rawX, rawY);
            if (mag > cap && mag > 0) {
                const scale = cap / mag;
                return { x: rawX * scale, y: rawY * scale };
            }
            return { x: rawX, y: rawY };
        }

        function drawFocusBulletTrailGlyph(b, char, color, font, alphaScale = 1) {
            const intensity = getFocusTrailIntensity();
            if (intensity <= 0.035 || !b) return;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = font;
            ctx.fillStyle = colorWithAlpha(color || '#ffffff', 0.82);
            ctx.shadowBlur = 0;
            for (let layer = 2; layer >= 1; layer--) {
                const offset = getFocusTrailOffset(b, layer, 0.026);
                ctx.globalAlpha = intensity * alphaScale * (layer === 2 ? 0.11 : 0.18);
                ctx.fillText(
                    char,
                    truncateSpriteCoord((b.x || 0) + offset.x),
                    truncateSpriteCoord((b.y || 0) + offset.y)
                );
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawFocusEnemyTrail(e, flashColor = null) {
            const intensity = getFocusTrailIntensity();
            if (intensity <= 0.04 || !e || !e.sprite || e.sprite.length === 0) return;
            const trailColor = flashColor || e.enemyShipGlowColor || e.enemyShipBodyColor || e.color || currentThemeColor;
            for (let layer = 2; layer >= 1; layer--) {
                const offset = getFocusTrailOffset(e, layer, 0.024);
                ctx.save();
                ctx.globalAlpha *= intensity * (layer === 2 ? 0.10 : 0.16);
                ctx.translate(offset.x, offset.y);
                ctx.shadowBlur = 0;
                if (e.enemyShipSprite) {
                    drawEnemyShipSprite(e, colorWithAlpha(trailColor, 0.85));
                } else if (e.isFlyBy) {
                    const flyByScale = e.flyByScale || 1.55;
                    const localX = -(e.sprite[0].length * charW) / 2;
                    const localY = -(e.sprite.length * charH) / 2;
                    ctx.translate(snapSpriteCoord(e.x), snapSpriteCoord(e.y));
                    ctx.scale(flyByScale, flyByScale);
                    ctx.font = `bold 20px Courier New`;
                    drawAsciiSprite(e.sprite, localX, localY, colorWithAlpha(trailColor, 0.78));
                } else {
                    const renderScale = e.renderScale || 1;
                    const localX = -(e.sprite[0].length * charW) / 2;
                    const localY = -(e.sprite.length * charH) / 2;
                    ctx.translate(snapSpriteCoord(e.x), snapSpriteCoord(e.y));
                    if (renderScale !== 1) ctx.scale(renderScale, renderScale);
                    ctx.font = `bold 20px Courier New`;
                    drawAsciiSprite(e.sprite, localX, localY, colorWithAlpha(trailColor, 0.78));
                }
                ctx.restore();
            }
            ctx.globalAlpha = 1;
        }

        function drawFocusBossTrail(bossObj) {
            const intensity = getFocusTrailIntensity();
            if (intensity <= 0.04 || !bossObj || !bossObj.sprite || bossObj.sprite.length === 0) return;
            const scale = bossObj.name === 'OVERHEATING FIREWALL'
                ? FIREWALL_BOSS_RENDER_SCALE
                : (bossObj.isBattleStarship ? (bossObj.renderScale || 0.55) : (bossObj.renderScale || 1));
            const color = bossObj.flashTimer > 0 ? '#ffffff' : (bossObj.color || currentThemeColor);
            for (let layer = 2; layer >= 1; layer--) {
                const offset = getFocusTrailOffset(bossObj, layer, 0.018);
                const bSX = -(bossObj.sprite[0].length * charW) / 2;
                const bSY = -(bossObj.sprite.length * charH) / 2;
                ctx.save();
                ctx.globalAlpha *= intensity * (layer === 2 ? 0.08 : 0.13);
                ctx.translate(snapSpriteCoord(bossObj.x + offset.x), snapSpriteCoord(bossObj.y + offset.y));
                if (scale !== 1) ctx.scale(scale, scale);
                ctx.font = `bold 20px Courier New`;
                ctx.shadowBlur = 0;
                drawAsciiSprite(bossObj.sprite, bSX, bSY, colorWithAlpha(color, 0.75));
                ctx.restore();
            }
            ctx.globalAlpha = 1;
        }

        function drawFocusTimeWarpOverlay(renderNow, foreground = false) {
            const intensity = getFocusTrailIntensity();
            if (intensity <= 0.025) return;
            ctx.save();
            ctx.globalCompositeOperation = foreground ? 'screen' : 'source-over';
            const playfieldH = height - HUD_HEIGHT;
            if (!foreground) {
                ctx.globalAlpha = 0.05 * intensity;
                ctx.fillStyle = '#68ff9a';
                ctx.fillRect(0, 0, width, playfieldH);
                ctx.globalAlpha = 0.09 * intensity;
                ctx.strokeStyle = colorWithAlpha('#9effc1', 0.6);
                ctx.lineWidth = 1;
                for (let y = ((renderNow * 0.055) % 44) - 44; y < playfieldH; y += 44) {
                    const wobbleX = Math.sin(renderNow * 0.004 + y * 0.018) * 7 * intensity;
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width * 0.34 + wobbleX, y + 2);
                    ctx.lineTo(width * 0.68 - wobbleX, y - 2);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
            } else {
                ctx.globalAlpha = 0.06 * intensity;
                ctx.fillStyle = '#caffda';
                for (let x = ((renderNow * 0.028) % 96) - 96; x < width; x += 96) {
                    const topDrift = Math.sin(renderNow * 0.003 + x * 0.04) * 18 * intensity;
                    ctx.fillRect(x + topDrift, 0, 1, playfieldH);
                }
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawPauseMenuShipCursor(target) {
            const cursor = updatePauseMenuShipCursor(target, currentFrameNow);
            if (!cursor) return;
            const speedRatio = Math.min(1, cursor.speed / 420);

            drawPauseMenuShipTrail(cursor.dt);
            ctx.save();
            ctx.translate(cursor.x, cursor.y);
            ctx.rotate(cursor.rot);
            ctx.scale(cursor.scale, cursor.scale);
            PAUSE_CURSOR_SHIP.x = 0;
            PAUSE_CURSOR_SHIP.y = 0;
            PAUSE_CURSOR_SHIP.vx = 0;
            PAUSE_CURSOR_SHIP.vy = 0;
            PAUSE_CURSOR_SHIP.shipId = 'arrowhead';
            PAUSE_CURSOR_SHIP._renderLayoutCache = null;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#f4fbff';
            ctx.shadowColor = currentThemeColor;
            ctx.shadowBlur = glowEnabled ? 18 : 0;
            drawPlayerShip(PAUSE_CURSOR_SHIP, 'center');
            ctx.restore();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            emitPauseMenuShipExhaustTrail(cursor, currentFrameNow, speedRatio);
        }

        function drawPausePowerupBar(tableY = 62) {
            const slotCount = 10;
            const cols = 5;
            const cell = 42;
            const gap = 8;
            const tableW = cols * cell + (cols - 1) * gap;
            const tableH = 2 * cell + gap;
            const tableX = Math.round(width / 2 - tableW / 2);
            const focused = pauseSelection === -1 && player.weapons.length > 0;
            const selectedIndex = Math.max(0, Math.min(Math.max(0, player.weapons.length - 1), pausePowerupSelection));
            pausePowerupSelection = selectedIndex;
            const detailH = focused ? 86 : 0;
            const panelX = tableX - 14;
            const panelY = tableY - 30;
            const panelW = tableW + 28;
            const panelH = tableH + 44 + detailH;
            let cursorTarget = null;
            pausePowerupBarAnim.lastTableY = tableY;

            ctx.save();
            if (pausePowerupBarAnim.mode === 'opening' || pausePowerupBarAnim.mode === 'closing') {
                const shouldDraw = applyPausePowerupBarTransition(panelX, panelY, panelW, panelH);
                if (!shouldDraw) {
                    ctx.restore();
                    return null;
                }
            }
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            drawPauseHudPanel(panelX, panelY, panelW, panelH, currentThemeColor, focused, {
                fillAlpha: focused ? 0.78 : 0.72,
                borderAlpha: focused ? 0.78 : 0.5,
                rail: true,
                edgeWashAlpha: focused ? 0.008 : 0.005,
                innerSheenAlpha: focused ? 0.004 : 0.002,
                flatFill: true
            });

            ctx.fillStyle = focused
                ? mixColor(currentThemeColor, '#ffffff', 0.55)
                : colorWithAlpha(mixColor(currentThemeColor, '#ffffff', 0.32), 0.78);
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            drawPauseGlowText('POWERUPS', tableX + tableW / 2, tableY - 15, `bold 12px 'Electrolize', sans-serif`, ctx.fillStyle, focused);

            for (let i = 0; i < slotCount; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = tableX + col * (cell + gap);
                const y = tableY + row * (cell + gap);
                const powerup = player.weapons[i];
                const isSelected = focused && i === selectedIndex && !!powerup;
                if (isSelected) {
                    cursorTarget = {
                        x: x + cell - 5,
                        y: y + 5,
                        faceX: x + cell / 2,
                        faceY: y + cell / 2,
                        approachX: Math.max(34, tableX - 30),
                        approachY: y + cell / 2,
                        scale: 0.2,
                        key: `powerup-${selectedIndex}`
                    };
                }

                ctx.fillStyle = powerup ? 'rgba(210,235,255,0.09)' : 'rgba(210,235,255,0.13)';
                ctx.fillRect(x, y, cell, cell);
                ctx.strokeStyle = isSelected
                    ? mixColor(powerup.color, '#ffffff', 0.18)
                    : colorWithAlpha(currentThemeColor, powerup ? 0.28 : 0.18);
                ctx.lineWidth = isSelected ? 2.5 : 1;
                if (isSelected && glowEnabled) {
                    ctx.shadowColor = powerup.color;
                    ctx.shadowBlur = 14;
                }
                ctx.strokeRect(x, y, cell, cell);
                ctx.shadowBlur = 0;
                if (powerup) {
                    ctx.fillStyle = colorWithAlpha(powerup.color, isSelected ? 0.24 : 0.12);
                    ctx.fillRect(x + 1, y + 1, 2, cell - 2);
                }

                if (powerup) {
                    ctx.fillStyle = powerup.color;
                    const isChainLightning = powerup.icon === 'chainLightning';
                    const iconPulse = isSelected && !isChainLightning ? (0.5 + Math.sin(currentFrameNow * 0.012) * 0.5) : 0;
                    const iconSize = isSelected ? (isChainLightning ? 28 : Math.round(29 + iconPulse * 4)) : 28;
                    const iconSpin = isSelected && !isChainLightning ? Math.sin(currentFrameNow * 0.008) * 0.08 : 0;
                    ctx.font = `bold ${iconSize}px Courier New`;
                    if (glowEnabled) {
                        ctx.shadowColor = powerup.color;
                        ctx.shadowBlur = isSelected ? (isChainLightning ? 11 : 14 + iconPulse * 10) : 7;
                    }
                    if (isSelected) {
                        ctx.save();
                        ctx.translate(x + cell / 2, y + cell / 2 + 1);
                        ctx.rotate(iconSpin);
                        drawPowerupIcon(powerup, 0, 0, iconSize, true);
                        ctx.restore();
                    } else {
                        drawPowerupIcon(powerup, x + cell / 2, y + cell / 2 + 1, iconSize, false);
                    }
                    ctx.shadowBlur = 0;
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.16)';
                    ctx.font = `bold 22px Courier New`;
                    ctx.fillText('·', x + cell / 2, y + cell / 2);
                }
            }

            if (focused && player.weapons.length > 0) {
                drawPausePowerupDetail(player.weapons[selectedIndex], tableX, tableY + tableH + 14, tableW);
            }
            ctx.restore();
            return cursorTarget;
        }

        function drawPauseMenu() {
            const overlay = ctx.createLinearGradient(0, 0, 0, height);
            overlay.addColorStop(0, colorWithAlpha(currentBgColor, 0.66));
            overlay.addColorStop(0.5, 'rgba(5, 13, 28, 0.72)');
            overlay.addColorStop(1, colorWithAlpha(currentBgColor, 0.78));
            ctx.fillStyle = overlay;
            ctx.fillRect(0, 0, width | 0, height | 0);
            ctx.fillStyle = colorWithAlpha(currentThemeColor, 0.035);
            ctx.fillRect(0, 0, width | 0, height | 0);
            const midX = width / 2;
            let shipCursorTarget = null;

            if (pauseState === 'MAIN') {
                const options = ['RESUME', 'RESTART', 'VOLUME', 'SETTINGS', document.fullscreenElement ? 'EXIT FULLSCREEN' : 'FULLSCREEN', 'EXIT'];
                const pauseOptionGap = 74;
                const powerupDetailReserve = 86;
                const powerupPanelH = 2 * 42 + 8 + 44 + powerupDetailReserve;
                const powerupPanelBottomMargin = Math.max(122, Math.round(height * 0.145));
                const powerupTableY = Math.round(height - powerupPanelBottomMargin - powerupPanelH + 30);
                const powerupPanelTop = powerupTableY - 30;
                const textBlockH = (options.length - 1) * pauseOptionGap;
                const preferredMidY = Math.round(height * 0.235);
                const maxMidY = powerupPanelTop - 84 - textBlockH;
                const minMidY = Math.round(height * 0.16);
                const midY = Math.max(minMidY, Math.min(preferredMidY, maxMidY));
                shipCursorTarget = drawPausePowerupBar(powerupTableY);

                options.forEach((opt, i) => {
                    const isSel = pauseSelection === i;
                    const y = midY + i * pauseOptionGap;
                    const color = isSel
                        ? mixColor(currentThemeColor, '#ffffff', 0.62)
                        : colorWithAlpha(mixColor(currentThemeColor, '#dcecff', 0.34), 0.74);
                    if (isSel) shipCursorTarget = getPauseCursorTargetForText(opt, midX, y, `main-${i}`);
                    drawPauseGlowText(opt, midX, y, `bold 28px 'Electrolize', sans-serif`, color, isSel);

                    if (i === 2) {
                        const blocks = Math.round(currentVolume * 20);
                        const barStr = '▓'.repeat(blocks) + '░'.repeat(20 - blocks);
                        const muteStr = isMuted ? ' MUTE' : '';
                        const barY = (y + 25) | 0;
                        ctx.textAlign = 'left';
                        ctx.font = `bold 18px Courier New`;
                        const bracketW = ctx.measureText('[').width;
                        ctx.font = `bold 10px Courier New`;
                        const blockBarW = ctx.measureText(barStr).width;
                        const totalW = bracketW * 2 + blockBarW;
                        const startX = midX - totalW / 2;
                        ctx.fillStyle = color;
                        ctx.font = `bold 18px Courier New`;
                        ctx.fillText('[', startX | 0, barY);
                        ctx.font = `bold 10px Courier New`;
                        ctx.fillText(barStr, (startX + bracketW) | 0, barY);
                        ctx.font = `bold 18px Courier New`;
                        ctx.fillText(']' + muteStr, (startX + bracketW + blockBarW) | 0, barY);
                        ctx.textAlign = 'center';
                    }
                    ctx.shadowBlur = 0;
                });
                drawPauseMenuShipCursor(shipCursorTarget);
            } else if (pauseState === 'SETTINGS') {
                const options = [
                    'THEME: < ' + themes[currentThemeIndex] + ' >',
                    'SHOW FPS: < ' + (showFpsCounter ? 'ON' : 'OFF') + ' >',
                    'SHOW STATS: < ' + (showStatsPanel ? 'ON' : 'OFF') + ' >',
                    'FPS CAP 60: < ' + (userFpsCap ? 'ON' : 'OFF') + ' >',
                    'GLOW EFFECT: < ' + (glowEnabled ? 'ON' : 'OFF') + ' >',
                    'GO BACK'
                ];
                const midY = Math.round(height / 2 - ((options.length - 1) * 80) / 2 - 24);
                options.forEach((opt, i) => {
                    const isSel = settingsSelection === i;
                    const y = midY + i * 80;
                    const color = isSel
                        ? mixColor(currentThemeColor, '#ffffff', 0.62)
                        : colorWithAlpha(mixColor(currentThemeColor, '#dcecff', 0.34), 0.74);
                    if (isSel) shipCursorTarget = getPauseCursorTargetForText(opt, midX, y, `settings-${i}`);
                    drawPauseGlowText(opt, midX, y, `bold 28px 'Electrolize', sans-serif`, color, isSel);
                    ctx.shadowBlur = 0;
                });
                drawPauseMenuShipCursor(shipCursorTarget);
            }
        }

        function drawCard(x, y, w, h, opt, isSelected, alpha) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            const borderPulse = isSelected ? (Math.sin(currentFrameNow * 0.006) + 1) * 0.5 : 0;

            const scale = isSelected ? 1.08 : 1.0;
            const cx = x + w / 2;
            const cy = y + h / 2;
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);
            ctx.translate(-w / 2, -h / 2);

            drawPauseHudPanel(0, 0, w, h, opt.color, isSelected, {
                fillAlpha: isSelected ? 0.64 : 0.5,
                borderAlpha: isSelected ? 0.78 : 0.42,
                rail: false,
                edgeWashAlpha: isSelected ? 0.008 : 0.004,
                innerSheenAlpha: isSelected ? 0.004 : 0.002,
                flatFill: true
            });

            ctx.fillStyle = isSelected ? colorWithAlpha(opt.color, 0.13) : 'rgba(210,235,255,0.035)';
            ctx.fillRect(8, 8, w - 16, h - 16);

            if (isSelected) {
                ctx.shadowColor = opt.color;
                ctx.shadowBlur = 10 + borderPulse * 10;
            }
            ctx.strokeStyle = mixColor(opt.color, '#ffffff', isSelected ? 0.16 : 0.02);
            ctx.lineWidth = isSelected ? 3 : 1;
            ctx.strokeRect(0, 0, w, h);
            if (isSelected) {
                ctx.globalAlpha = alpha * (0.2 + borderPulse * 0.18);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(4, 4, w - 8, h - 8);
            }
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 0;

            ctx.fillStyle = mixColor(opt.color, '#ffffff', isSelected ? 0.16 : 0.04);
            ctx.font = `bold 16px 'Electrolize', sans-serif`;
             
            let words = opt.displayName.split(' '); 
            let lines = []; 
            let currentLine = words[0];
            for (let i = 1; i < words.length; i++) { 
                if (ctx.measureText(currentLine + " " + words[i]).width < w - 20) {
                    currentLine += " " + words[i]; 
                } else { 
                    lines.push(currentLine); 
                    currentLine = words[i]; 
                } 
            } 
            lines.push(currentLine);
             
            let ly = 40; 
            lines.forEach(line => { 
                ctx.fillText(line, w / 2, ly); ly += 20; 
            });

            ctx.fillStyle = getPowerupCategoryColor(opt.cat); 
            ctx.font = `14px 'Electrolize', sans-serif`; 
            ctx.fillText(`[${opt.cat}]`, w / 2, ly + 20);
             
            ctx.fillStyle = '#ffffff'; 
            let descWords = opt.desc.split(' '); 
            let descLine = ''; 
            let descLy = ly + 60;
            for(let n = 0; n < descWords.length; n++) { 
                let testLine = descLine + descWords[n] + ' '; 
                if (ctx.measureText(testLine).width > w - 20 && n > 0) { 
                    ctx.fillText(descLine, w / 2, descLy); 
                    descLine = descWords[n] + ' '; descLy += 20; 
                } else {
                    descLine = testLine; 
                }
            } 
            ctx.fillText(descLine, w / 2, descLy);
             
            ctx.fillStyle = opt.color; 
            ctx.font = `bold 18px Courier New`;
            let valStr;
            if (opt.type === 'multiplicative') valStr = `-${((1 - opt.value) * 100).toFixed(0)}%`;
            else if (opt.id === 'repair') valStr = `+${opt.value.toFixed(1)}/s`;
            else if (opt.id === 'shield') valStr = `+${opt.value.toFixed(2)}s`;
            else if (opt.id === 'target') valStr = `+${opt.value.toFixed(0)} DMG`;
            else if (opt.id === 'bioscrap') valStr = `+${(opt.value * 100).toFixed(2)}% HP/ORB`;
            else if (opt.id === 'bioleech') valStr = `+${(opt.value * 100).toFixed(1)}% HP/KILL`;
            else if (opt.id === 'glass') valStr = `+${(opt.value * 100).toFixed(0)}% / -${(opt.value * 60).toFixed(0)}% HP`;
            else if (opt.id === 'overflow') valStr = `+${(opt.value * 100).toFixed(0)}% XP`;
            else valStr = `+${(opt.value * 100).toFixed(0)}%`;
            ctx.fillText(valStr, w / 2, h - 25);
            ctx.restore();
        }

        function getPowerupCategoryColor(category) {
            if (category === 'Offense') return '#ff8d5b';
            if (category === 'Defense') return '#6fd9ff';
            if (category === 'Utility') return '#68ffb0';
            if (category === 'Risk') return '#ff72d9';
            return currentThemeColor;
        }

        function drawLevelUpHeader(progress = 1) {
            const title = `LEVEL UP: ${player.level}`;
            const titleX = width / 2;
            const clamped = Math.max(0, Math.min(1, progress));
            const easeOut = 1 - Math.pow(1 - clamped, 3);
            const settle = clamped < 0.92 ? easeOut : 1 + Math.sin((clamped - 0.92) / 0.08 * Math.PI) * 0.04;
            const titleY = height * 0.5 + (height * 0.15 - height * 0.5) * settle;
            const now = currentFrameNow;
            const pulse = (Math.sin(now * 0.006) + 1) * 0.5;
            const drift = Math.sin(now * 0.0032) * (1.2 + (1 - clamped) * 4.5);
            const scale = 1.7 - 0.7 * easeOut;
            const alpha = 0.35 + clamped * 0.65;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = alpha;
            ctx.translate(titleX, titleY);
            ctx.scale(scale, scale);
            ctx.translate(-titleX, -titleY);
            ctx.font = `bold 32px 'Electrolize', sans-serif`;
            const titleWidth = ctx.measureText(title).width;
            const accentSpan = titleWidth * 0.5 + 46;

            ctx.strokeStyle = colorWithAlpha(currentThemeColor, 0.28 + pulse * 0.16);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(titleX - accentSpan, titleY + 2);
            ctx.lineTo(titleX - titleWidth * 0.62, titleY + 2);
            ctx.moveTo(titleX + titleWidth * 0.62, titleY + 2);
            ctx.lineTo(titleX + accentSpan, titleY + 2);
            ctx.stroke();

            ctx.shadowColor = currentThemeColor;
            ctx.shadowBlur = 14 + pulse * 18;
            ctx.fillStyle = mixColor(currentThemeColor, '#ffffff', 0.26 + pulse * 0.22);
            ctx.fillText(title, titleX, titleY + drift);

            const shimmerX = titleX - titleWidth / 2 + ((Math.sin(now * 0.0022) + 1) * 0.5) * (titleWidth + 90) - 45;
            ctx.beginPath();
            ctx.rect(shimmerX, titleY - 28, 68, 56);
            ctx.clip();
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.42);
            ctx.fillText(title, titleX, titleY + drift);

            if (clamped < 0.3) {
                const burst = 1 - clamped / 0.3;
                ctx.globalAlpha = burst * 0.35;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, titleY - 42, width, 84);
            }
            ctx.restore();
        }

        function drawLevelUpMenu(dt) {
            ctx.fillStyle = currentBgColor + 'dd'; 
            ctx.fillRect(0, 0, width | 0, height | 0);
            if (levelUpState === 'INTRO') {
                levelUpTimer += dt;
                const introProgress = Math.max(0, Math.min(1, levelUpTimer / LEVELUP_INTRO_DURATION));
                drawLevelUpHeader(introProgress);

                offeredOptions.forEach((opt, i) => {
                    const baseX = width * (0.2 + i * 0.3);
                    const baseY = height * 0.5;
                    const panelDelay = i * 0.08;
                    const panelProgress = Math.max(0, Math.min(1, (introProgress - 0.22 - panelDelay) / 0.42));
                    const easedPanel = 1 - Math.pow(1 - panelProgress, 2.5);
                    const panelY = baseY + (1 - easedPanel) * 34;
                    drawCard(baseX - 90, panelY - 130, 180, 260, opt, selectedOptionIndex === i, panelProgress * 0.98);
                });

                if (levelUpTimer >= LEVELUP_INTRO_DURATION) {
                    levelUpState = 'OFFERING';
                    levelUpTimer = 0;
                }
            } else {
                drawLevelUpHeader();
            }
            
            if (levelUpState === 'OFFERING') {
                offeredOptions.forEach((opt, i) => { 
                    let cx = width * (0.2 + i * 0.3); 
                    let cy = height * 0.5; 
                    drawCard(cx - 90, cy - 130, 180, 260, opt, selectedOptionIndex === i, 1.0); 
                });
            } else if (levelUpState === 'ANIMATING') {
                levelUpTimer += dt; 
                let t = levelUpTimer / LEVELUP_ANIMATION_DURATION;
                offeredOptions.forEach((opt, i) => {
                    let startX = width * (0.2 + i * 0.3); 
                    let startY = height * 0.5;
                    if (i === selectedOptionIndex) {
                        let cx = startX + (width/2 - startX) * Math.min(1, t * 2); 
                        let flashAlpha = t > 0.8 ? 1 - (t - 0.8) * 5 : 0;
                        drawCard(cx - 90, startY - 130, 180, 260, opt, true, 1.0 - Math.max(0, (t - 0.8) * 5));
                        if (flashAlpha > 0) { 
                            ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`; 
                            ctx.fillRect(cx - 90, startY - 130, 180, 260); 
                        }
                    } else { 
                        drawCard(startX - 90, startY - 130, 180, 260, opt, false, Math.max(0, 1 - t * 5)); 
                    }
                });
                if (levelUpTimer > LEVELUP_ANIMATION_DURATION) { 
                    applyPowerup(offeredOptions[selectedOptionIndex]); 
                    if (queuedConsoleLevels > 0) {
                        queuedConsoleLevels--;
                        player.xp = 0;
                        player.level++;
                        player.xpNeeded = getXpNeededForLevel(player.level);
                        beginLevelUpOffer();
                    } else {
                        gameState = 'PLAYING'; 
                        applyCurrentVolume();
                    }
                }
            }
        }

        function getConsoleNotificationColor(kind) {
            if (kind === 'success') return '#77ffb0';
            if (kind === 'error') return '#ff7799';
            if (kind === 'warn') return '#ffd166';
            return '#8edbff';
        }

        function truncateConsoleLine(text, maxWidth) {
            if (ctx.measureText(text).width <= maxWidth) return text;
            let output = text;
            while (output.length > 1 && ctx.measureText(output + '...').width > maxWidth) {
                output = output.slice(0, -1);
            }
            return output + '...';
        }

        function drawConsoleOverlay() {
            const now = currentFrameNow;
            const referenceDisplay = consoleReferenceLines.slice(-14);
            const historyLines = consoleHistory.slice(-4);
            const notificationLines = consoleNotifications.slice(-3);
            const historyDisplay = historyLines.length > 0 ? historyLines : ['No recent commands'];
            const notificationDisplay = notificationLines.length > 0 ? notificationLines : [{ text: 'Console ready. Type help.', kind: 'info' }];
            const sectionGap = 8;
            const referenceLineHeight = 13;
            const historyLineHeight = 12;
            const notificationLineHeight = 13;
            const inputHeight = 36;
            const innerPad = 10;
            const bottomY = height - getHudOverlayInset(8);
            const overlayHeight = innerPad
                + (referenceDisplay.length > 0 ? referenceDisplay.length * referenceLineHeight + sectionGap : 0)
                + historyDisplay.length * historyLineHeight
                + sectionGap
                + notificationDisplay.length * notificationLineHeight
                + innerPad;
            const overlayY = bottomY - inputHeight - overlayHeight;
            const textLeft = 16;
            const maxTextWidth = width - textLeft - 16;

            ctx.save();
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
            ctx.fillRect(0, overlayY, width, overlayHeight);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.22)';
            ctx.beginPath();
            ctx.moveTo(0, overlayY);
            ctx.lineTo(width, overlayY);
            ctx.stroke();

            let y = overlayY + innerPad;

            if (referenceDisplay.length > 0) {
                ctx.font = '11px Courier New';
                for (const line of referenceDisplay) {
                    ctx.fillStyle = 'rgba(170, 235, 255, 0.82)';
                    ctx.fillText(truncateConsoleLine(line, maxTextWidth), textLeft, y);
                    y += referenceLineHeight;
                }
                y += sectionGap;
            }

            ctx.font = '11px Courier New';
            for (const line of historyDisplay) {
                const rawText = historyLines.length > 0 ? `> ${line}` : line;
                ctx.fillStyle = historyLines.length > 0 ? 'rgba(220, 230, 255, 0.64)' : 'rgba(220, 230, 255, 0.38)';
                ctx.fillText(truncateConsoleLine(rawText, maxTextWidth), textLeft, y);
                y += historyLineHeight;
            }

            y += sectionGap;
            ctx.font = '11px Courier New';
            for (const entry of notificationDisplay) {
                ctx.fillStyle = notificationLines.length > 0 ? getConsoleNotificationColor(entry.kind) : 'rgba(142, 219, 255, 0.58)';
                ctx.fillText(truncateConsoleLine(entry.text, maxTextWidth), textLeft, y);
                y += notificationLineHeight;
            }

            ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
            ctx.fillRect(0, bottomY - inputHeight, width, inputHeight);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.35)';
            ctx.beginPath();
            ctx.moveTo(0, bottomY - inputHeight);
            ctx.lineTo(width, bottomY - inputHeight);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Courier New';
            ctx.textBaseline = 'middle';
            ctx.fillText('> ' + consoleInput + (Math.floor(now / 500) % 2 ? '_' : ''), 15, bottomY - inputHeight / 2);
            ctx.restore();
        }

        function drawTitleLogo(alpha, now) {
            const logoY = height * 0.25;
            const logoHeight = TITLE_LOGO.length * charH;
            const pulse = 0.72 + Math.sin(now * 0.0026) * 0.18;
            const shimmerPhase = (now * 0.00016) % 1;
            const shimmerWidth = Math.min(width * 0.26, 170);
            const shimmerCenterX = width * (-0.18 + shimmerPhase * 1.36);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = `bold ${FONT_SIZE}px Courier New`;
            ctx.shadowBlur = glowEnabled ? (8 + pulse * 5) : 0;

            for (let i = 0; i < TITLE_LOGO.length; i++) {
                const t = i / Math.max(1, TITLE_LOGO.length - 1);
                const r = Math.round(255 * (1 - t * 0.9));
                const g = Math.round(70 + 155 * t);
                const b = 255;
                const lineColor = `rgb(${r}, ${g}, ${b})`;
                ctx.fillStyle = lineColor;
                ctx.shadowColor = lineColor;
                ctx.fillText(TITLE_LOGO[i], (width / 2) | 0, (logoY + i * charH) | 0);
            }

            ctx.save();
            ctx.beginPath();
            ctx.rect(shimmerCenterX - shimmerWidth / 2, logoY - charH, shimmerWidth, logoHeight + charH * 1.5);
            ctx.clip();
            ctx.globalAlpha = alpha * (0.18 + pulse * 0.08);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#9cfbff';
            ctx.shadowBlur = glowEnabled ? 14 : 0;
            for (let i = 0; i < TITLE_LOGO.length; i++) {
                ctx.fillText(TITLE_LOGO[i], (width / 2) | 0, (logoY + i * charH) | 0);
            }
            ctx.restore();

            ctx.restore();
        }

        function drawTitleLoadingBar(progress, alpha, now) {
            const clamped = Math.max(0, Math.min(1, progress));
            const barW = Math.min(340, width * 0.48);
            const barH = 18;
            const x = (width - barW) / 2;
            const y = height * 0.595;
            const innerPad = 3;
            const innerW = barW - innerPad * 2;
            const innerH = barH - innerPad * 2;
            const fillW = innerW * clamped;
            const scanX = x + innerPad + fillW - 28 + Math.sin(now * 0.01) * 6;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.88)';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = glowEnabled ? 12 : 0;
            ctx.strokeRect(x | 0, y | 0, barW, barH);

            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0, 18, 32, 0.9)';
            ctx.fillRect((x + innerPad) | 0, (y + innerPad) | 0, innerW, innerH);

            if (fillW > 0) {
                const gradient = ctx.createLinearGradient(x, 0, x + barW, 0);
                gradient.addColorStop(0, '#009dff');
                gradient.addColorStop(0.55, '#00ffff');
                gradient.addColorStop(1, '#ffffff');
                ctx.fillStyle = gradient;
                ctx.fillRect((x + innerPad) | 0, (y + innerPad) | 0, fillW, innerH);

                ctx.save();
                ctx.beginPath();
                ctx.rect(x + innerPad, y + innerPad, fillW, innerH);
                ctx.clip();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
                ctx.fillRect(scanX, y + innerPad, 26, innerH);
                ctx.restore();
            }

            ctx.fillStyle = '#9cfbff';
            ctx.font = `12px 'Electrolize', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('REINITIALIZING FLIGHT SYSTEMS', width / 2, y - 8);
            ctx.restore();
        }

        function drawShipSelectStat(label, valueText, ratio, x, y, color) {
            const barW = 150;
            const barH = 8;
            ctx.fillStyle = '#8fb9c8';
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, y);
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(x + 74, y - barH / 2, barW, barH);
            const fillW = Math.max(6, Math.min(barW, barW * ratio));
            const gradient = ctx.createLinearGradient(x + 74, 0, x + 74 + barW, 0);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, '#ffffff');
            ctx.fillStyle = gradient;
            ctx.fillRect(x + 74, y - barH / 2, fillW, barH);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(valueText, x + 304, y);
        }

        function drawShipSelectPreview(shipConfig, slotX, slotY, selected, now, slotIndex) {
            const previewShip = {
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                shipId: shipConfig.id,
                _renderLayoutCache: null
            };
            const bob = Math.sin(now * 0.002 + slotIndex * 1.7) * (selected ? 8 : 4);
            const rotation = selected
                ? Math.sin(now * 0.0017) * 0.18
                : (slotIndex - DEFAULT_PLAYER_SHIP_INDEX) * 0.045;
            const scale = selected ? 1.02 : 0.72;
            const glow = selected ? 28 : 9;

            ctx.save();
            ctx.translate(slotX, slotY + bob);
            ctx.rotate(rotation);
            ctx.scale(scale, scale);
            ctx.globalAlpha = selected ? 1 : 0.46;
            ctx.fillStyle = selected ? shipConfig.previewColor : '#6e8290';
            ctx.shadowColor = selected ? shipConfig.previewColor : '#5b6d78';
            ctx.shadowBlur = glowEnabled ? glow : 0;
            drawPlayerShip(previewShip, 'center');
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = selected ? 0.78 : 0.26;
            ctx.strokeStyle = selected ? shipConfig.previewColor : '#49606a';
            ctx.lineWidth = selected ? 2 : 1;
            if (glowEnabled && selected) {
                ctx.shadowColor = shipConfig.previewColor;
                ctx.shadowBlur = 16;
            }
            ctx.beginPath();
            ctx.ellipse(slotX, slotY + 92, selected ? 78 : 52, selected ? 14 : 9, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${selected ? 18 : 13}px 'Electrolize', sans-serif`;
            ctx.fillStyle = selected ? '#ffffff' : '#7f9aa8';
            ctx.shadowColor = selected ? shipConfig.previewColor : '#000000';
            ctx.shadowBlur = glowEnabled && selected ? 10 : 0;
            ctx.fillText(shipConfig.name, slotX, slotY + (selected ? 132 : 116));
            ctx.restore();
        }

        function drawShipSelectionScreen(now) {
            const selectedShip = getShipSelectConfig();
            const alpha = Math.max(0.85, titleAlpha);
            const centerY = height * 0.42;
            const slotXs = [width * 0.25, width * 0.5, width * 0.75];

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const headerPulse = 0.7 + Math.sin(now * 0.0024) * 0.22;
            ctx.font = `bold 30px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = selectedShip.previewColor;
            ctx.shadowBlur = glowEnabled ? 16 + headerPulse * 8 : 0;
            ctx.fillText('HANGAR SELECT', width / 2, height * 0.12);

            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#8fb9c8';
            ctx.shadowBlur = 0;
            ctx.fillText('RUN FRAME ONLINE', width / 2, height * 0.155);

            for (let i = 0; i < PLAYER_SHIP_TYPES.length; i++) {
                const ship = PLAYER_SHIP_TYPES[i];
                const isSelected = i === shipSelectIndex;
                drawShipSelectPreview(ship, slotXs[i], centerY, isSelected, now, i);
            }

            const panelX = width / 2 - 172;
            const panelY = height * 0.66;
            const panelH = 192;
            ctx.fillStyle = 'rgba(2, 8, 14, 0.72)';
            ctx.fillRect(panelX - 18, panelY - 26, 344, panelH);
            ctx.strokeStyle = selectedShip.previewColor;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.72;
            ctx.strokeRect(panelX - 18, panelY - 26, 344, panelH);
            ctx.globalAlpha = alpha;

            ctx.textAlign = 'left';
            ctx.font = `bold 20px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = selectedShip.previewColor;
            ctx.shadowBlur = glowEnabled ? 10 : 0;
            ctx.fillText(selectedShip.name, panelX, panelY - 2);

            ctx.font = `12px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#8fb9c8';
            ctx.shadowBlur = 0;
            ctx.fillText(selectedShip.subtitle.toUpperCase(), panelX, panelY + 20);
            ctx.fillStyle = selectedShip.previewColor;
            ctx.fillText(selectedShip.trait.toUpperCase(), panelX, panelY + 40);

            const statY = panelY + 66;
            drawShipSelectStat('HP', String(selectedShip.maxHp), selectedShip.maxHp / 120, panelX, statY, selectedShip.previewColor);
            drawShipSelectStat('DMG', `${Math.round(selectedShip.damageMult * 100)}%`, selectedShip.damageMult / 1.22, panelX, statY + 18, selectedShip.previewColor);
            drawShipSelectStat('FIRE', `${Math.round((306 / selectedShip.fireRate) * 100)}%`, (306 / selectedShip.fireRate) / 1.08, panelX, statY + 36, selectedShip.previewColor);
            drawShipSelectStat('SPEED', `${Math.round(selectedShip.moveSpeedMult * 100)}%`, selectedShip.moveSpeedMult / 1.16, panelX, statY + 54, selectedShip.previewColor);
            drawShipSelectStat('BOMB', `${Math.round((1 / selectedShip.bombCooldownMult) * 100)}%`, (1 / selectedShip.bombCooldownMult) / 1.22, panelX, statY + 72, selectedShip.previewColor);
            drawShipSelectStat('EVADE', `${Math.round((1 / selectedShip.hitboxMult) * 100)}%`, (1 / selectedShip.hitboxMult) / 1.08, panelX, statY + 90, selectedShip.previewColor);

            ctx.restore();
        }

        function drawWaveSignalNotice(now) {
            if (!waveSignalNotice || gameState !== 'PLAYING') return;
            const elapsed = now - waveSignalNotice.startTime;
            if (elapsed > waveSignalNotice.duration) {
                waveSignalNotice = null;
                return;
            }
            const fadeIn = Math.min(1, elapsed / 260);
            const fadeOut = Math.min(1, (waveSignalNotice.duration - elapsed) / 520);
            const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
            const y = height * 0.105;
            const w = 360;
            const h = 48;
            const x = width / 2 - w / 2;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(0, 8, 16, 0.72)';
            ctx.fillRect(x, y - h / 2, w, h);
            ctx.strokeStyle = waveSignalNotice.color;
            ctx.lineWidth = 1;
            if (glowEnabled) {
                ctx.shadowColor = waveSignalNotice.color;
                ctx.shadowBlur = 10;
            }
            ctx.strokeRect(x, y - h / 2, w, h);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 13px 'Electrolize', sans-serif`;
            ctx.fillStyle = waveSignalNotice.color;
            ctx.fillText(`WAVE ${waveSignalNotice.waveNumber} // ${waveSignalNotice.title}`, width / 2, y - 8);
            ctx.font = `11px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#d8f7ff';
            ctx.fillText(waveSignalNotice.desc.toUpperCase(), width / 2, y + 11);
            ctx.restore();
        }

        const BOSS_CAMERA_ZOOM_SCALE = 0.95;
        const BOSS_CAMERA_ZOOM_IN_RATE = 0.88;
        const BOSS_CAMERA_ZOOM_OUT_RATE = 1.35;
        let bossCameraZoomScale = 1;

        function updateBossCameraZoom(dt) {
            const safeDt = Math.max(0, Math.min(0.05, dt || 0));
            const canShowBossCamera = gameState !== 'START'
                && gameState !== 'LAUNCHING'
                && gameState !== 'SHIP_SELECT'
                && gameState !== 'GAMEOVER';
            if (!canShowBossCamera && !boss) {
                bossCameraZoomScale = 1;
                return bossCameraZoomScale;
            }

            const target = canShowBossCamera && boss ? BOSS_CAMERA_ZOOM_SCALE : 1;
            const rate = target < bossCameraZoomScale ? BOSS_CAMERA_ZOOM_IN_RATE : BOSS_CAMERA_ZOOM_OUT_RATE;
            const blend = 1 - Math.exp(-safeDt * rate);
            bossCameraZoomScale += (target - bossCameraZoomScale) * blend;
            if (Math.abs(bossCameraZoomScale - target) < 0.0005) bossCameraZoomScale = target;
            return bossCameraZoomScale;
        }

        function applyBossCameraZoom(scale) {
            const playfieldH = height - HUD_HEIGHT;
            const centerX = width / 2;
            const centerY = playfieldH / 2;
            ctx.translate(centerX, centerY);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);
        }

        function draw(dt) {
            if (window.innerHeight < 700 || window.innerWidth < 525) {
                ctx.fillStyle = currentBgColor;
                ctx.fillRect(0, 0, width | 0, height | 0);
                ctx.fillStyle = currentThemeColor; ctx.font = 'bold 24px Courier New';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('RESIZE WINDOW TO PLAY', (width / 2) | 0, (height / 2) | 0);
                return;
            }
            ctx.fillStyle = currentBgColor; 
            ctx.fillRect(0, 0, width | 0, height | 0);
            ctx.fillStyle = currentFieldBgColor;
            ctx.fillRect(0, 0, width | 0, height | 0);
            const renderNow = currentFrameNow;
            const allowScreenShake = gameState !== 'PAUSED' && gameState !== 'LEVELUP';
            if (!allowScreenShake) {
                shake = 0;
                wobble = 0;
            }
            ctx.save(); 
            if (allowScreenShake && shake > 0.5) ctx.translate(((Math.random()-0.5)*shake) | 0, ((Math.random()-0.5)*shake) | 0);
            if (allowScreenShake && wobble > 0.01) { ctx.translate(Math.sin(renderNow * 0.08) * wobble * 6, 0); wobble *= 0.82; }
            const bossCameraScale = updateBossCameraZoom(dt);
            const bossCameraActive = bossCameraScale < 0.9995;
            if (bossCameraActive) {
                ctx.save();
                applyBossCameraZoom(bossCameraScale);
            }
            
            ctx.globalCompositeOperation = 'source-over'; 

            // Background starfield
            let lastFieldFont = '';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < numParticles; i++) {
                if (fpY[i] < -CELL_SIZE || fpY[i] > height + CELL_SIZE) continue;
                const char = PARTICLE_CHARS[fpChar[i]];
                const depth = fpDepth ? fpDepth[i] || 1 : 1;
                const highlight = fpHighlight[i] || 0;
                const twinkle = 0.82 + Math.max(0, Math.sin(renderNow * FIELD_TWINKLE_SPEED + (fpTwinkle ? fpTwinkle[i] : 0))) * 0.18;
                const baseAlpha = (fpAlpha[i] || 0.24) * twinkle * (char === '\u2591' ? 0.72 : 1);
                const alpha = Math.min(0.82, baseAlpha + highlight * 0.58);
                const particleX = truncateSpriteCoord(fpX[i]);
                const particleY = truncateSpriteCoord(fpY[i]);
                const fontSize = depth > 0.72 ? 12 : (depth > 0.42 ? 11 : 10);
                const fieldFont = `bold ${fontSize}px Courier New`;
                if (fieldFont !== lastFieldFont) {
                    ctx.font = fieldFont;
                    lastFieldFont = fieldFont;
                }
                ctx.fillStyle = highlight > 0.42 || fpColor[i] === 1 ? '#dfeaff' : currentThemeColor;
                ctx.globalAlpha = alpha;
                if (glowEnabled && highlight > 0.32) {
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = 3 + highlight * 7;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.fillText(char, particleX, particleY);
            }
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
            drawFocusTimeWarpOverlay(renderNow, false);

            if (gameState === 'START' || gameState === 'LAUNCHING' || gameState === 'SHIP_SELECT') {
                let alpha = titleAlpha;
                if (gameState === 'LAUNCHING') {
                    alpha = Math.max(0, titleAlpha - (launchTimer / 0.5));
                }

                if (gameState === 'SHIP_SELECT') {
                    drawShipSelectionScreen(renderNow);
                } else if (alpha > 0) {
                    drawTitleLogo(alpha, renderNow);
                    if (restartLoadingSequence) {
                        const loadingProgress = gameState === 'START'
                            ? titleAlpha
                            : 1;
                        drawTitleLoadingBar(loadingProgress, alpha, renderNow);
                    } else {
                        const promptText = 'PRESS [SPACE] TO TAKE OFF';
                        const promptX = (width / 2) | 0;
                        const promptY = (height * 0.6) | 0;
                        const promptPulse = 0.5 + 0.5 * Math.sin(renderNow * 0.00234 - Math.PI / 2);
                        const promptBackdropAlpha = alpha * (0.42 + promptPulse * 0.18);
                        const promptAlpha = alpha * (0.22 + promptPulse * 0.78);
                        ctx.font = `bold 20px 'Electrolize', sans-serif`; 
                        const promptMetrics = ctx.measureText(promptText);
                        const promptTextHeight = Math.ceil(
                            (promptMetrics.actualBoundingBoxAscent || 16) +
                            (promptMetrics.actualBoundingBoxDescent || 6)
                        );
                        const promptBoxW = Math.ceil(promptMetrics.width + 40);
                        const promptBoxH = Math.max(42, promptTextHeight + 22);
                        const promptBoxX = (promptX - promptBoxW / 2) | 0;
                        const promptBoxY = (promptY - promptBoxH / 2) | 0;

                        ctx.save();
                        ctx.fillStyle = '#02060c';
                        ctx.globalAlpha = promptBackdropAlpha * 0.35;
                        ctx.fillRect(promptBoxX - 4, promptBoxY - 4, promptBoxW + 8, promptBoxH + 8);
                        ctx.globalAlpha = promptBackdropAlpha;
                        ctx.fillRect(promptBoxX, promptBoxY, promptBoxW, promptBoxH);
                        ctx.restore();

                        ctx.fillStyle = '#ffffff'; 
                        ctx.globalAlpha = promptAlpha;
                        ctx.fillText(promptText, promptX, promptY); 
                    }
                    ctx.globalAlpha = alpha * 0.85;
                    ctx.fillStyle = currentThemeColor; 
                    ctx.font = `14px 'Electrolize', sans-serif`; 
                    ctx.fillText('WASD Move | UP/LEFT/RIGHT Fire | DOWN Bomb | SPACE Focus | SHIFT Shrink', (width/2) | 0, (height*0.7) | 0);
                    ctx.globalAlpha = 1.0;
                }

                if (gameState === 'LAUNCHING') {
                    const pulseVisuals = getPlayerPulseVisuals(renderNow);
                    player.color = pulseVisuals.color;

                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = player.color;
                    ctx.shadowColor = currentThemeColor;
                    ctx.shadowBlur = pulseVisuals.glow;
                    drawPlayerShip(player, 'center');
                    ctx.shadowBlur = 0;
                    ctx.globalCompositeOperation = 'source-over';

                    for (const t of thrusterParticles) { 
                        ctx.fillStyle = t.isSmoke ? t.color : (t.isGuardianFlame ? getGuardianFlameColor(t.life) : (t.isWraithFlame ? getWraithFlameColor(t.life) : getExhaustColor(t.life))); 
                        ctx.globalAlpha = t.life; 
                        ctx.font = (t.isGuardianFlame || t.isWraithFlame) ? `bold 26px Courier New` : `bold ${FONT_SIZE}px Courier New`;
                        ctx.fillText(t.char, t.x | 0, t.y | 0); 
                    }
                    ctx.globalAlpha = 1.0;
                }
            } else if (gameState === 'GAMEOVER') {
                ctx.fillStyle = '#ff0088'; ctx.font = `bold 44px 'Electrolize', sans-serif`; ctx.fillText('YOU DIED', (width/2) | 0, (height/2 - 40) | 0);
                ctx.fillStyle = '#ffffff'; ctx.font = `22px 'Electrolize', sans-serif`; ctx.fillText('PRESS [SPACE] TO RETRY', (width/2) | 0, (height/2 + 20) | 0);
                
                ctx.fillStyle = '#ffaa00'; ctx.font = `18px 'Electrolize', sans-serif`; 
                ctx.fillText(currentHint, (width/2) | 0, (height/2 + 80) | 0);
            } else {
                for (const t of thrusterParticles) { 
                    ctx.fillStyle = t.isSmoke ? t.color : (t.isGuardianFlame ? getGuardianFlameColor(t.life) : (t.isWraithFlame ? getWraithFlameColor(t.life) : getExhaustColor(t.life))); 
                    ctx.globalAlpha = t.life; 
                    ctx.font = (t.isGuardianFlame || t.isWraithFlame) ? `bold 26px Courier New` : `bold ${FONT_SIZE}px Courier New`;
                    ctx.fillText(t.char, t.x | 0, t.y | 0); 
                }
                ctx.globalAlpha = 1.0;
                for (const o of xpOrbs) { ctx.fillStyle = '#ffffff'; ctx.font = `bold 20px Courier New`; ctx.fillText(o.char, o.x | 0, o.y | 0); }
                for (const d of drops) { 
                    if (d.isWeapon) {
                        let activeWp = d.options[d.currentIndex];
                        ctx.globalAlpha = 1.0;
                        ctx.shadowColor = activeWp.color;
                        ctx.shadowBlur = 15 + 10 * Math.sin(renderNow * 0.01);
                        ctx.strokeStyle = activeWp.color;
                        ctx.lineWidth = 3;
                        ctx.strokeRect((d.x - 30)|0, (d.y - 30)|0, 60, 60);

                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 40px Courier New';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        drawPowerupIcon(activeWp, d.x | 0, d.y | 0, 40, true);

                        ctx.font = 'bold 12px "Electrolize", sans-serif';
                        ctx.fillStyle = activeWp.color;
                        ctx.fillText(activeWp.name.toUpperCase(), d.x|0, (d.y + 45)|0);

                        ctx.shadowBlur = 0;
                        ctx.globalAlpha = 1.0;
                    } else {
                        ctx.globalAlpha = d.y >= height - 30 ? 0.75 + Math.sin(renderNow * 0.005) * 0.25 : 1.0;
                        if (d.isHealth) {
                            const boxSize = d.boxSize || 28;
                            ctx.fillStyle = d.boxColor || '#d11f34';
                            ctx.fillRect((d.x - boxSize / 2) | 0, (d.y - boxSize / 2) | 0, boxSize, boxSize);
                            ctx.strokeStyle = d.strokeColor || '#ffffff';
                            ctx.lineWidth = 2;
                            ctx.strokeRect((d.x - boxSize / 2) | 0, (d.y - boxSize / 2) | 0, boxSize, boxSize);
                            ctx.fillStyle = d.crossColor || '#ffffff';
                            ctx.font = `bold ${Math.max(18, Math.round(boxSize * 0.95))}px Courier New`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText('+', d.x | 0, d.y | 0);
                        } else if (d.isFocus) {
                            const boxSize = d.boxSize || 26;
                            const pulse = 0.5 + Math.sin(renderNow * 0.008) * 0.5;
                            ctx.fillStyle = d.boxColor || '#fff2a8';
                            if (glowEnabled) {
                                ctx.shadowColor = d.coreColor || '#ffd35a';
                                ctx.shadowBlur = 10 + pulse * 8;
                            }
                            ctx.fillRect((d.x - boxSize / 2) | 0, (d.y - boxSize / 2) | 0, boxSize, boxSize);
                            ctx.strokeStyle = d.strokeColor || '#ffd35a';
                            ctx.lineWidth = 2;
                            ctx.strokeRect((d.x - boxSize / 2) | 0, (d.y - boxSize / 2) | 0, boxSize, boxSize);
                            ctx.fillStyle = d.coreColor || '#ffd35a';
                            ctx.font = `bold ${Math.max(17, Math.round(boxSize * 0.82))}px Courier New`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText('F', d.x | 0, d.y | 0);
                            ctx.shadowBlur = 0;
                        } else {
                            ctx.fillStyle = d.color; 
                            ctx.font = `bold 22px Courier New`; 
                            ctx.fillText(d.char, d.x | 0, d.y | 0); 
                        }
                    }
                }
                ctx.globalAlpha = 1.0;
                
                let hugeFontSet = false;
                for (const b of enemyBullets) { 
                    let bulletColor = b.color;
                    if (b.isDyingBullet) {
                        const startedAt = b.bossClearStart || currentFrameNow || performance.now();
                        const elapsed = ((currentFrameNow || performance.now()) - startedAt) / 1000;
                        const duration = b.bossClearDuration || 0.5;
                        const progress = Math.max(0, Math.min(1, elapsed / duration));
                        const alpha = Math.pow(1 - progress, 1.35);
                        const pop = Math.sin(progress * Math.PI);
                        ctx.save();
                        ctx.globalAlpha = alpha;
                        ctx.fillStyle = progress < 0.22 ? '#ffffff' : (b.bossClearColor || b.color || '#ffffff');
                        ctx.font = `bold ${Math.max(8, Math.round((b.bossClearSize || 22) * (0.8 + pop * 0.35)))}px Courier New`;
                        if (glowEnabled && b.bossClearGlow !== false) {
                            ctx.shadowColor = '#ffffff';
                            ctx.shadowBlur = 18 * alpha + 8 * pop;
                        }
                        ctx.fillText(
                            b.bossClearChar || '✦',
                            truncateSpriteCoord(b.x),
                            truncateSpriteCoord(b.y)
                        );
                        ctx.restore();
                        ctx.globalAlpha = 1.0;
                        ctx.shadowBlur = 0;
                        continue;
                    }
                    if (drawBossProjectileVisual(b, renderNow)) {
                        continue;
                    }
                    if (b.isHuge) {
                        if (!hugeFontSet) {
                            ctx.font = `bold 120px Courier New`;
                            hugeFontSet = true;
                        }
                        ctx.fillStyle = bulletColor;
                        if (b.isGlitchBullet && glowEnabled) { ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 25; }
                        const scale = Math.max(0.01, b.life);
                        drawFocusBulletTrailGlyph(b, b.char, bulletColor, `bold ${Math.max(12, Math.round(120 * scale))}px Courier New`, 0.72);
                        ctx.save();
                        ctx.translate(
                            truncateSpriteCoord(b.x),
                            truncateSpriteCoord(b.y)
                        );
                        ctx.scale(scale, scale);
                        ctx.fillText(b.char, 0, 0);
                        ctx.restore();
                        if (b.isGlitchBullet) { ctx.shadowBlur = 0; }
                        continue;
                    }
                    if (b.isLargeFlame) {
                        // Fade between red and orange without mutating projectile state during pause.
                        const flameCycle = Math.sin(renderNow * 0.004);
                        bulletColor = flameCycle > 0 ? '#e01926' : '#e38914';
                    } else if (b.isLargeWraith) {
                        const wraithCycle = Math.sin(renderNow * 0.004 + b.x * 0.01 + b.y * 0.01);
                        bulletColor = wraithCycle > 0.3 ? '#c8ffff' : (wraithCycle > -0.2 ? '#f4fbff' : '#101317');
                    }
                    if (b.isCodeLine) {
                        ctx.fillStyle = '#00ff41';
                        ctx.font = `bold 14px Courier New`;
                        if (glowEnabled) { ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 20 + Math.random() * 10; }
                        drawFocusBulletTrailGlyph(b, b.char, '#00ff41', `bold 14px Courier New`, 0.65);
                        ctx.save();
                        ctx.translate(
                            truncateSpriteCoord(b.x),
                            truncateSpriteCoord(b.y)
                        );
                        ctx.rotate(Math.atan2(b.vy, b.vx));
                        ctx.fillText(b.char, 0, 0);
                        ctx.restore();
                        ctx.shadowBlur = 0;
                        continue;
                    }
                    ctx.fillStyle = bulletColor;
                    if (b.decay) ctx.font = `bold ${Math.max(1, Math.floor(24 * b.life))}px Courier New`;
                    else if (b.isLargeFlame) ctx.font = `bold 32px Courier New`;
                    else if (b.isLargeWraith) ctx.font = `bold 32px Courier New`;
                    else if (b.isWraithBolt) ctx.font = `bold 26px Courier New`;
                    else if (b.isSignalYBullet) ctx.font = `bold 44px Courier New`;
                    else if (b.isPhantomBullet) ctx.font = `bold 35px Courier New`;
                    else if (b.isVoidProjectile) ctx.font = `bold ${b.voidBulletSize || 24}px Courier New`;
                    else ctx.font = `bold 20px Courier New`;
                    if (b.isGlitchBullet && glowEnabled) {
                        ctx.shadowColor = '#00ff41';
                        ctx.shadowBlur = 18 + Math.random() * 8;
                    } else if (b.isLargeWraith && glowEnabled) {
                        ctx.shadowColor = '#c8ffff';
                        ctx.shadowBlur = 20;
                    } else if (b.isWraithBolt && glowEnabled) {
                        ctx.shadowColor = '#f4f7fb';
                        ctx.shadowBlur = 16;
                    } else if (b.isVoidProjectile && glowEnabled) {
                        ctx.shadowColor = b.color;
                        ctx.shadowBlur = 18;
                    } else if (b.isFlyByBullet && glowEnabled) {
                        ctx.shadowColor = b.color;
                        ctx.shadowBlur = 14;
                    }
                    const useOrbBulletVisual = !b.decay &&
                        !b.isGlitchBullet && !b.isLargeFlame && !b.isLargeWraith &&
                        !b.isWraithBolt && !b.isSignalYBullet && !b.isPhantomBullet &&
                        !b.isVoidProjectile && !b.isFlyByBullet;
                    if (useOrbBulletVisual) {
                        drawEnemyBulletOrb(b, renderNow, bulletColor);
                        continue;
                    }
                    drawFocusBulletTrailGlyph(b, b.char, bulletColor, ctx.font, b.isLargeFlame || b.isLargeWraith || b.isPhantomBullet ? 0.82 : 0.68);
                    ctx.fillText(
                        b.char,
                        truncateSpriteCoord(b.x),
                        truncateSpriteCoord(b.y)
                    );
                    if (b.isGlitchBullet || b.isWraithBolt || b.isFlyByBullet || b.isVoidProjectile) { ctx.shadowBlur = 0; }
                }
                if (hugeFontSet) {
                    ctx.font = `bold 20px Courier New`; // Restore standard font size
                }
                
                for (const e of enemies) {
                    if (e.path && e.pathT < 0) continue;
                    if (e.lifeTime && e.lifeTime < 0) continue;
                    const flashColor = e.flashTimer > 0 ? '#ffffff' : null;
                    drawFocusEnemyTrail(e, flashColor);
                    if (e.enemyShipSprite) {
                        if (e.isRisingStar) {
                            const alpha = Math.max(0.12, Math.min(1, e.risingAlpha || 1));
                            ctx.save();
                            ctx.globalAlpha *= alpha;
                            drawEnemyShipSprite(e, flashColor);
                            ctx.restore();
                            drawRisingStarThruster(e, renderNow, alpha);
                        } else {
                            drawEnemyShipSprite(e, flashColor);
                        }
                    } else if (e.isFlyBy) {
                        const flyByScale = e.flyByScale || 1.55;
                        const localX = -(e.sprite[0].length * charW) / 2;
                        const localY = -(e.sprite.length * charH) / 2;
                        const renderX = snapSpriteCoord(e.x);
                        const renderY = snapSpriteCoord(e.y);
                        ctx.save();
                        ctx.translate(renderX, renderY);
                        ctx.scale(flyByScale, flyByScale);
                        ctx.font = `bold 20px Courier New`;
                        if (glowEnabled) {
                            ctx.shadowColor = e.flashTimer > 0 ? '#ffffff' : e.color;
                            ctx.shadowBlur = 14;
                        }
                        drawAsciiSprite(e.sprite, localX, localY, e.color, e.spriteColors, flashColor);
                        ctx.shadowBlur = 0;
                        ctx.restore();
                    } else {
                        ctx.font = `bold 20px Courier New`;
                        const renderScale = e.renderScale || 1;
                        if (renderScale !== 1) {
                            const eSX = -(e.sprite[0].length * charW) / 2;
                            const eSY = -(e.sprite.length * charH) / 2;
                            const renderX = snapSpriteCoord(e.x);
                            const renderY = snapSpriteCoord(e.y);
                            ctx.save();
                            ctx.translate(renderX, renderY);
                            ctx.scale(renderScale, renderScale);
                            if (e.isWraith && glowEnabled) {
                                ctx.shadowColor = flashColor || '#f2f2f3';
                                ctx.shadowBlur = 22;
                            }
                            drawAsciiSprite(e.sprite, eSX, eSY, e.color, e.spriteColors, flashColor, e.spriteColorFn);
                            ctx.shadowBlur = 0;
                            ctx.restore();
                        } else {
                            const renderX = snapSpriteCoord(e.x);
                            const renderY = snapSpriteCoord(e.y);
                            const eSX = renderX - (e.sprite[0].length * charW)/2, eSY = renderY - (e.sprite.length * charH)/2;
                            if (e.isWraith && glowEnabled) {
                                ctx.shadowColor = flashColor || '#f2f2f3';
                                ctx.shadowBlur = 16;
                            }
                            drawAsciiSprite(e.sprite, eSX, eSY, e.color, e.spriteColors, flashColor, e.spriteColorFn);
                            if (e.isWraith) ctx.shadowBlur = 0;
                        }
                    }
                }

                if (player.weaponStats.hasOrbitalDrones) {
                    ctx.fillStyle = '#aa00ff';
                    ctx.font = 'bold 20px Courier New';
                    for (let i = 0; i < player.drones.length; i++) {
                        const d = player.drones[i];
                        ctx.fillText('⟳', d.x | 0, d.y | 0);
                    }
                }
                
                if (boss) {
                    drawFocusBossTrail(boss);
                    const bossRenderEntries = null;
                    if (boss.name === 'OVERHEATING FIREWALL') {
                        const fireLines = boss.sprite;
                        const renderBossX = snapSpriteCoord(boss.x);
                        const renderBossY = snapSpriteCoord(boss.y);
                        const bSX = -(fireLines[0].length * charW) / 2;
                        const bSY = -(fireLines.length * charH) / 2;
                        const firewallHasColor = boss.phase === 'ACTIVE';
                        const firewallStageTwo = (boss.stage || 1) >= 2;
                        
                        ctx.font = `bold 20px Courier New`;
                        ctx.save();
                        ctx.translate(renderBossX, renderBossY);
                        ctx.scale(FIREWALL_BOSS_RENDER_SCALE, FIREWALL_BOSS_RENDER_SCALE);
                        
                        // Exact mathematical frame loop (300 frames = 5 seconds at 60FPS)
                        const LOOP_FRAMES = 300;
                        const firewallAnimFrame = typeof boss.animFrame === 'number' ? boss.animFrame : 0;
                        const tAngle = ((firewallAnimFrame % LOOP_FRAMES) / LOOP_FRAMES) * Math.PI * 2;

                        for (let r = 0; r < fireLines.length; r++) {
                            const hRatio = r / fireLines.length;

                            // Smooth, pulsating wave glow traveling up the flame (loops exactly 4 times per full cycle)
                            if (glowEnabled && firewallHasColor) {
                                ctx.shadowBlur = (firewallStageTwo ? 33 : 25) + Math.sin((firewallStageTwo ? 6 : 4) * tAngle - r * 0.5) * (firewallStageTwo ? 13 : 10);
                            } else {
                                ctx.shadowBlur = 0;
                            }

                            for (let c = 0; c < fireLines[r].length; c++) {
                                const char = fireLines[r][c];
                                if (char !== ' ') {
                                    // Smooth fluid math using integer multiples of tAngle for a perfect, seamless loop
                                    // 2*tAngle and 3*tAngle ensure waves overlap cleanly without ever stuttering.
                                    const noise = Math.sin(2 * tAngle - r * 0.5 + c * 0.3) * 0.6 + 
                                                  Math.cos(3 * tAngle - r * 0.3 + c * 0.2) * 0.6;

                                    if (boss.flashTimer > 0) {
                                        ctx.fillStyle = '#ffffff';
                                        ctx.shadowColor = '#ffffff';
                                    } else if (!firewallHasColor) {
                                        ctx.fillStyle = boss.color;
                                        ctx.shadowColor = boss.color;
                                    } else {
                                        // Correlate the color sections directly with the smooth animation noise
                                        const flickerHeat = hRatio + (noise * (firewallStageTwo ? 0.2 : 0.15)) + (firewallStageTwo ? 0.08 : 0);
                                        
                                        if (firewallStageTwo && flickerHeat > 0.88) {
                                            ctx.fillStyle = '#fff2a8'; // White-hot stage two pockets
                                        } else if (flickerHeat > 0.75) {
                                            ctx.fillStyle = '#ffaa00'; // Yellow-orange base
                                        } else if (flickerHeat > 0.45) {
                                            ctx.fillStyle = '#ff4400'; // Bright orange mid
                                        } else {
                                            ctx.fillStyle = firewallStageTwo ? '#e01926' : '#cc0000'; // Deep red tips
                                        }
                                        
                                        // Occasional smooth white hot pockets (loops exactly 5 times per full cycle)
                                        if (flickerHeat > 0.85 && Math.sin(5 * tAngle + c * 0.5) > 0.5) {
                                            ctx.shadowColor = '#ffffff';
                                        } else {
                                            ctx.shadowColor = firewallStageTwo ? '#ffdd66' : '#ff5500';
                                        }
                                    }

                                    const baseHeat = FIREWALL_CHAR_MAP[char] || 0;
                                    let heat = Math.round(baseHeat + noise);
                                    heat = Math.max(1, Math.min(4, heat)); 
                                    
                                    const animChar = FIREWALL_FIRE_CHARS[heat];
                                    const localX = bSX + c * charW;
                                    const localY = bSY + r * charH;
                                    ctx.fillText(animChar, localX | 0, localY | 0);
                                    recordBossRenderGlyph(
                                        bossRenderEntries,
                                        animChar,
                                        (renderBossX + localX * FIREWALL_BOSS_RENDER_SCALE) | 0,
                                        (renderBossY + localY * FIREWALL_BOSS_RENDER_SCALE) | 0,
                                        ctx.fillStyle
                                    );
                                }
                            }
                        }
                        ctx.shadowBlur = 0;
                        ctx.restore();
                        
                        if (boss.phase === 'ACTIVE') {
                            if (gameState === 'PLAYING') {
                                const coreCycle = firewallStageTwo ? 3.35 : 4;
                                const vulnerableWindow = firewallStageTwo ? 2.15 : 3.0;
                                boss.coreTimer += dt;
                                if (boss.coreTimer > coreCycle) boss.coreTimer -= coreCycle;
                                boss.isVulnerable = boss.coreTimer < vulnerableWindow;
                            }
                            
                            const coreX = boss.x;
                            const coreY = boss.y + FIREWALL_BOSS_CORE_OFFSET_Y;
                            
                            ctx.font = `bold ${FIREWALL_BOSS_CORE_FONT_SIZE}px Courier New`;
                            if (boss.isVulnerable) {
                                ctx.fillStyle = firewallStageTwo ? '#fff2a8' : '#00ffff';
                                ctx.shadowColor = firewallStageTwo ? '#ffdd66' : '#00ffff';
                                ctx.shadowBlur = firewallStageTwo ? 48 : 40;
                                ctx.fillText('◈', coreX, coreY);
                                ctx.shadowBlur = 0;
                            } else {
                                ctx.fillStyle = firewallStageTwo ? '#ff6a18' : '#ff0000';
                                ctx.shadowColor = firewallStageTwo ? '#e01926' : '#ff0000';
                                ctx.shadowBlur = firewallStageTwo ? 44 : 40;
                                ctx.fillText('◈', coreX, coreY);
                                ctx.shadowBlur = 0;
                            }
                            recordBossRenderGlyph(bossRenderEntries, '@', coreX, coreY, ctx.fillStyle, BOSS_CINEMATIC_FIREWALL_CORE_SCALE);
                            
                            ctx.font = `bold 16px Courier New`; // Revert back for health bar
                            const { barW, barH, barX, barY, nameY } = getBossBarLayout();
                            ctx.strokeStyle = '#ffffff'; ctx.strokeRect(barX | 0, barY | 0, barW, barH);
                            ctx.fillStyle = firewallStageTwo ? '#ffdd66' : '#ff6600'; ctx.fillRect((barX+2) | 0, (barY+2) | 0, (barW-4)*(boss.hp/boss.maxHp), barH-4);
                            ctx.fillStyle = boss.color; ctx.fillText(boss.name, (width/2) | 0, nameY | 0);
                        }
                    } else if (boss.name === 'NULL PHANTOM') {
                        const layout = getNullPhantomRenderLayout(boss);
                        const bodyFlash = boss.flashTimer > 0;
                        const isIntro = boss.phase === 'INTRO';
                        const glowBlur = glowEnabled && boss.phase !== 'INTRO' ? 12 + layout.laughAmount * 10 : 0;

                        ctx.save();
                        ctx.font = `bold ${NULL_PHANTOM_FONT_SIZE}px Courier New`;
                        ctx.globalAlpha = bodyFlash ? 1 : NULL_PHANTOM_BODY_ALPHA;
                        ctx.shadowColor = bodyFlash ? '#ffffff' : NULL_PHANTOM_GLOW_COLOR;
                        ctx.shadowBlur = glowBlur;

                        for (let r = 0; r < boss.sprite.length; r++) {
                            for (let c = 0; c < boss.sprite[r].length; c++) {
                                const char = boss.sprite[r][c];
                                if (char === ' ') continue;

                                const glyphPos = getNullPhantomGlyphPosition(layout, r, c);
                                const bodyColor = bodyFlash ? '#ffffff' : getNullPhantomBodyColor(char, 1, isIntro);
                                ctx.fillStyle = bodyColor;
                                ctx.fillText(char, glyphPos.x | 0, glyphPos.y | 0);
                                recordBossRenderGlyph(
                                    bossRenderEntries,
                                    char,
                                    glyphPos.x | 0,
                                    glyphPos.y | 0,
                                    bodyColor,
                                    layout.cubeScale
                                );
                            }
                        }
                        ctx.restore();

                        if (boss.phase === 'ACTIVE') {
                            const { barW, barH, barX, barY, nameY } = getBossBarLayout();
                            ctx.strokeStyle = '#ffffff';
                            ctx.strokeRect(barX | 0, barY | 0, barW, barH);
                            ctx.fillStyle = '#ff4fd8';
                            ctx.fillRect((barX + 2) | 0, (barY + 2) | 0, (barW - 4) * (boss.hp / boss.maxHp), barH - 4);
                            ctx.fillStyle = '#ffd5ff';
                            ctx.font = `bold 16px Courier New`;
                            ctx.fillText(boss.name, (width / 2) | 0, nameY | 0);
                        }
                    } else if (boss.name === 'GHOST SIGNAL') {
                        const layout = getGhostSignalRenderLayout(boss);
                        const bodyFlash = boss.flashTimer > 0;
                        const signalStageTwo = (boss.stage || 1) >= 2;
                        const bodyPulse = bodyFlash
                            ? 1
                            : (signalStageTwo ? 0.84 : 0.75) + Math.sin(2 * layout.tAngle - 0.22) * (signalStageTwo ? 0.16 : 0.25);
                        const bodyGlow = glowEnabled && boss.phase !== 'INTRO'
                            ? GHOST_SIGNAL_BODY_GLOW + bodyPulse * (signalStageTwo ? 14 : 9) + Math.sin(4 * layout.tAngle) * (signalStageTwo ? 7 : 4)
                            : 0;

                        ctx.save();
                        ctx.font = `bold ${GHOST_SIGNAL_FONT_SIZE}px Courier New`;
                        ctx.globalAlpha = bodyFlash ? 1 : bodyPulse;
                        ctx.shadowColor = bodyFlash ? '#ffffff' : GHOST_SIGNAL_GLOW_COLOR;
                        ctx.shadowBlur = bodyGlow;

                        for (let r = 0; r < boss.sprite.length; r++) {
                            for (let c = 0; c < boss.sprite[r].length; c++) {
                                const char = boss.sprite[r][c];
                                if (char === ' ') continue;

                                const glyphPos = getGhostSignalGlyphPosition(layout, r, c);
                                const shimmer = bodyFlash
                                    ? 1
                                    : 0.84 + Math.max(0, Math.sin(4 * layout.tAngle - r * 0.28 + c * 0.16)) * 0.16;
                                const bodyColor = bodyFlash ? '#ffffff' : getGhostSignalBodyColor(char, shimmer);
                                ctx.fillStyle = bodyColor;
                                ctx.fillText(char, glyphPos.x | 0, glyphPos.y | 0);
                                recordBossRenderGlyph(
                                    bossRenderEntries,
                                    char,
                                    glyphPos.x | 0,
                                    glyphPos.y | 0,
                                    bodyColor,
                                    layout.cubeScale
                                );
                            }
                        }
                        ctx.restore();

                        if (boss.phase === 'ACTIVE') {
                            const { barW, barH, barX, barY, nameY } = getBossBarLayout();
                            ctx.strokeStyle = '#ffffff';
                            ctx.strokeRect(barX | 0, barY | 0, barW, barH);
                            ctx.fillStyle = signalStageTwo ? '#f4fbff' : '#9cfbff';
                            ctx.fillRect((barX + 2) | 0, (barY + 2) | 0, (barW - 4) * (boss.hp / boss.maxHp), barH - 4);
                            ctx.fillStyle = '#d8fbff';
                            ctx.font = `bold 16px Courier New`;
                            ctx.fillText(boss.name, (width / 2) | 0, nameY | 0);
                        }
                    } else if (boss.name === 'BLACK VOID') {
                        drawBlackVoidBoss(renderNow, bossRenderEntries);
                    } else if (boss.isEclipseWarden) {
                        drawEclipseWardenBoss(renderNow, bossRenderEntries);
                    } else if (boss.isBattleStarship) {
                        const shipSprite = boss.sprite;
                        const renderScale = boss.renderScale || 0.55;
                        const renderBossX = snapSpriteCoord(boss.x);
                        const renderBossY = snapSpriteCoord(boss.y);
                        const bSX = -(shipSprite[0].length * charW) / 2;
                        const bSY = -(shipSprite.length * charH) / 2;
                        const bodyFlash = boss.flashTimer > 0;

                        ctx.save();
                        ctx.translate(renderBossX, renderBossY);
                        ctx.scale(renderScale, renderScale);
                        ctx.font = `bold 20px Courier New`;

                        const baseColor = bodyFlash ? '#ffffff' : (boss.isShielded ? '#bff0ff' : '#9bd6ff');
                        const accentColor = bodyFlash ? '#ffffff' : '#5fa8ff';
                        const hullColor = bodyFlash ? '#ffffff' : '#cfe6ff';

                        if (glowEnabled && boss.phase !== 'INTRO') {
                            ctx.shadowColor = boss.isShielded ? '#9be3ff' : '#7ed4ff';
                            ctx.shadowBlur = 10 + Math.sin(renderNow * 0.004) * 4;
                        }

                        for (let r = 0; r < shipSprite.length; r++) {
                            for (let c = 0; c < shipSprite[r].length; c++) {
                                const char = shipSprite[r][c];
                                if (char === ' ') continue;
                                let glyphColor = hullColor;
                                if (char === '█' || char === '▓') glyphColor = baseColor;
                                else if (char === '▌' || char === '▐' || char === '▄' || char === '▀') glyphColor = accentColor;
                                else if (char === '░' || char === '▒') glyphColor = '#7ea8d6';
                                ctx.fillStyle = bodyFlash ? '#ffffff' : glyphColor;
                                const localX = bSX + c * charW;
                                const localY = bSY + r * charH;
                                ctx.fillText(char, localX | 0, localY | 0);
                                recordBossRenderGlyph(
                                    bossRenderEntries,
                                    char,
                                    (renderBossX + localX * renderScale) | 0,
                                    (renderBossY + localY * renderScale) | 0,
                                    ctx.fillStyle,
                                    renderScale
                                );
                            }
                        }
                        ctx.shadowBlur = 0;
                        ctx.restore();

                        if (boss.phase === 'ACTIVE') {
                            // Engine glow when shields charging or vented
                            if (boss.engineGlow > 0.05) {
                                ctx.save();
                                ctx.font = `bold ${(28 + boss.engineGlow * 24) | 0}px Courier New`;
                                ctx.fillStyle = boss.isShielded ? '#ffea7a' : '#ff6b3d';
                                if (glowEnabled) {
                                    ctx.shadowColor = boss.isShielded ? '#ffd24a' : '#ff5824';
                                    ctx.shadowBlur = 12 + boss.engineGlow * 16;
                                }
                                ctx.globalAlpha = 0.4 + boss.engineGlow * 0.6;
                                ctx.fillText('◉', boss.x | 0, (boss.y + 60) | 0);
                                ctx.restore();
                            }

                            // Shield bubble
                            if (boss.isShielded) {
                                ctx.save();
                                const pulse = 0.55 + Math.sin(renderNow * 0.008) * 0.15;
                                ctx.globalAlpha = pulse;
                                ctx.strokeStyle = '#9be3ff';
                                ctx.lineWidth = 2;
                                if (glowEnabled) {
                                    ctx.shadowColor = '#9be3ff';
                                    ctx.shadowBlur = 18;
                                }
                                ctx.beginPath();
                                ctx.ellipse(boss.x | 0, (boss.y + 30) | 0, 165, 105, 0, 0, Math.PI * 2);
                                ctx.stroke();
                                ctx.restore();
                            }

                            const { barW, barH, barX, barY, nameY } = getBossBarLayout();
                            ctx.strokeStyle = '#ffffff';
                            ctx.strokeRect(barX | 0, barY | 0, barW, barH);
                            ctx.fillStyle = '#7ed4ff';
                            ctx.fillRect((barX + 2) | 0, (barY + 2) | 0, (barW - 4) * (boss.hp / boss.maxHp), barH - 4);
                            ctx.fillStyle = '#cfe6ff';
                            ctx.font = `bold 16px Courier New`;
                            ctx.fillText(boss.name, (width / 2) | 0, nameY | 0);
                        }
                    } else if (boss.isGlitch) {
                        ctx.fillStyle = boss.flashTimer > 0 ? '#ffffff' : boss.color;
                        ctx.font = `bold 20px Courier New`;
                        const renderBossX = snapSpriteCoord(boss.x);
                        const renderBossY = snapSpriteCoord(boss.y);
                        const bSX = renderBossX - (boss.sprite[0].length * charW)/2, bSY = renderBossY - (boss.sprite.length * charH)/2;

                        // Persistent glow on the boss sprite
                        if (glowEnabled && boss.phase !== 'INTRO') {
                            ctx.shadowColor = boss.color;
                            ctx.shadowBlur = 15 + Math.sin(renderNow * 0.003) * 8;
                        }

                        if (boss.isCharging && boss.glowIntensity > 0) {
                            ctx.save();
                            ctx.globalAlpha = boss.glowIntensity * 0.8;
                            ctx.fillStyle = boss.color;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.font = `bold ${(60 + boss.glowIntensity * 60) | 0}px "Courier New", monospace`;
                            if (glowEnabled) {
                                ctx.shadowColor = boss.color;
                                ctx.shadowBlur = 20 + boss.glowIntensity * 18;
                            }
                            ctx.fillText('O', boss.x | 0, boss.y | 0);
                            ctx.restore();
                        }

                        const doOffset = frameCount % (2 + Math.floor(Math.random() * 2)) === 0;
                        const doDrop = frameCount % (4 + Math.floor(Math.random() * 3)) === 0;
                        const introMult = boss.phase === 'INTRO' ? 1.6 : 1;
                        const chargeMult = boss.isCharging ? 3 : introMult;
                        let charsToOffset = doOffset ? (3 + Math.floor(Math.random() * 4)) * chargeMult : 0;
                        let charsToDrop = doDrop ? (2 + Math.floor(Math.random() * 3)) * chargeMult : 0;
                        const isDeath = boss.isDeadGlitching;

                        // Row tearing effect (horizontal displacement of entire rows)
                        let rowShifts = [];
                        for(let r=0; r<boss.sprite.length; r++) {
                            rowShifts[r] = (!isDeath && Math.random() > (boss.phase === 'INTRO' ? 0.74 : 0.85)) ? (Math.random() - 0.5) * (boss.phase === 'INTRO' ? 28 : 45) : 0;
                        }

                        let charCoords = [];
                        for (let r=0; r<boss.sprite.length; r++) {
                            for (let c=0; c<boss.sprite[r].length; c++) {
                                if (boss.sprite[r][c] !== ' ') charCoords.push({r, c, char: boss.sprite[r][c]});
                            }
                        }

                        if (!isDeath) {
                            for (let i=0; i<charsToDrop; i++) {
                                if(charCoords.length > 0) charCoords.splice(Math.floor(Math.random() * charCoords.length), 1);
                            }
                        }

                        let offsetIndices = new Set();
                        if (!isDeath) {
                            for (let i=0; i<charsToOffset; i++) {
                                if(charCoords.length > 0) offsetIndices.add(Math.floor(Math.random() * charCoords.length));
                            }
                        }

                        for (let idx = 0; idx < charCoords.length; idx++) {
                            const item = charCoords[idx];
                            let cx = bSX + item.c * charW, cy = bSY + item.r * charH;
                            cx += rowShifts[item.r]; // Apply tearing

                            if (isDeath) {
                                cx += (Math.random() - 0.5) * 80; cy += (Math.random() - 0.5) * 80;
                            } else if (offsetIndices.has(idx)) {
                                cx += (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3) * chargeMult;
                                cy += (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3) * chargeMult;
                                // Randomly inject corrupted characters
                                if (Math.random() > 0.5) item.char = GLITCH_CHARS[Math.floor(Math.random()*GLITCH_CHARS.length)];
                            }
                            ctx.fillText(item.char, cx | 0, cy | 0);
                            recordBossRenderGlyph(bossRenderEntries, item.char, cx | 0, cy | 0, ctx.fillStyle);
                        }
                        ctx.shadowBlur = 0;

                        if (boss.transitionTextTimer > 0) {
                            ctx.fillStyle = '#ff0000'; ctx.font = 'bold 36px Courier New';
                            ctx.fillText("SYSTEM CORRUPTION DETECTED", width/2, height/2 - 50);
                        }

                        if (boss.phase === 'ACTIVE' && !boss.isDeadGlitching) {
                            const { barW, barH, barX, barY, nameY } = getBossBarLayout();
                            let displayedHpRatio = boss.hp / boss.maxHp;
                            if (Math.random() < 0.011) displayedHpRatio += (Math.random() - 0.5) * 0.1;
                            displayedHpRatio = Math.max(0, Math.min(1, displayedHpRatio));

                            ctx.strokeStyle = '#ffffff'; ctx.strokeRect(barX | 0, barY | 0, barW, barH);
                            ctx.fillStyle = boss.color; 
                            ctx.fillRect((barX+2) | 0, (barY+2) | 0, (barW-4)*displayedHpRatio, barH-4);

                            if (gameState === 'PLAYING') {
                                boss.scrambleTimer -= 1/60;
                                if (boss.scrambleTimer <= 0) {
                                    boss.scrambleTimer = 1.0;
                                    const baseName = boss.stage === 1 ? "DISTORTED GLITCH" : "D1ST0RT3D GL1TCH";
                                    const map = {'I':'1', 'O':'0', 'E':'3', 'A':'4', 'T':'7', 'S':'5'};
                                    let arr = baseName.split('');
                                    let charsToScramble = 1 + Math.floor(Math.random() * 2);
                                    for(let k=0; k<10 && charsToScramble > 0; k++) { 
                                        let idx = Math.floor(Math.random() * arr.length);
                                        let char = arr[idx].toUpperCase();
                                        if(map[char]) { arr[idx] = map[char]; charsToScramble--; }
                                    }
                                    boss.scrambledName = arr.join('');
                                }
                            }
                            ctx.fillStyle = boss.color; ctx.font = `bold 16px Courier New`; 
                            ctx.fillText(boss.scrambledName, (width/2) | 0, nameY | 0);
                        }
                    } else {
                        ctx.fillStyle = boss.flashTimer > 0 ? '#ffffff' : boss.color; ctx.font = `bold 20px Courier New`;
                        const renderBossX = snapSpriteCoord(boss.x);
                        const renderBossY = snapSpriteCoord(boss.y);
                        const bSX = renderBossX - (boss.sprite[0].length * charW)/2, bSY = renderBossY - (boss.sprite.length * charH)/2;
                        for (let r=0; r<boss.sprite.length; r++) for (let c=0; c<boss.sprite[r].length; c++) if (boss.sprite[r][c] !== ' ') {
                            ctx.fillText(boss.sprite[r][c], (bSX+c*charW) | 0, (bSY+r*charH) | 0);
                            recordBossRenderGlyph(bossRenderEntries, boss.sprite[r][c], (bSX+c*charW) | 0, (bSY+r*charH) | 0, ctx.fillStyle);
                        }
                        if (boss.phase === 'ACTIVE') {
                            const { barW, barH, barX, barY, nameY } = getBossBarLayout();
                            ctx.strokeStyle = '#ffffff'; ctx.strokeRect(barX | 0, barY | 0, barW, barH);
                            ctx.fillStyle = '#ff0088'; ctx.fillRect((barX+2) | 0, (barY+2) | 0, (barW-4)*(boss.hp/boss.maxHp), barH-4);
                            ctx.fillStyle = boss.color; ctx.font = `bold 16px Courier New`; ctx.fillText(boss.name, (width/2) | 0, nameY | 0);
                        }
                    }
                    lastBossRenderSnapshot = null;
                }
                
                ctx.globalCompositeOperation = 'lighter';

                const beamDeployFactor = getBeamDeployVisual(player.beamDeploy || 0);
                if (player.isBeaming && beamDeployFactor > 0.01 && !playerExploded && gameState === 'PLAYING') {
                    const beamOrigin = getBeamOrigin(player);
                    const beamAngle = typeof player.beamAngle === 'number' ? player.beamAngle : getPlayerFireAngle();
                    ctx.fillStyle = '#fff7c2';

                    let s = player.weaponStats;
                    const angles = getFirePatternAngles(s, beamAngle, true);
                    const beamPhase = renderNow;
                    const beamMetrics = getBeamMetrics(s.sizeMult, beamDeployFactor);
                    const beamVisualLoad = angles.length * Math.max(1, s.sizeMult);
                    for (let angleIndex = 0; angleIndex < angles.length; angleIndex++) {
                        drawBeamStrand(beamOrigin.x, beamOrigin.y, angles[angleIndex], s.sizeMult, beamPhase, beamDeployFactor, beamMetrics, beamVisualLoad);
                    }
                }

                let miniTorpedoRingRenderCount = 0;
                for (let i = 0; i < bombBlastRings.length; i++) {
                    if (bombBlastRings[i].isMiniTorpedoRing) miniTorpedoRingRenderCount++;
                }

                for (const ring of bombBlastRings) {
                    const t = Math.max(0, Math.min(1, ring.life / ring.maxLife));
                    const radius = ring.maxRadius * (1 - Math.pow(1 - t, 2.2));
                    const alpha = (1 - t) * 0.9;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    if (ring.isMiniTorpedoRing) {
                        ctx.strokeStyle = ring.color;
                        ctx.lineWidth = Math.max(1.2, ring.lineWidth || 2);
                        if (glowEnabled && miniTorpedoRingRenderCount < 18) {
                            ctx.shadowColor = ring.color;
                            ctx.shadowBlur = ring.shadowBlur || 8;
                        }
                        ctx.beginPath();
                        ctx.arc(ring.x | 0, ring.y | 0, radius, 0, Math.PI * 2);
                        ctx.stroke();
                        if (t < 0.34 && miniTorpedoRingRenderCount < 14) {
                            ctx.globalAlpha = alpha * 0.38;
                            ctx.beginPath();
                            ctx.arc(ring.x | 0, ring.y | 0, radius * 0.64, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                        ctx.restore();
                        continue;
                    }
                    ctx.fillStyle = ring.color;
                    ctx.font = `bold ${Math.max(18, radius * 2.08)}px "Courier New", monospace`;
                    if (glowEnabled) {
                        ctx.shadowColor = ring.color;
                        ctx.shadowBlur = ring.shadowBlur || 18;
                    }
                    ctx.fillText(ring.glyph || 'O', ring.x | 0, ring.y | 0);
                    if (t < 0.45) {
                        ctx.globalAlpha = alpha * 0.45;
                        ctx.font = `bold ${Math.max(14, radius * 1.55)}px "Courier New", monospace`;
                        ctx.fillText(ring.glyph || 'O', ring.x | 0, ring.y | 0);
                    }
                    ctx.restore();
                }

                for (const bomb of bombProjectiles) {
                    const pulse = 0.8 + Math.sin(renderNow * 0.016 + bomb.pulse) * 0.2;
                    const colorMixRaw = Math.max(0, Math.min(1, (bomb.age || 0) / (bomb.launchColorDuration || 0.5)));
                    const colorMix = colorMixRaw * colorMixRaw * (3 - 2 * colorMixRaw);
                    const shellColor = blendProjectileHexColor(bomb.launchColor || '#ffffff', '#ffffff', colorMix);
                    const coreColor = blendProjectileHexColor(bomb.launchColor || '#9edfff', '#9edfff', colorMix);
                    ctx.save();
                    ctx.translate(
                        truncateSpriteCoord(bomb.x),
                        truncateSpriteCoord(bomb.y)
                    );
                    ctx.fillStyle = shellColor;
                    if (glowEnabled) {
                        ctx.shadowColor = shellColor;
                        ctx.shadowBlur = 14 + pulse * 7;
                    }
                    ctx.font = `bold 22px Courier New`;
                    ctx.fillText('O', 0, 0);
                    ctx.fillStyle = coreColor;
                    ctx.font = `bold 11px Courier New`;
                    ctx.fillText('.', 0, 0);
                    ctx.restore();
                }
                
                for (const p of comboProjectiles) { 
                    if ((p.releaseDelay || 0) > 0) continue;
                    if (p.isChainLightning) {
                        drawChainLightningProjectile(p, renderNow);
                        continue;
                    }
                    ctx.fillStyle = p.color; 
                    if (p.isBombShrapnel) {
                        ctx.font = `bold 22px Courier New`;
                        if (glowEnabled) {
                            ctx.shadowColor = p.color;
                            ctx.shadowBlur = 12;
                        }
                    } else {
                        ctx.font = `bold 24px Courier New`;
                    }
                    ctx.save();
                    ctx.translate(
                        truncateSpriteCoord(p.x),
                        truncateSpriteCoord(p.y)
                    );
                    let scale = p.stats.sizeMult;
                    if (p.stats.pathFunction === 'parabolic') {
                        let arc = Math.sin((p.life / p.maxLife) * Math.PI);
                        scale *= (1 + arc * 2);
                    }
                    if (p.isPlasmaCloud || p.stats.plasmaCloud) {
                        scale *= getPlasmaCloudGrowthFactor(p);
                        ctx.restore();
                        drawPlasmaCloudProjectile(p, renderNow, scale);
                        continue;
                    }
                    if (p.isMiniTorpedo || p.stats.miniTorpedo) {
                        ctx.restore();
                        drawMiniTorpedoProjectile(p, renderNow, scale);
                        continue;
                    }
                    if (p.isLightningBall || p.stats.lightningBall) {
                        ctx.restore();
                        drawLightningBallProjectile(p, renderNow, scale);
                        continue;
                    }
                    if (p.isBurstRound) {
                        if (glowEnabled) {
                            ctx.shadowColor = '#aa00ff';
                            ctx.shadowBlur = 10;
                        }
                        ctx.fillStyle = p.color;
                        ctx.font = `bold 22px Courier New`;
                        ctx.rotate(getPlayerProjectileGlyphRotation(p));
                        ctx.scale(scale * 0.92, scale * 1.05);
                        ctx.fillText('|', 0, 0);
                        ctx.fillStyle = '#ffffff';
                        ctx.font = `bold 8px Courier New`;
                        ctx.fillText('.', 0, -5);
                        ctx.restore();
                        ctx.shadowBlur = 0;
                        continue;
                    }
                    if (!p.isBombShrapnel) {
                        ctx.rotate(getPlayerProjectileGlyphRotation(p));
                    }
                    ctx.scale(scale, scale);
                    ctx.fillText(p.sprite, 0, 0); 
                    ctx.restore();
                    if (p.isBombShrapnel) ctx.shadowBlur = 0;
                }
                let lastDebrisColor = null;
                let lastDebrisFont = null;
                for (const d of debris) { 
                    if (d.color !== lastDebrisColor) {
                        ctx.fillStyle = d.color;
                        lastDebrisColor = d.color;
                    }
                    ctx.globalAlpha = d.isImpact ? Math.max(0, Math.min(1, d.life * 5)) : d.life; 
                    const debrisFont = d.isImpact ? `bold 7px Courier New` : `bold 16px Courier New`;
                    if (debrisFont !== lastDebrisFont) {
                        ctx.font = debrisFont;
                        lastDebrisFont = debrisFont;
                    }
                    ctx.fillText(d.char, d.x | 0, d.y | 0); 
                }
                ctx.globalAlpha = 1.0;
                ctx.globalCompositeOperation = 'source-over';

                if (boss && boss.isGlitch && boss.transitionFlash > 0) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${boss.transitionFlash / 0.3})`;
                    ctx.fillRect(0, 0, width, height);
                }

                ctx.globalCompositeOperation = 'lighter';

                if (!playerExploded && gameState !== 'LAUNCHING') {
                    // Player Ship
                    const pulseVisuals = getPlayerPulseVisuals(renderNow);
                    player.color = pulseVisuals.color;

                    if (player.flashTimer > 0) {
                        ctx.fillStyle = '#ff2200';
                        ctx.shadowColor = '#ff2200';
                        if (gameState === 'PLAYING') player.flashTimer -= dt;
                    } else {
                        ctx.fillStyle = player.color;
                        ctx.shadowColor = currentThemeColor;
                    }

                    ctx.globalCompositeOperation = 'source-over';
                    ctx.shadowBlur = player.flashTimer > 0 ? 26 : pulseVisuals.glow;
                    drawPlayerShip(player);
                    
                    ctx.shadowBlur = 0; // Reset shadow for rest of rendering
                }
                drawFocusTimeWarpOverlay(renderNow, true);
                ctx.globalCompositeOperation = 'source-over';
            }

            if (bossCameraActive) ctx.restore();

            if (gameState === 'PAUSED') drawPauseMenu();
            else if (pausePowerupBarAnim.mode === 'closing') {
                drawPausePowerupBar(pausePowerupBarAnim.lastTableY || Math.round(height * 0.68));
            }
            if (gameState === 'LEVELUP') drawLevelUpMenu(dt);
            
            if (consoleOpen) drawConsoleOverlay();
            ctx.restore();
        }
