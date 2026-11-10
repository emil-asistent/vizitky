# tomasrous.cz – web 1:1 podle klientova ZIPu v5.6 (public/ = složka web beze změny)
FROM php:8.3-apache
RUN a2enmod rewrite headers deflate remoteip \
 && apt-get update && apt-get install -y --no-install-recommends msmtp-mta ca-certificates && rm -rf /var/lib/apt/lists/*
COPY apache-rous.conf /etc/apache2/conf-enabled/zz-rous.conf
# PHP mail() posílá přes msmtp (konfigurace z proměnných při startu, viz msmtp-start.sh)
RUN printf 'sendmail_path = "/usr/bin/msmtp -t -i"\n' > /usr/local/etc/php/conf.d/zz-msmtp.ini
COPY msmtp-start.sh /usr/local/bin/msmtp-start.sh
COPY public/ /var/www/html/
# HTTPS a www→apex řeší Cloudflare před serverem; klient to v README-pro-IT.txt výslovně povoluje
# („Pokud hosting přesměrovává http→https sám, řádky RewriteCond/RewriteRule v .htaccess odstranit“).
RUN sed -i -E '/^Rewrite(Cond|Rule)/d' /var/www/html/.htaccess \
 && chown -R www-data:www-data /var/www/html
EXPOSE 80
CMD ["/usr/local/bin/msmtp-start.sh"]
