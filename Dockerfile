FROM node:10

RUN apt-get update && apt-get install -y git autoconf python

# Cache npm install for api
WORKDIR /tmp
ADD package.json /tmp/package.json
RUN npm install
RUN mkdir -p /usr/src/app && cp -a node_modules /usr/src/app/

# Cache npm install for ui
WORKDIR /tmp/ui
ADD ui/package.json /tmp/ui/package.json
RUN npm install
RUN mkdir -p /usr/src/app/ui && cp -a node_modules /usr/src/app/ui/

WORKDIR /usr/src/app/

ADD . /usr/src/app

# Install packages
RUN cd ui && npm run build 

COPY entrypoint.sh /entrypoint.sh

RUN chmod u+x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]

# Actual script to start can be overridden from `docker run`
CMD ["npm", "start"]
