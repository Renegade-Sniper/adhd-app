import { useState, useEffect } from "react"

function getPointsBalance(history) {
  return history.reduce((sum, entry) => sum + entry.amount, 0)
}

function getTodayEarned(history) {
  const today = new Date().toDateString()
  return history
    .filter(e => e.date === today && e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0)
}

function Points() {
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("pointsHistory") || "[]")
  })

  const [rewards, setRewards] = useState(() => {
    return JSON.parse(localStorage.getItem("rewards") || "[]")
  })

  const [newRewardName, setNewRewardName] = useState("")
  const [newRewardCost, setNewRewardCost] = useState("")
  const [newRewardCooldown, setNewRewardCooldown] = useState("0")
  const [showAddReward, setShowAddReward] = useState(false)
  const [activeSection, setActiveSection] = useState("rewards")

  const balance = getPointsBalance(history)
  const todayEarned = getTodayEarned(history)

  useEffect(() => {
    localStorage.setItem("pointsHistory", JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem("rewards", JSON.stringify(rewards))
  }, [rewards])

  useEffect(() => {
    const today = new Date().toDateString()
    const alreadyAwarded = history.some(e => e.date === today && e.source === "auto")
    if (alreadyAwarded) return

    let earned = 0
    const breakdown = []

    const meds = JSON.parse(localStorage.getItem("meds") || "[]")
    meds.forEach(med => {
      if (!med.done) return
      const scheduled = new Date()
      const [h, min] = med.scheduledTime.split(":").map(Number)
      scheduled.setHours(h, min, 0, 0)
      const diffMinutes = med.takenAt ? (new Date(med.takenAt) - scheduled) / 60000 : 999
      const pts = diffMinutes <= 60 ? 2 : 1
      earned += pts
      breakdown.push(`${med.name}: +${pts}pt${pts > 1 ? "s" : ""}`)
    })

    const cleaning = JSON.parse(localStorage.getItem("cleaning") || "[]")
    cleaning.forEach(room => {
      const anyDone = room.tasks.some(t => t.done)
      if (anyDone) {
        earned += 1
        breakdown.push(`${room.name}: +1pt`)
      }
    })
const hygiene = JSON.parse(localStorage.getItem("hygiene") || "[]")
    const hygieneDone = hygiene.filter(h => h.done).length
    const hygienePoints = Math.min(hygieneDone, 3)
    if (hygienePoints > 0) {
      earned += hygienePoints
      breakdown.push(`Hygiene: +${hygienePoints}pt${hygienePoints > 1 ? "s" : ""}`)
    }
    if (earned > 0) {
      const entry = {
        id: Date.now(),
        date: today,
        amount: earned,
        description: `Earned today: ${breakdown.join(", ")}`,
        source: "auto",
      }
      setHistory(prev => [entry, ...prev])
    }
  }, [])

  function redeemReward(reward) {
    if (balance < reward.cost) return

    const today = new Date().toDateString()
    if (reward.cooldownDays > 0 && reward.lastRedeemed) {
      const lastDate = new Date(reward.lastRedeemed)
      const daysSince = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24))
      if (daysSince < reward.cooldownDays) return
    }

    const entry = {
      id: Date.now(),
      date: today,
      amount: -reward.cost,
      description: `Redeemed: ${reward.name}`,
      source: "redeem",
    }
    setHistory(prev => [entry, ...prev])
    setRewards(rewards.map(r =>
      r.id === reward.id ? { ...r, lastRedeemed: new Date().toISOString() } : r
    ))
  }

  function addReward() {
    if (!newRewardName.trim() || !newRewardCost) return
    const reward = {
      id: Date.now(),
      name: newRewardName.trim(),
      cost: Number(newRewardCost),
      cooldownDays: Number(newRewardCooldown),
      lastRedeemed: null,
    }
    setRewards([...rewards, reward])
    setNewRewardName("")
    setNewRewardCost("")
    setNewRewardCooldown("0")
    setShowAddReward(false)
  }

  function deleteReward(id) {
    setRewards(rewards.filter(r => r.id !== id))
  }

  function canRedeem(reward) {
    if (balance < reward.cost) return false
    if (reward.cooldownDays > 0 && reward.lastRedeemed) {
      const daysSince = Math.floor((new Date() - new Date(reward.lastRedeemed)) / (1000 * 60 * 60 * 24))
      return daysSince >= reward.cooldownDays
    }
    return true
  }

  function getCooldownRemaining(reward) {
    if (!reward.lastRedeemed || reward.cooldownDays === 0) return null
    const daysSince = Math.floor((new Date() - new Date(reward.lastRedeemed)) / (1000 * 60 * 60 * 24))
    const remaining = reward.cooldownDays - daysSince
    return remaining > 0 ? remaining : null
  }

  return (
    <div>
      <div className="points-header">
        <div className="points-balance-card">
          <div className="points-balance-label">Total points</div>
          <div className="points-balance-value">{balance}</div>
          {todayEarned > 0 && (
            <div className="points-today">+{todayEarned} earned today</div>
          )}
        </div>
      </div>

      <div className="points-tabs">
        <button
          className={`points-tab ${activeSection === "rewards" ? "active" : ""}`}
          onClick={() => setActiveSection("rewards")}
        >
          Rewards
        </button>
        <button
          className={`points-tab ${activeSection === "history" ? "active" : ""}`}
          onClick={() => setActiveSection("history")}
        >
          History
        </button>
      </div>

      {activeSection === "rewards" && (
        <div>
          {rewards.length === 0 && !showAddReward && (
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "16px" }}>
              No rewards yet — add something to work toward!
            </p>
          )}

          {rewards.map(reward => {
            const redeemable = canRedeem(reward)
            const cooldownLeft = getCooldownRemaining(reward)
            return (
              <div key={reward.id} className="reward-card">
                <div className="reward-info">
                  <div className="reward-name">{reward.name}</div>
                  <div className="reward-meta">
                    {reward.cost} pt{reward.cost !== 1 ? "s" : ""}
                    {reward.cooldownDays > 0 && ` · ${reward.cooldownDays}d cooldown`}
                    {cooldownLeft && (
                      <span className="cooldown-badge"> · {cooldownLeft}d left</span>
                    )}
                  </div>
                </div>
                <div className="reward-actions">
                  <button
                    className={`redeem-btn ${redeemable ? "active" : "disabled"}`}
                    onClick={() => redeemReward(reward)}
                    disabled={!redeemable}
                  >
                    {cooldownLeft ? `${cooldownLeft}d` : `${reward.cost}pt`}
                  </button>
                  <button className="icon-btn delete" onClick={() => deleteReward(reward.id)}>🗑️</button>
                </div>
              </div>
            )
          })}

          {showAddReward ? (
            <div className="add-reward-form">
              <div className="journal-section-label">New reward</div>
              <input
                className="settings-input"
                placeholder="Reward name (e.g. 30 min gaming)"
                value={newRewardName}
                onChange={e => setNewRewardName(e.target.value)}
              />
              <input
                className="settings-input"
                type="number"
                placeholder="Point cost"
                value={newRewardCost}
                onChange={e => setNewRewardCost(e.target.value)}
              />
              <input
                className="settings-input"
                type="number"
                placeholder="Cooldown in days (0 = no cooldown)"
                value={newRewardCooldown}
                onChange={e => setNewRewardCooldown(e.target.value)}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="settings-btn save" onClick={addReward}>Add reward</button>
                <button className="settings-btn cancel" onClick={() => setShowAddReward(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="add-btn" style={{ width: "100%", marginTop: "8px" }} onClick={() => setShowAddReward(true)}>
              + add reward
            </button>
          )}
        </div>
      )}

      {activeSection === "history" && (
        <div>
          {history.length === 0 && (
            <p style={{ fontSize: "14px", color: "#888" }}>No history yet — start checking off tasks!</p>
          )}
          {history.map(entry => (
            <div key={entry.id} className="history-entry">
              <div className="history-info">
                <div className="history-desc">{entry.description}</div>
                <div className="history-date">{entry.date}</div>
              </div>
              <div className={`history-amount ${entry.amount > 0 ? "positive" : "negative"}`}>
                {entry.amount > 0 ? "+" : ""}{entry.amount}pt
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Points