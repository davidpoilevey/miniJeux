import ActionModal from "./ModalAction";
import { MonopolyBoard } from "./MonoBoard"
import {  MonoProvider } from "./MonoContext"
import { PlayerInfo } from "./PanelInfo";

const Monopoly = ()=>{
    return <MonoProvider>
        <MonopolyBoard/>
         <PlayerInfo />
         <ActionModal />
    </MonoProvider>
}
export default Monopoly;