
'use client'

import { useEffect, useRef } from 'react'
import { signout } from '@/app/login/actions'
import { useRouter } from 'next/navigation'

// 5 minutes in milliseconds
const INACTIVITY_LIMIT = 5 * 60 * 1000
const CHECK_INTERVAL = 1000 * 10 // Check every 10 seconds

export function AutoLogout() {
    const router = useRouter()

    useEffect(() => {
        // Initialize last activity
        const updateActivity = () => {
            localStorage.setItem('lastActivity', Date.now().toString())
        }

        // Check activity loop
        const checkInactivity = async () => {
            const lastActivity = parseInt(localStorage.getItem('lastActivity') || Date.now().toString())
            const now = Date.now()

            if (now - lastActivity > INACTIVITY_LIMIT) {
                await signout()
            }
        }

        // Set initial activity
        if (!localStorage.getItem('lastActivity')) {
            updateActivity()
        }

        // Listeners
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

        // Throttled updater to avoid too many writes
        let throttleTimer: NodeJS.Timeout | null = null
        const handleActivity = () => {
            if (!throttleTimer) {
                updateActivity()
                throttleTimer = setTimeout(() => {
                    throttleTimer = null
                }, 1000)
            }
        }

        events.forEach(event => window.addEventListener(event, handleActivity))

        // Polling interval
        const intervalId = setInterval(checkInactivity, CHECK_INTERVAL)

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity))
            clearInterval(intervalId)
            if (throttleTimer) clearTimeout(throttleTimer)
        }
    }, [router])

    return null
}
