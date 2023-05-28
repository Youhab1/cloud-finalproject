# Use the Node.js base image
FROM node

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Install the cors module
RUN npm install cors

# Copy the rest of the application code to the container
COPY . .

# Expose the port your backend server is listening on
EXPOSE 3700

# Start the backend server
CMD ["npm", "start"]
