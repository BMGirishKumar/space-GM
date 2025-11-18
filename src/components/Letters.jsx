// src/components/Letters.jsx
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

function Letters({ currentUser }) {
  const [text, setText] = useState("");
  const [lettersForMe, setLettersForMe] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // reactive auth uid
  const [authUid, setAuthUid] = useState(auth?.currentUser?.uid ?? null);
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setAuthUid(user?.uid ?? null);
    });
    return () => unsubAuth();
  }, []);

  const currentUid = authUid; // reactive value
  const appId = currentUser?.id ?? null; // "jake" / "amy"

  useEffect(() => {
    if (!appId && !currentUid) return;

    setLoadError(null);
    setLettersForMe([]);

    const subs = [];

    // safe helper to get millis from a variety of timestamp shapes
    const getMillis = (ts) => {
      if (!ts) return 0;
      if (typeof ts.toMillis === "function") return ts.toMillis();
      if (typeof ts._seconds === "number") return ts._seconds * 1000;
      return 0;
    };

    // Helper to merge results from multiple snapshots
    const mergeAndSet = (snapDocsArrays) => {
      // combine arrays, dedupe by id
      const map = new Map();
      snapDocsArrays.flat().forEach((d) => {
        if (d && d.id) map.set(d.id, d);
      });
      const merged = Array.from(map.values());
      // sort by createdAt (desc). Handle missing timestamps.
      merged.sort((a, b) => {
        const ta = getMillis(a.createdAt);
        const tb = getMillis(b.createdAt);
        return tb - ta;
      });
      setLettersForMe(merged);
      console.log("Merged letters:", merged);
    };

    // store the most recent docs snapshots arrays and update merged view
    const snapshotsStore = [];

    // Query 1: toAuthUid (if we have auth UID)
    if (currentUid) {
      try {
        const q1 = query(
          collection(db, "letters"),
          where("toAuthUid", "==", currentUid),
          orderBy("createdAt", "desc")
        );
        const unsub1 = onSnapshot(
          q1,
          (snap) => {
            const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            console.log("toAuthUid query docs:", docs);
            snapshotsStore[0] = docs;
            mergeAndSet(snapshotsStore);
            console.log("toAuthUid snap count:", docs.length);
          },
          (err) => {
            console.error("toAuthUid snapshot error:", err);
            setLoadError("Failed to load letters (auth query).");
          }
        );
        subs.push(unsub1);
      } catch (err) {
        console.error("toAuthUid query failed:", err);
      }
    }

    // Query 2: toId (app-level id, e.g., "jake"/"amy")
    if (appId) {
      try {
        const q2 = query(
          collection(db, "letters"),
          where("toId", "==", appId),
          orderBy("createdAt", "desc")
        );
        const unsub2 = onSnapshot(
          q2,
          (snap) => {
            const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            console.log("toId query docs:", docs);
            snapshotsStore[1] = docs;
            mergeAndSet(snapshotsStore);
            console.log("toId snap count:", docs.length);
          },
          (err) => {
            console.error("toId snapshot error:", err);
            setLoadError("Failed to load letters (app id query).");
          }
        );
        subs.push(unsub2);
      } catch (err) {
        console.error("toId query failed:", err);
      }
    }

    // Cleanup all subs
    return () => subs.forEach((u) => u && u());
  }, [appId, currentUid]);

  const handleSendLetter = async (e) => {
    e.preventDefault();
    if (!text.trim() || !appId) return;
    setSending(true);

    const toId = appId === "jake" ? "amy" : "jake";
    const toName = appId === "jake" ? "Mriduuuuuu" : "Girishhhhhhh";

    const payload = {
      fromId: appId,
      fromName: currentUser?.name ?? "",
      toId,
      toName,
      text: text.trim(),
      createdAt: serverTimestamp(),
    };

    if (auth?.currentUser?.uid) payload.fromAuthUid = auth.currentUser.uid;
    // optional: payload.toAuthUid = <other user's auth uid if known>

    try {
      await addDoc(collection(db, "letters"), payload);
      setText("");
    } catch (err) {
      console.error("Failed to save letter:", err);
      alert("Failed to save letter, please try again.");
    } finally {
      setSending(false);
    }
  };

  const niceDate = (ts) => {
    if (!ts) return "";
    if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
    if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleString();
    return "";
  };

  return (
    <div className="card">
      <h2>secret letters 💌</h2>
      <p className="hint">Words that wait patiently until the right eyes are ready.</p>

      <section style={{ marginTop: 10, marginBottom: 14 }}>
        <h3 style={{ fontSize: "0.9rem", margin: "0 0 6px" }}>Letters for you</h3>

        {loadError ? (
          <div style={{ color: "#ff4b6b", fontSize: "0.85rem" }}>
            {loadError}
          </div>
        ) : lettersForMe.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "#aaa" }}>
            No letters yet — which kind of makes it the perfect time to write one.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 180,
              overflowY: "auto",
            }}
          >
            {lettersForMe.map((l) => (
              <div
                key={l.id}
                style={{
                  borderRadius: 14,
                  padding: 8,
                  background: "#fff",
                  border: "1px solid #ffd6ec",
                  fontSize: "0.8rem",
                }}
              >
                <div style={{ fontSize: "0.7rem", color: "#999", marginBottom: 4 }}>
                  from {l.fromName} · {niceDate(l.createdAt)}
                </div>
                <div>{l.text}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 style={{ fontSize: "0.9rem", margin: "0 0 6px" }}>Write a new letter</h3>
        <form onSubmit={handleSendLetter}>
          <textarea
            rows={3}
            placeholder={`Write something just for ${appId === "jake" ? "Mriduuuuuu" : "Girishhhhhhh"}…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <button className="primary" type="submit" disabled={sending}>
              {sending ? "saving…" : "save letter"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Letters;
