// Une créature en course : dynamique à base de positions (Verlet + projection de contraintes).
// Pas de Math.random ici : même génome + même piste = même course (le replay est exact).

export const DT = 1 / 60;
const SOUS_PAS = 3;
const ITERATIONS = 4;
const VMAX = 8; // m/s, filet de sécurité
const MU_GRIFFE = 2.5; // griffe sortie : très accrocheuse, mais seulement si elle porte du poids

export class Creature {
  constructor(corps, terrain) {
    this.corps = corps;
    const n = corps.noeuds.length;
    this.n = n;
    this.px = new Float64Array(n);
    this.py = new Float64Array(n);
    this.ox = new Float64Array(n);
    this.oy = new Float64Array(n);
    this.w = new Float64Array(n);     // masse inverse
    this.r = new Float64Array(n);
    this.contact = new Uint8Array(n);
    this.agrippe = new Uint8Array(n); // griffe sortie (pour le dessin et le frottement)
    this.appui = new Float64Array(n);   // correction normale du sol pendant le sous-pas = la charge
    this.L = new Float64Array(corps.aretes.length);       // longueur visée de chaque arête
    this.tension = new Float64Array(corps.aretes.length); // -1 (étiré) … +1 (contracté), pour le dessin

    // Posé sur la ligne de départ : centre de masse en x = 0, plus bas nœud au ras du sol
    let mx = 0, m = 0, bas = Infinity;
    corps.noeuds.forEach((nd) => {
      const masse = (nd.r / 0.08) ** 2;
      mx += nd.x * masse; m += masse;
      bas = Math.min(bas, nd.y - nd.r);
    });
    mx /= m;
    corps.noeuds.forEach((nd, i) => {
      this.px[i] = this.ox[i] = nd.x - mx;
      this.py[i] = this.oy[i] = nd.y - bas + terrain.hauteur(0) + 0.01;
      this.w[i] = 1 / ((nd.r / 0.08) ** 2);
      this.r[i] = nd.r;
    });
    corps.aretes.forEach((e, k) => { this.L[k] = e.L0; });

    this.t = 0;
    this.x0 = null;     // centre de masse au départ de la mesure
    this.distance = 0;  // mètres parcourus depuis la fin de l'échauffement
    this.disqualifiee = null;
    this.maxX = this.comX();
  }

  comX() {
    let s = 0, m = 0;
    for (let i = 0; i < this.n; i++) { const mi = 1 / this.w[i]; s += this.px[i] * mi; m += mi; }
    return s / m;
  }

  comY() {
    let s = 0, m = 0;
    for (let i = 0; i < this.n; i++) { const mi = 1 / this.w[i]; s += this.py[i] * mi; m += mi; }
    return s / m;
  }

  pas(P, terrain) {
    if (this.disqualifiee) { this.t += DT; return; }
    const h = DT / SOUS_PAS;
    for (let s = 0; s < SOUS_PAS; s++) this.sousPas(h, P, terrain);

    if (this.x0 === null && this.t >= P.echauffement) this.x0 = this.comX();
    if (this.x0 !== null) this.distance = this.comX() - this.x0;
    this.maxX = Math.max(this.maxX, this.comX());

    // Garde-fous : un corps qui s'envole ou explose ne marche pas, il triche
    if (!Number.isFinite(this.px[0])) this.disqualifiee = 'explosion';
    else if (this.comY() - terrain.hauteur(this.comX()) > 2.5) this.disqualifiee = 'catapulte';
  }

