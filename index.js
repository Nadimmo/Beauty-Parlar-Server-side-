const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USEr}:${process.env.DB_PASSWORD}@cluster0.rrkijcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    const CollectionOfServices = client.db('BeautyParlarDB').collection('servicesDB');
    const CollectionOfCustomerBooking = client.db('BeautyParlarDB').collection('customerBookingDB');
    const CollectionOfReview = client.db('BeautyParlarDB').collection('reviewDB');
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    //services related api
    app.post('/services', async(req,res)=>{
        const service = req.body;
        const result = await CollectionOfServices.insertOne(service);
        res.send(result);
    })

    app.get('/services', async (req, res) => {
        const cursor = CollectionOfServices.find({});
        const services = await cursor.toArray();
        res.send(services);
    });

    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const service = await CollectionOfServices.findOne(query);
        res.send(service);
    });

    //customer services related api
    app.post('/customerBooking', async (req, res) => {
        const customerBooking = req.body;
        const result = await CollectionOfCustomerBooking.insertOne(customerBooking);
        res.send(result);
    });

    app.get('/bookingList', async (req, res) => {
        const customerBooking = await CollectionOfCustomerBooking.find().toArray();
        res.send(customerBooking);
    })

    //show all booking of a customer
    app.get('/customerBooking', async (req, res) => {
        const booking = req.query.email;
        const filter = {email: booking};
        const result = await CollectionOfCustomerBooking.find(filter).toArray();
        res.send(result);
    });

    app.get('/customerBooking/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const customerBooking = await CollectionOfCustomerBooking.findOne(query);
        res.send(customerBooking);
    });

    //review related api
    app.post('/reviews', async (req, res) => {
        const review = req.body;
        const result = await CollectionOfReview.insertOne(review);
        res.send(result);
    });
    app.get('/reviews', async (req, res) => {
        const reviews = await CollectionOfReview.find().toArray();
        res.send(reviews);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})