import { Tab, styled } from "@mui/material";

import { Colors } from "@src/app/theme";

interface ServiceTabProps {
  label: string;
}

const ServiceTab = styled((props: ServiceTabProps) => <Tab {...props} />)(
  () => ({
    padding: "0 6px",
    minHeight: "36px",
    textTransform: "none",

    "&.Mui-selected": {
      backgroundColor: "white",
      borderRadius: "10px",
      color: `${Colors.card} !important`,
    },
  }),
);

export default ServiceTab;
