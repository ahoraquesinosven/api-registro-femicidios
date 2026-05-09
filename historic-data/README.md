# Data migrations

This directory contains scripts used to generate the migrations to import historical data from the legacy system into the current database.

```
./convert-tsv data-tsv cases.json
./import-all cases.json API_KEY API_HOST/v1/cases
```
