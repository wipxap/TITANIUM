# MÓDULO: SISTEMA DE AUTENTICACIÓN Y CONTROL DE ACCESO — BOILERPLATE

> **Tipo:** Boilerplate de concepto en lenguaje natural
> **Versión:** 1.0 | **Fecha:** 04/02/2026
> **Origen:** Extraído y generalizado desde módulo de autenticación de proyecto gym real
> **Uso:** Guía para implementar un sistema de auth en CUALQUIER aplicación con usuarios y roles
> **Contiene código:** NO — solo concepto puro

---

## 1. ¿QUÉ ES ESTE MÓDULO?

Un sistema de autenticación es la puerta de entrada a tu aplicación. Controla quién puede entrar, qué puede ver cada persona, y cómo se protegen las cuentas de los usuarios.

Piensa en esto como el guardia de seguridad de un edificio: verifica tu identidad (login), te da una credencial según tu cargo (rol), te permite acceder solo a los pisos autorizados (permisos), y te deja salir cuando quieras (logout). Sin este módulo, cualquiera podría entrar y hacer lo que quiera en tu sistema.

Este módulo es obligatorio para CUALQUIER aplicación que tenga usuarios. No importa si es un gym, una clínica, un SaaS o una tienda online — si alguien necesita crear una cuenta para usar tu servicio, necesitas este módulo.

**Ejemplos reales de cómo se usa:**

- **Gimnasio:** Clientes se registran con RUT, inician sesión, ven su membresía. Staff accede a panel de caja o administración.
- **Clínica:** Pacientes se registran, profesionales acceden a agenda y fichas. Admin gestiona todo.
- **SaaS:** Usuarios crean cuenta con email, eligen plan, acceden a funcionalidades según su suscripción.
- **E-commerce:** Compradores se registran, vendedores gestionan productos, admin supervisa.
- **Coworking:** Miembros acceden con su cuenta, recepción gestiona accesos, admin ve reportes.

---

## 2. FUNCIONES CORE (Las que TODA aplicación necesita)

Estas funciones son obligatorias. Sin ellas, no hay sistema de usuarios. No importa tu industria — las necesitas todas.

### 2.1 Iniciar sesión (Login)

**Qué hace:** Permite que una persona con cuenta existente entre al sistema verificando su identidad.

**Quién la usa:** Cualquier persona con cuenta registrada.

**Cómo funciona en lenguaje simple:**
1. Usuario abre la app y ve la pantalla de login
2. Ingresa su identificador (email, RUT, nombre de usuario — según lo que use tu app)
3. Ingresa su contraseña
4. Hace clic en "Entrar"
5. Sistema verifica que el identificador exista y la contraseña sea correcta
6. Si todo está bien → entra a la app y ve su pantalla según su rol
7. Si algo falla → muestra error sin dar demasiados detalles (por seguridad)

**Variaciones por industria:**
- **Chile (gym, clínica):** Login con RUT chileno (12.345.678-9) o email
- **Internacional (SaaS):** Login con email o nombre de usuario
- **Empresarial:** Login con SSO corporativo (Google Workspace, Microsoft 365)
- **Redes sociales:** Login con Google, Facebook, Apple ("Iniciar sesión con...")

**Datos que necesita:**
- Identificador del usuario (email, RUT, username — uno o varios)
- Contraseña

**Qué devuelve al usuario:**
- Si éxito → redirección a la pantalla principal según su rol
- Si falla → mensaje de error genérico (por seguridad, no decir si el problema es el usuario o la contraseña)

---

### 2.2 Registrar cuenta nueva

**Qué hace:** Crea una cuenta para un nuevo usuario en el sistema.

**Quién la usa:** Personas que quieren usar el servicio por primera vez.

**Cómo funciona en lenguaje simple:**
1. Usuario hace clic en "Crear cuenta" desde la pantalla de login
2. Sistema muestra formulario con los datos necesarios
3. Usuario llena los campos obligatorios
4. Opcionalmente completa campos adicionales (foto, dirección, etc.)
5. Hace clic en "Registrarme"
6. Sistema valida que no exista una cuenta duplicada
7. Si todo está bien → crea la cuenta y el usuario entra automáticamente
8. Si hay problema → muestra error específico (ej: "Este email ya está registrado")

**Datos universales que TODA cuenta necesita (obligatorios):**

| Dato | Qué es | Ejemplo |
|------|--------|---------|
| Identificador único | Cómo se identifica el usuario | Email, RUT, username |
| Nombre | Cómo se llama | "Juan Pérez" |
| Contraseña | Clave de acceso | Mínimo 6-8 caracteres |
| Contacto | Cómo comunicarse | Email y/o teléfono |

**Datos opcionales comunes:**

| Dato | Para qué sirve | Ejemplo |
|------|----------------|---------|
| Foto de perfil | Identificación visual | Selfie, foto de avatar |
| Fecha de nacimiento | Verificación de edad, personalización | 23/05/1997 |
| Sexo/Género | Personalización, reportes | Masculino, Femenino, Otro |
| Dirección | Envíos, localización | "Av. Las Parcelas 123" |
| Documento de identidad | Verificación legal | RUT, DNI, pasaporte |

**Ejemplos por industria:**
- **Gym (Chile):** RUT + nombre + sexo + email + teléfono + contraseña + foto opcional
- **Clínica:** RUT/pasaporte + nombre + fecha nacimiento + email + teléfono + contraseña
- **SaaS:** Email + nombre + contraseña (mínimo necesario)
- **E-commerce:** Email + nombre + dirección de envío + contraseña

**Validaciones obligatorias:**
- El identificador único no puede estar duplicado (si el email ya existe → error)
- La contraseña debe cumplir requisitos mínimos de seguridad
- Los campos obligatorios no pueden estar vacíos
- Si usa documento de identidad → validar formato (ej: dígito verificador del RUT chileno)

