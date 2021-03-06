const SHA256 = require('crypto-js/sha256');

class Transaction{
  constructor(fromAddress, toAddress, amount){
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Block{
  constructor(timestamp, transactions, previousHash = ''){
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash(){
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
  }

  mineBlock(difficulty){
    while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("block mined: " + this.hash);

  }
}

class Blockchain{
  constructor(){
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock(){
    return new Block("09/06/2018", [], "0");
  }

  getLatestBlock(){
    return this.chain[this.chain.length-1];
  }

  minePendingTransactions(miningRewardAddress){
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ]
  }

  createTransaction(transaction){
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address){
    let balance = 0;

    for(const block of this.chain){
      for(const trans of block.transactions){
        if(trans.fromAddress === address){
          balance -= trans.amount;
        }

        if(trans.toAddress === address){
          balance += trans.amount;
        }
      }
    }
    return balance;
  }

  isChainValid(){
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if(currentBlock.hash !== currentBlock.calculateHash()){
        return false;
      }

      if(currentBlock.previousHash !== previousBlock.hash){
        return false;
      }
    }
    return true;
  }
}

let jcoin = new Blockchain();
jcoin.createTransaction(new Transaction('address1', 'address2', 50));
jcoin.createTransaction(new Transaction('address2', 'address1', 20));

console.log('\n starting the miner...');
jcoin.minePendingTransactions('john-address');
console.log('\nBalance of John is', jcoin.getBalanceOfAddress('john-address'));

console.log('\n starting the miner again...');
jcoin.minePendingTransactions('john-address');
console.log('\nBalance of John is', jcoin.getBalanceOfAddress('john-address'));

console.log(JSON.stringify(jcoin, null, 4));
console.log('Is blockchain valid? ' + jcoin.isChainValid());
