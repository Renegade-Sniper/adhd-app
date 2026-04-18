import { useState, useEffect } from "react"
import "./App.css"
import Home from "./Home"
import Meds from "./Meds"
import Cleaning from "./Cleaning"
import Journal from "./Journal"
import Settings from "./Settings"
import Weekly from "./Weekly"
import Points from "./points"
import Onboarding from "./Onboarding"
import { Home as HomeIcon, Heart, Sparkles, BarChart2, Star, Settings as SettingsIcon, Sun, Moon } from "lucide-react"

function getDynamicGreeting() {
  const hour = new Date().getHours()
  const streak = (() => {
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]")
    if (!entries.length) return 0
    let s = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      if (entries.find(e => e.date === d.toDateString())) s++
      else break
    }
    return s
  })()

  const yesterday = (() => {
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]")
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return entries.find(e => e.date === d.toDateString())
  })()

  const points = (() => {
    const history = JSON.parse(localStorage.getItem("pointsHistory") || "[]")
    return history.reduce((sum, e) => sum + e.amount, 0)
  })()

  const meds = JSON.parse(localStorage.getItem("meds") || "[]")
  const allMedsDone = meds.length > 0 && meds.every(m => m.done)
  const yesterdayMood = yesterday?.scores?.mood || null
  const yesterdayEnergy = yesterday?.scores?.energy || null

  if (allMedsDone && hour < 12) return "Meds done before noon? You're winning 🌿"
  if (allMedsDone) return "All meds taken! That's huge 💊"
  if (streak >= 7) return `${streak} days in a row. You're on fire ⚡`
  if (streak >= 3) return `${streak} day streak going strong 🌱`
  if (yesterdayMood !== null && yesterdayMood <= 3) return "Yesterday was rough. Today is a new one 🌿"
  if (yesterdayEnergy !== null && yesterdayEnergy <= 3) return "Low energy lately, be gentle with yourself 💚"
  if (yesterdayMood !== null && yesterdayMood >= 8) return "You were glowing yesterday. Let's keep it going ✨"
  if (points >= 50) return `${points} points and counting. Treating yourself lately? ⭐`
  if (points >= 20) return "You've been putting in the work 🌟"
  if (hour < 9) return "Early bird mode activated 🌅"
  if (hour < 11) return "Morning! Let's make it a good one ☀️"
  if (hour < 17) return "Afternoon check-in. How's it going? 🌿"
  if (hour < 21) return "Evening wind-down. You made it 🌙"

  const fallbacks = [
    "Hey, you showed up 🌿",
    "One step at a time 💚",
    "You're doing better than you think ✨",
    "Small wins count too ⭐",
    "Just being here is enough 🌱",
  ]
  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

function App() {
  const [activeTab, setActiveTab] = useState("home")
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true"
  })
  const [onboarded, setOnboarded] = useState(() => {
    return localStorage.getItem("onboardingComplete") === "true"
  })

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode)
    document.body.classList.toggle("dark", darkMode)
  }, [darkMode])

  if (!onboarded) {
    return (
      <div className={`app ${darkMode ? "dark" : ""}`}>
        <Onboarding onComplete={() => setOnboarded(true)} />
      </div>
    )
  }

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <header className="app-header">
        <h1>{getDynamicGreeting()}</h1>
        <p className="app-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      <nav className="app-nav">
        <button className={`nav-btn ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}><HomeIcon size={20} /></button>
        <button className={`nav-btn ${activeTab === "meds" ? "active" : ""}`} onClick={() => setActiveTab("meds")}><Heart size={20} /></button>
        <button className={`nav-btn ${activeTab === "cleaning" ? "active" : ""}`} onClick={() => setActiveTab("cleaning")}><Sparkles size={20} /></button>
        <button className={`nav-btn ${activeTab === "journal" ? "active" : ""}`} onClick={() => setActiveTab("journal")}><BarChart2 size={20} /></button>
        <button className={`nav-btn ${activeTab === "points" ? "active" : ""}`} onClick={() => setActiveTab("points")}><Star size={20} /></button>
        <button className={`nav-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}><SettingsIcon size={20} /></button>
        <button className="nav-btn" onClick={() => setDarkMode(d => !d)}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
      </nav>

      <main className="app-content">
        {activeTab === "home" && <Home setActiveTab={setActiveTab} />}
        {activeTab === "meds" && <Meds />}
        {activeTab === "cleaning" && <Cleaning />}
        {activeTab === "journal" && <Journal />}
        {activeTab === "settings" && <Settings />}
        {activeTab === "weekly" && <Weekly />}
        {activeTab === "points" && <Points />}
      </main>
    </div>
  )
}

export default App