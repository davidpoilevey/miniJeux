import { mutationADN, randomGenome, recombinaisonGenetique } from '../../genetic/ADNPlante';
import { EMPLACEMENTS, adnVersTexte, decrireMorphotype, lireCorps, texteVersAdn } from './corps';
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

// Croisement de champions : l'enfant garde le corps du premier parent et reçoit `part` des gènes
// du second, entiers. Le croisement de la bible (moitié-moitié, nucléotides mêlés) fait d'un ver
// et d'un quadrupède un corps quasi aléatoire : mesuré, aucun hybride n'atteint 90 % de son parent.
// Renvoie [adn, part réellement reçue].
const GENES = Object.values(EMPLACEMENTS);
const introgression = (a, b, part) => {
  const enfant = a.slice(); // les chromosomes ne sont jamais modifiés en place (mutationADN copie)
  let n = 0;
  GENES.forEach((k) => { if (Math.random() < part) { enfant[k] = b[k]; n++; } });
  return [enfant, n / GENES.length];
};

export const couleurEspece = (e, l = 60, a = 1) => `hsla(${e.teinte}, 70%, ${l}%, ${a})`;

// « Bupa 62 % · Kiru 31 % » : la part de sang des fondateurs (course des champions)
export const decrireHeritage = (heritage, fondateurs, n = 2) => {
  if (!heritage || !fondateurs.length) return '';
  const parts = heritage.map((h, i) => ({ h, nom: fondateurs[i].nom })).filter((p) => p.h >= 0.005).sort((a, b) => b.h - a.h);
  if (!parts.length) return 'sauvage';
  if (parts[0].h > 0.97) return `pur ${parts[0].nom}`;
  return parts.slice(0, n).map((p) => `${p.nom} ${Math.round(p.h * 100)} %`).join(' · ');
};

export class Evolution {
  // fondateurs : des fiches du catalogue → course des champions (un exemplaire de chacun au départ)
  constructor(params = { ...DEFAULT_PARAMS }, sauvegarde = null, fondateurs = null) {
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
    this.fondateurs = [];      // course des champions : { nom, teinte, distance }
    this.recordFondateurs = null; // le meilleur fondateur, mesuré sur cette piste à la génération 1
    this.eteints = new Set();  // fondateurs dont plus personne ne porte le sang

    if (sauvegarde) this.restaurer(sauvegarde);
    else if (fondateurs) this.semer(fondateurs);
    else {
      this.population = Array.from({ length: params.population }, () => this.naitre(randomGenome(), null));
      this.raconter('🥚 Première génération : des corps tirés au hasard. La plupart ne savent même pas ramper.');
    }
    this.lancerCourse();
  }

  naitre(adn, especeParent, heritage = null) {
    const corps = lireCorps(adn);
    const espece = this.especeDe(corps.plan, especeParent);
    return { id: this.prochainId++, adn, corps, espece: espece.id, elite: false, heritage };
  }

  // Course des champions : chacun fonde son espèce, sous son nom, avec tout son sang
  semer(fiches) {
    const k = fiches.length;
    this.fondateurs = fiches.map((f) => ({ nom: f.nom, teinte: f.teinte, distance: f.distance }));
    this.population = fiches.map((f, i) => {
      const adn = texteVersAdn(f.adn);
      const corps = lireCorps(adn);
      const e = this.fonderEspece(`fondateur${i}>${corps.plan}`, corps.plan, null, { nom: f.nom, teinte: f.teinte, fondateur: i });
      const heritage = new Array(k).fill(0);
      heritage[i] = 1;
      return { id: this.prochainId++, adn, corps, espece: e.id, elite: false, heritage, fondateur: true };
    });
    this.raconter(`🏁 Course des champions : ${k} champions sur la ligne, un seul exemplaire de chacun. Pendant ${this.params.vieFondateurs} générations, tout le monde se croise avec tout le monde.`);
  }

  // Espèce généalogique : l'enfant reste dans l'espèce de son parent tant que son plan
  // (nœuds, griffes) ne change pas. Sinon il fonde une espèce fille — une seule par
  // mère et par plan, pour qu'une même mutation qui revient ne crée pas des jumelles.
  especeDe(plan, parent) {
    const mere = parent == null ? null : this.especesParId[parent];
    if (mere && mere.plan === plan) return mere;
    const cle = `${mere ? mere.id : 'racine'}>${plan}`;
    return this.especes.get(cle) || this.fonderEspece(cle, plan, mere);
  }

