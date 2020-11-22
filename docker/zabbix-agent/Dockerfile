FROM zabbix/zabbix-agent:ubuntu-latest

RUN apt-get update && apt-get -y install fping && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY ./userparam.conf /etc/zabbix/zabbix_agentd.d

COPY files/etc/sudoers.d/zabbix /etc/sudoers.d/zabbix
RUN chmod 400 /etc/sudoers.d/zabbix
