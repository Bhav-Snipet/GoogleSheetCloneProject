# Use official Nginx image
FROM nginx:latest

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy your static project files to Nginx public folder
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80
