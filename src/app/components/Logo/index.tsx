import { Stack } from "@mui/material";
import type { FC } from "react";

interface Props {
  size?: number;
}

const PangeaLogo: FC<Props> = ({ size = 32 }) => {
  return (
    <Stack
      alignItems="center"
      height={size}
      justifyContent="center"
      sx={{
        background:
          "linear-gradient(0deg, #551B76 0%, #29ADEB 100%), linear-gradient(0deg, rgba(20, 23, 25, 0.3), rgba(20, 23, 25, 0.3))",
        borderRadius: "10px",
      }}
      width={size}
    >
      <svg
        fill="none"
        height="16"
        role="presentation"
        viewBox="0 0 18 16"
        width="18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.8096 4.03598L12.4444 0.104799C12.3798 0.0577896 12.3387 0.0401611 12.2507 0.0401611H10.7597C10.4251 0.0401611 10.0788 0.310467 9.98486 0.651287L6.02847 15.43C5.94629 15.7473 6.13413 15.9999 6.44524 15.9999H8.29429C8.61127 15.9999 8.93412 15.7414 9.02218 15.43L9.25111 14.5779L10.2197 10.9582L10.9828 8.11407L12.2155 3.49537C12.2448 3.37785 12.3857 3.33084 12.4796 3.40135L15.5672 5.66369C15.6788 5.74596 15.6788 5.9105 15.5672 5.99276L12.2331 8.43727C12.0805 8.54891 11.9865 8.76046 11.9865 8.99551V11.299C11.9865 11.6986 12.3153 11.6457 12.5794 11.4518L17.8037 7.62047C17.927 7.53233 18.0033 7.36192 18.0033 7.17388V4.4767C18.0033 4.29454 17.927 4.12413 17.8096 4.03598Z"
          fill="white"
        />
        <path
          d="M6.01677 0.245877V2.65512C6.01677 2.89017 5.91698 3.10759 5.76436 3.22512L2.43606 5.66962C2.3304 5.74601 2.3304 5.91642 2.43606 5.99869L5.77023 8.44319C5.92285 8.55484 6.01677 8.77226 6.01677 9.00143V11.3049C6.01677 11.7045 5.68805 11.6516 5.4239 11.4577L0.199581 7.6264C0.0763103 7.53826 0 7.36784 0 7.17981V4.47675C0 4.29459 0.0763102 4.12418 0.193711 4.03603L5.55891 0.104847C5.76436 -0.0479342 6.01677 -0.0596862 6.01677 0.245877Z"
          fill="#29ADEB"
        />
      </svg>
    </Stack>
  );
};

export default PangeaLogo;
