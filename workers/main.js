var web_worker = new Worker('worker.js');

web_worker.onmessage = event => {
  document.getElementById('output').textContent = event.data.trans2;
};

const array = [5,8,2,9,0,4,6];

const main = () => {
  let data = {
    message: 'Here are some unsorted arrays. Sort them.',
    trans1: new Uint8Array(array),
    trans2: new Uint8Array(array.length)
  };
  web_worker.postMessage(data, [data.trans1.buffer, data.trans2.buffer]);
};

const onLoad = () => {
  document.getElementById('array').textContent = array.toString();
  document.getElementById('output').textContent = '';
}

onLoad();