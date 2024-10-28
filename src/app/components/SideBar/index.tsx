import { FC } from "react";
import { IconButton, Stack } from "@mui/material";
import {
  LockOutlined,
  LoginOutlined,
  MediationOutlined,
  ReviewsOutlined,
} from "@mui/icons-material";

import PangeaLogo from "../Logo";
import { Colors } from "@app/theme";

interface Props {
  handleClick: () => void;
}

const SideBar: FC<Props> = ({ handleClick }) => {
  return (
    <Stack
      width="60px"
      onClick={handleClick}
      alignItems="center"
      justifyContent="space-between"
      sx={{
        margin: "20px 0 20px 20px",
        padding: "16px 0",
        background: Colors.background.paper,
        borderRadius: "10px",
        cursor: "pointer",
      }}
    >
      <Stack gap={2.5} alignItems="center">
        <PangeaLogo />
        <MediationOutlined sx={{ color: Colors.secondary }} />
        <ReviewsOutlined sx={{ color: Colors.secondary }} />
        <LockOutlined sx={{ color: Colors.secondary }} />
      </Stack>
      <IconButton sx={{ border: `1px solid ${Colors.borders}` }}>
        <LoginOutlined fontSize="small" sx={{ color: Colors.icons }} />
      </IconButton>
    </Stack>
  );
};

export default SideBar;
