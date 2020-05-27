# Serverless ToDo App 2

The slightly enhanced cloud todo app based on the first [Serverless ToDo App](https://github.com/hafiz-azman/serverless-todo-app), built for [Udacity](https://www.udacity.com/) Cloud Engineer Nano Degree Program Capstone Project.

With this app, user can:

1. Sign up/Login to the app
2. Add/update/delete todo items
3. Attach an image to every todo items
4. Mark a todo as done

## Running the project

To run the project:

1. Clone the project
2. `cd` to `<project>/client`
3. Run `npm i`
4. Run `npm run start`

<hr>

## Development

The project developement related details

### Backend

**Deploying the project**

To deploy the backend project to AWS:

1. `cd` to `<project>/backend`
2. Run `npm i`
3. Run `serverless deploy`

### Frontend (Client)

**Backend API Configuration**

Once the backend project is deployed and up, connect the client to the backend APIs by:

1. Update `appId` in `<project>/client/src/config.ts` with the deployed backend serverless app ID, ex. "t3ofs06esk" (available in the API URL displayed when the backend API is successfully deployed `https://<app ID>.execute-api.<region>.amazonaws.com/<stage>`)
2. Update the `authConfig.domain` and `authConfig.clientId` in `<project>/client/src/config.ts` with the app domain and client ID obtained from the [auth0](https://auth0.com/) application settings page (Auto0 Dashboard > Applications > `<App name>` > Settings).
3. Run the app to test the configuration


