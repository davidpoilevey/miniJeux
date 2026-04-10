import { ADNHandler, recombinaisonGenetique } from "../../genetic/ADNPlante";
import { creerOrganismeNiveauSuperieur, ECO_HEIGHT, ECO_WIDTH } from "../ecosysteme";
import { clamp, distance } from "../Taxonomy";


// Base pour tout organisme
export class Organisme {
    constructor(adn, niveau, x, y) {
        this.adn = adn; // = adnHandler
        this.niveau = niveau;
        this.x = x;
        this.y = y;
        this.parent = null;
        this.enfants = [];
        this.liensActifs = true; // Peut se détacher avec l'âge
        this.longueurLien = this.adn.readFloat("longueurLien") * 5 + 15; // 10-15 pixels
        this.forceLien = this.adn.readFloat("forceLien") * 0.5 + 0.2; // Force du "ressort"

        this.radius = Math.round(clamp(adn.readFloat("taille"), 4, 8));
        this.vitesse = adn.readFloat("vitesseBase") * (6 / (this.radius)) || 1;
        this.energie = clamp(adn.readFloat("energieInitiale"), 60, 100);
        this.inconscient = this.adn.readBool("doitFuir");
        this.resistanceToxine = adn.readFloat("resistanceToxine");
        this.valeurNutritive = 200;
        this.age = 0;
        this.tempsGestation = Math.round(this.adn.readFloat("tempsGestation") * 50) + 50;
        this.gestation = 0;
        this.couleur = getCouleur(this);
        this.porteeVision = clamp(adn.readFloat("porteeVision"), 100, 300);
        this.ageMax = clamp(adn.readFloat("ageMax"), 200, 800)
        this.metabolismeDeBase = clamp(adn.readFloat("metabolismeBase"), 0.1, 1);

        this.preferredDirectionX = this.adn.readFloat('directionFavoriteX') - 0.5;
        this.preferredDirectionY = this.adn.readFloat('directionFavoriteY') - 0.5;
        this.vivant = true;
        this.isToxic = false;
    }

