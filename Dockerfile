FROM nginx:latest

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy your project files to Nginx html directory
COPY . /usr/share/nginx/html/

# Expose web port
EXPOSE 80
