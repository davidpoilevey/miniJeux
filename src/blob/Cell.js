import { clamp } from "../b8/Taxonomy";

export class Cell {
  constructor(x, y, genome, id) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = 10;
    this.maxWidth = 20;
    this.height = 10;
    this.maxHeight = 20;
    this.elasticity = 0.5; // 0 à 1, 1 étant très élastique
    this.pression = 1.0; // Pression interne de la cellule
    this.GROW_STEP = 0.1;
    this.adnHandler = genome.adnHandler;
    this.genome = genome;
    this.type = 'stem'; // 'stem', 'muscle', 'adhesive', 'dead'
    this.age = 0;
    this.maxAge = this.genome.getGene('division', 'maxAge') * 1.5
    this.energy = 50;
  }

  // Évaluation de l'environnement local
  evaluateContext(allCells) {
    const neighbors = [];
    allCells.forEach(cell =>{
      if(cell.id !== this.id && cell.x + cell.width > this.x - this.width &&
      cell.x < this.x + this.width &&
      cell.y + cell.height > this.y - this.height &&
      cell.y < this.y + this.height){
        neighbors.push(cell);
      }
    }
      
    );
    return {
      neighborSides: {
        top: neighbors.some(cell => cell.y  <= this.y && Math.abs(cell.x - this.x) < this.width),
        bottom: neighbors.some(cell => cell.y >= this.y  && Math.abs(cell.x - this.x) < this.width),
        left: neighbors.some(cell => cell.x  <= this.x && Math.abs(cell.y - this.y) < this.height),
        right: neighbors.some(cell => cell.x >= this.x  && Math.abs(cell.y - this.y) < this.height),
      },
      freeSides: [
        !neighbors.some(cell => cell.y  <= this.y && Math.abs(cell.x - this.x) < this.width) ? 'top' : null,
        !neighbors.some(cell => cell.y >= this.y  && Math.abs(cell.x - this.x) < this.width) ? 'bottom' : null,
        !neighbors.some(cell => cell.x  <= this.x && Math.abs(cell.y - this.y) < this.height) ? 'left' : null,
        !neighbors.some(cell => cell.x >= this.x  && Math.abs(cell.y - this.y) < this.height) ? 'right' : null,
      ].filter(side => side !== null),
      neighborCount: neighbors.length,
      neighborTypes: neighbors.reduce((acc, cell) => {
        acc[cell.type] = (acc[cell.type] || 0) + 1;
        return acc;
      }, {}),
      localDensity: neighbors.length / 8, // Densité locale (0 à 1)
      localPression: neighbors.length / 25,
    };
  }

  // Décision de division
  // Dans shouldDivide, modifier pour les cellules souches :
  shouldDivide(context) {

      const energyOk = this.energy > this.genome.getGene('division', 'energyThreshold');
      const ageOk = this.age < this.genome.getGene('division', 'maxAge')-10;// 10 tick avant la date fatidique
      const randomOk = Math.random() < this.genome.getGene('division', 'divisionProbability');
      const widthOK = this.width>=this.maxWidth||this.height>=this.maxHeight;
    
    return energyOk && ageOk && randomOk && widthOK;

    // Autres types... (logique existante)
  }

  // Processus de division
  // Dans la méthode divide() de Cell, ajouter avant le return :
  // Dans divide(), remplacer tout le système de forces par :
  divide(allCells) {
    if (this.isDividing) return null;

    this.isDividing = true;
    this.energy *= 0.6;
      const newGenome = this.genome.mutate(0.05);
      let newX = this.x;
      let newY = this.y;
    if(this.width>=this.maxWidth){
       newX = this.x+this.width/2 + 1;
      this.width = this.maxWidth/2-2;
      }

    if(this.height>=this.maxHeight){
       newY = this.y+this.height/2 + 1;
      this.height = this.maxHeight/2;
      }
      const newCell = new Cell(newX, newY, newGenome, Date.now() + Math.random());
      newCell.width=this.width;
      newCell.height=this.height;
      return newCell;
    

  }


  // Décision de spécialisation
  // Dans shouldSpecialize, rendre la spécialisation plus rare et tardive :
  shouldSpecialize(context) {
    if (this.type !== 'stem') return false;
    // ÉPIDERME : priorité absolue pour les cellules de bordure
    if (context.isOnBorder && this.age > 20) {
      if (Math.random() < 0.3) { // 30% de chance par tick pour les cellules de bordure
        return 'epidermis';
      }
    }

    if (this.age < this.genome.getGene('specialization', 'specializationAge') * 2) return false; // Plus tardif
    if (context.neighborCount < 4) return false; // Seulement dans un tissu formé
    if (context.isOnBorder) return false;

    const muscleSignal = context.localDensity * 0.5;
    const adhesiveSignal = (context.neighborCount > 6) ? 1 : 0;

    const muscleThreshold = this.genome.getGene('specialization', 'muscleThreshold');
    const adhesiveThreshold = this.genome.getGene('specialization', 'adhesiveThreshold');


    if (muscleSignal > muscleThreshold && Math.random() < 0.02) {
      return 'muscle';
    }
    if (adhesiveSignal > adhesiveThreshold && Math.random() < 0.015) {
      return 'adhesive';
    }

    return null;
  }

  // Processus de spécialisation
  specialize(newType) {
    this.type = newType;

    switch (newType) {
      case 'muscle':
        this.size = 5;
        break;
      case 'adhesive':
        this.size = 10;
        break;
      case 'epidermis':
        this.size = 12;
        this.maxAge *= 2;
        break;
    }
  }

  executeBehavior(context, time) {
    // agranditissement si il y a de l'espace disponible
    const dirPref = this.adnHandler.readBool('preferHorizontal') ? 'horizontal' : 'vertical';
    switch (dirPref) {
      case 'horizontal':
        if (context.freeSides.includes('left') || context.freeSides.includes('right')) {
          // espace horizontal libre
          if (this.width < this.maxWidth) {
            if (context.freeSides.includes('left') && this.x > 0) {
              this.x -= this.GROW_STEP; // se déplace légèrement vers la gauche
            }
            if (context.freeSides.includes('right') && this.x < 800) {
              this.x += this.GROW_STEP; // se déplace légèrement vers la droite
            }
            this.width += this.GROW_STEP;
            this.energy -= 0.2;
          }
        }
          else{
            this.pression += 0.01;
          }
          break;

      case 'vertical':
        if (context.freeSides.includes('top') || context.freeSides.includes('bottom')) {
          // espace vertical libre
          if (this.height < this.maxHeight) {
            if (context.freeSides.includes('top') && this.y > 0) {
              this.y -= this.GROW_STEP; // se déplace légèrement vers la gauche
            }
            if (context.freeSides.includes('bottom') && this.y < 800) {
              this.y += this.GROW_STEP; // se déplace légèrement vers la droite
            }
            this.height += this.GROW_STEP;
            this.energy -= 0.2;
          }
        }
          else{
            this.pression += 0.01;
          }
          break;
        default:
          this.pression += 0.01;
          break;
    }
   
    // Comportements spécialisés

  }

  // Métabolisme - gain d'énergie et agrandissement
  metabolize() {
    const baseGain = this.genome.getGene('metabolism', 'baseEnergyGain');
    const efficiency = this.genome.getGene('metabolism', 'efficiencyFactor');

    // L'énergie dépend de l'âge et du type
    let energyGain = baseGain * efficiency;
    if (this.age > 100) energyGain *= 0.8; // Vieillissement
    if (this.type === 'muscle') energyGain *= 0.7; // Les muscles consomment plus

    this.energy = Math.min(100, this.energy + energyGain);
  }

  // Test de survie
  shouldDie() {
    const energyDeath = this.energy <= 0;
    const ageDeath = this.age > this.maxAge;
    const randomDeath = Math.random() < this.genome.getGene('specialization', 'deathThreshold');

    return energyDeath || ageDeath || randomDeath;
  }

  // Mise à jour de la cellule
  update(allCells, time) {
    this.age++;
    this.isDividing = false;

    // Métabolisme
    this.metabolize();

    // Comportement spécialisé

    // Évaluation du contexte
    const context = this.evaluateContext(allCells);
    this.executeBehavior(context, time);

    // Spécialisation
    // const specializationType = this.shouldSpecialize(context);
    // if (specializationType) {
    //   this.specialize(specializationType);
    // }

    return {
      shouldDivide: this.shouldDivide(context),
      shouldDie: this.shouldDie(),
      context
    };
  }

  // Rendu de la cellule
  render() {
    const colors = {
      stem: '#90EE90',
      muscle: '#FF6B6B',
      adhesive: '#bacb20ff',
      epidermis: '#8B4513',
      dead: '#666666'
    };

    const opacity = Math.max(0.3, this.energy / 100);

    return (
      <g key={this.id}>
        <rect
          x={this.x} width={this.width}
          y={this.y} height={this.height}
          r={this.size}
          fill={colors[this.type]}
          opacity={opacity}
          stroke={this.type === 'muscle' ? '#FF4444' : '#1c872fff'}
          strokeWidth={this.type === 'adhesive' ? 2 : 1}
        />
        <text
          x={this.x}
          y={this.y + 3}
          textAnchor="middle"
          fontSize="8"
          fill="white"
          fontWeight="bold"
        >
          {this.age < 10 ? this.age : ''}
        </text>
      </g>
    );
  }
}