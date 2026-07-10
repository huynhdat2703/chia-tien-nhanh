import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateGroup from "./pages/CreateGroup";
import GroupPage from "./pages/GroupPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateGroup />} />
        <Route path="/g/:groupId" element={<GroupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
