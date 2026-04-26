import { format } from 'date-fns'
import { isMedicationActiveToday, todayStr } from './storage'

const sentReminderCache = new Set()

export function isNotificationSupported() {
  return 'Notification' in window
}

function canRequestNotificationInCurrentContext() {
  const isHttps = window.location.protocol === 'https:'
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1'
  return isHttps || isLocalhost
}

export async function ensureNotificationPermission() {
  if (!isNotificationSupported()) {
    alert('当前浏览器不支持通知提醒')
    return false
  }
  if (!canRequestNotificationInCurrentContext()) {
    alert('当前页面需在 HTTPS 或 localhost 环境下才能开启提醒')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }
  if (Notification.permission === 'denied') {
    alert('通知权限已被拒绝，请到浏览器设置中开启通知权限后重试')
    return false
  }

  const permission = await Notification.requestPermission()
  if (permission === 'granted') return true
  if (permission === 'denied') {
    alert('通知权限已被拒绝，请到浏览器设置中开启通知权限后重试')
  }
  return false
}

function notify(title, body, key) {
  if (sentReminderCache.has(key)) return
  sentReminderCache.add(key)
  new Notification(title, { body })
}

function shouldNotifyNow(time) {
  const now = format(new Date(), 'HH:mm')
  return now === time
}

export function startReminderEngine({ medications, medicationLogs, checkups, settings }) {
  const tick = () => {
    if (Notification.permission !== 'granted') return
    const currentDate = todayStr()

    if (settings.globalMedicationReminder) {
      medications
        .filter((medication) => medication.reminderEnabled && isMedicationActiveToday(medication))
        .forEach((medication) => {
          medication.times.forEach((time) => {
            const slotEnabled = medication.timeReminders?.[time] ?? true
            if (!slotEnabled || !shouldNotifyNow(time)) return

            const hasTaken = medicationLogs.some(
              (log) =>
                log.medicationId === medication.id &&
                log.date === currentDate &&
                log.time === time &&
                log.taken,
            )
            if (!hasTaken) {
              notify(
                '该服药啦',
                `${medication.name} - ${medication.dosage}，请按时服用`,
                `med-${medication.id}-${currentDate}-${time}`,
              )
            }
          })
        })
    }

    if (settings.globalCheckupReminder) {
      checkups.forEach((checkup) => {
        const reminderDate = format(new Date(new Date(checkup.date).getTime() - 86400000), 'yyyy-MM-dd')
        if (reminderDate === currentDate && shouldNotifyNow('09:00')) {
          notify(
            '复诊提醒',
            `明天需要复诊：${checkup.hospital || '未填写医院/科室'}`,
            `checkup-${checkup.id}-${currentDate}`,
          )
        }
      })
    }
  }

  tick()
  const timer = window.setInterval(tick, 60000)
  return () => window.clearInterval(timer)
}
