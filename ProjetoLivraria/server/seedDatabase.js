const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Book = require('./models/Book');
const User = require('./models/User');
const Order = require('./models/Order');

// Sample data
const sampleBooks = [
  {
    title: "O Senhor dos Anéis: A Sociedade do Anel",
    author: "J.R.R. Tolkien",
    isbn: "978-85-254-2370-8",
    description: "Uma épica jornada de fantasia que segue a busca para destruir o Um Anel e salvar a Terra Média. O primeiro volume da trilogia clássica que definiu o gênero fantasia.",
    price: 45.90,
    category: "Fantasy",
    stock: 25,
    publisher: "Martins Fontes",
    publishedDate: new Date("1954-07-29"),
    pages: 576,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/51EstVXM1UL._SX331_BO1,204,203,200_.jpg",
    rating: 4.8,
    featured: true,
    tags: ["fantasia", "aventura", "épico", "clássico"]
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-85-359-0277-4",
    description: "Um romance distópico que apresenta uma sociedade totalitária onde o governo controla todos os aspectos da vida. Uma obra profética sobre vigilância e controle social.",
    price: 32.50,
    category: "Fiction",
    stock: 30,
    publisher: "Companhia das Letras",
    publishedDate: new Date("1949-06-08"),
    pages: 416,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41E2HHV73VL._SX331_BO1,204,203,200_.jpg",
    rating: 4.7,
    featured: true,
    tags: ["distopia", "política", "clássico", "sociedade"]
  },
  {
    title: "Sapiens: Uma Breve História da Humanidade",
    author: "Yuval Noah Harari",
    isbn: "978-85-254-3959-4",
    description: "Uma análise fascinante da evolução humana, desde os primórdios até os dias atuais, explorando como nossa espécie conquistou o mundo.",
    price: 54.90,
    category: "History",
    stock: 20,
    publisher: "L&PM",
    publishedDate: new Date("2011-01-01"),
    pages: 464,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41QVJOGl14L._SX331_BO1,204,203,200_.jpg",
    rating: 4.6,
    featured: true,
    tags: ["história", "antropologia", "evolução", "sociedade"]
  },
  {
    title: "Clean Code: Manual de Desenvolvimento Ágil",
    author: "Robert C. Martin",
    isbn: "978-85-7608-312-1",
    description: "Um guia essencial para escrever código limpo e mantível. Técnicas e princípios fundamentais para desenvolvedores profissionais.",
    price: 89.90,
    category: "Technology",
    stock: 15,
    publisher: "Alta Books",
    publishedDate: new Date("2008-08-01"),
    pages: 464,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg",
    rating: 4.5,
    featured: false,
    tags: ["programação", "desenvolvimento", "qualidade", "software"]
  },
  {
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    isbn: "978-85-359-0158-6",
    description: "Uma fábula poética sobre um jovem príncipe que viaja de planeta em planeta, fazendo descobertas sobre a vida e a natureza humana.",
    price: 24.90,
    category: "Children",
    stock: 40,
    publisher: "Globo",
    publishedDate: new Date("1943-04-06"),
    pages: 96,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41joc8GGq4L._SX331_BO1,204,203,200_.jpg",
    rating: 4.9,
    featured: true,
    tags: ["infantil", "fábula", "filosofia", "clássico"]
  },
  {
    title: "Dom Casmurro",
    author: "Machado de Assis",
    isbn: "978-85-359-0842-4",
    description: "Obra-prima da literatura brasileira que narra a história de Bentinho e seu amor por Capitu, explorando temas como ciúme e dúvida.",
    price: 28.90,
    category: "Fiction",
    stock: 35,
    publisher: "Ática",
    publishedDate: new Date("1899-01-01"),
    pages: 256,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41HtL8Hq2QL._SX331_BO1,204,203,200_.jpg",
    rating: 4.3,
    featured: false,
    tags: ["literatura brasileira", "clássico", "romance", "realismo"]
  },
  {
    title: "Algoritmos: Teoria e Prática",
    author: "Thomas H. Cormen",
    isbn: "978-85-352-3699-6",
    description: "Referência completa em algoritmos e estruturas de dados, essencial para estudantes e profissionais de ciência da computação.",
    price: 279.90,
    category: "Technology",
    stock: 8,
    publisher: "Campus",
    publishedDate: new Date("2012-01-01"),
    pages: 944,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41T0ZWMQ1JL._SX376_BO1,204,203,200_.jpg",
    rating: 4.7,
    featured: false,
    tags: ["algoritmos", "computação", "matemática", "programação"]
  },
  {
    title: "O Alquimista",
    author: "Paulo Coelho",
    isbn: "978-85-254-1962-6",
    description: "A jornada de Santiago em busca de seu tesouro pessoal, uma história sobre seguir os sonhos e escutar o coração.",
    price: 34.90,
    category: "Fiction",
    stock: 50,
    publisher: "Rocco",
    publishedDate: new Date("1988-01-01"),
    pages: 163,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41QcjHKzmyL._SX331_BO1,204,203,200_.jpg",
    rating: 4.4,
    featured: true,
    tags: ["aventura", "filosofia", "sonhos", "jornada"]
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    isbn: "978-85-359-1944-4",
    description: "Biografia autorizada do co-fundador da Apple, revelando a personalidade complexa e a visão revolucionária de um dos maiores inovadores da história.",
    price: 49.90,
    category: "Biography",
    stock: 22,
    publisher: "Companhia das Letras",
    publishedDate: new Date("2011-10-24"),
    pages: 656,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41x7wnM8jUL._SX331_BO1,204,203,200_.jpg",
    rating: 4.6,
    featured: false,
    tags: ["biografia", "tecnologia", "inovação", "empreendedorismo"]
  },
  {
    title: "Cem Anos de Solidão",
    author: "Gabriel García Márquez",
    isbn: "978-85-01-08144-6",
    description: "A saga da família Buendía na fictícia cidade de Macondo, uma obra-prima do realismo mágico latino-americano.",
    price: 39.90,
    category: "Fiction",
    stock: 18,
    publisher: "Record",
    publishedDate: new Date("1967-05-30"),
    pages: 432,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41HZHDvZJoL._SX331_BO1,204,203,200_.jpg",
    rating: 4.5,
    featured: false,
    tags: ["realismo mágico", "literatura latino-americana", "família", "história"]
  },
  {
    title: "O Poder do Agora",
    author: "Eckhart Tolle",
    isbn: "978-85-7542-198-4",
    description: "Um guia espiritual para viver no presente e encontrar a paz interior através da consciência do momento atual.",
    price: 42.90,
    category: "Self-Help",
    stock: 28,
    publisher: "Sextante",
    publishedDate: new Date("1997-01-01"),
    pages: 256,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41NQQ8Ns6SL._SX331_BO1,204,203,200_.jpg",
    rating: 4.3,
    featured: false,
    tags: ["espiritualidade", "mindfulness", "autoajuda", "presente"]
  },
  {
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    isbn: "978-85-325-1101-4",
    description: "O início da jornada mágica de Harry Potter, um garoto órfão que descobre ser um bruxo em seu 11º aniversário.",
    price: 37.90,
    category: "Fantasy",
    stock: 45,
    publisher: "Rocco",
    publishedDate: new Date("1997-06-26"),
    pages: 264,
    language: "Portuguese",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/41lDHMwNgyL._SX331_BO1,204,203,200_.jpg",
    rating: 4.8,
    featured: true,
    tags: ["magia", "aventura", "escola", "amizade"]
  }
];

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@bookstore.com",
    password: "admin123",
    role: "admin",
    address: {
      street: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      country: "Brazil"
    },
    phone: "+55 11 99999-9999",
    preferences: {
      newsletter: true,
      notifications: true,
      favoriteGenres: ["Technology", "Business", "Science"]
    },
    emailVerified: true,
    isActive: true
  },
  {
    name: "João Silva",
    email: "joao.silva@email.com",
    password: "password123",
    role: "user",
    address: {
      street: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      country: "Brazil"
    },
    phone: "+55 11 98888-8888",
    preferences: {
      newsletter: true,
      notifications: true,
      favoriteGenres: ["Fiction", "Fantasy", "History"]
    },
    emailVerified: true,
    isActive: true
  },
  {
    name: "Maria Santos",
    email: "maria.santos@email.com",
    password: "password123",
    role: "user",
    address: {
      street: "Rua dos Três Irmãos, 456",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22011-040",
      country: "Brazil"
    },
    phone: "+55 21 97777-7777",
    preferences: {
      newsletter: false,
      notifications: true,
      favoriteGenres: ["Romance", "Self-Help", "Biography"]
    },
    emailVerified: true,
    isActive: true
  },
  {
    name: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    password: "password123",
    role: "user",
    address: {
      street: "Rua das Palmeiras, 789",
      city: "Belo Horizonte",
      state: "MG",
      zipCode: "30112-000",
      country: "Brazil"
    },
    phone: "+55 31 96666-6666",
    preferences: {
      newsletter: true,
      notifications: false,
      favoriteGenres: ["Technology", "Science", "Education"]
    },
    emailVerified: true,
    isActive: true
  },
  {
    name: "Ana Costa",
    email: "ana.costa@email.com",
    password: "password123",
    role: "user",
    address: {
      street: "Av. Beira Mar, 321",
      city: "Fortaleza",
      state: "CE",
      zipCode: "60165-121",
      country: "Brazil"
    },
    phone: "+55 85 95555-5555",
    preferences: {
      newsletter: true,
      notifications: true,
      favoriteGenres: ["Children", "Fiction", "Fantasy"]
    },
    emailVerified: true,
    isActive: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Add reviews to books
const addReviewsToBooks = async (books, users) => {
  const reviews = [
    { rating: 5, comment: "Livro excepcional! Uma leitura obrigatória." },
    { rating: 4, comment: "Muito bom, recomendo para todos." },
    { rating: 5, comment: "Obra-prima da literatura. Impressionante!" },
    { rating: 3, comment: "Bom livro, mas esperava mais." },
    { rating: 4, comment: "Gostei muito da história e dos personagens." },
    { rating: 5, comment: "Mudou minha perspectiva sobre o assunto." },
    { rating: 4, comment: "Bem escrito e envolvente." },
    { rating: 5, comment: "Um dos melhores livros que já li!" },
    { rating: 3, comment: "Interessante, mas um pouco lento." },
    { rating: 4, comment: "Recomendo para quem gosta do gênero." }
  ];

  for (let book of books) {
    // Add 2-5 random reviews to each book
    const numReviews = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < numReviews; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
      
      book.reviews.push({
        user: randomUser._id,
        rating: randomReview.rating,
        comment: randomReview.comment,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
    }
    
    // Calculate average rating
    if (book.reviews.length > 0) {
      const totalRating = book.reviews.reduce((acc, review) => acc + review.rating, 0);
      book.rating = (totalRating / book.reviews.length).toFixed(1);
    }
  }
  
  return books;
};

// Create sample orders
const createSampleOrders = async (users, books) => {
  const orders = [];
  
  // Create 10 sample orders
  for (let i = 0; i < 10; i++) {
    const user = users[Math.floor(Math.random() * (users.length - 1)) + 1]; // Exclude admin
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
    const orderItems = [];
    
    // Select random books for the order
    const selectedBooks = [];
    for (let j = 0; j < numItems; j++) {
      let randomBook;
      do {
        randomBook = books[Math.floor(Math.random() * books.length)];
      } while (selectedBooks.includes(randomBook._id));
      
      selectedBooks.push(randomBook._id);
      
      const quantity = Math.floor(Math.random() * 3) + 1;
      orderItems.push({
        book: randomBook._id,
        quantity: quantity,
        price: randomBook.price,
        title: randomBook.title,
        author: randomBook.author
      });
    }
    
    const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingCost = subtotal >= 100 ? 0 : 15;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + shippingCost + tax;
    
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const paymentMethods = ['credit_card', 'debit_card', 'pix', 'boleto'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    const order = {
      user: user._id,
      orderNumber: `BK${Date.now()}${i.toString().padStart(3, '0')}`,
      items: orderItems,
      subtotal: subtotal,
      totalAmount: totalAmount,
      tax: tax,
      status: status,
      paymentInfo: {
        method: paymentMethod,
        status: status === 'delivered' ? 'completed' : 'pending',
        transactionId: `TXN${Date.now()}${i}`,
        paidAt: status === 'delivered' ? new Date() : null
      },
      shippingAddress: {
        name: user.name,
        street: user.address.street,
        city: user.address.city,
        state: user.address.state,
        zipCode: user.address.zipCode,
        country: user.address.country,
        phone: user.phone
      },
      shippingInfo: {
        method: 'standard',
        cost: shippingCost,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        trackingNumber: status === 'shipped' || status === 'delivered' ? `BR${Date.now()}${i}` : null,
        shippedAt: status === 'shipped' || status === 'delivered' ? new Date() : null,
        deliveredAt: status === 'delivered' ? new Date() : null
      },
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
      statusHistory: [{
        status: 'pending',
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        note: 'Order created'
      }]
    };
    
    orders.push(order);
  }
  
  return orders;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing data...');
    await Book.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    
    console.log('👥 Creating users...');
    const users = await User.create(sampleUsers);
    console.log(`✅ Created ${users.length} users`);
    
    console.log('📚 Creating books...');
    let books = await Book.create(sampleBooks);
    console.log(`✅ Created ${books.length} books`);
    
    console.log('⭐ Adding reviews to books...');
    books = await addReviewsToBooks(books, users);
    
    // Save books with reviews
    for (let book of books) {
      await book.save();
    }
    console.log('✅ Added reviews to books');
    
    console.log('🛒 Creating sample orders...');
    const sampleOrders = await createSampleOrders(users, books);
    const orders = await Order.create(sampleOrders);
    console.log(`✅ Created ${orders.length} orders`);
    
    console.log('🎯 Adding books to user wishlists and carts...');
    
    // Add books to wishlists
    for (let i = 1; i < users.length; i++) { // Skip admin
      const user = users[i];
      const wishlistBooks = books.slice(0, 3); // Add first 3 books to wishlist
      user.wishlist = wishlistBooks.map(book => book._id);
      
      // Add books to cart
      const cartBooks = books.slice(3, 5); // Add 2 books to cart
      user.cart = cartBooks.map(book => ({
        book: book._id,
        quantity: Math.floor(Math.random() * 3) + 1
      }));
      
      await user.save();
    }
    
    console.log('✅ Added books to user wishlists and carts');
    
    // Display summary
    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📚 Books: ${books.length}`);
    console.log(`   🛒 Orders: ${orders.length}`);
    console.log('\n🔐 Admin credentials:');
    console.log('   Email: admin@bookstore.com');
    console.log('   Password: admin123');
    console.log('\n👤 Test user credentials:');
    console.log('   Email: joao.silva@email.com');
    console.log('   Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
