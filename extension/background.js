function checkout(items) {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      products: [...items],
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://localhost:3000/processOrder", requestOptions)
      .then((response) => response.text())
      .then((result) => resolve(result))
      .catch((error) => reject("error", error));
  });
}
chrome.runtime.onMessage.addListener(async (message, sender) => {
  const { type } = message;
  switch (type) {
    case "checkout":
      checkout(message.items);
  }
});
setInterval(() => {
  fetch("http://localhost:3000/processOrder")
    .then((res) => res.json())
    .then((data) =>
      chrome.runtime.sendMessage({
        type: "status",
        status: data.status,
      })
    );
}, 1000);
