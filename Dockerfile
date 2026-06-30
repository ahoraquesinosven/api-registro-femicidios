################################################################################
# Base dependencies
################################################################################
FROM node:20 AS dependencies

# Setup the project directory
RUN mkdir -p /opt/project
WORKDIR /opt/project

# Force environment to production
ENV NODE_ENV=production

# Setup application dependencies
COPY package*.json /opt/project/
RUN npm --unsafe-perm install --only production --loglevel verbose

# Setup the application code
COPY src /opt/project/src
COPY knexfile.mjs /opt/project
COPY migrations /opt/project/migrations

################################################################################
# Development environment
################################################################################
FROM dependencies AS development

# Identity of the developer running the container, supplied by compose from
# .env (HOST_UID/HOST_GID). Used to hand node_modules and npm's home/cache to
# that user so `docker compose run dev npm i ...` works without root.
ARG HOST_UID=1000
ARG HOST_GID=1000

# Overwrite environment to development
ENV NODE_ENV=development
ENV PATH=./node_modules/.bin:$PATH
# Pin npm's home (cache, .npmrc) to a known, writable path regardless of the
# runtime UID, since the container runs as a numeric user with no passwd entry.
ENV HOME=/home/node

# Default command
CMD ["npm", "run", "start:dev"]

# Setup development dependencies, then give node_modules and npm's home to the
# dev user. Done in one layer so node_modules isn't duplicated by the chown.
# The node_modules named volume is seeded from this image, so it inherits the
# ownership too.
RUN npm --unsafe-perm install --only development --loglevel verbose \
  && chown -R ${HOST_UID}:${HOST_GID} /opt/project/node_modules /home/node

################################################################################
# Productive environment
################################################################################
FROM dependencies AS production

# Default command
CMD ["npm", "run", "start:prod"]
