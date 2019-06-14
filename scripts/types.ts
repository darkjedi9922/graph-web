export interface NodeModel {
    id: number,
    x: number,
    y: number,
    text: string,
    radius: number,
    startEdges: number[],
    endEdges: number[]
}

export interface EdgeModel {
    startNodeId: number,
    endNodeId: number,
    text: string,
    curve: number
}

export interface NodeMap { [id: number]: NodeModel };
export interface EdgeMap { [id: number]: EdgeModel };

export interface Point {
    x: number,
    y: number
}

export interface Rotate {
    deg: number,
    origin: Point
}