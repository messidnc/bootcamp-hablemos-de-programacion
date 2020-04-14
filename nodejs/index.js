const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;

let recursos = {
  mascotas: [
    { tipo: "perro", nombre: "Trosky", dueno: "Camilo" },
    { tipo: "perro", nombre: "Trosky", dueno: "Camilo" },
    { tipo: "perro", nombre: "Trosky", dueno: "Camilo" },
    { tipo: "perro", nombre: "Trosky", dueno: "Camilo" },
    { tipo: "perro", nombre: "Trosky", dueno: "Camilo" },
  ],
};

const callbackDelServidor = (req, res) => {
  // 1. obtener url desde el objeto request // OK
  const urlActual = req.url;
  const urlParseada = url.parse(urlActual, true);

  // 2. obtener la ruta
  const ruta = urlParseada.pathname;

  // 3. quitar slash
  const rutaLimpia = ruta.replace(/^\/+|\/+$/g, "");

  // 3.1 obtener el método http
  const metodo = req.method.toLowerCase();

  // 3.2 obtener variables del query url
  const { query = {} } = urlParseada;

  // 3.3 obtener headers
  const { headers = {} } = req;

  // 3.4 obtener payload, en el caso de haber uno
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  // 3.4.1 ir acumulando la data cuando el request reciba un payload
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });

  // 3.4.2 terminar de acumular datos y decirle al decoder que finalice
  req.on("end", () => {
    buffer += decoder.end();

    if (headers["content-type"] === "application/json") {
      buffer = JSON.parse(buffer);
    }

    //3.4.3 revisar si tiene subrutas en este caso es el indice del array
    if (rutaLimpia.indexOf("/") > -1) {
      var [rutaPrincipal, indice] = rutaLimpia.split("/");
    }
    //3.5 ordenar la data del request
    const data = {
      indice,
      ruta: rutaPrincipal || rutaLimpia,
      query,
      metodo,
      headers,
      payload: buffer,
    };

    console.log({ data });

    // 3.6 elegir el manejador dependiendo de la ruta y asignarle función que el enrutador tiene
    let handler;
    if (data.ruta && enrutador[data.ruta] && enrutador[data.ruta][metodo]) {
      handler = enrutador[data.ruta][metodo];
    } else {
      handler = enrutador.noEncontrado;
    }
    console.log("handler", handler);

    // 4. ejecutar handler (manejador) para enviar la respuesta
    if (typeof handler === "function") {
      handler(data, (statusCode = 200, mensaje) => {
        const respuesta = JSON.stringify(mensaje);
        res.setHeader("Content-Type", "application/json");
        res.writeHead(statusCode);
        // linea donde realmente ya estamos respondiendo a la aplicación cliente
        res.end(respuesta);
      });
    }
    // respuestas según la ruta
  });
};

const enrutador = {
  ruta: (data, callback) => {
    callback(200, { mensaje: "esta es /ruta" });
  },
  mascotas: {
    get: (data, callback) => {
      if (typeof data.indice !== "undefined") {
        console.log("handler mascotas", { data });
        if (recursos.mascotas[data.indice]) {
          return callback(200, recursos.mascotas[data.indice]);
        }
        return callback(404, {
          mensaje: `mascota con indice ${data.indice} no encontrada`,
        });
      }
      callback(200, recursos.mascotas);
    },
    post: (data, callback) => {
      recursos.mascotas.push(data.payload);
      callback(201, data.payload);
    },
  },
  noEncontrado: (data, callback) => {
    callback(404, { mensaje: "no encontrado" });
  },
};

const server = http.createServer(callbackDelServidor);

server.listen(5000, () => {
  console.log(
    "el servidor está escuchando peticiones en http://localhost:5000/"
  );
});