  sousPas(h, P, terrain) {
    const { n, px, py, ox, oy, w, r } = this;
    const { noeuds, aretes } = this.corps;
    const g = P.gravite * h * h;
    const vmax = VMAX * h;

    // 1. Intégration de Verlet
    for (let i = 0; i < n; i++) {
      let vx = (px[i] - ox[i]) * 0.999;
      let vy = (py[i] - oy[i]) * 0.999;
      const v = Math.hypot(vx, vy);
      if (v > vmax) { vx *= vmax / v; vy *= vmax / v; }
      ox[i] = px[i]; oy[i] = py[i];
      px[i] += vx;
      py[i] += vy - g;
    }
    this.t += h;

    // 2. Oscillateurs : un rythme pour tout le corps, une phase par muscle.
    //    Les muscles montent en puissance pendant l'échauffement (pas de détente initiale).
    const omega = 2 * Math.PI * (P.freqMin + (P.freqMax - P.freqMin) * this.corps.rythme);
    const montee = Math.min(1, Math.max(0, (this.t - 0.2) / Math.max(0.1, P.echauffement - 0.4)));
    for (let k = 0; k < aretes.length; k++) {
      const e = aretes[k];
      if (!e.muscle || e.bloque) continue;
      const s = Math.sin(omega * this.t + e.phase);
      this.L[k] = e.L0 * (1 - P.ampliMax * e.uAmpli * montee * s);
      this.tension[k] = s * montee;
    }

    // Griffes : sorties pendant la demi-période où leur oscillateur est positif
    for (let i = 0; i < n; i++) {
      this.agrippe[i] = noeuds[i].griffe && Math.sin(omega * this.t + noeuds[i].phase) > 0 ? 1 : 0;
      this.appui[i] = 0;
    }

    // 3. Projection des contraintes : muscles (souples), os (rigides), sol
    for (let it = 0; it < ITERATIONS; it++) {
      for (let k = 0; k < aretes.length; k++) {
        const e = aretes[k];
        if (e.muscle && e.bloque) continue;
        const raideur = e.muscle ? 1 - Math.pow(1 - e.raideur, 1 / ITERATIONS) : 1;
        const a = e.a, b = e.b;
        const ws = w[a] + w[b];
        const dx = px[b] - px[a], dy = py[b] - py[a];
        const d = Math.hypot(dx, dy);
        if (d < 1e-9) continue;
        let corr = raideur * (d - this.L[k]);
        // Un vrai muscle a une force finie : sa correction par itération est plafonnée
        // (F·Σw·h², répartie sur les itérations). Sans ça, une jambe qui se tend contre
        // le sol propulse le corps à n'importe quelle vitesse : la catapulte.
        if (e.muscle) {
          const plafond = P.forceMuscle * e.raideur * ws * h * h;
          if (corr > plafond) corr = plafond; else if (corr < -plafond) corr = -plafond;
        }
        const c = corr / (d * ws);
        px[a] += dx * c * w[a]; py[a] += dy * c * w[a];
        px[b] -= dx * c * w[b]; py[b] -= dy * c * w[b];
      }
      for (let i = 0; i < n; i++) {
        const sol = terrain.hauteur(px[i]) + r[i];
        if (py[i] < sol) {
          const p = terrain.pente(px[i]);
          const nn = 1 / Math.sqrt(1 + p * p);
          const prof = (sol - py[i]) * nn;
          px[i] += -p * nn * prof;
          py[i] += nn * prof;
          this.appui[i] += prof;
        }
      }
    }

    // 4. Frottement de Coulomb, au niveau des positions : le déplacement tangentiel du sous-pas
    //    (inertie ET traction des muscles) est bloqué tant qu'il reste sous μ × appui.
    //    Un nœud chargé accroche, un nœud effleuré glisse : il faut soulever pour avancer.
    for (let i = 0; i < n; i++) {
      this.contact[i] = this.appui[i] > 0 ? 1 : 0;
      if (!this.contact[i]) continue;
      const nd = noeuds[i];
      // Griffe sortie = crampon : elle mord pareil sur la glace, le sable ou le roc
      const mu = nd.griffe && this.agrippe[i] ? MU_GRIFFE : (nd.griffe ? 0.08 : nd.mu) * terrain.adherence(px[i]);
      const p = terrain.pente(px[i]);
      const nn = 1 / Math.sqrt(1 + p * p);
      const tx = nn, ty = p * nn; // tangente au sol
      const dt = (px[i] - ox[i]) * tx + (py[i] - oy[i]) * ty;
      const limite = mu * this.appui[i];
      const reste = Math.abs(dt) <= limite * 1.2 ? 0 : dt - Math.sign(dt) * limite;
      px[i] -= (dt - reste) * tx;
      py[i] -= (dt - reste) * ty;
    }
  }
}
