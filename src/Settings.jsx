import { useState } from "react"

const defaultMeds = [
  { id: 1, name: "Adderall XR 15mg", scheduledTime: "9:30", done: false, takenAt: null },
  { id: 2, name: "Vraylar 1.5mg", scheduledTime: "9:30", done: false, takenAt: null },
]

function Settings() {
  const [meds, setMeds] = useState(() => {
    const saved = localStorage.getItem("meds")
    return saved ? JSON.parse(saved) : defaultMeds
  })

  const [newMedName, setNewMedName] = useState("")
  const [newMedTime, setNewMedTime] = useState("09:30")
  const [editingMed, setEditingMed] = useState(null)
  const [savedMsg, setSavedMsg] = useState("")

  function saveMeds(updated) {
    setMeds(updated)
    localStorage.setItem("meds", JSON.stringify(updated))
    setSavedMsg("Saved!")
    setTimeout(() => setSavedMsg(""), 1500)
  }

  function addMed() {
    if (!newMedName.trim()) return
    const newMed = {
      id: Date.now(),
      name: newMedName.trim(),
      scheduledTime: newMedTime,
      done: false,
      takenAt: null,
    }
    saveMeds([...meds, newMed])
    setNewMedName("")
    setNewMedTime("09:30")
  }

  function deleteMed(id) {
    saveMeds(meds.filter(m => m.id !== id))
  }

  function startEditMed(med) {
    const timePadded = med.scheduledTime.length === 4 
      ? "0" + med.scheduledTime 
      : med.scheduledTime
    setEditingMed({ ...med, scheduledTime: timePadded })
  }

  function saveEditMed() {
    saveMeds(meds.map(m => m.id === editingMed.id 
      ? { ...m, name: editingMed.name, scheduledTime: editingMed.scheduledTime } 
      : m
    ))
    setEditingMed(null)
  }

  return (
    <div>
      <div className="settings-section">
        <div className="journal-section-label">Medications</div>

        {meds.map(med => (
          <div key={med.id} className="settings-card">
            {editingMed && editingMed.id === med.id ? (
              <div className="edit-form">
                <input
                  className="settings-input"
                  value={editingMed.name}
                  onChange={e => setEditingMed({ ...editingMed, name: e.target.value })}
                />
                <input
                  type="time"
                  className="settings-input"
                  value={editingMed.scheduledTime}
                  onChange={e => setEditingMed({ ...editingMed, scheduledTime: e.target.value })}
                />
                <div className="edit-actions">
                  <button className="settings-btn save" onClick={saveEditMed}>Save</button>
                  <button className="settings-btn cancel" onClick={() => setEditingMed(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="settings-row">
                <div className="settings-info">
                  <div className="settings-name">{med.name}</div>
                  <div className="settings-meta">{med.scheduledTime}</div>
                </div>
                <div className="settings-actions">
                  <button className="icon-btn" onClick={() => startEditMed(med)}>✏️</button>
                  <button className="icon-btn delete" onClick={() => deleteMed(med.id)}>🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="add-form">
          <div className="journal-section-label" style={{ marginTop: "16px" }}>Add medication</div>
          <input
            className="settings-input"
            placeholder="Medication name"
            value={newMedName}
            onChange={e => setNewMedName(e.target.value)}
          />
          <input
            type="time"
            className="settings-input"
            value={newMedTime}
            onChange={e => setNewMedTime(e.target.value)}
          />
          <button className="save-btn" onClick={addMed}>Add medication</button>
        </div>
      </div>

      {savedMsg && <div className="saved-toast">{savedMsg}</div>}
    </div>
  )
}

export default Settings
