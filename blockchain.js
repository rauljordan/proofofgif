import stringify from 'json-stable-stringify';
import sha256 from 'crypto-js/sha256';

export default class Blockchain {
  constructor() {
    this.chain = [];
    this.currentTransactions = [];

    this.newBlock(previousHash = 1, proof = 100);
  }

  newBlock(proof, previousHash = null) {
    /**
     * Creates a new block for the blockchain
     * @proof: the proof from proof of work
     * @previousHash: the hash of the previous block
     * return: new block
     */
    const block = {
      index: this.chain.length + 1,
      timestamp: new Date().getTime() / 1000,
      transactions: self.currentTransactions,
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

  static validProof(lastProof, proof) {
    /**
     * Validates the proof via sha256. 
     * Does hash(lastProof, proof) contain 4 leading zeros?
     */
    const guess = String(lastProof * proof);
    const guess_hash = sha256(guess);
    return guess_hash[0] === '0' && 
      guess_hash[1] === '0' &&
      guess_hash[2] === '0' &&
      guess_hash[3] === '0';
  }

  static hash(block) {
    const blockString = stringify(block);
    return sha256(blockString);
  }

  static lastBlock() {
    return this.chain[this.chain.length - 1];
  }
}
