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
            if (glowEnabled) {
                ctx.shadowColor = color;
                ctx.shadowBlur = (options.glow || 10) * alpha + visual.pop * 4;
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
                ctx.shadowBlur = glowEnabled ? 5 * terminalAlpha : 0;
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
            const allowGlow = glowEnabled && load <= (isWraithLarge ? 18 : BOSS_PROJECTILE_GLOW_LIMIT) && !b.isPhantomBullet;
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
                if ((!p.isSmoke || ionize) && glowEnabled) {
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = (ionize && p.isSmoke ? 3 : 8) + lifeRatio * (ionize ? 7 : 8);
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
                        'GLOW EFFECT: < ' + (glowEnabled ? 'ON' : 'OFF') + ' >',
                        'VISUAL QUALITY: < ' + (typeof getVisualQualityLabel === 'function' ? getVisualQualityLabel() : 'NORMAL') + ' >',
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

        const musicPlayerGradientCache = {
            signalKey: '',
            signalGradient: null,
            seekKey: '',
            seekGradient: null
        };
        const musicPlayerBassCoreState = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            lastBass: 0,
            impact: 0,
            lastNow: 0
        };

        function getMusicPlayerSignalGradient(left, right, topY, bottomY, accentColor) {
            const key = `${left}|${right}|${topY}|${bottomY}|${accentColor}`;
            if (musicPlayerGradientCache.signalGradient && musicPlayerGradientCache.signalKey === key) {
                return musicPlayerGradientCache.signalGradient;
            }
            const signalGrad = ctx.createLinearGradient(left, topY, right, bottomY);
            signalGrad.addColorStop(0, colorWithAlpha('#ff8fd8', 0.72));
            signalGrad.addColorStop(0.26, colorWithAlpha('#7ee7ff', 0.88));
            signalGrad.addColorStop(0.52, colorWithAlpha('#ffffff', 0.94));
            signalGrad.addColorStop(0.74, colorWithAlpha(accentColor, 0.86));
            signalGrad.addColorStop(1, colorWithAlpha('#ff8fd8', 0.62));
            musicPlayerGradientCache.signalKey = key;
            musicPlayerGradientCache.signalGradient = signalGrad;
            return signalGrad;
        }

        function getMusicPlayerSeekGradient(seekX, seekW, accentColor) {
            const key = `${seekX}|${seekW}|${accentColor}`;
            if (musicPlayerGradientCache.seekGradient && musicPlayerGradientCache.seekKey === key) {
                return musicPlayerGradientCache.seekGradient;
            }
            const fillGrad = ctx.createLinearGradient(seekX, 0, seekX + seekW, 0);
            fillGrad.addColorStop(0, colorWithAlpha('#7ee7ff', 0.74));
            fillGrad.addColorStop(0.56, colorWithAlpha(accentColor, 0.86));
            fillGrad.addColorStop(1, colorWithAlpha('#ffffff', 0.92));
            musicPlayerGradientCache.seekKey = key;
            musicPlayerGradientCache.seekGradient = fillGrad;
            return fillGrad;
        }

        function drawMusicPlayerButton(label, x, y, w, h, selected, accentColor) {
            ctx.save();
            const pulse = selected ? (Math.sin(currentFrameNow * 0.009) + 1) * 0.5 : 0;
            const fill = selected
                ? colorWithAlpha(accentColor, 0.22 + pulse * 0.08)
                : 'rgba(5, 12, 24, 0.58)';
            ctx.fillStyle = fill;
            ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
            if (glowEnabled && selected) {
                ctx.shadowColor = accentColor;
                ctx.shadowBlur = 10 + pulse * 8;
            }
            ctx.strokeStyle = selected ? mixColor(accentColor, '#ffffff', 0.38) : colorWithAlpha(accentColor, 0.34);
            ctx.lineWidth = selected ? 2 : 1;
            ctx.strokeRect((x + 0.5) | 0, (y + 0.5) | 0, w | 0, h | 0);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.max(12, Math.min(15, h * 0.5))}px 'Electrolize', sans-serif`;
            ctx.fillStyle = selected ? mixColor(accentColor, '#ffffff', 0.68) : colorWithAlpha('#dcecff', 0.8);
            ctx.fillText(label, x + w / 2, y + h / 2 + 1);
            ctx.restore();
        }

        function drawMusicPlayerVisualizer(panelX, panelY, panelW, panelH, accentColor, status) {
            const left = panelX + 16;
            const right = panelX + panelW - 16;
            const topY = panelY + 58;
            const bottomY = Math.min(panelY + panelH - 116, panelY + 178);
            const viewW = Math.max(1, right - left);
            const viewH = Math.max(88, bottomY - topY);
            const signal = typeof getMusicPlayerReactiveSignal === 'function'
                ? getMusicPlayerReactiveSignal()
                : { bass: 0.2, bassGuitar: 0.2, bassPulse: 0.08, drumSnap: 0.12, leadTone: 0.16, air: 0.12, mid: 0.15, highMid: 0.18, treble: 0.12, energy: 0.18, pulse: 0.08, phase: (currentFrameNow || 0) * 0.00004 };
            const activeAlpha = status && status.isPlaying ? 1 : 0.42;
            const energy = Math.max(0, Math.min(1, signal.energy || 0));
            const pulse = Math.max(0, Math.min(1, signal.pulse || 0));
            const bassPulse = Math.max(0, Math.min(1, signal.bassPulse || 0));
            const bass = Math.max(0, Math.min(1, signal.bass || 0));
            const bassGuitar = Math.max(0, Math.min(1, Number.isFinite(signal.bassGuitar) ? signal.bassGuitar : bass));
            const drumSnap = Math.max(0, Math.min(1, signal.drumSnap || 0));
            const leadTone = Math.max(0, Math.min(1, signal.leadTone || 0));
            const airTone = Math.max(0, Math.min(1, signal.air || 0));
            const mid = Math.max(0, Math.min(1, signal.mid || 0));
            const highMid = Math.max(0, Math.min(1, Number.isFinite(signal.highMid) ? signal.highMid : mid));
            const treble = Math.max(0, Math.min(1, signal.treble || 0));
            const phase = (signal.phase || 0) * Math.PI * 2;
            const bandProfileAge = signal.bands && Number.isFinite(signal.bands.age) ? Math.max(0, signal.bands.age) : 0;
            const profileLock = Math.max(0, Math.min(1, bandProfileAge / 10));
            const cx = left + viewW * 0.5;
            const cy = topY + viewH * 0.53;
            const baseRx = Math.min(viewW * 0.34, 178) * (0.82 + highMid * 0.25 + energy * 0.045);
            const baseRy = Math.min(viewH * 0.44, 62) * (0.82 + mid * 0.12 + bassGuitar * 0.045 + pulse * 0.025);
            const signalGradient = getMusicPlayerSignalGradient(left, right, topY, bottomY, accentColor);
            const coreState = musicPlayerBassCoreState;
            const renderNow = currentFrameNow || performance.now();
            const coreDt = coreState.lastNow > 0
                ? Math.max(0.001, Math.min(0.08, (renderNow - coreState.lastNow) / 1000))
                : 1 / 60;
            coreState.lastNow = renderNow;
            const bassRise = Math.max(0, bassGuitar - coreState.lastBass * 0.965);
            coreState.lastBass = bassGuitar;
            coreState.impact = Math.max(coreState.impact * Math.pow(0.10, coreDt), Math.min(1, bassPulse * 1.05 + bassRise * 3.8 + pulse * 0.08));
            coreState.x = 0;
            coreState.y = 0;
            coreState.vx = 0;
            coreState.vy = 0;
            const bassGlow = Math.max(0, Math.min(1, Math.pow(bassGuitar * 0.78 + bassPulse * 0.72 + coreState.impact * 0.48, 0.64)));
            const coreCx = cx;
            const coreCy = cy;
            const gasPhaseSeed = phase * 0.73 + bassGuitar * 1.2;
            const voidSunReturn = Math.pow(Math.max(0, Math.sin(renderNow * 0.00046 + 0.95) - 0.88) / 0.12, 2) * (0.42 + bassPulse * 0.32);
            const voidMode = Math.max(0, Math.min(1, 1 - voidSunReturn * 0.78));
            const voidFieldRadius = Math.min(viewW * 0.24, Math.max(42, viewH * 0.62));

            const distortVisualizerPoint = (x, y, strength = 1) => {
                const dx = x - coreCx;
                const dy = y - coreCy;
                const dist = Math.max(0.001, Math.hypot(dx, dy));
                if (dist >= voidFieldRadius || voidMode <= 0.02) return { x, y };
                const t = 1 - dist / voidFieldRadius;
                const influence = t * t * voidMode * strength;
                const swirl = influence * (0.46 + bassGlow * 0.20) * Math.sin(phase * 0.74 + dist * 0.035);
                const pull = influence * (3.2 + bassGlow * 4.8);
                const cos = Math.cos(swirl);
                const sin = Math.sin(swirl);
                const warpedX = dx * cos - dy * sin;
                const warpedY = dx * sin + dy * cos;
                return {
                    x: coreCx + warpedX - (warpedX / dist) * pull,
                    y: coreCy + warpedY - (warpedY / dist) * pull
                };
            };

            const getBreathingPaletteColor = (palette, index, speed = 0.34, offset = 0) => {
                if (!palette || !palette.length) return '#ffffff';
                const a = palette[index % palette.length];
                const b = palette[(index + 1) % palette.length];
                const individualOffset = offset + index * 0.82 + Math.sin(index * 12.9898 + offset * 4.7) * 1.25;
                const speedJitter = 0.62 + Math.sin(index * 5.173 + offset * 2.11) * 0.23 + Math.sin(index * 11.41) * 0.15;
                const elementSpeed = Math.max(0.035, speed * speedJitter);
                const t = 0.5 + Math.sin(phase * elementSpeed + individualOffset) * 0.5;
                return typeof mixHexColor === 'function' ? mixHexColor(a, b, t) : mixColor(a, b, t);
            };

            const coreBreathColor = getBreathingPaletteColor(
                ['#05060d', '#07111c', '#0a0614', '#12090a'],
                0,
                0.040,
                gasPhaseSeed * 0.04
            );
            const coreFlareColor = getBreathingPaletteColor(
                ['#fff1b2', '#7ee7ff', accentColor, '#ff8fd8'],
                1,
                0.060,
                gasPhaseSeed * 0.03
            );

            const drawIrisLoop = (rx, ry, color, alpha, lineWidth, spin, wobbleScale) => {
                const steps = 96;
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const t = (Math.PI * 2 * i) / steps;
                    const drift = Math.sin(t * 3 + phase * 1.5 + spin) * (0.043 + highMid * 0.042) * wobbleScale
                        + Math.sin(t * 5 - phase * 1.2 - spin) * (0.026 + treble * 0.038) * wobbleScale;
                    const orbit = t + phase * spin * (0.27 + highMid * 0.070) + drift;
                    const rawX = cx
                        + Math.cos(orbit) * rx
                        + Math.sin(t * 2 - phase * 0.58) * rx * (0.026 + treble * 0.028);
                    const rawY = cy
                        + Math.sin(t * 2 + phase * spin * 0.24) * ry * (0.68 + bass * 0.10)
                        + Math.cos(t * 3 + phase * 0.48) * ry * (0.026 + mid * 0.032);
                    const warped = distortVisualizerPoint(rawX, rawY, 0.70);
                    const x = warped.x;
                    const y = warped.y;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = color;
                ctx.globalAlpha = alpha * activeAlpha;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            };

            const drawMobiusStrip = (rx, ry) => {
                const steps = 74;
                const edgeA = [];
                const edgeB = [];
                const ribs = [];
                const ribbonW = 5.5 + highMid * 9 + pulse * 3;
                for (let i = 0; i <= steps; i++) {
                    const t = (Math.PI * 2 * i) / steps;
                    const theta = t + phase * (0.16 + highMid * 0.08);
                    const centerX = cx + Math.sin(theta) * rx;
                    const centerY = cy
                        + Math.sin(theta * 2 - phase * 0.42) * ry * (0.54 + highMid * 0.10)
                        + Math.cos(theta - phase * 0.32) * ry * 0.12;
                    const dx = Math.cos(theta) * rx;
                    const dy = Math.cos(theta * 2 - phase * 0.42) * ry * 2 * (0.54 + highMid * 0.10)
                        - Math.sin(theta - phase * 0.32) * ry * 0.12;
                    const len = Math.max(1, Math.hypot(dx, dy));
                    const nx = -dy / len;
                    const ny = dx / len;
                    const twist = Math.cos(t * 0.5 + phase * 0.72);
                    const thickness = ribbonW * (0.45 + Math.abs(twist) * 0.65);
                    const warpedA = distortVisualizerPoint(centerX + nx * thickness, centerY + ny * thickness, 0.82);
                    const warpedB = distortVisualizerPoint(centerX - nx * thickness, centerY - ny * thickness, 0.82);
                    edgeA.push(warpedA);
                    edgeB.push(warpedB);
                    if (i % 7 === 0) ribs.push({ ax: warpedA.x, ay: warpedA.y, bx: warpedB.x, by: warpedB.y, twist, index: i });
                }

                ctx.save();
                ctx.globalAlpha = (0.10 + highMid * 0.070 + pulse * 0.030) * activeAlpha;
                ctx.fillStyle = getMusicPlayerSignalGradient(left, right, topY, bottomY, accentColor);
                ctx.beginPath();
                ctx.moveTo(edgeA[0].x, edgeA[0].y);
                for (let i = 1; i < edgeA.length; i++) ctx.lineTo(edgeA[i].x, edgeA[i].y);
                for (let i = edgeB.length - 1; i >= 0; i--) ctx.lineTo(edgeB[i].x, edgeB[i].y);
                ctx.closePath();
                ctx.fill();

                if (glowEnabled) {
                    ctx.shadowColor = '#7ee7ff';
                    ctx.shadowBlur = 7 + highMid * 8;
                }
                ctx.globalAlpha = (0.38 + highMid * 0.20) * activeAlpha;
                ctx.strokeStyle = colorWithAlpha(getBreathingPaletteColor(['#7ee7ff', '#ffffff', accentColor], 2, 0.11, 0.4), 0.86);
                ctx.lineWidth = 1.15 + highMid * 1.05;
                ctx.beginPath();
                ctx.moveTo(edgeA[0].x, edgeA[0].y);
                for (let i = 1; i < edgeA.length; i++) ctx.lineTo(edgeA[i].x, edgeA[i].y);
                ctx.stroke();
                ctx.strokeStyle = colorWithAlpha(getBreathingPaletteColor(['#ff8fd8', accentColor, '#7ee7ff'], 4, 0.13, 1.8), 0.78);
                ctx.beginPath();
                ctx.moveTo(edgeB[0].x, edgeB[0].y);
                for (let i = 1; i < edgeB.length; i++) ctx.lineTo(edgeB[i].x, edgeB[i].y);
                ctx.stroke();
                ctx.shadowBlur = 0;

                ctx.lineWidth = 0.8;
                for (const rib of ribs) {
                    ctx.globalAlpha = (0.13 + Math.abs(rib.twist) * 0.26 + treble * 0.080) * activeAlpha;
                    const ribColor = getBreathingPaletteColor(
                        Math.abs(rib.twist) > 0.62 ? ['#ffffff', '#7ee7ff', '#fff1b2'] : [accentColor, '#ff8fd8', '#7ee7ff'],
                        rib.index || 0,
                        0.16,
                        2.1
                    );
                    ctx.strokeStyle = colorWithAlpha(ribColor, Math.abs(rib.twist) > 0.62 ? 0.62 : 0.56);
                    ctx.beginPath();
                    ctx.moveTo(rib.ax, rib.ay);
                    ctx.lineTo(rib.bx, rib.by);
                    ctx.stroke();
                }
                ctx.restore();
            };

            const drawBassGasCorona = (coreRadius) => {
                const gas = Math.max(0, Math.min(1, bassGlow * 0.82 + bassPulse * 0.58 + coreState.impact * 0.34));
                if (gas <= 0.01) return;
                const gasPhase = phase * (0.44 + bassGuitar * 0.18);
                const coronaRadius = coreRadius * (2.65 + gas * 1.70);
                const outerGas = ctx.createRadialGradient(coreCx, coreCy, coreRadius * 0.18, coreCx, coreCy, coronaRadius * 1.30);
                outerGas.addColorStop(0, colorWithAlpha('#ffffff', (0.16 + gas * 0.22) * activeAlpha));
                outerGas.addColorStop(0.20, colorWithAlpha('#7ee7ff', (0.15 + gas * 0.25) * activeAlpha));
                outerGas.addColorStop(0.48, colorWithAlpha(accentColor, (0.070 + gas * 0.16) * activeAlpha));
                outerGas.addColorStop(0.73, colorWithAlpha('#ff8fd8', (0.030 + gas * 0.090) * activeAlpha));
                outerGas.addColorStop(1, 'rgba(255,255,255,0)');

                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = outerGas;
                if (glowEnabled) {
                    ctx.shadowColor = '#7ee7ff';
                    ctx.shadowBlur = 12 + gas * 18;
                }
                ctx.beginPath();
                ctx.arc(coreCx, coreCy, coronaRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                for (let i = 0; i < 11; i++) {
                    const lane = i / 11;
                    const angle = lane * Math.PI * 2 + gasPhase * (0.55 + (i % 3) * 0.09);
                    const flutter = Math.sin(gasPhase * 1.7 + i * 1.91) * (0.18 + gas * 0.18);
                    const lobeDistance = coreRadius * (1.08 + gas * 0.62 + (i % 4) * 0.055);
                    const lobeLength = coreRadius * (0.72 + gas * 0.84 + Math.max(0, flutter) * 0.28);
                    const lobeWidth = coreRadius * (0.20 + gas * 0.22 + (i % 2) * 0.035);
                    ctx.save();
                    ctx.translate(coreCx, coreCy);
                    ctx.rotate(angle + flutter * 0.36);
                    ctx.globalAlpha = (0.055 + gas * 0.070 + bassPulse * 0.045) * activeAlpha;
                    ctx.fillStyle = i % 3 === 0
                        ? colorWithAlpha('#ffffff', 0.58)
                        : (i % 3 === 1 ? colorWithAlpha('#7ee7ff', 0.66) : colorWithAlpha(accentColor, 0.62));
                    ctx.beginPath();
                    ctx.ellipse(lobeDistance, 0, lobeLength, lobeWidth, flutter, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                ctx.lineCap = 'round';
                for (let i = 0; i < 8; i++) {
                    const angle = i * Math.PI * 0.25 + gasPhase * (0.28 + (i % 2) * 0.08);
                    const inner = coreRadius * (0.72 + (i % 3) * 0.06);
                    const outer = coronaRadius * (0.52 + (i % 4) * 0.045 + gas * 0.10);
                    const bend = Math.sin(gasPhase * 1.45 + i) * coreRadius * (0.55 + gas * 0.36);
                    ctx.globalAlpha = (0.035 + gas * 0.085 + bassPulse * 0.040) * activeAlpha;
                    ctx.strokeStyle = i % 2 ? colorWithAlpha('#7ee7ff', 0.76) : colorWithAlpha(accentColor, 0.70);
                    ctx.lineWidth = 0.8 + gas * 1.1;
                    ctx.beginPath();
                    ctx.moveTo(coreCx + Math.cos(angle) * inner, coreCy + Math.sin(angle) * inner);
                    ctx.bezierCurveTo(
                        coreCx + Math.cos(angle + 0.46) * (inner + outer) * 0.42,
                        coreCy + Math.sin(angle + 0.46) * (inner + outer) * 0.42 + bend * 0.22,
                        coreCx + Math.cos(angle - 0.32) * outer * 0.72,
                        coreCy + Math.sin(angle - 0.32) * outer * 0.72 - bend * 0.16,
                        coreCx + Math.cos(angle + flutterNoise(i)) * outer,
                        coreCy + Math.sin(angle + flutterNoise(i + 3)) * outer
                    );
                    ctx.stroke();
                }
                ctx.restore();
            };

            const drawInstrumentSatellites = () => {
                const seededUnit = (seed) => {
                    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
                    return value - Math.floor(value);
                };
                const groups = [
                    { mode: 'bass', count: 5, signal: bassGuitar, pulse: bassPulse, palette: [accentColor, '#ffb45a', '#fff1b2'], phaseOffset: 0.15, size: 1.95, colorSpeed: 0.09 },
                    { mode: 'drums', count: 6, signal: drumSnap, pulse, palette: ['#ffffff', '#7ee7ff', '#dcecff'], phaseOffset: 1.45, size: 1.42, colorSpeed: 0.24 },
                    { mode: 'lead', count: 5, signal: leadTone, pulse: highMid, palette: ['#7ee7ff', '#ff8fd8', '#ffffff'], phaseOffset: 2.80, size: 1.50, colorSpeed: 0.17 },
                    { mode: 'air', count: 5, signal: airTone, pulse: treble, palette: ['#ff8fd8', '#ffffff', '#7ee7ff'], phaseOffset: 4.12, size: 1.18, colorSpeed: 0.31 }
                ];

                const getSatellitePosition = (group, i, phaseValue, groupSignal, groupPulse) => {
                    const lane = i / group.count;
                    const seed = group.phaseOffset * 10 + i * 3.17;
                    let x;
                    let y;
                    if (group.mode === 'bass') {
                        const spread = (lane - 0.5) * baseRx * 1.32;
                        x = cx + spread + Math.sin(phaseValue * 0.42 + seed) * baseRx * (0.018 + groupSignal * 0.012);
                        y = cy + baseRy * (0.42 + seededUnit(seed) * 0.12) + Math.sin(phaseValue * 0.62 + seed) * baseRy * (0.06 + groupPulse * 0.045);
                    } else if (group.mode === 'drums') {
                        const snap = 0.62 + groupPulse * 0.22;
                        const angle = lane * Math.PI * 2 + group.phaseOffset;
                        x = cx + Math.cos(angle) * baseRx * snap + Math.sin(phaseValue * 1.6 + seed) * (2 + groupPulse * 8);
                        y = cy + Math.sin(angle * 2.0 + phaseValue * 0.30) * baseRy * (0.48 + groupPulse * 0.24);
                    } else if (group.mode === 'lead') {
                        const drift = phaseValue * 0.13 + group.phaseOffset + lane * Math.PI * 1.35;
                        x = cx + Math.cos(drift) * baseRx * (0.86 + groupSignal * 0.08);
                        y = cy - baseRy * 0.34 + (lane - 0.5) * baseRy * 0.84 + Math.sin(drift * 2.1) * baseRy * (0.13 + groupSignal * 0.05);
                    } else {
                        x = left + viewW * (0.10 + seededUnit(seed) * 0.80) + Math.sin(phaseValue * 0.32 + seed) * (3 + groupSignal * 6);
                        y = topY + viewH * (0.17 + seededUnit(seed + 8) * 0.66) + Math.cos(phaseValue * 0.44 + seed) * (2 + groupPulse * 5);
                    }
                    return distortVisualizerPoint(x, y, group.mode === 'bass' ? 0.46 : 0.72);
                };

                for (const group of groups) {
                    const groupSignal = Math.max(0, Math.min(1, group.signal || 0));
                    const groupPulse = Math.max(0, Math.min(1, group.pulse || 0));
                    for (let i = 0; i < group.count; i++) {
                        const position = getSatellitePosition(group, i, phase, groupSignal, groupPulse);
                        const x = position.x;
                        const y = position.y;
                        const brightness = Math.max(0, Math.min(1, 0.18 + groupSignal * 0.62 + groupPulse * 0.22 + Math.sin(phase * 1.4 + i) * 0.08));
                        const dotRadius = group.size + brightness * 2.0 + groupPulse * 0.7;
                        const dotColor = getBreathingPaletteColor(group.palette, i, group.colorSpeed + i * 0.018, group.phaseOffset);
                        if ((i + group.count) % 2 === 0) {
                            for (let t = 2; t >= 1; t--) {
                                const trail = getSatellitePosition(group, i, phase - t * (0.11 + groupSignal * 0.035), groupSignal, groupPulse);
                                ctx.globalAlpha = brightness * activeAlpha * (0.10 / t);
                                ctx.fillStyle = colorWithAlpha(dotColor, 0.44);
                                ctx.beginPath();
                                ctx.arc(trail.x, trail.y, Math.max(0.8, dotRadius * (1 - t * 0.20)), 0, Math.PI * 2);
                                ctx.fill();
                            }
                        }
                        if (glowEnabled) {
                            ctx.shadowColor = dotColor;
                            ctx.shadowBlur = 5 + brightness * 9;
                        }
                        ctx.globalAlpha = brightness * activeAlpha;
                        ctx.fillStyle = colorWithAlpha(dotColor, 0.92);
                        ctx.beginPath();
                        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }
            };

            const drawVoidAccretionDisk = (shadowRadius, frontOnly = false) => {
                const axis = -0.18 + Math.sin(phase * 0.13) * 0.035;
                const diskPulse = 0.86 + bassGlow * 0.18 + coreState.impact * 0.12 + voidSunReturn * 0.24;
                const bands = [
                    {
                        rx: shadowRadius * (2.42 + bassGlow * 0.18),
                        ry: shadowRadius * (0.48 + bassPulse * 0.035),
                        y: -shadowRadius * 0.13,
                        width: 3.4,
                        blur: 11,
                        alpha: 0.24,
                        palette: ['#ff8f35', '#fff1b2', accentColor],
                        speed: 0.060
                    },
                    {
                        rx: shadowRadius * (2.04 + coreState.impact * 0.10),
                        ry: shadowRadius * 0.36,
                        y: -shadowRadius * 0.08,
                        width: 1.8,
                        blur: 8,
                        alpha: 0.31,
                        palette: ['#fff1b2', '#ffb45a', '#ffffff'],
                        speed: 0.050
                    },
                    {
                        rx: shadowRadius * 1.18,
                        ry: shadowRadius * 0.28,
                        y: shadowRadius * 0.04,
                        width: 1.45,
                        blur: 12,
                        alpha: 0.44,
                        palette: ['#ffffff', '#7ee7ff', '#fff1b2'],
                        speed: 0.030
                    }
                ];

                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.translate(coreCx, coreCy);
                ctx.rotate(axis);
                ctx.lineCap = 'round';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (let i = 0; i < bands.length; i++) {
                    const band = bands[i];
                    const color = getBreathingPaletteColor(band.palette, i, band.speed + i * 0.012, 5.7 + i);
                    ctx.strokeStyle = colorWithAlpha(color, 0.86);
                    ctx.lineWidth = Math.max(0.7, band.width + bassGlow * 0.7);
                    ctx.shadowColor = color;
                    ctx.shadowBlur = glowEnabled ? band.blur + bassGlow * 10 : 0;
                    ctx.globalAlpha = band.alpha * diskPulse * activeAlpha * (frontOnly ? 1.15 : 0.78);
                    ctx.beginPath();
                    if (frontOnly) {
                        ctx.ellipse(0, band.y, band.rx, band.ry, 0, 0.02, Math.PI - 0.02);
                    } else {
                        ctx.ellipse(0, band.y, band.rx, band.ry, 0, Math.PI + 0.04, Math.PI * 2 - 0.04);
                    }
                    ctx.stroke();
                }

                if (frontOnly) {
                    const innerColor = getBreathingPaletteColor(['#ffffff', '#7ee7ff', '#fff1b2'], 7, 0.026, 7.2);
                    ctx.strokeStyle = colorWithAlpha(innerColor, 0.92);
                    ctx.lineWidth = 1.15 + bassGlow * 0.8;
                    ctx.shadowColor = innerColor;
                    ctx.shadowBlur = glowEnabled ? 16 + bassGlow * 16 : 0;
                    ctx.globalAlpha = (0.30 + bassGlow * 0.18 + coreState.impact * 0.14) * activeAlpha;
                    ctx.beginPath();
                    ctx.ellipse(0, shadowRadius * 0.055, shadowRadius * 1.03, shadowRadius * 0.24, 0, 0.10, Math.PI - 0.22);
                    ctx.stroke();
                } else {
                    for (let i = 0; i < 10; i++) {
                        const t = i / 9;
                        const glyphColor = getBreathingPaletteColor(['#ff8f35', '#fff1b2', '#ffb45a'], i, 0.055 + i * 0.006, 8.9);
                        const angle = Math.PI + t * Math.PI + phase * 0.06 + Math.sin(i * 1.7) * 0.08;
                        const gx = Math.cos(angle) * shadowRadius * (1.45 + t * 0.92);
                        const gy = -shadowRadius * 0.12 + Math.sin(angle) * shadowRadius * (0.23 + t * 0.07);
                        ctx.globalAlpha = (0.13 + t * 0.10 + bassPulse * 0.05) * activeAlpha;
                        ctx.fillStyle = colorWithAlpha(glyphColor, 0.82);
                        ctx.font = `bold ${Math.max(7, Math.round(shadowRadius * (0.22 + t * 0.08)))}px Courier New`;
                        ctx.fillText(i % 3 === 0 ? '*' : (i % 3 === 1 ? '+' : 'o'), gx, gy);
                    }
                }
                ctx.restore();
            };

            const flutterNoise = (n) => Math.sin(gasPhaseSeed + n * 1.618) * 0.18;

            ctx.save();
            ctx.beginPath();
            ctx.rect(left, topY, right - left, bottomY - topY);
            ctx.clip();

            ctx.globalCompositeOperation = 'source-over';
            const backdrop = ctx.createLinearGradient(left, topY, right, bottomY);
            backdrop.addColorStop(0, 'rgba(10, 5, 18, 0.82)');
            backdrop.addColorStop(0.34, 'rgba(4, 15, 29, 0.88)');
            backdrop.addColorStop(0.68, 'rgba(5, 10, 23, 0.88)');
            backdrop.addColorStop(1, 'rgba(18, 4, 17, 0.82)');
            ctx.fillStyle = backdrop;
            ctx.fillRect(left, topY, right - left, bottomY - topY);

            ctx.globalCompositeOperation = 'screen';

            const aura = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(baseRx * 0.94, baseRy * 1.8));
            aura.addColorStop(0, colorWithAlpha('#ffffff', (0.13 + bassGlow * 0.12 + energy * 0.045) * activeAlpha));
            aura.addColorStop(0.18, colorWithAlpha('#7ee7ff', (0.13 + highMid * 0.080) * activeAlpha));
            aura.addColorStop(0.42, colorWithAlpha(accentColor, (0.070 + bassGlow * 0.070) * activeAlpha));
            aura.addColorStop(0.75, colorWithAlpha('#ff8fd8', (0.050 + treble * 0.055) * activeAlpha));
            aura.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = aura;
            ctx.fillRect(left, topY, right - left, bottomY - topY);

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 1;
            ctx.strokeStyle = colorWithAlpha('#7ee7ff', (0.024 + profileLock * 0.018) * activeAlpha);
            for (let i = 0; i < 6; i++) {
                const x = left + (viewW * i) / 5;
                ctx.beginPath();
                ctx.moveTo(x | 0, topY);
                ctx.lineTo((x + Math.sin(phase * 0.35 + i) * 8) | 0, bottomY);
                ctx.stroke();
            }
            ctx.strokeStyle = colorWithAlpha(accentColor, (0.022 + profileLock * 0.018) * activeAlpha);
            for (let i = 1; i < 4; i++) {
                const y = topY + (viewH * i) / 4;
                ctx.beginPath();
                ctx.moveTo(left, y | 0);
                ctx.lineTo(right, (y + Math.sin(phase * 0.5 + i) * 3) | 0);
                ctx.stroke();
            }

            const petalCount = 12;
            for (let i = 0; i < petalCount; i++) {
                const a = phase * (0.16 + mid * 0.080) + (Math.PI * 2 * i) / petalCount;
                const a2 = a + Math.PI / petalCount;
                const petalRx = baseRx * (0.18 + mid * 0.052 + (i % 2) * 0.014);
                const petalRy = baseRy * (0.54 + mid * 0.12);
                const tipX = cx + Math.cos(a) * baseRx * (0.42 + mid * 0.070 + pulse * 0.045);
                const tipY = cy + Math.sin(a) * baseRy * (0.50 + mid * 0.090 + pulse * 0.030);
                const leftX = cx + Math.cos(a - 0.38) * petalRx;
                const leftY = cy + Math.sin(a - 0.38) * petalRy;
                const rightX = cx + Math.cos(a + 0.38) * petalRx;
                const rightY = cy + Math.sin(a + 0.38) * petalRy;
                ctx.globalAlpha = (0.052 + mid * 0.044 + energy * 0.016 + (i % 3) * 0.006) * activeAlpha;
                const petalColor = getBreathingPaletteColor(
                    i % 3 === 0 ? ['#7ee7ff', '#ffffff', accentColor] : (i % 3 === 1 ? ['#ff8fd8', '#7ee7ff', '#ffffff'] : [accentColor, '#ff8fd8', '#7ee7ff']),
                    i,
                    0.18 + (i % 4) * 0.035,
                    0.65
                );
                ctx.fillStyle = colorWithAlpha(petalColor, i % 3 === 0 ? 0.92 : (i % 3 === 1 ? 0.84 : 0.78));
                ctx.beginPath();
                const p0 = distortVisualizerPoint(cx, cy, 0.42);
                const p1 = distortVisualizerPoint(leftX, leftY, 0.66);
                const p2 = distortVisualizerPoint(cx + Math.cos(a2) * petalRx * 0.8, cy + Math.sin(a2) * petalRy * 0.8, 0.66);
                const p3 = distortVisualizerPoint(tipX, tipY, 0.76);
                const p4 = distortVisualizerPoint(rightX, rightY, 0.66);
                ctx.moveTo(p0.x, p0.y);
                ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
                ctx.bezierCurveTo(p2.x, p2.y, p4.x, p4.y, p0.x, p0.y);
                ctx.fill();
            }

            ctx.globalAlpha = (0.12 + treble * 0.15) * activeAlpha;
            for (let i = 0; i < 4; i++) {
                const ringT = i / 3;
                ctx.lineWidth = 0.65 + treble * 0.85 + ringT * 0.30;
                ctx.strokeStyle = colorWithAlpha(getBreathingPaletteColor(['#ffffff', '#7ee7ff', '#ff8fd8', accentColor], i, 0.12 + i * 0.025, 1.25), 0.72);
                ctx.beginPath();
                ctx.ellipse(
                    cx,
                    cy,
                    baseRx * (0.24 + ringT * 0.22 + treble * 0.040),
                    baseRy * (0.24 + ringT * 0.16 + treble * 0.032),
                    phase * (0.16 + i * 0.040 + treble * 0.026),
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }

            drawMobiusStrip(baseRx * (0.76 + profileLock * 0.035 + highMid * 0.12), baseRy * (0.86 + profileLock * 0.035 + highMid * 0.13));

            if (glowEnabled) {
                ctx.shadowColor = accentColor;
                ctx.shadowBlur = 10 + energy * 9;
            }
            drawIrisLoop(baseRx * (0.92 + highMid * 0.065), baseRy * (0.84 + highMid * 0.050), signalGradient, 0.48 + highMid * 0.24, 1.45 + highMid * 1.45, 1.0, 1.04);
            drawIrisLoop(baseRx * (0.70 + treble * 0.050), baseRy * (1.02 + treble * 0.11), colorWithAlpha('#7ee7ff', 0.92), 0.34 + treble * 0.23, 1.05 + treble * 0.95, -1.35, 1.14);
            drawIrisLoop(baseRx * (1.06 + highMid * 0.10), baseRy * (0.60 + highMid * 0.080), colorWithAlpha('#ff8fd8', 0.86), 0.28 + highMid * 0.25, 0.96 + highMid * 1.02, 1.75, 0.96);
            ctx.shadowBlur = 0;

            drawInstrumentSatellites();

            ctx.globalAlpha = (0.12 + treble * 0.11) * activeAlpha;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.max(7, Math.min(10, viewH * 0.075))}px Courier New`;
            const glyphs = ['0', '1', '+', 'x', '::', '<>'];
            for (let i = 0; i < 14; i++) {
                const lane = i / 13;
                const drift = (phase * (0.022 + (i % 4) * 0.006) + lane) % 1;
                const rawX = left + drift * viewW;
                const rawY = topY + 12 + ((i * 29) % Math.max(1, viewH - 24));
                const warped = distortVisualizerPoint(rawX, rawY, 0.48);
                const glyphColor = getBreathingPaletteColor(
                    i % 3 === 0 ? ['#ffffff', '#7ee7ff', '#fff1b2'] : (i % 2 ? ['#7ee7ff', '#ff8fd8', '#ffffff'] : [accentColor, '#7ee7ff', '#ff8fd8']),
                    i,
                    0.10 + (i % 5) * 0.025,
                    3.4
                );
                ctx.fillStyle = colorWithAlpha(glyphColor, 0.68);
                ctx.fillText(glyphs[i % glyphs.length], warped.x, warped.y);
            }

            const coreRadius = 8 + bassGuitar * 5 + bassGlow * 6 + coreState.impact * 3.5;
            const shadowRadius = Math.max(13, coreRadius * (1.08 + voidMode * 0.38));
            const coreGlowRadius = coreRadius * (2.35 + bassGlow * 0.70 + coreState.impact * 0.42);
            drawBassGasCorona(coreRadius);

            ctx.globalCompositeOperation = 'screen';
            const voidHalo = ctx.createRadialGradient(coreCx, coreCy, 1, coreCx, coreCy, coreGlowRadius * 1.28);
            voidHalo.addColorStop(0, colorWithAlpha(coreFlareColor, (0.040 + voidSunReturn * 0.22) * activeAlpha));
            voidHalo.addColorStop(0.32, colorWithAlpha('#7ee7ff', (0.060 + bassGlow * 0.075) * activeAlpha));
            voidHalo.addColorStop(0.58, colorWithAlpha(accentColor, (0.025 + bassGlow * 0.050 + voidSunReturn * 0.11) * activeAlpha));
            voidHalo.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = voidHalo;
            ctx.beginPath();
            ctx.arc(coreCx, coreCy, coreGlowRadius * 1.28, 0, Math.PI * 2);
            ctx.fill();
            drawVoidAccretionDisk(shadowRadius, false);

            ctx.globalCompositeOperation = 'source-over';
            const shadow = ctx.createRadialGradient(coreCx - shadowRadius * 0.18, coreCy - shadowRadius * 0.16, shadowRadius * 0.10, coreCx, coreCy, shadowRadius * 1.22);
            shadow.addColorStop(0, colorWithAlpha('#000000', 0.98 * activeAlpha));
            shadow.addColorStop(0.52, colorWithAlpha(coreBreathColor, 0.96 * activeAlpha));
            shadow.addColorStop(0.78, colorWithAlpha('#01030a', 0.90 * activeAlpha));
            shadow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = shadow;
            ctx.beginPath();
            ctx.arc(coreCx, coreCy, shadowRadius * 1.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = (0.92 - voidSunReturn * 0.42) * activeAlpha;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(coreCx, coreCy, shadowRadius * (0.58 + voidMode * 0.18), 0, Math.PI * 2);
            ctx.fill();

            ctx.globalCompositeOperation = 'screen';
            drawVoidAccretionDisk(shadowRadius, true);
            ctx.globalAlpha = (0.18 + bassGlow * 0.18 + voidSunReturn * 0.42) * activeAlpha;
            ctx.strokeStyle = colorWithAlpha(coreFlareColor, 0.88);
            ctx.lineWidth = 1.2 + bassGlow * 1.3;
            ctx.shadowColor = coreFlareColor;
            ctx.shadowBlur = glowEnabled ? 10 + bassGlow * 18 + voidSunReturn * 22 : 0;
            ctx.beginPath();
            ctx.arc(coreCx, coreCy, shadowRadius * (1.02 + voidSunReturn * 0.18), 0, Math.PI * 2);
            ctx.stroke();

            if (voidSunReturn > 0.035) {
                const flareRadius = coreRadius * (1.65 + voidSunReturn * 0.85);
                const flare = ctx.createRadialGradient(coreCx, coreCy, 1, coreCx, coreCy, flareRadius);
                flare.addColorStop(0, colorWithAlpha('#ffffff', 0.78 * voidSunReturn * activeAlpha));
                flare.addColorStop(0.24, colorWithAlpha(coreFlareColor, 0.62 * voidSunReturn * activeAlpha));
                flare.addColorStop(0.56, colorWithAlpha(accentColor, 0.32 * voidSunReturn * activeAlpha));
                flare.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = flare;
                ctx.beginPath();
                ctx.arc(coreCx, coreCy, flareRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;

            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = colorWithAlpha(accentColor, 0.42);
            ctx.globalAlpha = 0.58;
            ctx.lineWidth = 1;
            ctx.strokeRect((left + 0.5) | 0, (topY + 0.5) | 0, (right - left) | 0, (bottomY - topY) | 0);
            ctx.restore();
        }

        function drawMusicPlayerOverlay() {
            if (typeof getMusicPlayerStatus !== 'function') return;
            const status = getMusicPlayerStatus();
            if (!status || !status.open) return;

            const accent = '#ffd95a';
            const panelW = Math.min(640, width - 72);
            const panelH = 306;
            const panelX = Math.round((width - panelW) / 2);
            const panelY = Math.round(Math.max(54, height * 0.20));
            const pad = 18;
            const pulse = (Math.sin(currentFrameNow * 0.006) + 1) * 0.5;

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(0, 3, 10, 0.46)';
            ctx.fillRect(0, 0, width | 0, height | 0);
            drawPauseHudPanel(panelX, panelY, panelW, panelH, accent, true, {
                fillAlpha: 0.94,
                borderAlpha: 0.74,
                edgeWashAlpha: 0.012,
                innerSheenAlpha: 0.004,
                rail: true
            });
            drawMusicPlayerVisualizer(panelX, panelY, panelW, panelH, accent, status);

            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 10px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.58);
            ctx.fillText('MUSIC PLAYER', panelX + pad, panelY + 22);

            const trackCountLabel = `${String(status.trackIndex + 1).padStart(2, '0')} / ${String(status.trackCount).padStart(2, '0')}`;
            ctx.textAlign = 'right';
            ctx.font = `bold 18px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha(accent, 0.86);
            ctx.fillText(trackCountLabel, panelX + panelW - pad, panelY + 38);
            const trackCountW = ctx.measureText(trackCountLabel).width;

            ctx.textAlign = 'left';
            ctx.font = `bold 24px 'Electrolize', sans-serif`;
            ctx.fillStyle = status.isLoaded ? mixColor(accent, '#ffffff', 0.42) : '#ff88a6';
            const trackNameW = Math.max(120, panelW - pad * 2 - trackCountW - 24);
            const trackLabel = truncateConsoleLine(status.isLoaded ? status.trackName.toUpperCase() : `${status.trackName.toUpperCase()}  LOADING`, trackNameW);
            ctx.fillText(trackLabel, panelX + pad, panelY + 38);

            const seekX = panelX + pad;
            const seekY = panelY + 190;
            const seekW = panelW - pad * 2;
            const seekH = 13;
            const seekSelected = status.selection === 0;
            const duration = Math.max(0.001, status.duration || 0.001);
            const fillRatio = Math.max(0, Math.min(1, status.position / duration));

            ctx.fillStyle = seekSelected ? colorWithAlpha('#ffffff', 0.09) : 'rgba(3, 8, 18, 0.72)';
            ctx.fillRect(seekX | 0, seekY | 0, seekW | 0, seekH | 0);
            ctx.strokeStyle = seekSelected ? mixColor(accent, '#ffffff', 0.52) : colorWithAlpha(accent, 0.34);
            ctx.lineWidth = seekSelected ? 2 : 1;
            ctx.strokeRect((seekX + 0.5) | 0, (seekY + 0.5) | 0, seekW | 0, seekH | 0);

            ctx.fillStyle = getMusicPlayerSeekGradient(seekX, seekW, accent);
            ctx.fillRect((seekX + 2) | 0, (seekY + 2) | 0, Math.max(0, (seekW - 4) * fillRatio) | 0, Math.max(0, seekH - 4) | 0);
            if (status.loopStart > 0 && status.loopStart < status.duration) {
                const markerX = seekX + seekW * (status.loopStart / duration);
                ctx.strokeStyle = colorWithAlpha('#ffffff', 0.46);
                ctx.beginPath();
                ctx.moveTo(markerX | 0, seekY - 4);
                ctx.lineTo(markerX | 0, seekY + seekH + 4);
                ctx.stroke();
            }
            const handleX = seekX + seekW * fillRatio;
            ctx.fillStyle = seekSelected ? '#ffffff' : colorWithAlpha('#dcecff', 0.78);
            if (glowEnabled && seekSelected) {
                ctx.shadowColor = accent;
                ctx.shadowBlur = 10 + pulse * 8;
            }
            ctx.fillRect((handleX - 2) | 0, (seekY - 3) | 0, 4, seekH + 6);
            ctx.shadowBlur = 0;

            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#dcecff', 0.76);
            ctx.textAlign = 'left';
            ctx.fillText(status.positionText, seekX, seekY + 30);
            ctx.textAlign = 'right';
            ctx.fillText(status.durationText, seekX + seekW, seekY + 30);

            const rowY = panelY + 230;
            const buttonW = 58;
            const buttonH = 28;
            const gap = 8;
            const buttonsTotal = buttonW * 3 + gap * 2;
            const rowX = Math.round(panelX + (panelW - buttonsTotal) / 2);
            drawMusicPlayerButton('|<', rowX, rowY, buttonW, buttonH, status.selection === 1, accent);
            drawMusicPlayerButton(status.isPlaying ? 'PAUSE' : 'PLAY', rowX + buttonW + gap, rowY, buttonW, buttonH, status.selection === 2, accent);
            drawMusicPlayerButton('>|', rowX + (buttonW + gap) * 2, rowY, buttonW, buttonH, status.selection === 3, accent);

            const volumeW = Math.min(272, panelW - pad * 2);
            const volumeH = 24;
            const volX = Math.round(panelX + (panelW - volumeW) / 2);
            const volY = rowY + buttonH + 7;
            const volSelected = status.selection === 4;
            ctx.save();
            ctx.fillStyle = volSelected ? colorWithAlpha(accent, 0.18 + pulse * 0.07) : 'rgba(5, 12, 24, 0.58)';
            ctx.fillRect(volX | 0, volY | 0, volumeW | 0, volumeH | 0);
            ctx.strokeStyle = volSelected ? mixColor(accent, '#ffffff', 0.38) : colorWithAlpha(accent, 0.34);
            ctx.lineWidth = volSelected ? 2 : 1;
            if (glowEnabled && volSelected) {
                ctx.shadowColor = accent;
                ctx.shadowBlur = 10 + pulse * 8;
            }
            ctx.strokeRect((volX + 0.5) | 0, (volY + 0.5) | 0, volumeW | 0, volumeH | 0);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.fillStyle = volSelected ? mixColor(accent, '#ffffff', 0.6) : colorWithAlpha('#dcecff', 0.76);
            ctx.fillText('VOL', volX + 10, volY + volumeH / 2 + 1);
            const percentText = `${Math.round(status.volume * 100)}%`;
            const meterX = volX + 50;
            const meterY = volY + Math.round((volumeH - 8) / 2);
            const meterW = volumeW - 102;
            ctx.fillStyle = 'rgba(2, 7, 16, 0.8)';
            ctx.fillRect(meterX, meterY, meterW, 8);
            ctx.fillStyle = colorWithAlpha(accent, 0.82);
            ctx.fillRect(meterX, meterY, Math.max(0, meterW * status.volume), 8);
            ctx.strokeStyle = colorWithAlpha('#ffffff', 0.24);
            ctx.strokeRect((meterX + 0.5) | 0, (meterY + 0.5) | 0, meterW | 0, 8);
            ctx.textAlign = 'right';
            ctx.font = `bold 10px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.74);
            ctx.fillText(percentText, volX + volumeW - 10, volY + volumeH / 2 + 1);
            ctx.restore();

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
            const hubMode = typeof shipSelectReturnState !== 'undefined' && shipSelectReturnState === 'GALAXY_SELECT';
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
            ctx.fillText(hubMode ? 'TERMINAL' : 'HANGAR SELECT', width / 2, height * 0.12);

            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#8fb9c8';
            ctx.shadowBlur = 0;
            ctx.fillText(hubMode ? 'ASCII AIRLINES FLEET HUB' : 'RUN FRAME ONLINE', width / 2, height * 0.155);

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

        let galaxyCtx = ctx;
        const GALAXY_SELECT_STAR_GLYPHS = ['.', "'", '·', '∙'];
        const GALAXY_SELECT_BG_STARS = Array.from({ length: 286 }, (_, i) => {
            const a = Math.sin((i + 1) * 12.9898) * 43758.5453;
            const b = Math.sin((i + 1) * 78.233) * 24634.6345;
            const c = Math.sin((i + 1) * 39.425) * 12645.3452;
            const d = Math.sin((i + 1) * 91.731) * 9152.7345;
            const e = Math.sin((i + 1) * 18.519) * 5317.719;
            const brightness = e - Math.floor(e);
            return {
                x: a - Math.floor(a),
                y: b - Math.floor(b),
                size: 5 + Math.floor((c - Math.floor(c)) * 8),
                alpha: 0.14 + brightness * 0.44,
                phase: (d - Math.floor(d)) * Math.PI * 2,
                speed: 0.00062 + brightness * 0.0013,
                glyph: GALAXY_SELECT_STAR_GLYPHS[i % GALAXY_SELECT_STAR_GLYPHS.length],
                font: `bold ${5 + Math.floor((c - Math.floor(c)) * 8)}px Courier New`,
                bright: brightness > 0.88
            };
        });

        const GALAXY_SELECT_ASTEROIDS = Array.from({ length: 82 }, (_, i) => {
            const a = galaxyNoise(701, i);
            const b = galaxyNoise(709, i);
            const c = galaxyNoise(719, i);
            return {
                x: a,
                lane: b,
                size: 5 + Math.floor(c * 8),
                alpha: 0.08 + galaxyNoise(727, i) * 0.18,
                speed: 0.010 + galaxyNoise(733, i) * 0.018,
                glyph: c > 0.74 ? 'o' : (c > 0.48 ? '·' : '.')
            };
        });

        const GALAXY_SELECT_DATA_BUS_GLYPHS = ['01', '10', '[]', '::', '==', '|', '<>', '0x'];
        const GALAXY_SELECT_DATA_BUS_PACKETS = Array.from({ length: 28 }, (_, i) => ({
            x: galaxyNoise(1201, i),
            lane: galaxyNoise(1213, i),
            speed: 0.018 + galaxyNoise(1223, i) * 0.032,
            alpha: 0.08 + galaxyNoise(1231, i) * 0.18,
            glyph: GALAXY_SELECT_DATA_BUS_GLYPHS[i % GALAXY_SELECT_DATA_BUS_GLYPHS.length],
            phase: galaxyNoise(1249, i) * Math.PI * 2
        }));

        const GALAXY_SELECT_CIRCUIT_TRACES = Array.from({ length: 18 }, (_, i) => {
            const x = 0.08 + galaxyNoise(1301, i) * 0.84;
            const y = 0.15 + galaxyNoise(1319, i) * 0.66;
            const lengthA = (galaxyNoise(1337, i) - 0.5) * 0.16;
            const lengthB = (galaxyNoise(1361, i) - 0.5) * 0.12;
            return {
                x,
                y,
                horizontalFirst: galaxyNoise(1327, i) > 0.5,
                a: Math.abs(lengthA) < 0.045 ? Math.sign(lengthA || 1) * 0.07 : lengthA,
                b: Math.abs(lengthB) < 0.036 ? Math.sign(lengthB || 1) * 0.055 : lengthB,
                alpha: 0.035 + galaxyNoise(1381, i) * 0.055,
                phase: galaxyNoise(1399, i) * Math.PI * 2,
                color: galaxyNoise(1409, i) > 0.52 ? '#4fb6ff' : '#38d86f'
            };
        });

        const GALAXY_SELECT_HEX_FRAGMENTS = Array.from({ length: 16 }, (_, i) => ({
            x: 0.08 + galaxyNoise(1423, i) * 0.84,
            y: 0.14 + galaxyNoise(1439, i) * 0.68,
            size: 9 + galaxyNoise(1451, i) * 18,
            alpha: 0.018 + galaxyNoise(1459, i) * 0.036,
            phase: galaxyNoise(1471, i) * Math.PI * 2,
            color: galaxyNoise(1481, i) > 0.55 ? '#6aa8ff' : '#9bffcf'
        }));

        const GALAXY_SELECT_MATH_MARKS = ['0x1F', 'CRC', 'FFT', 'LAMBDA', 'SIGMA', 'theta', 'x/y', 'A*', 'mod', 'bus', 'ptr', 'clk'];
        const GALAXY_SELECT_MATH_OVERLAYS = Array.from({ length: 34 }, (_, i) => ({
            x: galaxyNoise(1501, i),
            y: galaxyNoise(1511, i),
            text: GALAXY_SELECT_MATH_MARKS[i % GALAXY_SELECT_MATH_MARKS.length],
            alpha: 0.035 + galaxyNoise(1523, i) * 0.055,
            speed: 0.000018 + galaxyNoise(1531, i) * 0.000034,
            phase: galaxyNoise(1543, i) * Math.PI * 2,
            fontSize: 7 + Math.floor(galaxyNoise(1553, i) * 4),
            color: galaxyNoise(1567, i) > 0.5 ? '#8db7ff' : '#8ff7ff'
        }));

        const GALAXY_SELECT_LOCK_MESSAGES = ['ACCESS DENIED', 'CHECKSUM FAIL', 'PERMISSION 000', 'ROUTE SEALED'];

        const GALAXY_SELECT_DEFAULT_LAYOUT = [
            { x: 0.448, y: 0.467, scale: 1.04, axis: -0.535, tilt: 0.46, spinDir: 1, spinSpeed: 0.96, cursorAngle: -0.72 },
            { x: 0.528, y: 0.259, scale: 1.02, axis: 0.895, tilt: 0.36, spinDir: -1, spinSpeed: 1.14, cursorAngle: 0.58 },
            { x: 0.791, y: 0.364, scale: 1.02, axis: -0.105, tilt: 0.57, spinDir: 1, spinSpeed: 0.82, cursorAngle: 0.48 },
            { x: 0.506, y: 0.7, scale: 1.08, axis: 0.32, tilt: 0.36, spinDir: -1, spinSpeed: 1.02, cursorAngle: 2.38 },
            { x: 0.823, y: 0.692, scale: 1.37, axis: -1.02, tilt: 0.4, spinDir: 1, spinSpeed: 0.78, cursorAngle: 1.64 },
            { x: 0.632, y: 0.54, scale: 0.88, axis: 0.3, tilt: 0.6, spinDir: -1, spinSpeed: 1.22, cursorAngle: 0.96 },
            { x: 0.215, y: 0.328, scale: 1.12, axis: 1.04, tilt: 0.72, spinDir: 1, spinSpeed: 1.42, cursorAngle: 2.36, prism: true },
            { x: 0.168, y: 0.626, scale: 0.7, axis: 0.005, tilt: 0.42, spinDir: -1, spinSpeed: 0.88, cursorAngle: 3.142, hub: true }
        ];
        const GALAXY_SELECT_LAYOUT = GALAXY_SELECT_DEFAULT_LAYOUT.map(profile => ({ ...profile }));
        const GALAXY_LAYOUT_STORAGE_KEY = 'ascii_galaxy_select_layout_v2';
        const GALAXY_LAYOUT_STORAGE_SCHEMA_VERSION = 2;
        const GALAXY_LAYOUT_DEFAULT_VERSION = '2026-05-13-galaxy-select-layout-2';
        const GALAXY_LAYOUT_LEGACY_STORAGE_KEYS = ['ascii_galaxy_select_layout_v1'];
        let galaxyLayoutEditMode = false;
        let galaxyLayoutHoverIndex = -1;
        let galaxyLayoutDragState = {
            active: false,
            index: -1,
            offsetX: 0,
            offsetY: 0
        };
        const GALAXY_SELECT_CURSOR_RANDOM_CANDIDATES = 12;
        const GALAXY_SELECT_CURSOR_REST_BASE_OFFSET = 14;
        const GALAXY_SELECT_CURSOR_REST_RANDOM_OFFSET = 10;
        const GALAXY_SELECT_CURSOR_APPROACH_BASE_OFFSET = 34;
        const GALAXY_SELECT_CURSOR_APPROACH_RANDOM_OFFSET = 20;
        const GALAXY_WARP_STREAK_COUNT = 34;
        const GALAXY_WARP_HANDOFF_STREAK_COUNT = 16;
        const GALAXY_WARP_FOCUSED_DETAIL = 1;
        const GALAXY_WARP_FOCUSED_FONT_SCALE = 1;
        const GALAXY_WARP_SPRITE_CACHE_FPS = 72;
        const GALAXY_CURSOR_TRAIL_MAX = 44;
        let galaxySelectCursorRestPose = {
            index: -1,
            token: 0,
            angle: 0,
            distanceNoise: 0,
            approachNoise: 0,
            bendNoise: 0,
            scaleNoise: 0
        };
        const GALAXY_SPRITE_POINT_CACHE = new Map();
        const galaxySpriteDrawScratch = [];
        const galaxySelectBgGradientCache = {
            width: 0,
            height: 0,
            gradient: null
        };
        const galaxySelectBackgroundFrameCache = {
            width: 0,
            height: 0,
            bucket: -1,
            canvas: null
        };
        const galaxyWarpMenuSnapshotCache = {
            width: 0,
            height: 0,
            selectedIndex: -1,
            shipKey: '',
            stamp: 0,
            canvas: null
        };
        const galaxyWarpExactGlyphLayerCache = {
            width: 0,
            height: 0,
            canvas: null,
            drawKey: '',
            drawn: false
        };
        const GALAXY_SELECT_BACKGROUND_CACHE_FPS = 36;
        const GALAXY_SELECT_SPRITE_CACHE_FPS_SELECTED = 54;
        const GALAXY_SELECT_SPRITE_CACHE_FPS_IDLE = 36;
        const GALAXY_SELECT_SPRITE_CACHE_FPS_GLYPH_HEAVY_SELECTED = 48;
        const GALAXY_SELECT_SPRITE_CACHE_FPS_GLYPH_HEAVY_IDLE = 32;
        const GALAXY_SELECT_SPRITE_CACHE_MAX = 96;
        const GALAXY_SELECT_INTRO_REVEAL_DURATION = 860;
        const GALAXY_SELECT_INTRO_CURSOR_START_MARGIN = 56;
        const PRISM_ARRAY_ANIMATION_SPEED_SCALE = 0.5;
        const PRISM_ARRAY_OUTER_RING_DENSITY_SCALE = 1;
        const PRISM_ARRAY_BODY_CLUSTER_INNER_RADIUS = 0.16;
        const PRISM_ARRAY_BODY_CLUSTER_SPAN = 0.68;
        const PRISM_ARRAY_OUTER_GLYPH_CACHE_MAX = 160;
        const galaxySelectSpriteFrameCache = new Map();
        const prismArrayOuterGlyphCache = new Map();
        const galaxySelectIntroContentLayer = {
            width: 0,
            height: 0,
            canvas: null,
            ctx: null
        };
        let galaxySelectIntroRevealStart = null;
        let galaxySelectIntroRevealComplete = false;
        let galaxySelectIntroCursorPrimed = false;
        const TENSOR_MIRAGE_FIELD_GLYPHS = [
            '\u2297', '\u03BB', '\u2207', '\u2202', '\u03A3', '\u0394', '\u03C0', '\u00D7',
            'x', 'y', 'z', 'w', 'i', 'j', 'k', 'T', 'M', '[]', '<>', '::', '//', 'x/y'
        ];
        const MATRIX_NEBULA_KATAKANA_GLYPHS = [
            '\uFF66', '\uFF67', '\uFF68', '\uFF69', '\uFF6A', '\uFF6B', '\uFF6C', '\uFF6D',
            '\uFF6E', '\uFF6F', '\uFF70', '\uFF71', '\uFF72', '\uFF73', '\uFF74', '\uFF75',
            '\uFF76', '\uFF77', '\uFF78', '\uFF79', '\uFF7A', '\uFF7B', '\uFF7C', '\uFF7D',
            '\uFF7E', '\uFF7F', '\uFF80', '\uFF81', '\uFF82', '\uFF83', '\uFF84', '\uFF85',
            '\uFF86', '\uFF87', '\uFF88', '\uFF89', '\uFF8A', '\uFF8B', '\uFF8C', '\uFF8D',
            '\uFF8E', '\uFF8F', '\uFF90', '\uFF91', '\uFF92', '\uFF93', '\uFF94', '\uFF95',
            '\uFF96', '\uFF97', '\uFF98', '\uFF99', '\uFF9A', '\uFF9B', '\uFF9C', '\uFF9D'
        ];
        const MATRIX_NEBULA_LATIN_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const MATRIX_NEBULA_NUMERIC_GLYPHS = '0123456789'.split('');
        const MATRIX_NEBULA_SYMBOL_GLYPHS = ['+', '-', '*', '/', '\\', '=', '<', '>', ':', ';', '.', '|'];
        const MATRIX_NEBULA_RAIN_GLYPHS = [
            ...MATRIX_NEBULA_KATAKANA_GLYPHS,
            ...MATRIX_NEBULA_KATAKANA_GLYPHS,
            ...MATRIX_NEBULA_LATIN_GLYPHS,
            ...MATRIX_NEBULA_NUMERIC_GLYPHS,
            ...MATRIX_NEBULA_SYMBOL_GLYPHS
        ];
        const galaxySelectHighlightState = new Map();
        const galaxySpriteBloomScratch = {
            width: 0,
            height: 0,
            canvas: null,
            ctx: null
        };

        function invalidateGraphicsRenderCaches() {
            pauseGlowTextCache.clear();
            GALAXY_SPRITE_POINT_CACHE.clear();
            galaxySelectSpriteFrameCache.clear();
            prismArrayOuterGlyphCache.clear();
            galaxySelectIntroContentLayer.width = 0;
            galaxySelectIntroContentLayer.height = 0;
            galaxySelectIntroContentLayer.canvas = null;
            galaxySelectIntroContentLayer.ctx = null;
            galaxySelectBackgroundFrameCache.bucket = -1;
            galaxySelectBackgroundFrameCache.canvas = null;
            pauseMenuBackdropGradientCache.gradient = null;
            musicPlayerGradientCache.signalKey = '';
            musicPlayerGradientCache.signalGradient = null;
            musicPlayerGradientCache.seekKey = '';
            musicPlayerGradientCache.seekGradient = null;
            musicPlayerBassCoreState.x = 0;
            musicPlayerBassCoreState.y = 0;
            musicPlayerBassCoreState.vx = 0;
            musicPlayerBassCoreState.vy = 0;
            musicPlayerBassCoreState.lastBass = 0;
            musicPlayerBassCoreState.impact = 0;
            musicPlayerBassCoreState.lastNow = 0;
            galaxyWarpMenuSnapshotCache.canvas = null;
            galaxyWarpMenuSnapshotCache.stamp = 0;
            galaxyWarpExactGlyphLayerCache.drawKey = '';
            galaxyWarpExactGlyphLayerCache.drawn = false;
            galaxySpriteBloomScratch.width = 0;
            galaxySpriteBloomScratch.height = 0;
            galaxySpriteBloomScratch.canvas = null;
            galaxySpriteBloomScratch.ctx = null;
        }

        function galaxyNoise(seed, n) {
            const v = Math.sin((seed + 1) * 127.1 + n * 311.7) * 43758.5453123;
            return v - Math.floor(v);
        }

        function clampGalaxySelectHighlight(value) {
            return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
        }

        function easeGalaxySelectHighlight(value) {
            const t = clampGalaxySelectHighlight(value);
            return 1 - Math.pow(1 - t, 3);
        }

        function getGalaxyOptionHighlightAmount(options, selected) {
            return clampGalaxySelectHighlight(
                options && Number.isFinite(options.highlightAmount)
                    ? options.highlightAmount
                    : (selected ? 1 : 0)
            );
        }

        function getGalaxySelectHighlightAmount(index, selected, now) {
            const target = selected ? 1 : 0;
            let state = galaxySelectHighlightState.get(index);
            if (!state) {
                state = { value: target, lastNow: now || performance.now() };
                galaxySelectHighlightState.set(index, state);
                return easeGalaxySelectHighlight(state.value);
            }
            const frameNow = Number.isFinite(now) ? now : performance.now();
            const dt = Math.max(0, Math.min(0.05, (frameNow - state.lastNow) / 1000));
            const speed = target > state.value ? 16 : 11;
            const step = 1 - Math.exp(-speed * dt);
            state.value += (target - state.value) * step;
            if (Math.abs(target - state.value) < 0.003) state.value = target;
            state.lastNow = frameNow;
            return easeGalaxySelectHighlight(state.value);
        }

        function getGalaxySelectHighlightPulse(index, now, highlightAmount) {
            const highlight = clampGalaxySelectHighlight(highlightAmount);
            if (highlight <= 0.01) return 0;
            return highlight * (0.5 + Math.sin(now * 0.0028 + index * 0.83) * 0.5);
        }

        function clampGalaxyLayoutCoord(value, min, max) {
            const numeric = Number(value);
            if (!Number.isFinite(numeric)) return min;
            return Math.max(min, Math.min(max, numeric));
        }

        function clampGalaxyLayoutScale(value) {
            return clampGalaxyLayoutCoord(value, 0.52, 1.58);
        }

        function wrapGalaxyLayoutAxis(value) {
            let numeric = Number(value);
            if (!Number.isFinite(numeric)) return 0;
            while (numeric > Math.PI) numeric -= Math.PI * 2;
            while (numeric < -Math.PI) numeric += Math.PI * 2;
            return numeric;
        }

        function applyGalaxySelectLayoutPositions(positions) {
            if (!Array.isArray(positions)) return false;
            let applied = false;
            const count = Math.min(positions.length, GALAXY_SELECT_LAYOUT.length);
            for (let i = 0; i < count; i++) {
                const pos = positions[i];
                if (!pos || !Number.isFinite(Number(pos.x)) || !Number.isFinite(Number(pos.y))) continue;
                GALAXY_SELECT_LAYOUT[i].x = clampGalaxyLayoutCoord(pos.x, 0.07, 0.93);
                GALAXY_SELECT_LAYOUT[i].y = clampGalaxyLayoutCoord(pos.y, 0.16, 0.80);
                if (Number.isFinite(Number(pos.scale))) GALAXY_SELECT_LAYOUT[i].scale = clampGalaxyLayoutScale(pos.scale);
                if (Number.isFinite(Number(pos.axis))) GALAXY_SELECT_LAYOUT[i].axis = wrapGalaxyLayoutAxis(pos.axis);
                applied = true;
            }
            return applied;
        }

        function clearLegacyGalaxySelectLayoutDrafts() {
            try {
                for (const key of GALAXY_LAYOUT_LEGACY_STORAGE_KEYS) {
                    localStorage.removeItem(key);
                }
            } catch (_) {}
        }

        function parseGalaxySelectLayoutDraft(stored) {
            const draft = JSON.parse(stored);
            if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return null;
            if (draft.schemaVersion !== GALAXY_LAYOUT_STORAGE_SCHEMA_VERSION) return null;
            if (draft.defaultVersion !== GALAXY_LAYOUT_DEFAULT_VERSION) return null;
            return Array.isArray(draft.positions) ? draft.positions : null;
        }

        function loadGalaxySelectLayoutDraft() {
            try {
                clearLegacyGalaxySelectLayoutDrafts();
                const stored = localStorage.getItem(GALAXY_LAYOUT_STORAGE_KEY);
                if (!stored) return false;
                const positions = parseGalaxySelectLayoutDraft(stored);
                if (!positions) {
                    localStorage.removeItem(GALAXY_LAYOUT_STORAGE_KEY);
                    return false;
                }
                return applyGalaxySelectLayoutPositions(positions);
            } catch (_) {
                return false;
            }
        }

        function saveGalaxySelectLayoutDraft() {
            try {
                const positions = GALAXY_SELECT_LAYOUT.map(profile => ({
                    x: Number(profile.x.toFixed(4)),
                    y: Number(profile.y.toFixed(4)),
                    scale: Number(profile.scale.toFixed(4)),
                    axis: Number(profile.axis.toFixed(4))
                }));
                localStorage.setItem(GALAXY_LAYOUT_STORAGE_KEY, JSON.stringify({
                    schemaVersion: GALAXY_LAYOUT_STORAGE_SCHEMA_VERSION,
                    defaultVersion: GALAXY_LAYOUT_DEFAULT_VERSION,
                    positions
                }));
                return true;
            } catch (_) {
                return false;
            }
        }

        function resetGalaxySelectLayoutDraft() {
            for (let i = 0; i < GALAXY_SELECT_LAYOUT.length; i++) {
                GALAXY_SELECT_LAYOUT[i].x = GALAXY_SELECT_DEFAULT_LAYOUT[i].x;
                GALAXY_SELECT_LAYOUT[i].y = GALAXY_SELECT_DEFAULT_LAYOUT[i].y;
                GALAXY_SELECT_LAYOUT[i].scale = GALAXY_SELECT_DEFAULT_LAYOUT[i].scale;
                GALAXY_SELECT_LAYOUT[i].axis = GALAXY_SELECT_DEFAULT_LAYOUT[i].axis;
            }
            try {
                localStorage.removeItem(GALAXY_LAYOUT_STORAGE_KEY);
                clearLegacyGalaxySelectLayoutDrafts();
            } catch (_) {}
            galaxyLayoutDragState.active = false;
            galaxyLayoutDragState.index = -1;
            if (typeof resetPauseMenuShipCursor === 'function') resetPauseMenuShipCursor();
            return true;
        }

        function formatGalaxyLayoutNumber(value) {
            return (Math.round(Number(value) * 1000) / 1000).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
        }

        function formatGalaxySelectLayoutForFile() {
            const lines = ['const GALAXY_SELECT_LAYOUT = ['];
            for (let i = 0; i < GALAXY_SELECT_LAYOUT.length; i++) {
                const profile = GALAXY_SELECT_LAYOUT[i];
                const parts = [
                    `x: ${formatGalaxyLayoutNumber(profile.x)}`,
                    `y: ${formatGalaxyLayoutNumber(profile.y)}`,
                    `scale: ${formatGalaxyLayoutNumber(profile.scale)}`,
                    `axis: ${formatGalaxyLayoutNumber(profile.axis)}`,
                    `tilt: ${formatGalaxyLayoutNumber(profile.tilt)}`,
                    `spinDir: ${profile.spinDir}`,
                    `spinSpeed: ${formatGalaxyLayoutNumber(profile.spinSpeed)}`,
                    `cursorAngle: ${formatGalaxyLayoutNumber(profile.cursorAngle)}`
                ];
                if (profile.prism) parts.push('prism: true');
                if (profile.hub) parts.push('hub: true');
                lines.push(`    { ${parts.join(', ')} }${i === GALAXY_SELECT_LAYOUT.length - 1 ? '' : ','}`);
            }
            lines.push('];');
            return lines.join('\n');
        }

        function setGalaxyLayoutEditorEnabled(enabled) {
            galaxyLayoutEditMode = !!enabled;
            galaxyLayoutDragState.active = false;
            galaxyLayoutDragState.index = -1;
            galaxyLayoutHoverIndex = -1;
            if (galaxyLayoutEditMode && gameState === 'PAUSED' && pauseReturnState === 'GALAXY_SELECT' && typeof resumeFromPauseMode === 'function') {
                resumeFromPauseMode();
            }
            return galaxyLayoutEditMode;
        }

        function getGalaxyLayoutEditorHelpLines() {
            return [
                'layout on/off : toggle drag editor',
                'Drag nodes to move them on galaxy select',
                'Mouse wheel scales hovered/dragged node',
                'Shift + mouse wheel rotates hovered/dragged node',
                'layout copy : copy/paste layout block',
                'layout reset : restore default coordinates',
                'Draft saves locally in this browser'
            ];
        }

        function getGalaxyLayoutEditorHitIndex(x, y) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [];
            const count = Math.min(galaxies.length || GALAXY_SELECT_LAYOUT.length, GALAXY_SELECT_LAYOUT.length);
            let bestIndex = -1;
            let bestDist = Infinity;
            for (let i = count - 1; i >= 0; i--) {
                const slot = getGalaxySelectSlot(i);
                const radius = getGalaxySelectRenderRadius(i, i === selectedGalaxyIndex);
                const dist = Math.hypot(x - slot.x, y - slot.y);
                const hitRadius = Math.max(42, radius * 0.86);
                if (dist <= hitRadius && dist < bestDist) {
                    bestIndex = i;
                    bestDist = dist;
                }
            }
            return bestIndex;
        }

        function updateGalaxyLayoutEditorHover() {
            if (!galaxyLayoutEditMode || gameState !== 'GALAXY_SELECT' || consoleOpen) {
                galaxyLayoutHoverIndex = -1;
                return;
            }
            galaxyLayoutHoverIndex = getGalaxyLayoutEditorHitIndex(mouse.x, mouse.y);
        }

        function handleGalaxyLayoutEditorMouseDown(x = mouse.x, y = mouse.y) {
            if (!galaxyLayoutEditMode || gameState !== 'GALAXY_SELECT' || consoleOpen) return false;
            const hitIndex = getGalaxyLayoutEditorHitIndex(x, y);
            if (hitIndex < 0) return false;
            const slot = getGalaxySelectSlot(hitIndex);
            galaxyLayoutDragState.active = true;
            galaxyLayoutDragState.index = hitIndex;
            galaxyLayoutDragState.offsetX = slot.x - x;
            galaxyLayoutDragState.offsetY = slot.y - y;
            galaxyLayoutHoverIndex = hitIndex;
            selectedGalaxyIndex = hitIndex;
            if (typeof resetPauseMenuShipCursor === 'function') resetPauseMenuShipCursor();
            return true;
        }

        function handleGalaxyLayoutEditorMouseMove(x = mouse.x, y = mouse.y) {
            if (!galaxyLayoutEditMode || gameState !== 'GALAXY_SELECT') return false;
            if (!galaxyLayoutDragState.active) {
                updateGalaxyLayoutEditorHover();
                return false;
            }
            const profile = GALAXY_SELECT_LAYOUT[galaxyLayoutDragState.index];
            if (!profile) return false;
            profile.x = clampGalaxyLayoutCoord((x + galaxyLayoutDragState.offsetX) / Math.max(1, width), 0.07, 0.93);
            profile.y = clampGalaxyLayoutCoord((y + galaxyLayoutDragState.offsetY) / Math.max(1, height), 0.16, 0.80);
            selectedGalaxyIndex = galaxyLayoutDragState.index;
            galaxyLayoutHoverIndex = galaxyLayoutDragState.index;
            saveGalaxySelectLayoutDraft();
            return true;
        }

        function handleGalaxyLayoutEditorMouseUp() {
            if (!galaxyLayoutEditMode || !galaxyLayoutDragState.active) return false;
            galaxyLayoutDragState.active = false;
            saveGalaxySelectLayoutDraft();
            return true;
        }

        function handleGalaxyLayoutEditorWheel(deltaY, options = {}, x = mouse.x, y = mouse.y) {
            if (!galaxyLayoutEditMode || gameState !== 'GALAXY_SELECT' || consoleOpen) return false;
            const targetIndex = galaxyLayoutDragState.active
                ? galaxyLayoutDragState.index
                : getGalaxyLayoutEditorHitIndex(x, y);
            if (targetIndex < 0) return false;
            const profile = GALAXY_SELECT_LAYOUT[targetIndex];
            if (!profile) return false;
            const direction = deltaY < 0 ? 1 : -1;
            if (options && options.shiftKey) {
                const rotationStep = (options.altKey ? 0.025 : 0.075) * direction;
                profile.axis = wrapGalaxyLayoutAxis(profile.axis + rotationStep);
            } else {
                const scaleStep = (options.altKey ? 0.015 : 0.04) * direction;
                profile.scale = clampGalaxyLayoutScale(profile.scale + scaleStep);
            }
            selectedGalaxyIndex = targetIndex;
            galaxyLayoutHoverIndex = targetIndex;
            saveGalaxySelectLayoutDraft();
            if (typeof resetPauseMenuShipCursor === 'function') resetPauseMenuShipCursor();
            return true;
        }

        loadGalaxySelectLayoutDraft();

        function getGalaxySpritePointSet(galaxy, index, count) {
            const arms = Math.max(2, galaxy.arms || 2);
            const seed = galaxy.seed || index * 17;
            const key = `${index}|${arms}|${seed}|${count}|${galaxy.twist || 2.8}`;
            const cached = GALAXY_SPRITE_POINT_CACHE.get(key);
            if (cached) return cached;

            const points = [];
            for (let i = 0; i < count; i++) {
                const arm = i % arms;
                const t = Math.pow((i + 1) / count, 0.72);
                points.push({
                    armAngle: (arm / arms) * Math.PI * 2,
                    t,
                    drift: galaxyNoise(seed, i) - 0.5,
                    radiusMul: (0.12 + t * 0.86) * (0.86 + galaxyNoise(seed + 3, i) * 0.22),
                    glyphIndex: Math.floor(galaxyNoise(seed + 18, i) * 1024),
                    glyph: t < 0.18 ? 'o' : (galaxyNoise(seed + 8, i) > 0.86 ? '+' : (galaxyNoise(seed + 11, i) > 0.64 ? '*' : (galaxyNoise(seed + 14, i) > 0.42 ? "'" : '.')))
                });
            }
            GALAXY_SPRITE_POINT_CACHE.set(key, points);
            return points;
        }

        function getGalaxyGlyph(galaxy, point, fallbackGlyph = '.') {
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length ? galaxy.glyphs : null;
            if (!glyphs) return point && point.glyph ? point.glyph : fallbackGlyph;
            const index = Math.abs((point && Number.isFinite(point.glyphIndex) ? point.glyphIndex : 0)) % glyphs.length;
            return glyphs[index] || fallbackGlyph;
        }

        function getGalaxyCoreGlyph(galaxy, fallbackGlyph = '@') {
            if (galaxy && galaxy.coreGlyph) return galaxy.coreGlyph;
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length ? galaxy.glyphs : null;
            return glyphs ? glyphs[0] : fallbackGlyph;
        }

        function getGalaxyCoreVoidGlyph(galaxy, fallbackGlyph = '.') {
            if (galaxy && galaxy.coreVoidGlyph) return galaxy.coreVoidGlyph;
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length > 1 ? galaxy.glyphs : null;
            return glyphs ? glyphs[1] : fallbackGlyph;
        }

        function mixGalaxyColor(colors, t) {
            if (!colors || colors.length === 0) return currentThemeColor;
            if (t < 0.34) return colors[0];
            if (t < 0.72) return colors[1] || colors[0];
            return colors[2] || colors[1] || colors[0];
        }

        function getGalaxyFontPx(size, options = {}) {
            const safeSize = Math.max(1, size || 1);
            return options && options.warp
                ? Math.round(safeSize * 10) / 10
                : Math.round(safeSize);
        }

        function getGalaxySelectBackgroundGradient() {
            if (
                galaxySelectBgGradientCache.gradient &&
                galaxySelectBgGradientCache.width === width &&
                galaxySelectBgGradientCache.height === height
            ) {
                return galaxySelectBgGradientCache.gradient;
            }
            const bg = galaxyCtx.createRadialGradient(width / 2, height * 0.45, 20, width / 2, height / 2, Math.max(width, height) * 0.72);
            bg.addColorStop(0, '#0a1632');
            bg.addColorStop(0.56, '#050b1d');
            bg.addColorStop(1, '#02050d');
            galaxySelectBgGradientCache.width = width;
            galaxySelectBgGradientCache.height = height;
            galaxySelectBgGradientCache.gradient = bg;
            return bg;
        }

        function getGalaxySelectSlot(index) {
            const profile = getGalaxyVisualProfile(index);
            const marginX = Math.max(86, width * 0.08);
            const minY = Math.max(116, height * 0.16);
            const maxY = Math.min(height * 0.80, height - 118);
            return {
                x: Math.max(marginX, Math.min(width - marginX, width * profile.x)),
                y: Math.max(minY, Math.min(maxY, height * profile.y))
            };
        }

        function getGalaxyVisualProfile(index) {
            return GALAXY_SELECT_LAYOUT[index % GALAXY_SELECT_LAYOUT.length] || GALAXY_SELECT_LAYOUT[0];
        }

        function getGalaxySelectDirectionalIndex(currentIndex, dirX, dirY) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [];
            const count = galaxies.length || GALAXY_SELECT_LAYOUT.length;
            if (count <= 1) return 0;
            const current = Math.max(0, Math.min(count - 1, currentIndex || 0));
            const from = getGalaxySelectSlot(current);
            const dirLen = Math.max(0.001, Math.hypot(dirX, dirY));
            const nx = dirX / dirLen;
            const ny = dirY / dirLen;
            let bestIndex = current;
            let bestScore = Infinity;
            let fallbackIndex = current;
            let fallbackScore = Infinity;

            for (let i = 0; i < count; i++) {
                if (i === current) continue;
                const slot = getGalaxySelectSlot(i);
                const dx = slot.x - from.x;
                const dy = slot.y - from.y;
                const dist = Math.max(0.001, Math.hypot(dx, dy));
                const forward = dx * nx + dy * ny;
                if (forward <= 6) continue;
                const alignment = forward / dist;
                const perpendicular = Math.abs(dx * ny - dy * nx);
                const score = forward + perpendicular * 1.35 - alignment * 12;
                const looseScore = forward + perpendicular * 1.9 - alignment * 8;
                if (looseScore < fallbackScore) {
                    fallbackScore = looseScore;
                    fallbackIndex = i;
                }
                if (alignment < 0.28) continue;
                if (score < bestScore) {
                    bestScore = score;
                    bestIndex = i;
                }
            }

            if (bestIndex !== current) return bestIndex;
            if (fallbackIndex !== current) return fallbackIndex;

            return current;
        }

        function getGalaxySelectRenderRadius(index, selected = false, highlightAmount = null) {
            const profile = getGalaxyVisualProfile(index);
            const galaxy = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS[index] : null;
            const baseRadius = Math.max(46, Math.min(82, Math.min(width, height) * 0.073));
            const survivorScale = galaxy && galaxy.mode === 'survivor' ? 0.94 : 1;
            const hubScale = galaxy && galaxy.mode === 'shipHub' ? 0.86 : 1;
            const highlight = Number.isFinite(highlightAmount) ? clampGalaxySelectHighlight(highlightAmount) : (selected ? 1 : 0);
            return baseRadius * profile.scale * survivorScale * hubScale * (0.94 + highlight * 0.20);
        }

        function drawGalaxySelectCircuitSubstrate(now) {
            const alphaPulse = 0.82 + Math.sin(now * 0.00065) * 0.18;
            galaxyCtx.save();
            galaxyCtx.lineWidth = 1;
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';

            for (let i = 0; i < GALAXY_SELECT_HEX_FRAGMENTS.length; i++) {
                const h = GALAXY_SELECT_HEX_FRAGMENTS[i];
                const x = h.x * width;
                const y = h.y * height;
                const r = h.size * (0.86 + Math.sin(now * 0.0005 + h.phase) * 0.05);
                galaxyCtx.globalAlpha = h.alpha * alphaPulse;
                galaxyCtx.strokeStyle = h.color;
                galaxyCtx.beginPath();
                for (let p = 0; p < 6; p++) {
                    const a = Math.PI / 6 + (Math.PI * 2 * p) / 6;
                    const px = x + Math.cos(a) * r;
                    const py = y + Math.sin(a) * r;
                    if (p === 0) galaxyCtx.moveTo(px, py);
                    else galaxyCtx.lineTo(px, py);
                }
                galaxyCtx.closePath();
                galaxyCtx.stroke();
            }

            for (let i = 0; i < GALAXY_SELECT_CIRCUIT_TRACES.length; i++) {
                const t = GALAXY_SELECT_CIRCUIT_TRACES[i];
                const x0 = t.x * width;
                const y0 = t.y * height;
                const x1 = x0 + (t.horizontalFirst ? t.a * width : 0);
                const y1 = y0 + (t.horizontalFirst ? 0 : t.a * height);
                const x2 = x1 + (t.horizontalFirst ? 0 : t.b * width);
                const y2 = y1 + (t.horizontalFirst ? t.b * height : 0);
                const pulse = 0.62 + Math.sin(now * 0.0012 + t.phase) * 0.38;
                galaxyCtx.globalAlpha = t.alpha * alphaPulse;
                galaxyCtx.strokeStyle = t.color;
                galaxyCtx.beginPath();
                galaxyCtx.moveTo(x0, y0);
                galaxyCtx.lineTo(x1, y1);
                galaxyCtx.lineTo(x2, y2);
                galaxyCtx.stroke();

                galaxyCtx.globalAlpha = t.alpha * (0.8 + pulse * 0.9);
                galaxyCtx.fillStyle = i % 3 === 0 ? '#f2fbff' : t.color;
                galaxyCtx.fillRect(x0 - 1.5, y0 - 1.5, 3, 3);
                galaxyCtx.fillRect(x2 - 1.5, y2 - 1.5, 3, 3);

                const packetT = (now * 0.00018 + i * 0.137) % 1;
                const onFirstLeg = packetT < 0.5;
                const legT = onFirstLeg ? packetT * 2 : (packetT - 0.5) * 2;
                const px = onFirstLeg ? x0 + (x1 - x0) * legT : x1 + (x2 - x1) * legT;
                const py = onFirstLeg ? y0 + (y1 - y0) * legT : y1 + (y2 - y1) * legT;
                galaxyCtx.globalAlpha = t.alpha * (1.3 + pulse);
                galaxyCtx.fillStyle = '#ffffff';
                galaxyCtx.fillRect(px - 1, py - 1, 2, 2);
            }

            for (let i = 0; i < GALAXY_SELECT_MATH_OVERLAYS.length; i++) {
                const m = GALAXY_SELECT_MATH_OVERLAYS[i];
                const driftX = Math.sin(now * m.speed + m.phase) * 5;
                const driftY = Math.cos(now * m.speed * 0.73 + m.phase) * 3;
                galaxyCtx.globalAlpha = m.alpha * (0.72 + Math.sin(now * 0.0009 + m.phase) * 0.20);
                galaxyCtx.fillStyle = m.color;
                galaxyCtx.font = `bold ${m.fontSize}px Courier New`;
                galaxyCtx.fillText(m.text, m.x * width + driftX, m.y * height + driftY);
            }

            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
        }

        function drawGalaxySelectAsteroidBelt(now) {
            const bandAngle = -0.28;
            const centerX = width * 0.5;
            const centerY = height * 0.51;
            const beltW = width * 1.28;
            const beltH = height * 0.16;
            const cos = Math.cos(bandAngle);
            const sin = Math.sin(bandAngle);
            galaxyCtx.save();
            galaxyCtx.translate(centerX, centerY);
            galaxyCtx.rotate(bandAngle);
            const bandGlow = galaxyCtx.createLinearGradient(-beltW / 2, 0, beltW / 2, 0);
            bandGlow.addColorStop(0, 'rgba(126, 166, 220, 0)');
            bandGlow.addColorStop(0.34, 'rgba(126, 166, 220, 0.018)');
            bandGlow.addColorStop(0.62, 'rgba(126, 166, 220, 0.012)');
            bandGlow.addColorStop(1, 'rgba(126, 166, 220, 0)');
            galaxyCtx.strokeStyle = bandGlow;
            galaxyCtx.lineWidth = Math.max(9, height * 0.014);
            galaxyCtx.beginPath();
            galaxyCtx.moveTo(-beltW / 2, 0);
            galaxyCtx.lineTo(beltW / 2, 0);
            galaxyCtx.stroke();
            galaxyCtx.restore();

            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            for (let i = 0; i < GALAXY_SELECT_ASTEROIDS.length; i++) {
                const a = GALAXY_SELECT_ASTEROIDS[i];
                const drift = ((a.x + now * 0.000018 * a.speed * 60) % 1.18) - 0.09;
                const lane = (a.lane - 0.5) * 2;
                const localX = (drift - 0.5) * beltW;
                const localY = lane * beltH * (0.18 + Math.abs(lane) * 0.38) + Math.sin(now * 0.00018 + i * 1.7) * 4;
                const x = centerX + localX * cos - localY * sin;
                const y = centerY + localX * sin + localY * cos;
                if (x < -30 || x > width + 30 || y < -30 || y > height + 30) continue;
                const depth = 1 - Math.min(1, Math.abs(lane));
                galaxyCtx.globalAlpha = a.alpha * (0.5 + depth * 0.7);
                galaxyCtx.fillStyle = depth > 0.5 ? '#8fa7c9' : '#52657d';
                galaxyCtx.font = `bold ${Math.max(4, a.size * (0.72 + depth * 0.42))}px Courier New`;
                galaxyCtx.fillText(a.glyph, x, y);
            }

            for (let i = 0; i < GALAXY_SELECT_DATA_BUS_PACKETS.length; i++) {
                const p = GALAXY_SELECT_DATA_BUS_PACKETS[i];
                const drift = ((p.x + now * 0.000018 * p.speed * 60) % 1.18) - 0.09;
                const lane = (p.lane - 0.5) * 2;
                const localX = (drift - 0.5) * beltW;
                const localY = lane * beltH * 0.38 + Math.sin(now * 0.00024 + p.phase) * 3;
                const x = centerX + localX * cos - localY * sin;
                const y = centerY + localX * sin + localY * cos;
                if (x < -70 || x > width + 70 || y < -50 || y > height + 50) continue;
                const pulse = 0.72 + Math.sin(now * 0.0014 + p.phase) * 0.28;
                galaxyCtx.globalAlpha = p.alpha * pulse;
                galaxyCtx.fillStyle = i % 4 === 0 ? '#f2fbff' : '#8ff7ff';
                galaxyCtx.font = `bold ${i % 4 === 0 ? 9 : 7}px Courier New`;
                galaxyCtx.fillText(p.glyph, x, y);
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
        }

        function drawGalaxySelectComets(now) {
            const cometConfigs = [
                { period: 14500, offset: 1800, seed: 801, angle: -0.34, color: '#c8f7ff' },
                { period: 21800, offset: 9300, seed: 911, angle: -0.62, color: '#ffe9a8' }
            ];
            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            for (let i = 0; i < cometConfigs.length; i++) {
                const cfg = cometConfigs[i];
                const cycleTime = (now + cfg.offset) % cfg.period;
                const activeWindow = cfg.period * 0.22;
                if (cycleTime > activeWindow) continue;
                const cycle = Math.floor((now + cfg.offset) / cfg.period);
                const progress = cycleTime / activeWindow;
                const ease = progress * progress * (3 - progress * 2);
                const startX = width * (-0.16 + galaxyNoise(cfg.seed + cycle, 1) * 0.22);
                const startY = height * (0.18 + galaxyNoise(cfg.seed + cycle, 2) * 0.48);
                const travel = width * (1.22 + galaxyNoise(cfg.seed + cycle, 3) * 0.20);
                const vx = Math.cos(cfg.angle) * travel;
                const vy = Math.sin(cfg.angle) * travel;
                const headX = startX + vx * ease;
                const headY = startY + vy * ease;
                const fade = Math.sin(progress * Math.PI);
                for (let j = 16; j >= 0; j--) {
                    const t = j / 16;
                    const px = headX - vx * 0.055 * t;
                    const py = headY - vy * 0.055 * t + Math.sin(now * 0.004 + j) * t * 1.4;
                    if (px < -80 || px > width + 80 || py < -80 || py > height + 80) continue;
                    const life = 1 - t;
                    galaxyCtx.globalAlpha = fade * (0.04 + life * 0.34);
                    galaxyCtx.fillStyle = j < 3 ? '#ffffff' : cfg.color;
                    galaxyCtx.shadowColor = cfg.color;
                    galaxyCtx.shadowBlur = glowEnabled ? 6 + life * 12 : 0;
                    galaxyCtx.font = `bold ${Math.max(5, 5 + life * 10)}px Courier New`;
                    galaxyCtx.fillText(j < 2 ? '*' : (j % 3 === 0 ? '+' : '.'), px, py);
                }
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
        }

        function getGalaxySelectCacheCanvas(cache, targetWidth, targetHeight) {
            if (!cache.canvas) cache.canvas = document.createElement('canvas');
            if (cache.canvas.width !== targetWidth || cache.canvas.height !== targetHeight) {
                cache.canvas.width = targetWidth;
                cache.canvas.height = targetHeight;
            }
            return cache.canvas;
        }

        function drawGalaxySelectBackgroundDirect(now) {
            galaxyCtx.fillStyle = getGalaxySelectBackgroundGradient();
            galaxyCtx.fillRect(0, 0, width, height);
            drawGalaxySelectCircuitSubstrate(now);

            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            for (let i = 0; i < GALAXY_SELECT_BG_STARS.length; i++) {
                const s = GALAXY_SELECT_BG_STARS[i];
                const twinkle = 0.66 + Math.sin(now * s.speed + s.phase) * 0.28 + Math.sin(now * s.speed * 0.37 + i) * 0.10;
                galaxyCtx.globalAlpha = s.alpha * twinkle;
                galaxyCtx.font = s.font;
                galaxyCtx.fillStyle = s.bright ? '#f0fbff' : (i % 9 === 0 ? '#8db7ff' : '#6f91c8');
                const driftX = Math.sin(now * 0.00007 + i) * (s.bright ? 1.2 : 0.5);
                const driftY = Math.cos(now * 0.00005 + i * 1.7) * (s.bright ? 0.9 : 0.4);
                galaxyCtx.fillText(s.glyph, s.x * width + driftX, s.y * height + driftY);
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            drawGalaxySelectAsteroidBelt(now);
            drawGalaxySelectComets(now);
        }

        function drawGalaxySelectBackground(now) {
            if (width <= 0 || height <= 0) return drawGalaxySelectBackgroundDirect(now);
            const bucketMs = 1000 / GALAXY_SELECT_BACKGROUND_CACHE_FPS;
            const bucket = Math.floor(now / bucketMs);
            const cache = galaxySelectBackgroundFrameCache;
            if (!cache.canvas || cache.width !== width || cache.height !== height || cache.bucket !== bucket) {
                const cacheCanvas = getGalaxySelectCacheCanvas(cache, width, height);
                const cacheCtx = cacheCanvas.getContext('2d', { alpha: false });
                if (!cacheCtx) return drawGalaxySelectBackgroundDirect(now);
                const previousCtx = galaxyCtx;
                galaxyCtx = cacheCtx;
                cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
                cacheCtx.globalAlpha = 1;
                cacheCtx.globalCompositeOperation = 'source-over';
                cacheCtx.shadowBlur = 0;
                try {
                    drawGalaxySelectBackgroundDirect(bucket * bucketMs);
                } finally {
                    galaxyCtx = previousCtx;
                }
                cache.width = width;
                cache.height = height;
                cache.bucket = bucket;
            }
            galaxyCtx.drawImage(cache.canvas, 0, 0);
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function getGalaxyRenderStyle(galaxy) {
            return (galaxy && (galaxy.visualStyle || galaxy.id)) || 'spiral';
        }

        function isPrismArrayGalaxySprite(galaxy) {
            return galaxy && (galaxy.mode === 'survivor' || getGalaxyRenderStyle(galaxy) === 'prismArray');
        }

        function getGalaxySpriteBloomScratch(widthPx, heightPx) {
            const w = Math.max(1, Math.ceil(widthPx || 1));
            const h = Math.max(1, Math.ceil(heightPx || 1));
            if (!galaxySpriteBloomScratch.canvas) {
                galaxySpriteBloomScratch.canvas = document.createElement('canvas');
            }
            if (galaxySpriteBloomScratch.width !== w || galaxySpriteBloomScratch.height !== h) {
                galaxySpriteBloomScratch.canvas.width = w;
                galaxySpriteBloomScratch.canvas.height = h;
                galaxySpriteBloomScratch.width = w;
                galaxySpriteBloomScratch.height = h;
                galaxySpriteBloomScratch.ctx = galaxySpriteBloomScratch.canvas.getContext('2d', { alpha: true });
            }
            return galaxySpriteBloomScratch.ctx ? galaxySpriteBloomScratch : null;
        }

        function applyGalaxySpriteBloom(targetCtx, sourceCanvas, highlightAmount = 1, strength = 1) {
            if (!targetCtx || !sourceCanvas || !('filter' in targetCtx)) return false;
            const scratch = getGalaxySpriteBloomScratch(sourceCanvas.width, sourceCanvas.height);
            if (!scratch || !scratch.ctx) return false;
            const highlight = clampGalaxySelectHighlight(highlightAmount);
            const bloomStrength = Math.max(0, strength || 0);
            scratch.ctx.setTransform(1, 0, 0, 1, 0, 0);
            scratch.ctx.clearRect(0, 0, scratch.width, scratch.height);
            scratch.ctx.globalAlpha = 1;
            scratch.ctx.globalCompositeOperation = 'source-over';
            scratch.ctx.filter = 'none';
            scratch.ctx.drawImage(sourceCanvas, 0, 0);

            targetCtx.save();
            targetCtx.globalCompositeOperation = 'lighter';
            targetCtx.globalAlpha = (0.22 + highlight * 0.22) * bloomStrength;
            targetCtx.filter = `blur(${Math.round(5 + highlight * 3)}px)`;
            targetCtx.drawImage(scratch.canvas, 0, 0);
            targetCtx.filter = 'none';
            targetCtx.globalAlpha = (0.08 + highlight * 0.08) * bloomStrength;
            targetCtx.drawImage(scratch.canvas, 0, 0);
            targetCtx.restore();
            return true;
        }

        function drawGalaxySoftAura(colors, radius, selected, alphaScale = 1, highlightAmount = null) {
            const highlight = Number.isFinite(highlightAmount) ? clampGalaxySelectHighlight(highlightAmount) : (selected ? 1 : 0);
            const aura = galaxyCtx.createRadialGradient(0, 0, radius * 0.08, 0, 0, radius * 1.35);
            aura.addColorStop(0, colorWithAlpha(colors[2] || colors[1] || '#ffffff', (0.10 + highlight * 0.08) * alphaScale));
            aura.addColorStop(0.42, colorWithAlpha(colors[1] || colors[0], (0.045 + highlight * 0.055) * alphaScale));
            aura.addColorStop(1, colorWithAlpha(colors[0], 0));
            galaxyCtx.fillStyle = aura;
            galaxyCtx.beginPath();
            galaxyCtx.arc(0, 0, radius * 1.36, 0, Math.PI * 2);
            galaxyCtx.fill();
        }

        function drawGalaxyCore(galaxy, colors, radius, selected, axis, tilt, options = {}) {
            const fontScale = options.fontScale || 1;
            const warpMode = !!options.warp;
            const available = !galaxy || galaxy.available !== false;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const coreAlphaScale = Number.isFinite(options.coreAlphaScale) ? options.coreAlphaScale : 1;
            const coreFontScale = Number.isFinite(options.coreFontScale) ? options.coreFontScale : 1;
            const coreShadowScale = Number.isFinite(options.coreShadowScale) ? options.coreShadowScale : 1;
            const coreVoidAlphaScale = Number.isFinite(options.coreVoidAlphaScale) ? options.coreVoidAlphaScale : 1;
            const baseAlpha = available ? (0.70 + highlight * 0.26) : (0.25 + highlight * 0.08);
            galaxyCtx.globalAlpha = baseAlpha * coreAlphaScale;
            galaxyCtx.fillStyle = (galaxy && galaxy.coreColor) || colors[2] || '#ffffff';
            galaxyCtx.shadowColor = (galaxy && galaxy.coreColor) || colors[2] || colors[0];
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (9 + highlight * 11) * fontScale * coreShadowScale : 0;
            galaxyCtx.save();
            galaxyCtx.rotate(axis * 0.45);
            galaxyCtx.scale(1, 0.78 + tilt * 0.24);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(10, (28 + highlight * 6) * fontScale * coreFontScale), options)}px Courier New`;
            galaxyCtx.fillText(getGalaxyCoreGlyph(galaxy, '@'), 0, 0);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, (13 + highlight * 3) * fontScale * coreFontScale), options)}px Courier New`;
            galaxyCtx.fillStyle = '#071026';
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalAlpha = baseAlpha * coreAlphaScale * coreVoidAlphaScale;
            galaxyCtx.fillText(getGalaxyCoreVoidGlyph(galaxy, '.'), 0, 0);
            galaxyCtx.restore();
        }

        function drawGalaxySpiralArms(galaxy, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#6aa8ff', '#ff5e8a', '#ffffff'];
            const style = getGalaxyRenderStyle(galaxy);
            const arms = Math.max(2, galaxy.arms || 2);
            const seed = galaxy.seed || index * 17;
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00009 + seed) * 0.035);
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const spinRate = options.warp ? 0.00008 : 0.00012;
            const spin = now * spinRate * (options.warp && selected ? 1.55 : 1) * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const brightness = galaxy.available ? (0.78 + highlight * 0.40) : (0.32 + highlight * 0.08);
            const tilt = options.tiltOverride ?? (profile.tilt || galaxy.tilt || 0.5);
            const cosAxis = Math.cos(axis);
            const sinAxis = Math.sin(axis);
            const twist = (galaxy.twist || 2.8) * Math.PI;
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const stepCount = Math.max(14, Math.round((34 + highlight * 8) * detail));
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length ? galaxy.glyphs : ['.', '*', '+'];
            const lineWobble = style === 'matrixNebula' ? 0.20 : 0.09;
            let lastFont = '';

            galaxyCtx.save();
            galaxyCtx.lineCap = 'round';
            for (let arm = 0; arm < arms; arm++) {
                const armAngle = (arm / arms) * Math.PI * 2;
                const armColor = colors[arm % colors.length] || colors[0];
                galaxyCtx.globalAlpha = (0.11 + highlight * 0.11) * brightness;
                galaxyCtx.strokeStyle = colorWithAlpha(armColor, style === 'matrixNebula' ? 0.38 : 0.52);
                galaxyCtx.lineWidth = Math.max(1, radius * (style === 'matrixNebula' ? 0.018 : 0.012));
                galaxyCtx.beginPath();
                for (let s = 0; s < stepCount; s++) {
                    const t = s / Math.max(1, stepCount - 1);
                    const radiusEase = Math.pow(t, style === 'bitshiftSphere' ? 0.58 : 0.72);
                    const noise = galaxyNoise(seed + arm * 31, s);
                    const gapPulse = Math.sin(t * Math.PI * (style === 'matrixNebula' ? 5.8 : 3.4) + now * 0.001 + arm);
                    const r = radius * (0.15 + radiusEase * 0.86) * (0.96 + gapPulse * 0.018 + (noise - 0.5) * lineWobble);
                    const angle = armAngle + t * twist + spin + (noise - 0.5) * 0.16;
                    const depth = 0.5 + Math.sin(angle) * 0.5;
                    const localX = Math.cos(angle) * r;
                    const localY = Math.sin(angle) * r * tilt + (depth - 0.5) * radius * 0.10;
                    const x = localX * cosAxis - localY * sinAxis;
                    const y = localX * sinAxis + localY * cosAxis;
                    if (s === 0) galaxyCtx.moveTo(x, y);
                    else galaxyCtx.lineTo(x, y);
                }
                galaxyCtx.stroke();

                for (let s = 0; s < stepCount; s++) {
                    const t = s / Math.max(1, stepCount - 1);
                    const radiusEase = Math.pow(t, style === 'bitshiftSphere' ? 0.58 : 0.72);
                    const noise = galaxyNoise(seed + arm * 43, s);
                    const skip = style === 'matrixNebula' && noise < 0.18 && t > 0.24;
                    if (skip) continue;
                    const r = radius * (0.15 + radiusEase * 0.86) * (0.92 + (noise - 0.5) * (style === 'matrixNebula' ? 0.24 : 0.10));
                    const angle = armAngle + t * twist + spin + (noise - 0.5) * 0.22;
                    const depth = 0.5 + Math.sin(angle) * 0.5;
                    const localX = Math.cos(angle) * r;
                    const localY = Math.sin(angle) * r * tilt + (depth - 0.5) * radius * 0.10;
                    const perspective = 0.74 + depth * 0.42;
                    const x = (localX * cosAxis - localY * sinAxis) * perspective;
                    const y = (localX * sinAxis + localY * cosAxis) * perspective;
                    const fontSize = getGalaxyFontPx(Math.max(6, (7 + (1 - t) * 9 + depth * 4) * (0.95 + highlight * 0.10) * fontScale), options);
                    const nextFont = `bold ${fontSize}px Courier New`;
                    if (nextFont !== lastFont) {
                        galaxyCtx.font = nextFont;
                        lastFont = nextFont;
                    }
                    const colorT = depth * 0.42 + (1 - t) * 0.58;
                    const quasarCenterDamp = style === 'binaryQuasar' ? (0.38 + t * 0.62) : 1;
                    galaxyCtx.globalAlpha = Math.min(1, (0.16 + depth * 0.40 + (1 - t) * 0.18) * brightness * quasarCenterDamp);
                    galaxyCtx.fillStyle = noise > 0.94 ? '#ffffff' : mixGalaxyColor(colors, colorT);
                    galaxyCtx.fillText(getGalaxyGlyph(galaxy, { glyphIndex: Math.floor(noise * 1024), glyph: glyphs[s % glyphs.length] }, glyphs[s % glyphs.length]), x, y);
                }
            }
            galaxyCtx.restore();
        }

        function drawBinaryQuasarJet(galaxy, radius, axis, now, selected, options = {}) {
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length ? galaxy.glyphs : ['0', '1'];
            const colors = galaxy && galaxy.colors ? galaxy.colors : ['#dcecff', '#8fa7c9', '#ffffff'];
            const seed = galaxy && Number.isFinite(galaxy.seed) ? galaxy.seed : 11;
            const jetAngle = axis - Math.PI / 2;
            const pulse = 0.58 + Math.sin(now * 0.0024) * 0.22;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const strandCount = Math.max(4, Math.round((4.6 + highlight * 0.7) * detail));
            const shimmerCount = Math.max(2, Math.round((2.7 + highlight * 0.5) * detail));
            const strandPoint = (side, strand, t, extension = 0) => {
                const offsetIndex = strand - (strandCount - 1) / 2;
                const offset = offsetIndex * 0.047 + (galaxyNoise(seed + 211, strand) - 0.5) * 0.018;
                const drift = Math.sin(now * 0.00026 + side * 1.9 + strand * 0.73) * 0.010;
                const angle = jetAngle + offset + drift;
                const dx = Math.cos(angle) * side;
                const dy = Math.sin(angle) * side;
                const normalX = Math.cos(angle + Math.PI / 2);
                const normalY = Math.sin(angle + Math.PI / 2);
                const inner = radius * (0.12 + galaxyNoise(seed + 223, strand) * 0.04);
                const outer = radius * (1.28 + highlight * 0.22 + galaxyNoise(seed + 239, strand) * 0.14 + extension);
                const bend = Math.sin(t * Math.PI) * radius * (galaxyNoise(seed + 251, strand) - 0.5) * 0.10;
                const along = inner + (outer - inner) * t;
                return {
                    x: dx * along + normalX * bend,
                    y: dy * along + normalY * bend,
                    angle
                };
            };

            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            galaxyCtx.lineCap = 'round';
            for (let side = -1; side <= 1; side += 2) {
                for (let strand = 0; strand < strandCount; strand++) {
                    const segments = 7;
                    for (let i = 0; i < segments; i++) {
                        const t0 = i / segments;
                        const t1 = (i + 1) / segments;
                        const mid = (t0 + t1) * 0.5;
                        const p0 = strandPoint(side, strand, t0);
                        const p1 = strandPoint(side, strand, t1);
                        const tipFade = Math.pow(Math.max(0, 1 - mid), 0.84);
                        const centerFade = Math.min(1, 0.38 + mid * 1.45);
                        const primary = strand === Math.floor(strandCount / 2);
                        galaxyCtx.globalAlpha = (primary ? 0.21 : 0.08) * centerFade * tipFade + highlight * (primary ? 0.12 : 0.045) * tipFade;
                        galaxyCtx.strokeStyle = colorWithAlpha(primary ? '#dff7ff' : colors[strand % colors.length], (primary ? 0.82 : 0.48) * pulse);
                        galaxyCtx.lineWidth = Math.max(0.7, radius * (primary ? 0.032 : 0.012) * (0.65 + tipFade * 0.35));
                        galaxyCtx.beginPath();
                        galaxyCtx.moveTo(p0.x, p0.y);
                        galaxyCtx.lineTo(p1.x, p1.y);
                        galaxyCtx.stroke();
                    }

                    galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, radius * (0.065 + highlight * 0.008) * fontScale), options)}px Courier New`;
                    const glyphCount = Math.max(3, Math.round((4 + highlight) * detail));
                    for (let i = 0; i < glyphCount; i++) {
                        const t = 0.24 + i * (0.70 / Math.max(1, glyphCount - 1));
                        const p = strandPoint(side, strand, t);
                        const fade = Math.pow(Math.max(0, 1 - t), 0.72);
                        galaxyCtx.globalAlpha = (0.13 + highlight * 0.11) * fade * (0.72 + galaxyNoise(seed + 307 + strand * 7, i) * 0.28);
                        galaxyCtx.fillStyle = i % 3 === 0 ? '#ffffff' : colors[(strand + i) % colors.length];
                        galaxyCtx.fillText(glyphs[(strand + i) % glyphs.length], p.x, p.y);
                    }

                    for (let wave = 0; wave < shimmerCount; wave++) {
                        const waveSeed = strand * 17 + wave * 5 + (side > 0 ? 0 : 101);
                        const earlyDissipate = galaxyNoise(seed + 401, waveSeed) < 0.30;
                        const endT = earlyDissipate ? 0.36 + galaxyNoise(seed + 419, waveSeed) * 0.30 : 1.10;
                        const speed = 0.00016 + galaxyNoise(seed + 431, waveSeed) * 0.00010;
                        const head = (galaxyNoise(seed + 443, waveSeed) + now * speed) % 1.22;
                        if (head > endT + 0.10) continue;
                        const cloudT = Math.min(head, endT);
                        const cloudFade = head > endT ? Math.max(0, 1 - (head - endT) / 0.10) : 1;
                        const shimmerRadius = radius * (0.060 + galaxyNoise(seed + 457, waveSeed) * 0.040);
                        const p = strandPoint(side, strand, cloudT, earlyDissipate ? 0 : Math.max(0, head - 1) * 0.18);
                        galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, radius * (0.085 + highlight * 0.010) * fontScale), options)}px Courier New`;
                        galaxyCtx.globalAlpha = (0.34 + highlight * 0.22) * cloudFade * Math.pow(Math.max(0, 1 - Math.abs(cloudT - 0.5) * 0.55), 0.45);
                        galaxyCtx.fillStyle = wave % 2 ? colors[2] || '#ffffff' : '#ffffff';
                        galaxyCtx.fillText(glyphs[(wave + strand) % glyphs.length], p.x, p.y);

                        const dustCount = earlyDissipate || head > 1 ? 3 : 1;
                        galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(4, radius * 0.048 * fontScale), options)}px Courier New`;
                        for (let dust = 0; dust < dustCount; dust++) {
                            const a = galaxyNoise(seed + 467 + dust, waveSeed) * Math.PI * 2;
                            const r = shimmerRadius * galaxyNoise(seed + 479 + dust, waveSeed);
                            galaxyCtx.globalAlpha = (0.16 + highlight * 0.08) * cloudFade * (1 - dust * 0.18);
                            galaxyCtx.fillStyle = dust % 2 ? colors[1] || colors[0] : '#ffffff';
                            galaxyCtx.fillText(glyphs[(dust + wave) % glyphs.length], p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
                        }
                    }
                }

                const debrisCount = Math.max(7, Math.round((9 + highlight * 2) * detail));
                galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(4, radius * 0.055 * fontScale), options)}px Courier New`;
                for (let i = 0; i < debrisCount; i++) {
                    const strand = Math.floor(galaxyNoise(seed + 503, i + (side > 0 ? 0 : 41)) * strandCount) % strandCount;
                    const t = (galaxyNoise(seed + 521, i) + now * (0.00011 + galaxyNoise(seed + 541, i) * 0.00010)) % 1;
                    const p = strandPoint(side, strand, t);
                    const driftAngle = p.angle + (galaxyNoise(seed + 557, i) - 0.5) * 0.8;
                    const drift = radius * 0.075 * galaxyNoise(seed + 563, i) * Math.sin(t * Math.PI);
                    const size = Math.max(4, radius * (0.035 + galaxyNoise(seed + 571, i) * 0.042) * fontScale);
                    galaxyCtx.font = `bold ${getGalaxyFontPx(size, options)}px Courier New`;
                    galaxyCtx.globalAlpha = (0.12 + highlight * 0.10) * Math.pow(Math.max(0, 1 - t), 0.68);
                    galaxyCtx.fillStyle = i % 4 === 0 ? '#ffffff' : colors[i % colors.length];
                    galaxyCtx.fillText(glyphs[i % glyphs.length], p.x + Math.cos(driftAngle) * drift, p.y + Math.sin(driftAngle) * drift);
                }
            }
            galaxyCtx.restore();
        }

        function drawBinaryQuasarCorePulse(galaxy, radius, selected, now, options = {}) {
            const colors = galaxy && galaxy.colors ? galaxy.colors : ['#dcecff', '#8fa7c9', '#ffffff'];
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const seed = galaxy && Number.isFinite(galaxy.seed) ? galaxy.seed : 11;
            const breath = 0.5 + Math.sin(now * 0.0020 + seed * 0.17) * 0.5;
            const slowBreath = 0.5 + Math.sin(now * 0.0012 + seed * 0.41) * 0.5;
            const glowBeat = 0.42 + Math.pow(breath, 1.7) * 0.58;
            const centerHighlight = highlight * 0.22;
            const coreRadius = radius * (0.035 + centerHighlight * 0.006 + glowBeat * 0.010);
            const bloomRadius = radius * (0.25 + centerHighlight * 0.055 + glowBeat * 0.075);
            const haloRadius = radius * (0.50 + centerHighlight * 0.070 + slowBreath * 0.080);
            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'lighter';

            const halo = galaxyCtx.createRadialGradient(0, 0, radius * 0.07, 0, 0, haloRadius);
            halo.addColorStop(0, colorWithAlpha(colors[2] || '#ffffff', 0.13 + centerHighlight * 0.06 + slowBreath * 0.03));
            halo.addColorStop(0.26, colorWithAlpha(colors[0] || '#dcecff', 0.16 + centerHighlight * 0.08 + glowBeat * 0.04));
            halo.addColorStop(0.56, colorWithAlpha(colors[1] || '#8fa7c9', 0.07 + centerHighlight * 0.05));
            halo.addColorStop(1, colorWithAlpha(colors[0] || '#dcecff', 0));
            galaxyCtx.globalAlpha = options.warp ? 0.68 : 1;
            galaxyCtx.fillStyle = halo;
            galaxyCtx.beginPath();
            galaxyCtx.arc(0, 0, haloRadius, 0, Math.PI * 2);
            galaxyCtx.fill();

            const bloom = galaxyCtx.createRadialGradient(0, 0, coreRadius, 0, 0, bloomRadius);
            bloom.addColorStop(0, colorWithAlpha('#ffffff', 0.34 + glowBeat * 0.20 + centerHighlight * 0.10));
            bloom.addColorStop(0.18, colorWithAlpha(colors[2] || '#ffffff', 0.26 + glowBeat * 0.12 + centerHighlight * 0.08));
            bloom.addColorStop(0.44, colorWithAlpha(colors[0] || '#dcecff', 0.18 + centerHighlight * 0.08));
            bloom.addColorStop(0.76, colorWithAlpha(colors[1] || '#8fa7c9', 0.055 + centerHighlight * 0.035));
            bloom.addColorStop(1, colorWithAlpha(colors[1] || '#8fa7c9', 0));
            galaxyCtx.globalAlpha = options.warp ? 0.78 : 1;
            galaxyCtx.shadowColor = colors[2] || '#ffffff';
            galaxyCtx.shadowBlur = glowEnabled && !options.warp ? radius * (0.18 + glowBeat * 0.18 + centerHighlight * 0.09) : 0;
            galaxyCtx.fillStyle = bloom;
            galaxyCtx.beginPath();
            galaxyCtx.arc(0, 0, bloomRadius, 0, Math.PI * 2);
            galaxyCtx.fill();

            galaxyCtx.save();
            galaxyCtx.rotate((now * 0.00018 + seed) % (Math.PI * 2));
            galaxyCtx.scale(1.55 + centerHighlight * 0.18, 0.52 + glowBeat * 0.08);
            const lens = galaxyCtx.createRadialGradient(0, 0, radius * 0.012, 0, 0, radius * (0.22 + glowBeat * 0.060));
            lens.addColorStop(0, colorWithAlpha('#ffffff', 0.13 + centerHighlight * 0.06));
            lens.addColorStop(0.38, colorWithAlpha(colors[0] || '#dcecff', 0.075 + glowBeat * 0.035));
            lens.addColorStop(1, colorWithAlpha(colors[1] || '#8fa7c9', 0));
            galaxyCtx.globalAlpha = 0.82;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.fillStyle = lens;
            galaxyCtx.beginPath();
            galaxyCtx.arc(0, 0, radius * (0.25 + glowBeat * 0.065), 0, Math.PI * 2);
            galaxyCtx.fill();
            galaxyCtx.restore();
            galaxyCtx.restore();
        }

        function projectTensorMiragePoint(coords, radius, spin) {
            let x = coords[0];
            let y = coords[1];
            let z = coords[2];
            let w = coords[3];

            const ca = Math.cos(spin);
            const sa = Math.sin(spin);
            const cb = Math.cos(spin * 0.73 + 0.72);
            const sb = Math.sin(spin * 0.73 + 0.72);
            const cc = Math.cos(spin * -0.58 + 0.46);
            const sc = Math.sin(spin * -0.58 + 0.46);

            let nx = x * ca - z * sa;
            let nz = x * sa + z * ca;
            x = nx;
            z = nz;
            let ny = y * cb - w * sb;
            let nw = y * sb + w * cb;
            y = ny;
            w = nw;
            nx = x * cc - w * sc;
            nw = x * sc + w * cc;
            x = nx;
            w = nw;

            const perspective = 1 / Math.max(1.72, 2.62 - z * 0.28 - w * 0.22);
            return {
                x: x * radius * 0.72 * perspective + w * radius * 0.12,
                y: (y * radius * 0.56 + w * radius * 0.10) * perspective,
                depth: perspective
            };
        }

        function drawTensorMirageWireframe(radius, spin, color, alpha, offsetX, offsetY, lineWidth, options = {}) {
            const points = [];
            for (let i = 0; i < 16; i++) {
                const coords = [
                    (i & 1) ? 1 : -1,
                    (i & 2) ? 1 : -1,
                    (i & 4) ? 1 : -1,
                    (i & 8) ? 1 : -1
                ];
                const p = projectTensorMiragePoint(coords, radius, spin);
                points.push({ x: p.x + offsetX, y: p.y + offsetY, depth: p.depth });
            }

            galaxyCtx.strokeStyle = colorWithAlpha(color, 0.92);
            galaxyCtx.lineWidth = lineWidth;
            galaxyCtx.lineCap = 'round';
            const edgeGlyphs = options.glyphs || TENSOR_MIRAGE_FIELD_GLYPHS;
            const drawGlyphs = !!options.drawGlyphs;
            const fontScale = options.fontScale || 1;
            const glyphAlpha = Number.isFinite(options.glyphAlpha) ? options.glyphAlpha : alpha;
            const edgeGlyphScale = Number.isFinite(options.edgeGlyphScale) ? options.edgeGlyphScale : 1;
            let lastGlyphFont = '';
            const edgeGlyphFonts = drawGlyphs
                ? [0, 1, 2, 3].map(dim => `bold ${getGalaxyFontPx(Math.max(6, radius * (0.076 + dim * 0.009) * edgeGlyphScale * fontScale), options)}px Courier New`)
                : null;
            for (let i = 0; i < 16; i++) {
                for (let dim = 0; dim < 4; dim++) {
                    const j = i ^ (1 << dim);
                    if (j <= i) continue;
                    const a = points[i];
                    const b = points[j];
                    const edgeDepth = Math.max(0.35, Math.min(1, (a.depth + b.depth) * 0.46));
                    if (drawGlyphs) {
                        galaxyCtx.globalAlpha = alpha * edgeDepth * 0.16;
                    } else {
                        galaxyCtx.globalAlpha = alpha * edgeDepth;
                    }
                    if (!drawGlyphs || galaxyCtx.globalAlpha > 0.012) {
                        galaxyCtx.beginPath();
                        galaxyCtx.moveTo(a.x, a.y);
                        galaxyCtx.lineTo(b.x, b.y);
                        galaxyCtx.stroke();
                    }

                    if (drawGlyphs) {
                        const edgeLength = Math.hypot(b.x - a.x, b.y - a.y);
                        const marks = Math.max(dim === 3 ? 3 : 2, Math.min(4, Math.round(edgeLength / Math.max(7, radius * 0.19))));
                        for (let mark = 0; mark < marks; mark++) {
                            const t = (mark + 0.5) / marks;
                            const px = a.x + (b.x - a.x) * t;
                            const py = a.y + (b.y - a.y) * t;
                            const glyph = edgeGlyphs[(i * 5 + j * 3 + dim + mark) % edgeGlyphs.length];
                            const nextFont = edgeGlyphFonts[dim];
                            if (nextFont !== lastGlyphFont) {
                                galaxyCtx.font = nextFont;
                                lastGlyphFont = nextFont;
                            }
                            const edgeFade = 0.76 + Math.sin(t * Math.PI) * 0.24;
                            galaxyCtx.globalAlpha = glyphAlpha * edgeDepth * edgeFade * (dim === 3 ? 0.88 : 0.76);
                            galaxyCtx.fillStyle = dim === 3 || mark === 0 ? colorWithAlpha('#ffffff', 0.92) : colorWithAlpha(color, 0.90);
                            galaxyCtx.fillText(glyph, px, py);
                        }
                    }
                }
            }

            galaxyCtx.fillStyle = colorWithAlpha(color, 0.86);
            for (let i = 0; i < points.length; i++) {
                if (i % 3 === 1) continue;
                const p = points[i];
                if (drawGlyphs) {
                    const glyph = edgeGlyphs[(i * 7 + 3) % edgeGlyphs.length];
                    const fontSize = getGalaxyFontPx(Math.max(6, radius * 0.092 * Math.min(1.45, p.depth) * edgeGlyphScale * fontScale), options);
                    const nextFont = `bold ${fontSize}px Courier New`;
                    if (nextFont !== lastGlyphFont) {
                        galaxyCtx.font = nextFont;
                        lastGlyphFont = nextFont;
                    }
                    galaxyCtx.globalAlpha = glyphAlpha * 0.90;
                    galaxyCtx.fillStyle = i % 4 === 0 ? '#ffffff' : colorWithAlpha(color, 0.92);
                    galaxyCtx.fillText(glyph, p.x, p.y);
                } else {
                    const size = Math.max(1.4, radius * 0.012 * Math.min(1.5, p.depth));
                    galaxyCtx.globalAlpha = alpha * 0.75;
                    galaxyCtx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
                }
            }
        }

        function drawTensorMirageGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#6aa8ff', '#ff5e8a', '#dcecff'];
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00010 + index) * 0.04);
            const spin = now * 0.00012 * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, now, highlight);
            const fontScale = options.fontScale || 1;
            const detail = options.detail || 1;
            const warpMode = !!options.warp;
            const availableAlpha = galaxy.available ? 1 : 0.48;
            const lensPulse = 0.5 + Math.sin(now * 0.0021 + index) * 0.5;

            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.rotate(axis * 0.18);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'screen';
            drawGalaxySoftAura(colors, radius, selected, 0.78 + glowPulse * 0.12, highlight);

            const ghostSpread = radius * (0.026 + highlight * 0.012);
            if (glowEnabled && !warpMode) {
                galaxyCtx.shadowColor = colors[0];
                galaxyCtx.shadowBlur = 5 + highlight * 6 + glowPulse * 3;
            }
            const tensorGlyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length
                ? galaxy.glyphs
                : TENSOR_MIRAGE_FIELD_GLYPHS;
            drawTensorMirageWireframe(radius, spin - 0.11, '#ff5e8a', (0.18 + highlight * 0.10) * availableAlpha, -ghostSpread, ghostSpread * 0.65, Math.max(0.8, radius * 0.009));
            drawTensorMirageWireframe(radius, spin + 0.10, '#ffe88a', (0.14 + highlight * 0.08) * availableAlpha, ghostSpread * 0.78, -ghostSpread * 0.55, Math.max(0.8, radius * 0.008));
            drawTensorMirageWireframe(radius, spin, colors[0], (0.36 + highlight * 0.20) * availableAlpha, 0, 0, Math.max(1, radius * 0.014), {
                ...options,
                drawGlyphs: true,
                glyphs: tensorGlyphs,
                glyphAlpha: (0.42 + highlight * 0.24) * availableAlpha,
                edgeGlyphScale: 1.18
            });
            galaxyCtx.shadowBlur = 0;

            galaxyCtx.save();
            galaxyCtx.rotate(-axis * 0.42);
            galaxyCtx.globalAlpha = (0.17 + highlight * 0.12 + lensPulse * 0.04) * availableAlpha;
            galaxyCtx.strokeStyle = colorWithAlpha('#ffffff', 0.46);
            galaxyCtx.lineWidth = Math.max(1, radius * 0.012);
            galaxyCtx.beginPath();
            for (let i = 0; i <= 20; i++) {
                const t = i / 20;
                const px = (t - 0.5) * radius * 1.46;
                const py = Math.sin(t * Math.PI * 2.6 + now * 0.002) * radius * (0.045 + highlight * 0.016);
                if (i === 0) galaxyCtx.moveTo(px, py);
                else galaxyCtx.lineTo(px, py);
            }
            galaxyCtx.stroke();
            galaxyCtx.globalAlpha = (0.10 + highlight * 0.08) * availableAlpha;
            galaxyCtx.strokeStyle = colorWithAlpha(colors[2], 0.58);
            galaxyCtx.beginPath();
            galaxyCtx.ellipse(0, 0, radius * 0.86, radius * 0.24, 0, 0, Math.PI * 2);
            galaxyCtx.stroke();
            galaxyCtx.restore();

            const fieldCount = Math.max(14, Math.round((18 + highlight * 5) * detail));
            let lastFont = '';
            for (let i = 0; i < fieldCount; i++) {
                const noise = galaxyNoise((galaxy.seed || 101) + 1701, i);
                const a = spin * 0.8 + noise * Math.PI * 2 + i * 0.62;
                const r = radius * (0.50 + galaxyNoise((galaxy.seed || 101) + 1723, i) * 0.74);
                const wave = Math.sin(now * 0.0017 + i * 1.31) * radius * 0.025;
                const px = Math.cos(a) * r + Math.cos(axis + Math.PI / 2) * wave;
                const py = Math.sin(a) * r * 0.58 + Math.sin(axis + Math.PI / 2) * wave;
                const fontSize = getGalaxyFontPx(Math.max(5, (6.8 + galaxyNoise((galaxy.seed || 101) + 1741, i) * 3.5 + highlight) * fontScale), options);
                const nextFont = `bold ${fontSize}px Courier New`;
                if (nextFont !== lastFont) {
                    galaxyCtx.font = nextFont;
                    lastFont = nextFont;
                }
                galaxyCtx.globalAlpha = (0.18 + highlight * 0.12) * (0.66 + noise * 0.34) * availableAlpha;
                galaxyCtx.fillStyle = i % 5 === 0 ? '#ffffff' : (i % 3 === 0 ? '#ffe88a' : (i % 2 ? colors[1] : colors[0]));
                galaxyCtx.fillText(tensorGlyphs[i % tensorGlyphs.length], px, py);
            }

            galaxyCtx.globalCompositeOperation = 'source-over';
            galaxyCtx.globalAlpha = (0.72 + highlight * 0.22) * availableAlpha;
            galaxyCtx.shadowColor = colors[2];
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (9 + highlight * 8 + glowPulse * 4) : 0;
            galaxyCtx.fillStyle = colors[2] || '#dcecff';
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(13, (25 + highlight * 4) * fontScale), options)}px Courier New`;
            galaxyCtx.fillText('\u2297', 0, 0);
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.fillStyle = colorWithAlpha('#061020', 0.84);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, (13 + highlight * 2) * fontScale), options)}px Courier New`;
            galaxyCtx.fillText('\u03BB', 0, 0);

            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function drawMatrixNebulaCloud(galaxy, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#007a3a', '#25b85b', '#f2fff6'];
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            for (let i = 0; i < 12; i++) {
                const a = galaxyNoise((galaxy.seed || 29) + 500, i) * Math.PI * 2 + now * 0.00005 * (i % 2 ? 1 : -1);
                const r = radius * (0.18 + galaxyNoise((galaxy.seed || 29) + 521, i) * 0.74);
                const blobX = Math.cos(a) * r * (0.85 + galaxyNoise(index + 41, i) * 0.35);
                const blobY = Math.sin(a) * r * (0.38 + galaxyNoise(index + 51, i) * 0.24);
                const blobR = radius * (0.14 + galaxyNoise(index + 61, i) * 0.20);
                const whiteGas = i % 5 === 0;
                const grad = galaxyCtx.createRadialGradient(blobX, blobY, 0, blobX, blobY, blobR);
                grad.addColorStop(0, colorWithAlpha(whiteGas ? '#f2fff6' : colors[i % 2], 0.08 + highlight * 0.08));
                grad.addColorStop(1, colorWithAlpha(colors[0], 0));
                galaxyCtx.fillStyle = grad;
                galaxyCtx.globalAlpha = 1;
                galaxyCtx.beginPath();
                galaxyCtx.arc(blobX, blobY, blobR, 0, Math.PI * 2);
                galaxyCtx.fill();
            }
            galaxyCtx.restore();
        }

        function drawMatrixNebulaRain(galaxy, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#007a3a', '#25b85b', '#f2fff6'];
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00009 + (galaxy.seed || index)) * 0.035);
            const tilt = options.tiltOverride ?? (profile.tilt || galaxy.tilt || 0.46);
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const seed = galaxy.seed || 29;
            const columnCount = Math.max(8, Math.round((10 + highlight * 4) * detail));
            const cloudPocketCount = Math.max(3, Math.round((4 + highlight * 2) * detail));
            const drawPocketGlow = !options.skipPocketGlow;
            const pocketsOnly = !!options.pocketsOnly;
            const baseFont = getGalaxyFontPx(Math.max(6, (8.9 + highlight * 2.6) * fontScale), options);
            const flash = 0.5 + Math.sin(now * 0.0032 + index * 1.7) * 0.5;
            const morphBucket = Math.floor(now / 130);

            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            galaxyCtx.rotate(axis * 0.55);
            galaxyCtx.scale(1, 0.72 + tilt * 0.28);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';

            const pockets = [];
            for (let pocket = 0; pocket < cloudPocketCount; pocket++) {
                const cloudAngle = galaxyNoise(seed + 701, pocket) * Math.PI * 2;
                const cloudRadius = radius * (0.10 + galaxyNoise(seed + 719, pocket) * 0.72);
                const cloudX = Math.cos(cloudAngle) * cloudRadius * (0.86 + galaxyNoise(seed + 733, pocket) * 0.20);
                const cloudY = Math.sin(cloudAngle) * cloudRadius * (0.42 + galaxyNoise(seed + 751, pocket) * 0.18);
                const cloudW = radius * (0.18 + galaxyNoise(seed + 769, pocket) * 0.24) * (0.94 + highlight * 0.12);
                const cloudH = radius * (0.14 + galaxyNoise(seed + 787, pocket) * 0.14) * (0.94 + highlight * 0.12);
                const breathe = 0.5 + Math.sin(now * (0.00115 + galaxyNoise(seed + 803, pocket) * 0.00062) + pocket * 1.37) * 0.5;
                pockets.push({ x: cloudX, y: cloudY, w: cloudW, h: cloudH, breathe });
                if (drawPocketGlow) {
                    const cloudAlpha = (0.13 + highlight * 0.13) * (0.38 + breathe * 0.62);
                    const cloudGrad = galaxyCtx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudW);
                    cloudGrad.addColorStop(0, colorWithAlpha(pocket % 4 === 0 ? '#d8ffe0' : colors[1], cloudAlpha));
                    cloudGrad.addColorStop(0.48, colorWithAlpha(colors[0], cloudAlpha * 0.44));
                    cloudGrad.addColorStop(1, colorWithAlpha(colors[0], 0));
                    galaxyCtx.globalAlpha = 1;
                    galaxyCtx.fillStyle = cloudGrad;
                    galaxyCtx.beginPath();
                    galaxyCtx.ellipse(cloudX, cloudY, cloudW, cloudH, (galaxyNoise(seed + 821, pocket) - 0.5) * 0.72, 0, Math.PI * 2);
                    galaxyCtx.fill();
                }
            }

            if (pocketsOnly) {
                galaxyCtx.shadowBlur = 0;
                galaxyCtx.restore();
                return;
            }

            let lastFont = '';
            for (let column = 0; column < columnCount; column++) {
                const x = (galaxyNoise(seed + 839, column) - 0.5) * radius * 1.88;
                const fontSize = Math.max(5, Math.round(baseFont * (0.88 + galaxyNoise(seed + 857, column) * 0.34)));
                const gap = fontSize * (1.02 + galaxyNoise(seed + 877, column) * 0.20);
                const length = 5 + Math.floor(galaxyNoise(seed + 891, column) * 2 + highlight * 1.4);
                const speed = 0.000105 + galaxyNoise(seed + 907, column) * 0.000075 + highlight * 0.000035;
                const travel = radius * 1.82 + length * gap;
                const phase = (galaxyNoise(seed + 929, column) + now * speed) % 1;
                const headY = -radius * 0.94 + phase * travel;
                const drift = Math.sin(now * (0.0010 + galaxyNoise(seed + 947, column) * 0.0007) + column) * radius * 0.018;
                const colX = x + drift;
                const nextFont = `bold ${fontSize}px Courier New`;
                if (nextFont !== lastFont) {
                    galaxyCtx.font = nextFont;
                    lastFont = nextFont;
                }

                galaxyCtx.lineWidth = Math.max(1, radius * (0.009 + highlight * 0.0026));
                const trailEndY = headY - (length - 1) * gap;
                const headMask = 1 - Math.min(1, Math.pow(colX / (radius * 1.08), 2) + Math.pow(headY / (radius * 0.82), 2));
                const tailMask = 1 - Math.min(1, Math.pow(colX / (radius * 1.08), 2) + Math.pow(trailEndY / (radius * 0.82), 2));
                const trailMask = Math.max(0, Math.min(1, Math.max(headMask, tailMask)));
                if (trailMask > 0.02) {
                    let trailCloudMask = 0.20;
                    for (let pocket = 0; pocket < pockets.length; pocket++) {
                        const p = pockets[pocket];
                        const px = (colX - p.x) / Math.max(1, p.w);
                        const midY = (headY + trailEndY) * 0.5;
                        const py = (midY - p.y) / Math.max(1, p.h);
                        const pocketMask = Math.max(0, 1 - px * px - py * py);
                        trailCloudMask = Math.max(trailCloudMask, pocketMask * (0.56 + p.breathe * 0.44));
                    }
                    const trailAlpha = Math.min(0.68, (0.30 + highlight * 0.20) * trailMask * trailCloudMask);
                    galaxyCtx.globalAlpha = trailAlpha;
                    const trailGradient = galaxyCtx.createLinearGradient(colX, trailEndY, colX, headY + fontSize * 0.45);
                    trailGradient.addColorStop(0, colorWithAlpha(colors[1], 0));
                    trailGradient.addColorStop(0.48, colorWithAlpha('#7dff95', 0.42));
                    trailGradient.addColorStop(1, colorWithAlpha('#d8ffe0', 0.82));
                    galaxyCtx.strokeStyle = trailGradient;
                    galaxyCtx.beginPath();
                    galaxyCtx.moveTo(colX, trailEndY);
                    galaxyCtx.lineTo(colX, headY + fontSize * 0.45);
                    galaxyCtx.stroke();
                }
                for (let glyphIndex = 0; glyphIndex < length; glyphIndex++) {
                    const gy = headY - glyphIndex * gap;
                    const ellipseMask = 1 - Math.min(1, Math.pow(colX / (radius * 1.08), 2) + Math.pow(gy / (radius * 0.82), 2));
                    if (ellipseMask <= 0.015) continue;
                    let cloudMask = 0.24;
                    for (let pocket = 0; pocket < pockets.length; pocket++) {
                        const p = pockets[pocket];
                        const px = (colX - p.x) / Math.max(1, p.w);
                        const py = (gy - p.y) / Math.max(1, p.h);
                        const pocketMask = Math.max(0, 1 - px * px - py * py);
                        cloudMask = Math.max(cloudMask, pocketMask * (0.58 + p.breathe * 0.42));
                    }
                    const glyphNoise = galaxyNoise(seed + 971 + morphBucket + column * 23, glyphIndex);
                    const glyph = MATRIX_NEBULA_RAIN_GLYPHS[Math.floor(glyphNoise * MATRIX_NEBULA_RAIN_GLYPHS.length) % MATRIX_NEBULA_RAIN_GLYPHS.length];
                    const head = glyphIndex === 0;
                    const tailT = 1 - glyphIndex / Math.max(1, length - 1);
                    const flicker = 0.78 + Math.sin(now * 0.006 + column * 1.3 + glyphIndex * 1.71) * 0.22;
                    const alpha = Math.max(0.060, (head ? 1.08 : 0.42 + tailT * 0.48) * ellipseMask * cloudMask * (1.02 + highlight * 0.44) * flicker);
                    if (glyphIndex === length - 1) {
                        galaxyCtx.globalAlpha = alpha * 0.46;
                        galaxyCtx.strokeStyle = colorWithAlpha(colors[1], 0.66);
                        galaxyCtx.beginPath();
                        galaxyCtx.moveTo(colX, gy);
                        galaxyCtx.lineTo(colX, headY + fontSize * 0.35);
                        galaxyCtx.stroke();
                    }
                    galaxyCtx.globalAlpha = Math.min(1, alpha);
                    galaxyCtx.fillStyle = head
                        ? (glyphNoise > 0.72 ? '#ffffff' : '#d8ffe0')
                        : (glyphIndex % 4 === 0 ? '#8ff7ff' : (glyphIndex % 3 === 0 ? '#baffc8' : colors[1]));
                    galaxyCtx.shadowColor = head ? '#d8ffe0' : colors[1];
                    galaxyCtx.shadowBlur = glowEnabled && head
                        ? (12 + highlight * 6) * cloudMask
                        : 0;
                    galaxyCtx.fillText(glyph, colX + (galaxyNoise(seed + 991 + glyphIndex, column) - 0.5) * radius * 0.018, gy);
                    if (head && cloudMask > 0.26) {
                        const glint = Math.min(0.94, alpha * 0.86);
                        const glintSize = Math.max(3, fontSize * 0.58);
                        const glintX = colX + fontSize * (0.18 + galaxyNoise(seed + 1009, column) * 0.16);
                        const glintY = gy - fontSize * (0.12 + galaxyNoise(seed + 1021, column) * 0.12);
                        galaxyCtx.shadowBlur = 0;
                        galaxyCtx.globalAlpha = glint;
                        galaxyCtx.strokeStyle = colorWithAlpha('#ffffff', 0.96);
                        galaxyCtx.lineWidth = Math.max(1, radius * 0.0048);
                        galaxyCtx.beginPath();
                        galaxyCtx.moveTo(glintX - glintSize, glintY);
                        galaxyCtx.lineTo(glintX + glintSize, glintY);
                        galaxyCtx.moveTo(glintX, glintY - glintSize);
                        galaxyCtx.lineTo(glintX, glintY + glintSize);
                        galaxyCtx.stroke();
                    }
                }
            }

            galaxyCtx.shadowBlur = 0;
            galaxyCtx.restore();
        }

        function drawFractalCounterHalo(galaxy, radius, selected, now, index, options = {}) {
            const profile = getGalaxyVisualProfile(index);
            const spin = -now * 0.00018 * (profile.spinSpeed || 1);
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const count = Math.round((44 + highlight * 14) * (options.detail || 1));
            const axis = profile.axis - 0.18;
            const tilt = 0.42;
            const cosAxis = Math.cos(axis);
            const sinAxis = Math.sin(axis);
            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, radius * 0.09 * (options.fontScale || 1)), options)}px Courier New`;
            for (let i = 0; i < count; i++) {
                const a = (i / count) * Math.PI * 2 + spin;
                const jitter = (galaxyNoise((galaxy.seed || 47) + 801, i) - 0.5) * radius * 0.08;
                const localX = Math.cos(a) * (radius * 1.14 + jitter);
                const localY = Math.sin(a) * (radius * 0.58 + jitter * 0.35) * tilt;
                const x = localX * cosAxis - localY * sinAxis;
                const y = localX * sinAxis + localY * cosAxis;
                galaxyCtx.globalAlpha = 0.18 + highlight * 0.16;
                galaxyCtx.fillStyle = i % 7 === 0 ? '#fff7b8' : '#ffd65e';
                galaxyCtx.fillText(i % 4 === 0 ? '*' : '.', x, y);
            }
            galaxyCtx.restore();
        }

        function drawFractalHaloStorm(galaxy, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#ff7ab8', '#8fb8ff', '#fff0fa'];
            const profile = getGalaxyVisualProfile(index);
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const axis = options.axisOverride ?? (profile.axis - 0.18);
            const seed = galaxy.seed || 47;
            const flashCount = Math.max(5, Math.round((7 + highlight * 3) * detail));
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length
                ? galaxy.glyphs
                : ['{', '}', '(', ')', '∞', '∂', '∑', '.'];
            const morphBucket = Math.floor(now / 260);
            const baseFont = getGalaxyFontPx(Math.max(7, (8.4 + highlight * 2.1) * fontScale), options);

            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            galaxyCtx.rotate(axis * 0.48);
            galaxyCtx.scale(1, 0.58);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';

            let lastFont = '';
            for (let i = 0; i < flashCount; i++) {
                const angle = galaxyNoise(seed + 1101, i) * Math.PI * 2;
                const r = radius * (0.14 + galaxyNoise(seed + 1117, i) * 0.84);
                const x = Math.cos(angle) * r * (0.95 + galaxyNoise(seed + 1129, i) * 0.18);
                const y = Math.sin(angle) * r * (0.50 + galaxyNoise(seed + 1151, i) * 0.20);
                const mask = 1 - Math.min(1, Math.pow(x / (radius * 1.12), 2) + Math.pow(y / (radius * 0.82), 2));
                if (mask <= 0.03) continue;

                const pulse = Math.max(0, Math.sin(now * (0.0022 + galaxyNoise(seed + 1163, i) * 0.0017) + galaxyNoise(seed + 1171, i) * Math.PI * 2));
                const flash = Math.pow(pulse, 5.5) * mask * (0.68 + highlight * 0.44);
                const idleSpark = (0.08 + highlight * 0.05) * mask * (0.55 + Math.sin(now * 0.0012 + i) * 0.45);
                const alpha = Math.min(1, idleSpark + flash);
                if (alpha <= 0.018) continue;

                const pocketR = radius * (0.10 + galaxyNoise(seed + 1187, i) * 0.13) * (0.85 + flash * 0.45);
                const grad = galaxyCtx.createRadialGradient(x, y, 0, x, y, pocketR);
                grad.addColorStop(0, colorWithAlpha(i % 4 === 0 ? '#ffffff' : colors[2] || '#fff0fa', 0.20 + flash * 0.34));
                grad.addColorStop(0.44, colorWithAlpha(i % 2 ? colors[1] || '#8fb8ff' : colors[0] || '#ff7ab8', 0.13 + flash * 0.24));
                grad.addColorStop(1, colorWithAlpha(colors[0] || '#ff7ab8', 0));
                galaxyCtx.globalAlpha = alpha;
                galaxyCtx.fillStyle = grad;
                galaxyCtx.beginPath();
                galaxyCtx.arc(x, y, pocketR, 0, Math.PI * 2);
                galaxyCtx.fill();

                galaxyCtx.lineCap = 'round';
                galaxyCtx.lineWidth = Math.max(1, radius * (0.004 + flash * 0.006));
                for (let shard = 0; shard < 3; shard++) {
                    const shardAngle = angle + shard * Math.PI * 2 / 3 + now * 0.00018 * (shard % 2 ? -1 : 1);
                    const shardLen = radius * (0.08 + flash * 0.13) * (0.72 + galaxyNoise(seed + 1201 + shard, i) * 0.45);
                    galaxyCtx.globalAlpha = Math.min(0.84, alpha * (0.34 + flash * 0.55));
                    galaxyCtx.strokeStyle = colorWithAlpha(shard % 2 ? colors[1] || '#8fb8ff' : colors[0] || '#ff7ab8', 0.82);
                    galaxyCtx.beginPath();
                    galaxyCtx.moveTo(x - Math.cos(shardAngle) * shardLen * 0.32, y - Math.sin(shardAngle) * shardLen * 0.32);
                    galaxyCtx.lineTo(x + Math.cos(shardAngle) * shardLen, y + Math.sin(shardAngle) * shardLen);
                    galaxyCtx.stroke();
                }

                const fontSize = Math.max(6, Math.round(baseFont * (0.86 + galaxyNoise(seed + 1229, i) * 0.46) * (1 + flash * 0.16)));
                const nextFont = `bold ${fontSize}px Courier New`;
                if (nextFont !== lastFont) {
                    galaxyCtx.font = nextFont;
                    lastFont = nextFont;
                }

                const glyphNoise = galaxyNoise(seed + 1249 + morphBucket, i);
                const glyph = glyphs[Math.floor(glyphNoise * glyphs.length) % glyphs.length];
                galaxyCtx.globalAlpha = Math.min(0.96, alpha * (0.58 + flash * 0.50));
                galaxyCtx.fillStyle = glyphNoise > 0.78 ? '#ffffff' : (i % 3 === 0 ? colors[2] || '#fff0fa' : (i % 2 ? colors[1] || '#8fb8ff' : colors[0] || '#ff7ab8'));
                galaxyCtx.shadowColor = galaxyCtx.fillStyle;
                galaxyCtx.shadowBlur = glowEnabled ? (5 + flash * 12 + highlight * 4) * mask : 0;
                galaxyCtx.fillText(glyph, x, y);

                if (flash > 0.16) {
                    const glintSize = Math.max(3, fontSize * (0.36 + flash * 0.28));
                    galaxyCtx.shadowBlur = 0;
                    galaxyCtx.globalAlpha = Math.min(0.53, flash * 0.52);
                    galaxyCtx.strokeStyle = colorWithAlpha('#ffffff', 0.55);
                    galaxyCtx.lineWidth = Math.max(1, radius * 0.0042);
                    galaxyCtx.beginPath();
                    galaxyCtx.moveTo(x - glintSize, y);
                    galaxyCtx.lineTo(x + glintSize, y);
                    galaxyCtx.moveTo(x, y - glintSize);
                    galaxyCtx.lineTo(x, y + glintSize);
                    galaxyCtx.stroke();
                }
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
        }

        function drawKernelCoronaGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#ff8a1c', '#ff5f00', '#7cc7ff'];
            const profile = getGalaxyVisualProfile(index);
            const axis = (options.axisOverride ?? profile.axis) - 0.14;
            const tilt = 0.34;
            const spin = now * 0.00010 * (profile.spinDir || 1);
            const fontScale = options.fontScale || 1;
            const detail = options.detail || 1;
            const warpMode = !!options.warp;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, now, highlight);
            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'screen';
            drawGalaxySoftAura([colors[0], '#ff9a1f', galaxy.coreColor || colors[2]], radius, selected, 0.92 + glowPulse * 0.14, highlight);
            galaxyCtx.rotate(axis);
            galaxyCtx.scale(1, tilt);

            const coronaCount = Math.round((58 + highlight * 16) * detail);
            for (let ring = 0; ring < 3; ring++) {
                const ringR = radius * (0.84 + ring * 0.13);
                const wobble = 0.07 + ring * 0.035;
                galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(6, (9 + ring * 2) * fontScale), options)}px Courier New`;
                for (let i = 0; i < coronaCount; i++) {
                    const a = (i / coronaCount) * Math.PI * 2 + spin * (1 + ring * 0.42);
                    const flame = 1 + Math.sin(a * 9 + now * 0.002 + ring) * wobble;
                    const px = Math.cos(a) * ringR * flame;
                    const py = Math.sin(a) * ringR * flame;
                    galaxyCtx.globalAlpha = (0.30 + highlight * 0.22) * (ring === 1 ? 1 : 0.72);
                    galaxyCtx.fillStyle = ring === 0 ? '#ff4f00' : (i % 5 === 0 ? '#ffc073' : '#ff761b');
                    galaxyCtx.fillText(i % 3 === 0 ? '/' : (i % 3 === 1 ? '\\' : '|'), px, py);
                }
            }

            galaxyCtx.globalCompositeOperation = 'source-over';
            galaxyCtx.globalAlpha = galaxy.available ? (0.66 + highlight * 0.26) : (0.25 + highlight * 0.07);
            galaxyCtx.strokeStyle = colorWithAlpha('#ff8a1c', 0.48 + highlight * 0.30);
            galaxyCtx.lineWidth = Math.max(2, radius * 0.035);
            galaxyCtx.beginPath();
            galaxyCtx.ellipse(0, 0, radius * 0.76, radius * 0.38, 0, 0, Math.PI * 2);
            galaxyCtx.stroke();

            galaxyCtx.globalAlpha = 0.72 + highlight * 0.23;
            galaxyCtx.fillStyle = '#7cc7ff';
            galaxyCtx.shadowColor = '#7cc7ff';
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (9 + highlight * 9 + glowPulse * 4) : 0;
            galaxyCtx.beginPath();
            galaxyCtx.ellipse(0, 0, radius * 0.30, radius * 0.30, 0, 0, Math.PI * 2);
            galaxyCtx.fill();
            galaxyCtx.fillStyle = '#031022';
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.beginPath();
            galaxyCtx.ellipse(0, 0, radius * 0.085, radius * 0.11, 0, 0, Math.PI * 2);
            galaxyCtx.fill();
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function drawBitshiftSphereGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#ff4f4a', '#ff9a73', '#fff1e8'];
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00008 + index) * 0.03);
            const spin = now * 0.00013 * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const warpMode = !!options.warp;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, now, highlight);
            const availableAlpha = galaxy.available ? 1 : 0.38;
            const phase = spin * 2.3;
            const helixLength = radius * (1.54 + highlight * 0.08);
            const helixAmp = radius * (0.38 + highlight * 0.035);
            const helixTurns = 1.38;
            const stepCount = Math.max(18, Math.round((28 + highlight * 6) * detail));
            const rungCount = Math.max(8, Math.round((10 + highlight * 3) * detail));
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length
                ? galaxy.glyphs
                : ['<', '>', '^', 'v', '/', '\\', '0', '1'];
            const helixPoint = (t, strand) => {
                const angle = (t - 0.5) * Math.PI * 2 * helixTurns + phase + strand * Math.PI;
                const taper = 0.76 + Math.sin(t * Math.PI) * 0.24;
                const wave = Math.sin(angle);
                const depth = 0.5 + Math.cos(angle) * 0.5;
                return {
                    x: wave * helixAmp * taper,
                    y: (t - 0.5) * helixLength + (depth - 0.5) * radius * 0.10,
                    depth,
                    angle
                };
            };

            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.rotate(axis);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'screen';
            drawGalaxySoftAura(colors, radius, selected, 0.86 + glowPulse * 0.13, highlight);

            galaxyCtx.strokeStyle = colorWithAlpha(colors[1], 0.15 + highlight * 0.13);
            galaxyCtx.lineWidth = 1;
            for (let ring = -2; ring <= 2; ring++) {
                const yRing = ring * radius * 0.18;
                const ringScale = Math.sqrt(Math.max(0.08, 1 - Math.abs(ring) * 0.18));
                galaxyCtx.globalAlpha = 0.20 + highlight * 0.15;
                galaxyCtx.beginPath();
                galaxyCtx.ellipse(0, yRing, radius * 0.74 * ringScale, radius * 0.18, spin + ring * 0.12, 0, Math.PI * 2);
                galaxyCtx.stroke();
            }

            galaxyCtx.lineCap = 'round';
            galaxyCtx.lineJoin = 'round';

            for (let i = 0; i < rungCount; i++) {
                const t = 0.08 + (i / Math.max(1, rungCount - 1)) * 0.84;
                const a = helixPoint(t, 0);
                const b = helixPoint(t, 1);
                const depth = (a.depth + b.depth) * 0.5;
                const rungColor = i % 3 === 0 ? colors[2] : (i % 2 ? colors[1] : colors[0]);
                galaxyCtx.globalAlpha = (0.05 + highlight * 0.04 + depth * 0.03) * availableAlpha;
                galaxyCtx.strokeStyle = colorWithAlpha(rungColor, 0.68);
                galaxyCtx.lineWidth = Math.max(0.7, radius * (0.006 + depth * 0.003 + highlight * 0.001));
                galaxyCtx.beginPath();
                galaxyCtx.moveTo(a.x, a.y);
                galaxyCtx.lineTo(b.x, b.y);
                galaxyCtx.stroke();

                const rungMarks = i % 3 === 0 ? 2 : 1;
                for (let mark = 0; mark < rungMarks; mark++) {
                    const mix = rungMarks === 1 ? 0.5 : 0.34 + mark * 0.32;
                    const midX = a.x + (b.x - a.x) * mix;
                    const midY = a.y + (b.y - a.y) * mix;
                    const glyph = glyphs[(i * 3 + mark + (depth > 0.55 ? 1 : 0)) % glyphs.length];
                    galaxyCtx.globalAlpha = (0.20 + highlight * 0.12 + depth * 0.10) * availableAlpha;
                    galaxyCtx.fillStyle = depth > 0.58 ? colors[2] : rungColor;
                    galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(6, radius * (0.082 + depth * 0.020) * fontScale), options)}px Courier New`;
                    galaxyCtx.fillText(glyph, midX, midY);
                }

                if (i % 2 === 0) {
                    const midX = (a.x + b.x) * 0.5;
                    const midY = (a.y + b.y) * 0.5;
                    galaxyCtx.globalAlpha = (0.10 + highlight * 0.06) * availableAlpha;
                    galaxyCtx.fillStyle = colors[2];
                    galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, radius * 0.060 * fontScale), options)}px Courier New`;
                    galaxyCtx.fillText(i % 4 === 0 ? '0' : '1', midX, midY);
                }
            }

            for (let strand = 0; strand < 2; strand++) {
                const strandColor = strand === 0 ? colors[0] : colors[1];
                for (let i = 1; i < stepCount; i++) {
                    const t0 = (i - 1) / Math.max(1, stepCount - 1);
                    const t1 = i / Math.max(1, stepCount - 1);
                    const p0 = helixPoint(t0, strand);
                    const p1 = helixPoint(t1, strand);
                    const depth = (p0.depth + p1.depth) * 0.5;
                    galaxyCtx.globalAlpha = (0.045 + depth * 0.055 + highlight * 0.035) * availableAlpha;
                    galaxyCtx.strokeStyle = depth > 0.56
                        ? colorWithAlpha(colors[2], 0.92)
                        : colorWithAlpha(strandColor, 0.86);
                    galaxyCtx.lineWidth = Math.max(0.7, radius * (0.006 + depth * 0.004 + highlight * 0.001));
                    if (glowEnabled && !warpMode && depth > 0.62) {
                        galaxyCtx.shadowColor = strandColor;
                        galaxyCtx.shadowBlur = 2 + depth * 4 + highlight * 3;
                    } else {
                        galaxyCtx.shadowBlur = 0;
                    }
                    galaxyCtx.beginPath();
                    galaxyCtx.moveTo(p0.x, p0.y);
                    galaxyCtx.lineTo(p1.x, p1.y);
                    galaxyCtx.stroke();

                    if (i % 2 === 0 || depth > 0.62) {
                        const midT = (t0 + t1) * 0.5;
                        const p = helixPoint(midT, strand);
                        const glyphIndex = (strand * 5 + i * 3 + Math.floor(depth * 7)) % glyphs.length;
                        const glyph = glyphs[glyphIndex];
                        const fontSize = getGalaxyFontPx(Math.max(6, radius * (0.078 + depth * 0.026 + highlight * 0.006) * fontScale), options);
                        galaxyCtx.font = `bold ${fontSize}px Courier New`;
                        galaxyCtx.globalAlpha = (0.24 + depth * 0.20 + highlight * 0.12) * availableAlpha;
                        galaxyCtx.fillStyle = depth > 0.58 ? colors[2] : strandColor;
                        galaxyCtx.shadowColor = strandColor;
                        galaxyCtx.shadowBlur = glowEnabled && !warpMode && depth > 0.60 ? 4 + depth * 5 + highlight * 4 : 0;
                        galaxyCtx.fillText(glyph, p.x, p.y);
                    }
                }
            }

            galaxyCtx.shadowBlur = 0;
            const points = Math.round((70 + highlight * 20) * detail);
            let lastFont = '';
            for (let i = 0; i < points; i++) {
                const t = i / Math.max(1, points - 1);
                const a = t * Math.PI * 2.8 + spin * 2;
                const r = radius * (0.12 + t * 0.76);
                const sphere = Math.sin(t * Math.PI);
                const px = Math.cos(a) * r * (0.72 + sphere * 0.28);
                const py = Math.sin(a) * r * 0.52 + Math.cos(t * Math.PI * 2 + spin) * radius * 0.14 * sphere;
                const fontSize = getGalaxyFontPx(Math.max(6, (8 + sphere * 8) * fontScale), options);
                const nextFont = `bold ${fontSize}px Courier New`;
                if (nextFont !== lastFont) {
                    galaxyCtx.font = nextFont;
                    lastFont = nextFont;
                }
                galaxyCtx.globalAlpha = (0.44 + highlight * 0.28) * (0.48 + sphere * 0.52);
                galaxyCtx.fillStyle = i % 9 === 0 ? colors[2] : (i % 2 ? colors[0] : colors[1]);
                galaxyCtx.fillText(i % 4 === 0 ? '1' : (i % 4 === 1 ? '0' : (i % 4 === 2 ? '<' : '>')), px, py);
            }
            drawGalaxyCore(galaxy, colors, radius, selected, 0, 0.62, options);
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function drawPrismArrayVectorGlyph(size, x, y, angle, variant = 0) {
            const s = Math.max(3, size * 0.54);
            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.rotate(angle);
            galaxyCtx.beginPath();
            galaxyCtx.moveTo(0, -s * 0.62);
            galaxyCtx.lineTo(s * 0.58, s * 0.48);
            galaxyCtx.lineTo(-s * 0.58, s * 0.48);
            galaxyCtx.closePath();
            galaxyCtx.fill();
            if (variant % 5 === 0 && s > 4.5) {
                const oldAlpha = galaxyCtx.globalAlpha;
                galaxyCtx.globalAlpha = oldAlpha * 0.42;
                galaxyCtx.lineWidth = Math.max(0.7, s * 0.08);
                galaxyCtx.strokeStyle = '#ffffff';
                galaxyCtx.stroke();
            }
            galaxyCtx.restore();
        }

        function trimPrismArrayOuterGlyphCache() {
            while (prismArrayOuterGlyphCache.size > PRISM_ARRAY_OUTER_GLYPH_CACHE_MAX) {
                const oldestKey = prismArrayOuterGlyphCache.keys().next().value;
                prismArrayOuterGlyphCache.delete(oldestKey);
            }
        }

        function getPrismArrayOuterGlyphCanvas(glyph, fontSize, color, shadowBlur) {
            const roundedFontSize = Math.max(7, Math.round(fontSize));
            const roundedShadowBlur = Math.max(0, Math.round(shadowBlur * 2) / 2);
            const key = `${glyph}|${roundedFontSize}|${color}|${roundedShadowBlur}`;
            let entry = prismArrayOuterGlyphCache.get(key);
            if (entry) {
                prismArrayOuterGlyphCache.delete(key);
                prismArrayOuterGlyphCache.set(key, entry);
                return entry;
            }

            const margin = Math.ceil(roundedShadowBlur * 2.6 + roundedFontSize * 0.45 + 4);
            const size = Math.max(18, Math.ceil(roundedFontSize * 1.5 + margin * 2));
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const glyphCtx = canvas.getContext('2d', { alpha: true });
            if (!glyphCtx) return null;

            glyphCtx.textAlign = 'center';
            glyphCtx.textBaseline = 'middle';
            glyphCtx.font = `bold ${roundedFontSize}px Courier New`;
            glyphCtx.fillStyle = color;
            glyphCtx.shadowColor = color;
            glyphCtx.shadowBlur = roundedShadowBlur;
            glyphCtx.fillText(glyph, size / 2, size / 2);

            entry = { canvas, size };
            prismArrayOuterGlyphCache.set(key, entry);
            trimPrismArrayOuterGlyphCache();
            return entry;
        }

        function drawPrismArrayGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#61f7ff', '#ffe66d', '#ff5edb', '#7cff9b', '#ffffff'];
            const profile = getGalaxyVisualProfile(index);
            const animationNow = now * PRISM_ARRAY_ANIMATION_SPEED_SCALE;
            const axis = profile.axis + Math.sin(animationNow * 0.00011 + index) * 0.06;
            const tilt = profile.tilt || 0.72;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, animationNow, highlight);
            const spin = animationNow * 0.00016 * (options.warp && selected ? 1.8 : 1) * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const shimmer = 0.5 + Math.sin(animationNow * 0.0047) * 0.5;
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const warpMode = !!options.warp;
            const spriteBloomMode = !!options.spriteBloom;
            const perGlyphGlowEnabled = glowEnabled && !warpMode && !spriteBloomMode && !options.suppressPerGlyphGlow;
            const vectorGlyphs = !!options.vectorGlyphs;
            const ringCount = Math.max(3, Math.round((5 + highlight) * detail));
            const pointsPerRing = Math.max(9, Math.round((17 + highlight * 5) * detail));
            const brightness = 0.74 + highlight * 0.26;

            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'lighter';

            const aura = galaxyCtx.createRadialGradient(0, 0, radius * 0.06, 0, 0, radius * 1.32);
            aura.addColorStop(0, colorWithAlpha('#ffffff', 0.038 + highlight * 0.006 + glowPulse * 0.006));
            aura.addColorStop(0.32, colorWithAlpha('#ff5edb', 0.042 + highlight * 0.014 + glowPulse * 0.010));
            aura.addColorStop(0.62, colorWithAlpha('#61f7ff', 0.032 + highlight * 0.040 + glowPulse * 0.014));
            aura.addColorStop(1, colorWithAlpha('#ffffff', 0));
            galaxyCtx.fillStyle = aura;
            galaxyCtx.beginPath();
            galaxyCtx.arc(0, 0, radius * 1.34, 0, Math.PI * 2);
            galaxyCtx.fill();

            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length
                ? galaxy.glyphs
                : ['▲', '▶', '▼', '◀', '▴', '▸', '▾', '◂'];
            const cosAxis = Math.cos(axis);
            const sinAxis = Math.sin(axis);
            let lastFont = '';
            const outerCount = Math.max(12, Math.round((40 + highlight * 14) * detail * PRISM_ARRAY_OUTER_RING_DENSITY_SCALE));
            galaxyCtx.save();
            galaxyCtx.rotate(axis + spin * 0.7);
            galaxyCtx.scale(1, tilt * 0.62);
            const outerFontSize = getGalaxyFontPx(Math.max(7, radius * 0.105 * fontScale), options);
            galaxyCtx.font = `bold ${outerFontSize}px Courier New`;
            for (let i = 0; i < outerCount; i++) {
                const angle = (i / outerCount) * Math.PI * 2 + spin * 2.4;
                const stripePulse = 1 + Math.sin(angle * 8 + animationNow * 0.003) * 0.035;
                galaxyCtx.globalAlpha = (0.42 + highlight * 0.28) * (0.72 + Math.sin(angle * 4 + animationNow * 0.001) * 0.18);
                const glyphColor = colors[i % colors.length] || '#ffffff';
                galaxyCtx.fillStyle = glyphColor;
                let outerShadowBlur = 0;
                if (perGlyphGlowEnabled && (highlight > 0.04 || i % 5 === 0)) {
                    galaxyCtx.shadowColor = galaxyCtx.fillStyle;
                    outerShadowBlur = 4 + highlight * (4 + shimmer * 7 + glowPulse * 3);
                    galaxyCtx.shadowBlur = outerShadowBlur;
                } else {
                    galaxyCtx.shadowBlur = 0;
                }
                const gx = Math.cos(angle) * radius * 1.12 * stripePulse;
                const gy = Math.sin(angle) * radius * 1.12 * stripePulse;
                if (vectorGlyphs) {
                    drawPrismArrayVectorGlyph(outerFontSize, gx, gy, angle + Math.PI / 2, i);
                } else {
                    const glyphCanvas = getPrismArrayOuterGlyphCanvas(glyphs[i % glyphs.length], outerFontSize, glyphColor, outerShadowBlur);
                    if (glyphCanvas) {
                        galaxyCtx.shadowBlur = 0;
                        galaxyCtx.drawImage(glyphCanvas.canvas, gx - glyphCanvas.size / 2, gy - glyphCanvas.size / 2);
                    } else {
                        galaxyCtx.fillText(glyphs[i % glyphs.length], gx, gy);
                    }
                }
            }
            galaxyCtx.restore();
            for (let ring = ringCount - 1; ring >= 0; ring--) {
                const ringT = ring / Math.max(1, ringCount - 1);
                const ringRadius = radius * (PRISM_ARRAY_BODY_CLUSTER_INNER_RADIUS + Math.pow(ringT, 1.18) * PRISM_ARRAY_BODY_CLUSTER_SPAN);
                const pulse = 1 + Math.sin(animationNow * 0.0022 + ring * 1.71) * 0.055;
                const localTilt = tilt * (0.5 + ringT * 0.48);
                const pointCount = Math.max(10, pointsPerRing - Math.floor(ring * 1.5));
                for (let i = 0; i < pointCount; i++) {
                    const noise = galaxyNoise((galaxy.seed || 211) + ring * 41, i);
                    const angle = (i / pointCount) * Math.PI * 2 + spin * (1 + ringT * 0.8) + noise * 0.2;
                    const lace = Math.sin(angle * 3 + animationNow * 0.0017 + ring) * radius * 0.04;
                    const localX = Math.cos(angle) * (ringRadius * pulse + lace);
                    const localY = Math.sin(angle) * (ringRadius * pulse) * localTilt;
                    const px = localX * cosAxis - localY * sinAxis;
                    const py = localX * sinAxis + localY * cosAxis;
                    const depth = 0.5 + Math.sin(angle) * 0.5;
                    const fontSize = getGalaxyFontPx(Math.max(7, (7 + (1 - ringT) * 13 + depth * 4) * (0.94 + highlight * 0.12) * fontScale), options);
                    const nextFont = `bold ${fontSize}px Courier New`;
                    if (nextFont !== lastFont) {
                        galaxyCtx.font = nextFont;
                        lastFont = nextFont;
                    }
                    const color = colors[(ring + i) % Math.max(1, colors.length - 1)];
                    const sparkle = noise > 0.86 ? shimmer * 0.24 : 0;
                    const centerDamp = 0.24 + ringT * 0.70;
                    galaxyCtx.globalAlpha = Math.min(1, (0.12 + depth * 0.34 + (1 - ringT) * 0.24 + sparkle) * brightness * centerDamp);
                    galaxyCtx.fillStyle = noise > 0.94 && ringT > 0.42 ? '#ffffff' : color;
                    if (perGlyphGlowEnabled && (highlight > 0.04 || noise > 0.92)) {
                        const centerGlowDamp = 0.36 + ringT * 0.64;
                        galaxyCtx.shadowColor = galaxyCtx.fillStyle;
                        galaxyCtx.shadowBlur = (4 + highlight * (3 + shimmer * 9 + glowPulse * 3)) * centerGlowDamp;
                    } else {
                        galaxyCtx.shadowBlur = 0;
                    }
                    if (vectorGlyphs) {
                        drawPrismArrayVectorGlyph(fontSize, px, py, angle + (ring % 2 ? -0.35 : 0.35), i + ring);
                    } else {
                        galaxyCtx.fillText(glyphs[(i + ring) % glyphs.length], px, py);
                    }
                }
            }

            galaxyCtx.globalAlpha = 0.18 + highlight * 0.010;
            galaxyCtx.shadowColor = '#ffffff';
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (2.0 + highlight * 0.5 + glowPulse * 0.4) : 0;
            galaxyCtx.fillStyle = colorWithAlpha('#ffffff', 0.55);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, (13 + highlight * 1.2) * fontScale), options)}px Courier New`;
            galaxyCtx.fillText(getGalaxyCoreGlyph(galaxy, '▲'), 0, 0);
            galaxyCtx.save();
            galaxyCtx.rotate(-spin * 2.8);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, (8 + highlight) * fontScale), options)}px Courier New`;
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2 + spin * 4;
                galaxyCtx.globalAlpha = 0.12 + highlight * 0.015;
                galaxyCtx.fillStyle = i % 2 ? '#ffffff' : (colors[i % colors.length] || '#ffe66d');
                galaxyCtx.fillText(glyphs[(i * 3) % glyphs.length], Math.cos(angle) * radius * 0.16, Math.sin(angle) * radius * 0.16);
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 0.18 + highlight * 0.012;
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, (8 + highlight) * fontScale), options)}px Courier New`;
            galaxyCtx.fillStyle = colors[1] || '#ffe66d';
            galaxyCtx.fillText(getGalaxyCoreVoidGlyph(galaxy, '▼'), 0, 0);
            galaxyCtx.restore();
            galaxyCtx.globalCompositeOperation = 'source-over';
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
        }

        function drawShipHubGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#8ff7ff', '#6aa8ff', '#ffe66d', '#ffffff'];
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00011 + index) * 0.035);
            const spin = now * 0.00013 * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const pulse = 0.5 + Math.sin(now * 0.0032 + index) * 0.5;
            const shimmer = 0.72 + pulse * 0.28;
            const fontScale = options.fontScale || 1;
            const detail = options.detail || 1;
            const warpMode = !!options.warp;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, now, highlight);

            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.rotate(axis);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'screen';
            drawGalaxySoftAura(colors, radius, selected, 0.92 + glowPulse * 0.13, highlight);

            const ringCount = Math.max(24, Math.round((44 + highlight * 14) * detail));
            galaxyCtx.lineCap = 'round';
            for (let ring = 0; ring < 2; ring++) {
                galaxyCtx.globalAlpha = (0.19 + highlight * 0.15) * (ring ? 0.72 : 1);
                galaxyCtx.strokeStyle = colorWithAlpha(ring ? colors[1] : colors[0], 0.46 + highlight * 0.26);
                galaxyCtx.lineWidth = Math.max(1, radius * (ring ? 0.014 : 0.02));
                galaxyCtx.beginPath();
                galaxyCtx.ellipse(0, 0, radius * (0.94 + ring * 0.16), radius * (0.34 + ring * 0.06), spin * (ring ? -0.7 : 1), 0, Math.PI * 2);
                galaxyCtx.stroke();
            }

            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(6, radius * 0.10 * fontScale), options)}px Courier New`;
            for (let i = 0; i < ringCount; i++) {
                const a = (i / ringCount) * Math.PI * 2 + spin * 1.7;
                const lanePulse = 1 + Math.sin(a * 6 + now * 0.002) * 0.045;
                const px = Math.cos(a) * radius * 1.04 * lanePulse;
                const py = Math.sin(a) * radius * 0.38 * lanePulse;
                galaxyCtx.globalAlpha = (0.32 + highlight * 0.23) * (0.72 + Math.sin(a * 3 + now * 0.001) * 0.18);
                galaxyCtx.fillStyle = i % 7 === 0 ? '#ffffff' : (i % 2 ? colors[0] : colors[1]);
                galaxyCtx.fillText(i % 4 === 0 ? '+' : (i % 4 === 1 ? '=' : (i % 4 === 2 ? '[' : ']')), px, py);
            }

            galaxyCtx.globalCompositeOperation = 'source-over';
            const availableAlpha = galaxy.available ? 1 : 0.34;
            galaxyCtx.globalAlpha = (0.74 + highlight * 0.22) * availableAlpha;
            if (glowEnabled && !warpMode) {
                galaxyCtx.shadowColor = colors[0];
                galaxyCtx.shadowBlur = 8 + highlight * (8 + pulse * 8) + glowPulse * 4;
            }

            galaxyCtx.strokeStyle = colorWithAlpha(colors[0], 0.58 + highlight * 0.26);
            galaxyCtx.lineWidth = Math.max(2, radius * 0.034);
            galaxyCtx.beginPath();
            galaxyCtx.moveTo(-radius * 0.86, 0);
            galaxyCtx.lineTo(radius * 0.86, 0);
            galaxyCtx.moveTo(0, -radius * 0.38);
            galaxyCtx.lineTo(0, radius * 0.38);
            galaxyCtx.stroke();

            galaxyCtx.fillStyle = colorWithAlpha('#071326', 0.88);
            galaxyCtx.strokeStyle = colorWithAlpha('#f6fbff', 0.62 + highlight * 0.26);
            galaxyCtx.lineWidth = Math.max(1, radius * 0.018);
            galaxyCtx.beginPath();
            galaxyCtx.rect(-radius * 0.34, -radius * 0.22, radius * 0.68, radius * 0.44);
            galaxyCtx.fill();
            galaxyCtx.stroke();

            const moduleCount = 4;
            for (let side = -1; side <= 1; side += 2) {
                for (let i = 0; i < moduleCount; i++) {
                    const px = side * radius * (0.47 + i * 0.13);
                    const py = Math.sin(now * 0.002 + i + side) * radius * 0.018;
                    galaxyCtx.fillStyle = i % 2 ? colorWithAlpha(colors[1], 0.42) : colorWithAlpha('#0b2444', 0.88);
                    galaxyCtx.strokeStyle = colorWithAlpha(i % 2 ? colors[0] : colors[2], 0.46 + highlight * 0.26);
                    galaxyCtx.beginPath();
                    galaxyCtx.rect(px - radius * 0.045, py - radius * 0.14, radius * 0.09, radius * 0.28);
                    galaxyCtx.fill();
                    galaxyCtx.stroke();
                }
            }

            for (let side = -1; side <= 1; side += 2) {
                const panelX = side * radius * 0.62;
                const panelY = -radius * 0.37;
                const panelW = radius * 0.36;
                const panelH = radius * 0.17;
                for (let row = -1; row <= 1; row += 2) {
                    galaxyCtx.fillStyle = colorWithAlpha(row < 0 ? colors[1] : colors[0], 0.13 + highlight * 0.09);
                    galaxyCtx.strokeStyle = colorWithAlpha('#8ff7ff', 0.35 + highlight * 0.27);
                    const left = side < 0 ? panelX - panelW : panelX;
                    galaxyCtx.beginPath();
                    galaxyCtx.rect(left, row * panelY - panelH / 2, panelW, panelH);
                    galaxyCtx.fill();
                    galaxyCtx.stroke();
                    galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, radius * 0.065 * fontScale), options)}px Courier New`;
                    galaxyCtx.fillStyle = colorWithAlpha('#ffffff', 0.34 + highlight * 0.24);
                    galaxyCtx.fillText(row < 0 ? 'AI' : 'RL', panelX + side * panelW * 0.52, row * panelY);
                }
            }

            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (8 + highlight * 10 + glowPulse * 5) : 0;
            galaxyCtx.fillStyle = '#f6fbff';
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(12, radius * 0.26 * fontScale), options)}px Courier New`;
            galaxyCtx.fillText('A', 0, -radius * 0.01);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, radius * 0.13 * fontScale), options)}px Courier New`;
            galaxyCtx.fillStyle = colors[2] || '#ffe66d';
            galaxyCtx.fillText('+', 0, radius * 0.13);

            const selectedShip = typeof getSelectedShipConfig === 'function' ? getSelectedShipConfig() : null;
            if (selectedShip && !warpMode) {
                const dockAngle = -spin * 2.2 + Math.PI * 0.62;
                const dockX = Math.cos(dockAngle) * radius * 0.58;
                const dockY = Math.sin(dockAngle) * radius * 0.28 + radius * 0.52;
                const shipGlyph = selectedShip.id === 'glasswing' ? '^' : (selectedShip.id === 'ionManta' ? 'M' : 'A');
                galaxyCtx.save();
                galaxyCtx.translate(dockX, dockY);
                galaxyCtx.rotate(dockAngle + Math.PI / 2);
                galaxyCtx.fillStyle = selectedShip.previewColor || '#ffffff';
                galaxyCtx.shadowColor = selectedShip.previewColor || colors[0];
                galaxyCtx.shadowBlur = glowEnabled ? 10 * shimmer : 0;
                galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, radius * 0.13 * fontScale), options)}px Courier New`;
                galaxyCtx.fillText(shipGlyph, 0, 0);
                galaxyCtx.restore();
            }

            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function getVisualQualityAdjustedGalaxyOptions(options = {}) {
            if (options._visualQualityApplied) return options;
            const detailScale = typeof getVisualQualityScale === 'function' ? getVisualQualityScale('detail') : 1;
            if (Math.abs(detailScale - 1) < 0.001) {
                return { ...options, _visualQualityApplied: true };
            }
            return {
                ...options,
                detail: (options.detail || 1) * detailScale,
                _visualQualityApplied: true
            };
        }

        function drawGalaxyGlyphSpriteDirect(galaxy, x, y, radius, selected, now, index, options = {}) {
            options = getVisualQualityAdjustedGalaxyOptions(options);
            const style = getGalaxyRenderStyle(galaxy);
            if (galaxy && (galaxy.mode === 'shipHub' || style === 'shipHub')) {
                drawShipHubGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
                return;
            }
            if (isPrismArrayGalaxySprite(galaxy)) {
                drawPrismArrayGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
                return;
            }
            if (style === 'tensorMirage') {
                drawTensorMirageGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
                return;
            }
            if (style === 'kernelEye') {
                drawKernelCoronaGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
                return;
            }
            if (style === 'bitshiftSphere') {
                drawBitshiftSphereGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
                return;
            }

            const colors = galaxy.colors || ['#6aa8ff', '#ff5e8a', '#ffffff'];
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00009 + (galaxy.seed || index)) * 0.035);
            const tilt = options.tiltOverride ?? (profile.tilt || galaxy.tilt || 0.5);
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, now, highlight);
            const matrixLayer = style === 'matrixNebula' ? (options.matrixNebulaLayer || '') : '';

            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.translate(x, y);
            galaxyCtx.globalCompositeOperation = 'screen';
            if (style === 'matrixNebula') {
                if (glowEnabled && highlight > 0.01 && matrixLayer !== 'rain' && matrixLayer !== 'foreground') {
                    drawGalaxySoftAura(colors, radius, selected, 0.72 + glowPulse * 0.16, highlight);
                }
                if (matrixLayer === 'rain') {
                    drawMatrixNebulaRain(galaxy, radius, selected, now, index, { ...options, skipPocketGlow: true });
                } else {
                    if (matrixLayer !== 'foreground') {
                        drawMatrixNebulaCloud(galaxy, radius, selected, now, index, options);
                        drawMatrixNebulaRain(galaxy, radius, selected, now, index, matrixLayer === 'background'
                            ? { ...options, pocketsOnly: true }
                            : options);
                    }
                    if (matrixLayer !== 'background') {
                        drawGalaxySpiralArms(galaxy, radius, selected, now, index, options);
                        drawGalaxyCore(galaxy, colors, radius, selected, axis, tilt, options);
                    }
                }
            } else {
                if (glowEnabled && highlight > 0.01) drawGalaxySoftAura(colors, radius, selected, 1 + glowPulse * 0.16, highlight);
                if (style === 'binaryQuasar') drawBinaryQuasarJet(galaxy, radius, axis, now, selected, options);

                drawGalaxySpiralArms(galaxy, radius, selected, now, index, options);

                if (style === 'fractalHalo') {
                    drawFractalCounterHalo(galaxy, radius, selected, now, index, options);
                    drawFractalHaloStorm(galaxy, radius, selected, now, index, options);
                }
                if (style === 'binaryQuasar') drawBinaryQuasarCorePulse(galaxy, radius, selected, now, options);
                drawGalaxyCore(galaxy, colors, radius, selected, axis, tilt, style === 'binaryQuasar'
                    ? {
                        ...options,
                        coreAlphaScale: 0.28,
                        coreFontScale: 0.58,
                        coreShadowScale: 0.20,
                        coreVoidAlphaScale: 0.70
                    }
                    : options);
            }

            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function trimGalaxySelectSpriteCache() {
            while (galaxySelectSpriteFrameCache.size > GALAXY_SELECT_SPRITE_CACHE_MAX) {
                const oldestKey = galaxySelectSpriteFrameCache.keys().next().value;
                galaxySelectSpriteFrameCache.delete(oldestKey);
            }
        }

        function getGalaxySelectSpriteFrameKey(galaxy, index, radius, selected, now, options = {}) {
            const style = getGalaxyRenderStyle(galaxy);
            const matrixLayer = style === 'matrixNebula' ? (options.matrixNebulaLayer || '') : '';
            const matrixRainLayer = matrixLayer === 'rain';
            const selectedFrameFps = matrixRainLayer
                ? GALAXY_SELECT_SPRITE_CACHE_FPS_SELECTED
                : (style === 'matrixNebula'
                ? 24
                : (style === 'fractalHalo'
                    ? 30
                    : (style === 'tensorMirage' ? GALAXY_SELECT_SPRITE_CACHE_FPS_GLYPH_HEAVY_SELECTED : GALAXY_SELECT_SPRITE_CACHE_FPS_SELECTED)));
            const idleFrameFps = matrixRainLayer
                ? GALAXY_SELECT_SPRITE_CACHE_FPS_IDLE
                : (style === 'matrixNebula'
                ? 18
                : (style === 'fractalHalo'
                    ? 20
                    : (style === 'tensorMirage' ? GALAXY_SELECT_SPRITE_CACHE_FPS_GLYPH_HEAVY_IDLE : GALAXY_SELECT_SPRITE_CACHE_FPS_IDLE)));
            const frameFps = options.warp ? GALAXY_WARP_SPRITE_CACHE_FPS : (selected ? selectedFrameFps : idleFrameFps);
            const frameMs = 1000 / frameFps;
            const layerPhaseOffset = matrixLayer === 'background'
                ? 0.23
                : (matrixLayer === 'rain'
                    ? 0.59
                    : (matrixLayer === 'foreground' ? 0.83 : 0));
            const stylePhaseOffset = matrixLayer
                ? layerPhaseOffset
                : (style === 'tensorMirage'
                    ? 0.37
                    : (style === 'binaryQuasar'
                        ? 0.51
                        : (style === 'bitshiftDwarf' ? 0.69 : 0)));
            const phaseOffset = ((index % 7) + stylePhaseOffset) * frameMs / 7;
            const bucket = Math.floor((now + phaseOffset) / frameMs);
            const radiusKey = Math.round(radius * 2);
            const detailKey = Math.round((options.detail || 1) * 100);
            const fontKey = Math.round((options.fontScale || 1) * 100);
            const highlightKey = Math.round(getGalaxyOptionHighlightAmount(options, selected) * 24);
            return {
                key: [
                    width,
                    height,
                    galaxy && galaxy.id ? galaxy.id : index,
                    index,
                    selected ? 1 : 0,
                    options.warp ? 1 : 0,
                    glowEnabled ? 1 : 0,
                    matrixLayer,
                    radiusKey,
                    detailKey,
                    fontKey,
                    highlightKey,
                    galaxy && galaxy.mode === 'shipHub' && typeof getSelectedShipConfig === 'function'
                        ? getSelectedShipConfig().id
                        : ''
                ].join('|'),
                bucket,
                bucketNow: bucket * frameMs - phaseOffset
            };
        }

        function drawGalaxyGlyphSprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            options = getVisualQualityAdjustedGalaxyOptions(options);
            if (options && options.noCache) {
                drawGalaxyGlyphSpriteDirect(galaxy, x, y, radius, selected, now, index, options);
                return;
            }
            const style = getGalaxyRenderStyle(galaxy);
            if (style === 'matrixNebula' && !options.warp && !options.matrixNebulaLayer) {
                drawGalaxyGlyphSprite(galaxy, x, y, radius, selected, now, index, {
                    ...options,
                    matrixNebulaLayer: 'background'
                });
                drawGalaxyGlyphSprite(galaxy, x, y, radius, selected, now, index, {
                    ...options,
                    matrixNebulaLayer: 'rain'
                });
                drawGalaxyGlyphSprite(galaxy, x, y, radius, selected, now, index, {
                    ...options,
                    matrixNebulaLayer: 'foreground'
                });
                return;
            }

            const { key, bucket, bucketNow } = getGalaxySelectSpriteFrameKey(galaxy, index, radius, selected, now, options);
            let entry = galaxySelectSpriteFrameCache.get(key);
            if (entry) {
                galaxySelectSpriteFrameCache.delete(key);
                galaxySelectSpriteFrameCache.set(key, entry);
            } else {
                const highlight = getGalaxyOptionHighlightAmount(options, selected);
                const cacheRadius = Math.ceil(radius * (4.05 + highlight * 0.30) + 48);
                const cacheCanvas = document.createElement('canvas');
                cacheCanvas.width = cacheRadius;
                cacheCanvas.height = cacheRadius;
                entry = {
                    canvas: cacheCanvas,
                    ctx: cacheCanvas.getContext('2d', { alpha: true }),
                    size: cacheRadius,
                    bucket: -1
                };
                if (!entry.ctx) {
                    galaxySelectSpriteFrameCache.delete(key);
                    drawGalaxyGlyphSpriteDirect(galaxy, x, y, radius, selected, now, index, options);
                    return;
                }
                galaxySelectSpriteFrameCache.set(key, entry);
                trimGalaxySelectSpriteCache();
            }

            if (entry.bucket !== bucket) {
                const cacheCtx = entry.ctx;
                const previousCtx = galaxyCtx;
                const highlight = getGalaxyOptionHighlightAmount(options, selected);
                const spriteBloom = selected
                    && !options.warp
                    && glowEnabled
                    && style === 'binaryQuasar'
                    && cacheCtx
                    && ('filter' in cacheCtx);
                galaxyCtx = cacheCtx;
                cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
                cacheCtx.clearRect(0, 0, entry.canvas.width, entry.canvas.height);
                cacheCtx.globalAlpha = 1;
                cacheCtx.globalCompositeOperation = 'source-over';
                cacheCtx.shadowBlur = 0;
                try {
                    drawGalaxyGlyphSpriteDirect(galaxy, entry.canvas.width / 2, entry.canvas.height / 2, radius, selected, bucketNow, index, {
                        ...options,
                        noCache: true,
                        spriteBloom
                    });
                    if (spriteBloom) applyGalaxySpriteBloom(cacheCtx, entry.canvas, highlight, style === 'binaryQuasar' ? 0.36 : 1);
                } finally {
                    galaxyCtx = previousCtx;
                }
                entry.bucket = bucket;
            }

            galaxyCtx.drawImage(entry.canvas, x - entry.size / 2, y - entry.size / 2);
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function getGalaxyCursorRestBounds() {
            return {
                minX: 52,
                maxX: Math.max(52, width - 52),
                minY: Math.max(128, height * 0.16),
                maxY: Math.max(128, height - 128)
            };
        }

        function getGalaxyCursorRestCandidate(slot, angle, distance) {
            const bounds = getGalaxyCursorRestBounds();
            const rawX = slot.x + Math.cos(angle) * distance;
            const rawY = slot.y + Math.sin(angle) * distance;
            const x = Math.max(bounds.minX, Math.min(bounds.maxX, rawX));
            const y = Math.max(bounds.minY, Math.min(bounds.maxY, rawY));
            return {
                x,
                y,
                clampDistance: Math.hypot(rawX - x, rawY - y),
                bounds
            };
        }

        function scoreGalaxyCursorRestCandidate(candidate, slot, radius) {
            const edgeRoom = Math.min(
                candidate.x - candidate.bounds.minX,
                candidate.bounds.maxX - candidate.x,
                candidate.y - candidate.bounds.minY,
                candidate.bounds.maxY - candidate.y
            );
            let score = candidate.clampDistance * 3 + Math.max(0, 22 - edgeRoom) * 2;
            const labelTop = slot.y + radius + 2;
            const labelBottom = labelTop + 50;
            const labelHalfW = Math.max(82, radius * 1.35);
            if (candidate.y >= labelTop && candidate.y <= labelBottom) {
                const labelOverlap = 1 - Math.min(1, Math.abs(candidate.x - slot.x) / labelHalfW);
                score += labelOverlap * 84;
            }
            return score;
        }

        function refreshGalaxySelectCursorRestPose(index, slot, radius, profile) {
            const baseAngle = Number.isFinite(profile && profile.cursorAngle) ? profile.cursorAngle : -0.7;
            const candidates = [];
            for (let i = 0; i < GALAXY_SELECT_CURSOR_RANDOM_CANDIDATES; i++) {
                const angle = normalizePauseCursorAngle(baseAngle + (Math.random() - 0.5) * Math.PI * 2);
                const distanceNoise = Math.random();
                const candidate = getGalaxyCursorRestCandidate(
                    slot,
                    angle,
                    radius + GALAXY_SELECT_CURSOR_REST_BASE_OFFSET + distanceNoise * GALAXY_SELECT_CURSOR_REST_RANDOM_OFFSET
                );
                candidates.push({
                    angle,
                    distanceNoise,
                    approachNoise: Math.random(),
                    bendNoise: Math.random(),
                    scaleNoise: Math.random(),
                    score: scoreGalaxyCursorRestCandidate(candidate, slot, radius) + Math.random() * 7
                });
            }
            candidates.sort((a, b) => a.score - b.score);
            const pickCount = Math.max(1, Math.min(4, candidates.length));
            const pick = candidates[Math.floor(Math.random() * pickCount)] || candidates[0];
            galaxySelectCursorRestPose = {
                index,
                token: galaxySelectCursorRestPose.token + 1,
                angle: pick.angle,
                distanceNoise: pick.distanceNoise,
                approachNoise: pick.approachNoise,
                bendNoise: pick.bendNoise,
                scaleNoise: pick.scaleNoise
            };
            return galaxySelectCursorRestPose;
        }

        function getGalaxySelectCursorRestPose(index, slot, radius, profile) {
            if (galaxySelectCursorRestPose.index !== index) {
                return refreshGalaxySelectCursorRestPose(index, slot, radius, profile);
            }
            return galaxySelectCursorRestPose;
        }

        function resetGalaxySelectCursorRestPose() {
            galaxySelectCursorRestPose.index = -1;
        }

        function getGalaxyCursorTarget(slot, radius, galaxy, index, now) {
            const profile = getGalaxyVisualProfile(index);
            if (galaxy && galaxy.mode === 'shipHub') {
                if (typeof isTerminalDockExitHoldActive === 'function' && isTerminalDockExitHoldActive(index)) {
                    const exitPose = typeof getTerminalDockExitCursorPose === 'function'
                        ? getTerminalDockExitCursorPose(index)
                        : null;
                    if (exitPose) {
                        const restY = exitPose.y + Math.sin(now * 0.0016 + index) * 2.2;
                        return {
                            x: exitPose.x,
                            y: restY,
                            faceX: exitPose.faceX,
                            faceY: exitPose.faceY + (restY - exitPose.y) * 0.25,
                            scale: exitPose.scale,
                            key: `terminal-outbound-${index}`,
                            color: galaxy.colors ? galaxy.colors[0] : currentThemeColor,
                            floaty: true,
                            suppressGuide: true
                        };
                    }
                }
                const dockX = slot.x - radius * 0.64;
                const dockY = slot.y;
                const restX = Math.max(42, dockX - radius * 0.82);
                const restY = dockY + Math.sin(now * 0.0018) * 2.5;
                return {
                    x: restX,
                    y: restY,
                    faceX: dockX,
                    faceY: dockY,
                    approachX: Math.max(24, restX - radius * 0.74),
                    approachY: dockY + radius * 0.18,
                    scale: 0.23,
                    key: `terminal-${index}`,
                    color: galaxy.colors ? galaxy.colors[0] : currentThemeColor,
                    floaty: true
                };
            }
            const pose = getGalaxySelectCursorRestPose(index, slot, radius, profile);
            const angle = pose.angle;
            const distance = radius + GALAXY_SELECT_CURSOR_REST_BASE_OFFSET + pose.distanceNoise * GALAXY_SELECT_CURSOR_REST_RANDOM_OFFSET;
            const restPoint = getGalaxyCursorRestCandidate(slot, angle, distance);
            const targetX = restPoint.x;
            const targetY = restPoint.y;
            const approachDistance = distance + GALAXY_SELECT_CURSOR_APPROACH_BASE_OFFSET + pose.approachNoise * GALAXY_SELECT_CURSOR_APPROACH_RANDOM_OFFSET;
            const bend = (pose.bendNoise - 0.5) * 48;
            const normalX = -Math.sin(angle);
            const normalY = Math.cos(angle);
            return {
                x: targetX,
                y: targetY,
                faceX: slot.x,
                faceY: slot.y,
                approachX: Math.max(24, Math.min(width - 24, slot.x + Math.cos(angle) * approachDistance + normalX * bend)),
                approachY: Math.max(80, Math.min(height - 100, slot.y + Math.sin(angle) * approachDistance + normalY * bend)),
                scale: 0.22 + pose.scaleNoise * 0.035,
                key: `galaxy-${index}-${pose.token}`,
                color: galaxy.colors ? galaxy.colors[0] : currentThemeColor,
                floaty: true
            };
        }

        function drawGalaxyCursorGuide(target, color, now) {
            if (!target) return;
            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            const dx = target.faceX - target.x;
            const dy = target.faceY - target.y;
            const distance = Math.hypot(dx, dy);
            const steps = Math.max(6, Math.min(18, Math.floor(distance / 24)));
            for (let i = 1; i < steps; i++) {
                const t = i / steps;
                const pulse = 0.5 + Math.sin(now * 0.0032 + i * 0.75) * 0.5;
                const sag = Math.sin(t * Math.PI) * 10;
                const nx = -dy / Math.max(1, distance);
                const ny = dx / Math.max(1, distance);
                const x = target.x + dx * t + nx * sag;
                const y = target.y + dy * t + ny * sag;
                galaxyCtx.globalAlpha = (0.04 + pulse * 0.07) * (1 - Math.abs(t - 0.5) * 0.55);
                galaxyCtx.fillStyle = i % 3 === 0 ? '#ffffff' : color;
                galaxyCtx.font = `bold ${i % 3 === 0 ? 8 : 6}px Courier New`;
                galaxyCtx.fillText(i % 3 === 0 ? '+' : '.', x, y);
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
        }

        function primeGalaxySelectIntroCursorFlyIn(target, now) {
            if (galaxySelectIntroCursorPrimed || !target || !pauseMenuShipCursor || pauseMenuShipCursor.initialized) return;

            const cursor = pauseMenuShipCursor;
            const startX = -GALAXY_SELECT_INTRO_CURSOR_START_MARGIN;
            const startY = Math.max(96, Math.min(height - 120, target.y + 10));
            const dx = target.x - startX;
            const dy = target.y - startY;
            const targetKey = target.key || '';

            cursor.x = startX;
            cursor.y = startY;
            cursor.vx = Math.max(280, Math.min(520, Math.abs(dx) * 2.8));
            cursor.vy = dy * 1.8;
            cursor.rot = Math.atan2(dy, dx) + Math.PI / 2;
            cursor.scale = target.scale || 0.24;
            cursor.speed = Math.hypot(cursor.vx, cursor.vy);
            cursor.trail = [];
            cursor.trailEmitAcc = 0;
            cursor.settleBlend = 0;
            cursor.initialized = true;
            cursor.lastNow = now || currentFrameNow || performance.now();
            cursor.targetKey = targetKey;
            cursor.routeKey = targetKey;
            cursor.approachComplete = true;
            cursor.renderX = startX;
            cursor.renderY = startY;
            cursor.renderRot = cursor.rot;
            cursor.renderScale = cursor.scale;
            galaxySelectIntroCursorPrimed = true;
        }

        function drawGalaxySelectCursor(target, options = {}) {
            if (options.introFlyIn) primeGalaxySelectIntroCursorFlyIn(target, currentFrameNow);
            const cursor = updatePauseMenuShipCursor(target, currentFrameNow);
            if (!cursor) return;
            const speedRatio = Math.min(1, cursor.speed / 310);
            pauseMenuShipCursor.renderX = cursor.x;
            pauseMenuShipCursor.renderY = cursor.y;
            pauseMenuShipCursor.renderRot = cursor.rot;
            pauseMenuShipCursor.renderScale = cursor.scale;
            if (pauseMenuShipCursor.trail.length > GALAXY_CURSOR_TRAIL_MAX) {
                pauseMenuShipCursor.trail.splice(0, pauseMenuShipCursor.trail.length - GALAXY_CURSOR_TRAIL_MAX);
            }
            if (!options.suppressTrail) drawPauseMenuShipTrail(cursor.dt);
            galaxyCtx.save();
            galaxyCtx.translate(cursor.x, cursor.y);
            galaxyCtx.rotate(cursor.rot);
            galaxyCtx.scale(cursor.scale, cursor.scale);
            PAUSE_CURSOR_SHIP.x = 0;
            PAUSE_CURSOR_SHIP.y = 0;
            PAUSE_CURSOR_SHIP.vx = 0;
            PAUSE_CURSOR_SHIP.vy = 0;
            PAUSE_CURSOR_SHIP.shipId = typeof getSelectedShipConfig === 'function' ? getSelectedShipConfig().id : 'arrowhead';
            PAUSE_CURSOR_SHIP._renderLayoutCache = null;
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.fillStyle = '#f6fbff';
            galaxyCtx.shadowColor = target.color || currentThemeColor;
            galaxyCtx.shadowBlur = glowEnabled ? 14 : 0;
            drawPlayerShip(PAUSE_CURSOR_SHIP, 'center');
            galaxyCtx.restore();
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalAlpha = 1;
            if (!options.suppressTrail) emitPauseMenuShipExhaustTrail(cursor, currentFrameNow, speedRatio * 0.75, 0.46, GALAXY_CURSOR_TRAIL_MAX);
        }

        function drawCenteredWrappedText(text, x, y, maxWidth, lineHeight, font, color, maxLines = 2) {
            const words = String(text || '').split(/\s+/).filter(Boolean);
            const lines = [];
            let current = '';
            galaxyCtx.save();
            galaxyCtx.font = font;
            galaxyCtx.fillStyle = color;
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            for (const word of words) {
                const next = current ? `${current} ${word}` : word;
                if (galaxyCtx.measureText(next).width <= maxWidth || !current) {
                    current = next;
                } else {
                    lines.push(current);
                    current = word;
                }
                if (lines.length >= maxLines) break;
            }
            if (current && lines.length < maxLines) lines.push(current);
            if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
                while (galaxyCtx.measureText(`${lines[maxLines - 1]}...`).width > maxWidth && lines[maxLines - 1].length > 4) {
                    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1).trim();
                }
                lines[maxLines - 1] = `${lines[maxLines - 1]}...`;
            }
            const startY = y - ((lines.length - 1) * lineHeight) / 2;
            for (let i = 0; i < lines.length; i++) {
                galaxyCtx.fillText(lines[i], x, startY + i * lineHeight);
            }
            galaxyCtx.restore();
            return lines.length;
        }

        function drawGalaxyLayoutEditorOverlay(now, galaxies, selectedIndex) {
            if (!galaxyLayoutEditMode) return;
            updateGalaxyLayoutEditorHover();
            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.lineWidth = 1;

            for (let i = 0; i < galaxies.length; i++) {
                const galaxy = galaxies[i];
                const slot = getGalaxySelectSlot(i);
                const selected = i === selectedIndex;
                const hot = i === galaxyLayoutHoverIndex || (galaxyLayoutDragState.active && i === galaxyLayoutDragState.index);
                const radius = getGalaxySelectRenderRadius(i, selected);
                const color = (galaxy && galaxy.colors && galaxy.colors[0]) || currentThemeColor;
                galaxyCtx.globalAlpha = hot ? 0.9 : 0.46;
                galaxyCtx.strokeStyle = hot ? colorWithAlpha('#ffffff', 0.86) : colorWithAlpha(color, 0.58);
                galaxyCtx.setLineDash(hot ? [] : [5, 5]);
                galaxyCtx.beginPath();
                galaxyCtx.arc(slot.x, slot.y, Math.max(24, radius * 0.72), 0, Math.PI * 2);
                galaxyCtx.stroke();
                galaxyCtx.setLineDash([]);
                galaxyCtx.fillStyle = hot ? '#ffffff' : colorWithAlpha('#dcecff', 0.72);
                galaxyCtx.shadowColor = color;
                galaxyCtx.shadowBlur = glowEnabled && hot ? 8 : 0;
                galaxyCtx.font = `bold ${hot ? 12 : 10}px Courier New`;
                galaxyCtx.fillText(String(i + 1), slot.x, slot.y - Math.max(30, radius * 0.78));
                if (hot) {
                    const profile = GALAXY_SELECT_LAYOUT[i];
                    galaxyCtx.font = `bold 9px Courier New`;
                    galaxyCtx.fillStyle = colorWithAlpha('#dcecff', 0.76);
                    galaxyCtx.fillText(
                        `S ${formatGalaxyLayoutNumber(profile.scale)}  R ${formatGalaxyLayoutNumber(profile.axis)}`,
                        slot.x,
                        slot.y + Math.max(30, radius * 0.76)
                    );
                }
            }

            const panelW = Math.min(500, width * 0.70);
            const panelH = 40;
            const panelX = width / 2 - panelW / 2;
            const panelY = height * 0.145;
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.fillStyle = 'rgba(2, 8, 18, 0.72)';
            galaxyCtx.fillRect(panelX, panelY, panelW, panelH);
            galaxyCtx.strokeStyle = colorWithAlpha('#8ff7ff', 0.42);
            galaxyCtx.strokeRect(panelX + 0.5, panelY + 0.5, panelW, panelH);
            galaxyCtx.font = `bold 12px 'Electrolize', sans-serif`;
            galaxyCtx.fillStyle = '#dcecff';
            galaxyCtx.fillText('LAYOUT EDIT', width / 2, panelY + 14);
            galaxyCtx.font = `10px 'Electrolize', sans-serif`;
            galaxyCtx.fillStyle = 'rgba(202,229,255,0.66)';
            galaxyCtx.fillText('DRAG MOVE  |  WHEEL SCALE  |  SHIFT+WHEEL ROTATE  |  layout copy/reset', width / 2, panelY + 29);
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
        }

        function prefersGalaxySelectIntroReducedMotion() {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        function startGalaxySelectIntroReveal(now = currentFrameNow || performance.now()) {
            if (galaxySelectIntroRevealComplete) return;
            galaxySelectIntroRevealStart = now;
            galaxySelectIntroCursorPrimed = false;
            if (typeof resetPauseMenuShipCursor === 'function') {
                resetPauseMenuShipCursor();
            }
        }

        function getGalaxySelectIntroRevealAlpha(now) {
            if (galaxySelectIntroRevealComplete || gameState !== 'GALAXY_SELECT' || prefersGalaxySelectIntroReducedMotion()) {
                galaxySelectIntroRevealComplete = true;
                return 1;
            }
            if (galaxySelectIntroRevealStart === null) {
                galaxySelectIntroRevealStart = now;
            }
            const t = Math.max(0, Math.min(1, (now - galaxySelectIntroRevealStart) / GALAXY_SELECT_INTRO_REVEAL_DURATION));
            if (t >= 1) {
                galaxySelectIntroRevealComplete = true;
                return 1;
            }
            return t * t * (3 - 2 * t);
        }

        function ensureGalaxySelectIntroContentLayer() {
            if (
                galaxySelectIntroContentLayer.canvas &&
                galaxySelectIntroContentLayer.ctx &&
                galaxySelectIntroContentLayer.width === width &&
                galaxySelectIntroContentLayer.height === height
            ) {
                return galaxySelectIntroContentLayer;
            }
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            galaxySelectIntroContentLayer.width = canvas.width;
            galaxySelectIntroContentLayer.height = canvas.height;
            galaxySelectIntroContentLayer.canvas = canvas;
            galaxySelectIntroContentLayer.ctx = canvas.getContext('2d', { alpha: true });
            return galaxySelectIntroContentLayer;
        }

        function drawGalaxySelectGalaxyLayerDirect(now, selectedIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            for (let i = 0; i < galaxies.length; i++) {
                const galaxy = galaxies[i];
                const slot = getGalaxySelectSlot(i);
                const selected = i === selectedIndex;
                const highlight = getGalaxySelectHighlightAmount(i, selected, now);
                const radius = getGalaxySelectRenderRadius(i, selected, highlight);
                drawGalaxyGlyphSprite(galaxy, slot.x, slot.y, radius, selected, now, i, {
                    highlightAmount: selected ? 1 : 0
                });

                if (selected) {
                    const cursorTarget = getGalaxyCursorTarget(slot, radius, galaxy, i, now);
                    if (cursorTarget && !cursorTarget.suppressGuide) {
                        drawGalaxyCursorGuide(cursorTarget, galaxy.colors ? galaxy.colors[0] : currentThemeColor, now);
                    }
                }
            }
        }

        function drawGalaxySelectWorldLayerDirect(now, selectedIndex) {
            drawGalaxySelectBackground(now);
            drawGalaxySelectGalaxyLayerDirect(now, selectedIndex);
        }

        function addSortedGradientStops(gradient, stops) {
            stops
                .map(stop => ({
                    offset: Math.max(0, Math.min(1, stop.offset)),
                    color: stop.color
                }))
                .sort((a, b) => a.offset - b.offset)
                .forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        }

        function drawGalaxySelectUiLayer(now, galaxies, selectedIndex) {
            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.font = `bold 34px 'Electrolize', sans-serif`;
            galaxyCtx.fillStyle = '#f2fbff';
            galaxyCtx.shadowColor = currentThemeColor;
            galaxyCtx.shadowBlur = glowEnabled ? 18 : 0;
            galaxyCtx.fillText('GALAXY SELECT', width / 2, height * 0.085);
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.font = `12px 'Electrolize', sans-serif`;
            galaxyCtx.fillStyle = 'rgba(202, 229, 255, 0.72)';
            galaxyCtx.fillText('Choose your destination', width / 2, height * 0.123);

            for (let i = 0; i < galaxies.length; i++) {
                const galaxy = galaxies[i];
                const slot = getGalaxySelectSlot(i);
                const selected = i === selectedIndex;
                const highlight = getGalaxySelectHighlightAmount(i, selected, now);
                const radius = getGalaxySelectRenderRadius(i, selected, highlight);

                const hubRoute = galaxy && galaxy.mode === 'shipHub';
                const survivorRoute = galaxy && galaxy.mode === 'survivor';
                const crawlerRoute = galaxy && galaxy.mode === 'matrixCrawler';
                const labelY = slot.y + radius + 16;
                const labelText = galaxy.title || galaxy.name;
                const titleAlpha = galaxy.available ? (0.62 + highlight * 0.28) : (0.34 + highlight * 0.16);
                galaxyCtx.font = `bold ${14 + highlight * 4}px 'Electrolize', sans-serif`;
                const labelWidth = Math.max(70, galaxyCtx.measureText(labelText).width);
                const titleGradient = galaxyCtx.createLinearGradient(slot.x - labelWidth / 2, labelY, slot.x + labelWidth / 2, labelY);
                const titleColors = galaxy.colors && galaxy.colors.length ? galaxy.colors : [currentThemeColor, '#ffffff'];
                const titleNeutral = galaxy.available ? '#dcecff' : '#9da7b8';
                const titleMix = galaxy.available ? (0.72 - highlight * 0.14) : 0.82;
                for (let colorIndex = 0; colorIndex < titleColors.length; colorIndex++) {
                    const stop = titleColors.length === 1 ? 0 : colorIndex / (titleColors.length - 1);
                    const softenedColor = mixColor(titleColors[colorIndex], titleNeutral, titleMix);
                    titleGradient.addColorStop(stop, colorWithAlpha(softenedColor, titleAlpha));
                }
                galaxyCtx.fillStyle = titleGradient;
                galaxyCtx.shadowColor = galaxy.colors ? (galaxy.colors[1] || galaxy.colors[0]) : currentThemeColor;
                galaxyCtx.shadowBlur = glowEnabled ? 9 * highlight : 0;
                galaxyCtx.fillText(labelText, slot.x, labelY);
                if (highlight > 0.02) {
                    const scanPhase = (now * 0.00022 + i * 0.19) % 1;
                    const scanGradient = galaxyCtx.createLinearGradient(slot.x - labelWidth / 2, labelY, slot.x + labelWidth / 2, labelY);
                    const scanColor = galaxy.available ? (galaxy.colors ? (galaxy.colors[1] || galaxy.colors[0]) : currentThemeColor) : '#dce2ee';
                    addSortedGradientStops(scanGradient, [
                        { offset: 0, color: 'rgba(255,255,255,0)' },
                        { offset: scanPhase - 0.18, color: 'rgba(255,255,255,0)' },
                        { offset: scanPhase - 0.04, color: colorWithAlpha(mixColor(scanColor, '#ffffff', 0.48), (galaxy.available ? 0.18 : 0.08) * highlight) },
                        { offset: scanPhase, color: colorWithAlpha('#ffffff', (galaxy.available ? 0.34 : 0.16) * highlight) },
                        { offset: scanPhase + 0.13, color: 'rgba(255,255,255,0)' },
                        { offset: 1, color: 'rgba(255,255,255,0)' }
                    ]);
                    galaxyCtx.fillStyle = scanGradient;
                    galaxyCtx.shadowBlur = glowEnabled ? 6 * highlight : 0;
                    galaxyCtx.fillText(labelText, slot.x, labelY);
                }
                galaxyCtx.shadowBlur = 0;
                galaxyCtx.font = `bold 11px 'Electrolize', sans-serif`;
                const statusText = galaxy.available
                    ? (galaxy.subtitle || (hubRoute ? 'SHIP HUB' : (survivorRoute ? 'SURVIVAL RUN' : (crawlerRoute ? 'NODE CRAWLER' : 'BULLET FLIGHT'))))
                    : 'LOCKED';
                galaxyCtx.fillStyle = galaxy.available
                    ? colorWithAlpha('#8edbff', 0.62 + highlight * 0.24)
                    : colorWithAlpha('#a9b0bf', 0.48 + highlight * 0.20);
                galaxyCtx.shadowColor = galaxy.available ? '#42cfff' : '#707989';
                galaxyCtx.shadowBlur = glowEnabled ? (galaxy.available ? 5 : 2) * highlight : 0;
                galaxyCtx.fillText(statusText, slot.x, labelY + 20);
                galaxyCtx.shadowBlur = 0;

            }

            const selectedGalaxy = galaxies[selectedIndex] || galaxies[0];
            const descY = height * 0.862;
            const descLines = drawCenteredWrappedText(
                (selectedGalaxy.desc || '').toUpperCase(),
                width / 2,
                descY,
                Math.min(760, width * 0.82),
                18,
                `bold 13px 'Electrolize', sans-serif`,
                selectedGalaxy.available ? '#dcecff' : 'rgba(210,220,235,0.58)',
                2
            );
            const promptY = descY + descLines * 14 + 22;
            if (galaxySelectNoticeTimer > 0 && galaxySelectNotice) {
                galaxyCtx.font = `bold 18px 'Electrolize', sans-serif`;
                galaxyCtx.fillStyle = '#ff8fb5';
                galaxyCtx.shadowColor = '#ff5e8a';
                galaxyCtx.shadowBlur = glowEnabled ? 12 : 0;
                galaxyCtx.fillText(galaxySelectNotice, width / 2, promptY);
            } else {
                galaxyCtx.font = `12px 'Electrolize', sans-serif`;
                galaxyCtx.fillStyle = 'rgba(202, 229, 255, 0.58)';
                galaxyCtx.fillText('ENTER / SPACE TO SELECT    ESC FOR MENU', width / 2, promptY);
            }
            drawGalaxyLayoutEditorOverlay(now, galaxies, selectedIndex);
            galaxyCtx.restore();
        }

        function drawGalaxySelectBaseLayerDirect(now, selectedIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            drawGalaxySelectWorldLayerDirect(now, selectedIndex);
            drawGalaxySelectUiLayer(now, galaxies, selectedIndex);
        }

        function drawGalaxySelectContentDirect(now, selectedIndex, showCursor = true) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            drawGalaxySelectGalaxyLayerDirect(now, selectedIndex);
            drawGalaxySelectUiLayer(now, galaxies, selectedIndex);
            const cursorTarget = showCursor ? getGalaxySelectCurrentCursorTarget(now, selectedIndex) : null;
            if (showCursor && cursorTarget) drawGalaxySelectCursor(cursorTarget, { suppressTrail: true });
        }

        function drawGalaxySelectIntroContentLayer(now, selectedIndex, showCursor, alpha) {
            const layer = ensureGalaxySelectIntroContentLayer();
            if (!layer || !layer.ctx || !layer.canvas) {
                drawGalaxySelectContentDirect(now, selectedIndex, showCursor);
                return;
            }

            const previousGalaxyCtx = galaxyCtx;
            galaxyCtx = layer.ctx;
            layer.ctx.setTransform(1, 0, 0, 1, 0, 0);
            layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
            layer.ctx.globalAlpha = 1;
            layer.ctx.globalCompositeOperation = 'source-over';
            layer.ctx.shadowBlur = 0;
            try {
                drawGalaxySelectContentDirect(now, selectedIndex, false);
            } finally {
                galaxyCtx = previousGalaxyCtx;
            }

            galaxyCtx.save();
            galaxyCtx.globalAlpha = alpha;
            galaxyCtx.drawImage(layer.canvas, 0, 0);
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;

            const cursorTarget = showCursor ? getGalaxySelectCurrentCursorTarget(now, selectedIndex) : null;
            if (showCursor && cursorTarget) {
                galaxyCtx.save();
                galaxyCtx.globalAlpha = alpha;
                drawGalaxySelectCursor(cursorTarget, { suppressTrail: true, introFlyIn: true });
                galaxyCtx.restore();
                galaxyCtx.globalAlpha = 1;
                galaxyCtx.shadowBlur = 0;
            }
        }

        function getGalaxySelectCurrentCursorTarget(now, selectedIndex = selectedGalaxyIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            const galaxy = galaxies[selectedIndex] || galaxies[0];
            if (!galaxy) return null;
            const slot = getGalaxySelectSlot(selectedIndex);
            const highlight = getGalaxySelectHighlightAmount(selectedIndex, true, now);
            const radius = getGalaxySelectRenderRadius(selectedIndex, true, highlight);
            return getGalaxyCursorTarget(slot, radius, galaxy, selectedIndex, now);
        }

        function drawGalaxySelectScreen(now, showCursor = true) {
            const revealAlpha = getGalaxySelectIntroRevealAlpha(now);
            if (revealAlpha < 0.999) {
                drawGalaxySelectBackground(now);
                drawGalaxySelectIntroContentLayer(now, selectedGalaxyIndex, showCursor, revealAlpha);
                return;
            }
            drawGalaxySelectBaseLayerDirect(now, selectedGalaxyIndex);
            const cursorTarget = showCursor ? getGalaxySelectCurrentCursorTarget(now, selectedGalaxyIndex) : null;
            if (showCursor && cursorTarget) drawGalaxySelectCursor(cursorTarget);
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

        function easeGalaxyWarp(t) {
            const clamped = Math.max(0, Math.min(1, t));
            return clamped * clamped * (3 - clamped * 2);
        }

        function lerpGalaxyWarp(a, b, t) {
            return a + (b - a) * t;
        }

        function getGalaxyWarpCamera(progress, targetX, targetY) {
            const fadeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.02) / 0.34)));
            const focusT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.04) / 0.58)));
            const zoomT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.22) / 0.58)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.56) / 0.32)));
            const handoffT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.80) / 0.18)));
            const pullX = Math.min(1, focusT * 0.78 + surgeT * 0.18 + handoffT * 0.04);
            const pullY = Math.min(1, focusT * 0.74 + surgeT * 0.20 + handoffT * 0.06);
            return {
                focusX: lerpGalaxyWarp(targetX, width / 2, pullX),
                focusY: lerpGalaxyWarp(targetY, height * 0.48, pullY),
                zoom: 1 + focusT * 0.12 + zoomT * 0.22 + surgeT * 0.42 + handoffT * 0.22,
                fadeT,
                focusT,
                zoomT,
                surgeT,
                handoffT
            };
        }

        function galaxyWarpWorldToScreen(x, y, camera, targetX, targetY) {
            return {
                x: camera.focusX + (x - targetX) * camera.zoom,
                y: camera.focusY + (y - targetY) * camera.zoom
            };
        }

        function drawGalaxyWarpWorldLayer(now, selectedIndex) {
            drawGalaxySelectWorldLayerDirect(now, selectedIndex);
        }

        function prepareGalaxyWarpMenuSnapshot(now = currentFrameNow || performance.now(), selectedIndex = selectedGalaxyIndex) {
            if (width <= 0 || height <= 0) return null;
            const stamp = Math.floor((now || 0) / 50);
            const selectedShipForSnapshot = typeof getSelectedShipConfig === 'function'
                ? getSelectedShipConfig()
                : null;
            const selectedShipKey = selectedShipForSnapshot && selectedShipForSnapshot.id
                ? selectedShipForSnapshot.id
                : '';
            const cache = galaxyWarpMenuSnapshotCache;
            if (
                cache.canvas &&
                cache.width === width &&
                cache.height === height &&
                cache.selectedIndex === selectedIndex &&
                cache.shipKey === selectedShipKey &&
                cache.stamp === stamp
            ) {
                return cache.canvas;
            }
            if (!cache.canvas) cache.canvas = document.createElement('canvas');
            if (cache.canvas.width !== width || cache.canvas.height !== height) {
                cache.canvas.width = width;
                cache.canvas.height = height;
            }
            const cacheCtx = cache.canvas.getContext('2d', { alpha: false });
            if (!cacheCtx) return null;
            const previousCtx = galaxyCtx;
            galaxyCtx = cacheCtx;
            cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
            cacheCtx.globalAlpha = 1;
            cacheCtx.globalCompositeOperation = 'source-over';
            cacheCtx.shadowBlur = 0;
            try {
                drawGalaxySelectBaseLayerDirect(now, selectedIndex);
            } finally {
                galaxyCtx = previousCtx;
            }
            cache.width = width;
            cache.height = height;
            cache.selectedIndex = selectedIndex;
            cache.shipKey = selectedShipKey;
            cache.stamp = stamp;
            return cache.canvas;
        }

        function getGalaxyWarpSelectedGalaxy(selectedIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            return galaxies[selectedIndex] || galaxies[0] || getGalaxyDefinition(0);
        }

        function getGalaxyWarpPortalCenter(progress, targetX, targetY) {
            const firstDrift = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.04) / 0.58)));
            const finalPull = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.56) / 0.32)));
            const handoffPull = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.80) / 0.18)));
            return {
                x: lerpGalaxyWarp(targetX, width / 2, Math.min(1, firstDrift * 0.78 + finalPull * 0.18 + handoffPull * 0.04)),
                y: lerpGalaxyWarp(targetY, height * 0.48, Math.min(1, firstDrift * 0.74 + finalPull * 0.20 + handoffPull * 0.06))
            };
        }

        function getGalaxyWarpPortalRadius(progress, selectedIndex) {
            const baseRadius = getGalaxySelectRenderRadius(selectedIndex, true);
            const mapZoomT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.04) / 0.58)));
            const growT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.30) / 0.40)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.32)));
            const handoffT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.82) / 0.16)));
            const mapMatchedRadius = baseRadius * (1 + mapZoomT * 0.08);
            const travelRadius = baseRadius * (1.08 + growT * 1.06);
            const approachRadius = lerpGalaxyWarp(mapMatchedRadius, travelRadius, growT);
            const finalRadius = Math.max(width, height) * 0.62;
            return lerpGalaxyWarp(approachRadius, finalRadius, Math.min(1, surgeT * 0.82 + handoffT * 0.18));
        }

        function drawGalaxyWarpExactGlyphLayer(now, galaxy, selectedIndex, centerX, centerY, spriteRadius, spriteScale, alpha, options = {}) {
            if (!galaxy || alpha <= 0.01 || spriteScale <= 0.01 || width <= 0 || height <= 0) return;

            const cache = galaxyWarpExactGlyphLayerCache;
            if (!cache.canvas) cache.canvas = document.createElement('canvas');
            if (cache.width !== width || cache.height !== height) {
                cache.canvas.width = width;
                cache.canvas.height = height;
                cache.width = width;
                cache.height = height;
                cache.drawKey = '';
                cache.drawn = false;
            }

            const layerCtx = cache.canvas.getContext('2d', { alpha: true });
            if (!layerCtx) return;

            const freeze = !!options.freeze && cache.drawn;
            const frameFps = Math.max(12, Math.min(72, options.fps || 60));
            const frameMs = 1000 / frameFps;
            const frameNow = Number.isFinite(options.frameNow) ? options.frameNow : now;
            const stamp = Math.floor((frameNow || 0) / frameMs);
            const trackTransform = !!options.trackTransform;
            const drawKey = [
                galaxy && galaxy.id ? galaxy.id : selectedIndex,
                selectedIndex,
                Math.round(spriteRadius * 2),
                stamp,
                trackTransform ? Math.round(centerX) : '',
                trackTransform ? Math.round(centerY) : '',
                trackTransform ? Math.round(spriteScale * 180) : ''
            ].join('|');

            if (!freeze && cache.drawKey !== drawKey) {
                const previousCtx = galaxyCtx;
                galaxyCtx = layerCtx;
                layerCtx.setTransform(1, 0, 0, 1, 0, 0);
                layerCtx.clearRect(0, 0, width, height);
                layerCtx.globalAlpha = 1;
                layerCtx.globalCompositeOperation = 'source-over';
                layerCtx.shadowBlur = 0;
                try {
                    layerCtx.save();
                    layerCtx.translate(centerX, centerY);
                    layerCtx.scale(spriteScale, spriteScale);
                    drawGalaxyGlyphSpriteDirect(galaxy, 0, 0, spriteRadius, true, now, selectedIndex, {
                        detail: GALAXY_WARP_FOCUSED_DETAIL,
                        fontScale: GALAXY_WARP_FOCUSED_FONT_SCALE,
                        noCache: true,
                        suppressPerGlyphGlow: true,
                        vectorGlyphs: isPrismArrayGalaxySprite(galaxy)
                    });
                    layerCtx.restore();
                } finally {
                    galaxyCtx = previousCtx;
                }
                cache.drawKey = drawKey;
                cache.drawn = true;
            }

            if (!cache.drawn) return;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = alpha;
            ctx.drawImage(cache.canvas, 0, 0);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpPortal(now, progress, selectedIndex, color, centerX, centerY) {
            const galaxy = getGalaxyWarpSelectedGalaxy(selectedIndex);
            if (!galaxy) return;

            const colors = galaxy.colors || [color, '#ffffff'];
            const radius = getGalaxyWarpPortalRadius(progress, selectedIndex);
            const enterT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.03) / 0.22)));
            const growT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.16) / 0.56)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.32)));
            const fadeOut = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.94) / 0.06)));
            const alpha = enterT * (1 - fadeOut * 0.28);
            if (alpha <= 0.01) return;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const aura = ctx.createRadialGradient(centerX, centerY, radius * 0.06, centerX, centerY, radius * 1.38);
            aura.addColorStop(0, colorWithAlpha('#ffffff', 0.18 * alpha));
            aura.addColorStop(0.20, colorWithAlpha(colors[2] || colors[1] || '#ffffff', 0.13 * alpha));
            aura.addColorStop(0.50, colorWithAlpha(colors[1] || colors[0], 0.08 * alpha));
            aura.addColorStop(1, colorWithAlpha(colors[0] || color, 0));
            ctx.fillStyle = aura;
            ctx.fillRect(0, 0, width, height);

            ctx.lineCap = 'round';
            for (let ring = 0; ring < 3; ring++) {
                const ringT = ring / 2;
                const spin = now * 0.00016 * (ring % 2 ? -1 : 1);
                const ringRadius = radius * (0.68 + ringT * 0.28 + growT * 0.08);
                ctx.globalAlpha = alpha * (0.12 + surgeT * 0.10) * (1 - ringT * 0.18);
                ctx.strokeStyle = colorWithAlpha(colors[(ring + 1) % colors.length] || color, 0.68);
                ctx.lineWidth = Math.max(1, radius * (0.006 + ringT * 0.004));
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, ringRadius * 1.12, ringRadius * 0.44, spin + ringT * 0.72, 0, Math.PI * 2);
                ctx.stroke();
            }

            const transitionStart = galaxyWarpTransition && Number.isFinite(galaxyWarpTransition.startedAt)
                ? galaxyWarpTransition.startedAt
                : now;
            const liveTimeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.34) / 0.34)));
            const spriteNow = lerpGalaxyWarp(transitionStart, now, liveTimeT);
            const spriteRadius = Math.max(48, getGalaxySelectRenderRadius(selectedIndex, true));
            const spriteScale = Math.max(0.35, radius / spriteRadius);
            const crispT = easeGalaxyWarp(Math.max(0, Math.min(1, (spriteScale - 1.24) / 1.18)));
            const isPrismWarp = galaxy.mode === 'survivor' || getGalaxyRenderStyle(galaxy) === 'prismArray';
            const freezeStart = isPrismWarp ? 1.02 : 0.76;
            const fadeStart = isPrismWarp ? 0.82 : 0.80;
            const fadeDuration = isPrismWarp ? 0.12 : 0.14;
            const lateGlyphFade = 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - fadeStart) / fadeDuration)));
            const rasterAlpha = alpha * (0.90 + surgeT * 0.10) * Math.max(0, 1 - crispT) * lateGlyphFade;
            const exactGlyphAlpha = alpha * crispT * (0.92 + surgeT * 0.08) * lateGlyphFade;
            if (rasterAlpha > 0.018) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.scale(spriteScale, spriteScale);
                ctx.globalAlpha = rasterAlpha;
                drawGalaxyGlyphSprite(galaxy, 0, 0, spriteRadius, true, spriteNow, selectedIndex, {
                    detail: GALAXY_WARP_FOCUSED_DETAIL,
                    fontScale: GALAXY_WARP_FOCUSED_FONT_SCALE
                });
                ctx.globalAlpha = 1;
                ctx.restore();
            }

            drawGalaxyWarpExactGlyphLayer(spriteNow, galaxy, selectedIndex, centerX, centerY, spriteRadius, spriteScale, exactGlyphAlpha, {
                frameNow: now,
                fps: isPrismWarp ? 72 : 54,
                freeze: progress >= freezeStart,
                trackTransform: isPrismWarp
            });

            const lensT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.42) / 0.40)));
            if (lensT > 0.01) {
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = alpha * lensT * (0.12 + surgeT * 0.16);
                ctx.strokeStyle = colorWithAlpha('#ffffff', 0.42);
                ctx.lineWidth = Math.max(1, radius * 0.012);
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * (0.18 + lensT * 0.08), 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpFocusedWorldLayer(now, selectedIndex, targetX, targetY, camera, progress) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            const galaxy = galaxies[selectedIndex] || galaxies[0];
            if (!galaxy) return;

            const zoom = Math.max(1, camera && camera.zoom ? camera.zoom : 1);
            const detail = GALAXY_WARP_FOCUSED_DETAIL;
            const fontScale = GALAXY_WARP_FOCUSED_FONT_SCALE;
            const radius = getGalaxySelectRenderRadius(selectedIndex, true) * (1.02 + progress * 0.08);
            const colors = galaxy.colors || ['#6aa8ff', '#ff5e8a', '#ffffff'];

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalCompositeOperation = 'screen';
            const dustCount = 42;
            ctx.font = `bold ${getGalaxyFontPx(Math.max(3, 6 * fontScale), { warp: true })}px Courier New`;
            for (let i = 0; i < dustCount; i++) {
                const noiseA = galaxyNoise((galaxy.seed || 17) + 1701, i);
                const noiseB = galaxyNoise((galaxy.seed || 17) + 1721, i);
                const angle = noiseA * Math.PI * 2 + now * 0.00004;
                const r = radius * (1.1 + noiseB * 2.6);
                ctx.globalAlpha = (0.05 + noiseB * 0.14) * (1 - Math.min(0.62, progress * 0.45));
                ctx.fillStyle = noiseB > 0.82 ? '#ffffff' : (colors[i % colors.length] || currentThemeColor);
                ctx.fillText(i % 5 === 0 ? '+' : '.', targetX + Math.cos(angle) * r, targetY + Math.sin(angle) * r * 0.58);
            }
            ctx.restore();

            ctx.save();
            ctx.translate(targetX, targetY);
            drawGalaxyGlyphSprite(galaxy, 0, 0, radius, true, now, selectedIndex, {
                warp: true,
                detail,
                fontScale
            });
            ctx.restore();
        }

        function drawGalaxyWarpVoidBackdrop(now, progress, color, centerX, centerY) {
            const revealT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.18) / 0.44)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.32)));
            const fadeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.88) / 0.12)));
            const alphaScale = revealT * (1 - fadeT * 0.42);
            if (alphaScale <= 0.01) return;

            const diagonal = Math.max(1, Math.hypot(width, height));
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const dustCount = 36;
            for (let i = 0; i < dustCount; i++) {
                const noiseA = galaxyNoise(5201, i);
                const noiseB = galaxyNoise(5213, i);
                const noiseC = galaxyNoise(5227, i);
                const angle = noiseA * Math.PI * 2 + now * (0.000025 + noiseC * 0.000035);
                const pull = revealT * (0.08 + noiseB * 0.18) + surgeT * (0.10 + noiseC * 0.22);
                const radius = diagonal * (0.10 + noiseB * 0.52) * (1 - pull);
                const drift = Math.sin(now * 0.00034 + i) * diagonal * 0.006;
                const x = centerX + Math.cos(angle) * radius + Math.cos(angle + Math.PI / 2) * drift;
                const y = centerY + Math.sin(angle) * radius * (0.68 + noiseC * 0.22) + Math.sin(angle + Math.PI / 2) * drift;
                const bright = noiseC > 0.82;
                ctx.globalAlpha = alphaScale * (bright ? 0.18 : 0.07) * (0.70 + surgeT * 0.55);
                ctx.fillStyle = bright ? '#ffffff' : colorWithAlpha(color, 0.92);
                ctx.font = `bold ${bright ? 8 : 6}px Courier New`;
                ctx.fillText(bright ? '+' : '.', x, y);
            }

            const traceCount = 12;
            ctx.lineCap = 'round';
            for (let i = 0; i < traceCount; i++) {
                const noise = galaxyNoise(5301, i);
                const angle = (i / traceCount) * Math.PI * 2 + (noise - 0.5) * 0.42;
                const inner = diagonal * (0.08 + noise * 0.10);
                const outer = inner + diagonal * (0.10 + surgeT * 0.16);
                ctx.globalAlpha = alphaScale * (0.025 + surgeT * 0.08) * (0.55 + noise * 0.45);
                ctx.strokeStyle = i % 3 === 0 ? colorWithAlpha('#ffffff', 0.35) : colorWithAlpha(color, 0.48);
                ctx.lineWidth = 0.8 + surgeT * 1.2 * noise;
                ctx.beginPath();
                ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
                ctx.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer);
                ctx.stroke();
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpMap(now, targetX, targetY, camera, selectedIndex, progress) {
            const fadeT = camera && Number.isFinite(camera.fadeT)
                ? camera.fadeT
                : easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.02) / 0.34)));
            const menuFade = Math.max(0, 1 - fadeT);
            if (menuFade > 0.01) {
                const snapshot = prepareGalaxyWarpMenuSnapshot(galaxyWarpTransition && galaxyWarpTransition.startedAt ? galaxyWarpTransition.startedAt : now, selectedIndex);
                ctx.save();
                ctx.translate(camera.focusX, camera.focusY);
                ctx.scale(1 + (camera.focusT || 0) * 0.08, 1 + (camera.focusT || 0) * 0.08);
                ctx.translate(-targetX, -targetY);
                ctx.globalAlpha = menuFade;
                if (snapshot) ctx.drawImage(snapshot, 0, 0);
                else drawGalaxySelectBaseLayerDirect(now, selectedIndex);
                ctx.restore();
            }
            if (fadeT > 0.001) {
                ctx.save();
                ctx.globalAlpha = Math.min(0.88, fadeT * 0.62);
                ctx.fillStyle = '#01040b';
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpStreaks(now, progress, color, centerX, centerY) {
            const eased = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.20) / 0.52)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.32)));
            const fadeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.90) / 0.10)));
            if (eased <= 0.01) return;
            const streakCount = GALAXY_WARP_STREAK_COUNT;
            const diagonal = Math.max(1, Math.hypot(width, height));
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            for (let i = 0; i < streakCount; i++) {
                const noiseA = galaxyNoise(1201, i);
                const noiseB = galaxyNoise(1409, i);
                const flow = (now * (0.00008 + surgeT * 0.00020) + noiseB) % 1;
                const angle = (i / streakCount) * Math.PI * 2 + (noiseA - 0.5) * 0.30;
                const inner = diagonal * (0.045 + flow * 0.18);
                const length = diagonal * (0.055 + eased * 0.13 + surgeT * 0.12) * (0.58 + noiseA * 0.62);
                const outer = inner + length;
                const sx = centerX + Math.cos(angle) * inner;
                const sy = centerY + Math.sin(angle) * inner;
                const ex = centerX + Math.cos(angle) * outer;
                const ey = centerY + Math.sin(angle) * outer;
                const alpha = (1 - fadeT * 0.55) * (0.06 + eased * 0.18 + surgeT * 0.16) * (0.35 + noiseA * 0.65);
                ctx.strokeStyle = i % 5 === 0
                    ? colorWithAlpha('#ffffff', 0.22 + surgeT * 0.16)
                    : colorWithAlpha(color, 0.20 + surgeT * 0.24);
                ctx.lineWidth = 0.6 + eased * 1.2 + surgeT * 2.4 * noiseA;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function cubicGalaxyWarpPoint(p0, p1, p2, p3, t) {
            const clamped = Math.max(0, Math.min(1, t));
            const inv = 1 - clamped;
            const a = inv * inv * inv;
            const b = 3 * inv * inv * clamped;
            const c = 3 * inv * clamped * clamped;
            const d = clamped * clamped * clamped;
            return {
                x: p0.x * a + p1.x * b + p2.x * c + p3.x * d,
                y: p0.y * a + p1.y * b + p2.y * c + p3.y * d
            };
        }

        function getGalaxyWarpShipRouteMode(transition) {
            const galaxy = getGalaxyWarpSelectedGalaxy(transition && transition.galaxyIndex || 0);
            const style = galaxy ? getGalaxyRenderStyle(galaxy) : '';
            if (galaxy && galaxy.mode === 'matrixCrawler') return 'matrixCrawler';
            return galaxy && (galaxy.mode === 'survivor' || style === 'prismArray')
                ? 'survivor'
                : 'campaign';
        }

        function isGalaxyWarpCenterLandingRoute(routeMode) {
            return routeMode === 'survivor' || routeMode === 'matrixCrawler';
        }

        function getGalaxyWarpShipAccentColor(transition, fallback = currentThemeColor) {
            if (transition && transition.shipColor) return transition.shipColor;
            const galaxy = getGalaxyWarpSelectedGalaxy(transition && transition.galaxyIndex || 0);
            return (galaxy && galaxy.colors && galaxy.colors[0]) || fallback || currentThemeColor;
        }

        function getGalaxyWarpShipLandingTarget(routeMode) {
            if (routeMode === 'survivor') {
                const hudH = typeof HUD_HEIGHT === 'number' ? HUD_HEIGHT : 0;
                return {
                    x: width / 2,
                    y: Math.max(90, (height - hudH) * 0.52),
                    scale: typeof SURVIVOR_PLAYER_RENDER_SCALE === 'number' ? SURVIVOR_PLAYER_RENDER_SCALE : 0.66
                };
            }
            if (routeMode === 'matrixCrawler') {
                const hudH = typeof HUD_HEIGHT === 'number' ? HUD_HEIGHT : 0;
                const viewport = typeof getMatrixCrawlerViewportRect === 'function'
                    ? getMatrixCrawlerViewportRect()
                    : null;
                return {
                    x: viewport ? viewport.x + viewport.w / 2 : width / 2,
                    y: viewport ? viewport.y + viewport.h / 2 : Math.max(90, (height - hudH) * 0.52),
                    scale: typeof MATRIX_CRAWLER_PLAYER_RENDER_SCALE === 'number' ? MATRIX_CRAWLER_PLAYER_RENDER_SCALE : 0.66
                };
            }
            return {
                x: width / 2,
                y: height + Math.max(72, height * 0.08),
                scale: 0.40
            };
        }

        function getGalaxyWarpShipPose(progress, transition, portalCenter, portalRadius) {
            const safeTransition = transition || {};
            const targetX = safeTransition.toX || width / 2;
            const targetY = safeTransition.toY || height * 0.35;
            const fromX = Number.isFinite(safeTransition.fromX) ? safeTransition.fromX : targetX - 80;
            const fromY = Number.isFinite(safeTransition.fromY) ? safeTransition.fromY : targetY + 20;
            const centerX = portalCenter.x;
            const centerY = portalCenter.y;
            const routeMode = getGalaxyWarpShipRouteMode(safeTransition);
            const landing = getGalaxyWarpShipLandingTarget(routeMode);
            const side = fromX < landing.x ? -1 : 1;
            const travelT = easeGalaxyWarp(Math.max(0, Math.min(1, progress / 0.96)));
            let p1;
            let p2;

            if (isGalaxyWarpCenterLandingRoute(routeMode)) {
                const parkDrop = Math.max(90, Math.min(210, height * 0.18));
                p1 = {
                    x: lerpGalaxyWarp(fromX, centerX - side * Math.min(width * 0.16, Math.max(70, portalRadius * 0.16)), 0.55),
                    y: Math.max(fromY, centerY + parkDrop * 0.58)
                };
                p2 = {
                    x: landing.x,
                    y: landing.y + parkDrop
                };
            } else {
                p1 = {
                    x: centerX + (fromX - centerX) * 0.42 - side * Math.min(width * 0.10, Math.max(56, portalRadius * 0.10)),
                    y: centerY + (fromY - centerY) * 0.22
                };
                p2 = {
                    x: landing.x,
                    y: Math.max(height * 0.64, centerY + Math.min(height * 0.24, Math.max(90, portalRadius * 0.12)))
                };
            }

            const p0 = { x: fromX, y: fromY };
            const p3 = { x: landing.x, y: landing.y };
            const point = cubicGalaxyWarpPoint(p0, p1, p2, p3, travelT);
            const driftT = easeGalaxyWarp(Math.max(0, Math.min(1, progress / 0.42)));
            const commitT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.34) / 0.38)));
            const plungeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.66) / 0.28)));
            const pathPulse = Math.sin(progress * Math.PI * 2.2) * (1 - commitT) * Math.min(10, portalRadius * 0.035);
            const dx = p3.x - p0.x;
            const dy = p3.y - p0.y;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const nx = -dy / dist;
            const ny = dx / dist;
            const x = point.x + nx * pathPulse;
            const y = point.y + ny * pathPulse;
            return {
                x,
                y,
                entryX: p1.x,
                entryY: p1.y,
                commitX: p2.x,
                commitY: p2.y,
                centerX,
                centerY,
                finalX: p3.x,
                finalY: p3.y,
                finalScale: landing.scale,
                routeMode,
                dashT: commitT,
                driftT,
                commitT,
                lockT: plungeT,
                plungeT,
                travelT
            };
        }

        function drawGalaxyWarpShipExhaust(progress, transition, color, pose, rot, scale, fade, portalCenter, portalRadius) {
            const routeMode = pose.routeMode || getGalaxyWarpShipRouteMode(transition);
            const galaxy = getGalaxyWarpSelectedGalaxy(transition && transition.galaxyIndex || 0);
            const galaxyColors = galaxy && galaxy.colors ? galaxy.colors : [color, currentThemeColor, '#8ff7ff'];
            const shipAccent = getGalaxyWarpShipAccentColor(transition, color);
            const ionColors = [
                shipAccent,
                galaxyColors[1],
                galaxyColors[2],
                color,
                routeMode === 'survivor' ? '#9bffcf' : (routeMode === 'matrixCrawler' ? '#41ff93' : '#8ff7ff'),
                routeMode === 'survivor' ? '#ff8fd8' : (routeMode === 'matrixCrawler' ? '#c8ffe1' : '#fff4b8')
            ].filter(Boolean);
            const speedT = Math.max(0, Math.min(1, pose.commitT * 0.55 + pose.plungeT * 0.65 + pose.travelT * 0.40));
            const engineAlpha = fade * (0.38 + speedT * 0.62);
            if (engineAlpha <= 0.01) return;

            const behindX = -Math.sin(rot);
            const behindY = Math.cos(rot);
            const sideX = Math.cos(rot);
            const sideY = Math.sin(rot);
            const engineX = pose.x + behindX * (17 * scale + 6 + speedT * 7);
            const engineY = pose.y + behindY * (17 * scale + 6 + speedT * 7);
            const particleChars = typeof EXHAUST_PARTICLE_CHARS !== 'undefined' ? EXHAUST_PARTICLE_CHARS : ['*', '+', '.', ':'];
            const moteChars = ['.', ':', '+', '*'];
            const centerLandingRoute = isGalaxyWarpCenterLandingRoute(routeMode);
            const trailWindow = centerLandingRoute
                ? (0.20 + speedT * 0.12)
                : (0.16 + speedT * 0.10);
            const effectQuality = typeof getVisualQualityScale === 'function' ? getVisualQualityScale('effects') : 1;
            const particleCount = Math.max(10, Math.round((centerLandingRoute ? 22 : 18) * effectQuality));

            if (progress < 0.36 && pauseMenuShipCursor && pauseMenuShipCursor.trail && pauseMenuShipCursor.trail.length) {
                drawPauseMenuShipTrail(0.016, 1 - easeGalaxyWarp(progress / 0.36), {
                    ionize: true,
                    color,
                    ionColors
                });
            }

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const coreRadius = 26 + speedT * 32;
            const core = ctx.createRadialGradient(engineX, engineY, 0, engineX, engineY, coreRadius);
            core.addColorStop(0, colorWithAlpha('#ffffff', 0.20 * engineAlpha));
            core.addColorStop(0.24, colorWithAlpha('#fff4b8', 0.16 * engineAlpha));
            core.addColorStop(0.52, colorWithAlpha(ionColors[0] || color, 0.12 * engineAlpha));
            core.addColorStop(0.72, colorWithAlpha(ionColors[1] || color, 0.08 * engineAlpha));
            core.addColorStop(1, colorWithAlpha(color, 0));
            ctx.fillStyle = core;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(engineX, engineY, coreRadius, 0, Math.PI * 2);
            ctx.fill();

            for (let i = 0; i < particleCount; i++) {
                const age = i / Math.max(1, particleCount - 1);
                const sampleProgress = Math.max(0, progress - age * trailWindow);
                const sampleCenter = getGalaxyWarpPortalCenter(sampleProgress, transition.toX || width / 2, transition.toY || height * 0.35);
                const sampleRadius = getGalaxyWarpPortalRadius(sampleProgress, transition.galaxyIndex || 0);
                const samplePose = getGalaxyWarpShipPose(sampleProgress, transition, sampleCenter, sampleRadius);
                const noiseA = galaxyNoise(8101 + (transition.galaxyIndex || 0) * 17, i + Math.floor(progress * 420));
                const noiseB = galaxyNoise(8123 + (transition.galaxyIndex || 0) * 19, i);
                const lane = (noiseA - 0.5) * (9 + age * 42 + speedT * 18);
                const back = 10 + age * (34 + speedT * 86) + noiseB * 18;
                const px = samplePose.x + behindX * back + sideX * lane;
                const py = samplePose.y + behindY * back + sideY * lane;
                const life = Math.max(0, 1 - age);
                const fieldMote = age > 0.50 && i % 3 === 0;
                const hotFleck = age < 0.34 && i % 4 !== 0;
                const alpha = engineAlpha * life * life * (fieldMote ? 0.32 : 0.60);
                if (alpha <= 0.006) continue;
                const charList = fieldMote ? moteChars : particleChars;
                const char = charList[(i + Math.floor(progress * 97)) % charList.length];
                const fontSize = Math.max(5, (fieldMote ? 6 : 8) + life * (8 + speedT * 5) + noiseB * 4);
                const themedColor = ionColors[(i + Math.floor(age * 8)) % Math.max(1, ionColors.length)] || color;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = i % 7 === 0
                    ? '#ffffff'
                    : colorWithAlpha(hotFleck ? '#fff4b8' : themedColor, fieldMote ? 0.72 : 0.94);
                if (glowEnabled) {
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = (fieldMote ? 3 : 6) + life * (fieldMote ? 5 : 9);
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.font = `bold ${fontSize}px Courier New`;
                ctx.fillText(char, px | 0, py | 0);
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpShip(progress, transition, color, portalCenter, portalRadius) {
            const pose = getGalaxyWarpShipPose(progress, transition, portalCenter, portalRadius);
            const previousProgress = Math.max(0, progress - 0.016);
            const previousCenter = getGalaxyWarpPortalCenter(previousProgress, transition.toX || width / 2, transition.toY || height * 0.35);
            const previousRadius = getGalaxyWarpPortalRadius(previousProgress, transition.galaxyIndex || 0);
            const previousPose = getGalaxyWarpShipPose(previousProgress, transition, previousCenter, previousRadius);
            const travelRot = Math.atan2(pose.y - previousPose.y, pose.x - previousPose.x) + Math.PI / 2;
            const fromRot = Number.isFinite(transition.fromRot) ? transition.fromRot : travelRot;
            const turnT = easeGalaxyWarp(Math.min(1, progress / 0.42));
            const rot = fromRot + normalizePauseCursorAngle(travelRot - fromRot) * turnT;
            const fade = 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.90) / 0.10)));
            const startScale = Number.isFinite(transition.fromScale) ? transition.fromScale : 0.24;
            const targetScale = isGalaxyWarpCenterLandingRoute(pose.routeMode)
                ? Math.max(startScale, pose.finalScale || startScale * 2.35)
                : startScale * (1.18 + pose.travelT * 0.82);
            const scale = lerpGalaxyWarp(startScale, targetScale, easeGalaxyWarp(Math.min(1, progress / 0.92))) * (0.72 + fade * 0.28);
            const shipAccent = getGalaxyWarpShipAccentColor(transition, color);

            drawGalaxyWarpShipExhaust(progress, transition, shipAccent, pose, rot, scale, fade, portalCenter, portalRadius);

            if (fade <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.translate(pose.x, pose.y);
            ctx.rotate(rot);
            ctx.scale(scale, scale);
            PAUSE_CURSOR_SHIP.x = 0;
            PAUSE_CURSOR_SHIP.y = 0;
            PAUSE_CURSOR_SHIP.vx = 0;
            PAUSE_CURSOR_SHIP.vy = 0;
            PAUSE_CURSOR_SHIP.shipId = typeof getSelectedShipConfig === 'function' ? getSelectedShipConfig().id : 'arrowhead';
            PAUSE_CURSOR_SHIP._renderLayoutCache = null;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#f6fbff';
            ctx.shadowColor = shipAccent;
            ctx.shadowBlur = glowEnabled ? 18 : 0;
            drawPlayerShip(PAUSE_CURSOR_SHIP, 'center');
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawGalaxyWarpEntryAperture(now, progress, transition, color, portalCenter, portalRadius, foreground = false) {
            const enterT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.66) / 0.20)));
            const igniteT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.74) / 0.14)));
            const fadeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.94) / 0.06)));
            const amount = enterT * (1 - fadeT * 0.75);
            if (amount <= 0.01) return;

            const selectedIndex = transition.galaxyIndex || 0;
            const galaxy = getGalaxyWarpSelectedGalaxy(selectedIndex);
            const colors = galaxy && galaxy.colors ? galaxy.colors : [color, '#ffffff'];
            const accentA = colors[0] || color;
            const accentB = colors[1] || color;
            const accentC = colors[2] || '#ffffff';
            const pose = getGalaxyWarpShipPose(progress, transition, portalCenter, portalRadius);
            const lockT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.72) / 0.18)));
            const gateX = lerpGalaxyWarp(pose.x, portalCenter.x, 0.34 + lockT * 0.46);
            const gateY = lerpGalaxyWarp(pose.y, portalCenter.y, 0.34 + lockT * 0.46);
            const apertureR = Math.max(48, Math.min(Math.max(width, height) * 0.24, portalRadius * (0.12 + igniteT * 0.075)));
            const spin = now * 0.0011;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';

            if (!foreground) {
                const bloom = ctx.createRadialGradient(gateX, gateY, 0, gateX, gateY, apertureR * (2.1 + igniteT * 0.5));
                bloom.addColorStop(0, colorWithAlpha('#ffffff', amount * (0.18 + igniteT * 0.10)));
                bloom.addColorStop(0.18, colorWithAlpha(accentC, amount * 0.14));
                bloom.addColorStop(0.38, colorWithAlpha(accentB, amount * 0.12));
                bloom.addColorStop(1, colorWithAlpha(accentA, 0));
                ctx.globalAlpha = 1;
                ctx.fillStyle = bloom;
                ctx.fillRect(0, 0, width, height);

                const core = ctx.createRadialGradient(gateX, gateY, 0, gateX, gateY, apertureR * 0.68);
                core.addColorStop(0, colorWithAlpha('#ffffff', amount * (0.28 + igniteT * 0.16)));
                core.addColorStop(0.36, colorWithAlpha(accentC, amount * 0.16));
                core.addColorStop(1, colorWithAlpha(accentB, 0));
                ctx.fillStyle = core;
                ctx.beginPath();
                ctx.arc(gateX, gateY, apertureR * 0.72, 0, Math.PI * 2);
                ctx.fill();
            }

            const ringAlpha = amount * (foreground ? 0.22 : 0.13) * (0.78 + igniteT * 0.36);
            for (let ring = 0; ring < 3; ring++) {
                const ringT = ring / 2;
                const ringR = apertureR * (0.54 + ringT * 0.38 + igniteT * 0.05);
                ctx.globalAlpha = ringAlpha * (1 - ringT * 0.25);
                ctx.strokeStyle = colorWithAlpha(ring === 1 ? accentC : (ring ? accentB : accentA), 0.62);
                ctx.lineWidth = Math.max(1, apertureR * (0.006 + ringT * 0.003));
                ctx.beginPath();
                ctx.ellipse(gateX, gateY, ringR * (1.0 + ringT * 0.10), ringR * (0.54 + ringT * 0.07), spin * (ring % 2 ? -0.7 : 0.9) + ringT * 0.62, 0, Math.PI * 2);
                ctx.stroke();
            }

            if (foreground && igniteT > 0.05) {
                const tickCount = 12;
                const tickR = apertureR * (0.50 + igniteT * 0.12);
                for (let i = 0; i < tickCount; i++) {
                    const noise = galaxyNoise(8101, i);
                    const angle = (i / tickCount) * Math.PI * 2 + spin * 0.72 + (noise - 0.5) * 0.10;
                    const inner = tickR * (0.88 + noise * 0.05);
                    const outer = inner + apertureR * (0.08 + noise * 0.05);
                    ctx.globalAlpha = amount * igniteT * (0.10 + noise * 0.16);
                    ctx.strokeStyle = i % 4 === 0 ? colorWithAlpha('#ffffff', 0.68) : colorWithAlpha(accentB, 0.62);
                    ctx.lineWidth = 1 + noise * 1.4;
                    ctx.beginPath();
                    ctx.moveTo(gateX + Math.cos(angle) * inner, gateY + Math.sin(angle) * inner * 0.68);
                    ctx.lineTo(gateX + Math.cos(angle) * outer, gateY + Math.sin(angle) * outer * 0.68);
                    ctx.stroke();
                }
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpFlash(progress, color, centerX, centerY) {
            const ringT = Math.max(0, Math.min(1, (progress - 0.50) / 0.42));
            const flashT = Math.max(0, Math.min(1, (progress - 0.80) / 0.18));
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            if (ringT > 0) {
                const easedRing = easeGalaxyWarp(ringT);
                const radius = 28 + easedRing * Math.max(width, height) * 0.48;
                ctx.globalAlpha = Math.sin(ringT * Math.PI) * 0.24;
                ctx.strokeStyle = colorWithAlpha(color, 0.65);
                ctx.lineWidth = 2 + easedRing * 10;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radius * 1.16, radius * 0.44, Math.sin(progress * Math.PI * 2) * 0.32, 0, Math.PI * 2);
                ctx.stroke();
            }
            if (flashT > 0) {
                const easedFlash = easeGalaxyWarp(flashT);
                const glow = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, Math.max(width, height) * 0.76);
                glow.addColorStop(0, colorWithAlpha('#ffffff', 0.24 * easedFlash));
                glow.addColorStop(0.22, colorWithAlpha(color, 0.20 * easedFlash));
                glow.addColorStop(0.72, colorWithAlpha('#6aa8ff', 0.06 * easedFlash));
                glow.addColorStop(1, colorWithAlpha('#ffffff', 0));
                ctx.fillStyle = glow;
                ctx.globalAlpha = 1;
                ctx.fillRect(0, 0, width, height);
            }
            ctx.restore();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }

        function drawGalaxyWarpHandoffVeil(amount, color, centerX = width / 2, centerY = height / 2, now = currentFrameNow) {
            const t = easeGalaxyWarp(Math.max(0, Math.min(1, amount || 0)));
            if (t <= 0.001) return;

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = colorWithAlpha('#01040b', 0.08 * t + 0.58 * t * t);
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';
            const radius = Math.max(width, height) * (0.38 + t * 0.42);
            const bloom = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            bloom.addColorStop(0, colorWithAlpha('#ffffff', 0.2 * t));
            bloom.addColorStop(0.18, colorWithAlpha(color, 0.18 * t));
            bloom.addColorStop(0.62, colorWithAlpha('#6aa8ff', 0.05 * t));
            bloom.addColorStop(1, colorWithAlpha('#ffffff', 0));
            ctx.fillStyle = bloom;
            ctx.fillRect(0, 0, width, height);

            const streakAlpha = Math.sin(t * Math.PI) * 0.16 + t * 0.08;
            if (streakAlpha > 0.01) {
                ctx.lineCap = 'round';
                const streakCount = GALAXY_WARP_HANDOFF_STREAK_COUNT;
                for (let i = 0; i < streakCount; i++) {
                    const noise = galaxyNoise(7001, i);
                    const angle = (i / streakCount) * Math.PI * 2 + (noise - 0.5) * 0.28;
                    const inner = 18 + noise * 72;
                    const outer = inner + 72 + t * 220 * (0.35 + noise);
                    ctx.globalAlpha = streakAlpha * (0.35 + noise * 0.65);
                    ctx.strokeStyle = i % 3 === 0 ? colorWithAlpha('#ffffff', 0.42) : colorWithAlpha(color, 0.55);
                    ctx.lineWidth = 0.8 + t * 2.8 * noise;
                    ctx.beginPath();
                    ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
                    ctx.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer);
                    ctx.stroke();
                }
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpTransition(now) {
            const transition = galaxyWarpTransition || {};
            const elapsed = ((now || performance.now()) - (transition.startedAt || now || performance.now())) / 1000;
            const progress = Math.max(0, Math.min(1, elapsed / GALAXY_WARP_DURATION));
            const targetX = transition.toX || width / 2;
            const targetY = transition.toY || height * 0.35;
            const color = transition.color || currentThemeColor;
            const camera = getGalaxyWarpCamera(progress, targetX, targetY);
            const focalPoint = getGalaxyWarpPortalCenter(progress, targetX, targetY);
            const portalRadius = getGalaxyWarpPortalRadius(progress, transition.galaxyIndex || 0);

            ctx.save();
            ctx.fillStyle = '#01040b';
            ctx.fillRect(0, 0, width, height);
            drawGalaxyWarpMap(now, targetX, targetY, camera, transition.galaxyIndex || 0, progress);
            ctx.restore();

            drawGalaxyWarpVoidBackdrop(now, progress, color, focalPoint.x, focalPoint.y);
            drawGalaxyWarpPortal(now, progress, transition.galaxyIndex || 0, color, focalPoint.x, focalPoint.y);
            drawGalaxyWarpStreaks(now, progress, color, focalPoint.x, focalPoint.y);
            drawGalaxyWarpEntryAperture(now, progress, transition, color, focalPoint, portalRadius, false);
            drawGalaxyWarpShip(progress, transition, color, focalPoint, portalRadius);
            drawGalaxyWarpEntryAperture(now, progress, transition, color, focalPoint, portalRadius, true);
            drawGalaxyWarpFlash(progress, color, focalPoint.x, focalPoint.y);
            const handoffStart = typeof GALAXY_WARP_HANDOFF_START === 'number' ? GALAXY_WARP_HANDOFF_START : 0.66;
            const handoffT = Math.max(0, Math.min(1, (progress - handoffStart) / Math.max(0.001, 1 - handoffStart)));
            drawGalaxyWarpHandoffVeil(handoffT, color, focalPoint.x, focalPoint.y, now);
        }

        function drawGalaxyWarpOutroFade(now) {
            if (!galaxyWarpTransition || !galaxyWarpTransition.outroStartedAt) return;
            const elapsed = ((now || performance.now()) - galaxyWarpTransition.outroStartedAt) / 1000;
            if (elapsed < 0 || elapsed > GALAXY_WARP_OUTRO_FADE) return;
            const alpha = 1 - easeGalaxyWarp(elapsed / GALAXY_WARP_OUTRO_FADE);
            const color = galaxyWarpTransition.color || currentThemeColor;
            drawGalaxyWarpHandoffVeil(alpha, color, width / 2, height / 2, now);
        }

        function getTerminalDockMetrics(index) {
            const galaxyIndex = Number.isFinite(index) ? index : selectedGalaxyIndex;
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            const galaxy = galaxies[galaxyIndex] || galaxies[0];
            const slot = getGalaxySelectSlot(galaxyIndex);
            const radius = getGalaxySelectRenderRadius(galaxyIndex, true);
            return { galaxyIndex, galaxy, slot, radius };
        }

        function getTerminalDockShipPose(progress, transition, metrics) {
            const phase = transition && transition.phase === 'exit' ? 'exit' : 'enter';
            const t = easeGalaxyWarp(Math.max(0, Math.min(1, progress)));
            const slot = metrics.slot;
            const radius = metrics.radius;
            let start;
            let p1;
            let p2;
            let end;
            let scale;
            let alpha;

            if (phase === 'exit') {
                start = { x: slot.x + radius * 0.30, y: slot.y + radius * 0.02 };
                p1 = { x: slot.x + radius * 0.62, y: slot.y - radius * 0.08 };
                p2 = { x: slot.x + radius * 1.32, y: slot.y - radius * 0.38 };
                end = {
                    x: Math.min(width - 54, slot.x + radius * 1.98),
                    y: Math.max(100, slot.y - radius * 0.44)
                };
                scale = lerpGalaxyWarp(0.11, 0.25, easeGalaxyWarp(Math.min(1, progress / 0.82)));
                alpha = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.10) / 0.26)));
            } else {
                start = {
                    x: Number.isFinite(transition && transition.fromX) ? transition.fromX : slot.x - radius * 1.55,
                    y: Number.isFinite(transition && transition.fromY) ? transition.fromY : slot.y
                };
                p1 = { x: start.x + radius * 0.50, y: start.y - radius * 0.08 };
                p2 = { x: slot.x - radius * 1.12, y: slot.y + radius * 0.10 };
                end = { x: slot.x - radius * 0.34, y: slot.y };
                const fromScale = Number.isFinite(transition && transition.fromScale) ? transition.fromScale : 0.23;
                scale = lerpGalaxyWarp(fromScale, 0.11, easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.28))));
                alpha = 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.82) / 0.16)));
            }

            const point = cubicGalaxyWarpPoint(start, p1, p2, end, t);
            const sampleT = Math.max(0, t - 0.02);
            const previous = cubicGalaxyWarpPoint(start, p1, p2, end, sampleT);
            const travelRot = Math.atan2(point.y - previous.y, point.x - previous.x) + Math.PI / 2;
            const fromRot = Number.isFinite(transition && transition.fromRot) ? transition.fromRot : travelRot;
            const rotBlend = phase === 'exit'
                ? easeGalaxyWarp(Math.min(1, progress / 0.26))
                : easeGalaxyWarp(Math.min(1, progress / 0.42));
            const rot = fromRot + normalizePauseCursorAngle(travelRot - fromRot) * rotBlend;
            return {
                x: point.x,
                y: point.y,
                rot,
                scale,
                alpha,
                phase,
                t,
                start,
                p1,
                p2,
                end
            };
        }

        function drawTerminalDockWake(pose, transition, metrics, color, now) {
            const alphaBase = Math.max(0, Math.min(1, pose.alpha || 0));
            if (alphaBase <= 0.01) return;

            const lastNow = Number.isFinite(transition._trailLastNow)
                ? transition._trailLastNow
                : now - 16;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
            transition._trailLastNow = now;

            const sampleT = Math.max(0, Math.min(1, (pose.t || 0) - 0.018));
            const previous = cubicGalaxyWarpPoint(pose.start, pose.p1, pose.p2, pose.end, sampleT);
            const frameSpeed = Math.hypot(pose.x - previous.x, pose.y - previous.y) / Math.max(0.001, dt);
            const speedRatio = Math.min(0.58, Math.max(0.08, frameSpeed / 420));
            const cursor = {
                x: pose.x,
                y: pose.y,
                rot: pose.rot,
                scale: pose.scale,
                speed: frameSpeed,
                dt
            };

            drawPauseMenuShipTrail(dt, alphaBase);
            emitPauseMenuShipExhaustTrail(cursor, now, speedRatio * 0.75, 0.46, GALAXY_CURSOR_TRAIL_MAX);
        }

        function drawTerminalDockGate(metrics, progress, phase, color, now) {
            const slot = metrics.slot;
            const radius = metrics.radius;
            const side = phase === 'exit' ? 1 : -1;
            const pulse = 0.5 + Math.sin(now * 0.006) * 0.5;
            const openT = phase === 'exit'
                ? easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.08) / 0.30)))
                : 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.72) / 0.22)));
            const gateX = slot.x + side * radius * 0.42;
            const gateY = slot.y;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.18 + pulse * 0.12;
            ctx.strokeStyle = colorWithAlpha(color, 0.78);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(gateX, gateY - radius * (0.36 + openT * 0.08));
            ctx.lineTo(gateX, gateY + radius * (0.36 + openT * 0.08));
            ctx.stroke();

            const arcW = radius * (0.34 + openT * 0.18);
            ctx.globalAlpha = 0.12 + openT * 0.22;
            ctx.beginPath();
            ctx.ellipse(gateX, gateY, arcW, radius * 0.31, 0, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.stroke();

            for (let i = 0; i < 6; i++) {
                const n = galaxyNoise(9401, i + Math.floor(now * 0.018));
                ctx.globalAlpha = (0.04 + openT * 0.12) * (0.55 + n * 0.45);
                ctx.fillStyle = i % 3 === 0 ? '#ffffff' : color;
                ctx.font = `bold ${6 + (i % 2) * 2}px Courier New`;
                ctx.fillText(i % 2 ? '+' : '.', gateX + side * (8 + n * radius * 0.20), gateY + (n - 0.5) * radius * 0.68);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 0;
        }

        function drawTerminalDockShip(pose, transition, color) {
            if (pose.alpha <= 0.01) return;
            const shipConfig = typeof PLAYER_SHIP_TYPES !== 'undefined'
                ? PLAYER_SHIP_TYPES[transition.shipIndex] || getSelectedShipConfig()
                : getSelectedShipConfig();
            ctx.save();
            ctx.globalAlpha = pose.alpha;
            ctx.translate(pose.x, pose.y);
            ctx.rotate(pose.rot);
            ctx.scale(pose.scale, pose.scale);
            PAUSE_CURSOR_SHIP.x = 0;
            PAUSE_CURSOR_SHIP.y = 0;
            PAUSE_CURSOR_SHIP.vx = 0;
            PAUSE_CURSOR_SHIP.vy = 0;
            PAUSE_CURSOR_SHIP.shipId = shipConfig && shipConfig.id ? shipConfig.id : 'arrowhead';
            PAUSE_CURSOR_SHIP._renderLayoutCache = null;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = shipConfig && shipConfig.previewColor ? shipConfig.previewColor : '#f6fbff';
            ctx.shadowColor = color;
            ctx.shadowBlur = glowEnabled ? 16 : 0;
            drawPlayerShip(PAUSE_CURSOR_SHIP, 'center');
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function getTerminalDockFocus(progress, phase) {
            const focusIn = phase === 'exit'
                ? 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.74) / 0.24)))
                : easeGalaxyWarp(Math.max(0, Math.min(1, progress / 0.72)));
            const peak = phase === 'exit' ? 0.095 : 0.125;
            return {
                t: focusIn,
                scale: 1 + focusIn * peak,
                dim: focusIn * (phase === 'exit' ? 0.34 : 0.42),
                bloom: focusIn * (phase === 'exit' ? 0.18 : 0.24)
            };
        }

        function drawTerminalDockFocusField(metrics, progress, phase, color, now, focus) {
            const amount = Math.max(0, Math.min(1, focus.t || 0));
            if (amount <= 0.01) return;
            const slot = metrics.slot;
            const radius = metrics.radius;
            const pulse = 0.5 + Math.sin(now * 0.0048) * 0.5;

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = colorWithAlpha('#01040b', focus.dim);
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';
            const bloomRadius = radius * (2.0 + amount * 1.85);
            const bloom = ctx.createRadialGradient(slot.x, slot.y, radius * 0.12, slot.x, slot.y, bloomRadius);
            bloom.addColorStop(0, colorWithAlpha('#ffffff', focus.bloom * 0.38));
            bloom.addColorStop(0.26, colorWithAlpha(color, focus.bloom));
            bloom.addColorStop(0.68, colorWithAlpha('#8ff7ff', focus.bloom * 0.22));
            bloom.addColorStop(1, colorWithAlpha(color, 0));
            ctx.fillStyle = bloom;
            ctx.fillRect(0, 0, width, height);

            ctx.lineCap = 'round';
            for (let i = 0; i < 12; i++) {
                const n = galaxyNoise(9701 + metrics.galaxyIndex * 13, i);
                const angle = (i / 12) * Math.PI * 2 + now * 0.00022 * (i % 2 ? -1 : 1);
                const inner = radius * (0.74 + n * 0.32 + amount * 0.12);
                const outer = inner + radius * (0.18 + amount * 0.34) * (0.45 + n);
                ctx.globalAlpha = amount * (0.026 + pulse * 0.018) * (0.55 + n * 0.45);
                ctx.strokeStyle = i % 4 === 0 ? colorWithAlpha('#ffffff', 0.38) : colorWithAlpha(color, 0.52);
                ctx.lineWidth = 0.8 + amount * 1.2 * n;
                ctx.beginPath();
                ctx.moveTo(slot.x + Math.cos(angle) * inner, slot.y + Math.sin(angle) * inner * 0.62);
                ctx.lineTo(slot.x + Math.cos(angle) * outer, slot.y + Math.sin(angle) * outer * 0.62);
                ctx.stroke();
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawTerminalDockTransition(now) {
            const transition = terminalDockTransition || {};
            const phase = transition.phase === 'exit' ? 'exit' : 'enter';
            const duration = phase === 'exit'
                ? (typeof TERMINAL_DOCK_EXIT_DURATION === 'number' ? TERMINAL_DOCK_EXIT_DURATION : 1.02)
                : (typeof TERMINAL_DOCK_ENTER_DURATION === 'number' ? TERMINAL_DOCK_ENTER_DURATION : 1.05);
            const progress = Math.max(0, Math.min(1, ((now || performance.now()) - (transition.startedAt || now || performance.now())) / 1000 / duration));
            const metrics = getTerminalDockMetrics(transition.galaxyIndex);
            const color = transition.color || (metrics.galaxy && metrics.galaxy.colors && metrics.galaxy.colors[0]) || '#8ff7ff';
            const selectedIndex = Number.isFinite(transition.galaxyIndex) ? transition.galaxyIndex : selectedGalaxyIndex;
            const focus = getTerminalDockFocus(progress, phase);

            drawGalaxySelectBaseLayerDirect(now, selectedIndex);
            drawTerminalDockFocusField(metrics, progress, phase, color, now, focus);

            const pose = getTerminalDockShipPose(progress, transition, metrics);
            ctx.save();
            ctx.translate(metrics.slot.x, metrics.slot.y);
            ctx.scale(focus.scale, focus.scale);
            ctx.translate(-metrics.slot.x, -metrics.slot.y);
            drawTerminalDockWake(pose, transition, metrics, color, now);
            drawTerminalDockShip(pose, transition, color);

            drawTerminalDockGate(metrics, progress, phase, color, now);
            drawGalaxyGlyphSprite(metrics.galaxy, metrics.slot.x, metrics.slot.y, metrics.radius, true, now, metrics.galaxyIndex);
            ctx.restore();

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.07;
            ctx.fillStyle = colorWithAlpha(color, 0.56);
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
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
            const galaxySelectSceneCoversField = gameState === 'GALAXY_SELECT'
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
                    if (glowEnabled && highlight > 0.32) {
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
                    } else if (b.isLargeWraith || b.isWraithBolt) {
                        bulletColor = getWraithBulletColor(b, renderNow);
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
                        const wraithGlowPulse = getWraithBulletBreath(b, renderNow);
                        ctx.shadowColor = '#c8ffff';
                        ctx.shadowBlur = 6 + wraithGlowPulse * 8;
                    } else if (b.isWraithBolt && glowEnabled) {
                        ctx.shadowColor = '#f4f7fb';
                        ctx.shadowBlur = 5 + getWraithBulletBreath(b, renderNow) * 7;
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
                    ctx.shadowBlur = player.flashTimer > 0 ? 26 : pulseVisuals.glow;
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

            if (gameState === 'PAUSED') drawPauseMenu();
            else if (pausePowerupBarAnim.mode === 'closing') {
                drawPausePowerupBar(pausePowerupBarAnim.lastTableY || Math.round(height * 0.68));
            }
            if (gameState === 'LEVELUP') drawLevelUpMenu(dt);
            drawGalaxyWarpOutroFade(renderNow);
            
            if (consoleOpen) drawConsoleOverlay();
            if (typeof musicPlayerOpen !== 'undefined' && musicPlayerOpen) drawMusicPlayerOverlay();
            ctx.restore();
        }
