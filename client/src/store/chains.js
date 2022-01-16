export const mumbai = {
  chainName: "Polygon Testnet",
  chainId: "0x" + Number(80001).toString(16),
  rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
  nativeCurrency: { name: "MATIC", symbol: "MATIC" },
  blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
};

export const main = {
  chainName: "Polygon",
  chainId: "0x" + Number(137).toString(16),
  rpcUrls: ["https://polygon-rpc.com/"],
  nativeCurrency: { name: "MATIC", symbol: "MATIC" },
  blockExplorerUrls: ["https://polygonscan.com/"],
};
