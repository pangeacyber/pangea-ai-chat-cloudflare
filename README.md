# pangea-ai-chat

An example webapp demonstrating Pangea's [AI Guard][] and [Prompt Guard][]
services.

## Prerequisites

- Node.js v20 or v22.
- yarn v4.5.1 (or greater).
- A [Pangea account][Pangea signup] with AI Guard, Prompt Guard, AuthN, and
  Secure Audit Log enabled.

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

## Usage

A development version of the app can be started with:

```
yarn dev
```

Then navigate to <http://localhost:3000>.

[AI Guard]: https://pangea.cloud/docs/ai-guard/
[Prompt Guard]: https://pangea.cloud/docs/prompt-guard/
[Pangea signup]: https://pangea.cloud/signup
