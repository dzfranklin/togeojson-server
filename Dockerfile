FROM --platform=arm64 denoland/deno:1.44.2

EXPOSE 8000
WORKDIR /app

COPY deno.jsonc .
COPY deno.lock .
RUN deno cache deno.jsonc --no-check

COPY . .
RUN deno cache main.ts --no-check

CMD ["run", "--allow-all", "main.ts"]
