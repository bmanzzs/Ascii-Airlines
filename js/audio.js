        // Audio buffers, music routing, SFX, and boss track helpers.
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.4;
        const gameAudioAnalyser = audioCtx.createAnalyser();
        gameAudioAnalyser.fftSize = 512;
        gameAudioAnalyser.smoothingTimeConstant = 0.58;
        gameAudioAnalyser.minDecibels = -96;
        gameAudioAnalyser.maxDecibels = -18;
        gainNode.connect(gameAudioAnalyser);
        gameAudioAnalyser.connect(audioCtx.destination);

        const bgmGain = audioCtx.createGain();
        bgmGain.connect(gainNode);
        const bossGain = audioCtx.createGain();
        bossGain.connect(gainNode);
        const musicPlayerGain = audioCtx.createGain();
        musicPlayerGain.gain.value = 1;
        const musicPlayerAnalyser = audioCtx.createAnalyser();
        musicPlayerAnalyser.fftSize = 1024;
        musicPlayerAnalyser.smoothingTimeConstant = 0.22;
        musicPlayerAnalyser.minDecibels = -96;
        musicPlayerAnalyser.maxDecibels = -18;
        musicPlayerGain.connect(musicPlayerAnalyser);
        musicPlayerAnalyser.connect(gainNode);
        const gameAudioFrequencyData = new Uint8Array(gameAudioAnalyser.frequencyBinCount);
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
        let musicPlayerFullscreen = false;
        let musicPlayerFullscreenLastInput = 0;
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
            kick: 0,
            snare: 0,
            snareImpact: 0,
            hat: 0,
            melody: 0,
            melodyFlux: 0,
            spectralFlux: 0,
            sectionEnergy: 0,
            loudness: 0,
            brightness: 0,
            activity: 0,
            absoluteEnergy: 0,
            phase: 0,
            previousBass: 0,
            previousBassGuitar: 0,
            previousEnergy: 0,
            lastTime: 0,
            levels: null,
            bands: null,
            perceptual: null,
            events: null,
            envelopes: null,
            impulses: null,
            source: 'live',
            analysis: null
        };
        const musicPlayerReactiveEventState = {
            kick: { value: 0, cooldown: 0, previousDrive: 0 },
            snare: { value: 0, cooldown: 0, previousDrive: 0 },
            hat: { value: 0, cooldown: 0, previousDrive: 0 },
            bassOnset: { value: 0, cooldown: 0, previousDrive: 0 },
            melodyOnset: { value: 0, cooldown: 0, previousDrive: 0 }
        };
        const MUSIC_ANALYSIS_FRAME_RATE = 60;
        const MUSIC_ANALYSIS_CHUNK_SAMPLES = 42000;
        const MUSIC_ANALYSIS_COL = Object.freeze({
            sub: 0,
            bass: 1,
            lowMid: 2,
            mid: 3,
            presence: 4,
            air: 5,
            globalEnergy: 6,
            loudness: 7,
            brightness: 8,
            spectralFlux: 9,
            kick: 10,
            snare: 11,
            hat: 12,
            melodyFlux: 13
        });
        const MUSIC_ANALYSIS_COL_COUNT = 14;
        const MUSIC_ANALYSIS_BAND_COLUMNS = [
            MUSIC_ANALYSIS_COL.sub,
            MUSIC_ANALYSIS_COL.bass,
            MUSIC_ANALYSIS_COL.lowMid,
            MUSIC_ANALYSIS_COL.mid,
            MUSIC_ANALYSIS_COL.presence,
            MUSIC_ANALYSIS_COL.air
        ];
        const musicBufferAnalysisCache = typeof WeakMap === 'function' ? new WeakMap() : null;
        const musicPlayerAnalysisSampleScratch = {
            sub: 0,
            bass: 0,
            lowMid: 0,
            mid: 0,
            presence: 0,
            air: 0,
            globalEnergy: 0,
            loudness: 0,
            brightness: 0,
            spectralFlux: 0,
            kick: 0,
            snare: 0,
            hat: 0,
            melodyFlux: 0,
            confidence: 0,
            progress: 0,
            frameIndex: 0,
            phase: '',
            state: 'idle',
            source: 'cached'
        };
        const musicPlayerAnalysisEventLatch = {
            analysis: null,
            phase: '',
            lastFrame: -1,
            kick: -1,
            snare: -1,
            hat: -1,
            melodyFlux: -1
        };
        let gameAudioVisualSignal = {
            bass: 0,
            bassGuitar: 0,
            mid: 0,
            highMid: 0,
            treble: 0,
            drumSnap: 0,
            leadTone: 0,
            air: 0,
            energy: 0,
            pulse: 0,
            bassPulse: 0,
            activity: 0,
            absoluteEnergy: 0,
            phase: 0,
            previousEnergy: 0,
            previousBass: 0,
            lastTime: 0
        };
        let musicPlayerVisualProfile = {
            trackIndex: -1,
            binCount: 0,
            age: 0,
            averages: [],
            fast: [],
            bassEnd: 0.09,
            midEnd: 0.25,
            highMidEnd: 0.58,
            perceptualBands: null,
            perceptualOrder: [],
            fluxAverage: 0,
            fluxPeak: 0,
            rawEnergyAverage: 0,
            rawEnergyPeak: 0
        };
        const MUSIC_PLAYER_PERCEPTUAL_BAND_DEFS = [
            { key: 'subBass', label: 'SUB', lowHz: 22, highHz: 58, gain: 1.28, curve: 0.58 },
            { key: 'bass', label: 'BASS', lowHz: 58, highHz: 165, gain: 1.20, curve: 0.60 },
            { key: 'lowMids', label: 'LOW MID', lowHz: 165, highHz: 430, gain: 1.02, curve: 0.66 },
            { key: 'mids', label: 'MID', lowHz: 430, highHz: 1400, gain: 1.05, curve: 0.68 },
            { key: 'presence', label: 'PRES', lowHz: 1400, highHz: 5200, gain: 1.10, curve: 0.62 },
            { key: 'brilliance', label: 'AIR', lowHz: 5200, highHz: 15000, gain: 1.16, curve: 0.58 }
        ];
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
            // Load the title soundtrack first so launch does not wait for every track.
            [bufBoss9RoseIntro, bufBoss9RoseLoop] = await Promise.all([
                loadBuffer('./audio/ascii-airlines-boss9rose-intro.mp3'),
                loadBuffer('./audio/ascii-airlines-boss9rose-loop.mp3')
            ]);
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

        // Phase 2: lazily cache compact feature frames for decoded music-player buffers.
        // The live analyser remains the fallback while these chunks are still processing.
        function getMusicAnalysisScheduler() {
            if (typeof requestIdleCallback === 'function') {
                return (fn) => requestIdleCallback(fn, { timeout: 80 });
            }
            return (fn) => setTimeout(fn, 0);
        }

        function getMusicAnalysisProgress(analysis) {
            if (!analysis) return 0;
            if (analysis.state === 'ready') return 1;
            return Math.max(0, Math.min(1, analysis.processedSamples / Math.max(1, analysis.sampleCount)));
        }

        function getMusicBufferAnalysis(buffer) {
            if (!buffer || !musicBufferAnalysisCache) return null;
            return musicBufferAnalysisCache.get(buffer) || null;
        }

        function createMusicBufferAnalysis(buffer, options = {}) {
            if (!buffer || !musicBufferAnalysisCache) return null;
            const existing = musicBufferAnalysisCache.get(buffer);
            if (existing) {
                scheduleMusicBufferAnalysis(existing);
                return existing;
            }

            const frameRate = MUSIC_ANALYSIS_FRAME_RATE;
            const sampleRate = Math.max(1, buffer.sampleRate || audioCtx.sampleRate || 44100);
            const sampleCount = Math.max(1, buffer.length || 1);
            const duration = Math.max(0.001, buffer.duration || sampleCount / sampleRate);
            const frameCount = Math.max(2, Math.ceil(duration * frameRate) + 1);
            const cutoffToAlpha = (hz) => {
                const x = Math.exp(-2 * Math.PI * Math.max(1, Math.min(sampleRate * 0.45, hz)) / sampleRate);
                return 1 - x;
            };
            const analysis = {
                buffer,
                label: options.label || '',
                state: 'queued',
                frameRate,
                duration,
                sampleRate,
                sampleCount,
                processedSamples: 0,
                frameIndex: 0,
                frameCount,
                hopSamples: sampleRate / frameRate,
                nextFrameSample: Math.max(1, Math.round(sampleRate / frameRate)),
                data: new Float32Array(frameCount * MUSIC_ANALYSIS_COL_COUNT),
                channel0: buffer.getChannelData(0),
                channel1: buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : null,
                lp22: 0,
                lp58: 0,
                lp165: 0,
                lp430: 0,
                lp1400: 0,
                lp5200: 0,
                lp15000: 0,
                a22: cutoffToAlpha(22),
                a58: cutoffToAlpha(58),
                a165: cutoffToAlpha(165),
                a430: cutoffToAlpha(430),
                a1400: cutoffToAlpha(1400),
                a5200: cutoffToAlpha(5200),
                a15000: cutoffToAlpha(15000),
                accSub: 0,
                accBass: 0,
                accLowMid: 0,
                accMid: 0,
                accPresence: 0,
                accAir: 0,
                accEnergy: 0,
                accBrightness: 0,
                accPeak: 0,
                accCount: 0,
                scheduled: false,
                readyAt: 0
            };
            musicBufferAnalysisCache.set(buffer, analysis);
            scheduleMusicBufferAnalysis(analysis);
            return analysis;
        }

        function resetMusicBufferAnalysisAccumulators(analysis) {
            analysis.accSub = 0;
            analysis.accBass = 0;
            analysis.accLowMid = 0;
            analysis.accMid = 0;
            analysis.accPresence = 0;
            analysis.accAir = 0;
            analysis.accEnergy = 0;
            analysis.accBrightness = 0;
            analysis.accPeak = 0;
            analysis.accCount = 0;
        }

        function commitMusicBufferAnalysisFrame(analysis) {
            if (!analysis || analysis.frameIndex >= analysis.frameCount || analysis.accCount <= 0) return;
            const count = Math.max(1, analysis.accCount);
            const offset = analysis.frameIndex * MUSIC_ANALYSIS_COL_COUNT;
            const data = analysis.data;
            const rms = Math.sqrt(analysis.accEnergy / count);
            data[offset + MUSIC_ANALYSIS_COL.sub] = Math.sqrt(analysis.accSub / count);
            data[offset + MUSIC_ANALYSIS_COL.bass] = Math.sqrt(analysis.accBass / count);
            data[offset + MUSIC_ANALYSIS_COL.lowMid] = Math.sqrt(analysis.accLowMid / count);
            data[offset + MUSIC_ANALYSIS_COL.mid] = Math.sqrt(analysis.accMid / count);
            data[offset + MUSIC_ANALYSIS_COL.presence] = Math.sqrt(analysis.accPresence / count);
            data[offset + MUSIC_ANALYSIS_COL.air] = Math.sqrt(analysis.accAir / count);
            data[offset + MUSIC_ANALYSIS_COL.globalEnergy] = rms;
            data[offset + MUSIC_ANALYSIS_COL.loudness] = rms * 0.72 + analysis.accPeak * 0.28;
            data[offset + MUSIC_ANALYSIS_COL.brightness] = analysis.accBrightness / count;
            analysis.frameIndex++;
            analysis.nextFrameSample = Math.max(analysis.nextFrameSample + 1, Math.round((analysis.frameIndex + 1) * analysis.hopSamples));
            resetMusicBufferAnalysisAccumulators(analysis);
        }

        function processMusicBufferAnalysisChunk(analysis, deadline) {
            if (!analysis || analysis.state === 'ready') return;
            analysis.state = 'processing';
            const startTime = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
            const maxSamples = MUSIC_ANALYSIS_CHUNK_SAMPLES;
            const sampleEnd = analysis.sampleCount;
            const ch0 = analysis.channel0;
            const ch1 = analysis.channel1;
            let processed = 0;

            while (analysis.processedSamples < sampleEnd && processed < maxSamples) {
                if (deadline && typeof deadline.timeRemaining === 'function' && processed > 768 && deadline.timeRemaining() <= 1) break;
                if (!deadline && processed > 4096) {
                    const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
                    if (now - startTime > 5.5) break;
                }

                const i = analysis.processedSamples;
                const sample = ch1 ? (ch0[i] + ch1[i]) * 0.5 : ch0[i];
                analysis.lp22 += (sample - analysis.lp22) * analysis.a22;
                analysis.lp58 += (sample - analysis.lp58) * analysis.a58;
                analysis.lp165 += (sample - analysis.lp165) * analysis.a165;
                analysis.lp430 += (sample - analysis.lp430) * analysis.a430;
                analysis.lp1400 += (sample - analysis.lp1400) * analysis.a1400;
                analysis.lp5200 += (sample - analysis.lp5200) * analysis.a5200;
                analysis.lp15000 += (sample - analysis.lp15000) * analysis.a15000;

                const sub = analysis.lp58 - analysis.lp22;
                const bass = analysis.lp165 - analysis.lp58;
                const lowMid = analysis.lp430 - analysis.lp165;
                const mid = analysis.lp1400 - analysis.lp430;
                const presence = analysis.lp5200 - analysis.lp1400;
                const air = analysis.lp15000 - analysis.lp5200;
                const absSample = Math.abs(sample);
                analysis.accSub += sub * sub;
                analysis.accBass += bass * bass;
                analysis.accLowMid += lowMid * lowMid;
                analysis.accMid += mid * mid;
                analysis.accPresence += presence * presence;
                analysis.accAir += air * air;
                analysis.accEnergy += sample * sample;
                analysis.accBrightness += Math.abs(air) * 0.58 + Math.abs(presence) * 0.30 + Math.abs(mid) * 0.12;
                if (absSample > analysis.accPeak) analysis.accPeak = absSample;
                analysis.accCount++;
                analysis.processedSamples++;
                processed++;

                if (analysis.processedSamples >= analysis.nextFrameSample) {
                    commitMusicBufferAnalysisFrame(analysis);
                }
            }

            if (analysis.processedSamples >= sampleEnd) {
                commitMusicBufferAnalysisFrame(analysis);
                finalizeMusicBufferAnalysis(analysis);
            } else {
                scheduleMusicBufferAnalysis(analysis);
            }
        }

        function getMusicAnalysisColumnPercentile(analysis, column, percentile) {
            const count = Math.max(1, analysis.frameCount);
            const values = new Float32Array(count);
            const data = analysis.data;
            for (let i = 0; i < count; i++) values[i] = data[i * MUSIC_ANALYSIS_COL_COUNT + column] || 0;
            values.sort();
            return values[Math.max(0, Math.min(count - 1, Math.floor((count - 1) * percentile)))] || 0;
        }

        function normalizeMusicAnalysisColumn(analysis, column, floorMul = 0.58, curve = 0.72) {
            const floor = getMusicAnalysisColumnPercentile(analysis, column, 0.18) * floorMul;
            const peak = Math.max(floor + 0.00001, getMusicAnalysisColumnPercentile(analysis, column, 0.955));
            const data = analysis.data;
            for (let i = 0; i < analysis.frameCount; i++) {
                const offset = i * MUSIC_ANALYSIS_COL_COUNT + column;
                data[offset] = clampMusicPlayer01(Math.pow(Math.max(0, data[offset] - floor) / Math.max(0.00001, peak - floor), curve));
            }
        }

        function normalizeMusicAnalysisEventColumn(analysis, column, threshold, cooldownFrames, gain = 1) {
            const data = analysis.data;
            let cooldown = 0;
            let previous = 0;
            for (let i = 0; i < analysis.frameCount; i++) {
                const offset = i * MUSIC_ANALYSIS_COL_COUNT + column;
                const value = clampMusicPlayer01(data[offset] * gain);
                const rise = Math.max(0, value - previous * 0.72);
                const fired = cooldown <= 0 && value >= threshold && rise >= threshold * 0.34;
                data[offset] = fired ? value : 0;
                cooldown = fired ? cooldownFrames : Math.max(0, cooldown - 1);
                previous = value;
            }
        }

        function finalizeMusicBufferAnalysis(analysis) {
            if (!analysis || analysis.state === 'ready') return;
            analysis.frameCount = Math.max(1, Math.min(analysis.frameCount, analysis.frameIndex));
            const data = analysis.data;
            for (const column of [
                MUSIC_ANALYSIS_COL.sub,
                MUSIC_ANALYSIS_COL.bass,
                MUSIC_ANALYSIS_COL.lowMid,
                MUSIC_ANALYSIS_COL.mid,
                MUSIC_ANALYSIS_COL.presence,
                MUSIC_ANALYSIS_COL.air,
                MUSIC_ANALYSIS_COL.globalEnergy,
                MUSIC_ANALYSIS_COL.loudness,
                MUSIC_ANALYSIS_COL.brightness
            ]) {
                normalizeMusicAnalysisColumn(analysis, column, column === MUSIC_ANALYSIS_COL.brightness ? 0.42 : 0.56, column === MUSIC_ANALYSIS_COL.globalEnergy ? 0.82 : 0.72);
            }

            let fluxPeak = 0.0001;
            for (let i = 1; i < analysis.frameCount; i++) {
                const offset = i * MUSIC_ANALYSIS_COL_COUNT;
                const previousOffset = (i - 1) * MUSIC_ANALYSIS_COL_COUNT;
                let flux = 0;
                for (let b = 0; b < MUSIC_ANALYSIS_BAND_COLUMNS.length; b++) {
                    const col = MUSIC_ANALYSIS_BAND_COLUMNS[b];
                    const delta = Math.max(0, data[offset + col] - data[previousOffset + col] * 0.88);
                    flux += delta * (b < 2 ? 1.15 : (b >= 4 ? 1.02 : 0.92));
                }
                data[offset + MUSIC_ANALYSIS_COL.spectralFlux] = flux;
                if (flux > fluxPeak) fluxPeak = flux;
            }
            for (let i = 0; i < analysis.frameCount; i++) {
                const offset = i * MUSIC_ANALYSIS_COL_COUNT;
                const previousOffset = Math.max(0, i - 1) * MUSIC_ANALYSIS_COL_COUNT;
                const subRise = Math.max(0, data[offset + MUSIC_ANALYSIS_COL.sub] - data[previousOffset + MUSIC_ANALYSIS_COL.sub] * 0.86);
                const bassRise = Math.max(0, data[offset + MUSIC_ANALYSIS_COL.bass] - data[previousOffset + MUSIC_ANALYSIS_COL.bass] * 0.84);
                const midRise = Math.max(0, data[offset + MUSIC_ANALYSIS_COL.mid] - data[previousOffset + MUSIC_ANALYSIS_COL.mid] * 0.82);
                const presenceRise = Math.max(0, data[offset + MUSIC_ANALYSIS_COL.presence] - data[previousOffset + MUSIC_ANALYSIS_COL.presence] * 0.80);
                const airRise = Math.max(0, data[offset + MUSIC_ANALYSIS_COL.air] - data[previousOffset + MUSIC_ANALYSIS_COL.air] * 0.76);
                const flux = clampMusicPlayer01(Math.pow(data[offset + MUSIC_ANALYSIS_COL.spectralFlux] / Math.max(0.0001, fluxPeak), 0.72));
                data[offset + MUSIC_ANALYSIS_COL.spectralFlux] = flux;
                data[offset + MUSIC_ANALYSIS_COL.kick] = clampMusicPlayer01(Math.pow((subRise * 0.68 + bassRise * 0.90) * (0.45 + data[offset + MUSIC_ANALYSIS_COL.bass] * 0.55), 0.68) * 1.45);
                data[offset + MUSIC_ANALYSIS_COL.snare] = clampMusicPlayer01(Math.pow(midRise * 0.24 + presenceRise * 0.62 + airRise * 0.18, 0.70) * (0.45 + data[offset + MUSIC_ANALYSIS_COL.presence] * 0.48));
                data[offset + MUSIC_ANALYSIS_COL.hat] = clampMusicPlayer01(Math.pow(airRise * 0.84 + presenceRise * 0.18, 0.68) * (0.38 + data[offset + MUSIC_ANALYSIS_COL.air] * 0.58));
                data[offset + MUSIC_ANALYSIS_COL.melodyFlux] = clampMusicPlayer01(Math.pow(midRise * 0.28 + presenceRise * 0.44 + flux * 0.24, 0.76));
            }
            normalizeMusicAnalysisEventColumn(analysis, MUSIC_ANALYSIS_COL.kick, 0.24, Math.round(MUSIC_ANALYSIS_FRAME_RATE * 0.13), 1.08);
            normalizeMusicAnalysisEventColumn(analysis, MUSIC_ANALYSIS_COL.snare, 0.22, Math.round(MUSIC_ANALYSIS_FRAME_RATE * 0.10), 1.04);
            normalizeMusicAnalysisEventColumn(analysis, MUSIC_ANALYSIS_COL.hat, 0.24, Math.round(MUSIC_ANALYSIS_FRAME_RATE * 0.045), 0.92);
            normalizeMusicAnalysisEventColumn(analysis, MUSIC_ANALYSIS_COL.melodyFlux, 0.20, Math.round(MUSIC_ANALYSIS_FRAME_RATE * 0.10), 0.82);
            analysis.state = 'ready';
            analysis.processedSamples = analysis.sampleCount;
            analysis.progress = 1;
            analysis.readyAt = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        }

        function scheduleMusicBufferAnalysis(analysis) {
            if (!analysis || analysis.state === 'ready' || analysis.scheduled) return;
            analysis.scheduled = true;
            getMusicAnalysisScheduler()((deadline) => {
                analysis.scheduled = false;
                processMusicBufferAnalysisChunk(analysis, deadline);
            });
        }

        function ensureMusicBufferAnalysis(buffer, label = '') {
            if (!buffer) return null;
            return createMusicBufferAnalysis(buffer, { label });
        }

        function ensureMusicPlayerTrackAnalysis(trackIndex = musicPlayerTrackIndex) {
            const track = getMusicPlayerTrack(trackIndex);
            const buffers = getMusicPlayerTrackBuffers(track);
            ensureMusicBufferAnalysis(buffers.intro, 'intro');
            ensureMusicBufferAnalysis(buffers.loop, 'loop');
            ensureMusicBufferAnalysis(buffers.loopOnly, 'single');
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

        // Sample the buffer that is actually audible: intro, loop-relative, or loopOnly-relative.
        function getMusicPlayerCurrentAnalysisTarget() {
            const track = getMusicPlayerTrack();
            const buffers = getMusicPlayerTrackBuffers(track);
            const position = getMusicPlayerPosition();
            if (musicPlayerPhase === 'intro' && buffers.intro) {
                return {
                    buffer: buffers.intro,
                    phase: 'intro',
                    time: Math.max(0, Math.min(buffers.intro.duration || 0, position))
                };
            }
            if (musicPlayerPhase === 'loop' && buffers.loop) {
                const introDuration = buffers.intro ? (buffers.intro.duration || 0) : 0;
                const loopDuration = Math.max(0.001, buffers.loop.duration || 0.001);
                return {
                    buffer: buffers.loop,
                    phase: 'loop',
                    time: Math.max(0, position - introDuration) % loopDuration
                };
            }
            if (musicPlayerPhase === 'single' && buffers.loopOnly) {
                const singleDuration = Math.max(0.001, buffers.loopOnly.duration || 0.001);
                return {
                    buffer: buffers.loopOnly,
                    phase: 'single',
                    time: position % singleDuration
                };
            }
            return { buffer: null, phase: musicPlayerPhase || 'stopped', time: 0 };
        }

        function sampleMusicAnalysisAt(analysis, timeSeconds, phase = '') {
            if (!analysis || analysis.state !== 'ready' || analysis.frameCount <= 0) return null;
            const safeDuration = Math.max(0.001, analysis.duration || 0.001);
            const loopTime = phase === 'loop' || phase === 'single'
                ? ((timeSeconds % safeDuration) + safeDuration) % safeDuration
                : Math.max(0, Math.min(safeDuration, timeSeconds || 0));
            const exactFrame = Math.max(0, Math.min(Math.max(0, analysis.frameCount - 1), loopTime * analysis.frameRate));
            const frameIndex = Math.max(0, Math.min(analysis.frameCount - 1, Math.floor(exactFrame)));
            const nextFrame = Math.max(frameIndex, Math.min(analysis.frameCount - 1, frameIndex + 1));
            const blend = Math.max(0, Math.min(1, exactFrame - frameIndex));
            const data = analysis.data;
            const read = (column) => {
                const a = data[frameIndex * MUSIC_ANALYSIS_COL_COUNT + column] || 0;
                const b = data[nextFrame * MUSIC_ANALYSIS_COL_COUNT + column] || a;
                return a + (b - a) * blend;
            };
            if (
                musicPlayerAnalysisEventLatch.analysis !== analysis
                || musicPlayerAnalysisEventLatch.phase !== phase
                || frameIndex < musicPlayerAnalysisEventLatch.lastFrame - 1
            ) {
                musicPlayerAnalysisEventLatch.analysis = analysis;
                musicPlayerAnalysisEventLatch.phase = phase;
                musicPlayerAnalysisEventLatch.kick = -1;
                musicPlayerAnalysisEventLatch.snare = -1;
                musicPlayerAnalysisEventLatch.hat = -1;
                musicPlayerAnalysisEventLatch.melodyFlux = -1;
            }
            musicPlayerAnalysisEventLatch.lastFrame = frameIndex;
            const readEvent = (column, eventName) => {
                const value = data[frameIndex * MUSIC_ANALYSIS_COL_COUNT + column] || 0;
                if (value <= 0) return 0;
                if (musicPlayerAnalysisEventLatch[eventName] === frameIndex) return 0;
                musicPlayerAnalysisEventLatch[eventName] = frameIndex;
                return value;
            };
            const sample = musicPlayerAnalysisSampleScratch;
            sample.sub = read(MUSIC_ANALYSIS_COL.sub);
            sample.bass = read(MUSIC_ANALYSIS_COL.bass);
            sample.lowMid = read(MUSIC_ANALYSIS_COL.lowMid);
            sample.mid = read(MUSIC_ANALYSIS_COL.mid);
            sample.presence = read(MUSIC_ANALYSIS_COL.presence);
            sample.air = read(MUSIC_ANALYSIS_COL.air);
            sample.globalEnergy = read(MUSIC_ANALYSIS_COL.globalEnergy);
            sample.loudness = read(MUSIC_ANALYSIS_COL.loudness);
            sample.brightness = read(MUSIC_ANALYSIS_COL.brightness);
            sample.spectralFlux = read(MUSIC_ANALYSIS_COL.spectralFlux);
            sample.kick = readEvent(MUSIC_ANALYSIS_COL.kick, 'kick');
            sample.snare = readEvent(MUSIC_ANALYSIS_COL.snare, 'snare');
            sample.hat = readEvent(MUSIC_ANALYSIS_COL.hat, 'hat');
            sample.melodyFlux = readEvent(MUSIC_ANALYSIS_COL.melodyFlux, 'melodyFlux');
            sample.confidence = 1;
            sample.progress = 1;
            sample.frameIndex = frameIndex;
            sample.phase = phase;
            sample.state = analysis.state;
            sample.source = 'cached';
            return sample;
        }

        function getMusicPlayerCurrentAnalysisFrame() {
            ensureMusicPlayerTrackAnalysis(musicPlayerTrackIndex);
            const target = getMusicPlayerCurrentAnalysisTarget();
            if (!target.buffer) return null;
            const analysis = ensureMusicBufferAnalysis(target.buffer, target.phase);
            if (!analysis || analysis.state !== 'ready') return null;
            return sampleMusicAnalysisAt(analysis, target.time, target.phase);
        }

        function getMusicPlayerAnalysisDebugState(source = 'live') {
            const target = getMusicPlayerCurrentAnalysisTarget();
            const analysis = target.buffer ? getMusicBufferAnalysis(target.buffer) : null;
            return {
                source,
                phase: target.phase || musicPlayerPhase || 'stopped',
                state: analysis ? analysis.state : 'idle',
                progress: getMusicAnalysisProgress(analysis)
            };
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

        function getMusicPlayerHzBandEnergy(lowHz, highHz, gain = 1, curve = 0.66) {
            const range = getMusicPlayerFrequencyBinRange(lowHz, highHz);
            let sum = 0;
            let peak = 0;
            for (let i = range.start; i < range.end; i++) {
                const value = musicPlayerFrequencyData[i] || 0;
                sum += value;
                if (value > peak) peak = value;
            }
            const avg = sum / Math.max(1, range.end - range.start);
            const mixed = clampMusicPlayer01((avg * 0.58 + peak * 0.42) / 255);
            return clampMusicPlayer01(Math.pow(mixed, curve) * gain);
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

        function clampMusicPlayer01(value) {
            return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
        }

        function createMusicPlayerPerceptualBandState(def) {
            return {
                key: def.key,
                label: def.label,
                lowHz: def.lowHz,
                highHz: def.highHz,
                raw: 0,
                smoothed: 0,
                average: 0,
                peak: 0.08,
                normalized: 0,
                previousNormalized: 0,
                onset: 0,
                envelope: 0
            };
        }

        function createMusicPlayerPerceptualBandMap() {
            const bands = {};
            for (const def of MUSIC_PLAYER_PERCEPTUAL_BAND_DEFS) {
                bands[def.key] = createMusicPlayerPerceptualBandState(def);
            }
            return bands;
        }

        function getMusicPlayerPerceptualBandRaw(def) {
            const range = getMusicPlayerFrequencyBinRange(def.lowHz, def.highHz);
            let sum = 0;
            let peak = 0;
            let weighted = 0;
            for (let i = range.start; i < range.end; i++) {
                const normalized = clampMusicPlayer01((musicPlayerFrequencyData[i] || 0) / 255);
                const shaped = Math.pow(normalized, 0.72);
                const binT = (i - range.start) / Math.max(1, range.end - range.start - 1);
                const centerWeight = 0.78 + Math.sin(binT * Math.PI) * 0.22;
                sum += shaped;
                weighted += shaped * centerWeight;
                if (shaped > peak) peak = shaped;
            }
            const count = Math.max(1, range.end - range.start);
            const avg = sum / count;
            const weightedAvg = weighted / count;
            return clampMusicPlayer01(Math.pow(avg * 0.42 + weightedAvg * 0.24 + peak * 0.34, def.curve || 0.64) * (def.gain || 1));
        }

        function updateMusicPlayerPerceptualBands(profile, dt) {
            if (!profile.perceptualBands) {
                profile.perceptualBands = createMusicPlayerPerceptualBandMap();
                profile.perceptualOrder = MUSIC_PLAYER_PERCEPTUAL_BAND_DEFS.map(def => def.key);
            }

            let flux = 0;
            let energy = 0;
            let brightness = 0;
            const weights = {
                subBass: 0.13,
                bass: 0.23,
                lowMids: 0.16,
                mids: 0.17,
                presence: 0.18,
                brilliance: 0.13
            };
            const confidence = clampMusicPlayer01(profile.age / 8);
            for (const def of MUSIC_PLAYER_PERCEPTUAL_BAND_DEFS) {
                const band = profile.perceptualBands[def.key];
                const raw = getMusicPlayerPerceptualBandRaw(def);
                const rise = 30 - confidence * 8;
                const fall = 8 + confidence * 2;
                band.raw = raw;
                band.smoothed = approachMusicPlayerSignal(band.smoothed, raw, dt, rise, fall);
                const averageRate = Math.min(1, dt * (profile.age < 6 ? 0.78 : 0.105));
                band.average += (raw - band.average) * averageRate;
                band.peak = Math.max(raw, band.peak * Math.pow(0.84, dt));
                band.peak = Math.max(band.peak, band.average + 0.065);
                const adaptiveFloor = Math.max(0.004, band.average * (0.48 + confidence * 0.08));
                const normalized = clampMusicPlayer01((band.smoothed - adaptiveFloor) / Math.max(0.045, band.peak - adaptiveFloor));
                const onsetDelta = Math.max(0, normalized - band.previousNormalized * (0.91 + confidence * 0.035));
                band.normalized = Math.pow(normalized, 0.76);
                band.onset = Math.max(band.onset * Math.pow(0.045, dt), clampMusicPlayer01(Math.pow(onsetDelta * 6.2, 0.70)));
                band.envelope = approachMusicPlayerSignal(band.envelope, Math.max(band.normalized, band.onset * 0.82), dt, 20, 4.4);
                flux += onsetDelta * (0.85 + (weights[def.key] || 0.15) * 1.6);
                energy += band.raw * (weights[def.key] || 0.15);
                if (def.key === 'presence' || def.key === 'brilliance') brightness += band.normalized * 0.5;
                band.previousNormalized = normalized;
            }

            profile.fluxAverage += (flux - profile.fluxAverage) * Math.min(1, dt * 0.90);
            profile.fluxPeak = Math.max(flux, (profile.fluxPeak || 0.12) * Math.pow(0.55, dt));
            const spectralFlux = clampMusicPlayer01(
                Math.pow(Math.max(0, flux - profile.fluxAverage * 0.42) / Math.max(0.025, profile.fluxPeak - profile.fluxAverage * 0.42), 0.72)
            );
            profile.rawEnergyAverage += (energy - profile.rawEnergyAverage) * Math.min(1, dt * (profile.age < 8 ? 0.72 : 0.12));
            profile.rawEnergyPeak = Math.max(energy, (profile.rawEnergyPeak || 0.18) * Math.pow(0.70, dt));
            const loudness = clampMusicPlayer01(
                Math.pow(Math.max(0, energy - profile.rawEnergyAverage * 0.34) / Math.max(0.070, profile.rawEnergyPeak - profile.rawEnergyAverage * 0.34), 0.82)
            );

            return {
                bands: profile.perceptualBands,
                spectralFlux,
                rawEnergy: clampMusicPlayer01(energy),
                loudness,
                brightness: clampMusicPlayer01(brightness),
                confidence
            };
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
            musicPlayerVisualProfile.perceptualBands = createMusicPlayerPerceptualBandMap();
            musicPlayerVisualProfile.perceptualOrder = MUSIC_PLAYER_PERCEPTUAL_BAND_DEFS.map(def => def.key);
            musicPlayerVisualProfile.fluxAverage = 0;
            musicPlayerVisualProfile.fluxPeak = 0.12;
            musicPlayerVisualProfile.rawEnergyAverage = 0;
            musicPlayerVisualProfile.rawEnergyPeak = 0.18;
            musicPlayerVisualSignal.previousEnergy = 0;
            musicPlayerVisualSignal.previousBass = 0;
            musicPlayerVisualSignal.previousBassGuitar = 0;
            musicPlayerVisualSignal.bassPulse = 0;
            musicPlayerVisualSignal.bassGuitar = 0;
            musicPlayerVisualSignal.drumSnap = 0;
            musicPlayerVisualSignal.leadTone = 0;
            musicPlayerVisualSignal.air = 0;
            musicPlayerVisualSignal.kick = 0;
            musicPlayerVisualSignal.snare = 0;
            musicPlayerVisualSignal.snareImpact = 0;
            musicPlayerVisualSignal.hat = 0;
            musicPlayerVisualSignal.melody = 0;
            musicPlayerVisualSignal.melodyFlux = 0;
            musicPlayerVisualSignal.spectralFlux = 0;
            musicPlayerVisualSignal.sectionEnergy = 0;
            musicPlayerVisualSignal.loudness = 0;
            musicPlayerVisualSignal.brightness = 0;
            musicPlayerVisualSignal.activity = 0;
            musicPlayerVisualSignal.absoluteEnergy = 0;
            musicPlayerVisualSignal.levels = null;
            musicPlayerVisualSignal.bands = null;
            musicPlayerVisualSignal.perceptual = null;
            musicPlayerVisualSignal.events = null;
            musicPlayerVisualSignal.envelopes = null;
            musicPlayerVisualSignal.impulses = null;
            musicPlayerVisualSignal.source = 'live';
            musicPlayerVisualSignal.analysis = null;
            for (const key in musicPlayerReactiveEventState) {
                musicPlayerReactiveEventState[key].value = 0;
                musicPlayerReactiveEventState[key].cooldown = 0;
                musicPlayerReactiveEventState[key].previousDrive = 0;
            }
        }

        function ensureMusicPlayerVisualProfile() {
            if (
                musicPlayerVisualProfile.trackIndex !== musicPlayerTrackIndex
                || musicPlayerVisualProfile.binCount !== musicPlayerFrequencyData.length
                || musicPlayerVisualProfile.averages.length !== musicPlayerFrequencyData.length
                || !musicPlayerVisualProfile.perceptualBands
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

        function getMusicPlayerAbsoluteActivity() {
            const sub = getMusicPlayerHzBandEnergy(22, 58, 0.92, 0.78);
            const bass = getMusicPlayerHzBandEnergy(58, 165, 0.98, 0.74);
            const lowMid = getMusicPlayerHzBandEnergy(165, 430, 0.90, 0.78);
            const mid = getMusicPlayerHzBandEnergy(430, 1400, 0.88, 0.80);
            const presence = getMusicPlayerHzBandEnergy(1400, 5200, 0.86, 0.76);
            const air = getMusicPlayerHzBandEnergy(5200, 15000, 0.82, 0.72);
            const absoluteEnergy = clampMusicPlayer01(sub * 0.12 + bass * 0.22 + lowMid * 0.17 + mid * 0.17 + presence * 0.19 + air * 0.13);
            const quietFloor = 0.060;
            const loudCeiling = 0.390;
            const normalized = Math.max(0, Math.min(1, (absoluteEnergy - quietFloor) / Math.max(0.001, loudCeiling - quietFloor)));
            const activity = Math.max(0, Math.min(1, Math.pow(normalized, 1.22)));
            return { absoluteEnergy, activity };
        }

        function approachMusicPlayerSignal(current, target, dt, rise, fall) {
            const rate = target > current ? rise : fall;
            return current + (target - current) * Math.min(1, dt * rate);
        }

        function blendMusicPlayerSignalValue(liveValue, cachedValue, cachedWeight) {
            const w = clampMusicPlayer01(cachedWeight);
            return clampMusicPlayer01((Number.isFinite(liveValue) ? liveValue : 0) * (1 - w) + (Number.isFinite(cachedValue) ? cachedValue : 0) * w);
        }

        function updateMusicPlayerImpulse(key, drive, dt, options = {}) {
            const state = musicPlayerReactiveEventState[key];
            if (!state) return 0;
            const safeDrive = clampMusicPlayer01(drive);
            const threshold = Number.isFinite(options.threshold) ? options.threshold : 0.30;
            const riseThreshold = Number.isFinite(options.riseThreshold) ? options.riseThreshold : 0.085;
            const previousWeight = Number.isFinite(options.previousWeight) ? options.previousWeight : 0.84;
            const cooldownSeconds = Number.isFinite(options.cooldown) ? options.cooldown : 0.10;
            const decayBase = Number.isFinite(options.decayBase) ? options.decayBase : 0.030;
            const outputGain = Number.isFinite(options.gain) ? options.gain : 1;
            const outputCurve = Number.isFinite(options.curve) ? options.curve : 0.72;
            const rise = Math.max(0, safeDrive - state.previousDrive * previousWeight);
            state.cooldown = Math.max(0, state.cooldown - dt);
            state.value *= Math.pow(decayBase, dt);
            if (safeDrive >= threshold && rise >= riseThreshold && state.cooldown <= 0) {
                state.value = Math.max(state.value, clampMusicPlayer01(Math.pow(safeDrive, outputCurve) * outputGain));
                state.cooldown = cooldownSeconds;
            }
            state.previousDrive = safeDrive;
            return clampMusicPlayer01(state.value);
        }

        function getGameAudioFrequencyBinRange(lowHz, highHz) {
            const nyquist = Math.max(1, audioCtx.sampleRate / 2);
            const count = Math.max(1, gameAudioFrequencyData.length);
            const safeLow = Math.max(0, Math.min(nyquist, lowHz || 0));
            const safeHigh = Math.max(safeLow + 1, Math.min(nyquist, highHz || nyquist));
            const start = Math.max(1, Math.floor((safeLow / nyquist) * count));
            const end = Math.max(start + 1, Math.min(count, Math.ceil((safeHigh / nyquist) * count)));
            return { start, end };
        }

        function getGameAudioBandEnergy(lowHz, highHz, gain = 1, curve = 0.68) {
            const range = getGameAudioFrequencyBinRange(lowHz, highHz);
            let sum = 0;
            let peak = 0;
            for (let i = range.start; i < range.end; i++) {
                const value = gameAudioFrequencyData[i] || 0;
                sum += value;
                if (value > peak) peak = value;
            }
            const avg = sum / Math.max(1, range.end - range.start);
            const mixed = Math.max(0, Math.min(1, (avg * 0.58 + peak * 0.42) / 255));
            return Math.max(0, Math.min(1, Math.pow(mixed, curve) * gain));
        }

        function getGameAudioAbsoluteActivity() {
            const bass = getGameAudioBandEnergy(32, 170, 0.92, 0.78);
            const lowMid = getGameAudioBandEnergy(170, 760, 0.86, 0.82);
            const highMid = getGameAudioBandEnergy(760, 3600, 0.82, 0.78);
            const air = getGameAudioBandEnergy(3600, 11200, 0.74, 0.76);
            const absoluteEnergy = Math.max(0, Math.min(1, bass * 0.34 + lowMid * 0.27 + highMid * 0.24 + air * 0.15));
            const quietFloor = 0.020;
            const loudCeiling = 0.310;
            const normalized = Math.max(0, Math.min(1, (absoluteEnergy - quietFloor) / Math.max(0.001, loudCeiling - quietFloor)));
            return {
                absoluteEnergy,
                activity: Math.max(0, Math.min(1, Math.pow(normalized, 0.88)))
            };
        }

        function approachGameAudioSignal(current, target, dt, rise, fall) {
            const rate = target > current ? rise : fall;
            return current + (target - current) * Math.min(1, dt * rate);
        }

        function getGameAudioReactiveSignal() {
            const now = audioCtx.currentTime || 0;
            const dt = gameAudioVisualSignal.lastTime > 0
                ? Math.max(0.001, Math.min(0.08, now - gameAudioVisualSignal.lastTime))
                : 1 / 60;
            gameAudioVisualSignal.lastTime = now;

            if (!bgmIsPlaying && !bossSources.length && !musicPlayerIsPlaying) {
                gameAudioVisualSignal.bass *= Math.pow(0.16, dt);
                gameAudioVisualSignal.bassGuitar *= Math.pow(0.16, dt);
                gameAudioVisualSignal.mid *= Math.pow(0.16, dt);
                gameAudioVisualSignal.highMid *= Math.pow(0.16, dt);
                gameAudioVisualSignal.treble *= Math.pow(0.16, dt);
                gameAudioVisualSignal.drumSnap *= Math.pow(0.14, dt);
                gameAudioVisualSignal.leadTone *= Math.pow(0.16, dt);
                gameAudioVisualSignal.air *= Math.pow(0.16, dt);
                gameAudioVisualSignal.energy *= Math.pow(0.14, dt);
                gameAudioVisualSignal.pulse *= Math.pow(0.08, dt);
                gameAudioVisualSignal.bassPulse *= Math.pow(0.08, dt);
                gameAudioVisualSignal.activity *= Math.pow(0.14, dt);
                gameAudioVisualSignal.absoluteEnergy *= Math.pow(0.14, dt);
                gameAudioVisualSignal.phase += dt * 0.045;
                return gameAudioVisualSignal;
            }

            gameAudioAnalyser.getByteFrequencyData(gameAudioFrequencyData);
            const absoluteActivity = getGameAudioAbsoluteActivity();
            const rawBass = Math.max(
                getGameAudioBandEnergy(34, 112, 1.12, 0.58),
                getGameAudioBandEnergy(58, 260, 1.02, 0.62)
            );
            const rawMid = getGameAudioBandEnergy(240, 920, 0.98, 0.70);
            const rawHighMid = getGameAudioBandEnergy(920, 3600, 1.08, 0.64);
            const rawTreble = getGameAudioBandEnergy(3600, 11800, 1.16, 0.60);
            const activityScale = 0.18 + absoluteActivity.activity * 0.82;
            const rawBassGuitar = Math.max(rawBass * 0.84, getGameAudioBandEnergy(45, 320, 1.16, 0.58));
            const rawDrumSnap = Math.max(
                getGameAudioBandEnergy(42, 120, 0.86, 0.54),
                getGameAudioBandEnergy(960, 4200, 1.08, 0.54)
            );
            const rawLeadTone = Math.max(rawHighMid * 0.62, getGameAudioBandEnergy(320, 1600, 1.06, 0.62));
            const rawAir = Math.max(rawTreble * 0.76, getGameAudioBandEnergy(3600, 12000, 1.20, 0.58));
            const scaledBass = rawBass * activityScale;
            const scaledBassGuitar = rawBassGuitar * activityScale;
            const scaledMid = rawMid * activityScale;
            const scaledHighMid = rawHighMid * activityScale;
            const scaledTreble = rawTreble * activityScale;
            const scaledDrumSnap = rawDrumSnap * activityScale;
            const scaledLeadTone = rawLeadTone * activityScale;
            const scaledAir = rawAir * activityScale;
            const rawEnergy = Math.max(0, Math.min(1, scaledBassGuitar * 0.30 + scaledMid * 0.18 + scaledHighMid * 0.24 + scaledTreble * 0.14 + scaledDrumSnap * 0.10));
            const energyFlux = Math.max(0, rawEnergy - gameAudioVisualSignal.previousEnergy * 0.88);
            const bassFlux = Math.max(0, scaledBassGuitar - gameAudioVisualSignal.previousBass * 0.94);
            const pulseTarget = Math.max(0, Math.min(1, Math.pow(energyFlux * 4.8, 0.72) * Math.pow(absoluteActivity.activity, 0.72)));
            const bassPulseTarget = Math.max(0, Math.min(1, Math.pow(bassFlux * 6.4, 0.62) * Math.pow(absoluteActivity.activity, 0.70)));

            gameAudioVisualSignal.bass = approachGameAudioSignal(gameAudioVisualSignal.bass, scaledBass, dt, 18, 6.4);
            gameAudioVisualSignal.bassGuitar = approachGameAudioSignal(gameAudioVisualSignal.bassGuitar, scaledBassGuitar, dt, 20, 6.8);
            gameAudioVisualSignal.mid = approachGameAudioSignal(gameAudioVisualSignal.mid, scaledMid, dt, 11, 5.0);
            gameAudioVisualSignal.highMid = approachGameAudioSignal(gameAudioVisualSignal.highMid, scaledHighMid, dt, 13, 5.2);
            gameAudioVisualSignal.treble = approachGameAudioSignal(gameAudioVisualSignal.treble, scaledTreble, dt, 14, 5.6);
            gameAudioVisualSignal.drumSnap = approachGameAudioSignal(gameAudioVisualSignal.drumSnap, scaledDrumSnap, dt, 22, 5.2);
            gameAudioVisualSignal.leadTone = approachGameAudioSignal(gameAudioVisualSignal.leadTone, scaledLeadTone, dt, 12, 5.0);
            gameAudioVisualSignal.air = approachGameAudioSignal(gameAudioVisualSignal.air, scaledAir, dt, 18, 5.8);
            gameAudioVisualSignal.energy = approachGameAudioSignal(gameAudioVisualSignal.energy, rawEnergy, dt, 10, 4.6);
            gameAudioVisualSignal.pulse = approachGameAudioSignal(gameAudioVisualSignal.pulse, pulseTarget, dt, 16, 4.0);
            gameAudioVisualSignal.bassPulse = approachGameAudioSignal(gameAudioVisualSignal.bassPulse, bassPulseTarget, dt, 22, 4.6);
            gameAudioVisualSignal.activity = approachGameAudioSignal(gameAudioVisualSignal.activity, absoluteActivity.activity, dt, 9, 4.8);
            gameAudioVisualSignal.absoluteEnergy = approachGameAudioSignal(gameAudioVisualSignal.absoluteEnergy, absoluteActivity.absoluteEnergy, dt, 10, 4.8);
            gameAudioVisualSignal.phase += dt * (0.052 + gameAudioVisualSignal.energy * 0.090 + gameAudioVisualSignal.pulse * 0.040);
            gameAudioVisualSignal.previousEnergy = rawEnergy;
            gameAudioVisualSignal.previousBass = scaledBassGuitar;
            return gameAudioVisualSignal;
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
                musicPlayerVisualSignal.kick *= Math.pow(0.08, dt);
                musicPlayerVisualSignal.snare *= Math.pow(0.10, dt);
                musicPlayerVisualSignal.snareImpact *= Math.pow(0.045, dt);
                musicPlayerVisualSignal.hat *= Math.pow(0.10, dt);
                musicPlayerVisualSignal.melody *= Math.pow(0.18, dt);
                musicPlayerVisualSignal.melodyFlux *= Math.pow(0.12, dt);
                musicPlayerVisualSignal.spectralFlux *= Math.pow(0.12, dt);
                musicPlayerVisualSignal.sectionEnergy *= Math.pow(0.18, dt);
                musicPlayerVisualSignal.loudness *= Math.pow(0.16, dt);
                musicPlayerVisualSignal.brightness *= Math.pow(0.16, dt);
                musicPlayerVisualSignal.activity *= Math.pow(0.14, dt);
                musicPlayerVisualSignal.absoluteEnergy *= Math.pow(0.14, dt);
                musicPlayerVisualSignal.phase += dt * 0.045;
                musicPlayerVisualSignal.levels = {
                    sub: 0,
                    bass: musicPlayerVisualSignal.bass,
                    lowMid: musicPlayerVisualSignal.mid,
                    mid: musicPlayerVisualSignal.mid,
                    highMid: musicPlayerVisualSignal.highMid,
                    presence: musicPlayerVisualSignal.highMid,
                    treble: musicPlayerVisualSignal.treble,
                    air: musicPlayerVisualSignal.air,
                    globalEnergy: musicPlayerVisualSignal.energy,
                    loudness: musicPlayerVisualSignal.loudness,
                    brightness: musicPlayerVisualSignal.brightness,
                    spectralFlux: musicPlayerVisualSignal.spectralFlux
                };
                musicPlayerVisualSignal.events = {
                    kick: musicPlayerVisualSignal.kick,
                    snare: musicPlayerVisualSignal.snare,
                    snareImpact: musicPlayerVisualSignal.snareImpact,
                    hat: musicPlayerVisualSignal.hat,
                    bassOnset: 0,
                    melody: musicPlayerVisualSignal.melody,
                    melodyOnset: musicPlayerVisualSignal.melodyFlux,
                    melodyFlux: musicPlayerVisualSignal.melodyFlux,
                    spectralFlux: musicPlayerVisualSignal.spectralFlux
                };
                musicPlayerVisualSignal.envelopes = {
                    bassSustain: musicPlayerVisualSignal.bassGuitar,
                    diskMass: musicPlayerVisualSignal.bassGuitar,
                    accretion: musicPlayerVisualSignal.bassGuitar,
                    leadMotion: musicPlayerVisualSignal.leadTone,
                    airTexture: musicPlayerVisualSignal.air,
                    outerOrbit: musicPlayerVisualSignal.air,
                    innerOrbit: musicPlayerVisualSignal.snare,
                    mobius: musicPlayerVisualSignal.leadTone,
                    sectionEnergy: musicPlayerVisualSignal.sectionEnergy,
                    backgroundGlow: musicPlayerVisualSignal.energy,
                    section: musicPlayerVisualSignal.sectionEnergy
                };
                musicPlayerVisualSignal.impulses = {
                    corePunch: musicPlayerVisualSignal.kick,
                    ringSnap: musicPlayerVisualSignal.snareImpact,
                    hatSpark: musicPlayerVisualSignal.hat,
                    gravityPulse: musicPlayerVisualSignal.kick
                };
                musicPlayerVisualSignal.source = 'live';
                musicPlayerVisualSignal.analysis = getMusicPlayerAnalysisDebugState('live');
                return musicPlayerVisualSignal;
            }

            ensureMusicPlayerTrackAnalysis(musicPlayerTrackIndex);
            musicPlayerAnalyser.getByteFrequencyData(musicPlayerFrequencyData);
            const absoluteActivity = getMusicPlayerAbsoluteActivity();
            const profile = updateMusicPlayerVisualProfile(dt);
            const perceptual = updateMusicPlayerPerceptualBands(profile, dt);
            const bands = perceptual.bands;
            const subBass = bands.subBass;
            const bassBand = bands.bass;
            const lowMids = bands.lowMids;
            const mids = bands.mids;
            const presence = bands.presence;
            const brilliance = bands.brilliance;
            const quietAwareLoudness = Math.min(
                perceptual.loudness,
                Math.pow(absoluteActivity.activity, 0.70) * 1.18
            );
            const sectionTarget = clampMusicPlayer01(Math.pow(quietAwareLoudness * 0.62 + absoluteActivity.activity * 0.38, 1.04));
            const bassEnd = profile.bassEnd;
            const midEnd = profile.midEnd;
            const highMidEnd = profile.highMidEnd;
            const legacySubPulse = getMusicPlayerInstrumentBandEnergy(profile, 28, 74, 1.10, 0.60, {
                sustainWeight: 0.25,
                liftWeight: 0.62,
                peakWeight: 0.36,
                avgReject: 0.82
            });
            const legacyBassFundamental = getMusicPlayerInstrumentBandEnergy(profile, 45, 165, 1.58, 0.54, {
                sustainWeight: 0.50,
                liftWeight: 0.50,
                peakWeight: 0.30,
                avgReject: 0.72
            });
            const legacyBassHarmonic = getMusicPlayerInstrumentBandEnergy(profile, 90, 320, 1.04, 0.66, {
                sustainWeight: 0.34,
                liftWeight: 0.46,
                peakWeight: 0.22,
                avgReject: 0.78
            });
            const legacyKickBody = getMusicPlayerInstrumentBandEnergy(profile, 36, 105, 1.10, 0.60, {
                sustainWeight: 0.20,
                liftWeight: 0.64,
                peakWeight: 0.38,
                avgReject: 0.86
            });
            const legacySnareBody = getMusicPlayerInstrumentBandEnergy(profile, 900, 3600, 0.96, 0.70, {
                sustainWeight: 0.18,
                liftWeight: 0.62,
                peakWeight: 0.32,
                avgReject: 0.84
            });
            const legacyLeadTone = getMusicPlayerInstrumentBandEnergy(profile, 320, 1500, 1.02, 0.68, {
                sustainWeight: 0.34,
                liftWeight: 0.46,
                peakWeight: 0.22,
                avgReject: 0.76
            });
            const legacyAirTone = getMusicPlayerInstrumentBandEnergy(profile, 3600, 11200, 1.02, 0.66, {
                sustainWeight: 0.16,
                liftWeight: 0.64,
                peakWeight: 0.36,
                avgReject: 0.86
            });
            const legacyBassSource = Math.max(
                legacyBassFundamental * 0.82 + legacyBassHarmonic * 0.22,
                legacySubPulse * 0.64 + legacyBassFundamental * 0.40,
                getMusicPlayerAdaptiveBandEnergy(profile, 0.006, bassEnd, 0.78, 0.62)
            );
            const legacyBassGuitar = clampMusicPlayer01(Math.pow(legacyBassSource, 0.78) * 0.88);
            const legacyBass = clampMusicPlayer01(legacyBassGuitar * 0.82 + legacySubPulse * 0.18);
            const legacyMid = getMusicPlayerAdaptiveBandEnergy(profile, bassEnd, midEnd, 0.86, 0.72);
            const legacyHighMid = getMusicPlayerAdaptiveBandEnergy(profile, midEnd, highMidEnd, 0.90, 0.68);
            const legacyTreble = getMusicPlayerAdaptiveBandEnergy(profile, highMidEnd, 0.965, 0.92, 0.64);
            const legacyDrumSnap = clampMusicPlayer01(legacyKickBody * 0.42 + legacySnareBody * 0.54);
            const legacyMelody = clampMusicPlayer01(legacyLeadTone * 0.72 + legacyHighMid * 0.24);
            const legacyAir = clampMusicPlayer01(legacyAirTone * 0.72 + legacyTreble * 0.22);
            const activityScale = 0.10 + sectionTarget * 0.90;
            const transientGate = 0.22 + sectionTarget * 0.62;
            // Cached frames feed the same ownership bus; visual code never reads raw analysis frames.
            const cachedFrame = getMusicPlayerCurrentAnalysisFrame();
            const cachedWeight = cachedFrame ? 0.82 : 0;
            const lowTransient = Math.max(subBass.onset * 0.70, bassBand.onset * 0.82);
            const perceptualKick = clampMusicPlayer01(Math.pow(lowTransient * (0.46 + bassBand.envelope * 0.64), 0.76) * transientGate);
            const perceptualSnare = clampMusicPlayer01(Math.pow(mids.onset * 0.24 + presence.onset * 0.46 + brilliance.onset * 0.16, 0.82) * transientGate);
            const perceptualHat = clampMusicPlayer01(Math.pow(brilliance.onset * 0.72 + presence.onset * 0.22, 0.80) * (0.36 + perceptual.brightness * 0.54) * transientGate);
            let kickDrive = clampMusicPlayer01(perceptualKick * 0.78 + legacyKickBody * activityScale * 0.22);
            let snareDrive = clampMusicPlayer01(perceptualSnare * 0.76 + legacySnareBody * activityScale * 0.24);
            let hatDrive = clampMusicPlayer01(perceptualHat * 0.78 + legacyAirTone * activityScale * 0.22);
            let bassOnsetDrive = clampMusicPlayer01(lowTransient * 0.72 + legacySubPulse * activityScale * 0.28);
            if (cachedFrame) {
                kickDrive = Math.max(kickDrive * 0.28, cachedFrame.kick * 1.08, (cachedFrame.sub * 0.42 + cachedFrame.bass * 0.58) * 0.30);
                snareDrive = Math.max(snareDrive * 0.30, cachedFrame.snare * 1.08);
                hatDrive = Math.max(hatDrive * 0.34, cachedFrame.hat * 1.04);
                bassOnsetDrive = Math.max(bassOnsetDrive * 0.30, Math.max(cachedFrame.kick * 0.50, cachedFrame.sub * 0.28 + cachedFrame.bass * 0.42));
            }
            const kickEvent = updateMusicPlayerImpulse('kick', kickDrive, dt, {
                threshold: 0.27,
                riseThreshold: 0.080,
                previousWeight: 0.82,
                cooldown: 0.145,
                decayBase: 0.020,
                gain: 1.10,
                curve: 0.68
            });
            const snareEvent = updateMusicPlayerImpulse('snare', snareDrive, dt, {
                threshold: 0.25,
                riseThreshold: 0.074,
                previousWeight: 0.80,
                cooldown: 0.110,
                decayBase: 0.018,
                gain: 1.04,
                curve: 0.70
            });
            const hatEvent = updateMusicPlayerImpulse('hat', hatDrive, dt, {
                threshold: 0.32,
                riseThreshold: 0.092,
                previousWeight: 0.76,
                cooldown: 0.052,
                decayBase: 0.055,
                gain: 0.82,
                curve: 0.72
            });
            const bassOnsetEvent = updateMusicPlayerImpulse('bassOnset', bassOnsetDrive, dt, {
                threshold: 0.34,
                riseThreshold: 0.100,
                previousWeight: 0.84,
                cooldown: 0.170,
                decayBase: 0.028,
                gain: 0.78,
                curve: 0.74
            });
            const kickTarget = clampMusicPlayer01(kickEvent * 0.88 + kickDrive * 0.18);
            const snareTarget = clampMusicPlayer01(snareEvent * 0.86 + snareDrive * 0.16);
            const hatTarget = clampMusicPlayer01(hatEvent * 0.82 + hatDrive * 0.14);
            const snareRise = Math.max(
                0,
                snareTarget - musicPlayerVisualSignal.snare * 0.78,
                perceptualSnare - musicPlayerVisualSignal.snareImpact * 0.34
            );
            const snareImpactTarget = clampMusicPlayer01(
                Math.pow(snareRise * 4.4 + presence.onset * 0.30 + mids.onset * 0.18, 0.68)
                * (0.36 + sectionTarget * 0.64)
            );
            const perceptualMelody = clampMusicPlayer01((
                lowMids.envelope * 0.20
                + mids.envelope * 0.38
                + presence.envelope * 0.34
                + brilliance.envelope * 0.08
            ) * (0.50 + perceptual.spectralFlux * 0.22) * activityScale);
            let melodyTarget = clampMusicPlayer01(perceptualMelody * 0.58 + legacyMelody * activityScale * 0.42);
            const perceptualMelodyFlux = clampMusicPlayer01((
                lowMids.onset * 0.20
                + mids.onset * 0.38
                + presence.onset * 0.34
                + perceptual.spectralFlux * 0.20
            ) * (0.38 + melodyTarget * 0.54) * transientGate);
            let melodyFluxTarget = clampMusicPlayer01(perceptualMelodyFlux * 0.68 + Math.max(0, legacyMelody - musicPlayerVisualSignal.melody * 0.90) * 0.32);
            if (cachedFrame) {
                melodyTarget = blendMusicPlayerSignalValue(
                    melodyTarget,
                    cachedFrame.mid * 0.24 + cachedFrame.presence * 0.62 + cachedFrame.melodyFlux * 0.18,
                    cachedWeight
                );
                melodyFluxTarget = blendMusicPlayerSignalValue(melodyFluxTarget, cachedFrame.melodyFlux, cachedWeight);
            }
            const melodyOnsetEvent = updateMusicPlayerImpulse('melodyOnset', melodyFluxTarget, dt, {
                threshold: 0.24,
                riseThreshold: 0.070,
                previousWeight: 0.84,
                cooldown: 0.120,
                decayBase: 0.050,
                gain: 0.88,
                curve: 0.76
            });
            const perceptualBass = clampMusicPlayer01((subBass.envelope * 0.36 + bassBand.envelope * 0.74) * activityScale);
            const perceptualBassGuitar = clampMusicPlayer01((subBass.envelope * 0.18 + bassBand.envelope * 0.62 + lowMids.envelope * 0.36) * activityScale);
            const perceptualMid = clampMusicPlayer01((lowMids.envelope * 0.34 + mids.envelope * 0.74) * activityScale);
            const perceptualHighMid = clampMusicPlayer01((mids.envelope * 0.30 + presence.envelope * 0.82) * activityScale);
            const perceptualTreble = clampMusicPlayer01((presence.envelope * 0.28 + brilliance.envelope * 0.88) * activityScale);
            let scaledBass = clampMusicPlayer01(perceptualBass * 0.58 + legacyBass * activityScale * 0.42);
            let scaledBassGuitar = clampMusicPlayer01(perceptualBassGuitar * 0.56 + legacyBassGuitar * activityScale * 0.44);
            let scaledMid = clampMusicPlayer01(perceptualMid * 0.60 + legacyMid * activityScale * 0.40);
            let scaledHighMid = clampMusicPlayer01(perceptualHighMid * 0.60 + legacyHighMid * activityScale * 0.40);
            let scaledTreble = clampMusicPlayer01(perceptualTreble * 0.58 + legacyTreble * activityScale * 0.42);
            let scaledDrumSnap = clampMusicPlayer01(kickTarget * 0.36 + snareTarget * 0.74 + hatTarget * 0.26);
            let scaledLeadTone = clampMusicPlayer01(melodyTarget * 0.82 + melodyFluxTarget * 0.18);
            let scaledAir = clampMusicPlayer01((brilliance.envelope * 0.60 + hatTarget * 0.24) * 0.62 + legacyAir * activityScale * 0.38);
            let rawEnergy = clampMusicPlayer01(
                perceptual.rawEnergy * 0.48
                + sectionTarget * 0.26
                + (scaledBass + scaledMid + scaledHighMid + scaledTreble) * 0.055
                + (legacyBass + legacyMid + legacyHighMid + legacyTreble) * activityScale * 0.035
            );
            let hybridFlux = clampMusicPlayer01(perceptual.spectralFlux * 0.64 + melodyFluxTarget * 0.20 + (kickTarget + snareTarget + hatTarget) * 0.055);
            if (cachedFrame) {
                scaledBass = blendMusicPlayerSignalValue(scaledBass, cachedFrame.bass * 0.78 + cachedFrame.sub * 0.22, cachedWeight);
                scaledBassGuitar = blendMusicPlayerSignalValue(scaledBassGuitar, cachedFrame.bass * 0.66 + cachedFrame.lowMid * 0.24 + cachedFrame.sub * 0.10, cachedWeight);
                scaledMid = blendMusicPlayerSignalValue(scaledMid, cachedFrame.lowMid * 0.34 + cachedFrame.mid * 0.66, cachedWeight);
                scaledHighMid = blendMusicPlayerSignalValue(scaledHighMid, cachedFrame.presence, cachedWeight);
                scaledTreble = blendMusicPlayerSignalValue(scaledTreble, cachedFrame.air * 0.76 + cachedFrame.presence * 0.24, cachedWeight);
                scaledDrumSnap = blendMusicPlayerSignalValue(scaledDrumSnap, cachedFrame.snare * 0.72 + cachedFrame.hat * 0.18 + cachedFrame.kick * 0.20, cachedWeight);
                scaledLeadTone = blendMusicPlayerSignalValue(scaledLeadTone, cachedFrame.mid * 0.28 + cachedFrame.presence * 0.58 + cachedFrame.melodyFlux * 0.18, cachedWeight);
                scaledAir = blendMusicPlayerSignalValue(scaledAir, cachedFrame.air * 0.74 + cachedFrame.hat * 0.22, cachedWeight);
                rawEnergy = blendMusicPlayerSignalValue(rawEnergy, cachedFrame.globalEnergy, cachedWeight);
                hybridFlux = blendMusicPlayerSignalValue(hybridFlux, cachedFrame.spectralFlux, cachedWeight);
            }
            const pulseTarget = clampMusicPlayer01(Math.pow(Math.max(hybridFlux, kickTarget * 0.42 + snareTarget * 0.34 + hatTarget * 0.16), 0.86) * (0.30 + sectionTarget * 0.64));
            const bassPulseTarget = clampMusicPlayer01(Math.pow(kickTarget * 0.68 + lowTransient * 0.26 + legacySubPulse * activityScale * 0.18, 0.76) * (0.36 + sectionTarget * 0.58));

            musicPlayerVisualSignal.bass = approachMusicPlayerSignal(musicPlayerVisualSignal.bass, scaledBass, dt, 22, 8.5);
            musicPlayerVisualSignal.bassGuitar = approachMusicPlayerSignal(musicPlayerVisualSignal.bassGuitar, scaledBassGuitar, dt, 26, 9.2);
            musicPlayerVisualSignal.mid = approachMusicPlayerSignal(musicPlayerVisualSignal.mid, scaledMid, dt, 12, 5.4);
            musicPlayerVisualSignal.highMid = approachMusicPlayerSignal(musicPlayerVisualSignal.highMid, scaledHighMid, dt, 13, 5.8);
            musicPlayerVisualSignal.treble = approachMusicPlayerSignal(musicPlayerVisualSignal.treble, scaledTreble, dt, 12, 5.0);
            musicPlayerVisualSignal.drumSnap = approachMusicPlayerSignal(musicPlayerVisualSignal.drumSnap, scaledDrumSnap, dt, 22, 6.6);
            musicPlayerVisualSignal.leadTone = approachMusicPlayerSignal(musicPlayerVisualSignal.leadTone, scaledLeadTone, dt, 13, 5.4);
            musicPlayerVisualSignal.air = approachMusicPlayerSignal(musicPlayerVisualSignal.air, scaledAir, dt, 18, 7.2);
            musicPlayerVisualSignal.energy = approachMusicPlayerSignal(musicPlayerVisualSignal.energy, rawEnergy, dt, 12, 5.4);
            musicPlayerVisualSignal.pulse = approachMusicPlayerSignal(musicPlayerVisualSignal.pulse, pulseTarget, dt, 16, 4.2);
            musicPlayerVisualSignal.bassPulse = approachMusicPlayerSignal(musicPlayerVisualSignal.bassPulse, bassPulseTarget, dt, 30, 5.0);
            musicPlayerVisualSignal.kick = Math.max(musicPlayerVisualSignal.kick * Math.pow(0.020, dt), kickEvent);
            musicPlayerVisualSignal.snare = Math.max(musicPlayerVisualSignal.snare * Math.pow(0.018, dt), snareEvent);
            musicPlayerVisualSignal.snareImpact = Math.max(
                musicPlayerVisualSignal.snareImpact * Math.pow(0.035, dt),
                snareEvent * 0.92,
                snareImpactTarget * 0.72
            );
            musicPlayerVisualSignal.hat = Math.max(musicPlayerVisualSignal.hat * Math.pow(0.055, dt), hatEvent);
            musicPlayerVisualSignal.melody = approachMusicPlayerSignal(musicPlayerVisualSignal.melody, melodyTarget, dt, 10, 4.2);
            musicPlayerVisualSignal.melodyFlux = approachMusicPlayerSignal(musicPlayerVisualSignal.melodyFlux, melodyFluxTarget * 0.72 + melodyOnsetEvent * 0.28, dt, 12, 4.2);
            musicPlayerVisualSignal.spectralFlux = approachMusicPlayerSignal(musicPlayerVisualSignal.spectralFlux, hybridFlux, dt, 12, 4.6);
            musicPlayerVisualSignal.sectionEnergy = approachMusicPlayerSignal(musicPlayerVisualSignal.sectionEnergy, sectionTarget, dt, 4.2, 1.8);
            musicPlayerVisualSignal.loudness = approachMusicPlayerSignal(musicPlayerVisualSignal.loudness, perceptual.loudness, dt, 8.5, 3.2);
            musicPlayerVisualSignal.brightness = approachMusicPlayerSignal(musicPlayerVisualSignal.brightness, perceptual.brightness, dt, 11, 4.2);
            musicPlayerVisualSignal.activity = approachMusicPlayerSignal(musicPlayerVisualSignal.activity, sectionTarget, dt, 9, 5.2);
            musicPlayerVisualSignal.absoluteEnergy = approachMusicPlayerSignal(musicPlayerVisualSignal.absoluteEnergy, absoluteActivity.absoluteEnergy, dt, 12, 5.4);
            musicPlayerVisualSignal.phase += dt * (
                0.044
                + musicPlayerVisualSignal.sectionEnergy * 0.052
                + musicPlayerVisualSignal.spectralFlux * 0.038
                + musicPlayerVisualSignal.hat * 0.028
            );
            musicPlayerVisualSignal.previousEnergy = rawEnergy;
            musicPlayerVisualSignal.previousBass = scaledBass;
            musicPlayerVisualSignal.previousBassGuitar = scaledBassGuitar;
            const signalSource = cachedFrame ? 'blended' : 'live';
            const busSub = cachedFrame ? blendMusicPlayerSignalValue(subBass.normalized, cachedFrame.sub, cachedWeight) : subBass.normalized;
            const busBass = cachedFrame ? blendMusicPlayerSignalValue(bassBand.normalized, cachedFrame.bass, cachedWeight) : bassBand.normalized;
            const busLowMid = cachedFrame ? blendMusicPlayerSignalValue(lowMids.normalized, cachedFrame.lowMid, cachedWeight) : lowMids.normalized;
            const busMid = cachedFrame ? blendMusicPlayerSignalValue(mids.normalized, cachedFrame.mid, cachedWeight) : mids.normalized;
            const busPresence = cachedFrame ? blendMusicPlayerSignalValue(presence.normalized, cachedFrame.presence, cachedWeight) : presence.normalized;
            const busAir = cachedFrame ? blendMusicPlayerSignalValue(brilliance.normalized, cachedFrame.air, cachedWeight) : brilliance.normalized;
            const busLoudness = cachedFrame ? blendMusicPlayerSignalValue(perceptual.loudness, cachedFrame.loudness, cachedWeight) : perceptual.loudness;
            const busBrightness = cachedFrame ? blendMusicPlayerSignalValue(perceptual.brightness, cachedFrame.brightness, cachedWeight) : perceptual.brightness;
            const busBassSustain = cachedFrame
                ? blendMusicPlayerSignalValue(clampMusicPlayer01(bassBand.envelope * 0.80 + subBass.envelope * 0.20), cachedFrame.bass * 0.78 + cachedFrame.sub * 0.22, cachedWeight)
                : clampMusicPlayer01(bassBand.envelope * 0.80 + subBass.envelope * 0.20);
            const busDiskMass = cachedFrame
                ? blendMusicPlayerSignalValue(clampMusicPlayer01(bassBand.envelope * 0.70 + lowMids.envelope * 0.24 + bassOnsetEvent * 0.10), cachedFrame.bass * 0.68 + cachedFrame.lowMid * 0.22 + cachedFrame.kick * 0.10, cachedWeight)
                : clampMusicPlayer01(bassBand.envelope * 0.70 + lowMids.envelope * 0.24 + bassOnsetEvent * 0.10);
            const busAirTexture = cachedFrame
                ? blendMusicPlayerSignalValue(clampMusicPlayer01(brilliance.envelope * 0.66 + hatEvent * 0.34), cachedFrame.air * 0.70 + cachedFrame.hat * 0.30, cachedWeight)
                : clampMusicPlayer01(brilliance.envelope * 0.66 + hatEvent * 0.34);
            const busLeadMotion = cachedFrame
                ? blendMusicPlayerSignalValue(clampMusicPlayer01(musicPlayerVisualSignal.melody * 0.72 + presence.envelope * 0.22 + melodyOnsetEvent * 0.16), cachedFrame.presence * 0.62 + cachedFrame.mid * 0.22 + cachedFrame.melodyFlux * 0.18, cachedWeight)
                : clampMusicPlayer01(musicPlayerVisualSignal.melody * 0.72 + presence.envelope * 0.22 + melodyOnsetEvent * 0.16);
            const busAnalysis = getMusicPlayerAnalysisDebugState(signalSource);
            if (cachedFrame) {
                busAnalysis.source = signalSource;
                busAnalysis.phase = cachedFrame.phase || busAnalysis.phase;
                busAnalysis.state = cachedFrame.state || busAnalysis.state;
                busAnalysis.progress = cachedFrame.progress;
            }
            musicPlayerVisualSignal.levels = {
                sub: busSub,
                bass: busBass,
                lowMid: busLowMid,
                mid: busMid,
                highMid: busPresence,
                presence: busPresence,
                treble: busAir,
                air: busAir,
                globalEnergy: rawEnergy,
                loudness: busLoudness,
                brightness: busBrightness,
                spectralFlux: hybridFlux
            };
            musicPlayerVisualSignal.bands = {
                subBass: [22, 58],
                bass: [58, 165],
                lowMids: [165, 430],
                mids: [430, 1400],
                presence: [1400, 5200],
                brilliance: [5200, 15000],
                age: profile.age,
                confidence: perceptual.confidence
            };
            musicPlayerVisualSignal.perceptual = {
                subBass: busSub,
                bass: busBass,
                lowMids: busLowMid,
                mids: busMid,
                presence: busPresence,
                brilliance: busAir,
                brightness: busBrightness,
                rawEnergy
            };
            musicPlayerVisualSignal.events = {
                kick: kickEvent,
                snare: snareEvent,
                snareImpact: musicPlayerVisualSignal.snareImpact,
                hat: hatEvent,
                bassOnset: bassOnsetEvent,
                melody: musicPlayerVisualSignal.melody,
                melodyOnset: melodyOnsetEvent,
                melodyFlux: musicPlayerVisualSignal.melodyFlux,
                spectralFlux: musicPlayerVisualSignal.spectralFlux
            };
            musicPlayerVisualSignal.envelopes = {
                bassSustain: busBassSustain,
                diskMass: busDiskMass,
                accretion: busDiskMass,
                leadMotion: busLeadMotion,
                airTexture: busAirTexture,
                outerOrbit: clampMusicPlayer01(busAirTexture * 0.72 + hatEvent * 0.28),
                innerOrbit: clampMusicPlayer01(presence.envelope * 0.22 + snareEvent * 0.58 + musicPlayerVisualSignal.snareImpact * 0.22),
                mobius: clampMusicPlayer01(musicPlayerVisualSignal.melody * 0.72 + musicPlayerVisualSignal.melodyFlux * 0.34),
                sectionEnergy: musicPlayerVisualSignal.sectionEnergy,
                backgroundGlow: clampMusicPlayer01(musicPlayerVisualSignal.sectionEnergy * 0.62 + musicPlayerVisualSignal.energy * 0.25 + musicPlayerVisualSignal.brightness * 0.13),
                section: musicPlayerVisualSignal.sectionEnergy
            };
            musicPlayerVisualSignal.impulses = {
                corePunch: kickEvent,
                ringSnap: Math.max(snareEvent, musicPlayerVisualSignal.snareImpact * 0.82),
                hatSpark: hatEvent,
                gravityPulse: clampMusicPlayer01(kickEvent * 0.82 + bassOnsetEvent * 0.32)
            };
            musicPlayerVisualSignal.source = signalSource;
            musicPlayerVisualSignal.analysis = busAnalysis;
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
            ensureMusicPlayerTrackAnalysis(musicPlayerTrackIndex);

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
            ensureMusicPlayerTrackAnalysis(musicPlayerTrackIndex);
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
            musicPlayerFullscreen = false;
            musicPlayerFullscreenLastInput = getMusicPlayerInputNow();
            syncMusicPlayerMasterVolume(0.1);
            ensureMusicPlayerTrackAnalysis(musicPlayerTrackIndex);
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
        }

        function closeMusicPlayer() {
            musicPlayerOpen = false;
            musicPlayerFullscreen = false;
            musicPlayerFullscreenLastInput = getMusicPlayerInputNow();
            syncMusicPlayerMasterVolume(0.12);
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
        }

        function getMusicPlayerInputNow() {
            return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        }

        function wakeMusicPlayerFullscreenUi() {
            musicPlayerFullscreenLastInput = getMusicPlayerInputNow();
            return true;
        }

        function enterMusicPlayerFullscreen() {
            musicPlayerOpen = true;
            musicPlayerFullscreen = true;
            wakeMusicPlayerFullscreenUi();
            syncMusicPlayerMasterVolume(0.1);
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
            return true;
        }

        function exitMusicPlayerFullscreen() {
            musicPlayerOpen = true;
            musicPlayerFullscreen = false;
            musicPlayerSelection = 5;
            wakeMusicPlayerFullscreenUi();
            if (typeof clearGameplayKeys === 'function') clearGameplayKeys();
            return true;
        }

        function handleMusicPlayerKey(k) {
            if (musicPlayerFullscreen) {
                wakeMusicPlayerFullscreenUi();
                if (k === 'escape' || k === '`' || k === '~') return exitMusicPlayerFullscreen();
                if (k === 'arrowleft' || k === 'a') return seekMusicPlayer(-5);
                if (k === 'arrowright' || k === 'd') return seekMusicPlayer(5);
                if (k === 'arrowup' || k === 'w') return previousMusicPlayerTrack();
                if (k === 'arrowdown' || k === 's') return nextMusicPlayerTrack();
                if (k === 'enter' || k === ' ') return toggleMusicPlayerPlayback();
                return true;
            }
            if (k === 'escape' || k === '`' || k === '~') {
                closeMusicPlayer();
                return true;
            }
            if (k === 'arrowup' || k === 'w') {
                if (musicPlayerSelection === 0) musicPlayerSelection = 5;
                else if (musicPlayerSelection === 4) musicPlayerSelection = 2;
                else if (musicPlayerSelection === 5) musicPlayerSelection = 4;
                else musicPlayerSelection = 0;
                return true;
            }
            if (k === 'arrowdown' || k === 's') {
                if (musicPlayerSelection === 0) musicPlayerSelection = 2;
                else if (musicPlayerSelection === 4) musicPlayerSelection = 5;
                else if (musicPlayerSelection === 5) musicPlayerSelection = 0;
                else musicPlayerSelection = 4;
                return true;
            }
            if (k === 'arrowleft' || k === 'a') {
                if (musicPlayerSelection === 5) musicPlayerSelection = 0;
                if (musicPlayerSelection === 0) return seekMusicPlayer(-5);
                if (musicPlayerSelection === 4) return adjustMusicPlayerVolume(-0.05);
                musicPlayerSelection = Math.max(1, musicPlayerSelection - 1);
                return true;
            }
            if (k === 'arrowright' || k === 'd') {
                if (musicPlayerSelection === 5) musicPlayerSelection = 0;
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
                if (musicPlayerSelection === 5) return enterMusicPlayerFullscreen();
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
                fullscreen: musicPlayerFullscreen,
                fullscreenLastInput: musicPlayerFullscreenLastInput,
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
