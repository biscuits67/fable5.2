import { Nav } from './components/Nav';
import { Footer } from './components/sections';
import { WalletModal } from './components/WalletModal';
import { I18nProvider } from './i18n';
import { Landing } from './pages/Landing';
import { ThemeProvider } from './state/theme';
import { WalletProvider } from './state/wallet';

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <WalletProvider>
          <Nav />
          <Landing />
          <Footer />
          <WalletModal />
        </WalletProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
