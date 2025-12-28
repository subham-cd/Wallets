import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";
import transactionRoute from "./routes/transaction.route.js";
import job from "./config/cron.js";

dotenv.config();

const app = express();

if(process.env.NODE_ENV === "production")job.start();

app.use(ratelimiter);
app.use(express.json());

const PORT = process.env.PORT || 5001;

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initializing DB", error);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.send("its working");
});

app.get("api/health",(req,res)=>{
  res.status(200).json({status:"ok"})
})

app.use("/api/transactions", transactionRoute);



initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  });
});
