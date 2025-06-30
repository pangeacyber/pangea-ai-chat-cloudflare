import { Colors } from "@app/theme";
import {
  LockOutlined,
  LoginOutlined,
  MediationOutlined,
  ReviewsOutlined,
} from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import type { FC } from "react";

import PangeaLogo from "../Logo";

interface Props {
  handleClick: () => void;
}

const SideBar: FC<Props> = ({ handleClick }) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="space-between"
      onClick={handleClick}
      sx={{
        margin: "20px 0 20px 20px",
        padding: "16px 0",
        background: Colors.background.paper,
        borderRadius: "10px",
        cursor: "pointer",
      }}
      width="60px"
    >
      <Stack alignItems="center" gap={2.5}>
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
