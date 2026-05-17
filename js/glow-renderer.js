        // Shared cached glow renderer. Classic-script globals only; no modules.
        const GLOW_QUALITY_OFF = 'OFF';
        const GLOW_QUALITY_SOFT = 'SOFT';
        const GLOW_QUALITY_FULL = 'FULL';
        const GLOW_QUALITY_AUTO = 'AUTO';
        const GLOW_QUALITY_OPTIONS = [GLOW_QUALITY_OFF, GLOW_QUALITY_SOFT, GLOW_QUALITY_FULL];
        const GLOW_QUALITY_STORAGE_KEY = 'ascii_glow_quality';
        const GLOW_GLYPH_CACHE_LIMIT = 220;
        const GLOW_RADIAL_CACHE_LIMIT = 96;
        const GLOW_SOFT_LIVE_BLUR_BUDGET = 3;
        const GLOW_FULL_LIVE_BLUR_BUDGET = 180;

        let glowQualityMode = normalizeGlowQualityMode(
            sessionStorage.getItem(GLOW_QUALITY_STORAGE_KEY) ||
            (typeof glowEnabled !== 'undefined' && glowEnabled ? GLOW_QUALITY_SOFT : GLOW_QUALITY_OFF)
        );
        if (typeof glowEnabled !== 'undefined') {
            glowEnabled = glowQualityMode !== GLOW_QUALITY_OFF;
        }
        let glowBudgetFrameKey = null;
        let glowLiveBlurUsed = 0;
        let glowLiveBlurRejected = 0;
        let glowCachedGlyphDraws = 0;
        let glowCachedRadialDraws = 0;
        const cachedGlowGlyphSprites = new Map();
        const cachedRadialGlowSprites = new Map();

        function normalizeGlowQualityMode(mode) {
            const value = String(mode || GLOW_QUALITY_AUTO).toUpperCase();
            if (value === GLOW_QUALITY_OFF || value === GLOW_QUALITY_SOFT || value === GLOW_QUALITY_FULL) return value;
            if (value === GLOW_QUALITY_AUTO) {
                return typeof glowEnabled !== 'undefined' && !glowEnabled ? GLOW_QUALITY_OFF : GLOW_QUALITY_SOFT;
            }
            return GLOW_QUALITY_SOFT;
        }

        function setGlowQualityMode(mode) {
            glowQualityMode = normalizeGlowQualityMode(mode);
            sessionStorage.setItem(GLOW_QUALITY_STORAGE_KEY, glowQualityMode);
            if (typeof glowEnabled !== 'undefined') {
                glowEnabled = glowQualityMode !== GLOW_QUALITY_OFF;
                sessionStorage.setItem('ascii_glow_enabled', glowEnabled.toString());
            }
            clearGlowRenderCaches();
            if (typeof invalidateGraphicsRenderCaches === 'function') invalidateGraphicsRenderCaches();
            if (typeof applyTheme === 'function') applyTheme();
            return glowQualityMode;
        }

        function getGlowQualityMode() {
            return normalizeGlowQualityMode(glowQualityMode);
        }

        function getGlowQualityLabel() {
            return getGlowQuality();
        }

        function cycleGlowQualityMode(direction = 1) {
            const current = getGlowQualityMode();
            const currentIndex = Math.max(0, GLOW_QUALITY_OPTIONS.indexOf(current));
            const step = direction < 0 ? -1 : 1;
            const nextIndex = (currentIndex + step + GLOW_QUALITY_OPTIONS.length) % GLOW_QUALITY_OPTIONS.length;
            return setGlowQualityMode(GLOW_QUALITY_OPTIONS[nextIndex]);
        }

        function getGlowQuality() {
            const quality = getGlowQualityMode();
            if (quality === GLOW_QUALITY_OFF || (typeof glowEnabled !== 'undefined' && !glowEnabled)) return GLOW_QUALITY_OFF;
            return quality;
        }

        function isSoftGlowQuality() {
            return getGlowQuality() === GLOW_QUALITY_SOFT;
        }

        function isFullGlowQuality() {
            return getGlowQuality() === GLOW_QUALITY_FULL;
        }

        function getGlowBlurScale() {
            const quality = getGlowQuality();
            if (quality === GLOW_QUALITY_OFF) return 0;
            return quality === GLOW_QUALITY_SOFT ? 0.42 : 1;
        }

        function getGlowQualityScale(softScale = 0.42, fullScale = 1) {
            const quality = getGlowQuality();
            if (quality === GLOW_QUALITY_OFF) return 0;
            return quality === GLOW_QUALITY_SOFT ? softScale : fullScale;
        }

        function isGlowRenderingEnabled() {
            return getGlowQuality() !== GLOW_QUALITY_OFF;
        }

        function resetGlowBudgetForFrame(frameKey) {
            const key = Number.isFinite(frameKey) ? Math.floor(frameKey) : Date.now();
            if (key === glowBudgetFrameKey) return;
            glowBudgetFrameKey = key;
            glowLiveBlurUsed = 0;
            glowLiveBlurRejected = 0;
            glowCachedGlyphDraws = 0;
            glowCachedRadialDraws = 0;
        }

        function shouldUseLiveShadowBlur(priority = 'normal', cost = 1) {
            const quality = getGlowQuality();
            if (quality === GLOW_QUALITY_OFF) return false;
            if (quality === GLOW_QUALITY_SOFT && (priority === 'low' || priority === 'normal')) {
                glowLiveBlurRejected += Math.max(1, Number.isFinite(cost) ? cost : 1);
                return false;
            }
            const safeCost = Math.max(1, Number.isFinite(cost) ? cost : 1);
            const baseBudget = quality === GLOW_QUALITY_FULL
                ? GLOW_FULL_LIVE_BLUR_BUDGET
                : GLOW_SOFT_LIVE_BLUR_BUDGET;
            const bonus = quality === GLOW_QUALITY_FULL
                ? (priority === 'critical' ? 8 : (priority === 'high' ? 4 : 0))
                : (priority === 'critical' ? 4 : (priority === 'high' ? 2 : 0));
            if (glowLiveBlurUsed + safeCost <= baseBudget + bonus) {
                glowLiveBlurUsed += safeCost;
                return true;
            }
            glowLiveBlurRejected += safeCost;
            return false;
        }

        function getLiveGlowBlur(blur, priority = 'normal', cost = 1, softScale = 0.42) {
            const rawBlur = Number.isFinite(blur) ? Math.max(0, blur) : 0;
            if (rawBlur <= 0 || typeof glowEnabled !== 'undefined' && !glowEnabled) return 0;
            const quality = getGlowQuality();
            if (quality === GLOW_QUALITY_OFF) return 0;
            if (quality === GLOW_QUALITY_SOFT) {
                if (!shouldUseLiveShadowBlur(priority, cost)) return 0;
                return rawBlur * softScale;
            }
            return rawBlur;
        }

        function shouldUseCachedGlowSprite(priority = 'normal') {
            const quality = getGlowQuality();
            if (quality === GLOW_QUALITY_OFF) return false;
            if (quality === GLOW_QUALITY_SOFT) return priority === 'critical' || priority === 'high';
            return true;
        }

        function getGlowBudgetState() {
            return {
                quality: getGlowQuality(),
                mode: getGlowQualityMode(),
                frame: glowBudgetFrameKey,
                liveBlurUsed: glowLiveBlurUsed,
                liveBlurRejected: glowLiveBlurRejected,
                cachedGlyphDraws: glowCachedGlyphDraws,
                cachedRadialDraws: glowCachedRadialDraws,
                glyphCacheSize: cachedGlowGlyphSprites.size,
                radialCacheSize: cachedRadialGlowSprites.size
            };
        }

        function touchGlowCacheEntry(cache, key, entry, limit) {
            if (cache.has(key)) cache.delete(key);
            cache.set(key, entry);
            while (cache.size > limit) {
                const oldest = cache.keys().next();
                if (oldest.done) break;
                cache.delete(oldest.value);
            }
            return entry;
        }

        function getGlowFontSize(font, fallback = 20) {
            const match = String(font || '').match(/(\d+(?:\.\d+)?)px/);
            if (!match) return fallback;
            const size = Number(match[1]);
            return Number.isFinite(size) ? size : fallback;
        }

        function quantizeGlowNumber(value, step, min, max) {
            const safe = Number.isFinite(value) ? value : min;
            const clamped = Math.max(min, Math.min(max, safe));
            return Math.round(clamped / step) * step;
        }

        function getCachedGlowGlyphSprite(glyph, font, color, glowColor, blur = 8, options = {}) {
            const text = String(glyph == null ? '' : glyph);
            if (!text) return null;
            const quality = getGlowQuality();
            const useGlow = quality !== GLOW_QUALITY_OFF && blur > 0;
            const safeFont = font || 'bold 20px Courier New';
            const safeColor = color || '#ffffff';
            const safeGlow = glowColor || safeColor;
            const fontSize = quantizeGlowNumber(getGlowFontSize(safeFont, 20), 1, 4, 160);
            const softBlur = blur * getGlowBlurScale();
            const glowBlur = useGlow ? quantizeGlowNumber(softBlur, quality === GLOW_QUALITY_FULL ? 1 : 2, 0, quality === GLOW_QUALITY_FULL ? 48 : 18) : 0;
            const scale = 1;
            const key = [
                text,
                safeFont.replace(/\d+(?:\.\d+)?px/, `${fontSize}px`),
                safeColor,
                useGlow ? safeGlow : '',
                glowBlur,
                scale
            ].join('|');
            const cached = cachedGlowGlyphSprites.get(key);
            if (cached) {
                cachedGlowGlyphSprites.delete(key);
                cachedGlowGlyphSprites.set(key, cached);
                return cached;
            }

            const canvas = document.createElement('canvas');
            const c = canvas.getContext('2d', { alpha: true });
            if (!c) return null;
            c.font = safeFont.replace(/\d+(?:\.\d+)?px/, `${fontSize}px`);
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            const metrics = c.measureText(text);
            const pad = Math.ceil(Math.max(6, glowBlur * 2 + fontSize * 0.35));
            const textW = Math.max(fontSize, metrics.width || fontSize);
            const textH = Math.max(
                fontSize * 1.35,
                (metrics.actualBoundingBoxAscent || fontSize * 0.8) +
                    (metrics.actualBoundingBoxDescent || fontSize * 0.3)
            );
            canvas.width = Math.ceil(textW + pad * 2);
            canvas.height = Math.ceil(textH + pad * 2);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            c.font = safeFont.replace(/\d+(?:\.\d+)?px/, `${fontSize}px`);
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillStyle = safeColor;
            if (useGlow) {
                c.shadowColor = safeGlow;
                c.shadowBlur = glowBlur;
            }
            c.fillText(text, cx, cy);
            c.shadowBlur = 0;

            return touchGlowCacheEntry(cachedGlowGlyphSprites, key, {
                canvas,
                anchorX: cx,
                anchorY: cy,
                width: canvas.width,
                height: canvas.height
            }, GLOW_GLYPH_CACHE_LIMIT);
        }

        function drawCachedGlowGlyph(targetCtx, glyph, x, y, font, color, glowColor, blur = 8, options = {}) {
            if (!targetCtx) return false;
            const alpha = Number.isFinite(options.alpha) ? options.alpha : 1;
            const sprite = getCachedGlowGlyphSprite(glyph, font, color, glowColor, blur, options);
            if (!sprite) return false;
            targetCtx.save();
            targetCtx.shadowBlur = 0;
            targetCtx.globalAlpha *= Math.max(0, Math.min(1, alpha));
            targetCtx.drawImage(sprite.canvas, x - sprite.anchorX, y - sprite.anchorY);
            targetCtx.restore();
            glowCachedGlyphDraws++;
            return true;
        }

        function glowHexToRgba(color, alpha) {
            const hex = String(color || '').replace('#', '');
            if (hex.length !== 6) return `rgba(255,255,255,${Math.max(0, Math.min(1, alpha))})`;
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
                return `rgba(255,255,255,${Math.max(0, Math.min(1, alpha))})`;
            }
            return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
        }

        function getCachedRadialGlowSprite(color, radius, options = {}) {
            const quality = getGlowQuality();
            if (quality === GLOW_QUALITY_OFF) return null;
            const r = quantizeGlowNumber(radius * getGlowBlurScale(), quality === GLOW_QUALITY_FULL ? 2 : 4, 2, quality === GLOW_QUALITY_FULL ? 260 : 180);
            const safeColor = color || '#ffffff';
            const rawInnerAlpha = Number.isFinite(options.innerAlpha) ? options.innerAlpha : 0.22;
            const rawMidAlpha = Number.isFinite(options.midAlpha) ? options.midAlpha : 0.08;
            const innerAlpha = quantizeGlowNumber(rawInnerAlpha, 0.02, 0.02, 1);
            const midAlpha = quantizeGlowNumber(rawMidAlpha, 0.02, 0, 1);
            const key = [safeColor, r, innerAlpha, midAlpha].join('|');
            const cached = cachedRadialGlowSprites.get(key);
            if (cached) {
                cachedRadialGlowSprites.delete(key);
                cachedRadialGlowSprites.set(key, cached);
                return cached;
            }

            const canvas = document.createElement('canvas');
            const size = Math.ceil(r * 2);
            canvas.width = size;
            canvas.height = size;
            const c = canvas.getContext('2d', { alpha: true });
            if (!c) return null;
            const g = c.createRadialGradient(r, r, 0, r, r, r);
            g.addColorStop(0, glowHexToRgba(safeColor, innerAlpha));
            g.addColorStop(0.42, glowHexToRgba(safeColor, midAlpha));
            g.addColorStop(1, glowHexToRgba(safeColor, 0));
            c.fillStyle = g;
            c.fillRect(0, 0, size, size);

            return touchGlowCacheEntry(cachedRadialGlowSprites, key, {
                canvas,
                radius: r
            }, GLOW_RADIAL_CACHE_LIMIT);
        }

        function drawCachedRadialGlow(targetCtx, x, y, radius, color, options = {}) {
            if (!targetCtx) return false;
            const sprite = getCachedRadialGlowSprite(color, radius, options);
            if (!sprite) return false;
            const alpha = Number.isFinite(options.alpha) ? options.alpha : 1;
            targetCtx.save();
            targetCtx.shadowBlur = 0;
            targetCtx.globalCompositeOperation = options.composite || 'screen';
            targetCtx.globalAlpha *= Math.max(0, Math.min(1, alpha));
            targetCtx.drawImage(sprite.canvas, x - sprite.radius, y - sprite.radius);
            targetCtx.restore();
            glowCachedRadialDraws++;
            return true;
        }

        function clearGlowRenderCaches() {
            cachedGlowGlyphSprites.clear();
            cachedRadialGlowSprites.clear();
        }

        if (typeof window !== 'undefined') {
            window.debugGlowRendererState = getGlowBudgetState;
            window.setGlowQualityMode = setGlowQualityMode;
            window.cycleGlowQualityMode = cycleGlowQualityMode;
            window.clearGlowRenderCaches = clearGlowRenderCaches;
            window.isSoftGlowQuality = isSoftGlowQuality;
            window.isFullGlowQuality = isFullGlowQuality;
            window.getGlowQualityScale = getGlowQualityScale;
            window.getLiveGlowBlur = getLiveGlowBlur;
            window.shouldUseCachedGlowSprite = shouldUseCachedGlowSprite;
        }
