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
    }

    render() {
        const nodes = [];
        for (const id in this.state.nodes) {
            const node = this.state.nodes[id];
            nodes.push(<Node key={id} id={id} text={node.text} radius={node.radius}
                cx={node.x} cy={node.y} onMove={this.moveNode.bind(this, id)}
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
                onCurve={this.onEdgeCurve.bind(this, id)} />);
        }

        return (
            <div className="graph">
                <svg className="graph__nodes">
                    {edges}
                    {nodes}
                </svg>
                <button className="graph__button graph__button--add-node"
                    onClick={this.addNode.bind(this)}>
                    Добавить узел
                </button>
                <button onClick={this.onAddEdgeClick.bind(this)}>
                    Добавить ребро
                </button>
                <span> Граф: </span>
                <button onClick={this.toggleArrowEdges.bind(this)}>
                    {this.state.oriented ? "Ориентированный" : "Неориентированный"}
                </button>
            </div>
        );
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

    addNode() {
        this.setState((state, props) => ({
            nodes: (function () {
                state.nodes[this.nextNodeId] = {
                    id: this.nextNodeId,
                    text: this.nextNodeId,
                    radius: 25,
                    x: 25,
                    y: 25,
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
                text: `Edge ${newEdgeId} text`,
                curve: 0
            }
            
            state.edges[newEdgeId] = newEdge;
            state.nodes[startNodeId].startEdges.push(newEdgeId);
            state.nodes[endNodeId].endEdges.push(newEdgeId);

            return state;
        }).bind(this));
    }
}

ReactDOM.render(
    <Graph />,
    document.getElementById("graph-app")
);