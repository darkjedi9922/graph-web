import { createStore, Action } from 'redux'

export interface AppState {
    project: {
        data: {
            oriented: boolean
        }
    }
}

export const SET_ORIENTED = 'SET_ORIENTED';

const initialState: AppState = {
    project: {
        data: {
            oriented: false
        }
    }
};

const appReducer = function(state = initialState, action): AppState {
    switch (action.type) {
    case SET_ORIENTED:
        let newState = {...state};
        newState.project.data.oriented = action.oriented;
        return newState;
    }
    return state;
}

const store = createStore(appReducer);
export default store;