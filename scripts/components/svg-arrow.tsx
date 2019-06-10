import React from 'react';
import gmath from '../libs/gmath';
import { Point } from 'scripts/types';

interface SvgArrowProps {
    vector: {
        start: Point,
        end: Point
    },
    size: number,
    onDoubleClick: (e: React.MouseEvent) => void,
    onMouseDown: (e: React.MouseEvent) => void,
    onContextMenu: (e: React.MouseEvent) => void
}

class SvgArrow extends React.Component<SvgArrowProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const start = this.props.vector.start;
        const end = this.props.vector.end;
        const size = this.props.size;

        const end90Rotated = gmath.rotatePoint(end, start, 90);
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
                onContextMenu={this.props.onContextMenu}
            ></polygon>
        );
    }
}

export default SvgArrow;