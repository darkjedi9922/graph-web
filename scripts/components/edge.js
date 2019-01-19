class Edge extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const x1 = this.props.start.x || 0;
        const y1 = this.props.start.y || 0;
        const x2 = this.props.end.x || 0;
        const y2 = this.props.end.y || 0;

        return (
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" />
        );
    }
}