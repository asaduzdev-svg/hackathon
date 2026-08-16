// Groq AI integration via backend.
// The backend handles the Groq API key; the frontend only POSTs a prompt
// and (optionally) contextual data about the user's shop.
import { api } from './api.js'

/**
 * Ask the AI assistant a question. Returns { text, model }.
 *   context: optional object — e.g. { ordersCount, lowStock, todayRevenue }
 */
export async function askAssistant({ message, context, history = [] }) {
  const res = await api.post('/ai/chat', { message, history })
  return res.data || { answer: '', model: null }
}
