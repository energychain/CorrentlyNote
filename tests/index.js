'use strict';
import CorrentlyNote from '../src/index.js';
const assert = require('assert');
const note = new CorrentlyNote;
const valid_account = '0xD6B2851C9aCD1E8d70bE59d44315a03ebaec7DAb';
describe('Basic Cheque like Use Cases', function() {
    this.timeout(300000);
    let validReceipt = {};
    it('getNoteByAccount', function(done) {
      note.getNoteByAccount(valid_account).then(function(receipt) {
        validReceipt = receipt;
        done();
      }).catch(function() { done.fail(); });
    });
    it('Consensus of Check Data', function(done) {
      assert.equal(validReceipt.account, valid_account); // Account is the ChequeAccount we use for testing
      assert.equal(validReceipt.txcnt, 0); // This Account should not have any transactions
      assert.equal(validReceipt.logs[0].removed, false); // The transfer of CORI Token
      assert.equal(validReceipt.balance, 100); // The balance should be 1 CORI Token
      assert.notEqual(validReceipt.energy, 0); // Energy is greater than 0 (as this Cheque is from the past)
      done();
    });
    it('tryToSend', function(done) {
      const ethers = require('ethers');
      const wallet = ethers.Wallet.createRandom();

      note.fileNote(wallet.privateKey, 1).then(function(tx) {
        console.log(tx);
        done.fail();
      }).catch(function(err) {
        assert.notEqual(err, null);
        done();
      });
    });
  }
);
