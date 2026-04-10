import { getCouleur, Organisme } from "./taxonomy/Organisme";
import { Predateur } from "./taxonomy/Predateur";


// Fonction utilitaire de distance Euclidienne
export function distance(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
export function clamp(value, min, max) {
    //
    return (value * (max - min) + min);
}





export class Cyanobacterie extends Organisme {
    constructor(adn, x, y) {
        super(adn, 0, x, y); // niveau trophique 2
        this.type='Cyanobacterie';
        this.couleur = getCouleur(this);
        // Les herbivores voient moins loin mais se déplacent vite, METABOLISME PLUS LENT(vivent + longtemps)
        this.porteeVision *= 0.5;
        this.seuilReproduction = 250;
        this.valeurNutritive = 800;
        this.enMigration = null;
        this.vitesse *= 1.7;
        this.metabolismeDeBase = clamp(adn.readFloat("metabolismeBase"), 0.1, 1);
        this.isToxic = adn.readBool('isToxic');
        if (this.isToxic) {
            this.toxicite = adn.readFloat("toxicite");
            this.toxine = adn.readBool('poison') ? 'acid' : 'neuro'
            this.metabolismeDeBase += 0.3 * this.toxicite;

        }
    }

    update(env, population, spatialHash) {
        const enfant = super.update(env, population, spatialHash);

        // Photosynthèse : gain d'énergie selon la zone
        const zone = env.getZone(this.x, this.y);
        const efficacitePhotosynthese = this.adn.readFloat("photosynthese") + 2;

        // Gain d'énergie basé sur la lumière de la zone
        this.energie += zone.lumiere * efficacitePhotosynthese;

        return enfant;
    }
     calculerReproduction(organismesProches, population) {
        this.aloneInTheDark=true; //Cyano repro asexuee
        return  super.calculerReproduction(organismesProches, population) 
     }
    calculerComportementDefaut() { // par defaut, statique
        return { active: false, x: 0, y: 0 }
    }
    calculerBesoinPrimaire(env, population) {
        const zone = env.getZone(this.x, this.y);

        if (!this.adn.readBool("CanMigrate") || !env.isPauvre('lumiere', zone.id, 1.3)) {
            this.enMigration = null;
            return { active: false, x: 0, y: 0 };
        }
        if (this.enMigration == null) {

            const zoneRiches = env.zones.filter(z => z.lumiere > 1.3);
            if (zoneRiches.length > 0) {
                this.enMigration = zoneRiches[0];
            }
        }
            if (this.enMigration != null) {
                const nextZone = this.enMigration;
                if (nextZone.id === zone.id)
                    this.enMigration = null;
                else {

                    // Si la zone est pauvre, migrer vers une zone plus riche
                const targetX = nextZone.x1 +(nextZone.x2 - nextZone.x1) / 2;
                const targetY =  nextZone.y1 +(nextZone.y2 - nextZone.y1) / 2;

                    const dx = targetX - this.x;
                    const dy = targetY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 5) { // Seulement si la zone cible est assez loin
                        return {
                            active: true,
                            x: (dx / dist) * this.vitesse,
                            y: (dy / dist) * this.vitesse
                        };
                    }
                }
            }



        return { active: false, x: 0, y: 0 };
    }
}

// Nouvelle classe de bactérie consommatrice de nutriments
export class Nutrimentivore extends Organisme {
    constructor(adn, x, y) {
        super(adn, 0, x, y); // niveau trophique 0
        this.type='Nutrimentivore';
        this.couleur = getCouleur(this);
        // Les herbivores voient moins loin mais se déplacent vite, METABOLISME PLUS LENT(vivent + longtemps)
        this.porteeVision *= 1.9;
        this.seuilReproduction = 350;
        this.tempsGestation *=0.9;
        this.valeurNutritive = 300;
        this.urgeForMigration = false;
        this.vitesse *= 1.0;

        this.isToxic = adn.readBool('isToxic');
        if (this.isToxic) {
            this.toxicite = adn.readFloat("toxicite");
            this.toxine = adn.readBool('poison') ? 'acid' : 'pheromone'
            this.metabolismeDeBase += 0.03 * this.toxicite;

        }
        this.metabolismeDeBase = clamp(adn.readFloat("metabolismeBase"), 1, 5);
    }

