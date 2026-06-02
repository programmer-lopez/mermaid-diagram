<<<<<<< Updated upstream
# Mermaid-Diagram
Diagramación de flujos Mermaid.
=======
# Visor de Diagramas Mermaid (Mermaid Viewer)

Este proyecto es una aplicación interactiva desarrollada en Angular para visualizar, editar y navegar diagramas creados con la sintaxis de Mermaid.js. Está optimizado para ofrecer una experiencia fluida tanto en diagramas sencillos como en estructuras complejas.

## Características Principales

*   **Renderizado Dinámico**: Permite visualizar y validar diagramas escritos en la sintaxis de Mermaid.js en tiempo real.
*   **Editor de Código Integrado**: Incluye una interfaz de edición en un cuadro de diálogo para modificar el diagrama de manera rápida y directa, con visualización de errores de sintaxis en caso de que ocurran.
*   **Desplazamiento y Zoom Interactivos (Pan & Zoom)**: Integra la biblioteca Panzoom para permitir arrastrar, mover y hacer zoom libremente sobre el diagrama, facilitando la exploración de diagramas de gran tamaño.
*   **Navegación Paso a Paso para Diagramas de Secuencia**: Al cargar un diagrama de secuencia, el sistema detecta de forma automática los pasos numerados. Permite realizar un recorrido interactivo (paso a paso) utilizando botones de navegación o un control deslizante, enfocando y encuadrando automáticamente la vista en la sección correspondiente a cada paso.
*   **Persistencia y Compartición mediante URL**: El contenido del diagrama se comprime (utilizando DEFLATE y codificación Base64) y se almacena en el hash de la URL. Además, el paso seleccionado en la secuencia se guarda como parámetro de búsqueda en la URL. Esto permite compartir el enlace completo y que cualquier destinatario acceda exactamente al mismo diagrama en el mismo estado de visualización.

## Requisitos Previos

Para ejecutar este proyecto de forma local, asegúrese de tener instalado:

*   Node.js (versión compatible con Angular 21)
*   El gestor de paquetes pnpm (definido en la configuración del proyecto)

## Instalación y Configuración

1.  Instale las dependencias del proyecto utilizando:

    ```bash
    pnpm install
    ```

## Servidor de Desarrollo

Inicie el servidor de desarrollo local ejecutando:

```bash
pnpm start
```

Una vez iniciado, abra su navegador en `http://localhost:4200/`. La aplicación se recargará automáticamente al realizar cambios en los archivos fuente.

## Construcción del Proyecto

Para compilar el proyecto y generar los archivos listos para producción, ejecute:

```bash
pnpm build
```

Los artefactos de la compilación se almacenarán en el directorio `dist/`. La compilación de producción optimiza la aplicación de forma automática para obtener el mejor rendimiento y velocidad de carga.

## Pruebas Unitarias

Para ejecutar las pruebas de unidad utilizando el motor de pruebas Vitest, ejecute:

```bash
pnpm test
```

## Estructura del Proyecto

La lógica principal y los componentes clave del visor se encuentran en los siguientes archivos:

*   [app.ts](file:///c:/Users/USUARIO/Personal%20Projects/mermaid-diagram/src/app/app.ts): Componente raíz que gestiona el renderizado de Mermaid, inicializa el control de zoom/desplazamiento y controla la lógica de la navegación paso a paso.
*   [app.html](file:///c:/Users/USUARIO/Personal%20Projects/mermaid-diagram/src/app/app.html): Estructura del visor, botones de control, deslizador de secuencias y el diálogo del editor de código.
*   [url-storage.service.ts](file:///c:/Users/USUARIO/Personal%20Projects/mermaid-diagram/src/app/url-storage.service.ts): Servicio encargado de la compresión (DEFLATE/Base64) y la comunicación con el historial del navegador para persistir el estado y el código del diagrama en la URL.
>>>>>>> Stashed changes
