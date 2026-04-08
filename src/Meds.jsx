import { useState, useEffect } from "react"

const defaultMeds = [
  { id: 1, name: "Adderall XR 15mg", scheduledTime: "09:30", done: false, takenAt: null },
  { id: 2, name: "Vraylar 1.5mg", scheduledTime: "09:30", done: false, takenAt: null },
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
  const [meds, setMeds] = useState(() => {
    const saved = localStorage.getItem("meds")
    return saved ? JSON.parse(saved) : defaultMeds
  })

  const today = new Date().toDateString()

  useEffect(() => {
    const lastReset = localStorage.getItem("medsLastReset")
    if (lastReset !== today) {
      const reset = defaultMeds.map(med => ({ ...med, done: false, takenAt: null }))
      setMeds(reset)
      localStorage.setItem("meds", JSON.stringify(reset))
      localStorage.setItem("medsLastReset", today)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("meds", JSON.stringify(meds))
  }, [meds])

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

  const doneCount = meds.filter(m => m.done).length

  return (
    <div>
      <div className="progress-row">
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.round((doneCount / meds.length) * 100)}%` }}
          />
        </div>
        <span className="progress-label">{doneCount}/{meds.length}</span>
      </div>

      <div className="journal-section-label">9:30am</div>

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
                  : `Scheduled 9:30am`
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
  )
}

export default Meds
