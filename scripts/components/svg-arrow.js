class SvgArrow extends React.Component {
    /**
     * props.vector.start.x: number
     * props.vector.start.y: number
     * props.vector.end.x: number
     * props.vector.end.y: number
     * props.size: number
     * 
     * props.onDoubleClick: (e) => {}
     * props.onMouseDown: (e) => {}
     */
    constructor(props) {
        super(props);
    }

    render() {
        const start = this.props.vector.start;
        const end = this.props.vector.end;
        const size = this.props.size;

        const end90Rotated = rotatePoint(end, start, 90);
        const normal = {
            x: end90Rotated.x - start.x,
            y: end90Rotated.y - start.y
        }

        return (
            <polygon points={`${end.x},${end.y}
                ${(start.x + size * normal.x / (size * 2))},
                ${(start.y + size * normal.y / (size * 2))}
                ${(start.x + size * -normal.x / (size * 2))},
                ${(start.y + size * -normal.y / (size * 2))}`}
                onDoubleClick={this.props.onDoubleClick}
                onMouseDown={this.props.onMouseDown}
            ></polygon>
        );
    }
}