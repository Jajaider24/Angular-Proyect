export const environment = {
  production: true,
  // En producción debes reemplazar por la configuración de Firebase
  // correspondiente a tu proyecto (no subir claves públicas que no
  // correspondan al entorno). Estos valores son placeholders y deben
  // ajustarse antes de desplegar.
  firebase: {
    apiKey: "AIzaSyAT2dJZ7deC3rvdmPBgK-rXJ3XH_R5jnhM",
    authDomain: "angular-proyect-9aeea.firebaseapp.com",
    projectId: "angular-proyect-9aeea",
    storageBucket: "angular-proyect-9aeea.firebasestorage.app",
    messagingSenderId: "487504246800",
    appId: "1:487504246800:web:4220f5387f9aa0622e7295",
  },
  // En producción siempre debe estar en false
  allowLocalLogin: false,
  // API Key de Google Gemini para el chatbot inteligente
  geminiApiKey: "AIzaSyCG_pJ9_XMzlIgRBKYsm5TILicxYz-rlaE",
};
