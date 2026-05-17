        // Terminal / fleet hub ownership: ship-select screen, dock runtime, and dock transition rendering.

        const TERMINAL_DOCK_ENTER_DURATION = 1.42;
        const TERMINAL_DOCK_EXIT_DURATION = 1.28;
        let terminalDockTransition = {
            active: false,
            phase: 'enter',
            startedAt: 0,
            galaxyIndex: 0,
            shipIndex: 0,
            fromX: 0,
            fromY: 0,
            fromRot: 0,
            fromScale: 0.24,
            color: '#8ff7ff'
        };
        let terminalDockExitHold = {
            active: false,
            galaxyIndex: -1,
            shipIndex: 0,
            startedAt: 0
        };

        function clearTerminalDockExitHold() {
            terminalDockExitHold.active = false;
            terminalDockExitHold.galaxyIndex = -1;
            terminalDockExitHold.shipIndex = 0;
            terminalDockExitHold.startedAt = 0;
        }

        function markTerminalDockExitHold(galaxyIndex = selectedGalaxyIndex, shipIndex = selectedShipIndex) {
            terminalDockExitHold.active = true;
            terminalDockExitHold.galaxyIndex = galaxyIndex;
            terminalDockExitHold.shipIndex = shipIndex;
            terminalDockExitHold.startedAt = currentFrameNow || performance.now();
        }

        function isTerminalDockExitHoldActive(galaxyIndex = selectedGalaxyIndex) {
            if (terminalDockExitHold.active && selectedGalaxyIndex !== terminalDockExitHold.galaxyIndex) {
                clearTerminalDockExitHold();
                return false;
            }
            return terminalDockExitHold.active
                && gameState === 'GALAXY_SELECT'
                && terminalDockExitHold.galaxyIndex === galaxyIndex;
        }

        function handleGalaxySelectIndexChanged(previousIndex, nextIndex) {
            if (!terminalDockExitHold.active) return;
            if (nextIndex !== terminalDockExitHold.galaxyIndex) clearTerminalDockExitHold();
        }

        function getTerminalDockExitCursorPose(galaxyIndex = selectedGalaxyIndex) {
            if (typeof getGalaxySelectSlot !== 'function' || typeof getGalaxySelectRenderRadius !== 'function') return null;
            const slot = getGalaxySelectSlot(galaxyIndex);
            const radius = getGalaxySelectRenderRadius(galaxyIndex, true);
            const x = Math.min(width - 54, slot.x + radius * 1.98);
            const y = Math.max(100, slot.y - radius * 0.44);
            return {
                x,
                y,
                faceX: Math.min(width + radius * 0.8, x + radius * 0.86),
                faceY: Math.max(80, y - radius * 0.12),
                scale: 0.25,
                radius
            };
        }

        function beginTerminalDockTransition(phase = 'enter', shipIndex = selectedShipIndex) {
            const now = currentFrameNow || performance.now();
            const galaxyIndex = selectedGalaxyIndex;
            const galaxy = getGalaxyDefinition(galaxyIndex);
            const slot = typeof getGalaxySelectSlot === 'function'
                ? getGalaxySelectSlot(galaxyIndex)
                : { x: width * 0.14, y: height * 0.57 };
            const fromX = pauseMenuShipCursor && pauseMenuShipCursor.initialized
                ? (Number.isFinite(pauseMenuShipCursor.renderX) ? pauseMenuShipCursor.renderX : pauseMenuShipCursor.x)
                : slot.x - 92;
            const fromY = pauseMenuShipCursor && pauseMenuShipCursor.initialized
                ? (Number.isFinite(pauseMenuShipCursor.renderY) ? pauseMenuShipCursor.renderY : pauseMenuShipCursor.y)
                : slot.y;
            const fromRot = pauseMenuShipCursor && pauseMenuShipCursor.initialized && Number.isFinite(pauseMenuShipCursor.renderRot)
                ? pauseMenuShipCursor.renderRot
                : Math.PI / 2;
            const fromScale = pauseMenuShipCursor && pauseMenuShipCursor.initialized && Number.isFinite(pauseMenuShipCursor.renderScale)
                ? pauseMenuShipCursor.renderScale
                : (pauseMenuShipCursor.scale || 0.24);
            if (phase === 'enter') clearTerminalDockExitHold();
            terminalDockTransition = {
                active: true,
                phase,
                startedAt: now,
                galaxyIndex,
                shipIndex,
                fromX,
                fromY,
                fromRot,
                fromScale,
                color: (galaxy && galaxy.colors && galaxy.colors[0]) || '#8ff7ff'
            };
            clearGameplayKeys();
            gameState = 'TERMINAL_DOCK';
            titleAlpha = 1;
        }

        function completeTerminalDockTransition() {
            if (!terminalDockTransition.active) return;
            const phase = terminalDockTransition.phase;
            terminalDockTransition.active = false;
            clearGameplayKeys();
            if (phase === 'exit') {
                markTerminalDockExitHold(selectedGalaxyIndex, terminalDockTransition.shipIndex);
                const exitPose = getTerminalDockExitCursorPose(selectedGalaxyIndex);
                if (exitPose) {
                    pauseMenuShipCursor.x = exitPose.x;
                    pauseMenuShipCursor.y = exitPose.y;
                    pauseMenuShipCursor.vx = 0;
                    pauseMenuShipCursor.vy = 0;
                    pauseMenuShipCursor.rot = Math.atan2(exitPose.faceY - exitPose.y, exitPose.faceX - exitPose.x) + Math.PI / 2;
                    pauseMenuShipCursor.scale = 0.25;
                    pauseMenuShipCursor.speed = Math.hypot(pauseMenuShipCursor.vx, pauseMenuShipCursor.vy);
                    pauseMenuShipCursor.trail = [];
                    pauseMenuShipCursor.trailEmitAcc = 0;
                    pauseMenuShipCursor.settleBlend = 0;
                    pauseMenuShipCursor.initialized = true;
                    pauseMenuShipCursor.lastNow = currentFrameNow || performance.now();
                    pauseMenuShipCursor.targetKey = `terminal-outbound-${selectedGalaxyIndex}`;
                    pauseMenuShipCursor.routeKey = `terminal-outbound-${selectedGalaxyIndex}`;
                    pauseMenuShipCursor.approachComplete = true;
                    pauseMenuShipCursor.renderX = pauseMenuShipCursor.x;
                    pauseMenuShipCursor.renderY = pauseMenuShipCursor.y;
                    pauseMenuShipCursor.renderRot = pauseMenuShipCursor.rot;
                    pauseMenuShipCursor.renderScale = pauseMenuShipCursor.scale;
                } else {
                    clearTerminalDockExitHold();
                    resetPauseMenuShipCursor();
                }
                gameState = 'GALAXY_SELECT';
                titleAlpha = 1;
                return;
            }
            shipSelectReturnState = 'GALAXY_SELECT';
            shipSelectIndex = selectedShipIndex;
            resetPauseMenuShipCursor();
            gameState = 'SHIP_SELECT';
            titleAlpha = 1;
        }

        function shipSelectNoise(seed, index) {
            const value = Math.sin((index + 1) * seed) * 43758.5453123;
            return value - Math.floor(value);
        }

        const SHIP_SELECT_HANGAR_MOTES = Array.from({ length: 112 }, (_, i) => ({
            x: shipSelectNoise(13.79, i),
            y: shipSelectNoise(41.23, i),
            size: 1 + Math.floor(shipSelectNoise(89.17, i) * 3),
            alpha: 0.12 + shipSelectNoise(53.61, i) * 0.28,
            speed: 0.000018 + shipSelectNoise(71.42, i) * 0.000045,
            phase: shipSelectNoise(29.31, i) * Math.PI * 2,
            glyph: i % 5 === 0 ? '01' : (i % 5 === 1 ? 'AI' : (i % 5 === 2 ? 'SYS' : (i % 5 === 3 ? 'RX' : '.')))
        }));

        function getWrappedShipSelectOffset(index, selectedIndex, count) {
            let offset = index - selectedIndex;
            if (offset > count / 2) offset -= count;
            if (offset < -count / 2) offset += count;
            return offset;
        }

        function drawShipSelectHangarBackground(now, selectedShip, alpha) {
            const accent = selectedShip.previewColor || '#9ff7ff';
            const t = now * 0.001;
            const horizonY = height * 0.52;
            const floorY = height * 0.93;
            const scanX = ((now * 0.030) % (width + 360)) - 180;
            const wallPulse = 0.5 + Math.sin(t * 1.6) * 0.5;

            ctx.save();
            ctx.globalAlpha = alpha;
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#020817');
            bg.addColorStop(0.44, '#071226');
            bg.addColorStop(0.64, '#04101d');
            bg.addColorStop(1, '#010610');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            const wallGlow = ctx.createRadialGradient(width * 0.5, height * 0.38, 0, width * 0.5, height * 0.38, Math.max(width, height) * 0.7);
            wallGlow.addColorStop(0, colorWithAlpha(accent, 0.10 + wallPulse * 0.035));
            wallGlow.addColorStop(0.38, 'rgba(80, 150, 210, 0.055)');
            wallGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = wallGlow;
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.max(34, width * 0.052)}px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#dcecff', 0.030 + wallPulse * 0.012);
            ctx.fillText('VECTOR BAY 07', width / 2, height * 0.255);
            ctx.font = `bold ${Math.max(11, width * 0.012)}px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha(accent, 0.17 + wallPulse * 0.05);
            ctx.fillText('ORBITAL DRYDOCK // LOADOUT FRAME READY', width / 2, height * 0.305);
            ctx.restore();

            ctx.save();
            ctx.font = `bold 9px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < SHIP_SELECT_HANGAR_MOTES.length; i++) {
                const mote = SHIP_SELECT_HANGAR_MOTES[i];
                const driftX = (mote.x * width + now * mote.speed * width) % width;
                const y = mote.y * height;
                const flicker = 0.55 + Math.sin(t * 1.4 + mote.phase) * 0.45;
                ctx.globalAlpha = alpha * mote.alpha * (0.58 + flicker * 0.42);
                ctx.fillStyle = i % 7 === 0 ? '#ffe8b8' : (i % 3 === 0 ? accent : '#6aa8ff');
                if (mote.size > 2) {
                    ctx.fillText(mote.glyph, driftX, y);
                } else {
                    ctx.fillRect(driftX | 0, y | 0, mote.size, mote.size);
                }
            }
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha * 0.42;
            ctx.strokeStyle = colorWithAlpha(accent, 0.34);
            ctx.lineWidth = 1;
            const gantryY = height * 0.39;
            ctx.beginPath();
            ctx.moveTo(width * 0.12, gantryY);
            ctx.lineTo(width * 0.88, gantryY);
            ctx.moveTo(width * 0.18, gantryY - 24);
            ctx.lineTo(width * 0.82, gantryY - 24);
            ctx.stroke();
            for (let i = 0; i < 9; i++) {
                const gx = width * (0.18 + i * 0.08);
                const bob = Math.sin(t * 1.2 + i) * 2;
                ctx.strokeStyle = colorWithAlpha(i % 2 ? '#dcecff' : accent, 0.20);
                ctx.strokeRect(gx - 8, gantryY - 36 + bob, 16, 20);
                ctx.fillStyle = colorWithAlpha(i % 2 ? accent : '#ffffff', 0.20 + wallPulse * 0.06);
                ctx.fillRect(gx - 2, gantryY - 15 + bob, 4, 8);
            }
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha;
            const scan = ctx.createLinearGradient(scanX - 90, 0, scanX + 90, 0);
            scan.addColorStop(0, 'rgba(255,255,255,0)');
            scan.addColorStop(0.48, colorWithAlpha(accent, 0.055));
            scan.addColorStop(0.5, 'rgba(255,255,255,0.060)');
            scan.addColorStop(0.52, colorWithAlpha(accent, 0.055));
            scan.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = scan;
            ctx.fillRect(scanX - 90, 0, 180, height);
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha * 0.72;
            ctx.lineWidth = 1;
            for (let i = -6; i <= 6; i++) {
                const x = width / 2 + i * width * 0.075;
                const edgeX = width / 2 + i * width * 0.18;
                ctx.strokeStyle = colorWithAlpha(i === 0 ? '#ffffff' : accent, i === 0 ? 0.16 : 0.13);
                ctx.beginPath();
                ctx.moveTo(x, horizonY);
                ctx.lineTo(edgeX, floorY);
                ctx.stroke();
            }
            for (let i = 0; i < 9; i++) {
                const depth = ((i + (now * 0.00035)) % 9) / 9;
                const eased = depth * depth;
                const y = horizonY + eased * (floorY - horizonY);
                const halfW = width * (0.10 + eased * 0.50);
                const railAlpha = 0.06 + eased * 0.18;
                ctx.strokeStyle = colorWithAlpha(i % 3 === 0 ? '#ffffff' : accent, railAlpha);
                ctx.beginPath();
                ctx.moveTo(width / 2 - halfW, y);
                ctx.lineTo(width / 2 + halfW, y);
                ctx.stroke();
            }
            ctx.strokeStyle = colorWithAlpha(accent, 0.28);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(width * 0.20, floorY);
            ctx.lineTo(width * 0.39, horizonY + 10);
            ctx.moveTo(width * 0.80, floorY);
            ctx.lineTo(width * 0.61, horizonY + 10);
            ctx.stroke();
            ctx.restore();

            ctx.restore();
        }

        function drawShipSelectStat(label, valueText, ratio, x, y, color, options = {}) {
            const barW = options.barW || 190;
            const barH = options.barH || 9;
            const labelW = options.labelW || 74;
            const valueX = options.valueX || (x + labelW + barW + 58);
            const fillW = Math.max(5, Math.min(barW, barW * ratio));
            ctx.fillStyle = colorWithAlpha('#dcecff', 0.74);
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, y);
            ctx.fillStyle = 'rgba(255,255,255,0.115)';
            ctx.fillRect((x + labelW) | 0, (y - barH / 2) | 0, barW, barH);
            ctx.fillStyle = colorWithAlpha('#000000', 0.24);
            ctx.fillRect((x + labelW + fillW) | 0, (y - barH / 2) | 0, Math.max(0, barW - fillW), barH);
            const gradient = ctx.createLinearGradient(x + labelW, 0, x + labelW + barW, 0);
            gradient.addColorStop(0, colorWithAlpha(color, 0.86));
            gradient.addColorStop(0.72, mixColor(color, '#ffffff', 0.50));
            gradient.addColorStop(1, '#ffffff');
            ctx.fillStyle = gradient;
            ctx.fillRect((x + labelW) | 0, (y - barH / 2) | 0, fillW, barH);
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.16);
            ctx.fillRect((x + labelW) | 0, (y - barH / 2) | 0, fillW, 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(valueText, valueX, y);
        }

        function drawShipSelectHullStat(shipConfig, x, y, w, color) {
            const h = 32;
            ctx.fillStyle = colorWithAlpha(color, 0.070);
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = colorWithAlpha(color, 0.28);
            ctx.strokeRect(x + 0.5, y + 0.5, w, h);
            ctx.fillStyle = colorWithAlpha('#dcecff', 0.72);
            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('HULL INTEGRITY', x + 14, y + h / 2);
            ctx.textAlign = 'right';
            ctx.font = `bold 18px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = color;
            ctx.shadowBlur = glowEnabled ? 8 : 0;
            ctx.fillText(`${shipConfig.maxHp} HP`, x + w - 14, y + h / 2 + 1);
            ctx.shadowBlur = 0;
        }

        function drawShipSelectPreview(shipConfig, slotX, slotY, selected, now, slotIndex, offset = 0) {
            const previewShip = {
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                shipId: shipConfig.id,
                _renderLayoutCache: null
            };
            const distance = Math.abs(offset);
            const bob = Math.sin(now * 0.002 + slotIndex * 1.7) * (selected ? 8 : Math.max(2, 5 - distance));
            const rotation = selected
                ? Math.sin(now * 0.0017) * 0.18
                : offset * 0.065 + Math.sin(now * 0.001 + slotIndex) * 0.018;
            const scale = selected ? 1.03 : Math.max(0.48, 0.78 - distance * 0.09);
            const glow = selected ? 28 : 9;
            const sideAlpha = Math.max(0.18, 0.58 - distance * 0.10);

            ctx.save();
            ctx.translate(slotX, slotY + bob);
            ctx.rotate(rotation);
            ctx.scale(scale, scale);
            ctx.globalAlpha = selected ? 1 : sideAlpha;
            ctx.fillStyle = selected ? shipConfig.previewColor : mixColor(shipConfig.previewColor, '#6e8290', 0.70);
            ctx.shadowColor = selected ? shipConfig.previewColor : colorWithAlpha(shipConfig.previewColor, 0.62);
            ctx.shadowBlur = glowEnabled ? glow : 0;
            drawPlayerShip(previewShip, 'center');
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = selected ? 0.78 : Math.max(0.10, sideAlpha * 0.42);
            ctx.strokeStyle = selected ? shipConfig.previewColor : colorWithAlpha(shipConfig.previewColor, 0.50);
            ctx.lineWidth = selected ? 2 : 1;
            if (glowEnabled && selected) {
                ctx.shadowColor = shipConfig.previewColor;
                ctx.shadowBlur = 16;
            }
            ctx.beginPath();
            ctx.ellipse(slotX, slotY + 92, selected ? 84 : Math.max(38, 56 - distance * 5), selected ? 15 : 9, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${selected ? 18 : 13}px 'Electrolize', sans-serif`;
            ctx.globalAlpha = selected ? 1 : Math.max(0.28, sideAlpha);
            ctx.fillStyle = selected ? '#ffffff' : mixColor(shipConfig.previewColor, '#7f9aa8', 0.65);
            ctx.shadowColor = selected ? shipConfig.previewColor : colorWithAlpha(shipConfig.previewColor, 0.32);
            ctx.shadowBlur = glowEnabled && selected ? 10 : 0;
            if (distance <= 2.35 || selected) {
                ctx.fillText(shipConfig.name, slotX, slotY + (selected ? 134 : 118));
            }
            ctx.restore();
        }

        function drawShipSelectionScreen(now) {
            const selectedShip = getShipSelectConfig();
            const hubMode = typeof shipSelectReturnState !== 'undefined' && shipSelectReturnState === 'GALAXY_SELECT';
            const alpha = Math.max(0.85, titleAlpha);
            const centerY = height * 0.43;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            drawShipSelectHangarBackground(now, selectedShip, alpha);

            const headerPulse = 0.7 + Math.sin(now * 0.0024) * 0.22;
            ctx.font = `bold 30px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = selectedShip.previewColor;
            ctx.shadowBlur = glowEnabled ? 16 + headerPulse * 8 : 0;
            ctx.fillText(hubMode ? 'TERMINAL' : 'HANGAR SELECT', width / 2, height * 0.12);

            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha(selectedShip.previewColor, 0.72);
            ctx.shadowBlur = 0;
            ctx.fillText(hubMode ? 'SELECT ACTIVE FRAME' : 'RUN FRAME ONLINE', width / 2, height * 0.155);

            const shipCount = PLAYER_SHIP_TYPES.length;
            const slotSpacing = Math.min(168, Math.max(118, width * 0.126));
            const renderShips = PLAYER_SHIP_TYPES.map((ship, i) => ({
                ship,
                index: i,
                offset: getWrappedShipSelectOffset(i, shipSelectIndex, shipCount)
            })).sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));

            for (let i = 0; i < renderShips.length; i++) {
                const item = renderShips[i];
                const distance = Math.abs(item.offset);
                const slotX = width / 2 + item.offset * slotSpacing;
                const slotY = centerY + distance * 17 + Math.max(0, distance - 1) * 8;
                if (slotX < -80 || slotX > width + 80) continue;
                drawShipSelectPreview(item.ship, slotX, slotY, item.index === shipSelectIndex, now, item.index, item.offset);
            }

            const panelW = Math.min(440, width - 112);
            const panelH = 230;
            const panelX = width / 2 - panelW / 2;
            const panelY = Math.min(height - panelH - 44, height * 0.655);
            ctx.fillStyle = 'rgba(2, 8, 14, 0.78)';
            ctx.fillRect(panelX, panelY, panelW, panelH);
            ctx.strokeStyle = colorWithAlpha(selectedShip.previewColor, 0.76);
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.82;
            ctx.strokeRect(panelX + 0.5, panelY + 0.5, panelW, panelH);
            ctx.strokeStyle = colorWithAlpha(selectedShip.previewColor, 0.18);
            ctx.strokeRect(panelX + 7.5, panelY + 7.5, panelW - 15, panelH - 15);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = colorWithAlpha(selectedShip.previewColor, 0.20);
            ctx.fillRect(panelX + 1, panelY + 10, 2, panelH - 20);
            ctx.fillRect(panelX + panelW - 3, panelY + 10, 2, panelH - 20);

            ctx.textAlign = 'left';
            ctx.font = `bold 20px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = selectedShip.previewColor;
            ctx.shadowBlur = glowEnabled ? 10 : 0;
            ctx.fillText(selectedShip.name, panelX + 28, panelY + 32);

            ctx.font = `12px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#8fb9c8';
            ctx.shadowBlur = 0;
            ctx.fillText(selectedShip.subtitle.toUpperCase(), panelX + 28, panelY + 55);
            ctx.fillStyle = selectedShip.previewColor;
            ctx.fillText(selectedShip.trait.toUpperCase(), panelX + 28, panelY + 75);

            drawShipSelectHullStat(selectedShip, panelX + 28, panelY + 92, panelW - 56, selectedShip.previewColor);

            const statX = panelX + 28;
            const statY = panelY + 142;
            const statOptions = {
                barW: panelW - 204,
                labelW: 72,
                valueX: panelX + panelW - 28
            };
            drawShipSelectStat('DMG', `${Math.round(selectedShip.damageMult * 100)}%`, selectedShip.damageMult / 1.22, statX, statY, selectedShip.previewColor, statOptions);
            drawShipSelectStat('FIRE', `${Math.round((306 / selectedShip.fireRate) * 100)}%`, (306 / selectedShip.fireRate) / 1.11, statX, statY + 18, selectedShip.previewColor, statOptions);
            drawShipSelectStat('SPEED', `${Math.round(selectedShip.moveSpeedMult * 100)}%`, selectedShip.moveSpeedMult / 1.16, statX, statY + 36, selectedShip.previewColor, statOptions);
            drawShipSelectStat('BOMB', `${Math.round((1 / selectedShip.bombCooldownMult) * 100)}%`, (1 / selectedShip.bombCooldownMult) / 1.24, statX, statY + 54, selectedShip.previewColor, statOptions);
            drawShipSelectStat('EVADE', `${Math.round((1 / selectedShip.hitboxMult) * 100)}%`, (1 / selectedShip.hitboxMult) / 1.12, statX, statY + 72, selectedShip.previewColor, statOptions);

            ctx.restore();
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
