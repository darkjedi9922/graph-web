import React from 'react';
import Canvas from './canvas';
import CanvasContextMenu from './canvas-context-menu';
import { ContextMenuTrigger } from 'react-contextmenu';
import { NodeMap, EdgeMap, NodeModel } from '../types';
import SideTools from './sidetools';

interface GraphState {
    nodes: NodeMap,
    edges: EdgeMap,
    oriented: boolean,
    edgeAdding: null | {
        x: number,
        y: number,
        mouseEventListener: (e: MouseEvent) => void
    }
}

export default class Graph extends React.Component<{}, GraphState>
{
    private nodesCount: number = 0;
    private nextNodeId: number = 1;
    private nextEdgeId: number = 1;
    private lastAddedEdgeId: number | null = null;
    private lastContextedNodeId: number = -1;
    private lastContextedEdgeId: number = -1;
    private canvasRef = React.createRef<Canvas>();
    private canvasContextMenuRef = React.createRef<CanvasContextMenu>();

    // Элемент триггера для открытия контекстного меню вручную через него.
    private contextMenuTrigger = new ContextMenuTrigger({
        id: 'canvas-contextmenu'
    });

    constructor(props) {
        super(props);
        this.state = {
            nodes: {},
            edges: {},
            oriented: false,
            edgeAdding: null
        };

        this.onNodeClick = this.onNodeClick.bind(this);
        this.moveNode = this.moveNode.bind(this);
        this.onEdgeCurve = this.onEdgeCurve.bind(this);
        this.onEdgeTextChange = this.onEdgeTextChange.bind(this);
        this.onCanvasContextMenu = this.onCanvasContextMenu.bind(this);
        this.removeLastContextedNode = this.removeLastContextedNode.bind(this);
    }

    render() {
        const state = this.state;
        const edgeAdding = state.edgeAdding;

        return (
            <div className="graph">
                <SideTools
                    oriented={this.state.oriented}
                    onOrientedChange={(oriented) => this.setState({oriented})}
                ></SideTools>
                <div className="canvas">
                    <Canvas ref={this.canvasRef}
                        nodes={state.nodes} 
                        edges={state.edges}
                        oriented={state.oriented} 
                        onNodeClick={this.onNodeClick} 
                        onNodeMove={this.moveNode} 
                        onEdgeCurve={this.onEdgeCurve} 
                        onEdgeTextChange={this.onEdgeTextChange}
                        onContextMenu={this.onCanvasContextMenu}
                        addedEdgeEndPos={
                            edgeAdding ? {x: edgeAdding.x, y: edgeAdding.y} : null
                        }
                    ></Canvas>
                </div>
                <CanvasContextMenu ref={this.canvasContextMenuRef}
                    id="canvas-contextmenu"
                    className="canvas-context" 
                    onAddNodeClick={this.onAddNodeClick.bind(this)}
                    onAddEdgeClick={this.onAddEdgeClick.bind(this)}
                    onRemoveNode={this.removeLastContextedNode}
                    onRemoveEdge={() => this.removeEdge(this.lastContextedEdgeId)}
                ></CanvasContextMenu>
            </div>
        );
    }

    onAddNodeClick(e) {
        const canvasPos = this.canvasRef.current.getCoords();
        this.addNode({
            pos: {
                x: e.clientX - canvasPos.x,
                y: e.clientY - canvasPos.y
            }
        });
    }

    onAddEdgeClick() {
        if (this.lastContextedNodeId === -1) return;
        this.addEdge(this.lastContextedNodeId, null);

        const graph = this;
        const canvasPos = this.canvasRef.current.getCoords();
        const mouseEventListener = (e) => {
            
            graph.setState((state) => {
                return Object.assign({}, state, {
                    edgeAdding: {
                        x: e.clientX - canvasPos.x,
                        y: e.clientY - canvasPos.y,
                        mouseEventListener: mouseEventListener
                    }
                })
            });
        };

        this.setState(((state: GraphState) => {
            state.edgeAdding = {
                x: state.nodes[this.lastContextedNodeId].x,
                y: state.nodes[this.lastContextedNodeId].y,
                mouseEventListener: mouseEventListener
            };
            return state;
        }).bind(this));

        document.body.addEventListener('mousemove', mouseEventListener);
    }

