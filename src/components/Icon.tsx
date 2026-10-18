import type { SVGProps } from 'react';

const PATHS = {
  plan: <><rect x="3" y="4.5" width="18" height="16.5" rx="2.5" /><path d="M8 2.5v4M16 2.5v4M3 10h18" /></>,
  nutrition: <><path d="M21 12a9 9 0 1 1-9-9v9z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15z" /></>,
  grocery: <><path d="M5.5 8h13l-1.2 12.5H6.7z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  dishes: <><path d="M3 12h18a9 9 0 0 1-18 0z" /><path d="M8.5 8.5c0-1.5 1-2 1-3.5M14.5 8.5c0-1.5 1-2 1-3.5" /></>,
  settings: <><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></>,
  left: <path d="M15 18l-6-6 6-6" />,
  right: <path d="M9 18l6-6-6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" />,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></>,
  pencil: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, filled = false, ...rest }: {
  name: IconName;
  size?: number;
  filled?: boolean;
} & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
