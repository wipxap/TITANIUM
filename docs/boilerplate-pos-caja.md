# MÓDULO: SISTEMA DE PUNTO DE VENTA Y CONTROL DE CAJA — BOILERPLATE

> **Tipo:** Boilerplate de concepto en lenguaje natural
> **Versión:** 1.0 | **Fecha:** 04/02/2026
> **Origen:** Extraído y generalizado desde módulo POS de proyecto gym real
> **Uso:** Guía para implementar un sistema de caja/POS en CUALQUIER negocio con ventas presenciales
> **Contiene código:** NO — solo concepto puro

---

## 1. ¿QUÉ ES ESTE MÓDULO?

Un sistema de Punto de Venta (POS) es el corazón financiero de cualquier negocio que vende presencialmente. Es donde el dinero entra, se registra, y se controla. Permite que tu personal venda productos o servicios, cobre en diferentes métodos de pago, y lleve un registro exacto de cada transacción.

Piensa en esto como la caja registradora del negocio, pero digital y con superpoderes: sabe cuánto dinero debería haber, quién vendió qué, cuándo se hizo cada venta, y si algo no cuadra al final del turno. Sin este módulo, no tienes control real sobre el dinero que entra a tu negocio.

Este módulo es necesario para cualquier negocio que tenga ventas presenciales con personal atendiendo. Si solo vendes online, probablemente no lo necesitas (un módulo de pagos online es diferente). Pero si tienes un mostrador, una recepción o un punto de atención donde se cobra — necesitas un POS.

**Ejemplos reales de cómo se usa:**

- **Gimnasio:** Recepcionista vende planes de membresía, bebidas y suplementos. Abre caja al iniciar turno, cierra al terminar.
- **Clínica:** Recepcionista cobra consultas, paquetes de sesiones y productos de cuidado. Registra pagos con tarjeta y efectivo.
- **Restaurante:** Mesero/cajero cobra comidas y bebidas. Cierra caja cada turno con arqueo de efectivo.
- **Tienda retail:** Vendedor cobra productos con escáner de código de barras. Maneja devoluciones y cambios.
- **Peluquería/Spa:** Recepcionista cobra servicios realizados y productos vendidos. Asocia venta al profesional que atendió.
- **Coworking:** Recepcionista cobra planes, pases diarios y servicios adicionales (impresiones, sala de reuniones).

---

## 2. FUNCIONES CORE (Las que TODO POS necesita)

Estas funciones son obligatorias. Sin ellas, no tienes control financiero real. No importa si eres un gym, una clínica o un restaurante — las necesitas todas.

### 2.1 Abrir caja (Iniciar turno)

**Qué hace:** Prepara el sistema para empezar a vender. Se cuenta cuánto efectivo hay físicamente en caja al comenzar y se registra como punto de partida del turno.

**Quién la usa:** Personal de atención (recepcionista, cajero, vendedor) y administradores.

**Cómo funciona en lenguaje simple:**
1. El empleado inicia sesión en la app
2. Sistema verifica que no haya otra caja abierta en esa ubicación
3. Si hay una caja sin cerrar de un turno anterior → muestra advertencia
4. El empleado hace clic en "Abrir Caja"
5. Aparece ventana pidiendo el monto inicial de efectivo
6. El empleado cuenta el dinero físico y escribe el monto (ej: $50.000)
7. Confirma
8. Sistema crea una nueva caja con estado "abierta"
9. Se habilitan todas las funciones de venta
10. El empleado puede empezar a atender clientes

**Datos que necesita:**
- Monto inicial de efectivo (número, 0 o positivo)
- Quién está abriendo la caja (automático, del login)
- Fecha y hora de apertura (automático)

**Ejemplos por industria:**
- **Gym:** Recepcionista abre caja con $50.000 de fondo al inicio del turno de mañana
- **Restaurante:** Cajero abre caja con $30.000 de sencillo para dar vueltos
- **Tienda retail:** Vendedor abre caja con $20.000 en monedas y billetes chicos
- **Clínica:** Recepcionista abre caja con $0 (todo se cobra con tarjeta)

**Validaciones:**
- No puede haber dos cajas abiertas en la misma ubicación al mismo tiempo
- El monto inicial debe ser 0 o positivo (no negativo)
- Si hay caja sin cerrar del día anterior → advertencia clara antes de permitir abrir nueva

---

### 2.2 Vender producto / servicio

**Qué hace:** Registra la venta de uno o más productos o servicios a un cliente, asociándola al método de pago usado.

**Quién la usa:** Personal de atención (con caja abierta).

**Cómo funciona en lenguaje simple:**
1. Empleado tiene caja abierta
2. Busca o navega productos/servicios disponibles (por categoría o nombre)
3. Selecciona lo que el cliente quiere comprar → se agrega al carrito
4. Ajusta cantidades si es necesario (botones +/-)
5. Opcionalmente asocia la venta a un cliente registrado
6. Verifica el total en el carrito
7. Elige el método de pago (efectivo, tarjeta débito, tarjeta crédito, transferencia)
8. Si es efectivo → venta se confirma inmediatamente
9. Si es tarjeta/transferencia → ingresa código de comprobante
10. Sistema registra la venta con un número de boleta único
11. Carrito se vacía automáticamente

**Datos que necesita:**
- Lista de productos/servicios seleccionados con cantidades
- Método de pago elegido
- Cliente asociado (opcional para productos, puede ser obligatorio para servicios)
- Código de comprobante (si pago electrónico)

**Ejemplos por industria:**
- **Gym:** Recepcionista vende 2 bebidas isotónicas + 1 proteína a un visitante (sin registro)
- **Restaurante:** Cajero cobra mesa completa: 3 platos + 2 bebidas + 1 postre
- **Tienda retail:** Vendedor cobra 1 camiseta + 1 pantalón, cliente paga con tarjeta
- **Clínica:** Recepcionista cobra consulta médica + paquete de exámenes al paciente
- **Peluquería:** Recepcionista cobra corte ($15.000) + tinte ($25.000) + shampoo ($8.000)

