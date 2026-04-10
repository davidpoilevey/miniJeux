/*
Metier={
    branche, nom, description, nbPersonnes,  rangs, image, salaire, activites
}
Job={
    nom,branche, nomSociete, promotion, rangs, salaire, activites
}



*/

import {soubrette} from '../events/BaseCommonEvents';


const nomsSociete = [
    { nom: "Boulangerie du Coin", type: "service" },
    { nom: "Assurance Sécurité Plus", type: "bureau" },
    { nom: "Banque Solide", type: "bureau" },
    { nom: "Garage Express", type: "industrie" },
    { nom: "Fabrique Automobile Avant-Garde", type: "industrie" },
    { nom: "Cabinet Médical Harmony", type: "service" },
    { nom: "Épicerie Bio Nature", type: "service" },
    { nom: "Atelier d'Art Créatif", type: "service" },
    { nom: "Agence de Voyages Horizon", type: "bureau" },
    { nom: "Salon de Coiffure Élégance", type: "service" },
    { nom: "Librairie des Savoirs", type: "service" },
    { nom: "Pharmacie Bien-Être", type: "service" },
    { nom: "Studio de Musique Harmonie", type: "service" },
    { nom: "Café du Centre", type: "service" },
    { nom: "École de Danse Rythme", type: "service" },
    { nom: "Cabinet Juridique Alliance", type: "bureau" },
    { nom: "Agence Immobilière Prestige", type: "bureau" },
    { nom: "Clinique Dentaire Sourire", type: "service" },
    { nom: "Studio de Photographie Instant", type: "service" },
    { nom: "Ferme Bio Naturelle", type: "industrie" },
    { nom: "Boutique de Mode Élégance", type: "service" },
    { nom: "Société de Construction Solidité", type: "industrie" },
    { nom: "Club de Fitness Vitalité", type: "service" },
    { nom: "Salon Esthétique Beauté", type: "service" },
    { nom: "Cabinet d'Architectes Création", type: "bureau" },
    { nom: "Centre de Formation Sagesse", type: "service" },
    { nom: "Station-Service Énergie", type: "industrie" },
    { nom: "Libre-Service Quotidien", type: "service" },
    { nom: "Parfumerie Fragrance", type: "service" },
    { nom: "Crèche Douce Enfance", type: "service" },
    { nom: "Galerie d'Art Inspiration", type: "service" },
    { nom: "Agence de Publicité Créativité", type: "bureau" },
    { nom: "Salon de Thé Détente", type: "service" },
    { nom: "Magasin de Jouets Ludique", type: "service" },
    { nom: "Cabinet Comptable Équilibre", type: "bureau" },
    { nom: "Magasin de Sport Vitalité", type: "service" },
    { nom: "Clinique Vétérinaire Compagnie", type: "service" },
    { nom: "Bureau d'Études Innovation", type: "bureau" },
    { nom: "Société de Nettoyage Propreté", type: "industrie" },
    { nom: "Bureau de Tabac Liberté", type: "service" },
    { nom: "Salon de Massage Relaxation", type: "service" },
    { nom: "Boucherie Traditionnelle", type: "industrie" },
    { nom: "Cabinet de Conseil Sagesse", type: "bureau" },
    { nom: "Librairie Papeterie Savoir", type: "service" },
    { nom: "Agence de Rencontre Amour", type: "bureau" },
    { nom: "Boutique de Décoration Charme", type: "service" },
    { nom: "Garage Mécanique Rapidité", type: "industrie" }
    // Ajoutez plus de noms au besoin
  ];
  
const getRandomSARL = (type)=>{
    const societesFiltrees = nomsSociete.filter((societe) => societe.type === type);
    let randomIndex=0;
    if (societesFiltrees.length === 0) {
        
     randomIndex = Math.floor(Math.random() * nomsSociete.length);
     return nomsSociete[randomIndex].nom;
    }
    else
     randomIndex = Math.floor(Math.random() * societesFiltrees.length);
    return societesFiltrees[randomIndex].nom;
}
export class Job {
    constructor(metier) {
        this.nom = metier.nom;
        this.nomSociete = getRandomSARL(metier.branche);
        this.rangs=metier.rangs;
        this.branche=metier.branche;
        this.prerequis=metier.prerequis;
        this.salaire=metier.salaire;
        this.promotion=0;
        this.activites=metier.activites??[];
    }

