# pangea-ai-chat-cloudflare

An example webapp on Cloudflare demonstrating Pangea's [AI Guard][] and
[Prompt Guard][] services.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pangeacyber/pangea-ai-chat-cloudflare)

## Prerequisites

- Node.js v20.19.0, v22.14.0, or greater.
- A [Pangea account][Pangea signup] with AI Guard, Prompt Guard, AuthN, AuthZ,
  and Secure Audit Log enabled.
- A Cloudflare account.
- A Google Drive folder containing spreadsheets.

  - Note down the ID of the folder for later (see [the LangChain docs][retrieve-the-google-docs]
    for a guide on how to get the ID from the URL).
  - Each spreadsheet should be named after a user and have two rows. For example:

    Alice PTO

    | Employee | Hours |
    | -------- | ----- |
    | Alice    | 25    |

    Bob PTO

    | Employee | Hours |
    | -------- | ----- |
    | Bob      | 100   |

- Two Google Identities (e.g. Alice and Bob)
  - One user (e.g. Alice) will act as the admin and own the folder and have full
    access to all spreadsheets within
  - The other user (e.g. Bob) will act as an employee with read access to their
    single spreadsheet
- A Google Cloud project with the [Google Docs API][], [Google Drive API][], and
  [Google Sheets API][] enabled.
- A Google service account:
  1. In your Google Cloud project, go to IAM & Admin > Service Accounts (using
     the navigation menu in the top left) and create a new service account.
  2. On the service accounts page, select your new service account, click KEYS,
     and add a new key. Save the key as `credentials.json` somewhere.
  3. Share the Google Drive folder with the service account’s email, granting it
     Editor access so it can query file permissions as needed.

## Setup

### Pangea AuthN

After activating AuthN:

1. Under AuthN > General> Signup Settings, enable "Allow Signups". This way
   users won't need to be manually added.
2. For development only: under AuthN > General > Redirect (Callback) Settings,
   add `http://localhost:3000` as a redirect.
3. Under AuthN > General > Social (OAuth), enable Google.
4. Under AuthN > Overview, note the "Client Token" and "Hosted Login" values for
   later.

### Pangea AuthZ

Set the authorization schema to the built-in
[File Drive][reset-authorization-schema] schema.

### Pangea Secure Audit Log

Use the built-in AI Audit Log Schema configuration.

### Repository

```shell
git clone https://github.com/pangeacyber/pangea-ai-chat-cloudflare.git
cd pangea-ai-chat-cloudflare
npm install
cp .dev.vars.example .dev.vars
```

There are several values that need to be filled out in `.dev.vars`:

- `NEXT_PUBLIC_PANGEA_CLIENT_TOKEN`: This should be the AuthN "Client Token"
  that was noted earlier.
- `NEXT_PUBLIC_AUTHN_UI_URL`: This should be the AuthN "Hosted Login" that was
  noted earlier.
- `PANGEA_SERVICE_TOKEN`: Pangea API token with access to AI Guard and Prompt
  Guard.
- `PANGEA_AUDIT_CONFIG_ID`: Pangea Secure Audit Log configuration ID.
- `GOOGLE_DRIVE_CREDENTIALS`: Google service account credentials as a compacted
  JSON object. The value of this variable should be the contents of the
  `credentials.json` from earlier with its whitespace removed until it fits in a
  single line.
- `GOOGLE_DRIVE_FOLDER_ID`: Google Drive folder ID.
- `INGEST_TOKEN`: A randomly-generated value that will be the API token
  necessary for initiating ingestion of new vectors.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with access to Workers AI and
  Vectorize.

### Cloudflare Vectorize

The Cloudflare Vectorize database should be created like so:

```shell
npx wrangler vectorize create pangea-ai-chat --dimensions=768 --metric=cosine
```

## Local deployment

A local version of the app can be started with:

```shell
npm run preview
```

Then navigate to <http://localhost:8788>.

Alternatively, the Next.js development server is also available, but requires
copying the environment variables file:

```shell
cp .dev.vars .env
npm run dev
```

Then navigate to <http://localhost:3000>.

## Remote deployment

This repository is automatically deployed to Cloudflare Pages on every push via
Cloudflare's [Git integration][]. However, a manual deployment from a local
system may be done with:

```shell
npm run deploy
```

Don't forget to set the same environment variables as before on the Settings
page of the Cloudflare Pages project:

![Cloudflare Pages environment variables](.github/assets/cloudflare-pages-environment-variables.png)

[AI Guard]: https://pangea.cloud/docs/ai-guard/
[Prompt Guard]: https://pangea.cloud/docs/prompt-guard/
[Pangea signup]: https://pangea.cloud/signup
[Google Docs API]: https://console.cloud.google.com/flows/enableapi?apiid=docs.googleapis.com
[Google Drive API]: https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com
[Google Sheets API]: https://console.cloud.google.com/flows/enableapi?apiid=sheets.googleapis.com
[retrieve-the-google-docs]: https://python.langchain.com/docs/integrations/retrievers/google_drive/#retrieve-the-google-docs
[Git integration]: https://developers.cloudflare.com/pages/configuration/git-integration/
[reset-authorization-schema]: https://pangea.cloud/docs/authz/general#reset-authorization-schema
