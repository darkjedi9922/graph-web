import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Canvas from './canvas';
import CanvasContextMenu from './canvas-context-menu';
import { ContextMenuTrigger } from 'react-contextmenu';
import { NodeMap, EdgeMap, NodeModel } from '../types';
import SideTools from './sidetools';
import Menu from './menu';
import * as appAPI from '../desktop';
import { SET_ORIENTED } from '../store';

interface CanvasData {
    nodes: NodeMap,
    edges: EdgeMap,
    oriented: boolean,
    nextNodeId: number,
    nextEdgeId: number
}

interface GraphState {
    project: {
        file?: string,
        data: CanvasData // this is what will be saved in the project file.
    },
    edgeAdding: null | {
        x: number,
        y: number,
        mouseEventListener: (e: MouseEvent) => void
    },
    lastAddedEdgeId: number,
    selectedObject: { type: 'node' | 'edge', id: number }
}

interface DispatchProps {
    setOriented: (oriented: boolean) => void
}

class Graph extends React.Component<DispatchProps, GraphState>
{
    private lastContextedNodeId: number = -1;
    private lastContextedEdgeId: number = -1;
    private canvasRef = React.createRef<Canvas>();
    private canvasContextMenuRef = React.createRef<CanvasContextMenu>();
    private editLineRef = React.createRef<HTMLInputElement>();

    // Элемент триггера для открытия контекстного меню вручную через него.
    private contextMenuTrigger = new ContextMenuTrigger({
        id: 'canvas-contextmenu'
    });

    constructor(props) {
        super(props);
        this.state = {
            project: {
                file: null,
                data: {
                    nodes: {},
                    edges: {},
                    oriented: false,
                    nextNodeId: 1,
                    nextEdgeId: 1,
                }
            },
            edgeAdding: null,
            lastAddedEdgeId: null,
            selectedObject: null
        };

        this.setOriented = this.setOriented.bind(this);
        this.onNodeClick = this.onNodeClick.bind(this);
        this.onEdgeClick = this.onEdgeClick.bind(this);
        this.moveNode = this.moveNode.bind(this);
        this.setNodeText = this.setNodeText.bind(this);
        this.onEdgeCurve = this.onEdgeCurve.bind(this);
        this.onEdgeTextChange = this.onEdgeTextChange.bind(this);
        this.onCanvasContextMenu = this.onCanvasContextMenu.bind(this);
        this.removeLastContextedNode = this.removeLastContextedNode.bind(this);
        this.onSaveAs = this.onSaveAs.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.onEditLineKeyDown = this.onEditLineKeyDown.bind(this);
        this.onEditLineChange = this.onEditLineChange.bind(this);
    }

    render() {
        const state = this.state;
        const { edgeAdding, selectedObject } = state;
        const { nodes, edges, oriented } = state.project.data;

        return (
            <div className="app">
                <Menu
                    onOpen={this.onOpen}
                    onFileSaveAs={this.onSaveAs}
                ></Menu>
                <div className="app__graph graph">
                    <SideTools
                        onOrientedChange={this.setOriented}
                    ></SideTools>
                    <div className="canvas graph__canvas">
                        <Canvas ref={this.canvasRef}
                            nodes={nodes}
                            edges={edges}
                            oriented={oriented}
                            onNodeClick={this.onNodeClick}
                            onEdgeClick={this.onEdgeClick}
                            onNodeMove={this.moveNode}
                            onNodeTextChange={this.setNodeText}
                            onEdgeCurve={this.onEdgeCurve}
                            onEdgeTextChange={this.onEdgeTextChange}
                            onContextMenu={this.onCanvasContextMenu}
                            addedEdgeEndPos={
                                edgeAdding ? { x: edgeAdding.x, y: edgeAdding.y } : null
                            }
                        ></Canvas>
                        {selectedObject && <input ref={this.editLineRef}
                            type="text" 
                            className="graph__editline"
                            value={selectedObject.type === 'node' ? 
                                nodes[selectedObject.id].text : 
                                edges[selectedObject.id].text}
                            autoFocus={true}
                            onBlur={() => this.setState({selectedObject: null})}
                            onKeyDown={this.onEditLineKeyDown}
                            onChange={this.onEditLineChange}
                        />}
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
            </div>
        );
    }

