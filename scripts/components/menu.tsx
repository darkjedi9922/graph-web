import React from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { OPEN_PROJECT, SAVE_PROJECT_AS } from '../store';

interface DispatchProps {
    onOpen: () => void,
    onFileSaveAs: () => void
}

class Menu extends React.Component<DispatchProps> {
    public shouldComponentUpdate(): boolean {
        return false;
    }

    public render() {
        return (
            <ul className="menu">
                <li className="menu__category">Файл
                    <ul className="menu__submenu">
                        <li className="menu__option" onClick={this.props.onOpen}>Открыть...</li>
                        <li className="menu__option" onClick={this.props.onFileSaveAs}>Сохранить как...</li>
                    </ul>
                </li>
            </ul>
        )
    }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onOpen: () => dispatch({ type: OPEN_PROJECT }),
    onFileSaveAs: () => dispatch({ type: SAVE_PROJECT_AS })
})

export default connect(null, mapDispatchToProps)(Menu);