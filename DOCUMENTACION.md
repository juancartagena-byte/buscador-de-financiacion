# Buscador de Financiación GRD — Documentación del Proyecto

**Versión:** 1.0.0
**Fecha de documentación:** 20 de marzo de 2026
**Repositorio:** buscador-de-financiacion

---

## Tabla de contenidos

1. [Descripción general](#1-descripción-general)
2. [Arquitectura y stack tecnológico](#2-arquitectura-y-stack-tecnológico)
3. [Estructura de archivos](#3-estructura-de-archivos)
4. [Componentes](#4-componentes)
5. [Datos](#5-datos)
6. [Lógica de búsqueda](#6-lógica-de-búsqueda)
7. [Utilidades](#7-utilidades)
8. [Estilos](#8-estilos)
9. [Variables de entorno](#9-variables-de-entorno)
10. [Scripts disponibles](#10-scripts-disponibles)
11. [Funcionalidades clave](#11-funcionalidades-clave)
12. [Estado actual y pendientes](#12-estado-actual-y-pendientes)

---

## 1. Descripción general

**Buscador de Financiación** es una aplicación web que permite a entidades públicas, territorios, organizaciones y personas naturales en Colombia encontrar fuentes de financiación para proyectos de Gestión del Riesgo de Desastres (GRD) y adaptación al cambio climático.

La herramienta indexa **32 fuentes de financiación** (nacionales, territoriales, internacionales, privadas y otras), y ofrece:

- Búsqueda en lenguaje natural potenciada por IA (Claude de Anthropic).
- Filtro por presupuesto en COP con conversión automática a USD.
- Vista detallada de cada fuente con 6 pestañas de información.
- Guías paso a paso para acceder a las fuentes.
- Dashboard analítico con gráficas interactivas.

---

## 2. Arquitectura y stack tecnológico

| Capa         | Tecnología                                                 |
| ------------ | ---------------------------------------------------------- |
| Framework UI | React 18                                                   |
| Build tool   | Vite 5                                                     |
| Estilos      | CSS plano (`index.css`)                                    |
| Tipografía   | Google Fonts — Fraunces (display) + Source Sans 3 (cuerpo) |
| IA           | Anthropic Claude API (`claude-sonnet-4-20250514`)          |
| Gráficas     | Canvas API nativo (sin librerías externas)                 |
| Despliegue   | Estático (`vite build` → `/dist`)                          |

No hay backend propio. La aplicación es completamente estática; la única llamada externa es a la API de Anthropic para la búsqueda IA.

---

## 3. Estructura de archivos

```
buscador-de-financiacion/
├── index.html                  # HTML raíz; carga fuentes y monta #root
├── vite.config.js              # Configuración de Vite (plugin React)
├── package.json
├── src/
│   ├── main.jsx                # Punto de entrada React (ReactDOM.createRoot)
│   ├── index.css               # Todos los estilos de la aplicación
│   ├── components/
│   │   ├── App.jsx             # Router de páginas + estado global del panel
│   │   ├── Nav.jsx             # Barra de navegación fija
│   │   ├── SearchPage.jsx      # Página de búsqueda
│   │   ├── ResultCard.jsx      # Tarjeta de resultado individual
│   │   ├── DetailPanel.jsx     # Modal de detalle con 6 pestañas
│   │   └── Dashboard.jsx       # Dashboard analítico
│   ├── data/
│   │   ├── constants.js        # Opciones de filtro y sugerencias de búsqueda
│   │   ├── funds.js            # Base de datos de 32 fuentes de financiación
│   │   └── guides.js           # Guías paso a paso por fuente
│   └── utils/
│       ├── helpers.js          # Utilidades de color y formato de moneda
│       └── search.js           # Lógica de búsqueda IA y local
└── dist/                       # Artefacto de build (generado por `vite build`)
```

---

## 4. Componentes

### 4.1 `App.jsx` — Componente raíz

Gestiona el estado de navegación principal:

| Estado     | Descripción                                                        |
| ---------- | ------------------------------------------------------------------ |
| `page`     | Página activa: `"busqueda"` o `"dashboard"`                        |
| `selected` | Objeto fondo actualmente abierto en el panel de detalle (o `null`) |

Renderiza `Nav`, `SearchPage` o `Dashboard`, y el `DetailPanel` si hay un fondo seleccionado.

---

### 4.2 `Nav.jsx` — Barra de navegación

- Header fijo con efecto blur al hacer scroll.
- Logo "BF" que al hacer clic resetea la página a búsqueda.
- Dos pestañas: **Búsqueda** y **Dashboard**.
- Badge informativo: `32 fuentes GRD · Colombia`.

---

### 4.3 `SearchPage.jsx` — Página de búsqueda

**Estados internos:**

| Estado    | Valores                                     |
| --------- | ------------------------------------------- |
| `stage`   | `"home"` → `"loading"` → `"results"`        |
| `query`   | Texto libre del usuario                     |
| `budget`  | Presupuesto en COP (string formateado)      |
| `results` | Array de fondos con `{ id, score, reason }` |
| `summary` | Resumen textual generado por IA             |

**Flujo:**

1. El usuario escribe una consulta en el textarea (crece automáticamente).
2. Opcionalmente ingresa un presupuesto en COP.
3. Al enviar, llama a `aiSearch()` (con fallback a `localSearch()`).
4. Muestra hasta 8 tarjetas `ResultCard` ordenadas por puntaje.

**Chips de sugerencia:** 6 consultas predefinidas en `constants.js`.

---

### 4.4 `ResultCard.jsx` — Tarjeta de resultado

Muestra para cada fondo:

- **Puntaje de coincidencia** (0–100) con color semáforo:
  - Verde ≥ 80
  - Naranja 60–79
  - Morado < 60
- Nombre completo y tipo del fondo.
- Razón de coincidencia generada por IA.
- Etiquetas de procesos GRD cubiertos.

Al hacer clic invoca `onSelect(fondo)` para abrir el panel de detalle.

---

### 4.5 `DetailPanel.jsx` — Panel de detalle (modal)

Modal con 6 pestañas:

| Pestaña            | Contenido                                                                     |
| ------------------ | ----------------------------------------------------------------------------- |
| **General**        | Descripción, objetivos, ciclo GRD, público objetivo, actividades, vigencia    |
| **Acceso**         | Elegibilidad, requisitos, criterios de asignación, métodos de acceso, tiempos |
| **Paso a paso**    | Guía numerada de pasos, estado, montos, duración, contacto                    |
| **Financiamiento** | Instrumentos, monto máximo, capitalización, subcategorías                     |
| **Cobertura**      | Matrices GRD: procesos, beneficiarios, objetivos PNGRD                        |
| **Legal**          | Entidad gestora, normativa, enlace al sitio web                               |

Se cierra con la tecla `Escape` o haciendo clic en el backdrop.

---

### 4.6 `Dashboard.jsx` — Dashboard analítico

**Tarjetas resumen (5):** conteo de fondos por tipo (Nacional, Territorial, Internacional, Privado, Otro).

**Gráfica de barras (canvas):** fondos por fase del ciclo GRD (Conocimiento, Reducción, Preparación/Respuesta, Recuperación/Rehabilitación, Otros).

**Gráfica de torta (canvas):** distribución porcentual por tipo de fuente. Al hacer clic en un segmento filtra la tabla.

**Tabla de fondos:** listado filtrable por el tipo seleccionado en la torta. Columnas: nombre, tipo, máximo monto, procesos cubiertos.

---

## 5. Datos

### 5.1 `funds.js` — 32 fuentes de financiación

Cada objeto tiene la siguiente estructura:

| Campo   | Tipo         | Descripción                                                   |
| ------- | ------------ | ------------------------------------------------------------- |
| `id`    | `string`     | Identificador único (F01–F32)                                 |
| `n`     | `string`     | Nombre completo                                               |
| `s`     | `string`     | Nombre corto                                                  |
| `t`     | `string`     | Tipo: Nacional / Territorial / Internacional / Privado / Otro |
| `desc`  | `string`     | Descripción general                                           |
| `ciclo` | `string`     | Ciclos GRD que cubre                                          |
| `pub`   | `string`     | Público objetivo                                              |
| `act`   | `string`     | Actividades financiables                                      |
| `inst`  | `string`     | Instrumentos de financiación                                  |
| `eleg`  | `string`     | Condiciones de elegibilidad                                   |
| `req`   | `string`     | Requisitos de aplicación                                      |
| `crit`  | `string`     | Criterios de asignación                                       |
| `acc`   | `string`     | Métodos de acceso                                             |
| `tiem`  | `string`     | Tiempos de aplicación                                         |
| `mon`   | `string`     | Monto máximo disponible                                       |
| `cap`   | `string`     | Fuentes de capitalización                                     |
| `sub`   | `string`     | Subcategorías                                                 |
| `ent`   | `string`     | Entidad gestora                                               |
| `obj`   | `string`     | Objetivos del fondo                                           |
| `vig`   | `string`     | Vigencia                                                      |
| `fecha` | `string`     | Fecha de creación del registro                                |
| `web`   | `string`     | URL del sitio oficial                                         |
| `nor`   | `string`     | Normativa aplicable                                           |
| `p`     | `boolean[5]` | Cobertura por proceso GRD                                     |
| `b`     | `boolean[8]` | Cobertura por tipo de beneficiario                            |
| `o`     | `boolean[5]` | Cobertura por objetivo PNGRD                                  |

**Fondos incluidos (muestra):**
Fondo Adaptación, FOMINDETER, FONAM, FNGRD, SGR-GERD, GEF, BID, Banco Mundial, PNUD, y 23 más.

---

### 5.2 `guides.js` — Guías de acceso

Disponibles para más de 16 fondos. Cada guía contiene:

| Campo   | Descripción                                |
| ------- | ------------------------------------------ |
| `est`   | Estado: `"Permanente"` o `"Convocatorias"` |
| `pasos` | Array de `{ t: título, d: descripción }`   |
| `mon`   | Información de montos                      |
| `dur`   | Duración estimada del proceso              |
| `con`   | Contacto / URL                             |

---

### 5.3 `constants.js` — Constantes compartidas

```js
PROCS; // 5 procesos GRD
BENS; // 8 tipos de beneficiarios
OBJS; // 5 objetivos PNGRD
suggestions; // 6 consultas de ejemplo para los chips
```

---

## 6. Lógica de búsqueda

**Archivo:** `src/utils/search.js`

### 6.1 `aiSearch(query, budget)`

1. Prepara un resumen de los 32 fondos (id + nombre + tipo + descripción breve).
2. Envía a la API de Anthropic (`claude-sonnet-4-20250514`) con instrucciones de ranking.
3. Si se especificó presupuesto, lo incluye como restricción.
4. Espera respuesta JSON: `{ summary: string, funds: [{ id, score, reason }] }`.
5. Devuelve los fondos ordenados por puntaje (máximo 8).
6. En caso de error, llama a `localSearch()` como fallback.

### 6.2 `localSearch(query)`

Búsqueda local por palabras clave:

1. Normaliza la consulta (minúsculas, sin tildes).
2. Tokeniza en palabras.
3. Puntúa cada fondo según coincidencias en nombre, descripción, tipo, actividades, etc.
4. Genera una razón textual simple basada en los campos que coincidieron.
5. Devuelve los 8 mejores resultados.

---

## 7. Utilidades

**Archivo:** `src/utils/helpers.js`

| Función                    | Descripción                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `typeColor(t)`             | Color de texto según tipo de fondo                                                 |
| `typeBg(t)`                | Color de fondo según tipo de fondo                                                 |
| `scoreColor(s)`            | Color semáforo para puntaje (verde/naranja/morado)                                 |
| `scoreBg(s)`               | Fondo semáforo para puntaje                                                        |
| `formatBudgetDisplay(raw)` | Convierte COP crudo a string formateado + equivalente en USD (tasa: 4 400 COP/USD) |

---

## 8. Estilos

**Archivo:** `src/index.css`

### Sistema de diseño

| Token               | Valor             |
| ------------------- | ----------------- |
| Color primario      | `#1e6b3a` (verde) |
| Color territorial   | Naranja           |
| Color internacional | Morado            |
| Color privado       | Azul              |
| Radio de borde      | `16px`            |
| Tipografía display  | Fraunces (serif)  |
| Tipografía cuerpo   | Source Sans 3     |

### Animaciones

| Nombre    | Descripción                                       |
| --------- | ------------------------------------------------- |
| `fadeUp`  | Entrada suave con desplazamiento vertical (0.6 s) |
| `spin`    | Rotación continua (loader)                        |
| `modalIn` | Entrada del modal desde abajo                     |

### Breakpoints responsive

- `768px`: Tablet/móvil. Las tarjetas de resultado cambian de horizontal a vertical. El nav ajusta tamaño de fuente.

---

## 9. Variables de entorno

| Variable                 | Descripción                           | Requerida                                |
| ------------------------ | ------------------------------------- | ---------------------------------------- |
| `VITE_ANTHROPIC_API_KEY` | API key de Anthropic para búsqueda IA | Sí (la búsqueda local funciona sin ella) |

Configurar en archivo `.env` en la raíz del proyecto:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> **Advertencia:** Esta variable queda expuesta en el bundle del cliente (`import.meta.env`). En producción se recomienda intermediar las llamadas a la API mediante un backend propio.

---

## 10. Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo (Vite, HMR)
npm run build     # Build de producción → /dist
npm run preview   # Sirve el build de /dist localmente
```

---

## 11. Funcionalidades clave

### Búsqueda inteligente

- Lenguaje natural con ranking semántico via Claude.
- Fallback automático a búsqueda local por palabras clave.
- Chip de sugerencias para usuarios nuevos.

### Filtro por presupuesto

- Entrada en COP con formateo automático de miles.
- Conversión en tiempo real a USD.
- Se pasa a Claude como restricción de ranking.

### Panel de detalle

- 6 pestañas con toda la información operativa de cada fondo.
- Guías paso a paso para más de la mitad de los fondos.
- Matrices de cobertura por proceso, beneficiario y objetivo.

### Dashboard analítico

- Gráficas canvas interactivas (sin dependencias externas).
- Filtrado cruzado entre torta y tabla.
- Estadísticas resumen por tipo de fuente.

---

## 12. Estado actual y pendientes

### Estado actual

- Base de datos completa: 32 fondos documentados.
- Búsqueda IA funcional con fallback local.
- Dashboard analítico completo.
- Guías paso a paso para 16+ fondos.
- Diseño responsive básico.

### Posibles mejoras futuras

- Mover la llamada a la API de Anthropic a un backend (Edge Function / Cloud Function) para no exponer la API key en el cliente.
- Ampliar las guías paso a paso a los fondos restantes.
- Agregar favoritos / exportación de resultados (PDF / Excel).
- Implementar filtros adicionales (proceso GRD, tipo de beneficiario) directamente en la UI de búsqueda.
- Internacionalización (en/es) si se requiere uso regional.
- Tests unitarios para `search.js` y `helpers.js`.
