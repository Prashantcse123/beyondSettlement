FROM node:6-alpine

RUN apk add -U python

# Install git
RUN apk add --no-cache git

ENV NPM_CONFIG_LOGLEVEL warn

# Cache npm install
WORKDIR /tmp
ADD package.json /tmp/package.json
RUN npm install --save
RUN mkdir -p /usr/src/app && cp -a node_modules /usr/src/app/

WORKDIR /usr/src/app/

ADD . /usr/src/app

CMD ["npm", "run", "start:dev"]