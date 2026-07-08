/**
 * Cloudflare Worker Cron Script for Canva Bot
 * Automatically triggers Github Actions workflows via repository_dispatch.
 */

export interface Env {
    GITHUB_PAT: string;
    GITHUB_OWNER: string;
    GITHUB_REPO: string;
}

export default {
    // Also allow manual triggers via HTTP for testing
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const eventType = url.searchParams.get("event") || "process_queue";

        if (!env.GITHUB_PAT || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
            return new Response("Missing GitHub Secrets configuration.", { status: 500 });
        }

        try {
            const res = await triggerGithubAction(env, eventType);
            return new Response(`Triggered ${eventType}: ${res.status} ${res.statusText}`);
        } catch (e: any) {
            return new Response(`Error: ${e.message}`, { status: 500 });
        }
    },

    // Scheduled Cron Trigger Handler
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
        if (!env.GITHUB_PAT || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
            console.error("Missing GitHub Secrets in Cloudflare Worker environment.");
            return;
        }

        const cron = event.cron;
        console.log(`Cron triggered: ${cron}`);

        let eventType = "process_queue"; // Default for */10 * * * *

        if (cron === "*/30 * * * *") {
            eventType = "manual_sync";
        } else if (cron === "30 2 * * *") {
            eventType = "refresh-sessions";
        }

        try {
            console.log(`Triggering GitHub Action: ${eventType}`);
            const res = await triggerGithubAction(env, eventType);
            if (!res.ok) {
                const text = await res.text();
                console.error(`Failed to trigger ${eventType}. Status: ${res.status}. Response: ${text}`);
            } else {
                console.log(`Successfully triggered ${eventType}`);
            }
        } catch (e) {
            console.error(`Fetch error triggering ${eventType}:`, e);
        }
    },
};

/**
 * Sends a repository_dispatch event to GitHub API
 */
async function triggerGithubAction(env: Env, eventType: string): Promise<Response> {
    const apiUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/dispatches`;

    return await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": `Bearer ${env.GITHUB_PAT}`,
            "User-Agent": "Cloudflare-Worker-Cron-Bot",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            event_type: eventType,
        }),
    });
}
