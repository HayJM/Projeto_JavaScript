import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Books from './pages/Books';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Books />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Meu Perfil</h1>
                      <p className="text-gray-600 mt-4">Em desenvolvimento...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Carrinho de Compras</h1>
                      <p className="text-gray-600 mt-4">Em desenvolvimento...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Meus Pedidos</h1>
                      <p className="text-gray-600 mt-4">Em desenvolvimento...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute requireAdmin>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Painel Administrativo</h1>
                      <p className="text-gray-600 mt-4">Em desenvolvimento...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Page */}
              <Route 
                path="*" 
                element={
                  <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📚</div>
                      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Página não encontrada</p>
                      <a 
                        href="/" 
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Voltar ao Início
                      </a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
