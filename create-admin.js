// Script para criar o primeiro utilizador admin
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Dados do admin
    const adminData = {
      name: 'Admin',
      email: 'admin@aui.com',
      password: 'admin123', // Será encriptada automaticamente
      role: 'admin',
      permissions: ['manage_users', 'manage_products', 'manage_orders', 'view_reports', 'manage_settings'],
      isActive: true
    };

    // Verificar se já existe
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin já existe!');
      console.log('Email:', adminData.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Criar admin
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');
    console.log('\n⚠️  IMPORTANTE: Altere a password após o primeiro login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createAdmin();

