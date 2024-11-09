import React, { createContext, useContext } from "react";
import PubSub from "pubsub-js";

const PubSubContext = createContext(PubSub);

export const usePubSub = () => {
  return useContext(PubSubContext);
};

export const PubSubProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <PubSubContext.Provider value={PubSub}>{children}</PubSubContext.Provider>
  );
};
