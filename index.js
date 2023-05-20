const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jfgylgi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((error) => {
      if (error) {
        console.log(error);
        return;
      }
    });

    const toysCollection = client.db("toysDB").collection("toys");

    // all toys routes
    app.get("/alltoys", async (req, res) => {
      const query = {};
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: {
          toy_name: 1,
          seller_name: 1,
          sub_category: 1,
          price: 1,
          quantity: 1,
        },
      };
      const result = await toysCollection
        .find(query, options)
        .limit(20)
        .toArray();
      res.send(result);
    });

    // shop by category
    app.get("/category-toys", async (req, res) => {
      const query = {};
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: {
          toy_name: 1,
          toy_img: 1,
          sub_category: 1,
          price: 1,
          rating: 1,
        },
      };
      const result = await toysCollection.find(query, options).toArray();
      res.send(result);
    });

    // Single toy details route
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // My toys route
    app.get("/my-toys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { seller_email: req.query.email };
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    // Add a toy post
    app.post("/add-toy", async (req, res) => {
      const newToy = req.body;
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toys kingdom server is running");
});

app.listen(port, () => {
  console.log(`Toys kingdom server is running on port ${port}`);
});
