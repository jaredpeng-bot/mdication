import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Medication from './pages/Medication'
import Record from './pages/Record'
import Checkup from './pages/Checkup'
import Profile from './pages/Profile'
import { useLocalStorage } from './hooks/useLocalStorage'
import { startReminderEngine } from './utils/reminder'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './utils/storage'

function App() {
  const [medications, setMedications] = useLocalStorage(STORAGE_KEYS.medications, [])
  const [medicationLogs, setMedicationLogs] = useLocalStorage(STORAGE_KEYS.medicationLogs, [])
  const [checkups, setCheckups] = useLocalStorage(STORAGE_KEYS.checkups, [])
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS)

  useEffect(() => {
    const stop = startReminderEngine({ medications, medicationLogs, checkups, settings })
    return stop
  }, [medications, medicationLogs, checkups, settings])

  const clearAllData = () => {
    const ok = window.confirm('确定要清除所有本地数据吗？该操作不可恢复。')
    if (!ok) return
    setMedications([])
    setMedicationLogs([])
    setCheckups([])
    setSettings(DEFAULT_SETTINGS)
  }

  return (
    <HashRouter>
      <main className="mx-auto min-h-screen w-full max-w-[480px] bg-appBg px-4 pb-24 pt-5">
        <Routes>
          <Route
            path="/"
            element={
              <Medication
                medications={medications}
                setMedications={setMedications}
                medicationLogs={medicationLogs}
                setMedicationLogs={setMedicationLogs}
              />
            }
          />
          <Route path="/record" element={<Record medications={medications} medicationLogs={medicationLogs} />} />
          <Route
            path="/checkup"
            element={<Checkup checkups={checkups} setCheckups={setCheckups} settings={settings} />}
          />
          <Route
            path="/profile"
            element={<Profile settings={settings} setSettings={setSettings} onClearAll={clearAllData} />}
          />
        </Routes>
      </main>
      <BottomNav />
    </HashRouter>
  )
}

export default App
