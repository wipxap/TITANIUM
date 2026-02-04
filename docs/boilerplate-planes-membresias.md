# MÓDULO: SISTEMA DE PLANES Y MEMBRESÍAS — BOILERPLATE

> **Tipo:** Boilerplate de concepto en lenguaje natural
> **Versión:** 1.0 | **Fecha:** 04/02/2026
> **Origen:** Extraído y generalizado desde módulo de planes de proyecto gym real (CEMSA)
> **Uso:** Guía para implementar un sistema de planes/membresías en CUALQUIER negocio con suscripciones
> **Contiene código:** NO — solo concepto puro

---

## 1. ¿QUÉ ES ESTE MÓDULO?

Un sistema de planes permite que un negocio ofrezca diferentes tipos de suscripciones o membresías que los clientes pueden comprar para acceder a servicios por un período de tiempo determinado.

Piensa en esto como el "menú" de tu negocio: así como un restaurante tiene platos con diferentes precios, tu negocio tiene planes con diferentes características. Algunos son más baratos pero con menos beneficios, otros son premium con acceso total. El cliente elige el que le conviene, paga, y obtiene acceso según las reglas de ese plan.

Este módulo es el corazón comercial de cualquier negocio basado en suscripciones. Sin él, no hay forma de vender acceso a tus servicios de manera organizada.

**Ejemplos reales de cómo se usa:**

- **Gimnasio:** Plan Mensual ($29.990), Plan Trimestral ($79.990), Pase Día ($5.000)
- **Clínica:** Paquete 5 consultas ($150.000), Paquete 10 consultas ($250.000)
- **Coworking:** Plan Diurno ($89.000/mes), Plan 24/7 ($150.000/mes)
- **Streaming:** Plan Básico ($5.990), Plan Premium ($11.990), Plan Familiar ($17.990)
- **Spa:** Membresía Relax 8 sesiones ($200.000), Membresía VIP Ilimitada ($350.000)

---

## 2. FUNCIONES CORE (Las que TODO negocio necesita)

Estas funciones son obligatorias. Sin ellas, el módulo no funciona. No importa si eres un gym, una clínica o un SaaS — las necesitas todas.

### 2.1 Ver planes disponibles

**Qué hace:** Muestra al público la lista de planes que pueden comprar, organizados de forma clara.

**Quién la usa:**
- Clientes → en la tienda/catálogo público
- Administradores → en el panel de gestión

**Qué muestra:** Nombre del plan, precio, duración y un resumen de qué incluye.

**Ejemplos por industria:**
- **Gym:** Pestañas con "Mensual", "Trimestral", "Semestral", "Promociones"
- **Clínica:** Tarjetas con "Paquete Básico", "Paquete Premium", "Consulta Individual"
- **Coworking:** Tabla comparativa con "Escritorio Flexible", "Escritorio Fijo", "Oficina Privada"
- **Streaming:** Página de planes con columnas "Básico", "Estándar", "Premium"

**Filtros opcionales:** Por categoría, por tipo de servicio, por rango de precio.

---

### 2.2 Crear un plan nuevo

**Qué hace:** Permite al administrador agregar un nuevo tipo de membresía al sistema con todas sus configuraciones.

**Quién la usa:** Solo administradores.

**Datos que TODO plan necesita (obligatorios):**

| Dato | Qué es | Ejemplo |
|------|--------|---------|
| Nombre | Cómo se llama el plan | "Plan Gold Mensual" |
| Precio | Cuánto cuesta (número entero, sin decimales) | 49990 |
| Duración | Cuántos días dura | 30 |
| Activo | Si se muestra en la tienda o no | Sí / No |

**Datos opcionales** (según las características que actives — ver sección 3).

**Validaciones obligatorias:**
- El precio no puede ser cero ni negativo
- La duración no puede ser menor a 1 día
- El nombre no puede estar vacío

**Ejemplos por industria:**
- **Gym:** Admin crea "Plan Matutino" → $19.990, 30 días, horario 6am-2pm
- **Clínica:** Admin crea "Paquete 5 Consultas" → $150.000, 180 días, 5 sesiones
- **Coworking:** Admin crea "Plan Weekday" → $89.000, 30 días, lunes a viernes
- **Streaming:** Admin crea "Plan Familiar" → $17.990, 30 días, 4 perfiles

---

### 2.3 Editar un plan existente

**Qué hace:** Modifica las características de un plan que ya existe (precio, nombre, restricciones, etc.).

**Quién la usa:** Solo administradores.

**Regla importante:** Los clientes que ya compraron el plan con las reglas anteriores NO se ven afectados. Sus membresías siguen con las condiciones que tenían al momento de comprar. Los cambios solo aplican para compras nuevas.

---

### 2.4 Activar o desactivar un plan

**Qué hace:** Oculta o muestra un plan en la tienda pública. Es como un interruptor de encendido/apagado.

**Quién la usa:** Solo administradores.

**Cómo funciona:**
1. Admin ve la lista de planes, cada uno con un interruptor (toggle)
2. Si está encendido → el plan aparece en la tienda y los clientes pueden comprarlo
3. Si está apagado → el plan desaparece de la tienda, nadie puede comprarlo
4. El cambio es inmediato, no necesita guardar nada extra
5. Los clientes que ya tienen ese plan activo NO son afectados

**¿Para qué sirve?** Para pausar temporalmente un plan sin eliminarlo. Por ejemplo, una promoción de verano que solo quieres mostrar en enero y febrero.

---

### 2.5 Eliminar un plan

**Qué hace:** Borra permanentemente un plan del sistema.

**Quién la usa:** Solo administradores.

**Regla crítica:** Los clientes que ya compraron ese plan MANTIENEN su membresía activa hasta que venza. El plan solo desaparece para compras futuras.

