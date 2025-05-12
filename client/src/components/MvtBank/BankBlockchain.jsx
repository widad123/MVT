import React, { useState, useEffect, useCallback, useRef } from 'react';
import Web3 from 'web3';
import BankBlockchainContract from '../../contracts/BankBlockchain.json';

const BankBlockchain = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [transactionTime, setTransactionTime] = useState('');
    const [allBalances, setAllBalances] = useState({});
    const [toAddress, setToAddress] = useState('');
    const [isAccountCreated, setIsAccountCreated] = useState(false);
    const web3Ref = useRef(null);
    const isRequestingAccounts = useRef(false);

    // Vérifie si une adresse est valide
    const isValidAddress = (address) => {
        return web3Ref.current && web3Ref.current.utils.isAddress(address);
    };

    // Vérifie si le compte existe
    const accountExists = useCallback(async (address) => {
        if (contract && isValidAddress(address)) {
            try {
                return await contract.methods.accountExists(address).call();
            } catch (error) {
                console.error(`Error checking account existence for ${address}:`, error);
                return false;
            }
        }
        return false;
    }, [contract]);

    // Vérifie si le compte est créé
    const checkAccountCreation = useCallback(async () => {
        const exists = await accountExists(account);
        setIsAccountCreated(exists);
    }, [account, accountExists]);

    // Récupère le solde pour un compte spécifique
    const fetchBalance = useCallback(async (address) => {
        if (contract && isValidAddress(address)) {
            try {
                const exists = await accountExists(address);
                if (!exists) {
                    console.log(`Account ${address} does not exist.`);
                    return '0';
                }

                const balanceWei = await contract.methods.getBalance().call({ from: address });
                const balanceEth = web3Ref.current.utils.fromWei(balanceWei, 'ether');
                return balanceEth;
            } catch (error) {
                console.error(`Error fetching balance for ${address}:`, error);
                setMessage(`Error fetching balance pour ${address}: ${error.message}`);
                return '0';
            }
        }
        return '0';
    }, [contract, accountExists]);

    // Met à jour les soldes pour le compte actuel et l'adresse du destinataire
    const updateBalances = useCallback(async () => {
        const senderBalance = await fetchBalance(account);
        const receiverBalance = toAddress ? await fetchBalance(toAddress) : '0';
        setAllBalances({
            [account]: senderBalance,
            [toAddress]: receiverBalance
        });
        await checkAccountCreation();
    }, [account, toAddress, fetchBalance, checkAccountCreation]);

    // Met à jour les soldes lorsque le compte change
    useEffect(() => {
        if (account) {
            updateBalances();
        }
    }, [account, updateBalances]);

    // Connexion au portefeuille MetaMask et récupération des comptes disponibles
    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            alert('MetaMask is not installed. Please install MetaMask to connect.');
            return;
        }

        if (isRequestingAccounts.current) {
            return; // Empêche les demandes répétées
        }

        isRequestingAccounts.current = true;

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Accounts found:", accounts);
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                await updateBalances();
            } else {
                console.log("No accounts found.");
            }
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            setMessage(`Failed to connect MetaMask: ${error.message}`);
        } finally {
            isRequestingAccounts.current = false;
        }
    }, [updateBalances]);

    // Initialise Web3 et configure l'instance de contrat
    const initWeb3 = useCallback(async () => {
        if (!window.ethereum) {
            alert('MetaMask is not installed. Please install MetaMask to connect.');
            return;
        }

        if (!web3Ref.current) {
            web3Ref.current = new Web3(window.ethereum);
        }

        const networkId = await web3Ref.current.eth.net.getId();
        const deployedNetwork = BankBlockchainContract.networks[networkId];
        if (!deployedNetwork) {
            throw new Error("No deployed network found for this ID");
        }

        const instance = new web3Ref.current.eth.Contract(
            BankBlockchainContract.abi,
            deployedNetwork.address,
        );
        setContract(instance);

        const accounts = await web3Ref.current.eth.getAccounts();
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            await updateBalances();
        } else {
            connectWallet();
        }
    }, [connectWallet, updateBalances]);

    useEffect(() => {
        initWeb3();
    }, [initWeb3]);

    // Gère les changements des comptes MetaMask connectés
    const handleAccountsChanged = useCallback((accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            updateBalances();
        } else {
            console.log("Please connect to MetaMask.");
        }
    }, [updateBalances]);

    useEffect(() => {
        if (window.ethereum && window.ethereum.on) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            return () => {
                if (window.ethereum && window.ethereum.removeListener) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                }
            };
        }
    }, [handleAccountsChanged]);

    // Mesure le temps de transaction
    const measureTransactionTime = useCallback(async (transactionMethod, message) => {
        const sendTime = Date.now();
        await transactionMethod();
        const receiveTime = Date.now();
        const timeTaken = receiveTime - sendTime;
        setTransactionTime(`Last transaction (${message}) took: ${timeTaken} ms`);
    }, []);

    // Crée un compte dans le contrat intelligent
    const createAccount = async () => {
        try {
            const estimatedGas = await contract.methods.createAccount().estimateGas({ from: account });
            await measureTransactionTime(() => contract.methods.createAccount().send({
                from: account,
                gas: estimatedGas
            }), 'create account');
            setMessage('Account created successfully');
            await updateBalances();
        } catch (error) {
            console.error('Error creating account:', error);
            setMessage(`Failed to create account: ${error.message}`);
        }
    };

    // Dépose un montant sur le compte actuel
    const deposit = async () => {
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            setMessage('Invalid deposit amount.');
            return;
        }

        try {
            const weiValue = web3Ref.current.utils.toWei(amount, 'ether');
            const estimatedGas = await contract.methods.deposit().estimateGas({ from: account, value: weiValue });
            await measureTransactionTime(() => contract.methods.deposit().send({
                from: account,
                value: weiValue,
                gas: estimatedGas
            }), 'deposit');
            setMessage('Deposit successful');
            await updateBalances();
        } catch (error) {
            console.error('Error during deposit:', error);
            setMessage(`Failed to deposit: ${error.message}`);
        }
    };

    // Retire un montant du compte actuel
    const withdraw = async () => {
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            setMessage('Invalid withdrawal amount.');
            return;
        }

        try {
            const weiValue = web3Ref.current.utils.toWei(amount, 'ether');
            const estimatedGas = await contract.methods.withdraw(weiValue).estimateGas({ from: account });
            await measureTransactionTime(() => contract.methods.withdraw(weiValue).send({
                from: account,
                gas: estimatedGas
            }), 'withdraw');
            setMessage('Withdrawal successful');
            await updateBalances();
        } catch (error) {
            console.error('Error during withdrawal:', error);
            setMessage(`Failed to withdraw: ${error.message}`);
        }
    };

    // Transfère un montant vers une autre adresse
    const transfer = async () => {
        if (!toAddress || isNaN(amount) || parseFloat(amount) <= 0 || !isValidAddress(toAddress)) {
            setMessage('Please ensure all fields are filled correctly and the amount is positive.');
            return;
        }

        try {
            const weiAmount = web3Ref.current.utils.toWei(amount, 'ether');
            const estimatedGas = await contract.methods.transfer(toAddress).estimateGas({ from: account, value: weiAmount });
            await measureTransactionTime(() => contract.methods.transfer(toAddress).send({
                from: account,
                value: weiAmount,
                gas: estimatedGas
            }), 'transfer');
            setMessage('Transfer successful');
            await updateBalances();
        } catch (error) {
            console.error('Error during transfer:', error);
            setMessage(`Failed to transfer: ${error.message}`);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Bank Blockchain Interaction</h2>
            <div className="card p-4 mb-4">
                {account ? (
                    <>
                        <div className="mb-3">
                            <span className="fw-bold">Sender Account:</span> {account} -
                            Balance: {allBalances[account] || '0'} ETH
                        </div>
                        {toAddress && (
                            <div className="mb-3">
                                <span className="fw-bold">Recipient Account:</span> {toAddress} -
                                Balance: {allBalances[toAddress] || '0'} ETH
                            </div>
                        )}
                        {isAccountCreated ? (
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <input
                                        type="text"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="form-control"
                                        placeholder="Amount in ETH"
                                    />
                                </div>
                                <div className="col-md-6 mb-3 d-grid">
                                    <button onClick={deposit} className="btn btn-primary">Deposit</button>
                                </div>
                                <div className="col-md-6 mb-3 d-grid">
                                    <button onClick={withdraw} className="btn btn-warning">Withdraw</button>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <input
                                        type="text"
                                        value={toAddress}
                                        onChange={e => setToAddress(e.target.value)}
                                        className="form-control"
                                        placeholder="Recipient Address"
                                    />
                                </div>
                                <div className="col-md-6 mb-3 d-grid">
                                    <button onClick={transfer} className="btn btn-success">Transfer</button>
                                </div>
                                <div className="col-12 d-grid">
                                    <button onClick={() => updateBalances()} className="btn btn-secondary">Refresh
                                        Balances
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="d-grid mb-3">
                                <button onClick={createAccount} className="btn btn-success">Create Account</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="d-grid mb-3">
                        <button onClick={connectWallet} className="btn btn-primary">Connect Wallet</button>
                    </div>
                )}
                {message && (
                    <div className="alert alert-info mt-3">
                        {message}
                    </div>
                )}
                {transactionTime && (
                    <div className="alert alert-secondary mt-3">
                        {transactionTime}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BankBlockchain;
