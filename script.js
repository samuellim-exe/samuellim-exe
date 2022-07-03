// This allows to configure the live components
const CONFIG = {
  // If false, then it will hide it
  cryptocurrency_component_enabled: true,

  // The ticker name
  // Example: btc, eth
  cryptocurrency: "eth",

  // From here: https://forkaweso.me/Fork-Awesome/icons/
  // Example: fa-btc, fa-ethereum
  cryptocurrency_icon: "fa-ethereum",

  // For how many seconds we want to keep our cache
  cache_ttl_seconds: 300,

  // If false, it will hide it
  weather_component_enabled: true,

  // You can Google like this: https://www.google.com/search?client=firefox-b-d&q=penang+coordinates
  weather_latitude: "5.4141",
  weather_longitude: "100.3288",

  // From here https://openweathermap.org/
  // Search and copy the id from the url
  weather_city: "1735106",
};

const WEATHER_CACHE_KEY = "weather_data_cache";
const CRYPTOCURRENCY_CACHE_KEY = "cryptocurrency_price_cache";

async function get_current_weather() {
  let cacheData = cache_get(WEATHER_CACHE_KEY);
  if (cacheData) {
    return cacheData;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${CONFIG.weather_latitude}&longitude=${CONFIG.weather_longitude}&current_weather=true&timezone=Asia%2FSingapore`;
  let response = await fetch(url);
  if (response.status === 200) {
    let payload = await response.json();
    let temp = payload.current_weather.temperature;
    cache_set(WEATHER_CACHE_KEY, temp);
    return temp;
  } else {
    console.error("Got error fetching weather data");
  }
}

async function get_cryptocurrency_price() {
  let cacheData = cache_get(CRYPTOCURRENCY_CACHE_KEY);
  if (cacheData) {
    return cacheData;
  }

  const url = `https://data.messari.io/api/v1/assets/${CONFIG.cryptocurrency}/metrics`;
  let response = await fetch(url);
  if (response.status === 200) {
    let payload = await response.json();
    price = payload.data.market_data.price_usd;
    cache_set(CRYPTOCURRENCY_CACHE_KEY, price);
    return price;
  } else {
    console.error("Got error fetching crypto coin price");
  }
}

async function load_cryptocurrency_component() {
  var formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  let price = await get_cryptocurrency_price();
  let fmtPrice = formatter.format(price);
  let template = `<a href="https://www.coindesk.com/price/${CONFIG.cryptocurrency}/" target="_blank"><i class="fa ${CONFIG.cryptocurrency_icon}" aria-hidden="true"></i> ${fmtPrice}</a>`;
  document.getElementById("cryptocurrency-component").innerHTML = template;
  console.log("Inserted cryptocurrency element");
}

async function load_weather_component() {
  let temp = await get_current_weather();
  let template = `<a href="https://openweathermap.org/city/${CONFIG.weather_city}" target="_blank"><i class="fa fa-sun-o" aria-hidden="true"></i> ${temp}° C</a>`;
  document.getElementById("weather-component").innerHTML = template;
  console.log("Inserted weather element");
}

function cache_set(key, val) {
  console.log(`Caching key: ${key}`);
  localStorage.setItem(
    key,
    JSON.stringify({
      value: val,
      ttl: CONFIG.cache_ttl_seconds,
      timestamp: Math.floor(new Date().getTime() / 1000),
    })
  );
}

function cache_get(key) {
  console.log(`Checking cache for ${key}`);
  let cache = localStorage.getItem(key);

  if (cache) {
    // Check that cache is still valid
    let data = JSON.parse(cache);
    let date = data.timestamp;
    let ttl = data.ttl;

    let dateWithTtl = date + ttl;
    let currDate = Math.floor(new Date().getTime() / 1000);

    if (dateWithTtl > currDate) {
      // Cache is still valid
      console.log(`Cache for ${key} is still valid`);
      return data.value;
    }

    // Cache has expired
    console.log(`Cache for ${key} has expired`);
    return false;
  }

  return false;
}

if (CONFIG.cryptocurrency_component_enabled) {
  load_cryptocurrency_component();
}
if (CONFIG.weather_component_enabled) {
  load_weather_component();
}
