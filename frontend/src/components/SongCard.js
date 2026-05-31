import React from 'react';
import './SongCard.css';

export default function SongCard({ song, index, onEdit, onDelete, onPlay, isActive, isPlaying }) {
  const accent = song.accentColor || '#e94560';

  return (
    <div
      className={`song-card ${isActive ? 'song-card--active' : ''}`}
      style={{ '--card-accent': accent }}
      onClick={() => onPlay && onPlay(song, index)}
    >
      {/* Cover */}
      <div className="song-card__cover">
        {song.coverUrl ? (
          <img src={song.coverUrl} alt={song.title} />
        ) : (
          <div className="song-card__cover-placeholder">♫</div>
        )}
        {isPlaying && (
          <div className="song-card__playing-indicator">
            <span /><span /><span />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="song-card__info">
        <span className="song-card__title">{song.title}</span>
        <span className="song-card__artist">{song.artist}</span>
        {song.album && <span className="song-card__album">{song.album}</span>}
      </div>

      {/* Genre + Year */}
      <div className="song-card__meta">
        {song.genre && <span className="song-card__genre">{song.genre}</span>}
        {song.releaseYear && <span className="song-card__year">{song.releaseYear}</span>}
      </div>

      {/* Actions */}
      <div className="song-card__actions" onClick={e => e.stopPropagation()}>
        <button
          className="action-btn action-btn--edit"
          onClick={() => onEdit(song)}
          title="Edit"
        >
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button
          className="action-btn action-btn--delete"
          onClick={() => onDelete(song)}
          title="Delete"
        >
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    </div>
  );
}
