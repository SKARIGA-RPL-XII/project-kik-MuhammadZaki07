FROM shinsenter/laravel:php8.3

ENV WEBROOT /var/www/html/public

COPY . /var/www/html

ENV COMPOSER_IGNORE_PLATFORM_REQS=1

RUN chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80