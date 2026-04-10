import { CorruptProvider } from "./CorruptProvider";
import CorruptView from "./CorruptView";

export const Corruptor = ()=>{
    return (
    <CorruptProvider>
      <CorruptView />
    </CorruptProvider>
  );
}
export default Corruptor;