FROM node:20

WORKDIR /app

COPY . .
RUN npm install

RUN cp /app/src/graph/schema.graphql /app/dist/graph/schema.graphql

RUN addgroup --system --gid 1001 graphql
RUN adduser --system --uid 1001 graphql
USER graphql

EXPOSE 8080

CMD node /app/dist/index.js