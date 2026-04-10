// meeUtils.js

import { ADNHandler, recombinaisonGenetique } from "../genetic/ADNPlante";
import imgClair from './clair.jpg';
import imgBrume from './brume.jpg';
import imgNeige from './neige.jpg';
import imgCanicule from './clair.jpg';
import imgPluie from './pluie.jpg';

const getAvatarSource=(pnj={sex:'M',age:1,avatarName:'joueur.png'})=>{
      const sexFolder=pnj.sex;
    const ageFolder=pnj.age<10?'jeune':(pnj.age<20?'adulte':'vieux');
    if(pnj.avatarName==null)
    {
        pnj.avatarName='joueur.png';
        
    }
    return sexFolder+'/'+ageFolder+'/'+pnj.avatarName;
}
const getRandomAvatar=()=>{
    const avatarName = 'avatar' + Math.floor(Math.random() * 20) + '.png';
    const sex=Math.random()>0.45?'F':'M';
    return getAvatarSource({sex, avatarName, age:2});
}
export const newEnfant = obj => {
    const { adnHandler, ...config } = obj;

    const enfant = {
        name: "Mee " + obj.id,
        color: meeColorFromADN(obj.adnHandler),
        ressources: 5,
        defenses: 1,
        sociabilite: adnHandler.readFloat('sociabilite'),
        reputation: 0.5,
        propCooperation: adnHandler.readFloat('cooperation'),
        propTrahison: adnHandler.readFloat('trahison'),
        ageMax: adnHandler.read10('ageMax') + 15,
        age: 0,
        icon: getRandomIcon(),
        avatar:getRandomAvatar(),
        confiance: [],
        memoire: [],
        alliances: [],
        bonusRecolte: 0,
        adn: adnHandler.mutatedVersion(),
        ...config
    };
    return enfant;
}
export function partageRessources(mees) {
    const traites = new Set();

    mees.forEach(mee => {
        if (traites.has(mee.id)) return;

        // Groupe d'alliés (lui-même + tous ses alliés)
        const groupe = [mee, ...mees.filter(m => (mee.alliances || []).includes(m.id))];
        groupe.forEach(m => traites.add(m.id));

        if (groupe.length > 1) {
            const total = groupe.reduce((sum, m) => sum + (m.ressources || 0), 0);

            // Calcul du "poids" de chaque Mee dans le partage
            // Plus propTrahison est élevé, plus le Mee prend
            const poids = groupe.map(m => 1 + (m.propTrahison || 0)); // base 1 pour tout le monde
            const sommePoids = poids.reduce((a, b) => a + b, 0);

            // Distribution pondérée
            let reste = total;
            groupe.forEach((m, idx) => {
                // Dernier Mee prend le reste pour éviter les arrondis cumulés
                if (idx === groupe.length - 1) {
                    m.ressources = reste;
                } else {
                    const part = Math.floor(total * (poids[idx] / sommePoids));
                    m.ressources = part;
                    reste -= part;
                }
            });
        }
    });

    return mees;
}
export const foncerHSL = (hslString, facteur = 0.6) => {
    // hslString du type "hsl(120, 70%, 80%)"
    const match = hslString.match(/^hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)$/);
    if (!match) return hslString; // fallback si le format n'est pas reconnu
    const [_, hue, sat, light] = match;
    // Multiplie la lightness par le facteur (ex: 0.6 pour foncer)
    const newLight = Math.max(0, Math.min(100, light * facteur));
    return `hsl(${hue}, ${sat}%, ${newLight}%)`;
}
// hsl1 et hsl2 sont des strings du type "hsl(120, 70%, 80%)"
function mixColor(hsl1, hsl2, stripeWidth = 8) {
    return `repeating-linear-gradient(
    135deg,
    ${hsl1}, 
    ${hsl1} ${stripeWidth}px, 
    ${hsl2} ${stripeWidth}px, 
    ${hsl2} ${stripeWidth * 2}px
  )`;
}

