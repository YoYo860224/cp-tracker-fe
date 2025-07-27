# 使用 Node.js (Alpine 版本) 作為基礎映像
FROM node:22.16.0-alpine AS build

# Install package first
WORKDIR /home/node
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Put Source code
COPY . .
RUN npm run build --prod

# Deploy on nginx
FROM nginx:alpine
COPY --from=build /home/node/dist/cp-tracker/browser /etc/nginx/html/cp-tracker
COPY --from=build /home/node/dist/cp-tracker/3rdpartylicenses.txt /etc/nginx/html/cp-tracker/3rdpartylicenses.txt
COPY --from=build /home/node/nginx-conf/nginx.conf /etc/nginx/nginx.conf
