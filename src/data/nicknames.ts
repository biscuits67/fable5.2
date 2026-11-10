/**
 * Demo nickname rules. There is no backend, so "taken" is decided locally:
 * obvious and generic names are reserved, the way a real service would have lost them long ago.
 */
export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 20;

const RESERVED = new Set([
  'admin', 'administrator', 'root', 'support', 'help', 'moderator', 'mod', 'system', 'official', 'team',
  'test', 'tester', 'demo', 'user', 'username', 'name', 'nickname', 'guest', 'anon', 'anonymous', 'me',
  'crypto', 'eth', 'ether', 'ethereum', 'ethereumai', 'btc', 'bitcoin', 'sol', 'solana', 'usdt', 'usdc', 'bnb', 'doge',
  'wallet', 'trader', 'trading', 'trade', 'defi', 'nft', 'web3', 'token', 'coin', 'blockchain', 'whale', 'hodl', 'moon',
  'ai', 'bot', 'gpt', 'lumen', 'vector', 'forge', 'apex',
  'satoshi', 'nakamoto', 'vitalik', 'buterin', 'elon', 'musk',
  'king', 'boss', 'god', 'pro', 'master', 'legend', 'alpha', 'neo', 'max', 'alex', 'john', 'ivan',
  'qwerty', 'asdf', 'abc', 'abcd', 'aaa', 'xxx', 'lol', 'ok', 'hello', 'hi',
]);

const ALLOWED = /^[\p{L}\p{N}_]+$/u;
const ONLY_DIGITS = /^\d+$/;
/** Reserved word followed by digits, e.g. "crypto123" or "eth_2024". */
const RESERVED_WITH_DIGITS = /^(.+?)_?\d+$/;

export type NicknameIssue = 'short' | 'invalid' | 'taken';

/** Returns what is wrong with the nickname, or null when it can be used. */
export function nicknameIssue(raw: string): NicknameIssue | null {
  const name = raw.trim().toLowerCase();
  if (name.length < NICKNAME_MIN || name.length > NICKNAME_MAX) return 'short';
  if (!ALLOWED.test(name)) return 'invalid';
  if (ONLY_DIGITS.test(name) || RESERVED.has(name)) return 'taken';
  const base = RESERVED_WITH_DIGITS.exec(name)?.[1];
  return base && RESERVED.has(base) ? 'taken' : null;
}