  // En course des champions, une espèce fille garde la teinte de sa lignée (légèrement décalée) :
  // les familles de chaque fondateur se lisent d'un coup d'œil.
  fonderEspece(cle, plan, mere, { nom, teinte, fondateur } = {}) {
    const id = this.especesParId.length;
    if (teinte == null) {
      teinte = mere && this.fondateurs.length
        ? (mere.teinte + (hasard(id) - 0.5) * 50 + 360) % 360
        : (id * 137.508 + 200) % 360;
    }
    const e = { id, plan, nom: nom || nomEspece(id), teinte, parent: mere ? mere.id : null, nee: this.generation, record: 0 };
    if (fondateur != null) e.fondateur = fondateur;
    this.especes.set(cle, e);
    this.especesParId.push(e);
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
    if (this.fondateurs.length && this.recordFondateurs == null) {
      this.recordFondateurs = Math.max(0, ...res.filter((r) => r.ind.fondateur).map((r) => r.c.distance));
    }
    if (this.recordFondateurs != null && !premier.ind.fondateur && this.record.distance <= this.recordFondateurs + 0.05
      && premier.c.distance > this.recordFondateurs + 0.05) {
      const sang = decrireHeritage(premier.ind.heritage, this.fondateurs, 3);
      this.raconter(`🌟 ${sang.startsWith('pur') ? 'Un descendant' : 'Un hybride'} bat le record des fondateurs : ${premier.c.distance.toFixed(1)} m [${sang}]`);
    }
    if (premier.c.distance > this.record.distance + 0.05) {
      const gain = premier.c.distance - this.record.distance;
      const sang = this.fondateurs.length ? ` [${decrireHeritage(premier.ind.heritage, this.fondateurs)}]` : '';
      this.raconter(`🏆 Record : un ${espece.nom} parcourt ${premier.c.distance.toFixed(1)} m (+${gain.toFixed(1)})${sang}`);
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
      heritage: premier.ind.heritage,
    });
    const distances = res.map((r) => r.c.distance).sort((a, b) => a - b);
    const effectifs = {};
    res.forEach((r) => { effectifs[r.ind.espece] = (effectifs[r.ind.espece] || 0) + 1; });
    const h = {
      generation: this.generation,
      meilleur: premier.c.distance,
      mediane: distances[distances.length >> 1],
      effectifs,
    };
    if (this.fondateurs.length) {
      // Part moyenne de chaque fondateur dans la population ; un sang qui disparaît est raconté
      h.heritage = this.fondateurs.map((f, i) => res.reduce((s, r) => s + r.ind.heritage[i], 0) / res.length);
      h.heritage.forEach((p, i) => {
        if (p > 0 || this.eteints.has(i)) return;
        this.eteints.add(i);
        this.raconter(`🪦 Plus une goutte de sang ${this.fondateurs[i].nom} dans la population`);
      });
    }
    this.historique.push(h);

