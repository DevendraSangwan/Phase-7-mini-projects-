import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const savedTokensKey = 'markdown-note-tokens';

function getSavedTokens() {
  try {
    const tokens = JSON.parse(localStorage.getItem(savedTokensKey) || '[]');
    return Array.isArray(tokens) ? tokens.filter((token) => typeof token === 'string') : [];
  } catch (error) {
    console.error('Could not read saved notes from this browser:', error);
    return [];
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'The request failed.');
  return data;
}

function NotesApp() {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const [tokens, setTokens] = useState(getSavedTokens);
  const [activeToken, setActiveToken] = useState(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!window.SimpleMDE || !textareaRef.current) {
      setStatus('Markdown editor did not load. Check your internet connection and refresh.');
      return undefined;
    }
    const editor = new window.SimpleMDE({
      element: textareaRef.current,
      spellChecker: false,
      status: false,
      placeholder: 'Write your Markdown note here...',
      toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'code', 'preview', 'side-by-side', 'fullscreen']
    });
    editorRef.current = editor;
    return () => {
      editor.toTextArea();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(savedTokensKey, JSON.stringify(tokens));
    if (tokens.length === 0) {
      setNotes([]);
      return undefined;
    }
    let active = true;
    Promise.allSettled(tokens.map(async (token) => {
      const { note } = await api(`/api/notes/${encodeURIComponent(token)}`);
      return { ...note, shareToken: token };
    })).then((results) => {
      if (!active) return;
      const loaded = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);
      const rejected = results.filter((result) => result.status === 'rejected');
      if (rejected.length) console.error('Some saved notes could not be loaded:', rejected);
      setNotes(loaded);
    });
    return () => { active = false; };
  }, [tokens]);

  function rememberToken(token) {
    setTokens((current) => current.includes(token) ? current : [...current, token]);
  }

  function showNote(note, token) {
    setActiveToken(token);
    setTitle(note.title);
    if (editorRef.current) editorRef.current.value(note.content);
    setStatus('');
  }

  async function openNote(token) {
    try {
      const { note } = await api(`/api/notes/${encodeURIComponent(token)}`);
      showNote(note, token);
      history.replaceState(null, '', `/?share=${encodeURIComponent(token)}`);
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function saveNote(event) {
    event.preventDefault();
    if (!editorRef.current) {
      setStatus('Markdown editor is not ready yet.');
      return;
    }
    setBusy(true);
    setStatus('');
    const noteData = { title, content: editorRef.current.value() };
    try {
      if (activeToken) {
        await api(`/api/notes/${encodeURIComponent(activeToken)}`, {
          method: 'PUT',
          body: JSON.stringify(noteData)
        });
        setStatus('Your changes are saved.');
      } else {
        const { note } = await api('/api/notes', {
          method: 'POST',
          body: JSON.stringify(noteData)
        });
        setActiveToken(note.shareToken);
        setTokens((current) => current.includes(note.shareToken) ? current : [...current, note.shareToken]);
        history.replaceState(null, '', `/?share=${encodeURIComponent(note.shareToken)}`);
        setStatus('Note saved. Share the link to collaborate.');
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  function newNote() {
    setActiveToken(null);
    setTitle('');
    if (editorRef.current) editorRef.current.value('');
    history.replaceState(null, '', '/');
    setStatus('');
  }

  async function copyShareLink() {
    if (!activeToken) return;
    const url = new URL('/', location.origin);
    url.searchParams.set('share', activeToken);
    try {
      await navigator.clipboard.writeText(url.toString());
      setStatus('Share link copied to clipboard.');
    } catch (error) {
      console.error('Could not copy the share link:', error);
      setStatus(`Copy this link: ${url.toString()}`);
    }
  }

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('share');
    if (!token) return;
    api(`/api/notes/${encodeURIComponent(token)}`)
      .then(({ note }) => {
        showNote(note, token);
        rememberToken(token);
      })
      .catch((error) => setStatus(error.message));
  }, []);

  return (
    <main className="notes-app">
      <aside className="notes-sidebar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); newNote(); }}>
          <span className="brand-icon">M</span><span>NoteSpace<small>SHARED WORKSPACE</small></span>
        </a>
        <button className="new-note" type="button" onClick={newNote}><span>＋</span> New note</button>
        <p className="section-label">YOUR NOTES <span>{notes.length}</span></p>
        <nav className="note-list" aria-label="Your notes">
          {notes.map((note) => (
            <button className={`note-link${activeToken === note.shareToken ? ' active' : ''}`} key={note.shareToken} type="button" onClick={() => openNote(note.shareToken)}>
              <span className="note-icon">▤</span><span className="note-name">{note.title}</span>
            </button>
          ))}
          {!notes.length && <p className="empty-list">Your saved notes will appear here.</p>}
        </nav>
        <div className="sidebar-foot"><span className="online-dot"></span> Synced with MongoDB</div>
      </aside>
      <section className="notes-main">
        <header className="topbar"><span>Workspace <span className="crumb">/</span> <strong>{title || 'New note'}</strong></span><span className="collab-label">SHARED MARKDOWN</span></header>
        <div className="editor-wrap">
          <div className="editor-heading">
            <div><p className="eyebrow">YOUR IDEAS, IN ONE PLACE</p><h1>{activeToken ? 'Keep the team in sync.' : 'Start with a note.'}</h1><p className="subheading">Write, save, and share your thoughts in Markdown.</p></div>
            <div className="avatar-stack" aria-label="Collaborative notes"><span>A</span><span>+</span></div>
          </div>
          <form onSubmit={saveNote}>
            <label className="title-label" htmlFor="note-title">NOTE TITLE</label>
            <input id="note-title" className="title-input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength="120" placeholder="Give your note a title..." required />
            <label className="title-label markdown-label" htmlFor="markdown-editor">MARKDOWN</label>
            <textarea id="markdown-editor" ref={textareaRef} />
            <div className="editor-actions">
              <span className="save-status" aria-live="polite">{status}</span>
              <div className="action-buttons">
                {activeToken && <button className="share-button" type="button" onClick={copyShareLink}>Copy share link</button>}
                <button className="save-button" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save note'} <span aria-hidden="true">→</span></button>
              </div>
            </div>
          </form>
          <p className="privacy-tip"><span>i</span> Anyone with your share link can edit this note. Only share with people you trust.</p>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<NotesApp />);
