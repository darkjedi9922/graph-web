import React from 'react'
import { connect } from 'react-redux';
import ToolButton from './tool-button';
import { Store } from 'redux';
import { AppState } from '../store';

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

const mapStateToProps = function(store: AppState) {
    return {
        oriented: store.project.data.oriented
    }
}

export default connect(mapStateToProps)(SideTools)