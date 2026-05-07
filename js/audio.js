        // Audio buffers, music routing, SFX, and boss track helpers.
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.4;
        gainNode.connect(audioCtx.destination);

        const bgmGain = audioCtx.createGain();
        bgmGain.connect(gainNode);
        const bossGain = audioCtx.createGain();
        bossGain.connect(gainNode);
        const musicPlayerGain = audioCtx.createGain();
        musicPlayerGain.gain.value = 1;
        const musicPlayerAnalyser = audioCtx.createAnalyser();
        musicPlayerAnalyser.fftSize = 256;
        musicPlayerAnalyser.smoothingTimeConstant = 0.54;
        musicPlayerAnalyser.minDecibels = -96;
        musicPlayerAnalyser.maxDecibels = -18;
        musicPlayerGain.connect(musicPlayerAnalyser);
        musicPlayerAnalyser.connect(gainNode);
        const musicPlayerFrequencyData = new Uint8Array(musicPlayerAnalyser.frequencyBinCount);

        async function loadBuffer(url) {
            try {
                const res = await fetch(url);
                const arr = await res.arrayBuffer();
                return await audioCtx.decodeAudioData(arr);
            } catch (e) { console.error("Audio load failed:", url); return null; }
        }
        
        let buf1, buf2, bufVoidIntro, bufVoidLoop, bufGlitchIntro, bufGlitchLoop, bufBoss3Intro, bufBoss3Loop, bufBoss4Intro, bufBoss4Loop, bufBoss5Intro, bufBoss5Loop, bufBoss6Intro, bufBoss6Loop, bufBoss7Intro, bufBoss7Loop, bufBoss8IntroLoop, bufBoss9RoseIntro, bufBoss9RoseLoop, bufBossExplosion, bufPlayerExplosion;
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
        let musicPlayerOpen = false;
        let musicPlayerSelection = 2;
        let musicPlayerTrackIndex = 0;
        let musicPlayerIsPlaying = false;
        let musicPlayerPosition = 0;
        let musicPlayerPhase = 'stopped';
        let musicPlayerSourceStartedAt = 0;
        let musicPlayerSourceOffset = 0;
        let musicPlayerToken = 0;
        let musicPlayerSources = [];
        let musicPlayerVolume = 1;
        let musicPlayerMasterOverride = false;
        let musicPlayerVisualizerBars = [];
        let musicPlayerVisualizerLastTime = 0;
        let musicPlayerVisualizerPeak = 0.18;
        const MUSIC_PLAYER_TRACKS = [
            { name: 'Main Theme', intro: () => buf1, loop: () => buf2 },
            { name: 'Null Phantom', intro: () => bufVoidIntro, loop: () => bufVoidLoop },
            { name: 'Distorted Glitch', intro: () => bufGlitchIntro, loop: () => bufGlitchLoop },
            { name: 'Ghost Signal', intro: () => bufBoss3Intro, loop: () => bufBoss3Loop },
            { name: 'Overheating Firewall', intro: () => bufBoss4Intro, loop: () => bufBoss4Loop },
            { name: 'Black Void', intro: () => bufBoss5Intro, loop: () => bufBoss5Loop },
            { name: 'Matrix Hydra', intro: () => bufBoss6Intro, loop: () => bufBoss6Loop },
            { name: 'Axiom Core', intro: () => bufBoss7Intro, loop: () => bufBoss7Loop },
            { name: 'Battle Starship', loopOnly: () => bufBoss8IntroLoop },
            { name: 'Rose Signal', intro: () => bufBoss9RoseIntro, loop: () => bufBoss9RoseLoop }
        ];

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
            bufBoss6Intro = await loadBuffer('./audio/ascii-airlines-boss6-intro.mp3');
            bufBoss6Loop = await loadBuffer('./audio/ascii-airlines-boss6-loop.mp3');
            bufBoss7Intro = await loadBuffer('./audio/ascii-airlines-boss7-intro.mp3');
            bufBoss7Loop = await loadBuffer('./audio/ascii-airlines-boss7-loop.mp3');
            bufBoss8IntroLoop = await loadBuffer('./audio/ascii-airlines-boss8-introloop.mp3');
            bufBoss9RoseIntro = await loadBuffer('./audio/ascii-airlines-boss9rose-intro.mp3');
            bufBoss9RoseLoop = await loadBuffer('./audio/ascii-airlines-boss9rose-loop.mp3');
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

        function playLoopingBossMusic(loopBuf) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            stopBossMusic(0);
            if (!loopBuf) return;

            bossGain.gain.cancelScheduledValues(audioCtx.currentTime);
            bossGain.gain.setValueAtTime(1, audioCtx.currentTime);
            bossPlayToken++;

            const source = audioCtx.createBufferSource();
            source.buffer = loopBuf;
            source.loop = true;
            source.connect(bossGain);
            setSourcePlaybackRate(source, currentMusicPlaybackRate);
            source.start(audioCtx.currentTime);
            bossSources.push(source);
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

        function getMusicPlayerTrack(index = musicPlayerTrackIndex) {
            if (!MUSIC_PLAYER_TRACKS.length) return null;
            const safeIndex = ((index % MUSIC_PLAYER_TRACKS.length) + MUSIC_PLAYER_TRACKS.length) % MUSIC_PLAYER_TRACKS.length;
            return MUSIC_PLAYER_TRACKS[safeIndex] || null;
        }

        function getMusicPlayerTrackBuffers(track = getMusicPlayerTrack()) {
            if (!track) return { intro: null, loop: null, loopOnly: null };
            return {
                intro: typeof track.intro === 'function' ? track.intro() : null,
                loop: typeof track.loop === 'function' ? track.loop() : null,
                loopOnly: typeof track.loopOnly === 'function' ? track.loopOnly() : null
            };
        }

        function getMusicPlayerDuration(track = getMusicPlayerTrack()) {
            const buffers = getMusicPlayerTrackBuffers(track);
            if (buffers.loopOnly) return buffers.loopOnly.duration || 0;
            if (buffers.intro && buffers.loop) return (buffers.intro.duration || 0) + (buffers.loop.duration || 0);
            return 0;
        }

        function getMusicPlayerLoopStart(track = getMusicPlayerTrack()) {
            const buffers = getMusicPlayerTrackBuffers(track);
            return buffers.intro ? (buffers.intro.duration || 0) : 0;
        }

        function stopMusicPlayerSources() {
            musicPlayerToken++;
            const sourcesToStop = [...musicPlayerSources];
            musicPlayerSources = [];
            for (const source of sourcesToStop) {
                try { source.stop(); } catch (e) {}
            }
        }

        function getMusicPlayerPosition() {
            const track = getMusicPlayerTrack();
            const buffers = getMusicPlayerTrackBuffers(track);
            const totalDuration = getMusicPlayerDuration(track);
            if (!musicPlayerIsPlaying || totalDuration <= 0) {
                return Math.max(0, Math.min(totalDuration || 0, musicPlayerPosition || 0));
            }

            const elapsed = Math.max(0, audioCtx.currentTime - musicPlayerSourceStartedAt);
            if (musicPlayerPhase === 'intro' && buffers.intro) {
                return Math.min(buffers.intro.duration || 0, musicPlayerSourceOffset + elapsed);
            }
            if (musicPlayerPhase === 'loop' && buffers.loop) {
                const loopDur = Math.max(0.001, buffers.loop.duration || 0.001);
                return (buffers.intro.duration || 0) + ((musicPlayerSourceOffset + elapsed) % loopDur);
            }
            if (musicPlayerPhase === 'single' && buffers.loopOnly) {
                const loopDur = Math.max(0.001, buffers.loopOnly.duration || 0.001);
                return (musicPlayerSourceOffset + elapsed) % loopDur;
            }
            return musicPlayerPosition || 0;
        }

        function applyMusicPlayerVolume() {
            const safeVolume = Math.max(0, Math.min(1, musicPlayerVolume));
            musicPlayerVolume = safeVolume;
            musicPlayerGain.gain.cancelScheduledValues(audioCtx.currentTime);
            musicPlayerGain.gain.setValueAtTime(safeVolume, audioCtx.currentTime);
        }

        function getMusicPlayerVisualizerLevels(barCount = 32) {
            const count = Math.max(6, Math.min(64, Math.floor(barCount || 32)));
            if (musicPlayerVisualizerBars.length !== count) {
                musicPlayerVisualizerBars = new Array(count).fill(0);
            }

            const now = audioCtx.currentTime || 0;
            const dt = musicPlayerVisualizerLastTime > 0
                ? Math.max(0.001, Math.min(0.08, now - musicPlayerVisualizerLastTime))
                : 1 / 60;
            musicPlayerVisualizerLastTime = now;

            if (!musicPlayerIsPlaying || musicPlayerVolume <= 0.001) {
                const decay = Math.pow(0.06, dt);
                for (let i = 0; i < musicPlayerVisualizerBars.length; i++) {
                    musicPlayerVisualizerBars[i] *= decay;
                }
                return musicPlayerVisualizerBars;
            }

            musicPlayerAnalyser.getByteFrequencyData(musicPlayerFrequencyData);
            const rawLevels = new Array(count);
            const usableBins = Math.max(8, Math.floor(musicPlayerFrequencyData.length * 0.92));
            let framePeak = 0;
            let frameTotal = 0;
            for (let i = 0; i < count; i++) {
                const start = Math.max(1, Math.floor(Math.pow(i / count, 1.72) * usableBins));
                const end = Math.max(start + 1, Math.floor(Math.pow((i + 1) / count, 1.72) * usableBins));
                let sum = 0;
                let peak = 0;
                for (let bin = start; bin < end; bin++) {
                    const value = musicPlayerFrequencyData[bin] || 0;
                    sum += value;
                    if (value > peak) peak = value;
                }
                const avg = sum / Math.max(1, end - start);
                const bandPosition = i / Math.max(1, count - 1);
                const raw = Math.max(avg * 0.62, peak * 0.58) / 255;
                const highLift = 0.82 + Math.pow(bandPosition, 1.16) * 1.38;
                const lowTame = bandPosition < 0.16 ? 0.78 + bandPosition * 1.38 : 1;
                const level = Math.max(0, raw * highLift * lowTame - 0.015);
                rawLevels[i] = level;
                framePeak = Math.max(framePeak, level);
                frameTotal += level;
            }

            const frameAvg = frameTotal / Math.max(1, count);
            const targetPeak = Math.max(0.1, framePeak, frameAvg * 1.8);
            const peakRate = targetPeak > musicPlayerVisualizerPeak
                ? Math.min(1, dt * 16)
                : Math.min(1, dt * 1.35);
            musicPlayerVisualizerPeak += (targetPeak - musicPlayerVisualizerPeak) * peakRate;
            const dynamicScale = Math.max(0.095, musicPlayerVisualizerPeak * 0.88);

            for (let i = 0; i < count; i++) {
                const normalized = Math.max(0, rawLevels[i] / dynamicScale - 0.04);
                const shaped = Math.max(0, Math.min(1, Math.pow(normalized, 0.72) * 1.08));
                const previous = musicPlayerVisualizerBars[i] || 0;
                const rise = Math.min(1, dt * 42);
                const fall = Math.min(1, dt * 20);
                musicPlayerVisualizerBars[i] = shaped > previous
                    ? previous + (shaped - previous) * rise
                    : previous + (shaped - previous) * fall;
            }
            return musicPlayerVisualizerBars;
        }

        function restoreGameMasterVolumeFromMusicPlayer(rampSeconds = 0.12) {
            musicPlayerMasterOverride = false;
            if (typeof applyCurrentVolume === 'function') {
                const pauseScale = (typeof gameState !== 'undefined' && gameState === 'PAUSED' && typeof PAUSE_VOLUME_SCALE === 'number')
                    ? PAUSE_VOLUME_SCALE
                    : 1;
                applyCurrentVolume(pauseScale, rampSeconds);
            } else if (typeof setMasterVolume === 'function') {
                setMasterVolume(0.4, rampSeconds);
            }
        }

        function syncMusicPlayerMasterVolume(rampSeconds = 0.08) {
            const shouldOverride = musicPlayerIsPlaying;
            if (shouldOverride) {
                musicPlayerMasterOverride = true;
                if (typeof setMasterVolume === 'function') {
                    const muted = typeof isMuted !== 'undefined' && isMuted;
                    setMasterVolume(muted ? 0 : 1, rampSeconds);
                }
            } else if (musicPlayerMasterOverride) {
                restoreGameMasterVolumeFromMusicPlayer(rampSeconds);
            }
        }

        function startMusicPlayerLoop(track, token, loopOffset = 0) {
            const buffers = getMusicPlayerTrackBuffers(track);
            if (!buffers.loop) return false;
            const source = audioCtx.createBufferSource();
            source.buffer = buffers.loop;
            source.loop = true;
            source.connect(musicPlayerGain);
            musicPlayerSources = musicPlayerSources.filter(src => src !== source);
            musicPlayerSources.push(source);
            musicPlayerPhase = 'loop';
            musicPlayerSourceStartedAt = audioCtx.currentTime;
            musicPlayerSourceOffset = Math.max(0, loopOffset % Math.max(0.001, buffers.loop.duration || 0.001));
            try { source.start(audioCtx.currentTime, musicPlayerSourceOffset); } catch (e) {}
            return token === musicPlayerToken;
        }

        function playMusicPlayerFrom(position = musicPlayerPosition) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const track = getMusicPlayerTrack();
            const buffers = getMusicPlayerTrackBuffers(track);
            const totalDuration = getMusicPlayerDuration(track);
            if (!track || totalDuration <= 0) return false;

            if (bossMusicTimeout) { clearTimeout(bossMusicTimeout); bossMusicTimeout = null; }
            stopBgm(0);
            stopBossMusic(0);
            stopMusicPlayerSources();
            applyMusicPlayerVolume();

            const token = ++musicPlayerToken;
            const safePosition = Math.max(0, Math.min(Math.max(0, totalDuration - 0.001), position || 0));
            musicPlayerPosition = safePosition;
            musicPlayerIsPlaying = true;
            syncMusicPlayerMasterVolume(0.08);

            if (buffers.loopOnly) {
                const source = audioCtx.createBufferSource();
                source.buffer = buffers.loopOnly;
                source.loop = true;
                source.connect(musicPlayerGain);
                musicPlayerPhase = 'single';
                musicPlayerSourceStartedAt = audioCtx.currentTime;
                musicPlayerSourceOffset = safePosition % Math.max(0.001, buffers.loopOnly.duration || 0.001);
                musicPlayerSources.push(source);
                try { source.start(audioCtx.currentTime, musicPlayerSourceOffset); } catch (e) {}
                return true;
            }

            if (!buffers.intro || !buffers.loop) {
                musicPlayerIsPlaying = false;
                musicPlayerPhase = 'stopped';
                return false;
            }

            const introDuration = buffers.intro.duration || 0;
            if (safePosition < introDuration) {
                const source = audioCtx.createBufferSource();
                source.buffer = buffers.intro;
                source.connect(musicPlayerGain);
                musicPlayerPhase = 'intro';
                musicPlayerSourceStartedAt = audioCtx.currentTime;
                musicPlayerSourceOffset = safePosition;
                source.onended = () => {
                    if (token !== musicPlayerToken || !musicPlayerIsPlaying) return;
                    musicPlayerSources = musicPlayerSources.filter(src => src !== source);
                    startMusicPlayerLoop(track, token, 0);
                };
                musicPlayerSources.push(source);
                try { source.start(audioCtx.currentTime, safePosition); } catch (e) {}
                return true;
            }

            return startMusicPlayerLoop(track, token, safePosition - introDuration);
        }

        function pauseMusicPlayer() {
            if (!musicPlayerIsPlaying) return;
            musicPlayerPosition = getMusicPlayerPosition();
            musicPlayerIsPlaying = false;
            musicPlayerPhase = 'paused';
            stopMusicPlayerSources();
            syncMusicPlayerMasterVolume(0.08);
        }

        function toggleMusicPlayerPlayback() {
            if (musicPlayerIsPlaying) {
                pauseMusicPlayer();
                return true;
            }
            return playMusicPlayerFrom(musicPlayerPosition || 0);
        }

        function seekMusicPlayer(deltaSeconds) {
            const duration = getMusicPlayerDuration();
            if (duration <= 0) return false;
            const current = getMusicPlayerPosition();
            let next = current + deltaSeconds;
            while (next < 0) next += duration;
            while (next >= duration) next -= duration;
            musicPlayerPosition = next;
            if (musicPlayerIsPlaying) return playMusicPlayerFrom(next);
            return true;
        }

        function setMusicPlayerTrack(index, autoplay = musicPlayerIsPlaying) {
            musicPlayerTrackIndex = ((index % MUSIC_PLAYER_TRACKS.length) + MUSIC_PLAYER_TRACKS.length) % MUSIC_PLAYER_TRACKS.length;
            musicPlayerPosition = 0;
            stopMusicPlayerSources();
            musicPlayerIsPlaying = false;
            musicPlayerPhase = 'stopped';
            if (autoplay) return playMusicPlayerFrom(0);
            return true;
        }

        function nextMusicPlayerTrack() {
            return setMusicPlayerTrack(musicPlayerTrackIndex + 1);
        }

        function previousMusicPlayerTrack() {
            return setMusicPlayerTrack(musicPlayerTrackIndex - 1);
        }

        function adjustMusicPlayerVolume(delta) {
            musicPlayerVolume = Math.max(0, Math.min(1, Math.round((musicPlayerVolume + delta) * 20) / 20));
            applyMusicPlayerVolume();
            return true;
        }

        function openMusicPlayer() {
            musicPlayerOpen = true;
            musicPlayerSelection = 2;
            syncMusicPlayerMasterVolume(0.1);
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
        }

        function closeMusicPlayer() {
            musicPlayerOpen = false;
            syncMusicPlayerMasterVolume(0.12);
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
        }

        function handleMusicPlayerKey(k) {
            if (k === 'escape' || k === '`' || k === '~') {
                closeMusicPlayer();
                return true;
            }
            if (k === 'arrowup' || k === 'w') {
                if (musicPlayerSelection === 0) musicPlayerSelection = 4;
                else if (musicPlayerSelection === 4) musicPlayerSelection = 2;
                else musicPlayerSelection = 0;
                return true;
            }
            if (k === 'arrowdown' || k === 's') {
                if (musicPlayerSelection === 0) musicPlayerSelection = 2;
                else if (musicPlayerSelection === 4) musicPlayerSelection = 0;
                else musicPlayerSelection = 4;
                return true;
            }
            if (k === 'arrowleft' || k === 'a') {
                if (musicPlayerSelection === 0) return seekMusicPlayer(-5);
                if (musicPlayerSelection === 4) return adjustMusicPlayerVolume(-0.05);
                musicPlayerSelection = Math.max(1, musicPlayerSelection - 1);
                return true;
            }
            if (k === 'arrowright' || k === 'd') {
                if (musicPlayerSelection === 0) return seekMusicPlayer(5);
                if (musicPlayerSelection === 4) return adjustMusicPlayerVolume(0.05);
                musicPlayerSelection = Math.min(3, musicPlayerSelection + 1);
                return true;
            }
            if (k === 'enter' || k === ' ') {
                if (musicPlayerSelection === 1) return previousMusicPlayerTrack();
                if (musicPlayerSelection === 2) return toggleMusicPlayerPlayback();
                if (musicPlayerSelection === 3) return nextMusicPlayerTrack();
                if (musicPlayerSelection === 4) {
                    if (musicPlayerVolume > 0) musicPlayerVolume = 0;
                    else musicPlayerVolume = 1;
                    applyMusicPlayerVolume();
                    return true;
                }
            }
            return false;
        }

        function formatMusicPlayerTime(seconds) {
            const safeSeconds = Math.max(0, seconds || 0);
            const mins = Math.floor(safeSeconds / 60);
            const secs = Math.floor(safeSeconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        function getMusicPlayerStatus() {
            const track = getMusicPlayerTrack();
            const duration = getMusicPlayerDuration(track);
            const position = getMusicPlayerPosition();
            const loopStart = getMusicPlayerLoopStart(track);
            const buffers = getMusicPlayerTrackBuffers(track);
            const isLoaded = !!(buffers.loopOnly || (buffers.intro && buffers.loop));
            return {
                open: musicPlayerOpen,
                selection: musicPlayerSelection,
                trackIndex: musicPlayerTrackIndex,
                trackCount: MUSIC_PLAYER_TRACKS.length,
                trackName: track ? track.name : 'No Tracks',
                isPlaying: musicPlayerIsPlaying,
                position,
                duration,
                loopStart,
                isLoaded,
                phase: musicPlayerPhase,
                volume: musicPlayerVolume,
                positionText: formatMusicPlayerTime(position),
                durationText: formatMusicPlayerTime(duration)
            };
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

        function startMatrixHydraMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBgm(1.5);
            bossMusicTimeout = setTimeout(() => {
                playBossMusic(bufBoss6Intro, bufBoss6Loop);
            }, 1000);
        }

        function stopMatrixHydraMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBossMusic(2.0);
            resumeMainMusic();
        }

        function startAxiomCoreMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBgm(1.5);
            bossMusicTimeout = setTimeout(() => {
                playBossMusic(bufBoss7Intro, bufBoss7Loop);
            }, 1000);
        }

        function stopAxiomCoreMusic() {
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
                playLoopingBossMusic(bufBoss8IntroLoop);
            }, 1000);
        }

        function stopBattleStarshipMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBossMusic(2.0);
            resumeMainMusic();
        }

        function startRoseBossMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBgm(1.5);
            bossMusicTimeout = setTimeout(() => {
                playBossMusic(bufBoss9RoseIntro, bufBoss9RoseLoop);
            }, 1000);
        }

        function stopRoseBossMusic() {
            if (bossMusicTimeout) clearTimeout(bossMusicTimeout);
            stopBossMusic(2.0);
            resumeMainMusic();
        }
