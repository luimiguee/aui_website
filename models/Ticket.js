const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: [
      'technical',      // Problemas técnicos
      'billing',        // Faturação
      'orders',         // Pedidos
      'account',        // Conta
      'products',       // Produtos
      'shipping',       // Envios
      'returns',        // Devoluções
      'other'          // Outro
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_response', 'resolved', 'closed'],
    default: 'open'
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderType: {
      type: String,
      enum: ['user', 'admin'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    attachments: [{
      filename: String,
      url: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  closedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Gerar número de ticket automaticamente
ticketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);





