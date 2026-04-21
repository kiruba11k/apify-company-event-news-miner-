# Use Apify's official Node.js image
FROM apify/actor-node:18

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm --quiet set progress=false \
 && npm install --omit=dev --omit=optional \
 && echo "Dependencies installed"

# Copy source code
COPY . ./

# Run the actor
CMD ["node", "src/main.js"]
