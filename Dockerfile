################################################################################
# Base dependencies
################################################################################
FROM node:20 AS dependencies

# Setup the project directory
RUN mkdir -p /opt/project
WORKDIR /opt/project

# Setup default command
CMD ["npm", "start"]

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

# Overwrite environment to development
ENV NODE_ENV=development
ENV PATH=./node_modules/.bin:$PATH

# Setup development dependencies
RUN npm --unsafe-perm install --only development --loglevel verbose

# Setup test code
COPY spec /opt/project/spec

################################################################################
# Productive environment
################################################################################
FROM dependencies AS production

