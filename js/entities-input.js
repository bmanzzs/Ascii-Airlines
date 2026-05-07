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
                const survivorEightWayAim = typeof survivorEightWayAimEnabled === 'undefined' || survivorEightWayAimEnabled;
                const shouldDetonate = survivorMode
                    ? (k === ' ' || k === 'b' || (!survivorEightWayAim && k === 'arrowdown'))
                    : k === ' ';
                if (gameState === 'PLAYING' && shouldDetonate && !e.repeat && bombProjectiles.length > 0) {
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
                } else if (gameState === 'GALAXY_SELECT') {
                    enterPauseMode();
                } else if (gameState === 'PAUSED') {
                    if (pauseState === 'SETTINGS') {
                        pauseState = 'MAIN';
                    } else {
                        resumeFromPauseMode();
                    }
                } else if (gameState === 'SHIP_SELECT') {
                    shipSelectIndex = selectedShipIndex;
                    shipSelectReturnState = 'LAUNCH';
                    gameState = 'GALAXY_SELECT';
                    resetPauseMenuShipCursor();
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
            if (gameState === 'RETURN_LOADING' || gameState === 'GALAXY_WARP') {
                e.preventDefault();
                return;
            }
            if (gameState === 'GALAXY_SELECT') {
                const galaxyCount = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS.length : 1;
                const moveGalaxySelection = (dirX, dirY, fallbackDelta) => {
                    if (typeof getGalaxySelectDirectionalIndex === 'function') {
                        selectedGalaxyIndex = getGalaxySelectDirectionalIndex(selectedGalaxyIndex, dirX, dirY);
                    } else {
                        selectedGalaxyIndex = (selectedGalaxyIndex + galaxyCount + fallbackDelta) % galaxyCount;
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
                        gameState = 'GALAXY_SELECT';
                        resetPauseMenuShipCursor();
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
                        else if (selectedPauseOption === 'RESTART') resetGame();
                        else if (selectedPauseOption === 'VOLUME') {
                            isMuted = !isMuted;
                            clearPauseVolumePreview();
                            applyCurrentVolume(gameState === 'PAUSED' ? PAUSE_VOLUME_SCALE : 1);
                        }
                        else if (selectedPauseOption === 'SETTINGS') {
                            pauseState = 'SETTINGS';
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
                            if (pauseReturnState === 'PLAYING' && typeof beginReturnToGalaxySelectLoading === 'function') {
                                beginReturnToGalaxySelectLoading();
                            } else {
                                location.reload();
                            }
                        }
                }
            } else if (pauseState === 'SETTINGS') {
                    const lastSettingsIndex = SETTINGS_MENU_OPTION_COUNT - 1;
                    if (k === 'arrowup' || k === 'w') settingsSelection = (settingsSelection === 0) ? lastSettingsIndex : settingsSelection - 1;
                    if (k === 'arrowdown' || k === 's') settingsSelection = (settingsSelection === lastSettingsIndex) ? 0 : settingsSelection + 1;
                    
                    if (k === 'arrowleft' || k === 'a' || k === 'arrowright' || k === 'd' || k === 'enter' || k === ' ') {
                        if (settingsSelection === 0 && (k !== 'enter' && k !== ' ')) {
                            if (k === 'arrowleft' || k === 'a') currentThemeIndex = (currentThemeIndex + 3) % 4;
                            if (k === 'arrowright' || k === 'd') currentThemeIndex = (currentThemeIndex + 1) % 4;
                            applyTheme();
                        } else if (settingsSelection === 1 && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd')) {
                            showFpsCounter = !showFpsCounter;
                            sessionStorage.setItem('ascii_show_fps', showFpsCounter.toString());
                            applyFpsVisibility();
                        } else if (settingsSelection === 2 && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd')) {
                            showStatsPanel = !showStatsPanel;
                            sessionStorage.setItem('ascii_show_stats', showStatsPanel.toString());
                            applyStatsVisibility();
                        } else if (settingsSelection === 3 && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd')) {
                            userFpsCap = !userFpsCap;
                        } else if (settingsSelection === 4 && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd')) {
                            glowEnabled = !glowEnabled;
                            applyTheme();
                        } else if (settingsSelection === 5 && (k === 'enter' || k === ' ' || k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd')) {
                            survivorEightWayAimEnabled = !survivorEightWayAimEnabled;
                            sessionStorage.setItem('ascii_survivor_eight_way_aim', survivorEightWayAimEnabled.toString());
                        } else if (settingsSelection === lastSettingsIndex && (k === 'enter' || k === ' ')) {
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
        window.addEventListener('keyup', e => {
            const k = e.key.toLowerCase();
            if (keys.hasOwnProperty(k)) {
                keys[k] = false;
                if (k === 'shift' || k === 'alt') e.preventDefault();
            }
        });
        window.addEventListener('blur', clearGameplayKeys);
        window.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left) * (LOGICAL_W / rect.width);
            mouse.y = (e.clientY - rect.top) * (LOGICAL_H / rect.height);
        });
        window.addEventListener('mousedown', () => { mouse.isDown = true; mouse.lastClick = performance.now(); });
        window.addEventListener('mouseup', () => { mouse.isDown = false; });

        // Field Particle System (Background)
        let numParticles = 0;
        let fpHX, fpHY, fpX, fpY, fpVX, fpVY, fpChar, fpColor, fpAlpha, fpHighlight, fpDepth, fpWobblePhase, fpTwinkle;
        const PARTICLE_CHARS = ['·', '∙', "'", '.', '░'];

        // Spatial Hash for performance
        let spatialHash = new Map();
