import { addDays, format, isAfter, isBefore, isSameDay, parseISO } from 'date-fns'

export const STORAGE_KEYS = {
  medications: 'medications',
  medicationLogs: 'medicationLogs',
  checkups: 'checkups',
  settings: 'settings',
}

export const DEFAULT_SETTINGS = {
  nickname: '慢病朋友',
  globalMedicationReminder: false,
  globalCheckupReminder: false,
}

export function todayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function isMedicationActiveToday(medication, targetDate = new Date()) {
  const start = parseISO(medication.startDate)
  const end = addDays(start, Math.max(Number(medication.durationDays || 1) - 1, 0))
  return (
    (isSameDay(targetDate, start) || isAfter(targetDate, start)) &&
    (isSameDay(targetDate, end) || isBefore(targetDate, end))
  )
}

export function getLogStatus(logs, medicationId, date, time) {
  return logs.find(
    (log) => log.medicationId === medicationId && log.date === date && log.time === time,
  )
}
