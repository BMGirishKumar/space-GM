// src/App.jsx
import { useState, useEffect } from "react";
import "./App.css";
import Chat from "./components/Chat";
import MemoryWall from "./components/MemoryWall";
import Timeline from "./components/Timeline";
import Letters from "./components/Letters";
import { auth } from "./firebase";
import MusicRoom from "./components/MusicRoom";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const TABS = ["Timeline", "Memory Wall", "Chat", "Letters", "Music"];

function App() {
  const [currentTab, setCurrentTab] = useState("Timeline");
  const [currentUser, setCurrentUser] = useState(null);
  const [bursts, setBursts] = useState([]);
  const [cursorHearts, setCursorHearts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  /* watch Firebase auth state */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.email === "geekku@gmail.com") {
        setCurrentUser({ id: "jake", name: "Girishhhhhhh", email: user.email });
      } else if (user?.email === "mridu@gmail.com") {
        setCurrentUser({ id: "amy", name: "Mriduuuuuu", email: user.email });
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  /* initial cute loader for first paint */
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 850);
    return () => clearTimeout(t);
  }, []);

  /* cursor hearts (trail) */
  useEffect(() => {
    const handle = (e) => {
      const id = Date.now() + Math.random();
      setCursorHearts((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setCursorHearts((prev) => prev.filter((c) => c.id !== id));
      }, 800);
    };
    document.addEventListener("mousemove", handle);
    return () => document.removeEventListener("mousemove", handle);
  }, []);

  /* click burst anywhere you want */
  const triggerBurst = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const id = Date.now() + Math.random();
    const particles = [
      { char: "❤", dx: "-20px", dy: "-40px" },
      { char: "❤", dx: "10px", dy: "-50px" },
      { char: "✦", dx: "-30px", dy: "-20px" },
      { char: "✦", dx: "25px", dy: "-30px" },
    ];
    setBursts((prev) => [...prev, { id, x, y, particles }]);
    setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), 700);
  };

  /* Ambient hearts (UI only) */
  const AmbientHearts = () =>
    Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="floating-heart"
        style={{
          left: Math.random() * 100 + "vw",
          animationDuration: 10 + Math.random() * 12 + "s",
          animationDelay: Math.random() * -20 + "s",
        }}
        aria-hidden
      >
        ❤
      </div>
    ));

  const renderBursts = () =>
    bursts.map((b) => (
      <div key={b.id} className="click-burst" style={{ left: b.x, top: b.y }}>
        {b.particles.map((p, idx) => (
          <span
            key={idx}
            style={{
              left: 0,
              top: 0,
              "--dx": p.dx,
              "--dy": p.dy,
            }}
          >
            {p.char}
          </span>
        ))}
      </div>
    ));

  const renderCursorHearts = () =>
    cursorHearts.map((h) => (
      <div
        key={h.id}
        className="cursor-heart"
        style={{ left: h.x + "px", top: h.y + "px" }}
      >
        ❤
      </div>
    ));

  const renderStickers = () => (
    <>
      <div className="sticker s1">✨</div>
      <div className="sticker s2">💖</div>
      <div className="sticker s3">🌸</div>
      <div className="sticker s4">💫</div>
    </>
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      // onAuthStateChanged sets currentUser
    } catch (err) {
      console.error("login error", err);
      setLoginError("Wrong email or password. Try again, love.");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setCurrentTab("Timeline");
  };

  /* Login renderer – simple email/password */
  const renderLogin = () => (
    <div className="login-screen" aria-live="polite">
      <div className="panel">
        <header className="login-header">
          <h1>JUST ANOTHER WHATEVER WEBSITE</h1>
        </header>

        <div className="login-main">
          <div className="content-wrap">
            <div className="login-title">LOGIN</div>

            <form className="login-form" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              {loginError && (
                <p style={{ color: "#ff4b6b", fontSize: "0.8rem" }}>
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                className="primary"
                onClick={triggerBurst}
              >
                Enter our universe
              </button>
            </form>
          </div>
        </div>

        <footer className="login-footer" />
      </div>
    </div>
  );

  const renderLoggedIn = () => (
    <div className="app-shell" role="main">
      <div className="panel">
        <header>
          <h1>Our tiny universe ♡♡♡♡♡</h1>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            {currentUser && (
              <>
                <p className="subtitle">
                  Hi {currentUser.name}, welcome home.
                </p>
                <button
                  type="button"
                  className="small-logout-button"
                  onClick={handleLogout}
                >
                  logout
                </button>
              </>
            )}
          </div>
        </header>

        {currentUser && (
          <nav className="tabs" aria-label="Main tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={tab === currentTab ? "tab active" : "tab"}
                onClick={() => setCurrentTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        )}

        <main>
          {currentTab === "Timeline" && <Timeline />}
          {currentTab === "Memory Wall" && (
            <MemoryWall currentUser={currentUser} />
          )}
          {currentTab === "Chat" && <Chat currentUser={currentUser} />}
          {currentTab === "Letters" && <Letters currentUser={currentUser} />}
          {currentTab === "Music" && <MusicRoom currentUser={currentUser} />}
        </main>
      </div>
    </div>
  );

  const LoadingOverlay = () => (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="spinner" aria-hidden />
        <div className="loading-text">Making everything adorable…</div>
      </div>
    </div>
  );

  return (
    <div className="app">
      {renderStickers()}
      <AmbientHearts />
      {isLoading ? (
        <LoadingOverlay />
      ) : currentUser ? (
        renderLoggedIn()
      ) : (
        renderLogin()
      )}
      {renderBursts()}
      {renderCursorHearts()}
    </div>
  );
}

export default App;
