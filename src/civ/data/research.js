// Un socle lent, puis les écoles et universités accélèrent réellement la recherche.
export const researchCost = technology => Math.max(12, (technology?.cost || 0) * 3);
export const researchRate = (science, nation) => Math.max(1, Math.ceil((Math.max(0, science) + (nation?.bonuses?.science || 0)) / 5));
