# Guion de grabación · 6 minutos

Cada integrante aparece en cámara y expone un bloque técnico distinto durante al menos un minuto. Reemplaza «Integrante 1–4» por los nombres y explica las aportaciones reales del equipo.

| Tiempo | Quién | Pantalla y acción |
| --- | --- | --- |
| 0:00–0:40 | Los cuatro | Presentarse en cámara. Cada integrante dice su nombre y qué parte trabajó. |
| 0:40–1:50 | Integrante 1 | Mostrar la carpeta y abrir `Iniciar.bat`. Explicar cómo `index.html`, `js/ui.js` y `js/ipv4.js` separan el formulario de los cálculos. Introducir `192.168.10.0/24` y señalar la red, máscara, rango y broadcast. |
| 1:50–3:00 | Integrante 2 | Introducir `192.168.10.65 255.255.255.192`. Explicar por qué se obtiene `/26`, cómo se identifica la red `.64` y por qué el broadcast es `.127`. Abrir la vista binaria y probar la máscara inválida `255.0.255.0`. |
| 3:00–4:10 | Integrante 3 | En VLSM, pulsar **Usar ejemplo** y mostrar las solicitudes desordenadas. Explicar el orden descendente y calcular en voz alta el bloque de A. Con 100 hosts se necesitan 102 direcciones, que caben en 128, por lo que el prefijo es `/25`. Ejecutar la asignación. |
| 4:10–5:20 | Integrante 4 | Leer las redes A y B y explicar por qué B empieza en `.128`. Señalar las 16 direcciones libres y distinguirlas de los hosts sin usar de cada bloque. Cambiar los requerimientos a `A: 255` para reproducir el error de capacidad. |
| 5:20–6:00 | Los cuatro | Mostrar el resultado de `node --test tests/ipv4.test.cjs`. Cada integrante menciona una prueba o un aprendizaje propio. Cerrar con el nombre del proyecto. |

Guarda el video como `EquipoX_CalculadoraIP.mp4` y sustituye X por el número asignado. Si se entrega por enlace, comprueba que el profesor pueda abrirlo y agrégalo al informe.
