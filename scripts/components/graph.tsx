import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Canvas from './canvas';
import CanvasContextMenu from './canvas-context-menu';
import { ContextMenuTrigger } from 'react-contextmenu';
import { NodeMap, EdgeMap, Point, AbstractCanvasObject } from '../types';
import SideTools from './sidetools';
import Menu from './menu';
import {
    AppState,
    ADD_NODE,
    ADD_EDGE,
    SELECT_OBJECT,
    REMOVE_NODE,
    REMOVE_EDGE,
    END_EDGE,
    SET_NODE_TEXT,
    SET_EDGE_TEXT,
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
    nextEdgeId: number,
    selectedObject?: AbstractCanvasObject
}

interface DispatchProps {
    addNode: (pos: Point) => void,
    addEdge: (startNodeId: number, endNodeId?: number) => void,
    endEdge: (edgeId: number, endNodeId: number) => void,
    setNodeText: (id: number, text: string) => void,
    setEdgeText: (id: number, text: string) => void,
    selectObject: (object?: AbstractCanvasObject) => void,
    removeNode: (id: number) => void,
    removeEdge: (id: number) => void
}

class Graph extends React.Component<StoreProps & DispatchProps, GraphState>
{
    private lastContextedNodeId: number = -1;
    private lastContextedEdgeId: number = -1;
    private canvasRef = React.createRef<typeof Canvas.WrappedComponent.prototype>();
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
        this.onCanvasContextMenu = this.onCanvasContextMenu.bind(this);
        this.removeLastContextedNode = this.removeLastContextedNode.bind(this);
        this.onEditLineKeyDown = this.onEditLineKeyDown.bind(this);
        this.onEditLineChange = this.onEditLineChange.bind(this);
    }

    render() {
        const state = this.state;
        const { edgeAdding } = state;
        const selectedObject = this.props.selectedObject;

        return (
            <div className="app">
                <Menu/>
                <div className="app__graph graph">
                    <SideTools/>
                    <div className="canvas graph__canvas">
                        <Canvas ref={this.canvasRef}
                            onNodeClick={this.onNodeClick}
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

        const canvasPos = this.canvasRef.current.getCoords();
        const mouseEventListener = (e) => {
            this.setState({
                edgeAdding: {
                    x: e.clientX - canvasPos.x,
                    y: e.clientY - canvasPos.y,
                    mouseEventListener: mouseEventListener
                }
            });
        };

        this.setState((state, props) => ({
            edgeAdding: {
                x: props.nodes[this.lastContextedNodeId].x,
                y: props.nodes[this.lastContextedNodeId].y,
                mouseEventListener: mouseEventListener
            }
        }));

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
            this.setState({ edgeAdding: null });
        } else {
            this.props.selectObject({ type: 'node', id });
        }
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
}

const mapStateToProps = (state: AppState) => ({
    nodes: state.project.data.nodes,
    edges: state.project.data.edges,
    nextEdgeId: state.project.data.nextEdgeId,
    selectedObject: state.selectedObject
} as StoreProps)

const mapDispatchToProps = (dispatch: Dispatch, ownProps) => ({
    addNode: (pos) => dispatch({ type: ADD_NODE, pos }),
    addEdge: (startNodeId, endNodeId) => dispatch({ type: ADD_EDGE, startNodeId, endNodeId }),
    endEdge: (edgeId, endNodeId) => dispatch({ type: END_EDGE, edgeId, endNodeId }),
    selectObject: (object) => dispatch({ type: SELECT_OBJECT, object }),
    setNodeText: (id, text) => dispatch({ type: SET_NODE_TEXT, id, text }),
    setEdgeText: (id, text) => dispatch({ type: SET_EDGE_TEXT, id, text }),
    removeNode: (id) => dispatch({ type: REMOVE_NODE, id }),
    removeEdge: (id) => dispatch({ type: REMOVE_EDGE, id })
} as DispatchProps)

export default connect(mapStateToProps, mapDispatchToProps)(Graph);