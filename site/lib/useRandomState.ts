import {useAsyncValue} from "./useAsyncValue";
import {Contract} from "ethers";
import {useDoctorContract} from "./useDoctorContract";
import { BigNumber } from "bignumber.js";


export function useRandomState() {
  const contract = useDoctorContract();
  const [data] = useAsyncValue(async () => getRandomState(contract), [contract]);

  if (!data) {
    return [undefined, undefined, undefined];
  }
  return data;
}


export async function getRandomState(contract?: Contract) {
  try {
    const {isRolling, lastRollTime, probability} = await (await fetch('/api/randomstate')).json();
    const p = new BigNumber(1).minus(new BigNumber(probability).div(new BigNumber(2).pow(64)));
    console.log(p, probability)
    return [isRolling, lastRollTime, p];
  } catch(e) {
    console.log("Failed to fetch random state from server, probably misconfigured.")
    return [0, 0, new BigNumber("0")];
  }
}