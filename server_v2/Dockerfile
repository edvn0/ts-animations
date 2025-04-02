FROM denoland/deno:latest AS builder
WORKDIR /app
COPY . .
RUN deno cache main.ts

FROM denoland/deno:latest
WORKDIR /app
COPY --from=builder /app .
CMD ["deno", "run", "-ERN", "main.ts"]
