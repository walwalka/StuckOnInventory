# Stage 1
FROM node:alpine
EXPOSE 5081
WORKDIR /app
COPY inventoryBackend/package*.json .
RUN npm install
COPY inventoryBackend . 
COPY database ./database
# RUN npm run build
CMD [ "npm", "start"]
