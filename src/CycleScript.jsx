import { useState, useCallback } from 'react'

const TOPICS = [
  'Training & FTP', 'Nutrition', 'Gear & Tech', 'Race Strategy',
  'Recovery', 'Route & Climbing', 'Psychology', 'Beginner Tips',
]

const FORMATS = [
  { value: 'listicle', label: 'Listicle — "5 ways to..."' },
  { value: 'myth', label: 'Myth busting — "The truth about..."' },
  { value: 'explainer', label: 'Explainer — "How X actually works"' },
  { value: 'mistake', label: 'Common mistakes' },
  { value: 'comparison', label: 'Comparison — "X vs Y"' },
  { value: 'challenge', label: '30-day challenge' },
]

const LEVELS = [
  { value: 'amateur', label: 'Amateur / recreational' },
  { value: 'intermediate', label: 'Intermediate (3–4 W/kg)' },
  { value: 'beginner', label: 'Complete beginner' },
  { value: 'all', label: 'All levels' },
]

const HUMOUR_LABELS = ['straight-laced', 'light banter', 'taking the mick', 'full roast mode']

const HUMOUR_PROMPTS = [
  'Clean, no-nonsense. Occasional dry wit fine.',
  'Light cycling humour — Strava obsession, suffering on climbs, joy of a tailwind.',
  'Lad banter tone. Take the mick out of gear snobs (£8k bike, still 2 W/kg), weight weenies, Strava KOM hunters. Affectionate but pointed. 2-3 funny lines per section minimum.',
  'Full comedian-coach. Every section needs a laugh-out-loud moment. Roast the culture relentlessly — bloke who upgrades groupset before learning to corner, guy in full pro kit on a 10-mile commute. Advice still solid — humour is the delivery vehicle.',
]

const FMT_MAP = {
  listicle: 'listicle ("5 ways to...")',
  myth: 'myth-busting ("The truth about...")',
  explainer: 'explainer ("How X actually works")',
  mistake: 'common mistakes ("Why you\'re doing X wrong")',
  comparison: 'comparison ("X vs Y")',
  challenge: '30-day challenge',
}

const LVL_MAP = {
  amateur: 'amateur/recreational cyclists',
  intermediate: 'intermediate cyclists targeting 3-4 W/kg',
  beginner: 'complete beginners',
  all: 'cyclists of all levels',
}

