# Stage 1: Build the Vue.js application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# FIX: Add executable permission to the vite script
RUN chmod +x /app/node_modules/.bin/vite

RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
