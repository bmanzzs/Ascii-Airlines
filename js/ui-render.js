        // Canvas UI, menus, title screen, overlays, and frame rendering.
        function drawPauseMenu() {
            ctx.fillStyle = currentBgColor + 'dd';
            ctx.fillRect(0, 0, width | 0, height | 0);
            const midX = width / 2;
            const lFrame = [..."⣠⣄⡆⠇⠋⠙⠸⢰"][Math.floor(currentFrameNow / 160) % 8];
            const border = `${lFrame}`;

            if (pauseState === 'MAIN') {
                const midY = height / 2 - 200;
                const options = ['RESUME', 'RESTART', 'VOLUME', 'SETTINGS', document.fullscreenElement ? 'EXIT FULLSCREEN' : 'FULLSCREEN', 'EXIT'];
                options.forEach((opt, i) => {
                    const isSel = pauseSelection === i;
                    ctx.fillStyle = isSel ? currentThemeColor : '#444488';
                    
                    let displayText = opt;
                    if (i === 2 && isSel) displayText = '< ' + opt + ' >';

                    if (isSel) { 
                        ctx.shadowColor = currentThemeColor; 
                        ctx.shadowBlur = 15; 
                        ctx.font = `bold 28px 'Electrolize', sans-serif`;
                        const textW = ctx.measureText(displayText).width;
                        
                        ctx.font = `bold 28px Courier New`;
                        ctx.fillText(border, (midX - textW/2 - 25) | 0, (midY + i * 80) | 0);
                        ctx.fillText(border, (midX + textW/2 + 25) | 0, (midY + i * 80) | 0);
                    }
                    
                    ctx.font = `bold 28px 'Electrolize', sans-serif`;
                    ctx.fillText(displayText, midX | 0, (midY + i * 80) | 0);
                    
                    if (i === 2) {
                        ctx.font = `bold 18px Courier New`;
                        const blocks = Math.round(currentVolume * 10);
                        const barStr = '▓'.repeat(blocks) + '░'.repeat(10 - blocks);
                        const muteStr = isMuted ? ' 🔇M' : '';
                        ctx.fillText(`[${barStr}]${muteStr}`, midX | 0, (midY + i * 80 + 25) | 0);
                    }

                    ctx.shadowBlur = 0;
                });
            } else if (pauseState === 'SETTINGS') {
                const options = [
                    'THEME: < ' + themes[currentThemeIndex] + ' >', 
                    'RENDER STYLE: < ' + RENDER_STYLE_NAMES[renderStyleMode] + ' >',
                    'SHOW FPS: < ' + (showFpsCounter ? 'ON' : 'OFF') + ' >',
                    'FPS CAP 60: < ' + (userFpsCap ? 'ON' : 'OFF') + ' >',
                    'GLOW EFFECT: < ' + (glowEnabled ? 'ON' : 'OFF') + ' >',
                    'CRT FILTER: < ' + (crtFilterEnabled ? 'ON' : 'OFF') + ' >',
                    'GO BACK'
                ];
                const midY = Math.round(height / 2 - ((options.length - 1) * 80) / 2);
                options.forEach((opt, i) => {
                    const isSel = settingsSelection === i; 
                    ctx.fillStyle = isSel ? currentThemeColor : '#444488';
                    
                    if (isSel && glowEnabled) { 
                        ctx.shadowColor = currentThemeColor; 
                        ctx.shadowBlur = 15; 
                        ctx.font = `bold 28px 'Electrolize', sans-serif`;
                        const textW = ctx.measureText(opt).width;
                        
                        ctx.font = `bold 28px Courier New`;
                        ctx.fillText(border, (midX - textW/2 - 25) | 0, (midY + i * 80) | 0);
                        ctx.fillText(border, (midX + textW/2 + 25) | 0, (midY + i * 80) | 0);
                    }
                    
                    ctx.font = `bold 28px 'Electrolize', sans-serif`;
                    ctx.fillText(opt, midX | 0, (midY + i * 80) | 0);
                    ctx.shadowBlur = 0;
                });
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

            ctx.fillStyle = '#0a0a15';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = isSelected ? `${opt.color}11` : 'rgba(255,255,255,0.02)';
            ctx.fillRect(8, 8, w - 16, h - 16);

            if (isSelected) {
                ctx.shadowColor = opt.color;
                ctx.shadowBlur = 10 + borderPulse * 10;
            }
            ctx.strokeStyle = opt.color;
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

            ctx.fillStyle = opt.color;
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
            const renderNow = currentFrameNow;
            const allowScreenShake = gameState !== 'PAUSED' && gameState !== 'LEVELUP';
            if (!allowScreenShake) {
                shake = 0;
                wobble = 0;
            }
            ctx.save(); 
            if (allowScreenShake && shake > 0.5) ctx.translate(((Math.random()-0.5)*shake) | 0, ((Math.random()-0.5)*shake) | 0);
            if (allowScreenShake && wobble > 0.01) { ctx.translate(Math.sin(renderNow * 0.08) * wobble * 6, 0); wobble *= 0.82; }
            
            ctx.globalCompositeOperation = 'source-over'; 

            // Background Geometric Field
            for (let i = 0; i < numParticles; i++) {
                if (fpY[i] < -CELL_SIZE || fpY[i] > height + CELL_SIZE) continue;
                const char = PARTICLE_CHARS[fpChar[i]];
                const baseColor = COLORS[fpColor[i]];
                if (fpHighlight[i] > 0.1) {
                    ctx.fillStyle = '#ffffff'; ctx.globalAlpha = fpHighlight[i];
                    ctx.fillRect((fpX[i]-charW/2) | 0, (fpY[i]-charH/2) | 0, charW, charH);
                    ctx.fillStyle = currentThemeColor; ctx.globalAlpha = 1.0;
                } else {
                    ctx.fillStyle = baseColor; ctx.globalAlpha = fpAlpha[i];
                }
                ctx.fillText(char, fpX[i] | 0, fpY[i] | 0);
            }
            ctx.globalAlpha = 1.0;

            if (gameState === 'START' || gameState === 'LAUNCHING') {
                let alpha = titleAlpha;
                if (gameState === 'LAUNCHING') {
                    alpha = Math.max(0, titleAlpha - (launchTimer / 0.5));
                }

                if (alpha > 0) {
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
                    ctx.fillText('WASD to Maneuver | ARROWS to Fire | SPACE to Bomb', (width/2) | 0, (height*0.7) | 0);
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
                        ctx.fillText(activeWp.glyph, d.x|0, d.y|0);

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
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = 2;
                            ctx.strokeRect((d.x - boxSize / 2) | 0, (d.y - boxSize / 2) | 0, boxSize, boxSize);
                            ctx.fillStyle = d.crossColor || '#ffffff';
                            ctx.font = `bold ${Math.max(18, Math.round(boxSize * 0.95))}px Courier New`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText('+', d.x | 0, d.y | 0);
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
                    if (b.isHuge) {
                        if (!hugeFontSet) {
                            ctx.font = `bold 120px Courier New`;
                            hugeFontSet = true;
                        }
                        ctx.fillStyle = bulletColor;
                        if (b.isGlitchBullet && glowEnabled) { ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 25; }
                        const scale = Math.max(0.01, b.life);
                        ctx.save();
                        ctx.translate(b.x | 0, b.y | 0);
                        ctx.scale(scale, scale);
                        ctx.fillText(b.char, 0, 0);
                        ctx.restore();
                        if (b.isGlitchBullet) { ctx.shadowBlur = 0; }
                        continue;
                    }
                    if (b.isLargeFlame) {
                        // Only spawn trail particles while the simulation is live.
                        if (gameState === 'PLAYING' && Math.random() > 0.4) {
                            thrusterParticles.push({
                                x: b.x + (Math.random() - 0.5) * 10, y: b.y + (Math.random() - 0.5) * 10,
                                vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 25,
                                char: ELEMENTAL_TRAIL_CHARS[Math.floor(Math.random() * ELEMENTAL_TRAIL_CHARS.length)],
                                color: null, life: 0.7, isGuardianFlame: true
                            });
                        }
                        // Fade between red and orange without mutating projectile state during pause.
                        const flameCycle = Math.sin(renderNow * 0.004);
                        bulletColor = flameCycle > 0 ? '#e01926' : '#e38914';
                    } else if (b.isLargeWraith) {
                        if (gameState === 'PLAYING' && Math.random() > 0.4) {
                            thrusterParticles.push({
                                x: b.x + (Math.random() - 0.5) * 10, y: b.y + (Math.random() - 0.5) * 10,
                                vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 25,
                                char: ELEMENTAL_TRAIL_CHARS[Math.floor(Math.random() * ELEMENTAL_TRAIL_CHARS.length)],
                                color: null, life: 0.7, isWraithFlame: true
                            });
                        }
                        const wraithCycle = Math.sin(renderNow * 0.004 + b.x * 0.01 + b.y * 0.01);
                        bulletColor = wraithCycle > 0.3 ? '#c8ffff' : (wraithCycle > -0.2 ? '#f4fbff' : '#101317');
                    }
                    if (b.isCodeLine) {
                        ctx.fillStyle = '#00ff41';
                        ctx.font = `bold 14px Courier New`;
                        if (glowEnabled) { ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 20 + Math.random() * 10; }
                        ctx.save();
                        ctx.translate(b.x | 0, b.y | 0);
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
                    ctx.fillText(b.char, b.x | 0, b.y | 0);
                    if (b.isGlitchBullet || b.isWraithBolt || b.isFlyByBullet || b.isVoidProjectile) { ctx.shadowBlur = 0; }
                }
                if (hugeFontSet) {
                    ctx.font = `bold 20px Courier New`; // Restore standard font size
                }
                
                for (const e of enemies) {
                    if (e.path && e.pathT < 0) continue;
                    if (e.lifeTime && e.lifeTime < 0) continue;
                    const flashColor = e.flashTimer > 0 ? '#ffffff' : null;
                    if (e.isFlyBy) {
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
                    const bossRenderEntries = null;
                    if (boss.name === 'OVERHEATING FIREWALL') {
                        const fireLines = boss.sprite;
                        const renderBossX = snapSpriteCoord(boss.x);
                        const renderBossY = snapSpriteCoord(boss.y);
                        const bSX = renderBossX - (fireLines[0].length * charW) / 2;
                        const bSY = renderBossY - (fireLines.length * charH) / 2;
                        const firewallHasColor = boss.phase === 'ACTIVE';
                        
                        ctx.font = `bold 20px Courier New`;
                        
                        // Exact mathematical frame loop (300 frames = 5 seconds at 60FPS)
                        const LOOP_FRAMES = 300;
                        const firewallAnimFrame = typeof boss.animFrame === 'number' ? boss.animFrame : 0;
                        const tAngle = ((firewallAnimFrame % LOOP_FRAMES) / LOOP_FRAMES) * Math.PI * 2;

                        for (let r = 0; r < fireLines.length; r++) {
                            const hRatio = r / fireLines.length;

                            // Smooth, pulsating wave glow traveling up the flame (loops exactly 4 times per full cycle)
                            if (glowEnabled && firewallHasColor) {
                                ctx.shadowBlur = 25 + Math.sin(4 * tAngle - r * 0.5) * 10;
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
                                        const flickerHeat = hRatio + (noise * 0.15);
                                        
                                        if (flickerHeat > 0.75) {
                                            ctx.fillStyle = '#ffaa00'; // Yellow-orange base
                                        } else if (flickerHeat > 0.45) {
                                            ctx.fillStyle = '#ff4400'; // Bright orange mid
                                        } else {
                                            ctx.fillStyle = '#cc0000'; // Deep red tips
                                        }
                                        
                                        // Occasional smooth white hot pockets (loops exactly 5 times per full cycle)
                                        if (flickerHeat > 0.85 && Math.sin(5 * tAngle + c * 0.5) > 0.5) {
                                            ctx.shadowColor = '#ffffff';
                                        } else {
                                            ctx.shadowColor = '#ff5500';
                                        }
                                    }

                                    const baseHeat = FIREWALL_CHAR_MAP[char] || 0;
                                    let heat = Math.round(baseHeat + noise);
                                    heat = Math.max(1, Math.min(4, heat)); 
                                    
                                    const animChar = FIREWALL_FIRE_CHARS[heat];
                                    ctx.fillText(animChar, (bSX + c * charW) | 0, (bSY + r * charH) | 0);
                                    recordBossRenderGlyph(bossRenderEntries, animChar, (bSX + c * charW) | 0, (bSY + r * charH) | 0, ctx.fillStyle);
                                }
                            }
                        }
                        ctx.shadowBlur = 0;
                        
                        if (boss.phase === 'ACTIVE') {
                            if (gameState === 'PLAYING') {
                                boss.coreTimer += dt;
                                if (boss.coreTimer > 4) boss.coreTimer -= 4;
                                boss.isVulnerable = boss.coreTimer >= 3.0;
                            }
                            
                            const coreX = boss.x;
                            const coreY = boss.y + 20;
                            
                            ctx.font = `bold 96px Courier New`; // 300% scale
                            if (boss.isVulnerable) {
                                ctx.fillStyle = '#00ffff';
                                ctx.shadowColor = '#00ffff';
                                ctx.shadowBlur = 40;
                                ctx.fillText('◈', coreX, coreY);
                                ctx.shadowBlur = 0;
                            } else {
                                ctx.fillStyle = '#ff0000';
                                ctx.shadowColor = '#ff0000';
                                ctx.shadowBlur = 40;
                                ctx.fillText('◈', coreX, coreY);
                                ctx.shadowBlur = 0;
                            }
                            recordBossRenderGlyph(bossRenderEntries, '@', coreX, coreY, ctx.fillStyle, BOSS_CINEMATIC_FIREWALL_CORE_SCALE);
                            
                            ctx.font = `bold 16px Courier New`; // Revert back for health bar
                            const { barW, barH, barX, barY, nameY } = getBossBarLayout();
                            ctx.strokeStyle = '#ffffff'; ctx.strokeRect(barX | 0, barY | 0, barW, barH);
                            ctx.fillStyle = '#ff6600'; ctx.fillRect((barX+2) | 0, (barY+2) | 0, (barW-4)*(boss.hp/boss.maxHp), barH-4);
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
                        const bodyPulse = bodyFlash
                            ? 1
                            : 0.75 + Math.sin(2 * layout.tAngle - 0.22) * 0.25;
                        const bodyGlow = glowEnabled && boss.phase !== 'INTRO'
                            ? GHOST_SIGNAL_BODY_GLOW + bodyPulse * 9 + Math.sin(4 * layout.tAngle) * 4
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
                            ctx.fillStyle = '#9cfbff';
                            ctx.fillRect((barX + 2) | 0, (barY + 2) | 0, (barW - 4) * (boss.hp / boss.maxHp), barH - 4);
                            ctx.fillStyle = '#d8fbff';
                            ctx.font = `bold 16px Courier New`;
                            ctx.fillText(boss.name, (width / 2) | 0, nameY | 0);
                        }
                    } else if (boss.name === 'BLACK VOID') {
                        drawBlackVoidBoss(renderNow, bossRenderEntries);
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
                            ctx.beginPath();
                            ctx.arc(boss.x, boss.y, 30 + boss.glowIntensity * 30, 0, Math.PI * 2);
                            ctx.fill();
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
                                    const baseName = boss.stage === 1 ? "DISTORTED GLITCH" : "[STAGE 2] D1ST0RT3D GL1TCH";
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
                    for (let angleIndex = 0; angleIndex < angles.length; angleIndex++) {
                        drawBeamStrand(beamOrigin.x, beamOrigin.y, angles[angleIndex], s.sizeMult, beamPhase, beamDeployFactor, beamMetrics);
                    }
                }

                for (const ring of bombBlastRings) {
                    const t = Math.max(0, Math.min(1, ring.life / ring.maxLife));
                    const radius = ring.maxRadius * (1 - Math.pow(1 - t, 2.2));
                    const alpha = (1 - t) * 0.9;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = ring.color;
                    ctx.lineWidth = ring.lineWidth;
                    if (glowEnabled) {
                        ctx.shadowColor = ring.color;
                        ctx.shadowBlur = 18;
                    }
                    ctx.beginPath();
                    ctx.arc(ring.x | 0, ring.y | 0, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }

                for (const bomb of bombProjectiles) {
                    const pulse = 0.8 + Math.sin(renderNow * 0.016 + bomb.pulse) * 0.2;
                    ctx.save();
                    ctx.translate(bomb.x | 0, bomb.y | 0);
                    ctx.fillStyle = '#ffffff';
                    if (glowEnabled) {
                        ctx.shadowColor = '#72e8ff';
                        ctx.shadowBlur = 22 + pulse * 10;
                    }
                    ctx.font = `bold 28px Courier New`;
                    ctx.fillText('◉', 0, 0);
                    ctx.fillStyle = '#8eeeff';
                    ctx.font = `bold 18px Courier New`;
                    ctx.fillText('•', 0, 0);
                    ctx.restore();
                }
                
                for (const p of comboProjectiles) { 
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
                    ctx.translate(p.x | 0, p.y | 0);
                    let scale = p.stats.sizeMult;
                    if (p.stats.pathFunction === 'parabolic') {
                        let arc = Math.sin((p.life / p.maxLife) * Math.PI);
                        scale *= (1 + arc * 2);
                    }
                    ctx.scale(scale, scale);
                    ctx.fillText(p.sprite, 0, 0); 
                    ctx.restore();
                    if (p.isBombShrapnel) ctx.shadowBlur = 0;
                }
                for (const d of debris) { 
                    ctx.fillStyle = d.color; 
                    ctx.globalAlpha = d.isImpact ? Math.max(0, Math.min(1, d.life * 5)) : d.life; 
                    ctx.font = d.isImpact ? `bold 7px Courier New` : `bold 16px Courier New`; 
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
                ctx.globalCompositeOperation = 'source-over';
            }

            if (gameState === 'PAUSED') drawPauseMenu();
            if (gameState === 'LEVELUP') drawLevelUpMenu(dt);
            
            if (consoleOpen) drawConsoleOverlay();
            ctx.restore();
        }
