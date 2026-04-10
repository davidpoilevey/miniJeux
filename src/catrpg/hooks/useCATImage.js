import { usePreloadedImages } from "../../civ/utils/hooks";
import { CATRPGSources } from "../assets/imageSources";

import imgRocTL from '../../fourmis/images/rocTL.png';
import imgRocT from '../../fourmis/images/rocT.png';
import imgRocTR from '../../fourmis/images/rocTR.png';
import imgRocTLR from '../../fourmis/images/rocTLR.png';
import imgRocL from '../../fourmis/images/rocL.png';
import imgRoc from '../../fourmis/images/roc.png';
import imgRocR from '../../fourmis/images/rocR.png';
import imgRocLR from '../../fourmis/images/rocLR.png';
import imgRocBL from '../../fourmis/images/rocBL.png';
import imgRocB from '../../fourmis/images/rocB.png';
import imgRocBR from '../../fourmis/images/rocBR.png';
import imgRocBLR from '../../fourmis/images/rocBLR.png';
import imgRocTBL from '../../fourmis/images/rocTBL.png';
import imgRocTB from '../../fourmis/images/rocB.png';
import imgRocTBR from '../../fourmis/images/rocTBR.png';
import imgRocTBLR from '../../fourmis/images/rocTBLR.png';
import React from "react";


    const rocs = {
        R:imgRocR,
        TR:imgRocTR,
        TL:imgRocTL,
        TB:imgRocTB,
        T:imgRocT,
        TLR:imgRocTLR,
        L:imgRocL,
        X:imgRoc,
        LR:imgRocLR,
        BL:imgRocBL,
        B:imgRocB,
        BR:imgRocBR,
        BLR:imgRocBLR,
        TBL:imgRocTBL,
        TBR:imgRocTBR,
        TBLR:imgRocTBLR,
    }
export const rocsTypes = Object.keys(rocs);

export const useCATImage = ()=>{
const imgSources = React.useMemo(() => {
    return { ...rocs, ...CATRPGSources };
  }, []); // ← stable, pas recréé à chaque render

 const images = usePreloadedImages(imgSources);
 return images;
}