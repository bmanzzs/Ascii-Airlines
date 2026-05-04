        // HUD DOM construction and incremental HUD updates.
        function mixColor(colorA, colorB, t) {
            const clamped = Math.max(0, Math.min(1, t));
            const a = colorA.replace('#', '');
            const b = colorB.replace('#', '');
            const ar = parseInt(a.slice(0, 2), 16), ag = parseInt(a.slice(2, 4), 16), ab = parseInt(a.slice(4, 6), 16);
            const br = parseInt(b.slice(0, 2), 16), bg = parseInt(b.slice(2, 4), 16), bb = parseInt(b.slice(4, 6), 16);
            const r = Math.round(ar + (br - ar) * clamped);
            const g = Math.round(ag + (bg - ag) * clamped);
            const bl = Math.round(ab + (bb - ab) * clamped);
            return `rgb(${r}, ${g}, ${bl})`;
        }

        function mixHexColor(colorA, colorB, t) {
            const clamped = Math.max(0, Math.min(1, t));
            const a = colorA.replace('#', '');
            const b = colorB.replace('#', '');
            const ar = parseInt(a.slice(0, 2), 16), ag = parseInt(a.slice(2, 4), 16), ab = parseInt(a.slice(4, 6), 16);
            const br = parseInt(b.slice(0, 2), 16), bg = parseInt(b.slice(2, 4), 16), bb = parseInt(b.slice(4, 6), 16);
            const r = Math.round(ar + (br - ar) * clamped).toString(16).padStart(2, '0');
            const g = Math.round(ag + (bg - ag) * clamped).toString(16).padStart(2, '0');
            const bl = Math.round(ab + (bb - ab) * clamped).toString(16).padStart(2, '0');
            return `#${r}${g}${bl}`;
        }

        function colorWithAlpha(color, alpha) {
            const clamped = Math.max(0, Math.min(1, alpha));
            if (color.startsWith('#')) {
                const hex = color.replace('#', '');
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                return `rgba(${r}, ${g}, ${b}, ${clamped})`;
            }
            const rgbMatch = color.match(/rgba?\(([^)]+)\)/i);
            if (rgbMatch) {
                const parts = rgbMatch[1].split(',').map(part => parseFloat(part.trim()));
                const [r = 255, g = 255, b = 255] = parts;
                return `rgba(${r}, ${g}, ${b}, ${clamped})`;
            }
            return color;
        }

        function buildMeterBar(filledBlocks, totalBlocks, fillStart, fillEnd = fillStart, emptyColor = '#1a1a1a', options = {}) {
            const {
                effectClass = '',
                glowAlpha = 0,
                glowBlur = 6
            } = options;
            let html = '';
            const clampedFilled = Math.max(0, Math.min(totalBlocks, filledBlocks));
            const wrapperClasses = ['hud-meter-bar'];
            if (effectClass) wrapperClasses.push(effectClass);
            for (let i = 0; i < totalBlocks; i++) {
                const isFilled = i < clampedFilled;
                const ratio = totalBlocks <= 1 ? 1 : i / (totalBlocks - 1);
                const color = isFilled ? mixColor(fillStart, fillEnd, ratio) : emptyColor;
                const glow = glowEnabled && isFilled && glowAlpha > 0
                    ? `0 0 ${glowBlur}px ${colorWithAlpha(color, glowAlpha)}`
                    : 'none';
                const blockClasses = ['hud-bar-block'];
                if (isFilled) blockClasses.push('hud-bar-block-filled');
                html += `<span class="${blockClasses.join(' ')}" style="color:${color}; text-shadow:${glow}; --bar-idx:${i};">${isFilled ? '█' : '░'}</span>`;
            }
            return `<span class="${wrapperClasses.join(' ')}" style="--fill-alpha:${Math.max(0, Math.min(1, glowAlpha)).toFixed(2)};">${html}</span>`;
        }

        function ensureHudStructure() {
            if (document.querySelector('#hud-wave-panel #hud-score-value') && document.getElementById('hud-combo-value') && document.getElementById('hud-focus-bar')) return;
            hud.innerHTML = `
                <div class="hud-left">
                    <div class="hud-meters">
                        <div class="hud-meter">
                            <span class="hud-meter-label">HP</span>
                            <span id="hud-hp-bar" class="hud-meter-bar"></span>
                        </div>
                        <div class="hud-meter">
                            <span class="hud-meter-label">XP</span>
                            <span id="hud-xp-bar" class="hud-meter-bar"></span>
                        </div>
                        <div class="hud-meter">
                            <span class="hud-meter-label">BOMB</span>
                            <span id="hud-bomb-bar" class="hud-meter-bar"></span>
                        </div>
                        <div class="hud-meter">
                            <span class="hud-meter-label">FOCUS</span>
                            <span id="hud-focus-bar" class="hud-meter-bar"></span>
                        </div>
                    </div>
                </div>
                <div class="hud-right">
                    <div class="hud-weapon-wrap">
                        <div id="hud-weapon-grid" class="hud-weapon-grid"></div>
                    </div>
                    <div class="hud-status">
                        <span id="hud-wave-panel" class="hud-wave-panel is-standard">
                            <span class="hud-level-chip">
                                <span id="hud-level-text" class="hud-level-main">LVL 1</span>
                                <span id="hud-score-value" class="hud-level-score">000000</span>
                            </span>
                            <span id="hud-combo-chip" class="hud-combo-chip">
                                <span class="hud-combo-label">COMBO</span>
                                <span id="hud-combo-value" class="hud-combo-main">000</span>
                            </span>
                            <span id="hud-wave-text" class="hud-wave-main">WAVE 1</span>
                            <span id="hud-wave-mod-text" class="hud-wave-mod">STANDARD ROUTE</span>
                        </span>
                    </div>
                </div>`;
            hudRefs.scoreValue = document.getElementById('hud-score-value');
            hudRefs.hpBar = document.getElementById('hud-hp-bar');
            hudRefs.xpBar = document.getElementById('hud-xp-bar');
            hudRefs.bombBar = document.getElementById('hud-bomb-bar');
            hudRefs.focusBar = document.getElementById('hud-focus-bar');
            hudRefs.weaponGrid = document.getElementById('hud-weapon-grid');
            hudRefs.levelText = document.getElementById('hud-level-text');
            hudRefs.comboChip = document.getElementById('hud-combo-chip');
            hudRefs.comboValue = document.getElementById('hud-combo-value');
            hudRefs.comboMult = document.getElementById('hud-combo-mult');
            hudRefs.wavePanel = document.getElementById('hud-wave-panel');
            hudRefs.waveText = document.getElementById('hud-wave-text');
            hudRefs.waveModText = document.getElementById('hud-wave-mod-text');
        }

        function syncMeterBar(container, filledBlocks, totalBlocks, fillStart, fillEnd = fillStart, emptyColor = '#1a1a1a', options = {}) {
            if (!container) return;
            const {
                effectClass = '',
                glowAlpha = 0,
                glowBlur = 6
            } = options;
            const clampedFilled = Math.max(0, Math.min(totalBlocks, filledBlocks));
            const className = effectClass ? `hud-meter-bar ${effectClass}` : 'hud-meter-bar';
            const fillAlphaText = Math.max(0, Math.min(1, glowAlpha)).toFixed(2);
            if (container.dataset.effectClass !== effectClass) {
                container.className = className;
                container.dataset.effectClass = effectClass;
            }
            if (container.dataset.fillAlpha !== fillAlphaText) {
                container.style.setProperty('--fill-alpha', fillAlphaText);
                container.dataset.fillAlpha = fillAlphaText;
            }

            while (container.children.length < totalBlocks) {
                const block = document.createElement('span');
                block.className = 'hud-bar-block';
                block.textContent = '░';
                container.appendChild(block);
            }
            while (container.children.length > totalBlocks) {
                container.removeChild(container.lastChild);
            }

            for (let i = 0; i < totalBlocks; i++) {
                const block = container.children[i];
                const isFilled = i < clampedFilled;
                const ratio = totalBlocks <= 1 ? 1 : i / (totalBlocks - 1);
                const color = isFilled ? mixColor(fillStart, fillEnd, ratio) : emptyColor;
                const glow = glowEnabled && isFilled && glowAlpha > 0
                    ? `0 0 ${glowBlur}px ${colorWithAlpha(color, glowAlpha)}`
                    : 'none';
                const blockClassName = isFilled ? 'hud-bar-block hud-bar-block-filled' : 'hud-bar-block';
                const blockText = isFilled ? '█' : '░';
                const barIdxText = String(i);
                if (block.dataset.barIdx !== barIdxText) {
                    block.style.setProperty('--bar-idx', barIdxText);
                    block.dataset.barIdx = barIdxText;
                }
                if (block.dataset.filled !== (isFilled ? '1' : '0')) {
                    block.className = blockClassName;
                    block.dataset.filled = isFilled ? '1' : '0';
                }
                if (block.textContent !== blockText) block.textContent = blockText;
                if (block.dataset.color !== color) {
                    block.style.color = color;
                    block.dataset.color = color;
                }
                if (block.dataset.glow !== glow) {
                    block.style.textShadow = glow;
                    block.dataset.glow = glow;
                }
            }
        }

        function buildHudChainLightningIcon(color) {
            const safeColor = /^#[0-9a-f]{6}$/i.test(color) ? color : '#00ffff';
            const glow = glowEnabled ? `text-shadow:0 0 3px ${safeColor},0 0 6px ${safeColor};` : '';
            return `
                <span class="hud-weapon-icon hud-chain-lightning-icon" aria-hidden="true" style="color:${safeColor};${glow}">
                    <span class="hud-chain-bolt" style="left:0px;top:-1px;transform:rotate(-16deg);">/</span>
                    <span class="hud-chain-bolt" style="left:5px;top:2px;transform:rotate(14deg);">\\</span>
                    <span class="hud-chain-bolt" style="left:10px;top:5px;transform:rotate(-18deg);">/</span>
                    <span class="hud-chain-spark" style="left:-2px;top:-4px;">'</span>
                    <span class="hud-chain-spark" style="right:-1px;bottom:-4px;">'</span>
                </span>`;
        }

        function buildHudPatternWeaponIcon(powerup) {
            const pattern = typeof getWeaponIconPattern === 'function' ? getWeaponIconPattern(powerup) : null;
            if (!pattern) return null;
            const safeBaseColor = /^#[0-9a-f]{6}$/i.test(powerup.color) ? powerup.color : '#ffffff';
            const parts = pattern.map(part => {
                const color = /^#[0-9a-f]{6}$/i.test(part.color || '') ? part.color : safeBaseColor;
                const left = 50 + ((part.x || 0) / 28) * 100;
                const top = 50 + ((part.y || 0) / 28) * 100;
                const fontScale = Math.max(0.28, (part.size || 18) / 28);
                const rot = part.rot || 0;
                const glow = glowEnabled ? `text-shadow:0 0 3px ${color},0 0 6px ${color};` : '';
                return `<span class="hud-weapon-glyph-part" style="left:${left.toFixed(2)}%;top:${top.toFixed(2)}%;color:${color};font-size:calc(var(--hud-weapon-cell) * ${fontScale.toFixed(3)});transform:translate(-50%,-50%) rotate(${rot}rad);${glow}">${escapeHudText(part.char)}</span>`;
            }).join('');
            return `<span class="hud-weapon-icon" aria-hidden="true">${parts}</span>`;
        }

        function syncWeaponGrid(themeColor) {
            const grid = hudRefs.weaponGrid;
            if (!grid) return;
            const targetCount = 10;
            grid.style.boxShadow = `inset 0 0 10px ${themeColor}22`;

            while (grid.children.length < targetCount) {
                const cell = document.createElement('div');
                cell.className = 'hud-weapon-cell';
                grid.appendChild(cell);
            }
            while (grid.children.length > targetCount) {
                grid.removeChild(grid.lastChild);
            }

            for (let i = 0; i < targetCount; i++) {
                const cell = grid.children[i];
                if (i < player.weapons.length) {
                    const w = player.weapons[i];
                    const glow = glowEnabled ? `0 0 5px ${w.color}` : 'none';
                    const iconSignature = `${w.name}:${w.color}:${w.glyph}:${w.icon || ''}:${glowEnabled ? 1 : 0}`;
                    if (cell.dataset.iconSignature !== iconSignature) {
                        const patternIcon = buildHudPatternWeaponIcon(w);
                        if (patternIcon) {
                            cell.innerHTML = patternIcon;
                        } else if (w.icon === 'chainLightning') {
                            cell.innerHTML = buildHudChainLightningIcon(w.color);
                        } else {
                            cell.textContent = w.glyph;
                        }
                        cell.dataset.iconSignature = iconSignature;
                    }
                    cell.style.color = w.color;
                    cell.style.textShadow = w.icon === 'chainLightning' ? 'none' : glow;
                    cell.style.background = '';
                } else {
                    cell.innerHTML = '';
                    cell.dataset.iconSignature = '';
                    cell.style.color = '';
                    cell.style.textShadow = '';
                    cell.style.background = 'rgba(255,255,255,0.1)';
                }
            }
        }

        function getHudWaveModifierInfo(waveNumber) {
            if (boss) {
                return {
                    id: 'boss',
                    label: 'BOSS',
                    desc: 'HIGH THREAT',
                    color: boss.color || currentThemeColor,
                    standard: false
                };
            }

            const earlyWaveInfo = typeof WaveManager !== 'undefined' && typeof WaveManager.getEarlyProceduralWaveInfo === 'function'
                ? WaveManager.getEarlyProceduralWaveInfo(waveNumber)
                : null;
            if (earlyWaveInfo) {
                return {
                    id: `early-${earlyWaveInfo.id}`,
                    label: earlyWaveInfo.hudLabel || earlyWaveInfo.name,
                    desc: earlyWaveInfo.hudDesc || '',
                    color: earlyWaveInfo.color || currentThemeColor,
                    standard: false
                };
            }

            const drift = typeof WaveManager !== 'undefined' && typeof WaveManager.getSignalDriftForWave === 'function'
                ? WaveManager.getSignalDriftForWave(waveNumber)
                : null;
            if (!drift) {
                return {
                    id: 'standard',
                    label: 'STANDARD ROUTE',
                    desc: '',
                    color: currentThemeColor,
                    standard: true
                };
            }

            return {
                id: drift.id,
                label: drift.hudLabel || drift.name,
                desc: Object.prototype.hasOwnProperty.call(drift, 'hudDesc') ? drift.hudDesc : drift.desc,
                color: drift.color || currentThemeColor,
                standard: false
            };
        }

        function syncHudWavePanel(waveMainText, waveInfo, isFresh) {
            if (!hudRefs.wavePanel) return;
            const info = waveInfo || {
                id: 'standard',
                label: 'STANDARD ROUTE',
                desc: '',
                color: currentThemeColor,
                standard: true
            };
            const modText = info.desc ? `${info.label}: ${info.desc}` : info.label;
            const className = `hud-wave-panel ${info.standard ? 'is-standard' : 'is-signal'}${isFresh ? ' is-fresh' : ''}`;

            if (hudRefs.wavePanel.dataset.className !== className) {
                hudRefs.wavePanel.className = className;
                hudRefs.wavePanel.dataset.className = className;
            }
            if (hudRefs.wavePanel.dataset.waveColor !== info.color) {
                hudRefs.wavePanel.style.setProperty('--hud-wave-color', info.color);
                hudRefs.wavePanel.dataset.waveColor = info.color;
            }
            if (hudRefs.waveText && hudRefs.waveText.textContent !== waveMainText) {
                hudRefs.waveText.textContent = waveMainText;
            }
            if (hudRefs.waveModText && hudRefs.waveModText.textContent !== modText) {
                hudRefs.waveModText.textContent = modText;
            }
        }

        let hudUpdateTimer = 0;
        let lastHudScoreText = '';
        let lastHudComboSignature = '';
        let lastHudComboEventSerial = -1;
        let lastHudHpSignature = '';
        let lastHudXpSignature = '';
        let lastHudBombSignature = '';
        let lastHudFocusSignature = '';
        let lastHudStaticSignature = '';
        let lastHudStatsSignature = '';
        let lastHudStatValues = null;
        let hudStatDeltaEvents = {};
        const HUD_STAT_DELTA_MS = 1550;
        const hudRefs = {
            scoreValue: null,
            hpBar: null,
            xpBar: null,
            bombBar: null,
            focusBar: null,
            weaponGrid: null,
            levelText: null,
            comboChip: null,
            comboValue: null,
            comboMult: null,
            wavePanel: null,
            waveText: null,
            waveModText: null
        };

        function escapeHudText(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function formatHudStatMult(value) {
            const n = Number.isFinite(value) ? value : 1;
            return `x${n >= 10 ? n.toFixed(1) : n.toFixed(2)}`;
        }

        function formatHudStatPercent(value) {
            const n = Number.isFinite(value) ? value : 0;
            return `${Math.round(n * 100)}%`;
        }

        function isHudStatChanged(value, base = 0, epsilon = 0.001) {
            return Math.abs((value || 0) - base) > epsilon;
        }

        function createHudStatRow(label, value, numericValue = null, deltaType = 'mult', baseValue = 0) {
            return { label, value, numericValue, deltaType, baseValue };
        }

        function formatHudStatDelta(delta, type = 'mult', currentValue = 0, previousValue = 0) {
            const sign = delta >= 0 ? '+' : '-';
            const absDelta = Math.abs(delta);
            if (type === 'count') {
                if (currentValue >= 999 && previousValue < 999) return `${sign}INF`;
                return `${sign}${Math.round(absDelta)}`;
            }
            if (type === 'rad') return `${sign}${absDelta.toFixed(2)}r`;
            if (type === 'percent') return `${sign}${Math.round(absDelta * 100)}%`;
            return `${sign}${absDelta >= 10 ? absDelta.toFixed(1) : absDelta.toFixed(2)}`;
        }

        function getHudStatDeltaClass(delta) {
            return delta >= 0 ? 'is-up' : 'is-down';
        }

        function buildHudPlayerStatRows() {
            if (!player || !player.weaponStats) return [];
            const s = player.weaponStats;
            const m = player.modifiers || {};
            const totalFireRateBonus = m.fireRate || 0;
            const actualFireRate = getClampedPlayerFireInterval((player.fireRate / (s.fireRateMult || 1)) / (1 + totalFireRateBonus));
            const shipDamage = getPlayerShipConfigById(player.shipId).damageMult || 1;
            const modDamage = 1 + (m.damageMult || 0);
            const comboDamage = typeof getComboDamageMultiplier === 'function' ? getComboDamageMultiplier() : 1;
            const godDamage = player.godMode ? GOD_MODE_DAMAGE_MULT : 1;
            const damageMult = ((10 * (s.damageMult || 1) + (m.laserDamage || 0)) * shipDamage * modDamage * comboDamage * godDamage) / 10;
            const fireRateMult = 306 / actualFireRate;

            const rows = [
                createHudStatRow('DMG', formatHudStatMult(damageMult), damageMult, 'mult', 1),
                createHudStatRow('RATE', formatHudStatMult(fireRateMult), fireRateMult, 'mult', 1),
                createHudStatRow('SPEED', formatHudStatMult(s.speedMult || 1), s.speedMult || 1, 'mult', 1),
                createHudStatRow('SIZE', formatHudStatMult(s.sizeMult || 1), s.sizeMult || 1, 'mult', 1)
            ];

            const shipHitbox = typeof getPlayerHitboxScale === 'function' ? getPlayerHitboxScale() : 1;
            if (isHudStatChanged(shipHitbox, 1)) rows.push(createHudStatRow('SHIPBOX', formatHudStatMult(shipHitbox), shipHitbox, 'mult', 1));
            if (isHudStatChanged(s.hitboxMult, 1)) rows.push(createHudStatRow('BUL BOX', formatHudStatMult(s.hitboxMult), s.hitboxMult || 1, 'mult', 1));
            if ((s.pierceCount || 0) > 0) rows.push(createHudStatRow('PIERCE', s.pierceCount >= 999 ? 'INF' : String(s.pierceCount), s.pierceCount || 0, 'count', 0));
            if ((s.pelletCount || 1) > 1) rows.push(createHudStatRow('PELLETS', String(s.pelletCount), s.pelletCount || 1, 'count', 1));
            if ((s.spreadAngle || 0) > 0) rows.push(createHudStatRow('SPREAD', `${s.spreadAngle.toFixed(2)}r`, s.spreadAngle || 0, 'rad', 0));
            if ((s.inaccuracy || 0) > 0) rows.push(createHudStatRow('INACC', `${s.inaccuracy.toFixed(3)}r`, s.inaccuracy || 0, 'rad', 0));
            if ((s.splashRadius || 0) > 0) rows.push(createHudStatRow('SPLASH', formatHudStatMult(s.splashRadius), s.splashRadius || 0, 'mult', 0));
            if ((s.splashDamagePercent || 0) > 0) rows.push(createHudStatRow('SPL %', formatHudStatPercent(s.splashDamagePercent), s.splashDamagePercent || 0, 'percent', 0));
            if (s.mode && s.mode !== 'projectile') rows.push(createHudStatRow('MODE', String(s.mode).toUpperCase()));
            if (s.pathFunction && s.pathFunction !== 'straight') rows.push(createHudStatRow('PATH', String(s.pathFunction).toUpperCase()));

            const flags = [];
            if (s.burstFire) flags.push(`BURST${s.burstCount || 3}`);
            if (s.homing) flags.push('HOMING');
            if ((s.chainCount || 0) > 0) flags.push(`CHAIN${s.chainCount}`);
            if (s.hasRearFire) flags.push('REAR');
            if (s.hasOrbitalDrones) flags.push(`DRONE${player.drones.length}`);
            if (s.returning) flags.push('RETURN');
            if (s.orbitDelay > 0) flags.push('ORBIT');
            if (s.lightningBall) flags.push('SPHERE');
            if (s.plasmaCloud) flags.push('CLOUD');
            if (s.miniTorpedo) flags.push('TORP');
            if ((s.ricochetCount || 0) > 0) flags.push(`RICO${s.ricochetCount}`);
            if ((s.critChance || 0) > 0) flags.push(`CRIT ${Math.round(s.critChance * 100)}%`);
            if (s.prismSplit) flags.push('PRISM');
            if (s.phaseNeedle) flags.push('PHASE');
            if (flags.length) rows.push(createHudStatRow('FLAGS', flags.join(' / ')));

            const other = [];
            if ((s.cloudDotMult || 0) > 0) other.push(`DOT ${s.cloudDotMult.toFixed(1)}x`);
            if ((s.cloudCurveStrength || 0) > 0) other.push(`CURVE ${Math.round(s.cloudCurveStrength)}`);
            if ((s.torpedoExplosionRadius || 0) > 0) other.push(`AOE ${Math.round(s.torpedoExplosionRadius)}`);
            if ((s.torpedoExplosionDamageMult || 0) > 0) other.push(`BOOM ${formatHudStatMult(s.torpedoExplosionDamageMult)}`);
            if ((s.ricochetDamageMult || 1) < 0.999) other.push(`RICO ${formatHudStatPercent(s.ricochetDamageMult)}`);
            if ((s.critDamageMult || 1) > 1) other.push(`CRIT ${formatHudStatMult(s.critDamageMult)}`);
            if ((m.momentumFireRate || 0) > 0) other.push(`KIN ${formatHudStatPercent(m.momentumFireRate)}`);
            if ((m.adrenaline || 0) > 0) other.push(`ADRN ${formatHudStatPercent(m.adrenaline)}`);
            if (other.length) rows.push(createHudStatRow('OTHER', other.join(' / ')));

            const focusStats = [];
            if ((m.focusMax || 0) > 0) focusStats.push(`MAX ${formatHudStatPercent(m.focusMax)}`);
            if ((m.focusRegen || 0) > 0) focusStats.push(`REG ${formatHudStatPercent(m.focusRegen)}`);
            if ((m.focusDrop || 0) > 0) focusStats.push(`DROP ${formatHudStatPercent(m.focusDrop)}`);
            if ((m.focusRegenDelay || 1) < 0.999) focusStats.push(`WAIT -${Math.round((1 - m.focusRegenDelay) * 100)}%`);
            if ((m.focusLockout || 1) < 0.999) focusStats.push(`LOCK -${Math.round((1 - m.focusLockout) * 100)}%`);
            if (focusStats.length) rows.push(createHudStatRow('FOCUS', focusStats.join(' / ')));

            const abilityStats = [];
            if ((m.focusDriveDrain || 1) < 0.999) abilityStats.push(`DRN -${Math.round((1 - m.focusDriveDrain) * 100)}%`);
            if ((m.focusDriveSlow || 0) > 0) abilityStats.push(`SLOW +${Math.round(m.focusDriveSlow * 100)}%`);
            if ((m.focusDriveTransition || 0) > 0) abilityStats.push(`TRAIL ${formatHudStatPercent(m.focusDriveTransition)}`);
            if ((m.focusSpecterDrain || 1) < 0.999) abilityStats.push(`SPEC -${Math.round((1 - m.focusSpecterDrain) * 100)}%`);
            if ((m.focusSpecterShrink || 0) > 0) abilityStats.push(`SHRK ${formatHudStatPercent(m.focusSpecterShrink)}`);
            if ((m.focusSpecterTransition || 0) > 0) abilityStats.push(`VEIL ${formatHudStatPercent(m.focusSpecterTransition)}`);
            if (abilityStats.length) rows.push(createHudStatRow('ABILITY', abilityStats.join(' / ')));

            return rows;
        }

        function updateHudStatDeltaEvents(rows, now) {
            const currentValues = {};
            if (!lastHudStatValues) {
                lastHudStatValues = {};
                for (const row of rows) {
                    if (Number.isFinite(row.numericValue)) lastHudStatValues[row.label] = row.numericValue;
                }
                return '';
            }

            for (const row of rows) {
                if (!Number.isFinite(row.numericValue)) continue;
                const previousValue = Object.prototype.hasOwnProperty.call(lastHudStatValues, row.label)
                    ? lastHudStatValues[row.label]
                    : row.baseValue;
                const delta = row.numericValue - previousValue;
                if (Math.abs(delta) > 0.001) {
                    hudStatDeltaEvents[row.label] = {
                        text: formatHudStatDelta(delta, row.deltaType, row.numericValue, previousValue),
                        className: getHudStatDeltaClass(delta),
                        expiresAt: now + HUD_STAT_DELTA_MS
                    };
                }
                currentValues[row.label] = row.numericValue;
            }

            lastHudStatValues = currentValues;
            const activeKeys = [];
            for (const [label, event] of Object.entries(hudStatDeltaEvents)) {
                if (!event || event.expiresAt <= now) {
                    delete hudStatDeltaEvents[label];
                } else {
                    activeKeys.push(`${label}:${event.text}:${event.className}`);
                }
            }
            return activeKeys.join('|');
        }

        function syncStatsPanel(forceHide = false) {
            if (!statsPanel) return;
            const hiddenForState = forceHide || gameState === 'START' || gameState === 'SHIP_SELECT' || gameState === 'GALAXY_SELECT' || gameState === 'RETURN_LOADING' || gameState === 'GALAXY_WARP' || gameState === 'VICTORY' || gameState === 'RUN_SCORE' || gameState === 'GAMEOVER' || (gameState === 'PAUSED' && pauseReturnState === 'GALAXY_SELECT') || window.innerHeight < 700 || window.innerWidth < 525;
            const visible = showStatsPanel && !hiddenForState;
            statsPanel.style.display = visible ? 'block' : 'none';
            if (!visible) {
                lastHudStatsSignature = '';
                lastHudStatValues = null;
                hudStatDeltaEvents = {};
                return;
            }

            const rows = buildHudPlayerStatRows();
            const now = currentFrameNow || performance.now();
            const deltaSignature = updateHudStatDeltaEvents(rows, now);
            const signature = rows.map(row => `${row.label}:${row.value}`).join('|') + `~${deltaSignature}~${currentThemeColor}~${glowEnabled ? 1 : 0}`;
            if (signature === lastHudStatsSignature) return;
            statsPanel.innerHTML = `
                <div class="stats-panel-title">SHIP STATS</div>
                ${rows.map(row => {
                    const event = hudStatDeltaEvents[row.label];
                    const wrapClass = row.label === 'OTHER' || row.label === 'FLAGS' ? ' is-wrap' : '';
                    return `
                    <div class="stats-row${wrapClass}">
                        <span class="stats-label">${escapeHudText(row.label)}</span>
                        <span class="stats-value">
                            <span class="stats-main">${escapeHudText(row.value)}</span>
                            ${event ? `<span class="stats-delta ${event.className}">${escapeHudText(event.text)}</span>` : ''}
                        </span>
                    </div>`;
                }).join('')}`;
            lastHudStatsSignature = signature;
        }

        function updateHud() {
            if (window.innerHeight < 700 || window.innerWidth < 525) {
                hud.style.display = 'none';
                hud.style.opacity = 0;
                hud.style.transform = 'translateY(calc(100% + 6px))';
                syncStatsPanel(true);
                return;
            }
            if (gameState === 'START' || gameState === 'SHIP_SELECT' || gameState === 'GALAXY_SELECT' || gameState === 'RETURN_LOADING' || gameState === 'GALAXY_WARP' || gameState === 'VICTORY' || gameState === 'RUN_SCORE' || gameState === 'GAMEOVER' || (gameState === 'PAUSED' && pauseReturnState === 'GALAXY_SELECT')) {
                hud.style.display = 'none';
                hud.style.opacity = 0;
                hud.style.transform = 'translateY(calc(100% + 6px))';
                syncStatsPanel(true);
                return;
            }
            
            hud.style.display = 'flex';
            if (gameState === 'LAUNCHING') {
                let t = Math.min(launchTimer / 1.5, 1.0);
                const eased = 1 - Math.pow(1 - t, 3);
                hud.style.opacity = eased;
                hud.style.transform = `translateY(${Math.round((1 - eased) * (HUD_HEIGHT + 8))}px)`;
            } else {
                hud.style.opacity = 1;
                hud.style.transform = 'translateY(0)';
            }

            ensureHudStructure();

            const scoreText = score.toString().padStart(6, '0');
            if (scoreText !== lastHudScoreText) {
                const scoreValueNode = hudRefs.scoreValue;
                if (scoreValueNode) scoreValueNode.textContent = scoreText;
                lastHudScoreText = scoreText;
            }

            const comboText = comboCount >= 1000 ? comboCount.toString() : comboCount.toString().padStart(3, '0');
            const comboEventAge = (currentFrameNow || performance.now()) - comboEventAt;
            const showComboEvent = comboEventType === 'boss'
                ? comboEventAge < 2200
                : (comboEventType === 'break' && comboEventAge < 900);
            const comboSignature = [
                comboText,
                comboEventType,
                showComboEvent ? 1 : 0,
                currentThemeColor,
                glowEnabled ? 1 : 0
            ].join('~');
            if (comboSignature !== lastHudComboSignature) {
                if (hudRefs.comboValue) hudRefs.comboValue.textContent = comboText;
                if (hudRefs.comboChip) {
                    hudRefs.comboChip.style.setProperty('--hud-combo-color', comboEventType === 'break' && showComboEvent ? '#ff5e8a' : currentThemeColor);
                    hudRefs.comboChip.classList.toggle('is-empty', comboCount <= 0);
                    hudRefs.comboChip.classList.toggle('is-event-text', false);
                }
                lastHudComboSignature = comboSignature;
            }
            if (hudRefs.comboChip && comboEventSerial !== lastHudComboEventSerial) {
                hudRefs.comboChip.classList.remove('is-combo-pop', 'is-combo-break', 'is-boss-break');
                void hudRefs.comboChip.offsetWidth;
                if (comboEventType === 'boss') hudRefs.comboChip.classList.add('is-boss-break');
                else if (comboEventType === 'break') hudRefs.comboChip.classList.add('is-combo-break');
                else if (comboEventType === 'kill' || comboEventType === 'focus') hudRefs.comboChip.classList.add('is-combo-pop');
                lastHudComboEventSerial = comboEventSerial;
            }

            hudUpdateTimer--;
            syncStatsPanel();
            if (hudUpdateTimer > 0) return;
            hudUpdateTimer = 6; // Update at ~10Hz
            
            const hpRatio = Math.max(0, Math.min(1, player.hp / player.maxHp));
            let hpColor = '#00ff44';
            if (hpRatio < 0.3) hpColor = '#cc0000';
            else if (hpRatio <= 0.6) hpColor = '#ff8800';
            const hpBlocks = Math.ceil(hpRatio * HUD_BAR_BLOCKS);
            const hpFull = hpRatio >= 0.999;
            
            const xpRatio = Math.max(0, Math.min(1, player.xp / player.xpNeeded));
            const xpPerc = Math.min(HUD_BAR_BLOCKS, Math.floor(xpRatio * HUD_BAR_BLOCKS));
            const xpFull = xpRatio >= 0.999;

            const bombCooldownTotal = Math.max(0.001, getPlayerBombCooldownTotal());
            const bombRatio = Math.max(0, Math.min(1, 1 - (Math.max(0, player.bombTimer) / bombCooldownTotal)));
            const bombBlocks = Math.ceil(bombRatio * HUD_BAR_BLOCKS);
            const bombReady = bombRatio >= 0.999;

            const focusMax = typeof getFocusMeterMax === 'function' ? getFocusMeterMax() : FOCUS_METER_MAX;
            const focusRatio = typeof focusMeter === 'number'
                ? Math.max(0, Math.min(1, focusMeter / focusMax))
                : 1;
            const focusBlocks = Math.ceil(focusRatio * HUD_BAR_BLOCKS);
            const driveVisual = typeof getFocusDriveRenderIntensity === 'function' ? getFocusDriveRenderIntensity() : 0;
            const specterVisual = typeof getSpecterRenderIntensity === 'function' ? getSpecterRenderIntensity() : 0;
            const focusActive = driveVisual > 0.08 || specterVisual > 0.08;
            const focusLocked = typeof focusLockoutTimer === 'number' && focusLockoutTimer > 0;
            
            const waveNumber = Math.max(1, WaveManager.currentWave);
            const waveText = boss ? 'BOSS' : waveNumber;
            const waveMainText = boss ? 'BOSS' : `WAVE ${waveNumber}`;
            const waveInfo = getHudWaveModifierInfo(waveNumber);
            const noticeFresh = !!(
                waveSignalNotice &&
                waveSignalNotice.waveNumber === waveNumber &&
                typeof currentFrameNow === 'number' &&
                currentFrameNow - waveSignalNotice.startTime < waveSignalNotice.duration
            );
            const weaponSignature = player.weapons.map(w => `${w.name}:${w.color}:${w.glyph}:${w.icon || ''}`).join('|');

            const hpSignature = [
                hpBlocks,
                hpColor,
                Math.round(hpRatio * 100),
                hpFull ? 1 : 0,
                glowEnabled ? 1 : 0
            ].join('~');
            if (hpSignature !== lastHudHpSignature) {
                syncMeterBar(hudRefs.hpBar, hpBlocks, HUD_BAR_BLOCKS, hpColor, hpColor, '#31413a', {
                    effectClass: hpFull ? 'is-hp is-full' : 'is-hp',
                    glowAlpha: hpRatio * 0.8,
                    glowBlur: 8
                });
                lastHudHpSignature = hpSignature;
            }

            const xpSignature = [
                xpPerc,
                Math.round(xpRatio * 100),
                xpFull ? 1 : 0,
                glowEnabled ? 1 : 0
            ].join('~');
            if (xpSignature !== lastHudXpSignature) {
                syncMeterBar(hudRefs.xpBar, xpPerc, HUD_BAR_BLOCKS, '#d2d2d2', '#8f8f8f', '#565868', {
                    effectClass: xpFull ? 'is-xp is-full' : 'is-xp',
                    glowAlpha: xpRatio * 0.8,
                    glowBlur: 8
                });
                lastHudXpSignature = xpSignature;
            }

            const bombSignature = [
                bombBlocks,
                Math.round(bombRatio * 100),
                bombReady ? 1 : 0,
                glowEnabled ? 1 : 0
            ].join('~');
            if (bombSignature !== lastHudBombSignature) {
                const bombTone = Math.pow(bombRatio, 0.72);
                const bombStart = mixHexColor('#32213f', '#f08d92', bombTone);
                const bombEnd = mixHexColor('#4c2b55', '#ffaaa2', bombTone);
                syncMeterBar(hudRefs.bombBar, bombBlocks, HUD_BAR_BLOCKS, bombStart, bombEnd, '#211827', {
                    effectClass: bombReady ? 'is-bomb is-bomb-ready is-full' : 'is-bomb',
                    glowAlpha: bombReady ? 0.88 : bombRatio * 0.8,
                    glowBlur: bombReady ? 9 : 8
                });
                lastHudBombSignature = bombSignature;
            }

            const focusSignature = [
                focusBlocks,
                Math.round(focusRatio * 100),
                focusActive ? 1 : 0,
                focusLocked ? 1 : 0,
                focusMode,
                glowEnabled ? 1 : 0
            ].join('~');
            if (focusSignature !== lastHudFocusSignature) {
                const focusStart = focusLocked ? '#5e5a46' : '#ffe680';
                const focusEnd = focusLocked ? '#302d24' : '#ffc94a';
                syncMeterBar(hudRefs.focusBar, focusBlocks, HUD_BAR_BLOCKS, focusStart, focusEnd, '#2b2618', {
                    effectClass: `is-focus${focusActive ? ' is-focus-active' : ''}${focusLocked ? ' is-focus-locked' : ''}${focusRatio >= 0.999 ? ' is-full' : ''}`,
                    glowAlpha: focusLocked ? 0.18 : (focusActive ? 0.88 : focusRatio * 0.56),
                    glowBlur: focusActive ? 10 : 7
                });
                lastHudFocusSignature = focusSignature;
            }

            const staticSignature = [
                waveText,
                waveInfo.id,
                waveInfo.label,
                waveInfo.desc,
                waveInfo.color,
                noticeFresh ? 1 : 0,
                player.level,
                currentThemeColor,
                glowEnabled ? 1 : 0,
                weaponSignature
            ].join('~');
            if (staticSignature !== lastHudStaticSignature) {
                if (hudRefs.levelText) hudRefs.levelText.textContent = `LVL ${player.level}`;
                syncHudWavePanel(waveMainText, waveInfo, noticeFresh);
                syncWeaponGrid(currentThemeColor);
                lastHudStaticSignature = staticSignature;
            }
            syncStatsPanel();
        }
