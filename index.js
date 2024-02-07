//importaciones
const { connection } = require("./database/connection")
const express = require("express");
const cors = require("cors")


//Mensaje del inicio de la API
console.log("API de node para RED SOCIAL arrancada");


//Conectar a la base de datos
connection();


//Crear servidor de node
const app = express();
const port = 4000;


//Configurar cors
app.use(cors());


//Convertir los datos del body en objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//Rutas
const user_routes = require("./routes/user");
const publication_routes = require("./routes/publication");
const follow_routes = require("./routes/follow");

app.use("/api/user", user_routes);
app.use("/api/publication", publication_routes);
app.use("/api/follow", follow_routes);


//Poner al servidor a escuchar peticione HTTP
app.listen(port, ()=> console.log("Servidor de node corriendo en el puerto" + port))