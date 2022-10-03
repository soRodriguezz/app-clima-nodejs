require('dotenv').config();

const { inquirerMenu, pausa,leerInput, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
  const busquedas = new Busquedas();

  let opt;

  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        console.clear();
        const termino = await leerInput('Ciudad: ');

        const lugares = await busquedas.ciudad( termino );
        const idSeleccionado = await listarLugares(lugares);

        if( idSeleccionado == 0 ) continue;

        const lugarSeleccionado = lugares.find( lugar => lugar.id === idSeleccionado );

        busquedas.agregarHistorial(lugarSeleccionado.nombre);

        const clima = await busquedas.climaLugar(lugarSeleccionado.lat, lugarSeleccionado.lng);

        console.clear();
        console.log("\nInformación de la ciudad\n".green);
        console.log('Ciudad: ', lugarSeleccionado.nombre);
        console.log('Latitud: ', lugarSeleccionado.lat);
        console.log('Longitud: ', lugarSeleccionado.lng);
        console.log('Temperatura:', clima.temp);
        console.log('Máxima: ', clima.max);
        console.log('Mínima: ', clima.min);
        console.log('Como está el clima: ', clima.desc);
        break;

      case 2:
        console.log();
        // busquedas.historial.forEach((lugar, index) => {
        busquedas.historialCapitalizado.forEach((lugar, index) => {
            const idx = `${ index + 1 }`.green;
            console.log(`${ idx } ${ lugar }`);
        })
        break;

      case 3:
        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
