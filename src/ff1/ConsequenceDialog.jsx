import React, { useState, useEffect } from "react";
import { Box, Button, Card, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { usePerso } from "./PersoProvider";
import { MissionPossible } from "./Missions";
import { CombatZone } from "./Ennemis";
import { useLog } from "./LogProvider";
import imgBois from './images/fondBois.jpg';
import JetDeDes from "./JetDeDes";
import { Loot } from "./LootItems";

export const ConsequenceDialog = ({ consequence, onDone }) => {
    const [isOpen, setOpen] = useState(consequence != null);
    const { addLog } = useLog();
    useEffect(() => {
        setOpen(consequence != null);
    }, [consequence]);

    const { addMission, valideMission, conditionsOK } = usePerso();
    const takeMission = (done) => {
        if (done) {
            valideMission(consequence.mission);
            addLog(`Vous validez la mission ${consequence.mission.text}`);
        }
        else {

            addMission(consequence.mission);
            addLog(`Vous acceptez la mission ${consequence.mission.text}`);
            onDone();
        }
    }
    const validable = conditionsOK(consequence?.mission?.conditions);
    return <Dialog open={isOpen} PaperProps={{ style: { backgroundSize: 'cover', backgroundImage: `url(${imgBois})` } }}>
        <DialogTitle>Consequence</DialogTitle>
        <DialogContent sx={{ minHeight: '230px' }}>
            <Typography variant="h4">{consequence?.text}</Typography>
            {consequence?.image != null && <Box><img src={consequence.image} width="100%" />
            </Box>}

            {consequence?.jet != null && <JetDeDes jet={consequence?.jet} onDone={onDone} />}
            {consequence?.choix != null && <ChoixPossible choix={consequence?.choix} onDone={onDone} />}
            <MissionPossible mission={consequence?.mission}
                takeMission={takeMission} validable={validable} />
            {consequence?.combat != null && <CombatZone ennemis={consequence?.combat} onDone={onDone} />}
            {consequence?.boutique != null && <Boutique type={consequence?.boutique} onDone={onDone} />}
            {/* TODO */}
        </DialogContent>
        <DialogActions>
            {consequence?.combat == null && <Button variant="contained" onClick={() => { onDone(); }}>Fermer</Button>}
        </DialogActions>
    </Dialog>;
};


const ChoixPossible = ({ choix }) => {
    const { applyConsequence } = usePerso();
    //choix a text et consequence et renvoie sur une action
    const doChoix = choice => {
        applyConsequence(choice.consequence);
    }
    return <Box>
        {choix.map((c, cidx) => {
            return <Button key={cidx} variant="contained" onClick={evt => { doChoix(c) }}>{c.text}</Button>
        })}
    </Box>
}
const Boutique = ({ type }) => {
    const { addLog } = useLog();
    const {addPossession} = usePerso();
    const acheter = (itemobj) => {
        addLog("Vous achetez " + itemobj.text);
        addPossession({[itemobj.id]:1});
    }
    const BoutiqueList = {
        potion: ['soin', 'psylo']
    }
    const items = BoutiqueList[type];
    //TODO
    return <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="right">Description</TableCell>
                    <TableCell align="right">Prix</TableCell>
                    <TableCell align="right"></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {items.map((item) => {
                    const itemObj = Loot.get(item);
                    return <TableRow
                        key={item}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="th" scope="row">
                            {itemObj.image != null && <img src={itemObj.image} height={32} />}
                        </TableCell>
                        <TableCell align="right">  {itemObj.text}</TableCell>
                        <TableCell align="right">  {itemObj.valeur}</TableCell>
                        <TableCell align="right">
                            <Button onClick={() => { acheter(itemObj) }}>Acheter</Button>
                        </TableCell>
                    </TableRow>
                })}
            </TableBody>
        </Table>
    </TableContainer>
}