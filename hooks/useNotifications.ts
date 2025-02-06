"use client"

import { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { socketService } from "@/services/socket"
import { notificationService } from "@/services/notification"

export function useNotifications() {
  const { isAuthenticated, username } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated && username) {
      socketService.connect(username)
    }

    return () => {
      socketService.disconnect()
    }
  }, [isAuthenticated, username])

  return {
    showNotification: notificationService.showNotification.bind(notificationService),
  }
}

