// Step 5: the drafts. Copy only: there is no send path anywhere in the app (tests/letter/no-send-path.test.ts).
import { useEffect, useState } from 'react';
import type { CityRun, Contact } from '../contract/types';
import { draftCityReply, draftHcdRequest } from '../letter/draft';
import './letter.css';

type Tab = 'city' | 'hcd';

export function LetterSheet({ run, escalation, onClose }: { run: CityRun; escalation: Contact; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('city');
  const [copied, setCopied] = useState<'idle' | 'done' | 'blocked'>('idle');
  const text = tab === 'city' ? draftCityReply(run) : draftHcdRequest(run, escalation);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied('done');
    } catch (err) {
      console.error('Copying the letter failed:', err);
      setCopied('blocked');
    }
  };

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Letter drafts" onClick={onClose}>
      <div className="panel pop" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div><span className="stamp">Draft only</span><h2 className="sheet-title">Letter, {run.name}</h2></div>
          <button type="button" className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="tabs" role="tablist" aria-label="Who the letter is for">
          <button type="button" role="tab" aria-selected={tab === 'city'} onClick={() => { setTab('city'); setCopied('idle'); }}>To the city</button>
          <button type="button" role="tab" aria-selected={tab === 'hcd'} onClick={() => { setTab('hcd'); setCopied('idle'); }}>If the city won't fix it: to HCD</button>
        </div>
        <pre>{text}</pre>
        <div className="sheet-acts">
          <button type="button" className="btn solid" onClick={() => void copy()}>{copied === 'done' ? 'Copied' : 'Copy the text'}</button>
          <span className="sheet-note">{copied === 'blocked' ? 'Copy was blocked: select the text instead.' : 'You review it and send it yourself. Fast Track sends nothing.'}</span>
        </div>
      </div>
    </div>
  );
}
