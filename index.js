const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
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
    const CollectionOfUsers = client.db('BeautyParlarDB').collection('usersDB');
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Establish and verify connection
        const verifyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                res.status(401).send({ message: "unAuthorize Access" });
            }
            const token = req.headers.authorization.split(' ')[1];
            console.log(token)
             jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).send({ message: "unAuthorization Access" });
                }
                req.user = decoded;
                next();
            });
        }



        //create jwt token
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })

        //services related api
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await CollectionOfServices.insertOne(service);
            res.send(result);
        })

        app.get('/services',  async (req, res) => {
            const cursor = CollectionOfServices.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const service = await CollectionOfServices.findOne(query);
            res.send(service);
        });

        app.delete('/services/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await CollectionOfServices.deleteOne(query);
            res.send(result);
        })

        app.patch('/services/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updatedService = req.body;
            const updateDoc = {
                $set: {
                    title: updatedService.title,
                    price: updatedService.price,
                    description: updatedService.description,
                },
            };
            const result = await CollectionOfServices.updateOne(query, updateDoc);
            res.send(result);
        })

        //customer services related api
        app.post('/customerBooking', async (req, res) => {
            const customerBooking = req.body;
            const result = await CollectionOfCustomerBooking.insertOne(customerBooking);
            res.send(result);
        });
        //show all order list in admin dashboard
        app.get('/bookingList', verifyToken, async (req, res) => {
            const customerBooking = await CollectionOfCustomerBooking.find().toArray();
            res.send(customerBooking);
        })

        //show all booking of a customer
        app.get('/customerBooking', verifyToken, async (req, res) => {
            const booking = req.query.email;
            const filter = { email: booking };
            const result = await CollectionOfCustomerBooking.find(filter).toArray();
            res.send(result);
        });

        app.get('/customerBooking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
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

        //user related api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const exited = await CollectionOfUsers.findOne(filter)
            if (exited) {
                res.send({ message: 'User already exists' });
                return;
            }
            const result = await CollectionOfUsers.insertOne(user);
            res.send(result);
        });

        app.get('/users', verifyToken, async (req, res) => {
            const users = req.body;
            const result = await CollectionOfUsers.find(users).toArray();
            res.send(result);
        });

        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await CollectionOfUsers.findOne(query);
            res.send(user);
        })

        app.delete('/users/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await CollectionOfUsers.deleteOne(query);
            res.send(result);
        });



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