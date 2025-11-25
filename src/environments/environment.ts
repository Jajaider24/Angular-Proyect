export const environment = {
  production: false,
  url_backend: "http://127.0.0.1:5000",
  url_security: "http://127.0.0.1:5000",
  url_web_socket: "http://127.0.0.1:5000",
  // Habilita el modo dev que permite crear sesión local aunque el usuario
  // no exista en la base de datos. Úsalo solo en desarrollo.
  allowLocalLogin: true,
};
