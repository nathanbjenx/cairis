FROM python:2.7-slim
LABEL maintainer="Shamal Faily <sfaily@bournemouth.ac.uk>"
RUN apt-get update 
RUN apt-get install -y python-dev
RUN apt-get install -y build-essential
RUN apt-get install -y mysql-client
RUN apt-get install -y graphviz
RUN apt-get install -y python-pip
RUN apt-get install -y python-numpy
RUN apt-get install -y git
RUN apt-get install -y default-libmysqlclient-dev
RUN apt-get install -y docbook
RUN apt-get install -y python-apt
RUN apt-get install -y dblatex
RUN apt-get install -y texlive-latex-extra
RUN apt-get install -y docbook-utils
RUN apt-get install -y inkscape
RUN apt-get install -y libxml2-dev
RUN apt-get install -y libxslt1-dev 
RUN apt-get install -y apache2
RUN apt-get install -y apache2-dev
RUN apt-get install -y poppler-utils
ENV CAIRIS_SRC=/cairis/cairis
ENV CAIRIS_CFG_DIR=/cairis/
ENV CAIRIS_CFG=cairis.cnf
ENV PYTHONPATH=/cairis
RUN mkdir /images
RUN chown www-data /images
RUN chgrp www-data /images
RUN git clone https://github.com/failys/cairis /cairis
RUN pip install -r /cairis/requirements.txt
RUN pip install -r /cairis/wsgi_requirements.txt
COPY /cairis/cairis.cnf /
COPY /cairis/startServer.sh /
EXPOSE 8000
RUN apt-get remove --purge -y git
RUN apt-get remove --purge -y python-pip
RUN apt-get autoremove -y