    this.population = this.selection(res, effectifs);
    this.generation++;
    this.lancerCourse();
  }

  selection(res, effectifs) {
    const P = this.params;
    const champions = this.fondateurs.length > 0;
    if (champions && this.enBrassage(res.length)) return this.brassage(res);
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
      if (!champions && Math.random() < P.immigrants) {
        suivante.push(this.naitre(randomGenome(), null));
        continue;
      }
      const p1 = res[tournoi(tous)].ind;
      let adn = p1.adn, heritage = p1.heritage;
      // Croisement dans l'espèce ; en course des champions, avec n'importe qui
      const partenaires = champions ? tous : parEspece[p1.espece];
      if (Math.random() < P.croisement && partenaires.length > 1) {
        const p2 = res[tournoi(partenaires)].ind;
        if (p2 !== p1) {
          if (champions) {
            const [enfant, q] = introgression(p1.adn, p2.adn, P.introgression);
            adn = enfant;
            heritage = p1.heritage.map((h, i) => h * (1 - q) + p2.heritage[i] * q);
          } else adn = recombinaisonGenetique(p1.adn, p2.adn)[Math.random() < 0.5 ? 0 : 1];
        }
      }
      suivante.push(this.naitre(mutationADN(adn, P.tauxMutation), p1.espece, heritage));
    }
    return suivante;
  }

  // Course des champions, phase de brassage : tant que les fondateurs vivent (et au moins
  // jusqu'à ce que la population soit pleine), pas de sélection.
  enBrassage(taille) {
    return this.generation < this.params.vieFondateurs || taille < Math.round(this.params.population);
  }

  // L'essaim hybride : tous ceux qui avancent d'au moins 1 m ont le même nombre d'enfants,
  // tous hybrides (introgression forte), avec un partenaire tiré au hasard. Les fondateurs
  // traversent les générations tels quels, puis meurent : seuls leurs gènes restent.
  // Mesuré : la diversité tient (5 à 8 fondateurs encore présents à G100, contre 1 ou 2 avec
  // une sélection classique), au prix d'un creux après leur mort, puis d'une remontée.
  brassage(res) {
    const P = this.params;
    const N = Math.min(Math.round(P.population), Math.ceil(res.length * P.croissance));
    const suivante = [];
    const fondateursEnVie = res.filter((r) => r.ind.fondateur);
    if (this.generation < P.vieFondateurs) {
      fondateursEnVie.forEach((r) => suivante.push({ ...r.ind, id: this.prochainId++, elite: true }));
    } else if (fondateursEnVie.length) {
      this.raconter(`⚰️ Les ${fondateursEnVie.length} champions d'origine meurent. Il ne reste que leurs gènes, mêlés dans leurs descendants.`);
    }

    let parents = res.filter((r) => !r.c.disqualifiee && r.c.distance >= 1).map((r) => r.ind);
    if (parents.length < 2) parents = res.map((r) => r.ind);
    for (let i = parents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [parents[i], parents[j]] = [parents[j], parents[i]];
    }
    for (let k = 0; suivante.length < N; k++) {
      const p1 = parents[k % parents.length];
      let p2 = p1;
      while (p2 === p1 && parents.length > 1) p2 = parents[Math.floor(Math.random() * parents.length)];
      const [enfant, q] = introgression(p1.adn, p2.adn, P.brassage);
      const heritage = p1.heritage.map((h, i) => h * (1 - q) + p2.heritage[i] * q);
      suivante.push(this.naitre(mutationADN(enfant, P.tauxMutation), p1.espece, heritage));
    }
    return suivante;
  }

  // ── Sauvegarde : les génomes en texte, le reste tel quel ──
  exporter() {
    return {
      jeu: 'bacterie16',
      version: 2,
      date: new Date().toISOString(),
      params: this.params,
      generation: this.generation,
      record: this.record,
      zoneAtteinte: this.zoneAtteinte,
      especes: this.especesParId,
      historique: this.historique,
      chronique: this.chronique,
      fondateurs: this.fondateurs,
      recordFondateurs: this.recordFondateurs,
      champions: this.champions.map(({ corps, adn, ...c }) => ({ ...c, adn: adnVersTexte(adn) })),
      population: this.population.map((ind) => ({ adn: adnVersTexte(ind.adn), espece: ind.espece, heritage: ind.heritage, fondateur: ind.fondateur })),
    };
  }

  restaurer(s) {
    this.generation = s.generation;
    this.record = s.record;
    this.zoneAtteinte = s.zoneAtteinte || 0;
    this.historique = s.historique || [];
    this.chronique = s.chronique || [];
    this.fondateurs = s.fondateurs || [];
    this.recordFondateurs = s.recordFondateurs ?? null;
    const dernier = this.historique[this.historique.length - 1];
    if (dernier && dernier.heritage) dernier.heritage.forEach((p, i) => { if (p === 0) this.eteints.add(i); });
    (s.especes || []).forEach((e) => {
      this.especes.set(`${e.fondateur != null ? `fondateur${e.fondateur}` : e.parent ?? 'racine'}>${e.plan}`, e);
      this.especesParId.push(e);
    });
    this.champions = (s.champions || []).map((c) => {
      const adn = texteVersAdn(c.adn);
      return { ...c, adn, corps: lireCorps(adn) };
    });
    // Chacun retrouve son espèce (ou en fonde une si la lecture du corps a changé entre deux versions)
    this.population = s.population.map((p) => {
      const ind = this.naitre(texteVersAdn(p.adn), p.espece, p.heritage || null);
      if (p.fondateur) ind.fondateur = true;
      return ind;
    });
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
