const API_KEY = 'd8539e0bf712c9b117246a8f4a4ad85a';

    function setDynamicBackground(condition) {
      const body = document.body;
      let gradient;
      condition = condition.toLowerCase();
      if (condition.includes('rain')) gradient = 'linear-gradient(135deg, #3a7bd5, #3a6073)';
      else if (condition.includes('cloud')) gradient = 'linear-gradient(135deg, #757f9a, #d7dde8)';
      else if (condition.includes('clear')) gradient = 'linear-gradient(135deg, #56ccf2, #2f80ed)';
      else if (condition.includes('storm')) gradient = 'linear-gradient(135deg, #141E30, #243B55)';
      else gradient = 'linear-gradient(135deg, #667eea, #764ba2)';
      body.style.background = gradient;
    }

    function formatTime(timestamp) {
      const date = new Date(timestamp * 1000);
      return date.getHours() + ':00';
    }

    function formatDay(timestamp) {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    function showWeather(data) {
      document.getElementById('loader').style.display = 'none';
      const weatherDiv = document.getElementById('weather');
      weatherDiv.style.display = 'block';

      const { name } = data.city;
      document.getElementById('location').innerText = name;

      const current = data.list[0];
      const condition = current.weather[0].description;
      document.getElementById('temp').innerText = Math.round(current.main.temp) + '°C';
      document.getElementById('desc').innerText = condition;
      document.getElementById('humidity').innerText = current.main.humidity + '%';
      document.getElementById('wind').innerText = current.wind.speed + ' km/h';
      document.getElementById('feels').innerText = Math.round(current.main.feels_like) + '°C';
      document.getElementById('icon').src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;

      setDynamicBackground(condition);

      const hourlyDiv = document.getElementById('hourly');
      hourlyDiv.innerHTML = '';
      for (let i = 0; i < 8; i++) {
        const hour = data.list[i];
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
          <h4>${formatTime(hour.dt)}</h4>
          <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" />
          <p>${Math.round(hour.main.temp)}°C</p>
        `;
        hourlyDiv.appendChild(card);
      }

      const dailyDiv = document.getElementById('daily');
      dailyDiv.innerHTML = '';
      const days = {};
      data.list.forEach(forecast => {
        const date = new Date(forecast.dt_txt).toDateString();
        if (!days[date]) days[date] = [];
        days[date].push(forecast.main.temp);
      });

      Object.keys(days).slice(1, 4).forEach(day => {
        const temps = days[day];
        const avg = (temps.reduce((a, b) => a + b) / temps.length).toFixed(1);
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
          <h4>${formatDay(new Date(day).getTime() / 1000)}</h4>
          <p>${avg}°C</p>
        `;
        dailyDiv.appendChild(card);
      });
    }

    function fetchWeatherByCity(city) {
      if (!city) return alert('Please enter a city name!');
      document.getElementById('loader').style.display = 'block';
      document.getElementById('weather').style.display = 'none';

      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.cod !== '200') {
            alert('City not found!');
            document.getElementById('loader').style.display = 'none';
            return;
          }
          showWeather(data);
        })
        .catch(err => {
          alert('Failed to fetch weather data.');
          console.error(err);
          document.getElementById('loader').style.display = 'none';
        });
    }

    const searchBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('cityInput');

    searchBtn.addEventListener('click', () => fetchWeatherByCity(cityInput.value));
    cityInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') fetchWeatherByCity(cityInput.value);
    });
