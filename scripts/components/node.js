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