// src/components/MemoryWall.jsx
import { MEMORY_PHOTOS } from "../data/memories-wall";

function MemoryWall() {
  return (
    <div className="card memory-wall-card">
      <h2>memory wall 📸</h2>
      <p className="hint">
        Tiny snapshots of our universe, all in one place.
      </p>

      <div
        className="memory-grid"
      >
        {MEMORY_PHOTOS.map((p) => (
          <figure
            key={p.id}
            className="memory-item"
          >
            <div className="memory-image-wrap">
              <img
                src={p.url}
                alt={p.caption}
                className="memory-image"
              />
              <div className="memory-overlay">
                <div className="memory-overlay-text">{p.caption}</div>
              </div>
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default MemoryWall;
