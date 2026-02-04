# MÓDULO: SISTEMA DE REPORTES Y ANALYTICS — BOILERPLATE

> **Tipo:** Boilerplate de concepto en lenguaje natural
> **Versión:** 1.0 | **Fecha:** 04/02/2026
> **Origen:** Extraído y generalizado desde módulo de reportes de proyecto real
> **Uso:** Guía para implementar un sistema de reportes/analytics en CUALQUIER negocio que necesite medir su rendimiento
> **Contiene código:** NO — solo concepto puro

---

## 1. ¿QUÉ ES ESTE MÓDULO?

Un sistema de reportes y analytics es el tablero de control de tu negocio. Es donde los dueños y administradores pueden ver en una sola pantalla cuánto dinero está entrando, cuántos clientes activos hay, qué se está vendiendo, y cómo va el negocio en general. Sin este módulo, estás volando a ciegas — tomando decisiones sin datos.

Piensa en esto como el panel de instrumentos de un avión: te dice la altitud (ingresos), velocidad (ventas del día), combustible (clientes activos), y dirección (tendencias). No mueve el avión por ti, pero sin él no sabes hacia dónde vas ni si estás en problemas.

Este módulo es necesario para cualquier negocio que quiera crecer de forma informada. Si solo tienes 5 clientes y vendes poco, puedes llevar todo en la cabeza. Pero en cuanto crecés un poco, necesitas datos organizados para tomar decisiones.

**Ejemplos reales de cómo se usa:**

- **Gimnasio:** Dueño ve cuántos socios activos hay, cuánto facturó este mes vs el anterior, y qué plan se vende más.
- **Clínica:** Administrador revisa cuántas consultas se atendieron esta semana, ingresos por profesional, y pacientes nuevos vs recurrentes.
- **Restaurante:** Gerente ve ticket promedio por mesa, platos más vendidos, y comparación de turnos almuerzo vs cena.
- **E-commerce:** Dueño monitorea ventas diarias, productos más vendidos, tasa de conversión, y clientes recurrentes.
- **Coworking:** Administrador revisa ocupación por sede, planes más contratados, y proyección de ingresos.
- **SaaS:** Fundador analiza MRR (ingreso mensual recurrente), churn rate, nuevos suscriptores, y uso de funcionalidades.

---

## 2. FUNCIONES CORE (Las que TODO negocio necesita)

Estas funciones son obligatorias. Sin ellas, no tienes visibilidad real de tu negocio. No importa tu industria — las necesitas todas.

### 2.1 Panel de Control (Dashboard)

**Qué hace:** Muestra todas las métricas importantes del negocio en una sola pantalla. Es la primera cosa que ve el administrador al entrar al sistema.

**Quién la usa:** Solo administradores y roles con permiso de ver datos financieros/operativos.

**Cómo funciona en lenguaje simple:**
1. El administrador inicia sesión y entra al panel de control
2. El sistema carga automáticamente todos los indicadores principales
3. Todo se muestra en una sola pantalla, organizado por secciones
4. Los datos son en tiempo real (o casi — con un retraso máximo de minutos)
5. No necesita configurar nada — todo carga solo

**Qué debe mostrar (indicadores mínimos):**

| Indicador | Qué mide | Ejemplo |
|-----------|----------|---------|
| Clientes/usuarios activos | Cuántas personas usan tu servicio ahora | 456 socios activos |
| Ingresos de hoy | Cuánto dinero entró hoy | $350.000 |
| Ingresos del período | Cuánto dinero entró esta semana/mes | $8.500.000 este mes |
| Actividad reciente | Últimas acciones en el sistema | Últimos 15 check-ins, últimas 10 reservas |
| Transacciones recientes | Últimas ventas realizadas | Últimas 50-100 ventas |

**Ejemplos por industria:**

- **Gym:** Socios activos, check-ins de hoy, ventas del día, cartera mensual, gráfico de ingresos
- **Clínica:** Pacientes activos, consultas de hoy, ingresos del día, profesionales atendiendo, paquetes por vencer
- **Restaurante:** Mesas atendidas hoy, ticket promedio, platos vendidos, ingresos del turno, pedidos activos
- **E-commerce:** Pedidos hoy, ventas totales, productos en stock bajo, carrito abandonado, tasa de conversión
- **Coworking:** Miembros activos, ocupación actual, ingresos del mes, planes por vencer, pases vendidos hoy
- **SaaS:** Usuarios activos, MRR, nuevos suscriptores, churn del mes, uso por funcionalidad

**Validaciones:**
- Si no hay datos para un indicador → mostrar 0 o "Sin datos", nunca un error
- Los datos financieros se muestran en la moneda local del negocio
- Todo se calcula en la zona horaria del negocio (no UTC)
- Los indicadores deben cargar rápido (menos de 3 segundos idealmente)

---

### 2.2 Ver Ingresos por Período

**Qué hace:** Muestra cuánto dinero ingresó en diferentes rangos de tiempo, permitiendo comparar períodos y detectar tendencias.

**Quién la usa:** Solo administradores.

**Cómo funciona en lenguaje simple:**
1. El dashboard muestra por defecto los ingresos de hoy y del mes actual
2. El administrador puede cambiar el período: seleccionar otro mes, otro año
3. El sistema recalcula los ingresos para el período seleccionado
4. Muestra el total y opcionalmente un desglose (por sede, por categoría, por vendedor)
5. Un gráfico visual muestra la tendencia día a día del período

**Períodos mínimos que debe soportar:**

| Período | Qué muestra | Para qué sirve |
|---------|-------------|-----------------|
| Hoy | Ingresos del día actual | Control diario |
| Últimos 3 días | Ingresos de los últimos 3 días naturales | Tendencia inmediata |
| Últimos 7 días | Ingresos de la semana | Pulso semanal |
| Mes seleccionado | Ingresos de un mes específico | Análisis mensual |

**Ejemplos por industria:**
- **Gym:** "Este mes facturamos $8.5M — $3.2M en clínica y $5.3M en gimnasio"
- **Restaurante:** "Hoy llevamos $1.2M — turno almuerzo $750K, turno cena $450K (aún en curso)"
- **E-commerce:** "Esta semana vendimos $15M — 40% más que la semana pasada"
- **Coworking:** "Enero: $12M en planes mensuales + $800K en pases diarios + $200K en servicios extra"

**Visualización recomendada:**
- Gráfico de área o barras con los ingresos de cada día del período
- Permite ver picos (fines de semana, inicio de mes) y valles (días muertos)
- Opcionalmente: línea de comparación con el período anterior

