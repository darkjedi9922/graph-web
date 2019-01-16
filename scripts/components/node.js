function Node(props) {
    return (<div className="graph__node">{props.text}</div>);
}

Node.defaultNodeText = "1";

// Это дело !Заменяет (зачем-то) (или удаляет) все элементы, которые уже
// были в контейнере
ReactDOM.render(
    <div className="graph__nodes">
        {Node({text: Node.defaultNodeText})}
        {Node({text: "2"})}
    </div>,
    document.getElementById("graph-react")
);