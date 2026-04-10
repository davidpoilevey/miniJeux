import { useCallback, useEffect, useMemo, useState } from "react";

// ─── Mobile detection ──────────────────────────────────────────────────────

export const useIsMobile = (breakpoint = 600) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
};

export const IfMobile = ({ children }) => useIsMobile() ? children : null;
export const IfNotMobile = ({ children }) => !useIsMobile() ? children : null;

// Hook pour récupérer tous les tags avec leur nombre d'occurrences
export const useTagsWithCounts = (gamesData, searchQuery = '', selectedTags = []) => {
  return useMemo(() => {
    // Aplatir tous les jeux
    const allGames = gamesData.flatMap(group => 
      group.jeux.map(jeu => ({
        ...jeu,
        categorie: group.categorie,
        isMiniJeux: group.isMiniJeux || false
      }))
    );

    // Filtrer par recherche et tags sélectionnés (pour le comptage dynamique)
    const filteredBySearch = allGames.filter(jeu => {
      const matchSearch = searchQuery === '' || 
        jeu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (jeu.description && jeu.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchSearch;
    });

    // Compter les occurrences de chaque tag dans les jeux filtrés
    const tagCounts = {};
    
    filteredBySearch.forEach(jeu => {
      if (jeu.tags) {
        jeu.tags.forEach(tag => {
          // Si le tag n'est pas dans les tags sélectionnés, on compte
          // Si le tag EST sélectionné, on vérifie que TOUS les autres tags sélectionnés sont présents
          const otherSelectedTags = selectedTags.filter(t => t !== tag);
          const hasOtherTags = otherSelectedTags.length === 0 || 
            otherSelectedTags.every(t => jeu.tags.includes(t));
          
          if (hasOtherTags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });

    // Retourner un tableau trié avec tag et count
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag?.localeCompare(b.tag));
  }, [gamesData, searchQuery, selectedTags]);
};

// Hook pour filtrer les jeux par recherche et tags
export const useFilteredGames = (gamesData, searchQuery, selectedTags) => {
  return useMemo(() => {
    // Aplatir tous les jeux avec leur catégorie
    const allGames = gamesData.flatMap(group => 
      group.jeux.map(jeu => ({
        ...jeu,
        categorie: group.categorie,
        isMiniJeux: group.isMiniJeux || false
      }))
    );

    // Filtrer selon la recherche et les tags
    return allGames.filter(jeu => {
      // Filtre de recherche (nom ou description)
      const matchSearch = searchQuery === '' || 
        jeu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (jeu.description && jeu.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtre par tags (le jeu doit avoir TOUS les tags sélectionnés)
      const matchTags = selectedTags.length === 0 || 
        (jeu.tags && selectedTags.every(tag => jeu.tags.includes(tag)));
      
      return matchSearch && matchTags;
    });
  }, [gamesData, searchQuery, selectedTags]);
};

// Hook pour obtenir toutes les catégories uniques
export const useCategories = (gamesData) => {
  return [...new Set(gamesData.map(group => group.categorie))];
};
export const useCategoriesMetadata = (gamesData) => {
  return useMemo(() => {
    const metadata = new Map();
    
    gamesData.forEach(group => {
      metadata.set(group.categorie, {
        isMiniJeux: group.isMiniJeux || false,
        count: group.jeux.length
      });
    });
    
    return metadata;
  }, [gamesData]);
};
export const useIsMiniJeux = (gamesData) => {
  const metadata = useCategoriesMetadata(gamesData);
  
  return useCallback((categorie) => {
    return metadata.get(categorie)?.isMiniJeux || false;
  }, [metadata]);
};
export const useCategoryCount = (gamesData) => {
  const metadata = useCategoriesMetadata(gamesData);
  
  return useCallback((categorie) => {
    return metadata.get(categorie)?.count || 0;
  }, [metadata]);
};

// useProgression.js

export default function useProgression(gamesData, selectedApp) {
  const [playedGames, setPlayedGames] = useState(() => {
    const saved = localStorage.getItem('playedGames');
    return saved ? JSON.parse(saved) : [];
  });

  // Quand on lance un nouveau jeu
  useEffect(() => {
    if (selectedApp && selectedApp.name) {
      setPlayedGames(prev => {
        const alreadyPlayed = prev.includes(selectedApp.name);
        if (alreadyPlayed) return prev;
        const updated = [...prev, selectedApp.name];
        localStorage.setItem('playedGames', JSON.stringify(updated));
        return updated;
      });
    }
  }, [selectedApp]);

  const total = gamesData.flatMap(gr=>gr.jeux).length;
  const played = playedGames.length;
  const progress = total > 0 ? Math.round((played / total) * 100) : 0;

  return { played, total, progress };
}

/**
 * useRandomGame
 * Tire un jeu au hasard dans la liste fournie,
 * en tenant compte du poids "favori" (facultatif, valeur entre 0 et 1)
 */
export const useRandomGame = (gamesData) => {
  const getRandomGame = useCallback(() => {
    if (!gamesData || gamesData.length === 0) return null;

    // Si certains jeux ont un "favori", on les pondère
    const _weightedGames = gamesData.flatMap((allCat) => allCat.jeux);
    const weightedGames = _weightedGames.flatMap((game) => {
      const weight = 1 + (game.favori || 0) * 3; // favori=1 → ×4 de chance
      return Array.from({ length: Math.round(weight * 10) }, () => game);
    });

    const randomIndex = Math.floor(Math.random() * weightedGames.length);
    return weightedGames[randomIndex];
  }, [gamesData]);

  return { getRandomGame };
};


// fakeReviews.js
const names = [
  'JeanPixel', 'ChatGPT', 'Claude-4', 'Perplexity-AI', 'Deep-Seek', '@DonalTrump', 'Elon_Musk', 'LinusTorvalds'
  , 'GraceHopper', 'AlanTuring', 'ChatGPT-4.5', 'LinusTech', 'CodeMaster3000', 'ChatGPT-3.2'
  , 'CarolWerle', 'LeChatDuDev', 'TontonJS', 'Princess404', 'Maman',
  'David_42', 'LoutreBinaire', 'GamerduDimanche', 'Ada_Lovelace', 'JeuxVideo.com'
];

const templates = [
  "Une expérience transcendantale, j’en ai rêvé toute la nuit.",
  "Ce jeu a changé ma vision du React. Littéralement.",
  "Tellement addictif que j’ai raté mon train.",
  "Un bijou de gameplay minimaliste. Bravo à l’auteur !",
  "On devrait l’enseigner à l’école.",
  "Une œuvre d’art déguisée en mini-jeu.",
  "Mon processeur a chauffé, mais mon cœur aussi.",
  "Je pensais juste tester 2 minutes, et me voilà 3 heures plus tard.",
  "Un code tellement propre qu’on pourrait manger dessus.",
  "Le genre de jeu qu’on ne mérite pas, mais dont on avait besoin.",
  "Une expérience transcendantale, j’en ai rêvé toute la nuit.",
  "J'ai été payé pour dire du bien, pas vous ?",
  "Du pur génie !", "JH 37a rch. JF 20-50 pr sx et + si aff.",
  "Quelle horreur absolue, mais impossible de décrocher.",
  "Au secours, j'ai chopé un cancer des yeux tellement c'est moche.",
  "Ce jeu a changé ma vision du monde… ou au moins de mon navigateur.",
  "Léonard de Vinci aurait ragequit.",
  "On sent la sueur, le code spaghetti et la passion. J’adore.",
  "J'ai cliqué par erreur, maintenant je suis accro.",
  "Mon chat a marché sur le clavier, il a gagné. Incroyable.",
  "C’est moche, lent, buggé… et pourtant, c’est de l’art.",
  "Plus addictif que le sucre. Ou la honte.",
  "Le jeu qui m’a fait douter de mes choix de vie. Bravo.",
  "Je ne sais pas si c’est un bug ou une feature, mais j’applaudis.",
  "Une masterclass de pixel et de désespoir.",
  "C’est un peu comme si un rêve et un cauchemar avaient eu un enfant.",
  "Le genre de jeu qu’on veut détester, mais qu’on finit par aimer.",
  "On dirait un jeu des années 80… programmé hier soir à 2h du matin.",
  "Les graphismes m’ont fait pleurer. Littéralement.",
  "J’ai entendu des anges chanter quand j’ai cliqué sur 'Start'.",
  "Une claque émotionnelle et visuelle. Enfin surtout émotionnelle.",
  "Si la perfection existait, ce jeu l’aurait presque frôlée de loin.",
  "J’y ai joué cinq minutes, puis ma vie n’a plus jamais été la même.",
  "Je pense que mon navigateur souffre, mais ça en vaut la peine.",
  "Un bijou brut. Très brut. Genre caillou brut.",
  "J’ai connu des rêves moins étranges.",
  "J’en parle encore à mon psy.", 
  "Je ne sais pas si c’est un jeu ou une performance artistique, mais chapeau.",
  "C’est comme si Picasso avait codé un jeu vidéo.",
  "Je ne sais pas si je dois rire, pleurer, ou recommencer une partie.",
  "Un chef-d’œuvre de confusion et de pixels.",
  "Mon cerveau a fait un reboot, mais j’ai adoré.",
  "Je ne sais pas si c’est un jeu ou une expérience spirituelle.",
  "J’ai perdu foi en l’humanité… mais gagné un high score.",
  "Ce jeu mériterait une récompense, ou au moins des excuses.",
  "Je ne sais pas si je dois rire, pleurer, ou recommencer une partie.",
  "C’est tellement WTF que ça en devient génial.",
  "Le code transpire la passion… et un peu la panique.",
  "On sent que chaque pixel a été posé avec une larme.",
  "Si l’art devait avoir un bug, ce serait celui-là.",
  "Je n’ai pas compris, mais j’ai ressenti quelque chose.",
  "Une œuvre à mi-chemin entre le génie et l’accident de parcours.",
  "Impossible de dire si c’est un jeu ou une expérience spirituelle.",
  "Un gameplay si profond qu’il m’a aspiré dans le néant.",
  "J’ai perdu foi en l’humanité… mais gagné un high score.",
  "Une performance digne d’un festival expérimental sous acide.",
  "Je n’aurais jamais cru dire ça, mais… wow.",
];


const ratings = [3, 4, 5];

export function getRandomReview() {
  const name = names[Math.floor(Math.random() * names.length)];
  const text = templates[Math.floor(Math.random() * templates.length)];
  const stars = ratings[Math.floor(Math.random() * ratings.length)];

  const starString = "⭐".repeat(stars) + (stars < 5 ? "☆".repeat(5 - stars) : "");

  return {
    name,
    text,
    stars: starString
  };
}
