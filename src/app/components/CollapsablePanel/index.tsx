import { KeyboardArrowDownOutlined } from "@mui/icons-material";
import { Collapse, IconButton, Stack, Typography } from "@mui/material";
import { type FC, type ReactNode, useState } from "react";

interface Props {
  title: ReactNode;
  children: ReactNode;
}

const CollapsablePanel: FC<Props> = ({ title, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <Stack>
      <Stack alignItems="center" direction="row" gap={1} pl={1}>
        <IconButton onClick={() => setOpen(!open)}>
          <KeyboardArrowDownOutlined
            sx={{
              transform: open ? "rotate(0)" : "rotate(-90deg)",
              transition: "transform 0.3s",
            }}
          />
        </IconButton>
        <Typography sx={{ fontWeight: "500" }} variant="body1">
          {title}
        </Typography>
      </Stack>
      <Collapse in={open} orientation="vertical">
        {children}
      </Collapse>
    </Stack>
  );
};

export default CollapsablePanel;
