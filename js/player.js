        // Player model, weapons, upgrades, beams, and console commands.
        // Player Entity & Stats
        const PLAYER_BODY_CHAR = '▲';
        const PLAYER_THRUSTER_CHAR = '▲';
        const PLAYER_BODY_FONT_SIZE = 132;
        const PLAYER_THRUSTER_FONT_SIZE = 42;
        const BOMB_BASE_COOLDOWN = 12;
        const BOMB_GRENADE_SPEED = 784;
        const BOMB_GRENADE_RANGE = 550;
        const BOMB_EXPLOSION_RADIUS = 164.5;
        const BOMB_EXPLOSION_DAMAGE = 62.5;
        const BOMB_SHRAPNEL_COUNT = 14;
        const BOMB_SHRAPNEL_DAMAGE = 9;
        const BOMB_SHRAPNEL_SPEED_MIN = 520;
        const BOMB_SHRAPNEL_SPEED_MAX = 840;
        const BOMB_SHRAPNEL_LIFE = 0.5;
        const GOD_MODE_DAMAGE_MULT = 10;
        const GOD_MODE_BOMB_COOLDOWN = 0.1;
        const WEAPON_STAT_GUARDRAILS = {
            minFireRateMult: 0.18,
            maxFireRateMult: 4.2,
            minSpeedMult: 0.22,
            maxSpeedMult: 2.4,
            minSizeMult: 0.55,
            maxSizeMult: 4.75,
            minHitboxMult: 0.55,
            maxHitboxMult: 1.25,
            maxSplashRadius: 4.0,
            maxTorpedoExplosionRadius: 112,
            maxPelletCount: 5,
            maxBurstCount: 5,
            maxRearFireFan: 5,
            maxChainCount: 6,
            maxCloudDotMult: 8,
            maxRicochetCount: 4,
            maxCritChance: 0.85,
            maxCritDamageMult: 6.0,
            maxPhaseStacks: 4
        };
        const DUPLICATE_WEAPON_VALUE_SCALES = [1, 0.6, 0.35];
        const DUPLICATE_WEAPON_VALUE_FLOOR = 0.2;
        const PLAYER_MODIFIER_GUARDRAILS = {
            minMoveSpeedScale: 0.55,
            maxMoveSpeedScale: 1.85,
            minHitbox: 0.55,
            maxHitbox: 1.25,
            maxFireRateBonus: 1.4,
            maxMomentumFireRateBonus: 0.75,
            minBombCooldownMult: 0.45,
            maxBombDamageBonus: 2.5,
            maxBombRadiusBonus: 1.2,
            minMaxHpBonus: -0.55,
            maxMaxHpBonus: 2.5,
            maxHpRegen: 8,
            maxInvincibilityBonus: 1.5,
            maxAdrenalineBonus: 1.25,
            maxMagnetBonus: 2.5,
            maxXpHeal: 0.03,
            maxDamageMultBonus: 2.0,
            maxKillHeal: 0.10,
            maxXpGain: 2.5,
            maxFocusMaxBonus: 1.5,
            maxFocusRegenBonus: 2.25,
            minFocusRegenDelayMult: 0.35,
            minFocusLockoutMult: 0.35,
            maxFocusDropBonus: 1.25,
            minFocusDriveDrainMult: 0.45,
            maxFocusDriveSlowBonus: 0.12,
            maxFocusDriveTransitionBonus: 1.5,
            minFocusSpecterDrainMult: 0.45,
            maxFocusSpecterShrinkBonus: 0.16,
            maxFocusSpecterTransitionBonus: 1.5
        };
        const PLAYER_FIRE_INTERVAL_MIN_MS = 52;
        const PLAYER_FIRE_INTERVAL_MAX_MS = 1700;

        function clampValue(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function getClampedPlayerFireInterval(intervalMs) {
            return clampValue(intervalMs, PLAYER_FIRE_INTERVAL_MIN_MS, PLAYER_FIRE_INTERVAL_MAX_MS);
        }

        function getPlayerMoveSpeedScale() {
            const shipMoveSpeed = getPlayerShipConfigById(player.shipId).moveSpeedMult || 1;
            return clampValue(
                shipMoveSpeed * (1 + (player.modifiers.moveSpeed || 0)),
                PLAYER_MODIFIER_GUARDRAILS.minMoveSpeedScale,
                PLAYER_MODIFIER_GUARDRAILS.maxMoveSpeedScale
            );
        }

        function getPlayerBaseMaxHp() {
            return getPlayerShipConfigById(player.shipId).maxHp || 100;
        }

        function getPlayerHitboxScale() {
            const shipHitbox = getPlayerShipConfigById(player.shipId).hitboxMult || 1;
            const baseScale = clampValue(
                shipHitbox * (player.modifiers.hitbox || 1),
                PLAYER_MODIFIER_GUARDRAILS.minHitbox,
                PLAYER_MODIFIER_GUARDRAILS.maxHitbox
            );
            const specterScale = typeof getPlayerSpecterHitboxScale === 'function' ? getPlayerSpecterHitboxScale() : 1;
            return baseScale * specterScale;
        }
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

        const PLAYER_SHIP_VARIANT_MODELS = {
            glasswing: {
                center: {
                    body: { char: '▲', fontSize: 118, x: 0, y: -14, rotation: 0 },
                    accents: [
                        { char: '◢', fontSize: 36, x: -33, y: 4, rotation: -0.03 },
                        { char: '◣', fontSize: 36, x: 33, y: 4, rotation: 0.03 },
                        { char: '◆', fontSize: 18, x: 0, y: 9, rotation: 0 }
                    ],
                    thrusters: [
                        { char: '▲', fontSize: 36, x: -15, y: 26, rotation: -0.04 },
                        { char: '▲', fontSize: 36, x: 15, y: 26, rotation: 0.04 }
                    ],
                    weaponOrigin: { x: 0, y: -70 },
                    rearOrigin: { x: 0, y: 47 }
                },
                left: {
                    body: { char: '▲', fontSize: 118, x: -9, y: -14, rotation: -0.09 },
                    accents: [
                        { char: '◢', fontSize: 36, x: -40, y: 5, rotation: -0.11 },
                        { char: '◣', fontSize: 34, x: 22, y: 2, rotation: -0.02 },
                        { char: '◆', fontSize: 18, x: -8, y: 9, rotation: -0.08 }
                    ],
                    thrusters: [
                        { char: '▲', fontSize: 36, x: -23, y: 29, rotation: -0.09 },
                        { char: '▲', fontSize: 34, x: 7, y: 23, rotation: -0.04 }
                    ],
                    weaponOrigin: { x: -9, y: -70 },
                    rearOrigin: { x: -5, y: 47 }
                },
                right: {
                    body: { char: '▲', fontSize: 118, x: 9, y: -14, rotation: 0.09 },
                    accents: [
                        { char: '◢', fontSize: 34, x: -22, y: 2, rotation: 0.02 },
                        { char: '◣', fontSize: 36, x: 40, y: 5, rotation: 0.11 },
                        { char: '◆', fontSize: 18, x: 8, y: 9, rotation: 0.08 }
                    ],
                    thrusters: [
                        { char: '▲', fontSize: 34, x: -7, y: 23, rotation: 0.04 },
                        { char: '▲', fontSize: 36, x: 23, y: 29, rotation: 0.09 }
                    ],
                    weaponOrigin: { x: 9, y: -70 },
                    rearOrigin: { x: 5, y: 47 }
                }
            },
            ionManta: {
                center: {
                    body: { char: '◆', fontSize: 116, x: 0, y: -5, rotation: 0 },
                    accents: [
                        { char: '◢', fontSize: 40, x: -40, y: -6, rotation: -0.1 },
                        { char: '◣', fontSize: 40, x: 40, y: -6, rotation: 0.1 },
                        { char: '▲', fontSize: 28, x: 0, y: -52, rotation: 0 }
                    ],
                    thrusters: [
                        { char: '▲', fontSize: 38, x: -16, y: 31, rotation: -0.03 },
                        { char: '▲', fontSize: 38, x: 16, y: 31, rotation: 0.03 },
                        { char: '▲', fontSize: 30, x: 0, y: 38, rotation: 0 }
                    ],
                    weaponOrigin: { x: 0, y: -68 },
                    rearOrigin: { x: 0, y: 54 }
                },
                left: {
                    body: { char: '◆', fontSize: 116, x: -9, y: -5, rotation: -0.08 },
                    accents: [
                        { char: '◢', fontSize: 40, x: -48, y: -5, rotation: -0.16 },
                        { char: '◣', fontSize: 38, x: 29, y: -9, rotation: -0.02 },
                        { char: '▲', fontSize: 28, x: -10, y: -52, rotation: -0.06 }
                    ],
                    thrusters: [
                        { char: '▲', fontSize: 38, x: -24, y: 34, rotation: -0.08 },
                        { char: '▲', fontSize: 36, x: 8, y: 28, rotation: -0.02 },
                        { char: '▲', fontSize: 30, x: -8, y: 39, rotation: -0.04 }
                    ],
                    weaponOrigin: { x: -9, y: -68 },
                    rearOrigin: { x: -5, y: 54 }
                },
                right: {
                    body: { char: '◆', fontSize: 116, x: 9, y: -5, rotation: 0.08 },
                    accents: [
                        { char: '◢', fontSize: 38, x: -29, y: -9, rotation: 0.02 },
                        { char: '◣', fontSize: 40, x: 48, y: -5, rotation: 0.16 },
                        { char: '▲', fontSize: 28, x: 10, y: -52, rotation: 0.06 }
                    ],
                    thrusters: [
                        { char: '▲', fontSize: 36, x: -8, y: 28, rotation: 0.02 },
                        { char: '▲', fontSize: 38, x: 24, y: 34, rotation: 0.08 },
                        { char: '▲', fontSize: 30, x: 8, y: 39, rotation: 0.04 }
                    ],
                    weaponOrigin: { x: 9, y: -68 },
                    rearOrigin: { x: 5, y: 54 }
                }
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

        const PLAYER_SHIP_TYPES = [
            {
                id: 'glasswing',
                name: 'GLASSWING',
                subtitle: 'glass cannon interceptor',
                maxHp: 80,
                damageMult: 1.18,
                fireRate: 292,
                moveSpeedMult: 1.07,
                hitboxMult: 0.93,
                bombCooldownMult: 1.08,
                previewColor: '#a8fbff',
                trait: '+18% damage, -20 HP',
                models: PLAYER_SHIP_VARIANT_MODELS.glasswing
            },
            {
                id: 'arrowhead',
                name: 'ARROWHEAD',
                subtitle: 'standard balanced fighter',
                maxHp: 100,
                damageMult: 1,
                fireRate: 306,
                moveSpeedMult: 1,
                hitboxMult: 1,
                bombCooldownMult: 1,
                previewColor: '#ffffff',
                trait: 'baseline systems',
                models: PLAYER_SHIP_MODELS
            },
            {
                id: 'ionManta',
                name: 'ION MANTA',
                subtitle: 'evasive bomb skimmer',
                maxHp: 110,
                damageMult: 0.92,
                fireRate: 326,
                moveSpeedMult: 1.14,
                hitboxMult: 1.06,
                bombCooldownMult: 0.82,
                previewColor: '#d9f2ff',
                trait: 'fast engines, faster bombs',
                models: PLAYER_SHIP_VARIANT_MODELS.ionManta
            }
        ];
        const DEFAULT_PLAYER_SHIP_INDEX = 1;
        let selectedShipIndex = DEFAULT_PLAYER_SHIP_INDEX;
        let shipSelectIndex = selectedShipIndex;

        function wrapShipIndex(index) {
            return (index + PLAYER_SHIP_TYPES.length) % PLAYER_SHIP_TYPES.length;
        }

        function getPlayerShipConfigById(id) {
            return PLAYER_SHIP_TYPES.find(ship => ship.id === id) || PLAYER_SHIP_TYPES[DEFAULT_PLAYER_SHIP_INDEX];
        }

        function getSelectedShipConfig() {
            return PLAYER_SHIP_TYPES[selectedShipIndex] || PLAYER_SHIP_TYPES[DEFAULT_PLAYER_SHIP_INDEX];
        }

        function getShipSelectConfig() {
            return PLAYER_SHIP_TYPES[shipSelectIndex] || getSelectedShipConfig();
        }

        function createBaseWeaponStats() {
            return {
                damageMult: 1, fireRateMult: 1, speedMult: 1, sizeMult: 1,
                pierceCount: 0, splashRadius: 0, splashDamagePercent: 0, homing: false, homingStrength: 1,
                chainCount: 0, chainChance: 1, pathFunction: 'straight', mode: 'projectile',
                hasRearFire: false, rearFireEvery: 2, rearFireFan: 1, rearFireSpread: 0.22,
                burstFire: false, burstCount: 1, burstSpacing: 0.045, burstAngleMin: 0.017, burstAngleMax: 0.052,
                hasOrbitalDrones: false, pelletCount: 1, spreadAngle: 0, inaccuracy: 0,
                returning: false, returnAfter: 0.5, orbitDelay: 0, orbitRadiusMult: 1,
                sineAmplitudeMult: 1,
                orbitReleaseCenter: false, lightningBall: false, splashVisualDebris: 20,
                hitboxMult: 1, plasmaCloud: false, cloudDotMult: 0,
                cloudStartScale: 1, cloudEndScale: 1, cloudGrowthDistance: 1,
                cloudSpeedStartScale: 1, cloudSpeedEndScale: 1, cloudAccelTime: 1,
                cloudCurveStrength: 0, cloudFadeTime: 0.45,
                miniTorpedo: false, torpedoExplosionRadius: 0,
                torpedoExplosionDamageMult: 0, torpedoRange: 0,
                ricochetCount: 0, ricochetDamageMult: 1,
                critChance: 0, critDamageMult: 1,
                prismSplit: false, prismSplitDelay: 0.28, prismSplitAngle: 0.34,
                prismSplitDamageMult: 0.42, prismSplitSizeMult: 0.72, prismSplitSpeedMult: 0.92,
                phaseNeedle: false, phaseDamageRamp: 1.16, phaseSpeedRamp: 1.04, phaseMaxStacks: 3
            };
        }

        function getPlasmaCloudGrowthFactor(projectile) {
            const stats = projectile && projectile.stats ? projectile.stats : {};
            if (!stats.plasmaCloud) return 1;
            const startScale = stats.cloudStartScale || 0.3;
            const endScale = stats.cloudEndScale || 1;
            const growthDistance = Math.max(1, stats.cloudGrowthDistance || 460);
            const x = typeof projectile.x === 'number' ? projectile.x : 0;
            const y = typeof projectile.y === 'number' ? projectile.y : 0;
            const startX = typeof projectile.startX === 'number' ? projectile.startX : x;
            const startY = typeof projectile.startY === 'number' ? projectile.startY : y;
            const dx = x - startX;
            const dy = y - startY;
            const progress = Math.max(0, Math.min(1, Math.hypot(dx, dy) / growthDistance));
            const eased = progress * progress * (3 - progress * 2);
            return startScale + (endScale - startScale) * eased;
        }

        function getPlasmaCloudFadeAlpha(projectile) {
            const stats = projectile && projectile.stats ? projectile.stats : {};
            if (!stats.plasmaCloud) return 1;
            const fadeTime = Math.max(0.05, stats.cloudFadeTime || 0.45);
            return Math.max(0, Math.min(1, (projectile.life || 0) / fadeTime));
        }

        function getPlasmaCloudSpeedFactor(projectile) {
            const stats = projectile && projectile.stats ? projectile.stats : {};
            if (!stats.plasmaCloud) return 1;
            const startScale = stats.cloudSpeedStartScale || 0.45;
            const endScale = stats.cloudSpeedEndScale || 1;
            const accelTime = Math.max(0.1, stats.cloudAccelTime || 1.35);
            const travelAge = Math.max(0, (projectile.age || 0) - (projectile.releaseAge || 0));
            const progress = Math.max(0, Math.min(1, travelAge / accelTime));
            const eased = progress * progress * (3 - progress * 2);
            return startScale + (endScale - startScale) * eased;
        }

        function createBasePlayerModifiers() {
            return {
                moveSpeed: 0,
                maxHp: 0,
                laserDamage: 0,
                hitbox: 1,
                fireRate: 0,
                hpRegen: 0,
                invincibility: 0,
                adrenaline: 0,
                magnet: 0,
                bombCooldown: 1,
                bombDamage: 0,
                bombRadius: 0,
                momentumFireRate: 0,
                xpHeal: 0,
                damageMult: 0,
                killHeal: 0,
                xpGain: 0,
                focusMax: 0,
                focusRegen: 0,
                focusRegenDelay: 1,
                focusLockout: 1,
                focusDrop: 0,
                focusDriveDrain: 1,
                focusDriveSlow: 0,
                focusDriveTransition: 0,
                focusSpecterDrain: 1,
                focusSpecterShrink: 0,
                focusSpecterTransition: 0
            };
        }

        const player = {
            x: width / 2, y: height * 0.8,
            vx: 0, vy: 0,
            shipId: getSelectedShipConfig().id,
            hp: getSelectedShipConfig().maxHp, maxHp: getSelectedShipConfig().maxHp,
            xp: 0, xpNeeded: 10, level: 1,
            stats: { L: 1, M: 0, B: 0 },
            modifiers: createBasePlayerModifiers(),
            weaponStats: createBaseWeaponStats(),
            weapons: [],
            drones: [],
            isBeaming: false,
            beamAngle: -Math.PI / 2,
            beamTargetAngle: -Math.PI / 2,
            beamDeploy: 0,
            rearFireTicker: 0,
            bombTimer: 0,
            bombCooldown: BOMB_BASE_COOLDOWN,
            invincibilityTimer: 0,
            flashTimer: 0,
            fireRate: getSelectedShipConfig().fireRate, // lower is faster
            color: getSelectedShipConfig().previewColor,
            lastFire: 0,
            isFiring: false,
            godMode: false
        };

        function selectShip(index, applyToPlayer = false) {
            selectedShipIndex = wrapShipIndex(index);
            shipSelectIndex = selectedShipIndex;
            if (applyToPlayer) applySelectedShipToPlayer({ heal: true });
            return getSelectedShipConfig();
        }

        function setShipSelectIndex(index) {
            shipSelectIndex = wrapShipIndex(index);
            return getShipSelectConfig();
        }

        function applySelectedShipToPlayer(options = {}) {
            const shipConfig = getSelectedShipConfig();
            const hpRatio = player.maxHp > 0 ? Math.max(0, Math.min(1, player.hp / player.maxHp)) : 1;
            player.shipId = shipConfig.id;
            player.fireRate = shipConfig.fireRate;
            player.bombCooldown = BOMB_BASE_COOLDOWN;
            player.color = shipConfig.previewColor;
            player._renderLayoutCache = null;
            applyPlayerModifierGuardrails();
            if (options.heal) {
                player.hp = player.maxHp;
            } else {
                player.hp = Math.max(1, Math.min(player.maxHp, Math.round(player.maxHp * hpRatio)));
            }
        }

        const PLAYER_FIRE_FORWARD_ANGLE = -Math.PI / 2;
        const PLAYER_FIRE_SKEW_ANGLE = 8 * Math.PI / 180;
        const PLAYER_RENDER_FACING = 'center';
        const PLAYER_BANK_MAX_ROTATION = 0.11;
        const PLAYER_SPECTER_TINT_COLOR = '#d6fbff';
        const PLAYER_SPECTER_GLOW_COLOR = '#7df7ff';
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

        function getPlayerBankRotation(ship = player) {
            if (ship !== player) return 0;
            const maxSpeed = Math.max(1, P_MAX_SPEED || 720);
            return clampValue((player.vx || 0) / maxSpeed, -1, 1) * PLAYER_BANK_MAX_ROTATION;
        }

        function isPlayerFirePressed() {
            return keys.arrowup || keys.arrowleft || keys.arrowright;
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

        function drawBeamStrand(originX, originY, angle, sizeMult, phase, deployFactor = 1, beamMetrics = null, visualLoad = 1) {
            beamMetrics = beamMetrics || getBeamMetrics(sizeMult, deployFactor);
            if (beamMetrics.length <= 6) return;
            const heavyBeam = visualLoad >= 10;
            const extremeBeam = visualLoad >= 16;
            const haloStride = extremeBeam ? 5 : (heavyBeam ? 3 : 2);
            const detailStride = extremeBeam ? 4 : (heavyBeam ? 2 : 1);
            const previousFillStyle = ctx.fillStyle;
            ctx.save();
            ctx.translate(originX, originY);
            ctx.rotate(angle + Math.PI / 2);
            ctx.font = beamMetrics.font;
            ctx.fillStyle = '#ffd866';
            drawBeamStrandLayer(angle, beamMetrics, phase - 14, -8, extremeBeam ? 0.16 : 0.22, 1.95, haloStride, true);
            if (!extremeBeam) {
                ctx.fillStyle = '#fff2aa';
                drawBeamStrandLayer(angle, beamMetrics, phase + 7, 6, heavyBeam ? 0.1 : 0.14, 1.48, haloStride, true);
            }
            ctx.fillStyle = previousFillStyle;
            drawBeamStrandLayer(angle, beamMetrics, phase, 0, heavyBeam ? 0.54 : 0.44, 1.18, detailStride);
            drawBeamStrandLayer(angle, beamMetrics, phase + 18, 11, extremeBeam ? 0.46 : 0.74, 0.92, detailStride);
            if (!heavyBeam) {
                drawBeamStrandLayer(angle, beamMetrics, phase + 37, 24, 1, 0.68);
            }
            ctx.restore();
            ctx.fillStyle = previousFillStyle;
        }

        function getPlayerRenderLayout(ship = player, facing = getPlayerFacing(ship)) {
            const cache = ship._renderLayoutCache;
            if (cache && cache.facing === facing && cache.x === ship.x && cache.y === ship.y && cache.shipId === ship.shipId) {
                return cache.layout;
            }
            const shipConfig = getPlayerShipConfigById(ship.shipId);
            const models = shipConfig.models || PLAYER_SHIP_MODELS;
            const model = models[facing] || models.center || PLAYER_SHIP_MODELS.center;
            const thrusters = new Array(model.thrusters.length);
            const thrusterAnchors = new Array(model.thrusters.length);
            for (let i = 0; i < model.thrusters.length; i++) {
                const thruster = model.thrusters[i];
                const tx = ship.x + thruster.x;
                const ty = ship.y + thruster.y;
                thrusters[i] = {
                    char: thruster.char || PLAYER_THRUSTER_CHAR,
                    fontSize: thruster.fontSize || PLAYER_THRUSTER_FONT_SIZE,
                    x: tx,
                    y: ty,
                    rotation: thruster.rotation,
                    color: thruster.color || null
                };
                thrusterAnchors[i] = {
                    x: tx,
                    y: ty + 10
                };
            }
            const accents = (model.accents || []).map(part => ({
                char: part.char || '◆',
                fontSize: part.fontSize || 24,
                x: ship.x + part.x,
                y: ship.y + part.y,
                rotation: part.rotation || 0,
                color: part.color || null
            }));
            const layout = {
                facing,
                shipId: shipConfig.id,
                body: {
                    char: model.body.char || PLAYER_BODY_CHAR,
                    fontSize: model.body.fontSize || PLAYER_BODY_FONT_SIZE,
                    x: ship.x + model.body.x,
                    y: ship.y + model.body.y,
                    rotation: model.body.rotation,
                    color: model.body.color || null
                },
                accents,
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
            ship._renderLayoutCache = { facing, x: ship.x, y: ship.y, shipId: ship.shipId, layout };
            return layout;
        }

        function drawPlayerPart(part, renderOrigin = null, tint = null) {
            const x = renderOrigin ? part.x - renderOrigin.x : part.x;
            const y = renderOrigin ? part.y - renderOrigin.y : part.y;
            ctx.save();
            ctx.translate(
                snapSpriteCoord(x),
                snapSpriteCoord(y)
            );
            if (part.rotation) ctx.rotate(part.rotation);
            ctx.font = `bold ${part.fontSize}px Courier New`;
            const previousFillStyle = ctx.fillStyle;
            const previousShadowColor = ctx.shadowColor;
            if (part.color) {
                const partColor = tint
                    ? blendPlayerCueHex(part.color, tint.color, tint.amount)
                    : part.color;
                ctx.fillStyle = partColor;
                ctx.shadowColor = partColor;
            }
            ctx.fillText(part.char, 0, 0);
            if (part.color) {
                ctx.fillStyle = previousFillStyle;
                ctx.shadowColor = previousShadowColor;
            }
            ctx.restore();
        }

        function parsePlayerCueHex(color) {
            const source = String(color || '').trim();
            const rgbMatch = source.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
            if (rgbMatch) {
                return {
                    r: clampValue(parseInt(rgbMatch[1], 10), 0, 255),
                    g: clampValue(parseInt(rgbMatch[2], 10), 0, 255),
                    b: clampValue(parseInt(rgbMatch[3], 10), 0, 255)
                };
            }
            const hex = source.replace('#', '');
            if (hex.length !== 6) return { r: 255, g: 255, b: 255 };
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
                return { r: 255, g: 255, b: 255 };
            }
            return { r, g, b };
        }

        function blendPlayerCueHex(colorA, colorB, t) {
            const a = parsePlayerCueHex(colorA);
            const b = parsePlayerCueHex(colorB);
            const blend = clampValue(t, 0, 1);
            const r = Math.round(a.r + (b.r - a.r) * blend).toString(16).padStart(2, '0');
            const g = Math.round(a.g + (b.g - a.g) * blend).toString(16).padStart(2, '0');
            const bChannel = Math.round(a.b + (b.b - a.b) * blend).toString(16).padStart(2, '0');
            return `#${r}${g}${bChannel}`;
        }

        function smoothPlayerCueStep(edge0, edge1, value) {
            const t = clampValue((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
            return t * t * (3 - 2 * t);
        }

        function getPlayerBombIndicatorOrigin(ship = player, facing = getPlayerFacing(ship)) {
            const layout = getPlayerRenderLayout(ship, facing);
            return {
                x: layout.body.x,
                y: layout.body.y - layout.body.fontSize * 0.04,
                layout
            };
        }

        function getPlayerBombIndicatorVisual(now = (typeof currentFrameNow === 'number' ? currentFrameNow : performance.now())) {
            const total = Math.max(0.001, getPlayerBombCooldownTotal());
            const charge = clampValue(1 - Math.max(0, player.bombTimer) / total, 0, 1);
            const readyBreath = 0.5 + Math.sin(now * 0.0022) * 0.5;
            const readyColor = blendPlayerCueHex('#f08d92', '#ffd0cc', readyBreath);
            const readyBlend = smoothPlayerCueStep(0.94, 1, charge);
            const chargeTone = Math.pow(charge, 0.72);
            const baseChargeColor = blendPlayerCueHex('#32213f', '#f08d92', chargeTone);
            const chargeColor = readyBlend > 0 ? blendPlayerCueHex(baseChargeColor, readyColor, readyBlend) : baseChargeColor;
            const color = charge >= 1 ? readyColor : chargeColor;
            const alpha = 0.5 + smoothPlayerCueStep(0, 1, charge) * 0.5;
            const glowColor = charge >= 1 ? color : blendPlayerCueHex('#4c2b55', '#ffaaa2', chargeTone);
            const glow = charge >= 1 ? 10 + readyBreath * 10 : 4 + charge * 8;
            return {
                charge,
                ready: charge >= 1,
                color,
                glowColor,
                alpha,
                glow,
                breath: readyBreath
            };
        }

        function drawPlayerBombReadyCue(layout, ship, renderOrigin = null) {
            if (ship !== player || gameState !== 'PLAYING') return;
            const now = typeof currentFrameNow === 'number' ? currentFrameNow : performance.now();
            const visual = getPlayerBombIndicatorVisual(now);
            const cueSize = Math.max(16, Math.round(layout.body.fontSize * 0.22));
            const coreSize = Math.max(8, Math.round(cueSize * 0.48));
            const cueX = layout.body.x;
            const cueY = layout.body.y - layout.body.fontSize * 0.04;
            const renderCueX = renderOrigin ? cueX - renderOrigin.x : cueX;
            const renderCueY = renderOrigin ? cueY - renderOrigin.y : cueY;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = visual.alpha;
            ctx.font = `bold ${cueSize}px Courier New`;
            ctx.fillStyle = visual.color;
            if (glowEnabled) {
                ctx.shadowColor = visual.glowColor;
                ctx.shadowBlur = visual.glow;
            }
            ctx.fillText(
                '◉',
                snapSpriteCoord(renderCueX),
                snapSpriteCoord(renderCueY)
            );

            ctx.globalAlpha = visual.alpha * (visual.ready ? 0.9 : 0.54 + visual.charge * 0.3);
            ctx.shadowBlur = glowEnabled ? Math.max(3, visual.glow * 0.42) : 0;
            ctx.font = `bold ${coreSize}px Courier New`;
            ctx.fillStyle = visual.ready ? '#fff5f3' : blendPlayerCueHex('#85617f', '#ffd6d4', visual.charge);
            ctx.fillText(
                '*',
                snapSpriteCoord(renderCueX),
                snapSpriteCoord(renderCueY)
            );
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
            for (let i = 0; i < layout.accents.length; i++) {
                const accent = layout.accents[i];
                callback({
                    char: accent.char,
                    x: accent.x,
                    y: accent.y,
                    fontSize: accent.fontSize
                });
            }
            for (let i = 0; i < layout.thrusters.length; i++) {
                const thruster = layout.thrusters[i];
                callback({
                    char: thruster.char,
                    x: thruster.x,
                    y: thruster.y,
                    fontSize: thruster.fontSize
                });
            }
        }

        function getPlayerThrusterAnchors(layout) {
            return layout.thrusterAnchors;
        }

        function getPlayerWeaponOrigin(layout, isRear = false) {
            return isRear ? layout.rearOrigin : layout.weaponOrigin;
        }

        function drawPlayerShip(ship = player, facing = PLAYER_RENDER_FACING) {
            const layout = getPlayerRenderLayout(ship, PLAYER_RENDER_FACING);
            const bankRotation = getPlayerBankRotation(ship);
            const specterIntensity = ship === player && typeof getSpecterRenderIntensity === 'function'
                ? getSpecterRenderIntensity()
                : 0;
            const specterVisualScale = ship === player && typeof getPlayerSpecterVisualScale === 'function'
                ? getPlayerSpecterVisualScale()
                : 1;
            const hasRenderTransform = !!(bankRotation || Math.abs(specterVisualScale - 1) > 0.001);
            const renderOrigin = hasRenderTransform ? { x: ship.x, y: ship.y } : null;
            const specterTintAmount = smoothPlayerCueStep(0.02, 1, specterIntensity) * 0.34;
            const specterTint = specterTintAmount > 0
                ? { color: PLAYER_SPECTER_TINT_COLOR, amount: specterTintAmount }
                : null;
            if (hasRenderTransform) {
                ctx.save();
                ctx.translate(
                    snapSpriteCoord(ship.x),
                    snapSpriteCoord(ship.y)
                );
                if (bankRotation) ctx.rotate(bankRotation);
                if (specterVisualScale !== 1) ctx.scale(specterVisualScale, specterVisualScale * (1 - 0.08 * specterIntensity));
            }
            if (specterIntensity > 0.02) {
                const echoX = -(ship.vx || 0) * 0.016 * specterIntensity;
                const echoY = -(ship.vy || 0) * 0.016 * specterIntensity;
                ctx.save();
                ctx.globalAlpha *= 0.18 * specterIntensity;
                ctx.translate(echoX, echoY);
                ctx.fillStyle = '#c9ffff';
                ctx.shadowColor = '#8ff7ff';
                ctx.shadowBlur = glowEnabled ? 18 * specterIntensity : 0;
                for (let i = 0; i < layout.thrusters.length; i++) drawPlayerPart(layout.thrusters[i], renderOrigin, { color: '#c9ffff', amount: 0.8 });
                for (let i = 0; i < layout.accents.length; i++) drawPlayerPart(layout.accents[i], renderOrigin, { color: '#c9ffff', amount: 0.8 });
                drawPlayerPart(layout.body, renderOrigin, { color: '#c9ffff', amount: 0.8 });
                ctx.restore();

                ctx.save();
                ctx.globalAlpha *= 0.11 * specterIntensity;
                ctx.translate(echoX * 2.1 + Math.sin((currentFrameNow || 0) * 0.016) * 1.2, echoY * 2.1);
                ctx.fillStyle = currentThemeColor;
                ctx.shadowColor = currentThemeColor;
                ctx.shadowBlur = glowEnabled ? 12 * specterIntensity : 0;
                for (let i = 0; i < layout.thrusters.length; i++) drawPlayerPart(layout.thrusters[i], renderOrigin, { color: currentThemeColor, amount: 0.72 });
                for (let i = 0; i < layout.accents.length; i++) drawPlayerPart(layout.accents[i], renderOrigin, { color: currentThemeColor, amount: 0.72 });
                drawPlayerPart(layout.body, renderOrigin, { color: currentThemeColor, amount: 0.72 });
                ctx.restore();

                ctx.globalAlpha *= 1 - 0.18 * specterIntensity;
                ctx.fillStyle = blendPlayerCueHex(ctx.fillStyle, PLAYER_SPECTER_TINT_COLOR, specterTintAmount);
                ctx.shadowColor = blendPlayerCueHex(currentThemeColor, PLAYER_SPECTER_GLOW_COLOR, 0.72 * specterIntensity);
                ctx.shadowBlur = glowEnabled ? Math.max(ctx.shadowBlur || 0, 10 + 18 * specterIntensity) : 0;
            }
            for (let i = 0; i < layout.thrusters.length; i++) {
                drawPlayerPart(layout.thrusters[i], renderOrigin, specterTint);
            }
            for (let i = 0; i < layout.accents.length; i++) {
                drawPlayerPart(layout.accents[i], renderOrigin, specterTint);
            }
            drawPlayerPart(layout.body, renderOrigin, specterTint);
            if (specterIntensity > 0.02) {
                ctx.save();
                ctx.globalAlpha *= 0.09 * specterIntensity;
                ctx.fillStyle = PLAYER_SPECTER_TINT_COLOR;
                ctx.shadowColor = PLAYER_SPECTER_GLOW_COLOR;
                ctx.shadowBlur = glowEnabled ? 14 * specterIntensity : 0;
                for (let i = 0; i < layout.thrusters.length; i++) drawPlayerPart(layout.thrusters[i], renderOrigin, { color: PLAYER_SPECTER_TINT_COLOR, amount: 1 });
                for (let i = 0; i < layout.accents.length; i++) drawPlayerPart(layout.accents[i], renderOrigin, { color: PLAYER_SPECTER_TINT_COLOR, amount: 1 });
                drawPlayerPart(layout.body, renderOrigin, { color: PLAYER_SPECTER_TINT_COLOR, amount: 1 });
                ctx.restore();
            }
            drawPlayerBombReadyCue(layout, ship, renderOrigin);
            if (hasRenderTransform) ctx.restore();
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
                if (typeof isEnemyDamageable === 'function' && !isEnemyDamageable(e)) continue;
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
            { id: 'target', name: 'TARGETING COMP', cat: 'Offense', desc: 'Increases weapon damage', baseVal: 1, type: 'additive' },
            { id: 'evasion', name: 'EVASION PROTOCOL', cat: 'Utility', desc: 'Reduces ship hitbox size', baseVal: 0.95, type: 'multiplicative' },
            { id: 'overdrive', name: 'OVERDRIVE CELL', cat: 'Offense', desc: 'Increases weapon fire rate', baseVal: 0.075, type: 'additive' },
            { id: 'repair', name: 'REPAIR DRONES', cat: 'Defense', desc: 'Grants passive health regen', baseVal: 0.5, type: 'additive' },
            { id: 'shield', name: 'SHIELD MATRIX', cat: 'Defense', desc: 'Extends invincibility after hit', baseVal: 0.1, type: 'additive' },
            { id: 'adrenaline', name: 'ADRENALINE', cat: 'Risk', desc: 'Low-HP damage starts high and scales with level', baseVal: 0.25, levelScale: 0.015, type: 'additive' },
            { id: 'scrap', name: 'SCRAP COLLECTOR', cat: 'Utility', desc: 'Increases XP orb magnet range', baseVal: 0.125, type: 'additive' },
            { id: 'coolant', name: 'COOLANT FLUSH', cat: 'Offense', desc: 'Reduces bomb ability cooldown', baseVal: 0.925, type: 'multiplicative' },
            { id: 'payload', name: 'PAYLOAD TUNING', cat: 'Offense', desc: 'Increases bomb explosion damage', baseVal: 0.18, type: 'additive' },
            { id: 'blast', name: 'BLAST GEOMETRY', cat: 'Utility', desc: 'Expands bomb explosion radius', baseVal: 0.12, type: 'additive' },
            { id: 'kinetic', name: 'KINETIC CAPACITOR', cat: 'Risk', desc: 'Moving fast increases fire rate', baseVal: 0.08, type: 'additive' },
            { id: 'bioscrap', name: 'BIO-SCRAP FILTER', cat: 'Defense', desc: 'XP orbs restore a tiny amount of HP', baseVal: 0.0025, type: 'additive' },
            { id: 'bioleech', name: 'BIOLEECH NODE', cat: 'Defense', desc: 'Killing enemies restores a sliver of health', baseVal: 0.012, type: 'additive' },
            { id: 'glass', name: 'GLASS CHASSIS', cat: 'Risk', desc: 'Boosts all damage but reduces max health', baseVal: 0.15, type: 'additive' },
            { id: 'overflow', name: 'DATA OVERFLOW', cat: 'Utility', desc: 'XP orbs grant more experience', baseVal: 0.25, type: 'additive' },
            { id: 'focus_cell', name: 'FOCUS CELL', cat: 'Focus', desc: 'Increases maximum Focus capacity', baseVal: 0.25, type: 'additive' },
            { id: 'recharge_loop', name: 'RECHARGE LOOP', cat: 'Focus', desc: 'Focus regenerates faster after release', baseVal: 0.35, type: 'additive' },
            { id: 'quick_reset', name: 'QUICK RESET', cat: 'Focus', desc: 'Focus regen delay and empty lockout are shorter', baseVal: 0.86, type: 'multiplicative' },
            { id: 'focus_salvage', name: 'FOCUS SALVAGE', cat: 'Focus', desc: 'Elite Focus refills restore more meter', baseVal: 0.22, type: 'additive' },
            { id: 'chrono_brake', name: 'CHRONO BRAKE', cat: 'Drive', desc: 'Focus Drive slows hostile time harder', baseVal: 0.04, type: 'additive' },
            { id: 'time_dilator', name: 'TIME DILATOR', cat: 'Drive', desc: 'Focus Drive drains Focus slower', baseVal: 0.86, type: 'multiplicative' },
            { id: 'trail_buffer', name: 'TRAIL BUFFER', cat: 'Drive', desc: 'Focus Drive visual and time-warp transitions are quicker', baseVal: 0.16, type: 'additive' },
            { id: 'specter_capacitor', name: 'SPECTER CAPACITOR', cat: 'Specter', desc: 'Specter Shrink drains Focus slower', baseVal: 0.84, type: 'multiplicative' },
            { id: 'ghost_geometry', name: 'GHOST GEOMETRY', cat: 'Specter', desc: 'Specter Shrink compresses ship and hitbox further', baseVal: 0.07, type: 'additive' },
            { id: 'phase_veil', name: 'PHASE VEIL', cat: 'Specter', desc: 'Specter Shrink fades in and out faster', baseVal: 0.18, type: 'additive' }
        ];

        // Stacking Boss Weapon Pool
        const WEAPON_POOL = [
            { name: "Sphere Lightning", cat: "hybrid", glyph: "O", color: "#8ff7ff", desc: "Slow plasma sphere, full pierce, shock splash", mults: { damage: 0.8, fireRate: 0.441, speed: 0.462, size: 2.6, pierceCount: 999, splashRadius: 1.0, splashPercent: 0.5, lightningBall: true, splashVisualDebris: 6 } },
            { name: "Laser Cannon", cat: "offense", glyph: "▣", color: "#ff0000", desc: "Huge, heavy damage shots", mults: { damage: 2.2, fireRate: 0.4, speed: 0.75, size: 2.5 } },
            { name: "Ray Beam", cat: "mode", glyph: "║", color: "#ffff00", desc: "Continuous raycast beam", mults: { mode: "beam" } },
            { name: "Scatter Burst", cat: "hybrid", glyph: ":", color: "#aa00ff", desc: "Fires 2 angled shots at 75% damage", mults: { damage: 0.75, fireRate: 0.8, pellets: 2, spread: Math.PI/7 } },
            { name: "Mortar Shells", cat: "mode", glyph: "◓", color: "#ffff00", desc: "Slow, huge explosive splash", mults: { damage: 4.0, fireRate: 0.25, speed: 0.5, splashRadius: 3.0, splashPercent: 0.75, path: "parabolic" } },
            { name: "Piercing Lance", cat: "offense", glyph: "⇡", color: "#ff0000", desc: "Infinite pierce, large size", mults: { damage: 2.0, fireRate: 0.5, pierceCount: 999, size: 1.5 } },
            { name: "Burst Fire", cat: "hybrid", glyph: "|||", color: "#aa00ff", desc: "Fires three quick, slightly drifting rounds", mults: { damage: 0.58, fireRate: 0.70, burstFire: true, burstCount: 3, burstSpacing: 0.045, burstAngleMin: 0.017, burstAngleMax: 0.052 } },
            { name: "Wave Cannon", cat: "control", glyph: "∿", color: "#00ffff", desc: "Wide sine-wave path projectiles", mults: { damage: 1.1, fireRate: 0.95, speed: 0.9, size: 1.1, path: "sine", sineAmplitude: 1.2 } },
            { name: "Chain Lightning", cat: "control", glyph: "/\\/", icon: "chainLightning", color: "#00ffff", desc: "50% chance to arc lightning to nearby enemies", mults: { damage: 0.8, chainCount: 3, chainChance: 0.5 } },
            { name: "Orbital Drones", cat: "hybrid", glyph: "⟳", color: "#aa00ff", desc: "Adds one auto-firing drone", mults: { drones: true } },
            { name: "Homing Swarm", cat: "control", glyph: "⌖", color: "#00ffff", desc: "Projectiles lightly track targets", mults: { homing: true, homingStrength: 0.5 } },
            { name: "Gatling Array", cat: "offense", glyph: "▒", color: "#ff0000", desc: "Extremely fast, weak shots", mults: { damage: 0.35, fireRate: 3.0, inaccuracy: 0.0696 } },
            { name: "Boomerang Cross", cat: "control", glyph: "✚", color: "#77ffe7", desc: "Shots return once for a weaker second pass", mults: { damage: 0.82, fireRate: 0.82, speed: 0.88, pierceCount: 1, returning: true, returnAfter: 0.552 } },
            { name: "Aegis Halo", cat: "hybrid", glyph: "☼", color: "#ffcf6d", desc: "Larger shots orbit close once, then launch from center", mults: { damage: 1.14, fireRate: 0.82, speed: 0.92, size: 1.89, hitbox: 0.68, orbitDelay: 0.54, orbitRadiusMult: 2.65, orbitReleaseCenter: true } },
            { name: "Plasma Cloud", cat: "hybrid", glyph: "~", color: "#66f2ff", desc: "Piercing storm clouds grow, curve, and accelerate as they travel", mults: { damage: 0.88, fireRate: 0.28, speed: 0.30, size: 2.25, pierceCount: 999, hitbox: 1.12, plasmaCloud: true, cloudDotMult: 6.8, cloudStartScale: 0.28, cloudEndScale: 1.15, cloudGrowthDistance: 510, cloudSpeedStartScale: 0.46, cloudSpeedEndScale: 1.18, cloudAccelTime: 1.35, cloudCurveStrength: 52, cloudFadeTime: 0.5 } },
            { name: "Explosive Torpedo", cat: "offense", glyph: "o", color: "#ffb347", desc: "Slow mini-bombs burst in a compact blast", mults: { damage: 1.4175, fireRate: 0.638, speed: 0.82, size: 1.25, hitbox: 0.82, miniTorpedo: true, torpedoExplosionRadius: 75.4, torpedoExplosionDamageMult: 0.85, torpedoRange: 520, splashVisualDebris: 8 } },
            { name: "Ricochet Rounds", cat: "control", glyph: "↯", color: "#9bf7ff", desc: "Shard shots ricochet off screen edges", mults: { damage: 1.0, fireRate: 0.9, speed: 0.9, ricochetCount: 1, ricochetDamageMult: 0.78 } },
            { name: "Critical Circuit", cat: "offense", glyph: "✸", color: "#ff5e8a", desc: "Shots can surge for heavy critical damage", mults: { damage: 0.92, fireRate: 0.95, critChance: 0.18, critDamageMult: 2.5 } },
            { name: "Prism Splitter", cat: "hybrid", glyph: "<>", color: "#b6f7ff", desc: "Shots fork into weaker angled prism echoes", mults: { damage: 0.9, fireRate: 0.86, speed: 0.96, prismSplit: true, prismSplitDelay: 0.28, prismSplitAngle: 0.34, prismSplitDamageMult: 0.42, prismSplitSizeMult: 0.72, prismSplitSpeedMult: 0.92 } },
            { name: "Phase Needle", cat: "control", glyph: ">|", color: "#82ffc8", desc: "Piercing hits sharpen shots for the next target", mults: { damage: 0.94, fireRate: 0.94, speed: 1.08, size: 0.9, pierceCount: 1, phaseNeedle: true, phaseDamageRamp: 1.16, phaseSpeedRamp: 1.04, phaseMaxStacks: 3 } }
        ];

        let weaponWeights = {};
        WEAPON_POOL.forEach(w => weaponWeights[w.name] = 1.0);

        const WEAPON_ICON_PATTERNS = {
            "Sphere Lightning": [{ char: 'O', x: 0, y: 0, size: 23 }, { char: '.', x: 0, y: 0, size: 10, color: '#ffffff' }],
            "Laser Cannon": [{ char: '[', x: -5, y: 0, size: 20 }, { char: ']', x: 5, y: 0, size: 20 }, { char: '|', x: 0, y: 0, size: 24, color: '#ffffff' }],
            "Ray Beam": [{ char: '|', x: -3, y: 0, size: 24 }, { char: '|', x: 3, y: 0, size: 24 }, { char: '.', x: 0, y: -8, size: 9, color: '#ffffff' }],
            "Scatter Burst": [{ char: '.', x: -7, y: -7, size: 13 }, { char: '.', x: 7, y: -7, size: 13 }, { char: '.', x: 0, y: 6, size: 13, color: '#ffffff' }],
            "Mortar Shells": [{ char: 'o', x: 0, y: -4, size: 20 }, { char: '_', x: 0, y: 7, size: 17, color: '#ffffff' }],
            "Piercing Lance": [{ char: '^', x: 0, y: -8, size: 18 }, { char: '|', x: 0, y: 4, size: 23, color: '#ffffff' }],
            "Burst Fire": [{ char: '|', x: -7, y: 0, size: 20 }, { char: '|', x: 0, y: 0, size: 22, color: '#ffffff' }, { char: '|', x: 7, y: 0, size: 20 }],
            "Wave Cannon": [{ char: '~', x: -5, y: -2, size: 18 }, { char: '~', x: 6, y: 4, size: 18, color: '#ffffff' }],
            "Chain Lightning": [{ char: '/', x: -8, y: -5, size: 20 }, { char: '\\', x: 0, y: 0, size: 20, color: '#ffffff' }, { char: '/', x: 8, y: 5, size: 20 }],
            "Orbital Drones": [{ char: 'o', x: -8, y: 0, size: 14 }, { char: '.', x: 0, y: 0, size: 10, color: '#ffffff' }, { char: 'o', x: 8, y: 0, size: 14 }],
            "Homing Swarm": [{ char: '<', x: -6, y: 0, size: 18 }, { char: 'o', x: 2, y: 0, size: 16, color: '#ffffff' }, { char: '>', x: 8, y: 0, size: 18 }],
            "Gatling Array": [{ char: ':', x: -6, y: -1, size: 20 }, { char: ':', x: 5, y: 1, size: 20, color: '#ffffff' }],
            "Boomerang Cross": [{ char: '<', x: -6, y: -2, size: 18 }, { char: '+', x: 4, y: 2, size: 18, color: '#ffffff' }],
            "Aegis Halo": [{ char: 'O', x: 0, y: 0, size: 22 }, { char: '+', x: 0, y: 0, size: 14, color: '#ffffff' }],
            "Plasma Cloud": [{ char: '~', x: -7, y: -3, size: 18 }, { char: '~', x: 5, y: 4, size: 18 }, { char: '.', x: 0, y: 0, size: 9, color: '#ffffff' }],
            "Explosive Torpedo": [{ char: 'o', x: 0, y: 0, size: 20 }, { char: '*', x: 0, y: 0, size: 13, color: '#ffffff' }],
            "Ricochet Rounds": [{ char: '<', x: -6, y: 0, size: 18 }, { char: '/', x: 1, y: 0, size: 18, color: '#ffffff' }, { char: '>', x: 8, y: 0, size: 18 }],
            "Critical Circuit": [{ char: '*', x: 0, y: 0, size: 22 }, { char: '.', x: 0, y: 0, size: 9, color: '#ffffff' }],
            "Prism Splitter": [{ char: '<', x: -6, y: 0, size: 19 }, { char: '>', x: 6, y: 0, size: 19 }, { char: '.', x: 0, y: 0, size: 9, color: '#ffffff' }],
            "Phase Needle": [{ char: '>', x: -4, y: 0, size: 18 }, { char: '|', x: 5, y: 0, size: 22, color: '#ffffff' }]
        };

        function getWeaponIconPattern(powerup) {
            if (!powerup) return null;
            return WEAPON_ICON_PATTERNS[powerup.name] || null;
        }

        function addPlayerDrone() {
            player.drones.push({ angle: 0, timer: 0 });
            const count = player.drones.length;
            for (let i = 0; i < count; i++) {
                player.drones[i].angle = (Math.PI * 2 * i) / count;
            }
        }

        function getPlayerDamageScale() {
            const shipDamage = getPlayerShipConfigById(player.shipId).damageMult || 1;
            const modBonus = 1 + (player.modifiers && player.modifiers.damageMult ? player.modifiers.damageMult : 0);
            const comboFocus = typeof getComboDamageMultiplier === 'function' ? getComboDamageMultiplier() : 1;
            return shipDamage * modBonus * comboFocus * (player.godMode ? GOD_MODE_DAMAGE_MULT : 1);
        }

        function getAveragedCriticalDamageMult(stats, scale = 1) {
            const chance = clampValue((stats && stats.critChance) || 0, 0, 1);
            const critBonus = Math.max(0, ((stats && stats.critDamageMult) || 1) - 1);
            return 1 + chance * critBonus * clampValue(scale, 0, 1);
        }

        function getPlayerBombCooldownTotal() {
            if (player.godMode) return GOD_MODE_BOMB_COOLDOWN;
            const shipBombCooldown = getPlayerShipConfigById(player.shipId).bombCooldownMult || 1;
            return player.bombCooldown * shipBombCooldown * player.modifiers.bombCooldown;
        }

        function getDuplicateWeaponValueScale(duplicateIndex = 0) {
            if (duplicateIndex < DUPLICATE_WEAPON_VALUE_SCALES.length) {
                return DUPLICATE_WEAPON_VALUE_SCALES[duplicateIndex];
            }
            return DUPLICATE_WEAPON_VALUE_FLOOR;
        }

        function scaleWeaponMultiplier(value, duplicateScale) {
            if (duplicateScale >= 1) return value;
            if (value >= 1) return 1 + (value - 1) * duplicateScale;
            return 1 - (1 - value) * duplicateScale;
        }

        function scaleWeaponAdditive(value, duplicateScale) {
            return value * duplicateScale;
        }

        function applyWeapon(w, duplicateIndex = 0) {
            let s = player.weaponStats;
            let m = w.mults;
            const duplicateScale = getDuplicateWeaponValueScale(duplicateIndex);
            if(m.damage) s.damageMult *= scaleWeaponMultiplier(m.damage, duplicateScale);
            if(m.fireRate) s.fireRateMult *= scaleWeaponMultiplier(m.fireRate, duplicateScale);
            if(m.speed) s.speedMult *= scaleWeaponMultiplier(m.speed, duplicateScale);
            if(m.size) s.sizeMult *= scaleWeaponMultiplier(m.size, duplicateScale);
            if(m.hitbox) s.hitboxMult *= scaleWeaponMultiplier(m.hitbox, duplicateScale);
            if(m.pierceCount) s.pierceCount += scaleWeaponAdditive(m.pierceCount, duplicateScale);
            if(m.splashRadius) s.splashRadius = Math.max(s.splashRadius, scaleWeaponAdditive(m.splashRadius, duplicateScale));
            if(m.splashPercent) s.splashDamagePercent = Math.max(s.splashDamagePercent, scaleWeaponAdditive(m.splashPercent, duplicateScale));
            if(m.homing) s.homing = true;
            if(m.homingStrength) {
                if (duplicateIndex === 0) s.homingStrength = m.homingStrength;
                else s.homingStrength += scaleWeaponAdditive(m.homingStrength, duplicateScale);
            }
            if(m.chainCount) s.chainCount += scaleWeaponAdditive(m.chainCount, duplicateScale);
            if(m.chainChance) {
                if (duplicateIndex === 0) s.chainChance = m.chainChance;
                else s.chainChance = Math.min(1, s.chainChance + (1 - s.chainChance) * duplicateScale);
            }
            if(m.path) s.pathFunction = m.path;
            if(m.sineAmplitude) s.sineAmplitudeMult *= scaleWeaponMultiplier(m.sineAmplitude, duplicateScale);
            if(m.mode) s.mode = m.mode;
            if(m.burstFire) s.burstFire = true;
            if(m.burstCount) {
                if(s.burstCount === 1) s.burstCount = m.burstCount;
                else s.burstCount += scaleWeaponAdditive(m.burstCount - 1, duplicateScale);
            }
            if(m.burstSpacing) s.burstSpacing = Math.min(s.burstSpacing || m.burstSpacing, m.burstSpacing);
            if(m.burstAngleMin) s.burstAngleMin = Math.min(s.burstAngleMin || m.burstAngleMin, m.burstAngleMin);
            if(m.burstAngleMax) s.burstAngleMax = Math.max(s.burstAngleMax || m.burstAngleMax, scaleWeaponAdditive(m.burstAngleMax, duplicateScale));
            if(m.rearFire) s.hasRearFire = true;
            if(m.rearFireEvery) s.rearFireEvery = Math.min(s.rearFireEvery || m.rearFireEvery, m.rearFireEvery);
            if(m.rearFireFan) s.rearFireFan += scaleWeaponAdditive(m.rearFireFan - 1, duplicateScale);
            if(m.rearFireSpread) s.rearFireSpread = Math.max(s.rearFireSpread || 0, scaleWeaponAdditive(m.rearFireSpread, duplicateScale));
            if(m.drones) { s.hasOrbitalDrones = true; addPlayerDrone(); }
            if(m.returning) s.returning = true;
            if(m.returnAfter) s.returnAfter = Math.min(s.returnAfter || m.returnAfter, m.returnAfter);
            if(m.orbitDelay) s.orbitDelay = Math.max(s.orbitDelay || 0, scaleWeaponAdditive(m.orbitDelay, duplicateScale));
            if(m.orbitRadiusMult) s.orbitRadiusMult *= scaleWeaponMultiplier(m.orbitRadiusMult, duplicateScale);
            if(m.orbitReleaseCenter) s.orbitReleaseCenter = true;
            if(m.lightningBall) s.lightningBall = true;
            if(m.plasmaCloud) s.plasmaCloud = true;
            if(m.cloudDotMult) s.cloudDotMult = Math.max(s.cloudDotMult || 0, scaleWeaponAdditive(m.cloudDotMult, duplicateScale));
            if(m.cloudStartScale) s.cloudStartScale = Math.min(s.cloudStartScale || m.cloudStartScale, scaleWeaponMultiplier(m.cloudStartScale, duplicateScale));
            if(m.cloudEndScale) s.cloudEndScale = Math.max(s.cloudEndScale || 1, scaleWeaponMultiplier(m.cloudEndScale, duplicateScale));
            if(m.cloudGrowthDistance) s.cloudGrowthDistance = Math.max(s.cloudGrowthDistance || 1, scaleWeaponAdditive(m.cloudGrowthDistance, duplicateScale));
            if(m.cloudSpeedStartScale) s.cloudSpeedStartScale = Math.min(s.cloudSpeedStartScale || m.cloudSpeedStartScale, scaleWeaponMultiplier(m.cloudSpeedStartScale, duplicateScale));
            if(m.cloudSpeedEndScale) s.cloudSpeedEndScale = Math.max(s.cloudSpeedEndScale || 1, scaleWeaponMultiplier(m.cloudSpeedEndScale, duplicateScale));
            if(m.cloudAccelTime) s.cloudAccelTime = Math.max(s.cloudAccelTime || 0.1, scaleWeaponAdditive(m.cloudAccelTime, duplicateScale));
            if(m.cloudCurveStrength) s.cloudCurveStrength = Math.max(s.cloudCurveStrength || 0, scaleWeaponAdditive(m.cloudCurveStrength, duplicateScale));
            if(m.cloudFadeTime) s.cloudFadeTime = Math.max(s.cloudFadeTime || 0.05, scaleWeaponAdditive(m.cloudFadeTime, duplicateScale));
            if(m.miniTorpedo) s.miniTorpedo = true;
            if(m.torpedoExplosionRadius) s.torpedoExplosionRadius = Math.max(s.torpedoExplosionRadius || 0, scaleWeaponAdditive(m.torpedoExplosionRadius, duplicateScale));
            if(m.torpedoExplosionDamageMult) s.torpedoExplosionDamageMult = Math.max(s.torpedoExplosionDamageMult || 0, scaleWeaponAdditive(m.torpedoExplosionDamageMult, duplicateScale));
            if(m.torpedoRange) s.torpedoRange = Math.max(s.torpedoRange || 0, scaleWeaponAdditive(m.torpedoRange, duplicateScale));
            if(m.splashVisualDebris) s.splashVisualDebris = Math.min(s.splashVisualDebris || m.splashVisualDebris, Math.max(1, scaleWeaponAdditive(m.splashVisualDebris, duplicateScale)));
            if(m.pellets) {
                if(s.pelletCount === 1) s.pelletCount = m.pellets;
                else s.pelletCount += scaleWeaponAdditive(m.pellets - 1, duplicateScale);
            }
            if(m.spread) s.spreadAngle = Math.max(s.spreadAngle, scaleWeaponAdditive(m.spread, duplicateScale));
            if(m.inaccuracy) s.inaccuracy = Math.max(s.inaccuracy, scaleWeaponAdditive(m.inaccuracy, duplicateScale));
            if(m.ricochetCount) s.ricochetCount += scaleWeaponAdditive(m.ricochetCount, duplicateScale);
            if(m.ricochetDamageMult) s.ricochetDamageMult = Math.min(s.ricochetDamageMult || 1, scaleWeaponMultiplier(m.ricochetDamageMult, duplicateScale));
            if(m.critChance) s.critChance += scaleWeaponAdditive(m.critChance, duplicateScale);
            if(m.critDamageMult) {
                s.critDamageMult += scaleWeaponAdditive(m.critDamageMult - 1, duplicateScale);
            }
            if(m.prismSplit) s.prismSplit = true;
            if(m.prismSplitDelay) s.prismSplitDelay = Math.min(s.prismSplitDelay || m.prismSplitDelay, m.prismSplitDelay);
            if(m.prismSplitAngle) s.prismSplitAngle = Math.max(s.prismSplitAngle || 0, scaleWeaponAdditive(m.prismSplitAngle, duplicateScale));
            if(m.prismSplitDamageMult) s.prismSplitDamageMult = Math.max(s.prismSplitDamageMult || 0, scaleWeaponMultiplier(m.prismSplitDamageMult, duplicateScale));
            if(m.prismSplitSizeMult) s.prismSplitSizeMult = Math.min(s.prismSplitSizeMult || 1, scaleWeaponMultiplier(m.prismSplitSizeMult, duplicateScale));
            if(m.prismSplitSpeedMult) s.prismSplitSpeedMult = Math.max(s.prismSplitSpeedMult || 1, scaleWeaponMultiplier(m.prismSplitSpeedMult, duplicateScale));
            if(m.phaseNeedle) s.phaseNeedle = true;
            if(m.phaseDamageRamp) s.phaseDamageRamp = Math.max(s.phaseDamageRamp || 1, scaleWeaponMultiplier(m.phaseDamageRamp, duplicateScale));
            if(m.phaseSpeedRamp) s.phaseSpeedRamp = Math.max(s.phaseSpeedRamp || 1, scaleWeaponMultiplier(m.phaseSpeedRamp, duplicateScale));
            if(m.phaseMaxStacks) s.phaseMaxStacks = Math.max(s.phaseMaxStacks || 1, scaleWeaponAdditive(m.phaseMaxStacks, duplicateScale));
        }

        function applyWeaponStatGuardrails() {
            const s = player.weaponStats;
            const g = WEAPON_STAT_GUARDRAILS;
            s.fireRateMult = clampValue(s.fireRateMult, g.minFireRateMult, g.maxFireRateMult);
            s.speedMult = clampValue(s.speedMult, g.minSpeedMult, g.maxSpeedMult);
            s.sizeMult = clampValue(s.sizeMult, g.minSizeMult, g.maxSizeMult);
            s.hitboxMult = clampValue(s.hitboxMult, g.minHitboxMult, g.maxHitboxMult);
            s.splashRadius = Math.min(s.splashRadius || 0, g.maxSplashRadius);
            s.torpedoExplosionRadius = Math.min(s.torpedoExplosionRadius || 0, g.maxTorpedoExplosionRadius);
            s.pelletCount = Math.round(Math.max(1, Math.min(s.pelletCount || 1, g.maxPelletCount)));
            s.burstCount = Math.round(Math.max(1, Math.min(s.burstCount || 1, g.maxBurstCount)));
            s.rearFireFan = Math.round(Math.max(1, Math.min(s.rearFireFan || 1, g.maxRearFireFan)));
            s.pierceCount = Math.round(s.pierceCount || 0);
            s.chainCount = Math.round(Math.min(s.chainCount || 0, g.maxChainCount));
            s.cloudDotMult = Math.min(s.cloudDotMult || 0, g.maxCloudDotMult);
            s.ricochetCount = Math.round(Math.max(0, Math.min(s.ricochetCount || 0, g.maxRicochetCount)));
            s.critChance = clampValue(s.critChance || 0, 0, g.maxCritChance);
            s.critDamageMult = clampValue(s.critDamageMult || 1, 1, g.maxCritDamageMult);
            s.phaseMaxStacks = Math.round(Math.max(1, Math.min(s.phaseMaxStacks || 3, g.maxPhaseStacks)));

            if (s.plasmaCloud) {
                s.speedMult = Math.max(s.speedMult, s.orbitDelay > 0 ? 0.38 : 0.30);
                s.cloudSpeedStartScale = Math.max(s.cloudSpeedStartScale || 0.46, s.orbitDelay > 0 ? 0.58 : 0.46);
                s.cloudEndScale = Math.max(s.cloudEndScale || 1, s.orbitDelay > 0 ? 1.22 : 1.15);
                if (s.orbitDelay > 0) {
                    s.orbitDelay = Math.min(s.orbitDelay, 0.42);
                    s.damageMult = Math.max(s.damageMult, 0.82);
                }
            }
            if (s.orbitDelay > 0 && s.speedMult < 0.55) {
                s.speedMult = 0.55;
            }
            if (s.pathFunction === 'parabolic' && s.speedMult < 0.32) {
                s.speedMult = 0.32;
            }
        }

        function rebuildPlayerWeaponStats() {
            const activeWeapons = player.weapons.slice();
            player.weaponStats = createBaseWeaponStats();
            player.drones = [];
            const duplicateCounts = {};
            for (let i = 0; i < activeWeapons.length; i++) {
                const weaponName = activeWeapons[i].name || `weapon-${i}`;
                const duplicateIndex = duplicateCounts[weaponName] || 0;
                duplicateCounts[weaponName] = duplicateIndex + 1;
                applyWeapon(activeWeapons[i], duplicateIndex);
            }
            applyWeaponStatGuardrails();
        }

        function addPlayerWeapon(weapon, maxWeapons = 10) {
            if (player.weapons.length >= maxWeapons) {
                rebuildPlayerWeaponStats();
                return false;
            }
            player.weapons.push(weapon);
            rebuildPlayerWeaponStats();
            return true;
        }

        function applyPlayerModifierGuardrails() {
            const m = player.modifiers;
            m.moveSpeed = clampValue(m.moveSpeed || 0, PLAYER_MODIFIER_GUARDRAILS.minMoveSpeedScale - 1, PLAYER_MODIFIER_GUARDRAILS.maxMoveSpeedScale - 1);
            m.maxHp = clampValue(m.maxHp || 0, PLAYER_MODIFIER_GUARDRAILS.minMaxHpBonus, PLAYER_MODIFIER_GUARDRAILS.maxMaxHpBonus);
            m.hitbox = clampValue(m.hitbox || 1, PLAYER_MODIFIER_GUARDRAILS.minHitbox, PLAYER_MODIFIER_GUARDRAILS.maxHitbox);
            m.fireRate = clampValue(m.fireRate || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxFireRateBonus);
            m.hpRegen = clampValue(m.hpRegen || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxHpRegen);
            m.invincibility = clampValue(m.invincibility || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxInvincibilityBonus);
            m.adrenaline = clampValue(m.adrenaline || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxAdrenalineBonus);
            m.magnet = clampValue(m.magnet || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxMagnetBonus);
            m.bombCooldown = Math.max(m.bombCooldown || 1, PLAYER_MODIFIER_GUARDRAILS.minBombCooldownMult);
            m.bombDamage = clampValue(m.bombDamage || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxBombDamageBonus);
            m.bombRadius = clampValue(m.bombRadius || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxBombRadiusBonus);
            m.momentumFireRate = clampValue(m.momentumFireRate || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxMomentumFireRateBonus);
            m.xpHeal = clampValue(m.xpHeal || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxXpHeal);
            m.damageMult = clampValue(m.damageMult || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxDamageMultBonus);
            m.killHeal = clampValue(m.killHeal || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxKillHeal);
            m.xpGain = clampValue(m.xpGain || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxXpGain);
            m.focusMax = clampValue(m.focusMax || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxFocusMaxBonus);
            m.focusRegen = clampValue(m.focusRegen || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxFocusRegenBonus);
            m.focusRegenDelay = Math.max(m.focusRegenDelay || 1, PLAYER_MODIFIER_GUARDRAILS.minFocusRegenDelayMult);
            m.focusLockout = Math.max(m.focusLockout || 1, PLAYER_MODIFIER_GUARDRAILS.minFocusLockoutMult);
            m.focusDrop = clampValue(m.focusDrop || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxFocusDropBonus);
            m.focusDriveDrain = Math.max(m.focusDriveDrain || 1, PLAYER_MODIFIER_GUARDRAILS.minFocusDriveDrainMult);
            m.focusDriveSlow = clampValue(m.focusDriveSlow || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxFocusDriveSlowBonus);
            m.focusDriveTransition = clampValue(m.focusDriveTransition || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxFocusDriveTransitionBonus);
            m.focusSpecterDrain = Math.max(m.focusSpecterDrain || 1, PLAYER_MODIFIER_GUARDRAILS.minFocusSpecterDrainMult);
            m.focusSpecterShrink = clampValue(m.focusSpecterShrink || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxFocusSpecterShrinkBonus);
            m.focusSpecterTransition = clampValue(m.focusSpecterTransition || 0, 0, PLAYER_MODIFIER_GUARDRAILS.maxFocusSpecterTransitionBonus);
            player.maxHp = Math.max(1, Math.floor(getPlayerBaseMaxHp() * (1 + m.maxHp)));
            player.hp = Math.min(player.hp, player.maxHp);
        }

        function drawWeapons() {
            let pool = [...WEAPON_POOL];
            let drawn = [];
            for(let i=0; i<2; i++) {
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
                const levelBonus = (item.levelScale || 0) * Math.max(0, level - 1);
                const baseVal = item.type === 'multiplicative' ? item.baseVal : item.baseVal + levelBonus;
                let val = item.type === 'multiplicative' ? 1 - (1 - baseVal) * mult : baseVal * mult;
                
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
                player.maxHp = Math.floor(getPlayerBaseMaxHp() * (1 + player.modifiers.maxHp));
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
            else if (opt.id === 'payload') player.modifiers.bombDamage += opt.value;
            else if (opt.id === 'blast') player.modifiers.bombRadius += opt.value;
            else if (opt.id === 'kinetic') player.modifiers.momentumFireRate += opt.value;
            else if (opt.id === 'bioscrap') player.modifiers.xpHeal += opt.value;
            else if (opt.id === 'bioleech') player.modifiers.killHeal += opt.value;
            else if (opt.id === 'glass') {
                player.modifiers.damageMult += opt.value;
                player.modifiers.maxHp -= opt.value * 0.6;
            }
            else if (opt.id === 'overflow') player.modifiers.xpGain += opt.value;
            else if (opt.id === 'focus_cell') {
                const oldMax = typeof getFocusMeterMax === 'function' ? getFocusMeterMax() : FOCUS_METER_MAX;
                player.modifiers.focusMax += opt.value;
                applyPlayerModifierGuardrails();
                const newMax = typeof getFocusMeterMax === 'function' ? getFocusMeterMax() : FOCUS_METER_MAX;
                if (typeof focusMeter === 'number') focusMeter = Math.min(newMax, focusMeter + Math.max(0, newMax - oldMax));
                return;
            }
            else if (opt.id === 'recharge_loop') player.modifiers.focusRegen += opt.value;
            else if (opt.id === 'quick_reset') {
                player.modifiers.focusRegenDelay *= opt.value;
                player.modifiers.focusLockout *= opt.value;
            }
            else if (opt.id === 'focus_salvage') player.modifiers.focusDrop += opt.value;
            else if (opt.id === 'chrono_brake') player.modifiers.focusDriveSlow += opt.value;
            else if (opt.id === 'time_dilator') player.modifiers.focusDriveDrain *= opt.value;
            else if (opt.id === 'trail_buffer') player.modifiers.focusDriveTransition += opt.value;
            else if (opt.id === 'specter_capacitor') player.modifiers.focusSpecterDrain *= opt.value;
            else if (opt.id === 'ghost_geometry') player.modifiers.focusSpecterShrink += opt.value;
            else if (opt.id === 'phase_veil') player.modifiers.focusSpecterTransition += opt.value;
            applyPlayerModifierGuardrails();
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
                'remwep/rwep <active slot|weapon name> : remove one active weapon',
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
            const runWaveLimit = getConsoleRunWaveLimit();
            for (let i = 1; i <= runWaveLimit; i++) {
                const waveDef = typeof WaveManager.getWaveDefinitionForWave === 'function'
                    ? WaveManager.getWaveDefinitionForWave(i)
                    : WaveManager.waves[i - 1];
                if (waveDef && waveDef.isBoss) bossWaves.push(String(i));
            }
            return [
                `wave/w <target> : jump to run wave 1-${runWaveLimit}`,
                'Galaxy target is optional: g1, g2, etc.',
                `Boss waves: ${bossWaves.join(', ')}`,
                'Examples: wave 15 | wave g1w13 | w w12g2 | g2 w10'
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
                'help [wave|lvl|wep|remwep]',
                'wave/w <n|g1w13|w12g2> or bare g2 w10',
                'lvl [n]',
                'wep <n|weapon name>',
                'remwep/rwep <active slot|weapon name>',
                'gm [on|off]',
                'Try: help wep'
            ];
        }

        function getConsoleRunWaveLimit() {
            if (typeof WaveManager !== 'undefined' && typeof WaveManager.getRunWaveLimit === 'function') {
                return WaveManager.getRunWaveLimit();
            }
            return WaveManager && WaveManager.waves ? WaveManager.waves.length : 0;
        }

        function getConsoleRunWaveLimitForGalaxy(galaxyIndex) {
            if (typeof WaveManager !== 'undefined' && typeof WaveManager.getRunWaveLimitForGalaxy === 'function') {
                return WaveManager.getRunWaveLimitForGalaxy(galaxyIndex);
            }
            if (typeof getGalaxyRunWaveLimit === 'function') {
                return getGalaxyRunWaveLimit(galaxyIndex);
            }
            return getConsoleRunWaveLimit();
        }

        function getLastConsoleRegexInt(text, regex) {
            let value = null;
            let match;
            regex.lastIndex = 0;
            while ((match = regex.exec(text)) !== null) {
                value = parseInt(match[1], 10);
                if (match.index === regex.lastIndex) regex.lastIndex++;
            }
            return value;
        }

        function getConsoleGalaxyDefinition(galaxyIndex) {
            if (typeof getGalaxyDefinition === 'function') return getGalaxyDefinition(galaxyIndex);
            if (typeof GALAXY_DEFINITIONS !== 'undefined') return GALAXY_DEFINITIONS[galaxyIndex] || null;
            return galaxyIndex === 0 ? { name: 'GALAXY 1', title: 'GALAXY 1', available: true } : null;
        }

        function isBareConsoleWaveTarget(commandLine) {
            const raw = (commandLine || '').trim().toLowerCase();
            if (!raw) return false;
            const compact = raw.replace(/[\s,;:/_-]+/g, '');
            const hasGalaxy = /g(?:alaxy)?[1-9]\d*/.test(compact);
            const hasWave = /w(?:ave)?[1-9]\d*/.test(compact);
            return hasGalaxy && hasWave;
        }

        function parseConsoleWaveTarget(argString) {
            const defaultRunWaveLimit = getConsoleRunWaveLimit();
            const raw = (argString || '').trim().toLowerCase();
            if (!raw) {
                return { ok: false, message: `Usage: wave 1-${defaultRunWaveLimit} or wave g1w13` };
            }

            const galaxyNumber = getLastConsoleRegexInt(raw, /g(?:alaxy)?\s*([1-9]\d*)/g);
            let waveNumber = getLastConsoleRegexInt(raw, /w(?:ave)?\s*([1-9]\d*)/g);

            if (waveNumber === null) {
                const withoutGalaxy = raw.replace(/g(?:alaxy)?\s*[1-9]\d*/g, ' ');
                const bareWaveMatch = withoutGalaxy.match(/\b([1-9]\d*)\b/);
                if (bareWaveMatch) {
                    waveNumber = parseInt(bareWaveMatch[1], 10);
                } else {
                    const compactWithoutGalaxy = raw
                        .replace(/[\s,;:/_-]+/g, '')
                        .replace(/g(?:alaxy)?[1-9]\d*/g, '');
                    const compactWaveMatch = compactWithoutGalaxy.match(/([1-9]\d*)/);
                    if (compactWaveMatch) waveNumber = parseInt(compactWaveMatch[1], 10);
                }
            }

            let galaxyIndex = typeof currentGalaxyIndex === 'number' ? currentGalaxyIndex : 0;
            let galaxySpecified = false;
            if (galaxyNumber !== null) {
                galaxySpecified = true;
                galaxyIndex = galaxyNumber - 1;
                const galaxy = getConsoleGalaxyDefinition(galaxyIndex);
                if (!galaxy) {
                    return { ok: false, message: `Galaxy ${galaxyNumber} does not exist.` };
                }
                if (galaxy.available === false) {
                    return { ok: false, message: `${galaxy.title || galaxy.name || `Galaxy ${galaxyNumber}`} is locked.` };
                }
            }

            const runWaveLimit = getConsoleRunWaveLimitForGalaxy(galaxyIndex);
            if (!waveNumber || waveNumber < 1 || waveNumber > runWaveLimit) {
                return { ok: false, message: `Usage: wave 1-${runWaveLimit}, wave g1w13, or w w12g2` };
            }

            return { ok: true, waveNumber, galaxyIndex, galaxySpecified };
        }

        function removePlayerWeapon(argString) {
            if (!argString) return { ok: false, message: 'Usage: remwep <active slot|weapon name>' };

            const rawArg = argString.trim();
            const loweredArg = rawArg.toLowerCase();
            let removeIndex = -1;
            const activeNum = parseInt(loweredArg, 10);
            if (!isNaN(activeNum) && activeNum > 0 && activeNum <= player.weapons.length) {
                removeIndex = activeNum - 1;
            } else {
                removeIndex = player.weapons.findIndex(w => w.name.toLowerCase() === loweredArg);
                if (removeIndex === -1) {
                    removeIndex = player.weapons.findIndex(w => w.name.toLowerCase().includes(loweredArg));
                }
            }

            if (removeIndex === -1) {
                return { ok: false, message: `Active weapon not found: ${rawArg}` };
            }

            const removed = player.weapons.splice(removeIndex, 1)[0];
            rebuildPlayerWeaponStats();
            return { ok: true, message: `Removed weapon: ${removed.name}` };
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
            keys.arrowdown = false;
            keys.shift = false;
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

        function resetConsoleWavePlayerVisualState() {
            clearGameplayKeys();
            deathTimer = 0;
            launchTimer = 0;
            playerExploded = false;
            debris = [];
            thrusterParticles = [];
            shake = 0;
            wobble = 0;
            postResumeBombLockTimer = 0;
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();

            if (player) {
                if (!Number.isFinite(player.x) || player.x < 40 || player.x > width - 40) {
                    player.x = width / 2;
                }
                const bottomLimit = typeof getGameplayBottomLimit === 'function' ? getGameplayBottomLimit(70) : height - 130;
                if (!Number.isFinite(player.y) || player.y < 40 || player.y > bottomLimit) {
                    player.y = Math.min(height * 0.8, bottomLimit);
                }
                player.vx = 0;
                player.vy = 0;
                player.isBeaming = false;
                player.isFiring = false;
                player.beamDeploy = 0;
                player.invincibilityTimer = Math.max(player.invincibilityTimer || 0, 0.65);
                player.flashTimer = 0;
                if (!Number.isFinite(player.hp) || player.hp <= 0) {
                    player.hp = Math.max(1, player.maxHp || (typeof getPlayerBaseMaxHp === 'function' ? getPlayerBaseMaxHp() : 100));
                }
                player._renderLayoutCache = null;
            }
        }

        function executeConsoleCommand(rawInput) {
            const commandLine = rawInput.trim();
            if (!commandLine) return false;

            pushConsoleHistory(commandLine);

            const firstSpace = commandLine.indexOf(' ');
            const command = (firstSpace === -1 ? commandLine : commandLine.slice(0, firstSpace)).toLowerCase();
            const argString = firstSpace === -1 ? '' : commandLine.slice(firstSpace + 1).trim();

            if (command !== 'help') clearConsoleReference();

            const isWaveCommand = command === 'wave' || command === 'w';
            if (isWaveCommand || isBareConsoleWaveTarget(commandLine)) {
                const parsedTarget = parseConsoleWaveTarget(isWaveCommand ? argString : commandLine);
                if (!parsedTarget.ok) {
                    pushConsoleNotification(parsedTarget.message, 'error');
                    return false;
                }

                const previousGalaxyIndex = typeof currentGalaxyIndex === 'number' ? currentGalaxyIndex : 0;
                const targetWave = parsedTarget.waveNumber;
                if (parsedTarget.galaxySpecified && parsedTarget.galaxyIndex !== previousGalaxyIndex) {
                    currentGalaxyIndex = parsedTarget.galaxyIndex;
                    selectedGalaxyIndex = parsedTarget.galaxyIndex;
                    if (typeof WaveManager.prepareGalaxyRun === 'function') {
                        WaveManager.prepareGalaxyRun(currentGalaxyIndex);
                    }
                } else if (typeof WaveManager.getActiveGalaxyIndex === 'function') {
                    WaveManager.activeGalaxyIndex = WaveManager.getActiveGalaxyIndex();
                }

                const targetWaveDef = typeof WaveManager.getWaveDefinitionForWave === 'function'
                    ? WaveManager.getWaveDefinitionForWave(targetWave)
                    : WaveManager.waves[targetWave - 1];
                if (!targetWaveDef) {
                    pushConsoleNotification(`Wave ${targetWave} is unavailable.`, 'error');
                    return false;
                }
                teardownBossCinematic();
                queuedConsoleLevels = 0;
                stopMusic();
                WaveManager.currentWave = targetWave - 1;
                WaveManager.waveDelay = 0;
                WaveManager.hasSpawnedWave = false;
                WaveManager.interWaveDelayQueued = false;
                WaveManager.pendingFormationUnits = 0;
                enemies = [];
                boss = null;
                enemyBullets = [];
                comboProjectiles = [];
                bombProjectiles = [];
                bombBlastRings = [];
                drops = [];
                xpOrbs = [];
                resetConsoleWavePlayerVisualState();
                clearPauseVolumePreview();
                gameState = 'PLAYING';
                pauseReturnState = 'PLAYING';
                applyCurrentVolume();
                if (!targetWaveDef.isBoss) {
                    startMusic();
                }
                const galaxy = getConsoleGalaxyDefinition(parsedTarget.galaxyIndex);
                const galaxyLabel = parsedTarget.galaxySpecified && galaxy
                    ? ` (${galaxy.shortName || galaxy.name || `G${parsedTarget.galaxyIndex + 1}`})`
                    : '';
                pushConsoleNotification(`Jumped to G${parsedTarget.galaxyIndex + 1} W${targetWave}${galaxyLabel}.`, 'success');
                return true;
            }

            if (command === 'gm') {
                const mode = argString.toLowerCase();
                if (mode === 'on' || mode === '1' || mode === 'true') {
                    player.godMode = true;
                } else if (mode === 'off' || mode === '0' || mode === 'false') {
                    player.godMode = false;
                } else {
                    player.godMode = !player.godMode;
                }

                if (player.godMode) {
                    player.hp = player.maxHp;
                    player.bombTimer = 0;
                    pushConsoleNotification(`God mode ON: no bullet damage, unlimited focus, ${GOD_MODE_DAMAGE_MULT}x damage, ${GOD_MODE_BOMB_COOLDOWN}s bombs.`, 'success');
                } else {
                    pushConsoleNotification('God mode OFF.', 'warn');
                }
                return false;
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

                const added = addPlayerWeapon(foundWep, 10);
                pushConsoleNotification(added ? `Applied weapon: ${foundWep.name}` : 'Weapon slots are full.', added ? 'success' : 'warn');
                return false;
            }

            if (command === 'remwep' || command === 'rwep') {
                if (!argString) {
                    setConsoleReference(buildConsoleWeaponHelpLines());
                    pushConsoleNotification('Showing weapon reference.', 'info');
                    return false;
                }

                const result = removePlayerWeapon(argString);
                pushConsoleNotification(result.message, result.ok ? 'success' : 'error');
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
                if (topic === 'wep' || topic === 'weapon' || topic === 'weapons' || topic === 'remwep' || topic === 'rwep') {
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