    update(env, population, spatialHash) {
        // Variables de mouvement finales
        let mouvementX = 0;
        let mouvementY = 0;
        let prioriteActive = "aucune";
        let nouvelEnfant = null;
        // Gestion de la gestation
        if (this.gestation > 0) {
            this.gestation--;
        }
        this.energie = Math.min(this.seuilReproduction * 5, this.energie);
        this.partagerEnergie();
        const organismesProches = getOrganismesProches(this, spatialHash, env.cellSize, this.porteeVision);

        // PRIORITÉ 0 : RÉGULATION SOCIALE (Écartement)

        const resultSocial = this.calculerEcartement(organismesProches);
        if (!this.vivant) env.addNutriment(this.x, this.y, this.valeurNutritive / 2);
        if (prioriteActive === "aucune" && resultSocial.active) {
            mouvementX = resultSocial.x;
            mouvementY = resultSocial.y;

        }
        // PRIORITÉ 1 : SURVIE IMMÉDIATE (Fuite des prédateurs)
        const resultFuite = this.calculerFuite(organismesProches);
        if (resultFuite.active) {
            mouvementX += resultFuite.x;
            mouvementY += resultFuite.y;
            prioriteActive = "fuite";
        }

        // PRIORITÉ 2 : REPRODUCTION (Recherche de partenaire)
        else if ((this.gestation == null || this.gestation <= 0) && (this.energie > this.seuilReproduction)) {
            const resultReproduction = this.calculerReproduction(organismesProches, population);
            if (resultReproduction.active) {

                if (resultReproduction.enfant) {
                    // Reproduction réussie ! Retourner l'enfant
                    nouvelEnfant = resultReproduction.enfant;
                    prioriteActive = "reproduction";
                } else if (prioriteActive == "aucune") {
                    // Se déplacer vers le partenaire
                    mouvementX = resultReproduction.x;
                    mouvementY = resultReproduction.y;
                    prioriteActive = "reproduction";
                }
            }
        }
        const impact = env.sampleToxin(this.x, this.y);

        if (this.toxine !== 'degage' && impact.degage && impact.degage > 0) {
            // Estimer le gradient local de toxine
            const eps = env.cellSize; // distance d'échantillonnage (à calibrer)
            const c0 = env.sampleToxin(this.x, this.y).degage;
            const cx = env.sampleToxin(this.x + eps, this.y).degage;
            const cy = env.sampleToxin(this.x, this.y + eps).degage;

            // Approximation du gradient ∇c = (dc/dx, dc/dy)
            const gradX = (cx - c0) / eps;
            const gradY = (cy - c0) / eps;

            // Direction de fuite = opposée au gradient (vers concentration plus faible)
            const norm = Math.sqrt(gradX * gradX + gradY * gradY) || 1;
            const fleeX = -(gradX / norm) * impact.degage * this.vitesse * this.resistanceToxine;
            const fleeY = -(gradY / norm) * impact.degage * this.vitesse * this.resistanceToxine;

            mouvementX += fleeX;
            mouvementY += fleeY;
            prioriteActive = "toxine_fuite";
        }
        // applique force liens
        if (prioriteActive !== "fuite") {
            const forcesLiens = this.appliquerForcesLiens();
            const intensiteLiens = Math.sqrt(forcesLiens.x * forcesLiens.x + forcesLiens.y * forcesLiens.y);

            if (intensiteLiens > 0.5) { // Seuil pour éviter micro-mouvements
                mouvementX += forcesLiens.x;
                mouvementY += forcesLiens.y;
                prioriteActive = "liens_familiaux";
            }
        }
        // PRIORITÉ 3 : BESOIN PRIMAIRE (Recherche de ressources/proies seulement si energie basse)
        if (prioriteActive !== "reproduction" && this.energie < (this.seuilReproduction * 2)) {
            const resultBesoin = this.calculerBesoinPrimaire(env, organismesProches);
            if (resultBesoin.active && prioriteActive === 'aucune') {
                mouvementX += resultBesoin.x;
                mouvementY += resultBesoin.y;
                prioriteActive = "besoin";
            }
        }


        // PRIORITÉ 5 : COMPORTEMENT PAR DÉFAUT (Errance)
        if (prioriteActive === "aucune") {
            const resultDefaut = this.calculerComportementDefaut(env, organismesProches);
            mouvementX += resultDefaut.x;
            mouvementY += resultDefaut.y;
            prioriteActive = "defaut";
        }


        // Appliquer le mouvement final
        this.x += mouvementX;
        this.y += mouvementY;
        this.boundaryCheck(ECO_WIDTH, ECO_HEIGHT);

        // Coût énergétique
        const coutMouvement = Math.sqrt(mouvementX * mouvementX + mouvementY * mouvementY) * 0.01;
        this.energie -= coutMouvement;
        // toxines

        // Métabolisme et mort
        this.energie -= this.metabolismeDeBase * 2;
        if (this.energie <= 0) this.mourir();
        if (this.age > this.ageMax) {
            this.mourir();
            env.addNutriment(this.x, this.y, this.valeurNutritive);
        }
        return nouvelEnfant;
    }
    appliquerForcesLiens() {
        let forceX = 0;
        let forceY = 0;

        // Force du parent
        if (this.parent && this.parent.vivant && this.liensActifs) {
            const dx = this.parent.x - this.x;
            const dy = this.parent.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Si trop éloigné, force de rappel (comme un ressort)
            if (distance > this.longueurLien) {
                const force = (distance - this.longueurLien) * this.forceLien;
                forceX += (dx / distance) * force;
                forceY += (dy / distance) * force;
            }
            // Si trop proche, force de répulsion douce
            else if (distance < this.longueurLien * 0.3) {
                const force = (this.longueurLien * 0.3 - distance) * this.forceLien * 0.5;
                forceX -= (dx / distance) * force;
                forceY -= (dy / distance) * force;
            }
        }

        // Forces des enfants Priorite 1.5
        for (let enfant of this.enfants) {
            if (enfant.vivant && enfant.liensActifs) {
                const dx = enfant.x - this.x;
                const dy = enfant.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > this.longueurLien) {
                    const force = (distance - this.longueurLien) * this.forceLien * 3; // Force plus faible vers enfants
                    forceX += (dx / distance) * force;
                    forceY += (dy / distance) * force;
                }
            }
        }

