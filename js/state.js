        // Theme, runtime state, pause helpers, FPS state, and physics constants.
        // UI Themes
        const themes = ['CYBERPUNK', 'MATRIX GREEN', 'AMBER', 'WHITE PHOSPHOR'];
        let currentThemeIndex = 0;
        let currentThemeColor = '#6aa8ff';
        let currentBgColor = '#050712';
        let currentFieldBgColor = '#0a1026';
        let userFpsCap = false;
        let showFpsCounter = true;
        let showStatsPanel = true;
        let renderStyleMode = 2;
        let glowEnabled = true;
        let survivorEightWayAimEnabled = true;
        
        function applyTheme() {
            const root = document.documentElement;
            let color, bg, fieldBg, fpsColor, shadow;
            if (currentThemeIndex === 0) {
                color = '#6aa8ff'; bg = '#050712'; fieldBg = '#0a1026'; fpsColor = '#a2b7d0'; shadow = '0 0 5px #6aa8ff'; currentBgColor = bg; currentFieldBgColor = fieldBg;
            } else if (currentThemeIndex === 1) { 
                color = '#00ff00'; bg = '#001100'; fieldBg = '#001807'; fpsColor = '#00aa00'; shadow = '0 0 5px #00ff00'; currentBgColor = bg; currentFieldBgColor = fieldBg;
            } else if (currentThemeIndex === 2) { 
                color = '#ffb000'; bg = '#1a0b00'; fieldBg = '#201103'; fpsColor = '#aa7700'; shadow = '0 0 5px #ffb000'; currentBgColor = bg; currentFieldBgColor = fieldBg;
            } else if (currentThemeIndex === 3) { 
                color = '#ffffff'; bg = '#000000'; fieldBg = '#05070d'; fpsColor = '#aaaaaa'; shadow = '0 0 4px #ffffff, 0 0 10px rgba(255,255,255,0.45)'; currentBgColor = bg; currentFieldBgColor = fieldBg;
            }
            
            currentThemeColor = color;
            root.style.setProperty('--theme-color', color);
            root.style.setProperty('--theme-bg', bg);
            root.style.setProperty('--theme-shadow', shadow);
            root.style.setProperty('--theme-fps', fpsColor);
            
            // Force rendering engine to paint the exact border styles immediately 
            document.getElementById('gameCanvas').style.borderColor = color;
            document.getElementById('hud').style.borderColor = color;
            document.getElementById('hud').style.boxShadow = `inset 0 0 15px ${color}33`; // 33 hex = ~20% opacity
            
            sessionStorage.setItem('ascii_theme', currentThemeIndex.toString());
        }

        let savedTheme = sessionStorage.getItem('ascii_theme');
        if (savedTheme !== null) currentThemeIndex = parseInt(savedTheme);
        applyTheme();
        let savedFpsVisibility = sessionStorage.getItem('ascii_show_fps');
        if (savedFpsVisibility !== null) showFpsCounter = savedFpsVisibility === 'true';
        applyFpsVisibility();
        let savedStatsVisibility = sessionStorage.getItem('ascii_show_stats');
        if (savedStatsVisibility !== null) showStatsPanel = savedStatsVisibility === 'true';
        applyStatsVisibility();
        let savedSurvivorAimMode = sessionStorage.getItem('ascii_survivor_eight_way_aim');
        if (savedSurvivorAimMode !== null) survivorEightWayAimEnabled = savedSurvivorAimMode === 'true';

        // FPS Counter State
        let frameCount = 0;
        let renderFrameCount = 0;
        let fpsLastTime = performance.now();
        let currentFps = 0;
        let lastRafTime = 0;

        // Physics Constants
        const SPRING_CONST = 0.012;
        const DAMPING = 0.88;
        const CELL_SIZE = 22; 
        const SCROLL_SPEED = 38;
        const HASH_SIZE = 80;
        const FIELD_WAKE_FORCE_SCALE = 0.34;
        const FIELD_WAKE_HIGHLIGHT_BASE = 0.06;
        const FIELD_WAKE_HIGHLIGHT_SCALE = 0.018;
        const FIELD_HIGHLIGHT_MAX = 0.72;
        const FIELD_HIGHLIGHT_DECAY = 0.92;
        const FIELD_DISPLACEMENT_MIN = 20;
        const FIELD_DISPLACEMENT_MAX = 42;
        const FIELD_VELOCITY_MIN = 80;
        const FIELD_VELOCITY_MAX = 160;
        const FIELD_WOBBLE_AMPLITUDE = 3.5;
        const FIELD_WOBBLE_SPEED = 0.00115;
        const FIELD_TWINKLE_SPEED = 0.0024;
        const FOCUS_METER_MAX = 1;
        const FOCUS_DRIVE_DRAIN_PER_SEC = 0.28;
        const FOCUS_SPECTER_DRAIN_PER_SEC = 0.16;
        const FOCUS_REGEN_PER_SEC = 0.055;
        const FOCUS_REGEN_DELAY = 1.1;
        const FOCUS_EMPTY_LOCKOUT = 0.9;
        const FOCUS_ELITE_DROP_AMOUNT = 0.32;
        const FOCUS_DRIVE_HOSTILE_TIME_SCALE = 0.30;
        const FOCUS_DRIVE_MUSIC_RATE = 0.50;
        const FOCUS_SPECTER_MUSIC_RATE = 1.045;
        const FOCUS_DRIVE_FADE_IN = 0.16;
        const FOCUS_DRIVE_FADE_OUT = 0.24;
        const FOCUS_SPECTER_FADE_IN = 0.10;
        const FOCUS_SPECTER_FADE_OUT = 0.18;
        const FOCUS_SPECTER_VISUAL_SCALE = 0.62;
        const FOCUS_SPECTER_HITBOX_SCALE = 0.48;
        const SURVIVOR_FOCUS_REGEN_MULT = 0.68;
        const SURVIVOR_COMBINED_FOCUS_DRAIN_MULT = 1.22;
        const SURVIVOR_COMBINED_FOCUS_SHRINK_SCALE = 0.925;
        let P_ACCEL = 3800;
        const P_FRICTION = 0.95;
        let P_MAX_SPEED = 720;

        // Cyberpunk Synthwave Palette
        const COLORS = ['#0b1028', '#141f3f', '#47337d', '#6aa8ff', '#ff5e8a'];
        
        // State
        let lastTime = performance.now();
        let currentFrameNow = lastTime;
        let score = 0;
        let comboCount = 0;
        let comboPeak = 0;
        let comboEventSerial = 0;
        let comboEventType = 'idle';
        let comboEventText = '';
        let comboEventAt = 0;
        let comboBurstPhase = 'idle';
        let comboBurstBaseCombo = 0;
        let comboBurstCount = 0;
        let comboBurstStartAt = 0;
        let comboBurstLastKillAt = 0;
        let comboBurstAbsorbAt = 0;
        let comboBurstSerial = 0;
        let comboBurstFocusTriggered = false;
        let comboBurstApplied = false;
        let comboFocusNoticeText = '';
        let comboFocusNoticeAt = 0;
        let comboFocusNoticeX = 0;
        let comboFocusNoticeY = 0;
        let gameState = 'GALAXY_SELECT';
        let titleAlpha = 1.0;
        let autoLaunch = false;
        let pauseState = 'MAIN'; // 'MAIN' or 'SETTINGS'
        let pauseSelection = 0;
        let pauseReturnState = 'PLAYING';
        let pausePowerupSelection = 0;
        let pausePowerupBarAnim = {
            mode: 'idle',
            startTime: 0,
            closeTime: 0,
            lastTableY: 0
        };
        let pauseMenuShipCursor = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            rot: 0,
            scale: 0.34,
            speed: 0,
            trail: [],
            trailEmitAcc: 0,
            settleBlend: 0,
            initialized: false,
            lastNow: 0,
            targetKey: '',
            routeKey: '',
            approachComplete: false
        };
        const PAUSE_CURSOR_SHIP = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            shipId: 'arrowhead',
            _renderLayoutCache: null
        };

        function resetPauseMenuShipCursor() {
            pauseMenuShipCursor.vx = 0;
            pauseMenuShipCursor.vy = 0;
            pauseMenuShipCursor.speed = 0;
            pauseMenuShipCursor.trail = [];
            pauseMenuShipCursor.trailEmitAcc = 0;
            pauseMenuShipCursor.settleBlend = 0;
            pauseMenuShipCursor.initialized = false;
            pauseMenuShipCursor.lastNow = 0;
            pauseMenuShipCursor.targetKey = '';
            pauseMenuShipCursor.routeKey = '';
            pauseMenuShipCursor.approachComplete = false;
            pauseMenuShipCursor.renderX = 0;
            pauseMenuShipCursor.renderY = 0;
            pauseMenuShipCursor.renderRot = 0;
            pauseMenuShipCursor.renderScale = pauseMenuShipCursor.scale || 0.34;
        }
        let settingsSelection = 0;
        let isMuted = false;
        let currentVolume = 0.4;
        let consoleOpen = false;
        let consoleInput = '';
        const CONSOLE_HISTORY_LIMIT = 40;
        const CONSOLE_NOTIFICATION_LIMIT = 5;
        let consoleHistory = [];
        let consoleHistoryIndex = -1;
        let consoleHistoryDraft = '';
        let consoleNotifications = [];
        let consoleReferenceLines = [];
        let queuedConsoleLevels = 0;
        let postResumeBombLockTimer = 0;
        let focusMeter = FOCUS_METER_MAX;
        let focusRegenDelay = 0;
        let focusLockoutTimer = 0;
        let focusMode = 'idle';
        let focusDriveIntensity = 0;
        let focusSpecterIntensity = 0;
        let hostileTimeScale = 1;
        let hostileTimeMs = performance.now();
        let restartLoadingSequence = false;
        let selectedGalaxyIndex = getDefaultGalaxySelectIndex();
        let currentGalaxyIndex = 0;
        let activeGameMode = 'campaign';
        let galaxySelectNotice = '';
        let galaxySelectNoticeTimer = 0;
        const RETURN_LOADING_DURATION = 0.9;
        let returnLoadingTransition = {
            active: false,
            startedAt: 0,
            color: '#6aa8ff'
        };
        const GALAXY_WARP_DURATION = 1.35;
        const GALAXY_WARP_HANDOFF_START = 0.76;
        const GALAXY_WARP_OUTRO_FADE = 0.56;
        let galaxyWarpTransition = {
            active: false,
            startedAt: 0,
            galaxyIndex: 0,
            fromX: 0,
            fromY: 0,
            fromRot: 0,
            fromScale: 0.24,
            toX: 0,
            toY: 0,
            color: '#6aa8ff',
            outroStartedAt: 0
        };
        let victoryTimer = 0;
        let scoreScreenTimer = 0;
        let runScoreBuildSelection = 0;
        const VICTORY_AUTO_ADVANCE_SECONDS = 2.6;
        const SCORE_AUTO_ADVANCE_SECONDS = 12.0;
        const RUN_COMPLETE_REWARD_SECONDS = 2.25;
        const RUN_COMPLETE_SLOWMO_SECONDS = 1.15;
        const RUN_COMPLETE_FADE_SECONDS = 0.85;
        const RUN_WAVE_LIMIT = 25;
        let lastRunSummary = null;
        let runStats = createEmptyRunStats();
        let runCompleteTransition = {
            active: false,
            elapsed: 0,
            defeatedBoss: null,
            slowmo: 0,
            fade: 0,
            color: '#6aa8ff'
        };
        const PAUSE_VOLUME_SCALE = 0.4;
        const LEVELUP_VOLUME_SCALE = 0.75;
        const PAUSE_VOLUME_PREVIEW_MS = 1000;
        const PAUSE_VOLUME_RETURN_FADE_SECONDS = 0.35;
        const POST_RESUME_BOMB_LOCK_SECONDS = 0.5;
        let pauseVolumePreviewTimeout = null;
        const SETTINGS_MENU_OPTION_COUNT = 7;

        const COMBO_SCORE_MULT_PER_KILL = 0.01;
        const COMBO_FOCUS_STEP = 10;
        const COMBO_FOCUS_DAMAGE_PER_STEP = 0.01;
        const COMBO_FOCUS_DAMAGE_CAP = 0.08;

        function getComboScoreMultiplier(comboValue = comboCount) {
            return 1 + Math.max(0, comboValue) * COMBO_SCORE_MULT_PER_KILL;
        }

        function getComboFocusDamageBonus(comboValue = comboCount) {
            const focusTier = Math.floor(Math.max(0, comboValue) / COMBO_FOCUS_STEP);
            return Math.min(COMBO_FOCUS_DAMAGE_CAP, focusTier * COMBO_FOCUS_DAMAGE_PER_STEP);
        }

        function getComboDamageMultiplier(comboValue = comboCount) {
            return 1 + getComboFocusDamageBonus(comboValue);
        }

        function getGalaxyDefinition(index = currentGalaxyIndex) {
            if (typeof GALAXY_DEFINITIONS !== 'undefined' && GALAXY_DEFINITIONS[index]) {
                return GALAXY_DEFINITIONS[index];
            }
            return {
                id: 'galaxy-1',
                name: 'BINARY QUASAR',
                title: 'BINARY QUASAR',
                available: true,
                desc: 'Current campaign sector.',
                colors: ['#dcecff', '#8fa7c9', '#ffffff']
            };
        }

        function getDefaultGalaxySelectIndex() {
            if (typeof GALAXY_DEFINITIONS === 'undefined') return 0;
            const index = GALAXY_DEFINITIONS.findIndex(galaxy => galaxy && galaxy.id === 'prism-wake');
            return index >= 0 ? index : 0;
        }

        function getActiveGameMode() {
            return activeGameMode || 'campaign';
        }

        function setActiveGameMode(mode = 'campaign') {
            activeGameMode = mode === 'survivor' ? 'survivor' : 'campaign';
        }

        function isSurvivorGalaxy(index = currentGalaxyIndex) {
            const galaxy = getGalaxyDefinition(index);
            return !!(galaxy && galaxy.mode === 'survivor');
        }

        function isSurvivorModeActive() {
            return activeGameMode === 'survivor';
        }

        function createEmptyRunStats() {
            return {
                galaxyIndex: 0,
                galaxyName: 'BINARY QUASAR',
                startedAt: 0,
                endedAt: 0,
                enemiesKilled: 0,
                bossesDefeated: 0,
                damageTaken: 0,
                bombsUsed: 0,
                focusDriveTime: 0,
                specterTime: 0,
                wavesCleared: 0
            };
        }

        function resetRunStats() {
            const galaxy = getGalaxyDefinition(currentGalaxyIndex);
            runStats = createEmptyRunStats();
            runStats.galaxyIndex = currentGalaxyIndex;
            runStats.galaxyName = galaxy.title || galaxy.name;
            runStats.startedAt = performance.now();
            runStats.endedAt = 0;
        }

        function getActiveRunWaveLimit() {
            if (typeof WaveManager !== 'undefined' && typeof WaveManager.getRunWaveLimit === 'function') {
                return WaveManager.getRunWaveLimit();
            }
            if (typeof getGalaxyRunWaveLimit === 'function') {
                return getGalaxyRunWaveLimit(currentGalaxyIndex);
            }
            return RUN_WAVE_LIMIT;
        }

        function recordRunEnemyKilled(enemy) {
            if (!runStats || (enemy && enemy.suppressComboReward)) return;
            runStats.enemiesKilled++;
        }

        function recordRunBossDefeated() {
            if (!runStats) return;
            runStats.bossesDefeated++;
            const runWaveLimit = getActiveRunWaveLimit();
            runStats.wavesCleared = Math.max(runStats.wavesCleared || 0, Math.min(runWaveLimit, WaveManager.currentWave || 0));
        }

        function recordRunDamageTaken(amount) {
            if (!runStats) return;
            runStats.damageTaken += Math.max(0, amount || 0);
        }

        function recordRunBombUsed() {
            if (!runStats) return;
            runStats.bombsUsed++;
        }

        function recordRunFocusTime(mode, dt) {
            if (!runStats || gameState !== 'PLAYING') return;
            if (mode === 'drive') runStats.focusDriveTime += Math.max(0, dt || 0);
            if (mode === 'specter') runStats.specterTime += Math.max(0, dt || 0);
        }

        function captureRunSummary(defeatedBoss = null) {
            const galaxy = getGalaxyDefinition(currentGalaxyIndex);
            const now = performance.now();
            runStats.endedAt = now;
            runStats.wavesCleared = getActiveRunWaveLimit();
            return {
                galaxyIndex: currentGalaxyIndex,
                galaxyName: galaxy.title || galaxy.name,
                galaxyDesc: galaxy.desc || '',
                finalBoss: defeatedBoss ? defeatedBoss.name : '',
                score,
                enemiesKilled: runStats.enemiesKilled || 0,
                bossesDefeated: runStats.bossesDefeated || 0,
                damageTaken: Math.round(runStats.damageTaken || 0),
                bombsUsed: runStats.bombsUsed || 0,
                highestCombo: comboPeak || 0,
                focusDriveTime: runStats.focusDriveTime || 0,
                specterTime: runStats.specterTime || 0,
                timeSurvived: Math.max(0, ((runStats.endedAt || now) - (runStats.startedAt || now)) / 1000),
                selectedShip: getSelectedShipConfig().name,
                level: player.level || 1,
                maxHp: Math.round(player.maxHp || 0),
                weapons: player.weapons.map((weapon, index) => ({
                    index,
                    name: weapon.name,
                    displayName: weapon.displayName || weapon.name,
                    cat: weapon.cat || 'weapon',
                    desc: weapon.desc || '',
                    glyph: weapon.glyph || '*',
                    icon: weapon.icon || '',
                    color: weapon.color || currentThemeColor,
                    rarity: weapon.rarity || ''
                }))
            };
        }

        function resetRunCompleteTransition() {
            runCompleteTransition = {
                active: false,
                elapsed: 0,
                defeatedBoss: null,
                slowmo: 0,
                fade: 0,
                color: currentThemeColor || '#6aa8ff'
            };
        }

        function isRunCompleteTransitionActive() {
            return !!(runCompleteTransition && runCompleteTransition.active);
        }

        function getRunCompletePhysicsScale() {
            if (!isRunCompleteTransitionActive()) return 1;
            const t = Math.max(0, Math.min(1, runCompleteTransition.slowmo || 0));
            return 1 - t * 0.74;
        }

        function getRunCompleteFadeAmount() {
            if (!isRunCompleteTransitionActive()) return 0;
            return Math.max(0, Math.min(1, runCompleteTransition.fade || 0));
        }

        function getRunCompleteSlowmoAmount() {
            if (!isRunCompleteTransitionActive()) return 0;
            return Math.max(0, Math.min(1, runCompleteTransition.slowmo || 0));
        }

        function smoothRunCompleteStep(t) {
            const n = Math.max(0, Math.min(1, t || 0));
            return n * n * (3 - n * 2);
        }

        function beginRunCompleteHandoff(defeatedBoss = null) {
            if (gameState === 'VICTORY' || gameState === 'RUN_SCORE' || gameState === 'GALAXY_SELECT') return;
            clearGameplayKeys();
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
            runCompleteTransition = {
                active: true,
                elapsed: 0,
                defeatedBoss: defeatedBoss ? { name: defeatedBoss.name } : null,
                slowmo: 0,
                fade: 0,
                color: (defeatedBoss && defeatedBoss.color) || currentThemeColor || '#6aa8ff'
            };
            waveSignalNotice = null;
            enemies = [];
            enemyBullets = [];
            comboProjectiles = [];
            bombProjectiles = [];
            bombBlastRings = [];
            boss = null;
            WaveManager.waveDelay = 999;
            WaveManager.interWaveDelayQueued = false;
            WaveManager.pendingFormationUnits = 0;
            gameState = 'PLAYING';
            pauseReturnState = 'PLAYING';
            applyCurrentVolume(0.82, 0.35);
        }

        function completeRunToScoreScreen() {
            const defeatedBoss = runCompleteTransition && runCompleteTransition.defeatedBoss
                ? runCompleteTransition.defeatedBoss
                : null;
            lastRunSummary = captureRunSummary(defeatedBoss);
            resetRunCompleteTransition();
            clearGameplayKeys();
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
            scoreScreenTimer = 0;
            victoryTimer = VICTORY_AUTO_ADVANCE_SECONDS;
            runScoreBuildSelection = 0;
            waveSignalNotice = null;
            enemies = [];
            enemyBullets = [];
            comboProjectiles = [];
            bombProjectiles = [];
            bombBlastRings = [];
            drops = [];
            xpOrbs = [];
            boss = null;
            WaveManager.waveDelay = 0;
            WaveManager.interWaveDelayQueued = false;
            WaveManager.pendingFormationUnits = 0;
            if (typeof updateFocusMusicPlaybackRate === 'function') updateFocusMusicPlaybackRate(1, 0.22);
            gameState = 'RUN_SCORE';
            applyCurrentVolume(0.82, 0.35);
        }

        function updateRunCompleteTransition(dt) {
            if (!isRunCompleteTransitionActive() || gameState !== 'PLAYING') return;
            const safeDt = Math.max(0, Math.min(0.05, dt || 0));
            runCompleteTransition.elapsed += safeDt;
            const slowStart = RUN_COMPLETE_REWARD_SECONDS;
            const fadeStart = RUN_COMPLETE_REWARD_SECONDS + RUN_COMPLETE_SLOWMO_SECONDS * 0.42;
            runCompleteTransition.slowmo = smoothRunCompleteStep((runCompleteTransition.elapsed - slowStart) / RUN_COMPLETE_SLOWMO_SECONDS);
            runCompleteTransition.fade = smoothRunCompleteStep((runCompleteTransition.elapsed - fadeStart) / RUN_COMPLETE_FADE_SECONDS);
            if (typeof updateFocusMusicPlaybackRate === 'function' && runCompleteTransition.slowmo > 0.01) {
                updateFocusMusicPlaybackRate(1 - runCompleteTransition.slowmo * 0.38, 0.14);
            }
            if (runCompleteTransition.elapsed >= fadeStart + RUN_COMPLETE_FADE_SECONDS) {
                completeRunToScoreScreen();
            }
        }

        function beginRunVictoryFlow(defeatedBoss = null) {
            if (gameState === 'VICTORY' || gameState === 'RUN_SCORE' || gameState === 'GALAXY_SELECT') return;
            clearGameplayKeys();
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
            lastRunSummary = captureRunSummary(defeatedBoss);
            victoryTimer = 0;
            scoreScreenTimer = 0;
            runScoreBuildSelection = 0;
            waveSignalNotice = null;
            enemies = [];
            enemyBullets = [];
            comboProjectiles = [];
            bombProjectiles = [];
            boss = null;
            WaveManager.waveDelay = 0;
            WaveManager.interWaveDelayQueued = false;
            WaveManager.pendingFormationUnits = 0;
            gameState = 'VICTORY';
            applyCurrentVolume(0.82, 0.35);
        }

        function advanceCampaignScreen() {
            clearGameplayKeys();
            if (gameState === 'VICTORY') {
                victoryTimer = VICTORY_AUTO_ADVANCE_SECONDS;
                scoreScreenTimer = 0;
                runScoreBuildSelection = 0;
                gameState = 'RUN_SCORE';
                return;
            }
            if (gameState === 'RUN_SCORE') {
                enterGalaxySelectScreen();
            }
        }

        function updateCampaignScreens(dt) {
            const safeDt = Math.max(0, Math.min(0.05, dt || 0));
            if (galaxySelectNoticeTimer > 0) {
                galaxySelectNoticeTimer = Math.max(0, galaxySelectNoticeTimer - safeDt);
                if (galaxySelectNoticeTimer <= 0) galaxySelectNotice = '';
            }
            if (gameState === 'RETURN_LOADING') {
                const elapsed = ((currentFrameNow || performance.now()) - (returnLoadingTransition.startedAt || 0)) / 1000;
                if (elapsed >= RETURN_LOADING_DURATION) completeReturnToGalaxySelectLoading();
            } else if (gameState === 'GALAXY_WARP') {
                const elapsed = ((currentFrameNow || performance.now()) - (galaxyWarpTransition.startedAt || 0)) / 1000;
                if (elapsed >= GALAXY_WARP_DURATION) completeGalaxyWarpTransition();
            } else if (gameState === 'VICTORY') {
                victoryTimer += safeDt;
                if (victoryTimer >= VICTORY_AUTO_ADVANCE_SECONDS) advanceCampaignScreen();
            } else if (gameState === 'RUN_SCORE') {
                scoreScreenTimer += safeDt;
                if (scoreScreenTimer >= SCORE_AUTO_ADVANCE_SECONDS) advanceCampaignScreen();
            }
        }

        function beginReturnToGalaxySelectLoading() {
            const now = currentFrameNow || performance.now();
            clearGameplayKeys();
            clearPauseVolumePreview();
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
            returnLoadingTransition = {
                active: true,
                startedAt: now,
                color: currentThemeColor || '#6aa8ff'
            };
            gameState = 'RETURN_LOADING';
            pauseReturnState = 'GALAXY_SELECT';
            pauseState = 'MAIN';
            pauseSelection = 0;
            pausePowerupSelection = 0;
            pausePowerupBarAnim.mode = 'idle';
            pausePowerupBarAnim.startTime = 0;
            pausePowerupBarAnim.closeTime = 0;
            resetPauseMenuShipCursor();
            applyCurrentVolume(0, 0.35);
        }

        function completeReturnToGalaxySelectLoading() {
            if (!returnLoadingTransition.active && gameState !== 'RETURN_LOADING') return;
            returnLoadingTransition.active = false;
            if (typeof prepareRunStateForLaunch === 'function') prepareRunStateForLaunch();
            enterGalaxySelectScreen();
        }

        function enterGalaxySelectScreen() {
            clearGameplayKeys();
            if (typeof endSurvivorRun === 'function') endSurvivorRun({ silent: true });
            setActiveGameMode('campaign');
            resetRunCompleteTransition();
            selectedGalaxyIndex = Math.max(0, Math.min((typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS.length : 1) - 1, selectedGalaxyIndex));
            gameState = 'GALAXY_SELECT';
            pauseState = 'MAIN';
            pauseSelection = 0;
            pausePowerupSelection = 0;
            pausePowerupBarAnim.mode = 'idle';
            resetPauseMenuShipCursor();
            stopMusic();
            applyCurrentVolume();
            if (typeof updateFocusMusicPlaybackRate === 'function') updateFocusMusicPlaybackRate(1, 0.08);
        }

        function selectHighlightedGalaxy() {
            const galaxy = getGalaxyDefinition(selectedGalaxyIndex);
            if (!galaxy.available) {
                galaxySelectNotice = `${galaxy.title || galaxy.name} LOCKED`;
                galaxySelectNoticeTimer = 1.4;
                return false;
            }
            currentGalaxyIndex = selectedGalaxyIndex;
            galaxySelectNotice = '';
            galaxySelectNoticeTimer = 0;
            clearGameplayKeys();
            beginGalaxyWarpTransition(selectedGalaxyIndex);
            titleAlpha = 1;
            return true;
        }

        function beginGalaxyWarpTransition(galaxyIndex = selectedGalaxyIndex) {
            const galaxy = getGalaxyDefinition(galaxyIndex);
            const now = currentFrameNow || performance.now();
            const slot = typeof getGalaxySelectSlot === 'function'
                ? getGalaxySelectSlot(galaxyIndex)
                : { x: width / 2, y: height * 0.35 };
            const fromX = pauseMenuShipCursor && pauseMenuShipCursor.initialized
                ? (Number.isFinite(pauseMenuShipCursor.renderX) ? pauseMenuShipCursor.renderX : pauseMenuShipCursor.x)
                : slot.x - 72;
            const fromY = pauseMenuShipCursor && pauseMenuShipCursor.initialized
                ? (Number.isFinite(pauseMenuShipCursor.renderY) ? pauseMenuShipCursor.renderY : pauseMenuShipCursor.y)
                : slot.y + 12;
            const fromRot = pauseMenuShipCursor && pauseMenuShipCursor.initialized && Number.isFinite(pauseMenuShipCursor.renderRot)
                ? pauseMenuShipCursor.renderRot
                : Math.atan2(slot.y - fromY, slot.x - fromX) + Math.PI / 2;
            const fromScale = pauseMenuShipCursor && pauseMenuShipCursor.initialized && Number.isFinite(pauseMenuShipCursor.renderScale)
                ? pauseMenuShipCursor.renderScale
                : (pauseMenuShipCursor.scale || 0.24);
            galaxyWarpTransition = {
                active: true,
                startedAt: now,
                galaxyIndex,
                fromX,
                fromY,
                fromRot,
                fromScale,
                toX: slot.x,
                toY: slot.y,
                color: (galaxy.colors && (galaxy.colors[1] || galaxy.colors[0])) || currentThemeColor,
                outroStartedAt: 0
            };
            if (typeof prepareGalaxyWarpMenuSnapshot === 'function') {
                prepareGalaxyWarpMenuSnapshot(now, galaxyIndex);
                galaxyWarpTransition.startedAt = performance.now();
            }
            gameState = 'GALAXY_WARP';
            clearPauseVolumePreview();
            applyCurrentVolume();
        }

        function completeGalaxyWarpTransition() {
            if (!galaxyWarpTransition.active) return;
            galaxyWarpTransition.active = false;
            galaxyWarpTransition.outroStartedAt = currentFrameNow || performance.now();
            resetPauseMenuShipCursor();
            clearGameplayKeys();
            titleAlpha = 0;
            selectShip(shipSelectIndex, true);
            const galaxy = getGalaxyDefinition(currentGalaxyIndex);
            if (galaxy && galaxy.mode === 'survivor') {
                if (typeof beginSurvivorRun === 'function') {
                    beginSurvivorRun();
                } else if (typeof beginLaunchSequence === 'function') {
                    beginLaunchSequence();
                } else {
                    gameState = 'PLAYING';
                }
                return;
            }
            if (typeof beginLaunchSequence === 'function') {
                beginLaunchSequence();
            } else {
                gameState = 'SHIP_SELECT';
            }
        }

        function isPausePowerupMenuAvailable() {
            return pauseReturnState === 'PLAYING' && player && player.weapons && player.weapons.length > 0;
        }

        function getPauseMenuOptions() {
            if (pauseReturnState === 'GALAXY_SELECT') {
                return ['RESUME', 'VOLUME', 'SETTINGS', document.fullscreenElement ? 'EXIT FULLSCREEN' : 'FULLSCREEN', 'EXIT'];
            }
            return ['RESUME', 'RESTART', 'VOLUME', 'SETTINGS', document.fullscreenElement ? 'EXIT FULLSCREEN' : 'FULLSCREEN', 'EXIT'];
        }

        function addScore(baseScore, useCombo = true) {
            const amount = Math.max(0, baseScore || 0);
            const multiplier = useCombo ? getComboScoreMultiplier() : 1;
            score += Math.round(amount * multiplier);
        }

        function markComboEvent(type, text) {
            comboEventSerial++;
            comboEventType = type;
            comboEventText = text || '';
            comboEventAt = currentFrameNow || performance.now();
        }

        const COMBO_BURST_LINK_MS = 420;
        const COMBO_BURST_SINGLE_DELAY_MS = 90;
        const COMBO_BURST_MULTI_HOLD_MS = 460;
        const COMBO_BURST_ABSORB_MS = 360;
        const COMBO_BURST_APPLY_T = 0.48;
        const COMBO_BURST_POPUP_MIN = 5;

        function resetComboBurstState() {
            comboBurstPhase = 'idle';
            comboBurstBaseCombo = comboCount || 0;
            comboBurstCount = 0;
            comboBurstStartAt = 0;
            comboBurstLastKillAt = 0;
            comboBurstAbsorbAt = 0;
            comboBurstFocusTriggered = false;
            comboBurstApplied = false;
            comboBurstSerial++;
        }

        function queueComboBurstKill(previousCombo, focusTriggered = false) {
            const now = currentFrameNow || performance.now();
            const withinLinkWindow = (now - comboBurstLastKillAt) <= COMBO_BURST_LINK_MS;
            const canExtend = withinLinkWindow && (comboBurstPhase === 'building' || (comboBurstPhase === 'absorbing' && !comboBurstApplied));
            if (!canExtend) {
                comboBurstPhase = 'building';
                comboBurstBaseCombo = Math.max(0, previousCombo || 0);
                comboBurstCount = 0;
                comboBurstStartAt = now;
                comboBurstFocusTriggered = false;
                comboBurstApplied = false;
            } else if (comboBurstPhase === 'absorbing') {
                comboBurstPhase = 'building';
                comboBurstAbsorbAt = 0;
                comboBurstApplied = false;
            }
            comboBurstCount++;
            comboBurstLastKillAt = now;
            comboBurstFocusTriggered = comboBurstFocusTriggered || !!focusTriggered;
            comboBurstSerial++;
        }

        function updateComboBurstState(now = currentFrameNow || performance.now()) {
            if (comboBurstPhase === 'building') {
                const holdMs = comboBurstCount > 1 ? COMBO_BURST_MULTI_HOLD_MS : COMBO_BURST_SINGLE_DELAY_MS;
                if (now - comboBurstLastKillAt >= holdMs) {
                    comboBurstPhase = 'absorbing';
                    comboBurstAbsorbAt = now;
                    comboBurstApplied = false;
                    comboBurstSerial++;
                }
            }

            if (comboBurstPhase === 'absorbing') {
                const absorbT = Math.max(0, Math.min(1, (now - comboBurstAbsorbAt) / COMBO_BURST_ABSORB_MS));
                if (!comboBurstApplied && absorbT >= COMBO_BURST_APPLY_T) {
                    comboBurstApplied = true;
                    const eventText = comboBurstCount >= COMBO_BURST_POPUP_MIN
                        ? `x${comboBurstCount}`
                        : (comboBurstCount > 1 ? `+${comboBurstCount}` : '+1');
                    markComboEvent(comboBurstFocusTriggered ? 'focus' : 'kill', eventText);
                    comboBurstSerial++;
                }
                if (absorbT >= 1) {
                    comboBurstPhase = 'idle';
                    comboBurstBaseCombo = comboCount || 0;
                    comboBurstCount = 0;
                    comboBurstFocusTriggered = false;
                    comboBurstApplied = false;
                    comboBurstSerial++;
                }
            }
        }

        function getComboHudDisplayCount(now = currentFrameNow || performance.now()) {
            updateComboBurstState(now);
            if (comboBurstPhase === 'building') return comboBurstBaseCombo;
            if (comboBurstPhase === 'absorbing') return comboBurstApplied ? comboCount : comboBurstBaseCombo;
            return comboCount;
        }

        function triggerComboFocusNotice(focusBonus) {
            comboFocusNoticeText = `DMG +${Math.round(Math.max(0, focusBonus) * 100)}%`;
            comboFocusNoticeAt = currentFrameNow || performance.now();
            const px = player && Number.isFinite(player.x) ? player.x : width / 2;
            const py = player && Number.isFinite(player.y) ? player.y : height * 0.72;
            const bottomLimit = typeof getGameplayBottomLimit === 'function' ? getGameplayBottomLimit(86) : height - 130;
            comboFocusNoticeX = Math.max(86, Math.min(width - 86, px + 68));
            comboFocusNoticeY = Math.max(92, Math.min(bottomLimit, py - 62));
        }

        function registerComboKill(enemy, baseScore = 150) {
            recordRunEnemyKilled(enemy);
            if (!(enemy && enemy.suppressComboReward)) {
                const previousFocusBonus = getComboFocusDamageBonus();
                const previousCombo = comboCount;
                comboCount++;
                comboPeak = Math.max(comboPeak, comboCount);
                const nextFocusBonus = getComboFocusDamageBonus();
                queueComboBurstKill(previousCombo, nextFocusBonus > previousFocusBonus);
            }
            addScore(baseScore, true);
        }

        function getBossComboStageCount(bossObj) {
            if (!bossObj) return 1;
            if (bossObj.isEclipseWarden) return 3;
            if (bossObj.isGlitch) return 2;
            if (bossObj.name === 'GHOST SIGNAL' || bossObj.name === 'OVERHEATING FIREWALL') return Math.max(2, bossObj.stage || 1);
            return Math.max(1, bossObj.stage || 1);
        }

        function registerBossComboBreak(bossObj, baseScore = 20000) {
            const heldCombo = comboCount;
            const stageCount = getBossComboStageCount(bossObj);
            const hpWeight = Math.sqrt(Math.max(1, bossObj && bossObj.maxHp ? bossObj.maxHp : 1000)) / 11;
            const streakEcho = Math.sqrt(Math.max(0, heldCombo)) * (1.1 + stageCount * 0.22);
            const echoGain = Math.max(stageCount * 3, Math.round(hpWeight + streakEcho));
            comboCount += echoGain;
            comboPeak = Math.max(comboPeak, comboCount);
            resetComboBurstState();
            markComboEvent('boss', `ECHO +${echoGain}`);

            const phaseBonus = Math.min(baseScore * 0.35, baseScore * 0.055 * stageCount);
            const streakBonus = Math.min(baseScore * 0.45, baseScore * Math.sqrt(Math.max(0, heldCombo)) * 0.006);
            addScore(baseScore + phaseBonus + streakBonus, true);
        }

        function resetComboOnPlayerDamage() {
            if (comboCount <= 0) return;
            comboCount = 0;
            resetComboBurstState();
            markComboEvent('break', 'CHAIN BREAK');
        }
        
        function clearPauseVolumePreview() {
            if (!pauseVolumePreviewTimeout) return;
            clearTimeout(pauseVolumePreviewTimeout);
            pauseVolumePreviewTimeout = null;
        }

        function setMasterVolume(targetVolume, rampSeconds = 0) {
            const now = audioCtx.currentTime;
            gainNode.gain.cancelScheduledValues(now);
            if (rampSeconds > 0) {
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.linearRampToValueAtTime(targetVolume, now + rampSeconds);
            } else {
                gainNode.gain.setValueAtTime(targetVolume, now);
            }
        }

        function applyCurrentVolume(scale = 1, rampSeconds = 0) {
            setMasterVolume(isMuted ? 0 : currentVolume * scale, rampSeconds);
        }

        function smoothFocusStep(current, target, dt, seconds) {
            const duration = Math.max(0.001, seconds || 0.001);
            const blend = 1 - Math.exp(-Math.max(0, dt) / duration);
            return current + (target - current) * blend;
        }

        function clampFocusTuning(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function getFocusModifierValue(key, fallback = 0) {
            if (typeof player === 'undefined' || !player || !player.modifiers) return fallback;
            const value = player.modifiers[key];
            return Number.isFinite(value) ? value : fallback;
        }

        function getFocusMeterMax() {
            return FOCUS_METER_MAX * (1 + clampFocusTuning(getFocusModifierValue('focusMax', 0), 0, 1.5));
        }

        function getFocusDriveDrainPerSec() {
            return FOCUS_DRIVE_DRAIN_PER_SEC * clampFocusTuning(getFocusModifierValue('focusDriveDrain', 1), 0.45, 1);
        }

        function getFocusSpecterDrainPerSec() {
            return FOCUS_SPECTER_DRAIN_PER_SEC * clampFocusTuning(getFocusModifierValue('focusSpecterDrain', 1), 0.45, 1);
        }

        function getFocusRegenPerSec() {
            const survivorFocus = typeof isSurvivorModeActive === 'function' && isSurvivorModeActive();
            const modeMult = survivorFocus ? SURVIVOR_FOCUS_REGEN_MULT : 1;
            return FOCUS_REGEN_PER_SEC * modeMult * (1 + clampFocusTuning(getFocusModifierValue('focusRegen', 0), 0, 2.25));
        }

        function getFocusRegenDelaySeconds() {
            return FOCUS_REGEN_DELAY * clampFocusTuning(getFocusModifierValue('focusRegenDelay', 1), 0.35, 1);
        }

        function getFocusEmptyLockoutSeconds() {
            return FOCUS_EMPTY_LOCKOUT * clampFocusTuning(getFocusModifierValue('focusLockout', 1), 0.35, 1);
        }

        function getFocusEliteDropAmount() {
            return FOCUS_ELITE_DROP_AMOUNT * (1 + clampFocusTuning(getFocusModifierValue('focusDrop', 0), 0, 1.25));
        }

        function getFocusDriveHostileTimeScale() {
            const slowBonus = clampFocusTuning(getFocusModifierValue('focusDriveSlow', 0), 0, 0.12);
            return clampFocusTuning(FOCUS_DRIVE_HOSTILE_TIME_SCALE - slowBonus, 0.18, FOCUS_DRIVE_HOSTILE_TIME_SCALE);
        }

        function getFocusDriveFadeInSeconds() {
            return FOCUS_DRIVE_FADE_IN / (1 + clampFocusTuning(getFocusModifierValue('focusDriveTransition', 0), 0, 1.5));
        }

        function getFocusDriveFadeOutSeconds() {
            return FOCUS_DRIVE_FADE_OUT / (1 + clampFocusTuning(getFocusModifierValue('focusDriveTransition', 0), 0, 1.5));
        }

        function getFocusSpecterFadeInSeconds() {
            return FOCUS_SPECTER_FADE_IN / (1 + clampFocusTuning(getFocusModifierValue('focusSpecterTransition', 0), 0, 1.5));
        }

        function getFocusSpecterFadeOutSeconds() {
            return FOCUS_SPECTER_FADE_OUT / (1 + clampFocusTuning(getFocusModifierValue('focusSpecterTransition', 0), 0, 1.5));
        }

        function getFocusSpecterVisualTargetScale() {
            const shrinkBonus = clampFocusTuning(getFocusModifierValue('focusSpecterShrink', 0), 0, 0.16);
            return clampFocusTuning(FOCUS_SPECTER_VISUAL_SCALE - shrinkBonus, 0.46, FOCUS_SPECTER_VISUAL_SCALE);
        }

        function getFocusSpecterHitboxTargetScale() {
            const shrinkBonus = clampFocusTuning(getFocusModifierValue('focusSpecterShrink', 0), 0, 0.16);
            return clampFocusTuning(FOCUS_SPECTER_HITBOX_SCALE - shrinkBonus * 0.88, 0.34, FOCUS_SPECTER_HITBOX_SCALE);
        }

        function isBossIntroActive() {
            return !!(typeof boss !== 'undefined' && boss && boss.phase === 'INTRO');
        }

        function areFocusAbilitiesSuppressed() {
            return isBossIntroActive() || isRunCompleteTransitionActive();
        }

        function canUseFocusAbilitiesNow() {
            return gameState === 'PLAYING'
                && !(bossCinematic && bossCinematic.paused)
                && !areFocusAbilitiesSuppressed();
        }

        function resetFocusAbilities() {
            focusMeter = getFocusMeterMax();
            focusRegenDelay = 0;
            focusLockoutTimer = 0;
            focusMode = 'idle';
            focusDriveIntensity = 0;
            focusSpecterIntensity = 0;
            hostileTimeScale = 1;
            hostileTimeMs = currentFrameNow || performance.now();
            if (typeof updateFocusMusicPlaybackRate === 'function') updateFocusMusicPlaybackRate(1, 0.08);
        }

        function getFocusDriveRenderIntensity() {
            if (areFocusAbilitiesSuppressed()) return 0;
            return Math.max(0, Math.min(1, focusDriveIntensity || 0));
        }

        function getSpecterRenderIntensity() {
            if (areFocusAbilitiesSuppressed()) return 0;
            return Math.max(0, Math.min(1, focusSpecterIntensity || 0));
        }

        function getHostileTimeScale() {
            if (areFocusAbilitiesSuppressed()) return 1;
            const minScale = getFocusDriveHostileTimeScale();
            return Math.max(minScale, Math.min(1, hostileTimeScale || 1));
        }

        function getHostileDt(dt) {
            return dt * getHostileTimeScale();
        }

        function getPlayerSpecterVisualScale() {
            const survivorFocus = typeof isSurvivorModeActive === 'function' && isSurvivorModeActive();
            const targetScale = survivorFocus ? SURVIVOR_COMBINED_FOCUS_SHRINK_SCALE : getFocusSpecterVisualTargetScale();
            return 1 - (1 - targetScale) * getSpecterRenderIntensity();
        }

        function getPlayerSpecterHitboxScale() {
            const survivorFocus = typeof isSurvivorModeActive === 'function' && isSurvivorModeActive();
            const targetScale = survivorFocus ? SURVIVOR_COMBINED_FOCUS_SHRINK_SCALE : getFocusSpecterHitboxTargetScale();
            return 1 - (1 - targetScale) * getSpecterRenderIntensity();
        }

        function updateFocusAbilities(dt, canUseAbilities = false) {
            const safeDt = Math.max(0, Math.min(0.05, dt || 0));
            const godModeFocus = !!(typeof player !== 'undefined' && player && player.godMode);
            const focusMax = getFocusMeterMax();
            focusMeter = Math.min(focusMeter, focusMax);
            if (godModeFocus) {
                focusMeter = focusMax;
                focusRegenDelay = 0;
                focusLockoutTimer = 0;
            }
            if (focusLockoutTimer > 0) focusLockoutTimer = Math.max(0, focusLockoutTimer - safeDt);

            const inputKeys = typeof keys !== 'undefined' ? keys : null;
            const survivorFocus = typeof isSurvivorModeActive === 'function' && isSurvivorModeActive();
            const combinedHeld = !!(survivorFocus && canUseAbilities && inputKeys && inputKeys.shift);
            const driveHeld = !!(canUseAbilities && inputKeys && (survivorFocus ? inputKeys.shift : inputKeys.shift));
            const specterHeld = !!(canUseAbilities && inputKeys && (survivorFocus ? inputKeys.shift : (inputKeys.arrowdown && !driveHeld)));
            const canSpendFocus = canUseAbilities && focusLockoutTimer <= 0 && focusMeter > 0;
            let wantDrive = canSpendFocus && driveHeld;
            let wantSpecter = canSpendFocus && specterHeld;
            const drain = wantDrive
                ? getFocusDriveDrainPerSec() * (combinedHeld ? SURVIVOR_COMBINED_FOCUS_DRAIN_MULT : 1)
                : (wantSpecter ? getFocusSpecterDrainPerSec() : 0);

            if (drain > 0) {
                if (godModeFocus) {
                    focusMeter = focusMax;
                    focusRegenDelay = 0;
                } else {
                    focusMeter = Math.max(0, focusMeter - drain * safeDt);
                    focusRegenDelay = getFocusRegenDelaySeconds();
                    if (focusMeter <= 0) {
                        focusLockoutTimer = getFocusEmptyLockoutSeconds();
                        wantDrive = false;
                        wantSpecter = false;
                    }
                }
            } else {
                if (focusRegenDelay > 0) {
                    focusRegenDelay = Math.max(0, focusRegenDelay - safeDt);
                } else if (canUseAbilities) {
                    focusMeter = Math.min(focusMax, focusMeter + getFocusRegenPerSec() * safeDt);
                }
            }

            const driveTarget = wantDrive ? 1 : 0;
            const specterTarget = wantSpecter ? 1 : 0;
            if (wantDrive) recordRunFocusTime('drive', safeDt);
            if (wantSpecter) recordRunFocusTime('specter', safeDt);
            focusDriveIntensity = smoothFocusStep(
                focusDriveIntensity,
                driveTarget,
                safeDt,
                driveTarget > focusDriveIntensity ? getFocusDriveFadeInSeconds() : getFocusDriveFadeOutSeconds()
            );
            focusSpecterIntensity = smoothFocusStep(
                focusSpecterIntensity,
                specterTarget,
                safeDt,
                specterTarget > focusSpecterIntensity ? getFocusSpecterFadeInSeconds() : getFocusSpecterFadeOutSeconds()
            );
            focusMode = wantDrive && wantSpecter ? 'prism' : (wantDrive ? 'drive' : (wantSpecter ? 'specter' : 'idle'));
            const driveTimeScale = getFocusDriveHostileTimeScale();
            hostileTimeScale = 1 - getFocusDriveRenderIntensity() * (1 - driveTimeScale);
            hostileTimeMs += safeDt * 1000 * getHostileTimeScale();

            if (typeof updateFocusMusicPlaybackRate === 'function') {
                const driveMusic = getFocusDriveRenderIntensity();
                const specterMusic = getSpecterRenderIntensity() * (1 - driveMusic);
                const musicRate = 1
                    - driveMusic * (1 - FOCUS_DRIVE_MUSIC_RATE)
                    + specterMusic * (FOCUS_SPECTER_MUSIC_RATE - 1);
                updateFocusMusicPlaybackRate(musicRate, 0.12);
            }
        }

        function previewPauseVolumeAdjustment() {
            clearPauseVolumePreview();
            applyCurrentVolume();
            if (isMuted || gameState !== 'PAUSED') return;
            pauseVolumePreviewTimeout = setTimeout(() => {
                pauseVolumePreviewTimeout = null;
                if (gameState === 'PAUSED' && !isMuted) {
                    applyCurrentVolume(PAUSE_VOLUME_SCALE, PAUSE_VOLUME_RETURN_FADE_SECONDS);
                }
            }, PAUSE_VOLUME_PREVIEW_MS);
        }

        function enterPauseMode() {
            if (gameState !== 'PLAYING' && gameState !== 'GALAXY_SELECT') return;
            if (gameState === 'PLAYING' && isBossIntroActive()) return;
            clearPauseVolumePreview();
            pauseReturnState = gameState;
            gameState = 'PAUSED';
            pauseState = 'MAIN';
            pauseSelection = 0;
            pausePowerupSelection = 0;
            pausePowerupBarAnim.mode = isPausePowerupMenuAvailable() ? 'opening' : 'idle';
            pausePowerupBarAnim.startTime = performance.now();
            pausePowerupBarAnim.closeTime = 0;
            resetPauseMenuShipCursor();
            applyCurrentVolume(PAUSE_VOLUME_SCALE);
        }

        function resumeFromPauseMode() {
            if (gameState !== 'PAUSED') return;
            clearPauseVolumePreview();
            const returnState = pauseReturnState || 'PLAYING';
            gameState = returnState;
            pausePowerupBarAnim.mode = returnState === 'PLAYING' && player.weapons.length > 0 ? 'closing' : 'idle';
            pausePowerupBarAnim.closeTime = performance.now();
            postResumeBombLockTimer = returnState === 'PLAYING' ? POST_RESUME_BOMB_LOCK_SECONDS : 0;
            keys[' '] = false;
            keys.arrowdown = false;
            keys.shift = false;
            resetPauseMenuShipCursor();
            applyCurrentVolume();
        }

        function applyFpsVisibility() {
            fpsElement.style.display = showFpsCounter ? 'flex' : 'none';
        }

        function applyStatsVisibility() {
            if (!statsPanel) return;
            statsPanel.style.display = showStatsPanel ? 'block' : 'none';
        }

        function snapSpriteCoord(value) {
            if (renderStyleMode === 0) return value;
            return Math.round(value);
        }

        function truncateSpriteCoord(value) {
            return value | 0;
        }

        function quantizeGlyphCoord(value) {
            if (renderStyleMode === 2) return Math.round(value);
            return value;
        }
        
        // Screen Shake
        let shake = 0;
        function addShake(amt) { 
            if (gameState === 'GAMEOVER') return;
            shake = Math.min(shake + amt, 25); 
        }
        let wobble = 0;
        // Sprite and wave data are loaded from js/sprites.js and js/waves.js.
