const axios = require("axios");
const utils = require("./utils");
var async = require("async");

let browser = null;
let page = null;
let currentStatus = "Waiting for your order";
function getStatus() {
  return currentStatus;
}
async function waitThenGetElement(selector, unique, timeout) {
  await page.waitForSelector(selector, { timeout: timeout || 60000 });
  await utils.sleep(2000);
  if (unique) {
    return await page.$(selector);
  }
  return await page.$$(selector);
}
async function typeToInput(selector, text) {
  await waitThenGetElement(selector);
  await page.type(selector, text, { delay: 50 });
}
async function evalScript(selector, evalCb) {
  await waitThenGetElement(selector);
  return await page.$eval(selector, evalCb);
}
async function run() {
  browser = await utils.getPuppeteerBrowser();
  page = await browser.newPage();
  await page.goto(
    "https://www.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3Fref_%3Dnav_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&"
  );
}
async function checkout(productList) {
  currentStatus = "Processing...";
  await page.goto("https://www.amazon.com/gp/cart/view.html?ref_=nav_cart");
  try {
    const remains = await waitThenGetElement(
      `input[name*='submit.delete.']`,
      false,
      5000
    );
    for (let i = 0; i < remains.length; i++) {
      await remains[i].click();
    }
  } catch {}

  for (let i = 0; i < productList.length; i++) {
    currentStatus =
      "Adding " + (i + 1) + "/" + productList.length + " products";
    await page.goto(productList[i]);
    (await waitThenGetElement("#add-to-cart-button", true)).click();
    try {
      await page.waitForNavigation({ timeout: 2000 });
    } catch {}
  }
  currentStatus = "Checking out...";
  await page.goto("https://www.amazon.com/gp/cart/view.html?ref_=nav_cart");
  (await waitThenGetElement("#sc-buy-box-ptc-button", true)).click();
  await page.waitForNavigation({ timeout: 10000 });
  (await waitThenGetElement(".a-button-primary", true)).click();
  await page.waitForNavigation({ timeout: 10000 });
  await page.goto(
    "https://www.amazon.com/gp/buy/spc/handlers/display.html?hasWorkingJavascript=1"
  );
  currentStatus = "Completed your order!";
}

module.exports = { run, checkout, getStatus };
