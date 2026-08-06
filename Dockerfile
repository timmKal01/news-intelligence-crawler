FROM apify/actor-node:20

COPY package*.json ./
RUN npm install --include=dev \
    && echo "Installed NPM packages:" \
    && (npm list --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

COPY . ./

RUN npm run build

CMD npm run start:prod --silent
