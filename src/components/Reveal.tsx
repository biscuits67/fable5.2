import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface RevealProps {
  as?: 'div' | 'h1' | 'h2' | 'p' | 'article' | 'section';
  /** Stagger step; each step delays the entrance by 90ms. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ as = 'div', delay = 0, className = '', style, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return createElement(
    as,
    { ref, className: `rv ${shown ? 'in' : ''} ${className}`.trim(), style: { ...style, '--d': delay } as CSSProperties },
    children,
  );
}
