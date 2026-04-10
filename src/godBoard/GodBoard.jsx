
import  GodGrid, { MainView }  from './components/GogGrid';
import { GodProvider} from './GodContext';


const GodBoard = ()=> {

  return  <GodProvider>
      <MainView />
    </GodProvider>
}
export default GodBoard;

