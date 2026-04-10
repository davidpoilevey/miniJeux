import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { fuckMinimax, joueCoup, minimax, obtenirCoupsPossibles } from "./miniMaxAlgo";
import { useIsMobile } from "../hookGame";

const ligneHeight = 4;
const PERSONNE = 0;
const JOUEUR = 1;
const IA = 2;

export const Moulin = ({ jeu }) => {
const isMobile = useIsMobile();
  const [currJoueur, setCurrJoueur] = useState(JOUEUR);
  const [caseSize, setCaseSize] = useState(isMobile?20:50);
  const [scoreIA, setScoreIA] = useState(0);
  const [scoreJoueur, setScoreJoueur] = useState(0);
  const setScore=(j,score)=>{
    if(j===JOUEUR)
      setScoreJoueur(s=>(s+score))
    if(j===IA)
      setScoreIA(s=>(s+score))
  }
  useEffect(()=>{
    setScoreJoueur(0);
    setScoreIA(0);
  },[caseSize])

  return <Box sx={{width:'100%',height:'100%'}}>
    <Box sx={{display:'flex', justifyContent:'space-around'}}>
    <Typography variant="h6" sx={{color:getColor(JOUEUR)}}>Votre Score: {scoreJoueur}</Typography>
<Autocomplete options={[10,20,50,80,100,120,150,200]}
 onChange={(event, newValue) => {
  setCaseSize(newValue);
}}
value={caseSize}
 renderInput={(params) => <TextField {...params} label="Taille des cases" 
 value={caseSize} sx={{width:200}} onChange={evt=>{setCaseSize(evt.target.value)}} />}/>
    
    <Typography variant="h6" sx={{color:getColor(IA)}}>Score adversaire: {scoreIA}</Typography>
    </Box>
    <GrillePapier setScore={setScore} caseSize={caseSize}
    currJoueur={currJoueur} setCurrJoueur={setCurrJoueur} />
  </Box>
}
export const GrillePapier = ({caseSize, currJoueur, setCurrJoueur,setScore }) => {

  const boxRef = useRef();
  const [caseOwner, setCaseOwner] = useState([]);
  const [nbRow, setNbRow] = useState(1);
  const [nbCol, setNbCol] = useState(1);
  const [msg, setMessage] = useState();
  

  useEffect(() => {
    // init
    const handleResize = () => {
      if (boxRef.current) {

        const nbCols = Math.round((boxRef.current.offsetWidth-caseSize*2) / (caseSize));
        const nbRows = Math.round((boxRef.current.offsetHeight-50-caseSize) / (caseSize));
        const cases = Array.from({ length: nbRows }, () =>
          Array.from({ length: nbCols }, () => PERSONNE)
        );
        setNbCol(nbCols);
        setNbRow(nbRows);
        setCaseOwner(cases);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [caseSize]);


  const updateCase = (row, cell, orientation) => {
    if(currJoueur!==JOUEUR)
      return setMessage('Pas ton tour');
    const newPlateau = JSON.parse(JSON.stringify(caseOwner));
    const {caseFermees, plateau} = joueCoup({plateau:newPlateau, joueur:currJoueur, row, cell, orientation})
    if (caseFermees > 0)
      setScore(currJoueur, caseFermees);
    else
      setCurrJoueur(currJoueur === JOUEUR ? IA : JOUEUR);
    setCaseOwner(newPlateau);
  }


  useEffect(() => {
    // joue pour l'ordi
    if(currJoueur===IA){
      const newPlateau = JSON.parse(JSON.stringify(caseOwner));
      let finalScore=0;
      const bestCoup = fuckMinimax(newPlateau,5,true);
      let {caseFermees, plateau} = joueCoup({plateau:caseOwner, joueur:currJoueur
        , row:bestCoup.row, cell:bestCoup.col, orientation:bestCoup.orientation});

      while(caseFermees > 0)
        {
          finalScore+=caseFermees;
          const bestCoup2 = fuckMinimax(plateau,5);
          const result  = joueCoup({plateau, joueur:currJoueur
            , row:bestCoup2.row, cell:bestCoup2.col, orientation:bestCoup2.orientation});
            caseFermees=result.caseFermees;
            plateau=result.plateau;
            if(obtenirCoupsPossibles(plateau).length===0){
              // FIN DU JEU TODO
              break;
            }
        }
        if(finalScore>0)
          setScore(IA, finalScore);
        setCurrJoueur(JOUEUR);
      
      setCaseOwner(plateau);
    }
  }, [currJoueur])
  const grid = useMemo(() => {
    const boxes = [];
    if(nbRow<4)
      return boxes;
    for (let row = 0; row < nbRow; row++) {
      const rowA = [];
      for (let cell = 0; cell < nbCol; cell++) {
        // si row pair et cell impair : ligne horiz
        if (row % 2 === 0 && cell % 2 !== 0)
          rowA.push(<HorizLine owner={caseOwner[row][cell]} caseSize={caseSize} 
              onClick={evt => { updateCase(row, cell, 'horiz') }} />);
        // si row impair et cell pair : ligne verti
        else if (row % 2 !== 0 && cell % 2 === 0)
          rowA.push(<VertiLine owner={caseOwner[row][cell]} caseSize={caseSize} 
            onClick={evt => { updateCase(row, cell, 'verti') }} />);
        // si row impair et cell impair : centre de cellule
        else
          rowA.push(<NormalBox centrale={row % 2 !== 0 && cell % 2 !== 0} caseSize={caseSize} 
            owner={caseOwner[row][cell]}/>);


      }


      boxes.push(rowA);
    }

    return boxes
  }, [nbRow, nbCol, caseOwner, currJoueur])
  return <Box ref={boxRef}
    sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
    {grid.map((row, rowIndex) => (
      <Box key={rowIndex} sx={{ display: 'flex',  alignItems: 'stretch' }}>
        {row.map((cell, colIndex) => (
          <Box
            key={colIndex}
          >
            {cell}
          </Box>
        ))}
      </Box>
    ))}
  </Box>
}


const getColor = (owner) => {
  if (owner === JOUEUR)
    return '#22f';
  else if (owner === IA)
    return '#f22';
  else
    return '#bbb';
};
const HorizLine = ({ owner, onClick,caseSize }) => {
  return <Box onClick={onClick} sx={{ cursor: 'pointer', height: caseSize, width: caseSize, position: 'relative' }}>
    <Box
      sx={{
        height: ligneHeight, width: caseSize * 2, backgroundColor: getColor(owner), zIndex: owner === PERSONNE ? 1 : 2
        , position: 'absolute', left: -caseSize / 2, top: caseSize / 2
      }} />
  </Box>
}

const VertiLine = ({ owner, onClick,caseSize }) => {
  return <Box onClick={onClick}
    sx={{ cursor: 'pointer', height: caseSize, width: caseSize, position: 'relative' }}>
    <Box
      sx={{
        width: ligneHeight, height: caseSize * 2, backgroundColor: getColor(owner), zIndex: owner === PERSONNE ? 1 : 2
        , position: 'absolute', top: -caseSize / 2, left: caseSize / 2
      }} />
  </Box>
}

const NormalBox = ({centrale, owner,caseSize }) => {
  return <Box sx={{ height: caseSize, width: caseSize, borderRadius:'50%'
    , backgroundColor: owner===PERSONNE?'transparent':getColor(owner) }}>
      
    </Box>
}

export default Moulin;