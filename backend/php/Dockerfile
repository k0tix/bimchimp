FROM php:8.3-cli

WORKDIR /app

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

CMD ["php", "-S", "0.0.0.0:80", "-t", "public/"]