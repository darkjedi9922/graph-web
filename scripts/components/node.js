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
        this.movingNode = {
            id: null,
            startX: null,
            startY: null,
            cursorStartX: null,
            cursorStartY: null,
            listener: null
        };
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
        this.movingNode.id = node.id;
        this.movingNode.startX = node.x;
        this.movingNode.startY = node.y;
        this.movingNode.cursorStartX = event.screenX;
        this.movingNode.cursorStartY = event.screenY;

        this.movingNode.listener = (function (event) {
            // Почему-то обработчик события все еще пытается сработать иногда,
            // не смотря на то, что он уже как-бы удален...
            if (this.movingNode.id === null) return;

            this.setState((state, props) => ({
                nodes: (function () {
                    const node = state.nodes[this.movingNode.id];
                    const diffX = event.screenX - this.movingNode.cursorStartX;
                    const diffY = event.screenY - this.movingNode.cursorStartY;
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
        this.movingNode.id = null;
        this.movingNode.startX = null;
        this.movingNode.startY = null;
        this.movingNode.cursorStartX = null;
        this.movingNode.cursorStartY = null;
        this.movingNode.listener = null;
    }
}

ReactDOM.render(
    <Graph />,
    document.getElementById("graph-app")
);