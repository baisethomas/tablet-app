export type RootStackParamList = {
  MainTabs: undefined;
  SermonDetail: { sermonId: string };
  Transcription: { sermonId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Record: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 