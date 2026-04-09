import { useState, useEffect } from "react"
import Weekly from "./Weekly"

const defaultScores = { mood: 5, energy: 5, focus: 5, sleep: 5, appetite: 5 }

const sliders = [
  { id: "mood", label: "Mood", emoji: "🙂" },
  { id: "energy", label: "Energy", emoji: "⚡" },
  { id: "focus", label: "Focus", emoji: "🎯" },
  { id: "sleep", label: "Sleep quality", emoji: "😴" },
  { id: "appetite", label: "Appetite", emoji: "🍽️" },
]

function Journal() {
  const today = new Date().toDateString()
  const [activeSection, setActiveSection] = useState("checkin")

  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem("journalScores")
    const parsed = saved ? JSON.parse(saved) : null
    return parsed && parsed.date === today ? parsed.scores : defaultScores
  })

  const [note, setNote] = useState(() => {
    const saved = localStorage.getItem("journalNote")
    const parsed = saved ? JSON.parse(saved) : null
    return parsed && parsed.date === today ? parsed.note : ""
  })

  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("journalEntries")
    return saved ? JSON.parse(saved) : []
  })

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    localStorage.setItem("journalScores", JSON.stringify({ date: today, scores }))
  }, [scores])

  useEffect(() => {
    localStorage.setItem("journalNote", JSON.stringify({ date: today, note }))
  }, [note])

  function handleSlider(id, value) {
    setScores({ ...scores, [id]: Number(value) })
  }

  function handleSave() {
    const entry = { date: today, scores, note }
    const updated = [entry, ...entries.filter(e => e.date !== today)]
    setEntries(updated)
    localStorage.setItem("journalEntries", JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="section-tabs">
        <button
          className={`section-tab ${activeSection === "checkin" ? "active" : ""}`}
          onClick={() => setActiveSection("checkin")}
        >
          📝 Check in
        </button>
        <button
          className={`section-tab ${activeSection === "review" ? "active" : ""}`}
          onClick={() => setActiveSection("review")}
        >
          📊 Review
        </button>
      </div>

      {activeSection === "checkin" && (
        <div>
          <div className="journal-section-label">How are you today?</div>

          {sliders.map(slider => (
            <div key={slider.id} className="slider-row">
              <div className="slider-header">
                <span className="slider-label">{slider.emoji} {slider.label}</span>
                <span className="slider-value">{scores[slider.id]}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={scores[slider.id]}
                onChange={e => handleSlider(slider.id, e.target.value)}
                className="slider"
              />
              <div className="slider-ends">
                <span>low</span>
                <span>high</span>
              </div>
            </div>
          ))}

          <div className="journal-section-label" style={{ marginTop: "20px" }}>Today's note</div>
          <textarea
            className="journal-input"
            placeholder="How's today going? Even one word counts..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <button className="save-btn" onClick={handleSave}>
            {saved ? "Saved ✓" : "Save entry"}
          </button>

          {entries.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <div className="journal-section-label">Past entries</div>
              {entries.slice(0, 5).map(entry => (
                <div key={entry.date} className="note-card">
                  <div className="note-date">{entry.date}</div>
                  <div className="note-scores">
                    {sliders.map(s => (
                      <span key={s.id} className="note-score-pill">
                        {s.emoji} {entry.scores[s.id]}
                      </span>
                    ))}
                  </div>
                  {entry.note && <div className="note-text">{entry.note}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === "review" && (
        <Weekly />
      )}
    </div>
  )
}

export default Journal