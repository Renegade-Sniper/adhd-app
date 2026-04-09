export function scheduleMedReminders(meds) {
  if (Notification.permission !== "granted") return
  if (localStorage.getItem("notificationsEnabled") !== "true") return

  const now = new Date()
  const today = now.toDateString()
  const alreadyScheduled = localStorage.getItem("remindersScheduled")
  if (alreadyScheduled === today) return

  meds.forEach(med => {
    const [hours, minutes] = med.scheduledTime.split(":").map(Number)
    const reminderTime = new Date()
    reminderTime.setHours(hours, minutes, 0, 0)

    const delay = reminderTime - now
    if (delay > 0) {
      setTimeout(() => {
        if (localStorage.getItem("notificationsEnabled") !== "true") return
        const currentMeds = JSON.parse(localStorage.getItem("meds") || "[]")
        const thisMed = currentMeds.find(m => m.id === med.id)
        if (thisMed && !thisMed.done) {
          new Notification("Hey, you showed up 💊", {
            body: `Time to take ${med.name}`,
            icon: "/favicon.svg",
          })
        }
      }, delay)
    }
  })

  localStorage.setItem("remindersScheduled", today)
}