**¿Cuándo usar eliminar vs desactivar?**
- **Desactivar:** Cuando quieres pausar temporalmente (ej: promoción de temporada)
- **Eliminar:** Cuando el plan ya no va a existir nunca más (ej: plan descontinuado)

---

### 2.6 Comprar / Activar un plan

**Qué hace:** Permite que un cliente adquiera una membresía pagando por ella.

**Quién la usa:** Clientes registrados.

**Flujo universal (paso a paso):**
1. Cliente ve los planes disponibles en la tienda
2. Selecciona el plan que quiere
3. Elige cuándo quiere que empiece su membresía (hoy o fecha futura)
4. Sistema calcula precio final (con descuentos si aplican)
5. Cliente paga
6. Si el pago es exitoso → la membresía se activa
7. Si el pago falla → se muestra error y puede reintentar

**Variaciones de pago según industria:**
- **Con pago online:** WebPay (Chile), Stripe, MercadoPago, PayPal → el sistema redirige a la pasarela de pago y espera confirmación
- **Con pago presencial:** Efectivo, tarjeta por POS, transferencia → el personal de recepción registra el pago manualmente
- **Con aprobación manual:** Para planes corporativos B2B → cliente solicita, admin aprueba, se factura después

---

### 2.7 Ver mi membresía activa

**Qué hace:** Muestra al cliente toda la información de su plan actual en una tarjeta visual.

**Quién la usa:** Clientes con membresía activa.

**Qué muestra:**
- Nombre del plan que tiene
- Días restantes antes de que venza
- Sesiones disponibles (si aplica)
- Horarios permitidos (si aplica)
- Estado (activa, por vencer, vencida)
- Códigos familiares (si aplica)

**Ejemplos por industria:**
- **Gym:** Tarjeta con "Plan Gold — 18 días restantes — Check-in habilitado"
- **Clínica:** "Paquete Premium — 3 consultas disponibles de 5"
- **Coworking:** "Plan Diurno — Acceso 9am-6pm — Vence 15 de marzo"
- **Streaming:** "Plan Familiar — 2 de 4 perfiles en uso — Renueva el 28"

---

## 3. CARACTERÍSTICAS OPCIONALES (Módulos que se activan/desactivan)

Estas son funciones que puedes activar o no según tu tipo de negocio. No todas aplican para todos. Lee cada una y decide si la necesitas usando la checklist de la sección 5.

---

### 🔧 OPCIÓN: Sistema de Descuentos por Lealtad

**¿Qué hace?**
Premia a clientes que han sido recurrentes por cierto tiempo con descuentos en su próxima compra. Mientras más tiempo lleva un cliente contigo, mejor precio obtiene al renovar.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con clientes recurrentes (gyms, clínicas con paquetes, suscripciones)
- ❌ Negocios de compra única (eventos, cursos cortos, entradas)

**¿Cómo funciona en lenguaje simple?**
1. Cliente compra un plan
2. El sistema empieza a contar cuántos días lleva siendo cliente activo
3. Cuando va a comprar de nuevo (renovar), el sistema revisa cuántos días lleva
4. Si lleva más de X días → obtiene Y% de descuento automático
5. Mientras más días lleve, mayor el descuento

**Ejemplo concreto:**
- 30 días de cliente continuo → 5% descuento
- 90 días de cliente continuo → 10% descuento
- 180 días de cliente continuo → 15% descuento
- 365 días de cliente continuo → 20% descuento

**Ejemplos por industria:**
- **Gym:** "Llevas 3 meses con nosotros, tu renovación tiene 10% off"
- **Clínica:** "Paciente frecuente obtiene 15% en próximo paquete de consultas"
- **Streaming:** "Suscriptor por 1 año obtiene 2 meses gratis"
- **Coworking:** "6 meses continuo = upgrade a plan superior al mismo precio"

**Datos que necesita guardar:**
- Cuántos días lleva siendo cliente activo
- Niveles de descuento (tabla: X días → Y% descuento)
- Si el descuento es porcentaje O precio fijo especial (uno de los dos)
- Si este plan específico cuenta para acumular lealtad (flag)
- Período de gracia para clientes nuevos (cuántos días esperar antes de dar descuento)

**Validaciones:**
- Si es cliente nuevo → no aplica descuento hasta completar período de gracia (evita que alguien se registre solo por el descuento)
- Si dejó de ser cliente por un tiempo → decidir si el contador se resetea o se mantiene (regla de negocio configurable)
- Si compra un plan que no activa lealtad (ej: pase diario) → no cuenta para el acumulado
- Al crear plan con lealtad → debe especificar porcentaje O precio fijo, no ambos

**Complejidad de implementación:** Media
**¿Lo necesitas?** Solo si quieres premiar clientes recurrentes y fomentar que renueven.

---

### 🔧 OPCIÓN: Restricciones de Horario

**¿Qué hace?**
Limita en qué horarios el cliente puede usar el servicio según su plan. Permite ofrecer planes más baratos con horario limitado.

**¿Para qué tipo de negocio sirve?**
- ✅ Servicios con horarios diferenciados (gyms, coworking, salas de ensayo, canchas)
- ❌ Servicios 24/7 sin restricciones (streaming, SaaS, apps online)

**¿Cómo funciona en lenguaje simple?**
1. Al crear un plan, el admin define horario permitido (ej: 6:00 a 14:00)
2. Cliente compra ese plan
3. Cuando intenta acceder al servicio, el sistema revisa la hora actual
4. Si está dentro del horario → acceso permitido
5. Si está fuera del horario → acceso denegado con mensaje claro

