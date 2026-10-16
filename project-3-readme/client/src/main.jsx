import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function ReadmeApp() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [generated, setGenerated] = useState(null);

  async function generateReadme(event) {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    setGenerated(null);

    const formData = new FormData(event.currentTarget);
    const features = String(formData.get('features') || '')
      .split('\n')
      .map((feature) => feature.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/readmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: formData.get('projectName'),
          description: formData.get('description'),
          features
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'README generation failed.');
      setGenerated({ content: data.readme, fileName: data.fileName || 'README.md' });
      setStatus('Draft generated and saved to your project database.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  function downloadReadme() {
    if (!generated) return;
    const blob = new Blob([generated.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = generated.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyReadme() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.content);
      setStatus('README copied to clipboard.');
    } catch (error) {
      console.error('Could not copy README:', error);
      setStatus('Could not access clipboard. Use the download button instead.');
    }
  }

  return (
    <main className="readme-app">
      <header className="topbar">
        <a className="brand" href="/"><span className="brand-icon">R</span><span>readme<span className="brand-dot">.</span><small>STUDIO</small></span></a>
        <span className="powered"><span></span> POWERED BY GEMINI</span>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="sparkle">✳</span> YOUR PROJECT, INTRODUCED</p>
          <h1>Give your project<br />the <span>README</span> it deserves.</h1>
          <p className="hero-subtitle">A thoughtful first draft, made from the details you share. Review it, make it yours, and get back to building.</p>
          <div className="hero-foot"><span className="check-icon">✓</span> Generated drafts are saved to your MongoDB project database.</div>
        </div>
        <div className="decorative-card" aria-hidden="true">
          <div className="mock-window"><div className="window-dots"><i></i><i></i><i></i><span>README.md</span></div><div className="mock-content"><b>#</b> project-name<div className="mock-line wide"></div><div className="mock-line short"></div><strong>## Features</strong><div className="mock-bullet"><i></i><span></span></div><div className="mock-bullet"><i></i><span></span></div><div className="mock-bullet"><i></i><span></span></div></div></div>
          <div className="floating-star">✦</div>
        </div>
      </section>
      <section className="workspace">
        <form className="project-form" onSubmit={generateReadme}>
          <div className="section-heading"><span className="step">01</span><div><h2>Tell us about your project</h2><p>Just the essentials. Gemini will help with the rest.</p></div></div>
          <label htmlFor="project-name">PROJECT NAME <span className="required">REQUIRED</span></label>
          <input id="project-name" name="projectName" maxLength="100" placeholder="e.g. TaskFlow, Pixel Pantry..." required />
          <label htmlFor="project-description">WHAT DOES IT DO? <span className="required">REQUIRED</span></label>
          <textarea id="project-description" name="description" maxLength="2000" rows="3" placeholder="A short description of the problem it solves and who it's for." required></textarea>
          <label htmlFor="project-features">KEY FEATURES <span className="optional">OPTIONAL · ONE PER LINE</span></label>
          <textarea id="project-features" name="features" rows="4" placeholder={'Real-time task collaboration\nCustom project boards\nWeekly progress reports'}></textarea>
          <div className="form-bottom"><span>Up to 20 features · Keep it short and clear</span><button className="generate-button" disabled={busy} type="submit">{busy ? 'Writing your draft...' : 'Generate my README'} <span>→</span></button></div>
        </form>
        <aside className="tips-card"><div className="tips-icon">✳</div><h3>A little detail goes a long way.</h3><p>Specific descriptions help create a more useful starting point. You can always edit your README after downloading it.</p><div className="tip-divider"></div><p className="privacy-note"><span>▣</span> Your API key stays private on the server. Generated drafts and inputs are saved to the configured MongoDB collection.</p></aside>
      </section>
      <p className={`status-message${status ? ' visible' : ''}`} aria-live="polite">{status}</p>
      {generated && (
        <section className="result-card">
          <div className="result-header"><div><p className="eyebrow">YOUR FIRST DRAFT</p><h2>README.md</h2></div><div className="result-actions"><button className="copy-button" type="button" onClick={copyReadme}>Copy</button><button className="download-button" type="button" onClick={downloadReadme}>Download README <span>↓</span></button></div></div>
          <pre><code>{generated.content}</code></pre>
        </section>
      )}
      <footer><span>README STUDIO</span><span>Make the first impression count.</span></footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<ReadmeApp />);
