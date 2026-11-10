import coinbaseIcon from '../assets/wallets/coinbase.svg';
import ledgerIcon from '../assets/wallets/ledger.svg';
import metamaskIcon from '../assets/wallets/metamask.svg';
import trustIcon from '../assets/wallets/trust.svg';
import walletConnectIcon from '../assets/wallets/wallet-connect.svg';

/** Wallets listed as supported. This demo never talks to any of them. */
export const SUPPORTED_WALLETS: readonly { name: string; icon: string }[] = [
  { name: 'Trust Wallet', icon: trustIcon },
  { name: 'MetaMask', icon: metamaskIcon },
  { name: 'WalletConnect', icon: walletConnectIcon },
  { name: 'Coinbase Wallet', icon: coinbaseIcon },
  { name: 'Ledger', icon: ledgerIcon },
];

export const RECOMMENDED_WALLET = SUPPORTED_WALLETS[0].name;
