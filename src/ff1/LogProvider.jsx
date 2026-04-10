import React, { createContext, useContext } from "react";


// *************   CONTEXT  ***************
const LogContext = createContext();
export const useLog = () => useContext(LogContext);
export const LogProvider = ({ children }) => {
    const [log, setLog] = React.useState([]);
    const addLog=(logEntry)=>{
        setLog(l=>{
            return l.concat(logEntry);
        })
    }

    return <LogContext.Provider value={{ log,addLog }}>
        {children}
    </LogContext.Provider>;
};
