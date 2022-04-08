var nodes = document.querySelectorAll(".list-item");
var data = [];
var sum = 0;

for (var i = 0; i < nodes.length; i++) {
  var n = nodes[i];
  var valid = n.querySelector(".list-item--name").textContent.trim();
  var countStr = n.querySelector(".list-item__amount").textContent.trim().split("\n")[0].replace(/,/g, "");
  var count = Number(countStr);
  data.push({
    name: valid,
    stake: count,
    perc: 0,
  });
  sum += count;
}

for (var i = 0; i < data.length; i++) {
  data[i].perc = data[i].stake / sum;
}

console.log("");
console.log("Count:", data.length);
console.log("Sum:", sum);
console.log(data);
