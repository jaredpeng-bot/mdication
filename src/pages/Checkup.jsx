import { useMemo, useRef, useState } from 'react'
import { CalendarDays, Plus, Stethoscope } from 'lucide-react'
import { ensureNotificationPermission } from '../utils/reminder'
import CheckupItem from '../components/CheckupItem'
import EmptyState from '../components/EmptyState'

const emptyForm = {
  date: '',
  hospital: '',
  notes: '',
}

function Checkup({ checkups, setCheckups, settings }) {
  const [openModal, setOpenModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const dateInputRef = useRef(null)
  const today = new Date()
  const minDate = today.toISOString().slice(0, 10)
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().slice(0, 10)

  const sortedCheckups = useMemo(
    () => [...checkups].sort((a, b) => (a.date > b.date ? 1 : -1)),
    [checkups],
  )

  const submit = async (event) => {
    event.preventDefault()
    if (!form.date) {
      setError('请选择复诊日期')
      return
    }
    setError('')
    if (settings.globalCheckupReminder) {
      await ensureNotificationPermission()
    }
    setCheckups((prev) => [
      ...prev,
      { id: crypto.randomUUID(), date: form.date, hospital: form.hospital.trim(), notes: form.notes.trim() },
    ])
    setForm(emptyForm)
    setOpenModal(false)
  }

  const remove = (id) => setCheckups((prev) => prev.filter((item) => item.id !== id))

  return (
    <section className="relative space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-slate-800">复诊提醒</h1>
      {sortedCheckups.length === 0 ? (
        <EmptyState icon={Stethoscope} title="暂无复诊计划，点击下方按钮添加" description="" />
      ) : (
        <div className="space-y-3">
          {sortedCheckups.map((item) => (
            <CheckupItem key={item.id} checkup={item} onDelete={remove} />
          ))}
        </div>
      )}

      <button
        onClick={() => {
          setError('')
          setOpenModal(true)
        }}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-medicalBlue text-white shadow-card transition hover:scale-105"
      >
        <Plus />
      </button>

      {openModal ? (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/30 p-3 sm:items-center sm:justify-center">
          <form onSubmit={submit} className="w-full max-w-md space-y-3 rounded-3xl bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold text-slate-800">添加复诊</h2>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={form.date}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  onClick={() => dateInputRef.current?.showPicker?.()}
                  className="input-base bg-transparent text-slate-700 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker?.()}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                aria-label="选择日期"
              >
                <CalendarDays size={18} />
              </button>
            </div>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <input
              value={form.hospital}
              onChange={(e) => setForm((prev) => ({ ...prev, hospital: e.target.value }))}
              placeholder="医院 / 科室"
              className="input-base"
            />
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="备注"
              rows="3"
              className="input-base resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setOpenModal(false)
                }}
                className="rounded-xl bg-slate-100 py-2 text-slate-600"
              >
                取消
              </button>
              <button type="submit" className="rounded-xl bg-medicalBlue py-2 text-white">
                确认
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}

export default Checkup
