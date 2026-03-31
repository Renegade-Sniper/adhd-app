import { useState } from "react"

const sliderLabels = {
  mood: "Mood",
  energy: "Energy",
  focus: "Focus",
  sleep: "Sleep",
  appetite: "Appetite",
}

const sliderEmojis = {
  mood: "🙂",
  energy: "⚡",
  focus: "🎯",
  sleep: "😴",
  appetite: "🍽️",
}

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toDateString())
  }
  return days
}

function getShortDay(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" })
}

function getMedsHistory() {
  const history = JSON.parse(localStorage.getItem("medsHistory") || "[]")
  const todayMeds = JSON.parse(localStorage.getItem("meds") || "[]")
  const today = new Date().toDateString()
  const todayEntry = {
    date: today,
    total: todayMeds.length,
    done: todayMeds.filter(m => m.done).length,
    onTime: todayMeds.filter(m => {
      if (!m.done || !m.takenAt) return false
      const scheduled = new Date()
      const [h, min] = m.scheduledTime.split(":").map(Number)
      scheduled.setHours(h, min, 0, 0)
      return (new Date(m.takenAt) - scheduled) / 60000 <= 60
    }).length,
  }
  const merged = [todayEntry, ...history.filter(e => e.date !== today)]
  return merged
}

function getJournalHistory() {
  return JSON.parse(localStorage.getItem("journalEntries") || "[]")
}

function Weekly() {
  const days = getLast7Days()
  const medsHistory = getMedsHistory()
  const journalHistory = getJournalHistory()

  function getMedDay(dateStr) {
    return medsHistory.find(e => e.date === dateStr)
  }

  function getJournalDay(dateStr) {
    return journalHistory.find(e => e.date === dateStr)
  }

  function avgScore(key) {
    const vals = journalHistory
      .slice(0, 7)
      .map(e => e.scores?.[key])
      .filter(Boolean)
    if (vals.length === 0) return null
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }

  return (
    <div>
      <div className="journal-section-label">Meds this week</div>
      <div className="week-grid">
        {days.map(day => {
          const entry = getMedDay(day)
          const allDone = entry && entry.done === entry.total && entry.total > 0
          const someDone = entry && entry.done > 0 && entry.done < entry.total
          return (
            <div key={day} className="week-day">
              <div className="week-day-label">{getShortDay(day)}</div>
              <div className={`week-dot ${allDone ? "dot-full" : someDone ? "dot-partial" : "dot-empty"}`}>
                {allDone ? "✓" : entry ? entry.done : ""}
              </div>
              {entry && entry.onTime > 0 && (
                <div className="week-ontime">on time</div>
              )}
            </div>
          )
        })}
      </div>

      <div className="journal-section-label" style={{ marginTop: "24px" }}>Mood & energy this week</div>
      <div className="scores-grid">
        {Object.keys(sliderLabels).map(key => {
          const avg = avgScore(key)
          return (
            <div key={key} className="score-card">
              <div className="score-emoji">{sliderEmojis[key]}</div>
              <div className="score-label">{sliderLabels[key]}</div>
              <div className="score-value">{avg !== null ? `${avg}/10` : "—"}</div>
              {avg !== null && (
                <div className="score-bar-bg">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${Math.round((avg / 10) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="journal-section-label" style={{ marginTop: "24px" }}>Journal entries</div>
      <div className="week-grid">
        {days.map(day => {
          const entry = getJournalDay(day)
          return (
            <div key={day} className="week-day">
              <div className="week-day-label">{getShortDay(day)}</div>
              <div className={`week-dot ${entry ? "dot-full" : "dot-empty"}`}>
                {entry ? "✓" : ""}
              </div>
            </div>
          )
        })}
      </div>

      {journalHistory.slice(0, 3).map(entry => (
        <div key={entry.date} className="note-card" style={{ marginTop: "12px" }}>
          <div className="note-date">{entry.date}</div>
          <div className="note-scores">
            {Object.keys(sliderLabels).map(k => (
              <span key={k} className="note-score-pill">
                {sliderEmojis[k]} {entry.scores?.[k] ?? "—"}
              </span>
            ))}
          </div>
          {entry.note && <div className="note-text">{entry.note}</div>}
        </div>
      ))}
    </div>
  )
}

export default Weekly