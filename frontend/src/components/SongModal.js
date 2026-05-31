import React, { useState, useEffect } from 'react';
import { songAPI } from '../services/api';
import './SongModal.css';

const COLORS = [
  { theme: '#0d0d1a', accent: '#e94560' },
  { theme: '#0a1628', accent: '#4fc3f7' },
  { theme: '#0d1a0d', accent: '#69f0ae' },
  { theme: '#1a0d0d', accent: '#ff6b6b' },
  { theme: '#1a0d1a', accent: '#ce93d8' },
  { theme: '#1a1200', accent: '#ffd54f' },
  { theme: '#001a1a', accent: '#26c6da' },
  { theme: '#1a1a0d', accent: '#aed581' },
];

export default function SongModal({ song, onClose, onSaved }) {
  const isEdit = !!song;
  const [form, setForm] = useState({
    title: '', artist: '', album: '', releaseYear: '', genre: '',
    themeColor: '#0d0d1a', accentColor: '#e94560',
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (song) {
      setForm({
        title: song.title || '',
        artist: song.artist || '',
        album: song.album || '',
        releaseYear: song.releaseYear || '',
        genre: song.genre || '',
        themeColor: song.themeColor || '#0d0d1a',
        accentColor: song.accentColor || '#e94560',
      });
      if (song.coverUrl) setCoverPreview(song.coverUrl);
    }
  }, [song]);

  const handleFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'audio') {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    } else {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !audioFile) { setError('Fișierul MP3 este obligatoriu.'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        // ensure numeric value for releaseYear
        if (k === 'releaseYear') fd.append(k, String(Number(v)));
        else fd.append(k, v);
      });
      if (audioFile) fd.append('audioFile', audioFile);
      if (coverFile) fd.append('coverFile', coverFile);

      if (isEdit) {
        await songAPI.update(song.id, fd);
      } else {
        await songAPI.create(fd);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'A apărut o eroare.');
    } finally {
      setLoading(false);
    }
  };

  const accent = form.accentColor;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ '--modal-accent': accent }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Editează melodia' : 'Adaugă melodie nouă'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Color palette */}
          <div className="form-group">
            <label>Temă culori</label>
            <div className="color-palette">
              {COLORS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  className={`color-dot ${form.themeColor === c.theme ? 'color-dot--active' : ''}`}
                  style={{ background: c.accent, boxShadow: form.accentColor === c.accent ? `0 0 0 2px #fff, 0 0 0 4px ${c.accent}` : 'none' }}
                  onClick={() => setForm(f => ({ ...f, themeColor: c.theme, accentColor: c.accent }))}
                />
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Titlu *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titlul melodiei" />
            </div>
            <div className="form-group">
              <label>Artist *</label>
              <input required value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} placeholder="Numele artistului" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Album</label>
              <input value={form.album} onChange={e => setForm(f => ({ ...f, album: e.target.value }))} placeholder="Albumul" />
            </div>
            <div className="form-group">
              <label>An</label>
              <input type="number" value={form.releaseYear} onChange={e => setForm(f => ({ ...f, releaseYear: e.target.value }))} placeholder="2024" min="1900" max="2099" />
            </div>
          </div>

          <div className="form-group">
            <label>Gen muzical</label>
            <input value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} placeholder="Rock, Pop, Jazz..." />
          </div>

          {/* File uploads */}
          <div className="form-row">
            <div className="form-group">
              <label>Fișier MP3 {!isEdit && '*'}</label>
              <label className="file-upload">
                <input type="file" accept="audio/mp3,audio/mpeg" onChange={e => handleFile(e, 'audio')} />
                <span>{audioFile ? audioFile.name : isEdit ? 'Schimbă audio…' : 'Selectează MP3…'}</span>
                <span className="file-icon">🎵</span>
              </label>
              {audioPreview && <audio controls src={audioPreview} className="audio-preview" />}
            </div>

            <div className="form-group">
              <label>Copertă (vinil art)</label>
              <label className="file-upload">
                <input type="file" accept="image/*" onChange={e => handleFile(e, 'cover')} />
                <span>{coverFile ? coverFile.name : 'Selectează imagine…'}</span>
                <span className="file-icon">🖼</span>
              </label>
              {coverPreview && <img src={coverPreview} alt="preview" className="cover-preview" />}
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="btn btn-cancel" onClick={onClose}>Anulează</button>
            <button type="submit" className="btn btn-save" disabled={loading}>
              {loading ? 'Se salvează…' : isEdit ? 'Salvează' : 'Adaugă'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
