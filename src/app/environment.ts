// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyBgjfSBidyvXk8khmILej32MC1iJu7x89I",
    authDomain: "death-box-28ecf.firebaseapp.com",
    projectId: "death-box-28ecf",
    storageBucket: "death-box-28ecf.appspot.com",
    messagingSenderId: "917048488305",
    appId: "1:917048488305:web:5af3d89596a2d8deaf06d0",
    measurementId: "G-RMWB0565QP"
  }
};


// Initialize Firebase
const app = initializeApp(environment.firebase);


// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