**Validaciones:**
- No se puede vender sin caja abierta
- El carrito no puede estar vacío al confirmar
- El total debe ser mayor a $0
- Si el pago es electrónico → el código de comprobante es obligatorio
- Si se vende un servicio que requiere registro (membresía, plan, paquete) → el cliente es obligatorio

---

### 2.3 Vender plan / membresía / suscripción

**Qué hace:** Inscribe a un cliente en un plan de servicio recurrente y registra el pago. Es una venta especial porque además de cobrar, activa una suscripción en el sistema.

**Quién la usa:** Personal de atención (con caja abierta).

**Cómo funciona en lenguaje simple:**
1. Empleado tiene caja abierta
2. Va a la sección de planes/membresías
3. Ve lista de planes disponibles con precios y duración
4. Selecciona el plan que el cliente quiere
5. Busca al cliente por identificador (RUT, email, nombre)
6. Si el cliente no existe → puede crearlo rápidamente con datos mínimos
7. Plan aparece en el carrito con datos del cliente
8. Si hay descuento o promoción → modifica el precio y escribe el motivo
9. **(Si hay contrato)** El cliente firma en pantalla
10. Elige método de pago y completa el cobro
11. Sistema registra: la venta + la suscripción activa + el contrato (si aplica)
12. El cliente puede empezar a usar el servicio inmediatamente

**Datos que necesita:**
- Plan seleccionado
- Cliente identificado (obligatorio)
- Método de pago
- Código de comprobante (si pago electrónico)
- Firma digital del contrato (si el plan lo requiere)

**Ejemplos por industria:**
- **Gym:** Recepcionista inscribe cliente en "Plan Gold 30 días" por $35.000, firma contrato
- **Clínica:** Recepcionista vende "Paquete 5 Consultas" por $150.000 a un paciente
- **Coworking:** Recepcionista activa "Plan Diurno Mensual" por $89.000, miembro firma acuerdo
- **Spa:** Recepcionista vende "Membresía Relax Trimestral" por $200.000 con 8 sesiones

**Validaciones:**
- El cliente es SIEMPRE obligatorio para venta de planes
- Si el plan tiene contrato asociado → la firma es obligatoria antes de confirmar
- Si se anula esta venta después → la suscripción se cancela automáticamente

---

### 2.4 Buscar cliente

**Qué hace:** Encuentra un cliente registrado en el sistema para asociarlo a una venta.

**Quién la usa:** Personal de atención.

**Cómo funciona en lenguaje simple:**
1. Empleado escribe en el campo de búsqueda (nombre, RUT, email, teléfono)
2. Sistema busca coincidencias en tiempo real mientras escribe
3. Muestra lista de resultados con nombre, identificador y foto (si tiene)
4. Empleado selecciona al cliente correcto
5. El cliente queda asociado a la venta en curso

**Datos que necesita:**
- Término de búsqueda (nombre, identificador, contacto)

**Variaciones por industria:**
- **Chile:** Búsqueda por RUT con formateo automático (12.345.678-9)
- **Internacional:** Búsqueda por email o nombre
- **Con lector:** Escaneo de tarjeta de membresía o código QR

**Validaciones:**
- Para venta de productos → el cliente es opcional (puede vender sin registrar quién compró)
- Para venta de planes → el cliente es obligatorio
- Si el cliente no existe → permitir creación rápida con datos mínimos

---

### 2.5 Gestionar métodos de pago

**Qué hace:** Permite elegir cómo paga el cliente y registra el comprobante correspondiente.

**Quién la usa:** Personal de atención.

**Métodos de pago universales:**

| Método | Requiere comprobante | Confirmación |
|--------|---------------------|--------------|
| Efectivo | No | Inmediata |
| Tarjeta débito | Sí (código voucher) | Después de ingresar código |
| Tarjeta crédito | Sí (código voucher) | Después de ingresar código |
| Transferencia bancaria | Sí (código/comprobante) | Después de ingresar código |
| Pago online (pasarela) | No (automático) | Automática desde la pasarela |

**Cómo funciona para pagos electrónicos:**
1. Empleado selecciona "Tarjeta" o "Transferencia"
2. Aparece ventana pidiendo código de comprobante
3. Empleado procesa el pago en el terminal físico o verifica la transferencia
4. Copia el código del comprobante (ej: "TBK1234567890")
5. Ingresa el código en la ventana
6. Confirma
7. Venta queda registrada como "completada"

**Ejemplos por industria:**
- **Gym:** Transbank (débito/crédito) + efectivo + transferencia bancaria
- **Restaurante:** Efectivo + tarjeta + propina separada
- **Tienda retail:** Tarjeta + efectivo + cuotas sin interés
- **Internacional:** Stripe terminal + efectivo + Apple Pay

**Validaciones:**
- Si es efectivo → confirmación inmediata, sin código
- Si es electrónico → el código de comprobante es obligatorio para completar
- El método de pago queda registrado permanentemente (no se puede cambiar después)

---

### 2.6 Ver historial de ventas

**Qué hace:** Muestra todas las ventas realizadas con filtros para buscar ventas específicas.

**Quién la usa:** Personal de atención (ve las de su turno) y administradores (ven todas).

**Cómo funciona en lenguaje simple:**
1. Empleado va a la sección de historial
2. Ve lista de ventas del día/turno actual (por defecto)
3. Puede filtrar por: fecha, método de pago, estado, cliente, monto
4. Cada venta muestra: cliente, monto, productos, número de boleta, estado, fecha/hora
5. Puede hacer clic en una venta para ver todos los detalles

**Datos que muestra por venta:**
- Número de boleta
- Cliente (nombre o "No registrado")
- Monto total
- Método de pago
- Productos/servicios vendidos
- Estado (completada, anulación pendiente, cancelada)
- Quién hizo la venta
- Fecha y hora

**Ejemplos por industria:**
- **Gym:** Recepcionista revisa ventas del turno antes de cerrar caja
- **Restaurante:** Gerente revisa todas las ventas del día para cuadrar con cocina
- **Tienda retail:** Supervisor revisa ventas de la semana buscando patrones

