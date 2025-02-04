FROM node:slim

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 3000

RUN yarn build

RUN yarn clean-path

CMD ["yarn", "start"]
