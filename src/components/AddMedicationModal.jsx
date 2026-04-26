import { useState } from 'react'
import { X } from 'lucide-react'

const DEFAULT_TIME = '08:00'
const todayStr = () => new Date().toISOString().slice(0, 10)

const createEmptyForm = () => ({
  name: '',
  dosage: '',
  frequency: 1,
  times: [DEFAULT_TIME],
  startDate: todayStr(),
  durationDays: 30,
  notes: '',
  reminderEnabled: true,
})

const mapMedicationToForm = (medication) => ({
  name: medication.name || '',
  dosage: medication.dosage || '',
  frequency: Number(medication.frequency) || 1,
  times:
    Array.isArray(medication.times) && medication.times.length
      ? medication.times
      : Array.from({ length: Number(medication.frequency) || 1 }, () => DEFAULT_TIME),
  startDate: medication.startDate || todayStr(),
  durationDays: Number(medication.durationDays) || 30,
  notes: medication.notes || '',
  reminderEnabled: medication.reminderEnabled ?? true,
})

function AddMedicationModal({ open, onClose, onSave, mode = 'create', initialMedication = null }) {
  const getInitialForm = () => (initialMedication ? mapMedicationToForm(initialMedication) : createEmptyForm())
  const [form, setForm] = useState(getInitialForm)
  const [frequencyType, setFrequencyType] = useState(() => {
    const frequency = Number(initialMedication?.frequency || 1)
    return [1, 2, 3].includes(frequency) ? String(frequency) : 'custom'
  })
  const [error, setError] = useState('')

  if (!open) return null

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const updateTime = (index, value) => {
    setForm((prev) => {
      const nextTimes = [...prev.times]
      nextTimes[index] = value
      return { ...prev, times: nextTimes }
    })
  }

  const setFrequency = (count) => {
    setForm((prev) => {
      const safeCount = Math.max(1, Number(count) || 1)
      const nextTimes = Array.from({ length: safeCount }).map((_, i) => prev.times[i] || DEFAULT_TIME)
      return { ...prev, frequency: safeCount, times: nextTimes }
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    const hasEmptyTime = form.times.some((time) => !String(time).trim())
    if (!form.name.trim() || hasEmptyTime) {
      setError('药品名称和用法不能为空')
      return
    }

    setError('')
    await onSave({
      ...form,
      id: initialMedication?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      notes: form.notes.trim(),
      frequency: Number(form.frequency),
      durationDays: Number(form.durationDays),
      startDate: initialMedication?.startDate || todayStr(),
      timeReminders: form.times.reduce(
        (acc, time) => ({
          ...acc,
          [time]: initialMedication?.timeReminders?.[time] ?? true,
        }),
        {},
      ),
    })
    setForm(createEmptyForm())
    onClose()
  }

  const title = mode === 'edit' ? '编辑用药计划' : '添加药品'

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/30 p-3 sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          <input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="药品名称"
            className="input-base"
          />
          <input
            value={form.dosage}
            onChange={(e) => updateField('dosage', e.target.value)}
            placeholder="剂量（如：1片）"
            className="input-base"
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="mb-2 text-sm text-slate-700">每日服用次数</p>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setFrequencyType(String(count))
                    setFrequency(count)
                  }}
                  className={`rounded-lg px-3 py-1 text-sm ${
                    frequencyType === String(count) ? 'bg-medicalBlue text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {count} 次
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFrequencyType('custom')}
                className={`rounded-lg px-3 py-1 text-sm ${
                  frequencyType === 'custom' ? 'bg-medicalBlue text-white' : 'bg-white text-slate-700'
                }`}
              >
                自定义
              </button>
            </div>
            {frequencyType === 'custom' ? (
              <input
                type="number"
                min="1"
                max="12"
                value={form.frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="input-base"
              />
            ) : null}
            <p className="text-sm text-slate-700">
              用法：每日<span className="mx-1 font-semibold text-slate-900">{form.frequency}</span>次
            </p>
            <p className="mt-1 text-xs text-slate-400">如每日2次，请在此设置后继续添加具体服药时刻</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">用药天数（天）</label>
            <input
              type="number"
              min="1"
              value={form.durationDays}
              onChange={(e) => updateField('durationDays', e.target.value)}
              className="input-base"
            />
            <p className="text-xs text-slate-400">根据处方设置服用天数，到期后可配合复诊提醒使用</p>
          </div>

          <div className="space-y-2">
            {form.times.map((time, index) => (
              <label key={`${index}`} className="block space-y-1">
                <span className="text-xs text-slate-500">第{index + 1}次服药时间</span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(index, e.target.value)}
                  className="input-base"
                />
              </label>
            ))}
          </div>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">开始用药时间（今天）</span>
            <input type="date" value={form.startDate} readOnly className="input-base bg-slate-50 text-slate-500" />
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="备注（可选）"
            rows="2"
            className="input-base resize-none"
          />

          <label className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
            <span>启用该药品提醒</span>
            <input
              type="checkbox"
              checked={form.reminderEnabled}
              onChange={(e) => updateField('reminderEnabled', e.target.checked)}
            />
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 py-2 text-slate-600">
              取消
            </button>
            <button type="submit" className="rounded-xl bg-medicalBlue py-2 text-white">
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMedicationModal
