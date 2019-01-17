class Node extends React.Component {
    constructor(props) {
        super(props);
        this.id = props.id;
    }

    render() {
        return (
            <div className="graph__node">{this.props.text}</div>
        );
    }
}

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: {}
        };
        this.nextId = 1;
    }

    render() {
        const nodes = [];
        for (const id in this.state.nodes) {
            const node = this.state.nodes[id];
            nodes.push(<Node key={id} id={id} text={node.text} />);
        }

        return (
            <div className="graph">
                <div className="graph__nodes">
                    {nodes}
                </div>
                <button 
                    className="graph__button graph__button--add-node"
                    onClick={this.addNode.bind(this)}>
                    Добавить узел
                </button>
            </div>
        );
    }

    addNode() {
        this.setState((state, props) => ({
            nodes: (function() {
                state.nodes[this.nextId] = {
                    id: this.nextId,
                    text: this.nextId
                };
                this.nextId += 1;
                return state.nodes;
            }).bind(this)()
        }));
    }
}

ReactDOM.render(
    <Graph />,
    document.getElementById("graph-app")
);