import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  stroke?: number;
  style?: CSSProperties;
  className?: string;
}

const I = ({ d, size = 16, stroke = 1.6, style, className }: IconProps & { d: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round"
    style={style} className={className}>
    {d}
  </svg>
);

export const CommandIcon   = (p: IconProps) => <I {...p} d={<path d="M9 7a2 2 0 1 1-2 2h10a2 2 0 1 1-2-2v10a2 2 0 1 1 2-2H7a2 2 0 1 1 2 2V7Z"/>} />;
export const SearchIcon    = (p: IconProps) => <I {...p} d={<><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/></>} />;
export const PlusIcon      = (p: IconProps) => <I {...p} d={<path d="M12 5v14M5 12h14"/>} />;
export const XIcon         = (p: IconProps) => <I {...p} d={<path d="M6 6l12 12M18 6 6 18"/>} />;
export const CheckIcon     = (p: IconProps) => <I {...p} d={<path d="m5 12 5 5 9-11"/>} />;
export const ChevRightIcon = (p: IconProps) => <I {...p} d={<path d="m9 6 6 6-6 6"/>} />;
export const ChevDownIcon  = (p: IconProps) => <I {...p} d={<path d="m6 9 6 6 6-6"/>} />;
export const ChevUDIcon    = (p: IconProps) => <I {...p} d={<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>} />;
export const DotsIcon      = (p: IconProps) => <I {...p} d={<><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></>} />;
export const FolderIcon    = (p: IconProps) => <I {...p} d={<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>} />;
export const FolderOpenIcon= (p: IconProps) => <I {...p} d={<><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2"/><path d="m3 9 2 9a2 2 0 0 0 2 1.7h10a2 2 0 0 0 2-1.7l2-7H5"/></>} />;
export const FileIcon      = (p: IconProps) => <I {...p} d={<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/></>} />;
export const CodeIcon      = (p: IconProps) => <I {...p} d={<><path d="m9 8-5 4 5 4M15 8l5 4-5 4M13 4l-2 16"/></>} />;
export const TerminalIcon  = (p: IconProps) => <I {...p} d={<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/></>} />;
export const DiffIcon      = (p: IconProps) => <I {...p} d={<><path d="M12 3v6m0 0V8a3 3 0 0 0-3-3H6m6 4 3-3m-3 3-3-3M12 15v6m0 0v1a3 3 0 0 1 3 3h3m-6-4 3 3m-3-3-3 3"/></>} />;
export const ShieldIcon    = (p: IconProps) => <I {...p} d={<path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6l-7-3Z"/>} />;
export const GearIcon      = (p: IconProps) => <I {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.5a7 7 0 0 0-2 1.2L5 5.9 3 9.3l2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3 1 2 1.2L10 21h4l.6-2.5a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"/></>} />;
export const BellIcon      = (p: IconProps) => <I {...p} d={<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15Z"/><path d="M10 20a2 2 0 0 0 4 0"/></>} />;
export const TodoIcon      = (p: IconProps) => <I {...p} d={<><rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 2.5 2.5L16 9"/></>} />;
export const SendIcon      = (p: IconProps) => <I {...p} d={<path d="M4 11.5 21 4l-7 17-3-8-7-1.5Z"/>} />;
export const PauseIcon     = (p: IconProps) => <I {...p} d={<><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></>} />;
export const CubeIcon      = (p: IconProps) => <I {...p} d={<><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"/><path d="m4 7 8 4 8-4M12 11v10"/></>} />;
export const BranchIcon    = (p: IconProps) => <I {...p} d={<><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 8v8M18 11a4 4 0 0 1-4 4H6"/></>} />;
export const CopyIcon      = (p: IconProps) => <I {...p} d={<><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></>} />;
export const RefreshIcon   = (p: IconProps) => <I {...p} d={<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>} />;
export const ArrowUpIcon   = (p: IconProps) => <I {...p} d={<><path d="M12 19V5M5 12l7-7 7 7"/></>} />;
export const LinkIcon      = (p: IconProps) => <I {...p} d={<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/></>} />;
export const GlobeIcon     = (p: IconProps) => <I {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>} />;
export const PanelRightIcon= (p: IconProps) => <I {...p} d={<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M15 5v14"/></>} />;
export const SunIcon       = (p: IconProps) => <I {...p} d={<><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>} />;
export const MoonIcon      = (p: IconProps) => <I {...p} d={<path d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10Z"/>} />;
export const FireIcon      = (p: IconProps) => <I {...p} d={<path d="M12 3s4 4 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3s-3-1-3-5c0 0 6 2 6-1Z"/>} />;
export const BoltIcon      = (p: IconProps) => <I {...p} d={<path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z"/>} />;
export const UserIcon      = (p: IconProps) => <I {...p} d={<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>} />;
