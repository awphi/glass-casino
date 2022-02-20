export const mumbai = {
  chainName: "Polygon Testnet",
  chainId: "0x" + Number(80001).toString(16),
  rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
  nativeCurrency: { name: "MATIC", symbol: "MATIC" },
  blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
  linkAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
};

export const main = {
  chainName: "Polygon",
  chainId: "0x" + Number(137).toString(16),
  rpcUrls: ["https://polygon-rpc.com/"],
  nativeCurrency: { name: "MATIC", symbol: "MATIC" },
  blockExplorerUrls: ["https://polygonscan.com/"],
  linkAddress: "0xb0897686c545045afc77cf20ec7a532e3120e0f1",
};
