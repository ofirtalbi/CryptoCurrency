// משתנים לשמירת הAPI
var coinsListArray = [];
var moreInfoArray = [];
var coinsSymbols = [];
var toggledcoins = [];
var timeInterval = "";

$(function () {
  //On Load

  // API Coins List
  getCoinsFromApiAndPrint();

  // HomePage
  goToHome();

  // Loader gif
  $("#coinsCard").html(`
  <img id="throbber" class= "throbber" src="coin-flip-51.gif" />
  `);

  // Search Button
  $("#searchBtn").on(`click`, function () {
    searchCoin();
  });
  $("#searchInput").on("keypress", function (e) {
    if (e.keyCode === 13) {
      searchCoin();
    }
  });

  // AutoComplete
  // $("#searchInput").autocomplete({
  //   source: coinsSymbols,
  // });

  // Load HomePage
  $("#homeBtn").on(`click`, function () {
    goToHome();
  });

  // About
  $("#aboutBtn").on(`click`, function () {
    goToAbout();
  });

  // LiveReports
  $("#liveReportBtn").on(`click`, function () {
    if (toggledcoins.length === 0) {
      $(`#massageModalTitle`).html("You have to pick at least one coin");
      $(`#massageModalDiv`).modal("show");
    } else {
      goToLiveReport();
    }
  });
});

// AJAX
function getAjax(url) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      success: (data) => resolve(data),
      error: (err) => reject(err),
    });
  });
}

// Print Cards
function printCard(coinsArray) {
  let inHtml = "";
  coinsArray.forEach((coin) => {
    inHtml += `
    <div class="cardContainer col-2">
    <div class="card text-center coinCard" >
    <div class="card-header col-12 ">
    <h5 class="card-title">${coin.symbol}</h5>
    <div class="custom-control custom-switch ">
    <input type="checkbox"
      data-toggle="toggle" 
     data-onstyle="secondary"
     data-offstyle="light"
     data-width="70" 
     data-height="15"
     data-style="ios"
    id="toggle${coin.id}">

    </div>
    </div>
    <div class="card-body">
    <p class="card-text">${coin.name}</p>
    <p>
    <button
    class="btn btn-outline-secondary moreInfoBtn"
    id="${coin.id}"
    onclick="showMoreInfo(this)"
    type="button"
    data-toggle="collapse"
    data-target="#coll${coin.id}"
    aria-expanded="false"
    aria-controls="coll${coin.id}"
    >
    More Info
    </button>
    <div class="collapse" id="coll${coin.id}">
      <img id="${coin.id}Throbber" class= "cardThrobber" src="coin-flip-51.gif" />
    </div>
    </div>
    </div>
    </p>
    </div>`;
  });
  $("#coinsCard").html(inHtml);
  toggle();
}

// Print Coins Onload
async function getCoinsFromApiAndPrint() {
  const coinsFromApi = await getAjax(
    "https://api.coingecko.com/api/v3/coins/list"
  );
  for (let i = 350; i < 450; i++) {
    coinsListArray.push(coinsFromApi[i]);
    coinsSymbols.push(coinsFromApi[i].symbol);
  }
  printCard(coinsListArray);
}

function searchCoin() {
  let typedCoin = $("#searchInput").val().toLowerCase();

  if (typedCoin === "" || typedCoin.length === 0) {
    $("#searchInput").focus();
  } else {
    search(typedCoin);
  }
}

// Search
function search(typedCoin) {
  $("#coinsCard").html(`
  <img id="throbber" class= "throbber" src="coin-flip-51.gif" />
  `);
  let searchedFilterArray = [];
  for (const coin of coinsListArray) {
    if (coin.symbol.includes(typedCoin)) {
      searchedFilterArray.push(coin);
    }
  }
  printCard(searchedFilterArray);
  $("#searchInput").val("");
}

// Home Page
function goToHome() {
  cleanChart();
  $("#coinsCard").html(`
  <img id="throbber" class= "throbber" src="coin-flip-51.gif" />
  `);
  $("#aboutDiv").hide();
  $(`#chartContainer`).hide();
  $(`#liveReportDiv`).hide();

  $("#coinsCard").show();
  printCard(coinsListArray);
}

