import { useState, useRef, useEffect, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #000;
    color: #fff;
    height: 100vh;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    user-select: none;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #000;
    max-width: 480px;
    margin: 0 auto;
    position: relative;
  }

  /* BACKGROUND BLUR */
  .bg-blur {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0.18;
    background: radial-gradient(ellipse at 30% 20%, #1db954 0%, transparent 60%),
                radial-gradient(ellipse at 80% 80%, #7c3aed 0%, transparent 60%);
    transition: all 1s ease;
    pointer-events: none;
  }

  /* SCROLLABLE CONTENT */
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
    padding-bottom: 200px;
  }

  .scroll-area::-webkit-scrollbar { display: none; }

  /* NAV */
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 52px 24px 16px;
  }

  .nav-title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .add-btn {
    background: #1db954;
    border: none;
    border-radius: 50%;
    color: #000;
    cursor: pointer;
    font-size: 22px;
    font-weight: 700;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s, background 0.15s;
  }

  .add-btn:hover { transform: scale(1.08); background: #1ed760; }

  input[type="file"] { display: none; }

  /* EMPTY STATE */
  .empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    text-align: center;
    gap: 12px;
  }

  .empty-icon { font-size: 56px; margin-bottom: 8px; }

  .empty-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .empty-sub {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    max-width: 240px;
  }

  .empty-btn {
    background: #1db954;
    border: none;
    border-radius: 24px;
    color: #000;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    padding: 13px 28px;
    margin-top: 8px;
    transition: all 0.15s;
  }

  .empty-btn:hover { background: #1ed760; transform: scale(1.02); }

  /* TRACK LIST */
  .section-label {
    font-size: 13px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 8px 24px 12px;
  }

  .track-list { padding: 0 16px; display: flex; flex-direction: column; gap: 2px; }

  .track-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
  }

  .track-item:hover { background: #ffffff0d; }
  .track-item.active { background: #1db95420; }

  .track-art {
    width: 46px;
    height: 46px;
    border-radius: 8px;
    background: linear-gradient(135deg, #1db954, #7c3aed);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .track-art.playing::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.4);
    border-radius: 8px;
  }

  .playing-bars {
    position: absolute;
    z-index: 2;
    display: flex;
    gap: 3px;
    align-items: flex-end;
    height: 16px;
  }

  .bar {
    width: 3px;
    background: #1db954;
    border-radius: 2px;
    animation: barBounce 0.8s ease infinite alternate;
  }

  .bar:nth-child(2) { animation-delay: 0.15s; animation-duration: 0.6s; }
  .bar:nth-child(3) { animation-delay: 0.3s; animation-duration: 1s; }

  @keyframes barBounce {
    from { height: 4px; }
    to { height: 16px; }
  }

  .track-info { flex: 1; min-width: 0; }

  .track-name {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-item.active .track-name { color: #1db954; }

  .track-meta {
    font-size: 12px;
    color: #666;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-dur {
    font-size: 12px;
    color: #555;
    flex-shrink: 0;
  }

  .remove-btn {
    background: none;
    border: none;
    color: #444;
    cursor: pointer;
    font-size: 16px;
    padding: 4px 8px;
    border-radius: 4px;
    flex-shrink: 0;
    transition: color 0.15s;
  }

  .remove-btn:hover { color: #ff4444; }

  /* PLAYER BAR */
  .player {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    background: #111;
    border-top: 1px solid #222;
    padding: 16px 20px 32px;
    z-index: 100;
  }

  /* NOW PLAYING */
  .now-playing {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .now-art {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: linear-gradient(135deg, #1db954, #7c3aed);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  .now-info { flex: 1; min-width: 0; }

  .now-title {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .now-sub {
    font-size: 12px;
    color: #666;
    margin-top: 2px;
  }

  .heart-btn {
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    font-size: 20px;
    transition: all 0.15s;
    padding: 4px;
  }

  .heart-btn.liked { color: #1db954; transform: scale(1.1); }

  /* PROGRESS */
  .progress-wrap { margin-bottom: 14px; }

  .progress-bar-track {
    width: 100%;
    height: 3px;
    background: #333;
    border-radius: 3px;
    cursor: pointer;
    position: relative;
    margin-bottom: 6px;
  }

  .progress-fill {
    height: 100%;
    background: #1db954;
    border-radius: 3px;
    transition: width 0.1s linear;
    position: relative;
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .progress-bar-track:hover .progress-fill::after { opacity: 1; }

  .time-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #555;
  }

  /* CONTROLS */
  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .ctrl-btn {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 20px;
    padding: 6px;
    border-radius: 50%;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ctrl-btn:hover { color: #fff; }
  .ctrl-btn.active { color: #1db954; }

  .play-btn {
    background: #fff;
    border: none;
    border-radius: 50%;
    color: #000;
    cursor: pointer;
    font-size: 20px;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .play-btn:hover { transform: scale(1.06); background: #f0f0f0; }
  .play-btn:active { transform: scale(0.97); }

  /* VOLUME */
  .volume-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .vol-icon { font-size: 14px; color: #555; }

  input[type="range"] {
    -webkit-appearance: none;
    flex: 1;
    height: 3px;
    background: #333;
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const formatTime = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const cleanName = (filename) => filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState(new Set());
  const [durations, setDurations] = useState({});

  const audioRef = useRef(new Audio());
  const fileRef = useRef();

  const currentTrack = current !== null ? tracks[current] : null;

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration);
    const onEnd = () => handleNext();
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("ended", onEnd);
    };
  }, [tracks, current, shuffle, repeat]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const loadAndPlay = (index) => {
    const track = tracks[index];
    if (!track) return;
    audioRef.current.src = track.url;
    audioRef.current.play();
    setCurrent(index);
    setPlaying(true);
    setProgress(0);
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const handleNext = useCallback(() => {
    if (repeat) { audioRef.current.currentTime = 0; audioRef.current.play(); return; }
    if (tracks.length === 0) return;
    let next;
    if (shuffle) next = Math.floor(Math.random() * tracks.length);
    else next = current === null ? 0 : (current + 1) % tracks.length;
    loadAndPlay(next);
  }, [tracks, current, shuffle, repeat]);

  const handlePrev = () => {
    if (audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
    if (tracks.length === 0) return;
    const prev = current === null ? 0 : (current - 1 + tracks.length) % tracks.length;
    loadAndPlay(prev);
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith("audio/"));
    if (files.length === 0) return;
    const newTracks = files.map(f => ({
      name: cleanName(f.name),
      filename: f.name,
      url: URL.createObjectURL(f),
      size: f.size,
    }));

    // Get durations
    newTracks.forEach((t, i) => {
      const a = new Audio(t.url);
      a.addEventListener("loadedmetadata", () => {
        setDurations(prev => ({ ...prev, [tracks.length + i]: a.duration }));
      });
    });

    setTracks(prev => [...prev, ...newTracks]);
  };

  const removeTrack = (index, e) => {
    e.stopPropagation();
    const newTracks = tracks.filter((_, i) => i !== index);
    setTracks(newTracks);
    if (current === index) {
      audioRef.current.pause();
      setCurrent(null);
      setPlaying(false);
    } else if (current > index) {
      setCurrent(current - 1);
    }
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const newTime = pct * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const toggleLike = (e) => {
    e.stopPropagation();
    if (current === null) return;
    setLiked(prev => {
      const n = new Set(prev);
      n.has(current) ? n.delete(current) : n.add(current);
      return n;
    });
  };

  const artColors = [
    "linear-gradient(135deg,#1db954,#7c3aed)",
    "linear-gradient(135deg,#f97316,#ec4899)",
    "linear-gradient(135deg,#06b6d4,#6366f1)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#10b981,#3b82f6)",
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="bg-blur" />

        <div className="scroll-area">
          <div className="nav">
            <span className="nav-title">My Music</span>
            <button className="add-btn" onClick={() => fileRef.current.click()}>+</button>
            <input ref={fileRef} type="file" accept="audio/*" multiple onChange={handleFiles} />
          </div>

          {tracks.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🎵</div>
              <div className="empty-title">No music yet</div>
              <div className="empty-sub">Tap the button to add songs from your phone's storage</div>
              <button className="empty-btn" onClick={() => fileRef.current.click()}>Add Music</button>
            </div>
          ) : (
            <>
              <div className="section-label">{tracks.length} Songs</div>
              <div className="track-list">
                {tracks.map((t, i) => (
                  <div key={i} className={`track-item ${current === i ? "active" : ""}`} onClick={() => loadAndPlay(i)}>
                    <div className="track-art" style={{ background: artColors[i % artColors.length] }}>
                      {current === i && playing ? (
                        <div className="playing-bars">
                          <div className="bar" style={{ height: 8 }} />
                          <div className="bar" style={{ height: 14 }} />
                          <div className="bar" style={{ height: 10 }} />
                        </div>
                      ) : "🎵"}
                    </div>
                    <div className="track-info">
                      <div className="track-name">{t.name}</div>
                      <div className="track-meta">Local file</div>
                    </div>
                    {durations[i] && <div className="track-dur">{formatTime(durations[i])}</div>}
                    <button className="remove-btn" onClick={(e) => removeTrack(i, e)}>×</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* PLAYER */}
        <div className="player">
          <div className="now-playing">
            <div className="now-art" style={{ background: current !== null ? artColors[current % artColors.length] : "#222" }}>
              {currentTrack ? "🎵" : "♪"}
            </div>
            <div className="now-info">
              <div className="now-title">{currentTrack ? currentTrack.name : "Nothing playing"}</div>
              <div className="now-sub">{currentTrack ? "Local file" : "Pick a song above"}</div>
            </div>
            <button className={`heart-btn ${current !== null && liked.has(current) ? "liked" : ""}`} onClick={toggleLike}>
              {current !== null && liked.has(current) ? "♥" : "♡"}
            </button>
          </div>

          <div className="progress-wrap">
            <div className="progress-bar-track" onClick={seek}>
              <div className="progress-fill" style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }} />
            </div>
            <div className="time-row">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="controls">
            <button className={`ctrl-btn ${shuffle ? "active" : ""}`} onClick={() => setShuffle(s => !s)}>⇄</button>
            <button className="ctrl-btn" onClick={handlePrev}>⏮</button>
            <button className="play-btn" onClick={togglePlay}>
              {playing ? "⏸" : "▶"}
            </button>
            <button className="ctrl-btn" onClick={handleNext}>⏭</button>
            <button className={`ctrl-btn ${repeat ? "active" : ""}`} onClick={() => setRepeat(r => !r)}>↺</button>
          </div>

          <div className="volume-row">
            <span className="vol-icon">🔈</span>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} />
            <span className="vol-icon">🔊</span>
          </div>
        </div>
      </div>
    </>
  );
}
