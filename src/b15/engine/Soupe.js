import { randomGenome, mutationADN, recombinaisonGenetique } from '../../genetic/ADNPlante';
import { lirePhenotype, GUILDES, ARMES } from './phenotype';
import { DEFAULT_PARAMS } from './params';

// La gélose. Une grille torique, une bactérie par case au plus (exclusion : c'est
// elle qui fait naître fronts, secteurs et colonies, comme chez Conway).
// Une seule règle pour tout le monde, à chaque tick :
//   manger ce que mes enzymes digèrent sur ma case → rejeter le cran chimique suivant
//   → émettre (ou pas) → mourir, ou me diviser dans la meilleure case voisine libre,
//   ou m'y déplacer selon ce que je sens.
// Les bactéries ne se voient pas : elles ne communiquent qu'en modifiant la chimie.

const TAU = Math.PI * 2;
const DX = [1, 1, 0, -1, -1, -1, 0, 1];
const DY = [0, 1, 1, 1, 0, -1, -1, -1];
const NB_TEINTES = 24;
const MAX_HISTO = 600;

export class Soupe {
  constructor(params = {}) {
    this.params = { ...DEFAULT_PARAMS, ...params };
    this.reset();
  }

  reset() {
    const p = this.params;
    const W = (this.W = p.largeur);
    const H = (this.H = p.hauteur);
    const N = W * H;
    this.A = new Float32Array(N);
    this.B = new Float32Array(N);
    this.C = new Float32Array(N);
    this.T = new Float32Array(N);
    this.tmp = new Float32Array(N);
    this.fert = new Float32Array(N);
    this.cellule = new Array(N).fill(null);
    this.voisins = new Int32Array(N * 8);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++)
        for (let k = 0; k < 8; k++)
          this.voisins[(y * W + x) * 8 + k] = ((y + DY[k] + H) % H) * W + ((x + DX[k] + W) % W);

    // Climat : 3 ondes planes qui bouclent sur le tore et dérivent lentement
    this.ondes = Array.from({ length: 3 }, () => ({
      kx: ((TAU * (1 + Math.floor(Math.random() * 3))) / W) * (Math.random() < 0.5 ? -1 : 1),
      ky: (TAU * Math.floor(Math.random() * 3)) / H,
      phase: Math.random() * TAU,
      w: 0.5 + Math.random(),
    }));

    this.tick = 0;
    this.bacteries = [];
    this.naissances = [];
    this.historique = [];
    this.chronique = [];
    this.memo = { guildes: [false, false, false], domination: -1, arme: -1, sequence: '', tours: 0, genPalier: 0, record: 0, hiver: false };

