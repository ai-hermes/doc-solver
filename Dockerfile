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
RUN mkdir .next
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY node_modules/bee-queue/lib/lua/*.lua  .next/standalone/node_modules/bee-queue/lib/lua/
COPY scripts ./scripts
COPY prisma ./prisma
COPY public ./public
RUN npm install sharp @prisma/client -S && \
    npx prisma generate

RUN chown -R nextjs:nodejs .

USER nextjs


    
EXPOSE 3000
CMD ["/bin/sh", "-c","./scripts/bootstrap.sh"]



FROM base AS worker

WORKDIR /app
COPY . .
RUN npm install && \ 
    mkdir -p /app/tmp/pdf && \
    chown -R nextjs:nodejs .
USER nextjs
CMD ["/bin/sh", "-c","./scripts/bootstrap.worker.sh"]
