class Edge extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // Чтобы не вращать каждый элемент по отдельности, просто берем все элементы
        // в состоянии 0-го градуса и вращаем все целиком в <g>.

        const x1 = this.props.start.x;
        const y1 = this.props.start.y;

        // SVG rotate вращает не в ту сторону, потому значение с минусом.
        const degree = -this.calcDegree();

        // Если при рисовании в состоянии 0-го градуса взять обычный x2, длина
        // ребра будет изменяться в зависимости от угла. Поэтому берем константый
        // x1 с константной длинной.
        const planeX2 = x1 + this.calcLength();

        let arrowElement = null;
        if (this.props.arrow) {
            arrowElement = <polygon points={
                (planeX2 - 25) + ',' + y1 + ' ' +
                (planeX2 - 35) + ',' + (y1 - 5) + ' ' +
                (planeX2 - 35) + ',' + (y1 + 5)} />
        }

        return (
            <g transform={"rotate(" + degree + " " + x1 + " " + y1 + ")"} >
                <path fill="none" d={
                    'M ' + x1 + ',' + y1 + ' ' + 
                    planeX2 + ',' + y1} 
                    stroke="black" />
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
        const edgeLength = this.calcLength();
        const projectionLength = x2 - x1;

        // Градусов в радианах.
        const DEG = 57.2958;

        // При определенных условиях может выйти NaN, тогда просто вернем 0.
        let result = (Math.acos(projectionLength / edgeLength) * DEG) || 0;
        
        // В 3 и 4 четвертях косинус не расчитывает больше 180. Нужно это исправить.
        if (y2 > y1) return 180 + 180 - result;
        return result;
    }

    calcLength() {
        const x1 = this.props.start.x;
        const y1 = this.props.start.y;
        const x2 = this.props.end.x;
        const y2 = this.props.end.y;
        
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
}