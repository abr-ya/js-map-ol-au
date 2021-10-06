const getCoord = (coordDeg) => ol.proj.transform(coordDeg, 'EPSG:4326', 'EPSG:3857');
const change = (arr) => [arr[1], arr[0]];
const googleCoord = [-25.785, 132.28]; // 47.24, 39.71 - дгту парк, -25.785, 132.28 - авст.
const startCoord = getCoord(change(googleCoord));
const initialZoom = 4;
const featureZoom = 5;

const init = (dataURL) => {
  // Map object
  const map = new ol.Map({
    view: new ol.View({
      center: startCoord,
      zoom: initialZoom,
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    target: 'map',
  })


  // Pins and styles
  const createPin = (text, color, bgColor, borderColor) => (
    new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({color: bgColor}),
        stroke: new ol.style.Stroke({
          color: borderColor,
          width: 2,
        }),
        radius: 10,
      }),
      text: new ol.style.Text({
        text,
        scale: 1.5,
        fill: new ol.style.Fill({color}),
      })
    })
  );

  const cityStyle = (f) => {
    styles = createPin(f.values_.id.toString(), 'red', [0, 255, 0, 0.3], [0, 255, 0, 0.9]);
    return styles;
  }

  const activeStyle = (f) => {
    styles = createPin(f.values_.id.toString(), 'blue', [0, 255, 0, 0.3], 'red');
    return styles;
  }

  const pinsLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: dataURL, // ../data.json // переменная при вызове init!
    }),
    style: cityStyle,
  });

  map.addLayer(pinsLayer);
  // Pins and styles end


  // Create NavItems
  const updateNav = () => {
    const allFeat = pinsLayer.getSource().getFeatures();
    allFeat.forEach(f => {
      const city = f.values_.city;
      const item = document.createElement('a');
      item.innerHTML = `<i class='far fa-circle'></i>`;
      item.setAttribute('title', city);
      item.setAttribute('id', city);
      nav.appendChild(item);
    });

    // nav clicks - navItems
    const navItems = document.querySelectorAll('.nav > a');
    const navItemClickHandler = (item) => {
      const allFeat = pinsLayer.getSource().getFeatures();
      const currentFeature = allFeat.find(f => f.values_.city === item.id);
      itemClickHandler(currentFeature, item); // без фичи должно работать!
    };

    navItems.forEach(item => {
      item.addEventListener('click', () => navItemClickHandler(item));
    });
  };
  setTimeout(() => {
    updateNav();
  }, 50);


  // Pin or Nav Click
  const nav = document.querySelector('.nav');
  const city = {
    text: document.querySelector('#cityname'),
    img: document.querySelector('#cityimage'),
  };
  const mapView = map.getView();

  // Main (common) switch function
  // срабатывает и на пункте меню, и на метке на карте
  // если feature не передана - это Home
  const itemClickHandler = (feature, el) => {
    // console.log('itemClickHandler');
    // change active nav element
    nav.querySelector('.active').classList.remove('active');
    el.classList.add('active');

    // change the view
    const center = feature ? feature.values_.geometry.flatCoordinates : startCoord;
    const zoom = feature ? featureZoom : initialZoom;
    mapView.animate({center, zoom});

    // change features styles
    const allFeat = pinsLayer.getSource().getFeatures();
    allFeat.forEach(f => {
      f.setStyle(cityStyle(f));
    });
    if (feature) feature.setStyle(activeStyle(feature));

    // change legend: text and images
    if (feature) {
      city.text.innerHTML = `Active city is: ${feature.values_.city}`;
      city.img.src = `./img/${feature.values_.city}.jpg`
    } else {
      city.text.innerHTML = 'go to start state...';
      city.img.src = './img/flag.jpg';
    }
  };
  // /common switch function

  // pin clicks
  map.addEventListener('click', (e) => {
    map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
      // console.log(feature.values_.city);
      const navEl = nav.children.namedItem(feature.values_.city);
      itemClickHandler(feature, navEl);
    });
  });

  // nav clicks - navItems
  // переехала в часть, которую добавляем с задержкой - после генерации
};

window.onload = async () => {
  // возможно, вынести получение данных сюда
  // подробнее: https://learn.javascript.ru/fetch
  // чтобы работало - вверх async
  let dataURL = 'https://abr-ya.github.io/js-map-ol-au/data.json';
  let response = await fetch(dataURL);
  let data = await response.json();
  console.log(data);

  init(dataURL);
};