**Validaciones:**
- Las ventas canceladas/anuladas NO se incluyen en los ingresos
- Todas las fechas se procesan en la zona horaria del negocio
- Si no hay ventas en un día → ese día aparece como $0 en el gráfico (no se omite)
- Los montos se muestran como números enteros en la moneda local (sin decimales para CLP, con decimales para USD)

---

### 2.3 Ver Transacciones Recientes

**Qué hace:** Muestra una lista de las últimas ventas realizadas, con opción de filtrar por tipo, categoría o sede.

**Quién la usa:** Solo administradores.

**Cómo funciona en lenguaje simple:**
1. El dashboard muestra automáticamente las últimas ventas (50-100 más recientes)
2. El administrador puede filtrar por tipo (productos, planes, servicios)
3. Puede filtrar por sede o sucursal (si aplica)
4. Cada venta muestra: quién compró, qué compró, cuánto pagó, cuándo, y estado

**Datos que muestra por transacción:**
- Nombre del cliente (o "No registrado" si fue anónima)
- Producto o servicio comprado
- Monto total
- Fecha y hora
- Método de pago
- Sede o categoría (si aplica, con color distintivo para diferenciar)
- Estado (completada, cancelada, pendiente)

**Filtros disponibles:**

| Filtro | Opciones típicas | Ejemplo |
|--------|------------------|---------|
| Por tipo | Productos, Planes, Servicios, Todos | "Solo planes" |
| Por sede | Sede 1, Sede 2, Todas | "Solo sucursal centro" |
| Por estado | Completadas, Canceladas, Todas | "Solo completadas" |
| Por método de pago | Efectivo, Tarjeta, Transferencia, Online | "Solo efectivo" |

**Ejemplos por industria:**
- **Gym:** Filtrar "Solo planes" para ver inscripciones recientes vs "Solo productos" para ver ventas de tienda
- **Clínica:** Filtrar por "Solo consultas" vs "Solo paquetes" vs "Solo productos"
- **Restaurante:** Filtrar por "Turno almuerzo" vs "Turno cena"
- **E-commerce:** Filtrar por "Categoría electrónica" vs "Categoría ropa"

**Validaciones:**
- Limitar la cantidad de transacciones mostradas (50-100) para no sobrecargar la pantalla
- Las ventas canceladas se muestran con indicador visual claro (color diferente, ícono, tachado)
- Los filtros se aplican instantáneamente sin recargar toda la página

---

### 2.4 Exportar Datos a Archivo Descargable

**Qué hace:** Genera un archivo descargable (Excel, CSV) con datos detallados de un período seleccionado. Permite análisis fuera del sistema, compartir con contadores, o guardar respaldos.

**Quién la usa:** Solo administradores.

**Cómo funciona en lenguaje simple:**
1. El administrador va a la sección de reportes/exportación
2. Selecciona la fecha de inicio del período
3. Selecciona la fecha de fin del período
4. Opcionalmente selecciona qué tipo de datos exportar (ventas, clientes, suscripciones)
5. Hace clic en "Descargar"
6. El sistema busca todos los datos entre esas fechas
7. Genera un archivo con los datos organizados en columnas
8. El navegador descarga el archivo automáticamente

**Datos mínimos que debe incluir el reporte de ventas:**

| Columna | Qué contiene | Ejemplo |
|---------|-------------|---------|
| Fecha y hora | Cuándo se hizo la venta | "03-02-2026 14:30" |
| Identificador | Referencia única de la venta | "VTA-20260203-0015" |
| Monto total | Cuánto se cobró | $45.000 |
| Método de pago | Cómo pagó el cliente | "Débito" |
| Productos/servicios | Qué se vendió | "1x Plan Mensual, 2x Bebida" |
| Vendedor | Quién realizó la venta | "María González" |
| Cliente | A quién se le vendió | "Juan Pérez" |
| Categoría/Sede | Dónde o de qué tipo | "Sucursal Centro" |
| Estado | Si está activa o cancelada | "Completada" |

**Formato del nombre del archivo:**
`Reporte_[Tipo]_[FechaInicio]_[FechaFin].[extensión]`
Ejemplo: `Reporte_Ventas_2026-01-01_2026-01-31.xlsx`

**Ejemplos por industria:**
- **Gym:** Exportar ventas de enero para enviárselo al contador
- **Clínica:** Exportar consultas del trimestre para reporte a la dirección médica
- **Restaurante:** Exportar ventas del mes para comparar con inventario
- **E-commerce:** Exportar pedidos de la semana para conciliar con despacho

**Validaciones:**
- Si no hay datos en el período → generar archivo vacío con encabezados (no dar error)
- El archivo debe descargarse inmediatamente, no enviarse por email (para períodos cortos)
- Para períodos muy largos con miles de registros → considerar generar en segundo plano y notificar cuando esté listo
- Las fechas en el archivo deben estar en formato legible (DD-MM-YYYY), no en formato de programación

---

### 2.5 Ver Clientes/Suscriptores por Categoría

**Qué hace:** Muestra una vista organizada de todos los clientes agrupados por el plan, categoría o tipo de servicio al que están suscritos. Permite ver de un vistazo cuántos clientes tiene cada plan y quiénes son.

**Quién la usa:** Solo administradores.

**Cómo funciona en lenguaje simple:**
1. El dashboard tiene una sección de "Membresías" o "Clientes por plan"
2. Muestra cada plan/categoría como una fila con resumen
3. El administrador puede expandir cada plan para ver la lista completa de clientes
4. Cada cliente muestra sus datos de contacto y estado de su suscripción

**Qué muestra por cada plan/categoría:**
- Nombre del plan
- Cantidad de clientes activos en ese plan
- Precio unitario del plan
- Ingresos totales generados por ese plan (precio × cantidad de clientes)

**Qué muestra por cada cliente dentro de un plan:**
- Nombre completo
- Identificador (RUT, email, o lo que use tu sistema)
- Teléfono de contacto
- Sesiones disponibles / sesiones totales (si aplica)
- Fecha de vencimiento de la suscripción
- Estado especial (si tiene alguna marca o flag)

**Ejemplos por industria:**
- **Gym:** "Plan Gold (45 clientes, $29.990 c/u, $1.349.550 total) → [lista expandible de socios]"
- **Clínica:** "Paquete 5 Consultas (12 pacientes, $150.000 c/u) → [lista con sesiones restantes]"
- **Coworking:** "Plan Diurno (30 miembros, $89.000 c/u) → [lista con vencimientos]"
- **SaaS:** "Plan Pro (200 usuarios, $19.990 c/u) → [lista con uso de funcionalidades]"

