import { Colors } from "@app/theme";
import { ViewSidebarOutlined } from "@mui/icons-material";
import { Stack } from "@mui/material";
import type { FC } from "react";

interface Props {
  handleClick: () => void;
}

const RightSideBar: FC<Props> = ({ handleClick }) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="space-between"
      onClick={handleClick}
      sx={{
        margin: "20px 20px 20px 0px",
        padding: "16px 0",
        background: Colors.background.paper,
        borderRadius: "10px",
        cursor: "pointer",
      }}
      width="60px"
    >
      <Stack alignItems="center" gap={2.5}>
        <ViewSidebarOutlined />
      </Stack>
    </Stack>
  );
};
export default RightSideBar;
