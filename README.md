# CilindroYa · cilindroya.com

Sitio web de **CilindroYa**, plataforma de gas doméstico a domicilio en Imbabura (Ecuador): la familia pide su
cilindro desde el celular, un distribuidor autorizado lo lleva a la puerta y cobra al entregar.

Proyecto presentado al reto **«Hazte visible en internet y vende más»** (Hostinger × Irremplazables, 14–15 de
noviembre de 2026). Autor: Wilson Pérez (Ibarra, Ecuador).

- Sitio en vivo: https://cilindroya.com
- Alojamiento: Hostinger (plan Premium), dominio propio con Cloudflare al frente (SSL y caché).
- Hecho con HTML, CSS y JavaScript sin frameworks, para que cargue rápido en celulares.

## Qué hay en el sitio

| Ruta | Para qué sirve |
|---|---|
| `/hogar/` | Portada: precio, respuesta rápida, pedido, cobertura, preguntas frecuentes y Cili en 3D |
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
- Velocidad y móvil: sin frameworks, el texto principal aparece antes que el 3D, sin desborde a 375 px.
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
- Prueba de respuestas: un asistente que solo usa el contenido del sitio responde las preguntas de los
  clientes; donde faltaba un dato, se completó la página o se dejó dicho que se consulte por WhatsApp.

**Más allá de la rúbrica**
- **Cili**, la mascota, atiende en el sitio: chat con voz («Habla con Cili») que responde solo con información
  del sitio, guía el pedido y el registro de distribuidores, y pasa a WhatsApp cuando hace falta una persona.
- Cili en 3D en la portada (modelo GLB con `<model-viewer>`), cargado después del contenido para no frenar la página.

## Estructura del código

```
hogar/                  portada
gas-a-domicilio/        páginas por cantón (familias)
distribuidores-de-gas/  páginas por cantón (distribuidores)
preguntas/              mapa de preguntas
guias/                  guías
brand/                  estilos, scripts y logos de la marca (cy-*.css, cili-*.js, vendor/)
assets/                 imágenes y modelo 3D
robots.txt · sitemap.xml · llms.txt · 404.html · .htaccess
```

No se inventan datos: precios, zonas, horarios y condiciones salen de la operación real de CilindroYa.