---

### 2.3 Recuperar contraseña olvidada

**Qué hace:** Envía un mecanismo para que el usuario cree una nueva contraseña cuando olvidó la actual.

**Quién la usa:** Cualquier usuario que olvidó su contraseña.

**Cómo funciona en lenguaje simple:**
1. Usuario hace clic en "¿Olvidaste tu contraseña?" desde el login
2. Ingresa su email (o RUT, o el identificador que use la app)
3. Sistema busca si existe una cuenta con ese dato
4. Si existe → envía email con enlace de recuperación (válido por tiempo limitado)
5. Si no existe → muestra el MISMO mensaje (por seguridad, no revelar si la cuenta existe)
6. Mensaje genérico: "Si existe una cuenta con estos datos, recibirás un enlace por correo"
7. Usuario abre el enlace desde su correo
8. Ingresa nueva contraseña (dos veces para confirmar)
9. Si todo correcto → contraseña actualizada, puede iniciar sesión

**Datos que necesita:**
- Email o identificador del usuario (para buscar la cuenta)
- Nueva contraseña (dos veces, para confirmar)

**Variaciones de recuperación:**
- **Por email:** Enlace con token único y temporal (método más común y seguro)
- **Por SMS:** Código de 6 dígitos al teléfono registrado
- **Por pregunta secreta:** El usuario responde una pregunta que configuró antes (menos seguro, en desuso)

**Validaciones importantes:**
- El enlace/token debe expirar después de un tiempo (30 min a 24 hrs típicamente)
- El enlace solo puede usarse una vez (se invalida después del primer uso)
- Las dos contraseñas ingresadas deben coincidir
- NUNCA revelar si una cuenta existe o no al solicitar recuperación

---

### 2.4 Cerrar sesión (Logout)

**Qué hace:** Termina la sesión del usuario y lo devuelve a la pantalla de login.

**Quién la usa:** Cualquier usuario que quiera salir de su cuenta.

**Cómo funciona en lenguaje simple:**
1. Usuario hace clic en "Cerrar sesión" (normalmente en un menú o en su perfil)
2. Sistema elimina la sesión activa
3. Redirige a la pantalla de login
4. Si intenta acceder a cualquier pantalla protegida → lo manda al login

**Dónde ubicar el botón:** En el menú lateral, en el menú de perfil, o en la configuración. Debe ser fácil de encontrar pero no tan visible que se presione por accidente.

---

### 2.5 Persistencia de sesión

**Qué hace:** Recuerda al usuario entre visitas para que no tenga que iniciar sesión cada vez que abre la app.

**Quién la usa:** Todos los usuarios (de forma automática y transparente).

**Cómo funciona en lenguaje simple:**
1. Usuario inicia sesión exitosamente
2. Sistema guarda un token de sesión en el dispositivo del usuario
3. Cuando el usuario cierra y reabre la app → el sistema detecta el token
4. Si el token es válido → entra directo sin pedir contraseña
5. Si el token expiró o es inválido → muestra login

**Regla de seguridad:** Los tokens deben tener fecha de expiración. Opciones comunes: 7 días (apps normales), 30 días (apps de bajo riesgo), 1 hora (apps financieras/sensibles).

---

## 3. SISTEMA DE ROLES Y PERMISOS (RBAC)

RBAC significa "Role-Based Access Control" — en español: Control de Acceso Basado en Roles. Es el sistema que determina qué puede hacer cada tipo de usuario.

### ¿Qué es un rol?

Un rol es una etiqueta que le dices al sistema "esta persona es un _____" y según eso, el sistema le muestra ciertas pantallas y le permite ciertas acciones.

Piensa en los roles como los cargos en una empresa: el gerente puede ver los reportes financieros, el vendedor puede registrar ventas, y el cliente solo puede comprar. Cada cargo tiene permisos diferentes.

### Roles universales (los que casi TODA app necesita)

| Rol | Qué puede hacer | Ejemplo |
|-----|-----------------|---------|
| **Admin** | Todo. Ver, crear, editar, eliminar cualquier cosa. Gestionar usuarios y configuración. | Dueño del negocio, gerente general |
| **Staff / Empleado** | Funciones operativas del día a día. No puede cambiar configuración del sistema. | Recepcionista, vendedor, operador |
| **Usuario / Cliente** | Usar el servicio. Ver su propia información. Comprar productos/planes. | Cliente del gym, paciente, suscriptor |

### Roles opcionales según industria

| Rol | Industria | Qué hace |
|-----|-----------|----------|
| **Instructor / Profesional** | Gym, clínica, educación | Ve y gestiona solo a sus propios clientes/pacientes/alumnos |
| **Recepcionista** | Gym, clínica, hotel | Atiende en recepción, registra pagos presenciales, gestiona check-in |
| **Moderador** | Foros, redes sociales | Modera contenido, no puede cambiar configuración |
| **Supervisor** | Retail, restaurantes | Ve reportes de su equipo, no tiene acceso total como admin |
| **Soporte** | SaaS, e-commerce | Accede a tickets y datos de clientes para resolver problemas |

### Cómo funcionan los permisos

Cada rol tiene una lista de pantallas y acciones permitidas. Cuando el usuario intenta acceder a algo, el sistema verifica:

1. ¿El usuario tiene sesión activa? → Si no → mandarlo al login
2. ¿Su rol tiene permiso para ver esta pantalla? → Si no → mostrar "No tienes acceso"
3. ¿Su rol tiene permiso para hacer esta acción? → Si no → botón deshabilitado o acción bloqueada

**Ejemplos concretos:**

