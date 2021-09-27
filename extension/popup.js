let items = [];
document.getElementById("checkout").style.display = "none";

document.getElementById("checkout").onclick = async () => {
  console.log("sent message to background!");
  chrome.runtime.sendMessage({ type: "checkout", items });
  document.getElementById("checkout").style.display = "none";
};
(async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  chrome.tabs.sendMessage(tab.id, { action: "cart" });
})();

chrome.runtime.onMessage.addListener(async (message, sender) => {
  const { type } = message;
  switch (type) {
    case "cart":
      items = message.items;
      document.getElementById("cart-items").innerText = message.items.length;
      document.getElementById("checkout").style.display = "block";
      break;
    case "status":
      document.getElementById("cart-status").innerText = message.status;
      if (message.status.trim() === "Completed your order!") {
        document.getElementById("checkout").style.display = "block";
      } else if (
        message.status.trim() !== "Completed your order!" &&
        message.status.trim() !== "Waiting for your order"
      ) {
        document.getElementById("checkout").style.display = "none";
      }
      break;
  }
});