**Validaciones:**
- El personal solo ve las ventas de su turno/sede
- El administrador ve todas las ventas con filtros avanzados

---

### 2.7 Cerrar caja (Fin de turno)

**Qué hace:** Termina el turno contando todo el dinero por método de pago y verificando que los montos coincidan con las ventas registradas. Es el "arqueo de caja".

**Quién la usa:** Quien abrió la caja o un administrador.

**Cómo funciona en lenguaje simple:**
1. Termina el turno del empleado
2. Hace clic en "Cerrar Caja"
3. Aparece formulario de cierre con campos por método de pago:
   - Efectivo contado (cuenta el dinero físico)
   - Total tarjeta débito (revisa el terminal)
   - Total tarjeta crédito (revisa el terminal)
   - Total transferencias (revisa el banco)
4. El empleado ingresa los montos reales de cada método
5. Opcionalmente agrega notas explicando diferencias (ej: "Vuelto mal dado")
6. Confirma el cierre
7. Sistema calcula automáticamente:
   - **Esperado:** Monto inicial + ventas en efectivo / Total ventas por tarjeta / Total transferencias
   - **Declarado:** Lo que el empleado escribió
   - **Diferencia:** Declarado - Esperado (positivo = sobrante, negativo = faltante)
8. Muestra resumen con diferencias por método de pago
9. Caja se marca como "cerrada"
10. El administrador puede ver las diferencias en el panel

**Datos que necesita:**
- Efectivo contado (número)
- Total débito declarado (número)
- Total crédito declarado (número)
- Total transferencias declarado (número)
- Notas explicativas (texto, opcional)

**Ejemplos por industria:**
- **Gym:** "Efectivo esperado: $75.000 / Contado: $74.500 / Diferencia: -$500"
- **Restaurante:** "Propinas en efectivo: $12.000 (no cuentan para arqueo)"
- **Tienda retail:** "Sobrante de $200 — probablemente error de vuelto a favor"

**Validaciones:**
- Solo puede cerrar quien abrió la caja, o un administrador
- Los montos declarados deben ser 0 o positivos
- Las diferencias se calculan automáticamente (no editables)
- El cierre NO se bloquea por diferencias — solo quedan registradas para auditoría
- Una caja cerrada no se puede cerrar de nuevo

---

### 2.8 Solicitar anulación de venta

**Qué hace:** Permite al personal de atención pedir la cancelación de una venta ya registrada. La anulación NO es inmediata — requiere aprobación de un administrador.

**Quién la usa:** Personal de atención (solicita) y administradores (aprueba/rechaza).

**Cómo funciona en lenguaje simple:**

**Parte 1 — El empleado solicita:**
1. Empleado busca la venta en el historial
2. Hace clic en "Solicitar Anulación"
3. Escribe el motivo (ej: "Cliente devolvió producto defectuoso")
4. Envía la solicitud
5. La venta aparece marcada como "Anulación pendiente"
6. Se envía notificación al administrador

**Parte 2 — El administrador decide:**
7. Administrador ve notificación de solicitud pendiente
8. Abre los detalles: qué se vendió, a quién, cuánto, por qué quieren anular
9. Decide aprobar o rechazar
10. Si aprueba → venta pasa a estado "cancelada", no cuenta en caja
11. Si rechaza → venta sigue activa, empleado recibe notificación
12. Opcionalmente agrega notas de su decisión

**Datos que necesita:**
- Venta a anular (identificador)
- Motivo de la anulación (texto obligatorio)
- Decisión del admin (aprobar/rechazar)
- Notas del admin (texto opcional)

**Ejemplos por industria:**
- **Gym:** "Cliente devolvió suplemento sin abrir" → Admin aprueba → Venta cancelada
- **Restaurante:** "Plato salió mal preparado" → Admin aprueba → Se descuenta del total
- **Tienda retail:** "Cliente cambió de talla" → Anular venta original + crear nueva venta
- **Clínica:** "Paciente canceló consulta dentro de 24hrs" → Admin rechaza (política de 48hrs)

**Validaciones:**
- No se puede anular una venta que ya está cancelada
- No se puede crear dos solicitudes de anulación para la misma venta
- Solo administradores pueden aprobar o rechazar
- Una vez decidida, la decisión no se puede cambiar
- Si la venta incluía un plan/membresía → al aprobar anulación, la suscripción se cancela automáticamente

---

## 3. CARACTERÍSTICAS OPCIONALES (Módulos que se activan/desactivan)

Estas son funciones que puedes activar o no según tu tipo de negocio. Lee cada una y decide si la necesitas.

---

### 🔧 OPCIÓN: Modificación de Precios en Venta

**¿Qué hace?**
Permite cambiar el precio de un producto o servicio antes de confirmar la venta. Útil para descuentos manuales, promociones o ajustes especiales.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con descuentos discrecionales (gyms con promos, tiendas con regateo)
- ✅ Negocios con precios variables (servicios cotizados, negociaciones B2B)
- ❌ Negocios con precios fijos estrictos (farmacias, supermercados con precio regulado)

**¿Cómo funciona en lenguaje simple?**
1. El producto/servicio está en el carrito con su precio original
2. Empleado hace clic en el precio para editarlo
3. Escribe el nuevo precio
4. Escribe el motivo del cambio (obligatorio)
5. El sistema guarda ambos precios: original y modificado
6. Queda registrado quién hizo el cambio, cuándo y por qué

**Datos que necesita:**
- Precio original (guardado automáticamente)
- Precio nuevo (ingresado por el empleado)
- Motivo del cambio (texto obligatorio)
- Quién lo modificó (automático)

**Validaciones:**
- El motivo del cambio es obligatorio (no puede dejar vacío)
- Se guarda el precio original para auditoría (nunca se pierde)
- Queda registrado quién modificó el precio
- El precio nuevo no puede ser negativo

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Solo si tu personal puede aplicar descuentos o cambiar precios en el momento.

