const defaultNodeText = "1"
const node = <div className="graph__node">{defaultNodeText}</div>;

// Это дело !Заменяет (зачем-то) (или удаляет) все элементы, которые уже
// были в контейнере
ReactDOM.render(
    node, // JSX что рисовать
    document.getElementById("graph-react") // Где рисовать
);