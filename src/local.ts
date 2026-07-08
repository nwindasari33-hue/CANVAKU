import { spawn } from "child_process";
import { bot } from "./bot";

const intervals: NodeJS.Timeout[] = [];

function runScript(script: string) {
    const child = spawn("npm", ["run", script], { stdio: "inherit", shell: true });
    child.on("exit", (code) => {
        if (code && code !== 0) {
            console.error(`Script ${script} exited with code ${code}`);
        }
    });
}

async function main() {
    await bot.start();
    runScript("update-code");
    runScript("process-queue");
    runScript("auto-kick");
    intervals.push(setInterval(() => runScript("update-code"), 3 * 60 * 60 * 1000));
    intervals.push(setInterval(() => runScript("process-queue"), 5 * 60 * 1000));
    intervals.push(setInterval(() => runScript("auto-kick"), 30 * 60 * 1000));
    console.log("Local mode started: polling + invite/kick + update code jobs active.");
}

process.on("SIGINT", () => {
    intervals.forEach(clearInterval);
    bot.stop();
    process.exit(0);
});

process.on("SIGTERM", () => {
    intervals.forEach(clearInterval);
    bot.stop();
    process.exit(0);
});

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
