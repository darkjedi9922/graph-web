import React from 'react';
import Node from './node';
import Edge from './edge';
import { NodeMap, EdgeMap, Point } from '../types';

interface CanvasProps {
    nodes: NodeMap,
    edges: EdgeMap,
    oriented: boolean,
    onNodeClick: (id: number) => void,
    onEdgeClick: (id: number) => void,
    onNodeMove: (id: number, x: number, y: number) => void,
    onNodeTextChange: (id: number, text: string) => void,
    onEdgeCurve: (id: number, curve: number) => void,
    onEdgeTextChange: (id: number, text: string) => void,
    onContextMenu: (event: React.MouseEvent, nodeId: number, edgeId: number) => void,
    addedEdgeEndPos: Point
}

class Canvas extends React.Component<CanvasProps> 
{
    private elem = React.createRef<SVGSVGElement>()

    constructor(props) {
        super(props);
    }

    render() {
        const p = this.props;

        return (
            <svg className="graph__nodes" ref={this.elem}
                onContextMenu={(e) => {
                    e.target === this.elem.current && p.onContextMenu(e, -1, -1)}
                }
            >
                {this._createEdgeElementList()}
                {this._createNodeElementList()}
            </svg>
        );
    }

    public getCoords(): Point {
        const rect = this.elem.current.getBoundingClientRect();
        return {
            x: rect.left + pageXOffset,
            y: rect.top + pageYOffset
        }
    }

    /**
     * @returns array of Node
     */
    _createNodeElementList() {
        let result = [];
        for (const id in this.props.nodes) {
            const node = this.props.nodes[id];
            result.push(<Node key={id} id={Number.parseInt(id)} text={node.text}
                radius={node.radius}
                cx={node.x} cy={node.y}
                className='graph__node'
                onMove={(x, y) => this.props.onNodeMove(Number.parseInt(id), x, y)}
                onClick={() => this.props.onNodeClick(Number.parseInt(id))} 
                onTextChange={(text) => this.props.onNodeTextChange(Number.parseInt(id), text)}
                onContextMenu={(e) => this.props.onContextMenu(e, Number.parseInt(id), -1)}
            />);
        }
        return result;
    }

    /**
     * @returns array of Edge
     */
    _createEdgeElementList() {
        const result = [];
        for (let id in this.props.edges) {
            const edge = this.props.edges[id];
            result.push(<Edge key={id} arrow={this.props.oriented}
                start={this._getEdgeStartPos(id)} end={this._getEdgeEndPos(id)}
                curve={edge.curve} text={edge.text}
                nodeRadius={this._isAddedEdge(id) ? 0 : 25}
                onClick={() => this.props.onEdgeClick(Number.parseInt(id))}
                onCurve={(curve) => this.props.onEdgeCurve(Number.parseInt(id), curve)}
                onTextChange={(text) => this.props.onEdgeTextChange(Number.parseInt(id), text)}
                onContextMenu={(e) => this.props.onContextMenu(e, -1, Number.parseInt(id))}    
            />);
        }
        return result;
    }

    _getEdgeStartPos(id) {
        const edge = this.props.edges[id];
        const startNode = this.props.nodes[edge.startNodeId];
        return {
            x: startNode.x,
            y: startNode.y
        }
    }

    _getEdgeEndPos(id) {
        let end;
        const edge = this.props.edges[id];
        if (this._isAddedEdge(id)) {
            const addedEdgeEndPos = this.props.addedEdgeEndPos;
            end = { x: addedEdgeEndPos.x, y: addedEdgeEndPos.y };
        } else {
            const endNode = this.props.nodes[edge.endNodeId];
            end = { x: endNode.x, y: endNode.y };
        }
        return end;
    }

    _isAddedEdge(id) {
        // Если у ребра нет конца, значит оно в процессе добавления.
        return this.props.edges[id].endNodeId === null;
    }
}

export default Canvas;