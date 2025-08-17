const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Item = require('../models/Item');
const { updateItem, getItems, addItem, deleteItem } = require('../controllers/itemController');
const { expect } = chai;

chai.use(chaiHttp);

describe('AddItem Function Test - Lost & Found', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should create a new lost item successfully', async () => {
    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { 
        title: "Lost iPhone", 
        description: "Black iPhone lost in library", 
        type: "lost",
        category: "Electronics",
        location: "Library",
        dateLostFound: "2025-08-17"
      }
    };

    // Mock item that would be created
    const createdItem = { 
      _id: new mongoose.Types.ObjectId(), 
      ...req.body, 
      userId: req.user.id,
      status: 'open'
    };

    // Mock populated item
    const populatedItem = {
      ...createdItem,
      userId: { _id: req.user.id, name: 'Test User', studentNumber: 'n12345678' }
    };

    // Stub methods
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
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Item.create to throw an error
    const createStub = sinon.stub(Item, 'create').throws(new Error('DB Error'));

    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "Lost Item", type: "lost", category: "Other", location: "Campus", dateLostFound: "2025-08-17" }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addItem(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });

});

describe('GetItems Function Test - Lost & Found', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should return all items', async () => {
    // Mock item data
    const items = [
      { 
        _id: new mongoose.Types.ObjectId(), 
        title: "Lost Phone", 
        type: "lost",
        category: "Electronics",
        userId: { name: "User 1", studentNumber: "n11111111" }
      }
    ];

    // Mock the query chain
    const mockQuery = {
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves(items)
    };
    const findStub = sinon.stub(Item, 'find').returns(mockQuery);

    // Mock request & response
    const req = { 
      user: { id: new mongoose.Types.ObjectId() },
      query: {}
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getItems(req, res);

    // Assertions
    expect(findStub.calledOnce).to.be.true;
    expect(res.json.calledWith(items)).to.be.true;
  });

  it('should return 500 on error', async () => {
    // Stub Item.find to throw an error
    const findStub = sinon.stub(Item, 'find').throws(new Error('DB Error'));

    // Mock request & response
    const req = { 
      user: { id: new mongoose.Types.ObjectId() },
      query: {}
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getItems(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });

});

describe('UpdateItem Function Test - Lost & Found', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should update item successfully', async () => {
    // Mock item data
    const itemId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const existingItem = {
      _id: itemId,
      userId: userId,
      title: "Old Item",
      status: "open",
      save: sinon.stub().resolvesThis()
    };

    const updatedItem = { ...existingItem, title: "Updated Item", status: "claimed by owner" };

    // Stub methods
    const findOneStub = sinon.stub(Item, 'findOne').resolves(existingItem);
    const findByIdStub = sinon.stub(Item, 'findById').returns({
      populate: sinon.stub().resolves(updatedItem)
    });

    // Mock request & response
    const req = {
      params: { id: itemId },
      body: { title: "Updated Item", status: "claimed by owner" },
      user: { id: userId }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateItem(req, res);

    // Assertions
    expect(existingItem.title).to.equal("Updated Item");
    expect(existingItem.status).to.equal("claimed by owner");
    expect(existingItem.save.calledOnce).to.be.true;
    expect(res.json.calledWith(updatedItem)).to.be.true;
  });

  it('should return 404 if item is not found', async () => {
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
  });

  it('should return 500 on error', async () => {
    const findOneStub = sinon.stub(Item, 'findOne').throws(new Error('DB Error'));

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

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;
  });

});

describe('DeleteItem Function Test - Lost & Found', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should delete an item successfully', async () => {
    // Mock request data
    const itemId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const deletedItem = { _id: itemId, userId: userId, title: "Item to Delete" };

    // Stub Item.findOneAndDelete
    const findOneAndDeleteStub = sinon.stub(Item, 'findOneAndDelete').resolves(deletedItem);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    const req = { 
      params: { id: itemId },
      user: { id: userId }
    };

    // Call function
    await deleteItem(req, res);

    // Assertions
    expect(findOneAndDeleteStub.calledOnceWith({ _id: itemId, userId: userId })).to.be.true;
    expect(res.json.calledWith({ message: 'Item deleted successfully' })).to.be.true;
  });

  it('should return 404 if item is not found', async () => {
    // Stub to return null
    const findOneAndDeleteStub = sinon.stub(Item, 'findOneAndDelete').resolves(null);

    // Mock request data
    const req = { 
      params: { id: new mongoose.Types.ObjectId() },
      user: { id: new mongoose.Types.ObjectId() }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteItem(req, res);

    // Assertions
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Item not found' })).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    // Stub to throw an error
    const findOneAndDeleteStub = sinon.stub(Item, 'findOneAndDelete').throws(new Error('DB Error'));

    // Mock request data
    const req = { 
      params: { id: new mongoose.Types.ObjectId() },
      user: { id: new mongoose.Types.ObjectId() }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteItem(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });

});