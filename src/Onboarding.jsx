import { useState } from "react"
import { PillBottle, Plus, Trash2, Brain } from "lucide-react"

const defaultRooms = [
  { id: "kitchen", name: "Kitchen" },
  { id: "livingroom", name: "Living Room" },
  { id: "bathrooms", name: "Bathrooms" },
  { id: "bedrooms", name: "Bedrooms" },
  { id: "laundry", name: "Laundry Room" },
  { id: "car", name: "Car/Garage" },
]

const defaultHygiene = [
  { id: "shower", name: "Shower/bath" },
  { id: "teeth", name: "Brush teeth" },
  { id: "face", name: "Wash face" },
  { id: "skincare", name: "Skincare routine" },
  { id: "deodorant", name: "Deodorant" },
  { id: "hair", name: "Hair care" },
  { id: "vitamins", name: "Take vitamins/supplements" },
]

function Onboarding({ onComplete }) {
  const [name, setName] = useState("")
  const [meds, setMeds] = useState([{ id: Date.now(), name: "", scheduledTime: "09:30" }])
  const [selectedHygiene, setSelectedHygiene] = useState(["shower", "teeth", "face", "deodorant"])
  const [selectedRooms, setSelectedRooms] = useState(["kitchen", "livingroom", "bathrooms", "bedrooms"])

  function addMed() {
    setMeds([...meds, { id: Date.now(), name: "", scheduledTime: "09:30" }])
  }

  function updateMed(id, field, value) {
    setMeds(meds.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  function removeMed(id) {
    if (meds.length === 1) return
    setMeds(meds.filter(m => m.id !== id))
  }

  function toggleHygiene(id) {
    setSelectedHygiene(prev =>
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    )
  }

  function toggleRoom(id) {
    setSelectedRooms(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  function handleComplete() {
    if (name.trim()) {
      localStorage.setItem("userName", name.trim())
    }

    const validMeds = meds
      .filter(m => m.name.trim())
      .map((m, i) => ({ ...m, id: i + 1, done: false, takenAt: null }))
    if (validMeds.length > 0) {
      localStorage.setItem("meds", JSON.stringify(validMeds))
    }

    const hygieneItems = defaultHygiene
      .filter(h => selectedHygiene.includes(h.id))
      .map(h => ({ ...h, done: false }))
    localStorage.setItem("hygiene", JSON.stringify(hygieneItems))

    const rooms = defaultRooms
      .filter(r => selectedRooms.includes(r.id))
      .map(r => ({ ...r, tasks: [] }))
    localStorage.setItem("cleaning", JSON.stringify(rooms))
    localStorage.setItem("customRooms", JSON.stringify(
      defaultRooms.filter(r => selectedRooms.includes(r.id))
    ))

    localStorage.setItem("onboardingComplete", "true")
    onComplete()
  }

  return (
    <div className="onboarding">
      <div className="onboarding-header">
        <div className="onboarding-icon"><Brain size={22} /></div>
        <h1 className="onboarding-title">Welcome</h1>
        <p className="onboarding-subtitle">Let's set things up for you. You can always change these later in Settings.</p>
      </div>

      <div className="onboarding-section">
        <div className="journal-section-label">What should I call you?</div>
        <input
          className="settings-input"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="onboarding-section">
        <div className="journal-section-label">Your medications</div>
        {meds.map(med => (
          <div key={med.id} className="onboarding-med-row">
            <input
              className="settings-input"
              placeholder="Medication name"
              value={med.name}
              onChange={e => updateMed(med.id, "name", e.target.value)}
              style={{ marginBottom: 0, flex: 1 }}
            />
            <input
              type="time"
              className="settings-input"
              value={med.scheduledTime}
              onChange={e => updateMed(med.id, "scheduledTime", e.target.value)}
              style={{ marginBottom: 0, width: "110px" }}
            />
            <button className="icon-btn delete" onClick={() => removeMed(med.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={addMed} style={{ width: "100%", marginTop: "8px" }}>
          <Plus size={14} style={{ display: "inline", marginRight: "4px" }} />
          Add medication
        </button>
      </div>

      <div className="onboarding-section">
        <div className="journal-section-label">Hygiene tasks to track</div>
        <div className="onboarding-chips">
          {defaultHygiene.map(h => (
            <button
              key={h.id}
              className={`onboarding-chip ${selectedHygiene.includes(h.id) ? "active" : ""}`}
              onClick={() => toggleHygiene(h.id)}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      <div className="onboarding-section">
        <div className="journal-section-label">Rooms to clean</div>
        <div className="onboarding-chips">
          {defaultRooms.map(r => (
            <button
              key={r.id}
              className={`onboarding-chip ${selectedRooms.includes(r.id) ? "active" : ""}`}
              onClick={() => toggleRoom(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <button className="save-btn" onClick={handleComplete} style={{ marginTop: "8px" }}>
        Let's go
      </button>
    </div>
  )
}

export default Onboarding