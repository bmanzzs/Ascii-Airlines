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

        function drawPauseGlowText(text, x, y, font, color, selected = false) {
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
            state.trailEmitAcc += dt * (28 + speedRatio * 24) * Math.max(0, emissionScale);
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

            const maxTrail = Math.max(8, trailMax || PAUSE_CURSOR_TRAIL_MAX);
            if (state.trail.length > maxTrail) {
                state.trail.splice(0, state.trail.length - maxTrail);
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
                const options = getPauseMenuOptions();
                const pauseOptionGap = 74;
                const showPowerups = isPausePowerupMenuAvailable();
                const powerupDetailReserve = showPowerups ? 86 : 0;
                const powerupPanelH = showPowerups ? 2 * 42 + 8 + 44 + powerupDetailReserve : 0;
                const powerupPanelBottomMargin = Math.max(122, Math.round(height * 0.145));
                const powerupTableY = Math.round(height - powerupPanelBottomMargin - powerupPanelH + 30);
                const powerupPanelTop = showPowerups ? powerupTableY - 30 : Math.round(height * 0.78);
                const textBlockH = (options.length - 1) * pauseOptionGap;
                const preferredMidY = Math.round(height * (showPowerups ? 0.235 : 0.31));
                const maxMidY = powerupPanelTop - 84 - textBlockH;
                const minMidY = Math.round(height * 0.16);
                const midY = Math.max(minMidY, Math.min(preferredMidY, maxMidY));
                if (showPowerups) shipCursorTarget = drawPausePowerupBar(powerupTableY);
                const volumeIndex = options.indexOf('VOLUME');

                options.forEach((opt, i) => {
                    const isSel = pauseSelection === i;
                    const y = midY + i * pauseOptionGap;
                    const color = isSel
                        ? mixColor(currentThemeColor, '#ffffff', 0.62)
                        : colorWithAlpha(mixColor(currentThemeColor, '#dcecff', 0.34), 0.74);
                    if (isSel) shipCursorTarget = getPauseCursorTargetForText(opt, midX, y, `main-${i}`);
                    drawPauseGlowText(opt, midX, y, `bold 28px 'Electrolize', sans-serif`, color, isSel);

                    if (i === volumeIndex) {
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
                    'SURVIVOR AIM: < ' + (survivorEightWayAimEnabled ? '8-WAY' : 'ROTATE') + ' >',
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
            if (typeof getMusicPlayerVisualizerLevels !== 'function') return;
            const barCount = Math.max(18, Math.min(34, Math.floor(panelW / 18)));
            const levels = getMusicPlayerVisualizerLevels(barCount);
            if (!levels || !levels.length) return;

            const left = panelX + 16;
            const right = panelX + panelW - 16;
            const baseY = panelY + panelH - 20;
            const topY = panelY + 38;
            const usableH = Math.max(24, baseY - topY);
            const gap = 3;
            const barW = Math.max(2, ((right - left) - gap * (levels.length - 1)) / levels.length);
            const activeAlpha = status && status.isPlaying ? 1 : 0.42;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineWidth = 1;
            ctx.strokeStyle = colorWithAlpha('#7ee7ff', 0.035 * activeAlpha);
            for (let i = 0; i < 4; i++) {
                const y = topY + usableH * (i + 1) / 5;
                ctx.beginPath();
                ctx.moveTo(left, y | 0);
                ctx.lineTo(right, y | 0);
                ctx.stroke();
            }

            for (let i = 0; i < levels.length; i++) {
                const level = Math.max(0, Math.min(1, levels[i] || 0));
                const x = left + i * (barW + gap);
                const barH = Math.max(2, usableH * (0.025 + level * 0.72));
                const y = baseY - barH;
                const alpha = (0.018 + level * 0.13) * activeAlpha;
                const barGrad = ctx.createLinearGradient(0, y, 0, baseY);
                barGrad.addColorStop(0, colorWithAlpha('#ffffff', alpha * 0.72));
                barGrad.addColorStop(0.45, colorWithAlpha('#7ee7ff', alpha));
                barGrad.addColorStop(1, colorWithAlpha(accentColor, alpha * 1.16));
                ctx.fillStyle = barGrad;
                ctx.fillRect(x | 0, y | 0, Math.max(1, barW) | 0, barH | 0);
            }

            ctx.fillStyle = colorWithAlpha(accentColor, 0.035 * activeAlpha);
            ctx.fillRect(left | 0, (baseY - 1) | 0, (right - left) | 0, 1);
            ctx.restore();
        }

        function drawMusicPlayerOverlay() {
            if (typeof getMusicPlayerStatus !== 'function') return;
            const status = getMusicPlayerStatus();
            if (!status || !status.open) return;

            const accent = '#ffd95a';
            const panelW = Math.min(640, width - 72);
            const panelH = 194;
            const panelX = Math.round((width - panelW) / 2);
            const panelY = Math.round(Math.max(72, height * 0.28));
            const pad = 18;
            const pulse = (Math.sin(currentFrameNow * 0.006) + 1) * 0.5;

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(0, 3, 10, 0.46)';
            ctx.fillRect(0, 0, width | 0, height | 0);
            drawPauseHudPanel(panelX, panelY, panelW, panelH, accent, true, {
                fillAlpha: 0.9,
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
            ctx.fillText(trackCountLabel, panelX + panelW - pad, panelY + 55);
            const trackCountW = ctx.measureText(trackCountLabel).width;

            ctx.textAlign = 'left';
            ctx.font = `bold 24px 'Electrolize', sans-serif`;
            ctx.fillStyle = status.isLoaded ? mixColor(accent, '#ffffff', 0.42) : '#ff88a6';
            const trackNameW = Math.max(120, panelW - pad * 2 - trackCountW - 24);
            const trackLabel = truncateConsoleLine(status.isLoaded ? status.trackName.toUpperCase() : `${status.trackName.toUpperCase()}  LOADING`, trackNameW);
            ctx.fillText(trackLabel, panelX + pad, panelY + 54);

            const seekX = panelX + pad;
            const seekY = panelY + 82;
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

            const fillGrad = ctx.createLinearGradient(seekX, 0, seekX + seekW, 0);
            fillGrad.addColorStop(0, colorWithAlpha('#7ee7ff', 0.74));
            fillGrad.addColorStop(0.56, colorWithAlpha(accent, 0.86));
            fillGrad.addColorStop(1, colorWithAlpha('#ffffff', 0.92));
            ctx.fillStyle = fillGrad;
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

            const rowY = panelY + 118;
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

        const GALAXY_SELECT_LAYOUT = [
            { x: 0.34, y: 0.46, scale: 1.08, axis: -0.46, tilt: 0.46, spinDir: 1, spinSpeed: 0.96, cursorAngle: -0.72 },
            { x: 0.53, y: 0.24, scale: 0.92, axis: 0.52, tilt: 0.36, spinDir: -1, spinSpeed: 1.14, cursorAngle: 0.58 },
            { x: 0.80, y: 0.36, scale: 1.18, axis: -0.18, tilt: 0.57, spinDir: 1, spinSpeed: 0.82, cursorAngle: 0.48 },
            { x: 0.39, y: 0.70, scale: 1.12, axis: 0.62, tilt: 0.36, spinDir: -1, spinSpeed: 1.02, cursorAngle: 2.38 },
            { x: 0.86, y: 0.69, scale: 1.25, axis: -0.72, tilt: 0.40, spinDir: 1, spinSpeed: 0.78, cursorAngle: 1.64 },
            { x: 0.62, y: 0.52, scale: 0.96, axis: 0.30, tilt: 0.60, spinDir: -1, spinSpeed: 1.22, cursorAngle: 0.96 },
            { x: 0.17, y: 0.30, scale: 0.96, axis: 1.04, tilt: 0.72, spinDir: 1, spinSpeed: 1.42, cursorAngle: 2.36, prism: true }
        ];
        const GALAXY_SELECT_CURSOR_REST_SEED = Math.random() * 10000;
        const GALAXY_WARP_STREAK_COUNT = 42;
        const GALAXY_WARP_HANDOFF_STREAK_COUNT = 16;
        const GALAXY_WARP_FOCUSED_DETAIL = 0.48;
        const GALAXY_WARP_FOCUSED_FONT_SCALE = 0.42;
        const GALAXY_WARP_SPRITE_CACHE_FPS = 72;
        const GALAXY_CURSOR_TRAIL_MAX = 44;
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
            stamp: 0,
            canvas: null
        };
        const GALAXY_SELECT_BACKGROUND_CACHE_FPS = 36;
        const GALAXY_SELECT_SPRITE_CACHE_FPS_SELECTED = 54;
        const GALAXY_SELECT_SPRITE_CACHE_FPS_IDLE = 36;
        const GALAXY_SELECT_SPRITE_CACHE_MAX = 96;
        const galaxySelectSpriteFrameCache = new Map();

        function galaxyNoise(seed, n) {
            const v = Math.sin((seed + 1) * 127.1 + n * 311.7) * 43758.5453123;
            return v - Math.floor(v);
        }

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

            for (let i = 0; i < count; i++) {
                if (i === current) continue;
                const slot = getGalaxySelectSlot(i);
                const dx = slot.x - from.x;
                const dy = slot.y - from.y;
                const dist = Math.max(0.001, Math.hypot(dx, dy));
                const forward = dx * nx + dy * ny;
                if (forward <= 6) continue;
                const alignment = forward / dist;
                if (alignment < 0.28) continue;
                const perpendicular = Math.abs(dx * ny - dy * nx);
                const score = perpendicular * 1.35 + forward * 0.16 - alignment * 34;
                if (score < bestScore) {
                    bestScore = score;
                    bestIndex = i;
                }
            }

            if (bestIndex !== current) return bestIndex;

            return current;
        }

        function getGalaxySelectRenderRadius(index, selected = false) {
            const profile = getGalaxyVisualProfile(index);
            const galaxy = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS[index] : null;
            const baseRadius = Math.max(46, Math.min(82, Math.min(width, height) * 0.073));
            const survivorScale = galaxy && galaxy.mode === 'survivor' ? 0.94 : 1;
            return baseRadius * profile.scale * survivorScale * (selected ? 1.14 : 0.94);
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

        function drawGalaxySoftAura(colors, radius, selected, alphaScale = 1) {
            const aura = galaxyCtx.createRadialGradient(0, 0, radius * 0.08, 0, 0, radius * 1.35);
            aura.addColorStop(0, colorWithAlpha(colors[2] || colors[1] || '#ffffff', (selected ? 0.18 : 0.10) * alphaScale));
            aura.addColorStop(0.42, colorWithAlpha(colors[1] || colors[0], (selected ? 0.10 : 0.045) * alphaScale));
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
            galaxyCtx.globalAlpha = available ? (selected ? 0.96 : 0.70) : 0.25;
            galaxyCtx.fillStyle = (galaxy && galaxy.coreColor) || colors[2] || '#ffffff';
            galaxyCtx.shadowColor = (galaxy && galaxy.coreColor) || colors[2] || colors[0];
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (selected ? 20 : 9) * fontScale : 0;
            galaxyCtx.save();
            galaxyCtx.rotate(axis * 0.45);
            galaxyCtx.scale(1, 0.78 + tilt * 0.24);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(10, (selected ? 34 : 28) * fontScale), options)}px Courier New`;
            galaxyCtx.fillText(getGalaxyCoreGlyph(galaxy, '@'), 0, 0);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, (selected ? 16 : 13) * fontScale), options)}px Courier New`;
            galaxyCtx.fillStyle = '#071026';
            galaxyCtx.shadowBlur = 0;
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
            const spin = now * (options.warp ? 0.00008 : 0.00012) * (selected ? 1.55 : 1.0) * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const brightness = galaxy.available ? (selected ? 1.18 : 0.78) : 0.32;
            const tilt = options.tiltOverride ?? (profile.tilt || galaxy.tilt || 0.5);
            const cosAxis = Math.cos(axis);
            const sinAxis = Math.sin(axis);
            const twist = (galaxy.twist || 2.8) * Math.PI;
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const stepCount = Math.max(14, Math.round((selected ? 42 : 34) * detail));
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length ? galaxy.glyphs : ['.', '*', '+'];
            const lineWobble = style === 'matrixNebula' ? 0.20 : 0.09;
            let lastFont = '';

            galaxyCtx.save();
            galaxyCtx.lineCap = 'round';
            for (let arm = 0; arm < arms; arm++) {
                const armAngle = (arm / arms) * Math.PI * 2;
                const armColor = colors[arm % colors.length] || colors[0];
                galaxyCtx.globalAlpha = (selected ? 0.22 : 0.11) * brightness;
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
                    const fontSize = getGalaxyFontPx(Math.max(6, (7 + (1 - t) * 9 + depth * 4) * (selected ? 1.05 : 0.95) * fontScale), options);
                    const nextFont = `bold ${fontSize}px Courier New`;
                    if (nextFont !== lastFont) {
                        galaxyCtx.font = nextFont;
                        lastFont = nextFont;
                    }
                    const colorT = depth * 0.42 + (1 - t) * 0.58;
                    galaxyCtx.globalAlpha = Math.min(1, (0.16 + depth * 0.40 + (1 - t) * 0.18) * brightness);
                    galaxyCtx.fillStyle = noise > 0.94 ? '#ffffff' : mixGalaxyColor(colors, colorT);
                    galaxyCtx.fillText(getGalaxyGlyph(galaxy, { glyphIndex: Math.floor(noise * 1024), glyph: glyphs[s % glyphs.length] }, glyphs[s % glyphs.length]), x, y);
                }
            }
            galaxyCtx.restore();
        }

        function drawBinaryQuasarJet(radius, axis, now, selected, options = {}) {
            const jetAngle = axis - Math.PI / 2;
            const pulse = 0.58 + Math.sin(now * 0.0024) * 0.22;
            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            galaxyCtx.lineCap = 'round';
            for (let side = -1; side <= 1; side += 2) {
                const dx = Math.cos(jetAngle) * side;
                const dy = Math.sin(jetAngle) * side;
                const inner = radius * 0.18;
                const outer = radius * (selected ? 1.68 : 1.42);
                galaxyCtx.globalAlpha = selected ? 0.34 : 0.20;
                galaxyCtx.strokeStyle = colorWithAlpha('#dff7ff', 0.72 * pulse);
                galaxyCtx.lineWidth = Math.max(1, radius * 0.035);
                galaxyCtx.beginPath();
                galaxyCtx.moveTo(dx * inner, dy * inner);
                galaxyCtx.lineTo(dx * outer, dy * outer);
                galaxyCtx.stroke();
                galaxyCtx.globalAlpha = selected ? 0.56 : 0.32;
                galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, radius * 0.10), options)}px Courier New`;
                galaxyCtx.fillStyle = '#ffffff';
                for (let i = 0; i < 5; i++) {
                    const t = 0.35 + i * 0.18;
                    galaxyCtx.fillText(i % 2 ? '0' : '1', dx * outer * t, dy * outer * t);
                }
            }
            galaxyCtx.restore();
        }

        function drawMatrixNebulaCloud(galaxy, radius, selected, now, index) {
            const colors = galaxy.colors || ['#007a3a', '#25b85b', '#f2fff6'];
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
                grad.addColorStop(0, colorWithAlpha(whiteGas ? '#f2fff6' : colors[i % 2], selected ? 0.16 : 0.08));
                grad.addColorStop(1, colorWithAlpha(colors[0], 0));
                galaxyCtx.fillStyle = grad;
                galaxyCtx.globalAlpha = 1;
                galaxyCtx.beginPath();
                galaxyCtx.arc(blobX, blobY, blobR, 0, Math.PI * 2);
                galaxyCtx.fill();
            }
            galaxyCtx.restore();
        }

        function drawFractalCounterHalo(galaxy, radius, selected, now, index, options = {}) {
            const profile = getGalaxyVisualProfile(index);
            const spin = -now * 0.00018 * (profile.spinSpeed || 1);
            const count = Math.round((selected ? 58 : 44) * (options.detail || 1));
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
                galaxyCtx.globalAlpha = selected ? 0.34 : 0.18;
                galaxyCtx.fillStyle = i % 7 === 0 ? '#fff7b8' : '#ffd65e';
                galaxyCtx.fillText(i % 4 === 0 ? '*' : '.', x, y);
            }
            galaxyCtx.restore();
        }

        function drawKernelCoronaGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const profile = getGalaxyVisualProfile(index);
            const axis = (options.axisOverride ?? profile.axis) - 0.14;
            const tilt = 0.34;
            const spin = now * 0.00010 * (profile.spinDir || 1);
            const fontScale = options.fontScale || 1;
            const detail = options.detail || 1;
            const warpMode = !!options.warp;
            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.rotate(axis);
            galaxyCtx.scale(1, tilt);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'screen';
            drawGalaxySoftAura(['#ff6a00', '#ff9a1f', '#7cc7ff'], radius, selected, 0.9);

            const coronaCount = Math.round((selected ? 74 : 58) * detail);
            for (let ring = 0; ring < 3; ring++) {
                const ringR = radius * (0.84 + ring * 0.13);
                const wobble = 0.07 + ring * 0.035;
                galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(6, (9 + ring * 2) * fontScale), options)}px Courier New`;
                for (let i = 0; i < coronaCount; i++) {
                    const a = (i / coronaCount) * Math.PI * 2 + spin * (1 + ring * 0.42);
                    const flame = 1 + Math.sin(a * 9 + now * 0.002 + ring) * wobble;
                    const px = Math.cos(a) * ringR * flame;
                    const py = Math.sin(a) * ringR * flame;
                    galaxyCtx.globalAlpha = (selected ? 0.52 : 0.30) * (ring === 1 ? 1 : 0.72);
                    galaxyCtx.fillStyle = ring === 0 ? '#ff4f00' : (i % 5 === 0 ? '#ffc073' : '#ff761b');
                    galaxyCtx.fillText(i % 3 === 0 ? '/' : (i % 3 === 1 ? '\\' : '|'), px, py);
                }
            }

            galaxyCtx.globalCompositeOperation = 'source-over';
            galaxyCtx.globalAlpha = galaxy.available ? (selected ? 0.92 : 0.66) : 0.25;
            galaxyCtx.strokeStyle = colorWithAlpha('#ff8a1c', selected ? 0.78 : 0.48);
            galaxyCtx.lineWidth = Math.max(2, radius * 0.035);
            galaxyCtx.beginPath();
            galaxyCtx.ellipse(0, 0, radius * 0.76, radius * 0.38, 0, 0, Math.PI * 2);
            galaxyCtx.stroke();

            galaxyCtx.globalAlpha = selected ? 0.95 : 0.72;
            galaxyCtx.fillStyle = '#7cc7ff';
            galaxyCtx.shadowColor = '#7cc7ff';
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (selected ? 18 : 9) : 0;
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
            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.rotate(axis);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'screen';
            drawGalaxySoftAura(colors, radius, selected, 0.86);

            galaxyCtx.strokeStyle = colorWithAlpha(colors[1], selected ? 0.28 : 0.15);
            galaxyCtx.lineWidth = 1;
            for (let ring = -2; ring <= 2; ring++) {
                const yRing = ring * radius * 0.18;
                const ringScale = Math.sqrt(Math.max(0.08, 1 - Math.abs(ring) * 0.18));
                galaxyCtx.globalAlpha = selected ? 0.35 : 0.20;
                galaxyCtx.beginPath();
                galaxyCtx.ellipse(0, yRing, radius * 0.74 * ringScale, radius * 0.18, spin + ring * 0.12, 0, Math.PI * 2);
                galaxyCtx.stroke();
            }

            const points = Math.round((selected ? 90 : 70) * detail);
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
                galaxyCtx.globalAlpha = (selected ? 0.72 : 0.44) * (0.48 + sphere * 0.52);
                galaxyCtx.fillStyle = i % 9 === 0 ? colors[2] : (i % 2 ? colors[0] : colors[1]);
                galaxyCtx.fillText(i % 4 === 0 ? '1' : (i % 4 === 1 ? '0' : (i % 4 === 2 ? '<' : '>')), px, py);
            }
            drawGalaxyCore(galaxy, colors, radius, selected, 0, 0.62, options);
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function drawPrismWakeGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#61f7ff', '#ffe66d', '#ff5edb', '#7cff9b', '#ffffff'];
            const profile = getGalaxyVisualProfile(index);
            const axis = profile.axis + Math.sin(now * 0.00011 + index) * 0.06;
            const tilt = profile.tilt || 0.72;
            const spin = now * 0.00016 * (selected ? 1.8 : 1.0) * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const shimmer = 0.5 + Math.sin(now * 0.0047) * 0.5;
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const warpMode = !!options.warp;
            const ringCount = Math.max(3, Math.round((selected ? 6 : 5) * detail));
            const pointsPerRing = Math.max(9, Math.round((selected ? 22 : 17) * detail));
            const brightness = selected ? 1 : 0.74;

            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'lighter';

            const aura = galaxyCtx.createRadialGradient(0, 0, radius * 0.06, 0, 0, radius * 1.32);
            aura.addColorStop(0, colorWithAlpha('#ffffff', selected ? 0.18 : 0.10));
            aura.addColorStop(0.32, colorWithAlpha('#ff5edb', selected ? 0.12 : 0.06));
            aura.addColorStop(0.62, colorWithAlpha('#61f7ff', selected ? 0.08 : 0.035));
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
            const outerCount = Math.max(16, Math.round((selected ? 54 : 40) * detail));
            galaxyCtx.save();
            galaxyCtx.rotate(axis + spin * 0.7);
            galaxyCtx.scale(1, tilt * 0.62);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, radius * 0.105 * fontScale), options)}px Courier New`;
            for (let i = 0; i < outerCount; i++) {
                const angle = (i / outerCount) * Math.PI * 2 + spin * 2.4;
                const stripePulse = 1 + Math.sin(angle * 8 + now * 0.003) * 0.035;
                galaxyCtx.globalAlpha = (selected ? 0.70 : 0.42) * (0.72 + Math.sin(angle * 4 + now * 0.001) * 0.18);
                galaxyCtx.fillStyle = colors[i % colors.length] || '#ffffff';
                if (glowEnabled && !warpMode && (selected || i % 5 === 0)) {
                    galaxyCtx.shadowColor = galaxyCtx.fillStyle;
                    galaxyCtx.shadowBlur = selected ? 8 + shimmer * 7 : 4;
                } else {
                    galaxyCtx.shadowBlur = 0;
                }
                galaxyCtx.fillText(glyphs[i % glyphs.length], Math.cos(angle) * radius * 1.12 * stripePulse, Math.sin(angle) * radius * 1.12 * stripePulse);
            }
            galaxyCtx.restore();
            for (let ring = ringCount - 1; ring >= 0; ring--) {
                const ringT = ring / Math.max(1, ringCount - 1);
                const ringRadius = radius * (0.18 + ringT * 0.86);
                const pulse = 1 + Math.sin(now * 0.0022 + ring * 1.71) * 0.055;
                const localTilt = tilt * (0.5 + ringT * 0.48);
                const pointCount = Math.max(10, pointsPerRing - Math.floor(ring * 1.5));
                for (let i = 0; i < pointCount; i++) {
                    const noise = galaxyNoise((galaxy.seed || 211) + ring * 41, i);
                    const angle = (i / pointCount) * Math.PI * 2 + spin * (1 + ringT * 0.8) + noise * 0.2;
                    const lace = Math.sin(angle * 3 + now * 0.0017 + ring) * radius * 0.04;
                    const localX = Math.cos(angle) * (ringRadius * pulse + lace);
                    const localY = Math.sin(angle) * (ringRadius * pulse) * localTilt;
                    const px = localX * cosAxis - localY * sinAxis;
                    const py = localX * sinAxis + localY * cosAxis;
                    const depth = 0.5 + Math.sin(angle) * 0.5;
                    const fontSize = getGalaxyFontPx(Math.max(7, (7 + (1 - ringT) * 13 + depth * 4) * (selected ? 1.06 : 0.94) * fontScale), options);
                    const nextFont = `bold ${fontSize}px Courier New`;
                    if (nextFont !== lastFont) {
                        galaxyCtx.font = nextFont;
                        lastFont = nextFont;
                    }
                    const color = colors[(ring + i) % Math.max(1, colors.length - 1)];
                    const sparkle = noise > 0.86 ? shimmer * 0.24 : 0;
                    galaxyCtx.globalAlpha = Math.min(1, (0.12 + depth * 0.34 + (1 - ringT) * 0.24 + sparkle) * brightness);
                    galaxyCtx.fillStyle = noise > 0.94 ? '#ffffff' : color;
                    if (glowEnabled && !warpMode && (selected || noise > 0.92)) {
                        galaxyCtx.shadowColor = galaxyCtx.fillStyle;
                        galaxyCtx.shadowBlur = selected ? 7 + shimmer * 9 : 4;
                    } else {
                        galaxyCtx.shadowBlur = 0;
                    }
                    galaxyCtx.fillText(glyphs[(i + ring) % glyphs.length], px, py);
                }
            }

            galaxyCtx.globalAlpha = selected ? 1 : 0.8;
            galaxyCtx.shadowColor = '#ffffff';
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (selected ? 22 : 12) : 0;
            galaxyCtx.fillStyle = '#ffffff';
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(12, (selected ? 34 : 29) * fontScale), options)}px Courier New`;
            galaxyCtx.fillText(getGalaxyCoreGlyph(galaxy, '▲'), 0, 0);
            galaxyCtx.save();
            galaxyCtx.rotate(-spin * 2.8);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, (selected ? 18 : 15) * fontScale), options)}px Courier New`;
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2 + spin * 4;
                galaxyCtx.globalAlpha = selected ? 0.82 : 0.58;
                galaxyCtx.fillStyle = i % 2 ? '#ffffff' : (colors[i % colors.length] || '#ffe66d');
                galaxyCtx.fillText(glyphs[(i * 3) % glyphs.length], Math.cos(angle) * radius * 0.16, Math.sin(angle) * radius * 0.16);
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = selected ? 1 : 0.82;
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, (selected ? 17 : 14) * fontScale), options)}px Courier New`;
            galaxyCtx.fillStyle = colors[1] || '#ffe66d';
            galaxyCtx.fillText(getGalaxyCoreVoidGlyph(galaxy, '▼'), 0, 0);
            galaxyCtx.restore();
            galaxyCtx.globalCompositeOperation = 'source-over';
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
        }

        function drawGalaxyGlyphSpriteDirect(galaxy, x, y, radius, selected, now, index, options = {}) {
            const style = getGalaxyRenderStyle(galaxy);
            if (galaxy && (galaxy.mode === 'survivor' || style === 'prismWake')) {
                drawPrismWakeGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
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

            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.translate(x, y);
            galaxyCtx.globalCompositeOperation = 'screen';
            if (glowEnabled && selected) drawGalaxySoftAura(colors, radius, selected, style === 'matrixNebula' ? 0.72 : 1);
            if (style === 'matrixNebula') drawMatrixNebulaCloud(galaxy, radius, selected, now, index);
            if (style === 'binaryQuasar') drawBinaryQuasarJet(radius, axis, now, selected, options);

            drawGalaxySpiralArms(galaxy, radius, selected, now, index, options);

            if (style === 'fractalHalo') drawFractalCounterHalo(galaxy, radius, selected, now, index, options);
            drawGalaxyCore(galaxy, colors, radius, selected, axis, tilt, options);

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
            const frameFps = options.warp ? GALAXY_WARP_SPRITE_CACHE_FPS : (selected ? GALAXY_SELECT_SPRITE_CACHE_FPS_SELECTED : GALAXY_SELECT_SPRITE_CACHE_FPS_IDLE);
            const frameMs = 1000 / frameFps;
            const phaseOffset = (index % 7) * frameMs / 7;
            const bucket = Math.floor((now + phaseOffset) / frameMs);
            const radiusKey = Math.round(radius * 2);
            const detailKey = Math.round((options.detail || 1) * 100);
            const fontKey = Math.round((options.fontScale || 1) * 100);
            return {
                key: [
                    width,
                    height,
                    galaxy && galaxy.id ? galaxy.id : index,
                    index,
                    selected ? 1 : 0,
                    options.warp ? 1 : 0,
                    glowEnabled ? 1 : 0,
                    radiusKey,
                    detailKey,
                    fontKey
                ].join('|'),
                bucket,
                bucketNow: bucket * frameMs - phaseOffset
            };
        }

        function drawGalaxyGlyphSprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            if (options && options.noCache) {
                drawGalaxyGlyphSpriteDirect(galaxy, x, y, radius, selected, now, index, options);
                return;
            }

            const { key, bucket, bucketNow } = getGalaxySelectSpriteFrameKey(galaxy, index, radius, selected, now, options);
            let entry = galaxySelectSpriteFrameCache.get(key);
            if (entry) {
                galaxySelectSpriteFrameCache.delete(key);
                galaxySelectSpriteFrameCache.set(key, entry);
            } else {
                const cacheRadius = Math.ceil(radius * (selected ? 4.35 : 4.05) + 48);
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
                galaxyCtx = cacheCtx;
                cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
                cacheCtx.clearRect(0, 0, entry.canvas.width, entry.canvas.height);
                cacheCtx.globalAlpha = 1;
                cacheCtx.globalCompositeOperation = 'source-over';
                cacheCtx.shadowBlur = 0;
                try {
                    drawGalaxyGlyphSpriteDirect(galaxy, entry.canvas.width / 2, entry.canvas.height / 2, radius, selected, bucketNow, index, {
                        ...options,
                        noCache: true
                    });
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

        function getGalaxyCursorTarget(slot, radius, galaxy, index, now) {
            const profile = getGalaxyVisualProfile(index);
            const seed = GALAXY_SELECT_CURSOR_REST_SEED + (galaxy.seed || index * 19);
            const restJitter = (galaxyNoise(seed, 2) - 0.5) * 0.54;
            const angle = profile.cursorAngle + restJitter;
            const distance = radius + 21 + galaxyNoise(seed, 3) * 16;
            const minRestY = Math.max(128, height * 0.16);
            const targetX = Math.max(52, Math.min(width - 52, slot.x + Math.cos(angle) * distance));
            const targetY = Math.max(minRestY, Math.min(height - 128, slot.y + Math.sin(angle) * distance));
            const approachDistance = distance + 62 + galaxyNoise(seed, 4) * 34;
            const bend = (galaxyNoise(seed, 5) - 0.5) * 48;
            const normalX = -Math.sin(angle);
            const normalY = Math.cos(angle);
            return {
                x: targetX,
                y: targetY,
                faceX: slot.x,
                faceY: slot.y,
                approachX: Math.max(24, Math.min(width - 24, slot.x + Math.cos(angle) * approachDistance + normalX * bend)),
                approachY: Math.max(80, Math.min(height - 100, slot.y + Math.sin(angle) * approachDistance + normalY * bend)),
                scale: 0.22 + galaxyNoise(seed, 6) * 0.035,
                key: `galaxy-${index}`,
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

        function drawGalaxySelectCursor(target) {
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
            drawPauseMenuShipTrail(cursor.dt);
            galaxyCtx.save();
            galaxyCtx.translate(cursor.x, cursor.y);
            galaxyCtx.rotate(cursor.rot);
            galaxyCtx.scale(cursor.scale, cursor.scale);
            PAUSE_CURSOR_SHIP.x = 0;
            PAUSE_CURSOR_SHIP.y = 0;
            PAUSE_CURSOR_SHIP.vx = 0;
            PAUSE_CURSOR_SHIP.vy = 0;
            PAUSE_CURSOR_SHIP.shipId = 'arrowhead';
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
            emitPauseMenuShipExhaustTrail(cursor, currentFrameNow, speedRatio * 0.75, 0.46, GALAXY_CURSOR_TRAIL_MAX);
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

        function drawGalaxySelectWorldLayerDirect(now, selectedIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            drawGalaxySelectBackground(now);
            for (let i = 0; i < galaxies.length; i++) {
                const galaxy = galaxies[i];
                const slot = getGalaxySelectSlot(i);
                const selected = i === selectedIndex;
                const radius = getGalaxySelectRenderRadius(i, selected);
                drawGalaxyGlyphSprite(galaxy, slot.x, slot.y, radius, selected, now, i);

                if (selected) {
                    const cursorTarget = getGalaxyCursorTarget(slot, radius, galaxy, i, now);
                    drawGalaxyCursorGuide(cursorTarget, galaxy.colors ? galaxy.colors[0] : currentThemeColor, now);
                }
            }
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
            galaxyCtx.fillText('CHOOSE A GALAXY ROUTE', width / 2, height * 0.123);

            for (let i = 0; i < galaxies.length; i++) {
                const galaxy = galaxies[i];
                const slot = getGalaxySelectSlot(i);
                const selected = i === selectedIndex;
                const radius = getGalaxySelectRenderRadius(i, selected);

                const survivorRoute = galaxy && galaxy.mode === 'survivor';
                const labelY = survivorRoute ? slot.y - radius - 30 : slot.y + radius + 42;
                galaxyCtx.font = `bold ${selected ? 18 : 14}px 'Electrolize', sans-serif`;
                galaxyCtx.fillStyle = selected
                    ? (galaxy.available ? '#ffffff' : 'rgba(210,220,235,0.58)')
                    : (galaxy.available ? 'rgba(202,229,255,0.72)' : 'rgba(140,150,165,0.45)');
                galaxyCtx.shadowColor = galaxy.colors ? galaxy.colors[0] : currentThemeColor;
                galaxyCtx.shadowBlur = glowEnabled && selected ? 12 : 0;
                galaxyCtx.fillText(galaxy.title || galaxy.name, slot.x, labelY);
                galaxyCtx.shadowBlur = 0;
                galaxyCtx.font = `bold 11px 'Electrolize', sans-serif`;
                galaxyCtx.fillStyle = galaxy.available ? colorWithAlpha(galaxy.colors[1] || currentThemeColor, selected ? 0.9 : 0.56) : 'rgba(170,178,190,0.46)';
                galaxyCtx.fillText(galaxy.available ? (survivorRoute ? 'SURVIVAL MODE' : 'AVAILABLE') : 'LOCKED', slot.x, labelY + 20);

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
            galaxyCtx.restore();
        }

        function drawGalaxySelectBaseLayerDirect(now, selectedIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            drawGalaxySelectWorldLayerDirect(now, selectedIndex);
            drawGalaxySelectUiLayer(now, galaxies, selectedIndex);
        }

        function getGalaxySelectCurrentCursorTarget(now, selectedIndex = selectedGalaxyIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            const galaxy = galaxies[selectedIndex] || galaxies[0];
            if (!galaxy) return null;
            const slot = getGalaxySelectSlot(selectedIndex);
            const radius = getGalaxySelectRenderRadius(selectedIndex, true);
            return getGalaxyCursorTarget(slot, radius, galaxy, selectedIndex, now);
        }

        function drawGalaxySelectScreen(now, showCursor = true) {
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
            const focusT = easeGalaxyWarp(Math.max(0, Math.min(1, progress / 0.48)));
            const zoomT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.18) / 0.54)));
            return {
                focusX: lerpGalaxyWarp(targetX, width / 2, focusT * 0.82),
                focusY: lerpGalaxyWarp(targetY, height * 0.48, focusT * 0.82),
                zoom: 1 + focusT * 0.28 + zoomT * 0.24,
                focusT,
                zoomT
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
            const cache = galaxyWarpMenuSnapshotCache;
            if (
                cache.canvas &&
                cache.width === width &&
                cache.height === height &&
                cache.selectedIndex === selectedIndex &&
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
            cache.stamp = stamp;
            return cache.canvas;
        }

        function getGalaxyWarpSelectedGalaxy(selectedIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            return galaxies[selectedIndex] || galaxies[0] || getGalaxyDefinition(0);
        }

        function getGalaxyWarpPortalCenter(progress, targetX, targetY) {
            const firstDrift = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.08) / 0.46)));
            const finalPull = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.28)));
            return {
                x: lerpGalaxyWarp(targetX, width / 2, Math.min(1, firstDrift * 0.82 + finalPull * 0.18)),
                y: lerpGalaxyWarp(targetY, height * 0.48, Math.min(1, firstDrift * 0.78 + finalPull * 0.22))
            };
        }

        function getGalaxyWarpPortalRadius(progress, selectedIndex) {
            const baseRadius = getGalaxySelectRenderRadius(selectedIndex, true);
            const openT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.10) / 0.66)));
            const lungeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.62) / 0.26)));
            return lerpGalaxyWarp(baseRadius * 0.92, Math.max(width, height) * 0.56, openT) * (1 + lungeT * 0.18);
        }

        function drawGalaxyWarpPortal(now, progress, selectedIndex, color, centerX, centerY) {
            const galaxy = getGalaxyWarpSelectedGalaxy(selectedIndex);
            if (!galaxy) return;

            const colors = galaxy.colors || [color, '#ffffff'];
            const profile = getGalaxyVisualProfile(selectedIndex);
            const style = getGalaxyRenderStyle(galaxy);
            const radius = getGalaxyWarpPortalRadius(progress, selectedIndex);
            const enterT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.08) / 0.24)));
            const growT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.12) / 0.68)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.54) / 0.30)));
            const fadeOut = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.92) / 0.08)));
            const alpha = enterT * (1 - fadeOut * 0.35);
            if (alpha <= 0.01) return;

            const axis = (profile.axis || 0) + Math.sin(now * 0.00012 + (galaxy.seed || selectedIndex)) * 0.06;
            const tilt = Math.max(0.32, Math.min(0.76, profile.tilt || galaxy.tilt || 0.5));
            const spinDir = profile.spinDir || 1;
            const spin = now * 0.00034 * spinDir * (0.9 + surgeT * 2.2);
            const arms = Math.max(2, Math.min(7, galaxy.arms || 3));
            const twist = (galaxy.twist || 3) * Math.PI * (1.03 + surgeT * 0.12);
            const seed = galaxy.seed || selectedIndex * 31;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const aura = ctx.createRadialGradient(centerX, centerY, radius * 0.04, centerX, centerY, radius * 1.16);
            aura.addColorStop(0, colorWithAlpha('#ffffff', 0.20 * alpha));
            aura.addColorStop(0.18, colorWithAlpha(colors[2] || colors[1] || '#ffffff', 0.16 * alpha));
            aura.addColorStop(0.48, colorWithAlpha(colors[1] || colors[0], 0.10 * alpha));
            aura.addColorStop(1, colorWithAlpha(colors[0] || color, 0));
            ctx.fillStyle = aura;
            ctx.fillRect(0, 0, width, height);

            ctx.translate(centerX, centerY);
            ctx.rotate(axis);
            ctx.scale(1, tilt);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let ring = 0; ring < 4; ring++) {
                const t = ring / 3;
                const ringRadius = radius * (0.28 + t * (0.64 + growT * 0.20));
                const ringColor = colors[(ring + 1) % colors.length] || color;
                ctx.globalAlpha = alpha * (0.13 - t * 0.018) * (0.75 + surgeT * 0.52);
                ctx.strokeStyle = colorWithAlpha(ringColor, 0.72);
                ctx.lineWidth = Math.max(1, radius * (0.006 + t * 0.004));
                ctx.beginPath();
                ctx.ellipse(0, 0, ringRadius * (1.08 + t * 0.18), ringRadius * (0.54 + t * 0.06), spin * (0.6 + t), 0, Math.PI * 2);
                ctx.stroke();
            }

            const steps = 60;
            for (let arm = 0; arm < arms; arm++) {
                const baseAngle = (arm / arms) * Math.PI * 2 + spin;
                const armColor = colors[arm % colors.length] || color;
                ctx.globalAlpha = alpha * (0.28 + surgeT * 0.10);
                ctx.strokeStyle = colorWithAlpha(armColor, style === 'matrixNebula' ? 0.74 : 0.62);
                ctx.lineWidth = Math.max(1, radius * (0.008 + (arm % 2) * 0.0025));
                ctx.beginPath();
                for (let s = 0; s < steps; s++) {
                    const t = s / (steps - 1);
                    const noise = galaxyNoise(seed + arm * 97, s);
                    const r = radius * (0.10 + Math.pow(t, 0.72) * 0.91) * (0.96 + (noise - 0.5) * 0.09);
                    const angle = baseAngle + t * twist + (noise - 0.5) * 0.11;
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r * (0.78 + Math.sin(t * Math.PI + arm) * 0.05);
                    if (s === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                ctx.globalAlpha = alpha * (0.13 + surgeT * 0.08);
                ctx.lineWidth = Math.max(0.8, radius * 0.005);
                ctx.strokeStyle = colorWithAlpha('#ffffff', 0.34);
                ctx.stroke();
            }

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const glyphCount = Math.round(24 + growT * 24);
            for (let i = 0; i < glyphCount; i++) {
                const arm = i % arms;
                const t = Math.pow((i + 1) / glyphCount, 0.70);
                const noise = galaxyNoise(seed + 2301, i);
                const a = (arm / arms) * Math.PI * 2 + spin + t * twist + (noise - 0.5) * 0.28;
                const r = radius * (0.13 + t * 0.86) * (0.88 + galaxyNoise(seed + 2327, i) * 0.22);
                const depth = 0.56 + Math.sin(a + spin) * 0.44;
                const x = Math.cos(a) * r * (0.92 + depth * 0.12);
                const y = Math.sin(a) * r * (0.72 + depth * 0.16);
                const fontSize = Math.max(7, Math.min(22, radius * (0.028 + (1 - t) * 0.026 + depth * 0.012)));
                const glyph = getGalaxyGlyph(galaxy, { glyphIndex: Math.floor(noise * 4096), glyph: i % 4 === 0 ? '*' : '.' }, '.');
                ctx.font = `bold ${Math.round(fontSize)}px Courier New`;
                ctx.globalAlpha = alpha * Math.min(0.9, 0.20 + depth * 0.38 + surgeT * 0.16);
                ctx.fillStyle = noise > 0.92 ? '#ffffff' : mixGalaxyColor(colors, depth * 0.52 + (1 - t) * 0.28);
                ctx.fillText(glyph, x, y);
            }

            ctx.globalAlpha = alpha * (0.76 + surgeT * 0.24);
            ctx.fillStyle = colors[2] || '#ffffff';
            ctx.shadowColor = colors[1] || color;
            ctx.shadowBlur = glowEnabled ? Math.min(34, radius * 0.12) : 0;
            ctx.font = `bold ${Math.round(Math.max(16, Math.min(54, radius * 0.16)))}px Courier New`;
            ctx.fillText(getGalaxyCoreGlyph(galaxy, '@'), 0, 0);
            ctx.globalAlpha = alpha * 0.92;
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#01040b';
            ctx.font = `bold ${Math.round(Math.max(9, Math.min(26, radius * 0.075)))}px Courier New`;
            ctx.fillText(getGalaxyCoreVoidGlyph(galaxy, '.'), 0, 0);

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

        function drawGalaxyWarpMap(now, targetX, targetY, camera, selectedIndex, progress) {
            const menuFade = 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.05) / 0.34)));
            if (menuFade > 0.01) {
                const snapshot = prepareGalaxyWarpMenuSnapshot(galaxyWarpTransition && galaxyWarpTransition.startedAt ? galaxyWarpTransition.startedAt : now, selectedIndex);
                ctx.save();
                ctx.translate(camera.focusX, camera.focusY);
                ctx.scale(camera.zoom, camera.zoom);
                ctx.translate(-targetX, -targetY);
                ctx.globalAlpha = 1;
                if (snapshot) ctx.drawImage(snapshot, 0, 0);
                else drawGalaxySelectBaseLayerDirect(now, selectedIndex);
                ctx.restore();
                if (menuFade < 0.99) {
                    ctx.save();
                    ctx.globalAlpha = Math.min(0.92, (1 - menuFade) * 0.86);
                    ctx.fillStyle = '#01040b';
                    ctx.fillRect(0, 0, width, height);
                    ctx.restore();
                }
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpStreaks(now, progress, color, centerX, centerY) {
            const eased = easeGalaxyWarp(progress);
            const streakCount = GALAXY_WARP_STREAK_COUNT;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            for (let i = 0; i < streakCount; i++) {
                const noiseA = galaxyNoise(1201, i);
                const noiseB = galaxyNoise(1409 + i, 3);
                const angle = (i / streakCount) * Math.PI * 2 + now * 0.00012 + (noiseA - 0.5) * 0.22;
                const inner = 20 + eased * 18 + noiseB * 64;
                const length = 36 + eased * (160 + noiseA * 240);
                const outer = inner + length;
                const sx = centerX + Math.cos(angle) * inner;
                const sy = centerY + Math.sin(angle) * inner;
                const ex = centerX + Math.cos(angle) * outer;
                const ey = centerY + Math.sin(angle) * outer;
                const alpha = Math.sin(Math.min(1, progress) * Math.PI) * (0.1 + noiseA * 0.32);
                ctx.strokeStyle = i % 5 === 0
                    ? colorWithAlpha('#ffffff', 0.08 + eased * 0.18)
                    : colorWithAlpha(color, 0.1 + eased * 0.2);
                ctx.lineWidth = 0.8 + eased * 2.4 * noiseA;
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

        function getGalaxyWarpShipPose(progress, transition, portalCenter, portalRadius) {
            const targetX = transition.toX || width / 2;
            const targetY = transition.toY || height * 0.35;
            const fromX = Number.isFinite(transition.fromX) ? transition.fromX : targetX - 80;
            const fromY = Number.isFinite(transition.fromY) ? transition.fromY : targetY + 20;
            const centerX = portalCenter.x;
            const centerY = portalCenter.y;
            const angleFromCenter = Math.atan2(fromY - centerY, fromX - centerX);
            const entryDistance = Math.max(58, portalRadius * 0.58);
            const entryX = centerX + Math.cos(angleFromCenter) * entryDistance;
            const entryY = centerY + Math.sin(angleFromCenter) * entryDistance * 0.72;
            const driftT = easeGalaxyWarp(Math.max(0, Math.min(1, progress / 0.46)));
            const dashT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.42) / 0.25)));
            const lockT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.64) / 0.18)));
            const orbit = Math.sin(progress * Math.PI * 3.8) * (1 - dashT) * 10;
            let x = lerpGalaxyWarp(fromX, entryX, driftT);
            let y = lerpGalaxyWarp(fromY, entryY, driftT);
            const nx = -Math.sin(angleFromCenter);
            const ny = Math.cos(angleFromCenter);
            x += nx * orbit;
            y += ny * orbit;
            x = lerpGalaxyWarp(x, centerX, dashT);
            y = lerpGalaxyWarp(y, centerY, dashT);
            x = lerpGalaxyWarp(x, centerX, lockT);
            y = lerpGalaxyWarp(y, centerY, lockT);
            return { x, y, entryX, entryY, centerX, centerY, dashT, driftT, lockT };
        }

        function drawGalaxyWarpShip(progress, transition, color, portalCenter, portalRadius) {
            const pose = getGalaxyWarpShipPose(progress, transition, portalCenter, portalRadius);
            const previousProgress = Math.max(0, progress - 0.016);
            const previousCenter = getGalaxyWarpPortalCenter(previousProgress, transition.toX || width / 2, transition.toY || height * 0.35);
            const previousRadius = getGalaxyWarpPortalRadius(previousProgress, transition.galaxyIndex || 0);
            const previousPose = getGalaxyWarpShipPose(previousProgress, transition, previousCenter, previousRadius);
            const travelRot = Math.atan2(pose.y - previousPose.y, pose.x - previousPose.x) + Math.PI / 2;
            const fromRot = Number.isFinite(transition.fromRot) ? transition.fromRot : travelRot;
            const turnT = easeGalaxyWarp(Math.min(1, progress / 0.32));
            const rot = fromRot + normalizePauseCursorAngle(travelRot - fromRot) * turnT;
            const fade = Math.max(0, Math.min(1, (0.88 - progress) / 0.18));
            const startScale = Number.isFinite(transition.fromScale) ? transition.fromScale : 0.24;
            const scale = startScale * (1 + pose.driftT * 0.18 + pose.dashT * 0.68) * (0.72 + fade * 0.28);

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            const trailSteps = 14;
            for (let i = 0; i < trailSteps; i++) {
                const t = i / Math.max(1, trailSteps - 1);
                const sampleProgress = Math.max(0, progress - (1 - t) * (0.28 + pose.dashT * 0.14));
                const sampleCenter = getGalaxyWarpPortalCenter(sampleProgress, transition.toX || width / 2, transition.toY || height * 0.35);
                const sampleRadius = getGalaxyWarpPortalRadius(sampleProgress, transition.galaxyIndex || 0);
                const samplePose = getGalaxyWarpShipPose(sampleProgress, transition, sampleCenter, sampleRadius);
                const trailAlpha = fade * (0.02 + t * 0.17) * (0.75 + pose.dashT * 0.55);
                ctx.globalAlpha = trailAlpha;
                ctx.strokeStyle = i % 3 === 0 ? colorWithAlpha('#ffffff', 0.38) : colorWithAlpha(color, 0.56);
                ctx.lineWidth = 0.8 + t * (2.6 + pose.dashT * 3.4);
                ctx.beginPath();
                ctx.moveTo(samplePose.x, samplePose.y);
                ctx.lineTo(
                    samplePose.x - Math.cos(rot - Math.PI / 2) * (18 + t * (56 + pose.dashT * 120)),
                    samplePose.y - Math.sin(rot - Math.PI / 2) * (18 + t * (56 + pose.dashT * 120))
                );
                ctx.stroke();
            }
            ctx.restore();

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
            PAUSE_CURSOR_SHIP.shipId = 'arrowhead';
            PAUSE_CURSOR_SHIP._renderLayoutCache = null;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#f6fbff';
            ctx.shadowColor = color;
            ctx.shadowBlur = glowEnabled ? 18 : 0;
            drawPlayerShip(PAUSE_CURSOR_SHIP, 'center');
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawGalaxyWarpFlash(progress, color, centerX, centerY) {
            const ringT = Math.max(0, Math.min(1, (progress - 0.42) / 0.46));
            const flashT = Math.max(0, Math.min(1, (progress - 0.72) / 0.22));
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            if (ringT > 0) {
                const radius = 24 + ringT * Math.max(width, height) * 0.42;
                ctx.globalAlpha = Math.sin(ringT * Math.PI) * 0.34;
                ctx.strokeStyle = colorWithAlpha(color, 0.65);
                ctx.lineWidth = 3 + ringT * 12;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radius * 1.15, radius * 0.46, Math.sin(progress * Math.PI * 2) * 0.38, 0, Math.PI * 2);
                ctx.stroke();
            }
            if (flashT > 0) {
                const glow = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, Math.max(width, height) * 0.72);
                glow.addColorStop(0, colorWithAlpha('#ffffff', 0.28 * flashT));
                glow.addColorStop(0.22, colorWithAlpha(color, 0.22 * flashT));
                glow.addColorStop(0.72, colorWithAlpha('#6aa8ff', 0.07 * flashT));
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

            drawGalaxyWarpPortal(now, progress, transition.galaxyIndex || 0, color, focalPoint.x, focalPoint.y);
            drawGalaxyWarpStreaks(now, progress, color, focalPoint.x, focalPoint.y);
            drawGalaxyWarpShip(progress, transition, color, focalPoint, portalRadius);
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

            ctx.save();
            const veil = ctx.createRadialGradient(centerX, centerY, Math.max(8, panelW * 0.12), centerX, centerY, Math.max(width, height) * 0.74);
            veil.addColorStop(0, 'rgba(18, 4, 18, 0.42)');
            veil.addColorStop(0.46, 'rgba(4, 8, 18, 0.72)');
            veil.addColorStop(1, 'rgba(1, 3, 8, 0.9)');
            ctx.fillStyle = veil;
            ctx.fillRect(0, 0, width, height);

            const wash = ctx.createLinearGradient(0, panelY, 0, panelY + panelH);
            wash.addColorStop(0, colorWithAlpha(dangerColor, 0.08));
            wash.addColorStop(0.5, colorWithAlpha('#0a1026', 0.08));
            wash.addColorStop(1, colorWithAlpha(deepDanger, 0.12));
            ctx.fillStyle = wash;
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';
            ctx.lineWidth = 1;
            for (let i = 0; i < 24; i++) {
                const y = panelY - 82 + i * 15 + Math.sin(now * 0.002 + i) * 2;
                if (y < 0 || y > height) continue;
                ctx.globalAlpha = 0.018 + (i % 5 === 0 ? 0.026 : 0);
                ctx.strokeStyle = i % 5 === 0 ? '#ffffff' : dangerColor;
                ctx.beginPath();
                ctx.moveTo(width * 0.18, y);
                ctx.lineTo(width * 0.82, y);
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
            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#ffd6e4', 0.76);
            ctx.fillText('FLIGHT RECORDER // SIGNAL LOST', centerX, panelY + 33);

            const titleY = panelY + panelH * 0.33;
            const titleText = 'YOU DIED';
            ctx.font = `bold ${Math.max(38, Math.min(68, width * 0.066))}px 'Electrolize', sans-serif`;
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

            ctx.font = `bold 13px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha(mixColor(currentThemeColor, '#ffffff', 0.48), 0.86);
            ctx.fillText('RUN TERMINATED - BLACK BOX PARTIAL', centerX, titleY + 45);

            const promptW = Math.min(panelW - 86, 330);
            const promptH = 40;
            const promptX = centerX - promptW / 2;
            const promptY = panelY + panelH * 0.63;
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

            const hint = currentHint || 'Pro tip: dodging the bullets is traditionally considered good aviation.';
            const hintLines = wrapPauseText(hint, panelW - 80, 2);
            ctx.font = `14px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#ffd9a8', 0.86);
            for (let i = 0; i < hintLines.length; i++) {
                ctx.fillText(hintLines[i], centerX, panelY + panelH - 50 + i * 18);
            }

            ctx.textAlign = 'left';
            ctx.font = `bold 10px Courier New`;
            ctx.globalAlpha = 0.18 + pulse * 0.07;
            ctx.fillStyle = '#ffffff';
            const readouts = ['0xDEAD', 'NO CARRIER', 'HP: 00', 'REBOOT?'];
            for (let i = 0; i < readouts.length; i++) {
                ctx.fillText(readouts[i], panelX + 24 + i * 92, panelY + panelH - 18);
            }
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
            ctx.fillStyle = wash;
            ctx.fillRect(0, 0, width, height);

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
                    ctx.font = `bold 22px Courier New`;
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
            ctx.fillStyle = overlay;
            ctx.fillRect(0, 0, width, height);

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
            if (slowmo > 0.01) {
                ctx.globalAlpha = 0.035 * slowmo;
                ctx.fillStyle = accent;
                ctx.fillRect(0, 0, width, height);
                ctx.globalAlpha = 0.08 * slowmo;
                ctx.strokeStyle = colorWithAlpha('#ffffff', 0.55);
                ctx.lineWidth = 1;
                const spacing = 54;
                const yStart = ((now * 0.018) % spacing) - spacing;
                for (let y = yStart; y < height + spacing; y += spacing) {
                    const wobbleX = Math.sin(now * 0.0022 + y * 0.025) * 18 * slowmo;
                    ctx.beginPath();
                    ctx.moveTo(-20, y);
                    ctx.lineTo(width * 0.32 + wobbleX, y + 3);
                    ctx.lineTo(width * 0.68 - wobbleX, y - 3);
                    ctx.lineTo(width + 20, y);
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
                ctx.fillRect(0, 0, width, height);

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
            const survivorModeVisual = typeof isSurvivorModeActive === 'function' && isSurvivorModeActive();
            const fieldStep = survivorModeVisual ? 2 : 1;
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
            drawFocusTimeWarpOverlay(renderNow, false);

            if (gameState === 'PAUSED' && pauseReturnState === 'GALAXY_SELECT') {
                drawGalaxySelectScreen(renderNow, false);
            } else if (gameState === 'GALAXY_SELECT') {
                drawGalaxySelectScreen(renderNow);
            } else if (gameState === 'RETURN_LOADING') {
                drawReturnLoadingScreen(renderNow);
            } else if (gameState === 'GALAXY_WARP') {
                drawGalaxyWarpTransition(renderNow);
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
