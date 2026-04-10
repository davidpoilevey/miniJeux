// Lecture des traits génétiques d'une plante depuis son ADNHandler
// Utilise handler.readFloat(key) → valeur 0..1

export function readTraits(handler) {
  return {
    // Croissance structurelle
    vitesseCroissance:   handler.readFloat('vitesseCroissance'),    // 0=lent 1=rapide
    croissanceVerticale: handler.readFloat('croissanceVerticale'),  // 0=horizontal 1=vertical
    largeurCouronne:     handler.readFloat('largeurCouronne'),      // portée max en cases (2..10)
    longevite:           handler.readFloat('longevite'),            // durée de vie (100..500 ticks)

    // Survie environnementale
    resistanceFroid:     handler.readFloat('resistanceFroid'),
    resistanceSec:       handler.readFloat('resistanceAuSec'),

    // Énergie
    photosynthese:       handler.readFloat('photosynthese'),        // efficacité lumineuse

    // Reproduction
    grainePortee:        handler.readFloat('grainePortee'),         // portée de dissémination (2..10)
    seuilFleur:          handler.readFloat('seuilFleur'),           // énergie requise pour fleurir
    seuilFruit:          handler.readFloat('seuilFruit'),           // énergie pour fructifier

    // Décisions de croissance
    choixHaut:           handler.readFloat('choixHaut'),            // 0=feuille 1=tige en montant
    choixLateral:        handler.readFloat('choixLateral'),         // tendance à s'étaler

    // Rendu fleur (sélection esthétique par les visiteurs)
    teinte:              handler.readFloat('teinte'),               // 0..1 → hue 0°..360°
    saturation:          handler.readFloat('saturation'),           // 0..1 → sat 40%..100%
    luminosite:          handler.readFloat('luminosite'),           // 0..1 → lit 35%..75%
    tailleFleur:         handler.readFloat('tailleFleur'),          // 0..1 → taille relative
    nombrePetales:       handler.readFloat('nombrePetales'),        // → 3..8 pétales
    formePetale:         handler.readFloat('formePetale'),          // 0=allongé 1=arrondi
    couleurCentre:       handler.readFloat('couleurCentre'),        // 0=jaune 0.5=blanc 1=noir
    // Les 6 premiers millièmes de l'espace patternPetale → phénotype rare (1/1000 par type)
    // 0=noir  1=bicolore  2=albinos  3=pétales-inversés  4=géante  5=pétales-carrés
    // patternPetale ≥ 0.006 → comportement normal (> 0.5 = strié)
    patternPetale:       handler.readFloat('patternPetale'),        // 0=uni >0.5=strié
    rareType: (() => { const v = handler.readFloat('patternPetale'); return v < 0.006 ? Math.floor(v * 1000) : null; })(),
    hauteurFleur:        handler.readFloat('hauteurFleur'),         // 0=base 1=sommet

    // Rendu fruit
    tailleFruit:         handler.readFloat('tailleFruit'),          // 0..1 → rayon x1..x3

    // Poison
    poisonChance: handler.readFloat('poisonChance'),                          // > 0.5 → plante empoisonneuse
    poisonType:   Math.round(1 + handler.readFloat('poison')   * 9),          // 1-10 : type de poison produit
    antidote:     Math.round(1 + handler.readFloat('antidote') * 9),          // 1-10 : type de poison résisté
    poisonRange:  1 + Math.round(handler.readFloat('poisonRange') * 3),       // 1-4 cases
  };
}

export function getNombrePetales(traits) {
  return 3 + Math.floor(traits.nombrePetales * 7); // 3..9
}

// Température minimale de survie (°C)
export function getMinTemp(traits) {
  return 15 - traits.resistanceFroid * 25; // 15°C (tropicale) .. -10°C (polaire)
}

// Température maximale de survie (°C) — les plantes polaires grillent en zone tropicale
export function getMaxTemp(traits) {
  return 45 - traits.resistanceFroid * 30; // 45°C (tropicale) .. 15°C (polaire)
}

// Humidité minimale de survie
export function getMinHumidity(traits) {
  return Math.round((1 - traits.resistanceSec) * 40); // 0..40
}

// Humidité maximale de survie — les xérophytes pourrissent en zone marécageuse
export function getMaxHumidity(traits) {
  return Math.round(60 + (1 - traits.resistanceSec) * 40); // 60 (xérophyte) .. 100 (hygrophile)
}

// Âge maximum en ticks
export function getMaxAge(traits) {
  return Math.round(100 + traits.longevite * 400); // 100..500
}

// Portée de dissémination en cases
export function getGrainePortee(traits) {
  return Math.round(2 + traits.grainePortee * 8); // 2..10
}

// Hauteur max en cases depuis la racine
export function getMaxHeight(traits) {
  return Math.round(2 + traits.largeurCouronne * 8); // 2..10
}

// Délai minimum entre deux poussées (en ticks)
export function getGrowthDelay(traits) {
  return Math.max(1, Math.round(6 - traits.vitesseCroissance * 5)); // 1..6
}
