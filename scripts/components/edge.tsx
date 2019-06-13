import React from 'react';
import SvgArrow from './svg-arrow';
import EditableSvgText from './editable-svg-text';

import gmath from '../libs/gmath';
import { Point } from '../types';

interface EdgeProps {
    start: Point,
    end: Point,
    curve: number,
    nodeRadius: number,
    text: string,
    arrow: boolean,
    onCurve: (curve) => void
    onTextChange: (text) => void,
    onContextMenu: (e: React.MouseEvent) => void
}

interface EdgeState {
    edit: boolean
}

class Edge extends React.Component<EdgeProps, EdgeState>
{
    private curving: {
        startX: number,
        startY: number,
        planeStart: Point,
        startCurve: number
    } | null = null;

    constructor(props) {
        super(props);
        this.state = { edit: false };
        this.curving = null;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTextWillEdit = this.onTextWillEdit.bind(this);
        this.onTextDidEdit = this.onTextDidEdit.bind(this);
    }

    shouldComponentUpdate(nextProps: EdgeProps, nextState: EdgeState) {
        return nextProps.end.x !== this.props.end.x ||
            nextProps.end.y !== this.props.end.y ||
            nextProps.start.x !== this.props.start.x ||
            nextProps.start.y !== this.props.start.y ||
            nextProps.arrow !== this.props.arrow ||
            nextProps.curve !== this.props.curve ||
            nextProps.text !== this.props.text ||
            nextState.edit !== this.state.edit;
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
                onDoubleClick={this.onTextWillEdit}
                onMouseDown={this.onMouseDown}
                onContextMenu={this.props.onContextMenu}
            />
        }

        const fontSize = 12;
        const textRect = {
            x: x1,
            y: y1 + curve + (curve > 0 ? 2 : - (fontSize + 2)) - 3,
            width: planeLength,
            height: fontSize
        };

        return (
            <g transform={"rotate(" + -degree + " " + x1 + " " + y1 + ")"} >
                <path fill="none" d={d} stroke="black" strokeWidth="2"
                    onMouseDown={this.onMouseDown}
                    onDoubleClick={this.onTextWillEdit}
                    onContextMenu={this.props.onContextMenu}
                ></path>
                {arrowElement}
                <EditableSvgText text={text} rect={textRect} edit={this.state.edit}
                    transform={`rotate(
                        ${degree > 90 && degree < 270 ? 180 : 0} 
                        ${textRect.x + textRect.width / 2} 
                        ${textRect.y + 3 + textRect.height / 2}
                    )`}
                    onMouseDown={this.onMouseDown}
                    onWillEdit={this.onTextWillEdit}
                    onDidEdit={this.onTextDidEdit}
                    onContextMenu={this.props.onContextMenu}
                />
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
        // Если клик на тексте, то preventDefault запретит его выделение.
        e.preventDefault();

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

    onMouseUp(event) {
        document.body.removeEventListener('mousemove', this.onMouseMove);
        document.body.removeEventListener('mouseup', this.onMouseUp);
        this.curving = null;
    }

    onTextWillEdit() {
        this.setState({ edit: true });
    }

    onTextDidEdit(text) {
        this.setState({ edit: false });
        this.props.onTextChange && this.props.onTextChange(text);
    }
}

export default Edge;