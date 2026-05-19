import { useState, useEffect, useRef } from 'react';
import { FolderIcon, FolderOpenIcon, XIcon, ChevRightIcon } from '../atoms/icons.js';
import { api } from '../../api/client.js';

interface Entry {
  name: string;
  path: string;
  type: 'dir' | 'file';
}

interface Props {
  onConfirm: (path: string) => void;
  onCancel: () => void;
}

export function DirectoryPickerDialog({ onConfirm, onCancel }: Props) {
  const [currentPath, setCurrentPath] = useState('~');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [inputVal, setInputVal] = useState('~');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    navigate('~');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  async function navigate(path: string) {
    setLoading(true);
    setError('');
    try {
      const res = await api.listDir(path) as { path: string; entries: Entry[] };
      const dirs = res.entries.filter(e => e.type === 'dir');
      setCurrentPath(res.path);
      setInputVal(res.path);
      setEntries(dirs);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleInputSubmit() {
    await navigate(inputVal);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleInputSubmit();
    if (e.key === 'Escape') onCancel();
  }

  function pathSegments(p: string): { label: string; path: string }[] {
    if (!p || p === '/') return [{ label: '/', path: '/' }];
    const parts = p.split('/').filter(Boolean);
    return [
      { label: '/', path: '/' },
      ...parts.map((part, i) => ({
        label: part,
        path: '/' + parts.slice(0, i + 1).join('/'),
      })),
    ];
  }

  const segments = pathSegments(currentPath);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(31,30,27,.42)', backdropFilter: 'blur(2px)',
        display: 'grid', placeItems: 'center', zIndex: 200, padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        width: 'min(540px, 100%)',
        background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 14,
        boxShadow: 'var(--shadow-3)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        maxHeight: '80vh',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FolderOpenIcon size={16} style={{ color: 'var(--rust)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Select Working Directory</span>
          <button className="btn ghost sm" onClick={onCancel}><XIcon size={13} /></button>
        </div>

        {/* Path input */}
        <div style={{ padding: '12px 16px 8px' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              className="input"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="/path/to/directory"
              style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 12.5 }}
            />
            <button className="btn sm" onClick={handleInputSubmit} disabled={loading}>
              Go
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--rust)' }}>{error}</div>
          )}
        </div>

        {/* Breadcrumb */}
        <div style={{
          padding: '4px 16px 8px',
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2,
          fontSize: 12, color: 'var(--muted)',
        }}>
          {segments.map((seg, i) => (
            <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {i > 0 && <ChevRightIcon size={11} />}
              <button
                className="btn ghost sm"
                onClick={() => navigate(seg.path)}
                style={{ padding: '1px 4px', fontSize: 12, fontFamily: 'var(--mono)', minHeight: 0 }}
              >
                {seg.label}
              </button>
            </span>
          ))}
        </div>

        {/* Entries list */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '4px 8px',
          borderTop: '1px solid var(--line)', minHeight: 160,
        }}>
          {loading && (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          )}
          {!loading && entries.length === 0 && !error && (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No subdirectories</div>
          )}
          {!loading && entries.map(entry => (
            <div
              key={entry.path}
              onClick={() => navigate(entry.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                fontSize: 13,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <FolderIcon size={14} style={{ color: 'var(--rust)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.name}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button className="btn ghost" onClick={onCancel}>取消</button>
          <button
            className="btn primary"
            onClick={() => onConfirm(inputVal || currentPath)}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
