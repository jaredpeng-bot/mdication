import { Trash2 } from 'lucide-react'
import { format, isAfter, isBefore, isSameDay, parseISO } from 'date-fns'

function CheckupItem({ checkup, onDelete }) {
  const today = new Date()
  const targetDate = parseISO(checkup.date)
  const statusColor = isSameDay(today, targetDate)
    ? 'bg-orange-400'
    : isAfter(targetDate, today)
      ? 'bg-medicalBlue'
      : isBefore(targetDate, today)
        ? 'bg-slate-400'
        : 'bg-medicalBlue'

  return (
    <article className="flex items-start gap-3 rounded-xl2 bg-white p-4 shadow-card">
      <span className={`mt-1 h-3 w-3 rounded-full ${statusColor}`} />
      <div className="flex-1">
        <p className="font-semibold text-slate-800">{format(targetDate, 'yyyy-MM-dd')}</p>
        <p className="text-sm text-slate-600">{checkup.hospital || '未填写医院/科室'}</p>
        {checkup.notes ? <p className="mt-1 text-xs text-slate-500">{checkup.notes}</p> : null}
      </div>
      <button onClick={() => onDelete(checkup.id)} className="text-slate-400 transition hover:text-red-500">
        <Trash2 size={18} />
      </button>
    </article>
  )
}

export default CheckupItem
