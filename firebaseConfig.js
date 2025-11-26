import { initializeApp } from "firebase/app";
import {
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAT2dJZ7deC3rvdmPBgK-rXJ3XH_R5jnhM",
  authDomain: "angular-proyect-9aeea.firebaseapp.com",
  projectId: "angular-proyect-9aeea",
  storageBucket: "angular-proyect-9aeea.firebasestorage.app",
  messagingSenderId: "487504246800",
  appId: "1:487504246800:web:4220f5387f9aa0622e7295",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
// Microsoft sign-in via OAuth provider
export const microsoftProvider = new OAuthProvider("microsoft.com");
