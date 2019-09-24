import React from 'react'
import { connect } from 'react-redux';
import ToolButton from './tool-button';
import { Dispatch } from 'redux';
import { AppState, SET_ORIENTED, SET_NODE_AUTOSIZE } from '../store';

interface StoreProps {
    nodeAutoSize: boolean,
    oriented: boolean
}

interface DispatchProps {
    setNodeAutoSize: (enabled: boolean) => void,
    setOriented: (oriented: boolean) => void
}

interface SideToolsProps extends StoreProps, DispatchProps {}

class SideTools extends React.Component<SideToolsProps> {
    public render() {
        const oriented = this.props.oriented;

        return (
            <div className="tools">
                <ToolButton title="Ориентированность графа" 
                    activated={oriented}
                    icon="exchange"
                    onClick={() => this.props.setOriented(!oriented)}
                ></ToolButton>
                <ToolButton title="Авторазмер узлов"
                    activated={this.props.nodeAutoSize}
                    icon="resize-full"
                    onClick={() => this.props.setNodeAutoSize(!this.props.nodeAutoSize)}
                ></ToolButton>
            </div>
        )
    }
}

const mapStateToProps = (store: AppState): StoreProps => ({
    nodeAutoSize: store.project.data.nodeAutoSize,
    oriented: store.project.data.oriented
})

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    setNodeAutoSize: (enabled) => dispatch({ type: SET_NODE_AUTOSIZE, enabled }),
    setOriented: (oriented) => dispatch({ type: SET_ORIENTED, oriented }),
})

export default connect(mapStateToProps, mapDispatchToProps)(SideTools)