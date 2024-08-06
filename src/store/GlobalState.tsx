import { createContext, useEffect, useReducer } from "react";
import reducers from "./Reducers";

export const DataContext = createContext(null);

export const DataProvider = ({ children }: any) => {
  const initialState = {
    socket: null,
    rooms:null,
    nameModal:false,
    route:null,
  };

  const [state, dispatch] = useReducer(reducers, initialState);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};
