# CilindroYa · cilindroya.com

Sitio web de **CilindroYa**, plataforma de gas doméstico a domicilio en Imbabura (Ecuador): la familia pide su
cilindro desde el celular, un distribuidor autorizado lo lleva a la puerta y cobra al entregar.

> **Para evaluar:** [EVALUACION.md](EVALUACION.md) recorre los 20 puntos de la rúbrica con la evidencia de cada
> uno y cómo comprobarla en el sitio publicado.

Proyecto presentado al reto **«Hazte visible en internet y vende más»** (Hostinger × Irremplazables, 14–15 de
noviembre de 2026). Autor: **Ing. Wilson Pérez**, ingeniero en Logística y Transporte (Ibarra, Ecuador).

**El problema:** en Imbabura los camiones de gas recorren los barrios perifoneando para encontrar clientes; gastan
combustible en vueltas sin pedido y generan ruido. CilindroYa lleva el pedido al celular: el distribuidor autorizado
recibe la dirección, arma su ruta por cercanía y entrega en unos 15 a 20 minutos.

- Sitio en vivo: https://cilindroya.com
- Alojamiento: Hostinger (plan Premium), dominio propio con Cloudflare al frente (SSL y caché).
- Hecho con HTML, CSS y JavaScript sin frameworks, para que cargue rápido en celulares.
- Facebook: https://www.facebook.com/profile.php?id=61594955714385

## Qué hay en el sitio

| Ruta | Para qué sirve |
|---|---|
| `/hogar/` | Portada: precio, respuesta rápida, pedido, cobertura, preguntas frecuentes y Cili, la mascota |
| `/gas-a-domicilio/` y `/gas-a-domicilio/{cantón}/` | Gas a domicilio en Ibarra, Otavalo, Antonio Ante y Cotacachi |
| `/distribuidores-de-gas/` y `/distribuidores-de-gas/{cantón}/` | Programa para distribuidores autorizados, por cantón |
| `/preguntas/` | Mapa de preguntas reales de clientes con respuesta directa |
| `/distribuidores/` y `/distribuidores/registro/` | Programa y registro de distribuidores |
| `/guias/` | Guías para distribuidores |
| `/cliente/` | Pedido en línea (aplicación web) |
| `/pwa/` | Aplicación de los repartidores |
| `/404.html` | Página de error con Cili, la mascota |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | Indexación para buscadores e inteligencias artificiales |

## Cómo apliqué lo visto en las sesiones

**SEO (puntos 1–10 de la rúbrica)**
- Título y meta descripción propios en cada página; un solo H1 y encabezados ordenados.
- Tema claro: gas a domicilio en Imbabura.
- Indexable: `sitemap.xml` con fechas, `robots.txt` abierto y URL limpias. Sitio verificado en Google Search
  Console con el sitemap enviado.
- Todas las imágenes con texto alternativo; imágenes en WebP y carga diferida.
- Velocidad y móvil: sin frameworks, imágenes WebP con carga diferida, sin desborde a 360 px.
- Enlaces internos entre portada, cantones, distribuidores, guías y preguntas.
- SEO programático (prompt 5): páginas de servicio × cantón y un buscador en la portada que lleva a la
  combinación exacta.
- Página 404 propia.

**AEO (puntos 11–20 de la rúbrica)**
- Respuesta rápida de 40–60 palabras bajo el H1 (qué es, dónde, cuánto cuesta, horario).
- Encabezados en forma de pregunta: cuánto cuesta, dónde operamos, qué servicios, cómo pedir.
- Preguntas frecuentes reales con respuesta directa, en la portada y en `/preguntas/`.
- Datos estructurados JSON-LD válidos: `WebSite`, `LocalBusiness`, `Service`, `FAQPage`, `Article`,
  `BreadcrumbList`.
- `llms.txt` con precios, zonas, horario, cómo pedir, programa de distribuidores y enlaces clave.
- `robots.txt` permite GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot y Google-Extended.
- Verificado en Google Search Console y Bing Webmaster Tools, con el sitemap enviado en ambos; perfil de negocio en Google creado.
- Prueba de respuestas: un asistente que solo usa el contenido del sitio responde las preguntas de los
  clientes; donde faltaba un dato, se completó la página o se dejó dicho que se consulte por WhatsApp.

**Más allá de la rúbrica**
- **Cili**, la mascota, atiende en el sitio: chat con voz («Habla con Cili») que responde solo con información
  del sitio, guía el pedido y el registro de distribuidores, y pasa a WhatsApp cuando hace falta una persona.
- Cili acompaña cada página: invita a pedir o a registrarse, con animaciones de entrada que respetan `prefers-reduced-motion`.
- Capa de animación propia (`brand/cy-animaciones.*`): entradas al desplazarse, botones con relieve y destello, botón de pedido con camión y transiciones del registro, sin librerías externas.

## Estructura del código

```
hogar/                  portada
gas-a-domicilio/        páginas por cantón (familias)
distribuidores-de-gas/  páginas por cantón (distribuidores)
preguntas/              mapa de preguntas
guias/                  guías
brand/                  estilos, scripts y logos de la marca (cy-*.css, cy-*.js)
assets/                 imágenes de Cili y de la marca
robots.txt · sitemap.xml · llms.txt · 404.html · .htaccess
```

No se inventan datos: precios, zonas, horarios y condiciones salen de la operación real de CilindroYa.

## Documentos del reto

| Documento | Contenido |
|---|---|
| [docs/mapa-de-preguntas.md](docs/mapa-de-preguntas.md) | Preguntas reales de clientes por momento de decisión y dónde se responden |
| [docs/prueba-de-respuestas.md](docs/prueba-de-respuestas.md) | Prueba de respuestas: 10 de 10 preguntas respondidas con el contenido publicado |
| [docs/auditoria.md](docs/auditoria.md) | Auditoría técnica: HTTPS, robots, sitemap, llms.txt, datos estructurados y Lighthouse |
| [docs/roadmap-90-dias.md](docs/roadmap-90-dias.md) | Plan de visibilidad a 90 días y cómo se mide |

## Cómo verificarlo

1. `https://cilindroya.com/robots.txt`, `/sitemap.xml` y `/llms.txt`.
2. `/preguntas/` en la [Prueba de resultados enriquecidos de Google](https://search.google.com/test/rich-results): detecta `FAQPage`.
3. Lighthouse o PageSpeed Insights de `/hogar/` en celular y escritorio.
4. Una dirección que no existe muestra la página 404 con Cili.

## Licencia

MIT. Ver [LICENSE](LICENSE).
