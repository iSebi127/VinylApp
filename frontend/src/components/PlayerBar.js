import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import VinylRecord from './VinylRecord';
import './PlayerBar.css';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function PlayerBar() {
  const { state, togglePlay, skip, back, seek, setVolume, toggleLoop } = usePlayer();
  const { currentSong, isPlaying, currentTime, duration, volume, loop } = state;

  if (!currentSong) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const accent = currentSong?.accentColor || '#e94560';

  return (
    <div className="player-bar" style={{ '--accent': accent }}>
      {/* Mini vinyl */}
      <div className="player-bar__vinyl">
        <VinylRecord song={currentSong} isPlaying={isPlaying} size={54} />
      </div>

      {/* Song info */}
      <div className="player-bar__info">
        <span className="player-bar__title">{currentSong.title}</span>
        <span className="player-bar__artist">{currentSong.artist}</span>
      </div>

      {/* Controls */}
      <div className="player-bar__controls">
        <button className="ctrl-btn" onClick={back} title="Back">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>
        <button className="ctrl-btn play-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button className="ctrl-btn" onClick={skip} title="Next">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14 4.5 3.14L8 16.14V9.86zM16 6h2v12h-2z"/></svg>
        </button>

        {/* Loop toggle */}
        <button
          className={`ctrl-btn loop-btn ${loop ? 'active' : ''}`}
          onClick={toggleLoop}
          title={loop ? 'Loop on' : 'Loop off'}
          aria-pressed={loop}
        >
          {loop ? (
            // Loop ON: show indicator dot to signal active state
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M7 7v2h8V7l4 4-4 4v-2H5v-4h2zM17 17v-2H9v2l-4-4 4-4v2h10v4h-2z" />
              <circle cx="18" cy="6" r="1.4" fill="currentColor" />
            </svg>
          ) : (
            // Loop OFF: outline icon
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M7 7v2h8V7l4 4-4 4v-2H5v-4h2zM17 17v-2H9v2l-4-4 4-4v2h10v4h-2z" fillOpacity="0.6" />
            </svg>
          )}
        </button>
      </div>

      {/* Progress */}
      <div className="player-bar__progress">
        <span className="time-label">{formatTime(currentTime)}</span>
        <div
          className="progress-track"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - rect.left) / rect.width) * duration);
          }}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <div className="progress-thumb" style={{ left: `${progress}%` }} />
        </div>
        <span className="time-label">{formatTime(duration)}</span>
      </div>

      {/* Volume */}
      <div className="player-bar__volume">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
        <input
          type="range" min="0" max="1" step="0.01"
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="volume-slider"
        />
      </div>
    </div>
  );
}
