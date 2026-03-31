# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN if [ ! -f index.html ]; then echo "CRITICAL ERROR: index.html not found in /app" && ls -la && exit 1; fi
RUN ls -R src
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
