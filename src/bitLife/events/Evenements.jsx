import { useActivite } from "../activites/ActiviteProvider";
import { BaseDeventAgePeriode } from "./BaseEventAgePeriode";

export const useEvents = ()=>{
    const activiteContext = useActivite();
    const evenementAleatoireAnnee = (agePeriode)=>{
        let event = BaseDeventAgePeriode[agePeriode][Math.floor(Math.random() * BaseDeventAgePeriode[agePeriode].length)];
        while(event.condition!=null&&activiteContext.conditionNonRemplies(event.condition))
            event = BaseDeventAgePeriode[agePeriode][Math.floor(Math.random() * BaseDeventAgePeriode[agePeriode].length)];
        // et pas toujours 1x/2
        
        if(Math.random()<0.5)
            activiteContext.openActivite(event);
    }
    const simpleMessage = (msg)=>{
        activiteContext.openMessage(msg);
    }
   // const eventAResoudre = 
   return  {evenementAleatoireAnnee, simpleMessage} ;
}
