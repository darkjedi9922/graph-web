class EditableSvgText extends React.Component {
    /**
     * props: {
     *  rect is {x, y, width, height},
     *  text is the text,
     *  edit is bool mode,
     *  style is styles to text (both svg and html styles in one object),
     *  className,
     *  transform svg transform,
     *  onWillEdit callback,
     *  onDidEdit (text) => {} callback,
     *  onClick callback,
     *  onMouseDown callback,
     *  onMouseUp callback
     * }
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
                    className={this.props.className} 
                    style={Object.assign({ userSelect: "none"}, this.props.style)}
                    textAnchor="middle" alignmentBaseline="central"
                    transform={this.props.transform}
                    onDoubleClick={this.startEditing}
                    onMouseDown={this.props.onMouseDown}
                    onMouseUp={this.props.onMouseUp} 
                    onClick={this.props.onClick}
                >
                    {text}
                </text>
                :
                <foreignObject x={rect.x} y={rect.y}
                    width={rect.width} height={rect.height}>
                    <input defaultValue={text} ref={this.inputRef} 
                    className={this.props.className}
                    style={Object.assign({
                        background: "transparent",
                        border: "none",
                        textAlign: "center",
                        height: "100%",
                        width: "100%",
                        outline: "none",
                    }, this.props.style)} 
                    onDoubleClick={this.startEditing} 
                    onBlur={this.stopEditing}
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