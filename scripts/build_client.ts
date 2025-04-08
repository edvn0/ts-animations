// scripts/build_client.ts
const result = await new Deno.Command("npx", {
  args: ["vite", "build"],
  cwd: "client",
  stdout: "inherit",
  stderr: "inherit",
}).output();

if (!result.success) {
  throw new Error("Vite build failed");
}
