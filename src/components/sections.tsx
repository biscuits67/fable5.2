import { useState, type CSSProperties } from 'react';
import { FULL_BALANCE, ENTRY_BALANCE, MODELS, formatEth, type ModelSpec } from '../data/models';
import { LOCALES, fmt, useI18n } from '../i18n';
import { SUPPORTED_WALLETS } from '../data/wallets';
import { APP_HASH, navigate } from '../lib/route';
import { useWallet } from '../state/wallet';
import { AgentRunCard } from './app/ChatBlocks';
import { AGENT_EVENTS } from '../data/agentRun';
import { DemoShowcase } from './demo/DemoShowcase';
import { EthMark, ModelIcon } from './icons';
import { Ball, Coin, Gem } from './Objects';
import { Reveal } from './Reveal';

export function Hero() {
  const { t } = useI18n();
  const { openModal } = useWallet();
  return (
    <header className="hero">
      <div className="obj o1"><Gem size={92} /></div>
      <div className="obj o2"><Coin size={120} /></div>
      <div className="obj o3"><Ball size={84} color="#5fe1ff" /></div>
      <div className="obj o4"><Gem size={54} /></div>
      <div className="obj o5"><Ball size={44} color="#7b6bff" /></div>
      <span className="stick s1">{t.hero.sticker1}</span>
      <span className="stick s2">{t.hero.sticker2}</span>
      <Reveal as="h1" className="d">
        {t.hero.line1}
        <br />
        {t.hero.line2} <b>{t.hero.highlight}</b>
      </Reveal>
      <Reveal as="p" className="lead" delay={1}>
        {t.hero.lead}
      </Reveal>
      <Reveal className="cta" delay={2}>
        <button type="button" className="btn btn-p" onClick={openModal}>
          {t.nav.connect}
        </button>
        <a className="btn btn-w" href="#demo">
          {t.hero.watch}
        </a>
      </Reveal>
    </header>
  );
}

export function DemoSection() {
  const { t } = useI18n();
  const steps = [t.demo.step1, t.demo.step2, t.demo.step3];
  return (
    <div className="wrap" id="demo">
      <Reveal className="panel">
        <h2 className="d">{t.demo.title}</h2>
        <ol className="steps">
          {steps.map((label, index) => (
            <li key={label}>
              <b>{index + 1}</b>
              {label}
            </li>
          ))}
        </ol>
        <DemoShowcase />
      </Reveal>
    </div>
  );
}

function CardArt({ model }: { model: ModelSpec }) {
  switch (model.id) {
    case 'lumen':
      return <Ball size={120} color="#1f8fe0" />;
    case 'vector':
      return <Coin size={120} />;
    case 'forge':
      return <Gem size={66} />;
    case 'apex':
      return (
        <>
          <Gem size={44} />
          <Gem size={66} reverse />
        </>
      );
  }
}

