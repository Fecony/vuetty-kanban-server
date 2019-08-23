# Vuetty Kanban Server

[![Build Status](https://travis-ci.com/Fecony/vuetty-kanban-server.svg?token=KquVGmQ9CBMhcoabSNv9&branch=master)](https://travis-ci.com/Fecony/)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)

REST/GraphQL Backend server, used for kanban web app, built with ❤️using NestJS.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

A step by step series of examples that tell you how to get a development env running

> Copy project to local machine

```
git clone git@github.com:Fecony/vuetty-kanban-server.git
```

> Move to project directory and Install dependencies

```
cd vuetty-kanban-server
npm install
```

> Create .env file and add all variables needed. Or take a look to .env.example file

```
PORT = [PORT]
MONGO_URL = [MONGODB_URL]
MONGO_URL_TEST = [MONGODB_TEST_URL]
JWT_SECRET = [JWT_SECRET]
```

> Start server

```
npm run start:dev
```

## Running the tests

```
npm run start:test      -   Start server in testing env
npm run test            -   Unit Tests
npm run test:e2e        -   e2e Tests
```

## Deployment

Application is deployed on Heroku. In Order to add/update environment variables go to Project dashboard.
Automatically deploys from [master](/Fecony/vuetty_kanban_server/tree/master) branch

## Built With

- [Nest](https://docs.nestjs.com/) - A progressive Node.js web framework

## Authors

- **Ricards Tagils** - _Development_ - [Fecony](https://github.com/Fecony)

## License

> TODO