| Acción | Admin | Staff | Cliente |
|--------|-------|-------|---------|
| Ver panel de administración | ✅ | ❌ | ❌ |
| Crear planes/productos | ✅ | ❌ | ❌ |
| Registrar ventas en caja | ✅ | ✅ | ❌ |
| Ver reportes | ✅ | Parcial | ❌ |
| Comprar un plan | ✅ | ✅ | ✅ |
| Ver su propio perfil | ✅ | ✅ | ✅ |
| Ver datos de otros usuarios | ✅ | Parcial | ❌ |
| Cambiar configuración del sistema | ✅ | ❌ | ❌ |

---

## 4. CARACTERÍSTICAS OPCIONALES (Módulos que se activan/desactivan)

Estas son funciones que puedes activar o no según tu tipo de aplicación. Lee cada una y decide si la necesitas.

---

### 🔧 OPCIÓN: Login con Documento de Identidad Nacional

**¿Qué hace?**
Permite iniciar sesión usando un documento de identidad del país (RUT en Chile, DNI en Argentina/Perú, CURP en México, CPF en Brasil, cédula en Colombia, etc.) además de o en lugar del email.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios presenciales donde el cliente se identifica con documento (gyms, clínicas, bancos)
- ✅ Aplicaciones gubernamentales o reguladas
- ❌ SaaS internacionales donde los usuarios son de muchos países
- ❌ Apps donde el email es suficiente como identificador

**¿Cómo funciona en lenguaje simple?**
1. En el login, el usuario tiene opción de ingresar su documento o su email
2. Si ingresa documento → sistema lo formatea automáticamente (ej: agrega puntos y guión al RUT)
3. Busca la cuenta asociada a ese documento
4. Continúa el flujo normal de login

**Datos que necesita:**
- Tipo de documento (RUT, DNI, pasaporte, etc.)
- Número del documento
- Reglas de validación del formato (dígito verificador, largo, etc.)

**Validaciones específicas por país:**
- **Chile (RUT):** Formato XX.XXX.XXX-X, validar dígito verificador
- **Argentina (DNI):** 7-8 dígitos numéricos
- **Pasaporte:** Alfanumérico, sin validación de dígito verificador

**Complejidad de implementación:** Baja-Media (depende del país)
**¿Lo necesitas?** Solo si tus clientes se identifican con documento en vez de email.

---

### 🔧 OPCIÓN: Foto de Perfil con Cámara

**¿Qué hace?**
Permite que el usuario se tome una foto del rostro durante el registro o desde su perfil, usando la cámara del dispositivo.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios presenciales con control de acceso (gyms, coworking, empresas)
- ✅ Apps donde la identidad visual importa (redes sociales, marketplaces)
- ❌ Apps donde el anonimato es preferible (foros anónimos, herramientas de productividad)

**¿Cómo funciona en lenguaje simple?**
1. En el registro (o en el perfil), usuario hace clic en "Agregar foto"
2. Sistema pide permiso para usar la cámara del dispositivo
3. Muestra una guía visual (círculo) para centrar el rostro
4. Opcionalmente detecta automáticamente cuando hay un rostro bien posicionado
5. Usuario toca para capturar
6. Ve la preview y puede elegir "Otra foto" o "Usar esta"
7. La foto se guarda como parte de su perfil

**Datos que necesita:**
- Imagen capturada (formato JPEG/PNG)
- Permiso de cámara del dispositivo

**Validaciones:**
- La foto es SIEMPRE opcional — el usuario puede registrarse sin ella
- Si el dispositivo no tiene cámara → no mostrar la opción
- Peso máximo del archivo para no saturar almacenamiento

**Complejidad de implementación:** Media
**¿Lo necesitas?** Solo si la identificación visual del usuario agrega valor a tu servicio.

---

### 🔧 OPCIÓN: Cambio de Contraseña Forzado

**¿Qué hace?**
Obliga al usuario a crear una nueva contraseña antes de poder usar la app. Se usa cuando la contraseña fue creada por un admin, cuando se migra desde otro sistema, o por políticas de seguridad.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios que migran de un sistema antiguo a uno nuevo
- ✅ Empresas donde el admin crea cuentas para empleados con contraseña temporal
- ✅ Apps con políticas de seguridad estrictas (bancos, salud, gobierno)
- ❌ Apps donde el usuario siempre crea su propia contraseña

**¿Cómo funciona en lenguaje simple?**
1. Usuario inicia sesión con su contraseña temporal/migrada
2. Sistema detecta que la cuenta tiene flag "requiere cambio de contraseña"
3. Inmediatamente después del login aparece una ventana emergente (modal)
4. El usuario NO puede cerrar esta ventana ni navegar a otra parte
5. Debe ingresar nueva contraseña (dos veces para confirmar)
6. Una vez cambiada → el flag se desactiva y puede usar la app normalmente

**Datos que necesita:**
- Flag en la cuenta del usuario: "requiere cambio de contraseña" (sí/no)
- Nueva contraseña (dos veces)

**Validaciones:**
- El modal NO se puede cerrar sin cambiar la contraseña
- La nueva contraseña debe cumplir los requisitos de seguridad
- La nueva contraseña no puede ser igual a la anterior

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Solo si creas cuentas con contraseñas temporales o migras de otro sistema.

---

### 🔧 OPCIÓN: Selección de Sede / Sucursal

**¿Qué hace?**
Después del login, permite al usuario elegir en qué sede o sucursal quiere operar. Filtra toda la información de la app según la sede seleccionada.

**¿Para qué tipo de negocio sirve?**
- ✅ Cadenas con múltiples sucursales (gyms, clínicas, restaurantes, retail)
- ✅ Apps donde la sede cambia el contenido disponible
- ❌ Negocios con una sola ubicación
- ❌ Servicios 100% online sin sedes físicas