export default function CycleScript() {
  const [topic, setTopic] = useState('Training & FTP')
  const [format, setFormat] = useState('listicle')
  const [level, setLevel] = useState('amateur')
  const [humour, setHumour] = useState(2)
  const [custom, setCustom] = useState('')
  const [state, setState] = useState('idle')
  const [script, setScript] = useState(null)
  const [batches, setBatches] = useState([])
  const [error, setError] = useState({ msg: '', raw: '' })
  const [copied, setCopied] = useState('')

  const busy = state === 'loading'

  const callAPI = useCallback(async (prompt, maxTokens = 4000) => {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error))
    return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  }, [])

  const buildScriptPrompt = useCallback(() => `You are a YouTube script writer for a faceless cycling channel targeting ${LVL_MAP[level]}.

Write a complete YouTube video script in ${FMT_MAP[format]} format about: "${topic}".${custom ? `\nAngle: ${custom}` : ''}

TONE: ${HUMOUR_PROMPTS[humour]}

Return ONLY valid JSON (no markdown, no backticks, no explanation):
{"title":"YouTube title max 60 chars","hook":"first 15 seconds narration","intro":"30-second intro narration","sections":[{"heading":"heading","script":"2-3 paragraphs narration","b_roll":"B-roll suggestion for InVideo"}],"cta":"30-second outro with CTA","description":"150-word SEO YouTube description","tags":"10 comma-separated tags","duration_est":"X-Y mins","word_count":800}`,
  [topic, format, level, humour, custom])

  const generateScript = useCallback(async () => {
    setState('loading')
    try {
      const raw = await callAPI(buildScriptPrompt(), 4000)
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setScript(parsed)
      setState('script')
    } catch (e) {
      setError({ msg: e.message, raw: '' })
      setState('error')
    }
  }, [callAPI, buildScriptPrompt])

  const generateBatch = useCallback(async () => {
    setState('loading')
    const hint = humour >= 2 ? ' Lad banter tone — titles should hint at irreverence (e.g. "Why Your £5k Bike Won\'t Fix Your 2 W/kg Problem").' : ''
    const prompt = `Generate 10 YouTube video title ideas for a cycling channel targeting ${LVL_MAP[level]} cyclists. Mix formats.${hint}\nReturn ONLY a JSON array, no markdown:\n[{"title":"...","format":"listicle|myth|explainer|mistake|comparison","topic":"topic area"}]`
    try {
      const raw = await callAPI(prompt, 2000)
      setBatches(JSON.parse(raw.replace(/```json|```/g, '').trim()))
      setState('batch')
    } catch (e) {
      setError({ msg: e.message, raw: '' })
      setState('error')
    }
  }, [callAPI, level, humour])

  const pickBatch = (idea) => {
    setTopic(idea.topic)
    setFormat(idea.format)
    setCustom(`Specifically: ${idea.title}`)
    setTimeout(generateScript, 50)
  }

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 1500)
  }

  const scriptText = script
    ? `${script.title}\n\n[HOOK]\n${script.hook}\n\n[INTRO]\n${script.intro}\n\n` +
      (script.sections || []).map(s => `[${s.heading.toUpperCase()}]\n${s.script}\nB-ROLL: ${s.b_roll}`).join('\n\n') +
      `\n\n[CTA]\n${script.cta}`
    : ''

  const descText = script ? `${script.description}\n\nTAGS: ${script.tags}` : ''

  // ── Styles ──────────────────────────────────────────────────────────────────

  const c = {
    black: '#0a0a0a', white: '#f5f2ed', accent: '#e8ff47', accent2: '#ff6b35',
    g1: '#1a1a1a', g2: '#2a2a2a', g3: '#444', g4: '#888', g5: '#bbb',
  }

  const css = {
    wrap: { background: c.black, color: c.white, fontFamily: "'Barlow', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    header: { borderBottom: `1px solid ${c.g2}`, padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' },
    main: { display: 'grid', gridTemplateColumns: '300px 1fr', flex: 1, minHeight: 0 },
    leftPanel: { borderRight: `1px solid ${c.g2}`, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 57px)', position: 'sticky', top: 0 },
    leftScroll: { flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
    leftFooter: { padding: '0.75rem 1rem', borderTop: `1px solid ${c.g2}`, display: 'flex', flexDirection: 'column', gap: '6px', background: c.black },
    sLabel: { fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: c.g4, marginBottom: '0.4rem' },
    topicGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' },
    topicBtn: (active) => ({ background: active ? c.accent : c.g1, border: `1px solid ${active ? c.accent : c.g2}`, color: active ? c.black : c.g5, fontFamily: "'Barlow', sans-serif", fontSize: '0.68rem', padding: '7px 8px', cursor: 'pointer', textAlign: 'left', lineHeight: 1.3, fontWeight: active ? 500 : 400, transition: 'all 0.12s' }),
    select: { width: '100%', background: c.g1, border: `1px solid ${c.g2}`, color: c.white, fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem', padding: '8px 10px', appearance: 'none', outline: 'none' },
    textarea: { width: '100%', background: c.g1, border: `1px solid ${c.g2}`, color: c.white, fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem', padding: '8px 10px', outline: 'none', resize: 'none', boxSizing: 'border-box' },
    genBtn: { background: busy ? c.g3 : c.accent, color: busy ? c.g4 : c.black, border: 'none', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px', cursor: busy ? 'not-allowed' : 'pointer', width: '100%' },
    batchBtn: { background: 'transparent', color: busy ? c.g3 : c.g4, border: `1px solid ${busy ? c.g2 : c.g3}`, fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px', cursor: busy ? 'not-allowed' : 'pointer', width: '100%' },
    rightPanel: { display: 'flex', flexDirection: 'column' },
    outHeader: { borderBottom: `1px solid ${c.g2}`, padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: c.black, zIndex: 10 },
    outMeta: { fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: c.g4 },
    actBtn: { background: 'transparent', border: `1px solid ${c.g3}`, color: c.g5, fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', textTransform: 'uppercase', padding: '4px 10px', cursor: 'pointer' },
    outBody: { padding: '1.5rem', flex: 1 },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '0.75rem', opacity: 0.25 },
    scriptTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1, textTransform: 'uppercase', color: c.accent, marginBottom: '0.5rem' },
    statsRow: { display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: `1px solid ${c.g2}` },
    statVal: { fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', color: c.white },
    statKey: { fontFamily: "'DM Mono', monospace", fontSize: '0.52rem', color: c.g4, textTransform: 'uppercase', letterSpacing: '0.08em' },
    secTag: { fontFamily: "'DM Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: c.accent2, display: 'inline-block', border: `1px solid ${c.accent2}`, padding: '2px 6px', marginBottom: '0.4rem', opacity: 0.85 },
    secBody: { fontSize: '0.85rem', lineHeight: 1.8, color: c.g5, marginBottom: '1.1rem' },
    hookBody: { fontSize: '0.92rem', fontWeight: 500, color: c.white, lineHeight: 1.7, marginBottom: '1.1rem' },
    broll: { fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: c.g4, borderLeft: `2px solid ${c.g3}`, paddingLeft: '8px', marginBottom: '1.1rem' },
    descBox: { background: c.g1, border: `1px solid ${c.g2}`, borderLeft: `3px solid ${c.accent2}`, padding: '1rem', marginTop: '0.75rem' },
    descLbl: { fontFamily: "'DM Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: c.accent2, marginBottom: '0.4rem' },
    descText: { fontSize: '0.78rem', lineHeight: 1.7, color: c.g5 },
    tagsRow: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.6rem' },
    tag: { fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: c.g4, border: `1px solid ${c.g3}`, padding: '2px 6px' },
    batchItem: { background: c.g1, border: `1px solid ${c.g2}`, padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' },
    batchNum: { fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: c.g4, minWidth: '22px' },
    batchTitle: { fontSize: '0.78rem', color: c.g5, lineHeight: 1.3, flex: 1 },
    batchTag: { fontFamily: "'DM Mono', monospace", fontSize: '0.56rem', color: c.g4, border: `1px solid ${c.g3}`, padding: '2px 5px', whiteSpace: 'nowrap' },
    errBox: { background: '#1a0000', border: '1px solid #ff4444', borderLeft: '3px solid #ff4444', padding: '1rem', fontFamily: "'DM Mono', monospace" },
  }

  return (
    <div style={css.wrap}>
      <header style={css.header}>
        <div style={css.logo}>Cycle<span style={{ color: c.accent }}>Script</span></div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', color: c.g4, border: `1px solid ${c.g3}`, padding: '3px 8px' }}>AI SCRIPT GENERATOR</div>
      </header>

      <div style={css.main}>

        {/* LEFT */}
        <div style={css.leftPanel}>
          <div style={css.leftScroll}>
            <div>
              <div style={css.sLabel}>Topic</div>
              <div style={css.topicGrid}>
                {TOPICS.map(t => (
                  <button key={t} style={css.topicBtn(topic === t)} onClick={() => setTopic(t)}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={css.sLabel}>Format</div>
              <select style={css.select} value={format} onChange={e => setFormat(e.target.value)}>
                {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <div style={css.sLabel}>Rider level</div>
              <select style={css.select} value={level} onChange={e => setLevel(e.target.value)}>
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <div style={css.sLabel}>Banter level</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="range" min={0} max={3} step={1} value={humour}
                  style={{ flex: 1, accentColor: c.accent, cursor: 'pointer' }}
                  onChange={e => setHumour(parseInt(e.target.value))} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: c.accent, minWidth: '110px', textAlign: 'right' }}>
                  {HUMOUR_LABELS[humour]}
                </span>
              </div>
            </div>
            <div>
              <div style={css.sLabel}>Custom angle (optional)</div>
              <textarea style={css.textarea} rows={2}
                placeholder="e.g. time-crunched riders, winter training in Poland..."
                value={custom} onChange={e => setCustom(e.target.value)} />
            </div>
          </div>

          <div style={css.leftFooter}>
            <button style={css.genBtn} disabled={busy} onClick={generateScript}>
              {busy ? '⏳ Generating...' : '▶ Generate Script'}
            </button>
            <button style={css.batchBtn} disabled={busy} onClick={generateBatch}>
              ⊞ Generate 10 Titles
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div style={css.rightPanel}>
          <div style={css.outHeader}>
            <div style={css.outMeta}>
              {state === 'idle' && '— awaiting generation —'}
              {state === 'loading' && '— generating —'}
              {state === 'script' && script && `script ready — ${script.word_count || '?'} words · ${script.duration_est || '?'}`}
              {state === 'batch' && `${batches.length} ideas — click any to write the full script`}
              {state === 'error' && '— generation failed —'}
            </div>
            {state === 'script' && script && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={css.actBtn} onClick={() => copyText(scriptText, 'script')}>
                  {copied === 'script' ? 'Copied!' : 'Copy Script'}
                </button>
                <button style={css.actBtn} onClick={() => copyText(descText, 'desc')}>
                  {copied === 'desc' ? 'Copied!' : 'Copy Description'}
                </button>
              </div>
            )}
          </div>

          <div style={css.outBody}>
            {state === 'idle' && (
              <div style={css.empty}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.5rem', fontWeight: 800, color: c.g2 }}>WATTS &amp; WORDS</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: c.g4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pick a topic and hit generate</div>
              </div>
            )}

            {state === 'loading' && (
              <div style={css.empty}>
                <div style={{ width: '160px', height: '2px', background: c.g2, overflow: 'hidden' }}>
                  <style>{`@keyframes bs{0%{transform:translateX(-100%);width:30%}50%{width:60%}100%{transform:translateX(400%);width:30%}}`}</style>
                  <div style={{ height: '100%', background: c.accent, animation: 'bs 1.2s ease-in-out infinite', width: '30%' }} />
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: c.g4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>writing your script...</div>
              </div>
            )}

            {state === 'error' && (
              <div style={css.errBox}>
                <div style={{ color: '#ff6666', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Error</div>
                <div style={{ color: '#ffaaaa', fontSize: '0.78rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>{error.msg}</div>
                <pre style={{ color: '#ff8888', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.6rem', background: '#0d0000', padding: '0.6rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {error.raw || 'Check that ANTHROPIC_API_KEY is set in Railway environment variables.'}
                </pre>
              </div>
            )}

            {state === 'batch' && (
              <div>
                {batches.map((idea, i) => (
                  <div key={i} style={css.batchItem} onClick={() => pickBatch(idea)}>
                    <span style={css.batchNum}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={css.batchTitle}>{idea.title}</span>
                    <span style={css.batchTag}>{idea.format}</span>
                  </div>
                ))}
              </div>
            )}

            {state === 'script' && script && (
              <div>
                <div style={css.scriptTitle}>{script.title}</div>
                <div style={css.statsRow}>
                  <div><div style={css.statVal}>{script.duration_est || '?'}</div><div style={css.statKey}>Duration</div></div>
                  <div><div style={css.statVal}>{(script.word_count || 0).toLocaleString()}</div><div style={css.statKey}>Words</div></div>
                  <div><div style={css.statVal}>{topic}</div><div style={css.statKey}>Topic</div></div>
                </div>
                <div style={css.secTag}>Hook — 0:00</div>
                <div style={css.hookBody}>{script.hook}</div>
                <div style={css.secTag}>Intro — 0:15</div>
                <div style={css.secBody}>{script.intro}</div>
                {(script.sections || []).map((sec, i) => (
                  <div key={i}>
                    <div style={css.secTag}>{sec.heading}</div>
                    <div style={css.secBody}>{sec.script}</div>
                    <div style={css.broll}>B-ROLL → {sec.b_roll}</div>
                  </div>
                ))}
                <div style={css.secTag}>CTA / Outro</div>
                <div style={css.secBody}>{script.cta}</div>
                <div style={css.descBox}>
                  <div style={css.descLbl}>YouTube Description + Tags</div>
                  <div style={css.descText}>{script.description}</div>
                  <div style={css.tagsRow}>
                    {(script.tags || '').split(',').map((t, i) => (
                      <span key={i} style={css.tag}>{t.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