**Ejemplos por industria:**
- **Gym:** Plan Matutino (6am-2pm) $19.990 vs Plan Full (todo el día) $29.990
- **Coworking:** Plan Diurno (9am-6pm) $89.000 vs Plan 24/7 $150.000
- **Sala de Ensayo:** Plan Económico (10am-4pm lunes a viernes) $50.000
- **Cancha Deportiva:** Plan Off-Peak (antes de 5pm) $30.000/mes

**Datos que necesita:**
- Hora de inicio permitida (formato HH:MM)
- Hora de fin permitida (formato HH:MM)

**Validaciones:**
- Al intentar acceso (check-in, reserva, entrada) → verificar hora actual vs restricción del plan
- Mostrar mensaje claro al cliente: "Tu plan solo permite acceso de 6:00 a 14:00"
- Si el plan NO tiene horario configurado → acceso sin restricción horaria

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Solo si ofreces planes diferenciados por horario para tener opciones más baratas.

---

### 🔧 OPCIÓN: Restricciones por Día de la Semana

**¿Qué hace?**
Limita en qué días de la semana el cliente puede usar el servicio según su plan.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con demanda diferenciada por día (gyms, cines, restaurantes, canchas)
- ❌ Servicios online 24/7 sin distinción de días

**¿Cómo funciona en lenguaje simple?**
1. Al crear un plan, el admin selecciona qué días permite (ej: solo lunes a viernes)
2. Cliente compra ese plan
3. Si intenta acceder un día no permitido → acceso denegado
4. Mensaje: "Tu plan solo permite acceso de lunes a viernes"

**Ejemplos por industria:**
- **Gym:** Plan Fin de Semana (solo sábado-domingo) → más barato
- **Cine:** Plan Entre Semana (lunes a jueves) → precio reducido
- **Coworking:** Plan Weekday (lunes a viernes) → estándar
- **Cancha:** Plan Semana (lunes a viernes, sin fines de semana que son más caros)

**Datos que necesita:**
- Lista de días permitidos usando números: 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado, 7=domingo
- Ejemplo: [1, 2, 3, 4, 5] = lunes a viernes

**Validaciones:**
- Al intentar acceso → verificar día actual vs días permitidos
- Si el plan NO tiene días configurados → acceso todos los días

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Solo si diferencias planes por días de la semana.

---

### 🔧 OPCIÓN: Sistema de Sesiones Limitadas

**¿Qué hace?**
Limita cuántas veces puede usar el servicio según el plan comprado. Cada uso descuenta una sesión. Cuando llega a cero, no puede usar más hasta que se liberen nuevas sesiones.

**¿Para qué tipo de negocio sirve?**
- ✅ Servicios con visitas/usos contables (clases grupales, consultas, reservas de sala, masajes)
- ❌ Servicios de acceso ilimitado (gym con acceso libre, streaming)

**¿Cómo funciona en lenguaje simple?**
1. Plan define: "12 sesiones por período"
2. Cliente compra el plan → empieza con 12 sesiones disponibles
3. Cada vez que usa el servicio → se descuenta 1 sesión
4. Cuando llega a 0 → no puede usar más
5. Cada X días (ej: cada 30 días) se liberan nuevas sesiones automáticamente
6. Si las sesiones totales del plan son 0 → significa ilimitado

**Ejemplos por industria:**
- **Gym:** Plan con 12 clases grupales por mes (acceso libre al gym, pero solo 12 clases dirigidas)
- **Clínica:** Paquete de 6 consultas médicas (válido por 180 días)
- **Spa:** Membresía con 8 masajes incluidos en trimestre
- **Coworking:** 10 días de sala de reuniones por mes (escritorio ilimitado, sala limitada)

**Datos que necesita:**
- Sesiones totales del plan (0 = ilimitado)
- Sesiones que se liberan cada período (ej: 12 cada 30 días)
- Sesiones consumidas por el usuario (se va actualizando)
- Fecha de próxima liberación de sesiones

**Validaciones:**
- Si sesiones disponibles = 0 → no puede reservar/acceder, mostrar mensaje: "No tienes sesiones disponibles. Próxima liberación: [fecha]"
- Al completar período → agregar sesiones automáticamente
- Decidir si las sesiones no usadas se acumulan o se pierden (regla de negocio configurable)
- Cuando se liberan sesiones → notificar al usuario

**Complejidad de implementación:** Media
**¿Lo necesitas?** Solo si quieres limitar el uso por cantidad en vez de (o además de) tiempo.

---

### 🔧 OPCIÓN: Planes Familiares / Beneficiarios

**¿Qué hace?**
Permite que un titular comparta su plan con otras personas (familiares, equipo, etc.) generando códigos únicos de invitación.

**¿Para qué tipo de negocio sirve?**
- ✅ Servicios que se usan en grupo (gyms, streaming, seguros, SaaS empresarial)
- ❌ Servicios estrictamente personales (terapia individual, coaching 1:1, consulta médica)

**¿Cómo funciona en lenguaje simple?**
1. Admin crea un plan marcado como "familiar" con máximo X beneficiarios
2. Cliente compra el plan familiar
3. En su perfil aparece opción "Códigos Familiares"
4. Genera códigos únicos tipo "FAM-ABC123" (uno por beneficiario)
5. Comparte el código con su familiar/compañero
6. El beneficiario se registra en la app usando ese código
7. Obtiene membresía vinculada al plan del titular
8. Solo el titular paga

**Ejemplos por industria:**
- **Gym:** Plan Familiar (titular + 3 familiares) → todos pueden ir al gym
- **Streaming:** Plan que permite 4 perfiles → cada miembro tiene su perfil
- **Seguro:** Póliza familiar → cubre al titular y sus dependientes
- **SaaS:** Plan Empresa con 5 usuarios incluidos → cada empleado tiene su cuenta