**Validaciones:**
- Si hay demasiados clientes (500+) → paginar o limitar la vista para no sobrecargar
- Los totales (KPIs generales) deben considerar TODOS los clientes, aunque la lista visual se limite
- Un cliente puede aparecer en más de un plan si tiene múltiples suscripciones activas
- Los datos de contacto solo son visibles para roles con permiso

---

### 2.6 Ver Actividad Reciente

**Qué hace:** Muestra las últimas acciones realizadas en el sistema: últimos accesos, últimas reservas, últimos check-ins, o cualquier otra acción relevante para tu negocio.

**Quién la usa:** Solo administradores.

**Cómo funciona en lenguaje simple:**
1. El dashboard tiene una sección de "Actividad reciente"
2. Muestra los últimos 10-20 eventos del sistema en orden cronológico
3. Cada evento dice: quién hizo qué, dónde, y cuándo
4. Se actualiza automáticamente (o al refrescar la página)

**Datos que muestra por evento:**
- Nombre de la persona
- Qué acción realizó (check-in, reserva, compra, etc.)
- Dónde (sede, sala, servicio)
- Cómo (QR, manual, app, presencial)
- Cuándo (hora exacta)

**Ejemplos por industria:**
- **Gym:** "Pedro Muñoz — Check-in GYM — QR — 09:15"
- **Clínica:** "Ana López — Consulta Dr. García — Sala 3 — 10:00"
- **Coworking:** "Carlos Díaz — Ingreso Oficina Norte — Tarjeta — 08:30"
- **Restaurante:** "Mesa 7 — Pedido completado — 14:22"

**Validaciones:**
- Limitar a 10-20 eventos para que la sección sea rápida y ligera
- Ordenar siempre de más reciente a más antiguo
- Si no hay actividad → mostrar "Sin actividad reciente" en vez de sección vacía

---

## 3. CARACTERÍSTICAS OPCIONALES (Módulos que se activan/desactivan)

Estas son funciones que puedes activar o no según tu tipo de negocio. Lee cada una y decide si la necesitas.

---

### 🔧 OPCIÓN: Gestión de Suscripciones desde Reportes

**¿Qué hace?**
Permite editar los datos de una suscripción individual directamente desde la vista de reportes, sin tener que ir al módulo de suscripciones. También permite cambios masivos (modificar varias suscripciones a la vez).

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con muchas suscripciones que requieren ajustes frecuentes (gyms, clínicas, SaaS)
- ✅ Negocios que migran clientes entre planes con frecuencia
- ❌ Negocios sin modelo de suscripción (retail, restaurante)

**¿Cómo funciona en lenguaje simple?**

**Edición individual:**
1. Admin ve la lista de clientes en un plan
2. Hace clic en "Editar" junto a un cliente
3. Puede cambiar: plan, fechas, sesiones, estado
4. Guarda los cambios
5. La lista se actualiza inmediatamente

**Cambios masivos:**
1. Admin marca con checkbox varios clientes de la lista
2. Aparece una barra de acciones con opciones: "Cambiar Plan", "Cambiar Categoría/Sede"
3. Selecciona la acción y elige el nuevo valor
4. Confirma
5. El sistema actualiza todas las suscripciones seleccionadas
6. Muestra mensaje: "X suscripciones actualizadas"

**Datos que necesita:**
- Suscripción(es) a modificar
- Nuevos valores (plan, sede, fechas, sesiones)

**Ejemplos por industria:**
- **Gym:** Mover 10 clientes de "Plan Mensual" a "Plan Trimestral" con descuento de renovación
- **Clínica:** Cambiar 5 pacientes de "Sede Centro" a "Sede Norte" por apertura nueva
- **SaaS:** Migrar usuarios de "Plan Legacy" a "Plan Pro" por cambio de precios

**Validaciones:**
- Solo administradores pueden editar suscripciones
- Los cambios masivos deben mostrar confirmación antes de ejecutar
- Si dos administradores editan la misma suscripción al mismo tiempo → gana el último que guardó
- El sistema debe registrar quién hizo cada cambio y cuándo (auditoría)

**Complejidad de implementación:** Media
**¿Lo necesitas?** Solo si manejas suscripciones y necesitas hacer ajustes frecuentes sin ir a otro módulo.

---

### 🔧 OPCIÓN: Marcado de Clientes con Etiquetas/Flags

**¿Qué hace?**
Permite marcar clientes con etiquetas especiales para seguimiento interno. Por ejemplo: "rescatado" (cliente que iba a cancelar pero lo convenciste de quedarse), "VIP", "en riesgo", "nuevo", etc.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con retención de clientes importante (gyms, SaaS, suscripciones)
- ✅ Negocios con CRM básico o que quieren tracking de relaciones
- ❌ Negocios de compra única sin relación continuada

**¿Cómo funciona en lenguaje simple?**
1. Admin ve un cliente en la lista de membresías
2. Hace clic en un toggle o botón junto al nombre
3. El cliente queda marcado con la etiqueta (ej: "Rescatado")
4. Se registra la fecha y hora del marcado
5. El admin puede filtrar después por clientes con esa etiqueta
6. Sirve para seguimiento: "¿Cuántos clientes rescatamos este mes?"

**Etiquetas comunes por industria:**

| Etiqueta | Para qué sirve | Industria típica |
|----------|----------------|------------------|
| Rescatado | Cliente que iba a cancelar pero se retuvo | Gym, SaaS, streaming |
| VIP | Cliente especial que merece atención extra | Cualquiera |
| En riesgo | Cliente que muestra señales de abandono | Gym, SaaS |
| Nuevo | Cliente reciente que necesita onboarding | Cualquiera |
| Moroso | Cliente con pago pendiente o atrasado | Cualquiera con cobros recurrentes |

**Datos que necesita:**
- Etiqueta aplicada
- Fecha y hora del marcado
- Quién la marcó (automático)

**Validaciones:**
- Marcar/desmarcar es instantáneo (toggle)
- Se guarda historial: cuándo se marcó y cuándo se desmarcó
- Un cliente puede tener múltiples etiquetas simultáneamente

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Solo si necesitas hacer seguimiento de clientes por categorías internas que van más allá de su plan.

---

### 🔧 OPCIÓN: Contacto Directo desde Reportes

**¿Qué hace?**
Permite contactar a un cliente directamente desde la vista de reportes con un solo clic, abriendo WhatsApp, email, o el canal de comunicación configurado.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con contacto frecuente con clientes (gyms, clínicas, servicios)
- ✅ Negocios que necesitan comunicarse rápido con clientes específicos
- ❌ Negocios masivos donde el contacto individual no escala (e-commerce grande)

