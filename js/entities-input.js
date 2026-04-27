        // Entity collections, input listeners, field particles, and spatial hash state.
        // Arrays for Game Entities
        let comboProjectiles = [];
        let bombProjectiles = [];
        let bombBlastRings = [];
        let enemies = [];
        let debris = [];
        let thrusterParticles = [];
        let xpOrbs = [];
        let drops = [];
        let enemyBullets = [];
        let boss = null;
        let deathTimer = 0;
        let launchTimer = 0;
        let playerExploded = false;
        let currentHint = "";
        
        const GLITCH_CHARS = [..."ﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙ"];
        
        const RAGE_HINTS = [
            "Tip: try not getting hit.",
            "Reminder: you are not invincible.",
            "Hint: press A to move left.",
            "Did you know: enemy bullets deal damage.",
            "Pro tip: the goal is to survive.",
            "Strategy guide: dodge the purple round things.",
            "Fun fact: exploding means you lose.",
            "Advice: try shooting back.",
            "Notice: the enemies are trying to kill you.",
            "Tip: try and prevent your ship from exploding.",
            "Pro tip: weapons only work if you fire them.",
            "Hint: use your eyes to see the bullets.",
            "Tip: dying lowers your chances of winning.",
            "Reminder: dodging is highly recommended.",
            "Reminder: you cannot win if you are dead.",
            "Reminder: bullets travel toward you.",
            "Pro tip: try getting better at the game.",
            "Strategy: consider not flying into bullets.",
            "Hint: the enemies shoot bullets that hurt you.",
            "Fun fact: this game has a tutorial. You ignored it.",
            "Fun fact: My 6 year old beat this game in one try.",
            "Tip: the bullets are not power-ups.",
            "Reminder: your ship is not supposed to catch every shot.",
            "Pro tip: panic is not a movement ability.",
            "Strategy guide: try dodging before the bullet touches you.",
            "Fun fact: the walls are also not a safe place to live.",
        ];

        // Input Handling
        const keys = { w: false, a: false, s: false, d: false, ' ': false, escape: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false, b: false };
        const mouse = { x: 0, y: 0, isDown: false, lastClick: 0 };

        function clearGameplayKeys() {
            Object.keys(keys).forEach(key => keys[key] = false);
        }

        function beginLaunchSequence() {
            clearGameplayKeys();
            applySelectedShipToPlayer({ heal: true });
            restartLoadingSequence = false;
            gameState = 'LAUNCHING';
            launchTimer = 0;
            player.x = width / 2;
            player.y = height + 100;
            player.vx = 0;
            player.vy = 0;
            player._renderLayoutCache = null;
            startMusic();
        }
        
        window.addEventListener('keydown', e => { 
            if (e.key === '`' || e.key === '~') {
                consoleOpen = !consoleOpen; 
                consoleInput = '';
                consoleHistoryIndex = -1;
                consoleHistoryDraft = '';
                clearGameplayKeys();
                
                if (consoleOpen) {
                    enterPauseMode();
                }
                e.preventDefault(); return;
            }
            if (consoleOpen) {
                e.preventDefault();
                if (e.key === 'Escape') { 
                    consoleOpen = false; 
                    consoleInput = ''; 
                    consoleHistoryIndex = -1;
                    consoleHistoryDraft = '';
                }
                else if (e.key === 'ArrowUp') {
                    if (consoleHistory.length > 0) {
                        if (consoleHistoryIndex === -1) {
                            consoleHistoryDraft = consoleInput;
                            consoleHistoryIndex = consoleHistory.length - 1;
                        } else {
                            consoleHistoryIndex = Math.max(0, consoleHistoryIndex - 1);
                        }
                        consoleInput = consoleHistory[consoleHistoryIndex] || '';
                    }
                }
                else if (e.key === 'ArrowDown') {
                    if (consoleHistoryIndex !== -1) {
                        consoleHistoryIndex++;
                        if (consoleHistoryIndex >= consoleHistory.length) {
                            consoleHistoryIndex = -1;
                            consoleInput = consoleHistoryDraft;
                            consoleHistoryDraft = '';
                        } else {
                            consoleInput = consoleHistory[consoleHistoryIndex] || '';
                        }
                    }
                }
                else if (e.key === 'Backspace') {
                    consoleInput = consoleInput.slice(0, -1);
                    consoleHistoryIndex = -1;
                    consoleHistoryDraft = consoleInput;
                }
                else if (e.key === 'Enter') {
                    const shouldCloseConsole = executeConsoleCommand(consoleInput);
                    consoleInput = '';
                    consoleHistoryIndex = -1;
                    consoleHistoryDraft = '';
                    if (shouldCloseConsole) consoleOpen = false;
                }
                else if (e.key.length === 1) {
                    consoleInput += e.key;
                    consoleHistoryIndex = -1;
                    consoleHistoryDraft = consoleInput;
                }
                return;
            }

            if (bossCinematic && bossCinematic.paused) {
                e.preventDefault();
                return;
            }
            
            const k = e.key.toLowerCase();
            if (keys.hasOwnProperty(k)) {
                keys[k] = true;
                if (k === ' ' && !e.repeat && bombProjectiles.length > 0) {
                    for (let bi = 0; bi < bombProjectiles.length; bi++) bombProjectiles[bi].forceDetonate = true;
                }
                // Prevent scrolling for game keys
                if(k===' '||k==='arrowup'||k==='arrowdown'||k==='arrowleft'||k==='arrowright') {
                    e.preventDefault();
                }
            }
            
            if (k === 'escape') {
                if (gameState === 'PLAYING') {
                    enterPauseMode();
                } else if (gameState === 'PAUSED') {
                    if (pauseState === 'SETTINGS') {
                        pauseState = 'MAIN';
                    } else {
                        resumeFromPauseMode();
                    }
                } else if (gameState === 'SHIP_SELECT') {
                    shipSelectIndex = selectedShipIndex;
                    gameState = 'START';
                }
                e.preventDefault();
                return;
            }
            if (gameState === 'START') {
                if (k === 'arrowleft' || k === 'arrowright') {
                    setShipSelectIndex(selectedShipIndex + (k === 'arrowright' ? 1 : -1));
                    gameState = 'SHIP_SELECT';
                    titleAlpha = 1;
                    e.preventDefault();
                    return;
                }
                if (k === ' ') {
                    beginLaunchSequence();
                    e.preventDefault();
                    return;
                }
            }
            if (gameState === 'SHIP_SELECT') {
                if (k === 'arrowleft' || k === 'a') {
                    setShipSelectIndex(shipSelectIndex - 1);
                    e.preventDefault();
                    return;
                }
                if (k === 'arrowright' || k === 'd') {
                    setShipSelectIndex(shipSelectIndex + 1);
                    e.preventDefault();
                    return;
                }
                if (k === 'enter' || k === ' ') {
                    selectShip(shipSelectIndex, true);
                    beginLaunchSequence();
                    e.preventDefault();
                    return;
                }
            }
            if (gameState === 'GAMEOVER' && k === ' ') location.reload();
            if (gameState === 'PAUSED') {
                const pauseMenuOptions = ['RESUME', 'RESTART', 'VOLUME', 'SETTINGS', document.fullscreenElement ? 'EXIT FULLSCREEN' : 'FULLSCREEN', 'EXIT'];
                if (pauseState === 'MAIN') {
                    const hasPowerups = player.weapons.length > 0;
                    if (pauseSelection === -1 && hasPowerups) {
                        if (k === 'arrowleft' || k === 'a') {
                            pausePowerupSelection = (pausePowerupSelection + player.weapons.length - 1) % player.weapons.length;
                        }
                        if (k === 'arrowright' || k === 'd') {
                            pausePowerupSelection = (pausePowerupSelection + 1) % player.weapons.length;
                        }
                        if (k === 'arrowdown' || k === 's') pauseSelection = 0;
                        if (k === 'arrowup' || k === 'w') pauseSelection = pauseMenuOptions.length - 1;
                        if (k === 'enter' || k === ' ') return;
                    } else {
                        if (k === 'arrowup' || k === 'w') {
                            pauseSelection = pauseSelection === 0
                                ? (hasPowerups ? -1 : pauseMenuOptions.length - 1)
                                : pauseSelection - 1;
                        }
                        if (k === 'arrowdown' || k === 's') {
                            pauseSelection = pauseSelection === pauseMenuOptions.length - 1 ? 0 : pauseSelection + 1;
                        }
                    }
                    if (hasPowerups) {
                        pausePowerupSelection = Math.max(0, Math.min(player.weapons.length - 1, pausePowerupSelection));
                    } else if (pauseSelection === -1) {
                        pauseSelection = 0;
                        pausePowerupSelection = 0;
                    }
                    
                    if (pauseSelection === 2) {
                        if (k === 'arrowleft' || k === 'a') {
                            currentVolume = Math.max(0, Math.round((currentVolume - 0.1) * 10) / 10);
                            previewPauseVolumeAdjustment();
                        }
                        if (k === 'arrowright' || k === 'd') {
                            currentVolume = Math.min(1.0, Math.round((currentVolume + 0.1) * 10) / 10);
                            previewPauseVolumeAdjustment();
                        }
                    }

                    if (k === 'enter' || k === ' ') {
                        if (pauseSelection === 0) {
                            resumeFromPauseMode();
                        }
                        else if (pauseSelection === 1) resetGame();
                        else if (pauseSelection === 2) {
                            isMuted = !isMuted;
                            clearPauseVolumePreview();
                            applyCurrentVolume(gameState === 'PAUSED' ? PAUSE_VOLUME_SCALE : 1);
                        }
                        else if (pauseSelection === 3) {
                            pauseState = 'SETTINGS';
                            settingsSelection = 0;
                        }
                        else if (pauseSelection === 4) {
                            const container = document.getElementById('game-container');
                            if (!document.fullscreenElement) {
                                container.requestFullscreen().catch(()=>{});
                            } else {
                                document.exitFullscreen().catch(()=>{});
                            }
                        }
                        else if (pauseSelection === 5) location.reload();
                    }
                } else if (pauseState === 'SETTINGS') {
                    if (k === 'arrowup' || k === 'w') settingsSelection = (settingsSelection === 0) ? 6 : settingsSelection - 1;
                    if (k === 'arrowdown' || k === 's') settingsSelection = (settingsSelection === 6) ? 0 : settingsSelection + 1;
                    
                    if (k === 'arrowleft' || k === 'a' || k === 'arrowright' || k === 'd' || k === 'enter' || k === ' ') {
                        if (settingsSelection === 0 && (k !== 'enter' && k !== ' ')) {
                            if (k === 'arrowleft' || k === 'a') currentThemeIndex = (currentThemeIndex + 3) % 4;
                            if (k === 'arrowright' || k === 'd') currentThemeIndex = (currentThemeIndex + 1) % 4;
                            applyTheme();
                        } else if (settingsSelection === 1 && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd')) {
                            if (k === 'arrowleft' || k === 'a') renderStyleMode = (renderStyleMode + RENDER_STYLE_NAMES.length - 1) % RENDER_STYLE_NAMES.length;
                            else renderStyleMode = (renderStyleMode + 1) % RENDER_STYLE_NAMES.length;
                            sessionStorage.setItem('ascii_render_style', renderStyleMode.toString());
                        } else if (settingsSelection === 2 && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd')) {
                            showFpsCounter = !showFpsCounter;
                            sessionStorage.setItem('ascii_show_fps', showFpsCounter.toString());
                            applyFpsVisibility();
                        } else if (settingsSelection === 3 && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd')) {
                            userFpsCap = !userFpsCap;
                        } else if (settingsSelection === 4 && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd')) {
                            glowEnabled = !glowEnabled;
                            applyTheme();
                        } else if (settingsSelection === 5 && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd')) {
                            crtFilterEnabled = !crtFilterEnabled;
                            document.getElementById('crt-overlay').style.display = crtFilterEnabled ? 'block' : 'none';
                        } else if (settingsSelection === 6 && (k === 'enter' || k === ' ')) {
                            pauseState = 'MAIN';
                            settingsSelection = 0;
                        }
                    }
                }
            }
            if (gameState === 'LEVELUP' && levelUpState === 'OFFERING') {
                if (k === 'arrowleft' || k === 'a') selectedOptionIndex = (selectedOptionIndex + 2) % 3;
                if (k === 'arrowright' || k === 'd') selectedOptionIndex = (selectedOptionIndex + 1) % 3;
                if (k === '1') { selectedOptionIndex = 0; levelUpState = 'ANIMATING'; levelUpTimer = 0; }
                if (k === '2') { selectedOptionIndex = 1; levelUpState = 'ANIMATING'; levelUpTimer = 0; }
                if (k === '3') { selectedOptionIndex = 2; levelUpState = 'ANIMATING'; levelUpTimer = 0; }
                if (k === 'enter' || k === ' ') {
                    levelUpState = 'ANIMATING';
                    levelUpTimer = 0;
                }
            }
        });
        window.addEventListener('keyup', e => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });
        window.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left) * (LOGICAL_W / rect.width);
            mouse.y = (e.clientY - rect.top) * (LOGICAL_H / rect.height);
        });
        window.addEventListener('mousedown', () => { mouse.isDown = true; mouse.lastClick = performance.now(); });
        window.addEventListener('mouseup', () => { mouse.isDown = false; });

        // Field Particle System (Background)
        let numParticles = 0;
        let fpHX, fpHY, fpX, fpY, fpVX, fpVY, fpChar, fpColor, fpAlpha, fpHighlight;
        const PARTICLE_CHARS = ['+', '=', ':', '.', '-', 'x'];

        // Spatial Hash for performance
        let spatialHash = new Map();
