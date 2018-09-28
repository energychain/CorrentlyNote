'use strict';
/**
  Framework to work with Corrently Invest Tokens (CORI) in a similar way as
  with notes. Having CORI Tokens hold renewable generation capacity as a
  bound value and actual production over time as a derived (secondary)
  substition. Further reading: https://corrently.com/
*/

module.exports = function() {
  const ERC20ABI = require('./ERC20ABI.json');
  const CORI_ADDRESS = '0x725b190bc077ffde17cf549aa8ba25e298550b18';
  const ethers = require('ethers');
  const provider = ethers.providers.getDefaultProvider();

  const _calculateEnergy = function(receipt) {
    if (typeof receipt.energy !== 'undefined') {
      throw new Error('Receipt already has energy set');
    };
    if (typeof receipt.timeStamp === 'undefined') {
      throw new Error('No Timestamp to calulate energy');
    };
    if (typeof receipt.balance === 'undefined') {
      throw new Error('No CORI Balance to calulate energy');
    };
    const d = new Date().getTime();
    receipt.energy = ((d - receipt.timeStamp) / (86400000 * 365)) * receipt.balance;
    return receipt;
  };

  const _balanceOf = function(receipt) {
    const cori_contract = new ethers.Contract(CORI_ADDRESS, ERC20ABI, provider);
    return new Promise(function(resolve, reject) {
      if (typeof receipt.account === 'undefined') {
        reject(new Error('Account needs to be defined'));
      };
      if (typeof receipt.balance !== 'undefined') {
        reject(new Error('Balance already has energy set'));
      };
      cori_contract.balanceOf(receipt.account).then(function(cori_balance) {
        receipt.balance = cori_balance.toString() * 1;
        resolve(receipt);
      });
    });
  };

  const _txCnt = function(receipt) {
    return new Promise(function(resolve, reject) {
      if (typeof receipt.account === 'undefined') {
        reject(new Error('Account needs to be defined'));
      };
      if (typeof receipt.txcnt !== 'undefined') {
        reject(new Error('Transaction Count already set'));
      };
      provider.getTransactionCount(receipt.account, 'latest')
        .then(function(tx_cnt) {
          receipt.txcnt = tx_cnt;
          resolve(receipt);
        });
    });
  };

  const _logs = function(receipt) {
    return new Promise(function(resolve, reject) {
      if (typeof receipt.account === 'undefined') {
        reject(new Error('Account needs to be defined'));
      };
      if (typeof receipt.logs !== 'undefined') {
        reject(new Error('Logs already set'));
      };
      provider.getLogs({
        fromBlock: 6000000,
        address: CORI_ADDRESS,
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          null,
          '0x000000000000000000000000' + receipt.account.substr(2),
        ],
      }).then(function(logs) {
        receipt.removed = logs[0].removed;
        receipt.txHash = logs[0].transactionHash;
        receipt.blockHash = logs[0].blockHash;
        receipt.event_cnt = logs.length;
        resolve(receipt);
      });
    });
  };

  const _txReceipt = function(receipt) {
    return new Promise(function(resolve, reject) {
      if (typeof receipt.txHash === 'undefined') {
        reject(new Error('Transaction Hash needs to be defined'));
      };
      if (typeof receipt.txReceipt !== 'undefined') {
        reject(new Error('Transaction Receipt already set'));
      };
      provider.getTransactionReceipt(receipt.txHash).then(function(txreceipt) {
        receipt.txReceipt = txreceipt;
        resolve(receipt);
      });
    });
  };

  const _blockTime = function(receipt) {
    return new Promise(function(resolve, reject) {
      if (typeof receipt.blockHash === 'undefined') {
        reject(new Error('BlockHash needs to be defined'));
      };
      if (typeof receipt.timeStamp !== 'undefined') {
        reject(new Error('TimeStamp Receipt already set'));
      };
      provider.getBlock(receipt.blockHash).then(function(block) {
        receipt.timeStamp = block.timestamp * 1000;
        resolve(receipt);
      });
    });
  };

  const noteByAccount = function(account) {
    return new Promise(function(resolve, reject) {
      let res = {};
      res.account = account;
      _txCnt(res).then(function(res) {
        _balanceOf(res).then(function(res) {
          _logs(res).then(function(res) {
            _txReceipt(res).then(function(res) {
              _blockTime(res).then(function(res) {
                res = _calculateEnergy(res);
                resolve(res);
              });
            });
          });
        });
      });
    });
  };

  return {
    getNoteByAccount: noteByAccount,
  };
};
