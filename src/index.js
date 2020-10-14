import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase/app';
import 'firebase/database'

let firebaseConfig = {
  apiKey: "AIzaSyA870ofDqsTXsAhXWifngor4qPQdKfAxss",
  authDomain: "bad-docs.firebaseapp.com",
  databaseURL: "https://bad-docs.firebaseio.com",
  projectId: "bad-docs",
  storageBucket: "bad-docs.appspot.com",
  messagingSenderId: "1079006258139",
  appId: "1:1079006258139:web:b731dccaab13e38eab3dfe",
  measurementId: "G-99VLZBK3JZ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App firebase={firebase} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
