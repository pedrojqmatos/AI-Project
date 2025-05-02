import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideFirebaseApp} from '@angular/fire/app'
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import {getAuth, provideAuth} from '@angular/fire/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCaroJ5prNxfnT7XQLOaMqNxVMiEc2qTXw",
  authDomain: "aureus-chat.firebaseapp.com",
  projectId: "aureus-chat",
  storageBucket: "aureus-chat.firebasestorage.app",
  messagingSenderId: "597705486207",
  appId: "1:597705486207:web:2204338133f3344523744a",
  measurementId: "G-VPG76FWGY1"
};



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};
