FROM node:22.22.1

WORKDIR /workspace

RUN corepack enable && corepack prepare yarn@4.16.0 --activate

# Copy all workspace manifests so yarn can resolve the full dependency tree
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY server/package.json server/package.json
COPY client/package.json client/package.json

RUN yarn install --immutable

COPY . .

CMD ["yarn", "workspace", "client", "dev"]
