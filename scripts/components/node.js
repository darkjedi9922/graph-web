class Node extends React.Component {
    constructor(props) {
        super(props);
        this.id = props.id;
        this.moving = null;
        this.state = {
            text: props.text,
            editing: false
        }
    }

    render() {
        const radius = this.props.radius || 25;
        const centerX = this.props.cx || radius;
        const centerY = this.props.cy || radius;

        return (
            <g>
                <circle r={radius} cx={centerX} cy={centerY} 
                    onMouseDown={this.onMouseDown.bind(this)}
                    onMouseUp={this.onMouseUp.bind(this)}
                    onClick={this.props.onClick}
                    onDoubleClick={this.onDoubleClick.bind(this)} />
                {!this.state.editing &&
                    <text x={centerX} y={centerY} fill="white"
                        textAnchor="middle" 
                        alignmentBaseline="central"
                        onClick={this.props.onClick}  
                        onDoubleClick={this.onDoubleClick.bind(this)}
                        onMouseDown={this.onMouseDown.bind(this)}
                        onMouseUp={this.onMouseUp.bind(this)} 
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

    onMouseDown(event) {
        // Мы будем говорить о "желании" переместиться через коллбек. Если коллбека
        // нет, то и пытаться понять куда мы хотим перемещаться бессмысленно. 
        if (!this.props.onMove) return;
        
        this.moving = {
            startX: this.props.cx,
            startY: this.props.cy,
            cursorStartX: event.clientX,
            cursorStartY: event.clientY,
            listener: (function (e) {
                // Почему-то обработчик события все еще пытается сработать иногда,
                // не смотря на то, что он уже как-бы удален...
                if (this.moving === null) return;

                const diffX = e.clientX - this.moving.cursorStartX;
                const diffY = e.clientY - this.moving.cursorStartY;
                const newCX = this.moving.startX + diffX;
                const newCY = this.moving.startY + diffY;
                this.props.onMove(newCX, newCY);
            }).bind(this)
        }

        document.body.addEventListener("mousemove", this.moving.listener);
    }

    onMouseUp() {
        if (!this.moving) return;
        document.body.removeEventListener('mousemove', this.moving.listener);
        this.moving = null;
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