import React, { createContext, useContext } from "react";
import { usePerso } from "../personnages/BitLife";
import { ActiviteDialogue } from "./ActiviteDialog";

import * as materialIcons from '@mui/icons-material';
import QuickDialog from "../utils/QuickDialog";
import { AnnoncesDialog } from "./Annonces";
import { Alert, Slide, Snackbar } from "@mui/material";
const agePeriodeEnum = ['enfance', 'adolescence', 'adulescent', 'adulte', 'senior'];
const ActiviteContext = createContext();
export const useActivite = () => useContext(ActiviteContext);

export const ActiviteProvider = ({ enCasDeMort, children }) => {
    const { perso: currentPerso, addLog, nouveauJob, replaceIfoundInLieu, useLieu, savePerso } = usePerso();
    const [currentActivite, setCurrentActivite] = React.useState();
    const [currPNJ, setcurrPNJ] = React.useState();
    const [msgText, setMsgText] = React.useState();
    const [snackInfo, setSnackInfo] = React.useState();
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [annonceType, setannonceType] = React.useState();
    const lieuTravail=useLieu('travail');


    const handleExportPerso = () => {
        try {
          const persoJSON = JSON.stringify(currentPerso);
          const blob = new Blob([persoJSON], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'perso('+currentPerso.perso.etatCivil.nom+').json';
          link.click();
          URL.revokeObjectURL(url);
          setMsgText('Export effectué avec succès !', 'success');
        } catch (error) {
            setMsgText("Une erreur s'est produite lors de l'export du perso :" + error.message, 'error');
        }
      };
    
      const handleImportPerso = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            const importedData = JSON.parse(content);
            savePerso(importedData);
            setMsgText(''+importedData.perso.etatCivil.nom+' importé avec succès !', 'success');
          } catch (error) {
            setMsgText("Une erreur s'est produite lors de l'importation du personnage :" + error.message, 'error');
          }
        };
        reader.readAsText(file);
      };
    
    const checkJaugeOver = p => {
        // return null if OK
       let pb=null;
        if (p.perso.jauges.sante<0){
            pb="Il semble que vos dernieres frasques ont fini d'achever votre corps fatigué et usé. Vous etes mort";
            //p.tuEsMort('Etat general'); //TODO
        }
        if (p.perso.jauges.sante>=100){
            pb="Vous pétez la forme, attention au burn-out";
            p.perso.jauges.sante=90;
            p.applyConsequences({karma:5,bonheur:1,violent:1});
        }
        if (p.perso.jauges.social<0){
            pb="Il semble vous n'ayez plus aucune vie sociale et que les gens vous fuient. Votre mère vous passe un savon et vous emmene au Bingo du 3eme age pour reprendre un semblant de vie sociale.";
            p.perso.jauges.social=10;
            p.applyConsequences({karma:-5,bonheur:-1,violent:-1,pervers:-1});
        }
        if (p.perso.jauges.social>=100){
            pb="Votre charisme est tel que vous gagnez des amis sans le vouloir";
            p.perso.jauges.social=90;
            p.applyConsequences({ami:1,bonheur:2,karma:3});
        }
        if (p.perso.jauges.bonheur<=0){
            pb="Votre bonheur est tombé a zéro, vous etes desespéré, en depression nerveuse. Prenez ces pilules ca ira mieux";
            p.perso.jauges.bonheur=10;
            p.applyConsequences({karma:-5,social:-1,violent:-3,pervers:-5, maladie:{depression:1}});
        }
        if (p.perso.jauges.bonheur>=100){
            pb="Votre bonheur est au maximum.. On va se calmer, comme disait Mickey: Trop de bonheur tue le bonheur";
            p.perso.jauges.bonheur=90;
            p.applyConsequences({karma:2,social:1});
        }
        if (p.perso.jauges.karma<=0){
            pb="Votre karma est tombé a zéro, vous faites trop le mal autour de vous, le Destin vous fais un gros retour de Karma, un hacker a detourné votre dernier salaire";
            p.perso.jauges.karma=10;
            p.applyConsequences({bonheur:-5,social:-1,violent:3,argent:-2000});
        }
        if (p.perso.jauges.karma>=100){
            const gain = Math.round(Math.random()*1000);
            pb="Votre karma est au maximum.. Vous faites tant de bien autour de vous que le Destin vous renvoie la balle, vous gagnez "+gain+" euros au Loto";
            p.perso.jauges.karma=90;
            p.applyConsequences({argent:gain,social:1,bonheur:1,violent:-1});
        }

        if (p.perso.caractere.pervers<=0){
            pb="Votre niveau de chasteté atteint des records , faites un efforts y a des tas de trucs a decouvrir dans ce jeu si on est un peu pervers.";
            p.perso.caractere.pervers=10;
            p.applyConsequences({karma:-10,bonheur:-10,violent:-10});
        }
        if (p.perso.caractere.pervers>=100){
            pb="Vous commencez a passer pour un gros pervers aupres de vos proches, il est temps de faire profil bas. Prochaines vacances dans un monastere pour prier toute la journee";
            p.perso.caractere.pervers=90;
            p.applyConsequences({social:-3, bonheur:1,karma:1,argent:-200});
        }
        if (p.perso.caractere.violent<=0){
            pb="Votre non-violence est reconnue de par le monde, on vous surnomme le Mahatmah... Ca, c'est dans vos reves, dans la realite une petite fille vient de vous casser la gueule parce que vous ne lui avez pas dit pardon en lui coupant la route. La honte";
            p.perso.caractere.violent=10;
            p.applyConsequences({karma:5,bonheur:-4,social:6});
        }
        if (p.perso.caractere.violent>=100){
            pb="Votre niveau de violence atteint des records, ca vous attire des problemes et vous vous faites souvent casser la gueule. Calmez-vous un peu";
            p.perso.caractere.violent=90;
            p.applyConsequences({ami:-1,bonheur:-2,karma:-3, social:-4,sante:-5});
        }
        if (p.perso.caractere.intelligent<=0){
            pb="Vous etes trop con, quelqu'un le remarque et vous finissez vos jours dans un asile pour attardés jusqu'a votre mort...";
           // p.tuEsMort('Trop con'); //TODO
        }
        return pb;
    }

    const value = {
        openActivite: (activite, pnj) => {
            setCurrentActivite({ ...activite });
            setcurrPNJ(pnj);
        }
        , handleExportPerso, handleImportPerso
        , openMessage: msg => {
            setMsgText(msg);
        }
        , openAnnonces: type => {
            setannonceType(type);
        }
        , consequence: (conseq, pnj) => {
          if(conseq.mort!=null){
            // game over
           
            enCasDeMort("Vous etes mort a "+currentPerso.perso.etatCivil.age+"ans. Cause de la mort:"+conseq.mort);
            return;
          }
            //objet de la forme {social:1,karma:-2,bonheur:2,ami:+1/-1 (ajouter/enlever pnj des amis) , maladie:{maladieName:risque}}
            const [toLog,toAlert] = currentPerso.applyConsequences(conseq, pnj);
            // si des amis ont ete fait, les remplacer sur leur lieu de vie
            const jaugeChecks = checkJaugeOver(currentPerso);
            if (jaugeChecks != null) {
                if(jaugeChecks.indexOf('mort')>0)
                {
                    enCasDeMort("Vous etes mort a "+currentPerso.perso.etatCivil.age+"ans. Cause de la mort:"+jaugeChecks);
                   
                    return;
                }
                setSnackInfo(jaugeChecks+' \n '+toLog);
                setSnackOpen(true);
            }
            else if (toLog != null&&toLog!=='')
            {
                setSnackInfo(toLog);
                setSnackOpen(true);
            }
            if(toAlert != null&&toAlert!=='')
            {
                setMsgText(toAlert);
                addLog(toAlert);
            }
            if(conseq.mariage!=null){
                for (let a = 0; a < currentPerso.perso.famille.length; a++)
                replaceIfoundInLieu(currentPerso.perso.famille[a], currentPerso.perso.famille[a]);
            }
            for (let a = 0; a < currentPerso.perso.amis.length; a++)
                replaceIfoundInLieu(currentPerso.perso.amis[a], currentPerso.perso.amis[a]);
            // si le metier a change, refaire le lieu         
            if (currentPerso.perso.metier.branche !== lieuTravail?.metier?.branche) {
                //cas anpe en principe, on supprime le lieu pour le remplacer par ANPE
                nouveauJob(currentPerso.perso.metier);
            }
            savePerso(currentPerso);
        }
        , getIcon: icon => {
            if (icon == null)
                return null;
            const Icon = materialIcons[icon];
            if (Icon != null)
                return <Icon />;
            return null;
        }
        , conditionNonRemplies: (cond, onPnj) => {
            // return explications pourquoi ca va pas et null si ca va
            let caVaPas = null;
            if (cond == null)
                return null;
            const conditions = Object.keys(cond);

            for (let condition of conditions) {

                if (condition === 'sex') {

                    if (currentPerso.perso.etatCivil.sex !== cond[condition]) {
                        caVaPas = 'Pas le bon sexe. ';
                    }
                }
                if (condition === 'metier') {
                    if (currentPerso.perso.etatCivil.metier !== cond[condition]) {
                        caVaPas = 'Pas le bon metier. ';
                    }
                }
                if (condition === 'enceinte') {
                    if (currentPerso.perso.enceinte !== cond[condition]) {
                        caVaPas = 'Pas enceinte. ';
                    }
                }
                if (condition === 'argent') {
                    if (currentPerso.perso.argent<cond[condition]) {
                        caVaPas = "Pas assez d'argent.";
                    }
                }
                if (condition === 'epoux') {
                    if (currentPerso.hasEpouse() && !cond[condition]) {
                        caVaPas = 'marie il faudrait pas. ';
                    }
                    if (currentPerso.hasEpouse()==null && cond[condition]) {
                        caVaPas = 'pas marié, il faudrait. ';
                    }
                }
                if (condition === 'famille') {
                    const laRelation = currentPerso.getRelation(cond[condition]);
                    if(laRelation!=null && onPnj!=null && laRelation.lienDeParente!==onPnj.lienDeParente){
                        caVaPas = 'Pas la bonne relation. ';
                    }
                    else  if(laRelation ==null) {
                        caVaPas = 'Pas de '+cond[condition];
                    }
                }
                const agePeriode = currentPerso.getAgePeriode();
                if (agePeriodeEnum.indexOf(condition) >= 0) {
                    // limite a certains ages
                    if (!cond[agePeriode])
                        caVaPas = 'Pas le bon age';
                }

            }

            return caVaPas;
        }
    }
    return <ActiviteContext.Provider value={value}>
        {children}
        <ActiviteDialogue activite={currentActivite} aboutPNJ={currPNJ} />
        <QuickDialog text={msgText} titre="Message a caractère informatif" />
        <AnnoncesDialog type={annonceType} nouveauJob={nouveauJob}/>
        <Snackbar open={snackOpen} autoHideDuration={4000} onClose={()=>{setSnackOpen(false)}}
         TransitionComponent={Slide} direction="right">
  <Alert severity="info" sx={{ width: '100%' }}>
   {snackInfo}
  </Alert>
</Snackbar>
    </ActiviteContext.Provider>;
}