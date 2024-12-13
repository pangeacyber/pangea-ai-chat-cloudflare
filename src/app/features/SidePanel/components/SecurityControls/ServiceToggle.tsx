import { OpenInNewOutlined } from "@mui/icons-material";
import { Box, Button, Link, Stack, Switch, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { FC, ReactNode } from "react";

interface Props {
  icon: ReactNode;
  name: string;
  link: string;
  type: "toggle" | "link";
  active: boolean;
  changeHandler: () => void;
  linkLabel?: string;
}

const ServiceToggle: FC<Props> = ({
  icon,
  name,
  link,
  type,
  active,
  changeHandler,
  linkLabel,
}) => {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={1}
      padding="10px 20px"
      sx={{
        borderRadius: "10px",
        transition: "background 0.6s",
        "&:hover": {
          background: "#282A2C",
          "a, a > p, a > svg": {
            color: theme.palette.secondary.main,
            transition: "color 0.6s",
          },
        },
      }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        <Box
          sx={{
            svg: {
              color: active ? theme.palette.secondary.main : "primary",
            },
          }}
        >
          {icon}
        </Box>
        <Stack>
          <Typography variant="body1">{name}</Typography>
          <Link
            target="_blank"
            href={link}
            color="textSecondary"
            sx={{
              display: "flex",
              direction: "row",
              alignItems: "center",
              textDecoration: "none",
              gap: 1,
            }}
          >
            <Typography variant="body2">Try the API</Typography>
            <OpenInNewOutlined fontSize="small" />
          </Link>
        </Stack>
      </Stack>
      {type === "link" ? (
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => changeHandler()}
          >
            {linkLabel || "View"}
          </Button>
        </Box>
      ) : (
        <Switch
          color="secondary"
          checked={active}
          onChange={() => changeHandler()}
          sx={{ marginRight: "-12px" }}
        />
      )}
    </Stack>
  );
};

export default ServiceToggle;
