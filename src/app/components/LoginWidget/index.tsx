import { Avatar, Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "@pangeacyber/react-auth";

import { useChatContext } from "@src/app/context";

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
  const { setUserPrompt, setSystemPrompt } = useChatContext();
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
        <Button variant="outlined" onClick={login}>
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
        <Button variant="outlined" sx={{ width: "50%" }}>
          Console
        </Button>
        <Button variant="outlined" sx={{ width: "50%" }} onClick={handleLogout}>
          Sign out
        </Button>
      </Stack>
    </LoginContainer>
  );
};

export default LoginWidget;
