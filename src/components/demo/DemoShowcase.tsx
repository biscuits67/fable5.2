import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { BURN_TOKEN_FILE, BURN_TOKEN_SOURCE } from '../../data/contract';
import { MODELS } from '../../data/models';
import { useI18n } from '../../i18n';
import type { Dict } from '../../i18n/locales/en';
import { EthMark, ModelIcon, SendIcon } from '../icons';
import { createDemoPlayer, type DemoPlayer, type DemoScenario } from './player';

function buildScenarios(t: Dict): DemoScenario[] {
  const { code, plan, ask } = t.scenarios;
  const a = t.agent;
  return [
    { model: 'forge', balance: 0.52, prompt: code.prompt, reply: code.reply, code: { file: BURN_TOKEN_FILE, source: BURN_TOKEN_SOURCE } },
    { model: 'vector', balance: 1.284, prompt: plan.prompt, reply: plan.reply, plan: { rows: plan.rows, chartLabel: t.app.planChart } },
    { model: 'lumen', balance: 0.14, prompt: ask.prompt, reply: ask.reply },
    {
      model: 'vector',
      balance: 0.52,
      prompt: a.macPrompt,
      reply: a.macReply,
      agent: { running: a.running, done: a.done, day: a.day, balance: a.balance, result: a.result, note: a.simNote, events: a.events },
    },
  ];
}

/**
 * Static markup of the mock app. Memoised with no changing props, so React never re-renders it
 * and the demo player is free to mutate its dynamic parts.
 */
const MacScreen = memo(function MacScreen({ t }: { t: Dict }) {
  return (
    <div className="mac" aria-hidden="true">
      <div className="mac-lid">
        <div className="mac-screen">
          <div className="app">
            <aside className="side">
              <div className="a-logo">
                <EthMark className="eth" />
                Ethereum AI
              </div>
              <div className="a-lab">{t.app.models}</div>
              {MODELS.map((model) => (
                <div key={model.id} className="m" data-model={model.id} data-min={model.minBalance}>
                  <span className="m-ic" style={{ '--mc': model.color } as CSSProperties}>
                    <ModelIcon id={model.id} />
                  </span>
                  <span className="m-tx">
                    <b>{model.name}</b>
                    <small>{t.models.items[model.id].role}</small>
                  </span>
                  <em />
                </div>
              ))}
              <div className="a-wallet">
                <div className="a-connect">{t.nav.connect}</div>
                <div className="a-acct">
                  <small>0x71C4…9e3F · {t.app.readOnly}</small>
                  <b>
                    <span className="a-bal" /> ETH
                  </b>
                  <em className="a-tier" />
                </div>
              </div>
            </aside>
            <div className="main">
              <header className="a-top">
                <b className="a-title" />
              </header>
              <div className="chat" />
              <div className="a-in">
                <div className="inp" data-placeholder={t.app.placeholder}>
                  <span className="inp-t" />
                  <i />
                </div>
                <div className="send">
                  <SendIcon />
                </div>
              </div>
            </div>
            <div className="pop">
              <div className="pop-c">
                <b>{t.demo.popTitle}</b>
                <small>{t.demo.popSub}</small>
                <div className="pop-o pw">MetaMask</div>
                <div className="pop-o">WalletConnect</div>
                <div className="pop-o">Ledger</div>
                <div className="pop-w">
                  <div className="spin" />
                  {t.demo.checking}
                </div>
              </div>
            </div>
            <svg className="cur" viewBox="0 0 22 22">
              <path d="M4 3l13 6.2-5.4 1.7L9.8 16.5z" fill="#fff" stroke="#0a1030" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <div className="mac-base" />
    </div>
  );
});

/** Laptop mockup that plays the scripted demo, with tabs to jump between scenarios. */
export function DemoShowcase() {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<DemoPlayer | null>(null);
  const [active, setActive] = useState(0);
  const scenarios = useMemo(() => buildScenarios(t), [t]);

  useEffect(() => {
    if (!rootRef.current) return;
    const player = createDemoPlayer(
      rootRef.current,
      scenarios,
      {
        selectModel: t.app.selectModel,
        connectFirst: t.app.connectFirst,
        pickAndAsk: t.app.pickAndAsk,
        unlocked: t.app.unlocked,
        allUnlocked: t.app.allUnlocked,
        lumenOnly: t.app.lumenOnly,
      },
      setActive,
    );
    playerRef.current = player;
    return () => player.destroy();
  }, [scenarios, t]);

  const tabs = [t.demo.tabCode, t.demo.tabPlan, t.demo.tabAsk, t.agent.tab];
  return (
    <div className="demo" ref={rootRef}>
      <MacScreen t={t} />
      <div className="demo-tabs">
        {tabs.map((label, index) => (
          <button key={label} type="button" className={index === active ? 'on' : ''} onClick={() => playerRef.current?.play(index)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
