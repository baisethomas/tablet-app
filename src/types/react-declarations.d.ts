// Type declarations for React Navigation
declare module '@react-navigation/native' {
  export const NavigationContainer: React.FC<any>;
  export const useNavigation: () => any;
}

declare module '@react-navigation/native-stack' {
  export const createNativeStackNavigator: () => any;
  export type NativeStackNavigationProp<T, K extends keyof T> = any;
}

declare module '@react-navigation/bottom-tabs' {
  export const createBottomTabNavigator: () => any;
}

declare module '@react-navigation/material-top-tabs' {
  export const createMaterialTopTabNavigator: () => any;
} 