    calculerComportementDefaut() { // par defaut, statique
        return { active: false, x: 0, y: 0 }
    }
     handleSurpopulation(){
            // doigt de Thanos
            if(Math.random()<0.5 && !this.urgeForMigration){
                this.urgeForMigration=true;
                //this.energie/=2;
                return true;// stop les checks
            }
        return false;
    }
    calculerBesoinPrimaire(env, population) {
        const zone = env.getZone(this.x, this.y);

        // Si la zone est pauvre, migrer vers une zone plus riche
        if (this.urgeForMigration || env.isPauvre('nutriments', zone.id)) {
            if (this.zoneVisee == null)
                this.zoneVisee = env.getNextZone(zone.id);
            if (this.zoneVisee) {
                const targetX = this.zoneVisee.x1 +(this.zoneVisee.x2 - this.zoneVisee.x1) / 2;
                const targetY =  this.zoneVisee.y1 +(this.zoneVisee.y2 - this.zoneVisee.y1) / 2;

                const dx = targetX - this.x;
                const dy = targetY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 10) { // Seulement si la zone cible est assez loin
                    return {
                        active: true,
                        x: (dx / dist) * this.vitesse,
                        y: (dy / dist) * this.vitesse
                    };
                }
                else
                    this.urgeForMigration=false;
            }
        }

        return super.calculerBesoinPrimaire(env, population)
    }
    update(env, population, spatialHash) {
        const enfant = super.update(env, population, spatialHash);

        // Consommation de nutriments : gain d'énergie
        const efficaciteConsommation = this.adn.read10("consommationNutriments")+5 ;
        const quantiteVoulue = 1.5;

        // Consommer les nutriments de la zone actuelle
        const nutrimentConsomme = env.consommerNutriments(this.x, this.y, quantiteVoulue);

        // Gain d'énergie proportionnel aux nutriments consommés
        this.energie=Math.min(600,  this.energie+ nutrimentConsomme * efficaciteConsommation);

        // Pénalité si pas assez de nutriments disponibles
        if (nutrimentConsomme < quantiteVoulue) {
            this.energie -= (quantiteVoulue - nutrimentConsomme)*2;
            this.urgeForMigration = true;
        }
        return enfant;
    }
}
export class Saprophyte extends Organisme {
    constructor(adn, x, y) {
        super(adn, 0, x, y); // niveau trophique 0 aussi
this.type='Saprophyte';
this.couleur = getCouleur(this);
        this.porteeVision *= 1.3;  // voit un peu moins loin que Nutrivore
        this.seuilReproduction = 800; // reproduction plus coûteuse
        this.tempsGestation *= 3;   // gestation plus longue
        this.ageMax*=1.5;   // vie plus longue
        this.valeurNutritive = 100;   // moins intéressant comme proie
        this.urgeForMigration = false;
        this.vitesse *= 0.8;          // plus lent
this.toleranceFamine = adn.readFloat("toleranceFamine");
        // Production passive de toxines quand il se nourrit
        this.isToxic = true;
        this.toxicite = adn.readFloat("toxicite") || 0.3; // par défaut un peu toxique
        this.toxine = 'degage'; // toxine propre à cette espèce
        this.metabolismeDeBase = clamp(adn.readFloat("metabolismeBase"), 3 ,5);
    }

    calculerComportementDefaut(env) {
        // Par défaut : Vise le milieu (parce que pourquoi pas)
        const zone = env.getZone(this.x, this.y);
        const middleZone = env.getMiddleZone();
        if(middleZone.id!=zone.id){
             const targetX = middleZone.x1 +(middleZone.x2 - middleZone.x1) / 2;
                const targetY =  middleZone.y1 +(middleZone.y2 - middleZone.y1) / 2;

                const dx = targetX - this.x;
                const dy = targetY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                     return {
                        active: true,
                        x: (dx / dist) * this.vitesse,
                        y: (dy / dist) * this.vitesse
                    };
               
        }
        return { active: false, x: 0, y: 0 };
    }

