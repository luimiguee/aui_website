const mongoose = require('mongoose');

// Conectar ao MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/aui_website';

async function viewDatabase() {
  try {
    console.log('🔌 Conectando ao MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Listar todas as coleções
    const collections = await db.listCollections().toArray();
    
    console.log('📊 BASE DE DADOS: aui_website\n');
    console.log('=' .repeat(60));
    console.log(`Total de coleções: ${collections.length}\n`);
    
    if (collections.length === 0) {
      console.log('⚠️  Base de dados vazia (ainda não foram criados dados)');
      await mongoose.disconnect();
      return;
    }
    
    // Para cada coleção, mostrar estatísticas
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await db.collection(collectionName).countDocuments();
      
      console.log(`\n📁 ${collectionName.toUpperCase()}`);
      console.log('-'.repeat(60));
      console.log(`   Total de documentos: ${count}`);
      
      if (count > 0 && count <= 5) {
        // Se tiver poucos documentos, mostra todos
        const docs = await db.collection(collectionName).find({}).limit(5).toArray();
        console.log('   Dados:');
        docs.forEach((doc, index) => {
          console.log(`   ${index + 1}.`, JSON.stringify(doc, null, 2).split('\n').join('\n      '));
        });
      } else if (count > 0) {
        // Se tiver muitos, mostra apenas os primeiros 2
        const docs = await db.collection(collectionName).find({}).limit(2).toArray();
        console.log('   Primeiros 2 documentos:');
        docs.forEach((doc, index) => {
          console.log(`   ${index + 1}.`, JSON.stringify(doc, null, 2).split('\n').join('\n      '));
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Visualização completa!\n');
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

viewDatabase();