        return { x: forceX, y: forceY };
    }
    // PRIORITÉ 1: Fuite des prédateurs
    calculerFuite(organismesProches) {

        const distanceSecurite = clamp(this.adn.readFloat("distanceSecurite"), 10, 50);
        const forceFuite = this.vitesse / 2; // Force de fuite importante

        if (this.inconscient) return { active: false, x: 0, y: 0 };

        let forceX = 0;
        let forceY = 0;
        let predateurDetecte = false;

        // Filtrer seulement les prédateurs dans la distance de sécurité
        const predateurs = organismesProches.filter(o =>
            o.org.niveau > this.niveau && o.distance <= distanceSecurite
        );

        for (let pred of predateurs) {
            if (pred.org.vivant && pred.org.niveau > this.niveau) {
                const dist = pred.distance;
                if (dist < distanceSecurite && dist > 0) {
                    predateurDetecte = true;
                    const dirX = pred.dx / dist;
                    const dirY = pred.dy / dist;
                    const intensite = (distanceSecurite - dist) / distanceSecurite;

                    forceX -= dirX * forceFuite * intensite;
                    forceY -= dirY * forceFuite * intensite;

                    // Stress énergétique
                    this.energie -= 0.1 * intensite;
                }
            }
        }

        return {
            active: predateurDetecte,
            x: forceX,
            y: forceY
        };
    }

    // PRIORITÉ 2: Besoin primaire (à surcharger dans les classes enfants)
    calculerBesoinPrimaire(env, population) {
        return { active: false, x: 0, y: 0 };
    }
    calculerReproduction(organismesProches, population) {
        const porteeReproduction = (this.porteeVision * 2);// moins attentif que pour predateurs ou pas
        const coitDist = this.adn.read10("coitDist") * 10 + 10; // Distance pour reproduction effective 10 minimum

        // Filtrer les partenaires potentiels
        const partenaires = organismesProches.filter(o =>
            o.org !== this &&
            o.org.vivant && o.org.gestation == 0 &&
            o.org.type === this.type &&
            o.org.energie > o.org.seuilReproduction &&
            o.distance <= porteeReproduction
        );

        // Vérifier aussi si reproduction asexuée possible
        const peutReproduireSeul = this.aloneInTheDark || partenaires.length == 0;

        if (!peutReproduireSeul && partenaires.length > 0) {
            // Prendre le partenaire le plus proche
            const partenaireLePlusProche = partenaires.reduce((closest, current) =>
                current.distance < closest.distance ? current : closest
            );
            if (partenaireLePlusProche.distance <= coitDist) {
                // Effectuer la reproduction
                let enfant = this.reproduire(partenaireLePlusProche.org);
                enfant.energie = this.energie / 2;

                // Faire evoluer naturellement avec une proba de 2%
                if (Math.random() < 0.02) {
                    const niveauSuperieur = enfant.niveau + 1;
                    const existeNiveauSuperieur = existeOrganismesNiveau(population, niveauSuperieur);

                    if (!existeNiveauSuperieur) {
                        enfant = creerOrganismeNiveauSuperieur(enfant);
                    }
                }
                else {
                    const chanceAttachement = this.adn.readFloat("attachementFamilial") * 2;
                    if (true || Math.random() < chanceAttachement) {
                        enfant.parent = this;
                        // a voir partenaireLePlusProche.org.enfants.push(enfant);
                        this.enfants.push(enfant);
                    }

                }
                // Coût énergétique pour les parents
                this.energie *= 0.5;
                partenaireLePlusProche.org.energie *= 0.5;

                // Démarrer la gestation
                this.gestation = this.tempsGestation;
                partenaireLePlusProche.org.gestation = this.tempsGestation;

                return {
                    active: true,
                    enfant: enfant,
                    x: 0,
                    y: 0
                };
            }
            else {
                // Se déplacer vers le partenaire
                const direction = {
                    x: partenaireLePlusProche.dx / partenaireLePlusProche.distance,
                    y: partenaireLePlusProche.dy / partenaireLePlusProche.distance
                };

                return {
                    active: true,
                    enfant: null,
                    x: direction.x * this.vitesse * 0.7, // Vitesse réduite pour l'approche
                    y: direction.y * this.vitesse * 0.7
                };
            }
        }
        else if (peutReproduireSeul) {
            // Reproduction asexuée
            console.log(`Reproduction asexuée de ${this.type}`);

            let enfant = this.reproduire(null);
            enfant.energie = this.energie / 2;
            this.energie *= 0.5;


            return {
                active: true,
                enfant: enfant,
                x: 0,
                y: 0
            };
        }


        return { active: false, x: 0, y: 0 };
    }
    handleSurpopulation() {
        // doigt de Thanos
        if (Math.random() < 0.5) {
            this.mourir();
            return true;// stop les checks
        }
        return false;
    }
    // PRIORITÉ 4: Écartement social (optimisée)
    calculerEcartement(organismesPresEcartement) {
        const distanceMinimale = clamp(this.adn.readFloat("distancePersonnelle"), this.radius + 10, 30);
        const forceEcartement = this.vitesse * 2;

        let forceX = 0;
        let forceY = 0;
        let ecartementNecessaire = false;

        // Filtrer seulement les organismes du même niveau
        const congeners = organismesPresEcartement.filter(o => o.org.niveau === this.niveau);
        // anti-surpopulation
        if (congeners.length > 100) {
            if (this.handleSurpopulation())
                return { active: false, x: 0, y: 0 };

        }
        for (let congener of congeners) {
            if (congener.parent == this || this.enfants.includes(congener))
                continue;
            if (congener.distance < distanceMinimale && congener.distance > 0) {
                ecartementNecessaire = true;

                if (congener.distance == 0) {
                    this.mourir();
                }

                this.energie -= distanceMinimale / congener.distance;

                const dirX = -congener.dx / congener.distance; // Direction opposée
                const dirY = -congener.dy / congener.distance;
                const intensite = (distanceMinimale - congener.distance) / distanceMinimale;

                forceX += dirX * forceEcartement * intensite;
                forceY += dirY * forceEcartement * intensite;
            }
        }

        return {
            active: ecartementNecessaire,
            x: forceX,
            y: forceY
        };
    }

    // PRIORITÉ 5: Comportement par défaut
    calculerComportementDefaut() {

        return {
            active: true,
            x: this.preferredDirectionX * this.vitesse,
            y: this.preferredDirectionY * this.vitesse
        };
    }
    partagerEnergie() {
        if (!this.liensActifs) return;

        const famille = [this, ...this.enfants.filter(e => e.vivant && e.liensActifs)];
        if (this.parent && this.parent.vivant && this.parent.liensActifs) {
            famille.push(this.parent);
        }

        // Calculer l'énergie moyenne
        const energieTotale = famille.reduce((sum, org) => sum + org.energie, 0);
        const energieMoyenne = energieTotale / famille.length;
        const tauxPartage = this.adn.readFloat("partageEnergie") * 0.5; // 50% par défaut

        // Redistribuer progressivement
        for (let membre of famille) {
            const difference = energieMoyenne - membre.energie;
            membre.energie += difference * tauxPartage;
        }
    }
    reproduire(partenaire) {

        let childADN = this.adn.mutatedVersion();
        if (partenaire) {
            childADN = recombinaisonGenetique(this.adn.mutatedVersion(), partenaire.adn.mutatedVersion())[0];
        }
        const adnHandler = new ADNHandler(childADN);

        // Utilisez this.constructor pour créer une nouvelle instance du bon type
        // Ici, on part du principe que le constructeur enfant a la même signature que le parent
        // (adnHandler, x, y) ou (adn, x, y)
        let d = adnHandler.readFloat('pondLoin') * 50 + 20;
        if (!this.adn.readBool("CanMigrate")) d += 50;// bonus pour pondre plus loin si bouge pas
        d = Math.min(this.longueurLien, d);
        const nouvellePositionX = this.x + (Math.random() - 0.5) * d; // ou une nouvelle position
        const nouvellePositionY = this.y + (Math.random() - 0.5) * d; // ou une nouvelle position

        return new this.constructor(adnHandler, nouvellePositionX, nouvellePositionY);


    }



    mourir() {
        this.vivant = false;
    }
}
Organisme.prototype.defendre = function (attaquant) {
    const defense = this.adn.readFloat("defense") * this.radius * 5; //= defense de 15 min a 30
    const forceAttaque = attaquant.force * this.radius * 30; // moyenne 100
    const vitesse = this.vitesse;

    // Probabilité d'esquive basée sur vitesse
    const chanceEsquive = Math.min(0.5, this.adn.readFloat("bonenesquive"));
    if (Math.random() < chanceEsquive) {
        // La proie esquive et repousse légèrement l'attaquant
        attaquant.x += (Math.random() - 0.5) * 10;
        attaquant.y += (Math.random() - 0.5) * 10;
        return { esquive: true, degats: 0 };
    }

    // Si pas d’esquive : calcul des dégâts
    const degats = Math.max(2, forceAttaque - defense);
    this.energie -= degats;

    if (this.energie <= 0) {
        this.mourir();

        return { esquive: false, tue: true, degats };
    }

    return { esquive: false, tue: false, degats };
};

