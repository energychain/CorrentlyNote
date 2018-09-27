/**
  Framework to work with Corrently Invest Tokens (CORI) in a similar way as
  with notes. Having CORI Tokens hold renewable generation capacity as a
  bound value and actual production over time as a derived (secondary)
  substition. Further reading: https://corrently.com/
*/
'use strict';

module.exports = function() {
  const ERC20ABI = require('./ERC20ABI.json');
  const CORI_ADDRESS = '0x725b190bc077ffde17cf549aa8ba25e298550b18';
  const ethers = require('ethers');
  const provider = ethers.providers.getDefaultProvider();

  const getNote = function(account) {
    return new Promise(function(resolve, reject) {
      let res = {};
      provider.getTransactionCount(account, 'latest')
        .then(function(tx_cnt) {
          const cori_contract = new ethers.Contract(CORI_ADDRESS, ERC20ABI, provider);
          res.tx_cnt = tx_cnt;
          cori_contract.balanceOf(account).then(function(cori_balance) {
            res.cori_balance = cori_balance.toString() * 1;
            provider.getLogs({
              fromBlock: 6000000,
              address: CORI_ADDRESS,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                null,
                '0x000000000000000000000000' + account.substr(2),
              ],
            }).then(function(logs) {
              res.removed = logs[0].removed;
              provider.getTransactionReceipt(logs[0].transactionHash).then(function(receipt) {
                provider.getBlock(logs[0].blockHash).then(function(block) {
                  res.timeStamp = block.timestamp * 1000;
                  let d = new Date().getTime();
                  res.energy = ((d - res.timeStamp) / (86400000 * 365)) * res.cori_balance;
                  resolve(res);
                });
              });
            });
          });
        });
    });
  };

  return {
    getNote: getNote,
  };
};
