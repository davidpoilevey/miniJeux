// Peinture de la gélose dans un buffer RGBA, une case = un pixel (pas de DOM :
// réutilisable hors navigateur). Fond : A sucre = vert d'eau sombre, B acide = ambre,
// C déchet = violet, T toxine = halo rouge. Bactéries : couleur du régime ou de la lignée.

export const COUCHES_DEFAUT = { A: true, B: true, C: true, T: true, bacteries: true };

export function peindre(soupe, data, couches = COUCHES_DEFAUT, mode = 'regime') {
  const { A, B, C, T, cellule } = soupe;
  const kA = couches.A ? 1 : 0, kB = couches.B ? 1 : 0, kC = couches.C ? 1 : 0, kT = couches.T ? 1 : 0;
  const voirBact = couches.bacteries;
  const cle = { regime: 'rgbRegime', lignee: 'rgbLignee', armes: 'rgbArmes' }[mode];
  for (let i = 0, o = 0; i < A.length; i++, o += 4) {
    const bact = voirBact && cellule[i];
    if (bact) {
      const rgb = bact.ph[cle];
      // Les bactéries affamées pâlissent
      const vigueur = 0.55 + 0.45 * Math.min(1, bact.e / bact.ph.seuilDivision);
      data[o] = rgb[0] * vigueur;
      data[o + 1] = rgb[1] * vigueur;
      data[o + 2] = rgb[2] * vigueur;
    } else {
      const a = kA * A[i];
      const b = kB * Math.min(1, Math.sqrt(B[i] * 2));
      const c = kC * Math.min(1, Math.sqrt(C[i] * 1.5));
      const t = kT * Math.min(1, Math.sqrt(T[i]));
      data[o] = 4 + 18 * a + 150 * b + 70 * c + 60 * t;
      data[o + 1] = 8 + 70 * a + 80 * b + 20 * c + 15 * t;
      data[o + 2] = 14 + 50 * a + 10 * b + 150 * c + 25 * t;
    }
    data[o + 3] = 255;
  }
}
