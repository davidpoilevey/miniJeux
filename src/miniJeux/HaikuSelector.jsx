import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function HaikuSelectors({ addPrep }) {
  const conjonctions = [
    { word: 'mais', syllables: 1, categorie:'conjonctionDeCoordination' },
    { word: 'ou', syllables: 1, categorie:'conjonctionDeCoordination' },
    { word: 'et', syllables: 1, categorie:'conjonctionDeCoordination' },
    { word: 'donc', syllables: 1, categorie:'conjonctionDeCoordination' },
    { word: 'or', syllables: 1, categorie:'conjonctionDeCoordination' },
    { word: 'ni', syllables: 1, categorie:'conjonctionDeCoordination' },
    { word: 'car', syllables: 1, categorie:'conjonctionDeCoordination' }
  ];

  const articles = [
    { word: 'le', syllables: 1, categorie:'article' },
    { word: 'la', syllables: 1, categorie:'article' },
    { word: 'les', syllables: 1, categorie:'article' },
    { word: "l'", syllables: 1, categorie:'article' },
    { word: 'un', syllables: 1, categorie:'article' },
    { word: 'une', syllables: 1, categorie:'article' },
    { word: 'des', syllables: 1, categorie:'article' }
  ];

  const interjections = [
    { word: 'hélas', syllables: 2, categorie:'interjection' },
    { word: 'enfin', syllables: 2, categorie:'interjection' },
    { word: 'malheur', syllables: 2, categorie:'interjection' },
    { word: 'zut', syllables: 1, categorie:'interjection' },
    { word: 'fi', syllables: 1, categorie:'interjection' },
    { word: 'tiens', syllables: 1, categorie:'interjection' },
     { word: 'bah', syllables: 1, categorie:'particule' },
  { word: 'ben', syllables: 1, categorie:'particule' },
  { word: 'hein', syllables: 1, categorie:'particule' },
  { word: 'allez', syllables: 2, categorie:'particule' },
  { word: 'tiens', syllables: 1, categorie:'particule' },
  { word: 'quoi', syllables: 1, categorie:'particule' },
  { word: 'voilà', syllables: 2, categorie:'ponctuant' },
  { word: 'eh bien', syllables: 2, categorie:'ponctuant' },
  { word: 'certes', syllables: 2, categorie:'ponctuant' },
  { word: 'soit', syllables: 1, categorie:'ponctuant' },
  { word: 'en somme', syllables: 2, categorie:'ponctuant' },
  { word: 'peut-être', syllables: 2, categorie:'ponctuant' }
  ];
const selectBlock = (label, items) => (
    <FormControl
      fullWidth
      sx={{
        minWidth:140,
        mb: 2,
        '& .MuiInputLabel-root': { color: '#b0c4de' },                     // bleu clair doux
        '& .MuiOutlinedInput-root': {
          color: 'white',
          backgroundColor: '#0b1a33',                                     // bleu marine profond
          '& fieldset': { borderColor: '#1f3b63' },
          '&:hover fieldset': { borderColor: '#3d74c1' },
          '&.Mui-focused fieldset': { borderColor: '#5a9bff' }
        },
        '& .MuiSvgIcon-root': { color: '#5a9bff' }
      }}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        onChange={(e) => e.target.value && addPrep(e.target.value)}
        value=""
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: '#0b1a33',
              color: 'white'
            }
          }
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.word}
            value={item}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#1e335a !important'
              }
            }}
          >
            {item.word}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {selectBlock('Conjonctions', conjonctions)}
      {selectBlock('Articles', articles)}
      {selectBlock('Interjections', interjections)}
    </Box>
  );
}
