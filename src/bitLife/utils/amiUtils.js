const generateJobAccroches=()=>{
  const accroches = [
    { question: "Parlez-moi de vous.", options: ["Je suis un professionnel motivé avec une passion pour...", "Je suis né à...", "Je suis une personne dynamique et créative."] },
    { question: "Quels sont vos principaux points forts?", options: ["Je suis très organisé et axé sur les résultats.", "Ma capacité à travailler en équipe et à motiver les autres.", "Ma forte compétence technique dans..."] },
    { question: "Quels sont vos principaux points faibles?", options: ["Je suis parfois trop critique envers moi-même.", "J'ai du mal à déléguer des tâches.", "Je peux être trop perfectionniste."] },
    { question: "Où vous voyez-vous dans cinq ans?", options: ["J'aspire à occuper un rôle de leadership dans l'entreprise.", "Je souhaite acquérir de nouvelles compétences et évoluer dans mon domaine.", "Je veux contribuer de manière significative au succès de l'entreprise."] },
    { question: "Pourquoi devrions-nous vous embaucher?", options: ["Mes compétences et mon expérience correspondent parfaitement à ce poste.", "Je suis passionné par l'industrie et prêt à apporter une valeur ajoutée.", "Mon engagement envers l'apprentissage continu me distingue des autres candidats."] },
    { question: "Parlez-moi d'une situation difficile que vous avez dû gérer au travail.", options: ["Lorsque mon équipe a rencontré des difficultés, j'ai organisé des sessions de brainstorming pour trouver des solutions.", "J'ai géré un client mécontent en le rassurant et en trouvant une solution satisfaisante.", "Je suis intervenu efficacement lorsqu'il y avait des tensions au sein de l'équipe."] },
    { question: "Quelles sont vos attentes salariales?", options: ["Je suis ouvert à la discussion, mais je m'attends à une rémunération compétitive pour mes compétences et mon expérience.", "Je préfère discuter de la rémunération une fois que nous aurons déterminé que je suis le candidat idéal pour le poste.", "Je recherche un salaire qui reflète la valeur que je peux apporter à l'entreprise."] },
    { question: "Parlez-moi d'un projet dont vous êtes particulièrement fier.", options: ["J'ai dirigé avec succès un projet qui a augmenté les ventes de l'entreprise de X %.", "J'ai développé une nouvelle fonctionnalité qui a amélioré l'efficacité opérationnelle de l'équipe.", "J'ai collaboré à un projet qui a remporté un prix pour l'innovation."] },
    { question: "Comment réagissez-vous sous pression?", options: ["Je garde mon calme et je me concentre sur la résolution de problèmes.", "Je communique clairement avec mon équipe pour minimiser le stress.", "Je m'organise méthodiquement pour gérer efficacement la pression."] },
    { question: "Pourquoi avez-vous quitté votre dernier emploi?", options: ["Je cherchais de nouvelles opportunités et un défi professionnel plus stimulant.", "La société a subi des changements structurels, ce qui a affecté mon rôle.", "J'ai décidé de quitter volontairement pour me concentrer sur le développement de compétences spécifiques."] },
    { question: "Comment collaborez-vous avec vos collègues?", options: ["Je favorise une communication ouverte et transparente.", "Je m'assure de comprendre les compétences de chacun pour optimiser la collaboration.", "Je suis prêt à aider mes collègues et à partager mes connaissances."] },
    { question: "Qu'est-ce qui vous motive dans votre travail?", options: ["La possibilité de résoudre des problèmes complexes.", "La chance de contribuer à des projets innovants.", "La satisfaction de voir les résultats positifs de mon travail."] },
    { question: "Parlez-moi d'une situation où vous avez dû faire preuve de créativité.", options: ["J'ai proposé une idée novatrice qui a amélioré les processus internes de l'entreprise.", "J'ai résolu un problème complexe en utilisant une approche créative.", "J'ai développé une campagne marketing originale qui a augmenté la visibilité de la marque."] },
    { question: "Comment maintenez-vous vos compétences à jour?", options: ["Je participe régulièrement à des formations et des cours.", "Je suis actif sur des plateformes en ligne pour rester informé des dernières tendances.", "Je recherche activement des opportunités d'apprentissage continu."] },
    { question: "Si vous étiez un animal, lequel seriez-vous?", options: ["Un aigle pour avoir une vue d'ensemble.", "Un caméléon pour m'adapter à toutes les situations.", "Un panda pour maîtriser l'art de la sieste."] },
  { question: "Si vous pouviez avoir un superpouvoir, lequel choisiriez-vous?", options: ["La téléportation pour éviter les embouteillages.", "La télépathie pour comprendre les besoins de mes collègues.", "La capacité de faire pousser de l'argent sur les arbres."] },
  { question: "Quel est votre plat préféré?", options: ["Les sushis, une explosion de saveurs.", "La pizza, un classique réconfortant.", "Les spaghettis aux boulettes de viande, comme dans les films italiens."] },
  { question: "Si vous deviez être un personnage fictif, qui seriez-vous?", options: ["Sherlock Holmes, pour ma logique imparable.", "Wonder Woman, pour la force et la sagesse.", "SpongeBob SquarePants, pour la bonne humeur constante."] },
  { question: "Quel est le dernier livre que vous avez lu?", options: ["Un best-seller sur la croissance personnelle.", "Un thriller captivant qui m'a tenu éveillé toute la nuit.", "Le mode d'emploi de ma nouvelle cafetière."] },
  { question: "Si vous étiez une couleur, laquelle seriez-vous?", options: ["Le bleu, symbole de confiance et de stabilité.", "Le rouge, pour l'énergie et la passion.", "Le violet, parce que pourquoi pas?"] },
  { question: "Quelle est votre chanson préférée?", options: ["Une ballade romantique intemporelle.", "Un tube pop entraînant qui met de bonne humeur.", "Le jingle de la pub de mon produit préféré."] },
  { question: "Si vous pouviez dîner avec n'importe qui, mort ou vivant, qui choisiriez-vous?", options: ["Albert Einstein, pour discuter de théories de la relativité.", "Oprah Winfrey, pour obtenir des conseils inspirants.", "Le chef du restaurant du coin, pour des recommandations de menu."] },
  { question: "Quel superméchant seriez-vous?", options: ["Le Maître du Chaos, pour semer la confusion.", "La Reine des Glaces, pour maîtriser la cryogénie.", "Le Roi des Farces, pour des plaisanteries inoffensives."] },
  { question: "Si vous étiez un instrument de musique, lequel seriez-vous?", options: ["Un piano, pour la polyvalence musicale.", "Une guitare électrique, pour le rock et l'énergie.", "Un ukulélé, pour la légèreté et la bonne humeur."] }
  ]
    
  // const accrochesArray = accroches.map((accroche) => ({
  //   entretien: accroche,
  //   success: Math.random() < 0.3,
  // }));

  return accroches;
  
}
const generateAccroches = () => {
    const accroches = [
      "Hey, j'apprécie vraiment ton énergie positive ! On pourrait devenir amis ?",
      "Tu sembles être une personne formidable. On pourrait partager des moments sympas ensemble en tant qu'amis ?",
      "J'ai vraiment aimé nos conversations jusqu'à présent. Ça te dirait d'être mon ami ?",
      "On a tellement d'intérêts communs ! Devenir amis serait génial, non ?",
      "J'aime bien ton style ! On devrait être amis, non ?",
      "C'est peut-être un peu direct, mais je pense qu'on pourrait être de super amis. Qu'en dis-tu ?",
      "On a déjà tant de souvenirs ensemble, même si on n'était pas encore amis. Devenons officiellement amis !",
      "Les amis sont comme les étoiles. On ne les voit peut-être pas tout le temps, mais on sait qu'ils sont toujours là. Devenons des étoiles ensemble !",
      "La vie est trop courte pour ne pas avoir assez d'amis. Ça te dirait d'en gagner un de plus ?",
      "On a un pourcentage élevé de compatibilité amicale. Faisons en sorte que ça se concrétise !",
      "J'ai entendu dire que devenir amis avec toi était une excellente décision. Confirmes-tu cette rumeur ?",
      "Les amis sont comme des trèfles à quatre feuilles. Ça porte chance !",
      "On pourrait être les meilleures équipes de jeu ensemble. Qu'en penses-tu d'une alliance amicale ?",
      "Les oiseaux du même nid volent ensemble. On pourrait voler ensemble vers de nouvelles amitiés ?",
      "Devenir amis, c'est comme obtenir une promotion dans la vie. Ça te dit une promotion amicale ?",
      "On devrait peut-être officialiser notre amitié. Qu'en penses-tu d'un pacte amical ?",
      "La vie est trop courte pour ne pas avoir un ami comme toi. Acceptes-tu ma demande d'amitié ?",
      "On dit que les amis sont comme des étoiles. On ne les voit pas toujours, mais on sait qu'ils sont là. Soyons des étoiles ensemble !",
      "J'ai besoin d'un nouveau compagnon de blagues. Veux-tu être mon partenaire comique ?",
      "Les amis sont comme des licornes. On n'en trouve pas partout, mais quand on en trouve un, c'est magique !",
      "On a une chance de devenir de super amis. On tente le coup ?",
      // Phrases pour rigoler (vouées à l'échec)
      "Es-tu une caméra ? Parce que chaque fois que je te regarde, je souris.",
      "Si l'amitié était une maladie, tu serais une épidémie.",
      "Es-tu un parking ? Parce que j'ai l'impression que j'ai frappé un jackpot.",
      "C'est peut-être le destin qui nous réunit. Ou peut-être juste la navigation par satellite.",
      "Est-ce que tu es une carte au trésor ? Parce que je me perds dans tes yeux.",
      "Si on était des fruits, on serait une paire.",
      "Si on était des légumes, on serait des petits pois et carottes.",
      "Tu crois au coup de foudre amical, ou je dois repasser ?",
      "Est-ce que tu es Google ? Parce que tu as tout ce que je recherche.",
      "Est-ce que tu es une étoile filante ? Parce que je ferais un vœu pour être ton ami.",
      "Si j'étais un chat, je passerais toutes mes vies à être ton ami.",
    ];
  
    const accrochesArray = accroches.map((accroche) => ({
      text: accroche,
      success: Math.random() < 0.5,
    }));
  
    return accrochesArray;
  };
  
  
  
  // Fonction pour obtenir 4 accroches au hasard
  export const getRandomAccroches = (perso, pnj, pourTravail) => {
    const accroches = pourTravail?generateJobAccroches():generateAccroches();
    const randomAccroches = [];
  
    while (randomAccroches.length < 4 && accroches.length > 0) {
      const randomIndex = Math.floor(Math.random() * accroches.length);
      const accrocheAuHasard = accroches.splice(randomIndex, 1)[0];
      if(perso!=null&&pnj!=null){
        accrocheAuHasard.success = perso.tenteChance(1,'empathie',pnj);
      }
      randomAccroches.push(accrocheAuHasard);
    }
  
    return randomAccroches;
  };
  