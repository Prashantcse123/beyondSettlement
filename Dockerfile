FROM node:10

RUN apt-get update && apt-get install -y git autoconf python

ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /usr/src/app/

ADD . /usr/src/app

# Install packages
RUN npm install \
    && cd ui \
    && npm install \
    && npm run build 

# Expose ports
EXPOSE 3000

# Actual script to start can be overridden from `docker run`
CMD ["npm", "start"]
