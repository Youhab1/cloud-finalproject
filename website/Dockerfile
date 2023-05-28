# Use the official Nginx image as the base
FROM nginx:latest

# Copy your HTML files to the container
COPY .. /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 4000
EXPOSE 4000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
