import React from 'react';
import { ContextMenu, MenuItem } from 'react-contextmenu';

interface CanvasContextMenuProps {
    id: string,
    className: string,
    addEdgeEnabled: boolean,
    onShow: () => void,
    onAddNodeClick: () => void,
    onAddEdgeClick: () => void
}

export default class CanvasContextMenu extends React.Component<CanvasContextMenuProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const p = this.props;

        return (
            <ContextMenu id={p.id} className={p.className} onShow={p.onShow}>
                <MenuItem onClick={p.onAddNodeClick} attributes={{
                    className: 'canvas-context__button'
                }}>Добавить узел</MenuItem>
                <MenuItem onClick={p.onAddEdgeClick} attributes={{
                    className: 'canvas-context__button'
                }} disabled={!p.addEdgeEnabled}>Добавить ребро</MenuItem>
            </ContextMenu>
        );
    }
}