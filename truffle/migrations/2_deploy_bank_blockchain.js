const BankBlockchain = artifacts.require("BankBlockchain");

module.exports = function (deployer) {
    deployer.deploy(BankBlockchain);
};