**Datos que necesita:**
- Máximo de beneficiarios permitidos por plan
- Códigos únicos generados (uno por beneficiario)
- Relación entre titular y cada beneficiario
- Estado de cada beneficiario (activo/inactivo)

**Validaciones:**
- No puede agregar más beneficiarios del máximo permitido
- Si el titular cancela su plan → todos los beneficiarios pierden acceso automáticamente
- Los códigos deben ser únicos y de un solo uso
- Un beneficiario no puede ser titular de otro plan familiar al mismo tiempo (opcional, según regla de negocio)

**Complejidad de implementación:** Media-Alta
**¿Lo necesitas?** Solo si tu modelo de negocio permite compartir acceso entre varias personas bajo un solo pago.

---

### 🔧 OPCIÓN: Contratos Digitales con Firma

**¿Qué hace?**
Requiere que el cliente lea y firme digitalmente un contrato antes de poder activar su plan. Se guarda la firma como imagen junto con la compra.

**¿Para qué tipo de negocio sirve?**
- ✅ Servicios con compromiso legal (gyms, clínicas, seguros, alquiler de equipos)
- ❌ Compras simples sin términos complejos (streaming, tienda online)

**¿Cómo funciona en lenguaje simple?**
1. Admin asocia un contrato a un plan específico
2. Cliente selecciona el plan y antes de pagar → el sistema muestra el contrato completo
3. Cliente debe hacer scroll hasta el final para poder aceptar (no puede saltarse la lectura)
4. Firma con el dedo en la pantalla (móvil) o con el mouse (computador)
5. La firma se guarda como imagen junto con fecha, hora e IP del firmante
6. Solo después de firmar puede proceder al pago
7. Sin firma = no puede comprar

**Ejemplos por industria:**
- **Gym:** Contrato de responsabilidad por lesiones y uso de instalaciones
- **Clínica:** Consentimiento informado para tratamientos o procedimientos
- **Seguro:** Póliza con todos los términos legales
- **Alquiler de Equipos:** Responsabilidad por daños o pérdida del equipo

**Datos que necesita:**
- Texto completo del contrato (puede ser diferente por plan)
- Firma digital guardada como imagen
- Fecha y hora exacta de la firma
- IP del firmante (para validez legal)
- Identificador que relaciona la firma con la compra

**Validaciones:**
- No puede comprar sin firmar primero
- La firma debe ser mínimamente válida (no solo un punto o una línea recta)
- El contrato debe mostrarse completo (obligar scroll hasta el final antes de habilitar el botón de firma)
- Si el contrato del plan cambia → los clientes existentes no se ven afectados, pero nuevas compras usan el contrato actualizado

**Complejidad de implementación:** Media
**¿Lo necesitas?** Solo si legalmente necesitas respaldo firmado antes de dar acceso al servicio.

---

### 🔧 OPCIÓN: Pases de Un Solo Día / Uso Único

**¿Qué hace?**
Permite vender acceso por un solo uso o un solo día, en vez de una membresía recurrente. Ideal para visitantes ocasionales o personas que quieren probar antes de comprometerse.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios que permiten "prueba" o visitas ocasionales (gyms, coworking, museos, parques)
- ❌ Servicios solo por suscripción sin opción de prueba

**¿Cómo funciona en lenguaje simple?**
1. Admin crea un plan marcado como "pase diario" con duración de 1 día
2. Cliente compra el pase
3. Tiene acceso solo por ese día específico (o solo por esa sesión)
4. Al día siguiente el pase expira automáticamente
5. Si quiere volver, debe comprar otro pase o una membresía

**Ejemplos por industria:**
- **Gym:** Pase Día ($5.000) para probar las instalaciones antes de inscribirse
- **Coworking:** Día de escritorio individual ($15.000) para freelancers ocasionales
- **Museo:** Entrada por visita única ($8.000)
- **Parque acuático:** Entrada del día ($25.000)

**Datos que necesita:**
- Flag que marca el plan como "pase diario"
- Fecha exacta de uso
- Opcionalmente: a qué servicios/áreas específicas da acceso (ej: solo ciertas clases)

**Validaciones:**
- Los pases diarios NO cuentan para acumular lealtad (evita que alguien compre pases solo para obtener descuentos)
- Expira al final del día seleccionado (o después de la sesión, según configuración)
- No genera códigos familiares
- Puede tener un límite de cuántos pases puede comprar una misma persona (opcional)

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Solo si permites visitas ocasionales o quieres ofrecer una forma de "probar" tu servicio.

---

### 🔧 OPCIÓN: Multi-Sede / Cadenas

**¿Qué hace?**
Permite que un plan dé acceso a múltiples ubicaciones físicas de la misma empresa, o que limite el acceso solo a una sede específica.

**¿Para qué tipo de negocio sirve?**
- ✅ Cadenas con varias sucursales (gyms, coworking, clínicas, restaurantes)
- ❌ Negocio con una sola ubicación

**¿Cómo funciona en lenguaje simple?**
1. Admin define las sedes disponibles en el sistema
2. Al crear un plan, selecciona a qué sedes da acceso
3. Plan puede ser "solo mi sede", "sedes seleccionadas" o "todas las sedes"
4. Cuando el cliente intenta acceder en una sede → sistema verifica si su plan lo permite
5. Si la sede está en la lista → acceso permitido
6. Si no está → acceso denegado con mensaje claro

**Ejemplos por industria:**
- **Gym:** Plan Gold = todas las sedes ($49.990), Plan Basic = solo tu sede ($29.990)
- **Coworking:** Plan Global = acceso a toda la red ($200.000), Plan Local = solo una oficina ($89.000)
- **Clínica:** Consultas en cualquier sucursal de la cadena vs solo en la más cercana

