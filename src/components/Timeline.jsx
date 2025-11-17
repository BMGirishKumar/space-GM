// src/components/Timeline.jsx
import { TIMELINE } from "../data/timeline";

function Timeline() {
  return (
    <div className="card timeline-card">
      <h2>our story, in little steps ✨</h2>
      <p className="hint">
        Scroll through the tiny milestones that turned us into us.
      </p>

      <div className="timeline">
        {TIMELINE.map((item, index) => (
          <div key={item.id} className="timeline-row">
            <div className="timeline-left">
              <div className="timeline-date">{item.date}</div>
            </div>

            <div className="timeline-middle">
              <div className="timeline-dot" />
              {index !== TIMELINE.length - 1 && (
                <div className="timeline-line" />
              )}
            </div>

            <div className="timeline-right">
              <h3 className="timeline-title">{item.title}</h3>
              <p className="timeline-text">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
