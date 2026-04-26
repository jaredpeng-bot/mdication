import { addDays, differenceInCalendarDays, parseISO } from 'date-fns'
import { Bell, BellOff, Check, Clock3, Pencil, Pill, Trash2 } from 'lucide-react'

function MedicationCard({
  medication,
  logs,
  date,
  onToggleTaken,
  onToggleTimeReminder,
  onEdit,
  onDelete,
}) {
  const startDate = parseISO(medication.startDate)
  const endDate = addDays(startDate, Math.max(Number(medication.durationDays || 1) - 1, 0))
  const remainingDays = Math.max(differenceInCalendarDays(endDate, parseISO(date)) + 1, 0)

  return (
    <article className="rounded-xl2 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Pill size={18} className="text-medicalBlue" />
            {medication.name}
          </p>
          <p className="text-sm text-slate-600">
            {medication.dosage} · 每日{medication.frequency}次
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {remainingDays > 0 ? `剩余 ${remainingDays} 天` : `共 ${medication.durationDays} 天`}
          </p>
          {medication.notes ? <p className="mt-1 text-xs text-slate-400">{medication.notes}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(medication)}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-medicalBlue"
            aria-label="编辑药品"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(medication.id)}
            className="rounded-full p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
            aria-label="删除药品"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {medication.times.map((time) => {
          const log = logs.find(
            (item) =>
              item.medicationId === medication.id && item.date === date && item.time === time,
          )
          const taken = Boolean(log?.taken)
          const reminderEnabled = medication.timeReminders?.[time] ?? true
          return (
            <div key={time} className="flex items-center justify-between rounded-xl bg-slate-50 p-2">
              <button
                onClick={() => onToggleTaken(medication.id, time, !taken)}
                className={`flex items-center gap-2 rounded-full px-2 py-1 transition ${taken ? 'text-medicalGreen' : 'text-slate-500'} hover:scale-105`}
              >
                <span
                  className={`check-bounce flex h-7 w-7 items-center justify-center rounded-full border ${
                    taken
                      ? 'border-medicalGreen bg-medicalGreen text-white'
                      : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {taken ? <Check size={16} /> : <Clock3 size={16} />}
                </span>
                <span className="font-medium">{time}</span>
              </button>
              <button
                onClick={() => onToggleTimeReminder(medication.id, time)}
                className={`rounded-full p-2 transition-colors ${
                  reminderEnabled ? 'text-medicalBlue' : 'text-slate-300'
                }`}
              >
                {reminderEnabled ? <Bell size={18} /> : <BellOff size={18} />}
              </button>
            </div>
          )
        })}
      </div>
    </article>
  )
}

export default MedicationCard
