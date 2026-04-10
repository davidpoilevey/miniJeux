import imgPotion from './images/potion.png';

export const Loot = {
    toString : (loot)=>{
        return loot.map(l=>l.text??'NoText').join(' + ');
    }
    , toPossession:(loot)=>{
        // 
        const poss = {};
        for(let i=0;i<loot.length;i++){
           poss[loot[i].id]=1;
        }
        return poss
    }
    , get:(id,nb)=>{
        const found = LootItems.find(item=>item.id===id);
        if(found!=null&&nb!=null)
            found.valeur=nb;
        return found;
    }
   
}
const LootItems = [
    {
        id:'queueDeRat',
        text:'Queue de rat',
            image: 'http://laborats.weebly.com/uploads/8/0/0/9/8009949/3256815-orig.jpg'
            , valeur: 0, effet:{vie:1}
        },
        {
            id:'or', image:'https://previews.123rf.com/images/morphart/morphart1910/morphart191043880/132784739-a-4-pi%C3%A8ces-de-pi%C3%A8ces-d-or-vecteur-dessin-en-couleur-ou-illustration.jpg'
            , text:'moula'
            ,valeur:1
        }
       , {
            id:'croquettes', image:'https://www.coteanimal.fr/2220-large_default/croquette-performance-fr-20-kg.jpg'
            , text:'Croquettes pour chat'
            ,valeur:0.01, effet:{vie:-1}
        },{
            id:'passportFille', image:"https://previews.123rf.com/images/ylivdesign/ylivdesign1611/ylivdesign161109649/69562464-ic%C3%B4ne-passport-cartoon-illustration-de-l-ic%C3%B4ne-passeport-vecteur-pour-le-web.jpg"
            , text:"Passeport de la fille"
            , valeur:1
        },{
            id:'soin', text:'Potion de soins'
            , image:imgPotion
            , valeur:50, effet:{vie:10}
        },{
            id:'psylo', text:'Jus de psylocybine concentré'
            , image:imgPotion
            , valeur:50, effet:{vie:-2, bonheur:10,connaissance:'vieApresLaMort'}
        }
]