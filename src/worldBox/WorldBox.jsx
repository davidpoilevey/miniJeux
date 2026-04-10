import { WBInner } from "./ui/WBInner";
import { WBProvider } from "./WBContext";


export default function WorldBox() {
  return (
    <WBProvider>
      <WBInner />
    </WBProvider>
  );
}