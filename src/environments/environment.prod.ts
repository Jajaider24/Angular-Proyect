export const environment = {
  production: true,
  // Aliases para consistencia con servicios (ajusta a tu backend real)
  apiUrl: "https://api.tu-dominio.com",
  socketUrl: "https://api.tu-dominio.com",
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
  // ========================================
  // 🔑 API Key de Google Gemini (CHATBOT)
  // ========================================
  // ⚠️ IMPORTANTE: Esta API Key ha expirado o no es válida
  //
  // Para obtener una nueva:
  // 1. Ve a: https://aistudio.google.com/app/apikey
  // 2. Inicia sesión con tu cuenta Google
  // 3. Crea una nueva API Key
  // 4. Reemplaza el valor abajo con tu nueva key
  //
  // REEMPLAZA "TU_NUEVA_API_KEY_AQUI" con la key que obtengas:
  geminiApiKey: "AIzaSyAlkoIEouBOh5tIHk7b7rqOE6ejRVgfJ4A",
};
