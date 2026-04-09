import { useState } from "react"
import "./App.css"
import Home from "./Home"
import Meds from "./Meds"
import Cleaning from "./Cleaning"
import Journal from "./Journal"
import Settings from "./Settings"
import Weekly from "./Weekly"
import Points from "./Points"

function App() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hey, you showed up</h1>
        <p className="app-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

     <nav className="app-nav">
  <button className={`nav-btn ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}>🏠 Home</button>
  <button className={`nav-btn ${activeTab === "meds" ? "active" : ""}`} onClick={() => setActiveTab("meds")}>💊 Meds</button>
  <button className={`nav-btn ${activeTab === "cleaning" ? "active" : ""}`} onClick={() => setActiveTab("cleaning")}>🧹 Clean</button>
  <button className={`nav-btn ${activeTab === "journal" ? "active" : ""}`} onClick={() => setActiveTab("journal")}>📓 Journal</button>
  <button className={`nav-btn ${activeTab === "points" ? "active" : ""}`} onClick={() => setActiveTab("points")}>⭐ Points</button>
  <button className={`nav-btn ${activeTab === "weekly" ? "active" : ""}`} onClick={() => setActiveTab("weekly")}>📊 Weekly</button>
  <button className={`nav-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>⚙️ Settings</button>
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