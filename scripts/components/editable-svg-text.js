class EditableSvgText extends React.Component {
    /**
     * props.rect is {x, y, width, height}
     * props.text is the text
     * props.edit is bool mode
     * props.onWillWillEdit callback
     * props.onDidEdit callback
     */
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();

        this.startEditing = this.startEditing.bind(this);
        this.stopEditing = this.stopEditing.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    componentDidUpdate() {
        this.props.edit && this.inputRef.current.focus();
    }

    render() {
        const rect = this.props.rect;
        const text = this.props.text;

        return (<>
            {!this.props.edit ? 
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
        this.props.onWillEdit && this.props.onWillEdit();
    }

    stopEditing() {
        const newValue = this.inputRef.current.value;
        this.props.onDidEdit && this.props.onDidEdit(newValue);
    }

    onKeyDown(e) {
        if (e.keyCode === 13) this.stopEditing();
    }
}