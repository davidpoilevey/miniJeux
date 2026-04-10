/**
 * InteractionSystem
 * Gère toutes les interactions entre organismes :
 * - Predator  : attaque, mange une cellule, drain progressif
 * - Cannibalism : idem mais cible congénères affaiblis
 * - Parasite  : drain progressif sans détruire de cellule
 * - Symbiosis : échange mutuel d'énergie entre adjacents
 *
 * Détection :
 * - Adjacence directe (tous)
 * - Portée capteur Eye/Antenna si présent (Predator/Cannibalism uniquement — le nav s'en charge déjà,
 *   ici on traite uniquement l'acte d'attaque/drain au contact)
 */
export class InteractionSystem {
    constructor(entityManager, ocean) {
        this.em = entityManager;
        this.ocean = ocean;

        // Ensemble des paires symbiose déjà traitées ce tick (évite double traitement)
        this._symbioPairs = new Set();
    }

    update(deltaTime) {
        this._symbioPairs.clear();
 this._toDestroy=[];
        const organisms = this.em.getEntitiesWithComponents(['Position', 'BodyPlan', 'Metabolism']);

        for (const eid of organisms) {
            const metabolism = this.em.getComponent(eid, 'Metabolism');
            if (metabolism.isDormant) continue;

            if (this.em.hasComponent(eid, 'Predator')) this._predatorAct(eid, metabolism);
            if (this.em.hasComponent(eid, 'Cannibalism')) this._cannibalAct(eid, metabolism);
            if (this.em.hasComponent(eid, 'Parasite')) this._parasiteAct(eid, metabolism, deltaTime);
            if (this.em.hasComponent(eid, 'Symbiosis')) this._symbiosisAct(eid, metabolism);
        }
         for (const eid of this._toDestroy) {
            this._killPrey(eid);
        }
    }

    // ── PREDATOR ───────────────────────────────────────────────────────────────

    _predatorAct(eid, metabolism) {
        // Pas faim → pas d'attaque
        if (metabolism.energyStored > metabolism.maxEnergyStored * 0.98) return;

        const mySize = this._cellCount(eid);
        const adjacent = this._getAdjacentEntities(eid);

        for (const target of adjacent) {
            if (target === eid) continue;
            if (!this.em.hasComponent(target, 'Metabolism')) continue;

            const targetSize = this._cellCount(target);
            // Ne s'attaque qu'à plus petit ou équivalent (90%)
            if (targetSize > mySize * 0.9) continue;
            // Pas de cannibalisme ici (géré séparément)
            if (this._isSameSpecies(eid, target)) continue;

            this._attack(eid, target, metabolism);
            break; // Une attaque par tick
        }
    }

    // ── CANNIBALISM ────────────────────────────────────────────────────────────

    _cannibalAct(eid, metabolism) {
        if (metabolism.energyStored > metabolism.maxEnergyStored * 0.5) return;

        const adjacent = this._getAdjacentEntities(eid);

        for (const target of adjacent) {
            if (target === eid) continue;
            if (!this.em.hasComponent(target, 'Metabolism')) continue;

            // Cible uniquement les congénères affaiblis
            const targetMeta = this.em.getComponent(target, 'Metabolism');
            if (targetMeta.energyStored > targetMeta.maxEnergyStored * 0.3) continue;

            this._attack(eid, target, metabolism);
            break;
        }
    }

    // ── ATTAQUE (Predator + Cannibalism) ──────────────────────────────────────

    /**
     * Tentative d'attaque : probabilité modulée par Jaw (attaquant) et Carapace (défenseur).
     * Si succès : retire une cellule aléatoire de la proie, l'attaquant gagne l'énergie.
     * Spine : contre-dommages à l'attaquant si présent.
     */
    _attack(eid, target, metabolism) {
        // Probabilité de base
        let hitChance = 0.4;

        // Jaw amplifie l'attaque
        if (this.em.hasComponent(eid, 'Jaw')) {
            const jaw = this.em.getComponent(eid, 'Jaw');
            hitChance += (jaw.handleSize) * 0.1; // +0 à +0.4
        }
        if (this.em.hasComponent(eid, 'Tentacle')) {
            const tent = this.em.getComponent(eid, 'Tentacle');
            hitChance += 0.1 * (tent.count ?? 1); // Chaque tentacule aide
            // Si proie adjacente tente de fuir, le tentacule la retient
            const targetNav = this.em.getComponent(target, 'Navigation');
            if (targetNav) {
                targetNav.confusionFactor = 0.4;
                targetNav.confusionTicks = 5; // Brève immobilisation
            }
        }
        // Projette confusion sur tous les voisins dans cloudRadius
        if (this.em.hasComponent(target, 'Ink')) {
            const ink = this.em.getComponent(target, 'Ink');
            const nearby = this._getNearbyInRadius(target, ink.cloudRadius ?? 3);
            const pos = this.em.getComponent(target, 'Position');
            ink.inkCloud = { x: pos.x, y: pos.y, radius: ink.cloudRadius, opacity: ink.opacity ?? 1, age: ink.confusionDuration ?? 3 }
            for (const other of nearby) {
                const oNav = this.em.getComponent(other, 'Navigation');
                if (oNav) {
                    oNav.confusionFactor = ink.confusionDuration ? 0.8 : 0.6;
                    oNav.confusionTicks = ink.confusionDuration ?? 8;
                }
            }
            this.ocean.addInkCloud(pos.x, pos.y, ink.cloudRadius ?? 3, ink.opacity ?? 1);
        }
        // Carapace réduit la chance de toucher
        if (this.em.hasComponent(target, 'Carapace')) {
            const carapace = this.em.getComponent(target, 'Carapace');
            hitChance -= (carapace.protection ?? 0.5) * (carapace.coverageRatio ?? 0.5) * 0.5;
        }

        hitChance = Math.max(0.05, Math.min(0.95, hitChance));
        if (Math.random() > hitChance) {
            // Raté → Spine inflige quand même des dégâts si contact
            this._spineCounterDamage(target, eid, metabolism);
            return;
        }

        // ── Succès : manger une cellule ──
        const targetBodyPlan = this.em.getComponent(target, 'BodyPlan');
        const removable = targetBodyPlan.cells.filter(c => c.role !== 'HEAD');

        if (removable.length === 0) {
            // Proie réduite à sa HEAD → mort
            this._toDestroy.push(target);
            metabolism.energyStored += 25;
            return;
        }

      
        // ── Succès : manger une cellule ──

        if (removable.length === 0) {
            // Proie réduite à sa HEAD → mort
            this._toDestroy.push(target);
            metabolism.energyStored += 25;
            return;
        }

       const jaw = this.em.hasComponent(eid, 'Jaw') 
        ? this.em.getComponent(eid, 'Jaw') : null;

        let cell;
        if (jaw && Math.random() < jaw.bitePower) {
        // Jaw précis → choisit la cellule la plus valuable
        cell = removable.reduce((best, c) => 
            this._cellEnergyValue(c) > this._cellEnergyValue(best) ? c : best
        );
        } else {
        // Sans Jaw ou raté → aléatoire
        cell = removable[Math.floor(Math.random() * removable.length)];
        }

        // Retirer de la grille et du BodyPlan
        this.ocean.removeEntity(cell.x, cell.y);
        targetBodyPlan.cells.splice(targetBodyPlan.cells.indexOf(cell), 1);



        // Retirer de la grille et du BodyPlan
        this.ocean.removeEntity(cell.x, cell.y);
        targetBodyPlan.cells.splice(targetBodyPlan.cells.indexOf(cell), 1);

        // Énergie gagnée = valeur de la cellule selon son rôle
const energyGained = this._cellEnergyValue(cell);
metabolism.energyStored += energyGained;

// La proie perd aussi de l'énergie — choc, hémorragie
const targetMeta = this.em.getComponent(target, 'Metabolism');
targetMeta.energyStored -= energyGained * 0.8;

        // Contre-dégâts Spine
        this._spineCounterDamage(target, eid, metabolism);

        // Mucus : ralentit l'attaquant (penalité au prochain tick via navigation)
        if (this.em.hasComponent(target, 'Mucus')) {
            const nav = this.em.getComponent(eid, 'Navigation');
            if (nav) {
                const mucus = this.em.getComponent(target, 'Mucus');
                nav.confusionFactor = mucus.viscosity ?? 0.5; // 0-1
                nav.confusionTicks = mucus.confusionTicks || 5;
            }
        }
    }

    _spineCounterDamage(defender, attacker, attackerMeta) {
        if (!this.em.hasComponent(defender, 'Spine')) return;
        const spine = this.em.getComponent(defender, 'Spine');
        const damage = (spine.damage ?? 0.3) * (spine.count ?? 1) * 0.5;
        attackerMeta.energyStored -= damage;
    }

    _cellEnergyValue(cell) {
        const values = { HEAD: 60, JAW: 60, EYE: 40, TENTACLE: 38, FILTER: 52, SEGMENT: 44, SPINE: 14, PEDUNCLE: 28 };
        return values[cell.role] ?? 6;
    }

    _killPrey(target) {
        const bp = this.em.getComponent(target, 'BodyPlan');
        const pos = this.em.getComponent(target, 'Position');
        if (bp?.cells) {
            for (const cell of bp.cells) this.ocean.removeEntity(cell.x, cell.y);
        }
        if (pos) this.ocean.addNutrients(pos.x, pos.y, (bp?.cells.length ?? 1) * 2);
        this.em.destroyEntity(target);
    }

    // ── PARASITE ───────────────────────────────────────────────────────────────

