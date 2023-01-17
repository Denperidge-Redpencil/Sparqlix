# Mermatrix


<span>
<img src="assets/matrix-bot-starter-starter.png" align="left" style="width:100px;height: 100px; margin: 20px;">
<br>

A template to get started with matrix-bot-starter!

This template is just a starting off point. For documentation of the matrix-bot-starter, please check out its [repository](https://github.com/Denperidge-Redpencil/Matrix-Bot-Starter).

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
This template is in the [public domain](LICENSE). Matrix-Bot-Starter is licensed under the [MIT License](https://github.com/Denperidge-Redpencil/Matrix-Bot-Starter/blob/main/LICENSE).

