import React, { useEffect, useMemo, useRef, useState } from 'react';
import { askPortfolioAssistant } from '../../api/client';
import './clippy-assistant.css';

const INITIAL_MESSAGE =
  'Hola, soy Clip. Puedo responder preguntas sobre experiencia, skills, proyectos y CV.';

export default function ClippyAssistant({ variant = 'desktop' }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: INITIAL_MESSAGE }]);
  const clipRef = useRef(null);

  const containerClass = useMemo(
    () =>
      `clippy-assistant clippy-assistant--${variant}${open ? ' clippy-assistant--open' : ''}${
        loading ? ' clippy-assistant--thinking' : ''
      }`,
    [variant, open, loading]
  );

  const onAsk = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const data = await askPortfolioAssistant(question);
      const answer = data?.answer || 'No encontré una respuesta en este momento.';
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: err?.body?.message || err?.message || 'No pude consultar la IA en este momento.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onMove = (e) => {
      const el = clipRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-6, Math.min(6, (e.clientX - cx) / 18));
      const dy = Math.max(-4, Math.min(4, (e.clientY - cy) / 24));
      el.style.setProperty('--eye-x', `${dx}px`);
      el.style.setProperty('--eye-y', `${dy}px`);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section className={containerClass} aria-live="polite">
      <button
        type="button"
        className="clippy-launcher"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Abrir asistente Clip"
      >
        <span className="clippy-avatar" aria-hidden="true" ref={clipRef}>
          <span className="clippy-wire" />
          <span className="clippy-eye clippy-eye--left" />
          <span className="clippy-eye clippy-eye--right" />
          <span className="clippy-mouth" />
        </span>
        <span className="clippy-launcher-text">Clip IA</span>
      </button>

      {open ? (
        <div className="clippy-panel">
          <header className="clippy-head">
            <strong>Asistente del portfolio</strong>
            <span className="clippy-status">{loading ? 'Pensando...' : 'En línea'}</span>
          </header>

          <div className="clippy-messages">
            {messages.map((m, idx) => (
              <div key={`${m.role}-${idx}`} className={`clippy-msg clippy-msg--${m.role}`}>
                {m.text}
              </div>
            ))}
          </div>

          <form className="clippy-form" onSubmit={onAsk}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame sobre Bruno..."
              maxLength={600}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Preguntar
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