// About
function goToAbout() {
  cleanChart();
  $("#aboutDiv").html(`
  <img id="throbber" class= "throbber" src="coin-flip-51.gif" />
  `);
  $("#coinsCard").hide();
  $(`#liveReportDiv`).hide();
  $("#chartContainer").hide();
  $("#aboutDiv").show();

  aboutPage();
}

// Live Reports
function goToLiveReport() {
  $("#liveReportDiv").html(`
  <img id="throbber" class= "throbber" src="coin-flip-51.gif" />
  `);
  $("#aboutDiv").hide();
  $("#coinsCard").hide();
  $("#chartContainer").show();

  liveReports();
}

// More Info
function showMoreInfo(thisBtn) {
  const thisId = thisBtn.id;
  let storedMoreInfoArray = localStorage.getItem("storedMoreInfoArray");

  storedMoreInfoArray === null
    ? (moreInfoArray = [])
    : (moreInfoArray = JSON.parse(storedMoreInfoArray));

  const coinIndexInArray = moreInfoArray.findIndex(
    (coin) => coin.id === thisId
  );

  if (
    coinIndexInArray !== -1 &&
    isOverTwoMin(moreInfoArray[coinIndexInArray].timeCoinWasAdded) === true
  ) {
    removeCoinFromeStorage(coinIndexInArray);
    addCoinInfoToStorageAndPrint(thisId);
  } else if (coinIndexInArray === -1) {
    addCoinInfoToStorageAndPrint(thisId);
  } else {
    fillCollapseWithInfo(moreInfoArray[coinIndexInArray]);
  }

  changeButtonText(thisBtn);

  newMoreInfoArray = JSON.stringify(moreInfoArray);
  localStorage.setItem("storedMoreInfoArray", newMoreInfoArray);
}

async function addCoinInfoToStorageAndPrint(id) {
  const coinInfo = await getAjax(
    `https://api.coingecko.com/api/v3/coins/${id}`
  );

  const newCoinToStorage = {
    id: id,
    coinInfo: coinInfo,
    timeCoinWasAdded: new Date().getTime(),
  };

  fillCollapseWithInfo(newCoinToStorage);

  moreInfoArray.push(newCoinToStorage);
  const newMoreInfoArray = JSON.stringify(moreInfoArray);
  localStorage.setItem("storedMoreInfoArray", newMoreInfoArray);
}

// Collapse
function fillCollapseWithInfo(coinObject) {
  let MoreInfoHtmlToBe = `
    <div class="col-12">
    <img class="card-img-top moreInfoImg col-5" 
    src="${coinObject.coinInfo.image.large}" alt="Card image">
    </div>
    
    <span>${coinObject.coinInfo.market_data.current_price.usd} $</span><br>
    <span>${coinObject.coinInfo.market_data.current_price.eur} €</span><br>
    <span>${coinObject.coinInfo.market_data.current_price.ils} ₪</span>
    `;
  $(`#coll${coinObject.coinInfo.id}`).html(MoreInfoHtmlToBe);
}

function isOverTwoMin(timeCoinWasAdded) {
  const nowTime = new Date().getTime();
  const difference = nowTime - timeCoinWasAdded;
  const resultInMinutes = difference / 60000;
  return resultInMinutes >= 2 ? true : false;
}

function removeCoinFromeStorage(coinIndexInArray) {
  moreInfoArray.splice(coinIndexInArray, 1);
}

function changeButtonText(btn) {
  if (btn.innerText === "More Info") {
    btn.innerText = "Less Info";
    btn.classList.remove("btn-outline-secondary");
    btn.classList.add("btn-secondary");
  } else {
    btn.innerText = "More Info";
    btn.classList.remove("btn-secondary");
    btn.classList.add("btn-outline-secondary");
  }
}

