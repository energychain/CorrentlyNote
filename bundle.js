!function(e){function t(e){Object.defineProperty(this,e,{enumerable:!0,get:function(){return this[v][e]}})}function r(e){if("undefined"!=typeof System&&System.isModule?System.isModule(e):"[object Module]"===Object.prototype.toString.call(e))return e;var t={default:e,__useDefault:e};if(e&&e.__esModule)for(var r in e)Object.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return new o(t)}function o(e){Object.defineProperty(this,v,{value:e}),Object.keys(e).forEach(t,this)}function n(e){return"@node/"===e.substr(0,6)?c(e,r(m(e.substr(6))),{}):p[e]}function u(e){var t=n(e);if(!t)throw new Error('Module "'+e+'" expected, but not contained in build.');if(t.module)return t.module;var r=t.linkRecord;return i(t,r),a(t,r,[]),t.module}function i(e,t){if(!t.depLoads){t.declare&&d(e,t),t.depLoads=[];for(var r=0;r<t.deps.length;r++){var o=n(t.deps[r]);t.depLoads.push(o),o.linkRecord&&i(o,o.linkRecord);var u=t.setters&&t.setters[r];u&&(u(o.module||o.linkRecord.moduleObj),o.importerSetters.push(u))}return e}}function d(t,r){var o=r.moduleObj,n=t.importerSetters,u=!1,i=r.declare.call(e,function(e,t){if(!u){if("object"==typeof e)for(var r in e)"__useDefault"!==r&&(o[r]=e[r]);else o[e]=t;u=!0;for(var i=0;i<n.length;i++)n[i](o);return u=!1,t}},{id:t.key});"function"!=typeof i?(r.setters=i.setters,r.execute=i.execute):(r.setters=[],r.execute=i)}function l(e,t,r){return p[e]={key:e,module:void 0,importerSetters:[],linkRecord:{deps:t,depLoads:void 0,declare:r,setters:void 0,execute:void 0,moduleObj:{}}}}function f(e,t,r,o){var n={};return p[e]={key:e,module:void 0,importerSetters:[],linkRecord:{deps:t,depLoads:void 0,declare:void 0,execute:o,executingRequire:r,moduleObj:{default:n,__useDefault:n},setters:void 0}}}function s(e,t,r){return function(o){for(var n=0;n<e.length;n++)if(e[n]===o){var u,i=t[n],d=i.linkRecord;return u=d?-1===r.indexOf(i)?a(i,d,r):d.moduleObj:i.module,"__useDefault"in u?u.__useDefault:u}}}function a(t,r,n){if(n.push(t),t.module)return t.module;var u;if(r.setters){for(var i=0;i<r.deps.length;i++){var d=r.depLoads[i],l=d.linkRecord;l&&-1===n.indexOf(d)&&(u=a(d,l,l.setters?n:[]))}r.execute.call(y)}else{var f={id:t.key},c=r.moduleObj;Object.defineProperty(f,"exports",{configurable:!0,set:function(e){c.default=c.__useDefault=e},get:function(){return c.__useDefault}});var p=s(r.deps,r.depLoads,n);if(!r.executingRequire)for(var i=0;i<r.deps.length;i++)p(r.deps[i]);var v=r.execute.call(e,p,c.__useDefault,f);void 0!==v?c.default=c.__useDefault=v:f.exports!==c.__useDefault&&(c.default=c.__useDefault=f.exports);var m=c.__useDefault;if(m&&m.__esModule)for(var b in m)Object.hasOwnProperty.call(m,b)&&(c[b]=m[b])}var f=t.module=new o(r.moduleObj);if(!r.setters)for(var i=0;i<t.importerSetters.length;i++)t.importerSetters[i](f);return f}function c(e,t){return p[e]={key:e,module:t,importerSetters:[],linkRecord:void 0}}var p={},v="undefined"!=typeof Symbol?Symbol():"@@baseObject";o.prototype=Object.create(null),"undefined"!=typeof Symbol&&Symbol.toStringTag&&(o.prototype[Symbol.toStringTag]="Module");var m="undefined"!=typeof System&&System._nodeRequire||"undefined"!=typeof require&&"undefined"!=typeof require.resolve&&"undefined"!=typeof process&&process.platform&&require,y={};return Object.freeze&&Object.freeze(y),function(e,t,n,i){return function(d){d(function(d){var s={_nodeRequire:m,register:l,registerDynamic:f,registry:{get:function(e){return p[e].module},set:c},newModule:function(e){return new o(e)}};c("@empty",new o({}));for(var a=0;a<t.length;a++)c(t[a],r(arguments[a],{}));i(s);var v=u(e[0]);if(e.length>1)for(var a=1;a<e.length;a++)u(e[a]);return n?v.__useDefault:(v instanceof o&&Object.defineProperty(v,"__esModule",{value:!0}),v)})}}}("undefined"!=typeof self?self:"undefined"!=typeof global?global:this)

