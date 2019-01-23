class EditableSvgText extends React.Component {
    render() {
        const x = this.props.x;
        const y = this.props.y;
        const font = this.props.font;
        const text = this.props.text;

        return (
            <text x={x} y={y} fill="black" style={{
                    fontSize: font.size,
                    userSelect: "none"
                }}
                textAnchor="middle" alignmentBaseline="central"
                onMouseDown={this.props.onMouseDown}>
                {text}
            </text>
        );

        return (
            <foreignObject x={this.x} y={this.y} 
                onMouseDown={this.props.onMouseDown}
                width={this.width} height={this.font.size}>
                <input defaultValue={this.text} disabled style={{
                    background: "transparent",
                    border: "none",
                    textAlign: "center",
                    height: this.font.size + "px",
                    width: this.width + "px",
                    fontSize: this.font.size + "px",
                    outline: "none",
                    userSelect: "none"
                }} />
            </foreignObject>
        );
    }
}