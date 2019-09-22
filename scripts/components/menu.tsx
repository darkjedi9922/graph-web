import React from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { AppState, OPEN_PROJECT, SAVE_PROJECT_AS, SAVE_PROJECT } from '../store';

interface StoreProps {
    projectFile?: string
}

interface DispatchProps {
    open: () => void,
    save: () => void,
    saveAs: () => void
}

class Menu extends React.Component<StoreProps & DispatchProps> {
    public shouldComponentUpdate(nextProps: StoreProps): boolean {
        return nextProps.projectFile !== this.props.projectFile;
    }

    public render() {
        return (
            <ul className="menu">
                <li className="menu__category">Файл
                    <ul className="menu__submenu">
                        <li className="menu__option" onClick={this.props.open}>Открыть...</li>
                        <li className={"menu__option" + (this.props.projectFile ? '' : ' menu__option--disabled')}
                            onClick={this.props.save}
                        >Сохранить</li>
                        <li className="menu__option" onClick={this.props.saveAs}>Сохранить как...</li>
                    </ul>
                </li>
            </ul>
        )
    }
}

const mapStateToProps = (state: AppState): StoreProps => ({
    projectFile: state.project.file
})

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    open: () => dispatch({ type: OPEN_PROJECT }),
    save: () => dispatch({ type: SAVE_PROJECT }),
    saveAs: () => dispatch({ type: SAVE_PROJECT_AS })
})

export default connect(mapStateToProps, mapDispatchToProps)(Menu);