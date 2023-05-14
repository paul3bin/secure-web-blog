
# Secure Web Blog

A security focused web-based blog created using JavaScipt




## Setting up Environment Variables

Add following environment variables in the process

```bash
  DSS_DB_HOST=<Your database host address>
  DSS_DB_USER=<database username>
  DSS_DB_PASSWORD=<databased password>
  DSS_DB_NAME=<name of the database>
  DSS_DB_PORT=<database port>
  DSS_PORT=<port for backend api by default add 8085>
  DSS_SECRET_KEY=<generate a secrect for encryption>
  DSS_IV=<initialisation vector>
  REDIS_URL=<url for redis>
  SENDGRID_API_KEY=<sendgrid api key>
  SENDGRID_VERIFIED_SENDER=<email address of verified sendgrid user>
```

For `Mac` use following command for setting up env variables in the process

```bash
  export [existing_variable_name]=[new_value]:[existing_variable_name]
```

For `Windows` use following command for setting up env variables in the process

```bash
  set [variable_name]=[variable_value]
```

For `Linux` use following command for setting up env variable in the process

```bash
  env [variable_name]=[variable_value]
```



## Setting up Redis

- Unzip the `redis-latest.zip` folder
- Navigate to `redis-latest` folder

```bash
  cd redis-latest
```

- Double-click on `redis-server` file

- Else install redis by following [redis installation guide](https://redis.io/docs/getting-started/installation/).
## Installing dependencies

**Installing backend dependencies and starting backend/server**

- Navigate to backend

```bash
  cd backend
```

- Install backend dependencies

```bash
  npm install
```

- Start backend/server

```bash
  npm start
```



**Installing backend dependencies and starting frontend/website**

- Navigate to frontend

```bash
  cd frontend
```

- Install frontend dependencies

```bash
  npm install
```

- Start backend/server

```bash
  npm start
```