    calculerBesoinPrimaire(env, population) {
        const zone = env.getZone(this.x, this.y);

        // Migration si manque chronique de nutriments
        if (this.urgeForMigration || env.isPauvre('nutriments', zone.id,0.1)) {
            if (this.zoneVisee == null)
                this.zoneVisee = env.getNextZone(zone.id);
            if (this.zoneVisee) {
                const targetX = this.zoneVisee.x1 +(this.zoneVisee.x2 - this.zoneVisee.x1) / 2;
                const targetY =  this.zoneVisee.y1 +(this.zoneVisee.y2 - this.zoneVisee.y1) / 2;

                const dx = targetX - this.x;
                const dy = targetY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 10) {
                    return {
                        active: true,
                        x: (dx / dist) * this.vitesse,
                        y: (dy / dist) * this.vitesse
                    };
                } else {
                    this.urgeForMigration = false;
                }
            }
        }

        return super.calculerBesoinPrimaire(env, population);
    }

    update(env, population, spatialHash) {
        const enfant = super.update(env, population, spatialHash);

        const efficaciteConsommation = this.adn.readFloat("consommationNutriments")*2+1; // moins efficace que Nutrivore
        const quantiteVoulue = 5;// mais plus gourmand

        // Consommer les nutriments
        const nutrimentConsomme = env.consommerNutriments(this.x, this.y, quantiteVoulue);

        // Gain réduit en énergie
        this.energie += nutrimentConsomme * efficaciteConsommation;
         this.energie=Math.min(1500,  this.energie+ (nutrimentConsomme * efficaciteConsommation));

        // Toxine passive si consommation réussie
        if (nutrimentConsomme > 0 && Math.random()<0.01) {//seulement 10% du temps
            env.addToxin(this.x, this.y, this.toxicite*50, this.toxine);
        }

        // Si pas assez de nutriments → famine plus douce
        if (nutrimentConsomme < quantiteVoulue) {
            this.energie -= (quantiteVoulue - nutrimentConsomme) * this.toleranceFamine;
            this.urgeForMigration = true;
        }

        return enfant;
    }
}


/**Niveau 1 – Herbivores simples

Exemples : petits rongeurs, insectes, vers.

Caractéristiques :

Se nourrissent des producteurs.

Évitent activement les prédateurs (vision limitée + réflexes).

Capacité de migration si famine locale.

Twist : certaines espèces stockent de la nourriture → elles survivent mieux aux saisons pauvres, mais deviennent des cibles pour les voleurs.
 */
export class BacterieHerbivore extends Predateur {
    constructor(adn, x, y) {
        super(adn, 1, x, y); // niveau trophique 2
        this.type='BacterieHerbivore';
        this.couleur = getCouleur(this);
        this.ciblesTypes = [Cyanobacterie]; // proies préférées
        // Les herbivores voient moins loin mais se déplacent vite
        this.porteeVision *= 1.8;
        this.seuilReproduction = 200;
        this.vitesse +=3;
         this.ageMax += 200;
         this.force *= 2;
        this.valeurNutritive = 200;
        this.tempsGestation*=0.8;

        this.isToxic = adn.readBool('isToxic');
        if (this.isToxic) {
            this.toxicite = adn.readFloat("toxicite");
            this.toxine = adn.readBool('poison') ? 'acid' : 'neuro'
            this.metabolismeDeBase += 0.03 * this.toxicite;

        }
    }
    // peuvent pomper un peu de nutriments si vraiment c'est la galere, frere
    update(env, population, spatialHash) {
        const enfant = super.update(env, population, spatialHash);
        if(this.energie<this.seuilReproduction/4){
            // peut pomper un peu de nutriments
              const nutrimentConsomme = env.consommerNutriments(this.x, this.y, 1);
              this.energie+=nutrimentConsomme;
        }
        return enfant;
    }

    calculerBesoinPrimaire(env, organismesProches) {
        // Logique de chasse
        const me = this;
        let proie=null;
        // Filtrer les partenaires potentiels
        const proies = organismesProches.filter(o =>
            me.ciblesTypes.includes(o.org.constructor) &&
            o.distance <= me.porteeVision
        );
        if (proies.length == 0) { // peut becter des Sapro en enCas
             const proiesSapro = organismesProches.filter(o =>
                me.ciblesTypes.includes(Saprophyte) &&
                o.distance <= me.porteeVision
            );

        if (proiesSapro.length > 0) {
            // Prendre la proie la plus proche
             proie = proiesSapro.reduce((closest, current) =>
                current.distance < closest.distance ? current : closest
            );
        }
        }
        else if (proies.length > 0) {
            // Prendre la proie la plus proche
            proie = proies.reduce((closest, current) =>
                current.distance < closest.distance ? current : closest
            );
        }
        if(proie!=null)
            return this.tryAttackOn(proie, env);

        return { active: false, x: 0, y: 0 };
    }

}