Organisme.prototype.boundaryCheck = function (width = 800, height = 600) {
    if (this.x < 0) {
        this.x = 10;
        this.preferredDirectionX *= -1;
    }
    if (this.y < 0) {
        this.y = 10;
        this.preferredDirectionY *= -1;
    }
    if (this.x > width) {
        this.x = width - 12;
        this.preferredDirectionX *= -1;
    }
    if (this.y > height) {
        this.y = height - 12;
        this.preferredDirectionY *= -1;
    }
};


export function getCouleur(org) {
    const colorProfile = {
        Cyanobacterie: { hue: 190, sat: 90, light: 60 }, // bleu-vert brillant
        Nutrimentivore: { hue: 100, sat: 70, light: 45 }, // vert mat tirant sur jaune
        Saprophyte: { hue: 25, sat: 45, light: 50 }, // brun ?
        BacterieHerbivore: { hue: 60, sat: 100, light: 65 }, // jaune saturé, peu lumineux
        Bacille: { hue: 25, sat: 100, light: 55 }, // orange vif
        Virus: { hue: 220, sat: 80, light: 50 }, // violet-rouge inquiétant
        Amibe: { hue: 100, sat: 10, light: 20 }, // gris-noir verdâtre
    };

    const base = colorProfile[org.type] || { hue: 0, sat: 50, light: 50 };

    // Variation génétique ±15° sur la teinte
    const baseCouleur = org.adn?.readFloat?.("couleur") || 0;
    const variation = (baseCouleur * 20) - 10;

    // Assemblage HSL
    const hue = (base.hue + variation + 360) % 360;
    return `hsl(${hue}, ${base.sat}%, ${base.light}%)`;
}

