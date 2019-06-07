const React = require('react');
const Node = require('./node');
const Edge = require('./edge');

const ContextMenu = require('react-contextmenu').ContextMenu;
const ContextMenuTrigger = require('react-contextmenu').ContextMenuTrigger;
const ContextMenuItem = require('react-contextmenu').MenuItem;

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: {},
            edges: {},
            oriented: false
        };
        this.nextNodeId = 1;
        this.nextEdgeId = 1;
        this.edgeAdding = null;
        
        this.canvasWrapperRef = React.createRef();
    }

    render() {
        const nodes = [];
        for (const id in this.state.nodes) {
            const node = this.state.nodes[id];
            nodes.push(<Node key={id} id={id} text={node.text} 
                radius={node.radius}
                cx={node.x} cy={node.y}
                className='graph__node' 
                onMove={this.moveNode.bind(this, id)}
                onClick={this.onNodeClick.bind(this, id)} />);
        }

        const edges = [];
        for (const id in this.state.edges) {
            const edge = this.state.edges[id];
            const startNode = this.state.nodes[edge.startNodeId];
            const endNode = this.state.nodes[edge.endNodeId];
            const start = { x: startNode.x, y: startNode.y }
            const end = { x: endNode.x, y: endNode.y }
            edges.push(<Edge key={id} start={start} end={end} 
                arrow={this.state.oriented} curve={edge.curve} text={edge.text}
                onCurve={this.onEdgeCurve.bind(this, id)}
                onTextChange={this.onEdgeTextChange.bind(this, id)} />);
        }

        return (
            <div className="graph">
                <ContextMenuTrigger id="canvas-contextmenu" ref={this.canvasWrapperRef} attributes={{
                    className: "graph__nodes-wrapper"
                }}>
                    <svg className="graph__nodes">
                        {edges}
                        {nodes}
                    </svg>
                </ContextMenuTrigger>
                <ContextMenu id="canvas-contextmenu" className="canvas-context">
                    <ContextMenuItem onClick={this.handleAddNodeClick.bind(this)} attributes={{
                        className: 'canvas-context__button'
                    }}>Добавить узел</ContextMenuItem>
                    <ContextMenuItem disabled attributes={{
                        className: 'canvas-context__button'
                    }}>Добавить ребро</ContextMenuItem>
                </ContextMenu>
                <div className="graph__buttons">
                    <button onClick={this.onAddEdgeClick.bind(this)}>
                        Добавить ребро
                    </button>
                    <span> Граф: </span>
                    <button onClick={this.toggleArrowEdges.bind(this)}>
                        {this.state.oriented ? "Ориентированный" : "Неориентированный"}
                    </button>
                </div>
            </div>
        );
    }

    handleAddNodeClick(e) {
        let wrapperElem = this.canvasWrapperRef.current.elem;
        this.addNode({
            pos: {
                x: e.clientX - wrapperElem.offsetLeft,
                y: e.clientY - wrapperElem.offsetTop
            }
        });
    }

    onAddEdgeClick() {
        // Включаем состояние добавление ребра, и при клике на первый узел, он будет
        // записан как стартовый узел добавляемого ребра.
        this.edgeAdding = {
            startNodeId: null,
        }
    }

    onNodeClick(id) {
        // Клик на узле вне режима добавления ребра ничего не дает.
        if (this.edgeAdding === null) return;

        if (this.edgeAdding.startNodeId === null) {
            // Это первый узел, на который нажимаем в режиме добавления ребра (старт 
            // еще не определен).
            this.edgeAdding.startNodeId = id;
        } else {
            // Это второй узел - конец ребра. Дополнительных данных о добавлении
            // ребра сохранять не нужно - просто добавлем ребро.
            this.addEdge(this.edgeAdding.startNodeId, id);

            // Ребро добавлено - выключаем режим добавления ребра.
            this.edgeAdding = null;
        }
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
                return state.nodes;
            }).bind(this)()
        }));
    }

    addEdge(startNodeId, endNodeId) {
        if (startNodeId === endNodeId) return;

        this.setState((function(state, props) {
            const newEdgeId = this.nextEdgeId++;
            const newEdge = {
                startNodeId: startNodeId,
                endNodeId: endNodeId,
                text: `Edge ${newEdgeId}`,
                curve: 0
            }
            
            state.edges[newEdgeId] = newEdge;
            state.nodes[startNodeId].startEdges.push(newEdgeId);
            state.nodes[endNodeId].endEdges.push(newEdgeId);

            return state;
        }).bind(this));
    }
}

module.exports = Graph;