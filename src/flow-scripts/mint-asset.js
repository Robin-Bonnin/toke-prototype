import * as fcl from "@onflow/fcl";
import * as sdk from "@onflow/sdk";
import * as types from "@onflow/types";

const mintAsset = async (address,name) => {
  const { authorization } = fcl.currentUser();
  const tx = await fcl.send([
    fcl.transaction`
    // MintNewNFTToAccount1.cdc
import FungibleToken from 0x01cf0e2f2f715450
import NonFungibleToken from 0x179b6b1cb6755e31
// This transaction adds an empty Vault to account 0x02
// and mints an NFT with id=1 that is deposited into
// the NFT collection on account 0x01.
transaction {

  // Private reference to this account's minter resource
  let minterRef: &NonFungibleToken.NFTMinter

  prepare(acct: AuthAccount) {
    // Borrow a reference for the NFTMinter in storage
    self.minterRef = acct.borrow<&NonFungibleToken.NFTMinter>(from: /storage/NFTMinter)!
  }
  execute {
    // Get the recipient's public account object
    let recipient = getAccount(0x${address})

    // Get the Collection reference for the receiver
    // getting the public capability and borrowing a reference from it
    let receiverRef = recipient.getCapability(/public/NFTReceiver)!
                               .borrow<&{NonFungibleToken.NFTReceiver}>()!

    // Mint an NFT and deposit it into account 0x01's collection
    self.minterRef.mintNFT(recipient: receiverRef,name:"${name}")

    log("New NFT minted for account 1")
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

export default mintAsset
