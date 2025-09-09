// scripts/migrate-local-to-mongo.js
const mongoose = require("mongoose");
const fs = require("fs");
const Review = require("../models/Review");
const User = require("../models/User");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/librosdb";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const data = JSON.parse(fs.readFileSync("data/reviews.json", "utf8"));
  for (const r of data) {
    // buscar o crear user por email placeholder
    let user = await User.findOne({ email: r.userEmail });
    if (!user) {
      user = await User.create({ email: r.userEmail || `user${Date.now()}@local`, password: "fakehashed" });
    }
    await Review.create({
      bookId: r.bookId,
      userId: user._id,
      title: r.title,
      content: r.content,
      rating: r.rating,
    });
  }
  console.log("Migration done");
  process.exit(0);
}

main().catch(console.error);
