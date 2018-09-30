/**
  Framework to work with Corrently Invest Tokens (CORI) in a similar way as
  with notes. Having CORI Tokens hold renewable generation capacity as a
  bound value and actual production over time as a derived (secondary)
  substition. Further reading: https://corrently.com/
*/
const ethers = require('ethers');

function CorrentlyNote() {
  const ERC20ABI = require('./ERC20ABI.json');
  const CORI_ADDRESS = '0x725b190bc077ffde17cf549aa8ba25e298550b18';
  const provider = ethers.getDefaultProvider();

  const _calculateEnergy = function(receipt) {
    if (typeof receipt.logs[0].energy !== 'undefined') {
      throw new Error('Receipt already has energy set');
    };
    if (typeof receipt.logs[0].timeStamp === 'undefined') {
      throw new Error('No Timestamp to calulate energy');
    };
    if (typeof receipt.balance === 'undefined') {
      throw new Error('No CORI Balance to calulate energy');
    };
    let totalEnergy = 0;
    let totalCori = 0;
    const d = new Date().getTime();
    for (let i = 0; i < receipt.logs.length; i++) {
      receipt.logs[i].energy = ((d - receipt.logs[0].timeStamp) / (8640000000 * 365)) * receipt.logs[i].ccori;
      totalEnergy += receipt.logs[i].energy;
      totalCori += receipt.logs[i].ccori;
    }
    if (totalCori !== receipt.balance) {
      throw new Error('Balance inconsitency detected');
    }
    receipt.energy = totalEnergy;
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
        receipt.logs = logs;
        resolve(receipt);
      });
    });
  };

  const _txReceipt = function(receipt) {
    return new Promise(function(resolve, reject) {
      if (typeof receipt.logs[0].transactionHash === 'undefined') {
        reject(new Error('Transaction Hash needs to be defined'));
      };
      if (typeof receipt.logs[0].txReceipt !== 'undefined') {
        reject(new Error('Transaction Receipt already set'));
      };

      const retrieve = function(txhash) {
        return new Promise(function(resolve2, reject2) {
          provider.getTransactionReceipt(txhash).then(function(txreceipt) {
            resolve2(txreceipt);
          });
        });
      };

      const itterate = function(i) {
        if (i < receipt.logs.length) {
          retrieve(receipt.logs[i].transactionHash).then(function(txreceipt) {
            receipt.logs[i].ccori = ethers.utils.bigNumberify(receipt.logs[i].data).toNumber();
            receipt.logs[i].txReceipt = txreceipt;
            i++;
            itterate(i);
          });
        } else {
          resolve(receipt);
        }
      };
      itterate(0);
    });
  };

  const _blockTime = function(receipt) {
    return new Promise(function(resolve, reject) {
      if (typeof receipt.logs[0].blockHash === 'undefined') {
        reject(new Error('BlockHash needs to be defined'));
      };
      if (typeof receipt.logs[0].timeStamp !== 'undefined') {
        reject(new Error('TimeStamp Receipt already set'));
      };

      const retrieve = function(blockHash) {
        return new Promise(function(resolve2, reject2) {
          provider.getBlock(blockHash).then(function(block) {
            resolve2(block.timestamp * 1000);
          });
        });
      };

      const itterate = function(i) {
        if (i < receipt.logs.length) {
          retrieve(receipt.logs[i].txReceipt.blockHash).then(function(timeStamp) {
            receipt.logs[i].timeStamp = timeStamp;
            i++;
            itterate(i);
          });
        } else {
          resolve(receipt);
        }
      };
      itterate(0);
    });
  };

  /**
  Get a ChequAccount with all required Blockchain based information
  */
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

  /**
  Create a new Check Account and return its private Key.
  Deposit will be the account belongig to given privateKey
  */
  const fileNote = function(privateKey, depostAmountCori) {
    return new Promise(function(resolve, reject) {
      if (depostAmountCori < 1) reject(new Error('Unable to send ' + depostAmountCori));
      let res = {};
      const wallet = new ethers.Wallet(privateKey, ethers.getDefaultProvider('homestead'));
      res.account = wallet.address;
      const noteWallet = ethers.Wallet.createRandom();
      res.noteAccount = noteWallet.address;
      res.notePrivateKey = noteWallet.privateKey;

      let cori_contract = new ethers.Contract(CORI_ADDRESS, ERC20ABI, wallet);
      _balanceOf(res).then(function(res) {
        if (res.balance < depostAmountCori) {
          reject(new Error('Sender does not have enough Cori to send'));
        }
        cori_contract.transfer(res.noteAccount, depostAmountCori).then(function(sxHash) {
          res.txHash = sxHash;
          resolve(res);
        }).catch(function(err) { reject(err); });
      });
    });
  };

  const init = function() {
  };

  return {
    getNoteByAccount: noteByAccount,
    fileNote: fileNote,
    init: init,
  };
};
export default CorrentlyNote;
