const mongoose = require("mongoose");

const connection = async () => {
  
  try {
    
    await mongoose.connect("mongodb://localhost:27017/red-social");
    console.log("Conectado correctamente a la base de datos res-social")
  
  } catch(error) {

    console.log(error);
    throw new Error("No se ha podido conectar a la base de datos");

  }

}


module.exports = {
  connection
};