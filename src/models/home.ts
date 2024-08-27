export default class Home {
    name: string;
    baseUrl:String;
    tempScale: string;
    lastUpdate: number;
    location: {
        longitude: number,
        latitude: number
    };
    sunrise: number;
    sunset: number;
}