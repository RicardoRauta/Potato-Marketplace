import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import swordImg from '../sword.png';
import acessoryImg from '../necklace.png';
import armorImg from '../armor.png';

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");

function changeColor(id, power)
{
    const divElem = document.getElementById(id);
    let value = power / 120.0;
    divElem.addEventListener('click', () => {
        divElem.style.backgroundColor = 'rgba(' 
            + Math.floor(value * 255) + ',' + Math.floor(value * 255) 
            + ',' + Math.floor(value * 255) + '\)'
    })
}

async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum, "goerli");
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    
    const asset = await contract.idToAsset(tokenId);
    const assetContract = new ethers.Contract(asset, MarketplaceJSON.abiAsset, signer)
    let name = await assetContract.name();
        let image = swordImg;
        if (name == "Accessory") image = acessoryImg;
        else if (name == "Armor") image = armorImg;

    let value = ethers.utils.formatUnits((await assetContract.value()).toString(), 'ether');
    let item = {
        value,
        image,
        tokenId: parseInt(await assetContract.assetId()),
        owner: await assetContract.owner(),
        name,
        power: parseInt(await assetContract.power()),
    }

    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
}

async function buyNFT(tokenId) {
    try {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const salePrice = ethers.utils.parseUnits(data.value, 'ether')
        updateMessage("Buying the Asset... Please Wait (Upto 5 mins)")
        //run the executeSale function
        let transaction = await contract.buyAsset(tokenId, {value:salePrice});
        await transaction.wait();

        alert('You successfully bought the Asset!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}

async function sellNFT(tokenId) {
    try {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        var price = prompt("Enter a Value", "0.01");
        const salePrice = ethers.utils.parseUnits(price, 'ether')
        updateMessage("Puting the Asset on Market...")
        //run the executeSale function
        let transaction = await contract.putAssetToSale(tokenId, salePrice);
        await transaction.wait();

        alert('You successfully put the Asset on Market!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}

    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
        getNFTData(tokenId);

    return(
        <div style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="flex ml-20 mt-20">
                <img src={data.image} width="300" height="300" alt="" className="p-3 mb-2 bg-primary bg-gradient text-white rounded-5"/>
                
                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Power: {data.power}
                    </div>
                    <div>
                        Price: <span className="">{data.value + " ETH"}</span>
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                    { currAddress != data.owner ?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this Asset</button>
                        : <button className="enableEthereumButton bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => sellNFT(tokenId)}>Sell this Asset</button>
                    }
                    
                    <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}