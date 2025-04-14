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
    inverse: string;
    tertiary: string;
  };
  ui: {
    border: string;
  };
  border: string;
  error: string;
}

export type FontWeight = '400' | '500' | '700';

export interface Theme {
  colors: ColorPalette;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeight: {
      regular: FontWeight;
      medium: FontWeight;
      bold: FontWeight;
    };
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
} 