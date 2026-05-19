// CycleScript.jsx
// Requires: @fontsource/barlow, @fontsource/barlow-condensed, @fontsource/dm-mono
// Or just load from Google Fonts in your index.html:
// <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500&display=swap" rel="stylesheet">

import { useState, useCallback } from 'react';

const TOPICS = [
  'Training & FTP', 'Nutrition', 'Gear & Tech', 'Race Strategy',
  'Recovery', 'Route & Climbing', 'Psychology', 'Beginner Tips',
];

const DISCIPLINES = [
  { value: 'road', label: '🚴 Road Cycling' },
  { value: 'gravel', label: '🪨 Gravel Biking' },
  { value: 'mtb', label: '🏔️ Mountain Biking' },
  { value: 'commuting', label: '🏙️ Commuting' },
  { value: 'indoor', label: '🖥️ Zwift / Indoor' },
  { value: 'general', label: '🚲 All Cycling' },
];

const TOPICS_BY_DISCIPLINE = {
  road: ['Training & FTP', 'Nutrition', 'Gear & Tech', 'Race Strategy', 'Recovery', 'Route & Climbing', 'Psychology', 'Beginner Tips'],
  gravel: ['Route Planning', 'Gear & Kit', 'Nutrition', 'Bike Setup', 'Navigation', 'Endurance', 'Tyre Choice', 'Beginner Tips'],
  mtb: ['Trail Skills', 'Bike Setup', 'Nutrition', 'Fitness & Training', 'Gear & Tech', 'Safety', 'Trail Etiquette', 'Beginner Tips'],
  commuting: ['Bike Choice', 'Safety & Visibility', 'Gear & Kit', 'Route Planning', 'Maintenance', 'Weather Riding', 'Locking & Security', 'Beginner Tips'],
  indoor: ['Zwift Tips', 'Training Plans', 'Setup & Kit', 'Races & Events', 'FTP & Fitness', 'Motivation', 'Recovery', 'Beginner Tips'],
  general: ['Training & FTP', 'Nutrition', 'Gear & Tech', 'Recovery', 'Psychology', 'Bike Maintenance', 'Cycling Culture', 'Beginner Tips'],
};

const DISCIPLINE_CONTEXT = {
  road: 'road cyclists',
  gravel: 'gravel cyclists who love adventure riding on mixed terrain',
  mtb: 'mountain bikers who ride trails and technical terrain',
  commuting: 'cycling commuters who ride to work daily',
  indoor: 'indoor cyclists who train on Zwift and smart trainers',
  general: 'cyclists of all disciplines',
};

const FORMATS = [
  { value: 'short', label: '⚡ YouTube Short — single tip (45-75 sec)' },
  { value: 'listicle', label: 'Listicle — "5 ways to..."' },
  { value: 'myth', label: 'Myth busting — "The truth about..."' },
  { value: 'explainer', label: 'Explainer — "How X actually works"' },
  { value: 'mistake', label: 'Common mistakes' },
  { value: 'comparison', label: 'Comparison — "X vs Y"' },
  { value: 'challenge', label: '30-day challenge' },
];

const LEVELS = [
  { value: 'amateur', label: 'Amateur / recreational' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'beginner', label: 'Complete beginner' },
  { value: 'all', label: 'All levels' },
];

const LENGTHS = [
  { value: 'short', label: '⚡ YouTube Short — 45-75 sec', words: '100-130 words maximum. ONE single tip only. Hook (5 sec) → tip → CTA. Extremely punchy, no fluff whatsoever.' },
  { value: 'short_vid', label: 'Short — 2-3 mins', words: '300-400 words, maximum 2 punchy main points, no fluff' },
  { value: 'medium', label: 'Medium — 4-5 mins (recommended)', words: '500-650 words, 3 main points' },
  { value: 'long', label: 'Long — 7-8 mins (high credit cost)', words: '900-1100 words, 5 main points' },
];

const HUMOUR_LABELS = ['straight-laced', 'light banter', 'taking the mick', 'full roast mode'];

