const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TenderModule", (m) => {
  const tenderLedger = m.contract("TenderLedger");
  return { tenderLedger };
});