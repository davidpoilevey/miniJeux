import React, { useMemo } from "react";
import ButtonDPY from "../ui/ButtonDPY";
import { useActivite } from "./ActiviteProvider";


export const ActiviteButton = ({ activite, pnj }) => {
    const activiteContext = useActivite();
    const disabledBecause = activiteContext.conditionNonRemplies(activite?.condition);

    return disabledBecause==null&&<ButtonDPY startIcon={activiteContext.getIcon(activite.icon)}
            disabledBecause={disabledBecause} 
            onClick={() => { activiteContext.openActivite(activite, pnj); }}>
        {activite.nom}
        </ButtonDPY>
};
