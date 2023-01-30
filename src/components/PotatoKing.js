import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import swordImg from '../sword.png';
import acessoryImg from '../necklace.png';
import armorImg from '../armor.png';
import potatoKingImg from '../potatoKing.webp';

export default function PotatoKing() {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [currAddress, updateCurrAddress] = useState("0x");

async function getKingData() {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();

    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

    let value = ethers.utils.formatUnits((await contract.kingBalance()).toString(), 'ether');

    let data = {
        kingPower: parseInt(await contract.bossPower()),
        kingAddress: await contract.boss(),
        kingBalance: value,
    }

    updateData(data);
    updateFetched(true);
    updateCurrAddress(addr);
}

async function kingBattle()
{
    const ethers = require("ethers");

    let confirmValue = window.confirm("If you become the king you will gain half of the balance and the former king will gain the other half, resetting it. Would you like to battle for the throne?");
    if (!confirmValue) return;

    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();

    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

    const result = await contract.bossBattle();

    if (result)
        alert('You you have become the new king!! Congratulations on your achievement!');
    else
        alert('You lose the battle!');
}

let image = potatoKingImg;

if(!dataFetched)
    getKingData();


return (
    <div style={{"min-height":"100vh"}}>
        <Navbar></Navbar>
        <div className="flex ml-20 mt-20">
            <img src={image} width="300" height="300" alt="" className="p-3 mb-2 bg-primary bg-gradient text-white rounded-5"/>
            
            <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                <div>
                    Address: {data.kingAddress}
                </div>
                <div>
                    Power: {data.kingPower}
                </div>
                <div>
                    Balance: <span className="">{data.kingBalance + " ETH"}</span>
                </div>
                <div>
                    { currAddress != data.kingAddress ?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => kingBattle()}>Battle for the throne</button>
                        : <button className="enableEthereumButton bg-red-500 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => kingBattle()}>You are the King</button>
                    }   
                </div>
            </div>
        </div>
    </div>
);

}