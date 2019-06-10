import React from 'react';

interface EditableSvgTextProps {
    rect: {
        x: number,
        y: number,
        width: number,
        height: number
    },
    text: string,
    edit: boolean,
    style?: object,
    className?: string,
    transform?: string,
    onMouseDown: (e: React.MouseEvent) => void,
    onMouseUp?: (e: React.MouseEvent) => void,
    onClick?: (e: React.MouseEvent) => void,
    onContextMenu?: (e: React.MouseEvent) => void,
    onWillEdit?: () => void,
    onDidEdit?: (text: string) => void
}

class EditableSvgText extends React.Component<EditableSvgTextProps> {
    private inputRef = React.createRef<HTMLInputElement>();
    
    constructor(props) {
        super(props);

        this.startEditing = this.startEditing.bind(this);
        this.stopEditing = this.stopEditing.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    componentDidUpdate() {
        this.props.edit && this.inputRef.current.focus();
    }

    render() {
        const rect = this.props.rect;
        const text = this.props.text;

        return (<>
            {!this.props.edit ? 
                <text x={rect.x + rect.width / 2} y={rect.y + rect.height / 2}
                    className={this.props.className} 
                    style={Object.assign({ userSelect: "none"}, this.props.style)}
                    textAnchor="middle" alignmentBaseline="central"
                    transform={this.props.transform}
                    onDoubleClick={this.startEditing}
                    onMouseDown={this.props.onMouseDown}
                    onMouseUp={this.props.onMouseUp} 
                    onClick={this.props.onClick}
                    onContextMenu={this.props.onContextMenu}
                >
                    {text}
                </text>
                :
                <foreignObject x={rect.x} y={rect.y}
                    width={rect.width} height={rect.height}>
                    <input defaultValue={text} ref={this.inputRef} 
                    className={this.props.className}
                    style={Object.assign({
                        background: "transparent",
                        border: "none",
                        textAlign: "center",
                        height: "100%",
                        width: "100%",
                        outline: "none",
                    }, this.props.style)} 
                    onDoubleClick={this.startEditing} 
                    onBlur={this.stopEditing}
                    onKeyDown={this.onKeyDown} 
                    onContextMenu={this.props.onContextMenu}/>
                </foreignObject>
            }
        </>);
    }

    startEditing() {
        this.props.onWillEdit && this.props.onWillEdit();
    }

    stopEditing() {
        const newValue = this.inputRef.current.value;
        this.props.onDidEdit && this.props.onDidEdit(newValue);
    }

    onKeyDown(e) {
        if (e.keyCode === 13) this.stopEditing();
    }
}

export default EditableSvgText;