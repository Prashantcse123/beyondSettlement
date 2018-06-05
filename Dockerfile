FROM node:10

RUN apt-get update && apt-get install -y git autoconf python

ENV NPM_CONFIG_LOGLEVEL warn

# Cache npm install
WORKDIR /tmp
ADD package.json /tmp/package.json
RUN npm install
RUN mkdir -p /usr/src/app && cp -a node_modules /usr/src/app/

WORKDIR /usr/src/app/

ADD . /usr/src/app

# Install packages
RUN cd ui \
    && npm install \
    && npm run build 

COPY entrypoint.sh /entrypoint.sh

RUN chmod u+x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]

# Actual script to start can be overridden from `docker run`
CMD ["npm", "start"]
