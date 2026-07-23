const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const r = await mongoose.connection.db.collection('companies').updateMany(
    {},
    { $addToSet: { enabledProducts: 'docsign' } }
  );
  console.log('updated', r.modifiedCount, 'of', r.matchedCount);
  const sample = await mongoose.connection.db.collection('companies')
    .find({}, { projection: { name: 1, enabledProducts: 1 } })
    .limit(5)
    .toArray();
  console.log(JSON.stringify(sample, null, 2));
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
