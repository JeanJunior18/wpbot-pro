const app = require('./app');

const PORT = process.env.PORT || 3333;
app.server.listen(PORT, () => {
  console.log('Server is running on PORT ', PORT);
});
