const fs = require('fs');

const axios = require('axios');

class Busquedas {
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        this.leerBD();
    }

    get historialCapitalizado() {
        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );

            return palabras.join(' ');
        });

    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es',
        }
    }

    get paramsOpenWeather() {
        return {
            'appid': process.env.OPENWEATHERMAP_KEY,
            'units': 'metric',
            'lang': 'es',
        }
    }

    async ciudad( termino = '' ) {
        try {

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ termino }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();

            return resp.data.features.map( lugar => ({  //NOTE: Retorna un objeto
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));

        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async climaLugar(lat, lon){
        try{
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenWeather, lat, lon },
            });

            const resp = await instance.get();

            return {
                desc: resp.data.weather[0].description,
                min: resp.data.main.temp_min,
                max: resp.data.main.temp_max,
                temp: resp.data.main.temp,
            }

        }catch(error) {
            console.log(error);
        }
    }

    agregarHistorial(lugar = '') {

        if( this.historial.includes( lugar .toLocaleLowerCase() ) ){
            return;
        }

        this.historial = this.historial.splice(0,4);

        this.historial.unshift(lugar.toLocaleLowerCase());

        this.guardarDB();
    }

    guardarDB() {

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ))

    }

    leerBD() {
        if(!fs.existsSync(this.dbPath)) return;

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );
        const data = JSON.parse(info);

        this.historial = data.historial.splice(0,5);
    }

}

module.exports = Busquedas;