**¿Cómo funciona en lenguaje simple?**
1. Usuario inicia sesión exitosamente
2. Sistema muestra pantalla con las sedes disponibles (ej: "Gimnasio Centro", "Gimnasio Norte")
3. Usuario selecciona la sede donde quiere operar
4. Toda la app se filtra por esa sede (planes, clases, horarios, etc.)
5. Puede cambiar de sede en cualquier momento desde el menú

**Datos que necesita:**
- Lista de sedes disponibles en el sistema
- A qué sedes tiene acceso este usuario
- Sede seleccionada actualmente

**Validaciones:**
- Si el usuario solo tiene acceso a una sede → mostrarla automáticamente sin pedir selección
- Si es staff → puede estar restringido a una sola sede (no puede cambiar)
- Si el usuario tiene membresía en una sede y elige otra → advertencia (no bloqueo)
- Recordar la última sede seleccionada entre visitas

**Complejidad de implementación:** Media
**¿Lo necesitas?** Solo si tu negocio tiene múltiples ubicaciones y el contenido cambia según la sede.

---

### 🔧 OPCIÓN: Cambio de Rol / Simulación de Vista (Role Switching)

**¿Qué hace?**
Permite a los administradores ver la app como si fueran otro tipo de usuario, sin cerrar sesión. Útil para probar, debuggear y entender la experiencia del cliente.

**¿Para qué tipo de negocio sirve?**
- ✅ Apps con múltiples roles donde el admin necesita verificar qué ve cada tipo de usuario
- ✅ Equipos de desarrollo/QA que necesitan probar diferentes vistas
- ❌ Apps muy simples con solo 2 roles (admin/usuario)

**¿Cómo funciona en lenguaje simple?**
1. Admin inicia sesión normalmente
2. En el menú superior (o lateral) ve un selector de rol
3. Puede elegir "ver como: Cliente", "ver como: Recepcionista", etc.
4. La app cambia completamente la interfaz a la vista de ese rol
5. Todo lo que haga se hace con los permisos de su rol real (admin), pero ve la interfaz del rol simulado
6. Para volver, selecciona "Admin" en el mismo selector

**Datos que necesita:**
- Rol actual real del usuario
- Rol que está simulando
- Lista de roles que puede simular (configurable por usuario)

**Validaciones:**
- Solo usuarios con permiso específico pueden cambiar de rol (normalmente solo admins)
- El selector solo muestra roles que el usuario tiene permitido simular
- Las acciones que ejecute se registran con su rol REAL, no el simulado

**Complejidad de implementación:** Media
**¿Lo necesitas?** Solo si tienes 3+ roles y necesitas verificar las vistas de cada uno.

---

### 🔧 OPCIÓN: Login Social (OAuth)

**¿Qué hace?**
Permite iniciar sesión o registrarse usando una cuenta existente de Google, Facebook, Apple, Microsoft u otro proveedor.

**¿Para qué tipo de negocio sirve?**
- ✅ Apps que quieren reducir fricción en el registro (menos campos = más registros)
- ✅ SaaS y apps internacionales
- ✅ Apps móviles donde escribir contraseña es incómodo
- ❌ Apps donde necesitas datos específicos que OAuth no proporciona (RUT, etc.)
- ❌ Apps empresariales internas donde las cuentas las crea el admin

**¿Cómo funciona en lenguaje simple?**
1. En el login, usuario ve botones "Iniciar sesión con Google / Facebook / Apple"
2. Hace clic en uno
3. Se abre ventana del proveedor (ej: Google) pidiendo permisos
4. Usuario acepta
5. El proveedor envía los datos del usuario a tu app (nombre, email, foto)
6. Si es la primera vez → se crea cuenta automáticamente con esos datos
7. Si ya tiene cuenta → inicia sesión directamente
8. No necesita recordar contraseña de tu app

**Datos que proporciona el proveedor:**
- Email verificado
- Nombre completo
- Foto de perfil (opcional)
- Identificador único del proveedor

**Validaciones:**
- Si el email del proveedor ya existe en tu sistema con otra cuenta → vincular o mostrar error
- Si necesitas datos adicionales que el proveedor no da → pedirlos después del primer login
- Siempre ofrecer también login tradicional (email + contraseña) como alternativa

**Complejidad de implementación:** Media-Alta
**¿Lo necesitas?** Solo si quieres reducir fricción en el registro y tus usuarios son de múltiples países.

---

### 🔧 OPCIÓN: Verificación de Email

**¿Qué hace?**
Envía un email de confirmación después del registro para verificar que el correo es real y pertenece al usuario.

**¿Para qué tipo de negocio sirve?**
- ✅ Apps donde el email es crítico (recuperación, notificaciones, facturas)
- ✅ Apps que quieren evitar cuentas falsas
- ❌ Apps presenciales donde el registro lo hace un empleado (ej: recepcionista del gym registra al cliente)

**¿Cómo funciona en lenguaje simple?**
1. Usuario se registra normalmente
2. Sistema envía email con enlace de verificación
3. Usuario hace clic en el enlace
4. Sistema marca el email como "verificado"
5. Según configuración: el usuario puede usar la app antes de verificar (con funcionalidad limitada) o necesita verificar antes de hacer cualquier cosa

**Datos que necesita:**
- Flag en la cuenta: "email verificado" (sí/no)
- Token de verificación (enlace único temporal)

**Validaciones:**
- El enlace de verificación debe expirar (24-72 hrs típicamente)
- Permitir reenviar el email de verificación si no llegó
- Decidir qué puede hacer el usuario sin email verificado (todo, nada, o funciones limitadas)

**Complejidad de implementación:** Baja-Media
**¿Lo necesitas?** Solo si el email es parte importante de la experiencia y quieres evitar cuentas falsas.

---

### 🔧 OPCIÓN: Rate Limiting / Protección contra Fuerza Bruta

