import { useEffect, useState } from "react";
// import "./App.css";
import { ethers } from "ethers";
import { farmContractAbi, lpContractAbi } from "./contracts";

const farmContractAddress = "0x564E7591c4Bbd06DA5B25fcD73020f9D047936D3";
const lpContractAddress = "0xe02d465e3Fd012233E9a0749E8e73dF381568093";
const tokenAddress = "0xe8dc4b1b8d2475a7b5c6d03a0f0523e4dbbac4d2";
const requiredNetwork = 5;
const { ethereum } = window;
const btnStyle =
  "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800";
const btnStyleDisabled =
  "text-white bg-blue-400 dark:bg-blue-500 cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5  text-center";
const inputStyle =
  "block w-full p-2.5 pr-[100px] text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

function App() {
  const [provider, setProvider] = useState(undefined);
  const [pending, setPending] = useState({
    deposit: false,
    claim: false,
    withdraw: false,
  });
  const [farmContract, setFarmContract] = useState(undefined);
  const [lpContract, setLpContract] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [userInfo, setUserInfo] = useState(undefined);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const toEther = (wei) =>
    Number(ethers.utils.formatEther(String(wei))).toFixed(2);
  const shortenAddress = (address) =>
    `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;

  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(ethereum);
      if (provider) {
        setProvider(provider);
        const signer = provider.getSigner();
        const { chainId } = await provider.getNetwork();
        if (chainId !== requiredNetwork) {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x5" }],
          });
        }
        const loadFarmContract = new ethers.Contract(
          farmContractAddress,
          farmContractAbi,
          signer
        );
        const loadLpContract = new ethers.Contract(
          lpContractAddress,
          lpContractAbi,
          signer
        );
        setFarmContract(loadFarmContract);
        setLpContract(loadLpContract);

        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length) {
          setAccount(accounts[0]);
        }
      }
    };
    onLoad();
  }, []);

  const getAccountInfo = async () => {
    if (provider && account && farmContract && lpContract) {
      const checkIsApprove = await lpContract.allowance(
        account,
        farmContractAddress
      );
      const pendingReward = await farmContract.pendingReward(
        lpContractAddress,
        account
      );
      const lpBalance = await lpContract.balanceOf(account);
      const userInfo = await farmContract.userInfo(lpContractAddress, account);
      setUserInfo({
        contractApprove:
          ethers.utils.formatUnits(checkIsApprove, 0) == 0 ? false : true,
        pendingReward: toEther(pendingReward),
        stake: toEther(userInfo[0]),
        lpBalance: toEther(lpBalance),
      });
    }
  };

  useEffect(() => {
    getAccountInfo();
  }, [account]);

  useEffect(() => {
    console.log(userInfo);
  }, [userInfo]);

  const handleWalletConnect = async () => {
    if (!ethereum) {
      window.open("https://metamask.io/");
      return;
    }
    if (!account) {
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length) {
        setAccount(accounts[0]);
      }
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!userInfo.contractApprove) {
      await lpContract.approve(
        farmContractAddress,
        ethers.utils.formatUnits(ethers.constants.MaxUint256, 0)
      );
    }
    const deposit = await farmContract.deposit(
      lpContractAddress,
      ethers.utils.parseUnits(depositAmount.toString())
    );
    setPending({ ...pending, deposit: true });
    await deposit.wait();
    setPending({ ...pending, deposit: false });
    getAccountInfo();
  };

  const handleClaim = async () => {
    const claimReward = await farmContract.claimReward(lpContractAddress);
    setPending({ ...pending, claim: true });
    await claimReward.wait();
    setPending({ ...pending, claim: false });
    getAccountInfo();
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const withdraw = await farmContract.withdraw(
      lpContractAddress,
      ethers.utils.parseUnits(withdrawAmount.toString())
    );
    setPending({ ...pending, withdraw: true });
    await withdraw.wait();
    setPending({ ...pending, withdraw: false });
    getAccountInfo();
  };

  return (
    <div className="App">
      <div className="container mx-auto p-[20px]">
        <div className="flex justify-between items-end mb-3 ">
          <h1 className="font-bold text-xl mb-3">Custom Token Farm</h1>
          <button
            onClick={handleWalletConnect}
            type="button"
            className={btnStyle}
          >
            {ethereum
              ? account
                ? shortenAddress(account)
                : "Connect Wallet"
              : "Install Wallet"}
          </button>
        </div>
        {!account ? (
          <p className="text-center font-bold text-2xl">
            Connect wallet to continue.
          </p>
        ) : null}
        {userInfo ? (
          <>
            <div className="mb-3">
              <p>
                <a
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  href="https://goerli.etherscan.io/token/0xe8dc4b1b8d2475a7b5c6d03a0f0523e4dbbac4d2"
                  target="_blank"
                >
                  Custom Token
                </a>
                {` to Claim: ${userInfo.pendingReward}`}
              </p>
              <p>
                <a
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  href="https://goerli.etherscan.io/address/0xe02d465e3Fd012233E9a0749E8e73dF381568093"
                  target="_blank"
                >
                  LP Token
                </a>
                {` in Stake: ${userInfo.stake}`}
              </p>
            </div>

            <div className="flex items-initial justify-center gap-3 flex-col md:flex-row md:items-center">
              <button
                className={
                  parseFloat(userInfo.pendingReward) > 0 && !pending.claim
                    ? btnStyle
                    : btnStyleDisabled
                }
                disabled={parseFloat(userInfo.pendingReward) > 0 ? false : true}
                onClick={handleClaim}
              >
                {pending.claim ? "Pending" : "Claim Reward"}
              </button>

              <form onSubmit={handleWithdraw} className="flex-1">
                <div className="relative flex items-center">
                  <input
                    type="number"
                    name="withdrawAmount"
                    className={`${inputStyle} pr-[180px]`}
                    placeholder="Withdraw LP Token..."
                    required
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    value={withdrawAmount}
                  />
                  <button
                    type="button"
                    className={`${btnStyle} absolute right-[110px] py-[3px]`}
                    onClick={() =>
                      setWithdrawAmount(parseFloat(userInfo.stake))
                    }
                  >
                    Max
                  </button>
                  <button
                    type="submit"
                    disabled={pending.withdraw ? true : false}
                    className={`${
                      pending.withdraw ? btnStyleDisabled : btnStyle
                    } absolute right-1 py-1.5`}
                  >
                    {pending.withdraw ? "Pending" : "Withdraw"}
                  </button>
                </div>
              </form>

              <form onSubmit={handleDeposit} className="flex-1">
                <div className="relative flex items-center">
                  <input
                    type="number"
                    name="depositAmount"
                    className={`${inputStyle} pr-[170px]`}
                    placeholder="Deposit LP Token..."
                    required
                    onChange={(e) => setDepositAmount(e.target.value)}
                    value={depositAmount}
                  />
                  <button
                    type="button"
                    className={`${btnStyle} absolute right-[100px] py-[3px]`}
                    onClick={() =>
                      setDepositAmount(parseFloat(userInfo.lpBalance))
                    }
                  >
                    Max
                  </button>
                  <button
                    type="submit"
                    disabled={pending.deposit ? true : false}
                    className={`${
                      pending.deposit ? btnStyleDisabled : btnStyle
                    } absolute right-1 py-1.5`}
                  >
                    {pending.deposit ? "Pending" : "Deposit"}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;
