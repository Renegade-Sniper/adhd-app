import React, { useState, useEffect } from "react"

const defaultRooms = [
  {
    id: "kitchen",
    name: "Kitchen",
    tasks: [
      { id: 1, name: "Wash dishes", done: false },
      { id: 2, name: "Wipe counters", done: false },
      { id: 3, name: "Clean stovetop", done: false },
      { id: 4, name: "Empty trash", done: false },
      { id: 5, name: "Wipe microwave", done: false },
      { id: 6, name: "Mop floor", done: false },
    ]
  },
  {
    id: "livingroom",
    name: "Living Room",
    tasks: [
      { id: 7, name: "Vacuum", done: false },
      { id: 8, name: "Dust surfaces", done: false },
      { id: 9, name: "Tidy clutter", done: false },
      { id: 10, name: "Wipe down TV", done: false },
    ]
  },
  {
    id: "bathrooms",
    name: "Bathrooms",
    tasks: [
      { id: 11, name: "Clean toilet", done: false },
      { id: 12, name: "Scrub sink", done: false },
      { id: 13, name: "Scrub shower/tub", done: false },
      { id: 14, name: "Wipe mirror", done: false },
      { id: 15, name: "Empty trash", done: false },
      { id: 16, name: "Mop floor", done: false },
    ]
  },
  {
    id: "bedrooms",
    name: "Bedrooms",
    tasks: [
      { id: 17, name: "Make bed", done: false },
      { id: 18, name: "Pick up clothes", done: false },
      { id: 19, name: "Vacuum", done: false },
      { id: 20, name: "Dust surfaces", done: false },
      { id: 21, name: "Change bed sheets", done: false },
    ]
  },
  {
    id: "laundry",
    name: "Laundry Room",
    tasks: [
      { id: 22, name: "Wash laundry", done: false },
      { id: 23, name: "Dry laundry", done: false },
      { id: 24, name: "Put away laundry", done: false },
      { id: 25, name: "Wipe washer/dryer", done: false },
    ]
  },
  {
    id: "car",
    name: "Car/Garage",
    tasks: [
      { id: 26, name: "Vacuum car", done: false },
      { id: 27, name: "Wipe dashboard", done: false },
      { id: 28, name: "Take out trash", done: false },
      { id: 29, name: "Organize garage", done: false },
    ]
  },
]

function CleaningErrorFallback({ onReset }) {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p style={{ color: "#888", marginBottom: "16px" }}>Something went wrong loading your cleaning tasks.</p>
      <button className="save-btn" onClick={onReset}>Reset cleaning data</button>
    </div>
  )
}

function Cleaning() {
  const [rooms, setRooms] = useState(() => {
    try {
      const saved = localStorage.getItem("cleaning")
      const customRooms = JSON.parse(localStorage.getItem("customRooms") || "null")
      const roomList = customRooms || defaultRooms
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!Array.isArray(parsed)) throw new Error("invalid")
        return roomList.map(room => {
          const existing = parsed.find(r => r.id === room.id)
          return existing && Array.isArray(existing.tasks)
            ? existing
            : { ...room, tasks: [] }
        })
      }
      return roomList.map(room => ({ ...room, tasks: [] }))
    } catch (e) {
      localStorage.removeItem("cleaning")
      return defaultRooms.map(room => ({ ...room, tasks: [] }))
    }
  })

  const [activeRoom, setActiveRoom] = useState(() => {
    try {
      const saved = localStorage.getItem("cleaning")
      const customRooms = JSON.parse(localStorage.getItem("customRooms") || "null")
      const roomList = customRooms || defaultRooms
      return roomList[0]?.id || "kitchen"
    } catch (e) {
      return "kitchen"
    }
  })

  useEffect(() => {
    localStorage.setItem("cleaning", JSON.stringify(rooms))
  }, [rooms])

  useEffect(() => {
    const today = new Date().toDateString()
    const lastReset = localStorage.getItem("cleaningLastReset")
    if (lastReset !== today) {
      setRooms(prev => prev.map(room => ({
        ...room,
        tasks: room.tasks.map(task => ({ ...task, done: false }))
      })))
      localStorage.setItem("cleaningLastReset", today)
    }
  }, [])

  function toggleTask(roomId, taskId) {
    setRooms(rooms.map(room =>
      room.id === roomId
        ? { ...room, tasks: room.tasks.map(task =>
            task.id === taskId ? { ...task, done: !task.done } : task
          )}
        : room
    ))
  }

  const currentRoom = rooms.find(room => room.id === activeRoom) || rooms[0]
  if (!currentRoom) return null
  const doneCount = currentRoom.tasks.filter(t => t.done).length

  return (
    <div>
      <div className="room-tabs">
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

      <div className="progress-row">
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: currentRoom.tasks.length > 0 ? `${Math.round((doneCount / currentRoom.tasks.length) * 100)}%` : "0%" }}
          />
        </div>
        <span className="progress-label">{doneCount}/{currentRoom.tasks.length}</span>
      </div>

      <div className="room-tasks">
        {currentRoom.tasks.length === 0 && (
          <p style={{ fontSize: "14px", color: "#888", textAlign: "center", marginTop: "20px" }}>
            No tasks yet — add some in Settings!
          </p>
        )}
        {currentRoom.tasks.map(task => (
          <div
            key={task.id}
            className={`task-card ${task.done ? "done" : ""}`}
            onClick={() => toggleTask(activeRoom, task.id)}
          >
            <div className={`check-circle ${task.done ? "checked" : ""}`}>
              {task.done && "✓"}
            </div>
            <div className="task-info">
              <div className={`task-name ${task.done ? "strikethrough" : ""}`}>{task.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

class CleaningBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: false }
  }

  static getDerivedStateFromError() {
    return { error: true }
  }

  render() {
    if (this.state.error) {
      return (
        <CleaningErrorFallback onReset={() => {
          localStorage.removeItem("cleaning")
          localStorage.removeItem("customRooms")
          this.setState({ error: false })
        }} />
      )
    }
    return <Cleaning {...this.props} />
  }
}

export default CleaningBoundary