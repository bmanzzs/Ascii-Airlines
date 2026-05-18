        // Galaxy select map, destination sprites, cursor, intro, and warp rendering.
        let galaxyCtx = ctx;
        const GALAXY_SELECT_STAR_GLYPHS = ['.', "'", '·', '∙'];
        const GALAXY_SELECT_BG_STARS = Array.from({ length: 286 }, (_, i) => {
            const a = Math.sin((i + 1) * 12.9898) * 43758.5453;
            const b = Math.sin((i + 1) * 78.233) * 24634.6345;
            const c = Math.sin((i + 1) * 39.425) * 12645.3452;
            const d = Math.sin((i + 1) * 91.731) * 9152.7345;
            const e = Math.sin((i + 1) * 18.519) * 5317.719;
            const brightness = e - Math.floor(e);
            return {
                x: a - Math.floor(a),
                y: b - Math.floor(b),
                size: 5 + Math.floor((c - Math.floor(c)) * 8),
                alpha: 0.14 + brightness * 0.44,
                phase: (d - Math.floor(d)) * Math.PI * 2,
                speed: 0.00062 + brightness * 0.0013,
                glyph: GALAXY_SELECT_STAR_GLYPHS[i % GALAXY_SELECT_STAR_GLYPHS.length],
                font: `bold ${5 + Math.floor((c - Math.floor(c)) * 8)}px Courier New`,
                bright: brightness > 0.88
            };
        });

        const GALAXY_SELECT_ASTEROIDS = Array.from({ length: 82 }, (_, i) => {
            const a = galaxyNoise(701, i);
            const b = galaxyNoise(709, i);
            const c = galaxyNoise(719, i);
            return {
                x: a,
                lane: b,
                size: 5 + Math.floor(c * 8),
                alpha: 0.08 + galaxyNoise(727, i) * 0.18,
                speed: 0.010 + galaxyNoise(733, i) * 0.018,
                glyph: c > 0.74 ? 'o' : (c > 0.48 ? '·' : '.')
            };
        });

        const GALAXY_SELECT_DATA_BUS_GLYPHS = ['01', '10', '[]', '::', '==', '|', '<>', '0x'];
        const GALAXY_SELECT_DATA_BUS_PACKETS = Array.from({ length: 28 }, (_, i) => ({
            x: galaxyNoise(1201, i),
            lane: galaxyNoise(1213, i),
            speed: 0.018 + galaxyNoise(1223, i) * 0.032,
            alpha: 0.08 + galaxyNoise(1231, i) * 0.18,
            glyph: GALAXY_SELECT_DATA_BUS_GLYPHS[i % GALAXY_SELECT_DATA_BUS_GLYPHS.length],
            phase: galaxyNoise(1249, i) * Math.PI * 2
        }));

        const GALAXY_SELECT_CIRCUIT_TRACES = Array.from({ length: 18 }, (_, i) => {
            const x = 0.08 + galaxyNoise(1301, i) * 0.84;
            const y = 0.15 + galaxyNoise(1319, i) * 0.66;
            const lengthA = (galaxyNoise(1337, i) - 0.5) * 0.16;
            const lengthB = (galaxyNoise(1361, i) - 0.5) * 0.12;
            return {
                x,
                y,
                horizontalFirst: galaxyNoise(1327, i) > 0.5,
                a: Math.abs(lengthA) < 0.045 ? Math.sign(lengthA || 1) * 0.07 : lengthA,
                b: Math.abs(lengthB) < 0.036 ? Math.sign(lengthB || 1) * 0.055 : lengthB,
                alpha: 0.035 + galaxyNoise(1381, i) * 0.055,
                phase: galaxyNoise(1399, i) * Math.PI * 2,
                color: galaxyNoise(1409, i) > 0.52 ? '#4fb6ff' : '#38d86f'
            };
        });

        const GALAXY_SELECT_HEX_FRAGMENTS = Array.from({ length: 16 }, (_, i) => ({
            x: 0.08 + galaxyNoise(1423, i) * 0.84,
            y: 0.14 + galaxyNoise(1439, i) * 0.68,
            size: 9 + galaxyNoise(1451, i) * 18,
            alpha: 0.018 + galaxyNoise(1459, i) * 0.036,
            phase: galaxyNoise(1471, i) * Math.PI * 2,
            color: galaxyNoise(1481, i) > 0.55 ? '#6aa8ff' : '#9bffcf'
        }));

        const GALAXY_SELECT_MATH_MARKS = ['0x1F', 'CRC', 'FFT', 'LAMBDA', 'SIGMA', 'theta', 'x/y', 'A*', 'mod', 'bus', 'ptr', 'clk'];
        const GALAXY_SELECT_MATH_OVERLAYS = Array.from({ length: 34 }, (_, i) => ({
            x: galaxyNoise(1501, i),
            y: galaxyNoise(1511, i),
            text: GALAXY_SELECT_MATH_MARKS[i % GALAXY_SELECT_MATH_MARKS.length],
            alpha: 0.035 + galaxyNoise(1523, i) * 0.055,
            speed: 0.000018 + galaxyNoise(1531, i) * 0.000034,
            phase: galaxyNoise(1543, i) * Math.PI * 2,
            fontSize: 7 + Math.floor(galaxyNoise(1553, i) * 4),
            color: galaxyNoise(1567, i) > 0.5 ? '#8db7ff' : '#8ff7ff'
        }));

        const GALAXY_SELECT_LOCK_MESSAGES = ['ACCESS DENIED', 'CHECKSUM FAIL', 'PERMISSION 000', 'ROUTE SEALED'];
        const GALAXY_SELECT_MAP_VERTICAL_LIFT = 0.042;
        const GALAXY_SELECT_TITLE_Y = 0.072;
        const GALAXY_SELECT_SUBTITLE_Y = 0.108;
        const GALAXY_DOSSIER_STAT_LABELS = Object.freeze([
            { key: 'flux', label: 'VELOCITY' },
            { key: 'entropy', label: 'COMPLEXITY' },
            { key: 'density', label: 'HOSTILE DENSITY' },
            { key: 'shear', label: 'BULLET DENSITY' }
        ]);
        const GALAXY_DOSSIER_STATS = Object.freeze({
            'neon-rift': { flux: 62, entropy: 28, density: 54, shear: 56, profile: 'ROUTE BALLISTICS' },
            'void-circuit': { flux: 38, entropy: 70, density: 52, shear: 40, profile: 'ROOM GRAPH SIGNAL' },
            'rose-quasar': { flux: 46, entropy: 78, density: 34, shear: 42, profile: 'RECURSIVE LOCK' },
            'amber-halo': { flux: 42, entropy: 56, density: 54, shear: 48, profile: 'THERMAL KERNEL' },
            'glass-nebula': { flux: 52, entropy: 74, density: 34, shear: 40, profile: 'DIMENSIONAL MIRAGE' },
            'red-dwarf': { flux: 66, entropy: 36, density: 50, shear: 48, profile: 'VECTOR SCROLL' },
            'prism-array': { flux: 42, entropy: 28, density: 68, shear: 62, profile: 'SURVIVAL PRESSURE' },
            'vector-terminal': { flux: 0, entropy: 0, density: 0, shear: 0, profile: 'FLEET DOCK' }
        });
        const galaxyDossierStatState = {
            galaxyId: '',
            lastNow: 0,
            scrambleUntil: 0,
            scrambleSeed: 0,
            values: { flux: 0, entropy: 0, density: 0, shear: 0 },
            targets: { flux: 0, entropy: 0, density: 0, shear: 0 }
        };
        const galaxyDossierLayerState = {
            promptY: 0
        };
        const GALAXY_SELECT_DEFAULT_LAYOUT = [
            { x: 0.448, y: 0.467, scale: 1.04, axis: -0.535, tilt: 0.46, spinDir: 1, spinSpeed: 0.96, cursorAngle: -0.72 },
            { x: 0.528, y: 0.259, scale: 1.02, axis: 0.895, tilt: 0.36, spinDir: -1, spinSpeed: 1.14, cursorAngle: 0.58 },
            { x: 0.791, y: 0.364, scale: 1.02, axis: -0.105, tilt: 0.57, spinDir: 1, spinSpeed: 0.82, cursorAngle: 0.48 },
            { x: 0.506, y: 0.7, scale: 1.08, axis: 0.32, tilt: 0.36, spinDir: -1, spinSpeed: 1.02, cursorAngle: 2.38 },
            { x: 0.823, y: 0.692, scale: 1.37, axis: -1.02, tilt: 0.4, spinDir: 1, spinSpeed: 0.78, cursorAngle: 1.64 },
            { x: 0.632, y: 0.54, scale: 0.88, axis: 0.3, tilt: 0.6, spinDir: -1, spinSpeed: 1.22, cursorAngle: 0.96 },
            { x: 0.215, y: 0.328, scale: 1.12, axis: 1.04, tilt: 0.72, spinDir: 1, spinSpeed: 1.42, cursorAngle: 2.36, prism: true },
            { x: 0.168, y: 0.626, scale: 0.7, axis: 0.005, tilt: 0.42, spinDir: -1, spinSpeed: 0.88, cursorAngle: 3.142, hub: true }
        ];
        const GALAXY_SELECT_LAYOUT = GALAXY_SELECT_DEFAULT_LAYOUT.map(profile => ({ ...profile }));
        const GALAXY_LAYOUT_STORAGE_KEY = 'ascii_galaxy_select_layout_v2';
        const GALAXY_LAYOUT_STORAGE_SCHEMA_VERSION = 2;
        const GALAXY_LAYOUT_DEFAULT_VERSION = '2026-05-13-galaxy-select-layout-2';
        const GALAXY_LAYOUT_LEGACY_STORAGE_KEYS = ['ascii_galaxy_select_layout_v1'];
        let galaxyLayoutEditMode = false;
        let galaxyLayoutHoverIndex = -1;
        let galaxyLayoutDragState = {
            active: false,
            index: -1,
            offsetX: 0,
            offsetY: 0
        };
        const GALAXY_SELECT_CURSOR_RANDOM_CANDIDATES = 12;
        const GALAXY_SELECT_CURSOR_REST_BASE_OFFSET = 14;
        const GALAXY_SELECT_CURSOR_REST_RANDOM_OFFSET = 10;
        const GALAXY_SELECT_CURSOR_APPROACH_BASE_OFFSET = 34;
        const GALAXY_SELECT_CURSOR_APPROACH_RANDOM_OFFSET = 20;
        const GALAXY_WARP_STREAK_COUNT = 34;
        const GALAXY_WARP_HANDOFF_STREAK_COUNT = 16;
        const GALAXY_WARP_FOCUSED_DETAIL = 1;
        const GALAXY_WARP_FOCUSED_FONT_SCALE = 1;
        const GALAXY_WARP_SPRITE_CACHE_FPS = 72;
        const GALAXY_CURSOR_TRAIL_MAX = 44;
        let galaxySelectCursorRestPose = {
            index: -1,
            token: 0,
            angle: 0,
            distanceNoise: 0,
            approachNoise: 0,
            bendNoise: 0,
            scaleNoise: 0
        };
        const GALAXY_SPRITE_POINT_CACHE = new Map();
        const galaxySpriteDrawScratch = [];
        const galaxySelectBgGradientCache = {
            width: 0,
            height: 0,
            gradient: null
        };
        const galaxySelectBackgroundFrameCache = {
            width: 0,
            height: 0,
            bucket: -1,
            canvas: null
        };
        const galaxyWarpMenuSnapshotCache = {
            width: 0,
            height: 0,
            selectedIndex: -1,
            shipKey: '',
            stamp: 0,
            canvas: null
        };
        const galaxyWarpExactGlyphLayerCache = {
            width: 0,
            height: 0,
            canvas: null,
            drawKey: '',
            drawn: false
        };
        const GALAXY_SELECT_BACKGROUND_CACHE_FPS = 36;
        const GALAXY_SELECT_SPRITE_CACHE_FPS_SELECTED = 54;
        const GALAXY_SELECT_SPRITE_CACHE_FPS_IDLE = 36;
        const GALAXY_SELECT_SPRITE_CACHE_FPS_GLYPH_HEAVY_SELECTED = 48;
        const GALAXY_SELECT_SPRITE_CACHE_FPS_GLYPH_HEAVY_IDLE = 32;
        const GALAXY_SELECT_SPRITE_CACHE_MAX = 96;
        const GALAXY_SELECT_INTRO_REVEAL_DURATION = 860;
        const GALAXY_SELECT_INTRO_CURSOR_START_MARGIN = 56;
        const PRISM_ARRAY_ANIMATION_SPEED_SCALE = 0.5;
        const PRISM_ARRAY_OUTER_RING_DENSITY_SCALE = 1;
        const PRISM_ARRAY_BODY_CLUSTER_INNER_RADIUS = 0.16;
        const PRISM_ARRAY_BODY_CLUSTER_SPAN = 0.68;
        const PRISM_ARRAY_OUTER_GLYPH_CACHE_MAX = 160;
        const galaxySelectSpriteFrameCache = new Map();
        const prismArrayOuterGlyphCache = new Map();
        const galaxySelectIntroContentLayer = {
            width: 0,
            height: 0,
            canvas: null,
            ctx: null
        };
        let galaxySelectIntroRevealStart = null;
        let galaxySelectIntroRevealComplete = false;
        let galaxySelectIntroCursorPrimed = false;
        const TENSOR_MIRAGE_FIELD_GLYPHS = [
            '\u2297', '\u03BB', '\u2207', '\u2202', '\u03A3', '\u0394', '\u03C0', '\u00D7',
            'x', 'y', 'z', 'w', 'i', 'j', 'k', 'T', 'M', '[]', '<>', '::', '//', 'x/y'
        ];
        const MATRIX_NEBULA_KATAKANA_GLYPHS = [
            '\uFF66', '\uFF67', '\uFF68', '\uFF69', '\uFF6A', '\uFF6B', '\uFF6C', '\uFF6D',
            '\uFF6E', '\uFF6F', '\uFF70', '\uFF71', '\uFF72', '\uFF73', '\uFF74', '\uFF75',
            '\uFF76', '\uFF77', '\uFF78', '\uFF79', '\uFF7A', '\uFF7B', '\uFF7C', '\uFF7D',
            '\uFF7E', '\uFF7F', '\uFF80', '\uFF81', '\uFF82', '\uFF83', '\uFF84', '\uFF85',
            '\uFF86', '\uFF87', '\uFF88', '\uFF89', '\uFF8A', '\uFF8B', '\uFF8C', '\uFF8D',
            '\uFF8E', '\uFF8F', '\uFF90', '\uFF91', '\uFF92', '\uFF93', '\uFF94', '\uFF95',
            '\uFF96', '\uFF97', '\uFF98', '\uFF99', '\uFF9A', '\uFF9B', '\uFF9C', '\uFF9D'
        ];
        const MATRIX_NEBULA_LATIN_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const MATRIX_NEBULA_NUMERIC_GLYPHS = '0123456789'.split('');
        const MATRIX_NEBULA_SYMBOL_GLYPHS = ['+', '-', '*', '/', '\\', '=', '<', '>', ':', ';', '.', '|'];
        const MATRIX_NEBULA_RAIN_GLYPHS = [
            ...MATRIX_NEBULA_KATAKANA_GLYPHS,
            ...MATRIX_NEBULA_KATAKANA_GLYPHS,
            ...MATRIX_NEBULA_LATIN_GLYPHS,
            ...MATRIX_NEBULA_NUMERIC_GLYPHS,
            ...MATRIX_NEBULA_SYMBOL_GLYPHS
        ];
        const galaxySelectHighlightState = new Map();
        const galaxySpriteBloomScratch = {
            width: 0,
            height: 0,
            canvas: null,
            ctx: null
        };

        function invalidateGraphicsRenderCaches() {
            pauseGlowTextCache.clear();
            GALAXY_SPRITE_POINT_CACHE.clear();
            galaxySelectSpriteFrameCache.clear();
            prismArrayOuterGlyphCache.clear();
            galaxySelectIntroContentLayer.width = 0;
            galaxySelectIntroContentLayer.height = 0;
            galaxySelectIntroContentLayer.canvas = null;
            galaxySelectIntroContentLayer.ctx = null;
            galaxySelectBackgroundFrameCache.bucket = -1;
            galaxySelectBackgroundFrameCache.canvas = null;
            pauseMenuBackdropGradientCache.gradient = null;
            if (typeof resetMusicVisualizerRenderCaches === 'function') resetMusicVisualizerRenderCaches();
            galaxyWarpMenuSnapshotCache.canvas = null;
            galaxyWarpMenuSnapshotCache.stamp = 0;
            galaxyWarpExactGlyphLayerCache.drawKey = '';
            galaxyWarpExactGlyphLayerCache.drawn = false;
            galaxySpriteBloomScratch.width = 0;
            galaxySpriteBloomScratch.height = 0;
            galaxySpriteBloomScratch.canvas = null;
            galaxySpriteBloomScratch.ctx = null;
        }

        function galaxyNoise(seed, n) {
            const v = Math.sin((seed + 1) * 127.1 + n * 311.7) * 43758.5453123;
            return v - Math.floor(v);
        }

        function clampGalaxySelectHighlight(value) {
            return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
        }

        function easeGalaxySelectHighlight(value) {
            const t = clampGalaxySelectHighlight(value);
            return 1 - Math.pow(1 - t, 3);
        }

        function getGalaxyOptionHighlightAmount(options, selected) {
            return clampGalaxySelectHighlight(
                options && Number.isFinite(options.highlightAmount)
                    ? options.highlightAmount
                    : (selected ? 1 : 0)
            );
        }

        function getGalaxySelectHighlightAmount(index, selected, now) {
            const target = selected ? 1 : 0;
            let state = galaxySelectHighlightState.get(index);
            if (!state) {
                state = { value: target, lastNow: now || performance.now() };
                galaxySelectHighlightState.set(index, state);
                return easeGalaxySelectHighlight(state.value);
            }
            const frameNow = Number.isFinite(now) ? now : performance.now();
            const dt = Math.max(0, Math.min(0.05, (frameNow - state.lastNow) / 1000));
            const speed = target > state.value ? 16 : 11;
            const step = 1 - Math.exp(-speed * dt);
            state.value += (target - state.value) * step;
            if (Math.abs(target - state.value) < 0.003) state.value = target;
            state.lastNow = frameNow;
            return easeGalaxySelectHighlight(state.value);
        }

        function getGalaxySelectHighlightPulse(index, now, highlightAmount) {
            const highlight = clampGalaxySelectHighlight(highlightAmount);
            if (highlight <= 0.01) return 0;
            return highlight * (0.5 + Math.sin(now * 0.0028 + index * 0.83) * 0.5);
        }

        function clampGalaxyLayoutCoord(value, min, max) {
            const numeric = Number(value);
            if (!Number.isFinite(numeric)) return min;
            return Math.max(min, Math.min(max, numeric));
        }

        function clampGalaxyLayoutScale(value) {
            return clampGalaxyLayoutCoord(value, 0.52, 1.58);
        }

        function wrapGalaxyLayoutAxis(value) {
            let numeric = Number(value);
            if (!Number.isFinite(numeric)) return 0;
            while (numeric > Math.PI) numeric -= Math.PI * 2;
            while (numeric < -Math.PI) numeric += Math.PI * 2;
            return numeric;
        }

        function applyGalaxySelectLayoutPositions(positions) {
            if (!Array.isArray(positions)) return false;
            let applied = false;
            const count = Math.min(positions.length, GALAXY_SELECT_LAYOUT.length);
            for (let i = 0; i < count; i++) {
                const pos = positions[i];
                if (!pos || !Number.isFinite(Number(pos.x)) || !Number.isFinite(Number(pos.y))) continue;
                GALAXY_SELECT_LAYOUT[i].x = clampGalaxyLayoutCoord(pos.x, 0.07, 0.93);
                GALAXY_SELECT_LAYOUT[i].y = clampGalaxyLayoutCoord(pos.y, 0.16, 0.80);
                if (Number.isFinite(Number(pos.scale))) GALAXY_SELECT_LAYOUT[i].scale = clampGalaxyLayoutScale(pos.scale);
                if (Number.isFinite(Number(pos.axis))) GALAXY_SELECT_LAYOUT[i].axis = wrapGalaxyLayoutAxis(pos.axis);
                applied = true;
            }
            return applied;
        }

        function clearLegacyGalaxySelectLayoutDrafts() {
            try {
                for (const key of GALAXY_LAYOUT_LEGACY_STORAGE_KEYS) {
                    localStorage.removeItem(key);
                }
            } catch (_) {}
        }

        function parseGalaxySelectLayoutDraft(stored) {
            const draft = JSON.parse(stored);
            if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return null;
            if (draft.schemaVersion !== GALAXY_LAYOUT_STORAGE_SCHEMA_VERSION) return null;
            if (draft.defaultVersion !== GALAXY_LAYOUT_DEFAULT_VERSION) return null;
            return Array.isArray(draft.positions) ? draft.positions : null;
        }

        function loadGalaxySelectLayoutDraft() {
            try {
                clearLegacyGalaxySelectLayoutDrafts();
                const stored = localStorage.getItem(GALAXY_LAYOUT_STORAGE_KEY);
                if (!stored) return false;
                const positions = parseGalaxySelectLayoutDraft(stored);
                if (!positions) {
                    localStorage.removeItem(GALAXY_LAYOUT_STORAGE_KEY);
                    return false;
                }
                return applyGalaxySelectLayoutPositions(positions);
            } catch (_) {
                return false;
            }
        }

        function saveGalaxySelectLayoutDraft() {
            try {
                const positions = GALAXY_SELECT_LAYOUT.map(profile => ({
                    x: Number(profile.x.toFixed(4)),
                    y: Number(profile.y.toFixed(4)),
                    scale: Number(profile.scale.toFixed(4)),
                    axis: Number(profile.axis.toFixed(4))
                }));
                localStorage.setItem(GALAXY_LAYOUT_STORAGE_KEY, JSON.stringify({
                    schemaVersion: GALAXY_LAYOUT_STORAGE_SCHEMA_VERSION,
                    defaultVersion: GALAXY_LAYOUT_DEFAULT_VERSION,
                    positions
                }));
                return true;
            } catch (_) {
                return false;
            }
        }

        function resetGalaxySelectLayoutDraft() {
            for (let i = 0; i < GALAXY_SELECT_LAYOUT.length; i++) {
                GALAXY_SELECT_LAYOUT[i].x = GALAXY_SELECT_DEFAULT_LAYOUT[i].x;
                GALAXY_SELECT_LAYOUT[i].y = GALAXY_SELECT_DEFAULT_LAYOUT[i].y;
                GALAXY_SELECT_LAYOUT[i].scale = GALAXY_SELECT_DEFAULT_LAYOUT[i].scale;
                GALAXY_SELECT_LAYOUT[i].axis = GALAXY_SELECT_DEFAULT_LAYOUT[i].axis;
            }
            try {
                localStorage.removeItem(GALAXY_LAYOUT_STORAGE_KEY);
                clearLegacyGalaxySelectLayoutDrafts();
            } catch (_) {}
            galaxyLayoutDragState.active = false;
            galaxyLayoutDragState.index = -1;
            if (typeof resetPauseMenuShipCursor === 'function') resetPauseMenuShipCursor();
            return true;
        }

        function formatGalaxyLayoutNumber(value) {
            return (Math.round(Number(value) * 1000) / 1000).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
        }

        function formatGalaxySelectLayoutForFile() {
            const lines = ['const GALAXY_SELECT_LAYOUT = ['];
            for (let i = 0; i < GALAXY_SELECT_LAYOUT.length; i++) {
                const profile = GALAXY_SELECT_LAYOUT[i];
                const parts = [
                    `x: ${formatGalaxyLayoutNumber(profile.x)}`,
                    `y: ${formatGalaxyLayoutNumber(profile.y)}`,
                    `scale: ${formatGalaxyLayoutNumber(profile.scale)}`,
                    `axis: ${formatGalaxyLayoutNumber(profile.axis)}`,
                    `tilt: ${formatGalaxyLayoutNumber(profile.tilt)}`,
                    `spinDir: ${profile.spinDir}`,
                    `spinSpeed: ${formatGalaxyLayoutNumber(profile.spinSpeed)}`,
                    `cursorAngle: ${formatGalaxyLayoutNumber(profile.cursorAngle)}`
                ];
                if (profile.prism) parts.push('prism: true');
                if (profile.hub) parts.push('hub: true');
                lines.push(`    { ${parts.join(', ')} }${i === GALAXY_SELECT_LAYOUT.length - 1 ? '' : ','}`);
            }
            lines.push('];');
            return lines.join('\n');
        }

        function setGalaxyLayoutEditorEnabled(enabled) {
            galaxyLayoutEditMode = !!enabled;
            galaxyLayoutDragState.active = false;
            galaxyLayoutDragState.index = -1;
            galaxyLayoutHoverIndex = -1;
            if (galaxyLayoutEditMode && gameState === 'PAUSED' && pauseReturnState === 'GALAXY_SELECT' && typeof resumeFromPauseMode === 'function') {
                resumeFromPauseMode();
            }
            return galaxyLayoutEditMode;
        }

        function getGalaxyLayoutEditorHelpLines() {
            return [
                'layout on/off : toggle drag editor',
                'Drag nodes to move them on galaxy select',
                'Mouse wheel scales hovered/dragged node',
                'Shift + mouse wheel rotates hovered/dragged node',
                'layout copy : copy/paste layout block',
                'layout reset : restore default coordinates',
                'Draft saves locally in this browser'
            ];
        }

        function getGalaxyLayoutEditorHitIndex(x, y) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [];
            const count = Math.min(galaxies.length || GALAXY_SELECT_LAYOUT.length, GALAXY_SELECT_LAYOUT.length);
            let bestIndex = -1;
            let bestDist = Infinity;
            for (let i = count - 1; i >= 0; i--) {
                const slot = getGalaxySelectSlot(i);
                const radius = getGalaxySelectRenderRadius(i, i === selectedGalaxyIndex);
                const dist = Math.hypot(x - slot.x, y - slot.y);
                const hitRadius = Math.max(42, radius * 0.86);
                if (dist <= hitRadius && dist < bestDist) {
                    bestIndex = i;
                    bestDist = dist;
                }
            }
            return bestIndex;
        }

        function updateGalaxyLayoutEditorHover() {
            if (!galaxyLayoutEditMode || gameState !== 'GALAXY_SELECT' || consoleOpen) {
                galaxyLayoutHoverIndex = -1;
                return;
            }
            galaxyLayoutHoverIndex = getGalaxyLayoutEditorHitIndex(mouse.x, mouse.y);
        }

        function handleGalaxyLayoutEditorMouseDown(x = mouse.x, y = mouse.y) {
            if (!galaxyLayoutEditMode || gameState !== 'GALAXY_SELECT' || consoleOpen) return false;
            const hitIndex = getGalaxyLayoutEditorHitIndex(x, y);
            if (hitIndex < 0) return false;
            const slot = getGalaxySelectSlot(hitIndex);
            galaxyLayoutDragState.active = true;
            galaxyLayoutDragState.index = hitIndex;
            galaxyLayoutDragState.offsetX = slot.x - x;
            galaxyLayoutDragState.offsetY = slot.y - y;
            galaxyLayoutHoverIndex = hitIndex;
            selectedGalaxyIndex = hitIndex;
            if (typeof resetPauseMenuShipCursor === 'function') resetPauseMenuShipCursor();
            return true;
        }

        function handleGalaxyLayoutEditorMouseMove(x = mouse.x, y = mouse.y) {
            if (!galaxyLayoutEditMode || gameState !== 'GALAXY_SELECT') return false;
            if (!galaxyLayoutDragState.active) {
                updateGalaxyLayoutEditorHover();
                return false;
            }
            const profile = GALAXY_SELECT_LAYOUT[galaxyLayoutDragState.index];
            if (!profile) return false;
            profile.x = clampGalaxyLayoutCoord((x + galaxyLayoutDragState.offsetX) / Math.max(1, width), 0.07, 0.93);
            profile.y = clampGalaxyLayoutCoord((y + galaxyLayoutDragState.offsetY) / Math.max(1, height), 0.16, 0.80);
            selectedGalaxyIndex = galaxyLayoutDragState.index;
            galaxyLayoutHoverIndex = galaxyLayoutDragState.index;
            saveGalaxySelectLayoutDraft();
            return true;
        }

        function handleGalaxyLayoutEditorMouseUp() {
            if (!galaxyLayoutEditMode || !galaxyLayoutDragState.active) return false;
            galaxyLayoutDragState.active = false;
            saveGalaxySelectLayoutDraft();
            return true;
        }

        function handleGalaxyLayoutEditorWheel(deltaY, options = {}, x = mouse.x, y = mouse.y) {
            if (!galaxyLayoutEditMode || gameState !== 'GALAXY_SELECT' || consoleOpen) return false;
            const targetIndex = galaxyLayoutDragState.active
                ? galaxyLayoutDragState.index
                : getGalaxyLayoutEditorHitIndex(x, y);
            if (targetIndex < 0) return false;
            const profile = GALAXY_SELECT_LAYOUT[targetIndex];
            if (!profile) return false;
            const direction = deltaY < 0 ? 1 : -1;
            if (options && options.shiftKey) {
                const rotationStep = (options.altKey ? 0.025 : 0.075) * direction;
                profile.axis = wrapGalaxyLayoutAxis(profile.axis + rotationStep);
            } else {
                const scaleStep = (options.altKey ? 0.015 : 0.04) * direction;
                profile.scale = clampGalaxyLayoutScale(profile.scale + scaleStep);
            }
            selectedGalaxyIndex = targetIndex;
            galaxyLayoutHoverIndex = targetIndex;
            saveGalaxySelectLayoutDraft();
            if (typeof resetPauseMenuShipCursor === 'function') resetPauseMenuShipCursor();
            return true;
        }

        loadGalaxySelectLayoutDraft();

        function getGalaxySpritePointSet(galaxy, index, count) {
            const arms = Math.max(2, galaxy.arms || 2);
            const seed = galaxy.seed || index * 17;
            const key = `${index}|${arms}|${seed}|${count}|${galaxy.twist || 2.8}`;
            const cached = GALAXY_SPRITE_POINT_CACHE.get(key);
            if (cached) return cached;

            const points = [];
            for (let i = 0; i < count; i++) {
                const arm = i % arms;
                const t = Math.pow((i + 1) / count, 0.72);
                points.push({
                    armAngle: (arm / arms) * Math.PI * 2,
                    t,
                    drift: galaxyNoise(seed, i) - 0.5,
                    radiusMul: (0.12 + t * 0.86) * (0.86 + galaxyNoise(seed + 3, i) * 0.22),
                    glyphIndex: Math.floor(galaxyNoise(seed + 18, i) * 1024),
                    glyph: t < 0.18 ? 'o' : (galaxyNoise(seed + 8, i) > 0.86 ? '+' : (galaxyNoise(seed + 11, i) > 0.64 ? '*' : (galaxyNoise(seed + 14, i) > 0.42 ? "'" : '.')))
                });
            }
            GALAXY_SPRITE_POINT_CACHE.set(key, points);
            return points;
        }

        function getGalaxyGlyph(galaxy, point, fallbackGlyph = '.') {
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length ? galaxy.glyphs : null;
            if (!glyphs) return point && point.glyph ? point.glyph : fallbackGlyph;
            const index = Math.abs((point && Number.isFinite(point.glyphIndex) ? point.glyphIndex : 0)) % glyphs.length;
            return glyphs[index] || fallbackGlyph;
        }

        function getGalaxyCoreGlyph(galaxy, fallbackGlyph = '@') {
            if (galaxy && galaxy.coreGlyph) return galaxy.coreGlyph;
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length ? galaxy.glyphs : null;
            return glyphs ? glyphs[0] : fallbackGlyph;
        }

        function getGalaxyCoreVoidGlyph(galaxy, fallbackGlyph = '.') {
            if (galaxy && galaxy.coreVoidGlyph) return galaxy.coreVoidGlyph;
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length > 1 ? galaxy.glyphs : null;
            return glyphs ? glyphs[1] : fallbackGlyph;
        }

        function mixGalaxyColor(colors, t) {
            if (!colors || colors.length === 0) return currentThemeColor;
            if (t < 0.34) return colors[0];
            if (t < 0.72) return colors[1] || colors[0];
            return colors[2] || colors[1] || colors[0];
        }

        function getGalaxyFontPx(size, options = {}) {
            const safeSize = Math.max(1, size || 1);
            return options && options.warp
                ? Math.round(safeSize * 10) / 10
                : Math.round(safeSize);
        }

        function getGalaxySelectBackgroundGradient() {
            if (
                galaxySelectBgGradientCache.gradient &&
                galaxySelectBgGradientCache.width === width &&
                galaxySelectBgGradientCache.height === height
            ) {
                return galaxySelectBgGradientCache.gradient;
            }
            const bg = galaxyCtx.createRadialGradient(width / 2, height * 0.45, 20, width / 2, height / 2, Math.max(width, height) * 0.72);
            bg.addColorStop(0, '#0a1632');
            bg.addColorStop(0.56, '#050b1d');
            bg.addColorStop(1, '#02050d');
            galaxySelectBgGradientCache.width = width;
            galaxySelectBgGradientCache.height = height;
            galaxySelectBgGradientCache.gradient = bg;
            return bg;
        }

        function getGalaxySelectSlot(index) {
            const profile = getGalaxyVisualProfile(index);
            const marginX = Math.max(86, width * 0.08);
            const mapLift = Math.max(20, Math.min(46, height * GALAXY_SELECT_MAP_VERTICAL_LIFT));
            const minY = Math.max(104, height * 0.135);
            const maxY = Math.min(height * 0.77, height - 144);
            return {
                x: Math.max(marginX, Math.min(width - marginX, width * profile.x)),
                y: Math.max(minY, Math.min(maxY, height * profile.y - mapLift))
            };
        }

        function getGalaxyVisualProfile(index) {
            return GALAXY_SELECT_LAYOUT[index % GALAXY_SELECT_LAYOUT.length] || GALAXY_SELECT_LAYOUT[0];
        }

        function getGalaxySelectDirectionalIndex(currentIndex, dirX, dirY) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [];
            const count = galaxies.length || GALAXY_SELECT_LAYOUT.length;
            if (count <= 1) return 0;
            const current = Math.max(0, Math.min(count - 1, currentIndex || 0));
            const currentGalaxy = galaxies[current];
            if (currentGalaxy && currentGalaxy.id === 'red-dwarf' && dirY < 0 && Math.abs(dirY) >= Math.abs(dirX)) {
                const fractalIndex = galaxies.findIndex(galaxy => galaxy && galaxy.id === 'rose-quasar');
                if (fractalIndex !== -1) return fractalIndex;
            }
            const from = getGalaxySelectSlot(current);
            const dirLen = Math.max(0.001, Math.hypot(dirX, dirY));
            const nx = dirX / dirLen;
            const ny = dirY / dirLen;
            let bestIndex = current;
            let bestScore = Infinity;
            let fallbackIndex = current;
            let fallbackScore = Infinity;

            for (let i = 0; i < count; i++) {
                if (i === current) continue;
                const slot = getGalaxySelectSlot(i);
                const dx = slot.x - from.x;
                const dy = slot.y - from.y;
                const dist = Math.max(0.001, Math.hypot(dx, dy));
                const forward = dx * nx + dy * ny;
                if (forward <= 6) continue;
                const alignment = forward / dist;
                const perpendicular = Math.abs(dx * ny - dy * nx);
                const score = forward + perpendicular * 1.35 - alignment * 12;
                const looseScore = forward + perpendicular * 1.9 - alignment * 8;
                if (looseScore < fallbackScore) {
                    fallbackScore = looseScore;
                    fallbackIndex = i;
                }
                if (alignment < 0.28) continue;
                if (score < bestScore) {
                    bestScore = score;
                    bestIndex = i;
                }
            }

            if (bestIndex !== current) return bestIndex;
            if (fallbackIndex !== current) return fallbackIndex;

            return current;
        }

        function getGalaxySelectRenderRadius(index, selected = false, highlightAmount = null) {
            const profile = getGalaxyVisualProfile(index);
            const galaxy = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS[index] : null;
            const baseRadius = Math.max(46, Math.min(82, Math.min(width, height) * 0.073));
            const survivorScale = galaxy && galaxy.mode === 'survivor' ? 0.94 : 1;
            const hubScale = galaxy && galaxy.mode === 'shipHub' ? 0.86 : 1;
            const highlight = Number.isFinite(highlightAmount) ? clampGalaxySelectHighlight(highlightAmount) : (selected ? 1 : 0);
            return baseRadius * profile.scale * survivorScale * hubScale * (0.94 + highlight * 0.20);
        }

        function drawGalaxySelectCircuitSubstrate(now) {
            const alphaPulse = 0.82 + Math.sin(now * 0.00065) * 0.18;
            galaxyCtx.save();
            galaxyCtx.lineWidth = 1;
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';

            for (let i = 0; i < GALAXY_SELECT_HEX_FRAGMENTS.length; i++) {
                const h = GALAXY_SELECT_HEX_FRAGMENTS[i];
                const x = h.x * width;
                const y = h.y * height;
                const r = h.size * (0.86 + Math.sin(now * 0.0005 + h.phase) * 0.05);
                galaxyCtx.globalAlpha = h.alpha * alphaPulse;
                galaxyCtx.strokeStyle = h.color;
                galaxyCtx.beginPath();
                for (let p = 0; p < 6; p++) {
                    const a = Math.PI / 6 + (Math.PI * 2 * p) / 6;
                    const px = x + Math.cos(a) * r;
                    const py = y + Math.sin(a) * r;
                    if (p === 0) galaxyCtx.moveTo(px, py);
                    else galaxyCtx.lineTo(px, py);
                }
                galaxyCtx.closePath();
                galaxyCtx.stroke();
            }

            for (let i = 0; i < GALAXY_SELECT_CIRCUIT_TRACES.length; i++) {
                const t = GALAXY_SELECT_CIRCUIT_TRACES[i];
                const x0 = t.x * width;
                const y0 = t.y * height;
                const x1 = x0 + (t.horizontalFirst ? t.a * width : 0);
                const y1 = y0 + (t.horizontalFirst ? 0 : t.a * height);
                const x2 = x1 + (t.horizontalFirst ? 0 : t.b * width);
                const y2 = y1 + (t.horizontalFirst ? t.b * height : 0);
                const pulse = 0.62 + Math.sin(now * 0.0012 + t.phase) * 0.38;
                galaxyCtx.globalAlpha = t.alpha * alphaPulse;
                galaxyCtx.strokeStyle = t.color;
                galaxyCtx.beginPath();
                galaxyCtx.moveTo(x0, y0);
                galaxyCtx.lineTo(x1, y1);
                galaxyCtx.lineTo(x2, y2);
                galaxyCtx.stroke();

                galaxyCtx.globalAlpha = t.alpha * (0.8 + pulse * 0.9);
                galaxyCtx.fillStyle = i % 3 === 0 ? '#f2fbff' : t.color;
                galaxyCtx.fillRect(x0 - 1.5, y0 - 1.5, 3, 3);
                galaxyCtx.fillRect(x2 - 1.5, y2 - 1.5, 3, 3);

                const packetT = (now * 0.00018 + i * 0.137) % 1;
                const onFirstLeg = packetT < 0.5;
                const legT = onFirstLeg ? packetT * 2 : (packetT - 0.5) * 2;
                const px = onFirstLeg ? x0 + (x1 - x0) * legT : x1 + (x2 - x1) * legT;
                const py = onFirstLeg ? y0 + (y1 - y0) * legT : y1 + (y2 - y1) * legT;
                galaxyCtx.globalAlpha = t.alpha * (1.3 + pulse);
                galaxyCtx.fillStyle = '#ffffff';
                galaxyCtx.fillRect(px - 1, py - 1, 2, 2);
            }

            for (let i = 0; i < GALAXY_SELECT_MATH_OVERLAYS.length; i++) {
                const m = GALAXY_SELECT_MATH_OVERLAYS[i];
                const driftX = Math.sin(now * m.speed + m.phase) * 5;
                const driftY = Math.cos(now * m.speed * 0.73 + m.phase) * 3;
                galaxyCtx.globalAlpha = m.alpha * (0.72 + Math.sin(now * 0.0009 + m.phase) * 0.20);
                galaxyCtx.fillStyle = m.color;
                galaxyCtx.font = `bold ${m.fontSize}px Courier New`;
                galaxyCtx.fillText(m.text, m.x * width + driftX, m.y * height + driftY);
            }

            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
        }

        function drawGalaxySelectAsteroidBelt(now) {
            const bandAngle = -0.28;
            const centerX = width * 0.5;
            const centerY = height * 0.51;
            const beltW = width * 1.28;
            const beltH = height * 0.16;
            const cos = Math.cos(bandAngle);
            const sin = Math.sin(bandAngle);
            galaxyCtx.save();
            galaxyCtx.translate(centerX, centerY);
            galaxyCtx.rotate(bandAngle);
            const bandGlow = galaxyCtx.createLinearGradient(-beltW / 2, 0, beltW / 2, 0);
            bandGlow.addColorStop(0, 'rgba(126, 166, 220, 0)');
            bandGlow.addColorStop(0.34, 'rgba(126, 166, 220, 0.018)');
            bandGlow.addColorStop(0.62, 'rgba(126, 166, 220, 0.012)');
            bandGlow.addColorStop(1, 'rgba(126, 166, 220, 0)');
            galaxyCtx.strokeStyle = bandGlow;
            galaxyCtx.lineWidth = Math.max(9, height * 0.014);
            galaxyCtx.beginPath();
            galaxyCtx.moveTo(-beltW / 2, 0);
            galaxyCtx.lineTo(beltW / 2, 0);
            galaxyCtx.stroke();
            galaxyCtx.restore();

            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            for (let i = 0; i < GALAXY_SELECT_ASTEROIDS.length; i++) {
                const a = GALAXY_SELECT_ASTEROIDS[i];
                const drift = ((a.x + now * 0.000018 * a.speed * 60) % 1.18) - 0.09;
                const lane = (a.lane - 0.5) * 2;
                const localX = (drift - 0.5) * beltW;
                const localY = lane * beltH * (0.18 + Math.abs(lane) * 0.38) + Math.sin(now * 0.00018 + i * 1.7) * 4;
                const x = centerX + localX * cos - localY * sin;
                const y = centerY + localX * sin + localY * cos;
                if (x < -30 || x > width + 30 || y < -30 || y > height + 30) continue;
                const depth = 1 - Math.min(1, Math.abs(lane));
                galaxyCtx.globalAlpha = a.alpha * (0.5 + depth * 0.7);
                galaxyCtx.fillStyle = depth > 0.5 ? '#8fa7c9' : '#52657d';
                galaxyCtx.font = `bold ${Math.max(4, a.size * (0.72 + depth * 0.42))}px Courier New`;
                galaxyCtx.fillText(a.glyph, x, y);
            }

            for (let i = 0; i < GALAXY_SELECT_DATA_BUS_PACKETS.length; i++) {
                const p = GALAXY_SELECT_DATA_BUS_PACKETS[i];
                const drift = ((p.x + now * 0.000018 * p.speed * 60) % 1.18) - 0.09;
                const lane = (p.lane - 0.5) * 2;
                const localX = (drift - 0.5) * beltW;
                const localY = lane * beltH * 0.38 + Math.sin(now * 0.00024 + p.phase) * 3;
                const x = centerX + localX * cos - localY * sin;
                const y = centerY + localX * sin + localY * cos;
                if (x < -70 || x > width + 70 || y < -50 || y > height + 50) continue;
                const pulse = 0.72 + Math.sin(now * 0.0014 + p.phase) * 0.28;
                galaxyCtx.globalAlpha = p.alpha * pulse;
                galaxyCtx.fillStyle = i % 4 === 0 ? '#f2fbff' : '#8ff7ff';
                galaxyCtx.font = `bold ${i % 4 === 0 ? 9 : 7}px Courier New`;
                galaxyCtx.fillText(p.glyph, x, y);
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
        }

        function drawGalaxySelectComets(now) {
            const cometConfigs = [
                { period: 14500, offset: 1800, seed: 801, angle: -0.34, color: '#c8f7ff' },
                { period: 21800, offset: 9300, seed: 911, angle: -0.62, color: '#ffe9a8' }
            ];
            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            for (let i = 0; i < cometConfigs.length; i++) {
                const cfg = cometConfigs[i];
                const cycleTime = (now + cfg.offset) % cfg.period;
                const activeWindow = cfg.period * 0.22;
                if (cycleTime > activeWindow) continue;
                const cycle = Math.floor((now + cfg.offset) / cfg.period);
                const progress = cycleTime / activeWindow;
                const ease = progress * progress * (3 - progress * 2);
                const startX = width * (-0.16 + galaxyNoise(cfg.seed + cycle, 1) * 0.22);
                const startY = height * (0.18 + galaxyNoise(cfg.seed + cycle, 2) * 0.48);
                const travel = width * (1.22 + galaxyNoise(cfg.seed + cycle, 3) * 0.20);
                const vx = Math.cos(cfg.angle) * travel;
                const vy = Math.sin(cfg.angle) * travel;
                const headX = startX + vx * ease;
                const headY = startY + vy * ease;
                const fade = Math.sin(progress * Math.PI);
                for (let j = 16; j >= 0; j--) {
                    const t = j / 16;
                    const px = headX - vx * 0.055 * t;
                    const py = headY - vy * 0.055 * t + Math.sin(now * 0.004 + j) * t * 1.4;
                    if (px < -80 || px > width + 80 || py < -80 || py > height + 80) continue;
                    const life = 1 - t;
                    galaxyCtx.globalAlpha = fade * (0.04 + life * 0.34);
                    galaxyCtx.fillStyle = j < 3 ? '#ffffff' : cfg.color;
                    galaxyCtx.shadowColor = cfg.color;
                    galaxyCtx.shadowBlur = glowEnabled ? 6 + life * 12 : 0;
                    galaxyCtx.font = `bold ${Math.max(5, 5 + life * 10)}px Courier New`;
                    galaxyCtx.fillText(j < 2 ? '*' : (j % 3 === 0 ? '+' : '.'), px, py);
                }
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
        }

        function getGalaxySelectCacheCanvas(cache, targetWidth, targetHeight) {
            if (!cache.canvas) cache.canvas = document.createElement('canvas');
            if (cache.canvas.width !== targetWidth || cache.canvas.height !== targetHeight) {
                cache.canvas.width = targetWidth;
                cache.canvas.height = targetHeight;
            }
            return cache.canvas;
        }

        function drawGalaxySelectBackgroundDirect(now) {
            galaxyCtx.fillStyle = getGalaxySelectBackgroundGradient();
            galaxyCtx.fillRect(0, 0, width, height);
            drawGalaxySelectCircuitSubstrate(now);

            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            for (let i = 0; i < GALAXY_SELECT_BG_STARS.length; i++) {
                const s = GALAXY_SELECT_BG_STARS[i];
                const twinkle = 0.66 + Math.sin(now * s.speed + s.phase) * 0.28 + Math.sin(now * s.speed * 0.37 + i) * 0.10;
                galaxyCtx.globalAlpha = s.alpha * twinkle;
                galaxyCtx.font = s.font;
                galaxyCtx.fillStyle = s.bright ? '#f0fbff' : (i % 9 === 0 ? '#8db7ff' : '#6f91c8');
                const driftX = Math.sin(now * 0.00007 + i) * (s.bright ? 1.2 : 0.5);
                const driftY = Math.cos(now * 0.00005 + i * 1.7) * (s.bright ? 0.9 : 0.4);
                galaxyCtx.fillText(s.glyph, s.x * width + driftX, s.y * height + driftY);
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            drawGalaxySelectAsteroidBelt(now);
            drawGalaxySelectComets(now);
        }

        function drawGalaxySelectBackground(now) {
            if (width <= 0 || height <= 0) return drawGalaxySelectBackgroundDirect(now);
            const bucketMs = 1000 / GALAXY_SELECT_BACKGROUND_CACHE_FPS;
            const bucket = Math.floor(now / bucketMs);
            const cache = galaxySelectBackgroundFrameCache;
            if (!cache.canvas || cache.width !== width || cache.height !== height || cache.bucket !== bucket) {
                const cacheCanvas = getGalaxySelectCacheCanvas(cache, width, height);
                const cacheCtx = cacheCanvas.getContext('2d', { alpha: false });
                if (!cacheCtx) return drawGalaxySelectBackgroundDirect(now);
                const previousCtx = galaxyCtx;
                galaxyCtx = cacheCtx;
                cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
                cacheCtx.globalAlpha = 1;
                cacheCtx.globalCompositeOperation = 'source-over';
                cacheCtx.shadowBlur = 0;
                try {
                    drawGalaxySelectBackgroundDirect(bucket * bucketMs);
                } finally {
                    galaxyCtx = previousCtx;
                }
                cache.width = width;
                cache.height = height;
                cache.bucket = bucket;
            }
            galaxyCtx.drawImage(cache.canvas, 0, 0);
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function getGalaxyRenderStyle(galaxy) {
            return (galaxy && (galaxy.visualStyle || galaxy.id)) || 'spiral';
        }

        function isPrismArrayGalaxySprite(galaxy) {
            return galaxy && (galaxy.mode === 'survivor' || getGalaxyRenderStyle(galaxy) === 'prismArray');
        }

        function getGalaxySpriteBloomScratch(widthPx, heightPx) {
            const w = Math.max(1, Math.ceil(widthPx || 1));
            const h = Math.max(1, Math.ceil(heightPx || 1));
            if (!galaxySpriteBloomScratch.canvas) {
                galaxySpriteBloomScratch.canvas = document.createElement('canvas');
            }
            if (galaxySpriteBloomScratch.width !== w || galaxySpriteBloomScratch.height !== h) {
                galaxySpriteBloomScratch.canvas.width = w;
                galaxySpriteBloomScratch.canvas.height = h;
                galaxySpriteBloomScratch.width = w;
                galaxySpriteBloomScratch.height = h;
                galaxySpriteBloomScratch.ctx = galaxySpriteBloomScratch.canvas.getContext('2d', { alpha: true });
            }
            return galaxySpriteBloomScratch.ctx ? galaxySpriteBloomScratch : null;
        }

        function applyGalaxySpriteBloom(targetCtx, sourceCanvas, highlightAmount = 1, strength = 1) {
            if (!targetCtx || !sourceCanvas || !('filter' in targetCtx)) return false;
            const scratch = getGalaxySpriteBloomScratch(sourceCanvas.width, sourceCanvas.height);
            if (!scratch || !scratch.ctx) return false;
            const highlight = clampGalaxySelectHighlight(highlightAmount);
            const bloomStrength = Math.max(0, strength || 0);
            scratch.ctx.setTransform(1, 0, 0, 1, 0, 0);
            scratch.ctx.clearRect(0, 0, scratch.width, scratch.height);
            scratch.ctx.globalAlpha = 1;
            scratch.ctx.globalCompositeOperation = 'source-over';
            scratch.ctx.filter = 'none';
            scratch.ctx.drawImage(sourceCanvas, 0, 0);

            targetCtx.save();
            targetCtx.globalCompositeOperation = 'lighter';
            targetCtx.globalAlpha = (0.22 + highlight * 0.22) * bloomStrength;
            targetCtx.filter = `blur(${Math.round(5 + highlight * 3)}px)`;
            targetCtx.drawImage(scratch.canvas, 0, 0);
            targetCtx.filter = 'none';
            targetCtx.globalAlpha = (0.08 + highlight * 0.08) * bloomStrength;
            targetCtx.drawImage(scratch.canvas, 0, 0);
            targetCtx.restore();
            return true;
        }

        function drawGalaxySoftAura(colors, radius, selected, alphaScale = 1, highlightAmount = null) {
            const highlight = Number.isFinite(highlightAmount) ? clampGalaxySelectHighlight(highlightAmount) : (selected ? 1 : 0);
            const aura = galaxyCtx.createRadialGradient(0, 0, radius * 0.08, 0, 0, radius * 1.35);
            aura.addColorStop(0, colorWithAlpha(colors[2] || colors[1] || '#ffffff', (0.10 + highlight * 0.08) * alphaScale));
            aura.addColorStop(0.42, colorWithAlpha(colors[1] || colors[0], (0.045 + highlight * 0.055) * alphaScale));
            aura.addColorStop(1, colorWithAlpha(colors[0], 0));
            galaxyCtx.fillStyle = aura;
            galaxyCtx.beginPath();
            galaxyCtx.arc(0, 0, radius * 1.36, 0, Math.PI * 2);
            galaxyCtx.fill();
        }

        function drawGalaxyCore(galaxy, colors, radius, selected, axis, tilt, options = {}) {
            const fontScale = options.fontScale || 1;
            const warpMode = !!options.warp;
            const available = !galaxy || galaxy.available !== false;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const coreAlphaScale = Number.isFinite(options.coreAlphaScale) ? options.coreAlphaScale : 1;
            const coreFontScale = Number.isFinite(options.coreFontScale) ? options.coreFontScale : 1;
            const coreShadowScale = Number.isFinite(options.coreShadowScale) ? options.coreShadowScale : 1;
            const coreVoidAlphaScale = Number.isFinite(options.coreVoidAlphaScale) ? options.coreVoidAlphaScale : 1;
            const baseAlpha = available ? (0.70 + highlight * 0.26) : (0.25 + highlight * 0.08);
            galaxyCtx.globalAlpha = baseAlpha * coreAlphaScale;
            galaxyCtx.fillStyle = (galaxy && galaxy.coreColor) || colors[2] || '#ffffff';
            galaxyCtx.shadowColor = (galaxy && galaxy.coreColor) || colors[2] || colors[0];
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (9 + highlight * 11) * fontScale * coreShadowScale : 0;
            galaxyCtx.save();
            galaxyCtx.rotate(axis * 0.45);
            galaxyCtx.scale(1, 0.78 + tilt * 0.24);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(10, (28 + highlight * 6) * fontScale * coreFontScale), options)}px Courier New`;
            galaxyCtx.fillText(getGalaxyCoreGlyph(galaxy, '@'), 0, 0);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, (13 + highlight * 3) * fontScale * coreFontScale), options)}px Courier New`;
            galaxyCtx.fillStyle = '#071026';
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalAlpha = baseAlpha * coreAlphaScale * coreVoidAlphaScale;
            galaxyCtx.fillText(getGalaxyCoreVoidGlyph(galaxy, '.'), 0, 0);
            galaxyCtx.restore();
        }

        function drawGalaxySpiralArms(galaxy, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#6aa8ff', '#ff5e8a', '#ffffff'];
            const style = getGalaxyRenderStyle(galaxy);
            const arms = Math.max(2, galaxy.arms || 2);
            const seed = galaxy.seed || index * 17;
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00009 + seed) * 0.035);
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const spinRate = options.warp ? 0.00008 : 0.00012;
            const spin = now * spinRate * (options.warp && selected ? 1.55 : 1) * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const brightness = galaxy.available ? (0.78 + highlight * 0.40) : (0.32 + highlight * 0.08);
            const tilt = options.tiltOverride ?? (profile.tilt || galaxy.tilt || 0.5);
            const cosAxis = Math.cos(axis);
            const sinAxis = Math.sin(axis);
            const twist = (galaxy.twist || 2.8) * Math.PI;
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const stepCount = Math.max(14, Math.round((34 + highlight * 8) * detail));
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length ? galaxy.glyphs : ['.', '*', '+'];
            const lineWobble = style === 'matrixNebula' ? 0.20 : 0.09;
            let lastFont = '';

            galaxyCtx.save();
            galaxyCtx.lineCap = 'round';
            for (let arm = 0; arm < arms; arm++) {
                const armAngle = (arm / arms) * Math.PI * 2;
                const armColor = colors[arm % colors.length] || colors[0];
                galaxyCtx.globalAlpha = (0.11 + highlight * 0.11) * brightness;
                galaxyCtx.strokeStyle = colorWithAlpha(armColor, style === 'matrixNebula' ? 0.38 : 0.52);
                galaxyCtx.lineWidth = Math.max(1, radius * (style === 'matrixNebula' ? 0.018 : 0.012));
                galaxyCtx.beginPath();
                for (let s = 0; s < stepCount; s++) {
                    const t = s / Math.max(1, stepCount - 1);
                    const radiusEase = Math.pow(t, style === 'bitshiftSphere' ? 0.58 : 0.72);
                    const noise = galaxyNoise(seed + arm * 31, s);
                    const gapPulse = Math.sin(t * Math.PI * (style === 'matrixNebula' ? 5.8 : 3.4) + now * 0.001 + arm);
                    const r = radius * (0.15 + radiusEase * 0.86) * (0.96 + gapPulse * 0.018 + (noise - 0.5) * lineWobble);
                    const angle = armAngle + t * twist + spin + (noise - 0.5) * 0.16;
                    const depth = 0.5 + Math.sin(angle) * 0.5;
                    const localX = Math.cos(angle) * r;
                    const localY = Math.sin(angle) * r * tilt + (depth - 0.5) * radius * 0.10;
                    const x = localX * cosAxis - localY * sinAxis;
                    const y = localX * sinAxis + localY * cosAxis;
                    if (s === 0) galaxyCtx.moveTo(x, y);
                    else galaxyCtx.lineTo(x, y);
                }
                galaxyCtx.stroke();

                for (let s = 0; s < stepCount; s++) {
                    const t = s / Math.max(1, stepCount - 1);
                    const radiusEase = Math.pow(t, style === 'bitshiftSphere' ? 0.58 : 0.72);
                    const noise = galaxyNoise(seed + arm * 43, s);
                    const skip = style === 'matrixNebula' && noise < 0.18 && t > 0.24;
                    if (skip) continue;
                    const r = radius * (0.15 + radiusEase * 0.86) * (0.92 + (noise - 0.5) * (style === 'matrixNebula' ? 0.24 : 0.10));
                    const angle = armAngle + t * twist + spin + (noise - 0.5) * 0.22;
                    const depth = 0.5 + Math.sin(angle) * 0.5;
                    const localX = Math.cos(angle) * r;
                    const localY = Math.sin(angle) * r * tilt + (depth - 0.5) * radius * 0.10;
                    const perspective = 0.74 + depth * 0.42;
                    const x = (localX * cosAxis - localY * sinAxis) * perspective;
                    const y = (localX * sinAxis + localY * cosAxis) * perspective;
                    const fontSize = getGalaxyFontPx(Math.max(6, (7 + (1 - t) * 9 + depth * 4) * (0.95 + highlight * 0.10) * fontScale), options);
                    const nextFont = `bold ${fontSize}px Courier New`;
                    if (nextFont !== lastFont) {
                        galaxyCtx.font = nextFont;
                        lastFont = nextFont;
                    }
                    const colorT = depth * 0.42 + (1 - t) * 0.58;
                    const quasarCenterDamp = style === 'binaryQuasar' ? (0.38 + t * 0.62) : 1;
                    galaxyCtx.globalAlpha = Math.min(1, (0.16 + depth * 0.40 + (1 - t) * 0.18) * brightness * quasarCenterDamp);
                    galaxyCtx.fillStyle = noise > 0.94 ? '#ffffff' : mixGalaxyColor(colors, colorT);
                    galaxyCtx.fillText(getGalaxyGlyph(galaxy, { glyphIndex: Math.floor(noise * 1024), glyph: glyphs[s % glyphs.length] }, glyphs[s % glyphs.length]), x, y);
                }
            }
            galaxyCtx.restore();
        }

        function drawBinaryQuasarJet(galaxy, radius, axis, now, selected, options = {}) {
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length ? galaxy.glyphs : ['0', '1'];
            const colors = galaxy && galaxy.colors ? galaxy.colors : ['#dcecff', '#8fa7c9', '#ffffff'];
            const seed = galaxy && Number.isFinite(galaxy.seed) ? galaxy.seed : 11;
            const jetAngle = axis - Math.PI / 2;
            const pulse = 0.58 + Math.sin(now * 0.0024) * 0.22;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const strandCount = Math.max(4, Math.round((4.6 + highlight * 0.7) * detail));
            const shimmerCount = Math.max(2, Math.round((2.7 + highlight * 0.5) * detail));
            const strandPoint = (side, strand, t, extension = 0) => {
                const offsetIndex = strand - (strandCount - 1) / 2;
                const offset = offsetIndex * 0.047 + (galaxyNoise(seed + 211, strand) - 0.5) * 0.018;
                const drift = Math.sin(now * 0.00026 + side * 1.9 + strand * 0.73) * 0.010;
                const angle = jetAngle + offset + drift;
                const dx = Math.cos(angle) * side;
                const dy = Math.sin(angle) * side;
                const normalX = Math.cos(angle + Math.PI / 2);
                const normalY = Math.sin(angle + Math.PI / 2);
                const inner = radius * (0.12 + galaxyNoise(seed + 223, strand) * 0.04);
                const outer = radius * (1.28 + highlight * 0.22 + galaxyNoise(seed + 239, strand) * 0.14 + extension);
                const bend = Math.sin(t * Math.PI) * radius * (galaxyNoise(seed + 251, strand) - 0.5) * 0.10;
                const along = inner + (outer - inner) * t;
                return {
                    x: dx * along + normalX * bend,
                    y: dy * along + normalY * bend,
                    angle
                };
            };

            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            galaxyCtx.lineCap = 'round';
            for (let side = -1; side <= 1; side += 2) {
                for (let strand = 0; strand < strandCount; strand++) {
                    const segments = 7;
                    for (let i = 0; i < segments; i++) {
                        const t0 = i / segments;
                        const t1 = (i + 1) / segments;
                        const mid = (t0 + t1) * 0.5;
                        const p0 = strandPoint(side, strand, t0);
                        const p1 = strandPoint(side, strand, t1);
                        const tipFade = Math.pow(Math.max(0, 1 - mid), 0.84);
                        const centerFade = Math.min(1, 0.38 + mid * 1.45);
                        const primary = strand === Math.floor(strandCount / 2);
                        galaxyCtx.globalAlpha = (primary ? 0.21 : 0.08) * centerFade * tipFade + highlight * (primary ? 0.12 : 0.045) * tipFade;
                        galaxyCtx.strokeStyle = colorWithAlpha(primary ? '#dff7ff' : colors[strand % colors.length], (primary ? 0.82 : 0.48) * pulse);
                        galaxyCtx.lineWidth = Math.max(0.7, radius * (primary ? 0.032 : 0.012) * (0.65 + tipFade * 0.35));
                        galaxyCtx.beginPath();
                        galaxyCtx.moveTo(p0.x, p0.y);
                        galaxyCtx.lineTo(p1.x, p1.y);
                        galaxyCtx.stroke();
                    }

                    galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, radius * (0.065 + highlight * 0.008) * fontScale), options)}px Courier New`;
                    const glyphCount = Math.max(3, Math.round((4 + highlight) * detail));
                    for (let i = 0; i < glyphCount; i++) {
                        const t = 0.24 + i * (0.70 / Math.max(1, glyphCount - 1));
                        const p = strandPoint(side, strand, t);
                        const fade = Math.pow(Math.max(0, 1 - t), 0.72);
                        galaxyCtx.globalAlpha = (0.13 + highlight * 0.11) * fade * (0.72 + galaxyNoise(seed + 307 + strand * 7, i) * 0.28);
                        galaxyCtx.fillStyle = i % 3 === 0 ? '#ffffff' : colors[(strand + i) % colors.length];
                        galaxyCtx.fillText(glyphs[(strand + i) % glyphs.length], p.x, p.y);
                    }

                    for (let wave = 0; wave < shimmerCount; wave++) {
                        const waveSeed = strand * 17 + wave * 5 + (side > 0 ? 0 : 101);
                        const earlyDissipate = galaxyNoise(seed + 401, waveSeed) < 0.30;
                        const endT = earlyDissipate ? 0.36 + galaxyNoise(seed + 419, waveSeed) * 0.30 : 1.10;
                        const speed = 0.00016 + galaxyNoise(seed + 431, waveSeed) * 0.00010;
                        const head = (galaxyNoise(seed + 443, waveSeed) + now * speed) % 1.22;
                        if (head > endT + 0.10) continue;
                        const cloudT = Math.min(head, endT);
                        const cloudFade = head > endT ? Math.max(0, 1 - (head - endT) / 0.10) : 1;
                        const shimmerRadius = radius * (0.060 + galaxyNoise(seed + 457, waveSeed) * 0.040);
                        const p = strandPoint(side, strand, cloudT, earlyDissipate ? 0 : Math.max(0, head - 1) * 0.18);
                        galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, radius * (0.085 + highlight * 0.010) * fontScale), options)}px Courier New`;
                        galaxyCtx.globalAlpha = (0.34 + highlight * 0.22) * cloudFade * Math.pow(Math.max(0, 1 - Math.abs(cloudT - 0.5) * 0.55), 0.45);
                        galaxyCtx.fillStyle = wave % 2 ? colors[2] || '#ffffff' : '#ffffff';
                        galaxyCtx.fillText(glyphs[(wave + strand) % glyphs.length], p.x, p.y);

                        const dustCount = earlyDissipate || head > 1 ? 3 : 1;
                        galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(4, radius * 0.048 * fontScale), options)}px Courier New`;
                        for (let dust = 0; dust < dustCount; dust++) {
                            const a = galaxyNoise(seed + 467 + dust, waveSeed) * Math.PI * 2;
                            const r = shimmerRadius * galaxyNoise(seed + 479 + dust, waveSeed);
                            galaxyCtx.globalAlpha = (0.16 + highlight * 0.08) * cloudFade * (1 - dust * 0.18);
                            galaxyCtx.fillStyle = dust % 2 ? colors[1] || colors[0] : '#ffffff';
                            galaxyCtx.fillText(glyphs[(dust + wave) % glyphs.length], p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
                        }
                    }
                }

                const debrisCount = Math.max(7, Math.round((9 + highlight * 2) * detail));
                galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(4, radius * 0.055 * fontScale), options)}px Courier New`;
                for (let i = 0; i < debrisCount; i++) {
                    const strand = Math.floor(galaxyNoise(seed + 503, i + (side > 0 ? 0 : 41)) * strandCount) % strandCount;
                    const t = (galaxyNoise(seed + 521, i) + now * (0.00011 + galaxyNoise(seed + 541, i) * 0.00010)) % 1;
                    const p = strandPoint(side, strand, t);
                    const driftAngle = p.angle + (galaxyNoise(seed + 557, i) - 0.5) * 0.8;
                    const drift = radius * 0.075 * galaxyNoise(seed + 563, i) * Math.sin(t * Math.PI);
                    const size = Math.max(4, radius * (0.035 + galaxyNoise(seed + 571, i) * 0.042) * fontScale);
                    galaxyCtx.font = `bold ${getGalaxyFontPx(size, options)}px Courier New`;
                    galaxyCtx.globalAlpha = (0.12 + highlight * 0.10) * Math.pow(Math.max(0, 1 - t), 0.68);
                    galaxyCtx.fillStyle = i % 4 === 0 ? '#ffffff' : colors[i % colors.length];
                    galaxyCtx.fillText(glyphs[i % glyphs.length], p.x + Math.cos(driftAngle) * drift, p.y + Math.sin(driftAngle) * drift);
                }
            }
            galaxyCtx.restore();
        }

        function drawBinaryQuasarCorePulse(galaxy, radius, selected, now, options = {}) {
            const colors = galaxy && galaxy.colors ? galaxy.colors : ['#dcecff', '#8fa7c9', '#ffffff'];
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const seed = galaxy && Number.isFinite(galaxy.seed) ? galaxy.seed : 11;
            const breath = 0.5 + Math.sin(now * 0.0020 + seed * 0.17) * 0.5;
            const slowBreath = 0.5 + Math.sin(now * 0.0012 + seed * 0.41) * 0.5;
            const glowBeat = 0.42 + Math.pow(breath, 1.7) * 0.58;
            const centerHighlight = highlight * 0.22;
            const coreRadius = radius * (0.035 + centerHighlight * 0.006 + glowBeat * 0.010);
            const bloomRadius = radius * (0.25 + centerHighlight * 0.055 + glowBeat * 0.075);
            const haloRadius = radius * (0.50 + centerHighlight * 0.070 + slowBreath * 0.080);
            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'lighter';

            const halo = galaxyCtx.createRadialGradient(0, 0, radius * 0.07, 0, 0, haloRadius);
            halo.addColorStop(0, colorWithAlpha(colors[2] || '#ffffff', 0.13 + centerHighlight * 0.06 + slowBreath * 0.03));
            halo.addColorStop(0.26, colorWithAlpha(colors[0] || '#dcecff', 0.16 + centerHighlight * 0.08 + glowBeat * 0.04));
            halo.addColorStop(0.56, colorWithAlpha(colors[1] || '#8fa7c9', 0.07 + centerHighlight * 0.05));
            halo.addColorStop(1, colorWithAlpha(colors[0] || '#dcecff', 0));
            galaxyCtx.globalAlpha = options.warp ? 0.68 : 1;
            galaxyCtx.fillStyle = halo;
            galaxyCtx.beginPath();
            galaxyCtx.arc(0, 0, haloRadius, 0, Math.PI * 2);
            galaxyCtx.fill();

            const bloom = galaxyCtx.createRadialGradient(0, 0, coreRadius, 0, 0, bloomRadius);
            bloom.addColorStop(0, colorWithAlpha('#ffffff', 0.34 + glowBeat * 0.20 + centerHighlight * 0.10));
            bloom.addColorStop(0.18, colorWithAlpha(colors[2] || '#ffffff', 0.26 + glowBeat * 0.12 + centerHighlight * 0.08));
            bloom.addColorStop(0.44, colorWithAlpha(colors[0] || '#dcecff', 0.18 + centerHighlight * 0.08));
            bloom.addColorStop(0.76, colorWithAlpha(colors[1] || '#8fa7c9', 0.055 + centerHighlight * 0.035));
            bloom.addColorStop(1, colorWithAlpha(colors[1] || '#8fa7c9', 0));
            galaxyCtx.globalAlpha = options.warp ? 0.78 : 1;
            galaxyCtx.shadowColor = colors[2] || '#ffffff';
            galaxyCtx.shadowBlur = glowEnabled && !options.warp ? radius * (0.18 + glowBeat * 0.18 + centerHighlight * 0.09) : 0;
            galaxyCtx.fillStyle = bloom;
            galaxyCtx.beginPath();
            galaxyCtx.arc(0, 0, bloomRadius, 0, Math.PI * 2);
            galaxyCtx.fill();

            galaxyCtx.save();
            galaxyCtx.rotate((now * 0.00018 + seed) % (Math.PI * 2));
            galaxyCtx.scale(1.55 + centerHighlight * 0.18, 0.52 + glowBeat * 0.08);
            const lens = galaxyCtx.createRadialGradient(0, 0, radius * 0.012, 0, 0, radius * (0.22 + glowBeat * 0.060));
            lens.addColorStop(0, colorWithAlpha('#ffffff', 0.13 + centerHighlight * 0.06));
            lens.addColorStop(0.38, colorWithAlpha(colors[0] || '#dcecff', 0.075 + glowBeat * 0.035));
            lens.addColorStop(1, colorWithAlpha(colors[1] || '#8fa7c9', 0));
            galaxyCtx.globalAlpha = 0.82;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.fillStyle = lens;
            galaxyCtx.beginPath();
            galaxyCtx.arc(0, 0, radius * (0.25 + glowBeat * 0.065), 0, Math.PI * 2);
            galaxyCtx.fill();
            galaxyCtx.restore();
            galaxyCtx.restore();
        }

        function projectTensorMiragePoint(coords, radius, spin) {
            let x = coords[0];
            let y = coords[1];
            let z = coords[2];
            let w = coords[3];

            const ca = Math.cos(spin);
            const sa = Math.sin(spin);
            const cb = Math.cos(spin * 0.73 + 0.72);
            const sb = Math.sin(spin * 0.73 + 0.72);
            const cc = Math.cos(spin * -0.58 + 0.46);
            const sc = Math.sin(spin * -0.58 + 0.46);

            let nx = x * ca - z * sa;
            let nz = x * sa + z * ca;
            x = nx;
            z = nz;
            let ny = y * cb - w * sb;
            let nw = y * sb + w * cb;
            y = ny;
            w = nw;
            nx = x * cc - w * sc;
            nw = x * sc + w * cc;
            x = nx;
            w = nw;

            const perspective = 1 / Math.max(1.72, 2.62 - z * 0.28 - w * 0.22);
            return {
                x: x * radius * 0.72 * perspective + w * radius * 0.12,
                y: (y * radius * 0.56 + w * radius * 0.10) * perspective,
                depth: perspective
            };
        }

        function drawTensorMirageWireframe(radius, spin, color, alpha, offsetX, offsetY, lineWidth, options = {}) {
            const points = [];
            for (let i = 0; i < 16; i++) {
                const coords = [
                    (i & 1) ? 1 : -1,
                    (i & 2) ? 1 : -1,
                    (i & 4) ? 1 : -1,
                    (i & 8) ? 1 : -1
                ];
                const p = projectTensorMiragePoint(coords, radius, spin);
                points.push({ x: p.x + offsetX, y: p.y + offsetY, depth: p.depth });
            }

            galaxyCtx.strokeStyle = colorWithAlpha(color, 0.92);
            galaxyCtx.lineWidth = lineWidth;
            galaxyCtx.lineCap = 'round';
            const edgeGlyphs = options.glyphs || TENSOR_MIRAGE_FIELD_GLYPHS;
            const drawGlyphs = !!options.drawGlyphs;
            const fontScale = options.fontScale || 1;
            const glyphAlpha = Number.isFinite(options.glyphAlpha) ? options.glyphAlpha : alpha;
            const edgeGlyphScale = Number.isFinite(options.edgeGlyphScale) ? options.edgeGlyphScale : 1;
            let lastGlyphFont = '';
            const edgeGlyphFonts = drawGlyphs
                ? [0, 1, 2, 3].map(dim => `bold ${getGalaxyFontPx(Math.max(6, radius * (0.076 + dim * 0.009) * edgeGlyphScale * fontScale), options)}px Courier New`)
                : null;
            for (let i = 0; i < 16; i++) {
                for (let dim = 0; dim < 4; dim++) {
                    const j = i ^ (1 << dim);
                    if (j <= i) continue;
                    const a = points[i];
                    const b = points[j];
                    const edgeDepth = Math.max(0.35, Math.min(1, (a.depth + b.depth) * 0.46));
                    if (drawGlyphs) {
                        galaxyCtx.globalAlpha = alpha * edgeDepth * 0.16;
                    } else {
                        galaxyCtx.globalAlpha = alpha * edgeDepth;
                    }
                    if (!drawGlyphs || galaxyCtx.globalAlpha > 0.012) {
                        galaxyCtx.beginPath();
                        galaxyCtx.moveTo(a.x, a.y);
                        galaxyCtx.lineTo(b.x, b.y);
                        galaxyCtx.stroke();
                    }

                    if (drawGlyphs) {
                        const edgeLength = Math.hypot(b.x - a.x, b.y - a.y);
                        const marks = Math.max(dim === 3 ? 3 : 2, Math.min(4, Math.round(edgeLength / Math.max(7, radius * 0.19))));
                        for (let mark = 0; mark < marks; mark++) {
                            const t = (mark + 0.5) / marks;
                            const px = a.x + (b.x - a.x) * t;
                            const py = a.y + (b.y - a.y) * t;
                            const glyph = edgeGlyphs[(i * 5 + j * 3 + dim + mark) % edgeGlyphs.length];
                            const nextFont = edgeGlyphFonts[dim];
                            if (nextFont !== lastGlyphFont) {
                                galaxyCtx.font = nextFont;
                                lastGlyphFont = nextFont;
                            }
                            const edgeFade = 0.76 + Math.sin(t * Math.PI) * 0.24;
                            galaxyCtx.globalAlpha = glyphAlpha * edgeDepth * edgeFade * (dim === 3 ? 0.88 : 0.76);
                            galaxyCtx.fillStyle = dim === 3 || mark === 0 ? colorWithAlpha('#ffffff', 0.92) : colorWithAlpha(color, 0.90);
                            galaxyCtx.fillText(glyph, px, py);
                        }
                    }
                }
            }

            galaxyCtx.fillStyle = colorWithAlpha(color, 0.86);
            for (let i = 0; i < points.length; i++) {
                if (i % 3 === 1) continue;
                const p = points[i];
                if (drawGlyphs) {
                    const glyph = edgeGlyphs[(i * 7 + 3) % edgeGlyphs.length];
                    const fontSize = getGalaxyFontPx(Math.max(6, radius * 0.092 * Math.min(1.45, p.depth) * edgeGlyphScale * fontScale), options);
                    const nextFont = `bold ${fontSize}px Courier New`;
                    if (nextFont !== lastGlyphFont) {
                        galaxyCtx.font = nextFont;
                        lastGlyphFont = nextFont;
                    }
                    galaxyCtx.globalAlpha = glyphAlpha * 0.90;
                    galaxyCtx.fillStyle = i % 4 === 0 ? '#ffffff' : colorWithAlpha(color, 0.92);
                    galaxyCtx.fillText(glyph, p.x, p.y);
                } else {
                    const size = Math.max(1.4, radius * 0.012 * Math.min(1.5, p.depth));
                    galaxyCtx.globalAlpha = alpha * 0.75;
                    galaxyCtx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
                }
            }
        }

        function drawTensorMirageGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#6aa8ff', '#ff5e8a', '#dcecff'];
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00010 + index) * 0.04);
            const spin = now * 0.00012 * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, now, highlight);
            const fontScale = options.fontScale || 1;
            const detail = options.detail || 1;
            const warpMode = !!options.warp;
            const availableAlpha = galaxy.available ? 1 : 0.48;
            const lensPulse = 0.5 + Math.sin(now * 0.0021 + index) * 0.5;

            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.rotate(axis * 0.18);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'screen';
            drawGalaxySoftAura(colors, radius, selected, 0.78 + glowPulse * 0.12, highlight);

            const ghostSpread = radius * (0.026 + highlight * 0.012);
            if (glowEnabled && !warpMode) {
                galaxyCtx.shadowColor = colors[0];
                galaxyCtx.shadowBlur = 5 + highlight * 6 + glowPulse * 3;
            }
            const tensorGlyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length
                ? galaxy.glyphs
                : TENSOR_MIRAGE_FIELD_GLYPHS;
            drawTensorMirageWireframe(radius, spin - 0.11, '#ff5e8a', (0.18 + highlight * 0.10) * availableAlpha, -ghostSpread, ghostSpread * 0.65, Math.max(0.8, radius * 0.009));
            drawTensorMirageWireframe(radius, spin + 0.10, '#ffe88a', (0.14 + highlight * 0.08) * availableAlpha, ghostSpread * 0.78, -ghostSpread * 0.55, Math.max(0.8, radius * 0.008));
            drawTensorMirageWireframe(radius, spin, colors[0], (0.36 + highlight * 0.20) * availableAlpha, 0, 0, Math.max(1, radius * 0.014), {
                ...options,
                drawGlyphs: true,
                glyphs: tensorGlyphs,
                glyphAlpha: (0.42 + highlight * 0.24) * availableAlpha,
                edgeGlyphScale: 1.18
            });
            galaxyCtx.shadowBlur = 0;

            galaxyCtx.save();
            galaxyCtx.rotate(-axis * 0.42);
            galaxyCtx.globalAlpha = (0.17 + highlight * 0.12 + lensPulse * 0.04) * availableAlpha;
            galaxyCtx.strokeStyle = colorWithAlpha('#ffffff', 0.46);
            galaxyCtx.lineWidth = Math.max(1, radius * 0.012);
            galaxyCtx.beginPath();
            for (let i = 0; i <= 20; i++) {
                const t = i / 20;
                const px = (t - 0.5) * radius * 1.46;
                const py = Math.sin(t * Math.PI * 2.6 + now * 0.002) * radius * (0.045 + highlight * 0.016);
                if (i === 0) galaxyCtx.moveTo(px, py);
                else galaxyCtx.lineTo(px, py);
            }
            galaxyCtx.stroke();
            galaxyCtx.globalAlpha = (0.10 + highlight * 0.08) * availableAlpha;
            galaxyCtx.strokeStyle = colorWithAlpha(colors[2], 0.58);
            galaxyCtx.beginPath();
            galaxyCtx.ellipse(0, 0, radius * 0.86, radius * 0.24, 0, 0, Math.PI * 2);
            galaxyCtx.stroke();
            galaxyCtx.restore();

            const fieldCount = Math.max(14, Math.round((18 + highlight * 5) * detail));
            let lastFont = '';
            for (let i = 0; i < fieldCount; i++) {
                const noise = galaxyNoise((galaxy.seed || 101) + 1701, i);
                const a = spin * 0.8 + noise * Math.PI * 2 + i * 0.62;
                const r = radius * (0.50 + galaxyNoise((galaxy.seed || 101) + 1723, i) * 0.74);
                const wave = Math.sin(now * 0.0017 + i * 1.31) * radius * 0.025;
                const px = Math.cos(a) * r + Math.cos(axis + Math.PI / 2) * wave;
                const py = Math.sin(a) * r * 0.58 + Math.sin(axis + Math.PI / 2) * wave;
                const fontSize = getGalaxyFontPx(Math.max(5, (6.8 + galaxyNoise((galaxy.seed || 101) + 1741, i) * 3.5 + highlight) * fontScale), options);
                const nextFont = `bold ${fontSize}px Courier New`;
                if (nextFont !== lastFont) {
                    galaxyCtx.font = nextFont;
                    lastFont = nextFont;
                }
                galaxyCtx.globalAlpha = (0.18 + highlight * 0.12) * (0.66 + noise * 0.34) * availableAlpha;
                galaxyCtx.fillStyle = i % 5 === 0 ? '#ffffff' : (i % 3 === 0 ? '#ffe88a' : (i % 2 ? colors[1] : colors[0]));
                galaxyCtx.fillText(tensorGlyphs[i % tensorGlyphs.length], px, py);
            }

            galaxyCtx.globalCompositeOperation = 'source-over';
            galaxyCtx.globalAlpha = (0.72 + highlight * 0.22) * availableAlpha;
            galaxyCtx.shadowColor = colors[2];
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (9 + highlight * 8 + glowPulse * 4) : 0;
            galaxyCtx.fillStyle = colors[2] || '#dcecff';
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(13, (25 + highlight * 4) * fontScale), options)}px Courier New`;
            galaxyCtx.fillText('\u2297', 0, 0);
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.fillStyle = colorWithAlpha('#061020', 0.84);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, (13 + highlight * 2) * fontScale), options)}px Courier New`;
            galaxyCtx.fillText('\u03BB', 0, 0);

            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function drawMatrixNebulaCloud(galaxy, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#007a3a', '#25b85b', '#f2fff6'];
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            for (let i = 0; i < 12; i++) {
                const a = galaxyNoise((galaxy.seed || 29) + 500, i) * Math.PI * 2 + now * 0.00005 * (i % 2 ? 1 : -1);
                const r = radius * (0.18 + galaxyNoise((galaxy.seed || 29) + 521, i) * 0.74);
                const blobX = Math.cos(a) * r * (0.85 + galaxyNoise(index + 41, i) * 0.35);
                const blobY = Math.sin(a) * r * (0.38 + galaxyNoise(index + 51, i) * 0.24);
                const blobR = radius * (0.14 + galaxyNoise(index + 61, i) * 0.20);
                const whiteGas = i % 5 === 0;
                const grad = galaxyCtx.createRadialGradient(blobX, blobY, 0, blobX, blobY, blobR);
                grad.addColorStop(0, colorWithAlpha(whiteGas ? '#f2fff6' : colors[i % 2], 0.08 + highlight * 0.08));
                grad.addColorStop(1, colorWithAlpha(colors[0], 0));
                galaxyCtx.fillStyle = grad;
                galaxyCtx.globalAlpha = 1;
                galaxyCtx.beginPath();
                galaxyCtx.arc(blobX, blobY, blobR, 0, Math.PI * 2);
                galaxyCtx.fill();
            }
            galaxyCtx.restore();
        }

        function drawMatrixNebulaRain(galaxy, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#007a3a', '#25b85b', '#f2fff6'];
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00009 + (galaxy.seed || index)) * 0.035);
            const tilt = options.tiltOverride ?? (profile.tilt || galaxy.tilt || 0.46);
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const seed = galaxy.seed || 29;
            const columnCount = Math.max(8, Math.round((10 + highlight * 4) * detail));
            const cloudPocketCount = Math.max(3, Math.round((4 + highlight * 2) * detail));
            const drawPocketGlow = !options.skipPocketGlow;
            const pocketsOnly = !!options.pocketsOnly;
            const baseFont = getGalaxyFontPx(Math.max(6, (8.9 + highlight * 2.6) * fontScale), options);
            const flash = 0.5 + Math.sin(now * 0.0032 + index * 1.7) * 0.5;
            const morphBucket = Math.floor(now / 130);

            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            galaxyCtx.rotate(axis * 0.55);
            galaxyCtx.scale(1, 0.72 + tilt * 0.28);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';

            const pockets = [];
            for (let pocket = 0; pocket < cloudPocketCount; pocket++) {
                const cloudAngle = galaxyNoise(seed + 701, pocket) * Math.PI * 2;
                const cloudRadius = radius * (0.10 + galaxyNoise(seed + 719, pocket) * 0.72);
                const cloudX = Math.cos(cloudAngle) * cloudRadius * (0.86 + galaxyNoise(seed + 733, pocket) * 0.20);
                const cloudY = Math.sin(cloudAngle) * cloudRadius * (0.42 + galaxyNoise(seed + 751, pocket) * 0.18);
                const cloudW = radius * (0.18 + galaxyNoise(seed + 769, pocket) * 0.24) * (0.94 + highlight * 0.12);
                const cloudH = radius * (0.14 + galaxyNoise(seed + 787, pocket) * 0.14) * (0.94 + highlight * 0.12);
                const breathe = 0.5 + Math.sin(now * (0.00115 + galaxyNoise(seed + 803, pocket) * 0.00062) + pocket * 1.37) * 0.5;
                pockets.push({ x: cloudX, y: cloudY, w: cloudW, h: cloudH, breathe });
                if (drawPocketGlow) {
                    const cloudAlpha = (0.13 + highlight * 0.13) * (0.38 + breathe * 0.62);
                    const cloudGrad = galaxyCtx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudW);
                    cloudGrad.addColorStop(0, colorWithAlpha(pocket % 4 === 0 ? '#d8ffe0' : colors[1], cloudAlpha));
                    cloudGrad.addColorStop(0.48, colorWithAlpha(colors[0], cloudAlpha * 0.44));
                    cloudGrad.addColorStop(1, colorWithAlpha(colors[0], 0));
                    galaxyCtx.globalAlpha = 1;
                    galaxyCtx.fillStyle = cloudGrad;
                    galaxyCtx.beginPath();
                    galaxyCtx.ellipse(cloudX, cloudY, cloudW, cloudH, (galaxyNoise(seed + 821, pocket) - 0.5) * 0.72, 0, Math.PI * 2);
                    galaxyCtx.fill();
                }
            }

            if (pocketsOnly) {
                galaxyCtx.shadowBlur = 0;
                galaxyCtx.restore();
                return;
            }

            let lastFont = '';
            for (let column = 0; column < columnCount; column++) {
                const x = (galaxyNoise(seed + 839, column) - 0.5) * radius * 1.88;
                const fontSize = Math.max(5, Math.round(baseFont * (0.88 + galaxyNoise(seed + 857, column) * 0.34)));
                const gap = fontSize * (1.02 + galaxyNoise(seed + 877, column) * 0.20);
                const length = 5 + Math.floor(galaxyNoise(seed + 891, column) * 2 + highlight * 1.4);
                const speed = 0.000105 + galaxyNoise(seed + 907, column) * 0.000075 + highlight * 0.000035;
                const travel = radius * 1.82 + length * gap;
                const phase = (galaxyNoise(seed + 929, column) + now * speed) % 1;
                const headY = -radius * 0.94 + phase * travel;
                const drift = Math.sin(now * (0.0010 + galaxyNoise(seed + 947, column) * 0.0007) + column) * radius * 0.018;
                const colX = x + drift;
                const nextFont = `bold ${fontSize}px Courier New`;
                if (nextFont !== lastFont) {
                    galaxyCtx.font = nextFont;
                    lastFont = nextFont;
                }

                galaxyCtx.lineWidth = Math.max(1, radius * (0.009 + highlight * 0.0026));
                const trailEndY = headY - (length - 1) * gap;
                const headMask = 1 - Math.min(1, Math.pow(colX / (radius * 1.08), 2) + Math.pow(headY / (radius * 0.82), 2));
                const tailMask = 1 - Math.min(1, Math.pow(colX / (radius * 1.08), 2) + Math.pow(trailEndY / (radius * 0.82), 2));
                const trailMask = Math.max(0, Math.min(1, Math.max(headMask, tailMask)));
                if (trailMask > 0.02) {
                    let trailCloudMask = 0.20;
                    for (let pocket = 0; pocket < pockets.length; pocket++) {
                        const p = pockets[pocket];
                        const px = (colX - p.x) / Math.max(1, p.w);
                        const midY = (headY + trailEndY) * 0.5;
                        const py = (midY - p.y) / Math.max(1, p.h);
                        const pocketMask = Math.max(0, 1 - px * px - py * py);
                        trailCloudMask = Math.max(trailCloudMask, pocketMask * (0.56 + p.breathe * 0.44));
                    }
                    const trailAlpha = Math.min(0.68, (0.30 + highlight * 0.20) * trailMask * trailCloudMask);
                    galaxyCtx.globalAlpha = trailAlpha;
                    const trailGradient = galaxyCtx.createLinearGradient(colX, trailEndY, colX, headY + fontSize * 0.45);
                    trailGradient.addColorStop(0, colorWithAlpha(colors[1], 0));
                    trailGradient.addColorStop(0.48, colorWithAlpha('#7dff95', 0.42));
                    trailGradient.addColorStop(1, colorWithAlpha('#d8ffe0', 0.82));
                    galaxyCtx.strokeStyle = trailGradient;
                    galaxyCtx.beginPath();
                    galaxyCtx.moveTo(colX, trailEndY);
                    galaxyCtx.lineTo(colX, headY + fontSize * 0.45);
                    galaxyCtx.stroke();
                }
                for (let glyphIndex = 0; glyphIndex < length; glyphIndex++) {
                    const gy = headY - glyphIndex * gap;
                    const ellipseMask = 1 - Math.min(1, Math.pow(colX / (radius * 1.08), 2) + Math.pow(gy / (radius * 0.82), 2));
                    if (ellipseMask <= 0.015) continue;
                    let cloudMask = 0.24;
                    for (let pocket = 0; pocket < pockets.length; pocket++) {
                        const p = pockets[pocket];
                        const px = (colX - p.x) / Math.max(1, p.w);
                        const py = (gy - p.y) / Math.max(1, p.h);
                        const pocketMask = Math.max(0, 1 - px * px - py * py);
                        cloudMask = Math.max(cloudMask, pocketMask * (0.58 + p.breathe * 0.42));
                    }
                    const glyphNoise = galaxyNoise(seed + 971 + morphBucket + column * 23, glyphIndex);
                    const glyph = MATRIX_NEBULA_RAIN_GLYPHS[Math.floor(glyphNoise * MATRIX_NEBULA_RAIN_GLYPHS.length) % MATRIX_NEBULA_RAIN_GLYPHS.length];
                    const head = glyphIndex === 0;
                    const tailT = 1 - glyphIndex / Math.max(1, length - 1);
                    const flicker = 0.78 + Math.sin(now * 0.006 + column * 1.3 + glyphIndex * 1.71) * 0.22;
                    const alpha = Math.max(0.060, (head ? 1.08 : 0.42 + tailT * 0.48) * ellipseMask * cloudMask * (1.02 + highlight * 0.44) * flicker);
                    if (glyphIndex === length - 1) {
                        galaxyCtx.globalAlpha = alpha * 0.46;
                        galaxyCtx.strokeStyle = colorWithAlpha(colors[1], 0.66);
                        galaxyCtx.beginPath();
                        galaxyCtx.moveTo(colX, gy);
                        galaxyCtx.lineTo(colX, headY + fontSize * 0.35);
                        galaxyCtx.stroke();
                    }
                    galaxyCtx.globalAlpha = Math.min(1, alpha);
                    galaxyCtx.fillStyle = head
                        ? (glyphNoise > 0.72 ? '#ffffff' : '#d8ffe0')
                        : (glyphIndex % 4 === 0 ? '#8ff7ff' : (glyphIndex % 3 === 0 ? '#baffc8' : colors[1]));
                    galaxyCtx.shadowColor = head ? '#d8ffe0' : colors[1];
                    galaxyCtx.shadowBlur = glowEnabled && head
                        ? (12 + highlight * 6) * cloudMask
                        : 0;
                    galaxyCtx.fillText(glyph, colX + (galaxyNoise(seed + 991 + glyphIndex, column) - 0.5) * radius * 0.018, gy);
                    if (head && cloudMask > 0.26) {
                        const glint = Math.min(0.94, alpha * 0.86);
                        const glintSize = Math.max(3, fontSize * 0.58);
                        const glintX = colX + fontSize * (0.18 + galaxyNoise(seed + 1009, column) * 0.16);
                        const glintY = gy - fontSize * (0.12 + galaxyNoise(seed + 1021, column) * 0.12);
                        galaxyCtx.shadowBlur = 0;
                        galaxyCtx.globalAlpha = glint;
                        galaxyCtx.strokeStyle = colorWithAlpha('#ffffff', 0.96);
                        galaxyCtx.lineWidth = Math.max(1, radius * 0.0048);
                        galaxyCtx.beginPath();
                        galaxyCtx.moveTo(glintX - glintSize, glintY);
                        galaxyCtx.lineTo(glintX + glintSize, glintY);
                        galaxyCtx.moveTo(glintX, glintY - glintSize);
                        galaxyCtx.lineTo(glintX, glintY + glintSize);
                        galaxyCtx.stroke();
                    }
                }
            }

            galaxyCtx.shadowBlur = 0;
            galaxyCtx.restore();
        }

        function drawFractalCounterHalo(galaxy, radius, selected, now, index, options = {}) {
            const profile = getGalaxyVisualProfile(index);
            const spin = -now * 0.00018 * (profile.spinSpeed || 1);
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const count = Math.round((44 + highlight * 14) * (options.detail || 1));
            const axis = profile.axis - 0.18;
            const tilt = 0.42;
            const cosAxis = Math.cos(axis);
            const sinAxis = Math.sin(axis);
            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, radius * 0.09 * (options.fontScale || 1)), options)}px Courier New`;
            for (let i = 0; i < count; i++) {
                const a = (i / count) * Math.PI * 2 + spin;
                const jitter = (galaxyNoise((galaxy.seed || 47) + 801, i) - 0.5) * radius * 0.08;
                const localX = Math.cos(a) * (radius * 1.14 + jitter);
                const localY = Math.sin(a) * (radius * 0.58 + jitter * 0.35) * tilt;
                const x = localX * cosAxis - localY * sinAxis;
                const y = localX * sinAxis + localY * cosAxis;
                galaxyCtx.globalAlpha = 0.18 + highlight * 0.16;
                galaxyCtx.fillStyle = i % 7 === 0 ? '#fff7b8' : '#ffd65e';
                galaxyCtx.fillText(i % 4 === 0 ? '*' : '.', x, y);
            }
            galaxyCtx.restore();
        }

        function drawFractalHaloStorm(galaxy, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#ff7ab8', '#8fb8ff', '#fff0fa'];
            const profile = getGalaxyVisualProfile(index);
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const axis = options.axisOverride ?? (profile.axis - 0.18);
            const seed = galaxy.seed || 47;
            const flashCount = Math.max(5, Math.round((7 + highlight * 3) * detail));
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length
                ? galaxy.glyphs
                : ['{', '}', '(', ')', '∞', '∂', '∑', '.'];
            const morphBucket = Math.floor(now / 260);
            const baseFont = getGalaxyFontPx(Math.max(7, (8.4 + highlight * 2.1) * fontScale), options);

            galaxyCtx.save();
            galaxyCtx.globalCompositeOperation = 'screen';
            galaxyCtx.rotate(axis * 0.48);
            galaxyCtx.scale(1, 0.58);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';

            let lastFont = '';
            for (let i = 0; i < flashCount; i++) {
                const angle = galaxyNoise(seed + 1101, i) * Math.PI * 2;
                const r = radius * (0.14 + galaxyNoise(seed + 1117, i) * 0.84);
                const x = Math.cos(angle) * r * (0.95 + galaxyNoise(seed + 1129, i) * 0.18);
                const y = Math.sin(angle) * r * (0.50 + galaxyNoise(seed + 1151, i) * 0.20);
                const mask = 1 - Math.min(1, Math.pow(x / (radius * 1.12), 2) + Math.pow(y / (radius * 0.82), 2));
                if (mask <= 0.03) continue;

                const pulse = Math.max(0, Math.sin(now * (0.0022 + galaxyNoise(seed + 1163, i) * 0.0017) + galaxyNoise(seed + 1171, i) * Math.PI * 2));
                const flash = Math.pow(pulse, 5.5) * mask * (0.68 + highlight * 0.44);
                const idleSpark = (0.08 + highlight * 0.05) * mask * (0.55 + Math.sin(now * 0.0012 + i) * 0.45);
                const alpha = Math.min(1, idleSpark + flash);
                if (alpha <= 0.018) continue;

                const pocketR = radius * (0.10 + galaxyNoise(seed + 1187, i) * 0.13) * (0.85 + flash * 0.45);
                const grad = galaxyCtx.createRadialGradient(x, y, 0, x, y, pocketR);
                grad.addColorStop(0, colorWithAlpha(i % 4 === 0 ? '#ffffff' : colors[2] || '#fff0fa', 0.20 + flash * 0.34));
                grad.addColorStop(0.44, colorWithAlpha(i % 2 ? colors[1] || '#8fb8ff' : colors[0] || '#ff7ab8', 0.13 + flash * 0.24));
                grad.addColorStop(1, colorWithAlpha(colors[0] || '#ff7ab8', 0));
                galaxyCtx.globalAlpha = alpha;
                galaxyCtx.fillStyle = grad;
                galaxyCtx.beginPath();
                galaxyCtx.arc(x, y, pocketR, 0, Math.PI * 2);
                galaxyCtx.fill();

                galaxyCtx.lineCap = 'round';
                galaxyCtx.lineWidth = Math.max(1, radius * (0.004 + flash * 0.006));
                for (let shard = 0; shard < 3; shard++) {
                    const shardAngle = angle + shard * Math.PI * 2 / 3 + now * 0.00018 * (shard % 2 ? -1 : 1);
                    const shardLen = radius * (0.08 + flash * 0.13) * (0.72 + galaxyNoise(seed + 1201 + shard, i) * 0.45);
                    galaxyCtx.globalAlpha = Math.min(0.84, alpha * (0.34 + flash * 0.55));
                    galaxyCtx.strokeStyle = colorWithAlpha(shard % 2 ? colors[1] || '#8fb8ff' : colors[0] || '#ff7ab8', 0.82);
                    galaxyCtx.beginPath();
                    galaxyCtx.moveTo(x - Math.cos(shardAngle) * shardLen * 0.32, y - Math.sin(shardAngle) * shardLen * 0.32);
                    galaxyCtx.lineTo(x + Math.cos(shardAngle) * shardLen, y + Math.sin(shardAngle) * shardLen);
                    galaxyCtx.stroke();
                }

                const fontSize = Math.max(6, Math.round(baseFont * (0.86 + galaxyNoise(seed + 1229, i) * 0.46) * (1 + flash * 0.16)));
                const nextFont = `bold ${fontSize}px Courier New`;
                if (nextFont !== lastFont) {
                    galaxyCtx.font = nextFont;
                    lastFont = nextFont;
                }

                const glyphNoise = galaxyNoise(seed + 1249 + morphBucket, i);
                const glyph = glyphs[Math.floor(glyphNoise * glyphs.length) % glyphs.length];
                galaxyCtx.globalAlpha = Math.min(0.96, alpha * (0.58 + flash * 0.50));
                galaxyCtx.fillStyle = glyphNoise > 0.78 ? '#ffffff' : (i % 3 === 0 ? colors[2] || '#fff0fa' : (i % 2 ? colors[1] || '#8fb8ff' : colors[0] || '#ff7ab8'));
                galaxyCtx.shadowColor = galaxyCtx.fillStyle;
                galaxyCtx.shadowBlur = glowEnabled ? (5 + flash * 12 + highlight * 4) * mask : 0;
                galaxyCtx.fillText(glyph, x, y);

                if (flash > 0.16) {
                    const glintSize = Math.max(3, fontSize * (0.36 + flash * 0.28));
                    galaxyCtx.shadowBlur = 0;
                    galaxyCtx.globalAlpha = Math.min(0.53, flash * 0.52);
                    galaxyCtx.strokeStyle = colorWithAlpha('#ffffff', 0.55);
                    galaxyCtx.lineWidth = Math.max(1, radius * 0.0042);
                    galaxyCtx.beginPath();
                    galaxyCtx.moveTo(x - glintSize, y);
                    galaxyCtx.lineTo(x + glintSize, y);
                    galaxyCtx.moveTo(x, y - glintSize);
                    galaxyCtx.lineTo(x, y + glintSize);
                    galaxyCtx.stroke();
                }
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
        }

        function drawKernelCoronaGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#ff8a1c', '#ff5f00', '#7cc7ff'];
            const profile = getGalaxyVisualProfile(index);
            const axis = (options.axisOverride ?? profile.axis) - 0.14;
            const tilt = 0.34;
            const spin = now * 0.00010 * (profile.spinDir || 1);
            const fontScale = options.fontScale || 1;
            const detail = options.detail || 1;
            const warpMode = !!options.warp;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, now, highlight);
            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'screen';
            drawGalaxySoftAura([colors[0], '#ff9a1f', galaxy.coreColor || colors[2]], radius, selected, 0.92 + glowPulse * 0.14, highlight);
            galaxyCtx.rotate(axis);
            galaxyCtx.scale(1, tilt);

            const coronaCount = Math.round((58 + highlight * 16) * detail);
            for (let ring = 0; ring < 3; ring++) {
                const ringR = radius * (0.84 + ring * 0.13);
                const wobble = 0.07 + ring * 0.035;
                galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(6, (9 + ring * 2) * fontScale), options)}px Courier New`;
                for (let i = 0; i < coronaCount; i++) {
                    const a = (i / coronaCount) * Math.PI * 2 + spin * (1 + ring * 0.42);
                    const flame = 1 + Math.sin(a * 9 + now * 0.002 + ring) * wobble;
                    const px = Math.cos(a) * ringR * flame;
                    const py = Math.sin(a) * ringR * flame;
                    galaxyCtx.globalAlpha = (0.30 + highlight * 0.22) * (ring === 1 ? 1 : 0.72);
                    galaxyCtx.fillStyle = ring === 0 ? '#ff4f00' : (i % 5 === 0 ? '#ffc073' : '#ff761b');
                    galaxyCtx.fillText(i % 3 === 0 ? '/' : (i % 3 === 1 ? '\\' : '|'), px, py);
                }
            }

            galaxyCtx.globalCompositeOperation = 'source-over';
            galaxyCtx.globalAlpha = galaxy.available ? (0.66 + highlight * 0.26) : (0.25 + highlight * 0.07);
            galaxyCtx.strokeStyle = colorWithAlpha('#ff8a1c', 0.48 + highlight * 0.30);
            galaxyCtx.lineWidth = Math.max(2, radius * 0.035);
            galaxyCtx.beginPath();
            galaxyCtx.ellipse(0, 0, radius * 0.76, radius * 0.38, 0, 0, Math.PI * 2);
            galaxyCtx.stroke();

            galaxyCtx.globalAlpha = 0.72 + highlight * 0.23;
            galaxyCtx.fillStyle = '#7cc7ff';
            galaxyCtx.shadowColor = '#7cc7ff';
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (9 + highlight * 9 + glowPulse * 4) : 0;
            galaxyCtx.beginPath();
            galaxyCtx.ellipse(0, 0, radius * 0.30, radius * 0.30, 0, 0, Math.PI * 2);
            galaxyCtx.fill();
            galaxyCtx.fillStyle = '#031022';
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.beginPath();
            galaxyCtx.ellipse(0, 0, radius * 0.085, radius * 0.11, 0, 0, Math.PI * 2);
            galaxyCtx.fill();
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function drawBitshiftSphereGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#ff4f4a', '#ff9a73', '#fff1e8'];
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00008 + index) * 0.03);
            const spin = now * 0.00013 * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const warpMode = !!options.warp;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, now, highlight);
            const availableAlpha = galaxy.available ? 1 : 0.38;
            const phase = spin * 2.3;
            const helixLength = radius * (1.54 + highlight * 0.08);
            const helixAmp = radius * (0.38 + highlight * 0.035);
            const helixTurns = 1.38;
            const stepCount = Math.max(18, Math.round((28 + highlight * 6) * detail));
            const rungCount = Math.max(8, Math.round((10 + highlight * 3) * detail));
            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length
                ? galaxy.glyphs
                : ['<', '>', '^', 'v', '/', '\\', '0', '1'];
            const helixPoint = (t, strand) => {
                const angle = (t - 0.5) * Math.PI * 2 * helixTurns + phase + strand * Math.PI;
                const taper = 0.76 + Math.sin(t * Math.PI) * 0.24;
                const wave = Math.sin(angle);
                const depth = 0.5 + Math.cos(angle) * 0.5;
                return {
                    x: wave * helixAmp * taper,
                    y: (t - 0.5) * helixLength + (depth - 0.5) * radius * 0.10,
                    depth,
                    angle
                };
            };

            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.rotate(axis);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'screen';
            drawGalaxySoftAura(colors, radius, selected, 0.86 + glowPulse * 0.13, highlight);

            galaxyCtx.strokeStyle = colorWithAlpha(colors[1], 0.15 + highlight * 0.13);
            galaxyCtx.lineWidth = 1;
            for (let ring = -2; ring <= 2; ring++) {
                const yRing = ring * radius * 0.18;
                const ringScale = Math.sqrt(Math.max(0.08, 1 - Math.abs(ring) * 0.18));
                galaxyCtx.globalAlpha = 0.20 + highlight * 0.15;
                galaxyCtx.beginPath();
                galaxyCtx.ellipse(0, yRing, radius * 0.74 * ringScale, radius * 0.18, spin + ring * 0.12, 0, Math.PI * 2);
                galaxyCtx.stroke();
            }

            galaxyCtx.lineCap = 'round';
            galaxyCtx.lineJoin = 'round';

            for (let i = 0; i < rungCount; i++) {
                const t = 0.08 + (i / Math.max(1, rungCount - 1)) * 0.84;
                const a = helixPoint(t, 0);
                const b = helixPoint(t, 1);
                const depth = (a.depth + b.depth) * 0.5;
                const rungColor = i % 3 === 0 ? colors[2] : (i % 2 ? colors[1] : colors[0]);
                galaxyCtx.globalAlpha = (0.05 + highlight * 0.04 + depth * 0.03) * availableAlpha;
                galaxyCtx.strokeStyle = colorWithAlpha(rungColor, 0.68);
                galaxyCtx.lineWidth = Math.max(0.7, radius * (0.006 + depth * 0.003 + highlight * 0.001));
                galaxyCtx.beginPath();
                galaxyCtx.moveTo(a.x, a.y);
                galaxyCtx.lineTo(b.x, b.y);
                galaxyCtx.stroke();

                const rungMarks = i % 3 === 0 ? 2 : 1;
                for (let mark = 0; mark < rungMarks; mark++) {
                    const mix = rungMarks === 1 ? 0.5 : 0.34 + mark * 0.32;
                    const midX = a.x + (b.x - a.x) * mix;
                    const midY = a.y + (b.y - a.y) * mix;
                    const glyph = glyphs[(i * 3 + mark + (depth > 0.55 ? 1 : 0)) % glyphs.length];
                    galaxyCtx.globalAlpha = (0.20 + highlight * 0.12 + depth * 0.10) * availableAlpha;
                    galaxyCtx.fillStyle = depth > 0.58 ? colors[2] : rungColor;
                    galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(6, radius * (0.082 + depth * 0.020) * fontScale), options)}px Courier New`;
                    galaxyCtx.fillText(glyph, midX, midY);
                }

                if (i % 2 === 0) {
                    const midX = (a.x + b.x) * 0.5;
                    const midY = (a.y + b.y) * 0.5;
                    galaxyCtx.globalAlpha = (0.10 + highlight * 0.06) * availableAlpha;
                    galaxyCtx.fillStyle = colors[2];
                    galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, radius * 0.060 * fontScale), options)}px Courier New`;
                    galaxyCtx.fillText(i % 4 === 0 ? '0' : '1', midX, midY);
                }
            }

            for (let strand = 0; strand < 2; strand++) {
                const strandColor = strand === 0 ? colors[0] : colors[1];
                for (let i = 1; i < stepCount; i++) {
                    const t0 = (i - 1) / Math.max(1, stepCount - 1);
                    const t1 = i / Math.max(1, stepCount - 1);
                    const p0 = helixPoint(t0, strand);
                    const p1 = helixPoint(t1, strand);
                    const depth = (p0.depth + p1.depth) * 0.5;
                    galaxyCtx.globalAlpha = (0.045 + depth * 0.055 + highlight * 0.035) * availableAlpha;
                    galaxyCtx.strokeStyle = depth > 0.56
                        ? colorWithAlpha(colors[2], 0.92)
                        : colorWithAlpha(strandColor, 0.86);
                    galaxyCtx.lineWidth = Math.max(0.7, radius * (0.006 + depth * 0.004 + highlight * 0.001));
                    if (glowEnabled && !warpMode && depth > 0.62) {
                        galaxyCtx.shadowColor = strandColor;
                        galaxyCtx.shadowBlur = 2 + depth * 4 + highlight * 3;
                    } else {
                        galaxyCtx.shadowBlur = 0;
                    }
                    galaxyCtx.beginPath();
                    galaxyCtx.moveTo(p0.x, p0.y);
                    galaxyCtx.lineTo(p1.x, p1.y);
                    galaxyCtx.stroke();

                    if (i % 2 === 0 || depth > 0.62) {
                        const midT = (t0 + t1) * 0.5;
                        const p = helixPoint(midT, strand);
                        const glyphIndex = (strand * 5 + i * 3 + Math.floor(depth * 7)) % glyphs.length;
                        const glyph = glyphs[glyphIndex];
                        const fontSize = getGalaxyFontPx(Math.max(6, radius * (0.078 + depth * 0.026 + highlight * 0.006) * fontScale), options);
                        galaxyCtx.font = `bold ${fontSize}px Courier New`;
                        galaxyCtx.globalAlpha = (0.24 + depth * 0.20 + highlight * 0.12) * availableAlpha;
                        galaxyCtx.fillStyle = depth > 0.58 ? colors[2] : strandColor;
                        galaxyCtx.shadowColor = strandColor;
                        galaxyCtx.shadowBlur = glowEnabled && !warpMode && depth > 0.60 ? 4 + depth * 5 + highlight * 4 : 0;
                        galaxyCtx.fillText(glyph, p.x, p.y);
                    }
                }
            }

            galaxyCtx.shadowBlur = 0;
            const points = Math.round((70 + highlight * 20) * detail);
            let lastFont = '';
            for (let i = 0; i < points; i++) {
                const t = i / Math.max(1, points - 1);
                const a = t * Math.PI * 2.8 + spin * 2;
                const r = radius * (0.12 + t * 0.76);
                const sphere = Math.sin(t * Math.PI);
                const px = Math.cos(a) * r * (0.72 + sphere * 0.28);
                const py = Math.sin(a) * r * 0.52 + Math.cos(t * Math.PI * 2 + spin) * radius * 0.14 * sphere;
                const fontSize = getGalaxyFontPx(Math.max(6, (8 + sphere * 8) * fontScale), options);
                const nextFont = `bold ${fontSize}px Courier New`;
                if (nextFont !== lastFont) {
                    galaxyCtx.font = nextFont;
                    lastFont = nextFont;
                }
                galaxyCtx.globalAlpha = (0.44 + highlight * 0.28) * (0.48 + sphere * 0.52);
                galaxyCtx.fillStyle = i % 9 === 0 ? colors[2] : (i % 2 ? colors[0] : colors[1]);
                galaxyCtx.fillText(i % 4 === 0 ? '1' : (i % 4 === 1 ? '0' : (i % 4 === 2 ? '<' : '>')), px, py);
            }
            drawGalaxyCore(galaxy, colors, radius, selected, 0, 0.62, options);
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function drawPrismArrayVectorGlyph(size, x, y, angle, variant = 0) {
            const s = Math.max(3, size * 0.54);
            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.rotate(angle);
            galaxyCtx.beginPath();
            galaxyCtx.moveTo(0, -s * 0.62);
            galaxyCtx.lineTo(s * 0.58, s * 0.48);
            galaxyCtx.lineTo(-s * 0.58, s * 0.48);
            galaxyCtx.closePath();
            galaxyCtx.fill();
            if (variant % 5 === 0 && s > 4.5) {
                const oldAlpha = galaxyCtx.globalAlpha;
                galaxyCtx.globalAlpha = oldAlpha * 0.42;
                galaxyCtx.lineWidth = Math.max(0.7, s * 0.08);
                galaxyCtx.strokeStyle = '#ffffff';
                galaxyCtx.stroke();
            }
            galaxyCtx.restore();
        }

        function trimPrismArrayOuterGlyphCache() {
            while (prismArrayOuterGlyphCache.size > PRISM_ARRAY_OUTER_GLYPH_CACHE_MAX) {
                const oldestKey = prismArrayOuterGlyphCache.keys().next().value;
                prismArrayOuterGlyphCache.delete(oldestKey);
            }
        }

        function getPrismArrayOuterGlyphCanvas(glyph, fontSize, color, shadowBlur) {
            const roundedFontSize = Math.max(7, Math.round(fontSize));
            const roundedShadowBlur = Math.max(0, Math.round(shadowBlur * 2) / 2);
            const key = `${glyph}|${roundedFontSize}|${color}|${roundedShadowBlur}`;
            let entry = prismArrayOuterGlyphCache.get(key);
            if (entry) {
                prismArrayOuterGlyphCache.delete(key);
                prismArrayOuterGlyphCache.set(key, entry);
                return entry;
            }

            const margin = Math.ceil(roundedShadowBlur * 2.6 + roundedFontSize * 0.45 + 4);
            const size = Math.max(18, Math.ceil(roundedFontSize * 1.5 + margin * 2));
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const glyphCtx = canvas.getContext('2d', { alpha: true });
            if (!glyphCtx) return null;

            glyphCtx.textAlign = 'center';
            glyphCtx.textBaseline = 'middle';
            glyphCtx.font = `bold ${roundedFontSize}px Courier New`;
            glyphCtx.fillStyle = color;
            glyphCtx.shadowColor = color;
            glyphCtx.shadowBlur = roundedShadowBlur;
            glyphCtx.fillText(glyph, size / 2, size / 2);

            entry = { canvas, size };
            prismArrayOuterGlyphCache.set(key, entry);
            trimPrismArrayOuterGlyphCache();
            return entry;
        }

        function drawPrismArrayGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#61f7ff', '#ffe66d', '#ff5edb', '#7cff9b', '#ffffff'];
            const profile = getGalaxyVisualProfile(index);
            const animationNow = now * PRISM_ARRAY_ANIMATION_SPEED_SCALE;
            const axis = profile.axis + Math.sin(animationNow * 0.00011 + index) * 0.06;
            const tilt = profile.tilt || 0.72;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, animationNow, highlight);
            const spin = animationNow * 0.00016 * (options.warp && selected ? 1.8 : 1) * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const shimmer = 0.5 + Math.sin(animationNow * 0.0047) * 0.5;
            const detail = options.detail || 1;
            const fontScale = options.fontScale || 1;
            const warpMode = !!options.warp;
            const spriteBloomMode = !!options.spriteBloom;
            const perGlyphGlowEnabled = glowEnabled && !warpMode && !spriteBloomMode && !options.suppressPerGlyphGlow;
            const vectorGlyphs = !!options.vectorGlyphs;
            const ringCount = Math.max(3, Math.round((5 + highlight) * detail));
            const pointsPerRing = Math.max(9, Math.round((17 + highlight * 5) * detail));
            const brightness = 0.74 + highlight * 0.26;

            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'lighter';

            const aura = galaxyCtx.createRadialGradient(0, 0, radius * 0.06, 0, 0, radius * 1.32);
            aura.addColorStop(0, colorWithAlpha('#ffffff', 0.038 + highlight * 0.006 + glowPulse * 0.006));
            aura.addColorStop(0.32, colorWithAlpha('#ff5edb', 0.042 + highlight * 0.014 + glowPulse * 0.010));
            aura.addColorStop(0.62, colorWithAlpha('#61f7ff', 0.032 + highlight * 0.040 + glowPulse * 0.014));
            aura.addColorStop(1, colorWithAlpha('#ffffff', 0));
            galaxyCtx.fillStyle = aura;
            galaxyCtx.beginPath();
            galaxyCtx.arc(0, 0, radius * 1.34, 0, Math.PI * 2);
            galaxyCtx.fill();

            const glyphs = galaxy && Array.isArray(galaxy.glyphs) && galaxy.glyphs.length
                ? galaxy.glyphs
                : ['▲', '▶', '▼', '◀', '▴', '▸', '▾', '◂'];
            const cosAxis = Math.cos(axis);
            const sinAxis = Math.sin(axis);
            let lastFont = '';
            const outerCount = Math.max(12, Math.round((40 + highlight * 14) * detail * PRISM_ARRAY_OUTER_RING_DENSITY_SCALE));
            galaxyCtx.save();
            galaxyCtx.rotate(axis + spin * 0.7);
            galaxyCtx.scale(1, tilt * 0.62);
            const outerFontSize = getGalaxyFontPx(Math.max(7, radius * 0.105 * fontScale), options);
            galaxyCtx.font = `bold ${outerFontSize}px Courier New`;
            for (let i = 0; i < outerCount; i++) {
                const angle = (i / outerCount) * Math.PI * 2 + spin * 2.4;
                const stripePulse = 1 + Math.sin(angle * 8 + animationNow * 0.003) * 0.035;
                galaxyCtx.globalAlpha = (0.42 + highlight * 0.28) * (0.72 + Math.sin(angle * 4 + animationNow * 0.001) * 0.18);
                const glyphColor = colors[i % colors.length] || '#ffffff';
                galaxyCtx.fillStyle = glyphColor;
                let outerShadowBlur = 0;
                if (perGlyphGlowEnabled && (highlight > 0.04 || i % 5 === 0)) {
                    galaxyCtx.shadowColor = galaxyCtx.fillStyle;
                    outerShadowBlur = 4 + highlight * (4 + shimmer * 7 + glowPulse * 3);
                    galaxyCtx.shadowBlur = outerShadowBlur;
                } else {
                    galaxyCtx.shadowBlur = 0;
                }
                const gx = Math.cos(angle) * radius * 1.12 * stripePulse;
                const gy = Math.sin(angle) * radius * 1.12 * stripePulse;
                if (vectorGlyphs) {
                    drawPrismArrayVectorGlyph(outerFontSize, gx, gy, angle + Math.PI / 2, i);
                } else {
                    const glyphCanvas = getPrismArrayOuterGlyphCanvas(glyphs[i % glyphs.length], outerFontSize, glyphColor, outerShadowBlur);
                    if (glyphCanvas) {
                        galaxyCtx.shadowBlur = 0;
                        galaxyCtx.drawImage(glyphCanvas.canvas, gx - glyphCanvas.size / 2, gy - glyphCanvas.size / 2);
                    } else {
                        galaxyCtx.fillText(glyphs[i % glyphs.length], gx, gy);
                    }
                }
            }
            galaxyCtx.restore();
            for (let ring = ringCount - 1; ring >= 0; ring--) {
                const ringT = ring / Math.max(1, ringCount - 1);
                const ringRadius = radius * (PRISM_ARRAY_BODY_CLUSTER_INNER_RADIUS + Math.pow(ringT, 1.18) * PRISM_ARRAY_BODY_CLUSTER_SPAN);
                const pulse = 1 + Math.sin(animationNow * 0.0022 + ring * 1.71) * 0.055;
                const localTilt = tilt * (0.5 + ringT * 0.48);
                const pointCount = Math.max(10, pointsPerRing - Math.floor(ring * 1.5));
                for (let i = 0; i < pointCount; i++) {
                    const noise = galaxyNoise((galaxy.seed || 211) + ring * 41, i);
                    const angle = (i / pointCount) * Math.PI * 2 + spin * (1 + ringT * 0.8) + noise * 0.2;
                    const lace = Math.sin(angle * 3 + animationNow * 0.0017 + ring) * radius * 0.04;
                    const localX = Math.cos(angle) * (ringRadius * pulse + lace);
                    const localY = Math.sin(angle) * (ringRadius * pulse) * localTilt;
                    const px = localX * cosAxis - localY * sinAxis;
                    const py = localX * sinAxis + localY * cosAxis;
                    const depth = 0.5 + Math.sin(angle) * 0.5;
                    const fontSize = getGalaxyFontPx(Math.max(7, (7 + (1 - ringT) * 13 + depth * 4) * (0.94 + highlight * 0.12) * fontScale), options);
                    const nextFont = `bold ${fontSize}px Courier New`;
                    if (nextFont !== lastFont) {
                        galaxyCtx.font = nextFont;
                        lastFont = nextFont;
                    }
                    const color = colors[(ring + i) % Math.max(1, colors.length - 1)];
                    const sparkle = noise > 0.86 ? shimmer * 0.24 : 0;
                    const centerDamp = 0.24 + ringT * 0.70;
                    galaxyCtx.globalAlpha = Math.min(1, (0.12 + depth * 0.34 + (1 - ringT) * 0.24 + sparkle) * brightness * centerDamp);
                    galaxyCtx.fillStyle = noise > 0.94 && ringT > 0.42 ? '#ffffff' : color;
                    if (perGlyphGlowEnabled && (highlight > 0.04 || noise > 0.92)) {
                        const centerGlowDamp = 0.36 + ringT * 0.64;
                        galaxyCtx.shadowColor = galaxyCtx.fillStyle;
                        galaxyCtx.shadowBlur = (4 + highlight * (3 + shimmer * 9 + glowPulse * 3)) * centerGlowDamp;
                    } else {
                        galaxyCtx.shadowBlur = 0;
                    }
                    if (vectorGlyphs) {
                        drawPrismArrayVectorGlyph(fontSize, px, py, angle + (ring % 2 ? -0.35 : 0.35), i + ring);
                    } else {
                        galaxyCtx.fillText(glyphs[(i + ring) % glyphs.length], px, py);
                    }
                }
            }

            galaxyCtx.globalAlpha = 0.18 + highlight * 0.010;
            galaxyCtx.shadowColor = '#ffffff';
            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (2.0 + highlight * 0.5 + glowPulse * 0.4) : 0;
            galaxyCtx.fillStyle = colorWithAlpha('#ffffff', 0.55);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, (13 + highlight * 1.2) * fontScale), options)}px Courier New`;
            galaxyCtx.fillText(getGalaxyCoreGlyph(galaxy, '▲'), 0, 0);
            galaxyCtx.save();
            galaxyCtx.rotate(-spin * 2.8);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, (8 + highlight) * fontScale), options)}px Courier New`;
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2 + spin * 4;
                galaxyCtx.globalAlpha = 0.12 + highlight * 0.015;
                galaxyCtx.fillStyle = i % 2 ? '#ffffff' : (colors[i % colors.length] || '#ffe66d');
                galaxyCtx.fillText(glyphs[(i * 3) % glyphs.length], Math.cos(angle) * radius * 0.16, Math.sin(angle) * radius * 0.16);
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 0.18 + highlight * 0.012;
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, (8 + highlight) * fontScale), options)}px Courier New`;
            galaxyCtx.fillStyle = colors[1] || '#ffe66d';
            galaxyCtx.fillText(getGalaxyCoreVoidGlyph(galaxy, '▼'), 0, 0);
            galaxyCtx.restore();
            galaxyCtx.globalCompositeOperation = 'source-over';
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
        }

        function drawShipHubGalaxySprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            const colors = galaxy.colors || ['#8ff7ff', '#6aa8ff', '#ffe66d', '#ffffff'];
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00011 + index) * 0.035);
            const spin = now * 0.00013 * (profile.spinDir || 1) * (profile.spinSpeed || 1);
            const pulse = 0.5 + Math.sin(now * 0.0032 + index) * 0.5;
            const shimmer = 0.72 + pulse * 0.28;
            const fontScale = options.fontScale || 1;
            const detail = options.detail || 1;
            const warpMode = !!options.warp;
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, now, highlight);

            galaxyCtx.save();
            galaxyCtx.translate(x, y);
            galaxyCtx.rotate(axis);
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.globalCompositeOperation = 'screen';
            drawGalaxySoftAura(colors, radius, selected, 0.92 + glowPulse * 0.13, highlight);

            const ringCount = Math.max(24, Math.round((44 + highlight * 14) * detail));
            galaxyCtx.lineCap = 'round';
            for (let ring = 0; ring < 2; ring++) {
                galaxyCtx.globalAlpha = (0.19 + highlight * 0.15) * (ring ? 0.72 : 1);
                galaxyCtx.strokeStyle = colorWithAlpha(ring ? colors[1] : colors[0], 0.46 + highlight * 0.26);
                galaxyCtx.lineWidth = Math.max(1, radius * (ring ? 0.014 : 0.02));
                galaxyCtx.beginPath();
                galaxyCtx.ellipse(0, 0, radius * (0.94 + ring * 0.16), radius * (0.34 + ring * 0.06), spin * (ring ? -0.7 : 1), 0, Math.PI * 2);
                galaxyCtx.stroke();
            }

            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(6, radius * 0.10 * fontScale), options)}px Courier New`;
            for (let i = 0; i < ringCount; i++) {
                const a = (i / ringCount) * Math.PI * 2 + spin * 1.7;
                const lanePulse = 1 + Math.sin(a * 6 + now * 0.002) * 0.045;
                const px = Math.cos(a) * radius * 1.04 * lanePulse;
                const py = Math.sin(a) * radius * 0.38 * lanePulse;
                galaxyCtx.globalAlpha = (0.32 + highlight * 0.23) * (0.72 + Math.sin(a * 3 + now * 0.001) * 0.18);
                galaxyCtx.fillStyle = i % 7 === 0 ? '#ffffff' : (i % 2 ? colors[0] : colors[1]);
                galaxyCtx.fillText(i % 4 === 0 ? '+' : (i % 4 === 1 ? '=' : (i % 4 === 2 ? '[' : ']')), px, py);
            }

            galaxyCtx.globalCompositeOperation = 'source-over';
            const availableAlpha = galaxy.available ? 1 : 0.34;
            galaxyCtx.globalAlpha = (0.74 + highlight * 0.22) * availableAlpha;
            if (glowEnabled && !warpMode) {
                galaxyCtx.shadowColor = colors[0];
                galaxyCtx.shadowBlur = 8 + highlight * (8 + pulse * 8) + glowPulse * 4;
            }

            galaxyCtx.strokeStyle = colorWithAlpha(colors[0], 0.58 + highlight * 0.26);
            galaxyCtx.lineWidth = Math.max(2, radius * 0.034);
            galaxyCtx.beginPath();
            galaxyCtx.moveTo(-radius * 0.86, 0);
            galaxyCtx.lineTo(radius * 0.86, 0);
            galaxyCtx.moveTo(0, -radius * 0.38);
            galaxyCtx.lineTo(0, radius * 0.38);
            galaxyCtx.stroke();

            galaxyCtx.fillStyle = colorWithAlpha('#071326', 0.88);
            galaxyCtx.strokeStyle = colorWithAlpha('#f6fbff', 0.62 + highlight * 0.26);
            galaxyCtx.lineWidth = Math.max(1, radius * 0.018);
            galaxyCtx.beginPath();
            galaxyCtx.rect(-radius * 0.34, -radius * 0.22, radius * 0.68, radius * 0.44);
            galaxyCtx.fill();
            galaxyCtx.stroke();

            const moduleCount = 4;
            for (let side = -1; side <= 1; side += 2) {
                for (let i = 0; i < moduleCount; i++) {
                    const px = side * radius * (0.47 + i * 0.13);
                    const py = Math.sin(now * 0.002 + i + side) * radius * 0.018;
                    galaxyCtx.fillStyle = i % 2 ? colorWithAlpha(colors[1], 0.42) : colorWithAlpha('#0b2444', 0.88);
                    galaxyCtx.strokeStyle = colorWithAlpha(i % 2 ? colors[0] : colors[2], 0.46 + highlight * 0.26);
                    galaxyCtx.beginPath();
                    galaxyCtx.rect(px - radius * 0.045, py - radius * 0.14, radius * 0.09, radius * 0.28);
                    galaxyCtx.fill();
                    galaxyCtx.stroke();
                }
            }

            for (let side = -1; side <= 1; side += 2) {
                const panelX = side * radius * 0.62;
                const panelY = -radius * 0.37;
                const panelW = radius * 0.36;
                const panelH = radius * 0.17;
                for (let row = -1; row <= 1; row += 2) {
                    galaxyCtx.fillStyle = colorWithAlpha(row < 0 ? colors[1] : colors[0], 0.13 + highlight * 0.09);
                    galaxyCtx.strokeStyle = colorWithAlpha('#8ff7ff', 0.35 + highlight * 0.27);
                    const left = side < 0 ? panelX - panelW : panelX;
                    galaxyCtx.beginPath();
                    galaxyCtx.rect(left, row * panelY - panelH / 2, panelW, panelH);
                    galaxyCtx.fill();
                    galaxyCtx.stroke();
                    galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(5, radius * 0.065 * fontScale), options)}px Courier New`;
                    galaxyCtx.fillStyle = colorWithAlpha('#ffffff', 0.34 + highlight * 0.24);
                    galaxyCtx.fillText(row < 0 ? 'AI' : 'RL', panelX + side * panelW * 0.52, row * panelY);
                }
            }

            galaxyCtx.shadowBlur = glowEnabled && !warpMode ? (8 + highlight * 10 + glowPulse * 5) : 0;
            galaxyCtx.fillStyle = '#f6fbff';
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(12, radius * 0.26 * fontScale), options)}px Courier New`;
            galaxyCtx.fillText('A', 0, -radius * 0.01);
            galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, radius * 0.13 * fontScale), options)}px Courier New`;
            galaxyCtx.fillStyle = colors[2] || '#ffe66d';
            galaxyCtx.fillText('+', 0, radius * 0.13);

            const selectedShip = typeof getSelectedShipConfig === 'function' ? getSelectedShipConfig() : null;
            if (selectedShip && !warpMode) {
                const dockAngle = -spin * 2.2 + Math.PI * 0.62;
                const dockX = Math.cos(dockAngle) * radius * 0.58;
                const dockY = Math.sin(dockAngle) * radius * 0.28 + radius * 0.52;
                const shipGlyphs = {
                    glasswing: '^',
                    arrowhead: 'A',
                    ionManta: 'M',
                    auroraKite: 'K',
                    emberVesper: 'V',
                    nullOrchid: 'O'
                };
                const shipGlyph = shipGlyphs[selectedShip.id] || 'A';
                galaxyCtx.save();
                galaxyCtx.translate(dockX, dockY);
                galaxyCtx.rotate(dockAngle + Math.PI / 2);
                galaxyCtx.fillStyle = selectedShip.previewColor || '#ffffff';
                galaxyCtx.shadowColor = selectedShip.previewColor || colors[0];
                galaxyCtx.shadowBlur = glowEnabled ? 10 * shimmer : 0;
                galaxyCtx.font = `bold ${getGalaxyFontPx(Math.max(7, radius * 0.13 * fontScale), options)}px Courier New`;
                galaxyCtx.fillText(shipGlyph, 0, 0);
                galaxyCtx.restore();
            }

            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function getVisualQualityAdjustedGalaxyOptions(options = {}) {
            if (options._visualQualityApplied) return options;
            const detailScale = typeof getVisualQualityScale === 'function' ? getVisualQualityScale('detail') : 1;
            if (Math.abs(detailScale - 1) < 0.001) {
                return { ...options, _visualQualityApplied: true };
            }
            return {
                ...options,
                detail: (options.detail || 1) * detailScale,
                _visualQualityApplied: true
            };
        }

        function drawGalaxyGlyphSpriteDirect(galaxy, x, y, radius, selected, now, index, options = {}) {
            options = getVisualQualityAdjustedGalaxyOptions(options);
            const style = getGalaxyRenderStyle(galaxy);
            if (galaxy && (galaxy.mode === 'shipHub' || style === 'shipHub')) {
                drawShipHubGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
                return;
            }
            if (isPrismArrayGalaxySprite(galaxy)) {
                drawPrismArrayGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
                return;
            }
            if (style === 'tensorMirage') {
                drawTensorMirageGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
                return;
            }
            if (style === 'kernelEye') {
                drawKernelCoronaGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
                return;
            }
            if (style === 'bitshiftSphere') {
                drawBitshiftSphereGalaxySprite(galaxy, x, y, radius, selected, now, index, options);
                return;
            }

            const colors = galaxy.colors || ['#6aa8ff', '#ff5e8a', '#ffffff'];
            const profile = getGalaxyVisualProfile(index);
            const axis = options.axisOverride ?? (profile.axis + Math.sin(now * 0.00009 + (galaxy.seed || index)) * 0.035);
            const tilt = options.tiltOverride ?? (profile.tilt || galaxy.tilt || 0.5);
            const highlight = getGalaxyOptionHighlightAmount(options, selected);
            const glowPulse = getGalaxySelectHighlightPulse(index, now, highlight);
            const matrixLayer = style === 'matrixNebula' ? (options.matrixNebulaLayer || '') : '';

            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.translate(x, y);
            galaxyCtx.globalCompositeOperation = 'screen';
            if (style === 'matrixNebula') {
                if (glowEnabled && highlight > 0.01 && matrixLayer !== 'rain' && matrixLayer !== 'foreground') {
                    drawGalaxySoftAura(colors, radius, selected, 0.72 + glowPulse * 0.16, highlight);
                }
                if (matrixLayer === 'rain') {
                    drawMatrixNebulaRain(galaxy, radius, selected, now, index, { ...options, skipPocketGlow: true });
                } else {
                    if (matrixLayer !== 'foreground') {
                        drawMatrixNebulaCloud(galaxy, radius, selected, now, index, options);
                        drawMatrixNebulaRain(galaxy, radius, selected, now, index, matrixLayer === 'background'
                            ? { ...options, pocketsOnly: true }
                            : options);
                    }
                    if (matrixLayer !== 'background') {
                        drawGalaxySpiralArms(galaxy, radius, selected, now, index, options);
                        drawGalaxyCore(galaxy, colors, radius, selected, axis, tilt, options);
                    }
                }
            } else {
                if (glowEnabled && highlight > 0.01) drawGalaxySoftAura(colors, radius, selected, 1 + glowPulse * 0.16, highlight);
                if (style === 'binaryQuasar') drawBinaryQuasarJet(galaxy, radius, axis, now, selected, options);

                drawGalaxySpiralArms(galaxy, radius, selected, now, index, options);

                if (style === 'fractalHalo') {
                    drawFractalCounterHalo(galaxy, radius, selected, now, index, options);
                    drawFractalHaloStorm(galaxy, radius, selected, now, index, options);
                }
                if (style === 'binaryQuasar') drawBinaryQuasarCorePulse(galaxy, radius, selected, now, options);
                drawGalaxyCore(galaxy, colors, radius, selected, axis, tilt, style === 'binaryQuasar'
                    ? {
                        ...options,
                        coreAlphaScale: 0.28,
                        coreFontScale: 0.58,
                        coreShadowScale: 0.20,
                        coreVoidAlphaScale: 0.70
                    }
                    : options);
            }

            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function trimGalaxySelectSpriteCache() {
            while (galaxySelectSpriteFrameCache.size > GALAXY_SELECT_SPRITE_CACHE_MAX) {
                const oldestKey = galaxySelectSpriteFrameCache.keys().next().value;
                galaxySelectSpriteFrameCache.delete(oldestKey);
            }
        }

        function getGalaxySelectSpriteFrameKey(galaxy, index, radius, selected, now, options = {}) {
            const style = getGalaxyRenderStyle(galaxy);
            const matrixLayer = style === 'matrixNebula' ? (options.matrixNebulaLayer || '') : '';
            const matrixRainLayer = matrixLayer === 'rain';
            const selectedFrameFps = matrixRainLayer
                ? GALAXY_SELECT_SPRITE_CACHE_FPS_SELECTED
                : (style === 'matrixNebula'
                ? 24
                : (style === 'fractalHalo'
                    ? 30
                    : (style === 'tensorMirage' ? GALAXY_SELECT_SPRITE_CACHE_FPS_GLYPH_HEAVY_SELECTED : GALAXY_SELECT_SPRITE_CACHE_FPS_SELECTED)));
            const idleFrameFps = matrixRainLayer
                ? GALAXY_SELECT_SPRITE_CACHE_FPS_IDLE
                : (style === 'matrixNebula'
                ? 18
                : (style === 'fractalHalo'
                    ? 20
                    : (style === 'tensorMirage' ? GALAXY_SELECT_SPRITE_CACHE_FPS_GLYPH_HEAVY_IDLE : GALAXY_SELECT_SPRITE_CACHE_FPS_IDLE)));
            const frameFps = options.warp ? GALAXY_WARP_SPRITE_CACHE_FPS : (selected ? selectedFrameFps : idleFrameFps);
            const frameMs = 1000 / frameFps;
            const layerPhaseOffset = matrixLayer === 'background'
                ? 0.23
                : (matrixLayer === 'rain'
                    ? 0.59
                    : (matrixLayer === 'foreground' ? 0.83 : 0));
            const stylePhaseOffset = matrixLayer
                ? layerPhaseOffset
                : (style === 'tensorMirage'
                    ? 0.37
                    : (style === 'binaryQuasar'
                        ? 0.51
                        : (style === 'bitshiftDwarf' ? 0.69 : 0)));
            const phaseOffset = ((index % 7) + stylePhaseOffset) * frameMs / 7;
            const bucket = Math.floor((now + phaseOffset) / frameMs);
            const radiusKey = Math.round(radius * 2);
            const detailKey = Math.round((options.detail || 1) * 100);
            const fontKey = Math.round((options.fontScale || 1) * 100);
            const highlightKey = Math.round(getGalaxyOptionHighlightAmount(options, selected) * 24);
            return {
                key: [
                    width,
                    height,
                    galaxy && galaxy.id ? galaxy.id : index,
                    index,
                    selected ? 1 : 0,
                    options.warp ? 1 : 0,
                    glowEnabled ? 1 : 0,
                    matrixLayer,
                    radiusKey,
                    detailKey,
                    fontKey,
                    highlightKey,
                    galaxy && galaxy.mode === 'shipHub' && typeof getSelectedShipConfig === 'function'
                        ? getSelectedShipConfig().id
                        : ''
                ].join('|'),
                bucket,
                bucketNow: bucket * frameMs - phaseOffset
            };
        }

        function drawGalaxyGlyphSprite(galaxy, x, y, radius, selected, now, index, options = {}) {
            options = getVisualQualityAdjustedGalaxyOptions(options);
            if (options && options.noCache) {
                drawGalaxyGlyphSpriteDirect(galaxy, x, y, radius, selected, now, index, options);
                return;
            }
            const style = getGalaxyRenderStyle(galaxy);
            if (style === 'matrixNebula' && !options.warp && !options.matrixNebulaLayer) {
                drawGalaxyGlyphSprite(galaxy, x, y, radius, selected, now, index, {
                    ...options,
                    matrixNebulaLayer: 'background'
                });
                drawGalaxyGlyphSprite(galaxy, x, y, radius, selected, now, index, {
                    ...options,
                    matrixNebulaLayer: 'rain'
                });
                drawGalaxyGlyphSprite(galaxy, x, y, radius, selected, now, index, {
                    ...options,
                    matrixNebulaLayer: 'foreground'
                });
                return;
            }

            const { key, bucket, bucketNow } = getGalaxySelectSpriteFrameKey(galaxy, index, radius, selected, now, options);
            let entry = galaxySelectSpriteFrameCache.get(key);
            if (entry) {
                galaxySelectSpriteFrameCache.delete(key);
                galaxySelectSpriteFrameCache.set(key, entry);
            } else {
                const highlight = getGalaxyOptionHighlightAmount(options, selected);
                const cacheRadius = Math.ceil(radius * (4.05 + highlight * 0.30) + 48);
                const cacheCanvas = document.createElement('canvas');
                cacheCanvas.width = cacheRadius;
                cacheCanvas.height = cacheRadius;
                entry = {
                    canvas: cacheCanvas,
                    ctx: cacheCanvas.getContext('2d', { alpha: true }),
                    size: cacheRadius,
                    bucket: -1
                };
                if (!entry.ctx) {
                    galaxySelectSpriteFrameCache.delete(key);
                    drawGalaxyGlyphSpriteDirect(galaxy, x, y, radius, selected, now, index, options);
                    return;
                }
                galaxySelectSpriteFrameCache.set(key, entry);
                trimGalaxySelectSpriteCache();
            }

            if (entry.bucket !== bucket) {
                const cacheCtx = entry.ctx;
                const previousCtx = galaxyCtx;
                const highlight = getGalaxyOptionHighlightAmount(options, selected);
                const spriteBloom = selected
                    && !options.warp
                    && glowEnabled
                    && style === 'binaryQuasar'
                    && cacheCtx
                    && ('filter' in cacheCtx);
                galaxyCtx = cacheCtx;
                cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
                cacheCtx.clearRect(0, 0, entry.canvas.width, entry.canvas.height);
                cacheCtx.globalAlpha = 1;
                cacheCtx.globalCompositeOperation = 'source-over';
                cacheCtx.shadowBlur = 0;
                try {
                    drawGalaxyGlyphSpriteDirect(galaxy, entry.canvas.width / 2, entry.canvas.height / 2, radius, selected, bucketNow, index, {
                        ...options,
                        noCache: true,
                        spriteBloom
                    });
                    if (spriteBloom) applyGalaxySpriteBloom(cacheCtx, entry.canvas, highlight, style === 'binaryQuasar' ? 0.36 : 1);
                } finally {
                    galaxyCtx = previousCtx;
                }
                entry.bucket = bucket;
            }

            galaxyCtx.drawImage(entry.canvas, x - entry.size / 2, y - entry.size / 2);
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalCompositeOperation = 'source-over';
        }

        function getGalaxyCursorRestBounds() {
            return {
                minX: 52,
                maxX: Math.max(52, width - 52),
                minY: Math.max(128, height * 0.16),
                maxY: Math.max(128, height - 128)
            };
        }

        function getGalaxyCursorRestCandidate(slot, angle, distance) {
            const bounds = getGalaxyCursorRestBounds();
            const rawX = slot.x + Math.cos(angle) * distance;
            const rawY = slot.y + Math.sin(angle) * distance;
            const x = Math.max(bounds.minX, Math.min(bounds.maxX, rawX));
            const y = Math.max(bounds.minY, Math.min(bounds.maxY, rawY));
            return {
                x,
                y,
                clampDistance: Math.hypot(rawX - x, rawY - y),
                bounds
            };
        }

        function scoreGalaxyCursorRestCandidate(candidate, slot, radius) {
            const edgeRoom = Math.min(
                candidate.x - candidate.bounds.minX,
                candidate.bounds.maxX - candidate.x,
                candidate.y - candidate.bounds.minY,
                candidate.bounds.maxY - candidate.y
            );
            let score = candidate.clampDistance * 3 + Math.max(0, 22 - edgeRoom) * 2;
            const labelTop = slot.y + radius + 2;
            const labelBottom = labelTop + 50;
            const labelHalfW = Math.max(82, radius * 1.35);
            if (candidate.y >= labelTop && candidate.y <= labelBottom) {
                const labelOverlap = 1 - Math.min(1, Math.abs(candidate.x - slot.x) / labelHalfW);
                score += labelOverlap * 84;
            }
            return score;
        }

        function refreshGalaxySelectCursorRestPose(index, slot, radius, profile) {
            const baseAngle = Number.isFinite(profile && profile.cursorAngle) ? profile.cursorAngle : -0.7;
            const candidates = [];
            for (let i = 0; i < GALAXY_SELECT_CURSOR_RANDOM_CANDIDATES; i++) {
                const angle = normalizePauseCursorAngle(baseAngle + (Math.random() - 0.5) * Math.PI * 2);
                const distanceNoise = Math.random();
                const candidate = getGalaxyCursorRestCandidate(
                    slot,
                    angle,
                    radius + GALAXY_SELECT_CURSOR_REST_BASE_OFFSET + distanceNoise * GALAXY_SELECT_CURSOR_REST_RANDOM_OFFSET
                );
                candidates.push({
                    angle,
                    distanceNoise,
                    approachNoise: Math.random(),
                    bendNoise: Math.random(),
                    scaleNoise: Math.random(),
                    score: scoreGalaxyCursorRestCandidate(candidate, slot, radius) + Math.random() * 7
                });
            }
            candidates.sort((a, b) => a.score - b.score);
            const pickCount = Math.max(1, Math.min(4, candidates.length));
            const pick = candidates[Math.floor(Math.random() * pickCount)] || candidates[0];
            galaxySelectCursorRestPose = {
                index,
                token: galaxySelectCursorRestPose.token + 1,
                angle: pick.angle,
                distanceNoise: pick.distanceNoise,
                approachNoise: pick.approachNoise,
                bendNoise: pick.bendNoise,
                scaleNoise: pick.scaleNoise
            };
            return galaxySelectCursorRestPose;
        }

        function getGalaxySelectCursorRestPose(index, slot, radius, profile) {
            if (galaxySelectCursorRestPose.index !== index) {
                return refreshGalaxySelectCursorRestPose(index, slot, radius, profile);
            }
            return galaxySelectCursorRestPose;
        }

        function resetGalaxySelectCursorRestPose() {
            galaxySelectCursorRestPose.index = -1;
        }

        function getGalaxyCursorTarget(slot, radius, galaxy, index, now) {
            const profile = getGalaxyVisualProfile(index);
            if (galaxy && galaxy.mode === 'shipHub') {
                if (typeof isTerminalDockExitHoldActive === 'function' && isTerminalDockExitHoldActive(index)) {
                    const exitPose = typeof getTerminalDockExitCursorPose === 'function'
                        ? getTerminalDockExitCursorPose(index)
                        : null;
                    if (exitPose) {
                        const restY = exitPose.y + Math.sin(now * 0.0016 + index) * 2.2;
                        return {
                            x: exitPose.x,
                            y: restY,
                            faceX: exitPose.faceX,
                            faceY: exitPose.faceY + (restY - exitPose.y) * 0.25,
                            scale: exitPose.scale,
                            key: `terminal-outbound-${index}`,
                            color: galaxy.colors ? galaxy.colors[0] : currentThemeColor,
                            floaty: true,
                            suppressGuide: true
                        };
                    }
                }
                const dockX = slot.x - radius * 0.64;
                const dockY = slot.y;
                const restX = Math.max(42, dockX - radius * 0.82);
                const restY = dockY + Math.sin(now * 0.0018) * 2.5;
                return {
                    x: restX,
                    y: restY,
                    faceX: dockX,
                    faceY: dockY,
                    approachX: Math.max(24, restX - radius * 0.74),
                    approachY: dockY + radius * 0.18,
                    scale: 0.23,
                    key: `terminal-${index}`,
                    color: galaxy.colors ? galaxy.colors[0] : currentThemeColor,
                    floaty: true
                };
            }
            const pose = getGalaxySelectCursorRestPose(index, slot, radius, profile);
            const angle = pose.angle;
            const distance = radius + GALAXY_SELECT_CURSOR_REST_BASE_OFFSET + pose.distanceNoise * GALAXY_SELECT_CURSOR_REST_RANDOM_OFFSET;
            const restPoint = getGalaxyCursorRestCandidate(slot, angle, distance);
            const targetX = restPoint.x;
            const targetY = restPoint.y;
            const approachDistance = distance + GALAXY_SELECT_CURSOR_APPROACH_BASE_OFFSET + pose.approachNoise * GALAXY_SELECT_CURSOR_APPROACH_RANDOM_OFFSET;
            const bend = (pose.bendNoise - 0.5) * 48;
            const normalX = -Math.sin(angle);
            const normalY = Math.cos(angle);
            return {
                x: targetX,
                y: targetY,
                faceX: slot.x,
                faceY: slot.y,
                approachX: Math.max(24, Math.min(width - 24, slot.x + Math.cos(angle) * approachDistance + normalX * bend)),
                approachY: Math.max(80, Math.min(height - 100, slot.y + Math.sin(angle) * approachDistance + normalY * bend)),
                scale: 0.22 + pose.scaleNoise * 0.035,
                key: `galaxy-${index}-${pose.token}`,
                color: galaxy.colors ? galaxy.colors[0] : currentThemeColor,
                floaty: true
            };
        }

        function drawGalaxyCursorGuide(target, color, now) {
            if (!target) return;
            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            const dx = target.faceX - target.x;
            const dy = target.faceY - target.y;
            const distance = Math.hypot(dx, dy);
            const steps = Math.max(6, Math.min(18, Math.floor(distance / 24)));
            for (let i = 1; i < steps; i++) {
                const t = i / steps;
                const pulse = 0.5 + Math.sin(now * 0.0032 + i * 0.75) * 0.5;
                const sag = Math.sin(t * Math.PI) * 10;
                const nx = -dy / Math.max(1, distance);
                const ny = dx / Math.max(1, distance);
                const x = target.x + dx * t + nx * sag;
                const y = target.y + dy * t + ny * sag;
                galaxyCtx.globalAlpha = (0.04 + pulse * 0.07) * (1 - Math.abs(t - 0.5) * 0.55);
                galaxyCtx.fillStyle = i % 3 === 0 ? '#ffffff' : color;
                galaxyCtx.font = `bold ${i % 3 === 0 ? 8 : 6}px Courier New`;
                galaxyCtx.fillText(i % 3 === 0 ? '+' : '.', x, y);
            }
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
        }

        function getGalaxySelectTerminalExitIntroStart() {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [];
            const terminalIndex = Array.isArray(galaxies)
                ? galaxies.findIndex(galaxy => galaxy && galaxy.mode === 'shipHub')
                : -1;
            if (terminalIndex >= 0 && typeof getTerminalDockExitCursorPose === 'function') {
                const exitPose = getTerminalDockExitCursorPose(terminalIndex);
                if (exitPose && Number.isFinite(exitPose.x) && Number.isFinite(exitPose.y)) {
                    return exitPose;
                }
            }
            if (terminalIndex >= 0) {
                const slot = getGalaxySelectSlot(terminalIndex);
                const radius = getGalaxySelectRenderRadius(terminalIndex, true);
                return {
                    x: Math.min(width - 54, slot.x + radius * 1.98),
                    y: Math.max(100, slot.y - radius * 0.44)
                };
            }
            return { x: Math.max(80, width * 0.16), y: Math.max(100, height * 0.58) };
        }

        function primeGalaxySelectIntroCursorFlyIn(target, now) {
            if (galaxySelectIntroCursorPrimed || !target || !pauseMenuShipCursor || pauseMenuShipCursor.initialized) return;

            const cursor = pauseMenuShipCursor;
            const terminalExit = getGalaxySelectTerminalExitIntroStart();
            const startX = Math.max(32, Math.min(width - 32, terminalExit.x));
            const startY = -GALAXY_SELECT_INTRO_CURSOR_START_MARGIN;
            const dx = target.x - startX;
            const dy = target.y - startY;
            const targetKey = target.key || '';

            cursor.x = startX;
            cursor.y = startY;
            cursor.vx = Math.max(-260, Math.min(260, dx * 1.7));
            cursor.vy = Math.max(360, Math.min(620, dy * 2.05));
            cursor.rot = Math.atan2(dy, dx) + Math.PI / 2;
            cursor.scale = target.scale || 0.24;
            cursor.speed = Math.hypot(cursor.vx, cursor.vy);
            cursor.trail = [];
            cursor.trailEmitAcc = 0;
            cursor.settleBlend = 0;
            cursor.initialized = true;
            cursor.lastNow = now || currentFrameNow || performance.now();
            cursor.targetKey = targetKey;
            cursor.routeKey = targetKey;
            cursor.approachComplete = true;
            cursor.renderX = startX;
            cursor.renderY = startY;
            cursor.renderRot = cursor.rot;
            cursor.renderScale = cursor.scale;
            galaxySelectIntroCursorPrimed = true;
        }

        function drawGalaxySelectCursor(target, options = {}) {
            if (options.introFlyIn) primeGalaxySelectIntroCursorFlyIn(target, currentFrameNow);
            const cursor = updatePauseMenuShipCursor(target, currentFrameNow);
            if (!cursor) return;
            const speedRatio = Math.min(1, cursor.speed / 310);
            pauseMenuShipCursor.renderX = cursor.x;
            pauseMenuShipCursor.renderY = cursor.y;
            pauseMenuShipCursor.renderRot = cursor.rot;
            pauseMenuShipCursor.renderScale = cursor.scale;
            if (pauseMenuShipCursor.trail.length > GALAXY_CURSOR_TRAIL_MAX) {
                pauseMenuShipCursor.trail.splice(0, pauseMenuShipCursor.trail.length - GALAXY_CURSOR_TRAIL_MAX);
            }
            if (!options.suppressTrail) drawPauseMenuShipTrail(cursor.dt);
            galaxyCtx.save();
            galaxyCtx.translate(cursor.x, cursor.y);
            galaxyCtx.rotate(cursor.rot);
            galaxyCtx.scale(cursor.scale, cursor.scale);
            PAUSE_CURSOR_SHIP.x = 0;
            PAUSE_CURSOR_SHIP.y = 0;
            PAUSE_CURSOR_SHIP.vx = 0;
            PAUSE_CURSOR_SHIP.vy = 0;
            PAUSE_CURSOR_SHIP.shipId = typeof getSelectedShipConfig === 'function' ? getSelectedShipConfig().id : 'arrowhead';
            PAUSE_CURSOR_SHIP._renderLayoutCache = null;
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.fillStyle = '#f6fbff';
            galaxyCtx.shadowColor = target.color || currentThemeColor;
            galaxyCtx.shadowBlur = glowEnabled ? 14 : 0;
            drawPlayerShip(PAUSE_CURSOR_SHIP, 'center');
            galaxyCtx.restore();
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.globalAlpha = 1;
            if (!options.suppressTrail) emitPauseMenuShipExhaustTrail(cursor, currentFrameNow, speedRatio * 0.75, 0.46, GALAXY_CURSOR_TRAIL_MAX);
        }

        function drawCenteredWrappedText(text, x, y, maxWidth, lineHeight, font, color, maxLines = 2) {
            const words = String(text || '').split(/\s+/).filter(Boolean);
            const lines = [];
            let current = '';
            galaxyCtx.save();
            galaxyCtx.font = font;
            galaxyCtx.fillStyle = color;
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            for (const word of words) {
                const next = current ? `${current} ${word}` : word;
                if (galaxyCtx.measureText(next).width <= maxWidth || !current) {
                    current = next;
                } else {
                    lines.push(current);
                    current = word;
                }
                if (lines.length >= maxLines) break;
            }
            if (current && lines.length < maxLines) lines.push(current);
            if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
                while (galaxyCtx.measureText(`${lines[maxLines - 1]}...`).width > maxWidth && lines[maxLines - 1].length > 4) {
                    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1).trim();
                }
                lines[maxLines - 1] = `${lines[maxLines - 1]}...`;
            }
            const startY = y - ((lines.length - 1) * lineHeight) / 2;
            for (let i = 0; i < lines.length; i++) {
                galaxyCtx.fillText(lines[i], x, startY + i * lineHeight);
            }
            galaxyCtx.restore();
            return lines.length;
        }

        function drawGalaxyLayoutEditorOverlay(now, galaxies, selectedIndex) {
            if (!galaxyLayoutEditMode) return;
            updateGalaxyLayoutEditorHover();
            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.lineWidth = 1;

            for (let i = 0; i < galaxies.length; i++) {
                const galaxy = galaxies[i];
                const slot = getGalaxySelectSlot(i);
                const selected = i === selectedIndex;
                const hot = i === galaxyLayoutHoverIndex || (galaxyLayoutDragState.active && i === galaxyLayoutDragState.index);
                const radius = getGalaxySelectRenderRadius(i, selected);
                const color = (galaxy && galaxy.colors && galaxy.colors[0]) || currentThemeColor;
                galaxyCtx.globalAlpha = hot ? 0.9 : 0.46;
                galaxyCtx.strokeStyle = hot ? colorWithAlpha('#ffffff', 0.86) : colorWithAlpha(color, 0.58);
                galaxyCtx.setLineDash(hot ? [] : [5, 5]);
                galaxyCtx.beginPath();
                galaxyCtx.arc(slot.x, slot.y, Math.max(24, radius * 0.72), 0, Math.PI * 2);
                galaxyCtx.stroke();
                galaxyCtx.setLineDash([]);
                galaxyCtx.fillStyle = hot ? '#ffffff' : colorWithAlpha('#dcecff', 0.72);
                galaxyCtx.shadowColor = color;
                galaxyCtx.shadowBlur = glowEnabled && hot ? 8 : 0;
                galaxyCtx.font = `bold ${hot ? 12 : 10}px Courier New`;
                galaxyCtx.fillText(String(i + 1), slot.x, slot.y - Math.max(30, radius * 0.78));
                if (hot) {
                    const profile = GALAXY_SELECT_LAYOUT[i];
                    galaxyCtx.font = `bold 9px Courier New`;
                    galaxyCtx.fillStyle = colorWithAlpha('#dcecff', 0.76);
                    galaxyCtx.fillText(
                        `S ${formatGalaxyLayoutNumber(profile.scale)}  R ${formatGalaxyLayoutNumber(profile.axis)}`,
                        slot.x,
                        slot.y + Math.max(30, radius * 0.76)
                    );
                }
            }

            const panelW = Math.min(500, width * 0.70);
            const panelH = 40;
            const panelX = width / 2 - panelW / 2;
            const panelY = height * 0.145;
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.fillStyle = 'rgba(2, 8, 18, 0.72)';
            galaxyCtx.fillRect(panelX, panelY, panelW, panelH);
            galaxyCtx.strokeStyle = colorWithAlpha('#8ff7ff', 0.42);
            galaxyCtx.strokeRect(panelX + 0.5, panelY + 0.5, panelW, panelH);
            galaxyCtx.font = `bold 12px 'Electrolize', sans-serif`;
            galaxyCtx.fillStyle = '#dcecff';
            galaxyCtx.fillText('LAYOUT EDIT', width / 2, panelY + 14);
            galaxyCtx.font = `10px 'Electrolize', sans-serif`;
            galaxyCtx.fillStyle = 'rgba(202,229,255,0.66)';
            galaxyCtx.fillText('DRAG MOVE  |  WHEEL SCALE  |  SHIFT+WHEEL ROTATE  |  layout copy/reset', width / 2, panelY + 29);
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;
        }

        function prefersGalaxySelectIntroReducedMotion() {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        function startGalaxySelectIntroReveal(now = currentFrameNow || performance.now()) {
            if (galaxySelectIntroRevealComplete) return;
            galaxySelectIntroRevealStart = now;
            galaxySelectIntroCursorPrimed = false;
            if (typeof resetPauseMenuShipCursor === 'function') {
                resetPauseMenuShipCursor();
            }
        }

        function getGalaxySelectIntroRevealAlpha(now) {
            if (galaxySelectIntroRevealComplete || gameState !== 'GALAXY_SELECT' || prefersGalaxySelectIntroReducedMotion()) {
                galaxySelectIntroRevealComplete = true;
                return 1;
            }
            if (galaxySelectIntroRevealStart === null) {
                galaxySelectIntroRevealStart = now;
            }
            const t = Math.max(0, Math.min(1, (now - galaxySelectIntroRevealStart) / GALAXY_SELECT_INTRO_REVEAL_DURATION));
            if (t >= 1) {
                galaxySelectIntroRevealComplete = true;
                return 1;
            }
            return t * t * (3 - 2 * t);
        }

        function ensureGalaxySelectIntroContentLayer() {
            if (
                galaxySelectIntroContentLayer.canvas &&
                galaxySelectIntroContentLayer.ctx &&
                galaxySelectIntroContentLayer.width === width &&
                galaxySelectIntroContentLayer.height === height
            ) {
                return galaxySelectIntroContentLayer;
            }
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            galaxySelectIntroContentLayer.width = canvas.width;
            galaxySelectIntroContentLayer.height = canvas.height;
            galaxySelectIntroContentLayer.canvas = canvas;
            galaxySelectIntroContentLayer.ctx = canvas.getContext('2d', { alpha: true });
            return galaxySelectIntroContentLayer;
        }

        function drawGalaxySelectGalaxyLayerDirect(now, selectedIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            for (let i = 0; i < galaxies.length; i++) {
                const galaxy = galaxies[i];
                const slot = getGalaxySelectSlot(i);
                const selected = i === selectedIndex;
                const highlight = getGalaxySelectHighlightAmount(i, selected, now);
                const radius = getGalaxySelectRenderRadius(i, selected, highlight);
                drawGalaxyGlyphSprite(galaxy, slot.x, slot.y, radius, selected, now, i, {
                    highlightAmount: selected ? 1 : 0
                });

                if (selected) {
                    const cursorTarget = getGalaxyCursorTarget(slot, radius, galaxy, i, now);
                    if (cursorTarget && !cursorTarget.suppressGuide) {
                        drawGalaxyCursorGuide(cursorTarget, galaxy.colors ? galaxy.colors[0] : currentThemeColor, now);
                    }
                }
            }
        }

        function drawGalaxyDossierBackgroundLayer(now, galaxies, selectedIndex) {
            const selectedGalaxy = galaxies[selectedIndex] || galaxies[0];
            if (!selectedGalaxy) return;
            drawGalaxyDossierPanel(now, selectedGalaxy, galaxies, selectedIndex);
        }

        function drawGalaxySelectWorldLayerDirect(now, selectedIndex) {
            drawGalaxySelectBackground(now);
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            drawGalaxyDossierBackgroundLayer(now, galaxies, selectedIndex);
            drawGalaxySelectGalaxyLayerDirect(now, selectedIndex);
        }

        function addSortedGradientStops(gradient, stops) {
            stops
                .map(stop => ({
                    offset: Math.max(0, Math.min(1, stop.offset)),
                    color: stop.color
                }))
                .sort((a, b) => a.offset - b.offset)
                .forEach(stop => gradient.addColorStop(stop.offset, stop.color));
        }

        function getGalaxySelectColorChannels(color, fallback = '#8edbff') {
            const source = String(color || fallback || '#8edbff').trim();
            const rgbMatch = source.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
            if (rgbMatch) {
                return {
                    r: Math.max(0, Math.min(255, parseFloat(rgbMatch[1]) || 0)),
                    g: Math.max(0, Math.min(255, parseFloat(rgbMatch[2]) || 0)),
                    b: Math.max(0, Math.min(255, parseFloat(rgbMatch[3]) || 0))
                };
            }
            const hex = source.startsWith('#') ? source.slice(1) : source;
            if (/^[0-9a-f]{3}$/i.test(hex)) {
                return {
                    r: parseInt(hex[0] + hex[0], 16),
                    g: parseInt(hex[1] + hex[1], 16),
                    b: parseInt(hex[2] + hex[2], 16)
                };
            }
            if (/^[0-9a-f]{6}$/i.test(hex)) {
                return {
                    r: parseInt(hex.slice(0, 2), 16),
                    g: parseInt(hex.slice(2, 4), 16),
                    b: parseInt(hex.slice(4, 6), 16)
                };
            }
            if (source !== fallback) return getGalaxySelectColorChannels(fallback, '#8edbff');
            return { r: 142, g: 219, b: 255 };
        }

        function mixGalaxySelectLabelColor(colorA, colorB, t) {
            const clamped = Math.max(0, Math.min(1, t));
            const a = getGalaxySelectColorChannels(colorA);
            const b = getGalaxySelectColorChannels(colorB);
            const r = Math.round(a.r + (b.r - a.r) * clamped);
            const g = Math.round(a.g + (b.g - a.g) * clamped);
            const blue = Math.round(a.b + (b.b - a.b) * clamped);
            return `rgb(${r}, ${g}, ${blue})`;
        }

        function sampleGalaxySelectAnimatedColor(colors, phase) {
            const palette = (colors && colors.length ? colors : [currentThemeColor, '#ffffff']).filter(Boolean);
            if (palette.length <= 1) return palette[0] || currentThemeColor || '#8edbff';
            const wrapped = ((phase % 1) + 1) % 1;
            const scaled = wrapped * palette.length;
            const index = Math.floor(scaled) % palette.length;
            const nextIndex = (index + 1) % palette.length;
            const t = scaled - Math.floor(scaled);
            const eased = t * t * (3 - 2 * t);
            return mixGalaxySelectLabelColor(palette[index], palette[nextIndex], eased);
        }

        function getGalaxyDossierStats(galaxy) {
            const key = galaxy && galaxy.id;
            const stats = key && GALAXY_DOSSIER_STATS[key] ? GALAXY_DOSSIER_STATS[key] : null;
            if (stats) return stats;
            if (galaxy && galaxy.mode === 'matrixCrawler') {
                return { flux: 38, entropy: 70, density: 52, shear: 40, profile: 'ROOM GRAPH SIGNAL' };
            }
            if (galaxy && galaxy.mode === 'survivor') {
                return { flux: 42, entropy: 28, density: 68, shear: 62, profile: 'SURVIVAL PRESSURE' };
            }
            if (galaxy && galaxy.mode === 'bitshiftScroller') {
                return { flux: 66, entropy: 36, density: 50, shear: 48, profile: 'VECTOR SCROLL' };
            }
            if (galaxy && galaxy.mode === 'shipHub') {
                return { flux: 0, entropy: 0, density: 0, shear: 0, profile: 'FLEET DOCK' };
            }
            return { flux: 62, entropy: 28, density: 54, shear: 56, profile: 'ROUTE BALLISTICS' };
        }

        function truncateGalaxyDossierText(text, maxWidth, font) {
            const source = String(text || '').toUpperCase();
            if (!source) return '';
            galaxyCtx.save();
            galaxyCtx.font = font;
            if (galaxyCtx.measureText(source).width <= maxWidth) {
                galaxyCtx.restore();
                return source;
            }
            let trimmed = source;
            while (trimmed.length > 4 && galaxyCtx.measureText(`${trimmed}...`).width > maxWidth) {
                trimmed = trimmed.slice(0, -1).trim();
            }
            galaxyCtx.restore();
            return `${trimmed}...`;
        }

        function getGalaxyDossierSubtitle(galaxy) {
            if (!galaxy) return 'SIGNAL';
            if (galaxy.subtitle) return galaxy.subtitle;
            if (!galaxy.available) return 'LOCKED SECTOR';
            if (galaxy.mode === 'matrixCrawler') return 'NODE CRAWLER';
            if (galaxy.mode === 'survivor') return 'SURVIVAL RUN';
            if (galaxy.mode === 'bitshiftScroller') return 'VECTOR SCROLL';
            if (galaxy.mode === 'shipHub') return 'SHIP HUB';
            return 'BULLET FLIGHT';
        }

        function getGalaxyDossierReport(galaxy) {
            const desc = galaxy && galaxy.desc ? String(galaxy.desc) : '';
            if (galaxy && galaxy.mode === 'shipHub') {
                return desc || 'Hull telemetry, ship comparison, launch-frame selection.';
            }
            return desc;
        }

        function drawGalaxyTerminalDossierPanel(panelX, panelY, panelW, accent, dimmed, now) {
            const selectedShip = typeof getSelectedShipConfig === 'function' ? getSelectedShipConfig() : null;
            const shipName = selectedShip && selectedShip.name ? String(selectedShip.name).toUpperCase() : 'ACTIVE FRAME';
            const shipColor = selectedShip && selectedShip.previewColor ? selectedShip.previewColor : accent;
            const chipAlpha = dimmed ? 0.32 : 0.58;
            const baseY = panelY + 66;
            const gap = 10;
            const chipW = (panelW - 36 - gap) / 2;
            const chips = [
                { label: 'FRAME', value: shipName, color: shipColor },
                { label: 'DOCK', value: 'SHIP SELECT', color: accent },
                { label: 'SCAN', value: 'HULL TRAITS', color: '#dcecff' },
                { label: 'STATUS', value: 'READY BAY', color: '#9bffcf' }
            ];

            for (let i = 0; i < chips.length; i++) {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const x = panelX + 18 + col * (chipW + gap);
                const y = baseY + row * 20;
                const chip = chips[i];
                const pulse = 0.72 + Math.sin(now * 0.003 + i * 1.7) * 0.18;
                galaxyCtx.fillStyle = colorWithAlpha('#071326', 0.16 * chipAlpha);
                galaxyCtx.fillRect(x, y - 8, chipW, 14);
                galaxyCtx.strokeStyle = colorWithAlpha(chip.color, (0.22 + pulse * 0.08) * chipAlpha);
                galaxyCtx.strokeRect(x + 0.5, y - 7.5, chipW, 14);
                galaxyCtx.font = `bold 8px 'Electrolize', sans-serif`;
                galaxyCtx.textAlign = 'left';
                galaxyCtx.textBaseline = 'middle';
                galaxyCtx.fillStyle = colorWithAlpha(chip.color, 0.72 * chipAlpha);
                galaxyCtx.fillText(chip.label, x + 5, y);
                galaxyCtx.textAlign = 'right';
                galaxyCtx.fillStyle = colorWithAlpha('#ffffff', 0.68 * chipAlpha);
                const valueText = truncateGalaxyDossierText(chip.value, chipW - 50, `bold 8px 'Electrolize', sans-serif`);
                galaxyCtx.fillText(valueText, x + chipW - 5, y);
            }
        }

        function drawGalaxyDossierCornerFrame(x, y, w, h, accent, alpha) {
            const corner = 14;
            galaxyCtx.strokeStyle = colorWithAlpha(accent, 0.46 * alpha);
            galaxyCtx.lineWidth = 1;
            galaxyCtx.beginPath();
            galaxyCtx.moveTo(x, y + corner);
            galaxyCtx.lineTo(x, y);
            galaxyCtx.lineTo(x + corner, y);
            galaxyCtx.moveTo(x + w - corner, y);
            galaxyCtx.lineTo(x + w, y);
            galaxyCtx.lineTo(x + w, y + corner);
            galaxyCtx.moveTo(x + w, y + h - corner);
            galaxyCtx.lineTo(x + w, y + h);
            galaxyCtx.lineTo(x + w - corner, y + h);
            galaxyCtx.moveTo(x + corner, y + h);
            galaxyCtx.lineTo(x, y + h);
            galaxyCtx.lineTo(x, y + h - corner);
            galaxyCtx.stroke();

            galaxyCtx.strokeStyle = colorWithAlpha('#dcecff', 0.063 * alpha);
            galaxyCtx.strokeRect(x + 8.5, y + 8.5, w - 17, h - 17);
        }

        function updateGalaxyDossierAnimatedStats(galaxy, stats, now) {
            const id = galaxy && galaxy.id ? galaxy.id : 'unknown';
            const frameNow = Number.isFinite(now) ? now : performance.now();
            const firstRun = !galaxyDossierStatState.galaxyId;
            if (galaxyDossierStatState.galaxyId !== id) {
                galaxyDossierStatState.galaxyId = id;
                galaxyDossierStatState.scrambleUntil = frameNow + (firstRun ? 0 : 360);
                galaxyDossierStatState.scrambleSeed = Math.floor(galaxyNoise(2300, frameNow * 0.001 + id.length) * 10000);
                for (const stat of GALAXY_DOSSIER_STAT_LABELS) {
                    const next = Number(stats[stat.key]) || 0;
                    if (firstRun) galaxyDossierStatState.values[stat.key] = next;
                    galaxyDossierStatState.targets[stat.key] = next;
                }
                galaxyDossierStatState.lastNow = frameNow;
            }

            const dt = Math.max(0, Math.min(0.06, (frameNow - (galaxyDossierStatState.lastNow || frameNow)) / 1000));
            const step = 1 - Math.exp(-8.4 * dt);
            for (const stat of GALAXY_DOSSIER_STAT_LABELS) {
                const key = stat.key;
                const target = galaxyDossierStatState.targets[key];
                galaxyDossierStatState.values[key] += (target - galaxyDossierStatState.values[key]) * step;
                if (Math.abs(target - galaxyDossierStatState.values[key]) < 0.08) galaxyDossierStatState.values[key] = target;
            }
            galaxyDossierStatState.lastNow = frameNow;
            return galaxyDossierStatState.values;
        }

        function getGalaxyDossierDisplayNumber(key, value, now) {
            const frameNow = Number.isFinite(now) ? now : performance.now();
            if (frameNow < galaxyDossierStatState.scrambleUntil) {
                const ticks = Math.floor(frameNow / 42);
                const seed = galaxyDossierStatState.scrambleSeed + ticks * 17 + key.length * 31;
                const scrambled = Math.floor(galaxyNoise(2400 + seed, ticks) * 100);
                return String(scrambled).padStart(2, '0');
            }
            return String(Math.round(Math.max(0, Math.min(100, value)))).padStart(2, '0');
        }

        function getGalaxyDossierLowerLabelClearance(galaxies, selectedIndex, now) {
            if (!Array.isArray(galaxies)) return height * 0.75;
            let lowest = height * 0.60;
            for (let i = 0; i < galaxies.length; i++) {
                const slot = getGalaxySelectSlot(i);
                const highlight = getGalaxySelectHighlightAmount(i, i === selectedIndex, now);
                const radius = getGalaxySelectRenderRadius(i, i === selectedIndex, highlight);
                if (slot.y < height * 0.48) continue;
                lowest = Math.max(lowest, slot.y + radius + 48);
            }
            return lowest;
        }

        function drawGalaxyDossierStatBar(label, value, x, y, w, accent, dimmed, phase, statKey, now) {
            const ratio = Math.max(0, Math.min(1, (Number(value) || 0) / 100));
            const labelW = Math.min(116, Math.max(96, w * 0.42));
            const valueW = 28;
            const barX = x + labelW + 2;
            const barW = Math.max(36, w - labelW - valueW - 10);
            const barH = 6;
            const barY = y - barH / 2;
            const alpha = dimmed ? 0.36 : 0.77;
            const statColor = dimmed ? mixGalaxySelectLabelColor(accent, '#8793a8', 0.72) : accent;

            galaxyCtx.textAlign = 'left';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.font = `bold 9px 'Electrolize', sans-serif`;
            const labelPad = 5;
            const labelBoxW = Math.min(labelW - 8, Math.max(34, Math.ceil(galaxyCtx.measureText(label).width + labelPad * 2)));
            const labelBoxH = 14;
            galaxyCtx.fillStyle = colorWithAlpha('#071326', (dimmed ? 0.20 : 0.27) * alpha);
            galaxyCtx.fillRect(x, y - labelBoxH / 2, labelBoxW, labelBoxH);
            galaxyCtx.strokeStyle = colorWithAlpha(statColor, (dimmed ? 0.26 : 0.34) * alpha);
            galaxyCtx.strokeRect(x + 0.5, y - labelBoxH / 2 + 0.5, labelBoxW, labelBoxH);
            galaxyCtx.fillStyle = colorWithAlpha('#eff8ff', (dimmed ? 0.58 : 0.68) * alpha);
            galaxyCtx.fillText(label, x + labelPad, y + 0.5);

            galaxyCtx.fillStyle = dimmed ? 'rgba(210, 236, 255, 0.035)' : 'rgba(210, 236, 255, 0.052)';
            galaxyCtx.fillRect(barX, barY, barW, barH);
            galaxyCtx.fillStyle = dimmed ? 'rgba(0, 0, 0, 0.11)' : 'rgba(0, 0, 0, 0.145)';
            galaxyCtx.fillRect(barX + barW * ratio, barY, Math.max(0, barW * (1 - ratio)), barH);

            const fillW = Math.max(3, barW * ratio);
            const gradient = galaxyCtx.createLinearGradient(barX, barY, barX + barW, barY);
            gradient.addColorStop(0, colorWithAlpha(statColor, 0.78 * alpha));
            gradient.addColorStop(0.72, colorWithAlpha(mixGalaxySelectLabelColor(statColor, '#ffffff', 0.45), 0.90 * alpha));
            gradient.addColorStop(1, colorWithAlpha('#ffffff', 0.95 * alpha));
            galaxyCtx.fillStyle = gradient;
            galaxyCtx.fillRect(barX, barY, fillW, barH);

            galaxyCtx.fillStyle = colorWithAlpha('#ffffff', (dimmed ? 0.10 : 0.14) * alpha);
            galaxyCtx.fillRect(barX, barY, fillW, 1);

            const scanX = barX + ((phase % 1 + 1) % 1) * Math.max(1, fillW);
            galaxyCtx.fillStyle = colorWithAlpha('#ffffff', (dimmed ? 0.10 : 0.13) * alpha);
            galaxyCtx.fillRect(scanX, barY, 1, barH);

            galaxyCtx.textAlign = 'right';
            galaxyCtx.font = `bold 10px 'Electrolize', sans-serif`;
            galaxyCtx.fillStyle = colorWithAlpha('#ffffff', (dimmed ? 0.76 : 0.85) * alpha);
            galaxyCtx.fillText(getGalaxyDossierDisplayNumber(statKey, value, now), x + w, y);
        }

        function drawGalaxyDossierPanel(now, galaxy, galaxies, selectedIndex) {
            const stats = getGalaxyDossierStats(galaxy);
            const displayStats = updateGalaxyDossierAnimatedStats(galaxy, stats, now);
            const colors = galaxy && galaxy.colors && galaxy.colors.length ? galaxy.colors : [currentThemeColor, '#ffffff'];
            const accent = sampleGalaxySelectAnimatedColor(colors, now * 0.00007 + (galaxy && galaxy.seed ? galaxy.seed * 0.003 : 0));
            const dimmed = !!(galaxy && !galaxy.available);
            const compact = width < 660;
            const terminalPanel = !!(galaxy && galaxy.mode === 'shipHub');
            const panelW = Math.max(compact ? 300 : 340, Math.min(width - (compact ? 72 : 260), compact ? 430 : 480));
            const panelH = compact ? 140 : 106;
            const panelX = width / 2 - panelW / 2;
            const lowerLabelClearance = getGalaxyDossierLowerLabelClearance(galaxies, selectedIndex, now);
            const panelBottomLimit = height - panelH - (compact ? 58 : 62);
            const panelY = Math.min(panelBottomLimit, Math.max(lowerLabelClearance + 10, height - panelH - (compact ? 92 : 78)));
            const panelAlpha = dimmed ? 0.42 : 0.66;
            const title = String((galaxy && (galaxy.title || galaxy.name)) || 'UNKNOWN ROUTE').toUpperCase();
            const subtitle = String(getGalaxyDossierSubtitle(galaxy)).toUpperCase();
            const reportSource = getGalaxyDossierReport(galaxy);
            const report = truncateGalaxyDossierText(reportSource, panelW - 34, `bold 9px 'Electrolize', sans-serif`);

            galaxyCtx.save();
            galaxyCtx.globalAlpha = 1;
            const panelGradient = galaxyCtx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
            panelGradient.addColorStop(0, `rgba(5, 15, 30, ${(dimmed ? 0.22 : 0.29) * panelAlpha})`);
            panelGradient.addColorStop(0.58, `rgba(2, 8, 17, ${(dimmed ? 0.52 : 0.61) * panelAlpha})`);
            panelGradient.addColorStop(1, `rgba(6, 14, 26, ${(dimmed ? 0.24 : 0.31) * panelAlpha})`);
            galaxyCtx.fillStyle = panelGradient;
            galaxyCtx.fillRect(panelX, panelY, panelW, panelH);

            galaxyCtx.globalCompositeOperation = 'screen';
            if (!dimmed) {
                const activeWash = galaxyCtx.createLinearGradient(panelX, panelY, panelX + panelW, panelY);
                activeWash.addColorStop(0, colorWithAlpha(accent, 0.009));
                activeWash.addColorStop(0.50, colorWithAlpha('#ffffff', 0.011));
                activeWash.addColorStop(1, colorWithAlpha(accent, 0.007));
                galaxyCtx.fillStyle = activeWash;
                galaxyCtx.fillRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);
            }
            galaxyCtx.strokeStyle = colorWithAlpha(accent, (dimmed ? 0.13 : 0.31));
            galaxyCtx.lineWidth = 1;
            galaxyCtx.strokeRect(panelX + 0.5, panelY + 0.5, panelW, panelH);
            drawGalaxyDossierCornerFrame(panelX + 6, panelY + 6, panelW - 12, panelH - 12, accent, dimmed ? 0.42 : 0.89);

            galaxyCtx.globalAlpha = dimmed ? 0.18 : 0.34;
            galaxyCtx.strokeStyle = colorWithAlpha(accent, dimmed ? 0.48 : 0.55);
            galaxyCtx.beginPath();
            galaxyCtx.moveTo(panelX + 14, panelY + 5);
            galaxyCtx.lineTo(panelX + panelW - 14, panelY + 5);
            galaxyCtx.moveTo(panelX + 14, panelY + panelH - 5);
            galaxyCtx.lineTo(panelX + panelW - 14, panelY + panelH - 5);
            galaxyCtx.stroke();
            galaxyCtx.globalAlpha = 1;

            const scanY = panelY + 20 + ((now * 0.018) % Math.max(1, panelH - 40));
            galaxyCtx.fillStyle = colorWithAlpha('#ffffff', dimmed ? 0.014 : 0.035);
            galaxyCtx.fillRect(panelX + 18, scanY, panelW - 36, 1);
            galaxyCtx.globalCompositeOperation = 'source-over';

            galaxyCtx.textAlign = 'left';
            galaxyCtx.textBaseline = 'middle';
            const titleFont = `bold 11px 'Electrolize', sans-serif`;
            const subtitleFont = `bold 8px 'Electrolize', sans-serif`;
            const titleMax = terminalPanel ? panelW * 0.44 : panelW * 0.48;
            const titleText = truncateGalaxyDossierText(title, titleMax, titleFont);
            galaxyCtx.font = titleFont;
            galaxyCtx.fillStyle = colorWithAlpha(accent, dimmed ? 0.42 : 0.85);
            galaxyCtx.fillText(titleText, panelX + 18, panelY + 18);

            const titleWidth = galaxyCtx.measureText(titleText).width;
            const subtitleX = panelX + 18 + titleWidth + 10;
            const subtitleMax = Math.max(42, panelX + panelW - 18 - subtitleX);
            const subtitleText = truncateGalaxyDossierText(subtitle, subtitleMax, subtitleFont);
            galaxyCtx.font = subtitleFont;
            galaxyCtx.fillStyle = dimmed ? 'rgba(218, 226, 240, 0.28)' : colorWithAlpha('#f1f8ff', 0.55);
            galaxyCtx.fillText(subtitleText, subtitleX, panelY + 18);

            galaxyCtx.textAlign = 'left';
            galaxyCtx.font = `bold 9px 'Electrolize', sans-serif`;
            galaxyCtx.fillStyle = dimmed ? 'rgba(206, 216, 232, 0.26)' : 'rgba(234, 246, 255, 0.49)';
            galaxyCtx.fillText(report, panelX + 18, panelY + 40);

            const statTop = panelY + (compact ? 66 : 68);
            if (terminalPanel) {
                drawGalaxyTerminalDossierPanel(panelX, panelY, panelW, accent, dimmed, now);
            } else if (compact) {
                const statW = panelW - 36;
                for (let i = 0; i < GALAXY_DOSSIER_STAT_LABELS.length; i++) {
                    const stat = GALAXY_DOSSIER_STAT_LABELS[i];
                    drawGalaxyDossierStatBar(stat.label, displayStats[stat.key], panelX + 18, statTop + i * 17, statW, accent, dimmed, now * 0.00018 + i * 0.19, stat.key, now);
                }
            } else {
                const gap = 24;
                const statW = (panelW - 36 - gap) / 2;
                for (let i = 0; i < GALAXY_DOSSIER_STAT_LABELS.length; i++) {
                    const stat = GALAXY_DOSSIER_STAT_LABELS[i];
                    const col = i % 2;
                    const row = Math.floor(i / 2);
                    drawGalaxyDossierStatBar(
                        stat.label,
                        displayStats[stat.key],
                        panelX + 18 + col * (statW + gap),
                        statTop + row * 21,
                        statW,
                        accent,
                        dimmed,
                        now * 0.00018 + i * 0.17,
                        stat.key,
                        now
                    );
                }
            }

            galaxyCtx.restore();
            galaxyDossierLayerState.promptY = panelY + panelH + 26;
            return galaxyDossierLayerState.promptY;
        }

        function drawGalaxySelectMiniVisualizer(now, galaxy) {
            if (width < 620 || height < 500 || typeof drawMusicPlayerVisualizer !== 'function') return;

            const musicStatus = typeof getMusicPlayerStatus === 'function' ? getMusicPlayerStatus() : null;
            const musicPlayerActive = !!(musicStatus && musicStatus.isPlaying);
            const signal = musicPlayerActive && typeof getMusicPlayerReactiveSignal === 'function'
                ? getMusicPlayerReactiveSignal()
                : (typeof getGameAudioReactiveSignal === 'function'
                    ? getGameAudioReactiveSignal()
                    : {
                        bass: 0.16,
                        bassGuitar: 0.18,
                        bassPulse: 0.08,
                        drumSnap: 0.12,
                        leadTone: 0.16,
                        air: 0.12,
                        mid: 0.15,
                        highMid: 0.18,
                        treble: 0.12,
                        energy: 0.18,
                        pulse: 0.08,
                        activity: 0.40,
                        phase: (now || 0) * 0.00004
                    });
            const colors = galaxy && galaxy.colors && galaxy.colors.length ? galaxy.colors : [currentThemeColor, '#8ff7ff', '#ffffff'];
            const accent = sampleGalaxySelectAnimatedColor(colors, (Number.isFinite(now) ? now : performance.now()) * 0.000055 + (galaxy && galaxy.seed ? galaxy.seed * 0.004 : 0));
            const cloneScale = 0.50;
            const sourceW = Math.round(Math.max(174, Math.min(250, width * 0.215)));
            const sourceH = Math.round(sourceW * 0.56);
            const displayW = sourceW * cloneScale;
            const displayX = Math.round(width - displayW - Math.max(28, width * 0.027));
            const displayY = Math.round(Math.max(48, height * 0.052));

            galaxyCtx.save();
            galaxyCtx.translate(displayX, displayY);
            galaxyCtx.scale(cloneScale, cloneScale);
            drawMusicPlayerVisualizer(0, 0, sourceW, sourceH, accent, { isPlaying: true }, {
                embedded: true,
                forceActive: true,
                signal,
                alphaScale: 0.48,
                context: galaxyCtx,
                left: 0,
                right: sourceW,
                topY: 0,
                bottomY: sourceH
            });
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.globalCompositeOperation = 'source-over';
            galaxyCtx.shadowBlur = 0;
        }

        function drawGalaxySelectUiLayer(now, galaxies, selectedIndex) {
            galaxyCtx.save();
            galaxyCtx.textAlign = 'center';
            galaxyCtx.textBaseline = 'middle';
            galaxyCtx.font = `bold 34px 'Electrolize', sans-serif`;
            galaxyCtx.fillStyle = '#f2fbff';
            galaxyCtx.shadowColor = currentThemeColor;
            galaxyCtx.shadowBlur = glowEnabled ? 18 : 0;
            galaxyCtx.fillText('GALAXY SELECT', width / 2, height * GALAXY_SELECT_TITLE_Y);
            galaxyCtx.shadowBlur = 0;
            galaxyCtx.font = `12px 'Electrolize', sans-serif`;
            galaxyCtx.fillStyle = 'rgba(202, 229, 255, 0.72)';
            galaxyCtx.fillText('Choose your destination', width / 2, height * GALAXY_SELECT_SUBTITLE_Y);
            drawGalaxySelectMiniVisualizer(now, galaxies[selectedIndex]);

            for (let i = 0; i < galaxies.length; i++) {
                const galaxy = galaxies[i];
                const slot = getGalaxySelectSlot(i);
                const selected = i === selectedIndex;
                const highlight = getGalaxySelectHighlightAmount(i, selected, now);
                const radius = getGalaxySelectRenderRadius(i, selected, highlight);

                const hubRoute = galaxy && galaxy.mode === 'shipHub';
                const survivorRoute = galaxy && galaxy.mode === 'survivor';
                const crawlerRoute = galaxy && galaxy.mode === 'matrixCrawler';
                const labelY = slot.y + radius + 16;
                const labelText = galaxy.title || galaxy.name;
                const titleAlpha = galaxy.available ? (0.62 + highlight * 0.28) : (0.34 + highlight * 0.16);
                galaxyCtx.font = `bold ${14 + highlight * 4}px 'Electrolize', sans-serif`;
                const labelWidth = Math.max(70, galaxyCtx.measureText(labelText).width);
                const titleGradient = galaxyCtx.createLinearGradient(slot.x - labelWidth / 2, labelY, slot.x + labelWidth / 2, labelY);
                const titleColors = galaxy.colors && galaxy.colors.length ? galaxy.colors : [currentThemeColor, '#ffffff'];
                const titleNeutral = galaxy.available ? '#dcecff' : '#9da7b8';
                const titleMix = galaxy.available ? (0.72 - highlight * 0.22) : 0.82;
                const colorShift = galaxy.available ? highlight : highlight * 0.32;
                const colorPhase = now * 0.000085 + i * 0.173;
                for (let colorIndex = 0; colorIndex < titleColors.length; colorIndex++) {
                    const stop = titleColors.length === 1 ? 0 : colorIndex / (titleColors.length - 1);
                    const animatedColor = sampleGalaxySelectAnimatedColor(titleColors, colorPhase + stop * 0.62);
                    const baseColor = colorShift > 0 ? mixGalaxySelectLabelColor(titleColors[colorIndex], animatedColor, colorShift) : titleColors[colorIndex];
                    const softenedColor = mixGalaxySelectLabelColor(baseColor, titleNeutral, titleMix);
                    titleGradient.addColorStop(stop, colorWithAlpha(softenedColor, titleAlpha));
                }
                galaxyCtx.fillStyle = titleGradient;
                const animatedAccent = colorShift > 0
                    ? sampleGalaxySelectAnimatedColor(titleColors, colorPhase + 0.35)
                    : (galaxy.colors ? (galaxy.colors[1] || galaxy.colors[0]) : currentThemeColor);
                galaxyCtx.shadowColor = animatedAccent;
                galaxyCtx.shadowBlur = glowEnabled ? 9 * highlight : 0;
                galaxyCtx.fillText(labelText, slot.x, labelY);
                if (highlight > 0.02) {
                    const scanPhase = (now * 0.00022 + i * 0.19) % 1;
                    const scanGradient = galaxyCtx.createLinearGradient(slot.x - labelWidth / 2, labelY, slot.x + labelWidth / 2, labelY);
                    const scanColor = galaxy.available ? animatedAccent : '#dce2ee';
                    addSortedGradientStops(scanGradient, [
                        { offset: 0, color: 'rgba(255,255,255,0)' },
                        { offset: scanPhase - 0.18, color: 'rgba(255,255,255,0)' },
                        { offset: scanPhase - 0.04, color: colorWithAlpha(mixGalaxySelectLabelColor(scanColor, '#ffffff', 0.48), (galaxy.available ? 0.18 : 0.08) * highlight) },
                        { offset: scanPhase, color: colorWithAlpha('#ffffff', (galaxy.available ? 0.34 : 0.16) * highlight) },
                        { offset: scanPhase + 0.13, color: 'rgba(255,255,255,0)' },
                        { offset: 1, color: 'rgba(255,255,255,0)' }
                    ]);
                    galaxyCtx.fillStyle = scanGradient;
                    galaxyCtx.shadowBlur = glowEnabled ? 6 * highlight : 0;
                    galaxyCtx.fillText(labelText, slot.x, labelY);
                }
                galaxyCtx.shadowBlur = 0;
                galaxyCtx.font = `bold 11px 'Electrolize', sans-serif`;
                const statusText = galaxy.available
                    ? (galaxy.subtitle || (hubRoute ? 'SHIP HUB' : (survivorRoute ? 'SURVIVAL RUN' : (crawlerRoute ? 'NODE CRAWLER' : 'BULLET FLIGHT'))))
                    : 'LOCKED';
                const statusColor = colorShift > 0.01 && galaxy.available
                    ? mixGalaxySelectLabelColor('#8edbff', sampleGalaxySelectAnimatedColor(titleColors, colorPhase + 0.68), highlight * 0.34)
                    : '#8edbff';
                galaxyCtx.fillStyle = galaxy.available
                    ? colorWithAlpha(statusColor, 0.62 + highlight * 0.24)
                    : colorWithAlpha('#a9b0bf', 0.48 + highlight * 0.20);
                galaxyCtx.shadowColor = galaxy.available ? mixGalaxySelectLabelColor('#42cfff', animatedAccent, colorShift * 0.42) : '#707989';
                galaxyCtx.shadowBlur = glowEnabled ? (galaxy.available ? 5 : 2) * highlight : 0;
                galaxyCtx.fillText(statusText, slot.x, labelY + 20);
                galaxyCtx.shadowBlur = 0;

            }
            const promptY = galaxyDossierLayerState.promptY || Math.min(height - 40, height * 0.90);
            if (galaxySelectNoticeTimer > 0 && galaxySelectNotice) {
                galaxyCtx.font = `bold 18px 'Electrolize', sans-serif`;
                galaxyCtx.fillStyle = '#ff8fb5';
                galaxyCtx.shadowColor = '#ff5e8a';
                galaxyCtx.shadowBlur = glowEnabled ? 12 : 0;
                galaxyCtx.fillText(galaxySelectNotice, width / 2, promptY);
            } else {
                galaxyCtx.font = `12px 'Electrolize', sans-serif`;
                galaxyCtx.fillStyle = 'rgba(202, 229, 255, 0.58)';
                galaxyCtx.fillText('ENTER / SPACE TO SELECT    ESC FOR MENU', width / 2, promptY);
            }
            drawGalaxyLayoutEditorOverlay(now, galaxies, selectedIndex);
            galaxyCtx.restore();
        }

        function drawGalaxySelectBaseLayerDirect(now, selectedIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            drawGalaxySelectWorldLayerDirect(now, selectedIndex);
            drawGalaxySelectUiLayer(now, galaxies, selectedIndex);
        }

        function drawGalaxySelectContentDirect(now, selectedIndex, showCursor = true) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            drawGalaxyDossierBackgroundLayer(now, galaxies, selectedIndex);
            drawGalaxySelectGalaxyLayerDirect(now, selectedIndex);
            drawGalaxySelectUiLayer(now, galaxies, selectedIndex);
            const cursorTarget = showCursor ? getGalaxySelectCurrentCursorTarget(now, selectedIndex) : null;
            if (showCursor && cursorTarget) drawGalaxySelectCursor(cursorTarget, { suppressTrail: true });
        }

        function drawGalaxySelectIntroContentLayer(now, selectedIndex, showCursor, alpha) {
            const layer = ensureGalaxySelectIntroContentLayer();
            if (!layer || !layer.ctx || !layer.canvas) {
                drawGalaxySelectContentDirect(now, selectedIndex, showCursor);
                return;
            }

            const previousGalaxyCtx = galaxyCtx;
            galaxyCtx = layer.ctx;
            layer.ctx.setTransform(1, 0, 0, 1, 0, 0);
            layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
            layer.ctx.globalAlpha = 1;
            layer.ctx.globalCompositeOperation = 'source-over';
            layer.ctx.shadowBlur = 0;
            try {
                drawGalaxySelectContentDirect(now, selectedIndex, false);
            } finally {
                galaxyCtx = previousGalaxyCtx;
            }

            galaxyCtx.save();
            galaxyCtx.globalAlpha = alpha;
            galaxyCtx.drawImage(layer.canvas, 0, 0);
            galaxyCtx.restore();
            galaxyCtx.globalAlpha = 1;
            galaxyCtx.shadowBlur = 0;

            const cursorTarget = showCursor ? getGalaxySelectCurrentCursorTarget(now, selectedIndex) : null;
            if (showCursor && cursorTarget) {
                galaxyCtx.save();
                galaxyCtx.globalAlpha = alpha;
                drawGalaxySelectCursor(cursorTarget, { suppressTrail: true, introFlyIn: true });
                galaxyCtx.restore();
                galaxyCtx.globalAlpha = 1;
                galaxyCtx.shadowBlur = 0;
            }
        }

        function getGalaxySelectCurrentCursorTarget(now, selectedIndex = selectedGalaxyIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            const galaxy = galaxies[selectedIndex] || galaxies[0];
            if (!galaxy) return null;
            const slot = getGalaxySelectSlot(selectedIndex);
            const highlight = getGalaxySelectHighlightAmount(selectedIndex, true, now);
            const radius = getGalaxySelectRenderRadius(selectedIndex, true, highlight);
            return getGalaxyCursorTarget(slot, radius, galaxy, selectedIndex, now);
        }

        function drawGalaxySelectScreen(now, showCursor = true) {
            const revealAlpha = getGalaxySelectIntroRevealAlpha(now);
            if (revealAlpha < 0.999) {
                drawGalaxySelectBackground(now);
                drawGalaxySelectIntroContentLayer(now, selectedGalaxyIndex, showCursor, revealAlpha);
                return;
            }
            drawGalaxySelectBaseLayerDirect(now, selectedGalaxyIndex);
            const cursorTarget = showCursor ? getGalaxySelectCurrentCursorTarget(now, selectedGalaxyIndex) : null;
            if (showCursor && cursorTarget) drawGalaxySelectCursor(cursorTarget);
        }

        function easeGalaxyWarp(t) {
            const clamped = Math.max(0, Math.min(1, t));
            return clamped * clamped * (3 - clamped * 2);
        }

        function lerpGalaxyWarp(a, b, t) {
            return a + (b - a) * t;
        }

        function getGalaxyWarpCamera(progress, targetX, targetY) {
            const fadeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.02) / 0.34)));
            const focusT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.04) / 0.58)));
            const zoomT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.22) / 0.58)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.56) / 0.32)));
            const handoffT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.80) / 0.18)));
            const pullX = Math.min(1, focusT * 0.78 + surgeT * 0.18 + handoffT * 0.04);
            const pullY = Math.min(1, focusT * 0.74 + surgeT * 0.20 + handoffT * 0.06);
            return {
                focusX: lerpGalaxyWarp(targetX, width / 2, pullX),
                focusY: lerpGalaxyWarp(targetY, height * 0.48, pullY),
                zoom: 1 + focusT * 0.12 + zoomT * 0.22 + surgeT * 0.42 + handoffT * 0.22,
                fadeT,
                focusT,
                zoomT,
                surgeT,
                handoffT
            };
        }

        function galaxyWarpWorldToScreen(x, y, camera, targetX, targetY) {
            return {
                x: camera.focusX + (x - targetX) * camera.zoom,
                y: camera.focusY + (y - targetY) * camera.zoom
            };
        }

        function drawGalaxyWarpWorldLayer(now, selectedIndex) {
            drawGalaxySelectWorldLayerDirect(now, selectedIndex);
        }

        function prepareGalaxyWarpMenuSnapshot(now = currentFrameNow || performance.now(), selectedIndex = selectedGalaxyIndex) {
            if (width <= 0 || height <= 0) return null;
            const stamp = Math.floor((now || 0) / 50);
            const selectedShipForSnapshot = typeof getSelectedShipConfig === 'function'
                ? getSelectedShipConfig()
                : null;
            const selectedShipKey = selectedShipForSnapshot && selectedShipForSnapshot.id
                ? selectedShipForSnapshot.id
                : '';
            const cache = galaxyWarpMenuSnapshotCache;
            if (
                cache.canvas &&
                cache.width === width &&
                cache.height === height &&
                cache.selectedIndex === selectedIndex &&
                cache.shipKey === selectedShipKey &&
                cache.stamp === stamp
            ) {
                return cache.canvas;
            }
            if (!cache.canvas) cache.canvas = document.createElement('canvas');
            if (cache.canvas.width !== width || cache.canvas.height !== height) {
                cache.canvas.width = width;
                cache.canvas.height = height;
            }
            const cacheCtx = cache.canvas.getContext('2d', { alpha: false });
            if (!cacheCtx) return null;
            const previousCtx = galaxyCtx;
            galaxyCtx = cacheCtx;
            cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
            cacheCtx.globalAlpha = 1;
            cacheCtx.globalCompositeOperation = 'source-over';
            cacheCtx.shadowBlur = 0;
            try {
                drawGalaxySelectBaseLayerDirect(now, selectedIndex);
            } finally {
                galaxyCtx = previousCtx;
            }
            cache.width = width;
            cache.height = height;
            cache.selectedIndex = selectedIndex;
            cache.shipKey = selectedShipKey;
            cache.stamp = stamp;
            return cache.canvas;
        }

        function getGalaxyWarpSelectedGalaxy(selectedIndex) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            return galaxies[selectedIndex] || galaxies[0] || getGalaxyDefinition(0);
        }

        function getGalaxyWarpPortalCenter(progress, targetX, targetY) {
            const firstDrift = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.04) / 0.58)));
            const finalPull = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.56) / 0.32)));
            const handoffPull = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.80) / 0.18)));
            return {
                x: lerpGalaxyWarp(targetX, width / 2, Math.min(1, firstDrift * 0.78 + finalPull * 0.18 + handoffPull * 0.04)),
                y: lerpGalaxyWarp(targetY, height * 0.48, Math.min(1, firstDrift * 0.74 + finalPull * 0.20 + handoffPull * 0.06))
            };
        }

        function getGalaxyWarpPortalRadius(progress, selectedIndex) {
            const baseRadius = getGalaxySelectRenderRadius(selectedIndex, true);
            const mapZoomT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.04) / 0.58)));
            const growT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.30) / 0.40)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.32)));
            const handoffT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.82) / 0.16)));
            const mapMatchedRadius = baseRadius * (1 + mapZoomT * 0.08);
            const travelRadius = baseRadius * (1.08 + growT * 1.06);
            const approachRadius = lerpGalaxyWarp(mapMatchedRadius, travelRadius, growT);
            const finalRadius = Math.max(width, height) * 0.62;
            return lerpGalaxyWarp(approachRadius, finalRadius, Math.min(1, surgeT * 0.82 + handoffT * 0.18));
        }

        function drawGalaxyWarpExactGlyphLayer(now, galaxy, selectedIndex, centerX, centerY, spriteRadius, spriteScale, alpha, options = {}) {
            if (!galaxy || alpha <= 0.01 || spriteScale <= 0.01 || width <= 0 || height <= 0) return;

            const cache = galaxyWarpExactGlyphLayerCache;
            if (!cache.canvas) cache.canvas = document.createElement('canvas');
            if (cache.width !== width || cache.height !== height) {
                cache.canvas.width = width;
                cache.canvas.height = height;
                cache.width = width;
                cache.height = height;
                cache.drawKey = '';
                cache.drawn = false;
            }

            const layerCtx = cache.canvas.getContext('2d', { alpha: true });
            if (!layerCtx) return;

            const freeze = !!options.freeze && cache.drawn;
            const frameFps = Math.max(12, Math.min(72, options.fps || 60));
            const frameMs = 1000 / frameFps;
            const frameNow = Number.isFinite(options.frameNow) ? options.frameNow : now;
            const stamp = Math.floor((frameNow || 0) / frameMs);
            const trackTransform = !!options.trackTransform;
            const drawKey = [
                galaxy && galaxy.id ? galaxy.id : selectedIndex,
                selectedIndex,
                Math.round(spriteRadius * 2),
                stamp,
                trackTransform ? Math.round(centerX) : '',
                trackTransform ? Math.round(centerY) : '',
                trackTransform ? Math.round(spriteScale * 180) : ''
            ].join('|');

            if (!freeze && cache.drawKey !== drawKey) {
                const previousCtx = galaxyCtx;
                galaxyCtx = layerCtx;
                layerCtx.setTransform(1, 0, 0, 1, 0, 0);
                layerCtx.clearRect(0, 0, width, height);
                layerCtx.globalAlpha = 1;
                layerCtx.globalCompositeOperation = 'source-over';
                layerCtx.shadowBlur = 0;
                try {
                    layerCtx.save();
                    layerCtx.translate(centerX, centerY);
                    layerCtx.scale(spriteScale, spriteScale);
                    drawGalaxyGlyphSpriteDirect(galaxy, 0, 0, spriteRadius, true, now, selectedIndex, {
                        detail: GALAXY_WARP_FOCUSED_DETAIL,
                        fontScale: GALAXY_WARP_FOCUSED_FONT_SCALE,
                        noCache: true,
                        suppressPerGlyphGlow: true,
                        vectorGlyphs: isPrismArrayGalaxySprite(galaxy)
                    });
                    layerCtx.restore();
                } finally {
                    galaxyCtx = previousCtx;
                }
                cache.drawKey = drawKey;
                cache.drawn = true;
            }

            if (!cache.drawn) return;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = alpha;
            ctx.drawImage(cache.canvas, 0, 0);
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpPortal(now, progress, selectedIndex, color, centerX, centerY) {
            const galaxy = getGalaxyWarpSelectedGalaxy(selectedIndex);
            if (!galaxy) return;

            const colors = galaxy.colors || [color, '#ffffff'];
            const radius = getGalaxyWarpPortalRadius(progress, selectedIndex);
            const enterT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.03) / 0.22)));
            const growT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.16) / 0.56)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.32)));
            const fadeOut = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.94) / 0.06)));
            const alpha = enterT * (1 - fadeOut * 0.28);
            if (alpha <= 0.01) return;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const aura = ctx.createRadialGradient(centerX, centerY, radius * 0.06, centerX, centerY, radius * 1.38);
            aura.addColorStop(0, colorWithAlpha('#ffffff', 0.18 * alpha));
            aura.addColorStop(0.20, colorWithAlpha(colors[2] || colors[1] || '#ffffff', 0.13 * alpha));
            aura.addColorStop(0.50, colorWithAlpha(colors[1] || colors[0], 0.08 * alpha));
            aura.addColorStop(1, colorWithAlpha(colors[0] || color, 0));
            ctx.fillStyle = aura;
            ctx.fillRect(0, 0, width, height);

            ctx.lineCap = 'round';
            for (let ring = 0; ring < 3; ring++) {
                const ringT = ring / 2;
                const spin = now * 0.00016 * (ring % 2 ? -1 : 1);
                const ringRadius = radius * (0.68 + ringT * 0.28 + growT * 0.08);
                ctx.globalAlpha = alpha * (0.12 + surgeT * 0.10) * (1 - ringT * 0.18);
                ctx.strokeStyle = colorWithAlpha(colors[(ring + 1) % colors.length] || color, 0.68);
                ctx.lineWidth = Math.max(1, radius * (0.006 + ringT * 0.004));
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, ringRadius * 1.12, ringRadius * 0.44, spin + ringT * 0.72, 0, Math.PI * 2);
                ctx.stroke();
            }

            const transitionStart = galaxyWarpTransition && Number.isFinite(galaxyWarpTransition.startedAt)
                ? galaxyWarpTransition.startedAt
                : now;
            const liveTimeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.34) / 0.34)));
            const spriteNow = lerpGalaxyWarp(transitionStart, now, liveTimeT);
            const spriteRadius = Math.max(48, getGalaxySelectRenderRadius(selectedIndex, true));
            const spriteScale = Math.max(0.35, radius / spriteRadius);
            const crispT = easeGalaxyWarp(Math.max(0, Math.min(1, (spriteScale - 1.24) / 1.18)));
            const isPrismWarp = galaxy.mode === 'survivor' || getGalaxyRenderStyle(galaxy) === 'prismArray';
            const freezeStart = isPrismWarp ? 1.02 : 0.76;
            const fadeStart = isPrismWarp ? 0.82 : 0.80;
            const fadeDuration = isPrismWarp ? 0.12 : 0.14;
            const lateGlyphFade = 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - fadeStart) / fadeDuration)));
            const rasterAlpha = alpha * (0.90 + surgeT * 0.10) * Math.max(0, 1 - crispT) * lateGlyphFade;
            const exactGlyphAlpha = alpha * crispT * (0.92 + surgeT * 0.08) * lateGlyphFade;
            if (rasterAlpha > 0.018) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.scale(spriteScale, spriteScale);
                ctx.globalAlpha = rasterAlpha;
                drawGalaxyGlyphSprite(galaxy, 0, 0, spriteRadius, true, spriteNow, selectedIndex, {
                    detail: GALAXY_WARP_FOCUSED_DETAIL,
                    fontScale: GALAXY_WARP_FOCUSED_FONT_SCALE
                });
                ctx.globalAlpha = 1;
                ctx.restore();
            }

            drawGalaxyWarpExactGlyphLayer(spriteNow, galaxy, selectedIndex, centerX, centerY, spriteRadius, spriteScale, exactGlyphAlpha, {
                frameNow: now,
                fps: isPrismWarp ? 72 : 54,
                freeze: progress >= freezeStart,
                trackTransform: isPrismWarp
            });

            const lensT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.42) / 0.40)));
            if (lensT > 0.01) {
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = alpha * lensT * (0.12 + surgeT * 0.16);
                ctx.strokeStyle = colorWithAlpha('#ffffff', 0.42);
                ctx.lineWidth = Math.max(1, radius * 0.012);
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * (0.18 + lensT * 0.08), 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpFocusedWorldLayer(now, selectedIndex, targetX, targetY, camera, progress) {
            const galaxies = typeof GALAXY_DEFINITIONS !== 'undefined' ? GALAXY_DEFINITIONS : [getGalaxyDefinition(0)];
            const galaxy = galaxies[selectedIndex] || galaxies[0];
            if (!galaxy) return;

            const zoom = Math.max(1, camera && camera.zoom ? camera.zoom : 1);
            const detail = GALAXY_WARP_FOCUSED_DETAIL;
            const fontScale = GALAXY_WARP_FOCUSED_FONT_SCALE;
            const radius = getGalaxySelectRenderRadius(selectedIndex, true) * (1.02 + progress * 0.08);
            const colors = galaxy.colors || ['#6aa8ff', '#ff5e8a', '#ffffff'];

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalCompositeOperation = 'screen';
            const dustCount = 42;
            ctx.font = `bold ${getGalaxyFontPx(Math.max(3, 6 * fontScale), { warp: true })}px Courier New`;
            for (let i = 0; i < dustCount; i++) {
                const noiseA = galaxyNoise((galaxy.seed || 17) + 1701, i);
                const noiseB = galaxyNoise((galaxy.seed || 17) + 1721, i);
                const angle = noiseA * Math.PI * 2 + now * 0.00004;
                const r = radius * (1.1 + noiseB * 2.6);
                ctx.globalAlpha = (0.05 + noiseB * 0.14) * (1 - Math.min(0.62, progress * 0.45));
                ctx.fillStyle = noiseB > 0.82 ? '#ffffff' : (colors[i % colors.length] || currentThemeColor);
                ctx.fillText(i % 5 === 0 ? '+' : '.', targetX + Math.cos(angle) * r, targetY + Math.sin(angle) * r * 0.58);
            }
            ctx.restore();

            ctx.save();
            ctx.translate(targetX, targetY);
            drawGalaxyGlyphSprite(galaxy, 0, 0, radius, true, now, selectedIndex, {
                warp: true,
                detail,
                fontScale
            });
            ctx.restore();
        }

        function drawGalaxyWarpVoidBackdrop(now, progress, color, centerX, centerY) {
            const revealT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.18) / 0.44)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.32)));
            const fadeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.88) / 0.12)));
            const alphaScale = revealT * (1 - fadeT * 0.42);
            if (alphaScale <= 0.01) return;

            const diagonal = Math.max(1, Math.hypot(width, height));
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const dustCount = 36;
            for (let i = 0; i < dustCount; i++) {
                const noiseA = galaxyNoise(5201, i);
                const noiseB = galaxyNoise(5213, i);
                const noiseC = galaxyNoise(5227, i);
                const angle = noiseA * Math.PI * 2 + now * (0.000025 + noiseC * 0.000035);
                const pull = revealT * (0.08 + noiseB * 0.18) + surgeT * (0.10 + noiseC * 0.22);
                const radius = diagonal * (0.10 + noiseB * 0.52) * (1 - pull);
                const drift = Math.sin(now * 0.00034 + i) * diagonal * 0.006;
                const x = centerX + Math.cos(angle) * radius + Math.cos(angle + Math.PI / 2) * drift;
                const y = centerY + Math.sin(angle) * radius * (0.68 + noiseC * 0.22) + Math.sin(angle + Math.PI / 2) * drift;
                const bright = noiseC > 0.82;
                ctx.globalAlpha = alphaScale * (bright ? 0.18 : 0.07) * (0.70 + surgeT * 0.55);
                ctx.fillStyle = bright ? '#ffffff' : colorWithAlpha(color, 0.92);
                ctx.font = `bold ${bright ? 8 : 6}px Courier New`;
                ctx.fillText(bright ? '+' : '.', x, y);
            }

            const traceCount = 12;
            ctx.lineCap = 'round';
            for (let i = 0; i < traceCount; i++) {
                const noise = galaxyNoise(5301, i);
                const angle = (i / traceCount) * Math.PI * 2 + (noise - 0.5) * 0.42;
                const inner = diagonal * (0.08 + noise * 0.10);
                const outer = inner + diagonal * (0.10 + surgeT * 0.16);
                ctx.globalAlpha = alphaScale * (0.025 + surgeT * 0.08) * (0.55 + noise * 0.45);
                ctx.strokeStyle = i % 3 === 0 ? colorWithAlpha('#ffffff', 0.35) : colorWithAlpha(color, 0.48);
                ctx.lineWidth = 0.8 + surgeT * 1.2 * noise;
                ctx.beginPath();
                ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
                ctx.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer);
                ctx.stroke();
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpMap(now, targetX, targetY, camera, selectedIndex, progress) {
            const fadeT = camera && Number.isFinite(camera.fadeT)
                ? camera.fadeT
                : easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.02) / 0.34)));
            const menuFade = Math.max(0, 1 - fadeT);
            if (menuFade > 0.01) {
                const snapshot = prepareGalaxyWarpMenuSnapshot(galaxyWarpTransition && galaxyWarpTransition.startedAt ? galaxyWarpTransition.startedAt : now, selectedIndex);
                ctx.save();
                ctx.translate(camera.focusX, camera.focusY);
                ctx.scale(1 + (camera.focusT || 0) * 0.08, 1 + (camera.focusT || 0) * 0.08);
                ctx.translate(-targetX, -targetY);
                ctx.globalAlpha = menuFade;
                if (snapshot) ctx.drawImage(snapshot, 0, 0);
                else drawGalaxySelectBaseLayerDirect(now, selectedIndex);
                ctx.restore();
            }
            if (fadeT > 0.001) {
                ctx.save();
                ctx.globalAlpha = Math.min(0.88, fadeT * 0.62);
                ctx.fillStyle = '#01040b';
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpStreaks(now, progress, color, centerX, centerY) {
            const eased = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.20) / 0.52)));
            const surgeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.58) / 0.32)));
            const fadeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.90) / 0.10)));
            if (eased <= 0.01) return;
            const streakCount = GALAXY_WARP_STREAK_COUNT;
            const diagonal = Math.max(1, Math.hypot(width, height));
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            for (let i = 0; i < streakCount; i++) {
                const noiseA = galaxyNoise(1201, i);
                const noiseB = galaxyNoise(1409, i);
                const flow = (now * (0.00008 + surgeT * 0.00020) + noiseB) % 1;
                const angle = (i / streakCount) * Math.PI * 2 + (noiseA - 0.5) * 0.30;
                const inner = diagonal * (0.045 + flow * 0.18);
                const length = diagonal * (0.055 + eased * 0.13 + surgeT * 0.12) * (0.58 + noiseA * 0.62);
                const outer = inner + length;
                const sx = centerX + Math.cos(angle) * inner;
                const sy = centerY + Math.sin(angle) * inner;
                const ex = centerX + Math.cos(angle) * outer;
                const ey = centerY + Math.sin(angle) * outer;
                const alpha = (1 - fadeT * 0.55) * (0.06 + eased * 0.18 + surgeT * 0.16) * (0.35 + noiseA * 0.65);
                ctx.strokeStyle = i % 5 === 0
                    ? colorWithAlpha('#ffffff', 0.22 + surgeT * 0.16)
                    : colorWithAlpha(color, 0.20 + surgeT * 0.24);
                ctx.lineWidth = 0.6 + eased * 1.2 + surgeT * 2.4 * noiseA;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function cubicGalaxyWarpPoint(p0, p1, p2, p3, t) {
            const clamped = Math.max(0, Math.min(1, t));
            const inv = 1 - clamped;
            const a = inv * inv * inv;
            const b = 3 * inv * inv * clamped;
            const c = 3 * inv * clamped * clamped;
            const d = clamped * clamped * clamped;
            return {
                x: p0.x * a + p1.x * b + p2.x * c + p3.x * d,
                y: p0.y * a + p1.y * b + p2.y * c + p3.y * d
            };
        }

        function getGalaxyWarpShipRouteMode(transition) {
            const galaxy = getGalaxyWarpSelectedGalaxy(transition && transition.galaxyIndex || 0);
            const style = galaxy ? getGalaxyRenderStyle(galaxy) : '';
            if (galaxy && galaxy.mode === 'matrixCrawler') return 'matrixCrawler';
            return galaxy && (galaxy.mode === 'survivor' || style === 'prismArray')
                ? 'survivor'
                : 'campaign';
        }

        function isGalaxyWarpCenterLandingRoute(routeMode) {
            return routeMode === 'survivor' || routeMode === 'matrixCrawler';
        }

        function getGalaxyWarpShipAccentColor(transition, fallback = currentThemeColor) {
            if (transition && transition.shipColor) return transition.shipColor;
            const galaxy = getGalaxyWarpSelectedGalaxy(transition && transition.galaxyIndex || 0);
            return (galaxy && galaxy.colors && galaxy.colors[0]) || fallback || currentThemeColor;
        }

        function getGalaxyWarpShipLandingTarget(routeMode) {
            if (routeMode === 'survivor') {
                const hudH = typeof HUD_HEIGHT === 'number' ? HUD_HEIGHT : 0;
                return {
                    x: width / 2,
                    y: Math.max(90, (height - hudH) * 0.52),
                    scale: typeof SURVIVOR_PLAYER_RENDER_SCALE === 'number' ? SURVIVOR_PLAYER_RENDER_SCALE : 0.66
                };
            }
            if (routeMode === 'matrixCrawler') {
                const hudH = typeof HUD_HEIGHT === 'number' ? HUD_HEIGHT : 0;
                const viewport = typeof getMatrixCrawlerViewportRect === 'function'
                    ? getMatrixCrawlerViewportRect()
                    : null;
                return {
                    x: viewport ? viewport.x + viewport.w / 2 : width / 2,
                    y: viewport ? viewport.y + viewport.h / 2 : Math.max(90, (height - hudH) * 0.52),
                    scale: typeof MATRIX_CRAWLER_PLAYER_RENDER_SCALE === 'number' ? MATRIX_CRAWLER_PLAYER_RENDER_SCALE : 0.66
                };
            }
            return {
                x: width / 2,
                y: height + Math.max(72, height * 0.08),
                scale: 0.40
            };
        }

        function getGalaxyWarpShipPose(progress, transition, portalCenter, portalRadius) {
            const safeTransition = transition || {};
            const targetX = safeTransition.toX || width / 2;
            const targetY = safeTransition.toY || height * 0.35;
            const fromX = Number.isFinite(safeTransition.fromX) ? safeTransition.fromX : targetX - 80;
            const fromY = Number.isFinite(safeTransition.fromY) ? safeTransition.fromY : targetY + 20;
            const centerX = portalCenter.x;
            const centerY = portalCenter.y;
            const routeMode = getGalaxyWarpShipRouteMode(safeTransition);
            const landing = getGalaxyWarpShipLandingTarget(routeMode);
            const side = fromX < landing.x ? -1 : 1;
            const travelT = easeGalaxyWarp(Math.max(0, Math.min(1, progress / 0.96)));
            let p1;
            let p2;

            if (isGalaxyWarpCenterLandingRoute(routeMode)) {
                const parkDrop = Math.max(90, Math.min(210, height * 0.18));
                p1 = {
                    x: lerpGalaxyWarp(fromX, centerX - side * Math.min(width * 0.16, Math.max(70, portalRadius * 0.16)), 0.55),
                    y: Math.max(fromY, centerY + parkDrop * 0.58)
                };
                p2 = {
                    x: landing.x,
                    y: landing.y + parkDrop
                };
            } else {
                p1 = {
                    x: centerX + (fromX - centerX) * 0.42 - side * Math.min(width * 0.10, Math.max(56, portalRadius * 0.10)),
                    y: centerY + (fromY - centerY) * 0.22
                };
                p2 = {
                    x: landing.x,
                    y: Math.max(height * 0.64, centerY + Math.min(height * 0.24, Math.max(90, portalRadius * 0.12)))
                };
            }

            const p0 = { x: fromX, y: fromY };
            const p3 = { x: landing.x, y: landing.y };
            const point = cubicGalaxyWarpPoint(p0, p1, p2, p3, travelT);
            const driftT = easeGalaxyWarp(Math.max(0, Math.min(1, progress / 0.42)));
            const commitT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.34) / 0.38)));
            const plungeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.66) / 0.28)));
            const pathPulse = Math.sin(progress * Math.PI * 2.2) * (1 - commitT) * Math.min(10, portalRadius * 0.035);
            const dx = p3.x - p0.x;
            const dy = p3.y - p0.y;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const nx = -dy / dist;
            const ny = dx / dist;
            const x = point.x + nx * pathPulse;
            const y = point.y + ny * pathPulse;
            return {
                x,
                y,
                entryX: p1.x,
                entryY: p1.y,
                commitX: p2.x,
                commitY: p2.y,
                centerX,
                centerY,
                finalX: p3.x,
                finalY: p3.y,
                finalScale: landing.scale,
                routeMode,
                dashT: commitT,
                driftT,
                commitT,
                lockT: plungeT,
                plungeT,
                travelT
            };
        }

        function drawGalaxyWarpShipExhaust(progress, transition, color, pose, rot, scale, fade, portalCenter, portalRadius) {
            const routeMode = pose.routeMode || getGalaxyWarpShipRouteMode(transition);
            const galaxy = getGalaxyWarpSelectedGalaxy(transition && transition.galaxyIndex || 0);
            const galaxyColors = galaxy && galaxy.colors ? galaxy.colors : [color, currentThemeColor, '#8ff7ff'];
            const shipAccent = getGalaxyWarpShipAccentColor(transition, color);
            const ionColors = [
                shipAccent,
                galaxyColors[1],
                galaxyColors[2],
                color,
                routeMode === 'survivor' ? '#9bffcf' : (routeMode === 'matrixCrawler' ? '#41ff93' : '#8ff7ff'),
                routeMode === 'survivor' ? '#ff8fd8' : (routeMode === 'matrixCrawler' ? '#c8ffe1' : '#fff4b8')
            ].filter(Boolean);
            const speedT = Math.max(0, Math.min(1, pose.commitT * 0.55 + pose.plungeT * 0.65 + pose.travelT * 0.40));
            const engineAlpha = fade * (0.38 + speedT * 0.62);
            if (engineAlpha <= 0.01) return;

            const behindX = -Math.sin(rot);
            const behindY = Math.cos(rot);
            const sideX = Math.cos(rot);
            const sideY = Math.sin(rot);
            const engineX = pose.x + behindX * (17 * scale + 6 + speedT * 7);
            const engineY = pose.y + behindY * (17 * scale + 6 + speedT * 7);
            const particleChars = typeof EXHAUST_PARTICLE_CHARS !== 'undefined' ? EXHAUST_PARTICLE_CHARS : ['*', '+', '.', ':'];
            const moteChars = ['.', ':', '+', '*'];
            const centerLandingRoute = isGalaxyWarpCenterLandingRoute(routeMode);
            const trailWindow = centerLandingRoute
                ? (0.20 + speedT * 0.12)
                : (0.16 + speedT * 0.10);
            const effectQuality = typeof getVisualQualityScale === 'function' ? getVisualQualityScale('effects') : 1;
            const particleCount = Math.max(10, Math.round((centerLandingRoute ? 22 : 18) * effectQuality));

            if (progress < 0.36 && pauseMenuShipCursor && pauseMenuShipCursor.trail && pauseMenuShipCursor.trail.length) {
                drawPauseMenuShipTrail(0.016, 1 - easeGalaxyWarp(progress / 0.36), {
                    ionize: true,
                    color,
                    ionColors
                });
            }

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const coreRadius = 26 + speedT * 32;
            const core = ctx.createRadialGradient(engineX, engineY, 0, engineX, engineY, coreRadius);
            core.addColorStop(0, colorWithAlpha('#ffffff', 0.20 * engineAlpha));
            core.addColorStop(0.24, colorWithAlpha('#fff4b8', 0.16 * engineAlpha));
            core.addColorStop(0.52, colorWithAlpha(ionColors[0] || color, 0.12 * engineAlpha));
            core.addColorStop(0.72, colorWithAlpha(ionColors[1] || color, 0.08 * engineAlpha));
            core.addColorStop(1, colorWithAlpha(color, 0));
            ctx.fillStyle = core;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(engineX, engineY, coreRadius, 0, Math.PI * 2);
            ctx.fill();

            for (let i = 0; i < particleCount; i++) {
                const age = i / Math.max(1, particleCount - 1);
                const sampleProgress = Math.max(0, progress - age * trailWindow);
                const sampleCenter = getGalaxyWarpPortalCenter(sampleProgress, transition.toX || width / 2, transition.toY || height * 0.35);
                const sampleRadius = getGalaxyWarpPortalRadius(sampleProgress, transition.galaxyIndex || 0);
                const samplePose = getGalaxyWarpShipPose(sampleProgress, transition, sampleCenter, sampleRadius);
                const noiseA = galaxyNoise(8101 + (transition.galaxyIndex || 0) * 17, i + Math.floor(progress * 420));
                const noiseB = galaxyNoise(8123 + (transition.galaxyIndex || 0) * 19, i);
                const lane = (noiseA - 0.5) * (9 + age * 42 + speedT * 18);
                const back = 10 + age * (34 + speedT * 86) + noiseB * 18;
                const px = samplePose.x + behindX * back + sideX * lane;
                const py = samplePose.y + behindY * back + sideY * lane;
                const life = Math.max(0, 1 - age);
                const fieldMote = age > 0.50 && i % 3 === 0;
                const hotFleck = age < 0.34 && i % 4 !== 0;
                const alpha = engineAlpha * life * life * (fieldMote ? 0.32 : 0.60);
                if (alpha <= 0.006) continue;
                const charList = fieldMote ? moteChars : particleChars;
                const char = charList[(i + Math.floor(progress * 97)) % charList.length];
                const fontSize = Math.max(5, (fieldMote ? 6 : 8) + life * (8 + speedT * 5) + noiseB * 4);
                const themedColor = ionColors[(i + Math.floor(age * 8)) % Math.max(1, ionColors.length)] || color;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = i % 7 === 0
                    ? '#ffffff'
                    : colorWithAlpha(hotFleck ? '#fff4b8' : themedColor, fieldMote ? 0.72 : 0.94);
                if (glowEnabled) {
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = (fieldMote ? 3 : 6) + life * (fieldMote ? 5 : 9);
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.font = `bold ${fontSize}px Courier New`;
                ctx.fillText(char, px | 0, py | 0);
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpShip(progress, transition, color, portalCenter, portalRadius) {
            const pose = getGalaxyWarpShipPose(progress, transition, portalCenter, portalRadius);
            const previousProgress = Math.max(0, progress - 0.016);
            const previousCenter = getGalaxyWarpPortalCenter(previousProgress, transition.toX || width / 2, transition.toY || height * 0.35);
            const previousRadius = getGalaxyWarpPortalRadius(previousProgress, transition.galaxyIndex || 0);
            const previousPose = getGalaxyWarpShipPose(previousProgress, transition, previousCenter, previousRadius);
            const travelRot = Math.atan2(pose.y - previousPose.y, pose.x - previousPose.x) + Math.PI / 2;
            const fromRot = Number.isFinite(transition.fromRot) ? transition.fromRot : travelRot;
            const turnT = easeGalaxyWarp(Math.min(1, progress / 0.42));
            const rot = fromRot + normalizePauseCursorAngle(travelRot - fromRot) * turnT;
            const fade = 1 - easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.90) / 0.10)));
            const startScale = Number.isFinite(transition.fromScale) ? transition.fromScale : 0.24;
            const targetScale = isGalaxyWarpCenterLandingRoute(pose.routeMode)
                ? Math.max(startScale, pose.finalScale || startScale * 2.35)
                : startScale * (1.18 + pose.travelT * 0.82);
            const scale = lerpGalaxyWarp(startScale, targetScale, easeGalaxyWarp(Math.min(1, progress / 0.92))) * (0.72 + fade * 0.28);
            const shipAccent = getGalaxyWarpShipAccentColor(transition, color);

            drawGalaxyWarpShipExhaust(progress, transition, shipAccent, pose, rot, scale, fade, portalCenter, portalRadius);

            if (fade <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.translate(pose.x, pose.y);
            ctx.rotate(rot);
            ctx.scale(scale, scale);
            PAUSE_CURSOR_SHIP.x = 0;
            PAUSE_CURSOR_SHIP.y = 0;
            PAUSE_CURSOR_SHIP.vx = 0;
            PAUSE_CURSOR_SHIP.vy = 0;
            PAUSE_CURSOR_SHIP.shipId = typeof getSelectedShipConfig === 'function' ? getSelectedShipConfig().id : 'arrowhead';
            PAUSE_CURSOR_SHIP._renderLayoutCache = null;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#f6fbff';
            ctx.shadowColor = shipAccent;
            ctx.shadowBlur = glowEnabled ? 18 : 0;
            drawPlayerShip(PAUSE_CURSOR_SHIP, 'center');
            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        function drawGalaxyWarpEntryAperture(now, progress, transition, color, portalCenter, portalRadius, foreground = false) {
            const enterT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.66) / 0.20)));
            const igniteT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.74) / 0.14)));
            const fadeT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.94) / 0.06)));
            const amount = enterT * (1 - fadeT * 0.75);
            if (amount <= 0.01) return;

            const selectedIndex = transition.galaxyIndex || 0;
            const galaxy = getGalaxyWarpSelectedGalaxy(selectedIndex);
            const colors = galaxy && galaxy.colors ? galaxy.colors : [color, '#ffffff'];
            const accentA = colors[0] || color;
            const accentB = colors[1] || color;
            const accentC = colors[2] || '#ffffff';
            const pose = getGalaxyWarpShipPose(progress, transition, portalCenter, portalRadius);
            const lockT = easeGalaxyWarp(Math.max(0, Math.min(1, (progress - 0.72) / 0.18)));
            const gateX = lerpGalaxyWarp(pose.x, portalCenter.x, 0.34 + lockT * 0.46);
            const gateY = lerpGalaxyWarp(pose.y, portalCenter.y, 0.34 + lockT * 0.46);
            const apertureR = Math.max(48, Math.min(Math.max(width, height) * 0.24, portalRadius * (0.12 + igniteT * 0.075)));
            const spin = now * 0.0011;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';

            if (!foreground) {
                const bloom = ctx.createRadialGradient(gateX, gateY, 0, gateX, gateY, apertureR * (2.1 + igniteT * 0.5));
                bloom.addColorStop(0, colorWithAlpha('#ffffff', amount * (0.18 + igniteT * 0.10)));
                bloom.addColorStop(0.18, colorWithAlpha(accentC, amount * 0.14));
                bloom.addColorStop(0.38, colorWithAlpha(accentB, amount * 0.12));
                bloom.addColorStop(1, colorWithAlpha(accentA, 0));
                ctx.globalAlpha = 1;
                ctx.fillStyle = bloom;
                ctx.fillRect(0, 0, width, height);

                const core = ctx.createRadialGradient(gateX, gateY, 0, gateX, gateY, apertureR * 0.68);
                core.addColorStop(0, colorWithAlpha('#ffffff', amount * (0.28 + igniteT * 0.16)));
                core.addColorStop(0.36, colorWithAlpha(accentC, amount * 0.16));
                core.addColorStop(1, colorWithAlpha(accentB, 0));
                ctx.fillStyle = core;
                ctx.beginPath();
                ctx.arc(gateX, gateY, apertureR * 0.72, 0, Math.PI * 2);
                ctx.fill();
            }

            const ringAlpha = amount * (foreground ? 0.22 : 0.13) * (0.78 + igniteT * 0.36);
            for (let ring = 0; ring < 3; ring++) {
                const ringT = ring / 2;
                const ringR = apertureR * (0.54 + ringT * 0.38 + igniteT * 0.05);
                ctx.globalAlpha = ringAlpha * (1 - ringT * 0.25);
                ctx.strokeStyle = colorWithAlpha(ring === 1 ? accentC : (ring ? accentB : accentA), 0.62);
                ctx.lineWidth = Math.max(1, apertureR * (0.006 + ringT * 0.003));
                ctx.beginPath();
                ctx.ellipse(gateX, gateY, ringR * (1.0 + ringT * 0.10), ringR * (0.54 + ringT * 0.07), spin * (ring % 2 ? -0.7 : 0.9) + ringT * 0.62, 0, Math.PI * 2);
                ctx.stroke();
            }

            if (foreground && igniteT > 0.05) {
                const tickCount = 12;
                const tickR = apertureR * (0.50 + igniteT * 0.12);
                for (let i = 0; i < tickCount; i++) {
                    const noise = galaxyNoise(8101, i);
                    const angle = (i / tickCount) * Math.PI * 2 + spin * 0.72 + (noise - 0.5) * 0.10;
                    const inner = tickR * (0.88 + noise * 0.05);
                    const outer = inner + apertureR * (0.08 + noise * 0.05);
                    ctx.globalAlpha = amount * igniteT * (0.10 + noise * 0.16);
                    ctx.strokeStyle = i % 4 === 0 ? colorWithAlpha('#ffffff', 0.68) : colorWithAlpha(accentB, 0.62);
                    ctx.lineWidth = 1 + noise * 1.4;
                    ctx.beginPath();
                    ctx.moveTo(gateX + Math.cos(angle) * inner, gateY + Math.sin(angle) * inner * 0.68);
                    ctx.lineTo(gateX + Math.cos(angle) * outer, gateY + Math.sin(angle) * outer * 0.68);
                    ctx.stroke();
                }
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpFlash(progress, color, centerX, centerY) {
            const ringT = Math.max(0, Math.min(1, (progress - 0.50) / 0.42));
            const flashT = Math.max(0, Math.min(1, (progress - 0.80) / 0.18));
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            if (ringT > 0) {
                const easedRing = easeGalaxyWarp(ringT);
                const radius = 28 + easedRing * Math.max(width, height) * 0.48;
                ctx.globalAlpha = Math.sin(ringT * Math.PI) * 0.24;
                ctx.strokeStyle = colorWithAlpha(color, 0.65);
                ctx.lineWidth = 2 + easedRing * 10;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radius * 1.16, radius * 0.44, Math.sin(progress * Math.PI * 2) * 0.32, 0, Math.PI * 2);
                ctx.stroke();
            }
            if (flashT > 0) {
                const easedFlash = easeGalaxyWarp(flashT);
                const glow = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, Math.max(width, height) * 0.76);
                glow.addColorStop(0, colorWithAlpha('#ffffff', 0.24 * easedFlash));
                glow.addColorStop(0.22, colorWithAlpha(color, 0.20 * easedFlash));
                glow.addColorStop(0.72, colorWithAlpha('#6aa8ff', 0.06 * easedFlash));
                glow.addColorStop(1, colorWithAlpha('#ffffff', 0));
                ctx.fillStyle = glow;
                ctx.globalAlpha = 1;
                ctx.fillRect(0, 0, width, height);
            }
            ctx.restore();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }

        function drawGalaxyWarpHandoffVeil(amount, color, centerX = width / 2, centerY = height / 2, now = currentFrameNow) {
            const t = easeGalaxyWarp(Math.max(0, Math.min(1, amount || 0)));
            if (t <= 0.001) return;

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = colorWithAlpha('#01040b', 0.08 * t + 0.58 * t * t);
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';
            const radius = Math.max(width, height) * (0.38 + t * 0.42);
            const bloom = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            bloom.addColorStop(0, colorWithAlpha('#ffffff', 0.2 * t));
            bloom.addColorStop(0.18, colorWithAlpha(color, 0.18 * t));
            bloom.addColorStop(0.62, colorWithAlpha('#6aa8ff', 0.05 * t));
            bloom.addColorStop(1, colorWithAlpha('#ffffff', 0));
            ctx.fillStyle = bloom;
            ctx.fillRect(0, 0, width, height);

            const streakAlpha = Math.sin(t * Math.PI) * 0.16 + t * 0.08;
            if (streakAlpha > 0.01) {
                ctx.lineCap = 'round';
                const streakCount = GALAXY_WARP_HANDOFF_STREAK_COUNT;
                for (let i = 0; i < streakCount; i++) {
                    const noise = galaxyNoise(7001, i);
                    const angle = (i / streakCount) * Math.PI * 2 + (noise - 0.5) * 0.28;
                    const inner = 18 + noise * 72;
                    const outer = inner + 72 + t * 220 * (0.35 + noise);
                    ctx.globalAlpha = streakAlpha * (0.35 + noise * 0.65);
                    ctx.strokeStyle = i % 3 === 0 ? colorWithAlpha('#ffffff', 0.42) : colorWithAlpha(color, 0.55);
                    ctx.lineWidth = 0.8 + t * 2.8 * noise;
                    ctx.beginPath();
                    ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
                    ctx.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer);
                    ctx.stroke();
                }
            }

            ctx.restore();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function drawGalaxyWarpTransition(now) {
            const transition = galaxyWarpTransition || {};
            const elapsed = ((now || performance.now()) - (transition.startedAt || now || performance.now())) / 1000;
            const progress = Math.max(0, Math.min(1, elapsed / GALAXY_WARP_DURATION));
            const targetX = transition.toX || width / 2;
            const targetY = transition.toY || height * 0.35;
            const color = transition.color || currentThemeColor;
            const camera = getGalaxyWarpCamera(progress, targetX, targetY);
            const focalPoint = getGalaxyWarpPortalCenter(progress, targetX, targetY);
            const portalRadius = getGalaxyWarpPortalRadius(progress, transition.galaxyIndex || 0);

            ctx.save();
            ctx.fillStyle = '#01040b';
            ctx.fillRect(0, 0, width, height);
            drawGalaxyWarpMap(now, targetX, targetY, camera, transition.galaxyIndex || 0, progress);
            ctx.restore();

            drawGalaxyWarpVoidBackdrop(now, progress, color, focalPoint.x, focalPoint.y);
            drawGalaxyWarpPortal(now, progress, transition.galaxyIndex || 0, color, focalPoint.x, focalPoint.y);
            drawGalaxyWarpStreaks(now, progress, color, focalPoint.x, focalPoint.y);
            drawGalaxyWarpEntryAperture(now, progress, transition, color, focalPoint, portalRadius, false);
            drawGalaxyWarpShip(progress, transition, color, focalPoint, portalRadius);
            drawGalaxyWarpEntryAperture(now, progress, transition, color, focalPoint, portalRadius, true);
            drawGalaxyWarpFlash(progress, color, focalPoint.x, focalPoint.y);
            const handoffStart = typeof GALAXY_WARP_HANDOFF_START === 'number' ? GALAXY_WARP_HANDOFF_START : 0.66;
            const handoffT = Math.max(0, Math.min(1, (progress - handoffStart) / Math.max(0.001, 1 - handoffStart)));
            drawGalaxyWarpHandoffVeil(handoffT, color, focalPoint.x, focalPoint.y, now);
        }

        function drawGalaxyWarpOutroFade(now) {
            if (!galaxyWarpTransition || !galaxyWarpTransition.outroStartedAt) return;
            const elapsed = ((now || performance.now()) - galaxyWarpTransition.outroStartedAt) / 1000;
            if (elapsed < 0 || elapsed > GALAXY_WARP_OUTRO_FADE) return;
            const alpha = 1 - easeGalaxyWarp(elapsed / GALAXY_WARP_OUTRO_FADE);
            const color = galaxyWarpTransition.color || currentThemeColor;
            drawGalaxyWarpHandoffVeil(alpha, color, width / 2, height / 2, now);
        }
