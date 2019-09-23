import React from 'react'
import { connect } from 'react-redux';
import ToolButton from './tool-button';
import { Dispatch } from 'redux';
import { AppState, SET_ORIENTED } from '../store';

interface StoreProps {
    oriented: boolean
}

interface DispatchProps {
    setOriented: (oriented: boolean) => void
}

interface SideToolsProps extends StoreProps, DispatchProps {}

class SideTools extends React.Component<SideToolsProps> {
    public shouldComponentUpdate(nextProps: SideToolsProps) {
        return nextProps.oriented !== this.props.oriented;
    }

    public render() {
        const oriented = this.props.oriented;

        return (
            <div className="tools">
                <ToolButton title="Ориентированность графа" 
                    activated={oriented}
                    icon="exchange"
                    onClick={() => this.props.setOriented(!oriented)}
                ></ToolButton>
            </div>
        )
    }
}

const mapStateToProps = (store: AppState): StoreProps => ({
    oriented: store.project.data.oriented
})

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    setOriented: (oriented) => dispatch({ type: SET_ORIENTED, oriented }),
})

export default connect(mapStateToProps, mapDispatchToProps)(SideTools)