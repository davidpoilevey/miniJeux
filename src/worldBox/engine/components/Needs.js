// Besoins vitaux : 0 = critique, 100 = comblé
export default function Needs() {
  return {
    hunger: 70 + Math.floor(Math.random() * 30),   // 70..100
    energy: 60 + Math.floor(Math.random() * 40),   // 60..100
    social: 40 + Math.floor(Math.random() * 60),   // 40..100
    foi:    40 + Math.floor(Math.random() * 60),   // 40..100 — décroît très lentement
  };
}
