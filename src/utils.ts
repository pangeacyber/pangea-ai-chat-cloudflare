import type { DocumentInterface } from "@langchain/core/documents";
import type { MessageFieldWithRole } from "@langchain/core/messages";
import type { Profile } from "@pangeacyber/react-auth";

export const delay = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const rateLimitQuery = () => {
  const today = "24hour";

  const limitSearch = {
    query: "type:llm_response",
    limit: 1,
    start: today,
    search_restriction: {},
  };

  return limitSearch;
};

export const constructLlmInput = ({
  systemPrompt,
  userPrompt,
  documents,
  profile,
}: {
  systemPrompt: string;
  userPrompt: string;
  documents: readonly DocumentInterface[];
  profile: Profile;
}): MessageFieldWithRole[] => {
  const context = documents.length
    ? `PTO balances:\n${documents
        .map(({ pageContent }) => pageContent)
        .join("\n\n")})`
    : "";

  return [
    {
      role: "system",
      content: `${systemPrompt}
User's first name: ${profile.first_name}
User's last name: ${profile.last_name}
Context: ${context}`,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];
};