---

### 🔧 OPCIÓN: Venta sin Cliente Registrado

**¿Qué hace?**
Permite vender productos sin necesidad de identificar al comprador. La venta se registra como "Cliente no registrado" o "Venta anónima".

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con ventas rápidas de productos (gym vendiendo bebidas, tienda de conveniencia)
- ✅ Negocios donde no siempre se necesita identificar al comprador
- ❌ Negocios donde TODA venta debe asociarse a un cliente (clínicas, servicios regulados)

**¿Cómo funciona en lenguaje simple?**
1. Empleado agrega productos al carrito
2. NO busca ni selecciona cliente (deja vacío)
3. Elige método de pago y confirma
4. Venta se registra con "Cliente: No registrado"
5. Cuenta para la caja normalmente

**Validaciones:**
- Para productos → permitir venta sin cliente
- Para planes/membresías → SIEMPRE exigir cliente (necesitas saber a quién activar el servicio)
- Las ventas sin cliente se registran igual para efectos de caja y auditoría

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Solo si vendes productos que no requieren asociar a un usuario específico.

---

### 🔧 OPCIÓN: Creación Rápida de Cliente

**¿Qué hace?**
Permite crear un cliente nuevo con datos mínimos directamente desde el POS, sin salir de la pantalla de venta. Evita ir al módulo de usuarios para registrarlo completo.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios donde el cliente se registra en el momento de la compra (gyms, clínicas)
- ✅ Negocios con alta rotación donde la velocidad importa
- ❌ Negocios donde todos los clientes se registran por su cuenta online

**¿Cómo funciona en lenguaje simple?**
1. Empleado busca al cliente y no lo encuentra
2. Hace clic en "Crear cliente rápido"
3. Ingresa datos mínimos: nombre + identificador (RUT/email)
4. Confirma
5. Cliente queda creado y seleccionado para la venta
6. El cliente puede completar su perfil después desde su cuenta

**Datos mínimos:**
- Nombre
- Identificador (email, RUT, o según tu app)
- Opcionalmente: teléfono

**Validaciones:**
- Validar que el identificador no esté duplicado
- Solo los datos mínimos son obligatorios (el resto se completa después)

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Solo si tu personal necesita registrar clientes nuevos durante la venta.

---

### 🔧 OPCIÓN: Numeración Secuencial de Boletas

**¿Qué hace?**
Genera un número de boleta legible y secuencial para cada venta, además del identificador interno del sistema. Útil para el cliente, para auditoría y para requisitos legales.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios que necesitan entregar comprobante al cliente
- ✅ Negocios con requisitos legales de numeración (facturación)
- ❌ Negocios puramente digitales donde el ID interno es suficiente

**¿Cómo funciona en lenguaje simple?**
1. Al confirmar una venta, el sistema genera automáticamente un número secuencial
2. Formato configurable: PREFIJO-FECHA-SECUENCIA (ej: "GY-20260203-0001")
3. El número aumenta con cada venta del día
4. Se reinicia al día siguiente (o nunca, según configuración)

**Datos que necesita:**
- Prefijo configurable por sede/negocio (ej: "GY" para gym, "CL" para clínica)
- Contador secuencial (automático)
- Formato de fecha (automático)

**Ejemplos:**
- **Gym:** "GY-20260203-0001", "GY-20260203-0002"...
- **Restaurante:** "REST-20260203-0045"
- **Tienda:** "SHOP-0001234" (sin fecha, secuencial continuo)

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Sí si entregas comprobante al cliente o tienes requisitos de numeración.

---

### 🔧 OPCIÓN: Reporte de Cajas para Administración

**¿Qué hace?**
Muestra al administrador un panel con todas las cajas (abiertas y cerradas) de todos los turnos y sedes, con las diferencias encontradas en cada una.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con múltiples turnos y empleados manejando efectivo
- ✅ Negocios donde el control financiero es prioridad
- ❌ Negocios unipersonales donde tú mismo manejas la caja

**¿Cómo funciona en lenguaje simple?**
1. Admin abre el panel de cajas
2. Ve lista de todas las cajas con filtros por fecha, sede, estado
3. Cada caja muestra: quién la abrió, cuándo, ventas totales, diferencias
4. Puede hacer clic en una caja para ver detalles completos
5. Las cajas con diferencias negativas se resaltan visualmente

**Datos que muestra por caja:**
- Quién abrió y cerró la caja
- Hora de apertura y cierre
- Monto inicial
- Ventas por método de pago (esperado vs declarado)
- Diferencias por método de pago
- Notas del cierre

**Ejemplos por industria:**
- **Gym:** Admin ve que recepcionista del turno tarde tiene -$2.000 en efectivo 3 días seguidos
- **Restaurante:** Gerente compara cajas de turno almuerzo vs cena para analizar rendimiento
- **Tienda retail:** Supervisor identifica que la sucursal norte siempre tiene más diferencias

**Complejidad de implementación:** Media
**¿Lo necesitas?** Solo si tienes múltiples empleados manejando caja y necesitas supervisar.

---

### 🔧 OPCIÓN: Integración con Pagos Online

**¿Qué hace?**
Conecta las ventas realizadas desde una app o sitio web (donde el cliente paga online) con el sistema POS, para que aparezcan en el historial y en los reportes junto con las ventas presenciales.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios que venden tanto presencialmente como online (gym con app, tienda con e-commerce)
- ✅ Negocios que quieren ver TODAS las ventas en un solo lugar
- ❌ Negocios 100% presenciales sin canal online

**¿Cómo funciona en lenguaje simple?**
1. Cliente compra un plan/producto desde la app o sitio web
2. Paga con pasarela online (WebPay, Stripe, MercadoPago, etc.)
3. Si el pago es exitoso → el sistema registra la venta automáticamente
4. La venta aparece en el historial del POS con método "Pago online"
5. No requiere caja abierta ni código de voucher manual (la pasarela lo maneja)
6. Cuenta para los reportes de ventas totales

