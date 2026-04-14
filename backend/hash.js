const bcrypt = require('bcrypt');

bcrypt.hash('541604', 10).then(hash => {
  console.log(hash);
});
