import { useState } from "react"

const defaultMeds = [
  { id: 1, name: "Adderall XR 15mg", scheduledTime: "09:30", done: false, takenAt: null },
  { id: 2, name: "Vraylar 1.5mg", scheduledTime: "09:30", done: false, takenAt: null },
]

const defaultRooms = [
  { id: "kitchen", name: "Kitchen" },
  { id: "livingroom", name: "Living Room" },
  { id: "bathrooms", name: "Bathrooms" },
  { id: "bedrooms", name: "Bedrooms" },
  { id: "laundry", name: "Laundry Room" },
  { id: "car", name: "Car/Garage" },
]

function getRooms() {
  const saved = localStorage.getItem("customRooms")
  return saved ? JSON.parse(saved) : defaultRooms
}

function Settings() {
  const [meds, setMeds] = useState(() => {
    const saved = localStorage.getItem("meds")
    return saved ? JSON.parse(saved) : defaultMeds
  })

  const [cleaning, setCleaning] = useState(() => {
    const saved = localStorage.getItem("cleaning")
    return saved ? JSON.parse(saved) : []
  })

  const [rooms, setRooms] = useState(() => getRooms())
const [activeRoom, setActiveRoom] = useState(rooms[0]?.id || "kitchen")
const [newRoomName, setNewRoomName] = useState("")
const [showAddRoom, setShowAddRoom] = useState(false)
  const [newMedName, setNewMedName] = useState("")
  const [newMedTime, setNewMedTime] = useState("09:30")
  const [newTaskName, setNewTaskName] = useState("")
  const [editingMed, setEditingMed] = useState(null)
  const [savedMsg, setSavedMsg] = useState("")

  function showSaved() {
    setSavedMsg("Saved!")
    setTimeout(() => setSavedMsg(""), 1500)
  }

  function saveMeds(updated) {
    setMeds(updated)
    localStorage.setItem("meds", JSON.stringify(updated))
    showSaved()
  }

  function saveCleaning(updated) {
    setCleaning(updated)
    localStorage.setItem("cleaning", JSON.stringify(updated))
    showSaved()
  }

  function addRoom() {
  if (!newRoomName.trim()) return
  const id = newRoomName.trim().toLowerCase().replace(/\s+/g, "")
  const newRoom = { id, name: newRoomName.trim() }
  const updatedRooms = [...rooms, newRoom]
  setRooms(updatedRooms)
  localStorage.setItem("customRooms", JSON.stringify(updatedRooms))
  setActiveRoom(id)
  setNewRoomName("")
  setShowAddRoom(false)
}

function deleteRoom(roomId) {
  const updatedRooms = rooms.filter(r => r.id !== roomId)
  setRooms(updatedRooms)
  localStorage.setItem("customRooms", JSON.stringify(updatedRooms))
  const updatedCleaning = cleaning.filter(r => r.id !== roomId)
  saveCleaning(updatedCleaning)
  setActiveRoom(updatedRooms[0]?.id || "kitchen")
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

  function getCurrentRoomTasks() {
    const room = cleaning.find(r => r.id === activeRoom)
    return room ? room.tasks : []
  }

  function addTask() {
    if (!newTaskName.trim()) return
    const newTask = { id: Date.now(), name: newTaskName.trim(), done: false }
    const roomExists = cleaning.find(r => r.id === activeRoom)
    let updated
    if (roomExists) {
      updated = cleaning.map(r =>
        r.id === activeRoom
          ? { ...r, tasks: [...r.tasks, newTask] }
          : r
      )
    } else {
      const roomInfo = defaultRooms.find(r => r.id === activeRoom)
      updated = [...cleaning, { ...roomInfo, tasks: [newTask] }]
    }
    saveCleaning(updated)
    setNewTaskName("")
  }

  function deleteTask(taskId) {
    const updated = cleaning.map(r =>
      r.id === activeRoom
        ? { ...r, tasks: r.tasks.filter(t => t.id !== taskId) }
        : r
    )
    saveCleaning(updated)
  }

  const currentTasks = getCurrentRoomTasks()

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

      <div className="settings-section">
        <div className="journal-section-label">Cleaning tasks</div>

       <div className="room-tabs" style={{ marginBottom: "12px" }}>
  {rooms.map(room => (
    <button
      key={room.id}
      className={`room-tab ${activeRoom === room.id ? "active" : ""}`}
      onClick={() => setActiveRoom(room.id)}
    >
      {room.name}
    </button>
  ))}
</div>

<div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
  {showAddRoom ? (
    <>
      <input
        className="settings-input"
        placeholder="Room name"
        value={newRoomName}
        onChange={e => setNewRoomName(e.target.value)}
        style={{ marginBottom: 0 }}
      />
      <button className="settings-btn save" style={{ whiteSpace: "nowrap" }} onClick={addRoom}>Add</button>
      <button className="settings-btn cancel" onClick={() => setShowAddRoom(false)}>Cancel</button>
    </>
  ) : (
    <button className="add-btn" style={{ width: "100%" }} onClick={() => setShowAddRoom(true)}>
      + add room
    </button>
  )}
</div>

{activeRoom && !defaultRooms.find(r => r.id === activeRoom) && (
  <button
    className="icon-btn delete"
    style={{ marginBottom: "12px", fontSize: "13px", color: "#888" }}
    onClick={() => deleteRoom(activeRoom)}
  >
    🗑️ Delete this room
  </button>
)}
        {currentTasks.length === 0 && (
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
            No tasks yet for this room.
          </p>
        )}

        {currentTasks.map(task => (
          <div key={task.id} className="settings-card">
            <div className="settings-row">
              <div className="settings-name">{task.name}</div>
              <button className="icon-btn delete" onClick={() => deleteTask(task.id)}>🗑️</button>
            </div>
          </div>
        ))}

        <div className="add-form" style={{ marginTop: "12px" }}>
          <input
            className="settings-input"
            placeholder={`Add task to ${defaultRooms.find(r => r.id === activeRoom)?.name}`}
            value={newTaskName}
            onChange={e => setNewTaskName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
          />
          <button className="save-btn" onClick={addTask}>Add task</button>
        </div>
      </div>

      {savedMsg && <div className="saved-toast">{savedMsg}</div>}
    </div>
  )
}

export default Settings