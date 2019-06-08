const React = require('react');
const Canvas = require('./canvas');

const ContextMenu = require('react-contextmenu').ContextMenu;
const ContextMenuTrigger = require('react-contextmenu').ContextMenuTrigger;
const ContextMenuItem = require('react-contextmenu').MenuItem;

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: {},
            edges: {},
            oriented: false,
            contextMenu: {
                addEdge: false
            },
            edgeAdding: null
        };
        this.nodesCount = 0;
        this.nextNodeId = 1;
        this.nextEdgeId = 1;
        this.lastAddedEdgeId = null;
        this.lastContextedMenuNodeId = null;
        
        this.canvasWrapperRef = React.createRef();

        this.onNodeClick = this.onNodeClick.bind(this);
        this.moveNode = this.moveNode.bind(this);
        this.onEdgeCurve = this.onEdgeCurve.bind(this);
        this.onEdgeTextChange = this.onEdgeTextChange.bind(this);
    }

    render() {
        const edgeAdding = this.state.edgeAdding;
        const addEdgeEnabled = this.state.contextMenu.addEdge;

        return (
            <div className="graph">
                <ContextMenuTrigger id="canvas-contextmenu" ref={this.canvasWrapperRef} attributes={{
                    className: "graph__nodes-wrapper"
                }}>
                    <Canvas nodes={this.state.nodes} edges={this.state.edges}
                        oriented={this.state.oriented} onNodeClick={this.onNodeClick} 
                        onNodeMove={this.moveNode} onEdgeCurve={this.onEdgeCurve} 
                        onEdgeTextChange={this.onEdgeTextChange}
                        addedEdgeEndPos={
                            edgeAdding ? {x: edgeAdding.x, y: edgeAdding.y} : null
                        }
                    ></Canvas>
                </ContextMenuTrigger>
                <ContextMenu id="canvas-contextmenu" className="canvas-context" onShow={this.onContextMenuShow.bind(this)}>
                    <ContextMenuItem onClick={this.onAddNodeClick.bind(this)} attributes={{
                        className: 'canvas-context__button'
                    }}>Добавить узел</ContextMenuItem>
                    <ContextMenuItem onClick={this.onAddEdgeClick.bind(this)} disabled={!addEdgeEnabled} attributes={{
                        className: 'canvas-context__button'
                    }}>Добавить ребро</ContextMenuItem>
                </ContextMenu>
                <div className="graph__buttons">
                    <span> Граф: </span>
                    <button onClick={this.toggleArrowEdges.bind(this)}>
                        {this.state.oriented ? "Ориентированный" : "Неориентированный"}
                    </button>
                </div>
            </div>
        );
    }

    onAddNodeClick(e) {
        let wrapperElem = this.canvasWrapperRef.current.elem;
        this.addNode({
            pos: {
                x: e.clientX - wrapperElem.offsetLeft,
                y: e.clientY - wrapperElem.offsetTop
            }
        });
    }

    onAddEdgeClick() {
        if (this.lastContextedMenuNodeId === null) return;
        this.addEdge(this.lastContextedMenuNodeId, null);

        const graph = this;
        const wrapperElem = this.canvasWrapperRef.current.elem;
        const mouseEventListener = (e) => {
            
            // Этот mouse event listener почему-то продолжает работать после
            // удаления... Поэтому поставим сюда отдельный if.
            if (!graph.state.edgeAdding) return;

            graph.setState((state) => {
                state.edgeAdding = {
                    x: e.clientX - wrapperElem.offsetLeft,
                    y: e.clientY - wrapperElem.offsetTop
                };
                return state;
            });
        };

        this.setState(((state) => {
            state.edgeAdding = {
                x: state.nodes[this.lastContextedMenuNodeId].x,
                y: state.nodes[this.lastContextedMenuNodeId].y,
                mouseEventListener: mouseEventListener
            };
            return state;
        }).bind(this));

        document.body.addEventListener('mousemove', mouseEventListener);
    }

    onNodeClick(id) {
        // Клик на узле вне режима добавления ребра ничего не дает.
        if (this.state.edgeAdding === null) return;

        document.body.removeEventListener('mousemove', this.state.edgeAdding.mouseEventListener);

        // Если мы в процессе добавления ребра, значит сам элемент уже был добавлен.
        this.setState((function(state) {
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
            nodes: (function () {
                state.nodes[this.nextNodeId] = {
                    id: this.nextNodeId,
                    text: this.nextNodeId,
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

    onContextMenuShow(e) {
        const canvasPos = this._getCanvasPositionByContextMenuEvent(e);
        const nodeId = this._findNodeByCanvasPosition(canvasPos);
        addEdgeEnabled = nodeId !== null;

        this.setState({
            contextMenu: {
                addEdge: addEdgeEnabled
            }
        });

        this.lastContextedMenuNodeId = nodeId;
    }

    _getCanvasPositionByContextMenuEvent(event) {
        let wrapperElem = this.canvasWrapperRef.current.elem;
        return {
            x: event.detail.position.x - wrapperElem.offsetLeft,
            y: event.detail.position.y - wrapperElem.offsetTop
        };
    }

    _findNodeByCanvasPosition({x, y}) {
        for (const id in this.state.nodes) {
            if (this.state.nodes.hasOwnProperty(id)) {
                const node = this.state.nodes[id];
                if (x >= node.x - node.radius && x <= node.x + node.radius &&
                    y >= node.y - node.radius && y <= node.y + node.radius) 
                    return id;
            }
        }
        return null;
    }
}

module.exports = Graph;