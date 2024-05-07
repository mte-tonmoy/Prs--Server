const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// const verifyJWT = (req, res, next) => {
//   const authorization = req.headers.authorization;
//   if (!authorization) {
//     return res
//       .status(401)
//       .send({ error: true, message: "unauthorized access" });
//   }
//   // bearer token
//   const token = authorization.split(" ")[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res
//         .status(401)
//         .send({ error: true, message: "unauthorized access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// };

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghizsnl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client
      .db("prsCollection")
      .collection("productData");
    const userDataCollection = client
      .db("prsCollection")
      .collection("userData");
    const requestedProductCollection = client
      .db("prsCollection")
      .collection("requestedProduct");

    // app.post("/jwt", (req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "1w",
    //   });

    //   res.send({ token });
    // });

    // admin apis
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;

      // if (req.decoded.email !== email) {
      //   res.send({ admin: false });
      // }

      const query = { email: email };
      const user = await userDataCollection.findOne(query);
      const result = { admin: user?.role === "Admin" };
      res.send(result);
    });

    // employee apis
    app.get("/users/employee/:email",  async (req, res) => {
      const email = req.params.email;

      // if (req.decoded.email !== email) {
      //   res.send({ employee: false });
      // }

      const query = { email: email };
      const user = await userDataCollection.findOne(query);
      const result = { employee: user?.role === "User" };
      res.send(result);
    });

    app.get("/myRequest", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }

      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res
      //     .status(403)
      //     .send({ error: true, message: "forbidden access" });
      // }

      const query = { userEmail: email };
      const result = await requestedProductCollection.find(query).toArray();
      res.send(result);
    });

    // StoreMan apis
    app.get("/users/storeMan/:email",  async (req, res) => {
      const email = req.params.email;

      // if (req.decoded.email !== email) {
      //   res.send({ storeMan: false });
      // }

      const query = { email: email };
      const user = await userDataCollection.findOne(query);
      const result = { storeMan: user?.role === "Store" };
      res.send(result);
    });

    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

     app.patch("/editProduct/:id", async (req, res) => {
       const id = req.params.id;
       const updateData = req.body;
       const filter = { _id: new ObjectId(id) };
       const updateDoc = { $set: updateData };

       const result = await productCollection.updateOne(filter, updateDoc);
       res.send(result);
     });
    
    app.get("/addPr", async (req, res) => {
      const cursor = requestedProductCollection.find({ status: "Approved" });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.patch("/addPrNo/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: updateData };

      const result = await requestedProductCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    // Manager apis
    app.get("/users/manager/:email",  async (req, res) => {
      const email = req.params.email;

      // if (req.decoded.email !== email) {
      //   res.send({ manager: false });
      // }

      const query = { email: email };
      const user = await userDataCollection.findOne(query);
      const result = { manager: user?.role === "Manager" };
      res.send(result);
    });

    app.patch("/request/approve/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "Approved",
        },
      };

      const result = await requestedProductCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    app.patch("/request/deny/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "Rejected",
        },
      };

      const result = await requestedProductCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    app.get("/requestedProduct", async (req, res) => {
      const cursor = requestedProductCollection.find({ status: "Requested" });
      const result = await cursor.toArray();
      res.send(result);
    });

    // product apis
    app.post("/addProduct", async (req, res) => {
      const addProduct = req.body;
      // console.log(addProduct);

      const result = await productCollection.insertOne(addProduct);
      res.send(result);
    });

    app.get("/allProduct", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/requestProduct", async (req, res) => {
      const addRequestedProduct = req.body;
      // console.log(addProduct);

      const result = await requestedProductCollection.insertOne(
        addRequestedProduct
      );
      res.send(result);
    });

    

    app.post("/addUser", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userDataCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await userDataCollection.insertOne(user);
      res.send(result);
    });


    app.get("/allUser", async (req, res) => {
      const cursor = userDataCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.patch("/users/approve/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          approval: "approve",
        },
      };

      const result = await userDataCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/users/denied/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          approval: "denied",
        },
      };

      const result = await userDataCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