**¿Cómo funciona en lenguaje simple?**
1. Admin ve un cliente en la lista
2. Junto al nombre hay un botón de contacto (ícono de WhatsApp, email, teléfono)
3. Al hacer clic → se abre WhatsApp Web/app con el número del cliente listo para escribir
4. O se abre el cliente de email con el correo del cliente prellenado

**Canales de contacto comunes:**

| Canal | Cómo funciona | Requisito |
|-------|---------------|-----------|
| WhatsApp | Abre wa.me/[número] con mensaje prellenado | Cliente tiene teléfono registrado |
| Email | Abre mailto:[email] | Cliente tiene email registrado |
| Teléfono | Muestra/copia el número para llamar | Cliente tiene teléfono registrado |
| SMS | Abre sms:[número] | Cliente tiene teléfono registrado |

**Validaciones:**
- Si el cliente no tiene el dato de contacto → el botón aparece deshabilitado o no se muestra
- El mensaje prellenado de WhatsApp puede ser configurable (ej: "Hola [nombre], te contactamos de [negocio]...")
- No se guarda registro de contacto en el sistema (solo abre el canal externo)

**Complejidad de implementación:** Baja
**¿Lo necesitas?** Solo si tu equipo contacta clientes frecuentemente y quieres hacerlo directo desde el panel.

---

### 🔧 OPCIÓN: Desglose por Sede/Sucursal

**¿Qué hace?**
Divide todos los indicadores y reportes por sede o sucursal, permitiendo comparar rendimiento entre ubicaciones.

**¿Para qué tipo de negocio sirve?**
- ✅ Cadenas con múltiples sedes (gyms, clínicas, retail, coworking)
- ❌ Negocios con una sola ubicación

**¿Cómo funciona en lenguaje simple?**
1. Cada indicador del dashboard muestra el total y el desglose por sede
2. Ejemplo: "Ingresos del mes: $8.5M total — Sede Centro $5.2M, Sede Norte $3.3M"
3. Los gráficos pueden separar líneas/colores por sede
4. Las listas de clientes se pueden filtrar por sede
5. Los reportes exportados incluyen columna de sede

**Datos que necesita:**
- Cada venta, suscripción y acción tiene asociada una sede
- Lista de sedes disponibles en el sistema

**Ejemplos por industria:**
- **Gym:** "Sede Centro: 280 socios / Sede Norte: 176 socios — diferencia de 104"
- **Clínica:** "Sucursal Providencia: 45 consultas hoy / Sucursal Las Condes: 32 consultas"
- **Retail:** "Tienda Mall: $12M / Tienda Calle: $8M — Mall vende 50% más"

**Validaciones:**
- Los totales generales siempre suman TODAS las sedes
- Si una sede no tiene datos → mostrar $0, no omitirla
- Cada sede puede tener un color distintivo en gráficos y listas

**Complejidad de implementación:** Media
**¿Lo necesitas?** Solo si tienes más de una ubicación física.

---

### 🔧 OPCIÓN: Gráficos y Visualizaciones Avanzadas

**¿Qué hace?**
Agrega gráficos interactivos al dashboard que muestran tendencias, comparaciones y distribuciones de forma visual.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios que necesitan detectar tendencias y patrones rápidamente
- ✅ Negocios donde el dueño/admin necesita tomar decisiones basadas en datos
- ❌ Negocios muy pequeños donde los números planos son suficientes

**Tipos de gráficos útiles:**

| Tipo de gráfico | Qué muestra | Ejemplo |
|-----------------|-------------|---------|
| Área/Líneas diarias | Ingresos de cada día del mes | Picos los fines de semana, valles entre semana |
| Barras comparativas | Ingresos por sede o categoría | Sede A vs Sede B este mes |
| Torta/Dona | Distribución de clientes por plan | 40% mensual, 35% trimestral, 25% semestral |
| Barras apiladas | Composición de ingresos por fuente | Planes + Productos + Servicios = Total |

**Gráfico mínimo recomendado:**
- Gráfico de área con ingresos de cada día del mes seleccionado
- Eje X: días del mes (1-31)
- Eje Y: monto en moneda local
- Permite ver de un vistazo los días fuertes y débiles

**Validaciones:**
- Los gráficos deben cargar rápido (datos pre-calculados si es necesario)
- Mostrar tooltip con el valor exacto al pasar el mouse sobre un punto
- Días sin ventas aparecen como $0 en el gráfico (no se saltan)
- Responsive: debe verse bien en móvil y desktop

**Complejidad de implementación:** Media
**¿Lo necesitas?** Altamente recomendado para cualquier negocio que quiera crecer con datos.

---

### 🔧 OPCIÓN: Reportes de Diferentes Tipos de Datos

**¿Qué hace?**
Permite exportar no solo ventas, sino también clientes, suscripciones, actividad, inventario, y cualquier otro dato relevante del sistema.

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios con requisitos contables o legales de reporte
- ✅ Negocios que necesitan cruzar datos fuera del sistema
- ❌ Negocios donde solo importa el reporte de ventas

**Tipos de reportes comunes:**

| Reporte | Qué incluye | Para qué sirve |
|---------|------------|-----------------|
| Ventas | Todas las transacciones con detalle | Contabilidad, auditoría |
| Clientes | Lista de todos los clientes con datos | Marketing, campañas |
| Suscripciones | Membresías activas/vencidas | Proyección de ingresos |
| Actividad/Asistencia | Check-ins, reservas, uso | Operaciones, ocupación |
| Inventario | Stock de productos | Compras, reposición |
| Caja | Aperturas, cierres, diferencias | Auditoría financiera |

**Validaciones:**
- Cada tipo de reporte tiene sus propias columnas y filtros
- Los reportes grandes (miles de filas) deben generarse sin bloquear la interfaz
- Formatos de exportación: Excel (.xlsx) como mínimo, CSV como alternativa

**Complejidad de implementación:** Media-Alta
**¿Lo necesitas?** Depende de tu madurez operativa. Empieza con ventas y agrega más después.

---

### 🔧 OPCIÓN: Indicadores Comparativos (Período vs Período)

**¿Qué hace?**
Muestra junto a cada indicador la comparación con el período anterior: "Este mes $8.5M (+12% vs mes pasado)".

**¿Para qué tipo de negocio sirve?**
- ✅ Negocios en crecimiento que necesitan medir progreso
- ✅ Negocios con estacionalidad que necesitan comparar meses
- ❌ Negocios muy nuevos sin datos históricos suficientes

