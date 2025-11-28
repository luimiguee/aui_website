const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        
        // Check if email is already taken by another user
        if (email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email já está em uso' });
            }
        }
        
        user.name = name || user.name;
        user.email = email || user.email;
        user.updatedAt = Date.now();
        
        await user.save();
        
        const updatedUser = await User.findById(user._id).select('-password');
        res.json(updatedUser);
        
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
});

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Senha atual e nova senha são obrigatórias' 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Nova senha deve ter pelo menos 6 caracteres' 
            });
        }
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        
        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Senha atual incorreta' });
        }
        
        // Update password
        user.password = newPassword;
        user.updatedAt = Date.now();
        await user.save();
        
        res.json({ message: 'Senha atualizada com sucesso' });
        
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
});

// @route   GET /api/users/addresses
// @desc    Get user addresses
// @access  Private
router.get('/addresses', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('addresses');
        res.json(user.addresses || []);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Erro ao buscar moradas' });
    }
});

// @route   POST /api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', protect, async (req, res) => {
    try {
        const { name, phone, street, city, postalCode, country, isDefault } = req.body;
        
        if (!name || !phone || !street || !city || !postalCode) {
            return res.status(400).json({ 
                message: 'Todos os campos são obrigatórios' 
            });
        }
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        
        // If this is default, unset all others
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }
        
        // If this is the first address, make it default
        const makeDefault = user.addresses.length === 0 || isDefault;
        
        user.addresses.push({
            name,
            phone,
            street,
            city,
            postalCode,
            country: country || 'PT',
            isDefault: makeDefault
        });
        
        await user.save();
        
        res.status(201).json(user.addresses);
        
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Erro ao adicionar morada' });
    }
});

// @route   PUT /api/users/addresses/:id
// @desc    Update address
// @access  Private
router.put('/addresses/:id', protect, async (req, res) => {
    try {
        const { name, phone, street, city, postalCode, country, isDefault } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        
        const address = user.addresses.id(req.params.id);
        
        if (!address) {
            return res.status(404).json({ message: 'Morada não encontrada' });
        }
        
        // If this is being set as default, unset all others
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }
        
        address.name = name || address.name;
        address.phone = phone || address.phone;
        address.street = street || address.street;
        address.city = city || address.city;
        address.postalCode = postalCode || address.postalCode;
        address.country = country || address.country;
        if (isDefault !== undefined) address.isDefault = isDefault;
        
        await user.save();
        
        res.json(user.addresses);
        
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Erro ao atualizar morada' });
    }
});

// @route   DELETE /api/users/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/addresses/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        
        const address = user.addresses.id(req.params.id);
        
        if (!address) {
            return res.status(404).json({ message: 'Morada não encontrada' });
        }
        
        const wasDefault = address.isDefault;
        
        // Remove address using pull
        user.addresses.pull(req.params.id);
        
        // If we deleted the default address, make the first one default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }
        
        await user.save();
        
        res.json(user.addresses);
        
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Erro ao eliminar morada' });
    }
});

module.exports = router;





