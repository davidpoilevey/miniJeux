import { Box, Button, MenuItem, Slider, TextField, Typography } from "@mui/material"
import { useSprout } from "./SproutContext"
import { randomGenome } from "../genetic/ADNPlante";
import { useMemo, useState } from "react";
import { SproutCellule } from "./Organism";

const createOrganisme = (id, adn,gridSize) => {
    return {
        id: id
        , cellules: [{
            type: 'sprout', position: {
                top: gridSize* Math.floor(Math.random() * 600/gridSize),
                left:gridSize* Math.floor(Math.random() * 600/gridSize),
            }
        }]
        , adn: adn
        , nrj: 60
    }
}

export const SproutConfigPanel = ({ width }) => {
    const { setOrganismes, reset, gridSize, setGridSize, setcoutDeLaVie ,coutDeLaVie } = useSprout();
    const [nbSprout, setNbSprout] = useState(1);
    const pleinDeSprouts = (evt) => {
        reset();
        const sprouts = [];
        for (let q = 0; q < nbSprout; q++) {
            const newAdn = randomGenome();
            sprouts.push(createOrganisme('sprout' + q, newAdn,gridSize))
        }
        setOrganismes(sprouts);
    }
const conds=[{label:"Bonnes", value:1},{label:"Difficiles", value:2},{label:"Extremes", value:3}]

    return <Box sx={{
        height: '100%', width: width, backgroundColor: '#e2f1f5'
        , display: 'flex', flexDirection: 'column', gap: 1, paddingTop: 2
    }}>


        <Button variant="contained" onClick={pleinDeSprouts}>Ajoute</Button>
        <TextField label="Nombre a ajouter" value={nbSprout}
            select
            onChange={evt => { setNbSprout(evt.target.value) }}>
            {Array.from({ length: 20 }).map((option, i) => (
                i === 0 ? null : <MenuItem key={i} value={i}>
                    {i} bestiole{i > 1 ? 's' : ''}
                </MenuItem>
            ))}
        </TextField>
        <TextField label="Taille des cellules" value={gridSize}
            select
            onChange={evt => { setGridSize(evt.target.value) }}>
            {Array.from({ length: 50 }).map((option, i) => (
                i>0&&i%5 === 0 ?<MenuItem key={i} value={i}>
                    {i} pixels
                </MenuItem>:null
            ))}
        </TextField>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography>Conditions de vie</Typography>
        {conds.map((cond,cidx)=>{
            return <Button key={cidx} variant={cond.value==coutDeLaVie?'contained':'outlined'} 
             onClick={evt=>{
                setcoutDeLaVie(cond.value);
             }}>{cond.label}</Button>
        })}
           
        </Box>

        <Button variant="outlined" onClick={reset}>Reset</Button>
        <Box sx={{ display: 'flex', flexDirection: 'column', overflow:'auto' }}>
            <Typography variant="h6">Explications</Typography>
            {explications.map(exp => {
                return <Expls key={exp.type} type={exp.type}
                     text={exp.text} name={exp.name} width={width}/>
            })}
              <Typography variant="body2" color="secondary">Touche T pour afficher le niveau de matiere organique(rouge) 
                et de pourriture (bleu).. A utiliser avec moderation pour cause de performances graphiques moisies du React</Typography>
        </Box>
    </Box>
}
const explications = [
     { name: "La Tete", type: 'sprout', text: "la seule a se deplacer. A chaque tour choisit de se deplacer dans une direction si assez d'energie, et laisse a sa place un BOIS d'ou peuvent pousser d'autres cellules" }
 ,   { name: "La Feuille", type: 'feuille', text: "Source inepuisable d'energie a condition d'avoir de l'espace libre autour d'elle (sinon on considere qu'elle est dans l'ombre). Produit beaucoup de matiere organiques" }
    , {name:"Le Bois", type:'bois',text:'prend la place de la tete et relie toutes les cellules. Un bois non relié a une cellule meurt. Toute cellule isolée de sa tete et non reliée par un bois, meurt. Tout ce qui meurt POURRI'}
    , {name:"La Racine", type:'racine', text:"Consomme la matiere organique produite par les feuilles. Meurt s'il n'y a plus rien a consommer"}
    , {name:'Mycelium', type:'mycelium', text:"Consomme la pourriture, meurt s'il n'y a plus rien a consommer"}
    , {name:"La Graine", type:'graine',text:"Dormante, ne consomme pas d'energie, prend vie quand separée de son organisme ou quand son organisme meurt. Chaque graine contient l'ADN de son parent avec 25% de chance de mutation"}
]
const Expls = ({ type, name, text,width }) => {
    return <Box>

        <Box sx={{ display: 'flex', position: 'relative' }}>
            <SproutCellule type={type} position={{ top: 0, left: width-50 }} size={30} nrj={12}
                branches={['haut', 'bas', 'gauche', 'droite']} />
        </Box>
        <Typography variant="h6">
            {name}
        </Typography>

        <Typography variant="caption" > {text}  </Typography>
    </Box>
}