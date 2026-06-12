FROM node:22.22.1

WORKDIR /workspace

RUN corepack enable && corepack prepare yarn@4.16.0 --activate

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

RUN yarn install

COPY . .

WORKDIR /workspace/server

CMD ["yarn", "dev"]