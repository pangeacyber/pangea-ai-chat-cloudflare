import { Avatar, Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "@pangeacyber/react-auth";

import { useAppState } from "@src/app/context";

const LoginContainer = styled(Stack)(({ theme }) => ({
  marginLeft: "20px",
  marginBottom: "20px",
  padding: "20px",
  background: theme.palette.background.paper,
  borderRadius: "10px",
  gap: "20px",
}));

const LoginWidget = () => {
  const { authenticated, user, login, logout } = useAuth();
  const { setUserPrompt, setSystemPrompt } = useAppState();
  const firstLetter = Array.from(
    user?.profile?.first_name || user?.email || " ",
  )[0];

  const handleLogout = () => {
    logout();
    setSystemPrompt("");
    setUserPrompt("");
  };

  if (!authenticated) {
    return (
      <LoginContainer>
        <Button onClick={login} variant="outlined">
          Sign up or log in
        </Button>
      </LoginContainer>
    );
  }

  return (
    <LoginContainer>
      <Stack direction="row" gap={2}>
        <Avatar>{firstLetter}</Avatar>
        <Stack>
          {user?.profile?.first_name ||
            (user?.profile?.first_name && (
              <Typography variant="body1">
                {user?.profile?.first_name} {user?.profile?.first_name}
              </Typography>
            ))}
          <Typography variant="body2">{user?.email}</Typography>
        </Stack>
      </Stack>
      <Stack direction="row" gap={1}>
        <Button
          href="https://console.pangea.cloud"
          sx={{ width: "50%" }}
          target="_new"
          variant="outlined"
        >
          Console
        </Button>
        <Button onClick={handleLogout} sx={{ width: "50%" }} variant="outlined">
          Sign out
        </Button>
      </Stack>
    </LoginContainer>
  );
};

export default LoginWidget;
