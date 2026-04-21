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
            if (document.getElementById('hud-score-value')) return;
            hud.innerHTML = `
                <div class="hud-left">
                    <div class="hud-score">
                        <span class="hud-score-label">SCORE</span>
                        <span id="hud-score-value" class="hud-score-value">000000</span>
                    </div>
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
                    </div>
                </div>
                <div class="hud-right">
                    <div class="hud-weapon-wrap">
                        <div id="hud-weapon-grid" class="hud-weapon-grid"></div>
                    </div>
                    <div class="hud-status">
                        <span id="hud-level-text">LVL 1</span>
                        <span class="hud-sep">◆</span>
                        <span id="hud-wave-text">WAVE 1</span>
                    </div>
                </div>`;
            hudRefs.scoreValue = document.getElementById('hud-score-value');
            hudRefs.hpBar = document.getElementById('hud-hp-bar');
            hudRefs.xpBar = document.getElementById('hud-xp-bar');
            hudRefs.bombBar = document.getElementById('hud-bomb-bar');
            hudRefs.weaponGrid = document.getElementById('hud-weapon-grid');
            hudRefs.levelText = document.getElementById('hud-level-text');
            hudRefs.waveText = document.getElementById('hud-wave-text');
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
                    cell.textContent = w.glyph;
                    cell.style.color = w.color;
                    cell.style.textShadow = glow;
                    cell.style.background = '';
                } else {
                    cell.textContent = '';
                    cell.style.color = '';
                    cell.style.textShadow = '';
                    cell.style.background = 'rgba(255,255,255,0.1)';
                }
            }
        }

        let hudUpdateTimer = 0;
        let lastHudScoreText = '';
        let lastHudHpSignature = '';
        let lastHudXpSignature = '';
        let lastHudBombSignature = '';
        let lastHudStaticSignature = '';
        const hudRefs = {
            scoreValue: null,
            hpBar: null,
            xpBar: null,
            bombBar: null,
            weaponGrid: null,
            levelText: null,
            waveText: null
        };
        function updateHud() {
            if (window.innerHeight < 700 || window.innerWidth < 525) { hud.style.display = 'none'; return; }
            if (gameState === 'START' || gameState === 'GAMEOVER') { hud.style.opacity = 0; return; }
            
            hud.style.display = 'flex';
            if (gameState === 'LAUNCHING') {
                let t = Math.min(launchTimer / 1.5, 1.0);
                hud.style.opacity = 1 - Math.pow(1 - t, 3);
            } else {
                hud.style.opacity = 1;
            }

            ensureHudStructure();

            const scoreText = score.toString().padStart(6, '0');
            if (scoreText !== lastHudScoreText) {
                const scoreValueNode = hudRefs.scoreValue;
                if (scoreValueNode) scoreValueNode.textContent = scoreText;
                lastHudScoreText = scoreText;
            }

            hudUpdateTimer--;
            if (hudUpdateTimer > 0) return;
            hudUpdateTimer = 6; // Update at ~10Hz
            
            const hpRatio = Math.max(0, Math.min(1, player.hp / player.maxHp));
            let hpColor = '#00ff44';
            if (hpRatio < 0.3) hpColor = '#cc0000';
            else if (hpRatio <= 0.6) hpColor = '#ff8800';
            const hpBlocks = Math.ceil(hpRatio * HUD_BAR_BLOCKS);
            
            const xpRatio = Math.max(0, Math.min(1, player.xp / player.xpNeeded));
            const xpPerc = Math.min(HUD_BAR_BLOCKS, Math.floor(xpRatio * HUD_BAR_BLOCKS));

            const bombCooldownTotal = Math.max(0.001, player.bombCooldown * player.modifiers.bombCooldown);
            const bombRatio = Math.max(0, Math.min(1, 1 - (Math.max(0, player.bombTimer) / bombCooldownTotal)));
            const bombBlocks = Math.ceil(bombRatio * HUD_BAR_BLOCKS);
            const bombReady = bombRatio >= 0.999;
            
            const waveNumber = Math.max(1, WaveManager.currentWave);
            const waveText = boss ? 'BOSS' : waveNumber;
            const weaponSignature = player.weapons.map(w => `${w.name}:${w.color}:${w.glyph}`).join('|');

            const hpSignature = [
                hpBlocks,
                hpColor,
                Math.round(hpRatio * 100),
                glowEnabled ? 1 : 0
            ].join('~');
            if (hpSignature !== lastHudHpSignature) {
                syncMeterBar(hudRefs.hpBar, hpBlocks, HUD_BAR_BLOCKS, hpColor, hpColor, '#31413a', {
                    effectClass: 'is-hp',
                    glowAlpha: hpRatio * 0.8,
                    glowBlur: 8
                });
                lastHudHpSignature = hpSignature;
            }

            const xpSignature = [
                xpPerc,
                Math.round(xpRatio * 100),
                glowEnabled ? 1 : 0
            ].join('~');
            if (xpSignature !== lastHudXpSignature) {
                syncMeterBar(hudRefs.xpBar, xpPerc, HUD_BAR_BLOCKS, '#d2d2d2', '#8f8f8f', '#3a3a42', {
                    effectClass: 'is-xp',
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
                syncMeterBar(hudRefs.bombBar, bombBlocks, HUD_BAR_BLOCKS, '#1e3da8', '#d12ad6', '#39428a', {
                    effectClass: bombReady ? 'is-bomb is-bomb-ready' : 'is-bomb',
                    glowAlpha: bombReady ? 0.88 : bombRatio * 0.8,
                    glowBlur: bombReady ? 9 : 8
                });
                lastHudBombSignature = bombSignature;
            }

            const staticSignature = [
                waveText,
                player.level,
                currentThemeColor,
                glowEnabled ? 1 : 0,
                weaponSignature
            ].join('~');
            if (staticSignature !== lastHudStaticSignature) {
                if (hudRefs.levelText) hudRefs.levelText.textContent = `LVL ${player.level}`;
                if (hudRefs.waveText) hudRefs.waveText.textContent = `WAVE ${waveText}`;
                syncWeaponGrid(currentThemeColor);
                lastHudStaticSignature = staticSignature;
            }
        }
