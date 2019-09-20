import { createStore } from 'redux'
import { AbstractCanvasObject, NodeMap, EdgeMap } from './types';
import * as appAPI from './desktop';

export interface AppState {
    project: {
        file?: string,
        data: { // this is what will be saved in the project file.
            nodes: NodeMap,
            edges: EdgeMap,
            oriented: boolean,
            nextNodeId: number,
            nextEdgeId: number
        }
    },
    selectedObject?: AbstractCanvasObject
}

export const ADD_NODE = 'ADD_NODE';
export const ADD_EDGE = 'ADD_EDGE';
export const CURVE_EDGE = 'CURVE_EDGE';
export const END_EDGE = 'END_EDGE';
export const MOVE_NODE = 'MOVE_NODE';
export const OPEN_PROJECT = 'OPEN_PROJECT';
export const SAVE_PROJECT_AS = 'SAVE_PROJECT';
export const SELECT_OBJECT = 'SELECT_OBJECT';
export const SET_NODE_TEXT = 'SET_NODE_TEXT';
export const SET_EDGE_TEXT = 'SET_EDGE_TEXT';
export const SET_ORIENTED = 'SET_ORIENTED';
export const REMOVE_NODE = 'REMOVE_NODE';
export const REMOVE_EDGE = 'REMOVE_EDGE';

const initialState: AppState = {
    project: {
        file: null,
        data: {
            nodes: {},
            edges: {},
            oriented: false,
            nextNodeId: 1,
            nextEdgeId: 1,
        }
    },
    selectedObject: null
};

const appReducer = function(state = initialState, action): AppState {
    let newState = {...state};
    switch (action.type) {
        case ADD_NODE:
            newState.project.data.nodes[state.project.data.nextNodeId] = {
                id: state.project.data.nextNodeId,
                text: state.project.data.nextNodeId.toString(),
                radius: 25,
                x: action.pos.x,
                y: action.pos.y,
                startEdges: [],
                endEdges: []
            };
            newState.project.data.nextNodeId += 1;
            break;
        case ADD_EDGE:
            var { startNodeId, endNodeId } = action;
            if (startNodeId === endNodeId) break;

            const newEdgeId = state.project.data.nextEdgeId;
            const newEdge = {
                startNodeId: startNodeId,
                endNodeId: endNodeId,
                text: `Edge ${newEdgeId}`,
                curve: 0
            };

            var { nodes, edges } = { ...state.project.data };
            edges[newEdgeId] = newEdge;
            nodes[startNodeId].startEdges.push(newEdgeId);

            // Если endNodeId = null, то ребро в процессе добавления и у ему пока
            // не назначен конечный узел.
            if (endNodeId !== null) nodes[endNodeId].endEdges.push(newEdgeId);

            newState.project.data.nodes = nodes;
            newState.project.data.edges = edges;
            newState.project.data.nextEdgeId += 1;
            break;
        case CURVE_EDGE:
            var edges = { ...state.project.data.edges };
            edges[action.id].curve = action.curve;
            newState.project.data.edges = edges;
            break;
        case END_EDGE:
            var { nodes, edges } = { ...state.project.data };
            nodes[action.endNodeId].endEdges.push(action.edgeId);
            edges[action.edgeId].endNodeId = action.endNodeId;
            newState.project.data.nodes = nodes;
            newState.project.data.edges = edges;
            break;
        case MOVE_NODE:
            var nodes = { ...state.project.data.nodes };
            nodes[action.id].x = action.pos.x;
            nodes[action.id].y = action.pos.y;
            newState.project.data.nodes = nodes;
            break;
        case OPEN_PROJECT:
            const openResult = appAPI.open();

            // If opening is cancelled, contents is an empty. 
            if (!openResult) return;

            // Мог быть выбран файл неправильного формата.
            try {
                // Parse can throw an error.
                const parsed = JSON.parse(openResult.contents);
                // We must be sure that the parsed object is a graph state.
                if (!isProjectData(parsed)) throw 'The object is not a graph state.';
                // Further everything is ok.
                newState.project.file = openResult.file;
                newState.project.data = parsed;
            } catch (e) {
                console.error(e);
            }
            break;
        case SAVE_PROJECT_AS:
            // If saving is cancelled, savedFile is an empty.
            newState.project.file = appAPI.saveAs(JSON.stringify({
                ...state.project.data,
                // Добавим идентификатор нашего формата, чтобы проверять его при 
                // открытии файла (вдруг нам подсунули не то).
                stateId: 'graphstate'
            }));
            break;
        case SELECT_OBJECT:
            newState.selectedObject = action.object;
            break;
        case SET_NODE_TEXT:
            var nodes = { ...state.project.data.nodes };
            nodes[action.id].text = action.text;
            newState.project.data.nodes = nodes;
            break;
        case SET_EDGE_TEXT:
            var edges = { ...state.project.data.edges };
            edges[action.id].text = action.text;
            newState.project.data.edges = edges;
            break;
        case SET_ORIENTED:
            newState.project.data.oriented = action.oriented;
            break;
        case REMOVE_NODE:
            var nodes = { ...state.project.data.nodes };
            var edges = { ...state.project.data.edges };
            
            // Удаляем ребра, подсоединенные к этому узлу.
            const remover = (edgeId) => {
                var removeResult = removeEdge(nodes, edges, edgeId);
                nodes = removeResult.nodes;
                edges = removeResult.edges;
            };
            nodes[action.id].startEdges.map(remover);
            nodes[action.id].endEdges.map(remover);

            delete nodes[action.id];
            newState.project.data.nodes = nodes;
            newState.project.data.edges = edges;
            break;
        case REMOVE_EDGE:
            var {nodes, edges} = removeEdge(
                state.project.data.nodes, 
                state.project.data.edges, 
                action.id);
            newState.project.data.nodes = nodes;
            newState.project.data.edges = edges;
            break;
    }
    return newState;
}

function removeEdge(nodes: NodeMap, edges: EdgeMap, id: number): {
    nodes: NodeMap,
    edges: EdgeMap
} {
    var resultEdges = { ...edges };
    var resultNodes = { ...nodes };
    var startNode = resultNodes[resultEdges[id].startNodeId];
    var endNode = resultNodes[resultEdges[id].endNodeId];

    // Удаляем это ребро из его начального и конечного узла.
    const filter = edgeId => edgeId !== id;
    startNode.startEdges = startNode.startEdges.filter(filter);
    endNode.endEdges = endNode.endEdges.filter(filter);

    delete resultEdges[id];
    return { nodes: resultNodes, edges: resultEdges };
}

function isProjectData(value: object): boolean {
    return value['stateId'] === 'graphstate';
}

const store = createStore(appReducer);
export default store;