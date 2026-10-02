# Frontend Codabli (Angular 22) — image de production.
# Build multi-stage : compilation Angular puis service des fichiers statiques par nginx.

# --- Étape build ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Étape run ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Angular 22 (application builder) sort le build web dans dist/<projet>/browser.
COPY --from=build /app/dist/codabli-frontend/browser /usr/share/nginx/html
EXPOSE 80
