const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        console.log('📦 Recebendo pedido:', JSON.stringify(req.body, null, 2));
        
        const {
            products,
            shippingAddress,
            shippingMethod,
            paymentMethod,
            subtotal,
            shippingCost,
            discount,
            promoCode,
            totalAmount
        } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            console.log('❌ Produtos inválidos:', products);
            return res.status(400).json({ 
                message: 'Carrinho vazio ou inválido' 
            });
        }

        // Validate products stock
        for (let item of products) {
            console.log('🔍 Verificando produto:', item.product);
            const product = await Product.findById(item.product);
            
            if (!product) {
                console.log('❌ Produto não encontrado:', item.product);
                return res.status(404).json({ 
                    message: `Produto não encontrado: ${item.product}` 
                });
            }
            
            if (!product.isActive) {
                return res.status(400).json({ 
                    message: `Produto não disponível: ${product.name}` 
                });
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Stock insuficiente para: ${product.name}. Disponível: ${product.stock}` 
                });
            }
        }

        // Create order (orderNumber é gerado automaticamente pelo pre-save hook)
        console.log('✅ Todos os produtos validados. Criando pedido...');
        
        const order = new Order({
            customer: req.user._id,
            items: products.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price
            })),
            shippingAddress,
            shippingMethod,
            paymentMethod,
            subtotal,
            shippingCost,
            discount,
            promoCode,
            totalAmount,
            status: 'pending',
            paymentStatus: paymentMethod === 'card' || paymentMethod === 'paypal' ? 'paid' : 'pending',
            createdBy: req.user._id
        });

        console.log('💾 Salvando pedido no banco...');
        await order.save();
        console.log('✅ Pedido salvo com sucesso! ID:', order._id);

        // Update product stock
        for (let item of products) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Populate order details
        await order.populate('items.product', 'name imageUrl');
        await order.populate('customer', 'name email');

        console.log('📤 Enviando resposta ao cliente...');
        res.status(201).json(order);

    } catch (error) {
        console.error('❌ ERRO AO CRIAR PEDIDO:');
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        console.error('Body recebido:', JSON.stringify(req.body, null, 2));
        
        res.status(500).json({ 
            message: 'Erro ao criar pedido', 
            error: error.message,
            details: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : []
        });
    }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id })
            .populate('items.product', 'name imageUrl price')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Erro ao buscar pedidos' });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name imageUrl price')
            .populate('customer', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        // Check if user owns this order or is admin
        if (order.customer._id.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Erro ao buscar pedido' });
    }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        // Check if user owns this order
        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        // Check if order can be cancelled
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return res.status(400).json({ 
                message: 'Este pedido não pode ser cancelado' 
            });
        }

        order.status = 'cancelled';
        await order.save();

        // Restore product stock
        for (let item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }
            );
        }

        res.json(order);
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Erro ao cancelar pedido' });
    }
});

// @route   GET /api/orders/stats/user
// @desc    Get user order statistics
// @access  Private
router.get('/stats/user', protect, async (req, res) => {
    try {
        const stats = await Order.aggregate([
            { $match: { customer: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    completedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json(stats[0] || {
            totalOrders: 0,
            totalSpent: 0,
            pendingOrders: 0,
            completedOrders: 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
});

module.exports = router;

