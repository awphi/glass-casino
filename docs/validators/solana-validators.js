var trs = document.querySelectorAll('tr[id^="row"]');
var data = [];
var sum = 0;

for (var i = 0; i < trs.length; i++) {
  var d = trs[i].querySelector(".column-info");
  var valid = d.querySelector("a").textContent.trim().split(" ", 2)[1];
  var small = d.querySelectorAll("small");
  var sm = small[1];
  if (valid === "Private Validator") {
    sm = small[0];
  }
  var split = sm.textContent.trim().split("\n");
  var percStr = split[1].trim().replace(/\(|%|\)/g, "");
  var countStr = split[0].replace(/,/g, "");
  var count = Number(countStr);
  console.log(valid, percStr);
  var perc = Number(percStr) / 100;
  data.push({
    name: valid,
    stake: count,
    perc: perc,
  });
}
