import { useState } from "react"
import { Flame, PillBottle, BrushCleaning, BookOpen, Star, Check, Clock, Sparkles, Smile, Zap } from "lucide-react"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getStreak() {
  const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]")
  if (entries.length === 0) return 0
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateStr = checkDate.toDateString()
    if (entries.find(e => e.date === dateStr)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function getMedsSummary() {
  const meds = JSON.parse(localStorage.getItem("meds") || "[]")
  if (meds.length === 0) return { done: 0, total: 0 }
  return { done: meds.filter(m => m.done).length, total: meds.length }
}

function getCleaningSummary() {
  const rooms = JSON.parse(localStorage.getItem("cleaning") || "[]")
  if (rooms.length === 0) return { done: 0, total: 0 }
  let done = 0, total = 0
  rooms.forEach(room => room.tasks.forEach(task => { total++; if (task.done) done++ }))
  return { done, total }
}

function getPointsBalance() {
  const history = JSON.parse(localStorage.getItem("pointsHistory") || "[]")
  return history.reduce((sum, entry) => sum + entry.amount, 0)
}

function getJournalSummary() {
  const saved = localStorage.getItem("journalNote")
  const parsed = saved ? JSON.parse(saved) : null
  return parsed && parsed.date === new Date().toDateString() && parsed.note ? true : false
}

function getMedsInsights() {
  const meds = JSON.parse(localStorage.getItem("meds") || "[]")
  const insights = []
  if (meds.length === 0) return insights
  const onTime = meds.filter(m => m.done && m.takenAt).every(m => {
    const scheduled = new Date()
    const [h, min] = m.scheduledTime.split(":").map(Number)
    scheduled.setHours(h, min, 0, 0)
    return (new Date(m.takenAt) - scheduled) / 60000 <= 60
  })
  const allDone = meds.every(m => m.done)
  const noneDone = meds.every(m => !m.done)
  if (allDone && onTime) insights.push({ icon: "✓", text: "All meds taken on time today", tone: "good" })
  else if (allDone && !onTime) insights.push({ icon: "⏱", text: "All meds taken, though a bit late today", tone: "neutral" })
  else if (!noneDone) insights.push({ icon: "💊", text: `${meds.filter(m => m.done).length} of ${meds.length} meds taken today`, tone: "neutral" })
  else insights.push({ icon: "💊", text: "Don't forget your meds today", tone: "nudge" })
  return insights
}

function getCleaningInsights() {
  const history = JSON.parse(localStorage.getItem("cleaningHistory") || "[]")
  const rooms = JSON.parse(localStorage.getItem("cleaning") || "[]")
  const insights = []
  if (rooms.length === 0) return insights

  const taskCounts = {}
  history.forEach(entry => {
    entry.tasks && entry.tasks.forEach(t => {
      if (t.done) taskCounts[t.name] = (taskCounts[t.name] || 0) + 1
    })
  })

  const topTasks = Object.entries(taskCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)

  if (topTasks.length > 0) {
    insights.push({ icon: "🧹", text: `You've been crushing "${topTasks[0][0]}" this week`, tone: "good" })
  }

  const current = rooms.flatMap(r => r.tasks)
  const doneToday = current.filter(t => t.done).length
  if (doneToday > 0) {
    insights.push({ icon: "⚡", text: `${doneToday} cleaning task${doneToday > 1 ? "s" : ""} done today`, tone: "good" })
  }

  return insights
}

function getJournalInsights() {
  const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]")
  const insights = []
  if (entries.length < 2) return insights

  const recent = entries.slice(0, 7)
  const avg = (key) => {
    const vals = recent.map(e => e.scores?.[key]).filter(Boolean)
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  }

  const mood = avg("mood")
  const energy = avg("energy")
  const focus = avg("focus")

  if (mood !== null) {
    const tone = mood >= 7 ? "good" : mood >= 5 ? "neutral" : "nudge"
    insights.push({ icon: "🙂", text: `Average mood this week: ${mood}/10`, tone })
  }
  if (energy !== null) {
    const tone = energy >= 7 ? "good" : energy >= 5 ? "neutral" : "nudge"
    insights.push({ icon: "⚡", text: `Average energy this week: ${energy}/10`, tone })
  }
  if (focus !== null) {
    const tone = focus >= 7 ? "good" : focus >= 5 ? "neutral" : "nudge"
    insights.push({ icon: "🎯", text: `Average focus this week: ${focus}/10`, tone })
  }

  return insights
}

