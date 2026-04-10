import React from 'react';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    image: {
        width: '100%',
        height: 'auto',
        cursor: 'pointer',
    },
}));
export const ImageGrid = ({ images, handleImageSelection }) => {
    const classes = useStyles();

    return (
        <Grid container spacing={2}>
            {images.map((image) => (
                <Grid item xs={3} key={image.id}>
                    <img
                        src={image.urls.regular}
                        alt={image.alt_description}
                        className={classes.image}
                        onClick={() => handleImageSelection(image.urls.small)} />
                </Grid>
            ))}
        </Grid>
    );
};