**Datos que necesita:**
- Integración con la pasarela de pago online
- Identificador de la transacción (lo da la pasarela)
- Estado del pago (confirmado/fallido)

**Validaciones:**
- Las ventas online NO requieren caja abierta (se registran independientemente)
- Las ventas online NO cuentan para el arqueo de caja (son automáticas)
- Las ventas online SÍ aparecen en reportes y historial general

**Complejidad de implementación:** Media-Alta
**¿Lo necesitas?** Solo si vendes tanto presencial como online y quieres un historial unificado.

---

### 🔧 OPCIÓN: Pago Dividido / Mixto

**¿Qué hace?**
Permite que el cliente pague una parte en efectivo y otra parte con tarjeta (o cualquier combinación de métodos de pago en una sola venta).

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con montos altos donde el cliente no tiene suficiente de un solo método
- ✅ Restaurantes (dividir cuenta entre comensales)
- ❌ Negocios con ventas de montos bajos donde un solo método siempre alcanza

**¿Cómo funciona en lenguaje simple?**
1. Empleado tiene el total de la venta (ej: $50.000)
2. Selecciona "Pago dividido"
3. Ingresa cuánto paga con cada método:
   - Efectivo: $30.000
   - Tarjeta débito: $20.000
4. La suma de los parciales debe igualar el total
5. Ingresa código de voucher por la parte electrónica
6. Se registra la venta con dos registros de pago

**Validaciones:**
- La suma de todos los parciales debe ser exactamente igual al total
- Cada método electrónico requiere su propio comprobante
- En el cierre de caja, cada parcial cuenta en su categoría correspondiente

**Complejidad de implementación:** Media
**¿Lo necesitas?** Solo si tus clientes frecuentemente necesitan pagar con más de un método.

---

### 🔧 OPCIÓN: Manejo de Propinas

**¿Qué hace?**
Permite registrar propinas separadas del monto de la venta. Las propinas no cuentan como ingreso del negocio — van directo al empleado o se distribuyen.

**¿Para qué tipo de negocio sirve?**
- ✅ Restaurantes, bares, cafeterías
- ✅ Peluquerías, barberías, spas
- ❌ Gyms, clínicas, tiendas retail (no es costumbre)

**¿Cómo funciona en lenguaje simple?**
1. Después de registrar la venta, aparece opción "¿Propina?"
2. Empleado ingresa monto de propina
3. Elige si la propina se paga en efectivo o con tarjeta
4. La propina se registra separada de la venta
5. En el cierre de caja: las propinas en efectivo se reportan aparte

**Validaciones:**
- La propina es siempre opcional
- Se registra separada del ingreso del negocio
- No afecta el cálculo de diferencias de caja (se reporta como línea separada)

**Complejidad de implementación:** Baja-Media
**¿Lo necesitas?** Solo si tu industria maneja propinas como práctica habitual.

---

## 4. FLUJOS DE USUARIO COMPLETOS

Estos son los recorridos paso a paso de las acciones principales. Son genéricos y aplican a cualquier industria.

### Flujo: Empleado abre caja e inicia turno

1. Empleado inicia sesión en la aplicación
2. Sistema verifica que no haya caja abierta para esa ubicación
3. Si hay caja abierta de otro turno → muestra advertencia "Hay una caja sin cerrar"
4. Empleado hace clic en "Abrir Caja"
5. Aparece ventana pidiendo el monto inicial de efectivo
6. Empleado cuenta el dinero físico y escribe el monto
7. Hace clic en "Confirmar"
8. Sistema crea nueva caja con estado "abierta"
9. Se habilitan las funciones de venta
10. Empleado puede empezar a atender clientes

### Flujo: Venta rápida de producto en efectivo

1. Empleado tiene caja abierta
2. Busca o selecciona producto del catálogo
3. Producto se agrega al carrito
4. Ajusta cantidad si es necesario
5. No selecciona cliente (venta anónima de producto)
6. Verifica el total
7. Hace clic en "Efectivo" como método de pago
8. Venta se confirma inmediatamente (sin pedir código)
9. Aparece confirmación con número de boleta
10. Carrito se vacía
11. Entrega producto al cliente

### Flujo: Venta de plan/membresía con tarjeta

1. Empleado tiene caja abierta
2. Va a la sección de planes
3. Selecciona el plan deseado
4. Busca al cliente por nombre o identificador
5. Si no existe → crea cliente rápido con datos mínimos
6. Selecciona al cliente
7. Plan aparece en el carrito con datos del cliente
8. Si hay descuento → modifica precio y escribe motivo
9. **(Si hay contrato)** Cliente firma en pantalla
10. Hace clic en "Tarjeta" como método de pago
11. Aparece ventana de comprobante
12. Procesa el pago en el terminal físico
13. Copia el código del comprobante e ingresa en la ventana
14. Confirma
15. Sistema registra: venta + suscripción activa + contrato
16. Aparece confirmación con número de boleta
17. Cliente queda inscrito y puede usar el servicio

### Flujo: Cierre de caja con arqueo

1. Termina el turno del empleado
2. Hace clic en "Cerrar Caja"
3. Aparece formulario con campos por método de pago
4. Cuenta el efectivo físico → escribe el monto
5. Revisa el terminal de tarjetas → escribe totales de débito y crédito
6. Revisa transferencias del banco → escribe el total
7. Opcionalmente agrega notas explicando diferencias
8. Hace clic en "Cerrar Caja"
9. Sistema calcula: esperado vs declarado por cada método
10. Muestra resumen con diferencias
11. Caja se marca como "cerrada"
12. El administrador puede revisar las diferencias después

### Flujo: Solicitud y aprobación de anulación

**Parte 1 — Empleado solicita:**
1. Empleado va al historial de ventas
2. Busca la venta que necesita anular
3. Hace clic en "Solicitar Anulación"
4. Escribe el motivo de la anulación
5. Envía la solicitud
6. Venta aparece marcada como "Anulación pendiente"
7. Se envía notificación al administrador

