import React from "react";
import { WalletConnectionProvider } from "./contexts/WalletConnectionProvider";
import Home from "./components/Home";

function App() {
  return (
    <WalletConnectionProvider>
      <Home />
    </WalletConnectionProvider>
  );
}

export default App;
