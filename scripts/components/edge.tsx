import React from 'react';
import SvgArrow from './svg-arrow';
import ClickEngine from '../engines/click-engine';
import * as gmath from '../libs/gmath';
import { Point } from '../types';

interface EdgeProps {
    start: Point,
    end: Point,
    curve: number,
    nodeRadius: number,
    text: string,
    arrow: boolean,
    onClick: () => void,
    onCurve: (curve) => void
    onContextMenu: (e: React.MouseEvent) => void
}

class Edge extends React.Component<EdgeProps>
{
    private curving: {
        startX: number,
        startY: number,
        planeStart: Point,
        startCurve: number
    } = null;
    private clickEngine = new ClickEngine;

    constructor(props) {
        super(props);
        this.state = { edit: false };
        this.curving = null;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    shouldComponentUpdate(nextProps: EdgeProps) {
        return nextProps.end.x !== this.props.end.x ||
            nextProps.end.y !== this.props.end.y ||
            nextProps.start.x !== this.props.start.x ||
            nextProps.start.y !== this.props.start.y ||
            nextProps.arrow !== this.props.arrow ||
            nextProps.curve !== this.props.curve ||
            nextProps.text !== this.props.text;
    }

    render() {
        // Чтобы не вращать каждый элемент по отдельности, просто берем все элементы
        // в состоянии 0-го градуса и вращаем все целиком в <g>.

        const x1 = this.props.start.x;
        const y1 = this.props.start.y;
        const curve = this.props.curve || 0;
        const arrowSize = 12.5;
        const nodeRadius = this.props.nodeRadius;
        const planeLength = this.calcLength();
        const halfLength = planeLength / 2;
        const text = this.props.text;
        const degree = this.calcDegree();

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
            const arrowEnd = virtualPath.getPointAtLength(pathLength - nodeRadius);
            const arrowStart = virtualPath.getPointAtLength(pathLength - nodeRadius - arrowSize);
            arrowElement = <SvgArrow vector={{start: arrowStart, end: arrowEnd}}
                size={arrowSize}
                onMouseDown={this.onMouseDown}
                onContextMenu={this.props.onContextMenu}
            />
        }

        const fontSize = 12;
        const textCenter = {
            x: x1 + planeLength / 2,
            y: y1 + curve + (curve > 0 ? 2 : - (fontSize + 2)) + fontSize / 2
        };
        let mirrorTransform = null;
        if (degree > 90 && degree < 270)
            mirrorTransform = `rotate(180 ${textCenter.x} ${textCenter.y})`;

        return (
            <g transform={"rotate(" + gmath.toHtmlDeg(degree) + " " + x1 + " " + y1 + ")"} >
                <path fill="none" d={d} stroke="black" strokeWidth="2"
                    className="graph__edge"
                    onMouseDown={this.onMouseDown}
                    onContextMenu={this.props.onContextMenu}
                ></path>
                {arrowElement}
                <text x={textCenter.x} y={textCenter.y}
                    className="graph__edge-text"
                    style={{ userSelect: "none" }}
                    textAnchor="middle" alignmentBaseline="central"
                    transform={mirrorTransform}
                    onMouseDown={this.onMouseDown}
                    onContextMenu={this.props.onContextMenu}
                >
                    {text}
                </text>
            </g>
        );
    }

    calcDegree() {
        return gmath.calcVectorDegree(this.props.start, this.props.end);
    }

    calcLength() {
        return gmath.calcVectorLength(this.props.start, this.props.end);
    }

    onMouseDown(e: React.MouseEvent) {
        this.clickEngine.onMouseDown(e.nativeEvent);

        const start = this.props.start;
        const eventX = e.clientX;
        const eventY = e.clientY;
        const degree = this.calcDegree();
        const planeStart = gmath.rotatePoint({x: eventX, y: eventY}, start, degree);
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

        var x = e.clientX;
        var y = e.clientY;
        const planeEventPoint = gmath.rotatePoint({x: x, y: y}, start, degree);

        const curve = planeEventPoint.y - this.curving.planeStart.y;
        this.props.onCurve(this.curving.startCurve + curve);
    }

    onMouseUp(e: MouseEvent) {
        this.clickEngine.onMouseUp(e, this.props.onClick);

        document.body.removeEventListener('mousemove', this.onMouseMove);
        document.body.removeEventListener('mouseup', this.onMouseUp);
        this.curving = null;
    }
}

export default Edge;