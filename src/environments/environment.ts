export const environment = {
  production: false,
  url_backend: "http://127.0.0.1:5000",
  url_security: "http://127.0.0.1:5000",
  url_web_socket: "http://127.0.0.1:5000",
  // Habilita el modo dev que permite crear sesión local aunque el usuario
  // no exista en la base de datos. Úsalo solo en desarrollo. Para obligar
  // el login real en local, cambie a `false`.
  allowLocalLogin: false,
  // Configuración de Firebase para ambiente local/development.
  // Mueve o reemplaza estos valores por los de tu proyecto Firebase.
  firebase: {
    apiKey: "AIzaSyAT2dJZ7deC3rvdmPBgK-rXJ3XH_R5jnhM",
    authDomain: "angular-proyect-9aeea.firebaseapp.com",
    projectId: "angular-proyect-9aeea",
    storageBucket: "angular-proyect-9aeea.firebasestorage.app",
    messagingSenderId: "487504246800",
    appId: "1:487504246800:web:4220f5387f9aa0622e7295",
  },

  geminiApiKey: "AIzaSyBTZmCxWLsFjpsHSeBMERNOqd8IeT73OYw",
};
