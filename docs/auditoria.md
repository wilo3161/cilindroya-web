# Auditoría técnica (15 de noviembre de 2026)

## Funciona
| Punto | Estado |
|---|---|
| HTTPS | Certificado activo en `cilindroya.com` (Cloudflare delante de Hostinger) |
| `robots.txt` | Abierto para buscadores y para GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot y Google-Extended; bloquea solo `/pwa/` y `/marketing/` |
| `sitemap.xml` | 18 URL con fecha de modificación; enviado y aceptado en Google Search Console |
| `llms.txt` | Resumen de servicio, precios, zonas, horario, cómo pedir y programa de distribuidores |
| Datos estructurados | `WebSite`, `LocalBusiness`, `Service`, `FAQPage`, `Article` y `BreadcrumbList` en JSON-LD válido; las preguntas de `FAQPage` coinciden con las visibles |
| SEO en página | Título, meta descripción, canonical y un solo H1 en cada página; textos alternativos en todas las imágenes; enlaces internos entre portada, cantones, distribuidores, guías y preguntas |
| SEO programático | Páginas servicio × cantón con contenido local propio (referencias, vías y mapa) y buscador en la portada |
| Página 404 | Propia, con Cili y enlaces de regreso; responde con estado 404 |
| Contenido sin JavaScript | Todo el texto, los precios y las preguntas están en el HTML; el JavaScript solo agrega animaciones y el chat |
| Diseño adaptable | Probado a 360, 390, 768, 1024 y 1366 px: sin desborde horizontal; botones de 44 px o más |
| Accesibilidad | Contraste de texto 4,5:1, foco visible con teclado, animaciones desactivadas con `prefers-reduced-motion` |

## Lighthouse (sitio en vivo)
| Página | Dispositivo | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|---|
| `/hogar/` | Celular | 86 | 100 | 100 | 100 |
| `/hogar/` | Escritorio | 98 | 100 | 100 | 100 |
| `/preguntas/` | Celular | 86 | 100 | 100 | 100 |
| `/preguntas/` | Escritorio | 98 | 95 | 100 | 100 |

Corregido después de esta medición: caché larga para archivos estáticos, fuentes y hoja del chat sin bloquear el primer
pintado, imagen del héroe en tamaño para celular y botón de cerrar del saludo de Cili con área táctil suficiente (el
punto que bajaba la accesibilidad a 95).

## No verificado o pendiente
- Bing Webmaster Tools: pendiente de la cuenta de Microsoft del autor.
- Perfil de empresa en Google: creado; falta la verificación en video.
- Publicación del enlace en Facebook, Instagram y LinkedIn.
