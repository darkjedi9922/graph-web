class EditableSvgText extends React.Component {
    /**
     * props.rect is {x, y, width, height}
     * props.text is the text
     */
    constructor(props) {
        super(props);
        this.state = { editing: false };

        this.inputRef = React.createRef();

        this.startEditing = this.startEditing.bind(this);
        this.stopEditing = this.stopEditing.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    render() {
        const rect = this.props.rect;
        const text = this.props.text;

        return (<>
            {!this.state.editing ? 
                <text x={rect.x + rect.width / 2} y={rect.y + rect.height / 2} 
                    fill="black" style={{ userSelect: "none"}}
                    textAnchor="middle" alignmentBaseline="central"
                    onMouseDown={this.props.onMouseDown}
                    onDoubleClick={this.startEditing} >
                    {text}
                </text>
                :
                <foreignObject x={rect.x} y={rect.y}
                    onMouseDown={this.props.onMouseDown}
                    width={rect.width} height={rect.height}>
                    <input defaultValue={text} ref={this.inputRef} style={{
                        background: "transparent",
                        border: "none",
                        textAlign: "center",
                        height: "100%",
                        width: "100%",
                        outline: "none",
                    }} onDoubleClick={this.startEditing} onBlur={this.stopEditing}
                    onKeyDown={this.onKeyDown} />
                </foreignObject>
            }
        </>);
    }

    startEditing() {
        this.setState({ editing: true }, () => { this.inputRef.current.focus() });
    }

    stopEditing() {
        const newValue = this.inputRef.current.value;
        this.props.onTextChange && this.props.onTextChange(newValue);
        this.setState({ editing: false });
    }

    onKeyDown(e) {
        if (e.keyCode === 13) this.stopEditing();
    }
}