**¿Cómo funciona en lenguaje simple?**
1. Cada indicador muestra el valor actual Y el cambio porcentual vs el período anterior
2. Ejemplo: "Ingresos: $8.5M ↑12%" (flecha verde si subió, roja si bajó)
3. El período de comparación es automático (este mes vs mes anterior, esta semana vs semana anterior)

**Ejemplos:**
- "Clientes activos: 456 ↑5% (vs 434 el mes pasado)"
- "Ventas hoy: $350K ↓15% (vs $412K ayer)"
- "Check-ins: 47 ↑8% (vs 43 promedio de la semana)"

**Validaciones:**
- Si no hay datos del período anterior → no mostrar comparación (no inventar)
- Flecha verde/positiva si mejoró, roja/negativa si empeoró
- El porcentaje se calcula: ((actual - anterior) / anterior) × 100

**Complejidad de implementación:** Baja-Media
**¿Lo necesitas?** Altamente recomendado si llevas más de 1-2 meses operando.

---

## 4. FLUJOS DE USUARIO COMPLETOS

Estos son los recorridos paso a paso de las acciones principales. Son genéricos y aplican a cualquier industria.

### Flujo: Administrador revisa el dashboard al iniciar el día

1. Admin inicia sesión en la aplicación
2. El sistema lo lleva al panel de control (dashboard)
3. Ve los indicadores principales cargados automáticamente:
   - Clientes/socios activos
   - Ingresos de hoy (puede ser $0 si recién abre)
   - Ingresos del mes en curso
   - Actividad reciente
4. Revisa si hubo ventas durante la noche o primeras horas
5. Ve la sección de actividad reciente para confirmar quién ha entrado
6. Si quiere más detalle → navega a las secciones específicas

### Flujo: Administrador exporta reporte de ventas para el contador

1. Admin entra a la sección "Reportes"
2. Selecciona fecha de inicio: primer día del mes (ej: 01-01-2026)
3. Selecciona fecha de fin: último día del mes (ej: 31-01-2026)
4. Hace clic en "Descargar Excel"
5. El sistema busca todas las ventas de enero 2026
6. Genera archivo Excel con columnas: fecha, ID, monto, método, productos, vendedor, cliente, sede, estado
7. El navegador descarga automáticamente "Reporte_Ventas_2026-01-01_2026-01-31.xlsx"
8. Admin envía el archivo a su contador por email

### Flujo: Administrador consulta ganancias de un mes específico

1. Admin está en el dashboard viendo los datos del mes actual
2. Quiere ver cómo le fue en el mes pasado
3. Hace clic en el selector de mes y elige el mes deseado
4. Hace clic en el selector de año si necesita otro año
5. El sistema recarga los indicadores de ingresos con el mes seleccionado
6. Admin ve:
   - Ingreso total del mes
   - Desglose por sede/categoría (si aplica)
   - Gráfico diario del mes con la tendencia
7. Compara mentalmente con el mes actual para evaluar crecimiento

### Flujo: Administrador revisa y ajusta suscripciones de un plan

1. Admin va a la sección de membresías en el dashboard
2. Ve la lista de planes con resumen (nombre, cantidad de clientes, ingresos)
3. Expande el plan "Plan Mensual" para ver los clientes
4. Revisa la lista: nombre, contacto, sesiones restantes, vencimiento
5. Nota que 3 clientes tienen 0 sesiones disponibles
6. Los marca como "en riesgo" o "para contactar"
7. Hace clic en el botón de WhatsApp de uno de ellos para ofrecerle renovación
8. WhatsApp se abre con el número del cliente listo para escribir

### Flujo: Administrador cambia de plan a varios clientes

1. Admin expande un plan en la sección de membresías
2. Marca el checkbox de 5 clientes que quiere mover a otro plan
3. Aparece una barra de acciones en la parte inferior
4. Hace clic en "Cambiar Plan"
5. Aparece un modal con la lista de planes disponibles
6. Selecciona el nuevo plan (ej: "Plan Trimestral")
7. Confirma la acción
8. Sistema actualiza las 5 suscripciones
9. Muestra mensaje: "5 suscripciones actualizadas exitosamente"
10. La lista se refresca mostrando los clientes en su nuevo plan

### Flujo: Administrador filtra ventas por categoría

1. Admin está en el dashboard viendo la sección de ventas recientes
2. Ve todas las ventas mezcladas (planes, productos, servicios)
3. Quiere ver solo las ventas de planes/membresías
4. Selecciona el filtro "Solo planes"
5. La lista se actualiza instantáneamente mostrando solo inscripciones
6. Opcionalmente filtra por sede para ver solo una sucursal
7. Ve un panorama limpio de las inscripciones recientes

---

## 5. CHECKLIST: ¿Qué características necesito?

Responde estas preguntas para saber qué activar en tu implementación.

### Sobre suscripciones
- [ ] ¿Manejas suscripciones o membresías con ajustes frecuentes?
- [ ] ¿Necesitas mover clientes entre planes desde el panel de reportes?
→ Si alguna es Sí → Activa **Gestión de Suscripciones desde Reportes**

### Sobre seguimiento de clientes
- [ ] ¿Necesitas marcar clientes con etiquetas internas (rescatado, VIP, en riesgo)?
- [ ] ¿La retención de clientes es importante para tu modelo?
→ Si alguna es Sí → Activa **Marcado con Etiquetas/Flags**

### Sobre comunicación
- [ ] ¿Tu equipo contacta clientes frecuentemente por WhatsApp, email o teléfono?
- [ ] ¿Quieres poder contactar clientes directo desde el panel?
→ Si ambas son Sí → Activa **Contacto Directo**

### Sobre sedes
- [ ] ¿Tu negocio tiene más de una sede o sucursal?
- [ ] ¿Necesitas comparar rendimiento entre sedes?
→ Si ambas son Sí → Activa **Desglose por Sede**

### Sobre visualización
- [ ] ¿Necesitas detectar tendencias y patrones rápidamente?
- [ ] ¿Prefieres ver gráficos en vez de solo números?
→ Si alguna es Sí → Activa **Gráficos y Visualizaciones**

### Sobre exportación
- [ ] ¿Necesitas exportar datos de clientes, suscripciones o inventario (no solo ventas)?
- [ ] ¿Tienes requisitos contables o legales de reportes específicos?
→ Si alguna es Sí → Activa **Reportes de Diferentes Tipos**

