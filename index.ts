// Remove base-64 and buffer polyfills
// import 'base-64';
// import { Buffer } from 'buffer';
// global.Buffer = Buffer;

// Use standard import from 'expo'
import { registerRootComponent } from 'expo';

// Correct import path for App.tsx in the root directory
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
