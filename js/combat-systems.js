        // Explosions, projectiles, resize/reset, spatial utilities, and combat helpers.
        const ENEMY_EXPLOSION_DEBRIS_SOFT_CAP = 520;
        const BOSS_MINION_EXPLOSION_DEBRIS_CAP = 64;

        function isEnemyDamageable(enemy) {
            return !(enemy && enemy.invulnerable);
        }

        function getEnemyExplosionDebrisBudget(enemy, visibleCount) {
            let cap = enemy.explosionDebrisCap || (enemy.isBossMinion ? BOSS_MINION_EXPLOSION_DEBRIS_CAP : 0);
            if (!cap || visibleCount <= cap) return visibleCount;
            if (debris.length > ENEMY_EXPLOSION_DEBRIS_SOFT_CAP) {
                const pressure = Math.min(0.45, (debris.length - ENEMY_EXPLOSION_DEBRIS_SOFT_CAP) / 650);
                cap = Math.max(24, Math.floor(cap * (1 - pressure)));
            }
            return Math.max(1, Math.min(visibleCount, cap));
        }

        function explodeEnemy(enemy) {
            if (!enemy || !Array.isArray(enemy.sprite) || enemy.sprite.length === 0) return;
            const renderScale = enemy.renderScale || 1;
            const eW = enemy.sprite[0].length * charW * renderScale, eH = enemy.sprite.length * charH * renderScale;
            const startX = enemy.x - eW / 2, startY = enemy.y - eH / 2;
            const colors = enemy.debrisColors || (enemy.isFlameGuardian ? ['#e01926', '#e38914', '#ffdd00', '#ff5500'] : ['#ff4400', '#ff6600', '#ff2200', '#ffaa00']);
            const debrisVelocity = enemy.explosionDebrisVelocity || 600;
            const debrisLife = enemy.explosionDebrisLife || 1.0;
            let visibleCount = 0;
            for (let r = 0; r < enemy.sprite.length; r++) {
                for (let c = 0; c < enemy.sprite[r].length; c++) {
                    if (enemy.sprite[r][c] !== ' ') visibleCount++;
                }
            }
            const debrisBudget = getEnemyExplosionDebrisBudget(enemy, visibleCount);
            const sampleStride = visibleCount > debrisBudget ? Math.ceil(visibleCount / debrisBudget) : 1;
            const sampleOffset = sampleStride > 1 ? Math.floor(Math.random() * sampleStride) : 0;
            let visibleIndex = 0;
            let spawnedDebris = 0;
            for (let r = 0; r < enemy.sprite.length; r++) {
                for (let c = 0; c < enemy.sprite[r].length; c++) {
                    const char = enemy.sprite[r][c];
                    if (char !== ' ') {
                        const shouldSpawn = sampleStride === 1 || ((visibleIndex + sampleOffset) % sampleStride === 0 && spawnedDebris < debrisBudget);
                        visibleIndex++;
                        if (!shouldSpawn) continue;
                        const color = typeof enemy.spriteColorFn === 'function'
                            ? enemy.spriteColorFn(enemy.sprite, r, c)
                            : colors[Math.floor(Math.random() * colors.length)];
                        debris.push({
                            x: startX + c * charW * renderScale, y: startY + r * charH * renderScale,
                            vx: (Math.random() - 0.5) * debrisVelocity + (enemy.vx || 0), vy: (Math.random() - 0.5) * debrisVelocity + (enemy.vy || 160),
                            char, color, life: debrisLife
                        });
                        spawnedDebris++;
                    }
                }
            }
            
            const numOrbs = Math.max(1, Math.floor(((enemy.maxHp || 10) + 6) / 14));
            for (let i = 0; i < numOrbs; i++) {
                xpOrbs.push({ 
                    x: enemy.x, y: enemy.y, 
                    vx: (Math.random() - 0.5) * 200, 
                    vy: (Math.random() - 0.5) * 200, 
                    char: '⢀', 
                    color: '#ffffff',
                    xpValue: 1
                });
            }
            if (enemy.flyByDropType === 'health') {
                drops.push(createHealthDrop(enemy.x, enemy.y));
            } else if (enemy.flyByDropType === 'healthSmall') {
                drops.push(createHealthDrop(enemy.x, enemy.y, 0.05, 22));
            }
            const focusMax = typeof getFocusMeterMax === 'function' ? getFocusMeterMax() : FOCUS_METER_MAX;
            if (enemy.isElite && !enemy.isBossMinion && typeof focusMeter === 'number' && focusMeter < focusMax - 0.02) {
                const focusDropAmount = typeof getFocusEliteDropAmount === 'function' ? getFocusEliteDropAmount() : FOCUS_ELITE_DROP_AMOUNT;
                drops.push(createFocusDrop(enemy.x, enemy.y, focusDropAmount));
            }
            addShake(5); registerComboKill(enemy, 150); applyWakeForce(enemy.x, enemy.y, 160, 18);

            const killHeal = player && player.modifiers ? (player.modifiers.killHeal || 0) : 0;
            if (killHeal > 0 && player.hp > 0 && player.hp < player.maxHp) {
                player.hp = Math.min(player.maxHp, player.hp + player.maxHp * killHeal);
            }
        }

        const SPRITE_COLLISION_CACHE = new WeakMap();
        const SPRITE_COLLISION_GLYPH_HALF_W = 0.42;
        const SPRITE_COLLISION_GLYPH_HALF_H = 0.42;

        function getCachedSpriteCollisionMetrics(sprite) {
            if (!Array.isArray(sprite) || sprite.length === 0) return null;
            const cached = SPRITE_COLLISION_CACHE.get(sprite);
            if (cached) return cached;
            const metrics = getSpriteVisibleMetrics(sprite);
            const result = {
                metrics,
                width: sprite[0] ? sprite[0].length : 0,
                height: sprite.length
            };
            SPRITE_COLLISION_CACHE.set(sprite, result);
            return result;
        }

        function getEnemyShipCollisionBoxes(target) {
            const profile = ENEMY_SHIP_VISUAL_PROFILES[target.enemyShipKind] || ENEMY_SHIP_VISUAL_PROFILES.base;
            const visualScale = Math.max(0.85, Math.min(1.24, target.enemyShipVisualScale || 1));
            const bodySize = (profile.collisionBodySize || profile.bodySize) * visualScale;
            const thrusterSize = (profile.collisionThrusterSize || profile.thrusterSize || profile.wingSize || profile.bodySize * 0.55) * visualScale;
            const spread = (profile.collisionSpread || profile.spread || (profile.tier >= 3 ? 11.5 : 9.5)) * visualScale;
            const thrusterY = profile.collisionThrusterY ?? profile.thrusterY ?? -8.5;
            const bodyY = profile.collisionBodyY ?? profile.bodyY ?? 4;
            const x = target.x;
            const y = target.y;
            const boxes = [];

            function addBox(cx, cy, fontSize, widthScale = 0.34, heightScale = 0.39) {
                boxes.push({
                    x: cx,
                    y: cy,
                    halfW: fontSize * widthScale,
                    halfH: fontSize * heightScale
                });
            }

            const thrusterOffsets = profile.tier >= 3 ? [-spread, 0, spread] : [-spread, spread];
            for (let i = 0; i < thrusterOffsets.length; i++) {
                addBox(x + thrusterOffsets[i], y + thrusterY * visualScale, thrusterSize, 0.3, 0.34);
            }

            addBox(x, y + bodyY * visualScale, bodySize, 0.34, 0.38);
            if (profile.tier >= 2) {
                const armorSize = bodySize * 0.42;
                addBox(x - 9.5 * visualScale, y + (bodyY + 1.5) * visualScale, armorSize, 0.34, 0.36);
                addBox(x + 9.5 * visualScale, y + (bodyY + 1.5) * visualScale, armorSize, 0.34, 0.36);
                addBox(x, y + (bodyY + 0.5) * visualScale, bodySize * 0.34, 0.36, 0.36);
            } else {
                addBox(x - 3 * visualScale, y + (bodyY - 2) * visualScale, bodySize * 0.42, 0.3, 0.32);
            }
            if (profile.tier >= 3) {
                addBox(x, y + (bodyY + 8) * visualScale, bodySize * 0.32, 0.34, 0.34);
                addBox(x - 13 * visualScale, y + (bodyY - 3) * visualScale, bodySize * 0.24, 0.3, 0.32);
                addBox(x + 13 * visualScale, y + (bodyY - 3) * visualScale, bodySize * 0.24, 0.3, 0.32);
            }

            return boxes;
        }

        function getTargetSpriteCollisionLayout(target) {
            if (!target) return null;
            if (target.enemyShipSprite) {
                const boxes = getEnemyShipCollisionBoxes(target);
                if (boxes.length === 0) return null;
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                for (let i = 0; i < boxes.length; i++) {
                    const box = boxes[i];
                    minX = Math.min(minX, box.x - box.halfW);
                    maxX = Math.max(maxX, box.x + box.halfW);
                    minY = Math.min(minY, box.y - box.halfH);
                    maxY = Math.max(maxY, box.y + box.halfH);
                }
                return { mode: 'boxes', boxes, bounds: { minX, minY, maxX, maxY } };
            }

            const sprite = target.sprite;
            const cached = getCachedSpriteCollisionMetrics(sprite);
            if (!cached || cached.metrics.width <= 0 || cached.metrics.height <= 0) return null;

            if (target.name === 'NULL PHANTOM' && typeof getNullPhantomRenderLayout === 'function') {
                const layout = getNullPhantomRenderLayout(target);
                return {
                    mode: 'customGrid',
                    sprite,
                    metrics: cached.metrics,
                    cellW: layout.cellW,
                    cellH: layout.cellH,
                    startX: layout.startX,
                    startY: layout.startY,
                    getCellPosition: (row, col) => getNullPhantomGlyphPosition(layout, row, col)
                };
            }

            if (target.name === 'GHOST SIGNAL' && typeof getGhostSignalRenderLayout === 'function') {
                const layout = getGhostSignalRenderLayout(target);
                return {
                    mode: 'customGrid',
                    sprite,
                    metrics: cached.metrics,
                    cellW: layout.cellW,
                    cellH: layout.cellH,
                    startX: layout.startX,
                    startY: layout.startY,
                    getCellPosition: (row, col) => getGhostSignalGlyphPosition(layout, row, col)
                };
            }

            const renderScale = target.renderScale || (target.isFlyBy ? (target.flyByScale || 1.55) : 1);
            const cellW = charW * renderScale;
            const cellH = charH * renderScale;
            return {
                mode: 'grid',
                sprite,
                metrics: cached.metrics,
                cellW,
                cellH,
                startX: target.x - (cached.width * cellW) / 2,
                startY: target.y - (cached.height * cellH) / 2,
                extraBoxes: target.name === 'BLACK VOID'
                    ? [{ x: target.x, y: target.y + 2, halfW: 24, halfH: 28 }]
                    : null
            };
        }

        function getTargetCollisionBounds(target, layout = getTargetSpriteCollisionLayout(target)) {
            if (!layout) return null;
            if (layout.bounds) return layout.bounds;
            const m = layout.metrics;
            const bounds = {
                minX: layout.startX + m.minX * layout.cellW - layout.cellW * SPRITE_COLLISION_GLYPH_HALF_W,
                maxX: layout.startX + m.maxX * layout.cellW + layout.cellW * SPRITE_COLLISION_GLYPH_HALF_W,
                minY: layout.startY + m.minY * layout.cellH - layout.cellH * SPRITE_COLLISION_GLYPH_HALF_H,
                maxY: layout.startY + m.maxY * layout.cellH + layout.cellH * SPRITE_COLLISION_GLYPH_HALF_H
            };
            if (layout.mode === 'customGrid') {
                const customMargin = Math.max(layout.cellW, layout.cellH) * 2.2;
                bounds.minX -= customMargin;
                bounds.maxX += customMargin;
                bounds.minY -= customMargin;
                bounds.maxY += customMargin;
            }
            if (layout.extraBoxes) {
                for (let i = 0; i < layout.extraBoxes.length; i++) {
                    const box = layout.extraBoxes[i];
                    bounds.minX = Math.min(bounds.minX, box.x - box.halfW);
                    bounds.maxX = Math.max(bounds.maxX, box.x + box.halfW);
                    bounds.minY = Math.min(bounds.minY, box.y - box.halfH);
                    bounds.maxY = Math.max(bounds.maxY, box.y + box.halfH);
                }
            }
            return bounds;
        }

        function circleIntersectsBox(cx, cy, radius, box) {
            const nearX = Math.max(box.x - box.halfW, Math.min(cx, box.x + box.halfW));
            const nearY = Math.max(box.y - box.halfH, Math.min(cy, box.y + box.halfH));
            const dx = cx - nearX;
            const dy = cy - nearY;
            return dx * dx + dy * dy <= radius * radius;
        }

        function forEachTargetCollisionBox(target, callback, layout = getTargetSpriteCollisionLayout(target)) {
            if (!layout) return false;
            if (layout.mode === 'boxes') {
                for (let i = 0; i < layout.boxes.length; i++) {
                    if (callback(layout.boxes[i])) return true;
                }
                return false;
            }

            const m = layout.metrics;
            for (let r = m.minY; r <= m.maxY; r++) {
                const row = layout.sprite[r] || '';
                for (let c = m.minX; c <= m.maxX; c++) {
                    if (row[c] === ' ' || row[c] === undefined) continue;
                    const pos = layout.getCellPosition
                        ? layout.getCellPosition(r, c)
                        : { x: layout.startX + c * layout.cellW, y: layout.startY + r * layout.cellH };
                    if (callback({
                        x: pos.x,
                        y: pos.y,
                        halfW: layout.cellW * SPRITE_COLLISION_GLYPH_HALF_W,
                        halfH: layout.cellH * SPRITE_COLLISION_GLYPH_HALF_H
                    })) return true;
                }
            }
            if (layout.extraBoxes) {
                for (let i = 0; i < layout.extraBoxes.length; i++) {
                    if (callback(layout.extraBoxes[i])) return true;
                }
            }
            return false;
        }

        function doesCircleHitTargetMask(x, y, radius, target) {
            const layout = getTargetSpriteCollisionLayout(target);
            const bounds = getTargetCollisionBounds(target, layout);
            if (!bounds) return false;
            if (x < bounds.minX - radius || x > bounds.maxX + radius || y < bounds.minY - radius || y > bounds.maxY + radius) {
                return false;
            }
            return forEachTargetCollisionBox(target, box => circleIntersectsBox(x, y, radius, box), layout);
        }

        function doesCircleHitTargetBounds(x, y, radius, target) {
            const bounds = getTargetCollisionBounds(target);
            if (!bounds) return false;
            return circleIntersectsBox(x, y, radius, {
                x: (bounds.minX + bounds.maxX) * 0.5,
                y: (bounds.minY + bounds.maxY) * 0.5,
                halfW: (bounds.maxX - bounds.minX) * 0.5,
                halfH: (bounds.maxY - bounds.minY) * 0.5
            });
        }

        function doesProjectileHitTargetMask(projectile, target, radius) {
            return doesCircleHitTargetMask(projectile.x, projectile.y, Math.max(4, radius || 0), target);
        }

        function doesBeamHitTargetMask(originX, originY, dirX, dirY, length, beamRadius, target) {
            const layout = getTargetSpriteCollisionLayout(target);
            const bounds = getTargetCollisionBounds(target, layout);
            if (!bounds) return false;
            const targetCenterX = (bounds.minX + bounds.maxX) * 0.5;
            const targetCenterY = (bounds.minY + bounds.maxY) * 0.5;
            const targetRadius = Math.hypot(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 0.5;
            const centerT = (targetCenterX - originX) * dirX + (targetCenterY - originY) * dirY;
            const closestX = originX + Math.max(0, Math.min(length, centerT)) * dirX;
            const closestY = originY + Math.max(0, Math.min(length, centerT)) * dirY;
            if (Math.hypot(targetCenterX - closestX, targetCenterY - closestY) > targetRadius + beamRadius) return false;

            return forEachTargetCollisionBox(target, box => {
                const toCellX = box.x - originX;
                const toCellY = box.y - originY;
                const t = toCellX * dirX + toCellY * dirY;
                if (t < -Math.max(box.halfW, box.halfH) || t > length + Math.max(box.halfW, box.halfH)) return false;
                const lineX = originX + t * dirX;
                const lineY = originY + t * dirY;
                const dist = Math.hypot(box.x - lineX, box.y - lineY);
                return dist <= beamRadius + Math.min(box.halfW, box.halfH);
            }, layout);
        }

        function explodeBoss(bossObj) {
            const colors = ['#ff4400', '#ff6600', '#ff2200', '#ffaa00'];
            const profile = getBossExplosionProfile(bossObj);
            const centerX = bossObj.x;
            const centerY = bossObj.y + (profile.centerYOffset || 0);

            const snapshot = buildFallbackBossSnapshot(bossObj);
            if (snapshot.entries.length > 0) {
                const debrisCap = profile.debrisCap || BOSS_EXPLOSION_DEBRIS_CAP_DEFAULT;
                const debrisEntries = debrisCap > 0 && snapshot.entries.length > debrisCap
                    ? snapshot.entries.filter((_, index) => index % Math.ceil(snapshot.entries.length / debrisCap) === 0)
                    : snapshot.entries;
                debrisEntries.forEach(entry => {
                    const pieceColor = profile.preserveSourceColor
                        ? entry.color
                        : colors[Math.floor(Math.random() * colors.length)];
                    const burstCopies = 1;
                    for (let j = 0; j < burstCopies; j++) {
                        debris.push({
                            x: entry.worldX,
                            y: entry.worldY,
                            vx: (Math.random() - 0.5) * (profile.debrisVelocity || 1000),
                            vy: (Math.random() - 0.5) * (profile.debrisVelocity || 1000),
                            char: entry.char,
                            color: pieceColor,
                            life: profile.debrisLife || 1.5
                        });
                    }
                });
                const ringConfigs = profile.rings || [];
                for (let i = 0; i < ringConfigs.length; i++) {
                    bombBlastRings.push({
                        x: centerX,
                        y: centerY,
                        life: 0,
                        ...ringConfigs[i]
                    });
                }
                const burstCount = profile.burstCount || 0;
                const burstColors = profile.burstColors || colors;
                const burstChars = profile.burstChars || ['*', '#', '+', 'x'];
                for (let i = 0; i < burstCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 230 + Math.random() * 500;
                    debris.push({
                        x: centerX + Math.cos(angle) * (10 + Math.random() * 35),
                        y: centerY + Math.sin(angle) * (10 + Math.random() * 35),
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        char: burstChars[i % burstChars.length],
                        color: burstColors[i % burstColors.length],
                        life: 0.5 + Math.random() * 0.32,
                        isImpact: true
                    });
                }
            } else {
                for (let j = 0; j < 50; j++) {
                    debris.push({
                        x: bossObj.x + (Math.random() - 0.5) * 150, y: bossObj.y + (Math.random() - 0.5) * 150,
                        vx: (Math.random() - 0.5) * 1500, vy: (Math.random() - 0.5) * 1500,
                        char: ['*', '#', '@', '░'][Math.floor(Math.random() * 4)], 
                        color: colors[Math.floor(Math.random() * colors.length)], life: 2.0
                    });
                }
            }
            
            const totalBossXp = Math.floor(player.xpNeeded * 1.2);
            const numOrbs = Math.floor(Math.sqrt(bossObj.maxHp / 10)); // Adjust orb count based on scaled HP
            const xpPerOrb = Math.floor(totalBossXp / numOrbs);
            const remainder = totalBossXp % numOrbs;
            for(let i=0; i < numOrbs; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 40;
                const speed = 40 + Math.random() * 120;
                xpOrbs.push({ 
                    x: bossObj.x + Math.cos(angle) * dist, 
                    y: bossObj.y + Math.sin(angle) * dist, 
                    vx: Math.cos(angle) * speed, 
                    vy: Math.sin(angle) * speed, 
                    char: ['⣶', '⣾', '⣿'][Math.floor(Math.random() * 3)], 
                    color: '#ffffff',
                    xpValue: xpPerOrb + (i < remainder ? 1 : 0)
                });
            }
            
            addShake(25); registerBossComboBreak(bossObj, 20000);
            applyWakeForce(bossObj.x, bossObj.y, 400, 50);
        }

        function radialExplosion(x, y, radius, damage, visualDebrisCount = 20, options = {}) {
            const wakeStrength = options.wakeStrength ?? 35;
            const shakeAmount = options.shakeAmount ?? (radius / 8);
            applyWakeForce(x, y, radius, wakeStrength);
            if (shakeAmount > 0) addShake(shakeAmount);
            const colors = ['#ff4400', '#ff6600', '#ff2200', '#ffaa00'];
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (!isEnemyDamageable(e)) continue;
                if (doesCircleHitTargetMask(x, y, radius, e)) {
                    e.hp -= damage;
                    e.flashTimer = 0.15;
                    if (e.hp <= 0) {
                        resolveWaveEnemy(e);
                        explodeEnemy(e);
                        enemies.splice(i, 1);
                    }
                }
            }
            if (boss && boss.phase === 'ACTIVE') {
                if (boss.isSurvivorBoss) {
                    if (doesCircleHitTargetMask(x, y, radius, boss)) {
                        boss.hp -= damage;
                        boss.flashTimer = 0.15;
                        if (boss.hp <= 0 && typeof killSurvivorBoss === 'function') killSurvivorBoss(boss);
                    }
                } else if (boss.name === 'OVERHEATING FIREWALL') {
                    if (boss.isVulnerable && Math.hypot(boss.x - x, (boss.y + FIREWALL_BOSS_CORE_OFFSET_Y) - y) < radius + 40) {
                        boss.hp -= damage;
                        boss.flashTimer = 0.15;
                        if (maybeTriggerBossDeathCinematic(boss)) return;
                    }
                } else if ((boss.name === 'GHOST SIGNAL' && radius >= 60)
                    ? doesCircleHitTargetBounds(x, y, radius, boss)
                    : doesCircleHitTargetMask(x, y, radius, boss)) {
                    const shieldBlocks = isBossDamageShielded(boss);
                    const damageScale = shieldBlocks ? 0 : getBlackVoidDamageScale(x, y);
                    boss.hp -= damage * damageScale;
                    if (damageScale < 1 && !shieldBlocks) absorbBlackVoidProjectile(x, y, 2);
                    boss.flashTimer = 0.15;
                    if (maybeTriggerBossDeathCinematic(boss)) return;
                }
            }
            for (let i = 0; i < visualDebrisCount; i++) {
                debris.push({
                    x, y, vx: (Math.random()-0.5)*radius*4, vy: (Math.random()-0.5)*radius*4,
                    char: '#', color: colors[Math.floor(Math.random() * colors.length)], life: 0.8
                });
            }
        }

        const BOMB_SHRAPNEL_STATS = { ...createBaseWeaponStats(), sizeMult: 0.72 };

        function spawnBombExplosion(x, y) {
            const bombRadius = BOMB_EXPLOSION_RADIUS * (1 + (player.modifiers.bombRadius || 0));
            const damageScale = getPlayerDamageScale();
            const bombDamage = BOMB_EXPLOSION_DAMAGE * (1 + (player.modifiers.bombDamage || 0)) * damageScale;
            const shrapnelDamage = BOMB_SHRAPNEL_DAMAGE * (1 + (player.modifiers.bombDamage || 0) * 0.5) * damageScale;
            radialExplosion(x, y, bombRadius, bombDamage, 10);
            addShake(16 + bombRadius * 0.04);

            const ringConfigs = [
                { color: '#8ff7ff', maxRadius: bombRadius * 0.92, maxLife: 0.34, lineWidth: 5, shadowBlur: 14 },
                { color: '#4fb6ff', maxRadius: bombRadius * 1.2, maxLife: 0.48, lineWidth: 3, shadowBlur: 12 },
                { color: '#eaa4ff', maxRadius: bombRadius * 1.42, maxLife: 0.58, lineWidth: 2, shadowBlur: 10 }
            ];
            for (let i = 0; i < ringConfigs.length; i++) {
                bombBlastRings.push({
                    x,
                    y,
                    life: 0,
                    ...ringConfigs[i]
                });
            }

            const plasmaColors = ['#ffffff', '#8ff7ff', '#56a6ff', '#d986ff'];
            const plasmaChars = ['✦', '✧', '*', '•', '░'];
            for (let i = 0; i < 34; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 120 + Math.random() * 520;
                debris.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    char: plasmaChars[Math.floor(Math.random() * plasmaChars.length)],
                    color: plasmaColors[Math.floor(Math.random() * plasmaColors.length)],
                    life: 0.7 + Math.random() * 0.35
                });
            }

            for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 90 + Math.random() * 180;
                thrusterParticles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    char: ['░', '▒', '*', '·'][Math.floor(Math.random() * 4)],
                    color: ['#7ddfff', '#5ab7ff', '#f4fbff', '#d884ff'][Math.floor(Math.random() * 4)],
                    life: 0.55 + Math.random() * 0.2,
                    isSmoke: true
                });
            }

            for (let i = 0; i < BOMB_SHRAPNEL_COUNT; i++) {
                const angle = (Math.PI * 2 * i) / BOMB_SHRAPNEL_COUNT + (Math.random() - 0.5) * 0.22;
                const speed = BOMB_SHRAPNEL_SPEED_MIN + Math.random() * (BOMB_SHRAPNEL_SPEED_MAX - BOMB_SHRAPNEL_SPEED_MIN);
                comboProjectiles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    baseVx: Math.cos(angle) * speed,
                    baseVy: Math.sin(angle) * speed,
                    startX: x,
                    startY: y,
                    sprite: i % 2 === 0 ? '•' : '·',
                    color: i % 3 === 0 ? '#fff4bc' : (i % 2 === 0 ? '#a7f4ff' : '#c58dff'),
                    stats: { ...BOMB_SHRAPNEL_STATS },
                    life: BOMB_SHRAPNEL_LIFE,
                    maxLife: BOMB_SHRAPNEL_LIFE,
                    damage: shrapnelDamage,
                    pierceHits: [],
                    pierceCount: 0,
                    isBombShrapnel: true
                });
            }
        }

        function spawnMiniTorpedoExplosion(x, y, projectile) {
            const stats = projectile.stats || createBaseWeaponStats();
            const radius = stats.torpedoExplosionRadius || 58;
            const damage = (projectile.damage || 10) * (stats.torpedoExplosionDamageMult || 0.85);
            const visualLoad = bombBlastRings.length + debris.length / 80;
            const visualDebrisCount = visualLoad > 18 ? 2 : (visualLoad > 10 ? 4 : Math.min(stats.splashVisualDebris ?? 6, 6));
            radialExplosion(x, y, radius, damage, visualDebrisCount, { shakeAmount: 0, wakeStrength: 18 });

            let miniRingCount = 0;
            for (let i = bombBlastRings.length - 1; i >= 0; i--) {
                if (bombBlastRings[i].isMiniTorpedoRing) miniRingCount++;
                if (miniRingCount > 22) bombBlastRings.splice(i, 1);
            }

            bombBlastRings.push({
                x,
                y,
                life: 0,
                color: '#ffb347',
                maxRadius: radius * 1.05,
                maxLife: 0.24,
                lineWidth: 2,
                shadowBlur: 10,
                isMiniTorpedoRing: true
            });
            bombBlastRings.push({
                x,
                y,
                life: 0,
                color: '#ff5f57',
                maxRadius: radius * 1.35,
                maxLife: 0.34,
                lineWidth: 1.5,
                shadowBlur: 8,
                isMiniTorpedoRing: true
            });

            const colors = ['#fff1a8', '#ffb347', '#ff5f57', '#f7f7ff'];
            const chars = ['*', '+', '.', 'o'];
            const sparkCount = visualLoad > 18 ? 3 : (visualLoad > 10 ? 5 : 8);
            for (let i = 0; i < sparkCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 90 + Math.random() * 240;
                debris.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    char: chars[i % chars.length],
                    color: colors[i % colors.length],
                    life: 0.28 + Math.random() * 0.22,
                    isImpact: true
                });
            }
        }

        function fireCombo(baseAngle = getPlayerFireAngle()) {
            let s = player.weaponStats;
            let baseDmg = (10 * s.damageMult + player.modifiers.laserDamage) * getPlayerDamageScale();
            if (player.hp < player.maxHp * 0.5) baseDmg *= (1 + player.modifiers.adrenaline);

            const speed = 1400 * s.speedMult;
            const layout = getPlayerRenderLayout(player, getPlayerFacing(player));
            let frontOrigin = getPlayerWeaponOrigin(layout, false);
            let rearOrigin = getPlayerWeaponOrigin(layout, true);
            if (typeof isSurvivorModeActive === 'function' && isSurvivorModeActive() && typeof getSurvivorWeaponOrigin === 'function') {
                frontOrigin = getSurvivorWeaponOrigin(false);
                rearOrigin = getSurvivorWeaponOrigin(true);
            }

            function spawnBullet(x, y, vx, vy, isRear, options = {}) {
                let pdmg = isRear ? baseDmg * 1.25 : baseDmg;
                const projectileStats = { ...s };
                const launchAngle = Math.atan2(vy, vx);
                const orbitDelay = projectileStats.orbitDelay || 0;
                const orbiting = orbitDelay > 0;
                const returning = projectileStats.returning;
                const projectileSpeed = Math.hypot(vx, vy);
                const isPlasmaCloud = !!projectileStats.plasmaCloud;
                const isMiniTorpedo = !!projectileStats.miniTorpedo;
                const isBurstRound = !!options.isBurstRound && !isPlasmaCloud && !isMiniTorpedo && !projectileStats.lightningBall;
                const orbitSpin = isRear ? -9.5 : 9.5;
                const projectileLife = orbiting ? Math.max(2.45, orbitDelay + 1.55) : (isPlasmaCloud ? 2.5 : (isMiniTorpedo ? 1.6 : 2.0));
                if (isPlasmaCloud && projectileStats.critChance > 0) {
                    pdmg *= getAveragedCriticalDamageMult(projectileStats, 0.75);
                }
                const canCrit = projectileStats.critChance > 0 && !isPlasmaCloud;
                const isCrit = canCrit && Math.random() < projectileStats.critChance;
                if (isCrit) pdmg *= projectileStats.critDamageMult || 1;
                const isRicochetShard = projectileStats.ricochetCount > 0
                    && !projectileStats.lightningBall && !isPlasmaCloud && !isMiniTorpedo
                    && s.pathFunction !== 'parabolic' && s.pathFunction !== 'sine'
                    && !orbiting && !returning;
                const baseSprite = projectileStats.lightningBall || isPlasmaCloud ? '' : (isMiniTorpedo ? 'o' : (s.pathFunction === 'parabolic' ? '◓' : (orbiting ? '☼' : (returning ? '✚' : (isRicochetShard ? '◇' : (isBurstRound ? '!' : '|'))))));
                const baseColor = isPlasmaCloud ? '#66f2ff' : (isMiniTorpedo ? '#ffb347' : (projectileStats.lightningBall ? '#8ff7ff' : (orbiting ? '#ffcf6d' : (returning ? '#77ffe7' : (isRicochetShard ? '#9bf7ff' : (isBurstRound ? '#dcb6ff' : '#ffffff'))))));
                comboProjectiles.push({
                    x, y,
                    vx: orbiting ? 0 : vx,
                    vy: orbiting ? 0 : vy,
                    baseVx: orbiting ? 0 : vx,
                    baseVy: orbiting ? 0 : vy,
                    startX: x, startY: y,
                    sprite: baseSprite,
                    color: isCrit && !isMiniTorpedo && !projectileStats.lightningBall ? '#ff8eaa' : baseColor,
                    stats: projectileStats,
                    life: projectileLife,
                    maxLife: projectileLife,
                    damage: pdmg,
                    isCrit,
                    isBurstRound,
                    releaseDelay: options.releaseDelay || 0,
                    isRicochetShard,
                    bouncesUsed: 0,
                    pierceHits: [],
                    pierceCount: isPlasmaCloud ? Math.max(s.pierceCount, 999) : s.pierceCount,
                    isLightningBall: !!projectileStats.lightningBall,
                    isPlasmaCloud,
                    isMiniTorpedo,
                    visualSeed: Math.random() * 1000,
                    cloudSparkTimer: 0,
                    releaseAge: 0,
                    cloudCurveSeed: Math.random() * Math.PI * 2,
                    cloudCurveFrequency: 1.6 + Math.random() * 1.1,
                    cloudCurveStrength: isPlasmaCloud
                        ? (projectileStats.cloudCurveStrength || 0) * (0.65 + Math.random() * 0.7) * (Math.random() < 0.5 ? -1 : 1)
                        : 0,
                    age: 0,
                    spinSpeed: (isRear ? -1 : 1) * (8.5 + Math.random() * 2.5),
                    orbitTime: orbitDelay,
                    orbitHoldTime: orbitDelay,
                    orbitAngle: launchAngle,
                    orbitRadius: (isRear ? 42 : 34) * (projectileStats.orbitRadiusMult || 1),
                    orbitSpin,
                    releaseAngle: launchAngle,
                    releaseSpeed: projectileSpeed,
                    hasReturned: false
                });
            }

            const angles = getFirePatternAngles(s, baseAngle);

            const burstCount = s.burstFire ? Math.max(1, Math.floor(s.burstCount || 3)) : 1;
            const burstSpacing = s.burstSpacing || 0.045;
            const burstMin = s.burstAngleMin || 0.017;
            const burstMax = Math.max(burstMin, s.burstAngleMax || 0.052);

            for (let a of angles) {
                for (let burstIndex = 0; burstIndex < burstCount; burstIndex++) {
                    const burstJitter = s.burstFire
                        ? (burstMin + Math.random() * (burstMax - burstMin)) * (Math.random() < 0.5 ? -1 : 1)
                        : 0;
                    let aSpread = a + burstJitter + (Math.random() - 0.5) * s.inaccuracy;
                    spawnBullet(frontOrigin.x, frontOrigin.y, Math.cos(aSpread) * speed, Math.sin(aSpread) * speed, false, {
                        isBurstRound: s.burstFire,
                        releaseDelay: s.burstFire ? burstIndex * burstSpacing : 0
                    });
                }
            }

            const rearEvery = Math.max(1, Math.floor(s.rearFireEvery || 2));
            if (s.hasRearFire && (player.rearFireTicker++ % rearEvery === 0)) {
                const rearFan = Math.max(1, Math.floor(s.rearFireFan || 1));
                const rearSpread = s.rearFireSpread || 0;
                const rearFanCount = angles.length <= 2 ? rearFan : 1;
                for (let a of angles) {
                    for (let fanIndex = 0; fanIndex < rearFanCount; fanIndex++) {
                        const fanOffset = rearFanCount === 1 ? 0 : ((fanIndex / (rearFanCount - 1)) - 0.5) * rearSpread;
                        let ra = a + Math.PI + fanOffset + (Math.random() - 0.5) * s.inaccuracy;
                        spawnBullet(rearOrigin.x, rearOrigin.y, Math.cos(ra) * speed, Math.sin(ra) * speed, true);
                    }
                }
            }

            player.lastFire = currentFrameNow;
            addShake(1);
        }

        function fireBomb() {
            const survivorMode = typeof isSurvivorModeActive === 'function' && isSurvivorModeActive();
            const origin = survivorMode && typeof getSurvivorWeaponOrigin === 'function'
                ? getSurvivorWeaponOrigin(false)
                : getPlayerBombIndicatorOrigin();
            const indicatorVisual = getPlayerBombIndicatorVisual();
            player.bombTimer = getPlayerBombCooldownTotal();
            recordRunBombUsed();
            const angle = survivorMode && typeof getSurvivorPlayerAimAngle === 'function'
                ? getSurvivorPlayerAimAngle()
                : getPlayerFireAngle();
            const vx = Math.cos(angle) * BOMB_GRENADE_SPEED;
            const vy = Math.sin(angle) * BOMB_GRENADE_SPEED;
            bombProjectiles.push({
                x: origin.x,
                y: origin.y,
                startX: origin.x,
                startY: origin.y,
                vx,
                vy,
                angle,
                distance: 0,
                maxDistance: BOMB_GRENADE_RANGE,
                pulse: Math.random() * Math.PI * 2,
                age: 0,
                launchColor: indicatorVisual.color,
                launchColorDuration: 0.5,
                justFired: true
            });
            addShake(12);
            for (let i = 0; i < 10; i++) {
                const spread = (Math.random() - 0.5) * 0.7;
                const speed = 80 + Math.random() * 160;
                thrusterParticles.push({
                    x: origin.x,
                    y: origin.y,
                    vx: Math.cos(angle + Math.PI + spread) * speed,
                    vy: Math.sin(angle + Math.PI + spread) * speed,
                    char: ['░', '▒', '*'][Math.floor(Math.random() * 3)],
                    color: ['#8aefff', '#ffffff', '#9f6cff'][Math.floor(Math.random() * 3)],
                    life: 0.32 + Math.random() * 0.18,
                    isSmoke: true
                });
            }
        }

        function initArrays(size) {
            fpHX = new Float32Array(size); fpHY = new Float32Array(size);
            fpX = new Float32Array(size); fpY = new Float32Array(size);
            fpVX = new Float32Array(size); fpVY = new Float32Array(size);
            fpChar = new Uint8Array(size); fpColor = new Uint8Array(size);
            fpAlpha = new Float32Array(size); fpHighlight = new Float32Array(size);
            fpDepth = new Float32Array(size); fpWobblePhase = new Float32Array(size); fpTwinkle = new Float32Array(size);
        }

        function resize() {
            const MIN_HUD_SCALE = 0.52;
            const MAX_HUD_SCALE = 1.45;
            const MIN_HUD_HEIGHT = 32;
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            const targetRatio = LOGICAL_W / LOGICAL_H;
            const availableW = Math.max(0, winW - CANVAS_BORDER * 2);
            const getDisplaySize = (hudPixelHeight) => {
                const availableH = Math.max(0, winH - hudPixelHeight - CANVAS_BORDER * 2);
                if (availableW <= 0 || availableH <= 0) return { displayW: 0, displayH: 0 };
                if (availableW / availableH > targetRatio) {
                    const displayH = availableH;
                    return { displayW: displayH * targetRatio, displayH };
                }
                const displayW = availableW;
                return { displayW, displayH: displayW / targetRatio };
            };

            let hudH = HUD_HEIGHT;
            let { displayW, displayH } = getDisplaySize(hudH);
            let hudScale = Math.max(MIN_HUD_SCALE, Math.min(MAX_HUD_SCALE, displayW / LOGICAL_W));
            hudH = Math.max(MIN_HUD_HEIGHT, Math.round(HUD_HEIGHT * hudScale));
            ({ displayW, displayH } = getDisplaySize(hudH));
            hudScale = Math.max(MIN_HUD_SCALE, Math.min(MAX_HUD_SCALE, displayW / LOGICAL_W));
            hudH = Math.max(MIN_HUD_HEIGHT, Math.round(HUD_HEIGHT * hudScale));
            ({ displayW, displayH } = getDisplaySize(hudH));

            const cssCanvasW = Math.round(displayW);
            const cssCanvasH = Math.round(displayH);
            const outerCanvasW = cssCanvasW + CANVAS_BORDER * 2;
            const outerCanvasH = cssCanvasH + CANVAS_BORDER * 2;
            canvas.style.width = `${outerCanvasW}px`;
            canvas.style.height = `${outerCanvasH}px`;

            const container = document.getElementById('game-container');
            const fullscreenContainer = document.fullscreenElement === container;
            if (fullscreenContainer) {
                container.style.width = '100vw';
                container.style.height = '100vh';
                canvas.style.position = 'absolute';
                canvas.style.left = '50%';
                canvas.style.top = '50%';
                canvas.style.transform = 'translate(-50%, -50%)';
                hud.style.left = '50%';
                hud.style.bottom = `${Math.max(0, Math.round((winH - outerCanvasH) / 2))}px`;
                hud.style.transform = 'translateX(-50%)';
            } else {
                container.style.width = `${outerCanvasW}px`;
                container.style.height = `${outerCanvasH}px`;
                canvas.style.position = '';
                canvas.style.left = '';
                canvas.style.top = '';
                canvas.style.transform = '';
                hud.style.left = '0';
                hud.style.bottom = '0';
                hud.style.transform = '';
            }
            hud.style.width = `${outerCanvasW}px`;
            hud.style.maxWidth = `${outerCanvasW}px`;
            document.documentElement.style.setProperty('--hud-ui-scale', hudScale.toFixed(3));
            document.documentElement.style.setProperty('--hud-height', `${hudH}px`);
            hudWeaponCellSize = Math.max(6, Math.min(16, Math.round(12 * hudScale)));
            document.documentElement.style.setProperty('--hud-weapon-cell', `${hudWeaponCellSize}px`);

            width = LOGICAL_W; height = LOGICAL_H;
            canvas.width = LOGICAL_W; canvas.height = LOGICAL_H;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.font = `${FONT_SIZE}px Courier New`;
            ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
            const metrics = ctx.measureText('0');
            charW = Math.max(1, Math.round(metrics.width));
            charH = Math.max(1, Math.round(FONT_SIZE * 1.2));
            rebuildField();
        }

        function rebuildField() {
            const cols = Math.ceil(width / CELL_SIZE) + 2;
            const rows = Math.ceil(height / CELL_SIZE) + 2;
            numParticles = Math.min(cols * rows, 8000);
            initArrays(numParticles);
            let i = 0;
            for (let y = -1; y <= rows; y++) {
                for (let x = -1; x <= cols; x++) {
                    if (i >= numParticles) break;
                    const depth = 0.22 + Math.random() * 0.78;
                    fpHX[i] = x * CELL_SIZE + (Math.random() - 0.5) * CELL_SIZE * 0.64;
                    fpHY[i] = y * CELL_SIZE + (Math.random() - 0.5) * CELL_SIZE * 0.64;
                    fpX[i] = fpHX[i]; fpY[i] = fpHY[i];
                    fpChar[i] = Math.floor(Math.random() * PARTICLE_CHARS.length);
                    fpColor[i] = Math.random() < 0.08 ? 1 : 0;
                    fpDepth[i] = depth;
                    fpAlpha[i] = 0.10 + depth * 0.34 + Math.random() * 0.12;
                    fpWobblePhase[i] = Math.random() * Math.PI * 2;
                    fpTwinkle[i] = Math.random() * Math.PI * 2;
                    fpHighlight[i] = 0;
                    i++;
                }
            }
        }

        function buildSpatialHash() {
            spatialHash.clear();
            for (let i = 0; i < numParticles; i++) {
                const cx = (fpX[i] / HASH_SIZE) | 0;
                const cy = (fpY[i] / HASH_SIZE) | 0;
                const key = (cx << 12) | (cy & 0xFFF);
                let cell = spatialHash.get(key);
                if (!cell) { cell = []; spatialHash.set(key, cell); }
                cell.push(i);
            }
        }

        function applyWakeForce(px, py, radius, forceAmt) {
            const rSq = radius * radius;
            const minX = Math.floor((px - radius) / HASH_SIZE), maxX = Math.floor((px + radius) / HASH_SIZE);
            const minY = Math.floor((py - radius) / HASH_SIZE), maxY = Math.floor((py + radius) / HASH_SIZE);
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const key = (x << 12) | (y & 0xFFF);
                    const indices = spatialHash.get(key);
                    if (!indices) continue;
                    for (let i = 0; i < indices.length; i++) {
                        const idx = indices[i];
                        const dx = fpX[idx] - px, dy = fpY[idx] - py;
                        const dSq = dx * dx + dy * dy;
                        if (dSq < rSq && dSq > 0.1) {
                            const dist = Math.sqrt(dSq);
                            const influence = 1 - dist / radius;
                            const depth = fpDepth ? fpDepth[idx] || 1 : 1;
                            const force = influence * forceAmt * FIELD_WAKE_FORCE_SCALE * (0.28 + depth * 0.72);
                            fpVX[idx] += (dx / dist) * force; fpVY[idx] += (dy / dist) * force;
                            const brighten = influence * Math.min(FIELD_HIGHLIGHT_MAX, FIELD_WAKE_HIGHLIGHT_BASE + forceAmt * FIELD_WAKE_HIGHLIGHT_SCALE);
                            fpHighlight[idx] = Math.min(FIELD_HIGHLIGHT_MAX, Math.max(fpHighlight[idx], brighten));
                        }
                    }
                }
            }
        }

        function getExhaustColor(life) {
            let r, g, b;
            if (life > 0.6) {
                const t = (life - 0.6) / 0.4;
                r = 255;
                g = Math.floor(102 + t * (255 - 102));
                b = Math.floor(0 + t * (255 - 0));
            } else {
                const t = Math.max(0, life) / 0.6;
                r = Math.floor(0 + t * (255 - 0));
                g = Math.floor(68 + t * (102 - 68));
                b = Math.floor(255 + t * (0 - 255));
            }
            return `rgb(${r},${g},${b})`;
        }

        function getGuardianFlameColor(life) {
            if (life > 0.66) return '#ffdd00';
            if (life > 0.33) return '#e38914';
            return '#e01926';
        }

        function getWraithFlameColor(life) {
            const t = Math.max(0, Math.min(1, (life || 0) / 0.78));
            const eased = t * t * (3 - 2 * t);
            const r = Math.round(16 + (244 - 16) * eased);
            const g = Math.round(19 + (251 - 19) * eased);
            const b = Math.round(23 + (255 - 23) * eased);
            return `rgb(${r},${g},${b})`;
        }

        function getSpriteGlyphColor(spriteColors, row, col, fallbackColor) {
            if (!spriteColors || !spriteColors[row]) return fallbackColor;
            return spriteColors[row][col] || fallbackColor;
        }

        function drawAsciiSprite(sprite, startX, startY, fallbackColor, spriteColors = null, flashColor = null, spriteColorFn = null) {
            let lastColor = null;
            for (let r = 0; r < sprite.length; r++) {
                const row = sprite[r];
                const y = quantizeGlyphCoord(startY + r * charH);
                let x = startX;
                for (let c = 0; c < row.length; c++) {
                    const char = row[c];
                    if (char !== ' ') {
                        const color = flashColor || (spriteColorFn ? spriteColorFn(sprite, r, c, fallbackColor) : getSpriteGlyphColor(spriteColors, r, c, fallbackColor));
                        if (color !== lastColor) {
                            ctx.fillStyle = color;
                            lastColor = color;
                        }
                        ctx.fillText(char, quantizeGlyphCoord(x), y);
                    }
                    x += charW;
                }
            }
        }

        function getHudOverlayInset(padding = 0) {
            return HUD_HEIGHT + padding;
        }

        function getGameplayBottomLimit(margin = 50) {
            return height - HUD_HEIGHT - margin;
        }

        function getDropRestY() {
            return getGameplayBottomLimit(30);
        }

        function getBossBarLayout() {
            const barW = Math.min(width * 0.86, width - 64);
            const barH = 12;
            const barX = width / 2 - barW / 2;
            const playfieldH = height - HUD_HEIGHT;
            const cameraScale = typeof bossCameraZoomScale === 'number' && Number.isFinite(bossCameraZoomScale)
                ? Math.max(0.5, Math.min(1, bossCameraZoomScale))
                : 1;
            const centerY = playfieldH / 2;
            const screenGap = 10;
            const desiredScreenTop = playfieldH - screenGap - barH * cameraScale;
            const barY = centerY + (desiredScreenTop - centerY) / cameraScale;
            return {
                barW,
                barH,
                barX,
                barY,
                nameY: barY - 15
            };
        }

        function prepareRunStateForLaunch() {
            if (typeof setActiveGameMode === 'function') setActiveGameMode('campaign');
            if (typeof resetSurvivorRuntimeStateForCampaign === 'function') resetSurvivorRuntimeStateForCampaign();
            teardownBossCinematic();
            if (typeof resetRunCompleteTransition === 'function') resetRunCompleteTransition();
            resetRunStats();
            score = 0;
            comboCount = 0;
            comboPeak = 0;
            comboEventSerial = 0;
            comboEventType = 'idle';
            comboEventText = '';
            comboEventAt = 0;
            comboFocusNoticeText = '';
            comboFocusNoticeAt = 0;
            comboFocusNoticeX = 0;
            comboFocusNoticeY = 0;
            if (typeof WaveManager.prepareGalaxyRun === 'function') {
                WaveManager.prepareGalaxyRun(currentGalaxyIndex);
            } else {
                WaveManager.currentWave = 0;
                WaveManager.waveDelay = 0;
                WaveManager.hasSpawnedWave = false;
                WaveManager.interWaveDelayQueued = false;
                WaveManager.pendingFormationUnits = 0;
                WaveManager.activeFormationId = 0;
                WaveManager.formationId = 0;
                WaveManager.randomizeEarlyProceduralWaves();
                WaveManager.randomizeFlyByAssignments();
                WaveManager.randomizeSignalDrifts();
            }
            waveSignalNotice = null;
            enemies = []; boss = null; enemyBullets = []; comboProjectiles = []; bombProjectiles = []; bombBlastRings = [];
            drops = []; debris = []; xpOrbs = []; thrusterParticles = [];
            deathTimer = 0; launchTimer = 0; playerExploded = false;
            shake = 0; wobble = 0;
            if (typeof resetFocusAbilities === 'function') resetFocusAbilities();
            levelUpState = 'INTRO'; offeredOptions = []; selectedOptionIndex = 0; levelUpTimer = 0;
            queuedConsoleLevels = 0;
            player.x = width / 2; player.y = Math.min(height * 0.8, getGameplayBottomLimit(150));
            player.vx = 0; player.vy = 0;
            player.shipId = getSelectedShipConfig().id;
            player.hp = getPlayerBaseMaxHp(); player.maxHp = getPlayerBaseMaxHp();
            player.xp = 0; player.xpNeeded = 10; player.level = 1;
            player.stats = { L: 1, M: 0, B: 0 };
            player.modifiers = typeof createBasePlayerModifiers === 'function'
                ? createBasePlayerModifiers()
                : { moveSpeed: 0, maxHp: 0, laserDamage: 0, hitbox: 1, fireRate: 0, hpRegen: 0, invincibility: 0, adrenaline: 0, magnet: 0, bombCooldown: 1, bombDamage: 0, bombRadius: 0, momentumFireRate: 0, xpHeal: 0, damageMult: 0, killHeal: 0, xpGain: 0, focusMax: 0, focusRegen: 0, focusRegenDelay: 1, focusLockout: 1, focusDrop: 0, focusDriveDrain: 1, focusDriveSlow: 0, focusDriveTransition: 0, focusSpecterDrain: 1, focusSpecterShrink: 0, focusSpecterTransition: 0 };
            player.weaponStats = createBaseWeaponStats();
            player.weapons = [];
            weaponWeights = {};
            WEAPON_POOL.forEach(w => weaponWeights[w.name] = 1.0);
            player.drones = [];
            player.isBeaming = false; player.isFiring = false; player.rearFireTicker = 0;
            player.beamAngle = PLAYER_FIRE_FORWARD_ANGLE; player.beamTargetAngle = PLAYER_FIRE_FORWARD_ANGLE;
            player.beamDeploy = 0;
            player.bombTimer = 0; player.bombCooldown = BOMB_BASE_COOLDOWN;
            player.godMode = false;
            player.invincibilityTimer = 0; player.flashTimer = 0;
            applySelectedShipToPlayer({ heal: true });
            player.lastFire = 0;
            player._renderLayoutCache = null;
            stopMusic();
            clearPauseVolumePreview();
            applyCurrentVolume();
            pauseState = 'MAIN'; pauseSelection = 0; pausePowerupSelection = 0;
            pausePowerupBarAnim.mode = 'idle';
            pausePowerupBarAnim.startTime = 0;
            pausePowerupBarAnim.closeTime = 0;
            resetPauseMenuShipCursor();
            postResumeBombLockTimer = 0;
        }

        function resetGame() {
            prepareRunStateForLaunch();
            titleAlpha = 0; autoLaunch = true;
            restartLoadingSequence = true;
            gameState = 'START';
        }
