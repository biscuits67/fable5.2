import { useEffect } from 'react';
import { Nav } from './components/Nav';
import { Footer } from './components/sections';
import { WalletModal } from './components/WalletModal';
import { I18nProvider } from './i18n';
import { useRoute } from './lib/route';
import { AppPage } from './pages/AppPage';
import { Landing } from './pages/Landing';
import { ThemeProvider } from './state/theme';
import { WalletProvider } from './state/wallet';

function Shell() {
  const route = useRoute();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <>
      <Nav route={route} />
      {route === 'app' ? <AppPage /> : <Landing />}
      <Footer />
      <WalletModal />
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <WalletProvider>
          <Shell />
        </WalletProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
