# Sparqlix


<span>
<img src="assets/sparqlix.png" align="left" style="width:100px;height: 100px; margin: 20px;">
<br>

A matrix bot to run Sparql queries sent through the chat!

</span>

<br clear="both">

## Usage
- Clone the repository.
- Either enter LOGINNAME & PASSWORD in .env, or generate an access token for your bot user (see [t2bot.io/docs/access_tokens/](https://t2bot.io/docs/access_tokens/)).
- Rename .env.example to .env and change the values.
- Run `npm install && npm build`.


|    npm run   |                   function                 |
| ------------ | ------------------------------------------ |
| start        | Run build/index.js                         |
| dev          | Run & watch app/index.ts                   |
| build        | Build app/ into build/                     |
| start-docker | Run the Dockerfile                         |
| dev-docker   | Build & run the Dockerfile                 |
| build-docker | Copy .env to .env.docker & build the image |

## Structure
- [app/](app/)
    - [index.ts](app/index.ts): basic boilerplate for the bot client.
- [assets/](assets/): Images (and an image script) for use in the README.
- *build/*: Made during runtime. Compiled javascript code.
- *.env*: Manually made. Environment variables to use when running locally.
- *.env.docker* Manually made or generated from *.env*. Environment variables for use in Docker.

## License
This project is licensed under the [MIT License](https://github.com/Denperidge-Redpencil/Matrix-Bot-Starter/blob/main/LICENSE).
