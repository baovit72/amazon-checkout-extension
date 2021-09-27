// chrome.runtime.sendMessage({ url: location.href }, function (response) {
//   console.log("DONE");
// });
function getCartItemsRaw() {
  return new Promise(function (resolve, reject) {
    fetch("https://www.amazon.com/gp/cart/view.html?ref_=nav_cart")
      .then((data) => data.text())
      .then((data) => resolve(data));
  });
}
async function getCartItems() {
  const rawCart = await getCartItemsRaw();
  const cartDom = new DOMParser().parseFromString(rawCart, "text/html");
  const items = cartDom.querySelectorAll("#sc-active-cart .a-fixed-left-grid");
  const jsonItems = [...items].map((item) => ({
    url: item.querySelector(".a-link-normal").href,
    quantity: +item.querySelector(".a-dropdown-prompt").innerText,
  }));
  const newJsonItems = [].concat.apply(
    [],
    jsonItems.map((item) => new Array(item.quantity).fill(item.url))
  );
  return newJsonItems;
}
console.log("inject message listenner!");
chrome.runtime.onMessage.addListener(async (message) => {
  const { action } = message;
  switch (action) {
    case "checkout":

    case "cart":
      chrome.runtime.sendMessage(
        { type: "cart", items: await getCartItems() },
        function (response) {
          console.log("DONE");
        }
      );
      break;
  }
});
