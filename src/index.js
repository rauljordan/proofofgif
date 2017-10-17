import express from 'express';
import bodyParser from 'body-parser';
import Blockchain from './blockchain';
import Random from './random';
import path from 'path';

const nodeId = Random.id();

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
  const lastBlock = blockchain.chain.slice(-1)[0];
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
  blockchain.registerNode(nodeId);
  return res.status(200).send({ 
    message: 'New Nodes Added',  
    nodeAddress: nodeId,
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
