// src/components/MusicRoom.jsx
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Make sure Firebase is initialized elsewhere in your app
// Example Firebase init (if not already):
// import { initializeApp } from "firebase/app";
// const firebaseConfig = { /* your config */ };
// initializeApp(firebaseConfig);

const db = getFirestore();
const auth = getAuth();

const playlists = [
  {
    id: "tamil-romantic",
    title: "Tamil Love Songs",
    src: "https://open.spotify.com/embed/playlist/4QnW86LuHIiihWcsluWbrD?" // replace
  },
];

// Optional list of single tracks to be used as Song of the Day (embed track URLs)
const singleTracks = [
  { id: "track1", title: "Blinding Lights", src: "https://open.spotify.com/embed/track/0VjIjW4GlUZAMYd2vXMi3b" },
  { id: "tamilTrack", title: "Enna Solla", src: "https://open.spotify.com/embed/track/YOUR_TAMIL_TRACK_ID" },
  { id: "teluguTrack", title: "Telugu Song", src: "https://open.spotify.com/embed/track/YOUR_TELUGU_TRACK_ID" }
];

export default function MusicRoom({ userId }) {
  const [songOfDay, setSongOfDay] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const uid = userId || (auth.currentUser && auth.currentUser.uid);

  useEffect(() => {
    pickSongOfDay();
    if (uid) loadFavorites(uid);
    // eslint-disable-next-line
  }, [uid]);

  function pickSongOfDay() {
    // rotate daily by index using date; deterministic per day
    const all = singleTracks;
    if (!all.length) {
      setSongOfDay(null);
      return;
    }
    const dayIndex = Math.floor(new Date().setHours(0,0,0,0) / (1000 * 60 * 60 * 24)) % all.length;
    setSongOfDay(all[dayIndex]);
  }

  async function loadFavorites(uid) {
    try {
      const docRef = doc(db, "favorites", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setFavorites(snap.data().tracks || []);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error("loadFav error", err);
    }
  }

  async function addFavorite(track) {
    if (!uid) {
      alert("Please sign in to save favorites.");
      return;
    }
    try {
      const docRef = doc(db, "favorites", uid);
      // create or update
      await setDoc(docRef, { tracks: arrayUnion(track) }, { merge: true });
      // reload local state
      await loadFavorites(uid);
    } catch (err) {
      console.error("add favorite error", err);
    }
  }

  function isFavorited(track) {
    return favorites.some(t => t.id === track.id);
  }

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 6 }}>Your Music Room 🎧</h2>
      <p style={{ color: "#666", marginTop: 0 }}>Curated playlists just for you — play, vibe, and save favorites.</p>

      {/* Song of the Day */}
      {songOfDay && (
        <div style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          margin: "18px 0",
          padding: 12,
          borderRadius: 12,
          background: "linear-gradient(90deg,#fff6fb,#fff0f6)",
          boxShadow: "0 8px 30px rgba(255,120,150,0.06)"
        }}>
          <div style={{ flex: "0 0 280px" }}>
            <div style={{ fontWeight: 700 }}>{songOfDay.title} — Song of the Day</div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>A little song to make her smile today.</div>
            <div style={{ marginTop: 8 }}>
              <iframe title="song-of-day" style={{ borderRadius: 8 }} src={songOfDay.src} width="100%" height="80" frameBorder="0" allow="encrypted-media" />
            </div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => addFavorite(songOfDay)} disabled={isFavorited(songOfDay)} style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "none",
                background: isFavorited(songOfDay) ? "#ffdce7" : "#ff7aa8",
                color: "#fff",
                cursor: "pointer"
              }}>
                {isFavorited(songOfDay) ? "Saved" : "Save to Favorites"}
              </button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {playlists.map(pl => (
                <div key={pl.id} style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                  padding: 8
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{pl.title}</div>
                  <iframe title={pl.id} style={{ borderRadius: 8 }} src={pl.src} width="100%" height="220" frameBorder="0" allow="encrypted-media" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Favorites preview */}
      <div style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: "8px 0" }}>Favorites</h3>
          <small style={{ color: "#777" }}>{favorites.length} saved</small>
        </div>
        {favorites.length === 0 ? (
          <div style={{ color: "#888", padding: 12, borderRadius: 10, background: "#fff6f9" }}>No favorites yet — press “Save to Favorites” on any song.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {favorites.map((t) => (
              <div key={t.id} style={{ background: "#fff", padding: 8, borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.05)" }}>
                <div style={{ fontWeight: 600 }}>{t.title}</div>
                <div style={{ marginTop: 8 }}>
                  <iframe title={`fav-${t.id}`} src={t.src} width="100%" height="80" frameBorder="0" allow="encrypted-media" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 760px) {
          iframe[title="song-of-day"] { height: 72px !important; }
        }
      `}</style>
    </div>
  );
}

