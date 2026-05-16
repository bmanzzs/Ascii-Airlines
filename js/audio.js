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
        musicPlayerAnalyser.fftSize = 1024;
        musicPlayerAnalyser.smoothingTimeConstant = 0.52;
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
        
        let buf1, buf2, bufMatrixIntro, bufMatrixLoop, bufMatrix2Intro, bufMatrix2Loop, bufVoidIntro, bufVoidLoop, bufGlitchIntro, bufGlitchLoop, bufBoss3Intro, bufBoss3Loop, bufBoss4Intro, bufBoss4Loop, bufBoss5Intro, bufBoss5Loop, bufBoss6Intro, bufBoss6Loop, bufBoss7Intro, bufBoss7Loop, bufBoss8IntroLoop, bufBoss9RoseIntro, bufBoss9RoseLoop, bufBossExplosion, bufPlayerExplosion;
        let bgmSources = [];
        let bossSources = [];
        let bgmOffset = 0;
        let bgmLastStartTime = 0;
        let bgmIsPlaying = false;
        let bossMusicTimeout = null;
        let bgmRetryTimeout = null;
        let galaxySelectHandoffFadeTimeout = null;
        let currentMusicPlaybackRate = 1;
        let bgmPlayToken = 0;
        let bossPlayToken = 0;
        let bgmTrackMode = 'none';
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
        let musicPlayerVisualSignal = {
            bass: 0,
            mid: 0,
            highMid: 0,
            treble: 0,
            energy: 0,
            pulse: 0,
            bassPulse: 0,
            bassGuitar: 0,
            drumSnap: 0,
            leadTone: 0,
            air: 0,
            phase: 0,
            previousBass: 0,
            previousBassGuitar: 0,
            previousEnergy: 0,
            lastTime: 0,
            bands: null
        };
        let musicPlayerVisualProfile = {
            trackIndex: -1,
            binCount: 0,
            age: 0,
            averages: [],
            fast: [],
            bassEnd: 0.09,
            midEnd: 0.25,
            highMidEnd: 0.58
        };
        const MUSIC_PLAYER_PREVIOUS_TRACK_GRACE_SECONDS = 3;
        const MUSIC_PLAYER_TRACKS = [
            { name: 'Main Theme', intro: () => buf1, loop: () => buf2 },
            { name: 'Matrix Nebula 1', intro: () => bufMatrixIntro, loop: () => bufMatrixLoop },
            { name: 'Matrix Nebula 2', intro: () => bufMatrix2Intro, loop: () => bufMatrix2Loop },
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
            buf1 = await loadBuffer('./audio/ascii-airlines-bg-music-intro.mp3');
            buf2 = await loadBuffer('./audio/ascii-airlines-bg-music-loop.mp3');
            bufMatrixIntro = await loadBuffer('./audio/ascii-airlines-bgMatrix-intro.mp3');
            bufMatrixLoop = await loadBuffer('./audio/ascii-airlines-bgMatrix-loop.mp3');
            bufMatrix2Intro = await loadBuffer('./audio/ascii-airlines-bgMatrix2-intro.mp3');
            bufMatrix2Loop = await loadBuffer('./audio/ascii-airlines-bgMatrix2-loop.mp3');
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

        function clearGalaxySelectHandoffFade() {
            if (!galaxySelectHandoffFadeTimeout) return;
            clearTimeout(galaxySelectHandoffFadeTimeout);
            galaxySelectHandoffFadeTimeout = null;
        }

        function fadeGalaxySelectMusicForHandoff(fadeOutTime = 0) {
            if (typeof musicPlayerIsPlaying !== 'undefined' && musicPlayerIsPlaying) return false;
            if (bgmTrackMode !== 'galaxySelect' || !bgmIsPlaying) return false;
            if (bgmRetryTimeout) { clearTimeout(bgmRetryTimeout); bgmRetryTimeout = null; }
            if (audioCtx.state === 'suspended') audioCtx.resume();
            clearGalaxySelectHandoffFade();
            const now = audioCtx.currentTime;
            const safeFadeOut = Math.max(0.05, fadeOutTime || 0);
            const token = bgmPlayToken;
            bgmGain.gain.cancelScheduledValues(now);
            bgmGain.gain.setValueAtTime(bgmGain.gain.value, now);
            bgmGain.gain.linearRampToValueAtTime(0, now + safeFadeOut);
            galaxySelectHandoffFadeTimeout = setTimeout(() => {
                galaxySelectHandoffFadeTimeout = null;
                if (token !== bgmPlayToken || bgmTrackMode !== 'galaxySelect') return;
                bgmSources.forEach(src => { try { src.stop(); } catch(e){} });
                bgmSources = [];
                bgmIsPlaying = false;
                bgmTrackMode = 'none';
                bgmGain.gain.cancelScheduledValues(audioCtx.currentTime);
                bgmGain.gain.setValueAtTime(0, audioCtx.currentTime);
            }, safeFadeOut * 1000 + 50);
            return true;
        }

        function stopBgm(fadeOutTime = 0) {
            clearGalaxySelectHandoffFade();
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
            bgmTrackMode = 'none';
        }

        function playBgmBuffers(introBuf, loopBuf, fadeInTime = 0, startOffset = 0, mode = 'main', retryFn = null) {
            if (bgmRetryTimeout) { clearTimeout(bgmRetryTimeout); bgmRetryTimeout = null; }
            if (audioCtx.state === 'suspended') audioCtx.resume();
            stopBgm(0);
            if (!introBuf || !loopBuf) {
                if (typeof retryFn === 'function') bgmRetryTimeout = setTimeout(retryFn, 100);
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
            bgmTrackMode = mode;

            const offset = Math.max(0, startOffset || 0);
            const totalIntro = introBuf.duration;
            const loopDur = loopBuf.duration;

            if (offset < totalIntro) {
                const source1 = audioCtx.createBufferSource(); source1.buffer = introBuf; source1.connect(bgmGain);
                setSourcePlaybackRate(source1, currentMusicPlaybackRate);
                source1.onended = () => {
                    if (token !== bgmPlayToken || !bgmIsPlaying) return;
                    const source2 = audioCtx.createBufferSource();
                    source2.buffer = loopBuf;
                    source2.loop = true;
                    source2.connect(bgmGain);
                    setSourcePlaybackRate(source2, currentMusicPlaybackRate);
                    bgmSources = bgmSources.filter(src => src !== source1);
                    bgmSources.push(source2);
                    bgmLastStartTime = audioCtx.currentTime;
                    try { source2.start(audioCtx.currentTime); } catch(e) {}
                };
                source1.start(audioCtx.currentTime, offset);
                bgmSources.push(source1);
            } else {
                const loopOffset = (offset - totalIntro) % loopDur;
                const source2 = audioCtx.createBufferSource(); source2.buffer = loopBuf; source2.loop = true; source2.connect(bgmGain);
                setSourcePlaybackRate(source2, currentMusicPlaybackRate);
                source2.start(audioCtx.currentTime, loopOffset);
                bgmSources.push(source2);
            }
        }

        function playBgm(fadeInTime = 0) {
            playBgmBuffers(buf1, buf2, fadeInTime, bgmOffset, 'main', () => playBgm(fadeInTime));
        }

        function isMatrixCrawlerMusicContext() {
            const modeActive = (typeof getActiveGameMode === 'function' && getActiveGameMode() === 'matrixCrawler')
                || (typeof isMatrixCrawlerModeActive === 'function' && isMatrixCrawlerModeActive());
            if (!modeActive) return false;
            if (typeof gameState === 'undefined') return true;
            if (gameState === 'MATRIX_CRAWLER') return true;
            return gameState === 'PAUSED'
                && typeof pauseReturnState !== 'undefined'
                && pauseReturnState === 'MATRIX_CRAWLER';
        }

        function getMatrixCrawlerMusicFloor() {
            let floor = 1;
            if (typeof getMatrixCrawlerCurrentFloor === 'function') {
                floor = getMatrixCrawlerCurrentFloor();
            } else if (typeof getMatrixCrawlerHudSnapshot === 'function') {
                const snapshot = getMatrixCrawlerHudSnapshot();
                floor = snapshot && snapshot.floor;
            }
            return Math.max(1, Math.floor(floor || 1));
        }

        function getMatrixCrawlerBgmTrack() {
            const floor = getMatrixCrawlerMusicFloor();
            if (floor >= 2) {
                return {
                    intro: bufMatrix2Intro,
                    loop: bufMatrix2Loop,
                    mode: 'matrixCrawler2'
                };
            }
            return {
                intro: bufMatrixIntro,
                loop: bufMatrixLoop,
                mode: 'matrixCrawler'
            };
        }

        function isMatrixCrawlerBgmMode(mode = bgmTrackMode) {
            return mode === 'matrixCrawler' || mode === 'matrixCrawler2';
        }

        function playMatrixCrawlerBgm(fadeInTime = 0) {
            const track = getMatrixCrawlerBgmTrack();
            playBgmBuffers(
                track.intro,
                track.loop,
                fadeInTime,
                bgmOffset,
                track.mode,
                () => {
                    if (isMatrixCrawlerMusicContext()) {
                        playMatrixCrawlerBgm(fadeInTime);
                    }
                }
            );
        }

        function stopMatrixCrawlerMusic(fadeOutTime = 0) {
            bgmOffset = 0;
            if (bossMusicTimeout) { clearTimeout(bossMusicTimeout); bossMusicTimeout = null; }
            if (bgmRetryTimeout) { clearTimeout(bgmRetryTimeout); bgmRetryTimeout = null; }
            if (isMatrixCrawlerBgmMode() || bgmTrackMode === 'none') {
                stopBgm(fadeOutTime);
            }
            stopBossMusic(fadeOutTime);
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

        function getMusicPlayerBandEnergy(startRatio, endRatio) {
            const start = Math.max(1, Math.floor(musicPlayerFrequencyData.length * startRatio));
            const end = Math.max(start + 1, Math.min(musicPlayerFrequencyData.length, Math.floor(musicPlayerFrequencyData.length * endRatio)));
            let sum = 0;
            let peak = 0;
            for (let i = start; i < end; i++) {
                const value = musicPlayerFrequencyData[i] || 0;
                sum += value;
                if (value > peak) peak = value;
            }
            const avg = sum / Math.max(1, end - start);
            return Math.max(0, Math.min(1, (avg * 0.56 + peak * 0.44) / 255));
        }

        function getMusicPlayerFrequencyBinRange(lowHz, highHz) {
            const nyquist = Math.max(1, audioCtx.sampleRate / 2);
            const count = Math.max(1, musicPlayerFrequencyData.length);
            const safeLow = Math.max(0, Math.min(nyquist, lowHz || 0));
            const safeHigh = Math.max(safeLow + 1, Math.min(nyquist, highHz || nyquist));
            const start = Math.max(1, Math.floor((safeLow / nyquist) * count));
            const end = Math.max(start + 1, Math.min(count, Math.ceil((safeHigh / nyquist) * count)));
            return { start, end, lowHz: safeLow, highHz: safeHigh };
        }

        function resetMusicPlayerVisualProfile() {
            musicPlayerVisualProfile.trackIndex = musicPlayerTrackIndex;
            musicPlayerVisualProfile.binCount = musicPlayerFrequencyData.length;
            musicPlayerVisualProfile.age = 0;
            musicPlayerVisualProfile.averages = new Array(musicPlayerFrequencyData.length).fill(0);
            musicPlayerVisualProfile.fast = new Array(musicPlayerFrequencyData.length).fill(0);
            musicPlayerVisualProfile.bassEnd = 0.09;
            musicPlayerVisualProfile.midEnd = 0.25;
            musicPlayerVisualProfile.highMidEnd = 0.58;
            musicPlayerVisualSignal.previousEnergy = 0;
            musicPlayerVisualSignal.previousBass = 0;
            musicPlayerVisualSignal.previousBassGuitar = 0;
            musicPlayerVisualSignal.bassPulse = 0;
            musicPlayerVisualSignal.bassGuitar = 0;
            musicPlayerVisualSignal.drumSnap = 0;
            musicPlayerVisualSignal.leadTone = 0;
            musicPlayerVisualSignal.air = 0;
            musicPlayerVisualSignal.bands = null;
        }

        function ensureMusicPlayerVisualProfile() {
            if (
                musicPlayerVisualProfile.trackIndex !== musicPlayerTrackIndex
                || musicPlayerVisualProfile.binCount !== musicPlayerFrequencyData.length
                || musicPlayerVisualProfile.averages.length !== musicPlayerFrequencyData.length
            ) {
                resetMusicPlayerVisualProfile();
            }
            return musicPlayerVisualProfile;
        }

        function clampMusicPlayerBandRatio(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function getMusicPlayerProfileQuantile(profile, target) {
            const count = Math.max(1, profile.averages.length);
            let total = 0;
            for (let i = 1; i < count; i++) {
                total += Math.pow(Math.max(0, profile.averages[i] || 0), 0.78) + Math.pow(Math.max(0, profile.fast[i] || 0), 0.92) * 0.22;
            }
            if (total <= 0.0001) return target;

            let acc = 0;
            for (let i = 1; i < count; i++) {
                acc += Math.pow(Math.max(0, profile.averages[i] || 0), 0.78) + Math.pow(Math.max(0, profile.fast[i] || 0), 0.92) * 0.22;
                if (acc / total >= target) return i / Math.max(1, count - 1);
            }
            return 0.96;
        }

        function updateMusicPlayerVisualProfile(dt) {
            const profile = ensureMusicPlayerVisualProfile();
            profile.age += dt;
            const learnRate = Math.min(1, dt * (profile.age < 4 ? 0.90 : (profile.age < 12 ? 0.28 : 0.075)));
            const fastRate = Math.min(1, dt * 24);

            for (let i = 0; i < musicPlayerFrequencyData.length; i++) {
                const normalized = Math.max(0, Math.min(1, (musicPlayerFrequencyData[i] || 0) / 255));
                const shaped = Math.pow(normalized, 0.68);
                profile.fast[i] += (shaped - profile.fast[i]) * fastRate;
                profile.averages[i] += (shaped - profile.averages[i]) * learnRate;
            }

            const learnedBassEnd = clampMusicPlayerBandRatio(getMusicPlayerProfileQuantile(profile, 0.24), 0.055, 0.155);
            const learnedMidEnd = clampMusicPlayerBandRatio(getMusicPlayerProfileQuantile(profile, 0.53), learnedBassEnd + 0.065, 0.380);
            const learnedHighMidEnd = clampMusicPlayerBandRatio(getMusicPlayerProfileQuantile(profile, 0.805), learnedMidEnd + 0.100, 0.720);
            const boundaryRate = Math.min(1, dt * (profile.age < 8 ? 2.4 : 0.55));
            profile.bassEnd += (learnedBassEnd - profile.bassEnd) * boundaryRate;
            profile.midEnd += (learnedMidEnd - profile.midEnd) * boundaryRate;
            profile.highMidEnd += (learnedHighMidEnd - profile.highMidEnd) * boundaryRate;
            return profile;
        }

        function getMusicPlayerAdaptiveBandEnergy(profile, startRatio, endRatio, gain = 1, curve = 0.62) {
            const count = Math.max(1, musicPlayerFrequencyData.length);
            const start = Math.max(1, Math.floor(count * startRatio));
            const end = Math.max(start + 1, Math.min(count, Math.floor(count * endRatio)));
            let sum = 0;
            let peak = 0;
            let salience = 0;
            const confidence = Math.max(0, Math.min(1, profile.age / 9));
            for (let i = start; i < end; i++) {
                const fast = profile.fast[i] || 0;
                const average = profile.averages[i] || 0;
                const aboveAverage = Math.max(0, fast - average * (0.58 + confidence * 0.18));
                const relativeLift = average > 0.035 ? Math.max(0, (fast / average - 0.98) * 0.10 * confidence) : 0;
                const value = fast * 0.34 + aboveAverage * (0.34 + confidence * 0.48) + relativeLift;
                sum += value;
                if (value > peak) peak = value;
                salience += aboveAverage;
            }
            const avg = sum / Math.max(1, end - start);
            const transient = salience / Math.max(1, end - start);
            const mixed = Math.max(0, Math.min(1, avg * 0.64 + peak * 0.20 + transient * (0.18 + confidence * 0.28)));
            const warmup = 0.58 + confidence * 0.42;
            return Math.max(0, Math.min(1, Math.pow(mixed, curve) * gain * warmup));
        }

        function getMusicPlayerInstrumentBandEnergy(profile, lowHz, highHz, gain = 1, curve = 0.62, options = {}) {
            const range = getMusicPlayerFrequencyBinRange(lowHz, highHz);
            let sum = 0;
            let peak = 0;
            let lifted = 0;
            const confidence = Math.max(0, Math.min(1, profile.age / 10));
            const sustainWeight = Number.isFinite(options.sustainWeight) ? options.sustainWeight : 0.34;
            const liftWeight = Number.isFinite(options.liftWeight) ? options.liftWeight : 0.56;
            const peakWeight = Number.isFinite(options.peakWeight) ? options.peakWeight : 0.30;
            const avgReject = Number.isFinite(options.avgReject) ? options.avgReject : 0.74;

            for (let i = range.start; i < range.end; i++) {
                const fast = profile.fast[i] || 0;
                const average = profile.averages[i] || 0;
                const aboveAverage = Math.max(0, fast - average * (avgReject + confidence * 0.08));
                const relativeLift = average > 0.025 ? Math.max(0, (fast / average - 0.92) * 0.18 * confidence) : fast * 0.22;
                const value = fast * sustainWeight + aboveAverage * liftWeight + relativeLift * 0.28;
                sum += value;
                lifted += aboveAverage + relativeLift * 0.35;
                if (value > peak) peak = value;
            }

            const avg = sum / Math.max(1, range.end - range.start);
            const transient = lifted / Math.max(1, range.end - range.start);
            const mixed = Math.max(0, Math.min(1, avg * (1 - peakWeight) + peak * peakWeight + transient * (0.16 + confidence * 0.20)));
            const warmup = 0.62 + confidence * 0.38;
            return Math.max(0, Math.min(1, Math.pow(mixed, curve) * gain * warmup));
        }

        function approachMusicPlayerSignal(current, target, dt, rise, fall) {
            const rate = target > current ? rise : fall;
            return current + (target - current) * Math.min(1, dt * rate);
        }

        function getMusicPlayerReactiveSignal() {
            const now = audioCtx.currentTime || 0;
            const dt = musicPlayerVisualSignal.lastTime > 0
                ? Math.max(0.001, Math.min(0.08, now - musicPlayerVisualSignal.lastTime))
                : 1 / 60;
            musicPlayerVisualSignal.lastTime = now;

            if (!musicPlayerIsPlaying || musicPlayerVolume <= 0.001) {
                musicPlayerVisualSignal.bass *= Math.pow(0.18, dt);
                musicPlayerVisualSignal.mid *= Math.pow(0.18, dt);
                musicPlayerVisualSignal.highMid *= Math.pow(0.18, dt);
                musicPlayerVisualSignal.treble *= Math.pow(0.18, dt);
                musicPlayerVisualSignal.energy *= Math.pow(0.16, dt);
                musicPlayerVisualSignal.pulse *= Math.pow(0.08, dt);
                musicPlayerVisualSignal.bassPulse *= Math.pow(0.08, dt);
                musicPlayerVisualSignal.bassGuitar *= Math.pow(0.18, dt);
                musicPlayerVisualSignal.drumSnap *= Math.pow(0.14, dt);
                musicPlayerVisualSignal.leadTone *= Math.pow(0.18, dt);
                musicPlayerVisualSignal.air *= Math.pow(0.18, dt);
                musicPlayerVisualSignal.phase += dt * 0.045;
                return musicPlayerVisualSignal;
            }

            musicPlayerAnalyser.getByteFrequencyData(musicPlayerFrequencyData);
            const profile = updateMusicPlayerVisualProfile(dt);
            const bassEnd = profile.bassEnd;
            const midEnd = profile.midEnd;
            const highMidEnd = profile.highMidEnd;
            const subPulse = getMusicPlayerInstrumentBandEnergy(profile, 28, 74, 1.18, 0.58, {
                sustainWeight: 0.25,
                liftWeight: 0.70,
                peakWeight: 0.42,
                avgReject: 0.82
            });
            const bassFundamental = getMusicPlayerInstrumentBandEnergy(profile, 45, 165, 1.84, 0.50, {
                sustainWeight: 0.48,
                liftWeight: 0.62,
                peakWeight: 0.36,
                avgReject: 0.70
            });
            const bassHarmonic = getMusicPlayerInstrumentBandEnergy(profile, 90, 320, 1.18, 0.64, {
                sustainWeight: 0.30,
                liftWeight: 0.58,
                peakWeight: 0.24,
                avgReject: 0.76
            });
            const kickBody = getMusicPlayerInstrumentBandEnergy(profile, 36, 105, 1.40, 0.56, {
                sustainWeight: 0.20,
                liftWeight: 0.78,
                peakWeight: 0.46,
                avgReject: 0.86
            });
            const snareBody = getMusicPlayerInstrumentBandEnergy(profile, 900, 3600, 1.08, 0.68, {
                sustainWeight: 0.18,
                liftWeight: 0.78,
                peakWeight: 0.38,
                avgReject: 0.84
            });
            const leadTone = getMusicPlayerInstrumentBandEnergy(profile, 320, 1500, 1.10, 0.66, {
                sustainWeight: 0.32,
                liftWeight: 0.58,
                peakWeight: 0.24,
                avgReject: 0.75
            });
            const airTone = getMusicPlayerInstrumentBandEnergy(profile, 3600, 11200, 1.18, 0.64, {
                sustainWeight: 0.16,
                liftWeight: 0.82,
                peakWeight: 0.44,
                avgReject: 0.86
            });
            const bassSource = Math.max(
                bassFundamental * 0.82 + bassHarmonic * 0.22,
                subPulse * 0.70 + bassFundamental * 0.44,
                getMusicPlayerAdaptiveBandEnergy(profile, 0.006, bassEnd, 0.86, 0.60)
            );
            const rawBassGuitar = Math.max(0, Math.min(1, Math.pow(bassSource, 0.76) * 0.92));
            const rawBass = Math.max(0, Math.min(1, rawBassGuitar * 0.84 + subPulse * 0.20));
            const rawMid = getMusicPlayerAdaptiveBandEnergy(profile, bassEnd, midEnd, 0.94, 0.70);
            const rawHighMid = getMusicPlayerAdaptiveBandEnergy(profile, midEnd, highMidEnd, 1.00, 0.66);
            const rawTreble = getMusicPlayerAdaptiveBandEnergy(profile, highMidEnd, 0.965, 1.06, 0.62);
            const rawDrumSnap = Math.max(0, Math.min(1, kickBody * 0.56 + snareBody * 0.58));
            const rawLeadTone = Math.max(0, Math.min(1, leadTone * 0.72 + rawHighMid * 0.26));
            const rawAir = Math.max(0, Math.min(1, airTone * 0.72 + rawTreble * 0.24));
            const rawEnergy = Math.max(0, Math.min(1, rawBass * 0.28 + rawMid * 0.18 + rawHighMid * 0.22 + rawTreble * 0.16 + rawDrumSnap * 0.12));
            const flux = Math.max(0, rawEnergy - musicPlayerVisualSignal.previousEnergy * 0.86);
            const bassFlux = Math.max(0, rawBassGuitar - musicPlayerVisualSignal.previousBassGuitar * 0.965);
            const pulseTarget = Math.max(0, Math.min(1, Math.pow(flux * 4.0, 0.70)));
            const bassPulseTarget = Math.max(0, Math.min(1, Math.pow(Math.max(bassFlux * 7.2, subPulse * 0.68 + kickBody * 0.22), 0.56)));

            musicPlayerVisualSignal.bass = approachMusicPlayerSignal(musicPlayerVisualSignal.bass, rawBass, dt, 22, 8.5);
            musicPlayerVisualSignal.bassGuitar = approachMusicPlayerSignal(musicPlayerVisualSignal.bassGuitar, rawBassGuitar, dt, 26, 9.2);
            musicPlayerVisualSignal.mid = approachMusicPlayerSignal(musicPlayerVisualSignal.mid, rawMid, dt, 12, 5.4);
            musicPlayerVisualSignal.highMid = approachMusicPlayerSignal(musicPlayerVisualSignal.highMid, rawHighMid, dt, 13, 5.8);
            musicPlayerVisualSignal.treble = approachMusicPlayerSignal(musicPlayerVisualSignal.treble, rawTreble, dt, 12, 5.0);
            musicPlayerVisualSignal.drumSnap = approachMusicPlayerSignal(musicPlayerVisualSignal.drumSnap, rawDrumSnap, dt, 22, 6.6);
            musicPlayerVisualSignal.leadTone = approachMusicPlayerSignal(musicPlayerVisualSignal.leadTone, rawLeadTone, dt, 13, 5.4);
            musicPlayerVisualSignal.air = approachMusicPlayerSignal(musicPlayerVisualSignal.air, rawAir, dt, 18, 7.2);
            musicPlayerVisualSignal.energy = approachMusicPlayerSignal(musicPlayerVisualSignal.energy, rawEnergy, dt, 12, 5.4);
            musicPlayerVisualSignal.pulse = approachMusicPlayerSignal(musicPlayerVisualSignal.pulse, pulseTarget, dt, 16, 4.2);
            musicPlayerVisualSignal.bassPulse = approachMusicPlayerSignal(musicPlayerVisualSignal.bassPulse, bassPulseTarget, dt, 30, 5.0);
            musicPlayerVisualSignal.phase += dt * (0.052 + musicPlayerVisualSignal.energy * 0.095 + musicPlayerVisualSignal.pulse * 0.040);
            musicPlayerVisualSignal.previousEnergy = rawEnergy;
            musicPlayerVisualSignal.previousBass = rawBass;
            musicPlayerVisualSignal.previousBassGuitar = rawBassGuitar;
            musicPlayerVisualSignal.bands = {
                bass: [0.006, bassEnd],
                mid: [bassEnd, midEnd],
                highMid: [midEnd, highMidEnd],
                treble: [highMidEnd, 0.965],
                instruments: {
                    bassGuitar: [45, 320],
                    drums: [36, 105, 900, 3600],
                    leadTone: [320, 1500],
                    air: [3600, 11200]
                },
                age: profile.age
            };
            return musicPlayerVisualSignal;
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
            resetMusicPlayerVisualProfile();
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
            const duration = getMusicPlayerDuration();
            const current = getMusicPlayerPosition();
            if (duration > 0 && current >= MUSIC_PLAYER_PREVIOUS_TRACK_GRACE_SECONDS) {
                musicPlayerPosition = 0;
                if (musicPlayerIsPlaying) return playMusicPlayerFrom(0);
                return true;
            }
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
            if (isMatrixCrawlerMusicContext()) playMatrixCrawlerBgm(0);
            else playBgm(0);
        }

        function resumeMainMusic(fadeInTime = 2.0) {
            if (isMatrixCrawlerMusicContext()) playMatrixCrawlerBgm(fadeInTime);
            else playBgm(fadeInTime);
        }

        function startGalaxySelectMusic(fadeInTime = 0.45) {
            if (typeof musicPlayerIsPlaying !== 'undefined' && musicPlayerIsPlaying) return false;
            if (bossMusicTimeout) { clearTimeout(bossMusicTimeout); bossMusicTimeout = null; }
            stopBossMusic(0);
            bgmOffset = 0;
            playBgmBuffers(
                bufBoss9RoseIntro,
                bufBoss9RoseLoop,
                fadeInTime,
                0,
                'galaxySelect',
                () => {
                    if (typeof gameState !== 'undefined' && (gameState === 'GALAXY_SELECT' || gameState === 'TERMINAL_DOCK' || gameState === 'SHIP_SELECT')) {
                        startGalaxySelectMusic(fadeInTime);
                    }
                }
            );
            return true;
        }

        function ensureGalaxySelectMusic(fadeInTime = 0.35) {
            if (typeof musicPlayerIsPlaying !== 'undefined' && musicPlayerIsPlaying) return false;
            if (bgmTrackMode === 'galaxySelect' && bgmIsPlaying) return true;
            return startGalaxySelectMusic(fadeInTime);
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
