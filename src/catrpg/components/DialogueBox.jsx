import { useEffect, useRef, useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, CardHeader, CardMedia, Stack, Typography } from '@mui/material';

import { CATRPGSpeakers } from '../assets/imageSources';
import MiniGameRenderer from './MiniGameRenderer';
import { useCATImage } from '../hooks/useCATImage';


const DialogueBox = ({ node, onOptionClick, context = {} }) => {
  const images = useCATImage();
  const timeoutRef = useRef(null);
const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  useEffect(() => {
    if (node?.next && !node.options && !node.end && node.short) {
      if (node?.effect) node.effect(context);
      timeoutRef.current = setTimeout(() => {
        onOptionClick(node.next);
      }, 2000);
    }
    setSelectedOptionIndex(0);
    return () => clearTimeout(timeoutRef.current);
  }, [node]);

useEffect(() => {
  const handleKey = (e) => {
    if (!node) return;

    // 🎯 Gestion navigation dans les options
    if (node.options) {
      const options = node.options.filter((opt) => !opt.condition || opt.condition(context));
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key.toLowerCase() === 's') {
        setSelectedOptionIndex((prev) => (prev + 1) % options.length);
        e.preventDefault();
      } else if (e.key === 'ArrowUp' ||e.key === 'ArrowLeft' || e.key.toLowerCase() === 'w') {
        setSelectedOptionIndex((prev) => (prev - 1 + options.length) % options.length);
        e.preventDefault();
      } else if (e.key === 'Enter'||e.key==='Space') {
        onOptionClick(options[selectedOptionIndex]?.next);
        setOptionPage(0);
        e.preventDefault();
      }
    }

    // 🧭 Navigation "classique" sans option
    else if ((e.key === 'Enter'||e.key==='Space') && node?.next && !node.end) {
      clearTimeout(timeoutRef.current);
      onOptionClick(node.next);
    }
  };

  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, [node, context, onOptionClick, selectedOptionIndex]);


const [optionPage, setOptionPage] = useState(0);
const OPTIONS_PER_PAGE = 4;

const renderOptions = (options) => {
  const visibleOptions = options
    .filter((opt) => !opt.condition || opt.condition(context));

  const totalPages = Math.ceil(visibleOptions.length / OPTIONS_PER_PAGE);
  const startIndex = optionPage * OPTIONS_PER_PAGE;
  const paginatedOptions = visibleOptions.slice(startIndex, startIndex + OPTIONS_PER_PAGE);

  const isCompact = visibleOptions.length <= 3;
  const isPaginated = visibleOptions.length > OPTIONS_PER_PAGE;

  return (
    <Stack
      direction={isCompact ? 'row' : 'column'}
      spacing={2}
      sx={{ mt: 2, alignItems: isCompact ? 'center' : 'stretch' }}
    >
     {paginatedOptions.map((opt, i) => {
  const isSelected = i === selectedOptionIndex;

  return (
    <Button
      key={i}
      variant={isSelected ? 'contained' : 'text'}
      color={isSelected ? 'warning' : 'secondary'}
      onClick={() => {
        setOptionPage(0);
        onOptionClick(opt.next);
      }}
      sx={{
        backgroundColor: isSelected ? '#ffa726' : '#3f51b5',
        color: 'white',
        textAlign: 'left',
        '&:hover': {
          backgroundColor: isSelected ? '#fb8c00' : '#303f9f'
        },
        border: isSelected ? '2px solid white' : undefined
      }}
    >
      {typeof opt.text === 'function' ? opt.text(context) : opt.text}
    </Button>
  );
})}


      {isPaginated && (
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
          {optionPage > 0 && (
            <Button variant="contained" color="secondary" onClick={() => {
              setOptionPage((p) => p - 1);
             setSelectedOptionIndex(0);
            }}>← Précédent</Button>
          )}
          {optionPage < totalPages - 1 && (
            <Button variant="contained" color="secondary" onClick={() => {
              setOptionPage((p) => p + 1);
             setSelectedOptionIndex(0);
            }}>Suivant →</Button>
          )}
        </Stack>
      )}
    </Stack>
  );
};

  if (!node) return null;

  const image = images[node?.image];

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: node.miniGame?340:'50%', // 340 c'est la width du drawer
        transform: node.miniGame?null:'translateX(-340px)',
        width: node.miniGame?1200:600,
        zIndex: 10
      }}
    >
      <Card elevation={6} sx={{
        background: 'linear-gradient(to bottom, #2d2d2d, #1b1b1b)',
        color: 'white',
        p: 2,
        borderRadius: 3,
        border: '2px solid #666'
      }}>
        <CardHeader
          avatar={image?.src ? (
            <Avatar src={image?.src} sx={{ width: 64, height: 64, mr: 2, border: '2px solid white' }} />
          ) : (
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: '#ffd700' }}>
              {CATRPGSpeakers[node?.image] || node?.name || '???'}
            </Typography>
          )}
          title={node.name}
        />
        {node.url && (
          <CardMedia
            component="img"
            height="194"
            image={node.url}
            alt={node.name}
          />
        )}
        <CardContent>

          {/* ✅ Texte classique si pas mini-jeu */}
          {node.text?.map((line, i) => (
            <Typography key={i} variant="body1" sx={{ mb: 1 }}>
              {line}
            </Typography>
          ))}
            {node.miniGame && <Stack >
            {node.options && renderOptions(node.options)}
            {!node.options && !node.end && (
              <Button
                variant="text"
                onClick={() => onOptionClick(node.next)}
                sx={{ borderColor: 'white', color: 'white' }}
              >
                Continuer →
              </Button>
            )}
          </Stack>}
          {/* ✅ MINI JEU SPECIAL */}
          {node.miniGame && (
            <Box sx={{ mt: 2 , width:1000, height:600, overflow:'auto', background:'rgb(254, 247, 239)'}}>
              <MiniGameRenderer
                name={node.miniGame}
                context={context}
                miniGameOptions={node.miniGameOptions}
                onFinish={(result) => {
                  
               
                  setTimeout(()=>{
                       if (node.effect) 
                        node.effect({gameResult:result, ...context});
                    onOptionClick(node.next);

                  },1500);
                 // onOptionClick(node.next);
                }}
              />
            </Box>
          )}


          {/* ✅ Options cliquables */}
          {!node.miniGame && <Stack >
            {node.options && renderOptions(node.options)}
            {!node.options && !node.end && (
              <Button
                variant="text"
                onClick={() => onOptionClick(node.next)}
                sx={{ borderColor: 'white', color: 'white' }}
              >
                Continuer →
              </Button>
            )}
          </Stack>}
        </CardContent>
      </Card>
    </div>
  );
};

export default DialogueBox;
