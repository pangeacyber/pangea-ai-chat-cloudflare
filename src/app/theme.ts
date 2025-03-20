// Copyright 2021 Pangea Cyber Corporation
// Author: Pangea Cyber Corporation

import { createTheme } from "@mui/material/styles";

export const Colors = {
  primary: "#6900A5",
  secondary: "#29ADEB",
  contrast: "#FFFFFF",
  text: {
    primary: "#FFFFFF",
    secondary: "#94979C",
  },
  background: {
    paper: "#282A2C",
    default: "#141719",
  },
  icons: "#94979C",
  borders: "#797C7F",
  card: "#16181A",
  jsonView: {
    container: "#333537",
    label: "#F8C266",
    stringValue: "#FFFFFF",
  },
  shiki: {
    background: "#333537",
  },
};

const PangeaDark = () => {
  const theme = createTheme({
    typography: {
      fontFamily: "Inter, sans-serif",
      h1: {
        fontFamily: "Space Grotesk",
        fontSize: "40px",
        fontWeight: "400",
        lineHeight: "50px",
        background: "linear-gradient(90deg, #551B76 0%, #29ADEB 100%)",
        backgroundClip: "text",
        color: "transparent",
        filter: "brightness(120%)",
      },
      h6: {
        fontSize: "1rem",
      },
      body2: {
        color: Colors.text.secondary,
        lineHeight: 1.5,
      },
    },
    palette: {
      mode: "dark",
      primary: {
        main: Colors.primary,
      },
      secondary: {
        main: Colors.secondary,
      },
      text: {
        ...Colors.text,
      },
      background: {
        ...Colors.background,
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            "&.MuiTab-root.Mui-selected": {
              color: Colors.secondary,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            ".MuiTabs-indicator": {
              backgroundColor: Colors.secondary,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "50px",
            textTransform: "none",
            variants: [
              {
                props: { variant: "outlined" },
                style: {
                  color: Colors.contrast,
                  borderColor: Colors.contrast,
                },
              },
              {
                props: { variant: "contained" },
                style: {
                  color: Colors.borders,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: Colors.borders,
                  background: "transparent",
                  "&:hover": {
                    color: Colors.icons,
                    borderColor: Colors.icons,
                    background: "transparent",
                  },
                },
              },
            ],
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            ".Mui-selected": {
              outline: "none",
            },
            "&.MuiOutlinedInput-root.Mui-focused fieldset": {
              borderColor: Colors.icons,
              borderWidth: "1px",
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: Colors.icons,
            variants: [
              {
                props: { color: "active" },
                style: {
                  color: Colors.secondary,
                },
              },
            ],
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: "#222630",
            border: `1px solid ${Colors.borders}`,
          },
        },
      },
      // styles for Audit Log Viewer
      MuiGrid: {
        styleOverrides: {
          root: {
            ".MuiDataGrid-columnHeaderTitle": {
              fontFamily: "Inter",
            },
            ".MuiDataGrid-row .MuiDataGrid-cell": {
              borderBottom: `1px solid ${Colors.borders}`,
            },
            ".MuiButtonGroup-groupedOutlined.MuiButtonGroup-lastButton": {
              borderColor: Colors.text.secondary,
            },
          },
        },
      },
    },
  });

  return theme;
};

export default PangeaDark;
