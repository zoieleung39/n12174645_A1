const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Item = require('../models/Item');
const { updateItem, getItems, addItem, deleteItem } = require('../controllers/itemController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

describe('AddItem Function Test - Lost & Found', () => {

  it('should create a new lost item successfully', async () => {
    // Mock request data for lost item
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { 
        title: "Lost iPhone 15", 
        description: "Black iPhone 15 Pro lost in library", 
        type: "lost",
        category: "Electronics",
        location: "Library 2nd floor",
        dateLostFound: "2025-08-17",
        color: "Black",
        brand: "Apple"
      }
    };

    // Mock item that would be created
    const createdItem = { 
      _id: new mongoose.Types.ObjectId(), 
      userId: req.user.id,
      ...req.body,
      dateLostFound: new Date(req.body.dateLostFound),
      status: 'open'
    };

    // Mock populated item (what findById would return)
    const populatedItem = {
      ...createdItem,
      userId: {
        _id: req.user.id,
        name: 'Test User',
        studentNumber: 'n12345678'
      }
    };

    // Stub Item.create and Item.findById
    const createStub = sinon.stub(Item, 'create').resolves(createdItem);
    const findByIdStub = sinon.stub(Item, 'findById').returns({
      populate: sinon.stub().resolves(populatedItem)
    });

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addItem(req, res);

    // Assertions
    expect(createStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(populatedItem)).to.be.true;

    // Restore stubbed methods
    createStub.restore();
    findByIdStub.restore();
  });

  it('should create a new found item successfully', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { 
        title: "Found Keys", 
        description: "Set of keys found near cafeteria", 
        type: "found",
        category: "Keys",
        location: "Cafeteria entrance",
        dateLostFound: "2025-08-17",
        color: "Silver"
      }
    };

    const createdItem = { 
      _id: new mongoose.Types.ObjectId(), 
      userId: req.user.id,
      ...req.body,
      dateLostFound: new Date(req.body.dateLostFound),
      status: 'open'
    };

    const populatedItem = {
      ...createdItem,
      userId: {
        _id: req.user.id,
        name: 'Test User',
        studentNumber: 'n12345678'
      }
    };

    const createStub = sinon.stub(Item, 'create').resolves(createdItem);
    const findByIdStub = sinon.stub(Item, 'findById').returns({
      populate: sinon.stub().resolves(populatedItem)
    });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addItem(req, res);

    expect(createStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(populatedItem)).to.be.true;

    createStub.restore();
    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const createStub = sinon.stub(Item, 'create').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { 
        title: "Lost Item", 
        type: "lost",
        category: "Other",
        location: "Campus",
        dateLostFound: "2025-08-17"
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addItem(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    createStub.restore();
  });

});