**¿Qué hace?**
Limita cuántas veces alguien puede intentar iniciar sesión o registrarse en un período de tiempo. Protege contra ataques automatizados.

**¿Para qué tipo de negocio sirve?**
- ✅ TODA app que esté expuesta a internet (básicamente todas)
- Especialmente importante para apps con datos sensibles (salud, finanzas)

**¿Cómo funciona en lenguaje simple?**
1. Sistema cuenta cuántos intentos de login fallidos ha tenido una IP o cuenta
2. Si supera el límite (ej: 5 intentos fallidos en 5 minutos) → bloquea temporalmente
3. Muestra mensaje: "Demasiados intentos. Espera X minutos antes de reintentar"
4. Después del tiempo de espera → permite intentar de nuevo
5. Aplica también al registro (evitar spam de cuentas) y a recuperación de contraseña

**Datos que necesita:**
- Contador de intentos fallidos por IP y/o por cuenta
- Tiempo de bloqueo (ej: 1 minuto, 5 minutos, 15 minutos con incremento progresivo)
- Límite de intentos antes del bloqueo

**Validaciones:**
- No bloquear la cuenta permanentemente (solo temporalmente)
- Reiniciar el contador después de un login exitoso
- Aplicar por IP Y por cuenta (para cubrir ambos vectores de ataque)

**Complejidad de implementación:** Baja-Media
**¿Lo necesitas?** SÍ. Es recomendado para toda app expuesta a internet. La pregunta es qué tan estricto hacerlo.

---

## 5. FLUJOS DE USUARIO COMPLETOS

Estos son los recorridos paso a paso de las acciones principales. Son genéricos y aplican a cualquier industria.

### Flujo: Usuario inicia sesión

1. Usuario abre la aplicación y ve la pantalla de login
2. **(Si hay multi-sede)** Selecciona la sede donde quiere entrar
3. Ingresa su identificador (email, RUT, username — según la app)
4. Ingresa su contraseña
5. Hace clic en "Entrar"
6. Sistema busca el identificador en la base de datos
7. Si no existe → muestra error genérico "Credenciales inválidas"
8. Si existe → compara la contraseña (encriptada)
9. Si la contraseña no coincide → muestra error genérico "Credenciales inválidas"
10. Si todo correcto → verifica si la cuenta está activa
11. Si la cuenta está inactiva → muestra "Cuenta deshabilitada"
12. Si la cuenta requiere cambio de contraseña → muestra modal de cambio forzado
13. Si todo OK → crea sesión y redirige según el rol:
    - Admin → Panel de Administración
    - Staff → Panel operativo (caja, agenda, etc.)
    - Cliente → Pantalla principal de usuario

### Flujo: Nuevo usuario se registra

1. Usuario hace clic en "Crear cuenta" desde la pantalla de login
2. Sistema muestra formulario de registro
3. Usuario ingresa los campos obligatorios (identificador, nombre, contraseña, contacto)
4. Opcionalmente completa campos adicionales (foto, documento, etc.)
5. Hace clic en "Registrarme"
6. Sistema valida que el identificador no esté duplicado
7. Si ya existe → muestra error específico ("Este email ya está registrado")
8. Sistema valida formato de todos los campos
9. Si algo es inválido → muestra error indicando qué campo corregir
10. Si todo válido → crea la cuenta
11. **(Si hay verificación de email)** Envía email de confirmación
12. Entra automáticamente a la aplicación
13. **(Si hay selección de sede)** Muestra selector de sede
14. Redirige a la pantalla principal

### Flujo: Usuario recupera contraseña

1. Usuario hace clic en "¿Olvidaste tu contraseña?" desde login
2. Sistema muestra campo para ingresar email (o RUT)
3. Usuario ingresa su dato y hace clic en "Enviar enlace"
4. Sistema busca la cuenta (sin revelar si existe o no)
5. Muestra SIEMPRE el mensaje: "Si existe una cuenta con estos datos, recibirás un enlace"
6. Si la cuenta existe → envía email con enlace de recuperación (token temporal)
7. Usuario abre el enlace desde su correo
8. Sistema valida que el token sea válido y no haya expirado
9. Si el token es inválido → muestra "Enlace inválido o expirado"
10. Si es válido → muestra pantalla para crear nueva contraseña
11. Usuario ingresa nueva contraseña (dos veces)
12. Si las contraseñas no coinciden → muestra error
13. Si coinciden y cumplen requisitos → contraseña actualizada
14. El token se invalida (no puede usarse de nuevo)
15. Usuario puede iniciar sesión con su nueva contraseña

### Flujo: Admin cambia de rol para probar la app

1. Admin inicia sesión normalmente
2. Ve en el menú un selector de rol (ej: desplegable con "Admin | Staff | Cliente")
3. Selecciona "Cliente" para ver la app como un cliente la ve
4. La interfaz cambia completamente a la vista de cliente
5. Puede navegar y probar todas las funciones desde esa perspectiva
6. Para volver, selecciona "Admin" en el mismo selector
7. La app vuelve a mostrar la interfaz completa de administración

---

## 6. CHECKLIST: ¿Qué características necesito?

Responde estas preguntas para saber qué activar en tu implementación.

### Sobre identificación
- [ ] ¿Tus usuarios se identifican con documento nacional (RUT, DNI, CURP)?
- [ ] ¿Es un requisito legal o del negocio usar ese documento?
→ Si alguna es SÍ → Activa **Login con Documento de Identidad**

### Sobre verificación visual
- [ ] ¿Necesitas identificar visualmente a los usuarios? (check-in, acceso presencial)
- [ ] ¿La foto del perfil agrega valor al servicio?
→ Si alguna es SÍ → Activa **Foto de Perfil con Cámara**

