import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Canvas from './canvas';
import CanvasContextMenu from './canvas-context-menu';
import { ContextMenuTrigger } from 'react-contextmenu';
import { NodeMap, EdgeMap, NodeModel, Point, AbstractCanvasObject } from '../types';
import SideTools from './sidetools';
import Menu from './menu';
import * as appAPI from '../desktop';
import {
    AppState,
    SET_ORIENTED, 
    ADD_NODE,
    ADD_EDGE,
    SELECT_OBJECT,
    REMOVE_NODE,
    MOVE_NODE,
    REMOVE_EDGE,
    END_EDGE,
    CURVE_EDGE,
    SET_NODE_TEXT,
    SET_EDGE_TEXT,
    LOAD_DATA
} from '../store';

interface GraphState {
    edgeAdding: null | {
        x: number,
        y: number,
        mouseEventListener: (e: MouseEvent) => void
    }
}

interface StoreProps {
    nodes: NodeMap,
    edges: EdgeMap,
    oriented: boolean,
    nextNodeId: number,
    nextEdgeId: number,
    saveData: object,
    selectedObject?: AbstractCanvasObject
}

interface DispatchProps {
    addNode: (pos: Point) => void,
    addEdge: (startNodeId: number, endNodeId?: number) => void,
    curveEdge: (id: number, curve: number) => void,
    endEdge: (edgeId: number, endNodeId: number) => void,
    loadData: (data: object) => void,
    moveNode: (id: number, pos: Point) => void,
    setNodeText: (id: number, text: string) => void,
    setEdgeText: (id: number, text: string) => void,
    selectObject: (object?: AbstractCanvasObject) => void,
    setOriented: (oriented: boolean) => void,
    removeNode: (id: number) => void,
    removeEdge: (id: number) => void
}