describe('GetItems Function Test - Lost & Found', () => {

  it('should return all items when no filter is applied', async () => {
    const items = [
      { 
        _id: new mongoose.Types.ObjectId(), 
        title: "Lost Phone", 
        type: "lost",
        category: "Electronics",
        userId: { name: "User 1", studentNumber: "n11111111" }
      },
      { 
        _id: new mongoose.Types.ObjectId(), 
        title: "Found Wallet", 
        type: "found",
        category: "Other",
        userId: { name: "User 2", studentNumber: "n22222222" }
      }
    ];

    // Mock the chained methods
    const mockQuery = {
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves(items)
    };
    const findStub = sinon.stub(Item, 'find').returns(mockQuery);

    const req = { 
      user: { id: new mongoose.Types.ObjectId() },
      query: {} // No filters
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getItems(req, res);

    expect(findStub.calledOnceWith({})).to.be.true;
    expect(mockQuery.populate.calledWith('userId', 'name studentNumber')).to.be.true;
    expect(mockQuery.sort.calledWith({ createdAt: -1 })).to.be.true;
    expect(res.json.calledWith(items)).to.be.true;

    findStub.restore();
  });

  it('should filter items by type (lost)', async () => {
    const lostItems = [
      { 
        _id: new mongoose.Types.ObjectId(), 
        title: "Lost Phone", 
        type: "lost",
        userId: { name: "User 1", studentNumber: "n11111111" }
      }
    ];

    const mockQuery = {
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves(lostItems)
    };
    const findStub = sinon.stub(Item, 'find').returns(mockQuery);

    const req = { 
      user: { id: new mongoose.Types.ObjectId() },
      query: { type: 'lost' }
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getItems(req, res);

    expect(findStub.calledOnceWith({ type: 'lost', status: 'open' })).to.be.true;
    expect(res.json.calledWith(lostItems)).to.be.true;

    findStub.restore();
  });

  it('should filter items by category', async () => {
    const electronicsItems = [
      { 
        _id: new mongoose.Types.ObjectId(), 
        title: "Lost Phone", 
        category: "Electronics",
        userId: { name: "User 1", studentNumber: "n11111111" }
      }
    ];

    const mockQuery = {
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves(electronicsItems)
    };
    const findStub = sinon.stub(Item, 'find').returns(mockQuery);

    const req = { 
      user: { id: new mongoose.Types.ObjectId() },
      query: { category: 'Electronics' }
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getItems(req, res);

    expect(findStub.calledOnceWith({ category: 'Electronics', status: 'open' })).to.be.true;
    expect(res.json.calledWith(electronicsItems)).to.be.true;

    findStub.restore();
  });

  it('should return user items when userId=mine', async () => {
    const userId = new mongoose.Types.ObjectId();
    const userItems = [
      { 
        _id: new mongoose.Types.ObjectId(), 
        title: "My Lost Phone", 
        userId: { _id: userId, name: "Current User", studentNumber: "n12345678" }
      }
    ];

    const mockQuery = {
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves(userItems)
    };
    const findStub = sinon.stub(Item, 'find').returns(mockQuery);

    const req = { 
      user: { id: userId },
      query: { userId: 'mine' }
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getItems(req, res);

    expect(findStub.calledOnceWith({ userId: userId, status: 'open' })).to.be.true;
    expect(res.json.calledWith(userItems)).to.be.true;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Item, 'find').throws(new Error('DB Error'));

    const req = { 
      user: { id: new mongoose.Types.ObjectId() },
      query: {}
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getItems(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });

});

describe('UpdateItem Function Test - Lost & Found', () => {

  it('should update item successfully', async () => {
    const itemId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    
    const existingItem = {
      _id: itemId,
      userId: userId,
      title: "Old Item",
      description: "Old Description",
      type: "lost",
      category: "Electronics",
      location: "Library",
      status: "open",
      save: sinon.stub().resolvesThis()
    };

    const updatedItem = {
      ...existingItem,
      title: "Updated Item",
      description: "Updated Description",
      status: "claimed by owner",
      userId: {
        _id: userId,
        name: 'Test User',
        studentNumber: 'n12345678'
      }
    };

    const findOneStub = sinon.stub(Item, 'findOne').resolves(existingItem);
    const findByIdStub = sinon.stub(Item, 'findById').returns({
      populate: sinon.stub().resolves(updatedItem)
    });

    const req = {
      params: { id: itemId },
      body: { 
        title: "Updated Item", 
        description: "Updated Description",
        status: "claimed by owner"
      },
      user: { id: userId }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    await updateItem(req, res);

    expect(existingItem.title).to.equal("Updated Item");
    expect(existingItem.description).to.equal("Updated Description");
    expect(existingItem.status).to.equal("claimed by owner");
    expect(existingItem.save.calledOnce).to.be.true;
    expect(res.json.calledWith(updatedItem)).to.be.true;

    findOneStub.restore();
    findByIdStub.restore();
  });

  it('should return 404 if item is not found or not owned by user', async () => {
    const findOneStub = sinon.stub(Item, 'findOne').resolves(null);

    const req = { 
      params: { id: new mongoose.Types.ObjectId() }, 
      body: {},
      user: { id: new mongoose.Types.ObjectId() }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateItem(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Item not found' })).to.be.true;

    findOneStub.restore();
  });

  it('should handle date field updates', async () => {
    const itemId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    
    const existingItem = {
      _id: itemId,
      userId: userId,
      dateLostFound: new Date('2025-08-01'),
      save: sinon.stub().resolvesThis()
    };

    const updatedItem = { ...existingItem, userId: { name: 'Test User' } };

    const findOneStub = sinon.stub(Item, 'findOne').resolves(existingItem);
    const findByIdStub = sinon.stub(Item, 'findById').returns({
      populate: sinon.stub().resolves(updatedItem)
    });

    const req = {
      params: { id: itemId },
      body: { dateLostFound: "2025-08-17" },
      user: { id: userId }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    await updateItem(req, res);

    expect(existingItem.dateLostFound).to.be.a('date');
    expect(existingItem.save.calledOnce).to.be.true;

    findOneStub.restore();
    findByIdStub.restore();
  });

});

describe('DeleteItem Function Test - Lost & Found', () => {

  it('should delete an item successfully', async () => {
    const itemId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const deletedItem = {
      _id: itemId,
      userId: userId,
      title: "Item to Delete"
    };

    const findOneAndDeleteStub = sinon.stub(Item, 'findOneAndDelete').resolves(deletedItem);

    const req = { 
      params: { id: itemId },
      user: { id: userId }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteItem(req, res);

    expect(findOneAndDeleteStub.calledOnceWith({ 
      _id: itemId, 
      userId: userId 
    })).to.be.true;
    expect(res.json.calledWith({ message: 'Item deleted successfully' })).to.be.true;

    findOneAndDeleteStub.restore();
  });

  it('should return 404 if item is not found or not owned by user', async () => {
    const findOneAndDeleteStub = sinon.stub(Item, 'findOneAndDelete').resolves(null);

    const req = { 
      params: { id: new mongoose.Types.ObjectId() },
      user: { id: new mongoose.Types.ObjectId() }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteItem(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Item not found' })).to.be.true;

    findOneAndDeleteStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const findOneAndDeleteStub = sinon.stub(Item, 'findOneAndDelete').throws(new Error('DB Error'));

    const req = { 
      params: { id: new mongoose.Types.ObjectId() },
      user: { id: new mongoose.Types.ObjectId() }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteItem(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findOneAndDeleteStub.restore();
  });

});