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
    onMouseUp?: (e: MouseEvent) => void,
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
        this.onMouseDown = this.onMouseDown.bind(this);
    }

    componentDidUpdate() {
        this.props.edit && this.inputRef.current.focus();
    }

    render() {
        const rect = this.props.rect;
        const text = this.props.text;

        return (
            <foreignObject x={rect.x} y={rect.y}
                width={rect.width} height={rect.height} 
                transform={this.props.transform}>
                <input defaultValue={text} ref={this.inputRef}
                    // onDoubleClick event does not fire on disabled inputs, so
                    // we make it read-only.
                    readOnly={!this.props.edit}
                    className={this.props.className}
                    style={Object.assign({
                        background: "transparent",
                        border: "none",
                        textAlign: "center",
                        height: "100%",
                        width: "100%",
                        outline: "none",
                        cursor: this.props.edit ? "auto" : "pointer"
                    }, this.props.style)} 
                    onDoubleClick={this.startEditing} 
                    onBlur={this.stopEditing}
                    onKeyDown={this.onKeyDown}
                    onContextMenu={this.props.edit ? null : this.props.onContextMenu}
                    onMouseDown={this.onMouseDown}
                />
            </foreignObject>);
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

    onMouseDown(e: React.MouseEvent) {
        if (this.props.edit) return;

        // Если назначать onMouseUp на сам элемент, то он не сработает, если после
        // перемещения элемента он окажется под другим элементом. Тогда onMouseUp
        // сработает на том другом элементе, а должен на этом. Поэтому поставим
        // обработчик onMouseUp на body, при onMouseDown на элементе. Тогда точно
        // поймем, что если произошел onMouseUp, то он относится к этому элементу.  
        const self = this as EditableSvgText;
        const mouseupListener = function (this: HTMLElement, e: MouseEvent) {
            document.body.removeEventListener('mouseup', mouseupListener);
            if (self.props.onMouseUp) self.props.onMouseUp(e);
        };
        document.body.addEventListener('mouseup', mouseupListener);

        this.props.onMouseDown(e);
    }
}

export default EditableSvgText;