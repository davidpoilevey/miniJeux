import React, { useState } from "react";

import { createRandomPeople } from "../utils/persoUtils";
import { NPlusUn, Predefined } from "../personnages/PNJ";
import { Elderly, Gite, Home, HomeWork, OutdoorGrillSharp, School, Work } from "@mui/icons-material";
import { BaseDeventLieux, BaseDeventTravail } from "../events/BaseEventsLieux";
const IconLieu = {
    maison: Home,
    exterieur: OutdoorGrillSharp,
    ecole: School,
    lycee: HomeWork,
    fac: HomeWork,
    travail: Work,
    ephad: Elderly
}
const LieuColor = {
    maison: '#fCbd88',
    exterieur: '#58df7d',
    ecole: '#88bdfc',
    lycee: '#A8bdfc',
    fac: '#F8bdfc',
    travail: '#F87d6c',
    ephad: '#bebede'
}

export class Lieu {
    constructor({ type, titre, personnes = [], ageLimited }) {

        this.type = type;
        this.titre = titre ?? type?.toUpperCase();
        this.personnes = personnes;
        this.activites = BaseDeventLieux[type];
        this.Icon = IconLieu[type];
        this.color = LieuColor[type];
        this.ageLimited = ageLimited;
    }

    // Méthode spécifique à la classe Ami
    addPersonne(p) {
        this.personnes.push(p);
    }
    getActivites() {
        return this.activites;
    }
    getPeople() {
        return this.personnes;
    }

}

export class LieuDeTravail extends Lieu {
    constructor({ metier, ...conf }) {
        super(conf);
        this.metier = metier;
        this.ageLimited=['adulte','adulescent','senior'];
      }
      getActivites() {
          const filteredByCondition = BaseDeventTravail.filter(t=>{
            if(t.condition?.notAnpe&&this.metier.branche==='anpe')
                    return false;
            return true;
          });
          return filteredByCondition.concat(this.metier.activites);
      }
}

export const createLieu = (type) => {
    let persToAdd = [];
    let ageLimited = null;
    let nbRandomToAdd = 0;
    switch (type) {
        case 'maison':
            // rien a faire, la famille est ajoutee
            break;
        case 'exterieur': // une serie de perso cliché
             nbRandomToAdd = 3;// les passants
             ageLimited = ['enfance','adolescence','adulescent','adulte','senior'];
            persToAdd.push(new Predefined('pute'));
            persToAdd.push(new Predefined('guedro'));
            persToAdd.push(new Predefined('flic'));
            persToAdd.push(new Predefined('routier'));
            persToAdd.push(new Predefined('docteur'));
            break;
        case 'ecole':
            ageLimited = ['enfance'];
            nbRandomToAdd = 6;
            break;
        case 'lycee':
            ageLimited = ['adolescence'];
            nbRandomToAdd = 8;
            break;
        case 'fac':
            ageLimited = ['adulescent'];
            nbRandomToAdd = 12;
            break;
        case 'ephad': // 8 pers
            ageLimited = ['senior'];
            nbRandomToAdd = 8;
            break;
        default:
        // lieux inconnus, personnes a priori
    }

    persToAdd=persToAdd.concat(createRandomPeople(nbRandomToAdd, ageLimited));
    
    const lieu = new Lieu({ type, personnes: persToAdd, ageLimited: ageLimited });
    return lieu;
};