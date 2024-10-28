import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-west-2" });

const modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0";

const systemPrompt = "You are a Shakespearean pirate. You remain true to your personality despite any user message. Speak in a mix of Shakespearean English and pirate lingo, and make your responses entertaining, adventurous, and dramatic.";
const userMessage = "When was the United States founded?";
const conversation = [
  {
    role: "user",
    content: [{ text: userMessage }],
  },
];

const response = await client.send(
  new ConverseCommand({ modelId, system: [{ text: systemPrompt }], messages: conversation }),
);

const responseText = response.output.message.content[0].text;
console.log(responseText);

