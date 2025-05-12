const BankBlockchain = artifacts.require("BankBlockchain");

contract("BankBlockchain", (accounts) => {
    it("should create an account with 0 balance", async () => {
        const bankInstance = await BankBlockchain.deployed();
        await bankInstance.createAccount({ from: accounts[0] });
        const balance = await bankInstance.getBalance({ from: accounts[0] });
        assert.equal(balance.toNumber(), 0, "Balance should be 0");
    });

    it("should allow users to deposit ether", async () => {
        const bankInstance = await BankBlockchain.deployed();
        await bankInstance.createAccount({ from: accounts[1] }); 
        await bankInstance.deposit({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
        const balance = await bankInstance.getBalance({ from: accounts[1] });
        assert.equal(balance.toString(), web3.utils.toWei("1", "ether"), "Balance should be 1 ether");
    });

    it("should allow users to withdraw ether", async () => {
        const bankInstance = await BankBlockchain.deployed();
        await bankInstance.createAccount({ from: accounts[2] }); 
        await bankInstance.deposit({ from: accounts[2], value: web3.utils.toWei("1", "ether") }); 
        await bankInstance.withdraw(web3.utils.toWei("0.5", "ether"), { from: accounts[2] });
        const balance = await bankInstance.getBalance({ from: accounts[2] });
        assert.equal(balance.toString(), web3.utils.toWei("0.5", "ether"), "Balance should be 0.5 ether after withdrawal");
    });

    it("should not allow users to withdraw more than their balance", async () => {
        const bankInstance = await BankBlockchain.deployed();
        try {
            await bankInstance.withdraw(web3.utils.toWei("2", "ether"), { from: accounts[2] }); 
            assert.fail("The withdrawal should have thrown an error.");
        } catch (err) {
            assert.include(err.message, "revert", "The error message should contain 'revert'");
        }
    });

    it("should allow users to transfer ether", async () => {
        const bankInstance = await BankBlockchain.deployed();
        await bankInstance.createAccount({ from: accounts[3] });
        await bankInstance.deposit({ from: accounts[3], value: web3.utils.toWei("1", "ether") });
        await bankInstance.createAccount({ from: accounts[4] }); 
        await bankInstance.transfer(accounts[4], { from: accounts[3], value: web3.utils.toWei("0.5", "ether") });
        const balanceSender = await bankInstance.getBalance({ from: accounts[3] });
        const balanceReceiver = await bankInstance.getBalance({ from: accounts[4] });
        assert.equal(balanceSender.toString(), web3.utils.toWei("0.5", "ether"), "Sender balance should be 0.5 ether after transfer");
        assert.equal(balanceReceiver.toString(), web3.utils.toWei("0.5", "ether"), "Receiver balance should be 0.5 ether after receiving transfer");
    });
});
