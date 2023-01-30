import Navbar from "./Navbar";
import { useState } from "react";
import { uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import { useLocation } from "react-router";

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', power: '', value: ''});
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');

    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const {name, power, value} = formParams;
        //Make sure that none of the fields are empty
        if( !name || !power || !value)
            return;

        const nftJSON = {
            name, power, value
        }

        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true){
                console.log("Uploaded JSON to Pinata: ", response)
                return response.pinataURL;
            }
        }
        catch(e) {
            console.log("error uploading JSON metadata:", e)
        }
    }

    async function listNFT(e) {
        e.preventDefault();

        //Upload data to IPFS
        try {
            const metadataURL = await uploadMetadataToIPFS();
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            updateMessage("Please wait.. uploading (up to 2 mins)")

            //Pull the deployed contract instance
            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)

            //massage the params to be sent to the create NFT request
            const value = ethers.utils.parseUnits(formParams.value, 'ether')
            let listingValue = await contract.getListValue()
            listingValue = listingValue.toString()

            //actually create the NFT
            let transaction = await contract.createToken(metadataURL, value, { value: listingValue })
            await transaction.wait()

            alert("Successfully listed your NFT!");
            updateMessage("");
            updateFormParams({ name: '', power: '', value: ''});
            window.location.replace("/")
        }
        catch(e) {
            alert( "Upload error"+e )
        }
    }

    async function mintNFT(e)
    {
        e.preventDefault();
        //Upload data to IPFS
        try {
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            updateMessage("Please wait.. (up to 2 mins)")

            //Pull the deployed contract instance
            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)

            //actually create the NFT
            let transaction = await contract.createAsset({ value: ethers.utils.parseEther("0.02"), gasLimit: 730000 })
            const transactionWait = await transaction.wait();

            let tokenId = parseInt(transactionWait.events[0].args[1]);
            let tokenName = transactionWait.events[0].args[2];
            let tokenPower = parseInt(transactionWait.events[0].args[3]);
            //console.log(transactionWait.events[0].args);
            alert("Successfully mint your Asset!\n" + tokenName + "\nID " + tokenId.toString() + "\nPower " + tokenPower.toString())

            updateMessage("");
            updateFormParams({ name: '', power: ''});
            //window.location.replace("/profile")
        }
        catch(e) {
            alert( "Error"+e )
        }
    }

    console.log("Working", process.env);
    return (
        <div className="">
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-10" id="nftForm">
            <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
                <h3 className="text-center font-bold text-purple-500 mb-8">Mint your Asset</h3>
                    <div className="text-green text-center">{message}</div>
                    <button onClick={mintNFT} className="font-bold mt-10 w-full bg-red-500 text-white rounded p-2 shadow-lg">
                        Mint Asset
                    </button>
            </form>
        </div>
        </div>
    )
}