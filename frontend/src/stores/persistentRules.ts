import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import { uid, todayKey } from '@/composables/useDate'
import { useAgendaStore } from './agenda'
import type { PersistentRule, RuleSchedule } from '@/types'

function toNextWorkingDay(d: Date): void {
  const dow = d.getDay()
  if (dow === 0) d.setDate(d.getDate() + 1)  // domingo → lunes
  if (dow === 6) d.setDate(d.getDate() + 2)  // sábado → lunes
}

function calcNextTrigger(schedule: RuleSchedule, from: string): string {
  if (schedule.type === 'once') return '9999-12-31'
  const d = new Date(from + 'T12:00:00')
  const n = schedule.interval || 1
  switch (schedule.type) {
    case 'daily':
      d.setDate(d.getDate() + n)
      break
    case 'weekly':
      d.setDate(d.getDate() + 7 * n)
      break
    case 'monthly': {
      d.setDate(1)
      d.setMonth(d.getMonth() + n)
      const target = schedule.dayOfMonth ?? 1
      const max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      d.setDate(Math.min(target, max))
      break
    }
    case 'yearly': {
      d.setDate(1)
      d.setFullYear(d.getFullYear() + n)
      if (schedule.month) d.setMonth(schedule.month - 1)
      const target = schedule.dayOfMonth ?? 1
      const max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      d.setDate(Math.min(target, max))
      break
    }
  }
  if (schedule.workingDay) toNextWorkingDay(d)
  return d.toISOString().slice(0, 10)
}

export function calcFirstTrigger(schedule: RuleSchedule, aiDate = ''): string {
  if (schedule.type === 'once') return aiDate  // confiar en la fecha que da la IA
  const today = todayKey()
  const d = new Date(today + 'T12:00:00')
  const n = schedule.interval || 1

  switch (schedule.type) {
    case 'monthly': {
      d.setDate(1)
      d.setMonth(d.getMonth() - n)
      const target = schedule.dayOfMonth ?? 1
      const max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      d.setDate(Math.min(target, max))
      break
    }
    case 'weekly':
      d.setDate(d.getDate() - 7 * n)
      break
    case 'yearly': {
      d.setFullYear(d.getFullYear() - n)
      if (schedule.month) d.setMonth(schedule.month - 1)
      const target = schedule.dayOfMonth ?? 1
      const max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      d.setDate(Math.min(target, max))
      break
    }
    case 'daily':
      d.setDate(d.getDate() - n)
      break
  }

  const from = d.toISOString().slice(0, 10)
  let candidate = calcNextTrigger(schedule, from)
  if (candidate < today) candidate = calcNextTrigger(schedule, candidate)
  return candidate
}

export const usePersistentRulesStore = defineStore('persistentRules', () => {
  const rules = ref<PersistentRule[]>([])

  async function load() {
    const r = await api.storage.get('rules-v1')
    if (r.value) rules.value = JSON.parse(r.value) as PersistentRule[]
  }

  async function save() {
    await api.storage.set('rules-v1', rules.value)
  }

  async function addRule(rule: PersistentRule) {
    rules.value.unshift(rule)
    await save()
  }

  async function removeRule(id: string) {
    rules.value = rules.value.filter(r => r.id !== id)
    await save()
  }

  async function checkAndFire() {
    const today = todayKey()
    const agenda = useAgendaStore()
    let agendaChanged = false
    let rulesChanged  = false
    const toRemove: string[] = []

    for (const rule of rules.value) {

      // ── Regla de un solo disparo ──────────────────────────────────────────
      if (rule.schedule.type === 'once') {
        if (rule.nextTrigger <= today) {
          const exists = agenda.data[rule.nextTrigger]?.tareas?.some(i => i.ruleId === rule.id)
          if (!exists) {
            agenda.addRuleTask(rule.nextTrigger, {
              id: uid(), texto: rule.taskText, done: false, avisos: [], ruleId: rule.id,
            })
            agendaChanged = true
          }
          toRemove.push(rule.id)   // eliminar la regla tras disparar
        } else {
          // pre-crear la tarea futura para que sea visible en el calendario
          const exists = agenda.data[rule.nextTrigger]?.tareas?.some(i => i.ruleId === rule.id)
          if (!exists) {
            agenda.addRuleTask(rule.nextTrigger, {
              id: uid(), texto: rule.taskText, done: false, avisos: [], ruleId: rule.id,
            })
            agendaChanged = true
          }
        }
        continue
      }

      // ── Regla recurrente ──────────────────────────────────────────────────
      let current = rule.nextTrigger
      let iters   = 0
      let thisChanged = false

      while (current <= today && iters < 24) {
        iters++
        const alreadyExists = agenda.data[current]?.tareas?.some(item => item.ruleId === rule.id)

        if (!alreadyExists) {
          agenda.addRuleTask(current, {
            id: uid(), texto: rule.taskText, done: false, avisos: [], ruleId: rule.id,
          })
          agendaChanged = true
        }

        rule.lastTriggered = current
        current = calcNextTrigger(rule.schedule, current)
        thisChanged = true
      }

      if (thisChanged) {
        rule.nextTrigger = current
        rulesChanged = true
      }

      // Pre-crear las próximas 12 ocurrencias para que sean visibles en el calendario
      let upcoming = current
      for (let i = 0; i < 12; i++) {
        const alreadyNext = agenda.data[upcoming]?.tareas?.some(item => item.ruleId === rule.id)
        if (!alreadyNext) {
          agenda.addRuleTask(upcoming, {
            id: uid(), texto: rule.taskText, done: false, avisos: [], ruleId: rule.id,
          })
          agendaChanged = true
        }
        upcoming = calcNextTrigger(rule.schedule, upcoming)
      }
    }

    if (toRemove.length) {
      rules.value = rules.value.filter(r => !toRemove.includes(r.id))
      rulesChanged = true
    }

    if (agendaChanged) await agenda.save()
    if (rulesChanged)  await save()
  }

  return { rules, load, save, addRule, removeRule, checkAndFire }
})