    /**
     * Drain progressif par tick.
     * L'hôte idéal : grand et pas trop faible (garder en vie).
     * Pas de destruction de cellule — juste vol d'énergie.
     */
    _parasiteAct(eid, metabolism, deltaTime) {
        const parasite = this.em.getComponent(eid, 'Parasite');
        const drainRate = (parasite.drainRate ?? 0.5) * (deltaTime / 1000);
        const adjacent = this._getAdjacentEntities(eid);

        for (const target of adjacent) {
            if (target === eid) continue;
            if (!this.em.hasComponent(target, 'Metabolism')) continue;
            if (this.em.hasComponent(target, 'Parasite') && target < eid) continue; // Pas de para-sur-para

            const targetMeta = this.em.getComponent(target, 'Metabolism');
            // Ne pas tuer l'hôte (le bon parasite est discret)
            if (targetMeta.energyStored < targetMeta.maxEnergyStored * 0.2) continue;

            // Carapace réduit le drain
            let actualDrain = drainRate;
            if (this.em.hasComponent(target, 'Carapace')) {
                const cap = this.em.getComponent(target, 'Carapace');
                actualDrain *= 1 - (cap.protection ?? 0.3) * 0.5;
            }

            const drained = Math.min(targetMeta.energyStored * 0.1, actualDrain);
            targetMeta.energyStored -= drained;
            metabolism.energyStored += drained * 0.8; // 80% de conversion
            break; // Un hôte par tick
        }
    }

    // ── SYMBIOSIS ──────────────────────────────────────────────────────────────

    /**
     * Les deux organismes doivent avoir Symbiosis.
     * Échange : le plus riche donne un peu au plus pauvre.
     * Bonus net pour les deux (simulation d'échange de ressources complémentaires).
     */
    _symbiosisAct(eid, metabolism) {
        const adjacent = this._getAdjacentEntities(eid);

        for (const target of adjacent) {
            if (target === eid) continue;
            if (!this.em.hasComponent(target, 'Symbiosis')) continue;
            if (!this.em.hasComponent(target, 'Metabolism')) continue;

            // Éviter le double traitement de la paire
            const pairKey = eid < target ? `${eid}-${target}` : `${target}-${eid}`;
            if (this._symbioPairs.has(pairKey)) continue;
            this._symbioPairs.add(pairKey);

            const targetMeta = this.em.getComponent(target, 'Metabolism');
            const myRatio = metabolism.energyStored / metabolism.maxEnergyStored;
            const theirRatio = targetMeta.energyStored / targetMeta.maxEnergyStored;

            // Le plus riche donne au plus pauvre
            const diff = myRatio - theirRatio;
            if (Math.abs(diff) < 0.1) continue; // Déjà équilibrés

            const transfer = Math.abs(diff) * 5; // Montant transféré
            if (diff > 0) {
                metabolism.energyStored -= transfer;
                targetMeta.energyStored += transfer * 1.1; // +10% bonus mutualiste
            } else {
                targetMeta.energyStored -= transfer;
                metabolism.energyStored += transfer * 1.1;
            }
            break;
        }
    }

    // ── HELPERS ────────────────────────────────────────────────────────────────

    /** Retourne les entités sur les 8 cases adjacentes à n'importe quelle cellule de l'organisme. */
    _getAdjacentEntities(eid) {
        const bodyPlan = this.em.getComponent(eid, 'BodyPlan');
        const found = new Set();

        for (const cell of bodyPlan.cells) {
            const neighbors = this.ocean.getNeighbors(cell.x, cell.y);
            for (const n of neighbors) {
                if (n.entity !== null && n.entity !== undefined && n.entity !== eid) {
                    found.add(n.entity);
                }
            }
        }
        return found;
    }
    _getNearbyInRadius(eid, radius) {
        const bodyPlan = this.em.getComponent(eid, 'BodyPlan');
        const found = new Set();

        for (const cell of bodyPlan.cells) {
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    if (dx * dx + dy * dy > radius * radius) continue;
                    const w = this.ocean.wrap(cell.x + dx, cell.y + dy);
                    const occupant = this.ocean.getEntity(w.x, w.y);
                    if (occupant !== null && occupant !== undefined && occupant !== eid) {
                        found.add(occupant);
                    }
                }
            }
        }
        return found;
    }
    _cellCount(eid) {
        return this.em.getComponent(eid, 'BodyPlan')?.cells.length ?? 1;
    }

    /** Même espèce = speciesIdentity proche (via ADNHandler). */
    _isSameSpecies(eid1, eid2) {
        if (!this.em.hasComponent(eid2, 'Genome')) return false;
        const g1 = this.em.getComponent(eid1, 'Genome');
        const g2 = this.em.getComponent(eid2, 'Genome');
        return Math.abs(g1.handler.readFloat('speciesIdentity') - g2.handler.readFloat('speciesIdentity')) < 0.05;
    }
}