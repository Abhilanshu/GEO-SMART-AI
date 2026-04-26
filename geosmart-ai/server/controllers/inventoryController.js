const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Inventory.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.seedInventory = async (req, res) => {
    try {
        const seedData = [
            { item: 'Food Packets', quantity: 5000, unit: 'pkts', category: 'Food', warehouseLocation: { address: 'Indore Hub' } },
            { item: 'First Aid Kits', quantity: 1200, unit: 'kits', category: 'Medical', warehouseLocation: { address: 'Delhi Central' } },
            { item: 'Rescue Boats', quantity: 15, unit: 'units', category: 'Tools', warehouseLocation: { address: 'Mumbai Port' } },
            { item: 'Drinking Water', quantity: 10000, unit: 'liters', category: 'Water', warehouseLocation: { address: 'Chennai Depot' } }
        ];
        await Inventory.deleteMany({});
        const items = await Inventory.insertMany(seedData);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
