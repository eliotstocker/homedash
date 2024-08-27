export class baseMeta {

}

export class lightMeta extends baseMeta {
    public level: boolean;
    public ct: boolean;
    public color: boolean;
}

export class hvacMeta extends baseMeta {
    public heat: boolean;
    public cool: boolean;
    public modes: string[];
}

export class mediaMeta extends baseMeta {
    public controller: boolean;
    public source: boolean;
    public player: boolean;
}

export type Meta = baseMeta|lightMeta|hvacMeta|mediaMeta;