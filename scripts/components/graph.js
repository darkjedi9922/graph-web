class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: {},
            edges: {}
        };
        this.nextNodeId = 1;
        this.nextEdgeId = 1;
    }

    render() {
        const nodes = [];
        for (const id in this.state.nodes) {
            const node = this.state.nodes[id];
            nodes.push(<Node key={id} id={id} text={node.text} radius={node.radius}
                cx={node.x} cy={node.y} onMove={this.moveNode.bind(this, id)} />);
        }

        const edges = [];
        for (const id in this.state.edges) {
            const edge = this.state.edges[id];
            const startNode = this.state.nodes[edge.startNodeId];
            const endNode = this.state.nodes[edge.endNodeId];
            const start = { x: startNode.x, y: startNode.y }
            const end = { x: endNode.x, y: endNode.y }
            edges.push(<Edge key={id} start={start} end={end} />);
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
                <button onClick={this.addEdge.bind(this)}>Добавить ребро</button>
            </div>
        );
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

    addEdge() {
        this.setState((function(state, props) {
            const startNodeId = 1;
            const endNodeId = 2;

            const newEdge = {
                startNodeId: startNodeId,
                endNodeId: endNodeId
            }
            
            const newEdgeId = this.nextEdgeId++;
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