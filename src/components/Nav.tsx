import { useEffect, useRef, useState } from 'react';
import { LOCALES, useI18n } from '../i18n';
import { useTheme } from '../state/theme';
import { useWallet } from '../state/wallet';
import { ChevronIcon, EthMark, ThemeIcon } from './icons';

function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !ref.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={`lang ${open ? 'open' : ''}`} ref={ref}>
      <button type="button" className="lang-b" aria-haspopup="listbox" aria-expanded={open} aria-label={t.nav.language} onClick={() => setOpen((v) => !v)}>
        {locale.toUpperCase()}
        <ChevronIcon />
      </button>
      <ul className="lang-l" role="listbox" aria-label={t.nav.language}>
        {LOCALES.map(({ code, name }) => (
          <li key={code} role="option" aria-selected={code === locale}>
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              className={code === locale ? 'on' : ''}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
            >
              <span>{code.toUpperCase()}</span>
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Nav() {
  const { t } = useI18n();
  const { toggleTheme } = useTheme();
  const { openModal } = useWallet();

  return (
    <nav className="nav">
      <a className="logo d" href="#" aria-label="Ethereum AI">
        <EthMark className="eth" />
        <span>ETHEREUM AI</span>
      </a>
      <div className="links">
        <a href="#demo">{t.nav.how}</a>
        <a href="#models">{t.nav.models}</a>
        <a href="#compare">{t.nav.compare}</a>
        <a href="#access">{t.nav.access}</a>
        <a href="#faq">{t.nav.faq}</a>
      </div>
      <LanguageSwitcher />
      <button type="button" className="tt" onClick={toggleTheme} aria-label={t.nav.theme}>
        <ThemeIcon />
      </button>
      <button type="button" className="btn btn-p nav-cta" onClick={openModal}>
        {t.nav.connect}
      </button>
    </nav>
  );
}
