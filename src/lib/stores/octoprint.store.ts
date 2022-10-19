import { readable } from "svelte/store";

export const octoprint = readable({}, set => {
    const interval = setInterval(async () => {
        const response = await fetch("/octoprint")
        
        if (response.ok) {
            const body = await response.json()
            set(body)
        } else {
            throw new Error('Failed to get OctoPrint status', { cause: response })
        }
    }, 1000)

    return () => clearInterval(interval)
})
