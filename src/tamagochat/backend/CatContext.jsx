// backend/CatContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { CAT_AROUND, CAT_EVENTS, evilEvents, generateMessage, happinessEvents } from "./Social";
import { apprendreTour, changerLitiere, donnerFriandise, goToVet, laisserSortir } from "./CatActions";
import { computeMood } from "../ui/CatExpression";

const CatContext = createContext();
export function useCat() {
    return useContext(CatContext);
}

// Traits de personnalité par défaut
const DEFAULT_PERSONALITY = {
    sociable: 0.7,
    curieux: 0.8,
    paresseux: 0.3,
    affectueux: 0.9,
    bavard: 0.6,
    jaloux: 0.2,
};


export function CatProvider({ children }) {
    const [rythme, setRythme] = useState(1000);

    const [timeOfDay, setTimeOfDay] = useState("matin");

    const [cat, setCat] = useState(() => {
        const saved = localStorage.getItem("tamagochat");
        return (
            JSON.parse(saved) || {
                hunger: 80,
                energy: 80,
                affection: 80,
                sante: 90,
                territorialite: 50,
                mood: "heureux",
                personality: DEFAULT_PERSONALITY,
                relations: [
                    { id: "owner", name: "Toi", affection: 90, trust: 80 },
                ],
                resources: {
                    argent: 100, croquettes: 50
                },
                currentFlags: {},
                messages: [],
                lastUpdate: Date.now(),
            }
        );
    });

    const applyAction = action => {
        const result = {};
        switch (action) {
            case "goToVet": goToVet(result, { cat }); break;
            case "changerLitiere": changerLitiere(result, { cat }); break;
            case "donnerFriandise": donnerFriandise(result, { cat }); break;
            case "apprendreTour": apprendreTour(result, { cat }); break;
            case "nettoyerVomi":{
                 affectStat({ affection: +3, sante: +2, energy: -1, territorialite:-6 });
                speak("Tout est propre à nouveau. Plus de dégâts visibles… pour l’instant.", "system", "event");
                setCat(prev => ({
                ...prev,
                currentFlags: { ...prev.currentFlags, vomir: false },
                }));
                break;
            }
            case "laisserSortir": {
                laisserSortir(result, { cat });
                triggerSocialEvent();
                break;
            }
            default:
        }
        if (result.statModifier)
            affectStat(result.statModifier);
        if (result.relationModifier)
            affectRelation('owner', result.relationModifier);
        if (result.resourcesModifier)
            affectResources(result.resourcesModifier);
        if (result.speakLog)
            speak(result.speakLog);
        if (result.speakStory) {
            let rang = 0;
            const readStory = (chp) => {
                speak(chp.speakLog, chp.sender, chp.type);
                if (result.speakStory.length > (rang + 1))
                    setTimeout(() => {
                        rang++;
                        readStory(result.speakStory[rang]);
                    }, chp.timeout);
            }
            readStory(result.speakStory[rang]);
        }
    }
    // --- Parler (ajoute un message au fil) ---
    const speak = (text, sender = "cat", type) => {
        setCat(prev => {
            const next = {
                ...prev,
                messages: [...prev.messages, { sender, text, type, time: Date.now() }],
            };
            localStorage.setItem("tamagochat", JSON.stringify(next));
            return next;
        });
    };
    const affectResources = (resourcesModifier) => {
        if (!resourcesModifier) return;
        setCat((prev) => {
            const next = { ...prev };
            next.resources = { ...prev.resources };

            for (const [key, delta] of Object.entries(resourcesModifier)) {
                const current = next.resources[key] || 0;
                next.resources[key] = Math.max(0, current + delta);
            }

            localStorage.setItem("tamagochat", JSON.stringify(next));
            return next;
        });
    };

    // --- Affecte des stats numériques ---
    const affectStat = (changes) => {
        setCat((prev) => {
            const next = {
                ...prev,
                ...Object.fromEntries(
                    Object.entries(changes).map(([k, v]) => [
                        k,
                        Math.max(0, Math.min(100, (prev[k] || 0) + v)),
                    ])
                ),
                lastUpdate: Date.now(),
            };
            next.mood = computeMood(next);
            localStorage.setItem("tamagochat", JSON.stringify(next));
            return next;
        });
    };
    const affectRelation = (targetId, change) => {
        setCat(prev => {
            const next = { ...prev };
            const relIndex = next.relations.findIndex(r => r.id === targetId);
            if (relIndex === -1) return prev;

            const rel = { ...next.relations[relIndex] };

            if (change.defcon !== undefined) {
                rel.defcon = Math.max(1, Math.min(5, rel.defcon + change.defcon));
            }

            if (change.trust !== undefined) {
                rel.trust = Math.max(-100, Math.min(100, (rel.trust || 0) + change.trust));
            }

            next.relations[relIndex] = rel;
            localStorage.setItem("tamagochat", JSON.stringify(next));
            return next;
        });
    };

    // --- Message selon humeur ---

    // --- Cycle automatique (dégradation lente des stats) ---
    useEffect(() => {
        const timer = setInterval(() => {
            setCat((prev) => {
                const now = Date.now();
                const deltaMin = (now - prev.lastUpdate) / (20 * rythme);
                if (deltaMin < 0.1) return prev;
                // --- AJOUT dans le loop principal, avant les calculs de hunger/energy/etc.
                let energyFactor = 1, hungerFactor = 1, affectionFactor = 1, santeFactor = 1, territorialiteFactor = 1;

                switch (timeOfDay) {
                    case "matin":
                        energyFactor = 1.3;        // plus actif
                        hungerFactor = 1.4;        // plus faim
                        territorialiteFactor = 0.8; // explore moins loin de son territoire
                        break;
                    case "apreme":
                        hungerFactor = 1.1;        // mange un peu
                        affectionFactor = 1.2;     // plus sociable
                        break;
                    case "soir":
                        hungerFactor = 1.2;        // faim avant la nuit
                        santeFactor = 1.1;         // petite récupération
                        break;
                    case "nuit":
                        energyFactor = -0.8;       // récupère de l’énergie (remonte)
                        hungerFactor = 1.5;        // métabolisme actif → consomme plus
                        break;
                    default:
                        break;
                }

                const hunger = Math.max(0, prev.hunger - 2 * deltaMin * hungerFactor);
                const energy = Math.max(0, prev.energy - 1.5 * deltaMin * energyFactor);
                const affection = Math.max(0, prev.affection - 1 * deltaMin * affectionFactor);
                const sante = Math.max(0, prev.sante - 0.5 * deltaMin * santeFactor);
                const territorialite = Math.min(100, prev.territorialite + 0.2 * deltaMin * territorialiteFactor);

                const mood = computeMood({ hunger, energy, affection, sante, territorialite });

                const next = {
                    ...prev,
                    hunger,
                    energy,
                    affection,
                    sante,
                    territorialite,
                    mood,
                    lastUpdate: now,
                };
                localStorage.setItem("tamagochat", JSON.stringify(next));
                return next;
            });
        }, rythme);
        return () => clearInterval(timer);
    }, [rythme, timeOfDay]);

    // --- Réagit aux changements d’humeur ---
    useEffect(() => {
        const message = generateMessage(cat.mood, cat.personality);
        if (message) speak(message);
    }, [cat.mood]);



function triggerCatEvent() {
  const event = CAT_EVENTS.find(e => Math.random() < e.probability);
  if (!event) return;

  speak(event.text, "cat", "event");
  affectStat(event.statModifier);

  // on “flag” l’événement actif
  if (event.flag) {
    setCat(prev => ({
      ...prev,
      currentFlags: { ...(prev.currentFlags || {}), [event.flag]: true },
    }));
  }
}
    // --- Événements sociaux aléatoires ---
    const triggerSocialEvent = () => {
        const partner = CAT_AROUND[Math.floor(Math.random() * CAT_AROUND.length)];
        const dialogue = `Ton chat croise ${partner.name} 🐾`;

        speak(dialogue, "system");
        if (!cat.relations.find(c => c.id === partner.id)) {
            speak('Tiens une nouvelle tete ? Je le connais pas lui', "cat", "thought");
            setCat(c => {
                return { ...c, relations: [...c.relations, { id: partner.id, defcon: 3, trust: 0 }] }
            })
        }
        const c = cat.personality;
        const p = partner.personality;

        // Calcul de compatibilité globale (moyenne pondérée)
        const compatibility =
            0.4 * (1 - Math.abs(c.amical - p.amical)) +
            0.3 * (1 - Math.abs(c.sociable - p.sociable)) +
            0.2 * (1 - Math.abs(c.curieux - p.curieux)) +
            0.1 * (1 - Math.abs(c.voleur - p.voleur));

        // Trouver la relation correspondante
        const relIndex = cat.relations.findIndex(r => r.id === partner.id);
        if (relIndex === -1) return;

        // Récupérer la relation actuelle
        const currentDefcon = cat.relations[relIndex].defcon;

        // Si la compatibilité est forte
        if (compatibility > 0.6) {
            if (currentDefcon < 5) {
                // On améliore la relation d’un cran
                cat.relations[relIndex].defcon = Math.min(5, currentDefcon + 1);
                speak(`${partner.name} semble apprécier ma compagnie 😺`);
                affectStat({ affection: +4, territoriality: -2 });
            } else {

                const event = happinessEvents.find(e => Math.random() < e.probability);
                if (event) {
                    speak(event.text.replace("${partner.name}", partner.name));
                    affectStat({ affection: +8, energy: +3, health: +2 });
                }
            }
        } else if (compatibility < 0.3) {
            if (currentDefcon > 1) {
                // On diminue la relation d’un cran
                cat.relations[relIndex].defcon = Math.max(1, currentDefcon - 1);
                speak(`Crachats et intimidation envers ${partner.name} 💀 `);
                affectStat({ affection: +4, territoriality: -2 });
            } else {

                const event = evilEvents.find(e => Math.random() < e.probability);
                if (event) {
                    speak(event.text.replace("${partner.name}", partner.name));
                    const { statModier, relationModifier, speakLog } = event.meetingResult(cat, partner)
                    affectStat(statModier);
                    affectRelation(partner.id, relationModifier);
                    if (speakLog != null)
                        speak(speakLog, "system");
                }
            }
        } else {
            // Compatibilité faible → tension
            const resultDice = Math.random();
            const resultFight = (resultDice < 0.3) ? 'win' : ((Math.random() > 0.7) ? 'lose' : 'equal')
            const combatDeRegard = `${partner.name} me lance un combat de regard...${resultFight === 'win' ? "Il s'est enfui ce couard" : (resultFight === "lose" ? "Il fout trop les boules, j'ai filé discretos" : "Un papillon nous a distrait. Match nul")}`

            cat.relations[relIndex].defcon = Math.max(1, Math.min(5, currentDefcon + (resultFight == 'win' ? 1 : (resultFight == 'lose' ? -1 : 0))));
            speak(combatDeRegard, "cat");
            affectStat({ affection: -3, energy: -2, territoriality: +5 });
        }

    };

    // Déclenche un événement social environ toutes les 3 à 6 minutes
    useEffect(() => {
        const delay = Math.random() * 3 + 3;
        const delay2 = Math.random() * 5 + 3;
        const timer = setInterval(triggerSocialEvent, delay * rythme * 10);
         const timer2 = setInterval(triggerCatEvent, delay2 * rythme * 10);
        return () => {
            clearInterval(timer);
            clearInterval(timer2);
        }
    }, [rythme]);

    // changement de cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeOfDay(prev => {
                const nextCycle = { matin: "apreme", "apreme": "soir", soir: "nuit", nuit: "matin" };
                return nextCycle[prev];
            });
        }, rythme * 20); // cycle toutes les 5 minutes pour test (puis allonger)
        return () => clearInterval(interval);
    }, [rythme]);


    const value = {
        cat,
        setCat,
        rythme, setRythme,
        affectStat,
        speak, applyAction,
        timeOfDay,
    };

    return (
        <CatContext.Provider value={value}>
            {children}
        </CatContext.Provider>
    );
}