**Datos que necesita:**
- Lista de sedes existentes en el sistema
- Lista de sedes permitidas por cada plan
- Sede actual donde el cliente intenta acceder

**Validaciones:**
- Al intentar acceso → verificar si la sede actual está en la lista de sedes permitidas del plan
- Si el plan no tiene sedes configuradas → acceso a todas (default)

**Complejidad de implementación:** Media-Alta
**¿Lo necesitas?** Solo si tienes o planeas tener múltiples ubicaciones físicas.

---

### 🔧 OPCIÓN: Límite de Compras por Usuario

**¿Qué hace?**
Restringe cuántas veces un mismo usuario puede comprar un plan específico. Útil para promociones limitadas.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con promociones especiales o precios de lanzamiento
- ❌ Negocios donde el cliente puede renovar ilimitadamente

**¿Cómo funciona en lenguaje simple?**
1. Admin crea un plan con límite de compras (ej: "máximo 2 por persona")
2. Cliente compra el plan la primera vez → OK
3. Compra la segunda vez → OK
4. Intenta comprar la tercera vez → botón deshabilitado con mensaje "Ya alcanzaste el límite de compras para este plan"

**Ejemplos por industria:**
- **Gym:** Promo "Primer Mes a $9.990" → solo 1 vez por persona
- **Clínica:** Paquete de Bienvenida → máximo 1 por paciente nuevo
- **Coworking:** Día de Prueba Gratis → 1 por usuario

**Datos que necesita:**
- Límite máximo de compras por usuario para ese plan
- Contador de cuántas veces ha comprado ese usuario ese plan

**Validaciones:**
- Si alcanzó el límite → deshabilitar botón de compra
- Mostrar mensaje claro explicando por qué no puede comprar

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Solo si tienes promociones que no quieres que se abusen.

---

## 4. FLUJOS DE USUARIO COMPLETOS

Estos son los recorridos paso a paso de las acciones principales. Son genéricos y aplican a cualquier industria.

### Flujo: Administrador crea un nuevo plan

1. Admin entra al panel de administración
2. Hace clic en "Planes" en el menú lateral
3. Hace clic en el botón "Nuevo Plan"
4. Sistema muestra formulario con campos para llenar
5. Admin ingresa los datos obligatorios: nombre, precio, duración
6. Opcionalmente configura las características activas (sesiones, horarios, lealtad, etc.)
7. Hace clic en "Guardar"
8. Sistema valida que todos los campos obligatorios estén completos y sean válidos
9. Si todo correcto → guarda el plan y muestra mensaje de éxito
10. Si falta algo → muestra error indicando qué campo falta o es inválido
11. El plan aparece inmediatamente en la lista de planes del admin
12. Si está marcado como activo → también aparece en la tienda pública

### Flujo: Cliente compra un plan

1. Cliente inicia sesión en la aplicación
2. Va a la tienda/catálogo de planes
3. Sistema muestra planes disponibles organizados por categorías
4. Cliente selecciona un plan haciendo clic en él
5. Sistema muestra ventana con detalle del plan y opción de elegir fecha de inicio
6. Cliente elige cuándo quiere que empiece su membresía
7. **Si el plan tiene contrato asociado** (característica opcional activada):
   - Sistema muestra el contrato completo
   - Cliente debe leer (scroll obligatorio hasta el final)
   - Cliente firma digitalmente
8. Sistema calcula el precio final (aplicando descuento por lealtad si corresponde)
9. Cliente ve el resumen: plan, precio, fecha inicio, duración
10. Cliente hace clic en "Pagar"
11. Sistema redirige a la pasarela de pago (WebPay, Stripe, etc.)
12. Cliente ingresa datos de pago y confirma
13. Si pago exitoso → sistema crea la membresía y muestra confirmación
14. Si pago falla → muestra error con opción de reintentar
15. Cliente ve su nueva membresía en la pantalla principal

### Flujo: Administrador activa/desactiva un plan

1. Admin entra al panel de planes
2. Ve la lista de todos los planes con un interruptor (toggle) al lado de cada uno
3. Hace clic en el toggle de un plan
4. Si estaba activo → se desactiva (desaparece de la tienda)
5. Si estaba inactivo → se activa (aparece en la tienda)
6. Cambio es inmediato
7. Clientes con membresía activa de ese plan NO son afectados

### Flujo: Cliente con plan familiar genera códigos

1. Cliente con plan familiar entra a su perfil
2. Ve su tarjeta de membresía con opción "Códigos Familiares"
3. Hace clic para ver o generar códigos
4. Sistema muestra cuántos códigos puede generar (máximo definido por el plan)
5. Cliente genera código para un beneficiario
6. Sistema crea código único (ej: "FAM-ABC123")
7. Cliente comparte este código con su familiar/compañero
8. El beneficiario se registra usando el código
9. Beneficiario obtiene membresía vinculada al plan principal

---

## 5. CHECKLIST: ¿Qué características necesito?

Responde estas preguntas para saber qué activar en tu implementación.

### Sobre recurrencia y lealtad
- [ ] ¿Los clientes compran una sola vez o renuevan periódicamente?
- [ ] ¿Quieres premiar a clientes que renuevan seguido con descuentos?
→ Si ambas son SÍ → Activa **Sistema de Lealtad**

### Sobre horarios
- [ ] ¿Tu servicio tiene horarios diferenciados?
- [ ] ¿Quieres ofrecer planes más baratos con horario limitado?
→ Si alguna es SÍ → Activa **Restricciones de Horario**