// Toggle
function toggle() {
  coinsListArray.forEach((coin) => {
    const thisName = coin.name;
    const thisId = coin.id;
    const thisSymbol = coin.symbol;
    $(`#toggle${thisId}`).bootstrapToggle();
    $(`#toggle${thisId}`).on(`change`, function () {
      if ($(this).prop("checked")) {
        toggledcoins.push({
          id: thisId,
          name: thisName,
          symbol: thisSymbol,
        });
      } else {
        toggleOff(thisId);
      }

      if (toggledcoins.length > 5) {
        let modalHtmlToBe = "";
        for (let i = 0; i < toggledcoins.length; i++) {
          modalHtmlToBe += `
          <br>
          <div class="modalRow col-12">
          <h5 class="col-11 modalH5">${toggledcoins[i].id} (${toggledcoins[i].symbol})</h5>
          <div class="col-1 custom-control custom-switch modalInputDiv">
          <input type="checkbox" checked class="custom-control-input .col-md-4 .ml-auto modaInput" onclick="toggleOffModal(this)" id="${toggledcoins[i].name}">
          <label class="custom-control-label" for="${toggledcoins[i].name}"></label>
          </div>
          </div>
    `;
        }

        $(`#toggleModal`).html(modalHtmlToBe);
        $("#modalDiv").modal({ backdrop: "static" });
        $(`#modalDiv`).modal("show");
      }
    });
  });
}

function toggleOff(thisId) {
  const index = toggledcoins.findIndex(({ id }) => id === thisId);
  console.log(index);
  toggledcoins.splice(index, 1);
}

function toggleOffModal(btn) {
  const offObject = toggledcoins.find((Object) => btn.id === Object.name);
  $(`#toggle${offObject.id}`).bootstrapToggle("off");
  $(`#modalDiv`).modal("hide");
}

// Live Reports

function liveReports() {
  let coinString = "";
  for (let coin of toggledcoins) {
    coinString += coin.symbol + ",";
  }

  let currencyArr = [];
  async function currentPrice() {
    currencyArr = [];
    let api = await getAjax(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinString}&tsyms=USD`
    );
    try {
      let data = [];
      data.push(api);
      for (let coin of data) {
        for (let p in coin) {
          currencyArr.push(coin[p].USD);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  currentPrice();

  var options = {
    zoomEnabled: true,
    title: { text: "Coin Comparison" },
    axisY: { prefix: "$" },
    toolTip: { shared: true },
    legend: {
      cursor: "pointer",
      verticalAlign: "top",
      fontSize: 22,
      fontColor: "dimGrey",
      itemclick: toggleDataSeries,
    },
    data: [],
  };
  var chart = new CanvasJS.Chart("chartContainer", options);

  for (coin of toggledcoins) {
    options.data.push({
      type: "line",
      xValueType: "dateTime",
      yValueFormatString: "$####.00",
      xValueFormatString: "hh:mm:ss",
      showInLegend: true,
      name: coin.id,
      dataPoints: [],
    });
  }

  function toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    chart.render();
  }

  async function updateChart() {
    let notReportableCoins = [];
    await currentPrice();
    for (let i = 0; i < toggledcoins.length; i++) {
      let coin = options.data[i].dataPoints;
      let currentTime = new Date().getTime();
      if (typeof currencyArr[i] === "number") {
        coin.push({
          y: currencyArr[i],
          x: currentTime,
        });
      } else {
        notReportableCoins.push(toggledcoins[i].symbol.toUpperCase());
        $(`#liveReportDiv`).html(
          `Can't show details about ${notReportableCoins} at the moment`
        );
        $(`#liveReportDiv`).show();
      }
    }
    $(`#throbber`).hide();
    chart.render();
  }

  chart.render();
  updateChart();

  timeInterval = setInterval(() => updateChart(), 2000);
}

function cleanChart() {
  clearInterval(timeInterval);
}

// About Page

function aboutPage() {
  $("#aboutDiv").html(`
  <div class="about-section">
  <div class="inner-container">
      <h1>About The Project</h1>
      <p class="text">
          <p id="mainText">This project accesses information and reports from the virtual trade world. The virtual trade world has become very popular in recent years. Still, at the same time, a variety of APIs have been created that provide free information (usually with a one-time registration) about the status of currencies, price, history, buying and more.</p>
          <br>
          <div id="infoDiv">
          <p><b>Languages used:</b>
          HTML,
          CSS,
          Java Script,
          JQuery,
          Json & Ajax,
          Bootstrap
          </p>
          <p> <b>API:</b> api.coingecko.com , www.cryptocompare.com
          </p>
          </div>
          <br>
          <div id="detailsDiv">
          <p><b>Develop & Design by:</b> Ofir Talbi</p>
          <p><b>City:</b> Tel Aviv</p>
          <p><b>Tel:</b> +972 54-2233915</p>
          <p><b>Email:</b> ofirtalbi@gmail.com</p>
          </div>
      </p>
      
  </div>
</div>
  `);
}
