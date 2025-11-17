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
import { db } from "../firebase";

function Letters({ currentUser }) {
  const [text, setText] = useState("");
  const [lettersForMe, setLettersForMe] = useState([]);
  const [sending, setSending] = useState(false);

  // Load letters written TO the current user (jake / amy)
  useEffect(() => {
    if (!currentUser?.id) return;

    const q = query(
      collection(db, "letters"),
      where("toId", "==", currentUser.id),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLettersForMe(docs);
      },
      (error) => {
        console.error("letters onSnapshot error:", error);
      }
    );

    return () => unsub();
  }, [currentUser?.id]);

  const handleSendLetter = async (e) => {
    e.preventDefault();
    if (!text.trim() || !currentUser?.id) return;
    setSending(true);

    // Decide who this letter is TO (toggle jake <-> amy)
    const toId = currentUser.id === "jake" ? "amy" : "jake";
    const toName = currentUser.id === "jake" ? "Mriduuuuuu" : "Girishhhhhhh";

    try {
      await addDoc(collection(db, "letters"), {
        fromId: currentUser.id,
        fromName: currentUser.name,
        toId,
        toName,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error("Failed to save letter:", err);
      alert("Failed to save letter, please try again.");
    } finally {
      setSending(false);
    }
  };

  const niceDate = (ts) => {
    if (!ts || !ts.toDate) return "";
    return ts.toDate().toLocaleString();
  };

  return (
    <div className="card">
      <h2>secret letters 💌</h2>
      <p className="hint">
        Words that wait patiently until the right eyes are ready.
      </p>

      <section style={{ marginTop: 10, marginBottom: 14 }}>
        <h3 style={{ fontSize: "0.9rem", margin: "0 0 6px" }}>
          Letters for you
        </h3>
        {lettersForMe.length === 0 ? (
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
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#999",
                    marginBottom: 4,
                  }}
                >
                  from {l.fromName} · {niceDate(l.createdAt)}
                </div>
                <div>{l.text}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 style={{ fontSize: "0.9rem", margin: "0 0 6px" }}>
          Write a new letter
        </h3>
        <form onSubmit={handleSendLetter}>
          <textarea
            rows={3}
            placeholder={`Write something just for ${
              currentUser.id === "jake" ? "Mriduuuuuu" : "Girishhhhhhh"
            }…`}
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
