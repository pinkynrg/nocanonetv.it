import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export interface SubscribeResponse {
  ok: boolean
  message: string
}

export interface ReminderContext {
  subscriber_name: string
  year: number
  subscriber_status: string
  already_responded: boolean
  response: string | null
  deadline_note: string
  official_url: string
}

export type ReminderAnswer = 'still_eligible' | 'now_has_tv'

export interface RespondResponse {
  response: string
  subscriber_status: string
  official_url: string | null
  message: string
}

export interface UnsubscribeContext {
  email: string
  status: string
}

export interface UnsubscribeResponse {
  ok: boolean
  message: string
}

export const subscribe = (name: string, email: string, cases: string[]) =>
  api
    .post<SubscribeResponse>('/subscribe', { name, email, cases })
    .then((r) => r.data)

export const getReminder = (token: string) =>
  api.get<ReminderContext>(`/reminder/${token}`).then((r) => r.data)

export const respondReminder = (token: string, response: ReminderAnswer) =>
  api
    .post<RespondResponse>(`/reminder/${token}/respond`, { response })
    .then((r) => r.data)

export const getUnsubscribe = (token: string) =>
  api.get<UnsubscribeContext>(`/unsubscribe/${token}`).then((r) => r.data)

export const unsubscribe = (token: string) =>
  api.post<UnsubscribeResponse>(`/unsubscribe/${token}`).then((r) => r.data)

/** Estrae un messaggio d'errore leggibile da una risposta axios. */
export const errorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
  }
  return fallback
}
