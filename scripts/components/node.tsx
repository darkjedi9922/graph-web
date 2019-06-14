import React from 'react';

interface NodeProps {
    id: number,
    radius: number,
    cx: number,
    cy: number,
    text: string,
    className: string,
    onClick: (e: React.MouseEvent) => void,
    onMove: (x: number, y: number) => void,
    onContextMenu: (e: React.MouseEvent) => void,
    onTextChange: (text: string) => void
}

class Node extends React.Component<NodeProps> {
    private moving: {
        startX: number,
        startY: number,
        cursorStartX: number,
        cursorStartY: number,
        listener: (e: MouseEvent) => void
    } | null = null;
    
    constructor(props) {
        super(props);
        this.state = {
            editing: false
        }
    }

    shouldComponentUpdate(nextProps: NodeProps): boolean {
        return nextProps.cx !== this.props.cx ||
            nextProps.cy !== this.props.cy ||
            nextProps.text !== this.props.text;
    }

    render() {
        const radius = this.props.radius || 25;
        const centerX = this.props.cx || radius;
        const centerY = this.props.cy || radius;

        return (
            <g>
                <circle r={radius} cx={centerX} cy={centerY} 
                    className={this.props.className}
                    onClick={(e) => {
                        if (!this.moving) this.props.onClick(e);
                    }}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onMouseUp={this.onMouseUp.bind(this)}
                    onContextMenu={this.props.onContextMenu}
                />
                <text x={centerX} y={centerY}
                    className="graph__node-text"
                    style={{ userSelect: "none" }}
                    textAnchor="middle" alignmentBaseline="central"
                    onClick={(e) => {
                        if (!this.moving) this.props.onClick(e);
                    }}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onMouseUp={this.onMouseUp.bind(this)}
                    onContextMenu={this.props.onContextMenu}
                >
                    {this.props.text}
                </text>
            </g>
        );
    }

    onMouseDown(event) {
        // Мы будем говорить о "желании" переместиться через коллбек. Если коллбека
        // нет, то и пытаться понять куда мы хотим перемещаться бессмысленно. 
        if (!this.props.onMove) return;
        
        this.moving = {
            startX: this.props.cx,
            startY: this.props.cy,
            cursorStartX: event.clientX,
            cursorStartY: event.clientY,
            listener: (function (e) {
                // Почему-то обработчик события все еще пытается сработать иногда,
                // не смотря на то, что он уже как-бы удален...
                if (this.moving === null) return;

                const diffX = e.clientX - this.moving.cursorStartX;
                const diffY = e.clientY - this.moving.cursorStartY;
                const newCX = this.moving.startX + diffX;
                const newCY = this.moving.startY + diffY;
                this.props.onMove(newCX, newCY);
            }).bind(this)
        }

        document.body.addEventListener("mousemove", this.moving.listener);
    }

    onMouseUp() {
        if (!this.moving) return;
        document.body.removeEventListener('mousemove', this.moving.listener);
        this.moving = null;
    }
}

export default Node;