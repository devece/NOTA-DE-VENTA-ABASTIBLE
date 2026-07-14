# Manual de usuario — Perfil Abastible

> Guía paso a paso de la app **Nota de Venta Abastible** para el perfil **🏢 Abastible**
> (supervisores, jefes de proyecto, coordinadores y personal comercial). Todas las
> capturas de este manual son de la app real, usando datos de ejemplo ficticios.

Si sos **Contratista (empresa externa)**, usá [MANUAL_CONTRATISTA.md](MANUAL_CONTRATISTA.md) en su lugar.

## Índice

1. [Ingreso y selección de perfil](#1-ingreso-y-selección-de-perfil)
2. [Elegir qué documento crear](#2-elegir-qué-documento-crear)
3. [Nota de Venta](#3-nota-de-venta)
4. [Cargar DC (PDF)](#4-cargar-dc-pdf)
5. [Historial de Notas](#5-historial-de-notas)
6. [Acciones del documento final](#6-acciones-del-documento-final)
7. [Preguntas frecuentes](#7-preguntas-frecuentes)

---

## 1. Ingreso y selección de perfil

Al abrir la app se pide elegir el perfil. Seleccioná **🏢 Abastible**.

![Selección de perfil](docs/manual/img/abastible/01-seleccion-perfil.png)

A diferencia del perfil Contratista, Abastible no pide datos de empresa: pasa directo
a la pantalla de selección de documento.

## 2. Elegir qué documento crear

Hay dos opciones. Cada una arranca un flujo distinto:

![Selección de documento](docs/manual/img/abastible/02-seleccion-documento.png)

| Opción | Para qué sirve |
|---|---|
| **📋 Nota de Venta** | Armar una Nota de Venta manualmente, eligiendo productos Renova por centro. |
| **📄 Cargar DC** | Subir el PDF de un Detalle Comercial para crear automáticamente un proyecto con sus ítems, listo para que el contratista cotice. |

## 3. Nota de Venta

### 3.1 Paso 1 — Datos del proyecto

Al entrar, si la base de productos Renova todavía no está cargada, aparece un aviso y
el botón **📂 Cargar Base Excel** (en el sitio publicado por Vercel la base se carga
sola; el botón manual solo aparece como respaldo si ese auto-fetch falla).

![Paso 1 sin base cargada](docs/manual/img/abastible/03-nota-venta-sin-base.png)

Completá **Proyecto**, **Cliente** y **Centro** (obligatorios — el Centro define qué
precios Renova se van a usar) y, si corresponde, RUT/ID, Dirección, Ciudad, Teléfono,
Fecha y Vencimiento.

![Paso 1 completo](docs/manual/img/abastible/04-nota-venta-paso1-completo.png)

Click en **Continuar → Agregar Productos**.

### 3.2 Paso 2 — Agregar productos

A la izquierda están las **categorías** de la base Renova; al hacer click en una se
listan sus productos a la derecha. Click en **+ Agregar** suma el producto a la nota
(o **click directo en la fila**, según la categoría).

![Paso 2 — categorías](docs/manual/img/abastible/05-nota-venta-paso2.png)

- Las categorías **CAÑERIAS AP/MP/BP** usan **PRECIO BASE** y, al agregarlas, suman
  automáticamente el material Impovar vinculado (metraje = cantidad + 5%, redondeado a
  tiras de 6 ML).
- Se puede buscar por código o descripción, o agregar un **ítem libre** (que no está en
  la base) indicando descripción, unidad, cantidad y precio.
- Los ítems agregados se listan abajo y se pueden eliminar antes de continuar.

![Paso 2 — productos agregados](docs/manual/img/abastible/06-nota-venta-paso2-agregados.png)

Click en **Ver Nota de Venta →**.

### 3.3 Paso 3 — Documento final

Se muestra la Nota de Venta con el detalle por categoría (Precio Renova, Cantidad,
Total) y el resumen final.

![Paso 3 — Nota de Venta](docs/manual/img/abastible/07-nota-venta-paso3.png)

Desde acá se puede **Exportar a Excel**, **Generar DC**, **Guardar Nota** o
**Imprimir** (ver [sección 6](#6-acciones-del-documento-final)). En modo Nota de Venta
también aparece en la barra superior el botón **📤 Enviar a Contratista**, que descarga
un `.json` con el proyecto para que el contratista lo abra con **Cargar Cotización** en
su perfil y ponga sus precios.

## 4. Cargar DC (PDF)

Sirve para partir de un **Detalle Comercial en PDF** ya emitido: la app lo analiza con
IA (puede tardar hasta 1-2 minutos), extrae automáticamente proyecto, cliente, ciudad,
dirección e ítems, y arma la Nota de Venta lista para que el contratista cotice.

Pasos:
1. Elegir la tarjeta **📄 Cargar DC** en la pantalla de selección de documento —
   se abre el explorador de archivos automáticamente.
2. Seleccionar el PDF del Detalle Comercial.
3. Revisar la vista previa que trae la app (ítems detectados, categoría, MOI,
   certificador) y click en **Cargar como Nota de Venta**.
4. Si el DC trae MOI de certificador pero ningún ítem código 400 real, la app pregunta
   el monto de la certificación antes de continuar (en vez de asumir un valor fijo).
5. Queda armada la Nota de Venta (Paso 3), lista para exportar o enviar al contratista.

## 5. Historial de Notas

El botón **📋 Historial** (solo disponible para Abastible, no para Contratista) lista
las notas guardadas con **💾 Guardar Nota**, combinando lo guardado en este navegador
(localStorage) con el respaldo en la nube (Supabase, best-effort). Desde ahí se puede
**Cargar** una nota para seguir editándola o **Eliminar** una que ya no sirve.

![Historial de notas](docs/manual/img/abastible/08-historial.png)

## 6. Acciones del documento final

Estos botones aparecen al pie del Paso 3 (Nota de Venta):

- **📊 Exportar a Excel** — descarga `NOTA_VENTA_<proyecto>.xlsx` con el detalle
  completo (categoría, código, descripción, precio Renova, total).
- **📄 Generar DC** — solo visible para Abastible (nunca para Contratista): genera
  `DC_<proyecto>.xlsx` con la hoja lista en formato Operación/Código/Descripción/UN/
  Cant./Valor Unit./Valor Final/Proveedor.
- **💾 Guardar Nota** — guarda la nota en el Historial (local + respaldo en la nube).
- **🖨️ Imprimir** — imprime el documento tal como se ve en pantalla.
- **📤 Enviar a Contratista** (solo en modo Nota de Venta) — descarga el `.json` del
  proyecto para que el contratista lo abra con **Cargar Cotización**.

## 7. Preguntas frecuentes

**¿Por qué no aparecen productos en el Paso 2?**
Falta cargar la base de productos Renova. En el sitio publicado (https) se carga sola
al abrir la app; si falla, usar el botón **📂 Cargar Base Excel** y elegir
`base_datos.xlsx`.

**¿Qué le mando al contratista para que cotice?**
Un `.json` generado con **Enviar a Contratista** (desde una Nota de Venta) o
directamente el PDF del DC. El contratista lo abre desde su perfil con
**Cargar Cotización** o **Cotizar sobre DC** — ver
[MANUAL_CONTRATISTA.md](MANUAL_CONTRATISTA.md).
