import express from 'express';
import Blockchain from 'blockchain';

const blockchain = Blockchain()

const app = express();

app.get('/chain', (req, res) => {
  const data = {
    chain: blockchain.chain,
    length: blockchain.chain.length
  };
  return res.status(200).send(data);
});

app.listen(3000, () => {
  console.log('Now Listening on Port 3000');
});
