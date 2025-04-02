FROM node:20-alpine

WORKDIR /app

# Install OpenSSL
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and env file
COPY . .

# Build application
RUN npm run build
RUN npm run build-orm

# Copy GraphQL schema
RUN cp /app/src/graph/schema.graphql /app/dist/graph/schema.graphql

# Create non-root user
RUN addgroup -S graphql && adduser -S graphql -G graphql
USER graphql

EXPOSE 8080

CMD ["node", "/app/dist/index.js"]