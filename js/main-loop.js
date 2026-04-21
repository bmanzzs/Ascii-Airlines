        // Animation loop, FPS pacing, and startup.
        function gameLoop(now) {
            currentFrameNow = now;
            if (bossCinematic && bossCinematic.paused) {
                lastTime = now;
                lastRafTime = now;
                frameCount++;
                if (now >= fpsLastTime + 1000) {
                    currentFps = frameCount;
                    frameCount = 0;
                    fpsLastTime = now;
                    fpsElement.innerText = `FPS: ${currentFps}`;
                }
                updateBossCinematic(now);
                draw(0);
                updateHud();
                requestAnimationFrame(gameLoop);
                return;
            }

            if (fpsCapped || userFpsCap) {
                if (now - lastRafTime < 16.6) {
                    requestAnimationFrame(gameLoop);
                    return;
                }
                lastRafTime = now - ((now - lastRafTime) % 16.6);
            }
            
            let dt = Math.min((now - lastTime) / 1000, 0.05); 
            lastTime = now;
            
            if ((gameState === 'PLAYING' || gameState === 'LAUNCHING') && benchFrames < 120) {
                if (benchFrames === 0) benchStartTime = now;
                benchFrames++;
                if (benchFrames === 120) {
                    if ((120 / (now - benchStartTime)) * 1000 < 58) {
                        fpsCapped = true;
                        fpsLowPerf.style.display = 'block';
                    }
                }
            }

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

        window.addEventListener('resize', resize); resize();
        document.fonts.ready.then(() => { resize(); requestAnimationFrame(gameLoop); });
