import { Stack, Switch, Typography } from "@mui/material";

import { useChatContext } from "@src/app/context";

const AuthZ = () => {
  const { authzEnabled, setAuthzEnabled } = useChatContext();

  return (
    <Stack spacing={2}>
      <Typography variant="body2">
        Apply authorization for users, and systems
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        padding="10px 20px"
      >
        <Typography variant="body1">Apply AuthZ</Typography>
        <Switch
          color="secondary"
          checked={authzEnabled}
          onChange={(_, checked) => setAuthzEnabled(checked)}
          sx={{ marginRight: "-12px" }}
        />
      </Stack>
    </Stack>
  );
};

export default AuthZ;
