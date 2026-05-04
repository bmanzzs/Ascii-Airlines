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
                    drawEnemyShipSprite(e, colorWithAlpha(trailColor, 0.85));
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

        const GALAXY_SELECT_LAYOUT = [
            { x: 0.17, y: 0.30, scale: 1.08, axis: -0.46, tilt: 0.46, spinDir: 1, spinSpeed: 0.96, cursorAngle: -2.18 },
            { x: 0.53, y: 0.24, scale: 0.92, axis: 0.52, tilt: 0.36, spinDir: -1, spinSpeed: 1.14, cursorAngle: 0.58 },
            { x: 0.80, y: 0.36, scale: 1.18, axis: -0.18, tilt: 0.57, spinDir: 1, spinSpeed: 0.82, cursorAngle: 0.48 },
            { x: 0.28, y: 0.64, scale: 0.84, axis: 0.82, tilt: 0.50, spinDir: -1, spinSpeed: 1.02, cursorAngle: 2.38 },
            { x: 0.62, y: 0.58, scale: 1.25, axis: -0.72, tilt: 0.40, spinDir: 1, spinSpeed: 0.78, cursorAngle: 1.64 },
            { x: 0.86, y: 0.69, scale: 0.96, axis: 0.30, tilt: 0.60, spinDir: -1, spinSpeed: 1.22, cursorAngle: 0.96 }
        ];
        const GALAXY_SELECT_CURSOR_REST_SEED = Math.random() * 10000;
        const GALAXY_WARP_STREAK_COUNT = 42;
        const GALAXY_WARP_HANDOFF_STREAK_COUNT = 16;
        const GALAXY_CURSOR_TRAIL_MAX = 44;
        const GALAXY_SPRITE_POINT_CACHE = new Map();
        const galaxySpriteDrawScratch = [];
        const galaxySelectBgGradientCache = {
            width: 0,
            height: 0,
            gradient: null
        };

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
                    glyph: t < 0.18 ? 'o' : (galaxyNoise(seed + 8, i) > 0.86 ? '+' : (galaxyNoise(seed + 11, i) > 0.64 ? '*' : (galaxyNoise(seed + 14, i) > 0.42 ? "'" : '.')))
                });
            }
            GALAXY_SPRITE_POINT_CACHE.set(key, points);
            return points;
        }

        function mixGalaxyColor(colors, t) {
            if (!colors || colors.length === 0) return currentThemeColor;
            if (t < 0.34) return colors[0];
            if (t < 0.72) return colors[1] || colors[0];
            return colors[2] || colors[1] || colors[0];
        }

        function getGalaxySelectBackgroundGradient() {
            if (
                galaxySelectBgGradientCache.gradient &&
                galaxySelectBgGradientCache.width === width &&
                galaxySelectBgGradientCache.height === height
            ) {
                return galaxySelectBgGradientCache.gradient;
            }
            const bg = ctx.createRadialGradient(width / 2, height * 0.45, 20, width / 2, height / 2, Math.max(width, height) * 0.72);
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
            const maxY = Math.min(height * 0.75, height - 190);
            return {
                x: Math.max(marginX, Math.min(width - marginX, width * profile.x)),
                y: Math.max(minY, Math.min(maxY, height * profile.y))
            };
        }

        function getGalaxyVisualProfile(index) {
            return GALAXY_SELECT_LAYOUT[index % GALAXY_SELECT_LAYOUT.length] || GALAXY_SELECT_LAYOUT[0];
        }

        function getGalaxySelectRenderRadius(index, selected = false) {
            const profile = getGalaxyVisualProfile(index);
            const baseRadius = Math.max(46, Math.min(82, Math.min(width, height) * 0.073));
            return baseRadius * profile.scale * (selected ? 1.12 : 0.94);
        }

        function drawGalaxySelectAsteroidBelt(now) {
            const bandAngle = -0.28;
            const centerX = width * 0.5;
            const centerY = height * 0.51;
            const beltW = width * 1.28;
            const beltH = height * 0.16;
            const cos = Math.cos(bandAngle);
            const sin = Math.sin(bandAngle);
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(bandAngle);
            const bandGlow = ctx.createLinearGradient(-beltW / 2, 0, beltW / 2, 0);
            bandGlow.addColorStop(0, 'rgba(126, 166, 220, 0)');
            bandGlow.addColorStop(0.34, 'rgba(126, 166, 220, 0.018)');
            bandGlow.addColorStop(0.62, 'rgba(126, 166, 220, 0.012)');
            bandGlow.addColorStop(1, 'rgba(126, 166, 220, 0)');
            ctx.strokeStyle = bandGlow;
            ctx.lineWidth = Math.max(9, height * 0.014);
            ctx.beginPath();
            ctx.moveTo(-beltW / 2, 0);
            ctx.lineTo(beltW / 2, 0);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
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
                ctx.globalAlpha = a.alpha * (0.5 + depth * 0.7);
                ctx.fillStyle = depth > 0.5 ? '#8fa7c9' : '#52657d';
                ctx.font = `bold ${Math.max(4, a.size * (0.72 + depth * 0.42))}px Courier New`;
                ctx.fillText(a.glyph, x, y);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawGalaxySelectComets(now) {
            const cometConfigs = [
                { period: 14500, offset: 1800, seed: 801, angle: -0.34, color: '#c8f7ff' },
                { period: 21800, offset: 9300, seed: 911, angle: -0.62, color: '#ffe9a8' }
            ];
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
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
                    ctx.globalAlpha = fade * (0.04 + life * 0.34);
                    ctx.fillStyle = j < 3 ? '#ffffff' : cfg.color;
                    ctx.shadowColor = cfg.color;
                    ctx.shadowBlur = glowEnabled ? 6 + life * 12 : 0;
                    ctx.font = `bold ${Math.max(5, 5 + life * 10)}px Courier New`;
                    ctx.fillText(j < 2 ? '*' : (j % 3 === 0 ? '+' : '.'), px, py);
                }
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawGalaxySelectBackground(now) {
            ctx.fillStyle = getGalaxySelectBackgroundGradient();
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < GALAXY_SELECT_BG_STARS.length; i++) {
                const s = GALAXY_SELECT_BG_STARS[i];
                const twinkle = 0.66 + Math.sin(now * s.speed + s.phase) * 0.28 + Math.sin(now * s.speed * 0.37 + i) * 0.10;
                ctx.globalAlpha = s.alpha * twinkle;
                ctx.font = s.font;
                ctx.fillStyle = s.bright ? '#f0fbff' : (i % 9 === 0 ? '#8db7ff' : '#6f91c8');
                const driftX = Math.sin(now * 0.00007 + i) * (s.bright ? 1.2 : 0.5);
                const driftY = Math.cos(now * 0.00005 + i * 1.7) * (s.bright ? 0.9 : 0.4);
                ctx.fillText(s.glyph, s.x * width + driftX, s.y * height + driftY);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            drawGalaxySelectAsteroidBelt(now);
            drawGalaxySelectComets(now);
        }

        function drawGalaxyGlyphSprite(galaxy, x, y, radius, selected, now, index) {
            const colors = galaxy.colors || ['#6aa8ff', '#ff5e8a', '#ffffff'];
            const arms = Math.max(2, galaxy.arms || 2);
            const seed = galaxy.seed || index * 17;
            const profile = getGalaxyVisualProfile(index);
            const axis = profile.axis + Math.sin(now * 0.00009 + seed) * 0.035;
            const spin = now * 0.00012 * (selected ? 1.75 : 1.0) * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const brightness = galaxy.available ? (selected ? 1.18 : 0.78) : 0.32;
            const count = selected ? 190 : 148;
            const pointSet = getGalaxySpritePointSet(galaxy, index, count);
            const points = galaxySpriteDrawScratch;
            points.length = count;
            const tilt = profile.tilt || galaxy.tilt || 0.5;
            const cosAxis = Math.cos(axis);
            const sinAxis = Math.sin(axis);
            const twist = (galaxy.twist || 2.8) * Math.PI;

            for (let i = 0; i < count; i++) {
                const p = pointSet[i];
                const angle = p.armAngle + p.t * twist + spin + p.drift * 0.34;
                const sinAngle = Math.sin(angle);
                const cosAngle = Math.cos(angle);
                const r = radius * p.radiusMul;
                const depth = 0.5 + sinAngle * 0.5;
                const localX = cosAngle * r;
                const localY = sinAngle * r * tilt + (depth - 0.5) * radius * 0.12;
                p.x = localX * cosAxis - localY * sinAxis;
                p.y = localX * sinAxis + localY * cosAxis;
                p.depth = depth;
                p.colorT = depth * 0.4 + (1 - p.t) * 0.6;
                points[i] = p;
            }

            points.sort((a, b) => a.depth - b.depth);
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.translate(x, y);
            if (glowEnabled && selected) {
                const aura = ctx.createRadialGradient(0, 0, radius * 0.12, 0, 0, radius * 1.3);
                aura.addColorStop(0, colorWithAlpha(colors[2] || colors[1] || '#ffffff', 0.18));
                aura.addColorStop(0.45, colorWithAlpha(colors[1] || colors[0], 0.09));
                aura.addColorStop(1, colorWithAlpha(colors[0], 0));
                ctx.fillStyle = aura;
                ctx.beginPath();
                ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            let lastFont = '';
            let lastFill = '';
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                const perspective = 0.72 + p.depth * 0.45;
                const fontSize = Math.max(7, Math.round((8 + (1 - p.t) * 10 + p.depth * 4) * (selected ? 1.08 : 1)));
                const nextFont = `bold ${fontSize}px Courier New`;
                if (nextFont !== lastFont) {
                    ctx.font = nextFont;
                    lastFont = nextFont;
                }
                ctx.globalAlpha = Math.min(1, (0.18 + p.depth * 0.46 + (1 - p.t) * 0.22) * brightness);
                const nextFill = mixGalaxyColor(colors, p.colorT);
                if (nextFill !== lastFill) {
                    ctx.fillStyle = nextFill;
                    lastFill = nextFill;
                }
                ctx.fillText(p.glyph, p.x * perspective, p.y * perspective);
            }

            ctx.globalAlpha = galaxy.available ? (selected ? 0.96 : 0.68) : 0.24;
            ctx.font = `bold ${selected ? 34 : 28}px Courier New`;
            ctx.fillStyle = galaxy.coreColor || colors[2] || '#ffffff';
            ctx.shadowColor = galaxy.coreColor || colors[2] || colors[0];
            ctx.shadowBlur = glowEnabled ? (selected ? 22 : 10) : 0;
            ctx.save();
            ctx.rotate(axis * 0.45);
            ctx.scale(1, 0.82 + tilt * 0.25);
            ctx.fillText('@', 0, 0);
            ctx.font = `bold ${selected ? 16 : 13}px Courier New`;
            ctx.fillStyle = '#071026';
            ctx.shadowBlur = 0;
            ctx.fillText('.', 0, 0);
            ctx.restore();
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
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
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
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
                ctx.globalAlpha = (0.04 + pulse * 0.07) * (1 - Math.abs(t - 0.5) * 0.55);
                ctx.fillStyle = i % 3 === 0 ? '#ffffff' : color;
                ctx.font = `bold ${i % 3 === 0 ? 8 : 6}px Courier New`;
                ctx.fillText(i % 3 === 0 ? '+' : '.', x, y);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
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
            ctx.fillStyle = '#f6fbff';
            ctx.shadowColor = target.color || currentThemeColor;
            ctx.shadowBlur = glowEnabled ? 14 : 0;
            drawPlayerShip(PAUSE_CURSOR_SHIP, 'center');
            ctx.restore();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            emitPauseMenuShipExhaustTrail(cursor, currentFrameNow, speedRatio * 0.75, 0.46, GALAXY_CURSOR_TRAIL_MAX);
        }

        function drawCenteredWrappedText(text, x, y, maxWidth, lineHeight, font, color, maxLines = 2) {
            const words = String(text || '').split(/\s+/).filter(Boolean);
            const lines = [];
            let current = '';
            ctx.save();
            ctx.font = font;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const word of words) {
                const next = current ? `${current} ${word}` : word;
                if (ctx.measureText(next).width <= maxWidth || !current) {
                    current = next;
                } else {
                    lines.push(current);
                    current = word;
                }
                if (lines.length >= maxLines) break;
            }
            if (current && lines.length < maxLines) lines.push(current);
            if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
                while (ctx.measureText(`${lines[maxLines - 1]}...`).width > maxWidth && lines[maxLines - 1].length > 4) {
                    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1).trim();
                }
                lines[maxLines - 1] = `${lines[maxLines - 1]}...`;
            }
            const startY = y - ((lines.length - 1) * lineHeight) / 2;
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], x, startY + i * lineHeight);
            }
            ctx.restore();
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
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 34px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#f2fbff';
            ctx.shadowColor = currentThemeColor;
            ctx.shadowBlur = glowEnabled ? 18 : 0;
            ctx.fillText('GALAXY SELECT', width / 2, height * 0.085);
            ctx.shadowBlur = 0;
            ctx.font = `12px 'Electrolize', sans-serif`;
            ctx.fillStyle = 'rgba(202, 229, 255, 0.72)';
            ctx.fillText('CHOOSE A GALAXY ROUTE', width / 2, height * 0.123);

            for (let i = 0; i < galaxies.length; i++) {
                const galaxy = galaxies[i];
                const slot = getGalaxySelectSlot(i);
                const selected = i === selectedIndex;
                const radius = getGalaxySelectRenderRadius(i, selected);

                const labelY = slot.y + radius + 42;
                ctx.font = `bold ${selected ? 18 : 14}px 'Electrolize', sans-serif`;
                ctx.fillStyle = selected
                    ? (galaxy.available ? '#ffffff' : 'rgba(210,220,235,0.58)')
                    : (galaxy.available ? 'rgba(202,229,255,0.72)' : 'rgba(140,150,165,0.45)');
                ctx.shadowColor = galaxy.colors ? galaxy.colors[0] : currentThemeColor;
                ctx.shadowBlur = glowEnabled && selected ? 12 : 0;
                ctx.fillText(galaxy.title || galaxy.name, slot.x, labelY);
                ctx.shadowBlur = 0;
                ctx.font = `bold 11px 'Electrolize', sans-serif`;
                ctx.fillStyle = galaxy.available ? colorWithAlpha(galaxy.colors[1] || currentThemeColor, selected ? 0.9 : 0.56) : 'rgba(170,178,190,0.46)';
                ctx.fillText(galaxy.available ? 'AVAILABLE' : 'LOCKED', slot.x, labelY + 20);

                if (!galaxy.available) {
                    ctx.save();
                    ctx.globalAlpha = selected ? 0.28 : 0.18;
                    ctx.strokeStyle = '#8a94a8';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.ellipse(slot.x, slot.y, radius * 1.12, radius * 0.58, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
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
                ctx.font = `bold 18px 'Electrolize', sans-serif`;
                ctx.fillStyle = '#ff8fb5';
                ctx.shadowColor = '#ff5e8a';
                ctx.shadowBlur = glowEnabled ? 12 : 0;
                ctx.fillText(galaxySelectNotice, width / 2, promptY);
            } else {
                ctx.font = `12px 'Electrolize', sans-serif`;
                ctx.fillStyle = 'rgba(202, 229, 255, 0.58)';
                ctx.fillText('ENTER / SPACE TO SELECT    ESC FOR MENU', width / 2, promptY);
            }
            ctx.restore();
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

        function drawReturnLoadingScreen(now) {
            const transition = returnLoadingTransition || {};
            const elapsed = ((now || performance.now()) - (transition.startedAt || now || performance.now())) / 1000;
            const progress = Math.max(0, Math.min(1, elapsed / RETURN_LOADING_DURATION));
            const eased = easeGalaxyWarp(progress);
            const color = transition.color || currentThemeColor;
            const centerX = width / 2;
            const centerY = height * 0.47;
            const pulse = 0.5 + Math.sin(now * 0.006) * 0.5;

            ctx.save();
            ctx.fillStyle = colorWithAlpha('#020712', 0.72 + eased * 0.16);
            ctx.fillRect(0, 0, width, height);

            const wash = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, Math.max(width, height) * 0.58);
            wash.addColorStop(0, colorWithAlpha(color, 0.12 + pulse * 0.04));
            wash.addColorStop(0.4, colorWithAlpha('#6aa8ff', 0.05));
            wash.addColorStop(1, colorWithAlpha('#ffffff', 0));
            ctx.fillStyle = wash;
            ctx.fillRect(0, 0, width, height);

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
            const eased = easeGalaxyWarp(progress);
            const focusT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.12) / 0.62)));
            const zoomT = Math.pow(eased, 1.45);
            return {
                focusX: lerpGalaxyWarp(targetX, width / 2, focusT),
                focusY: lerpGalaxyWarp(targetY, height / 2, focusT),
                zoom: 1 + zoomT * 7.6,
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

        function drawGalaxyWarpMap(now, targetX, targetY, camera, selectedIndex, progress) {
            const worldFade = easeGalaxyWarp(Math.max(0, Math.min(1, progress / 0.24)));
            const uiFade = 1 - worldFade;
            ctx.save();
            ctx.translate(camera.focusX, camera.focusY);
            ctx.scale(camera.zoom, camera.zoom);
            ctx.translate(-targetX, -targetY);
            ctx.globalAlpha = worldFade;
            drawGalaxyWarpWorldLayer(now, selectedIndex);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';

            if (uiFade > 0.01) {
                ctx.save();
                ctx.globalAlpha = uiFade;
                drawGalaxySelectBaseLayerDirect(now, selectedIndex);
                ctx.restore();
                ctx.globalAlpha = 1;
            }
        }

        function drawGalaxyWarpStreaks(now, progress, color, centerX, centerY) {
            const eased = easeGalaxyWarp(progress);
            const streakCount = GALAXY_WARP_STREAK_COUNT;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            for (let i = 0; i < streakCount; i++) {
                const noiseA = galaxyNoise(1201 + i, Math.floor(now * 0.0007));
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

        function drawGalaxyWarpShip(progress, transition, color, camera) {
            const targetX = transition.toX || width / 2;
            const targetY = transition.toY || height * 0.35;
            const shipT = Math.min(1, progress / 0.82);
            const easedShip = 1 - Math.pow(1 - shipT, 3);
            const worldX = lerpGalaxyWarp(transition.fromX || targetX, targetX, easedShip);
            const worldY = lerpGalaxyWarp(transition.fromY || targetY, targetY, easedShip);
            const screen = galaxyWarpWorldToScreen(worldX, worldY, camera, targetX, targetY);
            const previousWorldT = Math.max(0, easedShip - 0.018);
            const previousWorldX = lerpGalaxyWarp(transition.fromX || targetX, targetX, previousWorldT);
            const previousWorldY = lerpGalaxyWarp(transition.fromY || targetY, targetY, previousWorldT);
            const previousScreen = galaxyWarpWorldToScreen(previousWorldX, previousWorldY, camera, targetX, targetY);
            const travelRot = Math.atan2(screen.y - previousScreen.y, screen.x - previousScreen.x) + Math.PI / 2;
            const fromRot = Number.isFinite(transition.fromRot) ? transition.fromRot : travelRot;
            const turnT = easeGalaxyWarp(Math.min(1, progress / 0.32));
            const rot = fromRot + normalizePauseCursorAngle(travelRot - fromRot) * turnT;
            const fade = Math.max(0, Math.min(1, (0.92 - progress) / 0.2));
            const startScale = Number.isFinite(transition.fromScale) ? transition.fromScale : 0.24;
            const scale = startScale * (1 + camera.zoomT * 1.15 + easedShip * 0.34) * (0.92 + fade * 0.08);

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            const trailSteps = 10;
            for (let i = 0; i < trailSteps; i++) {
                const t = i / trailSteps;
                const trailWorldX = lerpGalaxyWarp(transition.fromX || targetX, worldX, t);
                const trailWorldY = lerpGalaxyWarp(transition.fromY || targetY, worldY, t);
                const trailPoint = galaxyWarpWorldToScreen(trailWorldX, trailWorldY, camera, targetX, targetY);
                ctx.globalAlpha = fade * (0.03 + t * 0.18);
                ctx.strokeStyle = i % 2 === 0 ? colorWithAlpha(color, 0.5) : colorWithAlpha('#ffffff', 0.34);
                ctx.lineWidth = 1 + t * 2.2;
                ctx.beginPath();
                ctx.moveTo(trailPoint.x, trailPoint.y);
                ctx.lineTo(
                    trailPoint.x - Math.cos(rot - Math.PI / 2) * (18 + t * 42),
                    trailPoint.y - Math.sin(rot - Math.PI / 2) * (18 + t * 42)
                );
                ctx.stroke();
            }
            ctx.restore();

            if (fade <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.translate(screen.x, screen.y);
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
                    const noise = galaxyNoise(7001 + i, Math.floor((now || 0) * 0.0009));
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
            const focalPoint = galaxyWarpWorldToScreen(targetX, targetY, camera, targetX, targetY);

            ctx.save();
            ctx.fillStyle = '#01040b';
            ctx.fillRect(0, 0, width, height);
            drawGalaxyWarpMap(now, targetX, targetY, camera, transition.galaxyIndex || 0, progress);
            ctx.restore();

            drawGalaxyWarpStreaks(now, progress, color, focalPoint.x, focalPoint.y);
            drawGalaxyWarpShip(progress, transition, color, camera);
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
                ['GALAXY', summary.galaxyName || 'NEON RIFT'],
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
            const fieldWrapH = height + CELL_SIZE * 2;
            const fieldOverscanY = bossCameraActive
                ? Math.ceil((1 / Math.max(0.5, bossCameraScale) - 1) * (height - HUD_HEIGHT) * 0.58) + CELL_SIZE * 2
                : CELL_SIZE;
            const fieldMinY = -fieldOverscanY;
            const fieldMaxY = height + fieldOverscanY;
            for (let i = 0; i < numParticles; i++) {
                if (fpY[i] < fieldMinY || fpY[i] > fieldMaxY) continue;
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
            } else if (gameState === 'VICTORY') {
                drawVictoryScreen(renderNow);
            } else if (gameState === 'RUN_SCORE') {
                drawRunScoreScreen(renderNow);
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
            ctx.restore();
        }
