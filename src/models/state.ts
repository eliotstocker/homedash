export class baseState {
    state:string;
}

export class lightState extends baseState {
    public level: number;
    public mode: string;
    public ct: number;
    public hue: number;
    public saturation: number;
}

export class hvacState extends baseState {
    public mode: string;
    public temp: number;
    public setpoint: number;
    public heatSetpoint: number;
    public coolSetpoint: number;
    public fanMode: string;
}

export class mediaState extends baseState {
    public volume: number;
    public muted: boolean;
    public data: mediaData;
}

export class cameraState extends baseState {
    public image: string;
    public stream: string;
}

export class mediaData {
    app: string;
    title: string;
    artist: string;
    image: string;
}

export type State = baseState|lightState|hvacState|mediaState|cameraState;