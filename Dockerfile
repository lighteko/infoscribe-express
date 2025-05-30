FROM node:slim

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 8000

RUN yarn build

CMD ["yarn", "start"]