**Parte 2 — Administrador decide:**
8. Administrador ve notificación de solicitud pendiente
9. Abre los detalles: qué se vendió, a quién, cuánto, motivo
10. Decide aprobar o rechazar
11. Si aprueba → venta cancelada, suscripción anulada (si aplica)
12. Si rechaza → venta sigue activa, empleado notificado
13. Opcionalmente agrega notas de la decisión

---

## 5. CHECKLIST: ¿Qué características necesito?

Responde estas preguntas para saber qué activar en tu implementación.

### Sobre descuentos
- [ ] ¿Tu personal puede aplicar descuentos o cambiar precios manualmente?
- [ ] ¿Necesitas registrar quién cambió precios y por qué?
→ Si alguna es SÍ → Activa **Modificación de Precios**

### Sobre clientes anónimos
- [ ] ¿Vendes productos que no necesitan asociarse a un cliente?
- [ ] ¿Hay ventas rápidas donde no vale la pena registrar al comprador?
→ Si alguna es SÍ → Activa **Venta sin Cliente Registrado**

### Sobre registro rápido
- [ ] ¿Tu personal registra clientes nuevos durante la venta?
- [ ] ¿Necesitas velocidad al inscribir clientes que llegan sin registrarse?
→ Si alguna es SÍ → Activa **Creación Rápida de Cliente**

### Sobre comprobantes
- [ ] ¿Entregas boleta o comprobante al cliente?
- [ ] ¿Tienes requisitos legales de numeración secuencial?
→ Si alguna es SÍ → Activa **Numeración Secuencial de Boletas**

### Sobre supervisión
- [ ] ¿Tienes múltiples empleados manejando caja?
- [ ] ¿Necesitas supervisar diferencias y rendimiento por turno?
→ Si ambas son SÍ → Activa **Reporte de Cajas**

### Sobre ventas online
- [ ] ¿Vendes tanto presencialmente como desde una app/web?
- [ ] ¿Quieres ver todas las ventas (presenciales + online) en un solo lugar?
→ Si ambas son SÍ → Activa **Integración con Pagos Online**

### Sobre métodos de pago
- [ ] ¿Tus clientes a veces pagan con más de un método a la vez?
- [ ] ¿Los montos son altos y el cliente necesita dividir?
→ Si alguna es SÍ → Activa **Pago Dividido / Mixto**

### Sobre propinas
- [ ] ¿Tu industria maneja propinas (restaurante, peluquería, bar)?
- [ ] ¿Necesitas registrar propinas separadas de la venta?
→ Si ambas son SÍ → Activa **Manejo de Propinas**

---

## 6. PRESETS POR TIPO DE NEGOCIO

Configuraciones listas para copiar según tu industria.

### 📦 GYM / CENTRO DEPORTIVO

**Características activas:**
- ✅ Funciones core (abrir/cerrar caja, ventas, historial, anulaciones)
- ✅ Venta de planes/membresías con firma de contrato
- ✅ Venta sin cliente registrado (para productos como bebidas)
- ✅ Creación rápida de cliente (inscripción en el momento)
- ✅ Modificación de precios (descuentos y promos)
- ✅ Numeración de boletas
- ✅ Reporte de cajas
- ✅ Integración con pagos online (app del cliente)
- ❌ Pago dividido (montos manejables con un solo método)
- ❌ Propinas (no aplica)

**Ejemplo:** Gym donde el recepcionista vende membresías con contrato, bebidas sin registro, y el cliente también puede comprar su plan desde la app.

---

### 📦 CLÍNICA / CENTRO MÉDICO

**Características activas:**
- ✅ Funciones core
- ✅ Venta de paquetes de consultas/sesiones
- ✅ Creación rápida de cliente (paciente nuevo)
- ✅ Numeración de boletas (requisito legal de salud)
- ✅ Reporte de cajas
- ❌ Venta sin cliente (todo se asocia al paciente)
- ❌ Modificación de precios (precios fijos por servicio)
- ❌ Integración pagos online (depende del modelo)
- ❌ Pago dividido (montos moderados)
- ❌ Propinas (no aplica)

**Ejemplo:** Clínica donde la recepcionista cobra consultas, paquetes de exámenes y tratamientos, todo asociado al paciente con boleta.

---

### 📦 RESTAURANTE / CAFETERÍA

**Características activas:**
- ✅ Funciones core
- ✅ Venta sin cliente registrado (mayoría de ventas son anónimas)
- ✅ Modificación de precios (promos del día, combos)
- ✅ Numeración de boletas
- ✅ Reporte de cajas
- ✅ Pago dividido (dividir cuenta entre comensales)
- ✅ Propinas (práctica habitual)
- ❌ Venta de planes (no aplica)
- ❌ Creación rápida de cliente (no se registran comensales)
- ❌ Integración pagos online (salvo delivery)

**Ejemplo:** Restaurante donde el cajero cobra mesas completas, divide cuentas entre comensales, registra propinas y cierra caja al final del turno.

---

### 📦 TIENDA RETAIL

**Características activas:**
- ✅ Funciones core
- ✅ Venta sin cliente registrado (venta rápida a público general)
- ✅ Modificación de precios (rebajas, liquidación)
- ✅ Numeración de boletas (requisito legal)
- ✅ Reporte de cajas
- ✅ Integración pagos online (si tiene e-commerce)
- ❌ Venta de planes (no aplica)
- ❌ Creación rápida de cliente (no necesario)
- ❌ Pago dividido (montos típicamente manejables)
- ❌ Propinas (no aplica)

**Ejemplo:** Tienda de ropa donde el vendedor cobra productos, aplica descuentos de temporada, y el supervisor revisa cajas de todos los turnos.

---

### 📦 PELUQUERÍA / SPA / CENTRO DE BELLEZA

**Características activas:**
- ✅ Funciones core
- ✅ Creación rápida de cliente (registrar cliente nuevo)
- ✅ Numeración de boletas
- ✅ Reporte de cajas
- ✅ Propinas (práctica habitual)
- ✅ Venta de planes (paquetes de sesiones)
- ❌ Venta sin cliente (todo se asocia al cliente/profesional)
- ❌ Modificación de precios (precios fijos por servicio)
- ❌ Pago dividido (montos moderados)
- ❌ Integración pagos online (depende)

