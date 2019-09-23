import React from 'react'

interface ToolButtonProps {
    activated: boolean,
    title: string,
    icon: string;
    onClick: () => void
}

class ToolButton extends React.Component<ToolButtonProps> {
    public shouldComponentUpdate(nextProps: ToolButtonProps): boolean {
        return nextProps.activated !== this.props.activated;
    }

    public render() {
        const { activated, title, icon } = this.props;

        return (
            <button title={title}
                className={"tools__button" + (activated ? " tools__button--activated" : "")}
                onClick={() => this.props.onClick()}
            ><i className={"icon-" + icon}></i></button>
        )
    }
}

export default ToolButton