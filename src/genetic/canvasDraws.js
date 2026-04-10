import { SCENE } from "./pot20";
import bourgeonsImg from './bourgeon.png'; //TODO 
import fleursImg from './fleur.png';
import fruitsImg from './fruit.png';
const BASE_SIZE = 3;

const TRONC_LARGEUR = 2;

export const drawFruit = (ctx, fruit, opts={}) => {
    
    const rayon = Math.min(opts.max!=null?opts.max:fruit.age+1, fruit.age);
        ctx.fillStyle = fruit.couleur||'red';
        ctx.beginPath();
        ctx.arc(fruit.x, fruit.y, rayon, 0, Math.PI * 2);
    if(opts.stroke)
    ctx.stroke();
else
    ctx.fill();
};
export const drawPlant = (ctx, plant) => {
    // Dessiner le tronc
    ctx.fillStyle = 'brown';
    ctx.fillRect(plant.tronc.positionX, SCENE.SOL_Y - plant.tronc.taille, plant.tronc.largeur || TRONC_LARGEUR, plant.tronc.taille);

    // Dessiner les branches, feuilles, bourgeons, etc.

    drawBranches(ctx, plant.tronc);

    // Dessiner les racines
    drawRoots(ctx, plant.tronc.positionX, SCENE.SOL_Y, plant.racines)
    // ctx.beginPath();
    // ctx.arc(plant.tronc.positionX, SCENE.SOL_Y, plant.racines, 0, Math.PI);
    // ctx.strokeStyle = "grey";
    // ctx.stroke();

};
function drawRoots(ctx, positionX, positionY, tailleRacines) {
    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 2;

    const racineHeight = tailleRacines; // Ajustez l'échelle de la hauteur des racines en fonction de la tailleRacines

    ctx.beginPath();
    ctx.moveTo(positionX, positionY);

    // Premier segment de la racine
    ctx.bezierCurveTo(positionX - 10, positionY + racineHeight * 0.2, positionX - 20, positionY + racineHeight * 0.6, positionX - 40, positionY + racineHeight);

    // Deuxième segment de la racine
    ctx.bezierCurveTo(positionX - 30, positionY + racineHeight * 1.2, positionX - 10, positionY + racineHeight * 1.6, positionX + 10, positionY + racineHeight * 2);

    // Troisième segment de la racine
    ctx.bezierCurveTo(positionX + 30, positionY + racineHeight * 2.2, positionX + 80, positionY + racineHeight * 2.6, positionX - 10, positionY + racineHeight * 3);

    // Dessiner les racines
    ctx.stroke();
}

const drawBranches = (ctx, teneur) => {
    // Dessiner une branche sur un teneur (tronc ou branche)
    ctx.fillStyle = 'brown';
    if (teneur.branches != null) {

        teneur.branches.forEach(branche => {
            ctx.beginPath();
            ctx.moveTo(branche.xDepart, branche.yDepart);
            ctx.lineTo(branche.xArrivee, branche.yArrivee);
            ctx.lineWidth = branche.largeur;
            ctx.strokeStyle = 'brown';
            ctx.stroke();
            drawBranches(ctx, branche);
            if (branche.bourgeon != null)
                drawBourgeon(ctx, branche.bourgeon, branche);
            if (branche.fleur != null)
                drawFruit(ctx, branche.fleur, {max:10, stroke:true});
            if (branche.fruit != null)
                drawFruit(ctx, branche.fruit, {max:10});
            if (branche.feuilles != null && branche.feuilles.length > 0)
                branche.feuilles.forEach(feuille => {
                    drawFeuille(ctx, feuille);
                });
        });
    }

};
function drawBourgeon(ctx, bourgeon) {
    const { x, y, couleur, age } = bourgeon;

    // Définir la couleur du bourgeon
    ctx.fillStyle = couleur || 'yellow';

    // Dessiner l'ellipse
    ctx.beginPath();
    ctx.ellipse(x, y, age * 0.8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
}
function drawFeuille(ctx, feuille) {
    const { x, y } = feuille;

    // Définir la couleur du bourgeon
    ctx.fillStyle = 'green';

    // Dessiner l'ellipse
    ctx.beginPath();
    ctx.ellipse(x, y, BASE_SIZE * 1.8, BASE_SIZE, 0, 0, Math.PI * 2);
    ctx.fill();
}

const drawBud = (ctx, type, bud, branche) => {
    let img;
    switch (type) {
        case 'fleur':
            img = fleursImg;
            break;
        case 'fruit':
            img = fruitsImg;
            break;
        default:
            return;
    }

   const drawobj = (imgObj) => {
        const width = bud.age * BASE_SIZE;
        const height = bud.age * BASE_SIZE;
        const x = branche.xArrivee - width / 2; // Ajustement pour centrer horizontalement
        const y = branche.yArrivee - height / 2; // Ajustement pour centrer verticalement
        // Appliquer la couleur
        if (bud.couleur != null) {

            ctx.save(); // Sauvegarder le contexte actuel
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = bud.couleur; // Utiliser la couleur dynamique
            ctx.fillRect(x, y, width, height); // Remplir avec la couleur dynamique
            ctx.restore(); // Restaurer le contexte précédent
        }

        ctx.drawImage(
            imgObj,
            x,
            y,
            width,
            height
        );

    };
    if(branche.budImage==null){

    branche.budImage = new Image();
    branche.budImage.src = img; // Chargement de l'image
    branche.budImage.onLoad=()=>{drawobj(branche.budImage);}
    }
    else
    drawobj(branche.budImage);
};
