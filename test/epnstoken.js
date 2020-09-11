const expect = require("chai").expect;
require("dotenv").config();
const Web3 = require("web3");
const contract = require("@truffle/contract");
const EXPOSURETokenJSON = require("../build/contracts/EXPOSURE.json");
const provider = new Web3.providers.HttpProvider(
  `${process.env.WEB3_ENDPOINT}`
);
const web3 = new Web3(provider);
const EthereumTx = require("ethereumjs-tx").Transaction;
const EXPOSURETokenContract = contract(EXPOSURETokenJSON);
EXPOSURETokenContract.setProvider(provider);
let EXPOSUREToken;
let EXPOSURETokenDeployed;

const user1 = {
  address: process.env.OWNER_ADDRESS,
  publicKey: process.env.OWNER_PUBLIC_KEY,
  privateKey: process.env.OWNER_PRIVATE_KEY,
};

const user2 = {
  address: process.env.ADDRESS_2_ADDRESS,
  publicKey: process.env.ADDRESS_2_PUBLIC_KEY,
  privateKey: process.env.ADDRESS_2_PRIVATE_KEY,
};

const user3 = {
  address: process.env.ADDRESS_3_ADDRESS,
  publicKey: process.env.ADDRESS_3_PUBLIC_KEY,
  privateKey: process.env.ADDRESS_3_PRIVATE_KEY,
};

const user4 = {
  address: process.env.ADDRESS_4_ADDRESS,
  publicKey: process.env.ADDRESS_4_PUBLIC_KEY,
  privateKey: process.env.ADDRESS_4_PRIVATE_KEY,
};

const user5 = {
  address: process.env.ADDRESS_5_ADDRESS,
  publicKey: process.env.ADDRESS_5_PUBLIC_KEY,
  privateKey: process.env.ADDRESS_5_PRIVATE_KEY,
};

async function signAndTransact(privateKey, details) {
  privateKey = privateKey.replace("0x", "");
  const transaction = new EthereumTx(details, { chain: "ropsten" });
  transaction.sign(Buffer.from(`${privateKey}`, "hex"));
  const serializedTransaction = transaction.serialize();
  const addr = transaction.from.toString("hex");
  // console.log(`Based on your private key, your wallet address is 0x${addr}`);
  const res = await web3.eth.sendSignedTransaction(
    `0x${serializedTransaction.toString("hex")}`
  );
  console.log("TxHash ", `${res.transactionHash}`);
  return res;
}

async function formatAndSend(address, key, data) {
  const nonce = await web3.eth.getTransactionCount(address, "latest");
  const details = {
    from: address,
    to: EXPOSURETokenDeployed.address,
    nonce,
    gasPrice: web3.utils.toHex(web3.utils.toWei("134".toString(), "gwei")),
    gasLimit: web3.utils.toHex(5500000), // Raise the gas limit to a much higher amount
    data,
  };
  return signAndTransact(key, details);
}

const token = {
  name: "Exposure Coin",
  symbol: "EXPOSURE",
  decimals: 6,
  sypply: 100000000000,
  allowance: 1000,
  transfer: 10000,
};

describe("EXPOSURE Token", () => {
  before(async () => {
    EXPOSURETokenDeployed = await EXPOSURETokenContract.deployed();
    EXPOSUREToken = new web3.eth.Contract(
      EXPOSURETokenJSON.abi,
      EXPOSURETokenDeployed.address
    );
  });

  it("It Gets token name", async () => {
    const result = await EXPOSUREToken.methods.name().call();
    expect(result).to.equal(token.name);
  }).timeout(70000);

  it("It Gets token symbol", async () => {
    const result = await EXPOSUREToken.methods.symbol().call();
    expect(result).to.equal(token.symbol);
  }).timeout(70000);

  it("It Gets token decimals", async () => {
    const result = await EXPOSUREToken.methods.decimals().call();
    expect(Number(result)).to.equal(token.decimals);
  }).timeout(70000);

  it("It Gets token token supply", async () => {
    const result = await EXPOSUREToken.methods.totalSupply().call();
    expect(Number(result)).to.equal(token.sypply);
  }).timeout(70000);

  it("It should transfer to user 2", async () => {
    const result = await formatAndSend(
      user1.address,
      user1.privateKey,
      EXPOSUREToken.methods.transfer(user2.address, token.transfer).encodeABI()
    );
    console.log("result: %o ", result);
    expect(result);
  }).timeout(70000);

  it("It Gets balance of user 2", async () => {
    const result = await EXPOSUREToken.methods.balanceOf(user2.address).call();
    expect(Number(result)).to.equal(token.transfer);
  }).timeout(70000);

  it("It should approve 1000 to user 3 from user 2", async () => {
    const result = await formatAndSend(
      user2.address,
      user2.privateKey,
      EXPOSUREToken.methods.approve(user3.address, token.allowance).encodeABI()
    );
    console.log("result: %o ", result);
    expect(result);
  }).timeout(70000);

  it("It should get allowance of user 3 by user 2", async () => {
    const result = await EXPOSUREToken.methods
      .allowance(user2.address, user3.address)
      .call();
    expect(Number(result)).to.equal(token.allowance);
  }).timeout(70000);

  it("It should transfer 1000 from user 2 to user 3 using user 3", async () => {
    const result = await formatAndSend(
      user3.address,
      user3.privateKey,
      EXPOSUREToken.methods
        .transferFrom(user2.address, user4.address, token.allowance)
        .encodeABI()
    );
    console.log("result: %o ", result);
    expect(result);
  }).timeout(70000);

  it("It Gets balance of user 3", async () => {
    const result = await EXPOSUREToken.methods.balanceOf(user4.address).call();
    expect(Number(result)).to.equal(token.allowance);
  }).timeout(70000);
});