    getColor() {}
}

export const Jobs = {
    anpe:{
        branche:'anpe', nom:"Pole emploi" , nbPersonnes:5, promotion:0
        , rangs:['Chomeur junior','Chomeur', 'Chomeur longue duree', 'RSA']
        , activites:[
            {
                nom:"Pointer"
                , text:"Vous allez pointer au chomage pour toucher vos droits"
                , consequenceText:"Vous avez eu une activite ce mois-ci ? Non, ben ca m'etonne pas, va falloir se bouger le cul"
                , consequences:{promotion:2,social:1,argent:30}
            }
        ]
    }
     ,service:[{
        branche:'serviceALaPersonne', nom:"Baby sitter", description:"Occupe-toi d'un mome, qu'il disait, ca va etre facile tu vas voir...", nbPersonnes:1
        , promotion:0, rangs:['Noob','Experte'], salaire:3
    },{
        branche:'serviceALaPersonne', nom:"Assistante personnelle", description:"Y a juste a etre presente, et presentable, ca va etre facile tu vas voir..."
        , nbPersonnes:1, prerequis:{fullTime:true}
        , promotion:0, rangs:['Machine,la','Aide personnelle','Assistante de choc', 'Bras droit'], salaire:10
        , activites:[
            {
                nom:"Proposer un service premium"
                , text:"Vous proposez un service de luxe a votre employeur afin d'arrondir les fins de mois, que proposez-vous"
                , options:[
                    {
                       text: "48h / semaine pour 300 boules de plus par mois"
                       , consequences:{promotion:3,sante:-3,bonheur:-3,social:-5,karma:5,pervers:-4, argent:200}
                       , consequenceText:"Vous trimerez dur, mais vous y arriverez petite, une petite prime em plus ?"
                    },
                    {
                       text: "Je viens travailler en jupette-tailleur et porte-jarretelles pour 500 boules de plus par mois"
                       , consequences:{promotion:5,bonheur:3,social:5,karma:-5,pervers:4}
                       , consequenceImage:"https://cdni.shavedpics.com/300/1/255/11731923/11731923_005_b55a.jpg"
                       , consequenceText:"Votre employeur va pouvoir se rincer l'oeil a volonté, mais apres tout si tout le monde est content"
                    },
                    {
                       text: "Promotion canapé"
                       , consequenceText:"Vous passez a la casserole, mais ce n'etait pas tres agreable, il a une petite bite et sent des aisselles"
                       , consequences:{promotion:10,bonheur:-3,social:15,karma:-10,pervers:4, argent:200}
                       , consequenceImage:"https://el.phncdn.com/gif/42506561.gif"
                    }

                ]
            }
        ]
    },{
        branche:'serviceALaPersonne', nom:"Pute", description:"Au debut c'est dur, mais apres on a les habitués, ca va etre facile tu vas voir..."
        , nbPersonnes:4, prerequis:{fullTime:true,pervers:66}
        , promotion:0, rangs:['Occasionnelle','Pute de rue', 'Escort','Escort de luxe', 'Escort VIP'], salaire:30
        , activites:[
            {
                nom:"Proposer une specialité"
                , text:"Vous proposez un service particulier qui vous permet de gonfler vos tarifs"
                , options:[
                    {
                       text: "Sodomie"
                       , consequenceText:"Ca fait un peu mal au cul quand meme"
                       , consequences:{promotion:5,sante:-1,bonheur:-2,social:1,karma:-1,pervers:2}
                       , consequenceImage:"https://el.phncdn.com/gif/43618931.gif"
                    },
                    {
                       text: "Golden shower"
                       , consequences:{promotion:5,bonheur:3,social:6,karma:-7, sante:-1, maladie:{mst:0.1},pervers:10}
                       , consequenceText:"C'est qu'on y prend gout a force, slurp"
                       , consequenceImage:"https://el.phncdn.com/gif/35308512.gif"
                    },
                    {
                       text: "La totale et sans protection"
                       , consequenceText:"Vous aimez prendre des risques, YOLO, et vous eclatez grave. En plus ca rapporte un max de blé"
                       , consequences:{promotion:20,bonheur:7,social:5,karma:-15,pervers:10, enceinte:0.2,maladie:{mst:0.2}}
                       , consequenceImage:"https://el.phncdn.com/gif/39720761.gif"
                    }

                ]
            }, {
                nom:"Organiser une partouze"
                , text:"Ben oui tat qu'a etre pute, on peut se les organiser soi-meme, et en plus ca rapporte"
                , options:[
                    {
                        text:"Partie fine"
                        , consequenceText:"Ici on pète dans la soie, mais ca pue pareil"
                        , consequenceImage:"https://el.phncdn.com/gif/43299071.gif"
                        , consequences:{karma:2,social:5,bonheur:4,violent:-1,pervers:5, enceinte:0.2, argent:1000}
                    }
                    ,{
                        text:"Gang-bang"
                        , consequenceText:"Ca dechire"
                        , consequenceImage:"https://el.phncdn.com/gif/35114002.gif"
                        , consequences:{karma:2,social:5,bonheur:4,violent:8,pervers:5, enceinte:0.2, argent:800}
                    }
                ]
            }
        ]
    }
    , {
        "branche": "santé",
        "nom": "Infirmier",
        "description": "Soins infirmiers, assistance médicale",
        "nbPersonnes": 12,
        "promotion": 0, prerequis:{fullTime:true,diplome:'science'},
        "rangs": ["Assistant", "Infirmier diplômé", "Infirmier spécialisé", "Infirmier en chef"],
        "salaire": 19
        ,activites:[
            {
                nom:"Volontaire pour effectuer des prelevements"
                , text:"Bon en fait ce sont des prelevements pour la banque de sperme, ca vous va quand meme ?"
                , consequenceImage:"https://el.phncdn.com/gif/24680651.gif"
                , consequences:{argent:150,karma:7,social:3,pervers:3,promotion:2}
            },  {
                nom:"Volontaire pour tester les nouveaux brancards"
                , text:"Avec les derniers on pouvait pas faire ca"
                , consequenceImage:"https://el.phncdn.com/gif/5873951.gif"
                , consequences:{argent:150,karma:2,social:5,pervers:5,promotion:1}
            },  {
                nom:"Prendre la temperature d'un patient a l'ancienne"
                , text:"Cela dit la precision n'est pas top"
                , consequenceImage:"https://el.phncdn.com/gif/21531052.gif"
                , consequences:{argent:150,karma:4,social:7,pervers:5,promotion:1}
            },  {
                nom:"Ne pas perdre d'echantillons"
                , text:"Toujours rester professionnelle"
                , consequenceImage:"https://el.phncdn.com/gif/43022901.gif"
                , consequenceText:"Parfois ca deborde"
                , consequences:{argent:150,karma:6,social:9,pervers:9,promotion:3}
            }
        ]
      }
      ,  {
        "branche": "éducation",
        "nom": "Enseignant",
        "description": "Cours et enseignement dans une école",
        "nbPersonnes": 12,
        "promotion": 0,prerequis:{fullTime:true,diplome:'social'},
        "rangs": ["Professeur stagiaire", "Enseignant certifié", "Professeur agrégé", "Directeur d'école"],
        "salaire": 20
        ,activites:[
            {
                nom:"Donner des cours privés"
                , condition:{sex:"F"}
                , text:"Vous avez un certain succés du a vos methodes d'enseignement vivantes"
                , consequenceImage:"https://el.phncdn.com/gif/43784441.gif"
                , consequences:{argent:750,karma:2,social:3,pervers:3,promotion:2, enceinte:0.2}
            },  {
                nom:"Donner des cours privés"
                , condition:{sex:"M"}
                , text:"Vous avez un certain succés du a vos methodes d'enseignement vivantes"
                , consequenceImage:"https://el.phncdn.com/gif/28204772.gif"
                , consequences:{argent:750,karma:2,social:3,pervers:3,promotion:2}
            },  {
                nom:"Faire greve"
                , text:"Au pire ca fait des vacances gratos"
                , consequenceImage:"https://www.leparisien.fr/resizer/ERPQL_nTrg_waV1fgepSGLMxiRM=/932x582/arc-anglerfish-eu-central-1-prod-leparisien.s3.amazonaws.com/public/AKKVDUL24U52LSXVEKVFE6ECAA.jpg"
                , consequences:{argent:-150,karma:-2,social:8,violent:5,promotion:1}
            }
        ]
      }, {
        "branche": "commerce",
        "nom": "Cuisinier",
        "description": "Préparation et cuisson des repas",
        "nbPersonnes": 10,
        "promotion": 0,prerequis:{fullTime:true},
        "rangs": ["Commis de cuisine", "Cuisinier de niveau I", "Cuisinier de niveau II", "Chef de cuisine"],
        "salaire": 20
        , activites:[
            {
                nom:"Tenter la nouvelle cuisine"
                , text:"Pour ameliorer votre renommee, vous decidez de creer de nouveaux plats"
                , options:[
                    {
                        text:"Pate a pain fourree"
                        , condition:{sex:"M"}
                        , consequenceText:"Ca n'a pas trop marché, les gens ont trouvé que ca avait un drole de gout."
                        , consequenceImage:"https://38.media.tumblr.com/tumblr_mdaglw3dMX1rgghaio2_400.gif"
                        , consequences:{promotion:1,karma:-4,social:1,pervers:3}
                    },{
                        text:"Oeufs pochés a la ciboulette"
                        , consequenceText:"Une reussite exceptionnelle, le restaurant a gagné une etoile, mais c'est le Chef qui s'est attribué tout le merite, c't'enculé."
                        , consequenceImage:"https://img.cuisineaz.com/680x357/2016/10/13/i12885-comment-transformer-un-simple-oeuf-en-plat-s-d-exception.jpg"
                        , consequences:{promotion:3,karma:4,social:1,pervers:1,intelligent:1}
                    },{
                        text:"Miches fouettées a la creme anglaise"
                        , condition:{sex:"F"}
                        , consequenceText:"Franchement c'etait bon, je vois pas ce que vous voulez dire."
                        , consequenceImage:"https://www.comicalporn.com/wp-content/uploads/pancake-mix.gif"
                        , consequences:{promotion:2,karma:4,social:1,pervers:1,intelligent:1}
                    },{
                        text:"Pizza ultra-pétrie "
                        , consequenceText:"Franchement un chef d'oeuvre, malheureusement incompris"
                        , consequenceImage:"https://69.media.tumblr.com/51df4fe6aa08d41d56668fe3719f5f33/tumblr_nc8ijqlBxJ1r8bvzso5_500.gif"
                        , consequences:{promotion:2,karma:4,social:2,pervers:2}
                    }
                    
                ]
            }
        ]
      }
    ]
     ,bureau:[
        {
            branche:'business', nom:"Stagiaire", description:"Franchement tu peux venir le samedi, deja qu'on  te file un demi-salaire"
            , nbPersonnes:6
            , promotion:0, rangs:['Bleu','Tocard', 'Jeune con', 'Vieux naze'], salaire:5
        },
        {
            branche:'business', nom:"Informaticien", description:"Conception, analyse et developpement"
            , nbPersonnes:6, prerequis:{fullTime:true,diplome:'science', intelligent:70}
            , promotion:0, rangs:['Junior','Senior', 'Lead dev', 'Chef de projet'], salaire:25
            , activites:[
                {
                    nom:"Support utilisateur", icon:"SupportAgent"
                    , text:"Vous acceptez de faire du support utilisateur, ca veut dire aller rebrancher la prise la plupart du temps."
                    , options:[
                       { 
                        text:"Bonjour Internet marche plus"
                        , consequenceText:"Debranchez et rebranchez, voila... De rien madame..."
                        , consequences:{karma:-3,social:1,pervers:-1,violent:1,promotion:1}
                     },{ 
                        text:"Bonjour il me faudrait un backup sur Cloud pour defragmenter mon conteneur en ligne"
                        , consequenceText:"Bien sur, je vous passe le responsable technique..."
                        , consequences:{karma:-1,social:2,pervers:-1,violent:2,promotion:1}
                     },{ 
                        text:"Bonjour il me faudrait underdesk service"
                        , consequenceText:"Bien sur, j'arrive'..."
                        , consequences:{karma:3,social:2,pervers:2,bonheur:-1,promotion:3}
                        , consequenceImage:"https://el.phncdn.com/gif/46768911.gif"
                     }
                    ]
                }
            ]
        },
        {
            branche:'commerce', nom:"Banquier", description:"Bon au debut c'est surtout de l'accueil du client"
            , nbPersonnes:6,prerequis:{fullTime:true,diplome:'droit'}
            , promotion:0, rangs:["Agent d'accueil", 'Conseiller I','Conseiller II','Conseiller III', "Chef d'agence", 'Directeur regional', 'Sous-directeur', 'Directeur adjoint','PDG']
            , salaire:21
        },{
            "branche": "commerce",
            "nom": "Vendeur",
            "description": "Promotion et vente de produits auprès des clients",
            "nbPersonnes": 10,
            "promotion": 0,prerequis:{fullTime:true,diplome:'bac',voiture:true},
            "rangs": [" débutant", " senior", "Commercial","Responsable des ventes", "Directeur Marketing"],
            "salaire": 20
            , activites:[
                {
                    nom:"Vendre au marché noir"
                    , text:"Vous choisissez de faire du trafic illegal.. Dans quel domaine"
                    , options:[
                        {
                            text:"Drogues"
                            , chance:0.8
                            , consequenceTextOK:"On fait passer un petit kilo de resine avec les echantillons, ca passe mieux avec la carte VRP"
                            , consequencesOK:{argent:1000,karma:-5,bonheur:3,promotion:3}
                            , consequenceTextNOK:"Des fois, ca passe pas et on se fait choper. La police vous met une amende et confisque le matos."
                            , consequencesNOK:{argent:-3000,karma:-5,bonheur:-8,promotion:-2}
                        },{
                            text:"Armes", chance:0.8
                            , consequenceTextOK:"Ca rapporte un max, et puis c'est pas vous qui appuierez sur la gachette"
                            , consequencesOK:{argent:5000,karma:-16,social:-3,promotion:6}
                            , consequenceTextNOK:"Des fois, on se prend une bastos, ca craint ce business."
                            , consequencesNOK:{argent:-1000,karma:-5,bonheur:-8,promotion:-2,sante:-20}
                        },{
                            text:"Traite de blanches"
                            , consequenceText:"L'avantage c'est qu'on peut profiter de la marchandise sans lui faire perdre de valeur"
                            , consequences:{argent:2000,karma:-12,social:2,promotion:6,pervers:9}
                            , consequenceImage:"https://el.phncdn.com/gif/35697752.gif"
                        }
                    ]
                }
                , {
                    nom:"Faire du porte a porte"
                    , text:"Ca met du beurre dans les epinards"
                    , consequences:{argent:200,social:6,karma:-1,bonheur:-3}
                    , randomAction:{
                        risque:0.3
                        ,text:"Et puis des fois on tombe sur une bonne cliente"
                        , consequenceImage:"https://el.phncdn.com/gif/38590061.gif"
                        ,consequences:{karma:5,pervers:3,social:2,bonheur:2}
                    }
                }
            ]
          },
          {
            "branche": "fonctionnaire",
            "nom": "Fonctionnaire",
            "description": "Le service public t'attends ! Securite de l'emploi garantie",
            "nbPersonnes": 8,
            "promotion": 0,prerequis:{fullTime:true,diplome:'social'},
            "rangs": ["Agent d'accueil", "Agent", "Chef d'equipe", "Responsable de departement", "Directeur regional", "Sous-prefet"],
            "salaire": 20
            , activites:[
                {
                    nom:"Accepter les pots de vins"
                    , text:"Vous vous laissez soudoyer, mais sur quelle ampleur"
                    , options:[
                        {
                            text:"Faire passer un dossier en priorité"
                            , consequenceText:"Ca fait de mal a personne et ca arrange tout le monde"
                            , consequences:{argent:1000,karma:-2,social:1,promotion:1}
                        },{
                            text:"Attribuer un marché public"
                            , consequenceText:"Ca rapporte un max, et puis l'argent public, il est a tout le monde, non ?"
                            , consequences:{argent:10000,karma:-6,social:2,promotion:3}
                        },{
                            text:"Oui en nature ca marche aussi"
                            , condition:{sex:"M"}
                            , consequenceText:"C'est le dernier cadeau d'un promoteur... Elle est pas belle la vie"
                            , consequences:{argent:2000,karma:-2,social:2,promotion:3,pervers:5}
                            , consequenceImage:"https://el.phncdn.com/gif/1956061.gif"
                        },{
                            text:"Oui en nature ca marche aussi"
                            , condition:{sex:"F"}
                            , consequenceText:"C'est le dernier cadeau d'un promoteur... Elle est pas belle la vie"
                            , consequences:{argent:2000,karma:-2,social:2,promotion:3,pervers:5}
                            , consequenceImage:"https://el.phncdn.com/gif/19802911.gif"
                        }
                    ]
                }
            ]
          }
       
     ]
     ,industrie:[
        {
            branche:'industrie', nom:"Manutentionnaire", description:"Apres tu decharges les palettes et tu mets tout dans les racks", nbPersonnes:5
            , promotion:0, 
            rangs:['Esclave','Galérien', 'Debrouillard', 'Vieux con'], salaire:8
        },
        {
            "branche": "business",
            "nom": "Ouvrier du batiment",
            "description": "Travaux de construction, rénovation",
            "nbPersonnes": 10,
            "promotion": 0,prerequis:{fullTime:true,diplome:'bac'},
            "rangs": ["Apprenti", " qualifié", "Chef d'équipe", "Contremaître"],
            "salaire": 15
          }, {
            "branche": "business",
            "nom": "Technicien de labo",
            "description": "Analyses et tests dans le domaine pharmaceutique",
            "nbPersonnes": 12,
            "promotion": 0,prerequis:{fullTime:true,diplome:'science', intelligent:72},
            "rangs": [" débutant", " certifié", "Spécialiste", "principal"],
            "salaire": 23
            , activites:[
                {
                    nom:"Utiliser le labo"
                    , text:"Vous vous retrouvez seul parfois le soir au labo, l'occasion de plancher sur des projets persos"
                    , options:[
                        {
                            text:"Avancer sur mon boulot, je veux etre le meilleur"
                            , consequenceText:"Votre chef se demande encore comment vous faites pour avancer si vite"
                            , consequences:{karma:2,social:1,promotion:4,pervers:-2,intelligent:1}
                        },{
                            text:"Fabriquer de la meth"
                            , consequenceText:"On se croit dans breaking bad ? Et vous allez la vendre a qui maintenant ?"
                            , consequenceImage:"https://scitechdaily.com/images/Underground-Drug-Lab.jpg"
                            , consequences:{karma:-6,pervers:2,promotion:1,possessions:{nom:"15g de methadone bleutée",valeur:500}}
                        },{
                            text:"Fabriquer un aphrodisiaque"
                            , consequenceText:"Ca marche du tonnerre, et ca se vend sous le manteau comme des petits pains. Faudra noter la recette, ici l'effet d'une pincee sur la secretaire a l'accueil"
                            , consequences:{argent:800,karma:-2,social:2,promotion:2,pervers:1}
                            , consequenceImage:"https://el.phncdn.com/gif/40202361.gif"
                        }
                    ]
                }
            ]
          },{
            "branche": "commerce",
            "nom": "Chauffeur",
            "description": "Transport de marchandises par camion",
            "nbPersonnes": 8,
            "promotion": 0,prerequis:{fullTime:true,voiture:true},
            "rangs": [" débutant", " expérimenté", " senior", "routier international"],
            "salaire": 18,
            activites:[
                {
                    nom:"Prendre une auto-stoppeuse", icon:"ThumbUp"
                    , text:"Vous decidez de prendre une auto-stoppeuse, histoire d'egayer un peu le parcours."
                    , options:[
                       { 
                        text:"Bonjour ma petite dame, je vous depose où ?"
                        , consequenceText:"Vous pouvez me laisser a la prochaine ville, merci. (Vous soignez votre karma)"
                        , consequences:{karma:5,social:2,pervers:-1,violent:-1}
                     },{ 
                        text:"Vous prenez des risques, je pourrai etre un pervers"
                        , consequenceText:"La fille sourit et vous repond que vous n'en avez pas l'air"
                        , options:[
                            {
                                text:"Vous avez raison, je n'en suis pas un."
                                , consequenceText:"Dommage, parce que moi je suis une grosse cochonne..."
                                , consequences:{karma:1,bonheur:2,social:1,pervers:-2,violent:-2}
                                , consequenceImage:"https://porngif.co/wp-content/uploads/2021/05/2777-in-a-truck.gif"
                            }
                            ,{
                                text:"Et pourtant..."
                                , consequenceText:"Prevenue, la fille accepte de vous donner son cul a la prochaine pause"
                                , consequences:{karma:3,bonheur:3,social:2,pervers:4,violent:4,promotion:1}
                                , consequenceImage:"https://analporngifs.com/content/2022/09/arse-fuck-in-a-truck_001.gif"
                            }
                        ]
                     },{ 
                        text:"Je veux bien vous deposer ou vous voulez, mais il me faudra une compensation"
                        , consequenceText:"C'est bien normal... Tout de suite ou a l'arrivee ?"
                        , consequences:{karma:3,social:2,pervers:2,bonheur:4}
                        , consequenceImage:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOP12YXP3rclbl9DTWROMCxc_mFbTps887sg&usqp=CAU"
                     }
                    ]
                },{
                    nom:"Recuperer ce qui tombe du camion", icon:"LocalShipping"
                    , text:"Vous decidez de detourner un peu de la marchandise que vous transportez dans votre interet personnel..."
                    , chance:0.5, chanceOn:"intelligent"
                    , consequenceTextOK:"Vous avez reussi a recuperer et revendre une partie de votre marchandise sans vous faire prendre, bien vu"
                    , consequencesOK:{argent:2000, karma:-10,bonheur:2}
                    , consequenceTextNOK:"Vous vous etes fait choper, pas tres malin, vous etes virés"
                    , consequencesNOK:{argent:-100, karma:-10,bonheur:-2, social:-2,violent:2,promotion:-100}
                }
            ]
          },{
            "branche": "fonctionnaire",
            "nom": "Policier",
            "description": "Service d'ordre privé aussi",
            "nbPersonnes": 6,
            "promotion": 0,prerequis:{fullTime:true,diplome:'social',voiture:true},
            "rangs": ["Agent de circulation", "Inspecteur", "Lieutenant ", "Commissaire","Prefet de police"],
            "salaire": 25
            , activites:[
                {
                    nom:"User de son autorité"
                    , text:"Parmi les privileges du policer, on trouve..."
                    , options:[
                        {
                            text:"Controle d'identite a la gueule du client"
                            , consequenceImage:"https://el.phncdn.com/gif/45816081.gif"
                            , consequenceText:"Ca fait toujours plaisir de se venger. Alors ma petite dame, vous avez le ticket de caisse pour ca ?"
                            , consequences:{karma:-2,social:1,pervers:1,violent:2,promotion:1}
                        }
                        , {
                            text:"S'amuser avec les armes des suspects"
                            , condition:{sex:"F"}
                            , consequenceText:"C'est une arme de 1ere categorie, ca non ?"
                            , consequences:{bonheur:2,pervers:2, enceinte:0.1}
                            , consequenceImage:"https://el.phncdn.com/gif/13659302.gif"
                        }, {
                            text:"Faire passer des interrogatoires musclés"
                            , condition:{sex:"M"}
                            , consequenceText:"Faut ce qu'il faut, n'empeche que ca marche, elles avouent toutes etre des salopes?"
                            , consequences:{bonheur:2,violent:5,pervers:5}
                            , consequenceImage:"https://el.phncdn.com/gif/15884732.gif"
                        }
                    ]
                }
            ]
          }
          
     ]
     ,exception:[{
        branche:'easyMode', nom:"Rentier", prerequis:{argent:100000}, description:"Apres quand on est riche, est-ce bien la peine de chercher du boulot?"
        , nbPersonnes:1
        , promotion:0, rangs:['Jeune con', 'Sale con','Vieux con'], salaire:50
        , activites:[{...soubrette}]
    }, {
        "branche": "archéologie",
        "nom": "Archéologue",
        "description": "Exploration des vestiges submergés de civilisations anciennes",
        "nbPersonnes": 4,
        "promotion": 0,prerequis:{diplome:'archeologie'},
        "rangs": ["Plongeur", "Spécialiste en fouilles", " émérite", "Directeur de recherche"],
        "salaire": 50
      },
      {
        "branche": "recherche",
        "nom": "Nasa",
        "description": "Voyages interstellaires et exploration de nouvelles frontières",
        "nbPersonnes": 3,
        "promotion": 0,prerequis:{intelligent:90},
        "rangs": ["Testeur de crash", "Explorateur débutant", "Spationaute amateur", "Cosmonaute rodé","Taikonaute chevronné", "Astronaute émérite", "Heros national"],
        "salaire": 80
      },
      {
        "branche": "automobile",
        "nom": "Pilote ",
        "description": "Des bons reflexes et une bonne assurance tous-risques et vous etes prets",
        "nbPersonnes": 5,
        "promotion": 0,prerequis:{voiture:true,argent:50000},
        "rangs": ["Chauffeur", "Kart expert", "Pilote en F3000", "Pilote d'essai", "Pilote de F1"],
        "salaire": 45
      }]
}


