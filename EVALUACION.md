# Evaluación: criterio por criterio, con evidencia verificable

Guía para revisar **cilindroya.com** contra la rúbrica del reto «Hazte visible en internet y vende más»
(Hostinger × Irremplazables, 20 puntos: 1–10 SEO, 11–20 AEO). Cada fila indica dónde está la evidencia y cómo
comprobarla. Las cifras se midieron sobre los archivos de este repositorio y sobre el sitio publicado.

- Sitio: https://cilindroya.com (la raíz redirige con 301 a `/hogar/`)
- Código: https://github.com/wilo3161/cilindroya-web
- Autor: Ing. Wilson Pérez, ingeniero en Logística y Transporte (Ibarra, Ecuador)

## Resumen medido (18 URL del sitemap)

| Comprobación | Resultado |
|---|---|
| Páginas con `<title>` propio (38–59 caracteres) | 18 de 18 |
| Páginas con meta descripción (144–165 caracteres) | 18 de 18 |
| Páginas con exactamente un `<h1>` | 18 de 18 |
| Páginas con `<link rel="canonical">` | 18 de 18 |
| Imágenes sin atributo `alt` | 0 |
| Bloques JSON-LD con errores de sintaxis | 0 |
| Tipos de datos estructurados | `WebSite`, `LocalBusiness`, `Service`, `FAQPage`, `Article`, `BreadcrumbList`, `CollectionPage` |
| Lighthouse `/hogar/` celular | Rendimiento 85 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100 |
| Lighthouse `/hogar/` escritorio | Rendimiento 97 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100 |
| Lighthouse `/preguntas/` celular | Rendimiento 91 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100 |

## SEO (puntos 1–10)

| # | Criterio | Evidencia | Cómo verificar |
|---|---|---|---|
| 1 | Título claro | `hogar/index.html`: «CilindroYa · Gas a domicilio en Imbabura por $3,60»; cada cantón con su título propio | Ver código fuente de cualquier página |
| 2 | Meta descripción | Una por página, con precio, zona y llamada a la acción | Ver código fuente |
| 3 | Encabezados ordenados | Un H1 por página; H2 en forma de pregunta en portada y cantones | Extensión HeadingsMap o ver código fuente |
| 4 | Tema claro | Un solo tema: gas doméstico a domicilio en Imbabura (familias y distribuidores autorizados) | Leer `/hogar/` |
| 5 | Indexable | `sitemap.xml` (18 URL con `lastmod`), `robots.txt` abierto con la ruta del sitemap, URL limpias | `/sitemap.xml`, `/robots.txt` |
| 6 | Verificado en buscadores | Google Search Console (sitemap «Correcto») y Bing Webmaster Tools (`BingSiteAuth.xml`) | `/BingSiteAuth.xml`, `/googlecc16b17e36df65bb.html` |
| 7 | Imágenes optimizadas | WebP, `alt` descriptivo en todas, `loading="lazy"` fuera del primer pantallazo, `width`/`height` fijos | Ver código fuente; 0 imágenes sin `alt` |
| 8 | Velocidad | Sin frameworks; caché larga en recursos versionados; fuentes con subconjunto de íconos | PageSpeed Insights de `/hogar/` |
| 9 | Móvil | Diseño adaptable probado a 360, 390, 768, 1024 y 1366 px sin desbordes | Abrir en el celular o en modo dispositivo |
| 10 | Enlaces internos | Portada ↔ cantones ↔ distribuidores ↔ guías ↔ preguntas; migas de pan con `BreadcrumbList` | Navegar desde `/hogar/` |

**SEO programático:** 8 páginas servicio × cantón (`/gas-a-domicilio/{cantón}/` y `/distribuidores-de-gas/{cantón}/`),
cada una con contenido local propio (referencias, vías, mapa) para no duplicar, y un buscador en la portada que lleva a
la combinación exacta.

## AEO, optimización para respuestas de IA (puntos 11–20)

| # | Criterio | Evidencia | Cómo verificar |
|---|---|---|---|
| 11 | Respuesta rápida | Párrafo de 40–60 palabras bajo el H1: qué es, dónde, cuánto cuesta, horario | `/hogar/`, primer párrafo |
| 12 | Encabezados en pregunta | «¿Cuánto cuesta…?», «¿Dónde operamos?», «¿Qué servicios…?», «¿Cómo pedir?» | `/hogar/` y páginas de cantón |
| 13 | Preguntas frecuentes reales | 22 preguntas en `/preguntas/`, ordenadas por momento de decisión | `/preguntas/`; `docs/mapa-de-preguntas.md` |
| 14 | FAQ con datos estructurados | `FAQPage` en 13 páginas; las preguntas del JSON-LD son las mismas que se ven en la página | [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) con `/preguntas/` |
| 15 | Negocio local | `LocalBusiness` con zona servida, horario, teléfono y precio; `Service` por cantón | Validador de schema.org con `/hogar/` |
| 16 | `llms.txt` | Precio desglosado, zonas, horario, pagos, tiempos, programa de distribuidores y enlaces clave | `/llms.txt` |
| 17 | Rastreadores de IA permitidos | `robots.txt` permite GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot y Google-Extended | `/robots.txt` |
| 18 | Prueba de respuestas | Un asistente que solo usa el contenido del sitio respondió 10 de 10 preguntas; los datos que faltaban se agregaron a las páginas | `docs/prueba-de-respuestas.md` |
| 19 | Contenido citable | Datos concretos y consistentes en todo el sitio: $3,60 ($1,65 ARCH + $1,85 entrega + $0,10 plataforma), 15–20 min, 06:30–19:30 | Comparar `/hogar/`, `/preguntas/` y `/llms.txt` |
| 20 | Plan de visibilidad | Roadmap de 90 días con métricas (impresiones, clics, citas en IA, pedidos) | `docs/roadmap-90-dias.md` |

**Perfil de negocio en Google:** creado y con la verificación por video enviada (en revisión de Google).

## Más allá de la rúbrica

- **Cili, asistente en el sitio:** chat con voz («Habla con Cili») que responde solo con información publicada, guía
  el pedido y el registro de distribuidores y deriva a WhatsApp cuando hace falta una persona.
- **Producto real detrás del sitio:** pedido en línea (`/cliente/`), aplicación de repartidores (`/pwa/`) y registro
  guiado de distribuidores con validación de RUC.
- **Accesibilidad:** contraste 4,5:1, foco visible, `prefers-reduced-motion` respetado, textos alternativos.
- **Impacto en la comunidad:** menos perifoneo (ruido), rutas más cortas (combustible) y venta asegurada para el
  distribuidor autorizado.

## Documentos de respaldo

| Documento | Contenido |
|---|---|
| [docs/auditoria.md](docs/auditoria.md) | Auditoría técnica completa con cifras de Lighthouse |
| [docs/mapa-de-preguntas.md](docs/mapa-de-preguntas.md) | Preguntas reales de clientes y dónde se responden |
| [docs/prueba-de-respuestas.md](docs/prueba-de-respuestas.md) | Prueba de respuestas, 10 de 10 |
| [docs/roadmap-90-dias.md](docs/roadmap-90-dias.md) | Plan de visibilidad a 90 días |
