const React = require('react');
const Node = require('./node');
const Edge = require('./edge');

class Canvas extends React.Component {
    /**
     * props.nodes: array
     * props.edges: array
     * props.oriented: bool
     * props.onNodeClick(id)
     * props.onNodeMove(id, x, y)
     * props.onEdgeCurve(id, curve)
     * props.onEdgeTextChange(id, text)
     * props.addedEdgeEndPos: {x, y} | null
     */
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <svg className="graph__nodes">
                {this._createEdgeElementList()}
                {this._createNodeElementList()}
            </svg>
        );
    }

    /**
     * @returns array of Node
     */
    _createNodeElementList() {
        let result = [];
        for (const id in this.props.nodes) {
            const node = this.props.nodes[id];
            result.push(<Node key={id} id={id} text={node.text}
                radius={node.radius}
                cx={node.x} cy={node.y}
                className='graph__node'
                onMove={(x, y) => this.props.onNodeMove(id, x, y)}
                onClick={() => this.props.onNodeClick(id)} />);
        }
        return result;
    }

    /**
     * @returns array of Edge
     */
    _createEdgeElementList() {
        const result = [];
        for (const id in this.props.edges) {
            const edge = this.props.edges[id];
            result.push(<Edge key={id} arrow={this.props.oriented} 
                start={this._getEdgeStartPos(id)} end={this._getEdgeEndPos(id)}
                curve={edge.curve} text={edge.text}
                onCurve={(curve) => this.props.onEdgeCurve(id, curve)}
                onTextChange={(text) => this.props.onEdgeTextChange(id, text)} />);
        }
        return result;
    }

    _getEdgeStartPos(id) {
        const edge = this.props.edges[id];
        const startNode = this.props.nodes[edge.startNodeId];
        return {
            x: startNode.x,
            y: startNode.y
        }
    }

    _getEdgeEndPos(id) {
        let end;
        const edge = this.props.edges[id];
        // Если у ребра нет конца, значит оно в процессе добавления.
        if (edge.endNodeId === null) {
            const addedEdgeEndPos = this.props.addedEdgeEndPos;
            end = { x: addedEdgeEndPos.x, y: addedEdgeEndPos.y };
        } else {
            const endNode = this.props.nodes[edge.endNodeId];
            end = { x: endNode.x, y: endNode.y };
        }
        return end;
    }
}

module.exports = Canvas;