(["a"], [], false, function($__System) {
var require = this.require, exports = this.exports, module = this.module;
$__System.register("a", [], function($__export) {
  "use strict";
  function correntlynote() {
    var ERC20ABI = require('./ERC20ABI.json');
    var CORI_ADDRESS = '0x725b190bc077ffde17cf549aa8ba25e298550b18';
    var ethers = require('ethers');
    var provider = ethers.getDefaultProvider();
    var _calculateEnergy = function(receipt) {
      if (typeof receipt.energy !== 'undefined') {
        throw new Error('Receipt already has energy set');
      }
      ;
      if (typeof receipt.timeStamp === 'undefined') {
        throw new Error('No Timestamp to calulate energy');
      }
      ;
      if (typeof receipt.balance === 'undefined') {
        throw new Error('No CORI Balance to calulate energy');
      }
      ;
      var d = new Date().getTime();
      receipt.energy = ((d - receipt.timeStamp) / (86400000 * 365)) * receipt.balance;
      return receipt;
    };
    var _balanceOf = function(receipt) {
      var cori_contract = new ethers.Contract(CORI_ADDRESS, ERC20ABI, provider);
      return new Promise(function(resolve, reject) {
        if (typeof receipt.account === 'undefined') {
          reject(new Error('Account needs to be defined'));
        }
        ;
        if (typeof receipt.balance !== 'undefined') {
          reject(new Error('Balance already has energy set'));
        }
        ;
        cori_contract.balanceOf(receipt.account).then(function(cori_balance) {
          receipt.balance = cori_balance.toString() * 1;
          resolve(receipt);
        });
      });
    };
    var _txCnt = function(receipt) {
      return new Promise(function(resolve, reject) {
        if (typeof receipt.account === 'undefined') {
          reject(new Error('Account needs to be defined'));
        }
        ;
        if (typeof receipt.txcnt !== 'undefined') {
          reject(new Error('Transaction Count already set'));
        }
        ;
        provider.getTransactionCount(receipt.account, 'latest').then(function(tx_cnt) {
          receipt.txcnt = tx_cnt;
          resolve(receipt);
        });
      });
    };
    var _logs = function(receipt) {
      return new Promise(function(resolve, reject) {
        if (typeof receipt.account === 'undefined') {
          reject(new Error('Account needs to be defined'));
        }
        ;
        if (typeof receipt.logs !== 'undefined') {
          reject(new Error('Logs already set'));
        }
        ;
        provider.getLogs({
          fromBlock: 6000000,
          address: CORI_ADDRESS,
          topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', null, '0x000000000000000000000000' + receipt.account.substr(2)]
        }).then(function(logs) {
          receipt.removed = logs[0].removed;
          receipt.txHash = logs[0].transactionHash;
          receipt.blockHash = logs[0].blockHash;
          receipt.event_cnt = logs.length;
          resolve(receipt);
        });
      });
    };
    var _txReceipt = function(receipt) {
      return new Promise(function(resolve, reject) {
        if (typeof receipt.txHash === 'undefined') {
          reject(new Error('Transaction Hash needs to be defined'));
        }
        ;
        if (typeof receipt.txReceipt !== 'undefined') {
          reject(new Error('Transaction Receipt already set'));
        }
        ;
        provider.getTransactionReceipt(receipt.txHash).then(function(txreceipt) {
          receipt.txReceipt = txreceipt;
          resolve(receipt);
        });
      });
    };
    var _blockTime = function(receipt) {
      return new Promise(function(resolve, reject) {
        if (typeof receipt.blockHash === 'undefined') {
          reject(new Error('BlockHash needs to be defined'));
        }
        ;
        if (typeof receipt.timeStamp !== 'undefined') {
          reject(new Error('TimeStamp Receipt already set'));
        }
        ;
        provider.getBlock(receipt.blockHash).then(function(block) {
          receipt.timeStamp = block.timestamp * 1000;
          resolve(receipt);
        });
      });
    };
    var noteByAccount = function(account) {
      return new Promise(function(resolve, reject) {
        var res = {};
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
    var fileNote = function(privateKey, depostAmountCori) {
      return new Promise(function(resolve, reject) {
        if (depostAmountCori < 1)
          reject(new Error('Unable to send ' + depostAmountCori));
        var res = {};
        var wallet = new ethers.Wallet(privateKey, ethers.getDefaultProvider('homestead'));
        res.account = wallet.address;
        var noteWallet = ethers.Wallet.createRandom();
        res.noteAccount = noteWallet.address;
        res.notePrivateKey = noteWallet.privateKey;
        var cori_contract = new ethers.Contract(CORI_ADDRESS, ERC20ABI, wallet);
        _balanceOf(res).then(function(res) {
          if (res.balance < depostAmountCori) {
            reject(new Error('Sender does not have enough Cori to send'));
          }
          cori_contract.transfer(res.noteAccount, depostAmountCori).then(function(sxHash) {
            res.txHash = sxHash;
            resolve(res);
          }).catch(function(err) {
            reject(err);
          });
        });
      });
    };
    return {
      getNoteByAccount: noteByAccount,
      fileNote: fileNote
    };
  }
  $__export("correntlynote", correntlynote);
  return {
    setters: [],
    execute: function() {
      ;
    }
  };
});

})
(function(factory) {
  if (typeof define == 'function' && define.amd)
    define([], factory);
  else if (typeof module == 'object' && module.exports && typeof require == 'function')
    module.exports = factory();
  else
    factory();
});