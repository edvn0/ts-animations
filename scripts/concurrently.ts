// scripts/start_dev.ts
async function run(cmd: string[], cwd: string) {
  return await new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  }).spawn().output();
}

await Promise.all([
  run(["deno", "task", "dev:server"], "."),
  run(["deno", "task", "dev:client"], "."),
]);
