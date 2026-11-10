import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/** Demo-only wallet state. Nothing here talks to a real wallet or network. */
export interface WalletAccount {
  nickname: string;
  walletName: string;
  balance: number;
}

export const DEMO_ADDRESS = '0x71C4…9e3F';

interface WalletContextValue {
  account: WalletAccount | null;
  connect: (account: WalletAccount) => void;
  disconnect: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const connect = useCallback((next: WalletAccount) => setAccount(next), []);
  const disconnect = useCallback(() => setAccount(null), []);
  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const value = useMemo(
    () => ({ account, connect, disconnect, isModalOpen, openModal, closeModal }),
    [account, connect, disconnect, isModalOpen, openModal, closeModal],
  );
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
