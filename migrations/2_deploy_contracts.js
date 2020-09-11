const EXPOSURE = artifacts.require("EXPOSURE");

module.exports = function(deployer) {
  deployer.deploy(EXPOSURE, "Exposure Coin", "EXPOSURE", 6, 100000000000);
};
