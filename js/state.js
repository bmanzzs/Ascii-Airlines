        // Theme, runtime state, pause helpers, FPS state, and physics constants.
        // UI Themes
        const themes = ['CYBERPUNK', 'MATRIX GREEN', 'AMBER', 'WHITE PHOSPHOR'];
        let currentThemeIndex = 0;
        let currentThemeColor = '#00ffff';
        let currentBgColor = '#050510';
        let userFpsCap = false;
        let showFpsCounter = true;
        const RENDER_STYLE_NAMES = ['SOFT', 'HYBRID', 'CRISP'];
        let renderStyleMode = 1;
        let glowEnabled = true;
        let crtFilterEnabled = false;
        
        function applyTheme() {
            const root = document.documentElement;
            let color, bg, fpsColor, shadow;
            if (currentThemeIndex === 0) { 
                color = '#00ffff'; bg = '#050510'; fpsColor = '#888888'; shadow = '0 0 5px #00ffff'; currentBgColor = '#050510'; 
            } else if (currentThemeIndex === 1) { 
                color = '#00ff00'; bg = '#001100'; fpsColor = '#00aa00'; shadow = '0 0 5px #00ff00'; currentBgColor = '#001100'; 
            } else if (currentThemeIndex === 2) { 
                color = '#ffb000'; bg = '#1a0b00'; fpsColor = '#aa7700'; shadow = '0 0 5px #ffb000'; currentBgColor = '#1a0b00'; 
            } else if (currentThemeIndex === 3) { 
                color = '#ffffff'; bg = '#000000'; fpsColor = '#aaaaaa'; shadow = '0 0 4px #ffffff, 0 0 10px rgba(255,255,255,0.45)'; currentBgColor = '#000000'; 
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
        let savedRenderStyle = sessionStorage.getItem('ascii_render_style');
        if (savedRenderStyle !== null) {
            const parsedRenderStyle = parseInt(savedRenderStyle, 10);
            if (!Number.isNaN(parsedRenderStyle)) {
                renderStyleMode = Math.max(0, Math.min(RENDER_STYLE_NAMES.length - 1, parsedRenderStyle));
            }
        }
        applyFpsVisibility();

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
        const SPRING_CONST = 0.018;
        const DAMPING = 0.912;
        const CELL_SIZE = 22; 
        const SCROLL_SPEED = 50; 
        const HASH_SIZE = 80;
        let P_ACCEL = 3800;
        const P_FRICTION = 0.95;
        let P_MAX_SPEED = 720;

        // Cyberpunk Synthwave Palette
        const COLORS = ['#0a0a2a', '#1a1a4a', '#3a0088', '#00d0ff', '#ff00ff'];
        
        // State
        let lastTime = performance.now();
        let currentFrameNow = lastTime;
        let score = 0;
        let gameState = 'START';
        let titleAlpha = 1.0;
        let autoLaunch = false;
        let pauseState = 'MAIN'; // 'MAIN' or 'SETTINGS'
        let pauseSelection = 0;
        let pausePowerupSelection = 0;
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
            applyCurrentVolume(PAUSE_VOLUME_SCALE);
        }

        function resumeFromPauseMode() {
            if (gameState !== 'PAUSED') return;
            clearPauseVolumePreview();
            gameState = 'PLAYING';
            postResumeBombLockTimer = POST_RESUME_BOMB_LOCK_SECONDS;
            keys[' '] = false;
            applyCurrentVolume();
        }

        function applyFpsVisibility() {
            fpsElement.style.display = showFpsCounter ? 'flex' : 'none';
        }

        function snapSpriteCoord(value) {
            if (renderStyleMode === 0) return value;
            return Math.round(value);
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
