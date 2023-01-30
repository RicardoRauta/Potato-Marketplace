import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import swordImg from '../sword.png';
import acessoryImg from '../necklace.png';
import armorImg from '../armor.png';

function sortByPower(a, b)
{
    if (a.power < b.power)
        return 1;
    if (a.power > b.power)
        return -1;
    return 0;
}

export default function Marketplace() {
const sampleData = [

];
const [data, updateData] = useState(sampleData);
const [dataFetched, updateFetched] = useState(false);

async function getAllAssets() {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum, "goerli");
    const signer = provider.getSigner();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    let transaction = await contract.getAllAssetsOnMarket()

    //Fetch all the details of every NFT from the contract and display
    const items = await Promise.all(transaction.map(async i => {
        let assetContract = new ethers.Contract(i, MarketplaceJSON.abiAsset, signer)
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
        return item;
    }))
    items.sort(sortByPower);

    updateFetched(true);
    updateData(items);
}

if(!dataFetched)
    getAllAssets();

return (
    <div>
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-20">
            <div className="md:text-xl font-bold text-white">
                Top Assets
            </div>
            <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                {data.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                })}
            </div>
        </div>            
    </div>
);

}