
import * as fcl from "@onflow/fcl";
import * as sdk from "@onflow/sdk";
import * as types from "@onflow/types";

const idsAndNamesOwned = async (address) => {
    const response = await fcl.send([
      sdk.script`
      // Script2.cdc
      
      import FungibleToken from 0x01cf0e2f2f715450
      import NonFungibleToken from 0x179b6b1cb6755e31
      import Marketplace from 0xf3fcd2c1a78f5eee
      
      pub fun main():[{UInt64:String?}] {
          // Get the public account object for account 0x01
          let account1 = getAccount(0x${address})
      
          // Find the public Sale reference to their Collection
          let acct1Ref = account1.getCapability(/public/NFTReceiver)!
                                     .borrow<&AnyResource{NonFungibleToken.NFTReceiver}>()!
      
          return acct1Ref.getIDsAndNames()
      }
      `,
      sdk.args([]),
    ]);
    return fcl.decode(response);
  };



export default idsAndNamesOwned