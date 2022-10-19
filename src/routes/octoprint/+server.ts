import { OCTOPRINT_API_KEY, OCTOPRINT_URL } from "$env/static/private"
import { OctoprintApi } from "$lib/server/octoprint-api"
import type { RequestHandler } from "@sveltejs/kit"

const api = new OctoprintApi(OCTOPRINT_API_KEY, OCTOPRINT_URL)

export const GET: RequestHandler = async () => {
    const version = await api.getVersion()
    const status = await api.getStatus()
    const cameras = await api.getCameras()
    const jobInfo = await api.getJobInfo()
    const logs = await api.getLogs()
    return new Response(JSON.stringify({version, status, cameras, jobInfo, logs}))
}
