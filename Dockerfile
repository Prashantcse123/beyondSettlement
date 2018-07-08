FROM node:10

RUN apt-get update && apt-get install -y git autoconf python

# Cache npm install for api, development only
# WORKDIR /tmp
# ADD package.json /tmp/package.json
# RUN npm install
# RUN mkdir -p /usr/src/app && cp -a node_modules /usr/src/app/

# Cache npm install for ui, development only
# WORKDIR /tmp/ui
# ADD ui/package.json /tmp/ui/package.json
# RUN npm install
# RUN mkdir -p /usr/src/app/ui && cp -a node_modules /usr/src/app/ui/

WORKDIR /usr/src/app/

ADD . /usr/src/app

# Install packages - api
RUN npm install

# Install packages and build - front end
RUN cd ui && npm install && npm run build

# COPY entrypoint.sh /entrypoint.sh
# RUN chmod u+x /entrypoint.sh
# ENTRYPOINT [ "/entrypoint.sh" ]

# Actual script to start can be overridden from `docker run`
CMD ["npm", "start"]
