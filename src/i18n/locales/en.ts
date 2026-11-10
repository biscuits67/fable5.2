interface ModelCopy {
  role: string;
  text: string;
  points: string[];
}

interface ScenarioCopy {
  prompt: string;
  reply: string;
}

export const en = {
  meta: { title: 'Ethereum AI — four AI models unlocked by your wallet' },
  nav: {
    how: 'How it works',
    models: 'Models',
    compare: 'Compare',
    access: 'Access',
    faq: 'FAQ',
    connect: 'Connect wallet',
    theme: 'Switch theme',
    language: 'Language',
    back: 'Back to site',
  },
  hero: {
    line1: 'AI that lives',
    line2: 'on',
    highlight: 'Ethereum',
    lead: 'Four models for trading, code and everyday questions. No plans, no payments. An active wallet is your pass.',
    watch: 'Watch it work',
    sticker1: 'No subscription',
    sticker2: '0 ETH in fees',
  },
  demo: {
    title: 'See it in action',
    step1: 'Connect a wallet',
    step2: 'Balance is checked',
    step3: 'Pick a model and ask',
    tabCode: 'Write a smart contract',
    tabPlan: 'Build a trading plan',
    tabAsk: 'Ask anything',
    popTitle: 'Connect a wallet',
    popSub: 'Read-only balance check. Nothing is charged.',
    checking: 'Checking balance…',
  },
  app: {
    models: 'Models',
    selectModel: 'Select a model',
    connectFirst: 'Connect a wallet to start',
    pickAndAsk: 'Pick a model and ask',
    placeholder: 'Ask anything…',
    unlocked: 'Unlocked',
    readOnly: 'read-only',
    allUnlocked: 'All 4 models unlocked',
    lumenOnly: 'Lumen unlocked · 3 need 0.5 ETH',
    noneUnlocked: 'Balance is below 0.1 ETH',
    demoBadge: 'Demo',
    send: 'Send',
    changeWallet: 'Change wallet',
    suggestions: 'Try asking',
    demoReply:
      'This is a demo build, so live answers are switched off. Tap the suggested prompt to see how {model} responds.',
    lockedTitle: '{model} needs {min} ETH',
    lockedBody:
      'Your demo wallet holds {balance} ETH. This is not a price: nothing is charged, the balance only has to be in your wallet.',
    lockedNoWallet: 'Connect an active wallet holding at least {min} ETH to open this model. Nothing is charged.',
    lockedCta: 'Change demo wallet',
    planChart: 'ETH · 12 weeks · buys marked',
  },
  scenarios: {
    code: {
      prompt: 'Write an ERC-20 token that burns 1% on every transfer',
      reply: 'Done. A minimal token on OpenZeppelin 5, with the 1% burn inside _update so it applies to every transfer.',
    } as ScenarioCopy,
    plan: {
      prompt: 'Build a DCA plan for ETH with 500 USDC a month',
      reply: 'Here is a plan that buys steadily and adds size on dips. Not financial advice.',
      rows: [
        ['Weekly buy', '115 USDC every Monday'],
        ['Dip rule', '2x size at 10% under the 30-day average'],
        ['Reserve', '40 USDC a month kept for dips'],
      ],
    },
    ask: {
      prompt: 'What is restaking, in simple words?',
      reply:
        'Restaking lets ETH you have already staked also secure other services, so one deposit can earn a second reward. The trade-off is extra risk: if one of those services penalises its validators, part of your stake can be cut.',
    } as ScenarioCopy,
    apex: {
      prompt: 'Design a yield vault and outline its contract',
      reply:
        'I would split this in two. Strategy: deposit ETH into a liquid staking token, lend it out, and rebalance weekly when the rate gap passes 0.5%. Contract: an ERC-4626 vault with a keeper-only rebalance function, a 10% cap on the performance fee and an emergency pause. I can write the full contract next.',
    } as ScenarioCopy,
  },
  models: {
    title1: 'Four models.',
    title2: 'Pick your power.',
    lead: 'One model opens at 0.1 ETH. Three more open at 0.5 ETH. You never pay for any of them.',
    from: 'from {min} ETH',
    details: 'Details',
    unlockAt: 'Unlocks at',
    modalCta: 'Connect wallet to try',
    modalOpen: 'Open in the app',
    items: {
      lumen: {
        role: 'Universal chat',
        text: 'Quick, clear answers about crypto and everything else.',
        points: [
          'Explains any crypto topic in plain words',
          'Summaries, translations and everyday tasks',
          'The fastest replies of the four',
        ],
      } as ModelCopy,
      vector: {
        role: 'Trading & strategies',
        text: 'Market research, DeFi plans and risk scenarios.',
        points: [
          'Builds entry, exit and DCA plans',
          'Compares DeFi yields and their risks',
          'Shows the reasoning behind every step',
        ],
      } as ModelCopy,
      forge: {
        role: 'Crypto code',
        text: 'Smart contracts, bots and scripts, written and reviewed.',
        points: [
          'Writes Solidity contracts and tests',
          'Builds trading bots and on-chain scripts',
          'Reviews your code and explains each fix',
        ],
      } as ModelCopy,
      apex: {
        role: 'Flagship reasoning',
        text: 'The deepest model for long tasks that mix markets and code.',
        points: [
          'Handles long, multi-step projects',
          'Combines market analysis with code',
          'The most thorough answers of the four',
        ],
      } as ModelCopy,
    },
  },
  compare: {
    title: 'Compare the models',
    lead: 'Same wallet, different strengths.',
    model: 'Model',
    bestFor: 'Best for',
    speed: 'Speed',
    depth: 'Reasoning depth',
    code: 'Code',
    markets: 'Market analysis',
    balance: 'Required balance',
    bestForItems: {
      lumen: 'Everyday questions',
      vector: 'Trading plans',
      forge: 'Contracts and bots',
      apex: 'Complex projects',
    },
    ratingLabel: '{value} out of 3',
  },
  access: {
    title1: "It's a check,",
    title2: 'not a charge.',
    p1: 'Empty, throwaway wallets are how bots and spam farms get in. Asking for an active wallet keeps the models fast for real people.',
    p2: 'We read one public number, your balance. Your ETH stays in your wallet the whole time.',
    tags: ['No subscription', 'No deposit', 'Nothing to sign', 'Read-only'],
    widgetLabel: 'Your wallet · read-only',
    from01: 'From 0.1 ETH',
    from05: 'From 0.5 ETH',
    plus: '+ Vector, Forge, Apex',
    charged: 'Charged for usage',
  },
  faq: {
    title: 'Questions, answered',
    items: [
      {
        q: 'Is the balance a payment?',
        a: 'No. Nothing is charged, moved or locked. The ETH only has to be in your wallet while you use the models.',
      },
      {
        q: 'Why do you require a balance at all?',
        a: 'Empty, freshly created wallets are the main tool of bots and spam farms. Asking for an active wallet keeps the models fast for real people.',
      },
      {
        q: 'What can the site see or do with my wallet?',
        a: 'It reads your public address and balance, the same data anyone can see on a block explorer. It cannot move funds, and it never asks you to sign a transaction.',
      },
      {
        q: 'Why do three models need 0.5 ETH?',
        a: 'Vector, Forge and Apex use far more computing power per request. A higher threshold keeps them available for active users.',
      },
      {
        q: 'What happens if my balance drops below the threshold?',
        a: 'The matching models lock again until the balance is back. You lose nothing, and there is nothing to cancel.',
      },
      {
        q: 'Is this the final product?',
        a: 'Not yet. This is a demo: the wallet connection and the answers are simulated so you can see how everything will work.',
      },
    ],
  },
  cta: {
    title: 'Ready when your wallet is.',
    lead: 'Connect in a few seconds. No sign-up, no card, no subscription.',
  },
  footer: {
    disclaimer:
      'Demo build. Wallet connection and AI answers are simulated. Not affiliated with the Ethereum Foundation. Nothing here is financial advice.',
    rights: '© 2026 Ethereum AI',
  },
  wallet: {
    demoMode: 'Demo mode · no real connection',
    title: 'Connect a wallet',
    sub: 'We only read your public balance. Nothing is charged, moved or locked.',
    kinds: { browser: 'Browser', mobile: 'Mobile', app: 'App', hardware: 'Hardware' },
    pickTitle: 'Choose a demo balance',
    pickSub: 'There is no real wallet in this demo. Pick a balance to see each access level.',
    optLow: 'Below the threshold',
    optMid: 'Lumen only',
    optHigh: 'All four models',
    checking: 'Checking balance',
    checkingSub: 'Reading the public on-chain balance via {wallet}',
    verified: 'Wallet verified',
    notEnough: 'Not enough yet',
    balance: 'Active balance',
    resAll: 'All four models are unlocked. Your ETH never leaves your wallet.',
    resLumen: 'Lumen is unlocked. Vector, Forge and Apex open at 0.5 ETH.',
    resNone:
      'This wallet holds less than 0.1 ETH, so the models stay locked. We ask for an active wallet to keep bots out. It is never a payment.',
    open: 'Open the app',
    tryOther: 'Try another balance',
    disconnect: 'Disconnect',
    close: 'Close',
  },
};

export type Dict = typeof en;
