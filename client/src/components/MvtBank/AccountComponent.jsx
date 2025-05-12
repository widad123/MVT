// AccountComponent.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const AccountComponent = () => {
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState('');
    const [message, setMessage] = useState('');
    const [accountId, setAccountId] = useState('');
    const [toAccountId, setToAccountId] = useState('');

    const createAccount = async () => {
        try {
            const response = await fetch('http://localhost:8080/accounts', { method: 'POST' });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.id) {
                setAccountId(data.id);
                setMessage('Account created');
            } else {
                setMessage('Failed to create account');
            }
        } catch (error) {
            console.error('Error creating account:', error);
            setMessage(`Failed to create account: ${error.message}`);
        }
    };

    const deposit = async () => {
        if (!accountId) {
            setMessage("Please enter an account ID.");
            return;
        }

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setMessage("Please enter a valid amount to deposit.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/accounts/${accountId}/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parseFloat(amount)),
            });

            if (!response.ok) {
                const error = await response.json();
                setMessage(`Deposit failed: ${error.message}`);
                return;
            }

            setMessage('Deposit successful');
        } catch (error) {
            console.error('Error during deposit:', error);
            setMessage(`Deposit failed: ${error.message}`);
        }
    };

    const withdraw = async () => {
        if (!accountId) {
            setMessage("Please enter an account ID.");
            return;
        }

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setMessage("Please enter a valid amount to withdraw.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/accounts/${accountId}/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parseFloat(amount)),
            });

            if (!response.ok) {
                const error = await response.json();
                setMessage(`Withdrawal failed: ${error.message}`);
                return;
            }

            setMessage('Withdrawal successful');
        } catch (error) {
            console.error('Error during withdrawal:', error);
            setMessage(`Withdrawal failed: ${error.message}`);
        }
    };

    const transfer = async () => {
        if (!accountId || !toAccountId) {
            setMessage("Please enter both source and destination account IDs.");
            return;
        }

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setMessage("Please enter a valid amount to transfer.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/accounts/transfer?fromAccountId=${accountId}&toAccountId=${toAccountId}&amount=${parseFloat(amount)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const error = await response.json();
                setMessage(`Transfer failed: ${error.message}`);
                return;
            }

            setMessage('Transfer successful');
        } catch (error) {
            console.error('Error during transfer:', error);
            setMessage(`Transfer failed: ${error.message}`);
        }
    };

    const getBalance = async () => {
        if (!accountId) {
            setMessage('Please enter an account ID.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/accounts/${accountId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setBalance(data.balance);
            setMessage('Fetched balance');
        } catch (error) {
            console.error('Error fetching balance:', error);
            setMessage(`Failed to fetch balance: ${error.message}`);
        }
    };

    return (
        <div>
            <div className="card p-4 mb-4">
                <h4>Create Account</h4>
                <div className="mb-3">
                    <button onClick={createAccount} className="btn btn-primary w-100">Create Account</button>
                </div>
                <h4>Manage Account</h4>
                <div className="mb-3">
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="form-control"
                        placeholder="Amount"
                    />
                </div>
                <div className="mb-3">
                    <button onClick={deposit} className="btn btn-success w-100 mb-2">Deposit</button>
                    <button onClick={withdraw} className="btn btn-warning w-100">Withdraw</button>
                </div>
                <h4>Transfer Funds</h4>
                <div className="mb-3">
                    <input
                        type="text"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="form-control"
                        placeholder="Source Account ID"
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        value={toAccountId}
                        onChange={(e) => setToAccountId(e.target.value)}
                        className="form-control"
                        placeholder="Destination Account ID"
                    />
                </div>
                <div className="mb-3">
                    <button onClick={transfer} className="btn btn-success w-100">Transfer</button>
                </div>
                <h4>Get Balance</h4>
                <div className="mb-3">
                    <input
                        type="text"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="form-control"
                        placeholder="Account ID"
                    />
                </div>
                <div className="mb-3">
                    <button onClick={getBalance} className="btn btn-info w-100">Get Balance</button>
                </div>
                <div className="mt-4">
                    <div>Balance: {balance}</div>
                    <div>Account ID: {accountId}</div>
                </div>
                {message && (
                    <div className="alert alert-info mt-3">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountComponent;
