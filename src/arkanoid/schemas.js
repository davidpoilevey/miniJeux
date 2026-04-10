// 'standard', 'speed','effect','multi','fire','acid','vie', 'slow', 'gros', 'petit', 'dur','collante'
export const Schemas = {

   niveaux:[{id:1, name:'Premier niveau:decouverte', schema:[
    [
        null,null,null,null,null,'vie', '','','','','',null,null,null,null,null
    ],
    [
        null,null, null,null,'', '','','', 'multi','','','',null,null,null,null],
    [
        null,null,null, '','','', '','','', '','','', '',null,null,null],
    [
        null,null,'', 'acid','','', '','','', '','','', '','',null,null],
    [
        null,'','', '','','', '','','fire', '','','', '','','',null],
    [
        'dur','dur','dur', 'dur','dur','dur', 'dur','dur','dur', 'dur','dur','dur', 'dur','dur','dur','dur'],
   ]},
   {id:2, name:'Niveau 2: un de chaque', schema:[
    [
        '','standard', 'speed','effect','multi','fire','acid','vie', 'slow', 'vie', 'petit', 'dur','collante','','',''
    ],
    [
        'standard', 'speed','effect','multi','fire','acid','vie', 'slow', 'petit', 'petit', 'dur','collante', '','','','gros'],
    [
        '','','', '','standard', 'speed','effect','multi','fire','acid','vie', 'slow', 'collante', 'petit', 'dur','gros'],
    [
        'standard', 'speed', 'slow', '', 'petit', 'dur','collante','effect','multi','fire','acid','vie', '','','','gros'],
    [
        '','','standard', 'speed', 'slow', '', 'petit', 'dur','collante','effect','multi','fire','acid','vie','','gros'],
    [
        'standard', 'speed', 'slow', '', 'petit', 'dur','collante','effect','multi','fire','acid','vie' ,'','','','gros'],
   ]},
   {id:3, name:'Ouhla ca va vite', schema:[
    [
        '','','', '','','', '','vie','', '','','', '','','',''
    ],
    [
        'speed','speed','speed', 'speed','speed','speed', 'speed','speed','speed', 'speed',null,null,null,null,'speed', 'speed','speed','speed','speed'],
    [
        'fire','','', '','','acid', null,null,null, '','','acid', '','','','fire'],
    [
        '','speed','speed','speed', 'speed','speed',null, null,'speed','speed', 'speed','speed','speed', 'speed','speed','speed','speed',''],
    [
        'slow','','fire', '','slow','','slow','', 'multi','','slow', '','multi','','slow'],
    [
        '','speed', 'speed','speed','speed','speed', 'speed','speed','speed', 'speed','speed','speed', 'speed','speed','speed', 'speed','speed','speed',''],
   ]},
   {id:4, name:'Coeur', schema:[
    [
        '','','', '','','dur', null,'dur','', '','','', '','acid','',''
    ],
    [
        '','','', '','dur','dur', 'vie','dur','dur', '','','', 'acid','acid','acid',''],
    [
        '','','', 'dur','dur',null, 'fire',null,'dur', 'dur','','', '','','',''],
    [
        '','','', '','dur','dur', null,'dur','dur', '','','', '','','','effect'],
    [
        'dur','dur','', '','','dur', 'dur','dur','', '','','', '','','dur','dur'],
    [
        'dur','dur','effect', '','petit','', 'dur','','', 'collante','gros','petit', 'collante','effect','dur','dur'],
   ]},
   {id:5, name:'Au secours', schema:[
    [
        'speed','speed','speed', 'speed','speed','speed', 'speed','speed','speed', 'speed','speed','speed', 'speed','speed','speed', 'speed','speed','speed','speed'],
    [
        '','','slow', '','slow','', '','slow','', '','','slow', '','','slow'],
    [
        'dur','dur','dur', 'dur','dur','dur', 'dur','dur','dur', 'dur','dur','dur', 'dur','dur','dur','dur'],
    [
        'vie','','gros', '','gros','','','vie', '','gros', '','gros','','vie'],
    [
        'effect','','', 'effect','','', '','collante','fire', '','','', 'effect','','','effect'],
    [
        'petit', 'speed', 'petit','speed','petit', 'speed', 'petit','speed','petit', 'speed','petit','speed', 'petit','speed','petit', 'speed','petit','speed', 'petit','speed','petit','speed'],
   ]}
]



,getNiveaux:function(){
    return this.niveaux;
   }

   ,getNiveau:function(niveau){
    return this.niveaux.find(niv=>niv.id===niveau)
   }

}