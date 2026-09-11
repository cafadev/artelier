# Artelier — prototipo de app

Prototipo navegable de la app de **Artelier** (taller creativo: manualidades escolares,
papelería especializada y decoración de eventos), implementado desde el diseño de Figma
en HTML, CSS y JavaScript vanilla. **No tiene backend**: el estado vive en memoria y se
reinicia al recargar la página.

## Cómo verlo

```bash
python3 -m http.server 4172
```

Luego abrí <http://localhost:4172>. Cualquier servidor estático sirve; también funciona
abriendo `index.html` directamente en el navegador.

## Pantallas

| Pantalla | Qué se puede hacer |
|---|---|
| Inicio | carrusel con dots, búsqueda, categorías y productos destacados |
| Productos | grid con filtros por categoría y búsqueda |
| Producto | elegir tamaño (recalcula el precio), cantidad, favorito, agregar al carrito |
| Mi carrito | cambiar cantidades, eliminar, subtotal / envío / total en vivo |
| Mis pedidos | listado con estados; al finalizar un pedido se agrega arriba |
| Mi perfil | datos, accesos y cierre de sesión |
| Nosotros | empresa, misión, visión y valores |

## Responsive

- **< 768 px** — layout móvil, tab bar inferior y menú lateral.
- **768–999 px** — contenido centrado, catálogo a 3 columnas.
- **≥ 1000 px** — el tab bar se convierte en barra lateral y la tipografía sube un escalón.

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | las 7 pantallas y el sprite de iconos SVG |
| `assets/` | logo y fotos de producto (JPG) |
| `styles.css` | tokens de color y tipografía del Figma + las tres capas responsive |
| `app.js` | catálogo, carrito, pedidos y navegación |

`index.html?test=1` corre en consola unos asserts sobre el carrito y los totales.

## Imágenes

Cada foto se resuelve por convención: un producto con id `taza` busca `assets/taza.jpg`.
Si el archivo no existe, el `<img>` se descarta solo y queda un degradado con el icono de
la categoría — así que para agregar o cambiar una foto basta con dejar el archivo en
`assets/` con el nombre correcto, sin tocar el código.

| Archivo | Dónde aparece |
|---|---|
| `assets/logo.jpg` | cabecera, menú, barra lateral y portada de Nosotros |
| `assets/hero-1.jpg` | primer slide del carrusel |
| `assets/maqueta.jpg` · `cumple.jpg` · `trifolio.jpg` · `taza.jpg` | productos destacados, catálogo, ficha y carrito |

Los productos sin foto propia (`album`, `invitaciones`, `centro`, `rotulos`) usan el
placeholder a propósito.

## Notas de implementación

- Los iconos son SVG dibujados a mano en un sprite, sin librerías ni dependencias.
- Tipografías: Poppins y Montserrat desde Google Fonts.
- El logo es un JPG con fondo blanco; se funde con el fondo de la app vía `mix-blend-mode: multiply`.
- Los colores de los estados de pedido no están en el Figma; se eligieron para que se distingan entre sí.
