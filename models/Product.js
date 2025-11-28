const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'Stock é obrigatório'],
    min: [0, 'Stock não pode ser negativo'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    required: [true, 'SKU é obrigatório']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/200'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Atualizar updatedAt antes de salvar
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);





