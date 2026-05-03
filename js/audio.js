        // Audio buffers, music routing, SFX, and boss track helpers.
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.4;
        gainNode.connect(audioCtx.destination);

        const bgmGain = audioCtx.createGain();
        bgmGain.connect(gainNode);
        const bossGain = audioCtx.createGain();
        bossGain.connect(gainNode);

        async function loadBuffer(url) {
            try {
                const res = await fetch(url);
                const arr = await res.arrayBuffer();
                return await audioCtx.decodeAudioData(arr);
            } catch (e) { console.error("Audio load failed:", url); return null; }
        }
        
        let buf1, buf2, bufVoidIntro, bufVoidLoop, bufGlitchIntro, bufGlitchLoop, bufBoss3Intro, bufBoss3Loop, bufBoss4Intro, bufBoss4Loop, bufBoss5Intro, bufBoss5Loop, bufBossExplosion, bufPlayerExplosion;
        let bgmSources = [];
        let bossSources = [];
        let bgmOffset = 0;
        let bgmLastStartTime = 0;
        let bgmIsPlaying = false;
        let bossMusicTimeout = null;
        let bgmRetryTimeout = null;
        let currentMusicPlaybackRate = 1;
        let bgmPlayToken = 0;
        let bossPlayToken = 0;

        function setSourcePlaybackRate(source, rate, rampSeconds = 0) {
            if (!source || !source.playbackRate) return;
            const now = audioCtx.currentTime;
            const safeRate = Math.max(0.35, Math.min(1.15, rate || 1));
            source.playbackRate.cancelScheduledValues(now);
            if (rampSeconds > 0) {
                source.playbackRate.setValueAtTime(source.playbackRate.value, now);
                source.playbackRate.linearRampToValueAtTime(safeRate, now + rampSeconds);
            } else {
                source.playbackRate.setValueAtTime(safeRate, now);
            }
        }

        function syncBgmOffsetForPlaybackRate() {
            if (!bgmIsPlaying) return;
            const now = audioCtx.currentTime;
            bgmOffset += (now - bgmLastStartTime) * currentMusicPlaybackRate;
            bgmLastStartTime = now;
        }

        function updateFocusMusicPlaybackRate(targetRate = 1, rampSeconds = 0.12) {
            const nextRate = Math.max(0.35, Math.min(1.15, targetRate || 1));
            if (Math.abs(nextRate - currentMusicPlaybackRate) < 0.002) return;
            syncBgmOffsetForPlaybackRate();
            currentMusicPlaybackRate = nextRate;
            for (const source of bgmSources) setSourcePlaybackRate(source, nextRate, rampSeconds);
            for (const source of bossSources) setSourcePlaybackRate(source, nextRate, rampSeconds);
        }

        async function initAudio() {
            buf1 = await loadBuffer('./audio/ascii-airlines-bg-music.mp3');
            buf2 = await loadBuffer('./audio/ascii-airlines-bg-music-loop.mp3');
            bufVoidIntro = await loadBuffer('./audio/ascii-airlines-boss1-intro.mp3');
            bufVoidLoop = await loadBuffer('./audio/ascii-airlines-boss1-loop.mp3');
            bufGlitchIntro = await loadBuffer('./audio/ascii-airlines-boss2-intro.mp3');
            bufGlitchLoop = await loadBuffer('./audio/ascii-airlines-boss2-loop.mp3');
            bufBoss3Intro = await loadBuffer('./audio/ascii-airlines-boss3-intro.mp3');
            bufBoss3Loop = await loadBuffer('./audio/ascii-airlines-boss3-loop.mp3');
            bufBoss4Intro = await loadBuffer('./audio/ascii-airlines-boss4-intro.mp3');
            bufBoss4Loop = await loadBuffer('./audio/ascii-airlines-boss4-loop.mp3');
            bufBoss5Intro = await loadBuffer('./audio/ascii-airlines-boss5-intro.mp3');
            bufBoss5Loop = await loadBuffer('./audio/ascii-airlines-boss5-loop.mp3');
            bufBossExplosion = await loadBuffer('./audio/explode.mp3');
            bufPlayerExplosion = await loadBuffer('./audio/playerexplode.mp3');
        }
        initAudio();

        function stopBgm(fadeOutTime = 0) {
            if (bgmRetryTimeout) { clearTimeout(bgmRetryTimeout); bgmRetryTimeout = null; }
            bgmPlayToken++;
            if (bgmIsPlaying) {
                bgmOffset += (audioCtx.currentTime - bgmLastStartTime) * currentMusicPlaybackRate;
                bgmIsPlaying = false;
            }
            bgmGain.gain.cancelScheduledValues(audioCtx.currentTime);
            if (fadeOutTime > 0) {
                bgmGain.gain.setValueAtTime(bgmGain.gain.value, audioCtx.currentTime);
                bgmGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeOutTime);
                const sourcesToStop = [...bgmSources];
                setTimeout(() => {
                    sourcesToStop.forEach(src => { try { src.stop(); } catch(e){} });
                }, fadeOutTime * 1000);
            } else {
                bgmGain.gain.value = 0;
                bgmSources.forEach(src => { try { src.stop(); } catch(e){} });
            }
            bgmSources = [];
        }

        function playBgm(fadeInTime = 0) {
            if (bgmRetryTimeout) { clearTimeout(bgmRetryTimeout); bgmRetryTimeout = null; }
            if (audioCtx.state === 'suspended') audioCtx.resume();
            stopBgm(0);
            if (!buf1 || !buf2) {
                bgmRetryTimeout = setTimeout(() => playBgm(fadeInTime), 100);
                return;
            }
            
            bgmGain.gain.cancelScheduledValues(audioCtx.currentTime);
            bgmGain.gain.setValueAtTime(fadeInTime > 0 ? 0 : 1, audioCtx.currentTime);
            if (fadeInTime > 0) {
                bgmGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + fadeInTime);
            }

            const token = ++bgmPlayToken;

            bgmLastStartTime = audioCtx.currentTime;
            bgmIsPlaying = true;

            const totalIntro = buf1.duration;
            const loopDur = buf2.duration;

            if (bgmOffset < totalIntro) {
                const source1 = audioCtx.createBufferSource(); source1.buffer = buf1; source1.connect(bgmGain);
                setSourcePlaybackRate(source1, currentMusicPlaybackRate);
                source1.onended = () => {
                    if (token !== bgmPlayToken || !bgmIsPlaying) return;
                    const source2 = audioCtx.createBufferSource();
                    source2.buffer = buf2;
                    source2.loop = true;
                    source2.connect(bgmGain);
                    setSourcePlaybackRate(source2, currentMusicPlaybackRate);
                    bgmSources = bgmSources.filter(src => src !== source1);
                    bgmSources.push(source2);
                    bgmLastStartTime = audioCtx.currentTime;
                    try { source2.start(audioCtx.currentTime); } catch(e) {}
                };
                source1.start(audioCtx.currentTime, bgmOffset);
                bgmSources.push(source1);
            } else {
                const loopOffset = (bgmOffset - totalIntro) % loopDur;
                const source2 = audioCtx.createBufferSource(); source2.buffer = buf2; source2.loop = true; source2.connect(bgmGain);
                setSourcePlaybackRate(source2, currentMusicPlaybackRate);
                source2.start(audioCtx.currentTime, loopOffset);
                bgmSources.push(source2);
            }
        }

        function stopBossMusic(fadeOutTime = 0) {
            bossPlayToken++;
            bossGain.gain.cancelScheduledValues(audioCtx.currentTime);
            if (fadeOutTime > 0) {
                bossGain.gain.setValueAtTime(bossGain.gain.value, audioCtx.currentTime);
                bossGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeOutTime);
                const sourcesToStop = [...bossSources];
                setTimeout(() => {
                    sourcesToStop.forEach(src => { try { src.stop(); } catch(e){} });
                }, fadeOutTime * 1000);
            } else {
                bossGain.gain.value = 0;
                bossSources.forEach(src => { try { src.stop(); } catch(e){} });
            }
            bossSources = [];
        }

        function playBossMusic(introBuf, loopBuf) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            stopBossMusic(0);
            if (!introBuf || !loopBuf) return;
            
            bossGain.gain.cancelScheduledValues(audioCtx.currentTime);
            bossGain.gain.setValueAtTime(1, audioCtx.currentTime);

            const token = ++bossPlayToken;
            const source1 = audioCtx.createBufferSource(); source1.buffer = introBuf; source1.connect(bossGain);
            setSourcePlaybackRate(source1, currentMusicPlaybackRate);
            source1.onended = () => {
                if (token !== bossPlayToken) return;
                const source2 = audioCtx.createBufferSource();
                source2.buffer = loopBuf;
                source2.loop = true;
                source2.connect(bossGain);
                setSourcePlaybackRate(source2, currentMusicPlaybackRate);
                bossSources = bossSources.filter(src => src !== source1);
                bossSources.push(source2);
                try { source2.start(audioCtx.currentTime); } catch(e) {}
            };
            
            const now = audioCtx.currentTime;
            source1.start(now);
            bossSources.push(source1);
        }

        function playBossMusicAtDrop(introBuf, loopBuf, introDuration, dropTime) {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBgm(1.5);
            const delayMs = Math.max(0, (introDuration - dropTime) * 1000);
            bossMusicTimeout = setTimeout(() => {
                playBossMusic(introBuf, loopBuf);
            }, delayMs);
        }

        function stopMusic() {
            if (bossMusicTimeout) { clearTimeout(bossMusicTimeout); bossMusicTimeout = null; }
            stopBgm(0);
            stopBossMusic(0);
        }

        function startMusic() {
            bgmOffset = 0;
            playBgm(0);
        }

        function resumeMainMusic(fadeInTime = 2.0) {
            playBgm(fadeInTime);
        }

        function startVoidWalkerMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBgm(1.5);
            bossMusicTimeout = setTimeout(() => {
                playBossMusic(bufVoidIntro, bufVoidLoop);
            }, 1000);
        }

        function stopVoidWalkerMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBossMusic(2.0);
            resumeMainMusic();
        }

        function fadeMusicForDeath() {
            const now = audioCtx.currentTime;
            bgmGain.gain.cancelScheduledValues(now);
            bgmGain.gain.setValueAtTime(bgmGain.gain.value, now);
            bgmGain.gain.linearRampToValueAtTime(0.4, now + 4.0);
            bossGain.gain.cancelScheduledValues(now);
            bossGain.gain.setValueAtTime(bossGain.gain.value, now);
            bossGain.gain.linearRampToValueAtTime(0.4, now + 4.0);
        }

        function startDistortedGlitchMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBgm(1.5);
            bossMusicTimeout = setTimeout(() => {
                playBossMusic(bufGlitchIntro, bufGlitchLoop);
            }, 1000);
        }

        function stopDistortedGlitchMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBossMusic(2.0);
            resumeMainMusic();
        }

        function startBlackVoidMusic() {
            const introDuration = typeof BLACK_VOID_INTRO_DURATION === 'number' ? BLACK_VOID_INTRO_DURATION : 6.0;
            const dropTime = typeof BLACK_VOID_MUSIC_DROP_TIME === 'number' ? BLACK_VOID_MUSIC_DROP_TIME : 1.725;
            playBossMusicAtDrop(bufBoss5Intro, bufBoss5Loop, introDuration, dropTime);
        }

        function stopBlackVoidMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBossMusic(2.0);
            resumeMainMusic();
        }

        function startSignalGhostMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBgm(1.5);
            bossMusicTimeout = setTimeout(() => {
                playBossMusic(bufBoss3Intro, bufBoss3Loop);
            }, 1000);
        }

        function stopSignalGhostMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBossMusic(2.0);
            resumeMainMusic();
        }

        function startOverheatingFirewallMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBgm(1.5);
            bossMusicTimeout = setTimeout(() => {
                playBossMusic(bufBoss4Intro, bufBoss4Loop);
            }, 1000);
        }

        function stopOverheatingFirewallMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBossMusic(2.0);
            resumeMainMusic();
        }

        function startBattleStarshipMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBgm(1.5);
            bossMusicTimeout = setTimeout(() => {
                playBossMusic(bufBoss3Intro, bufBoss3Loop);
            }, 1000);
        }

        function stopBattleStarshipMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBossMusic(2.0);
            resumeMainMusic();
        }