export function ModelsSection({ onSelect }: { onSelect: (model: ModelSpec) => void }) {
  const { t } = useI18n();
  return (
    <section id="models" className="wrap">
      <div className="sh">
        <Reveal as="h2" className="d">
          {t.models.title1}
          <br />
          {t.models.title2}
        </Reveal>
        <Reveal as="p" delay={1}>
          {t.models.lead}
        </Reveal>
      </div>
      <div className="grid">
        {MODELS.map((model, index) => {
          const copy = t.models.items[model.id];
          return (
            <Reveal key={model.id} as="article" delay={index} className="card" style={{ '--cb': model.color, '--cc': model.ink } as CSSProperties}>
              <div className="card-top">
                <span className="gate">{fmt(t.models.from, { min: formatEth(model.minBalance, 1) })}</span>
                <span className="card-ic">
                  <ModelIcon id={model.id} />
                </span>
              </div>
              <div className="art">
                <CardArt model={model} />
              </div>
              <h3 className="d">{model.name}</h3>
              <div className="role">{copy.role}</div>
              <p>{copy.text}</p>
              <button type="button" className="card-btn" onClick={() => onSelect(model)}>
                {t.models.details}
              </button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Rating({ value, label }: { value: number; label: string }) {
  return (
    <span className="rate" role="img" aria-label={label}>
      {[1, 2, 3].map((n) => (
        <i key={n} className={n <= value ? 'on' : ''} />
      ))}
    </span>
  );
}

export function CompareSection() {
  const { t } = useI18n();
  const c = t.compare;
  const ratingRows = [
    { key: 'speed', label: c.speed },
    { key: 'depth', label: c.depth },
    { key: 'code', label: c.code },
    { key: 'markets', label: c.markets },
  ] as const;

  return (
    <section id="compare" className="wrap">
      <div className="sh">
        <Reveal as="h2" className="d">
          {c.title}
        </Reveal>
        <Reveal as="p" delay={1}>
          {c.lead}
        </Reveal>
      </div>
      <Reveal className="cmp">
        <table>
          <thead>
            <tr>
              <th scope="col">{c.model}</th>
              {MODELS.map((model) => (
                <th scope="col" key={model.id}>
                  <span className="cmp-ic" style={{ '--mc': model.color } as CSSProperties}>
                    <ModelIcon id={model.id} />
                  </span>
                  <span className="d">{model.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{c.bestFor}</th>
              {MODELS.map((model) => (
                <td key={model.id}>{c.bestForItems[model.id]}</td>
              ))}
            </tr>
            {ratingRows.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {MODELS.map((model) => (
                  <td key={model.id}>
                    <Rating value={model.ratings[row.key]} label={fmt(c.ratingLabel, { value: model.ratings[row.key] })} />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row">{c.balance}</th>
              {MODELS.map((model) => (
                <td key={model.id}>
                  <b className="mono">{formatEth(model.minBalance, 1)} ETH</b>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Reveal>
    </section>
  );
}

const AGENT_PREVIEW_LOSS = 15;

export function AgentSection() {
  const { t } = useI18n();
  const { account, openModal } = useWallet();
  const a = t.agent;
  const canOpen = account !== null && account.balance >= FULL_BALANCE;

  return (
    <section id="agent" className="wrap">
      <Reveal className="agent">
        <div className="agent-tx">
          <h2 className="d">
            {a.sectionTitle1}
            <br />
            <em>{a.sectionTitle2}</em>
          </h2>
          <p className="agent-lead">{a.sectionLead}</p>
          <ul className="agent-points">
            {a.points.map(([title, text], index) => (
              <li key={title}>
                <b>{index + 1}</b>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="agent-rec">
            <b className="d">{formatEth(FULL_BALANCE, 1)} ETH</b>
            <div>
              <strong>{a.rec}</strong>
              <span>{a.recNote}</span>
            </div>
          </div>
          <button type="button" className="btn btn-p" onClick={() => (canOpen ? navigate(APP_HASH) : openModal())}>
            {a.cta}
          </button>
        </div>
        <div className="agent-vis">
          <AgentRunCard step={AGENT_EVENTS.length} done loss={AGENT_PREVIEW_LOSS} maxLog={5} />
        </div>
      </Reveal>
    </section>
  );
}

/** Position of a balance on the meter, which spans 0 to 0.65 ETH. */
const METER_MAX = 0.65;
const meterPos = (balance: number) => `${(balance / METER_MAX) * 100}%`;
const WIDGET_BALANCE = 0.52;

export function AccessSection() {
  const { t } = useI18n();
  const a = t.access;
  return (
    <section id="access" className="wrap">
      <div className="access">
        <Reveal className="big">
          <h2 className="d">
            {a.title1}
            <br />
            <em>{a.title2}</em>
          </h2>
          <p>{a.p1}</p>
          <p>{a.p2}</p>
          <div className="tags">
            {a.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </Reveal>
        <Reveal className="wid" delay={1}>
          <small>{a.widgetLabel}</small>
          <div className="num d">{formatEth(WIDGET_BALANCE)} ETH</div>
          <div className="meter">
            <i style={{ '--w': meterPos(WIDGET_BALANCE) } as CSSProperties} />
            <u style={{ left: meterPos(ENTRY_BALANCE) }} data-l={`${formatEth(ENTRY_BALANCE, 1)} ETH`} />
            <u style={{ left: meterPos(FULL_BALANCE) }} data-l={`${formatEth(FULL_BALANCE, 1)} ETH`} />
          </div>
          <div className="row">
            <span>{a.from01}</span>
            <b>Lumen</b>
          </div>
          <div className="row">
            <span>{a.from05}</span>
            <b>{a.plus}</b>
          </div>
          <div className="row">
            <span>{a.charged}</span>
            <b>0.00 ETH</b>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FaqSection() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="wrap">
      <div className="sh">
        <Reveal as="h2" className="d">
          {t.faq.title}
        </Reveal>
      </div>
      <div className="faq">
        {t.faq.items.map((item, index) => {
          const open = index === openIndex;
          return (
            <Reveal key={index} className={`qa ${open ? 'open' : ''}`} delay={Math.min(index, 3)}>
              <button type="button" aria-expanded={open} aria-controls={`faq-a-${index}`} id={`faq-q-${index}`} onClick={() => setOpenIndex(open ? null : index)}>
                <span>{item.q}</span>
                <i aria-hidden="true" />
              </button>
              <div className="qa-a" id={`faq-a-${index}`} role="region" aria-labelledby={`faq-q-${index}`}>
                <div>
                  <p>{item.a}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export function CtaSection() {
  const { t } = useI18n();
  const { openModal } = useWallet();
  return (
    <section className="wrap">
      <Reveal className="panel final">
        <div className="obj f1"><Gem size={70} /></div>
        <div className="obj f2"><Coin size={96} /></div>
        <h2 className="d">{t.cta.title}</h2>
        <p>{t.cta.lead}</p>
        <button type="button" className="btn btn-l" onClick={openModal}>
          {t.nav.connect}
        </button>
      </Reveal>
    </section>
  );
}

/** The strip repeats the wallet list so the loop can slide by exactly half its width without a visible seam. */
const STRIP_COPIES = [0, 1, 2, 3, 4, 5, 6, 7];
/** Large faded logos behind the footer; `index` points into SUPPORTED_WALLETS. */
const WATERMARKS = [
  { index: 0, className: 'wm1' },
  { index: 1, className: 'wm2' },
  { index: 4, className: 'wm3' },
];

export function Footer() {
  const { t, locale, setLocale } = useI18n();
  const links = [
    { href: '#demo', label: t.nav.how },
    { href: '#models', label: t.nav.models },
    { href: '#compare', label: t.nav.compare },
    { href: '#agent', label: t.agent.card },
    { href: '#access', label: t.nav.access },
    { href: '#faq', label: t.nav.faq },
  ];

  return (
    <footer className="foot">
      <div className="strip" aria-hidden="true">
        <div className="strip-track">
          {STRIP_COPIES.map((copy) =>
            SUPPORTED_WALLETS.map(({ name, icon }) => (
              <span key={`${copy}-${name}`}>
                <img src={icon} alt="" width={40} height={40} loading="lazy" />
                {name}
              </span>
            )),
          )}
        </div>
      </div>
      {WATERMARKS.map(({ index, className }) => (
        <img key={className} className={`foot-wm ${className}`} src={SUPPORTED_WALLETS[index].icon} alt="" aria-hidden="true" loading="lazy" />
      ))}
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <div className="logo d">
            <EthMark className="eth" />
            <span>ETHEREUM AI</span>
          </div>
          <p>{t.footer.tagline}</p>
        </div>

        <nav className="foot-col" aria-label={t.footer.product}>
          <h3>{t.footer.product}</h3>
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="foot-col">
          <h3>{t.footer.languages}</h3>
          <ul>
            {LOCALES.map(({ code, name }) => (
              <li key={code}>
                <button type="button" className={code === locale ? 'on' : ''} aria-pressed={code === locale} onClick={() => setLocale(code)}>
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="foot-col">
          <h3>{t.signup.supported}</h3>
          <ul className="foot-wallets">
            {SUPPORTED_WALLETS.map(({ name, icon }) => (
              <li key={name}>
                <img src={icon} alt="" width={28} height={28} loading="lazy" />
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wrap foot-legal">
        <p>{t.footer.disclaimer}</p>
        <small>{t.footer.rights}</small>
      </div>
      <div className="foot-mark d" aria-hidden="true">
        ETHEREUM AI
      </div>
    </footer>
  );
}
