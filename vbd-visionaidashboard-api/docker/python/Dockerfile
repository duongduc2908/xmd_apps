FROM python:3.8.12

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /var/www/html

RUN mkdir requirements

RUN pip install --upgrade pip

COPY requirements/base.txt ./requirements

RUN pip install -r requirements/base.txt