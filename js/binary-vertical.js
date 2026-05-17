        // Binary Quasar / Bullet Route vertical shmup owner shell.
        // WaveManager, wave definitions, route helpers, and spawn logic remain in waves.js.
        const BINARY_VERTICAL_MODE_ID = 'campaign';

        function getBinaryVerticalNow() {
            return currentFrameNow || (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
        }

        function createBinaryVerticalState() {
            return {
                active: false,
                startedAt: 0,
                galaxyIndex: -1,
                routeMode: BINARY_VERTICAL_MODE_ID,
                lastResetAt: 0
            };
        }

        let binaryVerticalState = createBinaryVerticalState();

        function isBinaryVerticalGalaxy(index = currentGalaxyIndex) {
            const galaxy = typeof getGalaxyDefinition === 'function'
                ? getGalaxyDefinition(index)
                : (typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS[index] : null);
            if (!galaxy) return false;
            if (galaxy.mode && galaxy.mode !== BINARY_VERTICAL_MODE_ID && galaxy.mode !== 'binaryVertical') return false;
            return galaxy.mode === 'binaryVertical'
                || galaxy.id === 'neon-rift'
                || galaxy.id === 'binary-quasar'
                || galaxy.title === 'BINARY QUASAR'
                || galaxy.name === 'BINARY QUASAR'
                || galaxy.visualStyle === 'binaryQuasar';
        }

        function isBinaryVerticalModeActive() {
            return !!(binaryVerticalState && binaryVerticalState.active)
                && (typeof getActiveGameMode !== 'function' || getActiveGameMode() === BINARY_VERTICAL_MODE_ID)
                && isBinaryVerticalGalaxy(currentGalaxyIndex);
        }

        function resetBinaryVerticalRuntimeState() {
            binaryVerticalState = createBinaryVerticalState();
            binaryVerticalState.lastResetAt = getBinaryVerticalNow();
            return binaryVerticalState;
        }

        function beginBinaryVerticalRun() {
            binaryVerticalState = createBinaryVerticalState();
            binaryVerticalState.active = true;
            binaryVerticalState.startedAt = getBinaryVerticalNow();
            binaryVerticalState.galaxyIndex = typeof currentGalaxyIndex === 'number' ? currentGalaxyIndex : -1;
            binaryVerticalState.routeMode = BINARY_VERTICAL_MODE_ID;

            if (typeof setActiveGameMode === 'function') setActiveGameMode(BINARY_VERTICAL_MODE_ID);
            if (typeof beginLaunchSequence === 'function') {
                beginLaunchSequence();
                return true;
            }
            gameState = 'SHIP_SELECT';
            return false;
        }

        function debugBinaryVerticalState() {
            const snapshot = {
                active: !!(binaryVerticalState && binaryVerticalState.active),
                activeMode: typeof getActiveGameMode === 'function' ? getActiveGameMode() : 'unknown',
                galaxyIndex: binaryVerticalState ? binaryVerticalState.galaxyIndex : -1,
                currentGalaxyIndex: typeof currentGalaxyIndex === 'number' ? currentGalaxyIndex : -1,
                routeMode: binaryVerticalState ? binaryVerticalState.routeMode : BINARY_VERTICAL_MODE_ID,
                gameState: typeof gameState !== 'undefined' ? gameState : 'unknown',
                wave: typeof WaveManager !== 'undefined' ? WaveManager.currentWave : null,
                enemyCount: typeof enemies !== 'undefined' && Array.isArray(enemies) ? enemies.length : 0,
                bulletCount: typeof bullets !== 'undefined' && Array.isArray(bullets) ? bullets.length : 0,
                bossActive: typeof boss !== 'undefined' ? !!boss : false,
                startedAt: binaryVerticalState ? binaryVerticalState.startedAt : 0,
                lastResetAt: binaryVerticalState ? binaryVerticalState.lastResetAt : 0
            };
            if (typeof console !== 'undefined' && console.table) console.table(snapshot);
            return snapshot;
        }

        if (typeof window !== 'undefined') {
            window.startBinaryVerticalRun = beginBinaryVerticalRun;
            window.debugBinaryVerticalState = debugBinaryVerticalState;
        }