    private removeLastContextedNode(): void {
        const nodeId = this.lastContextedNodeId;
        if (nodeId === null) return;
        this.removeNodeEdges(nodeId);
        this.setState((state) => ({
            nodes: (() => {
                let newNodes = {...state.nodes};
                delete newNodes[nodeId];
                return newNodes;
            })()
        }));
        this.nodesCount -= 1;
    }

    public removeEdge(id: number): void {
        this.setState((state) => ({
            edges: (() => {
                let newEdges = {...state.edges};
                delete newEdges[id];
                return newEdges;
            })(),
            nodes: (() => {
                let newNodes: NodeMap = {...state.nodes};
                let startNode: NodeModel = newNodes[state.edges[id].startNodeId];
                let endNode: NodeModel = newNodes[state.edges[id].endNodeId];

                // Удаляем это ребро из его начального и конечного узла.
                const filter = edgeId => edgeId !== id;
                startNode.startEdges = startNode.startEdges.filter(filter);
                endNode.endEdges = endNode.endEdges.filter(filter);

                return newNodes;
            })()
        }))
    }

    public removeNodeEdges(nodeId: number): void {
        const remover = (edgeId) => {
            this.removeEdge(edgeId);
        };
        this.state.nodes[nodeId].startEdges.map(remover);
        this.state.nodes[nodeId].endEdges.map(remover);
    }

    onNodeClick(id) {
        // Клик на узле вне режима добавления ребра ничего не дает.
        if (this.state.edgeAdding === null) return;

        document.body.removeEventListener('mousemove', this.state.edgeAdding.mouseEventListener);

        // Если мы в процессе добавления ребра, значит сам элемент уже был добавлен.
        this.setState((function(this: Graph, state: GraphState) {
            state.nodes[id].endEdges.push(this.lastAddedEdgeId);
            state.edges[this.lastAddedEdgeId].endNodeId = id;
            state.edgeAdding = null;
            return state;
        }).bind(this));
    }

    onEdgeCurve(id, curve) {
        this.setState(function(state, props) {
            state.edges[id].curve = curve;
            return state;
        })
    }

    onEdgeTextChange(id, text) {
        this.setState(function(state, props) {
            state.edges[id].text = text;
            return state;
        });
    }

    toggleArrowEdges() {
        this.setState((state, props) => ({ oriented: !state.oriented }));
    }

    moveNode(id, cx, cy) {
        this.setState((function(state, props) {
            state.nodes[id].x = cx;
            state.nodes[id].y = cy;
            return state;
        }).bind(this));
    }

    /**
     * options.pos.x
     * options.pos.y
     */
    addNode(options) {
        this.setState((state, props) => ({
            nodes: (function (this: Graph) {
                state.nodes[this.nextNodeId] = {
                    id: this.nextNodeId,
                    text: this.nextNodeId.toString(),
                    radius: 25,
                    x: options.pos.x,
                    y: options.pos.y,
                    startEdges: [],
                    endEdges: []
                };
                this.nextNodeId += 1;
                this.nodesCount += 1;
                return state.nodes;
            }).bind(this)()
        }));
    }

    /**
     * endNodeId может быть null.
     */
    addEdge(startNodeId, endNodeId) {
        if (startNodeId === endNodeId) return;

        const newEdgeId = this.nextEdgeId++;

        this.setState((function(state, props) {
            const newEdge = {
                startNodeId: startNodeId,
                endNodeId: endNodeId,
                text: `Edge ${newEdgeId}`,
                curve: 0
            }
            
            state.edges[newEdgeId] = newEdge;
            state.nodes[startNodeId].startEdges.push(newEdgeId);
            if (endNodeId !== null) state.nodes[endNodeId].endEdges.push(newEdgeId);

            return state;
        }).bind(this));

        this.lastAddedEdgeId = newEdgeId;
        return newEdgeId;
    }

    onCanvasContextMenu(e, nodeId: number, edgeId: number): void {
        (this.contextMenuTrigger as any).handleContextClick(e);
        const contextMenu = this.canvasContextMenuRef.current
        contextMenu.enableAddEdge(this.nodesCount > 1 && nodeId !== -1)
        contextMenu.enableRemoveNode(nodeId !== -1);
        contextMenu.enableRemoveEdge(edgeId !== -1);
        this.lastContextedNodeId = nodeId;
        this.lastContextedEdgeId = edgeId;
    }
}