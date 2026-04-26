import { Heart, Trash2, UserRound } from 'lucide-react'
import { ensureNotificationPermission, isNotificationSupported } from '../utils/reminder'

function Switch({ checked, onChange, disabled = false }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative h-7 w-12 rounded-full transition ${
        disabled ? 'cursor-not-allowed bg-slate-200' : checked ? 'bg-medicalBlue' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
          checked && !disabled ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  )
}

function Profile({ settings, setSettings, onClearAll }) {
  const notificationSupported = isNotificationSupported()
  const updateSetting = (field, value) => setSettings((prev) => ({ ...prev, [field]: value }))

  const toggleWithPermission = async (field, value) => {
    if (!notificationSupported) return
    if (value) {
      const ok = await ensureNotificationPermission()
      if (!ok) return
    }
    updateSetting(field, value)
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">我的</h1>
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
        请保持页面在浏览器中打开以接收提醒，关闭页面后提醒无法送达
      </div>

      <article className="space-y-4 rounded-xl2 bg-white p-4 shadow-card">
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm text-slate-600">
            <UserRound size={16} />
            昵称
          </span>
          <input
            value={settings.nickname}
            onChange={(e) => updateSetting('nickname', e.target.value)}
            className="input-base"
          />
        </label>

        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">全局用药提醒</span>
            <Switch
              checked={notificationSupported && settings.globalMedicationReminder}
              disabled={!notificationSupported}
              onChange={() =>
                toggleWithPermission('globalMedicationReminder', !settings.globalMedicationReminder)
              }
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {notificationSupported
              ? '开启后，到达服药时间设备将发出声音和弹窗提醒'
              : '当前浏览器不支持提醒'}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">全局复诊提醒</span>
            <Switch
              checked={notificationSupported && settings.globalCheckupReminder}
              disabled={!notificationSupported}
              onChange={() =>
                toggleWithPermission('globalCheckupReminder', !settings.globalCheckupReminder)
              }
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {notificationSupported
              ? '开启后，复诊前一天上午9点设备将发出声音和弹窗提醒'
              : '当前浏览器不支持提醒'}
          </p>
        </div>

        <button
          onClick={onClearAll}
          className="flex w-full items-center justify-center gap-1 rounded-xl bg-red-50 py-2 text-sm text-red-500 transition hover:bg-red-100"
        >
          <Trash2 size={14} />
          清除所有数据
        </button>
      </article>

      <footer className="rounded-xl2 bg-white p-4 text-center text-xs text-slate-500 shadow-card">
        <p>版本 v1.0.0</p>
        <p className="mt-1 flex items-center justify-center gap-1">
          <Heart size={14} className="text-rose-400" />
          愿你按时用药，安心生活。
        </p>
        <p className="mt-2 text-[11px] text-slate-400">请保持页面打开以接收提醒</p>
      </footer>
    </section>
  )
}

export default Profile
