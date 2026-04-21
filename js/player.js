        // Player model, weapons, upgrades, beams, and console commands.
        // Player Entity & Stats
        const PLAYER_BODY_CHAR = '▲';
        const PLAYER_THRUSTER_CHAR = '▲';
        const PLAYER_BODY_FONT_SIZE = 132;
        const PLAYER_THRUSTER_FONT_SIZE = 42;
        const BOMB_BASE_COOLDOWN = 12;
        const BOMB_GRENADE_SPEED = 980;
        const BOMB_GRENADE_RANGE = 500;
        const BOMB_EXPLOSION_RADIUS = 235;
        const BOMB_EXPLOSION_DAMAGE = 125;
        const BOMB_SHRAPNEL_COUNT = 14;
        const BOMB_SHRAPNEL_DAMAGE = 9;
        const BOMB_SHRAPNEL_SPEED_MIN = 520;
        const BOMB_SHRAPNEL_SPEED_MAX = 840;
        const BOMB_SHRAPNEL_LIFE = 0.5;
        const PLAYER_SHIP_MODELS = {
            center: {
                body: { x: 0, y: -8, rotation: 0 },
                thrusters: [
                    { x: -18, y: 28, rotation: -0.05 },
                    { x: 18, y: 28, rotation: 0.05 }
                ],
                weaponOrigin: { x: 0, y: -72 },
                rearOrigin: { x: 0, y: 48 }
            },
            left: {
                body: { x: -10, y: -8, rotation: -0.09 },
                thrusters: [
                    { x: -24, y: 32, rotation: -0.1 },
                    { x: 8, y: 24, rotation: -0.04 }
                ],
                weaponOrigin: { x: -10, y: -72 },
                rearOrigin: { x: -6, y: 48 }
            },
            right: {
                body: { x: 10, y: -8, rotation: 0.09 },
                thrusters: [
                    { x: -8, y: 24, rotation: 0.04 },
                    { x: 24, y: 32, rotation: 0.1 }
                ],
                weaponOrigin: { x: 10, y: -72 },
                rearOrigin: { x: 6, y: 48 }
            }
        };
        const PLAYER_DEBRIS_LAYOUTS = {
            center: [
                { x: 0, y: -60, size: 28 },
                { x: -16, y: -34, size: 34 }, { x: 16, y: -34, size: 34 },
                { x: -30, y: -6, size: 42 }, { x: 0, y: -10, size: 44 }, { x: 30, y: -6, size: 42 },
                { x: -40, y: 18, size: 36 }, { x: -16, y: 18, size: 34 }, { x: 16, y: 18, size: 34 }, { x: 40, y: 18, size: 36 },
                { x: 0, y: 30, size: 32 }
            ],
            left: [
                { x: -10, y: -60, size: 28 },
                { x: -24, y: -36, size: 34 }, { x: 6, y: -34, size: 30 },
                { x: -40, y: -8, size: 42 }, { x: -10, y: -12, size: 42 }, { x: 22, y: -10, size: 36 },
                { x: -48, y: 18, size: 36 }, { x: -24, y: 18, size: 34 }, { x: 0, y: 18, size: 34 }, { x: 24, y: 14, size: 32 },
                { x: -6, y: 30, size: 30 }
            ],
            right: [
                { x: 10, y: -60, size: 28 },
                { x: -6, y: -34, size: 30 }, { x: 24, y: -36, size: 34 },
                { x: -22, y: -10, size: 36 }, { x: 10, y: -12, size: 42 }, { x: 40, y: -8, size: 42 },
                { x: -24, y: 14, size: 32 }, { x: 0, y: 18, size: 34 }, { x: 24, y: 18, size: 34 }, { x: 48, y: 18, size: 36 },
                { x: 6, y: 30, size: 30 }
            ]
        };

        const player = {
            x: width / 2, y: height * 0.8,
            vx: 0, vy: 0,
            hp: 100, maxHp: 100,
            xp: 0, xpNeeded: 10, level: 1,
            stats: { L: 1, M: 0, B: 0 },
            modifiers: { 
                moveSpeed: 0, 
                maxHp: 0, 
                laserDamage: 0, 
                hitbox: 1, 
                fireRate: 0, 
                hpRegen: 0, 
                invincibility: 0, 
                adrenaline: 0, 
                magnet: 0, 
                bombCooldown: 1 
            },
            weaponStats: {
                damageMult: 1, fireRateMult: 1, speedMult: 1, sizeMult: 1,
                pierceCount: 0, splashRadius: 0, splashDamagePercent: 0, homing: false,
                chainCount: 0, pathFunction: 'straight', mode: 'projectile',
                hasRearFire: false, hasOrbitalDrones: false, pelletCount: 1, spreadAngle: 0, inaccuracy: 0
            },
            weapons: [],
            drones: [{angle: 0, timer: 0}, {angle: Math.PI, timer: 0}],
            isBeaming: false,
            beamAngle: -Math.PI / 2,
            beamTargetAngle: -Math.PI / 2,
            beamDeploy: 0,
            rearFireTicker: 0,
            bombTimer: 0,
            bombCooldown: BOMB_BASE_COOLDOWN,
            invincibilityTimer: 0,
            flashTimer: 0,
            fireRate: 260, // base ~3.8 shots/sec
            color: '#00ffff',
            lastFire: 0,
            isFiring: false
        };

        const PLAYER_FIRE_FORWARD_ANGLE = -Math.PI / 2;
        const PLAYER_FIRE_SKEW_ANGLE = 8 * Math.PI / 180;
        const EXHAUST_PARTICLE_CHARS = ['^', '*', '.', 'v'];
        const SMOKE_PARTICLE_CHARS = ['░', '▒', '·'];
        const SMOKE_PARTICLE_COLORS = ['#555555', '#444444'];
        const ELEMENTAL_TRAIL_CHARS = ['^', '*', '░'];
        const IMPACT_DEBRIS_CHARS = ['·', '∙', '•', '░'];
        const IMPACT_DEBRIS_COLORS = ['#888888', '#666666', '#999999', '#aaaaaa'];

        function getPlayerFacing(ship = player) {
            if (ship.vx < -450) return 'left';
            if (ship.vx > 450) return 'right';
            return 'center';
        }

        function isPlayerFirePressed() {
            return keys.arrowup || keys.arrowdown || keys.arrowleft || keys.arrowright;
        }

        function getPlayerFireAngle() {
            if (keys.arrowleft && !keys.arrowright) return PLAYER_FIRE_FORWARD_ANGLE - PLAYER_FIRE_SKEW_ANGLE;
            if (keys.arrowright && !keys.arrowleft) return PLAYER_FIRE_FORWARD_ANGLE + PLAYER_FIRE_SKEW_ANGLE;
            return PLAYER_FIRE_FORWARD_ANGLE;
        }

        function getFirePatternAngles(stats, baseAngle, includeRear = false) {
            const pelletCount = stats.mode === 'beam' ? Math.min(stats.pelletCount, 3) : stats.pelletCount;
            const hasRearFire = includeRear && stats.hasRearFire;
            const totalCount = hasRearFire ? pelletCount * 2 : pelletCount;
            const angles = new Array(totalCount);
            if (pelletCount === 1) {
                angles[0] = baseAngle;
            } else {
                const startAngle = baseAngle - stats.spreadAngle / 2;
                const step = stats.spreadAngle / (pelletCount - 1);
                for (let i = 0; i < pelletCount; i++) {
                    angles[i] = startAngle + step * i;
                }
            }
            if (hasRearFire) {
                for (let i = 0; i < pelletCount; i++) {
                    angles[pelletCount + i] = angles[i] + Math.PI;
                }
            }
            return angles;
        }

        const BEAM_RANGE = 500;
        const BEAM_HIT_LENGTH_MULT = 1.2;
        const BEAM_BASE_FONT_SIZE = 16;
        const BEAM_SEGMENT_STEP = 18;
        const BEAM_SWEEP_BLEND = 16;
        const BEAM_DEPLOY_TIME = 0.5;
        const BEAM_GLITCH_CHARS = ['▓', '▒', '░', '╳', '▌', '▐'];
        let cachedBeamMetricsFrame = -1;
        let cachedBeamMetricsSize = 1;
        let cachedBeamMetricsDeploy = 1;
        let cachedBeamMetrics = null;

        function beamNoise(seed) {
            const x = Math.sin(seed * 12.9898) * 43758.5453;
            return x - Math.floor(x);
        }

        function normalizeAngle(angle) {
            while (angle <= -Math.PI) angle += Math.PI * 2;
            while (angle > Math.PI) angle -= Math.PI * 2;
            return angle;
        }

        function lerpAngle(current, target, factor) {
            return current + normalizeAngle(target - current) * factor;
        }

        function getBeamDeployVisual(progress) {
            const t = Math.max(0, Math.min(1, progress));
            return 1 - Math.pow(1 - t, 2.25);
        }

        function getBeamMetrics(sizeMult = 1, deployFactor = 1) {
            if (cachedBeamMetrics && cachedBeamMetricsFrame === currentFrameNow && cachedBeamMetricsSize === sizeMult && cachedBeamMetricsDeploy === deployFactor) {
                return cachedBeamMetrics;
            }
            const beamFontSize = Math.max(8, BEAM_BASE_FONT_SIZE * sizeMult);
            cachedBeamMetricsFrame = currentFrameNow;
            cachedBeamMetricsSize = sizeMult;
            cachedBeamMetricsDeploy = deployFactor;
            cachedBeamMetrics = {
                length: BEAM_RANGE * Math.max(0, Math.min(1, deployFactor)),
                fontSize: beamFontSize,
                font: `bold ${beamFontSize}px Courier New`,
                halfWidth: Math.max(6, beamFontSize * 0.38),
                segmentSpacing: BEAM_SEGMENT_STEP
            };
            return cachedBeamMetrics;
        }

        function getBeamOrigin(ship = player) {
            return getPlayerRenderLayout(ship, getPlayerFacing(ship)).weaponOrigin;
        }

        function getBeamTargetRadius(target) {
            if (!target || !target.sprite || target.sprite.length === 0) {
                return target && target.name ? 40 : 18;
            }
            const renderScale = target.renderScale || (target.isFlyBy ? (target.flyByScale || 1.55) : 1);
            const spriteW = target.sprite[0].length * charW * renderScale;
            const spriteH = target.sprite.length * charH * renderScale;
            const spriteRadius = Math.hypot(spriteW, spriteH) * 0.16;
            return Math.max(target.name ? 30 : 14, Math.min(target.name ? 62 : 28, spriteRadius));
        }

        function updateBeamAngle(dt, rawAngle) {
            player.beamTargetAngle = rawAngle;
            if (!player.isBeaming) {
                player.beamAngle = rawAngle;
                return player.beamAngle;
            }
            if (!player.isFiring) {
                return player.beamAngle;
            }
            const blend = Math.min(1, dt * BEAM_SWEEP_BLEND);
            player.beamAngle = normalizeAngle(lerpAngle(player.beamAngle, rawAngle, blend));
            return player.beamAngle;
        }

        function updateBeamDeploy(dt) {
            const target = player.isBeaming && player.isFiring ? 1 : 0;
            const step = dt / BEAM_DEPLOY_TIME;
            if (player.beamDeploy < target) player.beamDeploy = Math.min(target, player.beamDeploy + step);
            else if (player.beamDeploy > target) player.beamDeploy = Math.max(target, player.beamDeploy - step);
            return getBeamDeployVisual(player.beamDeploy);
        }

        function drawBeamStrandLayer(angle, beamMetrics, phase, flowBias, alphaScale = 1, widthScale = 1, segmentStride = 1, haloOnly = false) {
            if (beamMetrics.length <= 6) return;
            const tick = Math.floor(phase / 36);
            const angleSeed = Math.round((angle + Math.PI) * 1000);
            const segmentCount = Math.ceil(beamMetrics.length / beamMetrics.segmentSpacing) + 2;
            const flowOffset = (phase * 0.22 + flowBias) % beamMetrics.segmentSpacing;
            for (let i = 0; i < segmentCount; i += segmentStride) {
                const distance = i * beamMetrics.segmentSpacing - flowOffset;
                if (distance < 0 || distance > beamMetrics.length) continue;
                const progress = distance / beamMetrics.length;
                const taper = 1 - progress * 0.78;
                const noise = beamNoise(angleSeed + i * 17 + tick * 29);
                const noise2 = beamNoise(angleSeed * 0.5 + i * 31 + tick * 11);
                const flameCurl = Math.sin(phase * 0.014 + i * 0.68 + angle * 1.6 + flowBias * 0.02) * beamMetrics.halfWidth * taper * widthScale;
                const lick = Math.cos(phase * 0.01 + i * 1.14 + flowBias * 0.03) * beamMetrics.halfWidth * 0.45 * taper * widthScale;
                const edgeFlicker = noise > 0.82 ? (noise - 0.82) * beamMetrics.fontSize * 1.8 * taper : 0;
                const char = haloOnly
                    ? (progress < 0.2 ? '█' : (progress < 0.76 ? '▓' : '▒'))
                    : (noise > 0.94
                        ? BEAM_GLITCH_CHARS[Math.floor(noise2 * BEAM_GLITCH_CHARS.length) % BEAM_GLITCH_CHARS.length]
                        : (progress < 0.16
                            ? (noise2 > 0.45 ? '█' : '▓')
                            : (progress < 0.72
                                ? (noise2 > 0.55 ? '▓' : '▒')
                                : (noise2 > 0.58 ? '▒' : '░'))));
                const x = flameCurl + lick + edgeFlicker;
                const y = -distance + Math.sin(phase * 0.006 + i * 0.34 + flowBias * 0.02) * 3 * (1 - progress * 0.65);
                const alphaPulse = haloOnly
                    ? 1
                    : (0.8 + Math.sin(phase * 0.018 + i * 0.55 + flowBias * 0.01) * 0.2);
                ctx.globalAlpha = haloOnly
                    ? Math.max(0.04, Math.min(0.28, (1 - progress * 0.52) * alphaScale))
                    : Math.max(0.14, Math.min(1, (1 - progress * 0.4) * alphaPulse * alphaScale));
                ctx.fillText(char, x, y);
                if (!haloOnly && (progress < 0.25 || noise > 0.86)) {
                    ctx.globalAlpha *= 0.42;
                    ctx.fillText(char, x - beamMetrics.halfWidth * 0.45 * widthScale, y + beamMetrics.fontSize * 0.32);
                }
            }
            const flareCount = haloOnly ? 2 : 3;
            for (let i = 0; i < flareCount; i++) {
                const flareY = -8 - i * beamMetrics.fontSize * 0.55;
                const flareChar = i === 0 ? '█' : '▓';
                ctx.globalAlpha = (haloOnly ? 0.12 : (0.22 - i * 0.04)) * alphaScale;
                ctx.fillText(flareChar, Math.sin(phase * 0.02 + i + flowBias * 0.01) * beamMetrics.halfWidth * 0.35 * widthScale, flareY);
            }
            if (!haloOnly) {
                const tipY = -beamMetrics.length;
                for (let i = 0; i < 2; i++) {
                    ctx.globalAlpha = (0.22 - i * 0.06) * alphaScale;
                    ctx.fillText(i === 0 ? '█' : '▓', Math.sin(phase * 0.018 + flowBias * 0.02 + i) * beamMetrics.halfWidth * 0.2, tipY - i * beamMetrics.fontSize * 0.28);
                }
            }
            ctx.globalAlpha = 1;
        }

        function drawBeamStrand(originX, originY, angle, sizeMult, phase, deployFactor = 1, beamMetrics = null) {
            beamMetrics = beamMetrics || getBeamMetrics(sizeMult, deployFactor);
            if (beamMetrics.length <= 6) return;
            const previousFillStyle = ctx.fillStyle;
            ctx.save();
            ctx.translate(originX, originY);
            ctx.rotate(angle + Math.PI / 2);
            ctx.font = beamMetrics.font;
            ctx.fillStyle = '#ffd866';
            drawBeamStrandLayer(angle, beamMetrics, phase - 14, -8, 0.22, 1.95, 2, true);
            ctx.fillStyle = '#fff2aa';
            drawBeamStrandLayer(angle, beamMetrics, phase + 7, 6, 0.14, 1.48, 2, true);
            ctx.fillStyle = previousFillStyle;
            drawBeamStrandLayer(angle, beamMetrics, phase, 0, 0.44, 1.18);
            drawBeamStrandLayer(angle, beamMetrics, phase + 18, 11, 0.74, 0.92);
            drawBeamStrandLayer(angle, beamMetrics, phase + 37, 24, 1, 0.68);
            ctx.restore();
            ctx.fillStyle = previousFillStyle;
        }

        function getPlayerRenderLayout(ship = player, facing = getPlayerFacing(ship)) {
            const cache = ship._renderLayoutCache;
            if (cache && cache.facing === facing && cache.x === ship.x && cache.y === ship.y) {
                return cache.layout;
            }
            const model = PLAYER_SHIP_MODELS[facing] || PLAYER_SHIP_MODELS.center;
            const thrusters = new Array(model.thrusters.length);
            const thrusterAnchors = new Array(model.thrusters.length);
            for (let i = 0; i < model.thrusters.length; i++) {
                const thruster = model.thrusters[i];
                const tx = ship.x + thruster.x;
                const ty = ship.y + thruster.y;
                thrusters[i] = {
                    char: PLAYER_THRUSTER_CHAR,
                    fontSize: PLAYER_THRUSTER_FONT_SIZE,
                    x: tx,
                    y: ty,
                    rotation: thruster.rotation
                };
                thrusterAnchors[i] = {
                    x: tx,
                    y: ty + 10
                };
            }
            const layout = {
                facing,
                body: {
                    char: PLAYER_BODY_CHAR,
                    fontSize: PLAYER_BODY_FONT_SIZE,
                    x: ship.x + model.body.x,
                    y: ship.y + model.body.y,
                    rotation: model.body.rotation
                },
                thrusters,
                thrusterAnchors,
                weaponOrigin: {
                    x: ship.x + model.weaponOrigin.x,
                    y: ship.y + model.weaponOrigin.y
                },
                rearOrigin: {
                    x: ship.x + model.rearOrigin.x,
                    y: ship.y + model.rearOrigin.y
                }
            };
            ship._renderLayoutCache = { facing, x: ship.x, y: ship.y, layout };
            return layout;
        }

        function drawPlayerPart(part) {
            ctx.save();
            ctx.translate(snapSpriteCoord(part.x), snapSpriteCoord(part.y));
            if (part.rotation) ctx.rotate(part.rotation);
            ctx.font = `bold ${part.fontSize}px Courier New`;
            ctx.fillText(part.char, 0, 0);
            ctx.restore();
        }

        function forEachPlayerDebrisPiece(layout, callback) {
            const pieces = PLAYER_DEBRIS_LAYOUTS[layout.facing] || PLAYER_DEBRIS_LAYOUTS.center;
            for (let i = 0; i < pieces.length; i++) {
                const piece = pieces[i];
                callback({
                    char: PLAYER_BODY_CHAR,
                    x: layout.body.x + piece.x,
                    y: layout.body.y + piece.y,
                    fontSize: piece.size
                });
            }
            for (let i = 0; i < layout.thrusters.length; i++) {
                const thruster = layout.thrusters[i];
                callback({
                    char: PLAYER_THRUSTER_CHAR,
                    x: thruster.x,
                    y: thruster.y,
                    fontSize: PLAYER_THRUSTER_FONT_SIZE
                });
            }
        }

        function getPlayerThrusterAnchors(layout) {
            return layout.thrusterAnchors;
        }

        function getPlayerWeaponOrigin(layout, isRear = false) {
            return isRear ? layout.rearOrigin : layout.weaponOrigin;
        }

        function drawPlayerShip(ship = player, facing = getPlayerFacing(ship)) {
            const layout = getPlayerRenderLayout(ship, facing);
            for (let i = 0; i < layout.thrusters.length; i++) {
                drawPlayerPart(layout.thrusters[i]);
            }
            drawPlayerPart(layout.body);
            return layout;
        }

        let cachedPlayerPulseNow = -1;
        let cachedPlayerPulseVisuals = { color: 'rgb(232, 232, 232)', glow: 12 };
        function getPlayerPulseVisuals(now = currentFrameNow) {
            if (cachedPlayerPulseNow === now) {
                return cachedPlayerPulseVisuals;
            }
            const pulse = (Math.sin(now * 0.002) + 1) * 0.5;
            const tone = Math.round(232 + pulse * 23);
            cachedPlayerPulseNow = now;
            cachedPlayerPulseVisuals = {
                color: `rgb(${tone}, ${tone}, ${tone})`,
                glow: 12 + pulse * 16
            };
            return cachedPlayerPulseVisuals;
        }

        function findNearestActiveTarget(x, y) {
            let nearest = null;
            let minDistSq = Infinity;
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const dx = e.x - x;
                const dy = e.y - y;
                const dSq = dx * dx + dy * dy;
                if (dSq < minDistSq) {
                    minDistSq = dSq;
                    nearest = e;
                }
            }
            if (boss && boss.phase === 'ACTIVE') {
                const dx = boss.x - x;
                const dy = boss.y - y;
                const dSq = dx * dx + dy * dy;
                if (dSq < minDistSq) {
                    minDistSq = dSq;
                    nearest = boss;
                }
            }
            return { target: nearest, distSq: minDistSq };
        }

        // Hades-Style Powerup Pool
        const POWERUP_POOL = [
            { id: 'afterburner', name: 'AFTERBURNER', cat: 'Utility', desc: 'Increases movement speed', baseVal: 0.05, type: 'additive' },
            { id: 'hull', name: 'HULL PLATING', cat: 'Defense', desc: 'Increases max health and heals', baseVal: 0.1, type: 'additive' },
            { id: 'target', name: 'TARGETING COMP', cat: 'Offense', desc: 'Increases weapon damage', baseVal: 2.5, type: 'additive' },
            { id: 'evasion', name: 'EVASION PROTOCOL', cat: 'Utility', desc: 'Reduces ship hitbox size', baseVal: 0.95, type: 'multiplicative' },
            { id: 'overdrive', name: 'OVERDRIVE CELL', cat: 'Offense', desc: 'Increases weapon fire rate', baseVal: 0.075, type: 'additive' },
            { id: 'repair', name: 'REPAIR DRONES', cat: 'Defense', desc: 'Grants passive health regen', baseVal: 0.5, type: 'additive' },
            { id: 'shield', name: 'SHIELD MATRIX', cat: 'Defense', desc: 'Extends invincibility after hit', baseVal: 0.1, type: 'additive' },
            { id: 'adrenaline', name: 'ADRENALINE', cat: 'Risk', desc: 'Increases damage when below 50% HP', baseVal: 0.1, type: 'additive' },
            { id: 'scrap', name: 'SCRAP COLLECTOR', cat: 'Utility', desc: 'Increases XP orb magnet range', baseVal: 0.125, type: 'additive' },
            { id: 'coolant', name: 'COOLANT FLUSH', cat: 'Offense', desc: 'Reduces bomb ability cooldown', baseVal: 0.925, type: 'multiplicative' }
        ];

        // Stacking Boss Weapon Pool
        const WEAPON_POOL = [
            { name: "Lightning Ball", cat: "hybrid", glyph: "※", color: "#aa00ff", desc: "Pierces 2, small shock splash", mults: { damage: 0.8, fireRate: 0.7, pierceCount: 2, splashRadius: 1.0, splashPercent: 0.5 } },
            { name: "Laser Cannon", cat: "offense", glyph: "▣", color: "#ff0000", desc: "Huge, heavy damage shots", mults: { damage: 3.5, fireRate: 0.3, size: 3.0 } },
            { name: "Ray Beam", cat: "mode", glyph: "║", color: "#ffff00", desc: "Continuous raycast beam", mults: { mode: "beam" } },
            { name: "Scatter Burst", cat: "hybrid", glyph: "⁂", color: "#aa00ff", desc: "Fires 5 shots in a cone", mults: { damage: 0.35, fireRate: 0.8, pellets: 5, spread: Math.PI/6 } },
            { name: "Mortar Shells", cat: "mode", glyph: "◓", color: "#ffff00", desc: "Slow, huge explosive splash", mults: { damage: 4.0, fireRate: 0.25, speed: 0.5, splashRadius: 3.0, splashPercent: 0.75, path: "parabolic" } },
            { name: "Piercing Lance", cat: "offense", glyph: "⇡", color: "#ff0000", desc: "Infinite pierce, large size", mults: { damage: 2.0, fireRate: 0.5, pierceCount: 999, size: 1.5 } },
            { name: "Rear Turret", cat: "hybrid", glyph: "⇕", color: "#aa00ff", desc: "Fires backward as well", mults: { rearFire: true } },
            { name: "Wave Cannon", cat: "control", glyph: "∿", color: "#00ffff", desc: "Sine-wave path projectiles", mults: { path: "sine" } },
            { name: "Chain Lightning", cat: "control", glyph: "⚡", color: "#00ffff", desc: "Chains to nearby enemies", mults: { damage: 0.8, chainCount: 3 } },
            { name: "Orbital Drones", cat: "hybrid", glyph: "⟳", color: "#aa00ff", desc: "Two auto-firing drones", mults: { drones: true } },
            { name: "Homing Swarm", cat: "control", glyph: "⌖", color: "#00ffff", desc: "Projectiles track targets", mults: { damage: 1.2, fireRate: 0.6, speed: 0.7, homing: true } },
            { name: "Gatling Array", cat: "offense", glyph: "▒", color: "#ff0000", desc: "Extremely fast, weak shots", mults: { damage: 0.25, fireRate: 4.0, inaccuracy: 0.087 } }
        ];

        let weaponWeights = {};
        WEAPON_POOL.forEach(w => weaponWeights[w.name] = 1.0);

        function applyWeapon(w) {
            let s = player.weaponStats;
            let m = w.mults;
            if(m.damage) s.damageMult *= m.damage;
            if(m.fireRate) s.fireRateMult *= m.fireRate;
            if(m.speed) s.speedMult *= m.speed;
            if(m.size) s.sizeMult *= m.size;
            if(m.pierceCount) s.pierceCount += m.pierceCount;
            if(m.splashRadius) s.splashRadius = Math.max(s.splashRadius, m.splashRadius);
            if(m.splashPercent) s.splashDamagePercent = Math.max(s.splashDamagePercent, m.splashPercent);
            if(m.homing) s.homing = true;
            if(m.chainCount) s.chainCount += m.chainCount;
            if(m.path) s.pathFunction = m.path;
            if(m.mode) s.mode = m.mode;
            if(m.rearFire) s.hasRearFire = true;
            if(m.drones) s.hasOrbitalDrones = true;
            if(m.pellets) {
                if(s.pelletCount === 1) s.pelletCount = m.pellets;
                else s.pelletCount += (m.pellets - 1);
            }
            if(m.spread) s.spreadAngle = Math.max(s.spreadAngle, m.spread);
            if(m.inaccuracy) s.inaccuracy = Math.max(s.inaccuracy, m.inaccuracy);
        }

        function drawWeapons() {
            let pool = [...WEAPON_POOL];
            let drawn = [];
            for(let i=0; i<3; i++) {
                let totalWeight = pool.reduce((sum, w) => sum + weaponWeights[w.name], 0);
                if (totalWeight <= 0) break;
                let r = Math.random() * totalWeight;
                for(let j=0; j<pool.length; j++) {
                    r -= weaponWeights[pool[j].name];
                    if(r <= 0) {
                        drawn.push(pool[j]);
                        pool.splice(j, 1);
                        break;
                    }
                }
            }
            return drawn;
        }

        let offeredOptions = [];
        let levelUpState = 'INTRO'; // 'INTRO', 'OFFERING', or 'ANIMATING'
        let levelUpTimer = 0;
        let selectedOptionIndex = 0;
        const LEVELUP_INTRO_DURATION = 0.8;
        const LEVELUP_ANIMATION_DURATION = 0.7;

        function drawOptions(pool, count, level) {
            let weights = { common: 100, rare: 0, epic: 0 };
            if (level >= 16) weights = { common: 50, rare: 35, epic: 15 };
            else if (level >= 8) weights = { common: 70, rare: 30, epic: 0 };
            
            let shuffled = pool.slice().sort(() => Math.random() - 0.5);
            let selected = []; let usedCats = new Set();
            for (let item of shuffled) {
                if (!usedCats.has(item.cat)) { 
                    selected.push(item); 
                    usedCats.add(item.cat); 
                    if (selected.length === count) break; 
                }
            }
            // Fill remainder if needed
            for (let item of shuffled) { 
                if (selected.length === count) break; 
                if (!selected.includes(item)) selected.push(item); 
            }
            
            return selected.map(item => {
                let r = Math.random() * 100; let rarity = 'Common';
                if (r < weights.epic) rarity = 'Epic'; 
                else if (r < weights.epic + weights.rare) rarity = 'Rare';
                
                let mult = rarity === 'Epic' ? 1.5 : (rarity === 'Rare' ? 1.25 : 1.0);
                let val = item.type === 'multiplicative' ? 1 - (1 - item.baseVal) * mult : item.baseVal * mult;
                
                let color = rarity === 'Epic' ? '#ff8800' : (rarity === 'Rare' ? '#aa00ff' : '#aaaaaa');
                let displayName = rarity === 'Common' ? item.name : `${rarity.toUpperCase()} ${item.name}`;
                
                return { ...item, rarity, value: val, color, displayName };
            });
        }

        function applyPowerup(opt) {
            if (opt.id === 'afterburner') player.modifiers.moveSpeed += opt.value;
            else if (opt.id === 'hull') { 
                let oldMax = player.maxHp; 
                player.modifiers.maxHp += opt.value; 
                player.maxHp = Math.floor(100 * (1 + player.modifiers.maxHp)); 
                player.hp += (player.maxHp - oldMax); 
            }
            else if (opt.id === 'target') player.modifiers.laserDamage += opt.value;
            else if (opt.id === 'evasion') player.modifiers.hitbox *= opt.value;
            else if (opt.id === 'overdrive') player.modifiers.fireRate += opt.value;
            else if (opt.id === 'repair') player.modifiers.hpRegen += opt.value;
            else if (opt.id === 'shield') player.modifiers.invincibility += opt.value;
            else if (opt.id === 'adrenaline') player.modifiers.adrenaline += opt.value;
            else if (opt.id === 'scrap') player.modifiers.magnet += opt.value;
            else if (opt.id === 'coolant') player.modifiers.bombCooldown *= opt.value;
        }

        function pushConsoleHistory(text) {
            if (!text) return;
            consoleHistory.push(text);
            if (consoleHistory.length > CONSOLE_HISTORY_LIMIT) {
                consoleHistory.splice(0, consoleHistory.length - CONSOLE_HISTORY_LIMIT);
            }
        }

        function pushConsoleNotification(text, kind = 'info') {
            if (!text) return;
            consoleNotifications.push({ text, kind });
            if (consoleNotifications.length > CONSOLE_NOTIFICATION_LIMIT) {
                consoleNotifications.splice(0, consoleNotifications.length - CONSOLE_NOTIFICATION_LIMIT);
            }
        }

        function setConsoleReference(lines) {
            consoleReferenceLines = (lines || []).slice(0, 14);
        }

        function clearConsoleReference() {
            consoleReferenceLines = [];
        }

        function buildConsoleWeaponHelpLines() {
            const lines = [
                'wep <number|weapon name> : apply a weapon instantly',
                'Examples: wep 3 | wep ray beam'
            ];
            for (let i = 0; i < WEAPON_POOL.length; i += 2) {
                const left = `${i + 1}. ${WEAPON_POOL[i].name}`;
                const right = i + 1 < WEAPON_POOL.length ? `${i + 2}. ${WEAPON_POOL[i + 1].name}` : '';
                lines.push(right ? `${left}  |  ${right}` : left);
            }
            return lines;
        }

        function buildConsoleWaveHelpLines() {
            const bossWaves = [];
            for (let i = 0; i < WaveManager.waves.length; i++) {
                if (WaveManager.waves[i].isBoss) bossWaves.push(String(i + 1));
            }
            return [
                `wave <n> : jump to any wave from 1-${WaveManager.waves.length}`,
                `Boss waves: ${bossWaves.join(', ')}`,
                'Example: wave 15'
            ];
        }

        function buildConsoleLevelHelpLines() {
            return [
                'lvl : advance exactly one level',
                'lvl <n> : queue level-ups until target level',
                'Only upward jumps are supported',
                'Examples: lvl | lvl 8'
            ];
        }

        function buildConsoleGeneralHelpLines() {
            return [
                'Commands:',
                'help [wave|lvl|wep]',
                'wave <n>',
                'lvl [n]',
                'wep <n|weapon name>',
                'Try: help wep'
            ];
        }

        function getXpNeededForLevel(level) {
            const n = Math.max(0, level - 1);
            return Math.max(10, Math.round(10 + n * 9 + n * n * 5));
        }

        function beginLevelUpOffer() {
            clearPauseVolumePreview();
            gameState = 'LEVELUP';
            applyCurrentVolume(LEVELUP_VOLUME_SCALE);
            levelUpState = 'INTRO';
            levelUpTimer = 0;
            selectedOptionIndex = 0;
            keys[' '] = false;
            offeredOptions = drawOptions(POWERUP_POOL, 3, player.level);
        }

        function queueConsoleLevelUps(levelCount) {
            const safeCount = Math.max(0, Math.floor(levelCount));
            if (safeCount <= 0) return false;
            queuedConsoleLevels = safeCount - 1;
            player.xp = 0;
            player.level += 1;
            player.xpNeeded = getXpNeededForLevel(player.level);
            beginLevelUpOffer();
            return true;
        }

        function executeConsoleCommand(rawInput) {
            const commandLine = rawInput.trim();
            if (!commandLine) return false;

            pushConsoleHistory(commandLine);

            const firstSpace = commandLine.indexOf(' ');
            const command = (firstSpace === -1 ? commandLine : commandLine.slice(0, firstSpace)).toLowerCase();
            const argString = firstSpace === -1 ? '' : commandLine.slice(firstSpace + 1).trim();

            if (command !== 'help') clearConsoleReference();

            if (command === 'wave') {
                const targetWave = parseInt(argString, 10);
                if (isNaN(targetWave) || targetWave < 1 || targetWave > WaveManager.waves.length) {
                    pushConsoleNotification(`Usage: wave 1-${WaveManager.waves.length}`, 'error');
                    return false;
                }

                const targetWaveDef = WaveManager.waves[targetWave - 1];
                teardownBossCinematic();
                queuedConsoleLevels = 0;
                stopMusic();
                WaveManager.currentWave = targetWave - 1;
                WaveManager.waveDelay = 0;
                WaveManager.pendingFormationUnits = 0;
                enemies = [];
                boss = null;
                enemyBullets = [];
                comboProjectiles = [];
                bombProjectiles = [];
                bombBlastRings = [];
                drops = [];
                xpOrbs = [];
                clearPauseVolumePreview();
                gameState = 'PLAYING';
                applyCurrentVolume();
                if (!targetWaveDef.isBoss) {
                    startMusic();
                }
                pushConsoleNotification(`Jumped to wave ${targetWave}.`, 'success');
                return true;
            }

            if (command === 'wep') {
                if (!argString) {
                    setConsoleReference(buildConsoleWeaponHelpLines());
                    pushConsoleNotification('Showing weapon reference.', 'info');
                    return false;
                }

                const wepArg = argString.toLowerCase();
                let foundWep = null;
                const wepNum = parseInt(wepArg, 10);
                if (!isNaN(wepNum) && wepNum > 0 && wepNum <= WEAPON_POOL.length) {
                    foundWep = WEAPON_POOL[wepNum - 1];
                } else {
                    foundWep = WEAPON_POOL.find(w => w.name.toLowerCase() === wepArg);
                }

                if (!foundWep) {
                    pushConsoleNotification(`Weapon not found: ${argString}`, 'error');
                    return false;
                }

                applyWeapon(foundWep);
                if (player.weapons.length < 10) player.weapons.push(foundWep);
                pushConsoleNotification(`Applied weapon: ${foundWep.name}`, 'success');
                return false;
            }

            if (command === 'lvl') {
                if (gameState === 'LEVELUP') {
                    pushConsoleNotification('Finish the current level-up first.', 'warn');
                    return false;
                }

                const currentLevel = player.level;
                const targetLevel = argString ? parseInt(argString, 10) : currentLevel + 1;
                if (isNaN(targetLevel) || targetLevel < 1) {
                    pushConsoleNotification('Usage: lvl [target level]', 'error');
                    return false;
                }
                if (targetLevel <= currentLevel) {
                    pushConsoleNotification(`LVL ${targetLevel} is not above current LVL ${currentLevel}.`, 'warn');
                    return false;
                }

                const levelsToGrant = targetLevel - currentLevel;
                if (queueConsoleLevelUps(levelsToGrant)) {
                    if (levelsToGrant === 1) {
                        pushConsoleNotification(`Advanced to LVL ${targetLevel}. Choose a power-up.`, 'success');
                    } else {
                        pushConsoleNotification(`Queued ${levelsToGrant} level-ups to reach LVL ${targetLevel}.`, 'success');
                    }
                }
                return true;
            }

            if (command === 'help') {
                const topic = argString.toLowerCase();
                if (!topic) {
                    setConsoleReference(buildConsoleGeneralHelpLines());
                    pushConsoleNotification('Showing command reference.', 'info');
                    return false;
                }
                if (topic === 'wep' || topic === 'weapon' || topic === 'weapons') {
                    setConsoleReference(buildConsoleWeaponHelpLines());
                    pushConsoleNotification('Showing weapon reference.', 'info');
                    return false;
                }
                if (topic === 'wave' || topic === 'waves') {
                    setConsoleReference(buildConsoleWaveHelpLines());
                    pushConsoleNotification('Showing wave command help.', 'info');
                    return false;
                }
                if (topic === 'lvl' || topic === 'level' || topic === 'levels') {
                    setConsoleReference(buildConsoleLevelHelpLines());
                    pushConsoleNotification('Showing level command help.', 'info');
                    return false;
                }
                pushConsoleNotification(`Unknown help topic: ${argString}`, 'error');
                pushConsoleNotification('Try: help, help wep, help wave, help lvl', 'info');
                return false;
            }

            pushConsoleNotification(`Unknown command: ${command}`, 'error');
            pushConsoleNotification('Try: help', 'info');
            return false;
        }
