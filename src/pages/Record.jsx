import { useMemo, useState } from 'react'
import { Check, Clock3, RefreshCcw, ScrollText } from 'lucide-react'
import EmptyState from '../components/EmptyState'

function Record({ medications, medicationLogs }) {
  const [refreshMark, setRefreshMark] = useState(0)
  const grouped = useMemo(() => {
    const map = {}
    medicationLogs.forEach((log) => {
      if (!map[log.date]) map[log.date] = []
      map[log.date].push(log)
    })
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [medicationLogs, refreshMark])

  const medicationMap = useMemo(
    () => medications.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    [medications],
  )

  if (!grouped.length) {
    return (
      <EmptyState
        icon={ScrollText}
        title="暂无打卡记录"
        description="完成一次用药打卡后，就会在这里看到历史记录"
      />
    )
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">服药记录</h1>
        <button
          onClick={() => setRefreshMark((prev) => prev + 1)}
          className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm text-slate-600 shadow-card transition hover:scale-105"
        >
          <RefreshCcw size={14} />
          刷新
        </button>
      </header>
      {grouped.map(([date, logs]) => (
        <article key={date} className="rounded-xl2 bg-white p-4 shadow-card">
          <p className="mb-3 text-sm font-semibold text-slate-600">{date}</p>
          <div className="space-y-2">
            {logs.map((log) => {
              const med = medicationMap[log.medicationId]
              return (
                <div
                  key={`${log.medicationId}-${log.time}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-700">{med?.name || '已删除药品'}</p>
                    <p className="text-xs text-slate-400">{log.time}</p>
                  </div>
                  <span className={log.taken ? 'text-medicalGreen' : 'text-slate-400'}>
                    {log.taken ? <Check size={18} /> : <Clock3 size={18} />}
                  </span>
                </div>
              )
            })}
          </div>
        </article>
      ))}
    </section>
  )
}

export default Record
