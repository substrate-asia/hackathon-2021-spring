import { SubstrateContextProvider } from './substrate-lib';
import MiniDrawer from './MiniDrawer';

export default function App() {
  return (
    <SubstrateContextProvider>
      <MiniDrawer />
    </SubstrateContextProvider>
  );
}
