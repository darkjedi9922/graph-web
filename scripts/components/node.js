function Node(props) {
    return (<div className="graph__node">{props.text}</div>);
}

Node.defaultNodeText = "1";

function Graph(props) {
    return (
        <div className="graph__nodes">
            <Node text={Node.defaultNodeText} />
            <Node text="2" />
        </div>
    );
}

ReactDOM.render(
    <Graph />,
    document.getElementById("graph-react")
);