export const meeColorFromADN = (adnHandler) => {
    // Un float pour chaque composante
    const hue = Math.floor(adnHandler.readFloat('color_hue') * 360);
    const sat = 70 + Math.floor(adnHandler.readFloat('color_sat') * 30); // 70-100%
    const light = 50 + (adnHandler.read10('color_light') * 4); // 50-90%
    return `hsl(${hue}, ${sat}%, ${light}%)`;
}
function getRencontres(mee, allMees, nbRencontres) {
    const autres = allMees.filter(m => m.id !== mee.id);
    // Mélange aléatoire
    for (let i = autres.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [autres[i], autres[j]] = [autres[j], autres[i]];
    }
    return autres.slice(0, nbRencontres);
}
function nomClanAleatoire() {
    const syllabes = ["Ar", "Bel", "Dor", "Fen", "Gal", "Hel", "Ith", "Lor", "Mor", "Nor", "Or", "Pel", "Quel", "Ril", "Sor", "Tor"];
    return (
        syllabes[Math.floor(Math.random() * syllabes.length)] +
        syllabes[Math.floor(Math.random() * syllabes.length)] +
        "-" +
        Math.floor(1 + Math.random() * 9)
    );
}
function getRandomIcon() {

    const personIcons = [
        'Elderly', 'ElderlyWoman', 'AssistWalker', 'SportsMartialArts', 'Hail', 'Snowshoeing'
        , 'DirectionsWalk', 'DirectionsRun'];
    const Icon = personIcons[Math.floor(Math.random() * personIcons.length)];
    return Icon;
}
export const getMeeBorderPositions = (mees, width, height, meeSize = 32, margin = 10) => {
  const N = mees.length;
  const perSide = Math.ceil(N / 4);
  let positions = {};
  let idx = 0;

  // Haut
  for (let i = 0; i < perSide && idx < N; i++, idx++) {
    positions[mees[idx].id] = {
      x: margin + i * ((width - 2 * margin) / (perSide - 1 || 1)),
      y: margin
    };
  }
  // Droite
  for (let i = 0; i < perSide && idx < N; i++, idx++) {
    positions[mees[idx].id] = {
      x: width - margin - meeSize,
      y: margin + i * ((height - 2 * margin) / (perSide - 1 || 1))
    };
  }
  // Bas
  for (let i = 0; i < perSide && idx < N; i++, idx++) {
    positions[mees[idx].id] = {
      x: margin + i * ((width - 2 * margin) / (perSide - 1 || 1)),
      y: height - margin - meeSize
    };
  }
  // Gauche
  for (let i = 0; i < perSide && idx < N; i++, idx++) {
    positions[mees[idx].id] = {
      x: margin,
      y: margin + i * ((height - 2 * margin) / (perSide - 1 || 1))
    };
  }
  return positions;
};

export const getClanPositions = (mees, width, height) => {
  // Regroupe les Mee par clan
  const clans = {};
  mees.forEach(mee => {
    const key = mee.maisonId?.name || "noClan";
    clans[key] = clans[key] || [];
    clans[key].push(mee);
  });
  // Attribue à chaque clan une portion du bord (haut, bas, gauche, droite)
  const clanKeys = Object.keys(clans);
  const totalMee = mees.length;
  let positions = {};
  let clanIndex = 0;
  clanKeys.forEach((clanKey, idx) => {
    const clan = clans[clanKey];
    // Alterne les bords (haut, bas, gauche, droite)
    const side = idx % 4;
    if(clanKey==='noClan'){
        const noClanPositions=getMeeBorderPositions(clan,width, height);
        positions = Object.assign(positions, noClanPositions);
    }
    else
    clan.forEach((mee, i) => {
      let x, y;
      if (side === 0) { // haut
        x = (width / (clan.length + 1)) * (i + 1);
        y = 20;
      } else if (side === 1) { // droite
        x = width - 40;
        y = (height / (clan.length + 1)) * (i + 1);
      } else if (side === 2) { // bas
        x = (width / (clan.length + 1)) * (i + 1);
        y = height - 40;
      } else { // gauche
        x = 20;
        y = (height / (clan.length + 1)) * (i + 1);
      }
      positions[mee.id] = { x, y };
    });
  });
  return positions;
};

