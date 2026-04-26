import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Plus, Syringe } from 'lucide-react'
import AddMedicationModal from '../components/AddMedicationModal'
import EmptyState from '../components/EmptyState'
import MedicationCard from '../components/MedicationCard'
import { ensureNotificationPermission } from '../utils/reminder'
import { isMedicationActiveToday, todayStr } from '../utils/storage'

function Medication({ medications, setMedications, medicationLogs, setMedicationLogs }) {
  const [showModal, setShowModal] = useState(false)
  const [editingMedication, setEditingMedication] = useState(null)
  const [modalKey, setModalKey] = useState(0)
  const [addedToastVisible, setAddedToastVisible] = useState(false)
  const today = todayStr()
  const todayMedications = useMemo(
    () => medications.filter((medication) => isMedicationActiveToday(medication)),
    [medications],
  )

  const saveMedication = async (item) => {
    if (item.reminderEnabled) {
      await ensureNotificationPermission()
    }
    setMedications((prev) => {
      const exists = prev.some((medication) => medication.id === item.id)
      if (!exists) return [...prev, item]
      return prev.map((medication) => (medication.id === item.id ? { ...medication, ...item } : medication))
    })
    setShowModal(false)
    setEditingMedication(null)
    setAddedToastVisible(true)
    window.setTimeout(() => setAddedToastVisible(false), 2000)
  }

  const deleteMedication = (medicationId) => {
    const ok = window.confirm('确定删除该药品及其所有用药记录吗？')
    if (!ok) return
    setMedications((prev) => prev.filter((item) => item.id !== medicationId))
    setMedicationLogs((prev) => prev.filter((log) => log.medicationId !== medicationId))
  }

  const toggleTaken = (medicationId, time, taken) => {
    setMedicationLogs((prev) => {
      const existingIndex = prev.findIndex(
        (log) => log.medicationId === medicationId && log.date === today && log.time === time,
      )
      if (existingIndex >= 0) {
        const next = [...prev]
        next[existingIndex] = { ...next[existingIndex], taken }
        return next
      }
      return [...prev, { medicationId, date: today, time, taken }]
    })
  }

  const toggleTimeReminder = async (medicationId, time) => {
    const ok = await ensureNotificationPermission()
    if (!ok) return
    setMedications((prev) =>
      prev.map((medication) => {
        if (medication.id !== medicationId) return medication
        const currentValue = medication.timeReminders?.[time] ?? true
        return {
          ...medication,
          timeReminders: { ...medication.timeReminders, [time]: !currentValue },
        }
      }),
    )
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">今日用药计划</h1>
          <p className="text-sm text-slate-500">{format(new Date(), 'yyyy年MM月dd日')}</p>
        </div>
        <button
          onClick={() => {
            setEditingMedication(null)
            setModalKey((prev) => prev + 1)
            setShowModal(true)
          }}
          className="flex items-center gap-1 rounded-full bg-medicalBlue px-3 py-2 text-sm text-white transition hover:scale-105"
        >
          <Plus size={16} />
          添加药品
        </button>
      </header>

      {todayMedications.length === 0 ? (
        <EmptyState
          icon={Syringe}
          title="今天还没有用药计划"
          description="点击添加，建立你的每日服药安排"
          action={
            <button
              onClick={() => {
                setEditingMedication(null)
                setModalKey((prev) => prev + 1)
                setShowModal(true)
              }}
              className="rounded-xl bg-medicalBlue px-4 py-2 text-sm text-white"
            >
              + 添加药品
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {todayMedications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              logs={medicationLogs}
              date={today}
              onToggleTaken={toggleTaken}
              onToggleTimeReminder={toggleTimeReminder}
              onEdit={(medication) => {
                setEditingMedication(medication)
                setModalKey((prev) => prev + 1)
                setShowModal(true)
              }}
              onDelete={deleteMedication}
            />
          ))}
        </div>
      )}

      <AddMedicationModal
        key={modalKey}
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingMedication(null)
        }}
        onSave={saveMedication}
        mode={editingMedication ? 'edit' : 'create'}
        initialMedication={editingMedication}
      />
      {addedToastVisible ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-medicalGreen px-3 py-1 text-sm text-white shadow-card">
          已添加
        </div>
      ) : null}
    </section>
  )
}

export default Medication
