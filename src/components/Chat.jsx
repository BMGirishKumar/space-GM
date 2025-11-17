import { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";

function Chat({ currentUser }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(docs);
      },
      (error) => {
        console.error("onSnapshot error:", error);
      }
    );

    return () => unsub();
  }, []);

  // scroll to bottom whenever messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;
    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        fromId: currentUser.id,
        fromName: currentUser.name,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const niceTime = (ts) => {
    if (!ts || !ts.toDate) return "";
    return ts.toDate().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card chat-card">
      <h2>Tiny chat 💬</h2>
      <p className="hint">For all the things that don&apos;t fit into letters.</p>

      <div className="chat-messages">
        {messages.map((m) => {
          const isMine = m.fromId === currentUser.id;
          return (
            <div
              key={m.id}
              className={
                isMine ? "chat-row chat-row-mine" : "chat-row chat-row-other"
              }
            >
              <div className={isMine ? "chat-bubble mine" : "chat-bubble other"}>
                <div className="chat-text">{m.text}</div>
                <div className="chat-meta">
                  {isMine ? "you" : m.fromName} · {niceTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <textarea
  rows={2}
  placeholder={`Message as ${currentUser.name}…`}
  value={text}
  onChange={(e) => setText(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }}
/>

        <button className="primary" type="submit" disabled={sending}>
          {sending ? "sending…" : "send"}
        </button>
      </form>
    </div>
  );
}

export default Chat;