### Sobre crecimiento
- [ ] ¿Llevas más de 1-2 meses operando?
- [ ] ¿Quieres ver si estás creciendo o cayendo mes a mes?
→ Si ambas son Sí → Activa **Indicadores Comparativos**

---

## 6. PRESETS POR TIPO DE NEGOCIO

Configuraciones listas para copiar según tu industria.

### 📦 GYM / CENTRO DEPORTIVO

**Características activas:**
- ✅ Funciones core (dashboard, ingresos, transacciones, exportación, clientes por plan, actividad)
- ✅ Gestión de suscripciones (editar individual + cambios masivos)
- ✅ Marcado de clientes (rescatado, en riesgo)
- ✅ Contacto directo (WhatsApp para retención)
- ✅ Gráficos (ingresos diarios del mes)
- ✅ Desglose por sede (si tiene más de una)
- ✅ Indicadores comparativos (mes vs mes anterior)
- ❌ Reportes de inventario (solo si vende productos de tienda)

**Indicadores clave:**
- Socios activos, check-ins de hoy, ventas del día, cartera mensual
- Gráfico de ingresos diarios
- Clientes por plan con sesiones restantes
- Últimas ventas y últimos check-ins

**Ejemplo:** Gym donde el dueño abre el dashboard cada mañana, ve cuántos socios tiene, cuánto facturó, contacta por WhatsApp a los que están por vencer, y exporta ventas del mes para el contador.

---

### 📦 CLÍNICA / CENTRO MÉDICO

**Características activas:**
- ✅ Funciones core
- ✅ Gestión de suscripciones (ajustar paquetes de consultas)
- ✅ Desglose por sede (si es cadena)
- ✅ Contacto directo (WhatsApp/email para recordatorios)
- ✅ Gráficos (consultas por día, ingresos por profesional)
- ✅ Reportes múltiples (ventas + consultas + pacientes)
- ✅ Indicadores comparativos
- ❌ Marcado de clientes (menos relevante — la agenda controla seguimiento)

**Indicadores clave:**
- Pacientes activos, consultas de hoy, ingresos del día, profesionales atendiendo
- Paquetes por vencer (pacientes con pocas sesiones)
- Ingresos por profesional/especialidad

**Ejemplo:** Clínica donde la administradora revisa cuántas consultas hubo, cuáles son los profesionales con más carga, y exporta reportes mensuales para la dirección.

---

### 📦 RESTAURANTE / CAFETERÍA

**Características activas:**
- ✅ Funciones core (dashboard, ingresos, transacciones, exportación)
- ✅ Gráficos (ingresos por turno, ticket promedio)
- ✅ Indicadores comparativos (hoy vs ayer, esta semana vs la pasada)
- ✅ Desglose por sede (si es cadena)
- ❌ Gestión de suscripciones (no aplica)
- ❌ Marcado de clientes (no aplica)
- ❌ Contacto directo (clientes anónimos generalmente)
- ❌ Clientes por plan (no aplica)

**Indicadores clave:**
- Ventas del turno, ticket promedio, platos más vendidos, mesas atendidas
- Comparación almuerzo vs cena
- Ingresos diarios del mes

**Ejemplo:** Restaurante donde el gerente revisa al cierre cuánto facturó cada turno, qué platos se vendieron más, y si el ticket promedio subió o bajó.

---

### 📦 E-COMMERCE / TIENDA ONLINE

**Características activas:**
- ✅ Funciones core
- ✅ Gráficos (ventas diarias, productos más vendidos)
- ✅ Indicadores comparativos (semana vs semana, mes vs mes)
- ✅ Reportes múltiples (ventas + clientes + inventario + envíos)
- ❌ Gestión de suscripciones (salvo si tiene planes recurrentes)
- ❌ Marcado de clientes (el CRM externo maneja esto)
- ❌ Contacto directo (comunicación por email automatizado)
- ❌ Desglose por sede (todo es online)

**Indicadores clave:**
- Pedidos hoy, ventas totales, tasa de conversión, productos en stock bajo
- Productos más vendidos del período
- Clientes nuevos vs recurrentes

**Ejemplo:** Tienda online donde el dueño revisa ventas del día, verifica stock de productos populares, y exporta reportes semanales para planificar reposición.

---

### 📦 COWORKING

**Características activas:**
- ✅ Funciones core
- ✅ Gestión de suscripciones (planes y pases)
- ✅ Desglose por sede (red de espacios)
- ✅ Gráficos (ocupación, ingresos)
- ✅ Indicadores comparativos
- ✅ Contacto directo (renovaciones)
- ❌ Marcado de clientes (menos relevante)
- ❌ Reportes de inventario (no aplica)

**Indicadores clave:**
- Miembros activos, ocupación actual por sede, ingresos del mes, planes por vencer
- Pases diarios vendidos, salas de reunión reservadas
- Comparación de ocupación por sede

**Ejemplo:** Red de coworking donde el administrador central ve ocupación de todas las sedes, identifica la más rentable, y contacta miembros por vencer para ofrecerles renovación.

---

### 📦 SaaS / SOFTWARE

**Características activas:**
- ✅ Funciones core
- ✅ Gestión de suscripciones (planes, upgrades, downgrades)
- ✅ Marcado de clientes (churn risk, VIP, enterprise)
- ✅ Gráficos (MRR, crecimiento, churn)
- ✅ Indicadores comparativos (MoM growth)
- ✅ Reportes múltiples (revenue, usuarios, uso de features)
- ❌ Contacto directo por WhatsApp (email es el canal B2B)
- ❌ Desglose por sede (todo es online)

**Indicadores clave:**
- MRR (ingreso mensual recurrente), usuarios activos, churn rate, nuevos suscriptores
- Revenue por plan (Free, Pro, Enterprise)
- Uso de funcionalidades principales

**Ejemplo:** Fundador de SaaS que revisa MRR cada mañana, identifica usuarios en riesgo de churn, y exporta métricas mensuales para presentar a inversores.

---

## 7. DATOS UNIVERSALES (Todo sistema de reportes necesita esto)

### Indicadores del Dashboard (KPIs)

| Dato | Qué mide | Tipo | Ejemplo |
|------|----------|------|---------|
| Clientes/usuarios totales | Total de personas registradas | Número | 1.234 |
| Clientes/suscripciones activas | Personas con servicio vigente | Número | 456 |
| Actividad de hoy | Acciones del día (check-ins, reservas, pedidos) | Número | 47 |
| Ingresos de hoy | Dinero que entró hoy | Moneda | $350.000 |
| Ingresos del período | Dinero de la semana/mes | Moneda | $8.500.000 |
| Nuevos del período | Clientes/suscripciones nuevas en X días | Número | 23 |

