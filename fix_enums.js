const fs = require("fs");
const path = require("path");

const mapBookingStatus = {
  "BookingStatus.BOOKING": "BookingStatus.PENDING_PAYMENT",
  "BookingStatus.AWAITING_PAYMENT": "BookingStatus.PENDING_PAYMENT",
  "BookingStatus.PAID": "BookingStatus.CONFIRMED",
  "\"BOOKING\"": "\"PENDING_PAYMENT\"",
  "\"AWAITING_PAYMENT\"": "\"PENDING_PAYMENT\"",
  "\"PAID\"": "\"CONFIRMED\""
};

const mapPaymentStatus = {
  "PaymentStatus.PENDING": "PaymentStatus.UNPAID",
  "\"PENDING\"": "\"UNPAID\"",
  "BookingGroupStatus.PENDING": "BookingGroupStatus.PENDING_PAYMENT",
  "BookingGroupStatus.AWAITING_PAYMENT": "BookingGroupStatus.PENDING_PAYMENT",
  "BookingGroupStatus.PAID": "BookingGroupStatus.CONFIRMED"
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== ".git" && file !== "generated") {
        processDir(fullPath);
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf8");
      let changed = false;
      
      for (const [key, value] of Object.entries(mapBookingStatus)) {
        if (content.includes(key)) {
          content = content.replaceAll(key, value);
          changed = true;
        }
      }
      for (const [key, value] of Object.entries(mapPaymentStatus)) {
        // Need to be careful with "PENDING" as it might be used elsewhere, 
        // but since we look for exact match with PaymentStatus.PENDING it should be fine.
        if (key === "\"PENDING\"") {
          // let's skip global "PENDING" replacement unless it's in a specific context
        } else {
          if (content.includes(key)) {
            content = content.replaceAll(key, value);
            changed = true;
          }
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log("Updated", fullPath);
      }
    }
  }
}
processDir("./app");
processDir("./components");
processDir("./lib");

