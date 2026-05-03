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
        let crtFilterEnabled = false;
        let subpixelRenderEnabled = false;
        const SUBPIXEL_RENDER_TARGETS = Object.freeze({
            PLAYER_SHIP: 'playerShip',
            ENEMY_BULLET: 'enemyBullet',
            PLAYER_PROJECTILE: 'playerProjectile',
            FIELD_PARTICLE: 'fieldParticle'
        });
        
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

        // FPS Counter & Benchmark State
        let frameCount = 0;
        let renderFrameCount = 0;
        let fpsLastTime = performance.now();
        let currentFps = 0;
        
        let benchFrames = 0;
        let benchStartTime = 0;
        let fpsCapped = false;
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
        let comboFocusNoticeText = '';
        let comboFocusNoticeAt = 0;
        let comboFocusNoticeX = 0;
        let comboFocusNoticeY = 0;
        let gameState = 'START';
        let titleAlpha = 1.0;
        let autoLaunch = false;
        let pauseState = 'MAIN'; // 'MAIN' or 'SETTINGS'
        let pauseSelection = 0;
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
        let restartLoadingSequence = false;
        const PAUSE_VOLUME_SCALE = 0.4;
        const LEVELUP_VOLUME_SCALE = 0.75;
        const PAUSE_VOLUME_PREVIEW_MS = 1000;
        const PAUSE_VOLUME_RETURN_FADE_SECONDS = 0.35;
        const POST_RESUME_BOMB_LOCK_SECONDS = 0.5;
        let pauseVolumePreviewTimeout = null;
        const SETTINGS_MENU_OPTION_COUNT = 8;

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
            if (!(enemy && enemy.suppressComboReward)) {
                const previousFocusBonus = getComboFocusDamageBonus();
                comboCount++;
                comboPeak = Math.max(comboPeak, comboCount);
                const nextFocusBonus = getComboFocusDamageBonus();
                if (nextFocusBonus > previousFocusBonus) {
                    markComboEvent('focus', '');
                } else {
                    markComboEvent('kill', '+1');
                }
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
            markComboEvent('boss', `ECHO +${echoGain}`);

            const phaseBonus = Math.min(baseScore * 0.35, baseScore * 0.055 * stageCount);
            const streakBonus = Math.min(baseScore * 0.45, baseScore * Math.sqrt(Math.max(0, heldCombo)) * 0.006);
            addScore(baseScore + phaseBonus + streakBonus, true);
        }

        function resetComboOnPlayerDamage() {
            if (comboCount <= 0) return;
            comboCount = 0;
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
            if (gameState !== 'PLAYING') return;
            clearPauseVolumePreview();
            gameState = 'PAUSED';
            pauseState = 'MAIN';
            pauseSelection = 0;
            pausePowerupSelection = 0;
            pausePowerupBarAnim.mode = 'opening';
            pausePowerupBarAnim.startTime = performance.now();
            pausePowerupBarAnim.closeTime = 0;
            resetPauseMenuShipCursor();
            applyCurrentVolume(PAUSE_VOLUME_SCALE);
        }

        function resumeFromPauseMode() {
            if (gameState !== 'PAUSED') return;
            clearPauseVolumePreview();
            gameState = 'PLAYING';
            pausePowerupBarAnim.mode = 'closing';
            pausePowerupBarAnim.closeTime = performance.now();
            postResumeBombLockTimer = POST_RESUME_BOMB_LOCK_SECONDS;
            keys[' '] = false;
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

        function shouldUseSubpixelRender(category) {
            return !!(subpixelRenderEnabled && category);
        }

        function snapSpriteCoord(value, subpixelCategory = null) {
            if (shouldUseSubpixelRender(subpixelCategory)) return value;
            if (renderStyleMode === 0) return value;
            return Math.round(value);
        }

        function truncateSpriteCoord(value, subpixelCategory = null) {
            if (shouldUseSubpixelRender(subpixelCategory)) return value;
            return value | 0;
        }

        function quantizeGlyphCoord(value, subpixelCategory = null) {
            if (shouldUseSubpixelRender(subpixelCategory)) return value;
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
