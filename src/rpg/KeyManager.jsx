// KeyManager.js - Modifié avec touche d'interaction
import { useEffect } from "react";
import { useRPGContext } from "./RPGContext";
import { ANIMATIONS } from "./hooks";
import { soundManager } from "./sons/SoundManager";

export const KeyManager = () => {
  const { state, dispatch, interact, stopPoussee, isOnGround } = useRPGContext();

  useEffect(() => {
    const handleKeyUp = (e) => {
      if (state.knightAction === 'pousse') {
        stopPoussee();
      }
      if (e.code === 'd') {
        dispatch({ type: 'STOP_PROTEGER' });
      }
      if (ANIMATIONS[state.knightAction]?.loop)
        dispatch({ type: "END_ANIMATION" });
    };

    const handleKeyPress = (e) => {
      // Ignorer les répétitions automatiques
      if (e.repeat && !state.grimpant) {
        return;
      }
      e.preventDefault();

      switch (e.key) {
        case 'ArrowLeft':
          if (state.knightAction !== 'marche' && !state.grimpant)
            dispatch({ type: "MOVE", payload: { direction: 'left' } });
          break;
        case 'ArrowRight':
          if (state.knightAction !== 'marche' && !state.grimpant)
            dispatch({ type: "MOVE", payload: { direction: 'right' } });
          break;
        case 'ArrowUp':
          if (state.grimpant) {
            dispatch({ type: "MOVE_UPDOWN", payload: { direction: 'up' } });
          } else if (state.crouched) {
            dispatch({ type: "CROUCH", payload: false });
          } else {
            const onGround = state.knightAction !== 'saut' && state.knightAction !== 'tombe';
            const canDoubleJump = !state.hasDoubleJumped && (state.knightAction === 'saut' || state.knightAction === 'tombe');

            if (onGround) {
              // Saut normal
              dispatch({ type: "JUMP" });
              dispatch({ type: 'SET_DOUBLE_JUMP_USED', payload: false }); // on reset au cas où
            } else if (canDoubleJump) {
              // Double saut autorisé
              dispatch({ type: "JUMP" });
              dispatch({ type: 'SET_DOUBLE_JUMP_USED', payload: true });
            } else {
              // Aucun saut autorisé
              console.log("Saut ignoré : conditions non valides");
            }
          }
          break;

        case 'ArrowDown':
          if (state.grimpant)
            dispatch({ type: "MOVE_UPDOWN", payload: { direction: 'down' } });
          else
            dispatch({ type: "CROUCH", payload: true });
          break;
        case 'p': //POTION
          soundManager.play('glou');
          dispatch({ type: 'USE_POTION' });
          break;
        case 'd': // bouclier :D
          dispatch({ type: 'SE_PROTEGER' });
          break;
        case 'e':
        case ' ':
          // NOUVELLE TOUCHE : Interaction espace ou E
          interact();
          break;
        case 'x':  // ATTAQUES CXZ
          soundManager.play('sword');
          if (state.knightAction !== 'attaque1')
            dispatch({ type: "ATTACK", payload: { type: 'attaque1' } });
          break;
        case 'z':
          if (state.knightAction !== 'attaqueTournoie')
            dispatch({ type: "ATTACK", payload: { type: 'attaqueTournoie' } });
          break;
        case 'c':
          if (state.knightAction !== 'attaqueLancee')
            dispatch({ type: "ATTACK", payload: { type: 'attaqueLancee' } });
          break;
        default:
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.knightAction, interact]);

  return null;
};