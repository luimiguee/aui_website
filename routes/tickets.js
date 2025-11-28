const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Ticket = require('../models/Ticket');

// @route   POST /api/tickets
// @desc    Create new ticket
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { category, priority, subject, description } = req.body;

        if (!category || !subject || !description) {
            return res.status(400).json({ 
                message: 'Categoria, assunto e descrição são obrigatórios' 
            });
        }

        // Generate ticket number
        const count = await Ticket.countDocuments();
        const ticketNumber = `#${String(count + 1).padStart(6, '0')}`;

        const ticket = new Ticket({
            user: req.user._id,
            ticketNumber,
            category,
            priority: priority || 'medium',
            subject,
            description,
            status: 'open'
        });

        await ticket.save();
        await ticket.populate('user', 'name email');

        res.status(201).json(ticket);

    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Erro ao criar ticket', error: error.message });
    }
});

// @route   GET /api/tickets
// @desc    Get user's tickets
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const query = { user: req.user._id };
        
        // Filtros opcionais
        if (req.query.status) query.status = req.query.status;
        if (req.query.category) query.category = req.query.category;
        if (req.query.priority) query.priority = req.query.priority;

        const tickets = await Ticket.find(query)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(tickets);

    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Erro ao buscar tickets' });
    }
});

// @route   GET /api/tickets/:id
// @desc    Get single ticket
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .populate('messages.sender', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket não encontrado' });
        }

        // Check if user owns this ticket or is admin
        if (ticket.user._id.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        res.json(ticket);

    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ message: 'Erro ao buscar ticket' });
    }
});

// @route   POST /api/tickets/:id/messages
// @desc    Add message to ticket
// @access  Private
router.post('/:id/messages', protect, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Mensagem é obrigatória' });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket não encontrado' });
        }

        // Check if user owns this ticket or is admin
        if (ticket.user.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        ticket.messages.push({
            sender: req.user._id,
            senderType: req.user.role === 'admin' || req.user.role === 'manager' ? 'admin' : 'user',
            message
        });

        // Se ticket estava resolvido, reabrir
        if (ticket.status === 'resolved' || ticket.status === 'closed') {
            ticket.status = 'waiting_response';
        }

        await ticket.save();
        await ticket.populate('messages.sender', 'name email');

        res.json(ticket);

    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ message: 'Erro ao adicionar mensagem' });
    }
});

// @route   PUT /api/tickets/:id/status
// @desc    Update ticket status
// @access  Private (Admin/Manager)
router.put('/:id/status', protect, authorize('admin', 'manager'), async (req, res) => {
    try {
        const { status } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket não encontrado' });
        }

        ticket.status = status;

        if (status === 'resolved') {
            ticket.resolvedAt = Date.now();
        } else if (status === 'closed') {
            ticket.closedAt = Date.now();
        }

        await ticket.save();

        res.json(ticket);

    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Erro ao atualizar status' });
    }
});

// @route   PUT /api/tickets/:id/assign
// @desc    Assign ticket to admin
// @access  Private (Admin/Manager)
router.put('/:id/assign', protect, authorize('admin', 'manager'), async (req, res) => {
    try {
        const { adminId } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket não encontrado' });
        }

        ticket.assignedTo = adminId;
        ticket.status = 'in_progress';
        
        await ticket.save();
        await ticket.populate('assignedTo', 'name email');

        res.json(ticket);

    } catch (error) {
        console.error('Error assigning ticket:', error);
        res.status(500).json({ message: 'Erro ao atribuir ticket' });
    }
});

// @route   GET /api/tickets/admin/all
// @desc    Get all tickets (Admin only)
// @access  Private (Admin/Manager)
router.get('/admin/all', protect, authorize('admin', 'manager'), async (req, res) => {
    try {
        const query = {};
        
        // Filtros opcionais
        if (req.query.status) query.status = req.query.status;
        if (req.query.category) query.category = req.query.category;
        if (req.query.priority) query.priority = req.query.priority;

        const tickets = await Ticket.find(query)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(tickets);

    } catch (error) {
        console.error('Error fetching admin tickets:', error);
        res.status(500).json({ message: 'Erro ao buscar tickets' });
    }
});

// @route   GET /api/tickets/admin/stats
// @desc    Get admin ticket statistics
// @access  Private (Admin/Manager)
router.get('/admin/stats', protect, authorize('admin', 'manager'), async (req, res) => {
    try {
        const stats = await Ticket.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    open: {
                        $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
                    },
                    in_progress: {
                        $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                    },
                    waiting_response: {
                        $sum: { $cond: [{ $eq: ['$status', 'waiting_response'] }, 1, 0] }
                    },
                    resolved: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    },
                    closed: {
                        $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                    },
                    urgent: {
                        $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json(stats[0] || {
            total: 0,
            open: 0,
            in_progress: 0,
            waiting_response: 0,
            resolved: 0,
            closed: 0,
            urgent: 0
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
});

// @route   GET /api/tickets/stats/user
// @desc    Get user ticket statistics
// @access  Private
router.get('/stats/user', protect, async (req, res) => {
    try {
        const stats = await Ticket.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    open: {
                        $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
                    },
                    in_progress: {
                        $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                    },
                    resolved: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    },
                    closed: {
                        $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json(stats[0] || {
            total: 0,
            open: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
});

// @route   POST /api/tickets/:id/reply
// @desc    Add reply to ticket (Admin)
// @access  Private/Admin
router.post('/:id/reply', protect, authorize('admin'), async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                message: 'Mensagem é obrigatória' 
            });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket não encontrado' });
        }

        // Adicionar mensagem
        ticket.messages.push({
            sender: req.user._id,
            senderType: 'admin',
            message: message.trim(),
            createdAt: new Date()
        });

        // Atualizar status se necessário
        if (ticket.status === 'open') {
            ticket.status = 'in_progress';
        }

        await ticket.save();
        await ticket.populate([
            { path: 'user', select: 'name email' },
            { path: 'messages.sender', select: 'name email role' }
        ]);

        res.json({
            success: true,
            message: 'Resposta enviada com sucesso',
            ticket
        });

    } catch (error) {
        console.error('Error replying to ticket:', error);
        res.status(500).json({ 
            message: 'Erro ao responder ticket', 
            error: error.message 
        });
    }
});

// @route   GET /api/tickets/:id/messages
// @desc    Get ticket messages
// @access  Private
router.get('/:id/messages', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('messages.sender', 'name email role');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket não encontrado' });
        }

        // Verificar se o usuário tem permissão
        if (req.user.role !== 'admin' && ticket.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        res.json({
            success: true,
            messages: ticket.messages
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ 
            message: 'Erro ao buscar mensagens', 
            error: error.message 
        });
    }
});

module.exports = router;