### Datos de una Transacción (para reportes)

| Dato | Qué contiene | Tipo | Ejemplo |
|------|-------------|------|---------|
| Fecha y hora | Cuándo se realizó | Fecha/hora | "03-02-2026 14:30" |
| Identificador | Referencia única | Texto | "VTA-20260203-0015" |
| Monto total | Cuánto se cobró | Moneda | $45.000 |
| Método de pago | Cómo pagó | Texto | "Débito" |
| Productos/servicios | Qué se vendió | Lista | "1x Plan Mensual, 2x Bebida" |
| Vendedor | Quién realizó la venta | Texto | "María González" |
| Cliente | A quién se le vendió | Texto | "Juan Pérez" |
| Categoría/Sede | Dónde o de qué tipo | Texto | "Sucursal Centro" |
| Estado | Si está vigente o anulada | Texto | "Completada" |

### Datos de un Cliente en Membresías

| Dato | Qué contiene | Tipo | Ejemplo |
|------|-------------|------|---------|
| Nombre completo | Identificación | Texto | "Juan Pérez González" |
| Identificador | Documento o email | Texto | "12.345.678-9" |
| Teléfono | Para contacto | Texto | "+56 9 1234 5678" |
| Email | Para contacto | Texto | "juan@email.com" |
| Sesiones disponibles | Cuántas le quedan | Número | 2 |
| Sesiones totales | Cuántas tenía al inicio | Número | 8 |
| Fecha de vencimiento | Cuándo vence su plan | Fecha | "15-03-2026" |
| Plan actual | Qué plan tiene | Texto | "Plan Trimestral" |
| Etiquetas/Flags | Marcas internas | Texto | "Rescatado" |

### Datos de Ganancias por Día (para gráficos)

| Dato | Qué contiene | Tipo | Ejemplo |
|------|-------------|------|---------|
| Fecha | Qué día | Fecha | "2026-02-01" |
| Monto del día | Cuánto entró | Moneda | $425.000 |
| Cantidad de transacciones | Cuántas ventas | Número | 12 |

---

## 8. DATOS OPCIONALES (Según características activas)

| Dato | Para qué sirve | Tipo | Activar si... |
|------|----------------|------|---------------|
| Desglose por sede | Ingresos separados por ubicación | Lista de montos | Multi-sede |
| Etiqueta de cliente | Marca interna (rescatado, VIP, etc.) | Texto | Marcado con flags |
| Fecha de etiquetado | Cuándo se marcó al cliente | Fecha/hora | Marcado con flags |
| Variación porcentual | Cambio vs período anterior | Porcentaje | Indicadores comparativos |
| Valor del período anterior | Con qué se compara | Moneda/Número | Indicadores comparativos |
| Datos de gráfico | Puntos para visualización | Lista [{fecha, monto}] | Gráficos activos |
| Columnas de reporte extra | Datos adicionales por tipo | Variables | Reportes múltiples |

---

## 9. INTEGRACIONES CON OTROS MÓDULOS

Este módulo consume datos de prácticamente todo el sistema. No genera datos propios — solo lee, agrupa y presenta lo que generan los demás módulos.

### Con Módulo de Ventas / POS
- Los ingresos del dashboard suman los totales de ventas
- Las transacciones recientes vienen de la tabla de ventas
- El reporte Excel exporta datos de ventas
- Las ventas canceladas se excluyen de los totales de ingresos pero se incluyen en reportes con estado "Cancelada"

### Con Módulo de Suscripciones / Membresías
- El conteo de clientes activos viene de suscripciones con estado "activa"
- El desglose por plan agrupa suscripciones por nombre de plan
- Los ingresos incluyen el precio de suscripciones creadas
- Las suscripciones vencidas tienen estado "expirada", las canceladas "cancelada"

### Con Módulo de Check-in / Control de Acceso
- El indicador de actividad de hoy consulta los registros de check-in
- La actividad reciente muestra las últimas entradas
- Las sesiones consumidas se calculan desde los check-ins

### Con Módulo de Usuarios / Perfiles
- Los nombres y datos de contacto vienen de los perfiles de usuario
- El total de usuarios registrados viene de la tabla de usuarios
- Los datos de contacto (teléfono, email) se usan para el contacto directo

### Con Módulo de Planes
- El desglose por plan usa el nombre y precio de cada plan
- Los ingresos por plan se calculan multiplicando precio × clientes
- Los planes inactivos no aparecen en el desglose

### Con Módulo de Caja
- Las ventas están vinculadas a un turno de caja específico
- Permite auditar qué ventas se hicieron en cada turno
- Los reportes pueden filtrar por turno de caja

### Con Módulo de Reservas / Agenda (si existe)
- El dashboard puede mostrar reservas de hoy
- La actividad reciente puede incluir reservas creadas/canceladas
- Los reportes pueden exportar datos de ocupación

---

## 10. CASOS ESPECIALES / EXCEPCIONES

Situaciones que van a pasar y el sistema debe manejar correctamente.

**¿Qué pasa si no hay ventas en el período seleccionado para exportar?**
El sistema genera un archivo con solo los encabezados de columna (vacío de datos). No muestra error. El archivo se descarga normalmente — simplemente no tiene filas de datos.

**¿Qué pasa si hay demasiados datos para mostrar en pantalla?**
Se pone un límite visual: por ejemplo, máximo 500 suscripciones en el desglose, últimas 100 ventas en la lista, últimos 15 eventos en actividad reciente. Los totales de los KPIs sí consideran TODOS los datos, aunque la lista visual se limite. Esto evita que la página se vuelva lenta.

**¿Qué pasa si un cliente está en más de un plan a la vez?**
Cada suscripción aparece por separado en su respectivo plan. El mismo cliente puede aparecer en diferentes secciones. Los ingresos se cuentan por cada suscripción individual.

**¿Qué pasa si una venta fue cancelada/anulada?**
La venta aparece en el reporte con estado "Cancelada". Los ingresos del dashboard NO incluyen ventas canceladas — solo cuentan ventas completadas. En los reportes exportados sí aparecen para que el contador tenga la foto completa.

**¿Qué pasa si hay diferencia de zona horaria?**
Todas las fechas se procesan en la zona horaria del negocio. Si alguien consulta a las 23:30 hora local, ve las ventas de ese día (no del siguiente). Las ventas de medianoche caen en el día correcto según la zona horaria configurada. Esto es crítico — una zona horaria mal configurada puede hacer que los reportes no cuadren.

