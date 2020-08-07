import * as fcl from "@onflow/fcl";
import * as sdk from "@onflow/sdk";
import * as types from "@onflow/types";

const setupNFTCollection = async () => {
  const { authorization } = fcl.currentUser();
  const tx = await fcl.send([
    fcl.transaction`
    // SetupAccount1Transaction.cdc
    
    import FungibleToken from 0x01cf0e2f2f715450
    import NonFungibleToken from 0x179b6b1cb6755e31
    // This transaction sets up account 0x01 for the marketplace tutorial
    // by publishing a Vault reference and creating an empty NFT Collection.
    transaction {
        prepare(acct: AuthAccount) {
          // create a new vault instance with an initial balance of 30
        let vaultA <- FungibleToken.createEmptyVault()

        // Store the vault in the account storage
        acct.save<@FungibleToken.Vault>(<-vaultA, to: /storage/MainVault)

        // Create a public Receiver capability to the Vault
        let ReceiverRef = acct.link<&FungibleToken.Vault{FungibleToken.Receiver, FungibleToken.Balance}>(/public/MainReceiver, target: /storage/MainVault)

        log("Created a Vault and published a reference")
    
        // store an empty NFT Collection in account storage
        acct.save<@NonFungibleToken.Collection>(<-NonFungibleToken.createEmptyCollection(), to: /storage/NFTCollection)
    
        // publish a capability to the Collection in storage
        acct.link<&{NonFungibleToken.NFTReceiver}>(/public/NFTReceiver, target: /storage/NFTCollection)
    
        log("Created a new empty collection and published a reference")
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

export default setupNFTCollection