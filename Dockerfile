# Base image, set user/group and workdir
FROM node:20.11.0-buster AS base

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN apt update && \
    apt install -y netcat dnsutils


# Production image, copy all the files and run next
FROM base AS web

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app

# Set the correct permission for prerender cache
RUN chown -R nextjs:nodejs .

RUN mkdir .next
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY scripts ./scripts
COPY prisma ./prisma
COPY public ./public


USER nextjs

RUN npm install sharp @prisma/client -S && \
    npx prisma generate
    
EXPOSE 3000
CMD ["/bin/sh", "-c","./scripts/bootstrap.sh"]



FROM base AS worker

WORKDIR /app
COPY . .
RUN npm config set registry https://registry.npmmirror.com && npm install
RUN chown -R nextjs:nodejs .
USER nextjs
CMD ["/bin/sh", "-c","./scripts/bootstrap.worker.sh"]