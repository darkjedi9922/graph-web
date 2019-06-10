import React from 'react';
import { ContextMenu, MenuItem } from 'react-contextmenu';

interface CanvasContextMenuProps {
    id: string,
    className: string,
    onAddNodeClick: () => void,
    onAddEdgeClick: () => void,
    onRemoveNode: () => void,
    onRemoveEdge: () => void
}

interface CanvasContextMenuState {
    addEdgeEnabled: boolean,
    removeNodeEnabled: boolean,
    removeEdgeEnabled: boolean
}

class CanvasContextMenu extends React.Component<CanvasContextMenuProps, CanvasContextMenuState> {
    constructor(props) {
        super(props);
        this.state = {
            addEdgeEnabled: false,
            removeNodeEnabled: false,
            removeEdgeEnabled: false
        }
    }

    render() {
        const p = this.props;
        const s = this.state;

        return (
            <ContextMenu id={p.id} className={p.className}>
                <MenuItem onClick={p.onAddNodeClick} attributes={{
                    className: 'canvas-context__button'
                }}>Добавить узел</MenuItem>
                <MenuItem onClick={p.onAddEdgeClick} attributes={{
                    className: 'canvas-context__button'
                }} disabled={!s.addEdgeEnabled}>Добавить ребро</MenuItem>
                <MenuItem onClick={p.onRemoveNode} attributes={{
                    className: 'canvas-context__button'
                }} disabled={!s.removeNodeEnabled}>Удалить узел</MenuItem>
                <MenuItem onClick={p.onRemoveEdge} attributes={{
                    className: 'canvas-context__button'
                }} disabled={!s.removeEdgeEnabled}>Удалить ребро</MenuItem>
            </ContextMenu>
        );
    }

    public enableAddEdge(enable: boolean): void {
        this.setState({
            addEdgeEnabled: enable
        });
    }

    public enableRemoveNode(enable: boolean): void {
        this.setState({
            removeNodeEnabled: enable
        });
    }

    public enableRemoveEdge(enable: boolean): void {
        this.setState({
            removeEdgeEnabled: enable
        });
    }
}

export default CanvasContextMenu;