const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize, checkPermission } = require('../middleware/auth');

// ================ GESTÃO DE UTILIZADORES ================

// Rotas protegidas requerem autenticação

// Listar todos os utilizadores
router.get('/users', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar utilizadores',
      error: error.message
    });
  }
});

// Atualizar role e permissões de um utilizador
router.put('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, permissions } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, permissions, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Role e permissões atualizadas',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar utilizador',
      error: error.message
    });
  }
});

// Ativar/Desativar utilizador
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado'
      });
    }

    res.json({
      success: true,
      message: `Utilizador ${isActive ? 'ativado' : 'desativado'}`,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status',
      error: error.message
    });
  }
});

// Eliminar utilizador
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Utilizador eliminado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao eliminar utilizador',
      error: error.message
    });
  }
});

// ================ GESTÃO DE PRODUTOS ================

// Listar todos os produtos (público para a homepage)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos',
      error: error.message
    });
  }
});

// Criar novo produto
router.post('/products', protect, checkPermission('manage_products'), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar produto',
      error: error.message
    });
  }
});

// Atualizar produto
router.put('/products/:id', protect, checkPermission('manage_products'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar produto',
      error: error.message
    });
  }
});

// Eliminar produto
router.delete('/products/:id', protect, checkPermission('manage_products'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Produto eliminado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao eliminar produto',
      error: error.message
    });
  }
});

// ================ GESTÃO DE PEDIDOS ================

// Listar todos os pedidos
router.get('/orders', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar pedidos',
      error: error.message
    });
  }
});

// Criar novo pedido
router.post('/orders', protect, checkPermission('manage_orders'), async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      createdBy: req.user._id
    };

    const order = new Order(orderData);
    await order.save();

    // Atualizar stock dos produtos
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pedido',
      error: error.message
    });
  }
});

// Atualizar status do pedido
router.put('/orders/:id/status', protect, checkPermission('manage_orders'), async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus, updatedAt: Date.now() },
      { new: true }
    ).populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Status do pedido atualizado',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar pedido',
      error: error.message
    });
  }
});

// Obter estatísticas do dashboard
router.get('/stats', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        lowStockProducts,
        totalRevenue: totalRevenue.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
});

module.exports = router;

