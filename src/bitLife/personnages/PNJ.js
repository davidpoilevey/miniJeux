
import { BaseDeventPersonnages ,insulteGratuite} from "../events/BaseEventsPersonnages";

import { planCul} from "../events/BaseCommonEvents";
import { generateRandomFirstName, generateRandomName, getIcon } from "../utils/persoUtils";

export const AVATAR_MAX=20;
// Classe de base PNJ
export class PNJ {
  constructor({ nom, ...perso }) {
    if (perso.etatCivil == null)
      perso.etatCivil = { sex: (Math.random() > 0.5 ? 'M' : 'F'), age: 20 }
    if (nom == null || nom == '')
      nom = generateRandomFirstName(perso.etatCivil?.sex) + ' ' + generateRandomName();
    this.nom = nom;
    perso.etatCivil.nom=nom;
    this.avatarName = 'avatar' + Math.floor(Math.random() * AVATAR_MAX) + '.png';
    Object.assign(this, perso);
    this.addCaractere();
  }

  // Méthode commune à tous les PNJ
  getActivites() {
    return BaseDeventPersonnages['pnj'];
  }
  addCaractere() {
    if (this.caractere == null) {
      this.caractere = {
        pervers: Math.round(Math.random() * 100),
        violent: Math.round(Math.random() * 100),
        intelligent: Math.round(Math.random() * 100),
      }
    }
  }
  getIcon() {
    return getIcon(this);
  }
  // Méthode commune à tous les PNJ
  sePresenter() {
    console.log(`Je m'appelle ${this.nom}.`);
  }
}

// Classe Ami héritant de PNJ
export class NPlusUn extends PNJ {
  constructor(conf) {
    super(conf);
    this.titre = 'Boss';
  }

  // Méthode spécifique à la classe Ami
  getActivites() {
    return BaseDeventPersonnages['boss'];
  }
}


export class Ami extends PNJ {
  constructor({ activitePreferee, ...perso }) {
    super(perso);
    this.titre = 'Ami';
    this.activitePreferee = activitePreferee;
  }

  getActivites() {
    return BaseDeventPersonnages['ami'];
  }
}
export class PetitAmi extends Ami {
  constructor({ activitePreferee, ...perso }) {
    super(perso);
    this.titre =  perso.etatCivil.sex==="M"?"Petit copain":"Petite copine";
    this.activitePreferee = activitePreferee;
  }

  getActivites() {
    return BaseDeventPersonnages['petitAmi'];
  }
}
export class ExCopine extends Ami {
  constructor({  ...perso }) {
    super(perso);
    this.titre =  perso.etatCivil.sex==="M"?"Ex copain":"Ex copine";
  }

  getActivites() {
    return [{...insulteGratuite}, {...planCul}];
  }
}




// Classe Famille héritant de PNJ
export class Famille extends PNJ {
  constructor({ lienDeParente, ...perso }) {
    super(perso);
    this.titre = lienDeParente;
    this.lienDeParente = lienDeParente;
  }
  getActivites() {
    return BaseDeventPersonnages['famille'];
  }
  // Méthode spécifique à la classe Famille
  soutenir() {
    console.log(`${this.nom} est un membre de la famille qui offre son soutien.`);
  }
}

export class Epoux extends Famille {
  constructor(perso ) {
    super({lienDeParente:'epoux', ...perso});
    this.epoux=true;
    this.titre = perso.etatCivil.sex==="M"?"Mari":"Femme";
  }

  getActivites() {
    return BaseDeventPersonnages['petitAmi'];
  }
}
export class Predefined extends PNJ {
  constructor(type) {
    const typeConfig = TypePredefini(type);
    super(typeConfig);
    this.type = type;
  }

  // Méthode spécifique à la classe Predefined (pute, guedro, flic, routier)
  getActivites() {
    return BaseDeventPersonnages[this.type];
  }
}

const TypePredefini = type => {
  const persoData = {};
  const prenomFem=generateRandomFirstName('F');
  const prenomMasc=generateRandomFirstName('M');
  const prenomMasc2=generateRandomFirstName('M');
  switch (type) {
    case 'pute':
      Object.assign(persoData, { avatarName: 'pute.png', etatCivil: { sex: 'F', age: 26 }, nom: prenomFem+' la pute' });
      break;
    case 'guedro':
      Object.assign(persoData, { avatarName: 'guedro.png', etatCivil: { sex: 'M', age: 21 }, nom: 'Bobby le déchet' });
       break;
    case 'flic':
      Object.assign(persoData, { avatarName: 'flic.png', etatCivil: { sex: 'M', age: 41 }, nom: prenomMasc+' le keuf' });
   
      break;
    case 'routier':
      Object.assign(persoData, { avatarName: 'routier.png', etatCivil: { sex: 'M', age: 55 }, nom: prenomMasc2+' le routier' });
   
      break;
      case 'docteur':
        Object.assign(persoData, { avatarName: 'medecin.png', etatCivil: { sex: 'M', age: 35 }, nom: 'Dr. Denier' });
     
        break;
    default:
      persoData.avatarName = 'avatar1.png';
  }

  return persoData;
}