### Sobre días de la semana
- [ ] ¿Algunos días son más demandados que otros?
- [ ] ¿Quieres ofrecer planes solo para ciertos días (ej: fin de semana)?
→ Si alguna es SÍ → Activa **Restricciones por Día de Semana**

### Sobre cantidad de uso
- [ ] ¿El servicio se "consume" por cantidad? (clases, consultas, días de sala, masajes)
- [ ] ¿Quieres limitar cuántas veces pueden usar el servicio?
→ Si alguna es SÍ → Activa **Sistema de Sesiones Limitadas**

### Sobre compartir acceso
- [ ] ¿Tiene sentido que una persona comparta su plan con familia o equipo?
- [ ] ¿Tu modelo permite múltiples usuarios bajo un solo pago?
→ Si ambas son SÍ → Activa **Planes Familiares**

### Sobre legalidad
- [ ] ¿Necesitas que firmen términos y condiciones antes de usar el servicio?
- [ ] ¿Hay riesgo legal si no tienes un contrato firmado?
→ Si alguna es SÍ → Activa **Contratos Digitales**

### Sobre visitantes ocasionales
- [ ] ¿Permites "probar" tu servicio por un día?
- [ ] ¿Hay clientes que solo vienen una vez o de forma muy esporádica?
→ Si alguna es SÍ → Activa **Pases Diarios**

### Sobre ubicaciones
- [ ] ¿Tienes más de una sede física?
- [ ] ¿Algunos planes dan acceso a todas las sedes, otros solo a una?
→ Si ambas son SÍ → Activa **Multi-Sede**

### Sobre promociones
- [ ] ¿Tienes precios especiales de lanzamiento o promociones?
- [ ] ¿Quieres evitar que un cliente abuse comprando la promo varias veces?
→ Si ambas son SÍ → Activa **Límite de Compras**

---

## 6. PRESETS POR TIPO DE NEGOCIO

Configuraciones listas para copiar según tu industria.

### 📦 GYM BÁSICO

**Características activas:**
- ✅ Funciones core (crear, editar, comprar, ver membresía)
- ✅ Pases diarios (para visitantes que quieren probar)
- ❌ Lealtad
- ❌ Restricciones horarias
- ❌ Sesiones limitadas
- ❌ Planes familiares
- ❌ Contratos
- ❌ Multi-sede

**Ejemplo:** Gym pequeño que ofrece membresía mensual ilimitada y pases de día para visitantes ocasionales. Sin complicaciones.

---

### 📦 GYM PREMIUM

**Características activas:**
- ✅ Funciones core
- ✅ Sistema de lealtad (premiar clientes frecuentes)
- ✅ Restricciones horarias (plan matutino más barato, plan nocturno)
- ✅ Sesiones limitadas (para clases grupales como Zumba, Yoga)
- ✅ Planes familiares (titular + familiares)
- ✅ Contratos digitales (responsabilidad por lesiones)
- ✅ Pases diarios
- ✅ Límite de compras (para promociones)
- ❌ Multi-sede (solo una ubicación)

**Ejemplo:** Gym que ofrece variedad de planes con diferentes horarios y precios, clases grupales limitadas por sesiones, y premia clientes de largo plazo con descuentos.

---

### 📦 CLÍNICA / CENTRO MÉDICO

**Características activas:**
- ✅ Funciones core
- ✅ Sesiones limitadas (paquetes de consultas: "5 consultas por $150.000")
- ✅ Contratos digitales (consentimientos informados)
- ✅ Límite de compras (paquete bienvenida solo 1 vez)
- ❌ Lealtad (pago por servicio, no recurrencia mensual típica)
- ❌ Restricciones horarias (agenda maneja esto por separado)
- ❌ Planes familiares (cada paciente es individual)
- ❌ Pases diarios (no aplica)
- ❌ Multi-sede (depende si es cadena)

**Ejemplo:** Clínica que vende paquetes de consultas con descuento por volumen. Paciente compra "Paquete 5 Consultas" y las va agendando cuando quiera dentro de 180 días.

---

### 📦 COWORKING

**Características activas:**
- ✅ Funciones core
- ✅ Restricciones horarias (plan diurno 9am-6pm vs plan 24/7)
- ✅ Restricciones por día (plan weekday vs weekend)
- ✅ Sesiones limitadas (días de sala de reuniones por mes)
- ✅ Pases diarios (día de escritorio individual)
- ✅ Multi-sede (si tiene red de oficinas)
- ❌ Lealtad (precios fijos, rara vez se usan descuentos por antigüedad)
- ❌ Planes familiares (cada usuario tiene su espacio)
- ❌ Contratos (términos simples aceptados al registrarse)

**Ejemplo:** Coworking con planes flexibles: "Escritorio Flexible Diurno" ($89.000), "Escritorio Fijo 24/7" ($150.000), "Pase Día" ($15.000), con 5 días de sala de reuniones incluidos por mes.

---

### 📦 STREAMING / SAAS

**Características activas:**
- ✅ Funciones core
- ✅ Planes familiares (perfiles múltiples: titular + 3 personas)
- ✅ Lealtad (descuento por suscripción anual, meses gratis por antigüedad)
- ❌ Restricciones horarias (servicio 24/7)
- ❌ Restricciones por día (disponible siempre)
- ❌ Sesiones limitadas (uso ilimitado)
- ❌ Contratos (términos aceptados al registrarse)
- ❌ Pases diarios (no aplica)
- ❌ Multi-sede (todo es online)

**Ejemplo:** Plataforma de streaming con "Plan Básico" ($5.990/mes, 1 pantalla), "Plan Premium" ($11.990/mes, 4 pantallas, 4K), "Plan Familiar" ($17.990/mes, 6 perfiles). Descuento del 15% si pagas anual.

---

### 📦 SPA / CENTRO DE BIENESTAR

