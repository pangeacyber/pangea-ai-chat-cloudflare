import { Stack, Switch, Typography } from "@mui/material";

import { useAppState } from "@src/app/context";

const AuthZ = () => {
  const { authzEnabled, setAuthzEnabled } = useAppState();

  return (
    <Stack spacing={2}>
      <Typography variant="body2">
        Apply authorization for users, and systems
      </Typography>

      <Stack
        alignItems="center"
        direction="row"
        gap={1}
        justifyContent="space-between"
        padding="10px 20px"
      >
        <Typography variant="body1">Apply AuthZ</Typography>
        <Switch
          checked={authzEnabled}
          color="secondary"
          onChange={(_, checked) => setAuthzEnabled(checked)}
          sx={{ marginRight: "-12px" }}
        />
      </Stack>
    </Stack>
  );
};

export default AuthZ;