**Ejemplo:** Peluquería donde la recepcionista cobra servicios realizados por cada estilista, registra propinas por separado, y vende paquetes de sesiones.

---

### 📦 COWORKING

**Características activas:**
- ✅ Funciones core
- ✅ Venta de planes/membresías
- ✅ Creación rápida de cliente (miembro nuevo)
- ✅ Numeración de boletas
- ✅ Reporte de cajas
- ✅ Integración pagos online (compra de plan desde web)
- ❌ Venta sin cliente (todo asociado al miembro)
- ❌ Modificación de precios (planes con precio fijo)
- ❌ Pago dividido (no aplica)
- ❌ Propinas (no aplica)

**Ejemplo:** Coworking donde la recepción vende pases diarios, planes mensuales y servicios extras (impresión, sala de reunión), todo asociado al miembro.

---

## 7. DATOS UNIVERSALES (Todo POS necesita esto)

### Datos de cada venta

| Dato | Qué es | Tipo | Ejemplo |
|------|--------|------|---------|
| Identificador | ID único de la venta | Texto | "sale_1707000000_abc" |
| Número de boleta | Número legible para el cliente | Texto | "GY-20260203-0001" |
| Cliente | Quién compró | Texto | "María Silva" o "No registrado" |
| Empleado | Quién vendió | Texto | "Carlos López" |
| Productos/servicios | Qué se vendió | Lista | [{nombre, precio, cantidad}] |
| Total | Monto total cobrado | Número | 25000 |
| Método de pago | Cómo pagó | Texto | "efectivo", "débito", "crédito", "transferencia" |
| Código comprobante | Voucher del pago electrónico | Texto | "TBK1234567890" |
| Estado | Situación de la venta | Texto | "completada", "pendiente anulación", "cancelada" |
| Fecha/hora | Cuándo se hizo | Fecha | "2026-02-03 14:23:45" |
| Caja asociada | A qué turno pertenece | Texto | "cr_1707000000_xyz" |

### Datos de cada caja/turno

| Dato | Qué es | Tipo | Ejemplo |
|------|--------|------|---------|
| Identificador | ID único de la caja | Texto | "cr_1707000000_xyz" |
| Quién abrió | Empleado del turno | Texto | "Carlos López" |
| Hora apertura | Inicio del turno | Fecha | "2026-02-03 09:00:00" |
| Monto inicial | Efectivo al empezar | Número | 50000 |
| Quién cerró | Quién hizo el arqueo | Texto | "Carlos López" |
| Hora cierre | Fin del turno | Fecha | "2026-02-03 17:30:00" |
| Esperado por método | Calculado por el sistema | Números | {efectivo: 75000, débito: 45000...} |
| Declarado por método | Lo que reportó el empleado | Números | {efectivo: 74500, débito: 45000...} |
| Diferencias | Declarado - Esperado | Números | {efectivo: -500, débito: 0...} |
| Notas | Explicación de diferencias | Texto | "Vuelto mal dado" |
| Estado | Abierta o cerrada | Texto | "abierta" o "cerrada" |

---

## 8. DATOS OPCIONALES (Según características activas)

| Dato | Para qué sirve | Tipo | Activar si... |
|------|----------------|------|---------------|
| Precio original | Auditoría de cambios de precio | Número | Modificación de precios |
| Motivo cambio precio | Justificación del descuento | Texto | Modificación de precios |
| Quién modificó precio | Responsable del cambio | Texto | Modificación de precios |
| Firma de contrato | Imagen de firma digital | Imagen | Venta de planes con contrato |
| Suscripción creada | ID de la membresía activada | Texto | Venta de planes |
| Propina | Monto de propina | Número | Manejo de propinas |
| Método pago propina | Cómo se pagó la propina | Texto | Manejo de propinas |
| Pagos parciales | Desglose por método | Lista | Pago dividido |
| Sede de la venta | Dónde se hizo | Texto | Multi-sede |
| ID transacción online | Referencia de pasarela | Texto | Integración pagos online |

---

## 9. INTEGRACIONES CON OTROS MÓDULOS

Este módulo se conecta con varios sistemas del negocio. Aquí están las conexiones más comunes.

### Con Módulo de Planes / Suscripciones
- Al vender un plan → se crea automáticamente una suscripción activa
- La suscripción tiene fecha de inicio y fin según el plan vendido
- Si se anula la venta del plan → la suscripción se cancela automáticamente
- Los descuentos por lealtad se calculan al momento de la venta

### Con Módulo de Contratos (si está activo)
- Al vender un plan con contrato → se muestra el contrato antes de cobrar
- El cliente firma en pantalla (touch o mouse)
- La firma se guarda como imagen asociada a la venta y suscripción

### Con Módulo de Productos / Inventario
- El catálogo de productos disponibles viene de este módulo
- Cada producto tiene nombre, precio y categoría
- Opcionalmente: la venta descuenta stock automáticamente

### Con Módulo de Autenticación / Usuarios
- Se verifica que el empleado tenga permiso para usar el POS
- Se registra quién hizo cada venta, apertura y cierre de caja
- Solo administradores pueden aprobar anulaciones
- Se buscan clientes registrados para asociar a ventas

### Con Módulo de Pagos Online (si está activo)
- Las ventas desde la app del cliente llegan al POS automáticamente
- Aparecen en el historial con método "Pago online"
- No requieren caja abierta ni comprobante manual

### Con Módulo de Check-in / Control de Acceso
- Al vender un plan → el cliente puede usar el servicio inmediatamente
- El check-in valida que tenga suscripción activa (creada por el POS)

### Con Módulo de Reportes / Analytics
- Las ventas alimentan reportes de ingresos diarios/mensuales
- Las cajas alimentan reportes de cumplimiento por empleado
- Las anulaciones se reportan por frecuencia y motivo

---

## 10. CASOS ESPECIALES / EXCEPCIONES

