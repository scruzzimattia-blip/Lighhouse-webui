# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY index.html ./
COPY src/ ./src/
COPY public/ ./public/
COPY vite.config.ts .
COPY tsconfig*.json .
RUN ls -la
RUN ls -R src
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