export function getMeeNickname(mee) {
    // Valeurs seuils à ajuster selon ta simulation
    const coop = mee.propCooperation ?? 0;
    const trahison = mee.propTrahison ?? 0;
    const sociabilite = mee.sociabilite ?? 0;
    const reputation = mee.reputation ?? 0;
    const age = mee.age ?? 0;
    const ageMax = mee.ageMax ?? 1;
    const nbAlliances = mee.alliances?.length ?? 0;
    const nbBaise = mee.memoire?.filter(m => m.type === "sex").length ?? 0;
    const nbVolsEchoué = mee.memoire?.filter(m => m.type === "vol" && m.resultat === 'echec').length ?? 0;
    const nbVolReussi = mee.memoire?.filter(m => m.type === "vol" && m.resultat === 'reussi').length ?? 0;
    const nbCoopOk = mee.memoire?.filter(m => m.type === "coop" && m.resultat === "ok").length ?? 0;
    const nbCoopExploite = mee.memoire?.filter(m => m.type === "coop" && m.resultat === "exploite").length ?? 0;
    const nbCoopProfiteur = mee.memoire?.filter(m => m.type === "coop" && m.resultat === "profiteur").length ?? 0;
    const nbCoopTotal = mee.memoire?.filter(m => m.type === "coop").length ?? 0;
    const nbVolTotal = mee.memoire?.filter(m => m.type === "vol").length ?? 0;


    let nick = '';
    // Cas particuliers
    if (reputation < 0.25 && nbVolReussi - nbVolsEchoué < -3) return "Le bandit manchot";
    if (reputation > 0.4 && nbVolReussi - nbVolsEchoué > 3) return "Arsene Lupin";
    if (reputation < 0.1 && nbVolReussi - nbVolsEchoué > 5) return "Maitre du crime";
    if (reputation > 0.8 && nbAlliances > 4 && sociabilite > 0.6) return "Leader";
    if (coop > 0.7 && reputation > 0.7 && trahison < 0.2 && nbCoopOk > 5) return "Super ami";

    // nom principale
    if (nbVolReussi - nbVolsEchoué < -5) nick = 'Loser';
    if (nbVolReussi - nbVolsEchoué > 5) nick = 'Winner';
    if (nbBaise > 2) nick += ' Casanova';
    if (reputation > 0.4 && nbVolReussi - nbVolsEchoué > 2 && nbAlliances > 2) nick += "Robin des bois";
    if (reputation < 0.3 && nbVolReussi - nbVolsEchoué > 3) nick += " Rapetou";
    if (reputation > 0.2 && nbVolReussi - nbVolsEchoué < -2) nick += " Robin des noix";
    if (reputation < 0.2 && nbVolReussi - nbVolsEchoué < 0) nick += " Connard";
    if (coop > 0.6 && reputation > 0.5 && trahison < 0.3 && (nbVolReussi+nbVolsEchoué)<5) nick += " Copain";
    if (sociabilite < 0.3 && coop > 0.5 && trahison < 0.3 && nbAlliances < 2) nick += " Introverti";
    if (sociabilite > 0.7 && coop > 0.7 && trahison > 0.6) nick += " Sarkozy";
    if (sociabilite < 0.2 && coop < 0.4 && nbAlliances < 2 && nbCoopOk < 3) nick += " Leon";
    // ... qualificatifs
    if (nbCoopExploite / nbCoopTotal > 0.4) nick += ' la bonne poire';
    if (nbCoopOk / nbCoopTotal > 0.4) nick += ' esclave';
    if (nbCoopProfiteur / nbCoopTotal > 0.3) nick += " l'enculé";
    if (nbCoopProfiteur - nbCoopExploite > 3) nick += " abuseur";
    if (nbCoopProfiteur - nbCoopExploite < -3) nick += " stagiaire";
    if ((nbVolReussi + nbVolsEchoué) / nbVolTotal < 0.25) nick += ' victime'


    if (nick === '')
        nick = 'John Doe';
    if (age / ageMax > 0.8)
        nick += ' le vieux';
    if (age / ageMax < 0.2)
        nick += ' le jeune';

    // Par défaut
    return nick;
}

function ruptureDalliance(mee, autreMee) {
    mee.alliances = (mee.alliances || []).filter(id => id !== autreMee.id);
    autreMee.alliances = (autreMee.alliances || []).filter(id => id !== mee.id);
}
export function nouvelleMeteo() {
    // Tu peux enrichir ce tableau selon tes envies
    const meteoTypes = [
        { nom: "Clair", coutSurvie: 1.5, bonusPommes: -1, background: `url(${imgClair})`, proba: 0.3 },
        { nom: "Canicule", coutSurvie: 4, bonusPommes: -5, background: `url(${imgCanicule})`, proba: 0.15 },
        { nom: "Pluie", coutSurvie: 2, bonusPommes: -3, background: `url(${imgPluie})`, proba: 0.2 },
        { nom: "Neige", coutSurvie: 3, bonusPommes: -4, background: `url(${imgNeige})`, proba: 0.15 },
        { nom: "Brume", coutSurvie: 2.5, bonusPommes: 0, background: `url(${imgBrume})`, proba: 0.2 }
    ];
    const total = meteoTypes.reduce((sum, m) => sum + m.proba, 0);
    // 2. Tirage aléatoire
    const r = Math.random() * total;
    // 3. Parcours pour trouver la météo correspondante
    let acc = 0;
    for (let i = 0; i < meteoTypes.length; i++) {
        acc += meteoTypes[i].proba;
        if (r < acc) return meteoTypes[i];
    }
    // Sécurité (au cas où)
    return meteoTypes[meteoTypes.length - 1];
}

export function phaseMaison(mees, nextId, coutSurvie, config) {
    // Avant partageRessources
    const ressourcesAvant = {};
    mees.forEach(mee => {
        ressourcesAvant[mee.id] = mee.ressources;
    });

    let newMees = partageRessources(JSON.parse(JSON.stringify(mees)));
    // Après partage
    let maxDon = 0;
    const dons = {};
    newMees.forEach(mee => {
        const don = Math.max(0, (ressourcesAvant[mee.id] || 0) - mee.ressources);
        dons[mee.id] = don;
        if (don > maxDon) maxDon = don;
    });
    newMees.forEach(mee => {
        if (dons[mee.id] === maxDon && maxDon > 0) {
            mee.reputation = Math.min(1, (mee.reputation ?? 0) + config.MOYENNE_CONFIANCE);
            mee.memoire.push({ type: "partage", resultat: "généreux", avec: mee.maisonId || 'Communauté' });
        }
    });

    // Consommation et mort
    newMees = newMees.filter(mee => {
        if (mee.ressources >= coutSurvie && mee.age < mee.ageMax) {
            mee.ressources -= coutSurvie;
            mee.age++;
            mee.defenses = 0;
            if (mee.reputation < config.GRANDE_CONFIANCE && mee.maisonId) {
                mee.maisonId = null; // les mauvaises reputations perd son appartenance au clan
            }
            return true;
        }
        return false;
    });
    // Liste des ids vivants
    const idsVivants = new Set(newMees.map(m => m.id));


    // Regroupe les Mee par clan
    const clans = {};
    newMees.forEach(mee => {
         if (mee.maisonId) {
                const key = mee.maisonId?.name??mee.maisonId; // Utilise un identifiant unique
                clans[key] = clans[key] || [];
                clans[key].push(mee);
            }
        // Purge des liens morts
        // Alliances : ne garder que les vivants
        mee.alliances = (mee.alliances || []).filter(id => idsVivants.has(id));
        mee.memoire = mee.memoire.slice(-100);
        // Confiance : ne garder que les vivants
        if (mee.confiance) {
            Object.keys(mee.confiance).forEach(id => {
                if (!idsVivants.has(Number(id))) {
                    delete mee.confiance[id];
                }
            });
        }
    });

    const seuil = Math.max(6, Math.floor(newMees.length / 2));// on ne splitte pas quand les temps sont durs

    Object.entries(clans).forEach(([clanId, membres]) => {
        if (membres.length > seuil) {
            // SCISSION : on crée un nouveau clan pour la moitié des membres
            const half = Math.floor(membres.length / 2);
            const nouveauxMembres = membres.slice(0, half);
            const nouveauClan = {
                name: nomClanAleatoire(),
                color: mixColor(membres[membres.length - 1].color, membres[half].color),
            };
            const nouveauClanIds = nouveauxMembres.map(m => m.id);
            nouveauxMembres.forEach(mee => {
                mee.maisonId = nouveauClan;
                mee.alliances = mee.alliances.filter(id => nouveauClanIds.includes(id) && id !== mee.id);
            });
            const anciensMembres = membres.slice(half, membres.length);
            const ancienClanIds = anciensMembres.map(m => m.id);
            anciensMembres.forEach(mee => {
                mee.alliances = mee.alliances.filter(id => ancienClanIds.includes(id) && id !== mee.id);
            });

            // Les autres gardent leur clan d'origine
        }
    });



    // Reproduction
    const enfants = [];
    newMees.forEach(mee => {
        const nbRencontres = Math.min(Math.max(1, Math.round(mee.sociabilite * newMees.length)), 15);
        const rencontres = getRencontres(mee, newMees, nbRencontres);
        rencontres.forEach(autreMee => {
            if (
                mee.ressources >= config.seuilRepro &&
                autreMee.ressources >= config.seuilRepro &&
                (mee.confiance[autreMee.id] ?? 0.5) > 0.5 &&
                (autreMee.confiance[mee.id] ?? 0.5) > 0.5
            ) {
                if (Math.random() < config.probaBaseRepro) {
                    mee.memoire.push({ avec: autreMee.id, type: "sex", resultat: "sex" });
                    autreMee.memoire.push({ avec: mee.id, type: "sex", resultat: "sex" });
                    const enfantsAdn = recombinaisonGenetique(mee.adn, autreMee.adn);
                    const enfantAdn = enfantsAdn[0];
                    const adnHandler = new ADNHandler(enfantAdn);
                    const enfant = newEnfant({
                        id: nextId.current++, adnHandler: adnHandler
                        , maisonId: mee.maisonId || autreMee.maisonId,
                        y: mee.y,
                        x: (mee.x + autreMee.x) / 2,
                        icon: mee.icon,
                        ageMax: adnHandler.read10('ageMax') + config.ESPERANCE_VIE||10,
                        confiance: { ...mee.confiance, [mee.id]: 1, [autreMee.id]: 1 }
                    });

                    mee.ressources = Math.ceil(mee.ressources / 2);
                    autreMee.ressources = Math.ceil(autreMee.ressources / 2);
                    enfants.push(enfant);
                }
            }
        });
    });
    return [...newMees, ...enfants];
}

export function phaseDepart(mees, NB_MEE,config) {
    mees.forEach(mee => {
        const nbRencontres = Math.min(Math.max(1, Math.round(mee.sociabilite * NB_MEE)), 5);
        const rencontres = getRencontres(mee, mees, nbRencontres);
        rencontres.forEach(autreMee => {
            const confiance = mee.confiance[autreMee.id] ?? 0.5;
            if (Math.random() < mee.propCooperation * confiance) {
                const confianceReciproque = autreMee.confiance[mee.id] ?? 0.5;

                const coopMee = Math.random() < mee.propCooperation * confiance;
                const coopAutre = Math.random() < autreMee.propCooperation * confianceReciproque;
                if (coopMee && coopAutre) {
                    // Les deux coopèrent : bonus optimal
                    mee.bonusRecolte += 1;
                    autreMee.bonusRecolte += 1;
                    mee.reputation = Math.min(1, mee.reputation + config.MOYENNE_CONFIANCE);
                    autreMee.reputation = Math.min(1, autreMee.reputation + config.MOYENNE_CONFIANCE);
                    mee.memoire.push({ avec: autreMee.id, type: "coop", resultat: "ok" });
                    autreMee.memoire.push({ avec: mee.id, type: "coop", resultat: "ok" });
                    mee.confiance[autreMee.id] = Math.min(1, confiance + config.GRANDE_CONFIANCE);
                    autreMee.confiance[mee.id] = Math.min(1, confianceReciproque + config.GRANDE_CONFIANCE);
                } else if (coopMee && !coopAutre) {
                    // Mee coopère, l'autre trahit
                    mee.bonusRecolte += 0; // ou -0.2 pour pénaliser la naïveté
                    autreMee.bonusRecolte += 1.5; // le traître gagne plus
                    mee.reputation = Math.max(0, mee.reputation + config.MOYENNE_CONFIANCE);
                    autreMee.reputation = Math.min(1, autreMee.reputation - config.MOYENNE_CONFIANCE);
                    mee.memoire.push({ avec: autreMee.id, type: "coop", resultat: "exploite" });
                    autreMee.memoire.push({ avec: mee.id, type: "coop", resultat: "profiteur" });
                    mee.confiance[autreMee.id] = Math.max(0, confiance - config.MOYENNE_CONFIANCE);
                    autreMee.confiance[mee.id] = Math.min(1, confianceReciproque + config.PETITE_CONFIANCE);
                    ruptureDalliance(mee, autreMee);
                } else if (!coopMee && coopAutre) {
                    // Mee trahit, l'autre coopère
                    mee.bonusRecolte += 1.5;
                    autreMee.bonusRecolte += 0; // ou -0.2
                    mee.reputation = Math.min(1, mee.reputation - config.MOYENNE_CONFIANCE);
                    autreMee.reputation = Math.max(0, autreMee.reputation + config.MOYENNE_CONFIANCE);
                    mee.memoire.push({ avec: autreMee.id, type: "coop", resultat: "profiteur" });
                    autreMee.memoire.push({ avec: mee.id, type: "coop", resultat: "exploite" });
                    mee.confiance[autreMee.id] = Math.min(1, confiance + config.PETITE_CONFIANCE);
                    autreMee.confiance[mee.id] = Math.max(0, confianceReciproque - config.MOYENNE_CONFIANCE);
                    ruptureDalliance(mee, autreMee);
                } else {
                    // Les deux trahissent : aucun bonus, voire pénalité
                    mee.bonusRecolte += 0;
                    autreMee.bonusRecolte += 0;
                    mee.reputation = Math.max(0, mee.reputation - config.PETITE_CONFIANCE);
                    autreMee.reputation = Math.max(0, autreMee.reputation - config.PETITE_CONFIANCE);
                    mee.memoire.push({ avec: autreMee.id, type: "coop", resultat: "trahison" });
                    autreMee.memoire.push({ avec: mee.id, type: "coop", resultat: "trahison" });
                    mee.confiance[autreMee.id] = Math.max(0, confiance - config.PETITE_CONFIANCE);
                    autreMee.confiance[mee.id] = Math.max(0, confianceReciproque - config.PETITE_CONFIANCE);
                    ruptureDalliance(mee, autreMee);
                }

            }
            if (confiance > config.SEUIL_ALLIANCE && !mee.alliances.includes(autreMee.id)) {
                if (Math.random() < mee.propCooperation) {
                    mee.alliances.push(autreMee.id);
                    autreMee.alliances.push(mee.id);

                    // Gestion des clans
                    if (!mee.maisonId && !autreMee.maisonId) {
                        // Aucun clan : on crée un nouveau clan pour les deux
                        const clan = { name: nomClanAleatoire(), color: mixColor(mee.color, autreMee.color) };
                        mee.maisonId = clan;
                        autreMee.maisonId = clan;
                    } else if (mee.maisonId && !autreMee.maisonId) {
                        // Mee a un clan, l'autre le rejoint
                        autreMee.maisonId = mee.maisonId;
                    } else if (!mee.maisonId && autreMee.maisonId) {
                        // AutreMee a un clan, Mee le rejoint
                        mee.maisonId = autreMee.maisonId;
                    } else if (mee.maisonId.name !== autreMee.maisonId.name) {
                        // Les deux ont déjà des clans différents
                        // On utilise propTrahison pour voir si l'un trahit son clan
                        // On prend le Mee le plus enclin à trahir
                        const probaMee = mee.propTrahison || 0;
                        const probaAutre = autreMee.propTrahison || 0;
                        if (Math.random() < probaMee && probaMee > probaAutre) {
                            // Mee trahit son clan et rejoint celui de l'autre
                            mee.maisonId = autreMee.maisonId;
                        } else if (Math.random() < probaAutre && probaAutre > probaMee) {
                            // AutreMee trahit son clan et rejoint celui de Mee
                            autreMee.maisonId = mee.maisonId;
                        } else {
                            // Personne ne veut trahir, l'alliance ne se fait pas
                            // On retire l'alliance qui vient d'être ajoutée
                            mee.alliances.pop();
                            autreMee.alliances.pop();
                        }
                    }
                }
            }

        });
    });
    return mees;
}

export function phaseVerger(mees, meteo) {
    mees.forEach(mee => {
        mee.ressources += Math.max(1, (1 + (mee.bonusRecolte || 0) + meteo.bonusPommes));
        mee.bonusRecolte /= 2;
    });
    return mees;
}

export function phaseRetour(mees, config) {

    mees.forEach(mee => {

        if (Math.random() < mee.propTrahison * (1 - mee.reputation)) {
            const autres = mees.filter(m => m.id !== mee.id && m.ressources > 0 && !(mee.alliances || []).includes(m.id));
            if (autres.length > 0) {
                autres.sort((a, b) => b.ressources - a.ressources);
                const cible = autres[0];
                const attaquants = mees.filter(m => m.id === mee.id || (mee.alliances || []).includes(m.id));
                const attaque = attaquants.reduce((sum, m) => sum + (m.defenses || 0), 0);
                const defenseurs = mees.filter(m => m.id === cible.id || (cible.alliances || []).includes(m.id));
                const defense = defenseurs.reduce((sum, m) => sum + (m.defenses || 0), 0);
                if (attaque >= defense) {
                    const gain = cible.ressources / 4;
                    mee.ressources += gain;
                    cible.ressources -= gain;
                    mee.memoire.push({ avec: cible.id, type: "vol", resultat: "reussi" });
                    cible.memoire.push({ avec: mee.id, type: "vol", resultat: "subi" });
                    cible.confiance[mee.id] = Math.max(0, (cible.confiance[mee.id] ?? 0.5) - config.GRANDE_CONFIANCE);
                    mee.reputation = Math.max(0, mee.reputation - config.PETITE_CONFIANCE);
                    mee.confiance[cible.id] = Math.max(0, (mee.confiance[cible.id] ?? 0.5) + config.PETITE_CONFIANCE);
                } else {
                    mee.memoire.push({ avec: cible.id, type: "vol", resultat: "echec" });
                    cible.memoire.push({ avec: mee.id, type: "vol", resultat: "defendu" });
                    mee.reputation = Math.max(0, mee.reputation - config.PETITE_CONFIANCE);
                    cible.confiance[mee.id] = Math.max(0, (cible.confiance[mee.id] ?? 0.5) + config.PETITE_CONFIANCE);
                }
            }
        }
    });
    return mees;
}

// Ajoute ici getRencontres, etc.
