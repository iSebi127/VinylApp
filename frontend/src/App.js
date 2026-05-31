import React, { useEffect, useState, useCallback } from 'react';
import { usePlayer } from './context/PlayerContext';
import { songAPI } from './services/api';
import VinylRecord from './components/VinylRecord';
import SongCard from './components/SongCard';
import PlayerBar from './components/PlayerBar';
import SongModal from './components/SongModal';
import './App.css';

export default function App() {
  const player = usePlayer();
  const { state } = player;
  const { currentSong, isPlaying } = state;

  const [songs, setSongsLocal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSong, setEditSong] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await songAPI.getAll();
      setSongsLocal(data);
      player.setSongs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [player.setSongs]);

  useEffect(() => { loadSongs(); }, [loadSongs]);

  const handleSaved = () => {
    setModalOpen(false);
    setEditSong(null);
    loadSongs();
  };

  const handleDelete = async (song) => {
    await songAPI.delete(song.id);
    setDeleteConfirm(null);
    loadSongs();
  };

  const filtered = songs.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.artist?.toLowerCase().includes(search.toLowerCase()) ||
    s.genre?.toLowerCase().includes(search.toLowerCase())
  );

  // Theme from current song
  const theme = currentSong?.themeColor || '#0d0d1a';
  const accent = currentSong?.accentColor || '#e94560';

  return (
    <div
      className="app"
      style={{
        '--theme': theme,
        '--accent': accent,
        '--theme-mid': theme + 'cc',
      }}
    >
      {/* Animated background gradient */}
      <div className="app-bg" style={{ background: `radial-gradient(ellipse at 30% 20%, ${accent}22 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, ${accent}11 0%, transparent 50%), ${theme}` }} />

      <div className="app-layout">
        {/* Left panel — Now Playing */}
        <aside className="now-playing-panel">
          <div className="app-logo">
            <span>🎵</span>
            <span className="logo-text">VinylApp</span>
          </div>

          <div className="now-playing-vinyl">
            <VinylRecord song={currentSong} isPlaying={isPlaying} size={260} />
          </div>

          {currentSong ? (
            <div className="now-playing-info">
              <h2 className="now-playing-title">{currentSong.title}</h2>
              <p className="now-playing-artist">{currentSong.artist}</p>
              {currentSong.album && (
                <p className="now-playing-album">{currentSong.album} {currentSong.releaseYear ? `· ${currentSong.releaseYear}` : ''}</p>
              )}
              {currentSong.genre && (
                <span className="now-playing-genre" style={{ background: accent + '28', color: accent }}>
                  {currentSong.genre}
                </span>
              )}
            </div>
          ) : (
            <div className="now-playing-empty">
              <p>Selectează o melodie<br/>pentru a începe</p>
            </div>
          )}
        </aside>

        {/* Right panel — Library */}
        <main className="library-panel">
          <div className="library-header">
            <h1>Biblioteca mea</h1>
            <div className="library-controls">
              <div className="search-box">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                <input
                  placeholder="Caută melodii, artiști…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button
                className="add-btn"
                style={{ background: accent }}
                onClick={() => { setEditSong(null); setModalOpen(true); }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Adaugă
              </button>
            </div>
          </div>

          <div className="song-list">
            {loading ? (
              <div className="library-state">
                <div className="spinner" style={{ borderTopColor: accent }} />
                <p>Se încarcă biblioteca…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="library-state">
                <span style={{ fontSize: 48 }}>🎵</span>
                <p>{search ? 'Nicio melodie găsită' : 'Biblioteca este goală. Adaugă prima melodie!'}</p>
              </div>
            ) : (
              filtered.map((song, i) => {
                const idx = songs.indexOf(song);
                const isActive = state.currentSong?.id === song.id;
                const isPlaying = isActive && state.isPlaying;
                return (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={idx}
                    onEdit={(s) => { setEditSong(s); setModalOpen(true); }}
                    onDelete={(s) => setDeleteConfirm(s)}
                    onPlay={player.playSong}
                    isActive={isActive}
                    isPlaying={isPlaying}
                  />
                );
              })
            )}
          </div>
        </main>
      </div>

      <PlayerBar />

      {/* Add/Edit modal */}
      {modalOpen && (
        <SongModal
          song={editSong}
          onClose={() => { setModalOpen(false); setEditSong(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Ștergi melodia?</h3>
            <p><strong>{deleteConfirm.title}</strong> — {deleteConfirm.artist}</p>
            <div className="confirm-actions">
              <button className="btn btn-cancel" onClick={() => setDeleteConfirm(null)}>Anulează</button>
              <button className="btn btn-delete" onClick={() => handleDelete(deleteConfirm)}>Șterge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