function Home({ setActiveTab }) {
  const streak = getStreak()
  const meds = getMedsSummary()
  const cleaning = getCleaningSummary()
  const journaled = getJournalSummary()
  const [showCatchUp, setShowCatchUp] = useState(false)
  const [catchUpDate, setCatchUpDate] = useState("")
  const [catchUpNote, setCatchUpNote] = useState("")
  const [catchUpSaved, setCatchUpSaved] = useState(false)

  const allInsights = [
    ...getMedsInsights(),
    ...getCleaningInsights(),
    ...getJournalInsights(),
  ]

  function handleCatchUp() {
    if (!catchUpDate) return
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]")
    const dateStr = new Date(catchUpDate + "T12:00:00").toDateString()
    const entry = {
      date: dateStr,
      scores: { mood: 5, energy: 5, focus: 5, sleep: 5, appetite: 5 },
      note: catchUpNote || "Logged retroactively",
    }
    const updated = [entry, ...entries.filter(e => e.date !== dateStr)]
    localStorage.setItem("journalEntries", JSON.stringify(updated))
    setCatchUpSaved(true)
    setTimeout(() => {
      setShowCatchUp(false)
      setCatchUpSaved(false)
      setCatchUpDate("")
      setCatchUpNote("")
    }, 1500)
  }

  return (
    <div>
      <div className="home-greeting">
        <span>{getGreeting()}</span>
        {streak > 0 && <span className="streak-pill"><Flame size={14} /> {streak} day streak</span>}
      </div>

      <div className="summary-grid">
  <div className="summary-card" onClick={() => setActiveTab("points")}>
    <div className="summary-icon"><Star size={22} /></div>
    <div className="summary-info">
      <div className="summary-title">Points</div>
      <div className="summary-stat">{getPointsBalance()} available</div>
    </div>
    <div className="summary-status pending">→</div>
  </div>
  <div className="summary-card" onClick={() => setActiveTab("meds")}>
    <div className="summary-icon"><PillBottle size={22} /></div>
    <div className="summary-info">
      <div className="summary-title">Meds</div>
      <div className="summary-stat">{meds.total === 0 ? "No meds" : `${meds.done}/${meds.total} taken`}</div>
    </div>
    <div className={`summary-status ${meds.done === meds.total && meds.total > 0 ? "done" : "pending"}`}>
      {meds.done === meds.total && meds.total > 0 ? "✓" : "→"}
    </div>
  </div>

        <div className="summary-card" onClick={() => setActiveTab("cleaning")}>
          <div className="summary-icon"><BrushCleaning size={22} /></div>
          <div className="summary-info">
            <div className="summary-title">Cleaning</div>
            <div className="summary-stat">{cleaning.done}/{cleaning.total} tasks</div>
          </div>
          <div className={`summary-status ${cleaning.done === cleaning.total && cleaning.total > 0 ? "done" : "pending"}`}>
            {cleaning.done === cleaning.total && cleaning.total > 0 ? "✓" : "→"}
          </div>
        </div>

        <div className="summary-card" onClick={() => setActiveTab("journal")}>
          <div className="summary-icon"><BookOpen size={22} /></div>
          <div className="summary-info">
            <div className="summary-title">Journal</div>
            <div className="summary-stat">{journaled ? "Entry saved" : "Not yet today"}</div>
          </div>
          <div className={`summary-status ${journaled ? "done" : "pending"}`}>
            {journaled ? "✓" : "→"}
          </div>
        </div>
      </div>

      {allInsights.length > 0 && (
        <div className="insights-section">
          <div className="journal-section-label">This week</div>
          {allInsights.map((insight, i) => (
            <div key={i} className={`insight-card tone-${insight.tone}`}>
              <span className="insight-icon">{insight.icon}</span>
              <span className="insight-text">{insight.text}</span>
            </div>
          ))}
        </div>
      )}

      <button className="catchup-btn" onClick={() => setShowCatchUp(!showCatchUp)}>
        📅 Log a previous day
      </button>

      {showCatchUp && (
        <div className="catchup-form">
          <div className="journal-section-label">Which day?</div>
          <input
            type="date"
            className="date-input"
            value={catchUpDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => setCatchUpDate(e.target.value)}
          />
          <div className="journal-section-label" style={{ marginTop: "12px" }}>Any notes?</div>
          <textarea
            className="journal-input"
            placeholder="Optional — what do you remember about that day?"
            value={catchUpNote}
            onChange={e => setCatchUpNote(e.target.value)}
          />
          <button className="save-btn" onClick={handleCatchUp}>
            {catchUpSaved ? "Saved ✓" : "Save entry"}
          </button>
        </div>
      )}
    </div>
  )
}

export default Home