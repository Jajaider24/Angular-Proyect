# 🤖 Guía de Configuración del Chatbot con Gemini API

## ⚠️ Problema Actual: "No autorizado"

El chatbot está mostrando el error **"No autorizado"** porque la API Key de Google Gemini ha expirado o no es válida.

---

## ✅ Solución Paso a Paso

### **Paso 1: Obtener Nueva API Key**

1. **Abre tu navegador** y ve a:

   ```
   https://aistudio.google.com/app/apikey
   ```

2. **Inicia sesión** con tu cuenta de Google

3. **Crea una nueva API Key:**
   - Haz clic en el botón **"Create API Key"** o **"Get API Key"**
   - Selecciona tu proyecto o crea uno nuevo
   - Copia la API Key generada (tiene este formato: `AIzaSy...`)

### **Paso 2: Actualizar la Configuración**

1. **Abre el archivo:**

   ```
   src/environments/environment.ts
   ```

2. **Busca esta línea:**

   ```typescript
   geminiApiKey: "TU_NUEVA_API_KEY_AQUI",
   ```

3. **Reemplaza** `"TU_NUEVA_API_KEY_AQUI"` con la API Key que copiaste en el Paso 1

   **Ejemplo:**

   ```typescript
   geminiApiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
   ```

4. **Guarda el archivo** (Ctrl + S)

### **Paso 3: Actualizar Ambiente de Producción (Opcional)**

Si vas a desplegar en producción, también actualiza:

```
src/environments/environment.prod.ts
```

Con la misma API Key.

### **Paso 4: Reiniciar el Servidor**

1. **Detén el servidor** si está corriendo (Ctrl + C en la terminal)

2. **Inicia nuevamente:**

   ```powershell
   ng serve
   ```

3. **Abre el navegador** en `http://localhost:4200`

4. **Prueba el chatbot** con alguna pregunta:
   - "¿Para qué sirve este sistema?"
   - "¿Cómo crear un restaurante?"
   - "¿Qué es un menú?"

---

## 🎯 Verificación

Si todo está correcto, deberías ver:

✅ El chatbot responde correctamente  
✅ No aparece el mensaje "No autorizado"  
✅ En la consola del navegador (F12) no hay errores 401/403  
✅ El avatar se anima correctamente  
✅ La voz sintética funciona (si está activada)

---

## 🔍 Solución de Problemas

### **Problema: Aún sale "No autorizado"**

**Posibles causas:**

1. **La API Key no se copió correctamente**

   - Verifica que no haya espacios al inicio o final
   - Debe empezar con `AIzaSy`
   - No debe tener comillas dobles dentro del string

2. **No reiniciaste el servidor**

   - Detén el servidor (Ctrl + C)
   - Vuelve a ejecutar `ng serve`

3. **La API Key está deshabilitada en Google Cloud**
   - Ve a: https://console.cloud.google.com/apis/credentials
   - Verifica que la API Key esté habilitada
   - Asegúrate de tener habilitada la **Generative Language API**

### **Problema: Error "Límite de solicitudes excedido"**

**Solución:**

- Espera unos minutos e intenta de nuevo
- La cuota gratuita de Gemini es limitada
- Considera actualizar a un plan de pago si necesitas más solicitudes

### **Problema: No se conecta (error de red)**

**Solución:**

- Verifica tu conexión a internet
- Revisa si hay un firewall bloqueando la conexión
- Prueba desactivar temporalmente el antivirus

---

## 📚 Recursos Adicionales

- **Documentación de Gemini API:**  
  https://ai.google.dev/docs

- **Google AI Studio:**  
  https://aistudio.google.com/

- **Obtener API Key:**  
  https://aistudio.google.com/app/apikey

- **Consola de Google Cloud:**  
  https://console.cloud.google.com/

---

## 💡 Mejoras Implementadas

He realizado las siguientes mejoras al chatbot:

✅ **Mensajes de error mejorados:** Ahora te indica exactamente qué hacer cuando hay un problema  
✅ **Pipe para formateo:** Los mensajes con saltos de línea se muestran correctamente  
✅ **Logging detallado:** En la consola del navegador verás más información sobre los errores  
✅ **Instrucciones claras:** Los archivos de environment tienen comentarios detallados

---

## 🎨 Características del Chatbot

- ✅ **Avatar animado Lottie** con animación suave
- ✅ **Voz sintética** en español (Text-to-Speech)
- ✅ **Preguntas rápidas** con botones predefinidos
- ✅ **Historial de conversación** con timestamps
- ✅ **Context-aware** sobre el sistema de delivery
- ✅ **Manejo de errores robusto** con mensajes claros
- ✅ **Diseño responsive** que no tapa el avatar

---

## 🚀 Ejemplo de Uso

Una vez configurado correctamente, puedes hacer preguntas como:

```
- "¿Cómo crear un nuevo restaurante?"
- "¿Qué campos tiene la entidad Product?"
- "¿Cómo funciona el mapa en tiempo real?"
- "Explícame cómo gestionar pedidos"
- "¿Qué es un shift y para qué sirve?"
- "¿Cómo subo fotos de incidencias?"
- "Dame las reglas de validación de clientes"
```

El bot responderá con información específica sobre tu sistema de delivery.

---

**¿Necesitas ayuda adicional?**  
Revisa la consola del navegador (F12 > Console) para ver los errores detallados.
