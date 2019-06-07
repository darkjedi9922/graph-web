const React = require('react');
const EditableSvgText = require('./editable-svg-text');

class Node extends React.Component {
    constructor(props) {
        super(props);
        this.id = props.id;
        this.moving = null;
        this.state = {
            text: props.text,
            editing: false
        }

        this.onTextWillEdit = this.onTextWillEdit.bind(this);
        this.onTextChange = this.onTextChange.bind(this);
    }

    render() {
        const radius = this.props.radius || 25;
        const centerX = this.props.cx || radius;
        const centerY = this.props.cy || radius;

        return (
            <g>
                <circle r={radius} cx={centerX} cy={centerY}
                    className={this.props.className}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onMouseUp={this.onMouseUp.bind(this)}
                    onClick={this.props.onClick}
                    onDoubleClick={this.onTextWillEdit} />
                <EditableSvgText text={this.state.text} edit={this.state.editing} 
                    rect={{
                        x: centerX - radius,
                        y: centerY - radius,
                        width: radius * 2,
                        height: radius * 2
                    }} className="graph__node-text" style={{
                        
                    }}
                    onClick={this.props.onClick}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onMouseUp={this.onMouseUp.bind(this)}
                    onWillEdit={this.onTextWillEdit}
                    onDidEdit={this.onTextChange} 
                />
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

    onTextWillEdit() {
        this.setState({ editing: true });
    }

    onTextChange(text) {
        this.setState({
            text: text,
            editing: false
        });
    }
}

module.exports = Node;