#!/bin/bash

USERNAME=$1
PASSWD=$2
DBPASSWD=$3
DBNAME="$1_default"
ROOTPW="my-secret-pw"
 mysql --user root --password=${ROOTPW} \
    -e "set @dbUser='${USERNAME}'; set @dbName='${DBNAME}'; set @dbPasswd='${DBPASSWD}'; source /sqlInit/create_user.sql ;"
mysql --user ${USERNAME} --password=${DBPASSWD} --database ${DBNAME} < /sqlInit/init.sql
mysql --user ${USERNAME} --password=${DBPASSWD} --database ${DBNAME} < /sqlInit/procs.sql
mysql --user root --password=${ROOTPW} -e "use cairis_user; insert into auth_user(email,password,active) VALUES ('${USERNAME}','${PASSWD}', 1);"
