# Data migrations

This directory contains scripts used to generate the migrations to import historical data from the legacy system into the current database.

```
./convert-tsv data-tsv cases.json
./import-all cases.json API_KEY API_HOST/v1/cases  
```

For example `./import-all cases.json  9876 http://localhost:8080/v1/cases`


## Removing local DB
- To see if the volume with the DB exists run `docker volume ls`
- To delete the DB run `docker compose down -v` 
