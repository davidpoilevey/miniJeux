import React, { useContext, createContext, useState } from "react";
import { Missions } from "./Missions";
import { Ennemis } from "./Ennemis";

import imgPorte from './images/porte.png';
import imgRat from './images/rat.png';
import imgPlacard from './images/cuisine.png';
import imgChat from './images/chat.png';

  /** * consequence = {
 *   text : 'le texte de l'action effectuee' // obligatoire
 *  , lieu : 'changementDeLieu' // facultatif
 *  , {any carac} : add/remove ny caracteristique
 *  , combat : [] // list d'ennemis qui engage le combat (facultatif)
 *  , mission : {} // une mission est proposee
 *  , boutique : type // un endroit unique 
 * } */



export const Lieux = {
    maison:{
        image:'https://images.photowall.com/articles/1d6ea75668800877008a02dafda66f49.jpg?w=720&q=80'
        , pointsInteret:[
            {
                id:'porteSortie'
                , text:"Aller dans la rue"
                , image:imgPorte
                , actions:[
                    {
                        text:'Sortir'
                        ,consequence:{lieu:'rue', text:'Vous sortez dans la rue'}
                    }
                ]
            }
            , {
                id:'placard', text:"Cuisine"
                , image:imgPlacard
                , actions:[
                    {
                        text:'Fouiller les placards'
                        ,consequence:{
                            text:'Vous trouvez un vieux rat fatigué qui vous attaque'
                            , combat:[Ennemis.vieuxRat]
                        }
                    },
                    {
                        text:'Chercher les croquettes du chat'
                        , condition:{mission:'chatCroquettes'}
                        ,consequence:{
                            text:'Vous trouvez un paquet de croquettes'
                            , recompense:{possessions:{croquettes:20}}
                        }
                    }
                ]
            }
            ,{
                id:'chat', text:"Matou mignon"
                , image:imgChat
                , actions:[
                    {
                        text:'Caresser'
                        , consequence:{
                            text:'Il miaule et reclame des croquettes'
                            , mission:Missions.chatCroquettes
                        }
                    }
                    , {
                        text:"Attraper"
                        , consequence:{
                            text:"Il est vif le salopiaud"
                            , jet:['dexterite',16,[{text:"Vous l'avez eu, vous le torturez joyeusement"
                            , image:'https://fac.img.pmdstatic.net/fit/http.3A.2F.2Fprd2-bone-image.2Es3-website-eu-west-1.2Eamazonaws.2Ecom.2FFAC.2Fvar.2Ffemmeactuelle.2Fstorage.2Fimages.2Fanimaux.2Fanimaux-pratique.2Ffaire-plaisir-a-son-chat-22108.2F13530381-1-fre-FR.2Fsavez-vous-comment-faire-plaisir-a-votre-chat.2Ejpg/1200x900/quality/80/crop-from/center/savez-vous-comment-faire-plaisir-a-votre-chat.jpeg'
                            , bonheur:1}
                            , {text:"Il vous echappe et vous griffe (ou l'inverse)", vie:-2}]]
                        }
                    }
                ]
            }
            ,{
                id:'dormir', text:"Votre lit"
                , image:'https://img.edilportale.com/product-thumbs/b_ICON-Bed-Flou-337617-relf37934bd.jpg'
                , actions:[
                    {
                        text:'Dormir'
                        , consequence:{
                            text:'Vous vous reposez et recuperez tous vos points de vie'
                            , recompense:{vie:50}
                        }
                    }
                ]
            }
        ]
    }
    , rue:{
        image:'https://data.puzzle.de/.21/rue-de-village-1000-teile--puzzle.59676-1.fs.jpg'
        , pointsInteret:[ {
            id:'porteSortie', text:'Retourner dans la maison'
            , image:imgPorte
            , actions:[
                {
                    text:'Rentrer dans la maison'
                    ,consequence:{lieu:'maison', text:'Vous rentrez  dans la maison'}
                }
            ]
        },  {
            id:'ruelleSombre', text:'Ruelle sombre'
            , image:'https://st2.depositphotos.com/2069093/6024/i/950/depositphotos_60247775-stock-photo-looking-down-an-empty-inner.jpg'
            , actions:[
                {
                    text:'Aller voir dans la ruelle'
                    ,consequence:{
                        lieu:'ruelle', text:'Vous penetrez dans une ruelle sombre. Plusieurs personnes louchent se tournent vers vous'}
                }
            ]
        },  {
            id:'chateau', text:'Vers le chateau'
            , image:'https://www.shutterstock.com/image-vector/cute-cartoon-castle-vector-illustration-260nw-99969026.jpg'
            , actions:[
                {
                    text:'Aller vers le chateau'
                    ,consequence:{
                        lieu:'chateau', text:'Vous vous dirigez vers le chateau. '}
                }
                , {
                    text:"Garde en faction"
                    , consequence:{
                        text:"Vous interpellez le garde"
                        , choix:[
                            {
                                text:"Eh connard je te pisse a la raie"
                                , consequence:{
                                    text:"Le garde vous demande de vous excuser"
                                    ,choix:[
                                        {
                                            text:"Vous sortez votre bite et lui pissez effectivement a la raie"
                                            , consequence:{
                                                text:"Le garde appelle son collegue, ils vous attaquent tous les deux"
                                                , combat:[Ennemis.garde, Ennemis.garde]
                                            }
                                        }
                                        ,{
                                            text:"Vous vous excusez et repartez"
                                            , consequence:{bonheur:-1}
                                        }
                                    ]
                                }
                            }
                            ,{
                                text:"Excusez-moi, comment rentrer dans le chateau ?"
                                , consequence:{
                                    text:"Le garde vous explique que l'acces au chateau est interdit aux civils"
                                }
                            }
                        ]
                    }
                }
            ]
        }]
    }
    , chateau:{
        image:'https://thumbs.dreamstime.com/z/ch%C3%A2teau-magique-de-kindom-114979035.jpg',
        pointsInteret:[
            {
                id:'porteSortie', text:'Repartir'
                , image:imgPorte
                , actions:[
                    {
                        text:'Retourner dans la rue principale'
                        ,consequence:{lieu:'rue', text:'Vous retournez dans la rue principale '}
                    }
                ]
            }
        ]
    } , nouvelEndroit:{
        image:null,
        pointsInteret:[
            {
                id:'porteSortie', text:'Repartir'
                , image:imgPorte
                , actions:[
                    {
                        text:'Retourner dans la rue principale'
                        ,consequence:{lieu:'rue', text:'Vous retournez dans la rue principale '}
                    }
                ]
            }
        ]
    }
    , ruelle:{
        image:'https://st2.depositphotos.com/2069093/6024/i/950/depositphotos_60247775-stock-photo-looking-down-an-empty-inner.jpg'
        , pointsInteret:[
            {
                id:'porteSortie', text:'Repartir'
                , image:imgPorte
                , actions:[
                    {
                        text:'Retourner dans la rue principale'
                        ,consequence:{lieu:'rue', text:'Vous retournez dans la rue principale '}
                    }
                ]
            }
            , {
                id:'potions', text:'Dealer de potions'
                , image:'https://ih1.redbubble.net/image.4865349178.1596/flat,750x,075,f-pad,750x1000,f8f8f8.jpg'
                , actions:[
                    {
                        text:'Achetez du matos'
                        , consequence:{
                            text:"Vous entrez dans la boutique"
                            , boutique:'potion'
                        }
                    }
                    , {
                        text:"Ouvrir la porte de la maison d'a coté"
                        , condition:{mission:'maquereau'}
                        , consequence:{
                            text:"Vous tombez sur le mac de la fille de rue"
                            , image:"https://static.vecteezy.com/ti/vecteur-libre/p3/26575302-stereotype-masculin-brute-franchi-mains-sur-poitrine-avec-une-mine-renfrognee-et-une-cruel-petit-sourire-satisfait-plat-style-vecteur-illustration-bodybuilder-avec-portant-une-rouge-t-chemise-et-une-noir-chapeau-stock-vecteur-image-vectoriel.jpg"
                            , choix:[
                                {
                                    text:"Veuillez cesser d'importuner la demoiselle dans la rue ou vous aurez affaire a moi, vil manant"
                                    , consequence:{
                                        text:"Il vous rit au nez et vous file une beigne"
                                        , combat:[Ennemis.mac]
                                    }
                                },
                                {
                                    text:"Si tu me donnes la moitie de ton fric, je vous oublie toi et ta pouffiasse"
                                    , consequence:{
                                        text:"Vous essayez de l'intimider (Jet de charisme)"
                                        , jet:['charisme',13, [{
                                            text:"Vous lui faites peur et il vous refile 100 pieces d'or"
                                            , possessions:{or:100}
                                        },{
                                            text:"Il n'est pas impressionné et vous attaque"
                                            , combat:[Ennemis.mac]
                                        }]]
                                        
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
            , {
                id:'putasse', text:'Fille de rue'
                , image:'https://st2.depositphotos.com/6198262/11375/v/950/depositphotos_113752056-stock-illustration-smoking-prostitute-whore.jpg'
                , actions:[
                    {
                        text:'Demander une passe'
                        , consequence:{
                            text:'La fille vous emmene a l\'hotel pour faire votre affaire'
                            , mission:Missions.putasse
                        }
                    }
                    , {
                        text:'Parler de la pluie et du beau temps'
                        , consequence:{
                            text:"La fille vous explique que son mac lui prend tout son argent et la tabasse"
                            , choix:[
                                {
                                    text:"Pas de chance ma pauvre fille, du coup vous faites des reductions ?"
                                    , consequence:{
                                        text:"Elle vous balance son sac a main a la figure :Va chier connard !"
                                        , vie:-1
                                        ,bonheur:-1
                                    }
                                }
                                , {
                                    text:"Dites-moi ou il est et je m'en occupe"
                                    , consequence:{
                                        text:"Quel chevalier servant ! Il habite juste la a coté du dealer de potions"
                                        , mission:Missions.maquereau
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
}



// *************   CONTEXT  ***************
const LieuxContext = createContext();
export const useLieux = () => useContext(LieuxContext);
export const LieuxProvider = ({ children }) => {
    const [currentLieu, setLieu] = useState('maison');

    return <LieuxContext.Provider value={{ currentLieu,setLieu }}>
        {children}
    </LieuxContext.Provider>;
};
