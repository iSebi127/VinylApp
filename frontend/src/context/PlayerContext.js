import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback, useMemo } from 'react';

const PlayerContext = createContext(null);

const initialState = {
  songs: [],
  currentSong: null,
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  loop: false, // added loop flag
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SONGS':
      // When the songs list updates, try to replace the currentSong with the
      // corresponding object from the new array (preserve playback state). This
      // avoids visual flicker / position jumps caused by stale object references
      // when the library is reloaded (e.g. after uploading a new song).
      const newSongs = action.payload || [];
      if (state.currentSong?.id) {
        const newIndex = newSongs.findIndex(s => s.id === state.currentSong.id);
        if (newIndex >= 0) {
          return {
            ...state,
            songs: newSongs,
            currentSong: newSongs[newIndex],
            currentIndex: newIndex,
          };
        }
        // current song was removed from the new list -> stop playback
        return { ...state, songs: newSongs, currentSong: null, currentIndex: -1, isPlaying: false };
      }
      return { ...state, songs: newSongs };
    case 'PLAY_SONG':
      return {
        ...state,
        currentSong: action.payload.song,
        currentIndex: action.payload.index,
        isPlaying: true,
      };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_LOOP':
      return { ...state, loop: action.payload };
    case 'NEXT_SONG': {
      if (state.songs.length === 0) return state;
      const nextIndex = (state.currentIndex + 1) % state.songs.length;
      return {
        ...state,
        currentSong: state.songs[nextIndex],
        currentIndex: nextIndex,
        isPlaying: true,
      };
    }
    case 'PREV_SONG': {
      if (state.songs.length === 0) return state;
      const prevIndex = (state.currentIndex - 1 + state.songs.length) % state.songs.length;
      return {
        ...state,
        currentSong: state.songs[prevIndex],
        currentIndex: prevIndex,
        isPlaying: true,
      };
    }
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef(new Audio());
  const loopRef = useRef(state.loop);

  // Sync audio src when currentSong changes
  useEffect(() => {
    const audio = audioRef.current;
    if (state.currentSong?.audioUrl) {
      audio.src = state.currentSong.audioUrl;
      audio.load();
      if (state.isPlaying) audio.play().catch(console.error);
    }
  }, [state.currentSong]);

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!state.currentSong) return;
    if (state.isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [state.isPlaying, state.currentSong]);

  // Sync volume
  useEffect(() => {
    audioRef.current.volume = state.volume;
  }, [state.volume]);

  // Keep a ref with the latest loop state and also set the native audio.loop
  useEffect(() => {
    loopRef.current = state.loop;
    audioRef.current.loop = !!state.loop;
  }, [state.loop]);

  // Audio event listeners (use loopRef inside onEnded to get latest loop value)
  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => dispatch({ type: 'SET_TIME', payload: audio.currentTime });
    const onDurationChange = () => dispatch({ type: 'SET_DURATION', payload: audio.duration });
    const onEnded = () => {
      // if loop is enabled, restart current song; otherwise go to next
      if (loopRef.current) {
        try {
          audio.currentTime = 0;
          audio.play().catch(console.error);
          dispatch({ type: 'SET_TIME', payload: 0 });
        } catch (e) {
          console.error(e);
        }
      } else {
        dispatch({ type: 'NEXT_SONG' });
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [dispatch]);

  // Actions
  const playSong = useCallback((song, index) => dispatch({ type: 'PLAY_SONG', payload: { song, index } }), [dispatch]);
  const togglePlay = useCallback(() => dispatch({ type: 'TOGGLE_PLAY' }), [dispatch]);
  const skip = useCallback(() => dispatch({ type: 'NEXT_SONG' }), [dispatch]);
  const prev = useCallback(() => dispatch({ type: 'PREV_SONG' }), [dispatch]);

  // Back button behavior: if >5s restart; if <=5s go to previous song
  const back = useCallback(() => {
    const audio = audioRef.current;
    if (!state.currentSong) return;
    const currentTime = audio.currentTime || 0;
    if (currentTime > 5) {
      audio.currentTime = 0;
      dispatch({ type: 'SET_TIME', payload: 0 });
      if (state.isPlaying) audio.play().catch(console.error);
    } else {
      dispatch({ type: 'PREV_SONG' });
    }
  }, [state.currentSong, state.isPlaying, dispatch]);

  const seek = useCallback((time) => { audioRef.current.currentTime = time; dispatch({ type: 'SET_TIME', payload: time }); }, [dispatch]);
  const setVolume = useCallback((v) => dispatch({ type: 'SET_VOLUME', payload: v }), [dispatch]);
  const setSongs = useCallback((songs) => dispatch({ type: 'SET_SONGS', payload: songs }), [dispatch]);
  const toggleLoop = useCallback(() => dispatch({ type: 'SET_LOOP', payload: !state.loop }), [state.loop, dispatch]);

  const contextValue = useMemo(() => ({ state, playSong, togglePlay, skip, prev, back, seek, setVolume, setSongs, toggleLoop }), [state, playSong, togglePlay, skip, prev, back, seek, setVolume, setSongs, toggleLoop]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