    this.majFertilite();
    this.A.set(this.fert);
    for (let k = 0; k < p.populationInitiale; k++) this.semer();
    this.accueillirNaissances();
    this.calculerStats();
    this.raconter(`La gélose est coulée. ${p.populationInitiale} génomes aléatoires déposés sur le sucre.`);
  }

  // ───────────────────────── Vie ─────────────────────────

  creer(adn, i, energie, generation = 0) {
    const b = { adn, ph: lirePhenotype(adn), i, e: energie, age: 0, gen: generation, mort: false, poids: new Float32Array(4) };
    this.cellule[i] = b;
    this.naissances.push(b);
    return b;
  }

  semer() {
    for (let essai = 0; essai < 20; essai++) {
      const i = (Math.random() * this.cellule.length) | 0;
      if (!this.cellule[i]) return this.creer(randomGenome(), i, 1.5);
    }
    return null;
  }

  accueillirNaissances() {
    for (const n of this.naissances) this.bacteries.push(n);
    this.naissances.length = 0;
  }

  // Ce que la bactérie "pense" d'une case, selon son humeur du moment
  evaluer(j, w) {
    return w[0] * this.A[j] + w[1] * this.B[j] + w[2] * this.C[j] + w[3] * this.T[j];
  }

  // Meilleure case voisine libre, jugée à `portee` cases dans sa direction
  choisirCase(b, w, seuil) {
    const { W, H } = this;
    const ph = b.ph;
    const x = b.i % W, y = (b.i / W) | 0;
    const d = ph.portee;
    const base = b.i * 8;
    const depart = (Math.random() * 8) | 0;
    let meilleure = -1, meilleurScore = seuil;
    for (let kk = 0; kk < 8; kk++) {
      const k = (depart + kk) & 7;
      const n = this.voisins[base + k];
      if (this.cellule[n]) continue;
      const sx = (((x + DX[k] * d) % W) + W) % W;
      const sy = (((y + DY[k] * d) % H) + H) % H;
      const score = this.evaluer(sy * W + sx, w) + (Math.random() * 2 - 1) * ph.errance * 0.1;
      if (score > meilleurScore) { meilleurScore = score; meilleure = n; }
    }
    return meilleure;
  }

  vivre(b) {
    const p = this.params;
    const ph = b.ph;
    const { A, B, C, T } = this;
    const i = b.i;

    // 1. Humeur : de « affamé » à « repu » selon la réserve d'énergie
    const sat = Math.min(1, b.e / ph.seuilDivision);
    const w = b.poids;
    for (let k = 0; k < 4; k++) w[k] = ph.faim[k] + (ph.repu[k] - ph.faim[k]) * sat;

    // 2. Manger : A → B → C → ∅. Les déchets des uns sont le repas des autres.
    const abs = p.absorption;
    let gain = 0;
    if (ph.eA > 0) {
      const m = ph.eA * abs * A[i];
      A[i] -= m; B[i] += m * p.excretion; gain += m * p.rendementA;
    }
    if (ph.eB > 0) {
      const m = ph.eB * abs * B[i];
      B[i] -= m; C[i] += m * p.excretion; gain += m * p.rendementB;
    }
    if (ph.eC > 0) {
      const m = ph.eC * abs * C[i];
      C[i] -= m; gain += m * p.rendementC;
    }

    // 3. Guerre chimique : sécréter la colicine, encaisser celle des voisins
    if (ph.toxine > 0) T[i] += ph.toxine * p.emissionToxine;
    const degats = p.degatsToxine * T[i] * (1 - ph.protection);

    // 4. Bilan
    b.e +=
      gain - degats - p.coutBase -
      p.coutEnzyme * ph.sommeEnzymes * ph.sommeEnzymes -
      p.coutToxine * ph.toxine -
      p.coutResistance * ph.resistance;
    b.age++;
    if (b.e <= 0 || b.age > ph.longevite) {
      b.mort = true;
      this.cellule[i] = null;
      C[i] += p.necromasse + Math.max(0, b.e) * 0.5;
      return;
    }

    // 5. Se diviser dans la meilleure case libre (sinon : inhibition de contact)
    if (b.e > ph.seuilDivision && this.bacteries.length + this.naissances.length < p.maxBacteries) {
      const n = this.choisirCase(b, w, -Infinity);
      if (n >= 0) {
        b.e /= 2;
        this.creer(mutationADN(this.adnEnfant(b), p.tauxMutation), n, b.e, b.gen + 1);
        return;
      }
    }

    // 6. Bouger, seulement si une case voisine sent meilleur qu'ici
    if (Math.random() < ph.mobilite) {
      const n = this.choisirCase(b, w, this.evaluer(i, w));
      if (n >= 0) {
        this.cellule[i] = null;
        this.cellule[n] = b;
        b.i = n;
        b.e -= p.coutMouvement;
      }
    }
  }

  // Asexué par défaut ; sexué avec un voisin compatible (teinte proche = même "espèce")
  adnEnfant(b) {
    const p = this.params;
    if (Math.random() >= p.tauxSexe) return b.adn;
    const base = b.i * 8;
    const depart = (Math.random() * 8) | 0;
    for (let kk = 0; kk < 8; kk++) {
      const partenaire = this.cellule[this.voisins[base + ((depart + kk) & 7)]];
      if (partenaire && !partenaire.mort && ecartTeinte(b.ph.teinte, partenaire.ph.teinte) <= p.compatibilite) {
        return recombinaisonGenetique(b.adn, partenaire.adn)[0];
      }
    }
    return b.adn;
  }

  // ───────────────────────── Monde ─────────────────────────

  majFertilite() {
    const { W, H, fert, ondes, params: p } = this;
    const t = this.tick * p.deriveFertilite;
    const c = p.contrasteFertilite;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let v = 0;
        for (const o of ondes) v += Math.sin(o.kx * x + o.ky * y + o.phase + o.w * t * TAU);
        v = 0.5 + v / 6; // [0,1]
        v = v * v * (3 - 2 * v); // smoothstep : oasis plus nettes
        fert[y * W + x] = p.capaciteA * (1 - c + c * v);
      }
    }
  }

  // Saisons : onde carrée sur la repousse du sucre (milieu intermittent)
  estHiver() {
    const p = this.params;
    return p.saisonRigueur > 0 && (this.tick % p.saisonPeriode) >= p.saisonPeriode / 2;
  }

  // Diffusion 4-voisins sur tore + évaporation
  diffuser(champ, taux, evap) {
    if (taux <= 0 && evap <= 0) return;
    const { W, H, tmp } = this;
    const garde = 1 - evap;
    for (let y = 0; y < H; y++) {
      const ligne = y * W;
      const haut = ((y + H - 1) % H) * W;
      const bas = ((y + 1) % H) * W;
      for (let x = 0; x < W; x++) {
        const g = x === 0 ? W - 1 : x - 1;
        const d = x === W - 1 ? 0 : x + 1;
        const v = champ[ligne + x];
        const moy = (champ[ligne + g] + champ[ligne + d] + champ[haut + x] + champ[bas + x]) * 0.25;
        tmp[ligne + x] = (v + (moy - v) * taux) * garde;
      }
    }
    champ.set(tmp);
  }

  step() {
    const p = this.params;
    const { A, fert } = this;
    this.tick++;

    if (this.tick % 20 === 0) this.majFertilite();
    const regen = p.regenA * (this.estHiver() ? 1 - p.saisonRigueur : 1);
    for (let i = 0; i < A.length; i++) A[i] += regen * (fert[i] - A[i]);
    this.diffuser(A, p.diffA, 0);
    this.diffuser(this.B, p.diffB, p.evapB);
    this.diffuser(this.C, p.diffC, p.evapC);
    this.diffuser(this.T, p.diffT, p.evapT);

    // Ordre aléatoire à chaque tick : pas de biais de balayage sur la grille
    const bs = this.bacteries;
    for (let k = bs.length - 1; k > 0; k--) {
      const j = (Math.random() * (k + 1)) | 0;
      const t = bs[k]; bs[k] = bs[j]; bs[j] = t;
    }
    for (let k = 0; k < bs.length; k++) this.vivre(bs[k]);

    let w = 0;
    for (let k = 0; k < bs.length; k++) if (!bs[k].mort) bs[w++] = bs[k];
    bs.length = w;

    // Panspermie : la vie peut toujours retomber du ciel (×20 si la boîte est vide)
    const pluie = bs.length < 10 ? p.panspermie * 20 : p.panspermie;
    if (Math.random() < pluie) for (let k = 0; k < 5; k++) this.semer();
    this.accueillirNaissances();

    if (this.tick % 10 === 0) this.calculerStats();
  }

  // ───────────────────────── Observation ─────────────────────────

  calculerStats() {
    const bs = this.bacteries;
    const n = bs.length;
    const guildes = [0, 0, 0];
    const teintes = new Array(NB_TEINTES).fill(0);
    const armes = [0, 0, 0];
    let mobilite = 0, genMax = 0;
    for (const b of bs) {
      guildes[b.ph.guilde]++;
      armes[b.ph.arme]++;
      teintes[Math.min(NB_TEINTES - 1, (b.ph.teinte * NB_TEINTES) | 0)]++;
      mobilite += b.ph.mobilite;
      if (b.gen > genMax) genMax = b.gen;
    }
    // Nombre effectif de lignées : exp(entropie de Shannon) sur le marqueur neutre
    let shannon = 0, dominante = -1;
    for (let t = 0; t < NB_TEINTES; t++) {
      if (!teintes[t]) continue;
      const q = teintes[t] / n;
      shannon -= q * Math.log(q);
      if (q > 0.5) dominante = t;
    }
    let sA = 0, sB = 0, sC = 0, sT = 0;
    for (let i = 0; i < this.A.length; i++) {
      sA += this.A[i]; sB += this.B[i]; sC += this.C[i]; sT += this.T[i];
    }
    const cases = this.A.length;
    this.stats = {
      tick: this.tick,
      population: n,
      guildes,
      armes,
      lignees: n ? Math.exp(shannon) : 0,
      dominante,
      mobilite: n ? mobilite / n : 0,
      genMax,
      chimie: [sA / cases, sB / cases, sC / cases, sT / cases],
      hiver: this.estHiver(),
    };

    if (this.tick % 30 === 0) {
      this.historique.push({ tick: this.tick, population: n, guildes: [...guildes], armes: [...armes], lignees: this.stats.lignees });
      if (this.historique.length > MAX_HISTO) this.historique = this.historique.filter((_, k) => k % 2 === 0);
    }
    this.detecterEvenements();
  }

  detecterEvenements() {
    const s = this.stats;
    const m = this.memo;
    const n = s.population;

    if (n === 0 && m.record > 0) {
      this.raconter('☠️ Extinction totale. On attend la prochaine pluie de spores…');
      m.record = 0;
      m.guildes = [false, false, false];
      return;
    }
    if (n > m.record * 1.25 && n > 500) {
      m.record = n;
      this.raconter(`📈 Record de population : ${n}`);
    }
    m.record = Math.max(m.record, n);

    if (s.hiver !== m.hiver) {
      if (s.hiver) this.raconter(`❄️ L'hiver tombe : le sucre ne repousse presque plus (${n} survivantes)`);
      else if (m.hiver) this.raconter(`☀️ Printemps : le sucre revient (${n} survivantes)`);
      m.hiver = s.hiver;
    }

    for (let g = 0; g < 3; g++) {
      const part = n ? s.guildes[g] / n : 0;
      if (!m.guildes[g] && part > 0.05) {
        m.guildes[g] = true;
        this.raconter(`🌱 Les ${GUILDES[g]} s'installent (${Math.round(part * 100)}\u00a0%)`);
      } else if (m.guildes[g] && part < 0.005) {
        m.guildes[g] = false;
        this.raconter(`💀 Les ${GUILDES[g]} ont disparu`);
      }
    }
    if (s.dominante !== m.domination) {
      if (s.dominante >= 0) this.raconter(`👑 Une lignée (teinte ${Math.round((s.dominante / NB_TEINTES) * 360)}°) domine la boîte`);
      else if (m.domination >= 0) this.raconter('🌈 Plus aucune lignée ne domine : la diversité revient');
      m.domination = s.dominante;
    }
    // Pierre-feuille-ciseaux : qui tient le haut du pavé, et combien de tours de manège
    if (n > 200) {
      const a = s.armes;
      const top = a[0] >= a[1] && a[0] >= a[2] ? 0 : a[1] >= a[2] ? 1 : 2;
      if (top !== m.arme && a[top] / n > 0.4) {
        this.raconter(`⚔️ Les ${ARMES[top]} prennent le dessus (${Math.round((a[top] / n) * 100)}\u00a0%)`);
        m.sequence = (m.sequence + ARMES[top][0]).slice(-3);
        m.arme = top;
        if (new Set(m.sequence).size === 3 && m.sequence.length === 3) {
          m.tours++;
          m.sequence = m.sequence.slice(-1);
          this.raconter(`🔄 Cycle tueuses → résistantes → sensibles bouclé (${m.tours}) — personne ne gagne`);
        }
      }
    }
    const palier = Math.floor(s.genMax / 100) * 100;
    if (palier > m.genPalier) {
      m.genPalier = palier;
      this.raconter(`🧬 Génération ${palier}`);
    }
  }

  raconter(texte) {
    this.chronique.unshift({ tick: this.tick, texte });
    if (this.chronique.length > 60) this.chronique.pop();
  }

  bacterieEn(x, y) {
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return null;
    return this.cellule[(y | 0) * this.W + (x | 0)];
  }
}

function ecartTeinte(t1, t2) {
  const d = Math.abs(t1 - t2);
  return Math.min(d, 1 - d);
}