    setOriented(oriented: boolean) {
        this.setState((state) => ({
            project: {
                ...state.project,
                data: {
                    ...state.project.data,
                    oriented
                }
            }
        }));

        this.props.setOriented(oriented);
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
                x: state.project.data.nodes[this.lastContextedNodeId].x,
                y: state.project.data.nodes[this.lastContextedNodeId].y,
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
            project: {
                ...state.project,
                data: {
                    ...state.project.data,
                    nodes: (() => {
                        let newNodes = { ...state.project.data.nodes };
                        delete newNodes[nodeId];
                        return newNodes;
                    })()
                }
            }
        }));
    }

    public removeEdge(id: number): void {
        this.setState((state) => ({
            project: {
                ...state.project,
                data: {
                    ...state.project.data,
                    edges: (() => {
                        let newEdges = { ...state.project.data.edges };
                        delete newEdges[id];
                        return newEdges;
                    })(),
                    nodes: (() => {
                        let newNodes: NodeMap = { ...state.project.data.nodes };
                        let startNode: NodeModel = newNodes[state.project.data.edges[id].startNodeId];
                        let endNode: NodeModel = newNodes[state.project.data.edges[id].endNodeId];

                        // Удаляем это ребро из его начального и конечного узла.
                        const filter = edgeId => edgeId !== id;
                        startNode.startEdges = startNode.startEdges.filter(filter);
                        endNode.endEdges = endNode.endEdges.filter(filter);

                        return newNodes;
                    })()
                }
            }
        }))
    }

    public removeNodeEdges(nodeId: number): void {
        const remover = (edgeId) => {
            this.removeEdge(edgeId);
        };
        this.state.project.data.nodes[nodeId].startEdges.map(remover);
        this.state.project.data.nodes[nodeId].endEdges.map(remover);
    }

    onNodeClick(id: number) {
        if (this.state.edgeAdding) {
            document.body.removeEventListener('mousemove', this.state.edgeAdding.mouseEventListener);
            // Если мы в процессе добавления ребра, значит сам элемент уже был добавлен.
            this.setState((function(this: Graph, state: GraphState) {
                state.project.data.nodes[id].endEdges.push(state.lastAddedEdgeId);
                state.project.data.edges[state.lastAddedEdgeId].endNodeId = id;
                state.edgeAdding = null;
                return state;
            }).bind(this));
        } else {
            this.setState({
                selectedObject: {
                    type: 'node',
                    id: id
                }
            });
        }
    }

    onEdgeClick(id: number) {
        this.setState({
            selectedObject: {
                type: 'edge',
                id: id
            }
        });
    }

    setNodeText(id: number, text: string): void {
        this.setState((state) => {
            let newState = {...state}
            newState.project.data.nodes[id].text = text;
            return newState;
        });
    }

    onEdgeCurve(id, curve) {
        this.setState(function(state, props) {
            state.project.data.edges[id].curve = curve;
            return state;
        })
    }

    onEdgeTextChange(id, text) {
        this.setState(function(state, props) {
            state.project.data.edges[id].text = text;
            return state;
        });
    }

    onEditLineKeyDown(e: React.KeyboardEvent) {
        // Enter pressed.
        if (e.keyCode === 13) {
            this.setState({ selectedObject: null });
            return;
        }
    }

    onEditLineChange() {
        // Edit line exist only when selectedObject exists.
        this.setState((state) => {
            let newState = { ...state };
            if (state.selectedObject.type === 'node') {
                newState.project.data.nodes[state.selectedObject.id].text =
                    this.editLineRef.current.value;
            } else {
                newState.project.data.edges[state.selectedObject.id].text =
                    this.editLineRef.current.value;
            }
            return newState;
        });
    }

    moveNode(id, cx, cy) {
        this.setState((function(state, props) {
            state.project.data.nodes[id].x = cx;
            state.project.data.nodes[id].y = cy;
            return state;
        }).bind(this));
    }

    /**
     * options.pos.x
     * options.pos.y
     */
    addNode(options) {
        this.setState((state) => ({
            project: {
                ...state.project,
                data: {
                    ...state.project.data,
                    nodes: (function (this: Graph) {
                        state.project.data.nodes[state.project.data.nextNodeId] = {
                            id: state.project.data.nextNodeId,
                            text: state.project.data.nextNodeId.toString(),
                            radius: 25,
                            x: options.pos.x,
                            y: options.pos.y,
                            startEdges: [],
                            endEdges: []
                        };
                        return state.project.data.nodes;
                    }).bind(this)(),
                    nextNodeId: state.project.data.nextNodeId + 1
                }
            }
        }));
    }

    /**
     * endNodeId может быть null.
     */
    addEdge(startNodeId, endNodeId) {
        if (startNodeId === endNodeId) return;

        this.setState((function(state: GraphState) {
            const newEdgeId = state.project.data.nextEdgeId;
            const newEdge = {
                startNodeId: startNodeId,
                endNodeId: endNodeId,
                text: `Edge ${newEdgeId}`,
                curve: 0
            }
            
            state.project.data.edges[newEdgeId] = newEdge;
            state.project.data.nodes[startNodeId].startEdges.push(newEdgeId);
            if (endNodeId !== null) state.project.data.nodes[endNodeId].endEdges.push(newEdgeId);

            state.project.data.nextEdgeId += 1;
            state.lastAddedEdgeId = newEdgeId;

            return state;
        }).bind(this));
    }

    onCanvasContextMenu(e, nodeId: number, edgeId: number): void {
        (this.contextMenuTrigger as any).handleContextClick(e);
        const contextMenu = this.canvasContextMenuRef.current
        contextMenu.enableAddEdge(Object.keys(this.state.project.data.nodes).length > 1 && nodeId !== -1)
        contextMenu.enableRemoveNode(nodeId !== -1);
        contextMenu.enableRemoveEdge(edgeId !== -1);
        this.lastContextedNodeId = nodeId;
        this.lastContextedEdgeId = edgeId;
    }

    public onSaveAs() {
        // If saving is cancelled, savedFile is an empty.
        const savedFile = appAPI.saveAs(JSON.stringify({
            ...this.state.project.data,
            // Добавим идентификатор нашего формата, чтобы проверять его при открытии
            // файла (вдруг нам подсунули не то).
            stateId: 'graphstate'
        }));
    }

    public onOpen() {
        const contents = appAPI.open();
        
        // If opening is cancelled, contents is an empty. 
        if (!contents) return;
        
        // Мог быть выбран файл неправильного формата.
        try {
            // Parse can throw an error.
            const parsed = JSON.parse(contents) as CanvasData;
            // We must be sure that the parsed object is a graph state.
            if (!this.isState(parsed)) throw 'The object is not a graph state.';
            // Further everything is ok.
            this.setState((state) => ({
                project: {
                    ...state.project,
                    data: parsed
                }
            }));
        } catch (e) {
            console.error(e);
        }
    }

    private isState(value: object): boolean {
        return value['stateId'] === 'graphstate';
    }
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps) => ({
    setOriented: (oriented: boolean) => dispatch({
        type: SET_ORIENTED,
        oriented
    })
})

export default connect(null, mapDispatchToProps)(Graph);