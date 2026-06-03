import { clearStoredPlayerId, getStoredPlayerId } from '@/utils/session'
import { getMessage, getPayload, isSuccess, playerApi, type PlayerProfile } from '@/api'

export interface CurrentPlayerLoadResult {
  invalidSession: boolean
  message: string | null
  profile: PlayerProfile | null
}

export async function loadStoredPlayerProfile(): Promise<CurrentPlayerLoadResult> {
  const playerId = getStoredPlayerId()
  if (!playerId) {
    return {
      invalidSession: false,
      message: null,
      profile: null,
    }
  }

  try {
    const response = await playerApi.getInfo(playerId)
    if (!isSuccess(response)) {
      const invalidSession = response.data.code === 401 || response.data.code === 404
      if (invalidSession) {
        clearStoredPlayerId()
      }

      return {
        invalidSession,
        message: getMessage(response, 'Failed to load player profile'),
        profile: null,
      }
    }

    return {
      invalidSession: false,
      message: null,
      profile: getPayload(response),
    }
  } catch {
    return {
      invalidSession: false,
      message: 'Failed to load player profile, please try again later',
      profile: null,
    }
  }
}
