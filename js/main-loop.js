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

        window.addEventListener('resize', resize);
        document.addEventListener('fullscreenchange', resize);
        resize();
        document.fonts.ready.then(() => { resize(); requestAnimationFrame(gameLoop); });
