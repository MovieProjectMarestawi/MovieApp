import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<div></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
