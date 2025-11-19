import { initializeApp } from "firebase/app";
import {
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA7UmElNlXAnPfDHvfJTcWvvh9Vka8jJ8",
  authDomain: "proyecto-react-5fc5b.firebaseapp.com",
  projectId: "proyecto-react-5fc5b",
  storageBucket: "proyecto-react-5fc5b.firebasestorage.app",
  messagingSenderId: "429402941051",
  appId: "1:429402941051:web:c28445382064e5bb41e4de",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
// Microsoft sign-in via OAuth provider
export const microsoftProvider = new OAuthProvider("microsoft.com");
