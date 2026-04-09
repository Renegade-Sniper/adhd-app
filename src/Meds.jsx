import { scheduleMedReminders } from "./notifications"
import { useState, useEffect, useRef } from "react"
import { defaultMeds } from "./defaults"

const defaultHygiene = [
  { id: "shower", name: "Shower/bath", done: false },
  { id: "teeth", name: "Brush teeth", done: false },
  { id: "face", name: "Wash face", done: false },
  { id: "skincare", name: "Skincare routine", done: false },
  { id: "deodorant", name: "Deodorant", done: false },
  { id: "hair", name: "Hair care", done: false },
  { id: "vitamins", name: "Take vitamins/supplements", done: false },
]

function parseScheduledTime(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

function getStatus(scheduledTime, takenAt) {
  if (!takenAt) return null
  const scheduled = parseScheduledTime(scheduledTime)
  const taken = new Date(takenAt)
  const diffMinutes = (taken - scheduled) / 60000
  return diffMinutes <= 60 ? "on time" : "late"
}

function formatTime(isoString) {
  if (!isoString) return ""
  return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function Meds() {
  const today = new Date().toDateString()

  const [meds, setMeds] = useState(() => {
    const saved = localStorage.getItem("meds")
    return saved ? JSON.parse(saved) : defaultMeds
  })

  const [hygiene, setHygiene] = useState(() => {
    const saved = localStorage.getItem("hygiene")
    return saved ? JSON.parse(saved) : defaultHygiene
  })

  const [activeSection, setActiveSection] = useState("meds")
  const [showCelebration, setShowCelebration] = useState(false)
  const prevDoneRef = useRef(false)

  useEffect(() => {
    const lastReset = localStorage.getItem("medsLastReset")
    if (lastReset !== today) {
      const saved = localStorage.getItem("meds")
      const current = saved ? JSON.parse(saved) : defaultMeds
      const reset = current.map(med => ({ ...med, done: false, takenAt: null }))
      setMeds(reset)
      localStorage.setItem("meds", JSON.stringify(reset))
      localStorage.setItem("medsLastReset", today)
    }
  }, [])
  useEffect(() => {
    scheduleMedReminders(meds)
  }, [])

  useEffect(() => {
    const lastReset = localStorage.getItem("hygieneLastReset")
    if (lastReset !== today) {
      const saved = localStorage.getItem("hygiene")
      const current = saved ? JSON.parse(saved) : defaultHygiene
      const reset = current.map(h => ({ ...h, done: false }))
      setHygiene(reset)
      localStorage.setItem("hygiene", JSON.stringify(reset))
      localStorage.setItem("hygieneLastReset", today)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("meds", JSON.stringify(meds))
  }, [meds])

  useEffect(() => {
    localStorage.setItem("hygiene", JSON.stringify(hygiene))
  }, [hygiene])

  const medsDoneCount = meds.filter(m => m.done).length
  const allMedsDone = medsDoneCount === meds.length && meds.length > 0

  useEffect(() => {
    if (allMedsDone && !prevDoneRef.current) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    }
    prevDoneRef.current = allMedsDone
  }, [allMedsDone])

  function toggleMed(id) {
    setMeds(meds.map(med => {
      if (med.id !== id) return med
      if (med.done) {
        return { ...med, done: false, takenAt: null }
      } else {
        return { ...med, done: true, takenAt: new Date().toISOString() }
      }
    }))
  }

  function toggleHygiene(id) {
    setHygiene(hygiene.map(h =>
      h.id === id ? { ...h, done: !h.done } : h
    ))
  }

  const hygieneDoneCount = hygiene.filter(h => h.done).length

  return (
    <div>
      <div className="section-tabs">
        <button
          className={`section-tab ${activeSection === "meds" ? "active" : ""}`}
          onClick={() => setActiveSection("meds")}
        >
          💊 Medications
        </button>
        <button
          className={`section-tab ${activeSection === "hygiene" ? "active" : ""}`}
          onClick={() => setActiveSection("hygiene")}
        >
          🧼 Hygiene
        </button>
      </div>

      {activeSection === "meds" && (
        <div>
          {showCelebration && (
            <div className="celebration">
              <div className="celebration-text">💊 All meds taken!</div>
              <div className="confetti-row">
                {["🎉","✨","⚡","🌿","🎊","✅","💚","🌟"].map((e, i) => (
                  <span key={i} className="confetti-piece" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
                ))}
              </div>
            </div>
          )}

          <div className="progress-row">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.round((medsDoneCount / meds.length) * 100)}%` }}
              />
            </div>
            <span className="progress-label">{medsDoneCount}/{meds.length}</span>
          </div>

          <div className="journal-section-label">Scheduled</div>

          {meds.map(med => {
            const status = getStatus(med.scheduledTime, med.takenAt)
            return (
              <div
                key={med.id}
                className={`task-card ${med.done ? "done" : ""}`}
                onClick={() => toggleMed(med.id)}
              >
                <div className={`check-circle ${med.done ? "checked" : ""}`}>
                  {med.done && "✓"}
                </div>
                <div className="task-info">
                  <div className={`task-name ${med.done ? "strikethrough" : ""}`}>{med.name}</div>
                  <div className="task-meta">
                    {med.done
                      ? `Taken at ${formatTime(med.takenAt)}`
                      : `Scheduled ${med.scheduledTime}`
                    }
                  </div>
                </div>
                {status && (
                  <span className={`task-badge ${status === "on time" ? "badge-ontime" : "badge-late"}`}>
                    {status}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {activeSection === "hygiene" && (
        <div>
          <div className="progress-row">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.round((hygieneDoneCount / hygiene.length) * 100)}%` }}
              />
            </div>
            <span className="progress-label">{hygieneDoneCount}/{hygiene.length}</span>
          </div>

          {hygiene.map(item => (
            <div
              key={item.id}
              className={`task-card ${item.done ? "done" : ""}`}
              onClick={() => toggleHygiene(item.id)}
            >
              <div className={`check-circle ${item.done ? "checked" : ""}`}>
                {item.done && "✓"}
              </div>
              <div className="task-info">
                <div className={`task-name ${item.done ? "strikethrough" : ""}`}>{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Meds
