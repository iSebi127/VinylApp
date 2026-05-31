import React from 'react';
import './VinylRecord.css';

function VinylRecord({ song, isPlaying, size = 220 }) {
  const coverUrl = song?.coverUrl;
  const accentColor = song?.accentColor || '#e94560';

  return (
    <div className="vinyl-wrapper" style={{ width: size, height: size }}>
      {/* Outer vinyl disc */}
      <div className={`vinyl-disc ${isPlaying ? 'spinning' : ''}`}>
        {/* Grooves */}
        {[0.82, 0.72, 0.62, 0.52].map((r, i) => (
          <div
            key={i}
            className="vinyl-groove"
            style={{
              width: `${r * 100}%`,
              height: `${r * 100}%`,
              borderColor: `rgba(255,255,255,${0.04 + i * 0.01})`,
            }}
          />
        ))}

        {/* Center label */}
        <div
          className="vinyl-label"
          style={{ background: coverUrl ? 'transparent' : '#1a1a1a' }}
        >
          {coverUrl ? (
            <img src={coverUrl} alt={song?.title} className="vinyl-cover-img" />
          ) : (
            <div className="vinyl-label-placeholder">
              <span style={{ color: accentColor, fontSize: 28 }}>♫</span>
            </div>
          )}
          {/* Center hole */}
          <div className="vinyl-hole" />
        </div>

        {/* Shine overlay */}
        <div className="vinyl-shine" />
      </div>

      {/* Tonearm */}
      <div className={`tonearm ${isPlaying ? 'tonearm-playing' : ''}`}>
        <div className="tonearm-body" style={{ background: `linear-gradient(to bottom, #888, #555)` }} />
        <div className="tonearm-head" style={{ borderColor: accentColor }} />
      </div>
    </div>
  );
}

function propsAreEqual(prevProps, nextProps) {
  const prevId = prevProps.song?.id;
  const nextId = nextProps.song?.id;
  return prevId === nextId && prevProps.isPlaying === nextProps.isPlaying && prevProps.size === nextProps.size;
}

export default React.memo(VinylRecord, propsAreEqual);
