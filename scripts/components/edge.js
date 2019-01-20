class Edge extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const x1 = this.props.start.x;
        const y1 = this.props.start.y;
        const x2 = this.props.end.x;
        const y2 = this.props.end.y;

        let arrowElement = null;
        if (this.props.arrow) {
            // SVG rotate вращает не в ту сторону (или оно идет не туда, из-за
            // расположения точки, относительно которой вращаем), потому значение с 
            // минусом.
            const arrowDegree = -this.calcDegree();

            const arrowRotateCenterX = x2;
            const arrowRotateCenterY = y2;

            arrowElement = <polygon points={
                (x2 - 25) + ',' + y2 + ' ' +
                (x2 - 35) + ',' + (y2 - 5) + ' ' +
                (x2 - 35) + ',' + (y2 + 5)}
                transform={"rotate(" + arrowDegree + " " +
                    arrowRotateCenterX + " " + arrowRotateCenterY + ")"} />
        }

        return (
            <g>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" />
                {arrowElement}
            </g>
        );
    }

    calcDegree() {
        const x1 = this.props.start.x;
        const y1 = this.props.start.y;
        const x2 = this.props.end.x;
        const y2 = this.props.end.y;

        // Найдем угол через угол между вектором и его проекцией на ось Х.
        const edgeLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const projectionLength = x2 - x1;

        // Градусов в радианах.
        const DEG = 57.2958;

        // При определенных условиях может выйти NaN, тогда просто вернем 0.
        let result = (Math.acos(projectionLength / edgeLength) * DEG) || 0;
        
        // В 3 и 4 четвертях косинус не расчитывает больше 180. Нужно это исправить.
        if (y2 > y1) return 180 + 180 - result;
        return result;
    }
}