/**Niveau 2 – Petits prédateurs / omnivores

Exemples : reptiles, oiseaux insectivores, petits poissons carnivores.

Caractéristiques :

Chassent les herbivores, parfois entre eux.

Certains mangent aussi les producteurs (flexibilité alimentaire).

Peuvent coopérer pour chasser ou voler les proies des autres.

Twist : présence de parasites internes → affaiblissent le prédateur et peuvent changer son comportement (plus agressif ou apathique). */
export class Bacille extends Predateur {
    constructor(adn, x, y) {
        super(adn, 2, x, y); // niveau trophique 2
        this.type='Bacille';
        this.couleur = getCouleur(this);
        this.ciblesTypes = [BacterieHerbivore, Nutrimentivore, Saprophyte]; // proies préférées
        // if (adn.readBool("carnivore"))
        //     this.ciblesTypes.push(Bacille);
        this.seuilReproduction = 900;
        // Les bacille voient  loin et sont plus fort
        this.force *= 5;
        this.ageMax += 300;
        this.porteeAttaque = 10;
        this.vitesse += 2;
        this.porteeVision *= 1.8;
        this.valeurNutritive = 150;
        this.tempsGestation*=1.5;
         this.metabolismeDeBase = clamp(adn.readFloat("metabolismeBase"), 1, 5);
    }

}

/**Niveau 3 – Prédateurs supérieurs

Exemples : loups, rapaces, gros carnassiers.

Caractéristiques :

Ne se nourrissent que de niveaux inférieurs.

Territoriaux → conflits intra-espèce fréquents.

Plus longue durée de vie → impact sur la stabilité des populations.

Twist : ils peuvent réguler indirectement la population des producteurs via la cascade trophique (en contrôlant les herbivores).
 */
export class Virus extends Predateur {
    constructor(adn, x, y) {
        super(adn, 3, x, y); // niveau trophique 3
        this.type='Virus';
        this.couleur = getCouleur(this);
        this.ciblesTypes = [Bacille,]; // proies préférées
        if (adn.readBool("chasseNutrivore"))
            this.ciblesTypes.push(Nutrimentivore);
        if (adn.readBool("chasseHerbivore"))
            this.ciblesTypes.push(BacterieHerbivore);
        if (adn.readBool("chasseSapro"))
            this.ciblesTypes.push(Saprophyte);
        if (adn.readBool("carnivore")&&Math.random()<0.1)
            this.ciblesTypes.push(Virus);

        // Les virus voient moins loin mais se déplacent vite et se reproduisent beaucoup mais meurent plus vite
        this.porteeVision *= 1.5;
        this.vitesse += 4;
        this.seuilReproduction = 120;
        this.force *= 3;
        this.valeurNutritive = 50;
        this.forceLien=0.01;
        this.longueurLien=100;
        this.ageMax *= 0.5
        this.metabolismeDeBase = clamp(adn.readFloat("metabolismeBase"), 1, 2);
    }

}


/**Niveau 4 – Super-prédateur opportuniste

Exemples : humain primitif, énorme carnassier rare.

Caractéristiques :

Chasse tout ce qui bouge, même d’autres super-prédateurs.

Peut "changer d’habitat" si les ressources locales sont faibles.

Très rare → la disparition complète change drastiquement la dynamique.

Twist : capable de charognage sur tous les niveaux → se maintient même en crise écologique.
 */
export class Amibe extends Predateur {
    constructor(adn, x, y) {
        super(adn, 4, x, y); // niveau trophique 3
        this.type='Amibe';
        this.couleur = getCouleur(this);
        this.ciblesTypes = [Cyanobacterie, BacterieHerbivore, Nutrimentivore, Bacille, Virus]; // proies préférées
        // Les amibes voient très loin mais se déplacent lentement et vivent longtemps
        this.porteeVision *= 2;
        this.seuilReproduction = 2000;
        this.ageMax*=2;
        this.vitesse =Math.max(0.5,this.vitesse* 0.3);
        this.porteeAttaque =  clamp(adn.readFloat("porteeAttaque"), 20, 40);
        this.tempsGestation+=100;
        this.force *= 3;
        this.valeurNutritive=1;
        this.metabolismeDeBase = clamp(adn.readFloat("metabolismeBase"), 1, 4);
    }

}
