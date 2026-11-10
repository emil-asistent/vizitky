#!/bin/sh
# Při startu kontejneru zapíše /etc/msmtprc z proměnných Coolify (heslo není v gitu).
# PHP mail() → msmtp → náš mailcow (mail.gomatela.cz:465) jako info@tomasrous.cz → brána VPS (SPF) + DKIM mailcow.
set -e
cat > /etc/msmtprc <<CONF
defaults
auth on
tls on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
syslog off
logfile /proc/self/fd/2

account rous
host ${SMTP_HOST:-mail.gomatela.cz}
port ${SMTP_PORT:-465}
tls_starttls off
user ${SMTP_USER:-info@tomasrous.cz}
password ${SMTP_PASS}
from info@tomasrous.cz
allow_from_override on
set_from_header off

account default : rous
CONF
chown www-data:www-data /etc/msmtprc
chmod 600 /etc/msmtprc
exec apache2-foreground
