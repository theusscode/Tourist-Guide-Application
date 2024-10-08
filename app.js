// Variáveis globais
let map, marker, service, directionsService, directionsRenderer;

// Função para inicializar o mapa
function initMap() {
  const santarem = { lat: -2.4434, lng: -54.7078 };

  // Criar o mapa e centralizá-lo em Santarém
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: santarem,
  });

  // Adicionar um marcador inicial em Santarém
  marker = new google.maps.Marker({
    position: santarem,
    map: map,
    title: "Santarém",
  });

  // Inicializar o serviço de busca de locais (Places)
  service = new google.maps.places.PlacesService(map);

  // Inicializar o serviço de direções
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
}

// Função para buscar locais com base no texto inserido
function searchLocation() {
  const query = document.getElementById("search-input").value.trim();
  const filter = document.getElementById("filter").value; // Obter valor do filtro

  if (query) {
    const request = {
      query: query,
      fields: ['name', 'geometry', 'types'], // Adiciona tipos para filtrar
    };

    // Faz a pesquisa usando o serviço Places
    service.findPlaceFromQuery(request, function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        // Filtrar os resultados com base no tipo selecionado
        const filteredResults = results.filter(place => {
          if (!filter) return true; // Se não houver filtro, incluir todos
          return place.types.includes(filter);
        });

        if (filteredResults.length > 0) {
          // Centralizar o mapa no primeiro resultado filtrado
          const location = filteredResults[0].geometry.location;
          map.setCenter(location);
          map.setZoom(14);

          // Atualizar o marcador
          marker.setPosition(location);
          marker.setTitle(filteredResults[0].name);

          // Iniciar a rota a partir da localização atual
          getCurrentLocation(location);
        } else {
          alert('Nenhum local encontrado para: ' + query + ' com o filtro selecionado.');
        }
      } else {
        alert('Nenhum local encontrado para: ' + query);
      }
    });
  } else {
    alert("Por favor, insira um termo de pesquisa.");
  }
}

// Função para obter a localização atual do usuário
function getCurrentLocation(destination) {
  const santarem = { lat: -2.4434, lng: -54.7078 }; // Posição padrão de Santarém

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        calculateRoutes(currentLocation, destination);
      },
      () => {
        alert("Não foi possível obter sua localização. Usando posição inicial padrão.");
        calculateRoutes(santarem, destination); // Usar Santarém como fallback
      }
    );
  } else {
    alert("Geolocalização não é suportada por este navegador. Usando posição inicial padrão.");
    calculateRoutes(santarem, destination); // Usar Santarém como fallback
  }
}

// Função para calcular e exibir a rota entre dois destinos
function calculateRoutes(startLocation, destination) {
  const pointA = { lat: -2.4434, lng: -54.7078 }; // Coordenadas do ponto A
  const pointB = { lat: -2.4550, lng: -54.7125 }; // Coordenadas do ponto B (por exemplo)

  // Rota para o ponto A
  const requestA = {
    origin: startLocation,
    destination: pointA,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  directionsService.route(requestA, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
      // Adiciona a rota ao mapa
      const leg = result.routes[0].legs[0];
      const markerA = new google.maps.Marker({
        position: leg.end_location,
        map: map,
        title: "Ponto A",
      });
    } else {
      alert('Erro ao calcular a rota para o ponto A: ' + status);
    }
  });

  // Rota para o ponto B
  const requestB = {
    origin: startLocation,
    destination: pointB,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  directionsService.route(requestB, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
      // Adiciona a rota ao mapa
      const leg = result.routes[0].legs[0];
      const markerB = new google.maps.Marker({
        position: leg.end_location,
        map: map,
        title: "Ponto B",
      });
    } else {
      alert('Erro ao calcular a rota para o ponto B: ' + status);
    }
  });
}

// Adicionar o evento de clique ao botão de pesquisa
document.getElementById("search-btn").addEventListener("click", searchLocation);

// Adicionar evento ao pressionar a tecla Enter no campo de pesquisa
document.getElementById("search-input").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchLocation();
  }
});

// Inicializar o mapa quando a página carregar
window.onload = initMap;
