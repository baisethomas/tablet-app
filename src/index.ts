// Remove base-64 and buffer polyfills
// import 'base-64';
// import { Buffer } from 'buffer';
// global.Buffer = Buffer;

import registerRootComponent from 'expo/build/launch/registerRootComponent';

// Correct the import path assuming App.tsx is in the project root
import App from '../App'; 

registerRootComponent(App); 