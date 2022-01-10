

const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  
  const waitTime = 10.8 * 1000;
  
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther('0.1'),
  });
  await waveContract.deployed();
  
  let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  
  console.log(`✡ Contract Address: ${waveContract.address}`);
  console.log(`Contract Owner: ${owner.address}`);
  console.log(`💰 Account Balance: ${hre.ethers.utils.formatEther(contractBalance)}`);

  let waveCount;
  waveCount = await waveContract.getTotalWaves();
  
  let waveTxn = await waveContract.wave("Web3 is gonna be expensive as F*cK!");
  await waveTxn.wait();
  
  waveCount = await waveContract.getTotalWaves();
  console.log(`waveCount: ${waveCount}`)
  
  try {
    console.log('[+] Attempting 2nd wave quickly that should fail');
    let waveTxn2 = await waveContract.wave("This txn should fail!");
    await waveTxn2.wait();
      
    console.log(`[-] Contract Failed to stop 2nd wave within cooldown peroid (${waitTime}seconds)!!!!`);
  } catch (err) {
    console.log(`[*] Contract cooldown working as expected!\n\tContract Error: ${err}`)
  }
  
  let winCount = 0;
  let runCount = 1;
  
  console.log('[+] Testing if we can win more than 3 times');
  
  while (winCount < 3){
    console.log(`Wins: ${winCount}`);
    console.log(`Waiting for ${waitTime} milliseconds...`);
    sleep(waitTime);
    
    try {
      console.log(`[+] Attempting wave ${runCount} after cooldown peroid from same address`);
      waveTxn2 = await waveContract.wave("THis might show up!");
      let resp = await waveTxn2.wait();
      // console.log(resp);
      console.log('[*] Cooldown working as expected.')
      runCount += 1;
      
      let wavers = await waveContract.getWavers();
      
      let wins = wavers.filter(wave => wave[3] === true);
      winCount = wins.length;

    } catch (err) {
      console.log(`[-] Contract cooldown not working as expected!\n\tContract Error: ${err}`);
    }
    
  }
  
  waveTxn = await waveContract.connect(randomPerson).wave('Heyo from Madigasicar heffers!');
  await waveTxn.wait();
  
  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(`💰 New Account Balance: ${hre.ethers.utils.formatEther(contractBalance)}`);
  
  waveCount = await waveContract.getTotalWaves();
  
  let wavers = await waveContract.getWavers();
  
  console.log(wavers);
  
};


const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

runMain();


function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}