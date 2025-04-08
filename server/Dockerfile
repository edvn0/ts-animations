FROM denoland/deno:latest AS builder
WORKDIR /app
COPY . .
RUN deno install --entrypoint main.ts --lock

FROM denoland/deno:latest
WORKDIR /app
COPY --from=builder /app .

COPY scripts/wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

CMD ["deno", "run", "-ERN", "main.ts"]
