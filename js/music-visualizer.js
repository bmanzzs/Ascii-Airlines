        // Music player visualizer rendering, controls, fullscreen display, and visual caches.
        const musicPlayerGradientCache = {
            signalKey: '',
            signalGradient: null,
            seekKey: '',
            seekGradient: null
        };
        const musicPlayerBassCoreState = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            lastBass: 0,
            impact: 0,
            lastNow: 0
        };
        const musicPlayerSatelliteOrbitState = {
            outerAngle: 0,
            outerVelocity: 0,
            outerDrive: 0,
            innerAngle: 0,
            innerVelocity: 0,
            innerDrive: 0,
            lastNow: 0
        };
        function getMusicPlayerSignalGradient(left, right, topY, bottomY, accentColor) {
            const key = `${left}|${right}|${topY}|${bottomY}|${accentColor}`;
            if (musicPlayerGradientCache.signalGradient && musicPlayerGradientCache.signalKey === key) {
                return musicPlayerGradientCache.signalGradient;
            }
            const signalGrad = ctx.createLinearGradient(left, topY, right, bottomY);
            signalGrad.addColorStop(0, colorWithAlpha('#ff8fd8', 0.72));
            signalGrad.addColorStop(0.26, colorWithAlpha('#7ee7ff', 0.88));
            signalGrad.addColorStop(0.52, colorWithAlpha('#ffffff', 0.94));
            signalGrad.addColorStop(0.74, colorWithAlpha(accentColor, 0.86));
            signalGrad.addColorStop(1, colorWithAlpha('#ff8fd8', 0.62));
            musicPlayerGradientCache.signalKey = key;
            musicPlayerGradientCache.signalGradient = signalGrad;
            return signalGrad;
        }

        function getMusicPlayerSeekGradient(seekX, seekW, accentColor) {
            const key = `${seekX}|${seekW}|${accentColor}`;
            if (musicPlayerGradientCache.seekGradient && musicPlayerGradientCache.seekKey === key) {
                return musicPlayerGradientCache.seekGradient;
            }
            const fillGrad = ctx.createLinearGradient(seekX, 0, seekX + seekW, 0);
            fillGrad.addColorStop(0, colorWithAlpha('#7ee7ff', 0.74));
            fillGrad.addColorStop(0.56, colorWithAlpha(accentColor, 0.86));
            fillGrad.addColorStop(1, colorWithAlpha('#ffffff', 0.92));
            musicPlayerGradientCache.seekKey = key;
            musicPlayerGradientCache.seekGradient = fillGrad;
            return fillGrad;
        }

        function drawMusicPlayerButton(label, x, y, w, h, selected, accentColor) {
            ctx.save();
            const pulse = selected ? (Math.sin(currentFrameNow * 0.009) + 1) * 0.5 : 0;
            const fill = selected
                ? colorWithAlpha(accentColor, 0.22 + pulse * 0.08)
                : 'rgba(5, 12, 24, 0.58)';
            ctx.fillStyle = fill;
            ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
            if (glowEnabled && selected) {
                ctx.shadowColor = accentColor;
                ctx.shadowBlur = 10 + pulse * 8;
            }
            ctx.strokeStyle = selected ? mixColor(accentColor, '#ffffff', 0.38) : colorWithAlpha(accentColor, 0.34);
            ctx.lineWidth = selected ? 2 : 1;
            ctx.strokeRect((x + 0.5) | 0, (y + 0.5) | 0, w | 0, h | 0);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.max(12, Math.min(15, h * 0.5))}px 'Electrolize', sans-serif`;
            ctx.fillStyle = selected ? mixColor(accentColor, '#ffffff', 0.68) : colorWithAlpha('#dcecff', 0.8);
            ctx.fillText(label, x + w / 2, y + h / 2 + 1);
            ctx.restore();
        }

        function drawMusicPlayerVisualizer(panelX, panelY, panelW, panelH, accentColor, status, options = {}) {
            const fullscreen = !!options.fullscreen;
            const selected = !!options.selected;
            const left = Number.isFinite(options.left) ? options.left : panelX + 16;
            const right = Number.isFinite(options.right) ? options.right : panelX + panelW - 16;
            const topY = Number.isFinite(options.topY) ? options.topY : panelY + 58;
            const bottomY = Number.isFinite(options.bottomY) ? options.bottomY : Math.min(panelY + panelH - 116, panelY + 178);
            const viewW = Math.max(1, right - left);
            const viewH = Math.max(fullscreen ? 180 : 88, bottomY - topY);
            const signal = typeof getMusicPlayerReactiveSignal === 'function'
                ? getMusicPlayerReactiveSignal()
                : { bass: 0.2, bassGuitar: 0.2, bassPulse: 0.08, drumSnap: 0.12, leadTone: 0.16, air: 0.12, mid: 0.15, highMid: 0.18, treble: 0.12, energy: 0.18, pulse: 0.08, activity: 1, phase: (currentFrameNow || 0) * 0.00004 };
            const activity = Math.max(0, Math.min(1, Number.isFinite(signal.activity) ? signal.activity : (status && status.isPlaying ? 1 : 0)));
            const activeAlpha = status && status.isPlaying ? 0.42 + activity * 0.58 : 0.42;
            const energy = Math.max(0, Math.min(1, signal.energy || 0));
            const pulse = Math.max(0, Math.min(1, signal.pulse || 0));
            const bassPulse = Math.max(0, Math.min(1, signal.bassPulse || 0));
            const bass = Math.max(0, Math.min(1, signal.bass || 0));
            const bassGuitar = Math.max(0, Math.min(1, Number.isFinite(signal.bassGuitar) ? signal.bassGuitar : bass));
            const drumSnap = Math.max(0, Math.min(1, signal.drumSnap || 0));
            const leadTone = Math.max(0, Math.min(1, signal.leadTone || 0));
            const airTone = Math.max(0, Math.min(1, signal.air || 0));
            const mid = Math.max(0, Math.min(1, signal.mid || 0));
            const highMid = Math.max(0, Math.min(1, Number.isFinite(signal.highMid) ? signal.highMid : mid));
            const treble = Math.max(0, Math.min(1, signal.treble || 0));
            const phase = (signal.phase || 0) * Math.PI * 2;
            const bandProfileAge = signal.bands && Number.isFinite(signal.bands.age) ? Math.max(0, signal.bands.age) : 0;
            const profileLock = Math.max(0, Math.min(1, bandProfileAge / 10));
            const cx = left + viewW * 0.5;
            const cy = topY + viewH * 0.53;
            const baseRx = Math.min(viewW * (fullscreen ? 0.30 : 0.34), fullscreen ? 360 : 178) * (0.82 + highMid * 0.17 + energy * 0.030);
            const baseRy = Math.min(viewH * (fullscreen ? 0.28 : 0.44), fullscreen ? 190 : 62) * (0.82 + mid * 0.075 + bassGuitar * 0.030 + pulse * 0.014);
            const signalGradient = getMusicPlayerSignalGradient(left, right, topY, bottomY, accentColor);
            const coreState = musicPlayerBassCoreState;
            const renderNow = currentFrameNow || performance.now();
            const coreDt = coreState.lastNow > 0
                ? Math.max(0.001, Math.min(0.08, (renderNow - coreState.lastNow) / 1000))
                : 1 / 60;
            coreState.lastNow = renderNow;
            const bassRise = Math.max(0, bassGuitar - coreState.lastBass * 0.965);
            coreState.lastBass = bassGuitar;
            coreState.impact = Math.max(coreState.impact * Math.pow(0.10, coreDt), Math.min(1, bassPulse * 1.05 + bassRise * 3.8 + pulse * 0.08));
            coreState.x = 0;
            coreState.y = 0;
            coreState.vx = 0;
            coreState.vy = 0;
            const bassGlow = Math.max(0, Math.min(1, Math.pow(bassGuitar * 0.78 + bassPulse * 0.72 + coreState.impact * 0.48, 0.64)));
            const coreCx = cx;
            const coreCy = cy;
            const gasPhaseSeed = phase * 0.73 + bassGuitar * 1.2;
            const voidSunReturn = Math.pow(Math.max(0, Math.sin(renderNow * 0.00046 + 0.95) - 0.88) / 0.12, 2) * (0.42 + bassPulse * 0.32);
            const voidMode = Math.max(0, Math.min(1, 1 - voidSunReturn * 0.78));
            const voidFieldRadius = Math.min(viewW * 0.24, Math.max(42, viewH * 0.62));
            const satelliteOrbitState = musicPlayerSatelliteOrbitState;
            const orbitDt = satelliteOrbitState.lastNow > 0
                ? Math.max(0.001, Math.min(0.08, (renderNow - satelliteOrbitState.lastNow) / 1000))
                : coreDt;
            satelliteOrbitState.lastNow = renderNow;
            const outerOrbitDrive = Math.max(0, Math.min(1, airTone * 0.54 + treble * 0.30 + highMid * 0.10 + pulse * 0.24));
            const outerOrbitRise = Math.max(0, outerOrbitDrive - satelliteOrbitState.outerDrive * 0.90);
            satelliteOrbitState.outerDrive = outerOrbitDrive;
            const outerOrbitTargetSpeed = status && status.isPlaying
                ? 0.060 + Math.pow(outerOrbitDrive, 0.82) * (fullscreen ? 0.96 : 0.74) + pulse * 0.16
                : 0.025;
            satelliteOrbitState.outerVelocity += outerOrbitRise * (fullscreen ? 0.50 : 0.38);
            satelliteOrbitState.outerVelocity += (outerOrbitTargetSpeed - satelliteOrbitState.outerVelocity) * Math.min(1, orbitDt * (7.4 + outerOrbitRise * 18));
            satelliteOrbitState.outerVelocity = Math.max(0.015, Math.min(fullscreen ? 1.35 : 1.08, satelliteOrbitState.outerVelocity));
            satelliteOrbitState.outerAngle = (satelliteOrbitState.outerAngle + satelliteOrbitState.outerVelocity * orbitDt) % (Math.PI * 2);

            const innerOrbitDrive = Math.max(0, Math.min(1, drumSnap * 0.54 + highMid * 0.22 + pulse * 0.24));
            const innerOrbitRise = Math.max(0, innerOrbitDrive - satelliteOrbitState.innerDrive * 0.90);
            satelliteOrbitState.innerDrive = innerOrbitDrive;
            const innerOrbitTargetSpeed = status && status.isPlaying
                ? 0.045 + Math.pow(innerOrbitDrive, 0.86) * (fullscreen ? 0.50 : 0.38) + pulse * 0.08
                : 0.018;
            satelliteOrbitState.innerVelocity += innerOrbitRise * (fullscreen ? 0.22 : 0.16);
            satelliteOrbitState.innerVelocity += (innerOrbitTargetSpeed - satelliteOrbitState.innerVelocity) * Math.min(1, orbitDt * (5.6 + innerOrbitRise * 10));
            satelliteOrbitState.innerVelocity = Math.max(0.010, Math.min(fullscreen ? 0.72 : 0.56, satelliteOrbitState.innerVelocity));
            satelliteOrbitState.innerAngle = (satelliteOrbitState.innerAngle + satelliteOrbitState.innerVelocity * orbitDt) % (Math.PI * 2);

            const distortVisualizerPoint = (x, y, strength = 1) => {
                const dx = x - coreCx;
                const dy = y - coreCy;
                const dist = Math.max(0.001, Math.hypot(dx, dy));
                if (dist >= voidFieldRadius || voidMode <= 0.02) return { x, y };
                const t = 1 - dist / voidFieldRadius;
                const influence = t * t * voidMode * strength;
                const swirl = influence * (0.34 + bassGlow * 0.14) * Math.sin(phase * 0.64 + dist * 0.030);
                const pull = influence * (2.4 + bassGlow * 3.4);
                const cos = Math.cos(swirl);
                const sin = Math.sin(swirl);
                const warpedX = dx * cos - dy * sin;
                const warpedY = dx * sin + dy * cos;
                return {
                    x: coreCx + warpedX - (warpedX / dist) * pull,
                    y: coreCy + warpedY - (warpedY / dist) * pull
                };
            };

            const getBreathingPaletteColor = (palette, index, speed = 0.34, offset = 0) => {
                if (!palette || !palette.length) return '#ffffff';
                const a = palette[index % palette.length];
                const b = palette[(index + 1) % palette.length];
                const individualOffset = offset + index * 0.82 + Math.sin(index * 12.9898 + offset * 4.7) * 1.25;
                const speedJitter = 0.62 + Math.sin(index * 5.173 + offset * 2.11) * 0.23 + Math.sin(index * 11.41) * 0.15;
                const elementSpeed = Math.max(0.035, speed * speedJitter);
                const t = 0.5 + Math.sin(phase * elementSpeed + individualOffset) * 0.5;
                return typeof mixHexColor === 'function' ? mixHexColor(a, b, t) : mixColor(a, b, t);
            };

            const coreBreathColor = getBreathingPaletteColor(
                ['#05060d', '#07111c', '#0a0614', '#12090a'],
                0,
                0.040,
                gasPhaseSeed * 0.04
            );
            const coreFlareColor = getBreathingPaletteColor(
                ['#fff1b2', '#7ee7ff', accentColor, '#ff8fd8'],
                1,
                0.060,
                gasPhaseSeed * 0.03
            );

            const drawIrisLoop = (rx, ry, color, alpha, lineWidth, spin, wobbleScale) => {
                const steps = 96;
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const t = (Math.PI * 2 * i) / steps;
                    const drift = Math.sin(t * 3 + phase * 1.15 + spin) * (0.025 + highMid * 0.024) * wobbleScale
                        + Math.sin(t * 5 - phase * 0.92 - spin) * (0.016 + treble * 0.020) * wobbleScale;
                    const orbit = t + phase * spin * (0.21 + highMid * 0.035) + drift;
                    const rawX = cx
                        + Math.cos(orbit) * rx
                        + Math.sin(t * 2 - phase * 0.46) * rx * (0.014 + treble * 0.014);
                    const rawY = cy
                        + Math.sin(t * 2 + phase * spin * 0.20) * ry * (0.68 + bass * 0.055)
                        + Math.cos(t * 3 + phase * 0.38) * ry * (0.014 + mid * 0.017);
                    const warped = distortVisualizerPoint(rawX, rawY, 0.48);
                    const x = warped.x;
                    const y = warped.y;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = color;
                ctx.globalAlpha = alpha * activeAlpha;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            };

            const drawMobiusStrip = (rx, ry) => {
                const steps = 74;
                const edgeA = [];
                const edgeB = [];
                const ribs = [];
                const ribbonW = 5.5 + highMid * 9 + pulse * 3;
                for (let i = 0; i <= steps; i++) {
                    const t = (Math.PI * 2 * i) / steps;
                    const theta = t + phase * (0.16 + highMid * 0.08);
                    const centerX = cx + Math.sin(theta) * rx;
                    const centerY = cy
                        + Math.sin(theta * 2 - phase * 0.42) * ry * (0.54 + highMid * 0.10)
                        + Math.cos(theta - phase * 0.32) * ry * 0.12;
                    const dx = Math.cos(theta) * rx;
                    const dy = Math.cos(theta * 2 - phase * 0.42) * ry * 2 * (0.54 + highMid * 0.10)
                        - Math.sin(theta - phase * 0.32) * ry * 0.12;
                    const len = Math.max(1, Math.hypot(dx, dy));
                    const nx = -dy / len;
                    const ny = dx / len;
                    const twist = Math.cos(t * 0.5 + phase * 0.72);
                    const thickness = ribbonW * (0.45 + Math.abs(twist) * 0.65);
                    const warpedA = distortVisualizerPoint(centerX + nx * thickness, centerY + ny * thickness, 0.82);
                    const warpedB = distortVisualizerPoint(centerX - nx * thickness, centerY - ny * thickness, 0.82);
                    edgeA.push(warpedA);
                    edgeB.push(warpedB);
                    if (i % 7 === 0) ribs.push({ ax: warpedA.x, ay: warpedA.y, bx: warpedB.x, by: warpedB.y, twist, index: i });
                }

                ctx.save();
                ctx.globalAlpha = (0.10 + highMid * 0.070 + pulse * 0.030) * activeAlpha;
                ctx.fillStyle = getMusicPlayerSignalGradient(left, right, topY, bottomY, accentColor);
                ctx.beginPath();
                ctx.moveTo(edgeA[0].x, edgeA[0].y);
                for (let i = 1; i < edgeA.length; i++) ctx.lineTo(edgeA[i].x, edgeA[i].y);
                for (let i = edgeB.length - 1; i >= 0; i--) ctx.lineTo(edgeB[i].x, edgeB[i].y);
                ctx.closePath();
                ctx.fill();

                if (glowEnabled) {
                    ctx.shadowColor = '#7ee7ff';
                    ctx.shadowBlur = 7 + highMid * 8;
                }
                ctx.globalAlpha = (0.38 + highMid * 0.20) * activeAlpha;
                ctx.strokeStyle = colorWithAlpha(getBreathingPaletteColor(['#7ee7ff', '#ffffff', accentColor], 2, 0.11, 0.4), 0.86);
                ctx.lineWidth = 1.15 + highMid * 1.05;
                ctx.beginPath();
                ctx.moveTo(edgeA[0].x, edgeA[0].y);
                for (let i = 1; i < edgeA.length; i++) ctx.lineTo(edgeA[i].x, edgeA[i].y);
                ctx.stroke();
                ctx.strokeStyle = colorWithAlpha(getBreathingPaletteColor(['#ff8fd8', accentColor, '#7ee7ff'], 4, 0.13, 1.8), 0.78);
                ctx.beginPath();
                ctx.moveTo(edgeB[0].x, edgeB[0].y);
                for (let i = 1; i < edgeB.length; i++) ctx.lineTo(edgeB[i].x, edgeB[i].y);
                ctx.stroke();
                ctx.shadowBlur = 0;

                ctx.lineWidth = 0.8;
                for (const rib of ribs) {
                    ctx.globalAlpha = (0.13 + Math.abs(rib.twist) * 0.26 + treble * 0.080) * activeAlpha;
                    const ribColor = getBreathingPaletteColor(
                        Math.abs(rib.twist) > 0.62 ? ['#ffffff', '#7ee7ff', '#fff1b2'] : [accentColor, '#ff8fd8', '#7ee7ff'],
                        rib.index || 0,
                        0.16,
                        2.1
                    );
                    ctx.strokeStyle = colorWithAlpha(ribColor, Math.abs(rib.twist) > 0.62 ? 0.62 : 0.56);
                    ctx.beginPath();
                    ctx.moveTo(rib.ax, rib.ay);
                    ctx.lineTo(rib.bx, rib.by);
                    ctx.stroke();
                }
                ctx.restore();
            };

            const drawBassGasCorona = (coreRadius) => {
                const gas = Math.max(0, Math.min(1, bassGlow * 0.82 + bassPulse * 0.58 + coreState.impact * 0.34));
                if (gas <= 0.01) return;
                const gasPhase = phase * (0.44 + bassGuitar * 0.18);
                const coronaRadius = coreRadius * (2.65 + gas * 1.70);
                const outerGas = ctx.createRadialGradient(coreCx, coreCy, coreRadius * 0.18, coreCx, coreCy, coronaRadius * 1.30);
                outerGas.addColorStop(0, colorWithAlpha('#ffffff', (0.16 + gas * 0.22) * activeAlpha));
                outerGas.addColorStop(0.20, colorWithAlpha('#7ee7ff', (0.15 + gas * 0.25) * activeAlpha));
                outerGas.addColorStop(0.48, colorWithAlpha(accentColor, (0.070 + gas * 0.16) * activeAlpha));
                outerGas.addColorStop(0.73, colorWithAlpha('#ff8fd8', (0.030 + gas * 0.090) * activeAlpha));
                outerGas.addColorStop(1, 'rgba(255,255,255,0)');

                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = outerGas;
                if (glowEnabled) {
                    ctx.shadowColor = '#7ee7ff';
                    ctx.shadowBlur = 12 + gas * 18;
                }
                ctx.beginPath();
                ctx.arc(coreCx, coreCy, coronaRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                for (let i = 0; i < 11; i++) {
                    const lane = i / 11;
                    const angle = lane * Math.PI * 2 + gasPhase * (0.55 + (i % 3) * 0.09);
                    const flutter = Math.sin(gasPhase * 1.7 + i * 1.91) * (0.18 + gas * 0.18);
                    const lobeDistance = coreRadius * (1.08 + gas * 0.62 + (i % 4) * 0.055);
                    const lobeLength = coreRadius * (0.72 + gas * 0.84 + Math.max(0, flutter) * 0.28);
                    const lobeWidth = coreRadius * (0.20 + gas * 0.22 + (i % 2) * 0.035);
                    ctx.save();
                    ctx.translate(coreCx, coreCy);
                    ctx.rotate(angle + flutter * 0.36);
                    ctx.globalAlpha = (0.055 + gas * 0.070 + bassPulse * 0.045) * activeAlpha;
                    ctx.fillStyle = i % 3 === 0
                        ? colorWithAlpha('#ffffff', 0.58)
                        : (i % 3 === 1 ? colorWithAlpha('#7ee7ff', 0.66) : colorWithAlpha(accentColor, 0.62));
                    ctx.beginPath();
                    ctx.ellipse(lobeDistance, 0, lobeLength, lobeWidth, flutter, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                ctx.lineCap = 'round';
                for (let i = 0; i < 8; i++) {
                    const angle = i * Math.PI * 0.25 + gasPhase * (0.28 + (i % 2) * 0.08);
                    const inner = coreRadius * (0.72 + (i % 3) * 0.06);
                    const outer = coronaRadius * (0.52 + (i % 4) * 0.045 + gas * 0.10);
                    const bend = Math.sin(gasPhase * 1.45 + i) * coreRadius * (0.55 + gas * 0.36);
                    ctx.globalAlpha = (0.035 + gas * 0.085 + bassPulse * 0.040) * activeAlpha;
                    ctx.strokeStyle = i % 2 ? colorWithAlpha('#7ee7ff', 0.76) : colorWithAlpha(accentColor, 0.70);
                    ctx.lineWidth = 0.8 + gas * 1.1;
                    ctx.beginPath();
                    ctx.moveTo(coreCx + Math.cos(angle) * inner, coreCy + Math.sin(angle) * inner);
                    ctx.bezierCurveTo(
                        coreCx + Math.cos(angle + 0.46) * (inner + outer) * 0.42,
                        coreCy + Math.sin(angle + 0.46) * (inner + outer) * 0.42 + bend * 0.22,
                        coreCx + Math.cos(angle - 0.32) * outer * 0.72,
                        coreCy + Math.sin(angle - 0.32) * outer * 0.72 - bend * 0.16,
                        coreCx + Math.cos(angle + flutterNoise(i)) * outer,
                        coreCy + Math.sin(angle + flutterNoise(i + 3)) * outer
                    );
                    ctx.stroke();
                }
                ctx.restore();
            };

            const drawInstrumentSatellites = () => {
                const seededUnit = (seed) => {
                    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
                    return value - Math.floor(value);
                };
                const groups = [
                    { mode: 'bass', count: 5, signal: bassGuitar, pulse: bassPulse, palette: [accentColor, '#ffb45a', '#fff1b2'], phaseOffset: 0.15, size: 1.95, colorSpeed: 0.09 },
                    { mode: 'drums', count: 6, signal: drumSnap, pulse, palette: ['#ffffff', '#7ee7ff', '#dcecff'], phaseOffset: 1.45, size: 1.42, colorSpeed: 0.24 },
                    { mode: 'lead', count: 5, signal: leadTone, pulse: highMid, palette: ['#7ee7ff', '#ff8fd8', '#ffffff'], phaseOffset: 2.80, size: 1.50, colorSpeed: 0.17 },
                    { mode: 'air', count: 5, signal: airTone, pulse: treble, palette: ['#ff8fd8', '#ffffff', '#7ee7ff'], phaseOffset: 4.12, size: 1.18, colorSpeed: 0.31 }
                ];

                const getSatellitePosition = (group, i, phaseValue, groupSignal, groupPulse) => {
                    const lane = i / group.count;
                    const seed = group.phaseOffset * 10 + i * 3.17;
                    let x;
                    let y;
                    if (group.mode === 'bass') {
                        const spread = (lane - 0.5) * baseRx * 1.32;
                        x = cx + spread + Math.sin(phaseValue * 0.32 + seed) * baseRx * (0.010 + groupSignal * 0.006);
                        y = cy + baseRy * (0.42 + seededUnit(seed) * 0.12) + Math.sin(phaseValue * 0.45 + seed) * baseRy * (0.035 + groupPulse * 0.022);
                    } else if (group.mode === 'drums') {
                        const speedBias = 0.92 + seededUnit(seed + 6) * 0.18;
                        const angle = phaseValue * speedBias + lane * Math.PI * 2 + group.phaseOffset + seededUnit(seed + 2) * 0.18;
                        const rx = baseRx * (0.50 + groupPulse * 0.035);
                        const ry = baseRy * (0.34 + groupSignal * 0.040);
                        x = cx + Math.cos(angle) * rx;
                        y = cy + Math.sin(angle) * ry + Math.sin(angle * 2.0 + phase * 0.16 + seed) * baseRy * 0.018;
                    } else if (group.mode === 'lead') {
                        const drift = phaseValue * 0.090 + group.phaseOffset + lane * Math.PI * 1.35;
                        x = cx + Math.cos(drift) * baseRx * (0.84 + groupSignal * 0.040);
                        y = cy - baseRy * 0.34 + (lane - 0.5) * baseRy * 0.82 + Math.sin(drift * 2.1) * baseRy * (0.075 + groupSignal * 0.025);
                    } else {
                        const orbitSpeedBias = 0.94 + seededUnit(seed + 5) * 0.12;
                        const angle = phaseValue * orbitSpeedBias + lane * Math.PI * 2 + group.phaseOffset + seededUnit(seed + 1) * 0.22;
                        const radiusBreath = 0.995 + Math.sin(phase * 0.14 + seed) * 0.010;
                        const rx = baseRx * (1.08 + seededUnit(seed + 2) * 0.10 + groupSignal * 0.008) * radiusBreath;
                        const ry = baseRy * (0.84 + seededUnit(seed + 3) * 0.14 + groupPulse * 0.008) * radiusBreath;
                        x = cx + Math.cos(angle) * rx;
                        y = cy + Math.sin(angle) * ry + Math.sin(angle * 2.0 + phase * 0.12 + seed) * baseRy * 0.020;
                    }
                    return distortVisualizerPoint(x, y, group.mode === 'bass' ? 0.38 : (group.mode === 'air' ? 0.42 : 0.58));
                };

                for (const group of groups) {
                    const groupSignal = Math.max(0, Math.min(1, group.signal || 0));
                    const groupPulse = Math.max(0, Math.min(1, group.pulse || 0));
                    for (let i = 0; i < group.count; i++) {
                        const phaseBase = group.mode === 'air'
                            ? satelliteOrbitState.outerAngle
                            : (group.mode === 'drums' ? satelliteOrbitState.innerAngle : phase);
                        const position = getSatellitePosition(group, i, phaseBase, groupSignal, groupPulse);
                        const x = position.x;
                        const y = position.y;
                        const speedGlow = group.mode === 'air'
                            ? Math.min(0.22, satelliteOrbitState.outerVelocity * 0.13)
                            : (group.mode === 'drums' ? Math.min(0.14, satelliteOrbitState.innerVelocity * 0.14) : 0);
                        const brightness = Math.max(0, Math.min(1, 0.18 + groupSignal * 0.56 + groupPulse * 0.18 + speedGlow + Math.sin(phase * 1.1 + i) * 0.050));
                        const dotRadius = group.size + brightness * 1.75 + groupPulse * 0.48;
                        const dotColor = getBreathingPaletteColor(group.palette, i, group.colorSpeed + i * 0.018, group.phaseOffset);
                        if ((i + group.count) % 2 === 0) {
                            for (let t = 2; t >= 1; t--) {
                                const trailOffset = group.mode === 'air'
                                    ? t * (0.070 + satelliteOrbitState.outerVelocity * 0.050)
                                    : (group.mode === 'drums'
                                        ? t * (0.075 + satelliteOrbitState.innerVelocity * 0.045)
                                        : t * (0.080 + groupSignal * 0.018));
                                const trail = getSatellitePosition(group, i, phaseBase - trailOffset, groupSignal, groupPulse);
                                ctx.globalAlpha = brightness * activeAlpha * (0.10 / t);
                                ctx.fillStyle = colorWithAlpha(dotColor, 0.44);
                                ctx.beginPath();
                                ctx.arc(trail.x, trail.y, Math.max(0.8, dotRadius * (1 - t * 0.20)), 0, Math.PI * 2);
                                ctx.fill();
                            }
                        }
                        if (glowEnabled) {
                            ctx.shadowColor = dotColor;
                            ctx.shadowBlur = 5 + brightness * 9;
                        }
                        ctx.globalAlpha = brightness * activeAlpha;
                        ctx.fillStyle = colorWithAlpha(dotColor, 0.92);
                        ctx.beginPath();
                        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }
            };

            const drawVisualizerEclipseCorona = () => {
                const eclipseEnergy = Math.max(0, Math.min(1, energy * 0.34 + mid * 0.20 + bassGlow * 0.36 + pulse * 0.12));
                const coronaRadius = Math.max(baseRy * 1.35, Math.min(baseRx * 0.54, 112)) * (0.88 + eclipseEnergy * 0.24);
                const rimRadius = Math.max(18, coronaRadius * (0.42 + bassGlow * 0.055));
                const outerRadius = coronaRadius * (1.72 + treble * 0.10);
                const coronaColor = getBreathingPaletteColor(['#fff1b2', '#7ee7ff', accentColor, '#ff8fd8'], 6, 0.070, 2.4);
                const hotRimColor = getBreathingPaletteColor(['#ffffff', '#fff1b2', '#7ee7ff'], 3, 0.055, 1.2);

                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                const corona = ctx.createRadialGradient(cx, cy, rimRadius * 0.62, cx, cy, outerRadius);
                corona.addColorStop(0, colorWithAlpha('#ffffff', (0.10 + bassGlow * 0.16 + coreState.impact * 0.08) * activeAlpha));
                corona.addColorStop(0.13, colorWithAlpha(hotRimColor, (0.24 + eclipseEnergy * 0.18) * activeAlpha));
                corona.addColorStop(0.22, colorWithAlpha(coronaColor, (0.19 + bassGlow * 0.14) * activeAlpha));
                corona.addColorStop(0.42, colorWithAlpha(accentColor, (0.070 + highMid * 0.060 + pulse * 0.035) * activeAlpha));
                corona.addColorStop(0.66, colorWithAlpha('#ff8fd8', (0.034 + treble * 0.042) * activeAlpha));
                corona.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = corona;
                ctx.beginPath();
                ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.lineCap = 'round';
                for (let ring = 0; ring < 3; ring++) {
                    const ringRadius = rimRadius * (0.95 + ring * 0.10 + Math.sin(phase * 0.16 + ring) * 0.005);
                    ctx.globalAlpha = (0.24 - ring * 0.045 + bassGlow * 0.080 + coreState.impact * 0.045) * activeAlpha;
                    ctx.strokeStyle = colorWithAlpha(ring ? coronaColor : hotRimColor, 0.92);
                    ctx.lineWidth = 1.0 + ring * 0.45 + eclipseEnergy * 0.82;
                    if (glowEnabled) {
                        ctx.shadowColor = ring ? coronaColor : hotRimColor;
                        ctx.shadowBlur = 10 + eclipseEnergy * 14;
                    }
                    ctx.beginPath();
                    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
                    ctx.stroke();
                }

                for (let ray = 0; ray < 10; ray++) {
                    const angle = phase * (0.055 + ray * 0.002) + ray * Math.PI * 0.2;
                    const inner = rimRadius * (1.05 + (ray % 3) * 0.04);
                    const outer = outerRadius * (0.54 + (ray % 4) * 0.055 + eclipseEnergy * 0.055);
                    const rayAlpha = (0.022 + eclipseEnergy * 0.024 + treble * 0.010) * activeAlpha;
                    const rayColor = ray % 2 ? coronaColor : hotRimColor;
                    const start = distortVisualizerPoint(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner, 0.44);
                    const end = distortVisualizerPoint(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer, 0.50);
                    ctx.globalAlpha = rayAlpha;
                    ctx.strokeStyle = colorWithAlpha(rayColor, 0.74);
                    ctx.lineWidth = 0.8 + eclipseEnergy * 0.45;
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                }
                ctx.restore();
            };

            const drawVoidAccretionDisk = (shadowRadius, frontOnly = false) => {
                const axis = -0.18 + Math.sin(phase * 0.13) * 0.035;
                const diskPulse = 0.86 + bassGlow * 0.18 + coreState.impact * 0.12 + voidSunReturn * 0.24;
                const bands = [
                    {
                        rx: shadowRadius * (2.42 + bassGlow * 0.18),
                        ry: shadowRadius * (0.48 + bassPulse * 0.035),
                        y: -shadowRadius * 0.13,
                        width: 3.4,
                        blur: 11,
                        alpha: 0.24,
                        palette: ['#ff8f35', '#fff1b2', accentColor],
                        speed: 0.060
                    },
                    {
                        rx: shadowRadius * (2.04 + coreState.impact * 0.10),
                        ry: shadowRadius * 0.36,
                        y: -shadowRadius * 0.08,
                        width: 1.8,
                        blur: 8,
                        alpha: 0.31,
                        palette: ['#fff1b2', '#ffb45a', '#ffffff'],
                        speed: 0.050
                    },
                    {
                        rx: shadowRadius * 1.18,
                        ry: shadowRadius * 0.28,
                        y: shadowRadius * 0.04,
                        width: 1.45,
                        blur: 12,
                        alpha: 0.44,
                        palette: ['#ffffff', '#7ee7ff', '#fff1b2'],
                        speed: 0.030
                    }
                ];

                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.translate(coreCx, coreCy);
                ctx.rotate(axis);
                ctx.lineCap = 'round';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (let i = 0; i < bands.length; i++) {
                    const band = bands[i];
                    const color = getBreathingPaletteColor(band.palette, i, band.speed + i * 0.012, 5.7 + i);
                    ctx.strokeStyle = colorWithAlpha(color, 0.86);
                    ctx.lineWidth = Math.max(0.7, band.width + bassGlow * 0.7);
                    ctx.shadowColor = color;
                    ctx.shadowBlur = glowEnabled ? band.blur + bassGlow * 10 : 0;
                    ctx.globalAlpha = band.alpha * diskPulse * activeAlpha * (frontOnly ? 1.15 : 0.78);
                    ctx.beginPath();
                    if (frontOnly) {
                        ctx.ellipse(0, band.y, band.rx, band.ry, 0, 0.02, Math.PI - 0.02);
                    } else {
                        ctx.ellipse(0, band.y, band.rx, band.ry, 0, Math.PI + 0.04, Math.PI * 2 - 0.04);
                    }
                    ctx.stroke();
                }

                if (frontOnly) {
                    const innerColor = getBreathingPaletteColor(['#ffffff', '#7ee7ff', '#fff1b2'], 7, 0.026, 7.2);
                    ctx.strokeStyle = colorWithAlpha(innerColor, 0.92);
                    ctx.lineWidth = 1.15 + bassGlow * 0.8;
                    ctx.shadowColor = innerColor;
                    ctx.shadowBlur = glowEnabled ? 16 + bassGlow * 16 : 0;
                    ctx.globalAlpha = (0.30 + bassGlow * 0.18 + coreState.impact * 0.14) * activeAlpha;
                    ctx.beginPath();
                    ctx.ellipse(0, shadowRadius * 0.055, shadowRadius * 1.03, shadowRadius * 0.24, 0, 0.10, Math.PI - 0.22);
                    ctx.stroke();
                } else {
                    for (let i = 0; i < 10; i++) {
                        const t = i / 9;
                        const glyphColor = getBreathingPaletteColor(['#ff8f35', '#fff1b2', '#ffb45a'], i, 0.055 + i * 0.006, 8.9);
                        const angle = Math.PI + t * Math.PI + phase * 0.06 + Math.sin(i * 1.7) * 0.08;
                        const gx = Math.cos(angle) * shadowRadius * (1.45 + t * 0.92);
                        const gy = -shadowRadius * 0.12 + Math.sin(angle) * shadowRadius * (0.23 + t * 0.07);
                        ctx.globalAlpha = (0.13 + t * 0.10 + bassPulse * 0.05) * activeAlpha;
                        ctx.fillStyle = colorWithAlpha(glyphColor, 0.82);
                        ctx.font = `bold ${Math.max(7, Math.round(shadowRadius * (0.22 + t * 0.08)))}px Courier New`;
                        ctx.fillText(i % 3 === 0 ? '*' : (i % 3 === 1 ? '+' : 'o'), gx, gy);
                    }
                }
                ctx.restore();
            };

            const flutterNoise = (n) => Math.sin(gasPhaseSeed + n * 1.618) * 0.18;

            ctx.save();
            ctx.beginPath();
            ctx.rect(left, topY, right - left, bottomY - topY);
            ctx.clip();

            ctx.globalCompositeOperation = 'source-over';
            const backdrop = ctx.createLinearGradient(left, topY, right, bottomY);
            backdrop.addColorStop(0, 'rgba(10, 5, 18, 0.82)');
            backdrop.addColorStop(0.34, 'rgba(4, 15, 29, 0.88)');
            backdrop.addColorStop(0.68, 'rgba(5, 10, 23, 0.88)');
            backdrop.addColorStop(1, 'rgba(18, 4, 17, 0.82)');
            ctx.fillStyle = backdrop;
            ctx.fillRect(left, topY, right - left, bottomY - topY);

            ctx.globalCompositeOperation = 'screen';

            const aura = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(baseRx * 0.94, baseRy * 1.8));
            aura.addColorStop(0, colorWithAlpha('#ffffff', (0.13 + bassGlow * 0.12 + energy * 0.045) * activeAlpha));
            aura.addColorStop(0.18, colorWithAlpha('#7ee7ff', (0.13 + highMid * 0.080) * activeAlpha));
            aura.addColorStop(0.42, colorWithAlpha(accentColor, (0.070 + bassGlow * 0.070) * activeAlpha));
            aura.addColorStop(0.75, colorWithAlpha('#ff8fd8', (0.050 + treble * 0.055) * activeAlpha));
            aura.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = aura;
            ctx.fillRect(left, topY, right - left, bottomY - topY);

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 1;
            ctx.strokeStyle = colorWithAlpha('#7ee7ff', (0.020 + profileLock * 0.014) * activeAlpha);
            for (let i = 0; i < 6; i++) {
                const x = left + (viewW * i) / 5;
                ctx.beginPath();
                ctx.moveTo(x | 0, topY);
                ctx.lineTo((x + Math.sin(phase * 0.24 + i) * 4.5) | 0, bottomY);
                ctx.stroke();
            }
            ctx.strokeStyle = colorWithAlpha(accentColor, (0.018 + profileLock * 0.014) * activeAlpha);
            for (let i = 1; i < 4; i++) {
                const y = topY + (viewH * i) / 4;
                ctx.beginPath();
                ctx.moveTo(left, y | 0);
                ctx.lineTo(right, (y + Math.sin(phase * 0.34 + i) * 1.8) | 0);
                ctx.stroke();
            }

            drawVisualizerEclipseCorona();

            ctx.globalAlpha = (0.12 + treble * 0.090) * activeAlpha;
            for (let i = 0; i < 4; i++) {
                const ringT = i / 3;
                ctx.lineWidth = 0.65 + treble * 0.52 + ringT * 0.30;
                ctx.strokeStyle = colorWithAlpha(getBreathingPaletteColor(['#ffffff', '#7ee7ff', '#ff8fd8', accentColor], i, 0.12 + i * 0.025, 1.25), 0.72);
                ctx.beginPath();
                ctx.ellipse(
                    cx,
                    cy,
                    baseRx * (0.24 + ringT * 0.22 + treble * 0.020),
                    baseRy * (0.24 + ringT * 0.16 + treble * 0.016),
                    phase * (0.12 + i * 0.032 + treble * 0.012),
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }

            drawMobiusStrip(baseRx * (0.76 + profileLock * 0.030 + highMid * 0.070), baseRy * (0.86 + profileLock * 0.030 + highMid * 0.075));

            if (glowEnabled) {
                ctx.shadowColor = accentColor;
                ctx.shadowBlur = 9 + energy * 5.5;
            }
            drawIrisLoop(baseRx * (0.92 + highMid * 0.038), baseRy * (0.84 + highMid * 0.030), signalGradient, 0.46 + highMid * 0.16, 1.35 + highMid * 0.88, 1.0, 0.80);
            drawIrisLoop(baseRx * (0.70 + treble * 0.028), baseRy * (1.02 + treble * 0.060), colorWithAlpha('#7ee7ff', 0.92), 0.33 + treble * 0.15, 0.98 + treble * 0.56, -1.35, 0.84);
            drawIrisLoop(baseRx * (1.06 + highMid * 0.055), baseRy * (0.60 + highMid * 0.045), colorWithAlpha('#ff8fd8', 0.86), 0.27 + highMid * 0.15, 0.90 + highMid * 0.60, 1.75, 0.74);
            ctx.shadowBlur = 0;

            drawInstrumentSatellites();

            ctx.globalAlpha = (0.12 + treble * 0.11) * activeAlpha;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.max(7, Math.min(10, viewH * 0.075))}px Courier New`;
            const glyphs = ['0', '1', '+', 'x', '::', '<>'];
            for (let i = 0; i < 14; i++) {
                const lane = i / 13;
                const drift = (phase * (0.022 + (i % 4) * 0.006) + lane) % 1;
                const rawX = left + drift * viewW;
                const rawY = topY + 12 + ((i * 29) % Math.max(1, viewH - 24));
                const warped = distortVisualizerPoint(rawX, rawY, 0.48);
                const glyphColor = getBreathingPaletteColor(
                    i % 3 === 0 ? ['#ffffff', '#7ee7ff', '#fff1b2'] : (i % 2 ? ['#7ee7ff', '#ff8fd8', '#ffffff'] : [accentColor, '#7ee7ff', '#ff8fd8']),
                    i,
                    0.10 + (i % 5) * 0.025,
                    3.4
                );
                ctx.fillStyle = colorWithAlpha(glyphColor, 0.68);
                ctx.fillText(glyphs[i % glyphs.length], warped.x, warped.y);
            }

            const coreRadius = 8 + bassGuitar * 5 + bassGlow * 6 + coreState.impact * 3.5;
            const shadowRadius = Math.max(13, coreRadius * (1.08 + voidMode * 0.38));
            const coreGlowRadius = coreRadius * (2.35 + bassGlow * 0.70 + coreState.impact * 0.42);
            drawBassGasCorona(coreRadius);

            ctx.globalCompositeOperation = 'screen';
            const voidHalo = ctx.createRadialGradient(coreCx, coreCy, 1, coreCx, coreCy, coreGlowRadius * 1.28);
            voidHalo.addColorStop(0, colorWithAlpha(coreFlareColor, (0.040 + voidSunReturn * 0.22) * activeAlpha));
            voidHalo.addColorStop(0.32, colorWithAlpha('#7ee7ff', (0.060 + bassGlow * 0.075) * activeAlpha));
            voidHalo.addColorStop(0.58, colorWithAlpha(accentColor, (0.025 + bassGlow * 0.050 + voidSunReturn * 0.11) * activeAlpha));
            voidHalo.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = voidHalo;
            ctx.beginPath();
            ctx.arc(coreCx, coreCy, coreGlowRadius * 1.28, 0, Math.PI * 2);
            ctx.fill();
            drawVoidAccretionDisk(shadowRadius, false);

            ctx.globalCompositeOperation = 'source-over';
            const shadow = ctx.createRadialGradient(coreCx - shadowRadius * 0.18, coreCy - shadowRadius * 0.16, shadowRadius * 0.10, coreCx, coreCy, shadowRadius * 1.22);
            shadow.addColorStop(0, colorWithAlpha('#000000', 0.98 * activeAlpha));
            shadow.addColorStop(0.52, colorWithAlpha(coreBreathColor, 0.96 * activeAlpha));
            shadow.addColorStop(0.78, colorWithAlpha('#01030a', 0.90 * activeAlpha));
            shadow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = shadow;
            ctx.beginPath();
            ctx.arc(coreCx, coreCy, shadowRadius * 1.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = (0.92 - voidSunReturn * 0.42) * activeAlpha;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(coreCx, coreCy, shadowRadius * (0.58 + voidMode * 0.18), 0, Math.PI * 2);
            ctx.fill();

            ctx.globalCompositeOperation = 'screen';
            drawVoidAccretionDisk(shadowRadius, true);
            ctx.globalAlpha = (0.18 + bassGlow * 0.18 + voidSunReturn * 0.42) * activeAlpha;
            ctx.strokeStyle = colorWithAlpha(coreFlareColor, 0.88);
            ctx.lineWidth = 1.2 + bassGlow * 1.3;
            ctx.shadowColor = coreFlareColor;
            ctx.shadowBlur = glowEnabled ? 10 + bassGlow * 18 + voidSunReturn * 22 : 0;
            ctx.beginPath();
            ctx.arc(coreCx, coreCy, shadowRadius * (1.02 + voidSunReturn * 0.18), 0, Math.PI * 2);
            ctx.stroke();

            if (voidSunReturn > 0.035) {
                const flareRadius = coreRadius * (1.65 + voidSunReturn * 0.85);
                const flare = ctx.createRadialGradient(coreCx, coreCy, 1, coreCx, coreCy, flareRadius);
                flare.addColorStop(0, colorWithAlpha('#ffffff', 0.78 * voidSunReturn * activeAlpha));
                flare.addColorStop(0.24, colorWithAlpha(coreFlareColor, 0.62 * voidSunReturn * activeAlpha));
                flare.addColorStop(0.56, colorWithAlpha(accentColor, 0.32 * voidSunReturn * activeAlpha));
                flare.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = flare;
                ctx.beginPath();
                ctx.arc(coreCx, coreCy, flareRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;

            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = selected ? mixColor(accentColor, '#ffffff', 0.52) : colorWithAlpha(accentColor, 0.42);
            ctx.globalAlpha = selected ? 0.92 : 0.58;
            ctx.lineWidth = selected ? 2 : 1;
            if (glowEnabled && selected) {
                ctx.shadowColor = accentColor;
                ctx.shadowBlur = 12;
            }
            ctx.strokeRect((left + 0.5) | 0, (topY + 0.5) | 0, (right - left) | 0, (bottomY - topY) | 0);
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        function drawMusicPlayerFullscreenControls(status, accent, renderNow) {
            const lastInput = Number.isFinite(status.fullscreenLastInput) && status.fullscreenLastInput > 0
                ? status.fullscreenLastInput
                : renderNow;
            const idleMs = Math.max(0, renderNow - lastInput);
            const fadeStart = 1800;
            const fadeDuration = 2600;
            const uiAlpha = idleMs <= fadeStart ? 1 : Math.max(0.12, 1 - (idleMs - fadeStart) / fadeDuration);
            const panelW = Math.min(width - 48, 820);
            const panelH = 62;
            const panelX = Math.round((width - panelW) / 2);
            const panelY = Math.round(height - panelH - 18);
            const duration = Math.max(0.001, status.duration || 0.001);
            const fillRatio = Math.max(0, Math.min(1, status.position / duration));
            const pulse = (Math.sin(renderNow * 0.005) + 1) * 0.5;

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = uiAlpha;
            const panelGradient = ctx.createLinearGradient(panelX, panelY, panelX + panelW, panelY + panelH);
            panelGradient.addColorStop(0, 'rgba(4, 9, 19, 0.72)');
            panelGradient.addColorStop(0.45, 'rgba(16, 12, 24, 0.62)');
            panelGradient.addColorStop(1, 'rgba(3, 10, 20, 0.72)');
            ctx.fillStyle = panelGradient;
            ctx.fillRect(panelX | 0, panelY | 0, panelW | 0, panelH | 0);
            ctx.strokeStyle = colorWithAlpha(accent, 0.42 + pulse * 0.10);
            ctx.lineWidth = 1;
            ctx.strokeRect((panelX + 0.5) | 0, (panelY + 0.5) | 0, panelW | 0, panelH | 0);

            const seekX = panelX + 20;
            const seekY = panelY + 34;
            const seekW = panelW - 40;
            const seekH = 8;
            ctx.fillStyle = 'rgba(2, 6, 14, 0.82)';
            ctx.fillRect(seekX | 0, seekY | 0, seekW | 0, seekH | 0);
            ctx.fillStyle = getMusicPlayerSeekGradient(seekX, seekW, accent);
            ctx.fillRect((seekX + 1) | 0, (seekY + 1) | 0, Math.max(0, (seekW - 2) * fillRatio) | 0, Math.max(0, seekH - 2) | 0);
            ctx.strokeStyle = colorWithAlpha('#ffffff', 0.20);
            ctx.strokeRect((seekX + 0.5) | 0, (seekY + 0.5) | 0, seekW | 0, seekH | 0);

            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.font = `bold 14px 'Electrolize', sans-serif`;
            ctx.fillStyle = mixColor(accent, '#ffffff', 0.45);
            const titleMaxW = Math.max(180, panelW - 260);
            ctx.fillText(truncateConsoleLine(status.trackName.toUpperCase(), titleMaxW), panelX + 20, panelY + 17);
            ctx.font = `bold 10px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#dcecff', 0.58);
            ctx.fillText(status.isPlaying ? 'SPACE PAUSE' : 'SPACE PLAY', panelX + 20, panelY + 52);
            ctx.fillText('LEFT/RIGHT SEEK  UP/DOWN TRACK  ESC BACK', panelX + 126, panelY + 52);

            ctx.textAlign = 'right';
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.74);
            ctx.fillText(`${status.positionText} / ${status.durationText}`, panelX + panelW - 20, panelY + 17);
            ctx.restore();
        }

        function drawMusicPlayerFullscreen(renderNow, dt) {
            if (typeof getMusicPlayerStatus !== 'function') return false;
            const status = getMusicPlayerStatus();
            if (!status || !status.open || !status.fullscreen) return false;

            const accent = '#ffd95a';
            const safeNow = Number.isFinite(renderNow) ? renderNow : currentFrameNow || performance.now();

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;

            if (typeof drawGalaxySelectBackground === 'function') {
                const previousGalaxyCtx = galaxyCtx;
                galaxyCtx = ctx;
                try {
                    drawGalaxySelectBackground(safeNow);
                } finally {
                    galaxyCtx = previousGalaxyCtx;
                }
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'rgba(0, 3, 12, 0.24)';
                ctx.fillRect(0, 0, width | 0, height | 0);
            } else {
                ctx.fillStyle = '#01040c';
                ctx.fillRect(0, 0, width | 0, height | 0);
            }

            drawMusicPlayerVisualizer(0, 0, width, height, accent, status, {
                left: Math.max(24, width * 0.055),
                right: Math.min(width - 24, width * 0.945),
                topY: Math.max(24, height * 0.055),
                bottomY: Math.max(220, height - 96),
                fullscreen: true
            });
            drawMusicPlayerFullscreenControls(status, accent, safeNow);
            ctx.restore();
            return true;
        }

        function drawMusicPlayerOverlay() {
            if (typeof getMusicPlayerStatus !== 'function') return;
            const status = getMusicPlayerStatus();
            if (!status || !status.open) return;

            const accent = '#ffd95a';
            const panelW = Math.min(640, width - 72);
            const panelH = 306;
            const panelX = Math.round((width - panelW) / 2);
            const panelY = Math.round(Math.max(54, height * 0.20));
            const pad = 18;
            const pulse = (Math.sin(currentFrameNow * 0.006) + 1) * 0.5;

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(0, 3, 10, 0.46)';
            ctx.fillRect(0, 0, width | 0, height | 0);
            drawPauseHudPanel(panelX, panelY, panelW, panelH, accent, true, {
                fillAlpha: 0.94,
                borderAlpha: 0.74,
                edgeWashAlpha: 0.012,
                innerSheenAlpha: 0.004,
                rail: true
            });
            drawMusicPlayerVisualizer(panelX, panelY, panelW, panelH, accent, status, {
                selected: status.selection === 5
            });

            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 10px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.58);
            ctx.fillText('MUSIC PLAYER', panelX + pad, panelY + 22);

            const trackCountLabel = `${String(status.trackIndex + 1).padStart(2, '0')} / ${String(status.trackCount).padStart(2, '0')}`;
            ctx.textAlign = 'right';
            ctx.font = `bold 18px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha(accent, 0.86);
            ctx.fillText(trackCountLabel, panelX + panelW - pad, panelY + 38);
            const trackCountW = ctx.measureText(trackCountLabel).width;

            ctx.textAlign = 'left';
            ctx.font = `bold 24px 'Electrolize', sans-serif`;
            ctx.fillStyle = status.isLoaded ? mixColor(accent, '#ffffff', 0.42) : '#ff88a6';
            const trackNameW = Math.max(120, panelW - pad * 2 - trackCountW - 24);
            const trackLabel = truncateConsoleLine(status.isLoaded ? status.trackName.toUpperCase() : `${status.trackName.toUpperCase()}  LOADING`, trackNameW);
            ctx.fillText(trackLabel, panelX + pad, panelY + 38);

            if (status.selection === 5) {
                ctx.textAlign = 'right';
                ctx.font = `bold 9px 'Electrolize', sans-serif`;
                ctx.fillStyle = colorWithAlpha('#ffffff', 0.62 + pulse * 0.16);
                ctx.fillText('ENTER FULLSCREEN', panelX + panelW - pad, panelY + 176);
            }

            const seekX = panelX + pad;
            const seekY = panelY + 190;
            const seekW = panelW - pad * 2;
            const seekH = 13;
            const seekSelected = status.selection === 0;
            const duration = Math.max(0.001, status.duration || 0.001);
            const fillRatio = Math.max(0, Math.min(1, status.position / duration));

            ctx.fillStyle = seekSelected ? colorWithAlpha('#ffffff', 0.09) : 'rgba(3, 8, 18, 0.72)';
            ctx.fillRect(seekX | 0, seekY | 0, seekW | 0, seekH | 0);
            ctx.strokeStyle = seekSelected ? mixColor(accent, '#ffffff', 0.52) : colorWithAlpha(accent, 0.34);
            ctx.lineWidth = seekSelected ? 2 : 1;
            ctx.strokeRect((seekX + 0.5) | 0, (seekY + 0.5) | 0, seekW | 0, seekH | 0);

            ctx.fillStyle = getMusicPlayerSeekGradient(seekX, seekW, accent);
            ctx.fillRect((seekX + 2) | 0, (seekY + 2) | 0, Math.max(0, (seekW - 4) * fillRatio) | 0, Math.max(0, seekH - 4) | 0);
            if (status.loopStart > 0 && status.loopStart < status.duration) {
                const markerX = seekX + seekW * (status.loopStart / duration);
                ctx.strokeStyle = colorWithAlpha('#ffffff', 0.46);
                ctx.beginPath();
                ctx.moveTo(markerX | 0, seekY - 4);
                ctx.lineTo(markerX | 0, seekY + seekH + 4);
                ctx.stroke();
            }
            const handleX = seekX + seekW * fillRatio;
            ctx.fillStyle = seekSelected ? '#ffffff' : colorWithAlpha('#dcecff', 0.78);
            if (glowEnabled && seekSelected) {
                ctx.shadowColor = accent;
                ctx.shadowBlur = 10 + pulse * 8;
            }
            ctx.fillRect((handleX - 2) | 0, (seekY - 3) | 0, 4, seekH + 6);
            ctx.shadowBlur = 0;

            ctx.font = `bold 11px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#dcecff', 0.76);
            ctx.textAlign = 'left';
            ctx.fillText(status.positionText, seekX, seekY + 30);
            ctx.textAlign = 'right';
            ctx.fillText(status.durationText, seekX + seekW, seekY + 30);

            const rowY = panelY + 230;
            const buttonW = 58;
            const buttonH = 28;
            const gap = 8;
            const buttonsTotal = buttonW * 3 + gap * 2;
            const rowX = Math.round(panelX + (panelW - buttonsTotal) / 2);
            drawMusicPlayerButton('|<', rowX, rowY, buttonW, buttonH, status.selection === 1, accent);
            drawMusicPlayerButton(status.isPlaying ? 'PAUSE' : 'PLAY', rowX + buttonW + gap, rowY, buttonW, buttonH, status.selection === 2, accent);
            drawMusicPlayerButton('>|', rowX + (buttonW + gap) * 2, rowY, buttonW, buttonH, status.selection === 3, accent);

            const volumeW = Math.min(272, panelW - pad * 2);
            const volumeH = 24;
            const volX = Math.round(panelX + (panelW - volumeW) / 2);
            const volY = rowY + buttonH + 7;
            const volSelected = status.selection === 4;
            ctx.save();
            ctx.fillStyle = volSelected ? colorWithAlpha(accent, 0.18 + pulse * 0.07) : 'rgba(5, 12, 24, 0.58)';
            ctx.fillRect(volX | 0, volY | 0, volumeW | 0, volumeH | 0);
            ctx.strokeStyle = volSelected ? mixColor(accent, '#ffffff', 0.38) : colorWithAlpha(accent, 0.34);
            ctx.lineWidth = volSelected ? 2 : 1;
            if (glowEnabled && volSelected) {
                ctx.shadowColor = accent;
                ctx.shadowBlur = 10 + pulse * 8;
            }
            ctx.strokeRect((volX + 0.5) | 0, (volY + 0.5) | 0, volumeW | 0, volumeH | 0);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 12px 'Electrolize', sans-serif`;
            ctx.fillStyle = volSelected ? mixColor(accent, '#ffffff', 0.6) : colorWithAlpha('#dcecff', 0.76);
            ctx.fillText('VOL', volX + 10, volY + volumeH / 2 + 1);
            const percentText = `${Math.round(status.volume * 100)}%`;
            const meterX = volX + 50;
            const meterY = volY + Math.round((volumeH - 8) / 2);
            const meterW = volumeW - 102;
            ctx.fillStyle = 'rgba(2, 7, 16, 0.8)';
            ctx.fillRect(meterX, meterY, meterW, 8);
            ctx.fillStyle = colorWithAlpha(accent, 0.82);
            ctx.fillRect(meterX, meterY, Math.max(0, meterW * status.volume), 8);
            ctx.strokeStyle = colorWithAlpha('#ffffff', 0.24);
            ctx.strokeRect((meterX + 0.5) | 0, (meterY + 0.5) | 0, meterW | 0, 8);
            ctx.textAlign = 'right';
            ctx.font = `bold 10px 'Electrolize', sans-serif`;
            ctx.fillStyle = colorWithAlpha('#ffffff', 0.74);
            ctx.fillText(percentText, volX + volumeW - 10, volY + volumeH / 2 + 1);
            ctx.restore();

            ctx.restore();
        }

        function resetMusicVisualizerRenderCaches() {
            musicPlayerGradientCache.signalKey = '';
            musicPlayerGradientCache.signalGradient = null;
            musicPlayerGradientCache.seekKey = '';
            musicPlayerGradientCache.seekGradient = null;
            musicPlayerBassCoreState.x = 0;
            musicPlayerBassCoreState.y = 0;
            musicPlayerBassCoreState.vx = 0;
            musicPlayerBassCoreState.vy = 0;
            musicPlayerBassCoreState.lastBass = 0;
            musicPlayerBassCoreState.impact = 0;
            musicPlayerBassCoreState.lastNow = 0;
            musicPlayerSatelliteOrbitState.outerAngle = 0;
            musicPlayerSatelliteOrbitState.outerVelocity = 0;
            musicPlayerSatelliteOrbitState.outerDrive = 0;
            musicPlayerSatelliteOrbitState.innerAngle = 0;
            musicPlayerSatelliteOrbitState.innerVelocity = 0;
            musicPlayerSatelliteOrbitState.innerDrive = 0;
            musicPlayerSatelliteOrbitState.lastNow = 0;
        }
