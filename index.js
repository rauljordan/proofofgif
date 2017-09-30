import express from 'express';
import bodyParser from 'body-parser';
import Blockchain from './blockchain';
import uuidv4 from 'uuid/v4';

const nodeIdentifier = uuidv4().replace(/-/g, '')
console.log(`Your Node Identifier Is: ${nodeIdentifier}`);

const blockchain = new Blockchain()

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/chain', (req, res) => {
  const data = {
    chain: blockchain.chain,
    length: blockchain.chain.length
  };
  return res.status(200).send(data);
});

app.get('/mine', (req, res) => {
  const lastBlock = blockchain.lastBlock();
  const lastProof = lastBlock.proof;
  const proof = blockchain.proofOfWork(lastProof);

  // Coinbase: we receive a reward for finding the proof
  // Sender is 0 to signify this node has mined a new coin
  blockchain.newTransaction('0', nodeIdentifier, 1);

  const block = blockchain.newBlock(proof);
  const data = {
    message: 'New Block Forged',
    index: block['index'],
    transactions: block['transactions'],
    proof: block['proof'],
    previousHash: block['previousHash'],
  };
  return res.status(200).send(data);
});

app.post('/new/transaction', (req, res) => {
  const { sender, recipient, amount } = req.body;
  if (!sender || !recipient || !amount) {
    return res.status(500).send('Missing Values');
  }
  const idx = blockchain.newTransaction(sender, recipient, amount);
  return res.status(200).send(`Transaction Will Be Added to Block ${idx}`);
});

app.listen(3000, () => {
  console.log('Now Listening on Port 3000');
});
