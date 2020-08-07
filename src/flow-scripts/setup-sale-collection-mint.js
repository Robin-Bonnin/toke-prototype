import * as fcl from "@onflow/fcl";
import * as sdk from "@onflow/sdk";
import * as types from "@onflow/types";

const setupSaleCollection = async () => {
  const { authorization } = fcl.currentUser();
  const tx = await fcl.send([
    fcl.transaction`// Transaction1.cdc

    import FungibleToken from 0x01cf0e2f2f715450
    import NonFungibleToken from 0x179b6b1cb6755e31
    import Marketplace from 0xf3fcd2c1a78f5eee
    
    // This transaction creates a new Sale Collection object,
    // lists an NFT for sale, puts it in account storage,
    // and creates a public capability to the sale so that others can buy the token.
    transaction {
    
        prepare(acct: AuthAccount) {
    
            // Borrow a reference to the stored Vault
            let receiver = acct.borrow<&{FungibleToken.Receiver}>(from: /storage/MainVault)!
    
            // Create a new Sale object, 
            // initializing it with the reference to the owner's vault
            let sale <- Marketplace.createSaleCollection(ownerVault: receiver)

            // Store the sale object in the account storage 
            acct.save(<-sale, to: /storage/NFTSale)
    
            // Create a public capability to the sale so that others can call its methods
            acct.link<&Marketplace.SaleCollection{Marketplace.SalePublic}>(/public/NFTSale, target: /storage/NFTSale)
    
            log("Sale Created for account 1.")
        }
    }
     `,
    sdk.payer(authorization),
    sdk.proposer(authorization),
    sdk.authorizations([authorization]),
    sdk.limit(100),
  ]);

  console.log({ tx });

/*   fcl.tx(tx).subscribe((txStatus) => {
    if (fcl.tx.isExecuted(txStatus)) {
      console.log("Transaction was executed");
    }
  }); */
}

export default setupSaleCollection
