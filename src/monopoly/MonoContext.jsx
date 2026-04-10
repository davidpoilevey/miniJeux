import { createContext, useContext, useEffect, useState } from "react";
import { boardLayout, getPrixMaison, joueursDeBase } from "./Board";
import { tirerCarte } from "./ModalAction";

export const bonusCaseDepart = 2000;
export const MonoContext = createContext();

export const useMono = () => useContext(MonoContext);
export function MonoProvider({ children }) {
  const [joueurs, setJoueurs] = useState([...joueursDeBase]);
  const [currentJoueur, setCurrentJoueur] = useState(0);
  const [board, setBoard] = useState(boardLayout);
  const [doublesCount, setDoublesCount] = useState(0);
  const [parcPactole, setParcPactole] = useState(0);
  const [modalAction, setModalAction] = useState(null);
  const [isIAPlaying, setIsIAPlaying] = useState(false);


// Fonction pour l'IA
const iaDecision = (joueurIdx) => {
  const joueur = joueurs[joueurIdx];
  const caseActuelle = board.flat().find(c => c.order === joueur.caseNo);
  
  if (!caseActuelle) return;

  if ((caseActuelle.type === 'propriete' || caseActuelle.type === 'gare'|| caseActuelle.type === 'compagnie') && 
      caseActuelle.owner == null) {
    
    const price = caseActuelle.price;
    const argentRestant = joueur.argent - price;
    
    // Critères de décision
    let score = 0;
    
    // 1. Garder un minimum d'argent (priorité haute)
    if (argentRestant < 3000) {
      score -= 100; // Ne pas acheter si on descend sous 3000€
    }
    
    // 2. Compléter un monopole (très important)
    if (caseActuelle.colorGroup && caseActuelle.colorGroup !== 'gray') {
      const propsMemeCouleur = board.flat().filter(c => 
        c.colorGroup === caseActuelle.colorGroup && c.type === 'propriete'
      );
      const possedees = propsMemeCouleur.filter(c => 
        joueur.proprietes.includes(c.id)
      );
      
      if (possedees.length > 0) {
        score += 50; // Bonus pour compléter une série
      }
      
      if (possedees.length === propsMemeCouleur.length - 1) {
        score += 100; // TRÈS important de compléter le monopole
      }
    }
    
    
    // 3. Les gares sont toujours intéressantes
    if (caseActuelle.type === 'gare') {
      score += 30;
    }
    if (caseActuelle.type === 'compagnie') {
      score += 20;
    }
    
    // 4. Prix raisonnable
    if (price <= 1500) {
      score += 20; // Les propriétés pas chères sont moins risquées
    }
    
    // Décision finale
    const shouldBuy = score > 0 && argentRestant >= 3000;
    
    setTimeout(() => {
      if (shouldBuy) {
        acheterPropriete(joueurIdx, caseActuelle.id);
      }
      setModalAction(null);
    }, 1500);
    
    return shouldBuy;
  }
  let shouldBuild=false;
   // Si c'est sa propriété et il peut construire
  if (modalAction?.type === 'construction') {
    const prixMaison = getPrixMaison(caseActuelle.colorGroup);
    const argentRestant = joueur.argent - prixMaison;
    
    // L'IA construit si elle garde au moins 3000€
    shouldBuild = (argentRestant >= 3000 && caseActuelle.maisons < 5)
  }
  // Pour les loyers, taxes : payer automatiquement
  if (modalAction) {
    setTimeout(() => {
      switch (modalAction.type) {
        case 'loyer':
          transfertArgent(modalAction.joueurIdx, modalAction.proprietaireIdx, modalAction.montant);
          break;
        case 'construction':
          if (shouldBuild) {
            acheterMaison(modalAction.joueurIdx, modalAction.caseInfo.id);
          }
          break;
        case 'taxe':
          modifierArgent(modalAction.joueurIdx, -modalAction.montant);
          break;
        case 'sortirPrison':
          if(joueur.argent>=1000)
            modifierArgent(modalAction.joueurIdx, -1000);
          else jourDeTaule(modalAction.joueurIdx);
          break;
        case 'prison':
          setJoueurs((prevJoueurs) => {
            return prevJoueurs.map((j, idx) => {
              if (idx === modalAction.joueurIdx) {
                return { ...j, caseNo: 10, enPrison: 3 };
              }
              return j;
            });
          });
          break;
          case 'chance':
          case 'commu':
          //TODO chance et commu ??
           const {carte, applyCarteEffect} = tirerCarte(modalAction.type, {positionActuelle:joueur.caseNo,joueurs,metEnTaule
            , addItem, currentJoueur, modifierArgent,avanceJoueur, transfertArgent});
          applyCarteEffect(carte);
          break;
          default:
      }
      setModalAction(null);
    }, 1000);
  }
};
const metEnTaule = (joueurIdx) => {
  setJoueurs((prevJoueurs) => {
      return prevJoueurs.map((j, idx) => {
        if (idx === joueurIdx) {
          return { ...j, caseNo: 10, enPrison: 3 }; // Case prison = 10
        }
        return j;
      });
    });
  }
  const jourDeTaule = (joueurIdx) => {
    setJoueurs((prevJoueurs) => {
        return prevJoueurs.map((j, idx) => {
          if (idx === joueurIdx) {
            return { ...j, enPrison: j.enPrison - 1 };
          }
          return j;
        });
      });
      // et next joueur (normalement automatique apres modal)

    }
const addItem = (item) => {
    setJoueurs((prevJoueurs) => {
      return prevJoueurs.map((j, idx) => {
        if (idx === currentJoueur) {
          const newItems = j.items ? [...j.items, item] : [item];
          return { ...j, items: newItems };
        }
        return j;
      });
    });
  }
  const avanceJoueur = (totalDe) => {
    setJoueurs((prevJoueurs) => {
      const newJoueurs = prevJoueurs.map((j, idx) => {
        if (idx === currentJoueur) {
          let oldPos = j.caseNo;
          let newPos = (j.caseNo + totalDe) % 40;
          
          let bonus = 0;
          if (newPos < oldPos) {
            bonus = bonusCaseDepart;
          }
          
          return { ...j, caseNo: newPos, argent: j.argent + bonus };
        }
        return j;
      });

      // Après avoir mis à jour la position, on déclenche l'action de la case
      const joueurActuel = newJoueurs[currentJoueur];
      const caseArrivee = board.flat().find(c => c.order === joueurActuel.caseNo);
      
      // Déclencher la modal selon le type de case
      setTimeout(() => {
        handleCaseAction(caseArrivee, joueurActuel, totalDe);
      }, 100);

      return newJoueurs;
    });

    saveMonopoly({joueurs, board, parcPactole});// sauvegarde chaque tour
  };
  useEffect(() => { //autoLoad
    const savedData = loadMonopoly();
    if (savedData) {
      setJoueurs(savedData.joueurs);
      setBoard(savedData.board);
      setParcPactole(savedData.parcPactole || 0);
    }
  }, []);

  const sortirPrison = (exitFunc) => {
    
     setModalAction({
            type: 'sortirPrison',
            caseInfo: {id:'prison'},
            onSuccess: exitFunc,
            joueurIdx: currentJoueur
          });
  }
  const handleCaseAction = (caseInfo, joueur, totalDe) => {
    if (!caseInfo) return; 

    switch (caseInfo.type) {
      case 'propriete':
      case 'compagnie':
      case 'gare':
        if (caseInfo.owner == null) {
          // Propriété libre : proposition d'achat
          setModalAction({
            type: 'achat',
            caseInfo: caseInfo,
            joueurIdx: currentJoueur
          });
         } else if (caseInfo.owner === currentJoueur) {
          // C'est SA propriété : proposition de construction
          if (caseInfo.type === 'propriete' && caseInfo.maisons < 5) {
            setModalAction({
              type: 'construction',
              caseInfo: caseInfo,
              joueurIdx: currentJoueur
            });
          }
          // Sinon on ne fait rien (c'est sa propriété mais pas de construction possible)
     } else if (caseInfo.owner !== currentJoueur) {
          // Propriété d'un autre joueur : payer loyer
          const loyer = calculerLoyer(caseInfo.id, totalDe);
          setModalAction({
            type: 'loyer',
            caseInfo: caseInfo,
            proprietaireIdx: caseInfo.owner,
            joueurIdx: currentJoueur,
            montant: loyer
          });
        }
        // Si c'est sa propre propriété, rien ne se passe
        break;

      case 'special':
        if (caseInfo.id === 'impots' || caseInfo.id === 'taxe') {
          const montant = caseInfo.id === 'impots' ? 2000 : 1000;
          setModalAction({
            type: 'taxe',
            caseInfo: caseInfo,
            joueurIdx: currentJoueur,
            montant: montant
          });
        } else if (caseInfo.id === 'allezEnPrison') {
          setModalAction({
            type: 'prison',
            joueurIdx: currentJoueur
          });
        } else if (caseInfo.id === 'parcgratuit') {
          modifierArgent(currentJoueur,parcPactole);
          setParcPactole(0);
        } else if (caseInfo.id === 'depart') {
          modifierArgent(currentJoueur,bonusCaseDepart);
        } else if (caseInfo.id.startsWith('chance')) {
          setModalAction({
            type: 'chance',
            joueurIdx: currentJoueur
          });
        }else if (caseInfo.id.startsWith('commu')) {
          setModalAction({
            type: 'commu',
            joueurIdx: currentJoueur
          });
        }
       
        break;

      default:
        // Cases spéciales sans action (départ, parc gratuit, etc.)
        break;
    }
  };

  const closeModal = () => {
    setModalAction(null);
  };

  const transfertArgent = (fromIdx, toIdx, montant) => {
    setJoueurs((prevJoueurs) => {
      return prevJoueurs.map((j, idx) => {
        if (idx === fromIdx) {
          return { ...j, argent: j.argent - montant };
        }
        if (idx === toIdx) {
          return { ...j, argent: j.argent + montant };
        }
        return j;
      });
    });
  };

  const modifierArgent = (joueurIdx, montant) => {
    setJoueurs((prevJoueurs) => {
      return prevJoueurs.map((j, idx) => {
        if (idx === joueurIdx) {
          return { ...j, argent: j.argent + montant };
        }
        return j;
      });
    });
  };

  const acheterPropriete = (joueurIdx, caseId) => {
    const caseInfo = board.flat().find(c => c.id === caseId);
    if (!caseInfo || !caseInfo.price) return false;

    const joueur = joueurs[joueurIdx];
    if (joueur.argent < caseInfo.price) return false; // Pas assez d'argent

    // Mettre à jour le propriétaire sur le board
    setBoard((prevBoard) => {
      return prevBoard.map(row => 
        row.map(cell => 
          cell.id === caseId ? { ...cell, owner: joueurIdx } : cell
        )
      );
    });

    // Débiter l'argent et ajouter la propriété au joueur
    setJoueurs((prevJoueurs) => {
      return prevJoueurs.map((j, idx) => {
        if (idx === joueurIdx) {
          return {
            ...j,
            argent: j.argent - caseInfo.price,
            proprietes: [...j.proprietes, caseId]
          };
        }
        return j;
      });
    });

    return true;
  };

  
  // Calculer le loyer avec les maisons
  const calculerLoyer = (caseId, totalDes=7) => {
    const caseInfo = board.flat().find(c => c.id === caseId);
    if (!caseInfo || caseInfo.owner === null) return 0;

    let loyer = Math.floor(caseInfo.price * 0.1);

    // Si gare
    if (caseInfo.type === 'gare') {
      const proprietaire = joueurs[caseInfo.owner];
      const nbGares = proprietaire.proprietes.filter(propId => {
        const prop = board.flat().find(c => c.id === propId);
        return prop && prop.type === 'gare';
      }).length;
      return 250 * Math.pow(2, nbGares - 1);
    }

    // Si compagnie
    if (caseInfo.type === 'compagnie') {
      const proprietaire = joueurs[caseInfo.owner];
      const nbComp = proprietaire.proprietes.filter(propId => {
        const prop = board.flat().find(c => c.id === propId);
        return prop && prop.type === 'compagnie';
      }).length;
      return totalDes*(nbComp==1?400:totalDes*nbComp==2?1000:0);
    }

    // Si propriété avec maisons
    if (caseInfo.maisons > 0) {
      const multiplicateurs = [2, 5, 10, 20, 30]; // 1,2,3,4 maisons, hotel
      loyer = Math.floor(caseInfo.price * 0.1 * multiplicateurs[caseInfo.maisons - 1]);
    } 
    // Si monopole sans maison : loyer x2
    else if (caseInfo.colorGroup && caseInfo.colorGroup !== 'gray') {
      const proprietaire = joueurs[caseInfo.owner];
      const propsMemeCouleur = board.flat().filter(c => 
        c.colorGroup === caseInfo.colorGroup && c.type === 'propriete'
      );
      const possedees = propsMemeCouleur.filter(c => 
        proprietaire.proprietes.includes(c.id)
      );
      
      if (possedees.length === propsMemeCouleur.length) {
        loyer *= 2;
      }
    }

    return loyer;
  };
// Acheter une maison
  const acheterMaison = (joueurIdx, caseId) => {
    const caseInfo = board.flat().find(c => c.id === caseId);
    if (!caseInfo || caseInfo.owner !== joueurIdx) return false;

    // Maximum 5 maisons (la 5ème = hôtel)
    if (caseInfo.maisons >= 5) {
      alert("Cette propriété a déjà un hôtel !");
      return false;
    }

    const prixMaison = getPrixMaison(caseInfo.colorGroup);
    const joueur = joueurs[joueurIdx];

    if (joueur.argent < prixMaison) {
      alert("Pas assez d'argent pour construire !");
      return false;
    }

    // Règle : construction uniforme (pas plus d'1 maison de différence)
    const propsMemeCouleur = board.flat().filter(c => 
      c.colorGroup === caseInfo.colorGroup && c.type === 'propriete'
    );
    const minMaisons = Math.min(...propsMemeCouleur.map(c => c.maisons || 0));
    
    if (caseInfo.maisons > minMaisons) {
      alert("Vous devez construire uniformément sur toutes vos propriétés de cette couleur !");
      return false;
    }

    // Construire la maison
    setBoard((prevBoard) => {
      return prevBoard.map(row => 
        row.map(cell => 
          cell.id === caseId ? { ...cell, maisons: cell.maisons + 1 } : cell
        )
      );
    });

    // Débiter l'argent
    modifierArgent(joueurIdx, -prixMaison);

    return true;
  };
  const playerByCase = (cord) => {
    if (cord == null) return [];
    return joueurs.filter(j => j.caseNo === cord);
  };

  useEffect(() => {
    const newJoueurs = [...joueurs];
    let removeJoueur = []; let expropriation = [];let homeless = [];
    newJoueurs.forEach((j, idx) => {
      if (j.argent < 0 && j.id>0) {
        let dette = j.argent;
       //IA en faillite, vends d'abord batiments puis propriétés. n'hypotheque jamais.
        const proprietes = j.proprietes.map(propId => 
          board.flat().find(c => c.id === propId)
        ).filter(Boolean);
        
         proprietes.forEach(prop => {
                const prixBati = prop.maisons > 0 ? (getPrixMaison(prop.colorGroup) * prop.maisons) / 4 : 0;
                dette += prixBati;
                homeless.push(prop.id);
                if(dette>=0)
               return;
         });
         if(dette<0){
           //vendre propriétés
           proprietes.forEach(prop => {
             dette += prop.price / 2;
             j.proprietes = j.proprietes.filter(id => id !== prop.id);
            expropriation.push(prop.id);
            if(dette>=0)
               return;
           });
         }
         if(dette<0){
           //faillite
           removeJoueur.push(j.id);
         }
         else{
           //mettre à jour joueur
           j.argent += (j.argent - dette);
              
          }
     }
    });
      
      setJoueurs(newJoueurs.filter((j) => !removeJoueur.includes(j.id)));
      // remove maison et owner des propriétés
     
      if (removeJoueur.length > 0) {
        setBoard((prevBoard) => {
          return prevBoard.map(row => 
            row.map(cell => {
              if (removeJoueur.includes(cell.owner)||expropriation.includes(cell.id)) {
                return { ...cell, owner: null, maisons: 0 };
              }
              if (homeless.includes(cell.id)) {
                return { ...cell,  maisons: 0 };
              }
              return cell;
            })
          );
        });
      }

  },[currentJoueur]);

  const contextValue = {
    joueurs,
    setJoueurs,
    currentJoueur,
    setCurrentJoueur,
    avanceJoueur,
    board,addItem,metEnTaule,setBoard,
    playerByCase,
    transfertArgent,
    modifierArgent,
    acheterPropriete,
    calculerLoyer,
    acheterMaison,
    doublesCount,
    setDoublesCount,
    modalAction,
    setModalAction, sortirPrison,jourDeTaule,
    closeModal,
  iaDecision, parcPactole,setParcPactole,
  isIAPlaying,
  setIsIAPlaying
  };

  return (
    <MonoContext.Provider value={contextValue}>
      {children}
    </MonoContext.Provider>
  );
}



function saveMonopoly(world) {
    const data = JSON.stringify(world);
    localStorage.setItem("monopoly", data);
}
function loadMonopoly() {
    const data = localStorage.getItem("monopoly");
    if (!data) {
        console.warn("Aucune sauvegarde trouvée.");
        return null;
    }
    const world = JSON.parse(data);
    return world;
}