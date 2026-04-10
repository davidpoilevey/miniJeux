import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Collapse } from '@mui/material';
import { bonusCaseDepart, useMono } from './MonoContext';
import { cartesChance, cartesCommu, getPrixMaison } from './Board';
import React, { useEffect } from 'react';
import { Dice } from '../miniJeux/Alpiniste';

const ActionModal = () => {
  const { 
    modalAction, 
    closeModal, 
    acheterPropriete, 
    transfertArgent, setParcPactole,
    modifierArgent,avanceJoueur, addItem,metEnTaule,jourDeTaule,
    joueurs, currentJoueur,
    acheterMaison
  } = useMono();
  const [moneyNeeded, needMoney] = React.useState(0);
  const [tenteLaChance, setTenteLaChance] = React.useState(false);
  const tiragesDes = tenteLaChance ? [[
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ],[
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ],[
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ]] : [];
  if (!modalAction) return null;
    const joueur = joueurs[modalAction.joueurIdx];

  const handleConstruire = () => {
    const success = acheterMaison(modalAction.joueurIdx, modalAction.caseInfo.id);
    if (success) {
      closeModal();
    }else {
      alert("Pas assez d'argent !");
    }
  };
  const handleAchat = () => {
    const success = acheterPropriete(modalAction.joueurIdx, modalAction.caseInfo.id);
    if (success) {
      closeModal();
    } else {
      alert("Pas assez d'argent !");
    }
  };

  const handlePayerLoyer = () => {
    if(joueur.argent < modalAction.montant){
      needMoney(modalAction.montant);
    }
    else{

      transfertArgent(modalAction.joueurIdx, modalAction.proprietaireIdx, modalAction.montant);
      closeModal();
    }
  };

  const handlePayerTaxe = () => {
     if(joueur.argent < modalAction.montant){
      needMoney(modalAction.montant);
    }
    else{

    modifierArgent(modalAction.joueurIdx, -modalAction.montant);
    closeModal();
    }
  };

  const handleAllerEnPrison = () => {
    metEnTaule(modalAction.joueurIdx);
    closeModal();
  };
  const prisonBreak=(choice, desSuccess)=>{
    if(choice==='pay'){
      if(joueur.argent < 1000){
        needMoney(1000);
        return;
      }
      modifierArgent(modalAction.joueurIdx, -1000);
       modalAction.onSuccess&&modalAction.onSuccess();
    }else if(choice==='des'){
      if(desSuccess){
        // Sortie de prison
         modalAction.onSuccess&&modalAction.onSuccess();
      }
      else jourDeTaule(modalAction.joueurIdx);
    }
    else if(choice==='stay'){
      // Rester en prison
      jourDeTaule(modalAction.joueurIdx);
    }
     
      closeModal();
  }

  const renderContent = () => {

    switch (modalAction.type) {
      case 'achat':
        const peutAcheter = joueur.argent >= modalAction.caseInfo.price;
        return (
          <>
            <DialogTitle>
              Propriété disponible : {modalAction.caseInfo.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" color={modalAction.caseInfo.colorGroup}>
                Prix : {modalAction.caseInfo.price.toLocaleString()}€
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Votre argent : {joueur.argent.toLocaleString()}€
              </Typography>
              {!peutAcheter && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  ❌ Pas assez d'argent !
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeModal} disabled={currentJoueur!=0}>Refuser</Button>
              <Button 
                onClick={handleAchat} 
                variant="contained" 
                disabled={!peutAcheter||currentJoueur!=0}
              >
                Acheter
              </Button>
            </DialogActions>
          </>
        );

      case 'loyer':
        const proprietaire = joueurs[modalAction.proprietaireIdx];
        return (
          <>
            <DialogTitle>
              Loyer à payer
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                Vous êtes sur <strong>{modalAction.caseInfo.name}</strong>
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Propriété de <strong style={{ color: proprietaire.color }}>
                  {proprietaire.name}
                </strong>
              </Typography>
              <Typography variant="h6" color="error" sx={{ mt: 2 }}>
                Loyer : {modalAction.montant.toLocaleString()}€
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handlePayerLoyer} variant="contained"  disabled={currentJoueur!=0} color="error">
                Payer
              </Button>
            </DialogActions>
          </>
        );
 case 'construction':
        const prixMaison = getPrixMaison(modalAction.caseInfo.colorGroup);
        const nbMaisons = modalAction.caseInfo.maisons || 0;
        const peutConstruire = joueur.argent >= prixMaison && nbMaisons < 5;
        const labelMaison = nbMaisons === 4 ? "Hôtel" : "Maison";

        return (
          <>
            <DialogTitle>
              Votre propriété : {modalAction.caseInfo.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {nbMaisons === 0 && "Pas de construction"}
                {nbMaisons === 1 && "🏠 1 maison"}
                {nbMaisons === 2 && "🏠🏠 2 maisons"}
                {nbMaisons === 3 && "🏠🏠🏠 3 maisons"}
                {nbMaisons === 4 && "🏠🏠🏠🏠 4 maisons"}
                {nbMaisons === 5 && "🏨 Hôtel"}
              </Typography>
              
              {nbMaisons < 5 && (
                <>
                  <Typography variant="h6" color="primary">
                    Construire {nbMaisons === 4 ? "un hôtel" : "une maison"} : {prixMaison}€
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Votre argent : {joueur.argent.toLocaleString()}€
                  </Typography>
                  {!peutConstruire && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      ❌ Pas assez d'argent !
                    </Typography>
                  )}
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeModal}>Passer</Button>
              {nbMaisons < 5 && (
                <Button 
                  onClick={handleConstruire} 
                  variant="contained" 
                  disabled={!peutConstruire}
                  color="success"
                >
                  Construire
                </Button>
              )}
            </DialogActions>
          </>
        );
      case 'taxe':
        return (
          <>
            <DialogTitle>
              {modalAction.caseInfo.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" color="error">
                Montant à payer : {modalAction.montant.toLocaleString()}€
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handlePayerTaxe} disabled={currentJoueur!=0} variant="contained" color="error">
                Payer
              </Button>
            </DialogActions>
          </>
        );

      case 'prison':
        return (
          <>
            <DialogTitle>
              🚔 Allez en Prison !
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                Vous êtes envoyé directement en prison.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Ne passez pas par la case Départ, ne recevez pas 2000€.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAllerEnPrison} disabled={currentJoueur!=0} variant="contained">
                OK
              </Button>
            </DialogActions>
          </>
        );
      case 'sortirPrison':
        return (
          <>
            <DialogTitle>
              🚔 Vous etes en Prison !
            </DialogTitle>
            <DialogContent>
              <Button onClick={()=>prisonBreak('stay')} disabled={currentJoueur!=0||tenteLaChance} variant="text">
                Y rester un tour de plus (reste {joueur.enPrison} tours)
              </Button>
             <Button onClick={()=>prisonBreak('pay')} disabled={currentJoueur!=0||tenteLaChance} variant="text">
               Payer pour sortir 1000€
              </Button>
             <Button onClick={()=>setTenteLaChance(true)} disabled={currentJoueur!=0} variant="text">
               Tenter ma chance aux dés (Doit faire un double sinon un jour de plus en prison)
              </Button>
              <Collapse in={tenteLaChance}>
              {tiragesDes.map((paire, index) => {
                const [de1, de2] = paire;
                 const desSuccess = de1 === de2;
                 if(index===2 && tenteLaChance){
                   // Troisième essai, on applique le résultat
                   prisonBreak('des', desSuccess);
                 }
                return <Box key={index} sx={{ mt: 2, display:'flex', textAlign: 'center' }}>
                    <Dice size={64} value={de1} />
                    <Dice size={64} value={de2} />
                    {desSuccess ? (<Typography variant="h6" color="success.main" sx={{ ml: 2, alignSelf: 'center' }}>
                      🎉 Double ! Vous sortez de prison.
                    </Typography>
                  ) : (
                    <Typography variant="h6" color="error.main" sx={{ ml: 2, alignSelf: 'center' }}>
                      ❌ Pas un double.
                    </Typography>
                  )}
                  </Box>
              })}
              </Collapse>
            </DialogContent>
          </>
        );
        case 'chance':
        case 'commu':
          
           const {carte, applyCarteEffect} = tirerCarte(modalAction.type, {positionActuelle:joueur.caseNo,joueurs,metEnTaule
            , addItem, currentJoueur, modifierArgent,avanceJoueur, setParcPactole,transfertArgent});
        return (
         <>
      <DialogTitle>🎲 Carte {modalAction.caseInfo}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{carte.texte}</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={()=>{
            applyCarteEffect(carte);
            closeModal();
          }
          }
          disabled={currentJoueur !== 0}
          variant="contained"
        >
          OK
        </Button>
      </DialogActions>
    </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onClose={closeModal}>
      {moneyNeeded>0?<ContentDebt moneyNeeded={moneyNeeded}
         needMoney={needMoney}/>:renderContent()}
    </Dialog>
  );
};

export default ActionModal;

const ContentDebt=({ moneyNeeded, needMoney})=>{
  const {board, modifierArgent, setBoard, joueurs, currentJoueur, setJoueurs} = useMono();
   const joueur = joueurs[currentJoueur];
   // Récupérer les propriétés du joueur
        const proprietes = joueur.proprietes.map(propId => 
          board.flat().find(c => c.id === propId)
        ).filter(Boolean);
    useEffect(() => {
      //Fermer quand la dette est remboursée
      if (joueur.argent >= moneyNeeded) {
        needMoney(0);
      }
    }, [joueur.argent, moneyNeeded]);
  return(
    <DialogContent>
      <Typography variant="h6" color="error">
        Vous n'avez pas assez d'argent pour payer cette dette de {moneyNeeded}$ !
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
       Il vous manque {moneyNeeded - joueur.argent}$.
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Veuillez vendre ou hypothequer des propriétés ou des maisons.
      </Typography>
       {proprietes.map(prop => {
        const prixBati = prop.maisons > 0 ? (getPrixMaison(prop.colorGroup) * prop.maisons) / 4 : 0;
                 return  <Box 
                    key={prop.id} 
                    sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mt:2, p:1, border:'1px solid #ccc', borderRadius:1}} 
                  >
                    <Typography>{prop.name}</Typography>
                    <Typography>Valeur foncier: {(prop.price/2).toLocaleString()}€</Typography>
                    {prop.maisons > 0&&<Typography>Valeur bati: {prixBati.toLocaleString()}€</Typography>}
                    {/* Boutons pour vendre ou hypothequer */}
                   
                    <Box>
                       {prop.maisons > 0 && ( <Button 
                        variant="contained" 
                        color="primary" disabled={prop.hypotheque}
                        size="small" 
                        sx={{ mr: 1 }}
                        onClick={()=>{
                          // Logique de vente de maisons
                          modifierArgent(joueur.id, prixBati);
                          setBoard((prevBoard) => {
                                return prevBoard.map(row => 
                                  row.map(cell => 
                                    cell.id === prop.id ? { ...cell, maisons: 0 } : cell
                                  )
                                );
                              });
                        }}
                      >
                       Privatiser le bati (revendre toutes les maisons)
                      </Button>)}
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"  disabled={prop.hypotheque}
                        sx={{ mr: 1 }}
                        onClick={()=>{
                          // Logique de vente
                           modifierArgent(joueur.id, prop.price/2);
                          setBoard((prevBoard) => {
                                return prevBoard.map(row => 
                                  row.map(cell => 
                                    cell.id === prop.id ? { ...cell, owner:null, maisons: 0 } : cell
                                  )
                                );
                              });
                            // remove prop.id from joueur.proprietes
                              setJoueurs((prevJoueurs) => {
                                return prevJoueurs.map(p => 
                                  p.id === joueur.id ? { 
                                    ...p, 
                                    proprietes: p.proprietes.filter(pid => pid !== prop.id) 
                                  } : p
                               );
                          });
                        }}
                      >
                        Vendre a la banque
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        size="small"  disabled={prop.hypotheque}
                        onClick={()=>{
                          // Logique d'hypotheque
                           modifierArgent(joueur.id, prop.price/3);
                           setBoard((prevBoard) => {
                                return prevBoard.map(row => 
                                  row.map(cell => 
                                    cell.id === prop.id ? { ...cell, hypotheque:true } : cell
                                  )
                                );
                              });
                        }}
                      >
                        Hypothéquer (30% du prix d'achat)
                      </Button>
                    </Box>  
                  </Box>
      }
)}
    </DialogContent>
  )
}


export function tirerCarte(type, {positionActuelle,setParcPactole, modifierArgent,metEnTaule, addItem,joueurs,avanceJoueur, transfertArgent, currentJoueur}) {
  

  const cartes = type === "chance" ? cartesChance : cartesCommu;
  const carte = cartes[Math.floor(Math.random() * cartes.length)];

  const applyCarteEffect=(carte)=>{
    
  // Application de l’effet
  switch (carte.action) {
    case "avancer_depart":
      avanceJoueur(40 - positionActuelle); // ou selon ton système de board
      modifierArgent(currentJoueur, bonusCaseDepart);
      break;

    case "avancer_case":
      avanceJoueur(40 - positionActuelle); // ou selon ton système de board
      modifierArgent(currentJoueur, bonusCaseDepart);
      break;
    case "aller_prison":metEnTaule(currentJoueur);
       break;
    case "carte_sortie":
      addItem('carte_sortie');
      break;
    case "payer":
      modifierArgent(currentJoueur, -carte.params.montant);
      setParcPactole(prev => prev + carte.params.montant);
      break;
    case "recevoir":
      modifierArgent(currentJoueur, carte.params.montant);
      break;
    case "reculer":
      avanceJoueur(-carte.params.nb);
      break;
    case "collecter_autres":
      joueurs.forEach((_, idx) => {
        if (idx !== currentJoueur) {
          transfertArgent(idx, currentJoueur, carte.params.montant);
        }
      });
      break;
    case "payer_autres":
      joueurs.forEach((_, idx) => {
        if (idx !== currentJoueur) {
          transfertArgent(currentJoueur, idx, carte.params.montant);
        }
      });
      break;
    default:
      console.warn("Action non reconnue :", carte.action);
  }
  }

  return {carte, applyCarteEffect};
}
