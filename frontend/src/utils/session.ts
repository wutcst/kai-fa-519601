const PLAYER_ID_KEY = 'playerId'

export function getStoredPlayerId() {
  const raw = localStorage.getItem(PLAYER_ID_KEY)
  if (!raw) return null

  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function setStoredPlayerId(playerId: number) {
  localStorage.setItem(PLAYER_ID_KEY, String(playerId))
}

export function clearStoredPlayerId() {
  localStorage.removeItem(PLAYER_ID_KEY)
}
