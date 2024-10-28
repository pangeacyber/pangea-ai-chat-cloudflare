import { ChangeEvent } from "react";
import { Stack, TextField } from "@mui/material";

import CollapsablePanel from "@app/components/CollapsablePanel";
import { useChatContext } from "@src/app/context";

const SystemPrompt = () => {
  const { systemPrompt, setSystemPrompt, setLoginOpen } = useChatContext();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSystemPrompt(e.currentTarget.value);
  };

  return (
    <CollapsablePanel title="System Prompt">
      <Stack mb={2.5} pb={2}>
        <TextField
          value={systemPrompt}
          variant="outlined"
          placeholder="You're a helpful assistant."
          multiline
          minRows={2}
          maxRows={4}
          onChange={handleChange}
          sx={{
            width: "100%",
            height: "60px",
            marginTop: "12px",
            padding: "0 20px",
          }}
        />
      </Stack>
    </CollapsablePanel>
  );
};

export default SystemPrompt;
