# Swaptor Backend

## General instructions

- install [Docker](https://docs.docker.com/desktop/install/mac-install/)
- _OPTIONAL_: create .env file and put PORT and DB values if want to be able to deploy on production or staging

## Deploy localhost server

- docker-compose up
- npm run start:dev

## Examples on how to run admin scripts

- npm run set-fee --fee=PUT_FEE_IN_USD_HERE --db-only
- npm run set-free-trial-end-time --free-trial-end-time=PUT_FREE_TRIAL_END_TIME_IN_SECONDS_HERE --contracts-only
