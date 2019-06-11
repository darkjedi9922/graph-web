import React from 'react'
import ToolButton from './tool-button';

interface SideToolsProps {
    oriented: boolean,
    onOrientedChange: (oriented: boolean) => void
}

class SideTools extends React.Component<SideToolsProps> {
    public shouldComponentUpdate(nextProps: SideToolsProps) {
        return nextProps.oriented !== this.props.oriented;
    }

    public render() {
        const {
            oriented
        } = this.props;

        return (
            <div className="tools">
                <ToolButton title="Ориентированность графа" 
                    activated={oriented}
                    icon="exchange"
                    onChange={(activated) => this.props.onOrientedChange(activated)}
                ></ToolButton>
            </div>
        )
    }
}

export default SideTools