import { useState } from 'react';
import { FolderIcon, FileIcon, ChevRightIcon } from './icons.js';

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: TreeNode[];
  modified?: boolean;
  added?: boolean;
}

interface Props { node: TreeNode; depth?: number; onSelect?: (path: string) => void; }

export function FileTreeNode({ node, depth = 0, onSelect }: Props) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.type === 'dir';
  const dotColor = node.modified ? 'var(--amber)' : node.added ? 'var(--green)' : null;

  return (
    <>
      <div
        onClick={() => isDir ? setOpen(o => !o) : onSelect?.(node.path)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: `3px 8px`, paddingLeft: 8 + depth * 14,
          fontSize: 12.5, color: 'var(--ink-2)',
          cursor: 'pointer', borderRadius: 4,
          userSelect: 'none',
        }}
      >
        {isDir
          ? <ChevRightIcon size={12} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s', color: 'var(--muted)', flexShrink: 0 }} />
          : <span style={{ width: 12, flexShrink: 0 }} />}
        {isDir
          ? <FolderIcon size={13} style={{ flexShrink: 0 }} />
          : <FileIcon size={13} style={{ flexShrink: 0, color: 'var(--muted)' }} />}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
        {dotColor && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />}
      </div>
      {isDir && open && node.children?.map((c, i) => (
        <FileTreeNode key={i} node={c} depth={depth + 1} onSelect={onSelect} />
      ))}
    </>
  );
}
