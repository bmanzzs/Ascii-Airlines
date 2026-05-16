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
            "Flight Advisory: Enemy projectiles are hazardous. Avoid direct contact.",
            "Navigation Note: Remaining stationary increases exposure to incoming fire.",
            "Combat Guidance: Move before the projectile reaches your position.",
            "Safety Notice: Your hull is not rated for repeated bullet impacts.",
            "Tactical Advisory: Use open space before it is no longer open.",
            "Pilot Reminder: Survival improves when hostile rounds miss the ship.",
            "Systems Note: Weapon output is most useful before hull integrity reaches zero.",
            "Route Advisory: Dense patterns are easier to read from a safer lane.",
            "Damage Report: The final impact was avoidable with earlier repositioning.",
            "Training Notice: The bright hostile pixels should be treated as dangerous.",
            "Operational Tip: Preserve health by dodging first and firing second.",
            "Pilot Advisory: Panic steering is not an approved evasive maneuver.",
            "Combat Note: The safest projectile is the one outside your hitbox.",
            "Systems Reminder: Collision with enemy fire reduces mission success.",
            "Flight Tip: Lateral movement is recommended during sustained fire.",
            "Tactical Note: A smaller target still benefits from not being hit.",
            "Route Guidance: Do not occupy the same coordinates as hostile fire.",
            "Training Tip: Try using the empty part of the screen sooner.",
            "Safety Reminder: The retry system remains available for further study.",
            "Operational Advisory: One more run may produce improved results.",
        ];

        // Input Handling
        const keys = { w: false, a: false, s: false, d: false, ' ': false, escape: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false, b: false, shift: false, alt: false };
        const mouse = { x: 0, y: 0, isDown: false, lastClick: 0 };

        function clearGameplayKeys() {
            Object.keys(keys).forEach(key => keys[key] = false);
        }

        function beginLaunchSequence() {
            clearGameplayKeys();
            if (typeof prepareRunStateForLaunch === 'function') prepareRunStateForLaunch();
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
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
            if (typeof musicPlayerOpen !== 'undefined' && musicPlayerOpen && (e.key === '`' || e.key === '~')) {
                if (typeof handleMusicPlayerKey === 'function') handleMusicPlayerKey(e.key.toLowerCase());
                e.preventDefault();
                return;
            }
            if ((e.key === '`' || e.key === '~') && typeof isBossIntroActive === 'function' && isBossIntroActive()) {
                e.preventDefault();
                return;
            }
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

            const k = e.key.toLowerCase();
            if (typeof musicPlayerOpen !== 'undefined' && musicPlayerOpen) {
                e.preventDefault();
                if (typeof handleMusicPlayerKey === 'function') handleMusicPlayerKey(k);
                clearGameplayKeys();
                return;
            }

            if (bossCinematic && bossCinematic.paused) {
                e.preventDefault();
                return;
            }
            
            if (typeof isRunCompleteTransitionActive === 'function' && isRunCompleteTransitionActive()) {
                if ((k === 'enter' || k === ' ') && typeof completeRunToScoreScreen === 'function') {
                    completeRunToScoreScreen();
                    e.preventDefault();
                    return;
                }
            }
            if (keys.hasOwnProperty(k)) {
                keys[k] = true;
                const survivorMode = typeof isSurvivorModeActive === 'function' && isSurvivorModeActive();
                const matrixMode = typeof isMatrixCrawlerModeActive === 'function' && isMatrixCrawlerModeActive();
                const survivorEightWayAim = typeof survivorEightWayAimEnabled === 'undefined' || survivorEightWayAimEnabled;
                const shouldDetonate = survivorMode
                    ? (k === ' ' || k === 'b' || (!survivorEightWayAim && k === 'arrowdown'))
                    : (matrixMode ? (k === ' ' || k === 'b') : k === ' ');
                if ((gameState === 'PLAYING' || gameState === 'MATRIX_CRAWLER') && shouldDetonate && !e.repeat && bombProjectiles.length > 0) {
                    for (let bi = 0; bi < bombProjectiles.length; bi++) bombProjectiles[bi].forceDetonate = true;
                }
                // Prevent scrolling for game keys
                if(k===' '||k==='arrowup'||k==='arrowdown'||k==='arrowleft'||k==='arrowright'||k==='shift'||k==='alt') {
                    e.preventDefault();
                }
            }
            
            if (k === 'escape') {
                if (gameState === 'PLAYING') {
                    enterPauseMode();
                } else if (gameState === 'MATRIX_CRAWLER') {
                    enterPauseMode();
                } else if (gameState === 'GALAXY_SELECT') {
                    enterPauseMode();
                } else if (gameState === 'PAUSED') {
                    if (pauseState === 'GRAPHICS') {
                        pauseState = 'MAIN';
                        settingsSelection = 0;
                    } else if (pauseState === 'SETTINGS') {
                        pauseState = 'MAIN';
                    } else {
                        resumeFromPauseMode();
                    }
                } else if (gameState === 'SHIP_SELECT') {
                    shipSelectIndex = selectedShipIndex;
                    if (shipSelectReturnState === 'GALAXY_SELECT' && typeof beginTerminalDockTransition === 'function') {
                        shipSelectReturnState = 'LAUNCH';
                        beginTerminalDockTransition('exit', selectedShipIndex);
                    } else {
                        shipSelectReturnState = 'LAUNCH';
                        gameState = 'GALAXY_SELECT';
                        resetPauseMenuShipCursor();
                    }
                }
                e.preventDefault();
                return;
            }
            if (gameState === 'VICTORY') {
                if (k === 'enter' || k === ' ') {
                    advanceCampaignScreen();
                    e.preventDefault();
                }
                return;
            }
            if (gameState === 'RUN_SCORE') {
                const buildCount = lastRunSummary && lastRunSummary.weapons ? lastRunSummary.weapons.length : 0;
                if (buildCount > 0) {
                    if (k === 'arrowleft' || k === 'a') {
                        runScoreBuildSelection = (runScoreBuildSelection + buildCount - 1) % buildCount;
                        e.preventDefault();
                        return;
                    }
                    if (k === 'arrowright' || k === 'd') {
                        runScoreBuildSelection = (runScoreBuildSelection + 1) % buildCount;
                        e.preventDefault();
                        return;
                    }
                    if (k === 'arrowup' || k === 'w') {
                        runScoreBuildSelection = Math.max(0, runScoreBuildSelection - 5);
                        e.preventDefault();
                        return;
                    }
                    if (k === 'arrowdown' || k === 's') {
                        runScoreBuildSelection = Math.min(buildCount - 1, runScoreBuildSelection + 5);
                        e.preventDefault();
                        return;
                    }
                }
                if (k === 'enter' || k === ' ') {
                    advanceCampaignScreen();
                    e.preventDefault();
                }
                return;
            }
            if (gameState === 'RETURN_LOADING' || gameState === 'GALAXY_WARP' || gameState === 'TERMINAL_DOCK') {
                e.preventDefault();
                return;
            }
            if (gameState === 'GALAXY_SELECT') {
                if (typeof ensureGalaxySelectMusic === 'function') ensureGalaxySelectMusic(0.35);
                const galaxyCount = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS.length : 1;
                const moveGalaxySelection = (dirX, dirY, fallbackDelta) => {
                    const previousGalaxyIndex = selectedGalaxyIndex;
                    if (typeof getGalaxySelectDirectionalIndex === 'function') {
                        selectedGalaxyIndex = getGalaxySelectDirectionalIndex(selectedGalaxyIndex, dirX, dirY);
                    } else {
                        selectedGalaxyIndex = (selectedGalaxyIndex + galaxyCount + fallbackDelta) % galaxyCount;
                    }
                    if (typeof handleGalaxySelectIndexChanged === 'function') {
                        handleGalaxySelectIndexChanged(previousGalaxyIndex, selectedGalaxyIndex);
                    }
                };
                if (k === 'arrowleft' || k === 'a') {
                    moveGalaxySelection(-1, 0, -1);
                    e.preventDefault();
                    return;
                }
                if (k === 'arrowright' || k === 'd') {
                    moveGalaxySelection(1, 0, 1);
                    e.preventDefault();
                    return;
                }
                if (k === 'arrowup' || k === 'w') {
                    moveGalaxySelection(0, -1, -3);
                    e.preventDefault();
                    return;
                }
                if (k === 'arrowdown' || k === 's') {
                    moveGalaxySelection(0, 1, 3);
                    e.preventDefault();
                    return;
                }
                if (k === 'enter' || k === ' ') {
                    selectHighlightedGalaxy();
                    e.preventDefault();
                    return;
                }
            }
            if (gameState === 'START') {
                if (k === 'arrowleft' || k === 'arrowright') {
                    setShipSelectIndex(selectedShipIndex + (k === 'arrowright' ? 1 : -1));
                    shipSelectReturnState = 'LAUNCH';
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
                    if (shipSelectReturnState === 'GALAXY_SELECT') {
                        shipSelectReturnState = 'LAUNCH';
                        if (typeof beginTerminalDockTransition === 'function') {
                            beginTerminalDockTransition('exit', selectedShipIndex);
                        } else {
                            gameState = 'GALAXY_SELECT';
                            resetPauseMenuShipCursor();
                        }
                    } else {
                        beginLaunchSequence();
                    }
                    e.preventDefault();
                    return;
                }
            }
            if (gameState === 'GAMEOVER' && k === ' ') {
                if (typeof beginReturnToGalaxySelectLoading === 'function') {
                    beginReturnToGalaxySelectLoading();
                } else {
                    location.reload();
                }
                e.preventDefault();
                return;
            }
            if (gameState === 'PAUSED') {
                const pauseMenuOptions = getPauseMenuOptions();
                if (pauseState === 'MAIN') {
                    const hasPowerups = isPausePowerupMenuAvailable();
                    if (pauseSelection !== -1) {
                        pauseSelection = Math.max(0, Math.min(pauseMenuOptions.length - 1, pauseSelection));
                    }
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
                            pauseSelection = pauseSelection === pauseMenuOptions.length - 1
                                ? (hasPowerups ? -1 : 0)
                                : pauseSelection + 1;
                        }
                    }
                    if (hasPowerups) {
                        pausePowerupSelection = Math.max(0, Math.min(player.weapons.length - 1, pausePowerupSelection));
                    } else if (pauseSelection === -1) {
                        pauseSelection = 0;
                        pausePowerupSelection = 0;
                    }
                    
                    const volumeIndex = pauseMenuOptions.indexOf('VOLUME');
                    if (pauseSelection === volumeIndex) {
                        if (k === 'arrowleft' || k === 'a') {
                            currentVolume = Math.max(0, Math.round((currentVolume - 0.05) * 20) / 20);
                            previewPauseVolumeAdjustment();
                        }
                        if (k === 'arrowright' || k === 'd') {
                            currentVolume = Math.min(1.0, Math.round((currentVolume + 0.05) * 20) / 20);
                            previewPauseVolumeAdjustment();
                        }
                    }

                    if (k === 'enter' || k === ' ') {
                        const selectedPauseOption = pauseMenuOptions[pauseSelection];
                        if (selectedPauseOption === 'RESUME') {
                            resumeFromPauseMode();
                        }
                        else if (selectedPauseOption === 'RESTART') {
                            if (pauseReturnState === 'MATRIX_CRAWLER' && typeof restartMatrixCrawlerRun === 'function') restartMatrixCrawlerRun();
                            else resetGame();
                        }
                        else if (selectedPauseOption === 'VOLUME') {
                            isMuted = !isMuted;
                            clearPauseVolumePreview();
                            applyCurrentVolume(gameState === 'PAUSED' ? PAUSE_VOLUME_SCALE : 1);
                        }
                        else if (selectedPauseOption === 'SETTINGS') {
                            pauseState = 'SETTINGS';
                            settingsSelection = 0;
                        }
                        else if (selectedPauseOption === 'GRAPHICS') {
                            pauseState = 'GRAPHICS';
                            settingsSelection = 0;
                        }
                        else if (selectedPauseOption === 'FULLSCREEN' || selectedPauseOption === 'EXIT FULLSCREEN') {
                            const container = document.getElementById('game-container');
                            if (!document.fullscreenElement) {
                                container.requestFullscreen().catch(()=>{});
                            } else {
                                document.exitFullscreen().catch(()=>{});
                            }
                        }
                        else if (selectedPauseOption === 'EXIT') {
                            if ((pauseReturnState === 'PLAYING' || pauseReturnState === 'MATRIX_CRAWLER') && typeof beginReturnToGalaxySelectLoading === 'function') {
                                beginReturnToGalaxySelectLoading();
                            } else {
                                location.reload();
                            }
                        }
                }
            } else if (pauseState === 'SETTINGS' || pauseState === 'GRAPHICS') {
                    const optionCount = typeof getCurrentSettingsMenuOptionCount === 'function'
                        ? getCurrentSettingsMenuOptionCount()
                        : SETTINGS_MENU_OPTION_COUNT;
                    const lastSettingsIndex = optionCount - 1;
                    if (k === 'arrowup' || k === 'w') settingsSelection = (settingsSelection === 0) ? lastSettingsIndex : settingsSelection - 1;
                    if (k === 'arrowdown' || k === 's') settingsSelection = (settingsSelection === lastSettingsIndex) ? 0 : settingsSelection + 1;
                    
                    if (k === 'arrowleft' || k === 'a' || k === 'arrowright' || k === 'd' || k === 'enter' || k === ' ') {
                        const isToggleKey = k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd';
                        const direction = (k === 'arrowleft' || k === 'a') ? -1 : 1;

                        if (pauseState === 'SETTINGS') {
                            if (settingsSelection === 0 && (k !== 'enter' && k !== ' ')) {
                                if (k === 'arrowleft' || k === 'a') currentThemeIndex = (currentThemeIndex + 3) % 4;
                                if (k === 'arrowright' || k === 'd') currentThemeIndex = (currentThemeIndex + 1) % 4;
                                applyTheme();
                            } else if (settingsSelection === 1 && isToggleKey) {
                                showFpsCounter = !showFpsCounter;
                                sessionStorage.setItem('ascii_show_fps', showFpsCounter.toString());
                                applyFpsVisibility();
                            } else if (settingsSelection === 2 && isToggleKey) {
                                showStatsPanel = !showStatsPanel;
                                sessionStorage.setItem('ascii_show_stats', showStatsPanel.toString());
                                applyStatsVisibility();
                            } else if (settingsSelection === 3 && isToggleKey) {
                                survivorEightWayAimEnabled = !survivorEightWayAimEnabled;
                                sessionStorage.setItem('ascii_survivor_eight_way_aim', survivorEightWayAimEnabled.toString());
                            } else if (settingsSelection === lastSettingsIndex && (k === 'enter' || k === ' ')) {
                                pauseState = 'MAIN';
                                settingsSelection = 0;
                            }
                        } else if (pauseState === 'GRAPHICS') {
                            if (settingsSelection === 0 && isToggleKey) {
                                userFpsCap = !userFpsCap;
                                sessionStorage.setItem('ascii_fps_cap', userFpsCap.toString());
                            } else if (settingsSelection === 1 && isToggleKey) {
                                if (typeof setCanvasSharpnessIndex === 'function') {
                                    setCanvasSharpnessIndex(canvasSharpnessIndex + direction);
                                }
                            } else if (settingsSelection === 2 && isToggleKey) {
                                if (typeof setCanvasFilterIndex === 'function') {
                                    setCanvasFilterIndex(canvasFilterIndex + direction);
                                }
                            } else if (settingsSelection === 3 && isToggleKey) {
                                if (typeof cycleGlowQualityMode === 'function') {
                                    cycleGlowQualityMode(direction);
                                } else {
                                    glowEnabled = !glowEnabled;
                                    sessionStorage.setItem('ascii_glow_enabled', glowEnabled.toString());
                                    if (typeof invalidateGraphicsRenderCaches === 'function') invalidateGraphicsRenderCaches();
                                    applyTheme();
                                }
                            } else if (settingsSelection === 4 && isToggleKey) {
                                if (typeof setVisualQualityIndex === 'function') {
                                    setVisualQualityIndex(visualQualityIndex + direction);
                                }
                            } else if (settingsSelection === lastSettingsIndex && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'a')) {
                                pauseState = 'MAIN';
                                settingsSelection = 0;
                            }
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
        window.addEventListener('keyup', e => {
            const k = e.key.toLowerCase();
            if (keys.hasOwnProperty(k)) {
                keys[k] = false;
                if (k === 'shift' || k === 'alt') e.preventDefault();
            }
        });
        window.addEventListener('blur', clearGameplayKeys);
        function updateMouseFromEvent(e) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left) * (LOGICAL_W / rect.width);
            mouse.y = (e.clientY - rect.top) * (LOGICAL_H / rect.height);
        }

        window.addEventListener('mousemove', e => {
            updateMouseFromEvent(e);
            if (typeof handleGalaxyLayoutEditorMouseMove === 'function') {
                handleGalaxyLayoutEditorMouseMove(mouse.x, mouse.y);
            }
        });
        window.addEventListener('mousedown', e => {
            updateMouseFromEvent(e);
            if (typeof handleGalaxyLayoutEditorMouseDown === 'function' && handleGalaxyLayoutEditorMouseDown(mouse.x, mouse.y)) {
                e.preventDefault();
                return;
            }
            mouse.isDown = true;
            mouse.lastClick = performance.now();
        });
        window.addEventListener('mouseup', e => {
            updateMouseFromEvent(e);
            if (typeof handleGalaxyLayoutEditorMouseUp === 'function' && handleGalaxyLayoutEditorMouseUp()) {
                e.preventDefault();
            }
            mouse.isDown = false;
        });
        window.addEventListener('wheel', e => {
            updateMouseFromEvent(e);
            if (typeof handleGalaxyLayoutEditorWheel === 'function' && handleGalaxyLayoutEditorWheel(e.deltaY, {
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey
            }, mouse.x, mouse.y)) {
                e.preventDefault();
            }
        }, { passive: false });

        // Field Particle System (Background)
        let numParticles = 0;
        let fpHX, fpHY, fpX, fpY, fpVX, fpVY, fpChar, fpColor, fpAlpha, fpHighlight, fpDepth, fpWobblePhase, fpTwinkle;
        const PARTICLE_CHARS = ['·', '∙', "'", '.', '░'];

        // Spatial Hash for performance
        let spatialHash = new Map();
