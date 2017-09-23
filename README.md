# GoDoRP
GoDoRP (Golang, Docker, React, Postgres) project starter.

## Features
* Start a project with one command on any computer with docker-compose installed
* Dev mode features hot reloading on code changes for both the GoLang backend and React frontend (no need to rebuild containers while coding)
* Production mode features optimized static React frontend and binary goLang backend
* Production images built by passing a single arg option (images can then run on any computer with Docker)

## Benefits
* Dev enviroment is the same as production enviroment
* Quickly get your GoDoRP project off the ground
* Forking the repo allows for customization of the template for your prefereances

## Getting started:
* download [docker-compose](https://docs.docker.com/compose/install/) if not already installed
Then run the following commands:

```bash
$ docker-compose up
```
Then you can open the React frontend at localhost:3000 and the RESTful GoLang API at localhost:5000

Changing any frontend (React) code locally will cause a hot-reload in the browser with updates and changing any backend (GoLang) code locally will also automatilly update any changes.

Then to build production images run:
```bash
$ docker build ./api --build-arg app_env=production 
$ docker build ./frontend --build-arg app_env=production
$ docker build ./db
```
