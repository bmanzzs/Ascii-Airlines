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
        const GHOST_SIGNAL_SCALE = Math.min(
            GHOST_SIGNAL_FOOTPRINT.width / GHOST_SIGNAL_METRICS.width,
            GHOST_SIGNAL_FOOTPRINT.height / GHOST_SIGNAL_METRICS.height
        ) * 1.68;

        function getGhostSignalBodyColor(char, alpha = 1) {
            let shade = 0.72;
            if (char === '█') shade = 1;
            else if (char === '▓') shade = 0.9;
            else if (char === '▒') shade = 0.76;
            else if (char === '░') shade = 0.62;

            const r = Math.round(206 + shade * 42);
            const g = Math.round(224 + shade * 22);
            const b = 255;
            return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
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
    if (tier === 1) return { sprite: FLYBY_SPRITES[0], color: '#ffe66d', hp: 50, count: 1, speed: 0.95, damage: 10, scale: 1.55, shotThresholds: [] };
    if (tier === 2) return { sprite: FLYBY_SPRITES[1], color: '#ffb36a', hp: 65, count: 2, speed: 1.05, damage: 12, scale: 1.55, shotThresholds: [] };
    if (tier === 3) return { sprite: FLYBY_SPRITES[2], color: '#ff7be3', hp: 80, count: 2, speed: 1.14, damage: 14, scale: 1.55, shotThresholds: buildFlyByShotThresholdsForTier(tier) };
    return { sprite: FLYBY_SPRITES[3], color: '#ff5f72', hp: 100, count: 3, speed: 1.22, damage: 16, scale: 1.55, shotThresholds: buildFlyByShotThresholdsForTier(tier) };
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

        const WRAITH_DEBRIS_COLORS = ['#9f9fa0', '#c5c6c7', '#d8d9db', '#f2f2f3', '#ffffff'];

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
                flashTimer: 0,
                hoverX,
                hoverY: spawnY,
                hoverTimer: Math.random() * Math.PI * 2,
                fireTimer: 0
            };
        }