### Sobre migración
- [ ] ¿Estás migrando usuarios de un sistema anterior?
- [ ] ¿El admin crea cuentas para empleados con contraseñas temporales?
→ Si alguna es SÍ → Activa **Cambio de Contraseña Forzado**

### Sobre ubicaciones
- [ ] ¿Tu negocio tiene más de una sede/sucursal?
- [ ] ¿El contenido de la app cambia según la sede?
→ Si ambas son SÍ → Activa **Selección de Sede**

### Sobre roles
- [ ] ¿Tu app tiene 3 o más tipos de usuario diferentes?
- [ ] ¿Necesitas verificar cómo ve la app cada tipo de usuario?
→ Si ambas son SÍ → Activa **Cambio de Rol (Role Switching)**

### Sobre fricción de registro
- [ ] ¿Quieres que el registro sea lo más rápido posible?
- [ ] ¿Tus usuarios ya tienen cuentas de Google/Facebook/Apple?
→ Si ambas son SÍ → Activa **Login Social (OAuth)**

### Sobre calidad de datos
- [ ] ¿El email es crítico para tu servicio (facturas, notificaciones)?
- [ ] ¿Quieres evitar cuentas con emails falsos?
→ Si alguna es SÍ → Activa **Verificación de Email**

### Sobre seguridad
- [ ] ¿Tu app está expuesta a internet?
- [ ] ¿Manejas datos sensibles (salud, finanzas, datos personales)?
→ Si alguna es SÍ (casi siempre) → Activa **Rate Limiting**

---

## 7. PRESETS POR TIPO DE NEGOCIO

Configuraciones listas para copiar según tu industria.

### 📦 GYM / CENTRO DEPORTIVO

**Características activas:**
- ✅ Funciones core (login, registro, recuperación, logout, persistencia)
- ✅ RBAC con roles: admin, recepcionista, instructor, cliente
- ✅ Login con documento de identidad (RUT en Chile)
- ✅ Foto de perfil con cámara (para check-in visual)
- ✅ Cambio de contraseña forzado (si migras de sistema anterior)
- ✅ Selección de sede (si tienes más de una)
- ✅ Rate limiting
- ❌ Login social (clientes se identifican con RUT presencialmente)
- ❌ Verificación de email (registro lo hace el recepcionista o el cliente en persona)

**Ejemplo:** Gym en Chile donde los clientes se registran con RUT, se toman foto para el check-in, y el recepcionista usa la caja con su propia cuenta.

---

### 📦 CLÍNICA / CENTRO MÉDICO

**Características activas:**
- ✅ Funciones core
- ✅ RBAC con roles: admin, doctor/profesional, recepcionista, paciente
- ✅ Login con documento de identidad (RUT/pasaporte)
- ✅ Verificación de email (datos de salud requieren mayor seguridad)
- ✅ Rate limiting (datos sensibles)
- ✅ Selección de sede (si es cadena)
- ❌ Foto de perfil con cámara (no es relevante)
- ❌ Login social (pacientes se identifican con documento)
- ❌ Cambio de rol (pocos roles, no necesita simulación)

**Ejemplo:** Clínica donde los pacientes se registran con RUT o pasaporte, los doctores acceden a sus fichas, y el admin gestiona horarios y personal.

---

### 📦 SAAS / APP WEB

**Características activas:**
- ✅ Funciones core
- ✅ RBAC con roles: admin, miembro, usuario free
- ✅ Login social (Google, GitHub — menos fricción)
- ✅ Verificación de email (evitar cuentas falsas)
- ✅ Rate limiting
- ✅ Cambio de rol (admin prueba experiencia del usuario)
- ❌ Login con documento de identidad (email es suficiente)
- ❌ Foto de perfil con cámara (avatar opcional, no crítico)
- ❌ Selección de sede (todo es online)
- ❌ Cambio de contraseña forzado (usuarios crean su propia cuenta)

**Ejemplo:** SaaS donde los usuarios se registran con Google o email, tienen plan free o pagado, y el admin monitorea uso y configuración.

---

### 📦 E-COMMERCE / TIENDA ONLINE

**Características activas:**
- ✅ Funciones core
- ✅ RBAC con roles: admin, vendedor, comprador
- ✅ Login social (Google, Facebook — reducir fricción de compra)
- ✅ Verificación de email (confirmaciones de compra, facturas)
- ✅ Rate limiting
- ❌ Login con documento de identidad (email es suficiente)
- ❌ Foto de perfil (no relevante)
- ❌ Selección de sede (salvo marketplaces con tiendas físicas)
- ❌ Cambio de rol (pocos roles)

**Ejemplo:** Tienda online donde compradores se registran con Google o email, vendedores gestionan sus productos, y el admin supervisa todo.

---

### 📦 COWORKING

**Características activas:**
- ✅ Funciones core
- ✅ RBAC con roles: admin, recepcionista, miembro
- ✅ Foto de perfil con cámara (control de acceso presencial)
- ✅ Selección de sede (red de espacios)
- ✅ Rate limiting
- ✅ Login social (miembros tech-savvy)
- ❌ Login con documento de identidad (email es suficiente)
- ❌ Verificación de email (registro presencial)
- ❌ Cambio de contraseña forzado (usuarios crean su cuenta)

**Ejemplo:** Red de coworking donde los miembros se registran online, se toman foto para acceso, y pueden usar cualquier sede según su plan.

---

### 📦 APP EMPRESARIAL INTERNA

**Características activas:**
- ✅ Funciones core
- ✅ RBAC con roles: admin, gerente, supervisor, operador
- ✅ Cambio de contraseña forzado (admin crea cuentas con contraseña temporal)
- ✅ Cambio de rol (admin necesita probar vistas)
- ✅ Rate limiting
- ❌ Login social (cuentas corporativas, no personales)
- ❌ Login con documento (login con email corporativo)
- ❌ Foto de perfil (no relevante)
- ❌ Selección de sede (depende de la empresa)
- ❌ Verificación de email (el admin verifica al crear la cuenta)

