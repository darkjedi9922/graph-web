class Node extends React.Component {
    constructor(props) {
        super(props);
        this.id = props.id;
    }

    render() {
        const x = this.props.x || 0;
        const y = this.props.y || 0;

        return (
            <g>
                <circle r="25" cx={x} cy={y} onMouseDown={this.props.onMouseDown}
                    onMouseUp={this.props.onMouseUp} />
                <text x={x} y={y} textAnchor="middle" alignmentBaseline="central" 
                    fill="white">{this.props.text}</text>
            </g>
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
        this.movingNode = null;
    }

    render() {
        const nodes = [];
        for (const id in this.state.nodes) {
            const node = this.state.nodes[id];
            nodes.push(<Node 
                key={id} 
                id={id} 
                text={node.text}
                onMouseDown={this.nodePressed.bind(this, node)}
                onMouseUp={this.nodeUnpressed.bind(this, node)}
                x={node.x}
                y={node.y}
            />);
        }

        return (
            <div className="graph">
                <svg className="graph__nodes">
                    {nodes}
                </svg>
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
                    text: this.nextId,
                    x: 0,
                    y: 0
                };
                this.nextId += 1;
                return state.nodes;
            }).bind(this)()
        }));
    }

    nodePressed(node, event) {
        this.movingNode = {
            id: node.id,
            startX: node.x,
            startY: node.y,
            cursorStartX: event.clientX,
            cursorStartY: event.clientY
        }

        this.movingNode.listener = (function (event) {
            // Почему-то обработчик события все еще пытается сработать иногда,
            // не смотря на то, что он уже как-бы удален...
            if (this.movingNode === null) return;

            this.setState((state, props) => ({
                nodes: (function () {
                    const node = state.nodes[this.movingNode.id];
                    const diffX = event.clientX - this.movingNode.cursorStartX;
                    const diffY = event.clientY - this.movingNode.cursorStartY;
                    node.x = this.movingNode.startX + diffX;
                    node.y = this.movingNode.startY + diffY;
                    return state.nodes;
                }).bind(this)()
            }));
        }).bind(this);

        document.body.addEventListener("mousemove", this.movingNode.listener);
    }

    nodeUnpressed(node, event) {
        document.body.removeEventListener('mousemove', this.movingNode.listener);
        this.movingNode = null;
    }
}

ReactDOM.render(
    <Graph />,
    document.getElementById("graph-app")
);