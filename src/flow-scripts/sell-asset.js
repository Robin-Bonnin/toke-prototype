import * as fcl from "@onflow/fcl";
import * as sdk from "@onflow/sdk";
import * as types from "@onflow/types";

const sellAsset = async (id,price) => {
  const { authorization } = fcl.currentUser();
  const tx = await fcl.send([
    fcl.transaction`
    // Transaction1.cdc

import FungibleToken from 0x01cf0e2f2f715450
import NonFungibleToken from 0x179b6b1cb6755e31
import Marketplace from 0xf3fcd2c1a78f5eee

// This transaction creates a new Sale Collection object,
// lists an NFT for sale, puts it in account storage,
// and creates a public capability to the sale so that others can buy the token.
transaction {
  let sale: &Marketplace.SaleCollection

    prepare(acct: AuthAccount) {

      // Borrow a reference to the stored Vault
        let receiver = acct.borrow<&{FungibleToken.Receiver}>(from: /storage/MainVault)!

        // borrow a reference to the sale collection
        self.sale = acct.borrow<&Marketplace.SaleCollection>(from: /storage/NFTSale)!

        // borrow a reference to the NFTCollection in storage
        let collectionRef = acct.borrow<&NonFungibleToken.Collection>(from: /storage/NFTCollection)!
    
        // Withdraw the NFT from the collection that you want to sell
        // and move it into the transaction's context
        let token <- collectionRef.withdraw(withdrawID: ${id})

        // List the token for sale by moving it into the sale object
        self.sale.listForSale(token: <-token, price: UFix64(${price}))

        // Create a public capability to the sale so that others can call its methods
        acct.link<&Marketplace.SaleCollection{Marketplace.SalePublic}>(/public/NFTSale, target: /storage/NFTSale)

        log("Sale Created for account 1. Selling NFT ${id} for ${price} tokens")
    }
}
    `,
    sdk.payer(authorization),
    sdk.proposer(authorization),
    sdk.authorizations([authorization]),
    sdk.limit(100),
  ]);

  console.log({ tx });

  /* fcl.tx(tx).subscribe((txStatus) => {
    if (fcl.tx.isExecuted(txStatus)) {
      console.log("Transaction was executed");
    }
  }); */
}

export default sellAsset
