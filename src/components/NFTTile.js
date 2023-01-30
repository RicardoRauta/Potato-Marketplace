import axie from "../tile.jpeg";
import {
    BrowserRouter as Router,
    Link,
  } from "react-router-dom";

function NFTTile (data) {
    const newTo = {
        pathname:"/nftPage/"+data.data.tokenId
    }

    let color = 'white';
    if (data.data.power > 20) color = 'yellow';
    if (data.data.power > 50) color = 'blue';
    if (data.data.power > 70) color = 'red';
    if (data.data.power > 90) color = 'purple';
    if (data.data.power > 100) color = 'black';
    

    return (
        <Link to={newTo}>
        <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl" style={{backgroundColor: color,}}>
            <img src={data.data.image} className="" alt="" />
            <div className= "text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
                <strong className="text-xl">{data.data.tokenId} - {data.data.name} - {data.data.power} P</strong>
                <p className="display-inline">
                    {data.data.value} ETH
                </p>
            </div>
        </div>
        </Link>
    )
}

export default NFTTile;
