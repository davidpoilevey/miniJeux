import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { loadGame, saveGame } from '../civ/utils/saveGame';
import { DIFFICULTY_CONFIGS, isKingInCheck } from "./reflexions";
import { OpeningManager } from "./Ouvertures";
import { soundManager } from "../rpg/sons/SoundManager";
import echecSound from './images/echec.m4a';
import etMatSound from './images/echecEtMat.m4a';
import damnSound from './images/damn.mp3';
import nononoSound from './images/nonono.mp3';
import muhahaSound from './images/muhaha.mp3';
import muhaha2Sound from './images/muhaha2.mp3';
import glisseSound from './images/glisse.mp3';
import { PuzzleManager } from "./PuzzleManager";
export const PIECE_VALUES = {
  pion: 1,
  cavalier: 3,
  fou: 3,
  tour: 5,
  reine: 9,
  roi: 100 // juste pour que l'évaluation reste “finie”
};

const ChessContext = createContext();
export const useChess = () => useContext(ChessContext);
export const ChessProvider = ({ children, ...props }) => {

  const [tourBlancs, setTourBlancs] = useState(true); // Variable pour suivre le tour des blancs

  const [cases, setCases] = useState([]);
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [positionVersion, setPositionVersion] = useState(0);
  const [timerVersion, setTimerVersion] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [dureeJeu, setDureeJeu] = useState(10);
  const [joueurEstBlanc, setJoueurEstBlanc] = useState(true); // true = humain joue blanc

  useEffect(() => {
    setTourBlancs(true);
    soundManager.loadSounds({
      echec: echecSound,
      glisse: glisseSound,
      damn: damnSound,
      nonono: nononoSound,
      muhaha: muhahaSound,
      muhaha2: muhaha2Sound,

      etMat: etMatSound});
  }, [joueurEstBlanc]);
const puzzleManager =useMemo(() => {
  return new PuzzleManager();
  }, []);
  const openingManager = useMemo(() => {
    return new OpeningManager();
  }, []);
  const [difficulte, setDifficulte] = useState(3); // profondeur IA
  const [history, setHistory] = useState([]);
  const [puzzle, setPuzzle] = useState();
  const [gamePhase, setGamePhase] = useState('debut'); // phase du jeu (ouverture, milieu, finale)
  const [echec, setEchec] = useState(false); // affichage "Échec !"
  const [captured, setCaptured] = useState({ white: [], black: [] }); // pions capturés
  const [message, setMessage] = useState(null); // message libre (abandon, victoire...)
  const [timer, setTimer] = useState(dureeJeu * 60); // 10 minutes de jeu

  useEffect(() => {
    if (moveCount < 5) {
      setGamePhase('opening');
    }
    else if (moveCount < 10) {
      setGamePhase('middlegame');
    }
    else if (moveCount < 30) {
      setGamePhase('endgame');
    }
  }, [moveCount]);
  // Un instantané avant chaque coup humain permet d'annuler aussi la réponse de l'IA.
  const logHistory = (openingState) => {
    setHistory(prev => [...prev, {
      board: JSON.parse(JSON.stringify(cases)),
      captured: { white: [...captured.white], black: [...captured.black] },
      tourBlancs, moveCount, enPassantTarget,
      openingIndex: openingManager.moveIndex,
      openingActive: openingManager.isActive,
      ...openingState
    }]);
  };
  const resetTimer = useCallback(() => {
    setTimer(dureeJeu * 60);
    setTimerVersion(prev => prev + 1);
    setPositionVersion(prev => prev + 1);
    setGameFinished(false);
    setEnPassantTarget(null);
    setGamePhase('debut');
    setMoveCount(0);
    setTourBlancs(true);
    setHistory([]);
  }, [dureeJeu]);

  const changeCouleurJoueur = useCallback((couleur) => {
    if(couleur=== 'white'&& joueurEstBlanc) return; // Si déjà blanc, ne rien faire
    if(couleur=== 'black'&& !joueurEstBlanc) return;
    setJoueurEstBlanc(couleur === 'white');
    resetTimer(); // Réinitialiser le timer à chaque changement de couleur
  }, [resetTimer,joueurEstBlanc]);
  const getTotalValue = (color) => {
    let total = 0;
    for (let y = 0; y < cases.length; y++) {
      const row = cases[y];
      for (let x = 0; x < row.length; x++) {
        const p = row[x];
        if (!p) continue;
        const pieceColor = p.couleur ?? p.color;
        if (pieceColor === color) {
          total += PIECE_VALUES[p.type] ?? 0;
        }
      }
    }
    return total;
  }
  const getScore = (winner, board = cases) => {
    // Calculer le score basé sur la somme des valeurs des pieces restantes moins la valeur des pièces adverses restantes
    const values = PIECE_VALUES;
    if (!winner) return 0;
    const playerColor = joueurEstBlanc ? 'white' : 'black';
    let score = winner === playerColor ? 10 : -10;
    try{

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece) {
          score += piece.couleur === playerColor ? values[piece.type] || 0 : -values[piece.type] || 0;
        }
      }
    }
    }
    catch(e){
      // on va pas se casser le cul pour un score
    }
    return score;
  };
  const loadPartie = () => {
    const data = loadGame('chess_savegame');
    if (data) {
      setCases(data.cases);
      setEnPassantTarget(data.enPassantTarget || null);
      setGameFinished(false);
      setPositionVersion(prev => prev + 1);
      setTimerVersion(prev => prev + 1);
      setHistory([]);
      openingManager.isActive = false;

      setTourBlancs(data.tourBlancs);
      setMoveCount(data.moveCount);
      setCaptured(data.captured);
      setEchec(false); // Réinitialiser l'état d'échec
      setMessage("Partie rechargée"); // Réinitialiser le message
      setTimer(dureeJeu * 60); // Réinitialiser le timer
      if (data.customDifficulty) {
        setDifficulte(0); // Mettre à jour la difficulté personnalisée
        Object.keys(data.customDifficulty).forEach(key => {
          DIFFICULTY_CONFIGS[0][key] = data.customDifficulty[key];
        });
      }
    } else {
      console.error("Aucune partie sauvegardée trouvée.");
    }
  }
  const savePartie = () => {
    const partieData = {
      cases,
      tourBlancs,
      moveCount,
      captured,
      enPassantTarget,
      customDifficulty: DIFFICULTY_CONFIGS[0],
    };
    saveGame(partieData, 'chess_savegame');
    setMessage("Partie sauvegardée");
  }

  const handleUndo = () => {
    if (history.length === 0) return;

    const last = history[history.length - 1];
    setCases(last.board);
    setEnPassantTarget(last.enPassantTarget);
    setGameFinished(false);
    setEchec(isKingInCheck(last.board, last.tourBlancs ? 'white' : 'black'));
    setMessage("Coup annulé");
    setPositionVersion(prev => prev + 1);
    openingManager.moveIndex = last.openingIndex;
    openingManager.isActive = last.openingActive;
    setCaptured(last.captured);
    setTourBlancs(last.tourBlancs);
    setMoveCount(last.moveCount);
    setHistory(prev => prev.slice(0, -1)); // Retirer le dernier état
  };

  function humanReadableMove(move) {
    if (!move?.from || !move?.to) return '';

    const { from, to } = move;

    const fromStr = columnToLetter(from.col ?? from.x) + rowToNumber(from.row ?? from.y , joueurEstBlanc);
    const toStr = columnToLetter(to.col ?? to.x) + rowToNumber(to.row ?? to.y , joueurEstBlanc);

    const target = cases?.[to.row ?? to.y]?.[to.col ?? to.x];

    // S’il y a une pièce capturée sur la case d’arrivée
    if (target && typeof target === 'object' && target.type) {
      const org = cases[from.row ?? from.y][from.col ?? from.x];
      const abbrevOrg = org==null?'':org.type[0].toUpperCase(); // pion → P, tour → T, cavalier → C...
      const abbrev = target.type[0].toUpperCase(); // pion → P, tour → T, cavalier → C...
      return ` ${abbrevOrg}${fromStr} x ${abbrev}${toStr}`;
    }

    return `${fromStr} - ${toStr}`;
  }
  
  const startPuzzle=puzzleID=>{
    if(puzzleID==null)
      return  setPuzzle(null);
    const pz = puzzleManager.loadPuzzle(puzzleID);
    resetTimer();
    setCaptured({ white: [], black: [] });
    setEchec(false);
    setPuzzle(pz);
    setJoueurEstBlanc(true);
  }

  const value = {
    enPassantTarget, setEnPassantTarget, gameFinished, setGameFinished, positionVersion, timerVersion,
    openingManager, logHistory, handleUndo,startPuzzle,puzzle,puzzleManager,
    echec, setEchec, captured, setCaptured, message, setMessage, timer, resetTimer,
    cases, setCases, tourBlancs, setTourBlancs, gamePhase, setGamePhase, dureeJeu, setDureeJeu
    , difficulte, setDifficulte, humanReadableMove, joueurEstBlanc,changeCouleurJoueur
    , moveCount, setMoveCount, savePartie, loadPartie, getScore, getTotalValue
  }
  return (
    <ChessContext.Provider value={value}>
      {children}
    </ChessContext.Provider>
  );
}

const columnToLetter = (col) => String.fromCharCode(97 + col); // 0 → a, 1 → b, ..., 7 → h
const rowToNumber = (row, forBlanc) => (8 - row); // 0 → 8, 7 → 1

