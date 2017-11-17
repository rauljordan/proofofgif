import stringify from 'json-stable-stringify';
import sha256 from 'crypto-js/sha256';
import CryptoJS from 'crypto-js';
import fetch from 'node-fetch';

export default class Blockchain {

  constructor() {
    this.chain = [];
    this.currentTransactions = [];
    this.nodes = new Set();

    // Genesis Block
    this.newBlock(100, 'no gif here');
  }

  registerNode(address) {
    /**
     * Adds a node to the list of nodes
     */
    this.nodes.add(address);
  }

  validChain(chain) {
    /**
     * Determine if a given blockchain is valid
     */
    let lastBlock = chain[0];
    let currentIndex = 1;
    while (currentIndex < chain.length) {
      let block = chain[currentIndex];

      // Check that the hash of the last block is correct
      if (block.previousHash !== this.hash(lastBlock)) {
        return false;
      }

      // Check that the proof of work is correct
      if (!this.validProof(lastBlock.proof, block.proof)) {
        return false;
      }

      lastBlock = block;
      currentIndex += 1;
    }

    return true;
  }

  async resolveConflicts() {
    /**
     * This is our consensus algorithm. It resolves conflicts by replacing
     * the chain with the longest chain in the network
     * return: true if chain was replaced
     */
    const neighbors = this.nodes;
    let newChain = null;

    // We only look for chains longer than ours
    let maxLength = this.chain.length;
    for (let x of neighbors) {
      const response = await fetch(`${x}/blockchain`);
      const neighborChain = await response.json();

      let { length, chain } = neighborChain;
      if (length > maxLength && this.validChain(chain)) {
        maxLength = length;
        newChain = chain;
      }
    }

    if (newChain) {
      this.chain = newChain;
      return true;
    }

    return false;
  }

  newBlock(proof, gif, previousHash=null) {
    /**
     * Creates a new block for the blockchain
     * @proof: the proof from proof of work
     * @previousHash: the hash of the previous block
     * return: new block
     */
    const block = {
      index: this.chain.length + 1,
      timestamp: Math.round(new Date().getTime() / 1000),
      transactions: this.currentTransactions,
      data: gif,
      proof,
      previousHash: previousHash ? previousHash : this.hash(this.chain[this.chain.length - 1])
    };

    // Resets the list of current transactions
    this.currentTransactions = [];
    this.chain.push(block);

    return block;
  }

  newTransaction(sender, recipient, amount) {
    /**
     * Creates a new transaction to go into the next mined block
     * @sender: address of the sender
     * @recipient: address of the recipient
     * @amount: amount being sent
     * return: index of the block that will hold this transaction
     */
    this.currentTransactions.push({
      sender,
      recipient,
      amount,
    });

    return this.lastBlock()['index'] + 1;
  }

  proofOfWork(lastProof) {
    /**
     * find a number p' such that hash(p * p') contains leading 4 zeros, where p
     * is the previous p'.
     * p is the previous proof and p' is the new proof
     */
    let proof = 0;
    while (!this.validProof(lastProof, proof)) {
      proof += 1;
    }
    return proof;
  }

  totalVolumeMined() {
    return this.chain.reduce((prev, curr) => {
      if (!curr.transactions) {
        return prev;
      }
      const amounts = curr.transactions.reduce((p, c) => {
        return p + c.amount;
      }, 0);
      return prev + amounts;
    }, 0);
  }

  validProof(lastProof, proof) {
    /**
     * Validates the proof via sha256.
     * Does hash(lastProof, proof) contain 4 leading zeros?
     */
    const guess = String(lastProof * proof);
    const guess_hash = sha256(guess).toString(CryptoJS.enc.Hex);
    return guess_hash[0] === '0' &&
      guess_hash[1] === '0' &&
      guess_hash[2] === '0' &&
      guess_hash[3] === '0';
  }

  hash(block) {
    const blockString = stringify(block);
    return sha256(blockString).toString(CryptoJS.enc.Hex);
  }

  lastBlock() {
    const res =  this.chain.slice(-1)[0];
    return res;
  }
}
