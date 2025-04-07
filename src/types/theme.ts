export interface ColorPalette {
  primary: string;
  secondary: string;
  background: {
    primary: string;
    secondary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  ui: {
    success: string;
    error: string;
    warning: string;
    info: string;
    disabled: string;
    border: string;
  };
} 