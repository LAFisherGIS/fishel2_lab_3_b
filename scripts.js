$(document).ready(modeCheck);
$(document).ready(mapping);

/* This code is based on Tero Karvinen's reference implementation (https://terokarvinen.com/2018/save-checkbox-state-to-localstorage-javascript-and-jquery-example/) for the use of localStorage to preserve the state of a checkbox between pages and sessions. */
function modeCheck(){
  let checked="true"==localStorage.getItem("status");
  $("#lightordark").prop('checked', checked)
  $("#lightordark").click(modeSet);
}

function modeSet(){
  let checked=$("#lightordark").is(":checked");
  localStorage.setItem("status", checked);
}

// End Tero-based scripting

function mapping(){
  var map = L.map('map').setView([47.25, -122.44], 11);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      accessToken: 'sk.eyJ1IjoibGFmaXNoZXJnaXMiLCJhIjoiY2t2OXJ4dnV1YTY2ZjJwbnpjM3BxbWRnYiJ9.CW4oaT94TkbelBF0Fj4rJw',
  }).addTo(map);

  L.geoJson(ctData).addTo(map);

  function getColor(d) {
      return d > 6.693878 ? '#2c7bb6' :
            d > 4.930006  ? '#abd9e9' :
            d > 3.877140  ? '#ffffbf' :
            d > 2.964255  ? '#fdae61' :
                            '#d7191c';
  }


  function style(feature) {
      return {
          fillColor: getColor(feature.properties.Vac_rate),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.5
      };
  }

  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
  };

  info.update = function (props) {
      this._div.innerHTML = '<h4>Pierce Census Tract Vacancy</h4>' +  (props ?
          '<b>' + 'Tract Number: ' + props.NAME20 + '</b><br />' + props.TotalHousi + ' Units Total' + '<br />' + props.HousingVac + ' Units Empty' + '<br />' + props.Vac_rate + ' % Vacant'
          : 'Hover over a census tract.');
  };

  info.addTo(map);

  var geojson;

  function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
    info.update(layer.feature.properties);
  }

  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
  }

  geojson = L.geoJson(ctData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 2.964255, 3.877140, 4.930006, 6.693878],
      labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '%' + '<br>' : '%+');
    }

    return div;
  };

  legend.addTo(map);

}
