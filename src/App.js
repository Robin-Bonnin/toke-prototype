import React, { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import * as sdk from "@onflow/sdk";
import * as types from "@onflow/types";
import forSale from './flow-scripts/ids-and-names-for-sale'
import forSalePrices from './flow-scripts/ids-and-prices-for-sale'
import idsAndNamesOwned from './flow-scripts/ids-and-names-owned'
import setupNFTCollection from './flow-scripts/setup-nft-collection'
import setupSaleCollection from './flow-scripts/setup-sale-collection-mint'
import buyAsset from './flow-scripts/buy-asset'
import sellAsset from './flow-scripts/sell-asset'
import './App.css';


// Can not do in website : Mint asset, deploy smart contracts to accounts


fcl.config()
  .put("challenge.handshake", "http://localhost:8701/flow/authenticate")

const users = localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')) : []
console.log(users)
function App() {
  const [user, setUser] = useState(null);
  const [forSaleIdsAndNames, setforSaleIdsAndNames] = useState([]);
  const [forSaleIdsAndPrices, setforSaleIdsAndPrices] = useState([]);

  const [ownedAssets, setownedAssets] = useState([]);
  const [assetId, setassetId] = useState(''); // '' is the initial state value

  const [price, setPrice] = useState(null);
  const [globalSale, setGlobalSale] = useState([]);

  const handleUser = (user) => {
    if (user.cid) {
      setUser(user);
      const found = users.find(member => member.address === user.addr)
      if (found == null) {
        users.push({ id: user.cid, address: user.addr, name: user.identity.name })
        localStorage.setItem('users',JSON.stringify(users))
      } else {
      }
    } else {
      setUser(null);
    }
  };
 
  useEffect(() => {
    return fcl.currentUser().subscribe(handleUser);
  }, []);

  const callSetupNFTCollection = async () => {
    await setupNFTCollection();
  };

  const callSetupSaleCollection = async () => {
    await setupSaleCollection();
  };

  const callIdNameAndPriceForSale = async (address) => {
    const idsAndNames = await forSale(address);
    setforSaleIdsAndNames(idsAndNames);
    const saleList = await forSalePrices(address)
    setforSaleIdsAndPrices(saleList)
    return saleList
  }

  const callSellAssett = async (id, price) => {
    await sellAsset(id, price)
  }

  const callbuyAssetAssett = async (sellerAddress,assetId, price) => {
    await buyAsset(sellerAddress,assetId, price)
  }

  const callOwned = async (address) => {
    const ids = await idsAndNamesOwned(address);
    setownedAssets(ids);
  };

  const resetData = async () => {
    setforSaleIdsAndPrices([])
    setforSaleIdsAndNames([])
    setownedAssets([])
    setassetId('')
    setPrice([])
    setUser([])
  }

  const callGlobalSale = async () => {
    const selling = []
    if (users.length) {
      for (const use of users) {
        const sale = await callIdNameAndPriceForSale(use.address)
        selling.push({
          id: use.id,
          name: use.name,
          address:use.address,
          sell: sale
        })
      }
      setGlobalSale(selling)
      console.log(globalSale)

    } else {
      alert("No one is selling")
    }
  }



  const userLoggedIn = user && !!user.cid

  return (
    <div className="body">
      {!userLoggedIn ? (
        <>
          <div>
            <button onClick={() => {
              resetData()

              fcl.authenticate();
            }}
            >
              Login
            </button>
            <button onClick={() => callGlobalSale()}
            >
              What our members sell
            </button>
            <div><ul>
              {globalSale.map((user, index) => (
                <>
                  <div>{user.name} is selling : </div>
                  {
                    user.sell.map(sale => (
                      <li>{Object.keys(sale)} is for sale at : {Object.values(sale)} flow coins  <button className="buying-button" >Buy</button></li>
                    ))
                  }
              </>
              ))}
            </ul>
            </div>
          </div>
        </>
      )
        : (
          <>
            <button onClick={() => callSetupNFTCollection()}
            >
              Setup NFT collection
        </button>
            <button onClick={() => callSetupSaleCollection()}
            >
              Setup sale collection
        </button>
            <div className="section">
              <label>Id of the asset: </label>
              <input onInput={e => setassetId(e.target.value)} />
              <input onInput={e => setPrice(e.target.value)} />
            </div>
            <button onClick={() => callSellAssett(assetId, price)}
            >

              Sell asset
        </button>
            <h1 className="welcome">Welcome, {user.identity.name}</h1>
            <p>Your Address :
              <b>
                {user.addr}
              </b>
            </p>
            <div>
              <button onClick={() => callIdNameAndPriceForSale(user.addr)}
              >
                Check your sales
        </button>
              <p className="script-result">Assets for sale :</p>
              <ul>  {forSaleIdsAndPrices.map((asset, index) =>
                (<li key={index}>{Object.keys(asset)} is for sale at : {Object.values(asset)} flow coins </li>)
              )}
              </ul>
            </div>

            <button onClick={() => callOwned(user.addr)}
            >
              Check your assets
        </button>
            <p className="script-result" >Assets owned : </p>
            <ul>  {ownedAssets.map((ownedAsset, index) => {
              return <li key={index}>You own {Object.values(ownedAsset)} with id : {Object.keys(ownedAsset)}</li>
            })}
            </ul>

            <button onClick={() => callGlobalSale()}
            >
              What our members sell
            </button>
            <div><ul>
              {globalSale.map((user, index) => (
                <>
                  <div>{user.name} is selling : </div>
                  {
                    user.sell.map(sale => (
                      <li>{Object.keys(sale)} is for sale at : {Object.values(sale)} flow coins  <button className="buying-button" onClick={()=>{callbuyAssetAssett(user.address,Object.keys(sale),Object.values(sale))}} >Buy</button></li>
                    ))
                  }
              </>
              ))}
            </ul>
            </div>

            <button onClick={() => {
              fcl.unauthenticate();
              resetData();
            }}>Logout</button>
          </>
        )
      }
      <p className="script-result" >Users list : </p>
      <ul>  {users.map((member, index) => {
        return <li key={index}>{member.name} has address {member.address} with id {member.id}</li>
      })}
      </ul>
    </div >
  );
}

export default App;