**Características activas:**
- ✅ Funciones core
- ✅ Sesiones limitadas (8 masajes por trimestre, 4 faciales por mes)
- ✅ Lealtad (premiar clientes que renuevan)
- ✅ Contratos digitales (consentimiento para tratamientos)
- ✅ Pases diarios (experiencia de un día)
- ❌ Restricciones horarias (agenda maneja horarios)
- ❌ Planes familiares (servicios personales)
- ❌ Multi-sede (depende si es cadena)

**Ejemplo:** Spa con "Membresía Relax" ($200.000/trimestre, 8 masajes), "Membresía VIP" ($350.000/trimestre, ilimitado), "Experiencia Día" ($50.000, 1 sesión de cada servicio).

---

## 7. DATOS UNIVERSALES (Todos los planes necesitan esto)

| Dato | Qué es | Tipo | Ejemplo |
|------|--------|------|---------|
| Nombre | Cómo se llama el plan | Texto | "Plan Gold Mensual" |
| Precio | Cuánto cuesta (entero, sin decimales) | Número | 49990 |
| Duración | Cuántos días dura | Número | 30 |
| Categoría | Clasificación para organizar en la tienda | Texto | "mensual", "trimestral", "promo" |
| Activo | Si se muestra en tienda | Booleano | Sí / No |

---

## 8. DATOS OPCIONALES (Según características activas)

| Dato | Para qué sirve | Tipo | Activar si... |
|------|----------------|------|---------------|
| Hora inicio | Restricción horaria | Hora (HH:MM) | Plan con horario limitado |
| Hora fin | Restricción horaria | Hora (HH:MM) | Plan con horario limitado |
| Días permitidos | Restricción semanal | Lista de números [1-7] | Plan solo ciertos días |
| Sesiones totales | Límite de uso | Número (0=ilimitado) | Plan con cantidad limitada |
| Sesiones por período | Cuántas se liberan cada ciclo | Número | Sesiones se renuevan periódicamente |
| Descuento lealtad activo | Si ofrece descuento a frecuentes | Booleano | Quieres premiar clientes antiguos |
| Porcentaje descuento | Cuánto descuento (%) | Número | Descuento por porcentaje |
| Precio fijo con descuento | Precio especial para leales | Número | Descuento por precio fijo |
| Niveles de lealtad | Descuentos progresivos | Lista [{días, descuento}] | Descuentos escalonados |
| Días de gracia | Espera para nuevos clientes | Número | Evitar abuso de descuento |
| Max beneficiarios | Cuántos pueden compartir | Número | Plan familiar/empresa |
| Contrato ID | Qué contrato firmar | Identificador | Necesitas respaldo legal |
| Es pase diario | Si es uso único | Booleano | Permites visitas ocasionales |
| Servicios permitidos | Qué puede usar con el pase | Lista de textos | Pase limitado a ciertos servicios |
| Activa lealtad | Si cuenta para acumular días | Booleano | Para excluir pases diarios |
| Sedes permitidas | A qué ubicaciones da acceso | Lista de IDs | Tienes varias sucursales |
| Límite compras por usuario | Máximo de compras permitidas | Número | Promociones limitadas |

---

## 9. INTEGRACIONES CON OTROS MÓDULOS

Este módulo no vive solo. Se conecta con otros módulos del sistema. Aquí están las conexiones más comunes.

### Con Módulo de Suscripciones/Membresías
- Cuando un cliente compra un plan → se crea una suscripción/membresía activa
- El plan define las "reglas" (precio, duración, restricciones)
- La suscripción es la "instancia activa" para cada cliente específico
- Un plan puede tener muchas suscripciones (un plan, muchos clientes)

### Con Módulo de Pagos
- Al comprar un plan → se inicia transacción en la pasarela de pago
- Si el pago es exitoso → se activa la membresía
- Si falla → se guarda como "pendiente" para reintentar
- Soportar múltiples métodos: online (WebPay, Stripe), presencial (efectivo, POS), manual (transferencia)

### Con Módulo de Contratos (si está activo)
- Un plan puede tener un contrato asociado
- Antes de pagar, el cliente debe ver y firmar el contrato
- La firma se guarda como imagen junto con la compra

### Con Módulo de Lealtad (si está activo)
- Los planes definen las reglas de descuento (niveles, porcentajes)
- El módulo de lealtad calcula cuántos días lleva el cliente como cliente activo
- Al comprar, se aplica el descuento correspondiente según los niveles del plan

### Con Módulo de Reservas/Agenda
- Las restricciones horarias del plan → limitan qué servicios puede reservar
- El número de sesiones → limita cuántas reservas puede hacer
- Si es pase diario → solo puede reservar los servicios permitidos por el pase

### Con Módulo de Check-in / Control de Acceso
- Al intentar entrar → sistema verifica si tiene membresía activa
- Verifica restricciones horarias y de día
- Verifica sesiones disponibles
- Si todo OK → acceso permitido
- Si algo falla → acceso denegado con mensaje claro

### Con Módulo de Caja / POS (Punto de Venta)
- Personal de atención puede vender planes directamente en recepción
- Se validan límites de compra por usuario
- Se registra la venta con el método de pago correspondiente

### Con Módulo de Usuarios / Admin
- Admin puede cambiar el plan de un cliente manualmente
- Se pueden hacer correcciones de membresías
- Se puede ver qué plan tiene cada cliente

---

## 10. CASOS ESPECIALES / EXCEPCIONES

Situaciones que van a pasar y el sistema debe manejar correctamente.

**¿Qué pasa si alguien intenta comprar un plan desactivado?**
El plan no aparece en la tienda, así que no puede seleccionarlo. Si de alguna forma intenta acceder directamente (por URL vieja, por ejemplo), el sistema rechaza la compra.

