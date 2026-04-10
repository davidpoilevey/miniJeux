import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';
import { StarBorder } from '@mui/icons-material';
import HaikuSelectors from './HaikuSelector';


const HaikuGarden = () => {
  const [floatingWords, setFloatingWords] = useState([]);
  const [haikuLines, setHaikuLines] = useState([[], [], []]);
  const [completedHaikus, setCompletedHaikus] = useState([]);
  const [celebrating, setCelebrating] = useState(false);

  // Base de mots avec associations sémantiques
/* Base de mots avec thèmes
sombre, nuit, mystère, lumineux, ciel, printemps, nature, doux, léger, air, eau, infini, mouvement, terre, arbre, automne, hiver, été, aube, jour, chaud, paix, introspection, visage, profond, corps, mélancolie, joie, temps, silence, pur.
*/
const wordDatabase = {
  noms: [
    { word: 'nuit', syllables: 1, themes: ['sombre', 'nuit', 'mystère'] },
    { word: 'étoile', syllables: 2, themes: ['nuit', 'lumineux', 'ciel'] },
    { word: 'lune', syllables: 1, themes: ['nuit', 'lumineux', 'mystère'] },
    { word: 'fleur', syllables: 1, themes: ['printemps', 'nature', 'doux'] },
    { word: 'pétale', syllables: 2, themes: ['printemps', 'nature', 'doux', 'léger'] },
    { word: 'cerisier', syllables: 3, themes: ['printemps', 'nature', 'arbre'] },
    { word: 'vent', syllables: 1, themes: ['air', 'nature', 'léger'] },
    { word: 'pluie', syllables: 1, themes: ['eau', 'nature', 'doux'] },
    { word: 'mer', syllables: 1, themes: ['eau', 'nature', 'infini'] },
    { word: 'vague', syllables: 1, themes: ['eau', 'nature', 'mouvement'] },
    { word: 'montagne', syllables: 2, themes: ['terre', 'nature', 'haut'] },
    { word: 'rivière', syllables: 3, themes: ['eau', 'nature', 'mouvement'] },
    { word: 'feuille', syllables: 1, themes: ['nature', 'automne', 'léger'] },
    { word: 'branche', syllables: 1, themes: ['arbre', 'nature', 'hiver'] },
    { word: 'oiseau', syllables: 2, themes: ['air', 'nature', 'léger'] },
    { word: 'papillon', syllables: 3, themes: ['air', 'nature', 'léger', 'été'] },
    { word: 'nuage', syllables: 2, themes: ['air', 'ciel', 'doux', 'léger'] },
    { word: 'aurore', syllables: 2, themes: ['aube', 'lumineux', 'jour'] },
    { word: 'crépuscule', syllables: 3, themes: ['crépuscule', 'sombre', 'mystère'] },
    { word: 'soleil', syllables: 2, themes: ['jour', 'lumineux', 'chaud'] },
    { word: 'ombre', syllables: 1, themes: ['sombre', 'mystère', 'nuit'] },
    { word: 'silence', syllables: 2, themes: ['paix', 'nuit', 'introspection'] },
    { word: 'rêve', syllables: 1, themes: ['introspection', 'nuit', 'mystère'] },
    { word: 'songe', syllables: 1, themes: ['introspection', 'nuit', 'doux'] },
    { word: 'pensée', syllables: 2, themes: ['introspection', 'léger', 'air'] },
    { word: 'âme', syllables: 1, themes: ['introspection', 'mystère', 'profond'] },
    { word: 'souffle', syllables: 1, themes: ['air', 'doux', 'corps'] },
    { word: 'larme', syllables: 1, themes: ['eau', 'mélancolie', 'corps'] },
    { word: 'sourire', syllables: 2, themes: ['joie', 'visage', 'lumineux'] },
    { word: 'regard', syllables: 2, themes: ['visage', 'introspection', 'mystère'] },
    { "word": "forêt", "syllables": 2, "themes": ["nature", "terre", "sombre"] },
    { "word": "rivage", "syllables": 2, "themes": ["eau", "mouvement", "doux"] },
    { "word": "crête", "syllables": 1, "themes": ["montagne", "vent", "terre"] },
    { "word": "marée", "syllables": 2, "themes": ["eau", "mouvement", "lune"] },
    { "word": "tempête", "syllables": 2, "themes": ["air", "mouvement", "automne"] },
    { "word": "prairie", "syllables": 2, "themes": ["nature", "printemps", "doux"] },
    { "word": "rayon de soleil", "syllables": 4, "themes": ["lumineux", "chaud", "jour"] },
    { "word": "lueur", "syllables": 2, "themes": ["lumineux", "nuit", "mystère"] },
    { "word": "scintillation", "syllables": 4, "themes": ["lumineux", "air", "mouvement"] },
    { "word": "crépuscule doré", "syllables": 5, "themes": ["crépuscule", "lumineux", "automne"] },
    { "word": "été", "syllables": 2, "themes": ["été", "chaud", "joie"] },
    { "word": "automne", "syllables": 2, "themes": ["automne", "mélancolie", "terre"] },
    { "word": "hiver", "syllables": 2, "themes": ["hiver", "froid", "silence"] },
    { "word": "joie", "syllables": 1, "themes": ["joie", "chaud", "visage"] },
    { "word": "tristesse", "syllables": 2, "themes": ["mélancolie", "introspection", "corps"] },
    { "word": "excitation", "syllables": 4, "themes": ["mouvement", "joie", "air"] },
    { "word": "nervosité", "syllables": 4, "themes": ["corps", "mouvement", "tension"] },
    { "word": "fascination intense", "syllables": 6, "themes": ["introspection", "mystère", "profond"] },
    { "word": "instant", "syllables": 2, "themes": ["temps", "fugace", "doux"] },
    { "word": "passé", "syllables": 2, "themes": ["temps", "lointain", "mélancolie"] },
    { "word": "futur", "syllables": 2, "themes": ["temps", "incertain", "léger"] },
    { "word": "cycle", "syllables": 2, "themes": ["temps", "éternel", "nature"] },
    { "word": "douceur", "syllables": 2, "themes": ["doux", "paix", "corps"] },
    { "word": "rudesse", "syllables": 2, "themes": ["terre", "froid", "corps"] },
    { "word": "fraîcheur", "syllables": 2, "themes": ["froid", "air", "revigorant"] },
    { "word": "chaleur", "syllables": 2, "themes": ["chaud", "doux", "corps"] },
    { "word": "froidure", "syllables": 2, "themes": ["hiver", "froid", "piquant"] },
    { "word": "peau", "syllables": 1, "themes": ["corps", "douceur", "intime"] },
    { "word": "muscle", "syllables": 1, "themes": ["corps", "puissant", "mouvement"] },
    { "word": "viscère", "syllables": 2, "themes": ["corps", "profond", "vital"] }
  ],
  verbes: [
    { word: 'fleurit', syllables: 2, themes: ['printemps', 'nature', 'naître'] },
    { word: 'tombe', syllables: 2, themes: ['automne', 'mouvement', 'mélancolie'] },
    { word: 'brille', syllables: 1, themes: ['lumineux', 'jour', 'joie'] },
    { word: 'danse', syllables: 1, themes: ['mouvement', 'joie', 'léger'] },
    { word: 'chante', syllables: 2, themes: ['joie', 'nature', 'air'] },
    { word: 'dort', syllables: 1, themes: ['nuit', 'paix', 'introspection'] },
    { word: 'rêve', syllables: 1, themes: ['introspection', 'nuit', 'mystère'] },
    { word: 'coule', syllables: 1, themes: ['eau', 'mouvement', 'doux'] },
    { word: 'souffle', syllables: 2, themes: ['air', 'doux', 'mouvement'] },
    { word: 'naît', syllables: 1, themes: ['printemps', 'jour', 'joie'] },
    { word: 'finit', syllables: 2, themes: ['crépuscule', 'automne', 'mélancolie'] },
    { word: 'éclot', syllables: 2, themes: ['printemps', 'nature', 'naître'] },
    { word: 'vole', syllables: 1, themes: ['air', 'léger', 'nature'] },
    { word: 'glisse', syllables: 2, themes: ['mouvement', 'doux', 'eau'] },
    { word: 'murmure', syllables: 3, themes: ['doux', 'mystère', 'air'] },
    { word: 'scintille', syllables: 3, themes: ['lumineux', 'nuit', 'eau'] },
    { word: 'flotte', syllables: 2, themes: ['air', 'eau', 'léger'] },
    { word: 'attend', syllables: 2, themes: ['paix', 'introspection', 'temps'] },
    { word: 'passe', syllables: 2, themes: ['temps', 'mouvement', 'mélancolie'] },
    { word: 'berce', syllables: 2, themes: ['doux', 'mouvement', 'paix'] },
    { word: 'médite', syllables: 3, themes: ['introspection', 'paix', 'silence'] },
    { word: 'contemple', syllables: 3, themes: ['introspection', 'paix', 'mystère'] },
    { word: 'espère', syllables: 3, themes: ['joie', 'introspection', 'lumineux'] },
    { word: 'pleure', syllables: 2, themes: ['mélancolie', 'eau', 'corps'] },
    { word: 'sourit', syllables: 2, themes: ['joie', 'lumineux', 'visage'] },
        { "word": "ruisselle", "syllables": 3, "themes": ["eau", "mouvement", "doux"] },
    { "word": "frissonne", "syllables": 3, "themes": ["froid", "corps", "air"] },
    { "word": "s’élève", "syllables": 3, "themes": ["air", "mouvement", "ciel"] },
    { "word": "résonne", "syllables": 3, "themes": ["air", "introspection", "mystère"] },
    { "word": "brûle", "syllables": 1, "themes": ["feu", "chaud", "été"] },
    { "word": "cascade", "syllables": 2, "themes": ["eau", "mouvement", "énergie"] },
    { "word": "serpente", "syllables": 3, "themes": ["mouvement", "nature", "mystère"] },
    { "word": "s’efface", "syllables": 3, "themes": ["temps", "fugace", "introspection"] },
    { "word": "persiste", "syllables": 3, "themes": ["temps", "éternel", "introspection"] },
    { "word": "enlace", "syllables": 3, "themes": ["corps", "doux", "mouvement"] }

  ],
  adjectifs: [
    { word: 'doux', syllables: 1, themes: ['doux', 'paix', 'printemps'] },
    { word: 'calme', syllables: 1, themes: ['paix', 'silence', 'introspection'] },
    { word: 'silencieux', syllables: 3, themes: ['silence', 'paix', 'nuit'] },
    { word: 'argenté', syllables: 3, themes: ['lumineux', 'nuit', 'eau'] },
    { word: 'rose', syllables: 1, themes: ['printemps', 'doux', 'lumineux'] },
    { word: 'bleu', syllables: 1, themes: ['ciel', 'eau', 'froid'] },
    { word: 'vert', syllables: 1, themes: ['nature', 'printemps', 'terre'] },
    { word: 'blanc', syllables: 1, themes: ['hiver', 'lumineux', 'pur'] },
    { word: 'léger', syllables: 2, themes: ['léger', 'air', 'doux'] },
    { word: 'ancien', syllables: 2, themes: ['temps', 'mystère', 'terre'] },
    { word: 'nouveau', syllables: 2, themes: ['printemps', 'joie', 'naître'] },
    { word: 'sombre', syllables: 1, themes: ['sombre', 'nuit', 'mystère'] },
    { word: 'brillant', syllables: 2, themes: ['lumineux', 'joie', 'jour'] },
    { word: 'fragile', syllables: 2, themes: ['doux', 'léger', 'printemps'] },
    { word: 'éternel', syllables: 3, themes: ['temps', 'infini', 'mystère'] },
    { word: 'paisible', syllables: 2, themes: ['paix', 'silence', 'introspection'] },
    { word: 'pur', syllables: 1, themes: ['pur', 'lumineux', 'hiver'] },
    { word: 'doré', syllables: 2, themes: ['lumineux', 'chaud', 'automne'] },
    { word: 'profond', syllables: 2, themes: ['mystère', 'introspection', 'eau'] },
    { word: 'tendre', syllables: 1, themes: ['doux', 'printemps', 'joie'] },
    { word: 'mélancolique', syllables: 4, themes: ['mélancolie', 'introspection', 'automne'] },
    { word: 'serein', syllables: 2, themes: ['paix', 'introspection', 'ciel'] },
    { word: 'mystérieux', syllables: 4, themes: ['mystère', 'sombre', 'introspection'] },
     { "word": "ancienne", "syllables": 3, "themes": ["temps", "terre", "mystérieux"] },
    { "word": "escarpé", "syllables": 3, "themes": ["terre", "montagne", "mouvement"] },
    { "word": "montagneuse", "syllables": 4, "themes": ["terre", "hauteur", "nature"] },
    { "word": "haute", "syllables": 1, "themes": ["ciel", "hauteur", "air"] },
    { "word": "furieuse", "syllables": 3, "themes": ["air", "mouvement", "automne"] },
    { "word": "fleurie", "syllables": 2, "themes": ["nature", "printemps", "doux"] },
    { "word": "précoce", "syllables": 2, "themes": ["printemps", "naître", "temps"] },
    { "word": "torride", "syllables": 2, "themes": ["été", "chaud", "mouvement"] },
    { "word": "flamboyant", "syllables": 3, "themes": ["automne", "lumineux", "feu"] },
    { "word": "rigoureux", "syllables": 3, "themes": ["hiver", "froid", "silence"] },
    { "word": "explosive", "syllables": 3, "themes": ["joie", "mouvement", "air"] },
    { "word": "profonde", "syllables": 2, "themes": ["introspection", "eau", "mystère"] },
    { "word": "frénétique", "syllables": 4, "themes": ["mouvement", "air", "tension"] },
    { "word": "palpable", "syllables": 3, "themes": ["corps", "temps", "introspection"] },
    { "word": "intense", "syllables": 2, "themes": ["émotion", "introspection", "profond"] },
    { "word": "fugace", "syllables": 2, "themes": ["temps", "léger", "air"] },
    { "word": "lointain", "syllables": 2, "themes": ["temps", "mystère", "horizon"] },
    { "word": "incertain", "syllables": 3, "themes": ["temps", "nuit", "introspection"] },
    { "word": "éternel", "syllables": 3, "themes": ["temps", "infini", "mystère"] },
    { "word": "caressante", "syllables": 4, "themes": ["doux", "corps", "air"] },
    { "word": "abrasive", "syllables": 3, "themes": ["terre", "rugueux", "automne"] },
    { "word": "revigorante", "syllables": 5, "themes": ["air", "eau", "énergie"] },
    { "word": "embrassante", "syllables": 4, "themes": ["chaud", "doux", "corps"] },
    { "word": "piquante", "syllables": 3, "themes": ["hiver", "froid", "air"] },
    { "word": "douce", "syllables": 1, "themes": ["doux", "corps", "paix"] },
    { "word": "puissant", "syllables": 2, "themes": ["corps", "mouvement", "terre"] },
    { "word": "vital", "syllables": 2, "themes": ["corps", "profond", "mouvement"] }
  ]
};

const addAssociatedWords = (selectedWord) => {
  if (!selectedWord.themes || selectedWord.themes.length === 0) return;
  
  // Nombre de nouveaux mots à ajouter (1-2)
  const numNewWords = Math.random() > 0.5 ? 2 : 1;
  
  for (let i = 0; i < numNewWords; i++) {
    // Choisir un thème aléatoire parmi ceux du mot sélectionné
    const selectedTheme = selectedWord.themes[
      Math.floor(Math.random() * selectedWord.themes.length)
    ];
    
    // Trouver tous les mots qui partagent ce thème
    const matchingWords = [];
    for (const [category, words] of Object.entries(wordDatabase)) {
      for (const word of words) {
        // Vérifier que le mot partage au moins un thème ET n'est pas déjà affiché
        if (word.themes.includes(selectedTheme) && 
            !floatingWords.some(w => w.word === word.word) &&
            word.word !== selectedWord.word) {
          matchingWords.push({ ...word, category });
        }
      }
    }
    
    // Si on a trouvé des mots correspondants, en choisir un au hasard
    if (matchingWords.length > 0 && floatingWords.length < 12) {
      const randomWord = matchingWords[Math.floor(Math.random() * matchingWords.length)];
      
      setTimeout(() => {
        setFloatingWords(prev => {
          // Éviter les doublons
          if (prev.some(w => w.word === randomWord.word)) return prev;
          
          return [...prev, {
            id: Date.now() + Math.random(),
            ...randomWord,
            x: Math.random() * 70 + 15,
            y: Math.random() * 60 + 10,
            opacity: 0,
            scale: 0
          }];
        });
      }, 300 * i);
    }
  }
};

  const getColor = (category) => {
    switch(category) {
      case 'noms': return '#ef5350';
      case 'verbes': return '#42a5f5';
      case 'adjectifs': return '#66bb6a';
      default: return '#9e9e9e';
    }
  };

  const generateWords = () => {
    const words = [];
    const categories = Object.keys(wordDatabase);
    
    for (let i = 0; i < 8; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const wordList = wordDatabase[category];
      const wordData = wordList[Math.floor(Math.random() * wordList.length)];
      
      words.push({
        id: Date.now() + i,
        ...wordData,
        category,
        x: Math.random() * 70 + 15,
        y: Math.random() * 60 + 10,
        opacity: 1,
        scale: 1
      });
    }
    
    setFloatingWords(words);
  };

  useEffect(() => {
    generateWords();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFloatingWords(prev => prev.map(w => ({
        ...w,
        opacity: 1,
        scale: 1
      })));
    }, 100);
    return () => clearTimeout(timer);
  }, [floatingWords.length]);

  const countSyllables = (line) => {
    return line.reduce((sum, word) => sum + word.syllables, 0);
  };
  const addPrep = mot=>{
    handleWordClick(mot, true);
  }

  const handleWordClick = (word, neutral) => {
    for (let i = 0; i < 3; i++) {
      const targetSyllables = i === 1 ? 7 : 5;
      const currentSyllables = countSyllables(haikuLines[i]);
      
      if (currentSyllables < targetSyllables) {
        if (currentSyllables + word.syllables <= targetSyllables) {
          const newLines = [...haikuLines];
          newLines[i] = [...newLines[i], word];
          setHaikuLines(newLines);
          if(!neutral){

            setFloatingWords(prev => prev.filter(w => w.id !== word.id));
            addAssociatedWords(word);
          
          }
          if (i === 2 && currentSyllables + word.syllables === targetSyllables) {
            celebrateHaiku(newLines);
          }
          break;
        }
      }
    }
  };

 

  const celebrateHaiku = (lines) => {
    setCelebrating(true);
    setTimeout(() => {
      const haikuText = lines.map(line => line.map(w => w.word).join(' ')).join(' / ');
      setCompletedHaikus(prev => [...prev, haikuText]);
      setHaikuLines([[], [], []]);
      setCelebrating(false);
      generateWords();
    }, 2000);
  };

  const removeWord = (lineIndex, wordIndex) => {
    const newLines = [...haikuLines];
    const removedWord = newLines[lineIndex][wordIndex];
    newLines[lineIndex].splice(wordIndex, 1);
    setHaikuLines(newLines);
    
    setFloatingWords(prev => [...prev, {
      ...removedWord,
      id: Date.now(),
      x: Math.random() * 70 + 15,
      y: Math.random() * 60 + 10,
      opacity: 0,
      scale: 0
    }]);
  };

  const reset = () => {
    setHaikuLines([[], [], []]);
    generateWords();
  };

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      display:'flex',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      <Box sx={{ p: 1 ,flex:2}}>

      {/* Légende */}
      <Paper sx={{
        bgcolor: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: 2,
        p: 2
      }}>

        <Box sx={{ textAlign: 'center', display:'flex'}}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 300, mb: 1 }}>
            Jardin de Haïkus
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Cliquez sur les mots pour composer votre haïku
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef5350' }} />
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Noms</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#42a5f5' }} />
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Verbes</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#66bb6a' }} />
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Adjectifs</Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Jardin de mots flottants */}
        <Box sx={{ p: 3 ,flex:2}}>
          
          <Paper sx={{
            position: 'relative',
            height: '60vh',
            bgcolor: 'rgba(30, 41, 59, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: 2
          }}>
            {floatingWords.map((word) => (
              <Button
                key={word.id}
                onClick={() => handleWordClick(word)}
                sx={{
                  position: 'absolute',
                  left: `${word.x}%`,
                  top: `${word.y}%`,
                  color: getColor(word.category),
                  fontSize: '1.25rem',
                  fontWeight: 300,
                  textTransform: 'none',
                  opacity: word.opacity,
                  transform: `scale(${word.scale})`,
                  transition: 'all 1.7s ease-out',
                  '&:hover': {
                    transform: `scale(${word.scale * 1.1})`,
                    filter: 'brightness(1.25)'
                  }
                }}
              >
                {word.word}
              </Button>
            ))}
          </Paper>
        </Box>
      </Box>

      {/* Atelier du haïku */}
      <Paper sx={{
        bgcolor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(100, 116, 139, 0.3)',
        p: 3, flex:1
      }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {[0, 1, 2].map((lineIndex) => {
            const targetSyllables = lineIndex === 1 ? 7 : 5;
            const currentSyllables = countSyllables(haikuLines[lineIndex]);
            
            return (
              <Box key={lineIndex} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Ligne {lineIndex + 1}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: currentSyllables === targetSyllables ? '#66bb6a' : '#64748b' 
                    }}
                  >
                    {currentSyllables} / {targetSyllables} syllabes
                  </Typography>
                </Box>
                <Paper sx={{
                  minHeight: 60,
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: 1,
                  p: 1.5,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  alignItems: 'center',
                  animation: celebrating ? 'pulse 1s ease-in-out infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.8 }
                  }
                }}>
                  {haikuLines[lineIndex].length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>
                      Cliquez sur un mot...
                    </Typography>
                  ) : (
                    haikuLines[lineIndex].map((word, wordIndex) => (
                      <Chip
                        key={wordIndex}
                        label={word.word}
                        onClick={() => removeWord(lineIndex, wordIndex)}
                        sx={{
                          bgcolor: 'rgba(51, 65, 85, 0.5)',
                          color: getColor(word.category),
                          '&:hover': {
                            bgcolor: 'rgba(51, 65, 85, 0.8)'
                          }
                        }}
                      />
                    ))
                  )}
                </Paper>
              </Box>
            );
          })}
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
            <Button
              onClick={reset}
              variant="contained"
              sx={{
                bgcolor: '#475569',
                '&:hover': { bgcolor: '#64748b' }
              }}
            >
              Recommencer
            </Button>
            <HaikuSelectors addPrep={addPrep}/>
          

      {/* Galerie de haïkus */}
      {completedHaikus.length > 0 && (
        <Paper sx={{
          bgcolor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: 2,
          p: 2,
          maxWidth: 300
        }}>
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 300, mb: 1 }}>
            Vos haïkus
          </Typography>
          <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {completedHaikus.map((haiku, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontStyle: 'italic',
                  borderLeft: '2px solid #475569',
                  pl: 1,
                  mb: 1
                }}
              >
                {haiku}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}
          </Box>
        </Box>
      </Paper>

      {/* Célébration */}
      {celebrating && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          animation: 'bounce 1s ease-in-out infinite',
          '@keyframes bounce': {
            '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
            '50%': { transform: 'translate(-50%, -50%) scale(1.2)' }
          }
        }}>
          <StarBorder/>
        </Box>
      )}


    </Box>
  );
};

export default HaikuGarden;