**Ejemplo:** App interna de empresa donde el admin crea cuentas para empleados, cada uno con su rol y permisos según su cargo.

---

## 8. DATOS UNIVERSALES (Toda cuenta de usuario necesita esto)

| Dato | Qué es | Tipo | Ejemplo |
|------|--------|------|---------|
| Identificador único | Cómo se identifica en el sistema | Texto | Email, RUT, username |
| Nombre | Nombre para mostrar | Texto | "Juan Pérez González" |
| Contraseña | Clave de acceso (encriptada) | Texto encriptado | (no visible) |
| Rol | Tipo de usuario | Texto | "admin", "staff", "user" |
| Estado | Si la cuenta está activa | Booleano | Activa / Inactiva |
| Fecha de creación | Cuándo se registró | Fecha | 04/02/2026 |

---

## 9. DATOS OPCIONALES (Según características activas)

| Dato | Para qué sirve | Tipo | Activar si... |
|------|----------------|------|---------------|
| Email | Recuperación, notificaciones | Texto | Casi siempre obligatorio |
| Teléfono | Contacto, SMS | Texto | Necesitas contacto directo |
| Documento de identidad | Identificación legal | Texto | Login con documento |
| Tipo de documento | Distinguir RUT de pasaporte | Texto | Múltiples tipos de documento |
| Foto de perfil | Identificación visual | Imagen | Check-in visual, redes |
| Fecha de nacimiento | Edad, personalización | Fecha | Verificación de edad |
| Sexo/Género | Personalización, reportes | Texto | Datos demográficos |
| Dirección | Envíos, localización | Texto | E-commerce, servicios a domicilio |
| Email verificado | Si confirmó su correo | Booleano | Verificación de email activa |
| Requiere cambio contraseña | Si debe cambiar al entrar | Booleano | Migración o cuentas temporales |
| Sedes con acceso | A qué sedes puede entrar | Lista | Multi-sede |
| Sede de trabajo | Sede asignada (staff) | Texto | Staff con sede fija |
| Roles simulables | Qué roles puede probar | Lista | Role switching |
| Proveedor OAuth | Con qué servicio se registró | Texto | Login social |
| Token de sesión | Sesión activa | Texto | Persistencia |
| Intentos fallidos | Contador de login fallido | Número | Rate limiting |

---

## 10. INTEGRACIONES CON OTROS MÓDULOS

Este módulo se conecta con prácticamente TODO en tu sistema. Aquí están las conexiones más comunes.

### Con Módulo de Planes / Suscripciones
- Al iniciar sesión → verificar si el usuario tiene membresía activa
- Al comprar un plan → vincularlo al usuario autenticado
- Filtrar planes disponibles según la sede seleccionada

### Con Módulo de Pagos
- Las transacciones se registran bajo el usuario autenticado
- Staff necesita autenticarse para operar la caja/POS
- Se registra quién realizó cada venta

### Con Módulo de Check-in / Control de Acceso
- El check-in requiere sesión activa
- Se usa el ID del usuario para registrar asistencia
- La foto de perfil se usa para verificación visual

### Con Módulo de Reservas / Agenda
- Las reservas se vinculan al usuario autenticado
- Profesionales solo ven reservas de sus propios clientes
- Se verifica que el usuario tenga sesiones disponibles

### Con Módulo de Notificaciones
- El email verificado se usa para enviar notificaciones
- El teléfono se usa para SMS/WhatsApp
- Las preferencias de notificación se guardan por usuario

### Con Módulo de Reportes / Analytics
- Los reportes se filtran según el rol del usuario
- Admin ve todo, staff ve lo de su sede, cliente ve lo suyo
- Se registra quién generó cada reporte

### Con Módulo de Administración de Usuarios
- Admin puede crear, editar, desactivar y eliminar cuentas
- Puede asignar roles y permisos
- Puede forzar cambio de contraseña
- Puede ver el historial de acceso de cada usuario

---

## 11. CASOS ESPECIALES / EXCEPCIONES

Situaciones que van a pasar y el sistema debe manejar correctamente.

**¿Qué pasa si alguien intenta iniciar sesión con credenciales incorrectas muchas veces?**
Si tienes rate limiting activo → se bloquea temporalmente con mensaje "Demasiados intentos". Si no → debería haber un límite básico para evitar ataques de fuerza bruta.

**¿Qué pasa si el usuario cierra el navegador sin cerrar sesión?**
La sesión se mantiene guardada en el dispositivo. Al volver a abrir la app, el usuario sigue autenticado hasta que el token expire.

**¿Qué pasa si dos personas usan la misma cuenta al mismo tiempo?**
Depende de tu política: puedes permitir sesiones simultáneas (más simple) o invalidar la sesión anterior cuando se inicia una nueva (más seguro). Decidir según el nivel de seguridad que necesitas.

**¿Qué pasa si el enlace de recuperación de contraseña ya fue usado?**
El token se invalida después del primer uso. Si intenta usarlo de nuevo → muestra "Enlace inválido o expirado". Debe solicitar uno nuevo.

**¿Qué pasa si el enlace de recuperación expiró?**
Mismo mensaje: "Enlace inválido o expirado". El usuario debe solicitar uno nuevo. Típicamente los enlaces duran entre 30 minutos y 24 horas.

**¿Qué pasa si un staff intenta acceder a una sede donde no trabaja?**
Si tiene sede restringida → el sistema bloquea el cambio y muestra mensaje. Si tiene acceso a múltiples sedes → puede cambiar libremente.

**¿Qué pasa si el usuario se registra con email que ya existe pero con otro proveedor OAuth?**
Opciones: vincular automáticamente ambos métodos a la misma cuenta (más conveniente) o mostrar error pidiendo que use el método original (más seguro). Decidir según tu caso.

