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

        function getWraithBulletBreath(b, renderNow) {
            const phase = renderNow * 0.0032 + (b.x || 0) * 0.007 + (b.y || 0) * 0.005;
            return (Math.sin(phase) + 1) * 0.5;
        }

        function getWraithBulletColor(b, renderNow, steps = 0) {
            const breath = getWraithBulletBreath(b, renderNow);
            const steppedBreath = steps > 0 ? Math.round(breath * steps) / steps : breath;
            return blendProjectileHexColor('#101317', '#f4fbff', 0.12 + steppedBreath * 0.88);
        }

        function drawProjectileDissolveGlyph(projectile, renderNow, options = {}) {
            if (!projectile) return;
            const visual = typeof getProjectileLifetimeDissolveVisual === 'function'
                ? getProjectileLifetimeDissolveVisual(projectile)
                : { alpha: 1, scale: 1, pop: 0 };
            const alphaScale = Number.isFinite(options.alphaScale) ? options.alphaScale : 1;
            const alpha = Math.max(0, Math.min(1, visual.alpha * alphaScale));
            if (alpha <= 0.01) return;
            const x = Number.isFinite(options.x) ? options.x : projectile.x;
            const y = Number.isFinite(options.y) ? options.y : projectile.y;
            const baseSize = Math.max(1, options.fontSize || 22);
            const size = Math.max(options.minSize || 4, Math.round(baseSize * visual.scale));
            const color = options.color || projectile.dissolveColor || projectile.color || '#ffffff';
            const char = options.char || projectile.dissolveChar || projectile.sprite || projectile.char || '.';
            const angle = Number.isFinite(options.angle) ? options.angle : null;
            const flicker = Math.sin(renderNow * 0.055 + (projectile.x || 0) * 0.019 + (projectile.y || 0) * 0.017);

            ctx.save();
            ctx.translate(truncateSpriteCoord(x), truncateSpriteCoord(y));
            if (angle !== null) ctx.rotate(angle);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = alpha;
            ctx.fillStyle = flicker > 0.72 || visual.pop > 0.88 ? '#ffffff' : color;
            const dissolveGlowBlur = typeof getLiveGlowBlur === 'function'
                ? getLiveGlowBlur((options.glow || 10) * alpha + visual.pop * 4, 'normal', 1, 0.36)
                : (glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('normal')) ? (options.glow || 10) * alpha + visual.pop * 4 : 0);
            if (dissolveGlowBlur > 0) {
                ctx.shadowColor = color;
                ctx.shadowBlur = dissolveGlowBlur;
            }
            ctx.font = `bold ${size}px Courier New`;
            ctx.fillText(char, 0, 0);
            if (visual.pop > 0.2 && alpha > 0.18) {
                ctx.globalAlpha = alpha * 0.28 * visual.pop;
                ctx.font = `bold ${Math.max(4, Math.round(size * 0.58))}px Courier New`;
                ctx.fillText('.', Math.sin(renderNow * 0.018) * 4, -size * 0.16);
            }
            if (visual.terminal > 0.01 && visual.terminalAlpha > 0.01) {
                const terminalAlpha = Math.min(1, visual.terminalAlpha * alphaScale);
                const moteSize = Math.max(4, Math.round(baseSize * (0.12 + visual.terminal * 0.08)));
                const moteRadius = Math.max(2, baseSize * 0.18 * visual.terminal);
                ctx.shadowBlur = typeof getLiveGlowBlur === 'function'
                    ? getLiveGlowBlur(5 * terminalAlpha, 'low', 1, 0.28)
                    : (glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('low')) ? 5 * terminalAlpha : 0);
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = terminalAlpha * 0.56;
                ctx.font = `bold ${moteSize}px Courier New`;
                ctx.fillText('\u00b7', 0, 0);
                if (visual.terminal > 0.45) {
                    ctx.globalAlpha = terminalAlpha * 0.22;
                    ctx.fillText('\u00b7', -moteRadius, 0);
                    ctx.fillText('\u00b7', moteRadius, 0);
                }
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
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
            const lightningGlow = typeof getLiveGlowBlur === 'function'
                ? getLiveGlowBlur(18 + flicker * 7, 'high', 2, 0.34)
                : (glowEnabled ? 18 + flicker * 7 : 0);
            if (lightningGlow > 0) {
                ctx.shadowColor = '#8ff7ff';
                ctx.shadowBlur = lightningGlow;
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
            const lightningCoreGlow = typeof getLiveGlowBlur === 'function'
                ? getLiveGlowBlur(14 + flicker * 10, 'high', 2, 0.34)
                : (glowEnabled ? 14 + flicker * 10 : 0);
            if (lightningCoreGlow > 0) {
                ctx.shadowColor = '#ff7dff';
                ctx.shadowBlur = lightningCoreGlow;
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
            const plasmaGlow = typeof getLiveGlowBlur === 'function'
                ? getLiveGlowBlur(18 + Math.sin(phase * 2.4) * 4, 'high', 2, 0.32)
                : (glowEnabled ? 18 + Math.sin(phase * 2.4) * 4 : 0);
            if (plasmaGlow > 0) {
                ctx.shadowColor = '#66f2ff';
                ctx.shadowBlur = plasmaGlow;
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
            const torpedoGlow = typeof getLiveGlowBlur === 'function'
                ? getLiveGlowBlur(14 + pulse * 6, 'high', 2, 0.34)
                : (glowEnabled ? 14 + pulse * 6 : 0);
            if (torpedoGlow > 0) {
                ctx.shadowColor = '#ffb347';
                ctx.shadowBlur = torpedoGlow;
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

            const softGlow = typeof isSoftGlowQuality === 'function' && isSoftGlowQuality();
            const useCachedBulletGlow = glowEnabled
                && !softGlow
                && typeof drawCachedGlowGlyph === 'function'
                && (typeof shouldUseCachedGlowSprite !== 'function' || shouldUseCachedGlowSprite('normal'));
            if (useCachedBulletGlow) {
                drawCachedGlowGlyph(ctx, '\u25cb', 0, 0, 'bold 21px Courier New', color, color, 8, { alpha: 0.84 });
                drawCachedGlowGlyph(ctx, '\u25cf', 0, 0, 'bold 12px Courier New', color, color, 4, { alpha: 0.68 });
            } else {
                if (softGlow) {
                    if (typeof drawCheapGlowGlyph === 'function') {
                        drawCheapGlowGlyph(ctx, '\u25cf', 0, 0, 'bold 21px Courier New', color, {
                            alpha: 0.12,
                            echoAlpha: 0.045,
                            sizeBoost: 1.22,
                            maxFontSize: 26
                        });
                    } else {
                        ctx.font = `bold 24px Courier New`;
                        ctx.globalAlpha = 0.14;
                        ctx.fillStyle = color;
                        ctx.fillText('\u25cf', 0, 0);
                        ctx.globalAlpha = 0.72;
                    }
                }
                const orbGlowBlur = typeof getLiveGlowBlur === 'function'
                    ? getLiveGlowBlur(8 + Math.sin(phase * 1.3) * 1.5, 'normal', 1, 0.30)
                    : (glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('normal')) ? 8 + Math.sin(phase * 1.3) * 1.5 : 0);
                if (orbGlowBlur > 0) {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = orbGlowBlur;
                }
                ctx.font = `bold 21px Courier New`;
                ctx.globalAlpha = 0.84;
                ctx.fillStyle = color;
                ctx.fillText('\u25cb', 0, 0);

                ctx.shadowBlur = glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('low')) ? 4 : 0;
                ctx.font = `bold 12px Courier New`;
                ctx.globalAlpha = 0.68;
                ctx.fillText('\u25cf', 0, 0);
            }

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
                if (b.signalBulletType === 'machineRelay') return { char: b.char || '[ ]', core: '?', font: 31, coreFont: 11, color: b.color || '#bffcff', coreColor: '#55f7d1', glow: '#8ff7ff' };
                if (b.signalBulletType === 'machineBit') return { char: b.char || '0', core: null, font: 21, color: b.color || '#8ff7ff', glow: '#55f7d1' };
                if (b.signalBulletType === 'wraithLarge') {
                    const shell = getWraithBulletColor(b, renderNow, 6);
                    const core = blendProjectileHexColor('#202832', '#c8ffff', 0.24 + getWraithBulletBreath(b, renderNow) * 0.76);
                    return { char: '\u2726', core: '\u00b7', font: 50, coreFont: 13, color: shell, coreColor: core, glow: '#c8ffff' };
                }
                if (b.signalBulletType === 'stormOrb') return { char: '◎', core: '*', font: 42, coreFont: 15, color: '#76f6ff', coreColor: '#ffffff', glow: '#7ffcff' };
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
            if (b.isDreadBullet) {
                const scale = Math.max(0.08, b.life || 1);
                if (b.dreadBulletType === 'warning') {
                    return { char: b.char || '!', core: null, font: Math.max(18, 30 * scale), color: b.color || '#ff5a78', glow: '#ff5a78' };
                }
                if (b.dreadBulletType === 'guillotine') {
                    return { char: b.char || '|', core: null, font: 30, color: b.color || '#f4ecff', glow: b.color || '#ff5a78' };
                }
                if (b.dreadBulletType === 'maze') {
                    return { char: b.char || '+', core: '.', font: 25, coreFont: 8, color: b.color || '#d8d4ff', coreColor: '#050610', glow: b.color || '#d8d4ff' };
                }
                return { char: b.char || '+', core: b.char === '.' ? null : '.', font: b.char === '.' ? 19 : 24, coreFont: 8, color: b.color || '#d8d4ff', coreColor: '#ffffff', glow: b.color || '#ff5a78' };
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
            if (b.isMatrixBossBullet) {
                return {
                    char: b.char || '0',
                    core: b.matrixColumn ? null : '.',
                    font: b.matrixColumn ? 19 : 22,
                    coreFont: 8,
                    color: b.color || '#55f7d1',
                    coreColor: '#ffffff',
                    glow: b.color || '#55f7d1'
                };
            }
            if (b.isAxiomBossBullet) {
                return {
                    char: b.char || '<>',
                    core: b.char === 'o' ? '.' : null,
                    font: b.char === 'o' ? 23 : 21,
                    coreFont: 8,
                    color: b.color || '#bda8ff',
                    coreColor: '#ffffff',
                    glow: b.color || '#bda8ff'
                };
            }
            if (b.isTrinityBullet) {
                if (b.trinityBulletType === 'grenade') {
                    const fuseRatio = Math.max(0, Math.min(1, (b.fuse || 0) / Math.max(0.01, b.maxFuse || 1)));
                    return {
                        char: b.char || 'o',
                        core: fuseRatio < 0.35 ? '!' : '.',
                        font: 27 + Math.sin((renderNow || 0) * 0.02 + (b.spin || 0)) * 2,
                        coreFont: fuseRatio < 0.35 ? 12 : 8,
                        color: fuseRatio < 0.35 ? '#fff2a8' : (b.color || '#d9c8ff'),
                        coreColor: fuseRatio < 0.35 ? '#ff5f7a' : '#ffffff',
                        glow: fuseRatio < 0.35 ? '#ff5f7a' : '#b99dff'
                    };
                }
                if (b.trinityBulletType === 'grenadeShard') {
                    return {
                        char: b.char || '+',
                        core: null,
                        font: 19,
                        color: b.color || '#8ff7ff',
                        glow: b.color || '#8ff7ff'
                    };
                }
                if (b.trinityBulletType === 'sword') {
                    return {
                        char: b.char || '/',
                        core: null,
                        font: Math.max(18, 34 * Math.max(0.2, b.life || 1)),
                        color: b.color || '#c8f4ff',
                        glow: '#c8f4ff'
                    };
                }
                if (b.trinityBulletType === 'spell') {
                    return {
                        char: b.char || '◇',
                        core: '·',
                        font: b.char === '∙' ? 18 : 27,
                        coreFont: 8,
                        color: b.color || '#d9c8ff',
                        coreColor: '#ffffff',
                        glow: b.color || '#b99dff'
                    };
                }
                return {
                    char: b.char || '✦',
                    core: b.char === '·' ? null : '·',
                    font: b.char === '·' ? 17 : 24,
                    coreFont: 8,
                    color: b.color || '#ffe27a',
                    coreColor: '#ffffff',
                    glow: '#ffe27a'
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
            const isWraithLarge = b.signalBulletType === 'wraithLarge';
            const allowGlow = glowEnabled
                && !(typeof isCheapSoftGlowQuality === 'function' && isCheapSoftGlowQuality())
                && load <= (isWraithLarge ? 18 : BOSS_PROJECTILE_GLOW_LIMIT)
                && !b.isPhantomBullet;
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

        function drawMatrixRainColumnProjectile(b, renderNow) {
            const chars = String(b.char || '101010').split('');
            const gap = b.matrixGlyphGap || 16;
            const phase = renderNow * 0.006 + (b.x || 0) * 0.011;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 15px Courier New`;
            for (let i = chars.length - 1; i >= 0; i--) {
                const y = b.y - i * gap;
                if (y < -40 || y > height + 40) continue;
                const head = i === 0;
                const second = i === 1;
                const tailT = 1 - i / Math.max(1, chars.length - 1);
                const flicker = 0.82 + Math.sin(phase + i * 1.37) * 0.18;
                ctx.globalAlpha = head
                    ? 0.95
                    : Math.max(0.05, (b.matrixTrailAlpha || 0.5) * tailT * tailT * flicker);
                ctx.fillStyle = head ? '#effff2' : (second ? '#baffc8' : (i % 3 === 0 ? '#7dff95' : '#00ff41'));
                if (glowEnabled && head) {
                    ctx.shadowColor = '#00ff41';
                    ctx.shadowBlur = 14;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.fillText(chars[i], snapSpriteCoord(b.x + Math.sin(phase + i) * (head ? 0.5 : 1.4)), snapSpriteCoord(y));
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            return true;
        }

        function drawBossProjectileVisual(b, renderNow) {
            if (b.isMatrixRainColumn) return drawMatrixRainColumnProjectile(b, renderNow);
            if (b.isCodeLine) return false;
            if (
                b.isPhantomBullet ||
                b.isSignalPulse ||
                b.isSignalYBullet ||
                b.isFirewallBullet ||
                b.isStarshipBullet ||
                b.isEclipseBullet ||
                b.isTrinityBullet ||
                b.isDreadBullet ||
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
        const PAUSE_GLOW_TEXT_CACHE_MAX = 180;
        const pauseGlowTextCache = new Map();
        const pauseMenuBackdropGradientCache = {
            width: 0,
            height: 0,
            bgColor: '',
            gradient: null
        };

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

        function drawPauseGlowTextDirect(targetCtx, text, x, y, font, color, selected = false) {
            targetCtx.save();
            targetCtx.font = font;
            targetCtx.textAlign = 'center';
            targetCtx.textBaseline = 'middle';
            targetCtx.lineJoin = 'round';

            targetCtx.strokeStyle = 'rgba(2, 8, 14, 0.88)';
            targetCtx.shadowColor = 'rgba(2, 8, 14, 0.9)';
            targetCtx.globalAlpha = selected ? 0.82 : 0.42;
            targetCtx.shadowBlur = selected ? 24 : 10;
            targetCtx.lineWidth = selected ? 10 : 6;
            targetCtx.strokeText(text, x | 0, y | 0);

            targetCtx.globalAlpha = selected ? 0.72 : 0.28;
            targetCtx.shadowBlur = selected ? 10 : 4;
            targetCtx.lineWidth = selected ? 5 : 3;
            targetCtx.strokeText(text, x | 0, y | 0);

            targetCtx.globalAlpha = 1;
            if (glowEnabled) {
                targetCtx.shadowColor = selected ? color : PAUSE_MENU_GLOW_COLOR;
                targetCtx.shadowBlur = selected ? 18 : 7;
            } else {
                targetCtx.shadowBlur = 0;
            }
            targetCtx.fillStyle = color;
            targetCtx.fillText(text, x | 0, y | 0);
            targetCtx.restore();
        }

        function getPauseGlowTextSprite(text, font, color, selected = false) {
            if (typeof document === 'undefined') return null;
            const key = `${glowEnabled ? 1 : 0}\u0001${selected ? 1 : 0}\u0001${font}\u0001${color}\u0001${text}`;
            const cached = pauseGlowTextCache.get(key);
            if (cached) {
                pauseGlowTextCache.delete(key);
                pauseGlowTextCache.set(key, cached);
                return cached;
            }

            const fontMatch = /(\d+(?:\.\d+)?)px/.exec(font);
            const fontPx = fontMatch ? Number(fontMatch[1]) : 28;
            const measureCanvas = document.createElement('canvas');
            const measureCtx = measureCanvas.getContext('2d', { alpha: true });
            if (!measureCtx) return null;
            measureCtx.font = font;
            const metrics = measureCtx.measureText(text);
            const textW = Math.ceil(metrics.width || 1);
            const textH = Math.ceil(
                (metrics.actualBoundingBoxAscent || fontPx * 0.82) +
                (metrics.actualBoundingBoxDescent || fontPx * 0.28)
            );
            const padX = selected ? 56 : 34;
            const padY = selected ? 44 : 28;
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, textW + padX * 2);
            canvas.height = Math.max(1, textH + padY * 2);
            const spriteCtx = canvas.getContext('2d', { alpha: true });
            if (!spriteCtx) return null;
            drawPauseGlowTextDirect(spriteCtx, text, canvas.width / 2, canvas.height / 2, font, color, selected);

            const sprite = { canvas, w: canvas.width, h: canvas.height };
            pauseGlowTextCache.set(key, sprite);
            while (pauseGlowTextCache.size > PAUSE_GLOW_TEXT_CACHE_MAX) {
                pauseGlowTextCache.delete(pauseGlowTextCache.keys().next().value);
            }
            return sprite;
        }

        function getPauseMenuBackdropGradient() {
            if (
                pauseMenuBackdropGradientCache.gradient &&
                pauseMenuBackdropGradientCache.width === width &&
                pauseMenuBackdropGradientCache.height === height &&
                pauseMenuBackdropGradientCache.bgColor === currentBgColor
            ) {
                return pauseMenuBackdropGradientCache.gradient;
            }

            const overlay = ctx.createLinearGradient(0, 0, 0, height);
            overlay.addColorStop(0, colorWithAlpha(currentBgColor, 0.66));
            overlay.addColorStop(0.5, 'rgba(5, 13, 28, 0.72)');
            overlay.addColorStop(1, colorWithAlpha(currentBgColor, 0.78));
            pauseMenuBackdropGradientCache.width = width;
            pauseMenuBackdropGradientCache.height = height;
            pauseMenuBackdropGradientCache.bgColor = currentBgColor;
            pauseMenuBackdropGradientCache.gradient = overlay;
            return overlay;
        }

        function drawPauseGlowText(text, x, y, font, color, selected = false) {
            if (typeof canvasRenderScale === 'number' && canvasRenderScale > 1.01) {
                drawPauseGlowTextDirect(ctx, text, x, y, font, color, selected);
                return;
            }
            const sprite = getPauseGlowTextSprite(text, font, color, selected);
            if (sprite) {
                ctx.save();
                ctx.shadowBlur = 0;
                ctx.drawImage(sprite.canvas, Math.round(x - sprite.w / 2), Math.round(y - sprite.h / 2));
                ctx.restore();
                return;
            }
            drawPauseGlowTextDirect(ctx, text, x, y, font, color, selected);
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

        function getPauseCursorTargetForText(text, x, y, key, font = `bold 23px 'Electrolize', sans-serif`, scale = 0.29) {
            ctx.save();
            ctx.font = font;
            const metrics = ctx.measureText(text);
            const boxW = Math.max(1, metrics.width);
            ctx.restore();
            const fontMatch = /(\d+(?:\.\d+)?)px/.exec(font);
            const fontPx = fontMatch ? Number(fontMatch[1]) : 23;
            const offset = Math.max(25, fontPx * 1.08);
            return {
                x: Math.max(32, x - boxW / 2 - offset),
                y: y - 1,
                faceX: x,
                faceY: y,
                scale,
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
                const approachDistance = Math.hypot(activeTarget.x - cursor.x, activeTarget.y - cursor.y);
                if (approachDistance < 15) {
                    cursor.approachComplete = true;
                    if (target.floaty) {
                        cursor.vx *= 0.34;
                        cursor.vy *= 0.34;
                    }
                    activeTarget.x = target.x;
                    activeTarget.y = target.y;
                }
            }

            const dx = activeTarget.x - cursor.x;
            const dy = activeTarget.y - cursor.y;
            const floatyCursor = !!activeTarget.floaty;
            const distanceToActive = Math.hypot(dx, dy);
            const arrivalScale = floatyCursor ? Math.max(0.28, Math.min(1, distanceToActive / 190)) : 1;
            const cursorAccel = floatyCursor ? (7 + 9 * arrivalScale) : 34;
            cursor.vx += dx * cursorAccel * dt;
            cursor.vy += dy * cursorAccel * dt;

            const arrivalDrag = floatyCursor && distanceToActive < 120 ? 0.00055 : 0.012;
            const drag = Math.pow(floatyCursor ? arrivalDrag : 0.0009, dt);
            cursor.vx *= drag;
            cursor.vy *= drag;
            const speed = Math.hypot(cursor.vx, cursor.vy);
            const maxCursorSpeed = floatyCursor
                ? (150 + Math.min(1, distanceToActive / 210) * 230)
                : 760;
            if (speed > maxCursorSpeed) {
                const scale = maxCursorSpeed / speed;
                cursor.vx *= scale;
                cursor.vy *= scale;
            }

            if (floatyCursor && distanceToActive < 72) {
                const radialX = dx / Math.max(1, distanceToActive);
                const radialY = dy / Math.max(1, distanceToActive);
                const radialVelocity = cursor.vx * radialX + cursor.vy * radialY;
                const lateralX = cursor.vx - radialX * radialVelocity;
                const lateralY = cursor.vy - radialY * radialVelocity;
                const lateralBleed = Math.min(1, dt * 7.5);
                cursor.vx -= lateralX * lateralBleed;
                cursor.vy -= lateralY * lateralBleed;
            }

            cursor.x += cursor.vx * dt;
            cursor.y += cursor.vy * dt;
            cursor.scale += ((activeTarget.scale || 0.34) - cursor.scale) * Math.min(1, dt * 9);
            cursor.speed = Math.hypot(cursor.vx, cursor.vy);

            const distToTarget = Math.hypot(activeTarget.x - cursor.x, activeTarget.y - cursor.y);
            const isSettled = cursor.speed < 42 && distToTarget < 13;
            const isArriving = cursor.speed < 150 && distToTarget < 58;
            const settleRate = floatyCursor ? (isSettled ? 1.8 : (isArriving ? 0.9 : -2.2)) : (isSettled ? 2.8 : (isArriving ? 1.35 : -5));
            cursor.settleBlend = Math.max(0, Math.min(1, cursor.settleBlend + dt * settleRate));

            const travelRot = cursor.speed > 1
                ? Math.atan2(cursor.vy, cursor.vx) + Math.PI / 2
                : cursor.rot;
            const faceRot = Math.atan2(activeTarget.faceY - cursor.y, activeTarget.faceX - cursor.x) + Math.PI / 2;
            const distanceTravelWeight = Math.max(0, Math.min(1, (distToTarget - 16) / 65));
            const speedTravelWeight = Math.max(0, Math.min(1, (cursor.speed - 32) / 120));
            const travelWeight = distanceTravelWeight * speedTravelWeight * (1 - cursor.settleBlend * 0.65);
            const desiredRot = lerpPauseCursorAngle(faceRot, travelRot, travelWeight);
            const turnSpeed = floatyCursor ? (isArriving ? 3.2 : 4.8) : (isArriving ? 5.4 : 9);
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

        function emitPauseMenuShipExhaustTrail(cursor, now, speedRatio, emissionScale = 1, trailMax = PAUSE_CURSOR_TRAIL_MAX) {
            const state = pauseMenuShipCursor;
            const dt = Math.min(0.05, Math.max(0.001, cursor.dt || 0.016));
            const effectQuality = typeof getVisualQualityScale === 'function' ? getVisualQualityScale('effects') : 1;
            const qualityScale = Math.max(0.65, Math.min(1.22, effectQuality));
            state.trailEmitAcc += dt * (28 + speedRatio * 24) * Math.max(0, emissionScale) * qualityScale;
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

            const maxTrail = Math.max(8, Math.round((trailMax || PAUSE_CURSOR_TRAIL_MAX) * qualityScale));
            if (state.trail.length > maxTrail) {
                state.trail.splice(0, state.trail.length - maxTrail);
            }
        }

        function drawPauseMenuShipTrail(dt, alphaScale = 1, options = {}) {
            const trail = pauseMenuShipCursor.trail;
            if (!trail.length) return;
            const step = Math.min(0.05, Math.max(0.001, dt || 0.016));
            const alphaMult = Math.max(0, Math.min(1, alphaScale));
            const ionize = !!options.ionize;
            const ionColors = (options.ionColors && options.ionColors.length ? options.ionColors : [options.color, currentThemeColor, '#8ff7ff'])
                .filter(Boolean);
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
                ctx.globalAlpha = alphaMult * lifeRatio * (p.isSmoke ? (ionize ? 0.28 : 0.22) : (ionize ? 0.62 : 0.72));
                if (ionize) {
                    const ionColor = i % 6 === 0 ? '#ffffff' : (ionColors[i % Math.max(1, ionColors.length)] || currentThemeColor);
                    ctx.fillStyle = colorWithAlpha(ionColor, p.isSmoke ? 0.68 : 0.92);
                } else {
                    ctx.fillStyle = p.isSmoke ? p.color : getExhaustColor(lifeRatio);
                }
                const trailGlowBlur = (!p.isSmoke || ionize) && typeof getLiveGlowBlur === 'function'
                    ? getLiveGlowBlur((ionize && p.isSmoke ? 3 : 8) + lifeRatio * (ionize ? 7 : 8), ionize ? 'high' : 'normal', 1, 0.30)
                    : 0;
                if ((!p.isSmoke || ionize) && glowEnabled && (trailGlowBlur > 0 || typeof getLiveGlowBlur !== 'function')) {
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = typeof getLiveGlowBlur === 'function'
                        ? trailGlowBlur
                        : (ionize && p.isSmoke ? 3 : 8) + lifeRatio * (ionize ? 7 : 8);
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

        function drawWraithCellsFast(cells, startX, startY, colorOverride = null, offsetX = 0, offsetY = 0) {
            let lastColor = null;
            for (const cell of cells) {
                const color = colorOverride || cell.color || '#d8d9db';
                if (color !== lastColor) {
                    ctx.fillStyle = color;
                    lastColor = color;
                }
                ctx.fillText(
                    cell.char,
                    quantizeGlyphCoord(startX + cell.col * charW + offsetX),
                    quantizeGlyphCoord(startY + cell.row * charH + offsetY)
                );
            }
        }

        function drawWraithSpriteFast(e, flashColor = null, options = {}) {
            const cells = typeof WRAITH_VISIBLE_CELLS !== 'undefined' ? WRAITH_VISIBLE_CELLS : null;
            if (!cells || cells.length === 0 || !e || !e.sprite || e.sprite.length === 0) return false;

            const renderScale = e.renderScale || 1;
            const startX = -(e.sprite[0].length * charW) / 2;
            const startY = -(e.sprite.length * charH) / 2;
            const renderX = snapSpriteCoord(e.x);
            const renderY = snapSpriteCoord(e.y);
            const haloColor = flashColor || '#dfefff';
            const baseAlpha = ctx.globalAlpha;

            ctx.save();
            ctx.translate(renderX, renderY);
            if (renderScale !== 1) ctx.scale(renderScale, renderScale);
            ctx.font = `bold 20px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 0;

            if (!options.suppressHalo && glowEnabled) {
                ctx.globalAlpha = baseAlpha * (flashColor ? 0.28 : 0.15);
                drawWraithCellsFast(cells, startX, startY, haloColor, -1.25, 0.75);
                ctx.globalAlpha = baseAlpha * (flashColor ? 0.22 : 0.11);
                drawWraithCellsFast(cells, startX, startY, '#9bdcff', 1.35, -0.65);
                ctx.globalAlpha = baseAlpha;
            }

            drawWraithCellsFast(cells, startX, startY, flashColor);
            ctx.restore();
            ctx.globalAlpha = baseAlpha;
            ctx.shadowBlur = 0;
            return true;
        }

        function getFirewallGuardianColor(heat, flashColor = null) {
            if (flashColor) return flashColor;
            const h = Math.max(0, Math.min(1, heat));
            if (h > 0.86) return '#fff2a8';
            if (h > 0.68) return '#ffdd66';
            if (h > 0.46) return '#ff8a18';
            if (h > 0.27) return '#e01926';
            return '#6e1735';
        }

        function getFirewallGuardianChar(cell, heat) {
            if (cell.char === '▄' || cell.char === '▀') return cell.char;
            const idx = Math.max(1, Math.min(4, Math.round(heat * 4)));
            return FIREWALL_FIRE_CHARS[idx] || cell.char;
        }

        function drawFirewallGuardianSpriteFast(e, flashColor = null, renderNow = currentFrameNow, options = {}) {
            const cells = typeof FIREWALL_GUARDIAN_VISIBLE_CELLS !== 'undefined'
                ? FIREWALL_GUARDIAN_VISIBLE_CELLS
                : null;
            if (!cells || cells.length === 0 || !e || !e.sprite || e.sprite.length === 0) return false;

            const phase = (e.firePhase || 0) + renderNow * 0.0035;
            const startX = -(e.sprite[0].length * charW) / 2;
            const startY = -(e.sprite.length * charH) / 2;
            const renderX = snapSpriteCoord(e.x);
            const renderY = snapSpriteCoord(e.y);
            const baseAlpha = ctx.globalAlpha;

            ctx.save();
            ctx.translate(renderX, renderY);
            ctx.font = `bold 20px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 0;

            if (!options.suppressHalo && glowEnabled) {
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = baseAlpha * (flashColor ? 0.28 : 0.16);
                ctx.fillStyle = flashColor || '#ff8a18';
                for (const cell of cells) {
                    ctx.fillText(
                        cell.char,
                        quantizeGlyphCoord(startX + cell.col * charW - 1.2),
                        quantizeGlyphCoord(startY + cell.row * charH + 1.4)
                    );
                }
                ctx.globalAlpha = baseAlpha * (flashColor ? 0.2 : 0.09);
                ctx.fillStyle = '#fff2a8';
                for (const cell of cells) {
                    ctx.fillText(
                        cell.char,
                        quantizeGlyphCoord(startX + cell.col * charW + 1.1),
                        quantizeGlyphCoord(startY + cell.row * charH - 0.8)
                    );
                }
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = baseAlpha;
            }

            let lastColor = null;
            for (const cell of cells) {
                const wave = Math.sin(phase + cell.row * 0.82 + cell.col * 0.38) * 0.15 +
                    Math.cos(phase * 0.7 - cell.row * 0.44 + cell.col * 0.21) * 0.09;
                const heat = Math.max(0, Math.min(1, cell.baseHeat + wave));
                const color = getFirewallGuardianColor(heat, flashColor);
                if (color !== lastColor) {
                    ctx.fillStyle = color;
                    lastColor = color;
                }
                const xWobble = Math.sin(phase * 0.8 + cell.row * 0.7) * (0.35 + cell.rowRatio * 1.1);
                const yWobble = Math.cos(phase * 1.2 + cell.col * 0.4) * (0.25 + (1 - cell.rowRatio) * 0.55);
                ctx.fillText(
                    getFirewallGuardianChar(cell, heat),
                    quantizeGlyphCoord(startX + cell.col * charW + xWobble),
                    quantizeGlyphCoord(startY + cell.row * charH + yWobble)
                );
            }
            ctx.restore();
            ctx.globalAlpha = baseAlpha;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 0;
            return true;
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
                    const trailFlash = colorWithAlpha(trailColor, 0.85);
                    if (typeof drawCachedEnemyShipSprite !== 'function' || !drawCachedEnemyShipSprite(e, trailFlash, { staticFrame: true })) {
                        drawEnemyShipSprite(e, trailFlash);
                    }
                } else if (e.isFlyBy) {
                    const flyByScale = e.flyByScale || 1.55;
                    const localX = -(e.sprite[0].length * charW) / 2;
                    const localY = -(e.sprite.length * charH) / 2;
                    ctx.translate(snapSpriteCoord(e.x), snapSpriteCoord(e.y));
                    ctx.scale(flyByScale, flyByScale);
                    ctx.font = `bold 20px Courier New`;
                    drawAsciiSprite(e.sprite, localX, localY, colorWithAlpha(trailColor, 0.78));
                } else if (e.isFlameGuardian) {
                    drawFirewallGuardianSpriteFast(e, colorWithAlpha(trailColor, 0.78), currentFrameNow, { suppressHalo: true });
                } else if (e.isWraith) {
                    drawWraithSpriteFast(e, colorWithAlpha(trailColor, 0.78), { suppressHalo: true });
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

        function drawNullPhantomFocusBossTrail(bossObj, intensity, color) {
            if (typeof getNullPhantomRenderLayout !== 'function' || typeof getNullPhantomGlyphPosition !== 'function') return false;
            const cells = typeof NULL_PHANTOM_VISIBLE_CELLS !== 'undefined' ? NULL_PHANTOM_VISIBLE_CELLS : null;
            const layout = getNullPhantomRenderLayout(bossObj);
            const trailColor = colorWithAlpha(color, 0.75);
            ctx.save();
            ctx.font = `bold ${Math.max(4, Math.round(layout.fontSize || NULL_PHANTOM_FONT_SIZE))}px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = trailColor;
            ctx.shadowBlur = 0;
            for (let layer = 2; layer >= 1; layer--) {
                const offset = getFocusTrailOffset(bossObj, layer, 0.018);
                ctx.save();
                ctx.globalAlpha *= intensity * (layer === 2 ? 0.08 : 0.13);
                ctx.translate(offset.x, offset.y);
                if (cells) {
                    for (const cell of cells) {
                        const glyphPos = getNullPhantomGlyphPosition(layout, cell.row, cell.col);
                        ctx.fillText(cell.char, glyphPos.x | 0, glyphPos.y | 0);
                    }
                } else {
                    for (let r = 0; r < bossObj.sprite.length; r++) {
                        const row = bossObj.sprite[r] || '';
                        for (let c = 0; c < row.length; c++) {
                            const char = row[c];
                            if (char === ' ') continue;
                            const glyphPos = getNullPhantomGlyphPosition(layout, r, c);
                            ctx.fillText(char, glyphPos.x | 0, glyphPos.y | 0);
                        }
                    }
                }
                ctx.restore();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            return true;
        }

        function drawFocusBossTrail(bossObj) {
            const intensity = getFocusTrailIntensity();
            if (intensity <= 0.04 || !bossObj || !bossObj.sprite || bossObj.sprite.length === 0) return;
            if (bossObj.name === 'NULL PHANTOM') {
                const color = bossObj.flashTimer > 0 ? '#ffffff' : (bossObj.color || currentThemeColor);
                if (drawNullPhantomFocusBossTrail(bossObj, intensity, color)) return;
            }
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
                if (bossObj.name === 'OVERHEATING FIREWALL' && typeof FIREWALL_VISIBLE_CELLS !== 'undefined') {
                    drawWraithCellsFast(FIREWALL_VISIBLE_CELLS, bSX, bSY, colorWithAlpha(color, 0.75));
                } else {
                    drawAsciiSprite(bossObj.sprite, bSX, bSY, colorWithAlpha(color, 0.75));
                }
                ctx.restore();
            }
            ctx.globalAlpha = 1;
        }

        function drawBossHealthBar(bossObj, options = {}) {
            if (!bossObj) return;
            const { barW, barH, barX, barY, nameY } = getBossBarLayout();
            const rawRatio = Number.isFinite(options.ratio)
                ? options.ratio
                : (bossObj.maxHp > 0 ? bossObj.hp / bossObj.maxHp : 0);
            const ratio = Math.max(0, Math.min(1, rawRatio));
            const accent = options.color || bossObj.color || currentThemeColor;
            const labelColor = options.labelColor || colorWithAlpha('#f2fbff', 0.92);
            const label = options.label || bossObj.name || 'BOSS';
            const pad = 2;
            const innerX = barX + pad;
            const innerY = barY + pad;
            const innerW = Math.max(0, barW - pad * 2);
            const innerH = Math.max(3, barH - pad * 2);
            const fillW = Math.max(0, Math.min(innerW, innerW * ratio));

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalCompositeOperation = 'source-over';

            ctx.font = `bold 13px 'Electrolize', sans-serif`;
            ctx.fillStyle = labelColor;
            if (glowEnabled) {
                ctx.shadowColor = accent;
                ctx.shadowBlur = 9;
            }
            ctx.fillText(label, (width / 2) | 0, nameY | 0);
            ctx.shadowBlur = 0;

            const panelFill = ctx.createLinearGradient(barX, barY, barX, barY + barH);
            panelFill.addColorStop(0, 'rgba(8, 18, 34, 0.76)');
            panelFill.addColorStop(0.5, 'rgba(3, 8, 18, 0.88)');
            panelFill.addColorStop(1, 'rgba(0, 2, 8, 0.94)');
            ctx.fillStyle = panelFill;
            ctx.fillRect(barX | 0, barY | 0, barW, barH);

            ctx.strokeStyle = colorWithAlpha(accent, 0.42);
            ctx.lineWidth = 1;
            ctx.strokeRect((barX - 1) | 0, (barY - 1) | 0, barW + 2, barH + 2);
            ctx.strokeStyle = 'rgba(220, 236, 255, 0.22)';
            ctx.strokeRect(barX | 0, barY | 0, barW, barH);

            ctx.fillStyle = 'rgba(4, 8, 18, 0.82)';
            ctx.fillRect(innerX | 0, innerY | 0, innerW, innerH);

            if (fillW > 0) {
                const fill = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY);
                fill.addColorStop(0, colorWithAlpha(accent, 0.46));
                fill.addColorStop(0.68, colorWithAlpha(accent, 0.86));
                fill.addColorStop(1, colorWithAlpha('#ffffff', 0.94));
                ctx.fillStyle = fill;
                ctx.fillRect(innerX | 0, innerY | 0, fillW, innerH);

                ctx.globalAlpha = 0.36;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(innerX | 0, innerY | 0, fillW, 1);
                ctx.globalAlpha = 1;
            }

            ctx.globalAlpha = 0.18;
            ctx.strokeStyle = '#dcecff';
            ctx.lineWidth = 1;
            const tickCount = 12;
            for (let i = 1; i < tickCount; i++) {
                const x = innerX + (innerW * i) / tickCount;
                ctx.beginPath();
                ctx.moveTo(x | 0, innerY);
                ctx.lineTo(x | 0, innerY + innerH);
                ctx.stroke();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function getFocusWarpOverlayBounds(playfieldH) {
            const scale = typeof bossCameraZoomScale === 'number' && Number.isFinite(bossCameraZoomScale)
                ? Math.max(0.5, bossCameraZoomScale)
                : 1;
            if (scale >= 0.999) return { x: 0, y: 0, w: width, h: playfieldH };
            const centerX = width / 2;
            const centerY = playfieldH / 2;
            const pad = 24;
            return {
                x: centerX - width / (2 * scale) - pad,
                y: centerY - playfieldH / (2 * scale) - pad,
                w: width / scale + pad * 2,
                h: playfieldH / scale + pad * 2
            };
        }

        function drawFocusTimeWarpOverlay(renderNow, foreground = false) {
            const intensity = getFocusTrailIntensity();
            if (intensity <= 0.025) return;
            ctx.save();
            ctx.globalCompositeOperation = foreground ? 'screen' : 'source-over';
            const playfieldH = height - HUD_HEIGHT;
            const bounds = getFocusWarpOverlayBounds(playfieldH);
            if (!foreground) {
                ctx.globalAlpha = 0.05 * intensity;
                ctx.fillStyle = '#68ff9a';
                ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                ctx.globalAlpha = 0.09 * intensity;
                ctx.strokeStyle = colorWithAlpha('#9effc1', 0.6);
                ctx.lineWidth = 1;
                const yStart = bounds.y + ((renderNow * 0.055) % 44) - 44;
                for (let y = yStart; y < bounds.y + bounds.h + 44; y += 44) {
                    const wobbleX = Math.sin(renderNow * 0.004 + y * 0.018) * 7 * intensity;
                    ctx.beginPath();
                    ctx.moveTo(bounds.x, y);
                    ctx.lineTo(bounds.x + bounds.w * 0.34 + wobbleX, y + 2);
                    ctx.lineTo(bounds.x + bounds.w * 0.68 - wobbleX, y - 2);
                    ctx.lineTo(bounds.x + bounds.w, y);
                    ctx.stroke();
                }
            } else {
                ctx.globalAlpha = 0.06 * intensity;
                ctx.fillStyle = '#caffda';
                const xStart = bounds.x + ((renderNow * 0.028) % 96) - 96;
                for (let x = xStart; x < bounds.x + bounds.w + 96; x += 96) {
                    const topDrift = Math.sin(renderNow * 0.003 + x * 0.04) * 18 * intensity;
                    ctx.fillRect(x + topDrift, bounds.y, 1, bounds.h);
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
            PAUSE_CURSOR_SHIP.shipId = typeof getSelectedShipConfig === 'function' ? getSelectedShipConfig().id : 'arrowhead';
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
            const cell = 38;
            const gap = 7;
            const tableW = cols * cell + (cols - 1) * gap;
            const tableH = 2 * cell + gap;
            const tableX = Math.round(width / 2 - tableW / 2);
            const focused = pauseSelection === -1 && player.weapons.length > 0;
            const selectedIndex = Math.max(0, Math.min(Math.max(0, player.weapons.length - 1), pausePowerupSelection));
            pausePowerupSelection = selectedIndex;
            const detailPanelH = 76;
            const detailGap = 14;
            const detailInset = 16;
            const detailBottomPad = 12;
            const detailH = focused ? detailGap + detailPanelH + detailBottomPad : 0;
            const panelX = tableX - 12;
            const panelY = tableY - 26;
            const panelW = tableW + 24;
            const panelH = tableH + 38 + detailH;
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
            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            drawPauseGlowText('POWERUPS', tableX + tableW / 2, tableY - 13, `bold 11px 'Electrolize', sans-serif`, ctx.fillStyle, focused);

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
                        scale: 0.18,
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
                    const iconSize = isSelected ? (isChainLightning ? 25 : Math.round(26 + iconPulse * 3)) : 25;
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
                drawPausePowerupDetail(
                    player.weapons[selectedIndex],
                    panelX + detailInset,
                    tableY + tableH + detailGap,
                    panelW - detailInset * 2
                );
            }
            ctx.restore();
            return cursorTarget;
        }

        function getWeaponPowerupPanelSourceRect() {
            const cols = 5;
            const cell = 38;
            const gap = 7;
            const tableW = cols * cell + (cols - 1) * gap;
            const tableH = 2 * cell + gap;
            const panelW = tableW + 24;
            const panelH = tableH + 38 + 102;
            return {
                x: Math.round(width / 2 - panelW / 2),
                y: Math.round(Math.max(54, height * 0.072)),
                w: panelW,
                h: panelH
            };
        }

        function getWeaponPanelNoticeColor(kind, fallback) {
            if (kind === 'success') return '#77ffb0';
            if (kind === 'error') return '#ff7799';
            if (kind === 'warn') return '#ffd166';
            return fallback || currentThemeColor;
        }

        function drawWeaponPowerupControlPanelContent(panelX, panelY, panelW, panelH) {
            const state = typeof getWeaponPowerupPanelState === 'function' ? getWeaponPowerupPanelState() : null;
            const weapons = typeof WEAPON_POOL !== 'undefined' ? WEAPON_POOL : [];
            if (!state || !weapons.length) return;
            const selectedIndex = Math.max(0, Math.min(weapons.length - 1, state.selection || 0));
            state.selection = selectedIndex;
            const selectedWeapon = weapons[selectedIndex];
            const accent = selectedWeapon && selectedWeapon.color ? selectedWeapon.color : currentThemeColor;
            const now = currentFrameNow || performance.now();
            const pad = 24;
            const headerY = panelY + 28;
            const cols = typeof getWeaponPowerupPanelColumns === 'function' ? getWeaponPowerupPanelColumns() : 5;
            const rows = Math.ceil(weapons.length / cols);
            const gridGap = 9;
            const cell = Math.max(42, Math.min(58, Math.floor((panelH - 150 - (rows - 1) * gridGap) / rows)));
            const gridW = cols * cell + (cols - 1) * gridGap;
            const gridH = rows * cell + (rows - 1) * gridGap;
            const gridX = panelX + pad;
            const gridY = panelY + 78;
            const detailX = gridX + gridW + 28;
            const detailY = gridY;
            const detailW = Math.max(260, panelX + panelW - pad - detailX);
            const detailH = gridH;
            const activeCount = player && player.weapons ? player.weapons.length : 0;

            drawPauseHudPanel(panelX, panelY, panelW, panelH, accent, true, {
                fillAlpha: 0.90,
                borderAlpha: 0.78,
                rail: true,
                edgeWashAlpha: 0.010,
                innerSheenAlpha: 0.004
            });

            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 22px 'Electrolize', sans-serif`;
            ctx.fillStyle = mixColor(accent, '#ffffff', 0.46);
            if (glowEnabled) {
                ctx.shadowColor = accent;
                ctx.shadowBlur = 12;
            }
            ctx.fillText('WEAPON POWERUP CONTROL', panelX + pad, headerY);
            ctx.shadowBlur = 0;

            ctx.textAlign = 'right';
            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#dcecff', 0.72);
            ctx.fillText(`ACTIVE ${activeCount}/10`, panelX + panelW - pad, headerY);

            ctx.textAlign = 'left';
            ctx.font = `bold 10px Courier New`;
            ctx.fillStyle = colorWithAlpha(mixColor(accent, '#ffffff', 0.35), 0.70);
            ctx.fillText('DEV LOADOUT MATRIX', panelX + pad, panelY + 54);

            for (let i = 0; i < weapons.length; i++) {
                const weapon = weapons[i];
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = gridX + col * (cell + gridGap);
                const y = gridY + row * (cell + gridGap);
                const selected = i === selectedIndex;
                const ownedCount = player && player.weapons
                    ? player.weapons.filter(w => w && w.name === weapon.name).length
                    : 0;

                ctx.fillStyle = selected ? colorWithAlpha(weapon.color, 0.18) : 'rgba(210,235,255,0.075)';
                ctx.fillRect(x | 0, y | 0, cell | 0, cell | 0);
                ctx.strokeStyle = selected
                    ? mixColor(weapon.color, '#ffffff', 0.28)
                    : colorWithAlpha(weapon.color || currentThemeColor, ownedCount ? 0.48 : 0.24);
                ctx.lineWidth = selected ? 2.5 : 1;
                if (selected && glowEnabled) {
                    ctx.shadowColor = weapon.color;
                    ctx.shadowBlur = 16;
                }
                ctx.strokeRect((x + 0.5) | 0, (y + 0.5) | 0, cell | 0, cell | 0);
                ctx.shadowBlur = 0;
                if (ownedCount > 0) {
                    ctx.fillStyle = colorWithAlpha(weapon.color, 0.44);
                    ctx.fillRect((x + 2) | 0, (y + 2) | 0, 3, Math.max(0, cell - 4) | 0);
                }
                drawPowerupIcon(weapon, x + cell / 2, y + cell / 2 + 1, selected ? cell * 0.66 : cell * 0.58, selected);
                if (ownedCount > 0) {
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'top';
                    ctx.font = `bold ${Math.max(9, Math.round(cell * 0.18))}px Courier New`;
                    ctx.fillStyle = colorWithAlpha('#ffffff', 0.82);
                    ctx.fillText(`x${ownedCount}`, x + cell - 4, y + 4);
                    ctx.textBaseline = 'middle';
                }
            }

            drawPauseHudPanel(detailX, detailY, detailW, detailH, accent, true, {
                fillAlpha: 0.78,
                borderAlpha: 0.58,
                rail: false,
                edgeWashAlpha: 0.006,
                innerSheenAlpha: 0.003
            });

            const iconBox = Math.min(104, Math.max(76, detailW * 0.24));
            const iconX = detailX + 18 + iconBox / 2;
            const iconY = detailY + 22 + iconBox / 2;
            ctx.fillStyle = colorWithAlpha(accent, 0.09);
            ctx.fillRect((detailX + 18) | 0, (detailY + 22) | 0, iconBox | 0, iconBox | 0);
            ctx.strokeStyle = colorWithAlpha(accent, 0.42);
            ctx.lineWidth = 1;
            ctx.strokeRect((detailX + 18.5) | 0, (detailY + 22.5) | 0, iconBox | 0, iconBox | 0);
            drawPowerupIcon(selectedWeapon, iconX, iconY, iconBox * 0.58, true);

            const textX = detailX + 34 + iconBox;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.font = `bold ${Math.max(17, Math.min(24, detailW * 0.045))}px 'Electrolize', sans-serif`;
            ctx.fillStyle = mixColor(accent, '#ffffff', 0.35);
            ctx.fillText(selectedWeapon.name.toUpperCase(), textX, detailY + 24);
            ctx.font = `bold 10px Courier New`;
            ctx.fillStyle = colorWithAlpha(mixColor(accent, '#ffffff', 0.55), 0.84);
            ctx.fillText(selectedWeapon.cat.toUpperCase(), textX, detailY + 55);

            ctx.font = `12px 'Electrolize', sans-serif`;
            ctx.fillStyle = 'rgba(226, 240, 255, 0.90)';
            const descLines = wrapPauseText(selectedWeapon.desc || '', Math.max(120, detailW - iconBox - 56), 3);
            for (let i = 0; i < descLines.length; i++) {
                ctx.fillText(descLines[i], textX, detailY + 76 + i * 15);
            }

            const stats = typeof getWeaponPowerupStatLines === 'function' ? getWeaponPowerupStatLines(selectedWeapon) : [];
            const statsY = detailY + 142;
            ctx.font = `bold 10px Courier New`;
            ctx.fillStyle = colorWithAlpha(accent, 0.72);
            ctx.fillText('SIGNATURE', detailX + 18, statsY);
            ctx.font = `bold 12px Courier New`;
            for (let i = 0; i < stats.length; i++) {
                const col = i < 5 ? 0 : 1;
                const statX = detailX + 18 + col * Math.max(138, detailW * 0.46);
                const statY = statsY + 20 + (i % 5) * 20;
                ctx.fillStyle = i % 2 === 0 ? colorWithAlpha('#ffffff', 0.84) : colorWithAlpha(mixColor(accent, '#ffffff', 0.54), 0.84);
                ctx.fillText(stats[i], statX, statY);
            }

            const footerY = panelY + panelH - 28;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 10px Courier New`;
            const noticeActive = state.notice && now < state.noticeUntil;
            ctx.fillStyle = noticeActive
                ? getWeaponPanelNoticeColor(state.noticeKind, accent)
                : colorWithAlpha('#dcecff', 0.56);
            ctx.fillText(noticeActive ? state.notice : 'ARROWS/WASD SELECT   ENTER APPLY   ESC CLOSE', panelX + pad, footerY);

            ctx.textAlign = 'right';
            ctx.fillStyle = colorWithAlpha(mixColor(accent, '#ffffff', 0.36), 0.72);
            ctx.fillText(`${String(selectedIndex + 1).padStart(2, '0')} / ${String(weapons.length).padStart(2, '0')}`, panelX + panelW - pad, footerY);
        }

        function drawWeaponPowerupControlPanel() {
            if (typeof isWeaponPowerupPanelOpen !== 'function' || !isWeaponPowerupPanelOpen()) return;
            const state = typeof getWeaponPowerupPanelState === 'function' ? getWeaponPowerupPanelState() : null;
            const now = currentFrameNow || performance.now();
            const openAge = state && Number.isFinite(state.openedAt) ? Math.max(0, now - state.openedAt) : 999;
            const t = Math.max(0, Math.min(1, openAge / 180));
            const ease = t * t * (3 - 2 * t);
            const targetW = Math.min(width - 72, 900);
            const targetH = Math.min(height - 82, 560);
            const target = {
                x: Math.round((width - targetW) / 2),
                y: Math.round((height - targetH) / 2),
                w: targetW,
                h: targetH
            };
            const source = getWeaponPowerupPanelSourceRect();
            const rect = {
                x: source.x + (target.x - source.x) * ease,
                y: source.y + (target.y - source.y) * ease,
                w: source.w + (target.w - source.w) * ease,
                h: source.h + (target.h - source.h) * ease
            };

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.20 + ease * 0.42;
            ctx.fillStyle = '#00040d';
            ctx.fillRect(0, 0, width | 0, height | 0);
            ctx.globalAlpha = 0.86 + ease * 0.14;
            ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
            ctx.scale(rect.w / target.w, rect.h / target.h);
            ctx.translate(-(target.x + target.w / 2), -(target.y + target.h / 2));
            drawWeaponPowerupControlPanelContent(target.x, target.y, target.w, target.h);
            ctx.restore();
        }

        function drawPauseMenu() {
            ctx.fillStyle = getPauseMenuBackdropGradient();
            ctx.fillRect(0, 0, width | 0, height | 0);
            ctx.fillStyle = colorWithAlpha(currentThemeColor, 0.035);
            ctx.fillRect(0, 0, width | 0, height | 0);
            const midX = width / 2;
            let shipCursorTarget = null;

            if (pauseState === 'MAIN') {
                const options = getPauseMenuOptions();
                const pauseFont = `bold 23px 'Electrolize', sans-serif`;
                const pauseOptionGap = 58;
                const showPowerups = isPausePowerupMenuAvailable();
                const powerupCell = 38;
                const powerupGap = 7;
                const powerupDetailReserve = showPowerups ? 102 : 0;
                const powerupPanelH = showPowerups ? 2 * powerupCell + powerupGap + 38 + powerupDetailReserve : 0;
                const textBlockH = (options.length - 1) * pauseOptionGap;
                const powerupPanelTop = Math.round(Math.max(54, height * 0.072));
                const powerupTableY = showPowerups ? powerupPanelTop + 26 : Math.round(height * 0.78);
                const menuTopAfterPowerups = powerupPanelTop + powerupPanelH + 54;
                const preferredMidY = showPowerups
                    ? menuTopAfterPowerups
                    : Math.round(height * 0.30);
                const maxMidY = Math.round(height - Math.max(112, height * 0.12) - textBlockH);
                const minMidY = Math.round(height * 0.16);
                const midY = showPowerups
                    ? Math.max(menuTopAfterPowerups, Math.min(preferredMidY, maxMidY))
                    : Math.max(minMidY, Math.min(preferredMidY, maxMidY));
                if (showPowerups) shipCursorTarget = drawPausePowerupBar(powerupTableY);
                const volumeIndex = options.indexOf('VOLUME');

                options.forEach((opt, i) => {
                    const isSel = pauseSelection === i;
                    const y = midY + i * pauseOptionGap;
                    const color = isSel
                        ? mixColor(currentThemeColor, '#ffffff', 0.62)
                        : colorWithAlpha(mixColor(currentThemeColor, '#dcecff', 0.34), 0.74);
                    if (isSel) shipCursorTarget = getPauseCursorTargetForText(opt, midX, y, `main-${i}`, pauseFont, 0.29);
                    drawPauseGlowText(opt, midX, y, pauseFont, color, isSel);

                    if (i === volumeIndex) {
                        const blocks = Math.round(currentVolume * 20);
                        const barStr = '▓'.repeat(blocks) + '░'.repeat(20 - blocks);
                        const muteStr = isMuted ? ' MUTE' : '';
                        const barY = (y + 20) | 0;
                        ctx.textAlign = 'left';
                        ctx.font = `bold 15px Courier New`;
                        const bracketW = ctx.measureText('[').width;
                        ctx.font = `bold 9px Courier New`;
                        const blockBarW = ctx.measureText(barStr).width;
                        const totalW = bracketW * 2 + blockBarW;
                        const startX = midX - totalW / 2;
                        ctx.fillStyle = color;
                        ctx.font = `bold 15px Courier New`;
                        ctx.fillText('[', startX | 0, barY);
                        ctx.font = `bold 9px Courier New`;
                        ctx.fillText(barStr, (startX + bracketW) | 0, barY);
                        ctx.font = `bold 15px Courier New`;
                        ctx.fillText(']' + muteStr, (startX + bracketW + blockBarW) | 0, barY);
                        ctx.textAlign = 'center';
                    }
                    ctx.shadowBlur = 0;
                });
                drawPauseMenuShipCursor(shipCursorTarget);
            } else if (pauseState === 'SETTINGS' || pauseState === 'GRAPHICS') {
                const settingsFont = `bold 21px 'Electrolize', sans-serif`;
                const settingsGap = 58;
                const options = pauseState === 'GRAPHICS'
                    ? [
                        'FPS CAP 60: < ' + (userFpsCap ? 'ON' : 'OFF') + ' >',
                        'CANVAS SHARP: < ' + (typeof getCanvasSharpnessLabel === 'function' ? getCanvasSharpnessLabel() : 'PERFORMANCE 1.00X') + ' >',
                        'CANVAS FILTER: < ' + (typeof getCanvasFilterLabel === 'function' ? getCanvasFilterLabel() : 'PIXEL') + ' >',
                        'GLOW QUALITY: < ' + (typeof getGlowQualityLabel === 'function' ? getGlowQualityLabel() : (glowEnabled ? 'SOFT' : 'OFF')) + ' >',
                        'VISUAL QUALITY: < ' + (typeof getVisualQualityLabel === 'function' ? getVisualQualityLabel() : 'NORMAL') + ' >',
                        'AUTO ADJUST SETTINGS',
                        'GO BACK'
                    ]
                    : [
                        'THEME: < ' + themes[currentThemeIndex] + ' >',
                        'SHOW FPS: < ' + (showFpsCounter ? 'ON' : 'OFF') + ' >',
                        'SHOW STATS: < ' + (showStatsPanel ? 'ON' : 'OFF') + ' >',
                        'SURVIVOR AIM: < ' + (survivorEightWayAimEnabled ? '8-WAY' : 'ROTATE') + ' >',
                        'GO BACK'
                    ];
                const midY = Math.round(height / 2 - ((options.length - 1) * settingsGap) / 2 - 8);
                options.forEach((opt, i) => {
                    const isSel = settingsSelection === i;
                    const y = midY + i * settingsGap;
                    const color = isSel
                        ? mixColor(currentThemeColor, '#ffffff', 0.62)
                        : colorWithAlpha(mixColor(currentThemeColor, '#dcecff', 0.34), 0.74);
                    if (isSel) shipCursorTarget = getPauseCursorTargetForText(opt, midX, y, `${pauseState.toLowerCase()}-${i}`, settingsFont, 0.27);
                    drawPauseGlowText(opt, midX, y, settingsFont, color, isSel);
                    ctx.shadowBlur = 0;
                });
                drawPauseMenuShipCursor(shipCursorTarget);
            }
        }

        function getGraphicsBenchmarkPlayRect() {
            const marginX = Math.max(36, Math.round(width * 0.055));
            const top = Math.max(82, Math.round(height * 0.10));
            const bottomReserve = Math.max(230, Math.round(height * 0.26));
            return {
                x: marginX,
                y: top,
                w: Math.max(320, width - marginX * 2),
                h: Math.max(300, height - top - bottomReserve)
            };
        }

        function benchmarkClamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function benchmarkRandom(state) {
            state.rngState = (Math.imul(state.rngState || 1, 1664525) + 1013904223) >>> 0;
            return state.rngState / 4294967296;
        }

        const GRAPHICS_BENCHMARK_SCENE_TRANSITION_SECONDS = 0.26;

        function buildGraphicsBenchmarkModeScenes() {
            return [
                {
                    id: 'binary',
                    label: 'BINARY QUASAR',
                    subtitle: 'BULLET ROUTE',
                    color: '#dcecff',
                    accent: '#8ff7ff'
                },
                {
                    id: 'prism',
                    label: 'PRISM ARRAY',
                    subtitle: 'SURVIVAL RUN',
                    color: '#bfffff',
                    accent: '#ff8fd8'
                },
                {
                    id: 'matrix',
                    label: 'MATRIX NEBULA',
                    subtitle: 'NODE CRAWLER',
                    color: '#65ffb8',
                    accent: '#9bffcf'
                },
                {
                    id: 'bitshift',
                    label: 'BITSHIFT DWARF',
                    subtitle: 'VECTOR SCROLL',
                    color: '#ff9a73',
                    accent: '#8ff7ff'
                }
            ];
        }

        function getGraphicsBenchmarkScene(state, index = null) {
            const scenes = state && state.modeScenes && state.modeScenes.length
                ? state.modeScenes
                : buildGraphicsBenchmarkModeScenes();
            const rawIndex = index === null ? (state ? state.sceneIndex || 0 : 0) : index;
            return scenes[Math.max(0, Math.min(scenes.length - 1, rawIndex))] || scenes[0];
        }

        function resetGraphicsBenchmarkSceneEntities(state, rect) {
            if (!state) return;
            const scene = getGraphicsBenchmarkScene(state);
            state.enemies.length = 0;
            state.enemyBullets.length = 0;
            state.playerShots.length = 0;
            state.particles.length = 0;
            if (state.bombBursts) state.bombBursts.length = 0;
            else state.bombBursts = [];
            state.boss = createGraphicsBenchmarkBoss(scene, rect);
            state.spawnClock = 0;
            state.bossClock = 0.12;
            state.bombClock = 0.58;
            state.shotClock = scene.id === 'binary' ? 0.08 : 0.12;
            state.sceneElapsed = 0;

            const pilot = state.pilot;
            if (scene.id === 'binary') {
                pilot.x = rect.x + rect.w * 0.50;
                pilot.y = rect.y + rect.h * 0.77;
                pilot.aimX = 0;
                pilot.aimY = -1;
            } else if (scene.id === 'prism') {
                pilot.x = rect.x + rect.w * 0.50;
                pilot.y = rect.y + rect.h * 0.52;
                pilot.aimX = 1;
                pilot.aimY = 0;
            } else if (scene.id === 'matrix') {
                pilot.x = rect.x + rect.w * 0.48;
                pilot.y = rect.y + rect.h * 0.56;
                pilot.aimX = 1;
                pilot.aimY = -0.15;
            } else {
                pilot.x = rect.x + rect.w * 0.23;
                pilot.y = rect.y + rect.h * 0.52;
                pilot.aimX = 1;
                pilot.aimY = 0;
            }
            pilot.vx = 0;
            pilot.vy = 0;

            const initialEnemies = scene.id === 'prism' ? 4 : (scene.id === 'matrix' ? 2 : 3);
            for (let i = 0; i < initialEnemies; i++) {
                spawnGraphicsBenchmarkEnemy(state, rect);
            }
            spawnGraphicsBenchmarkBossAttack(state, rect, true);
        }

        function updateGraphicsBenchmarkSceneTiming(state, dt, rect) {
            if (!state) return;
            if (!state.modeScenes || !state.modeScenes.length) state.modeScenes = buildGraphicsBenchmarkModeScenes();
            const sceneCount = Math.max(1, state.modeScenes.length);
            state.sceneDuration = Math.max(0.4, (state.profileDuration || GRAPHICS_BENCHMARK_PROFILE_SECONDS) / sceneCount);
            const targetSceneIndex = Math.min(sceneCount - 1, Math.floor((state.profileElapsed || 0) / state.sceneDuration));
            if (targetSceneIndex !== state.sceneIndex) {
                state.previousSceneIndex = state.sceneIndex;
                state.sceneIndex = targetSceneIndex;
                state.lastSceneIndex = targetSceneIndex;
                state.sceneTransition = GRAPHICS_BENCHMARK_SCENE_TRANSITION_SECONDS;
                resetGraphicsBenchmarkSceneEntities(state, rect);
            }
            state.sceneElapsed += dt;
            state.sceneTransition = Math.max(0, (state.sceneTransition || 0) - dt);
        }

        function getGraphicsBenchmarkStorageSnapshot() {
            const keys = [
                'ascii_fps_cap',
                'ascii_canvas_sharpness',
                'ascii_canvas_filter',
                'ascii_visual_quality',
                'ascii_glow_enabled',
                'ascii_glow_quality'
            ];
            const snapshot = {};
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                snapshot[key] = sessionStorage.getItem(key);
            }
            return snapshot;
        }

        function restoreGraphicsBenchmarkStorage(snapshot) {
            if (!snapshot) return;
            Object.keys(snapshot).forEach(key => {
                if (snapshot[key] === null || typeof snapshot[key] === 'undefined') {
                    sessionStorage.removeItem(key);
                } else {
                    sessionStorage.setItem(key, snapshot[key]);
                }
            });
        }

        function captureGraphicsBenchmarkSettings() {
            return {
                fpsCap: !!userFpsCap,
                canvasSharpnessIndex,
                canvasFilterIndex,
                visualQualityIndex,
                glowQuality: typeof getGlowQualityMode === 'function'
                    ? getGlowQualityMode()
                    : (glowEnabled ? 'FULL' : 'OFF')
            };
        }

        function clampGraphicsBenchmarkIndex(value, count, fallback = 0) {
            const n = Number.isFinite(value) ? Math.round(value) : fallback;
            return Math.max(0, Math.min(count - 1, n));
        }

        function applyGraphicsBenchmarkSettings(settings, persist = false) {
            if (!settings) return;
            const sharpIndex = clampGraphicsBenchmarkIndex(settings.canvasSharpnessIndex, CANVAS_SHARPNESS_OPTIONS.length, canvasSharpnessIndex);
            const filterIndex = clampGraphicsBenchmarkIndex(settings.canvasFilterIndex, CANVAS_FILTER_OPTIONS.length, canvasFilterIndex);
            const visualIndex = clampGraphicsBenchmarkIndex(settings.visualQualityIndex, VISUAL_QUALITY_OPTIONS.length, visualQualityIndex);
            const glowQuality = settings.glowQuality || settings.glow || 'OFF';

            if (persist) {
                userFpsCap = !!settings.fpsCap;
                sessionStorage.setItem('ascii_fps_cap', userFpsCap.toString());
                if (typeof setCanvasSharpnessIndex === 'function') setCanvasSharpnessIndex(sharpIndex);
                if (typeof setCanvasFilterIndex === 'function') setCanvasFilterIndex(filterIndex);
                if (typeof setVisualQualityIndex === 'function') setVisualQualityIndex(visualIndex);
                if (typeof setGlowQualityMode === 'function') setGlowQualityMode(glowQuality);
                return;
            }

            userFpsCap = !!settings.fpsCap;
            canvasSharpnessIndex = sharpIndex;
            canvasFilterIndex = filterIndex;
            visualQualityIndex = visualIndex;
            if (typeof glowQualityMode !== 'undefined' && typeof normalizeGlowQualityMode === 'function') {
                glowQualityMode = normalizeGlowQualityMode(glowQuality);
                if (typeof syncLegacyGlowEnabledFlag === 'function') syncLegacyGlowEnabledFlag();
            } else {
                glowEnabled = glowQuality !== 'OFF';
            }
            if (typeof resize === 'function') resize();
            if (typeof applyCanvasFilterSetting === 'function') applyCanvasFilterSetting();
            if (typeof invalidateGraphicsRenderCaches === 'function') invalidateGraphicsRenderCaches();
            if (typeof clearGlowRenderCaches === 'function') clearGlowRenderCaches();
            if (typeof rebuildField === 'function') rebuildField();
            if (typeof applyTheme === 'function') applyTheme();
        }

        function restoreGraphicsBenchmarkPreviousSettings(state) {
            if (!state || !state.previousSettings) return;
            applyGraphicsBenchmarkSettings(state.previousSettings, false);
            restoreGraphicsBenchmarkStorage(state.previousStorage);
        }

        function getGraphicsBenchmarkProfileSettings(profile, targetFps) {
            const capAt60 = targetFps <= 65;
            return {
                fpsCap: capAt60,
                canvasSharpnessIndex: profile.canvasSharpnessIndex,
                canvasFilterIndex: profile.canvasFilterIndex,
                visualQualityIndex: profile.visualQualityIndex,
                glowQuality: profile.glowQuality
            };
        }

        function buildGraphicsBenchmarkProfiles() {
            return [
                {
                    id: 'performance',
                    label: 'PERFORMANCE',
                    qualityScore: 10,
                    canvasSharpnessIndex: 0,
                    canvasFilterIndex: 0,
                    visualQualityIndex: 0,
                    glowQuality: 'OFF',
                    note: 'stability first'
                },
                {
                    id: 'balanced',
                    label: 'BALANCED',
                    qualityScore: 22,
                    canvasSharpnessIndex: 1,
                    canvasFilterIndex: 1,
                    visualQualityIndex: 1,
                    glowQuality: 'OFF',
                    note: 'clean baseline'
                },
                {
                    id: 'crisp',
                    label: 'CRISP HIGH',
                    qualityScore: 36,
                    canvasSharpnessIndex: 2,
                    canvasFilterIndex: 1,
                    visualQualityIndex: 2,
                    glowQuality: 'OFF',
                    note: 'sharp no-glow'
                },
                {
                    id: 'ultra',
                    label: 'ULTRA CLEAR',
                    qualityScore: 48,
                    canvasSharpnessIndex: 3,
                    canvasFilterIndex: 1,
                    visualQualityIndex: 2,
                    glowQuality: 'OFF',
                    note: 'maximum resolution'
                },
                {
                    id: 'softGlow',
                    label: 'SOFT GLOW',
                    qualityScore: 52,
                    canvasSharpnessIndex: 1,
                    canvasFilterIndex: 1,
                    visualQualityIndex: 1,
                    glowQuality: 'SOFT',
                    note: 'cheap glow probe'
                },
                {
                    id: 'fullGlow',
                    label: 'FULL GLOW',
                    qualityScore: 64,
                    canvasSharpnessIndex: 2,
                    canvasFilterIndex: 1,
                    visualQualityIndex: 2,
                    glowQuality: 'FULL',
                    note: 'desktop glow probe'
                }
            ];
        }

        function createGraphicsBenchmarkMetricBucket() {
            return {
                samples: [],
                sum: 0,
                sumSq: 0,
                min: Infinity,
                max: 0,
                valid: 0,
                spikes: 0
            };
        }

        function addGraphicsBenchmarkSample(bucket, fps, targetFps) {
            if (!bucket || !Number.isFinite(fps) || fps <= 0 || fps > 360) return false;
            bucket.samples.push(fps);
            bucket.sum += fps;
            bucket.sumSq += fps * fps;
            bucket.min = Math.min(bucket.min, fps);
            bucket.max = Math.max(bucket.max, fps);
            bucket.valid++;
            if (targetFps && fps < targetFps * 0.72) bucket.spikes++;
            return true;
        }

        function summarizeGraphicsBenchmarkSamples(bucket, targetFps, refreshUncertain = false) {
            const count = bucket && bucket.valid ? bucket.valid : 0;
            if (!count) {
                return {
                    sampleCount: 0,
                    avgFps: 0,
                    lowFps: 0,
                    minFps: 0,
                    maxFps: 0,
                    stdDev: 0,
                    stability: 0,
                    confidence: 0,
                    confidenceLabel: 'LOW'
                };
            }
            const samples = bucket.samples.slice().sort((a, b) => a - b);
            const avg = bucket.sum / count;
            const variance = Math.max(0, bucket.sumSq / count - avg * avg);
            const stdDev = Math.sqrt(variance);
            const lowIndex = Math.max(0, Math.floor(count * 0.01));
            const lowCount = Math.max(1, Math.ceil(count * 0.03));
            let lowSum = 0;
            for (let i = 0; i < lowCount; i++) lowSum += samples[Math.min(samples.length - 1, lowIndex + i)];
            const lowFps = lowSum / lowCount;
            const avgScore = benchmarkClamp((avg / targetFps - 0.82) / 0.22, 0, 1);
            const lowScore = benchmarkClamp((lowFps / targetFps - 0.68) / 0.24, 0, 1);
            const spikePenalty = benchmarkClamp(bucket.spikes / Math.max(1, count * 0.12), 0, 1);
            const stability = benchmarkClamp(1 - (stdDev / Math.max(1, targetFps)) / 0.18 - spikePenalty * 0.22, 0, 1);
            const sampleScore = benchmarkClamp(count / 80, 0, 1);
            const uncertaintyScale = refreshUncertain ? 0.88 : 1;
            const confidence = Math.round(100 * uncertaintyScale * (
                avgScore * 0.30 +
                lowScore * 0.34 +
                stability * 0.24 +
                sampleScore * 0.12
            ));
            return {
                sampleCount: count,
                avgFps: avg,
                lowFps,
                minFps: Number.isFinite(bucket.min) ? bucket.min : 0,
                maxFps: bucket.max,
                stdDev,
                stability,
                confidence: benchmarkClamp(confidence, 0, 100),
                confidenceLabel: getGraphicsBenchmarkConfidenceLabel(confidence, avg, lowFps, targetFps)
            };
        }

        function getGraphicsBenchmarkConfidenceLabel(confidence, avgFps, lowFps, targetFps) {
            if (confidence >= 92 && avgFps >= targetFps * 0.98 && lowFps >= targetFps * 0.86) return 'LOCKED';
            if (confidence >= 78) return 'HIGH';
            if (confidence >= 58) return 'STABLE';
            return 'LOW';
        }

        function updateGraphicsBenchmarkRefreshEstimate(state, fps) {
            if (!state || !Number.isFinite(fps) || fps < 35 || fps > 260) return;
            if (state.elapsed > GRAPHICS_BENCHMARK_REFRESH_SAMPLE_SECONDS) return;
            state.refreshSamples.push(fps);
            const sorted = state.refreshSamples.slice().sort((a, b) => a - b);
            if (sorted.length < 20) {
                state.refreshEstimate = GRAPHICS_BENCHMARK_FALLBACK_TARGET_FPS;
                state.targetFps = GRAPHICS_BENCHMARK_FALLBACK_TARGET_FPS;
                state.refreshConfidence = Math.round(sorted.length / 20 * 45);
                state.refreshUncertain = true;
                return;
            }
            const high = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.86))];
            const median = sorted[Math.floor(sorted.length * 0.5)];
            const measured = Math.max(median, high * 0.96);
            let estimate = GRAPHICS_BENCHMARK_FALLBACK_TARGET_FPS;
            if (measured >= 132) estimate = GRAPHICS_BENCHMARK_MAX_TARGET_FPS;
            else if (measured >= 110) estimate = 120;
            else if (measured >= 85) estimate = 90;
            else if (measured >= 70) estimate = 75;
            else estimate = 60;
            const closeness = 1 - Math.min(1, Math.abs(measured - estimate) / Math.max(estimate, 1));
            state.refreshEstimate = estimate;
            state.targetFps = Math.min(GRAPHICS_BENCHMARK_MAX_TARGET_FPS, estimate);
            state.refreshConfidence = Math.round(benchmarkClamp(closeness, 0, 1) * 100);
            state.refreshUncertain = sorted.length < 45 || state.refreshConfidence < 72;
        }

        function getGraphicsBenchmarkProfileSettingsLabel(profile, targetFps) {
            if (!profile) return '--';
            const cap = targetFps <= 65 ? 'ON' : 'OFF';
            const sharp = CANVAS_SHARPNESS_OPTIONS[profile.canvasSharpnessIndex] || CANVAS_SHARPNESS_OPTIONS[0];
            const filter = CANVAS_FILTER_OPTIONS[profile.canvasFilterIndex] || CANVAS_FILTER_OPTIONS[0];
            const visual = VISUAL_QUALITY_OPTIONS[profile.visualQualityIndex] || VISUAL_QUALITY_OPTIONS[1];
            return `FPS CAP ${cap} | ${sharp.label} ${sharp.scale.toFixed(2)}X | ${filter.label} | ${profile.glowQuality} | ${visual.label}`;
        }

        function shouldGraphicsBenchmarkProfilePass(result, targetFps, refreshUncertain) {
            if (!result || result.sampleCount < 28) return false;
            const glowMode = result.profile && result.profile.glowQuality;
            if (glowMode === 'FULL' && (
                result.avgFps < targetFps * 1.14 ||
                result.lowFps < targetFps * 0.98 ||
                result.stability < 0.72
            )) {
                return false;
            }
            if (glowMode === 'SOFT' && (
                result.avgFps < targetFps * 1.04 ||
                result.lowFps < targetFps * 0.90 ||
                result.stability < 0.60
            )) {
                return false;
            }
            const avgGate = refreshUncertain ? 1.00 : 0.96;
            const lowGate = refreshUncertain ? 0.80 : 0.76;
            return result.avgFps >= targetFps * avgGate
                && result.lowFps >= targetFps * lowGate
                && result.stability >= 0.46
                && result.confidence >= (refreshUncertain ? 64 : 58);
        }

        function chooseGraphicsBenchmarkRecommendation(state) {
            const targetFps = state.targetFps || GRAPHICS_BENCHMARK_FALLBACK_TARGET_FPS;
            let best = null;
            for (let i = 0; i < state.profileResults.length; i++) {
                const result = state.profileResults[i];
                if (!shouldGraphicsBenchmarkProfilePass(result, targetFps, state.refreshUncertain)) continue;
                if (!best || result.profile.qualityScore > best.profile.qualityScore) best = result;
            }
            if (!best) {
                for (let i = 0; i < state.profileResults.length; i++) {
                    const result = state.profileResults[i];
                    const glowPenalty = result.profile.glowQuality === 'FULL'
                        ? 26
                        : result.profile.glowQuality === 'SOFT'
                            ? 12
                            : 0;
                    const score = result.confidence + Math.min(result.profile.qualityScore, 48) * 0.14 - glowPenalty;
                    const bestGlowPenalty = best && best.profile.glowQuality === 'FULL'
                        ? 26
                        : best && best.profile.glowQuality === 'SOFT'
                            ? 12
                            : 0;
                    const bestScore = best
                        ? best.confidence + Math.min(best.profile.qualityScore, 48) * 0.14 - bestGlowPenalty
                        : -Infinity;
                    if (!best || score > bestScore) {
                        best = result;
                    }
                }
            }
            if (!best && state.profiles.length) {
                const profile = state.profiles[0];
                best = Object.assign(
                    summarizeGraphicsBenchmarkSamples(createGraphicsBenchmarkMetricBucket(), targetFps, true),
                    {
                        profile,
                        targetFps,
                        settings: getGraphicsBenchmarkProfileSettings(profile, targetFps),
                        reason: 'fallback profile'
                    }
                );
            }
            state.recommendedResult = best;
            state.recommendedProfile = best ? best.profile : null;
            if (best) {
                best.targetFps = targetFps;
                best.settings = getGraphicsBenchmarkProfileSettings(best.profile, targetFps);
                if (best.avgFps < targetFps * 0.86) {
                    state.recommendation = 'STABILITY PRIORITIZED';
                } else if (best.profile.glowQuality !== 'OFF') {
                    state.recommendation = 'GLOW CLEARED';
                } else {
                    state.recommendation = 'ANALYSIS READY';
                }
                state.confidence = best.confidence;
                state.confidenceLabel = best.confidenceLabel;
                state.averageFps = best.avgFps;
                state.lowFps = best.lowFps;
                state.frameStability = best.stability;
                state.sampleCount = best.sampleCount;
            }
        }

        function resetGraphicsBenchmarkDemo(state) {
            const rect = getGraphicsBenchmarkPlayRect();
            state.modeScenes = buildGraphicsBenchmarkModeScenes();
            state.sceneIndex = 0;
            state.lastSceneIndex = -1;
            state.previousSceneIndex = -1;
            state.sceneElapsed = 0;
            state.sceneDuration = Math.max(0.4, (state.profileDuration || GRAPHICS_BENCHMARK_PROFILE_SECONDS) / state.modeScenes.length);
            state.sceneTransition = GRAPHICS_BENCHMARK_SCENE_TRANSITION_SECONDS;
            state.stars.length = 0;

            const starChars = ['.', '.', '.', '+', ':', '0', '1'];
            for (let i = 0; i < 92; i++) {
                const depth = 0.35 + benchmarkRandom(state) * 0.9;
                state.stars.push({
                    x: rect.x + benchmarkRandom(state) * rect.w,
                    y: rect.y + benchmarkRandom(state) * rect.h,
                    speed: 28 + depth * 72,
                    depth,
                    char: starChars[Math.floor(benchmarkRandom(state) * starChars.length)],
                    alpha: 0.10 + benchmarkRandom(state) * 0.32
                });
            }
            resetGraphicsBenchmarkSceneEntities(state, rect);
        }

        function beginGraphicsBenchmarkMode() {
            graphicsBenchmarkState = createGraphicsBenchmarkState();
            const state = graphicsBenchmarkState;
            state.previousSettings = captureGraphicsBenchmarkSettings();
            state.previousStorage = getGraphicsBenchmarkStorageSnapshot();
            state.profiles = buildGraphicsBenchmarkProfiles();
            state.duration = state.profiles.length * GRAPHICS_BENCHMARK_PROFILE_SECONDS;
            state.profileDuration = GRAPHICS_BENCHMARK_PROFILE_SECONDS;
            state.profileWarmup = GRAPHICS_BENCHMARK_PROFILE_WARMUP_SECONDS;
            state.modeScenes = buildGraphicsBenchmarkModeScenes();
            state.sceneDuration = Math.max(0.4, state.profileDuration / state.modeScenes.length);
            state.profileMetrics = createGraphicsBenchmarkMetricBucket();
            state.currentProfileIndex = 0;
            state.currentProfile = state.profiles[0] || null;
            state.active = true;
            state.startedAt = currentFrameNow || performance.now();
            state.seed = (0xA51C + Math.round(width * 13 + height * 7)) >>> 0;
            state.rngState = state.seed;
            if (state.currentProfile) {
                const settings = getGraphicsBenchmarkProfileSettings(state.currentProfile, state.targetFps);
                settings.fpsCap = false;
                applyGraphicsBenchmarkSettings(settings, false);
            }
            resetGraphicsBenchmarkDemo(state);
            gameState = BENCHMARK_GAME_STATE;
            pauseState = 'GRAPHICS';
            settingsSelection = GRAPHICS_BENCHMARK_MENU_INDEX;
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
            if (typeof resetPauseMenuShipCursor === 'function') resetPauseMenuShipCursor();
        }

        function finishGraphicsBenchmarkMode(cancelled = false) {
            if (graphicsBenchmarkState) {
                graphicsBenchmarkState.active = false;
                graphicsBenchmarkState.cancelled = !!cancelled;
                if (cancelled) {
                    restoreGraphicsBenchmarkPreviousSettings(graphicsBenchmarkState);
                } else if (graphicsBenchmarkState.recommendedResult && graphicsBenchmarkState.recommendedResult.settings) {
                    graphicsBenchmarkState.applyingRecommendation = true;
                    applyGraphicsBenchmarkSettings(graphicsBenchmarkState.recommendedResult.settings, true);
                } else {
                    restoreGraphicsBenchmarkPreviousSettings(graphicsBenchmarkState);
                }
                if (cancelled && !graphicsBenchmarkState.completed) {
                    graphicsBenchmarkState.completed = true;
                    graphicsBenchmarkState.completedAt = currentFrameNow || performance.now();
                    graphicsBenchmarkState.recommendation = 'CANCELLED';
                }
            }
            gameState = 'PAUSED';
            pauseState = 'GRAPHICS';
            settingsSelection = GRAPHICS_BENCHMARK_MENU_INDEX;
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
            if (typeof resetPauseMenuShipCursor === 'function') resetPauseMenuShipCursor();
        }

        function isGraphicsBenchmarkComplete() {
            return !!(graphicsBenchmarkState && graphicsBenchmarkState.completed);
        }

        function applyGraphicsBenchmarkRecommendation() {
            finishGraphicsBenchmarkMode(false);
        }

        function getGraphicsBenchmarkPhase(elapsed, state = null) {
            const scene = getGraphicsBenchmarkScene(state || graphicsBenchmarkState || {});
            if (state && state.profileElapsed < state.profileWarmup) return `WARMING ${scene.subtitle}`;
            return `SAMPLING ${scene.label}`;
        }

        function createGraphicsBenchmarkBoss(scene, rect) {
            const base = {
                sceneId: scene.id,
                name: scene.label,
                x: rect.x + rect.w * 0.5,
                y: rect.y + rect.h * 0.22,
                vx: 0,
                vy: 0,
                hp: 120,
                maxHp: 120,
                radius: 62,
                color: scene.color,
                accent: scene.accent,
                phase: 0,
                attackClock: 0.18,
                ringAngle: 0,
                moonAngle: 0,
                gravityPulse: 0,
                flareTimer: 0,
                flashTimer: 0
            };
            if (scene.id === 'binary') {
                return Object.assign(base, {
                    name: 'BATTLE STARSHIP TRACE',
                    sprite: typeof BATTLE_STARSHIP_SPRITE !== 'undefined' ? BATTLE_STARSHIP_SPRITE : [' [BATTLE STARSHIP] '],
                    x: rect.x + rect.w * 0.50,
                    y: rect.y + rect.h * 0.19,
                    radius: 78,
                    spriteFontSize: 4,
                    color: '#9bd6ff',
                    accent: '#fff07a',
                    attackClock: 0.10
                });
            }
            if (scene.id === 'prism') {
                return Object.assign(base, {
                    name: 'PRISM CONDUIT TRACE',
                    sprite: typeof PRISM_CONDUIT_SPRITE !== 'undefined' ? PRISM_CONDUIT_SPRITE : ['  /\\  ', '<><>', '  \\/  '],
                    x: rect.x + rect.w * 0.50,
                    y: rect.y + rect.h * 0.48,
                    radius: 72,
                    spriteFontSize: 6,
                    color: '#bfffff',
                    accent: '#ff8fd8',
                    attackClock: 0.16
                });
            }
            if (scene.id === 'matrix') {
                return Object.assign(base, {
                    name: 'NULL PHANTOM TRACE',
                    sprite: typeof NULL_PHANTOM_SOURCE !== 'undefined' ? NULL_PHANTOM_SOURCE : [' .-. ', '(0_0)', ' /|\\ '],
                    x: rect.x + rect.w * 0.62,
                    y: rect.y + rect.h * 0.36,
                    radius: 72,
                    spriteFontSize: 6,
                    color: '#ff8fd8',
                    accent: '#65ffb8',
                    attackClock: 0.12
                });
            }
            return Object.assign(base, {
                name: 'NULLBYTE PLANET TRACE',
                sprite: typeof BITSHIFT_PLANET_BOSS_SPRITE !== 'undefined' ? BITSHIFT_PLANET_BOSS_SPRITE : [' .-====-. ', '< 0101 >', ' `-====-` '],
                x: rect.x + rect.w * 0.78,
                y: rect.y + rect.h * 0.48,
                radius: 76,
                collisionRadius: 62,
                spriteFontSize: 9,
                color: '#ff9a73',
                accent: '#8ff7ff',
                isBitshiftPlanetBoss: true,
                attackName: 'benchmark',
                attackClock: 0.12
            });
        }

        function pushGraphicsBenchmarkBullet(state, x, y, vx, vy, color, char, options = {}) {
            state.enemyBullets.push({
                x,
                y,
                vx,
                vy,
                life: options.life || 2.6,
                color,
                char,
                bossBullet: !!options.bossBullet,
                radius: options.radius || 8
            });
        }

        function spawnGraphicsBenchmarkBossAttack(state, rect, opening = false) {
            const bossObj = state && state.boss;
            if (!bossObj) return;
            const scene = getGraphicsBenchmarkScene(state);
            const p = state.pilot;
            bossObj.phase = (bossObj.phase || 0) + 1;
            bossObj.flareTimer = 0.18;
            bossObj.gravityPulse = scene.id === 'bitshift' ? 0.7 : 0.35;

            if (scene.id === 'binary') {
                const centerX = bossObj.x + Math.sin(state.sceneElapsed * 2.4) * 72;
                const count = opening ? 7 : 5;
                for (let i = 0; i < count; i++) {
                    const spread = (i - (count - 1) / 2) * 0.19;
                    pushGraphicsBenchmarkBullet(
                        state,
                        centerX + (i - (count - 1) / 2) * 26,
                        bossObj.y + 48,
                        Math.sin(spread) * 64,
                        178 + Math.cos(spread) * 34,
                        i % 2 ? '#ffba70' : '#fff07a',
                        '!',
                        { bossBullet: true, life: 2.8 }
                    );
                }
            } else if (scene.id === 'prism') {
                const count = opening ? 12 : 10;
                const phase = state.sceneElapsed * 2.6 + bossObj.phase * 0.37;
                for (let i = 0; i < count; i++) {
                    const angle = phase + i * Math.PI * 2 / count;
                    pushGraphicsBenchmarkBullet(
                        state,
                        bossObj.x + Math.cos(angle) * 42,
                        bossObj.y + Math.sin(angle) * 34,
                        Math.cos(angle) * 128,
                        Math.sin(angle) * 128,
                        i % 2 ? '#ff8fd8' : '#8ff7ff',
                        '*',
                        { bossBullet: true, life: 2.4 }
                    );
                }
            } else if (scene.id === 'matrix') {
                const angles = [-0.22, 0, 0.22];
                const aim = Math.atan2(p.y - bossObj.y, p.x - bossObj.x);
                for (let i = 0; i < angles.length; i++) {
                    const angle = aim + angles[i];
                    pushGraphicsBenchmarkBullet(
                        state,
                        bossObj.x,
                        bossObj.y,
                        Math.cos(angle) * 150,
                        Math.sin(angle) * 150,
                        i === 1 ? '#ffffff' : '#65ffb8',
                        i === 1 ? '+' : '0',
                        { bossBullet: true, life: 2.8 }
                    );
                }
                for (let i = 0; i < 3; i++) {
                    const laneY = rect.y + rect.h * (0.24 + i * 0.21) + Math.sin(state.sceneElapsed + i) * 10;
                    pushGraphicsBenchmarkBullet(state, rect.x + rect.w * 0.82, laneY, -126, 0, '#9bffcf', '-', { bossBullet: true, life: 2.2 });
                }
            } else {
                const lanes = opening ? 5 : 4;
                for (let i = 0; i < lanes; i++) {
                    const laneY = rect.y + rect.h * (0.20 + i * 0.15) + Math.sin(state.sceneElapsed * 2 + i) * 12;
                    pushGraphicsBenchmarkBullet(state, bossObj.x - 62, laneY, -190, Math.sin(i + bossObj.phase) * 28, i % 2 ? '#8ff7ff' : '#ff9a73', i % 2 ? '<=' : 'o', { bossBullet: true, life: 2.6 });
                }
                const aim = Math.atan2(p.y - bossObj.y, p.x - bossObj.x);
                pushGraphicsBenchmarkBullet(state, bossObj.x - 48, bossObj.y, Math.cos(aim) * 138, Math.sin(aim) * 138, '#fff1e8', '*', { bossBullet: true, life: 2.7 });
            }
        }

        function spawnGraphicsBenchmarkEnemy(state, rect) {
            const scene = getGraphicsBenchmarkScene(state);
            const roll = benchmarkRandom(state);
            const lane = benchmarkRandom(state);
            let enemy;

            if (scene.id === 'binary') {
                const elite = roll > 0.72;
                enemy = {
                    sceneId: scene.id,
                    type: elite ? 'binaryElite' : (roll > 0.44 ? 'binarySkimmer' : 'binaryDrone'),
                    x: rect.x + 46 + lane * Math.max(60, rect.w - 92),
                    y: rect.y + 22 + benchmarkRandom(state) * 58,
                    vx: (benchmarkRandom(state) - 0.5) * 52,
                    vy: elite ? 118 : 92,
                    hp: elite ? 3 : 2,
                    radius: elite ? 22 : 18,
                    char: elite ? 'A' : 'v',
                    color: elite ? '#fff07a' : '#8fdcff',
                    size: elite ? 27 : 23,
                    phase: benchmarkRandom(state) * Math.PI * 2,
                    fireClock: 0.44 + benchmarkRandom(state) * 0.85
                };
                if (typeof configureEnemyShipVisual === 'function') {
                    configureEnemyShipVisual(enemy, elite ? 'armored' : 'base', {
                        color: enemy.color,
                        tier: elite ? 2 : 1,
                        visualScale: elite ? 0.95 : 0.86
                    });
                }
            } else if (scene.id === 'prism') {
                const angle = benchmarkRandom(state) * Math.PI * 2;
                const distance = Math.max(rect.w, rect.h) * (0.50 + benchmarkRandom(state) * 0.12);
                const cx = rect.x + rect.w * 0.5;
                const cy = rect.y + rect.h * 0.5;
                enemy = {
                    sceneId: scene.id,
                    type: roll > 0.66 ? 'prismDiver' : 'prismSwarm',
                    x: cx + Math.cos(angle) * distance,
                    y: cy + Math.sin(angle) * distance,
                    vx: 0,
                    vy: 0,
                    hp: roll > 0.66 ? 2 : 1,
                    radius: roll > 0.66 ? 19 : 15,
                    char: roll > 0.66 ? '<>' : '*',
                    color: roll > 0.66 ? '#ff8fd8' : '#8ff7ff',
                    size: roll > 0.66 ? 22 : 18,
                    orbitSign: benchmarkRandom(state) > 0.5 ? 1 : -1,
                    phase: benchmarkRandom(state) * Math.PI * 2,
                    fireClock: 0.72 + benchmarkRandom(state) * 1.0
                };
                if (typeof configureEnemyShipVisual === 'function' && roll > 0.38) {
                    configureEnemyShipVisual(enemy, roll > 0.66 ? 'elite' : 'base', {
                        color: enemy.color,
                        tier: roll > 0.66 ? 3 : 1,
                        visualScale: roll > 0.66 ? 0.82 : 0.74
                    });
                }
            } else if (scene.id === 'matrix') {
                const sprite = roll > 0.72 && typeof NULL_PHANTOM_SOURCE !== 'undefined'
                    ? NULL_PHANTOM_SOURCE
                    : (typeof GLITCH_SPRITE_1 !== 'undefined' ? GLITCH_SPRITE_1 : [' #### ', '##[]##', ' #### ']);
                enemy = {
                    sceneId: scene.id,
                    type: roll > 0.72 ? 'matrixPhantom' : 'matrixGlitch',
                    x: rect.x + rect.w * (0.25 + benchmarkRandom(state) * 0.55),
                    y: rect.y + rect.h * (0.24 + benchmarkRandom(state) * 0.54),
                    vx: (benchmarkRandom(state) > 0.5 ? 1 : -1) * (42 + benchmarkRandom(state) * 32),
                    vy: (benchmarkRandom(state) > 0.5 ? 1 : -1) * (36 + benchmarkRandom(state) * 28),
                    hp: roll > 0.72 ? 5 : 2,
                    radius: roll > 0.72 ? 32 : 22,
                    char: '#',
                    color: roll > 0.72 ? '#ff8fd8' : '#65ffb8',
                    size: roll > 0.72 ? 14 : 18,
                    sprite,
                    spriteFontSize: roll > 0.72 ? 6 : 9,
                    phase: benchmarkRandom(state) * Math.PI * 2,
                    fireClock: 0.55 + benchmarkRandom(state) * 0.95
                };
            } else {
                const keys = ['bitDrone', 'shiftSkimmer', 'registerTurret', 'parityMine'];
                const type = keys[Math.min(keys.length - 1, Math.floor(roll * keys.length))];
                const stats = typeof BITSHIFT_ENEMY_STATS !== 'undefined' && BITSHIFT_ENEMY_STATS[type]
                    ? BITSHIFT_ENEMY_STATS[type]
                    : { sprite: ['<0>'], color: '#ff9a73', hp: 14, speed: 160, radius: 20 };
                enemy = {
                    sceneId: scene.id,
                    type,
                    x: rect.x + rect.w - 18 - benchmarkRandom(state) * 72,
                    y: rect.y + 42 + lane * Math.max(50, rect.h - 84),
                    vx: -(stats.speed || 150) * (type === 'registerTurret' ? 0.54 : 0.72),
                    vy: type === 'shiftSkimmer' ? (benchmarkRandom(state) > 0.5 ? -58 : 58) : 0,
                    hp: type === 'registerTurret' ? 4 : (type === 'parityMine' ? 2 : 1),
                    radius: stats.radius || 20,
                    char: type === 'parityMine' ? '(*)' : '<0>',
                    color: stats.color || '#ff9a73',
                    size: 18,
                    sprite: stats.sprite || ['<0>'],
                    spriteFontSize: type === 'registerTurret' ? 11 : 13,
                    phase: benchmarkRandom(state) * Math.PI * 2,
                    fireClock: type === 'registerTurret' ? 0.42 + benchmarkRandom(state) * 0.55 : 0.95 + benchmarkRandom(state)
                };
            }
            state.enemies.push(enemy);
        }

        function spawnGraphicsBenchmarkParticle(state, x, y, color, count = 8) {
            for (let i = 0; i < count; i++) {
                const a = benchmarkRandom(state) * Math.PI * 2;
                const speed = 38 + benchmarkRandom(state) * 110;
                state.particles.push({
                    x,
                    y,
                    vx: Math.cos(a) * speed,
                    vy: Math.sin(a) * speed,
                    life: 0.35 + benchmarkRandom(state) * 0.48,
                    maxLife: 0.75,
                    color,
                    char: benchmarkRandom(state) > 0.55 ? '*' : '.'
                });
            }
        }

        function spawnGraphicsBenchmarkBombEffect(state, rect, scene) {
            if (!state || !state.pilot) return;
            const target = state.boss || state.enemies[0] || null;
            const p = state.pilot;
            const color = scene.id === 'bitshift'
                ? '#ff4f4a'
                : scene.id === 'matrix'
                    ? '#65ffb8'
                    : scene.id === 'prism'
                        ? '#ff8fd8'
                        : '#8ff7ff';
            const x = target ? p.x + (target.x - p.x) * 0.42 : p.x + p.aimX * 78;
            const y = target ? p.y + (target.y - p.y) * 0.42 : p.y + p.aimY * 78;
            const burst = {
                x: benchmarkClamp(x, rect.x + 28, rect.x + rect.w - 28),
                y: benchmarkClamp(y, rect.y + 28, rect.y + rect.h - 28),
                life: 0,
                maxLife: 0.62,
                radius: 0,
                maxRadius: scene.id === 'matrix' ? 118 : 142,
                color,
                accent: scene.accent || '#ffffff',
                sceneId: scene.id
            };
            state.bombBursts.push(burst);
            spawnGraphicsBenchmarkParticle(state, burst.x, burst.y, color, 16);

            const clearRadiusSq = burst.maxRadius * burst.maxRadius * 0.72;
            for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
                const b = state.enemyBullets[i];
                const dx = b.x - burst.x;
                const dy = b.y - burst.y;
                if (dx * dx + dy * dy < clearRadiusSq) {
                    spawnGraphicsBenchmarkParticle(state, b.x, b.y, b.color || color, 2);
                    state.enemyBullets.splice(i, 1);
                }
            }
            for (let i = state.enemies.length - 1; i >= 0; i--) {
                const e = state.enemies[i];
                const dx = e.x - burst.x;
                const dy = e.y - burst.y;
                if (dx * dx + dy * dy < clearRadiusSq) {
                    e.hp -= 2;
                    e.flashTimer = 0.12;
                    if (e.hp <= 0) {
                        spawnGraphicsBenchmarkParticle(state, e.x, e.y, e.color || color, 8);
                        state.enemies.splice(i, 1);
                    }
                }
            }
            if (state.boss) {
                const dx = state.boss.x - burst.x;
                const dy = state.boss.y - burst.y;
                if (dx * dx + dy * dy < clearRadiusSq * 1.35) {
                    state.boss.hp = Math.max(0, state.boss.hp - 8);
                    state.boss.flashTimer = 0.18;
                    state.boss.flareTimer = Math.max(state.boss.flareTimer || 0, 0.22);
                }
            }
        }

        function scoreGraphicsBenchmarkPilotPosition(state, scene, rect, x, y, baseX, baseY) {
            let score = Math.hypot(x - baseX, y - baseY) * 0.016;
            const wallPad = 54;
            score += Math.max(0, wallPad - (x - rect.x)) * 0.18;
            score += Math.max(0, wallPad - (rect.x + rect.w - x)) * 0.18;
            score += Math.max(0, wallPad - (y - rect.y)) * 0.18;
            score += Math.max(0, wallPad - (rect.y + rect.h - y)) * 0.18;

            for (let i = 0; i < state.enemyBullets.length; i++) {
                const b = state.enemyBullets[i];
                const vx = b.vx || 0;
                const vy = b.vy || 0;
                const speedSq = vx * vx + vy * vy;
                let t = 0;
                if (speedSq > 1) {
                    t = benchmarkClamp(((x - b.x) * vx + (y - b.y) * vy) / speedSq, 0, 0.85);
                }
                const bx = b.x + vx * t;
                const by = b.y + vy * t;
                const dist = Math.hypot(x - bx, y - by);
                const safe = b.bossBullet ? 74 : 58;
                if (dist < safe) {
                    const danger = (1 - dist / safe);
                    score += danger * danger * (b.bossBullet ? 210 : 138) * (1.12 - t * 0.38);
                }
            }

            for (let i = 0; i < state.enemies.length; i++) {
                const e = state.enemies[i];
                const futureX = e.x + (e.vx || 0) * 0.32;
                const futureY = e.y + (e.vy || 0) * 0.32;
                const dist = Math.hypot(x - futureX, y - futureY);
                const safe = (e.radius || 18) + 48;
                if (dist < safe) score += Math.pow(1 - dist / safe, 2) * 150;
            }

            if (state.boss) {
                const bossDist = Math.hypot(x - state.boss.x, y - state.boss.y);
                const safe = (state.boss.radius || 60) + 52;
                if (bossDist < safe) score += Math.pow(1 - bossDist / safe, 2) * 180;
            }

            if (scene.id === 'binary') score += Math.abs(y - (rect.y + rect.h * 0.76)) * 0.006;
            if (scene.id === 'bitshift') score += Math.max(0, x - (rect.x + rect.w * 0.42)) * 0.035;
            return score;
        }

        function chooseGraphicsBenchmarkPilotTarget(state, scene, rect, desiredX, desiredY, minX, maxX, minY, maxY) {
            const p = state.pilot;
            const offsets = [
                [0, 0], [54, 0], [-54, 0], [0, 54], [0, -54],
                [42, 42], [-42, 42], [42, -42], [-42, -42],
                [86, 0], [-86, 0], [0, 86], [0, -86],
                [72, 36], [-72, 36], [72, -36], [-72, -36]
            ];
            let bestX = desiredX;
            let bestY = desiredY;
            let bestScore = scoreGraphicsBenchmarkPilotPosition(state, scene, rect, bestX, bestY, desiredX, desiredY);
            for (let i = 0; i < offsets.length; i++) {
                const ox = offsets[i][0];
                const oy = offsets[i][1];
                const candidateX = benchmarkClamp(p.x + ox, minX, maxX);
                const candidateY = benchmarkClamp(p.y + oy, minY, maxY);
                const score = scoreGraphicsBenchmarkPilotPosition(state, scene, rect, candidateX, candidateY, desiredX, desiredY);
                if (score < bestScore) {
                    bestScore = score;
                    bestX = candidateX;
                    bestY = candidateY;
                }
            }
            return { x: bestX, y: bestY, score: bestScore };
        }

        function updateGraphicsBenchmarkPilot(state, dt, rect) {
            const scene = getGraphicsBenchmarkScene(state);
            const pilot = state.pilot;
            let desiredX = rect.x + rect.w * (0.28 + Math.sin(state.elapsed * 0.83) * 0.045);
            let desiredY = rect.y + rect.h * (0.52 + Math.sin(state.elapsed * 1.17) * 0.24);
            let minX = rect.x + 36;
            let maxX = rect.x + rect.w * 0.56;
            let minY = rect.y + 32;
            let maxY = rect.y + rect.h - 32;
            let fallbackAimX = 1;
            let fallbackAimY = 0;

            if (scene.id === 'binary') {
                desiredX = rect.x + rect.w * (0.48 + Math.sin(state.sceneElapsed * 2.1) * 0.16);
                desiredY = rect.y + rect.h * (0.76 + Math.sin(state.sceneElapsed * 1.6) * 0.06);
                minX = rect.x + 44;
                maxX = rect.x + rect.w - 44;
                minY = rect.y + rect.h * 0.56;
                fallbackAimX = 0;
                fallbackAimY = -1;
            } else if (scene.id === 'prism') {
                desiredX = rect.x + rect.w * (0.50 + Math.sin(state.sceneElapsed * 1.25) * 0.20);
                desiredY = rect.y + rect.h * (0.52 + Math.cos(state.sceneElapsed * 1.55) * 0.20);
                minX = rect.x + rect.w * 0.20;
                maxX = rect.x + rect.w * 0.80;
            } else if (scene.id === 'matrix') {
                desiredX = rect.x + rect.w * (0.48 + Math.sin(state.sceneElapsed * 1.45) * 0.19);
                desiredY = rect.y + rect.h * (0.56 + Math.sin(state.sceneElapsed * 0.92 + 0.8) * 0.18);
                minX = rect.x + rect.w * 0.18;
                maxX = rect.x + rect.w * 0.82;
                minY = rect.y + rect.h * 0.18;
                maxY = rect.y + rect.h * 0.82;
            } else {
                desiredX = rect.x + rect.w * (0.24 + Math.sin(state.sceneElapsed * 1.42) * 0.045);
                desiredY = rect.y + rect.h * (0.52 + Math.sin(state.sceneElapsed * 1.72) * 0.24);
                minX = rect.x + 42;
                maxX = rect.x + rect.w * 0.48;
            }
            let dodgeX = 0;
            let dodgeY = 0;

            for (let i = 0; i < state.enemyBullets.length; i++) {
                const b = state.enemyBullets[i];
                const dx = pilot.x - b.x;
                const dy = pilot.y - b.y;
                const d2 = dx * dx + dy * dy;
                if (d2 > 0.001 && d2 < 130 * 130) {
                    const force = (1 - Math.sqrt(d2) / 130) * 520;
                    const inv = 1 / Math.sqrt(d2);
                    dodgeX += dx * inv * force;
                    dodgeY += dy * inv * force;
                }
            }
            for (let i = 0; i < state.enemies.length; i++) {
                const e = state.enemies[i];
                const dx = pilot.x - e.x;
                const dy = pilot.y - e.y;
                const d2 = dx * dx + dy * dy;
                if (d2 > 0.001 && d2 < 112 * 112) {
                    const force = (1 - Math.sqrt(d2) / 112) * 360;
                    const inv = 1 / Math.sqrt(d2);
                    dodgeX += dx * inv * force;
                    dodgeY += dy * inv * force;
                }
            }

            desiredX += dodgeX * 0.12;
            desiredY += dodgeY * 0.12;
            desiredX = benchmarkClamp(desiredX, minX, maxX);
            desiredY = benchmarkClamp(desiredY, minY, maxY);
            const tacticalTarget = chooseGraphicsBenchmarkPilotTarget(state, scene, rect, desiredX, desiredY, minX, maxX, minY, maxY);
            desiredX = tacticalTarget.x;
            desiredY = tacticalTarget.y;

            pilot.vx += (desiredX - pilot.x) * 8.4 * dt + dodgeX * dt;
            pilot.vy += (desiredY - pilot.y) * 8.4 * dt + dodgeY * dt;
            const damping = Math.pow(0.035, dt);
            pilot.vx *= damping;
            pilot.vy *= damping;
            pilot.x = benchmarkClamp(pilot.x + pilot.vx * dt, minX - 12, maxX + 12);
            pilot.y = benchmarkClamp(pilot.y + pilot.vy * dt, minY - 10, maxY + 10);

            let target = null;
            let best = Infinity;
            for (let i = 0; i < state.enemies.length; i++) {
                const e = state.enemies[i];
                if (scene.id === 'bitshift' && e.x < pilot.x) continue;
                if (scene.id === 'binary' && e.y > pilot.y) continue;
                const dx = e.x - pilot.x;
                const dy = e.y - pilot.y;
                const forward = scene.id === 'binary' ? -dy : dx;
                const score = Math.max(0, forward) + Math.abs(scene.id === 'binary' ? dx : dy) * 0.8;
                if (score < best) {
                    best = score;
                    target = e;
                }
            }
            const aimX = target ? target.x - pilot.x : fallbackAimX;
            const aimY = target ? target.y - pilot.y : fallbackAimY;
            const aimLen = Math.max(1, Math.hypot(aimX, aimY));
            pilot.aimX += (aimX / aimLen - pilot.aimX) * Math.min(1, dt * 8);
            pilot.aimY += (aimY / aimLen - pilot.aimY) * Math.min(1, dt * 8);
            const len = Math.max(1, Math.hypot(pilot.aimX, pilot.aimY));
            pilot.aimX /= len;
            pilot.aimY /= len;
        }

        function updateGraphicsBenchmarkDemo(state, dt) {
            const rect = getGraphicsBenchmarkPlayRect();
            updateGraphicsBenchmarkSceneTiming(state, dt, rect);
            const scene = getGraphicsBenchmarkScene(state);
            updateGraphicsBenchmarkPilot(state, dt, rect);

            for (let i = 0; i < state.stars.length; i++) {
                const s = state.stars[i];
                if (scene.id === 'binary') {
                    s.y += s.speed * 0.75 * dt;
                    if (s.y > rect.y + rect.h + 18) {
                        s.y = rect.y - benchmarkRandom(state) * 34;
                        s.x = rect.x + benchmarkRandom(state) * rect.w;
                    }
                } else {
                    const speedScale = scene.id === 'bitshift' ? 1.55 : (scene.id === 'matrix' ? 0.34 : 0.58);
                    s.x -= s.speed * speedScale * dt;
                    if (s.x < rect.x - 18) {
                        s.x = rect.x + rect.w + benchmarkRandom(state) * 38;
                        s.y = rect.y + benchmarkRandom(state) * rect.h;
                    }
                }
            }

            if (state.boss) {
                const bossObj = state.boss;
                bossObj.phase += dt * 2.0;
                bossObj.ringAngle = (bossObj.ringAngle || 0) + dt * (scene.id === 'bitshift' ? 0.72 : 0.42);
                bossObj.moonAngle = (bossObj.moonAngle || 0) + dt * 0.86;
                bossObj.gravityPulse = Math.max(0, (bossObj.gravityPulse || 0) - dt * 0.9);
                bossObj.flareTimer = Math.max(0, (bossObj.flareTimer || 0) - dt);
                bossObj.flashTimer = Math.max(0, (bossObj.flashTimer || 0) - dt);
                if (scene.id === 'binary') {
                    bossObj.x = rect.x + rect.w * 0.5 + Math.sin(state.sceneElapsed * 1.9) * rect.w * 0.15;
                    bossObj.y = rect.y + rect.h * 0.18 + Math.sin(state.sceneElapsed * 2.4) * 8;
                } else if (scene.id === 'prism') {
                    bossObj.x = rect.x + rect.w * 0.5 + Math.sin(state.sceneElapsed * 1.4) * 18;
                    bossObj.y = rect.y + rect.h * 0.48 + Math.cos(state.sceneElapsed * 1.8) * 16;
                } else if (scene.id === 'matrix') {
                    bossObj.x = rect.x + rect.w * (0.62 + Math.sin(state.sceneElapsed * 1.1) * 0.06);
                    bossObj.y = rect.y + rect.h * (0.36 + Math.cos(state.sceneElapsed * 1.3) * 0.07);
                } else {
                    bossObj.x = rect.x + rect.w * 0.78 + Math.sin(state.sceneElapsed * 0.9) * 18;
                    bossObj.y = rect.y + rect.h * 0.48 + Math.sin(state.sceneElapsed * 1.5) * 36;
                }

                state.bossClock -= dt;
                if (!state.completed && state.bossClock <= 0) {
                    spawnGraphicsBenchmarkBossAttack(state, rect, false);
                    state.bossClock = scene.id === 'prism' ? 0.42 : (scene.id === 'matrix' ? 0.48 : 0.38);
                }
            }

            if (!state.completed) {
                const interval = scene.id === 'prism'
                    ? 0.24
                    : scene.id === 'binary'
                        ? 0.30
                        : scene.id === 'matrix'
                            ? 0.42
                            : 0.34;
                state.spawnClock += dt;
                let guard = 0;
                const enemyCap = scene.id === 'prism' ? 12 : (scene.id === 'matrix' ? 7 : 9);
                while (state.spawnClock >= interval && guard < 3 && state.enemies.length < enemyCap) {
                    state.spawnClock -= interval;
                    spawnGraphicsBenchmarkEnemy(state, rect);
                    if ((scene.id === 'prism' || scene.id === 'binary') && benchmarkRandom(state) > 0.72) spawnGraphicsBenchmarkEnemy(state, rect);
                    guard++;
                }
            }

            state.bombClock -= dt;
            if (!state.completed && state.bombClock <= 0) {
                spawnGraphicsBenchmarkBombEffect(state, rect, scene);
                state.bombClock = 1.05;
            }

            state.shotClock -= dt;
            if (!state.completed && state.shotClock <= 0) {
                const p = state.pilot;
                if (scene.id === 'binary') {
                    state.playerShots.push({
                        x: p.x,
                        y: p.y - 26,
                        vx: p.aimX * 120,
                        vy: -480 + Math.min(0, p.aimY) * 80,
                        life: 1.25,
                        color: '#d7ffff',
                        char: '|'
                    });
                    state.shotClock = 0.105;
                } else if (scene.id === 'prism') {
                    for (let i = -1; i <= 1; i += 2) {
                        const angle = Math.atan2(p.aimY, p.aimX) + i * 0.18;
                        state.playerShots.push({
                            x: p.x + Math.cos(angle) * 18,
                            y: p.y + Math.sin(angle) * 18,
                            vx: Math.cos(angle) * 360,
                            vy: Math.sin(angle) * 360,
                            life: 1.08,
                            color: i < 0 ? '#8ff7ff' : '#ff8fd8',
                            char: '*'
                        });
                    }
                    state.shotClock = 0.145;
                } else if (scene.id === 'matrix') {
                    state.playerShots.push({
                        x: p.x + p.aimX * 18,
                        y: p.y + p.aimY * 18,
                        vx: p.aimX * 345,
                        vy: p.aimY * 345,
                        life: 1.15,
                        color: '#9bffcf',
                        char: '+'
                    });
                    state.shotClock = 0.16;
                } else {
                    state.playerShots.push({
                        x: p.x + 22,
                        y: p.y,
                        vx: 470 + Math.max(0, p.aimX) * 70,
                        vy: p.aimY * 155,
                        life: 1.25,
                        color: '#fff1e8',
                        char: '=>'
                    });
                    if (state.sceneElapsed > 0.36) {
                        state.playerShots.push({
                            x: p.x + 18,
                            y: p.y + 8,
                            vx: 420,
                            vy: p.aimY * 120 + 34,
                            life: 1.1,
                            color: '#8ff7ff',
                            char: '-'
                        });
                    }
                    state.shotClock = 0.12;
                }
            }

            for (let i = state.enemies.length - 1; i >= 0; i--) {
                const e = state.enemies[i];
                e.phase += dt * (e.type === 'shiftSkimmer' || e.type === 'binarySkimmer' ? 4.6 : 2.2);
                if (e.sceneId === 'binary') {
                    e.x += (e.vx + Math.sin(e.phase) * 22) * dt;
                    e.y += e.vy * dt;
                } else if (e.sceneId === 'prism') {
                    const dx = state.pilot.x - e.x;
                    const dy = state.pilot.y - e.y;
                    const len = Math.max(1, Math.hypot(dx, dy));
                    const chase = e.type === 'prismDiver' ? 116 : 84;
                    const orbit = e.orbitSign || 1;
                    e.vx += (dx / len * chase - dy / len * orbit * 42 - e.vx) * Math.min(1, dt * 3.2);
                    e.vy += (dy / len * chase + dx / len * orbit * 42 - e.vy) * Math.min(1, dt * 3.2);
                    e.x += e.vx * dt;
                    e.y += e.vy * dt;
                } else if (e.sceneId === 'matrix') {
                    e.x += e.vx * dt;
                    e.y += e.vy * dt;
                    const minX = rect.x + rect.w * 0.17;
                    const maxX = rect.x + rect.w * 0.83;
                    const minY = rect.y + rect.h * 0.16;
                    const maxY = rect.y + rect.h * 0.84;
                    if (e.x < minX || e.x > maxX) e.vx *= -1;
                    if (e.y < minY || e.y > maxY) e.vy *= -1;
                    e.x = benchmarkClamp(e.x, minX, maxX);
                    e.y = benchmarkClamp(e.y, minY, maxY);
                } else {
                    e.x += e.vx * dt;
                    e.y += (e.vy + Math.sin(e.phase) * (e.type === 'bitDrone' ? 30 : 14)) * dt;
                    e.y = benchmarkClamp(e.y, rect.y + 28, rect.y + rect.h - 28);
                }
                e.fireClock -= dt;
                if (!state.completed && e.fireClock <= 0) {
                    const dx = state.pilot.x - e.x;
                    const dy = state.pilot.y - e.y;
                    const len = Math.max(1, Math.hypot(dx, dy));
                    const speed = e.sceneId === 'matrix' ? 132 : (e.sceneId === 'binary' ? 150 : 142);
                    const straightLeft = e.sceneId === 'bitshift' && (e.type === 'registerTurret' || e.type === 'parityMine');
                    const straightDown = e.sceneId === 'binary';
                    state.enemyBullets.push({
                        x: e.x + (e.sceneId === 'binary' ? 0 : -12),
                        y: e.y + (e.sceneId === 'binary' ? 16 : 0),
                        vx: straightLeft ? -speed : (straightDown ? Math.sin(e.phase) * 28 : dx / len * speed),
                        vy: straightLeft ? dy / len * speed * 0.25 : (straightDown ? speed : dy / len * speed),
                        life: 2.6,
                        color: e.sceneId === 'matrix' ? '#65ffb8' : (e.sceneId === 'prism' ? '#ff8fd8' : '#ffba70'),
                        char: e.sceneId === 'matrix' ? '0' : (e.sceneId === 'binary' ? '!' : '*')
                    });
                    e.fireClock = e.sceneId === 'matrix'
                        ? 0.75 + benchmarkRandom(state) * 0.9
                        : e.sceneId === 'prism'
                            ? 0.95 + benchmarkRandom(state) * 0.9
                            : 0.82 + benchmarkRandom(state) * 0.95;
                }
                if (e.x < rect.x - 58 || e.x > rect.x + rect.w + 80 || e.y < rect.y - 80 || e.y > rect.y + rect.h + 80) state.enemies.splice(i, 1);
            }

            for (let i = state.playerShots.length - 1; i >= 0; i--) {
                const p = state.playerShots[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= dt;
                let consumed = p.life <= 0 || p.x > rect.x + rect.w + 34 || p.y < rect.y - 30 || p.y > rect.y + rect.h + 30;
                if (!consumed) {
                    if (state.boss) {
                        const dx = p.x - state.boss.x;
                        const dy = p.y - state.boss.y;
                        if (dx * dx + dy * dy < (state.boss.radius + 8) * (state.boss.radius + 8)) {
                            state.boss.hp = Math.max(0, state.boss.hp - 1);
                            state.boss.flashTimer = 0.08;
                            consumed = true;
                            spawnGraphicsBenchmarkParticle(state, p.x, p.y, state.boss.accent || state.boss.color, 2);
                        }
                    }
                }
                if (!consumed) {
                    for (let j = state.enemies.length - 1; j >= 0; j--) {
                        const e = state.enemies[j];
                        const dx = p.x - e.x;
                        const dy = p.y - e.y;
                        if (dx * dx + dy * dy < (e.radius + 5) * (e.radius + 5)) {
                            e.hp -= 1;
                            consumed = true;
                            spawnGraphicsBenchmarkParticle(state, p.x, p.y, e.color, 3);
                            if (e.hp <= 0) {
                                spawnGraphicsBenchmarkParticle(state, e.x, e.y, e.color, 10);
                                state.enemies.splice(j, 1);
                            }
                            break;
                        }
                    }
                }
                if (consumed) state.playerShots.splice(i, 1);
            }

            for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
                const b = state.enemyBullets[i];
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.life -= dt;
                if (b.life <= 0 || b.x < rect.x - 28 || b.x > rect.x + rect.w + 32 || b.y < rect.y - 28 || b.y > rect.y + rect.h + 28) {
                    state.enemyBullets.splice(i, 1);
                }
            }

            if (state.bombBursts) {
                for (let i = state.bombBursts.length - 1; i >= 0; i--) {
                    const burst = state.bombBursts[i];
                    burst.life += dt;
                    const t = benchmarkClamp(burst.life / Math.max(0.1, burst.maxLife), 0, 1);
                    burst.radius = burst.maxRadius * (1 - Math.pow(1 - t, 2.2));
                    if (burst.life >= burst.maxLife) state.bombBursts.splice(i, 1);
                }
            }

            for (let i = state.particles.length - 1; i >= 0; i--) {
                const p = state.particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vx *= Math.pow(0.13, dt);
                p.vy *= Math.pow(0.13, dt);
                p.life -= dt;
                if (p.life <= 0) state.particles.splice(i, 1);
            }
        }

        function updateGraphicsBenchmarkMode(dt, renderNow) {
            const state = graphicsBenchmarkState;
            if (!state || (!state.active && !state.completed)) return;
            const step = benchmarkClamp(Number.isFinite(dt) ? dt : 1 / 60, 0, 0.05);
            const fps = step > 0 ? 1 / step : 0;
            state.currentFps = fps;
            updateGraphicsBenchmarkDemo(state, state.completed ? step * 0.32 : step);
            if (state.completed) return;
            if (typeof document !== 'undefined' && document.hidden) {
                state.confidenceStatus = 'TAB HIDDEN';
                return;
            }

            state.elapsed = Math.min(state.duration, state.elapsed + step);
            state.profileElapsed += step;
            updateGraphicsBenchmarkRefreshEstimate(state, fps);

            if (state.profileElapsed > state.profileWarmup && fps > 0) {
                addGraphicsBenchmarkSample(state.profileMetrics, fps, state.targetFps);
                const summary = summarizeGraphicsBenchmarkSamples(state.profileMetrics, state.targetFps, state.refreshUncertain);
                state.sampleCount = summary.sampleCount;
                state.averageFps = summary.avgFps;
                state.lowFps = summary.lowFps;
                state.minFps = summary.minFps;
                state.maxFps = summary.maxFps;
                state.frameStability = summary.stability;
                state.confidence = summary.confidence;
                state.confidenceLabel = summary.confidenceLabel;
                state.confidenceStatus = summary.confidenceLabel;
            }

            if (state.profileElapsed >= state.profileDuration) {
                const profile = state.currentProfile;
                const summary = summarizeGraphicsBenchmarkSamples(state.profileMetrics, state.targetFps, state.refreshUncertain);
                if (profile) {
                    state.profileResults.push(Object.assign({}, summary, {
                        profile,
                        targetFps: state.targetFps,
                        refreshUncertain: state.refreshUncertain,
                        settings: getGraphicsBenchmarkProfileSettings(profile, state.targetFps)
                    }));
                }
                state.currentProfileIndex++;
                if (state.currentProfileIndex < state.profiles.length) {
                    state.currentProfile = state.profiles[state.currentProfileIndex];
                    state.profileElapsed = 0;
                    state.profileMetrics = createGraphicsBenchmarkMetricBucket();
                    const settings = getGraphicsBenchmarkProfileSettings(state.currentProfile, state.targetFps);
                    settings.fpsCap = false;
                    applyGraphicsBenchmarkSettings(settings, false);
                    resetGraphicsBenchmarkDemo(state);
                    return;
                }
                state.completed = true;
                state.active = false;
                state.completedAt = renderNow || performance.now();
                chooseGraphicsBenchmarkRecommendation(state);
                if (!state.recommendedResult) restoreGraphicsBenchmarkPreviousSettings(state);
            }
        }

        function drawGraphicsBenchmarkBar(x, y, w, h, ratio, color, label, valueText) {
            const clamped = benchmarkClamp(ratio, 0, 1);
            ctx.save();
            ctx.fillStyle = 'rgba(0, 7, 16, 0.76)';
            ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
            ctx.strokeStyle = colorWithAlpha(color, 0.44);
            ctx.lineWidth = 1;
            ctx.strokeRect((x + 0.5) | 0, (y + 0.5) | 0, w | 0, h | 0);
            const fillW = Math.max(0, Math.round((w - 6) * clamped));
            const grad = ctx.createLinearGradient(x + 3, y, x + w - 3, y);
            grad.addColorStop(0, colorWithAlpha(color, 0.28));
            grad.addColorStop(0.7, colorWithAlpha(mixColor(color, '#ffffff', 0.25), 0.72));
            grad.addColorStop(1, colorWithAlpha('#ffffff', 0.82));
            ctx.fillStyle = grad;
            ctx.fillRect((x + 3) | 0, (y + 3) | 0, fillW | 0, Math.max(1, h - 6) | 0);
            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillStyle = colorWithAlpha('#e8f6ff', 0.86);
            ctx.fillText(label, x + 8, y + h / 2);
            ctx.textAlign = 'right';
            ctx.fillText(valueText, x + w - 8, y + h / 2);
            ctx.restore();
        }

        function drawGraphicsBenchmarkSpriteLines(sprite, x, y, color, fontSize = 12, alpha = 1) {
            if (!sprite || !sprite.length) return;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${fontSize}px Courier New`;
            ctx.globalAlpha *= alpha;
            ctx.fillStyle = color;
            const lineH = fontSize * 1.05;
            const startY = y - (sprite.length - 1) * lineH * 0.5;
            for (let r = 0; r < sprite.length; r++) {
                ctx.fillText(sprite[r], x, startY + r * lineH);
            }
            ctx.restore();
        }

        function drawGraphicsBenchmarkModeBackdrop(state, rect, renderNow, scene) {
            const field = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
            if (scene.id === 'prism') {
                field.addColorStop(0, 'rgba(5, 8, 24, 0.98)');
                field.addColorStop(0.55, 'rgba(12, 22, 36, 0.96)');
                field.addColorStop(1, 'rgba(5, 6, 18, 0.98)');
            } else if (scene.id === 'matrix') {
                field.addColorStop(0, 'rgba(1, 10, 14, 0.98)');
                field.addColorStop(0.55, 'rgba(2, 18, 24, 0.96)');
                field.addColorStop(1, 'rgba(1, 6, 12, 0.98)');
            } else if (scene.id === 'bitshift') {
                field.addColorStop(0, 'rgba(10, 7, 14, 0.98)');
                field.addColorStop(0.55, 'rgba(22, 12, 18, 0.96)');
                field.addColorStop(1, 'rgba(5, 8, 18, 0.98)');
            } else {
                field.addColorStop(0, 'rgba(3, 11, 24, 0.98)');
                field.addColorStop(0.55, 'rgba(4, 16, 30, 0.96)');
                field.addColorStop(1, 'rgba(2, 6, 14, 0.98)');
            }
            ctx.fillStyle = field;
            ctx.fillRect(rect.x | 0, rect.y | 0, rect.w | 0, rect.h | 0);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < state.stars.length; i++) {
                const s = state.stars[i];
                ctx.globalAlpha = s.alpha * (0.70 + Math.sin(renderNow * 0.003 + i) * 0.18);
                ctx.fillStyle = s.depth > 0.9 ? '#d7f8ff' : (i % 5 === 0 ? scene.accent : scene.color);
                ctx.font = `bold ${Math.round(7 + s.depth * 7)}px Courier New`;
                ctx.fillText(s.char, s.x | 0, s.y | 0);
            }
            ctx.globalAlpha = 1;

            ctx.strokeStyle = colorWithAlpha(scene.accent || currentThemeColor, 0.10);
            ctx.lineWidth = 1;
            if (scene.id === 'binary') {
                const laneOffset = (renderNow * 0.05) % 42;
                for (let x = rect.x + 28; x < rect.x + rect.w; x += 86) {
                    ctx.beginPath();
                    ctx.moveTo(x | 0, rect.y);
                    ctx.lineTo(x | 0, rect.y + rect.h);
                    ctx.stroke();
                }
                for (let y = rect.y - laneOffset; y < rect.y + rect.h; y += 42) {
                    ctx.globalAlpha = 0.16;
                    ctx.fillStyle = scene.color;
                    ctx.font = 'bold 10px Courier New';
                    ctx.fillText('|', rect.x + rect.w * 0.16, y);
                    ctx.fillText('|', rect.x + rect.w * 0.84, y + 18);
                }
            } else if (scene.id === 'prism') {
                const cx = rect.x + rect.w * 0.5;
                const cy = rect.y + rect.h * 0.5;
                ctx.globalAlpha = 0.22;
                for (let r = 0; r < 4; r++) {
                    ctx.strokeStyle = colorWithAlpha(r % 2 ? '#ff8fd8' : '#8ff7ff', 0.20 - r * 0.025);
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, 90 + r * 52, 36 + r * 19, renderNow * 0.0007 + r * 0.42, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.globalAlpha = 0.22;
                ctx.fillStyle = '#bfffff';
                ctx.font = 'bold 18px Courier New';
                for (let i = 0; i < 12; i++) {
                    const a = renderNow * 0.0008 + i * Math.PI * 2 / 12;
                    ctx.fillText(i % 2 ? '<' : '>', cx + Math.cos(a) * (128 + i % 3 * 24), cy + Math.sin(a) * (54 + i % 4 * 14));
                }
            } else if (scene.id === 'matrix') {
                const roomX = rect.x + rect.w * 0.16;
                const roomY = rect.y + rect.h * 0.14;
                const roomW = rect.w * 0.68;
                const roomH = rect.h * 0.72;
                ctx.strokeStyle = colorWithAlpha('#65ffb8', 0.28);
                ctx.strokeRect(roomX | 0, roomY | 0, roomW | 0, roomH | 0);
                ctx.globalAlpha = 0.18;
                for (let x = roomX + 36; x < roomX + roomW; x += 36) {
                    ctx.beginPath();
                    ctx.moveTo(x | 0, roomY);
                    ctx.lineTo(x | 0, roomY + roomH);
                    ctx.stroke();
                }
                for (let y = roomY + 36; y < roomY + roomH; y += 36) {
                    ctx.beginPath();
                    ctx.moveTo(roomX, y | 0);
                    ctx.lineTo(roomX + roomW, y | 0);
                    ctx.stroke();
                }
                ctx.globalAlpha = 0.30;
                ctx.fillStyle = '#65ffb8';
                ctx.font = 'bold 11px Courier New';
                ctx.fillText('[ CACHE ]', roomX + roomW * 0.5, roomY - 14);
                ctx.fillText('DOOR', roomX + roomW + 20, roomY + roomH * 0.5);
            } else {
                const streamOffset = (renderNow * 0.08) % 72;
                ctx.font = 'bold 10px Courier New';
                for (let y = rect.y + 28; y < rect.y + rect.h; y += 34) {
                    ctx.globalAlpha = 0.10 + ((y / 34) % 3) * 0.035;
                    ctx.strokeStyle = colorWithAlpha(y % 2 ? '#ff9a73' : '#8ff7ff', 0.28);
                    ctx.beginPath();
                    ctx.moveTo(rect.x + ((y + streamOffset) % 96), y | 0);
                    ctx.lineTo(rect.x + rect.w, y | 0);
                    ctx.stroke();
                    ctx.fillStyle = y % 2 ? '#ff9a73' : '#8ff7ff';
                    ctx.fillText(y % 3 ? '0101' : '>>', rect.x + rect.w - ((streamOffset + y) % rect.w), y - 8);
                }
            }
            ctx.globalAlpha = 1;
        }

        function drawGraphicsBenchmarkPilot(state, scene, renderNow) {
            const p = state.pilot;
            const fakeShip = {
                x: p.x,
                y: p.y,
                vx: p.vx,
                vy: p.vy,
                flashTimer: 0,
                shipId: scene.id === 'prism' ? 'glasswing' : (scene.id === 'matrix' ? 'ionManta' : 'arrowhead'),
                color: '#e8fbff',
                _renderLayoutCache: null
            };
            ctx.save();
            if (typeof drawCheapGlowDot === 'function') {
                drawCheapGlowDot(ctx, p.x, p.y, scene.id === 'bitshift' ? 24 : 28, scene.accent || '#8ff7ff', {
                    alpha: 0.06,
                    core: false,
                    maxRadius: 32
                });
            }
            ctx.fillStyle = '#e8fbff';
            ctx.shadowColor = scene.accent || '#8ff7ff';
            ctx.shadowBlur = typeof getLiveGlowBlur === 'function'
                ? getLiveGlowBlur(10, 'high', 1, 0.30)
                : (glowEnabled ? 10 : 0);
            if (typeof drawPlayerShip === 'function') {
                if (scene.id === 'bitshift') {
                    const rotation = typeof BITSHIFT_SHIP_RENDER_ROTATION === 'number' ? BITSHIFT_SHIP_RENDER_ROTATION : Math.PI / 2;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(rotation);
                    ctx.translate(-p.x, -p.y);
                }
                drawPlayerShip(fakeShip, 'center');
            } else {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 28px Courier New';
                ctx.fillText(scene.id === 'binary' ? '^' : '>', p.x, p.y);
            }
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = 0.50 + Math.sin(renderNow * 0.024) * 0.16;
            ctx.fillStyle = scene.id === 'bitshift' ? '#ff9a73' : '#ffb36a';
            ctx.font = 'bold 14px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (scene.id === 'binary') ctx.fillText('.', p.x, p.y + 28);
            else ctx.fillText('.', p.x - 26, p.y);
            ctx.restore();
        }

        function drawGraphicsBenchmarkEnemy(enemy, renderNow) {
            ctx.save();
            if (enemy.enemyShipSprite && typeof drawEnemyShipSprite === 'function') {
                drawEnemyShipSprite(enemy);
                ctx.restore();
                return;
            }
            if (enemy.sceneId === 'bitshift' && enemy.sprite && typeof drawBitshiftSprite === 'function') {
                drawBitshiftSprite(enemy.sprite, enemy.x, enemy.y, enemy.color, enemy.type === 'parityMine' ? 1 + Math.sin(renderNow * 0.008 + enemy.phase) * 0.08 : 1, 0);
                ctx.restore();
                return;
            }
            if (enemy.sprite) {
                drawGraphicsBenchmarkSpriteLines(enemy.sprite, enemy.x, enemy.y, enemy.color, enemy.spriteFontSize || 10, enemy.type === 'matrixPhantom' ? 0.72 : 0.88);
                ctx.restore();
                return;
            }
            const pulse = 0.72 + Math.sin(renderNow * 0.006 + enemy.phase) * 0.12;
            ctx.translate(enemy.x | 0, enemy.y | 0);
            ctx.rotate(enemy.type === 'shiftSkimmer' || enemy.type === 'binarySkimmer' ? Math.sin(enemy.phase) * 0.28 : 0);
            ctx.fillStyle = enemy.hp <= 1 ? '#ffffff' : enemy.color;
            ctx.font = `bold ${Math.round(enemy.size * pulse)}px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (typeof drawCheapGlowGlyph === 'function' && enemy.hp <= 1) {
                drawCheapGlowGlyph(ctx, enemy.char, 0, 0, ctx.font, enemy.color, {
                    alpha: 0.08,
                    echoAlpha: 0.035,
                    sizeBoost: 1.14,
                    maxFontSize: 30
                });
            }
            ctx.fillText(enemy.char, 0, 0);
            ctx.restore();
        }

        function drawGraphicsBenchmarkBoss(state, scene, renderNow) {
            const bossObj = state && state.boss;
            if (!bossObj) return;
            ctx.save();
            const alpha = scene.id === 'matrix' ? 0.74 : 0.86;
            const flashColor = bossObj.flashTimer > 0 ? '#ffffff' : bossObj.color;
            if (typeof drawCheapGlowDot === 'function') {
                drawCheapGlowDot(ctx, bossObj.x, bossObj.y, bossObj.radius * 0.9, bossObj.accent || bossObj.color, {
                    alpha: bossObj.flareTimer > 0 ? 0.10 : 0.045,
                    core: false,
                    maxRadius: 96
                });
            }
            if (scene.id === 'bitshift') {
                ctx.globalAlpha = 0.24 + (bossObj.gravityPulse || 0) * 0.12;
                ctx.strokeStyle = colorWithAlpha('#8ff7ff', 0.45);
                ctx.lineWidth = 2;
                ctx.save();
                ctx.translate(bossObj.x, bossObj.y);
                ctx.rotate(bossObj.ringAngle || 0);
                ctx.beginPath();
                ctx.ellipse(0, 0, bossObj.radius * 1.18, bossObj.radius * 0.38, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                ctx.globalAlpha = 1;
            }
            ctx.globalAlpha = alpha;
            if (bossObj.sprite) {
                drawGraphicsBenchmarkSpriteLines(
                    bossObj.sprite,
                    bossObj.x,
                    bossObj.y,
                    flashColor,
                    bossObj.spriteFontSize || 9,
                    alpha
                );
            } else {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = flashColor;
                ctx.font = 'bold 34px Courier New';
                ctx.fillText('@', bossObj.x, bossObj.y);
            }
            ctx.globalAlpha = 1;

            const healthRatio = bossObj.maxHp > 0 ? benchmarkClamp(bossObj.hp / bossObj.maxHp, 0, 1) : 1;
            const barW = Math.min(210, Math.max(130, bossObj.radius * 2.8));
            const barX = bossObj.x - barW / 2;
            const barY = bossObj.y + bossObj.radius * 0.82 + 22;
            ctx.fillStyle = 'rgba(0, 5, 12, 0.72)';
            ctx.fillRect(barX | 0, barY | 0, barW | 0, 6);
            ctx.fillStyle = bossObj.accent || scene.accent || '#8ff7ff';
            ctx.fillRect(barX | 0, barY | 0, (barW * healthRatio) | 0, 6);
            ctx.strokeStyle = colorWithAlpha('#ffffff', 0.40);
            ctx.strokeRect((barX + 0.5) | 0, (barY + 0.5) | 0, barW | 0, 6);
            ctx.font = 'bold 10px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.58);
            ctx.fillText('BOSS TRACE', bossObj.x | 0, barY + 9);
            ctx.restore();
        }

        function drawGraphicsBenchmarkBombBursts(state, renderNow) {
            if (!state || !state.bombBursts) return;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < state.bombBursts.length; i++) {
                const burst = state.bombBursts[i];
                const t = benchmarkClamp(burst.life / Math.max(0.1, burst.maxLife), 0, 1);
                const alpha = Math.max(0, 1 - t);
                ctx.globalAlpha = alpha * 0.58;
                ctx.strokeStyle = burst.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(burst.x | 0, burst.y | 0, Math.max(2, burst.radius), 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = alpha * 0.28;
                ctx.strokeStyle = burst.accent || '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(burst.x | 0, burst.y | 0, Math.max(2, burst.radius * 0.58), 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = alpha * 0.72;
                ctx.fillStyle = t < 0.18 ? '#ffffff' : burst.color;
                ctx.font = `bold ${Math.round(20 + 18 * alpha)}px Courier New`;
                ctx.fillText('*', burst.x | 0, burst.y | 0);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawGraphicsBenchmarkSceneTransition(state, rect, renderNow) {
            const t = benchmarkClamp((state.sceneTransition || 0) / GRAPHICS_BENCHMARK_SCENE_TRANSITION_SECONDS, 0, 1);
            if (t <= 0) return;
            const scene = getGraphicsBenchmarkScene(state);
            const previous = state.previousSceneIndex >= 0 ? getGraphicsBenchmarkScene(state, state.previousSceneIndex) : null;
            ctx.save();
            ctx.globalAlpha = 0.22 * t;
            ctx.fillStyle = '#020814';
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            const sweepX = rect.x + rect.w * (1 - t);
            ctx.globalAlpha = 0.48 * t;
            ctx.fillStyle = colorWithAlpha(scene.accent || currentThemeColor, 0.62);
            ctx.fillRect((sweepX - 2) | 0, rect.y, 4, rect.h);
            ctx.globalAlpha = 0.78 * t;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.max(14, Math.round(width * 0.014))}px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            const text = previous ? `${previous.label}  >  ${scene.label}` : scene.label;
            ctx.fillText(text, rect.x + rect.w / 2, rect.y + rect.h / 2);
            ctx.font = 'bold 12px Courier New';
            ctx.fillStyle = colorWithAlpha(scene.accent || currentThemeColor, 0.82);
            ctx.fillText(scene.subtitle, rect.x + rect.w / 2, rect.y + rect.h / 2 + 24);
            ctx.restore();
        }

        function drawGraphicsBenchmarkDemo(state, rect, renderNow) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(rect.x | 0, rect.y | 0, rect.w | 0, rect.h | 0);
            ctx.clip();
            const scene = getGraphicsBenchmarkScene(state);
            drawGraphicsBenchmarkModeBackdrop(state, rect, renderNow, scene);
            drawGraphicsBenchmarkBoss(state, scene, renderNow);

            for (let i = 0; i < state.playerShots.length; i++) {
                const p = state.playerShots[i];
                ctx.fillStyle = p.color;
                ctx.font = `bold ${p.char === '=>' ? 18 : (p.char === '|' ? 18 : 16)}px Courier New`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (typeof drawCheapGlowGlyph === 'function') {
                    drawCheapGlowGlyph(ctx, p.char, p.x, p.y, ctx.font, p.color, {
                        alpha: 0.08,
                        echoAlpha: 0.035,
                        sizeBoost: 1.14,
                        maxFontSize: 25
                    });
                }
                ctx.fillText(p.char, p.x | 0, p.y | 0);
            }

            for (let i = 0; i < state.enemyBullets.length; i++) {
                const b = state.enemyBullets[i];
                ctx.fillStyle = b.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `bold ${b.char === '*' ? 17 : 16}px Courier New`;
                ctx.fillText(b.char, b.x | 0, b.y | 0);
            }

            for (let i = 0; i < state.enemies.length; i++) {
                drawGraphicsBenchmarkEnemy(state.enemies[i], renderNow);
            }

            drawGraphicsBenchmarkPilot(state, scene, renderNow);
            ctx.globalAlpha = 1;
            drawGraphicsBenchmarkBombBursts(state, renderNow);

            for (let i = 0; i < state.particles.length; i++) {
                const pfx = state.particles[i];
                ctx.globalAlpha = Math.max(0, Math.min(1, pfx.life / Math.max(0.1, pfx.maxLife || 0.75)));
                ctx.fillStyle = pfx.color;
                ctx.font = `bold 13px Courier New`;
                ctx.fillText(pfx.char, pfx.x | 0, pfx.y | 0);
            }
            ctx.globalAlpha = 1;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.64);
            ctx.fillText(`${scene.label} // ${scene.subtitle}`, rect.x + 18, rect.y + 16);
            drawGraphicsBenchmarkSceneTransition(state, rect, renderNow);
            ctx.restore();
        }

        function drawGraphicsBenchmarkSpinner(cx, cy, renderNow, color) {
            const chars = ['|', '/', '-', '\\', '+', 'x', '*', '0'];
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < chars.length; i++) {
                const a = renderNow * 0.0034 + i * Math.PI * 2 / chars.length;
                const r = 20 + Math.sin(renderNow * 0.004 + i) * 3;
                const alpha = 0.22 + ((i + Math.floor(renderNow * 0.012)) % chars.length) / chars.length * 0.64;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = i % 3 === 0 ? '#ffffff' : color;
                ctx.font = `bold ${i % 2 ? 13 : 15}px Courier New`;
                ctx.fillText(chars[i], (cx + Math.cos(a) * r) | 0, (cy + Math.sin(a) * r) | 0);
            }
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold 11px Courier New`;
            ctx.fillText('AI', cx | 0, cy | 0);
            ctx.restore();
        }

        function drawGraphicsBenchmarkScreen(renderNow, dt) {
            const state = graphicsBenchmarkState || createGraphicsBenchmarkState();
            const rect = getGraphicsBenchmarkPlayRect();
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#020814');
            bg.addColorStop(0.52, '#061020');
            bg.addColorStop(1, '#020610');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width | 0, height | 0);

            ctx.fillStyle = colorWithAlpha(currentThemeColor, 0.035);
            ctx.fillRect(0, 0, width | 0, height | 0);
            drawGraphicsBenchmarkDemo(state, rect, renderNow);

            drawPauseHudPanel(rect.x - 8, rect.y - 8, rect.w + 16, rect.h + 16, currentThemeColor, false, {
                fillAlpha: 0.10,
                borderAlpha: 0.44,
                rail: true,
                innerSheenAlpha: 0.003,
                edgeWashAlpha: 0.010
            });

            const progress = state.duration > 0 ? benchmarkClamp(state.elapsed / state.duration, 0, 1) : 0;
            const title = state.completed
                ? (state.cancelled ? 'BENCHMARK CANCELLED' : 'BENCHMARK COMPLETE')
                : 'BENCHMARKING';
            const titlePulse = state.completed ? 0.18 : (0.26 + Math.sin(renderNow * 0.006) * 0.10);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 30px 'Electrolize', sans-serif`;
            ctx.fillStyle = mixColor(currentThemeColor, '#ffffff', state.completed ? 0.62 : 0.46);
            if (glowEnabled) {
                ctx.shadowColor = currentThemeColor;
                ctx.shadowBlur = state.completed ? 16 : 10;
            }
            ctx.fillText(`[ ${title} ]`, width / 2, 44);
            ctx.shadowBlur = 0;
            ctx.font = `bold 12px Courier New`;
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.32 + titlePulse);
            const phaseText = state.completed
                ? state.recommendation
                : `${getGraphicsBenchmarkPhase(state.elapsed, state)} // ${state.currentProfile ? state.currentProfile.label : 'PROFILE'}`;
            ctx.fillText(phaseText, width / 2, 72);

            drawGraphicsBenchmarkSpinner(rect.x + 38, 47, renderNow, currentThemeColor);

            const scanY = rect.y + ((renderNow * 0.052) % rect.h);
            ctx.globalAlpha = state.completed ? 0.10 : 0.24;
            ctx.strokeStyle = colorWithAlpha('#ffffff', 0.48);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rect.x, scanY | 0);
            ctx.lineTo(rect.x + rect.w, scanY | 0);
            ctx.stroke();
            ctx.globalAlpha = 1;

            const panelW = Math.min(width - 72, 680);
            const panelX = Math.round((width - panelW) / 2);
            const panelY = Math.round(rect.y + rect.h + 30);
            const panelH = Math.min(206, height - panelY - 22);
            drawPauseHudPanel(panelX, panelY, panelW, panelH, currentThemeColor, true, {
                fillAlpha: 0.70,
                borderAlpha: 0.58,
                rail: false,
                edgeWashAlpha: 0.006,
                innerSheenAlpha: 0.003
            });

            const barX = panelX + 24;
            const barW = panelW - 48;
            const confidenceColor = state.confidenceLabel === 'LOCKED'
                ? '#8ff7ff'
                : state.confidenceLabel === 'HIGH'
                    ? '#a8ffb8'
                    : state.confidenceLabel === 'STABLE'
                        ? '#ffcf6a'
                        : '#ff7a72';
            drawGraphicsBenchmarkBar(barX, panelY + 22, barW, 20, progress, currentThemeColor, 'PROGRESS', `${Math.round(progress * 100)}%`);
            drawGraphicsBenchmarkBar(
                barX,
                panelY + 52,
                barW,
                28,
                state.confidence / 100,
                confidenceColor,
                `CONFIDENCE ${state.confidenceLabel || 'LOW'}`,
                `${Math.round(state.confidence)}%`
            );

            const avg = state.averageFps || 0;
            const fpsText = state.currentFps ? Math.round(state.currentFps).toString() : '--';
            const avgText = avg ? Math.round(avg).toString() : '--';
            const lowText = state.lowFps ? Math.round(state.lowFps).toString() : '--';
            const targetText = state.targetFps ? Math.round(state.targetFps).toString() : GRAPHICS_BENCHMARK_FALLBACK_TARGET_FPS.toString();
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#e8f6ff', 0.88);
            ctx.fillText(`CURRENT ${fpsText}`, panelX + 28, panelY + 104);
            ctx.fillText(`AVG ${avgText}`, panelX + 142, panelY + 104);
            ctx.fillText(`1% LOW ${lowText}`, panelX + 232, panelY + 104);
            ctx.fillText(`TARGET ${targetText}`, panelX + 350, panelY + 104);
            ctx.fillText(`SAMPLES ${state.sampleCount || 0}`, panelX + 462, panelY + 104);

            ctx.font = `bold 11px Courier New`;
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.62);
            const profileText = state.completed && state.recommendedProfile
                ? `RECOMMENDED PROFILE: ${state.recommendedProfile.label}`
                : `TESTING PROFILE: ${state.currentProfile ? state.currentProfile.label : '--'} // ${getGraphicsBenchmarkScene(state).label}`;
            ctx.fillText(profileText, panelX + 28, panelY + 130);
            const settingsSource = state.completed && state.recommendedProfile ? state.recommendedProfile : state.currentProfile;
            ctx.fillStyle = colorWithAlpha(mixColor(currentThemeColor, '#ffffff', 0.38), 0.78);
            ctx.fillText(getGraphicsBenchmarkProfileSettingsLabel(settingsSource, state.targetFps), panelX + 28, panelY + 150);
            if (state.completed && state.recommendedResult) {
                ctx.fillStyle = colorWithAlpha('#ffffff', 0.56);
                const measured = `MEASURED AVG ${Math.round(state.recommendedResult.avgFps || 0)} / LOW ${Math.round(state.recommendedResult.lowFps || 0)} / TARGET ${targetText}`;
                ctx.fillText(measured, panelX + 28, panelY + 170);
            } else {
                ctx.fillStyle = colorWithAlpha('#ffffff', 0.42);
                const refresh = state.refreshUncertain
                    ? `REFRESH ESTIMATE ${targetText} FPS // CONSERVATIVE`
                    : `REFRESH ESTIMATE ${targetText} FPS // ${state.refreshConfidence}%`;
                ctx.fillText(refresh, panelX + 28, panelY + 170);
            }

            ctx.textAlign = 'center';
            ctx.font = `bold 12px Courier New`;
            ctx.fillStyle = colorWithAlpha('#ffffff', state.completed ? 0.86 : 0.52);
            const help = state.completed
                ? 'ENTER / SPACE TO APPLY    ESC TO CANCEL AND RESTORE'
                : 'AI PILOT RUNNING  |  ESC TO CANCEL';
            ctx.fillText(help, panelX + panelW / 2, panelY + panelH - 20);
            ctx.restore();
        }

        window.debugGraphicsBenchmarkState = function debugGraphicsBenchmarkState() {
            const state = graphicsBenchmarkState || {};
            return {
                active: !!state.active,
                completed: !!state.completed,
                cancelled: !!state.cancelled,
                elapsed: state.elapsed,
                targetFps: state.targetFps,
                refreshEstimate: state.refreshEstimate,
                refreshUncertain: state.refreshUncertain,
                currentProfile: state.currentProfile ? state.currentProfile.label : null,
                currentScene: getGraphicsBenchmarkScene(state).label,
                sceneIndex: state.sceneIndex,
                sceneElapsed: state.sceneElapsed,
                boss: state.boss ? state.boss.name : null,
                bossHp: state.boss ? state.boss.hp : 0,
                recommendedProfile: state.recommendedProfile ? state.recommendedProfile.label : null,
                currentFps: state.currentFps,
                averageFps: state.averageFps,
                lowFps: state.lowFps,
                confidence: state.confidence,
                confidenceLabel: state.confidenceLabel,
                enemies: state.enemies ? state.enemies.length : 0,
                enemyBullets: state.enemyBullets ? state.enemyBullets.length : 0,
                playerShots: state.playerShots ? state.playerShots.length : 0,
                bombBursts: state.bombBursts ? state.bombBursts.length : 0,
                particles: state.particles ? state.particles.length : 0
            };
        };

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
            if (opt.type === 'multiplicative' && opt.id !== 'quick_reset' && opt.id !== 'time_dilator' && opt.id !== 'specter_capacitor') valStr = `-${((1 - opt.value) * 100).toFixed(0)}%`;
            else if (opt.id === 'repair') valStr = `+${opt.value.toFixed(1)}/s`;
            else if (opt.id === 'shield') valStr = `+${opt.value.toFixed(2)}s`;
            else if (opt.id === 'target') valStr = `+${opt.value.toFixed(0)} DMG`;
            else if (opt.id === 'bioscrap') valStr = `+${(opt.value * 100).toFixed(2)}% HP/ORB`;
            else if (opt.id === 'bioleech') valStr = `+${(opt.value * 100).toFixed(1)}% HP/KILL`;
            else if (opt.id === 'glass') valStr = `+${(opt.value * 100).toFixed(0)}% / -${(opt.value * 60).toFixed(0)}% HP`;
            else if (opt.id === 'overflow') valStr = `+${(opt.value * 100).toFixed(0)}% XP`;
            else if (opt.id === 'focus_cell') valStr = `+${(opt.value * 100).toFixed(0)}% MAX`;
            else if (opt.id === 'recharge_loop') valStr = `+${(opt.value * 100).toFixed(0)}% REGEN`;
            else if (opt.id === 'quick_reset') valStr = `-${((1 - opt.value) * 100).toFixed(0)}% WAIT`;
            else if (opt.id === 'focus_salvage') valStr = `+${(opt.value * 100).toFixed(0)}% REFILL`;
            else if (opt.id === 'chrono_brake') valStr = `+${(opt.value * 100).toFixed(0)}% SLOW`;
            else if (opt.id === 'time_dilator' || opt.id === 'specter_capacitor') valStr = `-${((1 - opt.value) * 100).toFixed(0)}% DRAIN`;
            else if (opt.id === 'trail_buffer' || opt.id === 'phase_veil') valStr = `+${(opt.value * 100).toFixed(0)}% FADE`;
            else if (opt.id === 'ghost_geometry') valStr = `-${(opt.value * 100).toFixed(0)}% SIZE`;
            else valStr = `+${(opt.value * 100).toFixed(0)}%`;
            ctx.fillText(valStr, w / 2, h - 25);
            ctx.restore();
        }

        function getPowerupCategoryColor(category) {
            if (category === 'Offense') return '#ff8d5b';
            if (category === 'Defense') return '#6fd9ff';
            if (category === 'Utility') return '#68ffb0';
            if (category === 'Risk') return '#ff72d9';
            if (category === 'Focus') return '#ffe680';
            if (category === 'Drive') return '#60ffd2';
            if (category === 'Specter') return '#c79cff';
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
                        beginLevelUpOffer({ returnState: levelUpReturnState || 'PLAYING' });
                    } else {
                        const returnState = levelUpReturnState || 'PLAYING';
                        gameState = returnState;
                        pauseReturnState = returnState;
                        levelUpReturnState = 'PLAYING';
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

        function getBossCameraOverscanRect() {
            const scale = typeof bossCameraZoomScale === 'number' && Number.isFinite(bossCameraZoomScale)
                ? Math.max(0.5, Math.min(1, bossCameraZoomScale))
                : 1;
            if (scale >= 0.9995) return { x: 0, y: 0, w: width, h: height };
            const playfieldH = height - HUD_HEIGHT;
            const centerX = width / 2;
            const centerY = playfieldH / 2;
            const invScale = 1 / scale;
            const left = centerX - centerX * invScale;
            const top = centerY - centerY * invScale;
            const right = centerX + (width - centerX) * invScale;
            const bottom = centerY + (height - centerY) * invScale;
            const pad = 8;
            return {
                x: left - pad,
                y: top - pad,
                w: right - left + pad * 2,
                h: bottom - top + pad * 2
            };
        }

        function fillBossCameraOverscan(fillStyle) {
            const rect = getBossCameraOverscanRect();
            ctx.fillStyle = fillStyle;
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            return rect;
        }

        function drawReturnLoadingScreen(now) {
            const transition = returnLoadingTransition || {};
            const elapsed = ((now || performance.now()) - (transition.startedAt || now || performance.now())) / 1000;
            const progress = Math.max(0, Math.min(1, elapsed / RETURN_LOADING_DURATION));
            const eased = easeGalaxyWarp(progress);
            const color = transition.color || currentThemeColor;
            const centerX = width / 2;
            const centerY = height * 0.47;
            const pulse = 0.5 + Math.sin(now * 0.006) * 0.5;
            const backdrop = getBossCameraOverscanRect();

            ctx.save();
            ctx.fillStyle = colorWithAlpha('#020712', 0.72 + eased * 0.16);
            ctx.fillRect(backdrop.x, backdrop.y, backdrop.w, backdrop.h);

            const wash = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, Math.max(width, height) * 0.58);
            wash.addColorStop(0, colorWithAlpha(color, 0.12 + pulse * 0.04));
            wash.addColorStop(0.4, colorWithAlpha('#6aa8ff', 0.05));
            wash.addColorStop(1, colorWithAlpha('#ffffff', 0));
            ctx.fillStyle = wash;
            ctx.fillRect(backdrop.x, backdrop.y, backdrop.w, backdrop.h);

            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            for (let i = 0; i < 42; i++) {
                const seed = i * 17.31;
                const angle = (i / 42) * Math.PI * 2 + now * 0.00022 + Math.sin(seed) * 0.08;
                const inner = 34 + Math.sin(now * 0.002 + seed) * 7;
                const outer = inner + 46 + eased * 86 + (i % 5) * 8;
                const alpha = (0.04 + eased * 0.14) * (0.6 + pulse * 0.4);
                ctx.strokeStyle = i % 4 === 0 ? colorWithAlpha('#ffffff', alpha * 0.8) : colorWithAlpha(color, alpha);
                ctx.lineWidth = 0.8 + (i % 3) * 0.45;
                ctx.beginPath();
                ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner * 0.58);
                ctx.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer * 0.58);
                ctx.stroke();
            }
            ctx.globalCompositeOperation = 'source-over';

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 26px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#f2fbff';
            ctx.shadowColor = color;
            ctx.shadowBlur = glowEnabled ? 18 : 0;
            ctx.fillText('RETURNING TO GALAXY MAP', centerX, centerY - 38);
            ctx.shadowBlur = 0;

            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            ctx.fillStyle = 'rgba(202, 229, 255, 0.66)';
            ctx.fillText('STABILIZING ROUTE DATA', centerX, centerY - 10);

            const barW = Math.min(360, width * 0.52);
            const barH = 8;
            const barX = centerX - barW / 2;
            const barY = centerY + 28;
            ctx.fillStyle = 'rgba(2, 8, 18, 0.82)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.strokeStyle = colorWithAlpha(color, 0.58);
            ctx.lineWidth = 1;
            ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);

            const fillW = Math.max(0, Math.min(barW, barW * eased));
            const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
            grad.addColorStop(0, colorWithAlpha(color, 0.5));
            grad.addColorStop(0.7, colorWithAlpha('#dcecff', 0.86));
            grad.addColorStop(1, colorWithAlpha('#ffffff', 0.95));
            ctx.fillStyle = grad;
            ctx.fillRect(barX, barY, fillW, barH);

            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.24 + pulse * 0.18;
            ctx.fillStyle = colorWithAlpha(color, 0.72);
            ctx.fillRect(barX + Math.max(0, fillW - 18), barY - 2, Math.min(24, fillW), barH + 4);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 0;
        }

        function formatRunDuration(seconds) {
            const total = Math.max(0, Math.floor(seconds || 0));
            const mins = Math.floor(total / 60);
            const secs = total % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        function drawGameOverScreen(now) {
            const centerX = width / 2;
            const centerY = height / 2;
            const dangerColor = '#ff5e8a';
            const deepDanger = '#6d1648';
            const pulse = 0.5 + Math.sin(now * 0.0042) * 0.5;
            const slowPulse = 0.5 + Math.sin(now * 0.0017) * 0.5;
            const panelW = Math.min(width * 0.78, 560);
            const panelH = Math.min(height * 0.52, 330);
            const panelX = centerX - panelW / 2;
            const panelY = centerY - panelH / 2 - Math.min(24, height * 0.03);
            const backdrop = getBossCameraOverscanRect();

            ctx.save();
            const veil = ctx.createRadialGradient(centerX, centerY, Math.max(8, panelW * 0.12), centerX, centerY, Math.max(width, height) * 0.74);
            veil.addColorStop(0, 'rgba(18, 4, 18, 0.42)');
            veil.addColorStop(0.46, 'rgba(4, 8, 18, 0.72)');
            veil.addColorStop(1, 'rgba(1, 3, 8, 0.9)');
            ctx.fillStyle = veil;
            ctx.fillRect(backdrop.x, backdrop.y, backdrop.w, backdrop.h);

            const wash = ctx.createLinearGradient(0, panelY, 0, panelY + panelH);
            wash.addColorStop(0, colorWithAlpha(dangerColor, 0.08));
            wash.addColorStop(0.5, colorWithAlpha('#0a1026', 0.08));
            wash.addColorStop(1, colorWithAlpha(deepDanger, 0.12));
            ctx.fillStyle = wash;
            ctx.fillRect(backdrop.x, backdrop.y, backdrop.w, backdrop.h);

            ctx.globalCompositeOperation = 'screen';
            ctx.lineWidth = 1;
            for (let i = 0; i < 24; i++) {
                const y = panelY - 82 + i * 15 + Math.sin(now * 0.002 + i) * 2;
                if (y < backdrop.y || y > backdrop.y + backdrop.h) continue;
                ctx.globalAlpha = 0.018 + (i % 5 === 0 ? 0.026 : 0);
                ctx.strokeStyle = i % 5 === 0 ? '#ffffff' : dangerColor;
                ctx.beginPath();
                ctx.moveTo(backdrop.x + backdrop.w * 0.18, y);
                ctx.lineTo(backdrop.x + backdrop.w * 0.82, y);
                ctx.stroke();
            }

            ctx.globalAlpha = 0.13 + pulse * 0.05;
            ctx.strokeStyle = dangerColor;
            ctx.lineWidth = 1.5;
            const hazardTop = panelY + 20;
            const hazardBottom = panelY + panelH - 20;
            for (let i = 0; i < 10; i++) {
                const offset = ((now * 0.026 + i * 38) % 380) - 190;
                ctx.beginPath();
                ctx.moveTo(panelX - 44 + offset, hazardTop);
                ctx.lineTo(panelX + 68 + offset, hazardBottom);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(panelX + panelW - 68 - offset, hazardTop);
                ctx.lineTo(panelX + panelW + 44 - offset, hazardBottom);
                ctx.stroke();
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;

            ctx.fillStyle = 'rgba(0, 2, 8, 0.58)';
            ctx.fillRect(panelX - 16, panelY - 16, panelW + 32, panelH + 32);
            drawPauseHudPanel(panelX, panelY, panelW, panelH, dangerColor, true, {
                fillAlpha: 0.86,
                borderAlpha: 0.78,
                edgeWashAlpha: 0.018,
                innerSheenAlpha: 0.004,
                flatFill: false,
                rail: true
            });

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const titleY = panelY + panelH * 0.30;
            const titleText = 'YOU DIED';
            const titleSize = Math.max(38, Math.min(68, width * 0.066));
            ctx.font = `bold ${titleSize}px 'Electrolize', sans-serif`;
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 0.86;
            ctx.strokeStyle = 'rgba(2, 4, 12, 0.95)';
            ctx.lineWidth = 12;
            ctx.strokeText(titleText, centerX, titleY);
            ctx.globalAlpha = 0.34 + pulse * 0.18;
            ctx.strokeStyle = colorWithAlpha(dangerColor, 0.74);
            ctx.lineWidth = 3;
            ctx.strokeText(titleText, centerX + Math.sin(now * 0.008) * 1.6, titleY);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#fff2f7';
            ctx.shadowColor = dangerColor;
            ctx.shadowBlur = glowEnabled ? 14 + pulse * 10 : 0;
            ctx.fillText(titleText, centerX, titleY);
            ctx.shadowBlur = 0;

            const hint = currentHint || 'Flight Advisory: Avoid hostile projectiles before impact.';
            const hintText = String(hint);
            const hintColon = hintText.indexOf(':');
            const hintTitle = (hintColon > 0 ? hintText.slice(0, hintColon) : 'Flight Advisory').trim();
            const hintBody = (hintColon > 0 ? hintText.slice(hintColon + 1) : hintText).trim();
            const msgW = Math.min(panelW - 112, 360);
            const msgX = centerX - msgW / 2;
            const msgY = titleY + Math.max(36, titleSize * 0.62);
            const msgBodyFont = `500 15px 'Segoe UI', 'Inter', sans-serif`;
            const msgLineH = 19;
            ctx.font = msgBodyFont;
            const hintLines = wrapPauseText(hintBody, msgW - 40, 2);
            const msgH = 38 + hintLines.length * msgLineH;
            const scanT = ((now * 0.055) % Math.max(1, msgW + 72)) - 36;
            const panelPulse = 0.5 + Math.sin(now * 0.0022) * 0.5;

            const msgFill = ctx.createLinearGradient(msgX, msgY, msgX, msgY + msgH);
            msgFill.addColorStop(0, 'rgba(8, 18, 34, 0.82)');
            msgFill.addColorStop(0.52, 'rgba(2, 7, 18, 0.9)');
            msgFill.addColorStop(1, 'rgba(8, 4, 20, 0.86)');
            ctx.fillStyle = msgFill;
            ctx.fillRect(msgX, msgY, msgW, msgH);
            ctx.strokeStyle = colorWithAlpha('#8ff7ff', 0.34 + panelPulse * 0.12);
            ctx.lineWidth = 1;
            ctx.strokeRect(msgX + 0.5, msgY + 0.5, msgW, msgH);
            ctx.strokeStyle = colorWithAlpha(dangerColor, 0.28);
            ctx.strokeRect(msgX + 5.5, msgY + 5.5, msgW - 11, msgH - 11);

            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.16;
            ctx.fillStyle = colorWithAlpha('#8ff7ff', 0.78);
            ctx.fillRect(msgX + 9, msgY + 8, msgW - 18, 1);
            ctx.fillRect(msgX + 9, msgY + msgH - 9, msgW - 18, 1);
            ctx.globalAlpha = 0.18 + panelPulse * 0.08;
            ctx.fillStyle = colorWithAlpha(dangerColor, 0.62);
            ctx.fillRect(msgX + scanT, msgY + 6, 30, 1.5);
            ctx.fillRect(msgX + msgW - 50, msgY + 14, 20, 1);
            ctx.fillRect(msgX + 22, msgY + msgH - 16, 24, 1);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;

            ctx.textAlign = 'left';
            ctx.font = `600 10px 'Segoe UI', 'Inter', sans-serif`;
            const chipW = Math.min(msgW - 22, Math.max(84, ctx.measureText(hintTitle).width + 24));
            const chipX = msgX + 13;
            const chipY = msgY - 9;
            ctx.fillStyle = 'rgba(4, 12, 24, 0.96)';
            ctx.fillRect(chipX, chipY, chipW, 19);
            ctx.strokeStyle = colorWithAlpha('#8ff7ff', 0.58 + panelPulse * 0.14);
            ctx.strokeRect(chipX + 0.5, chipY + 0.5, chipW, 19);
            ctx.fillStyle = colorWithAlpha('#bff7ff', 0.95);
            ctx.fillText(hintTitle, chipX + 12, chipY + 13);

            ctx.font = msgBodyFont;
            ctx.fillStyle = colorWithAlpha('#f2fbff', 0.95);
            ctx.shadowColor = colorWithAlpha('#8ff7ff', 0.52);
            ctx.shadowBlur = glowEnabled ? 2 : 0;
            for (let i = 0; i < hintLines.length; i++) {
                ctx.fillText(hintLines[i], msgX + 20, msgY + 32 + i * msgLineH);
            }
            ctx.shadowBlur = 0;
            ctx.textAlign = 'center';

            const promptW = Math.min(panelW - 86, 330);
            const promptH = 40;
            const promptX = centerX - promptW / 2;
            const promptY = Math.max(panelY + panelH * 0.64, msgY + msgH + 24);
            ctx.fillStyle = 'rgba(2, 8, 18, 0.78)';
            ctx.fillRect(promptX, promptY, promptW, promptH);
            ctx.strokeStyle = colorWithAlpha(dangerColor, 0.46 + pulse * 0.18);
            ctx.lineWidth = 1;
            ctx.strokeRect(promptX + 0.5, promptY + 0.5, promptW, promptH);
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.14 + slowPulse * 0.12;
            ctx.fillStyle = colorWithAlpha(dangerColor, 0.65);
            ctx.fillRect(promptX + 4, promptY + 4, Math.max(0, promptW - 8), 3);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;

            ctx.font = `bold 18px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = dangerColor;
            ctx.shadowBlur = glowEnabled ? 8 : 0;
            ctx.fillText('PRESS [SPACE] TO RETRY', centerX, promptY + promptH / 2 + 1);
            ctx.shadowBlur = 0;
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 0;
        }

        function drawVictoryScreen(now) {
            const summary = lastRunSummary || {};
            ctx.save();
            const wash = ctx.createRadialGradient(width / 2, height * 0.44, 30, width / 2, height / 2, Math.max(width, height) * 0.7);
            wash.addColorStop(0, 'rgba(255,255,255,0.08)');
            wash.addColorStop(0.42, 'rgba(106,168,255,0.08)');
            wash.addColorStop(1, 'rgba(0,0,0,0.12)');
            fillBossCameraOverscan(wash);

            const pulse = 0.72 + Math.sin(now * 0.002) * 0.18;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 58px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffe680';
            ctx.shadowBlur = glowEnabled ? 18 + pulse * 16 : 0;
            ctx.fillText('RUN COMPLETE', width / 2, height * 0.38);
            ctx.shadowBlur = 0;
            ctx.font = `bold 18px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffe680';
            ctx.fillText((summary.galaxyName || getGalaxyDefinition(currentGalaxyIndex).title || 'GALAXY').toUpperCase(), width / 2, height * 0.45);
            ctx.font = `14px 'Electrolize', sans-serif`;
            ctx.fillStyle = 'rgba(220,236,255,0.78)';
            ctx.fillText('FINAL TELEMETRY DOWNLINKING', width / 2, height * 0.51);
            ctx.font = `12px 'Electrolize', sans-serif`;
            ctx.fillStyle = 'rgba(220,236,255,0.56)';
            ctx.fillText('ENTER / SPACE TO SKIP', width / 2, height * 0.73);
            ctx.restore();
        }

        function drawFinalBuildTable(summary, x, y, selectedIndex) {
            const weapons = summary.weapons || [];
            const slotCount = Math.max(10, Math.min(15, Math.max(weapons.length, 10)));
            const cols = 5;
            const cell = 48;
            const gap = 9;
            const tableW = cols * cell + (cols - 1) * gap;
            const rows = Math.ceil(slotCount / cols);
            const tableH = rows * cell + (rows - 1) * gap;
            const panelX = x - 15;
            const panelY = y - 38;
            const panelW = tableW + 30;
            const panelH = tableH + 56;
            drawPauseHudPanel(panelX, panelY, panelW, panelH, currentThemeColor, true, {
                fillAlpha: 0.76,
                borderAlpha: 0.58,
                rail: true,
                edgeWashAlpha: 0.006,
                innerSheenAlpha: 0.002,
                flatFill: true
            });

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            drawPauseGlowText('FINAL BUILD', x + tableW / 2, y - 20, `bold 13px 'Electrolize', sans-serif`, '#dcecff', true);

            for (let i = 0; i < slotCount; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const cx = x + col * (cell + gap);
                const cy = y + row * (cell + gap);
                const weapon = weapons[i];
                const isSelected = i === selectedIndex && !!weapon;
                ctx.fillStyle = weapon ? 'rgba(210,235,255,0.09)' : 'rgba(210,235,255,0.08)';
                ctx.fillRect(cx, cy, cell, cell);
                ctx.strokeStyle = isSelected
                    ? mixColor(weapon.color, '#ffffff', 0.22)
                    : colorWithAlpha(currentThemeColor, weapon ? 0.28 : 0.16);
                ctx.lineWidth = isSelected ? 2.5 : 1;
                if (isSelected && glowEnabled) {
                    ctx.shadowColor = weapon.color;
                    ctx.shadowBlur = 14;
                }
                ctx.strokeRect(cx, cy, cell, cell);
                ctx.shadowBlur = 0;
                if (weapon) {
                    ctx.fillStyle = weapon.color;
                    if (glowEnabled) {
                        ctx.shadowColor = weapon.color;
                        ctx.shadowBlur = isSelected ? 14 : 7;
                    }
                    drawPowerupIcon(weapon, cx + cell / 2, cy + cell / 2 + 1, isSelected ? 31 : 28, isSelected);
                    ctx.shadowBlur = 0;
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.14)';
                    ctx.font = `bold 20px Courier New`;
                    ctx.fillText('.', cx + cell / 2, cy + cell / 2);
                }
            }
            ctx.restore();
            return { panelX, panelY, panelW, panelH, tableW, tableH };
        }

        function drawRunScoreScreen(now) {
            const summary = lastRunSummary || captureRunSummary();
            const weapons = summary.weapons || [];
            if (weapons.length > 0) {
                runScoreBuildSelection = Math.max(0, Math.min(weapons.length - 1, runScoreBuildSelection));
            } else {
                runScoreBuildSelection = 0;
            }

            ctx.save();
            const overlay = ctx.createLinearGradient(0, 0, 0, height);
            overlay.addColorStop(0, 'rgba(3, 8, 18, 0.38)');
            overlay.addColorStop(0.55, 'rgba(6, 14, 30, 0.62)');
            overlay.addColorStop(1, 'rgba(2, 5, 12, 0.74)');
            fillBossCameraOverscan(overlay);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 34px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffe680';
            ctx.shadowBlur = glowEnabled ? 16 : 0;
            ctx.fillText('FINAL SCORE', width / 2, height * 0.08);
            ctx.shadowBlur = 0;
            ctx.font = `bold 22px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffe680';
            ctx.fillText(String(summary.score || 0).padStart(6, '0'), width / 2, height * 0.125);

            const leftX = width * 0.09;
            const topY = height * 0.20;
            const statRows = [
                ['GALAXY', summary.galaxyName || 'BINARY QUASAR'],
                ['SHIP', summary.selectedShip || getSelectedShipConfig().name],
                ['LEVEL', String(summary.level || player.level || 1)],
                ['TIME', formatRunDuration(summary.timeSurvived || 0)],
                ['ENEMIES', String(summary.enemiesKilled || 0)],
                ['BOSSES', String(summary.bossesDefeated || 0)],
                ['DAMAGE TAKEN', String(summary.damageTaken || 0)],
                ['BOMBS USED', String(summary.bombsUsed || 0)],
                ['HIGHEST COMBO', String(summary.highestCombo || 0)],
                ['FOCUS DRIVE', formatRunDuration(summary.focusDriveTime || 0)],
                ['SPECTER', formatRunDuration(summary.specterTime || 0)],
                ['MAX HP', String(summary.maxHp || player.maxHp || 0)]
            ];

            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            const panelW = 330;
            const panelH = 348;
            drawPauseHudPanel(leftX - 24, topY - 28, panelW, panelH, currentThemeColor, true, {
                fillAlpha: 0.72,
                borderAlpha: 0.5,
                rail: true,
                edgeWashAlpha: 0.005,
                innerSheenAlpha: 0.002,
                flatFill: true
            });
            ctx.font = `bold 13px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#dcecff';
            ctx.fillText('RUN TELEMETRY', leftX, topY - 7);
            for (let i = 0; i < statRows.length; i++) {
                const y = topY + 26 + i * 24;
                ctx.font = `bold 11px 'Electrolize', sans-serif`;
                ctx.fillStyle = 'rgba(162,183,208,0.72)';
                ctx.fillText(statRows[i][0], leftX, y);
                ctx.font = `bold 13px 'Electrolize', sans-serif`;
                ctx.fillStyle = i === 0 ? '#ffe680' : '#ffffff';
                ctx.fillText(statRows[i][1], leftX + 150, y);
            }

            const buildX = width * 0.52;
            const buildY = height * 0.24;
            const buildLayout = drawFinalBuildTable(summary, buildX, buildY, runScoreBuildSelection);
            const selectedWeapon = weapons[runScoreBuildSelection];
            if (selectedWeapon) {
                const detailY = buildLayout.panelY + buildLayout.panelH + 16;
                drawPausePowerupDetail(selectedWeapon, buildX, detailY, buildLayout.tableW);
            } else {
                ctx.textAlign = 'center';
                ctx.font = `bold 14px 'Electrolize', sans-serif`;
                ctx.fillStyle = 'rgba(220,236,255,0.62)';
                ctx.fillText('NO WEAPON POWERUPS INSTALLED', buildX + buildLayout.tableW / 2, buildLayout.panelY + buildLayout.panelH + 42);
            }

            ctx.textAlign = 'center';
            ctx.font = `12px 'Electrolize', sans-serif`;
            ctx.fillStyle = 'rgba(220,236,255,0.58)';
            ctx.fillText('ARROWS INSPECT BUILD    ENTER / SPACE CONTINUE', width / 2, height * 0.94);
            ctx.restore();
        }

        function drawRunCompleteTransitionOverlay(now) {
            const fade = typeof getRunCompleteFadeAmount === 'function' ? getRunCompleteFadeAmount() : 0;
            const slowmo = typeof getRunCompleteSlowmoAmount === 'function' ? getRunCompleteSlowmoAmount() : 0;
            if (fade <= 0.01 && slowmo <= 0.01) return;

            const accent = (runCompleteTransition && runCompleteTransition.color) || currentThemeColor;
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            const backdrop = getBossCameraOverscanRect();
            if (slowmo > 0.01) {
                ctx.globalAlpha = 0.035 * slowmo;
                ctx.fillStyle = accent;
                ctx.fillRect(backdrop.x, backdrop.y, backdrop.w, backdrop.h);
                ctx.globalAlpha = 0.08 * slowmo;
                ctx.strokeStyle = colorWithAlpha('#ffffff', 0.55);
                ctx.lineWidth = 1;
                const spacing = 54;
                const yStart = backdrop.y + ((now * 0.018) % spacing) - spacing;
                for (let y = yStart; y < backdrop.y + backdrop.h + spacing; y += spacing) {
                    const wobbleX = Math.sin(now * 0.0022 + y * 0.025) * 18 * slowmo;
                    ctx.beginPath();
                    ctx.moveTo(backdrop.x - 20, y);
                    ctx.lineTo(backdrop.x + backdrop.w * 0.32 + wobbleX, y + 3);
                    ctx.lineTo(backdrop.x + backdrop.w * 0.68 - wobbleX, y - 3);
                    ctx.lineTo(backdrop.x + backdrop.w + 20, y);
                    ctx.stroke();
                }
            }

            if (fade > 0.01) {
                const overlay = ctx.createRadialGradient(width / 2, height * 0.45, 40, width / 2, height / 2, Math.max(width, height) * 0.74);
                overlay.addColorStop(0, colorWithAlpha(accent, 0.10 * fade));
                overlay.addColorStop(0.38, colorWithAlpha('#08142a', 0.48 * fade));
                overlay.addColorStop(1, colorWithAlpha('#01040b', 0.94 * fade));
                ctx.globalAlpha = 1;
                ctx.fillStyle = overlay;
                ctx.fillRect(backdrop.x, backdrop.y, backdrop.w, backdrop.h);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `bold 15px 'Electrolize', sans-serif`;
                ctx.fillStyle = colorWithAlpha('#dcecff', Math.min(0.92, fade * 1.25));
                ctx.shadowColor = accent;
                ctx.shadowBlur = glowEnabled ? 12 * fade : 0;
                ctx.fillText('FINAL TELEMETRY DOWNLINKING', width / 2, height * 0.52);
                ctx.shadowBlur = 0;
            }
            ctx.restore();
            ctx.globalAlpha = 1;
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

        const BOSS_CAMERA_ZOOM_SCALE = 0.90;
        const BOSS_CAMERA_ZOOM_IN_RATE = 0.88;
        const BOSS_CAMERA_ZOOM_OUT_RATE = 1.35;
        let bossCameraZoomScale = 1;

        function updateBossCameraZoom(dt) {
            const safeDt = Math.max(0, Math.min(0.05, dt || 0));
            const canShowBossCamera = gameState !== 'START'
                && gameState !== 'LAUNCHING'
                && gameState !== 'SHIP_SELECT'
                && gameState !== 'RETURN_LOADING'
                && gameState !== 'GALAXY_SELECT'
                && gameState !== 'GALAXY_MUSIC_PLAYER'
                && gameState !== 'GALAXY_WARP'
                && gameState !== 'VICTORY'
                && gameState !== 'RUN_SCORE'
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

        function campaignControlEaseOutCubic(t) {
            const clamped = Math.max(0, Math.min(1, t || 0));
            return 1 - Math.pow(1 - clamped, 3);
        }

        function getCampaignControlDecal() {
            if (typeof campaignControlDecal === 'undefined') return null;
            if (!campaignControlDecal) {
                const playfieldH = Math.max(1, height - HUD_HEIGHT);
                campaignControlDecal = {
                    x: width / 2,
                    y: Math.max(96, Math.min(playfieldH - 56, playfieldH * 0.78)),
                    seed: (typeof WaveManager !== 'undefined' && Number.isFinite(WaveManager.activeGalaxyIndex) ? WaveManager.activeGalaxyIndex : currentGalaxyIndex || 0) * 811 + 193
                };
            }
            return campaignControlDecal;
        }

        function drawCampaignControlPairDecal(pair, x, y, alpha, fontSize) {
            const keyFont = `bold ${fontSize}px 'Electrolize', sans-serif`;
            const actionFont = `bold ${Math.max(9, fontSize - 1)}px 'Electrolize', sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';

            ctx.font = keyFont;
            const keyPadX = Math.round(fontSize * 0.58);
            const keyW = Math.ceil(ctx.measureText(pair.key).width + keyPadX * 2);
            const keyH = Math.max(19, Math.round(fontSize * 1.66));
            const keyY = y - keyH / 2;
            ctx.globalAlpha = alpha * 0.20;
            ctx.fillStyle = colorWithAlpha('#071326', 0.82);
            ctx.fillRect(x, keyY, keyW, keyH);
            ctx.globalAlpha = alpha * 0.40;
            ctx.strokeStyle = colorWithAlpha(pair.color || '#8ff7ff', 0.84);
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, keyY + 0.5, keyW, keyH);

            ctx.globalAlpha = alpha * 0.88;
            ctx.fillStyle = '#f2fbff';
            if (glowEnabled) {
                ctx.shadowColor = pair.color || '#8ff7ff';
                ctx.shadowBlur = 4 * alpha;
            }
            ctx.fillText(pair.key, x + keyPadX, y + 1);
            ctx.shadowBlur = 0;

            const actionX = x + keyW + Math.round(fontSize * 0.52);
            ctx.font = actionFont;
            ctx.globalAlpha = alpha * 0.74;
            ctx.fillStyle = pair.color || '#8ff7ff';
            ctx.fillText(pair.action, actionX, y + 1);
            ctx.globalAlpha = 1;
            return actionX + ctx.measureText(pair.action).width - x;
        }

        function drawCampaignControlDecal(renderNow) {
            if (gameState !== 'PLAYING') return;
            if (typeof campaignControlDecalTimer === 'undefined' || typeof CAMPAIGN_CONTROL_DECAL_DURATION === 'undefined') return;
            if (typeof isSurvivorModeActive === 'function' && isSurvivorModeActive()) return;
            if (typeof isMatrixCrawlerModeActive === 'function' && isMatrixCrawlerModeActive()) return;
            const timer = campaignControlDecalTimer || 0;
            if (timer <= 0.01) return;
            const decal = getCampaignControlDecal();
            if (!decal) return;

            const life = Math.max(0, Math.min(1, timer / CAMPAIGN_CONTROL_DECAL_DURATION));
            const age = CAMPAIGN_CONTROL_DECAL_DURATION - timer;
            const introAlpha = campaignControlEaseOutCubic(Math.max(0, Math.min(1, age / 0.72)));
            const fadeAlpha = life > 0.52 ? 1 : campaignControlEaseOutCubic(Math.max(0, Math.min(1, life / 0.52)));
            const fizzle = 1 - Math.max(0, Math.min(1, life / 0.58));
            const baseAlpha = 0.66 * introAlpha * fadeAlpha;
            if (baseAlpha <= 0.01) return;

            const driftX = Math.sin(renderNow * 0.00036 + decal.seed) * 4;
            const driftY = Math.sin(renderNow * 0.00029 + decal.seed * 0.71) * 2;
            const x = decal.x + driftX;
            const y = decal.y + driftY;
            const pairs = [
                { key: 'WASD', action: 'MOVE', color: '#8ff7ff' },
                { key: 'UP/L/R', action: 'FIRE', color: '#9fb8ff' },
                { key: 'DOWN', action: 'SHRINK', color: '#9fe8ff' },
                { key: 'SPACE', action: 'BOMB', color: '#ffe66d' },
                { key: 'SHIFT', action: 'FOCUS', color: '#ff8fd8' }
            ];

            ctx.save();
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            const maxW = Math.min(width * 0.88, 850);
            let fontSize = width < 900 ? 10 : 12;
            let gap = Math.round(fontSize * 0.95);
            const sep = '::';
            const measurePair = (pair) => {
                ctx.font = `bold ${fontSize}px 'Electrolize', sans-serif`;
                const keyW = ctx.measureText(pair.key).width + Math.round(fontSize * 0.58) * 2;
                ctx.font = `bold ${Math.max(9, fontSize - 1)}px 'Electrolize', sans-serif`;
                return keyW + Math.round(fontSize * 0.52) + ctx.measureText(pair.action).width;
            };
            let totalW = 0;
            for (let i = 0; i < pairs.length; i++) {
                totalW += measurePair(pairs[i]);
                if (i < pairs.length - 1) {
                    ctx.font = `bold ${fontSize}px Courier New`;
                    totalW += gap * 2 + ctx.measureText(sep).width;
                }
            }
            if (totalW > maxW) {
                fontSize = Math.max(9, Math.floor(fontSize * maxW / totalW));
                gap = Math.round(fontSize * 0.95);
                totalW = 0;
                for (let i = 0; i < pairs.length; i++) {
                    totalW += measurePair(pairs[i]);
                    if (i < pairs.length - 1) {
                        ctx.font = `bold ${fontSize}px Courier New`;
                        totalW += gap * 2 + ctx.measureText(sep).width;
                    }
                }
            }

            const panelH = Math.max(28, Math.round(fontSize * 2.18));
            const panelX = x - totalW / 2 - 16;
            const panelY = y - panelH / 2;
            const panelW = totalW + 32;
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = baseAlpha * 0.13;
            ctx.fillStyle = '#020712';
            ctx.fillRect(panelX, panelY, panelW, panelH);
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = baseAlpha * 0.18;
            ctx.strokeStyle = colorWithAlpha('#8ff7ff', 0.52);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(panelX + 8, panelY + 3);
            ctx.lineTo(panelX + panelW - 8, panelY + 3);
            ctx.moveTo(panelX + 8, panelY + panelH - 3);
            ctx.lineTo(panelX + panelW - 8, panelY + panelH - 3);
            ctx.stroke();

            let cursorX = x - totalW / 2;
            for (let i = 0; i < pairs.length; i++) {
                const pairW = drawCampaignControlPairDecal(pairs[i], cursorX, y, baseAlpha, fontSize);
                cursorX += pairW;
                if (i < pairs.length - 1) {
                    cursorX += gap;
                    ctx.font = `bold ${fontSize}px Courier New`;
                    ctx.globalAlpha = baseAlpha * 0.42;
                    ctx.fillStyle = colorWithAlpha('#9fb8ff', 0.76);
                    ctx.fillText(sep, cursorX, y + 1);
                    cursorX += ctx.measureText(sep).width + gap;
                }
            }

            if (fizzle > 0.02) {
                const glyphs = ['.', '+', "'", ':'];
                ctx.font = `bold ${Math.max(7, fontSize - 4)}px Courier New`;
                for (let i = 0; i < 14; i++) {
                    const n1 = Math.sin(decal.seed + i * 17.31) * 43758.5453;
                    const n2 = Math.sin(decal.seed + i * 23.77 + 9.2) * 33731.331;
                    const n3 = Math.sin(decal.seed + i * 31.11 + 2.4) * 27181.13;
                    const a = n1 - Math.floor(n1);
                    const b = n2 - Math.floor(n2);
                    const c = n3 - Math.floor(n3);
                    const drift = fizzle * (6 + c * 20);
                    const px = panelX + a * panelW + Math.sin(renderNow * 0.0017 + i) * drift;
                    const py = panelY + b * panelH - fizzle * (4 + a * 16);
                    ctx.globalAlpha = baseAlpha * fizzle * (0.08 + c * 0.16);
                    ctx.fillStyle = c > 0.72 ? '#ffffff' : '#8ff7ff';
                    ctx.fillText(glyphs[i % glyphs.length], px, py);
                }
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
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
            const renderNow = currentFrameNow;
            if (typeof resetGlowBudgetForFrame === 'function') {
                resetGlowBudgetForFrame(renderNow);
            }
            if (
                typeof musicPlayerFullscreen !== 'undefined'
                && musicPlayerFullscreen
                && typeof drawMusicPlayerFullscreen === 'function'
                && drawMusicPlayerFullscreen(renderNow, dt)
            ) {
                return;
            }
            if (gameState === BENCHMARK_GAME_STATE) {
                updateGraphicsBenchmarkMode(dt, renderNow);
                drawGraphicsBenchmarkScreen(renderNow, dt);
                return;
            }
            const galaxySelectSceneCoversField = gameState === 'GALAXY_SELECT'
                || gameState === 'GALAXY_MUSIC_PLAYER'
                || (gameState === 'PAUSED' && pauseReturnState === 'GALAXY_SELECT');
            const survivorModeVisual = typeof isSurvivorModeActive === 'function' && isSurvivorModeActive();

            if (!galaxySelectSceneCoversField) {
                ctx.fillStyle = currentBgColor;
                ctx.fillRect(0, 0, width | 0, height | 0);
                ctx.fillStyle = currentFieldBgColor;
                ctx.fillRect(0, 0, width | 0, height | 0);
            }
            const allowScreenShake = gameState !== 'PAUSED' && gameState !== 'LEVELUP' && gameState !== 'GAMEOVER';
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
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            if (!galaxySelectSceneCoversField) {
                // Background starfield
                let lastFieldFont = '';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const backgroundQuality = typeof getVisualQualityScale === 'function' ? getVisualQualityScale('background') : 1;
                let fieldStep = survivorModeVisual ? 2 : 1;
                if (backgroundQuality < 0.85) {
                    fieldStep = Math.max(fieldStep, survivorModeVisual ? 3 : 2);
                } else if (backgroundQuality > 1.05 && survivorModeVisual) {
                    fieldStep = 1;
                }
                const fieldWrapH = height + CELL_SIZE * 2;
                const fieldOverscanY = bossCameraActive
                    ? Math.ceil((1 / Math.max(0.5, bossCameraScale) - 1) * (height - HUD_HEIGHT) * 0.58) + CELL_SIZE * 2
                    : CELL_SIZE;
                const fieldMinY = -fieldOverscanY;
                const fieldMaxY = height + fieldOverscanY;
                for (let i = 0; i < numParticles; i += fieldStep) {
                    if (fpY[i] < fieldMinY || fpY[i] > fieldMaxY) continue;
                    const char = PARTICLE_CHARS[fpChar[i]];
                    const depth = fpDepth ? fpDepth[i] || 1 : 1;
                    const highlight = fpHighlight[i] || 0;
                    const twinkle = 0.82 + Math.max(0, Math.sin(renderNow * FIELD_TWINKLE_SPEED + (fpTwinkle ? fpTwinkle[i] : 0))) * 0.18;
                    const baseAlpha = (fpAlpha[i] || 0.24) * twinkle * (char === '\u2591' ? 0.72 : 1) * (survivorModeVisual ? 0.56 : 1);
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
                    if (glowEnabled && highlight > 0.32 && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('low'))) {
                        ctx.shadowColor = ctx.fillStyle;
                        ctx.shadowBlur = 3 + highlight * 7;
                    } else {
                        ctx.shadowBlur = 0;
                    }
                    ctx.fillText(char, particleX, particleY);
                    if (bossCameraActive) {
                        const wrapY = particleY > height * 0.5 ? particleY - fieldWrapH : particleY + fieldWrapH;
                        if (wrapY >= fieldMinY && wrapY <= fieldMaxY) {
                            ctx.fillText(char, particleX, truncateSpriteCoord(wrapY));
                        }
                    }
                }
                ctx.globalAlpha = 1.0;
                ctx.shadowBlur = 0;
                drawCampaignControlDecal(renderNow);
                drawFocusTimeWarpOverlay(renderNow, false);
            }

            if (gameState === 'PAUSED' && pauseReturnState === 'GALAXY_SELECT') {
                drawGalaxySelectScreen(renderNow, false);
            } else if (gameState === 'PAUSED' && pauseReturnState === 'MATRIX_CRAWLER') {
                if (typeof drawMatrixCrawler === 'function') drawMatrixCrawler(renderNow);
            } else if (gameState === 'GALAXY_SELECT') {
                drawGalaxySelectScreen(renderNow);
            } else if (gameState === 'GALAXY_MUSIC_PLAYER') {
                if (typeof drawGalaxyMusicPlayerTransition === 'function') drawGalaxyMusicPlayerTransition(renderNow);
                else drawGalaxySelectScreen(renderNow, false);
            } else if (gameState === 'RETURN_LOADING') {
                drawReturnLoadingScreen(renderNow);
            } else if (gameState === 'GALAXY_WARP') {
                drawGalaxyWarpTransition(renderNow);
            } else if (gameState === 'TERMINAL_DOCK') {
                drawTerminalDockTransition(renderNow);
            } else if (gameState === 'MATRIX_CRAWLER') {
                if (typeof drawMatrixCrawler === 'function') drawMatrixCrawler(renderNow);
            } else if (gameState === 'DYING' && typeof isMatrixCrawlerModeActive === 'function' && isMatrixCrawlerModeActive()) {
                if (typeof drawMatrixCrawler === 'function') drawMatrixCrawler(renderNow);
            } else if (typeof isFractalGravityModeActive === 'function' && isFractalGravityModeActive() && typeof drawFractalGravityRuntime === 'function') {
                drawFractalGravityRuntime(renderNow, dt);
            } else if (typeof isBitshiftScrollerModeActive === 'function' && isBitshiftScrollerModeActive() && typeof drawBitshiftScrollerRuntime === 'function') {
                drawBitshiftScrollerRuntime(renderNow, dt);
            } else if (gameState === 'START' || gameState === 'LAUNCHING' || gameState === 'SHIP_SELECT') {
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
                    ctx.fillText('WASD Move | UP/LEFT/RIGHT Fire | SPACE Bomb | SHIFT Focus | DOWN Shrink', (width/2) | 0, (height*0.7) | 0);
                    ctx.globalAlpha = 1.0;
                }

                if (gameState === 'LAUNCHING') {
                    const pulseVisuals = getPlayerPulseVisuals(renderNow);
                    player.color = pulseVisuals.color;

                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = player.color;
                    ctx.shadowColor = currentThemeColor;
                    ctx.shadowBlur = pulseVisuals.glow;
                    if (typeof drawCheapGlowDot === 'function') {
                        drawCheapGlowDot(ctx, player.x, player.y, 24, currentThemeColor, {
                            alpha: 0.08,
                            core: false
                        });
                    }
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
            } else if (gameState === 'VICTORY') {
                drawVictoryScreen(renderNow);
            } else if (gameState === 'RUN_SCORE') {
                drawRunScoreScreen(renderNow);
            } else if (gameState === 'GAMEOVER') {
                drawGameOverScreen(renderNow);
            } else if (survivorModeVisual && typeof drawSurvivorMode === 'function') {
                drawSurvivorMode(renderNow, dt);
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
                            const focusDropGlow = typeof getLiveGlowBlur === 'function'
                                ? getLiveGlowBlur(10 + pulse * 8, 'high', 1, 0.38)
                                : (glowEnabled ? 10 + pulse * 8 : 0);
                            if (focusDropGlow > 0) {
                                ctx.shadowColor = d.coreColor || '#ffd35a';
                                ctx.shadowBlur = focusDropGlow;
                            } else if (typeof drawCheapGlowDot === 'function') {
                                drawCheapGlowDot(ctx, d.x, d.y, boxSize * 0.72, d.coreColor || '#ffd35a', {
                                    alpha: 0.12,
                                    maxRadius: 24,
                                    coreAlpha: 0.35
                                });
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
                        const bossClearGlow = typeof getLiveGlowBlur === 'function'
                            ? getLiveGlowBlur(18 * alpha + 8 * pop, 'high', 1, 0.38)
                            : (glowEnabled && b.bossClearGlow !== false ? 18 * alpha + 8 * pop : 0);
                        if (bossClearGlow > 0 && b.bossClearGlow !== false) {
                            ctx.shadowColor = '#ffffff';
                            ctx.shadowBlur = bossClearGlow;
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
                    if (b.isDissolvingProjectile && typeof drawProjectileDissolveGlyph === 'function') {
                        const dissolveSize = b.isHuge
                            ? 78
                            : (b.isSignalYBullet ? 44 : (b.isPhantomBullet ? 35 : (b.isVoidProjectile ? (b.voidBulletSize || 24) : 22)));
                        drawProjectileDissolveGlyph(b, renderNow, {
                            fontSize: dissolveSize,
                            char: b.dissolveChar || b.char || 'o',
                            color: b.dissolveColor || b.color || bulletColor || '#ffffff',
                            angle: b.isCodeLine ? getProjectileRenderAngle(b) : null,
                            alphaScale: 0.9,
                            glow: b.isHuge ? 18 : 10
                        });
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
                        if (b.isGlitchBullet && glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('normal'))) {
                            ctx.shadowColor = '#00ff41';
                            ctx.shadowBlur = 25;
                        } else {
                            ctx.shadowBlur = 0;
                        }
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
                    } else if (b.isLargeWraith || b.isWraithBolt) {
                        bulletColor = getWraithBulletColor(b, renderNow);
                    }
                    if (b.isCodeLine) {
                        ctx.fillStyle = '#00ff41';
                        ctx.font = `bold 14px Courier New`;
                        if (glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('low'))) {
                            ctx.shadowColor = '#00ff41';
                            ctx.shadowBlur = 20 + Math.random() * 10;
                        } else {
                            ctx.shadowBlur = 0;
                        }
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
                    if (b.isGlitchBullet && glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('normal'))) {
                        ctx.shadowColor = '#00ff41';
                        ctx.shadowBlur = 18 + Math.random() * 8;
                    } else if (b.isLargeWraith && glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('normal'))) {
                        const wraithGlowPulse = getWraithBulletBreath(b, renderNow);
                        ctx.shadowColor = '#c8ffff';
                        ctx.shadowBlur = 6 + wraithGlowPulse * 8;
                    } else if (b.isWraithBolt && glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('normal'))) {
                        ctx.shadowColor = '#f4f7fb';
                        ctx.shadowBlur = 5 + getWraithBulletBreath(b, renderNow) * 7;
                    } else if (b.isVoidProjectile && glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('high'))) {
                        ctx.shadowColor = b.color;
                        ctx.shadowBlur = 18;
                    } else if (b.isFlyByBullet && glowEnabled && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('normal'))) {
                        ctx.shadowColor = b.color;
                        ctx.shadowBlur = 14;
                    } else {
                        ctx.shadowBlur = 0;
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
                    if (b.isGlitchBullet || b.isLargeWraith || b.isWraithBolt || b.isFlyByBullet || b.isVoidProjectile) { ctx.shadowBlur = 0; }
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
                    } else if (e.isFlameGuardian && drawFirewallGuardianSpriteFast(e, flashColor, renderNow)) {
                        // Fast path uses cached flame cells and shape-halo glow.
                    } else if (e.isWraith && drawWraithSpriteFast(e, flashColor)) {
                        // Fast path uses cached glyph colors and a cheap duplicate-shape halo.
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

                        const firewallCells = typeof FIREWALL_VISIBLE_CELLS !== 'undefined'
                            ? FIREWALL_VISIBLE_CELLS
                            : [];
                        if (glowEnabled && firewallHasColor) {
                            const localW = fireLines[0].length * charW;
                            const localH = fireLines.length * charH;
                            const haloY = bSY + localH * 0.52;
                            const haloRadius = Math.max(localW, localH) * (firewallStageTwo ? 0.62 : 0.56);
                            ctx.save();
                            ctx.globalCompositeOperation = 'screen';
                            const coreHalo = ctx.createRadialGradient(0, haloY, 0, 0, haloY, haloRadius);
                            coreHalo.addColorStop(0, colorWithAlpha(firewallStageTwo ? '#fff2a8' : '#ff8a18', firewallStageTwo ? 0.18 : 0.14));
                            coreHalo.addColorStop(0.44, colorWithAlpha('#ff4400', firewallStageTwo ? 0.095 : 0.075));
                            coreHalo.addColorStop(1, colorWithAlpha('#e01926', 0));
                            ctx.fillStyle = coreHalo;
                            ctx.fillRect((-haloRadius) | 0, (haloY - haloRadius) | 0, (haloRadius * 2) | 0, (haloRadius * 2) | 0);
                            ctx.restore();
                        }

                        let lastFirewallRow = -1;
                        let hRatio = 0;
                        const firewallBandCount = 12;
                        const firewallNoiseCache = new Map();
                        let lastFirewallFill = null;
                        ctx.shadowBlur = 0;
                        for (const cell of firewallCells) {
                            const r = cell.row;
                            const c = cell.col;
                            const char = cell.char;
                            if (r !== lastFirewallRow) {
                                hRatio = r / fireLines.length;
                                lastFirewallRow = r;
                            }

                            const rowLength = fireLines[r] ? fireLines[r].length : fireLines[0].length;
                            const colRatio = c / Math.max(1, rowLength - 1);
                            const band = Math.max(0, Math.min(firewallBandCount, Math.round(colRatio * firewallBandCount)));
                            const cacheKey = `${r}|${band}`;
                            let noise = firewallNoiseCache.get(cacheKey);
                            if (noise === undefined) {
                                const sampleC = (band / firewallBandCount) * Math.max(1, rowLength - 1);
                                noise = Math.sin(2 * tAngle - r * 0.5 + sampleC * 0.3) * 0.6 +
                                    Math.cos(3 * tAngle - r * 0.3 + sampleC * 0.2) * 0.6;
                                firewallNoiseCache.set(cacheKey, noise);
                            }

                            if (boss.flashTimer > 0) {
                                if (lastFirewallFill !== '#ffffff') {
                                    ctx.fillStyle = '#ffffff';
                                    lastFirewallFill = '#ffffff';
                                }
                            } else if (!firewallHasColor) {
                                if (lastFirewallFill !== boss.color) {
                                    ctx.fillStyle = boss.color;
                                    lastFirewallFill = boss.color;
                                }
                            } else {
                                const flickerHeat = hRatio + (noise * (firewallStageTwo ? 0.2 : 0.15)) + (firewallStageTwo ? 0.08 : 0);
                                let fillColor;
                                if (firewallStageTwo && flickerHeat > 0.88) {
                                    fillColor = '#fff2a8';
                                } else if (flickerHeat > 0.75) {
                                    fillColor = '#ffaa00';
                                } else if (flickerHeat > 0.45) {
                                    fillColor = '#ff4400';
                                } else {
                                    fillColor = firewallStageTwo ? '#e01926' : '#cc0000';
                                }
                                if (fillColor !== lastFirewallFill) {
                                    ctx.fillStyle = fillColor;
                                    lastFirewallFill = fillColor;
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
                                const coreColor = firewallStageTwo ? '#fff2a8' : '#00ffff';
                                if (glowEnabled) {
                                    const coreHalo = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, 64);
                                    coreHalo.addColorStop(0, colorWithAlpha(coreColor, 0.36));
                                    coreHalo.addColorStop(0.42, colorWithAlpha(coreColor, 0.12));
                                    coreHalo.addColorStop(1, colorWithAlpha(coreColor, 0));
                                    ctx.save();
                                    ctx.globalCompositeOperation = 'screen';
                                    ctx.fillStyle = coreHalo;
                                    ctx.fillRect((coreX - 64) | 0, (coreY - 64) | 0, 128, 128);
                                    ctx.restore();
                                }
                                ctx.fillStyle = coreColor;
                                ctx.shadowColor = coreColor;
                                ctx.shadowBlur = glowEnabled ? 10 : 0;
                                ctx.fillText('◈', coreX, coreY);
                                ctx.shadowBlur = 0;
                            } else {
                                const coreColor = firewallStageTwo ? '#ff6a18' : '#ff0000';
                                if (glowEnabled) {
                                    const coreHalo = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, 58);
                                    coreHalo.addColorStop(0, colorWithAlpha(coreColor, 0.3));
                                    coreHalo.addColorStop(0.48, colorWithAlpha('#e01926', 0.1));
                                    coreHalo.addColorStop(1, colorWithAlpha('#e01926', 0));
                                    ctx.save();
                                    ctx.globalCompositeOperation = 'screen';
                                    ctx.fillStyle = coreHalo;
                                    ctx.fillRect((coreX - 58) | 0, (coreY - 58) | 0, 116, 116);
                                    ctx.restore();
                                }
                                ctx.fillStyle = coreColor;
                                ctx.shadowColor = coreColor;
                                ctx.shadowBlur = glowEnabled ? 9 : 0;
                                ctx.fillText('◈', coreX, coreY);
                                ctx.shadowBlur = 0;
                            }
                            recordBossRenderGlyph(bossRenderEntries, '@', coreX, coreY, ctx.fillStyle, BOSS_CINEMATIC_FIREWALL_CORE_SCALE);
                            
                            drawBossHealthBar(boss, {
                                color: firewallStageTwo ? '#ffdd66' : '#ff6600',
                                labelColor: boss.color
                            });
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

                        const phantomCells = typeof NULL_PHANTOM_VISIBLE_CELLS !== 'undefined' ? NULL_PHANTOM_VISIBLE_CELLS : null;
                        if (phantomCells) {
                            for (const cell of phantomCells) {
                                const glyphPos = getNullPhantomGlyphPosition(layout, cell.row, cell.col);
                                const bodyColor = bodyFlash ? '#ffffff' : getNullPhantomBodyColor(cell.char, 1, isIntro);
                                ctx.fillStyle = bodyColor;
                                ctx.fillText(cell.char, glyphPos.x | 0, glyphPos.y | 0);
                                recordBossRenderGlyph(
                                    bossRenderEntries,
                                    cell.char,
                                    glyphPos.x | 0,
                                    glyphPos.y | 0,
                                    bodyColor,
                                    layout.cubeScale
                                );
                            }
                        } else {
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
                        }
                        ctx.restore();

                        if (boss.phase === 'ACTIVE') {
                            drawBossHealthBar(boss, {
                                color: '#ff4fd8',
                                labelColor: '#ffd5ff'
                            });
                        }
                    } else if (boss.name === 'GHOST SIGNAL') {
                        const layout = getGhostSignalRenderLayout(boss);
                        const bodyFlash = boss.flashTimer > 0;
                        const signalStageTwo = (boss.stage || 1) >= 2;
                        const bodyPulse = bodyFlash
                            ? 1
                            : (signalStageTwo ? 0.84 : 0.75) + Math.sin(2 * layout.tAngle - 0.22) * (signalStageTwo ? 0.16 : 0.25);

                        if (glowEnabled && boss.phase !== 'INTRO') {
                            const haloRadius = Math.max(layout.visibleW, layout.visibleH) * (signalStageTwo ? 0.72 : 0.64);
                            const halo = ctx.createRadialGradient(boss.x, boss.y, 0, boss.x, boss.y, haloRadius);
                            const haloAlpha = bodyFlash ? 0.18 : (signalStageTwo ? 0.115 : 0.085) + bodyPulse * 0.035;
                            ctx.save();
                            ctx.globalCompositeOperation = 'screen';
                            halo.addColorStop(0, colorWithAlpha('#f4fbff', haloAlpha));
                            halo.addColorStop(0.42, colorWithAlpha('#9cfbff', haloAlpha * 0.42));
                            halo.addColorStop(1, colorWithAlpha('#ffffff', 0));
                            ctx.fillStyle = halo;
                            ctx.fillRect(
                                (boss.x - haloRadius) | 0,
                                (boss.y - haloRadius) | 0,
                                (haloRadius * 2) | 0,
                                (haloRadius * 2) | 0
                            );
                            ctx.restore();
                        }

                        ctx.save();
                        ctx.font = `bold ${GHOST_SIGNAL_FONT_SIZE}px Courier New`;
                        ctx.globalAlpha = bodyFlash ? 1 : bodyPulse;
                        ctx.shadowColor = bodyFlash ? '#ffffff' : GHOST_SIGNAL_GLOW_COLOR;
                        ctx.shadowBlur = 0;

                        const signalCells = typeof GHOST_SIGNAL_VISIBLE_CELLS !== 'undefined'
                            ? GHOST_SIGNAL_VISIBLE_CELLS
                            : [];
                        let lastSignalRow = -1;
                        let rowShimmer = 1;
                        let lastSignalColor = null;
                        for (const cell of signalCells) {
                            const r = cell.row;
                            const c = cell.col;
                            const char = cell.char;
                            const glyphPos = getGhostSignalGlyphPosition(layout, r, c);
                            if (r !== lastSignalRow) {
                                rowShimmer = bodyFlash
                                    ? 1
                                    : 0.87 + Math.max(0, Math.sin(4 * layout.tAngle - r * 0.28)) * 0.13;
                                lastSignalRow = r;
                            }
                            const bodyColor = bodyFlash ? '#ffffff' : getGhostSignalBodyColor(char, rowShimmer);
                            if (bodyColor !== lastSignalColor) {
                                ctx.fillStyle = bodyColor;
                                lastSignalColor = bodyColor;
                            }
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
                        ctx.restore();

                        if (boss.phase === 'ACTIVE') {
                            drawBossHealthBar(boss, {
                                color: signalStageTwo ? '#f4fbff' : '#9cfbff',
                                labelColor: '#d8fbff'
                            });
                        }
                    } else if (boss.isTurnboundTrinity) {
                        drawTurnboundTrinityBoss(renderNow, bossRenderEntries);
                    } else if (boss.isDreadLiturgy) {
                        drawDreadLiturgyBoss(renderNow, bossRenderEntries);
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

                            drawBossHealthBar(boss, {
                                color: '#7ed4ff',
                                labelColor: '#cfe6ff'
                            });
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
                            ctx.fillStyle = '#00ff41'; ctx.font = 'bold 36px Courier New';
                            ctx.fillText("SYSTEM CORRUPTION DETECTED", width/2, height/2 - 50);
                        }

                        if (boss.phase === 'ACTIVE' && !boss.isDeadGlitching) {
                            let displayedHpRatio = boss.hp / boss.maxHp;
                            if (Math.random() < 0.011) displayedHpRatio += (Math.random() - 0.5) * 0.1;
                            displayedHpRatio = Math.max(0, Math.min(1, displayedHpRatio));

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
                            drawBossHealthBar(boss, {
                                color: boss.color,
                                labelColor: boss.color,
                                label: boss.scrambledName,
                                ratio: displayedHpRatio
                            });
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
                            drawBossHealthBar(boss, {
                                color: boss.color || '#ff0088',
                                labelColor: boss.color || '#ffffff'
                            });
                        }
                    }
                    lastBossRenderSnapshot = null;
                }
                
                ctx.globalCompositeOperation = 'lighter';

                const beamDeployFactor = getBeamDeployVisual(player.beamDeploy || 0);
                if (player.isBeaming && beamDeployFactor > 0.01 && !playerExploded && gameState === 'PLAYING' && !(typeof isSurvivorModeActive === 'function' && isSurvivorModeActive())) {
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
                    const bombGlow = typeof getLiveGlowBlur === 'function'
                        ? getLiveGlowBlur(14 + pulse * 7, 'high', 1, 0.38)
                        : (glowEnabled ? 14 + pulse * 7 : 0);
                    if (bombGlow > 0) {
                        ctx.shadowColor = shellColor;
                        ctx.shadowBlur = bombGlow;
                    } else if (typeof drawCheapGlowGlyph === 'function') {
                        drawCheapGlowGlyph(ctx, 'O', 0, 0, `bold 22px Courier New`, shellColor, {
                            alpha: 0.13,
                            echoAlpha: 0.055,
                            sizeBoost: 1.20,
                            maxFontSize: 28
                        });
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
                    if (p.isDissolvingProjectile && typeof drawProjectileDissolveGlyph === 'function') {
                        const stats = p.stats || {};
                        const dissolveSize = p.isBombShrapnel ? 22 : 24;
                        drawProjectileDissolveGlyph(p, renderNow, {
                            fontSize: dissolveSize,
                            char: p.dissolveChar || p.sprite || (stats.plasmaCloud ? '~' : (stats.lightningBall ? '*' : '|')),
                            color: p.dissolveColor || p.color || '#ffffff',
                            angle: p.isBombShrapnel ? null : getPlayerProjectileGlyphRotation(p),
                            alphaScale: 0.95,
                            glow: 9
                        });
                        continue;
                    }
                    if (p.isChainLightning) {
                        drawChainLightningProjectile(p, renderNow);
                        continue;
                    }
                    ctx.fillStyle = p.color; 
                    if (p.isBombShrapnel) {
                        ctx.font = `bold 22px Courier New`;
                        if (glowEnabled && typeof drawCachedGlowGlyph !== 'function' && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('normal'))) {
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
                        const burstFont = `bold 22px Courier New`;
                        const useCachedBurstGlow = glowEnabled
                            && typeof drawCachedGlowGlyph === 'function'
                            && (typeof shouldUseCachedGlowSprite !== 'function' || shouldUseCachedGlowSprite('normal'));
                        if (glowEnabled && !useCachedBurstGlow && (typeof shouldUseLiveShadowBlur !== 'function' || shouldUseLiveShadowBlur('normal'))) {
                            ctx.shadowColor = '#aa00ff';
                            ctx.shadowBlur = 10;
                        }
                        ctx.fillStyle = p.color;
                        ctx.font = burstFont;
                        ctx.rotate(getPlayerProjectileGlyphRotation(p));
                        ctx.scale(scale * 0.92, scale * 1.05);
                        if (useCachedBurstGlow) {
                            drawCachedGlowGlyph(ctx, '|', 0, 0, burstFont, p.color, '#aa00ff', 10);
                        } else {
                            if (typeof drawCheapGlowGlyph === 'function') {
                                drawCheapGlowGlyph(ctx, '|', 0, 0, burstFont, p.color, {
                                    alpha: 0.12,
                                    echoAlpha: 0.055,
                                    sizeBoost: 1.18,
                                    maxFontSize: 28
                                });
                            }
                            ctx.fillText('|', 0, 0);
                        }
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
                    if (p.isBombShrapnel && glowEnabled && typeof drawCachedGlowGlyph === 'function' && (typeof shouldUseCachedGlowSprite !== 'function' || shouldUseCachedGlowSprite('normal'))) {
                        drawCachedGlowGlyph(ctx, p.sprite, 0, 0, `bold 22px Courier New`, p.color, p.color, 12);
                    } else {
                        if (typeof drawCheapGlowGlyph === 'function') {
                            drawCheapGlowGlyph(ctx, p.sprite, 0, 0, ctx.font, p.color, {
                                alpha: p.isBombShrapnel ? 0.11 : 0.09,
                                echoAlpha: 0.04,
                                sizeBoost: 1.14,
                                maxFontSize: p.isBombShrapnel ? 28 : 30
                            });
                        }
                        ctx.fillText(p.sprite, 0, 0);
                    }
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
                    fillBossCameraOverscan(`rgba(255, 255, 255, ${boss.transitionFlash / 0.3})`);
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
                    ctx.globalAlpha = 1.0;
                    ctx.save();
                    const playerGlowScale = typeof getGlowQualityScale === 'function' ? getGlowQualityScale(0.38, 1) : (glowEnabled ? 1 : 0);
                    ctx.shadowBlur = (player.flashTimer > 0 ? 26 : pulseVisuals.glow) * playerGlowScale;
                    if (typeof drawCheapGlowDot === 'function') {
                        drawCheapGlowDot(ctx, player.x, player.y, player.flashTimer > 0 ? 31 : 25, player.flashTimer > 0 ? '#ff2200' : currentThemeColor, {
                            alpha: player.flashTimer > 0 ? 0.18 : 0.085,
                            core: false
                        });
                    }
                    drawPlayerShip(player);
                    ctx.restore();
                    ctx.globalAlpha = 1.0;
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.shadowBlur = 0; // Reset shadow for rest of rendering
                }
                drawFocusTimeWarpOverlay(renderNow, true);
                ctx.globalCompositeOperation = 'source-over';
            }

            if (bossCameraActive) ctx.restore();
            drawRunCompleteTransitionOverlay(renderNow);

            if (gameState === 'PAUSED' && !(typeof musicPlayerOpen !== 'undefined' && musicPlayerOpen)) drawPauseMenu();
            else if (pausePowerupBarAnim.mode === 'closing') {
                drawPausePowerupBar(pausePowerupBarAnim.lastTableY || Math.round(height * 0.68));
            }
            if (typeof isWeaponPowerupPanelOpen === 'function' && isWeaponPowerupPanelOpen()) drawWeaponPowerupControlPanel();
            if (gameState === 'LEVELUP') drawLevelUpMenu(dt);
            drawGalaxyWarpOutroFade(renderNow);
            
            if (consoleOpen) drawConsoleOverlay();
            if (typeof musicPlayerOpen !== 'undefined' && musicPlayerOpen) drawMusicPlayerOverlay();
            ctx.restore();
        }
