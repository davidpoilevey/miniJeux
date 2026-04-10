import { TOXIN_CONFIG } from "../ecosysteme";

// Environnement avec système de zones
export class Environnement {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.toxins = new Map();
        // paramètres globaux (ajuste-les)
        this.toxinDecay = 0.82;      // % restant par tick (demi-vie ~8 ticks)
        this.toxinDiffuse = 0.18;    // part diffusée vers voisins
        this.toxinClamp = 500;       // plafond local pour éviter runaway
        this.cellSize = 20;
        // Générer 9 zones (3x3)
        this.reset();

    }
    reset(){

        this.zones = [];
        this.cols = 5;
        this.rows = 5;
 const zoneWidth = this.width / this.cols;
        const zoneHeight = this.height / this.rows;

        // Lumière par ligne
        const lumiereLevels = [2.5, 2, 1.5, 1.0, 0.8];



        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x1 = col * zoneWidth;
                const y1 = row * zoneHeight;
                const x2 = x1 + zoneWidth;
                const y2 = y1 + zoneHeight;

                const nutriments = Math.floor(Math.random() * (1000)) + 1000; // entre 1000 et 2000

                this.zones.push({
                    id: row * this.cols + col, // identifiant unique
                    x1,
                    y1,
                    x2,
                    y2, row, col,
                    lumiere: lumiereLevels[row], // selon la ligne au milieu encore un bonus
                    nutriments,
                    nutrimentMax: nutriments // max initial = valeur initiale
                });
            }
        }
       
    }
    getMiddleZone(){
        if(this.middleZone==null){
            const middlePos = [Math.floor(this.rows/2),Math.floor(this.cols/2)];
            this.middleZone = this.zones.find(z=>(z.row==middlePos[0]&&z.col==middlePos[1]))        
        }
        return this.middleZone;
    }
    _key(cx, cy) { return `${cx},${cy}`; }
    _cell(x, y) {
        return { cx: Math.floor(x / this.cellSize), cy: Math.floor(y / this.cellSize) };
    }

    addToxin(x, y, amount, type = "generic") {
        const { cx, cy } = this._cell(x, y);
        const key = this._key(cx, cy);
        const prev = this.toxins.get(key) || { amount: 0, type };
        prev.amount = Math.min(this.toxinClamp, prev.amount + amount);
        prev.type = type;
        this.toxins.set(key, prev);
    }

    // dose locale ressentie à la position (pas de sqrt, on reste cellule-centré)
   sampleToxin(x, y) {
    let impact = { energie: 0, stop:false,  degage:0};

    for (let [key, toxin] of this.toxins.entries()) {
        // Récupération des coordonnées de la case
        const [ix, iy] = key.split(",").map(Number);
        const cx = ix * this.cellSize + this.cellSize / 2;
        const cy = iy * this.cellSize + this.cellSize / 2;

        // Rayon proportionnel à la quantité de toxine
        const radius = Math.sqrt(toxin.amount) * this.cellSize * 0.5;

        const dx = x - cx;
        const dy = y - cy;
        const distSq = dx * dx + dy * dy;

        if (distSq < radius * radius) {
            const intensity = (radius - Math.sqrt(distSq)) / radius;

            switch (toxin.type) {
                case "neuro":
                    impact.stop =true; // ralentit
                    break;
                case "degage":
                    impact.degage =intensity*10; // fais fuir
                    break;
                case "acid":
                    impact.energie -= 50 * intensity;       // gros dégât
                    break;
                case "pheromone":
                    impact.energie += 200;             // donne envie d'autre chose que bouffer
                    break;
                default:
                    impact.energie -= 0.02 * intensity;        // générique
            }
        }
    }

    return impact;
}

    // décroissance + diffusion très cheap (moyenne vers voisins)
   updateToxins() {
    if (this.toxins.size === 0) return;
    const next = new Map();

    const add = (cx, cy, amt, type) => {
        const cfg = TOXIN_CONFIG[type] || TOXIN_CONFIG.default;
        const key = this._key(cx, cy);
        const prev = next.get(key) || { amount: 0, type };
        prev.amount = Math.min(cfg.clamp, prev.amount + amt);
        prev.type = type;
        next.set(key, prev);
    };

    for (const [key, { amount, type }] of this.toxins) {
        const cfg = TOXIN_CONFIG[type] || TOXIN_CONFIG.default;

        // décroissance propre à la toxine
        const kept = amount * cfg.decay * (1 - cfg.diffuse);
        if (kept > 0.05) {
            const [sx, sy] = key.split(',').map(Number);
            add(sx, sy, kept, type);
        }

        // diffusion propre à la toxine
        const spread = (amount * cfg.decay * cfg.diffuse) / 4;
        if (spread > 0.02) {
            const [sx, sy] = key.split(',').map(Number);
            add(sx + 1, sy, spread, type);
            add(sx - 1, sy, spread, type);
            add(sx, sy + 1, spread, type);
            add(sx, sy - 1, spread, type);
        }
    }
    this.toxins = next;
}


    // Trouver la zone correspondant à une position
    getZone(x, y) {
        for (let zone of this.zones) {
            if (x >= zone.x1 && x < zone.x2 && y >= zone.y1 && y < zone.y2) {
                return zone;
            }
        }
        return this.zones[0]; // Fallback sur la première zone
    }
    getNextZone(zoneId) {
        const randomZone = Math.floor(Math.random() * this.zones.length);

        const zone = this.zones[randomZone];

        return zone;

        // const nextCol = (zone.col + 1) % this.cols;
        // const nextRow = zone.row + (nextCol === 0 ? 1 : 0);

        // // Si on dépasse le dernier, revient au premier
        // const newRow = nextRow % this.rows;

        // const nextId = newRow * this.cols + nextCol;
        // return this.zones[nextId];
    }

    // Vérifie si une zone est pauvre en ressource
    isPauvre(type, zoneId, seuil = 0.2) {
        const zone = this.zones[zoneId];
        if (!zone) return false;

        if (type === 'nutriments') {
            return zone.nutriments < zone.nutrimentMax * seuil;
        }
        if (type === 'lumiere') {
            return zone.lumiere < seuil;
        }
        return false;
    }
    // Consommer des nutriments dans une zone spécifique
    consommerNutriments(x, y, quantite) {
        const zone = this.getZone(x, y);
        const consomme = Math.min(zone.nutriments, quantite);
        zone.nutriments = Math.max(0, zone.nutriments - consomme);
        return consomme;
    }
    addNutriment(x,y,qte){
         const zone = this.getZone(x, y);
        zone.nutriments += qte;
    }

    update(population) {
        // Régénération lente des nutriments dans chaque zone
        for (let zone of this.zones) {
            const regeneration = zone.nutrimentMax * 0.01; // 10% par update
            zone.nutriments = Math.min(zone.nutrimentMax, zone.nutriments + regeneration);
        }

        // Ici on pourrait faire varier d'autres paramètres
        this.updateToxins();
        const chanceChangement = 0.01; // 1 % de chance par tick
        const variationMax = 0.1;

        this.zones.forEach(zone => {
            if (Math.random() < chanceChangement) {
                // variation aléatoire entre -0.5 et +0.5
                const variation = (Math.random() * 2 - 1) * variationMax;
                zone.lumiere = Math.max(0, zone.lumiere + variation);
            }
        });
        if (population) {
            // Comptage des producteurs par zone
            const producteursParZone = new Array(this.zones.length).fill(0);

            population.forEach(individu => {
                const zone = this.getZone(individu.x, individu.y);
                if (individu.type === 'Cyanobacterie') {
                    producteursParZone[zone.id] += 1;
                }
            });

            // Ajustement de la lumière en fonction du nombre de producteurs
            const seuilSurpopulation = 50;
            this.zones.forEach((zone, i) => {
                const nbProd = producteursParZone[i];
                if(isNaN(zone.lumiere))
                    zone.lumiere=1.0;
                if (nbProd > seuilSurpopulation) {
                    // réduction proportionnelle : +1% de pénalité par tranche au-dessus du seuil
                    const surplus = nbProd - seuilSurpopulation;
                    const reduction = Math.min(0.01, surplus * 0.002); // max -10%
                    zone.lumiere = Math.max(0, zone.lumiere * (1 - reduction));
                }
                else if (nbProd > 1) {
                    zone.lumiere = Math.max(0.3, zone.lumiere + 0.0005)
                }
            });
        }
    }
}

// Fonction utilitaire pour afficher les informations des zones (debugging)
export function afficherInfosZones(env) {
    env.zones.forEach((zone, index) => {
        console.log(`Zone ${index}: Lumière=${zone.lumiere}, Nutriments=${zone.nutriments.toFixed(1)}/${zone.nutrimentMax}`);
    });
}