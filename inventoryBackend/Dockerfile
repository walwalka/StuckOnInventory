# Stage 1: Dependencies
FROM node:alpine AS dependencies
WORKDIR /app
COPY inventoryBackend/package*.json .
RUN npm install

# Stage 2: Base (code without tests run)
FROM dependencies AS base
WORKDIR /app
COPY inventoryBackend .
COPY ./database ./database

# Stage 3: Production
FROM node:alpine AS production
EXPOSE 5081
WORKDIR /app

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY inventoryBackend/package*.json .

# Copy application code
COPY --from=base /app /app/backend-src
RUN cp -r /app/backend-src/* /app/ && rm -rf /app/backend-src

CMD [ "npm", "start"]
