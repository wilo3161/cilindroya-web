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

## Lighthouse (sitio en vivo, versión final)
| Página | Dispositivo | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|---|
| `/hogar/` | Celular | 85 | 100 | 100 | 100 |
| `/hogar/` | Escritorio | 97 | 100 | 100 | 100 |
| `/preguntas/` | Celular | 91 | 100 | 100 | 100 |
| `/preguntas/` | Escritorio | 88–98 | 100 | 100 | 100 |

Aplicado para llegar aquí: caché larga para archivos estáticos, fuentes y hoja del chat sin bloquear el primer pintado,
imagen del héroe en tamaño para celular y área táctil suficiente en todos los botones. El rendimiento varía unos puntos
entre mediciones según la red.

## Buscadores
- Google Search Console: propiedad verificada y sitemap enviado.
- Bing Webmaster Tools: sitio verificado (archivo `BingSiteAuth.xml`) y sitemap enviado.

## No verificado o pendiente
- Perfil de empresa en Google: creado; falta la verificación en video.
- Publicación del enlace en Facebook, Instagram y LinkedIn.
