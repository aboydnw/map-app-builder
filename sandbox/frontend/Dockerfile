FROM node:20-slim

WORKDIR /app

# Dependencies installed at runtime via volume mount + entrypoint.
# The @maptool/core dependency uses "file:../../" which requires the
# full repo to be mounted. Docker Compose handles this via volumes.
COPY package.json package-lock.json ./

EXPOSE 5185

CMD ["sh", "-c", "npm install && npx vite --host"]