class Graph extends React.Component<StoreProps & DispatchProps, GraphState>
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
            edgeAdding: null
        };

        this.onNodeClick = this.onNodeClick.bind(this);
        this.onEdgeClick = this.onEdgeClick.bind(this);
        this.moveNode = this.moveNode.bind(this);
        this.onCanvasContextMenu = this.onCanvasContextMenu.bind(this);
        this.removeLastContextedNode = this.removeLastContextedNode.bind(this);
        this.onSaveAs = this.onSaveAs.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.onEditLineKeyDown = this.onEditLineKeyDown.bind(this);
        this.onEditLineChange = this.onEditLineChange.bind(this);
    }

    render() {
        const state = this.state;
        const { edgeAdding } = state;
        const selectedObject = this.props.selectedObject;

        return (
            <div className="app">
                <Menu
                    onOpen={this.onOpen}
                    onFileSaveAs={this.onSaveAs}
                ></Menu>
                <div className="app__graph graph">
                    <SideTools
                        onOrientedChange={this.props.setOriented}
                    ></SideTools>
                    <div className="canvas graph__canvas">
                        <Canvas ref={this.canvasRef}
                            oriented={this.props.oriented}
                            nodes={this.props.nodes}
                            edges={this.props.edges}
                            onNodeClick={this.onNodeClick}
                            onEdgeClick={this.onEdgeClick}
                            onNodeMove={this.moveNode}
                            onEdgeCurve={this.props.curveEdge}
                            onContextMenu={this.onCanvasContextMenu}
                            addedEdgeEndPos={
                                edgeAdding ? { x: edgeAdding.x, y: edgeAdding.y } : null
                            }
                        ></Canvas>
                        {selectedObject && <input ref={this.editLineRef}
                            type="text" 
                            className="graph__editline"
                            value={selectedObject.type === 'node' ? 
                                this.props.nodes[selectedObject.id].text : 
                                this.props.edges[selectedObject.id].text}
                            autoFocus={true}
                            onBlur={() => this.props.selectObject(null)}
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
                        onRemoveEdge={() => this.props.removeEdge(this.lastContextedEdgeId)}
                    ></CanvasContextMenu>
                </div>
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
        this.props.addEdge(this.lastContextedNodeId, null);

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

        this.setState((state, props) => {
            let newState = {...state};
            newState.edgeAdding = {
                x: props.nodes[this.lastContextedNodeId].x,
                y: props.nodes[this.lastContextedNodeId].y,
                mouseEventListener: mouseEventListener
            };
            return newState;
        });

        document.body.addEventListener('mousemove', mouseEventListener);
    }

    private removeLastContextedNode(): void {
        const nodeId = this.lastContextedNodeId;
        if (nodeId === null) return;
        this.props.removeNode(nodeId);
    }

    onNodeClick(id: number) {
        if (this.state.edgeAdding) {
            document.body.removeEventListener('mousemove', 
                this.state.edgeAdding.mouseEventListener);

            // Если мы в процессе добавления ребра, 
            // значит сам элемент уже был добавлен.
            let lastAddedEdgeId = this.props.nextEdgeId - 1;
            this.props.endEdge(lastAddedEdgeId, id);

            this.setState((state) => {
                let newState = {...state};
                newState.edgeAdding = null;
                return newState;
            });
        } else {
            this.props.selectObject({
                type: 'node',
                id
            });
        }
    }

    onEdgeClick(id: number) {
        this.props.selectObject({
            type: 'edge',
            id
        })
    }

    onEditLineKeyDown(e: React.KeyboardEvent) {
        // Enter pressed.
        if (e.keyCode === 13) {
            this.props.selectObject(null);
            return;
        }
    }

    onEditLineChange() {
        // Edit line exists only when selectedObject exists.
        let { id, type } = this.props.selectedObject;
        let value = this.editLineRef.current.value;
        if (type === 'node') this.props.setNodeText(id, value);
        else this.props.setEdgeText(id, value);
    }

    moveNode(id, x, y) {
        this.props.moveNode(id, {x, y});
    }

    addNode(options: {pos: Point}) {
        this.props.addNode(options.pos);
    }

    onCanvasContextMenu(e, nodeId: number, edgeId: number): void {
        (this.contextMenuTrigger as any).handleContextClick(e);
        const contextMenu = this.canvasContextMenuRef.current
        contextMenu.enableAddEdge(Object.keys(this.props.nodes).length > 1 && nodeId !== -1)
        contextMenu.enableRemoveNode(nodeId !== -1);
        contextMenu.enableRemoveEdge(edgeId !== -1);
        this.lastContextedNodeId = nodeId;
        this.lastContextedEdgeId = edgeId;
    }

    public onSaveAs() {
        // If saving is cancelled, savedFile is an empty.
        const savedFile = appAPI.saveAs(JSON.stringify({
            ...this.props.saveData,
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
            const parsed = JSON.parse(contents);
            // We must be sure that the parsed object is a graph state.
            if (!this.isState(parsed)) throw 'The object is not a graph state.';
            // Further everything is ok.
            this.props.loadData(parsed);
        } catch (e) {
            console.error(e);
        }
    }

    private isState(value: object): boolean {
        return value['stateId'] === 'graphstate';
    }
}

const mapStateToProps = (state: AppState) => ({
    nodes: state.project.data.nodes,
    edges: state.project.data.edges,
    oriented: state.project.data.oriented,
    nextNodeId: state.project.data.nextNodeId,
    nextEdgeId: state.project.data.nextEdgeId,
    saveData: state.project.data,
    selectedObject: state.selectedObject
} as StoreProps)

const mapDispatchToProps = (dispatch: Dispatch, ownProps) => ({
    addNode: (pos) => dispatch({ type: ADD_NODE, pos }),
    addEdge: (startNodeId, endNodeId) => dispatch({ type: ADD_EDGE, startNodeId, endNodeId }),
    curveEdge: (id, curve) => dispatch({ type: CURVE_EDGE, id, curve }),
    endEdge: (edgeId, endNodeId) => dispatch({ type: END_EDGE, edgeId, endNodeId }),
    loadData: (data) => dispatch({ type: LOAD_DATA, data }),
    moveNode: (id, pos) => dispatch({ type: MOVE_NODE, id, pos }),
    selectObject: (object) => dispatch({ type: SELECT_OBJECT, object }),
    setNodeText: (id, text) => dispatch({ type: SET_NODE_TEXT, id, text }),
    setEdgeText: (id, text) => dispatch({ type: SET_EDGE_TEXT, id, text }),
    setOriented: (oriented) => dispatch({ type: SET_ORIENTED, oriented }),
    removeNode: (id) => dispatch({ type: REMOVE_NODE, id }),
    removeEdge: (id) => dispatch({ type: REMOVE_EDGE, id })
} as DispatchProps)

export default connect(mapStateToProps, mapDispatchToProps)(Graph);