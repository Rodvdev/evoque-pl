import { cookies } from 'next/headers'

import type { User } from '../payload-types'
import { getServerSideURL } from './getURL'

export const getUserAuth = async (): Promise<{
  user: User | null
  isAuthenticated: boolean
}> => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return {
        user: null,
        isAuthenticated: false,
      }
    }

    const meUserReq = await fetch(`${getServerSideURL()}/api/users/me`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
      cache: 'no-store',
    })

    if (!meUserReq.ok) {
      return {
        user: null,
        isAuthenticated: false,
      }
    }

    const { user }: { user: User } = await meUserReq.json()

    return {
      user: user || null,
      isAuthenticated: Boolean(user),
    }
  } catch (error) {
    return {
      user: null,
      isAuthenticated: false,
    }
  }
}