const HUMOUR_PROMPTS = [
  'Clean, no-nonsense. Occasional dry wit fine.',
  'Light cycling humour — Strava obsession, suffering on climbs, joy of a tailwind.',
  'Lad banter tone. Take the mick out of gear snobs (£8k bike, still 2 W/kg), weight weenies, Strava KOM hunters. Affectionate but pointed. 2-3 funny lines per section minimum.',
  'Full comedian-coach. Every section needs a laugh-out-loud moment. Roast the culture — bloke who upgrades groupset before learning to corner, guy in full pro kit on a 10-mile commute. Advice still solid — humour is the delivery vehicle.',
];

const FMT_MAP = {
  short: 'YouTube Short (single punchy tip, 45-75 seconds)',
  listicle: 'listicle ("5 ways to...")',
  myth: 'myth-busting ("The truth about...")',
  explainer: 'explainer ("How X actually works")',
  mistake: 'common mistakes ("Why you\'re doing X wrong")',
  comparison: 'comparison ("X vs Y")',
  challenge: '30-day challenge',
};

const LVL_MAP = {
  amateur: 'amateur/recreational cyclists',
  intermediate: 'intermediate cyclists targeting 3-4 W/kg',
  beginner: 'complete beginners',
  all: 'cyclists of all levels',
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  wrap: {
    background: '#0a0a0a', color: '#f5f2ed', fontFamily: "'Barlow', sans-serif",
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
  },
  header: {
    borderBottom: '1px solid #2a2a2a', padding: '0.75rem 1.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.4rem',
    fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  logoAccent: { color: '#e8ff47' },
  headerTag: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', color: '#888',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    border: '1px solid #444', padding: '3px 8px',
  },
  main: { display: 'grid', gridTemplateColumns: '300px 1fr', flex: 1 },
  leftPanel: {
    borderRight: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column',
  },
  leftScroll: {
    flex: 1, overflowY: 'auto', padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  leftFooter: {
    padding: '0.75rem 1rem', borderTop: '1px solid #2a2a2a',
    display: 'flex', flexDirection: 'column', gap: '6px', background: '#0a0a0a',
  },
  sLabel: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.15em',
    textTransform: 'uppercase', color: '#888', marginBottom: '0.4rem',
  },
  topicGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' },
  topicBtn: (active) => ({
    background: active ? '#e8ff47' : '#1a1a1a',
    border: `1px solid ${active ? '#e8ff47' : '#2a2a2a'}`,
    color: active ? '#0a0a0a' : '#bbb',
    fontFamily: "'Barlow', sans-serif", fontSize: '0.68rem',
    padding: '6px 7px', cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.3, fontWeight: active ? 500 : 400,
    transition: 'all 0.12s',
  }),
  select: {
    width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
    color: '#f5f2ed', fontFamily: "'Barlow', sans-serif", fontSize: '0.78rem',
    padding: '8px 10px', appearance: 'none', outline: 'none',
  },
  textarea: {
    width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
    color: '#f5f2ed', fontFamily: "'Barlow', sans-serif", fontSize: '0.78rem',
    padding: '8px 10px', outline: 'none', resize: 'none',
    boxSizing: 'border-box',
  },
  humourRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  humourVal: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: '#e8ff47',
    minWidth: '105px', textAlign: 'right',
  },
  genBtn: (disabled) => ({
    background: disabled ? '#444' : '#e8ff47',
    color: disabled ? '#888' : '#0a0a0a',
    border: 'none', fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', padding: '11px', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.12s', width: '100%',
  }),
  batchBtn: (disabled) => ({
    background: 'transparent', color: disabled ? '#555' : '#888',
    border: `1px solid ${disabled ? '#333' : '#444'}`,
    fontFamily: "'DM Mono', monospace", fontSize: '0.62rem',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '9px', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.12s', width: '100%',
  }),
  rightPanel: { display: 'flex', flexDirection: 'column' },
  outHeader: {
    borderBottom: '1px solid #2a2a2a', padding: '0.65rem 1.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  outMeta: { fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: '#888' },
  outActions: { display: 'flex', gap: '5px' },
  actBtn: {
    background: 'transparent', border: '1px solid #444', color: '#bbb',
    fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
    textTransform: 'uppercase', padding: '4px 9px', cursor: 'pointer',
  },
  outBody: { flex: 1, overflowY: 'auto', padding: '1.25rem' },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%', gap: '0.75rem', opacity: 0.25,
  },
  emptyBig: {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.5rem',
    fontWeight: 800, color: '#2a2a2a',
  },
  emptySm: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: '#888',
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  scriptTitle: {
    fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem',
    fontWeight: 800, lineHeight: 1.1, textTransform: 'uppercase',
    color: '#e8ff47', marginBottom: '0.4rem',
  },
  statsRow: {
    display: 'flex', gap: '1.25rem', marginBottom: '1.1rem',
    paddingBottom: '1.1rem', borderBottom: '1px solid #2a2a2a',
  },
  statVal: { fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#f5f2ed' },
  statKey: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.52rem', color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  secTag: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#ff6b35', display: 'inline-block',
    border: '1px solid #ff6b35', padding: '2px 6px', marginBottom: '0.35rem', opacity: 0.85,
  },
  secBody: { fontSize: '0.84rem', lineHeight: 1.8, color: '#bbb', marginBottom: '1rem' },
  hookBody: {
    fontSize: '0.9rem', fontWeight: 500, color: '#f5f2ed',
    lineHeight: 1.7, marginBottom: '1rem',
  },
  broll: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: '#888',
    borderLeft: '2px solid #444', paddingLeft: '7px', marginBottom: '1rem',
  },
  descBox: {
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderLeft: '3px solid #ff6b35', padding: '0.9rem', marginTop: '0.5rem',
  },
  descLbl: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#ff6b35', marginBottom: '0.4rem',
  },
  descText: { fontSize: '0.76rem', lineHeight: 1.7, color: '#bbb' },
  tagsRow: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.6rem' },
  tag: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: '#888',
    border: '1px solid #444', padding: '2px 6px',
  },
  batchItem: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', padding: '9px 11px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px',
    marginBottom: '4px', transition: 'all 0.1s',
  },
  batchNum: { fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: '#888', minWidth: '20px' },
  batchTitle: { fontSize: '0.76rem', color: '#bbb', lineHeight: 1.3, flex: 1 },
  batchTag: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', color: '#888',
    border: '1px solid #444', padding: '2px 5px', whiteSpace: 'nowrap',
  },
  errBox: {
    background: '#1a0000', border: '1px solid #ff4444',
    borderLeft: '3px solid #ff4444', padding: '1rem',
    fontFamily: "'DM Mono', monospace",
  },
  errTitle: { color: '#ff6666', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' },
  errMsg: { color: '#ffaaaa', fontSize: '0.76rem', marginBottom: '0.75rem', lineHeight: 1.6 },
  errRaw: {
    color: '#ff8888', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
    fontSize: '0.58rem', background: '#0d0000', padding: '0.6rem',
    maxHeight: '150px', overflowY: 'auto',
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CycleScript() {
  const [topic, setTopic] = useState('Training & FTP');
  const [discipline, setDiscipline] = useState('road');
  const [format, setFormat] = useState('short');
  const [level, setLevel] = useState('amateur');
  const [length, setLength] = useState('short');
  const [humour, setHumour] = useState(2);
  const [custom, setCustom] = useState('');
  const [state, setState] = useState('idle');
  const [script, setScript] = useState(null);
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState({ msg: '', raw: '' });
  const [copied, setCopied] = useState('');

  const busy = state === 'loading';

  // When discipline changes, reset topic to first in that discipline's list
  const handleDisciplineChange = (d) => {
    setDiscipline(d);
    setTopic(TOPICS_BY_DISCIPLINE[d][0]);
  };

  const callAPI = useCallback(async (prompt, maxTokens = 4000) => {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  }, []);

  const buildScriptPrompt = useCallback(() => {
    const lengthObj = LENGTHS.find(l => l.value === length);
    const isShort = format === 'short' || length === 'short';
    const disciplineCtx = DISCIPLINE_CONTEXT[discipline];
    return `You are a YouTube script writer for a faceless cycling channel targeting ${LVL_MAP[level]} who are ${disciplineCtx}.

Write a YouTube video script in ${FMT_MAP[format]} format about: "${topic}".${custom ? `\nAngle: ${custom}` : ''}

LENGTH: ${lengthObj.words}. Be concise and punchy — do not pad. Every sentence must earn its place.${isShort ? '\nThis is a YOUTUBE SHORT — maximum 130 words total. One hook, one tip, one CTA. No intro waffle.' : ''}

TONE: ${HUMOUR_PROMPTS[humour]}

Return ONLY valid JSON (no markdown, no backticks, no explanation):
{"title":"YouTube title max 60 chars","hook":"punchy opening line","intro":"${isShort ? 'skip — leave empty string' : '20-second intro'}","sections":[{"heading":"heading","script":"narration — tight and punchy","b_roll":"B-roll suggestion"}],"cta":"${isShort ? '10-second' : '20-second'} outro with CTA","description":"120-word SEO YouTube description","tags":"10 comma-separated tags","duration_est":"${isShort ? '45-75 sec' : 'X-Y mins'}","word_count":${isShort ? 120 : 400}}`;
  }, [topic, discipline, format, level, length, humour, custom]);

  const generateScript = useCallback(async () => {
    setState('loading');
    try {
      const raw = await callAPI(buildScriptPrompt(), 4000);
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setScript(parsed);
      setState('script');
    } catch (e) {
      setError({ msg: e.message, raw: '' });
      setState('error');
    }
  }, [callAPI, buildScriptPrompt]);

  const generateBatch = useCallback(async () => {
    setState('loading');
    const hint = humour >= 2
      ? ' Lad banter tone — titles should hint at irreverence (e.g. "Why Your £5k Bike Won\'t Fix Your 2 W/kg Problem").'
      : '';
    const prompt = `Generate 10 YouTube video title ideas for a cycling channel targeting ${LVL_MAP[level]} cyclists. Mix formats.${hint}\nReturn ONLY a JSON array, no markdown:\n[{"title":"...","format":"listicle|myth|explainer|mistake|comparison","topic":"topic area"}]`;
    try {
      const raw = await callAPI(prompt, 2000);
      const ideas = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setBatches(ideas);
      setState('batch');
    } catch (e) {
      setError({ msg: e.message, raw: '' });
      setState('error');
    }
  }, [callAPI, level, humour]);

  const pickBatch = (idea) => {
    setTopic(idea.topic);
    setFormat(idea.format);
    setCustom(`Specifically: ${idea.title}`);
    setTimeout(generateScript, 50);
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  const scriptText = script
    ? `${script.title}\n\n[HOOK]\n${script.hook}\n\n[INTRO]\n${script.intro}\n\n` +
      (script.sections || []).map(s => `[${s.heading.toUpperCase()}]\n${s.script}\nB-ROLL: ${s.b_roll}`).join('\n\n') +
      `\n\n[CTA]\n${script.cta}`
    : '';

  const descText = script ? `${script.description}\n\nTAGS: ${script.tags}` : '';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={S.wrap}>
      <header style={S.header}>
        <div style={S.logo}>Cycle<span style={S.logoAccent}>Script</span></div>
        <div style={S.headerTag}>AI Script Generator</div>
      </header>

      <div style={S.main}>

        {/* LEFT PANEL */}
        <div style={S.leftPanel}>
          <div style={S.leftScroll}>

            <div>
              <div style={S.sLabel}>Discipline</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                {DISCIPLINES.map(d => (
                  <button key={d.value} style={S.topicBtn(discipline === d.value)} onClick={() => handleDisciplineChange(d.value)}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={S.sLabel}>Topic</div>
              <div style={S.topicGrid}>
                {TOPICS_BY_DISCIPLINE[discipline].map(t => (
                  <button key={t} style={S.topicBtn(topic === t)} onClick={() => setTopic(t)}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={S.sLabel}>Format</div>
              <select style={S.select} value={format} onChange={e => setFormat(e.target.value)}>
                {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            <div>
              <div style={S.sLabel}>Rider level</div>
              <select style={S.select} value={level} onChange={e => setLevel(e.target.value)}>
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <div>
              <div style={S.sLabel}>Video length</div>
              <select style={S.select} value={length} onChange={e => setLength(e.target.value)}>
                {LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <div>
              <div style={S.sLabel}>Banter level</div>
              <div style={S.humourRow}>
                <input type="range" min={0} max={3} step={1} value={humour}
                  style={{ flex: 1, accentColor: '#e8ff47', cursor: 'pointer' }}
                  onChange={e => setHumour(parseInt(e.target.value))} />
                <span style={S.humourVal}>{HUMOUR_LABELS[humour]}</span>
              </div>
            </div>

            <div>
              <div style={S.sLabel}>Custom angle (optional)</div>
              <textarea style={S.textarea} rows={2}
                placeholder="e.g. time-crunched riders, winter training..."
                value={custom} onChange={e => setCustom(e.target.value)} />
            </div>

          </div>

          <div style={S.leftFooter}>
            <button style={S.genBtn(busy)} disabled={busy} onClick={generateScript}>
              {busy ? '⏳ Generating...' : '▶ Generate Script'}
            </button>
            <button style={S.batchBtn(busy)} disabled={busy} onClick={generateBatch}>
              ⊞ Generate 10 Titles
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={S.rightPanel}>
          <div style={S.outHeader}>
            <div style={S.outMeta}>
              {state === 'idle' && '— awaiting generation —'}
              {state === 'loading' && '— generating —'}
              {state === 'script' && script && `script ready — ${script.word_count || '?'} words · ${script.duration_est || '?'}`}
              {state === 'batch' && `${batches.length} ideas — click any to generate the full script`}
              {state === 'error' && '— generation failed —'}
            </div>
            {state === 'script' && script && (
              <div style={S.outActions}>
                <button style={S.actBtn} onClick={() => copyText(scriptText, 'script')}>
                  {copied === 'script' ? 'Copied!' : 'Copy Script'}
                </button>
                <button style={S.actBtn} onClick={() => copyText(descText, 'desc')}>
                  {copied === 'desc' ? 'Copied!' : 'Copy Description'}
                </button>
              </div>
            )}
          </div>

          <div style={S.outBody}>

            {state === 'idle' && (
              <div style={S.empty}>
                <div style={S.emptyBig}>WATTS &amp; WORDS</div>
                <div style={S.emptySm}>Select topic → generate</div>
              </div>
            )}

            {state === 'loading' && (
              <div style={{ ...S.empty, opacity: 1 }}>
                <div style={{ width: '160px', height: '2px', background: '#2a2a2a', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#e8ff47', animation: 'barSlide 1.2s ease-in-out infinite', width: '30%' }} />
                </div>
                <div style={S.emptySm}>generating script...</div>
                <style>{`@keyframes barSlide{0%{transform:translateX(-100%);width:30%}50%{width:60%}100%{transform:translateX(400%);width:30%}}`}</style>
              </div>
            )}

            {state === 'error' && (
              <div style={S.errBox}>
                <div style={S.errTitle}>Error</div>
                <div style={S.errMsg}>{error.msg}</div>
                <pre style={S.errRaw}>{error.raw || '(no response body — check your /api/claude proxy is running)'}</pre>
              </div>
            )}

            {state === 'batch' && (
              <div>
                {batches.map((idea, i) => (
                  <div key={i} style={S.batchItem} onClick={() => pickBatch(idea)}>
                    <span style={S.batchNum}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={S.batchTitle}>{idea.title}</span>
                    <span style={S.batchTag}>{idea.format}</span>
                  </div>
                ))}
              </div>
            )}

            {state === 'script' && script && (
              <div>
                <div style={S.scriptTitle}>{script.title}</div>
                <div style={S.statsRow}>
                  <div><div style={S.statVal}>{script.duration_est || '?'}</div><div style={S.statKey}>Duration</div></div>
                  <div><div style={S.statVal}>{(script.word_count || 0).toLocaleString()}</div><div style={S.statKey}>Words</div></div>
                  <div><div style={S.statVal}>{topic}</div><div style={S.statKey}>Topic</div></div>
                </div>

                <div style={S.secTag}>Hook — 0:00</div>
                <div style={S.hookBody}>{script.hook}</div>

                <div style={S.secTag}>Intro — 0:15</div>
                <div style={S.secBody}>{script.intro}</div>

                {(script.sections || []).map((sec, i) => (
                  <div key={i}>
                    <div style={S.secTag}>{sec.heading}</div>
                    <div style={S.secBody}>{sec.script}</div>
                    <div style={S.broll}>B-ROLL → {sec.b_roll}</div>
                  </div>
                ))}

                <div style={S.secTag}>CTA / Outro</div>
                <div style={S.secBody}>{script.cta}</div>

                <div style={S.descBox}>
                  <div style={S.descLbl}>YouTube Description + Tags</div>
                  <div style={S.descText}>{script.description}</div>
                  <div style={S.tagsRow}>
                    {(script.tags || '').split(',').map((t, i) => (
                      <span key={i} style={S.tag}>{t.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
