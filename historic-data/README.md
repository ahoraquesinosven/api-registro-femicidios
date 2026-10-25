# Data migrations

This directory contains scripts used to generate the migrations to import historical data from the legacy system into the current database.

```
./convert-tsv data-tsv cases.json
./import-all cases.json API_KEY API_HOST/v1/cases  
```

For example `./import-all cases.json  9876 http://localhost:8080/v1/cases`

Once everything is ok, run cases.json in prod

## Verifying a migration

After importing, export the resulting rows for that batch to `<year>_BD_results.json`
(one flattened object per case, with `victim_*`/`aggressor_*` columns) and compare against
the source TSV:

```
./compare-metrics <year>.tsv <year>_BD_results.json
```

Prints row-count/id sanity checks plus side-by-side TSV vs. DB counts for case category,
attempt/investigation flags, province, moment of day, geographic location, victim-aggressor
bond, organized-crime flag, and femicidio-directo-by-weapon — so mismatches surface before
relying on the migrated data.

## Removing local DB
- To see if the volume with the DB exists run `docker volume ls`
- To delete the DB run `docker compose down -v` 
