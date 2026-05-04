import { Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Admission } from "./pages/Admission";
import { Admin } from "./pages/Admin";
import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";
import { Status } from "./pages/Status";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/status" element={<Status />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
