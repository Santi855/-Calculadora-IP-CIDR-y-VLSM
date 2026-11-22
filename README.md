# Calculadora IP · CIDR y VLSM

Proyecto 2 de la Escuela Superior de Cómputo del IPN. Aplicación local de IPv4 escrita en HTML, CSS y JavaScript.

## Ejecutar

1. Extrae el ZIP completo en una carpeta.
2. En Windows, haz doble clic en `Iniciar.bat`. También puedes abrir `index.html` directamente en un navegador moderno.
3. Usa **CIDR** para calcular una subred o **VLSM** para repartir una red base. La aplicación funciona sin conexión y sin dependencias externas. Tampoco requiere compilación.

## Usar ambas calculadoras

- **CIDR.** Introduce `192.168.10.0/24` y pulsa **Calcular CIDR**. Obtendrás la red `192.168.10.0/24`, la máscara `255.255.255.0`, el rango `192.168.10.1` a `192.168.10.254`, el broadcast `192.168.10.255` y 254 hosts. También puedes introducir `192.168.10.34 255.255.255.0`. La sección binaria se abre debajo de los resultados.
- **VLSM.** Introduce la base `192.168.0.0/24`. Agrega una línea por subred y pulsa **Asignar subredes**.

  ```text
  D: 10
  B: 50
  A: 100
  C: 25
  ```

  Deben aparecer A (`/25`), B (`/26`), C (`/27`) y D (`/28`), en ese orden. Quedan libres 16 direcciones, de `192.168.0.240` a `192.168.0.255`. Para probar el error de capacidad, cambia la lista a `A: 255`.

El botón **Usar ejemplo** llena cada formulario. En CIDR, `/31` se interpreta como un enlace punto a punto y `/32` como una dirección individual. En VLSM, cada subred reserva red y broadcast, por lo que el bloque mínimo es `/30`. La herramienta calcula redes según su capacidad teórica de direccionamiento.

## Ejecutar las pruebas

Solo las pruebas requieren Node.js 20 o superior. Abre una terminal en la carpeta extraída y ejecuta:

```sh
node --test tests/ipv4.test.cjs
```

Las pruebas cubren el ejemplo de cada calculadora, máscaras y formatos inválidos, orden y tamaño de bloques, falta de capacidad individual y acumulada, ajuste exacto y prefijos límite.

## Estructura

| Archivo | Función |
| --- | --- |
| `index.html` | Formularios y estructura de resultados |
| `styles.css` | Estilos y adaptación a pantallas estrechas |
| `js/ipv4.js` | Conversiones IPv4, validación, CIDR y VLSM |
| `js/ui.js` | Eventos de formularios y renderizado de resultados |
| `Iniciar.bat` | Lanzador de Windows |
| `tests/ipv4.test.cjs` | Pruebas unitarias |
| `Guion_video.md` | Pauta y secuencia de grabación |

Referencias técnicas de notación CIDR y enlaces `/31`. [RFC 4632, sección 3.1](https://www.rfc-editor.org/rfc/rfc4632#section-3.1) y [RFC 3021, sección 2.2](https://www.rfc-editor.org/rfc/rfc3021#section-2.2).
