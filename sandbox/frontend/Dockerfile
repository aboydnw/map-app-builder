FROM node:20-slim

WORKDIR /app

# Copy the library source (needed for @maptool/core file: dep)
COPY package.json /app/maptool-core/package.json
COPY src/ /app/maptool-core/src/
COPY dist/ /app/maptool-core/dist/

# Copy frontend package files and rewrite the @maptool/core reference
COPY sandbox/frontend/package.json sandbox/frontend/package-lock.json /app/frontend/

WORKDIR /app/frontend

RUN sed -i 's|"file:../../"|"file:../maptool-core"|' package.json
RUN npm install

# Copy remaining frontend source, excluding package.json to preserve sed'd version
COPY sandbox/frontend/src/ /app/frontend/src/
COPY sandbox/frontend/index.html /app/frontend/index.html
COPY sandbox/frontend/vite.config.ts /app/frontend/vite.config.ts
COPY sandbox/frontend/tsconfig.json /app/frontend/
COPY sandbox/frontend/public/ /app/frontend/public/

EXPOSE 5185

CMD ["npx", "vite", "--host"]
