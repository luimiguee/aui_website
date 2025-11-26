// Script para adicionar produtos de exemplo
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const productsData = [
    {
        name: 'MacBook Pro 14"',
        description: 'Potente laptop com chip M3 Pro, 16GB RAM e 512GB SSD. Perfeito para profissionais.',
        price: 2299.99,
        stock: 15,
        category: 'Computadores',
        sku: 'MAC-PRO-14-001',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
    },
    {
        name: 'iPhone 15 Pro Max',
        description: 'Smartphone topo de gama com câmara de 48MP e chip A17 Pro. 256GB.',
        price: 1399.99,
        stock: 25,
        category: 'Smartphones',
        sku: 'IPH-15-PRO-001',
        image: 'https://images.unsplash.com/photo-1592286927505-ab546c326f56?w=400'
    },
    {
        name: 'iPad Air 5ª Geração',
        description: 'Tablet versátil com chip M1, ecrã Liquid Retina de 10.9". 64GB Wi-Fi.',
        price: 699.99,
        stock: 30,
        category: 'Tablets',
        sku: 'IPAD-AIR-5-001',
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400'
    },
    {
        name: 'AirPods Pro 2',
        description: 'Auriculares sem fios com cancelamento ativo de ruído e áudio espacial.',
        price: 279.99,
        stock: 50,
        category: 'Áudio',
        sku: 'AIRP-PRO-2-001',
        image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400'
    },
    {
        name: 'Magic Keyboard',
        description: 'Teclado sem fios elegante com Touch ID e trackpad integrado.',
        price: 149.99,
        stock: 40,
        category: 'Periféricos',
        sku: 'MAG-KEY-001',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'
    },
    {
        name: 'Magic Mouse 2',
        description: 'Rato sem fios com superfície Multi-Touch e bateria recarregável.',
        price: 89.99,
        stock: 35,
        category: 'Periféricos',
        sku: 'MAG-MOU-2-001',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'
    },
    {
        name: 'Apple Watch Series 9',
        description: 'Smartwatch com GPS, ecrã Always-On e monitor de saúde avançado.',
        price: 449.99,
        stock: 20,
        category: 'Wearables',
        sku: 'AWA-S9-001',
        image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400'
    },
    {
        name: 'HomePod Mini',
        description: 'Coluna inteligente com som 360° e Siri integrada.',
        price: 99.99,
        stock: 45,
        category: 'Áudio',
        sku: 'HOMP-MINI-001',
        image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400'
    },
    {
        name: 'iMac 24" M3',
        description: 'Computador desktop all-in-one com ecrã 4.5K Retina e design fino.',
        price: 1499.99,
        stock: 10,
        category: 'Computadores',
        sku: 'IMAC-24-M3-001',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400'
    },
    {
        name: 'Apple Pencil 2ª Geração',
        description: 'Caneta digital com emparelhamento magnético e carregamento sem fios.',
        price: 139.99,
        stock: 60,
        category: 'Acessórios',
        sku: 'APENC-2-001',
        image: 'https://images.unsplash.com/photo-1611532736558-7bff3e2a6db4?w=400'
    },
    {
        name: 'PlayStation 5',
        description: 'Consola de jogos de última geração com SSD ultra-rápido. 825GB.',
        price: 549.99,
        stock: 8,
        category: 'Gaming',
        sku: 'PS5-STD-001',
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400'
    },
    {
        name: 'Xbox Series X',
        description: 'Consola gaming 4K com 1TB de armazenamento e retrocompatibilidade.',
        price: 499.99,
        stock: 12,
        category: 'Gaming',
        sku: 'XBX-SX-001',
        image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400'
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Smartphone Android premium com S Pen e câmara de 200MP.',
        price: 1299.99,
        stock: 18,
        category: 'Smartphones',
        sku: 'SAM-S24U-001',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'
    },
    {
        name: 'Dell XPS 15',
        description: 'Laptop premium com ecrã OLED 4K, Intel i7 e RTX 4050.',
        price: 1899.99,
        stock: 7,
        category: 'Computadores',
        sku: 'DELL-XPS15-001',
        image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400'
    },
    {
        name: 'Sony WH-1000XM5',
        description: 'Auscultadores premium com cancelamento de ruído líder de mercado.',
        price: 399.99,
        stock: 25,
        category: 'Áudio',
        sku: 'SONY-WH1000XM5-001',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        // Buscar admin como criador
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.error('❌ Admin não encontrado! Execute npm run create-admin primeiro.');
            process.exit(1);
        }

        console.log(`📦 Criando ${productsData.length} produtos...`);

        // Limpar produtos existentes (opcional)
        await Product.deleteMany({});
        console.log('🗑️  Produtos antigos removidos');

        // Criar novos produtos
        for (const productData of productsData) {
            const product = new Product({
                ...productData,
                createdBy: admin._id,
                isActive: true
            });
            await product.save();
            console.log(`   ✓ ${product.name}`);
        }

        console.log(`\n✅ ${productsData.length} produtos criados com sucesso!`);
        console.log('🌐 Acesse: http://localhost:3000');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

seedProducts();

