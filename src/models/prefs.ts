export type Prefs {
    height?: number = 1;
    width?: number = 1;
    icon?: string;
}

enum BackgroundType {
    linear = 'linear',
    radial = 'radial',
    conic = 'conic',
    flat = 'flat'
}

export class RoomPrefs {
    order?: number[] = [];
    bgAngle?: number = 270;
    bgColor?: string[] = [
        '#1a50e2',
        '#1096b1',
    ];
}