**¿Qué pasa si un cliente no tiene teléfono registrado?**
El botón de contacto por WhatsApp/teléfono aparece deshabilitado o no se muestra. El campo de teléfono aparece vacío ("-") en la tabla. No se genera error.

**¿Qué pasa si se intenta hacer un cambio masivo de más de 100 suscripciones?**
El sistema procesa todas pero puede tardar más. No hay un límite estricto pero se recomienda no superar las 200 a la vez para evitar problemas de rendimiento. Mostrar indicador de progreso si el proceso toma más de 2-3 segundos.

**¿Qué pasa si hay datos incompletos de un cliente?**
Los campos vacíos se muestran como "-" o vacíos. El sistema no falla — solo muestra lo que hay disponible. Ningún campo faltante debe romper la visualización de la fila completa.

**¿Qué pasa si dos administradores editan la misma suscripción al mismo tiempo?**
Gana el último que guardó (last write wins). No hay bloqueo de edición concurrente. Se recomienda coordinarse entre administradores para evitar conflictos. Opcionalmente: implementar un sistema de "esta suscripción está siendo editada por [nombre]" como mejora futura.

**¿Qué pasa si los datos del dashboard tardan mucho en cargar?**
Mostrar skeletons/placeholders mientras carga cada sección independiente. No bloquear toda la pantalla por un indicador lento. Si un indicador falla → mostrar "Error al cargar" solo en esa sección, el resto sigue funcionando.

**¿Qué pasa si el negocio es nuevo y no tiene datos históricos?**
Los indicadores comparativos (vs período anterior) no se muestran si no hay datos previos. Los gráficos muestran los pocos datos que hay. Los KPIs muestran 0 donde corresponda. El dashboard nunca debe verse "roto" por falta de datos.

---

## 11. REGLAS DE NEGOCIO UNIVERSALES

Reglas que aplican sin importar la industria y que deben respetarse siempre.

### Cálculo de Ingresos
- Los ingresos se calculan sumando ventas completadas (no canceladas ni pendientes)
- Si tu negocio tiene suscripciones → los ingresos también incluyen el precio de suscripciones creadas
- "Hoy" significa desde las 00:00 hasta las 23:59 en la zona horaria del negocio
- "Últimos X días" se cuentan hacia atrás desde hoy (incluyendo hoy)

### Estados de Suscripción
- **Activa:** Vigente, el cliente puede usar el servicio
- **Expirada:** La fecha de fin ya pasó
- **Cancelada:** Fue anulada antes de vencer
- Solo las suscripciones "activas" cuentan para el indicador de clientes activos

### Zona Horaria
- TODAS las fechas se procesan y muestran en la zona horaria del negocio
- El formato de visualización debe ser legible (DD-MM-YYYY o MM/DD/YYYY según la región)
- El formato interno puede ser ISO (YYYY-MM-DD) pero al usuario se le muestra el formato local
- NUNCA usar UTC para mostrar fechas al usuario — siempre convertir a hora local

### Límites de Datos
- Definir límites claros para cada lista: cuántos ítems se muestran máximo
- Los KPIs deben considerar TODOS los datos aunque la lista visual tenga límite
- Permitir paginación o "ver más" si hay más datos de los que se muestran

### Permisos
- Solo roles con permiso pueden ver datos financieros (ingresos, ventas)
- Los datos de contacto de clientes solo son visibles para roles autorizados
- El personal operativo puede ver métricas de su propia actividad pero no las financieras globales

---

## 12. EJEMPLO COMPLETO: Aplicando el Boilerplate

### Escenario: Dashboard para Gym "PowerZone"

**Contexto:** Gym mediano en Chile, dos sedes (Centro y Norte), con productos de tienda y planes de membresía. 2 recepcionistas, 3 instructores, ~300 socios activos.

**Decisiones del dueño:**
- Quiero ver de un vistazo cuántos socios hay y cuánto facturé
- Quiero contactar por WhatsApp a clientes que están por vencer
- Quiero marcar clientes que rescaté para saber cuántos recuperé al mes
- Necesito exportar ventas mensualmente para mi contador
- Quiero comparar sedes para ver cuál va mejor
- Quiero gráfico de ingresos del mes para detectar tendencias

**Configuración activada:**
```
✅ Funciones Core (dashboard, ingresos, transacciones, exportación, clientes por plan, actividad)
✅ Gestión de suscripciones (editar individual + cambios masivos)
✅ Marcado de clientes ("rescatado", "en riesgo")
✅ Contacto directo (WhatsApp)
✅ Desglose por sede (Centro vs Norte)
✅ Gráficos (ingresos diarios del mes)
✅ Indicadores comparativos (mes vs mes anterior)
❌ Reportes múltiples (solo ventas por ahora)
```

**Dashboard configurado:**

**Sección 1 — KPIs principales:**
- Socios activos: 312 ↑4% (vs 300 mes pasado)
- Socios Sede Centro: 187
- Socios Sede Norte: 125
- Check-ins hoy: 47
- Ventas hoy: $580.000
- Cartera mensual: $9.360.000 ↑8%

**Sección 2 — Ingresos:**
- Hoy: $580.000
- Últimos 3 días: $1.420.000
- Últimos 7 días: $3.150.000
- Mes actual (febrero): $4.280.000 (parcial, van 4 días)
- Desglose: Centro $2.640.000 / Norte $1.640.000
- Gráfico de área con ingresos diarios de febrero

**Sección 3 — Ventas recientes:**
- Últimas 100 ventas con filtros: Todos | Solo planes | Solo productos | Sede Centro | Sede Norte
- Cada venta muestra: cliente, producto, monto, hora, sede (con color)

**Sección 4 — Actividad reciente:**
- Últimos 15 check-ins: "Pedro Muñoz — Centro — QR — 09:15"

**Sección 5 — Membresías:**
- Pestaña Centro | Pestaña Norte
- Por cada plan: nombre, cantidad de socios, precio, ingresos totales
- Expandible: lista de socios con nombre, RUT, teléfono, sesiones, vencimiento
- Acciones: editar, WhatsApp, marcar rescatado, checkbox para masivos
- Barra de acciones masivas: "Cambiar Plan", "Cambiar Sede"

**Sección 6 — Reportes:**
- Selector de fecha inicio + fecha fin
- Botón "Descargar Excel"
- Archivo: "Reporte_Ventas_2026-02-01_2026-02-04.xlsx"

---

## 13. CÓMO USAR ESTE BOILERPLATE

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
> Basado en experiencia real de implementación en proyectos con paneles de administración y reportes.
> Diseñado para ser reutilizable en cualquier negocio que necesite medir su rendimiento.
