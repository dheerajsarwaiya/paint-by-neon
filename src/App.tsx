import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WhyAndHow from "./pages/WhyAndHow";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/why-and-how" element={<WhyAndHow />} />
    </Routes>
  );
}

export default App;
