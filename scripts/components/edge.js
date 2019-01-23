class Edge extends React.Component {
    constructor(props) {
        super(props);
        this.curving = null;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    render() {
        // Чтобы не вращать каждый элемент по отдельности, просто берем все элементы
        // в состоянии 0-го градуса и вращаем все целиком в <g>.

        const x1 = this.props.start.x;
        const y1 = this.props.start.y;
        const curve = this.props.curve || 0;
        const arrowSize = 12.5;
        const nodeRadius = 25;
        const planeLength = this.calcLength();
        const halfLength = planeLength / 2;
        const text = this.props.text;

        // SVG rotate вращает не в ту сторону, потому значение с минусом.
        const degree = -this.calcDegree();

        const d = `M ${x1},${y1} c 0,0 0,${curve} ${halfLength},${curve} 
            s ${halfLength},${-curve} ${halfLength},${-curve}`;

        // Для точных расчетов приходится использовать возможности браузера. 
        // Если расчитывать точки на кривой вручную по формуле, то будут 
        // неточности между ручным просчетом и тем, что рисует браузер, из-за 
        // чего появляются баги и стрелка поворачивается не в соответствии с
        // кривой.
        const virtualPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        virtualPath.setAttribute('d', d);
        const pathLength = virtualPath.getTotalLength();

        let arrowElement = null;
        if (this.props.arrow) {
            const arrowStart = virtualPath.getPointAtLength(pathLength - nodeRadius);
            const arrowEnd = virtualPath.getPointAtLength(pathLength - nodeRadius - arrowSize);

            // Вычисляем крайние координаты точек стрелки через нормаль к вектору
            // стрелки.
            const arrowEndNormal = this._rotatePoint(arrowStart, arrowEnd, 90);
            const arrowNormal = {
                x: arrowEndNormal.x - arrowEnd.x,
                y: arrowEndNormal.y - arrowEnd.y
            }

            arrowElement = <polygon points={`${arrowStart.x},${arrowStart.y}
                ${(arrowEnd.x + arrowSize * arrowNormal.x / (arrowSize * 2))},
                ${(arrowEnd.y + arrowSize * arrowNormal.y / (arrowSize * 2))}
                ${(arrowEnd.x + arrowSize * -arrowNormal.x / (arrowSize * 2))},
                ${(arrowEnd.y + arrowSize * -arrowNormal.y / (arrowSize * 2))}`}
            />
        }

        const font = {
            size: 12
        };
        const textX = x1 + planeLength / 2;
        const textY = y1 + curve + (font.size * 1.2) / (curve > 0 ? 2 : -2);

        return (
            <g transform={"rotate(" + degree + " " + x1 + " " + y1 + ")"} >
                <path fill="none" d={d} stroke="black" strokeWidth="2"
                    onMouseDown={this.onMouseDown} />
                {arrowElement}
                <EditableSvgText x={textX} y={textY} font={font} text={text} 
                    onMouseDown={this.onMouseDown} />
            </g>
        );
    }

    calcDegree() {
        return this._calcVectorDegree(this.props.start, this.props.end);
    }

    calcLength() {
        return this._calcVectorLength(this.props.start, this.props.end);
    }

    onMouseDown(e) {
        const start = this.props.start;
        // TODO: Вычислять координату с учетом размещения холста.
        const eventX = e.clientX - 10;
        const eventY = e.clientY - 10;
        const degree = this.calcDegree();
        const planeStart = this._rotatePoint({x: eventX, y: eventY}, start, degree);
        this.curving = {
            startX: eventX,
            startY: eventY,
            planeStart: planeStart,
            startCurve: this.props.curve || 0
        }

        document.body.addEventListener('mouseup', this.onMouseUp);
        document.body.addEventListener('mousemove', this.onMouseMove);
    }

    onMouseMove(e) {
        const start = this.props.start;
        const degree = this.calcDegree();

        // Warning: При задании padding это слезет.
        // TODO: Вычислять координату с учетом размещения холста.
        var x = e.offsetX;
        var y = e.offsetY;
        const planeEventPoint = this._rotatePoint({x: x, y: y}, start, degree);

        const curve = planeEventPoint.y - this.curving.planeStart.y;
        this.props.onCurve(this.curving.startCurve + curve);
    }

    onMouseUp(event) {
        document.body.removeEventListener('mousemove', this.onMouseMove);
        document.body.removeEventListener('mouseup', this.onMouseUp);
        this.curving = null;
    }

    _calcVectorDegree(start, end) {
        // Найдем угол через угол между вектором и его проекцией на ось Х.
        const length = this._calcVectorLength(start, end);
        const projectionLength = end.x - start.x;

        // Градусов в радианах.
        const DEG = 57.2958;

        // При определенных условиях может выйти NaN, тогда просто вернем 0.
        let result = (Math.acos(projectionLength / length) * DEG) || 0;

        // В 3 и 4 четвертях косинус не расчитывает больше 180. Нужно это исправить.
        if (end.y > start.y) return 360 - result;
        return result;
    }

    _calcVectorLength(start, end) {
        return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    }

    _rotatePoint(point, center, degree) {
        const rad = 3.14 / 180 * degree;

        return {
            x: center.x + (point.x - center.x) * Math.cos(rad) - 
                (point.y - center.y) * Math.sin(rad),
            y: center.y + (point.y - center.y) * Math.cos(rad) + 
                (point.x - center.x) * Math.sin(rad)
        }
    }
}