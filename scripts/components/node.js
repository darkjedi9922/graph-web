class Node extends React.Component {
    constructor(props) {
        super(props);
        this.id = props.id;
        this.state = {
            text: props.text,
            editing: false
        }
    }

    render() {
        // 25 - радиус, чтобы узлы появлялись в левом верхнем углу, но не были
        // частично за границей svg из-за координат центра (0, 0).
        const radius = 25;
        const centerX = this.props.x || radius;
        const centerY = this.props.y || radius;

        return (
            <g>
                <circle r={radius} cx={centerX} cy={centerY} 
                    onMouseDown={this.props.onMouseDown}
                    onMouseUp={this.props.onMouseUp}
                    onDoubleClick={this.onDoubleClick.bind(this)} />
                {!this.state.editing &&
                    <text x={centerX} y={centerY} fill="white"
                        textAnchor="middle" 
                        alignmentBaseline="central"  
                        onDoubleClick={this.onDoubleClick.bind(this)}
                        onMouseDown={this.props.onMouseDown}
                        onMouseUp={this.props.onMouseUp} 
                        className="graph__node-text">
                        {this.state.text}
                    </text>
                }
                {this.state.editing &&
                    <foreignObject x={centerX - radius} y={centerY - radius} 
                        width={2*radius} height={2*radius}>
                        <input type="text" defaultValue={this.state.text} 
                            style={{
                                background: "transparent",
                                color: "white",
                                width: 2*radius,
                                height: 2*radius,
                                border: "none",
                                textAlign: "center",
                                outline: "none"
                            }} 
                            onBlur={this.textOnChange.bind(this)}
                            onKeyDown={this.textOnKey.bind(this)} 
                            ref={(input) => { this.editInput = input; }}/>
                    </foreignObject>
                }
            </g>
        );
    }

    onDoubleClick() {
        this.setState({editing: true}, () => {
            this.editInput.focus();
        });
    }

    textOnChange(event) {
        this.setState({
            text: event.target.value,
            editing: false
        });
    }

    textOnKey(event) {
        if (event.keyCode === 13) this.textOnChange(event);
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
                    // 25 - радиус, чтобы узлы появлялись в левом верхнем углу, но 
                    // не были частично за границей svg из-за координат центра (0, 0).
                    x: 25,
                    y: 25
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