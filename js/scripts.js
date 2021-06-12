const getCoord = (coordDeg) => ol.proj.transform(coordDeg, 'EPSG:4326', 'EPSG:3857');
const change = (arr) => [arr[1], arr[0]];

const init = () => {
  const googleCoord = [-25.785, 132.28]; // 47.24, 39.71 - дгту парк, -25.785, 132.28 - авст.
  const map = new ol.Map({
    view: new ol.View({
      center: getCoord(change(googleCoord)),
      zoom: 4,
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
      url: '../data.json',
    }),
    style: cityStyle,
  });

  map.addLayer(pinsLayer);


  // Pin Click
  const nav = document.querySelector('.nav');
  const city = {
    text: document.querySelector('#cityname'),
    img: document.querySelector('#cityimage'),
  };
  const mapView = map.getView();

  const itemClickHandler = (feature, el) => {
    console.log(feature.values_.geometry.flatCoordinates);

    // change active nav element
    nav.querySelector('.active').classList.remove('active');
    el.classList.add('active');

    // change the view
    mapView.animate(
      {center: feature.values_.geometry.flatCoordinates},
      {zoom: 5},
    );

    // change features styles
    const allFeat = pinsLayer.getSource().getFeatures();
    allFeat.forEach(f => {
      f.setStyle(cityStyle(f));
    });
    feature.setStyle(activeStyle(feature));

    // change legend
    city.text.innerHTML = `Active city is: ${feature.values_.city}`;
    city.img.src = `./img/${feature.values_.city}.jpg`
  };

  // pin clicks
  map.addEventListener('click', (e) => {
    map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
      // console.log(feature.values_.city);
      const navEl = nav.children.namedItem(feature.values_.city);
      itemClickHandler(feature, navEl);
    });
  });

  // nav clicks
};

window.onload = init;
