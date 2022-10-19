import type { RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async () => {
    const body = { time: Date.now() }
    return new Response(JSON.stringify(body))
}
