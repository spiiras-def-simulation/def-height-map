const LOAD_MAP_FORM = 'load_map_form';
const LOAD_MAP_CONFIG_FORM = 'load_map_config_form';
const ANALYSE_MAP_FORM = 'analyse_map_form';

const loadMapForm = document.getElementById(LOAD_MAP_FORM);
const loadMapConfigForm = document.getElementById(LOAD_MAP_CONFIG_FORM);
const analyseMapForm = document.getElementById(ANALYSE_MAP_FORM);

loadMapForm.onsubmit = function (event) {
  const formData = new FormData(loadMapForm);

  fetch('/mapImage', { method: 'POST', body: formData }).then((response) => {
    if (response.status === 200) alert('Изображение карты обновлено');
    if (response.status === 500) alert('Ошибка на стороне сервера');
  });

  event.preventDefault(true);
};

loadMapConfigForm.onsubmit = function (event) {
  const formData = new FormData(loadMapConfigForm);

  fetch('/mapConfig', { method: 'POST', body: formData }).then((response) => {
    if (response.status === 200) alert('Параметры карты обновлены');
    if (response.status === 403) alert('Неверно заданные параметры карты');
    if (response.status === 500) alert('Ошибка на стороне сервера');
  });

  event.preventDefault(true);
};

analyseMapForm.onsubmit = function (event) {
  fetch('/analyseHeights').then((response) => {
    if (response.status === 200) alert('Непроходимые зоны обнаружены');
    if (response.status === 403) alert('Не проанализировать карту');
    if (response.status === 500) alert('Ошибка на стороне сервера');
  });

  event.preventDefault(true);
};
