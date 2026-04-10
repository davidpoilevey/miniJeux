import { Jobs } from "../activites/Jobs";
import { generateAge, generateRandomFirstName, getIcon } from "../utils/persoUtils";
import { AVATAR_MAX, Ami, Epoux, ExCopine, Famille, PNJ, PetitAmi } from "./PNJ";

export const jaugesEnum = ['sante', 'bonheur', 'social', 'karma'];
export const caractereEnum = ['pervers', 'violent', 'intelligent'];
const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
}
const defPerso = {
    etatCivil: {
        nom: 'David Poilevey', sex: 'M', age: 0

    }
    , avatarName: 'joueur.png'
    , titre: 'Piawala'
    , jauges: {
        sante: 100,
        bonheur: 50,
        karma: 50,
        social: 50,
    }
    , caractere: {
        pervers: 52,
        violent: 22,
        intelligent: 60
    }
    , maladies: []
    , competences: [
        {
            permis: []
            , combat: 0
        }
    ]
    , amis: []
    , famille: []
    , connaissances: {}
    , metier: Jobs.anpe
    , diplomes: []
    , possessions: [{ nom: 'voiture', valeur: 50000 ,image:"https://www.breizh-comics.fr/images/Image/x-hot908080.jpg"}
    ,{ nom: 'Rolex', valeur: 5000 }]
    , argent: 10
}
export const Personnage = function (config) {
    this.perso = Object.assign({...defPerso}, config ?? {});
    this.avatarName = 'avatar' + Math.floor(Math.random() * AVATAR_MAX) + '.png';

    this.prendDeLage = function () {
        this.perso.etatCivil.age++;
        this.perso.jauges.sante--;
        this.perso.jauges.bonheur--;
        if (this.perso.etatCivil.age === 6)
            this.perso.titre = 'Ecolier';
        if (this.perso.etatCivil.age === 12)
            this.perso.titre = 'Collegien';
        if (this.perso.etatCivil.age === 15)
            this.perso.titre = 'Lyceen';
        if (this.perso.etatCivil.age === 18)
            this.perso.titre = 'Etudiant';
        if (this.perso.etatCivil.age === 20 && this.perso.metier == null)
            this.perso.titre = 'Chomeur';
        this.degradationPossession();// reduit amitie, finances
    };
    this.tenteChance = (chance, chanceOn, onPnj) => {
        let curseur = chance;
        if (chanceOn != null) {
            // chanceOn can be karma, social, sante, intelligent, violent, pervers, empathie
            if (chanceOn === 'empathie' && onPnj != null) {
                //on compare les caracteres, la diff doit etre inferieur a karma+social+relation
                let diff = 0;
                for (let c = 0; c < caractereEnum.length; c++) {
                    diff += Math.abs(this.perso.caractere[caractereEnum[c]] - onPnj.caractere[caractereEnum[c]]);
                }
                if (this.perso.connaissances[onPnj?.nom] != null)
                    diff -= this.perso.connaissances[onPnj?.nom];//bonus de connaissances
                const ret = diff < (this.perso.jauges.social + this.perso.jauges.karma);//  on va laisser le karma aider un peu

                return ret;
            }

            if (jaugesEnum.indexOf(chanceOn) >= 0) {
                curseur = clamp(this.perso.jauges[chanceOn], 10, 90) / 100;
            }
            if (caractereEnum.indexOf(chanceOn) >= 0) {
                curseur = clamp(this.perso.caractere[chanceOn], 10, 90) / 100;
            }
            // bonus de relation 
            if (this.perso.connaissances[onPnj?.nom] != null)
                curseur += ((this.perso.connaissances[onPnj.nom] - 50) / 100);// bonus ou malus si on s'eloigne du status 50
            curseur += (this.perso.jauges.karma / 200); // un super karma offre un bonus de 0.5

        }
        return (Math.random() < curseur);
    }
    this.getIcon = () => {

        return getIcon(this.perso);
    }
    this.wrapAmis = ()=>{
        // s'assure que tous les amis et famille sont du bon type
        for (let f = 0; f < this.perso.famille.length; f++) {
            if (!(this.perso.famille[f] instanceof Famille)) {
                this.perso.famille[f] = new Famille(this.perso.famille[f]);
            }
        }
        for (let f = 0; f < this.perso.amis.length; f++) {
            if (!(this.perso.amis[f] instanceof Ami)) {
                this.perso.amis[f] = new Ami(this.perso.amis[f]);
            }
        }
    }
    this.addAmi = (ami) => {

        const alreadyFriend = this.perso.amis.findIndex(a => a.nom === ami.nom);
        if (alreadyFriend >= 0)
            this.perso.amis.splice(alreadyFriend, 1, ami);//replace
        else
            this.perso.amis.push(ami);

        this.setRelationStatus(ami, 10);
    }
    this.removeAmi = (ami) => {
        let exist = this.perso.amis.findIndex(a => a.nom === ami.nom);
        if (exist >= 0){

            this.perso.amis.splice(exist, 1);
            this.setRelationStatus(ami, 0);
        }
        else {
            exist = this.perso.famille.findIndex(a => a.nom === ami.nom);
            if (exist >= 0){

                this.perso.famille.splice(exist, 1);
                this.setRelationStatus(ami, 0);
            }
            else
            this.setRelationStatus(ami, -50);
        }
    }
    this.setRelationStatus = (pnj, variation) => {
        if (!this.alreadyMet(pnj.nom))
            this.perso.connaissances[pnj.nom] = this.perso.jauges.social + variation;
        else {
            if (isNaN(this.perso.connaissances[pnj.nom]))
                this.perso.connaissances[pnj.nom] = Math.floor(Math.random() * this.perso.jauges.social) + variation;
            else
                this.perso.connaissances[pnj.nom] += variation;
        }
        this.perso.connaissances[pnj.nom] = clamp(this.perso.connaissances[pnj.nom], 0, 100);
    }
    this.alreadyMet = nom => {
        let connu = false;
        //check famille

        for (let f = 0; f < this.perso.famille.length; f++) {
            if (this.perso.famille[f].nom === nom) {
                connu = true;
                break;
            }
        }
        //check amis
        for (let a = 0; a < this.perso.amis.length; a++) {
            if (this.perso.amis[a].nom === nom) {
                connu = true;
                break;
            }
        }
        if (!connu)
            connu = (this.perso.connaissances[nom] != null);
        return connu;
    }
    this.addFamille = (parent) => {
        this.perso.famille.push(parent);
        this.setRelationStatus(parent, 50);
    }
    this.findAmi = (ami) => {
        return this.perso.amis.find(test => test.nom === ami.nom);
    }

    this.getRelation = (type) => {

        // type peut etre Maman, Papa, Ami, soeur, frere
        if (type === 'Ami') {
            const nbAmi = this.perso.amis.length;
            if (nbAmi == 0)
                return null;
            return this.perso.amis[Math.floor(Math.random() * this.perso.amis.length)];//un ami au hasard
        }
        else if(type==="Famille"){ // un membre de la famille au hasard
            const nbFamille = this.perso.famille.length;
            return this.perso.famille[Math.floor(Math.random()*nbFamille)];
        }
        else {

            return this.perso.famille.find(test => test.lienDeParente === type);
        }
    }

    this.getFamille = () => {
        return this.perso.famille;
    }
    this.getAmis = () => {
        return this.perso.amis;
    }
    this.getAgePeriode = () => {
        if (this.perso.etatCivil.age < 6)
            return 'nourrisson';
        if (this.perso.etatCivil.age < 12)
            return 'enfance';
        if (this.perso.etatCivil.age < 16)
            return 'adolescence';
        if (this.perso.etatCivil.age < 22)
            return 'adulescent';
        if (this.perso.etatCivil.age < 60)
            return 'adulte';
        if (this.perso.etatCivil.age >= 60)
            return 'senior';
    }
    this.pondUnDChiard = ({ lienDeParente = 'Enfant', sexImposed }) => {
        this.perso.enceinte = false;
        const sex = sexImposed || (Math.random() > 0.5 ? 'M' : 'F');
        const monNom = this.perso.etatCivil.nom.split(' ')[1];
        const nom = generateRandomFirstName(sex) + ' ' + monNom;
        this.addFamille(new Famille({ nom: nom, etatCivil: { age: 1, sex: sex }, lienDeParente: lienDeParente }));
        const toLog = lienDeParente === 'Enfant' ? ("Vous avez donné naissance a " + (sex === 'M' ? 'un garcon' : 'une fille') + ' prenommé ' + nom)
            : `Vous avez desormais${sex === 'M' ? ' un frère ' : ' une soeur '} appelée ${nom}`;
        return toLog;
    }
    this.bilanFinancier = () => {
        let cout = 0; let gainsAnnuels = 0;
        if (this.perso.metier == null || this.perso.metier.branche === 'anpe') {
            if (this.getAgePeriode() === 'adulescent')// la vie coute moins cher grace aux parents
                cout = 2000;
            else {

                cout = 1000 * (this.perso.etatCivil.age / 10);
            }
            // assedics
            gainsAnnuels = 1140 * (this.perso.etatCivil.age / 20);
        }
        else { // avec un metier, le cout de la vie est en proportion

            const promos = Math.max((this.perso.metier.promotion / 10), 1);
            gainsAnnuels = Math.round(this.perso.metier.salaire * 100 * promos * 12);
            if (this.getAgePeriode() === 'adulescent') {
                gainsAnnuels /= 2;// a mi-temps avec la fac, faut pas deconer
                cout = 2000 + gainsAnnuels * 0.5;// 50% du salaire en argent de poche on depense moins si le gite est fourni
            }
            else
                cout = 5000 + gainsAnnuels * 0.8// 20% du salaire en argent de poche, c'est ca la vie
        }
        // couverts par le RSA
        if(this.perso.argent<0){
            this.perso.argent=0;            
        }


        this.perso.argent += Math.round(gainsAnnuels - cout);

        let log = "Pour l'annee ecoulée, vos depenses quotidiennes et votre mode de vie vous ont couté " + cout + " et vos gains cumulés se montent a " + gainsAnnuels + " euros (ponction fiscale deduise)";
        return log;
    }
    this.perteDamis=()=>{
        let toLog="";
       const conn= Object.keys(this.perso.connaissances);
        for(let c=0;c<conn.length;c++){
            if(this.perso.connaissances[conn[c]]<5){
                toLog+=(" "+conn[c]+" vous a ghosté. Son numero ne repond plus, vous le perdez de vue.")
                delete this.perso.connaissances[conn[c]];
                const amiIdx = this.perso.amis.findIndex(a=>a.nom===conn[c]);
                if(amiIdx>=0)
                    this.perso.amis.splice(amiIdx,1);
            }
        }
        return toLog;
    }
    this.degradationPossession = () => {
        // degradation de l'amitie surtout
        for (let a = 0; a < this.perso.amis.length; a++) {
            this.perso.connaissances[this.perso.amis[a].nom] -= 5;
            this.perso.amis[a].etatCivil.age++;
        }
        for (let a = 0; a < this.perso.famille.length; a++) {
            this.perso.connaissances[this.perso.famille[a].nom] -= 2;// moins vite pour la famille        
            this.perso.famille[a].etatCivil.age++;
        }
        for (let a = 0; a < this.perso.possessions.length; a++) {
           if(this.perso.possessions[a].valeur);       
           this.perso.possessions[a].valeur*=0.8;
        }

    }

    // revendre une possession
    this.revend = function (obj) {
       const existing = this.perso.possessions.findIndex(p=>p.nom===obj.nom);
       if(existing>-1){
        this.perso.possessions.splice(existing,1);
        this.perso.argent+=obj.valeur;
       }
    };

    this.applyConsequences = function (conseq, pnj) {
        let toLog = '';
        let toAlert = '';
        for (let clef in conseq) {
            if (jaugesEnum.indexOf(clef) >= 0) {
                this.perso.jauges[clef] += conseq[clef];
                toLog += `\n- ${clef}:${conseq[clef] > 0 ? '+' : '-'} ${conseq[clef]}`;
            }
            if (caractereEnum.indexOf(clef) >= 0) {
                this.perso.caractere[clef] += conseq[clef];
                //this.perso.caractere[clef] = clamp(this.perso.caractere[clef], 0, 100);
                toLog += `\n- ${clef}:${conseq[clef] > 0 ? '+' : '-'} ${conseq[clef]}`;
            }
            // case frere
            if (clef === 'famille') {

                toAlert += this.pondUnDChiard({ lienDeParente: conseq[clef], sexImposed: conseq[clef] === 'soeur' ? 'F' : 'M' });
            }
            // cas ami
            if (clef === 'ami') {

                if (pnj == null) {
                    const rage = generateAge([this.getAgePeriode()]);
                    const randomSx = Math.random() > 0.5 ? 'M' : 'F';
                    pnj = new PNJ({ etatCivil: { sex: randomSx, age: rage } });
                }
                if (conseq[clef] > 0) {
                    let newAmi=null;
                    if((conseq[clef] > 10) ){
                        // casPetitAmi
                        newAmi = new PetitAmi(pnj);
                        const nvc = pnj.etatCivil.sex==='F'?"une nouvelle petite copine":" un nouveau petit ami";
                        toAlert += ("Vous avez "+nvc+" "+pnj.nom);
                        const exCopine = this.hasCopine();
                        if(exCopine!=null){
                            if(Math.random()<exCopine.caractere.violent){
                                toAlert += ". Votre ex " + exCopine.etatCivil.nom+" l'a appris et l'a tres mal pris. Il/Elle vous gifle publiquement";
                                this.perso.jauges.sante-=6;
                                this.perso.jauges.karma-=10;this.perso.jauges.social-=3;
                            }
                            else{
                                toAlert += ". Votre ex " + exCopine.etatCivil.nom+" l'a appris et l'a compris, ca n'allait plus entre vous. Il/Elle vous souhaite bonne chance";
                                this.perso.jauges.karma-=12;this.perso.jauges.bonheur-=5;this.perso.jauges.social-=5;
                            }
                            this.addAmi(new ExCopine(exCopine));
                            // remplacer
                        }
                    }
                    else{
                        newAmi = new Ami(pnj);
                        toAlert += "\nVous vous etes fait un nouvel ami " + pnj.nom;
                    }
                    
                    this.addAmi(newAmi);
                }
                else {
                    const exCopine = this.hasCopine();
                    if(exCopine?.nom===pnj.nom){
                        // devient une ex
                        this.addAmi(new ExCopine(exCopine));
                    }
                    else
                        this.removeAmi(pnj);
                    toAlert += "\nVous vous etes fait un ennemi " + pnj.nom;
                }
            }
            if (clef === 'relation' && pnj != null) {
                this.setRelationStatus(pnj, conseq[clef]);
                toLog += "\nVotre relation avec " + pnj.nom + " a changé vers " + this.perso.connaissances[pnj.nom];
                // if pervers en +, ca deteint
                if(conseq['pervers']!=null)
                    {
                        const asAmi = this.findAmi(pnj);

                        if(asAmi!=null){

                            asAmi.caractere.pervers+=conseq['pervers'];
                        }
                    }
            }
            if (clef === 'argent') {
                this.perso.argent += conseq[clef];
                toLog += "\nVotre avez " + this.perso.argent + " en banque";
            }
            if (clef === 'deces') {// mort d'un membre de la famille
                 this.removeAmi(pnj)
                    toLog += "\nVotre avez perdu votre " + pnj.lienDeParente + " . Qu'il/elle repose en paix. ";
                
            }
            // cas maladie = {name:risque}
            if (clef === 'maladie') {
                const mals = Object.keys(conseq['maladie']);
                for (let m = 0; m < mals.length; m++) {
                    const risque = conseq['maladie'][mals[m]];
                    if (Math.random() < risque) {
                        this.perso.maladies.push(mals[m]);
                        toAlert += "\nVous avez contracté une " + mals[m];
                    }
                }
            }
            if (clef === 'soins') {
                const nbMaladies = this.perso.maladies.length;
                if (nbMaladies === 0)
                toAlert += "\nVous n'avez rien malheureux, vous me faites perdre mon temps";
                else if (Math.random() < 0.5) {
                    const removed = this.perso.maladies.splice(0, 1);
                    toAlert += "\nVous avez ete gueri de votre " + removed;
                } else {

                    toAlert += "\nVous avez pris vos medicaments, mais vous etes toujours malade ";
                }
            }
            if (clef === 'possessions') {
                const poss = conseq[clef];
                if(poss.toRemove)
                    {
                        const possIdx = this.perso.possessions.findIndex(p=>p.nom===poss.nom);
                        if(possIdx>-1){
                            this.perso.possessions.splice(possIdx,1);
                            toAlert += "\nVous avez perdu votre " + poss.nom;
                        }
                    }
                    else{
                        if(this.perso.argent<poss.valeur){
                            toAlert+="\n Vous n'avez pas assez d'argent pour vous payer ca. Revenez quand vous aurez du fait la manche, espèce de pauvre !"
                            // on rembourse quand meme on n'est pas chien
                            this.perso.argent+=poss.valeur;
                        }
                        else{

                            this.perso.possessions.push(poss);
                            toAlert += "\nVous possedez maintenant un.e " + poss.nom;
                        }
                    }
            }
            if (clef === 'diplomes') {
                this.perso.diplomes.push(conseq[clef]);
                toAlert += "\nVous etes titulaire d'un diplome en " + conseq[clef];
            }
            if (clef === 'promotion' && this.perso.metier != null) {
                this.perso.metier.promotion += conseq[clef];
                if (this.perso.metier.promotion < 0) {
                    //demission ou licenciement
                    this.perso.metier = Jobs.anpe;
                }
                else {
                    const newTitre = this.perso.metier.rangs[Math.floor(this.perso.metier.promotion / 10)];
                    if (newTitre != null) {
                        if (this.perso.titre !== newTitre) {
                            this.perso.metier.salaire = Math.round( this.perso.metier.salaire*1.1);
                            toAlert += "\nVous avez été promu au rang de " + newTitre + " avec le salaire qui va avec, vous touchez desormais " + (this.perso.metier.salaire * 100) + " euros par mois"
                        }
                        this.perso.titre = newTitre;
                    }
                }
            }
            if (clef === 'enceinte' && this.perso.etatCivil.age<50) {
                if (conseq[clef] === false)
                    this.perso.enceinte = false;
                else if (Math.random() < conseq[clef]) {
                   
                    if(this.perso.etatCivil.sex==="F" && (pnj==null||pnj.etatCivil.sex==='M')){
                        this.perso.enceinte = true;
                        toAlert += "\nVous etes tombée enceinte !";
                        if(pnj!=null)
                            toAlert +=(" de "+pnj.nom);
                    }
                    else if(this.perso.etatCivil.sex==="M" && pnj!=null && pnj.etatCivil.sex==='F'){
                        toAlert += "\nVotre partenaire est tombée enceinte de vous !";
                        if(pnj!=null){
                            if(pnj.caractere.intelligent>50){
                                toAlert += " Elle choisit de ne pas garder le bebe. Vous l'avez echappé belle.";
                               
                            }
                            else{
                                this.perso.enceinte = true;
                                toAlert += " Elle choisit de garder le bébé.. Vous allez etre PAPA !!"
                            }
                        }
                        else{
                            //pnj inconnu enceinte.. on s'en fout
                        }

                    }
                }
            }
            if(clef==='mariage'){
                const divorce = (femme=>{
                    
                    this.removeAmi(femme);
                    this.perso.argent/=2;
                });
                if (conseq[clef] === false)
                { //divore
                    const epouse = this.hasEpouse();
                    divorce(epouse);
                    toAlert+="Vos avoirs sont divisés par deux et vous payez une pension alimentaire.";
                }
                else{
                    // mariage
                    const epouse = this.hasEpouse();
                    if(epouse!=null){
                        toAlert += "Vous etes deja marié abruti ! Vous pensiez que personne allait s'en rendre compte ? "+pnj.etatCivil.nom+" vous jette le bouquet a la tronche et "
                        +epouse.etatCivil.nom+" demande le divorce. ";
                        toAlert+="Vos avoirs sont divisés par deux et vous payez une pension alimentaire.";
                        this.setRelationStatus(pnj, -30);
                        divorce(epouse);
                    }
                    else{

                        const newAmi = new Epoux(pnj);
                        if(this.findAmi(pnj)){
                            this.removeAmi(pnj);
                        }
                        this.addFamille(newAmi);
                        toAlert += "Vous etes desormais marié.e a "+pnj.etatCivil.nom;
                        const patrimoine = Math.round( (pnj.caractere.intelligent+pnj.etatCivil.age-60)*Math.random()*1000);
                        this.perso.argent+=patrimoine;
                        if(patrimoine>0)
                            toAlert+=(" elle apporte "+patrimoine+" euros en patrimoine. Bon parti !");
                        else
                            toAlert+=(" elle apporte "+patrimoine+" euros de dettes. Mais bon, vous l'aimez, et elle suce si bien");
                    }
                }

            }
            // cas justice ,  ,  TODO
        }
        return [toLog,toAlert];
    }

    this.hasEpouse = function () {
        // trouve un ami qui a le status epoux=true
        for (let f = 0; f < this.perso.famille.length; f++) {
            if (this.perso.famille[f] instanceof Epoux) {
                return this.perso.famille[f];
            }
        }
        return null;
    };
    this.hasCopine = function () {
        // trouve un ami qui a le status epoux=true
        for (let f = 0; f < this.perso.amis.length; f++) {
            if (this.perso.amis[f] instanceof PetitAmi) {
                return this.perso.amis[f];
            }
        }
        return null;
    };
    // Autre méthode si nécessaire
    this.autreMethode = function () {
        // Implémentation de la dégradation des possessions
    };

}
