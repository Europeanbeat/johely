FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY en/index.html /usr/share/nginx/html/en/index.html
EXPOSE 80
