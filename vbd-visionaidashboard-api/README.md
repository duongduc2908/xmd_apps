# Dockerize Django along with Nginx and Mysql

Docker will make your life a bit easier when it comes to deployment and CI/CD. This method can be used to deploy most stacks with Nginx and Postgres, ie. Flask, django-rest, FastAPI, NodeJS...

## Installation

Your system must have [docker-compose](https://docs.docker.com/compose/install/) to follow along.

```bash
docker-compose up -d --build --force-recreate
```

You would be able to access

[localhost:8008](http://localhost:80/)

## Usage

Setup Database

- docker-compose exec db bash
- mysql -u admin -p customer_analysis < /data/visionai_api_db_initial.sql
- mysql -u admin -p customer_analysis < /data/visionai_db_data.sql
- mysql -u admin -p customer_analysis < /data/2022_02_16_19_19_37-dump.sql
- mysql -u admin -p customer_analysis < /data/2022_02_18_14_55-dump.sql
- mysql -u admin -p customer_analysis < /data/xmd_site_visit_turn_2022_02_25.sql
- mysql -u admin -p customer_analysis < /data/update_database_2022_02_18_dump.sql
- (pass:123456a@)

-

More docker information at [here](https://docs.docker.com/get-started/overview/)

## Contributing

You can do whatever you want with this repo.

# ERROR

from django.utils.encoding import force*str
from django.utils.translation import gettext_lazy as *
