import React, { useEffect, useRef } from "react";
import { usePerso } from "../personnages/BitLife";
import QuickDialog from "../utils/QuickDialog";
import ButtonDPY from "../ui/ButtonDPY";
import { useActivite } from "./ActiviteProvider";
import { PNJ, Predefined } from "../personnages/PNJ";
import { translate } from "../utils/persoUtils";
/**
 * Activite= {
 *  nom
 *  text
 *  options ([{
 *          
          consequences ([])
          consequenceText
          options ([...options])
 *      }])
 * }
 * */
export const ActiviteDialogue = ({ activite, aboutPNJ }) => {

    const [eventText, seteventText] = React.useState();
    const thisPNJ = React.useRef(aboutPNJ);
    useEffect(() => {
        thisPNJ.current = aboutPNJ;
    }, [aboutPNJ])

    const currentActivite = useRef(activite);
    const [eventOptions, seteventOptions] = React.useState([]);
    const [eventImage, seteventImage] = React.useState();

    const { addLog, perso, useLieu } = usePerso();
    const activiteContext = useActivite();
    const agp = perso.getAgePeriode();

    let taffPlace = '';
    switch (agp) {
        case 'enfance':
            taffPlace = 'ecole'; break;
        case 'adolescence':
            taffPlace = 'lycee'; break;
        case 'adulescent':
            taffPlace = 'fac'; break;
        case 'adulte':
            taffPlace = 'travail'; break;
        case 'senior':
            taffPlace = 'ephad'; break;
        default: taffPlace = 'exterieur';
    }
    const lieuDeTaff = useLieu(taffPlace);

    const disabledBecause = activiteContext.conditionNonRemplies(activite?.condition);

    const checkRandomAction = (opt) => {
        if (opt.randomAction != null && Math.random() < opt.randomAction.risque) {
            if( opt.randomAction.condition!=null && activiteContext.conditionNonRemplies(opt.randomAction.condition))
                return false;
            let actionText = opt.randomAction.text;
            if (opt.randomAction.involvedPnj != null) {
                // connu dans la famille/amis ?
                let pnj = perso.getRelation(opt.randomAction.involvedPnj);
                if (pnj == null && opt.randomAction.involvedPnj === 'collegue' && lieuDeTaff != null) {

                    if (lieuDeTaff.personnes.length == 0)
                        pnj = new PNJ({ nom: 'John Doe' });
                    else
                        pnj = lieuDeTaff.personnes[(Math.floor(Math.random() * lieuDeTaff.personnes.length))];
                }
                else if (pnj == null && opt.randomAction.involvedPnj === 'pute') {
                    pnj = new Predefined('pute');
                }
                thisPNJ.current = pnj;
                actionText = translate(opt.randomAction.text, pnj);
            }
            else if (thisPNJ.current != null)
                actionText = translate(opt.randomAction.text, thisPNJ.current);
            seteventText(actionText);
            seteventOptions(opt.randomAction.options || []);
            seteventImage(opt.randomAction.consequenceImage);
            return true;
        }
        else
            return false;
    }
    useEffect(() => {
        if (activite) {
            if (!checkRandomAction(activite)) {

                seteventText(translate(activite.text, thisPNJ.current));
                seteventOptions(activite.options || []);
                seteventImage(activite.consequenceImage);
            }
            currentActivite.current = activite;
        }
        else {
            seteventText(null);
            seteventOptions([]);
            seteventImage(null);
        }
    }, [activite]);
    const optionChoisie = opt => {
        if (opt.chance != null) {
            // option a risque, ->consequenceTextNOK, consequencesNOK
            if (perso.tenteChance(opt.chance, opt.chanceOn, thisPNJ.current)) { // plus le chance est proche de 1 plus il a de chance de se produire
                seteventText(translate(opt.consequenceTextOK, thisPNJ.current));
                activiteContext.consequence(opt.consequencesOK, thisPNJ.current);
            }
            else {
                seteventText(translate(opt.consequenceTextNOK, thisPNJ.current));
                activiteContext.consequence(opt.consequencesNOK, thisPNJ.current);
            }
            currentActivite.current.done = true;
        }
        else {
            if (checkRandomAction(opt))
                return;
            if (opt.consequences != null) {
                // cas special annonce
                if (opt.consequences.annonce != null) {
                    activiteContext.openAnnonces(opt.consequences.annonce);
                }
                else {

                    activiteContext.consequence(opt.consequences, thisPNJ.current);
                    currentActivite.current.done = true;

                }
            }

            seteventText(opt.consequenceText != null ? translate(opt.consequenceText, thisPNJ.current) : null);
        }

        seteventImage(opt.consequenceImage)
        seteventOptions(opt.options ?? []);
    };
    const onOKButton = eventOptions.length === 0 ? {
        onOK: () => {
            if (currentActivite.current.done)
                seteventText(null);// ferme le dialog
            else
                optionChoisie(activite);
        }
    } : null;
    return <QuickDialog titre={activite?.nom ?? 'not set'} text={eventText} {...onOKButton}>
        <>
            {eventImage != null && <EventImage src={eventImage} />}
            {eventOptions.map((opt, idx) => {
                let localReason = null;
                if(opt.condition!=null)
                 localReason=activiteContext.conditionNonRemplies(opt?.condition, thisPNJ);
                return disabledBecause == null && <ButtonDPY key={idx} disabledBecause={localReason} onClick={evt => { optionChoisie(opt); }}>{opt.text}</ButtonDPY>;
            })}
        </>

    </QuickDialog>;
};
const EventImage = ({ src }) => {

    return <img src={src} height={300} style={{ boxShadow: '2px 1px 7px', border: '2px groove red', alignSelf: 'center' }} alt="surprise" />

}