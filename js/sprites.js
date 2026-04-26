        // Asset and sprite helpers. See js/README.md for load order and ownership.
        const TITLE_LOGO = [
            "  ___   ____   _____  _____  _____ ",
            " / _ \\ / ___| /  ___||_   _||_   _|",
            "/ /_\\ \\\\___ \\ | |      | |    | |  ",
            "|  _  | ___) || |___  _| |_  _| |_ ",
            "|_| |_||____/ \\____/ |_____||_____|",
            "                                   ",
            "  ___   _____  _____  _      _____  _   _  _____  _____ ",
            " / _ \\ |_   _||  _  || |    |_   _|| \\ | ||  ___|/  ___|",
            "/ /_\\ \\  | |  | |_) || |      | |  |  \\| || |__  \\ `--. ",
            "|  _  |  | |  |  _  /| |      | |  | . ` ||  __|  `--. \\",
            "| | | | _| |_ | | \\ \\| |____ _| |_ | |\\  || |___ /\\__/ /",
            "\\_| |_/ \\___/ \\_|  \\_\\\\____/ \\___/ \\_| \\_/\\____/ \\____/ "
        ];

        const NULL_PHANTOM_LEGACY_SPRITE = [
            "      ▄██████████▄      ",
            "    ▄██████████████▄    ",
            "  ▄████▀▀██████▀▀████▄  ",
            " ▀▀▀██  █▀▀██▀▀█  ██▀▀▀ ",
            "     █  █  ██  █  █     ",
            "   ▄████████████████▄   ",
            "  ████▀▀▀▀▀▀▀▀▀▀▀▀████  ",
            "  ▀████▄▄▄▄▄▄▄▄▄▄████▀  ",
            "    ▀▀████████████▀▀    "
        ];


        const GHOST_SIGNAL_LEGACY_SPRITE = [
            "      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      ",
            "    ▓▓▓▓░░░░░░░░░░░░▓▓▓▓    ",
            "  ╠▓▓▓▓░░░░░\\░░/░░░░░▓▓▓▓╣  ",
            "  ╠▓▓▓▓░░░░░◈░░◈░░░░░▓▓▓▓╣  ",
            "  ╠▓▓▓▓░░░░░░░░░░░░░░▓▓▓▓╣  ",
            "  ╠▓▓▓▓░░░░┗━━━━┛░░░░▓▓▓▓╣  ",
            "    ▓▓▓▓░░░░░░░░░░░░▓▓▓▓    ",
            "      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      "
        ];

        function getSpriteVisibleMetrics(sprite) {
            let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
            if (!sprite || sprite.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };

            for (let r = 0; r < sprite.length; r++) {
                for (let c = 0; c < sprite[r].length; c++) {
                    if (sprite[r][c] !== ' ') {
                        if (c < minX) minX = c;
                        if (c > maxX) maxX = c;
                        if (r < minY) minY = r;
                        if (r > maxY) maxY = r;
                    }
                }
            }

            if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
            return {
                minX,
                minY,
                maxX,
                maxY,
                width: maxX - minX + 1,
                height: maxY - minY + 1
            };
        }

        // Boss sprites
        const NULL_PHANTOM_SOURCE = [
            "                                   ▌",
            "                           ▄      ▐",
            "                      ▐   ▄      ▐▌                  ▄     ▐        ▄",
            "                      ▐█ █ ▐     ▌                   ▐      ▌   ▌  ▐█",
            "             ▀    ▀▄  ███▌ ▓    ▄                  ▐ ▐           ████▌",
            "                    ▀███████    ▌                   ▌▐       ▄  ▄████▀",
            "                     ▀███████▓ █                    ██        █▄██████▄",
            "              ▐     ▐▄▐██████████                   ▌█       ▄█████████",
            "                     ▀███████████▌                   ▌     ███████████     ▐",
            "                      ▄▀████████████        ▐        █▄▄▄████████████▌",
            "            ▀▄         ▀██████████████▄     ▐       ▐█████████████████      ▌",
            "             ▄▀███     ▐▀████████████████▄▄██▄▄▄▄▄██████████████████▀      █",
            "              ▀███ ▄      ▀█████████████▀  ▀   ▀████████████████▀▀       ██",
            "                ██▄██▌       ▐▀▀▀██▀▀▀      ▄▄    ▀▀████████▀▀        ▄ ▄█",
            "                 ████▌▐█        ▐▓▀       ▄████▓▄       █▀ █         ▐███▌",
            "                   ██████▀  █   ▐       ▄████████▄         █     ▄▐▌ ████▀  ▀",
            "                    █▀████▌ ██          ▀▀▀     ▀▀         ▐    ███▌███▀",
            "                      █████▐██▐ ▐█   █             ▐   ▄▄ ▄███▌▐███████",
            "                       ████████▌██  ███▌  ▄▄  ▄  ▄██  ▐██ ████▄██████▀",
            "                        ▐█▀▀███████ ████ ▐██▌▐█▌▐███ ▐███▐███████████",
            "                     ▐   ▀  ▀██████▄████ ▐█████▌████ █████████▀ ▀██ ▀",
            "                          ▐  █▌████████████████████▌████████▀▀  ▐▐",
            "                              ▓ ███ ████████████████████▀▀▀▌",
            "                                 █   ███▐█████████████▌   █",
            "                                  ▌  ▐▀  █▌▀███ ██   █   ▀",
            "                                      ▀   ▄ █▌  ▐   ▀",
            "                                            ▐"
        ];
        const NULL_PHANTOM_BODY_ALPHA = 0.94;
        const NULL_PHANTOM_GLOW_COLOR = 'rgba(255, 110, 245, 0.42)';
        const NULL_PHANTOM_FONT_SIZE = 8;
        const NULL_PHANTOM_LOOP_FRAMES = 220;
        const NULL_PHANTOM_FLOAT_BOB = 2.4;
        const NULL_PHANTOM_LAUGH_BOB = 1.45;
        const NULL_PHANTOM_SWAY_X = 1.7;
        const NULL_PHANTOM_SWAY_Y = 0.95;
        const NULL_PHANTOM_LAUGH_SPREAD = 23.5;
        const NULL_PHANTOM_JAW_DROP = 8.1;
        const NULL_PHANTOM_CHEEK_LIFT = 1.5;
        const NULL_PHANTOM_BROW_LIFT = 1.1;
        const NULL_PHANTOM_MOUTH_RAISE = 1.1;
        const NULL_PHANTOM_MOUTH_DROP_EXTRA = 10.4;
        const NULL_PHANTOM_SMILE_CORNER_LIFT = 11.2;
        const NULL_PHANTOM_SMILE_CENTER_DROP = 9.8;
        const NULL_PHANTOM_CHIN_STRETCH = 5.8;
        const NULL_PHANTOM_SMILE_OUTWARD_PULL = 9.4;
        const NULL_PHANTOM_REST_OFFSET_Y = 0.1;
        const NULL_PHANTOM_FOOTPRINT = getSpriteVisibleMetrics(NULL_PHANTOM_LEGACY_SPRITE);
        const NULL_PHANTOM_METRICS = getSpriteVisibleMetrics(NULL_PHANTOM_SOURCE);
        const NULL_PHANTOM_SCALE = Math.min(
            NULL_PHANTOM_FOOTPRINT.width / NULL_PHANTOM_METRICS.width,
            NULL_PHANTOM_FOOTPRINT.height / NULL_PHANTOM_METRICS.height
        ) * 1.18;

        function getNullPhantomBodyColor(char, alpha = 1, isIntro = false) {
            let shade = 0.72;
            if ('█▌▐▀▄'.includes(char)) shade = 1;
            else if (char === '▓') shade = 0.88;
            else if (char === '▒') shade = 0.74;
            else if (char === '░') shade = 0.56;

            const r = isIntro ? Math.round(68 + shade * 76) : Math.round(142 + shade * 100);
            const g = isIntro ? Math.round(68 + shade * 76) : Math.round(66 + shade * 78);
            const b = isIntro ? Math.round(68 + shade * 76) : 255;
            return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
        }

        function getNullPhantomRenderLayout(bossObj) {
            const isIntro = bossObj && bossObj.phase === 'INTRO';
            const cellW = Math.max(2.4, charW * NULL_PHANTOM_SCALE);
            const cellH = Math.max(2.4, charH * NULL_PHANTOM_SCALE);
            const visibleW = NULL_PHANTOM_METRICS.width * cellW;
            const visibleH = NULL_PHANTOM_METRICS.height * cellH;
            const tAngle = ((renderFrameCount % NULL_PHANTOM_LOOP_FRAMES) / NULL_PHANTOM_LOOP_FRAMES) * Math.PI * 2;
            const laughWave = Math.sin(2.45 * tAngle - 0.45);
            const laughBaseAmount = Math.pow(Math.max(0, laughWave), 0.82);
            const introLaughMix = isIntro ? 0 : 1;
            const laughAmount = laughBaseAmount * introLaughMix;
            const chuckleAmount = isIntro ? 0 : Math.sin(5.4 * tAngle - 0.18) * (0.45 + laughAmount * 0.55);
            const startX = bossObj.x - visibleW / 2 - NULL_PHANTOM_METRICS.minX * cellW;
            const startY = bossObj.y - visibleH / 2 - NULL_PHANTOM_METRICS.minY * cellH +
                (isIntro ? 0 : Math.sin(tAngle - 0.35) * NULL_PHANTOM_FLOAT_BOB) +
                laughAmount * NULL_PHANTOM_LAUGH_BOB;

            return {
                cellW,
                cellH,
                startX,
                startY,
                visibleW,
                visibleH,
                visibleLeft: startX + NULL_PHANTOM_METRICS.minX * cellW,
                visibleTop: startY + NULL_PHANTOM_METRICS.minY * cellH,
                centerCol: NULL_PHANTOM_METRICS.minX + (NULL_PHANTOM_METRICS.width - 1) / 2,
                laughAmount,
                laughWave,
                chuckleAmount,
                tAngle,
                isIntro,
                cubeScale: Math.max(0.22, Math.min(0.48, NULL_PHANTOM_SCALE * 2.02))
            };
        }

        function getNullPhantomWaveOffsets(layout, row, col) {
            if (layout.isIntro) {
                return { x: 0, y: 0 };
            }
            const rowRatio = (row - NULL_PHANTOM_METRICS.minY) / Math.max(1, NULL_PHANTOM_METRICS.height - 1);
            const fromCenter = (col - layout.centerCol) / Math.max(1, NULL_PHANTOM_METRICS.width * 0.5);
            const absCenter = Math.abs(fromCenter);
            const upperFaceInfluence = Math.max(0, Math.min(1, (0.34 - rowRatio) / 0.34));
            const cheekInfluence = Math.max(0, 1 - Math.abs(rowRatio - 0.69) / 0.14) * Math.max(0, 1 - absCenter * 0.72);
            const mouthBandInfluence = Math.max(0, 1 - Math.abs(rowRatio - 0.815) / 0.1);
            const lowerMouthInfluence = Math.max(0, 1 - Math.abs(rowRatio - 0.885) / 0.1) * Math.max(0.15, 1 - absCenter * 0.6);
            const mouthCenterInfluence = mouthBandInfluence * Math.max(0, 1 - absCenter * 2.2);
            const mouthCornerInfluence = mouthBandInfluence * Math.pow(Math.min(1, absCenter * 1.24), 0.72);
            const smileArcInfluence = mouthBandInfluence * Math.max(0, 1 - Math.abs(absCenter - 0.72) / 0.26);
            const clownSmileInfluence = lowerMouthInfluence * Math.max(0, 1 - Math.abs(absCenter - 0.78) / 0.22);
            const chinInfluence = Math.max(0, 1 - Math.abs(rowRatio - 0.94) / 0.12) * Math.max(0.3, 1 - absCenter * 0.45);
            const harmonicField =
                Math.sin(2 * layout.tAngle - row * 0.42 + col * 0.12) * 0.62 +
                Math.cos(3 * layout.tAngle - row * 0.18 - col * 0.16) * 0.46;
            const verticalField =
                Math.cos(2 * layout.tAngle - row * 0.24 + col * 0.09) * 0.48 +
                Math.sin(4 * layout.tAngle - row * 0.12 - Math.abs(fromCenter) * 2.4) * 0.34;
            const jawOpen = Math.max(0, layout.laughWave);
            const jawClose = Math.max(0, -layout.laughWave);
            const lowerFaceWobbleFade = 1 - Math.min(0.74, mouthBandInfluence * 0.58 + chinInfluence * 0.4);

            return {
                x:
                    harmonicField * NULL_PHANTOM_SWAY_X * (0.22 + rowRatio * 0.58) * lowerFaceWobbleFade +
                    fromCenter * mouthBandInfluence * layout.laughAmount * NULL_PHANTOM_LAUGH_SPREAD * (0.24 + absCenter * 0.76) +
                    fromCenter * smileArcInfluence * jawOpen * NULL_PHANTOM_SMILE_OUTWARD_PULL +
                    fromCenter * clownSmileInfluence * jawOpen * 5.2 +
                    fromCenter * mouthCornerInfluence * jawOpen * 5.4 +
                    fromCenter * cheekInfluence * layout.chuckleAmount * 0.95,
                y:
                    verticalField * NULL_PHANTOM_SWAY_Y * (0.4 + (1 - absCenter) * 0.32) * lowerFaceWobbleFade +
                    lowerMouthInfluence * layout.laughAmount * NULL_PHANTOM_JAW_DROP * (0.68 + (1 - absCenter) * 0.32) -
                    cheekInfluence * layout.laughAmount * NULL_PHANTOM_CHEEK_LIFT -
                    upperFaceInfluence * layout.laughAmount * NULL_PHANTOM_BROW_LIFT * 0.6 -
                    smileArcInfluence * jawOpen * NULL_PHANTOM_SMILE_CORNER_LIFT -
                    clownSmileInfluence * jawOpen * 4.8 -
                    mouthCenterInfluence * jawOpen * NULL_PHANTOM_MOUTH_RAISE +
                    lowerMouthInfluence * jawOpen * NULL_PHANTOM_MOUTH_DROP_EXTRA +
                    mouthCenterInfluence * jawOpen * NULL_PHANTOM_SMILE_CENTER_DROP * 1.12 +
                    chinInfluence * jawOpen * NULL_PHANTOM_CHIN_STRETCH -
                    mouthCenterInfluence * jawClose * 1.8
            };
        }

        function getNullPhantomGlyphPosition(layout, row, col) {
            const waveOffset = getNullPhantomWaveOffsets(layout, row, col);
            return {
                x: layout.startX + col * layout.cellW + waveOffset.x,
                y: layout.startY + row * layout.cellH + waveOffset.y
            };
        }

        const GHOST_SIGNAL_SOURCE = [
            "                                          ▄████",
            "                                          ▓▀ ▀█▌",
            "                                         ██   █▓▌",
            "                                        ▐▓▓░░░▓▓██",
            "                                       ▄█▓▓░░░▓▓▓▓██",
            "                                     ▄█▓▓▓▓▌▒▒▒▓▓▓▓▓██▓▄   ▄▄▀░",
            "                            ▐▒█▓▄▄███▓▓█▓█▓▒▒▒▒▓▓▓▓▓▓▓█████▓▓░",
            "                            ▐▒▓▓▓▓▓▓▓▓▓▓▓▓▓░▓▓▓▒▓▓▒▓▓▓▓▓▓▒▓▓▓▄",
            "                            ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓░▓▓▓▒▓▓▓▒▒▓▓▓▒▒▓▓▓▒▒",
            "                             ░▒▓▒▒▓▓▒▓▓▓▒▓▌▒▓▓▓▓▒▓▓▒▒▒▒▒▒▒▓▓▒░░",
            "                               ▐▒▒▒▒▒▓▒▓▓▒▒▒▓▓▓▓▒▒▓▓▒▒▒▒▒▓▓▒▒",
            "                                ▒▒▒▒▓▒▒▒▓▒▒▒▓▓▒▓▒▒▒▒▒▒▒▒▒▒▒",
            "                                ▒░▒▒▒▒▒▒▓▒▒▒▓▓▒▓▓▒▒▒▒▒▒▒▒░",
            "                                  ▒▒▒▒▒▒▓▒▒▒▓▓▒▒▓▒▒▒▒▒▒▒▒",
            "                                  ▒▒▒▒▒▒▒▒▒▒▒▓▒▒▓▒▒▒▒▒▒▒░",
            "                                  ░ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░▒",
            "                                    ░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ ░",
            "                                     ▒▒▒▒▒▒▒▒▒▒▒▒▒▒░",
            "                                    ░▒▒▒▒▒▒▒▒▒▒▒▒▒▒",
            "                                    ░▒ ▒▒▒▒▒▒▒▒▒░▒▒",
            "                                       ▒▒▒▒▒▒▒▒░ ░",
            "                                     ░ ▐▒▒▒▒▒▒",
            "                                       ▐▒▒▒▒▒░",
            "                                       ▒ ▒ ▐▒",
            "                                         ░  ▒",
            "                                            ░"
        ];
        const GHOST_SIGNAL_GLOW_COLOR = 'rgba(255, 255, 255, 0.82)';
        const GHOST_SIGNAL_VERTICAL_STRETCH = 1.08;
        const GHOST_SIGNAL_BODY_GLOW = 22;
        const GHOST_SIGNAL_FONT_SIZE = 10;
        const GHOST_SIGNAL_SWAY_X = 4.5;
        const GHOST_SIGNAL_SWAY_Y = 2.8;
        const GHOST_SIGNAL_LOOP_FRAMES = 300;
        const GHOST_SIGNAL_DRIFT_X = 34;
        const GHOST_SIGNAL_DRIFT_Y = 13;
        const GHOST_SIGNAL_FOOTPRINT = getSpriteVisibleMetrics(GHOST_SIGNAL_LEGACY_SPRITE);
        const GHOST_SIGNAL_METRICS = getSpriteVisibleMetrics(GHOST_SIGNAL_SOURCE);
        const ghostSignalBodyColorCache = new Map();
        const GHOST_SIGNAL_SCALE = Math.min(
            GHOST_SIGNAL_FOOTPRINT.width / GHOST_SIGNAL_METRICS.width,
            GHOST_SIGNAL_FOOTPRINT.height / GHOST_SIGNAL_METRICS.height
        ) * 1.68;

        function getGhostSignalBodyColor(char, alpha = 1) {
            const cachedAlpha = alpha >= 1 ? 1 : Math.round(alpha * 24) / 24;
            const cacheKey = `${char}|${cachedAlpha}`;
            const cached = ghostSignalBodyColorCache.get(cacheKey);
            if (cached) return cached;
            let shade = 0.72;
            if (char === '█') shade = 1;
            else if (char === '▓') shade = 0.9;
            else if (char === '▒') shade = 0.76;
            else if (char === '░') shade = 0.62;

            const r = Math.round(206 + shade * 42);
            const g = Math.round(224 + shade * 22);
            const b = 255;
            const color = cachedAlpha < 1 ? `rgba(${r}, ${g}, ${b}, ${cachedAlpha})` : `rgb(${r}, ${g}, ${b})`;
            ghostSignalBodyColorCache.set(cacheKey, color);
            return color;
        }

        function getGhostSignalRenderLayout(bossObj) {
            const cellW = Math.max(2.45, charW * GHOST_SIGNAL_SCALE);
            const cellH = Math.max(2.45, charH * GHOST_SIGNAL_SCALE * GHOST_SIGNAL_VERTICAL_STRETCH);
            const visibleW = GHOST_SIGNAL_METRICS.width * cellW;
            const visibleH = GHOST_SIGNAL_METRICS.height * cellH;
            const startX = bossObj.x - visibleW / 2 - GHOST_SIGNAL_METRICS.minX * cellW;
            const startY = bossObj.y - visibleH / 2 - GHOST_SIGNAL_METRICS.minY * cellH;
            const visibleLeft = startX + GHOST_SIGNAL_METRICS.minX * cellW;
            const visibleTop = startY + GHOST_SIGNAL_METRICS.minY * cellH;
            const cubeScale = Math.max(0.24, Math.min(0.54, GHOST_SIGNAL_SCALE * 1.52));
            return {
                cellW,
                cellH,
                startX,
                startY,
                visibleW,
                visibleH,
                visibleLeft,
                visibleTop,
                cubeScale,
                tAngle: ((renderFrameCount % GHOST_SIGNAL_LOOP_FRAMES) / GHOST_SIGNAL_LOOP_FRAMES) * Math.PI * 2,
                centerCol: GHOST_SIGNAL_METRICS.minX + (GHOST_SIGNAL_METRICS.width - 1) / 2
            };
        }

        function getGhostSignalWaveOffsets(layout, row, col) {
            const rowRatio = (row - GHOST_SIGNAL_METRICS.minY) / Math.max(1, GHOST_SIGNAL_METRICS.height - 1);
            const colRatio = (col - GHOST_SIGNAL_METRICS.minX) / Math.max(1, GHOST_SIGNAL_METRICS.width - 1);
            const loopNoise = Math.sin(2 * layout.tAngle - row * 0.5 + col * 0.3) * 0.6 +
                Math.cos(3 * layout.tAngle - row * 0.3 + col * 0.2) * 0.6;
            const waveNoise = Math.sin(4 * layout.tAngle - row * 0.34 - col * 0.12);
            const lateral = loopNoise * GHOST_SIGNAL_SWAY_X * (0.35 + rowRatio * 0.65);
            const vertical = waveNoise * GHOST_SIGNAL_SWAY_Y * (0.45 + (1 - Math.abs(colRatio - 0.5) * 2) * 0.55) + loopNoise * 0.9;
            return {
                x: lateral,
                y: vertical
            };
        }

        function getGhostSignalGlyphPosition(layout, row, col) {
            const waveOffset = getGhostSignalWaveOffsets(layout, row, col);
            return {
                x: layout.startX + col * layout.cellW + waveOffset.x,
                y: layout.startY + row * layout.cellH + waveOffset.y
            };
        }

        const GLITCH_SPRITE_1 = [
            "  ╬▒▓░╪  ",
            " ╫■▀▄▒▓┼ ",
            "░▓╬▒■▀╪░▓",
            " ▒▀▄▓┼░  ",
            "  ■▓▒╬   ",
            " ╪░▓■▀   "
        ];

        const GLITCH_SPRITE_2 = [
            " ╬▒▓░╪╬▒▓ ",
            "╫■▀▄▒▓┼■▀▄",
            "░▓╬▒■▀╪░▓╬",
            " ▒▀▄▓┼░▒▀▄",
            " ■▓▒╬■▓▒╬ ",
            "╪░▓■▀╪░▓■▀",
            " ╬▒▓░╪╬▒  ",
            "  ■▀▄▒▓┼  "
        ];

        const GLITCH_SPRITE_1B = [
            "  ╪▒▓░   ",
            " ╫■▀▄▒  ",
            "░▓┼▒■▀╪  ",
            "  ▀▄▓┼░  ",
            " ■▓▒╬   ",
            "  ░▓■▀  "
        ];

        const GLITCH_SPRITE_2B = [
            " ╪▒▓░╪╬▒  ",
            "╫■▀▄▒▓┼■▀▄",
            " ▓╬▒■▀╪░▓╬",
            " ▒▀▄▓┼░▒▀▄",
            " ■▓▒╬■▓▒  ",
            "╪░▓■▀╪░▓■ ",
            " ╬▒▓░╪╬▒▓ ",
            "  ■▀▄▒▓┼  "
        ];

        const FIREWALL_SPRITE = [
            "                                ▒▒                                ",
            "                                ▓▓                                ",
            "                                ▓▓▓▓                              ",
            "                                ████                              ",
            "                              ░░████                              ",
            "                              ██▓▓██                              ",
            "                        ░░  ████▓▓▓▓    ▒▒                        ",
            "                        ▓▓▒▒▓▓██▒▒▓▓  ██░░                        ",
            "                      ▓▓██████▒▒▓▓▒▒████  ▒▒                      ",
            "                      ██████▒▒▒▒▓▓▒▒██▒▒  ██                      ",
            "                      ██▓▓▓▓░░▒▒████▓▓░░▒▒██  ░░                  ",
            "                      ██▒▒▒▒░░▒▒▓▓██▓▓▓▓████▓▓░░                  ",
            "                      ██▒▒▒▒░░▒▒████▓▓██▓▓████░░                  ",
            "                      ██▒▒░░░░▒▒▓▓██▒▒██▒▒██▓▓░░                  ",
            "                  ░░  ▒▒▒▒░░░░░░▒▒██░░▒▒▒▒▓▓██                    ",
            "                    ██▓▓▓▓░░  ░░▒▒▒▒░░░░▒▒▓▓▓▓                    ",
            "                    ░░██▓▓▒▒░░  ░░░░░░░░░░▓▓░░                    ",
            "                      ░░▓▓░░░░        ░░▒▒░░                      ",
            "                          ░░▒▒░░      ░░                          "
        ];

        const VOID_ORBITER_SPRITE = [
            "  ▗▄▖  ",
            " ▝███▘ ",
            "  ▝▀▘  "
        ];

        const VOID_SENTINEL_SPRITE = [
            "   ▄█▄   ",
            " ▄█████▄ ",
            "██ ▄ ▄ ██",
            " ▀█████▀ ",
            "   ▀█▀   "
        ];

        const VOID_ANCHOR_SPRITE = [
            "   ▄██▄   ",
            " ▗██████▖ ",
            "▐██ ▓▓ ██▌",
            " ▝██████▘ ",
            "   ▀██▀   "
        ];

        const BLACK_VOID_SPRITE = [
            "      ░▓██▓░      ",
            "    ░████████░    ",
            "   ▓███    ███▓   ",
            "  ▓██   ░░   ██▓  ",
            "  ███        ███  ",
            "  ▓██   ░░   ██▓  ",
            "   ▓███    ███▓   ",
            "    ░████████░    ",
            "      ░▓██▓░      "
        ];

        const BLACK_VOID_SPRITE_ALT = [
            "      ░▓██▓░      ",
            "    ░██▓▓▓▓██░    ",
            "   ▓██   ░  ██▓   ",
            "  ▓██  ░░░░  ██▓  ",
            "  ███        ███  ",
            "  ▓██  ░░░░  ██▓  ",
            "   ▓██  ░   ██▓   ",
            "    ░██▓▓▓▓██░    ",
            "      ░▓██▓░      "
        ];

        const BATTLE_STARSHIP_SPRITE = [
            "         ▐▓                      ▓",
            "         ▓▒▄      █▓   ▐▓▄      ▓▒▌",
            "        ▐▓▓▓     ▄▓▒▄  ▓▒▓▄    ▐▓▄█",
            "        ▓▓██    ▐▓▄▄▓▌▐▌▄▄█    ▐▓██",
            "        ▓▓██     ▓▓▓▓ ▐▓▓▓▓    ▓▓██",
            "        ▓▓▓▓▌   ▐█▓█████▓██    ▓█▓▓",
            "        ▐▓█▓██▄ ████▐▓█████▌ ▄████▓",
            "        ▐▓█▓██▓█████▓▓▓█████▓▀▓███▓",
            "        ▓▓█▓▀▀▓█████▓███████▓▓▀▐██▓",
            "        ███▓▌ ▌▓████████████▌▌ ████",
            "        ▓███   ▀▐██▓▓▓▓████    ▐███",
            "        ▐▓█▓    █████▓█████▌    ▓░▓",
            "         ▀▀▀  ███████████████",
            "              ▀▀████████████▌",
            "             ▄▄██▓█▓▓▄███████▄",
            "            ██▓██▓█▓▓▓▓█████▓██▄",
            "          ▓████████▓███▓█████████",
            "         ▐▓▓▓█████▓▓▓███▓█████████",
            "        ▄█▓▓██▓▓██▓███▓█▌██████████",
            "       ▐███▓█▓▓▓▓▓▓▓▓█████████████▓█",
            "        ▓█▒▓█▌▓▓▒▓▓▓▓▄█████▓█▓█▓▓██▌",
            "         ▓▒▓██▓▓▓▓▓█▓█████▓▓▓██▓██▌",
            "          ▓▓▓████▓▓▓▓▒▓▓▓██████▓██",
            "           ▓▓▓▓██▓▓▓▓▓▓▓▓▓███▓▓██",
            "            ▀▓█▓▓▓███████▓▓▓▓██▀",
            "              ▀▓▓▓▓▓▓▓▓▓▓▓▓█▀▀",
            "                ▐  ▀▀▀▀▀▀▀ ▐"
        ];

        // Boss guardian and minion sprites
        const WRAITH_SPRITE = [
            "                      ▄▄█████▌▄",
            "                    ▓███████████▓▄",
            "                  ▐▓█████████████▓▄",
            "                 ▐▓████▀▀███▀▀█████▄",
            "                 ▐▓███   ███░  ████▌",
            "                 ▐▓███▄▄█████▄▄████▌",
            "                  ▀███████▀▀██████▓",
            "                  ▐▓█████   ▐█████▌",
            "                 ▐▓███████▄████████▌",
            "                 ▓█████████████████▓",
            "                ▓███████████████████▓░",
            "               ▓█████████████████████▓",
            "                ▀▀░ ▀▀  ▀▀ ▐▀  ▀▀  ▀▀░"
        ];

        const WRAITH_METRICS = getSpriteVisibleMetrics(WRAITH_SPRITE);
        const WRAITH_DEBRIS_COLORS = ['#9f9fa0', '#c5c6c7', '#d8d9db', '#f2f2f3', '#ffffff'];

        function getWraithFrostEmitter(enemy) {
            const sprite = enemy && Array.isArray(enemy.sprite) ? enemy.sprite : WRAITH_SPRITE;
            const metrics = sprite === WRAITH_SPRITE ? WRAITH_METRICS : getSpriteVisibleMetrics(sprite);
            const renderScale = enemy.renderScale || 1;
            const spriteWidth = sprite[0] ? sprite[0].length : 0;
            const localCenterX = ((metrics.minX + metrics.maxX) * 0.5 * charW) - (spriteWidth * charW * 0.5);
            const localTopY = metrics.minY * charH - (sprite.length * charH * 0.5);
            return {
                x: enemy.x + localCenterX * renderScale,
                y: enemy.y + (localTopY + charH * 0.2) * renderScale,
                spreadX: Math.max(8, metrics.width * charW * renderScale * 0.34)
            };
        }

        function getWraithGlyphColor(sprite, row, col) {
            const line = sprite[row] || '';
            const rowRatio = row / Math.max(1, sprite.length - 1);
            const colRatio = col / Math.max(1, line.length - 1);
            const fromCenter = Math.abs(colRatio - 0.5) * 2;
            const char = line[col];

            let value = 208;
            if (char === '█') value = 238;
            else if (char === '▓') value = 214;
            else if (char === '▌' || char === '▐') value = 196;
            else if (char === '▄' || char === '▀') value = 220;
            else if (char === '░') value = 160;

            const centerHighlight = Math.max(0, 1 - fromCenter * 1.45) * 34;
            const crownHighlight = Math.max(0, 1 - Math.abs(rowRatio - 0.28) / 0.24) * 18;
            const chinShadow = Math.max(0, (rowRatio - 0.72) / 0.28) * 16;
            const edgeShadow = fromCenter * 18;
            const coolLift = Math.max(0, 1 - fromCenter) * 4;
            const finalValue = Math.max(120, Math.min(255, Math.round(value + centerHighlight + crownHighlight - chinShadow - edgeShadow)));
            const r = Math.max(0, finalValue - 3);
            const g = Math.max(0, finalValue - 1);
            const b = Math.min(255, finalValue + coolLift);
            return `rgb(${r},${g},${b})`;
        }

        function createGhostSignalWraith(spawnX, spawnY, velocityX, hoverX) {
            return {
                x: spawnX, y: spawnY, vx: velocityX, vy: 0,
                sprite: WRAITH_SPRITE,
                debrisColors: WRAITH_DEBRIS_COLORS,
                spriteColorFn: getWraithGlyphColor,
                renderScale: 0.24,
                color: '#d8d9db',
                hp: 185, maxHp: 185,
                isWraith: true,
                explosionDebrisCap: 58,
                explosionDebrisLife: 0.85,
                explosionDebrisVelocity: 430,
                flashTimer: 0,
                hoverX,
                hoverY: spawnY,
                hoverTimer: Math.random() * Math.PI * 2,
                fireTimer: 0
            };
        }
        const FIREWALL_GUARDIAN_SPRITE = [
            "  ▲  ",
            " (█) ",
            "(███)",
            " ▀█▀ "
        ];

        function createFirewallGuardianMinion() {
            return {
                x: width * 0.5,
                y: -70,
                vx: 0,
                vy: 0,
                sprite: FIREWALL_GUARDIAN_SPRITE,
                color: '#e38914',
                hp: 260,
                maxHp: 260,
                isFlameGuardian: true,
                isBossMinion: true,
                bossMinionOwner: 'OVERHEATING FIREWALL',
                flashTimer: 0,
                onScreen: false,
                hoverX: width * 0.5,
                hoverY: height * 0.16,
                hoverTimer: Math.random() * Math.PI * 2,
                hoverAmpX: Math.min(150, width * 0.18),
                hoverAmpY: 16,
                fireTimer: -1.1,
                flameFireInterval: 2.8,
                flameShotSpeed: 235,
                disableRandomFire: true,
                debrisColors: ['#e01926', '#e38914', '#ffdd00', '#ff5500']
            };
        }

        const PRISM_CONDUIT_SPRITE = [
            "   ◢▓▓◣    ",
            "  ◢▓██▓◣   ",
            " ◢▓██◆██▓◣ ",
            "◢▓██◆◆◆██▓◣",
            " ◥▓██◆██▓◤ ",
            "  ◥▓██▓◤   ",
            "   ◥▓▓◤    "
        ];

        const PRISM_CONDUIT_COLORS = ['#ff66ff', '#66ffff', '#ffff66', '#66ff99'];

        function createPrismConduit(config = {}) {
            const hp = config.hp ?? 380;
            return {
                x: config.x ?? width * 0.5,
                y: config.y ?? -130,
                vx: 0, vy: 0,
                sprite: PRISM_CONDUIT_SPRITE,
                color: PRISM_CONDUIT_COLORS[0],
                hp,
                maxHp: hp,
                isPrismConduit: true,
                isBossMinion: !!config.isBossMinion,
                bossMinionOwner: config.bossMinionOwner || null,
                flashTimer: 0,
                onScreen: false,
                hoverX: config.hoverX ?? width * 0.5,
                hoverY: config.hoverY ?? height * 0.18,
                hoverTimer: Math.random() * Math.PI * 2,
                hoverAmpX: config.hoverAmpX ?? 120,
                hoverAmpY: config.hoverAmpY ?? 22,
                prismTimer: 0,
                prismAttackTimer: 0,
                prismAttackPattern: 0,
                prismChargeTimer: 0,
                pulseFired: false,
                fireTimer: -0.5,
                disableRandomFire: true,
                renderScale: 1.4,
                debrisColors: ['#ff66ff', '#66ffff', '#ffff66', '#66ff99', '#ffffff'],
                explosionDebrisCap: 140,
                explosionDebrisLife: 1.25,
                explosionDebrisVelocity: 740
            };
        }

        const ECLIPSE_WARDEN_SPRITE = [
            "    ╱━◊━╲    ",
            "   ╱▓███▓╲   ",
            "  ╱▓█████▓╲  ",
            " ▓███◉◉◉███▓ ",
            "▓██████████▓ ",
            " ▓███◉◉◉███▓ ",
            "  ╲▓█████▓╱  ",
            "   ╲▓███▓╱   ",
            "    ╲━◊━╱    "
        ];

        // Normal enemy sprites and visual helpers
        const ENEMY_SHIP_FOOTPRINTS = {
            base: [
                " ▼ ▼ ",
                "  ■  "
            ],
            armored: [
                " ▼ ▼ ",
                " ■■ ",
                "  ■  "
            ],
            elite: [
                "▼ ▼ ▼",
                " ■■■ ",
                "  ■  "
            ]
        };

        const ENEMY_SHIP_VISUAL_PROFILES = {
            base: { tier: 1, bodySize: 34, thrusterSize: 18, spread: 9.5, thrusterY: -8.5, bodyY: 4, glowBlur: 4.6 },
            armored: { tier: 2, bodySize: 37, thrusterSize: 19, spread: 10.5, thrusterY: -9.5, bodyY: 4.5, glowBlur: 5.1 },
            elite: { tier: 3, bodySize: 40, thrusterSize: 20, spread: 11.5, thrusterY: -10.5, bodyY: 5, glowBlur: 5.6 }
        };

        const enemyShipColorCache = {};

        function parseHexColor(color) {
            if (typeof color !== 'string' || !color.startsWith('#')) return null;
            const hex = color.slice(1);
            if (hex.length !== 6) return null;
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16)
            };
        }

        function toRgbColor(rgb) {
            return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
        }

        function desaturateEnemyShipColor(color, amount = 0.22) {
            const key = `${color}|${amount}`;
            if (enemyShipColorCache[key]) return enemyShipColorCache[key];
            const rgb = parseHexColor(color);
            if (!rgb) return color;
            const gray = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
            const result = toRgbColor({
                r: rgb.r + (gray - rgb.r) * amount,
                g: rgb.g + (gray - rgb.g) * amount,
                b: rgb.b + (gray - rgb.b) * amount
            });
            enemyShipColorCache[key] = result;
            return result;
        }

        function tintEnemyShipColor(color, target, amount) {
            const key = `${color}|${target}|${amount}`;
            if (enemyShipColorCache[key]) return enemyShipColorCache[key];
            const sourceRgb = parseHexColor(color);
            const targetRgb = parseHexColor(target);
            if (!sourceRgb || !targetRgb) return color;
            const result = toRgbColor({
                r: sourceRgb.r + (targetRgb.r - sourceRgb.r) * amount,
                g: sourceRgb.g + (targetRgb.g - sourceRgb.g) * amount,
                b: sourceRgb.b + (targetRgb.b - sourceRgb.b) * amount
            });
            enemyShipColorCache[key] = result;
            return result;
        }

        function configureEnemyShipVisual(enemy, kind = 'base', options = {}) {
            if (!enemy) return enemy;
            const profile = ENEMY_SHIP_VISUAL_PROFILES[kind] || ENEMY_SHIP_VISUAL_PROFILES.base;
            const sourceColor = options.color || enemy.color || '#ff00ff';
            const bodyColor = desaturateEnemyShipColor(sourceColor);
            enemy.enemyShipSprite = true;
            enemy.enemyShipKind = ENEMY_SHIP_VISUAL_PROFILES[kind] ? kind : 'base';
            enemy.enemyShipTier = options.tier || profile.tier;
            enemy.enemyShipVisualScale = options.visualScale || 1;
            enemy.enemyShipBodyColor = bodyColor;
            enemy.enemyShipThrusterColor = tintEnemyShipColor(sourceColor, '#222222', 0.28);
            enemy.enemyShipHighlightColor = tintEnemyShipColor(sourceColor, '#ffffff', 0.34);
            enemy.enemyShipGlowColor = bodyColor;
            enemy.sprite = ENEMY_SHIP_FOOTPRINTS[enemy.enemyShipKind] || ENEMY_SHIP_FOOTPRINTS.base;
            enemy.debrisColors = [
                enemy.enemyShipBodyColor,
                enemy.enemyShipThrusterColor,
                enemy.enemyShipHighlightColor
            ];
            return enemy;
        }

        function drawEnemyShipGlyph(char, x, y, fontSize, color, rotation = 0, alpha = 1, glowColor = color, glowBlur = 0) {
            ctx.save();
            ctx.translate(snapSpriteCoord(x), snapSpriteCoord(y));
            if (rotation) ctx.rotate(rotation);
            ctx.globalAlpha *= alpha;
            ctx.fillStyle = color;
            ctx.font = `bold ${fontSize}px Courier New`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (glowEnabled && glowBlur > 0) {
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = glowBlur;
                ctx.globalAlpha *= 0.82;
                ctx.fillText(char, 0, 0);
                ctx.shadowBlur = 0;
                ctx.globalAlpha /= 0.82;
            }
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }

        function drawEnemyShipSprite(enemy, flashColor = null) {
            const profile = ENEMY_SHIP_VISUAL_PROFILES[enemy.enemyShipKind] || ENEMY_SHIP_VISUAL_PROFILES.base;
            const visualScale = Math.max(0.85, Math.min(1.24, enemy.enemyShipVisualScale || 1));
            const bodySize = Math.round(profile.bodySize * visualScale);
            const thrusterSize = Math.round(profile.thrusterSize * visualScale);
            const spread = profile.spread * visualScale;
            const x = enemy.x;
            const y = enemy.y;
            const bodyColor = flashColor || enemy.enemyShipBodyColor || desaturateEnemyShipColor(enemy.color || '#ff00ff');
            const thrusterColor = flashColor || enemy.enemyShipThrusterColor || bodyColor;
            const highlightColor = flashColor || enemy.enemyShipHighlightColor || bodyColor;
            const glowColor = flashColor || enemy.enemyShipGlowColor || bodyColor;
            const glowBlur = glowEnabled ? profile.glowBlur * visualScale : 0;
            const thrusterOffsets = profile.tier >= 3 ? [-spread, 0, spread] : [-spread, spread];

            for (let i = 0; i < thrusterOffsets.length; i++) {
                const offset = thrusterOffsets[i];
                const rotation = offset === 0 ? 0 : offset < 0 ? -0.06 : 0.06;
                drawEnemyShipGlyph('▼', x + offset, y + profile.thrusterY * visualScale, thrusterSize, thrusterColor, rotation, 0.9, glowColor, glowBlur * 0.72);
            }

            drawEnemyShipGlyph('■', x + 1.2 * visualScale, y + (profile.bodyY + 1.5) * visualScale, bodySize, thrusterColor, 0, 0.46, glowColor, glowBlur * 0.35);
            drawEnemyShipGlyph('■', x, y + profile.bodyY * visualScale, bodySize, bodyColor, 0, 1, glowColor, glowBlur * 0.78);

            if (profile.tier >= 2) {
                const armorSize = Math.round(bodySize * 0.42);
                drawEnemyShipGlyph('■', x - 9.5 * visualScale, y + (profile.bodyY + 1.5) * visualScale, armorSize, bodyColor, 0, 0.9, glowColor, glowBlur * 0.48);
                drawEnemyShipGlyph('■', x + 9.5 * visualScale, y + (profile.bodyY + 1.5) * visualScale, armorSize, bodyColor, 0, 0.9, glowColor, glowBlur * 0.48);
                drawEnemyShipGlyph('●', x, y + (profile.bodyY + 0.5) * visualScale, Math.round(bodySize * 0.34), highlightColor, 0, 0.74, glowColor, glowBlur * 0.5);
            } else {
                drawEnemyShipGlyph('▪', x - 3 * visualScale, y + (profile.bodyY - 2) * visualScale, Math.round(bodySize * 0.42), highlightColor, 0, 0.62, glowColor, glowBlur * 0.34);
            }

            if (profile.tier >= 3) {
                const accentSize = Math.round(bodySize * 0.32);
                drawEnemyShipGlyph('◆', x, y + (profile.bodyY + 8) * visualScale, accentSize, thrusterColor, 0, 0.72, glowColor, glowBlur * 0.42);
                drawEnemyShipGlyph('▲', x - 13 * visualScale, y + (profile.bodyY - 3) * visualScale, Math.round(bodySize * 0.24), highlightColor, -0.12, 0.62, glowColor, glowBlur * 0.34);
                drawEnemyShipGlyph('▲', x + 13 * visualScale, y + (profile.bodyY - 3) * visualScale, Math.round(bodySize * 0.24), highlightColor, 0.12, 0.62, glowColor, glowBlur * 0.34);
            }
        }

        function drawRisingStarThruster(enemy, renderNow, alpha = 1) {
            const visualScale = Math.max(0.85, Math.min(1.24, enemy.enemyShipVisualScale || 1));
            const pulse = 0.55 + Math.sin(renderNow * 0.018 + (enemy.risePhase || 0)) * 0.18;
            const riseGlow = 0.3 + (enemy.risingProgress || 0) * 0.7;
            const flameAlpha = Math.max(0, Math.min(0.58, alpha * pulse * riseGlow));
            if (flameAlpha <= 0.02) return;

            ctx.save();
            ctx.globalAlpha *= flameAlpha;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.round(10 * visualScale)}px Courier New`;
            if (glowEnabled) {
                ctx.shadowColor = '#ffd27a';
                ctx.shadowBlur = 6 * visualScale;
            }
            const y = enemy.y + 21 * visualScale;
            ctx.fillStyle = '#ffd27a';
            ctx.fillText('|', enemy.x - 5 * visualScale, y);
            ctx.fillText('|', enemy.x + 5 * visualScale, y);
            ctx.fillStyle = '#ff7b5c';
            ctx.fillText('.', enemy.x, y + 5 * visualScale);
            ctx.restore();
            ctx.shadowBlur = 0;
        }

        const FLYBY_SPRITES = [
            [
                "  ▄█▄  ",
                " ▟███▙ ",
                "  ▀█▀  "
            ],
            [
                "  ▄██▄  ",
                " ▟████▙ ",
                "  ▀██▀  "
            ],
            [
                " ▄▄██▄▄ ",
                "▟██████▙",
                " ▀▀██▀▀ "
            ],
            [
                " ▄▄████▄▄ ",
                "▟████████▙",
                " ▀▀████▀▀ "
            ]
        ];

        function buildFlyByShotThresholdsForTier(tier) {
            if (tier >= 4) return [0.42, 0.66];
            if (tier >= 3) return [0.5];
            return [];
        }

        function getFlyByConfigForTier(tier) {
            if (tier === 1) return { sprite: FLYBY_SPRITES[0], color: '#ffe66d', hp: 40, count: 1, speed: 0.855, damage: 10, scale: 1.55, shotThresholds: [] };
            if (tier === 2) return { sprite: FLYBY_SPRITES[1], color: '#ffb36a', hp: 55, count: 2, speed: 0.945, damage: 12, scale: 1.55, shotThresholds: [] };
            if (tier === 3) return { sprite: FLYBY_SPRITES[2], color: '#ff7be3', hp: 60, count: 2, speed: 1.026, damage: 14, scale: 1.55, shotThresholds: buildFlyByShotThresholdsForTier(tier) };
            return { sprite: FLYBY_SPRITES[3], color: '#ff5f72', hp: 70, count: 3, speed: 1.098, damage: 16, scale: 1.55, shotThresholds: buildFlyByShotThresholdsForTier(tier) };
        }

        function getScoutFlyByConfigForTier(tier) {
            const base = getFlyByConfigForTier(tier);
            return {
                sprite: FLYBY_SPRITES[0],
                color: '#cfd4dc',
                hp: Math.max(20, base.hp - 20),
                count: base.count,
                speed: base.speed * 1.2,
                damage: base.damage,
                scale: 1.02,
                shotThresholds: [],
                collisionX: 24,
                collisionY: 18,
                isScout: true
            };
        }

        function createHealthDrop(x, y, healFraction = 0.10, boxSize = 28) {
            return {
                x,
                y,
                vx: 0,
                vy: 36,
                isHealth: true,
                healFraction,
                boxSize,
                boxColor: '#d11f34',
                crossColor: '#ffffff'
            };
        }