**¿Qué pasa si hay un error de conexión durante el login?**
Mostrar error genérico de conexión. No crear ninguna sesión parcial. El usuario debe reintentar.

**¿Qué pasa si el usuario tiene cuenta pero está marcada como inactiva?**
No puede iniciar sesión. Mostrar mensaje: "Tu cuenta está deshabilitada. Contacta al administrador." No revelar más detalles.

**¿Qué pasa con usuarios extranjeros que no tienen documento nacional?**
Si tu app acepta pasaportes → tratar el pasaporte como identificador alternativo sin validación de formato nacional. Si no → usar email como identificador principal.

---

## 12. SEGURIDAD — REGLAS QUE NUNCA SE NEGOCIAN

Estas reglas son obligatorias sin importar tu tipo de negocio. Saltártelas es un riesgo de seguridad grave.

### Contraseñas
- NUNCA guardar contraseñas en texto plano → siempre encriptar (bcrypt, argon2, scrypt)
- Mínimo 6 caracteres (recomendado 8+)
- No mostrar la contraseña mientras se escribe (campo tipo "password")
- Permitir ver/ocultar contraseña con botón de "ojito"

### Mensajes de error
- NUNCA decir "este email no existe" o "contraseña incorrecta" por separado
- Usar mensajes genéricos: "Credenciales inválidas" (no revelar cuál dato es el incorrecto)
- En recuperación de contraseña SIEMPRE decir "si existe una cuenta, recibirás un enlace" (no confirmar ni negar la existencia de la cuenta)

### Tokens y sesiones
- Los tokens de sesión deben tener fecha de expiración
- Los tokens de recuperación de contraseña deben ser de un solo uso
- Los tokens deben ser suficientemente largos y aleatorios (imposibles de adivinar)
- NUNCA poner datos sensibles dentro del token visible

### Transmisión de datos
- SIEMPRE usar HTTPS (nunca HTTP para login o datos sensibles)
- Las contraseñas se envían encriptadas al servidor
- Los tokens de sesión van en headers seguros, no en la URL

### Protección contra ataques
- Rate limiting en login, registro y recuperación (limitar intentos por IP/cuenta)
- Protección contra CSRF (Cross-Site Request Forgery)
- Sanitizar todos los inputs del usuario (prevenir inyección de código)

---

## 13. EJEMPLO COMPLETO: Aplicando el Boilerplate

### Escenario: App para Gym "PowerFit"

**Contexto:** Gym mediano en Chile, una sede, con recepción, instructores y clientes. Migra desde un sistema antiguo con Excel.

**Decisiones del dueño:**
- Los clientes se identifican con RUT (es presencial)
- Quiero foto de perfil para el check-in
- Tengo usuarios del sistema antiguo que necesitan cambiar contraseña
- Solo una sede, no necesito selector
- Roles: admin (yo), recepcionista (2 personas), instructores (3), clientes (~200)
- No necesito login social
- Quiero protección básica contra ataques

**Configuración activada:**
```
✅ Funciones Core (login, registro, recuperación, logout, persistencia)
✅ RBAC (admin, recepcionista, instructor, cliente)
✅ Login con RUT chileno
✅ Foto de perfil con cámara
✅ Cambio de contraseña forzado (migración)
✅ Rate limiting básico
❌ Selección de sede (una sola)
❌ Login social
❌ Verificación de email
❌ Cambio de rol
```

**Roles configurados:**

| Rol | Ve | Puede hacer |
|-----|-----|-------------|
| Admin | Todo | Todo: gestionar usuarios, planes, reportes, configuración |
| Recepcionista | Caja, lista de clientes | Registrar pagos, check-in manual, ver membresías |
| Instructor | Sus clases, sus alumnos | Ver asistencia, asignar rutinas, notas de alumnos |
| Cliente | Su perfil, tienda, reservas | Comprar plan, reservar clases, ver membresía, check-in |

**Datos de registro (formulario del cliente):**
- RUT (obligatorio, con validación de dígito verificador)
- Nombre completo (obligatorio)
- Sexo (obligatorio)
- Email (obligatorio)
- Teléfono (obligatorio)
- Contraseña (obligatorio, mínimo 6 caracteres)
- Foto de perfil (opcional, con cámara)

**Plan de migración:**
1. Importar los ~200 clientes del Excel al sistema nuevo
2. Asignar contraseña temporal a cada uno (ej: los últimos 4 dígitos del RUT)
3. Marcar todas las cuentas con flag "requiere cambio de contraseña"
4. Cuando cada cliente inicie sesión por primera vez → forzar cambio
5. Las cuentas de recepcionistas e instructores se crean manualmente por el admin

---

## 14. CÓMO USAR ESTE BOILERPLATE

Este documento sirve para tres cosas:

**1. Entender qué necesitas implementar.**
Lee las funciones core y las opcionales. Usa la checklist de la sección 6 para decidir qué activar.

**2. Explicarle a un desarrollador (o a una IA como Claude Code) qué construir.**
Copia las secciones relevantes y úsalas como contexto. El lenguaje natural es lo suficientemente claro para que cualquier herramienta de desarrollo entienda qué hacer.

**3. Adaptar a tu industria específica.**
Usa los presets de la sección 7 como punto de partida. Modifica según tus necesidades.

**Lo que NO contiene este documento:** Código, nombres de archivos, estructura de base de datos, ni endpoints de API. Solo concepto puro. La implementación técnica depende de tu stack y se resuelve en otro documento.

---

> **Documento creado por WipXap SpA**
> Basado en experiencia real de implementación en proyectos con múltiples roles y autenticación.
> Diseñado para ser reutilizable en cualquier aplicación que necesite sistema de usuarios.
