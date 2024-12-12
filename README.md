# pangea-ai-chat

An example webapp demonstrating Pangea's [AI Guard][] and [Prompt Guard][]
services.

## Prerequisites

- Node.js v20 or v22.
- yarn v4.5.1 (or greater).
- A [Pangea account][Pangea signup] with AI Guard, Prompt Guard, AuthN, and
  Secure Audit Log enabled.
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
- A Google Cloud project with the [Google Drive API][] and [Google Sheets API][] enabled.
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
3. Under AuthN > General > Social (OAuth), enable Google, GitHub, and LinkedIn.
4. Under AuthN > Overview, note the "Client Token" and "Hosted Login" values for
   later.

### Repository

```
git clone https://github.com/pangeacyber/pangea-ai-chat.git
cd pangea-ai-chat
yarn install
cp .env.template .env.local
```

There are several values that need to be filled out in `.env.local`:

- `NEXT_PUBLIC_PANGEA_CLIENT_TOKEN`: This should be the AuthN "Client Token"
  that was noted earlier.
- `NEXT_PUBLIC_AUTHN_UI_URL`: This should be the AuthN "Hosted Login" that was
  noted earlier.
- `PANGEA_SERVICE_TOKEN`: Pangea API token with access to AI Guard and Prompt
  Guard.
- `PANGEA_AUDIT_CONFIG_ID`: Pangea Secure Audit Log configuration ID.
- `AWS_ACCESS_KEY_ID`: AWS access key.
- `AWS_SECRET_ACCESS_KEY`: Secret key associated with the AWS access key
- `GOOGLE_DRIVE_CREDENTIALS`: Google service account credentials as a compacted
  JSON object. The value of this variable should be the contents of the
  `credentials.json` from earlier with its whitespace removed until it fits in a
  single line.
- `GOOGLE_DRIVE_FOLDER_ID`: Google Drive folder ID.

## Usage

A development version of the app can be started with:

```
yarn dev
```

Then navigate to <http://localhost:3000>.

[AI Guard]: https://pangea.cloud/docs/ai-guard/
[Prompt Guard]: https://pangea.cloud/docs/prompt-guard/
[Pangea signup]: https://pangea.cloud/signup
[Google Drive API]: https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com
[Google Sheets API]: https://console.cloud.google.com/flows/enableapi?apiid=sheets.googleapis.com
[retrieve-the-google-docs]: https://python.langchain.com/docs/integrations/retrievers/google_drive/#retrieve-the-google-docs