**¿Qué pasa si el cliente ya alcanzó el límite de compras?**
El botón de compra aparece deshabilitado. Se muestra mensaje: "Ya alcanzaste el límite de compras para este plan."

**¿Qué pasa si un plan tiene horario restringido y el cliente intenta entrar fuera de horario?**
El sistema de check-in/acceso rechaza la entrada. Se muestra mensaje: "Tu plan solo permite acceso de X:XX a X:XX."

**¿Qué pasa si se agotan las sesiones disponibles?**
El cliente no puede reservar más servicios. Ve mensaje: "No tienes sesiones disponibles. Próxima liberación: [fecha]." Cuando llega la fecha, se agregan automáticamente.

**¿Qué pasa si el admin elimina un plan que tiene clientes activos?**
Los clientes que ya compraron MANTIENEN su membresía hasta que venza. El plan solo desaparece para compras nuevas.

**¿Qué pasa si el cliente pierde conexión durante el pago?**
La pasarela de pago tiene su propio manejo de timeout. Si el pago se procesó pero la confirmación no llegó → queda como "pendiente". El cliente puede reintentar o contactar soporte.

**¿Qué pasa si dos personas intentan comprar el último cupo de una promoción al mismo tiempo?**
El sistema valida el límite al momento de confirmar el pago (no al seleccionar). El primero en completar el pago obtiene el plan. El segundo recibe mensaje: "Lo sentimos, este plan ya no está disponible."

**¿Qué pasa si un cliente tiene un plan que vence hoy y compra uno nuevo?**
El nuevo plan puede quedar "en cola" esperando que termine el actual, o puede activarse inmediatamente (según configuración del negocio). Regla de oro: nunca se pierden días pagados.

**¿Qué pasa con los pases diarios y la lealtad?**
Los pases diarios NO cuentan para acumular días de cliente leal. Esto evita que alguien compre pases diarios solo para obtener descuentos. Solo los planes regulares (mensuales, trimestrales, etc.) activan la elegibilidad de lealtad.

---

## 11. EJEMPLO COMPLETO: Aplicando el Boilerplate

### Escenario: Nuevo Gym "FitZone"

**Contexto:** Gym mediano en una ciudad, una sola sede, con clases grupales y área de máquinas.

**Decisiones del dueño:**
- Quiero 3 tipos de planes: Mensual Básico, Mensual Gold, Trimestral
- Quiero un plan matutino más barato para llenar horarios muertos
- Quiero premiar clientes frecuentes con descuento
- NO voy a tener planes familiares (por ahora)
- SÍ necesito contrato de responsabilidad
- SÍ quiero pases de día para visitantes
- Las clases grupales tienen cupo, quiero limitar sesiones

**Configuración activada:**
```
✅ Funciones Core
✅ Sistema de Lealtad
✅ Restricciones Horarias
✅ Sistema de Sesiones (para clases)
✅ Contratos Digitales
✅ Pases Diarios
✅ Límite de Compras (para promos)
❌ Planes Familiares
❌ Restricciones por Día
❌ Multi-Sede
```

**Planes creados:**

1. **Plan Básico Mensual**
   - Precio: $29.990
   - Duración: 30 días
   - Horario: Sin restricción (todo el día)
   - Sesiones de clases: 8 por mes
   - Activa lealtad: Sí
   - Contrato: Sí (responsabilidad estándar)

2. **Plan Matutino**
   - Precio: $19.990
   - Duración: 30 días
   - Horario: 6:00 a 14:00
   - Sesiones de clases: 8 por mes
   - Activa lealtad: Sí
   - Contrato: Sí

3. **Plan Gold Trimestral**
   - Precio: $79.990
   - Duración: 90 días
   - Horario: Sin restricción
   - Sesiones de clases: 12 por mes
   - Activa lealtad: Sí
   - Descuento lealtad: 10% si lleva 90+ días como cliente

4. **Pase Día**
   - Precio: $5.000
   - Duración: 1 día
   - Es pase diario: Sí
   - Activa lealtad: No
   - Sesiones: 1 clase grupal incluida
   - Contrato: Sí (responsabilidad)
   - Límite: 3 pases por persona (para que compre membresía si le gusta)

5. **Promo Primer Mes**
   - Precio: $14.990
   - Duración: 30 días
   - Horario: Sin restricción
   - Límite de compras: 1 por persona
   - Activa lealtad: Sí
   - Contrato: Sí

**Niveles de lealtad configurados:**
- 0-29 días (período de gracia): Sin descuento
- 30-89 días: 5% descuento
- 90-179 días: 10% descuento
- 180-364 días: 15% descuento
- 365+ días: 20% descuento

---

## 12. CÓMO USAR ESTE BOILERPLATE

Este documento sirve para tres cosas:

**1. Entender qué necesitas implementar.**
Lee las funciones core y las opcionales. Usa la checklist de la sección 5 para decidir qué activar.

**2. Explicarle a un desarrollador (o a una IA como Claude Code) qué construir.**
Copia las secciones relevantes y úsalas como contexto. El lenguaje natural es lo suficientemente claro para que cualquier herramienta de desarrollo entienda qué hacer.

**3. Adaptar a tu industria específica.**
Usa los presets de la sección 6 como punto de partida. Modifica según tus necesidades.

**Lo que NO contiene este documento:** Código, nombres de archivos, estructura de base de datos, ni endpoints de API. Solo concepto puro. La implementación técnica depende de tu stack y se resuelve en otro documento.

---

> **Documento creado por WipXap SpA**
> Basado en experiencia real de implementación en proyectos de gimnasio.
> Diseñado para ser reutilizable en cualquier negocio con suscripciones.
