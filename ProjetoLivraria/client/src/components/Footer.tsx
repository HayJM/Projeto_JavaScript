import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sobre a BookStore</h3>
            <p className="text-gray-300 text-sm">
              Sua livraria online de confiança. Oferecemos os melhores livros 
              com entrega rápida e preços competitivos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="/shipping" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Política de Entrega
                </a>
              </li>
              <li>
                <a href="/returns" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Trocas e Devoluções
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <a href="/books?category=ficção" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Ficção
                </a>
              </li>
              <li>
                <a href="/books?category=tecnologia" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Tecnologia
                </a>
              </li>
              <li>
                <a href="/books?category=romance" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Romance
                </a>
              </li>
              <li>
                <a href="/books?category=biografia" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Biografia
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">
                📧 contato@bookstore.com
              </p>
              <p className="text-gray-300 text-sm">
                📞 (11) 9999-9999
              </p>
              <p className="text-gray-300 text-sm">
                📍 São Paulo, SP
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            © 2025 BookStore. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
