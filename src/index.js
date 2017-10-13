import express from 'express';
import bodyParser from 'body-parser';
import Blockchain from './blockchain';
import uuidv4 from 'uuid/v4';
import path from 'path';

const nodeId = uuidv4().replace(/-/g, '')

const blockchain = new Blockchain()

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/../public'));

app.get('/blockchain', (req, res) => {
  const data = {
    chain: blockchain.chain,
    length: blockchain.chain.length
  };
  return res.status(200).send(data);
});

app.post('/mine', (req, res) => {
  const { gif } = req.body;
  const lastBlock = blockchain.lastBlock();
  const lastProof = lastBlock.proof;
  const proof = blockchain.proofOfWork(lastProof);

  // // Coinbase: we receive a reward for finding the proof
  blockchain.newTransaction('0', nodeId, 1);

  const block = blockchain.newBlock(proof, gif);
  const blockData = {
    message: 'Block Added to the Chain',
    index: block['index'],
    transactions: block['transactions'],
    proof: block['proof'],
    previousHash: block['previousHash'],
    timestamp: block['timestamp'],
    data: gif,
  };
  return res.status(200).send(blockData);
});

app.post('/new/transaction', (req, res) => {
  const { sender, recipient, amount } = req.body;
  if (!sender || !recipient || !amount) {
    return res.status(500).send('Missing Values');
  }
  const idx = blockchain.newTransaction(sender, recipient, amount);
  return res.status(200).send(`Transaction Will Be Added to Block ${idx}`);
});

app.post('/node/register', (req, res) => {
  const { nodes } = req.body;
  if (!nodes) {
    return res.status(500).send('Error: Node List Required');
  }
  if (!nodes.length) {
    return res.status(500).send('Error: Node List Required');
  }
  for (let i = 0; i < nodes.length; i++) {
    blockchain.registerNode(nodes[i]);
  }
  return res.status(200).send({ 
    message: 'New Nodes Added',  
    totalNodes: blockchain.nodes,
  });
});

app.get('/consensus', async (req, res) => {
  const replaced = await blockchain.resolveConflicts();
  if (replaced) {
    res.status(200).send({
      message: 'A New Blockchain Has Been Selected',
      newChain: blockchain.chain,
    });
  }
  else {
    res.status(200).send({
      message: 'No New Blockchain',
      chain: blockchain.chain,
    });
  }  
});

app.get('/volume/mined', (req, res) => {
  const volume = blockchain.totalMintedVolume();
  return res.status(200).send({
    message: `Total Volume of Coins Mined is ${volume}`,
    volume,
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Now Listening Port ' + process.env.PORT || 3000);
});
