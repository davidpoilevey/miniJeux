// PlantGrowthSystem — avec sélection naturelle par ADN
//
// Traits lus depuis le génome :
//   resistanceAuFroid  (float 0-1) : seuil de survie + température optimale
//                                    0 = plante tropicale (optimum ~35°C, meurt dès -5°C)
//                                    1 = plante polaire   (optimum ~5°C,  survit à -40°C)
//   resistanceAuSec    (float 0-1) : seuil de survie + humidité minimale pour croître bien
//                                    0 = nécessite humidity > 40 pour croître
//                                    1 = croît même à humidity = 0
//   vitesseCroissance  (float 0-1) : multiplicateur de biomasse intrinsèque (×0.5 à ×2.0)
//   tauxSpread         (float 0-1) : probabilité de propagation (base 0.8 % à 3.3 %/tick)
//   longevite          (float 0-1) : maxAge (lu à la naissance dans Engine)

export default class PlantGrowthSystem {
  update({ grid, em, seaLevel, spawnPlant, season }) {
    const plants = em.query('Position', 'Species', 'Age', 'Plant', 'Genome');

    // ── Index des positions occupées par une plante ────────────────
    const occupiedByPlant = new Set();
    for (const id of plants) {
      const p = em.getComponent(id, 'Position');
      if (p) occupiedByPlant.add(`${p.x},${p.y}`);
    }

    for (const id of plants) {
      const species = em.getComponent(id, 'Species');
      if (species.type !== 'plant') continue;

      const age    = em.getComponent(id, 'Age');
      const pos    = em.getComponent(id, 'Position');
      const plant  = em.getComponent(id, 'Plant');
      const genome = em.getComponent(id, 'Genome');
      const { handler, adn } = genome;

      // ── Lecture des traits génétiques ──────────────────────
      const resistanceFroid = handler.readFloat('resistanceAuFroid');
      const resistanceSec   = handler.readFloat('resistanceAuSec');
      const vitesse         = handler.readFloat('vitesseCroissance');
      const tauxSpread      = handler.readFloat('tauxSpread');

      // ── Vieillissement ─────────────────────────────────────
      age.age += 1;
      if (age.age >= age.maxAge) { em.destroyEntity(id); continue; }

      const cell = grid.getCell(pos.x, pos.y);
      if (!cell) { em.destroyEntity(id); continue; }

      // ── Mort environnementale ──────────────────────────────

      // Noyade / glace
      if (cell.altitude < seaLevel || cell.terrainType === 'glace') {
        em.destroyEntity(id); continue;
      }

      // Froid létal : seuil = -5°C (plante tropicale) à -40°C (plante polaire)
      const minTemp = -5 - resistanceFroid * 35;
      if (cell.temperature < minTemp) { em.destroyEntity(id); continue; }

      // Sécheresse létale : humidity minimale = 40 (sensible) à 0 (xérophyte)
      const minHumidity = Math.round((1 - resistanceSec) * 40);
      if (cell.humidity < minHumidity) { em.destroyEntity(id); continue; }

      // ── Facteur température (confort génétique) ────────────
      // Chaque plante a une température optimale dérivée de sa résistance au froid :
      //   tropicale (resistanceFroid≈0) → optimum ≈ 35°C
      //   polaire   (resistanceFroid≈1) → optimum ≈ 5°C
      // Le facteur chute si on s'éloigne trop de cet optimum (±20°C = 0).
      const optimalTemp = 35 - resistanceFroid * 30; // 5–35°C
      const tempFactor  = Math.max(0, 1 - Math.abs(cell.temperature - optimalTemp) / 20);

      // ── Facteur humidité (confort génétique) ───────────────
      // Une plante xérophyte (resistanceSec≈1) n'est pas gênée par l'aridité
      // et ne profite pas vraiment de l'humidité (son optimum est bas).
      // Une plante hygrophile (resistanceSec≈0) a besoin d'humidité pour croître.
      // humOptimal : 0 (xérophyte) à 60 (hygrophile)
      const humOptimal = (1 - resistanceSec) * 60;
      const humFactor  = Math.max(0, Math.min(1, (cell.humidity - humOptimal * 0.3) / (humOptimal * 0.7 + 20)));

      // Facteur environnemental global (temp × humidité) — plafond à 1
      const envFactor = Math.min(1, tempFactor * (0.6 + humFactor * 0.8));

      // ── Croissance biomasse ────────────────────────────────
      const fertilityMult = season?.fertilityMult ?? 1;
      const growthRate = (cell.fertility / 200) * (0.5 + vitesse * 1.1) * envFactor * fertilityMult;
      plant.biomass = Math.min(10, plant.biomass + growthRate);

      // ── Propagation (reproduction asexuée + mutation) ──────
      // densityFactor : soft cap ~12 000 plantes (décroit linéairement jusqu'à 0 à 12 000)
      const densityFactor = Math.max(0, 1 - plants.length / 12000);
      const spreadChance  = (0.08 + tauxSpread * 0.025) * (cell.fertility / 80) * envFactor * densityFactor * fertilityMult;
      if (Math.random() < spreadChance) {
        const neighbors = grid.getNeighbors(pos.x, pos.y);
        const fertile = neighbors.filter(n =>
          n.altitude >= seaLevel &&
          n.fertility > 15 &&
          n.terrainType !== 'eau' &&
          n.terrainType !== 'glace' &&
          !occupiedByPlant.has(`${n.x},${n.y}`)
        );
        if (fertile.length > 0) {
          const target = fertile[Math.floor(Math.random() * fertile.length)];
          occupiedByPlant.add(`${target.x},${target.y}`); // réservé pour ce tick
          spawnPlant(target.x, target.y, adn); // ADN parent → muté dans Engine
        }
      }
    }
  }
}
