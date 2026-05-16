        // Animation loop, FPS pacing, and startup.
        function gameLoop(now) {
            currentFrameNow = now;
            if (bossCinematic && bossCinematic.paused) {
                const pausedDt = Math.min((now - lastTime) / 1000, 0.05);
                lastTime = now;
                lastRafTime = now;
                frameCount++;
                if (now >= fpsLastTime + 1000) {
                    currentFps = frameCount;
                    frameCount = 0;
                    fpsLastTime = now;
                    fpsElement.innerText = `FPS: ${currentFps}`;
                }
                if (typeof updateFocusAbilities === 'function') updateFocusAbilities(pausedDt, false);
                updateBossCinematic(now);
                draw(0);
                updateHud();
                requestAnimationFrame(gameLoop);
                return;
            }

            if (userFpsCap) {
                if (now - lastRafTime < 16.6) {
                    requestAnimationFrame(gameLoop);
                    return;
                }
                lastRafTime = now - ((now - lastRafTime) % 16.6);
            }
            
            let dt = Math.min((now - lastTime) / 1000, 0.05); 
            lastTime = now;

            // FPS Counter update
            if (boss && boss.name === 'OVERHEATING FIREWALL') {
                boss.animFrame = (boss.animFrame || 0) + (boss.phase === 'INTRO' ? 0.35 : 1);
            }
            renderFrameCount++;
            frameCount++;
            if (now >= fpsLastTime + 1000) {
                currentFps = frameCount;
                frameCount = 0;
                fpsLastTime = now;
                fpsElement.innerText = `FPS: ${currentFps}`;
            }

            if (gameState === 'PLAYING' || gameState === 'LAUNCHING') buildSpatialHash();
            updatePhysics(dt); draw(dt); updateHud();
            if (bossCinematic) updateBossCinematic(now);
            requestAnimationFrame(gameLoop);
        }

        let gameLoopStarted = false;

        function dismissInitialLoadScreen() {
            const loader = document.getElementById('initial-load-screen');
            if (!loader || loader.dataset.dismissed === 'true') return;
            loader.dataset.dismissed = 'true';
            if (typeof startGalaxySelectIntroReveal === 'function') {
                startGalaxySelectIntroReveal(performance.now());
            }
            const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reducedMotion) {
                loader.remove();
                return;
            }
            loader.classList.add('is-breaking');
            window.setTimeout(() => {
                if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
            }, 900);
        }

        function startGameLoop() {
            if (gameLoopStarted) return;
            gameLoopStarted = true;
            resize();
            dismissInitialLoadScreen();
            requestAnimationFrame(gameLoop);
        }

        window.addEventListener('resize', resize);
        document.addEventListener('fullscreenchange', resize);
        resize();
        startGameLoop();
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(resize, () => {});
        }
