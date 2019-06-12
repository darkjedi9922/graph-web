import React from 'react'

interface MenuProps {
    onFileSaveAs: () => void
}

class Menu extends React.Component<MenuProps> {
    public shouldComponentUpdate(): boolean {
        return false;
    }

    public render() {
        return (
            <ul className="menu">
                <li className="menu__category">Файл
                    <ul className="menu__submenu">
                        <li className="menu__option">Открыть...</li>
                        <li className="menu__option" onClick={this.props.onFileSaveAs}>Сохранить как...</li>
                    </ul>
                </li>
            </ul>
        )
    }
}

export default Menu;