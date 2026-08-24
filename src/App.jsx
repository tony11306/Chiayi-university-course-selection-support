import DesktopApp from './desktop/DesktopApp';
import MobileApp from './mobile/MobileApp';
import { GlobalDataProvider } from './hooks/useGlobalData';
import { useIsMobile } from './hooks/useIsMobile';

export default function App() {
    return (
        <div className="App">
            <GlobalDataProvider>
                <ViewSwitch />
            </GlobalDataProvider>
        </div>
    );
}

function ViewSwitch() {
    const isMobile = useIsMobile();
    return isMobile ? <MobileApp /> : <DesktopApp />;
}