function getOrganismesProches(organisme, spatialHashMap, cellSize, portee) {
    const organismesProches = [];
    const cellX = Math.floor(organisme.x / cellSize);
    const cellY = Math.floor(organisme.y / cellSize);
    const cellRadius = Math.ceil(portee / cellSize);

    // Parcourir les cellules dans un rayon autour de l'organisme
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
        for (let dy = -cellRadius; dy <= cellRadius; dy++) {
            const key = `${cellX + dx},${cellY + dy}`;
            const cellOrganismes = spatialHashMap.get(key);

            if (cellOrganismes) {
                for (let org of cellOrganismes) {
                    // Vérification rapide de la distance avant calcul précis
                    if (org !== organisme && org.vivant) {
                        const dx = org.x - organisme.x;
                        const dy = org.y - organisme.y;
                        const distSquared = dx * dx + dy * dy;

                        if (distSquared <= portee * portee) {
                            organismesProches.push({
                                org: org,
                                distance: Math.sqrt(distSquared),
                                dx: dx,
                                dy: dy
                            });
                        }
                    }
                }
            }
        }
    }

    return organismesProches;
}

// Fonction utilitaire pour vérifier s'il existe des organismes d'un niveau donné
function existeOrganismesNiveau(population, niveau) {
    return population.some(org => org.vivant && org.niveau === niveau);
}