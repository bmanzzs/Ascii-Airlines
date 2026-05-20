        // Terminal / fleet hub ownership: ship-select screen, dock runtime, and dock transition rendering.

        const TERMINAL_DOCK_ENTER_DURATION = 1.42;
        const TERMINAL_DOCK_EXIT_DURATION = 1.28;
        let terminalDockTransition = {
            active: false,
            phase: 'enter',
            startedAt: 0,
            galaxyIndex: 0,
            shipIndex: 0,
            fromX: 0,
            fromY: 0,
            fromRot: 0,
            fromScale: 0.24,
            color: '#8ff7ff'
        };
        let terminalDockExitHold = {
            active: false,
            galaxyIndex: -1,
            shipIndex: 0,
            startedAt: 0
        };

        function clearTerminalDockExitHold() {
            terminalDockExitHold.active = false;
            terminalDockExitHold.galaxyIndex = -1;
            terminalDockExitHold.shipIndex = 0;
            terminalDockExitHold.startedAt = 0;
        }

        function markTerminalDockExitHold(galaxyIndex = selectedGalaxyIndex, shipIndex = selectedShipIndex) {
            terminalDockExitHold.active = true;
            terminalDockExitHold.galaxyIndex = galaxyIndex;
            terminalDockExitHold.shipIndex = shipIndex;
            terminalDockExitHold.startedAt = currentFrameNow || performance.now();
        }

        function isTerminalDockExitHoldActive(galaxyIndex = selectedGalaxyIndex) {
            if (terminalDockExitHold.active && selectedGalaxyIndex !== terminalDockExitHold.galaxyIndex) {
                clearTerminalDockExitHold();
                return false;
            }
            return terminalDockExitHold.active
                && gameState === 'GALAXY_SELECT'
                && terminalDockExitHold.galaxyIndex === galaxyIndex;
        }

        function handleGalaxySelectIndexChanged(previousIndex, nextIndex) {
            if (!terminalDockExitHold.active) return;
            if (nextIndex !== terminalDockExitHold.galaxyIndex) clearTerminalDockExitHold();
        }

        function getTerminalDockExitCursorPose(galaxyIndex = selectedGalaxyIndex) {
            if (typeof getGalaxySelectSlot !== 'function' || typeof getGalaxySelectRenderRadius !== 'function') return null;
            const slot = getGalaxySelectSlot(galaxyIndex);
            const radius = getGalaxySelectRenderRadius(galaxyIndex, true);
            const x = Math.min(width - 54, slot.x + radius * 1.98);
            const y = Math.max(100, slot.y - radius * 0.44);
            return {
                x,
                y,
                faceX: Math.min(width + radius * 0.8, x + radius * 0.86),
                faceY: Math.max(80, y - radius * 0.12),
                scale: 0.25,
                radius
            };
        }

        function beginTerminalDockTransition(phase = 'enter', shipIndex = selectedShipIndex) {
            const now = currentFrameNow || performance.now();
            const galaxyIndex = selectedGalaxyIndex;
            const galaxy = getGalaxyDefinition(galaxyIndex);
            const slot = typeof getGalaxySelectSlot === 'function'
                ? getGalaxySelectSlot(galaxyIndex)
                : { x: width * 0.14, y: height * 0.57 };
            const fromX = pauseMenuShipCursor && pauseMenuShipCursor.initialized
                ? (Number.isFinite(pauseMenuShipCursor.renderX) ? pauseMenuShipCursor.renderX : pauseMenuShipCursor.x)
                : slot.x - 92;
            const fromY = pauseMenuShipCursor && pauseMenuShipCursor.initialized
                ? (Number.isFinite(pauseMenuShipCursor.renderY) ? pauseMenuShipCursor.renderY : pauseMenuShipCursor.y)
                : slot.y;
            const fromRot = pauseMenuShipCursor && pauseMenuShipCursor.initialized && Number.isFinite(pauseMenuShipCursor.renderRot)
                ? pauseMenuShipCursor.renderRot
                : Math.PI / 2;
            const fromScale = pauseMenuShipCursor && pauseMenuShipCursor.initialized && Number.isFinite(pauseMenuShipCursor.renderScale)
                ? pauseMenuShipCursor.renderScale
                : (pauseMenuShipCursor.scale || 0.24);
            if (phase === 'enter') clearTerminalDockExitHold();
            terminalDockTransition = {
                active: true,
                phase,
                startedAt: now,
                galaxyIndex,
                shipIndex,
                fromX,
                fromY,
                fromRot,
                fromScale,
                color: (galaxy && galaxy.colors && galaxy.colors[0]) || '#8ff7ff'
            };
            clearGameplayKeys();
            gameState = 'TERMINAL_DOCK';
            titleAlpha = 1;
        }

        function completeTerminalDockTransition() {
            if (!terminalDockTransition.active) return;
            const phase = terminalDockTransition.phase;
            terminalDockTransition.active = false;
            clearGameplayKeys();
            if (phase === 'exit') {
                markTerminalDockExitHold(selectedGalaxyIndex, terminalDockTransition.shipIndex);
                const exitPose = getTerminalDockExitCursorPose(selectedGalaxyIndex);
                if (exitPose) {
                    pauseMenuShipCursor.x = exitPose.x;
                    pauseMenuShipCursor.y = exitPose.y;
                    pauseMenuShipCursor.vx = 0;
                    pauseMenuShipCursor.vy = 0;
                    pauseMenuShipCursor.rot = Math.atan2(exitPose.faceY - exitPose.y, exitPose.faceX - exitPose.x) + Math.PI / 2;
                    pauseMenuShipCursor.scale = 0.25;
                    pauseMenuShipCursor.speed = Math.hypot(pauseMenuShipCursor.vx, pauseMenuShipCursor.vy);
                    pauseMenuShipCursor.trail = [];
                    pauseMenuShipCursor.trailEmitAcc = 0;
                    pauseMenuShipCursor.settleBlend = 0;
                    pauseMenuShipCursor.initialized = true;
                    pauseMenuShipCursor.lastNow = currentFrameNow || performance.now();
                    pauseMenuShipCursor.targetKey = `terminal-outbound-${selectedGalaxyIndex}`;
                    pauseMenuShipCursor.routeKey = `terminal-outbound-${selectedGalaxyIndex}`;
                    pauseMenuShipCursor.approachComplete = true;
                    pauseMenuShipCursor.renderX = pauseMenuShipCursor.x;
                    pauseMenuShipCursor.renderY = pauseMenuShipCursor.y;
                    pauseMenuShipCursor.renderRot = pauseMenuShipCursor.rot;
                    pauseMenuShipCursor.renderScale = pauseMenuShipCursor.scale;
                } else {
                    clearTerminalDockExitHold();
                    resetPauseMenuShipCursor();
                }
                gameState = 'GALAXY_SELECT';
                titleAlpha = 1;
                return;
            }
            shipSelectReturnState = 'GALAXY_SELECT';
            shipSelectIndex = selectedShipIndex;
            resetShipSelectCarouselMotion(shipSelectIndex);
            resetPauseMenuShipCursor();
            gameState = 'SHIP_SELECT';
            titleAlpha = 1;
        }

        function shipSelectNoise(seed, index) {
            const value = Math.sin((index + 1) * seed) * 43758.5453123;
            return value - Math.floor(value);
        }

        const SHIP_SELECT_HANGAR_WORDS = [
            'AI', 'AGENT', 'MODEL', 'PROMPT', 'TOKEN', 'LATENT', 'EMBED', 'RAG', 'SAMPLER', 'DENOISE',
            'DIFFUSION', 'TRANSFORM', 'ATTN', 'SOFTMAX', 'MATMUL', 'GRAD', 'LOSS', 'EPOCH', 'INFER', 'BACKPROP',
            'CUDA', 'RTX', 'TENSOR', 'RT CORE', 'SHADER', 'RASTER', 'VRAM', 'GDDR', 'HBM', 'SM',
            'KERNEL', 'THREAD', 'WARP', 'BLOCK', 'REGISTER', 'CACHE', 'L1', 'L2', 'L3', 'BUS',
            'PCIE', 'DMA', 'IRQ', 'BIOS', 'UEFI', 'BOOT', 'CLOCK', 'VRM', 'THERMAL', 'VOLTAGE',
            'SILICON', 'WAFER', 'NODE', '3NM', '7NM', 'ASIC', 'FPGA', 'NPU', 'TOPS', 'FLOPS',
            'ALU', 'FPU', 'SIMD', 'VEC4', 'PIPELINE', 'QUEUE', 'STACK', 'HEAP', 'HASH', 'CRC',
            'XOR', 'NAND', 'NOR', 'BITSHIFT', 'VECTOR', 'MATRIX', 'SCALAR', 'EIGEN', 'SIGMA', 'DELTA',
            'LAMBDA', 'OMEGA', 'PHI', 'FFT', 'COSINE', 'DOT', 'CROSS', 'ENTROPY', 'CHAOS', 'QUANT',
            'QUBIT', 'ORBIT', 'APERTURE', 'SPACETIME', 'NAV MESH', 'TELEMETRY', 'SENSOR', 'RADAR', 'LIDAR', 'GYRO',
            'AUTOPILOT', 'VECTOR BAY', 'DOCKING', 'DRYDOCK', 'FLEET AI', 'ION BUS', 'PLASMA', 'THRUST', 'REACTOR', 'CORE TEMP',
            'SYNC', 'RX', 'TX', 'SYS', 'CLK', 'ADDR', 'OPCODE', 'BUFFER', 'SWAP', 'MALLOC',
            'GC', 'JIT', 'WASM', 'CANVAS', 'SCANLINE', 'BLOOM', 'GLOW', 'ATLAS', 'SPRITE', 'FRAME'
        ];
        const SHIP_SELECT_HANGAR_CLUSTER_WORDS = [
            'AI', 'GPU', 'RTX', 'CUDA', 'VRAM', 'CORE', 'BUS', 'CLK', 'L1', 'L2', 'SM', 'NPU',
            'FFT', 'XOR', 'CRC', 'VEC', 'MAT', 'SIMD', 'HASH', 'QBIT', 'WARP', 'NODE', 'RAY', 'ION',
            'RX', 'TX', 'SYS', 'BOOT', 'JIT', 'WASM', 'DSP', 'PIX', 'ATLAS', 'BLOOM', 'NAV', 'GYRO'
        ];
        const SHIP_SELECT_HANGAR_WORD_COLORS = ['#dcecff', '#a8d4ff', '#8fbfff'];
        const SHIP_SELECT_HANGAR_STAR_GLYPHS = ['.', "'", '*', '+'];
        const SHIP_SELECT_HANGAR_STARS = Array.from({ length: 170 }, (_, i) => ({
            x: shipSelectNoise(211.13, i),
            y: shipSelectNoise(223.79, i),
            size: 3 + Math.floor(shipSelectNoise(229.41, i) * 7),
            alpha: 0.045 + shipSelectNoise(233.83, i) * 0.18,
            speed: 0.000006 + shipSelectNoise(239.29, i) * 0.000018,
            phase: shipSelectNoise(241.67, i) * Math.PI * 2,
            glyph: SHIP_SELECT_HANGAR_STAR_GLYPHS[i % SHIP_SELECT_HANGAR_STAR_GLYPHS.length],
            bright: shipSelectNoise(251.31, i) > 0.92
        }));
        const SHIP_SELECT_HANGAR_MOTES = Array.from({ length: 34 }, (_, i) => {
            const wordIndex = Math.floor(shipSelectNoise(101.91, i) * SHIP_SELECT_HANGAR_CLUSTER_WORDS.length) % SHIP_SELECT_HANGAR_CLUSTER_WORDS.length;
            const fontRoll = shipSelectNoise(89.17, i);
            const tokenCount = 3 + Math.floor(shipSelectNoise(107.31, i) * 4);
            const kindRoll = shipSelectNoise(113.83, i);
            const kind = kindRoll > 0.82 ? 'comet' : (kindRoll > 0.48 ? 'galaxy' : 'sphere');
            return {
                x: shipSelectNoise(13.79, i),
                y: shipSelectNoise(41.23, i),
                alpha: 0.045 + shipSelectNoise(53.61, i) * 0.13,
                speed: 0.000006 + shipSelectNoise(71.42, i) * 0.000028,
                floatSpeed: 0.42 + shipSelectNoise(137.67, i) * 0.72,
                floatAmp: 2 + shipSelectNoise(139.23, i) * 7,
                wobbleAmp: 2 + shipSelectNoise(149.49, i) * 9,
                phase: shipSelectNoise(29.31, i) * Math.PI * 2,
                fontSize: Math.round(5 + fontRoll * 5),
                rotation: (shipSelectNoise(109.57, i) - 0.5) * 0.46,
                radius: 7 + shipSelectNoise(127.61, i) * 23,
                squash: 0.38 + shipSelectNoise(131.19, i) * 0.44,
                spin: (shipSelectNoise(157.77, i) > 0.5 ? 1 : -1) * (0.05 + shipSelectNoise(163.97, i) * 0.16),
                tokenCount,
                kind,
                colorIndex: Math.floor(shipSelectNoise(151.11, i) * SHIP_SELECT_HANGAR_WORD_COLORS.length) % SHIP_SELECT_HANGAR_WORD_COLORS.length,
                glyph: SHIP_SELECT_HANGAR_CLUSTER_WORDS[wordIndex],
                tokens: Array.from({ length: tokenCount }, (_, j) => {
                    const tokenIndex = (wordIndex + j * (3 + (i % 7))) % SHIP_SELECT_HANGAR_CLUSTER_WORDS.length;
                    return SHIP_SELECT_HANGAR_CLUSTER_WORDS[tokenIndex];
                })
            };
        });
        const shipSelectHangarBackdropCache = {
            sprites: [],
            accent: '',
            ready: false
        };

        function getWrappedShipSelectOffset(index, selectedIndex, count) {
            let offset = index - selectedIndex;
            if (offset > count / 2) offset -= count;
            if (offset < -count / 2) offset += count;
            return offset;
        }

        const SHIP_SELECT_CAROUSEL_DURATION = 430;
        const SHIP_SELECT_CAROUSEL_VISIBLE_RADIUS = 4;
        const shipSelectCarouselMotion = {
            initialized: false,
            fromIndex: 0,
            targetIndex: 0,
            targetRenderIndex: 0,
            renderIndex: 0,
            startedAt: 0,
            direction: 0,
            progress: 1
        };
        const SHIP_SELECT_LOCKED_NOTICE_DURATION = 920;
        let shipSelectLockedNotice = {
            shipId: '',
            startedAt: -9999
        };

        function markShipSelectLockedAttempt(shipConfig = getShipSelectConfig()) {
            shipSelectLockedNotice.shipId = shipConfig && shipConfig.id ? shipConfig.id : '';
            shipSelectLockedNotice.startedAt = currentFrameNow || performance.now();
        }

        function getShipSelectLockedNoticeProgress(shipConfig, now) {
            if (!shipConfig || shipSelectLockedNotice.shipId !== shipConfig.id) return 0;
            const elapsed = Math.max(0, now - shipSelectLockedNotice.startedAt);
            return elapsed < SHIP_SELECT_LOCKED_NOTICE_DURATION
                ? 1 - (elapsed / SHIP_SELECT_LOCKED_NOTICE_DURATION)
                : 0;
        }

        function getShipSelectLockedColor(shipConfig, amount = 0.58) {
            const source = shipConfig && shipConfig.previewColor ? shipConfig.previewColor : '#dcecff';
            if (typeof mixHexColor === 'function') {
                return mixHexColor(source, '#87939f', amount);
            }
            const clamped = Math.max(0, Math.min(1, amount));
            const a = String(source).replace('#', '').padEnd(6, 'f').slice(0, 6);
            const b = '87939f';
            const ar = parseInt(a.slice(0, 2), 16);
            const ag = parseInt(a.slice(2, 4), 16);
            const ab = parseInt(a.slice(4, 6), 16);
            const br = parseInt(b.slice(0, 2), 16);
            const bg = parseInt(b.slice(2, 4), 16);
            const bb = parseInt(b.slice(4, 6), 16);
            const r = Math.round((Number.isFinite(ar) ? ar : 255) + (br - (Number.isFinite(ar) ? ar : 255)) * clamped).toString(16).padStart(2, '0');
            const g = Math.round((Number.isFinite(ag) ? ag : 255) + (bg - (Number.isFinite(ag) ? ag : 255)) * clamped).toString(16).padStart(2, '0');
            const bl = Math.round((Number.isFinite(ab) ? ab : 255) + (bb - (Number.isFinite(ab) ? ab : 255)) * clamped).toString(16).padStart(2, '0');
            return `#${r}${g}${bl}`;
        }

        function normalizeShipSelectRenderIndexNear(index, reference, count) {
            let normalized = index;
            if (!count) return normalized;
            while (normalized - reference > count / 2) normalized -= count;
            while (normalized - reference < -count / 2) normalized += count;
            return normalized;
        }

        function easeShipSelectCarousel(t) {
            const clamped = Math.max(0, Math.min(1, t));
            return 1 - Math.pow(1 - clamped, 3);
        }

        function resetShipSelectCarouselMotion(index = shipSelectIndex) {
            const shipCount = typeof PLAYER_SHIP_TYPES !== 'undefined' ? PLAYER_SHIP_TYPES.length : 1;
            const safeIndex = shipCount > 0 ? wrapShipIndex(index) : 0;
            shipSelectCarouselMotion.initialized = true;
            shipSelectCarouselMotion.fromIndex = safeIndex;
            shipSelectCarouselMotion.targetIndex = safeIndex;
            shipSelectCarouselMotion.targetRenderIndex = safeIndex;
            shipSelectCarouselMotion.renderIndex = safeIndex;
            shipSelectCarouselMotion.startedAt = currentFrameNow || performance.now();
            shipSelectCarouselMotion.direction = 0;
            shipSelectCarouselMotion.progress = 1;
        }

        function getShipSelectCarouselCurrentRenderIndex(now, count) {
            if (!shipSelectCarouselMotion.initialized || count <= 1) return shipSelectCarouselMotion.renderIndex;
            const elapsed = Math.max(0, now - shipSelectCarouselMotion.startedAt);
            const rawProgress = Math.min(1, elapsed / SHIP_SELECT_CAROUSEL_DURATION);
            const eased = easeShipSelectCarousel(rawProgress);
            const travel = shipSelectCarouselMotion.targetRenderIndex - shipSelectCarouselMotion.fromIndex;
            return shipSelectCarouselMotion.fromIndex + travel * eased;
        }

        function updateShipSelectCarouselMotion(now, targetIndex, count) {
            if (!count || count <= 1) {
                shipSelectCarouselMotion.renderIndex = targetIndex || 0;
                shipSelectCarouselMotion.targetIndex = targetIndex || 0;
                shipSelectCarouselMotion.progress = 1;
                return shipSelectCarouselMotion.renderIndex;
            }

            const wrappedTarget = wrapShipIndex(targetIndex);
            if (!shipSelectCarouselMotion.initialized) {
                resetShipSelectCarouselMotion(wrappedTarget);
                return shipSelectCarouselMotion.renderIndex;
            }

            if (shipSelectCarouselMotion.targetIndex !== wrappedTarget) {
                const currentRenderIndex = getShipSelectCarouselCurrentRenderIndex(now, count);
                const normalizedTarget = normalizeShipSelectRenderIndexNear(wrappedTarget, currentRenderIndex, count);
                const travel = normalizedTarget - currentRenderIndex;
                shipSelectCarouselMotion.fromIndex = currentRenderIndex;
                shipSelectCarouselMotion.targetIndex = wrappedTarget;
                shipSelectCarouselMotion.targetRenderIndex = normalizedTarget;
                shipSelectCarouselMotion.startedAt = now;
                shipSelectCarouselMotion.direction = travel === 0 ? 0 : Math.sign(travel);
                shipSelectCarouselMotion.progress = 0;
            }

            const elapsed = Math.max(0, now - shipSelectCarouselMotion.startedAt);
            shipSelectCarouselMotion.progress = Math.min(1, elapsed / SHIP_SELECT_CAROUSEL_DURATION);
            shipSelectCarouselMotion.renderIndex = getShipSelectCarouselCurrentRenderIndex(now, count);
            if (shipSelectCarouselMotion.progress >= 1) {
                shipSelectCarouselMotion.fromIndex = wrappedTarget;
                shipSelectCarouselMotion.targetRenderIndex = wrappedTarget;
                shipSelectCarouselMotion.renderIndex = wrappedTarget;
                shipSelectCarouselMotion.direction = 0;
            }
            return shipSelectCarouselMotion.renderIndex;
        }

        function renderShipSelectHangarMoteSprite(mote, accent, index) {
            if (typeof document === 'undefined') return null;
            const baseColor = SHIP_SELECT_HANGAR_WORD_COLORS[mote.colorIndex] || '#dcecff';
            const color = index % 4 === 0 ? mixColor(baseColor, accent, 0.16) : baseColor;
            const side = Math.max(52, Math.ceil(mote.radius * (mote.kind === 'comet' ? 4.4 : 3.1) + mote.fontSize * 7));
            const sprite = document.createElement('canvas');
            sprite.width = side;
            sprite.height = side;
            const spriteCtx = sprite.getContext('2d');
            if (!spriteCtx) return null;
            const cx = side / 2;
            const cy = side / 2;

            spriteCtx.save();
            spriteCtx.translate(cx, cy);
            spriteCtx.textAlign = 'center';
            spriteCtx.textBaseline = 'middle';
            spriteCtx.globalCompositeOperation = 'screen';
            if (mote.kind === 'comet') {
                const tail = mote.radius * 1.75;
                spriteCtx.strokeStyle = colorWithAlpha(color, 0.42);
                spriteCtx.lineWidth = 1;
                spriteCtx.beginPath();
                spriteCtx.moveTo(-tail, 0);
                spriteCtx.quadraticCurveTo(-tail * 0.42, -mote.radius * 0.22, mote.radius * 0.34, 0);
                spriteCtx.stroke();
            } else {
                spriteCtx.strokeStyle = colorWithAlpha(color, 0.18);
                spriteCtx.lineWidth = 1;
                spriteCtx.beginPath();
                spriteCtx.ellipse(0, 0, mote.radius, mote.radius * mote.squash, 0, 0, Math.PI * 2);
                spriteCtx.stroke();
            }

            for (let j = 0; j < mote.tokens.length; j++) {
                const angle = mote.phase + (j / mote.tokens.length) * Math.PI * 2;
                let px;
                let py;
                if (mote.kind === 'comet') {
                    px = -j * (mote.radius * 0.26 + 4) + Math.cos(angle) * 2.4;
                    py = Math.sin(angle) * mote.radius * 0.26;
                } else {
                    px = Math.cos(angle) * mote.radius;
                    py = Math.sin(angle) * mote.radius * mote.squash;
                }
                const tokenAlpha = mote.kind === 'comet'
                    ? Math.max(0.20, 0.74 - j * 0.10)
                    : (0.34 + (Math.sin(angle) * 0.5 + 0.5) * 0.34);
                spriteCtx.save();
                spriteCtx.translate(px, py);
                if (mote.kind === 'galaxy') {
                    spriteCtx.rotate(angle + Math.PI / 2);
                } else if (mote.kind === 'sphere') {
                    spriteCtx.rotate(angle * 0.32);
                } else {
                    spriteCtx.rotate(-0.12 + Math.sin(angle) * 0.18);
                }
                spriteCtx.globalAlpha = tokenAlpha;
                spriteCtx.font = `bold ${Math.max(5, mote.fontSize - (j % 3))}px Courier New`;
                spriteCtx.fillStyle = color;
                spriteCtx.fillText(mote.tokens[j], 0, 0);
                spriteCtx.restore();
            }
            spriteCtx.globalAlpha = 0.72;
            spriteCtx.fillStyle = index % 6 === 0 ? '#ffffff' : color;
            spriteCtx.fillRect(-1, -1, 2, 2);
            spriteCtx.restore();
            spriteCtx.globalAlpha = 1;
            spriteCtx.globalCompositeOperation = 'source-over';
            return sprite;
        }

        function getShipSelectHangarMoteSprites(accent) {
            const accentKey = accent || '#9ff7ff';
            if (shipSelectHangarBackdropCache.ready && shipSelectHangarBackdropCache.accent === accentKey) {
                return shipSelectHangarBackdropCache.sprites;
            }
            shipSelectHangarBackdropCache.accent = accentKey;
            shipSelectHangarBackdropCache.sprites = SHIP_SELECT_HANGAR_MOTES.map((mote, index) => renderShipSelectHangarMoteSprite(mote, accentKey, index));
            shipSelectHangarBackdropCache.ready = true;
            return shipSelectHangarBackdropCache.sprites;
        }

        function drawShipSelectHangarLiveStars(now, alpha) {
            const t = now * 0.001;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            for (let i = 0; i < SHIP_SELECT_HANGAR_STARS.length; i++) {
                const star = SHIP_SELECT_HANGAR_STARS[i];
                const x = (star.x * (width + 90) - 45 + now * star.speed * width) % (width + 90) - 45;
                const y = star.y * height + Math.sin(t * 0.42 + star.phase) * 2;
                const twinkle = 0.5 + Math.sin(t * 0.95 + star.phase) * 0.5;
                ctx.globalAlpha = alpha * star.alpha * (0.55 + twinkle * 0.45);
                ctx.fillStyle = star.bright ? '#ffffff' : '#9ec7ff';
                if (star.glyph === '+' || star.bright) {
                    const size = Math.max(1, star.size * 0.22);
                    ctx.fillRect(x - size, y, size * 2 + 1, 1);
                    ctx.fillRect(x, y - size, 1, size * 2 + 1);
                } else {
                    const size = Math.max(1, star.size * 0.16);
                    ctx.fillRect(x, y, size, size);
                }
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawShipSelectHangarCachedBackdrop(now, accent, alpha) {
            if (width <= 0 || height <= 0) return false;
            const t = now * 0.001;
            drawShipSelectHangarLiveStars(now, alpha);
            const sprites = getShipSelectHangarMoteSprites(accent);
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            for (let i = 0; i < SHIP_SELECT_HANGAR_MOTES.length; i++) {
                const mote = SHIP_SELECT_HANGAR_MOTES[i];
                const sprite = sprites[i];
                if (!sprite) continue;
                const x = (mote.x * (width + 170) - 85 + now * mote.speed * width + Math.sin(t * mote.floatSpeed + mote.phase) * mote.wobbleAmp) % (width + 170) - 85;
                const y = mote.y * height + Math.sin(t * (mote.floatSpeed * 0.72) + mote.phase) * mote.floatAmp;
                const flicker = 0.55 + Math.sin(t * 0.82 + mote.phase) * 0.45;
                const drawAlpha = alpha * mote.alpha * (3.0 + flicker * 1.1);
                const spriteSpin = mote.kind === 'comet' ? mote.spin * 0.38 : mote.spin * 0.82;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(mote.rotation + Math.sin(t * 0.18 + mote.phase) * 0.10 + t * spriteSpin);
                ctx.globalAlpha = Math.min(0.42, drawAlpha);
                ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
                ctx.restore();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            return true;
        }

        function drawShipSelectHangarBackground(now, selectedShip, alpha) {
            const accent = selectedShip.previewColor || '#9ff7ff';
            const t = now * 0.001;
            const horizonY = height * 0.52;
            const floorY = height * 0.93;
            const scanX = ((now * 0.030) % (width + 360)) - 180;
            const wallPulse = 0.5 + Math.sin(t * 1.6) * 0.5;

            ctx.save();
            ctx.globalAlpha = alpha;
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#020817');
            bg.addColorStop(0.44, '#071226');
            bg.addColorStop(0.64, '#04101d');
            bg.addColorStop(1, '#010610');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            const wallGlow = ctx.createRadialGradient(width * 0.5, height * 0.38, 0, width * 0.5, height * 0.38, Math.max(width, height) * 0.7);
            wallGlow.addColorStop(0, colorWithAlpha(accent, 0.060 + wallPulse * 0.020));
            wallGlow.addColorStop(0.38, 'rgba(80, 150, 210, 0.034)');
            wallGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = wallGlow;
            ctx.fillRect(0, 0, width, height);

            drawShipSelectHangarCachedBackdrop(now, accent, alpha);

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.max(34, width * 0.052)}px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#dcecff', 0.024 + wallPulse * 0.008);
            ctx.fillText('VECTOR BAY 07', width / 2, height * 0.255);
            ctx.font = `bold ${Math.max(11, width * 0.012)}px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#9ec7ff', 0.11 + wallPulse * 0.030);
            ctx.fillText('ORBITAL DRYDOCK // LOADOUT FRAME READY', width / 2, height * 0.305);
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha * 0.42;
            ctx.strokeStyle = colorWithAlpha(accent, 0.34);
            ctx.lineWidth = 1;
            const gantryY = height * 0.39;
            ctx.beginPath();
            ctx.moveTo(width * 0.12, gantryY);
            ctx.lineTo(width * 0.88, gantryY);
            ctx.moveTo(width * 0.18, gantryY - 24);
            ctx.lineTo(width * 0.82, gantryY - 24);
            ctx.stroke();
            for (let i = 0; i < 9; i++) {
                const gx = width * (0.18 + i * 0.08);
                const bob = Math.sin(t * 1.2 + i) * 2;
                ctx.strokeStyle = colorWithAlpha(i % 2 ? '#dcecff' : accent, 0.20);
                ctx.strokeRect(gx - 8, gantryY - 36 + bob, 16, 20);
                ctx.fillStyle = colorWithAlpha(i % 2 ? accent : '#ffffff', 0.20 + wallPulse * 0.06);
                ctx.fillRect(gx - 2, gantryY - 15 + bob, 4, 8);
            }
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha;
            const scan = ctx.createLinearGradient(scanX - 90, 0, scanX + 90, 0);
            scan.addColorStop(0, 'rgba(255,255,255,0)');
            scan.addColorStop(0.48, colorWithAlpha(accent, 0.055));
            scan.addColorStop(0.5, 'rgba(255,255,255,0.060)');
            scan.addColorStop(0.52, colorWithAlpha(accent, 0.055));
            scan.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = scan;
            ctx.fillRect(scanX - 90, 0, 180, height);
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = alpha * 0.72;
            ctx.lineWidth = 1;
            for (let i = -6; i <= 6; i++) {
                const x = width / 2 + i * width * 0.075;
                const edgeX = width / 2 + i * width * 0.18;
                ctx.strokeStyle = colorWithAlpha(i === 0 ? '#ffffff' : accent, i === 0 ? 0.16 : 0.13);
                ctx.beginPath();
                ctx.moveTo(x, horizonY);
                ctx.lineTo(edgeX, floorY);
                ctx.stroke();
            }
            for (let i = 0; i < 9; i++) {
                const depth = ((i + (now * 0.00035)) % 9) / 9;
                const eased = depth * depth;
                const y = horizonY + eased * (floorY - horizonY);
                const halfW = width * (0.10 + eased * 0.50);
                const railAlpha = 0.06 + eased * 0.18;
                ctx.strokeStyle = colorWithAlpha(i % 3 === 0 ? '#ffffff' : accent, railAlpha);
                ctx.beginPath();
                ctx.moveTo(width / 2 - halfW, y);
                ctx.lineTo(width / 2 + halfW, y);
                ctx.stroke();
            }
            ctx.strokeStyle = colorWithAlpha(accent, 0.28);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(width * 0.20, floorY);
            ctx.lineTo(width * 0.39, horizonY + 10);
            ctx.moveTo(width * 0.80, floorY);
            ctx.lineTo(width * 0.61, horizonY + 10);
            ctx.stroke();
            ctx.restore();

            ctx.restore();
        }

        function drawShipSelectStat(label, valueText, ratio, x, y, color, options = {}) {
            const barW = options.barW || 190;
            const barH = options.barH || 9;
            const labelW = options.labelW || 74;
            const valueX = options.valueX || (x + labelW + barW + 58);
            const fillW = Math.max(5, Math.min(barW, barW * ratio));
            ctx.fillStyle = colorWithAlpha('#dcecff', 0.74);
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, y);
            ctx.fillStyle = 'rgba(255,255,255,0.115)';
            ctx.fillRect((x + labelW) | 0, (y - barH / 2) | 0, barW, barH);
            ctx.fillStyle = colorWithAlpha('#000000', 0.24);
            ctx.fillRect((x + labelW + fillW) | 0, (y - barH / 2) | 0, Math.max(0, barW - fillW), barH);
            const gradient = ctx.createLinearGradient(x + labelW, 0, x + labelW + barW, 0);
            gradient.addColorStop(0, colorWithAlpha(color, 0.86));
            gradient.addColorStop(0.72, mixColor(color, '#ffffff', 0.50));
            gradient.addColorStop(1, '#ffffff');
            ctx.fillStyle = gradient;
            ctx.fillRect((x + labelW) | 0, (y - barH / 2) | 0, fillW, barH);
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.16);
            ctx.fillRect((x + labelW) | 0, (y - barH / 2) | 0, fillW, 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(valueText, valueX, y);
        }

        function drawShipSelectHullStat(shipConfig, x, y, w, color) {
            const h = 32;
            ctx.fillStyle = colorWithAlpha(color, 0.070);
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = colorWithAlpha(color, 0.28);
            ctx.strokeRect(x + 0.5, y + 0.5, w, h);
            ctx.fillStyle = colorWithAlpha('#dcecff', 0.72);
            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('HULL INTEGRITY', x + 14, y + h / 2);
            ctx.textAlign = 'right';
            ctx.font = `bold 18px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = color;
            ctx.shadowBlur = glowEnabled ? 8 : 0;
            ctx.fillText(`${shipConfig.maxHp} HP`, x + w - 14, y + h / 2 + 1);
            ctx.shadowBlur = 0;
        }

        function getShipSelectThrusterParticleColor(life, accent) {
            const baseColor = typeof getExhaustColor === 'function'
                ? getExhaustColor(life)
                : (life > 0.62 ? '#fff4b8' : (life > 0.34 ? '#ff8a38' : '#3d7dff'));
            return mixColor(baseColor, accent, 0.24);
        }

        function drawSelectedShipPreviewThrusters(shipConfig, previewShip, now) {
            const accent = shipConfig.previewColor || '#9ff7ff';
            const t = now * 0.001;
            const layout = typeof getPlayerRenderLayout === 'function'
                ? getPlayerRenderLayout(previewShip, 'center')
                : null;
            const anchors = layout && typeof getPlayerThrusterAnchors === 'function'
                ? getPlayerThrusterAnchors(layout)
                : [{ x: 0, y: 47 }];
            const particles = typeof EXHAUST_PARTICLE_CHARS !== 'undefined'
                ? EXHAUST_PARTICLE_CHARS
                : ['^', '*', '.', 'v'];

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let i = 0; i < anchors.length; i++) {
                const anchor = anchors[i];
                const thruster = layout && layout.thrusters ? layout.thrusters[i] : null;
                const thrusterSize = thruster && thruster.fontSize ? thruster.fontSize : 34;
                const streamLength = 23 + thrusterSize * 0.54;
                const streamWidth = 3.6 + thrusterSize * 0.12;
                const baseFont = Math.max(7, Math.min(12, thrusterSize * 0.31));
                const nozzleX = anchor.x;
                const nozzleY = anchor.y - 1;

                for (let p = 0; p < 8; p++) {
                    const seed = shipSelectNoise(83.17 + i * 11.9, p + shipConfig.id.length * 3);
                    const phase = (t * (1.55 + seed * 0.36) + p / 8 + i * 0.19) % 1;
                    const life = 1 - phase;
                    const sideDrift = Math.sin(t * 10 + p * 1.73 + i) * 1.9;
                    const spread = (seed - 0.5) * streamWidth * (0.6 + phase * 1.4);
                    const x = nozzleX + spread + sideDrift * phase;
                    const y = nozzleY + phase * streamLength;
                    const alpha = Math.max(0, Math.min(0.74, life * life * 0.92));
                    if (alpha <= 0.035) continue;

                    const glyph = particles[(p + i * 2 + Math.floor(t * 12)) % particles.length];
                    const fontSize = baseFont + life * 5 + seed * 2;
                    const particleColor = getShipSelectThrusterParticleColor(life, accent);
                    ctx.globalAlpha = alpha;
                    ctx.font = `bold ${fontSize}px Courier New`;
                    ctx.fillStyle = particleColor;
                    if (glowEnabled) {
                        ctx.shadowColor = p % 5 === 0 ? '#fff4b8' : accent;
                        ctx.shadowBlur = 4 + life * 7;
                    } else {
                        ctx.shadowBlur = 0;
                    }
                    ctx.fillText(glyph, x, y);
                }
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 0;
        }

        function drawShipSelectPreview(shipConfig, slotX, slotY, selected, now, slotIndex, offset = 0) {
            const locked = typeof isShipConfigLocked === 'function' && isShipConfigLocked(shipConfig);
            const displayColor = locked ? getShipSelectLockedColor(shipConfig, selected ? 0.70 : 0.86) : shipConfig.previewColor;
            const previewShip = {
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                shipId: shipConfig.id,
                _renderLayoutCache: null
            };
            const distance = Math.abs(offset);
            const centerWeight = Math.max(0, 1 - Math.min(1, distance));
            const bob = Math.sin(now * 0.002 + slotIndex * 1.7) * (selected ? 6 : Math.max(1.5, 3.5 - distance));
            const rotation = (selected
                ? Math.sin(now * 0.0017) * 0.08
                : offset * 0.045 + Math.sin(now * 0.001 + slotIndex) * 0.010);
            const scale = selected ? 1.03 : Math.max(0.43, 0.80 - distance * 0.095 + centerWeight * 0.12);
            const glow = selected ? (locked ? 34 : 28) : Math.max(4, 10 - distance);
            const sideAlpha = Math.max(0.15, 0.62 - distance * 0.105);

            ctx.save();
            ctx.translate(slotX, slotY + bob);
            ctx.rotate(rotation);
            ctx.scale(scale, scale);
            ctx.globalAlpha = selected ? (locked ? 0.74 : 1) : (locked ? sideAlpha * 0.62 : sideAlpha);
            if (locked) {
                ctx.filter = selected
                    ? 'grayscale(0.94) saturate(0.24) brightness(0.78)'
                    : 'grayscale(1) saturate(0.18) brightness(0.62)';
            }
            ctx.fillStyle = selected
                ? displayColor
                : mixColor(displayColor, '#6e8290', locked ? 0.82 : 0.70);
            ctx.shadowColor = selected ? displayColor : colorWithAlpha(displayColor, 0.62);
            ctx.shadowBlur = glowEnabled ? (locked ? glow * 0.34 : glow) : 0;
            if (selected) drawSelectedShipPreviewThrusters(shipConfig, previewShip, now);
            drawPlayerShip(previewShip, 'center');
            ctx.filter = 'none';
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = locked
                ? (selected ? 0.52 : Math.max(0.08, sideAlpha * 0.30))
                : (selected ? 0.78 : Math.max(0.10, sideAlpha * 0.42));
            ctx.strokeStyle = selected ? displayColor : colorWithAlpha(displayColor, 0.50);
            ctx.lineWidth = selected ? 2 : 1;
            if (glowEnabled && selected) {
                ctx.shadowColor = displayColor;
                ctx.shadowBlur = locked ? 5 : 16;
            }
            ctx.beginPath();
            ctx.ellipse(slotX, slotY + 92, selected ? 84 : Math.max(38, 56 - distance * 5), selected ? 15 : 9, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            if (locked && selected) {
                const noticePulse = getShipSelectLockedNoticeProgress(shipConfig, now);
                const lockPulse = 0.55 + Math.sin(now * 0.008) * 0.18 + noticePulse * 0.22;
                ctx.save();
                ctx.translate(slotX, slotY + 94);
                ctx.globalAlpha = 0.58 + noticePulse * 0.28;
                ctx.strokeStyle = colorWithAlpha('#ff5d42', 0.58 + noticePulse * 0.24);
                ctx.lineWidth = 1.5;
                ctx.shadowColor = '#ff5d42';
                ctx.shadowBlur = glowEnabled ? 10 + noticePulse * 12 : 0;
                ctx.beginPath();
                ctx.moveTo(-70, -8);
                ctx.lineTo(-44, -17);
                ctx.lineTo(0, -10 - lockPulse * 4);
                ctx.lineTo(44, -17);
                ctx.lineTo(70, -8);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-70, 8);
                ctx.lineTo(-44, 17);
                ctx.lineTo(0, 10 + lockPulse * 4);
                ctx.lineTo(44, 17);
                ctx.lineTo(70, 8);
                ctx.stroke();
                ctx.font = `bold 11px 'Electrolize', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = noticePulse > 0 ? '#ffffff' : '#ffb391';
                ctx.fillText(noticePulse > 0 ? 'ACCESS DENIED' : 'LOCKED', 0, 21);
                ctx.restore();
            }

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${selected ? 18 : 13}px 'Electrolize', sans-serif`;
            ctx.globalAlpha = locked
                ? (selected ? 0.72 : Math.max(0.18, sideAlpha * 0.72))
                : (selected ? 1 : Math.max(0.28, sideAlpha));
            ctx.fillStyle = locked
                ? mixColor('#b3bdc7', displayColor, selected ? 0.18 : 0.34)
                : (selected ? '#ffffff' : mixColor(shipConfig.previewColor, '#7f9aa8', 0.65));
            ctx.shadowColor = selected ? displayColor : colorWithAlpha(displayColor, 0.32);
            ctx.shadowBlur = glowEnabled && selected && !locked ? 10 : 0;
            if (distance <= 2.35 || selected) {
                ctx.fillText(shipConfig.name, slotX, slotY + (selected ? 134 : 118));
            }
            ctx.restore();
        }

        function drawShipSelectionScreen(now) {
            const selectedShip = getShipSelectConfig();
            const selectedShipLocked = typeof isShipConfigLocked === 'function' && isShipConfigLocked(selectedShip);
            const lockNotice = getShipSelectLockedNoticeProgress(selectedShip, now);
            const panelAccent = selectedShipLocked ? getShipSelectLockedColor(selectedShip, 0.44) : selectedShip.previewColor;
            const hubMode = typeof shipSelectReturnState !== 'undefined' && shipSelectReturnState === 'GALAXY_SELECT';
            const alpha = Math.max(0.85, titleAlpha);
            const centerY = height * 0.43;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            drawShipSelectHangarBackground(now, selectedShip, alpha);

            const headerPulse = 0.7 + Math.sin(now * 0.0024) * 0.22;
            ctx.font = `bold 30px 'Electrolize', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = panelAccent;
            ctx.shadowBlur = glowEnabled ? (selectedShipLocked ? 7 + headerPulse * 3 : 16 + headerPulse * 8) : 0;
            ctx.fillText(hubMode ? 'TERMINAL' : 'HANGAR SELECT', width / 2, height * 0.12);

            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha(panelAccent, selectedShipLocked ? 0.58 : 0.72);
            ctx.shadowBlur = 0;
            ctx.fillText(hubMode ? (selectedShipLocked ? 'CLASSIFIED FRAME' : 'SELECT ACTIVE FRAME') : 'RUN FRAME ONLINE', width / 2, height * 0.155);

            const shipCount = PLAYER_SHIP_TYPES.length;
            const slotSpacing = Math.min(168, Math.max(118, width * 0.126));
            const renderIndex = updateShipSelectCarouselMotion(now, shipSelectIndex, shipCount);
            const centerSlot = Math.round(renderIndex);
            const renderShips = [];
            for (let slotOffset = -SHIP_SELECT_CAROUSEL_VISIBLE_RADIUS; slotOffset <= SHIP_SELECT_CAROUSEL_VISIBLE_RADIUS; slotOffset++) {
                const logicalIndex = centerSlot + slotOffset;
                const index = wrapShipIndex(logicalIndex);
                renderShips.push({
                    ship: PLAYER_SHIP_TYPES[index],
                    index,
                    offset: logicalIndex - renderIndex
                });
            }
            renderShips.sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));

            for (let i = 0; i < renderShips.length; i++) {
                const item = renderShips[i];
                const distance = Math.abs(item.offset);
                const slotX = width / 2 + item.offset * slotSpacing;
                const slotY = centerY + distance * 17 + Math.max(0, distance - 1) * 8;
                if (slotX < -80 || slotX > width + 80) continue;
                drawShipSelectPreview(item.ship, slotX, slotY, distance < 0.52, now, item.index, item.offset);
            }

            const panelW = Math.min(440, width - 112);
            const panelH = 230;
            const panelX = width / 2 - panelW / 2;
            const panelY = Math.min(height - panelH - 44, height * 0.655);
            ctx.fillStyle = selectedShipLocked ? 'rgba(2, 7, 12, 0.84)' : 'rgba(2, 8, 14, 0.78)';
            ctx.fillRect(panelX, panelY, panelW, panelH);
            ctx.strokeStyle = colorWithAlpha(panelAccent, selectedShipLocked ? 0.50 : 0.76);
            ctx.lineWidth = 1;
            ctx.globalAlpha = selectedShipLocked ? 0.72 : 0.82;
            ctx.strokeRect(panelX + 0.5, panelY + 0.5, panelW, panelH);
            ctx.strokeStyle = colorWithAlpha(panelAccent, selectedShipLocked ? 0.13 : 0.18);
            ctx.strokeRect(panelX + 7.5, panelY + 7.5, panelW - 15, panelH - 15);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = colorWithAlpha(panelAccent, selectedShipLocked ? 0.12 : 0.20);
            ctx.fillRect(panelX + 1, panelY + 10, 2, panelH - 20);
            ctx.fillRect(panelX + panelW - 3, panelY + 10, 2, panelH - 20);

            ctx.textAlign = 'left';
            ctx.font = `bold 20px 'Electrolize', sans-serif`;
            ctx.fillStyle = selectedShipLocked ? '#c8d0d8' : '#ffffff';
            ctx.shadowColor = panelAccent;
            ctx.shadowBlur = glowEnabled ? (selectedShipLocked ? 3 : 10) : 0;
            ctx.fillText(selectedShip.name, panelX + 28, panelY + 32);

            if (selectedShipLocked) {
                const badgeW = 104;
                const badgeH = 22;
                const badgeX = panelX + panelW - badgeW - 24;
                const badgeY = panelY + 19;
                const badgeAlpha = 0.72 + lockNotice * 0.26;
                ctx.shadowBlur = 0;
                ctx.fillStyle = colorWithAlpha('#2a0508', 0.54 + lockNotice * 0.18);
                ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
                ctx.strokeStyle = colorWithAlpha('#ff624d', badgeAlpha);
                ctx.strokeRect(badgeX + 0.5, badgeY + 0.5, badgeW, badgeH);
                ctx.textAlign = 'center';
                ctx.font = `bold 10px 'Electrolize', sans-serif`;
                ctx.fillStyle = lockNotice > 0 ? '#ffffff' : '#ff967f';
                ctx.fillText(lockNotice > 0 ? 'ACCESS DENIED' : 'LOCKED FRAME', badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);
                ctx.textAlign = 'left';
            }

            ctx.font = `12px 'Electrolize', sans-serif`;
            ctx.fillStyle = selectedShipLocked ? colorWithAlpha('#ffb391', 0.86) : '#8fb9c8';
            ctx.shadowBlur = 0;
            ctx.fillText(selectedShip.subtitle.toUpperCase(), panelX + 28, panelY + 55);
            ctx.fillStyle = selectedShipLocked ? colorWithAlpha('#ff624d', 0.90 + lockNotice * 0.10) : selectedShip.previewColor;
            ctx.fillText((selectedShipLocked ? (selectedShip.lockReason || selectedShip.trait) : selectedShip.trait).toUpperCase(), panelX + 28, panelY + 75);

            drawShipSelectHullStat(selectedShip, panelX + 28, panelY + 92, panelW - 56, panelAccent);

            const statX = panelX + 28;
            const statY = panelY + 142;
            const statOptions = {
                barW: panelW - 204,
                labelW: 72,
                valueX: panelX + panelW - 28
            };
            drawShipSelectStat('DMG', `${Math.round(selectedShip.damageMult * 100)}%`, selectedShip.damageMult / 1.22, statX, statY, panelAccent, statOptions);
            drawShipSelectStat('FIRE', `${Math.round((306 / selectedShip.fireRate) * 100)}%`, (306 / selectedShip.fireRate) / 1.11, statX, statY + 18, panelAccent, statOptions);
            drawShipSelectStat('SPEED', `${Math.round(selectedShip.moveSpeedMult * 100)}%`, selectedShip.moveSpeedMult / 1.16, statX, statY + 36, panelAccent, statOptions);
            drawShipSelectStat('BOMB', `${Math.round((1 / selectedShip.bombCooldownMult) * 100)}%`, (1 / selectedShip.bombCooldownMult) / 1.24, statX, statY + 54, panelAccent, statOptions);
            drawShipSelectStat('EVADE', `${Math.round((1 / selectedShip.hitboxMult) * 100)}%`, (1 / selectedShip.hitboxMult) / 1.12, statX, statY + 72, panelAccent, statOptions);

            ctx.restore();
        }

        function getTerminalDockMetrics(index) {
            const galaxyIndex = Number.isFinite(index) ? index : selectedGalaxyIndex;
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            const galaxy = galaxies[galaxyIndex] || galaxies[0];
            const slot = getGalaxySelectSlot(galaxyIndex);
            const radius = getGalaxySelectRenderRadius(galaxyIndex, true);
            return { galaxyIndex, galaxy, slot, radius };
        }

        function getTerminalDockShipPose(progress, transition, metrics) {
            const phase = transition && transition.phase === 'exit' ? 'exit' : 'enter';
            const t = easeGalaxyWarp(Math.max(0, Math.min(1, progress)));
            const slot = metrics.slot;
            const radius = metrics.radius;
            let start;
            let p1;
            let p2;
            let end;
            let scale;
            let alpha;

            if (phase === 'exit') {
                start = { x: slot.x + radius * 0.30, y: slot.y + radius * 0.02 };
                p1 = { x: slot.x + radius * 0.62, y: slot.y - radius * 0.08 };
                p2 = { x: slot.x + radius * 1.32, y: slot.y - radius * 0.38 };
                end = {
                    x: Math.min(width - 54, slot.x + radius * 1.98),
                    y: Math.max(100, slot.y - radius * 0.44)
                };
                scale = lerpGalaxyWarp(0.11, 0.25, easeGalaxyWarp(Math.min(1, progress / 0.82)));
                alpha = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.10) / 0.26)));
            } else {
                start = {
                    x: Number.isFinite(transition && transition.fromX) ? transition.fromX : slot.x - radius * 1.55,
                    y: Number.isFinite(transition && transition.fromY) ? transition.fromY : slot.y
                };
                p1 = { x: start.x + radius * 0.50, y: start.y - radius * 0.08 };
                p2 = { x: slot.x - radius * 1.12, y: slot.y + radius * 0.10 };
                end = { x: slot.x - radius * 0.34, y: slot.y };
                const fromScale = Number.isFinite(transition && transition.fromScale) ? transition.fromScale : 0.23;
                scale = lerpGalaxyWarp(fromScale, 0.11, easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.28))));
                alpha = 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.82) / 0.16)));
            }

            const point = cubicGalaxyWarpPoint(start, p1, p2, end, t);
            const sampleT = Math.max(0, t - 0.02);
            const previous = cubicGalaxyWarpPoint(start, p1, p2, end, sampleT);
            const travelRot = Math.atan2(point.y - previous.y, point.x - previous.x) + Math.PI / 2;
            const fromRot = Number.isFinite(transition && transition.fromRot) ? transition.fromRot : travelRot;
            const rotBlend = phase === 'exit'
                ? easeGalaxyWarp(Math.min(1, progress / 0.26))
                : easeGalaxyWarp(Math.min(1, progress / 0.42));
            const rot = fromRot + normalizePauseCursorAngle(travelRot - fromRot) * rotBlend;
            return {
                x: point.x,
                y: point.y,
                rot,
                scale,
                alpha,
                phase,
                t,
                start,
                p1,
                p2,
                end
            };
        }

        function drawTerminalDockWake(pose, transition, metrics, color, now) {
            const alphaBase = Math.max(0, Math.min(1, pose.alpha || 0));
            if (alphaBase <= 0.01) return;

            const lastNow = Number.isFinite(transition._trailLastNow)
                ? transition._trailLastNow
                : now - 16;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
            transition._trailLastNow = now;

            const sampleT = Math.max(0, Math.min(1, (pose.t || 0) - 0.018));
            const previous = cubicGalaxyWarpPoint(pose.start, pose.p1, pose.p2, pose.end, sampleT);
            const frameSpeed = Math.hypot(pose.x - previous.x, pose.y - previous.y) / Math.max(0.001, dt);
            const speedRatio = Math.min(0.58, Math.max(0.08, frameSpeed / 420));
            const cursor = {
                x: pose.x,
                y: pose.y,
                rot: pose.rot,
                scale: pose.scale,
                speed: frameSpeed,
                dt
            };

            drawPauseMenuShipTrail(dt, alphaBase);
            emitPauseMenuShipExhaustTrail(cursor, now, speedRatio * 0.75, 0.46, GALAXY_CURSOR_TRAIL_MAX);
        }

        function drawTerminalDockGate(metrics, progress, phase, color, now) {
            const slot = metrics.slot;
            const radius = metrics.radius;
            const side = phase === 'exit' ? 1 : -1;
            const pulse = 0.5 + Math.sin(now * 0.006) * 0.5;
            const openT = phase === 'exit'
                ? easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.08) / 0.30)))
                : 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.72) / 0.22)));
            const gateX = slot.x + side * radius * 0.42;
            const gateY = slot.y;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.18 + pulse * 0.12;
            ctx.strokeStyle = colorWithAlpha(color, 0.78);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(gateX, gateY - radius * (0.36 + openT * 0.08));
            ctx.lineTo(gateX, gateY + radius * (0.36 + openT * 0.08));
            ctx.stroke();

            const arcW = radius * (0.34 + openT * 0.18);
            ctx.globalAlpha = 0.12 + openT * 0.22;
            ctx.beginPath();
            ctx.ellipse(gateX, gateY, arcW, radius * 0.31, 0, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.stroke();

            for (let i = 0; i < 6; i++) {
                const n = galaxyNoise(9401, i + Math.floor(now * 0.018));
                ctx.globalAlpha = (0.04 + openT * 0.12) * (0.55 + n * 0.45);
                ctx.fillStyle = i % 3 === 0 ? '#ffffff' : color;
                ctx.font = `bold ${6 + (i % 2) * 2}px Courier New`;
                ctx.fillText(i % 2 ? '+' : '.', gateX + side * (8 + n * radius * 0.20), gateY + (n - 0.5) * radius * 0.68);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 0;
        }

        function drawTerminalDockShip(pose, transition, color) {
            if (pose.alpha <= 0.01) return;
            const shipConfig = typeof PLAYER_SHIP_TYPES !== 'undefined'
                ? PLAYER_SHIP_TYPES[transition.shipIndex] || getSelectedShipConfig()
                : getSelectedShipConfig();
            ctx.save();
            ctx.globalAlpha = pose.alpha;
            ctx.translate(pose.x, pose.y);
            ctx.rotate(pose.rot);
            ctx.scale(pose.scale, pose.scale);
            PAUSE_CURSOR_SHIP.x = 0;
            PAUSE_CURSOR_SHIP.y = 0;
            PAUSE_CURSOR_SHIP.vx = 0;
            PAUSE_CURSOR_SHIP.vy = 0;
            PAUSE_CURSOR_SHIP.shipId = shipConfig && shipConfig.id ? shipConfig.id : 'arrowhead';
            PAUSE_CURSOR_SHIP._renderLayoutCache = null;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = shipConfig && shipConfig.previewColor ? shipConfig.previewColor : '#f6fbff';
            ctx.shadowColor = color;
            ctx.shadowBlur = glowEnabled ? 16 : 0;
            drawPlayerShip(PAUSE_CURSOR_SHIP, 'center');
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function getTerminalDockFocus(progress, phase) {
            const focusIn = phase === 'exit'
                ? 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.74) / 0.24)))
                : easeGalaxyWarp(Math.max(0, Math.min(1, progress / 0.72)));
            const peak = phase === 'exit' ? 0.095 : 0.125;
            return {
                t: focusIn,
                scale: 1 + focusIn * peak,
                dim: focusIn * (phase === 'exit' ? 0.34 : 0.42),
                bloom: focusIn * (phase === 'exit' ? 0.18 : 0.24)
            };
        }

        function drawTerminalDockFocusField(metrics, progress, phase, color, now, focus) {
            const amount = Math.max(0, Math.min(1, focus.t || 0));
            if (amount <= 0.01) return;
            const slot = metrics.slot;
            const radius = metrics.radius;
            const pulse = 0.5 + Math.sin(now * 0.0048) * 0.5;

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = colorWithAlpha('#01040b', focus.dim);
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';
            const bloomRadius = radius * (2.0 + amount * 1.85);
            const bloom = ctx.createRadialGradient(slot.x, slot.y, radius * 0.12, slot.x, slot.y, bloomRadius);
            bloom.addColorStop(0, colorWithAlpha('#ffffff', focus.bloom * 0.38));
            bloom.addColorStop(0.26, colorWithAlpha(color, focus.bloom));
            bloom.addColorStop(0.68, colorWithAlpha('#8ff7ff', focus.bloom * 0.22));
            bloom.addColorStop(1, colorWithAlpha(color, 0));
            ctx.fillStyle = bloom;
            ctx.fillRect(0, 0, width, height);

            ctx.lineCap = 'round';
            for (let i = 0; i < 12; i++) {
                const n = galaxyNoise(9701 + metrics.galaxyIndex * 13, i);
                const angle = (i / 12) * Math.PI * 2 + now * 0.00022 * (i % 2 ? -1 : 1);
                const inner = radius * (0.74 + n * 0.32 + amount * 0.12);
                const outer = inner + radius * (0.18 + amount * 0.34) * (0.45 + n);
                ctx.globalAlpha = amount * (0.026 + pulse * 0.018) * (0.55 + n * 0.45);
                ctx.strokeStyle = i % 4 === 0 ? colorWithAlpha('#ffffff', 0.38) : colorWithAlpha(color, 0.52);
                ctx.lineWidth = 0.8 + amount * 1.2 * n;
                ctx.beginPath();
                ctx.moveTo(slot.x + Math.cos(angle) * inner, slot.y + Math.sin(angle) * inner * 0.62);
                ctx.lineTo(slot.x + Math.cos(angle) * outer, slot.y + Math.sin(angle) * outer * 0.62);
                ctx.stroke();
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawTerminalDockTransition(now) {
            const transition = terminalDockTransition || {};
            const phase = transition.phase === 'exit' ? 'exit' : 'enter';
            const duration = phase === 'exit'
                ? (typeof TERMINAL_DOCK_EXIT_DURATION === 'number' ? TERMINAL_DOCK_EXIT_DURATION : 1.02)
                : (typeof TERMINAL_DOCK_ENTER_DURATION === 'number' ? TERMINAL_DOCK_ENTER_DURATION : 1.05);
            const progress = Math.max(0, Math.min(1, ((now || performance.now()) - (transition.startedAt || now || performance.now())) / 1000 / duration));
            const metrics = getTerminalDockMetrics(transition.galaxyIndex);
            const color = transition.color || (metrics.galaxy && metrics.galaxy.colors && metrics.galaxy.colors[0]) || '#8ff7ff';
            const selectedIndex = Number.isFinite(transition.galaxyIndex) ? transition.galaxyIndex : selectedGalaxyIndex;
            const focus = getTerminalDockFocus(progress, phase);

            drawGalaxySelectBaseLayerDirect(now, selectedIndex);
            drawTerminalDockFocusField(metrics, progress, phase, color, now, focus);

            const pose = getTerminalDockShipPose(progress, transition, metrics);
            ctx.save();
            ctx.translate(metrics.slot.x, metrics.slot.y);
            ctx.scale(focus.scale, focus.scale);
            ctx.translate(-metrics.slot.x, -metrics.slot.y);
            drawTerminalDockWake(pose, transition, metrics, color, now);
            drawTerminalDockShip(pose, transition, color);

            drawTerminalDockGate(metrics, progress, phase, color, now);
            drawGalaxyGlyphSprite(metrics.galaxy, metrics.slot.x, metrics.slot.y, metrics.radius, true, now, metrics.galaxyIndex);
            ctx.restore();

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.07;
            ctx.fillStyle = colorWithAlpha(color, 0.56);
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }
