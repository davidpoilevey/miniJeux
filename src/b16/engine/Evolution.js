import { mutationADN, randomGenome, recombinaisonGenetique } from '../../genetic/ADNPlante';
import { adnVersTexte, decrireMorphotype, lireCorps, texteVersAdn } from './corps';
import { Creature, DT } from './Creature';
import { DEFAULT_PARAMS } from './params';
import { Terrain, ZONES } from './terrain';

// Le moteur pur (ni React ni DOM) : une génération = une course de `duree` secondes,
// tout le monde sur la même piste. À l'arrivée : classement, sélection, reproduction.

const SYLLABES = ['bu', 'zo', 'ra', 'ki', 'lo', 'mu', 'pa', 'gri', 'fla', 'tor', 'vi', 'nu', 'do', 'sha', 'pi', 'ru', 'ga', 'mo', 'té', 'lu', 'bo', 'zi', 'ka', 'plo'];
const hasard = (k) => { const s = Math.sin(k * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };
const nomEspece = (id) => {
  const n = 2 + (hasard(id) > 0.6 ? 1 : 0);
  let nom = '';
  for (let k = 0; k < n; k++) nom += SYLLABES[Math.floor(hasard(id * 7 + k * 13) * SYLLABES.length)];
  return nom[0].toUpperCase() + nom.slice(1);
};

export const couleurEspece = (e, l = 60, a = 1) => `hsla(${e.teinte}, 70%, ${l}%, ${a})`;

export class Evolution {
  constructor(params = { ...DEFAULT_PARAMS }, sauvegarde = null) {
    this.params = params;
    this.especes = new Map();  // « mère>plan » → espèce
    this.especesParId = [];
    this.champions = [];       // le n°1 de chaque génération
    this.historique = [];
    this.chronique = [];
    this.record = { distance: 0, generation: 0 };
    this.zoneAtteinte = 0;
    this.generation = 1;
    this.prochainId = 1;
    this.especeEnTete = null;

    if (sauvegarde) this.restaurer(sauvegarde);
    else {
      this.population = Array.from({ length: params.population }, () => this.naitre(randomGenome(), null));
      this.raconter('🥚 Première génération : des corps tirés au hasard. La plupart ne savent même pas ramper.');
    }
    this.lancerCourse();
  }

  naitre(adn, especeParent) {
    const corps = lireCorps(adn);
    const espece = this.especeDe(corps.plan, especeParent);
    return { id: this.prochainId++, adn, corps, espece: espece.id, elite: false };
  }

  // Espèce généalogique : l'enfant reste dans l'espèce de son parent tant que son plan
  // (nœuds, griffes) ne change pas. Sinon il fonde une espèce fille — une seule par
  // mère et par plan, pour qu'une même mutation qui revient ne crée pas des jumelles.
  especeDe(plan, parent) {
    const mere = parent == null ? null : this.especesParId[parent];
    if (mere && mere.plan === plan) return mere;
    const cle = `${mere ? mere.id : 'racine'}>${plan}`;
    let e = this.especes.get(cle);
    if (!e) {
      const id = this.especesParId.length;
      e = { id, plan, nom: nomEspece(id), teinte: (id * 137.508 + 200) % 360, parent: mere ? mere.id : null, nee: this.generation, record: 0 };
      this.especes.set(cle, e);
      this.especesParId.push(e);
    }
    return e;
  }

  raconter(texte) {
    this.chronique.unshift({ generation: this.generation, texte });
    if (this.chronique.length > 60) this.chronique.pop();
  }

  lancerCourse() {
    if (!this.terrain || this.terrain.relief !== this.params.relief) this.terrain = new Terrain(this.params.relief);
    this.duree = this.params.duree;
    this.t = 0;
    this.creatures = this.population.map((ind) => new Creature(ind.corps, this.terrain));
  }

  // Un pas de 1/60 s pour toute la population. Renvoie true si la génération vient de changer.
  pas() {
    const P = this.params;
    for (let k = 0; k < this.creatures.length; k++) this.creatures[k].pas(P, this.terrain);
    this.t += DT;
    if (this.t >= this.duree - 1e-9) { this.finGeneration(); return true; }
    return false;
  }

  // Distance nette : on retire le coût de l'effort (amplitude × force × nombre de battements)
  fitness(ind, c) {
    if (c.disqualifiee) return -1;
    const P = this.params;
    const battements = (P.freqMin + (P.freqMax - P.freqMin) * ind.corps.rythme) * (this.duree - P.echauffement);
    return c.distance - P.coutEnergie * ind.corps.effort * battements;
  }

  // Le meneur en direct (pour la caméra et la couronne)
  classementEnDirect() {
    return this.creatures
      .map((c, k) => k)
      .filter((k) => !this.creatures[k].disqualifiee)
      .sort((a, b) => this.creatures[b].distance - this.creatures[a].distance);
  }

  finGeneration() {
    const res = this.population.map((ind, k) => ({ ind, c: this.creatures[k], f: this.fitness(ind, this.creatures[k]) }));
    res.sort((a, b) => b.f - a.f);
    const premier = res[0];
    const espece = this.especesParId[premier.ind.espece];

    // ── Chronique ──
    if (premier.c.distance > this.record.distance + 0.05) {
      const gain = premier.c.distance - this.record.distance;
      this.raconter(`🏆 Record : un ${espece.nom} parcourt ${premier.c.distance.toFixed(1)} m (+${gain.toFixed(1)})`);
      this.record = { distance: premier.c.distance, generation: this.generation };
    }
    const zone = this.terrain.zoneEn(Math.max(...res.map((r) => r.c.maxX)));
    if (zone > this.zoneAtteinte) {
      this.zoneAtteinte = zone;
      this.raconter(`🚩 Premier pas dans la zone « ${ZONES[zone].nom} »`);
    }
    if (this.especeEnTete !== espece.id) {
      if (this.especeEnTete !== null) this.raconter(`👑 Les ${espece.nom} prennent la tête (${decrireMorphotype(premier.ind.corps.morphotype)})`);
      this.especeEnTete = espece.id;
    }
    const tricheurs = res.filter((r) => r.c.disqualifiee);
    if (tricheurs.length) this.raconter(`🚫 ${tricheurs.length} disqualifié${tricheurs.length > 1 ? 's' : ''} (${tricheurs[0].c.disqualifiee})`);

    // ── Archives ──
    res.forEach((r) => {
      const e = this.especesParId[r.ind.espece];
      e.record = Math.max(e.record, r.c.distance);
    });
    this.champions.push({
      generation: this.generation,
      adn: premier.ind.adn,
      corps: premier.ind.corps,
      distance: premier.c.distance,
      fitness: premier.f,
      espece: espece.id,
    });
    const distances = res.map((r) => r.c.distance).sort((a, b) => a - b);
    const effectifs = {};
    res.forEach((r) => { effectifs[r.ind.espece] = (effectifs[r.ind.espece] || 0) + 1; });
    this.historique.push({
      generation: this.generation,
      meilleur: premier.c.distance,
      mediane: distances[distances.length >> 1],
      effectifs,
    });

    this.population = this.selection(res, effectifs);
    this.generation++;
    this.lancerCourse();
  }

  selection(res, effectifs) {
    const P = this.params;
    const N = Math.round(P.population);
    const suivante = [];

    // Élites : le n°1, puis le meilleur de chacune des espèces suivantes.
    // Recopiés tels quels : ils recourent la même course, le record ne régresse jamais.
    const vues = new Set();
    for (const r of res) {
      if (suivante.length >= Math.min(P.elites, N)) break;
      if (vues.has(r.ind.espece) || r.f <= 0) continue;
      vues.add(r.ind.espece);
      suivante.push({ ...r.ind, id: this.prochainId++, elite: true });
    }

    // Partage de fitness : une espèce nombreuse divise ses scores.
    // Une nouvelle forme, encore mal réglée, n'est pas écrasée tout de suite par la majorité.
    const ajustee = res.map((r) => Math.max(0, r.f) / Math.pow(effectifs[r.ind.espece], P.partage));
    const tournoi = (candidats) => {
      let meilleur = candidats[Math.floor(Math.random() * candidats.length)];
      for (let k = 1; k < P.tournoi; k++) {
        const c = candidats[Math.floor(Math.random() * candidats.length)];
        if (ajustee[c] > ajustee[meilleur]) meilleur = c;
      }
      return meilleur;
    };
    const tous = res.map((_, k) => k);
    const parEspece = {};
    tous.forEach((k) => { (parEspece[res[k].ind.espece] ||= []).push(k); });

    while (suivante.length < N) {
      if (Math.random() < P.immigrants) {
        suivante.push(this.naitre(randomGenome(), null));
        continue;
      }
      const p1 = res[tournoi(tous)].ind;
      let adn = p1.adn;
      const memes = parEspece[p1.espece];
      if (Math.random() < P.croisement && memes.length > 1) {
        const p2 = res[tournoi(memes)].ind;
        if (p2 !== p1) adn = recombinaisonGenetique(p1.adn, p2.adn)[Math.random() < 0.5 ? 0 : 1];
      }
      suivante.push(this.naitre(mutationADN(adn, P.tauxMutation), p1.espece));
    }
    return suivante;
  }

  // ── Sauvegarde : les génomes en texte, le reste tel quel ──
  exporter() {
    return {
      jeu: 'bacterie16',
      version: 1,
      date: new Date().toISOString(),
      params: this.params,
      generation: this.generation,
      record: this.record,
      zoneAtteinte: this.zoneAtteinte,
      especes: this.especesParId,
      historique: this.historique,
      chronique: this.chronique,
      champions: this.champions.map(({ corps, adn, ...c }) => ({ ...c, adn: adnVersTexte(adn) })),
      population: this.population.map((ind) => ({ adn: adnVersTexte(ind.adn), espece: ind.espece })),
    };
  }

  restaurer(s) {
    this.generation = s.generation;
    this.record = s.record;
    this.zoneAtteinte = s.zoneAtteinte || 0;
    this.historique = s.historique || [];
    this.chronique = s.chronique || [];
    (s.especes || []).forEach((e) => {
      this.especes.set(`${e.parent ?? 'racine'}>${e.plan}`, e);
      this.especesParId.push(e);
    });
    this.champions = (s.champions || []).map((c) => {
      const adn = texteVersAdn(c.adn);
      return { ...c, adn, corps: lireCorps(adn) };
    });
    // Chacun retrouve son espèce (ou en fonde une si la lecture du corps a changé entre deux versions)
    this.population = s.population.map((p) => this.naitre(texteVersAdn(p.adn), p.espece));
    this.raconter(`💾 Sauvegarde du ${new Date(s.date).toLocaleString()} rechargée`);
  }
}

// Le replay d'un champion : seul sur la piste, avec sa chronophotographie à la Marey
// (une pose figée tous les 70 cm, pour lire la démarche d'un coup d'œil).
export class Replay {
  constructor(champion, params, terrain) {
    this.champion = champion;
    this.params = params;
    this.terrain = terrain;
    this.duree = params.duree;
    this.redemarrer();
  }

  redemarrer() {
    this.creature = new Creature(this.champion.corps, this.terrain);
    this.poses = [];
    this.t = 0;
    this.dernierePose = -Infinity;
  }

  pas() {
    if (this.t >= this.duree + 2) this.redemarrer();
    if (this.t < this.duree) this.creature.pas(this.params, this.terrain);
    this.t += DT;
    const c = this.creature, x = c.comX();
    if (this.t <= this.duree && Math.abs(x - this.dernierePose) > 0.7) {
      this.dernierePose = x;
      this.poses.push({ px: Float64Array.from(c.px), py: Float64Array.from(c.py) });
    }
  }
}
