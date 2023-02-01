import farmContractAbiJson from "./farmContractAbi.json";
import lpContractAbiJson from "./lpContractAbi.json";

const farmContractAbi = JSON.parse(farmContractAbiJson.result);
const lpContractAbi = JSON.parse(lpContractAbiJson.result);

export { farmContractAbi, lpContractAbi };