Situaciones que van a pasar y el sistema debe manejar correctamente.

**¿Qué pasa si el terminal de tarjetas falla?**
El empleado puede ofrecer pago en efectivo o transferencia. Si el cliente ya pasó la tarjeta y salió el voucher, se ingresa el código normalmente. Si no salió voucher, no se puede completar con tarjeta.

**¿Qué pasa si se cierra la caja sin vender nada?**
Es válido. La caja queda con los mismos montos que al abrir. Diferencias deberían ser $0.

**¿Qué pasa si hay diferencia de caja?**
El sistema muestra cuánto falta o sobra. El empleado puede agregar notas explicando. El administrador revisa después. El cierre NO se bloquea — las diferencias quedan registradas para auditoría.

**¿Qué pasa si un cliente quiere devolver un producto días después?**
Se busca la venta original en el historial. Se solicita anulación con motivo "Devolución". El administrador aprueba. La devolución del dinero se hace manualmente fuera del sistema (o por el mismo método de pago, según tu proceso).

**¿Qué pasa si se vende un plan a alguien que ya tiene uno activo?**
El sistema permite la venta (puede ser renovación o upgrade). Queda con múltiples suscripciones. El administrador puede ajustar fechas si es necesario. Regla de oro: nunca perder días pagados.

**¿Qué pasa si alguien intenta vender sin abrir caja?**
El sistema bloquea la venta con mensaje "Debe abrir caja primero". No permite agregar productos al carrito. Excepción: ventas online que llegan automáticamente desde la pasarela.

**¿Qué pasa si el empleado se va sin cerrar caja?**
La caja queda "abierta". El siguiente turno ve advertencia. Un administrador puede cerrarla manualmente.

**¿Qué pasa si se cae el internet durante una venta?**
Depende de tu implementación. Idealmente: las ventas en efectivo se guardan localmente y se sincronizan cuando vuelve la conexión. Las ventas con tarjeta: el voucher ya está en el terminal físico, se ingresa cuando vuelva internet.

**¿Qué pasa con ventas sospechosas o montos inusuales?**
Quedan registradas normalmente. El administrador puede auditarlas desde el panel. Las modificaciones de precio quedan marcadas con motivo y responsable.

**¿Qué pasa si se ingresa un código de comprobante duplicado?**
Depende de tu política: puedes validar unicidad (más seguro) o permitir duplicados (más flexible). El terminal/pasarela real maneja la validación de su lado.

---

## 11. EJEMPLO COMPLETO: Aplicando el Boilerplate

### Escenario: POS para Gym "IronFit"

**Contexto:** Gym mediano en Chile, una sede, con recepción que vende membresías y productos (bebidas, suplementos, merchandising). 2 recepcionistas en turnos mañana/tarde.

**Decisiones del dueño:**
- Los recepcionistas venden planes Y productos
- Acepto efectivo, débito, crédito y transferencia
- Quiero control de caja por turno (cada recepcionista abre y cierra la suya)
- Quiero poder dar descuentos a clientes frecuentes
- Los clientes también pueden comprar planes desde la app
- Necesito aprobar anulaciones personalmente
- Los planes requieren firma de contrato

**Configuración activada:**
```
✅ Funciones Core (abrir/cerrar caja, ventas, historial, anulaciones)
✅ Venta de planes con contrato
✅ Venta sin cliente registrado (para productos)
✅ Creación rápida de cliente (inscripción en el momento)
✅ Modificación de precios (descuentos)
✅ Numeración de boletas ("IF-YYYYMMDD-XXXX")
✅ Reporte de cajas para admin
✅ Integración con pagos online (app del cliente)
❌ Pago dividido
❌ Propinas
```

**Métodos de pago configurados:**
- Efectivo → confirmación inmediata
- Tarjeta débito → requiere código voucher Transbank
- Tarjeta crédito → requiere código voucher Transbank
- Transferencia → requiere código/comprobante
- WebPay (desde app) → automático

**Ejemplo de turno completo:**

**09:00 — Apertura:**
- Recepcionista abre caja con $50.000 de fondo

**09:30 — Venta de plan:**
- Cliente nuevo llega a inscribirse
- Recepcionista crea cliente rápido: RUT 18.123.456-7, "Pedro Muñoz"
- Selecciona "Plan Gold 30 días" ($35.000)
- Cliente firma contrato en pantalla
- Paga con tarjeta débito → código voucher "TBK9876543210"
- Boleta: IF-20260204-0001

**10:15 — Venta de producto:**
- Cliente quiere comprar una bebida isotónica ($2.000)
- No se registra cliente (venta rápida)
- Paga en efectivo
- Boleta: IF-20260204-0002

**12:00 — Venta con descuento:**
- Cliente frecuente renueva plan "Plan Básico" ($25.000)
- Recepcionista aplica 10% descuento → $22.500
- Motivo: "Cliente VIP, lleva 6 meses continuo"
- Paga con transferencia → código "TRF20260204001"
- Boleta: IF-20260204-0003

**14:00 — Anulación:**
- Cliente devuelve suplemento comprado ayer
- Recepcionista busca la venta en historial
- Solicita anulación: "Cliente devolvió producto sin abrir"
- Admin recibe notificación y aprueba

**15:00 — Venta online:**
- Un cliente compra "Plan Mensual" desde la app con WebPay
- La venta aparece automáticamente en el historial
- Boleta: IF-20260204-0004 (generada automáticamente)

**17:00 — Cierre de caja:**
- Recepcionista cierra caja
- Efectivo esperado: $52.000 (50.000 inicial + 2.000 de bebida)
- Efectivo contado: $52.000 ✅
- Débito esperado: $35.000 / Declarado: $35.000 ✅
- Transferencias esperadas: $22.500 / Declarado: $22.500 ✅
- Diferencia total: $0 ✅
- Notas: "Turno sin novedades"

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
> Basado en experiencia real de implementación en proyectos con punto de venta presencial.
> Diseñado para ser reutilizable en cualquier negocio que venda presencialmente.
