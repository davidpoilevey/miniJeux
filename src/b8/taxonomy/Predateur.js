import { clamp, distance } from "../Taxonomy";
import { Organisme } from "./Organisme";


// Classe générique pour tout prédateur
export class Predateur extends Organisme {
    constructor(adn, niveau, x, y) {
        super(adn, niveau, x, y);
        this.force = adn.readFloat("force");
        this.coutResistance = 0.002 * this.resistanceToxine;
        this.porteeAttaque = 2;
        this.immobile = 0;
        this.ciblesTypes = []; // à définir dans les classes filles
    }

    update(env, population, spatialHash) {

        if (this.immobile > 0) {
            this.immobile--;
            return null;
        }
        const enfant = super.update(env, population, spatialHash);

        const toxinImpact = env.sampleToxin(this.x, this.y);
        this.energie += toxinImpact.energie * this.resistanceToxine;
        if (toxinImpact.stop) {
            this.immobile = Math.round(Math.random() * 300 * this.resistanceToxine);
        }

        if ((toxinImpact.stop || toxinImpact.energie > 0) )
          //   this.mourir();
            this.handleSurpopulation();// applique doigt Thanos

        //     // coût constitutif
        this.energie -= this.coutResistance;
        return enfant;
    }

    attaquer(proie, env, enCas) {
        if (!proie.vivant) return;

        const { esquive, tue, degats } = proie.defendre(this);

        if (!esquive) {
            // Gain partiel d’énergie en fonction des dégâts
            this.energie += proie.valeurNutritive * 0.2;

            if (tue) {
                if (enCas)
                    this.energie += proie.valeurNutritive / 3;// plus c'est gros, plus ca rapporte
                else
                    this.energie += proie.valeurNutritive * proie.radius / 4;// radius a 6 en moy
                proie.mourir();
                env.addNutriment(this.x, this.y, Math.min(100, proie.valeurNutritive / 10)); // entre 80 et 50

                // quantité de toxine émise : liée au gène toxine de la proie (0..1)
                if (proie.isToxic && Math.random() < 0.05) {// seulement 2% de chance, trop puissant

                    const toxicite = proie.adn.readFloat("toxicite");
                    const quantite = (proie.valeurNutritive || 50) * (0.5 + toxicite); // base + bonus
                    env.addToxin(proie.x, proie.y, quantite, proie.toxine || 'generic');

                    // gain du prédateur (facultatif : réduit si toxine forte)
                    const malusAssim = 1 - 0.3 * toxicite;
                    this.energie += (proie.energieInitialeAbsorbee || 20) * malusAssim;

                }
            }
        }
        else
            this.energie -= (proie.niveau + proie.radius);
    }
    calculerComportementDefaut(env, organismesProches) {
        // au pire par defaut, on peut grignoter un Cyano
        const proiesCyano = organismesProches.filter(o =>
            o.org.type === 'Cyanobacterie' &&
            o.distance <= this.porteeVision
        );
        if (proiesCyano.length > 0) {
            const proie = proiesCyano.reduce((closest, current) =>
                current.distance < closest.distance ? current : closest
            );
            return this.tryAttackOn(proie, env, true);
        }
        return { active: false, x: 0, y: 0 };
    }
    tryAttackOn(proie, env, enCas) {
        if (proie.distance < this.porteeAttaque) {
            this.attaquer(proie.org, env, enCas);
            return { active: false, x: 0, y: 0 };
        }

        // Calculer le mouvement souhaité
        const directionX = proie.dx / proie.distance;
        const directionY = proie.dy / proie.distance;
        let mouvementX = directionX * this.vitesse;
        let mouvementY = directionY * this.vitesse;

        // ✅ SÉCURITÉ : Limiter le mouvement maximum par frame
        const mouvementMax = this.vitesse; // ou une valeur fixe comme 3
        const mouvementActuel = Math.sqrt(mouvementX * mouvementX + mouvementY * mouvementY);

        if (mouvementActuel > mouvementMax) {
            const ratio = mouvementMax / mouvementActuel;
            mouvementX *= ratio;
            mouvementY *= ratio;
        }

        return {
            active: true,
            x: mouvementX,
            y: mouvementY
        };
    }
    calculerBesoinPrimaire(env, organismesProches) {
        // Logique de chasse
        const me = this;
        // Filtrer les partenaires potentiels
        const proies = organismesProches.filter(o =>
            me.ciblesTypes.includes(o.org.constructor) &&
            o.distance <= me.porteeVision
        );
        if (proies.length > 0) {
            // Prendre la proie la plus proche
            const proie = proies.reduce((closest, current) =>
                current.distance < closest.distance ? current : closest
            );
             const proiesDansPorteeAttaque = organismesProches.filter(o =>
            me.ciblesTypes.includes(o.org.constructor) &&
            o.distance <= me.porteeAttaque
        ).length;
        
        // Si trop de proies groupées, le prédateur subit des pénalités
        if (proiesDansPorteeAttaque >= 5) {
            //const penalite = (proiesDansPorteeAttaque - 9) * 0.5; // 0.5 énergie par proie supplémentaire    
            this.energie -= proiesDansPorteeAttaque; // Perte d'énergie due à la résistance groupée
        }
            return this.tryAttackOn(proie, env);
        }

        return { active: false, x: 0, y: 0 };
    }
}
