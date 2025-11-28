const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar ao MongoDB Local
const MONGODB_URI = 'mongodb://localhost:27017/aui_website';

// Importar modelos
const User = require('./models/User');
const Product = require('./models/Product');

async function populateDatabase() {
  try {
    console.log('🔌 Conectando ao MongoDB Local...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado!\n');

    // Verificar se já existe admin
    const existingAdmin = await User.findOne({ email: 'adminmp@aui.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin já existe!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nome: ${existingAdmin.name}\n`);
    } else {
      // Criar admin
      console.log('👤 Criando usuário admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        name: 'Miguel Pato',
        email: 'adminmp@aui.com',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true
      });
      console.log('✅ Admin criado!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Senha: admin123\n`);
    }

    // Verificar se já existem produtos
    const existingProducts = await Product.countDocuments();
    
    if (existingProducts > 0) {
      console.log(`✅ ${existingProducts} produtos já existem na base de dados!\n`);
    } else {
      // Criar produtos
      console.log('📦 Criando produtos...');
      
      const admin = await User.findOne({ email: 'adminmp@aui.com' });
      
      const products = [
        {
          name: 'MacBook Pro 14"',
          description: 'Potente laptop com chip M3 Pro, 16GB RAM e 512GB SSD. Perfeito para profissionais.',
          price: 2299.99,
          stock: 15,
          category: 'Computadores',
          sku: 'MAC-PRO-14-001',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'iPhone 15 Pro Max',
          description: 'Smartphone topo de gama com câmara de 48MP e chip A17 Pro. 256GB.',
          price: 1399.99,
          stock: 25,
          category: 'Smartphones',
          sku: 'IPH-15-PRO-001',
          image: 'https://images.unsplash.com/photo-1592286927505-ab546c326f56?w=400',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'iPad Air 5ª Geração',
          description: 'Tablet versátil com chip M1, ecrã Liquid Retina de 10.9". 64GB Wi-Fi.',
          price: 699.99,
          stock: 30,
          category: 'Tablets',
          sku: 'IPAD-AIR-5-001',
          image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'AirPods Pro 2',
          description: 'Auriculares sem fios com cancelamento ativo de ruído e áudio espacial.',
          price: 279.99,
          stock: 50,
          category: 'Áudio',
          sku: 'AIRP-PRO-2-001',
          image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Apple Watch Series 9',
          description: 'Smartwatch com GPS, ecrã Always-On e monitor de saúde avançado.',
          price: 449.99,
          stock: 20,
          category: 'Wearables',
          sku: 'AWA-S9-001',
          image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Magic Keyboard',
          description: 'Teclado sem fios elegante com Touch ID e trackpad integrado.',
          price: 149.99,
          stock: 40,
          category: 'Periféricos',
          sku: 'MAG-KEY-001',
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Magic Mouse 2',
          description: 'Rato sem fios com superfície Multi-Touch e bateria recarregável.',
          price: 89.99,
          stock: 35,
          category: 'Periféricos',
          sku: 'MAG-MOU-2-001',
          image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'HomePod Mini',
          description: 'Coluna inteligente com som 360° e Siri integrada.',
          price: 99.99,
          stock: 45,
          category: 'Áudio',
          sku: 'HOMP-MINI-001',
          image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'iMac 24" M3',
          description: 'Computador desktop all-in-one com ecrã 4.5K Retina e design fino.',
          price: 1499.99,
          stock: 10,
          category: 'Computadores',
          sku: 'IMAC-24-M3-001',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Apple Pencil 2ª Geração',
          description: 'Caneta digital com emparelhamento magnético e carregamento sem fios.',
          price: 139.99,
          stock: 60,
          category: 'Acessórios',
          sku: 'APENC-2-001',
          image: 'https://images.unsplash.com/photo-1611532736558-7bff3e2a6db4?w=400',
          isActive: true,
          createdBy: admin._id
        }
      ];

      await Product.insertMany(products);
      console.log(`✅ ${products.length} produtos criados!\n`);
    }

    // Mostrar resumo
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    console.log('📊 RESUMO DA BASE DE DADOS:');
    console.log('=' .repeat(50));
    console.log(`👥 Usuários: ${totalUsers} (${totalAdmins} admins)`);
    console.log(`📦 Produtos: ${totalProducts}`);
    console.log('='.repeat(50));
    console.log('\n✅ Base de dados pronta!\n');

    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

populateDatabase();


