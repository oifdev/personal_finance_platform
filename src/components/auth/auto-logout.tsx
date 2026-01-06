
'use client'

import { useEffect, useRef } from 'react'
import { signout } from '@/app/login/actions'
import { useRouter } from 'next/navigation'

// 5 minutes in milliseconds
const INACTIVITY_LIMIT = 5 * 60 * 1000

export function AutoLogout() {
    const router = useRouter()
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Function to reset the timer
        const resetTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }

            timerRef.current = setTimeout(async () => {
                // Perform signout
                // We use signout server action directly or redirect. 
                // Using route handler or server action is best to clear cookies.
                await signout()
            }, INACTIVITY_LIMIT)
        }

        // Initial start
        resetTimer()

        // Events to listen for
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer)
        })

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer)
            })
        }
    }, [router])

    return null // This component renders nothing
}
