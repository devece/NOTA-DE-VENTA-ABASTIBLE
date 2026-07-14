# Flujo: Presupuesto del contratista → Nota de Venta → DC cuadrado

> Detalle fila por fila de qué se digita en el DC. Para las capturas de pantalla de
> cada paso de este flujo (Convertir Ppto. Contratista → análisis de cuadre), ver la
> sección 5 de [MANUAL_ABASTIBLE.md](MANUAL_ABASTIBLE.md#5-análisis-dc--cotización).

## Parte 1 — Convertir el presupuesto del contratista en proyecto (JSON)

**Formato de entrada:** la app convierte **Excel** (.xls/.xlsx). Si el contratista envió su
presupuesto en PDF, primero copiar la tabla a Excel con estas columnas mínimas:
`DESCRIPCIÓN`, `CANT.`, `PRECIO` (opcionales: `ITEM`, `UNIDAD`, `SUBTOTAL`).
*(Mejora futura: extraer el PDF del presupuesto con IA, igual que los Detalles Comerciales.)*

### Pasos

1. Abrir la app → perfil **Abastible** → **Análisis DC + Cotización** → tarjeta
   **"Convertir Ppto. Contratista"**. *(La misma opción existe en el perfil Contratista,
   tarjeta "Convertir Ppto. a Nota de Venta", si es el propio contratista quien convierte.)*
2. Seleccionar el Excel del presupuesto. La app clasifica cada ítem automáticamente:
   - **Cañerías**: solo entran a las categorías CAÑERIAS AP/MP/BP los ítems cuya
     descripción habla de cañería/instalación/red GLP **y** trae diámetro. El match
     contra Renova es **por diámetro + familia de presión** (nunca por texto literal,
     porque cada contratista escribe distinto). El material Impovar se vincula
     automáticamente (metraje = cantidad +5%, redondeado a tiras de 6 ML).
   - **Resto de ítems**: match exacto o por similitud de palabras clave. Los matches
     por similitud quedan marcados para revisión.
   - **Sin match**: quedan como ítem libre con **precio Renova $0**. Su valor completo
     se reflejará después como MOI de su categoría (no se pierde).
3. La app pedirá completar **Proyecto, Cliente y Centro**. El centro define los precios
   Renova aplicados — elegir el correcto es clave (ej: Oficina Ventas Arica).
   Continuar → Paso 2 → **"Ver Nota de Venta →"**.
4. Revisar la nota generada: verificar los matches por similitud y corregir lo que haga
   falta (eliminar ítems mal emparejados, agregar faltantes).
5. **Guardar Proyecto** → se descarga el archivo `NV_<proyecto>.json`.
   *(La app no permite guardar sin Cliente y Centro: así el JSON siempre abre directo
   en el análisis.)*

## Parte 2 — Análisis y Excel guía para crear el DC

1. Perfil **Abastible** → **Análisis DC + Cotización** → tarjeta
   **"Abrir cotización del contratista"** → seleccionar el JSON → se abre **directo el
   análisis** (Paso 3), sin pasos intermedios.
2. Verificar el resumen final: **Total Base Renova + Total MOI = Total Contratista**,
   con el sello "✅ CUADRE VALIDADO". El MOI aparece desglosado por categoría en la tabla.
3. **Exportar a Excel** → se genera `NOTA_VENTA_<proyecto>.xlsx`. Este Excel es la
   **guía de digitación** para crear el DC.

### Qué filas se ingresan en el sistema que genera el DC

El Excel exportado trae la columna **"DIGITAR EN DC"** que marca cada fila, y una
leyenda al pie. Las filas que NO se digitan van además atenuadas en gris:

| Marca en columna "DIGITAR EN DC" | Fila | Cómo proceder |
|---|---|---|
| **✓ SÍ** (verde) | Ítems con código Renova real (matcheados) | Ingresar código + cantidad en su categoría/operación correspondiente |
| **✓ SÍ** (fila naranja) | "MANO DE OBRA INDUSTRIAL" (una por categoría) | Ingresar ese monto como MOI de la categoría, con su código de operación |
| **VERIFICAR** (fondo crema) | Subfilas de material Impovar (códigos 248xx) | El sistema DC las agrega al ingresar el servicio de cañería; confirmar que el metraje coincida con el del Excel (misma regla: +5% redondeado a tira de 6 ML) |
| **✗ EN MOI** (fila gris) | Ítems con código "PPTO-…" (libres, Renova $0) | ❌ **NO digitar**: su valor ya está sumado dentro del MOI de su categoría — ingresarlos además lo duplicaría |

**Resultado esperado:** el DC generado en el sistema suma Renova + MOI = total del
presupuesto del contratista → **cuadra exactamente con la oferta inicial**.

## Caso de validación (referencia)

Cotización real ECh SpA — Restaurant Camping Magisterio Arica (proyecto 19384780),
22 ítems con descripciones típicas de contratista:

- 12 ítems matchearon con Renova (3 cañerías por diámetro + material Impovar,
  resto exactos/por similitud), 10 quedaron libres. Cero falsos positivos.
- Cuadre del análisis: **$1.879.907 (Renova) + $1.671.809 (MOI) = $3.551.716 (contratista)**.
- Archivo de prueba: `TEST DOCUMENTOS/Presupuesto ECh SpA Magisterio Arica.xlsx`.
