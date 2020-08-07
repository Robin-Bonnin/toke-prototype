import * as fcl from "@onflow/fcl";
import * as sdk from "@onflow/sdk";
import * as types from "@onflow/types";

const forSale = async (address) => {
    const response = await fcl.send([
      sdk.script`
      import FungibleToken from 0x01cf0e2f2f715450
      import NonFungibleToken from 0x179b6b1cb6755e31
      import Marketplace from 0xf3fcd2c1a78f5eee
      
      // This script prints the NFTs that account 0x01 has for sale.
      pub fun main():[{UInt64:String?}] {
          // Get the public account object for account 0x01
          let account1 = getAccount(0x${address})
      
          // Find the public Sale reference to their Collection
          let acct1saleRef = account1.getCapability(/public/NFTSale)!
                                     .borrow<&AnyResource{Marketplace.SalePublic}>()!
      
          // Los the NFTs that are for sale
          log("Account 1 NFTs for sale")
          log(acct1saleRef.getIDs())
          log("Price")
          log(acct1saleRef.idPrice(tokenID: 1))
          return acct1saleRef.getIDsAndNames()
      }
      
      `,
      sdk.args([]),
    ]);
    return fcl.decode(response);
  };



export default forSale