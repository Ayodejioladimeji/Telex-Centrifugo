import { ACTIONS } from "./Actions";

const reducers = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case ACTIONS.USER:
      return {
        ...state,
        user: payload,
      };

    case ACTIONS.SOCKET:
      return {
        ...state,
        socket: payload,
      };

    case ACTIONS.ROOMS:
      return {
        ...state,
        rooms: payload,
      };

    case ACTIONS.NAME_MODAL:
      return {
        ...state,
        nameModal: payload,
      };

    case ACTIONS.ROUTE:
      return {
        ...state,
        route: payload,
      };

    default:
      return state;
  }
};

export default reducers;
