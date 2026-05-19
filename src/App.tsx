import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading backend...");

  useEffect(() => {
    async function fetchMessage() {
      try {
        const response = await fetch("/api/hello");
        const data = await response.json();

        setMessage(data.message);
      } catch (error) {
        setMessage("Could not connect to backend");
      }
    }

    fetchMessage();
  }, []);

  return (
    <main>
      <h1>React + TypeScript + Node on Vercel</h1>
      <p>{message}</p>
    </main>
  );
}

export default App;