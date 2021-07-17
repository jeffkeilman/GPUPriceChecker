const Newegg = require("./Newegg/Newegg");
const GetDOM = require("./GetDOM/GetDOM");

const newegg = new Newegg('GTX 1660 Super');
console.log(newegg.getBaseLink());
console.log(newegg.getPageLink(2));

GetDOM.getDOM(newegg.getBaseLink()).then((res) => {
    console.log(res);
});